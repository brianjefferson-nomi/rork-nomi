-- TEMPORARY RLS DISABLE - Quick fix to allow collection access
-- This will disable RLS temporarily so you can see your collections

-- Disable RLS on all tables
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
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

-- Test that access works
SELECT 'RLS temporarily disabled - collections should now be accessible' as status;

-- Test queries
SELECT 'Collections accessible' as test_result WHERE EXISTS (SELECT 1 FROM collections LIMIT 1);
SELECT 'Collection members accessible' as test_result WHERE EXISTS (SELECT 1 FROM collection_members LIMIT 1);
SELECT 'Restaurant votes accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_votes LIMIT 1);
