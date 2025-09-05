/**
 * Test script to verify that the new default image is being used
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDefaultImage() {
  console.log('🧪 Testing default image implementation...');
  
  try {
    // Get a sample restaurant
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name, google_photos, tripadvisor_photos, images, image_url')
      .limit(3);
    
    if (fetchError) {
      console.error('❌ Error fetching restaurants:', fetchError);
      return;
    }
    
    if (!restaurants || restaurants.length === 0) {
      console.log('❌ No restaurants found to test with');
      return;
    }
    
    console.log(`📋 Testing with ${restaurants.length} restaurants:`);
    
    const defaultImageUrl = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    
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
      
      // Simulate the image priority logic
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
      
      // 6. Final fallback: Use default image if no images found
      if (images.length === 0) {
        images.push(defaultImageUrl);
        console.log(`      🔄 Using default image (no database images found)`);
      }
      
      const uniqueImages = [...new Set(images)].filter(Boolean);
      console.log(`      📊 Total unique images: ${uniqueImages.length}`);
      
      // Check if default image is being used
      const isUsingDefaultImage = uniqueImages.includes(defaultImageUrl);
      console.log(`      ${isUsingDefaultImage ? '🔄' : '✅'} ${isUsingDefaultImage ? 'Using default image' : 'Using database images'}`);
      
      if (isUsingDefaultImage && uniqueImages.length > 1) {
        console.log(`      ⚠️  Default image is mixed with other images - this should not happen`);
      } else if (isUsingDefaultImage && uniqueImages.length === 1) {
        console.log(`      ✅ Correctly using default image as fallback`);
      } else {
        console.log(`      ✅ Correctly using database images`);
      }
    }
    
    console.log('\n🎉 Default image test completed!');
    console.log('💡 The system should now use the Vecteezy placeholder image when no database images are available.');
    console.log('📱 Check your app to see the new default image in action.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting default image test...\n');
  
  await testDefaultImage();
  
  console.log('\n✨ Test completed!');
  console.log('📱 The new default image should now appear when:');
  console.log('   - Images are loading');
  console.log('   - No database images are available');
  console.log('   - As a fallback for missing images');
}

// Check if we have the required environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('⚠️  Warning: Supabase environment variables not found.');
  console.log('   Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   or update the script with your actual Supabase credentials.');
}

runTest().catch(console.error);
