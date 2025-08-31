const XLSX = require('xlsx');
const fs = require('fs');

// Helper function to clean business names
function cleanBusinessName(name) {
  if (!name) return '';
  
  // Convert to string if it's not already
  let cleaned = String(name);
  
  // Remove common business suffixes
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
  
  // Clean up extra spaces and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/[,\s]+$/, ''); // Remove trailing commas and spaces
  
  return cleaned;
}

// Helper function to merge address columns
function mergeAddress(building, street, city, zipcode) {
  const parts = [building, street, city, zipcode].filter(part => part && part.toString().trim());
  return parts.join(', ');
}

// Helper function to guess neighborhood from address
function guessNeighborhood(address, existingNeighborhood) {
  if (existingNeighborhood && existingNeighborhood.trim()) {
    return existingNeighborhood;
  }
  
  if (!address) return '';
  
  const addr = address.toLowerCase();
  
  // NYC Neighborhoods
  if (addr.includes('manhattan') || addr.includes('midtown') || addr.includes('upper east') || addr.includes('upper west')) return 'Manhattan';
  if (addr.includes('brooklyn') || addr.includes('williamsburg') || addr.includes('bushwick') || addr.includes('dumbo')) return 'Brooklyn';
  if (addr.includes('queens') || addr.includes('astoria') || addr.includes('long island city')) return 'Queens';
  if (addr.includes('bronx')) return 'Bronx';
  if (addr.includes('staten island')) return 'Staten Island';
  
  // Specific neighborhoods
  if (addr.includes('soho') || addr.includes('noho')) return 'SoHo';
  if (addr.includes('chelsea')) return 'Chelsea';
  if (addr.includes('greenwich village') || addr.includes('west village')) return 'Greenwich Village';
  if (addr.includes('east village')) return 'East Village';
  if (addr.includes('lower east side')) return 'Lower East Side';
  if (addr.includes('flatiron') || addr.includes('gramercy')) return 'Flatiron District';
  if (addr.includes('union square')) return 'Union Square';
  if (addr.includes('times square')) return 'Times Square';
  if (addr.includes('harlem')) return 'Harlem';
  if (addr.includes('upper east side')) return 'Upper East Side';
  if (addr.includes('upper west side')) return 'Upper West Side';
  if (addr.includes('midtown east') || addr.includes('midtown west')) return 'Midtown';
  if (addr.includes('financial district') || addr.includes('wall street')) return 'Financial District';
  if (addr.includes('tribeca')) return 'TriBeCa';
  if (addr.includes('chinatown')) return 'Chinatown';
  if (addr.includes('little italy')) return 'Little Italy';
  
  return 'Unknown';
}

// Helper function to guess cuisine from restaurant name
function guessCuisine(restaurantName, existingCuisine) {
  if (existingCuisine && existingCuisine.trim()) {
    return existingCuisine;
  }
  
  if (!restaurantName) return 'International';
  
  const name = restaurantName.toLowerCase();
  
  // Italian
  if (name.includes('pizza') || name.includes('pasta') || name.includes('italian') || 
      name.includes('ristorante') || name.includes('trattoria') || name.includes('osteria')) {
    return 'Italian';
  }
  
  // Japanese
  if (name.includes('sushi') || name.includes('japanese') || name.includes('ramen') || 
      name.includes('izakaya') || name.includes('tempura') || name.includes('bento')) {
    return 'Japanese';
  }
  
  // Chinese
  if (name.includes('chinese') || name.includes('dim sum') || name.includes('wok') || 
      name.includes('noodle') || name.includes('dumpling')) {
    return 'Chinese';
  }
  
  // Mexican
  if (name.includes('taco') || name.includes('mexican') || name.includes('burrito') || 
      name.includes('enchilada') || name.includes('quesadilla')) {
    return 'Mexican';
  }
  
  // American
  if (name.includes('burger') || name.includes('american') || name.includes('diner') || 
      name.includes('grill') || name.includes('steakhouse') || name.includes('bbq')) {
    return 'American';
  }
  
  // Thai
  if (name.includes('thai') || name.includes('pad thai') || name.includes('curry')) {
    return 'Thai';
  }
  
  // Indian
  if (name.includes('indian') || name.includes('curry') || name.includes('tandoori')) {
    return 'Indian';
  }
  
  // French
  if (name.includes('french') || name.includes('bistro') || name.includes('brasserie')) {
    return 'French';
  }
  
  // Mediterranean
  if (name.includes('mediterranean') || name.includes('greek') || name.includes('lebanese')) {
    return 'Mediterranean';
  }
  
  // Korean
  if (name.includes('korean') || name.includes('bbq') || name.includes('bibimbap')) {
    return 'Korean';
  }
  
  // Vietnamese
  if (name.includes('vietnamese') || name.includes('pho') || name.includes('banh mi')) {
    return 'Vietnamese';
  }
  
  // Seafood
  if (name.includes('seafood') || name.includes('fish') || name.includes('oyster')) {
    return 'Seafood';
  }
  
  return 'International';
}

