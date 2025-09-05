-- Create collection_follows table to track user follows for public collections
CREATE TABLE IF NOT EXISTS collection_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only follow a collection once
  UNIQUE(user_id, collection_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collection_follows_user_id ON collection_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_follows_collection_id ON collection_follows(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_follows_created_at ON collection_follows(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE collection_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all follows (for follower counts)
CREATE POLICY "Users can view all collection follows" ON collection_follows
  FOR SELECT USING (true);

-- Users can only insert their own follows
CREATE POLICY "Users can follow collections" ON collection_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own follows
CREATE POLICY "Users can unfollow collections" ON collection_follows
  FOR DELETE USING (auth.uid() = user_id);

-- Add follower_count column to collections table if it doesn't exist
ALTER TABLE collections ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Create a function to update follower count
CREATE OR REPLACE FUNCTION update_collection_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections 
    SET follower_count = GREATEST(0, follower_count - 1) 
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update follower count
DROP TRIGGER IF EXISTS trigger_update_follower_count_insert ON collection_follows;
CREATE TRIGGER trigger_update_follower_count_insert
  AFTER INSERT ON collection_follows
  FOR EACH ROW EXECUTE FUNCTION update_collection_follower_count();

DROP TRIGGER IF EXISTS trigger_update_follower_count_delete ON collection_follows;
CREATE TRIGGER trigger_update_follower_count_delete
  AFTER DELETE ON collection_follows
  FOR EACH ROW EXECUTE FUNCTION update_collection_follower_count();
