-- =====================================================
-- DEBUG USER COLLECTION ACCESS
-- =====================================================

-- Step 1: Check if you have any users in the database
SELECT '=== USER CHECK ===' as section;

SELECT 
  'Users in database' as check_type,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as users_with_names,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as users_with_emails
FROM users;

-- Show sample users
SELECT 
  'Sample users' as info,
  id,
  name,
  email,
  created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Check if you have any collections
SELECT '=== COLLECTIONS CHECK ===' as section;

SELECT 
  'Collections in database' as check_type,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as collections_with_names,
  COUNT(*) FILTER (WHERE created_by IS NOT NULL) as collections_with_creators,
  COUNT(*) FILTER (WHERE is_public = true) as public_collections,
  COUNT(*) FILTER (WHERE is_public = false) as private_collections
FROM collections;

-- Show sample collections
SELECT 
  'Sample collections' as info,
  id,
  name,
  description,
  created_by,
  is_public,
  collection_type,
  restaurant_ids,
  created_at
FROM collections 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Check collection members
SELECT '=== COLLECTION MEMBERS CHECK ===' as section;

SELECT 
  'Collection members' as check_type,
  COUNT(*) as total_memberships,
  COUNT(DISTINCT collection_id) as collections_with_members,
  COUNT(DISTINCT user_id) as users_with_memberships
FROM collection_members;

-- Show sample memberships
SELECT 
  'Sample memberships' as info,
  cm.collection_id,
  c.name as collection_name,
  cm.user_id,
  u.name as user_name,
  cm.role,
  cm.created_at
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
JOIN users u ON cm.user_id = u.id
ORDER BY cm.created_at DESC
LIMIT 10;

-- Step 4: Check if you're a member of any collections
SELECT '=== YOUR MEMBERSHIPS ===' as section;

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from step 1
-- First, let's find your user ID
SELECT 
  'Your user info' as info,
  id as your_user_id,
  name,
  email,
  created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 1;

-- Now check your memberships (replace the UUID with your actual user ID)
SELECT 
  'Your memberships' as info,
  cm.collection_id,
  c.name as collection_name,
  c.description,
  c.is_public,
  c.collection_type,
  cm.role,
  cm.created_at as joined_at
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
WHERE cm.user_id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
ORDER BY cm.created_at DESC;

-- Step 5: Check collections you created
SELECT '=== YOUR CREATED COLLECTIONS ===' as section;

SELECT 
  'Collections you created' as info,
  id,
  name,
  description,
  is_public,
  collection_type,
  restaurant_ids,
  created_at
FROM collections 
WHERE created_by = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
ORDER BY created_at DESC;

-- Step 6: Test the getUserPlans function logic
SELECT '=== GETUSERPLANS FUNCTION TEST ===' as section;

-- This simulates what the getUserPlans function does
WITH user_collections AS (
  -- Collections created by you
  SELECT 
    id, 
    name, 
    created_by, 
    'created' as source,
    is_public,
    collection_type
  FROM collections 
  WHERE created_by = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
  
  UNION ALL
  
  -- Collections where you are a member
  SELECT 
    c.id, 
    c.name, 
    c.created_by, 
    'member' as source,
    c.is_public,
    c.collection_type
  FROM collections c
  JOIN collection_members cm ON c.id = cm.collection_id
  WHERE cm.user_id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
  
  UNION ALL
  
  -- Public collections
  SELECT 
    id, 
    name, 
    created_by, 
    'public' as source,
    is_public,
    collection_type
  FROM collections 
  WHERE is_public = true
)
SELECT 
  'getUserPlans result' as info,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE source = 'created') as collections_created,
  COUNT(*) FILTER (WHERE source = 'member') as collections_member,
  COUNT(*) FILTER (WHERE source = 'public') as public_collections
FROM user_collections;

-- Show the actual collections
WITH user_collections AS (
  -- Collections created by you
  SELECT 
    id, 
    name, 
    created_by, 
    'created' as source,
    is_public,
    collection_type
  FROM collections 
  WHERE created_by = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
  
  UNION ALL
  
  -- Collections where you are a member
  SELECT 
    c.id, 
    c.name, 
    c.created_by, 
    'member' as source,
    c.is_public,
    c.collection_type
  FROM collections c
  JOIN collection_members cm ON c.id = cm.collection_id
  WHERE cm.user_id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
  
  UNION ALL
  
  -- Public collections
  SELECT 
    id, 
    name, 
    created_by, 
    'public' as source,
    is_public,
    collection_type
  FROM collections 
  WHERE is_public = true
)
SELECT 
  'Collection details' as info,
  id,
  name,
  source,
  is_public,
  collection_type
