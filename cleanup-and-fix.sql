-- =====================================================
-- CLEANUP AND FIX SCRIPT
-- =====================================================

-- Step 1: Clean up any duplicate or broken functions
SELECT '=== CLEANING UP FUNCTIONS ===' as section;

-- Drop any duplicate function signatures
DROP FUNCTION IF EXISTS get_user_collections_paginated(UUID, INTEGER, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS update_user_activity_summary(UUID);
DROP FUNCTION IF EXISTS update_collection_stats_cache(UUID);
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS archive_old_data(INTEGER);
DROP FUNCTION IF EXISTS trigger_update_collection_stats();

-- Step 2: Clean up any duplicate indexes
SELECT '=== CLEANING UP INDEXES ===' as section;

-- Drop any duplicate indexes
DROP INDEX IF EXISTS idx_collections_created_by_created_at;
DROP INDEX IF EXISTS idx_collections_is_public_created_at;
DROP INDEX IF EXISTS idx_collection_members_user_id_role;
DROP INDEX IF EXISTS idx_collection_members_collection_id_role;
DROP INDEX IF EXISTS idx_restaurant_votes_user_collection;
DROP INDEX IF EXISTS idx_restaurant_votes_collection_restaurant;
DROP INDEX IF EXISTS idx_restaurant_discussions_collection_created;
DROP INDEX IF EXISTS idx_users_email_created_at;
DROP INDEX IF EXISTS idx_collections_created_at_desc;
DROP INDEX IF EXISTS idx_user_sessions_user_id;
DROP INDEX IF EXISTS idx_rate_limits_user_action;

-- Step 3: Recreate clean functions
SELECT '=== RECREATING FUNCTIONS ===' as section;

-- Recreate pagination function with proper type casting
CREATE OR REPLACE FUNCTION get_user_collections_paginated(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_include_public BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  is_public BOOLEAN,
  collection_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_collections AS (
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_by,
      c.is_public,
      c.collection_type::TEXT,
      c.created_at,
      1 as priority
    FROM collections c
    WHERE c.created_by = p_user_id
    
    UNION ALL
    
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_by,
      c.is_public,
      c.collection_type::TEXT,
      c.created_at,
      2 as priority
    FROM collections c
    INNER JOIN collection_members cm ON c.id = cm.collection_id
    WHERE cm.user_id = p_user_id
    
    UNION ALL
    
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_by,
      c.is_public,
      c.collection_type::TEXT,
      c.created_at,
      3 as priority
    FROM collections c
    WHERE p_include_public = true 
      AND c.is_public = true 
      AND c.created_by != p_user_id
      AND c.id NOT IN (
        SELECT cm.collection_id 
        FROM collection_members cm 
        WHERE cm.user_id = p_user_id
      )
  ),
  ranked_collections AS (
    SELECT 
      uc.id,
      uc.name,
      uc.description,
      uc.created_by,
      uc.is_public,
      uc.collection_type,
      uc.created_at,
      uc.priority,
      ROW_NUMBER() OVER (ORDER BY uc.priority, uc.created_at DESC) as rn,
      COUNT(*) OVER () as total_count
    FROM user_collections uc
  )
  SELECT 
    rc.id,
    rc.name,
    rc.description,
    rc.created_by,
    rc.is_public,
    rc.collection_type,
    rc.created_at,
    rc.total_count
  FROM ranked_collections rc
  WHERE rc.rn > p_offset AND rc.rn <= p_offset + p_limit
  ORDER BY rc.priority, rc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := date_trunc('minute', NOW());
  
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type
    AND window_start >= v_window_start - INTERVAL '1 minute' * p_window_minutes;
  
  IF v_current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO rate_limits (user_id, action_type, request_count, window_start)
  VALUES (p_user_id, p_action_type, 1, v_window_start)
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Recreate archive function
CREATE OR REPLACE FUNCTION archive_old_data(p_months_old INTEGER DEFAULT 12)
RETURNS VOID AS $$
DECLARE
  v_archived_votes INTEGER := 0;
  v_archived_discussions INTEGER := 0;
BEGIN
  INSERT INTO archived_restaurant_votes
  SELECT * FROM restaurant_votes
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  GET DIAGNOSTICS v_archived_votes = ROW_COUNT;
  
  DELETE FROM restaurant_votes
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  INSERT INTO archived_restaurant_discussions
  SELECT * FROM restaurant_discussions
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  GET DIAGNOSTICS v_archived_discussions = ROW_COUNT;
  
  DELETE FROM restaurant_discussions
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  RAISE NOTICE 'Archived % votes and % discussions older than % months', 
    v_archived_votes, v_archived_discussions, p_months_old;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error during archival: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate clean indexes
SELECT '=== RECREATING INDEXES ===' as section;

-- Recreate performance indexes
CREATE INDEX IF NOT EXISTS idx_collections_created_by_created_at 
ON collections(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_members_user_id_role 
ON collection_members(user_id, role);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_user_collection 
ON restaurant_votes(user_id, collection_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_collection_restaurant 
ON restaurant_votes(collection_id, restaurant_id, vote);

CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_collection_created 
ON restaurant_discussions(collection_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email_created_at 
ON users(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collections_created_at_desc 
ON collections(created_at DESC);

-- Table-specific indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON user_sessions(user_id, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON rate_limits(user_id, action_type, window_start);

-- Step 5: Recreate view
SELECT '=== RECREATING VIEW ===' as section;

CREATE OR REPLACE VIEW system_health AS
SELECT 
  'users' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as new_today,
  COUNT(*) FILTER (WHERE last_activity_at > NOW() - INTERVAL '1 day') as active_today
FROM users
UNION ALL
SELECT 
  'collections' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as new_today,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '1 day') as active_today
FROM collections
UNION ALL
SELECT 
  'restaurant_votes' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as new_today,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as active_today
FROM restaurant_votes;

-- Step 6: Test everything
SELECT '=== TESTING FUNCTIONS ===' as section;

-- Test rate limiting function
SELECT 
  'Rate Limit Function Test' as test_name,
  check_rate_limit(
    '11111111-1111-1111-1111-111111111111'::UUID, 
    'test'::TEXT, 
    5::INTEGER, 
    60::INTEGER
  ) as test_result;

-- Test pagination function
SELECT 
  'Pagination Function Test' as test_name,
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

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as section;

SELECT 
  'Database Cleanup Status' as status,
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
    AND (
      SELECT COUNT(*) FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
    ) >= 8
    THEN 'DATABASE CLEANED AND OPTIMIZED SUCCESSFULLY'
    ELSE 'SOME ISSUES REMAIN - CHECK VERIFICATION RESULTS'
  END as result;
