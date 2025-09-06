import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, Animated } from 'react-native';
import { router, Stack } from 'expo-router';
import { TrendingUp, Users, MapPin, Sparkles, Clock, BookOpen, User, Navigation } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { CollectionCard } from '@/components/CollectionCard';
import { Collection } from '@/types/restaurant';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { SearchWizard } from '@/components/SearchWizard';
import NearbyRestaurants from '@/components/NearbyRestaurants';
import { 
  TrendingRestaurantsComponent, 
  NewAndNotableComponent 
} from '@/components/HomePageRestaurantComponents';
import { searchMapboxRestaurants, getMapboxNearbyRestaurants, transformMapboxToRestaurant, searchFoursquareRestaurants, deduplicateRestaurants } from '@/services/api';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';
import { filterCollectionsByCity, getCityDisplayName, getCollectionStats } from '@/utils/collection-filtering';
import { usePexelsImage } from '@/hooks/use-pexels-images';
import { PexelsImageComponent } from '@/components/PexelsImage';
import { isMember } from '@/utils/member-helpers';
import { HomeScreenSkeleton } from '@/components/SkeletonComponents';
import { FadeInView, ScaleInView, BounceInView } from '@/components/AnimatedContent';
import { ProgressiveLoader, ProgressiveRestaurantList, ProgressiveCollectionList, ProgressiveNeighborhoodList, ProgressiveSection } from '@/components/ProgressiveLoader';

type CityKey = 'nyc' | 'la';

