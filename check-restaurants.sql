-- Check what restaurants exist in the database
-- This will help us use valid restaurant IDs in the voting script

SELECT '=== RESTAURANTS IN DATABASE ===' as info;
SELECT 
    id,
    name,
    cuisine,
    rating,
    created_at
FROM restaurants 
ORDER BY created_at DESC
LIMIT 20;

-- Check if specific restaurant IDs from the voting script exist
SELECT '=== CHECKING SPECIFIC RESTAURANT IDS ===' as info;
SELECT 
    id,
    name,
    cuisine,
    CASE 
        WHEN id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 'Date Night Restaurant 1'
        WHEN id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb' THEN 'Date Night Restaurant 2'
        WHEN id = '33333333-cccc-cccc-cccc-cccccccccccc' THEN 'Date Night Restaurant 3'
        WHEN id = '44444444-dddd-dddd-dddd-dddddddddddd' THEN 'Brunch Restaurant 1'
        WHEN id = '55555555-eeee-eeee-eeee-eeeeeeeeeeee' THEN 'Brunch Restaurant 2'
        WHEN id = '66666666-ffff-ffff-ffff-ffffffffffff' THEN 'Brunch Restaurant 3'
        WHEN id = '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 'Italian Restaurant 1'
        WHEN id = '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb' THEN 'Italian Restaurant 2'
        ELSE 'Other'
    END as expected_name,
    CASE 
        WHEN id IN (
            '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-cccc-cccc-cccc-cccccccccccc',
            '44444444-dddd-dddd-dddd-dddddddddddd',
            '55555555-eeee-eeee-eeee-eeeeeeeeeeee',
            '66666666-ffff-ffff-ffff-ffffffffffff',
            '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM restaurants 
WHERE id IN (
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-cccc-cccc-cccc-cccccccccccc',
    '44444444-dddd-dddd-dddd-dddddddddddd',
    '55555555-eeee-eeee-eeee-eeeeeeeeeeee',
    '66666666-ffff-ffff-ffff-ffffffffffff',
    '77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Get some sample restaurant IDs to use if the specific ones don't exist
SELECT '=== SAMPLE RESTAURANT IDS FOR VOTING ===' as info;
SELECT 
    id,
    name,
    cuisine,
    rating
FROM restaurants 
ORDER BY RANDOM()
LIMIT 15;
