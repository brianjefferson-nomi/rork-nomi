import { useState, useEffect, useRef } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useRestaurants } from '@/hooks/restaurant-store';

// Global state to track which restaurants are used in each section
const usedRestaurantIds = {
  trending: new Set<string>(),
  newAndNotable: new Set<string>()
};


/**
 * Hook for trending restaurants
 */
export function useTrendingRestaurants(city?: 'nyc' | 'la', limit: number = 8) {
  const { restaurants, isLoading: storeLoading } = useRestaurants();
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (storeLoading) {
      setIsLoading(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // Filter restaurants by city and get trending ones (by rating and recent activity)
      let filtered = restaurants.filter(restaurant => {
        if (!restaurant) return false;
        
        // Filter by city if specified
        if (city) {
          const restaurantCity = restaurant.city?.toLowerCase();
          const restaurantState = restaurant.state?.toLowerCase();
          
          if (city === 'nyc') {
            return restaurantCity === 'new york' || restaurantState === 'ny';
          } else if (city === 'la') {
            return restaurantCity === 'los angeles' || restaurantState === 'ca';
          }
        }
        
        return true;
      });

      // Sort by rating (highest first) and then by recent activity
      filtered.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        
        if (ratingA !== ratingB) {
          return ratingB - ratingA; // Higher rating first
        }
        
        // If ratings are equal, sort by recent activity (views, engagement, etc.)
        // For now, use a combination of rating and recency
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        
        // Prioritize restaurants with both high rating and recent activity
        const scoreA = ratingA * 0.7 + (dateA / (1000 * 60 * 60 * 24)) * 0.3; // 70% rating, 30% recency
        const scoreB = ratingB * 0.7 + (dateB / (1000 * 60 * 60 * 24)) * 0.3;
        
        return scoreB - scoreA;
      });

      // Take the top restaurants up to the limit, avoiding duplicates from new & notable
      const trending = [];
      const seenIds = new Set<string>();
      
      for (const restaurant of filtered) {
        if (trending.length >= limit) break;
        
        // Skip if already used in new & notable section
        if (usedRestaurantIds.newAndNotable.has(restaurant.id)) {
          continue;
        }
        
        // Skip if we've already seen this restaurant in this section
        if (seenIds.has(restaurant.id)) {
          continue;
        }
        
        trending.push(restaurant);
        seenIds.add(restaurant.id);
        usedRestaurantIds.trending.add(restaurant.id);
      }
      
      console.log(`[useTrendingRestaurants] Found ${trending.length} trending restaurants for ${city || 'all cities'}`);
      
      setTrendingRestaurants(trending);
      setError(null);
    } catch (err) {
      console.error('[useTrendingRestaurants] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch trending restaurants'));
    } finally {
      setIsLoading(false);
    }
  }, [restaurants, storeLoading, city, limit]);

  return {
    restaurants: trendingRestaurants,
    isLoading: isLoading || storeLoading,
    error,
    refetch: () => {
      setError(null);
      setIsLoading(true);
    }
  };
}

/**
 * Hook for new and notable restaurants
 */
export function useNewAndNotableRestaurants(city?: 'nyc' | 'la', limit: number = 6) {
  const { restaurants, isLoading: storeLoading } = useRestaurants();
  const [notableRestaurants, setNotableRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (storeLoading) {
      setIsLoading(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // Filter restaurants by city and get new & notable ones (recently added)
      let filtered = restaurants.filter(restaurant => {
        if (!restaurant) return false;
        
        // Filter by city if specified
        if (city) {
          const restaurantCity = restaurant.city?.toLowerCase();
          const restaurantState = restaurant.state?.toLowerCase();
          
          if (city === 'nyc') {
            return restaurantCity === 'new york' || restaurantState === 'ny';
          } else if (city === 'la') {
            return restaurantCity === 'los angeles' || restaurantState === 'ca';
          }
        }
        
        return true;
      });

      // Sort by creation date (newest first) and then by rating
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        
        if (dateA !== dateB) {
          return dateB - dateA; // Newer first
        }
        
        // If dates are equal, sort by rating (higher first)
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });

      // Take the most recent restaurants up to the limit, avoiding duplicates from trending
      const notable = [];
      const seenIds = new Set<string>();
      
      for (const restaurant of filtered) {
        if (notable.length >= limit) break;
        
        // Skip if already used in trending section
        if (usedRestaurantIds.trending.has(restaurant.id)) {
          continue;
        }
        
        // Skip if we've already seen this restaurant in this section
        if (seenIds.has(restaurant.id)) {
          continue;
        }
        
        notable.push(restaurant);
        seenIds.add(restaurant.id);
        usedRestaurantIds.newAndNotable.add(restaurant.id);
      }
      
      console.log(`[useNewAndNotableRestaurants] Found ${notable.length} new & notable restaurants for ${city || 'all cities'}`);
      
      setNotableRestaurants(notable);
      setError(null);
    } catch (err) {
      console.error('[useNewAndNotableRestaurants] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch new and notable restaurants'));
    } finally {
      setIsLoading(false);
    }
  }, [restaurants, storeLoading, city, limit]);

  return {
    restaurants: notableRestaurants,
    isLoading: isLoading || storeLoading,
    error,
    refetch: () => {
      setError(null);
      setIsLoading(true);
    }
  };
}
