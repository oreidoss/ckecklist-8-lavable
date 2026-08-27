CREATE POLICY "Authenticated read anexos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'auditoria-anexos');
CREATE POLICY "Authenticated upload anexos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'auditoria-anexos');
CREATE POLICY "Authenticated update anexos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'auditoria-anexos');
CREATE POLICY "Authenticated delete anexos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'auditoria-anexos');