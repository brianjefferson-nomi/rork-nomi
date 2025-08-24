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
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LEBERN', 'Le Bernardin', 'French', '$$$$', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', '155 W 51st St, New York, NY', 'Midtown', 'Mon-Sat 5:00 PM - 10:30 PM', ARRAY['Elegant', 'Fine Dining', 'Seafood'], 'World-renowned seafood restaurant with exceptional service', 4.8, NOW()),
('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PERSE', 'Per Se', 'American', '$$$$', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', '10 Columbus Circle, New York, NY', 'Columbus Circle', 'Mon-Sun 5:30 PM - 10:00 PM', ARRAY['Luxury', 'Tasting Menu', 'Romantic'], 'Three-Michelin-starred restaurant with stunning Central Park views', 4.9, NOW()),
('33333333-cccc-cccc-cccc-cccccccccccc', 'ELEVEN', 'Eleven Madison Park', 'American', '$$$$', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', '11 Madison Ave, New York, NY', 'Flatiron District', 'Wed-Sun 5:00 PM - 9:00 PM', ARRAY['Innovative', 'Plant-Based', 'Artistic'], 'Revolutionary plant-based fine dining experience', 4.7, NOW()),
('44444444-dddd-dddd-dddd-dddddddddddd', 'DANIEL', 'Daniel', 'French', '$$$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '60 E 65th St, New York, NY', 'Upper East Side', 'Tue-Sat 5:30 PM - 10:30 PM', ARRAY['Classic', 'Elegant', 'Romantic'], 'Timeless French cuisine in an elegant setting', 4.6, NOW()),
('55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'GRAMERCY', 'Gramercy Tavern', 'American', '$$$', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', '42 E 20th St, New York, NY', 'Gramercy', 'Mon-Sun 12:00 PM - 11:00 PM', ARRAY['Cozy', 'Seasonal', 'Comfortable'], 'Beloved neighborhood restaurant with seasonal American cuisine', 4.5, NOW()),
('66666666-ffff-ffff-ffff-ffffffffffff', 'BABBO', 'Babbo', 'Italian', '$$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '110 Waverly Pl, New York, NY', 'Greenwich Village', 'Mon-Sun 5:00 PM - 11:00 PM', ARRAY['Authentic', 'Rustic', 'Cozy'], 'Mario Batali''s acclaimed Italian restaurant', 4.4, NOW()),
('77777777-aaaa-bbbb-cccc-dddddddddddd', 'MOMOFUKU', 'Momofuku Ko', 'Asian', '$$$', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', '8 Extra Pl, New York, NY', 'East Village', 'Wed-Sun 5:30 PM - 10:00 PM', ARRAY['Innovative', 'Asian Fusion', 'Casual'], 'David Chang''s innovative tasting menu restaurant', 4.3, NOW()),
('88888888-bbbb-cccc-dddd-eeeeeeeeeeee', 'KATZ', 'Katz''s Delicatessen', 'Jewish', '$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '205 E Houston St, New York, NY', 'Lower East Side', 'Mon-Sun 8:00 AM - 10:45 PM', ARRAY['Historic', 'Casual', 'Iconic'], 'Famous Jewish deli known for pastrami sandwiches', 4.2, NOW()),
('99999999-cccc-dddd-eeee-ffffffffffff', 'PETER', 'Peter Luger Steak House', 'American', '$$$', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', '178 Broadway, Brooklyn, NY', 'Williamsburg', 'Mon-Sun 11:45 AM - 9:45 PM', ARRAY['Classic', 'Steakhouse', 'Historic'], 'Legendary steakhouse since 1887', 4.1, NOW()),
('aaaaaaaa-dddd-eeee-ffff-aaaaaaaaaaaa', 'ROBERTS', 'Roberta''s', 'Pizza', '$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '261 Moore St, Brooklyn, NY', 'Bushwick', 'Mon-Sun 11:00 AM - 12:00 AM', ARRAY['Artisanal', 'Pizza', 'Hip'], 'Artisanal pizza in a converted garage', 4.0, NOW());

-- Create collaborative collections with multiple members
INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, occasion, is_public, likes, equal_voting, admin_weighted, expertise_weighted, minimum_participation, allow_vote_changes, anonymous_voting, vote_visibility, discussion_enabled, auto_ranking_enabled, consensus_threshold, restaurant_ids, collaborators, created_at, updated_at) VALUES
-- Collection 1: Date Night Winners (4 members)
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'DATE_NIGHT_001', 'Date Night Winners', 'Perfect restaurants for romantic evenings', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'romantic', true, 15, true, false, false, 2, true, false, 'public', true, true, 60, 
 ARRAY['11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-cccc-cccc-cccc-cccccccccccc', '44444444-dddd-dddd-dddd-dddddddddddd'], 
 ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], 
 NOW(), NOW()),

-- Collection 2: Business Lunch Spots (5 members)
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'BUSINESS_001', 'Business Lunch Spots', 'Professional dining for client meetings', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'business', true, 23, true, false, false, 3, true, false, 'public', true, true, 50, 
 ARRAY['55555555-eeee-eeee-eeee-eeeeeeeeeeee', '66666666-ffff-ffff-ffff-ffffffffffff', '77777777-aaaa-bbbb-cccc-dddddddddddd'], 
 ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, '77777777-7777-7777-7777-777777777777'::uuid], 
 NOW(), NOW()),

-- Collection 3: Foodie Adventures (6 members)
('cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'FOODIE_001', 'Foodie Adventures', 'Must-try restaurants for food enthusiasts', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'exploration', true, 31, true, false, false, 2, true, false, 'public', true, true, 40, 
 ARRAY['11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-cccc-cccc-cccc-cccccccccccc', '77777777-aaaa-bbbb-cccc-dddddddddddd', '88888888-bbbb-cccc-dddd-eeeeeeeeeeee', '99999999-cccc-dddd-eeee-ffffffffffff'], 
 ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, '88888888-8888-8888-8888-888888888888'::uuid], 
 NOW(), NOW()),

-- Collection 4: Budget Eats (4 members)
('dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'BUDGET_001', 'Budget Eats', 'Great food without breaking the bank', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'budget', true, 18, true, false, false, 2, true, false, 'public', true, true, 50, 
 ARRAY['88888888-bbbb-cccc-dddd-eeeeeeeeeeee', 'aaaaaaaa-dddd-eeee-ffff-aaaaaaaaaaaa'], 
 ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '77777777-7777-7777-7777-777777777777'::uuid], 
 NOW(), NOW()),

-- Collection 5: Celebrity Chef Spots (5 members)
('eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'CELEBRITY_001', 'Celebrity Chef Spots', 'Restaurants by famous chefs', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'celebration', true, 27, true, false, false, 3, true, false, 'public', true, true, 60, 
 ARRAY['22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-cccc-cccc-cccc-cccccccccccc', '66666666-ffff-ffff-ffff-ffffffffffff', '77777777-aaaa-bbbb-cccc-dddddddddddd'], 
 ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, '88888888-8888-8888-8888-888888888888'::uuid], 
 NOW(), NOW());

