-- Comprehensive Test Data with Collaborations
-- This creates realistic test data with multiple users, collections, and decision insights

-- First, let's create some test users
INSERT INTO users (id, email, name, avatar_url, bio, created_at) VALUES
('12345678-1234-1234-1234-123456789abc', 'sarah@example.com', 'Sarah Johnson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 'Food enthusiast & restaurant explorer 🍽️', NOW()),
('23456789-2345-2345-2345-234567890bcd', 'mike@example.com', 'Mike Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Adventure seeker and food lover', NOW()),
('34567890-3456-3456-3456-345678901cde', 'emma@example.com', 'Emma Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 'Culinary explorer and wine enthusiast', NOW()),
('45678901-4567-4567-4567-456789012def', 'david@example.com', 'David Kim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 'Chef and restaurant critic', NOW()),
('56789012-5678-5678-5678-567890123efg', 'lisa@example.com', 'Lisa Thompson', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 'Food blogger and influencer', NOW()),
('67890123-6789-6789-6789-678901234fgh', 'james@example.com', 'James Wilson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'Business executive and foodie', NOW()),
('78901234-7890-7890-7890-789012345ghi', 'anna@example.com', 'Anna Martinez', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 'Travel blogger and food photographer', NOW()),
('89012345-8901-8901-8901-890123456hij', 'tom@example.com', 'Tom Anderson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Tech entrepreneur and restaurant investor', NOW());

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
('abcdef12-abcd-abcd-abcd-abcdef123456', 'DATE_NIGHT_001', 'Date Night Winners', 'Perfect restaurants for romantic evenings', '12345678-1234-1234-1234-123456789abc', '12345678-1234-1234-1234-123456789abc', 'romantic', true, 15, true, false, false, 2, true, false, 'public', true, true, 60, 
 ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd'], 
 ARRAY['23456789-2345-2345-2345-234567890bcd', '34567890-3456-3456-3456-345678901cde', '45678901-4567-4567-4567-456789012def'], 
 NOW(), NOW()),

-- Collection 2: Business Lunch Spots (5 members)
('bcdef123-bcde-bcde-bcde-bcdef1234567', 'BUSINESS_001', 'Business Lunch Spots', 'Professional dining for client meetings', '23456789-2345-2345-2345-234567890bcd', '23456789-2345-2345-2345-234567890bcd', 'business', true, 23, true, false, false, 3, true, false, 'public', true, true, 50, 
 ARRAY['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg'], 
 ARRAY['12345678-1234-1234-1234-123456789abc', '56789012-5678-5678-5678-567890123efg', '67890123-6789-6789-6789-678901234fgh', '78901234-7890-7890-7890-789012345ghi'], 
 NOW(), NOW()),

-- Collection 3: Foodie Adventures (6 members)
('cdef1234-cdef-cdef-cdef-cdef12345678', 'FOODIE_001', 'Foodie Adventures', 'Must-try restaurants for food enthusiasts', '34567890-3456-3456-3456-345678901cde', '34567890-3456-3456-3456-345678901cde', 'exploration', true, 31, true, false, false, 2, true, false, 'public', true, true, 40, 
 ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'], 
 ARRAY['12345678-1234-1234-1234-123456789abc', '23456789-2345-2345-2345-234567890bcd', '45678901-4567-4567-4567-456789012def', '56789012-5678-5678-5678-567890123efg', '89012345-8901-8901-8901-890123456hij'], 
 NOW(), NOW()),

-- Collection 4: Budget Eats (4 members)
('def12345-def1-def1-def1-def123456789', 'BUDGET_001', 'Budget Eats', 'Great food without breaking the bank', '45678901-4567-4567-4567-456789012def', '45678901-4567-4567-4567-456789012def', 'budget', true, 18, true, false, false, 2, true, false, 'public', true, true, 50, 
 ARRAY['hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj'], 
 ARRAY['12345678-1234-1234-1234-123456789abc', '23456789-2345-2345-2345-234567890bcd', '78901234-7890-7890-7890-789012345ghi'], 
 NOW(), NOW()),

-- Collection 5: Celebrity Chef Spots (5 members)
('ef123456-ef12-ef12-ef12-ef1234567890', 'CELEBRITY_001', 'Celebrity Chef Spots', 'Restaurants by famous chefs', '56789012-5678-5678-5678-567890123efg', '56789012-5678-5678-5678-567890123efg', 'celebration', true, 27, true, false, false, 3, true, false, 'public', true, true, 60, 
 ARRAY['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg'], 
 ARRAY['12345678-1234-1234-1234-123456789abc', '34567890-3456-3456-3456-345678901cde', '67890123-6789-6789-6789-678901234fgh', '89012345-8901-8901-8901-890123456hij'], 
 NOW(), NOW());

-- Create collection members for proper relationships
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at, vote_weight) VALUES
-- Date Night Winners members
('cm-001', 'abcdef12-abcd-abcd-abcd-abcdef123456', '12345678-1234-1234-1234-123456789abc', 'admin', NOW(), 1),
('cm-002', 'abcdef12-abcd-abcd-abcd-abcdef123456', '23456789-2345-2345-2345-234567890bcd', 'member', NOW(), 1),
('cm-003', 'abcdef12-abcd-abcd-abcd-abcdef123456', '34567890-3456-3456-3456-345678901cde', 'member', NOW(), 1),
('cm-004', 'abcdef12-abcd-abcd-abcd-abcdef123456', '45678901-4567-4567-4567-456789012def', 'member', NOW(), 1),

-- Business Lunch Spots members
('cm-005', 'bcdef123-bcde-bcde-bcde-bcdef1234567', '23456789-2345-2345-2345-234567890bcd', 'admin', NOW(), 1),
('cm-006', 'bcdef123-bcde-bcde-bcde-bcdef1234567', '12345678-1234-1234-1234-123456789abc', 'member', NOW(), 1),
('cm-007', 'bcdef123-bcde-bcde-bcde-bcdef1234567', '56789012-5678-5678-5678-567890123efg', 'member', NOW(), 1),
('cm-008', 'bcdef123-bcde-bcde-bcde-bcdef1234567', '67890123-6789-6789-6789-678901234fgh', 'member', NOW(), 1),
('cm-009', 'bcdef123-bcde-bcde-bcde-bcdef1234567', '78901234-7890-7890-7890-789012345ghi', 'member', NOW(), 1),

-- Foodie Adventures members
('cm-010', 'cdef1234-cdef-cdef-cdef-cdef12345678', '34567890-3456-3456-3456-345678901cde', 'admin', NOW(), 1),
('cm-011', 'cdef1234-cdef-cdef-cdef-cdef12345678', '12345678-1234-1234-1234-123456789abc', 'member', NOW(), 1),
('cm-012', 'cdef1234-cdef-cdef-cdef-cdef12345678', '23456789-2345-2345-2345-234567890bcd', 'member', NOW(), 1),
('cm-013', 'cdef1234-cdef-cdef-cdef-cdef12345678', '45678901-4567-4567-4567-456789012def', 'member', NOW(), 1),
('cm-014', 'cdef1234-cdef-cdef-cdef-cdef12345678', '56789012-5678-5678-5678-567890123efg', 'member', NOW(), 1),
('cm-015', 'cdef1234-cdef-cdef-cdef-cdef12345678', '89012345-8901-8901-8901-890123456hij', 'member', NOW(), 1),

-- Budget Eats members
('cm-016', 'def12345-def1-def1-def1-def123456789', '45678901-4567-4567-4567-456789012def', 'admin', NOW(), 1),
('cm-017', 'def12345-def1-def1-def1-def123456789', '12345678-1234-1234-1234-123456789abc', 'member', NOW(), 1),
('cm-018', 'def12345-def1-def1-def1-def123456789', '23456789-2345-2345-2345-234567890bcd', 'member', NOW(), 1),
('cm-019', 'def12345-def1-def1-def1-def123456789', '78901234-7890-7890-7890-789012345ghi', 'member', NOW(), 1),

-- Celebrity Chef Spots members
('cm-020', 'ef123456-ef12-ef12-ef12-ef1234567890', '56789012-5678-5678-5678-567890123efg', 'admin', NOW(), 1),
('cm-021', 'ef123456-ef12-ef12-ef12-ef1234567890', '12345678-1234-1234-1234-123456789abc', 'member', NOW(), 1),
('cm-022', 'ef123456-ef12-ef12-ef12-ef1234567890', '34567890-3456-3456-3456-345678901cde', 'member', NOW(), 1),
('cm-023', 'ef123456-ef12-ef12-ef12-ef1234567890', '67890123-6789-6789-6789-678901234fgh', 'member', NOW(), 1),
('cm-024', 'ef123456-ef12-ef12-ef12-ef1234567890', '89012345-8901-8901-8901-890123456hij', 'member', NOW(), 1);

-- Create restaurant votes with diverse opinions for decision insights
INSERT INTO restaurant_votes (id, restaurant_id, user_id, collection_id, vote, timestamp, reason, authority, weight) VALUES
-- Date Night Winners votes (showing consensus building)
('vote-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12345678-1234-1234-1234-123456789abc', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '2 days', 'Perfect for special occasions', 'admin', 1),
('vote-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '23456789-2345-2345-2345-234567890bcd', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '2 days', 'Amazing seafood and service', 'regular', 1),
('vote-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '34567890-3456-3456-3456-345678901cde', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '1 day', 'Romantic atmosphere', 'regular', 1),
('vote-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '45678901-4567-4567-4567-456789012def', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'dislike', NOW() - INTERVAL '1 day', 'Too expensive for regular dates', 'regular', 1),

('vote-005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '12345678-1234-1234-1234-123456789abc', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '3 days', 'Stunning views and food', 'admin', 1),
('vote-006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '23456789-2345-2345-2345-234567890bcd', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '3 days', 'Worth every penny', 'regular', 1),
('vote-007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '34567890-3456-3456-3456-345678901cde', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '2 days', 'Perfect for anniversaries', 'regular', 1),
('vote-008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '45678901-4567-4567-4567-456789012def', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'like', NOW() - INTERVAL '2 days', 'Exceptional experience', 'regular', 1),

-- Business Lunch Spots votes (showing debate)
('vote-009', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '23456789-2345-2345-2345-234567890bcd', 'bcdef123-bcde-bcde-bcde-bcdef1234567', 'like', NOW() - INTERVAL '1 day', 'Perfect for client meetings', 'admin', 1),
('vote-010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '12345678-1234-1234-1234-123456789abc', 'bcdef123-bcde-bcde-bcde-bcdef1234567', 'like', NOW() - INTERVAL '1 day', 'Professional atmosphere', 'regular', 1),
('vote-011', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '56789012-5678-5678-5678-567890123efg', 'bcdef123-bcde-bcde-bcde-bcdef1234567', 'dislike', NOW() - INTERVAL '1 day', 'Too casual for business', 'regular', 1),
('vote-012', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '67890123-6789-6789-6789-678901234fgh', 'bcdef123-bcde-bcde-bcde-bcdef1234567', 'like', NOW() - INTERVAL '1 day', 'Great food and service', 'regular', 1),
('vote-013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '78901234-7890-7890-7890-789012345ghi', 'bcdef123-bcde-bcde-bcde-bcdef1234567', 'like', NOW() - INTERVAL '1 day', 'Reliable choice', 'regular', 1),

-- Foodie Adventures votes (showing diverse opinions)
('vote-014', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '34567890-3456-3456-3456-345678901cde', 'cdef1234-cdef-cdef-cdef-cdef12345678', 'like', NOW() - INTERVAL '2 days', 'Revolutionary plant-based cuisine', 'admin', 1),
('vote-015', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '12345678-1234-1234-1234-123456789abc', 'cdef1234-cdef-cdef-cdef-cdef12345678', 'like', NOW() - INTERVAL '2 days', 'Innovative and delicious', 'regular', 1),
('vote-016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '23456789-2345-2345-2345-234567890bcd', 'cdef1234-cdef-cdef-cdef-cdef12345678', 'dislike', NOW() - INTERVAL '2 days', 'Too experimental for my taste', 'regular', 1),
('vote-017', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '45678901-4567-4567-4567-456789012def', 'cdef1234-cdef-cdef-cdef-cdef12345678', 'like', NOW() - INTERVAL '1 day', 'Amazing creativity', 'regular', 1),
('vote-018', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '56789012-5678-5678-5678-567890123efg', 'cdef1234-cdef-cdef-cdef-cdef12345678', 'like', NOW() - INTERVAL '1 day', 'Must-try experience', 'regular', 1),
('vote-019', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '89012345-8901-8901-8901-890123456hij', 'cdef1234-cdef-cdef-cdef-cdef12345678', 'dislike', NOW() - INTERVAL '1 day', 'Not worth the price', 'regular', 1),

-- Budget Eats votes (showing agreement)
('vote-020', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '45678901-4567-4567-4567-456789012def', 'def12345-def1-def1-def1-def123456789', 'like', NOW() - INTERVAL '1 day', 'Best pastrami in NYC', 'admin', 1),
('vote-021', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '12345678-1234-1234-1234-123456789abc', 'def12345-def1-def1-def1-def123456789', 'like', NOW() - INTERVAL '1 day', 'Classic NYC experience', 'regular', 1),
('vote-022', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '23456789-2345-2345-2345-234567890bcd', 'def12345-def1-def1-def1-def123456789', 'like', NOW() - INTERVAL '1 day', 'Great value for money', 'regular', 1),
('vote-023', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '78901234-7890-7890-7890-789012345ghi', 'def12345-def1-def1-def1-def123456789', 'like', NOW() - INTERVAL '1 day', 'Authentic deli experience', 'regular', 1),

-- Celebrity Chef Spots votes (showing mixed opinions)
('vote-024', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '56789012-5678-5678-5678-567890123efg', 'ef123456-ef12-ef12-ef12-ef1234567890', 'like', NOW() - INTERVAL '2 days', 'Batali''s best restaurant', 'admin', 1),
('vote-025', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '12345678-1234-1234-1234-123456789abc', 'ef123456-ef12-ef12-ef12-ef1234567890', 'like', NOW() - INTERVAL '2 days', 'Authentic Italian cuisine', 'regular', 1),
('vote-026', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '34567890-3456-3456-3456-345678901cde', 'ef123456-ef12-ef12-ef12-ef1234567890', 'dislike', NOW() - INTERVAL '2 days', 'Overrated and expensive', 'regular', 1),
('vote-027', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '67890123-6789-6789-6789-678901234fgh', 'ef123456-ef12-ef12-ef12-ef1234567890', 'like', NOW() - INTERVAL '1 day', 'Great pasta dishes', 'regular', 1),
('vote-028', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '89012345-8901-8901-8901-890123456hij', 'ef123456-ef12-ef12-ef12-ef1234567890', 'dislike', NOW() - INTERVAL '1 day', 'Too crowded and noisy', 'regular', 1);

-- Create restaurant discussions for engagement
INSERT INTO restaurant_discussions (id, restaurant_id, collection_id, user_id, message, timestamp, likes) VALUES
('disc-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'abcdef12-abcd-abcd-abcd-abcdef123456', '12345678-1234-1234-1234-123456789abc', 'Has anyone tried their tasting menu? Worth the splurge?', NOW() - INTERVAL '2 days', 3),
('disc-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'abcdef12-abcd-abcd-abcd-abcdef123456', '23456789-2345-2345-2345-234567890bcd', 'The wine pairing is incredible! Highly recommend.', NOW() - INTERVAL '2 days', 2),
('disc-003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'abcdef12-abcd-abcd-abcd-abcdef123456', '34567890-3456-3456-3456-345678901cde', 'Perfect for anniversary dinners. The service is impeccable.', NOW() - INTERVAL '3 days', 4),
('disc-004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bcdef123-bcde-bcde-bcde-bcdef1234567', '23456789-2345-2345-2345-234567890bcd', 'Great for client lunches. Professional but not stuffy.', NOW() - INTERVAL '1 day', 2),
('disc-005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cdef1234-cdef-cdef-cdef-cdef12345678', '34567890-3456-3456-3456-345678901cde', 'The plant-based menu is revolutionary! Must try.', NOW() - INTERVAL '2 days', 5),
('disc-006', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'def12345-def1-def1-def1-def123456789', '45678901-4567-4567-4567-456789012def', 'Best pastrami sandwich in the city!', NOW() - INTERVAL '1 day', 3),
('disc-007', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'ef123456-ef12-ef12-ef12-ef1234567890', '56789012-5678-5678-5678-567890123efg', 'The pasta tasting menu is amazing!', NOW() - INTERVAL '2 days', 2);

-- Create user activities for engagement tracking
INSERT INTO user_activities (id, user_id, type, restaurant_id, collection_id, content, timestamp) VALUES
('act-001', '12345678-1234-1234-1234-123456789abc', 'collection', NULL, 'abcdef12-abcd-abcd-abcd-abcdef123456', 'Created Date Night Winners collection', NOW() - INTERVAL '5 days'),
('act-002', '23456789-2345-2345-2345-234567890bcd', 'vote', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'Liked Le Bernardin', NOW() - INTERVAL '2 days'),
('act-003', '34567890-3456-3456-3456-345678901cde', 'discussion', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'Started discussion about tasting menu', NOW() - INTERVAL '2 days'),
('act-004', '45678901-4567-4567-4567-456789012def', 'vote', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'abcdef12-abcd-abcd-abcd-abcdef123456', 'Disliked Le Bernardin (too expensive)', NOW() - INTERVAL '1 day'),
('act-005', '23456789-2345-2345-2345-234567890bcd', 'collection', NULL, 'bcdef123-bcde-bcde-bcde-bcdef1234567', 'Created Business Lunch Spots collection', NOW() - INTERVAL '4 days'),
('act-006', '34567890-3456-3456-3456-345678901cde', 'collection', NULL, 'cdef1234-cdef-cdef-cdef-cdef12345678', 'Created Foodie Adventures collection', NOW() - INTERVAL '3 days'),
('act-007', '45678901-4567-4567-4567-456789012def', 'collection', NULL, 'def12345-def1-def1-def1-def123456789', 'Created Budget Eats collection', NOW() - INTERVAL '3 days'),
('act-008', '56789012-5678-5678-5678-567890123efg', 'collection', NULL, 'ef123456-ef12-ef12-ef12-ef1234567890', 'Created Celebrity Chef Spots collection', NOW() - INTERVAL '2 days');

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
SELECT 'Users created:' as info, COUNT(*) as count FROM users WHERE id LIKE '12345678%' OR id LIKE '23456789%' OR id LIKE '34567890%' OR id LIKE '45678901%' OR id LIKE '56789012%' OR id LIKE '67890123%' OR id LIKE '78901234%' OR id LIKE '89012345%'
UNION ALL
SELECT 'Restaurants created:', COUNT(*) FROM restaurants WHERE id LIKE 'aaaaaaaa%' OR id LIKE 'bbbbbbbb%' OR id LIKE 'cccccccc%' OR id LIKE 'dddddddd%' OR id LIKE 'eeeeeeee%' OR id LIKE 'ffffffff%' OR id LIKE 'gggggggg%' OR id LIKE 'hhhhhhhh%' OR id LIKE 'iiiiiiii%' OR id LIKE 'jjjjjjjj%'
UNION ALL
SELECT 'Collections created:', COUNT(*) FROM collections WHERE id LIKE 'abcdef12%' OR id LIKE 'bcdef123%' OR id LIKE 'cdef1234%' OR id LIKE 'def12345%' OR id LIKE 'ef123456%'
UNION ALL
SELECT 'Collection members:', COUNT(*) FROM collection_members WHERE id LIKE 'cm-%'
UNION ALL
SELECT 'Restaurant votes:', COUNT(*) FROM restaurant_votes WHERE id LIKE 'vote-%'
UNION ALL
SELECT 'Discussions created:', COUNT(*) FROM restaurant_discussions WHERE id LIKE 'disc-%'
UNION ALL
SELECT 'User activities:', COUNT(*) FROM user_activities WHERE id LIKE 'act-%';
