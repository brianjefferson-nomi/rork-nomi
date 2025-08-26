-- =====================================================
-- VERIFY DATABASE STATE AND CHECK FOR ERRORS
-- =====================================================

-- Step 1: Check if all tables exist
SELECT '=== TABLE VERIFICATION ===' as section;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('user_activity_summary', 'collection_stats_cache', 'user_sessions', 'rate_limits', 'archived_restaurant_votes', 'archived_restaurant_discussions') 
    THEN 'SCALABILITY TABLE'
    ELSE 'EXISTING TABLE'
  END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 'collections', 'collection_members', 'restaurant_votes', 'restaurant_discussions',
  'user_activity_summary', 'collection_stats_cache', 'user_sessions', 'rate_limits', 
  'archived_restaurant_votes', 'archived_restaurant_discussions'
)
ORDER BY table_name;

-- Step 2: Check if all functions exist
SELECT '=== FUNCTION VERIFICATION ===' as section;

SELECT 
  routine_name,
  CASE 
    WHEN routine_name IN ('get_user_collections_paginated', 'update_user_activity_summary', 'update_collection_stats_cache', 'check_rate_limit', 'archive_old_data') 
    THEN 'SCALABILITY FUNCTION'
    ELSE 'EXISTING FUNCTION'
  END as function_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_user_collections_paginated', 'update_user_activity_summary', 'update_collection_stats_cache', 
  'check_rate_limit', 'archive_old_data'
)
ORDER BY routine_name;

-- Step 3: Check if all indexes exist
SELECT '=== INDEX VERIFICATION ===' as section;

SELECT 
  indexname,
  CASE 
    WHEN indexname LIKE 'idx_%' THEN 'PERFORMANCE INDEX'
    ELSE 'EXISTING INDEX'
  END as index_type
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
  'idx_collections_created_by_created_at', 'idx_collections_is_public_created_at',
  'idx_collection_members_user_id_role', 'idx_collection_members_collection_id_role',
  'idx_restaurant_votes_user_collection', 'idx_restaurant_votes_collection_restaurant',
  'idx_restaurant_discussions_collection_created', 'idx_users_email_created_at',
  'idx_collections_created_at_desc', 'idx_user_sessions_user_id',
  'idx_rate_limits_user_action'
)
ORDER BY indexname;

-- Step 4: Check if views exist
SELECT '=== VIEW VERIFICATION ===' as section;

SELECT 
  table_name as view_name,
  'SYSTEM HEALTH VIEW' as view_type
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'system_health';

-- Step 5: Test function functionality
SELECT '=== FUNCTION TESTING ===' as section;

-- Test rate limiting function
SELECT 
  'Rate Limit Function' as test_name,
  CASE 
    WHEN check_rate_limit('11111111-1111-1111-1111-111111111111'::UUID, 'test'::TEXT, 5::INTEGER, 60::INTEGER) 
    THEN 'PASSED' 
    ELSE 'FAILED' 
  END as test_result;

-- Test pagination function
SELECT 
  'Pagination Function' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM get_user_collections_paginated(
        '11111111-1111-1111-1111-111111111111'::UUID, 
        0::INTEGER, 
        10::INTEGER, 
        true::BOOLEAN
      ) LIMIT 1
    ) 
    THEN 'PASSED' 
    ELSE 'FAILED' 
  END as test_result;

-- Step 6: Check for any orphaned or broken objects
SELECT '=== ERROR CHECKING ===' as section;

-- Check for broken foreign key references
SELECT 
  'Foreign Key Check' as check_type,
  COUNT(*) as broken_references
FROM (
  SELECT DISTINCT c.table_name, c.constraint_name
  FROM information_schema.table_constraints c
  LEFT JOIN information_schema.key_column_usage k 
    ON c.constraint_name = k.constraint_name
  WHERE c.constraint_type = 'FOREIGN KEY'
  AND c.table_schema = 'public'
  AND c.table_name IN ('user_activity_summary', 'collection_stats_cache', 'user_sessions', 'rate_limits')
) as fk_check;

-- Check for missing columns
SELECT 
  'Missing Columns' as check_type,
  COUNT(*) as missing_count
FROM (
  SELECT 'user_activity_summary' as table_name, 'user_id' as expected_column
  UNION ALL SELECT 'collection_stats_cache', 'collection_id'
  UNION ALL SELECT 'user_sessions', 'user_id'
  UNION ALL SELECT 'rate_limits', 'user_id'
) as expected
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = expected.table_name 
  AND column_name = expected.expected_column
  AND table_schema = 'public'
);

-- Step 7: Check data integrity
SELECT '=== DATA INTEGRITY ===' as section;

-- Check if there are any collections without proper data
SELECT 
  'Collections Data Check' as check_type,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE name IS NOT NULL) as collections_with_names,
  COUNT(*) FILTER (WHERE created_by IS NOT NULL) as collections_with_creators
FROM collections;

-- Check if there are any votes without proper references
SELECT 
  'Votes Data Check' as check_type,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as votes_with_users,
  COUNT(*) FILTER (WHERE collection_id IS NOT NULL) as votes_with_collections
FROM restaurant_votes;

-- Step 8: Performance check
SELECT '=== PERFORMANCE CHECK ===' as section;

-- Check if indexes are being used
SELECT 
  schemaname,
  relname as tablename,
  indexrelname as indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- Step 9: Summary
SELECT '=== SUMMARY ===' as section;

SELECT 
  'Database State' as status,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_activity_summary', 'collection_stats_cache', 'user_sessions', 'rate_limits')
    ) = 4
    AND (
      SELECT COUNT(*) FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('get_user_collections_paginated', 'check_rate_limit', 'archive_old_data')
    ) = 3
    THEN 'SCALABILITY SCHEMA APPLIED SUCCESSFULLY'
    ELSE 'SCALABILITY SCHEMA INCOMPLETE'
  END as result;
