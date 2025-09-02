-- Create pexels_images table for storing Pexels images
CREATE TABLE IF NOT EXISTS pexels_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pexels_id INTEGER NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  neighborhood TEXT,
  city TEXT,
  cuisine TEXT,
  image_type TEXT NOT NULL CHECK (image_type IN ('collection', 'neighborhood', 'cuisine', 'city', 'custom')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  photographer TEXT NOT NULL,
  photographer_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pexels_images_pexels_id ON pexels_images(pexels_id);
CREATE INDEX IF NOT EXISTS idx_pexels_images_collection_id ON pexels_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_pexels_images_image_type ON pexels_images(image_type);
CREATE INDEX IF NOT EXISTS idx_pexels_images_city ON pexels_images(city);
CREATE INDEX IF NOT EXISTS idx_pexels_images_neighborhood ON pexels_images(neighborhood);
CREATE INDEX IF NOT EXISTS idx_pexels_images_cuisine ON pexels_images(cuisine);

-- Create unique constraint to prevent duplicate Pexels images
CREATE UNIQUE INDEX IF NOT EXISTS idx_pexels_images_unique ON pexels_images(pexels_id, image_type);

-- Add RLS policies
ALTER TABLE pexels_images ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all pexels images
CREATE POLICY "Allow authenticated users to read pexels images" ON pexels_images
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own pexels images
CREATE POLICY "Allow authenticated users to insert pexels images" ON pexels_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own pexels images
CREATE POLICY "Allow authenticated users to update pexels images" ON pexels_images
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own pexels images
CREATE POLICY "Allow authenticated users to delete pexels images" ON pexels_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pexels_images_updated_at 
  BEFORE UPDATE ON pexels_images 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
