-- COMPREHENSIVE RLS FIX - Resolves all access issues
-- This creates very permissive policies that allow the app to work properly

-- Step 1: Disable RLS completely to clean up
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
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
    
    -- Drop all policies on restaurant_discussions table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'restaurant_discussions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_discussions', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on users table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Create very permissive policies for all tables

-- Collections: Allow all authenticated operations
CREATE POLICY "collections_all_operations" ON collections FOR ALL USING (auth.role() = 'authenticated');

-- Collection members: Allow all authenticated operations
CREATE POLICY "collection_members_all_operations" ON collection_members FOR ALL USING (auth.role() = 'authenticated');

-- Restaurant votes: Allow all authenticated operations
CREATE POLICY "restaurant_votes_all_operations" ON restaurant_votes FOR ALL USING (auth.role() = 'authenticated');

-- Restaurant discussions: Allow all authenticated operations
CREATE POLICY "restaurant_discussions_all_operations" ON restaurant_discussions FOR ALL USING (auth.role() = 'authenticated');

-- Users: Allow all authenticated operations
CREATE POLICY "users_all_operations" ON users FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Enable RLS with permissive policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the policies
SELECT 'Comprehensive RLS fix applied successfully' as status;

-- Test queries to verify the policies work
SELECT 'Collections accessible' as test_result WHERE EXISTS (SELECT 1 FROM collections LIMIT 1);
SELECT 'Collection members accessible' as test_result WHERE EXISTS (SELECT 1 FROM collection_members LIMIT 1);
SELECT 'Restaurant votes accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_votes LIMIT 1);
SELECT 'Restaurant discussions accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_discussions LIMIT 1);
SELECT 'Users accessible' as test_result WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Add comments to track this implementation
COMMENT ON TABLE collections IS 'Comprehensive RLS fix - very permissive policies for all authenticated users';
COMMENT ON TABLE collection_members IS 'Comprehensive RLS fix - very permissive policies for all authenticated users';
COMMENT ON TABLE restaurant_votes IS 'Comprehensive RLS fix - very permissive policies for all authenticated users';
COMMENT ON TABLE restaurant_discussions IS 'Comprehensive RLS fix - very permissive policies for all authenticated users';
COMMENT ON TABLE users IS 'Comprehensive RLS fix - very permissive policies for all authenticated users';
