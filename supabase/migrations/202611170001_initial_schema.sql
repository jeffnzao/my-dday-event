create extension if not exists pgcrypto;

create table if not exists public.owner_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null default '',
  price numeric(10, 2),
  price_unit text not null default 'Unité, type et durée à confirmer',
  pricing_status text not null default 'to_confirm'
    check (pricing_status in ('to_confirm', 'confirmed', 'unpriced')),
  display_price text,
  pricing_notes text not null default '',
  dimensions jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  pack_contents jsonb not null default '[]'::jsonb,
  pack_limit integer check (pack_limit is null or pack_limit > 0),
  max_quantity integer check (max_quantity is null or max_quantity > 0),
  image jsonb not null default '{"src":"/images/products/placeholder.svg","alt":"Image temporaire","isPlaceholder":true}'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  availability text not null default 'to_confirm',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_settings (
  singleton boolean primary key default true check (singleton),
  display_prices_publicly boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  singleton boolean primary key default true check (singleton),
  home_content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.catalog_settings (singleton, display_prices_publicly)
values (true, false)
on conflict (singleton) do nothing;

insert into public.site_content (singleton, home_content)
values (
  true,
  '{
    "eyebrow":"Location de décoration de mariage",
    "title":"Des étoiles dans les yeux.",
    "titleAccent":"Et vous deux au milieu.",
    "intro":"Les premiers invités arrivent, les regards s’illuminent, et vous découvrez enfin le décor que vous aviez imaginé.",
    "description":"Arches fleuries, jolies tables, voilages et coins photo : MY DDAY EVENT vous propose les pièces à louer pour donner vie à une fête qui vous ressemble.",
    "introductionTitle":"Vous avez les envies.",
    "introductionAccent":"Voici de quoi leur donner vie.",
    "introduction":[
      "Une réception tout en blanc, une ambiance romantique à la lumière des bougies ou quelques détails délicats… Commencez par ce qui vous fait sourire.",
      "Explorez la collection à votre rythme et imaginez chaque espace, de l’arrivée de vos invités aux dernières photos de la soirée.",
      "Le plaisir d’un beau décor, sans tout acheter ni le stocker après la fête."
    ]
  }'::jsonb
)
on conflict (singleton) do nothing;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  event_date date not null,
  venue text not null,
  city text not null,
  guest_count integer not null check (guest_count > 0 and guest_count <= 10000),
  event_type text not null,
  installation_requested boolean not null default false,
  comments text not null default '',
  privacy_consent_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'quote_sent', 'confirmed', 'declined', 'cancelled')),
  internal_notes text not null default ''
);

create index if not exists requests_created_at_idx on public.requests (created_at desc);
create index if not exists requests_status_idx on public.requests (status);
create index if not exists requests_email_idx on public.requests (lower(email));

