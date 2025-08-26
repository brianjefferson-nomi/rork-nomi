# 🔧 Manual Schema Application Guide

## 🚨 **Error: Cannot Change Return Type of Existing Function**

If you're getting the error:
```
ERROR: 42P13: cannot change return type of existing function
DETAIL: Row type defined by OUT parameters is different.
HINT: Use DROP FUNCTION get_user_collections_paginated(uuid,integer,integer,boolean) first.
```

This means the functions already exist in your database with different signatures. Here's how to fix it:

## 🔧 **Solution: Manual Application**

### **Step 1: Connect to Your Database**

```bash
# Using psql
psql -h your-host -U your-user -d your-database

# Or using Supabase CLI
supabase db reset
```

### **Step 2: Drop Existing Functions (if they exist)**

Run these commands in your database:

```sql
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_collections_paginated(UUID, INTEGER, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS update_user_activity_summary(UUID);
DROP FUNCTION IF EXISTS update_collection_stats_cache(UUID);
DROP FUNCTION IF EXISTS trigger_update_collection_stats();
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS archive_old_data(INTEGER);
```

### **Step 3: Apply the Schema**

```bash
# Apply the complete schema
psql -d your-database -f database-schema-scalability.sql
```

## 🧪 **Alternative: Apply Schema in Parts**

If you want to apply the schema step by step, here are the sections:

### **Part 1: Indexes**
```sql
-- Apply performance indexes
CREATE INDEX IF NOT EXISTS idx_collections_created_by_created_at ON collections(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_votes_user_collection ON restaurant_votes(user_id, collection_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_members_user_id_role ON collection_members(user_id, role);
```

### **Part 2: Tables**
```sql
-- Create new tables
CREATE TABLE IF NOT EXISTS user_activity_summary (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_collections_created INTEGER DEFAULT 0,
  total_collections_joined INTEGER DEFAULT 0,
  total_votes_cast INTEGER DEFAULT 0,
  total_discussions_started INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_stats_cache (
  collection_id UUID PRIMARY KEY REFERENCES collections(id) ON DELETE CASCADE,
  total_members INTEGER DEFAULT 0,
  total_restaurants INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_dislikes INTEGER DEFAULT 0,
  total_discussions INTEGER DEFAULT 0,
  participation_rate DECIMAL(5,2) DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type, window_start)
);
```

### **Part 3: Functions**
```sql
-- Drop existing functions first
DROP FUNCTION IF EXISTS get_user_collections_paginated(UUID, INTEGER, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS update_user_activity_summary(UUID);
DROP FUNCTION IF EXISTS update_collection_stats_cache(UUID);
DROP FUNCTION IF EXISTS trigger_update_collection_stats();
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS archive_old_data(INTEGER);

-- Then create new functions (copy from database-schema-scalability.sql)
```

## 🔍 **Verification Steps**

After applying the schema, verify it worked:

### **1. Check Tables Exist**
```sql
\dt user_activity_summary
\dt collection_stats_cache
\dt rate_limits
```

### **2. Check Functions Exist**
```sql
\df get_user_collections_paginated
\df check_rate_limit
\df archive_old_data
```

### **3. Test Functions**
```sql
-- Test rate limiting
SELECT check_rate_limit('11111111-1111-1111-1111-111111111111', 'test', 5, 60);

-- Test pagination
SELECT * FROM get_user_collections_paginated('11111111-1111-1111-1111-111111111111', 5, 0, true);
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Function Already Exists**
```sql
-- Solution: Drop and recreate
DROP FUNCTION IF EXISTS function_name(parameter_types);
CREATE OR REPLACE FUNCTION function_name(...);
```

### **Issue 2: Table Already Exists**
```sql
-- Solution: Use IF NOT EXISTS (already in schema)
CREATE TABLE IF NOT EXISTS table_name (...);
```

### **Issue 3: Permission Denied**
```sql
-- Solution: Check your database permissions
-- Make sure you have CREATE, DROP, and EXECUTE permissions
```

### **Issue 4: RLS Policies Blocking**
```sql
-- Solution: Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Test your functions
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## 📞 **Getting Help**

If you're still having issues:

1. **Check the error message carefully** - it usually tells you exactly what's wrong
2. **Verify your database connection** - make sure you're connected to the right database
3. **Check permissions** - ensure your user has the necessary privileges
4. **Run the test script** - use `node test-scalability-functions.js` to verify everything works

## 🎯 **Success Indicators**

You'll know the schema was applied successfully when:

- ✅ All tables exist: `user_activity_summary`, `collection_stats_cache`, `rate_limits`
- ✅ All functions work: `check_rate_limit`, `archive_old_data`, `get_user_collections_paginated`
- ✅ Test script passes: `node test-scalability-functions.js` shows all green checkmarks
- ✅ No more PostgreSQL errors when running the schema

---

**Remember**: Always backup your database before applying schema changes!
