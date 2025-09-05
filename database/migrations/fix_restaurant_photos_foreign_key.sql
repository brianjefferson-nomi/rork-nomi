-- Fix foreign key constraint for restaurant_photos.uploaded_by
-- Change from auth.users to the custom users table

-- Drop the existing foreign key constraint
ALTER TABLE restaurant_photos DROP CONSTRAINT IF EXISTS restaurant_photos_uploaded_by_fkey;

-- Add new foreign key constraint to reference the custom users table
ALTER TABLE restaurant_photos ADD CONSTRAINT restaurant_photos_uploaded_by_fkey 
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
