-- Test Voting Functionality
-- This script tests the voting system and adds sample votes to verify functionality

-- First, let's check the current state of voting data
SELECT '=== CURRENT VOTING DATA ===' as info;
SELECT 
    rv.id,
    rv.restaurant_id,
    r.name as restaurant_name,
    rv.user_id,
    rv.collection_id,
    c.name as collection_name,
    rv.vote,
    rv.reason,
    rv.created_at
FROM restaurant_votes rv
JOIN restaurants r ON rv.restaurant_id = r.id
JOIN collections c ON rv.collection_id = c.id
ORDER BY rv.created_at DESC
LIMIT 10;

-- Check if there are any collections with members
SELECT '=== COLLECTIONS WITH MEMBERS ===' as info;
SELECT 
    c.id,
    c.name,
    COUNT(cm.user_id) as member_count
FROM collections c
JOIN collection_members cm ON c.id = cm.collection_id
GROUP BY c.id, c.name
HAVING COUNT(cm.user_id) > 1
ORDER BY member_count DESC;

-- Add test votes to a collection to verify functionality
-- First, let's find a collection with multiple members
WITH test_collection AS (
    SELECT 
        c.id as collection_id,
        c.name as collection_name,
        COUNT(cm.user_id) as member_count
    FROM collections c
    JOIN collection_members cm ON c.id = cm.collection_id
    GROUP BY c.id, c.name
    HAVING COUNT(cm.user_id) > 1
    ORDER BY member_count DESC
    LIMIT 1
),
test_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    ORDER BY RANDOM()
    LIMIT 3
),
test_members AS (
    SELECT cm.user_id, u.name as user_name
    FROM collection_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.collection_id = (SELECT collection_id FROM test_collection)
    ORDER BY RANDOM()
    LIMIT 3
)
SELECT '=== ADDING TEST VOTES ===' as info,
       tc.collection_name,
       tr.name as restaurant_name,
       tm.user_name,
       'like' as vote_type
FROM test_collection tc
CROSS JOIN test_restaurants tr
CROSS JOIN test_members tm;

-- Now actually add the test votes
WITH test_collection AS (
    SELECT 
        c.id as collection_id,
        c.name as collection_name
    FROM collections c
    JOIN collection_members cm ON c.id = cm.collection_id
    GROUP BY c.id, c.name
    HAVING COUNT(cm.user_id) > 1
    ORDER BY COUNT(cm.user_id) DESC
    LIMIT 1
),
test_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    ORDER BY RANDOM()
    LIMIT 3
),
test_members AS (
    SELECT cm.user_id, u.name as user_name
    FROM collection_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.collection_id = (SELECT collection_id FROM test_collection)
    ORDER BY RANDOM()
    LIMIT 3
)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    tr.id,
    tm.user_id,
    tc.collection_id,
    CASE 
        WHEN RANDOM() > 0.5 THEN 'like'
        ELSE 'dislike'
    END,
    CASE 
        WHEN RANDOM() > 0.5 THEN 'Great food and atmosphere!'
        ELSE 'Not my favorite, but okay'
    END,
    NOW() - INTERVAL '1 day' * (RANDOM() * 7)::int
FROM test_collection tc
CROSS JOIN test_restaurants tr
CROSS JOIN test_members tm
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add some discussions as well
WITH test_collection AS (
    SELECT 
        c.id as collection_id,
        c.name as collection_name
    FROM collections c
    JOIN collection_members cm ON c.id = cm.collection_id
    GROUP BY c.id, c.name
    HAVING COUNT(cm.user_id) > 1
    ORDER BY COUNT(cm.user_id) DESC
    LIMIT 1
),
test_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    ORDER BY RANDOM()
    LIMIT 2
),
test_members AS (
    SELECT cm.user_id, u.name as user_name
    FROM collection_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.collection_id = (SELECT collection_id FROM test_collection)
    ORDER BY RANDOM()
    LIMIT 2
)
INSERT INTO restaurant_discussions (id, restaurant_id, user_id, collection_id, message, created_at)
SELECT 
    gen_random_uuid(),
    tr.id,
    tm.user_id,
    tc.collection_id,
    CASE 
        WHEN RANDOM() > 0.5 THEN 'I really enjoyed the food here!'
        ELSE 'The service was a bit slow but the food was good.'
    END,
    NOW() - INTERVAL '1 day' * (RANDOM() * 5)::int
FROM test_collection tc
CROSS JOIN test_restaurants tr
CROSS JOIN test_members tm
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Verify the test votes were added
SELECT '=== VERIFICATION: TEST VOTES ADDED ===' as info;
SELECT 
    rv.id,
    r.name as restaurant_name,
    rv.user_id,
    u.name as user_name,
    c.name as collection_name,
    rv.vote,
    rv.reason,
    rv.created_at
FROM restaurant_votes rv
JOIN restaurants r ON rv.restaurant_id = r.id
JOIN users u ON rv.user_id = u.id
JOIN collections c ON rv.collection_id = c.id
WHERE rv.created_at > NOW() - INTERVAL '1 hour'
ORDER BY rv.created_at DESC;

-- Check the voting summary for collections
SELECT '=== VOTING SUMMARY BY COLLECTION ===' as info;
SELECT 
    c.name as collection_name,
    COUNT(rv.id) as total_votes,
    COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) as likes,
    COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) as dislikes,
    COUNT(DISTINCT rv.user_id) as unique_voters,
    COUNT(DISTINCT rv.restaurant_id) as restaurants_voted_on
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
GROUP BY c.id, c.name
ORDER BY total_votes DESC;

-- Check discussion summary
SELECT '=== DISCUSSION SUMMARY BY COLLECTION ===' as info;
SELECT 
    c.name as collection_name,
    COUNT(rd.id) as total_discussions,
    COUNT(DISTINCT rd.user_id) as unique_commenters,
    COUNT(DISTINCT rd.restaurant_id) as restaurants_discussed
FROM collections c
LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
GROUP BY c.id, c.name
ORDER BY total_discussions DESC;
