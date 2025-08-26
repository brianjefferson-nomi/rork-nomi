-- =====================================================
-- ADD TEST VOTING AND COMMENT DATA
-- =====================================================

-- Step 1: Check if we have any data to work with
SELECT '=== CHECKING EXISTING DATA ===' as section;

SELECT 
  (SELECT COUNT(*) FROM collections) as total_collections,
  (SELECT COUNT(*) FROM restaurants) as total_restaurants,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM restaurant_votes) as total_votes,
  (SELECT COUNT(*) FROM restaurant_discussions) as total_comments;

-- Step 2: Get sample data for testing
SELECT '=== GETTING SAMPLE DATA ===' as section;

-- Get first collection
SELECT 
  'First collection' as info,
  id as collection_id,
  name as collection_name,
  restaurant_ids
FROM collections 
LIMIT 1;

-- Get first user
SELECT 
  'First user' as info,
  id as user_id,
  name as user_name,
  email
FROM users 
LIMIT 1;

-- Get first restaurant
SELECT 
  'First restaurant' as info,
  id as restaurant_id,
  name as restaurant_name
FROM restaurants 
LIMIT 1;

-- Step 3: Add test votes (only if no votes exist)
SELECT '=== ADDING TEST VOTES ===' as section;

-- Check if votes exist
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    THEN 'NO VOTES - WILL ADD TEST DATA'
    ELSE 'VOTES EXIST - SKIPPING TEST DATA'
  END as vote_status;

-- Add test votes if none exist
INSERT INTO restaurant_votes (restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
  r.id as restaurant_id,
  u.id as user_id,
  c.id as collection_id,
  CASE 
    WHEN random() > 0.5 THEN 'like'::vote_type
    ELSE 'dislike'::vote_type
  END as vote,
  CASE 
    WHEN random() > 0.5 THEN 'Great food!'::text
    ELSE 'Not my favorite'::text
  END as reason,
  NOW() - (random() * interval '7 days') as created_at
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
JOIN restaurants r ON r.id = restaurant_id::UUID
CROSS JOIN users u
WHERE (SELECT COUNT(*) FROM restaurant_votes) = 0
  AND c.restaurant_ids IS NOT NULL
  AND array_length(c.restaurant_ids, 1) > 0
LIMIT 10;

-- Step 4: Add test comments (only if no comments exist)
SELECT '=== ADDING TEST COMMENTS ===' as section;

-- Check if comments exist
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM restaurant_discussions) = 0 
    THEN 'NO COMMENTS - WILL ADD TEST DATA'
    ELSE 'COMMENTS EXIST - SKIPPING TEST DATA'
  END as comment_status;

-- Add test comments if none exist
INSERT INTO restaurant_discussions (restaurant_id, user_id, collection_id, message, created_at)
SELECT 
  r.id as restaurant_id,
  u.id as user_id,
  c.id as collection_id,
  CASE 
    WHEN random() > 0.7 THEN 'Amazing atmosphere and great service!'
    WHEN random() > 0.5 THEN 'The food was delicious, highly recommend!'
    WHEN random() > 0.3 THEN 'Good place for a casual dinner.'
    ELSE 'Nice restaurant, will visit again.'
  END as message,
  NOW() - (random() * interval '7 days') as created_at
FROM collections c
CROSS JOIN LATERAL unnest(c.restaurant_ids) AS restaurant_id
JOIN restaurants r ON r.id = restaurant_id::UUID
CROSS JOIN users u
WHERE (SELECT COUNT(*) FROM restaurant_discussions) = 0
  AND c.restaurant_ids IS NOT NULL
  AND array_length(c.restaurant_ids, 1) > 0
LIMIT 5;

-- Step 5: Verify the test data was added
SELECT '=== VERIFYING TEST DATA ===' as section;

SELECT 
  'Votes after test' as check_type,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote = 'like') as likes,
  COUNT(*) FILTER (WHERE vote = 'dislike') as dislikes
FROM restaurant_votes;

SELECT 
  'Comments after test' as check_type,
  COUNT(*) as total_comments
FROM restaurant_discussions;

-- Step 6: Show sample of added data
SELECT '=== SAMPLE TEST DATA ===' as section;

-- Show sample votes
SELECT 
  'Sample votes' as data_type,
  rv.vote,
  r.name as restaurant_name,
  c.name as collection_name,
  u.name as voter_name,
  rv.reason,
  rv.created_at
FROM restaurant_votes rv
JOIN restaurants r ON rv.restaurant_id = r.id
JOIN collections c ON rv.collection_id = c.id
JOIN users u ON rv.user_id = u.id
ORDER BY rv.created_at DESC
LIMIT 5;

-- Show sample comments
SELECT 
  'Sample comments' as data_type,
  rd.message,
  r.name as restaurant_name,
  c.name as collection_name,
  u.name as commenter_name,
  rd.created_at
FROM restaurant_discussions rd
JOIN restaurants r ON rd.restaurant_id = r.id
JOIN collections c ON rd.collection_id = c.id
JOIN users u ON rd.user_id = u.id
ORDER BY rd.created_at DESC
LIMIT 5;

-- Step 7: Test the ranking function with new data
SELECT '=== TESTING RANKING WITH NEW DATA ===' as section;

-- Test if we can get votes for a collection
SELECT 
  'Collection votes test' as test_name,
  c.name as collection_name,
  COUNT(rv.id) as vote_count,
  COUNT(*) FILTER (WHERE rv.vote = 'like') as likes,
  COUNT(*) FILTER (WHERE rv.vote = 'dislike') as dislikes
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
GROUP BY c.id, c.name
HAVING COUNT(rv.id) > 0
ORDER BY vote_count DESC
LIMIT 3;

-- Step 8: Final status
SELECT '=== FINAL STATUS ===' as section;

SELECT 
  'Test Data Status' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM restaurant_votes) > 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'TEST DATA ADDED SUCCESSFULLY - VOTES AND COMMENTS SHOULD NOW SHOW'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) > 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'VOTES ADDED - COMMENTS STILL MISSING'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) > 0
    THEN 'COMMENTS ADDED - VOTES STILL MISSING'
    WHEN (SELECT COUNT(*) FROM restaurant_votes) = 0 
    AND (SELECT COUNT(*) FROM restaurant_discussions) = 0
    THEN 'NO TEST DATA ADDED - CHECK COLLECTIONS AND RESTAURANTS'
    ELSE 'UNKNOWN STATUS'
  END as result;
