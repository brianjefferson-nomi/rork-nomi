import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  restaurantId: string;
  uploadedBy: string;
  createdAt: string;
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: UploadedPhoto;
  error?: string;
}

/**
 * Service for handling restaurant photo uploads
 */
export class PhotoUploadService {
  /**
   * Request camera and media library permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      // Request media library permissions
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      const hasCameraPermission = cameraPermission.status === 'granted';
      const hasMediaLibraryPermission = mediaLibraryPermission.status === 'granted';

      if (!hasCameraPermission && !hasMediaLibraryPermission) {
        console.warn('No photo permissions granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Show image picker with options
   */
  static async showImagePicker(): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Photo permissions not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Restaurant photos work well in 16:9
        quality: 0.8, // Good balance between quality and file size
        base64: false,
        exif: false,
      });

      if (result.canceled) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error showing image picker:', error);
      throw error;
    }
  }

  /**
   * Take a photo with camera
   */
  static async takePhoto(): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Camera permissions not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (result.canceled) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Upload photo to Supabase Storage
   */
  static async uploadPhoto(
    imageUri: string,
    restaurantId: string,
    userId: string
  ): Promise<PhotoUploadResult> {
    try {
      console.log(`Uploading photo for restaurant ${restaurantId}`);

      // Create a unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `restaurant_${restaurantId}_${timestamp}_${randomId}.jpg`;
      const filePath = `${restaurantId}/${filename}`;

      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('restaurant-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('restaurant-photos')
        .getPublicUrl(filePath);

      // Save photo metadata to database
      const { data: photoData, error: dbError } = await supabase
        .from('restaurant_photos')
        .insert({
          restaurant_id: restaurantId,
          image_url: urlData.publicUrl,
          thumbnail_url: urlData.publicUrl, // Same URL for now, could optimize later
          uploaded_by: userId,
          file_path: `restaurant-photos/${filePath}`, // Store full path for consistency
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('restaurant-photos').remove([filePath]);
        return {
          success: false,
          error: `Database error: ${dbError.message}`,
        };
      }

      console.log('✅ Photo uploaded successfully');
      return {
        success: true,
        photo: {
          id: photoData.id,
          url: photoData.image_url,
          thumbnailUrl: photoData.thumbnail_url,
          restaurantId: photoData.restaurant_id,
          uploadedBy: photoData.uploaded_by,
          createdAt: photoData.created_at,
        },
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get photos for a restaurant (ordered by oldest first)
   */
  static async getRestaurantPhotos(restaurantId: string): Promise<UploadedPhoto[]> {
    try {
      console.log(`[PhotoUploadService] Fetching photos for restaurant: ${restaurantId}`);
      const { data, error } = await supabase
        .from('restaurant_photos')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true }); // Changed to ascending for oldest first

      if (error) {
        console.error('[PhotoUploadService] Error fetching restaurant photos:', error);
        return [];
      }

      console.log(`[PhotoUploadService] Raw database data:`, data);
      const mappedPhotos = (data || []).map(photo => ({
        id: photo.id,
        url: photo.image_url,
        thumbnailUrl: photo.thumbnail_url,
        restaurantId: photo.restaurant_id,
        uploadedBy: photo.uploaded_by,
        createdAt: photo.created_at,
      }));
      
      console.log(`[PhotoUploadService] Mapped photos (oldest first):`, mappedPhotos);
      return mappedPhotos;
    } catch (error) {
      console.error('[PhotoUploadService] Error fetching restaurant photos:', error);
      return [];
    }
  }

  /**
   * Delete a photo
   */
  static async deletePhoto(photoId: string): Promise<boolean> {
    try {
      // Get photo info first
      const { data: photo, error: fetchError } = await supabase
        .from('restaurant_photos')
        .select('file_path')
        .eq('id', photoId)
        .single();

      if (fetchError || !photo) {
        console.error('Error fetching photo for deletion:', fetchError);
        return false;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('restaurant_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        console.error('Error deleting photo from database:', dbError);
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('restaurant-photos')
        .remove([photo.file_path]);

      if (storageError) {
        console.error('Error deleting photo from storage:', storageError);
        // Don't return false here since DB deletion succeeded
      }

      console.log('✅ Photo deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  /**
   * Update restaurant's main image from uploaded photos
   */
  static async updateRestaurantMainImage(restaurantId: string, photoUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          image_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Error updating restaurant main image:', error);
        return false;
      }

      console.log('✅ Restaurant main image updated');
      return true;
    } catch (error) {
      console.error('Error updating restaurant main image:', error);
      return false;
    }
  }
}

export default PhotoUploadService;
