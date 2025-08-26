-- =====================================================
-- DIAGNOSE COLLECTION DATA ISSUES
-- =====================================================

-- Step 1: Check if collections exist and have basic data
SELECT '=== COLLECTIONS BASIC DATA ===' as section;

SELECT 
  'Collections overview' as check_type,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE name IS NOT NULL AND name != '') as collections_with_names,
  COUNT(*) FILTER (WHERE description IS NOT NULL AND description != '') as collections_with_descriptions,
  COUNT(*) FILTER (WHERE created_by IS NOT NULL) as collections_with_creators,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) as collections_with_restaurants,
  COUNT(*) FILTER (WHERE is_public = true) as public_collections,
  COUNT(*) FILTER (WHERE is_public = false) as private_collections
FROM collections;

-- Show sample collections with their data
SELECT 
  'Sample collections data' as info,
  id,
  name,
  description,
  created_by,
  is_public,
  collection_type,
  restaurant_ids,
  array_length(restaurant_ids, 1) as restaurant_count,
  created_at
FROM collections
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check if restaurants exist for the collections
SELECT '=== RESTAURANTS FOR COLLECTIONS ===' as section;

-- Check if restaurants referenced in collections actually exist
SELECT 
  'Restaurants referenced in collections' as check_type,
  COUNT(DISTINCT restaurant_id) as total_referenced_restaurants,
  COUNT(DISTINCT restaurant_id) FILTER (WHERE r.id IS NOT NULL) as existing_restaurants,
  COUNT(DISTINCT restaurant_id) FILTER (WHERE r.id IS NULL) as missing_restaurants
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
LEFT JOIN restaurants r ON r.id = restaurant_id::UUID
WHERE c.restaurant_ids IS NOT NULL;

-- Show collections with missing restaurants
SELECT 
  'Collections with missing restaurants' as info,
  c.id as collection_id,
  c.name as collection_name,
  restaurant_id as missing_restaurant_id
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
LEFT JOIN restaurants r ON r.id = restaurant_id::UUID
WHERE c.restaurant_ids IS NOT NULL
AND r.id IS NULL
ORDER BY c.name;

-- Step 3: Check collection members
SELECT '=== COLLECTION MEMBERS ===' as section;

SELECT 
  'Collection members overview' as check_type,
  COUNT(*) as total_memberships,
  COUNT(DISTINCT collection_id) as collections_with_members,
  COUNT(DISTINCT user_id) as users_with_memberships
FROM collection_members;

-- Show collections with their member counts
SELECT 
  'Collections with member counts' as info,
  c.id,
  c.name,
  COUNT(cm.id) as member_count,
  c.is_public,
  c.collection_type
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name, c.is_public, c.collection_type
ORDER BY member_count DESC;

-- Step 4: Check voting data
SELECT '=== VOTING DATA ===' as section;

SELECT 
  'Voting data overview' as check_type,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote::text = 'like') as likes,
  COUNT(*) FILTER (WHERE vote::text = 'dislike') as dislikes,
  COUNT(DISTINCT collection_id) as collections_with_votes,
  COUNT(DISTINCT user_id) as users_who_voted,
  COUNT(DISTINCT restaurant_id) as restaurants_with_votes
FROM restaurant_votes;

-- Show collections with voting activity
SELECT 
  'Collections with voting activity' as info,
  c.id,
  c.name,
  COUNT(rv.id) as total_votes,
  COUNT(*) FILTER (WHERE rv.vote::text = 'like') as likes,
  COUNT(*) FILTER (WHERE rv.vote::text = 'dislike') as dislikes,
  COUNT(DISTINCT rv.user_id) as unique_voters
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
GROUP BY c.id, c.name
HAVING COUNT(rv.id) > 0
ORDER BY total_votes DESC;

-- Step 5: Check discussion data
SELECT '=== DISCUSSION DATA ===' as section;

SELECT 
  'Discussion data overview' as check_type,
  COUNT(*) as total_discussions,
  COUNT(DISTINCT collection_id) as collections_with_discussions,
  COUNT(DISTINCT user_id) as users_who_commented,
  COUNT(DISTINCT restaurant_id) as restaurants_with_discussions
