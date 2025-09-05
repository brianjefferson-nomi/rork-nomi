const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate the exact same query that the app uses
async function testRestaurantQuery() {
  try {
    console.log('🔍 Testing restaurant query exactly like the app...\n');

    // This is the exact same query from dbHelpers.getAllRestaurants()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      return;
    }
    
    console.log(`✅ Query successful! Found ${data.length} restaurants`);
    
    if (data.length > 0) {
      console.log('\n📋 Sample restaurants:');
      data.slice(0, 3).forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name}`);
        console.log(`      - ID: ${restaurant.id}`);
        console.log(`      - City: ${restaurant.city}, State: ${restaurant.state}`);
        console.log(`      - Rating: ${restaurant.rating}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRestaurantQuery();
