import { supabase } from '../services/supabase';

/**
 * Utility functions for updating restaurant images
 */
export class RestaurantImageUpdater {
  /**
   * Update a restaurant's main image
   */
  static async updateMainImage(restaurantId: string, imageUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Error updating main image:', error);
        return false;
      }

      console.log(`Successfully updated main image for restaurant ${restaurantId}`);
      return true;
    } catch (error) {
      console.error('Error updating main image:', error);
      return false;
    }
  }

  /**
   * Update a restaurant's image array
   */
  static async updateImageArray(restaurantId: string, images: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          images: images,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Error updating image array:', error);
        return false;
      }

      console.log(`Successfully updated image array for restaurant ${restaurantId}`);
      return true;
    } catch (error) {
      console.error('Error updating image array:', error);
      return false;
    }
  }

  /**
   * Add images to existing image array
   */
  static async addImages(restaurantId: string, newImages: string[]): Promise<boolean> {
    try {
      // First get current images
      const { data: restaurant, error: fetchError } = await supabase
        .from('restaurants')
        .select('images')
        .eq('id', restaurantId)
        .single();

      if (fetchError) {
        console.error('Error fetching current images:', fetchError);
        return false;
      }

      const currentImages = restaurant.images || [];
      const updatedImages = [...currentImages, ...newImages];

      return await this.updateImageArray(restaurantId, updatedImages);
    } catch (error) {
      console.error('Error adding images:', error);
      return false;
    }
  }

  /**
   * Replace all images for a restaurant
   */
  static async replaceAllImages(
    restaurantId: string, 
    mainImage: string, 
    additionalImages: string[] = []
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          image_url: mainImage,
          images: additionalImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Error replacing all images:', error);
        return false;
      }

      console.log(`Successfully replaced all images for restaurant ${restaurantId}`);
      return true;
    } catch (error) {
      console.error('Error replacing all images:', error);
      return false;
    }
  }

  /**
   * Get restaurant by name or code for easier identification
   */
  static async getRestaurantByIdentifier(identifier: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .or(`name.ilike.%${identifier}%,restaurant_code.eq.${identifier}`)
        .limit(1)
        .single();

      if (error) {
        console.error('Error finding restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error finding restaurant:', error);
      return null;
    }
  }
}

export default RestaurantImageUpdater;
