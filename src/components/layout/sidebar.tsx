"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  BookOpen,
  ImageIcon,
  Settings,
  Lightbulb,
  MessageCircle,
  CalendarDays,
  MessageSquareText,
  Zap,
  Handshake,
  Shuffle,
  DollarSign,
  Flame,
  Bot,
  Megaphone,
} from "lucide-react";
import { ScriptrLogo } from "@/components/ui/logo";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/ideas", icon: Lightbulb, label: "Ideas" },
  { href: "/outliers", icon: TrendingUp, label: "Outliers" },
  { href: "/comments", icon: MessageSquareText, label: "Comment Mining" },
  { href: "/scripts", icon: FileText, label: "Scripts" },
  { href: "/thumbnails", icon: ImageIcon, label: "Thumbnails" },
  { href: "/format-transfer", icon: Shuffle, label: "Format Transfer" },
  { href: "/trending-formats", icon: Flame, label: "Trending Formats" },
  { href: "/competitors", icon: Users, label: "Competitors" },
  { href: "/research", icon: BookOpen, label: "Research" },
  { href: "/affiliate", icon: Handshake, label: "Affiliate" },
];

export function Sidebar({ isPro = false }: { isPro?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-60 h-screen sticky top-0 z-30"
      style={{
        background: "rgba(8, 8, 15, 0.9)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <ScriptrLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-3 mb-2 mt-1">
          Workspace
        </p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active ? "text-white" : "text-white/45 hover:text-white/80"
              )}
              style={active ? {
                background: "rgba(124, 58, 237, 0.15)",
                border: "1px solid rgba(124, 58, 237, 0.25)",
                boxShadow: "0 0 16px rgba(124, 58, 237, 0.1)",
              } : {
                background: "transparent",
                border: "1px solid transparent",
              }}
            >
              <Icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                active ? "text-violet-400" : "text-white/35 group-hover:text-white/60"
              )} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </Link>
          );
        })}

        {/* Coming soon */}
        <div className="pt-2 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-3 mb-2">
            Coming soon
          </p>
          {[
            { href: "/automations", icon: Bot, label: "Automations" },
            { href: "/channel-manager", icon: Megaphone, label: "Channel Manager" },
            { href: "/rpm-predictor", icon: DollarSign, label: "RPM Predictor" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/25 hover:text-white/40 transition-colors cursor-pointer select-none"
              style={{ background: "transparent", border: "1px solid transparent" }}
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-white/20" />
              {label}
              <span
                className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                Soon
              </span>
            </Link>
          ))}
        </div>

        {/* Community section */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-3 mb-2">
            Community
          </p>
          <a
            href="https://discord.gg/scriptr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/75 transition-all duration-150 group cursor-pointer"
            style={{ background: "transparent", border: "1px solid transparent" }}
          >
            <MessageCircle className="h-4 w-4 flex-shrink-0 text-white/30 group-hover:text-indigo-400 transition-colors" />
            Discord Community
          </a>
          <a
            href="https://calendly.com/scriptr/strategy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/75 transition-all duration-150 group cursor-pointer"
            style={{ background: "transparent", border: "1px solid transparent" }}
          >
            <CalendarDays className="h-4 w-4 flex-shrink-0 text-white/30 group-hover:text-emerald-400 transition-colors" />
            Strategy Call
          </a>
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {!isPro && (
          <Link
            href="/upgrade"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group w-full"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(99,60,180,0.1))",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#c4b5fd",
            }}
          >
            <Zap className="h-4 w-4 flex-shrink-0 text-violet-400" />
            Upgrade to Pro
          </Link>
        )}
        <Link
          href="/faq"
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-medium text-white/30 hover:text-white/60 transition-all duration-150 cursor-pointer"
          )}
          style={{ background: "transparent", border: "1px solid transparent" }}
        >
          FAQ
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer",
            pathname === "/settings" ? "text-white" : "text-white/45 hover:text-white/80"
          )}
          style={pathname === "/settings" ? {
            background: "rgba(124, 58, 237, 0.15)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            boxShadow: "0 0 16px rgba(124, 58, 237, 0.1)",
          } : {
            background: "transparent",
            border: "1px solid transparent",
          }}
        >
          <Settings className={cn("h-4 w-4 flex-shrink-0 transition-colors", pathname === "/settings" ? "text-violet-400" : "text-white/35 group-hover:text-white/60")} />
          Settings
          {pathname === "/settings" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
        </Link>
      </div>
    </aside>
  );
}
