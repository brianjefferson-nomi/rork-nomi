# Supabase Setup Guide for Restaurant App

This guide will walk you through setting up your Supabase database step by step.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `rork-nomi` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://qlnllnqrdxjiigmzyhlu.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Update Your Environment Variables

1. In your project root, create or update `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values in `services/supabase.ts` with your actual credentials:
```typescript
const supabaseUrl = 'your_project_url_here';
const supabaseKey = 'your_anon_key_here';
```

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

**Expected Output**: You should see success messages for:
- Extensions created
- Custom types created
- Tables created
- Indexes created
- Triggers created
- RLS policies created
- Functions created

## Step 5: Verify the Setup

Run these verification queries in the SQL Editor:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables**:
- api_calls
- collection_members
- collection_restaurants
- collections
- plan_invitations
- restaurant_discussions
- restaurant_rankings
- restaurant_votes
- restaurants
- user_activities
- user_relationships
- user_reviews
- users

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Indexes
```sql
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';
```

## Step 6: Test the Database

### Insert Sample Data

```sql
-- Insert a test user
INSERT INTO users (email, name, avatar_url) 
VALUES ('test@example.com', 'Test User', 'https://via.placeholder.com/150');

-- Insert a test restaurant
INSERT INTO restaurants (name, cuisine, price_range, image_url, address, neighborhood) 
VALUES ('Pizza Palace', 'Italian', '$$', 'https://via.placeholder.com/300x200', '123 Main St', 'Downtown');

-- Insert a test collection
INSERT INTO collections (name, description, created_by, is_public) 
VALUES ('Weekend Brunch', 'Best brunch spots in the city', (SELECT id FROM users LIMIT 1), true);
```

### Test Queries

```sql
-- Check if data was inserted
SELECT * FROM users;
SELECT * FROM restaurants;
SELECT * FROM collections;
```

## Step 7: Configure Authentication (Optional)

If you want to use Supabase Auth:

1. Go to **Authentication** → **Settings**
2. Configure your auth providers (Google, GitHub, etc.)
3. Set up email templates
4. Configure redirect URLs for your app

## Step 8: Test Your App

1. Start your development server:
```bash
npm start
# or
expo start
```

2. Test basic functionality:
   - User registration/login
   - Creating collections
   - Adding restaurants
   - Voting on restaurants

## Troubleshooting

### Common Issues

**1. "relation does not exist" error**
- Make sure you ran the entire schema file
- Check that all tables were created successfully

**2. RLS Policy errors**
- Ensure you're authenticated when accessing protected tables
- Check that your user has the correct permissions

**3. Foreign key constraint errors**
- Make sure referenced records exist before creating relationships
- Check the order of data insertion

**4. Connection errors**
- Verify your Supabase URL and key are correct
- Check your internet connection
- Ensure your Supabase project is active

### Useful Debug Queries

```sql
-- Check current user
SELECT auth.uid();

-- Check table structure
\d+ table_name

-- Check for errors
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Reset Database (if needed)

If you need to start over:

```sql
-- Drop all tables (BE CAREFUL - this deletes all data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run the schema file again
```

## Next Steps

Once your database is set up:

1. **Test all features** in your app
2. **Set up monitoring** in Supabase dashboard
3. **Configure backups** (automatic in Supabase)
4. **Set up logging** for production debugging
5. **Optimize queries** based on usage patterns

## Production Considerations

1. **Environment Variables**: Use different keys for development/production
2. **Rate Limiting**: Consider implementing rate limiting
3. **Monitoring**: Set up alerts for database performance
4. **Backups**: Verify backup schedules
5. **Security**: Regularly review RLS policies

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase Discord](https://discord.supabase.com)
3. Check the [GitHub issues](https://github.com/supabase/supabase/issues)

Your database should now be ready to use with your restaurant app! 🎉
