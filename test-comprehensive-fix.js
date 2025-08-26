const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testComprehensiveFix() {
  console.log('🔧 Testing comprehensive RLS fix...\n');

  try {
    // Test 1: Collections access
    console.log('📋 Test 1: Collections access...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (collectionsError) {
      console.log('❌ Collections access failed:', collectionsError.message);
    } else {
      console.log(`✅ Collections access successful - found ${collections.length} collections`);
      if (collections.length > 0) {
        console.log('   Sample collections:');
        collections.slice(0, 3).forEach((col, index) => {
          console.log(`     ${index + 1}. ${col.name} (${col.is_public ? 'public' : 'private'})`);
        });
      }
    }

    // Test 2: Collection members access
    console.log('\n📋 Test 2: Collection members access...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .order('joined_at', { ascending: false })
      .limit(5);

    if (membersError) {
      console.log('❌ Collection members access failed:', membersError.message);
    } else {
      console.log(`✅ Collection members access successful - found ${members.length} memberships`);
    }

    // Test 3: Restaurant votes access
    console.log('\n📋 Test 3: Restaurant votes access...');
    const { data: votes, error: votesError } = await supabase
      .from('restaurant_votes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (votesError) {
      console.log('❌ Restaurant votes access failed:', votesError.message);
    } else {
      console.log(`✅ Restaurant votes access successful - found ${votes.length} votes`);
    }

    // Test 4: Restaurant discussions access
    console.log('\n📋 Test 4: Restaurant discussions access...');
    const { data: discussions, error: discussionsError } = await supabase
      .from('restaurant_discussions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (discussionsError) {
      console.log('❌ Restaurant discussions access failed:', discussionsError.message);
    } else {
      console.log(`✅ Restaurant discussions access successful - found ${discussions.length} discussions`);
    }

    // Test 5: Users access
    console.log('\n📋 Test 5: Users access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.log('❌ Users access failed:', usersError.message);
    } else {
      console.log(`✅ Users access successful - found ${users.length} users`);
    }

    // Test 6: Collection creation (if we have collections)
    console.log('\n📋 Test 6: Collection creation test...');
    if (collections && collections.length > 0) {
      const testCollection = {
        name: 'Test Collection - RLS Fix',
        description: 'Testing collection creation after RLS fix',
        created_by: '11111111-1111-1111-1111-111111111111',
        collection_code: `test_rls_fix_${Date.now()}`,
        is_public: true
      };

      const { data: createdCollection, error: createError } = await supabase
        .from('collections')
        .insert(testCollection)
        .select()
        .single();

      if (createError) {
        console.log('❌ Collection creation failed:', createError.message);
      } else {
        console.log('✅ Collection creation successful:', createdCollection.name);
        
        // Clean up test collection
        await supabase
          .from('collections')
          .delete()
          .eq('id', createdCollection.id);
        
        console.log('   Test collection cleaned up');
      }
    }

    // Test 7: Complex queries (joins)
    console.log('\n📋 Test 7: Complex queries with joins...');
    if (collections && collections.length > 0) {
      const collectionId = collections[0].id;
      
      // Test collection members with user details
      const { data: membersWithUsers, error: membersWithUsersError } = await supabase
        .from('collection_members')
        .select('*, users(id, name, avatar_url)')
        .eq('collection_id', collectionId)
        .limit(5);

      if (membersWithUsersError) {
        console.log('❌ Collection members with users query failed:', membersWithUsersError.message);
      } else {
        console.log(`✅ Collection members with users query successful - found ${membersWithUsers.length} members`);
      }

      // Test restaurant votes with user details
      const { data: votesWithUsers, error: votesWithUsersError } = await supabase
        .from('restaurant_votes')
        .select('*, users(id, name, avatar_url)')
        .eq('collection_id', collectionId)
        .limit(5);

      if (votesWithUsersError) {
        console.log('❌ Restaurant votes with users query failed:', votesWithUsersError.message);
      } else {
        console.log(`✅ Restaurant votes with users query successful - found ${votesWithUsers.length} votes`);
      }
    }

    console.log('\n🎉 Comprehensive RLS fix test complete!');
    console.log('\n📝 Summary:');
    console.log('   - If all tests passed, the RLS fix is working correctly');
    console.log('   - If any tests failed, the RLS policies need adjustment');
    console.log('   - The app should now be able to access all collections and related data');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testComprehensiveFix().then(() => {
  console.log('\n🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
