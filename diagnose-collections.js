const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseCollections() {
  console.log('🔍 Diagnosing Collections...\n');

  try {
    // 1. Check all collections
    console.log('1. Checking all collections...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*');
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }

    console.log(`✅ Found ${collections.length} collections`);
    collections.forEach((collection, index) => {
      console.log(`   Collection ${index + 1}: ${collection.name}`);
      console.log(`     ID: ${collection.id}`);
      console.log(`     Created by: ${collection.created_by}`);
      console.log(`     Is public: ${collection.is_public}`);
      console.log(`     Restaurant IDs: ${collection.restaurant_ids?.length || 0}`);
      if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
        console.log(`     Restaurant IDs: [${collection.restaurant_ids.join(', ')}]`);
      }
      console.log('');
    });

    // 2. Check all restaurants
    console.log('2. Checking all restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError);
      return;
    }

    console.log(`✅ Found ${restaurants.length} restaurants`);
    restaurants.slice(0, 5).forEach((restaurant, index) => {
      console.log(`   Restaurant ${index + 1}: ${restaurant.name} (ID: ${restaurant.id})`);
    });
    if (restaurants.length > 5) {
      console.log(`   ... and ${restaurants.length - 5} more`);
    }
    console.log('');

    // 3. Check collection members
    console.log('3. Checking collection members...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*');
    
    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
      return;
    }

    console.log(`✅ Found ${members.length} collection members`);
    members.forEach((member, index) => {
      console.log(`   Member ${index + 1}: User ${member.user_id} in Collection ${member.collection_id}`);
    });
    console.log('');

    // 4. Check restaurant votes
    console.log('4. Checking restaurant votes...');
    const { data: votes, error: votesError } = await supabase
      .from('restaurant_votes')
      .select('*');
    
    if (votesError) {
      console.error('❌ Error fetching votes:', votesError);
      return;
    }

    console.log(`✅ Found ${votes.length} restaurant votes`);
    votes.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: User ${vote.user_id} voted ${vote.vote} for Restaurant ${vote.restaurant_id} in Collection ${vote.collection_id}`);
    });
    console.log('');

    // 5. Check restaurant discussions
    console.log('5. Checking restaurant discussions...');
    const { data: discussions, error: discussionsError } = await supabase
      .from('restaurant_discussions')
      .select('*');
    
    if (discussionsError) {
      console.error('❌ Error fetching discussions:', discussionsError);
      return;
    }

    console.log(`✅ Found ${discussions.length} restaurant discussions`);
    discussions.forEach((discussion, index) => {
      console.log(`   Discussion ${index + 1}: User ${discussion.user_id} commented on Restaurant ${discussion.restaurant_id} in Collection ${discussion.collection_id}`);
    });
    console.log('');

    // 6. Test getUserPlans function
    console.log('6. Testing getUserPlans function...');
    const { data: userPlans, error: userPlansError } = await supabase
      .from('collections')
      .select('*')
      .or('is_public.eq.true');
    
    if (userPlansError) {
      console.error('❌ Error testing getUserPlans:', userPlansError);
      return;
    }

    console.log(`✅ getUserPlans would return ${userPlans.length} collections`);
    userPlans.forEach((plan, index) => {
      console.log(`   Plan ${index + 1}: ${plan.name} - ${plan.restaurant_ids?.length || 0} restaurants`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

diagnoseCollections();
