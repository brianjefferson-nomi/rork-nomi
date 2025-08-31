const XLSX = require('xlsx');
const fs = require('fs');
require('dotenv').config();

// Helper function to clean business names
function cleanBusinessName(name) {
  if (!name) return '';
  
  let cleaned = String(name);
  
  const suffixes = [
    /\bcorp\b/gi, /\bcorporation\b/gi, /\binc\b/gi, /\bincorporated\b/gi,
    /\bllc\b/gi, /\blimited liability company\b/gi, /\bltd\b/gi, /\blimited\b/gi,
    /\bco\b/gi, /\bcompany\b/gi, /\bassoc\b/gi, /\bassociation\b/gi,
    /\bgrp\b/gi, /\bgroup\b/gi, /\bintl\b/gi, /\binternational\b/gi,
    /\busa\b/gi, /\bunited states\b/gi, /\bnyc\b/gi, /\bnew york\b/gi
  ];
  
  suffixes.forEach(suffix => {
    cleaned = cleaned.replace(suffix, '');
  });
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/[,\s]+$/, '');
  
  return cleaned;
}

// Helper function to merge address columns
function mergeAddress(building, street, city, zipcode) {
  const parts = [building, street, city, zipcode].filter(part => part && part.toString().trim());
  return parts.join(', ');
}

