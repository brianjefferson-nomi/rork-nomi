import { PhotoUploadService, UploadedPhoto } from './photo-upload';

export interface UnifiedImageData {
  images: string[];
  hasUploadedPhotos: boolean;
  uploadedPhotoCount: number;
  fallbackImages: string[];
}

/**
 * Unified service for handling restaurant images across all components
 * Prioritizes user-uploaded photos over fallback images
 */
export class UnifiedImageService {
  private static imageCache = new Map<string, UnifiedImageData>();
  private static cacheExpiry = new Map<string, number>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get unified image data for a restaurant
   * @param restaurant - Restaurant object
   * @param forceRefresh - Force refresh the cache
   * @returns Unified image data with uploaded photos prioritized
   */
  static async getUnifiedImages(
    restaurant: any,
    forceRefresh: boolean = false
  ): Promise<UnifiedImageData> {
    if (!restaurant?.id) {
      return this.getFallbackImages(restaurant);
    }

    const cacheKey = `restaurant_${restaurant.id}`;
    const now = Date.now();

    // Check cache first
    if (!forceRefresh && this.imageCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (now < expiry) {
        console.log(`[UnifiedImageService] Using cached images for ${restaurant.name}`);
        return this.imageCache.get(cacheKey)!;
      }
    }

    try {
      console.log(`[UnifiedImageService] Fetching unified images for ${restaurant.name}`);
      
      // Get uploaded photos (ordered by oldest first)
      const uploadedPhotos = await PhotoUploadService.getRestaurantPhotos(restaurant.id);
      console.log(`[UnifiedImageService] Found ${uploadedPhotos.length} uploaded photos for ${restaurant.name}`);

      // Get fallback images
      const fallbackImages = this.getFallbackImages(restaurant).images;
      console.log(`[UnifiedImageService] Found ${fallbackImages.length} fallback images for ${restaurant.name}`);

      // Only include uploaded photos if available, otherwise use fallback images
      const allImages = uploadedPhotos.length > 0 
        ? uploadedPhotos.map(photo => photo.url) // Only uploaded photos if available
        : fallbackImages; // Only fallback images if no uploaded photos

      const unifiedData: UnifiedImageData = {
        images: allImages,
        hasUploadedPhotos: uploadedPhotos.length > 0,
        uploadedPhotoCount: uploadedPhotos.length,
        fallbackImages: fallbackImages
      };

      // Cache the result
      this.imageCache.set(cacheKey, unifiedData);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

      console.log(`[UnifiedImageService] Unified images for ${restaurant.name}:`, {
        totalImages: allImages.length,
        uploadedPhotos: uploadedPhotos.length,
        fallbackImages: fallbackImages.length,
        usingFallback: uploadedPhotos.length === 0
      });

      return unifiedData;
    } catch (error) {
      console.error(`[UnifiedImageService] Error fetching images for ${restaurant.name}:`, error);
      return this.getFallbackImages(restaurant);
    }
  }

  /**
   * Get fallback images for a restaurant
   */
  private static getFallbackImages(restaurant: any): UnifiedImageData {
    if (!restaurant) {
      return {
        images: [this.getDefaultImage()],
        hasUploadedPhotos: false,
        uploadedPhotoCount: 0,
        fallbackImages: [this.getDefaultImage()]
      };
    }


    // Build fallback images array
    let fallbackImages: string[] = [];

    // First, try Google Places photos if available
    if (restaurant.googlePhotos) {
      let googlePhotoUrls: string[] = [];
      
      if (typeof restaurant.googlePhotos === 'string') {
        // Google Photos can be a comma-separated string of URLs
        googlePhotoUrls = restaurant.googlePhotos.split(',')
          .map((url: any) => typeof url === 'string' ? url.trim() : '')
          .filter((url: string) => url.length > 0);
      } else if (Array.isArray(restaurant.googlePhotos)) {
        // Google Photos can also be an array of URLs
        googlePhotoUrls = restaurant.googlePhotos
          .filter((url: any) => typeof url === 'string' && url.trim().length > 0)
          .map((url: string) => url.trim());
      }
      
      if (googlePhotoUrls.length > 0) {
        fallbackImages.push(...googlePhotoUrls);
        console.log(`[UnifiedImageService] Added ${googlePhotoUrls.length} Google Photos for ${restaurant.name}`);
      }
    }

    // Add TripAdvisor photos if available
    if (restaurant.tripadvisorPhotos && Array.isArray(restaurant.tripadvisorPhotos) && restaurant.tripadvisorPhotos.length > 0) {
      const validTripAdvisorPhotos = restaurant.tripadvisorPhotos.filter((img: any) => typeof img === 'string');
      fallbackImages = [...fallbackImages, ...validTripAdvisorPhotos];
    }

    // Then add any other images from the images array
    if (restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0) {
      // Filter out non-string values and add valid ones
      const stringImages = restaurant.images.filter((img: any) => typeof img === 'string');
      fallbackImages = [...fallbackImages, ...stringImages];
    }

    // Finally, add the main image URL if different
    if (restaurant.imageUrl && typeof restaurant.imageUrl === 'string' && !fallbackImages.includes(restaurant.imageUrl)) {
      fallbackImages.push(restaurant.imageUrl);
    }

    // Filter valid images with comprehensive type checking
    const validImages = fallbackImages.filter(img => {
      try {
        // Ensure img exists and is a string
        if (!img || typeof img !== 'string') {
          return false;
        }
        
        // Trim and check if it's a valid URL
        const trimmedImg = img.trim();
        const isValid = trimmedImg.length > 0 && trimmedImg.startsWith('http');
        return isValid;
      } catch (error) {
        console.warn('[UnifiedImageService] Error filtering image:', img, error);
        return false;
      }
    });

    // If no valid images, use the standard default image
    if (validImages.length === 0) {
      const defaultImage = this.getDefaultImage();
      validImages.push(defaultImage);
    }

    return {
      images: validImages,
      hasUploadedPhotos: false,
      uploadedPhotoCount: 0,
      fallbackImages: validImages
    };
  }


  /**
   * Get default image
   */
  private static getDefaultImage(): string {
    return 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
  }

  /**
   * Clear cache for a specific restaurant
   */
  static clearCache(restaurantId: string): void {
    const cacheKey = `restaurant_${restaurantId}`;
    this.imageCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
    console.log(`[UnifiedImageService] Cleared cache for restaurant ${restaurantId}`);
  }

  /**
   * Clear cache for a restaurant by name (useful for debugging)
   */
  static clearCacheByName(restaurantName: string): void {
    const cacheKey = `restaurant_${restaurantName}`;
    this.imageCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
    console.log(`[UnifiedImageService] Cleared cache for restaurant ${restaurantName}`);
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    this.imageCache.clear();
    this.cacheExpiry.clear();
    console.log('[UnifiedImageService] Cleared all cache');
  }

  /**
   * Get cached image data without fetching
   */
  static getCachedImages(restaurantId: string): UnifiedImageData | null {
    const cacheKey = `restaurant_${restaurantId}`;
    const now = Date.now();
    const expiry = this.cacheExpiry.get(cacheKey) || 0;
    
    if (now < expiry && this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }
    
    return null;
  }
}

export default UnifiedImageService;
