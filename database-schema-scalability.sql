-- =====================================================
-- SCALABILITY IMPROVEMENTS FOR USER DATA MANAGEMENT
-- =====================================================

-- 1. ADD PERFORMANCE INDEXES
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_collections_created_by_created_at 
ON collections(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collections_is_public_created_at 
ON collections(is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_members_user_id_role 
ON collection_members(user_id, role);

CREATE INDEX IF NOT EXISTS idx_collection_members_collection_id_role 
ON collection_members(collection_id, role);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_user_collection 
ON restaurant_votes(user_id, collection_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_votes_collection_restaurant 
ON restaurant_votes(collection_id, restaurant_id, vote);

CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_collection_created 
ON restaurant_discussions(collection_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email_created_at 
ON users(email, created_at DESC);

-- Partial indexes for active users
CREATE INDEX IF NOT EXISTS idx_collections_active_public 
ON collections(created_at DESC) 
WHERE is_public = true;

-- 2. ADD PAGINATION SUPPORT
-- =====================================================

-- Drop existing function if it exists (to handle return type changes)
DROP FUNCTION IF EXISTS get_user_collections_paginated(UUID, INTEGER, INTEGER, BOOLEAN);

-- Function to get paginated collections for a user
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
    -- Collections created by user
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_by,
      c.is_public,
      c.collection_type,
      c.created_at,
      1 as priority
    FROM collections c
    WHERE c.created_by = p_user_id
    
    UNION ALL
    
    -- Collections where user is a member
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_by,
      c.is_public,
      c.collection_type,
      c.created_at,
      2 as priority
    FROM collections c
    INNER JOIN collection_members cm ON c.id = cm.collection_id
    WHERE cm.user_id = p_user_id
    
    UNION ALL
    
    -- Public collections (if requested)
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_by,
      c.is_public,
      c.collection_type,
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

-- 3. ADD USER ACTIVITY TRACKING
-- =====================================================

-- User activity summary table for quick access
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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_user_activity_summary(UUID);

-- Function to update user activity summary
CREATE OR REPLACE FUNCTION update_user_activity_summary(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_summary (
    user_id,
    total_collections_created,
    total_collections_joined,
    total_votes_cast,
    total_discussions_started,
    last_activity_at
  )
  SELECT 
    p_user_id,
    COUNT(DISTINCT c.id),
    COUNT(DISTINCT cm.collection_id),
    COUNT(DISTINCT rv.id),
    COUNT(DISTINCT rd.id),
    NOW()
  FROM users u
  LEFT JOIN collections c ON u.id = c.created_by
  LEFT JOIN collection_members cm ON u.id = cm.user_id
  LEFT JOIN restaurant_votes rv ON u.id = rv.user_id
  LEFT JOIN restaurant_discussions rd ON u.id = rd.user_id
  WHERE u.id = p_user_id
  GROUP BY u.id
  ON CONFLICT (user_id) DO UPDATE SET
    total_collections_created = EXCLUDED.total_collections_created,
    total_collections_joined = EXCLUDED.total_collections_joined,
    total_votes_cast = EXCLUDED.total_votes_cast,
    total_discussions_started = EXCLUDED.total_discussions_started,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. ADD CACHING TABLES
-- =====================================================

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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_collection_stats_cache(UUID);

-- Function to update collection stats cache
CREATE OR REPLACE FUNCTION update_collection_stats_cache(p_collection_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_members INTEGER;
  v_total_restaurants INTEGER;
  v_total_votes INTEGER;
  v_total_likes INTEGER;
  v_total_dislikes INTEGER;
  v_total_discussions INTEGER;
  v_participation_rate DECIMAL(5,2);
BEGIN
  -- Calculate stats
  SELECT 
    COUNT(DISTINCT cm.user_id),
    COALESCE(array_length(c.restaurant_ids, 1), 0),
    COUNT(DISTINCT rv.id),
    COUNT(DISTINCT CASE WHEN rv.vote = 'like' THEN rv.id END),
    COUNT(DISTINCT CASE WHEN rv.vote = 'dislike' THEN rv.id END),
    COUNT(DISTINCT rd.id)
  INTO v_total_members, v_total_restaurants, v_total_votes, v_total_likes, v_total_dislikes, v_total_discussions
  FROM collections c
  LEFT JOIN collection_members cm ON c.id = cm.collection_id
  LEFT JOIN restaurant_votes rv ON c.id = rv.collection_id
  LEFT JOIN restaurant_discussions rd ON c.id = rd.collection_id
  WHERE c.id = p_collection_id
  GROUP BY c.id, c.restaurant_ids;

  -- Calculate participation rate
  IF v_total_members > 0 THEN
    v_participation_rate := (v_total_votes::DECIMAL / (v_total_members * v_total_restaurants)) * 100;
  ELSE
    v_participation_rate := 0;
  END IF;

  -- Update cache
  INSERT INTO collection_stats_cache (
    collection_id,
    total_members,
    total_restaurants,
    total_votes,
    total_likes,
    total_dislikes,
    total_discussions,
    participation_rate,
    last_calculated_at
  )
  VALUES (
    p_collection_id,
    v_total_members,
    v_total_restaurants,
    v_total_votes,
    v_total_likes,
    v_total_dislikes,
    v_total_discussions,
    v_participation_rate,
    NOW()
  )
  ON CONFLICT (collection_id) DO UPDATE SET
    total_members = EXCLUDED.total_members,
    total_restaurants = EXCLUDED.total_restaurants,
    total_votes = EXCLUDED.total_votes,
    total_likes = EXCLUDED.total_likes,
    total_dislikes = EXCLUDED.total_dislikes,
    total_discussions = EXCLUDED.total_discussions,
    participation_rate = EXCLUDED.participation_rate,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. ADD TRIGGERS FOR AUTOMATIC CACHE UPDATES
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS trigger_update_collection_stats();

-- Trigger to update collection stats when votes change
CREATE OR REPLACE FUNCTION trigger_update_collection_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_collection_stats_cache(NEW.collection_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_collection_stats_cache(OLD.collection_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restaurant_votes_stats
  AFTER INSERT OR UPDATE OR DELETE ON restaurant_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_update_collection_stats();

CREATE TRIGGER trigger_restaurant_discussions_stats
  AFTER INSERT OR UPDATE OR DELETE ON restaurant_discussions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_collection_stats();

CREATE TRIGGER trigger_collection_members_stats
  AFTER INSERT OR UPDATE OR DELETE ON collection_members
  FOR EACH ROW EXECUTE FUNCTION trigger_update_collection_stats();

-- 6. ADD USER SESSION TRACKING
-- =====================================================

-- User sessions table for analytics and rate limiting
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

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON user_sessions(user_id, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at 
ON user_sessions(expires_at) WHERE expires_at < NOW();

-- 7. ADD RATE LIMITING SUPPORT
-- =====================================================

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'vote', 'comment', 'create_collection', etc.
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON rate_limits(user_id, action_type, window_start);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INTEGER, INTEGER);

-- Function to check rate limits
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
  -- Set window start to current time rounded to the minute
  v_window_start := date_trunc('minute', NOW());
  
  -- Clean old entries (older than the window)
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Get current count for this window
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type
    AND window_start >= v_window_start - INTERVAL '1 minute' * p_window_minutes;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Record this request
  INSERT INTO rate_limits (user_id, action_type, request_count, window_start)
  VALUES (p_user_id, p_action_type, 1, v_window_start)
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, allow the request (fail open)
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. ADD DATA ARCHIVAL SUPPORT
-- =====================================================

-- Archive old data to improve performance
CREATE TABLE IF NOT EXISTS archived_restaurant_votes (
  LIKE restaurant_votes INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS archived_restaurant_discussions (
  LIKE restaurant_discussions INCLUDING ALL
);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS archive_old_data(INTEGER);

-- Function to archive old data
CREATE OR REPLACE FUNCTION archive_old_data(p_months_old INTEGER DEFAULT 12)
RETURNS VOID AS $$
DECLARE
  v_archived_votes INTEGER := 0;
  v_archived_discussions INTEGER := 0;
BEGIN
  -- Archive old votes
  INSERT INTO archived_restaurant_votes
  SELECT * FROM restaurant_votes
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  GET DIAGNOSTICS v_archived_votes = ROW_COUNT;
  
  DELETE FROM restaurant_votes
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  -- Archive old discussions
  INSERT INTO archived_restaurant_discussions
  SELECT * FROM restaurant_discussions
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  GET DIAGNOSTICS v_archived_discussions = ROW_COUNT;
  
  DELETE FROM restaurant_discussions
  WHERE created_at < NOW() - INTERVAL '1 month' * p_months_old;
  
  -- Log the archival results
  RAISE NOTICE 'Archived % votes and % discussions older than % months', 
    v_archived_votes, v_archived_discussions, p_months_old;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail
    RAISE WARNING 'Error during archival: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 9. ADD MONITORING VIEWS
-- =====================================================

-- View for system health monitoring
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

-- 10. ADD PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Enable parallel query execution for large tables
ALTER TABLE restaurant_votes SET (parallel_workers = 4);
ALTER TABLE restaurant_discussions SET (parallel_workers = 4);
ALTER TABLE collection_members SET (parallel_workers = 2);

-- Set appropriate autovacuum settings
ALTER TABLE restaurant_votes SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE restaurant_discussions SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- Comments for documentation
COMMENT ON FUNCTION get_user_collections_paginated IS 'Get paginated collections for a user with proper ordering and limits';
COMMENT ON FUNCTION update_user_activity_summary IS 'Update user activity summary for quick access';
COMMENT ON FUNCTION update_collection_stats_cache IS 'Update collection statistics cache for performance';
COMMENT ON FUNCTION check_rate_limit IS 'Check and enforce rate limits for user actions';
COMMENT ON FUNCTION archive_old_data IS 'Archive old data to improve performance';
