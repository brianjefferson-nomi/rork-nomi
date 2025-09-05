/**
 * Test script to verify collection restaurant counts
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCollectionRestaurantCounts() {
  console.log('🧪 Testing collection restaurant counts...');
  
  try {
    // Get all collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name, restaurant_ids, is_public')
      .limit(10);
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }
    
    if (!collections || collections.length === 0) {
      console.log('❌ No collections found');
      return;
    }
    
    console.log(`📋 Testing ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`\n📚 Collection: "${collection.name}" (${collection.id})`);
      console.log(`   🔒 Public: ${collection.is_public ? 'Yes' : 'No'}`);
      console.log(`   🍽️  Restaurant IDs in collection: ${collection.restaurant_ids?.length || 0}`);
      
      if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
        console.log(`   📝 Restaurant IDs:`, collection.restaurant_ids);
        
        // Check if these restaurants actually exist in the database
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, restaurant_code')
          .in('id', collection.restaurant_ids);
        
        if (restaurantsError) {
          console.log(`   ❌ Error fetching restaurants: ${restaurantsError.message}`);
        } else {
          console.log(`   ✅ Found ${restaurants?.length || 0} restaurants in database`);
          if (restaurants && restaurants.length > 0) {
            console.log(`   📝 Restaurant names:`, restaurants.map(r => r.name));
          }
          
          // Check for missing restaurants
          const foundIds = restaurants?.map(r => r.id) || [];
          const missingIds = collection.restaurant_ids.filter(id => !foundIds.includes(id));
          if (missingIds.length > 0) {
            console.log(`   ⚠️  Missing restaurant IDs:`, missingIds);
          }
        }
      } else {
        console.log(`   ℹ️  No restaurants in this collection`);
      }
    }
    
    console.log('\n🎉 Collection restaurant count test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testCollectionRestaurantCounts().catch(console.error);
