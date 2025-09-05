import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Filter, MapPin, Users, Eye, EyeOff, BookOpen } from 'lucide-react-native';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { CollectionCard } from '@/components/CollectionCard';
import { NYC_CONFIG, LA_CONFIG } from '@/config/cities';
import { filterCollectionsByCity, getCityDisplayName } from '@/utils/collection-filtering';
import { Collection } from '@/types/restaurant';
import { getMemberCount, isMember } from '@/utils/member-helpers';

type FilterType = 'all' | 'nyc' | 'la';

export default function CollectionsPage() {
  const router = useRouter();
  const { allCollections, collections, restaurants, currentCity, followCollection, unfollowCollection } = useRestaurants();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Only use public collections, sorted by member count (most to least)
  const allCollectionsCombined = useMemo(() => {
    const publicCollections = allCollections || [];
    
    // Ensure proper structure for public collections
    const enhancedCollections = publicCollections.map(collection => ({
      ...collection,
      collaborators: (collection as any).collaborators || [],
      restaurant_ids: collection.restaurant_ids || [],
      is_public: collection.is_public || false,
      collection_code: collection.collection_code || '',
    }));
    
    // Sort by member count (most to least)
    const sortedCollections = enhancedCollections.sort((a, b) => {
      const aMembers = getMemberCount(a.collaborators || []);
      const bMembers = getMemberCount(b.collaborators || []);
      return bMembers - aMembers; // Descending order (most to least)
    });
    

    
    return sortedCollections;
  }, [allCollections]);

  // Filter collections based on search and active filter
  const filteredCollections = useMemo(() => {
    let filtered = allCollectionsCombined;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (collection.description && collection.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (collection.created_by && collection.created_by.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    switch (activeFilter) {
      case 'nyc':
        filtered = filterCollectionsByCity(filtered, restaurants, 'nyc') as any[];
        break;
      case 'la':
        filtered = filterCollectionsByCity(filtered, restaurants, 'la') as any[];
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  }, [allCollectionsCombined, searchQuery, activeFilter, restaurants]);



  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all': return 'All Collections';
      case 'nyc': return 'NYC Collections';
      case 'la': return 'LA Collections';
      default: return 'All Collections';
    }
  };

  const getFilterCount = (filter: FilterType) => {
    switch (filter) {
      case 'all': return allCollectionsCombined.length;
      case 'nyc': return (filterCollectionsByCity(allCollectionsCombined, restaurants, 'nyc') as any[]).length;
      case 'la': return (filterCollectionsByCity(allCollectionsCombined, restaurants, 'la') as any[]).length;
      default: return allCollectionsCombined.length;
    }
  };

  const renderFilterButton = (filter: FilterType, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      {icon}
      <Text style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterButtonText]}>
        {getFilterLabel(filter)} ({getFilterCount(filter)})
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Collections',
          headerShown: true,
        }} 
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search collections or creators..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                             <View style={styles.filtersRow}>
                 {renderFilterButton('all', <BookOpen size={16} color={activeFilter === 'all' ? '#fff' : '#666'} />)}
                 {renderFilterButton('nyc', <MapPin size={16} color={activeFilter === 'nyc' ? '#fff' : '#666'} />)}
                 {renderFilterButton('la', <MapPin size={16} color={activeFilter === 'la' ? '#fff' : '#666'} />)}
               </View>
            </ScrollView>
          </View>
        )}



        {/* Collections List */}
        <View style={styles.collectionsContainer}>
          <View style={styles.collectionsHeader}>
            <Text style={styles.collectionsTitle}>
              {getFilterLabel(activeFilter)} ({filteredCollections.length})
            </Text>
            {searchQuery && (
              <Text style={styles.searchResults}>
                Search results for "{searchQuery}"
              </Text>
            )}
          </View>

          {filteredCollections.length > 0 ? (
            <ScrollView style={styles.collectionsList} showsVerticalScrollIndicator={false}>
              <View style={styles.masonryGrid}>
                {filteredCollections.map((collection, index) => (
                  <View 
                    key={collection.id} 
                    style={styles.masonryItem}
                  >
                    <CollectionCard
                      collection={collection as Collection}
                      showFollowButton={true}
                      isUserMember={isMember(user?.id || '', collection.collaborators || [])}
                      isUserCreator={collection.created_by === user?.id}
                      onFollowToggle={async (collectionId: string, isFollowing: boolean) => {
                        try {
                          if (isFollowing) {
                            await unfollowCollection(collectionId);
                          } else {
                            await followCollection(collectionId);
                          }
                        } catch (error) {
                          console.error('[CollectionsPage] Error toggling collection follow:', error);
                        }
                      }}
                      onPress={() => {
                        console.log(`[CollectionsPage] Clicking collection "${collection.name}" with ${collection.collaborators?.length || 0} collaborators`);
                        router.push(`/collection/${collection.id}` as any);
                      }}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No collections found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `No collections match "${searchQuery}"`
                  : `No ${getFilterLabel(activeFilter).toLowerCase()} available`
                }
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterToggle: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 4,
  },
  activeFilterButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },

  collectionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  collectionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  collectionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchResults: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  collectionsList: {
    flex: 1,
    paddingHorizontal: 16, // Match lists page padding
  },
  masonryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16, // Push cards down from the search bar divider
  },
  masonryItem: {
    marginBottom: 12, // Match lists page spacing exactly
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
