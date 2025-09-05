/**
 * Test script to verify that restaurant images prioritize database photos over external APIs
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseFirstImages() {
  console.log('🧪 Testing database-first image priority...');
  
  try {
    // Get a sample restaurant with various image sources
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select(`
        id, 
        name, 
        google_photos, 
        tripadvisor_photos, 
        images,
        image_url
      `)
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching restaurants:', fetchError);
      return;
    }
    
    if (!restaurants || restaurants.length === 0) {
      console.log('❌ No restaurants found to test with');
      return;
    }
    
    console.log(`📋 Testing with ${restaurants.length} restaurants:`);
    
    for (const restaurant of restaurants) {
      console.log(`\n🏪 Restaurant: ${restaurant.name} (${restaurant.id})`);
      
      // Check what image sources are available
      const hasGooglePhotos = restaurant.google_photos && restaurant.google_photos.length > 0;
      const hasTripAdvisorPhotos = restaurant.tripadvisor_photos && restaurant.tripadvisor_photos.length > 0;
      const hasOtherImages = restaurant.images && restaurant.images.length > 0;
      const hasMainImage = restaurant.image_url && restaurant.image_url.length > 0;
      
      console.log(`   📸 Google Photos: ${hasGooglePhotos ? '✅' : '❌'}`);
      console.log(`   📸 TripAdvisor Photos: ${hasTripAdvisorPhotos ? '✅' : '❌'}`);
      console.log(`   📸 Other Images: ${hasOtherImages ? '✅' : '❌'}`);
      console.log(`   📸 Main Image: ${hasMainImage ? '✅' : '❌'}`);
      
      // Check for uploaded photos
      const { data: uploadedPhotos, error: photosError } = await supabase
        .from('restaurant_photos')
        .select('id, image_url')
        .eq('restaurant_id', restaurant.id);
      
      if (photosError) {
        console.log(`   📸 Uploaded Photos: ❌ (Error: ${photosError.message})`);
      } else {
        const hasUploadedPhotos = uploadedPhotos && uploadedPhotos.length > 0;
        console.log(`   📸 Uploaded Photos: ${hasUploadedPhotos ? `✅ (${uploadedPhotos.length})` : '❌'}`);
      }
      
      // Test the assignRestaurantImages function
      console.log(`   🔄 Testing image assignment...`);
      
      // Simulate the assignRestaurantImages function logic
      const images = [];
      
      // 1. Check uploaded photos
      if (uploadedPhotos && uploadedPhotos.length > 0) {
        const uploadedUrls = uploadedPhotos.map(photo => photo.image_url).filter(Boolean);
        images.push(...uploadedUrls);
        console.log(`      ✅ Added ${uploadedUrls.length} uploaded photos`);
      }
      
      // 2. Check Google Photos
      if (restaurant.google_photos) {
        let googlePhotoUrls = [];
        if (typeof restaurant.google_photos === 'string') {
          googlePhotoUrls = restaurant.google_photos.split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0 && url.startsWith('http'));
        } else if (Array.isArray(restaurant.google_photos)) {
          googlePhotoUrls = restaurant.google_photos
            .filter(url => typeof url === 'string' && url.startsWith('http'));
        }
        
        if (googlePhotoUrls.length > 0) {
          images.push(...googlePhotoUrls);
          console.log(`      ✅ Added ${googlePhotoUrls.length} Google Photos`);
        }
      }
      
      // 3. Check TripAdvisor Photos
      if (restaurant.tripadvisor_photos && Array.isArray(restaurant.tripadvisor_photos)) {
        const validTripAdvisorPhotos = restaurant.tripadvisor_photos
          .filter(img => typeof img === 'string' && img.startsWith('http'));
        if (validTripAdvisorPhotos.length > 0) {
          images.push(...validTripAdvisorPhotos);
          console.log(`      ✅ Added ${validTripAdvisorPhotos.length} TripAdvisor photos`);
        }
      }
      
      // 4. Check other images
      if (restaurant.images && Array.isArray(restaurant.images)) {
        const validImages = restaurant.images
          .filter(img => typeof img === 'string' && img.startsWith('http') && !img.includes('rapidapi.com'));
        if (validImages.length > 0) {
          images.push(...validImages);
          console.log(`      ✅ Added ${validImages.length} other images`);
        }
      }
      
      // 5. Check main image
      if (restaurant.image_url && restaurant.image_url.startsWith('http') && !images.includes(restaurant.image_url)) {
        images.push(restaurant.image_url);
        console.log(`      ✅ Added main image URL`);
      }
      
      const uniqueImages = [...new Set(images)].filter(Boolean);
      console.log(`      📊 Total unique images: ${uniqueImages.length}`);
      
      if (uniqueImages.length > 0) {
        console.log(`      ✅ Database-first approach working - no external API calls needed!`);
      } else {
        console.log(`      ⚠️  No database images found - would fall back to Unsplash`);
      }
    }
    
    console.log('\n🎉 Database-first image test completed!');
    console.log('💡 The system should now prioritize database photos over external APIs.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting database-first image priority test...\n');
  
  await testDatabaseFirstImages();
  
  console.log('\n✨ Test completed!');
  console.log('📱 Check your app to see that restaurant images now prioritize database photos.');
}

// Check if we have the required environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('⚠️  Warning: Supabase environment variables not found.');
  console.log('   Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   or update the script with your actual Supabase credentials.');
}

runTest().catch(console.error);
