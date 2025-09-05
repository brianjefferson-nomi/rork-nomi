import { createClient } from 'pexels';
import PexelsImageStorageService from './pexels-image-storage';
import { supabase } from './supabase';

const client = createClient('MsSqJ9Z86YrK2mDnhYDKEFIGDpLcsBBMp4MbTf1RXpvywpMHcH8QTLy0');

export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string | null;
}

export interface PexelsSearchResponse {
  photos: PexelsImage[];
  total_results: number;
  page: number;
  per_page: number;
  prev_page?: string;
  next_page?: string;
}

/**
 * Pexels service for fetching high-quality images
 */
export class PexelsService {
  /**
   * Search for images based on query
   */
  static async searchImages(query: string, perPage: number = 10): Promise<PexelsImage[]> {
    try {
      console.log(`[PexelsService] Searching for images: "${query}"`);
      
      const response = await client.photos.search({
        query,
        per_page: perPage,
        orientation: 'landscape'
      });

      // Check if response is an error
      if ('error' in response) {
        console.error(`[PexelsService] Pexels API error:`, response.error);
        return [];
      }

      console.log(`[PexelsService] Found ${response.photos.length} images for "${query}"`);
      return response.photos;
    } catch (error) {
      console.error(`[PexelsService] Error searching for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get collection cover image based on collection name and cuisines
   */
  static async getCollectionCoverImage(
    collectionName: string, 
    cuisines: string[] = [], 
    city?: string,
    collectionId?: string
  ): Promise<PexelsImage | null> {
    try {
      // First check if the collection already has a cover_image in the database
      if (collectionId) {
        const existingCoverImage = await this.getExistingCollectionCoverImage(collectionId);
        if (existingCoverImage) {
          console.log(`[PexelsService] Collection "${collectionName}" already has cover image: ${existingCoverImage.id}`);
          return existingCoverImage;
        }
      }

      // If no existing cover image, check saved Pexels images
      const savedImage = await PexelsImageStorageService.getSavedPexelsImage('collection', {
        collectionId,
        city
      });

      if (savedImage) {
        console.log(`[PexelsService] Found saved Pexels image for "${collectionName}"`);
        // Convert saved image back to PexelsImage format
        return {
          id: savedImage.pexels_id,
          width: savedImage.width,
          height: savedImage.height,
          url: savedImage.image_url,
          photographer: savedImage.photographer,
          photographer_url: savedImage.photographer_url,
          src: {
            original: savedImage.image_url,
            large2x: savedImage.image_url,
            large: savedImage.image_url,
            medium: savedImage.thumbnail_url,
            small: savedImage.thumbnail_url,
            portrait: savedImage.thumbnail_url,
            landscape: savedImage.thumbnail_url,
            tiny: savedImage.thumbnail_url
          },
          alt: savedImage.alt_text || ''
        };
      }

      // Build search query from collection name and cuisines
      let searchQuery = collectionName.toLowerCase();
      
      // Add cuisine keywords if available
      if (cuisines.length > 0) {
        const cuisineKeywords = cuisines
          .filter(cuisine => cuisine && cuisine.trim())
          .map(cuisine => cuisine.toLowerCase().trim())
          .slice(0, 3); // Limit to 3 cuisines to avoid overly specific searches
        
        if (cuisineKeywords.length > 0) {
          searchQuery += ` ${cuisineKeywords.join(' ')}`;
        }
      }
      
      // Add city context if available
      if (city) {
        searchQuery += ` ${city.toLowerCase()}`;
      }
      
      // Add collection-specific keywords for better variety
      const collectionKeywords = this.getCollectionKeywords(collectionName);
      searchQuery += ` ${collectionKeywords}`;
      
      // Add "food" or "restaurant" context if not already present
      if (!searchQuery.includes('food') && !searchQuery.includes('restaurant')) {
        searchQuery += ' food restaurant';
      }
      
      console.log(`[PexelsService] Getting collection cover for: "${searchQuery}"`);
      
      // Get more images to have variety
      const images = await this.searchImages(searchQuery, 20);
      
      if (images.length > 0) {
        const selectedImage = images[0];
        
        // Save the image to the database AND update the collection's cover_image
        if (collectionId) {
          await this.saveCollectionCoverImage(collectionId, selectedImage, {
            city,
            cuisine: cuisines[0]
          });
        } else {
          // Fallback to just saving to pexels_images table
          await PexelsImageStorageService.savePexelsImage(selectedImage, 'collection', {
            collectionId,
            city,
            cuisine: cuisines[0]
          });
        }
        
        console.log(`[PexelsService] Saved collection image to database and updated cover_image`);
        return selectedImage;
      }
      
      // Fallback to generic food search with variety
      const fallbackImages = await this.searchImages('food restaurant cuisine', 20);
      if (fallbackImages.length > 0) {
        const fallbackImage = fallbackImages[0];
        
        // Save the fallback image to the database AND update collection cover_image
        if (collectionId) {
          await this.saveCollectionCoverImage(collectionId, fallbackImage, {
            city
          });
        } else {
          // Fallback to just saving to pexels_images table
          await PexelsImageStorageService.savePexelsImage(fallbackImage, 'collection', {
            collectionId,
            city
          });
        }
        
        return fallbackImage;
      }
      
      return null;
      
    } catch (error) {
      console.error('[PexelsService] Error getting collection cover:', error);
      return null;
    }
  }

  /**
   * Get neighborhood card image based on neighborhood name and city
   */
  static async getNeighborhoodImage(
    neighborhood: string, 
    city?: string
  ): Promise<PexelsImage | null> {
    try {
      // First check if we have a saved image for this neighborhood
      const savedImage = await PexelsImageStorageService.getSavedPexelsImage('neighborhood', {
        neighborhood,
        city
      });

      if (savedImage) {
        console.log(`[PexelsService] Found saved neighborhood image for "${neighborhood}"`);
        // Convert saved image back to PexelsImage format
        return {
          id: savedImage.pexels_id,
          width: savedImage.width,
          height: savedImage.height,
          url: savedImage.image_url,
          photographer: savedImage.photographer,
          photographer_url: savedImage.photographer_url,
          src: {
            original: savedImage.image_url,
            large2x: savedImage.image_url,
            large: savedImage.image_url,
            medium: savedImage.thumbnail_url,
            small: savedImage.thumbnail_url,
            portrait: savedImage.thumbnail_url,
            landscape: savedImage.thumbnail_url,
            tiny: savedImage.thumbnail_url
          },
          alt: savedImage.alt_text || ''
        };
      }

      // Create a more specific search query based on neighborhood characteristics
      let searchQuery = '';
      
      // Add neighborhood-specific keywords for better variety
      const neighborhoodKeywords = this.getNeighborhoodKeywords(neighborhood);
      searchQuery = `${neighborhood.toLowerCase()} ${neighborhoodKeywords}`;
      
      // Add city context if available
      if (city) {
        searchQuery += ` ${city.toLowerCase()}`;
      }
      
      // Add architectural/urban context
      searchQuery += ' architecture urban street';
      
      console.log(`[PexelsService] Getting neighborhood image for "${neighborhood}"`);
      
      const images = await this.searchImages(searchQuery, 30);
      
      if (images.length > 0) {
        const selectedImage = images[0];
        
        // Save the image to the database for future use
        await PexelsImageStorageService.savePexelsImage(selectedImage, 'neighborhood', {
          neighborhood,
          city
        });
        
        console.log(`[PexelsService] Saved neighborhood image to database`);
        return selectedImage;
      }
      
      // Try alternative search with different keywords
      const alternativeQuery = `${neighborhood.toLowerCase()} ${city || 'city'} district area`;
      const alternativeImages = await this.searchImages(alternativeQuery, 20);
      
      if (alternativeImages.length > 0) {
        const selectedImage = alternativeImages[0];
        
        // Save the alternative image to the database
        await PexelsImageStorageService.savePexelsImage(selectedImage, 'neighborhood', {
          neighborhood,
          city
        });
        
        return selectedImage;
      }
      
      // Fallback to city search with variety
      if (city) {
        const cityImages = await this.searchImages(`${city} city skyline urban`, 30);
        if (cityImages.length > 0) {
          const selectedImage = cityImages[0];
          
          // Save the fallback image to the database
          await PexelsImageStorageService.savePexelsImage(selectedImage, 'neighborhood', {
            neighborhood,
            city
          });
          
          return selectedImage;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('[PexelsService] Error getting neighborhood image:', error);
      return null;
    }
  }

  /**
   * Get cuisine-specific food images
   */
  static async getCuisineImage(cuisine: string): Promise<PexelsImage | null> {
    try {
      const searchQuery = `${cuisine} food cuisine`;
      console.log(`[PexelsService] Getting cuisine image for: "${searchQuery}"`);
      
      const images = await this.searchImages(searchQuery, 5);
      return images.length > 0 ? images[0] : null;
      
    } catch (error) {
      console.error(`[PexelsService] Error getting cuisine image for "${cuisine}":`, error);
      return null;
    }
  }

  /**
   * Get city skyline or landmark images
   */
  static async getCityImage(city: string): Promise<PexelsImage | null> {
    try {
      const searchQuery = `${city} skyline cityscape landmark`;
      console.log(`[PexelsService] Getting city image for: "${searchQuery}"`);
      
      const images = await this.searchImages(searchQuery, 5);
      return images.length > 0 ? images[0] : null;
      
    } catch (error) {
      console.error('[PexelsService] Error getting city image:', error);
      return null;
    }
  }

  /**
   * Get random food image for fallback
   */
  static async getRandomFoodImage(): Promise<PexelsImage | null> {
    try {
      const images = await this.searchImages('delicious food restaurant', 1);
      return images.length > 0 ? images[0] : null;
    } catch (error) {
      console.error('[PexelsService] Error getting random food image:', error);
      return null;
    }
  }

  /**
   * Save image to collection's cover_image field and pexels_images table
   */
  private static async saveCollectionCoverImage(
    collectionId: string, 
    pexelsImage: PexelsImage, 
    context?: { city?: string; cuisine?: string }
  ): Promise<boolean> {
    try {
      // Validate UUID format for collectionId
      const isValidUUID = (uuid: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // First save to pexels_images table
      const savedImage = await PexelsImageStorageService.savePexelsImage(pexelsImage, 'collection', {
        collectionId,
        city: context?.city,
        cuisine: context?.cuisine
      });

      if (!savedImage) {
        console.error('[PexelsService] Failed to save image to pexels_images table');
        return false;
      }

      // Only update the collection table if collectionId is a valid UUID
      if (isValidUUID(collectionId)) {
        const { error: updateError } = await supabase
          .from('collections')
          .update({
            cover_image: pexelsImage.src.large,
            updated_at: new Date().toISOString()
          })
          .eq('id', collectionId);

        if (updateError) {
          console.error('[PexelsService] Error updating collection cover_image:', updateError);
          return false;
        }

        console.log(`[PexelsService] Successfully saved cover image for collection ${collectionId}`);
      } else {
        console.log(`[PexelsService] Skipping collection table update for mock ID: ${collectionId}`);
      }

      return true;

    } catch (error) {
      console.error('[PexelsService] Error saving collection cover image:', error);
      return false;
    }
  }

  /**
   * Get existing collection cover image from database
   */
  private static async getExistingCollectionCoverImage(collectionId: string): Promise<PexelsImage | null> {
    try {
      // Validate UUID format for collectionId
      const isValidUUID = (uuid: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // Skip database query for mock IDs
      if (!isValidUUID(collectionId)) {
        console.log(`[PexelsService] Skipping database query for mock collection ID: ${collectionId}`);
        return null;
      }

      const { data: collection, error } = await supabase
        .from('collections')
        .select('cover_image')
        .eq('id', collectionId)
        .single();

      if (error || !collection?.cover_image) {
        return null;
      }

      // If cover_image exists, create a PexelsImage object from it
      const coverImageUrl = collection.cover_image;
      
      // Try to get additional metadata from pexels_images table if available
      const { data: pexelsDataArray } = await supabase
        .from('pexels_images')
        .select('*')
        .eq('collection_id', collectionId);
      
      // Find the matching image by URL (to avoid URL encoding issues)
      const pexelsData = pexelsDataArray?.find(img => img.image_url === coverImageUrl);

      if (pexelsData) {
        // Return PexelsImage with full metadata
        return {
          id: pexelsData.pexels_id,
          width: pexelsData.width,
          height: pexelsData.height,
          url: pexelsData.image_url,
          photographer: pexelsData.photographer,
          photographer_url: pexelsData.photographer_url,
          src: {
            original: pexelsData.image_url,
            large2x: pexelsData.image_url,
            large: pexelsData.image_url,
            medium: pexelsData.thumbnail_url,
            small: pexelsData.thumbnail_url,
            portrait: pexelsData.thumbnail_url,
            landscape: pexelsData.thumbnail_url,
            tiny: pexelsData.thumbnail_url
          },
          alt: pexelsData.alt_text || ''
        };
      } else {
        // Return basic PexelsImage with just the URL
        return {
          id: 0, // Placeholder ID
          width: 800,
          height: 600,
          url: coverImageUrl,
          photographer: 'Unknown',
          photographer_url: '',
          src: {
            original: coverImageUrl,
            large2x: coverImageUrl,
            large: coverImageUrl,
            medium: coverImageUrl,
            small: coverImageUrl,
            portrait: coverImageUrl,
            landscape: coverImageUrl,
            tiny: coverImageUrl
          },
          alt: ''
        };
      }
    } catch (error) {
      console.error('[PexelsService] Error getting existing collection cover image:', error);
      return null;
    }
  }

  /**
   * Get neighborhood-specific keywords for better image variety
   */
  private static getNeighborhoodKeywords(neighborhood: string): string {
    const neighborhoodLower = neighborhood.toLowerCase();
    
    // Define specific keywords for known neighborhoods
    if (neighborhoodLower.includes('soho')) {
      return 'fashion shopping art galleries cobblestone';
    } else if (neighborhoodLower.includes('east village')) {
      return 'punk rock music bars vintage shops';
    } else if (neighborhoodLower.includes('west village')) {
      return 'brownstones tree-lined streets historic';
    } else if (neighborhoodLower.includes('chelsea')) {
      return 'art galleries high line park modern';
    } else if (neighborhoodLower.includes('harlem')) {
      return 'jazz music cultural heritage soul food';
    } else if (neighborhoodLower.includes('brooklyn')) {
      return 'hipster coffee shops street art';
    } else if (neighborhoodLower.includes('williamsburg')) {
      return 'hipster vintage shops street art';
    } else if (neighborhoodLower.includes('dumbo')) {
      return 'industrial waterfront bridges cobblestone';
    } else if (neighborhoodLower.includes('hollywood')) {
      return 'entertainment stars walk of fame';
    } else if (neighborhoodLower.includes('venice beach')) {
      return 'beach boardwalk street performers';
    } else if (neighborhoodLower.includes('santa monica')) {
      return 'beach pier shopping district';
    }
    
    // Default keywords for other neighborhoods
    return 'neighborhood urban street local';
  }

  /**
   * Get collection-specific keywords for better image variety
   */
  private static getCollectionKeywords(collectionName: string): string {
    const nameLower = collectionName.toLowerCase();
    
    // Define specific keywords for different collection types
    if (nameLower.includes('hidden gems') || nameLower.includes('secret')) {
      return 'hidden secret local authentic';
    } else if (nameLower.includes('coffee') || nameLower.includes('cafe')) {
      return 'coffee cafe latte espresso';
    } else if (nameLower.includes('pizza')) {
      return 'pizza italian cheese dough';
    } else if (nameLower.includes('vegan') || nameLower.includes('plant')) {
      return 'vegan plant-based healthy organic';
    } else if (nameLower.includes('date night') || nameLower.includes('romantic')) {
      return 'romantic date night candlelight';
    } else if (nameLower.includes('business lunch')) {
      return 'business professional corporate lunch';
    } else if (nameLower.includes('street food') || nameLower.includes('food truck')) {
      return 'street food truck casual outdoor';
    } else if (nameLower.includes('celebrity') || nameLower.includes('famous')) {
      return 'celebrity famous luxury upscale';
    } else if (nameLower.includes('adventure') || nameLower.includes('explore')) {
      return 'adventure explore discover journey';
    } else if (nameLower.includes('culture') || nameLower.includes('heritage')) {
      return 'cultural heritage traditional authentic';
    }
    
    // Default keywords for other collections
    return 'dining restaurant culinary gastronomy';
  }
}

export default PexelsService;
