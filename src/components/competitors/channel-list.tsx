"use client";

import { ChannelCard } from "./channel-card";
import { Users } from "lucide-react";

interface TrackedChannel {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string;
  subscriber_count: number;
  last_checked_at: string | null;
}

export function ChannelList({
  channels,
  onRemove,
}: {
  channels: TrackedChannel[];
  onRemove: (channelId: string) => void;
}) {
  async function removeChannel(channelId: string) {
    await fetch(`/api/competitors?channelId=${channelId}`, { method: "DELETE" });
    onRemove(channelId);
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No channels tracked yet</p>
        <p className="text-sm mt-1">Add a channel above to start monitoring it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {channels.map((ch) => (
        <ChannelCard key={ch.id} channel={ch} onRemove={removeChannel} />
      ))}
    </div>
  );
}
