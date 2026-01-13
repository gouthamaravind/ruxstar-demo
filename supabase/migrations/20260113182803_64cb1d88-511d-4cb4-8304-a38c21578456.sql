-- Create storage bucket for design files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('designs', 'designs', true);

-- Allow anyone to upload design files
CREATE POLICY "Anyone can upload designs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'designs');

-- Allow anyone to view design files
CREATE POLICY "Anyone can view designs"
ON storage.objects FOR SELECT
USING (bucket_id = 'designs');

-- Allow anyone to update their designs
CREATE POLICY "Anyone can update designs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'designs');

-- Allow anyone to delete designs
CREATE POLICY "Anyone can delete designs"
ON storage.objects FOR DELETE
USING (bucket_id = 'designs');