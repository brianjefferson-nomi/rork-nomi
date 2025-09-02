

const TRIPADVISOR_API_KEY = '6893A2BEE10A4338A00D4CE27FEFE0A8';
const TRIPADVISOR_BASE_URL = 'https://api.content.tripadvisor.com/api/v1';

export interface TripAdvisorPhoto {
  id: string;
  caption: string;
  published_date: string;
  sizes: {
    thumbnail: {
      url: string;
      width: number;
      height: number;
    };
    small: {
      url: string;
      width: number;
      height: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
    };
    large: {
      url: string;
      width: number;
      height: number;
    };
    original: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export interface TripAdvisorPhotosResponse {
  data: TripAdvisorPhoto[];
}

export interface TripAdvisorLocationDetails {
  location_id: string;
  name: string;
  description?: string;
  address_string?: string;
  address_obj?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalcode?: string;
  };
  latitude?: number;
  longitude?: number;
  rating?: number;
  num_reviews?: number;
  ranking_data?: {
    ranking?: string;
    geo_location_id?: string;
    geo_location_name?: string;
    ranking_out_of?: number;
    ranking_string?: string;
  };
  phone?: string;
  website?: string;
  email?: string;
  write_review?: string;
  category?: {
    name?: string;
    localized_name?: string;
  };
  subcategory?: Array<{
    name?: string;
    localized_name?: string;
  }>;
  groups?: Array<{
    name?: string;
    localized_name?: string;
  }>;
  amenities?: Array<{
    name?: string;
    localized_name?: string;
  }>;
  awards?: Array<{
    award_type?: string;
    year?: number;
    localized_name?: string;
  }>;
  cuisine?: Array<{
    name?: string;
    localized_name?: string;
  }>;
  price_level?: string;
  price?: string;
  hours?: {
    periods?: Array<{
      open?: {
        day?: number;
        time?: string;
      };
      close?: {
        day?: number;
        time?: string;
      };
    }>;
    weekday_text?: string[];
  };
  features?: Array<{
    name?: string;
    localized_name?: string;
  }>;
}

export interface TripAdvisorLocationDetailsResponse {
  data: TripAdvisorLocationDetails;
}

export interface TripAdvisorReview {
  id: string;
  lang: string;
  location_id: string;
  published_date: string;
  rating: number;
  helpful_votes: number;
  rating_image_url: string;
  url: string;
  travel_date?: string;
  text: string;
  title?: string;
  owner_response?: {
    text: string;
    published_date: string;
  };
  user?: {
    username: string;
    user_location?: string;
    avatar?: {
      small?: {
        url: string;
      };
      large?: {
        url: string;
      };
    };
  };
  subratings?: {
    [key: string]: number;
  };
}

export interface TripAdvisorReviewsResponse {
  data: TripAdvisorReview[];
  paging: {
    results: number;
    total_results: number;
    has_more: boolean;
    skipped: number;
  };
}

class TripAdvisorService {
  private apiKey: string;

  constructor(apiKey: string = TRIPADVISOR_API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch photos for a specific location
   * @param locationId - TripAdvisor location ID
   * @param language - Language code (default: 'en')
   * @returns Promise with location photos
   */
  async getLocationPhotos(locationId: string, language: string = 'en'): Promise<TripAdvisorPhoto[]> {
    try {
      const url = `${TRIPADVISOR_BASE_URL}/location/${locationId}/photos?language=${language}&key=${this.apiKey}`;
      
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      };

      console.log(`[TripAdvisor] Fetching photos for location ${locationId}...`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`TripAdvisor API error: ${response.status} ${response.statusText}`);
      }

      const data: TripAdvisorPhotosResponse = await response.json();
      
      console.log(`[TripAdvisor] Found ${data.data?.length || 0} photos for location ${locationId}`);
      
      return data.data || [];
    } catch (error) {
      console.error(`[TripAdvisor] Error fetching photos for location ${locationId}:`, error);
      return [];
    }
  }

  /**
   * Get location details including rating and review count
   * @param locationId - TripAdvisor location ID
   * @param language - Language code (default: 'en')
   * @returns Promise with location details
   */
  async getLocationDetails(locationId: string, language: string = 'en'): Promise<TripAdvisorLocationDetails | null> {
    try {
      const url = `${TRIPADVISOR_BASE_URL}/location/${locationId}/details?language=${language}&key=${this.apiKey}`;
      
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      };

      console.log(`[TripAdvisor] Fetching details for location ${locationId}...`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`TripAdvisor API error: ${response.status} ${response.statusText}`);
      }

      const data: TripAdvisorLocationDetailsResponse = await response.json();
      
      console.log(`[TripAdvisor] Found details for location ${locationId}:`, {
        name: data.data?.name,
        rating: data.data?.rating,
        num_reviews: data.data?.num_reviews
      });
      
