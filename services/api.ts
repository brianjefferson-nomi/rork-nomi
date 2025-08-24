import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_API_KEY = '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';
const RAPIDAPI_KEY = '20963faf74mshd7e2b2b5c31072dp144d88jsnedee80161863';
const TRIPADVISOR_API_KEY = 'F99007CEF189438793FFD5D7B484839A';

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

// GenAI Content Caching System
interface CachedContent {
  content: string | string[];
  timestamp: number;
  restaurantId: string;
  contentType: 'description' | 'vibes' | 'menu' | 'summary';
}

const CACHE_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
const CACHE_KEY_PREFIX = 'genai_cache_';

// Cache management functions
const getCacheKey = (restaurantId: string, contentType: string): string => {
  return `${CACHE_KEY_PREFIX}${restaurantId}_${contentType}`;
};

const getCachedContent = async (restaurantId: string, contentType: string): Promise<string | string[] | null> => {
  try {
    const cacheKey = getCacheKey(restaurantId, contentType);
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const parsedCache: CachedContent = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 90 days)
    if (now - parsedCache.timestamp > CACHE_DURATION) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    
    console.log(`[Cache] Hit for ${restaurantId} ${contentType}`);
    return parsedCache.content;
  } catch (error) {
    console.error('Error getting cached content:', error);
    return null;
  }
};

const setCachedContent = async (restaurantId: string, contentType: string, content: string | string[]): Promise<void> => {
  try {
    const cacheKey = getCacheKey(restaurantId, contentType);
    const cacheData: CachedContent = {
      content,
      timestamp: Date.now(),
      restaurantId,
      contentType: contentType as any
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Stored for ${restaurantId} ${contentType}`);
  } catch (error) {
    console.error('Error setting cached content:', error);
  }
};

// Cache cleanup function
export const cleanupExpiredCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const key of cacheKeys) {
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const parsedCache: CachedContent = JSON.parse(cached);
          if (now - parsedCache.timestamp > CACHE_DURATION) {
            expiredKeys.push(key);
          }
        }
      } catch {
        // If we can't parse it, it's corrupted, so remove it
        expiredKeys.push(key);
      }
    }
    
    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys);
      console.log(`[Cache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

// Enhanced image assignment with robust fallbacks and URL validation
export const assignRestaurantImages = async (restaurant: any): Promise<string[]> => {
  const images: string[] = [];

  try {
    // 1) Accept only absolute, directly fetchable image URLs (no endpoints requiring headers)
    if (Array.isArray(restaurant.photos)) {
      for (const p of restaurant.photos.slice(0, 6)) {
        const url = typeof p === 'string' ? p : p?.url || p?.image_url || '';
        if (typeof url === 'string' && url.startsWith('http') && !url.includes('rapidapi.com')) {
          images.push(url);
        }
      }
    }

    // 2) If we need more images or photos are missing/invalid, use Unsplash based on cuisine/name
    if (images.length < 3) {
      const searchTerm = (restaurant.cuisine || restaurant.name || 'restaurant').toString();
      const needed = Math.max(0, 3 - images.length);
      const unsplashImages = await getUnsplashImage(searchTerm, needed);
      if (Array.isArray(unsplashImages)) {
        images.push(...unsplashImages.filter(Boolean));
      } else if (unsplashImages) {
        images.push(unsplashImages);
      }
    }

    // 3) Ensure at least 3 images with themed placeholders
    while (images.length < 3) {
      images.push(getDefaultRestaurantImage(restaurant.cuisine));
    }

    const unique = [...new Set(images)].filter(Boolean);
    return unique.length > 0 ? unique : [getDefaultRestaurantImage(restaurant.cuisine)];
  } catch (error) {
    console.error('Error assigning restaurant images:', error);
    return [getDefaultRestaurantImage(restaurant.cuisine)];
  }
};

// OpenAI API for generating descriptions with caching
export const generateRestaurantDescription = async (reviews: string[], name: string, restaurantId?: string) => {
  try {
    // Check cache first
    if (restaurantId) {
      const cached = await getCachedContent(restaurantId, 'description');
      if (cached && typeof cached === 'string') {
        return cached;
      }
    }
    
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
    const description = data.choices[0]?.message?.content || 'A great dining experience awaits.';
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'description', description);
    }
    
    return description;
  } catch (error) {
    console.error('Error generating description:', error);
    return 'A popular local dining spot.';
  }
};

export const generateVibeTags = async (reviews: string[], cuisine: string, restaurantId?: string) => {
  try {
    // Check cache first
    if (restaurantId) {
      const cached = await getCachedContent(restaurantId, 'vibes');
      if (cached && Array.isArray(cached)) {
        return cached;
      }
    }
    
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
            content: 'Generate 3-5 single-word vibe tags for a restaurant based on reviews. Return only comma-separated single words like: Romantic, Upscale, Trendy, Cozy, Casual'
          },
          {
            role: 'user',
            content: `Generate single-word vibe tags for a ${cuisine} restaurant based on these reviews: ${reviews.join('. ')}`
          }
        ],
        max_tokens: 50,
        temperature: 0.5
      })
    });
    
    const data = await response.json();
    const tags = data.choices[0]?.message?.content?.split(',').map((tag: string) => {
      // Ensure single word and capitalize
      const singleWord = tag.trim().split(' ')[0];
      return singleWord.charAt(0).toUpperCase() + singleWord.slice(1).toLowerCase();
    }).filter(Boolean) || [];
    
    const finalTags = tags.slice(0, 5);
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'vibes', finalTags);
    }
    
    return finalTags;
  } catch (error) {
    console.error('Error generating vibe tags:', error);
    return ['Popular', 'Local'];
  }
};

