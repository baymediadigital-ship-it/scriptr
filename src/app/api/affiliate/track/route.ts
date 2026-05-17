import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL(next, req.url));
  }

  const supabase = createServiceClient();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (affiliate) {
    // Log the click
    await supabase.from("affiliate_clicks").insert({ affiliate_id: affiliate.id });
  }

  // Redirect and set cookie regardless (cookie is harmless if code is invalid)
  const redirectUrl = new URL(next, req.url);
  const response = NextResponse.redirect(redirectUrl);

  if (affiliate) {
    response.cookies.set("ref_code", code, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
