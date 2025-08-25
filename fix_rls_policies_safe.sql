-- Safe RLS policies fix - checks for existing policies before creating
-- This migration safely fixes the circular references in the RLS policies

-- First, drop the problematic policies if they exist
DROP POLICY IF EXISTS "Shared collections are viewable by creator and members" ON collections;
DROP POLICY IF EXISTS "Members can view collection memberships they have access to" ON collection_members;
DROP POLICY IF EXISTS "Votes are visible based on collection type" ON restaurant_votes;
DROP POLICY IF EXISTS "Discussions are visible based on collection type" ON restaurant_discussions;
DROP POLICY IF EXISTS "Activities are visible based on collection type" ON user_activities;

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON collections;
DROP POLICY IF EXISTS "Private collections are viewable by creator only" ON collections;
DROP POLICY IF EXISTS "Collections access policy" ON collections;
DROP POLICY IF EXISTS "Collection members access policy" ON collection_members;
DROP POLICY IF EXISTS "Restaurant votes access policy" ON restaurant_votes;
DROP POLICY IF EXISTS "Restaurant discussions access policy" ON restaurant_discussions;
DROP POLICY IF EXISTS "User activities access policy" ON user_activities;

-- Create simplified policies that avoid recursion (only if they don't exist)

-- Collections policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Collections access policy'
    ) THEN
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
    END IF;
END $$;

-- Collection members policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collection_members' 
        AND policyname = 'Collection members access policy'
    ) THEN
        CREATE POLICY "Collection members access policy" ON collection_members
        FOR SELECT USING (
          user_id = auth.uid() OR
          collection_id IN (
            SELECT id FROM collections 
            WHERE collection_type = 'public' OR created_by = auth.uid()
          )
        );
    END IF;
END $$;

-- Restaurant votes policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_votes' 
        AND policyname = 'Restaurant votes access policy'
    ) THEN
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
    END IF;
END $$;

-- Restaurant discussions policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_discussions' 
        AND policyname = 'Restaurant discussions access policy'
    ) THEN
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
    END IF;
END $$;

-- User activities policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_activities' 
        AND policyname = 'User activities access policy'
    ) THEN
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
    END IF;
END $$;

-- Insert policies for collections
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Users can create collections'
    ) THEN
        CREATE POLICY "Users can create collections" ON collections
        FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
END $$;

-- Update policies for collections
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Users can update their own collections'
    ) THEN
        CREATE POLICY "Users can update their own collections" ON collections
        FOR UPDATE USING (created_by = auth.uid());
    END IF;
END $$;

-- Delete policies for collections
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Users can delete their own collections'
    ) THEN
        CREATE POLICY "Users can delete their own collections" ON collections
        FOR DELETE USING (created_by = auth.uid());
    END IF;
END $$;

-- Insert policies for collection_members
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collection_members' 
        AND policyname = 'Collection creators can add members'
    ) THEN
        CREATE POLICY "Collection creators can add members" ON collection_members
        FOR INSERT WITH CHECK (
          collection_id IN (
            SELECT id FROM collections WHERE created_by = auth.uid()
          )
        );
    END IF;
END $$;

-- Update policies for collection_members
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collection_members' 
        AND policyname = 'Collection creators can update members'
    ) THEN
        CREATE POLICY "Collection creators can update members" ON collection_members
        FOR UPDATE USING (
          collection_id IN (
            SELECT id FROM collections WHERE created_by = auth.uid()
          )
        );
    END IF;
END $$;

-- Delete policies for collection_members
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collection_members' 
        AND policyname = 'Collection creators can remove members'
    ) THEN
        CREATE POLICY "Collection creators can remove members" ON collection_members
        FOR DELETE USING (
          collection_id IN (
            SELECT id FROM collections WHERE created_by = auth.uid()
          )
        );
    END IF;
END $$;

-- Insert policies for restaurant_votes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_votes' 
        AND policyname = 'Users can vote on accessible collections'
    ) THEN
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
    END IF;
END $$;

-- Update policies for restaurant_votes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_votes' 
        AND policyname = 'Users can update their own votes'
    ) THEN
        CREATE POLICY "Users can update their own votes" ON restaurant_votes
        FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Delete policies for restaurant_votes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_votes' 
        AND policyname = 'Users can delete their own votes'
    ) THEN
        CREATE POLICY "Users can delete their own votes" ON restaurant_votes
        FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- Insert policies for restaurant_discussions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_discussions' 
        AND policyname = 'Users can discuss on accessible collections'
    ) THEN
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
    END IF;
END $$;

-- Update policies for restaurant_discussions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_discussions' 
        AND policyname = 'Users can update their own discussions'
    ) THEN
        CREATE POLICY "Users can update their own discussions" ON restaurant_discussions
        FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Delete policies for restaurant_discussions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurant_discussions' 
        AND policyname = 'Users can delete their own discussions'
    ) THEN
        CREATE POLICY "Users can delete their own discussions" ON restaurant_discussions
        FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- Insert policies for user_activities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_activities' 
        AND policyname = 'Users can create activities on accessible collections'
    ) THEN
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
    END IF;
END $$;

-- Update policies for user_activities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_activities' 
        AND policyname = 'Users can update their own activities'
    ) THEN
        CREATE POLICY "Users can update their own activities" ON user_activities
        FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Delete policies for user_activities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_activities' 
        AND policyname = 'Users can delete their own activities'
    ) THEN
        CREATE POLICY "Users can delete their own activities" ON user_activities
        FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;
