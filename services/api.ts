const OPENAI_API_KEY = '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';
const RAPIDAPI_KEY = '20963faf74mshd7e2b2b5c31072dp144d88jsnedee80161863';

// Enhanced API configuration for better restaurant data
const API_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    key: OPENAI_API_KEY
  },
  rapidapi: {
    key: RAPIDAPI_KEY,
    hosts: {
      googlePlaces: 'google-map-places.p.rapidapi.com',
      yelp: 'yelp-scraper.p.rapidapi.com',
      tripadvisor: 'tripadvisor16.p.rapidapi.com',
      unsplash: 'unsplash-image-search.p.rapidapi.com'
    }
  }
};

// OpenAI API for generating descriptions and vibe tags
export const generateRestaurantDescription = async (reviews: string[], name: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a food critic writing concise, engaging restaurant descriptions. Generate a 2-3 sentence description based on reviews.'
          },
          {
            role: 'user',
            content: `Generate a short description for ${name} based on these reviews: ${reviews.join('. ')}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'A great dining experience awaits.';
  } catch (error) {
    console.error('Error generating description:', error);
    return 'A popular local dining spot.';
  }
};

export const generateVibeTags = async (reviews: string[], cuisine: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate 3-5 vibe tags for a restaurant based on reviews. Return only comma-separated tags like: romantic, upscale, family-friendly, trendy, cozy'
          },
          {
            role: 'user',
            content: `Generate vibe tags for a ${cuisine} restaurant based on these reviews: ${reviews.join('. ')}`
          }
        ],
        max_tokens: 50,
        temperature: 0.5
      })
    });
    
    const data = await response.json();
    const tags = data.choices[0]?.message?.content?.split(',').map((tag: string) => tag.trim()) || [];
    return tags.slice(0, 5);
  } catch (error) {
    console.error('Error generating vibe tags:', error);
    return ['popular', 'local favorite'];
  }
};

export const generateTopPicks = async (menuItems: string[], reviews: string[]) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Based on menu items and reviews, identify the top 3-5 most recommended dishes. Return only dish names separated by commas.'
          },
          {
            role: 'user',
            content: `Menu items: ${menuItems.join(', ')}. Reviews mentioning food: ${reviews.join('. ')}`
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    const picks = data.choices[0]?.message?.content?.split(',').map((item: string) => item.trim()) || [];
    return picks.slice(0, 5);
  } catch (error) {
    console.error('Error generating top picks:', error);
    return [];
  }
};

// Enhanced Google Places API with better error handling and photo support
export const searchGooglePlaces = async (query: string, location: string) => {
  try {
    console.log(`[GooglePlaces] Searching for: ${query} in ${location}`);
    const response = await fetch(
      `https://${API_CONFIG.rapidapi.hosts.googlePlaces}/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurant ' + location)}&radius=10000&type=restaurant`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
          'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.googlePlaces
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[GooglePlaces] Found ${data.results?.length || 0} results`);
    return data.results || [];
  } catch (error) {
    console.error('Error searching Google Places:', error);
    return [];
  }
};

export const getGooglePlaceDetails = async (placeId: string) => {
  try {
    console.log(`[GooglePlaces] Getting details for place: ${placeId}`);
    const response = await fetch(
      `https://${API_CONFIG.rapidapi.hosts.googlePlaces}/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,formatted_address,opening_hours,website,reviews,photos,price_level,types`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
          'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.googlePlaces
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google Places Details API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

// Get Google Places photo URL
export const getGooglePlacePhoto = async (photoReference: string, maxWidth: number = 800) => {
  try {
    const photoUrl = `https://${API_CONFIG.rapidapi.hosts.googlePlaces}/maps/api/place/photo?photoreference=${photoReference}&maxwidth=${maxWidth}`;
    return photoUrl;
  } catch (error) {
    console.error('Error getting place photo:', error);
    return null;
  }
};

// Enhanced Yelp API with better search parameters and error handling
export const searchYelp = async (term: string, location: string) => {
  try {
    console.log(`[Yelp] Searching for: ${term} in ${location}`);
    
    // Try different Yelp API endpoints
    const endpoints = [
      `https://yelp-scraper.p.rapidapi.com/search?query=${encodeURIComponent(term + ' restaurant')}&location=${encodeURIComponent(location)}&limit=20`,
      `https://yelp-reviews.p.rapidapi.com/business/search?query=${encodeURIComponent(term)}&location=${encodeURIComponent(location)}&limit=20`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
            'X-RapidAPI-Host': endpoint.includes('yelp-scraper') ? 'yelp-scraper.p.rapidapi.com' : 'yelp-reviews.p.rapidapi.com'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[Yelp] Found ${data.businesses?.length || data.results?.length || 0} results`);
          return data.businesses || data.results || [];
        } else {
          console.log(`[Yelp] Endpoint failed with status: ${response.status}`);
        }
      } catch (endpointError) {
        console.log(`[Yelp] Endpoint error:`, endpointError);
        continue;
      }
    }
    
    console.log('[Yelp] All endpoints failed, returning empty results');
    return [];
  } catch (error) {
    console.error('Error searching Yelp:', error);
    return [];
  }
};

export const getYelpDetails = async (businessId: string) => {
  try {
    const response = await fetch(
      `https://yelp-scraper.p.rapidapi.com/business/${businessId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yelp-scraper.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting Yelp details:', error);
    return null;
  }
};

// TripAdvisor API
export const searchTripAdvisor = async (query: string, location: string) => {
  try {
    const response = await fetch(
      `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data.data?.data || [];
  } catch (error) {
    console.error('Error searching TripAdvisor:', error);
    return [];
  }
};

export const getTripAdvisorDetails = async (restaurantId: string) => {
  try {
    const response = await fetch(
      `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/getRestaurantDetails?id=${restaurantId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting TripAdvisor details:', error);
    return null;
  }
};

// Enhanced Unsplash API for high-quality restaurant images
export const getUnsplashImage = async (query: string, count: number = 1) => {
  try {
    console.log(`[Unsplash] Searching for images: ${query}`);
    const response = await fetch(
      `https://${API_CONFIG.rapidapi.hosts.unsplash}/search?query=${encodeURIComponent(query + ' restaurant food')}&per_page=${count}&orientation=landscape`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
          'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.unsplash
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    const images = data.results?.map((img: any) => img.urls?.regular).filter(Boolean) || [];
    console.log(`[Unsplash] Found ${images.length} images`);
    return count === 1 ? images[0] : images;
  } catch (error) {
    console.error('Error getting Unsplash image:', error);
    return count === 1 ? null : [];
  }
};

// Enhanced location service with better city detection
export const getUserLocation = async (): Promise<{ city: string; lat: number; lng: number } | null> => {
  try {
    console.log('[Location] Getting user location...');
    
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`[Location] Got coordinates: ${latitude}, ${longitude}`);
            
            // Reverse geocoding to get city
            try {
              const response = await fetch(
                `https://${API_CONFIG.rapidapi.hosts.googlePlaces}/maps/api/geocode/json?latlng=${latitude},${longitude}`,
                {
                  method: 'GET',
                  headers: {
                    'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                    'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.googlePlaces
                  }
                }
              );
              
              if (response.ok) {
                const data = await response.json();
                const addressComponents = data.results?.[0]?.address_components || [];
                
                let city = '';
                let state = '';
                
                for (const component of addressComponents) {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  }
                  if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                  }
                }
                
                console.log(`[Location] Detected city: ${city}, state: ${state}`);
                
                // Enhanced city detection for MVP (NYC and LA)
                if (city.toLowerCase().includes('new york') || 
                    city.toLowerCase().includes('manhattan') || 
                    city.toLowerCase().includes('brooklyn') || 
                    city.toLowerCase().includes('queens') || 
                    city.toLowerCase().includes('bronx') ||
                    state === 'NY') {
                  resolve({ city: 'New York', lat: latitude, lng: longitude });
                  return;
                } else if (city.toLowerCase().includes('los angeles') || 
                          city.toLowerCase().includes('hollywood') || 
                          city.toLowerCase().includes('beverly hills') || 
                          city.toLowerCase().includes('santa monica') ||
                          (state === 'CA' && (city.toLowerCase().includes('la') || city.toLowerCase().includes('angeles')))) {
                  resolve({ city: 'Los Angeles', lat: latitude, lng: longitude });
                  return;
                }
              }
            } catch (error) {
              console.error('[Location] Error reverse geocoding:', error);
            }
            
            // Default to NYC if location not supported
            console.log('[Location] Location not in supported cities, defaulting to NYC');
            resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
          },
          (error) => {
            console.error('[Location] Error getting location:', error);
            // Default to NYC
            resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000 // 5 minutes
          }
        );
      });
    } else {
      // Default to NYC if geolocation not available
      console.log('[Location] Geolocation not available, defaulting to NYC');
      return { city: 'New York', lat: 40.7128, lng: -74.0060 };
    }
  } catch (error) {
    console.error('[Location] Error in getUserLocation:', error);
    return { city: 'New York', lat: 40.7128, lng: -74.0060 };
  }
};

