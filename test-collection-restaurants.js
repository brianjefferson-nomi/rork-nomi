const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzQ5NjAwLCJleHAiOjIwNTAzMjU2MDB9.x3BEcNGNReHeyPV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCollectionRestaurants() {
  console.log('Testing collection restaurants...\n');

  try {
    // Get all collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (collectionsError) {
      console.error('Error fetching collections:', collectionsError);
      return;
    }

    console.log(`Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`\nCollection: ${collection.name} (${collection.id})`);
      console.log(`  - restaurant_ids: ${collection.restaurant_ids?.length || 0}`);
      
      if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
        console.log(`  - restaurant_ids: [${collection.restaurant_ids.join(', ')}]`);
        
        // Check if these restaurants exist
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, cuisine')
          .in('id', collection.restaurant_ids);

        if (restaurantsError) {
          console.error(`  - Error fetching restaurants:`, restaurantsError);
        } else {
          console.log(`  - Found ${restaurants.length} restaurants in database:`);
          restaurants.forEach(r => {
            console.log(`    * ${r.name} (${r.cuisine}) - ${r.id}`);
          });
        }
      } else {
        console.log('  - No restaurant_ids found');
      }
    }

    // Also check total restaurants in database
    const { data: allRestaurants, error: allRestaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, cuisine')
      .limit(10);

    if (allRestaurantsError) {
      console.error('Error fetching all restaurants:', allRestaurantsError);
    } else {
      console.log(`\nTotal restaurants in database: ${allRestaurants.length} (showing first 10):`);
      allRestaurants.forEach(r => {
        console.log(`  - ${r.name} (${r.cuisine}) - ${r.id}`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCollectionRestaurants();
