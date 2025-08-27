const { searchRestaurantsWithAPI } = require('./services/api.ts');

async function testSearch() {
  console.log('Testing search API...');
  
  try {
    const results = await searchRestaurantsWithAPI('pizza', 'New York', 5);
    console.log('Search results:', results?.length || 0);
    console.log('First result:', results[0]);
  } catch (error) {
    console.error('Search test failed:', error);
  }
}

testSearch();
