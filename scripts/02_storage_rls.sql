-- ================================================================
-- Storage RLS 정책 추가 (avatars + community 버킷)
-- Supabase Dashboard → SQL Editor에서 실행
-- ================================================================

-- avatars 버킷: 인증된 사용자 업로드 허용
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- community 버킷: 인증된 사용자 업로드 허용
CREATE POLICY "community_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community');

CREATE POLICY "community_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'community' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "community_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'community');

CREATE POLICY "community_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'community' AND (storage.foldername(name))[1] = auth.uid()::text);
