import { createClient } from "@/lib/supabase/server";

export function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUsage(userId: string) {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  const { data } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .eq("period", period)
    .single();

  return {
    outlierSearches: data?.outlier_searches ?? 0,
    scriptsGenerated: data?.scripts_generated ?? 0,
  };
}

export async function incrementUsage(
  userId: string,
  field: "outlier_searches" | "scripts_generated"
) {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  await supabase.rpc("increment_usage", {
    p_user_id: userId,
    p_period: period,
    p_field: field,
  });
}
