const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzQ5NjAwLCJleHAiOjIwNTAzMjU2MDB9.x3BEcNGNReHeyPV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRestaurantsToCollection() {
  console.log('Adding restaurants to collection...\n');

  try {
    // First, let's create some test restaurants if they don't exist
    const testRestaurants = [
      {
        name: 'Test Restaurant 1',
        cuisine: 'Italian',
        neighborhood: 'Downtown',
        address: '123 Test St',
        rating: 4.5,
        price_level: 2,
        description: 'A great test restaurant'
      },
      {
        name: 'Test Restaurant 2',
        cuisine: 'Mexican',
        neighborhood: 'Uptown',
        address: '456 Test Ave',
        rating: 4.2,
        price_level: 1,
        description: 'Another great test restaurant'
      },
      {
        name: 'Test Restaurant 3',
        cuisine: 'Japanese',
        neighborhood: 'Midtown',
        address: '789 Test Blvd',
        rating: 4.7,
        price_level: 3,
        description: 'A third great test restaurant'
      }
    ];

    // Insert restaurants
    const { data: insertedRestaurants, error: insertError } = await supabase
      .from('restaurants')
      .insert(testRestaurants)
      .select('id, name');

    if (insertError) {
      console.error('Error inserting restaurants:', insertError);
      return;
    }

    console.log('Inserted restaurants:', insertedRestaurants);

    // Get the first collection
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name')
      .limit(1);

    if (collectionsError || !collections || collections.length === 0) {
      console.error('Error fetching collections or no collections found:', collectionsError);
      return;
    }

    const collection = collections[0];
    console.log('Using collection:', collection.name);

    // Add restaurant IDs to the collection
    const restaurantIds = insertedRestaurants.map(r => r.id);
    
    const { data: updatedCollection, error: updateError } = await supabase
      .from('collections')
      .update({ restaurant_ids: restaurantIds })
      .eq('id', collection.id)
      .select('id, name, restaurant_ids');

    if (updateError) {
      console.error('Error updating collection:', updateError);
      return;
    }

    console.log('Updated collection:', updatedCollection);
    console.log('Successfully added restaurants to collection!');

  } catch (error) {
    console.error('Script failed:', error);
  }
}

addRestaurantsToCollection();
