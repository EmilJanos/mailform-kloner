-- Billeder og video til editoren. Offentlig læsning; loggede brugere kan kun lægge filer i deres egen mappe.
-- Gratis-planen tillader højst 50 MB pr. fil og 1 GB i alt.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('images', 'images', true, 5242880,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('videos', 'videos', true, 52428800, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

create policy media_insert_own on storage.objects for insert to authenticated
  with check (bucket_id in ('images','videos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_update_own on storage.objects for update to authenticated
  using (bucket_id in ('images','videos') and owner = auth.uid());
create policy media_delete_own on storage.objects for delete to authenticated
  using (bucket_id in ('images','videos') and owner = auth.uid());
