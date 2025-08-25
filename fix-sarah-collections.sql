-- Fix Sarah Johnson's Collections
-- This script ensures Sarah Johnson can see collections she's a member of

-- First, let's check what we have
SELECT '=== CURRENT STATE ===' as info;

-- Check if Sarah exists
SELECT 'Sarah Johnson exists:' as check_info, 
       COUNT(*) as count 
FROM users 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check if the test collections exist
SELECT 'Test collections exist:' as check_info, 
       COUNT(*) as count 
FROM collections 
WHERE id IN (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa',
    'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb',
    'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc'
);

-- Check Sarah's memberships
SELECT 'Sarah memberships:' as check_info, 
       COUNT(*) as count 
FROM collection_members 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- If collections don't exist, create them
DO $$
BEGIN
    -- Create Date Night Spots collection if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM collections WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee') THEN
        INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, is_public, created_at) 
        VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'DATE001', 'Date Night Spots', 'Perfect restaurants for romantic dates', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '1 month');
        RAISE NOTICE 'Created Date Night Spots collection';
    END IF;
    
    -- Create Best Brunch collection if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM collections WHERE id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff') THEN
        INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, is_public, created_at) 
        VALUES ('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'BRUNCH001', 'Best Brunch', 'Top brunch spots in the city', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', true, NOW() - INTERVAL '3 weeks');
        RAISE NOTICE 'Created Best Brunch collection';
    END IF;
    
    -- Create Italian Food Lovers collection if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM collections WHERE id = 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa') THEN
        INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, is_public, created_at) 
        VALUES ('cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 'ITALIAN001', 'Italian Food Lovers', 'Authentic Italian restaurants', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', true, NOW() - INTERVAL '2 weeks');
        RAISE NOTICE 'Created Italian Food Lovers collection';
    END IF;
    
    -- Create Sushi Enthusiasts collection if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM collections WHERE id = 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb') THEN
        INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, is_public, created_at) 
        VALUES ('dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 'SUSHI001', 'Sushi Enthusiasts', 'Best sushi and Japanese restaurants', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', true, NOW() - INTERVAL '1 week');
        RAISE NOTICE 'Created Sushi Enthusiasts collection';
    END IF;
    
    -- Create Fine Dining Group collection if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM collections WHERE id = 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc') THEN
        INSERT INTO collections (id, collection_code, name, description, created_by, creator_id, is_public, created_at) 
        VALUES ('eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 'FINE001', 'Fine Dining Group', 'Upscale dining experiences', '66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', true, NOW() - INTERVAL '5 days');
        RAISE NOTICE 'Created Fine Dining Group collection';
    END IF;
END $$;

-- Now add Sarah as a member to these collections
INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '2 weeks')
ON CONFLICT (collection_id, user_id) DO NOTHING;

INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '1 week')
ON CONFLICT (collection_id, user_id) DO NOTHING;

INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('cccccccc-3333-3333-3333-333333333333', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '3 days')
ON CONFLICT (collection_id, user_id) DO NOTHING;

INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('dddddddd-4444-4444-4444-444444444444', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '5 days')
ON CONFLICT (collection_id, user_id) DO NOTHING;

INSERT INTO collection_members (id, collection_id, user_id, role, joined_at) VALUES 
('eeeeeeee-5555-5555-5555-555555555555', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'member', NOW() - INTERVAL '1 day')
ON CONFLICT (collection_id, user_id) DO NOTHING;

-- Verify the fix
SELECT '=== AFTER FIX ===' as info;

-- Check Sarah's memberships again
SELECT 
    cm.collection_id,
    cm.role,
    cm.joined_at,
    c.name as collection_name,
    c.created_by as collection_creator
FROM collection_members cm
JOIN collections c ON cm.collection_id = c.id
WHERE cm.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY cm.joined_at DESC;

-- Check total count
SELECT 'Total Sarah memberships:' as check_info, 
       COUNT(*) as count 
FROM collection_members 
WHERE user_id = '11111111-1111-1111-1111-111111111111';
