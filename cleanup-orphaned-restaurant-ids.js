/**
 * Script to clean up orphaned restaurant IDs from collections
 * This will remove restaurant IDs that don't exist in the restaurants table
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

async function cleanupOrphanedRestaurantIds() {
  console.log('🧹 Cleaning up orphaned restaurant IDs from collections...');
  
  try {
    // Get all collections with restaurant_ids
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name, restaurant_ids')
      .not('restaurant_ids', 'is', null);
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }
    
    if (!collections || collections.length === 0) {
      console.log('❌ No collections found');
      return;
    }
    
    console.log(`📋 Processing ${collections.length} collections...`);
    
    let totalCleaned = 0;
    let collectionsUpdated = 0;
    
    for (const collection of collections) {
      if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
        continue;
      }
      
      console.log(`\n📚 Processing collection: "${collection.name}"`);
      console.log(`   Original restaurant IDs: ${collection.restaurant_ids.length}`);
      
      // Check which restaurant IDs actually exist
      const { data: existingRestaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .in('id', collection.restaurant_ids);
      
      if (restaurantsError) {
        console.log(`   ❌ Error checking restaurants: ${restaurantsError.message}`);
        continue;
      }
      
      const existingIds = existingRestaurants?.map(r => r.id) || [];
      const orphanedIds = collection.restaurant_ids.filter(id => !existingIds.includes(id));
      
      if (orphanedIds.length > 0) {
        console.log(`   ⚠️  Found ${orphanedIds.length} orphaned IDs:`, orphanedIds);
        console.log(`   ✅ Keeping ${existingIds.length} valid IDs`);
        
        // Update the collection with only valid restaurant IDs
        const { error: updateError } = await supabase
          .from('collections')
          .update({ 
            restaurant_ids: existingIds,
            updated_at: new Date().toISOString()
          })
          .eq('id', collection.id);
        
        if (updateError) {
          console.log(`   ❌ Error updating collection: ${updateError.message}`);
        } else {
          console.log(`   ✅ Successfully cleaned up collection`);
          totalCleaned += orphanedIds.length;
          collectionsUpdated++;
        }
      } else {
        console.log(`   ✅ All restaurant IDs are valid`);
      }
    }
    
    console.log('\n🎉 Cleanup completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Collections processed: ${collections.length}`);
    console.log(`   - Collections updated: ${collectionsUpdated}`);
    console.log(`   - Orphaned IDs removed: ${totalCleaned}`);
    
    if (totalCleaned > 0) {
      console.log('\n💡 The restaurant counts should now be accurate!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
cleanupOrphanedRestaurantIds().catch(console.error);
