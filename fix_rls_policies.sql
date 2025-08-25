-- Fix RLS policies to prevent infinite recursion
-- This migration fixes the circular references in the RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Shared collections are viewable by creator and members" ON collections;
DROP POLICY IF EXISTS "Members can view collection memberships they have access to" ON collection_members;
DROP POLICY IF EXISTS "Votes are visible based on collection type" ON restaurant_votes;
DROP POLICY IF EXISTS "Discussions are visible based on collection type" ON restaurant_discussions;
DROP POLICY IF EXISTS "Activities are visible based on collection type" ON user_activities;

-- Create simplified policies that avoid recursion

-- Collections policies
CREATE POLICY "Collections access policy" ON collections
FOR SELECT USING (
  collection_type = 'public' OR
  created_by = auth.uid() OR
  id IN (
    SELECT collection_id 
    FROM collection_members 
    WHERE user_id = auth.uid()
  )
);

-- Collection members policies
CREATE POLICY "Collection members access policy" ON collection_members
FOR SELECT USING (
  user_id = auth.uid() OR
  collection_id IN (
    SELECT id FROM collections 
    WHERE collection_type = 'public' OR created_by = auth.uid()
  )
);

-- Restaurant votes policies
CREATE POLICY "Restaurant votes access policy" ON restaurant_votes
FOR SELECT USING (
  user_id = auth.uid() OR
  collection_id IN (
    SELECT id FROM collections 
    WHERE collection_type = 'public' OR created_by = auth.uid()
  ) OR
  collection_id IN (
    SELECT collection_id 
    FROM collection_members 
    WHERE user_id = auth.uid()
  )
);

-- Restaurant discussions policies
CREATE POLICY "Restaurant discussions access policy" ON restaurant_discussions
FOR SELECT USING (
  user_id = auth.uid() OR
  collection_id IN (
    SELECT id FROM collections 
    WHERE collection_type = 'public' OR created_by = auth.uid()
  ) OR
  collection_id IN (
    SELECT collection_id 
    FROM collection_members 
    WHERE user_id = auth.uid()
  )
);

-- User activities policies
CREATE POLICY "User activities access policy" ON user_activities
FOR SELECT USING (
  user_id = auth.uid() OR
  collection_id IN (
    SELECT id FROM collections 
    WHERE collection_type = 'public' OR created_by = auth.uid()
  ) OR
  collection_id IN (
    SELECT collection_id 
    FROM collection_members 
    WHERE user_id = auth.uid()
  )
);

-- Insert policies for collections
CREATE POLICY "Users can create collections" ON collections
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Update policies for collections
CREATE POLICY "Users can update their own collections" ON collections
FOR UPDATE USING (created_by = auth.uid());

-- Delete policies for collections
CREATE POLICY "Users can delete their own collections" ON collections
FOR DELETE USING (created_by = auth.uid());

-- Insert policies for collection_members
CREATE POLICY "Collection creators can add members" ON collection_members
FOR INSERT WITH CHECK (
  collection_id IN (
    SELECT id FROM collections WHERE created_by = auth.uid()
  )
);

-- Update policies for collection_members
CREATE POLICY "Collection creators can update members" ON collection_members
FOR UPDATE USING (
  collection_id IN (
    SELECT id FROM collections WHERE created_by = auth.uid()
  )
);

-- Delete policies for collection_members
CREATE POLICY "Collection creators can remove members" ON collection_members
FOR DELETE USING (
  collection_id IN (
    SELECT id FROM collections WHERE created_by = auth.uid()
  )
);

-- Insert policies for restaurant_votes
CREATE POLICY "Users can vote on accessible collections" ON restaurant_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND (
    collection_id IN (
      SELECT id FROM collections 
      WHERE collection_type = 'public' OR created_by = auth.uid()
    ) OR
    collection_id IN (
      SELECT collection_id 
      FROM collection_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Update policies for restaurant_votes
CREATE POLICY "Users can update their own votes" ON restaurant_votes
FOR UPDATE USING (user_id = auth.uid());

-- Delete policies for restaurant_votes
CREATE POLICY "Users can delete their own votes" ON restaurant_votes
FOR DELETE USING (user_id = auth.uid());

-- Insert policies for restaurant_discussions
CREATE POLICY "Users can discuss on accessible collections" ON restaurant_discussions
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND (
    collection_id IN (
      SELECT id FROM collections 
      WHERE collection_type = 'public' OR created_by = auth.uid()
    ) OR
    collection_id IN (
      SELECT collection_id 
      FROM collection_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Update policies for restaurant_discussions
CREATE POLICY "Users can update their own discussions" ON restaurant_discussions
FOR UPDATE USING (user_id = auth.uid());

-- Delete policies for restaurant_discussions
CREATE POLICY "Users can delete their own discussions" ON restaurant_discussions
FOR DELETE USING (user_id = auth.uid());

-- Insert policies for user_activities
CREATE POLICY "Users can create activities on accessible collections" ON user_activities
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND (
    collection_id IN (
      SELECT id FROM collections 
      WHERE collection_type = 'public' OR created_by = auth.uid()
    ) OR
    collection_id IN (
      SELECT collection_id 
      FROM collection_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Update policies for user_activities
CREATE POLICY "Users can update their own activities" ON user_activities
FOR UPDATE USING (user_id = auth.uid());

-- Delete policies for user_activities
CREATE POLICY "Users can delete their own activities" ON user_activities
FOR DELETE USING (user_id = auth.uid());
