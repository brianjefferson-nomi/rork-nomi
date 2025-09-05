import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Use environment variables for API keys (more secure)
const AI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '';
const TRIPADVISOR_API_KEY = process.env.EXPO_PUBLIC_TRIPADVISOR_API_KEY || '';
const TA_CONTENT_BASE = 'https://api.content.tripadvisor.com/api/v1';

// Foursquare API keys with fallback mechanism
const FOURSQUARE_CLIENT_ID = process.env.EXPO_PUBLIC_FOURSQUARE_CLIENT_ID || '';
const FOURSQUARE_CLIENT_SECRET = process.env.EXPO_PUBLIC_FOURSQUARE_CLIENT_SECRET || '';
const FOURSQUARE_PLACES_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_PLACES_API_KEY || '';
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3';
const FOURSQUARE_NEW_BASE_URL = 'https://api.foursquare.com/v2';
const FOURSQUARE_PLACES_BASE_URL = 'https://places-api.foursquare.com';

const MAPBOX_API_KEY = process.env.EXPO_PUBLIC_MAPBOX_API_KEY || '';
const STOCK_PHOTOS_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const STOCK_PHOTOS_HOST = 'stock-photos-and-videos.p.rapidapi.com';
const RESTAURANTS_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const RESTAURANTS_HOST = 'restaurants222.p.rapidapi.com';
const TRIPADVISOR_RAPIDAPI_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const TRIPADVISOR_RAPIDAPI_HOST = 'tripadvisor16.p.rapidapi.com';
const FORK_SPOON_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const FORK_SPOON_HOST = 'the-fork-the-spoon.p.rapidapi.com';
const REDDIT_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const REDDIT_HOST = 'reddit3.p.rapidapi.com';
const GOOGLE_MAPS_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const GOOGLE_MAPS_HOST = 'google-map-places-new-v2.p.rapidapi.com';
const UNSPLASH_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const UNSPLASH_HOST = 'unsplash-image-search-api.p.rapidapi.com';
const YELP_API_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const YELP_HOST = 'yelp-business-api.p.rapidapi.com';
const YELP_API3_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const YELP_API3_HOST = 'yelp-api3.p.rapidapi.com';

// Yelp Fusion API configuration (direct Yelp API)
const YELP_FUSION_API_KEY = process.env.EXPO_PUBLIC_YELP_FUSION_API_KEY || '';
const YELP_FUSION_BASE_URL = 'https://api.yelp.com/v3';
const WORLDWIDE_RESTAURANTS_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const WORLDWIDE_RESTAURANTS_HOST = 'worldwide-restaurants.p.rapidapi.com';
const UBER_EATS_KEY = RAPIDAPI_KEY; // Use same RapidAPI key
const UBER_EATS_HOST = 'uber-eats-scraper-api.p.rapidapi.com';

// Development mode - disable external APIs to use local data only
// Set to false to enable external APIs for testing
const DEV_MODE = false; // process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_DEV_MODE === 'true';

// API Rate Limiting Configuration
const API_RATE_LIMITS = {
  rapidapi: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000
  },
  foursquare: {
    requestsPerMinute: 5,
    requestsPerHour: 50,
    requestsPerDay: 500
  },
  mapbox: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000
  },
  yelp: {
    requestsPerMinute: 5,
    requestsPerHour: 50,
    requestsPerDay: 500
  },
  tripadvisor: {
    requestsPerMinute: 5,
    requestsPerHour: 50,
    requestsPerDay: 500
  }
};

// API Usage Tracking
const apiUsageTracker = {
  rapidapi: { minute: 0, hour: 0, day: 0, lastReset: Date.now() },
  foursquare: { minute: 0, hour: 0, day: 0, lastReset: Date.now() },
  mapbox: { minute: 0, hour: 0, day: 0, lastReset: Date.now() },
  yelp: { minute: 0, hour: 0, day: 0, lastReset: Date.now() },
  tripadvisor: { minute: 0, hour: 0, day: 0, lastReset: Date.now() }
};

// Rate limiting function
const checkRateLimit = (apiType: keyof typeof API_RATE_LIMITS): boolean => {
  const now = Date.now();
  const tracker = apiUsageTracker[apiType];
  const limits = API_RATE_LIMITS[apiType];
  
  // Reset counters if needed
  if (now - tracker.lastReset > 60000) { // 1 minute
    tracker.minute = 0;
    tracker.lastReset = now;
  }
  if (now - tracker.lastReset > 3600000) { // 1 hour
    tracker.hour = 0;
  }
  if (now - tracker.lastReset > 86400000) { // 1 day
    tracker.day = 0;
  }
  
  // Check limits
  if (tracker.minute >= limits.requestsPerMinute) {
    console.warn(`[API] Rate limit exceeded for ${apiType} (minute): ${tracker.minute}/${limits.requestsPerMinute}`);
    return false;
  }
  if (tracker.hour >= limits.requestsPerHour) {
    console.warn(`[API] Rate limit exceeded for ${apiType} (hour): ${tracker.hour}/${limits.requestsPerHour}`);
    return false;
  }
  if (tracker.day >= limits.requestsPerDay) {
    console.warn(`[API] Rate limit exceeded for ${apiType} (day): ${tracker.day}/${limits.requestsPerDay}`);
    return false;
  }
  
  // Increment counters
  tracker.minute++;
  tracker.hour++;
  tracker.day++;
  
  return true;
};

// Log API key status for debugging
console.log('[API] Development Mode:', DEV_MODE ? '✅ ENABLED (using local data only)' : '❌ DISABLED (using external APIs)');
console.log('[API] RapidAPI Key loaded:', RAPIDAPI_KEY ? '✅ YES' : '❌ NO');
console.log('[API] TripAdvisor Key loaded:', TRIPADVISOR_API_KEY ? '✅ YES' : '❌ NO');
console.log('[API] Foursquare Client ID loaded:', FOURSQUARE_CLIENT_ID ? '✅ YES' : '❌ NO');
console.log('[API] Mapbox Key loaded:', MAPBOX_API_KEY ? '✅ YES' : '❌ NO');
console.log('[API] Note: External APIs are disabled in development mode to preserve API limits');

// Foursquare API key validation with fallback
const validateFoursquareKey = () => {
  if (!FOURSQUARE_CLIENT_ID || FOURSQUARE_CLIENT_ID === 'DGV1DNHVYV2EGZY1ZRHVP4EMS2PA052UJ4IXX1WAQRKUSWTT') {
    console.warn('[Foursquare] Using fallback Client ID - consider setting EXPO_PUBLIC_FOURSQUARE_CLIENT_ID in your .env file');
    return false;
  }
  return true;
};

// Function to get Foursquare API key with fallback
const getFoursquareApiKey = () => {
  // Try primary key first
  if (FOURSQUARE_CLIENT_ID && FOURSQUARE_CLIENT_ID !== 'DGV1DNHVYV2EGZY1ZRHVP4EMS2PA052UJ4IXX1WAQRKUSWTT') {
    return FOURSQUARE_CLIENT_ID;
  }
  // No fallback key available
  return '';
};

// Function to build Foursquare v2 API URL with authentication
const buildFoursquareV2Url = (endpoint: string, params: URLSearchParams) => {
  const apiKey = getFoursquareApiKey();
  const clientId = FOURSQUARE_CLIENT_ID;
  const clientSecret = FOURSQUARE_CLIENT_SECRET;
  
  // Add authentication parameters for v2 API
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  
  return `${FOURSQUARE_NEW_BASE_URL}${endpoint}?${params.toString()}`;
};

// Enhanced API configuration for better restaurant data
const API_CONFIG = {
  rapidapi: {
    key: RAPIDAPI_KEY,
    hosts: {
      googlePlaces: 'google-map-places.p.rapidapi.com',
      googleMapsExtractor: 'google-maps-extractor.p.rapidapi.com',
      localBusinessData: 'local-business-data.p.rapidapi.com',
      mapData: 'map-data.p.rapidapi.com',
      yelp: 'yelp-business-api.p.rapidapi.com',
      yelpApi3: 'yelp-api3.p.rapidapi.com',
      worldwideRestaurants: 'worldwide-restaurants.p.rapidapi.com',
      uberEats: 'uber-eats-scraper-api.p.rapidapi.com',
      tripadvisor: 'tripadvisor16.p.rapidapi.com',
      unsplash: 'unsplash-image-search.p.rapidapi.com',
      stockPhotos: 'stock-photos-and-videos.p.rapidapi.com',
      restaurants: 'restaurants222.p.rapidapi.com',
      tripadvisorRapid: 'tripadvisor16.p.rapidapi.com',
      forkSpoon: 'the-fork-the-spoon.p.rapidapi.com',
      reddit: 'reddit3.p.rapidapi.com',
      googleMapsNew: 'google-map-places-new-v2.p.rapidapi.com',
      unsplashNew: 'unsplash-image-search-api.p.rapidapi.com'
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

// Restaurant-related validation keywords
const RESTAURANT_VIBE_KEYWORDS = [
  'romantic', 'upscale', 'trendy', 'cozy', 'casual', 'elegant', 'rustic', 'modern', 'traditional',
  'intimate', 'lively', 'quiet', 'bustling', 'charming', 'sophisticated', 'laid-back', 'energetic',
  'relaxed', 'formal', 'informal', 'family-friendly', 'date-night', 'business', 'outdoor', 'rooftop',
  'authentic', 'fusion', 'gourmet', 'comfort', 'luxury', 'budget-friendly', 'quick', 'slow', 'artisan',
  'farm-to-table', 'organic', 'sustainable', 'local', 'international', 'street-food', 'fine-dining',
  'fast-casual', 'diner', 'bistro', 'cafe', 'pub', 'bar', 'grill', 'steakhouse', 'seafood', 'pizza',
  'sushi', 'thai', 'italian', 'mexican', 'chinese', 'indian', 'french', 'japanese', 'korean', 'mediterranean'
];

const RESTAURANT_DESCRIPTION_KEYWORDS = [
  'restaurant', 'dining', 'food', 'cuisine', 'meal', 'dish', 'menu', 'chef', 'kitchen', 'service',
  'atmosphere', 'ambiance', 'experience', 'taste', 'flavor', 'delicious', 'fresh', 'quality', 'ingredients',
  'cooking', 'prepared', 'served', 'recommended', 'popular', 'favorite', 'specialty', 'signature',
  'authentic', 'traditional', 'modern', 'fusion', 'gourmet', 'casual', 'elegant', 'cozy', 'romantic',
  'family', 'business', 'date', 'occasion', 'celebration', 'dinner', 'lunch', 'breakfast', 'brunch'
];

const RESTAURANT_MENU_KEYWORDS = [
  'pizza', 'pasta', 'burger', 'steak', 'salmon', 'chicken', 'beef', 'pork', 'fish', 'shrimp',
  'sushi', 'sashimi', 'rice', 'noodles', 'soup', 'salad', 'sandwich', 'taco', 'burrito', 'curry',
  'kebab', 'falafel', 'hummus', 'dumpling', 'spring roll', 'pad thai', 'pho', 'ramen', 'udon',
  'teriyaki', 'tempura', 'gyoza', 'miso', 'kimchi', 'bibimbap', 'bulgogi', 'paella', 'risotto',
  'gnocchi', 'ravioli', 'lasagna', 'calzone', 'stromboli', 'quesadilla', 'enchilada', 'fajita',
  'tamale', 'empanada', 'arepa', 'ceviche', 'guacamole', 'salsa', 'mole', 'adobo', 'sofrito',
  'bruschetta', 'antipasto', 'prosciutto', 'mozzarella', 'parmesan', 'gorgonzola', 'brie', 'camembert',
  'wine', 'beer', 'cocktail', 'margarita', 'martini', 'moscow mule', 'old fashioned', 'negroni',
  'dessert', 'cake', 'pie', 'ice cream', 'gelato', 'tiramisu', 'cannoli', 'churro', 'flan',
  'bread', 'roll', 'bun', 'croissant', 'muffin', 'scone', 'biscuit', 'cookie', 'brownie'
];

// Validation functions
const isValidRestaurantVibeTag = (tag: string): boolean => {
  if (!tag || typeof tag !== 'string') return false;
  const normalizedTag = tag.toLowerCase().trim();
  if (normalizedTag.length < 2 || normalizedTag.length > 20) return false;
  
  // Check if tag contains restaurant-related keywords
  return RESTAURANT_VIBE_KEYWORDS.some(keyword => 
    normalizedTag.includes(keyword) || keyword.includes(normalizedTag)
  );
};

const isValidRestaurantDescription = (description: string): boolean => {
  if (!description || typeof description !== 'string') return false;
  const normalizedDesc = description.toLowerCase();
  if (normalizedDesc.length < 10 || normalizedDesc.length > 500) return false;
  
  // Check if description contains restaurant-related keywords
  const keywordCount = RESTAURANT_DESCRIPTION_KEYWORDS.filter(keyword => 
    normalizedDesc.includes(keyword)
  ).length;
  
  // Must contain at least 2 restaurant-related keywords
  return keywordCount >= 2;
};

const filterValidVibeTags = (tags: string[]): string[] => {
  return tags.filter(tag => isValidRestaurantVibeTag(tag));
};

const validateAndCleanDescription = (description: string): string | null => {
  if (!isValidRestaurantDescription(description)) {
    return null;
  }
  
  // Clean up common issues
  let cleaned = description.trim();
  
  // Remove excessive punctuation
  cleaned = cleaned.replace(/[.!?]{2,}/g, '.');
  
  // Ensure proper sentence structure
  if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
    cleaned += '.';
  }
  
  return cleaned;
};

const isValidRestaurantMenuItem = (item: string): boolean => {
  if (!item || typeof item !== 'string') return false;
  const normalizedItem = item.toLowerCase().trim();
  if (normalizedItem.length < 2 || normalizedItem.length > 50) return false;
  
  // Check if item contains restaurant-related keywords
  return RESTAURANT_MENU_KEYWORDS.some(keyword => 
    normalizedItem.includes(keyword) || keyword.includes(normalizedItem)
  );
};

const filterValidMenuItems = (items: string[]): string[] => {
  return items.filter(item => isValidRestaurantMenuItem(item));
};

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

// Enhanced image assignment with database-first approach
export const assignRestaurantImages = async (restaurant: any): Promise<string[]> => {
  const images: string[] = [];

  try {
    console.log(`[assignRestaurantImages] Processing images for ${restaurant.name}`);
    
    // 1) First priority: User-uploaded photos from database
    if (restaurant.id) {
      try {
        const { PhotoUploadService } = await import('./photo-upload');
        const uploadedPhotos = await PhotoUploadService.getRestaurantPhotos(restaurant.id);
        if (uploadedPhotos.length > 0) {
          const uploadedUrls = uploadedPhotos.map(photo => photo.url).filter(Boolean);
          images.push(...uploadedUrls);
          console.log(`[assignRestaurantImages] Found ${uploadedUrls.length} uploaded photos for ${restaurant.name}`);
        }
      } catch (error) {
        console.warn(`[assignRestaurantImages] Error fetching uploaded photos for ${restaurant.name}:`, error);
      }
    }

    // 2) Second priority: Google Places photos from database
    if (restaurant.googlePhotos) {
      let googlePhotoUrls: string[] = [];
      
      if (typeof restaurant.googlePhotos === 'string') {
        // Google Photos can be a comma-separated string of URLs
        googlePhotoUrls = restaurant.googlePhotos.split(',')
          .map(url => typeof url === 'string' ? url.trim() : '')
          .filter(url => url.length > 0 && url.startsWith('http'));
      } else if (Array.isArray(restaurant.googlePhotos)) {
        // Google Photos can also be an array of URLs
        googlePhotoUrls = restaurant.googlePhotos
          .filter(url => typeof url === 'string' && url.trim().length > 0 && url.startsWith('http'))
          .map(url => url.trim());
      }
      
      if (googlePhotoUrls.length > 0) {
        images.push(...googlePhotoUrls);
        console.log(`[assignRestaurantImages] Found ${googlePhotoUrls.length} Google Photos for ${restaurant.name}`);
      }
    }

    // 3) Third priority: TripAdvisor photos from database
    if (restaurant.tripadvisor_photos && Array.isArray(restaurant.tripadvisor_photos) && restaurant.tripadvisor_photos.length > 0) {
      const validTripAdvisorPhotos = restaurant.tripadvisor_photos
        .filter((img: any) => typeof img === 'string' && img.startsWith('http'));
      images.push(...validTripAdvisorPhotos);
      console.log(`[assignRestaurantImages] Found ${validTripAdvisorPhotos.length} TripAdvisor photos for ${restaurant.name}`);
    }

    // 4) Fourth priority: Other images from restaurant data
    if (restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0) {
      const validImages = restaurant.images
        .filter((img: any) => typeof img === 'string' && img.startsWith('http') && !img.includes('rapidapi.com'));
      images.push(...validImages);
      console.log(`[assignRestaurantImages] Found ${validImages.length} other images for ${restaurant.name}`);
    }

    // 5) Fifth priority: Main image URL if different
    if (restaurant.imageUrl && typeof restaurant.imageUrl === 'string' && 
        restaurant.imageUrl.startsWith('http') && !images.includes(restaurant.imageUrl)) {
      images.push(restaurant.imageUrl);
      console.log(`[assignRestaurantImages] Added main image URL for ${restaurant.name}`);
    }

    // 6) No external API calls for restaurants - only use database images
    if (images.length < 3) {
      console.log(`[assignRestaurantImages] Only ${images.length} database images found for ${restaurant.name}, using default image as fallback`);
    }

    // 7) Final fallback: Ensure at least 1 image with standard default
    if (images.length === 0) {
      console.log(`[assignRestaurantImages] No images found for ${restaurant.name}, using default image`);
      images.push('https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg');
    }

    const unique = [...new Set(images)].filter(Boolean);
    console.log(`[assignRestaurantImages] Final result for ${restaurant.name}: ${unique.length} unique images`);
    return unique.length > 0 ? unique : ['https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'];
  } catch (error) {
    console.error(`[assignRestaurantImages] Error assigning images for ${restaurant.name}:`, error);
    return ['https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'];
  }
};

// AI API for generating descriptions with caching
export const generateRestaurantDescription = async (reviews: string[], name: string, restaurantId?: string) => {
  try {
    // Check cache first
    if (restaurantId) {
      const cached = await getCachedContent(restaurantId, 'description');
      if (cached && typeof cached === 'string') {
        return cached;
      }
    }
    
    // Generate a simple description based on reviews and restaurant name
    const reviewText = reviews.join('. ').toLowerCase();
    const nameLower = name.toLowerCase();
    
    let description = '';
    
    // Check for positive keywords in reviews
    const positiveKeywords = ['delicious', 'amazing', 'great', 'excellent', 'fantastic', 'wonderful', 'outstanding', 'perfect', 'best', 'love', 'favorite'];
    const hasPositiveReviews = positiveKeywords.some(keyword => reviewText.includes(keyword));
    
    // Check for cuisine type
    const cuisineKeywords = ['italian', 'chinese', 'japanese', 'mexican', 'indian', 'thai', 'french', 'mediterranean', 'american', 'pizza', 'sushi', 'burger'];
    const cuisineType = cuisineKeywords.find(cuisine => nameLower.includes(cuisine) || reviewText.includes(cuisine)) || 'local';
    
    if (hasPositiveReviews) {
      description = `${name} is a popular ${cuisineType} restaurant known for its delicious food and excellent service. Customers rave about the quality and atmosphere.`;
    } else {
      description = `${name} offers a great ${cuisineType} dining experience with fresh ingredients and friendly service. A perfect spot for any occasion.`;
    }
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'description', description);
    }
    
    return description;
  } catch (error) {
    console.error('Error generating description:', error);
    return 'A popular local dining spot with great food and service.';
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
    
    // Generate vibe tags based on cuisine and reviews
    const reviewText = reviews.join('. ').toLowerCase();
    const cuisineLower = cuisine.toLowerCase();
    
    let vibeTags = [];
    
    // Cuisine-based vibe tags
    if (cuisineLower.includes('italian')) {
      vibeTags.push('Romantic', 'Authentic', 'Cozy');
    } else if (cuisineLower.includes('japanese') || cuisineLower.includes('sushi')) {
      vibeTags.push('Sophisticated', 'Elegant', 'Minimalist');
    } else if (cuisineLower.includes('chinese')) {
      vibeTags.push('Bustling', 'Authentic', 'Family-Friendly');
    } else if (cuisineLower.includes('mexican')) {
      vibeTags.push('Lively', 'Casual', 'Vibrant');
    } else if (cuisineLower.includes('indian')) {
      vibeTags.push('Warm', 'Authentic', 'Aromatic');
    } else if (cuisineLower.includes('thai')) {
      vibeTags.push('Exotic', 'Fresh', 'Spicy');
    } else if (cuisineLower.includes('french')) {
      vibeTags.push('Elegant', 'Sophisticated', 'Romantic');
    } else {
      vibeTags.push('Casual', 'Comfortable', 'Welcoming');
    }
    
    // Review-based adjustments
    if (reviewText.includes('romantic') || reviewText.includes('date')) {
      vibeTags = vibeTags.filter(tag => tag !== 'Casual').concat(['Romantic']);
    }
    if (reviewText.includes('family') || reviewText.includes('kids')) {
      vibeTags = vibeTags.filter(tag => tag !== 'Romantic').concat(['Family-Friendly']);
    }
    if (reviewText.includes('upscale') || reviewText.includes('elegant')) {
      vibeTags = vibeTags.filter(tag => tag !== 'Casual').concat(['Upscale']);
    }
    
    // Ensure we have 3-5 tags
    const finalTags = vibeTags.slice(0, 5);
    if (finalTags.length < 3) {
      finalTags.push('Popular', 'Local');
    }
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'vibes', finalTags);
    }
    
    return finalTags;
  } catch (error) {
    console.error('Error generating vibe tags:', error);
    return ['Popular', 'Local', 'Casual', 'Authentic'];
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
    
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Based on menu items and reviews, identify the top 5-8 most recommended dishes. Return only dish names separated by commas. Be specific and realistic.'
          },
          {
            role: 'user',
            content: `Menu items: ${menuItems.join(', ')}. Reviews mentioning food: ${reviews.join('. ')}`
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const picks = data.completion?.split(',').map((item: string) => {
      if (!item || typeof item !== 'string') return null;
      return item.trim();
    }).filter(Boolean) || [];
    
    // Filter and validate menu items to ensure they're restaurant-related
    const validPicks = filterValidMenuItems(picks);
    const finalPicks = validPicks.slice(0, 8);
    
    console.log(`[TopPicks] Generated ${picks.length} items, ${validPicks.length} valid restaurant-related items`);
    
    // Cache the result
    if (restaurantId) {
      await setCachedContent(restaurantId, 'menu', finalPicks);
    }
    
    return finalPicks;
  } catch (error) {
    console.error('Error generating top picks:', error);
    // Return validated fallback menu items
    return filterValidMenuItems(['House Special', 'Chef\'s Choice', 'Signature Dish', 'Popular Item']);
  }
};

