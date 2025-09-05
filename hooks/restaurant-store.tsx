import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
// Removed mock data imports - only use real data from database
import { computeRankings, generateGroupRecommendations } from '@/utils/ranking';
import { aggregateRestaurantData, getUserLocation, getCollectionCoverImage, getEnhancedCollectionCoverImage, getUnsplashCollectionCoverImage, getCollectionCoverImageFallback, searchRestaurantsWithAPI, deduplicateRestaurants } from '@/services/api';
import { dbHelpers, Database, supabase } from '@/services/supabase';



import { useAuth } from '@/hooks/auth-store';
import { getMemberCount, isMember, isCreator } from '@/utils/member-helpers';

type Plan = Database['public']['Tables']['collections']['Row'];

interface RestaurantStore {
  restaurants: Restaurant[];
  plans: Plan[];
  collections: Plan[]; // Alias for plans for backward compatibility
  allCollections: Plan[]; // All public collections for discovery
  userCollections: Plan[]; // User-involved collections (shared and private)
  userVotes: RestaurantVote[];
  discussions: RestaurantDiscussion[];
  favoriteRestaurants: string[];
  isLoading: boolean;
  searchHistory: string[];
  searchResults: Restaurant[];
  userLocation: { city: string; lat: number; lng: number } | null;
  currentCity: 'nyc' | 'la';
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  getQuickSuggestions: () => string[];
  addRestaurantToPlan: (planId: string, restaurantId: string) => Promise<void>;
  removeRestaurantFromPlan: (planId: string, restaurantId: string) => Promise<void>;
  createPlan: (plan: { 
    name: string; 
    description?: string; 
    plannedDate?: string; 
    is_public?: boolean; 
    occasion?: string;
    collection_type?: 'public' | 'private' | 'shared';
  }) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  toggleFavorite: (restaurantId: string) => void;
  voteRestaurant: (restaurantId: string, vote: 'like' | 'dislike', planId?: string, reason?: string) => void;
  addUserNote: (restaurantId: string, note: string) => void;
  addDiscussion: (restaurantId: string, planId: string, message: string) => void;
  getRankedRestaurants: (planId?: string, memberCount?: number) => { 
    restaurants: { restaurant: Restaurant; meta: RankedRestaurantMeta }[];
    participationData?: {
      totalMembers: number;
      totalVotes: number;
      participationRate: number;
      has75PercentParticipation: boolean;
    } | null;
  };
  getRankedRestaurantsWithAllVotes: (planId?: string, memberCount?: number) => Promise<{ 
    restaurants: { restaurant: Restaurant; meta: RankedRestaurantMeta }[];
    participationData?: {
      totalMembers: number;
      totalVotes: number;
      participationRate: number;
      has75PercentParticipation: boolean;
    } | null;
  }>;
  getGroupRecommendations: (planId: string) => GroupRecommendation[];
  getCollectionRestaurants: (collectionId: string) => Restaurant[];
  getCollectionRestaurantsFromDatabase: (collectionId: string) => Promise<Restaurant[]>;
  getPlanDiscussions: (planId: string, restaurantId?: string) => RestaurantDiscussion[];
  refreshLocation: () => Promise<void>;
  inviteToPlan: (planId: string, email: string, message?: string) => Promise<void>;
  updatePlanSettings: (planId: string, settings: Partial<Plan>) => Promise<void>;
  switchToCity: (city: 'nyc' | 'la') => void;
  shareablePlanUrl: (planId: string) => string;
  // Collection operations (aliases for backward compatibility)
  addRestaurantToCollection: (collectionId: string, restaurantId: string) => Promise<void>;
  removeRestaurantFromCollection: (collectionId: string, restaurantId: string) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  leaveCollection: (collectionId: string) => Promise<void>;
  isCollectionOwner: (collectionId: string) => Promise<boolean>;
  isCollectionMember: (collectionId: string) => Promise<boolean>;
  getCollectionDiscussions: (collectionId: string, restaurantId?: string) => Promise<any[]>;
  inviteToCollection: (collectionId: string, email: string, message?: string) => Promise<void>;
  updateCollectionSettings: (collectionId: string, settings: any) => Promise<void>;
  getRestaurantVotingDetails: (restaurantId: string, planId: string) => any;
  addRestaurantComment: (restaurantId: string, collectionId: string, commentText: string) => Promise<void>;
  getCollectionsByType: (userId: string, collectionType?: 'public' | 'private' | 'shared') => Promise<any[]>;
  addMemberToCollection: (collectionId: string, userId: string, role?: 'member' | 'admin') => Promise<any>;
  removeMemberFromCollection: (collectionId: string, userId: string) => Promise<void>;
  updateCollectionType: (collectionId: string, collectionType: 'public' | 'private' | 'shared') => Promise<any>;
  addRestaurantToStore: (restaurant: Restaurant) => void;
  incrementCollectionViews: (collectionId: string) => Promise<void>;
  toggleCollectionLike: (collectionId: string) => Promise<{ success: boolean; liked: boolean }>;
  getCollectionLikeStatus: (collectionId: string) => boolean;
  getCollectionLikeCount: (collectionId: string) => number;
  // Follow/unfollow functionality for public collections
  followCollection: (collectionId: string) => Promise<{ success: boolean; isFollowing: boolean }>;
  unfollowCollection: (collectionId: string) => Promise<{ success: boolean; isFollowing: boolean }>;
  isFollowingCollection: (collectionId: string) => boolean;
  getFollowingCollections: () => string[];
}

