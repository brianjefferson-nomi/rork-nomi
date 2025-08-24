-- Comprehensive Test Data with Collaborations
-- This creates realistic test data with multiple users, collections, and decision insights

-- First, let's create some test users
INSERT INTO users (id, email, name, avatar_url, bio, created_at) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'sarah@example.com', 'Sarah Johnson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 'Food enthusiast & restaurant explorer 🍽️', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'mike@example.com', 'Mike Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Adventure seeker and food lover', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'emma@example.com', 'Emma Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 'Culinary explorer and wine enthusiast', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'david@example.com', 'David Kim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 'Chef and restaurant critic', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'lisa@example.com', 'Lisa Thompson', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 'Food blogger and influencer', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'james@example.com', 'James Wilson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'Business executive and foodie', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'anna@example.com', 'Anna Martinez', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 'Travel blogger and food photographer', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'tom@example.com', 'Tom Anderson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Tech entrepreneur and restaurant investor', NOW());

-- Create some test restaurants
INSERT INTO restaurants (id, restaurant_code, name, cuisine, price_range, image_url, address, neighborhood, hours, vibe, description, rating, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LEBERN', 'Le Bernardin', 'French', '$$$$', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', '155 W 51st St, New York, NY', 'Midtown', 'Mon-Sat 5:00 PM - 10:30 PM', ARRAY['Elegant', 'Fine Dining', 'Seafood'], 'World-renowned seafood restaurant with exceptional service', 4.8, NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PERSE', 'Per Se', 'American', '$$$$', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', '10 Columbus Circle, New York, NY', 'Columbus Circle', 'Mon-Sun 5:30 PM - 10:00 PM', ARRAY['Luxury', 'Tasting Menu', 'Romantic'], 'Three-Michelin-starred restaurant with stunning Central Park views', 4.9, NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ELEVEN', 'Eleven Madison Park', 'American', '$$$$', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', '11 Madison Ave, New York, NY', 'Flatiron District', 'Wed-Sun 5:00 PM - 9:00 PM', ARRAY['Innovative', 'Plant-Based', 'Artistic'], 'Revolutionary plant-based fine dining experience', 4.7, NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'DANIEL', 'Daniel', 'French', '$$$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '60 E 65th St, New York, NY', 'Upper East Side', 'Tue-Sat 5:30 PM - 10:30 PM', ARRAY['Classic', 'Elegant', 'Romantic'], 'Timeless French cuisine in an elegant setting', 4.6, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'GRAMERCY', 'Gramercy Tavern', 'American', '$$$', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', '42 E 20th St, New York, NY', 'Gramercy', 'Mon-Sun 12:00 PM - 11:00 PM', ARRAY['Cozy', 'Seasonal', 'Comfortable'], 'Beloved neighborhood restaurant with seasonal American cuisine', 4.5, NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'BABBO', 'Babbo', 'Italian', '$$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '110 Waverly Pl, New York, NY', 'Greenwich Village', 'Mon-Sun 5:00 PM - 11:00 PM', ARRAY['Authentic', 'Rustic', 'Cozy'], 'Mario Batali''s acclaimed Italian restaurant', 4.4, NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'MOMOFUKU', 'Momofuku Ko', 'Asian', '$$$', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', '8 Extra Pl, New York, NY', 'East Village', 'Wed-Sun 5:30 PM - 10:00 PM', ARRAY['Innovative', 'Asian Fusion', 'Casual'], 'David Chang''s innovative tasting menu restaurant', 4.3, NOW()),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'KATZ', 'Katz''s Delicatessen', 'Jewish', '$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '205 E Houston St, New York, NY', 'Lower East Side', 'Mon-Sun 8:00 AM - 10:45 PM', ARRAY['Historic', 'Casual', 'Iconic'], 'Famous Jewish deli known for pastrami sandwiches', 4.2, NOW()),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'PETER', 'Peter Luger Steak House', 'American', '$$$', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', '178 Broadway, Brooklyn, NY', 'Williamsburg', 'Mon-Sun 11:45 AM - 9:45 PM', ARRAY['Classic', 'Steakhouse', 'Historic'], 'Legendary steakhouse since 1887', 4.1, NOW()),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'ROBERTS', 'Roberta''s', 'Pizza', '$$', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', '261 Moore St, Brooklyn, NY', 'Bushwick', 'Mon-Sun 11:00 AM - 12:00 AM', ARRAY['Artisanal', 'Pizza', 'Hip'], 'Artisanal pizza in a converted garage', 4.0, NOW());

