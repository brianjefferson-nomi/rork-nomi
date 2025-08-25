import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Share, Platform, Clipboard } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Users, Heart, Trash2, ThumbsUp, ThumbsDown, MessageCircle, Crown, TrendingUp, TrendingDown, Award, UserPlus, Share2, Copy, UserMinus } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useCollectionById, useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';

function getConsensusStyle(consensus: string) {
  switch (consensus) {
    case 'strong': return { backgroundColor: '#D1FAE5' };
    case 'moderate': return { backgroundColor: '#FEF3C7' };
    case 'mixed': return { backgroundColor: '#FED7AA' };
    case 'low': return { backgroundColor: '#FEE2E2' };
    default: return { backgroundColor: '#F3F4F6' };
  }
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const collection = useCollectionById(id) as any; // Type assertion for now to handle mixed data
  const { user } = useAuth();
  const { 
    removeRestaurantFromCollection, 
    deleteCollection, 
    leaveCollection,
    voteRestaurant, 
    addDiscussion, 
    getRankedRestaurants, 
    getGroupRecommendations,
    getCollectionDiscussions,
    inviteToCollection,
    updateCollectionSettings,
    getRestaurantVotingDetails
  } = useRestaurants();
  
  const [showVoteModal, setShowVoteModal] = useState<{ restaurantId: string; vote: 'like' | 'dislike' } | null>(null);
  const [voteReason, setVoteReason] = useState('');
  const [showDiscussionModal, setShowDiscussionModal] = useState<string | null>(null);
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'insights'>('restaurants');
  
  const rankedRestaurants = getRankedRestaurants(id, collection?.collaborators && Array.isArray(collection.collaborators) ? collection.collaborators.length : 0) || [];
  
  // Debug logging for ranked restaurants
  console.log('[CollectionDetail] Ranked restaurants:', rankedRestaurants.length);
  rankedRestaurants.forEach(({ restaurant, meta }, index) => {
    console.log(`[CollectionDetail] Restaurant ${index + 1}: ${restaurant.name} - Likes: ${meta.likes}, Dislikes: ${meta.dislikes}`);
  });
  const recommendations = collection ? getGroupRecommendations(id) : [];
  
  // Load discussions asynchronously
  useEffect(() => {
    if (id) {
      setIsLoadingDiscussions(true);
      getCollectionDiscussions(id)
        .then((data) => {
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

  if (!collection) {
    return (
      <View style={styles.errorContainer}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  // Add safety checks for collection data
  if (!collection.name) {
    return (
      <View style={styles.errorContainer}>
        <Text>Invalid collection data</Text>
      </View>
    );
  }

  console.log('[CollectionDetail] Ranked restaurants:', rankedRestaurants.length);
  console.log('[CollectionDetail] Recommendations:', recommendations.length);
  console.log('[CollectionDetail] Discussions:', discussions.length);

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



  // Check if user is the owner of the collection
  const isCollectionOwner = () => {
    if (!user || !collection) return false;
    return collection.created_by === user.id || collection.creator_id === user.id;
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    inviteToCollection(collection.id, inviteEmail, inviteMessage);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteMessage('');
    Alert.alert('Invitation Sent', `Invitation sent to ${inviteEmail}`);
  };

  const handleShareCollection = async () => {
    const shareUrl = `https://yourapp.com/collection/${collection.id}`;
    const message = `Check out this restaurant collection: ${collection.name}\n\n${collection.description}\n\n${shareUrl}`;
    
    try {
      if (Platform.OS === 'web') {
        // Web fallback - copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(message);
          Alert.alert('Copied!', 'Collection link copied to clipboard');
        } else {
          // Fallback for older browsers - create a temporary textarea
          const textArea = document.createElement('textarea');
          textArea.value = message;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          Alert.alert('Copied!', 'Collection link copied to clipboard');
        }
      } else {
        // Native sharing
        await Share.share({
          message,
          url: shareUrl,
          title: collection.name
        });
      }
    } catch (error) {
      console.error('Error sharing collection:', error);
      // Final fallback - show the message in an alert
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
    const inviteLink = `https://yourapp.com/invite/${collection.id}`;
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(inviteLink);
          Alert.alert('Copied!', 'Invite link copied to clipboard');
        } else {
          // Fallback for older browsers
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
          onPress: () => removeRestaurantFromCollection(collection.id, restaurantId)
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
              {collection.collaborators && Array.isArray(collection.collaborators) ? (
                collection.collaborators.map((member: any, index: number) => {
                  // Handle both string and object formats for collaborators
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
              Restaurants ({rankedRestaurants.length})
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
          <>
            {/* Group Insights */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Group Insights</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>
                {(() => {
                  const totalMembers = collection.collaborators && Array.isArray(collection.collaborators) ? collection.collaborators.length : 0;
                  const participatingMembers = rankedRestaurants.reduce((total, { meta }) => {
                    const uniqueVoters = new Set([
                      ...meta.voteDetails.likeVoters.map(v => v.userId),
                      ...meta.voteDetails.dislikeVoters.map(v => v.userId)
                    ]);
                    return total + uniqueVoters.size;
                  }, 0);
                  return totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;
                })()}%
              </Text>
              <Text style={styles.analyticLabel}>Participation</Text>
            </View>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>
                {(() => {
                  const totalVotes = rankedRestaurants.reduce((total, { meta }) => total + meta.likes + meta.dislikes, 0);
                  const unanimousVotes = rankedRestaurants.filter(({ meta }) => meta.dislikes === 0).length;
                  return totalVotes > 0 ? Math.round((unanimousVotes / rankedRestaurants.length) * 100) : 0;
                })()}%
              </Text>
              <Text style={styles.analyticLabel}>Consensus</Text>
            </View>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>
                {rankedRestaurants.reduce((total, { meta }) => total + meta.likes + meta.dislikes, 0)}
              </Text>
              <Text style={styles.analyticLabel}>Total Votes</Text>
            </View>
          </View>
        </View>

        {/* Group Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            {recommendations.map(rec => (
              <View key={rec.id} style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
                <Text style={styles.recommendationReasoning}>Confidence: {Math.round(rec.confidence * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ranked Restaurants */}
        <View style={styles.restaurantsList}>
          <Text style={styles.sectionTitle}>Ranked Restaurants ({rankedRestaurants.length})</Text>
          {rankedRestaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No restaurants in this collection yet</Text>
            </View>
          ) : (
            rankedRestaurants.map(({ restaurant, meta }, index) => (
              <View key={restaurant?.id || index} style={[
                styles.restaurantItem,
                meta?.rank === 1 && styles.winningRestaurantItem
              ]}>
                <View style={[
                  styles.rankingHeader,
                  meta?.rank === 1 && styles.winningRankingHeader
                ]}>
                  <View style={[
                    styles.rankBadge,
                    meta?.rank === 1 && styles.winningRankBadge
                  ]}>
                    {meta?.rank === 1 && meta?.badge === 'top_choice' && <Crown size={16} color="#FFFFFF" />}
                    {meta?.rank === 2 && <Text style={styles.silverRank}>🥈</Text>}
                    {meta?.rank === 3 && <Text style={styles.bronzeRank}>🥉</Text>}
                    <Text style={[
                      styles.rankNumber,
                      meta?.rank === 1 && styles.winningRankNumber
                    ]}>#{meta?.rank || index + 1}</Text>
                  </View>
                  
                  <View style={styles.badges}>
                    {meta?.rank === 1 && (
                      <View style={[styles.badge, styles.winnerBadge]}>
                        <Crown size={12} color="#FFF" />
                        <Text style={styles.badgeText}>TOP CHOICE</Text>
                      </View>
                    )}
                    {meta?.rank !== 1 && meta.badge === 'group_favorite' && (
                      <View style={[styles.badge, styles.favoritesBadge]}>
                        <Award size={12} color="#FFF" />
                        <Text style={styles.badgeText}>Group Favorite</Text>
                      </View>
                    )}
                    {meta?.rank !== 1 && meta.badge === 'unanimous' && (
                      <View style={[styles.badge, styles.unanimousBadge]}>
                        <Text style={styles.badgeText}>Unanimous</Text>
                      </View>
                    )}
                    {meta?.rank !== 1 && meta.badge === 'debated' && (
                      <View style={[styles.badge, styles.debatedBadge]}>
                        <Text style={styles.badgeText}>Debated</Text>
                      </View>
                    )}
                    {meta.trend === 'up' && <TrendingUp size={16} color="#22C55E" />}
                    {meta.trend === 'down' && <TrendingDown size={16} color="#EF4444" />}
                  </View>
                </View>
                
                <RestaurantCard
                  restaurant={restaurant}
                  onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurant.id } })}
                  compact
                />
                
                <View style={styles.votingSection}>
                  <View style={styles.voteStats}>
                    <Text style={styles.approvalText}>{meta.approvalPercent}% approval</Text>
                    <Text style={styles.voteBreakdown}>{meta.likes} likes • {meta.dislikes} dislikes</Text>
                    {meta.consensus && (
                      <View style={[styles.consensusMeter, getConsensusStyle(meta.consensus)]}>
                        <Text style={styles.consensusText}>{meta.consensus} consensus</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.voteActions}>
                    <TouchableOpacity 
                      style={[styles.voteButton, styles.likeButton]}
                      onPress={() => setShowVoteModal({ restaurantId: restaurant.id, vote: 'like' })}
                    >
                      <ThumbsUp size={16} color="#22C55E" />
                      <Text style={styles.voteButtonText}>{meta.likes}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.voteButton, styles.dislikeButton]}
                      onPress={() => setShowVoteModal({ restaurantId: restaurant.id, vote: 'dislike' })}
                    >
                      <ThumbsDown size={16} color="#EF4444" />
                      <Text style={styles.voteButtonText}>{meta.dislikes}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.voteButton, styles.discussButton]}
                      onPress={() => setShowDiscussionModal(restaurant.id)}
                    >
                      <MessageCircle size={16} color="#6B7280" />
                      <Text style={styles.voteButtonText}>{meta.discussionCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Vote Details */}
                {meta.voteDetails.reasons.length > 0 && (
                  <View style={styles.voteReasons}>
                    <Text style={styles.reasonsTitle}>Common feedback:</Text>
                    {meta.voteDetails.reasons.slice(0, 3).map(reason => (
                      <Text key={reason.category} style={styles.reasonText}>
                        {reason.category}: {reason.examples[0]}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Member Voting Details - Specific to this restaurant */}
                <View style={styles.memberVotingSection}>
                  <Text style={styles.memberVotingTitle}>Member Votes for {restaurant.name}</Text>
                  {(() => {
                    const restaurantVotes: any[] = [];
                    
                    // Only show votes for this specific restaurant
                    meta.voteDetails.likeVoters.forEach(voter => {
                      restaurantVotes.push({
                        type: 'like',
                        userName: voter.name,
                        firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                        reason: voter.reason,
                        timestamp: voter.timestamp
                      });
                    });
                    
                    meta.voteDetails.dislikeVoters.forEach(voter => {
                      restaurantVotes.push({
                        type: 'dislike',
                        userName: voter.name,
                        firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                        reason: voter.reason,
                        timestamp: voter.timestamp
                      });
                    });
                    
                    return restaurantVotes.length > 0 ? (
                      <View style={styles.memberVotesList}>
                        {restaurantVotes.map((vote, index) => (
                          <View key={index} style={styles.memberVoteItem}>
                            <View style={styles.memberVoteHeader}>
                              <View style={styles.memberVoteAvatar}>
                                <Text style={styles.memberVoteInitial}>
                                  {vote.firstName ? vote.firstName.charAt(0).toUpperCase() : '?'}
                                </Text>
                              </View>
                              <View style={styles.memberVoteInfo}>
                                <Text style={styles.memberVoteName}>{vote.firstName}</Text>
                              </View>
                              <View style={[
                                styles.memberVoteBadge,
                                vote.type === 'like' ? styles.likeVoteBadge : styles.dislikeVoteBadge
                              ]}>
                                <Text style={styles.memberVoteBadgeText}>
                                  {vote.type === 'like' ? '👍' : '👎'}
                                </Text>
                              </View>
                            </View>
                            {vote.reason && (
                              <Text style={styles.memberVoteReason}>"{vote.reason}"</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.emptyVotesContainer}>
                        <Text style={styles.noVotesText}>No votes yet for this restaurant</Text>
                        <Text style={styles.noVotesSubtext}>Be the first to vote!</Text>
                      </View>
                    );
                  })()}
                </View>

                {/* Member Comments */}
                <View style={styles.memberCommentsSection}>
                  <Text style={styles.memberCommentsTitle}>Member Comments</Text>
                  {discussions.length > 0 ? (
                    <View style={styles.memberCommentsList}>
                      {discussions.slice(0, 6).map((discussion, index) => (
                        <View key={index} style={styles.memberCommentItem}>
                          <View style={styles.memberCommentHeader}>
                            <View style={styles.memberCommentAvatar}>
                              <Text style={styles.memberCommentInitial}>
                                {discussion.userName ? discussion.userName.split(' ')[0].charAt(0).toUpperCase() : '?'}
                              </Text>
                            </View>
                            <View style={styles.memberCommentInfo}>
                              <Text style={styles.memberCommentName}>
                                {discussion.userName ? discussion.userName.split(' ')[0] : 'Unknown'}
                              </Text>
                              <Text style={styles.memberCommentDetail}>
                                {discussion.restaurantName || 'Collection'} • {discussion.timestamp ? new Date(discussion.timestamp).toLocaleDateString() : 'Unknown date'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.memberCommentText}>{discussion.message}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyVotesContainer}>
                      <Text style={styles.noVotesText}>No comments yet</Text>
                      <Text style={styles.noVotesSubtext}>Members can comment to see activity here</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveRestaurant(restaurant.id, restaurant.name)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Recent Discussions */}
        {discussions.length > 0 && (
          <View style={styles.discussionsSection}>
            <Text style={styles.sectionTitle}>Recent Discussions</Text>
            {discussions.slice(0, 5).map((discussion: any) => (
              <View key={discussion.id} style={styles.discussionItem}>
                <Text style={styles.discussionUser}>{discussion.userName}</Text>
                <Text style={styles.discussionMessage}>{discussion.message}</Text>
                <Text style={styles.discussionTime}>
                  {discussion.timestamp ? new Date(discussion.timestamp).toLocaleDateString() : 'Unknown date'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Enhanced Member Activity - Comprehensive voting insights */}
        <View style={styles.memberActivitySection}>
          <Text style={styles.sectionTitle}>Member Activity & Insights</Text>
          {(() => {
            // Get collection members for privacy filtering
            const collectionMembers = collection.collaborators && Array.isArray(collection.collaborators) 
              ? collection.collaborators.map((member: any) => typeof member === 'string' ? member : member?.userId || member?.id)
              : [];
            
            console.log('[CollectionDetail] Collection members:', collectionMembers);
            console.log('[CollectionDetail] Collection is public:', collection.is_public);
            console.log('[CollectionDetail] Current user:', user?.id);
            console.log('[CollectionDetail] Collection data:', collection);
            console.log('[CollectionDetail] Collection collaborators:', collection.collaborators);
            
            // Collect all member activity across all restaurants
            const allMemberActivity: any[] = [];
            const memberVotingStats: Record<string, { likes: number; dislikes: number; total: number }> = {};
            
            rankedRestaurants.forEach(({ restaurant, meta }) => {
              console.log('[CollectionDetail] Restaurant:', restaurant.name);
              console.log('[CollectionDetail] Like voters:', meta.voteDetails.likeVoters);
              console.log('[CollectionDetail] Dislike voters:', meta.voteDetails.dislikeVoters);
              console.log('[CollectionDetail] Meta vote details structure:', {
                likeVoters: meta.voteDetails.likeVoters.map(v => ({ userId: v.userId, name: v.name })),
                dislikeVoters: meta.voteDetails.dislikeVoters.map(v => ({ userId: v.userId, name: v.name }))
              });
              
              // Add votes - show all activity for public collections, only members for private
              meta.voteDetails.likeVoters.forEach(voter => {
                // For private collections, only show activity from actual members
                if (!collection.is_public && !collectionMembers.includes(voter.userId)) {
                  console.log('[CollectionDetail] Filtering out non-member like voter:', voter.userId);
                  return;
                }
                
                // Track member voting stats
                if (!memberVotingStats[voter.userId]) {
                  memberVotingStats[voter.userId] = { likes: 0, dislikes: 0, total: 0 };
                }
                memberVotingStats[voter.userId].likes++;
                memberVotingStats[voter.userId].total++;
                
                allMemberActivity.push({
                  type: 'vote',
                  vote: 'like',
                  restaurantName: restaurant.name,
                  userName: voter.name,
                  firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                  userId: voter.userId,
                  reason: voter.reason,
                  timestamp: voter.timestamp,
                  restaurantId: restaurant.id
                });
              });
              
              meta.voteDetails.dislikeVoters.forEach(voter => {
                // For private collections, only show activity from actual members
                if (!collection.is_public && !collectionMembers.includes(voter.userId)) {
                  console.log('[CollectionDetail] Filtering out non-member dislike voter:', voter.userId);
                  return;
                }
                
                // Track member voting stats
                if (!memberVotingStats[voter.userId]) {
                  memberVotingStats[voter.userId] = { likes: 0, dislikes: 0, total: 0 };
                }
                memberVotingStats[voter.userId].dislikes++;
                memberVotingStats[voter.userId].total++;
                
                allMemberActivity.push({
                  type: 'vote',
                  vote: 'dislike',
                  restaurantName: restaurant.name,
                  userName: voter.name,
                  firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                  userId: voter.userId,
                  reason: voter.reason,
                  timestamp: voter.timestamp,
                  restaurantId: restaurant.id
                });
              });
            });
            
            console.log('[CollectionDetail] Discussions:', discussions);
            
            // Add discussions - show all activity for public collections, only members for private
            discussions.forEach(discussion => {
              console.log('[CollectionDetail] Processing discussion:', discussion);
              // For private collections, only show activity from actual members
              if (!collection.is_public && !collectionMembers.includes(discussion.userId)) {
                console.log('[CollectionDetail] Filtering out non-member discussion:', discussion.userId);
                return;
              }
              allMemberActivity.push({
                type: 'comment',
                restaurantName: discussion.restaurantName || 'Collection',
                userName: discussion.userName,
                firstName: discussion.userName ? discussion.userName.split(' ')[0] : 'Unknown',
                userId: discussion.userId,
                message: discussion.message,
                timestamp: discussion.timestamp
              });
            });
            
            console.log('[CollectionDetail] All member activity:', allMemberActivity);
            console.log('[CollectionDetail] Member voting stats:', memberVotingStats);
            
            // Sort by timestamp (most recent first)
            allMemberActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            return allMemberActivity.length > 0 ? (
              <View style={styles.memberActivityList}>
                {/* Member Voting Insights */}
                <View style={styles.insightsSection}>
                  <Text style={styles.insightsTitle}>📊 Member Voting Insights</Text>
                  <View style={styles.insightsGrid}>
                    {Object.entries(memberVotingStats)
                      .filter(([userId, stats]) => stats.total > 0)
                      .sort(([,a], [,b]) => b.total - a.total)
                      .slice(0, 6)
                      .map(([userId, stats]) => {
                        const member = collection.collaborators?.find((m: any) => {
                          if (typeof m === 'string') return m === userId;
                          return m.userId === userId;
                        });
                        const memberName = typeof member === 'string' ? 'Unknown' : member?.name || 'Unknown';
                        const firstName = memberName.split(' ')[0];
                        const likePercentage = stats.total > 0 ? Math.round((stats.likes / stats.total) * 100) : 0;
                        
                        return (
                          <View key={userId} style={styles.memberInsight}>
                            <View style={styles.memberInsightHeader}>
                              <View style={styles.memberInsightAvatar}>
                                <Text style={styles.memberInsightInitial}>
                                  {firstName.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <Text style={styles.memberInsightName}>{firstName}</Text>
                            </View>
                            <View style={styles.memberInsightStats}>
                              <Text style={styles.memberInsightVotes}>{stats.total} votes</Text>
                              <Text style={styles.memberInsightPercentage}>{likePercentage}% likes</Text>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </View>
                

                
                {/* Restaurant Voting Summary */}
                <View style={styles.restaurantVotingSection}>
                  <Text style={styles.restaurantVotingTitle}>🏆 Restaurant Voting Summary</Text>
                  {rankedRestaurants
                    .filter(({ meta }) => meta.likes > 0 || meta.dislikes > 0)
                    .slice(0, 5)
                    .map(({ restaurant, meta }, index) => (
                      <View key={restaurant.id} style={styles.restaurantVotingItem}>
                        <View style={styles.restaurantVotingHeader}>
                          <Text style={styles.restaurantVotingName}>{restaurant.name}</Text>
                          <View style={styles.restaurantVotingBadge}>
                            <Text style={styles.restaurantVotingRank}>#{meta.rank}</Text>
                          </View>
                        </View>
                        <View style={styles.restaurantVotingStats}>
                          <View style={styles.voteStat}>
                            <Text style={styles.voteStatLabel}>👍 Likes</Text>
                            <Text style={styles.voteStatValue}>{meta.likes}</Text>
                          </View>
                          <View style={styles.voteStat}>
                            <Text style={styles.voteStatLabel}>👎 Dislikes</Text>
                            <Text style={styles.voteStatValue}>{meta.dislikes}</Text>
                          </View>
                          <View style={styles.voteStat}>
                            <Text style={styles.voteStatLabel}>📊 Approval</Text>
                            <Text style={styles.voteStatValue}>{meta.approvalPercent}%</Text>
                          </View>
                        </View>
                        {meta.voteDetails.likeVoters.length > 0 && (
                          <Text style={styles.restaurantVotingVoters}>
                            Liked by: {meta.voteDetails.likeVoters.map(v => v.name).join(', ')}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Text style={styles.emptyActivityText}>
                  {collection.is_public ? 'No member activity yet' : 'No collection member activity yet'}
                </Text>
                <Text style={styles.emptyActivitySubtext}>
                  {collection.is_public 
                    ? 'Start voting and commenting to see activity here!' 
                    : 'Collection members can vote and comment to see activity here!'}
                </Text>
              </View>
            );
          })()}
        </View>
          </>
        ) : (
          <>
            {/* Insights Tab Content */}
            <View style={styles.insightsContainer}>
              {/* Group Insights */}
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionTitle}>Group Insights</Text>
                <View style={styles.analyticsGrid}>
                  <View style={styles.analyticCard}>
                    <Text style={styles.analyticValue}>
                      {(() => {
                        const totalMembers = collection.collaborators && Array.isArray(collection.collaborators) ? collection.collaborators.length : 0;
                        const participatingMembers = rankedRestaurants.reduce((total, { meta }) => {
                          const uniqueVoters = new Set([
                            ...meta.voteDetails.likeVoters.map(v => v.userId),
                            ...meta.voteDetails.dislikeVoters.map(v => v.userId)
                          ]);
                          return total + uniqueVoters.size;
                        }, 0);
                        return totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;
                      })()}%
                    </Text>
                    <Text style={styles.analyticLabel}>Participation</Text>
                  </View>
                  <View style={styles.analyticCard}>
                    <Text style={styles.analyticValue}>
                      {(() => {
                        const totalVotes = rankedRestaurants.reduce((total, { meta }) => total + meta.likes + meta.dislikes, 0);
                        const unanimousVotes = rankedRestaurants.filter(({ meta }) => meta.dislikes === 0).length;
                        return totalVotes > 0 ? Math.round((unanimousVotes / rankedRestaurants.length) * 100) : 0;
                      })()}%
                    </Text>
                    <Text style={styles.analyticLabel}>Consensus</Text>
                  </View>
                  <View style={styles.analyticCard}>
                    <Text style={styles.analyticValue}>
                      {rankedRestaurants.reduce((total, { meta }) => total + meta.likes + meta.dislikes, 0)}
                    </Text>
                    <Text style={styles.analyticLabel}>Total Votes</Text>
                  </View>
                </View>
              </View>

              {/* Member Voting Insights */}
              <View style={styles.memberActivitySection}>
                <Text style={styles.sectionTitle}>Member Activity & Insights</Text>
                {(() => {
                  // Get collection members for privacy filtering
                  const collectionMembers = collection.collaborators && Array.isArray(collection.collaborators) 
                    ? collection.collaborators.map((member: any) => typeof member === 'string' ? member : member?.userId || member?.id)
                    : [];
                  
                  // Collect all member activity across all restaurants
                  const allMemberActivity: any[] = [];
                  const memberVotingStats: Record<string, { likes: number; dislikes: number; total: number }> = {};
                  
                  rankedRestaurants.forEach(({ restaurant, meta }) => {
                                      // Add votes - only from collection members if private
                  meta.voteDetails.likeVoters.forEach(voter => {
                    // For private collections, only show activity from actual members
                    if (!collection.is_public && !collectionMembers.includes(voter.userId)) {
                      return;
                    }
                    
                    // Suppress content for unknown members in shared collections
                    if (collection.is_public && (!voter.name || voter.name === 'Unknown' || voter.name === 'Unknown User')) {
                      return;
                    }
                    
                    // Track member voting stats
                    if (!memberVotingStats[voter.userId]) {
                      memberVotingStats[voter.userId] = { likes: 0, dislikes: 0, total: 0 };
                    }
                    memberVotingStats[voter.userId].likes++;
                    memberVotingStats[voter.userId].total++;
                    
                    allMemberActivity.push({
                      type: 'vote',
                      vote: 'like',
                      restaurantName: restaurant.name,
                      userName: voter.name,
                      firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                      userId: voter.userId,
                      reason: voter.reason,
                      timestamp: voter.timestamp
                    });
                  });
                    
                    meta.voteDetails.dislikeVoters.forEach(voter => {
                      // For private collections, only show activity from actual members
                      if (!collection.is_public && !collectionMembers.includes(voter.userId)) {
                        return;
                      }
                      
                      // Suppress content for unknown members in shared collections
                      if (collection.is_public && (!voter.name || voter.name === 'Unknown' || voter.name === 'Unknown User')) {
                        return;
                      }
                      
                      // Track member voting stats
                      if (!memberVotingStats[voter.userId]) {
                        memberVotingStats[voter.userId] = { likes: 0, dislikes: 0, total: 0 };
                      }
                      memberVotingStats[voter.userId].dislikes++;
                      memberVotingStats[voter.userId].total++;
                      
                      allMemberActivity.push({
                        type: 'vote',
                        vote: 'dislike',
                        restaurantName: restaurant.name,
                        userName: voter.name,
                        firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                        userId: voter.userId,
                        reason: voter.reason,
                        timestamp: voter.timestamp
                      });
                    });
                  });
                  
                  // Add discussions - only from collection members if private
                  discussions.forEach(discussion => {
                    // For private collections, only show activity from actual members
                    if (!collection.is_public && !collectionMembers.includes(discussion.userId)) {
                      return;
                    }
                    
                    // Suppress content for unknown members in shared collections
                    if (collection.is_public && (!discussion.userName || discussion.userName === 'Unknown' || discussion.userName === 'Unknown User')) {
                      return;
                    }
                    
                    allMemberActivity.push({
                      type: 'comment',
                      restaurantName: discussion.restaurantName || 'Collection',
                      userName: discussion.userName,
                      firstName: discussion.userName ? discussion.userName.split(' ')[0] : 'Unknown',
                      userId: discussion.userId,
                      message: discussion.message,
                      timestamp: discussion.timestamp
                    });
                  });
                  
                  // Sort by timestamp (most recent first)
                  allMemberActivity.sort((a, b) => {
                    const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                    const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                    return timestampB.getTime() - timestampA.getTime();
                  });
                  
                  return allMemberActivity.length > 0 ? (
                    <View style={styles.insightsContent}>
                      {/* Member Voting Insights */}
                      <View style={styles.insightsSection}>
                        <Text style={styles.insightsTitle}>Member Voting Insights</Text>
                        <View style={styles.insightsGrid}>
                          {Object.entries(memberVotingStats)
                            .filter(([userId, stats]) => stats.total > 0)
                            .filter(([userId, stats]) => {
                              // Suppress unknown members in shared collections
                              if (collection.is_public) {
                                const member = collection.collaborators?.find((m: any) => 
                                  typeof m === 'string' ? m === userId : m.userId === userId
                                );
                                const memberName = typeof member === 'string' ? 'Unknown' : member?.name || 'Unknown';
                                return memberName && memberName !== 'Unknown' && memberName !== 'Unknown User';
                              }
                              return true;
                            })
                            .slice(0, 6)
                            .map(([userId, stats]) => {
                              const member = collection.collaborators?.find((m: any) => 
                                typeof m === 'string' ? m === userId : m.userId === userId
                              );
                              const memberName = typeof member === 'string' ? 'Unknown' : member?.name || 'Unknown';
                              const firstName = memberName ? memberName.split(' ')[0] : 'Unknown';
                              const percentage = Math.round((stats.likes / stats.total) * 100);
                              
                              return (
                                <View key={userId} style={styles.memberInsight}>
                                  <View style={styles.memberInsightHeader}>
                                    <View style={styles.memberInsightAvatar}>
                                      <Text style={styles.memberInsightInitial}>
                                        {firstName ? firstName.charAt(0).toUpperCase() : '?'}
                                      </Text>
                                    </View>
                                    <View style={styles.memberInsightName}>{firstName}</View>
                                  </View>
                                  <View style={styles.memberInsightStats}>
                                    <Text style={styles.memberInsightVotes}>
                                      {stats.total} votes • {percentage}% positive
                                    </Text>
                                    <Text style={styles.memberInsightPercentage}>
                                      👍 {stats.likes} • 👎 {stats.dislikes}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                        </View>
                      </View>

                      {/* Restaurant Voting Summary */}
                      <View style={styles.restaurantVotingSection}>
                        <Text style={styles.restaurantVotingTitle}>🏆 Restaurant Voting Summary</Text>
                        {rankedRestaurants
                          .filter(({ meta }) => meta.likes > 0 || meta.dislikes > 0)
                          .slice(0, 5)
                          .map(({ restaurant, meta }, index) => (
                            <View key={restaurant.id} style={styles.restaurantVotingItem}>
                              <View style={styles.restaurantVotingHeader}>
                                <Text style={styles.restaurantVotingName}>{restaurant.name}</Text>
                                <View style={styles.restaurantVotingBadge}>
                                  <Text style={styles.restaurantVotingRank}>#{meta.rank}</Text>
                                </View>
                              </View>
                              <View style={styles.restaurantVotingStats}>
                                <View style={styles.voteStat}>
                                  <Text style={styles.voteStatLabel}>👍 Likes</Text>
                                  <Text style={styles.voteStatValue}>{meta.likes}</Text>
                                </View>
                                <View style={styles.voteStat}>
                                  <Text style={styles.voteStatLabel}>👎 Dislikes</Text>
                                  <Text style={styles.voteStatValue}>{meta.dislikes}</Text>
                                </View>
                                <View style={styles.voteStat}>
                                  <Text style={styles.voteStatLabel}>📊 Approval</Text>
                                  <Text style={styles.voteStatValue}>{meta.approvalPercent}%</Text>
                                </View>
                              </View>
                              {meta.voteDetails.likeVoters.length > 0 && (
                                <Text style={styles.restaurantVotingVoters}>
                                  Liked by: {meta.voteDetails.likeVoters.map(v => v.name).join(', ')}
                                </Text>
                              )}
                            </View>
                          ))}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyActivityContainer}>
                      <Text style={styles.emptyActivityText}>
                        {collection.is_public ? 'No member activity yet' : 'No collection member activity yet'}
                      </Text>
                      <Text style={styles.emptyActivitySubtext}>
                        {collection.is_public 
                          ? 'Start voting and commenting to see activity here!' 
                          : 'Collection members can vote and comment to see activity here!'}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </View>
          </>
        )}

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
                value={voteReason}
                onChangeText={setVoteReason}
                multiline
                numberOfLines={3}
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
                  <Text style={styles.modalButtonText}>Submit Vote</Text>
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
              <Text style={styles.modalTitle}>Start a Discussion</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="What would you like to discuss about this restaurant?"
                value={discussionMessage}
                onChangeText={setDiscussionMessage}
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    if (showDiscussionModal && discussionMessage.trim()) {
                      addDiscussion(showDiscussionModal, id, discussionMessage);
                    }
                    setShowDiscussionModal(null);
                    setDiscussionMessage('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Post Discussion</Text>
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
                value={inviteMessage}
                onChangeText={setInviteMessage}
                multiline
                numberOfLines={3}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={handleInviteUser}
                >
                  <Text style={styles.modalButtonText}>Send Invitation</Text>
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



        <View style={{ height: 32 }} />
      </ScrollView>
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
  restaurantsList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
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
    marginBottom: 24,
  },
  winningRestaurantItem: {
    backgroundColor: '#FEF7E0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  analyticsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticCard: {
    alignItems: 'center',
  },
  analyticValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  analyticLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  recommendationsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationCard: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  recommendationReasoning: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  silverRank: {
    fontSize: 16,
  },
  bronzeRank: {
    fontSize: 16,
  },
  winningRankingHeader: {
    marginBottom: 12,
  },
  winningRankBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  winningRankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  favoritesBadge: {
    backgroundColor: '#10B981',
  },
  unanimousBadge: {
    backgroundColor: '#3B82F6',
  },
  debatedBadge: {
    backgroundColor: '#F59E0B',
  },
  winnerBadge: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  votingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  voteStats: {
    flex: 1,
  },
  approvalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  voteBreakdown: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  consensusMeter: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  consensusStrong: {
    backgroundColor: '#D1FAE5',
  },
  consensusModerate: {
    backgroundColor: '#FEF3C7',
  },
  consensusMixed: {
    backgroundColor: '#FED7AA',
  },
  consensusLow: {
    backgroundColor: '#FEE2E2',
  },
  consensusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  voteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  likeButton: {
    backgroundColor: '#F0FDF4',
  },
  dislikeButton: {
    backgroundColor: '#FEF2F2',
  },
  discussButton: {
    backgroundColor: '#F9FAFB',
  },
  voteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  voteReasons: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  discussionsSection: {
    padding: 16,
  },
  discussionItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  discussionUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  discussionMessage: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  discussionTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlignVertical: 'top',
    marginBottom: 16,
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

  // Detailed voting styles
  detailedVotingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailedVotingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  voteBreakdownSection: {
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  userVoteItem: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  userVoteName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userVoteDetails: {
    marginLeft: 8,
  },
  voteDetail: {
    marginBottom: 4,
  },
  voteType: {
    fontSize: 11,
    fontWeight: '500',
  },
  likeVote: {
    color: '#22C55E',
  },
  dislikeVote: {
    color: '#EF4444',
  },
  voteReason: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  commentsSection: {
    marginTop: 8,
  },
  userCommentItem: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  userCommentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userCommentDetails: {
    marginLeft: 8,
  },
  commentDetail: {
    marginBottom: 4,
  },
  commentText: {
    fontSize: 11,
    color: '#374151',
    fontStyle: 'italic',
  },
  commentTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Member voting styles
  memberVotingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  memberVotingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  memberVotesList: {
    gap: 8,
  },
  memberVoteItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberVoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberVoteAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberVoteInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberVoteName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  memberVoteInfo: {
    flex: 1,
  },
  memberVoteRestaurant: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  memberVoteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  likeVoteBadge: {
    backgroundColor: '#D1FAE5',
  },
  dislikeVoteBadge: {
    backgroundColor: '#FEE2E2',
  },
  memberVoteBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberVoteReason: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginLeft: 32,
  },
  noVotesText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 12,
  },

  // Member comments styles
  memberCommentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  memberCommentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  memberCommentsList: {
    gap: 8,
  },
  memberCommentItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberCommentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberCommentInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberCommentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  memberCommentInfo: {
    flex: 1,
  },
  memberCommentDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  memberCommentText: {
    fontSize: 12,
    color: '#374151',
    fontStyle: 'italic',
  },
  memberCommentTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Member activity styles
  memberActivitySection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  memberActivityList: {
    marginTop: 16,
  },
  memberActivityItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberActivityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberActivityInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberActivityInfo: {
    flex: 1,
  },
  memberActivityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  memberActivityAction: {
    fontSize: 12,
    color: '#6B7280',
  },
  memberActivityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  memberActivityContent: {
    fontSize: 12,
    color: '#374151',
    fontStyle: 'italic',
    marginLeft: 44,
  },
  emptyActivityContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyVotesContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noVotesSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Enhanced Member Activity styles
  insightsSection: {
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
  memberInsight: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    width: '45%', // Adjust as needed for two columns
    alignItems: 'center',
  },
  memberInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberInsightAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberInsightInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInsightName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  memberInsightStats: {
    alignItems: 'center',
  },
  memberInsightVotes: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberInsightPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  recentActivitySection: {
    marginBottom: 20,
  },
  recentActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  restaurantVotingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  restaurantVotingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  restaurantVotingItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  restaurantVotingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantVotingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 10,
  },
  restaurantVotingBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restaurantVotingRank: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restaurantVotingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  voteStat: {
    alignItems: 'center',
  },
  voteStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  voteStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  restaurantVotingVoters: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  insightsContainer: {
    padding: 20,
  },
  insightsContent: {
    gap: 20,
  },
  insightsGrid: {
    gap: 12,
  },
});