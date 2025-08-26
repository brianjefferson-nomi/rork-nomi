const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the exact functions from the frontend
async function getAllCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async function getUserPlans(userId) {
  // First, get collections that the user created
  const { data: createdCollections, error: createdError } = await supabase
    .from('collections')
    .select('*')
    .eq('created_by', userId);
  
  if (createdError) throw createdError;
  
  // Then, get collections where the user is a member
  const { data: memberCollections, error: memberError } = await supabase
    .from('collection_members')
    .select('collection_id')
    .eq('user_id', userId);
  
  if (memberError) throw memberError;
  
  // Get the actual collection data for collections where user is a member
  let memberCollectionData = [];
  if (memberCollections && memberCollections.length > 0) {
    const collectionIds = memberCollections.map(m => m.collection_id);
    const { data: memberData, error: memberDataError } = await supabase
      .from('collections')
      .select('*')
      .in('id', collectionIds);
    
    if (memberDataError) throw memberDataError;
    memberCollectionData = memberData || [];
  }
  
  // Combine and deduplicate collections
  const allCollections = [...(createdCollections || []), ...memberCollectionData];
  const uniqueCollections = allCollections.filter((collection, index, self) => 
    index === self.findIndex(c => c.id === collection.id)
  );
  
  // Sort by created_at descending
  return uniqueCollections.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

async function getAllRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
}

async function testFrontendDataLoading() {
  console.log('🧪 Testing Frontend Data Loading Process...\n');

  try {
    // Test 1: Get all public collections (like getAllCollections)
    console.log('1. Testing getAllCollections (public collections)...');
    try {
      const publicCollections = await getAllCollections();
      console.log(`✅ Public collections: ${publicCollections?.length || 0} found`);
      if (publicCollections && publicCollections.length > 0) {
        publicCollections.forEach((collection, index) => {
          console.log(`   ${index + 1}. ${collection.name} (${collection.restaurant_ids?.length || 0} restaurants)`);
        });
      }
    } catch (error) {
      console.log(`❌ getAllCollections error: ${error.message}`);
    }

    // Test 2: Get user plans (like getUserPlans with a test user ID)
    console.log('\n2. Testing getUserPlans (with test user ID)...');
    const testUserId = '11111111-1111-1111-1111-111111111111'; // Use a known user ID
    try {
      const userPlans = await getUserPlans(testUserId);
      console.log(`✅ User plans: ${userPlans?.length || 0} found`);
      if (userPlans && userPlans.length > 0) {
        userPlans.forEach((plan, index) => {
          console.log(`   ${index + 1}. ${plan.name} (${plan.restaurant_ids?.length || 0} restaurants)`);
        });
      }
    } catch (error) {
      console.log(`❌ getUserPlans error: ${error.message}`);
    }

    // Test 3: Get all restaurants (like getAllRestaurants)
    console.log('\n3. Testing getAllRestaurants...');
    try {
      const restaurants = await getAllRestaurants();
      console.log(`✅ Restaurants: ${restaurants?.length || 0} found`);
      if (restaurants && restaurants.length > 0) {
        console.log(`   Sample: ${restaurants[0].name} (${restaurants[0].cuisine})`);
      }
    } catch (error) {
      console.log(`❌ getAllRestaurants error: ${error.message}`);
    }

    // Test 4: Simulate the exact frontend logic
    console.log('\n4. Simulating frontend collection loading logic...');
    try {
      // This is what the frontend does in plansQuery
      let plans = [];
      
      // Try to get user plans first
      try {
        plans = await getUserPlans(testUserId);
        console.log(`   User plans found: ${plans.length}`);
      } catch (error) {
        console.log(`   User plans failed, falling back to public collections`);
        plans = await getAllCollections();
      }
      
      // If no plans found, fallback to public collections
      if (!plans || plans.length === 0) {
        console.log(`   No user plans, loading public collections as fallback`);
        plans = await getAllCollections();
      }
      
      console.log(`✅ Final plans count: ${plans?.length || 0}`);
      
      if (plans && plans.length > 0) {
        plans.forEach((plan, index) => {
          console.log(`   Plan ${index + 1}: ${plan.name}`);
          console.log(`     ID: ${plan.id}`);
          console.log(`     Created by: ${plan.created_by}`);
          console.log(`     Is public: ${plan.is_public}`);
          console.log(`     Restaurant IDs: ${plan.restaurant_ids?.length || 0}`);
          if (plan.restaurant_ids && plan.restaurant_ids.length > 0) {
            console.log(`     Restaurant IDs: [${plan.restaurant_ids.join(', ')}]`);
          }
        });
      }
      
    } catch (error) {
      console.log(`❌ Frontend logic simulation error: ${error.message}`);
    }

    // Test 5: Test collection detail loading
    console.log('\n5. Testing collection detail loading...');
    try {
      const collections = await getAllCollections();
      if (collections && collections.length > 0) {
        const testCollection = collections[0];
        console.log(`   Testing collection: ${testCollection.name} (${testCollection.id})`);
        
        // Get restaurants for this collection
        const restaurants = await getAllRestaurants();
        const collectionRestaurants = restaurants.filter(r => 
          testCollection.restaurant_ids && testCollection.restaurant_ids.includes(r.id)
        );
        
        console.log(`   Collection restaurants: ${collectionRestaurants.length} found`);
        collectionRestaurants.forEach((restaurant, index) => {
          console.log(`     ${index + 1}. ${restaurant.name} (${restaurant.cuisine})`);
        });
        
        // Get votes for this collection
        const { data: votes, error: votesError } = await supabase
          .from('restaurant_votes')
          .select('*')
          .eq('collection_id', testCollection.id);
        
        if (votesError) {
          console.log(`   ❌ Votes error: ${votesError.message}`);
        } else {
          console.log(`   Collection votes: ${votes?.length || 0} found`);
        }
      }
    } catch (error) {
      console.log(`❌ Collection detail test error: ${error.message}`);
    }

    console.log('\n✅ Frontend data loading test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFrontendDataLoading();
