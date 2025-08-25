-- Test Data: Restaurant Comments for Shared Collections
-- This script adds realistic test comments to restaurants in existing collections

-- First, let's see what we have to work with
-- SELECT 'Users in database:' as info;
-- SELECT id, name, email FROM users LIMIT 5;

-- SELECT 'Collections in database:' as info;
-- SELECT id, name, is_public FROM collections LIMIT 5;

-- SELECT 'Restaurants in database:' as info;
-- SELECT id, name, cuisine FROM restaurants LIMIT 5;

-- Add test comments for restaurants in collections
-- Using realistic comment scenarios for restaurant discussions

-- Comment 1: Positive experience at a popular restaurant
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'This place is amazing! The pasta was perfectly cooked and the service was outstanding. Definitely worth the wait.',
  'Added a comment about dining experience',
  '{"rating": 5, "visit_date": "2024-01-15"}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Sarah Johnson' 
  AND r.name LIKE '%Pizza%'
  AND c.name LIKE '%Food%'
LIMIT 1;

-- Comment 2: Mixed review with specific feedback
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Food was good but a bit pricey for what you get. The atmosphere is nice though, perfect for date night.',
  'Added a comment about value and atmosphere',
  '{"rating": 3, "price_concern": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Michael Chen' 
  AND r.name LIKE '%Sushi%'
  AND c.name LIKE '%Dinner%'
LIMIT 1;

-- Comment 3: Quick lunch recommendation
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Perfect spot for lunch! Quick service and the sandwiches are huge. Try the turkey club!',
  'Added a comment about lunch experience',
  '{"meal_type": "lunch", "service_speed": "fast"}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Emily Rodriguez' 
  AND r.name LIKE '%Deli%'
  AND c.name LIKE '%Lunch%'
LIMIT 1;

-- Comment 4: Detailed food review
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'The steak was cooked to perfection - medium rare exactly as ordered. The wine pairing suggestions were spot on. A bit of a splurge but totally worth it for special occasions.',
  'Added a detailed food review',
  '{"rating": 5, "occasion": "special", "food_quality": "excellent"}'
FROM users u, restaurants r, collections c
WHERE u.name = 'David Kim' 
  AND r.name LIKE '%Steak%'
  AND c.name LIKE '%Fine%'
LIMIT 1;

-- Comment 5: Casual dining experience
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Great casual spot! The burgers are juicy and the fries are crispy. Good for groups and families. Parking can be tricky though.',
  'Added a comment about casual dining',
  '{"rating": 4, "family_friendly": true, "parking_issue": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Lisa Thompson' 
  AND r.name LIKE '%Burger%'
  AND c.name LIKE '%Casual%'
LIMIT 1;

-- Comment 6: Coffee shop review
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Best coffee in the neighborhood! The baristas really know their stuff. Great place to work remotely too - good wifi and plenty of outlets.',
  'Added a comment about coffee and workspace',
  '{"rating": 5, "work_friendly": true, "wifi": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Alex Johnson' 
  AND r.name LIKE '%Coffee%'
  AND c.name LIKE '%Cafe%'
LIMIT 1;

-- Comment 7: Vegetarian options review
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Surprisingly good vegetarian options! The quinoa bowl was delicious and filling. Staff was very accommodating with dietary restrictions.',
  'Added a comment about vegetarian dining',
  '{"rating": 4, "vegetarian_friendly": true, "dietary_accommodating": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Maria Garcia' 
  AND r.name LIKE '%Bowl%'
  AND c.name LIKE '%Healthy%'
LIMIT 1;

-- Comment 8: Weekend brunch experience
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Amazing brunch spot! The eggs benedict was perfect and the mimosas were bottomless. Gets crowded on weekends but worth the wait.',
  'Added a comment about brunch experience',
  '{"rating": 5, "meal_type": "brunch", "weekend_crowd": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'James Wilson' 
  AND r.name LIKE '%Brunch%'
  AND c.name LIKE '%Weekend%'
LIMIT 1;

-- Comment 9: Budget-friendly option
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Great value for money! The portions are huge and everything tastes homemade. Perfect for students or anyone on a budget.',
  'Added a comment about budget dining',
  '{"rating": 4, "budget_friendly": true, "large_portions": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Rachel Green' 
  AND r.name LIKE '%Diner%'
  AND c.name LIKE '%Budget%'
LIMIT 1;

-- Comment 10: Late night food option
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Open late and the food is still fresh! Perfect for after-work drinks or late night cravings. The tacos are always a good choice.',
  'Added a comment about late night dining',
  '{"rating": 4, "late_night": true, "after_work": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Tom Anderson' 
  AND r.name LIKE '%Taco%'
  AND c.name LIKE '%Late%'
LIMIT 1;

-- Add some comments to the same restaurant to show conversation
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'I agree! The pasta was incredible. Did you try their tiramisu for dessert? It''s homemade and absolutely divine.',
  'Added a reply comment about dessert',
  '{"rating": 5, "dessert": "tiramisu"}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Michael Chen' 
  AND r.name LIKE '%Pizza%'
  AND c.name LIKE '%Food%'
LIMIT 1;

-- Another reply to show conversation flow
INSERT INTO user_activities (
  user_id,
  type,
  restaurant_id,
  collection_id,
  comment_text,
  content,
  metadata
) 
SELECT 
  u.id as user_id,
  'comment'::activity_type,
  r.id as restaurant_id,
  c.id as collection_id,
  'Yes! The tiramisu is amazing. I also love their wine selection. Great Italian wines at reasonable prices.',
  'Added a comment about wine selection',
  '{"rating": 5, "wine_selection": "good", "italian_wines": true}'
FROM users u, restaurants r, collections c
WHERE u.name = 'Emily Rodriguez' 
  AND r.name LIKE '%Pizza%'
  AND c.name LIKE '%Food%'
LIMIT 1;

-- Show verification of inserted data
SELECT 'Test comments added successfully!' as status;

-- Display some of the added comments
SELECT 
  'Recent Comments:' as info,
  ua.comment_text,
  u.name as user_name,
  r.name as restaurant_name,
  c.name as collection_name,
  ua.created_at
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
JOIN restaurants r ON ua.restaurant_id = r.id
JOIN collections c ON ua.collection_id = c.id
WHERE ua.type = 'comment'
ORDER BY ua.created_at DESC
LIMIT 10;
