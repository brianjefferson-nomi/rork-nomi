const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testVoteData() {
  console.log('🔍 Testing Vote Data...\n');

  try {
    // 1. Check collections
    console.log('1. Checking collections...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(5);
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
    } else {
      console.log(`✅ Found ${collections.length} collections`);
      collections.forEach(col => {
        console.log(`   - ${col.name} (ID: ${col.id}) - Type: ${col.collection_type || 'unknown'}`);
      });
    }

    // 2. Check restaurant_votes table
    console.log('\n2. Checking restaurant_votes...');
    const { data: votes, error: votesError } = await supabase
      .from('restaurant_votes')
      .select('*')
      .limit(10);
    
    if (votesError) {
      console.error('❌ Error fetching votes:', votesError);
    } else {
      console.log(`✅ Found ${votes.length} votes`);
      votes.forEach(vote => {
        console.log(`   - Restaurant: ${vote.restaurant_id}, User: ${vote.user_id}, Vote: ${vote.vote}, Collection: ${vote.collection_id}`);
      });
    }

    // 3. Check votes with user data
    console.log('\n3. Checking votes with user data...');
    const { data: votesWithUsers, error: votesWithUsersError } = await supabase
      .from('restaurant_votes')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        )
      `)
      .limit(5);
    
    if (votesWithUsersError) {
      console.error('❌ Error fetching votes with users:', votesWithUsersError);
    } else {
      console.log(`✅ Found ${votesWithUsers.length} votes with user data`);
      votesWithUsers.forEach(vote => {
        console.log(`   - Restaurant: ${vote.restaurant_id}, User: ${vote.users?.name || 'Unknown'}, Vote: ${vote.vote}`);
      });
    }

    // 4. Check collection members
    console.log('\n4. Checking collection_members...');
    const { data: members, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .limit(10);
    
    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
    } else {
      console.log(`✅ Found ${members.length} collection members`);
      members.forEach(member => {
        console.log(`   - Collection: ${member.collection_id}, User: ${member.user_id}, Role: ${member.role}`);
      });
    }

    // 5. Check restaurants
    console.log('\n5. Checking restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(5);
    
    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError);
    } else {
      console.log(`✅ Found ${restaurants.length} restaurants`);
      restaurants.forEach(restaurant => {
        console.log(`   - ${restaurant.name} (ID: ${restaurant.id})`);
      });
    }

    // 6. Test a specific collection's votes
    if (collections && collections.length > 0) {
      const testCollectionId = collections[0].id;
      console.log(`\n6. Testing votes for collection: ${collections[0].name} (${testCollectionId})`);
      
      const { data: collectionVotes, error: collectionVotesError } = await supabase
        .from('restaurant_votes')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('collection_id', testCollectionId);
      
      if (collectionVotesError) {
        console.error('❌ Error fetching collection votes:', collectionVotesError);
      } else {
        console.log(`✅ Found ${collectionVotes.length} votes for this collection`);
        collectionVotes.forEach(vote => {
          console.log(`   - Restaurant: ${vote.restaurant_id}, User: ${vote.users?.name || 'Unknown'}, Vote: ${vote.vote}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVoteData();
