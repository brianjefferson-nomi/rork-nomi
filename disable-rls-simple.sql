-- Simple RLS Disable for Collections
-- This script just disables RLS on all tables without dropping policies

-- Disable RLS on all tables
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on additional tables (if they exist)
ALTER TABLE user_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_calls DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'collections', 'restaurants', 'collection_members', 'restaurant_votes', 
    'restaurant_discussions', 'users', 'user_notes', 'plan_invitations', 
    'user_activities', 'user_relationships', 'restaurant_rankings', 'api_calls'
  )
ORDER BY tablename;
