-- Add Member Votes for Collaborative Voting
-- This script adds votes from other collection members to create winning restaurants
-- Uses gen_random_uuid() for restaurant_votes IDs and ensures restaurant IDs exist in database

-- First, let's check what collections Sarah is a member of and who else is in them
SELECT '=== COLLECTIONS SARAH IS A MEMBER OF ===' as info;
SELECT 
    c.id as collection_id,
    c.name as collection_name,
    c.created_by as creator_id,
    u.name as creator_name
FROM collections c
JOIN collection_members cm ON c.id = cm.collection_id
JOIN users u ON c.created_by = u.id
WHERE cm.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY c.name;

-- Check who else is in these collections
SELECT '=== OTHER MEMBERS IN SARAH''S COLLECTIONS ===' as info;
SELECT 
    c.name as collection_name,
    cm.user_id,
    u.name as member_name,
    cm.role,
    cm.joined_at
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
JOIN users u ON cm.user_id = u.id
WHERE cm.collection_id IN (
    SELECT DISTINCT cm2.collection_id 
    FROM collection_members cm2 
    WHERE cm2.user_id = '11111111-1111-1111-1111-111111111111'
)
AND cm.user_id != '11111111-1111-1111-1111-111111111111'
ORDER BY c.name, u.name;

-- Get valid restaurant IDs from the database for voting
SELECT '=== GETTING VALID RESTAURANT IDS FOR VOTING ===' as info;
WITH valid_restaurants AS (
    SELECT id, name, cuisine, rating
    FROM restaurants 
    ORDER BY RANDOM()
    LIMIT 20
)
SELECT * FROM valid_restaurants;

-- Now let's add votes from other members to create collaborative scenarios
-- We'll use restaurants that actually exist in the database

-- Collection 1: Date Night Spots - Add votes from other members
-- Get some restaurants for Date Night collection
WITH date_night_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    WHERE cuisine ILIKE '%italian%' OR cuisine ILIKE '%french%' OR cuisine ILIKE '%steakhouse%' OR name ILIKE '%romantic%'
    ORDER BY RANDOM()
    LIMIT 3
)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'like',
    'Perfect for romantic dates',
    NOW() - INTERVAL '4 days'
FROM date_night_restaurants r
WHERE r.id = (SELECT id FROM date_night_restaurants LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add more votes for the same restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'like',
    'Excellent choice for date night',
    NOW() - INTERVAL '3 days'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'like',
    'Great romantic spot',
    NOW() - INTERVAL '2 days'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 2: Best Brunch - Add votes from other members
-- Get some restaurants for Brunch collection
WITH brunch_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    WHERE cuisine ILIKE '%breakfast%' OR cuisine ILIKE '%brunch%' OR cuisine ILIKE '%cafe%' OR name ILIKE '%pancake%' OR name ILIKE '%coffee%'
    ORDER BY RANDOM()
    LIMIT 3
)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'like',
    'Amazing brunch menu indeed',
    NOW() - INTERVAL '3 days'
FROM brunch_restaurants r
WHERE r.id = (SELECT id FROM brunch_restaurants LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add more votes for the same brunch restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'like',
    'Best brunch spot in town',
    NOW() - INTERVAL '2 days'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add a second brunch restaurant (using direct subquery instead of CTE)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'like',
    'Pancakes are incredible',
    NOW() - INTERVAL '2 days'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%breakfast%' OR cuisine ILIKE '%brunch%' OR cuisine ILIKE '%cafe%' OR name ILIKE '%pancake%' OR name ILIKE '%coffee%'
    ORDER BY RANDOM()
    OFFSET 1 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'like',
    'Best pancakes ever',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' 
    AND user_id = '33333333-3333-3333-3333-333333333333'
    AND reason = 'Pancakes are incredible'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 3: Italian Food Lovers - Add votes from other members
-- Get some restaurants for Italian collection
WITH italian_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    WHERE cuisine ILIKE '%italian%' OR name ILIKE '%pizza%' OR name ILIKE '%pasta%'
    ORDER BY RANDOM()
    LIMIT 3
)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'like',
    'Authentic Italian experience',
    NOW() - INTERVAL '1 day'
FROM italian_restaurants r
WHERE r.id = (SELECT id FROM italian_restaurants LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add more votes for the same Italian restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'like',
    'Best pasta in the city',
    NOW() - INTERVAL '12 hours'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add a second Italian restaurant (using direct subquery instead of CTE)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'like',
    'Incredible pizza',
    NOW() - INTERVAL '12 hours'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%italian%' OR name ILIKE '%pizza%' OR name ILIKE '%pasta%'
    ORDER BY RANDOM()
    OFFSET 1 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'like',
    'Amazing Italian food',
    NOW() - INTERVAL '6 hours'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa' 
    AND user_id = '33333333-3333-3333-3333-333333333333'
    AND reason = 'Incredible pizza'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 4: Sushi Enthusiasts - Add votes from other members
-- Get some restaurants for Sushi collection
WITH sushi_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    WHERE cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' OR name ILIKE '%sushi%' OR name ILIKE '%japanese%'
    ORDER BY RANDOM()
    LIMIT 3
)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'like',
    'Fresh and delicious sushi',
    NOW() - INTERVAL '2 days'
