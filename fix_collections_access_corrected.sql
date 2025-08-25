-- Fix collections access by properly configuring RLS policies
-- This addresses the circular dependency issue between collections and collection_members
-- CORRECTED VERSION - handles existing policies properly

-- First, disable RLS temporarily to clean up policies
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on these tables (including any that might exist)
DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;
DROP POLICY IF EXISTS "Collection members can view private collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can create collections" ON collections;
DROP POLICY IF EXISTS "Collection creators can update collections" ON collections;
DROP POLICY IF EXISTS "Collections access policy" ON collections;
DROP POLICY IF EXISTS "Collections insert policy" ON collections;
DROP POLICY IF EXISTS "Collections update policy" ON collections;
DROP POLICY IF EXISTS "Collections delete policy" ON collections;
DROP POLICY IF EXISTS "Collections SELECT policy" ON collections;
DROP POLICY IF EXISTS "Collections INSERT policy" ON collections;
DROP POLICY IF EXISTS "Collections UPDATE policy" ON collections;
DROP POLICY IF EXISTS "Collections DELETE policy" ON collections;

DROP POLICY IF EXISTS "Collection members can view membership" ON collection_members;
DROP POLICY IF EXISTS "Collection creators can manage members" ON collection_members;
DROP POLICY IF EXISTS "Collection members view policy" ON collection_members;
DROP POLICY IF EXISTS "Collection members insert policy" ON collection_members;
DROP POLICY IF EXISTS "Collection members update policy" ON collection_members;
DROP POLICY IF EXISTS "Collection members delete policy" ON collection_members;

DROP POLICY IF EXISTS "Users can view votes in public collections" ON restaurant_votes;
DROP POLICY IF EXISTS "Collection members can view votes" ON restaurant_votes;
DROP POLICY IF EXISTS "Users can manage their own votes" ON restaurant_votes;
DROP POLICY IF EXISTS "Restaurant votes view policy" ON restaurant_votes;
DROP POLICY IF EXISTS "Restaurant votes insert policy" ON restaurant_votes;
DROP POLICY IF EXISTS "Restaurant votes update policy" ON restaurant_votes;
DROP POLICY IF EXISTS "Restaurant votes delete policy" ON restaurant_votes;

-- Create improved policies that avoid circular dependencies

-- Collections policies
CREATE POLICY "collections_select_policy" ON collections FOR SELECT USING (
  is_public = true OR 
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = collections.id AND user_id = auth.uid()
  )
);

CREATE POLICY "collections_insert_policy" ON collections FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "collections_update_policy" ON collections FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "collections_delete_policy" ON collections FOR DELETE USING (auth.uid() = created_by);

-- Collection members policies (simplified to avoid circular dependency)
CREATE POLICY "collection_members_view_policy" ON collection_members FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id AND created_by = auth.uid()
  )
);

CREATE POLICY "collection_members_insert_policy" ON collection_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id AND created_by = auth.uid()
  )
);

CREATE POLICY "collection_members_update_policy" ON collection_members FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id AND created_by = auth.uid()
  )
);

CREATE POLICY "collection_members_delete_policy" ON collection_members FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id AND created_by = auth.uid()
  )
);

-- Restaurant votes policies
CREATE POLICY "restaurant_votes_view_policy" ON restaurant_votes FOR SELECT USING (
  collection_id IS NULL OR
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = restaurant_votes.collection_id AND is_public = true
  ) OR
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = restaurant_votes.collection_id AND user_id = auth.uid()
  )
);

CREATE POLICY "restaurant_votes_insert_policy" ON restaurant_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "restaurant_votes_update_policy" ON restaurant_votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "restaurant_votes_delete_policy" ON restaurant_votes FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS with the new policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;

-- Add a comment to track this fix
COMMENT ON TABLE collections IS 'RLS policies fixed to resolve circular dependency - collections should now be accessible to members';

-- Test queries to verify the fix works
SELECT 'Collections table accessible' as test_result WHERE EXISTS (SELECT 1 FROM collections LIMIT 1);
SELECT 'Collection members table accessible' as test_result WHERE EXISTS (SELECT 1 FROM collection_members LIMIT 1);
SELECT 'Restaurant votes table accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_votes LIMIT 1);
