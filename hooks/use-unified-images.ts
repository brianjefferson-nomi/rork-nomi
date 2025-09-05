import { useState, useEffect, useCallback } from 'react';
import { UnifiedImageService, UnifiedImageData } from '@/services/unified-image-service';

/**
 * Hook for managing unified restaurant images
 * Prioritizes user-uploaded photos over fallback images
 */
export function useUnifiedImages(restaurant: any, autoRefresh: boolean = true) {
  const [imageData, setImageData] = useState<UnifiedImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async (forceRefresh: boolean = false) => {
    if (!restaurant?.id) {
      setImageData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[useUnifiedImages] Loading images for ${restaurant.name}`);
      const data = await UnifiedImageService.getUnifiedImages(restaurant, forceRefresh);
      
      setImageData(data);
      console.log(`[useUnifiedImages] Loaded ${data.images.length} images for ${restaurant.name}`);
    } catch (err) {
      console.error(`[useUnifiedImages] Error loading images for ${restaurant.name}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  }, [restaurant]);

  // Load images on mount and when restaurant changes
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Auto-refresh when restaurant changes (if enabled)
  useEffect(() => {
    if (autoRefresh && restaurant?.id) {
      const interval = setInterval(() => {
        loadImages(true); // Force refresh
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [restaurant?.id, autoRefresh, loadImages]);

  const refreshImages = useCallback(() => {
    loadImages(true);
  }, [loadImages]);

  const clearCache = useCallback(() => {
    if (restaurant?.id) {
      UnifiedImageService.clearCache(restaurant.id);
      loadImages(true);
    }
  }, [restaurant?.id, loadImages]);

  return {
    imageData,
    isLoading,
    error,
    refreshImages,
    clearCache,
    // Convenience getters
    images: imageData?.images || [],
    hasUploadedPhotos: imageData?.hasUploadedPhotos || false,
    uploadedPhotoCount: imageData?.uploadedPhotoCount || 0,
    fallbackImages: imageData?.fallbackImages || []
  };
}

export default useUnifiedImages;
