/**
 * Script to update restaurant images
 * Usage: node scripts/update-restaurant-images.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Update restaurant images
 * @param {string} restaurantIdentifier - Restaurant name or code
 * @param {string} mainImageUrl - Main image URL
 * @param {string[]} additionalImages - Array of additional image URLs
 */
async function updateRestaurantImages(restaurantIdentifier, mainImageUrl, additionalImages = []) {
  try {
    console.log(`Updating images for restaurant: ${restaurantIdentifier}`);
    
    // Find the restaurant
    const { data: restaurant, error: findError } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${restaurantIdentifier}%,restaurant_code.eq.${restaurantIdentifier}`)
      .limit(1)
      .single();

    if (findError || !restaurant) {
      console.error('Restaurant not found:', findError);
      return false;
    }

    console.log(`Found restaurant: ${restaurant.name} (${restaurant.restaurant_code})`);

    // Update the images
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        image_url: mainImageUrl,
        images: additionalImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant.id);

    if (updateError) {
      console.error('Error updating images:', updateError);
      return false;
    }

    console.log('✅ Successfully updated restaurant images!');
    console.log(`Main image: ${mainImageUrl}`);
    console.log(`Additional images: ${additionalImages.length} images`);
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

/**
 * Example usage - Update this with your restaurant and image URLs
 */
async function main() {
  // Example: Update images for a specific restaurant
  const restaurantName = 'Your Restaurant Name'; // or use restaurant_code
  const mainImage = 'https://example.com/your-main-image.jpg';
  const additionalImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ];

  await updateRestaurantImages(restaurantName, mainImage, additionalImages);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateRestaurantImages };
