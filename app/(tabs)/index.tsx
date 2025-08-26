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


export default function HomeScreen() {
  // Initialize hooks with proper error handling - MUST be at the top
  const restaurantsData = useRestaurants();
  const authData = useAuth();
  
  // Destructure with defaults and null checks
  const { restaurants = [], collections = [], isLoading = false, userLocation, switchToCity } = restaurantsData || {};
  const { user, isAuthenticated = false } = authData || {};
  
  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

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
  }, [cityRestaurants, restaurants]);

  const trendingRestaurants = useMemo(() => availableRestaurants.slice(0, 6), [availableRestaurants]);
  
  // Convert plans to collections format for display
  const planCollections: Collection[] = useMemo(() => safeCollections.map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || 'A collaborative dining plan',
    cover_image: plan.cover_image || 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
    created_by: plan.created_by,
    creator_id: plan.creator_id,
    occasion: plan.occasion,
    is_public: plan.is_public,
    likes: plan.likes || 0,
    equal_voting: plan.equal_voting,
    admin_weighted: plan.admin_weighted,
    expertise_weighted: plan.expertise_weighted,
    minimum_participation: plan.minimum_participation,
    voting_deadline: plan.voting_deadline,
    allow_vote_changes: plan.allow_vote_changes,
    anonymous_voting: plan.anonymous_voting,
    vote_visibility: plan.vote_visibility,
    discussion_enabled: plan.discussion_enabled,
    auto_ranking_enabled: plan.auto_ranking_enabled,
    consensus_threshold: plan.consensus_threshold,
    restaurant_ids: plan.restaurant_ids || [],
    collaborators: plan.collaborators || [],
    created_at: plan.created_at,
    updated_at: plan.updated_at
  })), [safeCollections]);
  
  const displayCollections = useMemo(() => planCollections || [], [planCollections]);
  const popularCollections = useMemo(() => (displayCollections || []).sort((a, b) => b.likes - a.likes).slice(0, 4), [displayCollections]);
  const newRestaurants = useMemo(() => availableRestaurants.slice(6, 10), [availableRestaurants]);
  const localHighlights = useMemo(() => availableRestaurants.slice(0, 4), [availableRestaurants]);

  // Show local restaurants
  useEffect(() => {
    const loadLocalRestaurants = () => {
      setNearbyLoading(true);
      try {
        // Always show local restaurants from available data
        const localRestaurants = availableRestaurants.slice(0, 4);
        setNearbyRestaurants(localRestaurants);
        console.log('[HomeScreen] Loaded', localRestaurants.length, 'local restaurants');
      } catch (error) {
        console.error('[HomeScreen] Error loading local restaurants:', error);
        setNearbyRestaurants([]);
      } finally {
        setNearbyLoading(false);
      }
    };

    loadLocalRestaurants();
  }, [availableRestaurants]);

  // Debug logging with error handling
  try {
    console.log('[HomeScreen] User authenticated:', isAuthenticated);
    console.log('[HomeScreen] User ID:', user?.id);
    console.log('[HomeScreen] Collections count:', collections?.length || 0);
    console.log('[HomeScreen] Collections data:', collections?.map(c => ({ id: c.id, name: c.name, created_by: c.created_by, is_public: c.is_public })));
    console.log('[HomeScreen] Is loading:', isLoading);
    console.log('[HomeScreen] Nearby restaurants:', nearbyRestaurants.length);
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
                  onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
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
                  onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Local Restaurants Section */}
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
              <Text style={styles.nearbyLoadingText}>Loading local restaurants...</Text>
            </View>
          ) : nearbyRestaurants.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {nearbyRestaurants.map(restaurant => (
                <View key={restaurant.id} style={styles.cardWrapper}>
                  <RestaurantCard
                    restaurant={restaurant}
                    onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>{city} Highlights</Text>
            <TouchableOpacity onPress={() => router.push('/discover' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.localGrid}>
            {localHighlights.map(restaurant => (
              <TouchableOpacity 
                key={restaurant.id} 
                style={styles.localCard}
                onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
              >
                <Image source={{ uri: restaurant.imageUrl }} style={styles.localImage} />
                <View style={styles.localOverlay}>
                  <Text style={styles.localName} numberOfLines={1}>{restaurant.name}</Text>
                  <Text style={styles.localNeighborhood}>{restaurant.neighborhood}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>



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