import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { getSubscription, isPro } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe/client";
import { sendTeamInvite } from "@/lib/email/client";

const MAX_SEATS = 10;

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await getSubscription(user.id);
  if (!isPro(subscription)) {
    return NextResponse.json({ error: "Team seats require a Pro subscription." }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  const supabase = await createClient();
  const service = createServiceClient();

  // Seat limit check
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if ((memberCount ?? 0) >= MAX_SEATS) {
    return NextResponse.json({ error: `Maximum of ${MAX_SEATS} seats reached.` }, { status: 400 });
  }

  // Check if already invited or already a member
  const { data: existingInvite } = await supabase
    .from("team_invites")
    .select("id, accepted_at")
    .eq("owner_id", user.id)
    .eq("email", email.toLowerCase())
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existingInvite) {
    return NextResponse.json({ error: "An active invite already exists for this email." }, { status: 400 });
  }

  // Create invite token
  const { data: invite, error: inviteErr } = await supabase
    .from("team_invites")
    .insert({ owner_id: user.id, email: email.toLowerCase() })
    .select("token")
    .single();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: "Failed to create invite." }, { status: 500 });
  }

  // Send email
  try {
    const ownerName = user.email?.split("@")[0] ?? "Your teammate";
    await sendTeamInvite({ toEmail: email, ownerName, token: invite.token });
  } catch (e: any) {
    // Roll back invite if email fails
    await supabase.from("team_invites").delete().eq("token", invite.token);
    return NextResponse.json({ error: `Email failed: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from("team_members")
      .select("id, member_id, created_at")
      .eq("owner_id", user.id)
      .order("created_at"),
    supabase
      .from("team_invites")
      .select("id, email, created_at, expires_at, accepted_at")
      .eq("owner_id", user.id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  // Resolve member emails via service client
  const memberDetails = await Promise.all(
    (members ?? []).map(async (m) => {
      const { data: userData } = await createServiceClient()
        .auth.admin.getUserById(m.member_id);
      return { id: m.id, email: userData?.user?.email ?? "Unknown", joined: m.created_at };
    })
  );

  return NextResponse.json({ members: memberDetails, pendingInvites: invites ?? [] });
}
