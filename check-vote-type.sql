-- =====================================================
-- CHECK VOTE_TYPE ENUM AND FIX VOTING DATA
-- =====================================================

-- Step 1: Check the vote_type enum definition
SELECT '=== VOTE_TYPE ENUM CHECK ===' as section;

-- Check if vote_type enum exists
SELECT 
  'vote_type enum' as check_type,
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'vote_type'
ORDER BY e.enumsortorder;

-- Step 2: Check the restaurant_votes table structure
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

-- Step 3: Check current vote data
SELECT '=== CURRENT VOTE DATA ===' as section;

SELECT 
  'Current vote values' as check_type,
  vote,
  COUNT(*) as count
FROM restaurant_votes
GROUP BY vote
ORDER BY count DESC;

-- Step 4: Check for any invalid vote values
SELECT '=== INVALID VOTE VALUES ===' as section;

SELECT 
  'Invalid vote values' as check_type,
  vote,
  COUNT(*) as count
FROM restaurant_votes
WHERE vote::text NOT IN (
  SELECT e.enumlabel::text
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE t.typname = 'vote_type'
);

-- Step 5: Show the correct way to insert votes
SELECT '=== CORRECT VOTE INSERTION ===' as section;

-- This will show the proper enum values to use
SELECT 
  'Use these values for vote column' as instruction,
  e.enumlabel as valid_vote_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'vote_type'
ORDER BY e.enumsortorder;
