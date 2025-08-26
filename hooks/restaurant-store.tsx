import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
import { mockRestaurants, mockVotes, mockDiscussions } from '@/mocks/restaurants';
import { computeRankings, generateGroupRecommendations } from '@/utils/ranking';
import { aggregateRestaurantData, getUserLocation, getCollectionCoverImage, getEnhancedCollectionCoverImage, getUnsplashCollectionCoverImage, getCollectionCoverImageFallback, searchRestaurantsWithAPI } from '@/services/api';
import { dbHelpers, Database } from '@/services/supabase';
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
  getRankedRestaurants: (planId?: string, memberCount?: number) => { restaurant: Restaurant; meta: RankedRestaurantMeta }[];
  getGroupRecommendations: (planId: string) => GroupRecommendation[];
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

  // Fallback mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (restaurants.length === 0) {
        setRestaurants(mockRestaurants);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [restaurants.length]);

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
          return mappedRestaurants;
        } else {
          console.log('[RestaurantStore] No restaurants in database, using mock data');
          // Fallback to mock data if no restaurants in database
          return mockRestaurants;
        }
      } catch (error) {
        console.error('[RestaurantStore] Error loading restaurants from database:', error);
        // Fallback to mock data if database fails
        return mockRestaurants;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Load user votes from database
  const votesQuery = useQuery({
    queryKey: ['userVotes', user?.id],
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
        // Fallback to AsyncStorage
        const storedVotes = await AsyncStorage.getItem('userVotes');
        return storedVotes ? JSON.parse(storedVotes) : mockVotes;
      }
    },
    enabled: !!user?.id,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Load favorites from database
  const favoritesQuery = useQuery({
    queryKey: ['userFavorites', user?.id],
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
    enabled: !!user?.id,
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
      const restaurantsWithNotes = (restaurantsQuery.data || mockRestaurants).map((r: any) => ({
        ...r,
        userNotes: notes[r.id] || r.userNotes
      }));

      return {
        restaurants: restaurantsWithNotes,
        userVotes: votesQuery.data || (storedVotes ? JSON.parse(storedVotes) : mockVotes),
        discussions: discussionsQuery.data || (storedDiscussions ? JSON.parse(storedDiscussions) : mockDiscussions),
        favoriteRestaurants: favoritesQuery.data || [],
        searchHistory: storedSearchHistory ? JSON.parse(storedSearchHistory) : [],
        userLocation: location
      };
    },
    enabled: !!restaurantsQuery.data && !!favoritesQuery.data,
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
    
    if (restaurants.length === 0 && dataQuery.data?.restaurants) {
      console.log('[RestaurantStore] Setting restaurants from dataQuery.data');
      setRestaurants(dataQuery.data.restaurants);
    } else if (restaurants.length === 0 && restaurantsQuery.data) {
      console.log('[RestaurantStore] Setting restaurants from restaurantsQuery.data');
      setRestaurants(restaurantsQuery.data);
    } else if (restaurants.length === 0) {
      console.log('[RestaurantStore] Setting restaurants from mockRestaurants');
      setRestaurants(mockRestaurants);
    }
  }, [restaurants.length, dataQuery.data, restaurantsQuery.data]);

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

  // Load user plans/collections
  const plansQuery = useQuery({
    queryKey: ['userPlans', user?.id],
    queryFn: async () => {
      try {
        // If no user ID, try to get all public collections as fallback
        if (!user?.id) {
          console.log('[RestaurantStore] No user ID, loading public collections as fallback');
          const publicCollections = await dbHelpers.getAllCollections();
          return publicCollections.map((plan: any) => ({
            ...plan,
            collaborators: plan.collaborators || [],
            settings: {
              voteVisibility: plan.vote_visibility || 'public',
              discussionEnabled: plan.discussion_enabled !== false,
              autoRankingEnabled: plan.auto_ranking_enabled !== false,
              consensusThreshold: plan.consensus_threshold ? plan.consensus_threshold / 100 : 0.7
            }
          }));
        }
        
        console.log('[RestaurantStore] Loading plans for user:', user.id);
        const plans = await dbHelpers.getUserPlans(user.id);
        console.log('[RestaurantStore] Raw plans data:', plans?.length || 0);
        
        // If no plans found for user, fallback to public collections
        if (!plans || plans.length === 0) {
          console.log('[RestaurantStore] No plans found for user, loading public collections');
          const publicCollections = await dbHelpers.getAllCollections();
          return publicCollections.map((plan: any) => ({
            ...plan,
            collaborators: plan.collaborators || [],
            settings: {
              voteVisibility: plan.vote_visibility || 'public',
              discussionEnabled: plan.discussion_enabled !== false,
              autoRankingEnabled: plan.auto_ranking_enabled !== false,
              consensusThreshold: plan.consensus_threshold ? plan.consensus_threshold / 100 : 0.7
            }
          }));
        }
        
        const mappedPlans = plans.map((plan: any) => ({
          ...plan,
          collaborators: plan.collaborators || [],
          settings: {
            voteVisibility: plan.vote_visibility || 'public',
            discussionEnabled: plan.discussion_enabled !== false,
            autoRankingEnabled: plan.auto_ranking_enabled !== false,
            consensusThreshold: plan.consensus_threshold ? plan.consensus_threshold / 100 : 0.7
          }
        }));
        
        console.log('[RestaurantStore] Mapped plans:', mappedPlans.length);
        mappedPlans.forEach((plan, i) => {
          console.log(`[RestaurantStore] Plan ${i}: ${plan.name} - restaurant_ids: ${plan.restaurant_ids?.length || 0}`);
        });
        
        return mappedPlans;
      } catch (error) {
        console.error('[RestaurantStore] Error loading plans:', error);
        // Fallback to public collections on error
        try {
          const publicCollections = await dbHelpers.getAllCollections();
          return publicCollections.map((plan: any) => ({
            ...plan,
            collaborators: plan.collaborators || [],
            settings: {
              voteVisibility: plan.vote_visibility || 'public',
              discussionEnabled: plan.discussion_enabled !== false,
              autoRankingEnabled: plan.auto_ranking_enabled !== false,
              consensusThreshold: plan.consensus_threshold ? plan.consensus_threshold / 100 : 0.7
            }
          }));
        } catch (fallbackError) {
          console.error('[RestaurantStore] Fallback also failed:', fallbackError);
          return [];
        }
      }
    },
    enabled: true, // Always enabled, even without user ID
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });

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
      return await dbHelpers.voteRestaurant(voteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
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

    await addDiscussionMutation.mutateAsync({
      restaurant_id: restaurantId,
      collection_id: planId,
      user_id: user.id,
      message
    });
  }, [user?.id, addDiscussionMutation]);

  const getRankedRestaurants = useCallback((planId?: string, memberCount: number = 1) => {
    if (!planId) return [];

    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan || !plan.restaurant_ids) return [];

    const planRestaurants = restaurants.filter(r => plan.restaurant_ids.includes(r.id));
    const votes = userVotes.filter(v => v.collectionId === planId);

    return computeRankings(planRestaurants, votes, { memberCount });
  }, [plansQuery.data, restaurants, userVotes]);

  const getGroupRecommendations = useCallback((planId: string) => {
    const rankedRestaurants = getRankedRestaurants(planId);
    return []; // Simplified for now
  }, [getRankedRestaurants]);

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
    getGroupRecommendations,
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
export function usePlanById(id: string) {
  const { plans } = useRestaurants();
  return useMemo(() => plans.find((p: any) => p.id === id), [plans, id]);
}

