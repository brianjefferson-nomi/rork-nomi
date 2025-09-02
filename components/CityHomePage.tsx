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
import { usePexelsImage } from '@/hooks/use-pexels-images';
import { PexelsImageComponent } from '@/components/PexelsImage';
import { isMember } from '@/utils/member-helpers';

interface CityConfig {
  name: string;
  shortName: string;
  coordinates: { lat: number; lng: number };
  filterPattern: RegExp;
  greeting: string;
  subtitle: string;
  neighborhoodImages: Record<string, string>;
  mockCollections: Collection[];
  sectionOrder: 'localFirst' | 'trendingFirst';
}

interface CityHomePageProps {
  cityConfig: CityConfig;
}

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
        <Text style={styles.localNeighborhood}>
          {count} restaurant{count !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CityHomePage({ cityConfig }: CityHomePageProps) {
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
  const { followCollection, unfollowCollection } = restaurantsData;
  
  const user = authData?.user;
  const isAuthenticated = authData?.isAuthenticated || false;

  // Ensure collections is always an array
  const safeCollections = Array.isArray(collections) ? collections : [];

  // Filter restaurants for the specific city
  const cityRestaurants = useMemo(() => {
    return (restaurants || []).filter(r => {
      if (!r) return false;
      const address = (r.address || r.neighborhood || 'Unknown').toLowerCase();
      return cityConfig.filterPattern.test(address);
    });
  }, [restaurants, cityConfig.filterPattern]);

  // Helper function to get unique restaurants for different carousels
  const getUniqueRestaurantsForCarousel = useCallback((allRestaurants: any[], startIndex: number, count: number, excludeIds: string[] = []) => {
    const filteredRestaurants = allRestaurants.filter((restaurant: any) => !excludeIds.includes(restaurant.id));
    return filteredRestaurants.slice(startIndex, startIndex + count);
  }, []);

  // City-specific restaurant sections
  const trendingRestaurants = useMemo(() => {
    return cityRestaurants.slice(0, 6);
  }, [cityRestaurants]);
  
  const newRestaurants = useMemo(() => {
    const trendingIds = cityRestaurants.slice(0, 6).map((r: any) => r.id);
    return getUniqueRestaurantsForCarousel(cityRestaurants, 6, 4, trendingIds);
  }, [cityRestaurants, getUniqueRestaurantsForCarousel]);
  
  const localHighlights = useMemo(() => {
    const trendingIds = cityRestaurants.slice(0, 6).map((r: any) => r.id);
    const newIds = cityRestaurants.slice(6, 10).map((r: any) => r.id);
    const excludeIds = [...trendingIds, ...newIds];
    return getUniqueRestaurantsForCarousel(cityRestaurants, 10, 4, excludeIds);
  }, [cityRestaurants, getUniqueRestaurantsForCarousel]);

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

  const displayCollections = useMemo(() => {
    // For logged out users, use city-specific mock collections
    if (!isAuthenticated) {
      return cityConfig.mockCollections;
    }
    return planCollections || [];
  }, [planCollections, isAuthenticated, cityConfig.mockCollections]);
  
  const popularCollections = useMemo(() => (displayCollections || []).sort((a, b) => b.likes - a.likes).slice(0, 4), [displayCollections]);

  // Load Mapbox restaurants for the city
  useEffect(() => {
    // For logged out users, use city database restaurants
    if (!isAuthenticated) {
      setMapboxRestaurants(cityRestaurants);
      // Use unique restaurants for nearby section
      const trendingIds = cityRestaurants.slice(0, 6).map((r: any) => r.id);
      const newIds = cityRestaurants.slice(6, 10).map((r: any) => r.id);
      const localIds = cityRestaurants.slice(10, 14).map((r: any) => r.id);
      const excludeIds = [...trendingIds, ...newIds, ...localIds];
      const nearbyRestaurants = getUniqueRestaurantsForCarousel(cityRestaurants, 14, 4, excludeIds);
      setNearbyRestaurants(nearbyRestaurants);
      return;
    }

    // For web platform, use city database restaurants
    if (Platform.OS === 'web') {
      setMapboxRestaurants(cityRestaurants);
      const trendingIds = cityRestaurants.slice(0, 6).map((r: any) => r.id);
      const newIds = cityRestaurants.slice(6, 10).map((r: any) => r.id);
      const localIds = cityRestaurants.slice(10, 14).map((r: any) => r.id);
      const excludeIds = [...trendingIds, ...newIds, ...localIds];
      const nearbyRestaurants = getUniqueRestaurantsForCarousel(cityRestaurants, 14, 4, excludeIds);
      setNearbyRestaurants(nearbyRestaurants);
      return;
    }

    if (!userLocation) return;

    const loadRealRestaurants = async () => {
      try {
        const { lat, lng } = cityConfig.coordinates;
        
        console.log(`[${cityConfig.name}HomePage] Loading ${cityConfig.name} restaurants for location:`, lat, lng);
        
        // Try multiple APIs to get the best restaurant data
        const allRestaurants: any[] = [];
        
        // 1. Try Mapbox first
        try {
          const mapboxResults = await getMapboxNearbyRestaurants(lat, lng, 5000, 20);
          const transformedMapbox = mapboxResults.map(transformMapboxToRestaurant).filter(Boolean);
          allRestaurants.push(...transformedMapbox);
          console.log(`[${cityConfig.name}HomePage] Loaded`, transformedMapbox.length, 'Mapbox restaurants');
        } catch (error) {
          console.error(`[${cityConfig.name}HomePage] Mapbox API error:`, error);
        }
        
        // 2. Use city restaurants as fallback
        if (allRestaurants.length === 0 && cityRestaurants.length > 0) {
          allRestaurants.push(...cityRestaurants);
          console.log(`[${cityConfig.name}HomePage] Using ${cityConfig.name} restaurants as fallback:`, cityRestaurants.length);
        }
        
        let uniqueResults = deduplicateRestaurants(allRestaurants).slice(0, 20);
        
        if (uniqueResults.length === 0 && cityRestaurants.length > 0) {
          uniqueResults = cityRestaurants.slice(0, 20);
          console.log(`[${cityConfig.name}HomePage] Using ${cityConfig.name} restaurants as final fallback:`, uniqueResults.length);
        }
        
        setMapboxRestaurants(uniqueResults);
        setNearbyRestaurants(uniqueResults.slice(0, 4));
        
        console.log(`[${cityConfig.name}HomePage] Total loaded ${cityConfig.name} restaurants:`, uniqueResults.length);
      } catch (error) {
        console.error(`[${cityConfig.name}HomePage] Error loading ${cityConfig.name} restaurants:`, error);
        const localRestaurants = cityRestaurants.slice(0, 4);
        setNearbyRestaurants(localRestaurants);
        setMapboxRestaurants(cityRestaurants);
        console.log(`[${cityConfig.name}HomePage] Error fallback - using ${cityConfig.name} restaurants:`, cityRestaurants.length);
      }
    };

    loadRealRestaurants();
  }, [userLocation, cityRestaurants, cityConfig]);

  // Check if hooks are properly initialized
  if (!restaurantsData || !authData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Initializing {cityConfig.name}...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading {cityConfig.name}...</Text>
      </View>
    );
  }

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
            const allRestaurants = [...cityRestaurants, ...mapboxRestaurants];
            const uniqueRestaurants = deduplicateRestaurants(allRestaurants);
            
            const neighborhoodCounts = uniqueRestaurants.reduce((acc, restaurant) => {
              const neighborhood = restaurant.neighborhood;
              if (neighborhood) {
                acc[neighborhood] = (acc[neighborhood] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);
            
            const topNeighborhoods = Object.entries(neighborhoodCounts)
              .filter(([, count]) => (count as number) >= 2)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 4)
              .map(([neighborhood, count]) => ({ neighborhood, count }));
            
            return topNeighborhoods.map(({ neighborhood, count }) => (
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
        <Text style={styles.sectionTitle}>{cityConfig.name} Popular Plans</Text>
        <TouchableOpacity onPress={() => router.push('/lists' as any)}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.collectionsGrid}>
        {popularCollections.map(collection => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            showFollowButton={true}
            isUserMember={isMember(user?.id || '', collection.collaborators || [])}
            onFollowToggle={async (collectionId: string, isFollowing: boolean) => {
              try {
                if (isFollowing) {
                  await unfollowCollection(collectionId);
                } else {
                  await followCollection(collectionId);
              }
            } catch (error) {
              console.error('[CityHomePage] Error toggling collection follow:', error);
            }
          }}
            onPress={() => {
              if (collection.id.startsWith(`${cityConfig.shortName.toLowerCase()}-mock-`)) {
                router.push('/create-collection' as any);
              } else {
                router.push(`/collection/${collection.id}` as any);
              }
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: cityConfig.name,
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