      return data.data || null;
    } catch (error) {
      console.error(`[TripAdvisor] Error fetching details for location ${locationId}:`, error);
      return null;
    }
  }

  /**
   * Get reviews for a specific location
   * @param locationId - TripAdvisor location ID
   * @param language - Language code (default: 'en')
   * @param limit - Number of reviews to return (default: 10, max: 20)
   * @param offset - Number of reviews to skip (default: 0)
   * @returns Promise with location reviews
   */
  async getLocationReviews(locationId: string, language: string = 'en', limit: number = 10, offset: number = 0): Promise<TripAdvisorReviewsResponse | null> {
    try {
      const url = `${TRIPADVISOR_BASE_URL}/location/${locationId}/reviews?language=${language}&limit=${limit}&offset=${offset}&key=${this.apiKey}`;
      
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      };

      console.log(`[TripAdvisor] Fetching reviews for location ${locationId}...`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`TripAdvisor API error: ${response.status} ${response.statusText}`);
      }

      const data: TripAdvisorReviewsResponse = await response.json();
      
      console.log(`[TripAdvisor] Found ${data.data?.length || 0} reviews for location ${locationId}`);
      
      return data;
    } catch (error) {
      console.error(`[TripAdvisor] Error fetching reviews for location ${locationId}:`, error);
      return null;
    }
  }

  /**
   * Get location rating and review count
   * @param locationId - TripAdvisor location ID
   * @returns Promise with rating data
   */
  async getLocationRating(locationId: string): Promise<{ rating: number; num_reviews: number } | null> {
    try {
      const details = await this.getLocationDetails(locationId);
      
      if (!details) {
        return null;
      }

      return {
        rating: details.rating || 0,
        num_reviews: details.num_reviews || 0
      };
    } catch (error) {
      console.error(`[TripAdvisor] Error getting rating for location ${locationId}:`, error);
      return null;
    }
  }

  /**
   * Get comprehensive location data including photos, details, and reviews
   * @param locationId - TripAdvisor location ID
   * @param includeReviews - Whether to include reviews (default: false)
   * @returns Promise with comprehensive location data
   */
  async getLocationData(locationId: string, includeReviews: boolean = false): Promise<{
    details: TripAdvisorLocationDetails | null;
    photos: TripAdvisorPhoto[];
    reviews: TripAdvisorReview[] | null;
  }> {
    try {
      console.log(`[TripAdvisor] Fetching comprehensive data for location ${locationId}...`);
      
      // Fetch details and photos in parallel
      const [details, photos] = await Promise.all([
        this.getLocationDetails(locationId),
        this.getLocationPhotos(locationId)
      ]);

      let reviews: TripAdvisorReview[] | null = null;
      
      if (includeReviews) {
        const reviewsResponse = await this.getLocationReviews(locationId, 'en', 5);
        reviews = reviewsResponse?.data || null;
      }

      return {
        details,
        photos,
        reviews
      };
    } catch (error) {
      console.error(`[TripAdvisor] Error fetching comprehensive data for location ${locationId}:`, error);
      return {
        details: null,
        photos: [],
        reviews: null
      };
    }
  }

  /**
   * Get the best photo URL for a location (prefers large, falls back to medium)
   * @param locationId - TripAdvisor location ID
   * @param preferredSize - Preferred photo size ('large', 'medium', 'small', 'thumbnail')
   * @returns Promise with the best photo URL or null
   */
  async getBestLocationPhoto(locationId: string, preferredSize: 'large' | 'medium' | 'small' | 'thumbnail' = 'large'): Promise<string | null> {
    try {
      const photos = await this.getLocationPhotos(locationId);
      
      if (!photos || photos.length === 0) {
        console.log(`[TripAdvisor] No photos found for location ${locationId}`);
        return null;
      }

      // Get the first photo (most recent)
      const photo = photos[0];
      
      // Try to get the preferred size, fall back to medium if not available
      const photoUrl = photo.sizes[preferredSize]?.url || photo.sizes.medium?.url || photo.sizes.small?.url;
      
      if (photoUrl) {
        console.log(`[TripAdvisor] Using ${preferredSize} photo for location ${locationId}: ${photoUrl}`);
        return photoUrl;
      }

      console.log(`[TripAdvisor] No suitable photo found for location ${locationId}`);
      return null;
    } catch (error) {
      console.error(`[TripAdvisor] Error getting best photo for location ${locationId}:`, error);
      return null;
    }
  }

  /**
   * Get multiple photo URLs for a location
   * @param locationId - TripAdvisor location ID
   * @param maxPhotos - Maximum number of photos to return (default: 5)
   * @param preferredSize - Preferred photo size
   * @returns Promise with array of photo URLs
   */
  async getLocationPhotoUrls(locationId: string, maxPhotos: number = 5, preferredSize: 'large' | 'medium' | 'small' | 'thumbnail' = 'large'): Promise<string[]> {
    try {
      const photos = await this.getLocationPhotos(locationId);
      
      if (!photos || photos.length === 0) {
        return [];
      }

      const photoUrls: string[] = [];
      
      // Take up to maxPhotos
      const photosToProcess = photos.slice(0, maxPhotos);
      
      for (const photo of photosToProcess) {
        const photoUrl = photo.sizes[preferredSize]?.url || photo.sizes.medium?.url || photo.sizes.small?.url;
        if (photoUrl) {
          photoUrls.push(photoUrl);
        }
      }

      console.log(`[TripAdvisor] Returning ${photoUrls.length} photo URLs for location ${locationId}`);
      return photoUrls;
    } catch (error) {
      console.error(`[TripAdvisor] Error getting photo URLs for location ${locationId}:`, error);
      return [];
    }
  }

  /**
   * Search for a location by name and get its photos
   * Note: This would require the location search endpoint, which isn't shown in the provided docs
   * @param locationName - Name of the location to search for
   * @param city - City name for more specific search
   * @returns Promise with location photos or null
   */
  async searchLocationAndGetPhotos(locationName: string, city?: string): Promise<TripAdvisorPhoto[] | null> {
    // This would require implementing the location search endpoint
    // For now, this is a placeholder
    console.log(`[TripAdvisor] Location search not implemented yet for: ${locationName} in ${city}`);
    return null;
  }
}

// Export singleton instance
export const tripAdvisorService = new TripAdvisorService();

// Export the class for testing or custom instances
export { TripAdvisorService };
