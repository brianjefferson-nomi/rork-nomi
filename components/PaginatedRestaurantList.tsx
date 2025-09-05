import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Restaurant } from '@/types/restaurant';
import { useRestaurantPagination, useRestaurantSearchWithPagination, useRestaurantFilters } from '@/hooks/use-restaurant-pagination';
import { PaginationOptions, SearchFilters } from '@/services/restaurant-pagination';
import { RestaurantCard } from './RestaurantCard';

interface PaginatedRestaurantListProps {
  // Pagination options
  initialOptions?: PaginationOptions;
  initialFilters?: SearchFilters;
  
  // Search functionality
  searchTerm?: string;
  
  // UI customization
  renderItem?: (item: Restaurant, index: number) => React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  
  // Styling
  contentContainerStyle?: any;
  style?: any;
  
  // Callbacks
  onRestaurantPress?: (restaurant: Restaurant) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  
  // Performance options
  enableInfiniteScroll?: boolean;
  enablePullToRefresh?: boolean;
  showLoadMoreButton?: boolean;
  
  // Display options
  showTotalCount?: boolean;
  showLoadingIndicator?: boolean;
  showErrorState?: boolean;
}

export default function PaginatedRestaurantList({
  initialOptions = {},
  initialFilters = {},
  searchTerm = '',
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  contentContainerStyle,
  style,
  onRestaurantPress,
  onLoadMore,
  onRefresh,
  enableInfiniteScroll = true,
  enablePullToRefresh = true,
  showLoadMoreButton = false,
  showTotalCount = true,
  showLoadingIndicator = true,
  showErrorState = true
}: PaginatedRestaurantListProps) {
  
  // Choose the appropriate hook based on whether we're searching or filtering
  const isSearching = searchTerm.trim().length > 0;
  
  const searchHook = useRestaurantSearchWithPagination(searchTerm, initialOptions, initialFilters);
  const filterHook = useRestaurantFilters(initialOptions, initialFilters);
  
  const {
    restaurants,
    isLoading,
    isLoadingMore,
    isError,
    error,
    hasMore,
    totalCount,
    loadMore,
    updateOptions,
    updateFilters,
    reset,
    refetch
  } = isSearching ? searchHook : filterHook;

  // Handle restaurant press
  const handleRestaurantPress = useCallback((restaurant: Restaurant) => {
    if (onRestaurantPress) {
      onRestaurantPress(restaurant);
    }
  }, [onRestaurantPress]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (enableInfiniteScroll && hasMore && !isLoadingMore) {
      await loadMore();
      if (onLoadMore) {
        onLoadMore();
      }
    }
  }, [enableInfiniteScroll, hasMore, isLoadingMore, loadMore, onLoadMore]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refetch();
    if (onRefresh) {
      onRefresh();
    }
  }, [refetch, onRefresh]);

  // Default render item
  const defaultRenderItem = useCallback(({ item, index }: { item: Restaurant; index: number }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  ), [handleRestaurantPress]);

  // Memoized render item
  const memoizedRenderItem = useMemo(() => {
    return renderItem || defaultRenderItem;
  }, [renderItem, defaultRenderItem]);

  // Loading indicator
  const LoadingIndicator = useMemo(() => {
    if (!showLoadingIndicator) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>
          {isSearching ? 'Searching restaurants...' : 'Loading restaurants...'}
        </Text>
      </View>
    );
  }, [showLoadingIndicator, isSearching]);

  // Error state
  const ErrorState = useMemo(() => {
    if (!showErrorState || !isError) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Restaurants</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }, [showErrorState, isError, error, handleRefresh]);

  // Empty state
  const EmptyState = useMemo(() => {
    if (isLoading) return null;
    
    if (ListEmptyComponent) {
      return ListEmptyComponent;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {isSearching ? 'No restaurants found' : 'No restaurants available'}
        </Text>
        <Text style={styles.emptyMessage}>
          {isSearching 
            ? `No restaurants match your search "${searchTerm}"`
            : 'Try adjusting your filters or check back later'
          }
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>
            {isSearching ? 'Clear Search' : 'Reset Filters'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, ListEmptyComponent, isSearching, searchTerm, reset]);

  // Footer component
  const FooterComponent = useMemo(() => {
    if (ListFooterComponent) {
      return ListFooterComponent;
    }
    
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.loadingMoreText}>Loading more restaurants...</Text>
        </View>
      );
    }
    
    if (showLoadMoreButton && hasMore && !enableInfiniteScroll) {
      return (
        <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
          <Text style={styles.loadMoreButtonText}>Load More Restaurants</Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  }, [
    ListFooterComponent, 
    isLoadingMore, 
    showLoadMoreButton, 
    hasMore, 
    enableInfiniteScroll, 
    handleLoadMore
  ]);

  // Header component with total count
  const HeaderComponent = useMemo(() => {
    if (!showTotalCount || isLoading) return ListHeaderComponent;
    
    const countText = isSearching 
      ? `${totalCount} restaurants found for "${searchTerm}"`
      : `${totalCount} restaurants available`;
    
    return (
      <View>
        {ListHeaderComponent}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{countText}</Text>
        </View>
      </View>
    );
  }, [showTotalCount, isLoading, ListHeaderComponent, isSearching, totalCount, searchTerm]);

  // Show loading state
  if (isLoading && restaurants.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {HeaderComponent}
        {LoadingIndicator}
      </View>
    );
  }

  // Show error state
  if (isError && restaurants.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {HeaderComponent}
        {ErrorState}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={restaurants}
        renderItem={({ item, index }) => memoizedRenderItem(item, index)}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={HeaderComponent}
        ListFooterComponent={FooterComponent}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle
        ]}
        refreshControl={
          enablePullToRefresh ? (
            <RefreshControl
              refreshing={isLoading && restaurants.length > 0}
              onRefresh={handleRefresh}
              colors={['#FF6B6B']}
              tintColor="#FF6B6B"
            />
          ) : undefined
        }
        onEndReached={enableInfiniteScroll ? handleLoadMore : undefined}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={20}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate height of restaurant card
          offset: 200 * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  restaurantCard: {
    marginBottom: 16,
  },
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
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
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
  resetButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
