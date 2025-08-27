import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Share, Platform, Clipboard, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Users, Heart, Trash2, ThumbsUp, ThumbsDown, MessageCircle, Crown, TrendingUp, TrendingDown, Award, UserPlus, Share2, Copy, UserMinus } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useCollectionById, useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

function getConsensusStyle(consensus: string) {
  switch (consensus) {
    case 'strong': return { backgroundColor: '#D1FAE5' };
    case 'moderate': return { backgroundColor: '#FEF3C7' };
    case 'mixed': return { backgroundColor: '#FED7AA' };
    case 'low': return { backgroundColor: '#FEE2E2' };
    default: return { backgroundColor: '#F3F4F6' };
  }
}

// Separate component for Insights Tab
interface InsightsTabProps {
  collection: any;
  rankedRestaurants: any[];
  discussions: any[];
  collectionMembers: string[];
  styles: any;
  setShowCommentModal: (restaurantId: string | null) => void;
}

function InsightsTab({ collection, rankedRestaurants, discussions, collectionMembers, styles, setShowCommentModal }: InsightsTabProps) {
  return (
    <View style={styles.insightsContainer}>
      {/* Group Insights */}
      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Group Insights</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {(() => {
                const totalMembers = collection.collaborators && Array.isArray(collection.collaborators) ? collection.collaborators.length : 0;
                const participatingMembers = rankedRestaurants.reduce((total, { meta }, restaurantIndex) => {
                  // Filter votes to only include collection members
                  // Extract first 8 characters from vote user IDs to match collection member format
                  const memberLikeVoters = meta.voteDetails.likeVoters.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  });
                  const memberDislikeVoters = meta.voteDetails.dislikeVoters.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  });
                  
                  const uniqueVoters = new Set([
                    ...memberLikeVoters.map((v: any, index: number) => `${v.userId?.substring(0, 8)}-${restaurantIndex}-${index}`),
                    ...memberDislikeVoters.map((v: any, index: number) => `${v.userId?.substring(0, 8)}-${restaurantIndex}-${index}`)
                  ]);
                  return total + uniqueVoters.size;
                }, 0);
                
                const participationRate = totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;
                
                console.log('[InsightsTab] Participation rate calculation:', {
                  totalMembers,
                  participatingMembers,
                  participationRate,
                  collectionMembers,
                  rankedRestaurantsCount: rankedRestaurants.length
                });
                
                return participationRate;
              })()}%
            </Text>
            <Text style={styles.analyticLabel}>Participation Rate</Text>
          </View>
          
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {rankedRestaurants.reduce((total, { meta }) => {
                // Filter votes to only include collection members
                // Extract first 8 characters from vote user IDs to match collection member format
                const memberLikeVoters = meta.voteDetails.likeVoters.filter((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  return collectionMembers.includes(voteUserIdShort);
                });
                const memberDislikeVoters = meta.voteDetails.dislikeVoters.filter((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  return collectionMembers.includes(voteUserIdShort);
                });
                return total + memberLikeVoters.length + memberDislikeVoters.length;
              }, 0)}
            </Text>
            <Text style={styles.analyticLabel}>Total Votes</Text>
          </View>
          
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {(() => {
                const totalVotes = rankedRestaurants.reduce((total, { meta }) => {
                  // Filter votes to only include collection members
                  // Extract first 8 characters from vote user IDs to match collection member format
                  const memberLikeVoters = meta.voteDetails.likeVoters.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  });
                  const memberDislikeVoters = meta.voteDetails.dislikeVoters.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  });
                  return total + memberLikeVoters.length + memberDislikeVoters.length;
                }, 0);
                const likeVotes = rankedRestaurants.reduce((total, { meta }) => {
                  // Filter votes to only include collection members
                  // Extract first 8 characters from vote user IDs to match collection member format
                  const memberLikeVoters = meta.voteDetails.likeVoters.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  });
                  return total + memberLikeVoters.length;
                }, 0);
                return totalVotes > 0 ? Math.round((likeVotes / totalVotes) * 100) : 0;
              })()}%
            </Text>
            <Text style={styles.analyticLabel}>Positive Sentiment</Text>
          </View>
          
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {(() => {
                // For group insights, show ALL discussions for the collection
                // Don't filter by collection members since discussions should be visible to all members
                const filteredDiscussions = discussions.filter((discussion: any) => {
                  // Only filter by collection ID to ensure it's for this collection
                  return discussion.collectionId === collection.id;
                });
                
                console.log('[InsightsTab] Discussions calculation:', {
                  totalDiscussions: discussions.length,
                  filteredDiscussions: filteredDiscussions.length,
                  collectionId: collection.id,
                  allDiscussions: discussions.map(d => ({
                    userId: d.userId,
                    userName: d.userName,
                    message: d.message?.substring(0, 50),
                    collectionId: d.collectionId,
                    restaurantId: d.restaurantId,
                    matchesCollection: d.collectionId === collection.id
                  })),
                  sampleDiscussion: discussions[0] ? {
                    userId: discussions[0].userId,
                    userName: discussions[0].userName,
                    message: discussions[0].message,
                    collectionId: discussions[0].collectionId,
                    matchesCollection: discussions[0].collectionId === collection.id
                  } : null
                });
                
                return filteredDiscussions.length;
              })()}
            </Text>
            <Text style={styles.analyticLabel}>Discussions</Text>
          </View>
        </View>
      </View>

      {/* Voting Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>📊 Restaurant Voting Breakdown</Text>
        <View style={styles.insightsGrid}>
          {rankedRestaurants.slice(0, 6).map(({ restaurant, meta }, index) => (
            <View key={restaurant.id} style={styles.insightsContent}>
              <View style={styles.restaurantHeader}>
                <View style={styles.restaurantImageContainer}>
                  <View style={styles.restaurantImagePlaceholder}>
                    <Text style={styles.restaurantImagePlaceholderText}>
                      {restaurant.name?.charAt(0).toUpperCase() || 'R'}
                    </Text>
                  </View>
                </View>
                <View style={styles.restaurantTitleContainer}>
                  <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
                  <Text style={styles.restaurantSubtitle}>Ranked #{index + 1} • {restaurant.cuisine || 'Restaurant'}</Text>
                </View>
                <View style={styles.restaurantRank}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
              </View>
              
              {/* Vote Statistics */}
              {(() => {
                if (!meta?.voteDetails) return <></>;

                // Filter votes to only include collection members
                // Extract first 8 characters from vote user IDs to match collection member format
                const memberLikeVoters = meta.voteDetails.likeVoters.filter((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  return collectionMembers.includes(voteUserIdShort);
                });
                const memberDislikeVoters = meta.voteDetails.dislikeVoters.filter((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  return collectionMembers.includes(voteUserIdShort);
                });
                
                console.log('[InsightsTab] Vote filtering for restaurant:', restaurant.name, {
                  allLikeVoters: meta.voteDetails.likeVoters.map((v: any) => ({ userId: v.userId, name: v.name })),
                  allDislikeVoters: meta.voteDetails.dislikeVoters.map((v: any) => ({ userId: v.userId, name: v.name })),
                  collectionMembers,
                  filteredLikeVoters: memberLikeVoters.length,
                  filteredDislikeVoters: memberDislikeVoters.length,
                  // Add detailed debugging for each vote
                  voteDetails: meta.voteDetails.likeVoters.map((v: any) => ({
                    voteUserId: v.userId,
                    voteUserIdType: typeof v.userId,
                    isInCollection: collectionMembers.includes(v.userId),
                    collectionMembersType: typeof collectionMembers[0]
                  })),
                  // Add specific debugging for the first vote
                  firstVoteDetails: meta.voteDetails.likeVoters.length > 0 ? {
                    voteUserId: meta.voteDetails.likeVoters[0].userId,
                    voteUserIdLength: meta.voteDetails.likeVoters[0].userId?.length,
                    voteUserIdStartsWith: meta.voteDetails.likeVoters[0].userId?.substring(0, 10),
                    voteUserIdShort: meta.voteDetails.likeVoters[0].userId?.substring(0, 8),
                    isInCollection: collectionMembers.includes(meta.voteDetails.likeVoters[0].userId?.substring(0, 8)),
                    collectionMembersSample: collectionMembers.slice(0, 2)
                  } : null
                });
                
                const totalVotes = memberLikeVoters.length + memberDislikeVoters.length;
                const approvalRate = totalVotes > 0 ? Math.round((memberLikeVoters.length / totalVotes) * 100) : 0;

                return (
                  <View style={styles.approvalSection}>
                    <View style={styles.approvalHeader}>
                      <Text style={styles.approvalTitle}>Approval</Text>
                      <Text style={styles.approvalRate}>{approvalRate}% approval</Text>
                    </View>
                    <Text style={styles.voteBreakdown}>
                      {memberLikeVoters.length} likes and {memberDislikeVoters.length} dislikes
                    </Text>
                    <View style={styles.consensusBadge}>
                      <Text style={styles.consensusBadgeText}>
                        {approvalRate >= 70 ? 'strong consensus' : approvalRate >= 50 ? 'moderate consensus' : 'mixed consensus'}
                      </Text>
                    </View>
                  </View>
                );
              })()}
              
              {/* Member Voting Details */}
              {(() => {
                if (!meta?.voteDetails) return <></>;

                const filteredLikeVoters = meta.voteDetails.likeVoters.filter((voter: any) => {
                  // Only show votes from collection members
                  // Extract first 8 characters from vote user IDs to match collection member format
                  const voteUserIdShort = voter.userId?.substring(0, 8);
                  if (!collectionMembers.includes(voteUserIdShort)) {
                    return false;
                  }
                  return voter.name && voter.name !== 'Unknown' && voter.name !== 'Unknown User';
                });

                const filteredDislikeVoters = meta.voteDetails.dislikeVoters.filter((voter: any) => {
                  // Only show votes from collection members
                  // Extract first 8 characters from vote user IDs to match collection member format
                  const voteUserIdShort = voter.userId?.substring(0, 8);
                  if (!collectionMembers.includes(voteUserIdShort)) {
                    return false;
                  }
                  return voter.name && voter.name !== 'Unknown' && voter.name !== 'Unknown User';
                });

                // Get discussions for this restaurant
                const restaurantDiscussions = discussions.filter((discussion: any) => {
                  const discussionUserIdShort = discussion.userId?.substring(0, 8);
                  return discussion.restaurantId === restaurant.id && collectionMembers.includes(discussionUserIdShort);
                });

                return (
                  <View style={styles.memberVotesSection}>
                    <Text style={styles.memberVotesTitle}>Member Activity for {restaurant.name}</Text>
                    
                    {/* Votes Section */}
                    <View style={styles.activitySection}>
                      <Text style={styles.activitySectionTitle}>Votes ({filteredLikeVoters.length + filteredDislikeVoters.length})</Text>
                      <View style={styles.memberVotesList}>
                        {filteredLikeVoters.map((voter: any, index: number) => (
                          <View key={`${restaurant.id}-like-${voter.userId}-${index}`} style={styles.memberVoteItem}>
                            <View style={styles.memberVoteAvatar}>
                              <Text style={styles.memberVoteInitial}>
                                {voter.name?.split(' ')[0]?.charAt(0).toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <Text style={styles.memberVoteName}>{voter.name?.split(' ')[0] || 'Unknown'}</Text>
                            <ThumbsUp size={16} color="#10B981" />
                            {voter.reason && (
                              <Text style={styles.voteReason}>"{voter.reason}"</Text>
                            )}
                          </View>
                        ))}
                        {filteredDislikeVoters.map((voter: any, index: number) => (
                          <View key={`${restaurant.id}-dislike-${voter.userId}-${index}`} style={styles.memberVoteItem}>
                            <View style={styles.memberVoteAvatar}>
                              <Text style={styles.memberVoteInitial}>
                                {voter.name?.split(' ')[0]?.charAt(0).toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <Text style={styles.memberVoteName}>{voter.name?.split(' ')[0] || 'Unknown'}</Text>
                            <ThumbsDown size={16} color="#EF4444" />
                            {voter.reason && (
                              <Text style={styles.voteReason}>"{voter.reason}"</Text>
                            )}
                          </View>
                        ))}
                        {filteredLikeVoters.length === 0 && filteredDislikeVoters.length === 0 && (
                          <Text style={styles.noVotes}>No votes yet</Text>
                        )}
                      </View>
                    </View>

                    {/* Discussions Section */}
                    <View style={styles.activitySection}>
                      <Text style={styles.activitySectionTitle}>Discussions ({restaurantDiscussions.length})</Text>
                      <View style={styles.discussionsList}>
                        {restaurantDiscussions.map((discussion: any, index: number) => (
                          <View key={`${restaurant.id}-discussion-${discussion.id}-${index}`} style={styles.discussionItem}>
                            <View style={styles.discussionHeader}>
                              <View style={styles.memberVoteAvatar}>
                                <Text style={styles.memberVoteInitial}>
                                  {discussion.userName?.split(' ')[0]?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                              </View>
                              <Text style={styles.memberVoteName}>{discussion.userName?.split(' ')[0] || 'Unknown'}</Text>
                              <MessageCircle size={16} color="#6B7280" />
                            </View>
                            <Text style={styles.discussionMessage}>"{discussion.message}"</Text>
                            <Text style={styles.discussionTime}>
                              {discussion.timestamp ? new Date(discussion.timestamp).toLocaleDateString() : 'Unknown date'}
                            </Text>
                          </View>
                        ))}
                        {restaurantDiscussions.length === 0 && (
                          <Text style={styles.noVotes}>No discussions yet</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })()}

              {/* User Discussions */}
              {(() => {
                const filteredDiscussions = discussions.filter((discussion: any) => {
                  const matchesRestaurant = discussion.restaurantId === restaurant.id;
                  // Extract first 8 characters from discussion user IDs to match collection member format
                  const discussionUserIdShort = discussion.userId?.substring(0, 8);
                  const isMember = collectionMembers.includes(discussionUserIdShort);
                  const hasValidName = discussion.userName && discussion.userName !== 'Unknown' && discussion.userName !== 'Unknown User';
                  
                  if (!matchesRestaurant) return false;
                  // Only show discussions from collection members
                  if (!isMember) return false;
                  return hasValidName;
                });

                return (
                  <View style={styles.discussionsSection}>
                    <View style={styles.discussionsHeader}>
                      <MessageCircle size={14} color="#6B7280" />
                      <Text style={styles.discussionsLabel}>Discussions ({filteredDiscussions.length})</Text>
                      <TouchableOpacity 
                        style={styles.addCommentButton}
                        onPress={() => setShowCommentModal(restaurant.id)}
                      >
                        <Text style={styles.addCommentButtonText}>Add Comment</Text>
                      </TouchableOpacity>
                    </View>
                    {filteredDiscussions.length > 0 ? (
                      filteredDiscussions.slice(0, 3).map((discussion: any) => (
                        <View key={discussion.id} style={styles.discussionItem}>
                          <View style={styles.discussionHeader}>
                            <View style={styles.discussionAvatar}>
                              <Text style={styles.discussionInitial}>
                                {discussion.userName?.split(' ')[0]?.charAt(0).toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <Text style={styles.discussionAuthor}>{discussion.userName?.split(' ')[0] || 'Unknown'}</Text>
                            <Text style={styles.discussionTime}>
                              {discussion.timestamp ? new Date(discussion.timestamp).toLocaleDateString() : 'Unknown date'}
                            </Text>
                          </View>
                          <Text style={styles.discussionText} numberOfLines={3}>{discussion.message}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDiscussions}>No discussions yet</Text>
                    )}
                  </View>
                );
              })()}
            </View>
          ))}
        </View>
      </View>


    </View>
  );
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Add null safety for the ID
  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <Text>Collection ID not found</Text>
      </View>
    );
  }
  
  const collection = useCollectionById(id) as any;
  const { user } = useAuth();
  const { 
    removeRestaurantFromCollection, 
    deleteCollection, 
    leaveCollection,
    voteRestaurant: originalVoteRestaurant, 
    addDiscussion: originalAddDiscussion, 
    addRestaurantComment,
    getRankedRestaurants, 
    getRankedRestaurantsWithAllVotes,
    getGroupRecommendations,
    getCollectionRestaurants,
    getCollectionRestaurantsFromDatabase,
    getCollectionDiscussions,
    inviteToCollection,
    updateCollectionSettings,
    getRestaurantVotingDetails,
    toggleFavorite,
    favoriteRestaurants,
    restaurants
  } = useRestaurants();

  // Wrapper functions that trigger ranking updates
  const voteRestaurant = useCallback((restaurantId: string, vote: 'like' | 'dislike', planId?: string, reason?: string) => {
    originalVoteRestaurant(restaurantId, vote, planId, reason);
    // Trigger ranking update
    setRankingUpdateTrigger(prev => prev + 1);
  }, [originalVoteRestaurant]);

  const addDiscussion = useCallback(async (restaurantId: string, planId: string, message: string) => {
    await originalAddDiscussion(restaurantId, planId, message);
    // Trigger ranking update
    setRankingUpdateTrigger(prev => prev + 1);
  }, [originalAddDiscussion]);
  
  const [showVoteModal, setShowVoteModal] = useState<{ restaurantId: string; vote: 'like' | 'dislike' } | null>(null);
  const [voteReason, setVoteReason] = useState('');
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
  const [rankingUpdateTrigger, setRankingUpdateTrigger] = useState(0);
  
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
  
  // Get restaurants for this collection using the simpler function
  const collectionRestaurants = getCollectionRestaurants(id || '');
  
  // Calculate proper member count for ranking
  const memberCount = effectiveCollection?.collaborators && Array.isArray(effectiveCollection.collaborators) 
    ? effectiveCollection.collaborators.length 
    : (effectiveCollection?.is_public ? 1 : 1); // Default to 1 for private/public collections
  
  console.log('[CollectionDetail] Member count for ranking:', memberCount);
  
  const rankedResult = getRankedRestaurants(id, memberCount);
  const rankedRestaurants = rankedResult?.restaurants || [];
  const participationData = rankedResult?.participationData;
  
  // Query to get ranked restaurants with all votes (including user names)
  const rankedRestaurantsWithAllVotesQuery = useQuery({
    queryKey: ['rankedRestaurantsWithAllVotes', id, memberCount, rankingUpdateTrigger],
    queryFn: async () => {
      if (!id) return { restaurants: [], participationData: null };
      console.log('[CollectionDetail] Fetching ranked restaurants with all votes for collection:', id);
      const result = await getRankedRestaurantsWithAllVotes(id, memberCount);
      console.log('[CollectionDetail] Ranked restaurants result:', {
        restaurantsCount: result.restaurants?.length || 0,
        hasParticipationData: !!result.participationData,
        sampleRestaurant: result.restaurants?.[0] ? {
          name: result.restaurants[0].restaurant.name,
          meta: {
            likes: result.restaurants[0].meta.likes,
            dislikes: result.restaurants[0].meta.dislikes,
            voteDetails: result.restaurants[0].meta.voteDetails
          }
        } : null
      });
      return result;
    },
    enabled: !!id,
    retry: 1,
    retryDelay: 1000
  });
  
  // Use the ranked restaurants with all votes if available, otherwise fall back to the basic ranking
  const effectiveRankedRestaurants = rankedRestaurantsWithAllVotesQuery.data?.restaurants || rankedRestaurants;
  const effectiveParticipationData = rankedRestaurantsWithAllVotesQuery.data?.participationData || participationData;
  
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
  
  // Use ranked restaurants with all votes if available, otherwise fall back to direct restaurants
  const displayRestaurants = effectiveRankedRestaurants.length > 0 
    ? effectiveRankedRestaurants 
    : (directRestaurantsQuery.data && directRestaurantsQuery.data.length > 0 
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
        : (collectionRestaurants.length > 0 ? collectionRestaurants : []).map(r => ({ 
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

  // Use display restaurants directly since they should already have proper voting data
  const restaurantsWithVotingData = displayRestaurants;
  
  const recommendations = effectiveCollection ? getGroupRecommendations(id) : [];
  
  // Load discussions asynchronously
  useEffect(() => {
    if (id) {
      setIsLoadingDiscussions(true);
      console.log('[CollectionDetail] Loading discussions for collection:', id);
      console.log('[CollectionDetail] getCollectionDiscussions function:', typeof getCollectionDiscussions);
      
      getCollectionDiscussions(id)
        .then((data) => {
          console.log('[CollectionDetail] Loaded discussions:', data?.length || 0);
          console.log('[CollectionDetail] Raw discussions data:', data);
          if (data && data.length > 0) {
            console.log('[CollectionDetail] Sample discussion:', {
              id: data[0].id,
              message: data[0].message,
              userName: data[0].userName,
              restaurantId: data[0].restaurantId,
              collectionId: data[0].collectionId,
              userId: data[0].userId
            });
          }
          setDiscussions(data || []);
        })
        .catch((error) => {
          console.error('[CollectionDetail] Error loading discussions:', error);
          console.error('[CollectionDetail] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          setDiscussions([]);
        })
        .finally(() => {
          setIsLoadingDiscussions(false);
        });
    }
  }, [id, getCollectionDiscussions]);

  // Fetch real discussion data from database
  const [realDiscussions, setRealDiscussions] = useState<any[]>([]);

  useEffect(() => {
    const loadRealDiscussions = async () => {
      if (!id) return;
      
      try {
        const { data: discussionsData, error } = await supabase
          .from('restaurant_discussions')
          .select('*')
          .eq('collection_id', id)
          .order('created_at', { ascending: false });
        
        if (!error && discussionsData) {
          console.log('[CollectionDetail] Loaded real discussions:', discussionsData.length);
          setRealDiscussions(discussionsData);
        } else {
          console.error('[CollectionDetail] Error loading real discussions:', error);
          setRealDiscussions([]);
        }
      } catch (error) {
        console.error('[CollectionDetail] Exception loading real discussions:', error);
        setRealDiscussions([]);
      }
    };
    
    loadRealDiscussions();
  }, [id]);

  // Use discussions with proper user names (from getCollectionDiscussions)
  const effectiveDiscussions = discussions;
  
  console.log('[CollectionDetail] Effective discussions for InsightsTab:', {
    discussionsLength: discussions.length,
    effectiveDiscussionsLength: effectiveDiscussions.length,
    sampleDiscussion: effectiveDiscussions[0] ? {
      id: effectiveDiscussions[0].id,
      userId: effectiveDiscussions[0].userId,
      userName: effectiveDiscussions[0].userName,
      message: effectiveDiscussions[0].message?.substring(0, 50),
      collectionId: effectiveDiscussions[0].collectionId,
      restaurantId: effectiveDiscussions[0].restaurantId
    } : null,
    allDiscussions: effectiveDiscussions.map(d => ({
      id: d.id,
      userId: d.userId,
      userName: d.userName,
      collectionId: d.collectionId,
      restaurantId: d.restaurantId
    }))
  });

  // Calculate collection members for privacy filtering
  const collectionMembers = effectiveCollection?.collaborators && Array.isArray(effectiveCollection.collaborators) 
    ? effectiveCollection.collaborators.map((member: any) => {
        if (typeof member === 'string') return member;
        // Handle different ID formats - extract the actual user ID from memberId or userId
        if (member?.memberId && member.memberId.startsWith('member_')) {
          return member.memberId.replace('member_', '');
        }
        return member?.userId || member?.id;
      })
    : [];
  
  console.log('[CollectionDetail] Collection members calculation:', {
    collaborators: effectiveCollection?.collaborators,
    collectionMembers,
    sampleVoteData: effectiveRankedRestaurants[0]?.meta?.voteDetails ? {
      likeVoters: effectiveRankedRestaurants[0].meta.voteDetails.likeVoters.map((v: any) => ({ 
        userId: v.userId, 
        name: v.name,
        userIdLength: v.userId?.length,
        userIdStartsWith: v.userId?.substring(0, 10)
      })),
      dislikeVoters: effectiveRankedRestaurants[0].meta.voteDetails.dislikeVoters.map((v: any) => ({ 
        userId: v.userId, 
        name: v.name,
        userIdLength: v.userId?.length,
        userIdStartsWith: v.userId?.substring(0, 10)
      }))
    } : null
  });

  // Determine collection type
  const getCollectionType = () => {
    if (!effectiveCollection) return 'private';
    
    // Check if it's public
    if (effectiveCollection.is_public) return 'public';
    
    // Check if it's shared (has multiple members)
    if (collectionMembers.length > 1) return 'shared';
    
    // Otherwise it's private
    return 'private';
  };

  const isCollectionOwner = () => {
    if (!user || !effectiveCollection) return false;
    return effectiveCollection.created_by === user.id || effectiveCollection.creator_id === user.id;
  };

  const isCollectionMember = () => {
    if (!user || !effectiveCollection) return false;
    return collectionMembers.includes(user.id);
  };

  const collectionType = getCollectionType();
  const isSharedCollection = collectionType === 'shared';
  
  console.log('[CollectionDetail] Effective ranked restaurants:', effectiveRankedRestaurants.length);
  console.log('[CollectionDetail] Effective participation data:', effectiveParticipationData);
  console.log('[CollectionDetail] Is shared collection:', isSharedCollection);
  console.log('[CollectionDetail] Collection members:', collectionMembers.length);

  // Show loading state while collection is being fetched
  if (!effectiveCollection && directCollectionQuery.isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text>Loading collection...</Text>
      </View>
    );
  }
  
  // Show error state if collection is not found
  if (!effectiveCollection) {
    return (
      <View style={styles.errorContainer}>
        <Text>Collection not found</Text>
        <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          ID: {id}
        </Text>
      </View>
    );
  }

  // Check if user is the owner of the collection (using effectiveCollection)

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
              await deleteCollection(effectiveCollection?.id || '');
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
              await leaveCollection(effectiveCollection?.id || '');
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

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
            inviteToCollection(effectiveCollection?.id || '', inviteEmail, inviteMessage);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteMessage('');
    Alert.alert('Invitation Sent', `Invitation sent to ${inviteEmail}`);
  };

  const handleAddComment = async (restaurantId: string) => {
    if (!commentMessage.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }
    
    try {
      await addRestaurantComment(restaurantId, id, commentMessage);
      
      // Refresh discussions after adding comment
      const updatedDiscussions = await getCollectionDiscussions(id);
      setDiscussions(updatedDiscussions || []);
      
      setShowCommentModal(null);
      setCommentMessage('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('[CollectionDetail] Error adding comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to add comment: ${errorMessage}`);
    }
  };

  const handleShareCollection = async () => {
          const shareUrl = `https://yourapp.com/collection/${effectiveCollection?.id || ''}`;
      const message = `Check out this restaurant collection: ${effectiveCollection?.name || 'Collection'}\n\n${effectiveCollection?.description || ''}\n\n${shareUrl}`;
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(message);
          Alert.alert('Copied!', 'Collection link copied to clipboard');
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = message;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          Alert.alert('Copied!', 'Collection link copied to clipboard');
        }
      } else {
        await Share.share({
          message,
          url: shareUrl,
          title: collection.name
        });
      }
    } catch (error) {
      console.error('Error sharing collection:', error);
      Alert.alert('Share Collection', message, [
        { text: 'Copy to Clipboard', onPress: () => {
          try {
            if (Platform.OS === 'web') {
              const textArea = document.createElement('textarea');
              textArea.value = message;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
            }
          } catch (e) {
            console.error('Fallback copy failed:', e);
          }
        }},
        { text: 'OK' }
      ]);
    }
  };

  const copyInviteLink = async () => {
          const inviteLink = `https://yourapp.com/invite/${effectiveCollection?.id || ''}`;
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(inviteLink);
          Alert.alert('Copied!', 'Invite link copied to clipboard');
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = inviteLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          Alert.alert('Copied!', 'Invite link copied to clipboard');
        }
      } else {
        await Clipboard.setString(inviteLink);
        Alert.alert('Copied!', 'Invite link copied to clipboard');
      }
    } catch (error) {
      console.error('Error copying invite link:', error);
      Alert.alert('Invite Link', inviteLink, [
        { text: 'Copy to Clipboard', onPress: () => {
          try {
            if (Platform.OS === 'web') {
              const textArea = document.createElement('textarea');
              textArea.value = inviteLink;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
            }
          } catch (e) {
            console.error('Fallback copy failed:', e);
          }
        }},
        { text: 'OK' }
      ]);
    }
  };

  const handleRemoveRestaurant = (restaurantId: string, restaurantName: string) => {
    Alert.alert(
      'Remove Restaurant',
      `Remove ${restaurantName} from this collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeRestaurantFromCollection(effectiveCollection?.id || '', restaurantId)
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: effectiveCollection?.name || 'Collection',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handleShareCollection}>
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
          <Text style={styles.name}>{effectiveCollection?.name || 'Collection'}</Text>
          <Text style={styles.description}>{effectiveCollection?.description || ''}</Text>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Heart size={16} color="#FF6B6B" fill="#FF6B6B" />
              <Text style={styles.statText}>{effectiveCollection?.likes || 0} likes</Text>
            </View>
            <View style={styles.stat}>
              <Users size={16} color="#666" />
              <Text style={styles.statText}>
                {effectiveCollection?.collaborators && Array.isArray(effectiveCollection.collaborators) ? effectiveCollection.collaborators.length : 0} members
              </Text>
            </View>
          </View>
          
          {/* Collaborators */}
          <View style={styles.collaboratorsSection}>
            <View style={styles.collaboratorsHeader}>
              <Text style={styles.collaboratorsTitle}>Group Members</Text>
              <View style={styles.collaboratorActions}>
                <TouchableOpacity 
                  style={styles.inviteButton}
                  onPress={() => setShowInviteModal(true)}
                >
                  <UserPlus size={14} color="#3B82F6" />
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={copyInviteLink}
                >
                  <Copy size={14} color="#6B7280" />
                  <Text style={styles.shareButtonText}>Copy Link</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collaboratorsList}>
              {effectiveCollection?.collaborators && Array.isArray(effectiveCollection.collaborators) ? (
                effectiveCollection.collaborators.map((member: any, index: number) => {
                  const memberName = typeof member === 'string' ? member : member?.name || `Member ${index + 1}`;
                  const memberId = typeof member === 'string' ? member : member?.userId || `member-${index}`;
                  const memberRole = typeof member === 'string' ? 'member' : member?.role || 'member';
                  const isVerified = typeof member === 'string' ? false : member?.isVerified || false;
                  
                  return (
                    <View key={memberId} style={styles.collaboratorItem}>
                      <View style={styles.collaboratorAvatar}>
                        <Text style={styles.collaboratorInitial}>
                          {memberName && typeof memberName === 'string' && memberName.length > 0 ? memberName.charAt(0).toUpperCase() : '?'}
                        </Text>
                        {memberRole === 'admin' && <Crown size={12} color="#FFD700" style={styles.adminBadge} />}
                      </View>
                      <Text style={styles.collaboratorName}>{memberName || 'Unknown Member'}</Text>
                      {isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
                    </View>
                  );
                })
              ) : (
                <View style={styles.collaboratorItem}>
                  <View style={styles.collaboratorAvatar}>
                    <Text style={styles.collaboratorInitial}>?</Text>
                  </View>
                  <Text style={styles.collaboratorName}>No members</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
            onPress={() => setActiveTab('restaurants')}
          >
            <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>
              Restaurants ({restaurantsWithVotingData.length})
            </Text>
          </TouchableOpacity>
          {isSharedCollection && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
              onPress={() => setActiveTab('insights')}
            >
              <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
                Insights
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Content */}
        {activeTab === 'restaurants' ? (
          <View style={styles.restaurantsList}>
            {restaurantsWithVotingData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No restaurants in this collection yet</Text>
              </View>
            ) : (
              restaurantsWithVotingData.map(({ restaurant, meta }, index) => {
                const isFavorite = favoriteRestaurants.includes(restaurant.id);
                const userLiked = meta.voteDetails?.likeVoters?.some((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  const userShort = user?.id?.substring(0, 8);
                  return voteUserIdShort === userShort;
                });
                const userDisliked = meta.voteDetails?.dislikeVoters?.some((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  const userShort = user?.id?.substring(0, 8);
                  return voteUserIdShort === userShort;
                });
                
                                 // Only show winning styles if there's 75% participation and this is the top-ranked restaurant
                const shouldShowWinningStyles = isSharedCollection && 
                  effectiveParticipationData?.has75PercentParticipation && 
                  meta?.rank === 1;
                
                return (
                   <View key={restaurant?.id || index} style={[
                     styles.restaurantItem,
                     shouldShowWinningStyles && styles.winningRestaurantItem
                   ]}>
                     {/* Top Badges Row - Only for shared collections */}
                     {isSharedCollection && (
                       <View style={styles.badgesRow}>
                         <View style={[
                           styles.rankBadge,
                           shouldShowWinningStyles && styles.winnerRankBadge,
                           meta?.rank === 2 && styles.silverRankBadge,
                           meta?.rank === 3 && styles.bronzeRankBadge
                         ]}>
                           <Text style={styles.rankNumber}>#{meta?.rank || index + 1}</Text>
                         </View>
                         
                         {/* Top Choice Badge for Winner - Only with 75% participation */}
                         {shouldShowWinningStyles && (
                           <View style={styles.topChoiceBadge}>
                             <Crown size={12} color="#FFFFFF" />
                             <Text style={styles.topChoiceText}>TOP CHOICE</Text>
                           </View>
                         )}
                       </View>
                     )}

                    {/* Restaurant Info Section */}
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

                                         {/* Approval Section - Only for shared collections */}
                     {isSharedCollection && (
                       <View style={styles.approvalSection}>
                         <Text style={styles.approvalText}>{meta.approvalPercent}% approval</Text>
                         <Text style={styles.voteBreakdown}>
                           {meta.voteDetails?.likeVoters?.filter((v: any) => {
                             const voteUserIdShort = v.userId?.substring(0, 8);
                             return collectionMembers.includes(voteUserIdShort);
                           }).length || 0} likes • {meta.voteDetails?.dislikeVoters?.filter((v: any) => {
                             const voteUserIdShort = v.userId?.substring(0, 8);
                             return collectionMembers.includes(voteUserIdShort);
                           }).length || 0} dislikes
                         </Text>
                         {(meta.likes > 0 || meta.dislikes > 0 || meta.discussionCount > 0) && (
                           <View style={styles.consensusBadge}>
                             <Text style={styles.consensusBadgeText}>
                               {meta.approvalPercent >= 70 ? 'strong consensus' : meta.approvalPercent >= 50 ? 'moderate consensus' : 'mixed consensus'}
                             </Text>
                           </View>
                         )}
                       </View>
                     )}

                                         {/* Vote Actions - Only for shared collections */}
                     {isSharedCollection && (
                       <View style={styles.voteActions}>
                         <TouchableOpacity 
                           style={[
                             styles.voteButton, 
                             styles.likeButton,
                             userLiked && styles.likeButtonActive
                           ]}
                           onPress={() => voteRestaurant(restaurant.id, 'like', id, '')}
                         >
                           <ThumbsUp size={16} color={userLiked ? "#FFFFFF" : "#22C55E"} />
                           <Text style={[styles.voteCount, userLiked && styles.voteCountActive]}>{meta.voteDetails?.likeVoters?.filter((v: any) => {
                             const voteUserIdShort = v.userId?.substring(0, 8);
                             return collectionMembers.includes(voteUserIdShort);
                           }).length || 0}</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[
                             styles.voteButton, 
                             styles.dislikeButton,
                             userDisliked && styles.dislikeButtonActive
                           ]}
                           onPress={() => voteRestaurant(restaurant.id, 'dislike', id, '')}
                         >
                           <ThumbsDown size={16} color={userDisliked ? "#FFFFFF" : "#EF4444"} />
                           <Text style={[styles.voteCount, userDisliked && styles.voteCountActive]}>{meta.voteDetails?.dislikeVoters?.filter((v: any) => {
                             const voteUserIdShort = v.userId?.substring(0, 8);
                             return collectionMembers.includes(voteUserIdShort);
                           }).length || 0}</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.voteButton, styles.commentButton]}
                           onPress={() => setShowDiscussionModal(restaurant.id)}
                         >
                           <MessageCircle size={16} color="#6B7280" />
                           <Text style={styles.voteCount}>{discussions.filter((d: any) => {
                             const discussionUserIdShort = d.userId?.substring(0, 8);
                             return d.restaurantId === restaurant.id && collectionMembers.includes(discussionUserIdShort);
                           }).length}</Text>
                         </TouchableOpacity>
                       </View>
                     )}

                                         {/* Remove Button - Only for collection owners */}
                     {isCollectionOwner() && (
                       <TouchableOpacity 
                         style={styles.removeButton}
                         onPress={() => handleRemoveRestaurant(restaurant.id, restaurant.name)}
                       >
                         <Text style={styles.removeButtonText}>Remove</Text>
                       </TouchableOpacity>
                     )}
                  </View>
                );
              })
            )}
          </View>
                 ) : (
           isSharedCollection ? (
             <InsightsTab 
               collection={effectiveCollection}
               rankedRestaurants={effectiveRankedRestaurants}
               discussions={effectiveDiscussions}
               collectionMembers={collectionMembers}
               styles={styles}
               setShowCommentModal={setShowCommentModal}
             />
           ) : (
             <View style={styles.insightsContainer}>
               <Text style={styles.sectionTitle}>Insights</Text>
               <Text style={styles.emptyText}>
                 Insights and analytics are only available for shared collections with multiple members.
               </Text>
             </View>
           )
         )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Vote Modal */}
      <Modal visible={!!showVoteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showVoteModal?.vote === 'like' ? 'Why do you like this?' : 'Why don\'t you like this?'}
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Share your thoughts (optional)"
              multiline
              value={voteReason}
              onChangeText={setVoteReason}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  if (showVoteModal) {
                    voteRestaurant(showVoteModal.restaurantId, showVoteModal.vote, id, voteReason);
                  }
                  setShowVoteModal(null);
                  setVoteReason('');
                }}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowVoteModal(null);
                  setVoteReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                      
                      // Refresh discussions after adding
                      const updatedDiscussions = await getCollectionDiscussions(id);
                      setDiscussions(updatedDiscussions || []);
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

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite to Collection</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Email address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.reasonInput}
              placeholder="Personal message (optional)"
              multiline
              value={inviteMessage}
              onChangeText={setInviteMessage}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={handleInviteUser}>
                <Text style={styles.modalButtonText}>Send Invite</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal visible={!!showCommentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Comment</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Share your thoughts about this restaurant..."
              multiline
              value={commentMessage}
              onChangeText={setCommentMessage}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  if (showCommentModal) {
                    handleAddComment(showCommentModal);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Add Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCommentModal(null);
                  setCommentMessage('');
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
  collaboratorsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  collaboratorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collaboratorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  collaboratorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    gap: 4,
  },
  inviteButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    gap: 4,
  },
  shareButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  collaboratorsList: {
    flexDirection: 'row',
  },
  collaboratorItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  collaboratorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  collaboratorInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  collaboratorName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  verifiedBadge: {
    fontSize: 10,
    color: '#10B981',
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
  winningRestaurantItem: {
    backgroundColor: '#FFFBEB',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankBadge: {
    width: 36,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  winnerRankBadge: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
    borderWidth: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  silverRankBadge: {
    backgroundColor: '#6B7280',
    borderColor: '#4B5563',
    borderWidth: 2,
  },
  bronzeRankBadge: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
    borderWidth: 2,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topChoiceBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topChoiceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
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
  approvalSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  approvalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  voteBreakdown: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  consensusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  consensusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'lowercase',
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
  likeButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  dislikeButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
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
  voteCountActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  removeButton: {
    marginTop: -8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  insightsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  analyticsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  analyticCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: '45%',
    flex: 1,
  },
  analyticValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  analyticLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  insightsGrid: {
    gap: 16,
  },
  insightsContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  restaurantImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  restaurantImagePlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  restaurantTitleContainer: {
    flex: 1,
    minWidth: 0,
  },
  restaurantSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
  },
  restaurantRank: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  approvalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  approvalRate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  memberVotesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  memberVotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  memberVotesList: {
    gap: 8,
  },
  memberVoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  memberVoteAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberVoteInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberVoteName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  voteReason: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginLeft: 8,
    flex: 1,
  },
  activitySection: {
    marginBottom: 16,
  },
  activitySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  discussionsList: {
    gap: 8,
  },
  discussionMessage: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 32,
    marginBottom: 4,
  },
  noVotes: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  discussionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  discussionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  discussionsLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  addCommentButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  addCommentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  discussionItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  discussionAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discussionInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  discussionAuthor: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  discussionTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  discussionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  noDiscussions: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
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
