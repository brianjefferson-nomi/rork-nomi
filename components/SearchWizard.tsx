import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Mic, Search, ChevronDown, SlidersHorizontal, X, MapPin, Clock, TrendingUp, History } from 'lucide-react-native';
import { useRestaurants } from '@/hooks/restaurant-store';
import { Restaurant } from '@/types/restaurant';
import { router } from 'expo-router';
import { getYelpAutocompleteSuggestions, getYelpPopularSearches } from '@/services/api';

interface SearchWizardProps {
  testID?: string;
}

interface SuggestionItem {
  id: string;
  label: string;
  type: 'history' | 'trending' | 'cuisine' | 'neighborhood';
}

export function SearchWizard({ testID }: SearchWizardProps) {
  const { restaurants, addSearchQuery, searchHistory, getQuickSuggestions, clearSearchHistory, searchRestaurants, userLocation, switchToCity, searchResults } = useRestaurants();
  const [query, setQuery] = useState<string>('');
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(5);
  const [price, setPrice] = useState<'$' | '$$' | '$$$' | '$$$$' | 'All'>('All');
  const [rating, setRating] = useState<number>(0);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [yelpSuggestions, setYelpSuggestions] = useState<string[]>([]);
  const [yelpPopularSearches, setYelpPopularSearches] = useState<string[]>([]);
  const [isLoadingYelpSuggestions, setIsLoadingYelpSuggestions] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  // Load Yelp popular searches on component mount
  useEffect(() => {
    const loadYelpPopularSearches = async () => {
      try {
        const popularSearches = await getYelpPopularSearches(userLocation?.city === 'New York' ? 'NY' : 'CA');
        setYelpPopularSearches(popularSearches);
      } catch (error) {
        console.error('[SearchWizard] Error loading Yelp popular searches:', error);
      }
    };
    
    loadYelpPopularSearches();
  }, [userLocation?.city]);

  // Get Yelp autocomplete suggestions when query changes
  useEffect(() => {
    const getYelpSuggestions = async () => {
      if (query.length < 2) {
        setYelpSuggestions([]);
        return;
      }
      
      setIsLoadingYelpSuggestions(true);
      try {
        const suggestions = await getYelpAutocompleteSuggestions(query, userLocation?.city === 'New York' ? 'NY' : 'CA');
        setYelpSuggestions(suggestions);
      } catch (error) {
        console.error('[SearchWizard] Error getting Yelp suggestions:', error);
        setYelpSuggestions([]);
      } finally {
        setIsLoadingYelpSuggestions(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(getYelpSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, userLocation?.city]);

  const suggestions: SuggestionItem[] = useMemo(() => {
    const historySuggestions = searchHistory.slice(0, 3).map((label, idx) => ({
      id: `history-${idx}`,
      label,
      type: 'history' as const
    }));
    
    // Use Yelp popular searches if available, otherwise fallback to hardcoded suggestions
    const locationBasedSuggestions = yelpPopularSearches.length > 0 
      ? yelpPopularSearches.slice(0, 6)
      : (userLocation?.city === 'New York' 
        ? [
            'Italian in Manhattan',
            'Sushi in SoHo', 
            'Brunch in Brooklyn',
            'Pizza in Queens',
            'Best steakhouses NYC',
            'Rooftop bars Manhattan'
          ]
        : [
            'Tacos in Hollywood',
            'Sushi in Beverly Hills',
            'Brunch in Santa Monica', 
            'Korean BBQ in Koreatown',
            'Best steakhouses LA',
            'Rooftop bars West Hollywood'
          ]);
    
    const trendingSuggestions = locationBasedSuggestions.map((label, idx) => ({
      id: `trending-${idx}`,
      label,
      type: 'trending' as const
    }));
    
    const cuisineSuggestions = ['Italian', 'Japanese', 'Mexican', 'Thai', 'French', 'Indian'].map((label, idx) => ({
      id: `cuisine-${idx}`,
      label,
      type: 'cuisine' as const
    }));
    
    const neighborhoodSuggestions = [...new Set(restaurants.map(r => r.neighborhood))]
      .slice(0, 4)
      .map((label, idx) => ({
        id: `neighborhood-${idx}`,
        label,
        type: 'neighborhood' as const
      }));
    
    return [...historySuggestions, ...trendingSuggestions, ...cuisineSuggestions, ...neighborhoodSuggestions];
  }, [searchHistory, restaurants, userLocation, yelpPopularSearches]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    
    // If we have a query and search results, show search results
    if (q && searchResults.length > 0) {
      console.log(`[SearchWizard] Using search results: ${searchResults.length} results`);
      return searchResults.filter(r => {
        const matchPrice = price === 'All' || r.priceRange === price;
        const matchRating = r.rating >= rating;
        const matchHours = !isOpenNow || (r.hours && (r.hours.toLowerCase().includes('daily') || r.hours.toLowerCase().includes('mon')));
        return matchPrice && matchRating && matchHours;
      });
    }
    
    // If we have a query but no search results, filter from all restaurants
    if (q) {
      console.log(`[SearchWizard] Filtering from all restaurants for query: ${q}`);
      return restaurants.filter(r => {
        const matchQuery = r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.neighborhood.toLowerCase().includes(q);
        const matchPrice = price === 'All' || r.priceRange === price;
        const matchRating = r.rating >= rating;
        const matchHours = !isOpenNow || (r.hours && (r.hours.toLowerCase().includes('daily') || r.hours.toLowerCase().includes('mon')));
        return matchQuery && matchPrice && matchRating && matchHours;
      });
    }
    
    // If no query, show all restaurants
    console.log(`[SearchWizard] Showing all restaurants: ${restaurants.length} results`);
    return restaurants.filter(r => {
      const matchPrice = price === 'All' || r.priceRange === price;
      const matchRating = r.rating >= rating;
      const matchHours = !isOpenNow || (r.hours && (r.hours.toLowerCase().includes('daily') || r.hours.toLowerCase().includes('mon')));
      return matchPrice && matchRating && matchHours;
    });
  }, [restaurants, searchResults, query, price, rating, isOpenNow]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      console.log(`Performing search for: ${searchQuery}`);
      
      // Get user location for proximity-based search
      const location = userLocation;
      if (!location) {
        console.log('No user location available, using default search');
        await searchRestaurants(searchQuery);
        addSearchQuery(searchQuery);
        return;
      }
      
      // Use location-based search with user coordinates
      await searchRestaurants(searchQuery);
      addSearchQuery(searchQuery);
      console.log(`Search completed for: ${searchQuery}`);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search restaurants. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [searchRestaurants, addSearchQuery, userLocation]);

  const onSubmit = () => {
    performSearch(query);
    setShowSuggestions(false);
  };

  const startVoice = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Voice Search', 'Voice search is not supported on web. Please use the text input.');
      return;
    }
    Alert.alert('Voice Search', 'Voice search requires microphone permissions. This feature will be available in a future update.');
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <View style={styles.locationSwitcher}>
        <MapPin size={16} color="#666" />
        <Text style={styles.locationLabel}>Search in:</Text>
        <TouchableOpacity 
          style={[styles.cityButton, userLocation?.city === 'New York' && styles.cityButtonActive]}
          onPress={() => switchToCity('New York')}
        >
          <Text style={[styles.cityButtonText, userLocation?.city === 'New York' && styles.cityButtonTextActive]}>NYC</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cityButton, userLocation?.city === 'Los Angeles' && styles.cityButtonActive]}
          onPress={() => switchToCity('Los Angeles')}
        >
          <Text style={[styles.cityButtonText, userLocation?.city === 'Los Angeles' && styles.cityButtonTextActive]}>LA</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <Search size={20} color="#999" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={`Search restaurants in ${userLocation?.city || 'NYC'}...`}
          placeholderTextColor="#999"
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setShowSuggestions(true);
            // Clear search results when user starts typing a new query
            if (t.length === 0) {
              // Clear search results when input is empty
              console.log('[SearchWizard] Clearing search results - empty query');
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onSubmitEditing={onSubmit}
          testID="search-input"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Clear search">
            <X size={18} color="#999" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setOpenFilters(!openFilters)} style={styles.iconBtn} testID="filters-btn">
          <SlidersHorizontal size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={startVoice} style={styles.iconBtn} testID="voice-btn">
          <Mic size={20} color="#1A1A1A" />
        </TouchableOpacity>
        {isSearching && (
          <ActivityIndicator size="small" color="#FF6B6B" style={{ marginLeft: 4 }} />
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Quick suggestions</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity onPress={clearSearchHistory}>
                <Text style={styles.clearHistory}>Clear history</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={{ maxHeight: 160 }}>
            {/* Yelp Autocomplete Suggestions */}
            {query.length >= 2 && yelpSuggestions.length > 0 && (
              <>
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsTitle}>Yelp Suggestions</Text>
                </View>
                {yelpSuggestions.map((suggestion, idx) => (
                  <TouchableOpacity 
                    key={`yelp-${idx}`} 
                    style={styles.suggestionItem} 
                    onPress={() => {
                      setQuery(suggestion);
                      performSearch(suggestion);
                      setShowSuggestions(false);
                      inputRef.current?.blur();
                    }}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            
            {/* Loading indicator for Yelp suggestions */}
            {query.length >= 2 && isLoadingYelpSuggestions && (
              <View style={styles.suggestionItem}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text style={styles.suggestionText}>Loading suggestions...</Text>
              </View>
            )}
            
            {/* Regular suggestions */}
            {suggestions.map(s => (
              <TouchableOpacity key={s.id} style={styles.suggestionItem} onPress={() => {
                setQuery(s.label);
                performSearch(s.label);
                setShowSuggestions(false);
                inputRef.current?.blur();
              }}>
                <Text style={styles.suggestionText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {openFilters && (
        <View style={styles.filters}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Price</Text>
            <View style={styles.chipsRow}>
              {(['All', '$', '$$', '$$$', '$$$$'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, price === p && styles.chipActive]}
                  onPress={() => setPrice(p)}
                >
                  <Text style={[styles.chipText, price === p && styles.chipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Rating</Text>
            <View style={styles.chipsRow}>
              {[0, 4.0, 4.5].map(r => (
                <TouchableOpacity key={r} style={[styles.chip, rating === r && styles.chipActive]} onPress={() => setRating(r)}>
                  <Text style={[styles.chipText, rating === r && styles.chipTextActive]}>
                    {r === 0 ? 'Any' : `★ ${r}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Open Now</Text>
            <View style={styles.chipsRow}>
              {([false, true] as const).map(val => (
                <TouchableOpacity key={String(val)} style={[styles.chip, isOpenNow === val && styles.chipActive]} onPress={() => setIsOpenNow(val)}>
                  <Text style={[styles.chipText, isOpenNow === val && styles.chipTextActive]}>
                    {val ? 'Yes' : 'Any'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {(query.length > 0 && filtered.length > 0) && (
        <View style={styles.liveResults}>
          <View style={styles.liveHeader}>
            <Text style={styles.liveTitle}>
              {searchResults.length > 0 ? `Search Results (${filtered.length})` : `Local Results (${filtered.length})`}
            </Text>
            {userLocation && (
              <View style={styles.locationBadge}>
                <MapPin size={12} color="#666" />
                <Text style={styles.locationText}>{userLocation.city}</Text>
              </View>
            )}
          </View>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF6B6B" />
              <Text style={styles.loadingText}>Searching restaurants...</Text>
            </View>
          ) : (
            <>
              {filtered.slice(0, 8).map(r => (
                <TouchableOpacity 
                  key={r.id} 
                  style={styles.resultItem}
                  onPress={() => {
                    router.push({ pathname: '/restaurant/[id]', params: { id: r.id } });
                    setShowSuggestions(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultContent}>
                    <Text style={styles.resultName}>{r.name}</Text>
                    <Text style={styles.resultMeta}>{r.cuisine} • {r.neighborhood}</Text>
                    {r.rating && (
                      <View style={styles.resultRating}>
                        <Text style={styles.ratingText}>★ {r.rating.toFixed(1)}</Text>
                        <Text style={styles.priceText}>{r.priceRange}</Text>
                      </View>
                    )}
                  </View>
                  {r.aiDescription && (
                    <Text style={styles.aiDescription} numberOfLines={2}>{r.aiDescription}</Text>
                  )}
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResults}>No matches found.</Text>
                  <Text style={styles.noResultsSubtext}>Try adjusting your filters or search terms.</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  iconBtn: { padding: 6 },
  suggestions: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  suggestionsSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  clearHistory: { fontSize: 12, color: '#FF6B6B', fontWeight: '600' },
  suggestionItem: { paddingHorizontal: 12, paddingVertical: 10 },
  suggestionText: { fontSize: 14, color: '#333' },
  filters: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
    gap: 12,
  },
  filterRow: { gap: 8 },
  filterLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F0F0F0' },
  chipActive: { backgroundColor: '#FF6B6B' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  liveResults: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  liveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  liveTitle: { fontSize: 12, color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  locationText: { fontSize: 11, color: '#666', fontWeight: '500' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 8 },
  loadingText: { fontSize: 13, color: '#666' },
  resultItem: { paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F7F7F7' },
  resultContent: { marginBottom: 4 },
  resultName: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },
  resultMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  resultRating: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingText: { fontSize: 12, color: '#FF6B6B', fontWeight: '600' },
  priceText: { fontSize: 12, color: '#999', fontWeight: '500' },
  aiDescription: { fontSize: 12, color: '#666', marginTop: 4, lineHeight: 16 },
  noResultsContainer: { padding: 20, alignItems: 'center' },
  noResults: { fontSize: 14, color: '#999', fontWeight: '600', textAlign: 'center' },
  noResultsSubtext: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4 },
  locationSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cityButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  cityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  cityButtonTextActive: {
    color: '#FFF',
  },
});