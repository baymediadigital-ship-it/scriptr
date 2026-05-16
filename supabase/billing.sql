-- Stripe subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free', -- 'free' | 'pro'
  status text not null default 'active', -- 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

do $$ begin
  create policy "Users can read their own subscription"
    on subscriptions for select
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Service role can manage all subscriptions"
    on subscriptions for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
exception when duplicate_object then null;
end $$;

-- Usage tracking per billing period
create table if not exists usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  period text not null, -- e.g. '2025-05'
  outlier_searches int default 0,
  scripts_generated int default 0,
  unique(user_id, period)
);

alter table usage enable row level security;

do $$ begin
  create policy "Users can read their own usage"
    on usage for select
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can upsert their own usage"
    on usage for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
