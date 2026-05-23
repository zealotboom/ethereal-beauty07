create extension if not exists vector;

create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  avatar_url text,
  role text default 'user',
  style_dna jsonb,
  created_at timestamp default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  category text,
  images text[],
  sizes text[],
  colors text[],
  stock int default 0,
  tags text[],
  is_active boolean default true,
  embedding vector(768),
  created_at timestamp default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  items jsonb not null,
  total numeric(10,2),
  status text default 'pending',
  address jsonb,
  stripe_id text,
  created_at timestamp default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  size text,
  color text,
  quantity int default 1
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  product_id uuid references public.products(id)
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  discount_type text,
  discount_value numeric(10,2),
  usage_count int default 0,
  max_uses int,
  expires_at timestamp,
  is_active boolean default true
);

create table public.ai_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  created_at timestamp default now()
);

create or replace function match_products(query_embedding vector(768), match_count int default 12)
returns table (id uuid, name text, similarity float)
language sql stable
as $$
  select id, name, 1 - (embedding <=> query_embedding) as similarity
  from public.products
  where is_active = true
  order by embedding <=> query_embedding
  limit match_count;
$$;

alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.ai_rate_limits enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own cart" on public.cart_items for all using (auth.uid() = user_id);
create policy "own wishlist" on public.wishlist_items for all using (auth.uid() = user_id);
create policy "own orders" on public.orders for all using (auth.uid() = user_id);
create policy "public products" on public.products for select using (is_active = true);
create policy "own ai rate limits" on public.ai_rate_limits for all using (auth.uid()::text = user_id or user_id = 'anonymous');