FROM restaurant_discussions;

-- Show collections with discussion activity
SELECT 
  'Collections with discussions' as info,
  c.id,
  c.name,
  COUNT(rd.id) as discussion_count,
  COUNT(DISTINCT rd.user_id) as unique_commenters
FROM collections c
LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
GROUP BY c.id, c.name
HAVING COUNT(rd.id) > 0
ORDER BY discussion_count DESC;

-- Step 6: Test the exact getUserPlans logic
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
    restaurant_ids,
    array_length(restaurant_ids, 1) as restaurant_count
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
    c.restaurant_ids,
    array_length(c.restaurant_ids, 1) as restaurant_count
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
    restaurant_ids,
    array_length(restaurant_ids, 1) as restaurant_count
  FROM collections 
  WHERE is_public = true
)
SELECT 
  'getUserPlans result for recent user' as info,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE source = 'created') as collections_created,
  COUNT(*) FILTER (WHERE source = 'member') as collections_member,
  COUNT(*) FILTER (WHERE source = 'public') as public_collections,
  COUNT(*) FILTER (WHERE restaurant_count > 0) as collections_with_restaurants,
  AVG(restaurant_count) as avg_restaurants_per_collection
FROM user_collections;

-- Show the actual collections the user should see
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
    restaurant_ids,
    array_length(restaurant_ids, 1) as restaurant_count
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
    c.restaurant_ids,
    array_length(c.restaurant_ids, 1) as restaurant_count
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
    restaurant_ids,
    array_length(restaurant_ids, 1) as restaurant_count
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
  restaurant_count,
  restaurant_ids
FROM user_collections
ORDER BY source, name;

-- Step 7: Check for data inconsistencies
SELECT '=== DATA INCONSISTENCIES ===' as section;

-- Collections without names
SELECT 
  'Collections without names' as issue,
  COUNT(*) as count
FROM collections
WHERE name IS NULL OR name = '';

-- Collections without creators
SELECT 
  'Collections without creators' as issue,
  COUNT(*) as count
FROM collections
WHERE created_by IS NULL;

-- Collections with empty restaurant arrays
SELECT 
  'Collections with empty restaurant arrays' as issue,
  COUNT(*) as count
FROM collections
WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) = 0;

-- Orphaned collection members
SELECT 
  'Orphaned collection members' as issue,
  COUNT(*) as count
FROM collection_members cm
LEFT JOIN collections c ON cm.collection_id = c.id
WHERE c.id IS NULL;

-- Orphaned votes
SELECT 
  'Orphaned votes' as issue,
  COUNT(*) as count
FROM restaurant_votes rv
LEFT JOIN collections c ON rv.collection_id = c.id
WHERE c.id IS NULL;

-- Orphaned discussions
SELECT 
  'Orphaned discussions' as issue,
  COUNT(*) as count
FROM restaurant_discussions rd
LEFT JOIN collections c ON rd.collection_id = c.id
WHERE c.id IS NULL;

-- Step 8: Summary and recommendations
SELECT '=== SUMMARY & RECOMMENDATIONS ===' as section;

SELECT 
  'Collection Data Issues Summary' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM collections) = 0 THEN 'NO COLLECTIONS - CREATE COLLECTIONS FIRST'
    WHEN (SELECT COUNT(*) FROM collections WHERE restaurant_ids IS NOT NULL AND array_length(restaurant_ids, 1) > 0) = 0 THEN 'COLLECTIONS EXIST BUT NO RESTAURANTS - ADD RESTAURANTS TO COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM collection_members) = 0 THEN 'NO MEMBERSHIPS - ADD USERS TO COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 THEN 'NO VOTING ACTIVITY - ADD VOTES TO SEE DATA'
    WHEN (SELECT COUNT(*) FROM restaurant_discussions) = 0 THEN 'NO DISCUSSIONS - ADD COMMENTS TO SEE DATA'
    WHEN (SELECT COUNT(*) FROM users) = 0 THEN 'NO USERS - CREATE USERS FIRST'
    ELSE 'DATA EXISTS - CHECK FRONTEND MAPPING OR RLS POLICIES'
  END as result;
