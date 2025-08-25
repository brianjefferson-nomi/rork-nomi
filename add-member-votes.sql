-- Add Member Votes for Collaborative Voting
-- This script adds votes from other collection members to create winning restaurants

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

-- Now let's add votes from other members to create collaborative scenarios
-- We'll add votes to restaurants that Sarah has already voted on

-- Collection 1: Date Night Spots - Add votes from other members
-- Sarah liked: 11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa (Perfect for romantic dates)
-- Sarah liked: 22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb (Great ambiance for couples)
-- Sarah disliked: 33333333-cccc-cccc-cccc-cccccccccccc (Too casual for date night)

-- Other members agree with Sarah's likes
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
-- Member 2 agrees with Sarah's romantic choice
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Sarah was right, perfect romantic atmosphere', NOW() - INTERVAL '4 days'),
-- Member 3 also agrees
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Excellent choice for date night', NOW() - INTERVAL '3 days'),
-- Member 4 agrees too
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Great romantic spot', NOW() - INTERVAL '2 days'),

-- Member 2 also likes Sarah's second choice
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Beautiful ambiance', NOW() - INTERVAL '4 days'),
-- Member 3 disagrees with Sarah's second choice
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'dislike', 'Too expensive for what you get', NOW() - INTERVAL '3 days'),

-- Some members agree with Sarah's dislike
('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'dislike', 'Too casual for date night', NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', '33333333-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'dislike', 'Not romantic enough', NOW() - INTERVAL '2 days')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 2: Best Brunch - Add votes from other members
-- Sarah liked: 44444444-dddd-dddd-dddd-dddddddddddd (Amazing brunch menu)
-- Sarah liked: 55555555-eeee-eeee-eeee-eeeeeeeeeeee (Best pancakes in town)
-- Sarah liked: 66666666-ffff-ffff-ffff-ffffffffffff (Great coffee and atmosphere)

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
-- Member 2 agrees with Sarah's brunch choices
('22222222-2222-2222-2222-222222222222', '44444444-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Amazing brunch menu indeed', NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', '44444444-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Best brunch spot in town', NOW() - INTERVAL '2 days'),

-- Member 3 loves the pancakes too
('44444444-4444-4444-4444-444444444444', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Pancakes are incredible', NOW() - INTERVAL '2 days'),
('55555555-5555-5555-5555-555555555555', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Best pancakes ever', NOW() - INTERVAL '1 day'),

-- Member 4 disagrees with the coffee spot
('66666666-6666-6666-6666-666666666666', '66666666-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'dislike', 'Coffee was too bitter', NOW() - INTERVAL '1 day')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 3: Italian Food Lovers - Add votes from other members
-- Sarah liked: 77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa (Authentic Italian pasta)
-- Sarah liked: 88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb (Best pizza in the city)
-- Sarah liked: 11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa (Amazing wine selection)

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
-- Member 2 agrees with Sarah's Italian choices
('77777777-7777-7777-7777-777777777777', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Authentic Italian experience', NOW() - INTERVAL '1 day'),
('88888888-8888-8888-8888-888888888888', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Best pasta in the city', NOW() - INTERVAL '12 hours'),

-- Member 3 loves the pizza
('99999999-9999-9999-9999-999999999999', '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Incredible pizza', NOW() - INTERVAL '12 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Best pizza ever', NOW() - INTERVAL '6 hours'),

-- Member 4 disagrees with the wine choice
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'dislike', 'Wine was overpriced', NOW() - INTERVAL '6 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 4: Sushi Enthusiasts - Add votes from other members
-- Sarah liked: 22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb (Fresh and creative sushi)
-- Sarah liked: 33333333-cccc-cccc-cccc-cccccccccccc (Traditional omakase experience)
-- Sarah disliked: 44444444-dddd-dddd-dddd-dddddddddddd (Too expensive for the quality)

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
-- Member 2 agrees with Sarah's sushi choices
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Fresh and creative indeed', NOW() - INTERVAL '12 hours'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Amazing sushi', NOW() - INTERVAL '6 hours'),

-- Member 3 loves the omakase
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Traditional omakase experience', NOW() - INTERVAL '6 hours'),

-- Member 4 agrees with Sarah's dislike
('ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'dislike', 'Too expensive for the quality', NOW() - INTERVAL '6 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 5: Fine Dining Group - Add votes from other members
-- Sarah liked: 55555555-eeee-eeee-eeee-eeeeeeeeeeee (Exceptional fine dining experience)
-- Sarah liked: 66666666-ffff-ffff-ffff-ffffffffffff (Perfect for special occasions)
-- Sarah liked: 77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa (Amazing tasting menu)

INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
-- Member 2 agrees with Sarah's fine dining choices
('11111111-1111-1111-1111-111111111111', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Exceptional dining experience', NOW() - INTERVAL '12 hours'),
('22222222-2222-2222-2222-222222222222', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Amazing fine dining', NOW() - INTERVAL '6 hours'),

-- Member 3 loves the special occasion spot
('33333333-3333-3333-3333-333333333333', '66666666-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Perfect for special occasions', NOW() - INTERVAL '6 hours'),

-- Member 4 disagrees with the tasting menu
('44444444-4444-4444-4444-444444444444', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'dislike', 'Tasting menu was too small', NOW() - INTERVAL '6 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Now let's verify the voting results
SELECT '=== VOTING RESULTS BY COLLECTION ===' as info;

-- Collection 1: Date Night Spots
SELECT 'Date Night Spots - Restaurant 1 (Romantic)' as restaurant_info,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as dislikes,
       COUNT(*) as total_votes
FROM restaurant_votes 
WHERE collection_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' 
  AND restaurant_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT 'Date Night Spots - Restaurant 2 (Ambiance)' as restaurant_info,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as dislikes,
       COUNT(*) as total_votes
FROM restaurant_votes 
WHERE collection_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' 
  AND restaurant_id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SELECT 'Date Night Spots - Restaurant 3 (Casual)' as restaurant_info,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as dislikes,
       COUNT(*) as total_votes
FROM restaurant_votes 
WHERE collection_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' 
  AND restaurant_id = '33333333-cccc-cccc-cccc-cccccccccccc';

-- Collection 2: Best Brunch
SELECT 'Best Brunch - Restaurant 1 (Brunch Menu)' as restaurant_info,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as dislikes,
       COUNT(*) as total_votes
FROM restaurant_votes 
WHERE collection_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' 
  AND restaurant_id = '44444444-dddd-dddd-dddd-dddddddddddd';

SELECT 'Best Brunch - Restaurant 2 (Pancakes)' as restaurant_info,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as dislikes,
       COUNT(*) as total_votes
FROM restaurant_votes 
WHERE collection_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' 
  AND restaurant_id = '55555555-eeee-eeee-eeee-eeeeeeeeeeee';

SELECT 'Best Brunch - Restaurant 3 (Coffee)' as restaurant_info,
       COUNT(CASE WHEN vote = 'like' THEN 1 END) as likes,
       COUNT(CASE WHEN vote = 'dislike' THEN 1 END) as dislikes,
       COUNT(*) as total_votes
FROM restaurant_votes 
WHERE collection_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' 
  AND restaurant_id = '66666666-ffff-ffff-ffff-ffffffffffff';

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
