import { Collection } from '@/types/restaurant';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';

export interface Restaurant {
  id: string;
  name: string;
  city?: string;
  state?: string;
  restaurant_code?: string;
  neighborhood?: string;
  address?: string;
}

export interface CollectionWithRestaurants {
  id: string;
  name: string;
  restaurant_ids?: string[];
  [key: string]: any;
}

export type CityKey = 'nyc' | 'la';

/**
 * Filters collections based on the cities of restaurants inside them
 * @param collections - Array of collections to filter
 * @param restaurants - Array of all restaurants
 * @param currentCity - Current city ('nyc' or 'la')
 * @returns Filtered collections that contain restaurants from the current city
 */
export function filterCollectionsByCity(
  collections: CollectionWithRestaurants[],
  restaurants: Restaurant[],
  currentCity: CityKey
): CollectionWithRestaurants[] {
  const cityConfig = currentCity === 'nyc' ? NYC_CONFIG : LA_CONFIG;
  
  return collections.filter(collection => {
    if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
      return false; // Skip collections with no restaurants
    }
    
    // Get the restaurants in this collection
    const collectionRestaurants = restaurants.filter(r => 
      collection.restaurant_ids?.includes(r.id)
    );
    
    if (collectionRestaurants.length === 0) {
      return false; // Skip if no restaurants found
    }
    
    // Check if any restaurant in the collection matches the current city
    const hasCityRestaurants = collectionRestaurants.some(restaurant => {
      if (!restaurant) return false;
      
      // Primary filter: Use city and state for most accurate filtering
      if (restaurant.city && restaurant.state) {
        if (currentCity === 'nyc' && restaurant.city === 'New York' && restaurant.state === 'NY') {
          return true;
        }
        if (currentCity === 'la' && restaurant.city === 'Los Angeles' && restaurant.state === 'CA') {
          return true;
        }
      }
      
      // Secondary filter: Use restaurant_code for city identification
      if (restaurant.restaurant_code) {
        if (currentCity === 'nyc' && restaurant.restaurant_code.startsWith('nyc-')) {
          return true;
        }
        if (currentCity === 'la' && restaurant.restaurant_code.startsWith('la-')) {
          return true;
        }
      }
      
      // Fallback filter: Use neighborhood and address patterns
      const neighborhood = (restaurant.neighborhood || '').toLowerCase();
      const address = (restaurant.address || '').toLowerCase();
      return cityConfig.filterPattern.test(neighborhood) || cityConfig.filterPattern.test(address);
    });
    
    return hasCityRestaurants;
  });
}

/**
 * Gets the city name for display purposes
 * @param cityKey - City key ('nyc' or 'la')
 * @returns Display name for the city
 */
export function getCityDisplayName(cityKey: CityKey): string {
  return cityKey === 'nyc' ? 'New York' : 'Los Angeles';
}

/**
 * Gets statistics about collections for a specific city
 * @param collections - Array of collections
 * @param restaurants - Array of all restaurants
 * @param currentCity - Current city ('nyc' or 'la')
 * @returns Statistics about the collections
 */
export function getCollectionStats(
  collections: CollectionWithRestaurants[],
  restaurants: Restaurant[],
  currentCity: CityKey
) {
  const cityFilteredCollections = filterCollectionsByCity(collections, restaurants, currentCity);
  
  const totalRestaurants = cityFilteredCollections.reduce((total, collection) => {
    const collectionRestaurants = restaurants.filter(r => 
      collection.restaurant_ids?.includes(r.id)
    );
    return total + collectionRestaurants.length;
  }, 0);
  
  return {
    totalCollections: collections.length,
    cityFilteredCollections: cityFilteredCollections.length,
    totalRestaurants,
    averageRestaurantsPerCollection: cityFilteredCollections.length > 0 
      ? Math.round(totalRestaurants / cityFilteredCollections.length) 
      : 0
  };
}
