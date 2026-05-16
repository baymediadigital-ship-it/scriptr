import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { getSubscription } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });

  const supabase = await createClient();

  // Validate invite
  const { data: invite } = await supabase
    .from("team_invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invite is invalid or has expired." }, { status: 400 });
  }

  if (invite.owner_id === user.id) {
    return NextResponse.json({ error: "You cannot join your own team." }, { status: 400 });
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("owner_id", invite.owner_id)
    .eq("member_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You are already on this team." }, { status: 400 });
  }

  // Add Stripe seat subscription item if price is configured
  let stripeItemId: string | null = null;
  const seatPriceId = process.env.STRIPE_SEAT_PRICE_ID;

  if (seatPriceId) {
    try {
      const ownerSub = await getSubscription(invite.owner_id);
      if (ownerSub.stripeSubscriptionId) {
        const item = await stripe.subscriptionItems.create({
          subscription: ownerSub.stripeSubscriptionId,
          price: seatPriceId,
          quantity: 1,
          proration_behavior: "create_prorations",
        });
        stripeItemId = item.id;
      }
    } catch {}
  }

  // Create member record
  await supabase.from("team_members").insert({
    owner_id: invite.owner_id,
    member_id: user.id,
    invite_id: invite.id,
    stripe_item_id: stripeItemId,
  });

  // Mark invite accepted
  await supabase
    .from("team_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true });
}
