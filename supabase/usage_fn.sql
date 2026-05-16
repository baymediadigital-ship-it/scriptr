-- Atomic increment for usage tracking
create or replace function increment_usage(
  p_user_id uuid,
  p_period text,
  p_field text
) returns void language plpgsql security definer as $$
begin
  insert into usage (user_id, period, outlier_searches, scripts_generated)
  values (p_user_id, p_period, 0, 0)
  on conflict (user_id, period) do nothing;

  if p_field = 'outlier_searches' then
    update usage
    set outlier_searches = outlier_searches + 1
    where user_id = p_user_id and period = p_period;
  elsif p_field = 'scripts_generated' then
    update usage
    set scripts_generated = scripts_generated + 1
    where user_id = p_user_id and period = p_period;
  end if;
end;
$$;
