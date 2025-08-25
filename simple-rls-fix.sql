-- SIMPLE RLS FIX - Avoids circular dependencies by using broader policies
-- This approach allows more access at the database level and filters on the app side

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

-- Step 3: Create very permissive policies (no circular dependencies)
-- Collections: Allow authenticated users to see all collections
CREATE POLICY "collections_select_permissive" ON collections FOR SELECT USING (
  auth.role() = 'authenticated'
);

CREATE POLICY "collections_insert_permissive" ON collections FOR INSERT WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "collections_update_permissive" ON collections FOR UPDATE USING (
  auth.uid() = created_by
);

CREATE POLICY "collections_delete_permissive" ON collections FOR DELETE USING (
  auth.uid() = created_by
);

-- Collection members: Allow authenticated users to see all memberships
CREATE POLICY "collection_members_select_permissive" ON collection_members FOR SELECT USING (
  auth.role() = 'authenticated'
);

CREATE POLICY "collection_members_insert_permissive" ON collection_members FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

CREATE POLICY "collection_members_update_permissive" ON collection_members FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "collection_members_delete_permissive" ON collection_members FOR DELETE USING (
  auth.uid() = user_id
);

-- Restaurant votes: Allow authenticated users to see all votes
CREATE POLICY "restaurant_votes_select_permissive" ON restaurant_votes FOR SELECT USING (
  auth.role() = 'authenticated'
);

CREATE POLICY "restaurant_votes_insert_permissive" ON restaurant_votes FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "restaurant_votes_update_permissive" ON restaurant_votes FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "restaurant_votes_delete_permissive" ON restaurant_votes FOR DELETE USING (
  auth.uid() = user_id
);

-- Step 4: Enable RLS with permissive policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the fix
SELECT 'Simple RLS fix complete - permissive policies applied' as status;

-- Test queries
SELECT 'Collections accessible' as test_result WHERE EXISTS (SELECT 1 FROM collections LIMIT 1);
SELECT 'Collection members accessible' as test_result WHERE EXISTS (SELECT 1 FROM collection_members LIMIT 1);
SELECT 'Restaurant votes accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_votes LIMIT 1);
