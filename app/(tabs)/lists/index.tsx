import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus, Heart, BookOpen, Filter, Grid, List, Clock, Star, DollarSign } from 'lucide-react-native';
import { CollectionCard } from '@/components/CollectionCard';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants } from '@/hooks/restaurant-store';

type TabType = 'collections' | 'favorites';
type SortType = 'recent' | 'rating' | 'price' | 'distance';
type ViewType = 'grid' | 'list';

export default function ListsScreen() {
  const { collections, restaurants, favoriteRestaurants } = useRestaurants();
  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const favoriteRestaurantsList = useMemo(() => {
    const favs = restaurants.filter(r => favoriteRestaurants.includes(r.id));
    
    switch (sortBy) {
      case 'rating':
        return favs.sort((a, b) => b.rating - a.rating);
      case 'price':
        return favs.sort((a, b) => a.priceRange.length - b.priceRange.length);
      case 'distance':
        return favs.sort((a, b) => a.neighborhood.localeCompare(b.neighborhood));
      case 'recent':
      default:
        return favs;
    }
  }, [restaurants, favoriteRestaurants, sortBy]);

  const sortedCollections = useMemo(() => {
    return collections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [collections]);

  const renderTabButton = (tab: TabType, icon: React.ReactNode, label: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (sort: SortType, icon: React.ReactNode, label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === sort && styles.activeSortButton]}
      onPress={() => setSortBy(sort)}
    >
      {icon}
      <Text style={[styles.sortText, sortBy === sort && styles.activeSortText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Lists</Text>
        <Text style={styles.subtitle}>Organize and manage your favorites</Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton('collections', <BookOpen size={18} color={activeTab === 'collections' ? '#FF6B6B' : '#666'} />, 'Collections', collections.length)}
        {renderTabButton('favorites', <Heart size={18} color={activeTab === 'favorites' ? '#FF6B6B' : '#666'} />, 'Favorites', favoriteRestaurants.length)}
      </View>

      {activeTab === 'favorites' && favoriteRestaurants.length > 0 && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color="#666" />
            <Text style={styles.filterText}>Sort & Filter</Text>
          </TouchableOpacity>
          
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewType === 'grid' && styles.activeViewButton]}
              onPress={() => setViewType('grid')}
            >
              <Grid size={16} color={viewType === 'grid' ? '#FF6B6B' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewType === 'list' && styles.activeViewButton]}
              onPress={() => setViewType('list')}
            >
              <List size={16} color={viewType === 'list' ? '#FF6B6B' : '#666'} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showFilters && activeTab === 'favorites' && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {renderSortButton('recent', <Clock size={14} color={sortBy === 'recent' ? '#FF6B6B' : '#666'} />, 'Recently Added')}
            {renderSortButton('rating', <Star size={14} color={sortBy === 'rating' ? '#FF6B6B' : '#666'} />, 'Rating')}
            {renderSortButton('price', <DollarSign size={14} color={sortBy === 'price' ? '#FF6B6B' : '#666'} />, 'Price')}
          </View>
        </View>
      )}

      {activeTab === 'collections' ? (
        collections.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No collections yet</Text>
            <Text style={styles.emptyText}>Create your first collection to start organizing restaurants by theme, occasion, or preference</Text>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => router.push('/create-collection' as any)}
            >
              <Plus size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Collections</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/create-collection' as any)}
              >
                <Plus size={16} color="#FF6B6B" />
                <Text style={styles.addButtonText}>Add New</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.collectionsGrid}>
              {sortedCollections.map(collection => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onPress={() => router.push(`/collection/${collection.id}` as any)}
                />
              ))}
            </View>
          </View>
        )
      ) : (
        favoriteRestaurants.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>Start exploring restaurants and tap the heart icon to save your favorites here</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/discover' as any)}
            >
              <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Your Favorites ({favoriteRestaurants.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Sorted by {sortBy === 'recent' ? 'recently added' : sortBy}
              </Text>
            </View>
            
            {viewType === 'grid' ? (
              <View style={styles.favoritesGrid}>
                {favoriteRestaurantsList.map(restaurant => (
                  <View key={restaurant.id} style={styles.favoriteCardWrapper}>
                    <RestaurantCard
                      restaurant={restaurant}
                      onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
                      compact={false}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.favoritesList}>
                {favoriteRestaurantsList.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
                    compact={true}
                  />
                ))}
              </View>
            )}
          </View>
        )
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: '#FFF0F0',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  activeSortButton: {
    backgroundColor: '#FFF0F0',
  },
  sortText: {
    fontSize: 13,
    color: '#666',
  },
  activeSortText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  favoritesGrid: {
    gap: 16,
  },
  favoriteCardWrapper: {
    marginBottom: 16,
  },
  favoritesList: {
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  exploreButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});