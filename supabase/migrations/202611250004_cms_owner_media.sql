create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'my-dday-media',
  object_path text not null,
  title text not null,
  description text not null default '',
  alt_text text not null default '',
  category text,
  tags text[] not null default '{}'::text[],
  mime_type text not null,
  file_name text not null,
  byte_size bigint not null check (byte_size >= 0),
  width integer,
  height integer,
  duration_seconds integer,
  media_type text not null check (media_type in ('image', 'video')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, object_path)
);

create table if not exists public.site_pages (
  id text primary key,
  title text not null,
  draft_content jsonb not null default '{}'::jsonb,
  published_content jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  theme text not null,
  description text not null default '',
  cover_media_id uuid references public.media_assets(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_media (
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  display_order integer not null default 0,
  primary key (gallery_id, media_id)
);

create table if not exists public.cms_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.site_pages (id, title, draft_content, status)
values
  ('accueil','Accueil','{"sections":[]}'::jsonb,'draft'),
  ('presentation','Présentation de l’entreprise','{"sections":[]}'::jsonb,'draft'),
  ('mariages-evenements','Mariages et événements','{"sections":[]}'::jsonb,'draft'),
  ('inspirations','Inspirations','{"sections":[]}'::jsonb,'draft'),
  ('galeries','Galeries','{"sections":[]}'::jsonb,'draft'),
  ('infos','Informations et coordonnées','{"sections":[]}'::jsonb,'draft')
on conflict (id) do nothing;

alter table public.products
  add column if not exists publication_status text not null default 'published'
    check (publication_status in ('draft', 'published', 'archived')),
  add column if not exists archived_at timestamptz;

alter table public.media_assets enable row level security;
alter table public.site_pages enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_media enable row level security;
alter table public.cms_audit_log enable row level security;

revoke all on public.media_assets, public.site_pages, public.galleries, public.gallery_media, public.cms_audit_log from anon, authenticated;
grant select on public.media_assets to anon, authenticated;
grant select on public.site_pages to anon, authenticated;
grant select on public.galleries to anon, authenticated;
grant select on public.gallery_media to anon, authenticated;

create policy "owners manage media"
  on public.media_assets for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "public read published media"
  on public.media_assets for select to anon, authenticated
  using (status = 'published');

create policy "owners manage pages"
  on public.site_pages for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "public read published pages"
  on public.site_pages for select to anon, authenticated
  using (status = 'published');

create policy "owners manage galleries"
  on public.galleries for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "public read published galleries"
  on public.galleries for select to anon, authenticated
  using (status = 'published');

create policy "owners manage gallery media"
  on public.gallery_media for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "public read published gallery media"
  on public.gallery_media for select to anon, authenticated
  using (exists (
    select 1 from public.galleries g
    where g.id = gallery_media.gallery_id and g.status = 'published'
  ));

create policy "owners read audit log"
  on public.cms_audit_log for select to authenticated
  using ((select public.is_owner()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'my-dday-media',
  'my-dday-media',
  false,
  104857600,
  array[
    'image/jpeg','image/png','image/webp','image/avif','image/gif',
    'video/mp4','video/webm','video/quicktime'
  ]
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "owners manage my-dday media objects"
  on storage.objects for all to authenticated
  using (bucket_id = 'my-dday-media' and (select public.is_owner()))
  with check (bucket_id = 'my-dday-media' and (select public.is_owner()));
