-- Test Data for Supabase Database
-- Run this after setting up the database schema

-- Insert test users
INSERT INTO users (id, email, name, avatar_url, bio, favorite_restaurants, review_count, photo_count, tip_count, checkin_count, follower_count, following_count, is_local_expert, expert_areas, joined_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', 'Alice Johnson', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Food enthusiast and restaurant explorer', ARRAY['Pizza Palace', 'Sushi Master'], 12, 8, 5, 15, 45, 23, true, ARRAY['Italian', 'Japanese'], '2024-01-15'),
('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', 'Bob Smith', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Local food blogger and critic', ARRAY['Burger Joint', 'Taco Town'], 8, 12, 3, 22, 67, 34, true, ARRAY['American', 'Mexican'], '2024-02-01'),
('550e8400-e29b-41d4-a716-446655440003', 'carol@example.com', 'Carol Davis', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Brunch specialist and coffee lover', ARRAY['Cafe Central', 'Brunch Spot'], 15, 6, 7, 18, 28, 19, false, ARRAY['Cafe', 'Brunch'], '2024-01-20'),
('550e8400-e29b-41d4-a716-446655440004', 'dave@example.com', 'Dave Wilson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Adventure seeker and foodie', ARRAY['Adventure Eats', 'Street Food'], 6, 15, 4, 12, 15, 8, false, ARRAY['Street Food', 'Adventure'], '2024-02-10'),
('550e8400-e29b-41d4-a716-446655440005', 'eve@example.com', 'Eve Brown', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Fine dining connoisseur', ARRAY['Luxury Dining', 'Wine Bar'], 20, 4, 10, 8, 89, 45, true, ARRAY['Fine Dining', 'Wine'], '2024-01-05');

-- Insert test restaurants
INSERT INTO restaurants (id, name, cuisine, price_range, image_url, images, address, neighborhood, hours, vibe, description, menu_highlights, rating, reviews, ai_description, ai_vibes, ai_top_picks, phone, website, price_level, vibe_tags, booking_url, latitude, longitude) VALUES
('rest-001', 'Pizza Palace', 'Italian', '$$', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', ARRAY['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'], '123 Main St', 'Downtown', '11:00 AM - 10:00 PM', ARRAY['Casual', 'Family-friendly'], 'Authentic Italian pizza with fresh ingredients and wood-fired ovens', ARRAY['Margherita Pizza', 'Pepperoni Supreme', 'Truffle Mushroom'], 4.5, ARRAY['Amazing pizza!', 'Great atmosphere'], 'Cozy Italian pizzeria with authentic flavors and warm atmosphere', ARRAY['Casual', 'Authentic', 'Family-friendly'], ARRAY['Margherita Pizza', 'Pepperoni Supreme', 'Truffle Mushroom'], '+1-555-0123', 'https://pizzapalace.com', 2, ARRAY['casual', 'family', 'authentic'], 'https://opentable.com/pizza-palace', 40.7128, -74.0060),
('rest-002', 'Sushi Master', 'Japanese', '$$$', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', ARRAY['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400'], '456 Oak Ave', 'Midtown', '12:00 PM - 11:00 PM', ARRAY['Upscale', 'Romantic'], 'Premium sushi and sashimi with fresh fish flown in daily', ARRAY['Dragon Roll', 'Salmon Nigiri', 'Miso Soup'], 4.8, ARRAY['Best sushi in town!', 'Amazing quality'], 'Elegant Japanese restaurant serving premium sushi and traditional dishes', ARRAY['Upscale', 'Authentic', 'Romantic'], ARRAY['Dragon Roll', 'Salmon Nigiri', 'Miso Soup'], '+1-555-0124', 'https://sushimaster.com', 3, ARRAY['upscale', 'romantic', 'authentic'], 'https://opentable.com/sushi-master', 40.7589, -73.9851),
('rest-003', 'Burger Joint', 'American', '$', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ARRAY['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], '789 Pine St', 'Brooklyn', '11:00 AM - 12:00 AM', ARRAY['Casual', 'Quick'], 'Classic American burgers with hand-cut fries and milkshakes', ARRAY['Classic Burger', 'Bacon Cheeseburger', 'Truffle Fries'], 4.2, ARRAY['Great burgers!', 'Fast service'], 'Casual burger joint with classic American comfort food', ARRAY['Casual', 'Quick', 'Comfort'], ARRAY['Classic Burger', 'Bacon Cheeseburger', 'Truffle Fries'], '+1-555-0125', 'https://burgerjoint.com', 1, ARRAY['casual', 'quick', 'comfort'], NULL, 40.7182, -73.9584),
('rest-004', 'Taco Town', 'Mexican', '$', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', ARRAY['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400'], '321 Elm St', 'Queens', '10:00 AM - 11:00 PM', ARRAY['Casual', 'Authentic'], 'Authentic Mexican tacos with homemade tortillas and fresh salsa', ARRAY['Carne Asada Tacos', 'Fish Tacos', 'Guacamole'], 4.6, ARRAY['Authentic Mexican!', 'Best tacos ever'], 'Authentic Mexican taqueria with fresh ingredients and traditional recipes', ARRAY['Authentic', 'Casual', 'Traditional'], ARRAY['Carne Asada Tacos', 'Fish Tacos', 'Guacamole'], '+1-555-0126', 'https://tacotown.com', 1, ARRAY['authentic', 'casual', 'traditional'], NULL, 40.7505, -73.9934),
('rest-005', 'Cafe Central', 'Cafe', '$$', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'], '654 Maple Dr', 'Manhattan', '7:00 AM - 8:00 PM', ARRAY['Cozy', 'Artistic'], 'Cozy cafe with artisanal coffee and fresh pastries', ARRAY['Avocado Toast', 'Cappuccino', 'Croissant'], 4.4, ARRAY['Great coffee!', 'Cozy atmosphere'], 'Charming cafe with artisanal coffee and fresh pastries', ARRAY['Cozy', 'Artistic', 'Relaxed'], ARRAY['Avocado Toast', 'Cappuccino', 'Croissant'], '+1-555-0127', 'https://cafecentral.com', 2, ARRAY['cozy', 'artistic', 'relaxed'], NULL, 40.7614, -73.9776),
('rest-006', 'Brunch Spot', 'American', '$$', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', ARRAY['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400'], '987 Cedar Ln', 'Brooklyn', '8:00 AM - 4:00 PM', ARRAY['Trendy', 'Instagram-worthy'], 'Trendy brunch spot with creative dishes and bottomless mimosas', ARRAY['Eggs Benedict', 'Pancakes', 'Mimosa'], 4.3, ARRAY['Perfect brunch!', 'Great vibes'], 'Trendy brunch destination with creative dishes and Instagram-worthy presentation', ARRAY['Trendy', 'Instagram-worthy', 'Creative'], ARRAY['Eggs Benedict', 'Pancakes', 'Mimosa'], '+1-555-0128', 'https://brunchspot.com', 2, ARRAY['trendy', 'instagram', 'creative'], 'https://opentable.com/brunch-spot', 40.7021, -73.9872),
('rest-007', 'Adventure Eats', 'Fusion', '$$$', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400'], '147 Birch Rd', 'Manhattan', '6:00 PM - 11:00 PM', ARRAY['Adventurous', 'Experimental'], 'Experimental fusion cuisine with unique flavor combinations', ARRAY['Duck Confit Tacos', 'Sushi Burrito', 'Molecular Gastronomy'], 4.7, ARRAY['Amazing fusion!', 'Unique experience'], 'Experimental fusion restaurant pushing culinary boundaries', ARRAY['Adventurous', 'Experimental', 'Innovative'], ARRAY['Duck Confit Tacos', 'Sushi Burrito', 'Molecular Gastronomy'], '+1-555-0129', 'https://adventureeats.com', 3, ARRAY['adventurous', 'experimental', 'innovative'], 'https://opentable.com/adventure-eats', 40.7505, -73.9934),
('rest-008', 'Street Food', 'International', '$', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', ARRAY['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'], '258 Spruce St', 'Queens', '11:00 AM - 10:00 PM', ARRAY['Casual', 'Diverse'], 'International street food from around the world', ARRAY['Pad Thai', 'Falafel Wrap', 'Curry'], 4.1, ARRAY['Great variety!', 'Authentic flavors'], 'International street food market with diverse global cuisines', ARRAY['Diverse', 'Casual', 'Global'], ARRAY['Pad Thai', 'Falafel Wrap', 'Curry'], '+1-555-0130', 'https://streetfood.com', 1, ARRAY['diverse', 'casual', 'global'], NULL, 40.7182, -73.9584),
('rest-009', 'Luxury Dining', 'French', '$$$$', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'], '369 Luxury Ave', 'Manhattan', '5:30 PM - 11:00 PM', ARRAY['Luxurious', 'Elegant'], 'Fine dining French restaurant with Michelin-starred chef', ARRAY['Foie Gras', 'Truffle Risotto', 'Wine Pairing'], 4.9, ARRAY['Exquisite dining!', 'Worth every penny'], 'Luxurious French fine dining with Michelin-starred cuisine', ARRAY['Luxurious', 'Elegant', 'Sophisticated'], ARRAY['Foie Gras', 'Truffle Risotto', 'Wine Pairing'], '+1-555-0131', 'https://luxurydining.com', 4, ARRAY['luxurious', 'elegant', 'sophisticated'], 'https://opentable.com/luxury-dining', 40.7614, -73.9776),
('rest-010', 'Wine Bar', 'Wine Bar', '$$$', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400'], '741 Vine St', 'Manhattan', '4:00 PM - 12:00 AM', ARRAY['Sophisticated', 'Romantic'], 'Sophisticated wine bar with extensive wine list and charcuterie', ARRAY['Wine Flight', 'Charcuterie Board', 'Cheese Plate'], 4.6, ARRAY['Amazing wine selection!', 'Perfect date spot'], 'Sophisticated wine bar with extensive selection and expert sommeliers', ARRAY['Sophisticated', 'Romantic', 'Expert'], ARRAY['Wine Flight', 'Charcuterie Board', 'Cheese Plate'], '+1-555-0132', 'https://winebar.com', 3, ARRAY['sophisticated', 'romantic', 'expert'], 'https://opentable.com/wine-bar', 40.7505, -73.9934);

-- Insert test collections/plans
INSERT INTO collections (id, name, description, cover_image, created_by, creator_id, occasion, is_public, likes, equal_voting, admin_weighted, expertise_weighted, minimum_participation, allow_vote_changes, anonymous_voting, vote_visibility, discussion_enabled, auto_ranking_enabled, consensus_threshold, restaurant_ids, collaborators, unique_code, planned_date) VALUES
('col-001', 'Date Night Spots', 'Romantic restaurants perfect for special occasions', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Date Night', true, 45, true, false, false, 1, true, false, 'public', true, true, 50, ARRAY['rest-002', 'rest-009', 'rest-010'], ARRAY['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'], 'DATE2024', '2024-12-15'),
('col-002', 'Best Brunch', 'Weekend brunch favorites in the city', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Brunch', true, 32, true, false, false, 1, true, false, 'public', true, true, 50, ARRAY['rest-005', 'rest-006'], ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004'], 'BRUNCH2024', '2024-12-08'),
('col-003', 'Budget Eats', 'Delicious food that won''t break the bank', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Casual', true, 28, true, false, false, 1, true, false, 'public', true, true, 50, ARRAY['rest-003', 'rest-004', 'rest-008'], ARRAY['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005'], 'BUDGET2024', '2024-12-20'),
('col-004', 'Foodie Adventure', 'Unique and experimental dining experiences', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Special Occasion', true, 15, true, false, false, 1, true, false, 'public', true, true, 50, ARRAY['rest-007', 'rest-009'], ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'], 'ADVENTURE2024', '2024-12-25'),
('col-005', 'Team Lunch', 'Great spots for team lunches and meetings', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Business', false, 8, true, false, false, 1, true, false, 'public', true, true, 50, ARRAY['rest-001', 'rest-005'], ARRAY['550e8400-e29b-41d4-a716-446655440004'], 'TEAM2024', '2024-12-12');

-- Insert collection members
INSERT INTO collection_members (collection_id, user_id, role, vote_weight, is_verified, expertise) VALUES
('col-001', '550e8400-e29b-41d4-a716-446655440001', 'admin', 1, true, ARRAY['Italian', 'Japanese']),
('col-001', '550e8400-e29b-41d4-a716-446655440002', 'member', 1, true, ARRAY['American', 'Mexican']),
('col-001', '550e8400-e29b-41d4-a716-446655440003', 'member', 1, false, ARRAY['Cafe', 'Brunch']),
('col-002', '550e8400-e29b-41d4-a716-446655440003', 'admin', 1, false, ARRAY['Cafe', 'Brunch']),
('col-002', '550e8400-e29b-41d4-a716-446655440001', 'member', 1, true, ARRAY['Italian', 'Japanese']),
('col-002', '550e8400-e29b-41d4-a716-446655440004', 'member', 1, false, ARRAY['Street Food', 'Adventure']),
('col-003', '550e8400-e29b-41d4-a716-446655440004', 'admin', 1, false, ARRAY['Street Food', 'Adventure']),
('col-003', '550e8400-e29b-41d4-a716-446655440002', 'member', 1, true, ARRAY['American', 'Mexican']),
('col-003', '550e8400-e29b-41d4-a716-446655440005', 'member', 1, true, ARRAY['Fine Dining', 'Wine']),
('col-004', '550e8400-e29b-41d4-a716-446655440005', 'admin', 1, true, ARRAY['Fine Dining', 'Wine']),
('col-004', '550e8400-e29b-41d4-a716-446655440001', 'member', 1, true, ARRAY['Italian', 'Japanese']),
('col-004', '550e8400-e29b-41d4-a716-446655440003', 'member', 1, false, ARRAY['Cafe', 'Brunch']),
('col-005', '550e8400-e29b-41d4-a716-446655440002', 'admin', 1, true, ARRAY['American', 'Mexican']),
('col-005', '550e8400-e29b-41d4-a716-446655440004', 'member', 1, false, ARRAY['Street Food', 'Adventure']);

-- Insert collection restaurants
INSERT INTO collection_restaurants (collection_id, restaurant_id, added_by) VALUES
('col-001', 'rest-002', '550e8400-e29b-41d4-a716-446655440001'),
('col-001', 'rest-009', '550e8400-e29b-41d4-a716-446655440001'),
('col-001', 'rest-010', '550e8400-e29b-41d4-a716-446655440001'),
('col-002', 'rest-005', '550e8400-e29b-41d4-a716-446655440003'),
('col-002', 'rest-006', '550e8400-e29b-41d4-a716-446655440003'),
('col-003', 'rest-003', '550e8400-e29b-41d4-a716-446655440004'),
('col-003', 'rest-004', '550e8400-e29b-41d4-a716-446655440004'),
('col-003', 'rest-008', '550e8400-e29b-41d4-a716-446655440004'),
('col-004', 'rest-007', '550e8400-e29b-41d4-a716-446655440005'),
('col-004', 'rest-009', '550e8400-e29b-41d4-a716-446655440005'),
('col-005', 'rest-001', '550e8400-e29b-41d4-a716-446655440002'),
('col-005', 'rest-005', '550e8400-e29b-41d4-a716-446655440002');

-- Insert restaurant votes
INSERT INTO restaurant_votes (restaurant_id, user_id, collection_id, vote, authority, weight, reason, is_anonymous) VALUES
('rest-002', '550e8400-e29b-41d4-a716-446655440001', 'col-001', 'like', 'verified', 1, 'Amazing sushi quality!', false),
('rest-002', '550e8400-e29b-41d4-a716-446655440002', 'col-001', 'like', 'verified', 1, 'Best sushi in the city', false),
('rest-002', '550e8400-e29b-41d4-a716-446655440003', 'col-001', 'like', 'regular', 1, 'Great atmosphere', false),
('rest-009', '550e8400-e29b-41d4-a716-446655440001', 'col-001', 'like', 'verified', 1, 'Perfect for special occasions', false),
('rest-009', '550e8400-e29b-41d4-a716-446655440002', 'col-001', 'dislike', 'verified', 1, 'Too expensive', false),
('rest-010', '550e8400-e29b-41d4-a716-446655440001', 'col-001', 'like', 'verified', 1, 'Excellent wine selection', false),
('rest-005', '550e8400-e29b-41d4-a716-446655440003', 'col-002', 'like', 'regular', 1, 'Great coffee and atmosphere', false),
('rest-005', '550e8400-e29b-41d4-a716-446655440001', 'col-002', 'like', 'verified', 1, 'Perfect brunch spot', false),
('rest-006', '550e8400-e29b-41d4-a716-446655440003', 'col-002', 'like', 'regular', 1, 'Amazing brunch menu', false),
('rest-006', '550e8400-e29b-41d4-a716-446655440004', 'col-002', 'like', 'regular', 1, 'Trendy and delicious', false),
('rest-003', '550e8400-e29b-41d4-a716-446655440004', 'col-003', 'like', 'regular', 1, 'Best burgers in town', false),
('rest-003', '550e8400-e29b-41d4-a716-446655440002', 'col-003', 'like', 'verified', 1, 'Great value for money', false),
('rest-004', '550e8400-e29b-41d4-a716-446655440004', 'col-003', 'like', 'regular', 1, 'Authentic Mexican flavors', false),
('rest-004', '550e8400-e29b-41d4-a716-446655440005', 'col-003', 'dislike', 'verified', 1, 'Too spicy for me', false),
('rest-008', '550e8400-e29b-41d4-a716-446655440004', 'col-003', 'like', 'regular', 1, 'Great variety of options', false),
('rest-007', '550e8400-e29b-41d4-a716-446655440005', 'col-004', 'like', 'verified', 1, 'Incredible fusion cuisine', false),
('rest-007', '550e8400-e29b-41d4-a716-446655440001', 'col-004', 'like', 'verified', 1, 'Unique dining experience', false),
('rest-009', '550e8400-e29b-41d4-a716-446655440005', 'col-004', 'like', 'verified', 1, 'Exquisite fine dining', false),
('rest-001', '550e8400-e29b-41d4-a716-446655440002', 'col-005', 'like', 'verified', 1, 'Perfect for team lunches', false),
('rest-005', '550e8400-e29b-41d4-a716-446655440002', 'col-005', 'like', 'verified', 1, 'Great coffee for meetings', false);

-- Insert user reviews
INSERT INTO user_reviews (user_id, restaurant_id, rating, review_text, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'rest-002', 5, 'Amazing sushi! The fish was incredibly fresh and the service was impeccable.', 'Try the dragon roll!'),
('550e8400-e29b-41d4-a716-446655440002', 'rest-003', 4, 'Great burgers and fast service. Perfect for a quick lunch.', 'The truffle fries are a must!'),
('550e8400-e29b-41d4-a716-446655440003', 'rest-005', 5, 'Cozy atmosphere and excellent coffee. Perfect spot for brunch.', 'The avocado toast is delicious'),
('550e8400-e29b-41d4-a716-446655440004', 'rest-004', 4, 'Authentic Mexican tacos with homemade tortillas. Very flavorful!', 'Get the fish tacos'),
('550e8400-e29b-41d4-a716-446655440005', 'rest-009', 5, 'Exquisite fine dining experience. The wine pairing was perfect.', 'Worth every penny for special occasions');

-- Insert restaurant discussions
INSERT INTO restaurant_discussions (restaurant_id, collection_id, user_id, message, parent_id, likes) VALUES
('rest-002', 'col-001', '550e8400-e29b-41d4-a716-446655440001', 'Has anyone tried their omakase menu?', NULL, 3),
('rest-002', 'col-001', '550e8400-e29b-41d4-a716-446655440002', 'Yes! It''s absolutely worth it. The chef''s selection is incredible.', '1', 2),
('rest-002', 'col-001', '550e8400-e29b-41d4-a716-446655440003', 'I agree! The omakase is a must-try experience.', '1', 1),
('rest-009', 'col-001', '550e8400-e29b-41d4-a716-446655440001', 'Perfect for anniversary dinners!', NULL, 2),
('rest-005', 'col-002', '550e8400-e29b-41d4-a716-446655440003', 'Best coffee in the neighborhood!', NULL, 4),
('rest-006', 'col-002', '550e8400-e29b-41d4-a716-446655440004', 'The bottomless mimosas are amazing!', NULL, 3),
('rest-003', 'col-003', '550e8400-e29b-41d4-a716-446655440002', 'Great value for the quality!', NULL, 2),
('rest-007', 'col-004', '550e8400-e29b-41d4-a716-446655440005', 'The molecular gastronomy dishes are mind-blowing!', NULL, 3);

-- Insert user relationships (followers)
INSERT INTO user_relationships (follower_id, following_id) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005');

-- Insert API calls (sample tracking data)
INSERT INTO api_calls (user_id, endpoint, method, request_data, response_status, response_data, duration_ms) VALUES
('550e8400-e29b-41d4-a716-446655440001', '/restaurants/search', 'POST', '{"query": "sushi", "location": "Manhattan"}', 200, '{"results": [{"id": "rest-002", "name": "Sushi Master"}]}', 245),
('550e8400-e29b-41d4-a716-446655440002', '/restaurants/search', 'POST', '{"query": "burgers", "location": "Brooklyn"}', 200, '{"results": [{"id": "rest-003", "name": "Burger Joint"}]}', 189),
('550e8400-e29b-41d4-a716-446655440003', '/collections/create', 'POST', '{"name": "Best Brunch", "description": "Weekend brunch favorites"}', 201, '{"id": "col-002", "name": "Best Brunch"}', 156),
('550e8400-e29b-41d4-a716-446655440004', '/restaurants/vote', 'POST', '{"restaurant_id": "rest-003", "vote": "like"}', 200, '{"success": true}', 89),
('550e8400-e29b-41d4-a716-446655440005', '/restaurants/search', 'POST', '{"query": "fine dining", "location": "Manhattan"}', 200, '{"results": [{"id": "rest-009", "name": "Luxury Dining"}]}', 312);

-- Insert user activities
INSERT INTO user_activities (user_id, type, restaurant_id, collection_id, content, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'review', 'rest-002', NULL, 'Amazing sushi! The fish was incredibly fresh', '{"rating": 5}'),
('550e8400-e29b-41d4-a716-446655440002', 'review', 'rest-003', NULL, 'Great burgers and fast service', '{"rating": 4}'),
('550e8400-e29b-41d4-a716-446655440003', 'collection', NULL, 'col-002', 'Created new collection: Best Brunch', '{"collection_name": "Best Brunch"}'),
('550e8400-e29b-41d4-a716-446655440004', 'vote', 'rest-003', 'col-003', 'Liked Burger Joint', '{"vote": "like"}'),
('550e8400-e29b-41d4-a716-446655440005', 'review', 'rest-009', NULL, 'Exquisite fine dining experience', '{"rating": 5}'),
('550e8400-e29b-41d4-a716-446655440001', 'vote', 'rest-002', 'col-001', 'Liked Sushi Master', '{"vote": "like"}'),
('550e8400-e29b-41d4-a716-446655440002', 'vote', 'rest-002', 'col-001', 'Liked Sushi Master', '{"vote": "like"}'),
('550e8400-e29b-41d4-a716-446655440003', 'vote', 'rest-002', 'col-001', 'Liked Sushi Master', '{"vote": "like"}');

-- Calculate restaurant rankings for collections
SELECT calculate_restaurant_ranking('col-001'::UUID);
SELECT calculate_restaurant_ranking('col-002'::UUID);
SELECT calculate_restaurant_ranking('col-003'::UUID);
SELECT calculate_restaurant_ranking('col-004'::UUID);
SELECT calculate_restaurant_ranking('col-005'::UUID);

-- Update user counts based on activities
UPDATE users SET 
  review_count = (SELECT COUNT(*) FROM user_activities WHERE user_id = users.id AND type = 'review'),
  photo_count = (SELECT COUNT(*) FROM user_activities WHERE user_id = users.id AND type = 'photo'),
  tip_count = (SELECT COUNT(*) FROM user_activities WHERE user_id = users.id AND type = 'tip'),
  checkin_count = (SELECT COUNT(*) FROM user_activities WHERE user_id = users.id AND type = 'checkin'),
  follower_count = (SELECT COUNT(*) FROM user_relationships WHERE following_id = users.id),
  following_count = (SELECT COUNT(*) FROM user_relationships WHERE follower_id = users.id);

-- Update collection likes count
UPDATE collections SET likes = (
  SELECT COUNT(*) FROM restaurant_votes 
  WHERE collection_id = collections.id AND vote = 'like'
);
