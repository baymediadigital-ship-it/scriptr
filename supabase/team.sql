-- Team invites
create table if not exists team_invites (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  email       text not null,
  token       text unique not null default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  created_at  timestamptz default now() not null,
  expires_at  timestamptz default (now() + interval '7 days') not null
);

-- Team members (accepted invites)
create table if not exists team_members (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users(id) on delete cascade not null,
  member_id      uuid references auth.users(id) on delete cascade not null,
  invite_id      uuid references team_invites(id),
  stripe_item_id text,
  created_at     timestamptz default now() not null,
  unique(owner_id, member_id)
);

alter table team_invites enable row level security;
alter table team_members enable row level security;

create policy "owners manage invites"  on team_invites for all  using (auth.uid() = owner_id);
create policy "owners manage members"  on team_members for all  using (auth.uid() = owner_id);
create policy "members see own"        on team_members for select using (auth.uid() = member_id);
