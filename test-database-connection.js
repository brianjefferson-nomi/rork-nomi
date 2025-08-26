const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzQ5NjAwLCJleHAiOjIwNTAzMjU2MDB9.x3BEcNGNReHeyPV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('Testing database connection...\n');

  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('collections')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    console.log('✅ Connection successful');

    // Test 2: Check collections
    console.log('\n2. Checking collections...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name, restaurant_ids')
      .limit(5);

    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
    } else {
      console.log(`✅ Found ${collections.length} collections:`);
      collections.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name} (${c.id})`);
        console.log(`      restaurant_ids: ${c.restaurant_ids?.length || 0}`);
        if (c.restaurant_ids && c.restaurant_ids.length > 0) {
          console.log(`      IDs: [${c.restaurant_ids.join(', ')}]`);
        }
      });
    }

    // Test 3: Check restaurants
    console.log('\n3. Checking restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, cuisine, restaurant_code')
      .limit(5);

    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError);
    } else {
      console.log(`✅ Found ${restaurants.length} restaurants:`);
      restaurants.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name} (${r.cuisine})`);
        console.log(`      ID: ${r.id}`);
        console.log(`      Code: ${r.restaurant_code || 'N/A'}`);
      });
    }

    // Test 4: Test specific restaurant lookup
    if (collections && collections.length > 0 && collections[0].restaurant_ids && collections[0].restaurant_ids.length > 0) {
      console.log('\n4. Testing specific restaurant lookup...');
      const firstCollection = collections[0];
      const firstRestaurantId = firstCollection.restaurant_ids[0];
      
      console.log(`Looking for restaurant with ID: ${firstRestaurantId}`);
      
      const { data: specificRestaurant, error: specificError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', firstRestaurantId)
        .single();

      if (specificError) {
        console.error('❌ Error fetching specific restaurant:', specificError);
      } else {
        console.log('✅ Found specific restaurant:', specificRestaurant.name);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabaseConnection();
