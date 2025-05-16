alter table public.users
alter column nome drop not null;

-- create a trigger to insert a new user in the users table
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, owner_id)
  values (new.id, new.id);
  return new;
end;
$$ language plpgsql security definer;

-- hook it to auth.users inserts
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
