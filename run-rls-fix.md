# Fix RLS Policies in Supabase

To resolve the "infinite recursion detected in policy" errors, follow these steps:

## Option 1: Simple Fix (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix-rls-policies.sql`
4. Click "Run" to execute

## Option 2: Advanced Fix (If Option 1 doesn't work)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix-rls-policies-safe.sql`
4. Click "Run" to execute

## What This Fixes:
- ✅ Infinite recursion in RLS policies
- ✅ Circular references between collections and collection_members
- ✅ Policy conflicts causing query failures
- ✅ Better error handling for missing columns

## Expected Results:
After running the fix:
- No more "infinite recursion detected in policy" errors
- Collections will load properly
- User plans will fetch successfully
- Better error messages if issues occur

## If You Still Get Errors:
1. Check the Supabase logs for specific error messages
2. Ensure your database schema matches the expected structure
3. Try the advanced fix script if the simple one doesn't work
4. Contact support if issues persist

## Note:
The RLS policies are simplified to prevent circular references while maintaining security. This is a safe fix that won't break your existing data.
