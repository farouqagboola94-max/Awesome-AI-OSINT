-- Audience records belong to verified Supabase users. No anonymous access.
create table public.reader_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Catalyst Reader' check (char_length(display_name) between 1 and 80),
  callsign text not null default '' check (callsign ~ '^[A-Za-z0-9_-]{0,32}$'),
  affinity text not null default 'Ṣàngó' check (affinity in ('Ṣàngó','Ògún','Ọ̀ṣun','Obatàlá','Ẹṣù')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.reader_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (key ~ '^catalyst_((page_i|pages_i|read_|comic_page_i|bookmarks_i|notes_i)[0-9]{1,4}|field_notes_v1|reader_scale|reader_focus|reader_theme|reader_fontsize|reader_layout|comic_theme|last_scene_idx|last_scene_title|choice_endings_v1)$'),
  value text not null check (octet_length(value) <= 200000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.reader_profiles enable row level security;
alter table public.reader_state enable row level security;
revoke all on public.reader_profiles, public.reader_state from anon, authenticated;
grant select, insert, update on public.reader_profiles to authenticated;
grant select, insert, update on public.reader_state to authenticated;
create policy own_profile_read on public.reader_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy own_profile_create on public.reader_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_profile_edit on public.reader_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_state_read on public.reader_state for select to authenticated using ((select auth.uid()) = user_id);
create policy own_state_create on public.reader_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_state_edit on public.reader_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- Invoker function only changes timestamps on rows already authorized by RLS.
create function public.reader_touch_updated_at() returns trigger language plpgsql
  security invoker set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
revoke execute on function public.reader_touch_updated_at() from public, anon, authenticated;
create trigger reader_profile_updated before update on public.reader_profiles for each row execute function public.reader_touch_updated_at();
create trigger reader_state_updated before update on public.reader_state for each row execute function public.reader_touch_updated_at();
