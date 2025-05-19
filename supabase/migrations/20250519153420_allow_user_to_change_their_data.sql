create policy "Enable update for users based on id"
on "public"."users"
as permissive
for update
to public
using (
  auth.uid() = id
)
with check (
  auth.uid() = id and auth.uid() = owner_id
);
