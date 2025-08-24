import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, Collection, RestaurantVote, RankedRestaurantMeta, RestaurantDiscussion, GroupRecommendation } from '@/types/restaurant';
import { mockRestaurants, mockCollections, mockVotes, mockDiscussions } from '@/mocks/restaurants';
import { computeRankings, generateGroupRecommendations } from '../utils/ranking';

interface RestaurantStore {
  restaurants: Restaurant[];
  collections: Collection[];
  userVotes: RestaurantVote[];
  discussions: RestaurantDiscussion[];
  favoriteRestaurants: string[];
  isLoading: boolean;
  searchHistory: string[];
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
  useRankedRestaurants: (collectionId?: string, memberCount?: number) => { restaurant: Restaurant; meta: RankedRestaurantMeta }[];
  getGroupRecommendations: (collectionId: string) => GroupRecommendation[];
  getCollectionDiscussions: (collectionId: string, restaurantId?: string) => RestaurantDiscussion[];
}

export const [RestaurantProvider, useRestaurants] = createContextHook<RestaurantStore>(() => {

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userVotes, setUserVotes] = useState<RestaurantVote[]>([]);
  const [discussions, setDiscussions] = useState<RestaurantDiscussion[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load initial data
  const dataQuery = useQuery({
    queryKey: ['restaurantData'],
    queryFn: async () => {
      const [storedCollections, storedVotes, storedDiscussions, storedFavorites, storedNotes, storedSearchHistory] = await Promise.all([
        AsyncStorage.getItem('collections'),
        AsyncStorage.getItem('userVotes'),
        AsyncStorage.getItem('discussions'),
        AsyncStorage.getItem('favoriteRestaurants'),
        AsyncStorage.getItem('restaurantNotes'),
        AsyncStorage.getItem('searchHistory')
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
        searchHistory: storedSearchHistory ? JSON.parse(storedSearchHistory) : []
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
    return [...searchHistory, ...sorted].slice(0, 8);
  }, [restaurants, searchHistory]);

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

  const useRankedRestaurants = useCallback((collectionId?: string, memberCount?: number) => {
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

  return useMemo(() => ({
    restaurants,
    collections,
    userVotes,
    discussions,
    favoriteRestaurants,
    isLoading: dataQuery.isLoading,
    searchHistory,
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
    useRankedRestaurants,
    getGroupRecommendations,
    getCollectionDiscussions,
  }), [
    restaurants,
    collections,
    userVotes,
    discussions,
    favoriteRestaurants,
    dataQuery.isLoading,
    searchHistory,
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
    useRankedRestaurants,
    getGroupRecommendations,
    getCollectionDiscussions,
  ]);
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