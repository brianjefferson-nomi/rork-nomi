-- Fix infinite recursion in collections RLS policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Collections access policy" ON collections;
DROP POLICY IF EXISTS "Users can create collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON collections;
DROP POLICY IF EXISTS "Private collections are viewable by creator only" ON collections;
DROP POLICY IF EXISTS "Shared collections are viewable by creator and members" ON collections;

-- Create simplified, non-recursive policies
DO $$
BEGIN
    -- SELECT policy - simplified to avoid recursion
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Collections SELECT policy'
    ) THEN
        CREATE POLICY "Collections SELECT policy" ON collections
        FOR SELECT USING (
            collection_type = 'public' OR
            created_by = auth.uid() OR
            creator_id = auth.uid()
        );
    END IF;

    -- INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Collections INSERT policy'
    ) THEN
        CREATE POLICY "Collections INSERT policy" ON collections
        FOR INSERT WITH CHECK (
            created_by = auth.uid() OR
            creator_id = auth.uid()
        );
    END IF;

    -- UPDATE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Collections UPDATE policy'
    ) THEN
        CREATE POLICY "Collections UPDATE policy" ON collections
        FOR UPDATE USING (
            created_by = auth.uid() OR
            creator_id = auth.uid()
        );
    END IF;

    -- DELETE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Collections DELETE policy'
    ) THEN
        CREATE POLICY "Collections DELETE policy" ON collections
        FOR DELETE USING (
            created_by = auth.uid() OR
            creator_id = auth.uid()
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
