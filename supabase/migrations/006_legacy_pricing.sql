-- Add price tracking + legacy flag to subscriptions
alter table subscriptions
  add column if not exists stripe_price_id text,
  add column if not exists is_legacy boolean not null default false;

-- Mark any existing active subscribers as legacy (they signed up at $29)
update subscriptions
set is_legacy = true
where plan = 'pro' and status in ('active', 'trialing');

comment on column subscriptions.stripe_price_id is 'The Stripe price ID the user is subscribed to';
comment on column subscriptions.is_legacy is 'True = signed up before price increase, locked in at original rate forever';
