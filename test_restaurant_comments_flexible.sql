-- Flexible Test Data: Restaurant Comments for Shared Collections
-- This script adds realistic test comments using any existing users, collections, and restaurants

-- First, let's see what data we have available
SELECT 'Available Users:' as info;
SELECT id, name, email FROM users LIMIT 10;

SELECT 'Available Collections:' as info;
SELECT id, name, is_public FROM collections LIMIT 10;

SELECT 'Available Restaurants:' as info;
SELECT id, name, cuisine FROM restaurants LIMIT 10;

-- Get some sample data to work with
WITH sample_data AS (
  SELECT 
    u.id as user_id,
    u.name as user_name,
    r.id as restaurant_id,
    r.name as restaurant_name,
    c.id as collection_id,
    c.name as collection_name
  FROM users u
  CROSS JOIN restaurants r
  CROSS JOIN collections c
  WHERE c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  )
  LIMIT 20
)
SELECT * FROM sample_data;

-- Add test comments using the first available users, restaurants, and collections
-- Comment 1: Positive dining experience
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
  'This place is amazing! The food was perfectly cooked and the service was outstanding. Definitely worth visiting again.',
  'Added a comment about dining experience',
  '{"rating": 5, "visit_date": "2024-01-15"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
LIMIT 1;

-- Comment 2: Mixed review
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
  'Food was good but a bit pricey for what you get. The atmosphere is nice though, perfect for a casual dinner.',
  'Added a comment about value and atmosphere',
  '{"rating": 3, "price_concern": true}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 3: Quick service review
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
  'Perfect spot for a quick meal! Service was fast and the portions were generous. Great value for money.',
  'Added a comment about quick dining',
  '{"meal_type": "quick", "service_speed": "fast", "value": "good"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 4: Special occasion review
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
  'Excellent choice for special occasions! The ambiance is elegant and the food presentation is beautiful. A bit of a splurge but totally worth it.',
  'Added a comment about special occasions',
  '{"rating": 5, "occasion": "special", "ambiance": "elegant"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 5: Family-friendly review
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
  'Great family spot! The kids menu is extensive and the staff is very patient with children. Good for groups and celebrations.',
  'Added a comment about family dining',
  '{"rating": 4, "family_friendly": true, "kids_menu": true}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 6: Coffee/breakfast review
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
  'Perfect morning spot! The coffee is excellent and the pastries are fresh. Great place to start the day or catch up with friends.',
  'Added a comment about morning dining',
  '{"rating": 5, "meal_type": "breakfast", "coffee_quality": "excellent"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 7: Dietary restrictions review
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
  'Very accommodating with dietary restrictions! The staff was knowledgeable about ingredients and the vegetarian options were delicious.',
  'Added a comment about dietary accommodations',
  '{"rating": 4, "dietary_friendly": true, "staff_knowledge": "good"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 8: Weekend experience
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
  'Great weekend spot! The brunch menu is creative and the cocktails are well-crafted. Gets busy but the wait is worth it.',
  'Added a comment about weekend dining',
  '{"rating": 4, "meal_type": "brunch", "weekend_crowd": true}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 9: Budget-friendly review
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
  'Excellent value! The portions are generous and everything tastes homemade. Perfect for students or anyone watching their budget.',
  'Added a comment about budget dining',
  '{"rating": 4, "budget_friendly": true, "large_portions": true}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 10: Late night option
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
  'Open late and the food is still fresh! Perfect for after-work meals or late night cravings. The staff is friendly even late at night.',
  'Added a comment about late night dining',
  '{"rating": 4, "late_night": true, "after_work": true}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
  AND r.id NOT IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Add a reply comment to show conversation
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
  'I completely agree! The service was exceptional. Did you try their signature dish? It was absolutely incredible.',
  'Added a reply comment',
  '{"rating": 5, "signature_dish": "excellent"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL 
  AND r.name IS NOT NULL 
  AND c.name IS NOT NULL
  AND (c.is_public = true OR EXISTS (
    SELECT 1 FROM collection_members cm 
    WHERE cm.collection_id = c.id AND cm.user_id = u.id
  ))
  AND r.id IN (SELECT restaurant_id FROM user_activities WHERE type = 'comment')
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Show verification of inserted data
SELECT 'Test comments added successfully!' as status;

-- Display the added comments
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
LIMIT 15;

-- Show comment count by collection
SELECT 
  'Comments by Collection:' as info,
  c.name as collection_name,
  COUNT(*) as comment_count
FROM user_activities ua
JOIN collections c ON ua.collection_id = c.id
WHERE ua.type = 'comment'
GROUP BY c.id, c.name
ORDER BY comment_count DESC;

-- Show comment count by user
SELECT 
  'Comments by User:' as info,
  u.name as user_name,
  COUNT(*) as comment_count
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
WHERE ua.type = 'comment'
GROUP BY u.id, u.name
ORDER BY comment_count DESC;
