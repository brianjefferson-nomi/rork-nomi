-- =====================================================
-- COMPREHENSIVE COLLECTION & COLLABORATION REVIEW
-- =====================================================

-- Step 1: Check database schema and column names
SELECT '=== DATABASE SCHEMA VERIFICATION ===' as section;

-- Check collections table structure
SELECT 
  'collections' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'collections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check collection_members table structure
SELECT 
  'collection_members' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'collection_members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check restaurant_votes table structure
SELECT 
  'restaurant_votes' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_votes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check restaurant_discussions table structure
SELECT 
  'restaurant_discussions' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_discussions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check data integrity and relationships
SELECT '=== DATA INTEGRITY CHECK ===' as section;

-- Check collections data
SELECT 
  'Collections Data' as check_type,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as collections_with_names,
  COUNT(*) FILTER (WHERE created_by IS NOT NULL) as collections_with_creators,
  COUNT(*) FILTER (WHERE collection_type IS NOT NULL) as collections_with_type,
  COUNT(*) FILTER (WHERE restaurant_ids IS NOT NULL) as collections_with_restaurants
FROM collections;

-- Check collection members data
SELECT 
  'Collection Members Data' as check_type,
  COUNT(*) as total_memberships,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as memberships_with_users,
  COUNT(*) FILTER (WHERE collection_id IS NOT NULL) as memberships_with_collections,
  COUNT(DISTINCT collection_id) as unique_collections_with_members,
  COUNT(DISTINCT user_id) as unique_users_with_memberships
FROM collection_members;

-- Check restaurant votes data
SELECT 
  'Restaurant Votes Data' as check_type,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as votes_with_users,
  COUNT(*) FILTER (WHERE collection_id IS NOT NULL) as votes_with_collections,
  COUNT(*) FILTER (WHERE restaurant_id IS NOT NULL) as votes_with_restaurants,
  COUNT(*) FILTER (WHERE vote = 'like') as total_likes,
  COUNT(*) FILTER (WHERE vote = 'dislike') as total_dislikes
FROM restaurant_votes;

-- Check restaurant discussions data
SELECT 
  'Restaurant Discussions Data' as check_type,
  COUNT(*) as total_discussions,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as discussions_with_users,
  COUNT(*) FILTER (WHERE collection_id IS NOT NULL) as discussions_with_collections,
  COUNT(*) FILTER (WHERE restaurant_id IS NOT NULL) as discussions_with_restaurants,
  COUNT(*) FILTER (WHERE message IS NOT NULL) as discussions_with_messages
FROM restaurant_discussions;

-- Step 3: Check foreign key relationships
SELECT '=== FOREIGN KEY RELATIONSHIPS ===' as section;

-- Check for orphaned collection members
SELECT 
  'Orphaned Collection Members' as issue,
  COUNT(*) as count
FROM collection_members cm
LEFT JOIN collections c ON cm.collection_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned votes
SELECT 
  'Orphaned Restaurant Votes' as issue,
  COUNT(*) as count
FROM restaurant_votes rv
LEFT JOIN collections c ON rv.collection_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned discussions
SELECT 
  'Orphaned Restaurant Discussions' as issue,
  COUNT(*) as count
FROM restaurant_discussions rd
LEFT JOIN collections c ON rd.collection_id = c.id
WHERE c.id IS NULL;

-- Step 4: Test key queries used by the application
SELECT '=== KEY QUERY TESTS ===' as section;

-- Test getUserPlans equivalent query
SELECT 
  'getUserPlans Test' as test_name,
  COUNT(*) as total_collections_for_user
FROM (
  -- Collections created by user
  SELECT id, name, created_by, 'created' as source
  FROM collections 
  WHERE created_by = '11111111-1111-1111-1111-111111111111' -- Replace with actual user ID
  
  UNION ALL
  
  -- Collections where user is member
  SELECT c.id, c.name, c.created_by, 'member' as source
  FROM collections c
  JOIN collection_members cm ON c.id = cm.collection_id
  WHERE cm.user_id = '11111111-1111-1111-1111-111111111111' -- Replace with actual user ID
  
  UNION ALL
  
  -- Public collections
  SELECT id, name, created_by, 'public' as source
  FROM collections 
  WHERE is_public = true
) as user_collections;

-- Test getCollectionMembers equivalent query
SELECT 
  'getCollectionMembers Test' as test_name,
  cm.collection_id,
  cm.user_id,
  cm.role,
  u.name as user_name,
  u.email as user_email
FROM collection_members cm
LEFT JOIN users u ON cm.user_id = u.id
WHERE cm.collection_id = '11111111-1111-1111-1111-111111111111' -- Replace with actual collection ID
LIMIT 5;

-- Test getCollectionVotesWithUsers equivalent query
SELECT 
  'getCollectionVotesWithUsers Test' as test_name,
  rv.restaurant_id,
  rv.user_id,
  rv.vote,
  rv.reason,
  u.name as user_name,
  r.name as restaurant_name
FROM restaurant_votes rv
LEFT JOIN users u ON rv.user_id = u.id
LEFT JOIN restaurants r ON rv.restaurant_id = r.id
WHERE rv.collection_id = '11111111-1111-1111-1111-111111111111' -- Replace with actual collection ID
LIMIT 5;

