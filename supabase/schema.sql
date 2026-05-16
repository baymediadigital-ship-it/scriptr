-- Tracked competitor channels per user
create table if not exists tracked_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  channel_id text not null,
  channel_title text not null,
  channel_thumbnail text,
  subscriber_count bigint default 0,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, channel_id)
);

-- Row Level Security
alter table tracked_channels enable row level security;

do $$ begin
  create policy "Users can manage their own tracked channels"
    on tracked_channels for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- Cached videos for tracked channels
create table if not exists channel_videos (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  video_id text not null,
  title text not null,
  thumbnail text,
  view_count bigint default 0,
  like_count bigint default 0,
  comment_count bigint default 0,
  published_at timestamptz,
  duration text,
  outlier_score float default 1.0,
  is_outlier boolean default false,
  channel_median_views bigint default 0,
  fetched_at timestamptz default now(),
  unique(channel_id, video_id)
);

alter table channel_videos enable row level security;

do $$ begin
  create policy "Authenticated users can read channel videos"
    on channel_videos for select
    using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can insert channel videos"
    on channel_videos for insert
    with check (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can update channel videos"
    on channel_videos for update
    using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
