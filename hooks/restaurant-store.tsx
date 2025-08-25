import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
import { mockRestaurants, mockVotes, mockDiscussions } from '@/mocks/restaurants';
import { computeRankings, generateGroupRecommendations } from '@/utils/ranking';
import { aggregateRestaurantData, getUserLocation } from '@/services/api';
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
  userLocation: { city: string; lat: number; lng: number } | null;
  searchRestaurants: (query: string) => Promise<Restaurant[]>;
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  getQuickSuggestions: () => string[];
  addRestaurantToPlan: (planId: string, restaurantId: string) => Promise<void>;
  removeRestaurantFromPlan: (planId: string, restaurantId: string) => Promise<void>;
  createPlan: (plan: { name: string; description?: string; plannedDate?: string; isPublic?: boolean; occasion?: string }) => Promise<void>;
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
  getCollectionDiscussions: (collectionId: string, restaurantId?: string) => Promise<any[]>;
  inviteToCollection: (collectionId: string, email: string, message?: string) => Promise<void>;
  updateCollectionSettings: (collectionId: string, settings: any) => Promise<void>;
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

  // Load user plans from database
  const plansQuery = useQuery({
    queryKey: ['userPlans', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[RestaurantStore] No user ID, returning empty plans');
        return [];
      }
      
      try {
        console.log('[RestaurantStore] Loading plans for user:', user.id);
        const plans = await dbHelpers.getUserPlans(user.id);
        console.log('[RestaurantStore] Loaded plans:', plans?.length || 0);
        return plans || [];
      } catch (error) {
        console.error('[RestaurantStore] Error loading plans:', error);
        if (error instanceof Error) {
          console.error('[RestaurantStore] Error details:', error.message);
        }
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Load restaurants from database
  const restaurantsQuery = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        // Try to load from database first
        const dbRestaurants = await dbHelpers.getAllRestaurants();
        if (dbRestaurants && dbRestaurants.length > 0) {
          return dbRestaurants.map(mapDatabaseRestaurant);
        }
      } catch (error) {
        console.log('No database restaurants found, using mock data');
      }
      
      // Fallback to mock data
      return mockRestaurants;
    }
  });

  // Load initial data and user location
  const dataQuery = useQuery({
    queryKey: ['restaurantData'],
    queryFn: async () => {
      const [storedVotes, storedDiscussions, storedFavorites, storedNotes, storedSearchHistory, location] = await Promise.all([
        AsyncStorage.getItem('userVotes'),
        AsyncStorage.getItem('discussions'),
        AsyncStorage.getItem('favoriteRestaurants'),
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
        userVotes: storedVotes ? JSON.parse(storedVotes) : mockVotes,
        discussions: storedDiscussions ? JSON.parse(storedDiscussions) : mockDiscussions,
        favoriteRestaurants: storedFavorites ? JSON.parse(storedFavorites) : [],
        searchHistory: storedSearchHistory ? JSON.parse(storedSearchHistory) : [],
        userLocation: location
      };
    },
    enabled: !!restaurantsQuery.data
  });

  // Helper function to map database restaurant format to component format
  const mapDatabaseRestaurant = useCallback((dbRestaurant: any): Restaurant => ({
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    cuisine: dbRestaurant.cuisine,
    priceRange: dbRestaurant.price_range as '$' | '$$' | '$$$' | '$$$$',
    imageUrl: dbRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    images: dbRestaurant.images || [dbRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
    address: dbRestaurant.address,
    neighborhood: dbRestaurant.neighborhood,
    hours: dbRestaurant.hours || 'Hours vary',
    vibe: dbRestaurant.vibe || [],
    description: dbRestaurant.description || 'A great dining experience awaits.',
    menuHighlights: dbRestaurant.menu_highlights || [],
    rating: dbRestaurant.rating || 0,
    reviews: dbRestaurant.reviews || [],
    aiDescription: dbRestaurant.ai_description,
    aiVibes: dbRestaurant.ai_vibes || [],
    aiTopPicks: dbRestaurant.ai_top_picks || [],
    contributors: [],
    commentsCount: 0,
    savesCount: 0,
    sharesCount: 0,
    averageGroupStars: dbRestaurant.rating || 0,
    userNotes: dbRestaurant.userNotes || ''
  }), []);

  useEffect(() => {
    if (dataQuery.data) {
      setRestaurants(dataQuery.data.restaurants);
      setUserVotes(dataQuery.data.userVotes);
      setDiscussions(dataQuery.data.discussions);
      setFavoriteRestaurants(dataQuery.data.favoriteRestaurants);
      setSearchHistory(dataQuery.data.searchHistory);
      setUserLocation(dataQuery.data.userLocation);
    }
  }, [dataQuery.data]);

  // Persist votes
  const persistVotes = useMutation({
    mutationFn: async (newVotes: RestaurantVote[]) => {
      await AsyncStorage.setItem('userVotes', JSON.stringify(newVotes));
      return newVotes;
    },
    onSuccess: (data) => {
      setUserVotes(data);
    }
  });

  // Persist discussions
  const persistDiscussions = useMutation({
    mutationFn: async (newDiscussions: RestaurantDiscussion[]) => {
      await AsyncStorage.setItem('discussions', JSON.stringify(newDiscussions));
      return newDiscussions;
    },
    onSuccess: (data) => {
      setDiscussions(data);
    }
  });

  // Persist favorites
  const { mutate: mutateFavorites } = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      await AsyncStorage.setItem('favoriteRestaurants', JSON.stringify(newFavorites));
      return newFavorites;
    },
    onSuccess: (data) => {
      setFavoriteRestaurants(data);
    }
  });

  // Persist notes
  const { mutate: mutateNotes } = useMutation({
    mutationFn: async ({ restaurantId, note }: { restaurantId: string; note: string }) => {
      const stored = await AsyncStorage.getItem('restaurantNotes');
      const notes = stored ? JSON.parse(stored) : {};
      notes[restaurantId] = note;
      await AsyncStorage.setItem('restaurantNotes', JSON.stringify(notes));
      return { restaurantId, note };
    },
    onSuccess: ({ restaurantId, note }) => {
      setRestaurants(prev => prev.map(r => 
        r.id === restaurantId ? { ...r, userNotes: note } : r
      ));
    }
  });

  // Persist search history
  const { mutate: mutateSearchHistory } = useMutation({
    mutationFn: async (history: string[]) => {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));
      return history.slice(0, 10);
    },
    onSuccess: (data) => setSearchHistory(data)
  });

  // Plan operations
  const addRestaurantToPlan = useCallback(async (planId: string, restaurantId: string) => {
    if (!user?.id) return;
    
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return;

    const updatedRestaurantIds = [...new Set([...plan.restaurant_ids, restaurantId])];
    await dbHelpers.updatePlan(planId, {
      restaurant_ids: updatedRestaurantIds,
      updated_at: new Date().toISOString()
    });
    
    queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
  }, [user?.id, plansQuery.data, queryClient]);

  const removeRestaurantFromPlan = useCallback(async (planId: string, restaurantId: string) => {
    if (!user?.id) return;
    
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return;

    const updatedRestaurantIds = plan.restaurant_ids.filter((id: string) => id !== restaurantId);
    await dbHelpers.updatePlan(planId, {
      restaurant_ids: updatedRestaurantIds,
      updated_at: new Date().toISOString()
    });
    
    queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
  }, [user?.id, plansQuery.data, queryClient]);

  const createPlan = useCallback(async (planData: { name: string; description?: string; plannedDate?: string; isPublic?: boolean; occasion?: string }) => {
    if (!user?.id) {
      console.error('[RestaurantStore] No user ID available for plan creation');
      throw new Error('User not authenticated');
    }

    console.log('[RestaurantStore] Creating plan:', planData);
    
    try {
      const planInsertData = {
        name: planData.name,
        description: planData.description,
        created_by: user.id,
        creator_id: user.id,
        occasion: planData.occasion,
        is_public: planData.isPublic || false,
        likes: 0,
        equal_voting: true,
        admin_weighted: false,
        expertise_weighted: false,
        minimum_participation: 1,
        allow_vote_changes: true,
        anonymous_voting: false,
        vote_visibility: 'public' as const,
        discussion_enabled: true,
        auto_ranking_enabled: true,
        consensus_threshold: 50,
        restaurant_ids: [],
        collaborators: []
      };

      // Only add planned_date if it's provided
      if (planData.plannedDate) {
        (planInsertData as any).planned_date = planData.plannedDate;
      }

      console.log('[RestaurantStore] Plan insert data:', planInsertData);
      
      const newPlan = await dbHelpers.createPlan(planInsertData);
      
      console.log('[RestaurantStore] Plan created successfully:', newPlan);
      queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
    } catch (error) {
      console.error('[RestaurantStore] Error creating plan:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create plan: ${error.message}`);
      } else {
        throw new Error('Failed to create plan: Unknown error occurred');
      }
    }
  }, [user?.id, queryClient]);

  const deletePlan = useCallback(async (planId: string) => {
    if (!user?.id) {
      console.error('[RestaurantStore] No user ID available for plan deletion');
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('[RestaurantStore] Deleting plan:', planId);
      await dbHelpers.deletePlan(planId);
      console.log('[RestaurantStore] Plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
    } catch (error) {
      console.error('[RestaurantStore] Error deleting plan:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete plan: ${error.message}`);
      } else {
        throw new Error('Failed to delete plan: Unknown error occurred');
      }
    }
  }, [user?.id, queryClient]);

  const inviteToPlan = useCallback(async (planId: string, email: string, message?: string) => {
    if (!user?.id) return;

    await dbHelpers.createInvitation({
      plan_id: planId,
      inviter_id: user.id,
      invitee_email: email,
      message,
      status: 'pending'
    });
  }, [user?.id]);

  const updatePlanSettings = useCallback(async (planId: string, settings: Partial<Plan>) => {
    if (!user?.id) return;
    
    await dbHelpers.updatePlan(planId, {
      ...settings,
      updated_at: new Date().toISOString()
    });
    
    queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
  }, [user?.id, queryClient]);

  const shareablePlanUrl = useCallback((planId: string) => {
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return '';
    return `https://yourapp.com/join/${plan.unique_code}`;
  }, [plansQuery.data]);

  // Collection operations (aliases for backward compatibility)
  const addRestaurantToCollection = useCallback(async (collectionId: string, restaurantId: string) => {
    if (!user?.id) {
      console.error('[RestaurantStore] No user ID available for adding restaurant to collection');
      return;
    }
    try {
      await dbHelpers.addRestaurantToCollection(collectionId, restaurantId, user.id);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
    } catch (error) {
      console.error('[RestaurantStore] Error adding restaurant to collection:', error);
      throw error;
    }
  }, [user?.id, queryClient]);
  
  const removeRestaurantFromCollection = useCallback((collectionId: string, restaurantId: string) => {
    return removeRestaurantFromPlan(collectionId, restaurantId);
  }, [removeRestaurantFromPlan]);
  
  const deleteCollection = useCallback((collectionId: string) => {
    return deletePlan(collectionId);
  }, [deletePlan]);
  const getCollectionDiscussions = useCallback(async (collectionId: string, restaurantId?: string) => {
    return await dbHelpers.getCollectionDiscussions(collectionId, restaurantId);
  }, []);
  const inviteToCollection = useCallback(async (collectionId: string, email: string, message?: string) => {
    if (!user?.id) return;
    return await dbHelpers.inviteToCollection(collectionId, user.id, email, message);
  }, [user?.id]);
  const updateCollectionSettings = useCallback(async (collectionId: string, settings: any) => {
    return await dbHelpers.updateCollectionSettings(collectionId, settings);
  }, []);

  // Other operations
  const toggleFavorite = useCallback((restaurantId: string) => {
    const updated = favoriteRestaurants.includes(restaurantId)
      ? favoriteRestaurants.filter((id: string) => id !== restaurantId)
      : [...favoriteRestaurants, restaurantId];
    mutateFavorites(updated);
  }, [favoriteRestaurants, mutateFavorites]);

  const voteRestaurant = useCallback((restaurantId: string, vote: 'like' | 'dislike', planId?: string, reason?: string) => {
    const existingVoteIndex = userVotes.findIndex((v: any) => 
      v.restaurantId === restaurantId && 
      v.userId === 'currentUser' && 
      v.collectionId === planId
    );
    let updated: RestaurantVote[];

    const now = new Date().toISOString();
    const base: Omit<RestaurantVote, 'vote'> = { 
      restaurantId, 
      userId: 'currentUser', 
      collectionId: planId,
      timestamp: now, 
      authority: 'regular', 
      weight: 1,
      reason
    };

    if (existingVoteIndex >= 0) {
      if (userVotes[existingVoteIndex].vote === vote) {
        updated = userVotes.filter((_: any, i: number) => i !== existingVoteIndex);
      } else {
        updated = userVotes.map((v: any, i: number) => (i === existingVoteIndex ? { ...v, vote, timestamp: now, reason } : v));
      }
    } else {
      updated = [...userVotes, { ...base, vote }];
    }

    persistVotes.mutate(updated);
  }, [userVotes, persistVotes.mutate]);

  const addUserNote = useCallback((restaurantId: string, note: string) => {
    mutateNotes({ restaurantId, note });
  }, [mutateNotes]);

  const addSearchQuery = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    const updated = [q, ...searchHistory.filter((item: string) => item.toLowerCase() !== q.toLowerCase())];
    mutateSearchHistory(updated);
  }, [searchHistory, mutateSearchHistory]);

  const clearSearchHistory = useCallback(() => {
    mutateSearchHistory([]);
  }, [mutateSearchHistory]);

  const getQuickSuggestions = useCallback(() => {
    const locationSuggestions = userLocation?.city === 'New York' 
      ? ['Italian in Manhattan', 'Sushi in SoHo', 'Brunch in Brooklyn', 'Pizza in Queens']
      : ['Tacos in Hollywood', 'Sushi in Beverly Hills', 'Brunch in Santa Monica', 'Korean BBQ in Koreatown'];
    
    const cuisines = restaurants.map((r: any) => r.cuisine?.split(/[,&]/)[0]?.trim() || r.cuisine || 'Unknown');
    const neighborhoods = restaurants.map((r: any) => r.neighborhood || 'Unknown');
    const popular = [...cuisines, ...neighborhoods]
      .reduce<Record<string, number>>((acc: any, cur: string) => {
        acc[cur] = (acc[cur] ?? 0) + 1;
        return acc;
      }, {});
    const sorted = Object.entries(popular)
      .sort((a: any, b: any) => b[1] - a[1])
      .map(([k]: any) => k);
    
    return [...searchHistory, ...locationSuggestions, ...sorted].slice(0, 8);
  }, [restaurants, searchHistory, userLocation]);

  const addDiscussion = useCallback((restaurantId: string, planId: string, message: string) => {
    const newDiscussion: RestaurantDiscussion = {
      id: `d${Date.now()}`,
      restaurantId,
      collectionId: planId,
      userId: 'currentUser',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      message,
      timestamp: new Date(),
      likes: 0
    };
    persistDiscussions.mutate([...discussions, newDiscussion]);
  }, [discussions, persistDiscussions.mutate]);

  const getRankedRestaurants = useCallback((planId?: string, memberCount?: number) => {
    const plan = planId ? plansQuery.data?.find((p: any) => p.id === planId) : undefined;
    const pool = planId
      ? restaurants.filter((r: any) => (plan?.restaurant_ids ?? []).includes(r.id))
      : restaurants;
    
    const planVotes = planId 
      ? userVotes.filter((v: any) => v.collectionId === planId)
      : userVotes;
    
    const discussionCounts = discussions
      .filter((d: any) => !planId || d.collectionId === planId)
      .reduce<Record<string, number>>((acc: any, d: any) => {
        acc[d.restaurantId] = (acc[d.restaurantId] || 0) + 1;
        return acc;
      }, {});
    
    // For now, use simplified ranking without collection compatibility
    return computeRankings(pool, planVotes, { 
      memberCount, 
      collection: undefined,
      discussions: discussionCounts 
    });
  }, [plansQuery.data, restaurants, userVotes, discussions]);

  const getGroupRecommendations = useCallback((planId: string) => {
    const plan = plansQuery.data?.find((p: any) => p.id === planId);
    if (!plan) return [];
    
    const pool = restaurants.filter((r: any) => plan.restaurant_ids.includes(r.id));
    const planVotes = userVotes.filter((v: any) => v.collectionId === planId);
    const discussionCounts = discussions
      .filter((d: any) => d.collectionId === planId)
      .reduce<Record<string, number>>((acc: any, d: any) => {
        acc[d.restaurantId] = (acc[d.restaurantId] || 0) + 1;
        return acc;
      }, {});
    
    // For now, use simplified ranking without collection compatibility
    const rankedRestaurants = computeRankings(pool, planVotes, { 
      memberCount: plan.collaborators.length, 
      collection: undefined,
      discussions: discussionCounts 
    });
    
    // Return empty recommendations for now - will be implemented later
    return [];
  }, [plansQuery.data, restaurants, userVotes, discussions]);

  const getPlanDiscussions = useCallback((planId: string, restaurantId?: string) => {
    return discussions.filter((d: any) => 
      d.collectionId === planId && 
      (!restaurantId || d.restaurantId === restaurantId)
    ).sort((a: any, b: any) => {
      const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    });
  }, [discussions]);

  const searchRestaurants = useCallback(async (query: string): Promise<Restaurant[]> => {
    const location = userLocation || { city: 'New York', lat: 40.7128, lng: -74.0060 };
    
    try {
      console.log(`Searching for: ${query} in ${location.city}`);
      const results = await aggregateRestaurantData(query, location.city);
      
      // Convert API results to Restaurant format
      const formattedResults: Restaurant[] = results.map(result => ({
        id: result.id,
        name: result.name,
        cuisine: result.cuisine,
        priceRange: '$'.repeat(Math.min(result.priceLevel || 2, 4)) as '$' | '$$' | '$$$' | '$$$$',
        imageUrl: result.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        images: result.photos,
        address: result.address || '',
        neighborhood: result.address?.split(',')[1]?.trim() || location.city || 'Unknown',
        hours: result.hours || 'Hours vary',
        vibe: result.vibeTags || [],
        description: result.description || 'A great dining experience awaits.',
        menuHighlights: result.topPicks || [],
        rating: result.rating,
        reviews: result.reviews || [],
        aiDescription: result.description,
        aiVibes: result.vibeTags,
        aiTopPicks: result.topPicks,
        contributors: [],
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
        averageGroupStars: result.rating
      }));

      // Add to local restaurants if not already present
      const existingIds = new Set(restaurants.map((r: any) => r.id));
      const newRestaurants = formattedResults.filter((r: any) => !existingIds.has(r.id));
      
      if (newRestaurants.length > 0) {
        setRestaurants((prev: any) => [...prev, ...newRestaurants]);
      }

      return formattedResults;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  }, [userLocation, restaurants]);

  const refreshLocation = useCallback(async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error refreshing location:', error);
    }
  }, []);

  const switchToCity = useCallback((city: 'New York' | 'Los Angeles') => {
    const coordinates = city === 'New York' 
      ? { city: 'New York', lat: 40.7128, lng: -74.0060 }
      : { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 };
    
    setUserLocation(coordinates);
    console.log(`[Location] Switched to ${city}`);
  }, []);

  // Memoize the store value to prevent unnecessary re-renders
  const storeValue = useMemo(() => ({
    restaurants,
    plans: plansQuery.data || [],
    collections: plansQuery.data || [], // Alias for backward compatibility
    userVotes,
    discussions,
    favoriteRestaurants,
    isLoading: dataQuery.isLoading || plansQuery.isLoading || restaurantsQuery.isLoading,
    searchHistory,
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
    getCollectionDiscussions,
    inviteToCollection,
    updateCollectionSettings,
  }), [
    restaurants,
    plansQuery.data,
    userVotes,
    discussions,
    favoriteRestaurants,
    dataQuery.isLoading,
    plansQuery.isLoading,
    searchHistory,
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
    getCollectionDiscussions,
    inviteToCollection,
    updateCollectionSettings,
  ]);

  return storeValue;
});

// Helper hooks
export function useRestaurantById(id: string) {
  const { restaurants } = useRestaurants();
  return restaurants.find((r: any) => r.id === id);
}

export function usePlanById(id: string) {
  const { plans } = useRestaurants();
  return plans.find((p: any) => p.id === id);
}

export function usePlanRestaurants(planId: string) {
  const { restaurants } = useRestaurants();
  const plan = usePlanById(planId);
  
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
    if (!plan || !plan.restaurant_ids) return [];
    
    // Return restaurants that are in this collection
    return restaurants.filter((r: any) => 
      r && r.id && plan.restaurant_ids && Array.isArray(plan.restaurant_ids) && plan.restaurant_ids.includes(r.id)
    );
  }, [restaurants, plans, collectionId]);
}

// Alias for backward compatibility
export function useCollectionById(id: string) {
  return usePlanById(id);
}