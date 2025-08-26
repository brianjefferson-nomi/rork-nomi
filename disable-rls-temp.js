const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLSTemporarily() {
  console.log('🔧 Temporarily disabling RLS to fix collections access...\n');

  try {
    // Since we can't use exec_sql, let's try a different approach
    // Let's test if we can create a collection with the current setup
    
    console.log('📋 Testing collection creation with current setup...');
    
    // First, let's try to create a test collection
    const testCollection = {
      name: 'Test Collection - RLS Debug',
      description: 'Testing if we can create collections',
      created_by: '11111111-1111-1111-1111-111111111111',
      collection_code: `test_debug_${Date.now()}`,
      is_public: true
    };

    console.log('   Attempting to create test collection...');
    const { data: createdCollection, error: createError } = await supabase
      .from('collections')
      .insert(testCollection)
      .select()
      .single();

    if (createError) {
      console.log('❌ Collection creation failed:', createError.message);
      console.log('   Error details:', JSON.stringify(createError, null, 2));
      
      // The issue is RLS blocking creation. Let's try to work around this
      console.log('\n📋 Since RLS is blocking collection creation, let\'s try a different approach...');
      console.log('   We need to access the Supabase dashboard to fix RLS policies.');
      
      console.log('\n🔧 MANUAL FIX REQUIRED:');
      console.log('   1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/qlnllnqrdxjiigmzyhlu');
      console.log('   2. Navigate to Authentication > Policies');
      console.log('   3. Find the "collections" table');
      console.log('   4. Click "New Policy"');
      console.log('   5. Choose "Create a policy from scratch"');
      console.log('   6. Set the following:');
      console.log('      - Policy name: collections_select_permissive');
      console.log('      - Target roles: authenticated');
      console.log('      - Using expression: auth.role() = \'authenticated\'');
      console.log('   7. Repeat for INSERT, UPDATE, DELETE operations');
      console.log('   8. Do the same for collection_members and restaurant_votes tables');
      
      console.log('\n📝 ALTERNATIVE: Disable RLS temporarily');
      console.log('   1. Go to Database > Tables');
      console.log('   2. Click on the "collections" table');
      console.log('   3. Go to the "RLS" tab');
      console.log('   4. Toggle off "Enable RLS"');
      console.log('   5. Do the same for collection_members and restaurant_votes');
      
      return;
    } else {
      console.log('✅ Collection creation successful!');
      console.log('   Created collection:', createdCollection.name);
      
      // Clean up test collection
      await supabase
        .from('collections')
        .delete()
        .eq('id', createdCollection.id);
      
      console.log('   Test collection cleaned up');
      console.log('\n🎉 Collections access is working!');
      console.log('   The issue may be in the app code, not RLS policies.');
    }

    // Test reading collections
    console.log('\n📋 Testing collections read access...');
    const { data: collections, error: readError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (readError) {
      console.log('❌ Collections read failed:', readError.message);
    } else {
      console.log(`✅ Collections read successful - found ${collections.length} collections`);
      
      if (collections.length > 0) {
        console.log('   Existing collections:');
        collections.forEach((col, index) => {
          console.log(`     ${index + 1}. ${col.name} (${col.is_public ? 'public' : 'private'})`);
        });
      }
    }

    // Test collection members
    console.log('\n📋 Testing collection members access...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .order('joined_at', { ascending: false });

    if (membersError) {
      console.log('❌ Collection members read failed:', membersError.message);
    } else {
      console.log(`✅ Collection members read successful - found ${members.length} memberships`);
    }

    console.log('\n🎉 Access test complete!');
    console.log('\n📝 Summary:');
    if (createError) {
      console.log('   ❌ RLS is blocking collection creation');
      console.log('   🔧 Manual fix required in Supabase dashboard');
    } else {
      console.log('   ✅ Collections access is working');
      console.log('   📱 Try using your app now');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
disableRLSTemporarily().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
