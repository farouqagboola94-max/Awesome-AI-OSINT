-- Cart data is private reader state. Payment status is server-controlled.
alter table public.reader_state drop constraint reader_state_key_check;
alter table public.reader_state add constraint reader_state_key_check check (
  key ~ '^catalyst_((page_i|pages_i|read_|comic_page_i|bookmarks_i|notes_i)[0-9]{1,4}|field_notes_v1|reader_scale|reader_focus|reader_theme|reader_fontsize|reader_layout|comic_theme|last_scene_idx|last_scene_title|choice_endings_v1|cart|currency|user_reviews)$'
);
create table public.reader_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique check (reference ~ '^[A-Za-z0-9_-]{6,80}$'),
  currency text not null default 'NGN' check (currency in ('NGN','USD','GBP','EUR')),
  amount_minor bigint not null check (amount_minor >= 0),
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and octet_length(items::text) <= 200000),
  created_at timestamptz not null default now()
);
create index reader_orders_user_created on public.reader_orders(user_id, created_at desc);
alter table public.reader_orders enable row level security;
revoke all on public.reader_orders from anon, authenticated;
grant select on public.reader_orders to authenticated;
grant all on public.reader_orders to service_role;
create policy own_orders_read on public.reader_orders for select to authenticated using ((select auth.uid()) = user_id);
