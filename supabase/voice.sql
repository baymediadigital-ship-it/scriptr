-- Voice profile per user
create table if not exists voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  channel_name text,
  niche text,
  style_description text,
  example_script text,
  avoid_phrases text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table voice_profiles enable row level security;

do $$ begin
  create policy "Users can manage their own voice profile"
    on voice_profiles for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
