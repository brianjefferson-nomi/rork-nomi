import { useEffect, useCallback } from 'react';
import { realtimeSubscriptionService, RestaurantUpdate, RestaurantPhotoUpdate } from '@/services/realtime-subscriptions';

export interface UseRestaurantRealtimeOptions {
  restaurantId?: string;
  onRestaurantUpdate?: (update: RestaurantUpdate) => void;
  onPhotoInsert?: (photo: RestaurantPhotoUpdate) => void;
  onPhotoUpdate?: (photo: RestaurantPhotoUpdate) => void;
  onPhotoDelete?: (photo: { id: string; restaurant_id: string }) => void;
}

/**
 * Hook for real-time updates on a specific restaurant
 * Automatically filters updates to only the specified restaurant
 */
export function useRestaurantRealtime(options: UseRestaurantRealtimeOptions) {
  const { restaurantId, onRestaurantUpdate, onPhotoInsert, onPhotoUpdate, onPhotoDelete } = options;

  useEffect(() => {
    if (!restaurantId) return;

    console.log(`[useRestaurantRealtime] Setting up real-time subscription for restaurant ${restaurantId}`);
    
    const unsubscribe = realtimeSubscriptionService.subscribeToAllRestaurantUpdates({
      onRestaurantUpdate: (update: RestaurantUpdate) => {
        if (update.id === restaurantId) {
          console.log(`[useRestaurantRealtime] Restaurant update received for ${restaurantId}:`, update);
          onRestaurantUpdate?.(update);
        }
      },
      
      onRestaurantPhotoInsert: (photo: RestaurantPhotoUpdate) => {
        if (photo.restaurant_id === restaurantId) {
          console.log(`[useRestaurantRealtime] Photo insert received for restaurant ${restaurantId}:`, photo);
          onPhotoInsert?.(photo);
        }
      },
      
      onRestaurantPhotoUpdate: (photo: RestaurantPhotoUpdate) => {
        if (photo.restaurant_id === restaurantId) {
          console.log(`[useRestaurantRealtime] Photo update received for restaurant ${restaurantId}:`, photo);
          onPhotoUpdate?.(photo);
        }
      },
      
      onRestaurantPhotoDelete: (photo) => {
        if (photo.restaurant_id === restaurantId) {
          console.log(`[useRestaurantRealtime] Photo delete received for restaurant ${restaurantId}:`, photo);
          onPhotoDelete?.(photo);
        }
      }
    });

    return () => {
      console.log(`[useRestaurantRealtime] Cleaning up real-time subscription for restaurant ${restaurantId}`);
      unsubscribe();
    };
  }, [restaurantId, onRestaurantUpdate, onPhotoInsert, onPhotoUpdate, onPhotoDelete]);

  // Helper function to get connection status
  const getConnectionStatus = useCallback(() => {
    return realtimeSubscriptionService.getConnectionStatus();
  }, []);

  return {
    isConnected: getConnectionStatus()
  };
}

export default useRestaurantRealtime;
