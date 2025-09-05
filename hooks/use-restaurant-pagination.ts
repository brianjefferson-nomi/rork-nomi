import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  restaurantPaginationService, 
  PaginationOptions, 
  SearchFilters, 
  RestaurantPaginationResult 
} from '@/services/restaurant-pagination';
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/services/supabase';

// Hook for infinite scroll pagination
export function useRestaurantPagination(
  initialOptions: PaginationOptions = {},
  initialFilters: SearchFilters = {}
) {
  const [options, setOptions] = useState<PaginationOptions>(initialOptions);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use infinite query for seamless pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['restaurants-pagination', options, filters],
    queryFn: async ({ pageParam }) => {
      const result = await restaurantPaginationService.getRestaurants(
        { ...options, cursor: pageParam },
        filters
      );
      return result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update all restaurants when data changes
  useEffect(() => {
    if (data?.pages) {
      const restaurants = data.pages.flatMap((page: any) => page.data);
      setAllRestaurants(restaurants);
    }
  }, [data]);

  // Update error state
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load restaurants');
    } else {
      setError(null);
    }
  }, [isError, queryError]);

  // Load more restaurants
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingMore(true);
      try {
        await fetchNextPage();
      } catch (err) {
        console.error('[useRestaurantPagination] Error loading more:', err);
        setError(err instanceof Error ? err.message : 'Failed to load more restaurants');
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<PaginationOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset pagination
  const reset = useCallback(() => {
    setAllRestaurants([]);
    setError(null);
    refetch();
  }, [refetch]);

  // Get total count from first page
  const totalCount = (data?.pages?.[0] as any)?.total || 0;

  return {
    restaurants: allRestaurants,
    isLoading,
    isLoadingMore,
    isError,
    error,
    hasMore: hasNextPage,
    totalCount,
    loadMore,
    updateOptions,
    updateFilters,
    reset,
    refetch
  };
}

// Hook for search with pagination (renamed to avoid conflict)
export function useRestaurantSearchWithPagination(
  searchTerm: string,
  initialOptions: PaginationOptions = {},
  initialFilters: SearchFilters = {}
) {
  const [options, setOptions] = useState<PaginationOptions>(initialOptions);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['restaurants-search', searchTerm, options, filters],
    queryFn: async ({ pageParam }) => {
      if (!searchTerm.trim()) {
        return {
          data: [],
          nextCursor: undefined,
          hasMore: false,
          total: 0,
          executionTime: 0,
          filters: { ...filters, searchTerm },
          sortBy: options.sortBy || 'name',
          sortOrder: options.sortOrder || 'asc'
        };
      }

      const result = await restaurantPaginationService.searchRestaurants(
        searchTerm,
        { ...options, cursor: pageParam },
        filters
      );
      return result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    enabled: searchTerm.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update all restaurants when data changes
  useEffect(() => {
    if (data?.pages) {
      const restaurants = data.pages.flatMap((page: any) => page.data);
      setAllRestaurants(restaurants);
    }
  }, [data]);

  // Update error state
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to search restaurants');
    } else {
      setError(null);
    }
  }, [isError, queryError]);

  // Load more search results
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage && searchTerm.trim()) {
      setIsLoadingMore(true);
      try {
        await fetchNextPage();
      } catch (err) {
        console.error('[useRestaurantSearchWithPagination] Error loading more:', err);
        setError(err instanceof Error ? err.message : 'Failed to load more search results');
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchTerm]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<PaginationOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset search
  const reset = useCallback(() => {
    setAllRestaurants([]);
    setError(null);
    refetch();
  }, [refetch]);

  // Get total count from first page
  const totalCount = (data?.pages?.[0] as any)?.total || 0;

  return {
    restaurants: allRestaurants,
    isLoading,
    isLoadingMore,
    isError,
    error,
    hasMore: hasNextPage,
    totalCount,
    loadMore,
    updateOptions,
    updateFilters,
    reset,
    refetch
  };
}

