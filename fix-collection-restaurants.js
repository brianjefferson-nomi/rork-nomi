const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCollectionRestaurants() {
  console.log('🔧 Fixing Collection Restaurant Mapping...\n');

  try {
    // 1. Get all restaurants to create a mapping
    console.log('1. Getting all restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError);
      return;
    }

    console.log(`✅ Found ${restaurants.length} restaurants`);
    
    // Create a mapping of restaurant names to IDs
    const restaurantNameToId = {};
    restaurants.forEach(restaurant => {
      restaurantNameToId[restaurant.name.toLowerCase()] = restaurant.id;
    });

    // 2. Get all collections
    console.log('\n2. Getting all collections...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*');
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }

    console.log(`✅ Found ${collections.length} collections`);

    // 3. Fix each collection's restaurant_ids
    for (const collection of collections) {
      console.log(`\n3. Processing collection: ${collection.name}`);
      
      if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
        console.log(`   ⚠️  No restaurant_ids found, skipping`);
        continue;
      }

      console.log(`   Current restaurant_ids: [${collection.restaurant_ids.join(', ')}]`);
      
      // Check which restaurant IDs are valid
      const validRestaurantIds = [];
      const invalidRestaurantIds = [];
      
      for (const restaurantId of collection.restaurant_ids) {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
          validRestaurantIds.push(restaurantId);
        } else {
          invalidRestaurantIds.push(restaurantId);
        }
      }

      console.log(`   Valid restaurant IDs: ${validRestaurantIds.length}`);
      console.log(`   Invalid restaurant IDs: ${invalidRestaurantIds.length}`);

      // If we have valid restaurant IDs, update the collection
      if (validRestaurantIds.length > 0) {
        console.log(`   ✅ Collection has ${validRestaurantIds.length} valid restaurants`);
        
        // Update the collection with only valid restaurant IDs
        const { error: updateError } = await supabase
          .from('collections')
          .update({ restaurant_ids: validRestaurantIds })
          .eq('id', collection.id);
        
        if (updateError) {
          console.error(`   ❌ Error updating collection:`, updateError);
        } else {
          console.log(`   ✅ Updated collection with valid restaurant IDs`);
        }
      } else {
        console.log(`   ⚠️  No valid restaurants found for this collection`);
      }
    }

    console.log('\n✅ Collection restaurant mapping fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixCollectionRestaurants();
