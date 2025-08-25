-- Simple Test Comments Script
-- This script adds realistic restaurant comments to existing collections

-- Add test comments for restaurants in collections
-- Using any available users, restaurants, and collections

-- Comment 1: Positive experience
INSERT INTO user_activities (user_id, type, restaurant_id, collection_id, comment_text, content, metadata)
SELECT u.id, 'comment'::activity_type, r.id, c.id, 
       'This place is amazing! The food was perfectly cooked and the service was outstanding.',
       'Added a comment about dining experience',
       '{"rating": 5}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL AND r.name IS NOT NULL AND c.name IS NOT NULL
LIMIT 1;

-- Comment 2: Mixed review
INSERT INTO user_activities (user_id, type, restaurant_id, collection_id, comment_text, content, metadata)
SELECT u.id, 'comment'::activity_type, r.id, c.id, 
       'Food was good but a bit pricey. The atmosphere is nice though, perfect for casual dining.',
       'Added a comment about value',
       '{"rating": 3}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL AND r.name IS NOT NULL AND c.name IS NOT NULL
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 3: Quick service
INSERT INTO user_activities (user_id, type, restaurant_id, collection_id, comment_text, content, metadata)
SELECT u.id, 'comment'::activity_type, r.id, c.id, 
       'Perfect for a quick meal! Service was fast and portions were generous.',
       'Added a comment about quick dining',
       '{"service_speed": "fast"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL AND r.name IS NOT NULL AND c.name IS NOT NULL
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 4: Special occasion
INSERT INTO user_activities (user_id, type, restaurant_id, collection_id, comment_text, content, metadata)
SELECT u.id, 'comment'::activity_type, r.id, c.id, 
       'Excellent for special occasions! Elegant ambiance and beautiful food presentation.',
       'Added a comment about special dining',
       '{"occasion": "special"}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL AND r.name IS NOT NULL AND c.name IS NOT NULL
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Comment 5: Family friendly
INSERT INTO user_activities (user_id, type, restaurant_id, collection_id, comment_text, content, metadata)
SELECT u.id, 'comment'::activity_type, r.id, c.id, 
       'Great family spot! Staff is patient with children and the menu has good options.',
       'Added a comment about family dining',
       '{"family_friendly": true}'
FROM users u, restaurants r, collections c
WHERE u.name IS NOT NULL AND r.name IS NOT NULL AND c.name IS NOT NULL
  AND u.id NOT IN (SELECT user_id FROM user_activities WHERE type = 'comment')
LIMIT 1;

-- Show results
SELECT 'Test comments added!' as status;

SELECT ua.comment_text, u.name as user, r.name as restaurant, c.name as collection
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
JOIN restaurants r ON ua.restaurant_id = r.id
JOIN collections c ON ua.collection_id = c.id
WHERE ua.type = 'comment'
ORDER BY ua.created_at DESC;