FROM user_collections
ORDER BY source, name;

-- Step 7: Check if collections have restaurants
SELECT '=== COLLECTION RESTAURANTS ===' as section;

SELECT 
  'Collections with restaurants' as check_type,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL) as collections_with_restaurant_ids,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) as collections_with_restaurants
FROM collections;

-- Show collections and their restaurant counts
SELECT 
  'Collection restaurant details' as info,
  id,
  name,
  restaurant_ids,
  array_length(restaurant_ids, 1) as restaurant_count
FROM collections
WHERE restaurant_ids IS NOT NULL
ORDER BY array_length(restaurant_ids, 1) DESC
LIMIT 10;

-- Step 8: Check if restaurants exist
SELECT '=== RESTAURANTS CHECK ===' as section;

SELECT 
  'Restaurants in database' as check_type,
  COUNT(*) as total_restaurants,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as restaurants_with_names
FROM restaurants;

-- Show sample restaurants
SELECT 
  'Sample restaurants' as info,
  id,
  name,
  restaurant_code,
  created_at
FROM restaurants 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 9: Check for data inconsistencies
SELECT '=== DATA INCONSISTENCIES ===' as section;

-- Check for collections without names
SELECT 
  'Collections without names' as issue,
  COUNT(*) as count
FROM collections 
WHERE name IS NULL OR name = '';

-- Check for collections without creators
SELECT 
  'Collections without creators' as issue,
  COUNT(*) as count
FROM collections 
WHERE created_by IS NULL;

-- Check for orphaned collection members
SELECT 
  'Orphaned collection members' as issue,
  COUNT(*) as count
FROM collection_members cm
LEFT JOIN collections c ON cm.collection_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned collection members (users)
SELECT 
  'Orphaned collection members (users)' as issue,
  COUNT(*) as count
FROM collection_members cm
LEFT JOIN users u ON cm.user_id = u.id
WHERE u.id IS NULL;

-- Check for restaurants referenced in collections that don't exist
SELECT 
  'Invalid restaurant references' as issue,
  COUNT(*) as count
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
LEFT JOIN restaurants r ON r.id = restaurant_id::UUID
WHERE c.restaurant_ids IS NOT NULL 
AND r.id IS NULL;

-- Step 10: Test RLS policies
SELECT '=== RLS POLICY CHECK ===' as section;

-- Check if RLS is enabled
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

-- Step 11: Test basic queries without functions
SELECT '=== BASIC QUERY TEST ===' as section;

-- Test direct collection query
SELECT 
  'Direct collections query' as test,
  COUNT(*) as total_collections
FROM collections;

-- Test direct members query
SELECT 
  'Direct members query' as test,
  COUNT(*) as total_memberships
FROM collection_members;

-- Test direct restaurants query
SELECT 
  'Direct restaurants query' as test,
  COUNT(*) as total_restaurants
FROM restaurants;

-- Step 12: Summary and recommendations
SELECT '=== SUMMARY & RECOMMENDATIONS ===' as section;

SELECT 
  'User Collection Access Status' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM users) = 0 THEN 'NO USERS - CREATE A USER FIRST'
    WHEN (SELECT COUNT(*) FROM collections) = 0 THEN 'NO COLLECTIONS - CREATE SOME COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM collection_members) = 0 THEN 'NO MEMBERSHIPS - ADD USERS TO COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM restaurants) = 0 THEN 'NO RESTAURANTS - ADD RESTAURANTS TO COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM collections WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) = 0 THEN 'COLLECTIONS EXIST BUT NO RESTAURANTS ADDED'
    WHEN (SELECT COUNT(*) FROM collections WHERE is_public = true) = 0 AND (SELECT COUNT(*) FROM collection_members WHERE user_id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)) = 0 THEN 'NO PUBLIC COLLECTIONS AND USER NOT MEMBER OF ANY'
    ELSE 'DATA EXISTS - CHECK RLS POLICIES OR FRONTEND CODE'
  END as result;
