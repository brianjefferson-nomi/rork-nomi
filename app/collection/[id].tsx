import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Share, Platform, Clipboard, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Users, Heart, Trash2, ThumbsUp, ThumbsDown, MessageCircle, Crown, UserPlus, Share2, Copy, UserMinus } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useCollectionById, useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const collection = useCollectionById(id) as any;
  const { user } = useAuth();
  const { 
    removeRestaurantFromCollection, 
    deleteCollection, 
    leaveCollection,
    voteRestaurant, 
    addDiscussion, 
    addRestaurantComment,
    getRankedRestaurants, 
    getGroupRecommendations,
    getCollectionRestaurants,
    getCollectionRestaurantsFromDatabase,
    getCollectionDiscussions,
    inviteToCollection,
    toggleFavorite,
    favoriteRestaurants,
    restaurants
  } = useRestaurants();
  
  const [showDiscussionModal, setShowDiscussionModal] = useState<string | null>(null);
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [commentMessage, setCommentMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'insights'>('restaurants');
  
  // If collection is not found in the store, fetch it directly from the database
  const directCollectionQuery = useQuery({
    queryKey: ['directCollection', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        console.log('[CollectionDetail] Fetching collection directly from database:', id);
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.log('[CollectionDetail] Error fetching collection directly:', error.message);
          return null;
        }
        
        console.log('[CollectionDetail] Successfully fetched collection directly:', data.name);
        return data;
      } catch (error) {
        console.log('[CollectionDetail] Exception fetching collection directly:', error);
        return null;
      }
    },
    enabled: !!id && !collection,
    retry: 2,
    retryDelay: 1000
  });
  
  // Use the direct collection if the store collection is not available
  const effectiveCollection = collection || directCollectionQuery.data;
  
  // Get restaurants for this collection
  const collectionRestaurants = getCollectionRestaurants(id || '');
  const rankedRestaurants = getRankedRestaurants(id, effectiveCollection?.collaborators && Array.isArray(effectiveCollection.collaborators) ? effectiveCollection.collaborators.length : 0) || [];
  
  // Fetch restaurants directly from database as a fallback
  const directRestaurantsQuery = useQuery({
    queryKey: ['directCollectionRestaurants', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        console.log('[CollectionDetail] Starting direct restaurants query for ID:', id);
        const restaurants = await getCollectionRestaurantsFromDatabase(id);
        console.log('[CollectionDetail] Direct restaurants query result:', restaurants.length);
        return restaurants;
      } catch (error) {
        console.error('[CollectionDetail] Error fetching direct restaurants:', error);
        return [];
      }
    },
    enabled: !!id && (collectionRestaurants.length === 0 || rankedRestaurants.length === 0),
    retry: 1,
    retryDelay: 1000
  });
  
  // Use direct restaurants from database if available, otherwise fall back to other sources
  const displayRestaurants = directRestaurantsQuery.data && directRestaurantsQuery.data.length > 0 
    ? directRestaurantsQuery.data.map(r => ({ 
        restaurant: r, 
        meta: { 
          likes: 0, 
          dislikes: 0, 
          rank: 1,
          voteDetails: {
            likeVoters: [],
            dislikeVoters: []
          },
          approvalPercent: 0,
          discussionCount: 0
        } 
      }))
    : (rankedRestaurants.length > 0 ? rankedRestaurants : 
        (collectionRestaurants.length > 0 ? collectionRestaurants : []).map(r => ({ 
          restaurant: r, 
          meta: { 
            likes: 0, 
            dislikes: 0, 
            rank: 1,
            voteDetails: {
              likeVoters: [],
              dislikeVoters: []
            },
            approvalPercent: 0,
            discussionCount: 0
          } 
        })));
  
  // Load discussions asynchronously
  useEffect(() => {
    if (id) {
      setIsLoadingDiscussions(true);
      getCollectionDiscussions(id)
        .then((data) => {
          console.log('[CollectionDetail] Loaded discussions:', data?.length || 0);
          setDiscussions(data || []);
        })
        .catch((error) => {
          console.error('[CollectionDetail] Error loading discussions:', error);
          setDiscussions([]);
        })
        .finally(() => {
          setIsLoadingDiscussions(false);
        });
    }
  }, [id, getCollectionDiscussions]);

  if (!effectiveCollection) {
    return (
      <View style={styles.errorContainer}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  // Check if user is the owner of the collection
  const isCollectionOwner = () => {
    if (!user || !collection) return false;
    return collection.created_by === user.id || collection.creator_id === user.id;
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCollection(collection.id);
              Alert.alert('Success', 'Collection deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('[CollectionDetail] Error deleting collection:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert('Error', `Failed to delete collection: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  const handleLeaveCollection = () => {
    Alert.alert(
      'Leave Collection',
      'Are you sure you want to leave this collection? You can rejoin later if invited.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveCollection(collection.id);
              Alert.alert('Success', 'You have left the collection', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('[CollectionDetail] Error leaving collection:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert('Error', `Failed to leave collection: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: collection.name,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => {}}>
                <Share2 size={20} color="#6B7280" />
              </TouchableOpacity>
              {isCollectionOwner() ? (
                <TouchableOpacity onPress={handleDeleteCollection}>
                  <Trash2 size={20} color="#FF6B6B" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleLeaveCollection}>
                  <UserMinus size={20} color="#FF8C00" />
                </TouchableOpacity>
              )}
            </View>
          )
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.name}>{collection.name}</Text>
          <Text style={styles.description}>{collection.description}</Text>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Heart size={16} color="#FF6B6B" fill="#FF6B6B" />
              <Text style={styles.statText}>{collection.likes} likes</Text>
            </View>
            <View style={styles.stat}>
              <Users size={16} color="#666" />
              <Text style={styles.statText}>
                {collection.collaborators && Array.isArray(collection.collaborators) ? collection.collaborators.length : 0} members
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
            onPress={() => setActiveTab('restaurants')}
          >
            <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>
              Restaurants ({displayRestaurants.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
            onPress={() => setActiveTab('insights')}
          >
            <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
              Insights
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'restaurants' ? (
          <View style={styles.restaurantsList}>
            {displayRestaurants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No restaurants in this collection yet</Text>
              </View>
            ) : (
              displayRestaurants.map(({ restaurant, meta }, index) => {
                const isFavorite = favoriteRestaurants.includes(restaurant.id);
                
                return (
                  <View key={restaurant?.id || index} style={styles.restaurantItem}>
                    <View style={styles.restaurantInfoSection}>
                      <View style={styles.restaurantImageContainer}>
                        <Image 
                          source={{ uri: restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }}
                          style={styles.restaurantImage}
                          resizeMode="cover"
                        />
                      </View>
                      
                      <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <Text style={styles.restaurantCuisine}>{restaurant.cuisine || 'Restaurant'}</Text>
                        <Text style={styles.restaurantDetails}>
                          {restaurant.priceRange} • {restaurant.neighborhood || 'Restaurant'}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.heartButton}
                        onPress={() => toggleFavorite(restaurant.id)}
                      >
                        <Text style={[styles.heartIcon, isFavorite && styles.heartIconActive]}>
                          {isFavorite ? '♥' : '♡'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Vote Actions */}
                    <View style={styles.voteActions}>
                      <TouchableOpacity 
                        style={[styles.voteButton, styles.likeButton]}
                        onPress={() => voteRestaurant(restaurant.id, 'like', id, '')}
                      >
                        <ThumbsUp size={16} color="#22C55E" />
                        <Text style={styles.voteCount}>{meta.likes}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.voteButton, styles.dislikeButton]}
                        onPress={() => voteRestaurant(restaurant.id, 'dislike', id, '')}
                      >
                        <ThumbsDown size={16} color="#EF4444" />
                        <Text style={styles.voteCount}>{meta.dislikes}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.voteButton, styles.commentButton]}
                        onPress={() => setShowDiscussionModal(restaurant.id)}
                      >
                        <MessageCircle size={16} color="#6B7280" />
                        <Text style={styles.voteCount}>{meta.discussionCount}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Collection Insights</Text>
            <Text style={styles.insightsText}>Insights coming soon...</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Discussion Modal */}
      <Modal visible={!!showDiscussionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Share your thoughts..."
              multiline
              value={discussionMessage}
              onChangeText={setDiscussionMessage}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={async () => {
                  if (showDiscussionModal && discussionMessage.trim()) {
                    try {
                      await addDiscussion(showDiscussionModal, id, discussionMessage);
                    } catch (error) {
                      console.error('[CollectionDetail] Error adding discussion:', error);
                      Alert.alert('Error', 'Failed to add comment. Please try again.');
                    }
                  }
                  setShowDiscussionModal(null);
                  setDiscussionMessage('');
                }}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDiscussionModal(null);
                  setDiscussionMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  restaurantsList: {
    padding: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  restaurantItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  restaurantDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    marginTop: 2,
  },
  heartButton: {
    padding: 8,
  },
  heartIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  heartIconActive: {
    color: '#FF6B6B',
    fontSize: 20,
  },
  voteActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minWidth: 60,
    justifyContent: 'center',
  },
  likeButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dislikeButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  commentButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  insightsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  insightsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 320,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
}); 
