alter table situacao enable row level security;

create policy "allow select to everyone" on situacao
  for select
  to public
  using (true);
