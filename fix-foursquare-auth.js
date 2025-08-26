// =====================================================
// FIX FOURSQUARE AUTHORIZATION HEADERS
// =====================================================

const fs = require('fs');

// Fix test-foursquare-api.js
const testFoursquareContent = fs.readFileSync('test-foursquare-api.js', 'utf8');
const fixedTestFoursquare = testFoursquareContent.replace(
  /'Authorization': FOURSQUARE_API_KEY/g,
  "'Authorization': `Bearer ${FOURSQUARE_API_KEY}`"
);
fs.writeFileSync('test-foursquare-api.js', fixedTestFoursquare);

// Fix test-nearby-restaurants.js
const testNearbyContent = fs.readFileSync('test-nearby-restaurants.js', 'utf8');
const fixedTestNearby = testNearbyContent.replace(
  /'Authorization': FOURSQUARE_API_KEY/g,
  "'Authorization': `Bearer ${FOURSQUARE_API_KEY}`"
);
fs.writeFileSync('test-nearby-restaurants.js', fixedTestNearby);

console.log('✅ Fixed Foursquare authorization headers in test files');