// Neighborhood card component with Pexels images
function NeighborhoodCard({ neighborhood, count, cityName, onPress }: {
  neighborhood: string;
  count: number;
  cityName: string;
  onPress: () => void;
}) {
  const { image: pexelsImage, isLoading: imageLoading, error: imageError } = usePexelsImage(
    neighborhood,
    'neighborhood',
    { city: cityName }
  );

  return (
    <TouchableOpacity style={styles.localCard} onPress={onPress}>
      <PexelsImageComponent
        image={pexelsImage}
        isLoading={imageLoading}
        error={imageError}
        style={styles.localImage}
        fallbackSource={{ 
          uri: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' 
        }}
        showLoadingIndicator={false}
      />
      <View style={styles.localOverlay}>
        <Text style={styles.localName} numberOfLines={1}>{neighborhood}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  // Initialize hooks with proper error handling - MUST be at the top
  const restaurantsData = useRestaurants();
  const authData = useAuth();
  
  // Animated value for city toggle sliding
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  
  // Destructure addRestaurantToStore from the store
  const { addRestaurantToStore } = restaurantsData;
  
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [mapboxRestaurants, setMapboxRestaurants] = useState<any[]>([]);
  
  // Use shared currentCity from store
  const { currentCity, switchToCity } = restaurantsData;
  
  // Update animation when city changes
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentCity === 'nyc' ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();
    
    // Reset used restaurants when city changes to prevent duplicates
  }, [currentCity, slideAnim]);

  // Destructure with defaults and null checks - ensure these are always defined
  const restaurants = restaurantsData?.restaurants || [];
  const collections = restaurantsData?.allCollections || []; // Use allCollections (public only) instead of collections (user plans)
  const isLoading = restaurantsData?.isLoading || false;
  const { followCollection, unfollowCollection } = restaurantsData;
  
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
  
  // Function to get restaurants for a specific section with offset
  const getRestaurantsForSection = useCallback((restaurants: any[], sectionIndex: number, maxPerSection: number = 8) => {
    const startIndex = sectionIndex * maxPerSection;
    return restaurants.slice(startIndex, startIndex + maxPerSection);
  }, []);
  
  // Debug: Check what's in safeCollections
  console.log('[HomeScreen] safeCollections data:', safeCollections.map((c: any) => ({
    name: c.name,
    collaborators: c.collaborators,
    collaboratorsLength: c.collaborators?.length || 0
  })));
  


  // Get current city configuration
  const cityConfig = currentCity === 'nyc' ? NYC_CONFIG : LA_CONFIG;
  
  // Debug: Log current city state
  console.log('[HomePage] Current city state:', {
    currentCity,
    cityConfigName: cityConfig.name,
    totalRestaurants: restaurants?.length || 0,
    restaurantsLoaded: !!restaurants
  });
  
  // Filter restaurants for the current city
  const cityRestaurants = useMemo(() => {
    const filtered = (restaurants || []).filter(r => {
      if (!r) return false;
      
      // Primary filter: Use city and state for most accurate filtering
      if (r.city && r.state) {
        if (currentCity === 'nyc' && r.state === 'NY') {
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
    

    
    console.log(`[HomePage] City filtering - ${currentCity}:`, {
      totalRestaurants: restaurants?.length || 0,
      filteredRestaurants: filtered.length,
      sampleRestaurants: filtered.slice(0, 3).map(r => ({
        name: r.name,
        city: r.city,
        state: r.state,
        restaurant_code: r.restaurant_code,
        neighborhood: r.neighborhood,
        address: r.address
      }))
    });
    
    return filtered;
  }, [restaurants, cityConfig.filterPattern, currentCity]);

  // Helper function to get unique restaurants for different carousels
  const getUniqueRestaurantsForCarousel = useCallback((allRestaurants: any[], startIndex: number, count: number, excludeIds: string[] = []) => {
    const filteredRestaurants = allRestaurants.filter((restaurant: any) => !excludeIds.includes(restaurant.id));
    return filteredRestaurants.slice(startIndex, startIndex + count);
  }, []);

  // Restaurant press handler with engagement tracking
  const handleRestaurantPress = async (restaurant: any) => {
    try {
      // Add to store and navigate
      addRestaurantToStore(restaurant);
      router.push(`/restaurant/${restaurant.id}` as any);
    } catch (error) {
      console.error('Error navigating to restaurant:', error);
      // Still navigate even if there's an error
      addRestaurantToStore(restaurant);
      router.push(`/restaurant/${restaurant.id}` as any);
    }
  };
  
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
      const nearbyRestaurants = cityRestaurants.slice(0, Math.min(4, cityRestaurants.length));
      setNearbyRestaurants(nearbyRestaurants);
      return;
    }

    // For web platform, use city database restaurants
    if (Platform.OS === 'web') {
      setMapboxRestaurants(cityRestaurants);
      const nearbyRestaurants = cityRestaurants.slice(0, Math.min(4, cityRestaurants.length));
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
    return <HomeScreenSkeleton />;
  }

  // Show skeleton while loading, but allow content to render progressively
  const showSkeleton = isLoading && restaurants.length === 0 && collections.length === 0;
  
  const handleCityToggle = () => {
    switchToCity(currentCity === 'nyc' ? 'la' : 'nyc');
  };

  // Show skeleton if no content is available yet
  if (showSkeleton) {
    return <HomeScreenSkeleton />;
  }

  // Render sections based on city configuration


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
            
            // Debug: Log neighborhood counts
            console.log('[HomePage] Neighborhood counts:', neighborhoodCounts);
            
            // Debug: Show all Brooklyn restaurants
            const brooklynRestaurants = cityRestaurants.filter(r => r.neighborhood === 'Brooklyn');
            console.log('[HomePage] Brooklyn restaurants:', brooklynRestaurants.map(r => ({
              name: r.name,
              neighborhood: r.neighborhood,
              city: r.city,
              state: r.state,
              restaurant_code: r.restaurant_code
            })));
            
            // Debug: Check for NYC restaurants in all data
            const allNYCRestaurants = restaurants?.filter(r => 
              r.city === 'New York' || 
              r.state === 'NY' || 
              r.restaurant_code?.startsWith('nyc-') ||
              r.neighborhood === 'Brooklyn' ||
              r.neighborhood === 'Manhattan'
            ) || [];
            console.log('[HomePage] All NYC restaurants found:', allNYCRestaurants.length, allNYCRestaurants.map(r => ({
              name: r.name,
              neighborhood: r.neighborhood,
              city: r.city,
              state: r.state,
              restaurant_code: r.restaurant_code
            })));
            
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
            
            return finalNeighborhoods.map(({ neighborhood, count }) => (
              <NeighborhoodCard
                key={neighborhood}
                neighborhood={neighborhood}
                count={count as number}
                cityName={cityConfig.name}
                onPress={() => {
                  router.push(`/discover?neighborhood=${encodeURIComponent(neighborhood)}` as any);
                }}
              />
            ));
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
      ) : popularCollections.length > 0 ? (
        <>
          <Text style={styles.sectionSubtitle}>
            Top collections with {getCityDisplayName(currentCity)} restaurants
          </Text>
          <View style={styles.collectionsGrid}>
            {popularCollections.map(collection => {
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
                <View key={collection.id} style={styles.collectionCardWrapper}>
                  <CollectionCard
                    collection={collectionCopy as Collection}
                    showFollowButton={true}
                    isUserMember={isMember(user?.id || '', collection.collaborators || [])}
                    isUserCreator={collection.created_by === user?.id}
                    onFollowToggle={async (collectionId: string, isFollowing: boolean) => {
                    try {
                      if (isFollowing) {
                        await unfollowCollection(collectionId);
                      } else {
                        await followCollection(collectionId);
                      }
                    } catch (error) {
                      console.error('[HomePage] Error toggling collection follow:', error);
                    }
                  }}
                  onPress={() => {
                    console.log(`[HomePage] Clicking collection "${collection.name}" with ${collection.collaborators?.length || 0} collaborators`);
                    if (collection.id.startsWith(`${cityConfig.shortName.toLowerCase()}-mock-`)) {
                      router.push('/create-collection' as any);
                    } else {
                      router.push(`/collection/${collection.id}` as any);
                    }
                  }}
                />
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>
          No top collections found for {getCityDisplayName(currentCity)}
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
        <FadeInView delay={0} duration={600}>
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
          
          {/* Enhanced City Toggle */}
          <View style={styles.cityToggleContainer}>
            <Animated.View 
              style={[
                styles.cityToggleSlider,
                {
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 170] // Match the slider width
                    })
                  }]
                }
              ]}
            />
            <TouchableOpacity 
              style={[styles.cityToggleButton]}
              onPress={() => {
                Animated.spring(slideAnim, {
                  toValue: 0,
                  useNativeDriver: true,
                  tension: 100,
                  friction: 8
                }).start();
                switchToCity('nyc');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.cityToggleText, currentCity === 'nyc' && styles.cityToggleTextActive]}>NYC</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cityToggleButton]}
              onPress={() => {
                Animated.spring(slideAnim, {
                  toValue: 1,
                  useNativeDriver: true,
                  tension: 100,
                  friction: 8
                }).start();
                switchToCity('la');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.cityToggleText, currentCity === 'la' && styles.cityToggleTextActive]}>LA</Text>
            </TouchableOpacity>
          </View>

          <SearchWizard testID="search-wizard" />
          </View>
        </FadeInView>

        {/* Nearby Restaurants based on user location */}
        <FadeInView delay={200} duration={500}>
          <NearbyRestaurants 
            restaurants={restaurants}
            radius={5}
            maxResults={8}
            showDistance={true}
            showWhenEmpty={true}
          />
        </FadeInView>

        {/* New Engagement-Based Restaurant Components */}
        <FadeInView delay={400} duration={500}>
          <TrendingRestaurantsComponent
            userLocation={userLocation}
            currentCity={currentCity}
            onRestaurantPress={handleRestaurantPress}
          />
        </FadeInView>
        
        <FadeInView delay={600} duration={500}>
          <NewAndNotableComponent
            userLocation={userLocation}
            currentCity={currentCity}
            onRestaurantPress={handleRestaurantPress}
          />
        </FadeInView>

        <FadeInView delay={800} duration={500}>
          {renderNeighborhoodSection()}
        </FadeInView>

        <FadeInView delay={1000} duration={500}>
          {renderCollectionsSection()}
        </FadeInView>

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
    position: 'relative',
  },
  cityToggleSlider: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 180,
    height: 32,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    zIndex: 1,
  },
  cityToggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    zIndex: 2,
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
  collectionCardWrapper: {
    marginBottom: 12, // Add spacing back since we removed it from CollectionCard
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