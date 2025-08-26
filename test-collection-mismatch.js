const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCollectionMismatch() {
  console.log('🔍 Testing Collection Data Mismatch...\n');

  try {
    // 1. Get all collections with their restaurant_ids
    console.log('1. Checking collections with restaurant_ids...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*');
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }

    console.log(`✅ Found ${collections.length} collections`);
    
    // 2. For each collection, check if it has votes and restaurants
    for (const collection of collections) {
      console.log(`\n📋 Collection: ${collection.name} (${collection.id})`);
      console.log(`   Type: ${collection.collection_type || 'unknown'}`);
      console.log(`   Restaurant IDs: ${collection.restaurant_ids?.length || 0}`);
      
      if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
        console.log(`   Restaurant IDs: [${collection.restaurant_ids.slice(0, 3).join(', ')}${collection.restaurant_ids.length > 3 ? '...' : ''}]`);
      }

      // Check votes for this collection
      const { data: votes, error: votesError } = await supabase
        .from('restaurant_votes')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('collection_id', collection.id);
      
      if (votesError) {
        console.error(`   ❌ Error fetching votes:`, votesError);
      } else {
        console.log(`   ✅ Votes: ${votes.length}`);
        
        // Group votes by restaurant
        const votesByRestaurant = {};
        votes.forEach(vote => {
          if (!votesByRestaurant[vote.restaurant_id]) {
            votesByRestaurant[vote.restaurant_id] = { likes: 0, dislikes: 0, voters: [] };
          }
          if (vote.vote === 'like') {
            votesByRestaurant[vote.restaurant_id].likes++;
          } else {
            votesByRestaurant[vote.restaurant_id].dislikes++;
          }
          votesByRestaurant[vote.restaurant_id].voters.push({
            name: vote.users?.name || 'Unknown',
            vote: vote.vote
          });
        });

        // Display vote summary
        Object.entries(votesByRestaurant).forEach(([restaurantId, data]) => {
          console.log(`     🍽️  Restaurant ${restaurantId}: ${data.likes} likes, ${data.dislikes} dislikes`);
          console.log(`        Voters: ${data.voters.map(v => `${v.name}(${v.vote})`).join(', ')}`);
        });
      }

      // Check if restaurants exist
      if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name')
          .in('id', collection.restaurant_ids);
        
        if (restaurantsError) {
          console.error(`   ❌ Error fetching restaurants:`, restaurantsError);
        } else {
          console.log(`   ✅ Restaurants found: ${restaurants.length}/${collection.restaurant_ids.length}`);
          restaurants.forEach(restaurant => {
            console.log(`     🏪 ${restaurant.name} (${restaurant.id})`);
          });
        }
      }

      // Check collection members
      const { data: members, error: membersError } = await supabase
        .from('collection_members')
        .select('*')
        .eq('collection_id', collection.id);
      
      if (membersError) {
        console.error(`   ❌ Error fetching members:`, membersError);
      } else {
        console.log(`   👥 Members: ${members.length}`);
        members.forEach(member => {
          console.log(`     - User ${member.user_id} (${member.role})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCollectionMismatch();
