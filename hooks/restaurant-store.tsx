import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Restaurant, Collection, RestaurantVote, RankedRestaurantMeta } from '@/types/restaurant';
import { mockRestaurants, mockCollections } from '@/mocks/restaurants';
import { computeRankings } from '../utils/ranking';

interface RestaurantStore {
  restaurants: Restaurant[];
  collections: Collection[];
  userVotes: RestaurantVote[];
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
  voteRestaurant: (restaurantId: string, vote: 'like' | 'dislike') => void;
  addUserNote: (restaurantId: string, note: string) => void;
  useRankedRestaurants: (collectionId?: string, memberCount?: number) => { restaurant: Restaurant; meta: RankedRestaurantMeta }[];
}

export const [RestaurantProvider, useRestaurants] = createContextHook<RestaurantStore>(() => {
  const queryClient = useQueryClient();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userVotes, setUserVotes] = useState<RestaurantVote[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load initial data
  const dataQuery = useQuery({
    queryKey: ['restaurantData'],
    queryFn: async () => {
      const [storedCollections, storedVotes, storedFavorites, storedNotes, storedSearchHistory] = await Promise.all([
        AsyncStorage.getItem('collections'),
        AsyncStorage.getItem('userVotes'),
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
        userVotes: storedVotes ? JSON.parse(storedVotes) : [],
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

  const addRestaurantToCollection = (collectionId: string, restaurantId: string) => {
    const updated = collections.map(c => 
      c.id === collectionId 
        ? { ...c, restaurants: [...new Set([...c.restaurants, restaurantId])] }
        : c
    );
    persistCollections.mutate(updated);
  };

  const removeRestaurantFromCollection = (collectionId: string, restaurantId: string) => {
    const updated = collections.map(c => 
      c.id === collectionId 
        ? { ...c, restaurants: c.restaurants.filter(id => id !== restaurantId) }
        : c
    );
    persistCollections.mutate(updated);
  };

  const createCollection = (collection: Omit<Collection, 'id' | 'createdAt' | 'likes'>) => {
    const newCollection: Collection = {
      ...collection,
      id: `c${Date.now()}`,
      createdAt: new Date(),
      likes: 0
    };
    persistCollections.mutate([...collections, newCollection]);
  };

  const deleteCollection = (collectionId: string) => {
    const updated = collections.filter(c => c.id !== collectionId);
    persistCollections.mutate(updated);
  };

  const toggleFavorite = (restaurantId: string) => {
    const updated = favoriteRestaurants.includes(restaurantId)
      ? favoriteRestaurants.filter(id => id !== restaurantId)
      : [...favoriteRestaurants, restaurantId];
    persistFavorites.mutate(updated);
  };

  const voteRestaurant = (restaurantId: string, vote: 'like' | 'dislike') => {
    const existingVoteIndex = userVotes.findIndex(v => v.restaurantId === restaurantId && v.userId === 'currentUser');
    let updated: RestaurantVote[];

    const now = new Date().toISOString();
    const base: Omit<RestaurantVote, 'vote'> = { restaurantId, userId: 'currentUser', timestamp: now, authority: 'regular', weight: 1 };

    if (existingVoteIndex >= 0) {
      if (userVotes[existingVoteIndex].vote === vote) {
        updated = userVotes.filter((_, i) => i !== existingVoteIndex);
      } else {
        updated = userVotes.map((v, i) => (i === existingVoteIndex ? { ...v, vote, timestamp: now } : v));
      }
    } else {
      updated = [...userVotes, { ...base, vote }];
    }

    persistVotes.mutate(updated);
  };

  const addUserNote = (restaurantId: string, note: string) => {
    persistNotes.mutate({ restaurantId, note });
  };

  const addSearchQuery = (query: string) => {
    const q = query.trim();
    if (!q) return;
    const updated = [q, ...searchHistory.filter(item => item.toLowerCase() !== q.toLowerCase())];
    persistSearchHistory.mutate(updated);
  };

  const clearSearchHistory = () => {
    persistSearchHistory.mutate([]);
  };

  const getQuickSuggestions = () => {
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
  };

  const useRankedRestaurants = (collectionId?: string, memberCount?: number) => {
    const pool = collectionId
      ? restaurants.filter(r => (collections.find(c => c.id === collectionId)?.restaurants ?? []).includes(r.id))
      : restaurants;
    return computeRankings(pool, userVotes, { memberCount });
  };

  return {
    restaurants,
    collections,
    userVotes,
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
    useRankedRestaurants,
  };
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

export function useRestaurantVotes(restaurantId: string) {
  const { userVotes } = useRestaurants();
  const votes = userVotes.filter(v => v.restaurantId === restaurantId);
  
  return {
    likes: votes.filter(v => v.vote === 'like').length,
    dislikes: votes.filter(v => v.vote === 'dislike').length,
    userVote: votes.find(v => v.userId === 'currentUser')?.vote
  };
}