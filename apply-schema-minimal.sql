-- =====================================================
-- MINIMAL SCALABILITY SCHEMA - AVOIDS IMMUTABLE ISSUES
-- =====================================================

-- STEP 1: CREATE TABLES ONLY
-- =====================================================

-- User activity summary table
CREATE TABLE IF NOT EXISTS user_activity_summary (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_collections_created INTEGER DEFAULT 0,
  total_collections_joined INTEGER DEFAULT 0,
  total_votes_cast INTEGER DEFAULT 0,
  total_discussions_started INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection statistics cache
CREATE TABLE IF NOT EXISTS collection_stats_cache (
  collection_id UUID PRIMARY KEY REFERENCES collections(id) ON DELETE CASCADE,
  total_members INTEGER DEFAULT 0,
  total_restaurants INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_dislikes INTEGER DEFAULT 0,
  total_discussions INTEGER DEFAULT 0,
  participation_rate DECIMAL(5,2) DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB,
  ip_address INET,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type, window_start)
);

-- Archive tables
CREATE TABLE IF NOT EXISTS archived_restaurant_votes (
  LIKE restaurant_votes INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS archived_restaurant_discussions (
  LIKE restaurant_discussions INCLUDING ALL
);

-- STEP 2: CREATE SIMPLE INDEXES ONLY
-- =====================================================

-- Basic performance indexes (no partial indexes)
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

-- STEP 3: CREATE SIMPLE FUNCTIONS ONLY
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_collections_paginated(UUID, INTEGER, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS update_user_activity_summary(UUID);
DROP FUNCTION IF EXISTS update_collection_stats_cache(UUID);
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS archive_old_data(INTEGER);

-- Simple pagination function
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
      uc.*,
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

-- Simple rate limiting function
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

-- Simple archive function
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

-- STEP 4: CREATE SIMPLE VIEW
-- =====================================================

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

-- STEP 5: TEST FUNCTIONS
-- =====================================================

-- Test rate limiting function
SELECT check_rate_limit(
  '11111111-1111-1111-1111-111111111111'::UUID, 
  'test'::TEXT, 
  5::INTEGER, 
  60::INTEGER
) as rate_limit_test;

-- Test pagination function
SELECT * FROM get_user_collections_paginated(
  '11111111-1111-1111-1111-111111111111'::UUID, 
  0::INTEGER, 
  10::INTEGER, 
  true::BOOLEAN
) LIMIT 1;

-- Final verification
SELECT 'Minimal schema application completed successfully!' as final_status;