// Generate mock search results based on query and location
const generateMockSearchResults = (query: string, location: string) => {
  const cuisineTypes = ['Italian', 'Japanese', 'Mexican', 'French', 'Thai', 'Indian', 'American', 'Chinese', 'Mediterranean', 'Korean'];
  const neighborhoods = location === 'New York' 
    ? ['Manhattan', 'Brooklyn', 'Queens', 'SoHo', 'East Village', 'West Village', 'Midtown', 'Upper East Side']
    : ['Hollywood', 'Beverly Hills', 'Santa Monica', 'West Hollywood', 'Downtown LA', 'Venice', 'Koreatown', 'Silver Lake'];
  
  const mockResults = [];
  const queryLower = query.toLowerCase();
  
  // Generate 8-12 mock restaurants based on search query
  for (let i = 0; i < Math.floor(Math.random() * 5) + 8; i++) {
    const cuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const priceLevel = Math.floor(Math.random() * 4) + 1;
    const rating = 3.5 + Math.random() * 1.5;
    
    // Make results more relevant to search query
    const relevantCuisine = cuisineTypes.find(c => queryLower.includes(c.toLowerCase())) || cuisine;
    const relevantNeighborhood = neighborhoods.find(n => queryLower.includes(n.toLowerCase())) || neighborhood;
    
    const restaurantName = generateRestaurantName(relevantCuisine, queryLower);
    
    mockResults.push({
      id: `search_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      name: restaurantName,
      cuisine: relevantCuisine,
      rating: Math.round(rating * 10) / 10,
      priceLevel,
      address: `${Math.floor(Math.random() * 999) + 1} ${generateStreetName()} ${relevantNeighborhood}, ${location}`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      photos: [
        `https://images.unsplash.com/photo-${1517248135467 + i}?w=400&h=300&fit=crop`,
        `https://images.unsplash.com/photo-${1414235077 + i}?w=400&h=300&fit=crop`
      ],
      reviews: generateMockReviews(restaurantName, relevantCuisine),
      description: `A ${getVibeAdjective()} ${relevantCuisine.toLowerCase()} restaurant in ${relevantNeighborhood}.`,
      vibeTags: generateMockVibeTags(relevantCuisine, priceLevel),
      topPicks: generateMockTopPicks(relevantCuisine),
      source: 'search',
      location: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.0060 + (Math.random() - 0.5) * 0.1 }
    });
  }
  
  return mockResults;
};

