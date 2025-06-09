alter policy "Enable users to view their own data only"
on "public"."users"
to authenticated
using (
  (( SELECT auth.uid() AS uid) = id)
);

alter policy "Enable update for users based on id"
on "public"."users"
to public
using (
  (auth.uid() = id)
)
with check (
  (auth.uid() = id)
);