create table if not exists public.request_items (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.requests(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  category text not null,
  variant_id text,
  variant_name text,
  quantity integer not null check (quantity > 0 and quantity <= 1000),
  unit_price numeric(10, 2),
  price_unit text,
  display_price text,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_rate_limits (
  kind text not null check (kind in ('email', 'ip')),
  value_hash text not null,
  period_start date not null,
  attempts integer not null default 0,
  primary key (kind, value_hash, period_start)
);

alter table public.owner_users enable row level security;
alter table public.products enable row level security;
alter table public.catalog_settings enable row level security;
alter table public.site_content enable row level security;
alter table public.requests enable row level security;
alter table public.request_items enable row level security;
alter table public.quote_rate_limits enable row level security;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.owner_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

create policy "owners can read their own owner record"
  on public.owner_users for select to authenticated
  using (user_id = (select auth.uid()));

create policy "public can read active catalog products"
  on public.products for select to anon, authenticated
  using (is_active = true or (select public.is_owner()));

create policy "owners can manage products"
  on public.products for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "owners can manage catalog settings"
  on public.catalog_settings for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "owners can manage site content"
  on public.site_content for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "owners can read and manage requests"
  on public.requests for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "owners can read and manage request items"
  on public.request_items for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

revoke all on public.products from anon, authenticated;
revoke all on public.owner_users, public.requests, public.request_items, public.catalog_settings, public.site_content, public.quote_rate_limits from anon, authenticated;
revoke all on sequence public.request_items_id_seq from anon, authenticated;
grant select on public.owner_users to authenticated;
grant select (
  id, slug, name, category, description, dimensions, colors, pack_contents,
  pack_limit, max_quantity, image, gallery, availability, is_featured, is_active, display_order
) on public.products to anon, authenticated;

create or replace function public.submit_quote(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id uuid;
  item jsonb;
  item_product public.products%rowtype;
  item_quantity integer;
begin
  if jsonb_typeof(payload) <> 'object' or jsonb_typeof(payload->'items') <> 'array'
     or jsonb_array_length(payload->'items') < 1 or jsonb_array_length(payload->'items') > 100 then
    raise exception 'Invalid quote payload';
  end if;

  if length(coalesce(payload->>'first_name', '')) not between 1 and 100
     or length(coalesce(payload->>'last_name', '')) not between 1 and 100
     or length(coalesce(payload->>'email', '')) not between 3 and 254
     or length(coalesce(payload->>'phone', '')) not between 5 and 40
     or length(coalesce(payload->>'venue', '')) not between 1 and 200
     or length(coalesce(payload->>'city', '')) not between 1 and 120
     or length(coalesce(payload->>'event_type', '')) not between 1 and 80 then
    raise exception 'Invalid quote fields';
  end if;
  if coalesce((payload->>'privacy_consent')::boolean, false) is not true then
    raise exception 'Privacy consent is required';
  end if;

  insert into public.requests (
    first_name, last_name, email, phone, event_date, venue, city,
    guest_count, event_type, installation_requested, comments
  ) values (
    trim(payload->>'first_name'), trim(payload->>'last_name'), lower(trim(payload->>'email')),
    trim(payload->>'phone'), (payload->>'event_date')::date, trim(payload->>'venue'),
    trim(payload->>'city'), (payload->>'guest_count')::integer,
    trim(payload->>'event_type'), coalesce((payload->>'installation_requested')::boolean, false),
    left(coalesce(payload->>'comments', ''), 3000)
  ) returning id into request_id;

  for item in select value from jsonb_array_elements(payload->'items')
  loop
    select * into item_product from public.products
      where id = item->>'product_id' and is_active = true;
    if not found then
      raise exception 'Catalog item unavailable';
    end if;
    item_quantity := (item->>'quantity')::integer;
    if item_quantity < 1 or item_quantity > 1000 then
      raise exception 'Invalid item quantity';
    end if;
    insert into public.request_items (
      request_id, product_id, product_name, category, variant_id,
      variant_name, quantity, unit_price, price_unit, display_price
    ) values (
      request_id, item_product.id, item_product.name, item_product.category,
      nullif(item->>'variant_id', ''), nullif(item->>'variant_name', ''),
      item_quantity,
      case when item_product.pricing_status = 'confirmed' then item_product.price else null end,
      case when item_product.pricing_status = 'confirmed' then item_product.price_unit else null end,
      case when item_product.pricing_status = 'confirmed' then item_product.display_price else null end
    );
  end loop;

  return request_id;
end;
$$;

revoke all on function public.submit_quote(jsonb) from public;
grant execute on function public.submit_quote(jsonb) to service_role;

create or replace function public.consume_quote_rate_limit(email_hash text, ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'utc')::date;
  email_attempts integer;
  ip_attempts integer;
begin
  if email_hash !~ '^[a-f0-9]{64}$' or ip_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid rate limit key';
  end if;

  insert into public.quote_rate_limits (kind, value_hash, period_start, attempts)
  values ('email', email_hash, today, 1)
  on conflict (kind, value_hash, period_start)
  do update set attempts = public.quote_rate_limits.attempts + 1
  returning attempts into email_attempts;

  insert into public.quote_rate_limits (kind, value_hash, period_start, attempts)
  values ('ip', ip_hash, today, 1)
  on conflict (kind, value_hash, period_start)
  do update set attempts = public.quote_rate_limits.attempts + 1
  returning attempts into ip_attempts;

  return email_attempts <= 3 and ip_attempts <= 10;
end;
$$;

revoke all on function public.consume_quote_rate_limit(text, text) from public;
grant execute on function public.consume_quote_rate_limit(text, text) to service_role;

create or replace function public.get_public_catalog()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'category', p.category,
    'description', p.description,
    'price', case when s.display_prices_publicly and p.pricing_status = 'confirmed' then p.price else null end,
    'price_unit', p.price_unit,
    'pricing_status', p.pricing_status,
    'display_price', case when s.display_prices_publicly and p.pricing_status = 'confirmed' then p.display_price else null end,
    'pricing_notes', '',
    'dimensions', p.dimensions,
    'colors', p.colors,
    'variants', coalesce((
      select jsonb_agg(
        variants.value ||
        jsonb_build_object(
          'price', case when s.display_prices_publicly and p.pricing_status = 'confirmed' then variants.value->'price' else 'null'::jsonb end,
          'displayPrice', case when s.display_prices_publicly and p.pricing_status = 'confirmed' then variants.value->'displayPrice' else 'null'::jsonb end
        )
      )
      from jsonb_array_elements(p.variants) as variants(value)
    ), '[]'::jsonb),
    'pack_contents', p.pack_contents,
    'pack_limit', p.pack_limit,
    'max_quantity', p.max_quantity,
    'image', p.image,
    'gallery', p.gallery,
    'availability', p.availability,
    'is_featured', p.is_featured,
    'is_active', p.is_active,
    'display_order', p.display_order
  )
  from public.products p
  cross join public.catalog_settings s
  where p.is_active = true and s.singleton = true
  order by p.display_order, p.name;
$$;

revoke all on function public.get_public_catalog() from public;
grant execute on function public.get_public_catalog() to anon, authenticated;

create or replace function public.get_public_site_content()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select home_content from public.site_content where singleton = true;
$$;

revoke all on function public.get_public_site_content() from public;
grant execute on function public.get_public_site_content() to anon, authenticated;
