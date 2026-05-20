import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";
import { CompetitorsClient } from "@/components/competitors/competitors-client";

export default async function CompetitorsPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: channels } = await supabase
    .from("tracked_channels")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitors</h1>
        <p className="text-white/40 mt-1 text-sm">
          Track channels in your niche. Scriptr checks them every 6 hours for new outliers.
        </p>
      </div>

      <CompetitorsClient initialChannels={channels ?? []} />
    </div>
  );
}
