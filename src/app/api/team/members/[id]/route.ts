import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("team_members")
    .select("id, stripe_item_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  // Cancel the Stripe seat subscription item
  if (member.stripe_item_id) {
    try {
      await stripe.subscriptionItems.del(member.stripe_item_id, {
        proration_behavior: "create_prorations",
      });
    } catch {}
  }

  await supabase.from("team_members").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
