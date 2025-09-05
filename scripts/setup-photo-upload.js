/**
 * Setup script for restaurant photo upload functionality
 * This script provides instructions and helps verify the setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function setupPhotoUpload() {
  console.log('🚀 Setting up Restaurant Photo Upload System...\n');

  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('restaurants').select('id').limit(1);
    
    if (error) {
      console.error('❌ Cannot connect to Supabase:', error.message);
      return;
    }

    console.log('✅ Connected to Supabase successfully\n');

    // Check if restaurant_photos table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('restaurant_photos')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === 'PGRST205') {
      console.log('📋 SETUP REQUIRED:');
      console.log('The restaurant_photos table does not exist yet.');
      console.log('\n🔧 To complete the setup:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the migration from: database/migrations/create_restaurant_photos_table.sql');
      console.log('\n📄 Migration file location: database/migrations/create_restaurant_photos_table.sql\n');
    } else if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
    } else {
      console.log('✅ restaurant_photos table exists');
    }

    // Check if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error checking storage buckets:', bucketError.message);
    } else {
      const restaurantPhotosBucket = buckets.find(bucket => bucket.id === 'restaurant-photos');
      
      if (restaurantPhotosBucket) {
        console.log('✅ restaurant-photos storage bucket exists');
      } else {
        console.log('📦 Storage bucket "restaurant-photos" needs to be created');
        console.log('This will be created when you run the migration SQL\n');
      }
    }

    console.log('🎯 NEXT STEPS:');
    console.log('1. Run the migration SQL in Supabase dashboard');
    console.log('2. Test the photo upload in your app');
    console.log('3. Check that images appear in restaurant detail screens\n');

    console.log('📱 APP FEATURES READY:');
    console.log('• Photo upload button in restaurant detail screen');
    console.log('• Photo gallery with management options');
    console.log('• Set photos as main restaurant image');
    console.log('• Delete photos functionality');
    console.log('• Camera and photo library integration\n');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

// Run the setup
setupPhotoUpload();
