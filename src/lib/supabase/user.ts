import { cache } from "react";
import { createClient } from "./server";

// Deduplicated per request — if layout and page both call this,
// Supabase is only hit once per render pass.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

// Cached per request — avoids a second DB round trip when layout checks onboarding
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", userId)
    .single();
  return data;
});
