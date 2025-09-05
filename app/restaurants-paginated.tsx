import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { SearchFilters, PaginationOptions } from '@/services/restaurant-pagination';
import PaginatedRestaurantList from '@/components/PaginatedRestaurantList';
import RestaurantFilters from '@/components/RestaurantFilters';
import { Restaurant } from '@/types/restaurant';

export default function PaginatedRestaurantsScreen() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [options, setOptions] = useState<PaginationOptions>({
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle filter reset
  const handleFiltersReset = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Handle options change
  const handleOptionsChange = useCallback((newOptions: Partial<PaginationOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Handle restaurant press
  const handleRestaurantPress = useCallback((restaurant: Restaurant) => {
    console.log('Restaurant pressed:', restaurant.name);
    // Navigate to restaurant detail screen
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    console.log('Loading more restaurants...');
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    console.log('Refreshing restaurants...');
  }, []);

  // Get active filters count
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
        <TouchableOpacity 
          style={styles.filtersButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filtersButtonText}>Filters</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filtersBadge}>
              <Text style={styles.filtersBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={[
            styles.sortButton,
            options.sortBy === 'name' && styles.sortButtonActive
          ]}
          onPress={() => handleOptionsChange({ sortBy: 'name' })}
        >
          <Text style={[
            styles.sortButtonText,
            options.sortBy === 'name' && styles.sortButtonTextActive
          ]}>
            Name
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.sortButton,
            options.sortBy === 'rating' && styles.sortButtonActive
          ]}
          onPress={() => handleOptionsChange({ sortBy: 'rating' })}
        >
          <Text style={[
            styles.sortButtonText,
            options.sortBy === 'rating' && styles.sortButtonTextActive
          ]}>
            Rating
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.sortButton,
            options.sortBy === 'created_at' && styles.sortButtonActive
          ]}
          onPress={() => handleOptionsChange({ sortBy: 'created_at' })}
        >
          <Text style={[
            styles.sortButtonText,
            options.sortBy === 'created_at' && styles.sortButtonTextActive
          ]}>
            Newest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sortOrderButton}
          onPress={() => handleOptionsChange({ 
            sortOrder: options.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
        >
          <Text style={styles.sortOrderButtonText}>
            {options.sortOrder === 'asc' ? '↑' : '↓'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant List */}
      <PaginatedRestaurantList
        initialOptions={options}
        initialFilters={filters}
        searchTerm={searchTerm}
        onRestaurantPress={handleRestaurantPress}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        enableInfiniteScroll={true}
        enablePullToRefresh={true}
        showTotalCount={true}
        showLoadingIndicator={true}
        showErrorState={true}
        contentContainerStyle={styles.listContent}
      />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity 
              style={styles.modalResetButton}
              onPress={handleFiltersReset}
            >
              <Text style={styles.modalResetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <RestaurantFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    position: 'relative',
  },
  filtersButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  filtersBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filtersBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  sortButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  sortOrderButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  sortOrderButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalResetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalResetButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
});
