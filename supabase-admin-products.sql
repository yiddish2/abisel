-- Adds database-backed storefront products and admin access for Abisel.

create table if not exists public.abisel_products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  category text not null check (category in ('wine', 'gifts')),
  price numeric(10, 2) not null,
  detail text not null default '',
  badge text not null default '',
  image_url text not null default '',
  is_active boolean not null default true
);

alter table public.abisel_products enable row level security;

grant select on public.abisel_products to anon, authenticated;
grant insert, update, delete on public.abisel_products to authenticated;
grant select, update on public.abisel_order_requests to authenticated;

drop policy if exists "Anyone can view active Abisel products" on public.abisel_products;
create policy "Anyone can view active Abisel products"
on public.abisel_products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated users can manage Abisel products" on public.abisel_products;
create policy "Authenticated users can manage Abisel products"
on public.abisel_products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can view Abisel orders" on public.abisel_order_requests;
create policy "Authenticated users can view Abisel orders"
on public.abisel_order_requests
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update Abisel orders" on public.abisel_order_requests;
create policy "Authenticated users can update Abisel orders"
on public.abisel_order_requests
for update
to authenticated
using (true)
with check (true);

insert into public.abisel_products (id, name, category, price, detail, badge, image_url)
values
  ('11111111-1111-4111-8111-111111111111', 'Reserve Cabernet', 'wine', 42, 'A rich red with dark fruit notes for Shabbos tables and hosted dinners.', 'Dry red', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80'),
  ('22222222-2222-4222-8222-222222222222', 'Celebration Moscato', 'wine', 28, 'Light, sweet, and easy to gift for birthdays, engagements, and thank-yous.', 'Sweet white', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&w=900&q=80'),
  ('33333333-3333-4333-8333-333333333333', 'Premium Kiddush Set', 'gifts', 96, 'A polished cup, tray, and presentation box ready for a meaningful gift.', 'Gift boxed', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80'),
  ('44444444-4444-4444-8444-444444444444', 'Wine & Chocolate Basket', 'gifts', 74, 'A ready-to-send basket with wine, chocolates, and a handwritten note.', 'Best seller', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80'),
  ('55555555-5555-4555-8555-555555555555', 'Sparkling Rose', 'wine', 36, 'Bright bubbles for lchaims, parties, and elegant dinner pairings.', 'Sparkling', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=900&q=80'),
  ('66666666-6666-4666-8666-666666666666', 'Host Gift Bundle', 'gifts', 58, 'Candles, sweets, and a small bottle arranged for a simple host gift.', 'Quick gift', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80')
on conflict (id) do nothing;
