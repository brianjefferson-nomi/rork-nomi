const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function implementProperRLS() {
  console.log('🔧 Implementing proper RLS policies for collections access...\n');

  try {
    // Step 1: Test current access (after RLS is disabled)
    console.log('📋 Step 1: Testing current access...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (collectionsError) {
      console.log('❌ Collections access failed:', collectionsError.message);
      console.log('   Please disable RLS first in the Supabase dashboard');
      return;
    }

    console.log(`✅ Found ${collections.length} collections`);
    
    if (collections.length === 0) {
      console.log('   No collections found. Creating a test collection...');
      
      const testCollection = {
        name: 'Test Collection for RLS',
        description: 'Testing proper RLS implementation',
        created_by: '11111111-1111-1111-1111-111111111111',
        collection_code: `test_rls_${Date.now()}`,
        is_public: true
      };

      const { data: createdCollection, error: createError } = await supabase
        .from('collections')
        .insert(testCollection)
        .select()
        .single();

      if (createError) {
        console.log('❌ Test collection creation failed:', createError.message);
        return;
      }

      console.log('✅ Test collection created:', createdCollection.name);
    }

    // Step 2: Test collection members access
    console.log('\n📋 Step 2: Testing collection members access...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .order('joined_at', { ascending: false });

    if (membersError) {
      console.log('❌ Collection members access failed:', membersError.message);
    } else {
      console.log(`✅ Found ${members.length} collection memberships`);
    }

    console.log('\n🎉 Access test successful!');
    console.log('\n📝 Now implementing proper RLS policies...');
    console.log('\n🔧 PROPER RLS IMPLEMENTATION GUIDE:');
    console.log('\n1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/qlnllnqrdxjiigmzyhlu');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. For each table (collections, collection_members, restaurant_votes), follow these steps:');
    
    console.log('\n📋 COLLECTIONS TABLE POLICIES:');
    console.log('\n   SELECT Policy (Read Access):');
    console.log('   - Policy name: collections_select_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression:');
    console.log('     is_public = true OR auth.uid() = created_by OR EXISTS (');
    console.log('       SELECT 1 FROM collection_members cm');
    console.log('       WHERE cm.collection_id = collections.id AND cm.user_id = auth.uid()');
    console.log('     )');
    
    console.log('\n   INSERT Policy (Create Access):');
    console.log('   - Policy name: collections_insert_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = created_by');
    
    console.log('\n   UPDATE Policy (Edit Access):');
    console.log('   - Policy name: collections_update_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = created_by');
    
    console.log('\n   DELETE Policy (Delete Access):');
    console.log('   - Policy name: collections_delete_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = created_by');
    
    console.log('\n📋 COLLECTION_MEMBERS TABLE POLICIES:');
    console.log('\n   SELECT Policy (Read Access):');
    console.log('   - Policy name: collection_members_select_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression:');
    console.log('     auth.uid() = user_id OR EXISTS (');
    console.log('       SELECT 1 FROM collections c');
    console.log('       WHERE c.id = collection_members.collection_id AND c.created_by = auth.uid()');
    console.log('     )');
    
    console.log('\n   INSERT Policy (Add Members):');
    console.log('   - Policy name: collection_members_insert_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression:');
    console.log('     EXISTS (');
    console.log('       SELECT 1 FROM collections c');
    console.log('       WHERE c.id = collection_members.collection_id AND c.created_by = auth.uid()');
    console.log('     )');
    
    console.log('\n   UPDATE Policy (Edit Members):');
    console.log('   - Policy name: collection_members_update_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = user_id');
    
    console.log('\n   DELETE Policy (Remove Members):');
    console.log('   - Policy name: collection_members_delete_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression:');
    console.log('     auth.uid() = user_id OR EXISTS (');
    console.log('       SELECT 1 FROM collections c');
    console.log('       WHERE c.id = collection_members.collection_id AND c.created_by = auth.uid()');
    console.log('     )');
    
    console.log('\n📋 RESTAURANT_VOTES TABLE POLICIES:');
    console.log('\n   SELECT Policy (Read Access):');
    console.log('   - Policy name: restaurant_votes_select_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression:');
    console.log('     collection_id IS NULL OR auth.uid() = user_id OR EXISTS (');
    console.log('       SELECT 1 FROM collections c');
    console.log('       WHERE c.id = restaurant_votes.collection_id AND (');
    console.log('         c.is_public = true OR c.created_by = auth.uid() OR EXISTS (');
    console.log('           SELECT 1 FROM collection_members cm');
    console.log('           WHERE cm.collection_id = c.id AND cm.user_id = auth.uid()');
    console.log('         )');
    console.log('       )');
    console.log('     )');
    
    console.log('\n   INSERT Policy (Create Votes):');
    console.log('   - Policy name: restaurant_votes_insert_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = user_id');
    
    console.log('\n   UPDATE Policy (Edit Votes):');
    console.log('   - Policy name: restaurant_votes_update_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = user_id');
    
    console.log('\n   DELETE Policy (Delete Votes):');
    console.log('   - Policy name: restaurant_votes_delete_proper');
    console.log('   - Target roles: authenticated');
    console.log('   - Using expression: auth.uid() = user_id');
    
    console.log('\n🎯 IMPLEMENTATION STEPS:');
    console.log('1. First, disable RLS on all three tables (collections, collection_members, restaurant_votes)');
    console.log('2. Delete all existing policies');
    console.log('3. Create the new policies as shown above');
    console.log('4. Re-enable RLS on all tables');
    console.log('5. Test that you can access collections you\'re a member of');
    
    console.log('\n📝 SECURITY NOTES:');
    console.log('- Users can only see collections they created, are members of, or are public');
    console.log('- Users can only edit/delete collections they created');
    console.log('- Users can only see votes in collections they have access to');
    console.log('- Collection creators can manage members of their collections');
    console.log('- Users can only manage their own votes');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the implementation guide
implementProperRLS().then(() => {
  console.log('\n🏁 Proper RLS implementation guide complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Implementation guide failed:', error);
  process.exit(1);
});
