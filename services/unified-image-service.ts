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
          .map(url => typeof url === 'string' ? url.trim() : '')
          .filter(url => url.length > 0);
      } else if (Array.isArray(restaurant.googlePhotos)) {
        // Google Photos can also be an array of URLs
        googlePhotoUrls = restaurant.googlePhotos
          .filter(url => typeof url === 'string' && url.trim().length > 0)
          .map(url => url.trim());
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

    // If no valid images, use varied default
    if (validImages.length === 0) {
      const defaultImage = this.getVariedDefaultImage(restaurant);
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
   * Get a varied default image based on restaurant characteristics
   */
  private static getVariedDefaultImage(restaurant: any): string {
    const name = restaurant.name?.toLowerCase() || '';
    const cuisine = restaurant.cuisine?.toLowerCase() || '';
    
    // Enhanced food category-based images with better variety
    const foodImages = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', // Restaurant interior
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', // Pizza
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', // Burger
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', // Sushi
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', // Pasta
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', // Japanese
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', // Mexican
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400', // Thai
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', // Indian
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', // American
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400', // Chinese
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', // Mediterranean
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400', // Korean
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', // French
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', // Fine dining
    ];
    
    // Use restaurant name to generate a consistent but varied image
    let imageIndex = 0;
    for (let i = 0; i < name.length; i++) {
      imageIndex += name.charCodeAt(i);
    }
    imageIndex = imageIndex % foodImages.length;
    
    // Enhanced cuisine-based overrides
    if (cuisine.includes('pizza') || name.includes('pizza')) {
      imageIndex = 1; // Pizza image
    } else if (cuisine.includes('burger') || name.includes('burger') || name.includes('king')) {
      imageIndex = 2; // Burger image
    } else if (cuisine.includes('sushi') || cuisine.includes('japanese') || name.includes('sushi')) {
      imageIndex = 3; // Sushi image
    } else if (cuisine.includes('italian') || name.includes('pasta') || name.includes('pizza')) {
      imageIndex = 4; // Italian image
    } else if (cuisine.includes('japanese') || name.includes('sushi') || name.includes('ramen')) {
      imageIndex = 5; // Japanese image
    } else if (cuisine.includes('mexican') || name.includes('taco') || name.includes('burrito')) {
      imageIndex = 6; // Mexican image
    } else if (cuisine.includes('thai') || name.includes('thai')) {
      imageIndex = 7; // Thai image
    } else if (cuisine.includes('indian') || name.includes('curry') || name.includes('tandoor')) {
      imageIndex = 8; // Indian image
    } else if (cuisine.includes('american') || name.includes('burger') || name.includes('diner')) {
      imageIndex = 9; // American image
    } else if (cuisine.includes('chinese') || name.includes('wok') || name.includes('dragon')) {
      imageIndex = 10; // Chinese image
    } else if (cuisine.includes('mediterranean') || name.includes('greek') || name.includes('falafel')) {
      imageIndex = 11; // Mediterranean image
    } else if (cuisine.includes('korean') || name.includes('bbq') || name.includes('seoul')) {
      imageIndex = 12; // Korean image
    } else if (cuisine.includes('french') || name.includes('bistro') || name.includes('le ')) {
      imageIndex = 13; // French image
    } else if (cuisine.includes('fine dining') || name.includes('steak') || name.includes('grill')) {
      imageIndex = 14; // Fine dining image
    }
    
    return foodImages[imageIndex];
  }

  /**
   * Get default image
   */
  private static getDefaultImage(): string {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
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
