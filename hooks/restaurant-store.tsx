import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
// Removed mock data imports - only use real data from database
import { computeRankings, generateGroupRecommendations } from '@/utils/ranking';
import { aggregateRestaurantData, getUserLocation, getCollectionCoverImage, getEnhancedCollectionCoverImage, getUnsplashCollectionCoverImage, getCollectionCoverImageFallback, searchRestaurantsWithAPI } from '@/services/api';
import { dbHelpers, Database, supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/auth-store';

type Plan = Database['public']['Tables']['collections']['Row'];

interface RestaurantStore {
  restaurants: Restaurant[];
  plans: Plan[];
  collections: Plan[]; // Alias for plans for backward compatibility
  userVotes: RestaurantVote[];
  discussions: RestaurantDiscussion[];
  favoriteRestaurants: string[];
  isLoading: boolean;
  searchHistory: string[];
  searchResults: Restaurant[];
  userLocation: { city: string; lat: number; lng: number } | null;
  searchRestaurants: (query: string) => Promise<Restaurant[]>;
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  getQuickSuggestions: () => string[];
  addRestaurantToPlan: (planId: string, restaurantId: string) => Promise<void>;
  removeRestaurantFromPlan: (planId: string, restaurantId: string) => Promise<void>;
  createPlan: (plan: { 
    name: string; 
    description?: string; 
    plannedDate?: string; 
    isPublic?: boolean; 
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
  switchToCity: (city: 'New York' | 'Los Angeles') => void;
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
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);

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
    userNotes: dbRestaurant.userNotes || []
  }), []);

  // Load restaurants from database
  const restaurantsQuery = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        console.log('[RestaurantStore] Loading restaurants from database...');
        // Fetch restaurants from database instead of external APIs
        const restaurantsData = await dbHelpers.getAllRestaurants();
        console.log('[RestaurantStore] Raw restaurant data:', restaurantsData?.length || 0);
        
        if (!restaurantsData) throw new Error('No restaurants data returned');
        
        if (restaurantsData && restaurantsData.length > 0) {
          const mappedRestaurants = restaurantsData.map(mapDatabaseRestaurant);
          console.log('[RestaurantStore] Mapped restaurants:', mappedRestaurants.length);
          console.log('[RestaurantStore] Sample restaurant IDs:', mappedRestaurants.slice(0, 3).map(r => r.id));
          console.log('[RestaurantStore] All restaurant IDs from database:', mappedRestaurants.map(r => r.id));
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
        const favorites = await dbHelpers.getUserFavorites(user?.id || '');
        return favorites;
      } catch (error) {
        // Fallback to AsyncStorage
        const storedFavorites = await AsyncStorage.getItem('favoriteRestaurants');
        return storedFavorites ? JSON.parse(storedFavorites) : [];
      }
    },
    enabled: true, // Always enabled to maintain hook order
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
      const [storedVotes, storedDiscussions, storedNotes, storedSearchHistory, location] = await Promise.all([
        AsyncStorage.getItem('userVotes'),
        AsyncStorage.getItem('discussions'),
        AsyncStorage.getItem('restaurantNotes'),
        AsyncStorage.getItem('searchHistory'),
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
        favoriteRestaurants: favoritesQuery.data || [],
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
    console.log('[RestaurantStore] useEffect - restaurants.length:', restaurants.length);
    console.log('[RestaurantStore] useEffect - dataQuery.data?.restaurants:', dataQuery.data?.restaurants?.length);
    console.log('[RestaurantStore] useEffect - restaurantsQuery.data:', restaurantsQuery.data?.length);
    console.log('[RestaurantStore] useEffect - user ID:', user?.id);
    
    // Prioritize restaurantsQuery.data as it's the most direct source
    if (restaurantsQuery.data && restaurantsQuery.data.length > 0) {
      console.log('[RestaurantStore] Setting restaurants from restaurantsQuery.data');
      setRestaurants(restaurantsQuery.data);
    } else if (dataQuery.data?.restaurants && dataQuery.data.restaurants.length > 0) {
      console.log('[RestaurantStore] Setting restaurants from dataQuery.data');
      setRestaurants(dataQuery.data.restaurants);
    } else if (restaurants.length === 0) {
      console.log('[RestaurantStore] No restaurants available from any source');
      setRestaurants([]);
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
            memberCount: Array.isArray(collection.collaborators) ? collection.collaborators.length : 0,
            isOwner: collection.created_by === user?.id,
            isMember: Array.isArray(collection.collaborators) && collection.collaborators.includes(user?.id)
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
          console.log('[RestaurantStore] ⚠️ No plans found for user, falling back to public collections');
          const publicCollections = await dbHelpers.getAllCollections();
          const mappedCollections = (publicCollections || [])
            .map(mapCollectionData)
            .filter(Boolean);
          
          console.log('[RestaurantStore] ✅ Fallback collections loaded:', mappedCollections.length);
          return mappedCollections;
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
        try {
          console.log('[RestaurantStore] 🔄 Attempting enhanced fallback to public collections');
          const publicCollections = await dbHelpers.getAllCollections();
          const mappedCollections = (publicCollections || [])
            .map((plan: any) => ({
              ...plan,
              restaurant_ids: Array.isArray(plan.restaurant_ids) ? plan.restaurant_ids : [],
              collaborators: Array.isArray(plan.collaborators) ? plan.collaborators : [],
              settings: {
                voteVisibility: plan.vote_visibility || 'public',
                discussionEnabled: plan.discussion_enabled !== false,
                autoRankingEnabled: plan.auto_ranking_enabled !== false,
                consensusThreshold: plan.consensus_threshold ? plan.consensus_threshold / 100 : 0.7
              },
              restaurantCount: Array.isArray(plan.restaurant_ids) ? plan.restaurant_ids.length : 0,
              memberCount: Array.isArray(plan.collaborators) ? plan.collaborators.length : 0,
              isOwner: plan.created_by === user?.id,
              isMember: Array.isArray(plan.collaborators) && plan.collaborators.includes(user?.id)
            }))
            .filter(Boolean);
          
          console.log('[RestaurantStore] ✅ Enhanced fallback successful, found:', mappedCollections.length, 'collections');
          return mappedCollections;
        } catch (fallbackError) {
          console.error('[RestaurantStore] ❌ Enhanced fallback also failed:', fallbackError);
          console.log('[RestaurantStore] 🚨 Returning empty array as last resort');
          return [];
        }
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

  // Load all public collections for discovery
  const allCollectionsQuery = useQuery({
    queryKey: ['allCollections'],
    queryFn: async () => {
      try {
        const collections = await dbHelpers.getAllCollections();
        return collections.map((collection: any) => ({
          ...collection,
          collaborators: collection.collaborators || [],
          settings: {
            voteVisibility: collection.vote_visibility || 'public',
            discussionEnabled: collection.discussion_enabled !== false,
            autoRankingEnabled: collection.auto_ranking_enabled !== false,
            consensusThreshold: collection.consensus_threshold ? collection.consensus_threshold / 100 : 0.7
          }
        }));
      } catch (error) {
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await dbHelpers.createPlan(planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async ({ planId, userId }: { planId: string; userId: string }) => {
      return await dbHelpers.deletePlan(planId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
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
      return await dbHelpers.updateUserFavorites(userId, favoriteRestaurants);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
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
  const searchRestaurants = useCallback(async (query: string): Promise<Restaurant[]> => {
    try {
      const results = await searchRestaurantsWithAPI(query, userLocation?.city || 'New York');
      setSearchResults(results);
      return results;
    } catch (error) {
      // Fallback to local search
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.neighborhood.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      return filtered;
    }
  }, [restaurants, userLocation]);

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
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return;

    const updatedRestaurantIds = [...(plan.restaurant_ids || []), restaurantId];
    await dbHelpers.updatePlan(planId, { restaurant_ids: updatedRestaurantIds });
    queryClient.invalidateQueries({ queryKey: ['userPlans'] });
  }, [plansQuery.data, queryClient]);

  const removeRestaurantFromPlan = useCallback(async (planId: string, restaurantId: string) => {
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return;

    const updatedRestaurantIds = (plan.restaurant_ids || []).filter((id: string) => id !== restaurantId);
    await dbHelpers.updatePlan(planId, { restaurant_ids: updatedRestaurantIds });
    queryClient.invalidateQueries({ queryKey: ['userPlans'] });
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
    if (!user?.id) return;

    const newFavorites = favoriteRestaurants.includes(restaurantId)
      ? favoriteRestaurants.filter(id => id !== restaurantId)
      : [...favoriteRestaurants, restaurantId];

    setFavoriteRestaurants(newFavorites);
    toggleFavoriteMutation.mutate({ userId: user.id, favoriteRestaurants: newFavorites });
  }, [favoriteRestaurants, user?.id, toggleFavoriteMutation]);

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

      // Update the plan's collaborators to include user names from votes
      const updatedPlan = {
        ...plan,
        collaborators: plan.collaborators || []
      };

      // Get collection member IDs
      const collectionMemberIds = new Set(updatedPlan.collaborators.map((c: any) => typeof c === 'string' ? c : c.userId || c.id));
      
      // Filter votes to only include collection members
      const memberVotes = transformedVotes.filter(vote => collectionMemberIds.has(vote.userId));
      console.log('[getRankedRestaurantsWithAllVotes] Filtered to member votes:', memberVotes.length, 'out of', transformedVotes.length);

      // Add any users from votes who aren't in collaborators (but only if they're supposed to be members)
      const voteUserIds = new Set(transformedVotes.map(v => v.userId));
      const existingCollaboratorIds = new Set(updatedPlan.collaborators.map((c: any) => typeof c === 'string' ? c : c.userId || c.id));
      
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

      // Update the plan's collaborators to include user names from votes
      const updatedPlan = {
        ...plan,
        collaborators: plan.collaborators || []
      };

      // Get collection member IDs
      const collectionMemberIds = new Set(updatedPlan.collaborators.map((c: any) => typeof c === 'string' ? c : c.userId || c.id));
      
      // Filter votes to only include collection members
      const memberVotes = transformedVotes.filter(vote => collectionMemberIds.has(vote.userId));
      console.log('[getRankedRestaurantsWithAllVotes] Filtered to member votes:', memberVotes.length, 'out of', transformedVotes.length);

      // Add any users from votes who aren't in collaborators (but only if they're supposed to be members)
      const voteUserIds = new Set(transformedVotes.map(v => v.userId));
      const existingCollaboratorIds = new Set(updatedPlan.collaborators.map((c: any) => typeof c === 'string' ? c : c.userId || c.id));
      
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

      const rankings = computeRankings(planRestaurants, memberVotes, { memberCount, collection: updatedPlan });
      console.log('[getRankedRestaurantsWithAllVotes] Computed rankings:', rankings.length);

      // Extract participation data from the first result (all results have the same participation data)
      const participationData = rankings.length > 0 ? rankings[0].participationData : null;
      const rankedRestaurants = rankings.map(r => ({ restaurant: r.restaurant, meta: r.meta }));

      return { restaurants: rankedRestaurants, participationData };
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
    await dbHelpers.updatePlan(planId, settings);
    queryClient.invalidateQueries({ queryKey: ['userPlans'] });
  }, [queryClient]);

  const switchToCity = useCallback((city: 'New York' | 'Los Angeles') => {
    setUserLocation(prev => prev ? { ...prev, city } : { city, lat: 0, lng: 0 });
  }, []);

  const shareablePlanUrl = useCallback((planId: string) => {
    return `https://yourapp.com/plan/${planId}`;
  }, []);

  // Collection operations (aliases for backward compatibility)
  const addRestaurantToCollection = addRestaurantToPlan;
  const removeRestaurantFromCollection = removeRestaurantFromPlan;
  const deleteCollection = deletePlan;
  const leaveCollection = useCallback(async (collectionId: string) => {
    if (!user?.id) return;
    await dbHelpers.leaveCollection(collectionId, user.id);
    queryClient.invalidateQueries({ queryKey: ['userPlans'] });
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
    try {
      return await dbHelpers.getCollectionDiscussions(collectionId, restaurantId);
    } catch (error) {
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
      return await dbHelpers.addMemberToCollection(collectionId, userId, role);
    } catch (error) {
      throw error;
    }
  }, []);

  const removeMemberFromCollection = useCallback(async (collectionId: string, userId: string) => {
    try {
      await dbHelpers.removeMemberFromCollection(collectionId, userId);
    } catch (error) {
      throw error;
    }
  }, []);

  const updateCollectionType = useCallback(async (collectionId: string, collectionType: 'public' | 'private' | 'shared') => {
    try {
      return await dbHelpers.updateCollectionType(collectionId, collectionType);
    } catch (error) {
      throw error;
    }
  }, []);

  // Debug logging for return values
  console.log('[RestaurantStore] Return values:');
  console.log('  - restaurants:', restaurants.length);
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
    userVotes,
    discussions,
    favoriteRestaurants,
    isLoading: restaurantsQuery.isLoading || plansQuery.isLoading || allCollectionsQuery.isLoading,
    searchHistory,
    searchResults,
    userLocation,
    searchRestaurants,
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
    updateCollectionType
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
  const { restaurants, plans } = useRestaurants();
  
  return useMemo(() => {
    if (!collectionId || collectionId === '') {
      console.log(`[useCollectionRestaurants] No collectionId provided`);
      return [];
    }
    
    console.log(`[useCollectionRestaurants] Processing collection ${collectionId}`);
    console.log(`[useCollectionRestaurants] Available plans:`, plans.length);
    console.log(`[useCollectionRestaurants] Available restaurants:`, restaurants.length);
    
    // Find the plan/collection
    const plan = plans.find((p: any) => p.id === collectionId);
    if (!plan) {
      console.log(`[useCollectionRestaurants] No plan found for collection ${collectionId}`);
      return [];
    }
    
    if (!plan.restaurant_ids) {
      console.log(`[useCollectionRestaurants] No restaurant_ids in plan for collection ${collectionId}`);
      return [];
    }
    
    console.log(`[useCollectionRestaurants] Collection ${collectionId} has ${plan.restaurant_ids.length} restaurant IDs:`, plan.restaurant_ids);
    console.log(`[useCollectionRestaurants] Available restaurant IDs:`, restaurants.map(r => r.id));
    
    // Return restaurants that are in this collection
    const collectionRestaurants = restaurants.filter((r: any) => 
      r && r.id && plan.restaurant_ids && Array.isArray(plan.restaurant_ids) && plan.restaurant_ids.includes(r.id)
    );
    
    console.log(`[useCollectionRestaurants] Found ${collectionRestaurants.length} restaurants for collection ${collectionId}`);
    if (collectionRestaurants.length > 0) {
      console.log(`[useCollectionRestaurants] Restaurant names:`, collectionRestaurants.map(r => r.name));
    }
    return collectionRestaurants;
  }, [restaurants, plans, collectionId]);
}

// Enhanced collection hook with member details
export function useCollectionById(id: string | undefined) {
  const { plans } = useRestaurants();
  
  // Add null check for id
  if (!id || id === '') {
    console.log('[useCollectionById] No ID provided');
    return null;
  }
  
  // Add null check for plans
  if (!plans || !Array.isArray(plans)) {
    console.log('[useCollectionById] No plans available');
    return null;
  }
  
  const collection = plans.find((p: any) => p && p.id === id);
  
  // Fetch collection members with proper names
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
    enabled: !!id, // Only enabled if we have an ID
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  
  return useMemo(() => {
    console.log(`[useCollectionById] Processing collection for ID: ${id}`, { 
      hasCollection: !!collection, 
      collectionName: collection?.name,
      plansCount: plans?.length 
    });
    
    if (!collection) {
      console.log(`[useCollectionById] No collection found for ID: ${id}`);
      return null;
    }
    
    // Enhanced collection with proper member data
    return {
      ...collection,
      // Use fetched members data
      collaborators: membersQuery.data && Array.isArray(membersQuery.data) && membersQuery.data.length > 0 
        ? membersQuery.data
        : [],
      // Add loading state for members
      membersLoading: membersQuery.isLoading
    };
  }, [collection, membersQuery.data, membersQuery.isLoading, id]);
}

// Hook to get a specific restaurant by ID
export function useRestaurantById(id: string | undefined) {
  const { restaurants } = useRestaurants();
  
  return useMemo(() => {
    if (!id || id === '') return null;
    return restaurants.find((r: any) => r.id === id);
  }, [restaurants, id]);
}