// =====================================================
// TEST ENHANCED COLLECTIONS FUNCTIONALITY
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEnhancedCollections() {
  console.log('🚀 Starting Enhanced Collections Test Suite\n');

  try {
    // Test 1: Check if collections exist
    console.log('📊 Test 1: Checking collections existence...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(5);

    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }

    console.log(`✅ Found ${collections?.length || 0} collections`);
    
    if (collections && collections.length > 0) {
      console.log('📋 Sample collection data:');
      collections.forEach((collection, index) => {
        console.log(`  ${index + 1}. ${collection.name} (${collection.id})`);
        console.log(`     - Type: ${collection.is_public ? 'Public' : 'Private'}`);
        console.log(`     - Restaurants: ${collection.restaurant_ids?.length || 0}`);
        console.log(`     - Created by: ${collection.created_by}`);
      });
    }

    // Test 2: Check if users exist
    console.log('\n👤 Test 2: Checking users existence...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} users`);
    
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      console.log(`🎯 Using test user: ${testUserId}`);

      // Test 3: Test getUserPlans logic
      console.log('\n🔍 Test 3: Testing getUserPlans logic...');
      
      // Get collections created by user
      const { data: createdCollections, error: createdError } = await supabase
        .from('collections')
        .select('*')
        .eq('created_by', testUserId);

      console.log(`✅ User created ${createdCollections?.length || 0} collections`);

      // Get collections where user is member
      const { data: memberCollections, error: memberError } = await supabase
        .from('collection_members')
        .select('collection_id')
        .eq('user_id', testUserId);

      console.log(`✅ User is member of ${memberCollections?.length || 0} collections`);

      // Get public collections
      const { data: publicCollections, error: publicError } = await supabase
        .from('collections')
        .select('*')
        .eq('is_public', true);

      console.log(`✅ Found ${publicCollections?.length || 0} public collections`);

      // Test 4: Check collection members
      console.log('\n👥 Test 4: Checking collection members...');
      const { data: allMembers, error: membersError } = await supabase
        .from('collection_members')
        .select('*');

      if (membersError) {
        console.error('❌ Error fetching members:', membersError);
      } else {
        console.log(`✅ Found ${allMembers?.length || 0} total memberships`);
      }

      // Test 5: Check voting data
      console.log('\n🗳️ Test 5: Checking voting data...');
      const { data: votes, error: votesError } = await supabase
        .from('restaurant_votes')
        .select('*');

      if (votesError) {
        console.error('❌ Error fetching votes:', votesError);
      } else {
        console.log(`✅ Found ${votes?.length || 0} total votes`);
        if (votes && votes.length > 0) {
          const likes = votes.filter(v => v.vote === 'like').length;
          const dislikes = votes.filter(v => v.vote === 'dislike').length;
          console.log(`   - Likes: ${likes}`);
          console.log(`   - Dislikes: ${dislikes}`);
        }
      }

      // Test 6: Check discussion data
      console.log('\n💬 Test 6: Checking discussion data...');
      const { data: discussions, error: discussionsError } = await supabase
        .from('restaurant_discussions')
        .select('*');

      if (discussionsError) {
        console.error('❌ Error fetching discussions:', discussionsError);
      } else {
        console.log(`✅ Found ${discussions?.length || 0} total discussions`);
      }

      // Test 7: Check restaurants
      console.log('\n🍽️ Test 7: Checking restaurants...');
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .limit(5);

      if (restaurantsError) {
        console.error('❌ Error fetching restaurants:', restaurantsError);
      } else {
        console.log(`✅ Found ${restaurants?.length || 0} restaurants (showing first 5)`);
        if (restaurants && restaurants.length > 0) {
          restaurants.forEach((restaurant, index) => {
            console.log(`  ${index + 1}. ${restaurant.name} (${restaurant.restaurant_code})`);
          });
        }
      }

      // Test 8: Simulate frontend data flow
      console.log('\n🔄 Test 8: Simulating frontend data flow...');
      
      // Simulate the getUserPlans function logic
      const allCollections = [
        ...(createdCollections || []),
        ...(publicCollections || [])
      ];

      // Remove duplicates
      const uniqueCollections = allCollections.filter((collection, index, self) => 
        index === self.findIndex(c => c.id === collection.id)
      );

      console.log(`✅ Total unique collections for user: ${uniqueCollections.length}`);

      // Map collections like the frontend does
      const mappedCollections = uniqueCollections.map(collection => ({
        ...collection,
        restaurant_ids: Array.isArray(collection.restaurant_ids) ? collection.restaurant_ids : [],
        collaborators: [], // This would be populated by getCollectionMembers
        settings: {
          voteVisibility: collection.vote_visibility || 'public',
          discussionEnabled: collection.discussion_enabled !== false,
          autoRankingEnabled: collection.auto_ranking_enabled !== false,
          consensusThreshold: collection.consensus_threshold ? collection.consensus_threshold / 100 : 0.7
        },
        restaurantCount: Array.isArray(collection.restaurant_ids) ? collection.restaurant_ids.length : 0,
        memberCount: 0, // This would be populated by getCollectionMembers
        isOwner: collection.created_by === testUserId,
        isMember: false // This would be determined by membership check
      }));

      console.log('✅ Mapped collections for frontend:');
      mappedCollections.forEach((collection, index) => {
        console.log(`  ${index + 1}. ${collection.name}`);
        console.log(`     - Restaurant count: ${collection.restaurantCount}`);
        console.log(`     - Is owner: ${collection.isOwner}`);
        console.log(`     - Is public: ${collection.is_public}`);
      });

    } else {
      console.log('⚠️ No users found - cannot test user-specific functionality');
    }

    // Test 9: Data validation
    console.log('\n✅ Test 9: Data validation...');
    
    const validationResults = {
      hasCollections: collections && collections.length > 0,
      hasUsers: users && users.length > 0,
      hasRestaurants: restaurants && restaurants.length > 0,
      hasMembers: allMembers && allMembers.length > 0,
      hasVotes: votes && votes.length > 0,
      hasDiscussions: discussions && discussions.length > 0
    };

    console.log('📊 Data validation results:');
    Object.entries(validationResults).forEach(([key, value]) => {
      console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
    });

    // Test 10: Summary and recommendations
    console.log('\n📋 Test 10: Summary and recommendations...');
    
    const totalTests = Object.keys(validationResults).length;
    const passedTests = Object.values(validationResults).filter(Boolean).length;
    
    console.log(`\n🎯 Test Results: ${passedTests}/${totalTests} data categories have content`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All data categories have content! Frontend should display collections properly.');
    } else {
      console.log('⚠️ Some data categories are empty. Consider running the test data script.');
      
      if (!validationResults.hasCollections) {
        console.log('💡 Recommendation: Create test collections');
      }
      if (!validationResults.hasUsers) {
        console.log('💡 Recommendation: Create test users');
      }
      if (!validationResults.hasRestaurants) {
        console.log('💡 Recommendation: Create test restaurants');
      }
      if (!validationResults.hasMembers) {
        console.log('💡 Recommendation: Add users to collections');
      }
      if (!validationResults.hasVotes) {
        console.log('💡 Recommendation: Add voting activity');
      }
      if (!validationResults.hasDiscussions) {
        console.log('💡 Recommendation: Add discussion activity');
      }
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the test
testEnhancedCollections().then(() => {
  console.log('\n🏁 Test suite completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
