import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RestaurantUpdate {
  id: string;
  name?: string;
  hours?: string;
  price_range?: string;
  website?: string;
  google_photos?: string;
  tripadvisor_photos?: string;
  updated_at: string;
}

export interface RestaurantPhotoUpdate {
  id: string;
  restaurant_id: string;
  image_url: string;
  thumbnail_url: string;
  file_path: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RealtimeCallbacks {
  onRestaurantUpdate?: (update: RestaurantUpdate) => void;
  onRestaurantPhotoInsert?: (photo: RestaurantPhotoUpdate) => void;
  onRestaurantPhotoUpdate?: (photo: RestaurantPhotoUpdate) => void;
  onRestaurantPhotoDelete?: (photo: { id: string; restaurant_id: string }) => void;
}

class RealtimeSubscriptionService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected = false;

  /**
   * Subscribe to restaurant table updates
   */
  subscribeToRestaurantUpdates(callbacks: RealtimeCallbacks): () => void {
    console.log('[RealtimeService] Setting up restaurant updates subscription...');
    
    const channel = supabase
      .channel('restaurant-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurants',
          filter: '*'
        },
        (payload) => {
          console.log('[RealtimeService] Restaurant update received:', payload);
          
          const update: RestaurantUpdate = {
            id: payload.new.id,
            name: payload.new.name,
            hours: payload.new.hours,
            price_range: payload.new.price_range,
            website: payload.new.website,
            google_photos: payload.new.google_photos,
            tripadvisor_photos: payload.new.tripadvisor_photos,
            updated_at: payload.new.updated_at
          };
          
          callbacks.onRestaurantUpdate?.(update);
        }
      )
      .subscribe((status) => {
        console.log('[RealtimeService] Restaurant subscription status:', status);
        this.isConnected = status === 'SUBSCRIBED';
      });

    this.channels.set('restaurant-updates', channel);

    // Return unsubscribe function
    return () => {
      console.log('[RealtimeService] Unsubscribing from restaurant updates...');
      supabase.removeChannel(channel);
      this.channels.delete('restaurant-updates');
    };
  }

  /**
   * Subscribe to restaurant photos table updates
   */
  subscribeToRestaurantPhotos(callbacks: RealtimeCallbacks): () => void {
    console.log('[RealtimeService] Setting up restaurant photos subscription...');
    
    const channel = supabase
      .channel('restaurant-photos')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restaurant_photos'
        },
        (payload) => {
          console.log('[RealtimeService] Restaurant photo insert received:', payload);
          
          const photo: RestaurantPhotoUpdate = {
            id: payload.new.id,
            restaurant_id: payload.new.restaurant_id,
            image_url: payload.new.image_url,
            thumbnail_url: payload.new.thumbnail_url,
            file_path: payload.new.file_path,
            uploaded_by: payload.new.uploaded_by,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at
          };
          
          callbacks.onRestaurantPhotoInsert?.(photo);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurant_photos'
        },
        (payload) => {
          console.log('[RealtimeService] Restaurant photo update received:', payload);
          
          const photo: RestaurantPhotoUpdate = {
            id: payload.new.id,
            restaurant_id: payload.new.restaurant_id,
            image_url: payload.new.image_url,
            thumbnail_url: payload.new.thumbnail_url,
            file_path: payload.new.file_path,
            uploaded_by: payload.new.uploaded_by,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at
          };
          
          callbacks.onRestaurantPhotoUpdate?.(photo);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'restaurant_photos'
        },
        (payload) => {
          console.log('[RealtimeService] Restaurant photo delete received:', payload);
          
          callbacks.onRestaurantPhotoDelete?.({
            id: payload.old.id,
            restaurant_id: payload.old.restaurant_id
          });
        }
      )
      .subscribe((status) => {
        console.log('[RealtimeService] Restaurant photos subscription status:', status);
      });

    this.channels.set('restaurant-photos', channel);

    // Return unsubscribe function
    return () => {
      console.log('[RealtimeService] Unsubscribing from restaurant photos...');
      supabase.removeChannel(channel);
      this.channels.delete('restaurant-photos');
    };
  }

  /**
   * Subscribe to all restaurant-related real-time updates
   */
  subscribeToAllRestaurantUpdates(callbacks: RealtimeCallbacks): () => void {
    console.log('[RealtimeService] Setting up all restaurant real-time subscriptions...');
    
    const unsubscribeRestaurants = this.subscribeToRestaurantUpdates(callbacks);
    const unsubscribePhotos = this.subscribeToRestaurantPhotos(callbacks);

    // Return combined unsubscribe function
    return () => {
      console.log('[RealtimeService] Unsubscribing from all restaurant updates...');
      unsubscribeRestaurants();
      unsubscribePhotos();
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Disconnect all subscriptions
   */
  disconnectAll(): void {
    console.log('[RealtimeService] Disconnecting all subscriptions...');
    
    this.channels.forEach((channel, key) => {
      console.log(`[RealtimeService] Removing channel: ${key}`);
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    this.isConnected = false;
  }
}

// Export singleton instance
export const realtimeSubscriptionService = new RealtimeSubscriptionService();
