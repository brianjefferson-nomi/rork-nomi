const OPENAI_API_KEY = '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';
const RAPIDAPI_KEY = '20963faf74mshd7e2b2b5c31072dp144d88jsnedee80161863';

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

// Google Places API
export const searchGooglePlaces = async (query: string, location: string) => {
  try {
    const response = await fetch(
      `https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' ' + location)}&radius=5000&type=restaurant`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'google-map-places.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching Google Places:', error);
    return [];
  }
};

export const getGooglePlaceDetails = async (placeId: string) => {
  try {
    const response = await fetch(
      `https://google-map-places.p.rapidapi.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,formatted_address,opening_hours,website,reviews,photos,price_level`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'google-map-places.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

// Yelp API
export const searchYelp = async (term: string, location: string) => {
  try {
    const response = await fetch(
      `https://yelp-scraper.p.rapidapi.com/search?query=${encodeURIComponent(term)}&location=${encodeURIComponent(location)}&limit=20`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yelp-scraper.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data.businesses || [];
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

// Unsplash API for fallback images
export const getUnsplashImage = async (query: string) => {
  try {
    const response = await fetch(
      `https://unsplash-image-search.p.rapidapi.com/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'unsplash-image-search.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (error) {
    console.error('Error getting Unsplash image:', error);
    return null;
  }
};

// Location service to determine user's city
export const getUserLocation = async (): Promise<{ city: string; lat: number; lng: number } | null> => {
  try {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get city
            try {
              const response = await fetch(
                `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?latlng=${latitude},${longitude}`,
                {
                  method: 'GET',
                  headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'google-map-places.p.rapidapi.com'
                  }
                }
              );
              
              const data = await response.json();
              const addressComponents = data.results?.[0]?.address_components || [];
              
              let city = '';
              for (const component of addressComponents) {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                  break;
                }
              }
              
              // Restrict to NYC and LA for MVP
              if (city.toLowerCase().includes('new york') || city.toLowerCase().includes('manhattan') || city.toLowerCase().includes('brooklyn') || city.toLowerCase().includes('queens') || city.toLowerCase().includes('bronx')) {
                resolve({ city: 'New York', lat: latitude, lng: longitude });
              } else if (city.toLowerCase().includes('los angeles') || city.toLowerCase().includes('hollywood') || city.toLowerCase().includes('beverly hills') || city.toLowerCase().includes('santa monica')) {
                resolve({ city: 'Los Angeles', lat: latitude, lng: longitude });
              } else {
                // Default to NYC if not in supported cities
                resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error);
              resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            // Default to NYC
            resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
          }
        );
      });
    } else {
      // Default to NYC if geolocation not available
      return { city: 'New York', lat: 40.7128, lng: -74.0060 };
    }
  } catch (error) {
    console.error('Error in getUserLocation:', error);
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

// Aggregate restaurant data from multiple sources
export const aggregateRestaurantData = async (query: string, location: string) => {
  try {
    console.log(`Searching for restaurants: ${query} in ${location}`);
    
    // For now, use mock data while APIs are being configured
    // In production, you would uncomment the API calls below
    
    /*
    // Search all APIs in parallel
    const [googleResults, yelpResults, tripAdvisorResults] = await Promise.all([
      searchGooglePlaces(query, location),
      searchYelp(query, location),
      searchTripAdvisor(query, location)
    ]);
    
    console.log('API Results:', { googleResults: googleResults.length, yelpResults: yelpResults.length, tripAdvisorResults: tripAdvisorResults.length });
    */
    
    // Generate mock results for demonstration
    const mockResults = generateMockSearchResults(query, location);
    console.log(`Generated ${mockResults.length} mock search results`);
    
    // Process and enhance results with AI-generated content
    const enhancedResults = [];
    
    for (const result of mockResults) {
      try {
        // Generate AI-enhanced content
        const [description, vibeTags, topPicks] = await Promise.all([
          generateRestaurantDescription(result.reviews, result.name),
          generateVibeTags(result.reviews, result.cuisine),
          generateTopPicks([], result.reviews)
        ]);
        
        enhancedResults.push({
          ...result,
          description: description || result.description,
          vibeTags: vibeTags.length > 0 ? vibeTags : result.vibeTags,
          topPicks: topPicks.length > 0 ? topPicks : result.topPicks
        });
      } catch (error) {
        console.error(`Error enhancing result for ${result.name}:`, error);
        // Use original result if enhancement fails
        enhancedResults.push(result);
      }
    }
    
    console.log(`Successfully processed ${enhancedResults.length} search results`);
    return enhancedResults;
  } catch (error) {
    console.error('Error aggregating restaurant data:', error);
    // Return mock data as fallback
    return generateMockSearchResults(query, location);
  }
};