// Enhanced Google Places API with robust error handling
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

    if (response.status === 403) {
      console.log(`[GooglePlaces] Access forbidden (403) - API key may not have access to this service`);
      console.log(`[GooglePlaces] This is expected with current RapidAPI subscription level`);
      return [];
    }

    if (response.status === 429) {
      console.log('[GooglePlaces] Rate limited, waiting and retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await searchGooglePlaces(query, city);
    }

    if (!response.ok) {
      console.log(`[GooglePlaces] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log(`[GooglePlaces] Found ${data.results?.length || 0} results`);
    return data.results || [];
  } catch (error) {
    console.error('[GooglePlaces] Error searching Google Places:', error);
    return [];
  }
};

// New Google Maps Extractor API for enhanced location-based search
export const searchGoogleMapsExtractor = async (query: string, lat: number, lng: number, radius: number = 5000): Promise<any[]> => {
  try {
    console.log(`[GoogleMapsExtractor] API currently experiencing 403 errors - disabled for stability`);
    // Google Maps Extractor API is returning 403 errors, likely due to API key restrictions
    // Returning empty results to prevent app crashes
    console.log(`[GoogleMapsExtractor] Skipping search to maintain app stability`);
    return [];
  } catch (error) {
    console.error('Error searching Google Maps Extractor:', error);
    return [];
  }
};

// New Local Business Data API with robust error handling
export const searchLocalBusinessData = async (query: string, lat: number, lng: number, radius: number = 5000): Promise<any[]> => {
  try {
    console.log(`[LocalBusinessData] Searching for: ${query} near ${lat}, ${lng}`);
    
    const response = await fetch(
      `https://${API_CONFIG.rapidapi.hosts.localBusinessData}/search?query=${encodeURIComponent(query + ' restaurant')}&lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
          'X-RapidAPI-Host': API_CONFIG.rapidapi.hosts.localBusinessData
        }
      }
    );

    if (response.status === 403) {
      console.log(`[LocalBusinessData] Access forbidden (403) - API key may not have access to this service`);
      console.log(`[LocalBusinessData] This is expected with current RapidAPI subscription level`);
      return [];
    }

    if (!response.ok) {
      console.log(`[LocalBusinessData] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log(`[LocalBusinessData] Found ${data.data?.length || 0} results`);
    return data.data || [];
  } catch (error) {
    console.error('[LocalBusinessData] Error searching Local Business Data:', error);
    return [];
  }
};

// New Map Data API for location-based restaurant discovery
export const searchMapData = async (query: string, lat: number, lng: number, radius: number = 5000): Promise<any[]> => {
  try {
    console.log(`[MapData] API currently experiencing 403 errors - disabled for stability`);
    // Map Data API is returning 403 errors, likely due to API key restrictions
    // Returning empty results to prevent app crashes
    console.log(`[MapData] Skipping search to maintain app stability`);
    return [];
  } catch (error) {
    console.error('Error searching Map Data:', error);
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
  // Disabled for web compatibility - headers not supported by Image component
  return null;
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

// TripAdvisor API (RapidAPI search) with robust error handling
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
    
    if (response.status === 403) {
      console.log(`[TripAdvisor] Access forbidden (403) - API key may not have access to this service`);
      console.log(`[TripAdvisor] This is expected with current RapidAPI subscription level`);
      return [];
    }
    
    if (!response.ok) {
      console.log(`[TripAdvisor] API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`[TripAdvisor] Found ${data.data?.data?.length || 0} results`);
    return data.data?.data || [];
  } catch (error) {
    console.error('[TripAdvisor] Error searching TripAdvisor:', error);
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

// TripAdvisor Content API helpers (official Content API)
export const taContentGetLocationDetails = async (locationId: string) => {
  try {
    const url = `${TA_CONTENT_BASE}/location/${encodeURIComponent(locationId)}/details?language=en`;
    const res = await fetch(url, {
      headers: { 'accept': 'application/json', 'x-api-key': TRIPADVISOR_API_KEY }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('[TripAdvisor Content] details error', e);
    return null;
  }
};

export const taContentGetLocationPhotos = async (locationId: string): Promise<string[]> => {
  try {
    const url = `${TA_CONTENT_BASE}/location/${encodeURIComponent(locationId)}/photos?language=en`;
    const res = await fetch(url, {
      headers: { 'accept': 'application/json', 'x-api-key': TRIPADVISOR_API_KEY }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : data;
    const urls: string[] = [];
    if (Array.isArray(items)) {
      for (const p of items) {
        const u = p?.images?.large?.url || p?.images?.original?.url || p?.images?.medium?.url || p?.images?.small?.url;
        if (typeof u === 'string' && u.startsWith('http')) urls.push(u);
      }
    }
    return urls.slice(0, 12);
  } catch (e) {
    console.log('[TripAdvisor Content] photos error', e);
    return [];
  }
};

export const taContentGetLocationReviews = async (locationId: string) => {
  try {
    const url = `${TA_CONTENT_BASE}/location/${encodeURIComponent(locationId)}/reviews?language=en`;
    const res = await fetch(url, {
      headers: { 'accept': 'application/json', 'x-api-key': TRIPADVISOR_API_KEY }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const reviews: string[] = (Array.isArray(data.data) ? data.data : data)?.map((r: any) => r?.text || r?.title).filter(Boolean) || [];
    return reviews.slice(0, 5);
  } catch (e) {
    console.log('[TripAdvisor Content] reviews error', e);
    return [];
  }
};

export const taContentSearch = async (query: string, lat?: number, lng?: number) => {
  try {
    const params: string[] = [`language=en`, `searchQuery=${encodeURIComponent(query)}`, `category=restaurants`];
    if (typeof lat === 'number' && typeof lng === 'number') {
      params.push(`latLong=${lat},${lng}`);
      params.push('radius=10');
    }
    const url = `${TA_CONTENT_BASE}/location/search?${params.join('&')}`;
    const res = await fetch(url, { headers: { 'accept': 'application/json', 'x-api-key': TRIPADVISOR_API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data.data) ? data.data : data?.results || [];
    return results;
  } catch (e) {
    console.log('[TripAdvisor Content] search error', e);
    return [];
  }
};

export const taContentNearby = async (lat: number, lng: number) => {
  try {
    const url = `${TA_CONTENT_BASE}/location/nearby_search?latLong=${lat},${lng}&language=en&category=restaurants&radius=10`;
    const res = await fetch(url, { headers: { 'accept': 'application/json', 'x-api-key': TRIPADVISOR_API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (e) {
    console.log('[TripAdvisor Content] nearby error', e);
    return [];
  }
};

// Get TripAdvisor restaurant photos using the new API endpoint
export const getTripAdvisorPhotos = async (locationId: string, language: string = 'en'): Promise<string[]> => {
  try {
    console.log(`[TripAdvisor] Getting photos for location: ${locationId}`);
    
    const url = `${TA_CONTENT_BASE}/location/${locationId}/photos?language=${language}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${TRIPADVISOR_API_KEY}`
      }
    });
    
    if (!response.ok) {
      console.log(`[TripAdvisor] Photos API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    const photos = data.data || [];
    
    // Extract photo URLs
    const photoUrls = photos.map((photo: any) => 
      photo.images?.large?.url || photo.images?.medium?.url || photo.images?.small?.url
    ).filter(Boolean);
    
    console.log(`[TripAdvisor] Retrieved ${photoUrls.length} photos`);
    return photoUrls;
  } catch (error) {
    console.error('[TripAdvisor] Error getting photos:', error);
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
  // Use the standard default image for all cases to maintain consistency
  return 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
};

// Generate unique collection cover images based on occasion
export const getCollectionCoverImage = (occasion?: string): string => {
  const occasionImages = {
    'Birthday': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80', // Birthday cake
    'Date Night': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80', // Romantic dinner
    'Business': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80', // Business meeting
    'Casual': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80', // Casual dining
    'Late Night': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80', // Night city lights
    'Brunch': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80', // Brunch spread
    'Special Occasion': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80', // Fine dining
    'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80', // Italian food
    'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80', // Sushi
    'Mexican': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop&q=80', // Mexican food
    'French': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80', // French cuisine
    'Thai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop&q=80', // Thai food
    'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80', // Indian food
    'American': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&q=80', // American food
    'Chinese': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop&q=80', // Chinese food
    'Mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80', // Mediterranean
    'Korean': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop&q=80', // Korean BBQ
    'Sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80', // Sushi
    'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80', // Pizza
    'Steakhouse': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&q=80', // Steak
    'Fine Dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80', // Fine dining
    'Fast Food': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&q=80', // Fast food
    'Cafe': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80', // Cafe
    'Bar': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80', // Bar
    'Seafood': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80', // Seafood
    'Vegetarian': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80', // Vegetarian
    'Vegan': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80', // Vegan
    'Dessert': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80', // Dessert
    'Breakfast': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80', // Breakfast
    'Lunch': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80', // Lunch
    'Dinner': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80' // Dinner
  };
  
  // Try to match the occasion exactly, then try partial matches
  if (occasion && occasionImages[occasion as keyof typeof occasionImages]) {
    return occasionImages[occasion as keyof typeof occasionImages];
  }
  
  // Try partial matches for occasions
  if (occasion) {
    const lowerOccasion = occasion.toLowerCase();
    for (const [key, image] of Object.entries(occasionImages)) {
      if (lowerOccasion.includes(key.toLowerCase())) {
        return image;
      }
    }
  }
  
  // Return a random image from the collection for variety
  const imageValues = Object.values(occasionImages);
  const randomIndex = Math.floor(Math.random() * imageValues.length);
  return imageValues[randomIndex];
};

// Enhanced location service with better city detection
export const getUserLocation = async (): Promise<{ city: string; lat: number; lng: number } | null> => {
  try {
    console.log('[Location] Getting user location...');
    
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log(`[Location] Got coordinates: ${latitude}, ${longitude}`);
              
              // Simple city detection based on coordinates
              // NYC area: roughly 40.4774-40.9176 lat, -74.2591 to -73.7004 lng
              // LA area: roughly 33.7037-34.3373 lat, -118.6681 to -117.9448 lng
              if (latitude >= 40.4774 && latitude <= 40.9176 && longitude >= -74.2591 && longitude <= -73.7004) {
                console.log('[Location] Detected NYC area');
                resolve({ city: 'New York', lat: latitude, lng: longitude });
                return;
              } else if (latitude >= 33.7037 && latitude <= 34.3373 && longitude >= -118.6681 && longitude <= -117.9448) {
                console.log('[Location] Detected LA area');
                resolve({ city: 'Los Angeles', lat: latitude, lng: longitude });
                return;
              }
              
              // Default to NYC if location not in supported areas
              console.log('[Location] Location not in supported cities, defaulting to NYC');
              resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
            } catch (error) {
              console.error('[Location] Error processing coordinates:', error);
              resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
            }
          },
          (error) => {
            console.log('[Location] Geolocation error, using default location:', error.message || 'Unknown error');
            // Default to NYC
            resolve({ city: 'New York', lat: 40.7128, lng: -74.0060 });
          },
          {
            timeout: 8000,
            enableHighAccuracy: false,
            maximumAge: 600000 // 10 minutes
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

// Enhanced restaurant data aggregation with real API integration and location-based search
export const aggregateRestaurantData = async (query: string, location: string, userLat?: number, userLng?: number) => {
  try {
    // Get user location if not provided
    let userLocation = { city: location, lat: 40.7128, lng: -74.0060 }; // Default to NYC
    if (userLat && userLng) {
      userLocation = { city: location, lat: userLat, lng: userLng };
    } else {
      const locationData = await getUserLocation();
      if (locationData) {
        userLocation = locationData;
      }
    }

    const cacheKey = `restaurant_search_${userLocation.city}_${query.toLowerCase()}_${Math.round(userLocation.lat * 1000)}_${Math.round(userLocation.lng * 1000)}`;

    // 90-day cache for aggregated restaurant data
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw) as { t: number; data: any[] };
        if (Date.now() - cached.t < CACHE_DURATION) {
          console.log(`[API] Using cached search results for ${userLocation.city} :: ${query}`);
          return cached.data;
        }
      } catch {}
    }

    console.log(`[API] Searching for restaurants: ${query} near ${userLocation.lat}, ${userLocation.lng} in ${userLocation.city}`);

    let allResults: any[] = [];

    try {
      // Use location-based APIs for better proximity results
      const apiPromises = [
        Promise.resolve([]), // Google Maps Extractor disabled due to 403 errors
        Promise.race([
          searchLocalBusinessData(query, userLocation.lat, userLocation.lng, 5000),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Local Business Data timeout')), 8000))
        ]),
        Promise.resolve([]), // Map Data disabled due to 403 errors
        Promise.race([
          searchGooglePlaces(query, userLocation.city),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Google Places timeout')), 5000))
        ]),
        Promise.race([
          searchTripAdvisor(query, userLocation.city),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TripAdvisor timeout')), 5000))
        ]),
        Promise.race([
          searchFoursquareRestaurants(query, userLocation.lat, userLocation.lng, 5000),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Foursquare timeout')), 8000))
        ]),
        Promise.race([
          searchRestaurantsWithYelp(query, userLocation.city, 20),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Yelp timeout')), 8000))
        ]),
        Promise.resolve([]), // Worldwide Restaurants temporarily disabled due to 422 errors
        Promise.race([
          searchRestaurantsWithUberEats(query, `${userLocation.city}, ${userLocation.lat}, ${userLocation.lng}`, 'en-US', 15),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Uber Eats timeout')), 8000))
        ])
      ];

      const [mapsExtractorResults, localBusinessResults, mapDataResults, googleResults, tripAdvisorResults, foursquareResults, yelpResults, worldwideResults, uberEatsResults] = await Promise.allSettled(apiPromises);

      const mapsExtractorData = mapsExtractorResults.status === 'fulfilled' ? mapsExtractorResults.value : [];
      const localBusinessData = localBusinessResults.status === 'fulfilled' ? localBusinessResults.value : [];
      const mapDataData = mapDataResults.status === 'fulfilled' ? mapDataResults.value : [];
      const googleData = googleResults.status === 'fulfilled' ? googleResults.value : [];
      const tripAdvisorData = tripAdvisorResults.status === 'fulfilled' ? tripAdvisorResults.value : [];
      const foursquareData = foursquareResults.status === 'fulfilled' ? foursquareResults.value : [];
      const yelpData = yelpResults.status === 'fulfilled' ? yelpResults.value : [];
      const worldwideData = worldwideResults.status === 'fulfilled' ? worldwideResults.value : [];
      const uberEatsData = uberEatsResults.status === 'fulfilled' ? uberEatsResults.value : [];

      console.log(`[API] Results - Maps Extractor: ${mapsExtractorData.length} (disabled), Local Business: ${localBusinessData.length}, Map Data: ${mapDataData.length} (disabled), Google: ${googleData.length}, TripAdvisor: ${tripAdvisorData.length}, Foursquare: ${foursquareData.length}, Yelp: ${yelpData.length}, Worldwide: ${worldwideData.length} (disabled), Uber Eats: ${uberEatsData.length}`);

      allResults = await combineLocationBasedResults(
        mapsExtractorData, 
        localBusinessData, 
        mapDataData, 
        googleData, 
        tripAdvisorData, 
        foursquareData,
        yelpData,
        worldwideData,
        uberEatsData,
        userLocation
      );
    } catch (error) {
      console.error('[API] Error with real APIs, falling back to mock data:', error);
    }

    if (allResults.length === 0) {
      console.log('[API] All external APIs failed, using robust fallback system');
      console.log('[API] This is expected with current API subscription levels');
      
      // Try to get restaurants from database first
      try {
        const { data: dbRestaurants } = await supabase
          .from('restaurants')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(10);
        
        if (dbRestaurants && dbRestaurants.length > 0) {
          console.log(`[API] Found ${dbRestaurants.length} restaurants from database as fallback`);
          allResults = dbRestaurants.map((restaurant: any) => ({
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            priceLevel: restaurant.price_level,
            address: restaurant.address,
            neighborhood: restaurant.neighborhood,
            phone: restaurant.phone,
            website: restaurant.website,
            photos: restaurant.images || [],
            reviews: restaurant.reviews || [],
            hours: restaurant.hours,
            description: restaurant.description,
            source: 'database'
          }));
        } else {
          console.log('[API] No database restaurants found, using mock data');
          allResults = generateMockSearchResults(query, userLocation.city);
        }
      } catch (error) {
        console.log('[API] Database fallback failed, using mock data');
        allResults = generateMockSearchResults(query, userLocation.city);
      }
    }

    // Sort results by proximity to user location
    allResults.sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.location?.lat || 0, a.location?.lng || 0);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.location?.lat || 0, b.location?.lng || 0);
      return distanceA - distanceB;
    });

    const resultsToEnhance = allResults.slice(0, 15); // Enhance more results since we have better location data
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

        // Calculate distance from user
        const distance = calculateDistance(userLocation.lat, userLocation.lng, result.location?.lat || 0, result.location?.lng || 0);

        enhancedResults.push({
          ...result,
          description: description || result.description || 'A great dining experience awaits.',
          vibeTags: (vibeTags && (vibeTags as string[]).length > 0) ? (vibeTags as string[]).map((tag: string) => capitalizeTag(tag)) : (result.vibeTags || ['Popular']),
          topPicks: (Array.isArray(topPicks) && topPicks.length > 0) ? topPicks : (result.topPicks || []),
          photos: assignedImages,
          distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
          proximity: distance < 1 ? 'Very Close' : distance < 3 ? 'Nearby' : distance < 5 ? 'Close' : 'Within Range'
        });
      } catch (error) {
        console.error(`[API] Error enhancing result for ${result.name}:`, error);
        const assignedImages = await assignRestaurantImages(result);
        const distance = calculateDistance(userLocation.lat, userLocation.lng, result.location?.lat || 0, result.location?.lng || 0);
        
        enhancedResults.push({
          ...result,
          description: result.description || 'A great dining experience awaits.',
          vibeTags: (result.vibeTags || ['Popular']).map((tag: string) => capitalizeTag(tag)),
          topPicks: result.topPicks || [],
          photos: assignedImages,
          distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
          proximity: distance < 1 ? 'Very Close' : distance < 3 ? 'Nearby' : distance < 5 ? 'Close' : 'Within Range'
        });
      }
    }

    if (allResults.length > 15) {
      const remainingResults = await Promise.all(
        allResults.slice(15).map(async (result) => {
          const assignedImages = await assignRestaurantImages(result);
          const distance = calculateDistance(userLocation.lat, userLocation.lng, result.location?.lat || 0, result.location?.lng || 0);
          
          return {
            ...result,
            description: result.description || 'A great dining experience awaits.',
            vibeTags: (result.vibeTags || ['Popular']).map((tag: string) => capitalizeTag(tag)),
            topPicks: result.topPicks || [],
            photos: assignedImages,
            distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
            proximity: distance < 1 ? 'Very Close' : distance < 3 ? 'Nearby' : distance < 5 ? 'Close' : 'Within Range'
          };
        })
      );
      enhancedResults.push(...remainingResults);
    }

    // Store cache
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data: enhancedResults }));

    console.log(`[API] Successfully processed ${enhancedResults.length} location-based search results`);
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
    
    // Generate menu items based on cuisine type
    const cuisineLower = cuisine.toLowerCase();
    let menuItems = [];
    
    if (cuisineLower.includes('italian')) {
      menuItems = ['Margherita Pizza', 'Spaghetti Carbonara', 'Bruschetta', 'Tiramisu', 'Fettuccine Alfredo', 'Caprese Salad'];
    } else if (cuisineLower.includes('japanese') || cuisineLower.includes('sushi')) {
      menuItems = ['California Roll', 'Spicy Tuna Roll', 'Miso Soup', 'Teriyaki Chicken', 'Tempura Shrimp', 'Green Tea Ice Cream'];
    } else if (cuisineLower.includes('chinese')) {
      menuItems = ['Kung Pao Chicken', 'Sweet and Sour Pork', 'Fried Rice', 'Dumplings', 'Mapo Tofu', 'Egg Drop Soup'];
    } else if (cuisineLower.includes('mexican')) {
      menuItems = ['Tacos al Pastor', 'Guacamole', 'Enchiladas', 'Quesadillas', 'Churros', 'Horchata'];
    } else if (cuisineLower.includes('indian')) {
      menuItems = ['Butter Chicken', 'Naan Bread', 'Biryani', 'Tandoori Chicken', 'Samosa', 'Mango Lassi'];
    } else if (cuisineLower.includes('thai')) {
      menuItems = ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Spring Rolls', 'Thai Iced Tea'];
    } else if (cuisineLower.includes('french')) {
      menuItems = ['Coq au Vin', 'Beef Bourguignon', 'French Onion Soup', 'Crème Brûlée', 'Escargot', 'Ratatouille'];
    } else if (cuisineLower.includes('american') || cuisineLower.includes('burger')) {
      menuItems = ['Classic Burger', 'French Fries', 'Chicken Wings', 'Caesar Salad', 'Apple Pie', 'Milkshake'];
    } else {
      menuItems = generateFallbackMenuItems(cuisine);
    }
    
    // Add restaurant-specific items based on name
    const nameLower = restaurantName.toLowerCase();
    if (nameLower.includes('pizza')) {
      menuItems = menuItems.filter(item => !item.includes('Pizza')).concat(['Margherita Pizza', 'Pepperoni Pizza', 'Hawaiian Pizza']);
    }
    if (nameLower.includes('sushi')) {
      menuItems = menuItems.filter(item => !item.includes('Roll')).concat(['Dragon Roll', 'Rainbow Roll', 'Spicy Tuna Roll']);
    }
    
    const finalItems = menuItems.slice(0, 8);
    
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
const combineLocationBasedResults = async (
  mapsExtractorResults: any[], 
  localBusinessResults: any[], 
  mapDataResults: any[], 
  googleResults: any[], 
  tripAdvisorResults: any[], 
  foursquareResults: any[],
  yelpResults: any[],
  worldwideResults: any[],
  uberEatsResults: any[],
  userLocation: { lat: number; lng: number; city: string }
) => {
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
    const formattedAddress = formatAddress(place.formatted_address || details?.formatted_address || '', userLocation.city);
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
      location: place.geometry?.location || { lat: userLocation.lat, lng: userLocation.lng }
    });
  }

  // Process new location-based APIs
  // Google Maps Extractor
  for (const place of mapsExtractorResults) {
    if (!place.name || seenNames.has(place.name.toLowerCase())) continue;
    seenNames.add(place.name.toLowerCase());

    combined.push({
      id: `maps_extractor_${place.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      cuisine: determineCuisineFromTypes(place.types || []),
      rating: place.rating || 4.0,
      priceLevel: place.price_level || 2,
      address: formatAddress(place.address || '', userLocation.city),
      phone: place.phone || '',
      website: place.website || '',
      photos: place.photos || [],
      reviews: place.reviews || [],
      hours: parseRestaurantHours(place.hours),
      source: 'maps_extractor',
      location: place.location || { lat: userLocation.lat, lng: userLocation.lng }
    });
  }

  // Local Business Data
  for (const business of localBusinessResults) {
    if (!business.name || seenNames.has(business.name.toLowerCase())) continue;
    seenNames.add(business.name.toLowerCase());

    combined.push({
      id: `local_business_${business.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: business.name,
      cuisine: determineCuisineFromTypes(business.types || []),
      rating: business.rating || 4.0,
      priceLevel: business.price_level || 2,
      address: formatAddress(business.address || '', userLocation.city),
      phone: business.phone || '',
      website: business.website || '',
      photos: business.photos || [],
      reviews: business.reviews || [],
      hours: parseRestaurantHours(business.hours),
      source: 'local_business',
      location: business.location || { lat: userLocation.lat, lng: userLocation.lng }
    });
  }

  // Map Data
  for (const place of mapDataResults) {
    if (!place.name || seenNames.has(place.name.toLowerCase())) continue;
    seenNames.add(place.name.toLowerCase());

    combined.push({
      id: `map_data_${place.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      cuisine: determineCuisineFromTypes(place.types || []),
      rating: place.rating || 4.0,
      priceLevel: place.price_level || 2,
      address: formatAddress(place.address || '', userLocation.city),
      phone: place.phone || '',
      website: place.website || '',
      photos: place.photos || [],
      reviews: place.reviews || [],
      hours: parseRestaurantHours(place.hours),
      source: 'map_data',
      location: place.location || { lat: userLocation.lat, lng: userLocation.lng }
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

    // Try official Content API for richer photos, details, and reviews
    if (restaurant.location_id) {
      try {
        const [contentPhotos, contentDetails, contentReviews] = await Promise.all([
          taContentGetLocationPhotos(restaurant.location_id),
          taContentGetLocationDetails(restaurant.location_id),
          taContentGetLocationReviews(restaurant.location_id)
        ]);
        photos.push(...contentPhotos.slice(0, 6));
        if (contentDetails) {
          restaurant.address = contentDetails?.address_obj?.address_string || restaurant.address;
          restaurant.website = contentDetails?.website || restaurant.website;
          restaurant.phone = contentDetails?.phone || restaurant.phone;
          if (!restaurant.rating && contentDetails?.rating) restaurant.rating = contentDetails.rating;
        }
        if (Array.isArray(contentReviews) && contentReviews.length > 0) {
          restaurant.reviews = contentReviews;
        }
      } catch (err) {
        console.log('[TripAdvisor] Content API enrichment failed', err);
      }
    }

    // Also try RapidAPI photos endpoint if still few images
    if (restaurant.location_id && photos.length < 6 && combined.length < 5) {
      try {
        const additionalPhotos = await getTripAdvisorPhotos(restaurant.location_id);
        photos.push(...additionalPhotos.slice(0, 6));
      } catch (error) {
        console.error('Error getting additional TripAdvisor photos:', error);
      }
    }

    // Format address consistently
    const formattedAddress = formatAddress(restaurant.address || '', userLocation.city);
    
    // Parse hours if available
    const hours = parseRestaurantHours(restaurant.hours || restaurant.open_hours || restaurant.hours_open || restaurant.opening_hours);

    combined.push({
      id: `tripadvisor_${restaurant.location_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: restaurant.name,
      cuisine: restaurant.cuisine?.[0]?.name || 'International',
      rating: parseFloat(restaurant.rating) || 4.0,
      priceLevel: restaurant.price_level ? restaurant.price_level.replace(/\$/g, '').length : 2,
      address: formattedAddress,
      phone: restaurant.phone || '',
      website: restaurant.website || '',
      photos: [...new Set(photos)],
      reviews: (restaurant.reviews || []).slice(0, 5),
      hours: hours,
      source: 'tripadvisor',
      location: { lat: userLocation.lat, lng: userLocation.lng }
    });
  }

  // Foursquare
  for (const place of foursquareResults) {
    if (!place.name || seenNames.has(place.name.toLowerCase())) continue;
    seenNames.add(place.name.toLowerCase());

    // Transform Foursquare data to our format
    const transformedPlace = transformFoursquareRestaurant(place);
    if (!transformedPlace) continue;

    // Get additional photos and tips for top results
    let photos: string[] = [];
    let reviews: string[] = [];
    
    if (combined.length < 10 && place.fsq_id) {
      try {
        const [placePhotos, placeTips] = await Promise.all([
          getFoursquareRestaurantPhotos(place.fsq_id, 5),
          getFoursquareRestaurantTips(place.fsq_id, 5)
        ]);
        photos = placePhotos;
        reviews = placeTips.map((tip: any) => tip.text).filter(Boolean);
      } catch (error) {
        console.error('[Foursquare] Error getting additional data:', error);
      }
    }

    combined.push({
      id: `foursquare_${place.fsq_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: transformedPlace.name,
      cuisine: transformedPlace.cuisine,
      rating: transformedPlace.rating,
      priceLevel: transformedPlace.price,
      address: formatAddress(transformedPlace.address, userLocation.city),
      phone: transformedPlace.phone,
      website: transformedPlace.website,
      photos: photos.length > 0 ? photos : [],
      reviews: reviews.length > 0 ? reviews : [],
      hours: transformedPlace.hours,
      source: 'foursquare',
      location: { 
        lat: transformedPlace.latitude || userLocation.lat, 
        lng: transformedPlace.longitude || userLocation.lng 
      },
      fsq_id: place.fsq_id,
      totalPhotos: transformedPlace.totalPhotos,
      totalTips: transformedPlace.totalTips,
      totalVisits: transformedPlace.totalVisits
    });
  }

  // Yelp
  for (const restaurant of yelpResults) {
    if (!restaurant.name || seenNames.has(restaurant.name.toLowerCase())) continue;
    seenNames.add(restaurant.name.toLowerCase());

    // Transform Yelp data to our format
    const transformedRestaurant = transformYelpData(restaurant);
    if (!transformedRestaurant) continue;

    // Get additional details and reviews for top results
    let enhancedPhotos: string[] = transformedRestaurant.photos || [];
    let enhancedReviews: string[] = [];
    
    if (combined.length < 10 && restaurant.id) {
      try {
        const [details, reviews, enhancedRestaurant] = await Promise.all([
          getYelpRestaurantDetails(restaurant.id),
          getYelpRestaurantReviews(restaurant.id, 5),
          enhanceRestaurantWithYelpMedia(transformedRestaurant, 5)
        ]);
        
        if (details) {
          transformedRestaurant.description = details.snippet_text || transformedRestaurant.description;
          transformedRestaurant.hours = details.hours?.[0]?.open?.map((day: any) => `${day.day}: ${day.start}-${day.end}`).join(', ') || transformedRestaurant.hours;
        }
        
        enhancedReviews = reviews.map((review: any) => review.text || review.comment).filter(Boolean);
        
        // Use enhanced photos from Yelp media
        if (enhancedRestaurant.photos && enhancedRestaurant.photos.length > 0) {
          enhancedPhotos = enhancedRestaurant.photos;
        }
      } catch (error) {
        console.error('[Yelp] Error getting additional data:', error);
      }
    }

    combined.push({
      id: transformedRestaurant.id,
      name: transformedRestaurant.name,
      cuisine: transformedRestaurant.cuisine,
      rating: transformedRestaurant.rating,
      priceLevel: transformedRestaurant.priceLevel,
      address: formatAddress(transformedRestaurant.address, userLocation.city),
      phone: transformedRestaurant.phone,
      website: transformedRestaurant.website,
      photos: enhancedPhotos,
      reviews: enhancedReviews.length > 0 ? enhancedReviews : [],
      hours: transformedRestaurant.hours,
      source: 'yelp',
      location: { 
        lat: restaurant.coordinates?.latitude || userLocation.lat, 
        lng: restaurant.coordinates?.longitude || userLocation.lng 
      },
      totalReviews: transformedRestaurant.totalReviews,
      vibeTags: transformedRestaurant.vibeTags,
      topPicks: transformedRestaurant.topPicks
    });
  }

  // Worldwide Restaurants
  for (const restaurant of worldwideResults) {
    if (!restaurant.name || seenNames.has(restaurant.name.toLowerCase())) continue;
    seenNames.add(restaurant.name.toLowerCase());

    // Transform Worldwide Restaurants data to our format
    const transformedRestaurant = transformWorldwideRestaurantData(restaurant);
    if (!transformedRestaurant) continue;

    // Get additional photos for top results
    let enhancedPhotos: string[] = transformedRestaurant.photos || [];
    
    if (combined.length < 10 && restaurant.id) {
      try {
        const photos = await getWorldwideRestaurantPhotos(restaurant.id, 5);
        if (photos.length > 0) {
          enhancedPhotos = photos;
        }
      } catch (error) {
        console.error('[Worldwide Restaurants] Error getting additional data:', error);
      }
    }

    combined.push({
      id: transformedRestaurant.id,
      name: transformedRestaurant.name,
      cuisine: transformedRestaurant.cuisine,
      rating: transformedRestaurant.rating,
      priceLevel: transformedRestaurant.priceLevel,
      address: formatAddress(transformedRestaurant.address, userLocation.city),
      phone: transformedRestaurant.phone,
      website: transformedRestaurant.website,
      photos: enhancedPhotos,
      reviews: transformedRestaurant.reviews || [],
      hours: transformedRestaurant.hours,
      source: 'worldwide_restaurants',
      location: { 
        lat: restaurant.latitude || restaurant.lat || userLocation.lat, 
        lng: restaurant.longitude || restaurant.lng || userLocation.lng 
      },
      totalReviews: transformedRestaurant.totalReviews,
      vibeTags: transformedRestaurant.vibeTags,
      topPicks: transformedRestaurant.topPicks
    });
  }

  // Uber Eats (for delivery options)
  for (const restaurant of uberEatsResults) {
    if (!restaurant.name || seenNames.has(restaurant.name.toLowerCase())) continue;
    seenNames.add(restaurant.name.toLowerCase());

    // Transform Uber Eats data to our format
    const transformedRestaurant = transformUberEatsData(restaurant);
    if (!transformedRestaurant) continue;

    // Get additional details for top results
    if (combined.length < 10 && restaurant.id) {
      try {
        const details = await getUberEatsRestaurantDetails(restaurant.id, `${userLocation.city}, ${userLocation.lat}, ${userLocation.lng}`);
        if (details) {
          transformedRestaurant.description = details.description || transformedRestaurant.description;
          transformedRestaurant.hours = details.hours || transformedRestaurant.hours;
          transformedRestaurant.deliveryTime = details.delivery_time || transformedRestaurant.deliveryTime;
          transformedRestaurant.deliveryFee = details.delivery_fee || transformedRestaurant.deliveryFee;
        }
      } catch (error) {
        console.error('[Uber Eats] Error getting additional data:', error);
      }
    }

    combined.push({
      id: transformedRestaurant.id,
      name: transformedRestaurant.name,
      cuisine: transformedRestaurant.cuisine,
      rating: transformedRestaurant.rating,
      priceLevel: transformedRestaurant.priceLevel,
      address: formatAddress(transformedRestaurant.address, userLocation.city),
      phone: transformedRestaurant.phone,
      website: transformedRestaurant.website,
      photos: transformedRestaurant.photos,
      reviews: transformedRestaurant.reviews || [],
      hours: transformedRestaurant.hours,
      source: 'uber_eats',
      location: { 
        lat: restaurant.latitude || restaurant.lat || userLocation.lat, 
        lng: restaurant.longitude || restaurant.lng || userLocation.lng 
      },
      totalReviews: transformedRestaurant.totalReviews,
      vibeTags: transformedRestaurant.vibeTags,
      topPicks: transformedRestaurant.topPicks,
      deliveryAvailable: true,
      deliveryTime: transformedRestaurant.deliveryTime,
      deliveryFee: transformedRestaurant.deliveryFee
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

// Helper function to calculate distance between two geographical points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// ============================================================================
// FOURSQUARE API INTEGRATION
// ============================================================================

// Autocomplete search using Foursquare API
export const searchFoursquareAutocomplete = async (
  query: string,
  lat?: number,
  lng?: number,
  radius: number = 5000
): Promise<any[]> => {
  try {
    console.log('[Foursquare] Autocomplete search for:', query);
    
    const params = new URLSearchParams({
      query,
      categories: '13065', // Food category
      limit: '10',
      radius: radius.toString()
    });
    
    if (lat && lng) {
      params.append('ll', `${lat},${lng}`);
    }
    
    const url = `${FOURSQUARE_BASE_URL}/autocomplete?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': FOURSQUARE_CLIENT_ID
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('[Foursquare] Authentication failed - check Client ID');
        throw new Error('Foursquare API authentication failed - please check your API key');
      }
      throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    console.log(`[Foursquare] Autocomplete found ${results.length} suggestions`);
    return results;
  } catch (error) {
    console.error('[Foursquare] Error in autocomplete search:', error);
    return [];
  }
};

// Search for restaurants using Foursquare API (v2 as primary, Places API as fallback)
export const searchFoursquareRestaurants = async (
  query: string, 
  lat?: number, 
  lng?: number, 
  radius: number = 5000
): Promise<any[]> => {
  try {
    console.log('[Foursquare] Searching for restaurants:', query);
    
    // In development mode, use local data only
    if (DEV_MODE) {
      console.log('[Foursquare] 🏠 Using local data only (development mode)');
      return await searchLocalRestaurants(query, undefined, 20);
    }
    
    // Check rate limits for Foursquare API
    if (!checkRateLimit('foursquare')) {
      console.log('[Foursquare] ⚠️ Rate limit exceeded, using local data');
      return await searchLocalRestaurants(query, undefined, 20);
    }
    
    console.log('[Foursquare] 🌐 Using external API (production mode)');
    
    // Try v2 API first (more reliable)
    console.log('[Foursquare] Using v2 API as primary method');
    const v2Results = await searchFoursquareRestaurantsV2(query, lat, lng, radius);
    
    if (v2Results.length > 0) {
      console.log(`[Foursquare v2] ✅ Success - Found ${v2Results.length} restaurants for query: "${query}"`);
      return v2Results;
    }
    
    // Skip Places API due to CORS issues in browser environment
    console.log('[Foursquare] v2 API failed, skipping Places API due to CORS restrictions');
    return [];
    
  } catch (error) {
    console.error('[Foursquare] Error searching restaurants:', error);
    // Fallback to local data
    console.log('[Foursquare] Falling back to local data');
    return await searchLocalRestaurants(query, undefined, 20);
  }
};

// Places API implementation (as fallback)
const searchFoursquareRestaurantsPlaces = async (
  query: string, 
  lat?: number, 
  lng?: number, 
  radius: number = 5000
): Promise<any[]> => {
  try {
    console.log('[Foursquare Places] Trying Places API as fallback');
    
    // Use the new Places API endpoint
    const url = `${FOURSQUARE_PLACES_BASE_URL}/places/search`;
    
    // Build query parameters for Places API
    const params = new URLSearchParams({
      query: query,
      categories: '13065', // Food category
      limit: '50',
      radius: radius.toString(),
      v: '20241201' // Required version parameter in YYYYMMDD format
    });
    
    if (lat && lng) {
      params.append('ll', `${lat},${lng}`);
    }
    
    console.log('[Foursquare Places] Using Places API with Bearer token authentication');
    
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${FOURSQUARE_PLACES_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const results = data.results || [];
      
      console.log(`[Foursquare Places] ✅ Success - Found ${results.length} restaurants for query: "${query}"`);
      return results;
    } else {
      console.error(`[Foursquare Places] ❌ API failed: ${response.status} ${response.statusText}`);
      return [];
    }
    
  } catch (error) {
    console.error('[Foursquare Places] Error searching restaurants:', error);
    return [];
  }
};

// Fallback function using Foursquare v2 API
const searchFoursquareRestaurantsV2 = async (
  query: string, 
  lat?: number, 
  lng?: number, 
  radius: number = 5000
): Promise<any[]> => {
  try {
    console.log('[Foursquare v2] Fallback search for restaurants:', query);
    
    // Use the v2 endpoint format
    const url = `${FOURSQUARE_NEW_BASE_URL}/venues/search`;
    
    // Build query parameters for v2 API
    const params = new URLSearchParams({
      query: query,
      categoryId: '4d4b7105d754a06374d81259', // Food category ID for restaurants
      limit: '50',
      radius: radius.toString(),
      sort: 'rating',
      v: '20241201' // API version in YYYYMMDD format
    });
    
    if (lat && lng) {
      params.append('ll', `${lat},${lng}`);
    }
    
    // Build URL with v2 authentication
    const fullUrl = buildFoursquareV2Url('/venues/search', params);
    
    console.log('[Foursquare v2] Using v2 API with client_id/client_secret authentication');
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const results = data.response?.venues || data.venues || [];
      
      console.log(`[Foursquare v2] ✅ Success - Found ${results.length} restaurants for query: "${query}"`);
      return results;
    } else {
      console.error(`[Foursquare v2] ❌ API failed: ${response.status} ${response.statusText}`);
    }
    
    return [];
    
  } catch (error) {
    console.error('[Foursquare v2] Error searching restaurants:', error);
    return [];
  }
};

// Get detailed information about a specific restaurant using Foursquare API (v2 as primary, Places API as fallback)
export const getFoursquareRestaurantDetails = async (fsqId: string): Promise<any> => {
  try {
    console.log('[Foursquare] Getting details for restaurant:', fsqId);
    
    // Try v2 API first (more reliable)
    console.log('[Foursquare] Using v2 API as primary method');
    const v2Details = await getFoursquareRestaurantDetailsV2(fsqId);
    
    if (v2Details) {
      console.log('[Foursquare v2] ✅ Success - Retrieved restaurant details');
      return v2Details;
    }
    
    // Skip Places API due to CORS issues in browser environment
    console.log('[Foursquare] v2 API failed, skipping Places API due to CORS restrictions');
    return null;
    
  } catch (error) {
    console.error('[Foursquare] Error getting restaurant details:', error);
    return null;
  }
};

// Places API implementation for restaurant details (as fallback)
const getFoursquareRestaurantDetailsPlaces = async (fsqId: string): Promise<any> => {
  try {
    console.log('[Foursquare Places] Trying Places API as fallback for details');
    
    // Use the new Places API endpoint
    const url = `${FOURSQUARE_PLACES_BASE_URL}/places/${fsqId}`;
    
    console.log('[Foursquare Places] Using Places API with Bearer token authentication');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${FOURSQUARE_PLACES_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[Foursquare Places] ✅ Success - Retrieved restaurant details');
      return data;
    } else {
      console.error(`[Foursquare Places] ❌ API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
  } catch (error) {
    console.error('[Foursquare Places] Error getting restaurant details:', error);
    return null;
  }
};

// Fallback function using Foursquare v2 API
const getFoursquareRestaurantDetailsV2 = async (fsqId: string): Promise<any> => {
  try {
    console.log('[Foursquare v2] Fallback getting details for restaurant:', fsqId);
    
    const url = `${FOURSQUARE_NEW_BASE_URL}/venues/${fsqId}`;
    
    // Build URL with v2 authentication
    const params = new URLSearchParams({
      v: '20241201' // API version in YYYYMMDD format
    });
    const fullUrl = buildFoursquareV2Url(`/venues/${fsqId}`, params);
    
    console.log('[Foursquare v2] Using v2 API with client_id/client_secret authentication');
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Rork-Nomi-App/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[Foursquare v2] ✅ Success - Retrieved restaurant details');
      return data.response?.venue || data.venue;
    } else {
      console.error(`[Foursquare v2] ❌ API failed: ${response.status} ${response.statusText}`);
    }
    
    return null;
    
  } catch (error) {
    console.error('[Foursquare v2] Error getting restaurant details:', error);
    return null;
  }
};

// Get nearby restaurants using Foursquare API v3 with fallback keys
export const getFoursquareNearbyRestaurants = async (
  lat: number,
  lng: number,
  radius: number = 5000,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[Foursquare] Getting nearby restaurants at:', lat, lng);
    
    // Use the new v2 endpoint format
    const url = `${FOURSQUARE_NEW_BASE_URL}/venues/search`;
    
    // Build query parameters for v2 API
    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: radius.toString(),
      categoryId: '4d4b7105d754a06374d81259', // Food category ID for restaurants
      limit: limit.toString(),
      sort: 'rating',
      v: '20231201' // API version
    });
    
    // Build URL with v2 authentication
    const fullUrl = buildFoursquareV2Url('/venues/search', params);
    
    console.log('[Foursquare] Using v2 API with client_id/client_secret authentication');
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
        
        if (response.ok) {
          const data = await response.json();
          const results = data.response?.venues || data.venues || [];
          
          console.log(`[Foursquare] ✅ Success - Found ${results.length} nearby restaurants`);
          return results;
        } else {
          console.error(`[Foursquare] ❌ API failed: ${response.status} ${response.statusText}`);
          
          if (response.status === 401) {
            console.error('[Foursquare] Authentication failed - check client_id and client_secret');
          } else if (response.status === 403) {
            console.error('[Foursquare] Access forbidden - insufficient permissions');
          }
        }
      } catch (error) {
        console.error('[Foursquare] Error getting nearby restaurants:', error);
      }
    
    console.error('[Foursquare] API failed - no nearby restaurants available');
    return [];
    
  } catch (error) {
    console.error('[Foursquare] Error getting nearby restaurants:', error);
    return [];
  }
};

// Get photos for a restaurant using Foursquare API (v2 as primary, Places API as fallback)
export const getFoursquareRestaurantPhotos = async (fsqId: string, limit: number = 10): Promise<string[]> => {
  try {
    console.log('[Foursquare] Getting photos for restaurant:', fsqId);
    
    // Try v2 API first (more reliable)
    console.log('[Foursquare] Using v2 API as primary method');
    const v2Photos = await getFoursquareRestaurantPhotosV2(fsqId, limit);
    
    if (v2Photos.length > 0) {
      console.log(`[Foursquare v2] ✅ Success - Retrieved ${v2Photos.length} photos for ${fsqId}`);
      return v2Photos;
    }
    
    // Skip Places API due to CORS issues in browser environment
    console.log('[Foursquare] v2 API returned no photos, skipping Places API due to CORS restrictions');
    return [];
    
  } catch (error) {
    console.error('[Foursquare] Error getting restaurant photos:', error);
    return [];
  }
};

// Places API implementation for restaurant photos (as fallback)
const getFoursquareRestaurantPhotosPlaces = async (fsqId: string, limit: number = 10): Promise<string[]> => {
  try {
    console.log('[Foursquare Places] Trying Places API as fallback for photos');
    
    // Use the new Places API endpoint
    const url = `${FOURSQUARE_PLACES_BASE_URL}/places/${fsqId}/photos`;
    
    console.log('[Foursquare Places] Using Places API with Bearer token authentication');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${FOURSQUARE_PLACES_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const photos = data.results || [];
      
      // Extract photo URLs from Places API response
      const photoUrls = photos.map((photo: any) => {
        // Handle Places API format
        if (photo.prefix && photo.suffix) {
          return `${photo.prefix}original${photo.suffix}`;
        }
        
        // Handle other formats
        if (photo.original && photo.original.url) {
          return photo.original.url;
        }
        
        return null;
      }).filter(Boolean);
      
      console.log(`[Foursquare Places] ✅ Success - Retrieved ${photoUrls.length} photos for ${fsqId}`);
      return photoUrls;
    } else {
      console.error(`[Foursquare Places] ❌ API failed: ${response.status} ${response.statusText}`);
      return [];
    }
    
  } catch (error) {
    console.error('[Foursquare Places] Error getting restaurant photos:', error);
    return [];
  }
};

// Fallback function using Foursquare v2 API
const getFoursquareRestaurantPhotosV2 = async (fsqId: string, limit: number = 10): Promise<string[]> => {
  try {
    console.log('[Foursquare v2] Fallback getting photos for restaurant:', fsqId);
    
    // Use the v2 endpoint format
    const url = `${FOURSQUARE_NEW_BASE_URL}/venues/${fsqId}/photos`;
    
    // Build URL with v2 authentication
    const params = new URLSearchParams({
      limit: limit.toString(),
      v: '20241201' // API version in YYYYMMDD format
    });
    const fullUrl = buildFoursquareV2Url(`/venues/${fsqId}/photos`, params);
    
    console.log('[Foursquare v2] Using v2 API with client_id/client_secret authentication');
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const photos = data.response?.photos?.items || data.photos?.items || [];
      
      // Extract photo URLs - handle v2 response format
      const photoUrls = photos.map((photo: any) => {
        // Handle v2 format (prefix + suffix)
        if (photo.prefix && photo.suffix) {
          return `${photo.prefix}original${photo.suffix}`;
        }
        
        // Handle other formats
        if (photo.original && photo.original.url) {
          return photo.original.url;
        }
        
        return null;
      }).filter(Boolean);
      
      console.log(`[Foursquare v2] ✅ Success - Retrieved ${photoUrls.length} photos for ${fsqId}`);
      return photoUrls;
    } else {
      console.error(`[Foursquare v2] ❌ API failed: ${response.status} ${response.statusText}`);
    }
    
    return [];
    
  } catch (error) {
    console.error('[Foursquare v2] Error getting restaurant photos:', error);
    return [];
  }
};

// Get tips/reviews for a restaurant with fallback keys
export const getFoursquareRestaurantTips = async (fsqId: string, limit: number = 20): Promise<any[]> => {
  try {
    console.log('[Foursquare] Getting tips for restaurant:', fsqId);
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort: 'popular',
      v: '20241201' // API version in YYYYMMDD format
    });
    
    const url = `${FOURSQUARE_NEW_BASE_URL}/venues/${fsqId}/tips?${params}`;
    
    // Build URL with v2 authentication
    const fullUrl = buildFoursquareV2Url(`/venues/${fsqId}/tips`, params);
    
    console.log('[Foursquare] Using v2 API with client_id/client_secret authentication');
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const tips = data.response?.tips?.items || data.tips?.items || [];
        
        console.log(`[Foursquare] ✅ Success - Retrieved ${tips.length} tips`);
        return tips;
      } else {
        console.error(`[Foursquare] ❌ API failed: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
          console.error('[Foursquare] Authentication failed - check client_id and client_secret');
        }
      }
    } catch (error) {
      console.error('[Foursquare] Error getting restaurant tips:', error);
    }
    
    console.error('[Foursquare] API failed for tips - no tips available');
    return [];
    
  } catch (error) {
    console.error('[Foursquare] Error getting restaurant tips:', error);
    return [];
  }
};

// Transform Foursquare restaurant data to our format
export const transformFoursquareRestaurant = (fsqData: any): any => {
  try {
    const location = fsqData.geocodes?.main || fsqData.geocodes?.roof || {};
    const categories = fsqData.categories || [];
    const stats = fsqData.stats || {};
    
    return {
      id: fsqData.fsq_id,
      name: fsqData.name,
      address: fsqData.location?.address || '',
      city: fsqData.location?.locality || '',
      state: fsqData.location?.region || '',
      zipCode: fsqData.location?.postcode || '',
      country: fsqData.location?.country || '',
      latitude: location.latitude,
      longitude: location.longitude,
      phone: fsqData.tel || '',
      website: fsqData.website || '',
      rating: fsqData.rating || 0,
      price: fsqData.price || 0,
      cuisine: categories.length > 0 ? categories[0].name : 'International',
      categories: categories.map((cat: any) => cat.name),
      hours: fsqData.hours?.display || 'Hours vary',
      isOpen: fsqData.hours?.open_now || false,
      totalPhotos: stats.total_photos || 0,
      totalTips: stats.total_tips || 0,
      totalVisits: stats.total_visits || 0,
      fsq_id: fsqData.fsq_id,
      source: 'foursquare'
    };
  } catch (error) {
    console.error('[Foursquare] Error transforming restaurant data:', error);
    return null;
  }
};

// Enhanced restaurant search that includes Foursquare data
export const searchRestaurantsWithFoursquare = async (
  query: string, 
  lat?: number, 
  lng?: number, 
  radius: number = 5000
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with Foursquare integration');
    
    // Search Foursquare
    const foursquareResults = await searchFoursquareRestaurants(query, lat, lng, radius);
    
    // Transform Foursquare results
    const transformedResults = foursquareResults
      .map(transformFoursquareRestaurant)
      .filter(Boolean);
    
    // Get additional details for top results
    const enhancedResults = await Promise.all(
      transformedResults.slice(0, 10).map(async (restaurant) => {
        try {
          // Get photos
          const photos = await getFoursquareRestaurantPhotos(restaurant.fsq_id, 5);
          
          // Get tips for description
          const tips = await getFoursquareRestaurantTips(restaurant.fsq_id, 5);
          const tipTexts = tips.map((tip: any) => tip.text).filter(Boolean);
          
          return {
            ...restaurant,
            photos,
            reviews: tipTexts,
            description: tipTexts.length > 0 ? tipTexts[0] : 'A great dining experience awaits.'
          };
        } catch (error) {
          console.error('[Foursquare] Error enhancing restaurant:', error);
          return restaurant;
        }
      })
    );
    
    console.log(`[API] Enhanced ${enhancedResults.length} restaurants with Foursquare data`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error in Foursquare-enhanced search:', error);
    return [];
  }
};

// Stock Photos API Integration
export const searchStockPhotos = async (query: string, limit: number = 10): Promise<any[]> => {
  try {
    console.log('[Stock Photos] Searching for:', query);
    
    const formData = new URLSearchParams();
    formData.append('query', query);
    formData.append('limit', limit.toString());
    
    const response = await fetch('https://stock-photos-and-videos.p.rapidapi.com/api/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': STOCK_PHOTOS_HOST,
        'x-rapidapi-key': STOCK_PHOTOS_API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Stock Photos API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const photos = data.data || [];
    
    console.log(`[Stock Photos] Retrieved ${photos.length} photos for "${query}"`);
    return photos;
  } catch (error) {
    console.error('[Stock Photos] Error searching photos:', error);
    return [];
  }
};

// Get a random stock photo for a given query
export const getRandomStockPhoto = async (query: string): Promise<string | null> => {
  try {
    const photos = await searchStockPhotos(query, 20);
    
    if (photos.length === 0) {
      console.log(`[Stock Photos] No photos found for "${query}"`);
      return null;
    }
    
    // Select a random photo from the results
    const randomIndex = Math.floor(Math.random() * photos.length);
    const selectedPhoto = photos[randomIndex];
    
    // Return the photo URL (adjust based on actual API response structure)
    const photoUrl = selectedPhoto.url || selectedPhoto.image_url || selectedPhoto.src;
    
    console.log(`[Stock Photos] Selected random photo for "${query}":`, photoUrl);
    return photoUrl;
  } catch (error) {
    console.error('[Stock Photos] Error getting random photo:', error);
    return null;
  }
};

// Enhanced collection cover image function using Stock Photos API
export const getEnhancedCollectionCoverImage = async (occasion: string): Promise<string> => {
  try {
    // Create search queries based on occasion
    const searchQueries = [
      `${occasion} restaurant`,
      `${occasion} dining`,
      `${occasion} food`,
      `${occasion} celebration`,
      `${occasion} meal`
    ];
    
    // Try each query until we find a photo
    for (const query of searchQueries) {
      const photoUrl = await getRandomStockPhoto(query);
      if (photoUrl) {
        console.log(`[Stock Photos] Found cover image for "${occasion}" using query: "${query}"`);
        return photoUrl;
      }
    }
    
    // Fallback to the original static images
    console.log(`[Stock Photos] No stock photos found for "${occasion}", using fallback`);
    return getCollectionCoverImage(occasion);
  } catch (error) {
    console.error('[Stock Photos] Error getting enhanced cover image:', error);
    // Fallback to original function
    return getCollectionCoverImage(occasion);
  }
};

// Restaurants API Integration
export const searchRestaurantsAPI = async (
  query: string, 
  location?: string, 
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[Restaurants API] Searching for:', query, 'in:', location);
    
    const formData = new URLSearchParams();
    formData.append('query', query);
    if (location) {
      formData.append('location', location);
    }
    formData.append('limit', limit.toString());
    
    const response = await fetch('https://restaurants222.p.rapidapi.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': RESTAURANTS_HOST,
        'x-rapidapi-key': RESTAURANTS_API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Restaurants API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const restaurants = data.data || data.results || [];
    
    console.log(`[Restaurants API] Retrieved ${restaurants.length} restaurants for "${query}"`);
    return restaurants;
  } catch (error) {
    console.error('[Restaurants API] Error searching restaurants:', error);
    return [];
  }
};

// Get restaurant photos
export const getRestaurantPhotosAPI = async (restaurantId: string, limit: number = 10): Promise<any[]> => {
  try {
    console.log('[Restaurants API] Getting photos for restaurant:', restaurantId);
    
    const formData = new URLSearchParams();
    formData.append('restaurant_id', restaurantId);
    formData.append('limit', limit.toString());
    
    const response = await fetch('https://restaurants222.p.rapidapi.com/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': RESTAURANTS_HOST,
        'x-rapidapi-key': RESTAURANTS_API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Restaurants API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const photos = data.data || data.photos || [];
    
    console.log(`[Restaurants API] Retrieved ${photos.length} photos for restaurant ${restaurantId}`);
    return photos;
  } catch (error) {
    console.error('[Restaurants API] Error getting restaurant photos:', error);
    return [];
  }
};

// Get restaurant reviews
export const getRestaurantReviewsAPI = async (restaurantId: string, limit: number = 20): Promise<any[]> => {
  try {
    console.log('[Restaurants API] Getting reviews for restaurant:', restaurantId);
    
    const formData = new URLSearchParams();
    formData.append('restaurant_id', restaurantId);
    formData.append('limit', limit.toString());
    
    const response = await fetch('https://restaurants222.p.rapidapi.com/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': RESTAURANTS_HOST,
        'x-rapidapi-key': RESTAURANTS_API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Restaurants API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const reviews = data.data || data.reviews || [];
    
    console.log(`[Restaurants API] Retrieved ${reviews.length} reviews for restaurant ${restaurantId}`);
    return reviews;
  } catch (error) {
    console.error('[Restaurants API] Error getting restaurant reviews:', error);
    return [];
  }
};

// Transform Restaurants API data to our format
export const transformRestaurantsAPIData = (apiData: any): any => {
  try {
    return {
      id: apiData.id || apiData.restaurant_id || `restaurant_${Date.now()}`,
      name: apiData.name || apiData.restaurant_name || 'Unknown Restaurant',
      address: apiData.address || apiData.location?.address || '',
      city: apiData.city || apiData.location?.city || '',
      state: apiData.state || apiData.location?.state || '',
      zipCode: apiData.zip_code || apiData.location?.zip_code || '',
      country: apiData.country || apiData.location?.country || '',
      latitude: apiData.latitude || apiData.location?.latitude || 0,
      longitude: apiData.longitude || apiData.location?.longitude || 0,
      phone: apiData.phone || apiData.contact?.phone || '',
      website: apiData.website || apiData.contact?.website || '',
      rating: apiData.rating || apiData.overall_rating || 0,
      price: apiData.price_level || apiData.price || 0,
      cuisine: apiData.cuisine || apiData.category || 'International',
      categories: apiData.categories || apiData.tags || [],
      hours: apiData.hours || apiData.opening_hours || 'Hours vary',
      isOpen: apiData.is_open || apiData.open_now || false,
      totalPhotos: apiData.total_photos || 0,
      totalReviews: apiData.total_reviews || apiData.review_count || 0,
      source: 'restaurants_api'
    };
  } catch (error) {
    console.error('[Restaurants API] Error transforming restaurant data:', error);
    return null;
  }
};

// Geocode location using Mapbox Geocoding API v6
const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    console.log('[Mapbox Geocoding v6] Geocoding location:', location);
    
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      q: location,
      limit: '1',
      types: 'place,locality,neighborhood',
      autocomplete: 'true'
    });
    
    const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const features = data.features || [];
      
      if (features.length > 0) {
        const coordinates = features[0].geometry?.coordinates;
        if (coordinates && coordinates.length >= 2) {
          const [lng, lat] = coordinates;
          console.log('[Mapbox Geocoding v6] Found coordinates:', lat, lng);
          return { lat, lng };
        }
      }
    } else {
      console.error('[Mapbox Geocoding v6] API error:', response.status, response.statusText);
    }
    
    console.log('[Mapbox Geocoding v6] No coordinates found for:', location);
    return null;
  } catch (error) {
    console.error('[Mapbox Geocoding v6] Error geocoding location:', error);
    return null;
  }
};

// Reverse geocode coordinates to location name using Mapbox Geocoding API v6
export const reverseGeocodeLocation = async (lat: number, lng: number): Promise<string | null> => {
  try {
    console.log('[Mapbox Geocoding v6] Reverse geocoding coordinates:', lat, lng);
    
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      longitude: lng.toString(),
      latitude: lat.toString(),
      type: 'place'
    });
    
    const url = `https://api.mapbox.com/search/geocode/v6/reverse?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const features = data.features || [];
      
      if (features.length > 0) {
        // Try to get the most relevant place name
        const feature = features[0];
        const placeName = feature.properties?.name || 
                         feature.properties?.place_name || 
                         feature.properties?.text ||
                         feature.properties?.address;
        console.log('[Mapbox Geocoding v6] Found location name:', placeName);
        return placeName;
      }
    } else {
      console.error('[Mapbox Geocoding v6] Reverse geocoding API error:', response.status, response.statusText);
    }
    
    console.log('[Mapbox Geocoding v6] No location name found for coordinates:', lat, lng);
    return null;
  } catch (error) {
    console.error('[Mapbox Geocoding v6] Error reverse geocoding:', error);
    return null;
  }
};

// Local restaurant search function for development mode
const searchLocalRestaurants = async (
  query: string, 
  location?: string, 
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] 🔍 Searching local restaurants...');
    console.log('[API] Query:', query);
    console.log('[API] Limit:', limit);
    
    // Get restaurants from database
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('[API] Error fetching local restaurants:', error);
      return [];
    }
    
    console.log(`[API] Total restaurants in database: ${restaurants?.length || 0}`);
    
    if (!restaurants || restaurants.length === 0) {
      console.log('[API] No local restaurants found in database');
      return [];
    }
    
    // Show first few restaurants for debugging
    console.log('[API] First 3 restaurants in database:', restaurants.slice(0, 3).map(r => ({ name: r.name, cuisine: r.cuisine })));
    
    // Filter restaurants based on query
    const queryLower = query.toLowerCase();
    console.log('[API] Searching for query:', queryLower);
    
    const filteredRestaurants = restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(queryLower) ||
      restaurant.cuisine.toLowerCase().includes(queryLower) ||
      restaurant.neighborhood.toLowerCase().includes(queryLower) ||
      restaurant.address.toLowerCase().includes(queryLower)
    );
    
    console.log(`[API] Filtered restaurants: ${filteredRestaurants.length}`);
    console.log('[API] Filtered restaurant names:', filteredRestaurants.map(r => r.name));
    
    // Transform to match the expected format
    const transformedRestaurants = filteredRestaurants.slice(0, limit).map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      priceRange: restaurant.price_range,
      rating: restaurant.rating,
      location: {
        address: restaurant.address,
        neighborhood: restaurant.neighborhood,
        formattedAddress: restaurant.address
      },
      images: restaurant.images || [],
      description: restaurant.description,
      hours: restaurant.hours,
      phone: restaurant.phone,
      website: restaurant.website,
      vibe: restaurant.vibe || [],
      menuHighlights: restaurant.menu_highlights || [],
      reviews: restaurant.reviews || [],
      aiDescription: restaurant.ai_description,
      aiVibes: restaurant.ai_vibes || [],
      aiTopPicks: restaurant.ai_top_picks || [],
      source: 'local',
      sourceId: restaurant.restaurant_code
    }));
    
    console.log(`[API] Found ${transformedRestaurants.length} local restaurants matching "${query}"`);
    console.log('[API] Returning restaurants:', transformedRestaurants.map(r => ({ name: r.name, cuisine: r.cuisine, source: r.source })));
    return transformedRestaurants;
  } catch (error) {
    console.error('[API] Error in local restaurant search:', error);
    return [];
  }
};

// Enhanced restaurant search with Mapbox Search Box API and Geocoding API
export const searchRestaurantsWithAPI = async (
  query: string, 
  location?: string, 
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants...');
    console.log('[API] Query:', query);
    console.log('[API] Location:', location);
    console.log('[API] Development Mode:', DEV_MODE ? 'ENABLED' : 'DISABLED');
    
    // In development mode, use local data only
    if (DEV_MODE) {
      console.log('[API] 🏠 Using local data only (development mode)');
      return await searchLocalRestaurants(query, location, limit);
    }
    
    // Check rate limits for external APIs
    if (!checkRateLimit('mapbox')) {
      console.log('[API] ⚠️ Mapbox rate limit exceeded, using local data');
      return await searchLocalRestaurants(query, location, limit);
    }
    
    console.log('[API] 🌐 Using external APIs (production mode)');
    
    // Get user location coordinates
    let lat = 40.7128; // Default to NYC
    let lng = -74.0060;
    
    // If location is provided, geocode it to get coordinates
    if (location) {
      try {
        const geocodedLocation = await geocodeLocation(location);
        if (geocodedLocation) {
          lat = geocodedLocation.lat;
          lng = geocodedLocation.lng;
        }
      } catch (error) {
        console.error('[API] Error geocoding location:', error);
      }
    }
    
    console.log('[API] Using coordinates:', lat, lng);
    
    // Search using Mapbox Search Box API
    console.log('[API] Calling searchMapboxRestaurants...');
    const mapboxResults = await searchMapboxRestaurants(query, lat, lng, 5000, limit);
    console.log('[API] Mapbox results:', mapboxResults?.length || 0);
    console.log('[API] First few Mapbox results:', mapboxResults?.slice(0, 2));
    
    const transformedMapbox = mapboxResults.map((result, index) => {
      console.log(`[API] Transforming Mapbox result ${index}:`, result?.name || result?.properties?.name || 'Unknown');
      const transformed = transformMapboxToRestaurant(result);
      if (!transformed) {
        console.log(`[API] Transformation failed for result ${index}`);
      }
      return transformed;
    }).filter(Boolean);
    console.log('[API] Transformed Mapbox results:', transformedMapbox?.length || 0);
    
    // Also try nearby search for more variety
    console.log('[API] Calling getMapboxNearbyRestaurants...');
    const nearbyResults = await getMapboxNearbyRestaurants(lat, lng, 5000, Math.floor(limit / 2));
    console.log('[API] Nearby results:', nearbyResults?.length || 0);
    
    const transformedNearby = nearbyResults.map((result, index) => {
      console.log(`[API] Transforming nearby result ${index}:`, result?.name || result?.properties?.name || 'Unknown');
      const transformed = transformMapboxToRestaurant(result);
      if (!transformed) {
        console.log(`[API] Transformation failed for nearby result ${index}`);
      }
      return transformed;
    }).filter(Boolean);
    console.log('[API] Transformed nearby results:', transformedNearby?.length || 0);
    
    // Combine and deduplicate results
    const allResults = [...transformedMapbox, ...transformedNearby];
    console.log('[API] Combined results:', allResults?.length || 0);
    
    const uniqueResults = allResults.filter((restaurant, index, self) => 
      index === self.findIndex(r => r.id === restaurant.id)
    ).slice(0, limit);
    
    console.log(`[API] Final unique results: ${uniqueResults.length} restaurants`);
    console.log('[API] First few final results:', uniqueResults?.slice(0, 2));
    return uniqueResults;
  } catch (error) {
    console.error('[API] Error in Mapbox API search:', error);
    
    // Fallback to local data
    console.log('[API] Falling back to local data');
    return await searchLocalRestaurants(query, location, limit);
  }
};

// Yelp Business API Integration
export const searchYelpRestaurants = async (
  location: string = 'New York, NY',
  searchCategory: string = 'Restaurants',
  limit: number = 10,
  offset: number = 0,
  businessDetailsType: string = 'basic'
): Promise<any[]> => {
  try {
    console.log('[Yelp API] Searching restaurants in:', location);
    
    // In development mode, use local data only
    if (DEV_MODE) {
      console.log('[Yelp API] 🏠 Using local data only (development mode)');
      return await searchLocalRestaurants('restaurant', location, limit);
    }
    
    // Check rate limits for Yelp API
    if (!checkRateLimit('yelp')) {
      console.log('[Yelp API] ⚠️ Rate limit exceeded, using local data');
      return await searchLocalRestaurants('restaurant', location, limit);
    }
    
    console.log('[Yelp API] 🌐 Using external API (production mode)');
    
    const params = new URLSearchParams({
      location: encodeURIComponent(location),
      search_category: searchCategory,
      limit: limit.toString(),
      offset: offset.toString(),
      business_details_type: businessDetailsType
    });
    
    const url = `https://yelp-business-api.p.rapidapi.com/search/category?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': YELP_HOST,
        'x-rapidapi-key': YELP_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[Yelp API] Found ${data.businesses?.length || 0} restaurants`);
    return data.businesses || [];
  } catch (error) {
    console.error('[Yelp API] Error searching restaurants:', error);
    // Fallback to local data
    console.log('[Yelp API] Falling back to local data');
    return await searchLocalRestaurants('restaurant', location, limit);
  }
};

export const getYelpRestaurantDetails = async (
  businessId: string
): Promise<any | null> => {
  try {
    console.log('[Yelp API] Getting restaurant details for:', businessId);
    
    const url = `https://yelp-business-api.p.rapidapi.com/business/${businessId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': YELP_HOST,
        'x-rapidapi-key': YELP_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('[Yelp API] Retrieved restaurant details');
    return data;
  } catch (error) {
    console.error('[Yelp API] Error getting restaurant details:', error);
    return null;
  }
};

export const getYelpRestaurantReviews = async (
  businessId: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    console.log('[Yelp API] Getting reviews for:', businessId);
    
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    const url = `https://yelp-business-api.p.rapidapi.com/business/${businessId}/reviews?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': YELP_HOST,
        'x-rapidapi-key': YELP_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[Yelp API] Retrieved ${data.reviews?.length || 0} reviews`);
    return data.reviews || [];
  } catch (error) {
    console.error('[Yelp API] Error getting reviews:', error);
    return [];
  }
};

export const transformYelpData = (yelpData: any): any => {
  try {
    return {
      id: yelpData.id || `yelp_${yelpData.alias || Date.now()}`,
      name: yelpData.name || 'Unknown Restaurant',
      cuisine: yelpData.categories?.map((cat: any) => cat.title).join(', ') || 'Restaurant',
      priceLevel: yelpData.price ? yelpData.price.length : 2,
      photos: yelpData.image_url ? [yelpData.image_url] : [],
      address: yelpData.location?.address1 || '',
      neighborhood: yelpData.location?.city || '',
      hours: yelpData.hours?.[0]?.open?.map((day: any) => `${day.day}: ${day.start}-${day.end}`).join(', ') || 'Hours vary',
      vibeTags: yelpData.categories?.map((cat: any) => cat.title) || [],
      description: yelpData.snippet_text || 'A great dining experience awaits.',
      topPicks: yelpData.transactions || [],
      rating: yelpData.rating || 0,
      reviews: [],
      phone: yelpData.phone || '',
      website: yelpData.url || '',
      distance: yelpData.distance ? `${(yelpData.distance / 1609.34).toFixed(1)} mi` : '',
      proximity: yelpData.distance || 0,
      totalReviews: yelpData.review_count || 0,
      source: 'yelp_api'
    };
  } catch (error) {
    console.error('[Yelp API] Error transforming restaurant data:', error);
    return null;
  }
};

export const searchRestaurantsWithYelp = async (
  query: string,
  location: string = 'New York, NY',
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with Yelp API');
    
    // Search using Yelp API
    const yelpResults = await searchYelpRestaurants(location, 'Restaurants', limit);
    
    // Transform results
    const transformedResults = yelpResults
      .map(transformYelpData)
      .filter(Boolean);
    
    // Enhance with additional data for top results
    const enhancedResults = await Promise.all(
      transformedResults.slice(0, 10).map(async (restaurant) => {
        try {
          // Get detailed information
          const details = await getYelpRestaurantDetails(restaurant.id);
          if (details) {
            restaurant.description = details.snippet_text || restaurant.description;
            restaurant.hours = details.hours?.[0]?.open?.map((day: any) => `${day.day}: ${day.start}-${day.end}`).join(', ') || restaurant.hours;
          }
          
          // Get reviews
          const reviews = await getYelpRestaurantReviews(restaurant.id, 5);
          const reviewTexts = reviews.map((review: any) => review.text || review.comment).filter(Boolean);
          restaurant.reviews = reviewTexts;
          
          return restaurant;
        } catch (error) {
          console.error('[Yelp API] Error enhancing restaurant:', error);
          return restaurant;
        }
      })
    );
    
    console.log(`[API] Enhanced ${enhancedResults.length} restaurants with Yelp API data`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error in Yelp API search:', error);
    return [];
  }
};

// Yelp API3 Search Suggestions with rate limiting and better error handling
export const getYelpSearchSuggestions = async (
  location: string = 'US',
  query?: string
): Promise<any[]> => {
  try {
    console.log('[Yelp API3] Getting search suggestions for:', location);
    
    // Add rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    const params = new URLSearchParams({
      location: encodeURIComponent(location)
    });
    
    // Add query parameter if provided
    if (query) {
      params.append('query', query);
    }
    
    const url = `https://yelp-api3.p.rapidapi.com/api/search-suggestions/?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': YELP_API3_HOST,
        'x-rapidapi-key': YELP_API3_KEY
      }
    });
    
    if (response.status === 429) {
      console.warn('[Yelp API3] Rate limit exceeded, returning empty results');
      return [];
    }
    
    if (response.status === 403) {
      console.warn('[Yelp API3] Access forbidden (403) - API key may not have access to this service');
      console.warn('[Yelp API3] Returning fallback suggestions instead');
      return getFallbackSearchSuggestions(location, query);
    }
    
    if (!response.ok) {
      console.error(`[Yelp API3] Error: ${response.status} ${response.statusText}`);
      return getFallbackSearchSuggestions(location, query);
    }
    
    const data = await response.json();
    
    console.log(`[Yelp API3] Retrieved ${data.suggestions?.length || 0} search suggestions`);
    return data.suggestions || [];
  } catch (error) {
    console.error('[Yelp API3] Error getting search suggestions:', error);
    return getFallbackSearchSuggestions(location, query);
  }
};

