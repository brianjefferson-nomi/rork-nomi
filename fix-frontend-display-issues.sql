-- =====================================================
-- CHECK FRONTEND DISPLAY ISSUES
-- =====================================================

-- Step 1: Check if there are any public collections
SELECT '=== PUBLIC COLLECTIONS CHECK ===' as section;

SELECT 
  'Public collections' as check_type,
  COUNT(*) as total_public_collections,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) as public_collections_with_restaurants
FROM collections
WHERE is_public = true;

-- Show public collections
SELECT 
  'Public collections details' as info,
  id,
  name,
  description,
  created_by,
  restaurant_ids,
  array_length(restaurant_ids, 1) as restaurant_count,
  created_at
FROM collections
WHERE is_public = true
ORDER BY created_at DESC;

-- Step 2: Check if there are any collections with members
SELECT '=== COLLECTIONS WITH MEMBERS ===' as section;

SELECT 
  'Collections with members' as check_type,
  COUNT(DISTINCT c.id) as collections_with_members,
  COUNT(cm.id) as total_memberships
FROM collections c
JOIN collection_members cm ON c.id = cm.collection_id;

-- Show collections with members
SELECT 
  'Collections with members details' as info,
  c.id,
  c.name,
  c.description,
  c.created_by,
  c.is_public,
  c.collection_type,
  COUNT(cm.id) as member_count,
  c.restaurant_ids,
  array_length(c.restaurant_ids, 1) as restaurant_count
FROM collections c
JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name, c.description, c.created_by, c.is_public, c.collection_type, c.restaurant_ids
ORDER BY member_count DESC;

-- Step 3: Check user authentication data
SELECT '=== USER AUTHENTICATION CHECK ===' as section;

SELECT 
  'User authentication data' as check_type,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as users_with_emails,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as users_with_names
FROM users;

-- Show recent users
SELECT 
  'Recent users' as info,
  id,
  name,
  email,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Test the exact getUserPlans logic
SELECT '=== GETUSERPLANS LOGIC TEST ===' as section;

-- Get the most recent user
WITH recent_user AS (
  SELECT id FROM users ORDER BY created_at DESC LIMIT 1
),
user_collections AS (
  -- Collections created by user
  SELECT 
    id, 
    name, 
    created_by, 
    'created' as source,
    is_public,
    collection_type,
    restaurant_ids
  FROM collections 
  WHERE created_by = (SELECT id FROM recent_user)
  
  UNION ALL
  
  -- Collections where user is member
  SELECT 
    c.id, 
    c.name, 
    c.created_by, 
    'member' as source,
    c.is_public,
    c.collection_type,
    c.restaurant_ids
  FROM collections c
  JOIN collection_members cm ON c.id = cm.collection_id
  WHERE cm.user_id = (SELECT id FROM recent_user)
  
  UNION ALL
  
  -- Public collections
  SELECT 
    id, 
    name, 
    created_by, 
    'public' as source,
    is_public,
    collection_type,
    restaurant_ids
  FROM collections 
  WHERE is_public = true
)
SELECT 
  'getUserPlans result for recent user' as info,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE source = 'created') as collections_created,
  COUNT(*) FILTER (WHERE source = 'member') as collections_member,
  COUNT(*) FILTER (WHERE source = 'public') as public_collections,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) as collections_with_restaurants
FROM user_collections;

-- Show the actual collections
WITH recent_user AS (
  SELECT id FROM users ORDER BY created_at DESC LIMIT 1
),
user_collections AS (
  -- Collections created by user
  SELECT 
    id, 
    name, 
    created_by, 
    'created' as source,
    is_public,
    collection_type,
    restaurant_ids
  FROM collections 
  WHERE created_by = (SELECT id FROM recent_user)
  
  UNION ALL
  
  -- Collections where user is member
  SELECT 
    c.id, 
    c.name, 
    c.created_by, 
    'member' as source,
    c.is_public,
    c.collection_type,
    c.restaurant_ids
  FROM collections c
  JOIN collection_members cm ON c.id = cm.collection_id
  WHERE cm.user_id = (SELECT id FROM recent_user)
  
  UNION ALL
  
  -- Public collections
  SELECT 
    id, 
    name, 
    created_by, 
    'public' as source,
    is_public,
    collection_type,
    restaurant_ids
  FROM collections 
  WHERE is_public = true
)
SELECT 
  'Collection details for recent user' as info,
  id,
  name,
  source,
  is_public,
  collection_type,
  restaurant_ids,
  array_length(restaurant_ids, 1) as restaurant_count
