import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import { TrendingUp, Users, MapPin, Sparkles, Clock, BookOpen, User, Navigation } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { CollectionCard } from '@/components/CollectionCard';
import { Collection } from '@/types/restaurant';
import { ContributorCard } from '@/components/ContributorCard';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { SearchWizard } from '@/components/SearchWizard';
import { searchMapboxRestaurants, getMapboxNearbyRestaurants, transformMapboxToRestaurant, searchFoursquareRestaurants, deduplicateRestaurants } from '@/services/api';


export default function HomeScreen() {
  // Initialize hooks with proper error handling - MUST be at the top
  const restaurantsData = useRestaurants();
  const authData = useAuth();
  
  // Destructure addRestaurantToStore from the store
  const { addRestaurantToStore } = restaurantsData;
  
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [mapboxRestaurants, setMapboxRestaurants] = useState<any[]>([]);

  // Destructure with defaults and null checks - ensure these are always defined
  const restaurants = restaurantsData?.restaurants || [];
  const collections = restaurantsData?.collections || [];
  const isLoading = restaurantsData?.isLoading || false;
  const userLocation = restaurantsData?.userLocation;
  const switchToCity = restaurantsData?.switchToCity;
  
  const user = authData?.user;
  const isAuthenticated = authData?.isAuthenticated || false;

  // Ensure collections is always an array
  const safeCollections = Array.isArray(collections) ? collections : [];

  const city = userLocation?.city === 'Los Angeles' ? 'Los Angeles' : 'New York';
  
  // Filter restaurants by location with better matching - add null check
  const cityRestaurants = useMemo(() => {
    return (restaurants || []).filter(r => {
      if (!r) return false;
      const address = (r.address || r.neighborhood || 'Unknown').toLowerCase();
      if (city === 'Los Angeles') {
        return /los angeles|hollywood|beverly hills|santa monica|west hollywood|downtown la|venice|koreatown|silver lake|la|california|ca/i.test(address);
      } else {
        return /new york|manhattan|brooklyn|queens|bronx|soho|east village|upper east side|midtown|ny|nyc/i.test(address);
      }
    });
  }, [restaurants, city]);
  
  // Use city-specific restaurants when available, otherwise show all
  const availableRestaurants = useMemo(() => {
    return cityRestaurants.length > 0 ? cityRestaurants : (restaurants || []);
  }, [cityRestaurants, restaurants, city]);

  // Use Mapbox restaurants when available, fallback to existing restaurants
  const trendingRestaurants = useMemo(() => {
    if (mapboxRestaurants.length > 0) {
      return mapboxRestaurants.slice(0, 6);
    }
    return availableRestaurants.slice(0, 6);
  }, [mapboxRestaurants, availableRestaurants]);
  
  // For New York, prioritize local restaurants over trending
  const shouldPrioritizeLocal = city === 'New York';
  
  // Convert plans to collections format for display
  const planCollections: Collection[] = useMemo(() => safeCollections.map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || 'A collaborative dining plan',
    cover_image: (plan as any).cover_image || 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
    created_by: plan.created_by,
    creator_id: (plan as any).creator_id,
    occasion: plan.occasion,
    is_public: plan.is_public,
    likes: plan.likes || 0,
    equal_voting: plan.equal_voting,
    admin_weighted: plan.admin_weighted,
    expertise_weighted: plan.expertise_weighted,
    minimum_participation: plan.minimum_participation,
    voting_deadline: (plan as any).voting_deadline,
    allow_vote_changes: plan.allow_vote_changes,
    anonymous_voting: plan.anonymous_voting,
    vote_visibility: plan.vote_visibility as 'public' | 'anonymous' | 'admin_only',
    discussion_enabled: plan.discussion_enabled,
    auto_ranking_enabled: plan.auto_ranking_enabled,
    consensus_threshold: plan.consensus_threshold,
    restaurant_ids: plan.restaurant_ids || [],
    collaborators: (plan as any).collaborators || [],
    created_at: plan.created_at,
    updated_at: plan.updated_at
  })), [safeCollections]);
  
  const displayCollections = useMemo(() => planCollections || [], [planCollections]);
  const popularCollections = useMemo(() => (displayCollections || []).sort((a, b) => b.likes - a.likes).slice(0, 4), [displayCollections]);
  
  // Use Mapbox restaurants for new restaurants section
  const newRestaurants = useMemo(() => {
    if (mapboxRestaurants.length > 6) {
      return mapboxRestaurants.slice(6, 10);
    }
    return availableRestaurants.slice(6, 10);
  }, [mapboxRestaurants, availableRestaurants]);
  
  // Use Mapbox restaurants for local highlights
  const localHighlights = useMemo(() => {
    if (mapboxRestaurants.length > 0) {
      return mapboxRestaurants.slice(0, 4);
    }
    return availableRestaurants.slice(0, 4);
  }, [mapboxRestaurants, availableRestaurants]);

  // Load Mapbox restaurants
  useEffect(() => {
    if (!userLocation) return;

    const loadRealRestaurants = async () => {
      try {
        const lat = userLocation?.lat || 40.7128;
        const lng = userLocation?.lng || -74.0060;
        
        console.log('[HomeScreen] Loading real restaurants for location:', lat, lng);
        
        // Try multiple APIs to get the best restaurant data
        const allRestaurants: any[] = [];
        
        // 1. Try Mapbox first (most reliable currently) - use user location for generic searches
        try {
          const mapboxResults = await getMapboxNearbyRestaurants(lat, lng, 5000, 20);
          console.log('[HomeScreen] Raw Mapbox results:', mapboxResults.length, 'items');
          console.log('[HomeScreen] First raw Mapbox result:', mapboxResults[0]);
          
          // mapboxResults already contains detailed restaurant objects from retrieve endpoint
          const transformedMapbox = mapboxResults.map(transformMapboxToRestaurant).filter(Boolean);
          allRestaurants.push(...transformedMapbox);
          console.log('[HomeScreen] Loaded', transformedMapbox.length, 'Mapbox restaurants');
          console.log('[HomeScreen] First transformed Mapbox restaurant:', transformedMapbox[0]);
        } catch (error) {
          console.error('[HomeScreen] Mapbox API error:', error);
        }
        
        // 2. Try Foursquare as backup (may have credit limits or CORS issues)
        if (allRestaurants.length < 10) { // Only try if we need more data
          try {
            const foursquareResults = await searchFoursquareRestaurants('restaurant', lat, lng, 5000);
            const transformedFoursquare = foursquareResults.map((place: any) => ({
              id: place.fsq_id || place.id,
              name: place.name,
              cuisine: place.categories?.[0]?.name || 'Restaurant',
              location: {
                address: place.location?.address || '',
                city: place.location?.locality || '',
                state: place.location?.region || '',
                zipCode: place.location?.postcode || '',
                country: place.location?.country || '',
                formattedAddress: place.location?.formatted_address || ''
              },
              coordinates: {
                latitude: place.latitude || place.location?.lat,
                longitude: place.longitude || place.location?.lng
              },
              rating: place.rating || 0,
              price: place.price || 0,
              photos: [],
              hours: place.hours?.display || '',
              isOpenNow: place.hours?.open_now || false,
              phone: place.tel || '',
              website: place.website || '',
              description: place.description || '',
              popularity: place.popularity || 0,
              verified: place.verified || false,
              distance: place.distance || 0,
              source: 'foursquare',
              sourceId: place.fsq_id || place.id
            })).filter(Boolean);
            
            allRestaurants.push(...transformedFoursquare);
            console.log('[HomeScreen] Loaded', transformedFoursquare.length, 'Foursquare restaurants');
          } catch (error) {
            console.error('[HomeScreen] Foursquare API error:', error);
          }
        }
        
        // 3. Use available restaurants as final fallback
        if (allRestaurants.length === 0 && availableRestaurants.length > 0) {
          allRestaurants.push(...availableRestaurants);
          console.log('[HomeScreen] Using fallback restaurants:', availableRestaurants.length);
        }
        
        // Always ensure we have some data to show
        let uniqueResults = deduplicateRestaurants(allRestaurants).slice(0, 20);
        
        // If we still don't have any results, use availableRestaurants
        if (uniqueResults.length === 0 && availableRestaurants.length > 0) {
          uniqueResults = availableRestaurants.slice(0, 20);
          console.log('[HomeScreen] Using availableRestaurants as final fallback:', uniqueResults.length);
        }
        
        setMapboxRestaurants(uniqueResults);
        setNearbyRestaurants(uniqueResults.slice(0, 4)); // Use first 4 for nearby section
        
        console.log('[HomeScreen] Total loaded restaurants:', uniqueResults.length);
      } catch (error) {
        console.error('[HomeScreen] Error loading restaurants:', error);
        // Fallback to existing restaurants
        const localRestaurants = availableRestaurants.slice(0, 4);
        setNearbyRestaurants(localRestaurants);
        setMapboxRestaurants(availableRestaurants);
        console.log('[HomeScreen] Error fallback - using availableRestaurants:', availableRestaurants.length);
      }
    };

    loadRealRestaurants();
  }, [userLocation, availableRestaurants]);

  // Debug logging with error handling
  try {
    console.log('[HomeScreen] User authenticated:', isAuthenticated);
    console.log('[HomeScreen] User ID:', user?.id);
    console.log('[HomeScreen] Collections count:', collections?.length || 0);
    console.log('[HomeScreen] Collections data:', collections?.map(c => ({ id: c.id, name: c.name, created_by: c.created_by, is_public: c.is_public })));
    console.log('[HomeScreen] Is loading:', isLoading);
    console.log('[HomeScreen] Mapbox restaurants:', mapboxRestaurants.length);
    console.log('[HomeScreen] Nearby restaurants:', nearbyRestaurants.length);
    console.log('[HomeScreen] User location:', userLocation);
  } catch (error) {
    console.error('[HomeScreen] Error in debug logging:', error);
  }

  // Check if hooks are properly initialized - AFTER all hooks are called
  if (!restaurantsData || !authData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Mock contributors data
  const suggestedContributors = [
    {
      id: '1',
      name: 'Maria Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      thumbsUp: 156,
      contributions: ['reviews', 'photos'],
      isVerified: true,
      badges: ['Local Expert'],
      followerCount: 1240,
      followingCount: 89,
      isFollowing: false,
      reviewCount: 45,
      photoCount: 128,
      tipCount: 23,
      checkinCount: 67
    },
    {
      id: '2', 
      name: 'James Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      thumbsUp: 89,
      contributions: ['reviews'],
      isVerified: false,
      badges: ['Food Critic'],
      followerCount: 567,
      followingCount: 234,
      isFollowing: true,
      reviewCount: 78,
      photoCount: 34,
      tipCount: 12,
      checkinCount: 45
    }
  ];

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Home',
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Find your next spot</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (isAuthenticated) {
                  router.push('/profile' as any);
                } else {
                  router.push('/auth' as any);
                }
              }}
              style={styles.profileButton}
              testID="profile-btn"
            >
              <View style={styles.profileAvatarContainer}>
                {user?.avatar_url ? (
                  <Image
                    source={{ uri: user.avatar_url }}
                    style={styles.profileAvatar}
                  />
                ) : (
                  <Text style={styles.profileInitials}>
                    {isAuthenticated && user?.name && typeof user.name === 'string' && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Search, filter and discover together</Text>
          <SearchWizard testID="search-wizard" />
        </View>

        {/* Local Restaurants Section - Show first in New York */}
        {shouldPrioritizeLocal && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Navigation size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Local Restaurants</Text>
              <TouchableOpacity onPress={() => router.push('/discover' as any)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {nearbyLoading ? (
              <View style={styles.nearbyLoadingContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text style={styles.nearbyLoadingText}>
                  Loading local restaurants...
                </Text>
              </View>
            ) : nearbyRestaurants.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {nearbyRestaurants.map(restaurant => (
                  <View key={restaurant.id} style={styles.cardWrapper}>
                    <RestaurantCard
                      restaurant={restaurant}
                      onPress={() => {
                        // Add restaurant to store before navigating
                        addRestaurantToStore(restaurant);
                        router.push(`/restaurant/${restaurant.id}` as any);
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.nearbyEmptyContainer}>
                <Text style={styles.nearbyEmptyText}>No local restaurants found</Text>
                <Text style={styles.nearbyEmptySubtext}>Try refreshing the app</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Trending in {city}</Text>
            <TouchableOpacity onPress={() => router.push('/discover' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {trendingRestaurants.map(restaurant => (
              <View key={restaurant.id} style={styles.cardWrapper}>
                <RestaurantCard
                  restaurant={restaurant}
                  onPress={() => {
                    // Add restaurant to store before navigating
                    addRestaurantToStore(restaurant);
                    router.push(`/restaurant/${restaurant.id}` as any);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>New & Notable in {city}</Text>
            <TouchableOpacity onPress={() => router.push('/discover' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {newRestaurants.map(restaurant => (
              <View key={restaurant.id} style={styles.cardWrapper}>
                <RestaurantCard
                  restaurant={restaurant}
                  onPress={() => {
                    // Add restaurant to store before navigating
                    addRestaurantToStore(restaurant);
                    router.push(`/restaurant/${restaurant.id}` as any);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Neighborhood Highlights Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Neighborhood Highlights</Text>
            <TouchableOpacity onPress={() => router.push('/discover' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.localGrid}>
            {isLoading ? (
              <View style={styles.nearbyEmptyContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text style={styles.nearbyEmptyText}>Loading neighborhoods...</Text>
              </View>
            ) : restaurants.length > 0 ? (
              // Get unique neighborhoods from the database and sort by restaurant count
              (() => {
                // Use the complete restaurant dataset (not filtered by city) to get neighborhoods with most restaurants
                const allRestaurants = [...restaurants, ...mapboxRestaurants];
                const uniqueRestaurants = deduplicateRestaurants(allRestaurants);
                
                const neighborhoodCounts = uniqueRestaurants.reduce((acc, restaurant) => {
                  const neighborhood = restaurant.neighborhood;
                  if (neighborhood) {
                    acc[neighborhood] = (acc[neighborhood] || 0) + 1;
                  }
                  return acc;
                }, {} as Record<string, number>);
                
                // Sort neighborhoods by restaurant count (descending) and take top 4
                // Only include neighborhoods with at least 2 restaurants
                const topNeighborhoods = Object.entries(neighborhoodCounts)
                  .filter(([, count]) => (count as number) >= 2) // Minimum 2 restaurants
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 4)
                  .map(([neighborhood, count]) => ({ neighborhood, count }));
                
                // Debug logging to verify sorting
                console.log('[Neighborhood Highlights] All neighborhoods with counts:', neighborhoodCounts);
                console.log('[Neighborhood Highlights] Top 4 neighborhoods:', topNeighborhoods);
                
                // Neighborhood background images - each with unique images
                const neighborhoodImages = {
                  'Midtown': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
                  'Greenwich Village': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
                  'Gramercy': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                  'SoHo': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
                  'East Village': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
                  'Upper East Side': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
                  'Brooklyn': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                  'Queens': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                  'Manhattan': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                  'Los Angeles': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400',
                  'Hollywood': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
                  'Beverly Hills': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
                  'Santa Monica': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                  'West Hollywood': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
                  'Downtown LA': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400',
                  'Venice': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                  'Koreatown': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
                  'Silver Lake': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400'
                };
                
                return topNeighborhoods.map(({ neighborhood, count }) => (
                  <TouchableOpacity 
                    key={neighborhood} 
                    style={styles.localCard}
                    onPress={() => {
                      // Navigate to discover page with neighborhood filter
                      router.push(`/discover?neighborhood=${encodeURIComponent(neighborhood)}` as any);
                    }}
                  >
                    <Image
                      source={{ uri: neighborhoodImages[neighborhood as keyof typeof neighborhoodImages] || 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' }}
                      style={styles.localImage}
                      resizeMode="cover"
                    />
                    <View style={styles.localOverlay}>
                      <Text style={styles.localName} numberOfLines={1}>{neighborhood}</Text>
                      <Text style={styles.localNeighborhood}>
                        {count as number} restaurant{(count as number) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ));
              })()
            ) : (
              <View style={styles.nearbyEmptyContainer}>
                <Text style={styles.nearbyEmptyText}>No neighborhoods found</Text>
                <Text style={styles.nearbyEmptySubtext}>Try refreshing the app</Text>
              </View>
            )}
          </View>
        </View>

        {/* Local Restaurants Section - Show after trending for other cities */}
        {!shouldPrioritizeLocal && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Navigation size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Local Restaurants</Text>
              <TouchableOpacity onPress={() => router.push('/discover' as any)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {nearbyLoading ? (
              <View style={styles.nearbyLoadingContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text style={styles.nearbyLoadingText}>
                  Loading local restaurants...
                </Text>
              </View>
            ) : nearbyRestaurants.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {nearbyRestaurants.map(restaurant => (
                  <View key={restaurant.id} style={styles.cardWrapper}>
                    <RestaurantCard
                      restaurant={restaurant}
                      onPress={() => {
                        // Add restaurant to store before navigating
                        addRestaurantToStore(restaurant);
                        router.push(`/restaurant/${restaurant.id}` as any);
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.nearbyEmptyContainer}>
                <Text style={styles.nearbyEmptyText}>No local restaurants found</Text>
                <Text style={styles.nearbyEmptySubtext}>Try refreshing the app</Text>
              </View>
            )}
          </View>
        )}





        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Popular Plans</Text>
            <TouchableOpacity onPress={() => router.push('/lists' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.collectionsGrid}>
            {popularCollections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onPress={() => {
                  if (collection.id.startsWith('mock-')) {
                    // For mock collections, navigate to create collection
                    router.push('/create-collection' as any);
                  } else {
                    router.push(`/collection/${collection.id}` as any);
                  }
                }}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
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
    flex: 1,
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  cardWrapper: {
    marginRight: 10,
    width: 240,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90A4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  localGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  localCard: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  localImage: {
    width: '100%',
    height: '100%',
  },
  localOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
  },
  localName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  localNeighborhood: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  neighborhoodCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  neighborhoodCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  contributorsContainer: {
    paddingHorizontal: 16,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  // Nearby restaurants styles
  nearbyLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  nearbyEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyEmptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nearbyEmptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});