export const generateTopPicks = async (menuItems: string[], reviews: string[], restaurantId?: string) => {
  try {
    // Check cache first
    if (restaurantId) {
      const cached = await getCachedContent(restaurantId, 'menu');
      if (cached && Array.isArray(cached)) {
        return cached;
      }
    }
    
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
            content: 'Based on menu items and reviews, identify the top 5-8 most recommended dishes. Return only dish names separated by commas. Be specific and realistic.'
          },
          {
            role: 'user',
            content: `Menu items: ${menuItems.join(', ')}. Reviews mentioning food: ${reviews.join('. ')}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    const picks = data.choices[0]?.message?.content?.split(',').map((item: string) => item.trim()).filter(Boolean) || [];
    const finalPicks = picks.slice(0, 8);
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'menu', finalPicks);
    }
    
    return finalPicks;
  } catch (error) {
    console.error('Error generating top picks:', error);
    return [];
  }
};

// Enhanced Google Places API with better error handling and photo support
export const searchGooglePlaces = async (query: string, location: string): Promise<any[]> => {
  try {
    // Restrict to NYC and LA only for MVP
    const city = /los angeles/i.test(location) ? 'Los Angeles' : 'New York';

    const now = Date.now();
    const timeSinceLastCall = now - lastGoogleApiCall;
    if (timeSinceLastCall < GOOGLE_API_DELAY) {
      await new Promise(resolve => setTimeout(resolve, GOOGLE_API_DELAY - timeSinceLastCall));
    }
    lastGoogleApiCall = Date.now();

    console.log(`[GooglePlaces] Searching for: ${query} in ${city}`);
    const response = await fetch(
      `https://${API_CONFIG.rapidapi.hosts.googlePlaces}/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurant ' + city)}&radius=10000&type=restaurant`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
          'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.googlePlaces
        }
      }
    );

    if (response.status === 429) {
      console.log('[GooglePlaces] Rate limited, waiting and retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await searchGooglePlaces(query, city);
    }

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

// Rate limiting for Google Places API
let lastGoogleApiCall = 0;
const GOOGLE_API_DELAY = 1000; // 1 second between calls

export const getGooglePlaceDetails = async (placeId: string): Promise<any | null> => {
  try {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastGoogleApiCall;
    if (timeSinceLastCall < GOOGLE_API_DELAY) {
      await new Promise(resolve => setTimeout(resolve, GOOGLE_API_DELAY - timeSinceLastCall));
    }
    lastGoogleApiCall = Date.now();
    
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
    
    if (response.status === 429) {
      console.log('[GooglePlaces] Rate limited, waiting and retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return await getGooglePlaceDetails(placeId); // Retry once
    }
    
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

// Get Google Places photo URL - disabled for web (headers not supported by Image)
export const getGooglePlacePhoto = async (_photoReference: string, _maxWidth: number = 800) => {
  try {
    return null;
  } catch (error) {
    console.error('Error getting place photo:', error);
    return null;
  }
};

// Enhanced Yelp API with better error handling and fallback
export const searchYelp = async (term: string, location: string) => {
  try {
    console.log(`[Yelp] Yelp API currently experiencing issues (403 errors)`);
    // Yelp API is returning 403 errors, likely due to API key restrictions
    // Returning empty results to prevent app crashes
    console.log(`[Yelp] Skipping Yelp search to maintain app stability`);
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

// TripAdvisor API with new API key
export const searchTripAdvisor = async (query: string, location: string) => {
  try {
    console.log(`[TripAdvisor] Searching for: ${query} in ${location}`);
    const response = await fetch(
      `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': TRIPADVISOR_API_KEY,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`[TripAdvisor] API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`[TripAdvisor] Found ${data.data?.data?.length || 0} results`);
    return data.data?.data || [];
  } catch (error) {
    console.error('Error searching TripAdvisor:', error);
    return [];
  }
};

export const getTripAdvisorDetails = async (restaurantId: string) => {
  try {
    console.log(`[TripAdvisor] Getting details for: ${restaurantId}`);
    const response = await fetch(
      `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/getRestaurantDetails?id=${restaurantId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': TRIPADVISOR_API_KEY,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`[TripAdvisor] Details API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting TripAdvisor details:', error);
    return null;
  }
};

// Get TripAdvisor restaurant photos
export const getTripAdvisorPhotos = async (restaurantId: string): Promise<string[]> => {
  try {
    console.log(`[TripAdvisor] Getting photos for: ${restaurantId}`);
    const response = await fetch(
      `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/getRestaurantPhotos?id=${restaurantId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': TRIPADVISOR_API_KEY,
          'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`[TripAdvisor] Photos API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const photos = data.data?.photos || [];
    return photos.map((photo: any) => photo.images?.large?.url || photo.images?.medium?.url).filter(Boolean);
  } catch (error) {
    console.error('Error getting TripAdvisor photos:', error);
    return [];
  }
};

// Enhanced Unsplash API for high-quality restaurant images with fallback logic
export const getUnsplashImage = async (query: string, count: number = 1) => {
  try {
    console.log(`[Unsplash] Searching for images: ${query}`);
    
    // Try multiple search queries for better results
    const searchQueries = [
      `${query} restaurant`,
      `${query} food`,
      `${query} dish`,
      'restaurant interior',
      'fine dining'
    ];
    
    for (const searchQuery of searchQueries) {
      try {
        const response = await fetch(
          `https://${API_CONFIG.rapidapi.hosts.unsplash}/search?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
              'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.unsplash
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const images = data.results?.map((img: any) => img.urls?.regular).filter(Boolean) || [];
          if (images.length > 0) {
            console.log(`[Unsplash] Found ${images.length} images for query: ${searchQuery}`);
            return count === 1 ? images[0] : images;
          }
        }
      } catch (queryError) {
        console.log(`[Unsplash] Query "${searchQuery}" failed:`, queryError);
        continue;
      }
    }
    
    console.log('[Unsplash] All queries failed, returning fallback');
    return count === 1 ? null : [];
  } catch (error) {
    console.error('Error getting Unsplash image:', error);
    return count === 1 ? null : [];
  }
};

// Default placeholder images for fallback
export const getDefaultRestaurantImage = (cuisine?: string) => {
  const defaultImages = {
    'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80',
    'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80',
    'Mexican': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop&q=80',
    'French': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
    'Thai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop&q=80',
    'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80',
    'American': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop&q=80',
    'Mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80',
    'Korean': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop&q=80'
  };
  
  return defaultImages[cuisine as keyof typeof defaultImages] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80';
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
      address: formatAddress(`${Math.floor(Math.random() * 999) + 1} ${generateStreetName()}, ${relevantNeighborhood}`, location),
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
      hours: 'Daily 11:00 AM - 10:00 PM',
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

// Reddit/Forums search via RapidAPI wrappers with graceful fallback
export const searchReddit = async (query: string, location: string) => {
  try {
    console.log(`[Reddit] Reddit API currently experiencing issues (404 errors)`);
    // Reddit API is returning 404 errors, likely due to API endpoint changes
    // Returning empty results to prevent app crashes
    console.log(`[Reddit] Skipping Reddit search to maintain app stability`);
    return [];
  } catch (error) {
    console.error('Error searching Reddit:', error);
    return [];
  }
};

// Enhanced restaurant data aggregation with real API integration
export const aggregateRestaurantData = async (query: string, location: string) => {
  try {
    // Restrict to NYC/LA only
    const city = /los angeles/i.test(location) ? 'Los Angeles' : 'New York';
    const cacheKey = `restaurant_search_${city}_${query.toLowerCase()}`;

    // 90-day cache for aggregated restaurant data
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw) as { t: number; data: any[] };
        if (Date.now() - cached.t < CACHE_DURATION) {
          console.log(`[API] Using cached search results for ${city} :: ${query}`);
          return cached.data;
        }
      } catch {}
    }

    console.log(`[API] Searching for restaurants: ${query} in ${city}`);

    let allResults: any[] = [];

    try {
      const apiPromises = [
        Promise.race([
          searchGooglePlaces(query, city),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Google Places timeout')), 5000))
        ]),
        Promise.race([
          searchYelp(query, city),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Yelp timeout')), 5000))
        ]),
        Promise.race([
          searchTripAdvisor(query, city),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TripAdvisor timeout')), 5000))
        ]),
        Promise.resolve([]) // Skip Reddit API due to 404 errors
      ];

      const [googleResults, yelpResults, tripAdvisorResults, redditResults] = await Promise.allSettled(apiPromises);

      const googleData = googleResults.status === 'fulfilled' ? googleResults.value : [];
      const yelpData = yelpResults.status === 'fulfilled' ? yelpResults.value : [];
      const tripAdvisorData = tripAdvisorResults.status === 'fulfilled' ? tripAdvisorResults.value : [];
      const redditData = redditResults.status === 'fulfilled' ? redditResults.value : [];

      console.log(`[API] Results - Google: ${googleData.length}, Yelp: ${yelpData.length}, TripAdvisor: ${tripAdvisorData.length}, Reddit: ${redditData.length}`);

      allResults = await combineApiResults(googleData, yelpData, tripAdvisorData, city, redditData);
    } catch (error) {
      console.error('[API] Error with real APIs, falling back to mock data:', error);
    }

    if (allResults.length === 0) {
      console.log('[API] Using mock data as fallback');
      allResults = generateMockSearchResults(query, city);
    }

    const resultsToEnhance = allResults.slice(0, 10);
    const enhancedResults: any[] = [];

    for (const result of resultsToEnhance) {
      try {
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
        const assignedImages = await assignRestaurantImages(result);

        enhancedResults.push({
          ...result,
          description: description || result.description || 'A great dining experience awaits.',
          vibeTags: (vibeTags && (vibeTags as string[]).length > 0) ? (vibeTags as string[]).map((tag: string) => capitalizeTag(tag)) : (result.vibeTags || ['Popular']),
          topPicks: (Array.isArray(topPicks) && topPicks.length > 0) ? topPicks : (result.topPicks || []),
          photos: assignedImages
        });
      } catch (error) {
        console.error(`[API] Error enhancing result for ${result.name}:`, error);
        const assignedImages = await assignRestaurantImages(result);
        enhancedResults.push({
          ...result,
          description: result.description || 'A great dining experience awaits.',
          vibeTags: (result.vibeTags || ['Popular']).map((tag: string) => capitalizeTag(tag)),
          topPicks: result.topPicks || [],
          photos: assignedImages
        });
      }
    }

    if (allResults.length > 10) {
      const remainingResults = await Promise.all(
        allResults.slice(10).map(async (result) => {
          const assignedImages = await assignRestaurantImages(result);
          return {
            ...result,
            description: result.description || 'A great dining experience awaits.',
            vibeTags: (result.vibeTags || ['Popular']).map((tag: string) => capitalizeTag(tag)),
            topPicks: result.topPicks || [],
            photos: assignedImages
          };
        })
      );
      enhancedResults.push(...remainingResults);
    }

    // Store cache
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data: enhancedResults }));

    console.log(`[API] Successfully processed ${enhancedResults.length} search results`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error aggregating restaurant data:', error);
    return generateMockSearchResults(query, location);
  }
};

// Helper function to capitalize tags properly
const capitalizeTag = (tag: string): string => {
  if (!tag) return 'Popular';
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
};

// Enhanced menu validation using AI with caching
export const generateValidatedMenuItems = async (restaurantName: string, cuisine: string, reviews: string[], restaurantId?: string) => {
  try {
    // Check cache first
    if (restaurantId) {
      const cached = await getCachedContent(restaurantId, 'menu');
      if (cached && Array.isArray(cached)) {
        return cached;
      }
    }
    
    // Ensure we have valid inputs
    if (!restaurantName || !cuisine) {
      console.log('[Menu] Missing required parameters, using fallback');
      return generateFallbackMenuItems(cuisine || 'International');
    }
    
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
            content: `Restaurant: ${restaurantName}, Cuisine: ${cuisine}, Reviews: ${(reviews || []).join('. ')}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const items = data.choices?.[0]?.message?.content?.split(',').map((item: string) => item.trim()).filter(Boolean) || [];
    const finalItems = items.slice(0, 8);
    
    // If no items generated, use fallback
    if (finalItems.length === 0) {
      const fallbackItems = generateFallbackMenuItems(cuisine);
      if (restaurantId) {
        await setCachedContent(restaurantId, 'menu', fallbackItems);
      }
      return fallbackItems;
    }
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'menu', finalItems);
    }
    
    return finalItems;
  } catch (error) {
    console.error('Error generating validated menu items:', error);
    const fallbackItems = generateFallbackMenuItems(cuisine || 'International');
    if (restaurantId) {
      try {
        await setCachedContent(restaurantId, 'menu', fallbackItems);
      } catch (cacheError) {
        console.error('Error caching fallback menu items:', cacheError);
      }
    }
    return fallbackItems;
  }
};

// Fallback menu items generator
const generateFallbackMenuItems = (cuisine: string): string[] => {
  const menuItems: Record<string, string[]> = {
    'Italian': ['Margherita Pizza', 'Spaghetti Carbonara', 'Osso Buco', 'Risotto Milanese', 'Tiramisu', 'Bruschetta'],
    'Japanese': ['Salmon Sashimi', 'Chicken Teriyaki', 'Miso Ramen', 'Tempura Vegetables', 'California Roll', 'Gyoza'],
    'Mexican': ['Fish Tacos', 'Guacamole & Chips', 'Carnitas', 'Chicken Enchiladas', 'Churros', 'Quesadillas'],
    'French': ['Coq au Vin', 'French Onion Soup', 'Crème Brûlée', 'Escargot', 'Bouillabaisse', 'Ratatouille'],
    'Thai': ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Massaman Curry', 'Som Tam'],
    'Indian': ['Butter Chicken', 'Biryani', 'Naan Bread', 'Samosas', 'Tandoori Chicken', 'Dal Makhani'],
    'American': ['Classic Burger', 'Mac and Cheese', 'BBQ Ribs', 'Apple Pie', 'Buffalo Wings', 'Clam Chowder'],
    'Chinese': ['Kung Pao Chicken', 'Fried Rice', 'Dumplings', 'Sweet and Sour Pork', 'Peking Duck', 'Hot Pot'],
    'Mediterranean': ['Hummus Platter', 'Grilled Octopus', 'Moussaka', 'Baklava', 'Greek Salad', 'Lamb Souvlaki'],
    'Korean': ['Bulgogi', 'Kimchi', 'Bibimbap', 'Korean BBQ', 'Japchae', 'Tteokbokki']
  };
  
  return menuItems[cuisine] || ['House Special', 'Chef\'s Choice', 'Daily Special', 'Signature Dish', 'Popular Item', 'Seasonal Menu'];
};

// Combine results from different APIs and remove duplicates
const combineApiResults = async (googleResults: any[], yelpResults: any[], tripAdvisorResults: any[], location: string, redditResults: any[] = []) => {
  const combined: any[] = [];
  const seenNames = new Set<string>();

  // Google Places
  for (const place of googleResults) {
    if (!place.name || seenNames.has(place.name.toLowerCase())) continue;
    seenNames.add(place.name.toLowerCase());

    let details = null;
    if (place.place_id) {
      try {
        if (combined.length < 5) {
          details = await getGooglePlaceDetails(place.place_id);
        }
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }

    // Do not include Google photo endpoints (no headers). Images will be assigned later.
    const photos: string[] = [];

    // Format address and parse hours
    const formattedAddress = formatAddress(place.formatted_address || details?.formatted_address || '', location);
    const hours = parseRestaurantHours(details?.opening_hours?.weekday_text || details?.current_opening_hours?.weekday_text);

    combined.push({
      id: `google_${place.place_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      cuisine: determineCuisineFromTypes(place.types || details?.types || []),
      rating: place.rating || details?.rating || 4.0,
      priceLevel: place.price_level || details?.price_level || 2,
      address: formattedAddress,
      phone: details?.formatted_phone_number || '',
      website: details?.website || '',
      photos,
      reviews: (details?.reviews || []).map((r: any) => r.text).slice(0, 3),
      hours: hours,
      source: 'google',
      location: place.geometry?.location || { lat: 40.7128, lng: -74.0060 }
    });
  }

  // Yelp
  for (const business of yelpResults) {
    if (!business.name || seenNames.has(business.name.toLowerCase())) continue;
    seenNames.add(business.name.toLowerCase());

    const photos = Array.isArray(business.photos) ? business.photos.slice(0, 3) : [];

    // Format address and parse hours
    const formattedAddress = formatAddress(business.location?.display_address?.join(', ') || '', location);
    const hours = parseRestaurantHours(business.hours?.[0]);

    combined.push({
      id: `yelp_${business.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: business.name,
      cuisine: determineCuisineFromCategories(business.categories || []),
      rating: business.rating || 4.0,
      priceLevel: business.price ? business.price.length : 2,
      address: formattedAddress,
      phone: business.phone || '',
      website: business.url || '',
      photos,
      reviews: [],
      hours: hours,
      source: 'yelp',
      location: business.coordinates || { lat: 40.7128, lng: -74.0060 }
    });
  }

  // TripAdvisor with enhanced photo support
  for (const restaurant of tripAdvisorResults) {
    if (!restaurant.name || seenNames.has(restaurant.name.toLowerCase())) continue;
    seenNames.add(restaurant.name.toLowerCase());

    // Get additional photos from TripAdvisor
    let photos: string[] = [];
    if (restaurant.photo?.images?.large?.url) {
      photos.push(restaurant.photo.images.large.url);
    }
    
    // Try to get more photos if we have location_id
    if (restaurant.location_id && combined.length < 5) {
      try {
        const additionalPhotos = await getTripAdvisorPhotos(restaurant.location_id);
        photos.push(...additionalPhotos.slice(0, 3));
      } catch (error) {
        console.error('Error getting additional TripAdvisor photos:', error);
      }
    }

    // Format address consistently
    const formattedAddress = formatAddress(restaurant.address || '', location);
    
    // Parse hours if available
    const hours = parseRestaurantHours(restaurant.hours || restaurant.open_hours);

    combined.push({
      id: `tripadvisor_${restaurant.location_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: restaurant.name,
      cuisine: restaurant.cuisine?.[0]?.name || 'International',
      rating: parseFloat(restaurant.rating) || 4.0,
      priceLevel: restaurant.price_level ? restaurant.price_level.replace(/\$/g, '').length : 2,
      address: formattedAddress,
      phone: restaurant.phone || '',
      website: restaurant.website || '',
      photos: [...new Set(photos)], // Remove duplicates
      reviews: [],
      hours: hours,
      source: 'tripadvisor',
      location: { lat: 40.7128, lng: -74.0060 }
    });
  }

  return combined;
};

// Format address consistently across the app
export const formatAddress = (address: string, city: string): string => {
  if (!address) return '';
  
  // Remove extra whitespace and normalize
  let formatted = address.trim().replace(/\s+/g, ' ');
  
  // Ensure city is included
  if (!formatted.toLowerCase().includes(city.toLowerCase())) {
    formatted += `, ${city}`;
  }
  
  // Add state abbreviation if missing
  if (city.toLowerCase().includes('new york') && !formatted.includes('NY')) {
    formatted += ', NY';
  } else if (city.toLowerCase().includes('los angeles') && !formatted.includes('CA')) {
    formatted += ', CA';
  }
  
  return formatted;
};

// Parse restaurant hours from various API formats
export const parseRestaurantHours = (hoursData: any): string => {
  if (!hoursData) return 'Hours vary';
  
  try {
    // Handle Google Places format
    if (Array.isArray(hoursData) && hoursData.length > 0) {
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      const todayHours = hoursData.find((h: any) => h.day === today);
      if (todayHours) {
        return `Today: ${todayHours.hours || 'Closed'}`;
      }
      return hoursData[0].hours || 'Hours vary';
    }
    
    // Handle TripAdvisor format
    if (typeof hoursData === 'object' && hoursData.today) {
      return `Today: ${hoursData.today}`;
    }
    
    // Handle string format
    if (typeof hoursData === 'string') {
      return hoursData;
    }
    
    return 'Hours vary';
  } catch (error) {
    console.error('Error parsing restaurant hours:', error);
    return 'Hours vary';
  }
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