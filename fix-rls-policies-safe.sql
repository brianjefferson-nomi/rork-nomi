-- Safe RLS Policy Fix - Handles existing policies gracefully
-- Run this in your Supabase SQL Editor

-- Function to safely create policies
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name TEXT,
    table_name TEXT,
    policy_type TEXT,
    policy_definition TEXT
) RETURNS VOID AS $$
BEGIN
    -- Check if policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name
    ) THEN
        -- Create the policy
        EXECUTE format('CREATE POLICY %I ON %I %s %s', 
            policy_name, table_name, policy_type, policy_definition);
        RAISE NOTICE 'Created policy: % on table %', policy_name, table_name;
    ELSE
        RAISE NOTICE 'Policy % already exists on table %, skipping...', policy_name, table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- First, drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;
DROP POLICY IF EXISTS "Collection members can view private collections" ON collections;
DROP POLICY IF EXISTS "Collection members can view membership" ON collection_members;
DROP POLICY IF EXISTS "Collection creators can manage members" ON collection_members;
DROP POLICY IF EXISTS "Users can view votes in public collections" ON restaurant_votes;
DROP POLICY IF EXISTS "Collection members can view votes" ON restaurant_votes;
DROP POLICY IF EXISTS "Users can view activities in public collections" ON user_activities;
DROP POLICY IF EXISTS "Anyone can view discussions in public collections" ON restaurant_discussions;
DROP POLICY IF EXISTS "Collection members can view discussions" ON restaurant_discussions;
DROP POLICY IF EXISTS "Collection members can create discussions" ON restaurant_discussions;
DROP POLICY IF EXISTS "Anyone can view rankings for public collections" ON restaurant_rankings;
DROP POLICY IF EXISTS "Collection members can view rankings" ON restaurant_rankings;

-- Create simplified policies that don't cause circular references
-- Collections policies
SELECT create_policy_if_not_exists(
    'Anyone can view public collections',
    'collections',
    'FOR SELECT',
    'USING (is_public = true)'
);

SELECT create_policy_if_not_exists(
    'Users can view their own collections',
    'collections',
    'FOR SELECT',
    'USING (auth.uid() = created_by)'
);

SELECT create_policy_if_not_exists(
    'Authenticated users can create collections',
    'collections',
    'FOR INSERT',
    'WITH CHECK (auth.uid() = created_by)'
);

SELECT create_policy_if_not_exists(
    'Collection creators can update collections',
    'collections',
    'FOR UPDATE',
    'USING (auth.uid() = created_by)'
);

-- Collection members policies
SELECT create_policy_if_not_exists(
    'Anyone can view collection members',
    'collection_members',
    'FOR SELECT',
    'USING (true)'
);

SELECT create_policy_if_not_exists(
    'Collection creators can manage members',
    'collection_members',
    'FOR ALL',
    'USING (EXISTS (SELECT 1 FROM collections WHERE id = collection_members.collection_id AND created_by = auth.uid()))'
);

-- Restaurant votes policies
SELECT create_policy_if_not_exists(
    'Anyone can view votes',
    'restaurant_votes',
    'FOR SELECT',
    'USING (true)'
);

SELECT create_policy_if_not_exists(
    'Users can manage their own votes',
    'restaurant_votes',
    'FOR ALL',
    'USING (auth.uid() = user_id)'
);

-- User activities policies
SELECT create_policy_if_not_exists(
    'Anyone can view activities',
    'user_activities',
    'FOR SELECT',
    'USING (true)'
);

SELECT create_policy_if_not_exists(
    'System can insert activities',
    'user_activities',
    'FOR INSERT',
    'WITH CHECK (true)'
);

-- Restaurant discussions policies
SELECT create_policy_if_not_exists(
    'Anyone can view discussions',
    'restaurant_discussions',
    'FOR SELECT',
    'USING (true)'
);

SELECT create_policy_if_not_exists(
    'Users can create discussions',
    'restaurant_discussions',
    'FOR INSERT',
    'WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can update their own discussions',
    'restaurant_discussions',
    'FOR UPDATE',
    'USING (auth.uid() = user_id)'
);

-- Restaurant rankings policies
SELECT create_policy_if_not_exists(
    'Anyone can view rankings',
    'restaurant_rankings',
    'FOR SELECT',
    'USING (true)'
);

-- Clean up the helper function
DROP FUNCTION IF EXISTS create_policy_if_not_exists(TEXT, TEXT, TEXT, TEXT);

-- Show final policy status
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
