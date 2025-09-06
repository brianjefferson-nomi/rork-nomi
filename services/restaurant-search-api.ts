import { supabase } from './supabase';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';

// Helper function to calculate distance in meters
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to format distance for display
function formatDistance(meters: number): string {
  if (meters < 1609.34) { // Less than 1 mile
    const feet = Math.round(meters * 3.28084);
    return `${feet} ft`;
  } else {
    const miles = (meters / 1609.34).toFixed(1);
    return `${miles} mi`;
  }
}

// Helper function to get primary photo
function getPrimaryPhoto(restaurant: any): string | null {
  // Priority: TripAdvisor > Google > Manual
  if (restaurant.tripadvisor_photos && Array.isArray(restaurant.tripadvisor_photos) && restaurant.tripadvisor_photos.length > 0) {
    return restaurant.tripadvisor_photos[0];
  }
  
  if (restaurant.googlePhotos && Array.isArray(restaurant.googlePhotos) && restaurant.googlePhotos.length > 0) {
    return restaurant.googlePhotos[0];
  }
  
  if (restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0) {
    return restaurant.images[0];
  }
  
  return null;
}

// Helper function to get best available rating (Google > TripAdvisor > Original)
function getBestRating(restaurant: any): number {
  // Priority: Google > TripAdvisor > Original
  if (restaurant.googleRating && restaurant.googleRating > 0) {
    return restaurant.googleRating;
  }
  
  if (restaurant.tripadvisor_rating && restaurant.tripadvisor_rating > 0) {
    return restaurant.tripadvisor_rating;
  }
  
  if (restaurant.rating && restaurant.rating > 0) {
    return restaurant.rating;
  }
  
  return 0;
}

export interface RestaurantSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  sort?: 'distance' | 'rating' | 'trending' | 'new' | 'name';
  limit?: number;
  cursor?: string;
  cuisine?: string;
  neighborhood?: string;
  city?: string;
  price_range?: string;
  has_photos?: boolean;
  has_google_data?: boolean;
  has_tripadvisor_data?: boolean;
  include_total?: boolean;
}

