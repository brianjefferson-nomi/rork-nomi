-- Temporary fix to disable RLS and allow collections access
-- This is a temporary solution while we fix the circular dependency issue

-- Disable RLS on all related tables
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;

-- Add a comment to track this temporary fix
COMMENT ON TABLE collections IS 'RLS temporarily disabled for debugging - collections should now be accessible';

-- Test query to verify access
SELECT COUNT(*) as collections_count FROM collections;
SELECT COUNT(*) as members_count FROM collection_members;
