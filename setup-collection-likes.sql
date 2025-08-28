-- Create collection_likes table to track user likes on collections
CREATE TABLE IF NOT EXISTS collection_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, user_id) -- Prevent duplicate likes from same user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collection_likes_collection_id ON collection_likes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_likes_user_id ON collection_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_likes_created_at ON collection_likes(created_at);

-- Add a function to toggle like status
CREATE OR REPLACE FUNCTION toggle_collection_like(
  p_collection_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM collection_likes 
    WHERE collection_id = p_collection_id AND user_id = p_user_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM collection_likes 
    WHERE collection_id = p_collection_id AND user_id = p_user_id;
    RETURN FALSE; -- Like removed
  ELSE
    -- Add like
    INSERT INTO collection_likes (collection_id, user_id)
    VALUES (p_collection_id, p_user_id);
    RETURN TRUE; -- Like added
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Verify the table was created
SELECT 'collection_likes table created successfully' as status;
