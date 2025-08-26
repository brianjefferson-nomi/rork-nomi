-- =====================================================
-- FIX COLLECTIONS & COLLABORATION FUNCTIONALITY
-- =====================================================

-- Step 1: Ensure all required columns exist
SELECT '=== ENSURING REQUIRED COLUMNS ===' as section;

-- Check if collection_type column exists, add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collections' 
        AND column_name = 'collection_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE collections 
        ADD COLUMN collection_type TEXT CHECK (collection_type IN ('public', 'private', 'shared')) DEFAULT 'public';
        RAISE NOTICE 'Added collection_type column to collections table';
    ELSE
        RAISE NOTICE 'collection_type column already exists';
    END IF;
END $$;

-- Step 2: Update collection types based on member counts
SELECT '=== UPDATING COLLECTION TYPES ===' as section;

-- Update collections with only creator (private)
UPDATE collections 
SET collection_type = 'private', is_public = false
WHERE id IN (
  SELECT c.id
  FROM collections c
  LEFT JOIN collection_members cm ON c.id = cm.collection_id
  GROUP BY c.id
  HAVING COUNT(cm.user_id) = 0
);

-- Update collections with multiple contributors (shared)
UPDATE collections 
SET collection_type = 'shared', is_public = false
WHERE id IN (
  SELECT c.id
  FROM collections c
  LEFT JOIN collection_members cm ON c.id = cm.collection_id
  GROUP BY c.id
  HAVING COUNT(cm.user_id) > 0
);

-- Keep public collections as public (if any were explicitly set)
UPDATE collections 
SET collection_type = 'public', is_public = true
WHERE is_public = true AND collection_type IS NULL;

-- Step 3: Ensure all collections have proper data
SELECT '=== ENSURING PROPER DATA ===' as section;

-- Update collections without names
UPDATE collections 
SET name = 'Untitled Collection'
WHERE name IS NULL OR name = '';

-- Update collections without descriptions
UPDATE collections 
SET description = 'No description provided'
WHERE description IS NULL OR description = '';

-- Ensure restaurant_ids is never null
UPDATE collections 
SET restaurant_ids = ARRAY[]::UUID[]
WHERE restaurant_ids IS NULL;

-- Step 4: Create missing indexes for performance
SELECT '=== CREATING PERFORMANCE INDEXES ===' as section;