-- Create collaborative collections with multiple members
INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, occasion, is_public, likes, equal_voting, admin_weighted, expertise_weighted, minimum_participation, allow_vote_changes, anonymous_voting, vote_visibility, discussion_enabled, auto_ranking_enabled, consensus_threshold, restaurant_ids, collaborators, created_at, updated_at) VALUES
-- Collection 1: Date Night Winners (4 members)
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'DATE_NIGHT_001', 'Date Night Winners', 'Perfect restaurants for romantic evenings', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'romantic', true, 15, true, false, false, 2, true, false, 'public', true, true, 60, 
 ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd'], 
 ARRAY['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'], 
 NOW(), NOW()),

-- Collection 2: Business Lunch Spots (5 members)
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'BUSINESS_001', 'Business Lunch Spots', 'Professional dining for client meetings', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'business', true, 23, true, false, false, 3, true, false, 'public', true, true, 50, 
 ARRAY['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg'], 
 ARRAY['f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007'], 
 NOW(), NOW()),

-- Collection 3: Foodie Adventures (6 members)
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'FOODIE_001', 'Foodie Adventures', 'Must-try restaurants for food enthusiasts', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'exploration', true, 31, true, false, false, 2, true, false, 'public', true, true, 40, 
 ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'], 
 ARRAY['f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008'], 
 NOW(), NOW()),

-- Collection 4: Budget Eats (4 members)
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'BUDGET_001', 'Budget Eats', 'Great food without breaking the bank', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'budget', true, 18, true, false, false, 2, true, false, 'public', true, true, 50, 
 ARRAY['hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj'], 
 ARRAY['f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007'], 
 NOW(), NOW()),

-- Collection 5: Celebrity Chef Spots (5 members)
('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'CELEBRITY_001', 'Celebrity Chef Spots', 'Restaurants by famous chefs', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'celebration', true, 27, true, false, false, 3, true, false, 'public', true, true, 60, 
 ARRAY['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg'], 
 ARRAY['f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440008'], 
 NOW(), NOW());

