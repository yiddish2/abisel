-- Run in the shared Supabase project used by Abisel.
-- Stores public storefront order requests. Customers can insert; only authenticated/admin tools should read.

create table if not exists public.abisel_order_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  phone text not null,
  fulfillment_method text not null check (fulfillment_method in ('pickup', 'delivery')),
  address text not null default '',
  notes text not null default '',
  age_confirmed boolean not null,
  items jsonb not null,
  total_amount numeric(10, 2) not null,
  status text not null default 'new'
);

alter table public.abisel_order_requests enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'abisel_order_requests'
      and policyname = 'Anyone can create Abisel order requests'
  ) then
    create policy "Anyone can create Abisel order requests"
    on public.abisel_order_requests
    for insert
    to anon, authenticated
    with check (
      age_confirmed = true
      and jsonb_array_length(items) > 0
      and total_amount > 0
    );
  end if;
end $$;
