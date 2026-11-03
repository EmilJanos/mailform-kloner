-- Kør efter første login, så sider du har seedet bliver dine. Skift e-mailen.
update public.pages set owner_id = (select id from auth.users where email = 'emiljvhansen@gmail.com')
where owner_id is null;
