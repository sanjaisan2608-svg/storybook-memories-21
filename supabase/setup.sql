create table if not exists public.birthday_story_owners (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.birthday_story_owners enable row level security;
revoke all on public.birthday_story_owners from anon, authenticated;
grant select on public.birthday_story_owners to authenticated;

create or replace function public.is_birthday_story_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.birthday_story_owners
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_birthday_story_owner() from public;
grant execute on function public.is_birthday_story_owner() to anon, authenticated;

create table if not exists public.birthday_stories (
  id text primary key check (id = 'main'),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.birthday_stories enable row level security;
grant select on public.birthday_stories to anon, authenticated;
grant insert, update on public.birthday_stories to authenticated;

drop policy if exists "Anyone can view the birthday story" on public.birthday_stories;
create policy "Anyone can view the birthday story"
  on public.birthday_stories for select
  using (true);

drop policy if exists "Story owner can create the birthday story" on public.birthday_stories;
create policy "Story owner can create the birthday story"
  on public.birthday_stories for insert to authenticated
  with check (public.is_birthday_story_owner());

drop policy if exists "Story owner can update the birthday story" on public.birthday_stories;
create policy "Story owner can update the birthday story"
  on public.birthday_stories for update to authenticated
  using (public.is_birthday_story_owner())
  with check (public.is_birthday_story_owner());

insert into storage.buckets (id, name, public, file_size_limit)
values ('birthday-assets', 'birthday-assets', true, 104857600)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "Anyone can view birthday story media" on storage.objects;
create policy "Anyone can view birthday story media"
  on storage.objects for select
  using (bucket_id = 'birthday-assets');

drop policy if exists "Story owner can upload birthday media" on storage.objects;
create policy "Story owner can upload birthday media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'birthday-assets' and public.is_birthday_story_owner());

drop policy if exists "Story owner can update birthday media" on storage.objects;
create policy "Story owner can update birthday media"
  on storage.objects for update to authenticated
  using (bucket_id = 'birthday-assets' and public.is_birthday_story_owner())
  with check (bucket_id = 'birthday-assets' and public.is_birthday_story_owner());

drop policy if exists "Story owner can delete birthday media" on storage.objects;
create policy "Story owner can delete birthday media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'birthday-assets' and public.is_birthday_story_owner());
