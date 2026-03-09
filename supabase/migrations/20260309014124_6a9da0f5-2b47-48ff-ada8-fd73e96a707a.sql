-- Add foto_url column to tutor table
ALTER TABLE public.tutor ADD COLUMN IF NOT EXISTS foto_url text DEFAULT '';

-- Create storage bucket for tutor photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutor-photos', 'tutor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to tutor photos (read)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tutor-photos');

-- Allow anyone to upload tutor photos (authenticated or anon for now)
CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tutor-photos');

-- Allow update/delete tutor photos
CREATE POLICY "Allow Update" ON storage.objects FOR UPDATE USING (bucket_id = 'tutor-photos');
CREATE POLICY "Allow Delete" ON storage.objects FOR DELETE USING (bucket_id = 'tutor-photos');