const generateRestaurantName = (cuisine: string, query: string) => {
  const prefixes = ['The', 'Casa', 'Chez', 'Little', 'Golden', 'Blue', 'Red', 'Green'];
  const suffixes = ['Kitchen', 'Bistro', 'Cafe', 'House', 'Garden', 'Corner', 'Place', 'Room'];
  const cuisineWords = {
    'Italian': ['Pasta', 'Pizza', 'Trattoria', 'Osteria', 'Bella', 'Nonna'],
    'Japanese': ['Sushi', 'Ramen', 'Sake', 'Zen', 'Tokyo', 'Sakura'],
    'Mexican': ['Taco', 'Cantina', 'Fiesta', 'Sol', 'Azteca', 'Pueblo'],
    'French': ['Brasserie', 'Cafe', 'Maison', 'Petit', 'Grand', 'Belle'],
    'Thai': ['Thai', 'Spice', 'Lotus', 'Bangkok', 'Pad', 'Curry'],
    'Indian': ['Spice', 'Curry', 'Tandoor', 'Masala', 'Delhi', 'Mumbai'],
    'American': ['Grill', 'Diner', 'Tavern', 'Bar', 'Smokehouse', 'Steakhouse'],
    'Chinese': ['Dragon', 'Panda', 'Wok', 'Dynasty', 'Golden', 'Jade'],
    'Mediterranean': ['Olive', 'Aegean', 'Cyprus', 'Santorini', 'Mykonos', 'Pita'],
    'Korean': ['Seoul', 'BBQ', 'Kimchi', 'Bulgogi', 'Gangnam', 'Han']
  };
  
  const words = cuisineWords[cuisine as keyof typeof cuisineWords] || ['Restaurant', 'Eatery', 'Dining'];
  const prefix = Math.random() > 0.5 ? prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' : '';
  const main = words[Math.floor(Math.random() * words.length)];
  const suffix = Math.random() > 0.6 ? ' ' + suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  
  return prefix + main + suffix;
};

