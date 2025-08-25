-- Test Data with Sarah Johnson Collaborations
-- This script adds Sarah Johnson to multiple collections and sets up collaboration testing
-- 
-- IMPORTANT: Before running this script, find Sarah Johnson's existing UUID by running:
-- SELECT id, email, name FROM users WHERE name ILIKE '%Sarah%' OR email ILIKE '%sarah%';
-- Then replace 'SARAH_JOHNSON_UUID_HERE' with her actual UUID below.

-- Sarah Johnson's UUID (replace with actual UUID from database)
-- Example: '550e8400-e29b-41d4-a716-446655440001'
-- Run this query to find her: SELECT id, email, name FROM users WHERE name ILIKE '%Sarah%' OR email ILIKE '%sarah%';

-- DO NOT CREATE A NEW USER - Sarah Johnson already exists in the database
-- The following line is commented out to avoid creating duplicate users
-- INSERT INTO users (id, email, name, avatar_url, bio, joined_date) VALUES 
-- ('SARAH_JOHNSON_UUID_HERE', 'sarah.johnson@email.com', 'Sarah Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', 'Food enthusiast and restaurant explorer', NOW() - INTERVAL '6 months')
-- ON CONFLICT (id) DO NOTHING;

-- Add Sarah Johnson to multiple existing collections
-- Collection 1: Date Night Spots (add Sarah as member)
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '2 weeks')
ON CONFLICT (collection_id, user_id) DO NOTHING;

-- Collection 2: Best Brunch (add Sarah as member)
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '1 week')
ON CONFLICT (collection_id, user_id) DO NOTHING;

-- Collection 3: Italian Food Lovers (add Sarah as member)
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('cccccccc-3333-3333-3333-333333333333', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '3 days')
ON CONFLICT (collection_id, user_id) DO NOTHING;

-- Collection 4: Sushi Enthusiasts (add Sarah as member)
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('dddddddd-4444-4444-4444-444444444444', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '5 days')
ON CONFLICT (collection_id, user_id) DO NOTHING;

-- Collection 5: Fine Dining Group (add Sarah as member)
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '1 day')
ON CONFLICT (collection_id, user_id) DO NOTHING;

