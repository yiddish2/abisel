-- Run this in the Supabase SQL editor.
-- It creates a private bucket where users can only access files inside their own user-id folder.

insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false)
on conflict (id) do nothing;

create policy "Users can list their own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload their own files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
