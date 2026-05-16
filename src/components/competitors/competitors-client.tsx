"use client";

import { useState } from "react";
import { AddChannel } from "./add-channel";
import { ChannelList } from "./channel-list";

interface TrackedChannel {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string;
  subscriber_count: number;
  last_checked_at: string | null;
}

export function CompetitorsClient({ initialChannels }: { initialChannels: TrackedChannel[] }) {
  const [channels, setChannels] = useState(initialChannels);

  function handleAdd(channel: TrackedChannel) {
    setChannels((prev) => {
      if (prev.some((c) => c.channel_id === channel.channel_id)) return prev;
      return [channel, ...prev];
    });
  }

  function handleRemove(channelId: string) {
    setChannels((prev) => prev.filter((c) => c.channel_id !== channelId));
  }

  return (
    <>
      <AddChannel onAdd={handleAdd} />
      <ChannelList channels={channels} onRemove={handleRemove} />
    </>
  );
}