FROM sushi_restaurants r
WHERE r.id = (SELECT id FROM sushi_restaurants LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add more votes for the same sushi restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'like',
    'Best sushi in the area',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add a second sushi restaurant (using direct subquery instead of CTE)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'like',
    'Amazing sashimi',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' OR name ILIKE '%sushi%' OR name ILIKE '%japanese%'
    ORDER BY RANDOM()
    OFFSET 1 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'like',
    'Incredible Japanese cuisine',
    NOW() - INTERVAL '12 hours'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb' 
    AND user_id = '33333333-3333-3333-3333-333333333333'
    AND reason = 'Amazing sashimi'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 5: Fine Dining Group - Add votes from other members
-- Get some restaurants for Fine Dining collection
WITH fine_dining_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    WHERE cuisine ILIKE '%fine dining%' OR cuisine ILIKE '%steakhouse%' OR cuisine ILIKE '%french%' OR name ILIKE '%steak%' OR name ILIKE '%fine%'
    ORDER BY RANDOM()
    LIMIT 3
)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
    'like',
    'Exquisite dining experience',
    NOW() - INTERVAL '3 days'
FROM fine_dining_restaurants r
WHERE r.id = (SELECT id FROM fine_dining_restaurants LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add more votes for the same fine dining restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
    'like',
    'Perfect for special occasions',
    NOW() - INTERVAL '2 days'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add a second fine dining restaurant (using direct subquery instead of CTE)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
    'like',
    'Amazing steak',
    NOW() - INTERVAL '2 days'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%fine dining%' OR cuisine ILIKE '%steakhouse%' OR cuisine ILIKE '%french%' OR name ILIKE '%steak%' OR name ILIKE '%fine%'
    ORDER BY RANDOM()
    OFFSET 1 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
    'like',
    'Outstanding service and food',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc' 
    AND user_id = '33333333-3333-3333-3333-333333333333'
    AND reason = 'Amazing steak'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add some disagreement votes to make it more realistic
-- Collection 1: Date Night - Add a dislike
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'dislike',
    'Too expensive for what you get',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%italian%' OR cuisine ILIKE '%french%' OR cuisine ILIKE '%steakhouse%' OR name ILIKE '%romantic%'
    ORDER BY RANDOM()
    OFFSET 2 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 2: Brunch - Add a dislike
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'dislike',
    'Too crowded on weekends',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%breakfast%' OR cuisine ILIKE '%brunch%' OR cuisine ILIKE '%cafe%' OR name ILIKE '%pancake%' OR name ILIKE '%coffee%'
    ORDER BY RANDOM()
    OFFSET 2 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 3: Italian - Add a dislike
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dislike',
    'Portions are too small',
    NOW() - INTERVAL '6 hours'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%italian%' OR name ILIKE '%pizza%' OR name ILIKE '%pasta%'
    ORDER BY RANDOM()
    OFFSET 2 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 4: Sushi - Add a dislike
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'dislike',
    'Not fresh enough',
    NOW() - INTERVAL '12 hours'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' OR name ILIKE '%sushi%' OR name ILIKE '%japanese%'
    ORDER BY RANDOM()
    OFFSET 2 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 5: Fine Dining - Add a dislike
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '22222222-2222-2222-2222-222222222222',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
    'dislike',
    'Overpriced for the quality',
    NOW() - INTERVAL '1 day'
FROM restaurants r
WHERE r.id = (
    SELECT id 
    FROM restaurants 
    WHERE cuisine ILIKE '%fine dining%' OR cuisine ILIKE '%steakhouse%' OR cuisine ILIKE '%french%' OR name ILIKE '%steak%' OR name ILIKE '%fine%'
    ORDER BY RANDOM()
    OFFSET 2 LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Update collection likes counts based on new votes
UPDATE collections 
SET likes = (
    SELECT COUNT(*) 
    FROM restaurant_votes 
    WHERE collection_id = collections.id 
    AND vote = 'like'
)
WHERE id IN (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
);

-- Verification queries to see the voting results
SELECT '=== VOTING RESULTS BY COLLECTION ===' as info;

SELECT 
    c.name as collection_name,
    r.name as restaurant_name,
    COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) as likes,
    COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) as dislikes,
    COUNT(*) as total_votes
FROM collections c
JOIN restaurant_votes rv ON c.id = rv.collection_id
JOIN restaurants r ON rv.restaurant_id = r.id
WHERE c.id IN (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
)
GROUP BY c.name, r.name, r.id
ORDER BY c.name, likes DESC, dislikes ASC;

SELECT '=== COLLECTION SUMMARY ===' as info;
SELECT 
    c.name as collection_name,
    COUNT(DISTINCT rv.restaurant_id) as restaurants_voted_on,
    COUNT(rv.id) as total_votes,
    COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) as total_likes,
    COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) as total_dislikes,
    c.likes as collection_likes
FROM collections c
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
WHERE c.id IN (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
)
GROUP BY c.name, c.likes
ORDER BY c.name;
