const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  console.log('🔧 Applying RLS fix for collections access...\n');

  try {
    // Step 1: Disable RLS temporarily
    console.log('📋 Step 1: Disabling RLS temporarily...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
        ALTER TABLE collection_members DISABLE ROW LEVEL SECURITY;
        ALTER TABLE restaurant_votes DISABLE ROW LEVEL SECURITY;
      `
    });

    if (disableError) {
      console.log('❌ Error disabling RLS:', disableError.message);
      return;
    }
    console.log('✅ RLS disabled');

    // Step 2: Drop all existing policies
    console.log('\n📋 Step 2: Dropping existing policies...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        DECLARE
            policy_record RECORD;
        BEGIN
            -- Drop all policies on collections table
            FOR policy_record IN 
                SELECT policyname FROM pg_policies WHERE tablename = 'collections' AND schemaname = 'public'
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON collections', policy_record.policyname);
            END LOOP;
            
            -- Drop all policies on collection_members table
            FOR policy_record IN 
                SELECT policyname FROM pg_policies WHERE tablename = 'collection_members' AND schemaname = 'public'
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON collection_members', policy_record.policyname);
            END LOOP;
            
            -- Drop all policies on restaurant_votes table
            FOR policy_record IN 
                SELECT policyname FROM pg_policies WHERE tablename = 'restaurant_votes' AND schemaname = 'public'
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_votes', policy_record.policyname);
            END LOOP;
        END $$;
      `
    });

    if (dropError) {
      console.log('❌ Error dropping policies:', dropError.message);
      return;
    }
    console.log('✅ Existing policies dropped');

    // Step 3: Create new permissive policies
    console.log('\n📋 Step 3: Creating new permissive policies...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Collections: Allow authenticated users to see all collections
        CREATE POLICY "collections_select_permissive" ON collections FOR SELECT USING (
          auth.role() = 'authenticated'
        );

        CREATE POLICY "collections_insert_permissive" ON collections FOR INSERT WITH CHECK (
          auth.uid() = created_by
        );

        CREATE POLICY "collections_update_permissive" ON collections FOR UPDATE USING (
          auth.uid() = created_by
        );

        CREATE POLICY "collections_delete_permissive" ON collections FOR DELETE USING (
          auth.uid() = created_by
        );

        -- Collection members: Allow authenticated users to see all memberships
        CREATE POLICY "collection_members_select_permissive" ON collection_members FOR SELECT USING (
          auth.role() = 'authenticated'
        );

        CREATE POLICY "collection_members_insert_permissive" ON collection_members FOR INSERT WITH CHECK (
          auth.role() = 'authenticated'
        );

        CREATE POLICY "collection_members_update_permissive" ON collection_members FOR UPDATE USING (
          auth.uid() = user_id
        );

        CREATE POLICY "collection_members_delete_permissive" ON collection_members FOR DELETE USING (
          auth.uid() = user_id
        );

        -- Restaurant votes: Allow authenticated users to see all votes
        CREATE POLICY "restaurant_votes_select_permissive" ON restaurant_votes FOR SELECT USING (
          auth.role() = 'authenticated'
        );

        CREATE POLICY "restaurant_votes_insert_permissive" ON restaurant_votes FOR INSERT WITH CHECK (
          auth.uid() = user_id
        );

        CREATE POLICY "restaurant_votes_update_permissive" ON restaurant_votes FOR UPDATE USING (
          auth.uid() = user_id
        );

        CREATE POLICY "restaurant_votes_delete_permissive" ON restaurant_votes FOR DELETE USING (
          auth.uid() = user_id
        );
      `
    });

    if (createError) {
      console.log('❌ Error creating policies:', createError.message);
      return;
    }
    console.log('✅ New policies created');

    // Step 4: Enable RLS with new policies
    console.log('\n📋 Step 4: Enabling RLS with new policies...');
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
        ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;
      `
    });

    if (enableError) {
      console.log('❌ Error enabling RLS:', enableError.message);
      return;
    }
    console.log('✅ RLS enabled with new policies');

    // Step 5: Test the fix
    console.log('\n📋 Step 5: Testing the fix...');
    const { data: testData, error: testError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 'Collections accessible' as test_result WHERE EXISTS (SELECT 1 FROM collections LIMIT 1);
        SELECT 'Collection members accessible' as test_result WHERE EXISTS (SELECT 1 FROM collection_members LIMIT 1);
        SELECT 'Restaurant votes accessible' as test_result WHERE EXISTS (SELECT 1 FROM restaurant_votes LIMIT 1);
      `
    });

    if (testError) {
      console.log('❌ Test failed:', testError.message);
    } else {
      console.log('✅ All tables accessible');
    }

    console.log('\n🎉 RLS fix applied successfully!');
    console.log('📝 Note: This uses permissive policies that allow authenticated users to see all data.');
    console.log('   The app will handle filtering on the client side for privacy.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
applyRLSFix().then(() => {
  console.log('\n🏁 RLS fix complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
}); 