// Fallback search suggestions when Yelp API3 is not available
const getFallbackSearchSuggestions = (location: string, query?: string): any[] => {
  console.log('[Yelp API3] Using fallback search suggestions');
  
  const fallbackSuggestions = [
    { name: 'Italian Restaurant', category: 'Italian', location: location },
    { name: 'Chinese Restaurant', category: 'Chinese', location: location },
    { name: 'Mexican Restaurant', category: 'Mexican', location: location },
    { name: 'Japanese Restaurant', category: 'Japanese', location: location },
    { name: 'American Restaurant', category: 'American', location: location },
    { name: 'Thai Restaurant', category: 'Thai', location: location },
    { name: 'Indian Restaurant', category: 'Indian', location: location },
    { name: 'French Restaurant', category: 'French', location: location },
    { name: 'Mediterranean Restaurant', category: 'Mediterranean', location: location },
    { name: 'Pizza Place', category: 'Pizza', location: location },
    { name: 'Burger Joint', category: 'Burgers', location: location },
    { name: 'Sushi Bar', category: 'Sushi', location: location },
    { name: 'Steakhouse', category: 'Steakhouse', location: location },
    { name: 'Seafood Restaurant', category: 'Seafood', location: location },
    { name: 'BBQ Restaurant', category: 'BBQ', location: location }
  ];
  
  // Filter by query if provided
  if (query) {
    const queryLower = query.toLowerCase();
    return fallbackSuggestions.filter(suggestion => 
      suggestion.name.toLowerCase().includes(queryLower) ||
      suggestion.category.toLowerCase().includes(queryLower)
    );
  }
  
  return fallbackSuggestions;
};

