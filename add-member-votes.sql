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

-- Add a second brunch restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'like',
    'Pancakes are incredible',
    NOW() - INTERVAL '2 days'
FROM brunch_restaurants r
WHERE r.id = (SELECT id FROM brunch_restaurants OFFSET 1 LIMIT 1)
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

-- Add a second Italian restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'like',
    'Incredible pizza',
    NOW() - INTERVAL '12 hours'
FROM italian_restaurants r
WHERE r.id = (SELECT id FROM italian_restaurants OFFSET 1 LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'like',
    'Best pizza ever',
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
    'Fresh and creative indeed',
    NOW() - INTERVAL '12 hours'
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
    'Amazing sushi',
    NOW() - INTERVAL '6 hours'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add a second sushi restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'like',
    'Traditional omakase experience',
    NOW() - INTERVAL '6 hours'
FROM sushi_restaurants r
WHERE r.id = (SELECT id FROM sushi_restaurants OFFSET 1 LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 5: Fine Dining Group - Add votes from other members
-- Get some restaurants for Fine Dining collection
WITH fine_dining_restaurants AS (
    SELECT id, name, cuisine
    FROM restaurants 
    WHERE cuisine ILIKE '%fine%' OR cuisine ILIKE '%steakhouse%' OR cuisine ILIKE '%french%' OR name ILIKE '%fine%' OR name ILIKE '%steak%'
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
    'Exceptional dining experience',
    NOW() - INTERVAL '12 hours'
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
    'Amazing fine dining',
    NOW() - INTERVAL '6 hours'
FROM restaurants r
WHERE r.id = (
    SELECT restaurant_id 
    FROM restaurant_votes 
    WHERE collection_id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc' 
    AND user_id = '22222222-2222-2222-2222-222222222222'
    LIMIT 1
)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add a second fine dining restaurant
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc',
    'like',
    'Perfect for special occasions',
    NOW() - INTERVAL '6 hours'
FROM fine_dining_restaurants r
WHERE r.id = (SELECT id FROM fine_dining_restaurants OFFSET 1 LIMIT 1)
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Now let's verify the voting results
SELECT '=== VOTING RESULTS BY COLLECTION ===' as info;

-- Collection 1: Date Night Spots
SELECT 'Date Night Spots - Voting Summary' as collection_info,
       COUNT(DISTINCT restaurant_id) as restaurants_voted_on,
       COUNT(*) as total_votes,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as total_likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as total_dislikes
FROM restaurant_votes 
WHERE collection_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Collection 2: Best Brunch
SELECT 'Best Brunch - Voting Summary' as collection_info,
       COUNT(DISTINCT restaurant_id) as restaurants_voted_on,
       COUNT(*) as total_votes,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as total_likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as total_dislikes
FROM restaurant_votes 
WHERE collection_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';

-- Collection 3: Italian Food Lovers
SELECT 'Italian Food Lovers - Voting Summary' as collection_info,
       COUNT(DISTINCT restaurant_id) as restaurants_voted_on,
       COUNT(*) as total_votes,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as total_likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as total_dislikes
FROM restaurant_votes 
WHERE collection_id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa';

-- Collection 4: Sushi Enthusiasts
SELECT 'Sushi Enthusiasts - Voting Summary' as collection_info,
       COUNT(DISTINCT restaurant_id) as restaurants_voted_on,
       COUNT(*) as total_votes,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as total_likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as total_dislikes
FROM restaurant_votes 
WHERE collection_id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb';

-- Collection 5: Fine Dining Group
SELECT 'Fine Dining Group - Voting Summary' as collection_info,
       COUNT(DISTINCT restaurant_id) as restaurants_voted_on,
       COUNT(*) as total_votes,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as total_likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as total_dislikes
FROM restaurant_votes 
WHERE collection_id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc';

-- Show overall voting summary
SELECT '=== OVERALL VOTING SUMMARY ===' as info;
SELECT 
    c.name as collection_name,
    rv.restaurant_id,
    COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) as likes,
    COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) as dislikes,
    COUNT(*) as total_votes,
    CASE 
        WHEN COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) > COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) THEN 'WINNER'
        WHEN COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) < COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) THEN 'LOSER'
        ELSE 'TIE'
    END as result
FROM restaurant_votes rv
JOIN collections c ON rv.collection_id = c.id
WHERE rv.collection_id IN (
    SELECT DISTINCT cm.collection_id 
    FROM collection_members cm 
    WHERE cm.user_id = '11111111-1111-1111-1111-111111111111'
)
GROUP BY c.name, rv.restaurant_id
ORDER BY c.name, likes DESC, dislikes ASC;
