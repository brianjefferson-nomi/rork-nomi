-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE vote_type AS ENUM ('like', 'dislike');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE vote_visibility AS ENUM ('public', 'anonymous', 'admin_only');
CREATE TYPE consensus_level AS ENUM ('strong', 'moderate', 'mixed', 'low');
CREATE TYPE activity_type AS ENUM ('review', 'photo', 'tip', 'checkin', 'favorite', 'collection', 'vote');
CREATE TYPE authority_level AS ENUM ('regular', 'verified', 'admin');

-- Users table (profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  favorite_restaurants TEXT[] DEFAULT '{}',
  review_count INTEGER DEFAULT 0,
  photo_count INTEGER DEFAULT 0,
  tip_count INTEGER DEFAULT 0,
  checkin_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  is_local_expert BOOLEAN DEFAULT FALSE,
  expert_areas TEXT[] DEFAULT '{}',
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_code TEXT UNIQUE NOT NULL, -- Simple string code for easy reference
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  price_range TEXT NOT NULL CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  hours TEXT,
  vibe TEXT[] DEFAULT '{}',
  description TEXT,
  menu_highlights TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  reviews TEXT[] DEFAULT '{}',
  ai_description TEXT,
  ai_vibes TEXT[] DEFAULT '{}',
  ai_top_picks TEXT[] DEFAULT '{}',
  phone TEXT,
  website TEXT,
  price_level INTEGER,
  vibe_tags TEXT[] DEFAULT '{}',
  booking_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cached_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_code TEXT UNIQUE NOT NULL, -- Simple string code for easy reference
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Alias for created_by
  occasion TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  likes INTEGER DEFAULT 0,
  equal_voting BOOLEAN DEFAULT TRUE,
  admin_weighted BOOLEAN DEFAULT FALSE,
  expertise_weighted BOOLEAN DEFAULT FALSE,
  minimum_participation INTEGER DEFAULT 1,
  voting_deadline TIMESTAMP WITH TIME ZONE,
  allow_vote_changes BOOLEAN DEFAULT TRUE,
  anonymous_voting BOOLEAN DEFAULT FALSE,
  vote_visibility vote_visibility DEFAULT 'public',
  discussion_enabled BOOLEAN DEFAULT TRUE,
  auto_ranking_enabled BOOLEAN DEFAULT TRUE,
  consensus_threshold INTEGER DEFAULT 50,
  restaurant_ids TEXT[] DEFAULT '{}', -- For backward compatibility
  collaborators TEXT[] DEFAULT '{}', -- For backward compatibility
  unique_code TEXT, -- For backward compatibility
  planned_date TIMESTAMP WITH TIME ZONE, -- For backward compatibility
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection members table
CREATE TABLE IF NOT EXISTS collection_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  vote_weight INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT FALSE,
  expertise TEXT[] DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, user_id)
);

-- Collection restaurants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS collection_restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, restaurant_id)
);

-- Restaurant votes (likes/dislikes)
CREATE TABLE IF NOT EXISTS restaurant_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  vote vote_type NOT NULL,
  authority authority_level DEFAULT 'regular',
  weight INTEGER DEFAULT 1,
  reason TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id, collection_id)
);

-- User reviews
CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Plan invitations
CREATE TABLE IF NOT EXISTS plan_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id),
  invitee_email TEXT NOT NULL,
  status invitation_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API calls tracking
CREATE TABLE IF NOT EXISTS api_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_data JSONB,
  response_status INTEGER,
  response_data JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant discussions
CREATE TABLE IF NOT EXISTS restaurant_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES restaurant_discussions(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User relationships (followers/following)
CREATE TABLE IF NOT EXISTS user_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Restaurant rankings (cached results)
CREATE TABLE IF NOT EXISTS restaurant_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  net_score DECIMAL(10,4) DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  like_ratio DECIMAL(5,4) DEFAULT 0,
  engagement_boost DECIMAL(10,4) DEFAULT 0,
  recency_boost DECIMAL(10,4) DEFAULT 0,
  distance_boost DECIMAL(10,4) DEFAULT 0,
  authority_applied BOOLEAN DEFAULT FALSE,
  consensus consensus_level DEFAULT 'low',
  badge TEXT,
  trend TEXT,
  approval_percent DECIMAL(5,2) DEFAULT 0,
  rank INTEGER,
  discussion_count INTEGER DEFAULT 0,
  vote_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, restaurant_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_neighborhood ON restaurants(neighborhood);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_code ON restaurants(restaurant_code);
CREATE INDEX IF NOT EXISTS idx_collections_created_by ON collections(created_by);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collections_code ON collections(collection_code);
CREATE INDEX IF NOT EXISTS idx_collection_members_collection_id ON collection_members(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_members_user_id ON collection_members(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_votes_restaurant_id ON restaurant_votes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_votes_user_id ON restaurant_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_votes_collection_id ON restaurant_votes(collection_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_restaurant_id ON user_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_user_id ON api_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON api_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(type);
CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_restaurant_id ON restaurant_discussions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_discussions_collection_id ON restaurant_discussions(collection_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_rankings_collection_id ON restaurant_rankings(collection_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_rankings_rank ON restaurant_rankings(rank);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_votes_updated_at BEFORE UPDATE ON restaurant_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON user_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_invitations_updated_at BEFORE UPDATE ON plan_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_discussions_updated_at BEFORE UPDATE ON restaurant_discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_rankings_updated_at BEFORE UPDATE ON restaurant_rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_rankings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Restaurants policies
CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert restaurants" ON restaurants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update restaurants" ON restaurants FOR UPDATE USING (auth.role() = 'authenticated');

-- Collections policies
CREATE POLICY "Anyone can view public collections" ON collections FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "Collection members can view private collections" ON collections FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = collections.id AND user_id = auth.uid()
  )
);
CREATE POLICY "Authenticated users can create collections" ON collections FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Collection creators can update collections" ON collections FOR UPDATE USING (auth.uid() = created_by);

-- Collection members policies
CREATE POLICY "Collection members can view membership" ON collection_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);
CREATE POLICY "Collection creators can manage members" ON collection_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id AND created_by = auth.uid()
  )
);

-- Restaurant votes policies
CREATE POLICY "Users can view votes in public collections" ON restaurant_votes FOR SELECT USING (
  collection_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = restaurant_votes.collection_id AND is_public = true
  )
);
CREATE POLICY "Collection members can view votes" ON restaurant_votes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = restaurant_votes.collection_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage their own votes" ON restaurant_votes FOR ALL USING (auth.uid() = user_id);

