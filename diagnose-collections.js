const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzQ5NjAwLCJleHAiOjIwNTAzMjU2MDB9.x3BEcNGNReHeyPV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseCollections() {
  console.log('🔍 Diagnosing collections issue...\n');

  try {
    // Step 1: Check if collections table exists and has data
    console.log('1. Checking collections table...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(10);

    if (collectionsError) {
      console.error('❌ Error accessing collections table:', collectionsError);
      return;
    }

    console.log(`✅ Found ${collections.length} collections in database`);
    if (collections.length > 0) {
      console.log('Sample collections:');
      collections.forEach((collection, index) => {
        console.log(`  ${index + 1}. ${collection.name} (ID: ${collection.id})`);
        console.log(`     Created by: ${collection.created_by}`);
        console.log(`     Is public: ${collection.is_public}`);
        console.log(`     Collection type: ${collection.collection_type || 'NOT SET'}`);
        console.log(`     Restaurant IDs: ${collection.restaurant_ids?.length || 0}`);
        console.log('');
      });
    }

    // Step 2: Check if users table has data
    console.log('2. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users in database`);
      if (users.length > 0) {
        console.log('Sample users:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name || 'No name'} (${user.email}) - ID: ${user.id}`);
        });
        console.log('');
      }
    }

    // Step 3: Check collection_members table
    console.log('3. Checking collection_members table...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .limit(10);

    if (membersError) {
      console.error('❌ Error accessing collection_members table:', membersError);
    } else {
      console.log(`✅ Found ${members.length} collection members in database`);
      if (members.length > 0) {
        console.log('Sample members:');
        members.forEach((member, index) => {
          console.log(`  ${index + 1}. Collection: ${member.collection_id}, User: ${member.user_id}, Role: ${member.role}`);
        });
        console.log('');
      }
    }

    // Step 4: Test getUserPlans logic for first user
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      console.log(`4. Testing getUserPlans logic for user: ${testUserId}`);
      
      // Get collections created by this user
      const { data: createdCollections, error: createdError } = await supabase
        .from('collections')
        .select('*')
        .eq('created_by', testUserId);

      if (createdError) {
        console.error('❌ Error fetching created collections:', createdError);
      } else {
        console.log(`✅ User created ${createdCollections.length} collections`);
      }

      // Get collections where user is a member
      const { data: memberCollections, error: memberError } = await supabase
        .from('collection_members')
        .select('collection_id')
        .eq('user_id', testUserId);

      if (memberError) {
        console.error('❌ Error fetching member collections:', memberError);
      } else {
        console.log(`✅ User is a member of ${memberCollections.length} collections`);
      }

      // Get public collections
      const { data: publicCollections, error: publicError } = await supabase
        .from('collections')
        .select('*')
        .eq('is_public', true);

      if (publicError) {
        console.error('❌ Error fetching public collections:', publicError);
      } else {
        console.log(`✅ Found ${publicCollections.length} public collections`);
      }

      // Calculate total collections user should see
      const allCollections = [
        ...(createdCollections || []),
        ...(publicCollections || [])
      ];
      
      // Add member collections (excluding duplicates)
      if (memberCollections && memberCollections.length > 0) {
        const memberCollectionIds = memberCollections.map(m => m.collection_id);
        const { data: memberData } = await supabase
          .from('collections')
          .select('*')
          .in('id', memberCollectionIds);
        
        if (memberData) {
          allCollections.push(...memberData);
        }
      }

      // Deduplicate
      const uniqueCollections = allCollections.filter((collection, index, self) => 
        index === self.findIndex(c => c.id === collection.id)
      );

      console.log(`✅ Total collections user should see: ${uniqueCollections.length}`);
      console.log('');
    }

    // Step 5: Check if collection_type field exists
    console.log('5. Checking collection_type field...');
    const { data: sampleCollection, error: sampleError } = await supabase
      .from('collections')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error checking collection_type field:', sampleError);
    } else if (sampleCollection) {
      console.log('✅ collection_type field exists:', !!sampleCollection.collection_type);
      console.log(`   Sample collection type: ${sampleCollection.collection_type || 'NULL'}`);
    }

    console.log('\n🎯 Diagnosis complete!');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseCollections(); 