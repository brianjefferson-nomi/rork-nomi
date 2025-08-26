-- =====================================================
-- DIAGNOSE COLLECTION DATA ISSUES
-- =====================================================

-- Step 1: Check if you have any users in the database
SELECT '=== USER CHECK ===' as section;

SELECT 
  id,
  name,
  email,
  created_at
FROM users 
LIMIT 5;

-- Step 2: Check if you have any collections
SELECT '=== COLLECTIONS CHECK ===' as section;

SELECT 
  id,
  name,
  description,
  created_by,
  is_public,
  collection_type,
  created_at,
  updated_at
FROM collections 
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Check collection members
SELECT '=== COLLECTION MEMBERS CHECK ===' as section;

SELECT 
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

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
SELECT 
  cm.collection_id,
  c.name as collection_name,
  c.description,
  c.is_public,
  c.collection_type,
  cm.role,
  cm.created_at as joined_at
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
WHERE cm.user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
ORDER BY cm.created_at DESC;

-- Step 5: Check collections you created
SELECT '=== YOUR CREATED COLLECTIONS ===' as section;

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
SELECT 
  id,
  name,
  description,
  is_public,
  collection_type,
  created_at
FROM collections 
WHERE created_by = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
ORDER BY created_at DESC;

-- Step 6: Test the pagination function with your user ID
SELECT '=== PAGINATION FUNCTION TEST ===' as section;

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
SELECT 
  id,
  name,
  description,
  created_by,
  is_public,
  collection_type,
  created_at,
  total_count
FROM get_user_collections_paginated(
  'YOUR_USER_ID_HERE'::UUID,  -- Replace with your user ID
  0::INTEGER, 
  20::INTEGER, 
  true::BOOLEAN
);

-- Step 7: Check for any data inconsistencies
SELECT '=== DATA CONSISTENCY CHECK ===' as section;

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

-- Step 8: Check RLS policies
SELECT '=== RLS POLICY CHECK ===' as section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('collections', 'collection_members')
ORDER BY tablename, policyname;

-- Step 9: Test basic queries without functions
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

-- Step 10: Summary
SELECT '=== SUMMARY ===' as section;

SELECT 
  'Collection Data Status' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) > 0
    THEN 'DATA EXISTS - CHECK USER ID AND RLS POLICIES'
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) = 0
    THEN 'COLLECTIONS EXIST BUT NO MEMBERSHIPS'
    WHEN (SELECT COUNT(*) FROM collections) = 0
    THEN 'NO COLLECTIONS IN DATABASE'
    ELSE 'UNKNOWN ISSUE'
  END as result;