export interface RestaurantSearchResult {
  restaurants: any[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
  metadata: {
    sort: string;
    limit: number;
    hasGeolocation: boolean;
    filters: any;
    timestamp: string;
  };
}

export async function searchRestaurants(params: RestaurantSearchParams): Promise<RestaurantSearchResult> {
  try {
    const {
      q: query = '',
      lat,
      lng,
      sort = 'rating',
      limit = 20,
      cursor,
      cuisine,
      neighborhood,
      city,
      price_range,
      has_photos,
      has_google_data,
      has_tripadvisor_data,
      include_total = false
    } = params;

    console.log(`[Restaurants API] Search request:`, {
      query,
      sort,
      limit,
      filters: { cuisine, neighborhood, city, price_range, has_photos, has_google_data, has_tripadvisor_data },
      geolocation: lat && lng ? { lat, lng } : null
    });

    // Build base query
    let supabaseQuery = supabase.from('restaurants').select('*');

    // Apply search filter
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,cuisine.ilike.%${query}%,neighborhood.ilike.%${query}%`);
    }

    // Apply filters
    if (cuisine) {
      supabaseQuery = supabaseQuery.ilike('cuisine', `%${cuisine}%`);
    }
    if (neighborhood) {
      supabaseQuery = supabaseQuery.ilike('neighborhood', `%${neighborhood}%`);
    }
    if (city) {
      // Use city filter patterns instead of exact matching
      let cityPattern: RegExp | null = null;
      
      if (city === 'NYC' || city === 'New York') {
        cityPattern = NYC_CONFIG.filterPattern;
      } else if (city === 'LA' || city === 'Los Angeles') {
        cityPattern = LA_CONFIG.filterPattern;
      }
      
      if (cityPattern) {
        // For now, we'll use a broader approach since Supabase doesn't support regex directly
        // We'll filter by common city/neighborhood patterns
        const cityTerms = cityPattern.source.split('|').map(term => term.replace(/[()]/g, '').trim());
        const cityFilter = cityTerms.map(term => `city.ilike.%${term}%,neighborhood.ilike.%${term}%`).join(',');
        supabaseQuery = supabaseQuery.or(cityFilter);
      } else {
        // Fallback to exact matching for other cities
        supabaseQuery = supabaseQuery.eq('city', city);
      }
    }
    if (price_range) {
      supabaseQuery = supabaseQuery.eq('price_range', price_range);
    }
    if (has_photos) {
      supabaseQuery = supabaseQuery.not('images', 'is', null);
    }
    if (has_google_data) {
      supabaseQuery = supabaseQuery.not('googlePlaceId', 'is', null);
    }
    if (has_tripadvisor_data) {
      supabaseQuery = supabaseQuery.not('tripadvisor_location_id', 'is', null);
    }

    // Apply sorting
    switch (sort) {
      case 'rating':
        // For rating sorting, we need to fetch restaurants with any rating source
        // and then sort by the best available rating (Google > TripAdvisor > Original)
        console.log('[API] Rating sorting requested, fetching restaurants with any rating source');
        supabaseQuery = supabaseQuery.or('googleRating.gt.0,tripadvisor_rating.gt.0,rating.gt.0')
          .order('googleRating', { ascending: false, nullsFirst: false })
          .order('tripadvisor_rating', { ascending: false, nullsFirst: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .order('id', { ascending: true });
        
        // Increase the initial fetch size for rating sorting to get better results
        const ratingFetchLimit = Math.min(limit * 3, 500); // Cap at 500 to avoid performance issues
        supabaseQuery = supabaseQuery.limit(ratingFetchLimit);
        break;
      case 'trending':
        supabaseQuery = supabaseQuery
          .not('trending_score', 'is', null)
          .order('trending_score', { ascending: false })
          .order('id', { ascending: true });
        break;
      case 'new':
        supabaseQuery = supabaseQuery
          .order('created_at', { ascending: false })
          .order('id', { ascending: true });
        break;
      case 'name':
        supabaseQuery = supabaseQuery
          .order('name', { ascending: true })
          .order('id', { ascending: true });
        break;
      case 'distance':
        if (!lat || !lng) {
          // Fallback to rating sorting when location is not available
          console.log('[API] Location not available, falling back to rating sorting');
          supabaseQuery = supabaseQuery.or('googleRating.gt.0,tripadvisor_rating.gt.0,rating.gt.0')
            .order('googleRating', { ascending: false, nullsFirst: false })
            .order('tripadvisor_rating', { ascending: false, nullsFirst: false })
            .order('rating', { ascending: false, nullsFirst: false })
            .order('id', { ascending: true });
        } else {
          // For distance sorting, we need to fetch more results initially
          // since we'll sort by distance in JavaScript
          console.log('[API] Distance sorting requested, fetching restaurants with coordinates');
          supabaseQuery = supabaseQuery
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .order('id', { ascending: true });
          
          // Increase the initial fetch size for distance sorting to get better results
          // We'll fetch 5x the requested limit to ensure we have enough restaurants to sort by distance
          const distanceFetchLimit = Math.min(limit * 5, 1000); // Cap at 1000 to avoid performance issues
          supabaseQuery = supabaseQuery.limit(distanceFetchLimit);
          break; // Skip the default limit setting below
        }
        break;
    }
    
    // Only set the default limit if we haven't already set a custom limit (e.g., for distance or rating sorting)
    if ((sort !== 'distance' || !lat || !lng) && sort !== 'rating') {
      supabaseQuery = supabaseQuery.limit(limit + 1);
    }

    // Execute query
    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('[Restaurants API] Database error:', error);
      throw new Error('Database error');
    }

    // Check if there are more results
    const hasMore = data.length > limit;
    const resultRestaurants = hasMore ? data.slice(0, limit) : data;

    // Add distance and primary photo to each restaurant
    let enrichedRestaurants = resultRestaurants.map(restaurant => {
      let distanceMeters: number | undefined;
      let distanceDisplay: string | undefined;
      
      if (lat && lng) {
        // Calculate distance using fallback method
        distanceMeters = calculateDistance(lat, lng, restaurant.latitude, restaurant.longitude);
        distanceDisplay = formatDistance(distanceMeters);
      }
      
      return {
        ...restaurant,
        distance_meters: distanceMeters,
        distance_display: distanceDisplay,
        primary_photo: getPrimaryPhoto(restaurant)
      };
    });

    // Sort by distance if location is provided and sort is distance
    if (lat && lng && sort === 'distance') {
      enrichedRestaurants = enrichedRestaurants.sort((a, b) => {
        const distanceA = a.distance_meters || Infinity;
        const distanceB = b.distance_meters || Infinity;
        return distanceA - distanceB;
      });
    }
    
    // Sort by best available rating if sort is rating
    if (sort === 'rating') {
      enrichedRestaurants = enrichedRestaurants.sort((a, b) => {
        const ratingA = getBestRating(a);
        const ratingB = getBestRating(b);
        return ratingB - ratingA; // Higher ratings first
      });
    }

    // Generate next cursor (simplified)
    let nextCursor: string | undefined;
    if (hasMore && enrichedRestaurants.length > 0) {
      const lastRestaurant = enrichedRestaurants[enrichedRestaurants.length - 1];
      nextCursor = btoa(JSON.stringify({
        lastId: lastRestaurant.id,
        lastRating: lastRestaurant.rating,
        lastCreatedAt: lastRestaurant.created_at,
        lastTrendingScore: lastRestaurant.trending_score,
        lastDistance: lastRestaurant.distance_meters
      }));
    }

    // Get total count if requested
    let totalCount = undefined;
    if (include_total) {
      let countQuery = supabase.from('restaurants').select('*', { count: 'exact', head: true });
      
      // Apply same filters
      if (query) {
        countQuery = countQuery.or(`name.ilike.%${query}%,cuisine.ilike.%${query}%,neighborhood.ilike.%${query}%`);
      }
      if (cuisine) {
        countQuery = countQuery.ilike('cuisine', `%${cuisine}%`);
      }
      if (neighborhood) {
        countQuery = countQuery.ilike('neighborhood', `%${neighborhood}%`);
      }
      if (city) {
        // Use city filter patterns instead of exact matching (same logic as main query)
        let cityPattern: RegExp | null = null;
        
        if (city === 'NYC' || city === 'New York') {
          cityPattern = NYC_CONFIG.filterPattern;
        } else if (city === 'LA' || city === 'Los Angeles') {
          cityPattern = LA_CONFIG.filterPattern;
        }
        
        if (cityPattern) {
          const cityTerms = cityPattern.source.split('|').map(term => term.replace(/[()]/g, '').trim());
          const cityFilter = cityTerms.map(term => `city.ilike.%${term}%,neighborhood.ilike.%${term}%`).join(',');
          countQuery = countQuery.or(cityFilter);
        } else {
          countQuery = countQuery.eq('city', city);
        }
      }
      if (price_range) {
        countQuery = countQuery.eq('price_range', price_range);
      }
      if (has_photos) {
        countQuery = countQuery.not('images', 'is', null);
      }
      if (has_google_data) {
        countQuery = countQuery.not('googlePlaceId', 'is', null);
      }
      if (has_tripadvisor_data) {
        countQuery = countQuery.not('tripadvisor_location_id', 'is', null);
      }

      const { count, error: countError } = await countQuery;
      if (!countError) {
        totalCount = count || undefined;
      }
    }

    const result = {
      restaurants: enrichedRestaurants,
      nextCursor,
      hasMore,
      totalCount,
      metadata: {
        sort,
        limit,
        hasGeolocation: !!(lat && lng),
        filters: {
          search: query || null,
          cuisine: cuisine || null,
          neighborhood: neighborhood || null,
          city: city || null,
          priceRange: price_range || null,
          hasPhotos: has_photos,
          hasGoogleData: has_google_data,
          hasTripadvisorData: has_tripadvisor_data
        },
        timestamp: new Date().toISOString()
      }
    };

    console.log(`[Restaurants API] Returning ${enrichedRestaurants.length} restaurants, hasMore: ${hasMore}`);
    return result;

  } catch (error) {
    console.error('[Restaurants API] Error:', error);
    throw error;
  }
}