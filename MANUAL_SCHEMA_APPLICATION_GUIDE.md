# Manual Schema Application Guide

## 🚀 Applying Scalability Schema to Your Supabase Database

Since the automated approach encountered issues, here's how to apply the schema manually using the Supabase Dashboard.

### **Step 1: Access Supabase Dashboard**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `qlnllnqrdxjiigmzyhlu`

### **Step 2: Open SQL Editor**

1. In your project dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** to create a new SQL query

### **Step 3: Apply the Schema**

Copy and paste the entire contents of `database-schema-scalability.sql` into the SQL editor, then click **"Run"**.

### **Step 4: Verify Installation**

After running the schema, run these verification queries:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rate_limits', 'user_activity_summary', 'collection_stats_cache', 'user_sessions', 'archived_restaurant_votes', 'archived_restaurant_discussions');

-- Check if new functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_collections_paginated', 'update_user_activity_summary', 'update_collection_stats_cache', 'check_rate_limit', 'archive_old_data');

-- Check if new indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';
```

### **Step 5: Test Functions**

Test the new functions:

```sql
-- Test rate limiting (with explicit type casting)
SELECT check_rate_limit(
  '11111111-1111-1111-1111-111111111111'::UUID, 
  'test'::TEXT, 
  5::INTEGER, 
  60::INTEGER
);

-- Test pagination (with explicit type casting)
SELECT * FROM get_user_collections_paginated(
  '11111111-1111-1111-1111-111111111111'::UUID, 
  0::INTEGER, 
  10::INTEGER, 
  true::BOOLEAN
);

-- Test archival
SELECT archive_old_data(3);
```

## 🔧 Troubleshooting

### **If you get "function already exists" errors:**

The schema includes `DROP FUNCTION IF EXISTS` statements, but if you still get errors, manually drop the functions first:

```sql
-- Drop functions if they exist
DROP FUNCTION IF EXISTS get_user_collections_paginated(uuid, integer, integer, boolean);
DROP FUNCTION IF EXISTS update_user_activity_summary(uuid);
DROP FUNCTION IF EXISTS update_collection_stats_cache(uuid);
DROP FUNCTION IF EXISTS check_rate_limit(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS archive_old_data(integer);
```

### **If you get "table already exists" errors:**

The schema uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen, but if it does:

```sql
-- Drop tables if needed (WARNING: This will delete data)
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS user_activity_summary CASCADE;
DROP TABLE IF EXISTS collection_stats_cache CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS archived_restaurant_votes CASCADE;
DROP TABLE IF EXISTS archived_restaurant_discussions CASCADE;
```

### **If you get permission errors:**

Make sure you're using the SQL Editor with admin privileges. If you get permission errors, you may need to:

1. Check your RLS policies
2. Temporarily disable RLS for testing
3. Use the service role key in your application

## 📊 Expected Results

After successful application, you should see:

- **New Tables**: 6 new tables for scalability features
- **New Functions**: 5 new functions for advanced operations
- **New Indexes**: 8 new performance indexes
- **New Triggers**: 3 new triggers for automatic updates
- **Performance Optimizations**: Parallel workers and autovacuum settings

## 🎯 Next Steps

Once the schema is applied:

1. **Update your application code** to use the new scalable functions
2. **Test the new features** with your existing data
3. **Monitor performance** improvements
4. **Set up automated archival** if needed

## 📞 Need Help?

If you encounter any issues:

1. Check the error messages in the SQL Editor
2. Verify your database permissions
3. Ensure you're using the correct project
4. Contact support if needed

---

**Note**: This schema adds significant scalability improvements to your database. Make sure to test thoroughly in a development environment before applying to production.
