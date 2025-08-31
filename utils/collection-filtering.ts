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
  
  console.log(`[filterCollectionsByCity] Starting filtering for ${currentCity}:`, {
    totalCollections: collections.length,
    totalRestaurants: restaurants.length,
    cityConfig: cityConfig.name
  });
  
  return collections.filter(collection => {
    if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
      console.log(`[filterCollectionsByCity] Skipping "${collection.name}" - no restaurant_ids`);
      return false; // Skip collections with no restaurants
    }
    
    // Get the restaurants in this collection
    const collectionRestaurants = restaurants.filter(r => 
      collection.restaurant_ids?.includes(r.id)
    );
    
    if (collectionRestaurants.length === 0) {
      console.log(`[filterCollectionsByCity] Skipping "${collection.name}" - no restaurants found in database`);
      return false; // Skip if no restaurants found
    }
    
    console.log(`[filterCollectionsByCity] Checking "${collection.name}":`, {
      restaurant_ids_count: collection.restaurant_ids.length,
      found_restaurants: collectionRestaurants.length,
      restaurants_sample: collectionRestaurants.slice(0, 3).map(r => ({
        name: r.name,
        city: r.city,
        state: r.state,
        restaurant_code: r.restaurant_code,
        neighborhood: r.neighborhood
      }))
    });
    
    // Count restaurants by city
    let cityRestaurantCount = 0;
    let otherCityRestaurantCount = 0;
    
    collectionRestaurants.forEach(restaurant => {
      if (!restaurant) return;
      
      let isCurrentCity = false;
      
      // Primary filter: Use city and state for most accurate filtering
      if (restaurant.city && restaurant.state) {
        if (currentCity === 'nyc' && restaurant.city === 'New York' && restaurant.state === 'NY') {
          isCurrentCity = true;
        }
        if (currentCity === 'la' && restaurant.city === 'Los Angeles' && restaurant.state === 'CA') {
          isCurrentCity = true;
        }
      }
      
      // Secondary filter: Use restaurant_code for city identification
      if (!isCurrentCity && restaurant.restaurant_code) {
        if (currentCity === 'nyc' && restaurant.restaurant_code.startsWith('nyc-')) {
          isCurrentCity = true;
        }
        if (currentCity === 'la' && restaurant.restaurant_code.startsWith('la-')) {
          isCurrentCity = true;
        }
      }
      
      // Fallback filter: Use neighborhood and address patterns
      if (!isCurrentCity) {
        const neighborhood = (restaurant.neighborhood || '').toLowerCase();
        const address = (restaurant.address || '').toLowerCase();
        isCurrentCity = cityConfig.filterPattern.test(neighborhood) || cityConfig.filterPattern.test(address);
      }
      
      if (isCurrentCity) {
        cityRestaurantCount++;
        console.log(`[filterCollectionsByCity] "${collection.name}" - ${currentCity} match: ${restaurant.name}`);
      } else {
        otherCityRestaurantCount++;
        console.log(`[filterCollectionsByCity] "${collection.name}" - other city: ${restaurant.name} (${restaurant.city}, ${restaurant.state})`);
      }
    });
    
    // Only include collections where the majority of restaurants are from the current city
    const totalRestaurants = cityRestaurantCount + otherCityRestaurantCount;
    const majorityThreshold = Math.ceil(totalRestaurants * 0.6); // 60% threshold
    const hasMajority = cityRestaurantCount >= majorityThreshold;
    
    console.log(`[filterCollectionsByCity] "${collection.name}" city breakdown:`, {
      currentCity: cityRestaurantCount,
      otherCity: otherCityRestaurantCount,
      total: totalRestaurants,
      majorityThreshold,
      hasMajority
    });
    
    if (hasMajority) {
      console.log(`[filterCollectionsByCity] ✅ Including "${collection.name}" - majority ${currentCity} restaurants (${cityRestaurantCount}/${totalRestaurants})`);
    } else {
      console.log(`[filterCollectionsByCity] ❌ Excluding "${collection.name}" - not majority ${currentCity} restaurants (${cityRestaurantCount}/${totalRestaurants})`);
    }
    
    return hasMajority;
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
