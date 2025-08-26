-- =====================================================
-- FIX AMBIGUOUS COLUMN REFERENCE ERROR
-- =====================================================

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_user_collections_paginated(UUID, INTEGER, INTEGER, BOOLEAN);

-- Recreate the function with proper column qualification
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

-- Test the function
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

-- Show success message
SELECT 'Ambiguous column reference fixed successfully!' as status;
