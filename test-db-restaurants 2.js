const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testRestaurantLoading() {
  try {
    console.log('🔍 Testing restaurant loading from database...\n');

    // Test the exact same query that the app uses
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching restaurants:', error);
      return;
    }

    console.log(`📊 Found ${restaurants.length} restaurants in database`);
    
    if (restaurants.length > 0) {
      console.log('\n🏪 Sample restaurants:');
      restaurants.slice(0, 5).forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name} (${restaurant.id})`);
        console.log(`      - City: ${restaurant.city}, State: ${restaurant.state}`);
        console.log(`      - Rating: ${restaurant.rating}, Google Rating: ${restaurant.google_rating || 'N/A'}`);
        console.log(`      - Google Place ID: ${restaurant.google_place_id || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No restaurants found in database!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRestaurantLoading();
