"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Clock, Loader2, Users } from "lucide-react";

interface Member { id: string; email: string; joined: string; }
interface PendingInvite { id: string; email: string; created_at: string; expires_at: string; }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

export function TeamMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/team/invite");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
      setPending(data.pendingInvites ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function invite() {
    if (!email.trim()) return;
    setInviting(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setEmail("");
      setSuccess(`Invite sent to ${email.trim()}`);
      load();
    }
    setInviting(false);
  }

  async function removeMember(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/team/members/${id}`, { method: "DELETE" });
    load();
  }

  const totalSeats = 1 + members.length; // owner + members
  const paidSeats = Math.max(0, members.length); // owner is free
  const seatPriceConfigured = !!process.env.NEXT_PUBLIC_SEAT_PRICE_CONFIGURED;

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Team</p>
          <p className="text-sm text-white/60">
            {totalSeats} seat{totalSeats !== 1 ? "s" : ""} · 1 free
            {paidSeats > 0 && <span className="text-white/40"> · {paidSeats} × $4.99/mo</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/50" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Users className="h-3.5 w-3.5" />
          {totalSeats} / 10
        </div>
      </div>

      {/* Invite input */}
      <div className="flex gap-2">
        <Input
          placeholder="teammate@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invite()}
          className="flex-1"
        />
        <button
          onClick={invite}
          disabled={inviting || !email.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 16px rgba(124,58,237,0.25)" }}
        >
          {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {inviting ? "Sending…" : "Invite"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
      {success && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">{success}</p>}

      {loading && (
        <div className="flex items-center gap-2 text-white/30 text-sm py-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading team…
        </div>
      )}

      {/* Active members */}
      {members.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Members</p>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "rgba(124,58,237,0.25)" }}>
                  {m.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white/80">{m.email}</p>
                  <p className="text-xs text-white/30">Joined {timeAgo(m.joined)}</p>
                </div>
              </div>
              <button
                onClick={() => removeMember(m.id)}
                className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pending invites */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Pending invites</p>
          {pending.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Clock className="h-4 w-4 text-white/25 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/60 truncate">{inv.email}</p>
                <p className="text-xs text-white/25">Sent {timeAgo(inv.created_at)} · expires {new Date(inv.expires_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && members.length === 0 && pending.length === 0 && (
        <p className="text-sm text-white/25 text-center py-2">No team members yet. Invite someone above.</p>
      )}
    </div>
  );
}
