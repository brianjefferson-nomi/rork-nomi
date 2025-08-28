import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { TrendingUp, Users, MapPin, Sparkles, Clock, BookOpen, User, Navigation } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { CollectionCard } from '@/components/CollectionCard';
import { Collection } from '@/types/restaurant';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { SearchWizard } from '@/components/SearchWizard';
import { searchMapboxRestaurants, getMapboxNearbyRestaurants, transformMapboxToRestaurant, searchFoursquareRestaurants, deduplicateRestaurants } from '@/services/api';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';
import { filterCollectionsByCity, getCityDisplayName, getCollectionStats } from '@/utils/collection-filtering';

type CityKey = 'nyc' | 'la';

export default function HomeScreen() {
  // Initialize hooks with proper error handling - MUST be at the top
  const restaurantsData = useRestaurants();
  const authData = useAuth();
  
  // Destructure addRestaurantToStore from the store
  const { addRestaurantToStore } = restaurantsData;
  
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [mapboxRestaurants, setMapboxRestaurants] = useState<any[]>([]);
  // Use shared currentCity from store
  const { currentCity, switchToCity } = restaurantsData;

  // Destructure with defaults and null checks - ensure these are always defined
  const restaurants = restaurantsData?.restaurants || [];
  const collections = restaurantsData?.allCollections || []; // Use allCollections (public only) instead of collections (user plans)
  const isLoading = restaurantsData?.isLoading || false;
  
  // Debug: Check what's in collections (allCollections)
  console.log('[HomeScreen] collections (allCollections) data:', collections.map((c: any) => ({
    name: c.name,
    collaborators: c.collaborators,
    collaboratorsLength: c.collaborators?.length || 0
  })));
  const userLocation = restaurantsData?.userLocation;
  
  const user = authData?.user;
  const isAuthenticated = authData?.isAuthenticated || false;

  // Ensure collections is always an array
  const safeCollections = Array.isArray(collections) ? collections : [];
  
  // Debug: Check what's in safeCollections
  console.log('[HomeScreen] safeCollections data:', safeCollections.map((c: any) => ({
    name: c.name,
    collaborators: c.collaborators,
    collaboratorsLength: c.collaborators?.length || 0
  })));
  


  // Get current city configuration
  const cityConfig = currentCity === 'nyc' ? NYC_CONFIG : LA_CONFIG;
  
  // Filter restaurants for the current city
  const cityRestaurants = useMemo(() => {
    const filtered = (restaurants || []).filter(r => {
      if (!r) return false;
      
      // Primary filter: Use city and state for most accurate filtering
      if (r.city && r.state) {
        if (currentCity === 'nyc' && r.city === 'New York' && r.state === 'NY') {
          return true;
        }
        if (currentCity === 'la' && r.city === 'Los Angeles' && r.state === 'CA') {
          return true;
        }
      }
      
      // Secondary filter: Use restaurant_code for city identification
      if (r.restaurant_code) {
        if (currentCity === 'nyc' && r.restaurant_code.startsWith('nyc-')) {
          return true;
        }
        if (currentCity === 'la' && r.restaurant_code.startsWith('la-')) {
          return true;
        }
      }
      
      // Fallback filter: Use neighborhood and address patterns
      const neighborhood = (r.neighborhood || '').toLowerCase();
      const address = (r.address || '').toLowerCase();
      return cityConfig.filterPattern.test(neighborhood) || cityConfig.filterPattern.test(address);
    });
    
    console.log(`[HomeScreen] ${cityConfig.name} filtering:`, {
      totalRestaurants: restaurants?.length || 0,
      filteredRestaurants: filtered.length,
      filterPattern: cityConfig.filterPattern.toString(),
      currentCity
    });
    

    
    return filtered;
  }, [restaurants, cityConfig.filterPattern, currentCity]);

  // Helper function to get unique restaurants for different carousels
  const getUniqueRestaurantsForCarousel = useCallback((allRestaurants: any[], startIndex: number, count: number, excludeIds: string[] = []) => {
    const filteredRestaurants = allRestaurants.filter((restaurant: any) => !excludeIds.includes(restaurant.id));
    return filteredRestaurants.slice(startIndex, startIndex + count);
  }, []);

  // City-specific restaurant sections with flexible distribution
  const trendingRestaurants = useMemo(() => {
    return cityRestaurants.slice(0, Math.min(6, cityRestaurants.length));
  }, [cityRestaurants]);
  
  const newRestaurants = useMemo(() => {
    const trendingIds = trendingRestaurants.map((r: any) => r.id);
    const availableRestaurants = cityRestaurants.filter((r: any) => !trendingIds.includes(r.id));
    return availableRestaurants.slice(0, Math.min(4, availableRestaurants.length));
  }, [cityRestaurants, trendingRestaurants]);
  
  const localHighlights = useMemo(() => {
    const usedIds = [...trendingRestaurants.map((r: any) => r.id), ...newRestaurants.map((r: any) => r.id)];
    const availableRestaurants = cityRestaurants.filter((r: any) => !usedIds.includes(r.id));
    return availableRestaurants.slice(0, Math.min(4, availableRestaurants.length));
  }, [cityRestaurants, trendingRestaurants, newRestaurants]);
  
  // Convert plans to collections format for display
  const planCollections: Collection[] = useMemo(() => {
    console.log('[HomeScreen] planCollections mapping - input safeCollections:', safeCollections.map((c: any) => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0,
      memberCount: (c as any).memberCount
    })));
    
    return safeCollections.map(plan => {
      const mappedCollection = {
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
        updated_at: plan.updated_at,
        // Preserve the memberCount that was calculated in the store
        memberCount: (plan as any).memberCount
      };
      
      console.log(`[HomeScreen] planCollections mapping - "${plan.name}":`, {
        inputCollaborators: (plan as any).collaborators,
        inputCollaboratorsLength: (plan as any).collaborators?.length || 0,
        inputMemberCount: (plan as any).memberCount,
        outputCollaborators: mappedCollection.collaborators,
        outputCollaboratorsLength: mappedCollection.collaborators?.length || 0,
        outputMemberCount: mappedCollection.memberCount
      });
      
      return mappedCollection;
    });
  }, [safeCollections]);
  
  const displayCollections = useMemo(() => {
    // For logged out users, use city-specific mock collections
    if (!isAuthenticated) {
      return cityConfig.mockCollections;
    }
    
    // Don't filter if we don't have restaurant data yet
    if (!restaurants || restaurants.length === 0) {
      console.log(`[HomeScreen] No restaurants loaded yet, skipping collection filtering`);
      return [];
    }
    
    // Filter collections based on the cities of restaurants inside them
    const cityFilteredCollections = filterCollectionsByCity(planCollections, restaurants, currentCity);
    
    // Get collection statistics
    const stats = getCollectionStats(planCollections, restaurants, currentCity);
    
    console.log(`[HomeScreen] Collection filtering for ${currentCity}:`, {
      totalCollections: stats.totalCollections,
      cityFilteredCollections: stats.cityFilteredCollections,
      totalRestaurants: stats.totalRestaurants,
      averageRestaurantsPerCollection: stats.averageRestaurantsPerCollection,
      currentCity,
      restaurantsLoaded: restaurants.length
    });
    

    
    return cityFilteredCollections;
  }, [planCollections, isAuthenticated, cityConfig.mockCollections, restaurants, currentCity]);
  
  const popularCollections = useMemo(() => {
    console.log('[HomeScreen] popularCollections processing - input displayCollections:', displayCollections?.map((c: any) => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0,
      memberCount: (c as any).memberCount,
      likes: c.likes
    })));
    
    const sorted = (displayCollections || []).sort((a, b) => b.likes - a.likes);
    const sliced = sorted.slice(0, 4);
    
    console.log('[HomeScreen] popularCollections processing - output:', sliced.map((c: any) => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0,
      memberCount: (c as any).memberCount,
      likes: c.likes
    })));
    
    return sliced;
  }, [displayCollections]);
  
  // Load Mapbox restaurants for the city
  useEffect(() => {
    // For logged out users, use city database restaurants
    if (!isAuthenticated) {
      setMapboxRestaurants(cityRestaurants);
      // Use unique restaurants for nearby section
      const usedIds = [...trendingRestaurants.map((r: any) => r.id), ...newRestaurants.map((r: any) => r.id), ...localHighlights.map((r: any) => r.id)];
      const availableRestaurants = cityRestaurants.filter((r: any) => !usedIds.includes(r.id));
      const nearbyRestaurants = availableRestaurants.slice(0, Math.min(4, availableRestaurants.length));
      setNearbyRestaurants(nearbyRestaurants);
      return;
    }

    // For web platform, use city database restaurants
    if (Platform.OS === 'web') {
      setMapboxRestaurants(cityRestaurants);
      const usedIds = [...trendingRestaurants.map((r: any) => r.id), ...newRestaurants.map((r: any) => r.id), ...localHighlights.map((r: any) => r.id)];
      const availableRestaurants = cityRestaurants.filter((r: any) => !usedIds.includes(r.id));
      const nearbyRestaurants = availableRestaurants.slice(0, Math.min(4, availableRestaurants.length));
      setNearbyRestaurants(nearbyRestaurants);
      return;
    }

    if (!userLocation) return;

    const loadRealRestaurants = async () => {
      try {
        const { lat, lng } = cityConfig.coordinates;
        
        console.log(`[HomeScreen] Loading ${cityConfig.name} restaurants for location:`, lat, lng);
        
        // Try multiple APIs to get the best restaurant data
        const allRestaurants: any[] = [];
        
        // 1. Try Mapbox first
        try {
          const mapboxResults = await getMapboxNearbyRestaurants(lat, lng, 5000, 20);
          const transformedMapbox = mapboxResults.map(transformMapboxToRestaurant).filter(Boolean);
          allRestaurants.push(...transformedMapbox);
          console.log(`[HomeScreen] Loaded`, transformedMapbox.length, 'Mapbox restaurants');
        } catch (error) {
          console.error(`[HomeScreen] Mapbox API error:`, error);
        }
        
        // 2. Use city restaurants as fallback
        if (allRestaurants.length === 0 && cityRestaurants.length > 0) {
          allRestaurants.push(...cityRestaurants);
          console.log(`[HomeScreen] Using ${cityConfig.name} restaurants as fallback:`, cityRestaurants.length);
        }
        
        let uniqueResults = deduplicateRestaurants(allRestaurants).slice(0, 20);
        
        if (uniqueResults.length === 0 && cityRestaurants.length > 0) {
          uniqueResults = cityRestaurants.slice(0, 20);
          console.log(`[HomeScreen] Using ${cityConfig.name} restaurants as final fallback:`, uniqueResults.length);
        }
        
        setMapboxRestaurants(uniqueResults);
        setNearbyRestaurants(uniqueResults.slice(0, 4));
        
        console.log(`[HomeScreen] Total loaded ${cityConfig.name} restaurants:`, uniqueResults.length);
      } catch (error) {
        console.error(`[HomeScreen] Error loading ${cityConfig.name} restaurants:`, error);
        const localRestaurants = cityRestaurants.slice(0, 4);
        setNearbyRestaurants(localRestaurants);
        setMapboxRestaurants(cityRestaurants);
        console.log(`[HomeScreen] Error fallback - using ${cityConfig.name} restaurants:`, cityRestaurants.length);
      }
    };

    loadRealRestaurants();
  }, [userLocation, cityRestaurants, cityConfig]);

  // Check if hooks are properly initialized
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
  
  const handleCityToggle = () => {
            switchToCity(currentCity === 'nyc' ? 'la' : 'nyc');
  };

  // Render sections based on city configuration
  const renderLocalSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Navigation size={20} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>Local {cityConfig.name} Restaurants</Text>
        <TouchableOpacity onPress={() => router.push('/discover' as any)}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {nearbyLoading ? (
        <View style={styles.nearbyLoadingContainer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.nearbyLoadingText}>
            Loading {cityConfig.name} restaurants...
          </Text>
        </View>
      ) : nearbyRestaurants.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {nearbyRestaurants.map(restaurant => (
            <View key={restaurant.id} style={styles.cardWrapper}>
              <RestaurantCard
                restaurant={restaurant}
                onPress={() => {
                  addRestaurantToStore(restaurant);
                  router.push(`/restaurant/${restaurant.id}` as any);
                }}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.nearbyEmptyContainer}>
          <Text style={styles.nearbyEmptyText}>No {cityConfig.name} restaurants found</Text>
          <Text style={styles.nearbyEmptySubtext}>Try refreshing the app</Text>
        </View>
      )}
    </View>
  );

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TrendingUp size={20} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>Trending in {cityConfig.name}</Text>
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
                addRestaurantToStore(restaurant);
                router.push(`/restaurant/${restaurant.id}` as any);
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderNewSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Sparkles size={20} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>New & Notable in {cityConfig.name}</Text>
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
                addRestaurantToStore(restaurant);
                router.push(`/restaurant/${restaurant.id}` as any);
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderNeighborhoodSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MapPin size={20} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>{cityConfig.name} Neighborhoods</Text>
        <TouchableOpacity onPress={() => router.push('/discover' as any)}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.localGrid}>
        {isLoading ? (
          <View style={styles.nearbyEmptyContainer}>
            <ActivityIndicator size="small" color="#FF6B6B" />
            <Text style={styles.nearbyEmptyText}>Loading {cityConfig.name} neighborhoods...</Text>
          </View>
        ) : cityRestaurants.length > 0 ? (
          (() => {
            // Use only cityRestaurants for neighborhood counting
            const neighborhoodCounts = cityRestaurants.reduce((acc, restaurant) => {
              const neighborhood = restaurant.neighborhood;
              if (neighborhood) {
                acc[neighborhood] = (acc[neighborhood] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);
            
            // Get top 4 neighborhoods, but if we don't have 4 with multiple restaurants, 
            // include neighborhoods with at least 1 restaurant
            let topNeighborhoods = Object.entries(neighborhoodCounts)
              .filter(([, count]) => (count as number) >= 2)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 4);
            
            // If we don't have 4 neighborhoods with 2+ restaurants, add neighborhoods with 1 restaurant
            if (topNeighborhoods.length < 4) {
              const singleRestaurantNeighborhoods = Object.entries(neighborhoodCounts)
                .filter(([, count]) => (count as number) === 1)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 4 - topNeighborhoods.length);
              
              topNeighborhoods = [...topNeighborhoods, ...singleRestaurantNeighborhoods];
            }
            
            const finalNeighborhoods = topNeighborhoods
              .slice(0, 4)
              .map(([neighborhood, count]) => ({ neighborhood, count }));
            
            return finalNeighborhoods.map(({ neighborhood, count }) => {
              const imageUrl = cityConfig.neighborhoodImages[neighborhood] || cityConfig.neighborhoodImages['default'] || 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400';
              
              return (
                <TouchableOpacity 
                  key={neighborhood} 
                  style={styles.localCard}
                  onPress={() => {
                    router.push(`/discover?neighborhood=${encodeURIComponent(neighborhood)}` as any);
                  }}
                >
                  <Image
                    source={{ uri: imageUrl }}
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
              );
            });
          })()
        ) : (
          <View style={styles.nearbyEmptyContainer}>
            <Text style={styles.nearbyEmptyText}>No {cityConfig.name} neighborhoods found</Text>
            <Text style={styles.nearbyEmptySubtext}>Try refreshing the app</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderCollectionsSection = () => (
    <View style={styles.section}>
              <View style={styles.sectionHeader}>
          <BookOpen size={20} color="#FF6B6B" />
          <TouchableOpacity 
            style={styles.sectionTitleContainer}
            onLongPress={() => router.push('/collections' as any)}
            onPress={() => router.push('/collections' as any)}
          >
            <Text style={styles.sectionTitle}>{cityConfig.name} Collections</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/collections' as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading collections...</Text>
        </View>
      ) : displayCollections.length > 0 ? (
        <>
          <Text style={styles.sectionSubtitle}>
            Collections with {getCityDisplayName(currentCity)} restaurants
          </Text>
          <View style={styles.collectionsGrid}>
            {displayCollections.map(collection => {
              console.log(`[HomePage] Rendering CollectionCard for "${collection.name}":`, {
                collaborators: collection.collaborators,
                collaboratorsLength: collection.collaborators?.length || 0,
                memberCount: (collection as any).memberCount
              });
              
              // Create a deep copy to prevent mutation issues
              const collectionCopy = {
                ...collection,
                collaborators: [...(collection.collaborators || [])],
                restaurant_ids: [...(collection.restaurant_ids || [])]
              };
              
              console.log(`[HomePage] Collection copy for "${collection.name}":`, {
                collaborators: collectionCopy.collaborators,
                collaboratorsLength: collectionCopy.collaborators?.length || 0,
                memberCount: (collectionCopy as any).memberCount
              });
              
              return (
                <CollectionCard
                  key={collection.id}
                  collection={collectionCopy as Collection}
                  onPress={() => {
                    console.log(`[HomePage] Clicking collection "${collection.name}" with ${collection.collaborators?.length || 0} collaborators`);
                    if (collection.id.startsWith(`${cityConfig.shortName.toLowerCase()}-mock-`)) {
                      router.push('/create-collection' as any);
                    } else {
                      router.push(`/collection/${collection.id}` as any);
                    }
                  }}
                />
              );
            })}
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>
          No collections found for {getCityDisplayName(currentCity)}
        </Text>
      )}
    </View>
  );

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
              <Text style={styles.greeting}>{cityConfig.greeting}</Text>
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
          <Text style={styles.subtitle}>{cityConfig.subtitle}</Text>
          
          {/* City Toggle */}
          <View style={styles.cityToggleContainer}>
            <TouchableOpacity 
              style={[styles.cityToggleButton, currentCity === 'nyc' && styles.cityToggleButtonActive]}
              onPress={() => switchToCity('nyc')}
            >
              <Text style={[styles.cityToggleText, currentCity === 'nyc' && styles.cityToggleTextActive]}>NYC</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cityToggleButton, currentCity === 'la' && styles.cityToggleButtonActive]}
              onPress={() => switchToCity('la')}
            >
              <Text style={[styles.cityToggleText, currentCity === 'la' && styles.cityToggleTextActive]}>LA</Text>
            </TouchableOpacity>
        </View>

          <SearchWizard testID="search-wizard" />
        </View>

        {/* Render sections based on city configuration */}
        {cityConfig.sectionOrder === 'localFirst' ? (
          <>
            {renderLocalSection()}
            {renderTrendingSection()}
            {renderNewSection()}
            {renderNeighborhoodSection()}
          </>
        ) : (
          <>
            {renderTrendingSection()}
            {renderNewSection()}
            {renderNeighborhoodSection()}
            {renderLocalSection()}
          </>
        )}

        {renderCollectionsSection()}

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
  cityToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  cityToggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  cityToggleButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  cityToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cityToggleTextActive: {
    color: '#FFF',
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
  sectionTitleContainer: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
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