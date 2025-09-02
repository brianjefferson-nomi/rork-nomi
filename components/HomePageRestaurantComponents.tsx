import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, Star } from 'lucide-react-native';
import { RestaurantCard } from './RestaurantCard';
import { Restaurant } from '@/types/restaurant';
import { useTrendingRestaurants, useNewAndNotableRestaurants } from '@/hooks/use-restaurants';

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper function to check if restaurant is within geo-fence
const isWithinGeoFence = (
  restaurant: Restaurant, 
  userLocation: { lat: number; lng: number } | null, 
  maxDistance: number
): boolean => {
  if (!userLocation || !restaurant.coordinates) {
    return true; // If no location data, include all restaurants
  }
  
  const distance = calculateDistance(
    userLocation.lat, 
    userLocation.lng, 
    restaurant.coordinates.latitude, 
    restaurant.coordinates.longitude
  );
  
  return distance <= maxDistance;
};

interface RestaurantComponentProps {
  userLocation: { lat: number; lng: number } | null;
  currentCity: 'nyc' | 'la';
  onRestaurantPress: (restaurant: Restaurant) => void;
  onRestaurantsUsed?: (restaurantIds: string[]) => void;
}

export const TrendingRestaurantsComponent: React.FC<RestaurantComponentProps> = ({
  userLocation,
  currentCity,
  onRestaurantPress
}) => {
  const { restaurants: trendingRestaurants, isLoading, error } = useTrendingRestaurants(currentCity, 8);

  // Debug logging
  console.log('[TrendingRestaurantsComponent] Debug:', {
    currentCity,
    isLoading,
    error: error?.message,
    totalRestaurants: trendingRestaurants.length,
    userLocation,
    sampleRestaurants: trendingRestaurants.slice(0, 3).map((r: Restaurant) => ({ id: r.id, name: r.name }))
  });

  // Filter restaurants within geo-fence
  const filteredRestaurants = useMemo(() => {
    const filtered = trendingRestaurants.filter((restaurant: Restaurant) => 
      isWithinGeoFence(restaurant, userLocation, 50)
    );
    
    console.log('[TrendingRestaurantsComponent] Geo-fence filtering:', {
      before: trendingRestaurants.length,
      after: filtered.length,
      userLocation
    });
    
    return filtered;
  }, [trendingRestaurants, userLocation]);

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Trending Now</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading trending restaurants...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Trending Now</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load trending restaurants: {error.message}</Text>
        </View>
      </View>
    );
  }

  if (filteredRestaurants.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Trending Now</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No trending restaurants found ({trendingRestaurants.length} total, {filteredRestaurants.length} after filtering)</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TrendingUp size={20} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>Trending Now</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {filteredRestaurants.map((restaurant: Restaurant) => (
          <View key={restaurant.id} style={styles.cardWrapper}>
            <RestaurantCard
              restaurant={restaurant}
              onPress={() => onRestaurantPress(restaurant)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export const NewAndNotableComponent: React.FC<RestaurantComponentProps> = ({
  userLocation,
  currentCity,
  onRestaurantPress
}) => {
  const { restaurants: notableRestaurants, isLoading, error } = useNewAndNotableRestaurants(currentCity, 6);

  // Debug logging
  console.log('[NewAndNotableComponent] Debug:', {
    currentCity,
    isLoading,
    error: error?.message,
    totalRestaurants: notableRestaurants.length,
    userLocation,
    sampleRestaurants: notableRestaurants.slice(0, 3).map((r: Restaurant) => ({ id: r.id, name: r.name }))
  });

  // Filter restaurants within geo-fence
  const filteredRestaurants = useMemo(() => {
    const filtered = notableRestaurants.filter((restaurant: Restaurant) => 
      isWithinGeoFence(restaurant, userLocation, 40)
    );
    
    console.log('[NewAndNotableComponent] Geo-fence filtering:', {
      before: notableRestaurants.length,
      after: filtered.length,
      userLocation
    });
    
    return filtered;
  }, [notableRestaurants, userLocation]);

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>New & Notable</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading notable restaurants...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>New & Notable</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load notable restaurants: {error.message}</Text>
        </View>
      </View>
    );
  }

  if (filteredRestaurants.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>New & Notable</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No notable restaurants found ({notableRestaurants.length} total, {filteredRestaurants.length} after filtering)</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Star size={20} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>New & Notable</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {filteredRestaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.cardWrapper}>
            <RestaurantCard
              restaurant={restaurant}
              onPress={() => onRestaurantPress(restaurant)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  cardWrapper: {
    marginRight: 10,
    width: 240,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
});