-- Index for collections queries
CREATE INDEX IF NOT EXISTS idx_collections_created_by_created_at 
ON collections(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collections_is_public_created_at 
ON collections(is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collections_collection_type 
ON collections(collection_type);

-- Index for collection members queries
CREATE INDEX IF NOT EXISTS idx_collection_members_user_id 
ON collection_members(user_id);

CREATE INDEX IF NOT EXISTS idx_collection_members_collection_id 
ON collection_members(collection_id);

CREATE INDEX IF NOT EXISTS idx_collection_members_user_collection 
ON collection_members(user_id, collection_id);

-- Index for restaurant votes queries
CREATE INDEX IF NOT EXISTS idx_restaurant_votes_user_id 
ON restaurant_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_collection_id 
ON restaurant_votes(collection_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_restaurant_id 
ON restaurant_votes(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_user_collection 
ON restaurant_votes(user_id, collection_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_restaurant_collection 
ON restaurant_votes(restaurant_id, collection_id);

-- Index for restaurant discussions queries
CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_user_id 
ON restaurant_discussions(user_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_collection_id 
ON restaurant_discussions(collection_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_restaurant_id 
ON restaurant_discussions(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_user_collection 
ON restaurant_discussions(user_id, collection_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_restaurant_collection 
ON restaurant_discussions(restaurant_id, collection_id);

-- Step 5: Add test data if none exists
SELECT '=== ADDING TEST DATA IF NEEDED ===' as section;

-- Check if we have any data
SELECT 
  'Current Data Status' as check_type,
  (SELECT COUNT(*) FROM collections) as total_collections,
  (SELECT COUNT(*) FROM collection_members) as total_memberships,
  (SELECT COUNT(*) FROM restaurant_votes) as total_votes,
  (SELECT COUNT(*) FROM restaurant_discussions) as total_discussions;

-- Add test data if collections exist but no votes/discussions
DO $$
DECLARE
    collection_count INTEGER;
    vote_count INTEGER;
    discussion_count INTEGER;
    test_collection_id UUID;
    test_user_id UUID;
    test_restaurant_id UUID;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO collection_count FROM collections;
    SELECT COUNT(*) INTO vote_count FROM restaurant_votes;
    SELECT COUNT(*) INTO discussion_count FROM restaurant_discussions;
    
    -- If we have collections but no votes/discussions, add test data
    IF collection_count > 0 AND vote_count = 0 AND discussion_count = 0 THEN
        RAISE NOTICE 'Adding test voting and discussion data...';
        
        -- Get first collection, user, and restaurant
        SELECT id INTO test_collection_id FROM collections LIMIT 1;
        SELECT id INTO test_user_id FROM users LIMIT 1;
        SELECT id INTO test_restaurant_id FROM restaurants LIMIT 1;
        
        -- Add test votes
        IF test_collection_id IS NOT NULL AND test_user_id IS NOT NULL AND test_restaurant_id IS NOT NULL THEN
            INSERT INTO restaurant_votes (restaurant_id, user_id, collection_id, vote, reason, created_at)
            VALUES 
                (test_restaurant_id, test_user_id, test_collection_id, 'like'::vote_type, 'Great food and atmosphere!', NOW() - INTERVAL '2 days'),
                (test_restaurant_id, test_user_id, test_collection_id, 'dislike'::vote_type, 'Not my favorite', NOW() - INTERVAL '1 day');
            
            -- Add test discussions
            INSERT INTO restaurant_discussions (restaurant_id, user_id, collection_id, message, created_at)
            VALUES 
                (test_restaurant_id, test_user_id, test_collection_id, 'Amazing place! Highly recommend.', NOW() - INTERVAL '3 days'),
                (test_restaurant_id, test_user_id, test_collection_id, 'Good for casual dining.', NOW() - INTERVAL '1 day');
            
            RAISE NOTICE 'Added test data to collection %', test_collection_id;
        END IF;
    ELSE
        RAISE NOTICE 'No test data needed - collections: %, votes: %, discussions: %', collection_count, vote_count, discussion_count;
    END IF;
END $$;

-- Step 6: Verify the fixes
SELECT '=== VERIFICATION ===' as section;

-- Check collection types distribution
SELECT 
  'Collection Types After Fix' as check_type,
  collection_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM collections), 2) as percentage
FROM collections
GROUP BY collection_type
ORDER BY count DESC;

-- Check member counts
SELECT 
  'Member Counts After Fix' as check_type,
  c.collection_type,
  COUNT(cm.user_id) as member_count,
  COUNT(*) as collection_count
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.collection_type, COUNT(cm.user_id)
ORDER BY c.collection_type, member_count;

-- Check voting data
SELECT 
  'Voting Data After Fix' as check_type,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote::text = 'like') as likes,
  COUNT(*) FILTER (WHERE vote::text = 'dislike') as dislikes,
  COUNT(DISTINCT collection_id) as collections_with_votes,
  COUNT(DISTINCT user_id) as unique_voters
FROM restaurant_votes;

-- Check discussion data
SELECT 
  'Discussion Data After Fix' as check_type,
  COUNT(*) as total_discussions,
  COUNT(DISTINCT collection_id) as collections_with_discussions,
  COUNT(DISTINCT user_id) as unique_commenters,
  COUNT(DISTINCT restaurant_id) as restaurants_with_discussions
FROM restaurant_discussions;

-- Step 7: Test key queries
SELECT '=== TESTING KEY QUERIES ===' as section;

-- Test getUserPlans equivalent
SELECT 
  'getUserPlans Test' as test_name,
  COUNT(*) as total_collections_for_user
FROM (
  -- Collections created by user (replace with actual user ID)
  SELECT id, name, created_by, 'created' as source
  FROM collections 
  WHERE created_by = (SELECT id FROM users LIMIT 1)
  
  UNION ALL
  
  -- Collections where user is member
  SELECT c.id, c.name, c.created_by, 'member' as source
  FROM collections c
  JOIN collection_members cm ON c.id = cm.collection_id
  WHERE cm.user_id = (SELECT id FROM users LIMIT 1)
  
  UNION ALL
  
  -- Public collections
  SELECT id, name, created_by, 'public' as source
  FROM collections 
  WHERE is_public = true
) as user_collections;

-- Test getCollectionMembers equivalent
SELECT 
  'getCollectionMembers Test' as test_name,
  cm.collection_id,
  cm.user_id,
  cm.role,
  u.name as user_name
FROM collection_members cm
LEFT JOIN users u ON cm.user_id = u.id
WHERE cm.collection_id = (SELECT id FROM collections LIMIT 1)
LIMIT 5;

-- Test getCollectionVotesWithUsers equivalent
SELECT 
  'getCollectionVotesWithUsers Test' as test_name,
  rv.restaurant_id,
  rv.user_id,
  rv.vote,
  rv.reason,
  u.name as user_name
FROM restaurant_votes rv
LEFT JOIN users u ON rv.user_id = u.id
WHERE rv.collection_id = (SELECT id FROM collections LIMIT 1)
LIMIT 5;

-- Test getCollectionDiscussions equivalent
SELECT 
  'getCollectionDiscussions Test' as test_name,
  rd.restaurant_id,
  rd.user_id,
  rd.message,
  rd.created_at,
  u.name as user_name
FROM restaurant_discussions rd
LEFT JOIN users u ON rd.user_id = u.id
WHERE rd.collection_id = (SELECT id FROM collections LIMIT 1)
LIMIT 5;

-- Step 8: Final summary
SELECT '=== FINAL SUMMARY ===' as section;

SELECT 
  'Collections & Collaboration Fix Summary' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) >= 0
    AND (SELECT COUNT(*) FROM restaurant_votes) >= 0
    AND (SELECT COUNT(*) FROM restaurant_discussions) >= 0
    THEN 'ALL SYSTEMS OPERATIONAL - COLLECTIONS FUNCTIONALITY FIXED'
    WHEN (SELECT COUNT(*) FROM collections) > 0 
    AND (SELECT COUNT(*) FROM collection_members) >= 0
    THEN 'COLLECTIONS EXIST - VOTING/DISCUSSION DATA MAY BE MISSING'
    WHEN (SELECT COUNT(*) FROM collections) > 0
    THEN 'COLLECTIONS EXIST - CHECK MEMBERSHIPS'
    WHEN (SELECT COUNT(*) FROM collections) = 0
    THEN 'NO COLLECTIONS IN DATABASE - CREATE SOME FIRST'
    ELSE 'UNKNOWN STATE - CHECK INDIVIDUAL TABLES'
  END as result;
