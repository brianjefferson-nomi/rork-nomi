import { supabase } from './supabase';
import { Restaurant } from '@/types/restaurant';

// Types for pagination
export interface PaginationOptions {
  limit?: number;
  cursor?: string; // For keyset pagination
  sortBy?: 'name' | 'rating' | 'created_at' | 'cuisine' | 'neighborhood';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  searchTerm?: string;
  cuisine?: string[];
  neighborhood?: string[];
  city?: string;
  priceRange?: string[];
  minRating?: number;
  maxRating?: number;
  hasImages?: boolean;
  hasCoordinates?: boolean;
  source?: 'tripadvisor' | 'google_places' | 'database';
}

export interface PaginationResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
  executionTime: number;
}

export interface RestaurantPaginationResult extends PaginationResult<Restaurant> {
  filters: SearchFilters;
  sortBy: string;
  sortOrder: string;
}

// Keyset pagination cursor structure
interface PaginationCursor {
  id: string;
  sortValue: string | number;
  sortBy: string;
}

/**
 * Restaurant Pagination Service
 * Implements efficient keyset pagination for large restaurant datasets
 * Supports search, filtering, and sorting with optimal performance
 */
export class RestaurantPaginationService {
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  /**
   * Get restaurants with keyset pagination
   */
  async getRestaurants(
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    const startTime = Date.now();
    
    const {
      limit = this.DEFAULT_LIMIT,
      cursor,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    // Validate and clamp limit
    const validLimit = Math.min(Math.max(limit, 1), this.MAX_LIMIT);

    try {
      // Build the base query
      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact' });

      // Apply filters
      query = this.applyFilters(query, filters);

      // Apply sorting and pagination
      query = this.applySortingAndPagination(query, sortBy, sortOrder, validLimit, cursor);

      const { data, error, count } = await query;

      if (error) {
        console.error('[RestaurantPagination] Query error:', error);
        throw new Error(`Failed to fetch restaurants: ${error.message}`);
      }

      const restaurants = (data || []).map(this.mapDatabaseRestaurant);
      const hasMore = restaurants.length === validLimit;
      const nextCursor = hasMore && restaurants.length > 0 
        ? this.createCursor(restaurants[restaurants.length - 1], sortBy)
        : undefined;

      const executionTime = Date.now() - startTime;

      // Log performance metrics
      if (executionTime > 1000) {
        console.warn(`[RestaurantPagination] Slow query detected: ${executionTime}ms for ${restaurants.length} results`);
      }

      console.log(`[RestaurantPagination] Fetched ${restaurants.length} restaurants in ${executionTime}ms`);

      return {
        data: restaurants,
        nextCursor,
        hasMore,
        total: count || 0,
        executionTime,
        filters,
        sortBy,
        sortOrder
      };

    } catch (error) {
      console.error('[RestaurantPagination] Error:', error);
      throw error;
    }
  }

  /**
   * Search restaurants with pagination
   */
  async searchRestaurants(
    searchTerm: string,
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    const startTime = Date.now();
    
    const {
      limit = this.DEFAULT_LIMIT,
      cursor,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const validLimit = Math.min(Math.max(limit, 1), this.MAX_LIMIT);

    try {
      // Build search query with full-text search
      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact' });

      // Apply search term using full-text search
      if (searchTerm.trim()) {
        // Sanitize search term for PostgreSQL tsquery
        const sanitizedSearchTerm = this.sanitizeSearchTerm(searchTerm.trim());
        if (sanitizedSearchTerm) {
          query = query.textSearch('name,description', sanitizedSearchTerm);
        }
      }

      // Apply additional filters
      query = this.applyFilters(query, filters);

      // Apply sorting and pagination
      query = this.applySortingAndPagination(query, sortBy, sortOrder, validLimit, cursor);

      const { data, error, count } = await query;

      if (error) {
        console.error('[RestaurantPagination] Search error:', error);
        throw new Error(`Failed to search restaurants: ${error.message}`);
      }

      const restaurants = (data || []).map(this.mapDatabaseRestaurant);
      const hasMore = restaurants.length === validLimit;
      const nextCursor = hasMore && restaurants.length > 0 
        ? this.createCursor(restaurants[restaurants.length - 1], sortBy)
        : undefined;

      const executionTime = Date.now() - startTime;

      console.log(`[RestaurantPagination] Search "${searchTerm}" returned ${restaurants.length} results in ${executionTime}ms`);

      return {
        data: restaurants,
        nextCursor,
        hasMore,
        total: count || 0,
        executionTime,
        filters: { ...filters, searchTerm },
        sortBy,
        sortOrder
      };

    } catch (error) {
      console.error('[RestaurantPagination] Search error:', error);
      throw error;
    }
  }

  /**
   * Get restaurants by cuisine with pagination
   */
  async getRestaurantsByCuisine(
    cuisine: string,
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    return this.getRestaurants(options, { ...filters, cuisine: [cuisine] });
  }

  /**
   * Get restaurants by neighborhood with pagination
   */
  async getRestaurantsByNeighborhood(
    neighborhood: string,
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    return this.getRestaurants(options, { ...filters, neighborhood: [neighborhood] });
  }

  /**
   * Get restaurants by city with pagination
   */
  async getRestaurantsByCity(
    city: string,
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    return this.getRestaurants(options, { ...filters, city });
  }

  /**
   * Get high-rated restaurants with pagination
   */
  async getHighRatedRestaurants(
    minRating: number = 4.0,
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    return this.getRestaurants(
      { ...options, sortBy: 'rating', sortOrder: 'desc' },
      { ...filters, minRating }
    );
  }

  /**
   * Get restaurants with images with pagination
   */
  async getRestaurantsWithImages(
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    return this.getRestaurants(options, { ...filters, hasImages: true });
  }

  /**
   * Get restaurants near a location with pagination
   */
  async getRestaurantsNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    options: PaginationOptions = {},
    filters: SearchFilters = {}
  ): Promise<RestaurantPaginationResult> {
    const startTime = Date.now();
    
    const {
      limit = this.DEFAULT_LIMIT,
      cursor,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const validLimit = Math.min(Math.max(limit, 1), this.MAX_LIMIT);

    try {
      // Use PostGIS for distance calculation if available, otherwise use simple bounding box
      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact' })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Apply distance filter using bounding box approximation
      const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
      const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

      query = query
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta);

      // Apply additional filters
      query = this.applyFilters(query, filters);

      // Apply sorting and pagination
      query = this.applySortingAndPagination(query, sortBy, sortOrder, validLimit, cursor);

      const { data, error, count } = await query;

      if (error) {
        console.error('[RestaurantPagination] Location search error:', error);
        throw new Error(`Failed to search restaurants by location: ${error.message}`);
      }

      // Calculate actual distances and filter by radius
      const restaurantsWithDistance = (data || [])
        .map(restaurant => ({
          ...this.mapDatabaseRestaurant(restaurant),
          distance: this.calculateDistance(latitude, longitude, restaurant.latitude, restaurant.longitude)
        }))
        .filter(restaurant => restaurant.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, validLimit);

      const hasMore = restaurantsWithDistance.length === validLimit;
      const nextCursor = hasMore && restaurantsWithDistance.length > 0 
        ? this.createCursor(restaurantsWithDistance[restaurantsWithDistance.length - 1], sortBy)
        : undefined;

      const executionTime = Date.now() - startTime;

      console.log(`[RestaurantPagination] Location search returned ${restaurantsWithDistance.length} results in ${executionTime}ms`);

      return {
        data: restaurantsWithDistance,
        nextCursor,
        hasMore,
        total: count || 0,
        executionTime,
        filters: { ...filters, hasCoordinates: true },
        sortBy,
        sortOrder
      };

    } catch (error) {
      console.error('[RestaurantPagination] Location search error:', error);
      throw error;
    }
  }

  /**
   * Apply filters to the query
   */
  private applyFilters(query: any, filters: SearchFilters): any {
    if (filters.cuisine && filters.cuisine.length > 0) {
      query = query.in('cuisine', filters.cuisine);
    }

    if (filters.neighborhood && filters.neighborhood.length > 0) {
      query = query.in('neighborhood', filters.neighborhood);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.priceRange && filters.priceRange.length > 0) {
      query = query.in('price_range', filters.priceRange);
    }

    if (filters.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters.maxRating !== undefined) {
      query = query.lte('rating', filters.maxRating);
    }

    if (filters.hasImages) {
      query = query.not('images', 'is', null);
    }

    if (filters.hasCoordinates) {
      query = query
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
    }

    if (filters.source === 'tripadvisor') {
      query = query.not('tripadvisor_location_id', 'is', null);
    }

    if (filters.source === 'google_places') {
      query = query.not('google_place_id', 'is', null);
    }

    return query;
  }

  /**
   * Apply sorting and pagination to the query
   */
  private applySortingAndPagination(
    query: any,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
    limit: number,
    cursor?: string
  ): any {
    // Apply sorting
    const sortColumn = this.getSortColumn(sortBy);
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply keyset pagination if cursor is provided
    if (cursor) {
      const cursorData = this.parseCursor(cursor);
      if (cursorData) {
        const { id, sortValue } = cursorData;
        
        if (sortOrder === 'asc') {
          query = query.or(`and(${sortColumn}.gt.${sortValue}),and(${sortColumn}.eq.${sortValue},id.gt.${id})`);
        } else {
          query = query.or(`and(${sortColumn}.lt.${sortValue}),and(${sortColumn}.eq.${sortValue},id.lt.${id})`);
        }
      }
    }

    // Apply limit
    query = query.limit(limit);

    return query;
  }

  /**
   * Get the appropriate sort column for the sort type
   */
  private getSortColumn(sortBy: string): string {
    switch (sortBy) {
      case 'rating':
        return 'rating';
      case 'created_at':
        return 'created_at';
      case 'cuisine':
        return 'cuisine';
      case 'neighborhood':
        return 'neighborhood';
      case 'name':
      default:
        return 'name';
    }
  }

  /**
   * Create a pagination cursor from a restaurant
   */
  private createCursor(restaurant: Restaurant, sortBy: string): string {
    const sortValue = this.getSortValue(restaurant, sortBy);
    const cursor: PaginationCursor = {
      id: restaurant.id,
      sortValue,
      sortBy
    };
    // Use btoa for web compatibility instead of Buffer
    return btoa(JSON.stringify(cursor));
  }

  /**
   * Parse a pagination cursor
   */
  private parseCursor(cursor: string): PaginationCursor | null {
    try {
      // Use atob for web compatibility instead of Buffer
      const decoded = atob(cursor);
      return JSON.parse(decoded) as PaginationCursor;
    } catch (error) {
      console.error('[RestaurantPagination] Invalid cursor:', error);
      return null;
    }
  }

  /**
   * Get the sort value for a restaurant based on sort type
   */
  private getSortValue(restaurant: Restaurant, sortBy: string): string | number {
    switch (sortBy) {
      case 'rating':
        return restaurant.rating || 0;
      case 'created_at':
        return restaurant.created_at || '';
      case 'cuisine':
        return restaurant.cuisine || '';
      case 'neighborhood':
        return restaurant.neighborhood || '';
      case 'name':
      default:
        return restaurant.name || '';
    }
  }

  /**
   * Map database restaurant to our Restaurant type
   */
  private mapDatabaseRestaurant(dbRestaurant: any): Restaurant {
    return {
      id: dbRestaurant.id,
      name: dbRestaurant.name,
      cuisine: dbRestaurant.cuisine,
      priceRange: dbRestaurant.price_range,
      imageUrl: dbRestaurant.image_url,
      images: dbRestaurant.images || [],
      address: dbRestaurant.address,
      neighborhood: dbRestaurant.neighborhood,
      hours: dbRestaurant.hours,
      vibe: dbRestaurant.vibe || [],
      description: dbRestaurant.description,
      menuHighlights: dbRestaurant.menu_highlights || [],
      rating: dbRestaurant.rating,
      reviews: dbRestaurant.reviews || [],
      aiDescription: dbRestaurant.ai_description,
      aiVibes: dbRestaurant.ai_vibes || [],
      aiTopPicks: dbRestaurant.ai_top_picks || [],
      phone: dbRestaurant.phone,
      website: dbRestaurant.website,
      priceLevel: dbRestaurant.price_level,
      restaurant_code: dbRestaurant.restaurant_code,
      city: dbRestaurant.city,
      state: dbRestaurant.state,
      latitude: dbRestaurant.latitude,
      longitude: dbRestaurant.longitude,
      googlePlaceId: dbRestaurant.google_place_id,
      googleRating: dbRestaurant.google_rating,
      googlePhotos: dbRestaurant.google_photos,
      editorialSummary: dbRestaurant.editorial_summary,
      tripadvisor_location_id: dbRestaurant.tripadvisor_location_id,
      tripadvisor_rating: dbRestaurant.tripadvisor_rating,
      tripadvisor_review_count: dbRestaurant.tripadvisor_review_count,
      tripadvisor_photos: dbRestaurant.tripadvisor_photos,
      tripadvisor_last_updated: dbRestaurant.tripadvisor_last_updated,
      created_at: dbRestaurant.created_at,
      updated_at: dbRestaurant.updated_at
    };
  }

  /**
   * Sanitize search term for PostgreSQL tsquery
   * Removes or escapes special characters that cause tsquery syntax errors
   */
  private sanitizeSearchTerm(searchTerm: string): string {
    if (!searchTerm) return '';
    
    // Handle specific problematic patterns first
    let sanitized = searchTerm.trim();
    
    // Fix patterns like "no. 7" -> "no.7" (remove space after period)
    sanitized = sanitized.replace(/\.\s+/g, '.');
    
    // Handle patterns like "no 7" -> "no.7" (add period between no and number)
    sanitized = sanitized.replace(/\bno\s+(\d+)\b/gi, 'no.$1');
    
    // Remove only the most problematic characters that cause immediate tsquery syntax errors
    sanitized = sanitized
      // Remove colons and semicolons that cause immediate syntax errors
      .replace(/[;:]/g, ' ')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Trim whitespace
      .trim();
    
    // If the sanitized term is empty or too short, return empty string
    if (sanitized.length < 2) {
      return '';
    }
    
    // For very short terms, use prefix matching
    if (sanitized.length <= 3) {
      return sanitized + ':*';
    }
    
    // For multi-word terms, join with & (AND operator) for better results
    const words = sanitized.split(' ').filter(word => word.length > 0);
    if (words.length > 1) {
      return words.map(word => {
        // Use prefix matching for short words
        if (word.length <= 3) {
          return word + ':*';
        }
        return word;
      }).join(' & ');
    }
    
    // For single words, return as is
    return sanitized;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Export singleton instance
export const restaurantPaginationService = new RestaurantPaginationService();