export const getYelpAutocompleteSuggestions = async (
  query: string,
  location: string = 'US'
): Promise<string[]> => {
  try {
    console.log('[Yelp API3] Getting autocomplete suggestions for:', query);
    
    const suggestions = await getYelpSearchSuggestions(location, query);
    
    // Extract restaurant names and categories from suggestions
    const autocompleteSuggestions: string[] = [];
    
    suggestions.forEach((suggestion: any) => {
      // Add restaurant names
      if (suggestion.name && typeof suggestion.name === 'string') {
        autocompleteSuggestions.push(suggestion.name);
      }
      
      // Add cuisine types/categories
      if (suggestion.category && typeof suggestion.category === 'string') {
        autocompleteSuggestions.push(suggestion.category);
      }
      
      // Add location suggestions
      if (suggestion.location && typeof suggestion.location === 'string') {
        autocompleteSuggestions.push(suggestion.location);
      }
    });
    
    // Remove duplicates and limit results
    const uniqueSuggestions = [...new Set(autocompleteSuggestions)].slice(0, 10);
    
    console.log(`[Yelp API3] Generated ${uniqueSuggestions.length} autocomplete suggestions`);
    return uniqueSuggestions;
  } catch (error) {
    console.error('[Yelp API3] Error getting autocomplete suggestions:', error);
    return [];
  }
};

