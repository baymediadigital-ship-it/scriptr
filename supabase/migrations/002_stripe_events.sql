-- Stripe webhook idempotency table
create table if not exists stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  type text not null,
  created_at timestamptz default now()
);

-- Auto-delete events older than 30 days to keep table small
create index if not exists stripe_events_created_at_idx on stripe_events (created_at);

-- RLS: only service role can access
alter table stripe_events enable row level security;