// Helper function to guess price range
function guessPriceRange(restaurantName, address, existingPriceRange) {
  if (existingPriceRange && existingPriceRange.trim()) {
    return existingPriceRange;
  }
  
  if (!restaurantName) return '$$';
  
  const name = restaurantName.toLowerCase();
  const addr = address ? address.toLowerCase() : '';
  
  // Expensive indicators
  if (name.includes('steakhouse') || name.includes('fine dining') || 
      name.includes('luxury') || name.includes('exclusive') || 
      addr.includes('park avenue') || addr.includes('madison avenue')) {
    return '$$$$';
  }
  
  // Mid-high range
  if (name.includes('bistro') || name.includes('cafe') || name.includes('grill') ||
      name.includes('restaurant') || name.includes('kitchen')) {
    return '$$$';
  }
  
  // Mid range
  if (name.includes('diner') || name.includes('pizza') || name.includes('bar') ||
      addr.includes('street') || addr.includes('avenue')) {
    return '$$';
  }
  
  // Budget
  if (name.includes('fast food') || name.includes('takeout') || 
      name.includes('delivery') || name.includes('food truck')) {
    return '$';
  }
  
  return '$$'; // Default
}

// Helper function to get restaurant data from APIs
async function getRestaurantData(restaurantName, address) {
  const searchQuery = `${restaurantName} ${address}`;
  
  try {
    // Try to get data from Google Places API (if available)
    if (process.env.GOOGLE_API_KEY) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        return {
          rating: place.rating || null,
          website: place.website || null,
          phone: place.formatted_phone_number || null
        };
      }
    }
  } catch (error) {
    console.error(`Error getting data for ${restaurantName}:`, error);
  }
  
  return {
    rating: null,
    website: null,
    phone: null
  };
}