-- Test getCollectionDiscussions equivalent query
SELECT 
  'getCollectionDiscussions Test' as test_name,
  rd.restaurant_id,
  rd.user_id,
  rd.message,
  rd.created_at,
  u.name as user_name,
  r.name as restaurant_name
FROM restaurant_discussions rd
LEFT JOIN users u ON rd.user_id = u.id
LEFT JOIN restaurants r ON rd.restaurant_id = r.id
WHERE rd.collection_id = '11111111-1111-1111-1111-111111111111' -- Replace with actual collection ID
LIMIT 5;

-- Step 5: Check collection types and visibility logic
SELECT '=== COLLECTION TYPES & VISIBILITY ===' as section;

-- Check collection types distribution
SELECT 
  'Collection Types Distribution' as check_type,
  collection_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM collections), 2) as percentage
FROM collections
GROUP BY collection_type
ORDER BY count DESC;

-- Check is_public vs collection_type consistency
SELECT 
  'is_public vs collection_type Consistency' as check_type,
  is_public,
  collection_type,
  COUNT(*) as count
FROM collections
GROUP BY is_public, collection_type
ORDER BY is_public, collection_type;

-- Check member counts and collection types
SELECT 
  'Member Counts by Collection Type' as check_type,
  c.collection_type,
  COUNT(cm.user_id) as member_count,
  COUNT(*) as collection_count
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.collection_type, COUNT(cm.user_id)
ORDER BY c.collection_type, member_count;

-- Step 6: Check voting and discussion functionality
SELECT '=== VOTING & DISCUSSION FUNCTIONALITY ===' as section;

-- Check collections with voting activity
SELECT 
  'Collections with Voting Activity' as check_type,
  c.name as collection_name,
  c.collection_type,
  COUNT(rv.id) as total_votes,
  COUNT(*) FILTER (WHERE rv.vote = 'like') as likes,
  COUNT(*) FILTER (WHERE rv.vote = 'dislike') as dislikes,
  COUNT(DISTINCT rv.user_id) as unique_voters
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
GROUP BY c.id, c.name, c.collection_type
HAVING COUNT(rv.id) > 0
ORDER BY total_votes DESC;

-- Check collections with discussion activity
SELECT 
  'Collections with Discussion Activity' as check_type,
  c.name as collection_name,
  c.collection_type,
  COUNT(rd.id) as total_discussions,
  COUNT(DISTINCT rd.user_id) as unique_commenters,
  COUNT(DISTINCT rd.restaurant_id) as restaurants_with_discussions
FROM collections c
LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
GROUP BY c.id, c.name, c.collection_type
HAVING COUNT(rd.id) > 0
ORDER BY total_discussions DESC;

-- Step 7: Check for potential issues
SELECT '=== POTENTIAL ISSUES ===' as section;

-- Check for collections without restaurants
SELECT 
  'Collections without Restaurants' as issue,
  COUNT(*) as count
FROM collections
WHERE restaurant_ids IS NULL OR array_length(restaurant_ids, 1) = 0;

-- Check for collections without members (except creator)
SELECT 
  'Collections without Members (except creator)' as issue,
  COUNT(*) as count
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name
HAVING COUNT(cm.user_id) = 0;

-- Check for votes without reasons
SELECT 
  'Votes without Reasons' as issue,
  COUNT(*) as count
FROM restaurant_votes
WHERE reason IS NULL OR reason = '';

-- Check for discussions without messages
SELECT 
  'Discussions without Messages' as issue,
  COUNT(*) as count
FROM restaurant_discussions
WHERE message IS NULL OR message = '';

-- Step 8: Performance check
SELECT '=== PERFORMANCE CHECK ===' as section;

-- Check if indexes exist
SELECT 
  'Index Check' as check_type,
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('collections', 'collection_members', 'restaurant_votes', 'restaurant_discussions')
ORDER BY tablename, indexname;

-- Check index usage
SELECT 
  'Index Usage' as check_type,
  schemaname,
  relname as tablename,
  indexrelname as indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND relname IN ('collections', 'collection_members', 'restaurant_votes', 'restaurant_discussions')
ORDER BY idx_scan DESC;

-- Step 9: Summary and recommendations
SELECT '=== SUMMARY & RECOMMENDATIONS ===' as section;

SELECT 
  'Database Health Summary' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) > 0
    AND (SELECT COUNT(*) FROM restaurant_votes) > 0
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'ALL SYSTEMS OPERATIONAL - DATA EXISTS'
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) > 0
    AND (SELECT COUNT(*) FROM restaurant_votes) = 0
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'COLLECTIONS EXIST BUT NO VOTING/DISCUSSION DATA'
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) = 0
    THEN 'COLLECTIONS EXIST BUT NO MEMBERSHIPS'
    WHEN (SELECT COUNT(*) FROM collections) = 0
    THEN 'NO COLLECTIONS IN DATABASE'
    ELSE 'MIXED STATE - CHECK INDIVIDUAL TABLES'
  END as result;
