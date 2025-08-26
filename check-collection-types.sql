-- =====================================================
-- CHECK COLLECTION TYPES AND MEMBER COUNTS
-- =====================================================

-- Step 1: Check all collections and their types
SELECT '=== COLLECTION TYPES ===' as section;

SELECT 
  id,
  name,
  is_public,
  collection_type,
  created_by,
  created_at,
  CASE 
    WHEN is_public = true THEN 'public'
    WHEN collection_type = 'shared' THEN 'shared'
    ELSE 'private'
  END as inferred_type
FROM collections
ORDER BY created_at DESC;

-- Step 2: Check member counts for each collection
SELECT '=== COLLECTION MEMBER COUNTS ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  c.is_public,
  c.collection_type,
  COUNT(cm.user_id) as member_count,
  CASE 
    WHEN c.is_public = true THEN 'public'
    WHEN COUNT(cm.user_id) > 1 THEN 'shared'
    ELSE 'private'
  END as should_be_type
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name, c.is_public, c.collection_type
ORDER BY member_count DESC;

-- Step 3: Check which collections have votes
SELECT '=== COLLECTIONS WITH VOTES ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  c.is_public,
  c.collection_type,
  COUNT(rv.id) as vote_count,
  COUNT(*) FILTER (WHERE rv.vote = 'like') as likes,
  COUNT(*) FILTER (WHERE rv.vote = 'dislike') as dislikes,
  COUNT(DISTINCT rv.user_id) as unique_voters
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
GROUP BY c.id, c.name, c.is_public, c.collection_type
HAVING COUNT(rv.id) > 0
ORDER BY vote_count DESC;

-- Step 4: Check which collections have comments
SELECT '=== COLLECTIONS WITH COMMENTS ===' as section;

SELECT 
  c.id as collection_id,
  c.name as collection_name,
  c.is_public,
  c.collection_type,
  COUNT(rd.id) as comment_count,
  COUNT(DISTINCT rd.user_id) as unique_commenters
FROM collections c
LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
GROUP BY c.id, c.name, c.is_public, c.collection_type
HAVING COUNT(rd.id) > 0
ORDER BY comment_count DESC;

-- Step 5: Summary of what should be visible
SELECT '=== SUMMARY ===' as section;

SELECT 
  'Collection Visibility Summary' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM restaurant_votes) > 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'VOTES AND COMMENTS EXIST - CHECK COLLECTION TYPES'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) > 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'VOTES EXIST BUT NO COMMENTS'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'COMMENTS EXIST BUT NO VOTES'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'NO VOTES OR COMMENTS - NEED TEST DATA'
    ELSE 'UNKNOWN STATUS'
  END as result;

-- Step 6: Check if any collections should show voting data
SELECT '=== COLLECTIONS THAT SHOULD SHOW VOTING ===' as section;

SELECT 
  c.name as collection_name,
  c.is_public,
  c.collection_type,
  COUNT(cm.user_id) as member_count,
  COUNT(rv.id) as vote_count,
  COUNT(rd.id) as comment_count,
  CASE 
    WHEN COUNT(cm.user_id) > 1 THEN 'SHARED - SHOULD SHOW VOTING'
    WHEN COUNT(rv.id) > 0 OR COUNT(rd.id) > 0 THEN 'HAS DATA - SHOULD SHOW VOTING'
    ELSE 'NO DATA - WONT SHOW VOTING'
  END as voting_visibility
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
GROUP BY c.id, c.name, c.is_public, c.collection_type
ORDER BY vote_count DESC, comment_count DESC;
