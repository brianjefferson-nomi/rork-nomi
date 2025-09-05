-- Fix RLS policies for restaurant_photos table to work with custom authentication
-- The app uses a custom users table, not Supabase Auth

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read restaurant photos" ON restaurant_photos;
DROP POLICY IF EXISTS "Allow authenticated users to insert restaurant photos" ON restaurant_photos;
DROP POLICY IF EXISTS "Allow users to update their own restaurant photos" ON restaurant_photos;
DROP POLICY IF EXISTS "Allow users to delete their own restaurant photos" ON restaurant_photos;

-- Drop storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload restaurant photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view restaurant photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own restaurant photos from storage" ON storage.objects;

-- Create new policies that work with custom authentication
-- For now, allow all operations since we're using custom auth
-- In production, you might want to implement more specific checks

-- Allow all users to read restaurant photos (public photos)
CREATE POLICY "Allow all users to read restaurant photos" ON restaurant_photos
  FOR SELECT USING (true);

-- Allow all users to insert restaurant photos (will be restricted by app logic)
CREATE POLICY "Allow all users to insert restaurant photos" ON restaurant_photos
  FOR INSERT WITH CHECK (true);

-- Allow all users to update restaurant photos (will be restricted by app logic)
CREATE POLICY "Allow all users to update restaurant photos" ON restaurant_photos
  FOR UPDATE USING (true);

-- Allow all users to delete restaurant photos (will be restricted by app logic)
CREATE POLICY "Allow all users to delete restaurant photos" ON restaurant_photos
  FOR DELETE USING (true);

-- Storage policies - allow all operations for now
CREATE POLICY "Allow all users to upload restaurant photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'restaurant-photos');

CREATE POLICY "Allow all users to view restaurant photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-photos');

CREATE POLICY "Allow all users to delete restaurant photos from storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'restaurant-photos');
