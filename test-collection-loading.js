const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCollectionLoading() {
  console.log('🧪 Testing Collection Loading Process...\n');

  try {
    // 1. Get a specific collection (let's use the first one)
    console.log('1. Getting a specific collection...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(1);
    
    if (collectionsError || !collections || collections.length === 0) {
      console.error('❌ Error fetching collection:', collectionsError);
      return;
    }

    const collection = collections[0];
    console.log(`✅ Found collection: ${collection.name} (ID: ${collection.id})`);
    console.log(`   Restaurant IDs: ${collection.restaurant_ids?.length || 0}`);
    if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
      console.log(`   Restaurant IDs: [${collection.restaurant_ids.join(', ')}]`);
    }

    // 2. Get all restaurants
    console.log('\n2. Getting all restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError);
      return;
    }

    console.log(`✅ Found ${restaurants.length} restaurants`);

    // 3. Filter restaurants for this collection
    console.log('\n3. Filtering restaurants for collection...');
    if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
      console.log('   ⚠️  No restaurant_ids in collection');
      return;
    }

    const collectionRestaurants = restaurants.filter(r => 
      collection.restaurant_ids.includes(r.id)
    );
    
    console.log(`✅ Found ${collectionRestaurants.length} restaurants for collection`);
    collectionRestaurants.forEach((restaurant, index) => {
      console.log(`   Restaurant ${index + 1}: ${restaurant.name} (${restaurant.cuisine})`);
    });

    // 4. Get votes for this collection
    console.log('\n4. Getting votes for collection...');
    const { data: votes, error: votesError } = await supabase
      .from('restaurant_votes')
      .select('*')
      .eq('collection_id', collection.id);
    
    if (votesError) {
      console.error('❌ Error fetching votes:', votesError);
      return;
    }

    console.log(`✅ Found ${votes.length} votes for collection`);
    votes.forEach((vote, index) => {
      console.log(`   Vote ${index + 1}: User ${vote.user_id} voted ${vote.vote} for Restaurant ${vote.restaurant_id}`);
    });

    // 5. Get members for this collection
    console.log('\n5. Getting members for collection...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .eq('collection_id', collection.id);
    
    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
      return;
    }

    console.log(`✅ Found ${members.length} members for collection`);
    members.forEach((member, index) => {
      console.log(`   Member ${index + 1}: User ${member.user_id} (Role: ${member.role})`);
    });

    // 6. Simulate the getRankedRestaurants function
    console.log('\n6. Simulating getRankedRestaurants function...');
    
    // This is what the frontend should be doing
    const planRestaurants = restaurants.filter(r => collection.restaurant_ids.includes(r.id));
    console.log(`   Filtered restaurants: ${planRestaurants.length}`);
    
    const collectionVotes = votes.filter(v => v.collection_id === collection.id);
    console.log(`   Collection votes: ${collectionVotes.length}`);
    
    // Create a simple ranking
    const rankings = planRestaurants.map(restaurant => {
      const restaurantVotes = collectionVotes.filter(v => v.restaurant_id === restaurant.id);
      const likes = restaurantVotes.filter(v => v.vote === 'like').length;
      const dislikes = restaurantVotes.filter(v => v.vote === 'dislike').length;
      
      return {
        restaurant,
        meta: {
          likes,
          dislikes,
          rank: likes - dislikes,
          voteDetails: {
            likeVoters: restaurantVotes.filter(v => v.vote === 'like').map(v => ({ userId: v.user_id })),
            dislikeVoters: restaurantVotes.filter(v => v.vote === 'dislike').map(v => ({ userId: v.user_id }))
          }
        }
      };
    });
    
    console.log(`✅ Created ${rankings.length} ranked restaurants`);
    rankings.forEach((ranking, index) => {
      console.log(`   Ranking ${index + 1}: ${ranking.restaurant.name} - ${ranking.meta.likes} likes, ${ranking.meta.dislikes} dislikes`);
    });

    console.log('\n✅ Collection loading test completed successfully!');
    console.log('The data is available and should be displayed in the frontend.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCollectionLoading();
