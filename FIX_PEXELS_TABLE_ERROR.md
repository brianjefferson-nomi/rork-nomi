# Fix for Pexels Images Table Error

## Problem
The app is trying to use a `pexels_images` table that doesn't exist in your Supabase database. This table is used to cache Pexels images for collections, neighborhoods, and cuisines.

## Solution

### Option 1: Run the Migration Manually (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Create a New Query**
   - Click "New query"

4. **Copy and Paste the Migration SQL**
   - Copy the entire contents of `database/migrations/create_pexels_images_table.sql`
   - Paste it into the SQL editor

5. **Run the Query**
   - Click "Run" or press Cmd/Ctrl + Enter
   - You should see a success message

6. **Verify the Table**
   - Go to "Table Editor" in the sidebar
   - You should now see a `pexels_images` table

### Option 2: Use the Migration Script

If you have a Supabase service role key:

1. **Add Service Role Key to .env**
   ```
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

2. **Run the Migration Script**
   ```bash
   node run-pexels-migration.js
   ```

### Option 3: Continue Without the Table (Temporary)

The code has been updated to handle the missing table gracefully. The app will:
- Continue to work without crashing
- Skip database caching of Pexels images
- Show warning messages in the console

However, this means:
- Images won't be cached in the database
- The app will make more API calls to Pexels
- Performance may be slightly slower

## What the Table Does

The `pexels_images` table:
- Caches images from Pexels API to reduce API calls
- Stores image metadata (photographer, dimensions, etc.)
- Associates images with collections, neighborhoods, and cuisines
- Improves app performance by serving cached images

## After Creating the Table

Once the table is created:
- The error messages will stop appearing
- Images will be cached automatically
- App performance will improve
- You'll use fewer Pexels API calls

## Need Help?

If you encounter issues:
1. Check that you're using the correct Supabase project
2. Ensure you have the necessary permissions
3. Verify the table was created in the "public" schema
4. Check the Supabase logs for any errors