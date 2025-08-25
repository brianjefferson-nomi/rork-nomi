-- Migration: Add comment support to user_activities table
-- This migration adds support for restaurant comments in shared collections

-- Step 1: Add 'comment' to activity_type enum
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'comment';

-- Step 2: Add comment_text column to user_activities table
ALTER TABLE user_activities 
ADD COLUMN IF NOT EXISTS comment_text TEXT;

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_restaurant_id ON user_activities(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_collection_id ON user_activities(collection_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_comment_text ON user_activities(comment_text) WHERE comment_text IS NOT NULL;

-- Step 4: Add updated_at trigger for user_activities
CREATE TRIGGER update_user_activities_updated_at 
BEFORE UPDATE ON user_activities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Add RLS policies for comment access control
-- Collection members can view activities
CREATE POLICY IF NOT EXISTS "Collection members can view activities" ON user_activities 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = user_activities.collection_id AND user_id = auth.uid()
  )
);

-- Collection members can create activities
CREATE POLICY IF NOT EXISTS "Collection members can create activities" ON user_activities 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = user_activities.collection_id AND user_id = auth.uid()
  )
);

-- Users can update their own activities
CREATE POLICY IF NOT EXISTS "Users can update their own activities" ON user_activities 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY IF NOT EXISTS "Users can delete their own activities" ON user_activities 
FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Add comment to the update_user_counts function
CREATE OR REPLACE FUNCTION update_user_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update review count
    IF NEW.type = 'review' THEN
      UPDATE users SET review_count = review_count + 1 WHERE id = NEW.user_id;
    ELSIF NEW.type = 'photo' THEN
      UPDATE users SET photo_count = photo_count + 1 WHERE id = NEW.user_id;
    ELSIF NEW.type = 'tip' THEN
      UPDATE users SET tip_count = tip_count + 1 WHERE id = NEW.user_id;
    ELSIF NEW.type = 'checkin' THEN
      UPDATE users SET checkin_count = checkin_count + 1 WHERE id = NEW.user_id;
    ELSIF NEW.type = 'comment' THEN
      -- Comments don't affect user counts, but we could add a comment_count if needed
      NULL;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update review count
    IF OLD.type = 'review' THEN
      UPDATE users SET review_count = review_count - 1 WHERE id = OLD.user_id;
    ELSIF OLD.type = 'photo' THEN
      UPDATE users SET photo_count = photo_count - 1 WHERE id = OLD.user_id;
    ELSIF OLD.type = 'tip' THEN
      UPDATE users SET tip_count = tip_count - 1 WHERE id = OLD.user_id;
    ELSIF OLD.type = 'checkin' THEN
      UPDATE users SET checkin_count = checkin_count - 1 WHERE id = OLD.user_id;
    ELSIF OLD.type = 'comment' THEN
      -- Comments don't affect user counts, but we could add a comment_count if needed
      NULL;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create a function to get restaurant comments for a collection
CREATE OR REPLACE FUNCTION get_restaurant_comments(
  p_collection_id UUID,
  p_restaurant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    u.name as user_name,
    u.avatar_url as user_avatar,
    ua.comment_text,
    ua.created_at
  FROM user_activities ua
  JOIN users u ON ua.user_id = u.id
  WHERE ua.type = 'comment'
    AND ua.collection_id = p_collection_id
    AND (p_restaurant_id IS NULL OR ua.restaurant_id = p_restaurant_id)
  ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create a function to add a restaurant comment
CREATE OR REPLACE FUNCTION add_restaurant_comment(
  p_restaurant_id UUID,
  p_collection_id UUID,
  p_comment_text TEXT
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  -- Check if user is a member of the collection
  IF NOT EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = p_collection_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a member of this collection';
  END IF;

  -- Insert the comment activity
  INSERT INTO user_activities (
    user_id,
    type,
    restaurant_id,
    collection_id,
    comment_text,
    content
  ) VALUES (
    auth.uid(),
    'comment',
    p_restaurant_id,
    p_collection_id,
    p_comment_text,
    'Added a comment to restaurant'
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_restaurant_comments(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_restaurant_comment(UUID, UUID, TEXT) TO authenticated;

-- Migration completed successfully
SELECT 'Migration completed: Added comment support to user_activities table' as status;