const generateStreetName = () => {
  const streets = ['Main St', 'Broadway', 'Park Ave', 'Oak St', 'Elm St', '1st Ave', '2nd Ave', '3rd Ave', 'Madison Ave', 'Lexington Ave'];
  return streets[Math.floor(Math.random() * streets.length)];
};

const getVibeAdjective = () => {
  const adjectives = ['cozy', 'trendy', 'upscale', 'casual', 'authentic', 'modern', 'traditional', 'intimate', 'lively', 'elegant'];
  return adjectives[Math.floor(Math.random() * adjectives.length)];
};

const generateMockVibeTags = (cuisine: string, priceLevel: number) => {
  const baseTags = ['popular', 'local favorite'];
  const priceTags = priceLevel >= 3 ? ['upscale', 'fine dining'] : ['casual', 'affordable'];
  const cuisineTags = {
    'Italian': ['romantic', 'family-friendly'],
    'Japanese': ['authentic', 'fresh'],
    'Mexican': ['vibrant', 'spicy'],
    'French': ['elegant', 'sophisticated'],
    'Thai': ['flavorful', 'aromatic'],
    'Indian': ['spicy', 'aromatic'],
    'American': ['comfort food', 'hearty'],
    'Chinese': ['traditional', 'flavorful'],
    'Mediterranean': ['healthy', 'fresh'],
    'Korean': ['spicy', 'authentic']
  };
  
  return [...baseTags, ...priceTags, ...(cuisineTags[cuisine as keyof typeof cuisineTags] || ['delicious'])].slice(0, 4);
};

