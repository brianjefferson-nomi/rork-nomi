-- Debug Sarah Johnson's Collections
-- This script helps debug why Sarah Johnson isn't seeing collections she's a member of

-- 1. Check if Sarah Johnson exists and get her UUID
SELECT '=== SARAH JOHNSON USER INFO ===' as info;
SELECT id, email, name, avatar_url, bio, joined_date 
FROM users 
WHERE name ILIKE '%Sarah%' OR name ILIKE '%Johnson%' OR email ILIKE '%sarah%';

-- 2. Check all collections in the database
SELECT '=== ALL COLLECTIONS ===' as info;
SELECT id, name, created_by, creator_id, is_public, created_at 
FROM collections 
ORDER BY created_at DESC;

-- 3. Check collection_members table for Sarah Johnson
SELECT '=== SARAH JOHNSON MEMBERSHIPS ===' as info;
SELECT 
    cm.id as membership_id,
    cm.collection_id,
    cm.user_id,
    cm.role,
    cm.joined_at,
    c.name as collection_name,
    c.created_by as collection_creator
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
WHERE cm.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY cm.joined_at DESC;

-- 4. Check collections where Sarah is the creator
SELECT '=== COLLECTIONS SARAH CREATED ===' as info;
SELECT id, name, created_by, creator_id, is_public, created_at 
FROM collections 
WHERE created_by = '11111111-1111-1111-1111-111111111111' 
   OR creator_id = '11111111-1111-1111-1111-111111111111';

-- 5. Check all collection_members entries
SELECT '=== ALL COLLECTION MEMBERS ===' as info;
SELECT 
    cm.id as membership_id,
    cm.collection_id,
    cm.user_id,
    cm.role,
    cm.joined_at,
    c.name as collection_name,
    u.name as user_name
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
JOIN users u ON cm.user_id = u.id
ORDER BY cm.joined_at DESC;

-- 6. Check if the specific collections from test data exist
SELECT '=== TEST COLLECTIONS EXISTENCE ===' as info;
SELECT 
    id,
    name,
    CASE 
        WHEN id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' THEN 'Date Night Spots'
        WHEN id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' THEN 'Best Brunch'
        WHEN id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa' THEN 'Italian Food Lovers'
        WHEN id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb' THEN 'Sushi Enthusiasts'
        WHEN id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc' THEN 'Fine Dining Group'
        ELSE 'Other'
    END as expected_name
FROM collections 
WHERE id IN (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
);

-- 7. Check if Sarah is a member of these specific collections
SELECT '=== SARAH MEMBERSHIP IN TEST COLLECTIONS ===' as info;
SELECT 
    cm.collection_id,
    cm.role,
    cm.joined_at,
    c.name as collection_name
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
WHERE cm.user_id = '11111111-1111-1111-1111-111111111111'
  AND cm.collection_id IN (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
  );
