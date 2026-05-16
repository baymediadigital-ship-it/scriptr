-- YouTube API daily quota tracking
create table if not exists youtube_quota (
  date date primary key,
  units_used integer not null default 0,
  updated_at timestamptz default now()
);

-- No RLS needed — only service role writes to this table
-- Upsert function: insert or increment
create or replace function increment_youtube_quota(p_date date, p_units integer)
returns void language plpgsql security definer as $$
begin
  insert into youtube_quota (date, units_used, updated_at)
    values (p_date, p_units, now())
  on conflict (date) do update
    set units_used = youtube_quota.units_used + p_units,
        updated_at = now();
end;
$$;
