import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, Collection, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
import { mockRestaurants, mockCollections, mockVotes, mockDiscussions } from '@/mocks/restaurants';
import { computeRankings, generateGroupRecommendations } from '@/utils/ranking';
import { aggregateRestaurantData, getUserLocation } from '@/services/api';

interface RestaurantStore {
  restaurants: Restaurant[];
  collections: Collection[];
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
  addRestaurantToCollection: (collectionId: string, restaurantId: string) => void;
  removeRestaurantFromCollection: (collectionId: string, restaurantId: string) => void;
  createCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'likes'>) => void;
  deleteCollection: (collectionId: string) => void;
  toggleFavorite: (restaurantId: string) => void;
  voteRestaurant: (restaurantId: string, vote: 'like' | 'dislike', collectionId?: string, reason?: string) => void;
  addUserNote: (restaurantId: string, note: string) => void;
  addDiscussion: (restaurantId: string, collectionId: string, message: string) => void;
  getRankedRestaurants: (collectionId?: string, memberCount?: number) => { restaurant: Restaurant; meta: RankedRestaurantMeta }[];
  getGroupRecommendations: (collectionId: string) => GroupRecommendation[];
  getCollectionDiscussions: (collectionId: string, restaurantId?: string) => RestaurantDiscussion[];
  refreshLocation: () => Promise<void>;
  inviteToCollection: (collectionId: string, email: string, message?: string) => void;
  updateCollectionSettings: (collectionId: string, settings: Partial<Collection>) => void;
}

