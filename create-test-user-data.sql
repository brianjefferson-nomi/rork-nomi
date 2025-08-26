-- =====================================================
-- CREATE TEST USER DATA
-- =====================================================

-- Step 1: Check current data status
SELECT '=== CURRENT DATA STATUS ===' as section;

SELECT 
  'Current data counts' as check_type,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM collections) as total_collections,
  (SELECT COUNT(*) FROM restaurants) as total_restaurants,
  (SELECT COUNT(*) FROM collection_members) as total_memberships;

-- Step 2: Create test user if none exists
SELECT '=== CREATING TEST USER ===' as section;

DO $$
DECLARE
    test_user_id UUID;
    test_user_exists BOOLEAN;
BEGIN
    -- Check if any users exist
    SELECT EXISTS(SELECT 1 FROM users LIMIT 1) INTO test_user_exists;
    
    IF NOT test_user_exists THEN
        -- Create a test user
        INSERT INTO users (id, name, email, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Test User',
            'test@example.com',
            NOW(),
            NOW()
        ) RETURNING id INTO test_user_id;
        
        RAISE NOTICE 'Created test user with ID: %', test_user_id;
    ELSE
        RAISE NOTICE 'Users already exist, skipping user creation';
    END IF;
END $$;

-- Step 3: Create test restaurants if none exist
SELECT '=== CREATING TEST RESTAURANTS ===' as section;

DO $$
DECLARE
    test_restaurant_count INTEGER;
    test_restaurant_id UUID;
BEGIN
    -- Check if any restaurants exist
    SELECT COUNT(*) INTO test_restaurant_count FROM restaurants;
    
    IF test_restaurant_count = 0 THEN
        -- Create test restaurants
        INSERT INTO restaurants (id, restaurant_code, name, cuisine, price_range, address, created_at, updated_at)
        VALUES 
            (gen_random_uuid(), 'REST001', 'Pizza Palace', 'Italian', '$$', '123 Main St', NOW(), NOW()),
            (gen_random_uuid(), 'REST002', 'Sushi Express', 'Japanese', '$$$', '456 Oak Ave', NOW(), NOW()),
            (gen_random_uuid(), 'REST003', 'Burger Joint', 'American', '$', '789 Pine Rd', NOW(), NOW()),
            (gen_random_uuid(), 'REST004', 'Taco Town', 'Mexican', '$', '321 Elm St', NOW(), NOW()),
            (gen_random_uuid(), 'REST005', 'Steak House', 'American', '$$$$', '654 Maple Dr', NOW(), NOW());
        
        RAISE NOTICE 'Created 5 test restaurants';
    ELSE
        RAISE NOTICE 'Restaurants already exist (%), skipping restaurant creation', test_restaurant_count;
    END IF;
END $$;

-- Step 4: Create test collections if none exist
SELECT '=== CREATING TEST COLLECTIONS ===' as section;

DO $$
DECLARE
    test_collection_count INTEGER;
    test_user_id UUID;
    test_restaurant_ids UUID[];
    test_collection_id UUID;
BEGIN
    -- Check if any collections exist
    SELECT COUNT(*) INTO test_collection_count FROM collections;
    
    -- Get test user ID
    SELECT id INTO test_user_id FROM users ORDER BY created_at DESC LIMIT 1;
    
    -- Get test restaurant IDs
    SELECT array_agg(id) INTO test_restaurant_ids FROM restaurants LIMIT 3;
    
    IF test_collection_count = 0 AND test_user_id IS NOT NULL AND test_restaurant_ids IS NOT NULL THEN
        -- Create test collections
        INSERT INTO collections (id, name, description, created_by, collection_code, is_public, collection_type, restaurant_ids, created_at, updated_at)
        VALUES 
            (gen_random_uuid(), 'Weekend Brunch', 'Best brunch spots in the city', test_user_id, 'COL001', true, 'public', test_restaurant_ids, NOW(), NOW()),
            (gen_random_uuid(), 'Date Night', 'Romantic restaurants for couples', test_user_id, 'COL002', false, 'private', test_restaurant_ids, NOW(), NOW()),
            (gen_random_uuid(), 'Business Lunch', 'Professional dining options', test_user_id, 'COL003', false, 'private', test_restaurant_ids, NOW(), NOW());
        
        RAISE NOTICE 'Created 3 test collections for user: %', test_user_id;
    ELSE
        RAISE NOTICE 'Collections already exist (%) or missing dependencies, skipping collection creation', test_collection_count;
    END IF;
END $$;

-- Step 5: Create test collection members if none exist
SELECT '=== CREATING TEST MEMBERSHIPS ===' as section;

DO $$
DECLARE
    test_membership_count INTEGER;
    test_user_id UUID;
    test_collection_id UUID;
BEGIN
    -- Check if any memberships exist
    SELECT COUNT(*) INTO test_membership_count FROM collection_members;
    
    -- Get test user and collection IDs
    SELECT id INTO test_user_id FROM users ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO test_collection_id FROM collections ORDER BY created_at DESC LIMIT 1;
    
    IF test_membership_count = 0 AND test_user_id IS NOT NULL AND test_collection_id IS NOT NULL THEN
        -- Create test membership
        INSERT INTO collection_members (collection_id, user_id, role, created_at)
        VALUES (test_collection_id, test_user_id, 'member', NOW());
        
        RAISE NOTICE 'Created test membership for user % in collection %', test_user_id, test_collection_id;
    ELSE
        RAISE NOTICE 'Memberships already exist (%) or missing dependencies, skipping membership creation', test_membership_count;
    END IF;
