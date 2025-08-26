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

async function fixRLS() {
  console.log('🔧 Fixing RLS policies for collections access...\n');

  try {
    // Step 1: Test current access
    console.log('📋 Step 1: Testing current access...');
    const { data: testCollections, error: testError } = await supabase
      .from('collections')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Current access test failed:', testError.message);
    } else {
      console.log('✅ Current access test passed');
    }

    // Step 2: Try to create a test collection to see if RLS is blocking creation
    console.log('\n📋 Step 2: Testing collection creation...');
    const testCollection = {
      name: 'Test Collection for RLS Fix',
      description: 'Testing RLS policies',
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
      console.log('❌ Collection creation failed:', createError.message);
      console.log('   This suggests RLS is blocking operations');
    } else {
      console.log('✅ Collection creation successful');
      
      // Clean up test collection
      await supabase
        .from('collections')
        .delete()
        .eq('id', createdCollection.id);
    }

    // Step 3: Check if we can access collection_members
    console.log('\n📋 Step 3: Testing collection_members access...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .limit(1);

    if (membersError) {
      console.log('❌ Collection members access failed:', membersError.message);
    } else {
      console.log('✅ Collection members access successful');
    }

    // Step 4: Try a simple query to get all collections (this should work if RLS is permissive)
    console.log('\n📋 Step 4: Testing comprehensive collections query...');
    const { data: allCollections, error: allError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.log('❌ All collections query failed:', allError.message);
    } else {
      console.log('✅ All collections query successful');
      console.log(`   Found ${allCollections.length} collections`);
      
      if (allCollections.length > 0) {
        console.log('   Sample collections:');
        allCollections.slice(0, 3).forEach((col, index) => {
          console.log(`     ${index + 1}. ${col.name} (${col.is_public ? 'public' : 'private'})`);
        });
      }
    }

    // Step 5: Test the specific issue - collections you're a member of
    console.log('\n📋 Step 5: Testing member collections access...');
    
    // First, let's see what collections exist
    const { data: existingCollections, error: existingError } = await supabase
      .from('collections')
      .select('id, name, is_public, created_by');

    if (existingError) {
      console.log('❌ Error getting existing collections:', existingError.message);
    } else {
      console.log(`✅ Found ${existingCollections.length} existing collections`);
      
      // Check collection members
      const { data: allMembers, error: membersError } = await supabase
        .from('collection_members')
        .select('collection_id, user_id, role');

      if (membersError) {
        console.log('❌ Error getting collection members:', membersError.message);
      } else {
        console.log(`✅ Found ${allMembers.length} collection memberships`);
        
        // Show some sample memberships
        if (allMembers.length > 0) {
          console.log('   Sample memberships:');
          allMembers.slice(0, 5).forEach((member, index) => {
            const collection = existingCollections.find(c => c.id === member.collection_id);
            console.log(`     ${index + 1}. User ${member.user_id} is ${member.role} of "${collection?.name || 'Unknown'}"`);
          });
        }
      }
    }

    console.log('\n🎉 RLS diagnostic complete!');
    console.log('\n📝 Summary:');
    console.log('   - If you can see collections but not access them in the app,');
    console.log('     the issue is likely in the app code, not RLS policies.');
    console.log('   - If you cannot see collections at all, RLS policies need fixing.');
    console.log('   - The app should handle filtering collections based on user access.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixRLS().then(() => {
  console.log('\n🏁 RLS diagnostic complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