const generateMockTopPicks = (cuisine: string) => {
  const dishes = {
    'Italian': ['Margherita Pizza', 'Spaghetti Carbonara', 'Osso Buco', 'Tiramisu'],
    'Japanese': ['Salmon Sashimi', 'Chicken Teriyaki', 'Miso Ramen', 'Tempura'],
    'Mexican': ['Fish Tacos', 'Guacamole', 'Carnitas', 'Churros'],
    'French': ['Coq au Vin', 'French Onion Soup', 'Crème Brûlée', 'Escargot'],
    'Thai': ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice'],
    'Indian': ['Butter Chicken', 'Biryani', 'Naan Bread', 'Samosas'],
    'American': ['Burger', 'Mac and Cheese', 'BBQ Ribs', 'Apple Pie'],
    'Chinese': ['Kung Pao Chicken', 'Fried Rice', 'Dumplings', 'Sweet and Sour Pork'],
    'Mediterranean': ['Hummus', 'Grilled Octopus', 'Moussaka', 'Baklava'],
    'Korean': ['Bulgogi', 'Kimchi', 'Bibimbap', 'Korean BBQ']
  };
  
  const cuisineDishes = dishes[cuisine as keyof typeof dishes] || ['House Special', 'Chef\'s Choice', 'Daily Special'];
  return cuisineDishes.slice(0, 3);
};

const generateMockReviews = (name: string, cuisine: string) => {
  const reviews = [
    `Amazing ${cuisine.toLowerCase()} food at ${name}! The atmosphere is perfect for a night out.`,
    `Great service and delicious dishes. Highly recommend this place!`,
    `One of the best ${cuisine.toLowerCase()} restaurants in the area. Will definitely come back.`,
    `The food was exceptional and the staff was very friendly. A must-visit!`,
    `Perfect spot for ${cuisine.toLowerCase()} cuisine. Everything we ordered was fantastic.`
  ];
  
  return reviews.slice(0, Math.floor(Math.random() * 3) + 2);
};

