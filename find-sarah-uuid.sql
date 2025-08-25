-- Find Sarah Johnson's existing UUID
SELECT 'Sarah Johnson UUID Search' as info;

-- Search for Sarah Johnson by name
SELECT id, email, name, avatar_url, bio, joined_date 
FROM users 
WHERE name ILIKE '%Sarah%' OR name ILIKE '%Johnson%' OR email ILIKE '%sarah%';

-- Search for any user with 'sarah' in email
SELECT id, email, name, avatar_url, bio, joined_date 
FROM users 
WHERE email ILIKE '%sarah%';

-- Show all users to help identify Sarah Johnson
SELECT id, email, name, avatar_url, bio, joined_date 
FROM users 
ORDER BY created_at DESC;
