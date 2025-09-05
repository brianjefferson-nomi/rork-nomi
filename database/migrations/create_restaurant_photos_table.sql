-- Create restaurant_photos table for storing user-uploaded restaurant photos
CREATE TABLE IF NOT EXISTS restaurant_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_photos_restaurant_id ON restaurant_photos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_photos_uploaded_by ON restaurant_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_restaurant_photos_created_at ON restaurant_photos(created_at);

-- Add RLS policies
ALTER TABLE restaurant_photos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all restaurant photos
CREATE POLICY "Allow authenticated users to read restaurant photos" ON restaurant_photos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own restaurant photos
CREATE POLICY "Allow authenticated users to insert restaurant photos" ON restaurant_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own restaurant photos
CREATE POLICY "Allow users to update their own restaurant photos" ON restaurant_photos
  FOR UPDATE USING (auth.uid() = uploaded_by);

-- Allow users to delete their own restaurant photos
CREATE POLICY "Allow users to delete their own restaurant photos" ON restaurant_photos
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Create storage bucket for restaurant photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-photos', 'restaurant-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload restaurant photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-photos' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to view photos
CREATE POLICY "Allow authenticated users to view restaurant photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'restaurant-photos' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own photos
CREATE POLICY "Allow users to delete their own restaurant photos from storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'restaurant-photos' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
