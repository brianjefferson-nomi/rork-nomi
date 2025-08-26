const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCollectionMapping() {
  console.log('🧪 Testing Collection-Restaurant Mapping Issue...\n');

  try {
    // 1. Get all collections
    console.log('1. Getting all collections...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*');
    
    if (collectionsError) {
      console.log(`❌ Collections error: ${collectionsError.message}`);
      return;
    }

    console.log(`✅ Found ${collections.length} collections`);

    // 2. Get all restaurants
    console.log('\n2. Getting all restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restaurantsError) {
      console.log(`❌ Restaurants error: ${restaurantsError.message}`);
      return;
    }

    console.log(`✅ Found ${restaurants.length} restaurants`);

    // 3. Test the exact mapping logic from the frontend
    console.log('\n3. Testing frontend mapping logic...');
    
    // Simulate the frontend's getCollectionRestaurants function
    function getCollectionRestaurants(collectionId, allCollections, allRestaurants) {
      console.log(`[getCollectionRestaurants] Getting restaurants for collection: ${collectionId}`);
      console.log(`[getCollectionRestaurants] Available collections: ${allCollections.length}`);
      console.log(`[getCollectionRestaurants] Available restaurants: ${allRestaurants.length}`);

      const collection = allCollections.find(c => c.id === collectionId);
      if (!collection) {
        console.log('[getCollectionRestaurants] Collection not found');
        return [];
      }

      console.log(`[getCollectionRestaurants] Found collection: ${collection.name}`);
      console.log(`[getCollectionRestaurants] Collection restaurant_ids: ${collection.restaurant_ids?.length || 0}`);

      if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
        console.log('[getCollectionRestaurants] No restaurant_ids in collection');
        return [];
      }

      const collectionRestaurants = allRestaurants.filter(r => 
        collection.restaurant_ids.includes(r.id)
      );
      
      console.log(`[getCollectionRestaurants] Found restaurants: ${collectionRestaurants.length}`);
      collectionRestaurants.forEach((r, i) => {
        console.log(`[getCollectionRestaurants] Restaurant ${i + 1}: ${r.name} (${r.id})`);
      });

      return collectionRestaurants;
    }

    // Test with a few collections
    const testCollections = collections.slice(0, 3);
    testCollections.forEach((collection, index) => {
      console.log(`\n--- Testing Collection ${index + 1}: ${collection.name} ---`);
      const foundRestaurants = getCollectionRestaurants(collection.id, collections, restaurants);
      
      if (foundRestaurants.length === 0) {
        console.log(`❌ NO RESTAURANTS FOUND for collection: ${collection.name}`);
        console.log(`   Collection ID: ${collection.id}`);
        console.log(`   Restaurant IDs in collection: ${collection.restaurant_ids?.length || 0}`);
        if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
          console.log(`   Restaurant IDs: [${collection.restaurant_ids.join(', ')}]`);
          
          // Check if these restaurant IDs exist in the restaurants table
          collection.restaurant_ids.forEach(restaurantId => {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (restaurant) {
              console.log(`   ✅ Restaurant ID ${restaurantId} exists: ${restaurant.name}`);
            } else {
              console.log(`   ❌ Restaurant ID ${restaurantId} NOT FOUND in restaurants table`);
            }
          });
        }
      } else {
        console.log(`✅ Found ${foundRestaurants.length} restaurants for collection: ${collection.name}`);
      }
    });

    // 4. Check for potential issues
    console.log('\n4. Checking for potential mapping issues...');
    
    // Check if any restaurant IDs in collections don't exist in restaurants table
    const allRestaurantIdsInCollections = new Set();
    collections.forEach(collection => {
      if (collection.restaurant_ids) {
        collection.restaurant_ids.forEach(id => allRestaurantIdsInCollections.add(id));
      }
    });

    const missingRestaurantIds = [];
    allRestaurantIdsInCollections.forEach(restaurantId => {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (!restaurant) {
        missingRestaurantIds.push(restaurantId);
      }
    });

    if (missingRestaurantIds.length > 0) {
      console.log(`❌ Found ${missingRestaurantIds.length} restaurant IDs in collections that don't exist in restaurants table:`);
      missingRestaurantIds.forEach(id => console.log(`   ${id}`));
    } else {
      console.log('✅ All restaurant IDs in collections exist in restaurants table');
    }

    // Check for duplicate restaurant IDs
    const duplicateRestaurantIds = [];
    collections.forEach(collection => {
      if (collection.restaurant_ids) {
        const seen = new Set();
        collection.restaurant_ids.forEach(id => {
          if (seen.has(id)) {
            duplicateRestaurantIds.push({ collectionId: collection.id, restaurantId: id });
          } else {
            seen.add(id);
          }
        });
      }
    });

    if (duplicateRestaurantIds.length > 0) {
      console.log(`⚠️  Found ${duplicateRestaurantIds.length} duplicate restaurant IDs in collections:`);
      duplicateRestaurantIds.forEach(dup => console.log(`   Collection ${dup.collectionId}: ${dup.restaurantId}`));
    } else {
      console.log('✅ No duplicate restaurant IDs found in collections');
    }

    console.log('\n✅ Collection mapping test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCollectionMapping();
