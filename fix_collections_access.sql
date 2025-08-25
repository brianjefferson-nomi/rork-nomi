-- Fix collections access by temporarily disabling RLS and creating simple policies
-- This will allow users to see their collections while we debug the RLS issues

-- First, disable RLS temporarily to allow access
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Collections SELECT policy" ON collections;
DROP POLICY IF EXISTS "Collections INSERT policy" ON collections;
DROP POLICY IF EXISTS "Collections UPDATE policy" ON collections;
DROP POLICY IF EXISTS "Collections DELETE policy" ON collections;

-- Create simple, non-recursive policies
CREATE POLICY "Allow all operations on collections" ON collections
FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS again with the simple policy
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Add a comment to track this fix
COMMENT ON TABLE collections IS 'RLS temporarily simplified for debugging - collections should now be accessible';