export const [RestaurantProvider, useRestaurants] = createContextHook<RestaurantStore>(() => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userVotes, setUserVotes] = useState<RestaurantVote[]>([]);
  const [discussions, setDiscussions] = useState<RestaurantDiscussion[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ city: string; lat: number; lng: number } | null>(null);
  const [currentCity, setCurrentCity] = useState<'nyc' | 'la'>('nyc');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);

  console.log('[RestaurantStore] Hook initialized with currentCity:', currentCity);

  // Remove mock data fallback - only use real data from database

  // Helper function to map database restaurant format to component format
  const mapDatabaseRestaurant = useCallback((dbRestaurant: any): Restaurant => ({
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    cuisine: dbRestaurant.cuisine,
    priceRange: dbRestaurant.price_range,
    imageUrl: dbRestaurant.image_url,
    images: dbRestaurant.images || [],
    address: dbRestaurant.address,
    neighborhood: dbRestaurant.neighborhood,
    hours: dbRestaurant.hours,
    vibe: dbRestaurant.vibe || [],
    description: dbRestaurant.description,
    menuHighlights: dbRestaurant.menu_highlights || [],
    rating: dbRestaurant.rating,
    reviews: dbRestaurant.reviews || [],
    aiDescription: dbRestaurant.ai_description,
    aiVibes: dbRestaurant.ai_vibes || [],
    aiTopPicks: dbRestaurant.ai_top_picks || [],
    phone: dbRestaurant.phone,
    website: dbRestaurant.website,
    priceLevel: dbRestaurant.price_level,
    userNotes: dbRestaurant.userNotes || '',
    restaurant_code: dbRestaurant.restaurant_code,
    city: dbRestaurant.city,
    state: dbRestaurant.state,
    // Google Places enhancement fields
    googlePlaceId: dbRestaurant.googlePlaceId,
    googleRating: dbRestaurant.googleRating,
    googlePhotos: dbRestaurant.googlePhotos,
    editorialSummary: dbRestaurant.editorial_summary,
    // TripAdvisor integration fields
    tripadvisor_location_id: dbRestaurant.tripadvisor_location_id,
    tripadvisor_rating: dbRestaurant.tripadvisor_rating,
    tripadvisor_review_count: dbRestaurant.tripadvisor_review_count,
    tripadvisor_photos: dbRestaurant.tripadvisor_photos,
    tripadvisor_last_updated: dbRestaurant.tripadvisor_last_updated,
    // Uploaded photos will be handled by UnifiedImageService
    uploadedPhotos: [] // Placeholder - actual photos loaded by UnifiedImageService
  }), []);

  // Load restaurants from database
  console.log('[RestaurantStore] About to create restaurantsQuery with currentCity:', currentCity);
  const restaurantsQuery = useQuery({
    queryKey: ['restaurants', currentCity], // Add currentCity to query key to refetch when city changes
    enabled: true, // Explicitly enable the query
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      try {
        console.log(`[RestaurantStore] 🚀 QUERY EXECUTING - Loading restaurants for ${currentCity.toUpperCase()}...`);
        console.log(`[RestaurantStore] Current city: ${currentCity}`);
        
        // For LA, load from database (same as NYC for now)
        if (currentCity === 'la') {
          console.log('[RestaurantStore] Loading LA restaurants from database...');
        }
        
        // For NYC, load from database
        console.log('[RestaurantStore] Loading NYC restaurants from database...');
        const restaurantsData = await dbHelpers.getAllRestaurants();
        console.log('[RestaurantStore] Raw restaurant data:', restaurantsData?.length || 0);
        console.log('[RestaurantStore] Sample restaurant data:', restaurantsData?.slice(0, 2));
        
        if (!restaurantsData) throw new Error('No restaurants data returned');
        
        if (restaurantsData && restaurantsData.length > 0) {
          const mappedRestaurants = restaurantsData.map(mapDatabaseRestaurant);
          console.log('[RestaurantStore] Mapped restaurants:', mappedRestaurants.length);
          console.log('[RestaurantStore] Sample restaurant IDs:', mappedRestaurants.slice(0, 3).map(r => r.id));
          console.log('[RestaurantStore] All restaurant IDs from database:', mappedRestaurants.map(r => r.id));
          
          // Enhance restaurants with Google Places data if they don't have it
          console.log('[RestaurantStore] Checking for restaurants without Google Places data...');
          
          // Log sample restaurants to see what data they have
          const sampleRestaurants = mappedRestaurants.slice(0, 3);
          sampleRestaurants.forEach((r, index) => {
            console.log(`[RestaurantStore] Sample restaurant ${index + 1}: ${r.name}`);
            console.log(`  - Google Place ID: ${r.googlePlaceId || 'None'}`);
            console.log(`  - Google Rating: ${r.googleRating || 'None'}`);
            console.log(`  - Google Photos: ${r.googlePhotos || 'None'}`);
            console.log(`  - Editorial Summary: ${r.editorialSummary || 'None'}`);
          });
          
          const restaurantsNeedingEnhancement = mappedRestaurants.filter(r => 
            !r.googlePlaceId || !r.googleRating || !r.googlePhotos
          );
          console.log('[RestaurantStore] Restaurants needing enhancement:', restaurantsNeedingEnhancement.length);
          
          // Log the names of restaurants that need enhancement
          if (restaurantsNeedingEnhancement.length > 0) {
            console.log('[RestaurantStore] Restaurants needing enhancement:');
            restaurantsNeedingEnhancement.slice(0, 5).forEach((r, index) => {
              console.log(`  ${index + 1}. ${r.name} (${r.cuisine}) - ${r.neighborhood}`);
            });
            if (restaurantsNeedingEnhancement.length > 5) {
              console.log(`  ... and ${restaurantsNeedingEnhancement.length - 5} more`);
            }
          }
          
          if (restaurantsNeedingEnhancement.length > 0) {
            console.log('[RestaurantStore] Google Places enhancement disabled for now, skipping...');
            return mappedRestaurants;
          }
          
          return mappedRestaurants;
        } else {
          console.log('[RestaurantStore] No restaurants in database');
          return [];
        }
      } catch (error) {
        console.error('[RestaurantStore] Error loading restaurants from database:', error);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Debug the query status immediately after creation
  console.log('[RestaurantStore] restaurantsQuery status:', {
    isLoading: restaurantsQuery.isLoading,
    isError: restaurantsQuery.isError,
    error: restaurantsQuery.error,
    data: restaurantsQuery.data?.length || 0,
    status: restaurantsQuery.status
  });

  // Load user votes from database
  const votesQuery = useQuery({
    queryKey: ['userVotes', user?.id || ''],
    queryFn: async () => {
      try {
        if (!user?.id) return [];
        const votes = await dbHelpers.getUserVotes(user.id);
        return votes.map((vote: any) => ({
          id: vote.id,
          restaurantId: vote.restaurant_id,
          userId: vote.user_id,
          collectionId: vote.collection_id,
          vote: vote.vote as 'like' | 'dislike',
          reason: vote.reason,
          createdAt: vote.created_at
        }));
      } catch (error) {
        // Fallback to AsyncStorage only
        const storedVotes = await AsyncStorage.getItem('userVotes');
        return storedVotes ? JSON.parse(storedVotes) : [];
      }
    },
    enabled: true, // Always enabled to maintain hook order
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Load favorites from database
  const favoritesQuery = useQuery({
    queryKey: ['userFavorites', user?.id || ''],
    queryFn: async () => {
      try {
        // Only fetch from database if we have a user ID
        if (user?.id) {
          const favorites = await dbHelpers.getUserFavorites(user.id);
          console.log('[favoritesQuery] Fetched favorites from database:', favorites);
        return favorites;
        } else {
          console.log('[favoritesQuery] No user ID, falling back to AsyncStorage');
          // Fallback to AsyncStorage when no user ID
          const storedFavorites = await AsyncStorage.getItem('favoriteRestaurants');
          const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
          console.log('[favoritesQuery] Fetched favorites from AsyncStorage:', parsedFavorites);
          return parsedFavorites;
        }
      } catch (error) {
        console.error('[favoritesQuery] Error fetching favorites:', error);
        // Fallback to AsyncStorage
        const storedFavorites = await AsyncStorage.getItem('favoriteRestaurants');
        const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
        console.log('[favoritesQuery] Fallback to AsyncStorage:', parsedFavorites);
        return parsedFavorites;
      }
    },
    enabled: !!user?.id, // Only enable when we have a user ID
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Load discussions from database
  const discussionsQuery = useQuery({
    queryKey: ['discussions'],
    queryFn: async () => {
      try {
        // For now, we'll use the existing discussions from AsyncStorage
        // In the future, we can implement a function to get all discussions across collections
        const storedDiscussions = await AsyncStorage.getItem('discussions');
        const discussions = storedDiscussions ? JSON.parse(storedDiscussions) : [];
        return discussions;
      } catch (error) {
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Load initial data and user location
  const dataQuery = useQuery({
    queryKey: ['restaurantData'],
    queryFn: async () => {
      const [storedVotes, storedDiscussions, storedNotes, storedSearchHistory, storedFavorites, location] = await Promise.all([
        AsyncStorage.getItem('userVotes'),
        AsyncStorage.getItem('discussions'),
        AsyncStorage.getItem('restaurantNotes'),
        AsyncStorage.getItem('searchHistory'),
        AsyncStorage.getItem('favoriteRestaurants'),
        getUserLocation()
      ]);

      const notes = storedNotes ? JSON.parse(storedNotes) : {};
      const restaurantsWithNotes = (restaurantsQuery.data || []).map((r: any) => ({
        ...r,
        userNotes: notes[r.id] || r.userNotes
      }));

      return {
        restaurants: restaurantsWithNotes,
        userVotes: votesQuery.data || (storedVotes ? JSON.parse(storedVotes) : []),
        discussions: discussionsQuery.data || (storedDiscussions ? JSON.parse(storedDiscussions) : []),
        favoriteRestaurants: favoritesQuery.data || (storedFavorites ? JSON.parse(storedFavorites) : []),
        searchHistory: storedSearchHistory ? JSON.parse(storedSearchHistory) : [],
        userLocation: location
      };
    },
    enabled: true, // Always enabled to maintain hook order
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Ensure restaurants are always available
  useEffect(() => {
    console.log('[RestaurantStore] useEffect triggered:');
    console.log('  - restaurants.length:', restaurants.length);
    console.log('  - restaurantsQuery.data:', restaurantsQuery.data?.length || 0);
    console.log('  - restaurantsQuery.isLoading:', restaurantsQuery.isLoading);
    console.log('  - restaurantsQuery.error:', restaurantsQuery.error);
    console.log('  - dataQuery.data?.restaurants:', dataQuery.data?.restaurants?.length || 0);
    console.log('  - dataQuery.isLoading:', dataQuery.isLoading);
    console.log('  - dataQuery.error:', dataQuery.error);
    console.log('  - user ID:', user?.id);
    
    // Only set restaurants from query data if we don't have any restaurants yet
    // This prevents overwriting manually added restaurants
    if (restaurants.length === 0) {
      if (restaurantsQuery.data && restaurantsQuery.data.length > 0) {
        console.log('[RestaurantStore] ✅ Setting restaurants from restaurantsQuery.data:', restaurantsQuery.data.length);
        setRestaurants(restaurantsQuery.data);
      } else if (dataQuery.data?.restaurants && dataQuery.data.restaurants.length > 0) {
        console.log('[RestaurantStore] ✅ Setting restaurants from dataQuery.data:', dataQuery.data.restaurants.length);
        setRestaurants(dataQuery.data.restaurants);
      } else {
        console.log('[RestaurantStore] ❌ No restaurants available from any source');
        console.log('  - restaurantsQuery.data exists:', !!restaurantsQuery.data);
        console.log('  - restaurantsQuery.data length:', restaurantsQuery.data?.length || 0);
        console.log('  - dataQuery.data exists:', !!dataQuery.data);
        console.log('  - dataQuery.data.restaurants exists:', !!dataQuery.data?.restaurants);
        console.log('  - dataQuery.data.restaurants length:', dataQuery.data?.restaurants?.length || 0);
        setRestaurants([]);
      }
    } else {
      console.log('[RestaurantStore] Preserving existing restaurants (including manually added ones)');
    }
  }, [restaurantsQuery.data, dataQuery.data, restaurants.length, user?.id]);

  // Ensure other data is available
  useEffect(() => {
    if (dataQuery.data) {
      setUserVotes(dataQuery.data.userVotes);
      setDiscussions(dataQuery.data.discussions);
      setFavoriteRestaurants(dataQuery.data.favoriteRestaurants);
      setSearchHistory(dataQuery.data.searchHistory);
      setUserLocation(dataQuery.data.userLocation);
    }
  }, [dataQuery.data]);

  // Load favorites from AsyncStorage when user is not available yet
  useEffect(() => {
    const loadFavoritesFromStorage = async () => {
      if (!user?.id && favoriteRestaurants.length === 0) {
        try {
          const storedFavorites = await AsyncStorage.getItem('favoriteRestaurants');
          if (storedFavorites) {
            const parsedFavorites = JSON.parse(storedFavorites);
            console.log('[RestaurantStore] Loaded favorites from AsyncStorage:', parsedFavorites);
            setFavoriteRestaurants(parsedFavorites);
          }
        } catch (error) {
          console.error('[RestaurantStore] Error loading favorites from AsyncStorage:', error);
        }
      }
    };

    loadFavoritesFromStorage();
  }, [user?.id, favoriteRestaurants.length]);

  // Enhanced user plans/collections query with better error handling and data validation
  const plansQuery = useQuery({
    queryKey: ['userPlans', user?.id, 'enhanced'],
    queryFn: async () => {
      try {
        console.log('[RestaurantStore] 🚀 Starting enhanced plans query for user:', user?.id);
        console.log('[RestaurantStore] 📊 User authentication status:', !!user?.id);
        console.log('[RestaurantStore] 👤 User object:', user);
        
        // Data validation function
        const validateCollection = (collection: any) => {
          if (!collection || typeof collection !== 'object') {
            console.warn('[RestaurantStore] ⚠️ Invalid collection object:', collection);
            return false;
          }
          if (!collection.id || !collection.name) {
            console.warn('[RestaurantStore] ⚠️ Collection missing required fields:', { id: collection.id, name: collection.name });
            return false;
          }
          return true;
        };
        
        // Enhanced data mapping function
        const mapCollectionData = (collection: any) => {
          if (!validateCollection(collection)) {
            return null;
          }
          
          console.log('[RestaurantStore] 📋 Mapping collection:', collection.name, 'with restaurant_ids:', collection.restaurant_ids?.length || 0);
          
          return {
            ...collection,
            // Ensure restaurant_ids is always an array
            restaurant_ids: Array.isArray(collection.restaurant_ids) ? collection.restaurant_ids : [],
            // Ensure collaborators is always an array
            collaborators: Array.isArray(collection.collaborators) ? collection.collaborators : [],
            // Enhanced settings with defaults
            settings: {
              voteVisibility: collection.vote_visibility || 'public',
              discussionEnabled: collection.discussion_enabled !== false,
              autoRankingEnabled: collection.auto_ranking_enabled !== false,
              consensusThreshold: collection.consensus_threshold ? collection.consensus_threshold / 100 : 0.7
            },
            // Add computed fields
            restaurantCount: Array.isArray(collection.restaurant_ids) ? collection.restaurant_ids.length : 0,
            memberCount: getMemberCount(collection),
            isOwner: isCreator(collection, user?.id || ''),
            isMember: isMember(user?.id || '', collection.collaborators || [])
          };
        };
        
        // If no user ID, load public collections as fallback
        if (!user?.id) {
          console.log('[RestaurantStore] 🔓 No user ID, loading public collections as fallback');
          try {
            const publicCollections = await dbHelpers.getAllCollections();
            console.log('[RestaurantStore] 📊 Public collections loaded:', publicCollections?.length || 0);
            
            const mappedCollections = (publicCollections || [])
              .map(mapCollectionData)
              .filter(Boolean); // Remove invalid collections
            
            console.log('[RestaurantStore] ✅ Mapped public collections:', mappedCollections.length);
            return mappedCollections;
              } catch (error) {
            console.error('[RestaurantStore] ❌ Error loading public collections:', error);
            throw new Error(`Failed to load public collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Load user-specific collections
        console.log('[RestaurantStore] 🔍 Loading plans for authenticated user:', user.id);
        const plans = await dbHelpers.getUserPlans(user.id);
        console.log('[RestaurantStore] 📊 Raw plans data received:', plans?.length || 0);
        
        if (!plans || plans.length === 0) {
          console.log('[RestaurantStore] ⚠️ No plans found for user, returning empty array');
          return [];
        }
        
        // Map and validate all collections
        const mappedPlans = plans
          .map(mapCollectionData)
          .filter(Boolean); // Remove invalid collections
        
        console.log('[RestaurantStore] ✅ Successfully mapped plans:', mappedPlans.length);
        console.log('[RestaurantStore] 📋 Final mapped plans:', mappedPlans.map(p => ({ 
          id: p.id, 
          name: p.name, 
          created_by: p.created_by, 
          is_public: p.is_public,
          restaurantCount: p.restaurantCount,
          memberCount: p.memberCount
        })));
        
        return mappedPlans;
    } catch (error) {
        console.error('[RestaurantStore] ❌ Critical error in plans query:', error);
        
        // Enhanced error handling with fallback
        console.log('[RestaurantStore] 🚨 Returning empty array as last resort');
        return [];
      }
    },
    enabled: true, // Always enabled to ensure collections load
    retry: 3,
    retryDelay: 1000,
    staleTime: 30 * 1000, // 30 seconds - shorter for more responsive updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when app comes back to focus
    refetchOnReconnect: true // Refetch when network reconnects
  });

  // Debug plans data
  useEffect(() => {
    console.log('[RestaurantStore] Plans data updated:', plansQuery.data?.length || 0);
    if (plansQuery.data && plansQuery.data.length > 0) {
      plansQuery.data.forEach((plan, index) => {
        console.log(`[RestaurantStore] Plan ${index}: ${plan.name} - ${plan.restaurant_ids?.length || 0} restaurants`);
      });
    }
  }, [plansQuery.data]);

  // Invalidate queries when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('[RestaurantStore] User changed, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
    }
  }, [user?.id, queryClient]);

  // Load collections for the current user
  const allCollectionsQuery = useQuery({
    queryKey: ['allCollections', user?.id],
    queryFn: async () => {
      console.log(`[allCollectionsQuery] Query function called for user: ${user?.id} at ${new Date().toISOString()}`);
      try {
        const collections = await dbHelpers.getAllCollections(user?.id);
        console.log(`[RestaurantStore] Starting to process collections... (${new Date().toISOString()})`);
        console.log('[RestaurantStore] Input collections:', collections?.map(c => ({
          name: c.name,
          collaborators: c.collaborators,
          collaboratorsLength: c.collaborators?.length || 0
        })));
        
        return collections.map((collection: any) => {
          console.log(`[RestaurantStore] Processing "${collection.name}":`, {
            inputCollaborators: collection.collaborators,
            inputCollaboratorsLength: collection.collaborators?.length || 0
          });
          
          const enhancedCollection = {
            ...collection,
            collaborators: collection.collaborators && collection.collaborators.length > 0 ? collection.collaborators : [],
            views: collection.views || 0,
            settings: {
              voteVisibility: collection.vote_visibility || 'public',
              discussionEnabled: collection.discussion_enabled !== false,
              autoRankingEnabled: collection.auto_ranking_enabled !== false,
              consensusThreshold: collection.consensus_threshold ? collection.consensus_threshold / 100 : 0.7
            }
          };
          
          console.log(`[RestaurantStore] Enhanced "${enhancedCollection.name}":`, {
            enhancedCollaborators: enhancedCollection.collaborators,
            enhancedCollaboratorsLength: enhancedCollection.collaborators?.length || 0
          });
          
          // Calculate member count after collaborators is properly set
          enhancedCollection.memberCount = getMemberCount(enhancedCollection);
          
          console.log(`[RestaurantStore] Final "${enhancedCollection.name}" (${new Date().toISOString()}): memberCount = ${enhancedCollection.memberCount}`);
          
          return enhancedCollection;
        });
      } catch (error) {
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  // Load user-involved collections (shared and private)
  const userCollectionsQuery = useQuery({
    queryKey: ['userCollections', user?.id],
    queryFn: async () => {
      console.log(`[userCollectionsQuery] Query function called for user: ${user?.id} at ${new Date().toISOString()}`);
      try {
        const collections = await dbHelpers.getUserCollections(user?.id || '');
        console.log(`[RestaurantStore] Starting to process user collections... (${new Date().toISOString()})`);
        console.log('[RestaurantStore] Input user collections:', collections?.map(c => ({
          name: c.name,
          collaborators: c.collaborators,
          collaboratorsLength: c.collaborators?.length || 0,
          is_public: c.is_public
        })));
        
        return collections.map((collection: any) => {
          console.log(`[RestaurantStore] Processing user collection "${collection.name}":`, {
            inputCollaborators: collection.collaborators,
            inputCollaboratorsLength: collection.collaborators?.length || 0,
            is_public: collection.is_public
          });
          
          const enhancedCollection = {
            ...collection,
            collaborators: collection.collaborators && collection.collaborators.length > 0 ? collection.collaborators : [],
            views: collection.views || 0,
            settings: {
              voteVisibility: collection.vote_visibility || 'public',
              discussionEnabled: collection.discussion_enabled !== false,
              autoRankingEnabled: collection.auto_ranking_enabled !== false,
              consensusThreshold: collection.consensus_threshold ? collection.consensus_threshold / 100 : 0.7
            }
          };
          
          console.log(`[RestaurantStore] Enhanced user collection "${enhancedCollection.name}":`, {
            enhancedCollaborators: enhancedCollection.collaborators,
            enhancedCollaboratorsLength: enhancedCollection.collaborators?.length || 0
          });
          
          // Calculate member count after collaborators is properly set
          enhancedCollection.memberCount = getMemberCount(enhancedCollection);
          
          console.log(`[RestaurantStore] Final user collection "${enhancedCollection.name}" (${new Date().toISOString()}): memberCount = ${enhancedCollection.memberCount}`);
          
          return enhancedCollection;
        });
      } catch (error) {
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await dbHelpers.createCollection(planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async ({ planId, userId }: { planId: string; userId: string }) => {
      return await dbHelpers.deleteCollection(planId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
    }
  });

  const voteRestaurantMutation = useMutation({
    mutationFn: async (voteData: any) => {
      console.log('[voteRestaurantMutation] Starting vote with data:', voteData);
      return await dbHelpers.voteRestaurant(voteData);
    },
    onSuccess: (data) => {
      console.log('[voteRestaurantMutation] Vote successful:', data);
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['collectionVotes'] });
    },
    onError: (error) => {
      console.error('[voteRestaurantMutation] Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        error: error
      });
      
      // Revert optimistic update on error
      setUserVotes(prev => {
        // Remove the optimistic vote that was added (identified by temp prefix in timestamp)
        return prev.filter(v => !v.timestamp?.startsWith('temp-'));
      });
      
      // Show user-friendly error message
      console.error('[voteRestaurantMutation] Vote failed:', error?.message || 'Unknown error');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ userId, favoriteRestaurants }: { userId: string; favoriteRestaurants: string[] }) => {
      console.log('[toggleFavoriteMutation] Starting database update...');
      console.log('[toggleFavoriteMutation] User ID:', userId);
      console.log('[toggleFavoriteMutation] Favorites to save:', favoriteRestaurants);
      
      const result = await dbHelpers.updateUserFavorites(userId, favoriteRestaurants);
      console.log('[toggleFavoriteMutation] Database update successful:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[toggleFavoriteMutation] Success callback - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['userFavorites', variables.userId] });
    },
    onError: (error) => {
      console.error('[toggleFavoriteMutation] Error updating favorites:', error);
    }
  });

  const addDiscussionMutation = useMutation({
    mutationFn: async (discussionData: any) => {
      return await dbHelpers.createDiscussion(discussionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: (error) => {
      console.error('[addDiscussionMutation] Error:', error);
      // On error, we could revert the optimistic update, but for now we'll let the query invalidation handle it
    }
  });

  // Helper functions



  const addSearchQuery = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    AsyncStorage.removeItem('searchHistory');
  }, []);

  const getQuickSuggestions = useCallback(() => {
    return [
      'Pizza',
      'Sushi',
      'Burgers',
      'Italian',
      'Mexican',
      'Thai',
      'Indian',
      'Chinese',
      'Japanese',
      'Mediterranean'
    ];
  }, []);

  const addRestaurantToPlan = useCallback(async (planId: string, restaurantId: string) => {
    console.log(`[RestaurantStore] addRestaurantToPlan called with planId=${planId}, restaurantId=${restaurantId}`);
    
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) {
      console.error(`[RestaurantStore] Plan not found with ID: ${planId}`);
      console.log(`[RestaurantStore] Available plans:`, plansQuery.data?.map(p => ({ id: p.id, name: p.name })));
      throw new Error(`Plan not found with ID: ${planId}`);
    }

    console.log(`[RestaurantStore] Found plan: ${plan.name}`);
    console.log(`[RestaurantStore] Current restaurant_ids:`, plan.restaurant_ids);
    
    const updatedRestaurantIds = [...(plan.restaurant_ids || []), restaurantId];
    console.log(`[RestaurantStore] Updated restaurant_ids:`, updatedRestaurantIds);
    
    try {
      await dbHelpers.updateCollection(planId, { restaurant_ids: updatedRestaurantIds });
      console.log(`[RestaurantStore] Successfully updated plan in database`);
      
      // Invalidate all relevant queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['collectionRestaurants', planId] });
      
      console.log(`[RestaurantStore] Invalidated queries for immediate update`);
    } catch (error) {
      console.error(`[RestaurantStore] Error updating plan:`, error);
      throw error;
    }
  }, [plansQuery.data, queryClient]);

  const removeRestaurantFromPlan = useCallback(async (planId: string, restaurantId: string) => {
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return;

    const updatedRestaurantIds = (plan.restaurant_ids || []).filter((id: string) => id !== restaurantId);
    
    try {
      await dbHelpers.updateCollection(planId, { restaurant_ids: updatedRestaurantIds });
      
      // Invalidate all relevant queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['collectionRestaurants', planId] });
      
      console.log(`[RestaurantStore] Removed restaurant and invalidated queries for immediate update`);
    } catch (error) {
      console.error(`[RestaurantStore] Error removing restaurant from plan:`, error);
      throw error;
    }
  }, [plansQuery.data, queryClient]);

  const createPlan = useCallback(async (planData: any) => {
    await createPlanMutation.mutateAsync({
      ...planData,
      userId: user?.id
    });
  }, [createPlanMutation, user?.id]);

  const deletePlan = useCallback(async (planId: string) => {
    if (!user?.id) return;
    await deletePlanMutation.mutateAsync({ planId, userId: user.id });
  }, [deletePlanMutation, user?.id]);

  const toggleFavorite = useCallback((restaurantId: string) => {
    console.log('[toggleFavorite] Toggling favorite for restaurant:', restaurantId);
    console.log('[toggleFavorite] Current favorites:', favoriteRestaurants);
    console.log('[toggleFavorite] User ID:', user?.id);

    const newFavorites = favoriteRestaurants.includes(restaurantId)
      ? favoriteRestaurants.filter(id => id !== restaurantId)
      : [...favoriteRestaurants, restaurantId];

    console.log('[toggleFavorite] New favorites array:', newFavorites);

    // Update local state immediately
    setFavoriteRestaurants(newFavorites);
    
    // Save to AsyncStorage as backup
    AsyncStorage.setItem('favoriteRestaurants', JSON.stringify(newFavorites))
      .then(() => console.log('[toggleFavorite] Saved to AsyncStorage'))
      .catch(error => console.error('[toggleFavorite] AsyncStorage error:', error));
    
    // Update database if user is logged in
    if (user?.id) {
      toggleFavoriteMutation.mutate({ userId: user.id, favoriteRestaurants: newFavorites });
      // Also invalidate the specific query key with user ID
      queryClient.invalidateQueries({ queryKey: ['userFavorites', user.id] });
      console.log('[toggleFavorite] Database update triggered');
    } else {
      console.log('[toggleFavorite] No user ID, only saved to AsyncStorage');
    }
  }, [favoriteRestaurants, user?.id, toggleFavoriteMutation, queryClient]);

  const voteRestaurant = useCallback((restaurantId: string, vote: 'like' | 'dislike', planId?: string, reason?: string) => {
    if (!user?.id) return;

    // Optimistic update - immediately update local state
    const optimisticVote: RestaurantVote = {
      restaurantId,
      userId: user.id,
      collectionId: planId || 'default',
      vote,
      reason,
      timestamp: `temp-${Date.now()}` // Use temp prefix to identify optimistic votes
    };

    // Update local userVotes state immediately
    setUserVotes(prev => {
      // Remove any existing vote for this user/restaurant/collection combination
      const filtered = prev.filter(v => 
        !(v.userId === user.id && v.restaurantId === restaurantId && v.collectionId === (planId || 'default'))
      );
      return [...filtered, optimisticVote];
    });

    // Then send to server
    voteRestaurantMutation.mutate({
        restaurant_id: restaurantId,
        user_id: user.id,
      collection_id: planId || 'default',
      vote,
      reason
    });
  }, [user?.id, voteRestaurantMutation]);

  const addUserNote = useCallback(async (restaurantId: string, note: string) => {
    if (!user?.id) return;

    await dbHelpers.createUserNote({
      user_id: user.id,
      restaurant_id: restaurantId,
      note_text: note
    });

    // Update local state
    setRestaurants(prev => prev.map(restaurant => 
      restaurant.id === restaurantId
        ? { ...restaurant, userNotes: restaurant.userNotes ? `${restaurant.userNotes}\n${note}` : note }
        : restaurant
    ));
  }, [user?.id]);

  const addDiscussion = useCallback(async (restaurantId: string, planId: string, message: string) => {
    if (!user?.id) return;

    // Optimistic update - immediately update local discussions state
    const optimisticDiscussion: RestaurantDiscussion = {
      id: `temp-discussion-${Date.now()}`,
        restaurantId, 
        collectionId: planId,
      userId: user.id,
      userName: user.email?.split('@')[0] || 'User', // Use email prefix as fallback name
      userAvatar: '', // Empty avatar for optimistic update
      message,
      timestamp: new Date(),
      likes: 0,
      replies: []
    };

    // Update local discussions state immediately
    setDiscussions(prev => [...prev, optimisticDiscussion]);

    // Then send to server
    await addDiscussionMutation.mutateAsync({
      restaurant_id: restaurantId,
      collection_id: planId,
      user_id: user.id,
      message
    });
  }, [user?.id, addDiscussionMutation]);

  const getRankedRestaurants = useCallback((planId?: string, memberCount: number = 1) => {
    if (!planId) {
      console.log('[getRankedRestaurants] No planId provided');
      return { restaurants: [], participationData: null };
    }

    console.log('[getRankedRestaurants] Looking for plan:', planId);
    console.log('[getRankedRestaurants] Available plans:', plansQuery.data?.length || 0);
    console.log('[getRankedRestaurants] Available restaurants:', restaurants.length);

    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) {
      console.log('[getRankedRestaurants] Plan not found');
      return { restaurants: [], participationData: null };
    }

    console.log('[getRankedRestaurants] Found plan:', plan.name);
    console.log('[getRankedRestaurants] Plan restaurant_ids:', plan.restaurant_ids?.length || 0);

    if (!plan.restaurant_ids || plan.restaurant_ids.length === 0) {
      console.log('[getRankedRestaurants] No restaurant_ids in plan');
      return { restaurants: [], participationData: null };
    }

    const planRestaurants = restaurants.filter(r => plan.restaurant_ids.includes(r.id));
    console.log('[getRankedRestaurants] Filtered restaurants:', planRestaurants.length);

    // Check if this is a shared collection (multiple members)
    const isSharedCollection = memberCount > 1;
    
    if (!isSharedCollection) {
      console.log('[getRankedRestaurants] Not a shared collection, returning unranked restaurants');
      // Return restaurants without ranking for private/public collections
      return {
        restaurants: planRestaurants.map((restaurant, index) => ({
          restaurant,
          meta: {
            restaurantId: restaurant.id,
            netScore: 0,
            likes: 0,
            dislikes: 0,
            likeRatio: 0,
            engagementBoost: 0,
            recencyBoost: 0,
            distanceBoost: 0,
            authorityApplied: false,
            consensus: 'low' as const,
            approvalPercent: 0,
            rank: index + 1,
            voteDetails: {
              likeVoters: [],
              dislikeVoters: [],
              abstentions: [],
              reasons: [],
              timeline: []
            },
            discussionCount: 0
          }
        })),
        participationData: null
      };
    }

    const votes = userVotes.filter(v => v.collectionId === planId);
    console.log('[getRankedRestaurants] Votes for plan:', votes.length);

    const rankings = computeRankings(planRestaurants, votes, { memberCount });
    console.log('[getRankedRestaurants] Computed rankings:', rankings.length);

    // Extract participation data from the first result (all results have the same participation data)
    const participationData = rankings.length > 0 ? rankings[0].participationData : null;
    const rankedRestaurants = rankings.map(r => ({ restaurant: r.restaurant, meta: r.meta }));

    return { restaurants: rankedRestaurants, participationData };
  }, [plansQuery.data, restaurants, userVotes]);

  // New function to get ranked restaurants with all collection votes (including user names)
  const getRankedRestaurantsWithAllVotes = useCallback(async (planId?: string, memberCount: number = 1) => {
    if (!planId) {
      console.log('[getRankedRestaurantsWithAllVotes] No planId provided');
      return { restaurants: [], participationData: null };
    }

    console.log('[getRankedRestaurantsWithAllVotes] Looking for plan:', planId);

    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) {
      console.log('[getRankedRestaurantsWithAllVotes] Plan not found');
      return { restaurants: [], participationData: null };
    }

    if (!plan.restaurant_ids || plan.restaurant_ids.length === 0) {
      console.log('[getRankedRestaurantsWithAllVotes] No restaurant_ids in plan');
      return { restaurants: [], participationData: null };
    }

    // Filter restaurants that exist in the collection and are available in the store
    const planRestaurants = restaurants.filter(r => {
      const isInPlan = plan.restaurant_ids.includes(r.id);
      if (!isInPlan) {
        console.log(`[getRankedRestaurantsWithAllVotes] Restaurant ${r.name} (${r.id}) not found in plan restaurant_ids`);
      }
      return isInPlan;
    });
    console.log('[getRankedRestaurantsWithAllVotes] Filtered restaurants:', planRestaurants.length);
    
    // If no restaurants found, return empty result
    if (planRestaurants.length === 0) {
      console.log('[getRankedRestaurantsWithAllVotes] No restaurants found in store for plan');
      return { restaurants: [], participationData: null };
    }

    // Always fetch votes and discussions for all collection types to show activity
    console.log('[getRankedRestaurantsWithAllVotes] Fetching activity data for all collection types');
    
    try {
      // Fetch all votes for this collection with user names
      const allVotes = await dbHelpers.getCollectionVotesWithUsers(planId);
      console.log('[getRankedRestaurantsWithAllVotes] All votes for collection:', allVotes.length);

      // Transform votes to match the expected format and include user names
      const transformedVotes = allVotes.map(vote => ({
        id: vote.id,
        restaurantId: vote.restaurant_id,
        userId: vote.user_id,
        collectionId: vote.collection_id,
        vote: vote.vote as 'like' | 'dislike',
        reason: vote.reason,
        createdAt: vote.created_at,
        timestamp: vote.created_at,
        userName: vote.userName
      }));
      
      console.log('[getRankedRestaurantsWithAllVotes] Vote transformation debugging:', {
        sampleVote: transformedVotes[0] ? {
          userId: transformedVotes[0].userId,
          userName: transformedVotes[0].userName,
          vote: transformedVotes[0].vote
        } : null,
        totalVotes: transformedVotes.length
      });

      // Update the plan's collaborators to include user names from votes
      const updatedPlan = {
        ...plan,
        collaborators: plan.collaborators || []
      };

      // Get collection member IDs - handle different ID formats
      const collectionMemberIds = new Set(updatedPlan.collaborators.map((c: any) => {
        if (typeof c === 'string') return c;
        // Handle different ID formats - extract the actual user ID from memberId or userId
        if (c?.memberId && c.memberId.startsWith('member_')) {
          return c.memberId.replace('member_', '');
        }
        return c?.userId || c?.id;
      }));
      
      // Filter votes to only include collection members
      const memberVotes = transformedVotes.filter(vote => collectionMemberIds.has(vote.userId));
      console.log('[getRankedRestaurantsWithAllVotes] Filtered to member votes:', memberVotes.length, 'out of', transformedVotes.length);

      // Add any users from votes who aren't in collaborators (but only if they're supposed to be members)
      const voteUserIds = new Set(transformedVotes.map(v => v.userId));
      const existingCollaboratorIds = new Set(updatedPlan.collaborators.map((c: any) => {
        if (typeof c === 'string') return c;
        // Handle different ID formats - extract the actual user ID from memberId or userId
        if (c?.memberId && c.memberId.startsWith('member_')) {
          return c.memberId.replace('member_', '');
        }
        return c?.userId || c?.id;
      }));
      
      voteUserIds.forEach(userId => {
        if (!existingCollaboratorIds.has(userId)) {
          const vote = transformedVotes.find(v => v.userId === userId);
          if (vote) {
            updatedPlan.collaborators.push({
              userId: userId,
              name: vote.userName,
              avatar: '',
              isVerified: false,
              voteWeight: 1
            });
          }
        }
      });

      // Check if this is a shared collection (multiple members) for ranking
      const isSharedCollection = memberCount > 1;
      
      if (isSharedCollection) {
        console.log('[getRankedRestaurantsWithAllVotes] Computing rankings for shared collection');
        const rankings = computeRankings(planRestaurants, memberVotes, { memberCount, collection: updatedPlan });
        console.log('[getRankedRestaurantsWithAllVotes] Computed rankings:', rankings.length);

        // Extract participation data from the first result (all results have the same participation data)
        const participationData = rankings.length > 0 ? rankings[0].participationData : null;
        const rankedRestaurants = rankings.map(r => ({ restaurant: r.restaurant, meta: r.meta }));

        return { restaurants: rankedRestaurants, participationData };
      } else {
        console.log('[getRankedRestaurantsWithAllVotes] Creating activity data for non-shared collection');
        // For private/public collections, still show activity but without ranking
        const rankings = computeRankings(planRestaurants, memberVotes, { memberCount: 1, collection: updatedPlan });
        const participationData = rankings.length > 0 ? rankings[0].participationData : null;
        const rankedRestaurants = rankings.map(r => ({ restaurant: r.restaurant, meta: r.meta }));
        
        return { restaurants: rankedRestaurants, participationData };
      }
    } catch (error) {
      console.error('[getRankedRestaurantsWithAllVotes] Error fetching votes:', error);
      // Fallback to using only current user's votes
      const votes = userVotes.filter(v => v.collectionId === planId);
      const rankings = computeRankings(planRestaurants, votes, { memberCount });
      const participationData = rankings.length > 0 ? rankings[0].participationData : null;
      const rankedRestaurants = rankings.map(r => ({ restaurant: r.restaurant, meta: r.meta }));
      return { restaurants: rankedRestaurants, participationData };
    }
  }, [plansQuery.data, restaurants, userVotes]);

  const getGroupRecommendations = useCallback((planId: string) => {
    const rankedRestaurants = getRankedRestaurants(planId);
    return []; // Simplified for now
  }, [getRankedRestaurants]);

  // Simple function to get restaurants for a collection
  const getCollectionRestaurants = useCallback((collectionId: string) => {
    if (!collectionId) {
      console.log('[getCollectionRestaurants] No collectionId provided');
      return [];
    }

    console.log('[getCollectionRestaurants] Getting restaurants for collection:', collectionId);
    console.log('[getCollectionRestaurants] Available restaurants:', restaurants.length);
    console.log('[getCollectionRestaurants] Available plans:', plansQuery.data?.length || 0);

    // First try to find the collection in plansQuery.data
    let collection = plansQuery.data?.find((p: any) => p.id === collectionId);
    
    // If not found in plansQuery.data, try to find it in allCollections
    if (!collection && allCollectionsQuery.data) {
      collection = allCollectionsQuery.data.find((c: any) => c.id === collectionId);
      if (collection) {
        console.log('[getCollectionRestaurants] Found collection in allCollections:', collection.name);
      }
    }

    // If still not found, try to get it from the database directly
    if (!collection) {
      console.log('[getCollectionRestaurants] Collection not found in query data, will fetch from database');
      // For now, return empty array and let the component handle the loading
      // The component should use a separate query to fetch the collection
      return [];
    }

    console.log('[getCollectionRestaurants] Found collection:', collection.name);
    console.log('[getCollectionRestaurants] Collection restaurant_ids:', collection.restaurant_ids?.length || 0);
    console.log('[getCollectionRestaurants] Collection restaurant_ids array:', collection.restaurant_ids);
    console.log('[getCollectionRestaurants] Available restaurants in store:', restaurants.length);
    console.log('[getCollectionRestaurants] Available restaurant IDs in store:', restaurants.map(r => r.id));

    if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
      console.log('[getCollectionRestaurants] No restaurant_ids in collection');
      console.log('[getCollectionRestaurants] Collection restaurant_ids:', collection.restaurant_ids);
      return [];
    }

    // Filter restaurants that exist in the collection
    const collectionRestaurants = restaurants.filter(r => {
      const isInCollection = collection.restaurant_ids.includes(r.id);
      if (!isInCollection) {
        console.log(`[getCollectionRestaurants] Restaurant ${r.name} (${r.id}) not found in collection restaurant_ids`);
      }
      return isInCollection;
    });
    
    console.log('[getCollectionRestaurants] Found restaurants:', collectionRestaurants.length);
    collectionRestaurants.forEach((r, i) => {
      console.log(`[getCollectionRestaurants] Restaurant ${i + 1}: ${r.name} (${r.id})`);
    });

    // If no restaurants found in the collection, log the missing IDs and return empty array
    if (collectionRestaurants.length === 0) {
      console.log('[getCollectionRestaurants] No restaurants found in collection');
      const missingIds = collection.restaurant_ids.filter((id: string) => !restaurants.some(r => r.id === id));
      console.log('[getCollectionRestaurants] Missing restaurant IDs:', missingIds);
      console.log('[getCollectionRestaurants] Available restaurant IDs in store:', restaurants.map(r => r.id));
      return [];
    }

    return collectionRestaurants;
  }, [plansQuery.data, allCollectionsQuery.data, restaurants]);

  // Function to fetch restaurants directly from database for a collection
  const getCollectionRestaurantsFromDatabase = useCallback(async (collectionId: string) => {
    if (!collectionId) {
      console.log('[getCollectionRestaurantsFromDatabase] No collectionId provided');
      return [];
    }

    try {
      console.log('[getCollectionRestaurantsFromDatabase] Fetching restaurants from database for collection:', collectionId);
      
      // First get the collection to find its restaurant_ids
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('restaurant_ids')
        .eq('id', collectionId)
        .single();

      if (collectionError) {
        console.error('[getCollectionRestaurantsFromDatabase] Error fetching collection:', collectionError);
    return [];
      }

      console.log('[getCollectionRestaurantsFromDatabase] Collection data:', collection);

      if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
        console.log('[getCollectionRestaurantsFromDatabase] No restaurant_ids in collection');
        return [];
      }

      console.log('[getCollectionRestaurantsFromDatabase] Collection restaurant_ids:', collection.restaurant_ids);
      console.log('[getCollectionRestaurantsFromDatabase] Restaurant IDs type:', typeof collection.restaurant_ids);
      console.log('[getCollectionRestaurantsFromDatabase] Restaurant IDs length:', collection.restaurant_ids.length);

      // Fetch restaurants directly from database
      const restaurantsData = await dbHelpers.getRestaurantsByIds(collection.restaurant_ids);
      console.log('[getCollectionRestaurantsFromDatabase] Fetched restaurants from database:', restaurantsData.length);
      console.log('[getCollectionRestaurantsFromDatabase] Raw restaurant data:', restaurantsData);

      if (restaurantsData && restaurantsData.length > 0) {
        const mappedRestaurants = restaurantsData.map(mapDatabaseRestaurant);
        console.log('[getCollectionRestaurantsFromDatabase] Mapped restaurants:', mappedRestaurants.length);
        console.log('[getCollectionRestaurantsFromDatabase] Sample mapped restaurant:', mappedRestaurants[0]);
        return mappedRestaurants;
      }

      console.log('[getCollectionRestaurantsFromDatabase] No restaurants found in database');
      return [];
    } catch (error) {
      console.error('[getCollectionRestaurantsFromDatabase] Error:', error);
      return [];
    }
  }, [mapDatabaseRestaurant]);

  const getPlanDiscussions = useCallback((planId: string, restaurantId?: string) => {
    return discussions.filter(d => 
      d.collectionId === planId && 
      (!restaurantId || d.restaurantId === restaurantId)
    );
  }, [discussions]);

  const refreshLocation = useCallback(async () => {
    const location = await getUserLocation();
    setUserLocation(location);
  }, []);

  const inviteToPlan = useCallback(async (planId: string, email: string, message?: string) => {
    // Implementation for inviting users to plans
    // This would typically involve sending an email or creating an invitation record
  }, []);

  const updatePlanSettings = useCallback(async (planId: string, settings: Partial<Plan>) => {
    await dbHelpers.updateCollection(planId, settings);
    queryClient.invalidateQueries({ queryKey: ['userPlans'] });
    queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
  }, [queryClient]);

  const switchToCity = useCallback((city: 'nyc' | 'la') => {
    setCurrentCity(city);
    const cityName = city === 'nyc' ? 'New York' : 'Los Angeles';
    setUserLocation(prev => {
      // Only update if the city is actually different to prevent infinite loops
      if (!prev || prev.city !== cityName) {
        return prev ? { ...prev, city: cityName } : { city: cityName, lat: 0, lng: 0 };
      }
      return prev;
    });
  }, []);

  const shareablePlanUrl = useCallback((planId: string) => {
    return `https://yourapp.com/collection/${planId}`;
  }, []);

  // Collection operations (aliases for backward compatibility)
  const addRestaurantToCollection = addRestaurantToPlan;
  const removeRestaurantFromCollection = removeRestaurantFromPlan;
  const deleteCollection = deletePlan;
  const leaveCollection = useCallback(async (collectionId: string) => {
    if (!user?.id) return;
    await dbHelpers.leaveCollection(collectionId, user.id);
    queryClient.invalidateQueries({ queryKey: ['userPlans'] });
    queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
  }, [user?.id, queryClient]);

  const isCollectionOwner = useCallback(async (collectionId: string) => {
    const plan = plansQuery.data?.find((p: any) => p.id === collectionId);
    return plan?.created_by === user?.id;
  }, [plansQuery.data, user?.id]);

  const isCollectionMember = useCallback(async (collectionId: string) => {
    const plan = plansQuery.data?.find((p: any) => p.id === collectionId);
    return plan?.created_by === user?.id;
  }, [plansQuery.data, user?.id]);

  const getCollectionDiscussions = useCallback(async (collectionId: string, restaurantId?: string) => {
    console.log('[RestaurantStore] getCollectionDiscussions called with:', { collectionId, restaurantId });
    try {
      const result = await dbHelpers.getCollectionDiscussions(collectionId, restaurantId);
      console.log('[RestaurantStore] getCollectionDiscussions result:', {
        length: result?.length || 0,
        sample: result?.[0] ? {
          id: result[0].id,
          userId: result[0].userId,
          collectionId: result[0].collectionId,
          restaurantId: result[0].restaurantId,
          rawUserId: result[0].user_id,
          rawCollectionId: result[0].collection_id,
          rawRestaurantId: result[0].restaurant_id
        } : null
      });
      return result;
    } catch (error) {
      console.error('[RestaurantStore] getCollectionDiscussions error:', error);
      return [];
    }
  }, []);

  const inviteToCollection = inviteToPlan;
  const updateCollectionSettings = updatePlanSettings;

  const getRestaurantVotingDetails = useCallback((restaurantId: string, planId: string) => {
    const votes = userVotes.filter(v => 
      v.restaurantId === restaurantId && v.collectionId === planId
    );
    
    return {
      likes: votes.filter(v => v.vote === 'like').length,
      dislikes: votes.filter(v => v.vote === 'dislike').length,
      userVote: votes.find(v => v.userId === user?.id)?.vote,
      totalVotes: votes.length
    };
  }, [userVotes, user?.id]);

  const addRestaurantComment = useCallback(async (restaurantId: string, collectionId: string, commentText: string) => {
    await addDiscussion(restaurantId, collectionId, commentText);
  }, [addDiscussion]);

  const getCollectionsByType = useCallback(async (userId: string, collectionType?: 'public' | 'private' | 'shared') => {
    try {
      return await dbHelpers.getCollectionsByType(userId, collectionType);
    } catch (error) {
      return [];
    }
  }, []);

  const addMemberToCollection = useCallback(async (collectionId: string, userId: string, role?: 'member' | 'admin') => {
    try {
      const result = await dbHelpers.addMemberToCollection(collectionId, userId, role);
      // Invalidate queries to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
      return result;
    } catch (error) {
      throw error;
    }
  }, [queryClient]);

  const removeMemberFromCollection = useCallback(async (collectionId: string, userId: string) => {
    try {
      await dbHelpers.removeMemberFromCollection(collectionId, userId);
      // Invalidate queries to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
    } catch (error) {
      throw error;
    }
  }, [queryClient]);

  const updateCollectionType = useCallback(async (collectionId: string, collectionType: 'public' | 'private' | 'shared') => {
    try {
      const result = await dbHelpers.updateCollectionType(collectionId, collectionType);
      // Invalidate queries to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
      return result;
    } catch (error) {
      throw error;
    }
  }, [queryClient]);

  // Add restaurant to store when selected from search results
  const addRestaurantToStore = useCallback((restaurant: Restaurant) => {
    console.log('[RestaurantStore] addRestaurantToStore called with:', restaurant.name, restaurant.id);
    
    setRestaurants(prevRestaurants => {
      // Check if restaurant already exists
      const exists = prevRestaurants.find(r => r.id === restaurant.id);
      if (exists) {
        console.log('[RestaurantStore] Restaurant already exists in store:', restaurant.id);
        return prevRestaurants;
      }
      
      console.log('[RestaurantStore] Adding restaurant to store:', restaurant.id, restaurant.name);
      console.log('[RestaurantStore] Previous restaurant count:', prevRestaurants.length);
      const newRestaurants = [...prevRestaurants, restaurant];
      console.log('[RestaurantStore] New restaurant count:', newRestaurants.length);
      return newRestaurants;
    });
  }, []);

  // Increment collection views when clicked
  const incrementCollectionViews = useCallback(async (collectionId: string) => {
    try {
      console.log('[RestaurantStore] Incrementing views for collection:', collectionId);
      await dbHelpers.incrementCollectionViews(collectionId);
      
      // Invalidate collections query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
    } catch (error) {
      console.error('[RestaurantStore] Error incrementing collection views:', error);
    }
  }, [queryClient]);

  // Collection like functionality
  const [collectionLikes, setCollectionLikes] = useState<Record<string, boolean>>({});
  const [collectionLikeCounts, setCollectionLikeCounts] = useState<Record<string, number>>({});

  const toggleCollectionLike = useCallback(async (collectionId: string) => {
    if (!user?.id) {
      console.log('[RestaurantStore] User not authenticated, cannot like collection');
      return { success: false, liked: false };
    }

    try {
      console.log('[RestaurantStore] Toggling like for collection:', collectionId);
      const result = await dbHelpers.toggleCollectionLike(collectionId, user.id);
      
      if (result.success) {
        // Update local state
        setCollectionLikes(prev => ({
          ...prev,
          [collectionId]: result.liked
        }));
        
        // Update like count
        const newCount = await dbHelpers.getCollectionLikeCount(collectionId);
        setCollectionLikeCounts(prev => ({
          ...prev,
          [collectionId]: newCount
        }));
        
        // Invalidate collections query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['allCollections', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      }
      
      return result;
    } catch (error) {
      console.error('[RestaurantStore] Error toggling collection like:', error);
      return { success: false, liked: false };
    }
  }, [user?.id, queryClient]);

  const getCollectionLikeStatus = useCallback((collectionId: string) => {
    return collectionLikes[collectionId] || false;
  }, [collectionLikes]);

  const getCollectionLikeCount = useCallback((collectionId: string) => {
    return collectionLikeCounts[collectionId] || 0;
  }, [collectionLikeCounts]);

  // Follow/unfollow functionality for public collections
  const [followingCollections, setFollowingCollections] = useState<string[]>([]);

  const followCollection = useCallback(async (collectionId: string) => {
    if (!user?.id) {
      console.warn('[RestaurantStore] Cannot follow collection: user not authenticated');
      return { success: false, isFollowing: false };
    }

    try {
      // Add to following list
      setFollowingCollections(prev => {
        if (prev.includes(collectionId)) return prev;
        return [...prev, collectionId];
      });

      // Update collection follower count
      const updatedCollections = allCollectionsQuery.data?.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            followerCount: (collection.followerCount || 0) + 1,
            isFollowing: true
          };
        }
        return collection;
      });

      // Update the query cache
      if (updatedCollections) {
        queryClient.setQueryData(['allCollections', user?.id], updatedCollections);
      }

      console.log(`[RestaurantStore] Successfully followed collection: ${collectionId}`);
      return { success: true, isFollowing: true };
    } catch (error) {
      console.error(`[RestaurantStore] Error following collection: ${collectionId}`, error);
      return { success: false, isFollowing: false };
    }
  }, [user?.id, queryClient]);

  const unfollowCollection = useCallback(async (collectionId: string) => {
    if (!user?.id) {
      console.warn('[RestaurantStore] Cannot unfollow collection: user not authenticated');
      return { success: false, isFollowing: false };
    }

    try {
      // Remove from following list
      setFollowingCollections(prev => prev.filter(id => id !== collectionId));

      // Update collection follower count
      const updatedCollections = allCollectionsQuery.data?.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            followerCount: Math.max(0, (collection.followerCount || 0) - 1),
            isFollowing: false
          };
        }
        return collection;
      });

      // Update the query cache
      if (updatedCollections) {
        queryClient.setQueryData(['allCollections', user?.id], updatedCollections);
      }

      console.log(`[RestaurantStore] Successfully unfollowed collection: ${collectionId}`);
      return { success: true, isFollowing: false };
    } catch (error) {
      console.error(`[RestaurantStore] Error unfollowing collection: ${collectionId}`, error);
      return { success: false, isFollowing: false };
    }
  }, [user?.id, queryClient]);

  const isFollowingCollection = useCallback((collectionId: string) => {
    return followingCollections.includes(collectionId);
  }, [followingCollections]);

  const getFollowingCollections = useCallback(() => {
    return followingCollections;
  }, [followingCollections]);

  // Load collection like statuses for current user
  const collectionLikesQuery = useQuery({
    queryKey: ['collectionLikes', user?.id || ''],
    queryFn: async () => {
      if (!user?.id) return {};
      
      try {
        const collections = allCollectionsQuery.data || [];
        const likeStatuses: Record<string, boolean> = {};
        const likeCounts: Record<string, number> = {};
        
        for (const collection of collections) {
          const isLiked = await dbHelpers.getCollectionLikeStatus(collection.id, user.id);
          const likeCount = await dbHelpers.getCollectionLikeCount(collection.id);
          
          likeStatuses[collection.id] = isLiked;
          likeCounts[collection.id] = likeCount;
        }
        
        setCollectionLikes(likeStatuses);
        setCollectionLikeCounts(likeCounts);
        
        return { likeStatuses, likeCounts };
      } catch (error) {
        console.error('[RestaurantStore] Error loading collection likes:', error);
        return {};
      }
    },
    enabled: !!user?.id && !!allCollectionsQuery.data,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Debug logging for return values
  console.log('[RestaurantStore] Return values:');
  console.log('  - restaurants:', restaurants.length);
  console.log('  - restaurantsQuery.data:', restaurantsQuery.data?.length || 0);
  console.log('  - restaurantsQuery.isLoading:', restaurantsQuery.isLoading);
  console.log('  - restaurantsQuery.error:', restaurantsQuery.error);
  console.log('  - dataQuery.data?.restaurants:', dataQuery.data?.restaurants?.length || 0);
  console.log('  - dataQuery.isLoading:', dataQuery.isLoading);
  console.log('  - dataQuery.error:', dataQuery.error);
  console.log('  - plans:', plansQuery.data?.length || 0);
  console.log('  - allCollections:', allCollectionsQuery.data?.length || 0);
  console.log('  - isLoading:', restaurantsQuery.isLoading || plansQuery.isLoading || allCollectionsQuery.isLoading);
  
  // Add a simple test to verify data is loaded
  if (restaurants.length > 0 && plansQuery.data && plansQuery.data.length > 0) {
    console.log('🎉 DATA LOADED SUCCESSFULLY!');
    console.log('   - Restaurants available:', restaurants.length);
    console.log('   - Collections available:', plansQuery.data.length);
    console.log('   - Sample collection:', plansQuery.data[0]?.name);
    console.log('   - Sample collection restaurants:', plansQuery.data[0]?.restaurant_ids?.length || 0);
  } else {
    console.log('❌ DATA NOT LOADED PROPERLY');
    console.log('   - Restaurants:', restaurants.length);
    console.log('   - Collections:', plansQuery.data?.length || 0);
  }
  
  return {
    restaurants,
    plans: plansQuery.data || [],
    collections: plansQuery.data || [], // Alias for plans
    allCollections: allCollectionsQuery.data || [], // All public collections for discovery
    userCollections: userCollectionsQuery.data || [], // User-involved collections (shared and private)
    userVotes,
    discussions,
    favoriteRestaurants,
    isLoading: restaurantsQuery.isLoading || plansQuery.isLoading || allCollectionsQuery.isLoading,
    searchHistory,
    searchResults,
    userLocation,
    currentCity,
    addSearchQuery,
    clearSearchHistory,
    getQuickSuggestions,
    addRestaurantToPlan,
    removeRestaurantFromPlan,
    createPlan,
    deletePlan,
    toggleFavorite,
    voteRestaurant,
    addUserNote,
    addDiscussion,
    getRankedRestaurants,
    getRankedRestaurantsWithAllVotes,
    getGroupRecommendations,
    getCollectionRestaurants,
    getCollectionRestaurantsFromDatabase,
    getPlanDiscussions,
    refreshLocation,
    inviteToPlan,
    updatePlanSettings,
    switchToCity,
    shareablePlanUrl,
    // Collection operations
    addRestaurantToCollection,
    removeRestaurantFromCollection,
    deleteCollection,
    leaveCollection,
    isCollectionOwner,
    isCollectionMember,
    getCollectionDiscussions,
    inviteToCollection,
    updateCollectionSettings,
    getRestaurantVotingDetails,
    addRestaurantComment,
    getCollectionsByType,
    addMemberToCollection,
    removeMemberFromCollection,
    updateCollectionType,
    addRestaurantToStore,
    incrementCollectionViews,
    toggleCollectionLike,
    getCollectionLikeStatus,
    getCollectionLikeCount,
    // Follow/unfollow functionality for public collections
    followCollection,
    unfollowCollection,
    isFollowingCollection,
    getFollowingCollections,
    
    // Enhance restaurant with website data from Google Places
    enhanceRestaurantWithWebsite: async (restaurantId: string) => {
      try {
        console.log(`[RestaurantStore] Enhancing restaurant ${restaurantId} with website data...`);
        
        // Get the restaurant from the database
        const { data: restaurant, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        
        if (fetchError || !restaurant) {
          console.error('[RestaurantStore] Error fetching restaurant:', fetchError);
          return null;
        }
        
        // If restaurant already has website, return it
        if (restaurant.website) {
          console.log(`[RestaurantStore] Restaurant ${restaurant.name} already has website: ${restaurant.website}`);
          return restaurant;
        }
        
        // If restaurant has Google Place ID, get website from Google Places
        if (restaurant.google_place_id) {
          console.log(`[RestaurantStore] Getting website from Google Places for ${restaurant.name}...`);
          
          // Import the Google Places function
          const { getGooglePlaceDetails } = await import('@/services/api');
          const placeDetails = await getGooglePlaceDetails(restaurant.google_place_id);
          
          if (placeDetails?.website) {
            console.log(`[RestaurantStore] Found website for ${restaurant.name}: ${placeDetails.website}`);
            
            // Update the restaurant with website data
            const { data: updatedRestaurant, error: updateError } = await supabase
              .from('restaurants')
              .update({ 
                website: placeDetails.website,
                updated_at: new Date().toISOString()
              })
              .eq('id', restaurantId)
              .select()
              .single();
            
            if (updateError) {
              console.error('[RestaurantStore] Error updating restaurant with website:', updateError);
              return restaurant;
            }
            
            console.log(`[RestaurantStore] Successfully updated ${restaurant.name} with website`);
            return updatedRestaurant;
          }
        }
        
        console.log(`[RestaurantStore] No website data found for ${restaurant.name}`);
        return restaurant;
        
      } catch (error) {
        console.error('[RestaurantStore] Error enhancing restaurant with website:', error);
        return null;
      }
    }
  };
});

// Helper hooks for specific use cases
export function usePlanById(id: string | undefined) {
  const { plans } = useRestaurants();
  return useMemo(() => {
    if (!id || id === '') return null;
  return plans.find((p: any) => p.id === id);
  }, [plans, id]);
}

export function usePlanRestaurants(plan: any) {
  const { restaurants } = useRestaurants();
  
  return useMemo(() => {
    if (!plan || !plan.restaurant_ids) return [];
    return restaurants.filter((r: any) => plan.restaurant_ids.includes(r.id));
  }, [restaurants, plan]);
}

export function useRestaurantVotes(restaurantId: string | undefined, planId?: string) {
  const { userVotes } = useRestaurants();
  
  return useMemo(() => {
    if (!restaurantId || restaurantId === '') {
      return {
        likes: 0,
        dislikes: 0,
        userVote: undefined,
        allVotes: []
      };
    }
    
  const votes = userVotes.filter((v: any) => 
    v.restaurantId === restaurantId && 
    (!planId || v.collectionId === planId)
  );
  
  return {
    likes: votes.filter((v: any) => v.vote === 'like').length,
    dislikes: votes.filter((v: any) => v.vote === 'dislike').length,
    userVote: votes.find((v: any) => v.userId === 'currentUser')?.vote,
    allVotes: votes
  };
  }, [userVotes, restaurantId, planId]);
}

export function useCollectionRestaurants(collectionId: string | undefined) {
  const { plans, allCollections } = useRestaurants();
  
  // Fetch restaurants directly from database for this collection
  const collectionRestaurantsQuery = useQuery({
    queryKey: ['collectionRestaurants', collectionId || ''],
    queryFn: async () => {
      if (!collectionId) return [];
      
      try {
        // Find the collection
        let collection = allCollections?.find((c: any) => c && c.id === collectionId);
        
        // If not found in allCollections, try plans (private collections)
        if (!collection) {
          collection = plans?.find((p: any) => p && p.id === collectionId);
        }
        
        if (!collection) {
          console.log(`[useCollectionRestaurants] No collection found for ${collectionId}`);
          return [];
        }
        
        if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
          console.log(`[useCollectionRestaurants] No restaurant_ids in collection for ${collectionId}`);
          return [];
        }
        
        console.log(`[useCollectionRestaurants] Collection ${collectionId} has ${collection.restaurant_ids.length} restaurant IDs:`, collection.restaurant_ids);
        
        // Fetch restaurants directly from database by IDs using dbHelpers
        const restaurants = await dbHelpers.getRestaurantsByIds(collection.restaurant_ids);
        
        if (!restaurants) {
          console.log(`[useCollectionRestaurants] No restaurants found for collection ${collectionId}`);
          return [];
        }
        
        // Map database format to component format
        const mappedRestaurants = restaurants.map((dbRestaurant: any) => ({
          id: dbRestaurant.id,
          name: dbRestaurant.name,
          cuisine: dbRestaurant.cuisine,
          priceRange: dbRestaurant.price_range,
          imageUrl: dbRestaurant.image_url,
          images: dbRestaurant.images || [],
          address: dbRestaurant.address,
          neighborhood: dbRestaurant.neighborhood,
          hours: dbRestaurant.hours,
          vibe: dbRestaurant.vibe || [],
          description: dbRestaurant.description,
          menuHighlights: dbRestaurant.menu_highlights || [],
          rating: dbRestaurant.rating,
          reviews: dbRestaurant.reviews || [],
          aiDescription: dbRestaurant.ai_description,
          aiVibes: dbRestaurant.ai_vibes || [],
          aiTopPicks: dbRestaurant.ai_top_picks || [],
          phone: dbRestaurant.phone,
          website: dbRestaurant.website,
          priceLevel: dbRestaurant.price_level,
          userNotes: dbRestaurant.userNotes || '',
          restaurant_code: dbRestaurant.restaurant_code,
          city: dbRestaurant.city,
          state: dbRestaurant.state,
          googlePlaceId: dbRestaurant.googlePlaceId,
          googleRating: dbRestaurant.googleRating,
          googlePhotos: dbRestaurant.googlePhotos,
          editorialSummary: dbRestaurant.editorial_summary,
          // TripAdvisor integration fields
          tripadvisor_location_id: dbRestaurant.tripadvisor_location_id,
          tripadvisor_rating: dbRestaurant.tripadvisor_rating,
          tripadvisor_review_count: dbRestaurant.tripadvisor_review_count,
          tripadvisor_photos: dbRestaurant.tripadvisor_photos,
          tripadvisor_last_updated: dbRestaurant.tripadvisor_last_updated
        }));
        
        console.log(`[useCollectionRestaurants] Found ${mappedRestaurants.length} restaurants for collection ${collectionId}`);
        if (mappedRestaurants.length > 0) {
          console.log(`[useCollectionRestaurants] Restaurant names:`, mappedRestaurants.map(r => r.name));
        }
        
        return mappedRestaurants;
      } catch (error) {
        console.error(`[useCollectionRestaurants] Unexpected error:`, error);
        return [];
      }
    },
    enabled: !!collectionId,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  
  return collectionRestaurantsQuery.data || [];
}

// Enhanced collection hook with member details
export function useCollectionById(id: string | undefined) {
  const { plans, allCollections } = useRestaurants();
  
  // Add null check for id
  if (!id || id === '') {
    console.log('[useCollectionById] No ID provided');
    return null;
  }
  
  // Add null check for plans and allCollections
  if ((!plans || !Array.isArray(plans)) && (!allCollections || !Array.isArray(allCollections))) {
    console.log('[useCollectionById] No plans or allCollections available');
    return null;
  }
  
  // First try to find in allCollections (public collections)
  let collection = allCollections?.find((c: any) => c && c.id === id);
  
  // If not found in allCollections, try plans (private collections)
  if (!collection) {
    collection = plans?.find((p: any) => p && p.id === id);
  }
  
  // Fetch collection members with proper names (only for private collections from plans)
  const membersQuery = useQuery({
    queryKey: ['collectionMembers', id || ''],
    queryFn: async () => {
      if (!id) return [];
      try {
        const members = await dbHelpers.getCollectionMembers(id);
        return members;
      } catch (error) {
        console.error('[useCollectionById] Error fetching members:', error);
        return [];
      }
    },
    enabled: !!id && !collection?.is_public, // Only enabled for private collections
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  
  return useMemo(() => {
    console.log(`[useCollectionById] Processing collection for ID: ${id}`, { 
      hasCollection: !!collection, 
      collectionName: collection?.name,
      isPublic: collection?.is_public,
      plansCount: plans?.length,
      allCollectionsCount: allCollections?.length
    });
    
    if (!collection) {
      console.log(`[useCollectionById] No collection found for ID: ${id}`);
      return null;
    }
    
    // Enhanced collection with proper member data
    return {
      ...collection,
      // For public collections, use the collaborators field directly
      // For private collections, use fetched members data
      collaborators: collection.is_public 
        ? ((collection as any).collaborators || [])
        : (membersQuery.data && Array.isArray(membersQuery.data) && membersQuery.data.length > 0 
            ? membersQuery.data
            : []),
      // Add loading state for members (only relevant for private collections)
      membersLoading: collection.is_public ? false : membersQuery.isLoading
    };
  }, [collection, membersQuery.data, membersQuery.isLoading, id]);
}

// Hook to get a specific restaurant by ID
export function useRestaurantById(id: string | undefined) {
  const { restaurants } = useRestaurants();
  
  return useMemo(() => {
    if (!id || id === '') {
      console.log('[useRestaurantById] No ID provided');
      return null;
    }
    
    console.log(`[useRestaurantById] Looking for restaurant ID: ${id}`);
    console.log(`[useRestaurantById] Available restaurant IDs:`, restaurants.map(r => r.id));
    
    const found = restaurants.find((r: any) => r.id === id);
    console.log(`[useRestaurantById] Found restaurant:`, found?.name || 'NOT FOUND');
    
    return found;
  }, [restaurants, id]);
}