import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase/user";
import { getSubscription, isPro } from "@/lib/billing/subscription";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const [profile, subscription] = await Promise.all([
    getProfile(user.id),
    getSubscription(user.id),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isPro={isPro(subscription)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
}