-- User reviews policies
CREATE POLICY "Anyone can view reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews" ON user_reviews FOR ALL USING (auth.uid() = user_id);

-- API calls policies
CREATE POLICY "Users can view their own API calls" ON api_calls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert API calls" ON api_calls FOR INSERT WITH CHECK (true);

-- User activities policies
CREATE POLICY "Users can view their own activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view activities in public collections" ON user_activities FOR SELECT USING (
  collection_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = user_activities.collection_id AND is_public = true
  )
);
CREATE POLICY "System can insert activities" ON user_activities FOR INSERT WITH CHECK (true);

-- Restaurant discussions policies
CREATE POLICY "Anyone can view discussions in public collections" ON restaurant_discussions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = restaurant_discussions.collection_id AND is_public = true
  )
);
CREATE POLICY "Collection members can view discussions" ON restaurant_discussions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = restaurant_discussions.collection_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Collection members can create discussions" ON restaurant_discussions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = restaurant_discussions.collection_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own discussions" ON restaurant_discussions FOR UPDATE USING (auth.uid() = user_id);

-- User relationships policies
CREATE POLICY "Anyone can view relationships" ON user_relationships FOR SELECT USING (true);
CREATE POLICY "Users can manage their own relationships" ON user_relationships FOR ALL USING (auth.uid() = follower_id);

-- Restaurant rankings policies
CREATE POLICY "Anyone can view rankings for public collections" ON restaurant_rankings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = restaurant_rankings.collection_id AND is_public = true
  )
);
CREATE POLICY "Collection members can view rankings" ON restaurant_rankings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collection_members 
    WHERE collection_id = restaurant_rankings.collection_id AND user_id = auth.uid()
  )
);
CREATE POLICY "System can manage rankings" ON restaurant_rankings FOR ALL USING (true);

-- Create functions for common operations
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
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_counts_trigger
  AFTER INSERT OR DELETE ON user_activities
  FOR EACH ROW EXECUTE FUNCTION update_user_counts();

-- Function to update collection likes count
CREATE OR REPLACE FUNCTION update_collection_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections SET likes = likes + 1 WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections SET likes = likes - 1 WHERE id = OLD.collection_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate restaurant ranking
CREATE OR REPLACE FUNCTION calculate_restaurant_ranking(collection_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete existing rankings for this collection
  DELETE FROM restaurant_rankings WHERE collection_id = collection_uuid;
  
  -- Insert new rankings
  INSERT INTO restaurant_rankings (
    collection_id,
    restaurant_id,
    net_score,
    likes,
    dislikes,
    like_ratio,
    approval_percent,
    rank
  )
  SELECT 
    cr.collection_id,
    cr.restaurant_id,
    COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN rv.weight ELSE -rv.weight END), 0) as net_score,
    COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0) as likes,
    COALESCE(SUM(CASE WHEN rv.vote = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes,
    CASE 
      WHEN COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN rv.vote = 'dislike' THEN 1 ELSE 0 END), 0) = 0 THEN 0
      ELSE COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0)::DECIMAL / 
           (COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN rv.vote = 'dislike' THEN 1 ELSE 0 END), 0))::DECIMAL
    END as like_ratio,
    CASE 
      WHEN COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN rv.vote = 'dislike' THEN 1 ELSE 0 END), 0) = 0 THEN 0
      ELSE (COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0)::DECIMAL / 
            (COALESCE(SUM(CASE WHEN rv.vote = 'like' THEN 1 ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN rv.vote = 'dislike' THEN 1 ELSE 0 END), 0))::DECIMAL * 100)
    END as approval_percent
  FROM collection_restaurants cr
  LEFT JOIN restaurant_votes rv ON cr.restaurant_id = rv.restaurant_id AND cr.collection_id = rv.collection_id
  WHERE cr.collection_id = collection_uuid
  GROUP BY cr.collection_id, cr.restaurant_id
  ORDER BY net_score DESC, like_ratio DESC;
  
  -- Update ranks
  UPDATE restaurant_rankings 
  SET rank = subquery.rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY net_score DESC, like_ratio DESC) as rank
    FROM restaurant_rankings 
    WHERE collection_id = collection_uuid
  ) subquery
  WHERE restaurant_rankings.id = subquery.id;
END;
$$ LANGUAGE plpgsql;