// Main function to update spreadsheet
async function updateRestaurantSpreadsheet(inputFilePath, outputFilePath) {
  console.log('🔄 Updating restaurant spreadsheet...');
  
  try {
    // Read the spreadsheet
    const workbook = XLSX.readFile(inputFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const restaurants = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Processing ${restaurants.length} restaurants...`);
    
    const updatedRestaurants = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      // Skip rows with 0 coordinates (Column O-P check)
      if (restaurant['Latitude'] === 0 || restaurant['Longitude'] === 0) {
        skippedCount++;
        if (skippedCount % 1000 === 0) {
          console.log(`⏭️ Skipped ${skippedCount} rows with 0 coordinates`);
        }
        continue;
      }
      
      try {
        // 1. Clean business name (Column A - DBA)
        const cleanedName = cleanBusinessName(restaurant['DBA'] || restaurant.DBA || '');
        
        // 2. Merge address columns (Column C-E - BUILDING, STREET, City, ZIPCODE)
        const fullAddress = mergeAddress(
          restaurant['BUILDING'] || restaurant.BUILDING,
          restaurant['STREET'] || restaurant.STREET,
          restaurant['City'] || restaurant.City,
          restaurant['ZIPCODE'] || restaurant.ZIPCODE
        );
        
        // 3. Guess neighborhood (Column G)
        const neighborhood = guessNeighborhood(fullAddress, restaurant['Neighborhood'] || restaurant.Neighborhood);
        
        // 4. Guess cuisine if empty (Column H)
        const cuisine = guessCuisine(cleanedName, restaurant['Cuisine'] || restaurant.Cuisine);
        
        // 5. Guess price range (Column I)
        const priceRange = guessPriceRange(cleanedName, fullAddress, restaurant['Price Range'] || restaurant['Price Range']);
        
        // 6. Get rating (Column J)
        let rating = restaurant['Rating'] || restaurant.Rating;
        if (!rating) {
          const apiData = await getRestaurantData(cleanedName, fullAddress);
          rating = apiData.rating || 4.0; // Default rating
        }
        
        // 7. Get website (Column K)
        let website = restaurant['Website'] || restaurant.Website;
        if (!website) {
          const apiData = await getRestaurantData(cleanedName, fullAddress);
          website = apiData.website || '';
        }
        
        // 8. Get description (Column L)
        const description = restaurant['Description'] || restaurant.Description || 
          `${cleanedName} offers delicious ${cuisine} cuisine in ${neighborhood}.`;
        
        // 9. Get hours (Column M)
        const hours = restaurant['Hours'] || restaurant.Hours || 
          'Mon-Sun: 11:00 AM - 10:00 PM';
        
        // 10. Get menu highlights (Column N)
        const menuHighlights = restaurant['Menu Highlights'] || restaurant['Menu Highlights'] || 
          getDefaultMenuHighlights(cuisine);
        
        // Create updated restaurant object
        const updatedRestaurant = {
          Name: cleanedName,
          Address: fullAddress,
          Phone: restaurant['PHONE'] || restaurant.PHONE || '',
          Neighborhood: neighborhood,
          Cuisine: cuisine,
          'Price Range': priceRange,
          Rating: rating,
          Website: website,
          Description: description,
          Hours: hours,
          'Menu Highlights': menuHighlights,
          Latitude: restaurant['Latitude'] || restaurant.Latitude,
          Longitude: restaurant['Longitude'] || restaurant.Longitude
        };
        
        updatedRestaurants.push(updatedRestaurant);
        processedCount++;
        
        if (processedCount % 100 === 0) {
          console.log(`✅ Processed ${processedCount} restaurants...`);
        }
        
        // Rate limiting for API calls
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Error processing restaurant ${i + 1}:`, error);
        continue;
      }
    }
    
    // Create new workbook with updated data
    const newWorksheet = XLSX.utils.json_to_sheet(updatedRestaurants);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Restaurants');
    
    // Write to output file
    XLSX.writeFile(newWorkbook, outputFilePath);
    
    console.log(`🎉 Successfully updated ${processedCount} restaurants!`);
    console.log(`⏭️ Skipped ${skippedCount} restaurants with 0 coordinates`);
    console.log(`📁 Output saved to: ${outputFilePath}`);
    
  } catch (error) {
    console.error('❌ Error updating spreadsheet:', error);
  }
}

// Helper function to get default menu highlights based on cuisine
function getDefaultMenuHighlights(cuisine) {
  const highlights = {
    'Italian': 'Margherita Pizza, Spaghetti Carbonara, Tiramisu',
    'Japanese': 'Sushi Roll, Ramen, Miso Soup',
    'Chinese': 'Kung Pao Chicken, Dim Sum, Fried Rice',
    'Mexican': 'Tacos, Guacamole, Margaritas',
    'American': 'Burger, Fries, Milkshake',
    'Thai': 'Pad Thai, Green Curry, Tom Yum Soup',
    'Indian': 'Butter Chicken, Naan, Samosas',
    'French': 'Croissant, Coq au Vin, Crème Brûlée',
    'Mediterranean': 'Hummus, Falafel, Greek Salad',
    'Korean': 'Bibimbap, Korean BBQ, Kimchi',
    'Vietnamese': 'Pho, Banh Mi, Spring Rolls',
    'Seafood': 'Lobster Roll, Grilled Salmon, Clam Chowder'
  };
  
  return highlights[cuisine] || 'Signature Dish, Popular Item, House Special';
}

// Usage
if (require.main === module) {
  const inputFile = process.argv[2] || 'list.xlsx';
  const outputFile = process.argv[3] || 'list-updated.xlsx';
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    console.log('Usage: node update-restaurant-spreadsheet.js [input-file] [output-file]');
    process.exit(1);
  }
  
  updateRestaurantSpreadsheet(inputFile, outputFile);
}

module.exports = {
  updateRestaurantSpreadsheet,
  cleanBusinessName,
  mergeAddress,
  guessNeighborhood,
  guessCuisine,
  guessPriceRange
};
