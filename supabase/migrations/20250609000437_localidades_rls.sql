alter table localidades enable row level security;

create policy "Allow read access to auth and anon"
on localidades
for select
to anon, authenticated
using (true);

create policy "Allow read access to service role"
on localidades
for select
to service_role
using (true);
