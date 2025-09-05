import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Search, Filter, X, MapPin, ArrowUpDown } from 'lucide-react-native';
import { SimpleRestaurantCard } from '@/components/restaurant-cards';
import { useRestaurants } from '@/hooks/restaurant-store';
import { searchRestaurants } from '@/services/restaurant-search-api';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';


const cuisineTypes = ['All', 'Italian', 'French', 'Chinese', 'American', 'Deli', 'Bakery', 'Gastropub'];
const priceRanges = ['All', '$', '$$', '$$$', '$$$$'];
const sortOptions = [
  { key: 'distance', label: 'Closest Distance' },
  { key: 'rating', label: 'Top Rated' }
];

export default function DiscoverScreen() {
  const { userLocation, addRestaurantToStore } = useRestaurants();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  
  // Use shared currentCity from store
  const { currentCity, switchToCity } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<Set<string>>(new Set(['All']));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'distance' | 'rating'>('distance');


  // State for API results
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Handle URL parameters for neighborhood filtering (only if explicitly provided)
  useEffect(() => {
    if (params.neighborhood) {
      setSelectedNeighborhoods(new Set([params.neighborhood as string]));
    }
  }, [params.neighborhood]);

  // Get city configuration
  const cityConfig = currentCity === 'nyc' ? NYC_CONFIG : LA_CONFIG;

  // API call function
  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    // Set isSearching based on whether there's a search query
    setIsSearching(!!searchQuery.trim());
    
    try {
      // Add neighborhood filter
      const neighborhoods = Array.from(selectedNeighborhoods).filter(n => n !== 'All');
      
      const result = await searchRestaurants({
        q: searchQuery.trim() || undefined,
        limit: 100,
        sort: selectedSort,
        city: cityConfig.name,
        cuisine: selectedCuisine !== 'All' ? selectedCuisine : undefined,
        price_range: selectedPrice !== 'All' ? selectedPrice : undefined,
        neighborhood: neighborhoods.length > 0 ? neighborhoods.join(',') : undefined,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        include_total: true
      });
      
      setRestaurants(result.restaurants || []);
      setTotalCount(result.totalCount || 0);
      setHasMore(result.hasMore || false);
      console.log(`[Discover] API result:`, result.restaurants?.length || 0, 'restaurants');
      console.log(`[Discover] User location:`, userLocation);
      console.log(`[Discover] Search query:`, searchQuery);
      console.log(`[Discover] City config:`, cityConfig.name);
      console.log(`[Discover] Total count:`, result.totalCount);
    } catch (error) {
      console.error('[Discover] API error:', error);
      setIsError(true);
      setError(error instanceof Error ? error.message : 'Search failed');
      setRestaurants([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCuisine, selectedPrice, selectedNeighborhoods, cityConfig.name, userLocation, selectedSort]);

  // Trigger API call when filters change
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Get unique neighborhoods from the pagination system
  const availableNeighborhoods = useMemo(() => {
    if (currentCity === 'nyc') {
      // For NYC, we'll use a predefined list of popular neighborhoods
      const nycNeighborhoods = [
        'All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
        'Upper East Side', 'Upper West Side', 'Midtown', 'Downtown',
        'Chelsea', 'Greenwich Village', 'East Village', 'SoHo', 'TriBeCa',
        'Harlem', 'Williamsburg', 'Bushwick', 'Astoria', 'Long Island City'
      ];
      return nycNeighborhoods;
    } else {
      // For LA, use a predefined list
      const laNeighborhoods = [
        'All', 'Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice', 'West Hollywood',
        'Downtown LA', 'Silver Lake', 'Echo Park', 'Los Feliz', 'Pasadena', 'Glendale'
      ];
      return laNeighborhoods;
    }
  }, [currentCity]);

  const handleCityToggle = () => {
    const newCity = currentCity === 'nyc' ? 'la' : 'nyc';
    switchToCity(newCity);
    // Reset filters when switching cities
    setSelectedCuisine('All');
    setSelectedPrice('All');
    setSelectedNeighborhoods(new Set(['All']));
    setSearchQuery('');
  };

  const resetFilters = () => {
    setSelectedCuisine('All');
    setSelectedPrice('All');
    setSelectedNeighborhoods(new Set(['All']));
    setSearchQuery('');
    setSelectedSort('distance');
  };

  const reset = () => {
    resetFilters();
  };

  const hasActiveFilters = selectedCuisine !== 'All' || selectedPrice !== 'All' || !selectedNeighborhoods.has('All') || searchQuery.trim().length > 0 || selectedSort !== 'distance';

  // Handle load more (simplified for now)
  const handleLoadMore = useCallback(async () => {
    // For now, just refetch with more results
    if (hasMore && !isLoading) {
      await fetchRestaurants();
    }
  }, [hasMore, isLoading, fetchRestaurants]);

  // Handle restaurant press
  const handleRestaurantPress = useCallback((restaurant: any) => {
    addRestaurantToStore(restaurant);
    router.push(`/restaurant/${restaurant.id}`);
  }, [addRestaurantToStore]);

  return (
    <View style={styles.container}>
      {/* Header with search and city toggle */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search restaurants in ${cityConfig.name}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* City toggle, sort button, and filters button */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.cityToggle}
            onPress={handleCityToggle}
          >
            <MapPin size={16} color="#FF6B6B" />
            <Text style={styles.cityToggleText}>{cityConfig.name}</Text>
          </TouchableOpacity>

          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.sortButton, selectedSort !== 'distance' && styles.sortButtonActive]}
              onPress={() => setSelectedSort(selectedSort === 'distance' ? 'rating' : 'distance')}
            >
              <ArrowUpDown size={16} color={selectedSort !== 'distance' ? "#FFF" : "#666"} />
              <Text style={[styles.sortButtonText, selectedSort !== 'distance' && styles.sortButtonTextActive]}>
                {sortOptions.find(option => option.key === selectedSort)?.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filtersButton, hasActiveFilters && styles.filtersButtonActive]}
              onPress={() => setShowFilters(true)}
            >
              <Filter size={20} color={hasActiveFilters ? "#FFF" : "#666"} />
              <Text style={[styles.filtersButtonText, hasActiveFilters && styles.filtersButtonTextActive]}>
                Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Results */}
      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          {totalCount} restaurants found
          {!selectedNeighborhoods.has('All') && selectedNeighborhoods.size > 0 && 
            ` • ${Array.from(selectedNeighborhoods).filter(n => n !== 'All').join(', ')}`}
        </Text>
        
        {/* Loading state */}
        {isLoading && restaurants.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>
              {isSearching ? 'Searching restaurants...' : 'Loading restaurants...'}
            </Text>
          </View>
        )}

        {/* Error state */}
        {isError && restaurants.length === 0 && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Loading Restaurants</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={reset}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Restaurant list */}
        {!isLoading && !isError && (
          <View style={styles.restaurantsList}>
            {restaurants.map((restaurant: any) => (
              <SimpleRestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant)}
                compact
              />
            ))}
            
                         {/* Load more button */}
             {hasMore && (
               <TouchableOpacity 
                 style={styles.loadMoreButton}
                 onPress={handleLoadMore}
                 disabled={isLoading}
               >
                 {isLoading ? (
                   <ActivityIndicator size="small" color="#FFFFFF" />
                 ) : (
                   <Text style={styles.loadMoreButtonText}>Load More Restaurants</Text>
                 )}
               </TouchableOpacity>
             )}
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !isError && restaurants.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {isSearching ? 'No restaurants found' : 'No restaurants available'}
            </Text>
            <Text style={styles.emptyMessage}>
              {isSearching 
                ? `No restaurants match your search "${searchQuery}"`
                : 'Try adjusting your filters or check back later'
              }
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>
                {isSearching ? 'Clear Search' : 'Reset Filters'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterChips}>
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterChip,
                      selectedSort === option.key && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedSort(option.key as 'distance' | 'rating')}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedSort === option.key && styles.filterChipTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cuisine Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Cuisine</Text>
              <View style={styles.filterChips}>
                {cuisineTypes.map(cuisine => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.filterChip,
                      selectedCuisine === cuisine && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedCuisine(cuisine)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCuisine === cuisine && styles.filterChipTextActive
                    ]}>
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.filterChips}>
                {priceRanges.map(price => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.filterChip,
                      selectedPrice === price && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedPrice(price)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedPrice === price && styles.filterChipTextActive
                    ]}>
                      {price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Neighborhood Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Neighborhood</Text>
              <View style={styles.filterChips}>
                {availableNeighborhoods.map(neighborhood => (
                  <TouchableOpacity
                    key={neighborhood}
                    style={[
                      styles.filterChip,
                      selectedNeighborhoods.has(neighborhood) && styles.filterChipActive
                    ]}
                    onPress={() => {
                      setSelectedNeighborhoods(prev => {
                        const newSet = new Set(prev);
                        if (neighborhood === 'All') {
                          // If "All" is clicked, clear all other selections and select only "All"
                          return new Set(['All']);
                        } else {
                          // If a specific neighborhood is clicked
                          if (newSet.has(neighborhood)) {
                            // Remove the neighborhood
                            newSet.delete(neighborhood);
                            // If no neighborhoods left, add "All"
                            if (newSet.size === 0) {
                              newSet.add('All');
                            }
                          } else {
                            // Add the neighborhood and remove "All" if it exists
                            newSet.delete('All');
                            newSet.add(neighborhood);
                          }
                          return newSet;
                        }
                      });
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedNeighborhoods.has(neighborhood) && styles.filterChipTextActive
                    ]}>
                      {neighborhood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1A1A1A',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  cityToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filtersButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filtersButtonTextActive: {
    color: '#FFF',
  },
  results: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  restaurantsList: {
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  // New pagination styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loadMoreButton: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});