import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
import { mockRestaurants, mockVotes, mockDiscussions } from '@/mocks/restaurants';
import { computeRankings, generateGroupRecommendations } from '@/utils/ranking';
import { aggregateRestaurantData, getUserLocation, getCollectionCoverImage, getEnhancedCollectionCoverImage, getUnsplashCollectionCoverImage, searchRestaurantsWithAPI } from '@/services/api';
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
  leaveCollection: (collectionId: string) => Promise<void>;
  isCollectionOwner: (collectionId: string) => Promise<boolean>;
  isCollectionMember: (collectionId: string) => Promise<boolean>;
  getCollectionDiscussions: (collectionId: string, restaurantId?: string) => Promise<any[]>;
  inviteToCollection: (collectionId: string, email: string, message?: string) => Promise<void>;
  updateCollectionSettings: (collectionId: string, settings: any) => Promise<void>;
  getRestaurantVotingDetails: (restaurantId: string, planId: string) => any;
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
          console.log('[RestaurantStore] Loaded', dbRestaurants.length, 'restaurants from database');
          return dbRestaurants.map(mapDatabaseRestaurant);
        }
        
        // If no restaurants in database, try to populate with real data
        console.log('[RestaurantStore] No restaurants in database, populating with real data...');
        const realRestaurants = await populateDatabaseWithRealRestaurants();
        if (realRestaurants && realRestaurants.length > 0) {
          console.log('[RestaurantStore] Populated database with', realRestaurants.length, 'restaurants');
          return realRestaurants;
        }
      } catch (error) {
        console.error('[RestaurantStore] Error loading restaurants:', error);
      }
      
      // Fallback to mock data
      console.log('[RestaurantStore] Using mock data as fallback');
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
    priceRange: (dbRestaurant.price_range || dbRestaurant.price_level === 1 ? '$' : dbRestaurant.price_level === 2 ? '$$' : dbRestaurant.price_level === 3 ? '$$$' : '$$$$') as '$' | '$$' | '$$$' | '$$$$',
    imageUrl: dbRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    images: (dbRestaurant.images || [dbRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400']).filter((img: string) => img && img.trim().length > 0),
    address: dbRestaurant.address,
    neighborhood: dbRestaurant.neighborhood,
    hours: dbRestaurant.hours || 'Hours vary',
    vibe: dbRestaurant.vibe_tags || [],
    description: dbRestaurant.description || 'A great dining experience awaits.',
    menuHighlights: dbRestaurant.top_picks || [],
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
    userNotes: dbRestaurant.userNotes || null
  }), []);

  // Populate database with real restaurant data from multiple APIs
  const populateDatabaseWithRealRestaurants = useCallback(async (): Promise<Restaurant[]> => {
    try {
      console.log('[RestaurantStore] Populating database with real restaurant data...');
      
      // Get user location for proximity-based search
      const userLocation = await getUserLocation();
      if (!userLocation) {
        console.log('[RestaurantStore] Could not get user location, using default');
        return [];
      }

      const popularCuisines = ['Italian', 'Sushi', 'Pizza', 'Burgers', 'Thai', 'Mexican', 'Chinese', 'Indian'];
      const allRestaurants: Restaurant[] = [];
      
      // Search for restaurants by cuisine type near user location
      for (const cuisine of popularCuisines) {
        try {
          console.log(`[RestaurantStore] Searching for ${cuisine} restaurants near ${userLocation.city}...`);
          
          // Use the new location-based API with user coordinates
          const results = await aggregateRestaurantData(
            cuisine, 
            userLocation.city, 
            userLocation.lat, 
            userLocation.lng
          );
          
          if (results && results.length > 0) {
            // Take top 3 results per cuisine for variety
            const topResults = results.slice(0, 3);
            
            for (const result of topResults) {
              try {
                // Save to database
                const restaurantData = {
                  restaurant_code: `rest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: result.name,
                  cuisine: result.cuisine,
                  price_range: result.priceLevel === 1 ? '$' : result.priceLevel === 2 ? '$$' : result.priceLevel === 3 ? '$$$' : '$$$$',
                  image_url: result.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                  images: result.photos || ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
                  address: result.address,
                  neighborhood: userLocation.city,
                  hours: result.hours,
                  vibe_tags: result.vibeTags,
                  description: result.description,
                  top_picks: result.topPicks,
                  rating: result.rating,
                  reviews: result.reviews,
                  phone: result.phone,
                  website: result.website,
                  price_level: result.priceLevel,
                  vibe: result.vibeTags,
                  menu_highlights: result.topPicks,
                  ai_description: result.description,
                  ai_vibes: result.vibeTags,
                  ai_top_picks: result.topPicks,
                  latitude: result.location?.lat,
                  longitude: result.location?.lng
                };
                
                await dbHelpers.createRestaurant(restaurantData);
                console.log(`[RestaurantStore] Saved ${result.name} to database`);
                
                // Map to Restaurant format for return
                const mappedRestaurant = mapDatabaseRestaurant(restaurantData);
                allRestaurants.push(mappedRestaurant);
                
              } catch (error) {
                console.error(`[RestaurantStore] Error saving ${result.name}:`, error);
              }
            }
          }
          
          // Add delay between API calls to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`[RestaurantStore] Error searching for ${cuisine} restaurants:`, error);
        }
      }
      
      console.log(`[RestaurantStore] Successfully populated database with ${allRestaurants.length} restaurants`);
      return allRestaurants;
      
    } catch (error) {
      console.error('[RestaurantStore] Error populating database with real restaurants:', error);
      return [];
    }
  }, [mapDatabaseRestaurant]);

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
      // Get cover image first
      const coverImage = await getUnsplashCollectionCoverImage(planData.occasion || 'General');
      
      const planInsertData = {
        name: planData.name,
        description: planData.description,
        created_by: user.id,
        creator_id: user.id,
        occasion: planData.occasion,
        is_public: planData.isPublic || false,
        cover_image: coverImage,
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
      await dbHelpers.deletePlan(planId, user.id);
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
  
  const deleteCollection = useCallback(async (collectionId: string) => {
    if (!user?.id) {
      console.error('[RestaurantStore] No user ID available for collection deletion');
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('[RestaurantStore] Deleting collection:', collectionId);
      await dbHelpers.deletePlan(collectionId, user.id);
      console.log('[RestaurantStore] Collection deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
    } catch (error) {
      console.error('[RestaurantStore] Error deleting collection:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete collection: ${error.message}`);
      } else {
        throw new Error('Failed to delete collection: Unknown error occurred');
      }
    }
  }, [user?.id, queryClient]);

  const leaveCollection = useCallback(async (collectionId: string) => {
    if (!user?.id) {
      console.error('[RestaurantStore] No user ID available for leaving collection');
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('[RestaurantStore] Leaving collection:', collectionId);
      await dbHelpers.leaveCollection(collectionId, user.id);
      console.log('[RestaurantStore] Successfully left collection');
      queryClient.invalidateQueries({ queryKey: ['userPlans', user.id] });
    } catch (error) {
      console.error('[RestaurantStore] Error leaving collection:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to leave collection: ${error.message}`);
      } else {
        throw new Error('Failed to leave collection: Unknown error occurred');
      }
    }
  }, [user?.id, queryClient]);

  const isCollectionOwner = useCallback(async (collectionId: string): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    try {
      return await dbHelpers.isCollectionOwner(collectionId, user.id);
    } catch (error) {
      console.error('[RestaurantStore] Error checking collection ownership:', error);
      return false;
    }
  }, [user?.id]);

  const isCollectionMember = useCallback(async (collectionId: string): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    try {
      return await dbHelpers.isCollectionMember(collectionId, user.id);
    } catch (error) {
      console.error('[RestaurantStore] Error checking collection membership:', error);
      return false;
    }
  }, [user?.id]);
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

  // Get detailed voting information for a restaurant in a collection
  const getRestaurantVotingDetails = useCallback((restaurantId: string, planId: string) => {
    const planVotes = userVotes.filter((v: any) => 
      v.restaurantId === restaurantId && v.collectionId === planId
    );
    
    const planDiscussions = discussions.filter((d: any) => 
      d.restaurantId === restaurantId && d.collectionId === planId
    );
    
    const likes = planVotes.filter((v: any) => v.vote === 'like');
    const dislikes = planVotes.filter((v: any) => v.vote === 'dislike');
    
    // Group votes by user for detailed breakdown
    const voteBreakdown = planVotes.reduce((acc: any, vote: any) => {
      const userId = vote.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: vote.userName || 'Unknown User',
          votes: []
        };
      }
      acc[userId].votes.push({
        vote: vote.vote,
        reason: vote.reason,
        timestamp: vote.timestamp
      });
      return acc;
    }, {});
    
    // Group discussions by user
    const discussionBreakdown = planDiscussions.reduce((acc: any, discussion: any) => {
      const userId = discussion.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: discussion.userName || 'Unknown User',
          comments: []
        };
      }
      acc[userId].comments.push({
        message: discussion.message,
        timestamp: discussion.timestamp,
        likes: discussion.likes || 0
      });
      return acc;
    }, {});
    
    return {
      totalVotes: planVotes.length,
      likes: likes.length,
      dislikes: dislikes.length,
      totalComments: planDiscussions.length,
      voteBreakdown: Object.values(voteBreakdown),
      discussionBreakdown: Object.values(discussionBreakdown),
      approvalRate: planVotes.length > 0 ? (likes.length / planVotes.length) * 100 : 0
    };
  }, [userVotes, discussions]);

  // Search restaurants with location-based results
  const searchRestaurants = useCallback(async (query: string, userLat?: number, userLng?: number): Promise<Restaurant[]> => {
    try {
      console.log(`[RestaurantStore] Searching for: ${query}`);
      
      // Get user location if not provided
      let location = userLocation;
      if (userLat && userLng) {
        location = { city: userLocation?.city || 'New York', lat: userLat, lng: userLng };
      }
      
      if (!location) {
        console.log('[RestaurantStore] No location available, using default search');
        return restaurants.filter(r => 
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase()) ||
          r.neighborhood.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Use the enhanced location-based API
      const results = await aggregateRestaurantData(query, location.city, location.lat, location.lng);
      
      // Convert API results to Restaurant format
      const mappedResults = results.map(result => ({
        id: result.id,
        name: result.name,
        cuisine: result.cuisine,
        priceRange: (result.priceLevel === 1 ? '$' : result.priceLevel === 2 ? '$$' : result.priceLevel === 3 ? '$$$' : '$$$$') as '$' | '$$' | '$$$' | '$$$$',
        imageUrl: result.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        images: result.photos || ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
        address: result.address,
        neighborhood: result.neighborhood || location.city,
        hours: result.hours,
        vibe: result.vibeTags || [],
        description: result.description,
        menuHighlights: result.topPicks || [],
        rating: result.rating,
        reviews: result.reviews || [],
        phone: result.phone,
        website: result.website,
                 userNotes: undefined,
        isFavorite: false,
        distance: result.distance,
        proximity: result.proximity
      }));
      
      console.log(`[RestaurantStore] Found ${mappedResults.length} location-based results`);
      // Store search results in global state
      setSearchResults(mappedResults);
      return mappedResults;
      
    } catch (error) {
      console.error('[RestaurantStore] Search error:', error);
      // Fallback to local search
      const fallbackResults = restaurants.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(query.toLowerCase()) ||
        r.neighborhood.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(fallbackResults);
      return fallbackResults;
    }
  }, [restaurants, userLocation]);

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
  }), [
    restaurants,
    plansQuery.data,
    userVotes,
    discussions,
    favoriteRestaurants,
    dataQuery.isLoading,
    plansQuery.isLoading,
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
  ]);

  return storeValue;
});

// Helper hooks
export function useRestaurantById(id: string) {
  const { restaurants, searchResults } = useRestaurants();
  
  // First try to find in the current restaurants list
  let restaurant = restaurants.find((r: any) => r.id === id);
  
  // If not found, check search results
  if (!restaurant) {
    restaurant = searchResults.find((r: any) => r.id === id);
  }
  
  // If still not found, log for debugging
  if (!restaurant) {
    console.log(`Restaurant with ID ${id} not found in current restaurants list or search results`);
  }
  
  return restaurant;
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