-- Simple RLS Policy Fix - Drop and recreate all policies
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies (this will work even if some don't exist)
DO $$
BEGIN
    -- Drop collections policies
    DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;
    DROP POLICY IF EXISTS "Collection members can view private collections" ON collections;
    DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
    DROP POLICY IF EXISTS "Authenticated users can create collections" ON collections;
    DROP POLICY IF EXISTS "Collection creators can update collections" ON collections;
    
    -- Drop collection_members policies
    DROP POLICY IF EXISTS "Collection members can view membership" ON collection_members;
    DROP POLICY IF EXISTS "Collection creators can manage members" ON collection_members;
    DROP POLICY IF EXISTS "Anyone can view collection members" ON collection_members;
    
    -- Drop restaurant_votes policies
    DROP POLICY IF EXISTS "Users can view votes in public collections" ON restaurant_votes;
    DROP POLICY IF EXISTS "Collection members can view votes" ON restaurant_votes;
    DROP POLICY IF EXISTS "Anyone can view votes" ON restaurant_votes;
    DROP POLICY IF EXISTS "Users can manage their own votes" ON restaurant_votes;
    
    -- Drop user_activities policies
    DROP POLICY IF EXISTS "Users can view activities in public collections" ON user_activities;
    DROP POLICY IF EXISTS "Anyone can view activities" ON user_activities;
    DROP POLICY IF EXISTS "System can insert activities" ON user_activities;
    
    -- Drop restaurant_discussions policies
    DROP POLICY IF EXISTS "Anyone can view discussions in public collections" ON restaurant_discussions;
    DROP POLICY IF EXISTS "Collection members can view discussions" ON restaurant_discussions;
    DROP POLICY IF EXISTS "Collection members can create discussions" ON restaurant_discussions;
    DROP POLICY IF EXISTS "Anyone can view discussions" ON restaurant_discussions;
    DROP POLICY IF EXISTS "Users can create discussions" ON restaurant_discussions;
    DROP POLICY IF EXISTS "Users can update their own discussions" ON restaurant_discussions;
    
    -- Drop restaurant_rankings policies
    DROP POLICY IF EXISTS "Anyone can view rankings for public collections" ON restaurant_rankings;
    DROP POLICY IF EXISTS "Collection members can view rankings" ON restaurant_rankings;
    DROP POLICY IF EXISTS "Anyone can view rankings" ON restaurant_rankings;
    
    RAISE NOTICE 'All existing policies dropped successfully';
END $$;

-- Step 2: Create new simplified policies
-- Collections policies (simplified)
CREATE POLICY "Anyone can view public collections" ON collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own collections" ON collections FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can create collections" ON collections FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Collection creators can update collections" ON collections FOR UPDATE USING (auth.uid() = created_by);

-- Collection members policies (simplified)
CREATE POLICY "Anyone can view collection members" ON collection_members FOR SELECT USING (true);
CREATE POLICY "Collection creators can manage members" ON collection_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_members.collection_id AND created_by = auth.uid()
  )
);

-- Restaurant votes policies (simplified)
CREATE POLICY "Anyone can view votes" ON restaurant_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own votes" ON restaurant_votes FOR ALL USING (auth.uid() = user_id);

-- User activities policies (simplified)
CREATE POLICY "Anyone can view activities" ON user_activities FOR SELECT USING (true);
CREATE POLICY "System can insert activities" ON user_activities FOR INSERT WITH CHECK (true);

-- Restaurant discussions policies (simplified)
CREATE POLICY "Anyone can view discussions" ON restaurant_discussions FOR SELECT USING (true);
CREATE POLICY "Users can create discussions" ON restaurant_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own discussions" ON restaurant_discussions FOR UPDATE USING (auth.uid() = user_id);

-- Restaurant rankings policies (simplified)
CREATE POLICY "Anyone can view rankings" ON restaurant_rankings FOR SELECT USING (true);

-- Step 3: Show final policy status
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