export const [RestaurantProvider, useRestaurants] = createContextHook<RestaurantStore>(() => {

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userVotes, setUserVotes] = useState<RestaurantVote[]>([]);
  const [discussions, setDiscussions] = useState<RestaurantDiscussion[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ city: string; lat: number; lng: number } | null>(null);

  // Load initial data and user location
  const dataQuery = useQuery({
    queryKey: ['restaurantData'],
    queryFn: async () => {
      const [storedCollections, storedVotes, storedDiscussions, storedFavorites, storedNotes, storedSearchHistory, location] = await Promise.all([
        AsyncStorage.getItem('collections'),
        AsyncStorage.getItem('userVotes'),
        AsyncStorage.getItem('discussions'),
        AsyncStorage.getItem('favoriteRestaurants'),
        AsyncStorage.getItem('restaurantNotes'),
        AsyncStorage.getItem('searchHistory'),
        getUserLocation()
      ]);

      const notes = storedNotes ? JSON.parse(storedNotes) : {};
      const restaurantsWithNotes = mockRestaurants.map(r => ({
        ...r,
        userNotes: notes[r.id] || r.userNotes
      }));

      return {
        restaurants: restaurantsWithNotes,
        collections: storedCollections ? JSON.parse(storedCollections) : mockCollections,
        userVotes: storedVotes ? JSON.parse(storedVotes) : mockVotes,
        discussions: storedDiscussions ? JSON.parse(storedDiscussions) : mockDiscussions,
        favoriteRestaurants: storedFavorites ? JSON.parse(storedFavorites) : [],
        searchHistory: storedSearchHistory ? JSON.parse(storedSearchHistory) : [],
        userLocation: location
      };
    }
  });

  useEffect(() => {
    if (dataQuery.data) {
      setRestaurants(dataQuery.data.restaurants);
      setCollections(dataQuery.data.collections);
      setUserVotes(dataQuery.data.userVotes);
      setDiscussions(dataQuery.data.discussions);
      setFavoriteRestaurants(dataQuery.data.favoriteRestaurants);
      setSearchHistory(dataQuery.data.searchHistory);
      setUserLocation(dataQuery.data.userLocation);
    }
  }, [dataQuery.data]);

  // Persist collections
  const persistCollections = useMutation({
    mutationFn: async (newCollections: Collection[]) => {
      await AsyncStorage.setItem('collections', JSON.stringify(newCollections));
      return newCollections;
    },
    onSuccess: (data) => {
      setCollections(data);
    }
  });

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
  const persistFavorites = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      await AsyncStorage.setItem('favoriteRestaurants', JSON.stringify(newFavorites));
      return newFavorites;
    },
    onSuccess: (data) => {
      setFavoriteRestaurants(data);
    }
  });

  // Persist notes
  const persistNotes = useMutation({
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
  const persistSearchHistory = useMutation({
    mutationFn: async (history: string[]) => {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));
      return history.slice(0, 10);
    },
    onSuccess: (data) => setSearchHistory(data)
  });

  const addRestaurantToCollection = useCallback((collectionId: string, restaurantId: string) => {
    const updated = collections.map(c => 
      c.id === collectionId 
        ? { ...c, restaurants: [...new Set([...c.restaurants, restaurantId])] }
        : c
    );
    persistCollections.mutate(updated);
  }, [collections, persistCollections.mutate]);

  const removeRestaurantFromCollection = useCallback((collectionId: string, restaurantId: string) => {
    const updated = collections.map(c => 
      c.id === collectionId 
        ? { ...c, restaurants: c.restaurants.filter(id => id !== restaurantId) }
        : c
    );
    persistCollections.mutate(updated);
  }, [collections, persistCollections.mutate]);

  const createCollection = useCallback((collection: Omit<Collection, 'id' | 'createdAt' | 'likes'>) => {
    const newCollection: Collection = {
      ...collection,
      id: `c${Date.now()}`,
      createdAt: new Date(),
      likes: 0
    };
    persistCollections.mutate([...collections, newCollection]);
  }, [collections, persistCollections.mutate]);

  const deleteCollection = useCallback((collectionId: string) => {
    const updated = collections.filter(c => c.id !== collectionId);
    persistCollections.mutate(updated);
  }, [collections, persistCollections.mutate]);

  const toggleFavorite = useCallback((restaurantId: string) => {
    const updated = favoriteRestaurants.includes(restaurantId)
      ? favoriteRestaurants.filter(id => id !== restaurantId)
      : [...favoriteRestaurants, restaurantId];
    persistFavorites.mutate(updated);
  }, [favoriteRestaurants, persistFavorites.mutate]);

  const voteRestaurant = useCallback((restaurantId: string, vote: 'like' | 'dislike', collectionId?: string, reason?: string) => {
    const existingVoteIndex = userVotes.findIndex(v => 
      v.restaurantId === restaurantId && 
      v.userId === 'currentUser' && 
      v.collectionId === collectionId
    );
    let updated: RestaurantVote[];

    const now = new Date().toISOString();
    const base: Omit<RestaurantVote, 'vote'> = { 
      restaurantId, 
      userId: 'currentUser', 
      collectionId,
      timestamp: now, 
      authority: 'regular', 
      weight: 1,
      reason
    };

    if (existingVoteIndex >= 0) {
      if (userVotes[existingVoteIndex].vote === vote) {
        updated = userVotes.filter((_, i) => i !== existingVoteIndex);
      } else {
        updated = userVotes.map((v, i) => (i === existingVoteIndex ? { ...v, vote, timestamp: now, reason } : v));
      }
    } else {
      updated = [...userVotes, { ...base, vote }];
    }

    persistVotes.mutate(updated);
  }, [userVotes, persistVotes.mutate]);

  const addUserNote = useCallback((restaurantId: string, note: string) => {
    persistNotes.mutate({ restaurantId, note });
  }, [persistNotes.mutate]);

  const addSearchQuery = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    const updated = [q, ...searchHistory.filter(item => item.toLowerCase() !== q.toLowerCase())];
    persistSearchHistory.mutate(updated);
  }, [searchHistory, persistSearchHistory.mutate]);

  const clearSearchHistory = useCallback(() => {
    persistSearchHistory.mutate([]);
  }, [persistSearchHistory.mutate]);

  const getQuickSuggestions = useCallback(() => {
    const locationSuggestions = userLocation?.city === 'New York' 
      ? ['Italian in Manhattan', 'Sushi in SoHo', 'Brunch in Brooklyn', 'Pizza in Queens']
      : ['Tacos in Hollywood', 'Sushi in Beverly Hills', 'Brunch in Santa Monica', 'Korean BBQ in Koreatown'];
    
    const cuisines = restaurants.map(r => r.cuisine.split(/[,&]/)[0].trim());
    const neighborhoods = restaurants.map(r => r.neighborhood);
    const popular = [...cuisines, ...neighborhoods]
      .reduce<Record<string, number>>((acc, cur) => {
        acc[cur] = (acc[cur] ?? 0) + 1;
        return acc;
      }, {});
    const sorted = Object.entries(popular)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
    
    return [...searchHistory, ...locationSuggestions, ...sorted].slice(0, 8);
  }, [restaurants, searchHistory, userLocation]);

  const addDiscussion = useCallback((restaurantId: string, collectionId: string, message: string) => {
    const newDiscussion: RestaurantDiscussion = {
      id: `d${Date.now()}`,
      restaurantId,
      collectionId,
      userId: 'currentUser',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      message,
      timestamp: new Date(),
      likes: 0
    };
    persistDiscussions.mutate([...discussions, newDiscussion]);
  }, [discussions, persistDiscussions.mutate]);

  const getRankedRestaurants = useCallback((collectionId?: string, memberCount?: number) => {
    const collection = collectionId ? collections.find(c => c.id === collectionId) : undefined;
    const pool = collectionId
      ? restaurants.filter(r => (collection?.restaurants ?? []).includes(r.id))
      : restaurants;
    
    const collectionVotes = collectionId 
      ? userVotes.filter(v => v.collectionId === collectionId)
      : userVotes;
    
    const discussionCounts = discussions
      .filter(d => !collectionId || d.collectionId === collectionId)
      .reduce<Record<string, number>>((acc, d) => {
        acc[d.restaurantId] = (acc[d.restaurantId] || 0) + 1;
        return acc;
      }, {});
    
    return computeRankings(pool, collectionVotes, { 
      memberCount, 
      collection,
      discussions: discussionCounts 
    });
  }, [collections, restaurants, userVotes, discussions]);

  const getGroupRecommendations = useCallback((collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return [];
    
    const pool = restaurants.filter(r => collection.restaurants.includes(r.id));
    const collectionVotes = userVotes.filter(v => v.collectionId === collectionId);
    const discussionCounts = discussions
      .filter(d => d.collectionId === collectionId)
      .reduce<Record<string, number>>((acc, d) => {
        acc[d.restaurantId] = (acc[d.restaurantId] || 0) + 1;
        return acc;
      }, {});
    
    const rankedRestaurants = computeRankings(pool, collectionVotes, { 
      memberCount: collection.collaborators.length, 
      collection,
      discussions: discussionCounts 
    });
    
    return generateGroupRecommendations(rankedRestaurants, collection);
  }, [collections, restaurants, userVotes, discussions]);

  const getCollectionDiscussions = useCallback((collectionId: string, restaurantId?: string) => {
    return discussions.filter(d => 
      d.collectionId === collectionId && 
      (!restaurantId || d.restaurantId === restaurantId)
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
        priceRange: '$'.repeat(Math.min(result.priceLevel, 4)) as '$' | '$$' | '$$$' | '$$$$',
        imageUrl: result.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        images: result.photos,
        address: result.address || '',
        neighborhood: result.address?.split(',')[1]?.trim() || location.city,
        hours: 'Hours vary',
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
      const existingIds = new Set(restaurants.map(r => r.id));
      const newRestaurants = formattedResults.filter(r => !existingIds.has(r.id));
      
      if (newRestaurants.length > 0) {
        setRestaurants(prev => [...prev, ...newRestaurants]);
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

  const inviteToCollection = useCallback((collectionId: string, email: string, message?: string) => {
    // In a real app, this would send an email invitation
    console.log(`Inviting ${email} to collection ${collectionId} with message: ${message}`);
    // For now, we'll just log it. In production, this would:
    // 1. Send an email invitation
    // 2. Create a pending invitation record
    // 3. Handle invitation acceptance/rejection
  }, []);

  const updateCollectionSettings = useCallback((collectionId: string, settings: Partial<Collection>) => {
    const updated = collections.map(c => 
      c.id === collectionId ? { ...c, ...settings } : c
    );
    persistCollections.mutate(updated);
  }, [collections, persistCollections.mutate]);

  const storeValue = useMemo(() => ({
    restaurants,
    collections,
    userVotes,
    discussions,
    favoriteRestaurants,
    isLoading: dataQuery.isLoading,
    searchHistory,
    userLocation,
    searchRestaurants,
    addSearchQuery,
    clearSearchHistory,
    getQuickSuggestions,
    addRestaurantToCollection,
    removeRestaurantFromCollection,
    createCollection,
    deleteCollection,
    toggleFavorite,
    voteRestaurant,
    addUserNote,
    addDiscussion,
    getRankedRestaurants,
    getGroupRecommendations,
    getCollectionDiscussions,
    refreshLocation,
    inviteToCollection,
    updateCollectionSettings,
  }), [
    restaurants,
    collections,
    userVotes,
    discussions,
    favoriteRestaurants,
    dataQuery.isLoading,
    searchHistory,
    userLocation,
    searchRestaurants,
    addSearchQuery,
    clearSearchHistory,
    getQuickSuggestions,
    addRestaurantToCollection,
    removeRestaurantFromCollection,
    createCollection,
    deleteCollection,
    toggleFavorite,
    voteRestaurant,
    addUserNote,
    addDiscussion,
    getRankedRestaurants,
    getGroupRecommendations,
    getCollectionDiscussions,
    refreshLocation,
    inviteToCollection,
    updateCollectionSettings,
  ]);

  return storeValue;
});

// Helper hooks
export function useRestaurantById(id: string) {
  const { restaurants } = useRestaurants();
  return restaurants.find(r => r.id === id);
}

export function useCollectionById(id: string) {
  const { collections } = useRestaurants();
  return collections.find(c => c.id === id);
}

export function useCollectionRestaurants(collectionId: string) {
  const { restaurants } = useRestaurants();
  const collection = useCollectionById(collectionId);
  
  return useMemo(() => {
    if (!collection) return [];
    return restaurants.filter(r => collection.restaurants.includes(r.id));
  }, [restaurants, collection]);
}

export function useRestaurantVotes(restaurantId: string, collectionId?: string) {
  const { userVotes } = useRestaurants();
  const votes = userVotes.filter(v => 
    v.restaurantId === restaurantId && 
    (!collectionId || v.collectionId === collectionId)
  );
  
  return {
    likes: votes.filter(v => v.vote === 'like').length,
    dislikes: votes.filter(v => v.vote === 'dislike').length,
    userVote: votes.find(v => v.userId === 'currentUser')?.vote,
    allVotes: votes
  };
}