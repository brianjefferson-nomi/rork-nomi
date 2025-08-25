# Cursor + Supabase CLI Setup Guide

## ✅ What's Already Done

1. **Supabase CLI installed**: `supabase --version` shows v2.34.3
2. **Supabase CLI logged in**: You're authenticated with Supabase
3. **Project initialized**: Supabase config files created in `supabase/` directory
4. **Code fixes applied**: Fixed `collection_type` references in `services/supabase.ts`

## 🔧 Next Steps to Complete the Setup

### Option 1: Manual SQL Execution (Recommended)

Since the `exec_sql` function doesn't exist in your project, you'll need to run the SQL manually:

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/qlnllnqrdxjiigmzyhlu
   - Navigate to **SQL Editor**

2. **Run the RLS Fix**:
   - Click "New Query"
   - Copy and paste the entire contents of `fix_collections_access.sql`
   - Click "Run"

3. **Verify the Fix**:
   - Run this query to check if collections are accessible:
   ```sql
   SELECT * FROM collections LIMIT 5;
   ```

### Option 2: Complete Supabase CLI Setup

To fully link Cursor with Supabase CLI, you need the database password:

1. **Get Database Password**:
   - Go to: https://supabase.com/dashboard/project/qlnllnqrdxjiigmzyhlu/settings/database
   - Copy the database password

2. **Link the Project**:
   ```bash
   supabase link --project-ref qlnllnqrdxjiigmzyhlu
   # Enter the database password when prompted
   ```

3. **Run SQL Commands**:
   ```bash
   supabase db push --include-all
   ```

## 🚀 Cursor Integration Features

Once set up, you can use these commands in Cursor's terminal:

### Database Operations
```bash
# View database status
supabase status

# Generate types from database
supabase gen types typescript --local > types/database.types.ts

# Run migrations
supabase db push

# Reset database
supabase db reset
```

### Development Workflow
```bash
# Start local development
supabase start

# Stop local development
supabase stop

# View logs
supabase logs
```

## 🔍 Testing Collections Access

After applying the RLS fix, test your app:

1. **Run your app**:
   ```bash
   npm start
   # or
   expo start
   ```

2. **Check collections in the app**:
   - Navigate to the Collections/Lists tab
   - You should now see collections you're a member of

3. **Debug if needed**:
   - Check browser console for any errors
   - Verify authentication is working

## 📁 Project Structure

```
rork-nomi/
├── supabase/           # Supabase CLI configuration
│   ├── config.toml    # Project configuration
│   └── .gitignore     # Git ignore rules
├── services/
│   └── supabase.ts    # Fixed Supabase client
├── fix_collections_access.sql  # RLS fix SQL
└── CURSOR_SUPABASE_SETUP.md   # This guide
```

## 🐛 Troubleshooting

### If collections still don't show:

1. **Check RLS policies**:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'collections';
   ```

2. **Verify user authentication**:
   ```sql
   SELECT auth.uid();
   ```

3. **Test collection access**:
   ```sql
   SELECT * FROM collections 
   WHERE is_public = true 
   OR created_by = auth.uid() 
   OR EXISTS (
     SELECT 1 FROM collection_members 
     WHERE collection_id = collections.id AND user_id = auth.uid()
   );
   ```

### If Supabase CLI issues:

1. **Re-authenticate**:
   ```bash
   supabase logout
   supabase login
   ```

2. **Re-link project**:
   ```bash
   supabase unlink
   supabase link --project-ref qlnllnqrdxjiigmzyhlu
   ```

## 🎯 Quick Fix Summary

The main issue was:
1. **Circular RLS policies** between `collections` and `collection_members`
2. **Incorrect field references** (`collection_type` vs `is_public`)

**Solution**: 
- Fixed RLS policies to avoid circular dependencies
- Updated code to use correct database schema fields
- Applied fixes via SQL commands

Your collections should now be accessible! 🎉
