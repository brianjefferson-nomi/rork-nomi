import { supabase } from '../services/supabase';

/**
 * Handle custom images for restaurants using the existing Pexels infrastructure
 */
export class CustomImageHandler {
  /**
   * Save custom images to the pexels_images table with 'custom' type
   */
  static async saveCustomRestaurantImages(
    restaurantId: string,
    images: Array<{
      url: string;
      thumbnailUrl?: string;
      photographer?: string;
      photographerUrl?: string;
      width?: number;
      height?: number;
      altText?: string;
    }>
  ): Promise<boolean> {
    try {
      console.log(`Saving ${images.length} custom images for restaurant ${restaurantId}`);

      // Get restaurant info for context
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('name, cuisine, neighborhood, city')
        .eq('id', restaurantId)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Error fetching restaurant:', restaurantError);
        return false;
      }

      // Save each image to pexels_images table
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        const { error: insertError } = await supabase
          .from('pexels_images')
          .insert({
            pexels_id: Date.now() + i, // Use timestamp as unique ID for custom images
            image_type: 'custom',
            image_url: image.url,
            thumbnail_url: image.thumbnailUrl || image.url,
            photographer: image.photographer || 'Custom Upload',
            photographer_url: image.photographerUrl || '',
            width: image.width || 800,
            height: image.height || 600,
            alt_text: image.altText || `${restaurant.name} - Custom Image ${i + 1}`,
            // Add restaurant context
            neighborhood: restaurant.neighborhood,
            city: restaurant.city,
            cuisine: restaurant.cuisine,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Error saving custom image ${i + 1}:`, insertError);
          // Continue with other images even if one fails
        }
      }

      // Update restaurant's main image and images array
      const imageUrls = images.map(img => img.url);
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          image_url: imageUrls[0] || (restaurant as any).image_url,
          images: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (updateError) {
        console.error('Error updating restaurant images:', updateError);
        return false;
      }

      console.log(`✅ Successfully saved ${images.length} custom images for ${restaurant.name}`);
      return true;
    } catch (error) {
      console.error('Error saving custom images:', error);
      return false;
    }
  }

  /**
   * Get custom images for a restaurant
   */
  static async getCustomRestaurantImages(restaurantId: string): Promise<any[]> {
    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('name, cuisine, neighborhood, city')
        .eq('id', restaurantId)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Error fetching restaurant:', restaurantError);
        return [];
      }

      const { data: images, error } = await supabase
        .from('pexels_images')
        .select('*')
        .eq('image_type', 'custom')
        .or(`neighborhood.eq.${restaurant.neighborhood},cuisine.eq.${restaurant.cuisine},city.eq.${restaurant.city}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom images:', error);
        return [];
      }

      return images || [];
    } catch (error) {
      console.error('Error fetching custom images:', error);
      return [];
    }
  }

  /**
   * Update restaurant with direct image URLs (simpler approach)
   */
  static async updateRestaurantWithDirectImages(
    restaurantIdentifier: string,
    mainImageUrl: string,
    additionalImageUrls: string[] = []
  ): Promise<boolean> {
    try {
      // Find restaurant by name or code
      const { data: restaurant, error: findError } = await supabase
        .from('restaurants')
        .select('*')
        .or(`name.ilike.%${restaurantIdentifier}%,restaurant_code.eq.${restaurantIdentifier}`)
        .limit(1)
        .single();

      if (findError || !restaurant) {
        console.error('Restaurant not found:', findError);
        return false;
      }

      // Update restaurant images
      const allImages = [mainImageUrl, ...additionalImageUrls];
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          image_url: mainImageUrl,
          images: allImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id);

      if (updateError) {
        console.error('Error updating restaurant images:', updateError);
        return false;
      }

      console.log(`✅ Successfully updated images for ${restaurant.name}`);
      console.log(`Main image: ${mainImageUrl}`);
      console.log(`Total images: ${allImages.length}`);
      
      return true;
    } catch (error) {
      console.error('Error updating restaurant images:', error);
      return false;
    }
  }
}

export default CustomImageHandler;
