create table public.production_reader_access (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','reviewer')),
 granted_at timestamptz not null default now()
);
alter table public.production_reader_access enable row level security;
revoke all on public.production_reader_access from public,anon,authenticated;
grant select on public.production_reader_access to authenticated;
grant all on public.production_reader_access to service_role;
create policy own_production_access on public.production_reader_access for select to authenticated using ((select auth.uid())=user_id);
comment on table public.production_reader_access is 'Owner-controlled approval list. Public signup cannot grant production access.';
