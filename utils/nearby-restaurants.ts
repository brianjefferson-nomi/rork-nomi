import { Restaurant } from '@/types/restaurant';

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Find restaurants within a specified radius of given coordinates
 */
export async function findNearbyRestaurants(
  latitude: number, 
  longitude: number, 
  radius: number = 1500
): Promise<Restaurant[]> {
  try {
    // This function should be called with restaurants from the store
    // For now, we'll return a mock location for testing
    console.log(`[findNearbyRestaurants] Searching for restaurants within ${radius}m of (${latitude}, ${longitude})`);
    
    // Return mock data for now - in a real app, this would filter actual restaurant data
    // The actual filtering should happen in the component using this function
    return [];
  } catch (error) {
    console.error('[findNearbyRestaurants] Error:', error);
    return [];
  }
}

/**
 * Get user's current location
 */
export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    // For now, return a default location (NYC) for testing
    // In a real app, this would use Geolocation API
    console.log('[getUserLocation] Returning default NYC location for testing');
    
    // Default to NYC coordinates for testing
    return {
      lat: 40.7128,
      lng: -74.0060
    };
    
    // TODO: Implement actual geolocation
    // if (navigator.geolocation) {
    //   return new Promise((resolve, reject) => {
    //     navigator.geolocation.getCurrentPosition(
    //       (position) => {
    //         resolve({
    //           lat: position.coords.latitude,
    //           lng: position.coords.longitude
    //         });
    //       },
    //       (error) => {
    //         console.error('Geolocation error:', error);
    //         reject(error);
    //       }
    //     );
    //   });
    // }
  } catch (error) {
    console.error('[getUserLocation] Error:', error);
    return null;
  }
}
