-- affiliates table
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  code text unique not null,
  name text,
  email text,
  active boolean default true,
  created_at timestamptz default now()
);

-- affiliate_conversions table
create table if not exists affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id) on delete cascade,
  referred_user_id uuid references auth.users on delete set null,
  stripe_invoice_id text unique,
  amount_cents integer not null,
  commission_cents integer not null,
  paid_out boolean default false,
  created_at timestamptz default now()
);

-- clicks tracking
create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id) on delete cascade,
  created_at timestamptz default now()
);

-- RLS
alter table affiliates enable row level security;
alter table affiliate_conversions enable row level security;
alter table affiliate_clicks enable row level security;

create policy "Affiliates can view own record" on affiliates for select using (auth.uid() = user_id);
create policy "Affiliates can view own conversions" on affiliate_conversions for select using (
  affiliate_id in (select id from affiliates where user_id = auth.uid())
);
create policy "Affiliates can view own clicks" on affiliate_clicks for select using (
  affiliate_id in (select id from affiliates where user_id = auth.uid())
);

-- Add ref_code column to subscriptions for tracking which affiliate referred the user
alter table subscriptions add column if not exists affiliate_code text;