// Hook for filtered restaurant browsing
export function useRestaurantFilters(
  initialOptions: PaginationOptions = {},
  initialFilters: SearchFilters = {}
) {
  const [options, setOptions] = useState<PaginationOptions>(initialOptions);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['restaurants-filters', options, filters],
    queryFn: async ({ pageParam }) => {
      const result = await restaurantPaginationService.getRestaurants(
        { ...options, cursor: pageParam },
        filters
      );
      return result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update all restaurants when data changes
  useEffect(() => {
    if (data?.pages) {
      const restaurants = data.pages.flatMap((page: any) => page.data);
      setAllRestaurants(restaurants);
    }
  }, [data]);

  // Update error state
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load restaurants');
    } else {
      setError(null);
    }
  }, [isError, queryError]);

  // Load more restaurants
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingMore(true);
      try {
        await fetchNextPage();
      } catch (err) {
        console.error('[useRestaurantFilters] Error loading more:', err);
        setError(err instanceof Error ? err.message : 'Failed to load more restaurants');
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<PaginationOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const reset = useCallback(() => {
    setAllRestaurants([]);
    setError(null);
    refetch();
  }, [refetch]);

  // Get total count from first page
  const totalCount = (data?.pages?.[0] as any)?.total || 0;

  return {
    restaurants: allRestaurants,
    isLoading,
    isLoadingMore,
    isError,
    error,
    hasMore: hasNextPage,
    totalCount,
    loadMore,
    updateOptions,
    updateFilters,
    reset,
    refetch
  };
}

// Hook for location-based restaurant search
export function useRestaurantsNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  initialOptions: PaginationOptions = {},
  initialFilters: SearchFilters = {}
) {
  const [options, setOptions] = useState<PaginationOptions>(initialOptions);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['restaurants-location', latitude, longitude, radiusKm, options, filters],
    queryFn: async ({ pageParam }) => {
      const result = await restaurantPaginationService.getRestaurantsNearLocation(
        latitude,
        longitude,
        radiusKm,
        { ...options, cursor: pageParam },
        filters
      );
      return result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    enabled: !isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for location-based results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update all restaurants when data changes
  useEffect(() => {
    if (data?.pages) {
      const restaurants = data.pages.flatMap((page: any) => page.data);
      setAllRestaurants(restaurants);
    }
  }, [data]);

  // Update error state
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load nearby restaurants');
    } else {
      setError(null);
    }
  }, [isError, queryError]);

  // Load more restaurants
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingMore(true);
      try {
        await fetchNextPage();
      } catch (err) {
        console.error('[useRestaurantsNearLocation] Error loading more:', err);
        setError(err instanceof Error ? err.message : 'Failed to load more nearby restaurants');
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<PaginationOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset location search
  const reset = useCallback(() => {
    setAllRestaurants([]);
    setError(null);
    refetch();
  }, [refetch]);

  // Get total count from first page
  const totalCount = (data?.pages?.[0] as any)?.total || 0;

  return {
    restaurants: allRestaurants,
    isLoading,
    isLoadingMore,
    isError,
    error,
    hasMore: hasNextPage,
    totalCount,
    loadMore,
    updateOptions,
    updateFilters,
    reset,
    refetch
  };
}


// Utility hook for getting available filter options
export function useRestaurantFilterOptions() {
  const { data: cuisines } = useQuery({
    queryKey: ['restaurant-cuisines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('cuisine')
        .not('cuisine', 'is', null);
      
      if (error) throw error;
      
      const uniqueCuisines = [...new Set(data.map(r => r.cuisine))].sort();
      return uniqueCuisines;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: neighborhoods } = useQuery({
    queryKey: ['restaurant-neighborhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('neighborhood')
        .not('neighborhood', 'is', null);
      
      if (error) throw error;
      
      const uniqueNeighborhoods = [...new Set(data.map(r => r.neighborhood))].sort();
      return uniqueNeighborhoods;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: cities } = useQuery({
    queryKey: ['restaurant-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('city')
        .not('city', 'is', null);
      
      if (error) throw error;
      
      const uniqueCities = [...new Set(data.map(r => r.city))].sort();
      return uniqueCities;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: priceRanges } = useQuery({
    queryKey: ['restaurant-price-ranges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('price_range')
        .not('price_range', 'is', null);
      
      if (error) throw error;
      
      const uniquePriceRanges = [...new Set(data.map(r => r.price_range))].sort();
      return uniquePriceRanges;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    cuisines: cuisines || [],
    neighborhoods: neighborhoods || [],
    cities: cities || [],
    priceRanges: priceRanges || []
  };
}