export const getYelpPopularSearches = async (
  location: string = 'US'
): Promise<string[]> => {
  try {
    console.log('[Yelp API3] Getting popular searches for:', location);
    
    const suggestions = await getYelpSearchSuggestions(location);
    
    // Extract popular search terms
    const popularSearches: string[] = [];
    
    suggestions.forEach((suggestion: any) => {
      // Add popular restaurant types
      if (suggestion.category && typeof suggestion.category === 'string') {
        popularSearches.push(suggestion.category);
      }
      
      // Add popular location searches
      if (suggestion.location && typeof suggestion.location === 'string') {
        popularSearches.push(suggestion.location);
      }
    });
    
    // Remove duplicates and limit results
    const uniqueSearches = [...new Set(popularSearches)].slice(0, 15);
    
    console.log(`[Yelp API3] Generated ${uniqueSearches.length} popular searches`);
    return uniqueSearches;
  } catch (error) {
    console.error('[Yelp API3] Error getting popular searches:', error);
    // Return fallback popular searches
    return [
      'Italian Restaurant',
      'Chinese Restaurant', 
      'Mexican Restaurant',
      'Japanese Restaurant',
      'American Restaurant',
      'Thai Restaurant',
      'Indian Restaurant',
      'Pizza Place',
      'Burger Joint',
      'Sushi Bar',
      'Steakhouse',
      'Seafood Restaurant'
    ];
  }
};

// Yelp API3 Business Media Search
export const getYelpBusinessMedia = async (
  limit: number = 10,
  offset: number = 0
): Promise<any[]> => {
  try {
    console.log('[Yelp API3] Getting business media, limit:', limit, 'offset:', offset);
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const url = `https://yelp-api3.p.rapidapi.com/api/search-business-media/?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': YELP_API3_HOST,
        'x-rapidapi-key': YELP_API3_KEY
      }
    });
    
    if (response.status === 403) {
      console.warn('[Yelp API3] Access forbidden (403) - API key may not have access to business media service');
      return [];
    }
    
    if (!response.ok) {
      console.error(`[Yelp API3] Error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    console.log(`[Yelp API3] Retrieved ${data.media?.length || 0} business media items`);
    return data.media || [];
  } catch (error) {
    console.error('[Yelp API3] Error getting business media:', error);
    return [];
  }
};

export const getYelpRestaurantPhotos = async (
  limit: number = 10
): Promise<string[]> => {
  try {
    console.log('[Yelp API3] Getting restaurant photos, limit:', limit);
    
    const mediaItems = await getYelpBusinessMedia(limit, 0);
    
    // Extract photo URLs from media items
    const photoUrls: string[] = [];
    
    mediaItems.forEach((item: any) => {
      // Check for photo URLs in various possible fields
      if (item.photo_url && typeof item.photo_url === 'string') {
        photoUrls.push(item.photo_url);
      } else if (item.image_url && typeof item.image_url === 'string') {
        photoUrls.push(item.image_url);
      } else if (item.url && typeof item.url === 'string' && item.url.includes('http')) {
        photoUrls.push(item.url);
      } else if (item.media_url && typeof item.media_url === 'string') {
        photoUrls.push(item.media_url);
      }
    });
    
    // Remove duplicates and limit results
    const uniquePhotos = [...new Set(photoUrls)].slice(0, limit);
    
    console.log(`[Yelp API3] Extracted ${uniquePhotos.length} unique restaurant photos`);
    return uniquePhotos;
  } catch (error) {
    console.error('[Yelp API3] Error getting restaurant photos:', error);
    return [];
  }
};

export const getYelpRestaurantMediaByCategory = async (
  category: string = 'restaurants',
  limit: number = 10
): Promise<any[]> => {
  try {
    console.log('[Yelp API3] Getting restaurant media for category:', category);
    
    const mediaItems = await getYelpBusinessMedia(limit * 2, 0); // Get more items to filter by category
    
    // Filter media items by category
    const filteredMedia = mediaItems.filter((item: any) => {
      const itemCategory = item.category || item.business_category || item.type || '';
      return itemCategory.toLowerCase().includes(category.toLowerCase()) ||
             itemCategory.toLowerCase().includes('restaurant') ||
             itemCategory.toLowerCase().includes('food');
    });
    
    // Limit results
    const limitedMedia = filteredMedia.slice(0, limit);
    
    console.log(`[Yelp API3] Found ${limitedMedia.length} media items for category: ${category}`);
    return limitedMedia;
  } catch (error) {
    console.error('[Yelp API3] Error getting restaurant media by category:', error);
    return [];
  }
};