// Real API function to get restaurant data from Google Places API
async function getRealRestaurantData(restaurantName, address) {
  if (!process.env.GOOGLE_API_KEY) {
    console.log('⚠️ No Google API key found. Using fallback data.');
    return null;
  }

  const searchQuery = `${restaurantName} ${address}`;
  
  try {
    console.log(`🔍 Searching for: ${searchQuery}`);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const place = data.results[0];
      
      // Get detailed place information
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=rating,website,formatted_phone_number,opening_hours,reviews,price_level&key=${process.env.GOOGLE_API_KEY}`
      );
      
      let details = {};
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        if (detailsData.status === 'OK') {
          details = detailsData.result;
        }
      }
      
      return {
        rating: place.rating || details.rating || null,
        website: place.website || details.website || null,
        phone: place.formatted_phone_number || details.formatted_phone_number || null,
        priceLevel: place.price_level || details.price_level || null,
        openingHours: details.opening_hours?.weekday_text || null,
        reviews: place.reviews || details.reviews || null
      };
    }
  } catch (error) {
    console.error(`❌ Error getting data for ${restaurantName}:`, error.message);
  }
  
  return null;
}

// Real API function to get restaurant data from Yelp Fusion API
async function getYelpRestaurantData(restaurantName, address) {
  if (!process.env.YELP_API_KEY) {
    console.log('⚠️ No Yelp API key found. Skipping Yelp data.');
    return null;
  }

  try {
    const searchQuery = `${restaurantName} ${address}`;
    
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(restaurantName)}&location=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.businesses && data.businesses.length > 0) {
      const business = data.businesses[0];
      
      return {
        rating: business.rating || null,
        priceLevel: business.price ? business.price.length : null,
        categories: business.categories?.map(cat => cat.title) || [],
        phone: business.phone || null,
        website: business.url || null
      };
    }
  } catch (error) {
    console.error(`❌ Error getting Yelp data for ${restaurantName}:`, error.message);
  }
  
  return null;
}

// Function to convert price level to price range
function convertPriceLevel(priceLevel) {
  if (!priceLevel) return '$$';
  switch (priceLevel) {
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    case 4: return '$$$$';
    default: return '$$';
  }
}

// Function to get real neighborhood from coordinates using reverse geocoding
async function getRealNeighborhood(lat, lng) {
  if (!process.env.GOOGLE_API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      // Look for neighborhood in address components
      for (const component of result.address_components) {
        if (component.types.includes('sublocality') || 
            component.types.includes('neighborhood')) {
          return component.long_name;
        }
      }
    }
  } catch (error) {
    console.error('Error getting neighborhood:', error.message);
  }
  
  return null;
}

// Main function to update spreadsheet with real data
async function updateRestaurantSpreadsheetWithRealData(inputFilePath, outputFilePath) {
  console.log('🔄 Updating restaurant spreadsheet with REAL data...');
  
  try {
    const workbook = XLSX.readFile(inputFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const restaurants = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Processing ${restaurants.length} restaurants with real APIs...`);
    
    const updatedRestaurants = [];
    let processedCount = 0;
    let skippedCount = 0;
    let apiSuccessCount = 0;
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      // Skip rows with missing or invalid coordinates
      const lat = restaurant['Latitude'] || restaurant.Latitude;
      const lng = restaurant['Longitude'] || restaurant.Longitude;
      
      if (!lat || !lng || lat === 0 || lng === 0) {
        skippedCount++;
        continue;
      }
      
      try {
        const cleanedName = cleanBusinessName(restaurant['DBA'] || restaurant.DBA || '');
        const fullAddress = mergeAddress(
          restaurant['BUILDING'] || restaurant.BUILDING,
          restaurant['STREET'] || restaurant.STREET,
          restaurant['City'] || restaurant.City,
          restaurant['ZIPCODE'] || restaurant.ZIPCODE
        );
        
        console.log(`\n🍽️ Processing: ${cleanedName}`);
        
        // Get real data from APIs
        const googleData = await getRealRestaurantData(cleanedName, fullAddress);
        const yelpData = await getYelpRestaurantData(cleanedName, fullAddress);
        
                 // Get real neighborhood from coordinates
         const realNeighborhood = await getRealNeighborhood(lat, lng);
        
        // Combine data from multiple sources
        const combinedData = {
          rating: googleData?.rating || yelpData?.rating || restaurant['Rating'] || restaurant.Rating || 4.0,
          priceRange: convertPriceLevel(googleData?.priceLevel || yelpData?.priceLevel) || restaurant['Price Range'] || restaurant['Price Range'] || '$$',
          website: googleData?.website || yelpData?.website || restaurant['Website'] || restaurant.Website || '',
          phone: googleData?.phone || yelpData?.phone || restaurant['PHONE'] || restaurant.PHONE || '',
          neighborhood: realNeighborhood || restaurant['Neighborhood'] || restaurant.Neighborhood || 'Unknown',
          cuisine: yelpData?.categories?.[0] || restaurant['Cuisine'] || restaurant.Cuisine || 'International',
          hours: googleData?.openingHours?.join('; ') || restaurant['Hours'] || restaurant.Hours || 'Hours not available',
          description: restaurant['Description'] || restaurant.Description || `${cleanedName} offers delicious cuisine in ${realNeighborhood || 'the area'}.`
        };
        
        if (googleData || yelpData) {
          apiSuccessCount++;
        }
        
        const updatedRestaurant = {
          Name: cleanedName,
          Address: fullAddress,
          Phone: combinedData.phone,
          Neighborhood: combinedData.neighborhood,
          Cuisine: combinedData.cuisine,
          'Price Range': combinedData.priceRange,
          Rating: combinedData.rating,
          Website: combinedData.website,
          Description: combinedData.description,
          Hours: combinedData.hours,
          'Menu Highlights': restaurant['Menu Highlights'] || restaurant['Menu Highlights'] || 'Signature dishes available',
          Latitude: lat,
          Longitude: lng
        };
        
        updatedRestaurants.push(updatedRestaurant);
        processedCount++;
        
        if (processedCount % 10 === 0) {
          console.log(`✅ Processed ${processedCount} restaurants (${apiSuccessCount} with real API data)...`);
        }
        
        // Rate limiting for API calls (be respectful to APIs)
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error processing restaurant ${i + 1}:`, error.message);
        continue;
      }
    }
    
    // Create new workbook with updated data
    const newWorksheet = XLSX.utils.json_to_sheet(updatedRestaurants);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Restaurants');
    
    // Write to output file
    XLSX.writeFile(newWorkbook, outputFilePath);
    
    console.log(`\n🎉 Successfully updated ${processedCount} restaurants!`);
    console.log(`📊 ${apiSuccessCount} restaurants got real API data`);
    console.log(`⏭️ Skipped ${skippedCount} restaurants with 0 coordinates`);
    console.log(`📁 Output saved to: ${outputFilePath}`);
    
  } catch (error) {
    console.error('❌ Error updating spreadsheet:', error);
  }
}

// Usage
if (require.main === module) {
  const inputFile = process.argv[2] || 'list.xlsx';
  const outputFile = process.argv[3] || 'list-real-data.xlsx';
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    console.log('Usage: node update-restaurant-spreadsheet-real-data.js [input-file] [output-file]');
    console.log('\nRequired environment variables:');
    console.log('- GOOGLE_API_KEY: Google Places API key');
    console.log('- YELP_API_KEY: Yelp Fusion API key (optional)');
    process.exit(1);
  }
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY environment variable is required!');
    console.log('Please add your Google Places API key to your .env file');
    process.exit(1);
  }
  
  updateRestaurantSpreadsheetWithRealData(inputFile, outputFile);
}

module.exports = {
  updateRestaurantSpreadsheetWithRealData,
  getRealRestaurantData,
  getYelpRestaurantData
};
