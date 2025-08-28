import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Search, Filter, X, MapPin } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants } from '@/hooks/restaurant-store';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';

const cuisineTypes = ['All', 'Italian', 'French', 'Chinese', 'American', 'Deli', 'Bakery', 'Gastropub'];
const priceRanges = ['All', '$', '$$', '$$$', '$$$$'];

export default function DiscoverScreen() {
  const { restaurants, userLocation, addRestaurantToStore } = useRestaurants();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  
  // Use shared currentCity from store
  const { currentCity, switchToCity } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // No need to auto-detect city here - just use the current city from the store

  // Handle URL parameters for neighborhood filtering (only if explicitly provided)
  useEffect(() => {
    if (params.neighborhood) {
      setSelectedNeighborhood(params.neighborhood as string);
    }
  }, [params.neighborhood]);

  // Get city configuration
  const cityConfig = currentCity === 'nyc' ? NYC_CONFIG : LA_CONFIG;

  // Filter restaurants for current city
  const cityRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      if (!r) return false;
      const address = (r.address || r.neighborhood || 'Unknown').toLowerCase();
      return cityConfig.filterPattern.test(address);
    });
  }, [restaurants, cityConfig]);

  // Get unique neighborhoods from city restaurants
  const availableNeighborhoods = useMemo(() => {
    const neighborhoods = [...new Set(cityRestaurants.map(r => r.neighborhood).filter(Boolean))];
    return ['All', ...neighborhoods.sort()];
  }, [cityRestaurants]);

  // Filter restaurants based on all criteria
  const filteredRestaurants = useMemo(() => {
    return cityRestaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCuisine = selectedCuisine === 'All' || 
                             restaurant.cuisine.includes(selectedCuisine);
      
      const matchesPrice = selectedPrice === 'All' || 
                          restaurant.priceRange === selectedPrice;
      
      const matchesNeighborhood = selectedNeighborhood === 'All' || 
                                 restaurant.neighborhood === selectedNeighborhood;
      
      return matchesSearch && matchesCuisine && matchesPrice && matchesNeighborhood;
    });
  }, [cityRestaurants, searchQuery, selectedCuisine, selectedPrice, selectedNeighborhood]);

  const handleCityToggle = () => {
    const newCity = currentCity === 'nyc' ? 'la' : 'nyc';
    switchToCity(newCity);
    // Reset filters when switching cities
    setSelectedCuisine('All');
    setSelectedPrice('All');
    setSelectedNeighborhood('All');
  };

  const resetFilters = () => {
    setSelectedCuisine('All');
    setSelectedPrice('All');
    setSelectedNeighborhood('All');
  };

  const hasActiveFilters = selectedCuisine !== 'All' || selectedPrice !== 'All' || selectedNeighborhood !== 'All';

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

        {/* City toggle and filters button */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.cityToggle}
            onPress={handleCityToggle}
          >
            <MapPin size={16} color="#FF6B6B" />
            <Text style={styles.cityToggleText}>{cityConfig.name}</Text>
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

      {/* Results */}
      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          {filteredRestaurants.length} restaurants found in {cityConfig.name}
        </Text>
        
        <View style={styles.restaurantsList}>
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => {
                addRestaurantToStore(restaurant);
                router.push(`/restaurant/${restaurant.id}` as any);
              }}
              compact
            />
          ))}
        </View>
        
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
                      selectedNeighborhood === neighborhood && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedNeighborhood(neighborhood)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedNeighborhood === neighborhood && styles.filterChipTextActive
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
});