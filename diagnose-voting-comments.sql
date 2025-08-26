-- =====================================================
-- DIAGNOSE VOTING AND COMMENTS ISSUES
-- =====================================================

-- Step 1: Check if there are any votes in the database
SELECT '=== VOTES CHECK ===' as section;

SELECT 
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote = 'like') as total_likes,
  COUNT(*) FILTER (WHERE vote = 'dislike') as total_dislikes,
  COUNT(DISTINCT user_id) as unique_voters,
  COUNT(DISTINCT collection_id) as collections_with_votes
FROM restaurant_votes;

-- Step 2: Check if there are any comments/discussions
SELECT '=== COMMENTS CHECK ===' as section;

SELECT 
  COUNT(*) as total_comments,
  COUNT(DISTINCT user_id) as unique_commenters,
  COUNT(DISTINCT collection_id) as collections_with_comments
FROM restaurant_discussions;

-- Step 3: Check specific collection votes
SELECT '=== COLLECTION VOTES DETAIL ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  COUNT(rv.id) as total_votes,
  COUNT(*) FILTER (WHERE rv.vote = 'like') as likes,
  COUNT(*) FILTER (WHERE rv.vote = 'dislike') as dislikes,
  COUNT(DISTINCT rv.user_id) as unique_voters
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
GROUP BY c.id, c.name
HAVING COUNT(rv.id) > 0
ORDER BY total_votes DESC
LIMIT 10;

-- Step 4: Check specific collection comments
SELECT '=== COLLECTION COMMENTS DETAIL ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  COUNT(rd.id) as total_comments,
  COUNT(DISTINCT rd.user_id) as unique_commenters
FROM collections c
LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
GROUP BY c.id, c.name
HAVING COUNT(rd.id) > 0
ORDER BY total_comments DESC
LIMIT 10;

-- Step 5: Check restaurant votes
SELECT '=== RESTAURANT VOTES ===' as section;

SELECT 
  rv.restaurant_id,
  r.name as restaurant_name,
  rv.collection_id,
  c.name as collection_name,
  rv.vote,
  u.name as voter_name,
  rv.created_at
FROM restaurant_votes rv
JOIN restaurants r ON rv.restaurant_id = r.id
JOIN collections c ON rv.collection_id = c.id
JOIN users u ON rv.user_id = u.id
ORDER BY rv.created_at DESC
LIMIT 10;

-- Step 6: Check restaurant comments
SELECT '=== RESTAURANT COMMENTS ===' as section;

SELECT 
  rd.restaurant_id,
  r.name as restaurant_name,
  rd.collection_id,
  c.name as collection_name,
  rd.message,
  u.name as commenter_name,
  rd.created_at
FROM restaurant_discussions rd
JOIN restaurants r ON rd.restaurant_id = r.id
JOIN collections c ON rd.collection_id = c.id
JOIN users u ON rd.user_id = u.id
ORDER BY rd.created_at DESC
LIMIT 10;

-- Step 7: Check if restaurants exist in collections
SELECT '=== COLLECTION RESTAURANTS ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  c.restaurant_ids,
  array_length(c.restaurant_ids, 1) as restaurant_count
FROM collections c
WHERE c.restaurant_ids IS NOT NULL
ORDER BY restaurant_count DESC
LIMIT 10;

-- Step 8: Check if restaurants in collections have votes
SELECT '=== RESTAURANTS WITH VOTES ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  r.id as restaurant_id,
  r.name as restaurant_name,
  COUNT(rv.id) as vote_count,
  COUNT(*) FILTER (WHERE rv.vote = 'like') as likes,
  COUNT(*) FILTER (WHERE rv.vote = 'dislike') as dislikes
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
JOIN restaurants r ON r.id = restaurant_id::UUID
LEFT JOIN restaurant_votes rv ON r.id = rv.restaurant_id AND c.id = rv.collection_id
GROUP BY c.id, c.name, r.id, r.name
HAVING COUNT(rv.id) > 0
ORDER BY vote_count DESC
LIMIT 10;

-- Step 9: Check if restaurants in collections have comments
SELECT '=== RESTAURANTS WITH COMMENTS ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  r.id as restaurant_id,
  r.name as restaurant_name,
  COUNT(rd.id) as comment_count
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
JOIN restaurants r ON r.id = restaurant_id::UUID
LEFT JOIN restaurant_discussions rd ON r.id = rd.restaurant_id AND c.id = rd.collection_id
GROUP BY c.id, c.name, r.id, r.name
HAVING COUNT(rd.id) > 0
ORDER BY comment_count DESC
LIMIT 10;

-- Step 10: Test the ranking function
SELECT '=== RANKING FUNCTION TEST ===' as section;

-- Test with a specific collection (replace with actual collection ID)
SELECT 
  'Ranking function test' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM collections LIMIT 1
    ) 
    THEN 'COLLECTIONS EXIST - CHECK RANKING LOGIC'
    ELSE 'NO COLLECTIONS TO TEST'
  END as test_result;

-- Step 11: Check for data inconsistencies
SELECT '=== DATA INCONSISTENCIES ===' as section;

-- Check for votes without valid restaurants
SELECT 
  'Votes without valid restaurants' as issue,
  COUNT(*) as count
FROM restaurant_votes rv
LEFT JOIN restaurants r ON rv.restaurant_id = r.id
WHERE r.id IS NULL;

-- Check for votes without valid collections
SELECT 
  'Votes without valid collections' as issue,
  COUNT(*) as count
FROM restaurant_votes rv
LEFT JOIN collections c ON rv.collection_id = c.id
WHERE c.id IS NULL;

-- Check for comments without valid restaurants
SELECT 
  'Comments without valid restaurants' as issue,
  COUNT(*) as count
FROM restaurant_discussions rd
LEFT JOIN restaurants r ON rd.restaurant_id = r.id
WHERE r.id IS NULL;

-- Check for comments without valid collections
SELECT 
  'Comments without valid collections' as issue,
  COUNT(*) as count
FROM restaurant_discussions rd
LEFT JOIN collections c ON rd.collection_id = c.id
WHERE c.id IS NULL;

-- Step 12: Summary
SELECT '=== SUMMARY ===' as section;

SELECT 
  'Voting and Comments Status' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM restaurant_votes) > 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'DATA EXISTS - CHECK FRONTEND INTEGRATION'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) > 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'VOTES EXIST BUT NO COMMENTS'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'COMMENTS EXIST BUT NO VOTES'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'NO VOTES OR COMMENTS - NEED TEST DATA'
    ELSE 'UNKNOWN ISSUE'
  END as result;