-- Now let's add Sarah's votes (likes) to restaurants in these collections
-- Collection 1: Date Night Spots - Sarah likes romantic restaurants
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
('vote-sarah-001', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Perfect for romantic dates', NOW() - INTERVAL '1 week'),
('vote-sarah-002', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Great ambiance for couples', NOW() - INTERVAL '6 days'),
('vote-sarah-003', '33333333-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'dislike', 'Too casual for date night', NOW() - INTERVAL '5 days')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 2: Best Brunch - Sarah likes brunch spots
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
('vote-sarah-004', '44444444-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Amazing brunch menu', NOW() - INTERVAL '4 days'),
('vote-sarah-005', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Best pancakes in town', NOW() - INTERVAL '3 days'),
('vote-sarah-006', '66666666-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Great coffee and atmosphere', NOW() - INTERVAL '2 days')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 3: Italian Food Lovers - Sarah likes Italian restaurants
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
('vote-sarah-007', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Authentic Italian pasta', NOW() - INTERVAL '2 days'),
('vote-sarah-008', '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Best pizza in the city', NOW() - INTERVAL '1 day'),
('vote-sarah-009', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Amazing wine selection', NOW() - INTERVAL '12 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 4: Sushi Enthusiasts - Sarah likes sushi restaurants
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
('vote-sarah-010', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Fresh and creative sushi', NOW() - INTERVAL '1 day'),
('vote-sarah-011', '33333333-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Traditional omakase experience', NOW() - INTERVAL '18 hours'),
('vote-sarah-012', '44444444-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'dislike', 'Too expensive for the quality', NOW() - INTERVAL '6 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Collection 5: Fine Dining Group - Sarah likes upscale restaurants
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
('vote-sarah-013', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Exceptional fine dining experience', NOW() - INTERVAL '12 hours'),
('vote-sarah-014', '66666666-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Perfect for special occasions', NOW() - INTERVAL '6 hours'),
('vote-sarah-015', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Amazing tasting menu', NOW() - INTERVAL '3 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Now let's add votes from other members TO Sarah's votes (testing collaboration)
-- Other members like the same restaurants Sarah likes (showing agreement)
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
-- Collection 1: Date Night Spots - Other members agree with Sarah
('vote-other-001', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Sarah was right, perfect for dates', NOW() - INTERVAL '5 days'),
('vote-other-002', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Great romantic atmosphere', NOW() - INTERVAL '4 days'),
('vote-other-003', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Excellent choice Sarah!', NOW() - INTERVAL '3 days'),

-- Collection 2: Best Brunch - Other members agree with Sarah
('vote-other-004', '44444444-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Amazing brunch spot', NOW() - INTERVAL '3 days'),
('vote-other-005', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Best pancakes ever', NOW() - INTERVAL '2 days'),
('vote-other-006', '66666666-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', 'Great coffee and food', NOW() - INTERVAL '1 day'),

-- Collection 3: Italian Food Lovers - Other members agree with Sarah
('vote-other-007', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Authentic Italian experience', NOW() - INTERVAL '1 day'),
('vote-other-008', '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Best pizza in town', NOW() - INTERVAL '12 hours'),
('vote-other-009', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', 'Amazing wine and food', NOW() - INTERVAL '6 hours'),

-- Collection 4: Sushi Enthusiasts - Other members agree with Sarah
('vote-other-010', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Fresh and creative sushi', NOW() - INTERVAL '12 hours'),
('vote-other-011', '33333333-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Traditional omakase', NOW() - INTERVAL '6 hours'),

-- Collection 5: Fine Dining Group - Other members agree with Sarah
('vote-other-012', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Exceptional dining experience', NOW() - INTERVAL '6 hours'),
('vote-other-013', '66666666-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Perfect for special occasions', NOW() - INTERVAL '3 hours'),
('vote-other-014', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', 'Amazing tasting menu', NOW() - INTERVAL '2 hours')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add some disagreements to test collaboration dynamics
-- Some members disagree with Sarah on certain restaurants
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, reason, created_at) VALUES 
('vote-disagree-001', '33333333-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', 'Actually great for casual dates', NOW() - INTERVAL '4 days'),
('vote-disagree-002', '44444444-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', 'Worth the price for the quality', NOW() - INTERVAL '5 hours'),
('vote-disagree-003', '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'dislike', 'Too greasy for my taste', NOW() - INTERVAL '1 day')
ON CONFLICT (restaurant_id, user_id, collection_id) DO NOTHING;

-- Add some discussions where Sarah participates
INSERT INTO restaurant_discussions (id, restaurant_id, collection_id, user_id, message, likes, created_at) VALUES 
('disc-sarah-001', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'This place is perfect for anniversary dinners! The service is impeccable.', 3, NOW() - INTERVAL '1 week'),
('disc-sarah-002', '44444444-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'Try their eggs benedict - it''s absolutely divine!', 2, NOW() - INTERVAL '4 days'),
('disc-sarah-003', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'The pasta is made fresh daily. You can taste the difference!', 4, NOW() - INTERVAL '2 days'),
('disc-sarah-004', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'The chef''s special roll is a must-try. So creative!', 3, NOW() - INTERVAL '1 day'),
('disc-sarah-005', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'The wine pairing was exceptional. Highly recommend the tasting menu.', 5, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- Add replies to Sarah's discussions
INSERT INTO restaurant_discussions (id, restaurant_id, collection_id, user_id, message, parent_id, likes, created_at) VALUES 
('disc-reply-001', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Sarah, you''re absolutely right! We went there for our anniversary and it was perfect.', 'disc-sarah-001', 2, NOW() - INTERVAL '6 days'),
('disc-reply-002', '44444444-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Thanks for the recommendation Sarah! The eggs benedict was amazing.', 'disc-sarah-002', 1, NOW() - INTERVAL '3 days'),
('disc-reply-003', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Sarah knows her Italian food! The fresh pasta is incredible.', 'disc-sarah-003', 2, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Add user activities for Sarah
INSERT INTO user_activities (id, user_id, type, restaurant_id, collection_id, content, created_at) VALUES 
('act-sarah-001', '11111111-1111-1111-1111-111111111111', 'vote', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Liked restaurant for date night collection', NOW() - INTERVAL '1 week'),
('act-sarah-002', '11111111-1111-1111-1111-111111111111', 'review', '44444444-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'Posted review for brunch spot', NOW() - INTERVAL '4 days'),
('act-sarah-003', '11111111-1111-1111-1111-111111111111', 'collection', NULL, 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'Joined Italian Food Lovers collection', NOW() - INTERVAL '3 days'),
('act-sarah-004', '11111111-1111-1111-1111-111111111111', 'photo', '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'Shared photo of pasta dish', NOW() - INTERVAL '2 days'),
('act-sarah-005', '11111111-1111-1111-1111-111111111111', 'tip', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'Added tip about chef\'s special roll', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Update collection likes to reflect Sarah's contributions
UPDATE collections SET likes = CASE 
  WHEN id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' THEN 52  -- Date Night Spots
  WHEN id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' THEN 38  -- Best Brunch  
  WHEN id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa' THEN 45  -- Italian Food Lovers
  WHEN id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb' THEN 41  -- Sushi Enthusiasts
  WHEN id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc' THEN 48  -- Fine Dining Group
  ELSE likes
END WHERE id IN (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 
  'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
  'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
  'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
);

-- Summary queries to verify the data
SELECT 'Sarah Johnson Collaborations Summary' as info;
SELECT 'Sarah Johnson added to collections:' as info, COUNT(*) as count FROM collection_members WHERE user_id = '11111111-1111-1111-1111-111111111111';
SELECT 'Sarah Johnson votes:' as info, COUNT(*) as count FROM restaurant_votes WHERE user_id = '11111111-1111-1111-1111-111111111111';
SELECT 'Sarah Johnson discussions:' as info, COUNT(*) as count FROM restaurant_discussions WHERE user_id = '11111111-1111-1111-1111-111111111111';
SELECT 'Sarah Johnson activities:' as info, COUNT(*) as count FROM user_activities WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Show collaboration statistics
SELECT 'Collaboration Stats:' as info;
SELECT 
  c.name as collection_name,
  COUNT(DISTINCT cm.user_id) as total_members,
  COUNT(DISTINCT rv.user_id) as voting_members,
  COUNT(rv.id) as total_votes,
  COUNT(CASE WHEN rv.vote = 'like' THEN 1 END) as likes,
  COUNT(CASE WHEN rv.vote = 'dislike' THEN 1 END) as dislikes
FROM collections c
LEFT JOIN collection_members cm ON c.id = cm.collection_id
LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
WHERE c.id IN (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
  'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 
  'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
  'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
)
GROUP BY c.id, c.name
ORDER BY c.name;