END $$;

-- Step 6: Create test votes if none exist
SELECT '=== CREATING TEST VOTES ===' as section;

DO $$
DECLARE
    test_vote_count INTEGER;
    test_user_id UUID;
    test_collection_id UUID;
    test_restaurant_id UUID;
BEGIN
    -- Check if any votes exist
    SELECT COUNT(*) INTO test_vote_count FROM restaurant_votes;
    
    -- Get test data
    SELECT id INTO test_user_id FROM users ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO test_collection_id FROM collections ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO test_restaurant_id FROM restaurants ORDER BY created_at DESC LIMIT 1;
    
    IF test_vote_count = 0 AND test_user_id IS NOT NULL AND test_collection_id IS NOT NULL AND test_restaurant_id IS NOT NULL THEN
        -- Create test votes
        INSERT INTO restaurant_votes (restaurant_id, user_id, collection_id, vote, reason, created_at)
        VALUES 
            (test_restaurant_id, test_user_id, test_collection_id, 'like'::vote_type, 'Great food and atmosphere!', NOW() - INTERVAL '2 days'),
            (test_restaurant_id, test_user_id, test_collection_id, 'dislike'::vote_type, 'Not my favorite', NOW() - INTERVAL '1 day');
        
        RAISE NOTICE 'Created test votes for user % in collection %', test_user_id, test_collection_id;
    ELSE
        RAISE NOTICE 'Votes already exist (%) or missing dependencies, skipping vote creation', test_vote_count;
    END IF;
END $$;

-- Step 7: Create test discussions if none exist
SELECT '=== CREATING TEST DISCUSSIONS ===' as section;

DO $$
DECLARE
    test_discussion_count INTEGER;
    test_user_id UUID;
    test_collection_id UUID;
    test_restaurant_id UUID;
BEGIN
    -- Check if any discussions exist
    SELECT COUNT(*) INTO test_discussion_count FROM restaurant_discussions;
    
    -- Get test data
    SELECT id INTO test_user_id FROM users ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO test_collection_id FROM collections ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO test_restaurant_id FROM restaurants ORDER BY created_at DESC LIMIT 1;
    
    IF test_discussion_count = 0 AND test_user_id IS NOT NULL AND test_collection_id IS NOT NULL AND test_restaurant_id IS NOT NULL THEN
        -- Create test discussions
        INSERT INTO restaurant_discussions (restaurant_id, user_id, collection_id, message, created_at)
        VALUES 
            (test_restaurant_id, test_user_id, test_collection_id, 'Amazing place! Highly recommend.', NOW() - INTERVAL '3 days'),
            (test_restaurant_id, test_user_id, test_collection_id, 'Good for casual dining.', NOW() - INTERVAL '1 day');
        
        RAISE NOTICE 'Created test discussions for user % in collection %', test_user_id, test_collection_id;
    ELSE
        RAISE NOTICE 'Discussions already exist (%) or missing dependencies, skipping discussion creation', test_discussion_count;
    END IF;
END $$;

-- Step 8: Verify the test data
SELECT '=== VERIFICATION ===' as section;

SELECT 
  'Final data counts' as check_type,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM collections) as total_collections,
  (SELECT COUNT(*) FROM restaurants) as total_restaurants,
  (SELECT COUNT(*) FROM collection_members) as total_memberships,
  (SELECT COUNT(*) FROM restaurant_votes) as total_votes,
  (SELECT COUNT(*) FROM restaurant_discussions) as total_discussions;

-- Show the test user
SELECT 
  'Test user info' as info,
  id,
  name,
  email,
  created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 1;

-- Show the test collections
SELECT 
  'Test collections' as info,
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
LIMIT 3;

-- Show the test restaurants
SELECT 
  'Test restaurants' as info,
  id,
  restaurant_code,
  name,
  cuisine,
  price_range,
  created_at
FROM restaurants 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 9: Test the getUserPlans function with the new data
SELECT '=== TESTING GETUSERPLANS ===' as section;

WITH user_collections AS (
  -- Collections created by test user
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
  
  -- Collections where test user is a member
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
  'getUserPlans test result' as info,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE source = 'created') as collections_created,
  COUNT(*) FILTER (WHERE source = 'member') as collections_member,
  COUNT(*) FILTER (WHERE source = 'public') as public_collections
FROM user_collections;

-- Step 10: Summary
SELECT '=== SUMMARY ===' as section;

SELECT 
  'Test Data Creation Summary' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM users) > 0 
    AND (SELECT COUNT(*) FROM collections) > 0
    AND (SELECT COUNT(*) FROM restaurants) > 0
    AND (SELECT COUNT(*) FROM collection_members) > 0
    THEN 'TEST DATA CREATED SUCCESSFULLY - USER SHOULD NOW SEE COLLECTIONS'
    WHEN (SELECT COUNT(*) FROM users) > 0 
    AND (SELECT COUNT(*) FROM collections) > 0
    AND (SELECT COUNT(*) FROM restaurants) > 0
    THEN 'USERS, COLLECTIONS, AND RESTAURANTS EXIST - CHECK MEMBERSHIPS'
    WHEN (SELECT COUNT(*) FROM users) > 0 
    AND (SELECT COUNT(*) FROM collections) > 0
    THEN 'USERS AND COLLECTIONS EXIST - CHECK RESTAURANTS'
    WHEN (SELECT COUNT(*) FROM users) > 0
    THEN 'USERS EXIST - CHECK COLLECTIONS'
    ELSE 'NO DATA CREATED - CHECK FOR ERRORS'
  END as result;
