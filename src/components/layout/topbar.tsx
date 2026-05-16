"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

interface TopbarProps {
  user: User;
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "U";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header
      className="h-16 flex items-center justify-end px-6 z-20 relative"
      style={{
        background: "rgba(10, 10, 20, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full focus:outline-none group">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">{user.email}</p>
          </div>
          <Avatar className="h-8 w-8 ring-1 ring-white/10 group-hover:ring-violet-500/50 transition-all">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48"
          style={{
            background: "rgba(15, 15, 28, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="px-2 py-1.5 text-xs text-white/40 truncate">{user.email}</div>
          <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
          <DropdownMenuItem
            className="text-white/70 hover:text-white cursor-pointer"
            onClick={() => window.location.href = "/settings"}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
          <DropdownMenuItem
            className="text-red-400 hover:text-red-300 cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
