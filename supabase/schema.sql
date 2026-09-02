-- Evoluo Blog CMS
-- Run in Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.blog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null,
  slug text not null unique,
  content text not null,
  cover_image_path text,
  cover_image_url text,
  cover_image_alt text,
  status text not null default 'published',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_title_length check (char_length(title) between 8 and 92),
  constraint blog_posts_content_length check (char_length(content) between 80 and 48000),
  constraint blog_posts_cover_path_format check (
    cover_image_path is null
    or cover_image_path ~ '^[0-9a-f-]{36}/[a-z0-9-]{16,80}\.webp$'
  ),
  constraint blog_posts_cover_url_format check (
    cover_image_url is null
    or (
      char_length(cover_image_url) <= 500
      and cover_image_url ~ '^https://.+/storage/v1/object/public/blog-covers/.+\.webp$'
    )
  ),
  constraint blog_posts_cover_alt_length check (
    cover_image_alt is null
    or char_length(cover_image_alt) <= 140
  ),
  constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint blog_posts_status_allowed check (status in ('published'))
);

alter table public.blog_posts
  add column if not exists cover_image_path text,
  add column if not exists cover_image_url text,
  add column if not exists cover_image_alt text;

alter table public.blog_posts
  drop constraint if exists blog_posts_content_length;

alter table public.blog_posts
  add constraint blog_posts_content_length check (char_length(content) between 80 and 48000);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_cover_path_format'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_cover_path_format check (
        cover_image_path is null
        or cover_image_path ~ '^[0-9a-f-]{36}/[a-z0-9-]{16,80}\.webp$'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_cover_url_format'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_cover_url_format check (
        cover_image_url is null
        or (
          char_length(cover_image_url) <= 500
          and cover_image_url ~ '^https://.+/storage/v1/object/public/blog-covers/.+\.webp$'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_cover_alt_length'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_cover_alt_length check (
        cover_image_alt is null
        or char_length(cover_image_alt) <= 140
      );
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-covers',
  'blog-covers',
  true,
  3145728,
  array['image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-inline-images',
  'blog-inline-images',
  true,
  3145728,
  array['image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.blog_audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  post_id uuid,
  created_at timestamptz not null default now(),
  constraint blog_audit_action_allowed check (action in ('insert', 'update', 'delete'))
);

create table if not exists public.supabase_heartbeat_events (
  id bigint generated always as identity primary key,
  source text not null default 'vercel-cron',
  created_at timestamptz not null default now(),
  constraint supabase_heartbeat_source_length check (char_length(source) between 1 and 80)
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published_at desc)
  where status = 'published';

create index if not exists supabase_heartbeat_events_created_at_idx
  on public.supabase_heartbeat_events (created_at desc);

create or replace function public.is_blog_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.blog_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_blog_admin() from public;
grant execute on function public.is_blog_admin() to authenticated;

create or replace function public.touch_blog_posts_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();

  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;

  return new;
end;
$$;

create or replace function public.audit_blog_posts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.blog_audit_events (actor_id, action, post_id)
    values (auth.uid(), 'insert', new.id);
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.blog_audit_events (actor_id, action, post_id)
    values (auth.uid(), 'update', new.id);
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.blog_audit_events (actor_id, action, post_id)
    values (auth.uid(), 'delete', old.id);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
before insert or update on public.blog_posts
for each row
execute function public.touch_blog_posts_updated_at();

drop trigger if exists blog_posts_audit on public.blog_posts;
create trigger blog_posts_audit
after insert or update or delete on public.blog_posts
for each row
execute function public.audit_blog_posts();

alter table public.blog_admins enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_audit_events enable row level security;
alter table public.supabase_heartbeat_events enable row level security;

drop policy if exists "blog_admins_no_client_reads" on public.blog_admins;
create policy "blog_admins_no_client_reads"
on public.blog_admins
for select
to authenticated
using (false);

drop policy if exists "blog_audit_no_client_access" on public.blog_audit_events;
create policy "blog_audit_no_client_access"
on public.blog_audit_events
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "supabase_heartbeat_no_client_access" on public.supabase_heartbeat_events;
create policy "supabase_heartbeat_no_client_access"
on public.supabase_heartbeat_events
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "public_can_read_published_blog_posts" on public.blog_posts;
create policy "public_can_read_published_blog_posts"
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admins_can_insert_blog_posts" on public.blog_posts;
create policy "admins_can_insert_blog_posts"
on public.blog_posts
for insert
to authenticated
with check (
  public.is_blog_admin()
  and author_id = auth.uid()
  and status = 'published'
);

drop policy if exists "admins_can_update_blog_posts" on public.blog_posts;
create policy "admins_can_update_blog_posts"
on public.blog_posts
for update
to authenticated
using (public.is_blog_admin())
with check (
  public.is_blog_admin()
  and author_id = auth.uid()
  and status = 'published'
);

drop policy if exists "admins_can_delete_blog_posts" on public.blog_posts;
create policy "admins_can_delete_blog_posts"
on public.blog_posts
for delete
to authenticated
using (public.is_blog_admin());

drop policy if exists "public_can_read_blog_covers" on storage.objects;
create policy "public_can_read_blog_covers"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-covers');

drop policy if exists "admins_can_insert_blog_covers" on storage.objects;
create policy "admins_can_insert_blog_covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-covers'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "admins_can_update_blog_covers" on storage.objects;
create policy "admins_can_update_blog_covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-covers'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'blog-covers'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "admins_can_delete_blog_covers" on storage.objects;
create policy "admins_can_delete_blog_covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-covers'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "public_can_read_blog_inline_images" on storage.objects;
create policy "public_can_read_blog_inline_images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-inline-images');

drop policy if exists "admins_can_insert_blog_inline_images" on storage.objects;
create policy "admins_can_insert_blog_inline_images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-inline-images'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "admins_can_update_blog_inline_images" on storage.objects;
create policy "admins_can_update_blog_inline_images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-inline-images'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'blog-inline-images'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "admins_can_delete_blog_inline_images" on storage.objects;
create policy "admins_can_delete_blog_inline_images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-inline-images'
  and public.is_blog_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- After creating the admin user in Supabase Auth, grant access:
-- insert into public.blog_admins (user_id)
-- values ('PASTE_AUTH_USER_ID_HERE');
