-- Add collection types (public, private, shared)
-- This migration adds a collection_type field to support three distinct collection types

-- Add collection_type enum
CREATE TYPE IF NOT EXISTS collection_type AS ENUM ('public', 'private', 'shared');

-- Add collection_type column to collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS collection_type collection_type DEFAULT 'public';

-- Update existing collections to have appropriate types
-- Public collections (is_public = true) -> collection_type = 'public'
UPDATE collections 
SET collection_type = 'public' 
WHERE is_public = true;

-- Private collections (is_public = false and no collaborators) -> collection_type = 'private'
UPDATE collections 
SET collection_type = 'private' 
WHERE is_public = false 
AND (collaborators IS NULL OR array_length(collaborators, 1) = 0);

-- Shared collections (is_public = false and has collaborators) -> collection_type = 'shared'
UPDATE collections 
SET collection_type = 'shared' 
WHERE is_public = false 
AND collaborators IS NOT NULL 
AND array_length(collaborators, 1) > 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(collection_type);

-- Add RLS policies for collection types
-- Public collections: visible to everyone
CREATE POLICY IF NOT EXISTS "Public collections are viewable by everyone" ON collections
FOR SELECT USING (collection_type = 'public');

-- Private collections: only visible to creator
CREATE POLICY IF NOT EXISTS "Private collections are viewable by creator only" ON collections
FOR SELECT USING (
  collection_type = 'private' AND created_by = auth.uid()
);

-- Shared collections: visible to creator and members
CREATE POLICY IF NOT EXISTS "Shared collections are viewable by creator and members" ON collections
FOR SELECT USING (
  collection_type = 'shared' AND (
    created_by = auth.uid() OR 
    id IN (
      SELECT collection_id 
      FROM collection_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Update policies for collection_members table
-- Members can only see memberships for collections they have access to
CREATE POLICY IF NOT EXISTS "Members can view collection memberships they have access to" ON collection_members
FOR SELECT USING (
  collection_id IN (
    SELECT id FROM collections WHERE 
      collection_type = 'public' OR
      (collection_type = 'private' AND created_by = auth.uid()) OR
      (collection_type = 'shared' AND (
        created_by = auth.uid() OR 
        id IN (
          SELECT collection_id 
          FROM collection_members 
          WHERE user_id = auth.uid()
        )
      ))
  )
);

-- Update policies for restaurant_votes table
-- Votes are visible based on collection type
CREATE POLICY IF NOT EXISTS "Votes are visible based on collection type" ON restaurant_votes
FOR SELECT USING (
  collection_id IN (
    SELECT id FROM collections WHERE 
      collection_type = 'public' OR
      (collection_type = 'private' AND created_by = auth.uid()) OR
      (collection_type = 'shared' AND (
        created_by = auth.uid() OR 
        id IN (
          SELECT collection_id 
          FROM collection_members 
          WHERE user_id = auth.uid()
        )
      ))
  )
);

-- Update policies for restaurant_discussions table
-- Discussions are visible based on collection type
CREATE POLICY IF NOT EXISTS "Discussions are visible based on collection type" ON restaurant_discussions
FOR SELECT USING (
  collection_id IN (
    SELECT id FROM collections WHERE 
      collection_type = 'public' OR
      (collection_type = 'private' AND created_by = auth.uid()) OR
      (collection_type = 'shared' AND (
        created_by = auth.uid() OR 
        id IN (
          SELECT collection_id 
          FROM collection_members 
          WHERE user_id = auth.uid()
        )
      ))
  )
);

-- Update policies for user_activities table
-- Activities are visible based on collection type
CREATE POLICY IF NOT EXISTS "Activities are visible based on collection type" ON user_activities
FOR SELECT USING (
  collection_id IN (
    SELECT id FROM collections WHERE 
      collection_type = 'public' OR
      (collection_type = 'private' AND created_by = auth.uid()) OR
      (collection_type = 'shared' AND (
        created_by = auth.uid() OR 
        id IN (
          SELECT collection_id 
          FROM collection_members 
          WHERE user_id = auth.uid()
        )
      ))
  )
);
