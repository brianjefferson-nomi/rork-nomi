const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the local search function
async function testLocalSearch(query, limit = 20) {
  try {
    console.log(`🔍 Testing local search for: "${query}"`);
    
    // Get restaurants from database
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching restaurants:', error);
      return [];
    }
    
    console.log(`📊 Total restaurants in database: ${restaurants?.length || 0}`);
    
    if (!restaurants || restaurants.length === 0) {
      console.log('❌ No restaurants found in database');
      return [];
    }
    
    // Show first few restaurants
    console.log('🍽️ First 5 restaurants:');
    restaurants.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.cuisine}) - ⭐ ${r.rating}`);
    });
    
    // Filter restaurants based on query
    const queryLower = query.toLowerCase();
    const filteredRestaurants = restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(queryLower) ||
      restaurant.cuisine.toLowerCase().includes(queryLower) ||
      restaurant.neighborhood.toLowerCase().includes(queryLower) ||
      restaurant.address.toLowerCase().includes(queryLower)
    );
    
    console.log(`\n✅ Found ${filteredRestaurants.length} restaurants matching "${query}"`);
    
    if (filteredRestaurants.length > 0) {
      console.log('🎯 Matching restaurants:');
      filteredRestaurants.slice(0, limit).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name} (${r.cuisine}) - ⭐ ${r.rating} - ${r.neighborhood}`);
      });
    }
    
    return filteredRestaurants.slice(0, limit);
  } catch (error) {
    console.error('❌ Error in local search:', error);
    return [];
  }
}

async function runTests() {
  console.log('🧪 Testing Local Search Function\n');
  
  const testQueries = [
    'pizza',
    'sushi',
    'burger',
    'taco',
    'thai',
    'italian',
    'japanese',
    'mexican',
    'american'
  ];
  
  for (const query of testQueries) {
    console.log('='.repeat(50));
    await testLocalSearch(query, 5);
    console.log('');
  }
  
  console.log('✅ Local search test completed!');
}

runTests();
