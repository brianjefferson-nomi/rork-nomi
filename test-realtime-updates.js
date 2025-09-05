/**
 * Test script to demonstrate real-time updates
 * This script shows how to trigger updates that will be reflected in real-time in the UI
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRestaurantUpdates() {
  console.log('🧪 Testing real-time restaurant updates...');
  
  try {
    // Get a sample restaurant to update
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name, hours, price_range, website')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching restaurants:', fetchError);
      return;
    }
    
    if (!restaurants || restaurants.length === 0) {
      console.log('❌ No restaurants found to test with');
      return;
    }
    
    const restaurant = restaurants[0];
    console.log(`📋 Testing with restaurant: ${restaurant.name} (${restaurant.id})`);
    
    // Test 1: Update hours
    console.log('\n🕐 Testing hours update...');
    const newHours = `Mon-Fri: 11:00 AM - 10:00 PM\nSat-Sun: 10:00 AM - 11:00 PM`;
    const { error: hoursError } = await supabase
      .from('restaurants')
      .update({ hours: newHours })
      .eq('id', restaurant.id);
    
    if (hoursError) {
      console.error('❌ Error updating hours:', hoursError);
    } else {
      console.log('✅ Hours updated successfully - check the UI for real-time update!');
    }
    
    // Wait a bit before next update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Update price range
    console.log('\n💰 Testing price range update...');
    const newPriceRange = '$$$';
    const { error: priceError } = await supabase
      .from('restaurants')
      .update({ price_range: newPriceRange })
      .eq('id', restaurant.id);
    
    if (priceError) {
      console.error('❌ Error updating price range:', priceError);
    } else {
      console.log('✅ Price range updated successfully - check the UI for real-time update!');
    }
    
    // Wait a bit before next update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Update website
    console.log('\n🌐 Testing website update...');
    const newWebsite = 'https://example-restaurant.com';
    const { error: websiteError } = await supabase
      .from('restaurants')
      .update({ website: newWebsite })
      .eq('id', restaurant.id);
    
    if (websiteError) {
      console.error('❌ Error updating website:', websiteError);
    } else {
      console.log('✅ Website updated successfully - check the UI for real-time update!');
    }
    
    console.log('\n🎉 All tests completed! Check your app to see the real-time updates.');
    console.log('💡 The UI should automatically reflect these changes without requiring a page refresh.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function testPhotoUpdates() {
  console.log('\n📸 Testing real-time photo updates...');
  
  try {
    // Get a sample restaurant
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);
    
    if (fetchError || !restaurants || restaurants.length === 0) {
      console.log('❌ No restaurants found to test photo updates with');
      return;
    }
    
    const restaurant = restaurants[0];
    console.log(`📋 Testing photo updates for restaurant: ${restaurant.name} (${restaurant.id})`);
    
    // Test: Insert a new photo
    console.log('\n📷 Testing photo insert...');
    const { error: photoError } = await supabase
      .from('restaurant_photos')
      .insert({
        restaurant_id: restaurant.id,
        image_url: 'https://example.com/test-photo.jpg',
        thumbnail_url: 'https://example.com/test-photo-thumb.jpg',
        file_path: 'test-photos/test-photo.jpg',
        uploaded_by: null // You can set this to a user ID if needed
      });
    
    if (photoError) {
      console.error('❌ Error inserting photo:', photoError);
    } else {
      console.log('✅ Photo inserted successfully - check the UI for real-time update!');
    }
    
    console.log('\n🎉 Photo test completed! Check your app to see the real-time photo update.');
    
  } catch (error) {
    console.error('❌ Unexpected error in photo test:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting real-time update tests...\n');
  
  await testRestaurantUpdates();
  await testPhotoUpdates();
  
  console.log('\n✨ All tests completed!');
  console.log('📱 Open your app and navigate to the restaurant detail page to see the real-time updates in action.');
}

// Check if we have the required environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('⚠️  Warning: Supabase environment variables not found.');
  console.log('   Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   or update the script with your actual Supabase credentials.');
}

runTests().catch(console.error);
