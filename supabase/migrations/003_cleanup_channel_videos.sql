-- Cleanup function: keep only the 50 most recent videos per channel
create or replace function cleanup_old_channel_videos()
returns void language plpgsql security definer as $$
begin
  delete from channel_videos
  where id in (
    select id from (
      select id,
             row_number() over (partition by channel_id order by published_at desc nulls last) as rn
      from channel_videos
    ) ranked
    where rn > 50
  );
end;
$$;
