-- User profiles for onboarding state tracking
create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

do $$ begin
  create policy "Users can manage their own profile"
    on profiles for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