-- Create collection members for proper relationships
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at, vote_weight) VALUES
-- Date Night Winners members
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'admin', NOW(), 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'member', NOW(), 1),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'member', NOW(), 1),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'member', NOW(), 1),

-- Business Lunch Spots members
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'admin', NOW(), 1),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '55555555-5555-5555-5555-555555555555', 'member', NOW(), 1),
('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'member', NOW(), 1),
('33333333-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '77777777-7777-7777-7777-777777777777', 'member', NOW(), 1),

-- Foodie Adventures members
('44444444-dddd-dddd-dddd-dddddddddddd', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'admin', NOW(), 1),
('55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('66666666-ffff-ffff-ffff-ffffffffffff', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member', NOW(), 1),
('77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'member', NOW(), 1),
('88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'member', NOW(), 1),
('99999999-cccc-cccc-cccc-cccccccccccc', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 'member', NOW(), 1),

-- Budget Eats members
('aaaaaaaa-dddd-dddd-dddd-dddddddddddd', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'admin', NOW(), 1),
('bbbbbbbb-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('cccccccc-ffff-ffff-ffff-ffffffffffff', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'member', NOW(), 1),
('dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 'member', NOW(), 1),

-- Celebrity Chef Spots members
('eeeeeeee-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'admin', NOW(), 1),
('ffffffff-cccc-cccc-cccc-cccccccccccc', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'member', NOW(), 1),
('11111111-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'member', NOW(), 1),
('22222222-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '66666666-6666-6666-6666-666666666666', 'member', NOW(), 1),
('33333333-ffff-ffff-ffff-ffffffffffff', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '88888888-8888-8888-8888-888888888888', 'member', NOW(), 1);

-- Create restaurant votes with diverse opinions for decision insights
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, timestamp, reason, authority, weight) VALUES
-- Date Night Winners votes (showing consensus building)
('aaaaaaaa-1111-1111-1111-111111111111', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '2 days', 'Perfect for special occasions', 'admin', 1),
('bbbbbbbb-2222-2222-2222-222222222222', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '2 days', 'Amazing seafood and service', 'regular', 1),
('cccccccc-3333-3333-3333-333333333333', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '1 day', 'Romantic atmosphere', 'regular', 1),
('dddddddd-4444-4444-4444-444444444444', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'dislike', NOW() - INTERVAL '1 day', 'Too expensive for regular dates', 'regular', 1),

('eeeeeeee-5555-5555-5555-555555555555', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '3 days', 'Stunning views and food', 'admin', 1),
('ffffffff-6666-6666-6666-666666666666', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '3 days', 'Worth every penny', 'regular', 1),
('11111111-7777-7777-7777-777777777777', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '2 days', 'Perfect for anniversaries', 'regular', 1),
('22222222-8888-8888-8888-888888888888', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'like', NOW() - INTERVAL '2 days', 'Exceptional experience', 'regular', 1),

-- Business Lunch Spots votes (showing debate)
('33333333-9999-9999-9999-999999999999', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', NOW() - INTERVAL '1 day', 'Perfect for client meetings', 'admin', 1),
('44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', NOW() - INTERVAL '1 day', 'Professional atmosphere', 'regular', 1),
('55555555-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'dislike', NOW() - INTERVAL '1 day', 'Too casual for business', 'regular', 1),
('66666666-cccc-cccc-cccc-cccccccccccc', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', NOW() - INTERVAL '1 day', 'Great food and service', 'regular', 1),
('77777777-dddd-dddd-dddd-dddddddddddd', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'like', NOW() - INTERVAL '1 day', 'Reliable choice', 'regular', 1),

-- Foodie Adventures votes (showing diverse opinions)
('88888888-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', NOW() - INTERVAL '2 days', 'Revolutionary plant-based cuisine', 'admin', 1),
('99999999-ffff-ffff-ffff-ffffffffffff', '33333333-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', NOW() - INTERVAL '2 days', 'Innovative and delicious', 'regular', 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'dislike', NOW() - INTERVAL '2 days', 'Too experimental for my taste', 'regular', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', NOW() - INTERVAL '1 day', 'Amazing creativity', 'regular', 1),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'like', NOW() - INTERVAL '1 day', 'Must-try experience', 'regular', 1),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-cccc-cccc-cccc-cccccccccccc', '88888888-8888-8888-8888-888888888888', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'dislike', NOW() - INTERVAL '1 day', 'Not worth the price', 'regular', 1),

-- Budget Eats votes (showing agreement)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-bbbb-cccc-dddd-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', NOW() - INTERVAL '1 day', 'Best pastrami in NYC', 'admin', 1),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '88888888-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', NOW() - INTERVAL '1 day', 'Classic NYC experience', 'regular', 1),
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', NOW() - INTERVAL '1 day', 'Great value for money', 'regular', 1),
('22222222-2222-2222-2222-222222222222', '88888888-bbbb-cccc-dddd-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'like', NOW() - INTERVAL '1 day', 'Authentic deli experience', 'regular', 1),

-- Celebrity Chef Spots votes (showing mixed opinions)
('33333333-3333-3333-3333-333333333333', '66666666-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', NOW() - INTERVAL '2 days', 'Batali''s best restaurant', 'admin', 1),
('44444444-4444-4444-4444-444444444444', '66666666-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', NOW() - INTERVAL '2 days', 'Authentic Italian cuisine', 'regular', 1),
('55555555-5555-5555-5555-555555555555', '66666666-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'dislike', NOW() - INTERVAL '2 days', 'Overrated and expensive', 'regular', 1),
('66666666-6666-6666-6666-666666666666', '66666666-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'like', NOW() - INTERVAL '1 day', 'Great pasta dishes', 'regular', 1),
('77777777-7777-7777-7777-777777777777', '66666666-ffff-ffff-ffff-ffffffffffff', '88888888-8888-8888-8888-888888888888', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'dislike', NOW() - INTERVAL '1 day', 'Too crowded and noisy', 'regular', 1);

-- Create restaurant discussions for engagement
INSERT INTO restaurant_discussions (id, restaurant_id, collection_id, user_id, message, timestamp, likes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Has anyone tried their tasting menu? Worth the splurge?', NOW() - INTERVAL '2 days', 3),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'The wine pairing is incredible! Highly recommend.', NOW() - INTERVAL '2 days', 2),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Perfect for anniversary dinners. The service is impeccable.', NOW() - INTERVAL '3 days', 4),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Great for client lunches. Professional but not stuffy.', NOW() - INTERVAL '1 day', 2),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-cccc-cccc-cccc-cccccccccccc', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'The plant-based menu is revolutionary! Must try.', NOW() - INTERVAL '2 days', 5),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '88888888-bbbb-cccc-dddd-eeeeeeeeeeee', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'Best pastrami sandwich in the city!', NOW() - INTERVAL '1 day', 3),
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-ffff-ffff-ffff-ffffffffffff', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'The pasta tasting menu is amazing!', NOW() - INTERVAL '2 days', 2);

-- Create user activities for engagement tracking
INSERT INTO user_activities (id, user_id, type, restaurant_id, collection_id, content, timestamp) VALUES
('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'collection', NULL, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Created Date Night Winners collection', NOW() - INTERVAL '5 days'),
('33333333-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'vote', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Liked Le Bernardin', NOW() - INTERVAL '2 days'),
('44444444-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'discussion', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Started discussion about tasting menu', NOW() - INTERVAL '2 days'),
('55555555-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'vote', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Disliked Le Bernardin (too expensive)', NOW() - INTERVAL '1 day'),
('66666666-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'collection', NULL, 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'Created Business Lunch Spots collection', NOW() - INTERVAL '4 days'),
('77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'collection', NULL, 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'Created Foodie Adventures collection', NOW() - INTERVAL '3 days'),
('88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'collection', NULL, 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'Created Budget Eats collection', NOW() - INTERVAL '3 days'),
('99999999-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'collection', NULL, 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'Created Celebrity Chef Spots collection', NOW() - INTERVAL '2 days');

-- Update collection analytics (this would normally be computed, but we'll set some realistic values)
UPDATE collections SET 
  likes = CASE 
    WHEN id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' THEN 15
    WHEN id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' THEN 23
    WHEN id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa' THEN 31
    WHEN id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb' THEN 18
    WHEN id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc' THEN 27
  END
WHERE id IN ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc');

-- Show the created data
SELECT 'Users created:' as info, COUNT(*) as count FROM users WHERE id LIKE '11111111%' OR id LIKE '22222222%' OR id LIKE '33333333%' OR id LIKE '44444444%' OR id LIKE '55555555%' OR id LIKE '66666666%' OR id LIKE '77777777%' OR id LIKE '88888888%'
UNION ALL
SELECT 'Restaurants created:', COUNT(*) FROM restaurants WHERE id LIKE '11111111-aaaa%' OR id LIKE '22222222-bbbb%' OR id LIKE '33333333-cccc%' OR id LIKE '44444444-dddd%' OR id LIKE '55555555-eeee%' OR id LIKE '66666666-ffff%' OR id LIKE '77777777-aaaa%' OR id LIKE '88888888-bbbb%' OR id LIKE '99999999-cccc%' OR id LIKE 'aaaaaaaa-dddd%'
UNION ALL
SELECT 'Collections created:', COUNT(*) FROM collections WHERE id LIKE 'aaaaaaaa-bbbb%' OR id LIKE 'bbbbbbbb-cccc%' OR id LIKE 'cccccccc-dddd%' OR id LIKE 'dddddddd-eeee%' OR id LIKE 'eeeeeeee-ffff%'
UNION ALL
SELECT 'Collection members:', COUNT(*) FROM collection_members WHERE id LIKE 'aaaaaaaa-aaaa%' OR id LIKE 'bbbbbbbb-bbbb%' OR id LIKE 'cccccccc-cccc%' OR id LIKE 'dddddddd-dddd%' OR id LIKE 'eeeeeeee-eeee%' OR id LIKE 'ffffffff-ffff%' OR id LIKE '11111111-aaaa%' OR id LIKE '22222222-bbbb%' OR id LIKE '33333333-cccc%' OR id LIKE '44444444-dddd%' OR id LIKE '55555555-eeee%' OR id LIKE '66666666-ffff%' OR id LIKE '77777777-aaaa%' OR id LIKE '88888888-bbbb%' OR id LIKE '99999999-cccc%' OR id LIKE 'aaaaaaaa-dddd%' OR id LIKE 'bbbbbbbb-eeee%' OR id LIKE 'cccccccc-ffff%' OR id LIKE 'dddddddd-aaaa%' OR id LIKE 'eeeeeeee-bbbb%' OR id LIKE 'ffffffff-cccc%' OR id LIKE '11111111-dddd%' OR id LIKE '22222222-eeee%' OR id LIKE '33333333-ffff%'
UNION ALL
SELECT 'Restaurant votes:', COUNT(*) FROM restaurant_votes WHERE id LIKE 'aaaaaaaa-1111%' OR id LIKE 'bbbbbbbb-2222%' OR id LIKE 'cccccccc-3333%' OR id LIKE 'dddddddd-4444%' OR id LIKE 'eeeeeeee-5555%' OR id LIKE 'ffffffff-6666%' OR id LIKE '11111111-7777%' OR id LIKE '22222222-8888%' OR id LIKE '33333333-9999%' OR id LIKE '44444444-aaaa%' OR id LIKE '55555555-bbbb%' OR id LIKE '66666666-cccc%' OR id LIKE '77777777-dddd%' OR id LIKE '88888888-eeee%' OR id LIKE '99999999-ffff%' OR id LIKE 'aaaaaaaa-1111%' OR id LIKE 'bbbbbbbb-2222%' OR id LIKE 'cccccccc-3333%' OR id LIKE 'dddddddd-4444%' OR id LIKE 'eeeeeeee-5555%' OR id LIKE 'ffffffff-6666%' OR id LIKE '11111111-7777%' OR id LIKE '22222222-8888%' OR id LIKE '33333333-9999%' OR id LIKE '44444444-aaaa%' OR id LIKE '55555555-bbbb%' OR id LIKE '66666666-cccc%' OR id LIKE '77777777-dddd%'
UNION ALL
SELECT 'Discussions created:', COUNT(*) FROM restaurant_discussions WHERE id LIKE 'aaaaaaaa-aaaa%' OR id LIKE 'bbbbbbbb-bbbb%' OR id LIKE 'cccccccc-cccc%' OR id LIKE 'dddddddd-dddd%' OR id LIKE 'eeeeeeee-eeee%' OR id LIKE 'ffffffff-ffff%' OR id LIKE '11111111-aaaa%'
UNION ALL
SELECT 'User activities:', COUNT(*) FROM user_activities WHERE id LIKE '22222222-bbbb%' OR id LIKE '33333333-cccc%' OR id LIKE '44444444-dddd%' OR id LIKE '55555555-eeee%' OR id LIKE '66666666-ffff%' OR id LIKE '77777777-aaaa%' OR id LIKE '88888888-bbbb%' OR id LIKE '99999999-cccc%';
