begin;
insert into auth.users(id,email) values
('10000000-0000-4000-8000-000000000001','reader-a-test@catalyst.invalid'),
('10000000-0000-4000-8000-000000000002','reader-b-test@catalyst.invalid');
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';
insert into public.reader_profiles(user_id,display_name) values ('10000000-0000-4000-8000-000000000001','Test A');
insert into public.reader_state(user_id,key,value) values ('10000000-0000-4000-8000-000000000001','catalyst_page_i1','3');
do $$ begin
if (select count(*) from public.reader_profiles) <> 1 then raise exception 'Own profile not readable'; end if;
update public.reader_profiles set callsign='TEST_A' where user_id=auth.uid();
begin
insert into public.reader_profiles(user_id) values ('10000000-0000-4000-8000-000000000002');
raise exception 'Cross-user insert was allowed';
exception when insufficient_privilege then null; end;
begin
update public.reader_profiles set user_id='10000000-0000-4000-8000-000000000002' where user_id=auth.uid();
raise exception 'Ownership reassignment was allowed';
exception when insufficient_privilege then null; end;
end $$;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000002';
do $$ begin
if (select count(*) from public.reader_profiles) <> 0 then raise exception 'Another profile leaked'; end if;
if (select count(*) from public.reader_state) <> 0 then raise exception 'Another reader state leaked'; end if;
update public.reader_state set value='999' where key='catalyst_page_i1';
if found then raise exception 'Cross-user update was allowed'; end if;
end $$;
set local role anon;
do $$ begin
begin perform 1 from public.reader_profiles; raise exception 'Anonymous profile access allowed'; exception when insufficient_privilege then null; end;
begin perform 1 from public.reader_state; raise exception 'Anonymous state access allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: own reads/writes, cross-user isolation, ownership guard and anonymous denial' as security_tests,
(select count(*) from auth.users) as users_after_rollback,
(select count(*) from public.reader_profiles) as profiles_after_rollback;
