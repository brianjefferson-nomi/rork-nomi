-- Add views column to collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create index on views column for better performance
CREATE INDEX IF NOT EXISTS idx_collections_views ON collections(views DESC);

-- Verify the column was added
SELECT id, name, views FROM collections LIMIT 5;
