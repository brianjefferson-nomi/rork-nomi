import { Collection } from '@/types/restaurant';

export type CityKey = 'nyc' | 'la';

export function filterCollectionsByCity(collections: any[], restaurants: any[], city: CityKey): any[] {
  if (!collections || collections.length === 0) return [];
  
  return collections.filter(collection => {
    // Check if collection has restaurants from the specified city
    if (collection.restaurant_ids && collection.restaurant_ids.length > 0) {
      // For now, we'll use a simple heuristic based on collection name
      // In a real implementation, you'd check the actual restaurant data
      const name = collection.name.toLowerCase();
      
      if (city === 'nyc') {
        return name.includes('nyc') || name.includes('new york') || name.includes('manhattan') || 
               name.includes('brooklyn') || name.includes('queens') || name.includes('bronx') ||
               name.includes('staten island');
      } else if (city === 'la') {
        return name.includes('la') || name.includes('los angeles') || name.includes('hollywood') ||
               name.includes('beverly hills') || name.includes('santa monica') || name.includes('venice') ||
               name.includes('koreatown') || name.includes('downtown la') || name.includes('silver lake') ||
               name.includes('west hollywood');
      }
    }
    
    return false;
  });
}

export function getCityDisplayName(city: CityKey): string {
  switch (city) {
    case 'nyc':
      return 'New York City';
    case 'la':
      return 'Los Angeles';
    default:
      return 'Unknown City';
  }
}

export function getCollectionStats(collections: any[], restaurants: any[], city: CityKey) {
  if (!collections || collections.length === 0) {
    return {
      total: 0,
      public: 0,
      shared: 0,
      private: 0,
      totalLikes: 0,
      totalViews: 0,
      totalCollections: 0,
      cityFilteredCollections: [],
      totalRestaurants: 0,
      averageRestaurantsPerCollection: 0
    };
  }

  const cityFilteredCollections = filterCollectionsByCity(collections, restaurants, city);
  const totalRestaurants = restaurants?.length || 0;
  const averageRestaurantsPerCollection = collections.length > 0 ? totalRestaurants / collections.length : 0;

  const stats = collections.reduce((stats, collection) => {
    stats.total++;
    
    // Use is_public to determine if it's public or private
    if (collection.is_public) {
      // For now, we'll consider all public collections as "public"
      // In a real implementation, you might have additional logic to distinguish shared vs public
      stats.public++;
    } else {
      stats.private++;
    }
    
    stats.totalLikes += collection.likes || 0;
    stats.totalViews += collection.views || 0;
    
    return stats;
  }, {
    total: 0,
    public: 0,
    shared: 0,
    private: 0,
    totalLikes: 0,
    totalViews: 0,
    totalCollections: collections.length,
    cityFilteredCollections,
    totalRestaurants,
    averageRestaurantsPerCollection
  });

  return stats;
}
