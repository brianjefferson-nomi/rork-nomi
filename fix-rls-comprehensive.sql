-- Comprehensive RLS Fix for Collections
-- This script disables RLS on all tables and drops all policies

-- 1. Disable RLS on collections table
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON collections;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON collections;
DROP POLICY IF EXISTS "Enable update for users based on created_by" ON collections;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON collections;
DROP POLICY IF EXISTS "Enable read access for collection members" ON collections;
DROP POLICY IF EXISTS "Enable read access for public collections" ON collections;

-- 2. Disable RLS on restaurants table
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON restaurants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON restaurants;
DROP POLICY IF EXISTS "Enable update for users based on created_by" ON restaurants;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON restaurants;

-- 3. Disable RLS on collection_members table
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for collection members" ON collection_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON collection_members;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON collection_members;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON collection_members;

-- 4. Disable RLS on restaurant_votes table
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for collection members" ON restaurant_votes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON restaurant_votes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON restaurant_votes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON restaurant_votes;

-- 5. Disable RLS on restaurant_discussions table
ALTER TABLE restaurant_discussions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for collection members" ON restaurant_discussions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON restaurant_discussions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON restaurant_discussions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON restaurant_discussions;

-- 6. Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON users;

-- 7. Disable RLS on user_notes table (if it exists)
ALTER TABLE user_notes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON user_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_notes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_notes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_notes;

-- 8. Disable RLS on plan_invitations table (if it exists)
ALTER TABLE plan_invitations DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for collection members" ON plan_invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON plan_invitations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON plan_invitations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON plan_invitations;

-- 9. Disable RLS on user_activities table (if it exists)
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_activities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_activities;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_activities;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_activities;

-- 10. Disable RLS on user_relationships table (if it exists)
ALTER TABLE user_relationships DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON user_relationships;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_relationships;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_relationships;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_relationships;

-- 11. Disable RLS on restaurant_rankings table (if it exists)
ALTER TABLE restaurant_rankings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON restaurant_rankings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON restaurant_rankings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON restaurant_rankings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON restaurant_rankings;

-- 12. Disable RLS on api_calls table (if it exists)
ALTER TABLE api_calls DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON api_calls;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON api_calls;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON api_calls;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON api_calls;

-- Verify RLS is disabled on all tables
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
