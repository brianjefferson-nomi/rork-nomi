-- =====================================================
-- FIX VOTE_TYPE ENUM ISSUES
-- =====================================================

-- Step 1: Check the current vote_type enum
SELECT '=== CHECKING VOTE_TYPE ENUM ===' as section;

-- Show the vote_type enum values
SELECT 
  'vote_type enum values' as check_type,
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'vote_type'
ORDER BY e.enumsortorder;

-- Step 2: Check if vote_type enum exists, create if not
SELECT '=== ENSURING VOTE_TYPE ENUM EXISTS ===' as section;

DO $$
BEGIN
    -- Check if vote_type enum exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'vote_type'
    ) THEN
        -- Create the vote_type enum
        CREATE TYPE vote_type AS ENUM ('like', 'dislike');
        RAISE NOTICE 'Created vote_type enum with values: like, dislike';
    ELSE
        RAISE NOTICE 'vote_type enum already exists';
    END IF;
END $$;

-- Step 3: Check restaurant_votes table structure
SELECT '=== RESTAURANT_VOTES TABLE STRUCTURE ===' as section;

SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_votes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Ensure vote column uses vote_type
SELECT '=== ENSURING VOTE COLUMN USES VOTE_TYPE ===' as section;

DO $$
BEGIN
    -- Check if vote column is using vote_type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_votes' 
        AND column_name = 'vote'
        AND udt_name = 'vote_type'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'vote column is already using vote_type enum';
    ELSE
        -- Alter the column to use vote_type
        ALTER TABLE restaurant_votes 
        ALTER COLUMN vote TYPE vote_type USING vote::vote_type;
        RAISE NOTICE 'Updated vote column to use vote_type enum';
    END IF;
END $$;

-- Step 5: Check for any invalid vote data
SELECT '=== CHECKING FOR INVALID VOTE DATA ===' as section;

-- This will show any votes that don't match the enum values
SELECT 
  'Invalid vote values found' as check_type,
  vote,
  COUNT(*) as count
FROM restaurant_votes
WHERE vote::text NOT IN ('like', 'dislike');

-- Step 6: Fix any invalid vote data
SELECT '=== FIXING INVALID VOTE DATA ===' as section;

-- Update any invalid vote values to 'like' as default
UPDATE restaurant_votes 
SET vote = 'like'::vote_type
WHERE vote::text NOT IN ('like', 'dislike');

-- Step 7: Test vote insertion
SELECT '=== TESTING VOTE INSERTION ===' as section;

-- Create a test vote to ensure the enum works
DO $$
DECLARE
    test_collection_id UUID;
    test_user_id UUID;
    test_restaurant_id UUID;
    test_vote_id UUID;
BEGIN
    -- Get test data
    SELECT id INTO test_collection_id FROM collections LIMIT 1;
    SELECT id INTO test_user_id FROM users LIMIT 1;
    SELECT id INTO test_restaurant_id FROM restaurants LIMIT 1;
    
    -- Only proceed if we have test data
    IF test_collection_id IS NOT NULL AND test_user_id IS NOT NULL AND test_restaurant_id IS NOT NULL THEN
        -- Try to insert a test vote
        INSERT INTO restaurant_votes (restaurant_id, user_id, collection_id, vote, reason, created_at)
        VALUES (test_restaurant_id, test_user_id, test_collection_id, 'like'::vote_type, 'Test vote', NOW())
        RETURNING id INTO test_vote_id;
        
        IF test_vote_id IS NOT NULL THEN
            RAISE NOTICE 'Test vote inserted successfully with ID: %', test_vote_id;
            
            -- Clean up the test vote
            DELETE FROM restaurant_votes WHERE id = test_vote_id;
            RAISE NOTICE 'Test vote cleaned up';
        END IF;
    ELSE
        RAISE NOTICE 'No test data available for vote insertion test';
    END IF;
END $$;

-- Step 8: Show current vote data
SELECT '=== CURRENT VOTE DATA ===' as section;

SELECT 
  'Current vote distribution' as check_type,
  vote,
  COUNT(*) as count
FROM restaurant_votes
GROUP BY vote
ORDER BY count DESC;

-- Step 9: Verify enum constraints
SELECT '=== VERIFYING ENUM CONSTRAINTS ===' as section;

-- This should return no rows if all votes are valid
SELECT 
  'Invalid votes after fix' as check_type,
  COUNT(*) as invalid_count
FROM restaurant_votes
WHERE vote::text NOT IN ('like', 'dislike');

-- Step 10: Summary
SELECT '=== SUMMARY ===' as section;

SELECT 
  'Vote Type Fix Summary' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'vote_type'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'restaurant_votes' 
      AND column_name = 'vote'
      AND udt_name = 'vote_type'
      AND table_schema = 'public'
    ) AND NOT EXISTS (
      SELECT 1 FROM restaurant_votes
      WHERE vote::text NOT IN ('like', 'dislike')
    )
    THEN 'VOTE_TYPE ENUM WORKING CORRECTLY - ALL VOTES VALID'
    WHEN EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'vote_type'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'restaurant_votes' 
      AND column_name = 'vote'
      AND udt_name = 'vote_type'
      AND table_schema = 'public'
    )
    THEN 'VOTE_TYPE ENUM EXISTS BUT SOME INVALID VOTES REMAIN'
    WHEN EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'vote_type'
    )
    THEN 'VOTE_TYPE ENUM EXISTS BUT VOTE COLUMN NOT UPDATED'
    ELSE 'VOTE_TYPE ENUM NOT FOUND - NEEDS CREATION'
  END as result;
