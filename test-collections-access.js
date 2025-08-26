const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCollectionsAccess() {
  console.log('🔍 Testing Collections Access...\n');

  try {
    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return;
    }
    console.log('✅ Authenticated as:', user.email);
    console.log('   User ID:', user.id);

    // Test 2: Check if collections table exists and is accessible
    console.log('\n📊 Testing collections table access...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(5);

    if (collectionsError) {
      console.log('❌ Collections table error:', collectionsError.message);
    } else {
      console.log('✅ Collections table accessible');
      console.log('   Found', collections.length, 'collections');
      if (collections.length > 0) {
        console.log('   Sample collection:', collections[0].name);
      }
    }

    // Test 3: Check collections you created
    console.log('\n👤 Testing collections you created...');
    const { data: myCollections, error: myCollectionsError } = await supabase
      .from('collections')
      .select('*')
      .eq('created_by', user.id);

    if (myCollectionsError) {
      console.log('❌ My collections error:', myCollectionsError.message);
    } else {
      console.log('✅ My collections accessible');
      console.log('   You created', myCollections.length, 'collections');
      myCollections.forEach(col => {
        console.log(`   - ${col.name} (${col.is_public ? 'public' : 'private'})`);
      });
    }

    // Test 4: Check collections you're a member of
    console.log('\n👥 Testing collections you\'re a member of...');
    const { data: memberCollections, error: memberError } = await supabase
      .from('collection_members')
      .select(`
        collection_id,
        collections (
          id,
          name,
          is_public,
          created_by
        )
      `)
      .eq('user_id', user.id);

    if (memberError) {
      console.log('❌ Member collections error:', memberError.message);
    } else {
      console.log('✅ Member collections accessible');
      console.log('   You\'re a member of', memberCollections.length, 'collections');
      memberCollections.forEach(member => {
        const col = member.collections;
        if (col) {
          console.log(`   - ${col.name} (created by: ${col.created_by === user.id ? 'you' : 'other'})`);
        }
      });
    }

    // Test 5: Check all collections you should have access to
    console.log('\n🔐 Testing all accessible collections...');
    const { data: accessibleCollections, error: accessibleError } = await supabase
      .from('collections')
      .select('*')
      .or(`is_public.eq.true,created_by.eq.${user.id}`);

    if (accessibleError) {
      console.log('❌ Accessible collections error:', accessibleError.message);
    } else {
      console.log('✅ Accessible collections query successful');
      console.log('   You have access to', accessibleCollections.length, 'collections');
    }

    // Test 6: Check RLS policies
    console.log('\n🛡️ Testing RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename IN ('collections', 'collection_members')
          ORDER BY tablename, policyname;
        `
      });

    if (rlsError) {
      console.log('❌ RLS policy check failed:', rlsError.message);
    } else {
      console.log('✅ RLS policies found:');
      rlsTest.forEach(policy => {
        console.log(`   ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
    }

    // Test 7: Check if RLS is enabled
    console.log('\n🔒 Checking RLS status...');
    const { data: rlsStatus, error: rlsStatusError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename IN ('collections', 'collection_members')
          AND schemaname = 'public';
        `
      });

    if (rlsStatusError) {
      console.log('❌ RLS status check failed:', rlsStatusError.message);
    } else {
      console.log('✅ RLS status:');
      rlsStatus.forEach(table => {
        console.log(`   ${table.tablename}: RLS ${table.rowsecurity ? 'enabled' : 'disabled'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testCollectionsAccess().then(() => {
  console.log('\n🏁 Diagnostic complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 