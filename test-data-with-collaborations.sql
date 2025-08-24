-- Comprehensive Test Data with Collaborations
-- This creates realistic test data with multiple users, collections, and decision insights

-- First, let's create some test users
INSERT INTO users (id, email, name, avatar_url, bio, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'sarah@example.com', 'Sarah Johnson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 'Food enthusiast & restaurant explorer 🍽️', NOW()),
('22222222-2222-2222-2222-222222222222', 'mike@example.com', 'Mike Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Adventure seeker and food lover', NOW()),
('33333333-3333-3333-3333-333333333333', 'emma@example.com', 'Emma Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 'Culinary explorer and wine enthusiast', NOW()),
('44444444-4444-4444-4444-444444444444', 'david@example.com', 'David Kim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 'Chef and restaurant critic', NOW()),
('55555555-5555-5555-5555-555555555555', 'lisa@example.com', 'Lisa Thompson', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 'Food blogger and influencer', NOW()),
('66666666-6666-6666-6666-666666666666', 'james@example.com', 'James Wilson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'Business executive and foodie', NOW()),
('77777777-7777-7777-7777-777777777777', 'anna@example.com', 'Anna Martinez', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 'Travel blogger and food photographer', NOW()),
('88888888-8888-8888-8888-888888888888', 'tom@example.com', 'Tom Anderson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Tech entrepreneur and restaurant investor', NOW());

-- Create some test restaurants
INSERT INTO restaurants (id, restaurant_code, name, cuisine, price_range, image_url, address, neighborhood, hours, vibe, description, rating, created_at) VALUES
('rest-001', 'LEBERN', 'Le Bernardin', 'French', '$$$$', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', '155 W 51st St, New York, NY', 'Midtown', 'Mon-Sat 5:00 PM - 10:30 PM', ARRAY['Elegant', 'Fine Dining', 'Seafood'], 'World-renowned seafood restaurant with exceptional service', 4.8, NOW()),
('rest-002', 'PERSE', 'Per Se', 'American', '$$$$', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', '10 Columbus Circle, New York, NY', 'Columbus Circle', 'Mon-Sun 5:30 PM - 10:00 PM', ARRAY['Luxury', 'Tasting Menu', 'Romantic'], 'Three-Michelin-starred restaurant with stunning Central Park views', 4.9, NOW()),
('rest-003', 'ELEVEN', 'Eleven Madison Park', 'American', '$$$$', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', '11 Madison Ave, New York, NY', 'Flatiron District', 'Wed-Sun 5:00 PM - 9:00 PM', ARRAY['Innovative', 'Plant-Based', 'Artistic'], 'Revolutionary plant-based fine dining experience', 4.7, NOW()),
('rest-004', 'DANIEL', 'Daniel', 'French', '$$$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '60 E 65th St, New York, NY', 'Upper East Side', 'Tue-Sat 5:30 PM - 10:30 PM', ARRAY['Classic', 'Elegant', 'Romantic'], 'Timeless French cuisine in an elegant setting', 4.6, NOW()),
('rest-005', 'GRAMERCY', 'Gramercy Tavern', 'American', '$$$', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', '42 E 20th St, New York, NY', 'Gramercy', 'Mon-Sun 12:00 PM - 11:00 PM', ARRAY['Cozy', 'Seasonal', 'Comfortable'], 'Beloved neighborhood restaurant with seasonal American cuisine', 4.5, NOW()),
('rest-006', 'BABBO', 'Babbo', 'Italian', '$$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '110 Waverly Pl, New York, NY', 'Greenwich Village', 'Mon-Sun 5:00 PM - 11:00 PM', ARRAY['Authentic', 'Rustic', 'Cozy'], 'Mario Batali''s acclaimed Italian restaurant', 4.4, NOW()),
('rest-007', 'MOMOFUKU', 'Momofuku Ko', 'Asian', '$$$', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', '8 Extra Pl, New York, NY', 'East Village', 'Wed-Sun 5:30 PM - 10:00 PM', ARRAY['Innovative', 'Asian Fusion', 'Casual'], 'David Chang''s innovative tasting menu restaurant', 4.3, NOW()),
('rest-008', 'KATZ', 'Katz''s Delicatessen', 'Jewish', '$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '205 E Houston St, New York, NY', 'Lower East Side', 'Mon-Sun 8:00 AM - 10:45 PM', ARRAY['Historic', 'Casual', 'Iconic'], 'Famous Jewish deli known for pastrami sandwiches', 4.2, NOW()),
('rest-009', 'PETER', 'Peter Luger Steak House', 'American', '$$$', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', '178 Broadway, Brooklyn, NY', 'Williamsburg', 'Mon-Sun 11:45 AM - 9:45 PM', ARRAY['Classic', 'Steakhouse', 'Historic'], 'Legendary steakhouse since 1887', 4.1, NOW()),
('rest-010', 'ROBERTS', 'Roberta''s', 'Pizza', '$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '261 Moore St, Brooklyn, NY', 'Bushwick', 'Mon-Sun 11:00 AM - 12:00 AM', ARRAY['Artisanal', 'Pizza', 'Hip'], 'Artisanal pizza in a converted garage', 4.0, NOW());

-- Create collaborative collections with multiple members
INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, occasion, is_public, likes, equal_voting, admin_weighted, expertise_weighted, minimum_participation, allow_vote_changes, anonymous_voting, vote_visibility, discussion_enabled, auto_ranking_enabled, consensus_threshold, restaurant_ids, collaborators, created_at, updated_at) VALUES
-- Collection 1: Date Night Winners (4 members)
('coll-001', 'DATE_NIGHT_001', 'Date Night Winners', 'Perfect restaurants for romantic evenings', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'romantic', true, 15, true, false, false, 2, true, false, 'public', true, true, 60, 
 ARRAY['rest-001', 'rest-002', 'rest-003', 'rest-004'], 
 ARRAY['22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'], 
 NOW(), NOW()),

-- Collection 2: Business Lunch Spots (5 members)
('coll-002', 'BUSINESS_001', 'Business Lunch Spots', 'Professional dining for client meetings', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'business', true, 23, true, false, false, 3, true, false, 'public', true, true, 50, 
 ARRAY['rest-005', 'rest-006', 'rest-007'], 
 ARRAY['11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777'], 
 NOW(), NOW()),

-- Collection 3: Foodie Adventures (6 members)
('coll-003', 'FOODIE_001', 'Foodie Adventures', 'Must-try restaurants for food enthusiasts', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'exploration', true, 31, true, false, false, 2, true, false, 'public', true, true, 40, 
 ARRAY['rest-001', 'rest-003', 'rest-007', 'rest-008', 'rest-009'], 
 ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888'], 
 NOW(), NOW()),

-- Collection 4: Budget Eats (4 members)
('coll-004', 'BUDGET_001', 'Budget Eats', 'Great food without breaking the bank', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'budget', true, 18, true, false, false, 2, true, false, 'public', true, true, 50, 
 ARRAY['rest-008', 'rest-010'], 
 ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777'], 
 NOW(), NOW()),

-- Collection 5: Celebrity Chef Spots (5 members)
('coll-005', 'CELEBRITY_001', 'Celebrity Chef Spots', 'Restaurants by famous chefs', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'celebration', true, 27, true, false, false, 3, true, false, 'public', true, true, 60, 
 ARRAY['rest-002', 'rest-003', 'rest-006', 'rest-007'], 
 ARRAY['11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888'], 
 NOW(), NOW());

-- Create collection members for proper relationships
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at, vote_weight) VALUES
-- Date Night Winners members
('cm-001', 'coll-001', '11111111-1111-1111-1111-111111111111', 'admin', NOW(), 1),
('cm-002', 'coll-001', '22222222-2222-2222-2222-222222222222', 'member', NOW(), 1),
('cm-003', 'coll-001', '33333333-3333-3333-3333-333333333333', 'member', NOW(), 1),
('cm-004', 'coll-001', '44444444-4444-4444-4444-444444444444', 'member', NOW(), 1),

-- Business Lunch Spots members
('cm-005', 'coll-002', '22222222-2222-2222-2222-222222222222', 'admin', NOW(), 1),
('cm-006', 'coll-002', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('cm-007', 'coll-002', '55555555-5555-5555-5555-555555555555', 'member', NOW(), 1),
('cm-008', 'coll-002', '66666666-6666-6666-6666-666666666666', 'member', NOW(), 1),
('cm-009', 'coll-002', '77777777-7777-7777-7777-777777777777', 'member', NOW(), 1),

-- Foodie Adventures members
('cm-010', 'coll-003', '33333333-3333-3333-3333-333333333333', 'admin', NOW(), 1),
('cm-011', 'coll-003', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('cm-012', 'coll-003', '22222222-2222-2222-2222-222222222222', 'member', NOW(), 1),
('cm-013', 'coll-003', '44444444-4444-4444-4444-444444444444', 'member', NOW(), 1),
('cm-014', 'coll-003', '55555555-5555-5555-5555-555555555555', 'member', NOW(), 1),
('cm-015', 'coll-003', '88888888-8888-8888-8888-888888888888', 'member', NOW(), 1),

-- Budget Eats members
('cm-016', 'coll-004', '44444444-4444-4444-4444-444444444444', 'admin', NOW(), 1),
('cm-017', 'coll-004', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('cm-018', 'coll-004', '22222222-2222-2222-2222-222222222222', 'member', NOW(), 1),
('cm-019', 'coll-004', '77777777-7777-7777-7777-777777777777', 'member', NOW(), 1),

-- Celebrity Chef Spots members
('cm-020', 'coll-005', '55555555-5555-5555-5555-555555555555', 'admin', NOW(), 1),
('cm-021', 'coll-005', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('cm-022', 'coll-005', '33333333-3333-3333-3333-333333333333', 'member', NOW(), 1),
('cm-023', 'coll-005', '66666666-6666-6666-6666-666666666666', 'member', NOW(), 1),
('cm-024', 'coll-005', '88888888-8888-8888-8888-888888888888', 'member', NOW(), 1);

-- Create restaurant votes with diverse opinions for decision insights
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, timestamp, reason, authority, weight) VALUES
-- Date Night Winners votes (showing consensus building)
('vote-001', 'rest-001', '11111111-1111-1111-1111-111111111111', 'coll-001', 'like', NOW() - INTERVAL '2 days', 'Perfect for special occasions', 'admin', 1),
('vote-002', 'rest-001', '22222222-2222-2222-2222-222222222222', 'coll-001', 'like', NOW() - INTERVAL '2 days', 'Amazing seafood and service', 'regular', 1),
('vote-003', 'rest-001', '33333333-3333-3333-3333-333333333333', 'coll-001', 'like', NOW() - INTERVAL '1 day', 'Romantic atmosphere', 'regular', 1),
('vote-004', 'rest-001', '44444444-4444-4444-4444-444444444444', 'coll-001', 'dislike', NOW() - INTERVAL '1 day', 'Too expensive for regular dates', 'regular', 1),

('vote-005', 'rest-002', '11111111-1111-1111-1111-111111111111', 'coll-001', 'like', NOW() - INTERVAL '3 days', 'Stunning views and food', 'admin', 1),
('vote-006', 'rest-002', '22222222-2222-2222-2222-222222222222', 'coll-001', 'like', NOW() - INTERVAL '3 days', 'Worth every penny', 'regular', 1),
('vote-007', 'rest-002', '33333333-3333-3333-3333-333333333333', 'coll-001', 'like', NOW() - INTERVAL '2 days', 'Perfect for anniversaries', 'regular', 1),
('vote-008', 'rest-002', '44444444-4444-4444-4444-444444444444', 'coll-001', 'like', NOW() - INTERVAL '2 days', 'Exceptional experience', 'regular', 1),

-- Business Lunch Spots votes (showing debate)
('vote-009', 'rest-005', '22222222-2222-2222-2222-222222222222', 'coll-002', 'like', NOW() - INTERVAL '1 day', 'Perfect for client meetings', 'admin', 1),
('vote-010', 'rest-005', '11111111-1111-1111-1111-111111111111', 'coll-002', 'like', NOW() - INTERVAL '1 day', 'Professional atmosphere', 'regular', 1),
('vote-011', 'rest-005', '55555555-5555-5555-5555-555555555555', 'coll-002', 'dislike', NOW() - INTERVAL '1 day', 'Too casual for business', 'regular', 1),
('vote-012', 'rest-005', '66666666-6666-6666-6666-666666666666', 'coll-002', 'like', NOW() - INTERVAL '1 day', 'Great food and service', 'regular', 1),
('vote-013', 'rest-005', '77777777-7777-7777-7777-777777777777', 'coll-002', 'like', NOW() - INTERVAL '1 day', 'Reliable choice', 'regular', 1),

-- Foodie Adventures votes (showing diverse opinions)
('vote-014', 'rest-003', '33333333-3333-3333-3333-333333333333', 'coll-003', 'like', NOW() - INTERVAL '2 days', 'Revolutionary plant-based cuisine', 'admin', 1),
('vote-015', 'rest-003', '11111111-1111-1111-1111-111111111111', 'coll-003', 'like', NOW() - INTERVAL '2 days', 'Innovative and delicious', 'regular', 1),
('vote-016', 'rest-003', '22222222-2222-2222-2222-222222222222', 'coll-003', 'dislike', NOW() - INTERVAL '2 days', 'Too experimental for my taste', 'regular', 1),
('vote-017', 'rest-003', '44444444-4444-4444-4444-444444444444', 'coll-003', 'like', NOW() - INTERVAL '1 day', 'Amazing creativity', 'regular', 1),
('vote-018', 'rest-003', '55555555-5555-5555-5555-555555555555', 'coll-003', 'like', NOW() - INTERVAL '1 day', 'Must-try experience', 'regular', 1),
('vote-019', 'rest-003', '88888888-8888-8888-8888-888888888888', 'coll-003', 'dislike', NOW() - INTERVAL '1 day', 'Not worth the price', 'regular', 1),

-- Budget Eats votes (showing agreement)
('vote-020', 'rest-008', '44444444-4444-4444-4444-444444444444', 'coll-004', 'like', NOW() - INTERVAL '1 day', 'Best pastrami in NYC', 'admin', 1),
('vote-021', 'rest-008', '11111111-1111-1111-1111-111111111111', 'coll-004', 'like', NOW() - INTERVAL '1 day', 'Classic NYC experience', 'regular', 1),
('vote-022', 'rest-008', '22222222-2222-2222-2222-222222222222', 'coll-004', 'like', NOW() - INTERVAL '1 day', 'Great value for money', 'regular', 1),
('vote-023', 'rest-008', '77777777-7777-7777-7777-777777777777', 'coll-004', 'like', NOW() - INTERVAL '1 day', 'Authentic deli experience', 'regular', 1),

-- Celebrity Chef Spots votes (showing mixed opinions)
('vote-024', 'rest-006', '55555555-5555-5555-5555-555555555555', 'coll-005', 'like', NOW() - INTERVAL '2 days', 'Batali''s best restaurant', 'admin', 1),
('vote-025', 'rest-006', '11111111-1111-1111-1111-111111111111', 'coll-005', 'like', NOW() - INTERVAL '2 days', 'Authentic Italian cuisine', 'regular', 1),
('vote-026', 'rest-006', '33333333-3333-3333-3333-333333333333', 'coll-005', 'dislike', NOW() - INTERVAL '2 days', 'Overrated and expensive', 'regular', 1),
('vote-027', 'rest-006', '66666666-6666-6666-6666-666666666666', 'coll-005', 'like', NOW() - INTERVAL '1 day', 'Great pasta dishes', 'regular', 1),
('vote-028', 'rest-006', '88888888-8888-8888-8888-888888888888', 'coll-005', 'dislike', NOW() - INTERVAL '1 day', 'Too crowded and noisy', 'regular', 1);

-- Create restaurant discussions for engagement
INSERT INTO restaurant_discussions (id, restaurant_id, collection_id, user_id, message, timestamp, likes) VALUES
('disc-001', 'rest-001', 'coll-001', '11111111-1111-1111-1111-111111111111', 'Has anyone tried their tasting menu? Worth the splurge?', NOW() - INTERVAL '2 days', 3),
('disc-002', 'rest-001', 'coll-001', '22222222-2222-2222-2222-222222222222', 'The wine pairing is incredible! Highly recommend.', NOW() - INTERVAL '2 days', 2),
('disc-003', 'rest-002', 'coll-001', '33333333-3333-3333-3333-333333333333', 'Perfect for anniversary dinners. The service is impeccable.', NOW() - INTERVAL '3 days', 4),
('disc-004', 'rest-005', 'coll-002', '22222222-2222-2222-2222-222222222222', 'Great for client lunches. Professional but not stuffy.', NOW() - INTERVAL '1 day', 2),
('disc-005', 'rest-003', 'coll-003', '33333333-3333-3333-3333-333333333333', 'The plant-based menu is revolutionary! Must try.', NOW() - INTERVAL '2 days', 5),
('disc-006', 'rest-008', 'coll-004', '44444444-4444-4444-4444-444444444444', 'Best pastrami sandwich in the city!', NOW() - INTERVAL '1 day', 3),
('disc-007', 'rest-006', 'coll-005', '55555555-5555-5555-5555-555555555555', 'The pasta tasting menu is amazing!', NOW() - INTERVAL '2 days', 2);

-- Create user activities for engagement tracking
INSERT INTO user_activities (id, user_id, type, restaurant_id, collection_id, content, timestamp) VALUES
('act-001', '11111111-1111-1111-1111-111111111111', 'collection', NULL, 'coll-001', 'Created Date Night Winners collection', NOW() - INTERVAL '5 days'),
('act-002', '22222222-2222-2222-2222-222222222222', 'vote', 'rest-001', 'coll-001', 'Liked Le Bernardin', NOW() - INTERVAL '2 days'),
('act-003', '33333333-3333-3333-3333-333333333333', 'discussion', 'rest-001', 'coll-001', 'Started discussion about tasting menu', NOW() - INTERVAL '2 days'),
('act-004', '44444444-4444-4444-4444-444444444444', 'vote', 'rest-001', 'coll-001', 'Disliked Le Bernardin (too expensive)', NOW() - INTERVAL '1 day'),
('act-005', '22222222-2222-2222-2222-222222222222', 'collection', NULL, 'coll-002', 'Created Business Lunch Spots collection', NOW() - INTERVAL '4 days'),
('act-006', '33333333-3333-3333-3333-333333333333', 'collection', NULL, 'coll-003', 'Created Foodie Adventures collection', NOW() - INTERVAL '3 days'),
('act-007', '44444444-4444-4444-4444-444444444444', 'collection', NULL, 'coll-004', 'Created Budget Eats collection', NOW() - INTERVAL '3 days'),
('act-008', '55555555-5555-5555-5555-555555555555', 'collection', NULL, 'coll-005', 'Created Celebrity Chef Spots collection', NOW() - INTERVAL '2 days');

-- Update collection analytics (this would normally be computed, but we'll set some realistic values)
UPDATE collections SET 
  likes = CASE 
    WHEN id = 'coll-001' THEN 15
    WHEN id = 'coll-002' THEN 23
    WHEN id = 'coll-003' THEN 31
    WHEN id = 'coll-004' THEN 18
    WHEN id = 'coll-005' THEN 27
  END
WHERE id IN ('coll-001', 'coll-002', 'coll-003', 'coll-004', 'coll-005');

-- Show the created data
SELECT 'Users created:' as info, COUNT(*) as count FROM users WHERE id LIKE '11111111%' OR id LIKE '22222222%' OR id LIKE '33333333%' OR id LIKE '44444444%' OR id LIKE '55555555%' OR id LIKE '66666666%' OR id LIKE '77777777%' OR id LIKE '88888888%'
UNION ALL
SELECT 'Restaurants created:', COUNT(*) FROM restaurants WHERE id LIKE 'rest-%'
UNION ALL
SELECT 'Collections created:', COUNT(*) FROM collections WHERE id LIKE 'coll-%'
UNION ALL
SELECT 'Collection members:', COUNT(*) FROM collection_members WHERE id LIKE 'cm-%'
UNION ALL
SELECT 'Restaurant votes:', COUNT(*) FROM restaurant_votes WHERE id LIKE 'vote-%'
UNION ALL
SELECT 'Discussions created:', COUNT(*) FROM restaurant_discussions WHERE id LIKE 'disc-%'
UNION ALL
SELECT 'User activities:', COUNT(*) FROM user_activities WHERE id LIKE 'act-%';
