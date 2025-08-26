const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzQ5NjAwLCJleHAiOjIwNTAzMjU2MDB9.x3BEcNGNReHeyPV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  console.log('Checking database state...\n');

  try {
    // Check collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name, restaurant_ids, created_at')
      .limit(5);

    if (collectionsError) {
      console.error('Error fetching collections:', collectionsError);
    } else {
      console.log(`Collections (showing first 5):`);
      collections.forEach(c => {
        console.log(`  - ${c.name} (${c.id})`);
        console.log(`    restaurant_ids: ${c.restaurant_ids?.length || 0}`);
        if (c.restaurant_ids && c.restaurant_ids.length > 0) {
          console.log(`    IDs: [${c.restaurant_ids.join(', ')}]`);
        }
      });
    }

    // Check restaurants
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, cuisine')
      .limit(5);

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
    } else {
      console.log(`\nRestaurants (showing first 5):`);
      restaurants.forEach(r => {
        console.log(`  - ${r.name} (${r.cuisine}) - ${r.id}`);
      });
    }

    // Check if any collections have restaurant_ids
    const { data: collectionsWithRestaurants, error: collectionsWithRestaurantsError } = await supabase
      .from('collections')
      .select('id, name, restaurant_ids')
      .not('restaurant_ids', 'is', null)
      .neq('restaurant_ids', '[]');

    if (collectionsWithRestaurantsError) {
      console.error('Error fetching collections with restaurants:', collectionsWithRestaurantsError);
    } else {
      console.log(`\nCollections with restaurant_ids: ${collectionsWithRestaurants.length}`);
      collectionsWithRestaurants.forEach(c => {
        console.log(`  - ${c.name}: ${c.restaurant_ids.length} restaurants`);
      });
    }

  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkDatabaseState();