FROM user_collections
ORDER BY source, name;

-- Step 5: Check if collections have proper data for frontend
SELECT '=== FRONTEND DATA REQUIREMENTS ===' as section;

-- Check collections that should be visible to users
SELECT 
  'Collections ready for frontend' as check_type,
  COUNT(*) as total_visible_collections,
  COUNT(*) FILTER (WHERE name IS NOT NULL AND name != '') as collections_with_names,
  COUNT(*) FILTER (WHERE description IS NOT NULL AND description != '') as collections_with_descriptions,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) as collections_with_restaurants,
  COUNT(*) FILTER (WHERE created_by IS NOT NULL) as collections_with_creators
FROM collections
WHERE is_public = true OR id IN (
  SELECT DISTINCT collection_id FROM collection_members
);

-- Show collections that need attention
SELECT 
  'Collections needing attention' as info,
  id,
  name,
  description,
  created_by,
  is_public,
  collection_type,
  restaurant_ids,
  CASE 
    WHEN name IS NULL OR name = '' THEN 'Missing name'
    WHEN description IS NULL OR description = '' THEN 'Missing description'
    WHEN restaurant_ids IS NULL OR array_length(restaurant_ids, 1) = 0 THEN 'No restaurants'
    WHEN created_by IS NULL THEN 'No creator'
    ELSE 'OK'
  END as issue
FROM collections
WHERE is_public = true OR id IN (
  SELECT DISTINCT collection_id FROM collection_members
)
AND (
  name IS NULL OR name = '' OR
  description IS NULL OR description = '' OR
  restaurant_ids IS NULL OR array_length(restaurant_ids, 1) = 0 OR
  created_by IS NULL
);

-- Step 6: Check RLS policies that might block access
SELECT '=== RLS POLICY CHECK ===' as section;

-- Check if RLS is enabled on key tables
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('collections', 'collection_members', 'restaurant_votes', 'restaurant_discussions');

-- Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('collections', 'collection_members', 'restaurant_votes', 'restaurant_discussions')
ORDER BY tablename, policyname;

-- Step 7: Test direct queries that the frontend might use
SELECT '=== DIRECT QUERY TESTS ===' as section;

-- Test collections query
SELECT 
  'Direct collections query' as test,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE is_public = true) as public_collections,
  COUNT(*) FILTER (WHERE is_public = false) as private_collections
FROM collections;

-- Test collection members query
SELECT 
  'Direct collection members query' as test,
  COUNT(*) as total_memberships,
  COUNT(DISTINCT collection_id) as collections_with_members,
  COUNT(DISTINCT user_id) as users_with_memberships
FROM collection_members;

-- Test restaurants query
SELECT 
  'Direct restaurants query' as test,
  COUNT(*) as total_restaurants,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as restaurants_with_names
FROM restaurants;

-- Step 8: Summary and recommendations
SELECT '=== SUMMARY & RECOMMENDATIONS ===' as section;

SELECT 
  'Frontend Display Issue Analysis' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM collections WHERE is_public = true) = 0 
    AND (SELECT COUNT(*) FROM collection_members) = 0
    THEN 'NO PUBLIC COLLECTIONS AND NO MEMBERSHIPS - CREATE PUBLIC COLLECTIONS OR ADD USERS TO COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM collections WHERE is_public = true) = 0
    THEN 'NO PUBLIC COLLECTIONS - CREATE SOME PUBLIC COLLECTIONS FOR DISCOVERY'
    WHEN (SELECT COUNT(*) FROM collection_members) = 0
    THEN 'NO MEMBERSHIPS - ADD USERS TO COLLECTIONS OR CREATE PUBLIC COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM collections WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) = 0
    THEN 'COLLECTIONS EXIST BUT NO RESTAURANTS - ADD RESTAURANTS TO COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM users) = 0
    THEN 'NO USERS - CREATE USERS FIRST'
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'collections' 
      AND rowsecurity = true
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'collections'
    )
    THEN 'RLS ENABLED BUT NO POLICIES - ADD RLS POLICIES OR DISABLE RLS'
    ELSE 'DATA EXISTS - CHECK FRONTEND AUTHENTICATION AND QUERY LOGIC'
  END as result;
