// =====================================================
// DIAGNOSE GETUSERPLANS ERROR
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseGetUserPlansError() {
  console.log('🔍 Diagnosing getUserPlans error...\n');

  try {
    // Step 1: Check if users exist
    console.log('1. Checking users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} users`);
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const testUserId = users[0].id;
    console.log(`🎯 Using test user: ${testUserId} (${users[0].name})`);

    // Step 2: Check collections table
    console.log('\n2. Checking collections table...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(5);

    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
    } else {
      console.log(`✅ Found ${collections?.length || 0} collections`);
    }

    // Step 3: Check collection_members table
    console.log('\n3. Checking collection_members table...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .limit(5);

    if (membersError) {
      console.error('❌ Error fetching collection members:', membersError);
    } else {
      console.log(`✅ Found ${members?.length || 0} collection members`);
    }

    // Step 4: Test the specific getUserPlans logic
    console.log('\n4. Testing getUserPlans logic...');
    
    // Test created collections
    console.log('   a) Testing created collections...');
    const { data: createdCollections, error: createdError } = await supabase
      .from('collections')
      .select('*')
      .eq('created_by', testUserId);

    if (createdError) {
      console.error('   ❌ Error fetching created collections:', createdError);
    } else {
      console.log(`   ✅ User created ${createdCollections?.length || 0} collections`);
    }

    // Test member collections
    console.log('   b) Testing member collections...');
    const { data: memberCollections, error: memberError } = await supabase
      .from('collection_members')
      .select('collection_id')
      .eq('user_id', testUserId);

    if (memberError) {
      console.error('   ❌ Error fetching member collections:', memberError);
    } else {
      console.log(`   ✅ User is member of ${memberCollections?.length || 0} collections`);
    }

    // Test member collection data fetch
    if (memberCollections && memberCollections.length > 0) {
      console.log('   c) Testing member collection data fetch...');
      const collectionIds = memberCollections.map(m => m.collection_id);
      console.log(`   📋 Collection IDs: ${collectionIds.join(', ')}`);
      
      const { data: memberData, error: memberDataError } = await supabase
        .from('collections')
        .select('*')
        .in('id', collectionIds);

      if (memberDataError) {
        console.error('   ❌ Error fetching member collection data:', memberDataError);
        console.error('   ❌ Error details:', {
          message: memberDataError.message,
          details: memberDataError.details,
          hint: memberDataError.hint,
          code: memberDataError.code
        });
      } else {
        console.log(`   ✅ Found ${memberData?.length || 0} member collection data`);
      }
    }

    // Test public collections
    console.log('   d) Testing public collections...');
    const { data: publicCollections, error: publicError } = await supabase
      .from('collections')
      .select('*')
      .eq('is_public', true);

    if (publicError) {
      console.error('   ❌ Error fetching public collections:', publicError);
    } else {
      console.log(`   ✅ Found ${publicCollections?.length || 0} public collections`);
    }

    // Step 5: Test getCollectionMembers function
    console.log('\n5. Testing getCollectionMembers function...');
    if (collections && collections.length > 0) {
      const testCollectionId = collections[0].id;
      console.log(`   🎯 Testing with collection: ${testCollectionId}`);
      
      const { data: testMembers, error: testMembersError } = await supabase
        .from('collection_members')
        .select('*')
        .eq('collection_id', testCollectionId);

      if (testMembersError) {
        console.error('   ❌ Error fetching test members:', testMembersError);
        console.error('   ❌ Error details:', {
          message: testMembersError.message,
          details: testMembersError.details,
          hint: testMembersError.hint,
          code: testMembersError.code
        });
      } else {
        console.log(`   ✅ Found ${testMembers?.length || 0} members for test collection`);
        
        if (testMembers && testMembers.length > 0) {
          const userIds = testMembers.map(member => member.user_id).filter(Boolean);
          console.log(`   📋 User IDs: ${userIds.join(', ')}`);
          
          if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, name, avatar_url, is_local_expert, expert_areas')
              .in('id', userIds);

            if (usersError) {
              console.error('   ❌ Error fetching user data:', usersError);
            } else {
              console.log(`   ✅ Found ${usersData?.length || 0} user data records`);
            }
          }
        }
      }
    }

    console.log('\n✅ Diagnosis complete!');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

diagnoseGetUserPlansError();