export function usePlanRestaurants(plan: any) {
  const { restaurants } = useRestaurants();
  
  return useMemo(() => {
    if (!plan) return [];
    return restaurants.filter((r: any) => plan.restaurant_ids.includes(r.id));
  }, [restaurants, plan]);
}

export function useRestaurantVotes(restaurantId: string, planId?: string) {
  const { userVotes } = useRestaurants();
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
}

export function useCollectionRestaurants(collectionId: string) {
  const { restaurants, plans } = useRestaurants();
  
  return useMemo(() => {
    // Find the plan/collection
    const plan = plans.find((p: any) => p.id === collectionId);
    if (!plan || !plan.restaurant_ids) {
      console.log(`[useCollectionRestaurants] No plan found for collection ${collectionId} or no restaurant_ids`);
      return [];
    }
    
    console.log(`[useCollectionRestaurants] Collection ${collectionId} has ${plan.restaurant_ids.length} restaurant IDs:`, plan.restaurant_ids);
    console.log(`[useCollectionRestaurants] Available restaurants:`, restaurants.length);
    
    // Return restaurants that are in this collection
    const collectionRestaurants = restaurants.filter((r: any) => 
      r && r.id && plan.restaurant_ids && Array.isArray(plan.restaurant_ids) && plan.restaurant_ids.includes(r.id)
    );
    
    console.log(`[useCollectionRestaurants] Found ${collectionRestaurants.length} restaurants for collection ${collectionId}`);
    return collectionRestaurants;
  }, [restaurants, plans, collectionId]);
}

// Enhanced collection hook with member details
export function useCollectionById(id: string) {
  const { plans } = useRestaurants();
  const collection = plans.find((p: any) => p.id === id);
  
  // Fetch collection members with proper names
  const membersQuery = useQuery({
    queryKey: ['collectionMembers', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const members = await dbHelpers.getCollectionMembers(id);
        return members;
      } catch (error) {
        return [];
      }
    },
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  
  return useMemo(() => {
    if (!collection) return null;
    
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
  }, [collection, membersQuery.data, membersQuery.isLoading]);
}