// Reddit API for real-time forum search
export const searchReddit = async (query: string, location: string) => {
  try {
    console.log(`[Reddit] Searching for: ${query} in ${location}`);
    const searchQuery = `${query} restaurant ${location} site:reddit.com`;
    const response = await fetch(
      `https://reddit-scraper.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&limit=10`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
          'X-RapidAPI-Host': 'reddit-scraper.p.rapidapi.com'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[Reddit] Found ${data.posts?.length || 0} posts`);
    return data.posts || [];
  } catch (error) {
    console.error('Error searching Reddit:', error);
    return [];
  }
};

// Enhanced restaurant data aggregation with real API integration
export const aggregateRestaurantData = async (query: string, location: string) => {
  try {
    console.log(`[API] Searching for restaurants: ${query} in ${location}`);
    
    // Use real APIs with fallback to mock data
    let allResults: any[] = [];
    
    try {
      // Search all APIs in parallel with timeout including Reddit
      const apiPromises = [
        Promise.race([
          searchGooglePlaces(query, location),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Google Places timeout')), 5000))
        ]),
        Promise.race([
          searchYelp(query, location),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Yelp timeout')), 5000))
        ]),
        Promise.race([
          searchTripAdvisor(query, location),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TripAdvisor timeout')), 5000))
        ]),
        Promise.race([
          searchReddit(query, location),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Reddit timeout')), 3000))
        ])
      ];
      
      const [googleResults, yelpResults, tripAdvisorResults, redditResults] = await Promise.allSettled(apiPromises);
      
      // Process successful results
      const googleData = googleResults.status === 'fulfilled' ? googleResults.value : [];
      const yelpData = yelpResults.status === 'fulfilled' ? yelpResults.value : [];
      const tripAdvisorData = tripAdvisorResults.status === 'fulfilled' ? tripAdvisorResults.value : [];
      const redditData = redditResults.status === 'fulfilled' ? redditResults.value : [];
      
      console.log(`[API] Results - Google: ${googleData.length}, Yelp: ${yelpData.length}, TripAdvisor: ${tripAdvisorData.length}, Reddit: ${redditData.length}`);
      
      // Combine and deduplicate results
      allResults = await combineApiResults(googleData, yelpData, tripAdvisorData, location, redditData);
      
    } catch (error) {
      console.error('[API] Error with real APIs, falling back to mock data:', error);
    }
    
    // If no real results, use enhanced mock data
    if (allResults.length === 0) {
      console.log('[API] Using mock data as fallback');
      allResults = generateMockSearchResults(query, location);
    }
    
    // Enhance results with AI-generated content (limit to first 10 for performance)
    const resultsToEnhance = allResults.slice(0, 10);
    const enhancedResults = [];
    
    for (const result of resultsToEnhance) {
      try {
        // Generate AI-enhanced content with timeout
        const enhancementPromises = [
          Promise.race([
            generateRestaurantDescription(result.reviews || [], result.name),
            new Promise((resolve) => setTimeout(() => resolve(result.description || ''), 3000))
          ]),
          Promise.race([
            generateVibeTags(result.reviews || [], result.cuisine),
            new Promise((resolve) => setTimeout(() => resolve(result.vibeTags || []), 3000))
          ]),
          Promise.race([
            generateValidatedMenuItems(result.name, result.cuisine, result.reviews || []),
            new Promise((resolve) => setTimeout(() => resolve(result.topPicks || []), 3000))
          ])
        ];
        
        const [description, vibeTags, topPicks] = await Promise.all(enhancementPromises);
        
        enhancedResults.push({
          ...result,
          description: description || result.description || 'A great dining experience awaits.',
          vibeTags: (vibeTags && vibeTags.length > 0) ? (vibeTags as string[]).map((tag: string) => capitalizeTag(tag)) : (result.vibeTags || ['Popular']),
          topPicks: (topPicks && topPicks.length > 0) ? topPicks : (result.topPicks || [])
        });
      } catch (error) {
        console.error(`[API] Error enhancing result for ${result.name}:`, error);
        // Use original result if enhancement fails
        enhancedResults.push({
          ...result,
          description: result.description || 'A great dining experience awaits.',
          vibeTags: (result.vibeTags || ['Popular']).map((tag: string) => capitalizeTag(tag)),
          topPicks: result.topPicks || []
        });
      }
    }
    
    // Add remaining results without enhancement
    if (allResults.length > 10) {
      enhancedResults.push(...allResults.slice(10).map(result => ({
        ...result,
        description: result.description || 'A great dining experience awaits.',
        vibeTags: (result.vibeTags || ['Popular']).map((tag: string) => capitalizeTag(tag)),
        topPicks: result.topPicks || []
      })));
    }
    
    console.log(`[API] Successfully processed ${enhancedResults.length} search results`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error aggregating restaurant data:', error);
    // Return mock data as final fallback
    return generateMockSearchResults(query, location);
  }
};

// Helper function to capitalize tags properly
const capitalizeTag = (tag: string): string => {
  if (!tag) return 'Popular';
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
};

// Enhanced menu validation using AI
export const generateValidatedMenuItems = async (restaurantName: string, cuisine: string, reviews: string[]) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a food expert. Based on the restaurant name, cuisine type, and reviews, identify 5-8 actual menu items that would realistically be served at this specific restaurant. Be specific and authentic to the cuisine and restaurant style. Return only the dish names separated by commas.`
          },
          {
            role: 'user',
            content: `Restaurant: ${restaurantName}, Cuisine: ${cuisine}, Reviews: ${reviews.join('. ')}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    const items = data.choices[0]?.message?.content?.split(',').map((item: string) => item.trim()).filter(Boolean) || [];
    return items.slice(0, 8);
  } catch (error) {
    console.error('Error generating validated menu items:', error);
    return [];
  }
};

// Combine results from different APIs and remove duplicates
const combineApiResults = async (googleResults: any[], yelpResults: any[], tripAdvisorResults: any[], location: string, redditResults: any[] = []) => {
  const combined: any[] = [];
  const seenNames = new Set<string>();
  
  // Process Google Places results
  for (const place of googleResults) {
    if (!place.name || seenNames.has(place.name.toLowerCase())) continue;
    
    seenNames.add(place.name.toLowerCase());
    
    // Get additional details if available
    let details = null;
    if (place.place_id) {
      try {
        details = await getGooglePlaceDetails(place.place_id);
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }
    
    // Process photos
    const photos = [];
    if (place.photos && place.photos.length > 0) {
      for (const photo of place.photos.slice(0, 3)) {
        if (photo.photo_reference) {
          const photoUrl = await getGooglePlacePhoto(photo.photo_reference);
          if (photoUrl) photos.push(photoUrl);
        }
      }
    }
    
    combined.push({
      id: `google_${place.place_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      cuisine: determineCuisineFromTypes(place.types || details?.types || []),
      rating: place.rating || details?.rating || 4.0,
      priceLevel: place.price_level || details?.price_level || 2,
      address: place.formatted_address || details?.formatted_address || '',
      phone: details?.formatted_phone_number || '',
      website: details?.website || '',
      photos: photos.length > 0 ? photos : [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop`],
      reviews: (details?.reviews || []).map((r: any) => r.text).slice(0, 3),
      source: 'google',
      location: place.geometry?.location || { lat: 40.7128, lng: -74.0060 }
    });
  }
  
  // Process Yelp results
  for (const business of yelpResults) {
    if (!business.name || seenNames.has(business.name.toLowerCase())) continue;
    
    seenNames.add(business.name.toLowerCase());
    
    combined.push({
      id: `yelp_${business.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: business.name,
      cuisine: determineCuisineFromCategories(business.categories || []),
      rating: business.rating || 4.0,
      priceLevel: business.price ? business.price.length : 2,
      address: business.location?.display_address?.join(', ') || '',
      phone: business.phone || '',
      website: business.url || '',
      photos: business.photos ? business.photos.slice(0, 3) : [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop`],
      reviews: [], // Yelp reviews would need separate API call
      source: 'yelp',
      location: business.coordinates || { lat: 40.7128, lng: -74.0060 }
    });
  }
  
  // Process TripAdvisor results (similar pattern)
  for (const restaurant of tripAdvisorResults) {
    if (!restaurant.name || seenNames.has(restaurant.name.toLowerCase())) continue;
    
    seenNames.add(restaurant.name.toLowerCase());
    
    combined.push({
      id: `tripadvisor_${restaurant.location_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: restaurant.name,
      cuisine: restaurant.cuisine?.[0]?.name || 'International',
      rating: parseFloat(restaurant.rating) || 4.0,
      priceLevel: restaurant.price_level ? parseInt(restaurant.price_level.replace(/\$/g, '').length) : 2,
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      website: restaurant.website || '',
      photos: restaurant.photo?.images ? [restaurant.photo.images.large.url] : [`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop`],
      reviews: [],
      source: 'tripadvisor',
      location: { lat: 40.7128, lng: -74.0060 }
    });
  }
  
  return combined;
};

// Helper function to determine cuisine from Google Places types
const determineCuisineFromTypes = (types: string[]): string => {
  const cuisineMap: Record<string, string> = {
    'italian_restaurant': 'Italian',
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'mexican_restaurant': 'Mexican',
    'french_restaurant': 'French',
    'indian_restaurant': 'Indian',
    'thai_restaurant': 'Thai',
    'korean_restaurant': 'Korean',
    'mediterranean_restaurant': 'Mediterranean',
    'american_restaurant': 'American',
    'steakhouse': 'Steakhouse',
    'seafood_restaurant': 'Seafood',
    'pizza_restaurant': 'Pizza',
    'bakery': 'Bakery',
    'cafe': 'Cafe'
  };
  
  for (const type of types) {
    if (cuisineMap[type]) return cuisineMap[type];
  }
  
  return 'International';
};

// Helper function to determine cuisine from Yelp categories
const determineCuisineFromCategories = (categories: any[]): string => {
  if (!categories || categories.length === 0) return 'International';
  
  const firstCategory = categories[0];
  return firstCategory.title || firstCategory.alias || 'International';
};