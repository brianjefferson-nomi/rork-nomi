import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MapPin, Navigation, Map } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { getUserLocation } from '@/utils/nearby-restaurants';
import { RestaurantCard } from './RestaurantCard';

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface NearbyRestaurantsProps {
  restaurants: Restaurant[];
  radius?: number;
  maxResults?: number;
  showDistance?: boolean;
  showWhenEmpty?: boolean; // Whether to show component when no restaurants found
}

export default function NearbyRestaurants({ 
  restaurants, 
  radius = 5, 
  maxResults = 10,
  showDistance = true,
  showWhenEmpty = false
}: NearbyRestaurantsProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation && restaurants.length > 0) {
      // Calculate nearby restaurants based on distance
      const calculateNearby = () => {
        const nearby = restaurants.filter(restaurant => {
          if (!restaurant.latitude || !restaurant.longitude) return false;
          
          // Calculate distance using Haversine formula
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            restaurant.latitude, 
            restaurant.longitude
          );
          
          // Convert radius from meters to miles (1 mile ≈ 1609.34 meters)
          const radiusInMiles = radius / 1609.34;
          
          return distance <= radiusInMiles;
        });
        
        // Sort by distance (closest first)
        nearby.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            a.latitude!, 
            a.longitude!
          );
          const distanceB = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            b.latitude!, 
            b.longitude!
          );
          return distanceA - distanceB;
        });
        
        // Add distance to each restaurant for display
        const nearbyWithDistance = nearby.map(restaurant => ({
          ...restaurant,
          distance: calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            restaurant.latitude!, 
            restaurant.longitude!
          )
        }));
        
        console.log(`[NearbyRestaurants] Found ${nearbyWithDistance.length} restaurants within ${radius}m radius`);
        
        setNearbyRestaurants(nearbyWithDistance.slice(0, maxResults));
      };
      
      calculateNearby();
    }
  }, [userLocation, restaurants, radius, maxResults]);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location);
      } else {
        setError('Unable to get your location. Please enable location services.');
      }
    } catch (err) {
      setError('Error getting location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 5280)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  const openInMaps = (restaurant: Restaurant) => {
    if (!restaurant.latitude || !restaurant.longitude) {
      Alert.alert('Error', 'Location not available for this restaurant');
      return;
    }

    const url = `https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`;
    // In a real app, you'd use Linking.openURL(url)
    console.log('Opening in maps:', url);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MapPin size={20} color="#666" />
          <Text style={styles.title}>Finding nearby restaurants...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MapPin size={20} color="#666" />
          <Text style={styles.title}>Nearby Restaurants</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MapPin size={20} color="#666" />
          <Text style={styles.title}>Nearby Restaurants</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Location access required to show nearby restaurants</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (nearbyRestaurants.length === 0) {
    return null; // Don't show anything if no restaurants within radius
  }

  // Only show if there are restaurants within the radius (unless showWhenEmpty is true)
  if (nearbyRestaurants.length === 0 && !showWhenEmpty) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={20} color="#666" />
        <Text style={styles.title}>Nearby Restaurants</Text>
        <Text style={styles.subtitle}>Within {radius} miles • {nearbyRestaurants.length} found</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {nearbyRestaurants.map((restaurant, index) => (
          <View key={restaurant.id || index} style={styles.restaurantContainer}>
            <RestaurantCard restaurant={restaurant} onPress={() => {}} />
            
            {showDistance && (restaurant as any).distance && (
              <View style={styles.distanceContainer}>
                <MapPin size={14} color="#666" />
                <Text style={styles.distanceText}>
                  {formatDistance((restaurant as any).distance)}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => openInMaps(restaurant)}
            >
              <Navigation size={16} color="#007AFF" />
              <Text style={styles.mapButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 'auto',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  restaurantContainer: {
    width: 280,
    marginRight: 16,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  mapButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
