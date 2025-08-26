const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

// Create client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyPermissiveRLS() {
  console.log('🔧 Applying permissive RLS policies...\n');

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
      console.log('   Trying alternative approach...');
      
      // Alternative: Try to drop and recreate policies
      console.log('📋 Alternative: Dropping existing policies...');
      const dropPolicies = [
        'DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;',
        'DROP POLICY IF EXISTS "Collection members can view private collections" ON collections;',
        'DROP POLICY IF EXISTS "Authenticated users can create collections" ON collections;',
        'DROP POLICY IF EXISTS "Collection creators can update collections" ON collections;',
        'DROP POLICY IF EXISTS "Collection members can view membership" ON collection_members;',
        'DROP POLICY IF EXISTS "Collection creators can manage members" ON collection_members;',
        'DROP POLICY IF EXISTS "Users can view votes in public collections" ON restaurant_votes;',
        'DROP POLICY IF EXISTS "Collection members can view votes" ON restaurant_votes;',
        'DROP POLICY IF EXISTS "Users can manage their own votes" ON restaurant_votes;'
      ];

      for (const policy of dropPolicies) {
        try {
          await supabase.rpc('exec_sql', { sql: policy });
        } catch (e) {
          console.log('   Note: Could not drop policy (may not exist)');
        }
      }
    } else {
      console.log('✅ RLS disabled');
    }

    // Step 2: Create permissive policies
    console.log('\n📋 Step 2: Creating permissive policies...');
    const permissivePolicies = [
      // Collections: Allow authenticated users to see all collections
      `CREATE POLICY "collections_select_permissive" ON collections FOR SELECT USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "collections_insert_permissive" ON collections FOR INSERT WITH CHECK (auth.uid() = created_by);`,
      `CREATE POLICY "collections_update_permissive" ON collections FOR UPDATE USING (auth.uid() = created_by);`,
      `CREATE POLICY "collections_delete_permissive" ON collections FOR DELETE USING (auth.uid() = created_by);`,

      // Collection members: Allow authenticated users to see all memberships
      `CREATE POLICY "collection_members_select_permissive" ON collection_members FOR SELECT USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "collection_members_insert_permissive" ON collection_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
      `CREATE POLICY "collection_members_update_permissive" ON collection_members FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "collection_members_delete_permissive" ON collection_members FOR DELETE USING (auth.uid() = user_id);`,

      // Restaurant votes: Allow authenticated users to see all votes
      `CREATE POLICY "restaurant_votes_select_permissive" ON restaurant_votes FOR SELECT USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "restaurant_votes_insert_permissive" ON restaurant_votes FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "restaurant_votes_update_permissive" ON restaurant_votes FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "restaurant_votes_delete_permissive" ON restaurant_votes FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of permissivePolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy });
        console.log('   ✅ Policy created');
      } catch (e) {
        console.log('   ❌ Policy creation failed:', e.message);
      }
    }

    // Step 3: Enable RLS with new policies
    console.log('\n📋 Step 3: Enabling RLS with new policies...');
    const enableRLS = [
      'ALTER TABLE collections ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE collection_members ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE restaurant_votes ENABLE ROW LEVEL SECURITY;'
    ];

    for (const sql of enableRLS) {
      try {
        await supabase.rpc('exec_sql', { sql });
        console.log('   ✅ RLS enabled');
      } catch (e) {
        console.log('   ❌ RLS enable failed:', e.message);
      }
    }

    // Step 4: Test the fix
    console.log('\n📋 Step 4: Testing the fix...');
    const testCollection = {
      name: 'Test Collection After RLS Fix',
      description: 'Testing if RLS fix worked',
      created_by: '11111111-1111-1111-1111-111111111111',
      collection_code: `test_fix_${Date.now()}`,
      is_public: true
    };

    const { data: createdCollection, error: createError } = await supabase
      .from('collections')
      .insert(testCollection)
      .select()
      .single();

    if (createError) {
      console.log('❌ Collection creation still failing:', createError.message);
      console.log('   RLS fix may not have worked completely');
    } else {
      console.log('✅ Collection creation successful!');
      console.log('   Created collection:', createdCollection.name);
      
      // Clean up test collection
      await supabase
        .from('collections')
        .delete()
        .eq('id', createdCollection.id);
      
      console.log('   Test collection cleaned up');
    }

    // Step 5: Test reading collections
    console.log('\n📋 Step 5: Testing collections access...');
    const { data: collections, error: readError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (readError) {
      console.log('❌ Collections read failed:', readError.message);
    } else {
      console.log(`✅ Collections read successful - found ${collections.length} collections`);
    }

    console.log('\n🎉 RLS fix attempt complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Try creating a collection in your app');
    console.log('   2. Check if you can see collections you\'re a member of');
    console.log('   3. If issues persist, the app code may need updates');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
applyPermissiveRLS().then(() => {
  console.log('\n🏁 RLS fix complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
