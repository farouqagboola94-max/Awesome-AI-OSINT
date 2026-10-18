begin;
insert into auth.users(id,email) values
('10000000-0000-4000-8000-000000000011','store-a-test@catalyst.invalid'),
('10000000-0000-4000-8000-000000000012','store-b-test@catalyst.invalid');
insert into public.reader_orders(user_id,reference,amount_minor,status) values
('10000000-0000-4000-8000-000000000011','TEST-STORE-A',950000,'paid');
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000011';
insert into public.reader_state(user_id,key,value) values
(auth.uid(),'catalyst_cart','[]'),(auth.uid(),'catalyst_currency','NGN'),(auth.uid(),'catalyst_user_reviews','[]');
do $$ begin
if (select count(*) from public.reader_orders) <> 1 then raise exception 'Own order not readable'; end if;
begin
insert into public.reader_orders(user_id,reference,amount_minor,status) values (auth.uid(),'FORGED-PAID',0,'paid');
raise exception 'Client order creation allowed';
exception when insufficient_privilege then null; end;
begin
update public.reader_orders set status='delivered' where user_id=auth.uid();
raise exception 'Client status changes allowed';
exception when insufficient_privilege then null; end;
end $$;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000012';
do $$ begin
if (select count(*) from public.reader_orders) <> 0 then raise exception 'Another order leaked'; end if;
if (select count(*) from public.reader_state) <> 0 then raise exception 'Another cart leaked'; end if;
end $$;
set local role anon;
do $$ begin
begin perform 1 from public.reader_orders; raise exception 'Anonymous orders allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: own orders and carts, cross-user isolation, anonymous denial, client payment writes denied' as store_security_tests;
