-- Create storage bucket for CMS images (blog posts, testimonials)
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true);

-- Allow public read access
CREATE POLICY "CMS images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'cms-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload CMS images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cms-images' AND has_role(auth.uid(), 'admin'));

-- Allow admins to update images
CREATE POLICY "Admins can update CMS images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cms-images' AND has_role(auth.uid(), 'admin'));

-- Allow admins to delete images
CREATE POLICY "Admins can delete CMS images" ON storage.objects
  FOR DELETE USING (bucket_id = 'cms-images' AND has_role(auth.uid(), 'admin'));