export const enhanceRestaurantWithYelpMedia = async (
  restaurant: any,
  limit: number = 5
): Promise<any> => {
  try {
    console.log('[Yelp API3] Enhancing restaurant with media:', restaurant.name);
    
    // Get restaurant photos
    const photos = await getYelpRestaurantPhotos(limit);
    
    // Get category-specific media
    const cuisine = restaurant.cuisine || 'restaurant';
    const categoryMedia = await getYelpRestaurantMediaByCategory(cuisine, 3);
    
    // Combine and enhance photos
    const enhancedPhotos = [...new Set([...photos, ...categoryMedia.map((item: any) => item.photo_url || item.image_url).filter(Boolean)])];
    
    // Update restaurant with enhanced media
    const enhancedRestaurant = {
      ...restaurant,
      photos: enhancedPhotos.length > 0 ? enhancedPhotos : restaurant.photos,
      yelpMedia: categoryMedia
    };
    
    console.log(`[Yelp API3] Enhanced restaurant with ${enhancedPhotos.length} photos`);
    return enhancedRestaurant;
  } catch (error) {
    console.error('[Yelp API3] Error enhancing restaurant with media:', error);
    return restaurant;
  }
};

// Worldwide Restaurants API Integration
export const searchWorldwideRestaurants = async (
  query: string,
  location?: string,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[Worldwide Restaurants API] Searching restaurants for:', query);
    
    // Ensure we have valid parameters
    if (!query || query.trim().length === 0) {
      console.log('[Worldwide Restaurants API] Empty query, skipping search');
      return [];
    }
    
    const formData = new URLSearchParams();
    formData.append('query', query.trim());
    
    // Only add location if it's valid
    if (location && location.trim().length > 0) {
      formData.append('location', location.trim());
    }
    
    // Ensure limit is within reasonable bounds
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    formData.append('limit', safeLimit.toString());
    
    console.log('[Worldwide Restaurants API] Request data:', {
      query: query.trim(),
      location: location?.trim(),
      limit: safeLimit
    });
    
    const response = await fetch('https://worldwide-restaurants.p.rapidapi.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': WORLDWIDE_RESTAURANTS_HOST,
        'x-rapidapi-key': WORLDWIDE_RESTAURANTS_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`[Worldwide Restaurants API] HTTP error: ${response.status} ${response.statusText}`);
      
      // Try to get error details
      try {
        const errorData = await response.text();
        console.error('[Worldwide Restaurants API] Error response:', errorData);
      } catch (e) {
        console.error('[Worldwide Restaurants API] Could not read error response');
      }
      
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
    
    const data = await response.json();
    
    console.log(`[Worldwide Restaurants API] Found ${data.results?.length || 0} restaurants`);
    return data.results || [];
  } catch (error) {
    console.error('[Worldwide Restaurants API] Error searching restaurants:', error);
    // Return empty array to prevent app crashes
    return [];
  }
};

export const getWorldwideRestaurantPhotos = async (
  restaurantId: string,
  limit: number = 10
): Promise<string[]> => {
  try {
    console.log('[Worldwide Restaurants API] Getting photos for restaurant:', restaurantId);
    
    const formData = new URLSearchParams();
    formData.append('restaurant_id', restaurantId);
    formData.append('limit', limit.toString());
    
    const response = await fetch('https://worldwide-restaurants.p.rapidapi.com/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': WORLDWIDE_RESTAURANTS_HOST,
        'x-rapidapi-key': WORLDWIDE_RESTAURANTS_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Worldwide Restaurants API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract photo URLs from the response
    const photoUrls: string[] = [];
    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach((photo: any) => {
        if (photo.url && typeof photo.url === 'string') {
          photoUrls.push(photo.url);
        } else if (photo.photo_url && typeof photo.photo_url === 'string') {
          photoUrls.push(photo.photo_url);
        } else if (photo.image_url && typeof photo.image_url === 'string') {
          photoUrls.push(photo.image_url);
        }
      });
    }
    
    console.log(`[Worldwide Restaurants API] Retrieved ${photoUrls.length} photos`);
    return photoUrls;
  } catch (error) {
    console.error('[Worldwide Restaurants API] Error getting photos:', error);
    return [];
  }
};

