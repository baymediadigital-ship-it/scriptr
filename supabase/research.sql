-- Research sources: URLs, YouTube videos, PDFs ingested by users
create table if not exists research_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null check (type in ('url', 'youtube', 'pdf', 'text')),
  title text not null,
  source_url text,
  content text not null,       -- extracted plain text
  char_count int generated always as (char_length(content)) stored,
  created_at timestamptz default now()
);

alter table research_sources enable row level security;

do $$ begin
  create policy "Users manage their own research sources"
    on research_sources for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
