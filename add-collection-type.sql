-- Add collection_type field to collections table
-- This will provide better clarity for collection types: public, private, shared

-- Add the collection_type column with a check constraint
ALTER TABLE collections 
ADD COLUMN collection_type TEXT CHECK (collection_type IN ('public', 'private', 'shared')) DEFAULT 'public';

-- Update existing collections to have the correct collection_type based on is_public
-- Public collections (is_public = true) -> collection_type = 'public'
UPDATE collections 
SET collection_type = 'public' 
WHERE is_public = true;

-- Private collections (is_public = false) -> collection_type = 'private' 
-- (assuming they are created by someone, not shared)
UPDATE collections 
SET collection_type = 'private' 
WHERE is_public = false AND created_by IS NOT NULL;

-- For collections that are shared (user is a member but not creator), 
-- we'll need to update them based on collection_members table
-- This is a more complex update that requires checking membership

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_collections_collection_type ON collections(collection_type);

-- Add a comment to document the field
COMMENT ON COLUMN collections.collection_type IS 'Type of collection: public (visible to all), private (creator only), shared (invited members)';
