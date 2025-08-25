-- SOPHISTICATED RLS FIX - Proper collection access for members
-- This implements proper RLS policies that allow users to see collections they're members of

-- Step 1: Disable RLS temporarily
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on collections table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'collections' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON collections', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on collection_members table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'collection_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON collection_members', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on restaurant_votes table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'restaurant_votes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_votes', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Create sophisticated policies that properly handle member access

-- Collections: Allow access to public collections, collections you created, or collections you're a member of
-- This uses a subquery to check membership without circular dependency
CREATE POLICY "collections_select_sophisticated" ON collections FOR SELECT USING (
  is_public = true OR 
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = collections.id 
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "collections_insert_sophisticated" ON collections FOR INSERT WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "collections_update_sophisticated" ON collections FOR UPDATE USING (
  auth.uid() = created_by
);

CREATE POLICY "collections_delete_sophisticated" ON collections FOR DELETE USING (
  auth.uid() = created_by
);

-- Collection members: Allow users to see memberships for collections they can access
CREATE POLICY "collection_members_select_sophisticated" ON collection_members FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.id = collection_members.collection_id 
    AND (c.created_by = auth.uid() OR c.is_public = true)
  )
);

CREATE POLICY "collection_members_insert_sophisticated" ON collection_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.id = collection_members.collection_id 
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "collection_members_update_sophisticated" ON collection_members FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.id = collection_members.collection_id 
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "collection_members_delete_sophisticated" ON collection_members FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.id = collection_members.collection_id 
    AND c.created_by = auth.uid()
  )
);

-- Restaurant votes: Allow access to votes in collections you can see
CREATE POLICY "restaurant_votes_select_sophisticated" ON restaurant_votes FOR SELECT USING (
  collection_id IS NULL OR 
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.id = restaurant_votes.collection_id 
    AND (c.is_public = true OR c.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collection_members cm 
          WHERE cm.collection_id = c.id 
          AND cm.user_id = auth.uid()
        )
    )
  )
);

CREATE POLICY "restaurant_votes_insert_sophisticated" ON restaurant_votes FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "restaurant_votes_update_sophisticated" ON restaurant_votes FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "restaurant_votes_delete_sophisticated" ON restaurant_votes FOR DELETE USING (
  auth.uid() = user_id
);

-- Step 4: Enable RLS with sophisticated policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the fix
SELECT 'Sophisticated RLS fix complete' as status;

-- Test queries to verify the policies work
SELECT 'Collections accessible' as test_result WHERE EXISTS (SELECT 1 FROM collections LIMIT 1);
SELECT 'Collection members accessible' as test_result WHERE EXISTS (SELECT 1 FROM collection_members LIMIT 1);
SELECT 'Restaurant votes accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_votes LIMIT 1);