-- Create collection members for proper relationships
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at, vote_weight) VALUES
-- Date Night Winners members
('cm-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin', NOW(), 1),
('cm-002', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW(), 1),
('cm-003', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', '550e8400-e29b-41d4-a716-446655440003', 'member', NOW(), 1),
('cm-004', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', '550e8400-e29b-41d4-a716-446655440004', 'member', NOW(), 1),

-- Business Lunch Spots members
('cm-005', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '550e8400-e29b-41d4-a716-446655440002', 'admin', NOW(), 1),
('cm-006', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'member', NOW(), 1),
('cm-007', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW(), 1),
('cm-008', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '550e8400-e29b-41d4-a716-446655440006', 'member', NOW(), 1),
('cm-009', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '550e8400-e29b-41d4-a716-446655440007', 'member', NOW(), 1),

-- Foodie Adventures members
('cm-010', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '550e8400-e29b-41d4-a716-446655440003', 'admin', NOW(), 1),
('cm-011', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'member', NOW(), 1),
('cm-012', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW(), 1),
('cm-013', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '550e8400-e29b-41d4-a716-446655440004', 'member', NOW(), 1),
('cm-014', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW(), 1),
('cm-015', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '550e8400-e29b-41d4-a716-446655440008', 'member', NOW(), 1),

-- Budget Eats members
('cm-016', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '550e8400-e29b-41d4-a716-446655440004', 'admin', NOW(), 1),
('cm-017', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'member', NOW(), 1),
('cm-018', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW(), 1),
('cm-019', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '550e8400-e29b-41d4-a716-446655440007', 'member', NOW(), 1),

-- Celebrity Chef Spots members
('cm-020', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', '550e8400-e29b-41d4-a716-446655440005', 'admin', NOW(), 1),
('cm-021', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'member', NOW(), 1),
('cm-022', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', '550e8400-e29b-41d4-a716-446655440003', 'member', NOW(), 1),
('cm-023', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', '550e8400-e29b-41d4-a716-446655440006', 'member', NOW(), 1),
('cm-024', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', '550e8400-e29b-41d4-a716-446655440008', 'member', NOW(), 1);

-- Create restaurant votes with diverse opinions for decision insights
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, timestamp, reason, authority, weight) VALUES
-- Date Night Winners votes (showing consensus building)
('vote-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '2 days', 'Perfect for special occasions', 'admin', 1),
('vote-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440002', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '2 days', 'Amazing seafood and service', 'regular', 1),
('vote-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440003', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '1 day', 'Romantic atmosphere', 'regular', 1),
('vote-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440004', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'dislike', NOW() - INTERVAL '1 day', 'Too expensive for regular dates', 'regular', 1),

('vote-005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '3 days', 'Stunning views and food', 'admin', 1),
('vote-006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440002', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '3 days', 'Worth every penny', 'regular', 1),
('vote-007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440003', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '2 days', 'Perfect for anniversaries', 'regular', 1),
('vote-008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440004', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'like', NOW() - INTERVAL '2 days', 'Exceptional experience', 'regular', 1),

-- Business Lunch Spots votes (showing debate)
('vote-009', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '550e8400-e29b-41d4-a716-446655440002', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'like', NOW() - INTERVAL '1 day', 'Perfect for client meetings', 'admin', 1),
('vote-010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'like', NOW() - INTERVAL '1 day', 'Professional atmosphere', 'regular', 1),
('vote-011', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '550e8400-e29b-41d4-a716-446655440005', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'dislike', NOW() - INTERVAL '1 day', 'Too casual for business', 'regular', 1),
('vote-012', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '550e8400-e29b-41d4-a716-446655440006', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'like', NOW() - INTERVAL '1 day', 'Great food and service', 'regular', 1),
('vote-013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '550e8400-e29b-41d4-a716-446655440007', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'like', NOW() - INTERVAL '1 day', 'Reliable choice', 'regular', 1),

-- Foodie Adventures votes (showing diverse opinions)
('vote-014', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440003', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'like', NOW() - INTERVAL '2 days', 'Revolutionary plant-based cuisine', 'admin', 1),
('vote-015', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'like', NOW() - INTERVAL '2 days', 'Innovative and delicious', 'regular', 1),
('vote-016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440002', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'dislike', NOW() - INTERVAL '2 days', 'Too experimental for my taste', 'regular', 1),
('vote-017', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440004', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'like', NOW() - INTERVAL '1 day', 'Amazing creativity', 'regular', 1),
('vote-018', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440005', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'like', NOW() - INTERVAL '1 day', 'Must-try experience', 'regular', 1),
('vote-019', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440008', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'dislike', NOW() - INTERVAL '1 day', 'Not worth the price', 'regular', 1),

-- Budget Eats votes (showing agreement)
('vote-020', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '550e8400-e29b-41d4-a716-446655440004', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'like', NOW() - INTERVAL '1 day', 'Best pastrami in NYC', 'admin', 1),
('vote-021', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'like', NOW() - INTERVAL '1 day', 'Classic NYC experience', 'regular', 1),
('vote-022', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '550e8400-e29b-41d4-a716-446655440002', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'like', NOW() - INTERVAL '1 day', 'Great value for money', 'regular', 1),
('vote-023', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '550e8400-e29b-41d4-a716-446655440007', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'like', NOW() - INTERVAL '1 day', 'Authentic deli experience', 'regular', 1),

-- Celebrity Chef Spots votes (showing mixed opinions)
('vote-024', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '550e8400-e29b-41d4-a716-446655440005', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'like', NOW() - INTERVAL '2 days', 'Batali''s best restaurant', 'admin', 1),
('vote-025', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'like', NOW() - INTERVAL '2 days', 'Authentic Italian cuisine', 'regular', 1),
('vote-026', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '550e8400-e29b-41d4-a716-446655440003', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'dislike', NOW() - INTERVAL '2 days', 'Overrated and expensive', 'regular', 1),
('vote-027', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '550e8400-e29b-41d4-a716-446655440006', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'like', NOW() - INTERVAL '1 day', 'Great pasta dishes', 'regular', 1),
('vote-028', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '550e8400-e29b-41d4-a716-446655440008', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'dislike', NOW() - INTERVAL '1 day', 'Too crowded and noisy', 'regular', 1);

-- Create restaurant discussions for engagement
INSERT INTO restaurant_discussions (id, restaurant_id, collection_id, user_id, message, timestamp, likes) VALUES
('disc-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Has anyone tried their tasting menu? Worth the splurge?', NOW() - INTERVAL '2 days', 3),
('disc-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', '550e8400-e29b-41d4-a716-446655440002', 'The wine pairing is incredible! Highly recommend.', NOW() - INTERVAL '2 days', 2),
('disc-003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', '550e8400-e29b-41d4-a716-446655440003', 'Perfect for anniversary dinners. The service is impeccable.', NOW() - INTERVAL '3 days', 4),
('disc-004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '550e8400-e29b-41d4-a716-446655440002', 'Great for client lunches. Professional but not stuffy.', NOW() - INTERVAL '1 day', 2),
('disc-005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '550e8400-e29b-41d4-a716-446655440003', 'The plant-based menu is revolutionary! Must try.', NOW() - INTERVAL '2 days', 5),
('disc-006', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '550e8400-e29b-41d4-a716-446655440004', 'Best pastrami sandwich in the city!', NOW() - INTERVAL '1 day', 3),
('disc-007', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', '550e8400-e29b-41d4-a716-446655440005', 'The pasta tasting menu is amazing!', NOW() - INTERVAL '2 days', 2);

-- Create user activities for engagement tracking
INSERT INTO user_activities (id, user_id, type, restaurant_id, collection_id, content, timestamp) VALUES
('act-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'collection', NULL, 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Created Date Night Winners collection', NOW() - INTERVAL '5 days'),
('act-002', '550e8400-e29b-41d4-a716-446655440002', 'vote', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Liked Le Bernardin', NOW() - INTERVAL '2 days'),
('act-003', '550e8400-e29b-41d4-a716-446655440003', 'discussion', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Started discussion about tasting menu', NOW() - INTERVAL '2 days'),
('act-004', '550e8400-e29b-41d4-a716-446655440004', 'vote', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Disliked Le Bernardin (too expensive)', NOW() - INTERVAL '1 day'),
('act-005', '550e8400-e29b-41d4-a716-446655440002', 'collection', NULL, 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Created Business Lunch Spots collection', NOW() - INTERVAL '4 days'),
('act-006', '550e8400-e29b-41d4-a716-446655440003', 'collection', NULL, 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Created Foodie Adventures collection', NOW() - INTERVAL '3 days'),
('act-007', '550e8400-e29b-41d4-a716-446655440004', 'collection', NULL, 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Created Budget Eats collection', NOW() - INTERVAL '3 days'),
('act-008', '550e8400-e29b-41d4-a716-446655440005', 'collection', NULL, 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'Created Celebrity Chef Spots collection', NOW() - INTERVAL '2 days');

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
SELECT 'Users created:' as info, COUNT(*) as count FROM users WHERE id LIKE 'f47ac10b%' OR id LIKE '550e8400%'
UNION ALL
SELECT 'Restaurants created:', COUNT(*) FROM restaurants WHERE id LIKE 'aaaaaaaa%' OR id LIKE 'bbbbbbbb%' OR id LIKE 'cccccccc%' OR id LIKE 'dddddddd%' OR id LIKE 'eeeeeeee%' OR id LIKE 'ffffffff%' OR id LIKE 'gggggggg%' OR id LIKE 'hhhhhhhh%' OR id LIKE 'iiiiiiii%' OR id LIKE 'jjjjjjjj%'
UNION ALL
SELECT 'Collections created:', COUNT(*) FROM collections WHERE id LIKE 'f47ac10b%'
UNION ALL
SELECT 'Collection members:', COUNT(*) FROM collection_members WHERE id LIKE 'cm-%'
UNION ALL
SELECT 'Restaurant votes:', COUNT(*) FROM restaurant_votes WHERE id LIKE 'vote-%'
UNION ALL
SELECT 'Discussions created:', COUNT(*) FROM restaurant_discussions WHERE id LIKE 'disc-%'
UNION ALL
SELECT 'User activities:', COUNT(*) FROM user_activities WHERE id LIKE 'act-%';
