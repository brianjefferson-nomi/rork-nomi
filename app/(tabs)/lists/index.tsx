import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Plus, Heart, BookOpen, Filter, Grid, List, Clock, Star, DollarSign, Trash2, UserMinus } from 'lucide-react-native';
import { CollectionCard } from '@/components/CollectionCard';
import { SimpleRestaurantCard } from '@/components/restaurant-cards';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { Collection } from '@/types/restaurant';
import { getMemberCount } from '@/utils/member-helpers';

type TabType = 'collections' | 'favorites';
type SortType = 'recent' | 'rating' | 'price' | 'distance';
type ViewType = 'grid' | 'list';

export default function ListsScreen() {
  const { 
    plans, 
    allCollections,
    restaurants, 
    favoriteRestaurants, 
    deleteCollection, 
    leaveCollection
  } = useRestaurants();
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCollectionType, setSelectedCollectionType] = useState<'all' | 'private' | 'shared' | 'public'>('all');

  // Combine private collections (plans) and public collections (allCollections) that the user is part of
  const safeCollections = useMemo(() => {
    const userCollections: any[] = [];
    const addedCollectionIds = new Set<string>();
    
    // Add private collections (plans) - user is always part of these
    const privateCollections = plans || [];
    privateCollections.forEach(plan => {
      if (!addedCollectionIds.has(plan.id)) {
        // Ensure memberCount is calculated for private collections
        const processedPlan = {
          ...plan,
          memberCount: (plan as any).memberCount || getMemberCount(plan)
        };
        userCollections.push(processedPlan);
        addedCollectionIds.add(plan.id);
      }
    });
    
    // Add public collections from allCollections that the user is part of
    const publicCollections = allCollections || [];
    publicCollections.forEach(publicCollection => {
      // Skip if already added from plans
      if (addedCollectionIds.has(publicCollection.id)) {
        return;
      }
      
      const isCreator = publicCollection.created_by === user?.id;
      const isCollaborator = (publicCollection as any).collaborators && 
        Array.isArray((publicCollection as any).collaborators) &&
        (publicCollection as any).collaborators.some((member: any) => {
          const memberId = typeof member === 'string' ? member : member?.userId || member?.id;
          return memberId === user?.id;
        });
      
      if (isCreator || isCollaborator) {
        // Ensure memberCount is calculated for public collections
        const processedCollection = {
          ...publicCollection,
          memberCount: (publicCollection as any).memberCount || getMemberCount(publicCollection)
        };
        userCollections.push(processedCollection);
        addedCollectionIds.add(publicCollection.id);
      }
    });
    
    return userCollections;
  }, [plans, allCollections, user?.id]);

  // Convert collections to proper format
  const planCollections: Collection[] = useMemo(() => {
    return safeCollections.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || 'A collaborative dining plan',
      cover_image: (plan as any).cover_image || 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      created_by: plan.created_by,
      creator_id: (plan as any).creator_id,
      occasion: plan.occasion,
      is_public: plan.is_public,
      likes: plan.likes || 0,
      equal_voting: plan.equal_voting,
      admin_weighted: plan.admin_weighted,
      expertise_weighted: plan.expertise_weighted,
      minimum_participation: plan.minimum_participation,
      voting_deadline: (plan as any).voting_deadline,
      allow_vote_changes: plan.allow_vote_changes,
      anonymous_voting: plan.anonymous_voting,
      vote_visibility: plan.vote_visibility as 'public' | 'anonymous' | 'admin_only',
      discussion_enabled: plan.discussion_enabled,
      auto_ranking_enabled: plan.auto_ranking_enabled,
      consensus_threshold: plan.consensus_threshold,
      restaurant_ids: plan.restaurant_ids || [],
      collaborators: (plan as any).collaborators || [],
      created_at: plan.created_at,
      updated_at: plan.updated_at,
      memberCount: (plan as any).memberCount
    }));
  }, [safeCollections]);

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
    const validCollections = (planCollections || []).filter((collection: any) => {
      if (!collection || !collection.id || !collection.name) {
        return false;
      }
      return true;
    });
    
    const sorted = validCollections.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    return sorted;
  }, [planCollections]);

  // Filter collections by type
  const filteredCollections = useMemo(() => {
    if (selectedCollectionType === 'all') return sortedCollections;
    
    return sortedCollections.filter((collection: any) => {
      // Check if user is the creator (private collections)
      const isCreator = collection.created_by === user?.id;
      
      // Check if user is a member (shared collections)
      const isMember = collection.collaborators && Array.isArray(collection.collaborators) && 
        collection.collaborators.some((member: any) => {
          const memberId = typeof member === 'string' ? member : member?.userId || member?.id;
          return memberId === user?.id;
        });
      
      switch (selectedCollectionType) {
        case 'private':
          return isCreator && !isMember; // Creator only, not shared
        case 'shared':
          return isMember; // User is a member but not creator
        case 'public':
          return collection.is_public && !isCreator && !isMember; // Public collections user doesn't own or belong to
        default:
          return true;
      }
    });
  }, [sortedCollections, selectedCollectionType, user?.id]);

  const renderTabButton = (tab: TabType, icon: React.ReactNode, label: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {`${label} (${count})`}
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

  const handleDeleteCollection = (collection: Collection) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCollection(collection.id);
              Alert.alert('Success', 'Collection deleted successfully');
            } catch (error) {
              console.error('[ListsScreen] Error deleting collection:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert('Error', `Failed to delete collection: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  const handleLeaveCollection = (collection: Collection) => {
    Alert.alert(
      'Leave Collection',
      `Are you sure you want to leave "${collection.name}"? You won't be able to access it anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveCollection(collection.id);
              Alert.alert('Success', 'You have left the collection');
            } catch (error) {
              console.error('[ListsScreen] Error leaving collection:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert('Error', `Failed to leave collection: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  const isCollectionOwner = (collection: Collection) => {
    return collection.created_by === user?.id;
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Lists</Text>
          <Text style={styles.subtitle}>Organize and manage your favorites</Text>
        </View>
        <View style={styles.authPrompt}>
          <BookOpen size={48} color="#CCC" />
          <Text style={styles.authTitle}>Sign in to access your lists</Text>
          <Text style={styles.authText}>Create and manage your restaurant collections</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth' as any)}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Lists</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/create-collection' as any)}
          >
            <Plus size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Organize and manage your favorites</Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton('collections', <BookOpen size={18} color={activeTab === 'collections' ? '#FF6B6B' : '#666'} />, 'Plans', (planCollections || []).length)}
        {renderTabButton('favorites', <Heart size={18} color={activeTab === 'favorites' ? '#FF6B6B' : '#666'} />, 'Favorites', (favoriteRestaurants || []).length)}
      </View>

      {activeTab === 'collections' && (
        <View style={styles.collectionsHeader}>
          <TouchableOpacity
            style={styles.allCollectionsButton}
            onPress={() => router.push('/collections' as any)}
          >
            <BookOpen size={16} color="#FF6B6B" />
            <Text style={styles.allCollectionsButtonText}>Browse All Collections</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'collections' && (
        <View style={styles.collectionTypeCarousel}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            <TouchableOpacity
              style={[styles.collectionTypeButton, selectedCollectionType === 'all' && styles.activeCollectionTypeButton]}
              onPress={() => setSelectedCollectionType('all')}
            >
              <Text style={[styles.collectionTypeText, selectedCollectionType === 'all' && styles.activeCollectionTypeText]}>
                {`All (${sortedCollections.length})`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.collectionTypeButton, selectedCollectionType === 'private' && styles.activeCollectionTypeButton]}
              onPress={() => setSelectedCollectionType('private')}
            >
              <Text style={[styles.collectionTypeText, selectedCollectionType === 'private' && styles.activeCollectionTypeText]}>
                {`Private (${sortedCollections.filter((c: any) => c.created_by === user?.id && !c.collaborators?.some((m: any) => (typeof m === 'string' ? m : m?.userId || m?.id) === user?.id)).length})`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.collectionTypeButton, selectedCollectionType === 'shared' && styles.activeCollectionTypeButton]}
              onPress={() => setSelectedCollectionType('shared')}
            >
              <Text style={[styles.collectionTypeText, selectedCollectionType === 'shared' && styles.activeCollectionTypeText]}>
                {`Shared (${sortedCollections.filter((c: any) => c.collaborators?.some((m: any) => (typeof m === 'string' ? m : m?.userId || m?.id) === user?.id)).length})`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.collectionTypeButton, selectedCollectionType === 'public' && styles.activeCollectionTypeButton]}
              onPress={() => setSelectedCollectionType('public')}
            >
              <Text style={[styles.collectionTypeText, selectedCollectionType === 'public' && styles.activeCollectionTypeText]}>
                {`Public (${sortedCollections.filter((c: any) => c.is_public && c.created_by !== user?.id && !c.collaborators?.some((m: any) => (typeof m === 'string' ? m : m?.userId || m?.id) === user?.id)).length})`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {activeTab === 'favorites' && (favoriteRestaurants || []).length > 0 && (
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
        // Enhanced loading and error states
        planCollections === undefined ? (
          <View style={styles.loadingState}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading your collections...</Text>
          </View>
        ) : planCollections === null ? (
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Failed to load collections</Text>
            <Text style={styles.errorText}>Please check your connection and try again</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => window.location.reload()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (filteredCollections || []).length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptyText}>Create your first plan to start organizing restaurants for group dining experiences</Text>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => router.push('/create-collection' as any)}
            >
              <Plus size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Plans</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/create-collection' as any)}
              >
                <Plus size={16} color="#FF6B6B" />
                <Text style={styles.addButtonText}>Add New</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.collectionsGrid}>
              {filteredCollections.map((collection: any) => {
                // Create a deep copy to prevent mutation issues
                const collectionCopy = {
                  ...collection,
                  collaborators: [...(collection.collaborators || [])],
                  restaurant_ids: [...(collection.restaurant_ids || [])]
                };
                
                return (
                  <View key={collection.id} style={styles.collectionCardContainer}>
                    <CollectionCard
                      collection={collectionCopy}
                      onPress={() => router.push(`/collection/${collection.id}` as any)}
                    />
                    {isCollectionOwner(collection) ? (
                      // Show delete button for owners
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCollection(collection)}
                      >
                        <Trash2 size={16} color="#FFF" />
                      </TouchableOpacity>
                    ) : (
                      // Show leave button for members
                      <TouchableOpacity
                        style={styles.leaveButton}
                        onPress={() => handleLeaveCollection(collection)}
                      >
                        <UserMinus size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )
      ) : (
        (favoriteRestaurants || []).length === 0 ? (
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
                Your Favorites ({(favoriteRestaurants || []).length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Sorted by {sortBy === 'recent' ? 'recently added' : sortBy}
              </Text>
            </View>
            
            {viewType === 'grid' ? (
              <View style={styles.favoritesGrid}>
                {favoriteRestaurantsList.map(restaurant => (
                  <View key={restaurant.id} style={styles.favoriteCardWrapper}>
                    <SimpleRestaurantCard
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
                  <SimpleRestaurantCard
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },

  authPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  authText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  authButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  collectionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  allCollectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    gap: 8,
  },
  allCollectionsButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  collectionTypeCarousel: {
    marginTop: 8,
    marginBottom: 16,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  collectionTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCollectionTypeButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  collectionTypeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeCollectionTypeText: {
    color: '#FFFFFF',
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
  collectionCardContainer: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  leaveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  // Enhanced loading and error states
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderTopColor: '#FF6B6B',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});