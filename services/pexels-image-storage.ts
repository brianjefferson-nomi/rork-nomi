import { supabase } from './supabase';
import { PexelsImage } from './pexels';

export interface SavedPexelsImage {
  id: string;
  pexels_id: number;
  collection_id?: string;
  neighborhood?: string;
  city?: string;
  cuisine?: string;
  image_type: 'collection' | 'neighborhood' | 'cuisine' | 'city' | 'custom';
  image_url: string;
  thumbnail_url: string;
  photographer: string;
  photographer_url: string;
  width: number;
  height: number;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for storing and retrieving Pexels images in the database
 */
export class PexelsImageStorageService {
  /**
   * Save a Pexels image to the database
   */
  static async savePexelsImage(
    pexelsImage: PexelsImage,
    imageType: 'collection' | 'neighborhood' | 'cuisine' | 'city' | 'custom',
    context?: {
      collectionId?: string;
      neighborhood?: string;
      city?: string;
      cuisine?: string;
    }
  ): Promise<SavedPexelsImage | null> {
    try {
      console.log(`[PexelsImageStorage] Saving ${imageType} image to database:`, {
        pexelsId: pexelsImage.id,
        context
      });

      // Validate UUID format for collectionId
      const isValidUUID = (uuid: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // Handle mock collection IDs by setting collection_id to null
      const collectionId = context?.collectionId && isValidUUID(context.collectionId) 
        ? context.collectionId 
        : null;

      // Check if image already exists
      const { data: existingImage, error: checkError } = await supabase
        .from('pexels_images')
        .select('*')
        .eq('pexels_id', pexelsImage.id)
        .eq('image_type', imageType)
        .single();

      // If table doesn't exist, log warning and return null
      if (checkError?.code === 'PGRST205') {
        console.warn('[PexelsImageStorage] Table pexels_images does not exist. Skipping database storage.');
        console.warn('[PexelsImageStorage] Run the migration: database/migrations/create_pexels_images_table.sql');
        return null;
      }

      if (existingImage && !checkError) {
        console.log(`[PexelsImageStorage] Image already exists, updating context`);
        
        // Update existing image with new context
        const { data: updatedImage, error: updateError } = await supabase
          .from('pexels_images')
          .update({
            collection_id: collectionId || existingImage.collection_id,
            neighborhood: context?.neighborhood || existingImage.neighborhood,
            city: context?.city || existingImage.city,
            cuisine: context?.cuisine || existingImage.cuisine,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingImage.id)
          .select()
          .single();

        if (updateError) {
          console.error('[PexelsImageStorage] Error updating image:', updateError);
          return null;
        }

        return updatedImage;
      }

      // Create new image record
      const { data: newImage, error: insertError } = await supabase
        .from('pexels_images')
        .insert({
          pexels_id: pexelsImage.id,
          collection_id: collectionId,
          neighborhood: context?.neighborhood,
          city: context?.city,
          cuisine: context?.cuisine,
          image_type: imageType,
          image_url: pexelsImage.src.large,
          thumbnail_url: pexelsImage.src.medium,
          photographer: pexelsImage.photographer,
          photographer_url: pexelsImage.photographer_url,
          width: pexelsImage.width,
          height: pexelsImage.height,
          alt_text: pexelsImage.alt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[PexelsImageStorage] Error inserting image:', insertError);
        return null;
      }

      console.log(`[PexelsImageStorage] Successfully saved image:`, newImage.id);
      return newImage;

    } catch (error) {
      console.error('[PexelsImageStorage] Error saving image:', error);
      return null;
    }
  }

  /**
   * Get saved Pexels image for a specific context
   */
  static async getSavedPexelsImage(
    imageType: 'collection' | 'neighborhood' | 'cuisine' | 'city' | 'custom',
    context?: {
      collectionId?: string;
      neighborhood?: string;
      city?: string;
      cuisine?: string;
    }
  ): Promise<SavedPexelsImage | null> {
    try {
      let query = supabase
        .from('pexels_images')
        .select('*')
        .eq('image_type', imageType);

      // Add context filters
      if (context?.collectionId) {
        query = query.eq('collection_id', context.collectionId);
      }
      if (context?.neighborhood) {
        query = query.eq('neighborhood', context.neighborhood);
      }
      if (context?.city) {
        query = query.eq('city', context.city);
      }
      if (context?.cuisine) {
        query = query.eq('cuisine', context.cuisine);
      }

      const { data: images, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // If table doesn't exist, log warning and return null
        if (error.code === 'PGRST205') {
          console.warn('[PexelsImageStorage] Table pexels_images does not exist. Cannot retrieve saved images.');
          return null;
        }
        console.error('[PexelsImageStorage] Error getting saved image:', error);
        return null;
      }

      return images;
    } catch (error) {
      console.error('[PexelsImageStorage] Error getting saved image:', error);
      return null;
    }
  }

  /**
   * Update collection cover image
   */
  static async updateCollectionCoverImage(
    collectionId: string,
    pexelsImage: PexelsImage
  ): Promise<boolean> {
    try {
      // Validate UUID format for collectionId
      const isValidUUID = (uuid: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // Save the Pexels image
      const savedImage = await this.savePexelsImage(pexelsImage, 'collection', {
        collectionId
      });

      if (!savedImage) {
        return false;
      }

      // Only update the collection table if collectionId is a valid UUID
      if (isValidUUID(collectionId)) {
        const { error: updateError } = await supabase
          .from('collections')
          .update({
            cover_image: savedImage.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', collectionId);

        if (updateError) {
          console.error('[PexelsImageStorage] Error updating collection cover:', updateError);
          return false;
        }

        console.log(`[PexelsImageStorage] Successfully updated collection ${collectionId} cover image`);
      } else {
        console.log(`[PexelsImageStorage] Skipping collection table update for mock ID: ${collectionId}`);
      }

      return true;

    } catch (error) {
      console.error('[PexelsImageStorage] Error updating collection cover:', error);
      return false;
    }
  }

  /**
   * Get or create image for a collection
   */
  static async getOrCreateCollectionImage(
    collectionName: string,
    cuisines: string[],
    city?: string
  ): Promise<SavedPexelsImage | null> {
    try {
      // First try to get an existing saved image
      const existingImage = await this.getSavedPexelsImage('collection', {
        city
      });

      if (existingImage) {
        console.log('[PexelsImageStorage] Found existing collection image');
        return existingImage;
      }

      // If no existing image, we'll need to fetch from Pexels
      // This will be handled by the calling function
      console.log('[PexelsImageStorage] No existing image found, will fetch from Pexels');
      return null;

    } catch (error) {
      console.error('[PexelsImageStorage] Error getting/creating collection image:', error);
      return null;
    }
  }
}

export default PexelsImageStorageService;
