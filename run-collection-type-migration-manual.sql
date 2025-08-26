-- Manual collection type migration script
-- Run this in Supabase SQL Editor

-- Step 1: Add the collection_type column
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS collection_type TEXT CHECK (collection_type IN ('public', 'private', 'shared')) DEFAULT 'public';

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_collections_collection_type ON collections(collection_type);

-- Step 3: Update existing collections based on contributor count
-- First, let's see what we have
SELECT 
  c.id,
  c.name,
  c.is_public,
  COUNT(cm.user_id) as member_count,
  (COUNT(cm.user_id) + 1) as total_contributors
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name, c.is_public
ORDER BY c.name;

-- Step 4: Update collections with only creator (private)
UPDATE collections 
SET collection_type = 'private', is_public = false
WHERE id IN (
  SELECT c.id
  FROM collections c
  LEFT JOIN collection_members cm ON c.id = cm.collection_id
  GROUP BY c.id
  HAVING COUNT(cm.user_id) = 0
);

-- Step 5: Update collections with multiple contributors (shared)
UPDATE collections 
SET collection_type = 'shared', is_public = false
WHERE id IN (
  SELECT c.id
  FROM collections c
  LEFT JOIN collection_members cm ON c.id = cm.collection_id
  GROUP BY c.id
  HAVING COUNT(cm.user_id) > 0
);

-- Step 6: Keep public collections as public (if any were explicitly set)
UPDATE collections 
SET collection_type = 'public', is_public = true
WHERE is_public = true AND collection_type IS NULL;

-- Step 7: Verify the results
SELECT 
  c.id,
  c.name,
  c.collection_type,
  c.is_public,
  COUNT(cm.user_id) as member_count,
  (COUNT(cm.user_id) + 1) as total_contributors
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name, c.collection_type, c.is_public
ORDER BY c.name;
