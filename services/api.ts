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

// Aggregate restaurant data from multiple sources
export const aggregateRestaurantData = async (query: string, location: string) => {
  try {
    console.log(`Searching for restaurants: ${query} in ${location}`);
    
    // Search all APIs in parallel
    const [googleResults, yelpResults, tripAdvisorResults] = await Promise.all([
      searchGooglePlaces(query, location),
      searchYelp(query, location),
      searchTripAdvisor(query, location)
    ]);
    
    console.log('API Results:', { googleResults: googleResults.length, yelpResults: yelpResults.length, tripAdvisorResults: tripAdvisorResults.length });
    
    // Combine and deduplicate results
    const combinedResults = [];
    const seenNames = new Set();
    
    // Process Google Places results
    for (const place of googleResults.slice(0, 10)) {
      const normalizedName = place.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        
        const reviews = place.reviews?.map((r: any) => r.text) || [];
        const [description, vibeTags, fallbackImage] = await Promise.all([
          generateRestaurantDescription(reviews, place.name),
          generateVibeTags(reviews, place.types?.[0] || 'restaurant'),
          place.photos?.length ? null : getUnsplashImage(`${place.name} restaurant food`)
        ]);
        
        combinedResults.push({
          id: place.place_id || `google_${Date.now()}_${Math.random()}`,
          name: place.name,
          cuisine: place.types?.[0]?.replace(/_/g, ' ') || 'Restaurant',
          rating: place.rating || 4.0,
          priceLevel: place.price_level || 2,
          address: place.formatted_address || place.vicinity,
          phone: place.formatted_phone_number,
          website: place.website,
          photos: place.photos?.map((p: any) => p.photo_reference) || [fallbackImage].filter(Boolean),
          reviews: reviews.slice(0, 5),
          description,
          vibeTags,
          topPicks: [],
          source: 'google',
          location: place.geometry?.location
        });
      }
    }
    
    // Process Yelp results
    for (const business of yelpResults.slice(0, 10)) {
      const normalizedName = business.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        
        const reviews = business.reviews?.map((r: any) => r.text) || [];
        const [description, vibeTags, topPicks, fallbackImage] = await Promise.all([
          generateRestaurantDescription(reviews, business.name),
          generateVibeTags(reviews, business.categories?.[0]?.title || 'restaurant'),
          generateTopPicks([], reviews),
          business.photos?.length ? null : getUnsplashImage(`${business.name} restaurant food`)
        ]);
        
        combinedResults.push({
          id: business.id || `yelp_${Date.now()}_${Math.random()}`,
          name: business.name,
          cuisine: business.categories?.[0]?.title || 'Restaurant',
          rating: business.rating || 4.0,
          priceLevel: business.price?.length || 2,
          address: business.location?.display_address?.join(', '),
          phone: business.phone,
          website: business.url,
          photos: business.photos || [fallbackImage].filter(Boolean),
          reviews: reviews.slice(0, 5),
          description,
          vibeTags,
          topPicks,
          source: 'yelp',
          location: business.coordinates
        });
      }
    }
    
    // Process TripAdvisor results
    for (const restaurant of tripAdvisorResults.slice(0, 10)) {
      const normalizedName = restaurant.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        
        const reviews = restaurant.reviews?.map((r: any) => r.text) || [];
        const [description, vibeTags, fallbackImage] = await Promise.all([
          generateRestaurantDescription(reviews, restaurant.name),
          generateVibeTags(reviews, restaurant.cuisine?.[0]?.name || 'restaurant'),
          restaurant.photos?.length ? null : getUnsplashImage(`${restaurant.name} restaurant food`)
        ]);
        
        combinedResults.push({
          id: restaurant.location_id || `tripadvisor_${Date.now()}_${Math.random()}`,
          name: restaurant.name,
          cuisine: restaurant.cuisine?.[0]?.name || 'Restaurant',
          rating: parseFloat(restaurant.rating) || 4.0,
          priceLevel: restaurant.price_level?.length || 2,
          address: restaurant.address,
          phone: restaurant.phone,
          website: restaurant.website,
          photos: restaurant.photos?.map((p: any) => p.images?.large?.url) || [fallbackImage].filter(Boolean),
          reviews: reviews.slice(0, 5),
          description,
          vibeTags,
          topPicks: [],
          source: 'tripadvisor',
          location: { lat: restaurant.latitude, lng: restaurant.longitude }
        });
      }
    }
    
    console.log(`Aggregated ${combinedResults.length} unique restaurants`);
    return combinedResults;
  } catch (error) {
    console.error('Error aggregating restaurant data:', error);
    return [];
  }
};