export const getWorldwideRestaurantTypeahead = async (
  query: string,
  location?: string
): Promise<string[]> => {
  try {
    console.log('[Worldwide Restaurants API] Getting typeahead suggestions for:', query);
    
    const formData = new URLSearchParams();
    formData.append('query', query);
    if (location) {
      formData.append('location', location);
    }
    
    const response = await fetch('https://worldwide-restaurants.p.rapidapi.com/typeahead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': WORLDWIDE_RESTAURANTS_HOST,
        'x-rapidapi-key': WORLDWIDE_RESTAURANTS_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Worldwide Restaurants API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract suggestions from the response
    const suggestions: string[] = [];
    if (data.suggestions && Array.isArray(data.suggestions)) {
      data.suggestions.forEach((suggestion: any) => {
        if (suggestion.name && typeof suggestion.name === 'string') {
          suggestions.push(suggestion.name);
        } else if (suggestion.text && typeof suggestion.text === 'string') {
          suggestions.push(suggestion.text);
        } else if (suggestion.query && typeof suggestion.query === 'string') {
          suggestions.push(suggestion.query);
        }
      });
    }
    
    console.log(`[Worldwide Restaurants API] Retrieved ${suggestions.length} typeahead suggestions`);
    return suggestions;
  } catch (error) {
    console.error('[Worldwide Restaurants API] Error getting typeahead suggestions:', error);
    return [];
  }
};

export const transformWorldwideRestaurantData = (restaurant: any): any => {
  try {
    return {
      id: restaurant.id || restaurant.restaurant_id || `worldwide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: restaurant.name || restaurant.restaurant_name || 'Unknown Restaurant',
      cuisine: restaurant.cuisine || restaurant.cuisine_type || restaurant.category || 'Restaurant',
      priceLevel: restaurant.price_level || restaurant.price || 2,
      photos: restaurant.photos || restaurant.images || [],
      address: restaurant.address || restaurant.location || '',
      neighborhood: restaurant.neighborhood || restaurant.city || '',
      hours: restaurant.hours || restaurant.opening_hours || 'Hours vary',
      vibeTags: restaurant.tags || restaurant.categories || [],
      description: restaurant.description || restaurant.summary || 'A great dining experience awaits.',
      topPicks: restaurant.menu_highlights || restaurant.popular_dishes || [],
      rating: restaurant.rating || restaurant.avg_rating || 0,
      reviews: restaurant.reviews || [],
      phone: restaurant.phone || restaurant.phone_number || '',
      website: restaurant.website || restaurant.url || '',
      distance: restaurant.distance ? `${(restaurant.distance / 1609.34).toFixed(1)} mi` : '',
      proximity: restaurant.distance || 0,
      totalReviews: restaurant.review_count || restaurant.total_reviews || 0,
      source: 'worldwide_restaurants_api'
    };
  } catch (error) {
    console.error('[Worldwide Restaurants API] Error transforming restaurant data:', error);
    return null;
  }
};

export const searchRestaurantsWithWorldwideAPI = async (
  query: string,
  location: string = 'New York, NY',
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with Worldwide Restaurants API');
    
    // Search using Worldwide Restaurants API
    const worldwideResults = await searchWorldwideRestaurants(query, location, limit);
    
    // Transform results
    const transformedResults = worldwideResults
      .map(transformWorldwideRestaurantData)
      .filter(Boolean);
    
    // Enhance with additional data for top results
    const enhancedResults = await Promise.all(
      transformedResults.slice(0, 10).map(async (restaurant) => {
        try {
          // Get photos for the restaurant
          const photos = await getWorldwideRestaurantPhotos(restaurant.id, 5);
          if (photos.length > 0) {
            restaurant.photos = photos;
          }
          
          return restaurant;
        } catch (error) {
          console.error('[Worldwide Restaurants API] Error enhancing restaurant:', error);
          return restaurant;
        }
      })
    );
    
    console.log(`[API] Enhanced ${enhancedResults.length} restaurants with Worldwide Restaurants API data`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error in Worldwide Restaurants API search:', error);
    return [];
  }
};

// Uber Eats API Integration
export const searchUberEatsRestaurants = async (
  query: string,
  address: string,
  locale: string = 'en-US',
  maxRows: number = 15,
  page: number = 1
): Promise<any[]> => {
  try {
    console.log('[Uber Eats API] Searching restaurants for:', query, 'at:', address);
    
    const requestData = {
      scraper: {
        maxRows,
        query,
        address,
        locale,
        page
      }
    };
    
    const response = await fetch('https://uber-eats-scraper-api.p.rapidapi.com/api/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': UBER_EATS_HOST,
        'x-rapidapi-key': UBER_EATS_KEY
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Uber Eats API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[Uber Eats API] Found ${data.restaurants?.length || 0} restaurants`);
    return data.restaurants || [];
  } catch (error) {
    console.error('[Uber Eats API] Error searching restaurants:', error);
    return [];
  }
};

export const getUberEatsRestaurantDetails = async (
  restaurantId: string,
  address: string
): Promise<any | null> => {
  try {
    console.log('[Uber Eats API] Getting restaurant details for:', restaurantId);
    
    const requestData = {
      scraper: {
        restaurantId,
        address
      }
    };
    
    const response = await fetch('https://uber-eats-scraper-api.p.rapidapi.com/api/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': UBER_EATS_HOST,
        'x-rapidapi-key': UBER_EATS_KEY
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Uber Eats API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('[Uber Eats API] Retrieved restaurant details');
    return data;
  } catch (error) {
    console.error('[Uber Eats API] Error getting restaurant details:', error);
    return null;
  }
};

export const transformUberEatsData = (restaurant: any): any => {
  try {
    return {
      id: restaurant.id || restaurant.restaurant_id || `ubereats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: restaurant.name || restaurant.restaurant_name || 'Unknown Restaurant',
      cuisine: restaurant.cuisine || restaurant.cuisine_type || restaurant.category || 'Restaurant',
      priceLevel: restaurant.price_level || restaurant.price || 2,
      photos: restaurant.photos || restaurant.images || restaurant.image_url ? [restaurant.image_url] : [],
      address: restaurant.address || restaurant.location || '',
      neighborhood: restaurant.neighborhood || restaurant.city || '',
      hours: restaurant.hours || restaurant.opening_hours || 'Hours vary',
      vibeTags: restaurant.tags || restaurant.categories || [],
      description: restaurant.description || restaurant.summary || 'Available for delivery via Uber Eats.',
      topPicks: restaurant.menu_highlights || restaurant.popular_dishes || restaurant.featured_items || [],
      rating: restaurant.rating || restaurant.avg_rating || 0,
      reviews: restaurant.reviews || [],
      phone: restaurant.phone || restaurant.phone_number || '',
      website: restaurant.website || restaurant.url || '',
      distance: restaurant.distance ? `${(restaurant.distance / 1609.34).toFixed(1)} mi` : '',
      proximity: restaurant.distance || 0,
      totalReviews: restaurant.review_count || restaurant.total_reviews || 0,
      deliveryAvailable: true,
      deliveryTime: restaurant.delivery_time || restaurant.estimated_delivery || '30-45 min',
      deliveryFee: restaurant.delivery_fee || restaurant.fee || '$2.99',
      source: 'uber_eats_api'
    };
  } catch (error) {
    console.error('[Uber Eats API] Error transforming restaurant data:', error);
    return null;
  }
};

export const searchRestaurantsWithUberEats = async (
  query: string,
  address: string,
  locale: string = 'en-US',
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with Uber Eats API');
    
    // Search using Uber Eats API
    const uberEatsResults = await searchUberEatsRestaurants(query, address, locale, limit);
    
    // Transform results
    const transformedResults = uberEatsResults
      .map(transformUberEatsData)
      .filter(Boolean);
    
    // Enhance with additional data for top results
    const enhancedResults = await Promise.all(
      transformedResults.slice(0, 10).map(async (restaurant) => {
        try {
          // Get detailed information if available
          const details = await getUberEatsRestaurantDetails(restaurant.id, address);
          if (details) {
            restaurant.description = details.description || restaurant.description;
            restaurant.hours = details.hours || restaurant.hours;
            restaurant.deliveryTime = details.delivery_time || restaurant.deliveryTime;
            restaurant.deliveryFee = details.delivery_fee || restaurant.deliveryFee;
          }
          
          return restaurant;
        } catch (error) {
          console.error('[Uber Eats API] Error enhancing restaurant:', error);
          return restaurant;
        }
      })
    );
    
    console.log(`[API] Enhanced ${enhancedResults.length} restaurants with Uber Eats API data`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error in Uber Eats API search:', error);
    return [];
  }
};

export const checkDeliveryAvailability = async (
  restaurantName: string,
  address: string
): Promise<{ available: boolean; deliveryTime?: string; deliveryFee?: string }> => {
  try {
    console.log('[Uber Eats API] Checking delivery availability for:', restaurantName);
    
    const results = await searchUberEatsRestaurants(restaurantName, address, 'en-US', 5);
    
    // Check if the restaurant is available for delivery
    const matchingRestaurant = results.find(restaurant => 
      restaurant.name?.toLowerCase().includes(restaurantName.toLowerCase()) ||
      restaurantName.toLowerCase().includes(restaurant.name?.toLowerCase())
    );
    
    if (matchingRestaurant) {
      return {
        available: true,
        deliveryTime: matchingRestaurant.delivery_time || matchingRestaurant.estimated_delivery || '30-45 min',
        deliveryFee: matchingRestaurant.delivery_fee || matchingRestaurant.fee || '$2.99'
      };
    }
    
    return { available: false };
  } catch (error) {
    console.error('[Uber Eats API] Error checking delivery availability:', error);
    return { available: false };
  }
};

// TripAdvisor RapidAPI Integration
export const getTripAdvisorRestaurantDetails = async (
  restaurantId: string,
  currencyCode: string = 'USD'
): Promise<any | null> => {
  try {
    console.log('[TripAdvisor RapidAPI] Getting restaurant details for:', restaurantId);
    
    const params = new URLSearchParams({
      currencyCode,
      restaurantId
    });
    
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/getRestaurantDetailsV2?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': TRIPADVISOR_RAPIDAPI_HOST,
        'x-rapidapi-key': TRIPADVISOR_RAPIDAPI_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor RapidAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('[TripAdvisor RapidAPI] Retrieved restaurant details');
    return data;
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error getting restaurant details:', error);
    return null;
  }
};

// Search TripAdvisor restaurants by query
export const searchTripAdvisorRestaurants = async (
  query: string,
  location?: string,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[TripAdvisor RapidAPI] Searching for:', query, 'in:', location);
    
    // In development mode, use local data only
    if (DEV_MODE) {
      console.log('[TripAdvisor RapidAPI] 🏠 Using local data only (development mode)');
      return await searchLocalRestaurants(query, location, limit);
    }
    
    // Check rate limits for TripAdvisor API
    if (!checkRateLimit('tripadvisor')) {
      console.log('[TripAdvisor RapidAPI] ⚠️ Rate limit exceeded, using local data');
      return await searchLocalRestaurants(query, location, limit);
    }
    
    console.log('[TripAdvisor RapidAPI] 🌐 Using external API (production mode)');
    
    const params = new URLSearchParams({
      query,
      limit: limit.toString()
    });
    
    if (location) {
      params.append('location', location);
    }
    
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/search?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': TRIPADVISOR_RAPIDAPI_HOST,
        'x-rapidapi-key': TRIPADVISOR_RAPIDAPI_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor RapidAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const restaurants = data.data || data.results || [];
    
    console.log(`[TripAdvisor RapidAPI] Retrieved ${restaurants.length} restaurants for "${query}"`);
    return restaurants;
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error searching restaurants:', error);
    // Fallback to local data
    console.log('[TripAdvisor RapidAPI] Falling back to local data');
    return await searchLocalRestaurants(query, location, limit);
  }
};

// Search TripAdvisor restaurants by location ID
export const searchTripAdvisorRestaurantsByLocation = async (
  locationId: string,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[TripAdvisor RapidAPI] Searching restaurants by location ID:', locationId);
    
    const params = new URLSearchParams({
      locationId,
      limit: limit.toString()
    });
    
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': TRIPADVISOR_RAPIDAPI_HOST,
        'x-rapidapi-key': TRIPADVISOR_RAPIDAPI_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor RapidAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const restaurants = data.data || data.results || [];
    
    console.log(`[TripAdvisor RapidAPI] Retrieved ${restaurants.length} restaurants for location ID ${locationId}`);
    return restaurants;
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error searching restaurants by location:', error);
    return [];
  }
};

// Search TripAdvisor locations
export const searchTripAdvisorLocations = async (
  query: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    console.log('[TripAdvisor RapidAPI] Searching locations for:', query);
    
    const params = new URLSearchParams({
      query,
      limit: limit.toString()
    });
    
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchLocation?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': TRIPADVISOR_RAPIDAPI_HOST,
        'x-rapidapi-key': TRIPADVISOR_RAPIDAPI_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor RapidAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const locations = data.data || data.results || [];
    
    console.log(`[TripAdvisor RapidAPI] Retrieved ${locations.length} locations for "${query}"`);
    return locations;
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error searching locations:', error);
    return [];
  }
};

// Get TripAdvisor restaurant photos
export const getTripAdvisorRestaurantPhotos = async (
  restaurantId: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    console.log('[TripAdvisor RapidAPI] Getting photos for restaurant:', restaurantId);
    
    const params = new URLSearchParams({
      restaurantId,
      limit: limit.toString()
    });
    
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/getRestaurantPhotos?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': TRIPADVISOR_RAPIDAPI_HOST,
        'x-rapidapi-key': TRIPADVISOR_RAPIDAPI_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor RapidAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const photos = data.data || data.photos || [];
    
    console.log(`[TripAdvisor RapidAPI] Retrieved ${photos.length} photos for restaurant ${restaurantId}`);
    return photos;
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error getting restaurant photos:', error);
    return [];
  }
};

// Get TripAdvisor restaurant reviews
export const getTripAdvisorRestaurantReviews = async (
  restaurantId: string,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[TripAdvisor RapidAPI] Getting reviews for restaurant:', restaurantId);
    
    const params = new URLSearchParams({
      restaurantId,
      limit: limit.toString()
    });
    
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/getRestaurantReviews?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': TRIPADVISOR_RAPIDAPI_HOST,
        'x-rapidapi-key': TRIPADVISOR_RAPIDAPI_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor RapidAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const reviews = data.data || data.reviews || [];
    
    console.log(`[TripAdvisor RapidAPI] Retrieved ${reviews.length} reviews for restaurant ${restaurantId}`);
    return reviews;
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error getting restaurant reviews:', error);
    return [];
  }
};

// Transform TripAdvisor RapidAPI data to our format
export const transformTripAdvisorRapidAPIData = (apiData: any): any => {
  try {
    return {
      id: apiData.location_id || apiData.restaurant_id || `tripadvisor_${Date.now()}`,
      name: apiData.name || apiData.restaurant_name || 'Unknown Restaurant',
      address: apiData.address_string || apiData.address || '',
      city: apiData.city || apiData.location?.city || '',
      state: apiData.state || apiData.location?.state || '',
      zipCode: apiData.postal_code || apiData.location?.postal_code || '',
      country: apiData.country || apiData.location?.country || '',
      latitude: apiData.latitude || apiData.location?.latitude || 0,
      longitude: apiData.longitude || apiData.location?.longitude || 0,
      phone: apiData.phone || apiData.contact?.phone || '',
      website: apiData.website || apiData.contact?.website || '',
      rating: apiData.rating || apiData.overall_rating || 0,
      price: apiData.price_level || apiData.price || 0,
      cuisine: apiData.cuisine || apiData.category || 'International',
      categories: apiData.categories || apiData.tags || [],
      hours: apiData.hours || apiData.opening_hours || 'Hours vary',
      isOpen: apiData.is_open || apiData.open_now || false,
      totalPhotos: apiData.total_photos || 0,
      totalReviews: apiData.num_reviews || apiData.review_count || 0,
      tripadvisor_id: apiData.location_id,
      source: 'tripadvisor_rapidapi'
    };
  } catch (error) {
    console.error('[TripAdvisor RapidAPI] Error transforming restaurant data:', error);
    return null;
  }
};

// Enhanced restaurant search with TripAdvisor RapidAPI
export const searchRestaurantsWithTripAdvisorRapidAPI = async (
  query: string,
  location?: string,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with TripAdvisor RapidAPI');
    
    let apiResults: any[] = [];
    
    // If location is provided, try to find restaurants in that specific location
    if (location) {
      try {
        // First, search for the location to get its ID
        const locations = await searchTripAdvisorLocations(location, 5);
        if (locations.length > 0) {
          const locationId = locations[0].location_id || locations[0].id;
          console.log(`[TripAdvisor RapidAPI] Found location ID ${locationId} for "${location}"`);
          
          // Search restaurants in this location
          const locationRestaurants = await searchTripAdvisorRestaurantsByLocation(locationId, limit);
          apiResults = locationRestaurants;
        }
      } catch (error) {
        console.error('[TripAdvisor RapidAPI] Error searching by location, falling back to query search:', error);
      }
    }
    
    // If no results from location search, fall back to query search
    if (apiResults.length === 0) {
      apiResults = await searchTripAdvisorRestaurants(query, location, limit);
    }
    
    // Transform results
    const transformedResults = apiResults
      .map(transformTripAdvisorRapidAPIData)
      .filter(Boolean);
    
    // Enhance with additional data for top results
    const enhancedResults = await Promise.all(
      transformedResults.slice(0, 10).map(async (restaurant) => {
        try {
          // Get photos
          const photos = await getTripAdvisorRestaurantPhotos(restaurant.tripadvisor_id, 5);
          const photoUrls = photos.map((photo: any) => photo.url || photo.image_url || photo.src).filter(Boolean);
          
          // Get reviews for description
          const reviews = await getTripAdvisorRestaurantReviews(restaurant.tripadvisor_id, 5);
          const reviewTexts = reviews.map((review: any) => review.text || review.comment || review.review).filter(Boolean);
          
          return {
            ...restaurant,
            photos: photoUrls,
            reviews: reviewTexts,
            description: reviewTexts.length > 0 ? reviewTexts[0] : 'A great dining experience awaits.'
          };
        } catch (error) {
          console.error('[TripAdvisor RapidAPI] Error enhancing restaurant:', error);
          return restaurant;
        }
      })
    );
    
    console.log(`[API] Enhanced ${enhancedResults.length} restaurants with TripAdvisor RapidAPI data`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error in TripAdvisor RapidAPI search:', error);
    return [];
  }
};

// Reddit API Integration
export const getRedditPosts = async (
  subreddit: string,
  filter: 'hot' | 'new' | 'top' | 'rising' = 'hot',
  limit: number = 25
): Promise<any[]> => {
  try {
    console.log(`[Reddit API] Getting ${filter} posts from r/${subreddit}`);
    
    const params = new URLSearchParams({
      url: `https://www.reddit.com/r/${subreddit}`,
      filter,
      limit: limit.toString()
    });
    
    const url = `https://reddit3.p.rapidapi.com/v1/reddit/posts?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': REDDIT_HOST,
        'x-rapidapi-key': REDDIT_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const posts = data.data || data.posts || [];
    
    console.log(`[Reddit API] Retrieved ${posts.length} posts from r/${subreddit}`);
    return posts;
  } catch (error) {
    console.error('[Reddit API] Error getting posts:', error);
    return [];
  }
};

// Get restaurant recommendations from food-related subreddits
export const getRestaurantRecommendationsFromReddit = async (
  location?: string,
  cuisine?: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    console.log('[Reddit API] Getting restaurant recommendations');
    
    // Define food-related subreddits to search
    const foodSubreddits = [
      'food',
      'restaurants',
      'dining',
      'foodporn',
      'eatsandwiches',
      'pizza',
      'sushi',
      'burgers',
      'tacos',
      'ramen'
    ];
    
    // Add location-specific subreddits if location is provided
    if (location) {
      const locationSubreddits = [
        `${location.toLowerCase()}food`,
        `${location.toLowerCase()}restaurants`,
        `${location.toLowerCase()}dining`
      ];
      foodSubreddits.push(...locationSubreddits);
    }
    
    // Add cuisine-specific subreddits if cuisine is provided
    if (cuisine) {
      const cuisineSubreddits = [
        cuisine.toLowerCase(),
        `${cuisine.toLowerCase()}food`,
        `${cuisine.toLowerCase()}recipes`
      ];
      foodSubreddits.push(...cuisineSubreddits);
    }
    
    const allPosts: any[] = [];
    
    // Get posts from each subreddit
    for (const subreddit of foodSubreddits.slice(0, 5)) { // Limit to 5 subreddits to avoid rate limits
      try {
        const posts = await getRedditPosts(subreddit, 'hot', 10);
        allPosts.push(...posts);
      } catch (error) {
        console.error(`[Reddit API] Error getting posts from r/${subreddit}:`, error);
        continue;
      }
    }
    
    // Filter posts that might contain restaurant recommendations
    const restaurantPosts = allPosts.filter(post => {
      const title = post.title?.toLowerCase() || '';
      const content = post.selftext?.toLowerCase() || '';
      const text = `${title} ${content}`;
      
      // Look for restaurant-related keywords
      const restaurantKeywords = [
        'restaurant', 'dining', 'food', 'eat', 'meal', 'dinner', 'lunch', 'breakfast',
        'cafe', 'bistro', 'grill', 'kitchen', 'chef', 'menu', 'dish', 'plate'
      ];
      
      return restaurantKeywords.some(keyword => text.includes(keyword));
    });
    
    console.log(`[Reddit API] Found ${restaurantPosts.length} restaurant-related posts`);
    return restaurantPosts.slice(0, limit);
  } catch (error) {
    console.error('[Reddit API] Error getting restaurant recommendations:', error);
    return [];
  }
};

// Transform Reddit posts to restaurant recommendations
export const transformRedditPostToRestaurant = (post: any): any => {
  try {
    // Extract restaurant name from post title or content
    const title = post.title || '';
    const content = post.selftext || '';
    const text = `${title} ${content}`;
    
    // Try to extract restaurant name (this is a simple heuristic)
    const restaurantNameMatch = text.match(/(?:at|from|tried|visited|went to)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|$|\.|,)/);
    const restaurantName = restaurantNameMatch ? restaurantNameMatch[1].trim() : 'Reddit Recommendation';
    
    return {
      id: `reddit_${post.id}`,
      name: restaurantName,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      latitude: 0,
      longitude: 0,
      phone: '',
      website: '',
      rating: 0,
      price: 0,
      cuisine: 'International',
      categories: [],
      hours: 'Hours vary',
      isOpen: false,
      totalPhotos: 0,
      totalReviews: 0,
      description: content.length > 200 ? content.substring(0, 200) + '...' : content,
      reddit_post: {
        id: post.id,
        title: post.title,
        author: post.author,
        score: post.score,
        url: post.url,
        subreddit: post.subreddit,
        created_utc: post.created_utc
      },
      source: 'reddit'
    };
  } catch (error) {
    console.error('[Reddit API] Error transforming post to restaurant:', error);
    return null;
  }
};

// Enhanced restaurant search with Reddit recommendations
export const searchRestaurantsWithReddit = async (
  query: string,
  location?: string,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with Reddit recommendations');
    
    // Get Reddit recommendations
    const redditPosts = await getRestaurantRecommendationsFromReddit(location, query, 10);
    
    // Transform Reddit posts to restaurant format
    const redditRestaurants = redditPosts
      .map(transformRedditPostToRestaurant)
      .filter(Boolean);
    
    console.log(`[API] Found ${redditRestaurants.length} restaurant recommendations from Reddit`);
    return redditRestaurants;
  } catch (error) {
    console.error('[API] Error in Reddit restaurant search:', error);
    return [];
  }
};

// Google Maps Places API Integration
export const searchGoogleMapsPlaces = async (
  latitude: number,
  longitude: number,
  radius: number = 10000,
  types: string[] = ['restaurant'],
  maxResults: number = 20
): Promise<any[]> => {
  try {
    console.log('[Google Maps] Searching places near:', latitude, longitude);
    
    const requestBody = {
      languageCode: 'en',
      regionCode: 'US',
      includedTypes: types,
      excludedTypes: [],
      includedPrimaryTypes: [],
      excludedPrimaryTypes: [],
      maxResultCount: maxResults,
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude
          },
          radius
        }
      },
      rankPreference: 0
    };
    
    const response = await fetch('https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': '*',
        'x-rapidapi-host': GOOGLE_MAPS_HOST,
        'x-rapidapi-key': GOOGLE_MAPS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const places = data.places || [];
    
    console.log(`[Google Maps] Retrieved ${places.length} places`);
    return places;
  } catch (error) {
    console.error('[Google Maps] Error searching places:', error);
    return [];
  }
};

// Get Google Maps place photos
export const getGoogleMapsPlacePhotos = async (
  placeId: string,
  photoId: string,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<string | null> => {
  try {
    console.log('[Google Maps] Getting photo for place:', placeId, 'photo:', photoId);
    
    const params = new URLSearchParams({
      maxWidthPx: maxWidth.toString(),
      maxHeightPx: maxHeight.toString(),
      skipHttpRedirect: 'true'
    });
    
    const url = `https://google-map-places-new-v2.p.rapidapi.com/v1/places/${placeId}/photos/${photoId}/media?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': GOOGLE_MAPS_HOST,
        'x-rapidapi-key': GOOGLE_MAPS_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const photoUrl = data.photoUri || data.url;
    
    console.log('[Google Maps] Retrieved photo URL:', photoUrl);
    return photoUrl;
  } catch (error) {
    console.error('[Google Maps] Error getting place photo:', error);
    return null;
  }
};

// Transform Google Maps place data to our format
export const transformGoogleMapsPlace = (place: any): any => {
  try {
    const location = place.location || {};
    const photos = place.photos || [];
    const types = place.types || [];
    const primaryType = place.primaryType || 'restaurant';
    
    return {
      id: place.id || `google_${Date.now()}`,
      name: place.displayName?.text || place.name || 'Unknown Restaurant',
      address: place.formattedAddress || '',
      city: location.locality || '',
      state: location.administrativeAreaLevel1 || '',
      zipCode: location.postalCode || '',
      country: location.country || '',
      latitude: location.latitude || 0,
      longitude: location.longitude || 0,
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
      website: place.websiteUri || '',
      rating: place.rating || 0,
      price: place.priceLevel || 0,
      cuisine: primaryType === 'restaurant' ? 'International' : primaryType,
      categories: types,
      hours: place.regularOpeningHours?.weekdayDescriptions || 'Hours vary',
      isOpen: place.regularOpeningHours?.openNow || false,
      totalPhotos: photos.length,
      totalReviews: place.userRatingCount || 0,
      google_place_id: place.id,
      photos: photos.map((photo: any) => photo.name).filter(Boolean),
      source: 'google_maps'
    };
  } catch (error) {
    console.error('[Google Maps] Error transforming place data:', error);
    return null;
  }
};

// Enhanced restaurant search with Google Maps Places
export const searchRestaurantsWithGoogleMaps = async (
  latitude: number,
  longitude: number,
  radius: number = 10000,
  limit: number = 20
): Promise<any[]> => {
  try {
    console.log('[API] Searching restaurants with Google Maps Places');
    
    // Search for restaurants
    const places = await searchGoogleMapsPlaces(latitude, longitude, radius, ['restaurant'], limit);
    
    // Transform results
    const transformedResults = places
      .map(transformGoogleMapsPlace)
      .filter(Boolean);
    
    // Enhance with photos for top results
    const enhancedResults = await Promise.all(
      transformedResults.slice(0, 10).map(async (restaurant) => {
        try {
          if (restaurant.photos && restaurant.photos.length > 0) {
            const photoUrls = [];
            for (const photoId of restaurant.photos.slice(0, 3)) {
              const photoUrl = await getGoogleMapsPlacePhotos(restaurant.google_place_id, photoId);
              if (photoUrl) {
                photoUrls.push(photoUrl);
              }
            }
            restaurant.photos = photoUrls;
          }
          
          return restaurant;
        } catch (error) {
          console.error('[Google Maps] Error enhancing restaurant:', error);
          return restaurant;
        }
      })
    );
    
    console.log(`[API] Enhanced ${enhancedResults.length} restaurants with Google Maps data`);
    return enhancedResults;
  } catch (error) {
    console.error('[API] Error in Google Maps search:', error);
    return [];
  }
};

// Unsplash API Integration
export const searchUnsplashImages = async (
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<any[]> => {
  try {
    console.log('[Unsplash] Searching images for:', query);
    
    const params = new URLSearchParams({
      page: page.toString(),
      query,
      per_page: perPage.toString()
    });
    
    const url = `https://unsplash-image-search-api.p.rapidapi.com/search?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': UNSPLASH_HOST,
        'x-rapidapi-key': UNSPLASH_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const images = data.results || data.data || [];
    
    console.log(`[Unsplash] Retrieved ${images.length} images for "${query}"`);
    return images;
  } catch (error) {
    console.error('[Unsplash] Error searching images:', error);
    return [];
  }
};

// Get a random Unsplash image for a given query
export const getRandomUnsplashImage = async (query: string): Promise<string | null> => {
  try {
    const images = await searchUnsplashImages(query, 1, 20);
    
    if (!images || images.length === 0) {
      console.log(`[Unsplash] No images found for "${query}"`);
      return null;
    }
    
    // Select a random image from the results
    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = images[randomIndex];
    
    // Check if selectedImage exists and has the required properties
    if (!selectedImage) {
      console.log(`[Unsplash] No valid image selected for "${query}"`);
      return null;
    }
    
    // Return the image URL with multiple fallback options
    const imageUrl = selectedImage.urls?.regular || 
                    selectedImage.urls?.small || 
                    selectedImage.urls?.thumb || 
                    selectedImage.url || 
                    selectedImage.src ||
                    selectedImage.image_url;
    
    if (!imageUrl) {
      console.log(`[Unsplash] No valid URL found in image data for "${query}"`);
      return null;
    }
    
    console.log(`[Unsplash] Selected random image for "${query}":`, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('[Unsplash] Error getting random image:', error);
    return null;
  }
};

// Enhanced collection cover image function using Unsplash
export const getUnsplashCollectionCoverImage = async (occasion: string): Promise<string> => {
  try {
    // Create search queries based on occasion
    const searchQueries = [
      `${occasion} restaurant`,
      `${occasion} dining`,
      `${occasion} food`,
      `${occasion} celebration`,
      `${occasion} meal`,
      `${occasion} cuisine`
    ];
    
    // Try each query until we find an image
    for (const query of searchQueries) {
      const imageUrl = await getRandomUnsplashImage(query);
      if (imageUrl) {
        console.log(`[Unsplash] Found cover image for "${occasion}" using query: "${query}"`);
        return imageUrl;
      }
    }
    
    // Fallback to the original static images
    console.log(`[Unsplash] No images found for "${occasion}", using fallback`);
    return getCollectionCoverImage(occasion);
  } catch (error) {
    console.error('[Unsplash] Error getting cover image:', error);
    // Fallback to original function
    return getCollectionCoverImage(occasion);
  }
};

// Fallback function for when Unsplash is completely unavailable
export const getCollectionCoverImageFallback = (occasion: string): string => {
  const fallbackImages = {
    'dinner': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80',
    'lunch': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80',
    'breakfast': 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=800&h=600&fit=crop&q=80',
    'brunch': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80',
    'date night': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
    'celebration': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80',
    'business': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80',
    'casual': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80'
  };
  
  const lowerOccasion = occasion.toLowerCase();
  for (const [key, image] of Object.entries(fallbackImages)) {
    if (lowerOccasion.includes(key)) {
      return image;
    }
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80';
};

// ============================================================================
// FOURSQUARE PLACES API v3 - NEW RESTAURANT SEARCH AND DETAILS
// ============================================================================

// Search restaurants using Foursquare Places API v3 (with fallback to v2)
export const searchFoursquarePlacesRestaurants = async (
  query: string,
  lat?: number,
  lng?: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any[]> => {
  try {
    console.log(`[Foursquare Places] Searching restaurants for: "${query}"`);
    
    // Try v3 Places API first
    const params = new URLSearchParams({
      query: query,
      limit: limit.toString(),
      radius: radius.toString(),
      categories: '13065', // Food & Drink category
      sort: 'rating',
      'X-Places-Api-Version': '2025-08-01'
    });
    
    if (lat && lng) {
      params.append('ll', `${lat},${lng}`);
    }
    
    const url = `https://api.foursquare.com/v3/places/search?${params.toString()}`;
    
    console.log('[Foursquare Places] Trying v3 Places API with API key authentication');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': FOURSQUARE_PLACES_API_KEY,
          'User-Agent': 'Rork-Nomi-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        
        console.log(`[Foursquare Places] ✅ v3 Success - Found ${results.length} restaurants for query: "${query}"`);
        return results;
      } else {
        console.log(`[Foursquare Places] v3 API failed: ${response.status} ${response.statusText}, falling back to v2`);
      }
    } catch (error) {
      console.log('[Foursquare Places] v3 API error, falling back to v2:', error instanceof Error ? error.message : String(error));
    }
    
    // Fallback to working v2 API
    console.log('[Foursquare Places] Using v2 API fallback with client_id/client_secret authentication');
    
    const v2Params = new URLSearchParams({
      query: query,
      categoryId: '4d4b7105d754a06374d81259', // Food category ID for restaurants
      limit: limit.toString(),
      radius: radius.toString(),
      sort: 'rating',
      v: '20231201' // API version
    });
    
    if (lat && lng) {
      v2Params.append('ll', `${lat},${lng}`);
    }
    
    // Build URL with v2 authentication
    const fullUrl = buildFoursquareV2Url('/venues/search', v2Params);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = data.response?.venues || data.venues || [];
        
        console.log(`[Foursquare Places] ✅ v2 Success - Found ${results.length} restaurants for query: "${query}"`);
        return results;
      } else {
        console.error(`[Foursquare Places] ❌ v2 API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Foursquare Places] v2 API error:', error);
    }
    
    console.error('[Foursquare Places] All APIs failed for search - no restaurants found');
    return [];
    
  } catch (error) {
    console.error('[Foursquare Places] Error searching restaurants:', error);
    return [];
  }
};

// Get detailed information about a specific restaurant using Foursquare Places API v3 (with fallback to v2)
export const getFoursquarePlacesRestaurantDetails = async (fsqPlaceId: string): Promise<any> => {
  try {
    console.log('[Foursquare Places] Getting details for restaurant:', fsqPlaceId);
    
    // Try v3 Places API first
    const url = `https://api.foursquare.com/v3/places/${fsqPlaceId}`;
    
    console.log('[Foursquare Places] Trying v3 Places API with API key authentication');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': FOURSQUARE_PLACES_API_KEY,
          'User-Agent': 'Rork-Nomi-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Foursquare Places] ✅ v3 Success - Retrieved restaurant details');
        return data;
      } else {
        console.log(`[Foursquare Places] v3 API failed: ${response.status} ${response.statusText}, falling back to v2`);
      }
    } catch (error) {
      console.log('[Foursquare Places] v3 API error, falling back to v2:', error instanceof Error ? error.message : String(error));
    }
    
    // Fallback to working v2 API
    console.log('[Foursquare Places] Using v2 API fallback with client_id/client_secret authentication');
    
    const params = new URLSearchParams({
      v: '20231201' // API version
    });
    const fullUrl = buildFoursquareV2Url(`/venues/${fsqPlaceId}`, params);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Rork-Nomi-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Foursquare Places] ✅ v2 Success - Retrieved restaurant details');
        return data.response?.venue || data.venue;
      } else {
        console.error(`[Foursquare Places] ❌ v2 API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Foursquare Places] v2 API error:', error);
    }
    
    console.error('[Foursquare Places] All APIs failed for details - no restaurant details available');
    return null;
    
  } catch (error) {
    console.error('[Foursquare Places] Error getting restaurant details:', error);
    return null;
  }
};

// Get nearby restaurants using Foursquare Places API v3 (with fallback to v2)
export const getFoursquarePlacesNearbyRestaurants = async (
  lat: number,
  lng: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any[]> => {
  try {
    console.log(`[Foursquare Places] Getting nearby restaurants at ${lat}, ${lng}`);
    
    // Try v3 Places API first
    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: radius.toString(),
      limit: limit.toString(),
      categories: '13065', // Food & Drink category
      sort: 'rating',
      'X-Places-Api-Version': '2025-08-01'
    });
    
    const url = `https://api.foursquare.com/v3/places/search?${params.toString()}`;
    
    console.log('[Foursquare Places] Trying v3 Places API with API key authentication');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': FOURSQUARE_PLACES_API_KEY,
          'User-Agent': 'Rork-Nomi-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        
        console.log(`[Foursquare Places] ✅ v3 Success - Found ${results.length} nearby restaurants`);
        return results;
      } else {
        console.log(`[Foursquare Places] v3 API failed: ${response.status} ${response.statusText}, falling back to v2`);
      }
    } catch (error) {
      console.log('[Foursquare Places] v3 API error, falling back to v2:', error instanceof Error ? error.message : String(error));
    }
    
    // Fallback to working v2 API
    console.log('[Foursquare Places] Using v2 API fallback with client_id/client_secret authentication');
    
    const v2Params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: radius.toString(),
      limit: limit.toString(),
      categoryId: '4d4b7105d754a06374d81259', // Food category ID for restaurants
      sort: 'rating',
      v: '20231201' // API version
    });
    
    // Build URL with v2 authentication
    const fullUrl = buildFoursquareV2Url('/venues/search', v2Params);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = data.response?.venues || data.venues || [];
        
        console.log(`[Foursquare Places] ✅ v2 Success - Found ${results.length} nearby restaurants`);
        return results;
      } else {
        console.error(`[Foursquare Places] ❌ v2 API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Foursquare Places] v2 API error:', error);
    }
    
    console.error('[Foursquare Places] All APIs failed for nearby search - no restaurants found');
    return [];
    
  } catch (error) {
    console.error('[Foursquare Places] Error getting nearby restaurants:', error);
    return [];
  }
};

// Get restaurant photos using Foursquare Places API v3 (with fallback to v2)
export const getFoursquarePlacesRestaurantPhotos = async (fsqPlaceId: string, limit: number = 10): Promise<any[]> => {
  try {
    console.log('[Foursquare Places] Getting photos for restaurant:', fsqPlaceId);
    
    // Try v3 Places API first with correct structure
    const params = new URLSearchParams({
      limit: limit.toString(),
      'X-Places-Api-Version': '2025-06-17'
    });
    
    const url = `https://api.foursquare.com/v3/places/${fsqPlaceId}/photos?${params.toString()}`;
    
    console.log('[Foursquare Places] Trying v3 Places API with API key authentication');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': FOURSQUARE_PLACES_API_KEY,
          'User-Agent': 'Rork-Nomi-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle the correct response structure based on your API documentation
        const photos = data.results || data || [];
        
        console.log(`[Foursquare Places] ✅ v3 Success - Retrieved ${photos.length} photos`);
        return photos;
      } else {
        console.log(`[Foursquare Places] v3 API failed: ${response.status} ${response.statusText}, falling back to v2`);
      }
    } catch (error) {
      console.log('[Foursquare Places] v3 API error, falling back to v2:', error instanceof Error ? error.message : String(error));
    }
    
    // Fallback to working v2 API
    console.log('[Foursquare Places] Using v2 API fallback with client_id/client_secret authentication');
    
    const v2Params = new URLSearchParams({
      limit: limit.toString(),
      v: '20231201' // API version
    });
    const fullUrl = buildFoursquareV2Url(`/venues/${fsqPlaceId}/photos`, v2Params);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Rork-Nomi-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const photos = data.response?.photos?.items || data.photos?.items || [];
        
        console.log(`[Foursquare Places] ✅ v2 Success - Retrieved ${photos.length} photos`);
        return photos;
      } else {
        console.error(`[Foursquare Places] ❌ v2 API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Foursquare Places] v2 API error:', error);
    }
    
    console.error('[Foursquare Places] All APIs failed for photos - no photos available');
    return [];
    
  } catch (error) {
    console.error('[Foursquare Places] Error getting restaurant photos:', error);
    return [];
  }
};

// Transform Foursquare Places API data to match your app's Restaurant type
export const transformFoursquarePlacesToRestaurant = (fsqPlace: any): any => {
  try {
    const restaurant = {
      id: fsqPlace.fsq_place_id,
      name: fsqPlace.name,
      cuisine: fsqPlace.categories?.[0]?.name || 'Restaurant',
      location: {
        address: fsqPlace.location?.address || '',
        city: fsqPlace.location?.locality || '',
        state: fsqPlace.location?.region || '',
        zipCode: fsqPlace.location?.postcode || '',
        country: fsqPlace.location?.country || '',
        formattedAddress: fsqPlace.location?.formatted_address || ''
      },
      coordinates: {
        latitude: fsqPlace.latitude,
        longitude: fsqPlace.longitude
      },
      rating: fsqPlace.rating || 0,
      price: fsqPlace.price || 0,
      photos: fsqPlace.photos?.map((photo: any) => ({
        id: photo.fsq_photo_id,
        url: `${photo.prefix}${photo.width}x${photo.height}${photo.suffix}`,
        width: photo.width,
        height: photo.height
      })) || [],
      hours: fsqPlace.hours?.display || '',
      isOpenNow: fsqPlace.hours?.open_now || false,
      phone: fsqPlace.tel || '',
      website: fsqPlace.website || '',
      description: fsqPlace.description || '',
      popularity: fsqPlace.popularity || 0,
      verified: fsqPlace.verified || false,
      distance: fsqPlace.distance || 0,
      attributes: fsqPlace.attributes || {},
      tips: fsqPlace.tips?.map((tip: any) => ({
        id: tip.fsq_tip_id,
        text: tip.text,
        agreeCount: tip.agree_count,
        disagreeCount: tip.disagree_count
      })) || [],
      // Add source information
      source: 'foursquare_places',
      sourceId: fsqPlace.fsq_place_id
    };
    
    return restaurant;
  } catch (error) {
    console.error('[Foursquare Places] Error transforming restaurant data:', error);
    return null;
  }
};

// ============================================================================
// MAPBOX SEARCH BOX API - MAIN RESTAURANT SEARCH API
// ============================================================================

// Generate a session token for Search Box API
const generateSessionToken = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Search restaurants using Mapbox Search Box API
export const searchMapboxRestaurants = async (
  query: string,
  lat?: number,
  lng?: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any[]> => {
  try {
    console.log(`[Mapbox Search Box] Searching restaurants for: "${query}"`);
    
    // Mapbox API disabled - using local data only
    console.log('[Mapbox Search Box] 🏠 Using local data only (Mapbox API disabled)');
    return await searchLocalRestaurants(query, undefined, limit);
    
  } catch (error) {
    console.error('[Mapbox Search Box] Error searching restaurants:', error);
    return [];
  }
};

// Get nearby restaurants using Mapbox Search Box API
export const getMapboxNearbyRestaurants = async (
  lat: number,
  lng: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any[]> => {
  try {
    console.log(`[Mapbox Search Box] Getting nearby restaurants at ${lat}, ${lng}`);
    
    // Mapbox API disabled - using local data only
    console.log('[Mapbox Search Box] 🏠 Using local data only (Mapbox API disabled)');
    return await searchLocalRestaurants('restaurant', undefined, limit);
    
  } catch (error) {
    console.error('[Mapbox Search Box] Error getting nearby restaurants:', error);
    return [];
  }
};

// Get restaurant details using Mapbox Places API
export const getMapboxRestaurantDetails = async (placeId: string): Promise<any> => {
  try {
    console.log('[Mapbox] Getting details for restaurant:', placeId);
    
    // Mapbox API disabled - using local data only
    console.log('[Mapbox] 🏠 Using local data only (Mapbox API disabled)');
    return null;
    
  } catch (error) {
    console.error('[Mapbox] Error getting restaurant details:', error);
    return null;
  }
};

// Search for restaurants by cuisine type using Mapbox
export const searchMapboxRestaurantsByCuisine = async (
  cuisine: string,
  lat?: number,
  lng?: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any[]> => {
  try {
    console.log(`[Mapbox] Searching ${cuisine} restaurants`);
    
    // Mapbox API disabled - using local data only
    console.log('[Mapbox] 🏠 Using local data only (Mapbox API disabled)');
    return await searchLocalRestaurants(cuisine, undefined, limit);
    
  } catch (error) {
    console.error('[Mapbox] Error searching restaurants by cuisine:', error);
    return [];
  }
};

// Transform Mapbox Search Box API data to match your app's Restaurant type
export const transformMapboxToRestaurant = (mapboxPlace: any): any => {
  try {
    // Handle Search Box API format (new format)
    if (mapboxPlace.properties && mapboxPlace.geometry) {
      const name = mapboxPlace.properties.name || 'Restaurant';
      const fullAddress = mapboxPlace.properties.full_address || '';
      const address = mapboxPlace.properties.address || '';
      
      // Extract location components from Search Box API context
      const context = mapboxPlace.properties.context || {};
      const city = context.place?.name || context.locality?.name || '';
      const state = context.region?.name || '';
      const zipCode = context.postcode?.name || '';
      const country = context.country?.name || '';
      const neighborhood = context.neighborhood?.name || '';
      
      // Build comprehensive address
      const addressComponents = [];
      if (address) addressComponents.push(address);
      if (neighborhood) addressComponents.push(neighborhood);
      if (city) addressComponents.push(city);
      if (state) addressComponents.push(state);
      if (zipCode) addressComponents.push(zipCode);
      
      const formattedAddress = addressComponents.length > 0 
        ? addressComponents.join(', ')
        : fullAddress;
      
      // Get coordinates from Search Box API format
      const coordinates = mapboxPlace.geometry.coordinates || [];
      const latitude = coordinates[1] || 0;
      const longitude = coordinates[0] || 0;
      
      // Extract cuisine from POI categories
      const poiCategories = mapboxPlace.properties.poi_category || [];
      let cuisine = 'Restaurant'; // Default
      
      if (poiCategories.length > 0) {
        // Try to find a more specific cuisine type
        const cuisineKeywords = {
          'italian': 'Italian',
          'pizza': 'Italian',
          'sushi': 'Japanese',
          'japanese': 'Japanese',
          'chinese': 'Chinese',
          'mexican': 'Mexican',
          'thai': 'Thai',
          'indian': 'Indian',
          'french': 'French',
          'american': 'American',
          'mediterranean': 'Mediterranean',
          'korean': 'Korean',
          'vietnamese': 'Vietnamese',
          'greek': 'Greek',
          'spanish': 'Spanish',
          'middle eastern': 'Middle Eastern',
          'caribbean': 'Caribbean',
          'latin': 'Latin American',
          'seafood': 'Seafood',
          'steakhouse': 'Steakhouse',
          'barbecue': 'BBQ',
          'burger': 'American',
          'sandwich': 'American',
          'cafe': 'Cafe',
          'bakery': 'Bakery',
          'dessert': 'Dessert'
        };
        
        for (const category of poiCategories) {
          const lowerCategory = category.toLowerCase();
          for (const [keyword, cuisineType] of Object.entries(cuisineKeywords)) {
            if (lowerCategory.includes(keyword)) {
              cuisine = cuisineType;
              break;
            }
          }
          if (cuisine !== 'Restaurant') break;
        }
      }
      
      console.log('[Mapbox] Transforming restaurant:', {
        name,
        cuisine,
        poiCategories: mapboxPlace.properties.poi_category,
        properties: mapboxPlace.properties,
        hasGeometry: !!mapboxPlace.geometry,
        geometryType: mapboxPlace.geometry?.type
      });
      
      const restaurant = {
        id: mapboxPlace.properties.mapbox_id || `mapbox-${Date.now()}-${Math.random()}`,
        name: name,
        cuisine: cuisine,
        location: {
          address: address,
          city: city,
          state: state,
          zipCode: zipCode,
          country: country,
          neighborhood: neighborhood,
          formattedAddress: formattedAddress
        },
        coordinates: {
          latitude: latitude,
          longitude: longitude
        },
        rating: undefined, // Mapbox doesn't provide ratings
        price: undefined, // Mapbox doesn't provide price levels
        priceRange: '$$', // Default price range
        photos: [], // Mapbox doesn't provide photos directly
        hours: '', // Mapbox doesn't provide hours
        isOpenNow: false, // Mapbox doesn't provide open status
        phone: mapboxPlace.properties.tel || '',
        website: mapboxPlace.properties.website || '',
        description: mapboxPlace.properties.description || '',
        popularity: 0, // Mapbox doesn't provide popularity
        verified: false, // Mapbox doesn't provide verification status
        distance: 0, // Calculate distance if needed
        attributes: mapboxPlace.properties || {},
        tips: [], // Mapbox doesn't provide tips
        // Add source information
        source: 'mapbox_searchbox',
        sourceId: mapboxPlace.properties.mapbox_id
      };
      
      return restaurant;
    }
    
    // Handle old geocoding API format (fallback)
    const name = mapboxPlace.name || mapboxPlace.text || mapboxPlace.place_name?.split(',')[0] || 'Restaurant';
    const placeName = mapboxPlace.place_name || mapboxPlace.properties?.full_address || '';
    
    // Extract location components from old format
    const locationComponents = mapboxPlace.properties?.context || mapboxPlace.context || [];
    const city = locationComponents.find((ctx: any) => ctx.id?.startsWith('place') || ctx.id?.startsWith('locality'))?.text || 
                 locationComponents.find((ctx: any) => ctx.id?.startsWith('city'))?.text || '';
    const state = locationComponents.find((ctx: any) => ctx.id?.startsWith('region'))?.text || 
                  locationComponents.find((ctx: any) => ctx.id?.startsWith('state'))?.text || '';
    const zipCode = locationComponents.find((ctx: any) => ctx.id?.startsWith('postcode'))?.text || '';
    const country = locationComponents.find((ctx: any) => ctx.id?.startsWith('country'))?.text || '';
    
    // Get coordinates from old format
    const coordinates = mapboxPlace.geometry?.coordinates || mapboxPlace.center || [];
    const latitude = coordinates[1] || 0;
    const longitude = coordinates[0] || 0;
    
    const restaurant = {
      id: mapboxPlace.id || `mapbox-${Date.now()}-${Math.random()}`,
      name: name,
      cuisine: 'Restaurant', // Default for old format
      location: {
        address: placeName,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,
        formattedAddress: placeName
      },
      coordinates: {
        latitude: latitude,
        longitude: longitude
      },
                      rating: undefined, // Mapbox doesn't provide ratings
        price: undefined, // Mapbox doesn't provide price levels
        priceRange: '$$', // Default price range
        photos: [], // Mapbox doesn't provide photos directly
      hours: '', // Mapbox doesn't provide hours
      isOpenNow: false, // Mapbox doesn't provide open status
      phone: mapboxPlace.properties?.tel || mapboxPlace.properties?.phone || '',
      website: mapboxPlace.properties?.website || '',
      description: mapboxPlace.properties?.description || '',
      popularity: 0, // Mapbox doesn't provide popularity
      verified: false, // Mapbox doesn't provide verification status
      distance: 0, // Calculate distance if needed
      attributes: mapboxPlace.properties || {},
      tips: [], // Mapbox doesn't provide tips
      // Add source information
      source: 'mapbox_geocoding',
      sourceId: mapboxPlace.id
    };
    
    return restaurant;
  } catch (error) {
    console.error('[Mapbox Search Box] Error transforming restaurant data:', error);
    return null;
  }
};

// Enhanced restaurant search with multiple APIs (Mapbox as primary)
export const searchRestaurantsEnhanced = async (
  query: string,
  lat?: number,
  lng?: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any[]> => {
  try {
    console.log(`[Enhanced Search] Searching restaurants for: "${query}"`);
    
    // Try Mapbox first (primary API)
    console.log('[Enhanced Search] Trying Mapbox API first...');
    const mapboxResults = await searchMapboxRestaurants(query, lat, lng, radius, limit);
    
    if (mapboxResults.length > 0) {
      console.log(`[Enhanced Search] ✅ Mapbox found ${mapboxResults.length} results`);
      return mapboxResults.map(transformMapboxToRestaurant).filter(Boolean);
    }
    
    // Fallback to Foursquare if Mapbox fails
    console.log('[Enhanced Search] Mapbox returned no results, trying Foursquare...');
    const foursquareResults = await searchFoursquarePlacesRestaurants(query, lat, lng, radius, limit);
    
    if (foursquareResults.length > 0) {
      console.log(`[Enhanced Search] ✅ Foursquare found ${foursquareResults.length} results`);
      return foursquareResults.map(transformFoursquarePlacesToRestaurant).filter(Boolean);
    }
    
    // Fallback to Yelp if both fail
    console.log('[Enhanced Search] Both Mapbox and Foursquare failed, trying Yelp...');
    const location = lat && lng ? `${lat},${lng}` : 'New York, NY';
    const yelpResults = await searchYelpRestaurants(location, 'Restaurants', limit);
    
    if (yelpResults.length > 0) {
      console.log(`[Enhanced Search] ✅ Yelp found ${yelpResults.length} results`);
      return yelpResults;
    }
    
    console.log('[Enhanced Search] All APIs failed - no restaurants found');
    return [];
    
  } catch (error) {
    console.error('[Enhanced Search] Error in enhanced restaurant search:', error);
    return [];
  }
};

// ============================================================================
// YELP FUSION API - DIRECT YELP API INTEGRATION
// ============================================================================

// Yelp Fusion API functions for business details, reviews, and photos
export const getYelpBusinessDetails = async (businessId: string): Promise<any> => {
  try {
    console.log('[Yelp Fusion] Getting business details for:', businessId);
    
    if (!YELP_FUSION_API_KEY) {
      console.warn('[Yelp Fusion] No API key provided - skipping Yelp enhancement');
      return null;
    }
    
    const response = await fetch(`${YELP_FUSION_BASE_URL}/businesses/${businessId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YELP_FUSION_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[Yelp Fusion] ✅ Successfully retrieved business details');
      return data;
    } else {
      console.error(`[Yelp Fusion] ❌ API failed: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error('[Yelp Fusion] Error getting business details:', error);
    return null;
  }
};

export const getYelpBusinessReviews = async (businessId: string): Promise<any> => {
  try {
    console.log('[Yelp Fusion] Getting business reviews for:', businessId);
    
    if (!YELP_FUSION_API_KEY) {
      console.warn('[Yelp Fusion] No API key provided - skipping Yelp reviews');
      return null;
    }
    
    const response = await fetch(`${YELP_FUSION_BASE_URL}/businesses/${businessId}/reviews`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YELP_FUSION_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[Yelp Fusion] ✅ Successfully retrieved business reviews');
      return data;
    } else {
      console.error(`[Yelp Fusion] ❌ API failed: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error('[Yelp Fusion] Error getting business reviews:', error);
    return null;
  }
};

// Enhanced restaurant data with Yelp integration
export const enhanceRestaurantWithYelp = async (restaurant: any): Promise<any> => {
  try {
    // Try to find Yelp business ID from restaurant data
    const yelpId = restaurant.yelpId || restaurant.attributes?.yelp_id || restaurant.sourceId;
    
    if (!yelpId) {
      console.log('[Yelp Fusion] No Yelp ID found for restaurant:', restaurant.name);
      return restaurant;
    }
    
    console.log('[Yelp Fusion] Enhancing restaurant with Yelp data:', restaurant.name);
    
    // Get business details and reviews in parallel
    const [details, reviews] = await Promise.all([
      getYelpBusinessDetails(yelpId),
      getYelpBusinessReviews(yelpId)
    ]);
    
    // Enhance restaurant with Yelp data
    const enhancedRestaurant = { ...restaurant };
    
    if (details) {
      enhancedRestaurant.rating = details.rating || restaurant.rating;
      enhancedRestaurant.price = details.price ? details.price.length : restaurant.price;
      enhancedRestaurant.photos = details.photos || restaurant.photos;
      enhancedRestaurant.hours = details.hours?.display || restaurant.hours;
      enhancedRestaurant.phone = details.phone || restaurant.phone;
      enhancedRestaurant.website = details.website || restaurant.website;
      enhancedRestaurant.isOpenNow = details.hours?.is_open_now || restaurant.isOpenNow;
      
      // Update location if Yelp has better data
      if (details.location) {
        enhancedRestaurant.location = {
          ...enhancedRestaurant.location,
          address: details.location.address1 || enhancedRestaurant.location.address,
          city: details.location.city || enhancedRestaurant.location.city,
          state: details.location.state || enhancedRestaurant.location.state,
          zipCode: details.location.zip_code || enhancedRestaurant.location.zipCode,
          formattedAddress: details.location.display_address?.join(', ') || enhancedRestaurant.location.formattedAddress
        };
      }
    }
    
    if (reviews && reviews.reviews) {
      enhancedRestaurant.reviews = reviews.reviews.map((review: any) => ({
        id: review.id,
        text: review.text,
        rating: review.rating,
        timeCreated: review.time_created,
        user: {
          name: review.user.name,
          imageUrl: review.user.image_url
        }
      }));
    }
    
    console.log('[Yelp Fusion] ✅ Successfully enhanced restaurant with Yelp data');
    return enhancedRestaurant;
  } catch (error) {
    console.error('[Yelp Fusion] Error enhancing restaurant:', error);
    return restaurant;
  }
};

// Deduplicate restaurants based on name and address
export const deduplicateRestaurants = (restaurants: any[]): any[] => {
  const seen = new Map<string, any>();
  
  return restaurants.filter(restaurant => {
    if (!restaurant || !restaurant.name) return false;
    
    // Create a key based on name and address
    const address = restaurant.location?.formattedAddress || restaurant.location?.address || '';
    const key = `${restaurant.name.toLowerCase()}-${address.toLowerCase()}`;
    
    if (seen.has(key)) {
      // If we've seen this restaurant before, only keep it if the address is different
      const existing = seen.get(key);
      const existingAddress = existing.location?.formattedAddress || existing.location?.address || '';
      const currentAddress = restaurant.location?.formattedAddress || restaurant.location?.address || '';
      
      if (existingAddress !== currentAddress) {
        // Different address, keep both
        return true;
      } else {
        // Same address, skip duplicate
        console.log('[Deduplication] Skipping duplicate:', restaurant.name, 'at', currentAddress);
        return false;
      }
    } else {
      // First time seeing this restaurant
      seen.set(key, restaurant);
      return true;
    }
  });
};