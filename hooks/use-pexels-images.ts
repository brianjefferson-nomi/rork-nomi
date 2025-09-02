import { useState, useEffect, useMemo } from 'react';
import PexelsService, { PexelsImage } from '@/services/pexels';

/**
 * Hook for fetching Pexels images with caching and error handling
 */
// Cache for images to prevent re-fetching
const imageCache = new Map<string, PexelsImage>();

export function usePexelsImage(
  query: string,
  type: 'collection' | 'neighborhood' | 'cuisine' | 'city' | 'custom' = 'custom',
  additionalContext?: { cuisines?: string[]; city?: string; collectionId?: string }
) {
  const [image, setImage] = useState<PexelsImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the context to prevent infinite loops
  const memoizedContext = useMemo(() => ({
    cuisines: additionalContext?.cuisines || [],
    city: additionalContext?.city || '',
    collectionId: additionalContext?.collectionId || ''
  }), [additionalContext?.cuisines, additionalContext?.city, additionalContext?.collectionId]);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create a cache key based on query, type, and context
        const cacheKey = `${type}:${query}:${JSON.stringify(memoizedContext)}`;
        
        // Check cache first
        if (imageCache.has(cacheKey)) {
          const cachedImage = imageCache.get(cacheKey);
          if (cachedImage && isMounted) {
            setImage(cachedImage);
            setIsLoading(false);
            console.log(`[usePexelsImage] Using cached image for "${query}" (ID: ${cachedImage.id})`);
            return;
          }
        }

        let fetchedImage: PexelsImage | null = null;

        switch (type) {
          case 'collection':
            fetchedImage = await PexelsService.getCollectionCoverImage(
              query,
              memoizedContext.cuisines,
              memoizedContext.city,
              memoizedContext.collectionId
            );
            break;
          
          case 'neighborhood':
            fetchedImage = await PexelsService.getNeighborhoodImage(
              query,
              memoizedContext.city
            );
            break;
          
          case 'cuisine':
            fetchedImage = await PexelsService.getCuisineImage(query);
            break;
          
          case 'city':
            fetchedImage = await PexelsService.getCityImage(query);
            break;
          
          case 'custom':
          default:
            const searchResults = await PexelsService.searchImages(query, 1);
            fetchedImage = searchResults.length > 0 ? searchResults[0] : null;
            break;
        }

        if (isMounted) {
          if (fetchedImage) {
            // Cache the image for future use
            const cacheKey = `${type}:${query}:${JSON.stringify(memoizedContext)}`;
            imageCache.set(cacheKey, fetchedImage);
            
            setImage(fetchedImage);
            console.log(`[usePexelsImage] Successfully fetched and cached ${type} image for "${query}" (ID: ${fetchedImage.id})`);
          } else {
            setError('No images found');
            console.warn(`[usePexelsImage] No images found for ${type}: "${query}"`);
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch image';
          setError(errorMessage);
          console.error(`[usePexelsImage] Error fetching ${type} image for "${query}":`, err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (query) {
      fetchImage();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [query, type, memoizedContext.cuisines, memoizedContext.city, memoizedContext.collectionId]);

  const refetch = () => {
    setError(null);
    setIsLoading(true);
    // The useEffect will handle the refetch
  };

  // Debug function to check current state
  const debugState = () => {
    console.log(`[usePexelsImage] Debug for "${query}":`, {
      type,
      context: memoizedContext,
      cacheSize: imageCache.size,
      currentImage: image?.id
    });
  };

  return {
    image,
    isLoading,
    error,
    refetch,
    debugState
  };
}

/**
 * Hook for fetching multiple Pexels images
 */
export function usePexelsImages(
  queries: string[],
  type: 'collection' | 'neighborhood' | 'cuisine' | 'city' | 'custom' = 'custom',
  additionalContext?: { cuisines?: string[]; city?: string; collectionId?: string }
) {
  const [images, setImages] = useState<(PexelsImage | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the queries array to prevent infinite loops
  const memoizedQueries = useMemo(() => queries, [queries.join(',')]);
  
  // Memoize the context to prevent infinite loops
  const memoizedContext = useMemo(() => ({
    cuisines: additionalContext?.cuisines || [],
    city: additionalContext?.city || '',
    collectionId: additionalContext?.collectionId || ''
  }), [additionalContext?.cuisines, additionalContext?.city, additionalContext?.collectionId]);

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchedImages = await Promise.all(
          memoizedQueries.map(async (query) => {
            try {
              let fetchedImage: PexelsImage | null = null;

              switch (type) {
                case 'collection':
                  fetchedImage = await PexelsService.getCollectionCoverImage(
                    query,
                    memoizedContext.cuisines,
                    memoizedContext.city,
                    memoizedContext.collectionId
                  );
                  break;
                
                case 'neighborhood':
                  fetchedImage = await PexelsService.getNeighborhoodImage(
                    query,
                    memoizedContext.city
                  );
                  break;
                
                case 'cuisine':
                  fetchedImage = await PexelsService.getCuisineImage(query);
                  break;
                
                case 'city':
                  fetchedImage = await PexelsService.getCityImage(query);
                  break;
                
                case 'custom':
                default:
                  const searchResults = await PexelsService.searchImages(query, 1);
                  fetchedImage = searchResults.length > 0 ? searchResults[0] : null;
                  break;
              }

              return fetchedImage;
            } catch (err) {
              console.error(`[usePexelsImages] Error fetching image for "${query}":`, err);
              return null;
            }
          })
        );

        if (isMounted) {
          setImages(fetchedImages);
          const successCount = fetchedImages.filter(img => img !== null).length;
          console.log(`[usePexelsImages] Successfully fetched ${successCount}/${queries.length} images`);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
          setError(errorMessage);
          console.error(`[usePexelsImages] Error fetching images:`, err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (queries.length > 0) {
      fetchImages();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [queries, type, memoizedContext.cuisines, memoizedContext.city, memoizedContext.collectionId]);

  const refetch = () => {
    setError(null);
    setIsLoading(true);
    // The useEffect will handle the refetch
  };

  return {
    images,
    isLoading,
    error,
    refetch
  };
}
