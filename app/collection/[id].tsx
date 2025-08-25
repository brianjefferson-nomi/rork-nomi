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

  // Add test votes for debugging
  const addTestVotes = () => {
    if (rankedRestaurants.length > 0) {
      const testRestaurant = rankedRestaurants[0].restaurant;
      voteRestaurant(testRestaurant.id, 'like', id, 'Great food and atmosphere!');
      if (rankedRestaurants.length > 1) {
        const testRestaurant2 = rankedRestaurants[1].restaurant;
        voteRestaurant(testRestaurant2.id, 'dislike', id, 'Too expensive for the quality');
      }
      Alert.alert('Test Votes Added', 'Added test votes to first two restaurants');
    }
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
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={addTestVotes}
                >
                  <Text style={styles.shareButtonText}>Add Test Votes</Text>
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

        {/* Contributor Statistics */}
        <View style={styles.contributorStatsSection}>
          <Text style={styles.sectionTitle}>Member Contributions</Text>
          <View style={styles.contributorStatsList}>
            {collection.collaborators && Array.isArray(collection.collaborators) ? (
              collection.collaborators.map((member: any, index: number) => {
                const memberId = typeof member === 'string' ? member : member?.userId || `member-${index}`;
                const memberName = typeof member === 'string' ? member : member?.name || `Member ${index + 1}`;
                
                // Calculate member's contribution statistics
                const memberVotes = rankedRestaurants.flatMap(({ meta }) => [
                  ...meta.voteDetails.likeVoters.filter(v => v.userId === memberId),
                  ...meta.voteDetails.dislikeVoters.filter(v => v.userId === memberId)
                ]);
                
                const memberDiscussions = discussions.filter(d => d.userId === memberId);
                const totalVotes = memberVotes.length;
                const totalDiscussions = memberDiscussions.length;
                const likes = memberVotes.filter(v => v.reason?.includes('like')).length;
                const dislikes = memberVotes.filter(v => v.reason?.includes('dislike')).length;
                
                // Calculate contribution rate
                const totalPossibleVotes = rankedRestaurants.length;
                const contributionRate = totalPossibleVotes > 0 ? (totalVotes / totalPossibleVotes) * 100 : 0;
                
                return (
                  <View key={memberId} style={styles.contributorCard}>
                    <View style={styles.contributorHeader}>
                      <View style={styles.contributorAvatar}>
                        <Text style={styles.contributorInitial}>
                          {memberName && typeof memberName === 'string' && memberName.length > 0 ? memberName.charAt(0).toUpperCase() : '?'}
                        </Text>
                      </View>
                      <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{memberName}</Text>
                        <Text style={styles.contributorStats}>
                          {contributionRate.toFixed(0)}% participation • {totalVotes} votes • {totalDiscussions} discussions
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.contributorDetails}>
                      <View style={styles.voteBreakdownRow}>
                        <View style={styles.voteStat}>
                          <ThumbsUp size={14} color="#22C55E" />
                          <Text style={styles.voteStatText}>{likes} likes</Text>
                        </View>
                        <View style={styles.voteStat}>
                          <ThumbsDown size={14} color="#EF4444" />
                          <Text style={styles.voteStatText}>{dislikes} dislikes</Text>
                        </View>
                        <View style={styles.voteStat}>
                          <MessageCircle size={14} color="#6B7280" />
                          <Text style={styles.voteStatText}>{totalDiscussions} comments</Text>
                        </View>
                      </View>
                      
                      <View style={styles.contributionBar}>
                        <View 
                          style={[
                            styles.contributionFill, 
                            { width: `${Math.min(contributionRate, 100)}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContributors}>
                <Text style={styles.emptyContributorsText}>No member contributions yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Group Analytics */}
        {collection?.analytics && collection.analytics.participationRate !== undefined && (
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Group Insights</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticCard}>
                <Text style={styles.analyticValue}>
                  {collection.analytics.participationRate ? Math.round(collection.analytics.participationRate * 100) : 0}%
                </Text>
                <Text style={styles.analyticLabel}>Participation</Text>
              </View>
              <View style={styles.analyticCard}>
                <Text style={styles.analyticValue}>
                  {collection.analytics.consensusScore ? Math.round(collection.analytics.consensusScore * 100) : 0}%
                </Text>
                <Text style={styles.analyticLabel}>Consensus</Text>
              </View>
              <View style={styles.analyticCard}>
                <Text style={styles.analyticValue}>
                  {collection.analytics.totalVotes || 0}
                </Text>
                <Text style={styles.analyticLabel}>Total Votes</Text>
              </View>
            </View>
          </View>
        )}

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
                    {meta?.rank === 1 && meta?.badge === 'top_choice' && <Crown size={20} color="#FFD700" />}
                    {meta?.rank === 2 && <Text style={styles.silverRank}>🥈</Text>}
                    {meta?.rank === 3 && <Text style={styles.bronzeRank}>🥉</Text>}
                    <Text style={[
                      styles.rankNumber,
                      meta?.rank === 1 && styles.winningRankNumber
                    ]}>#{meta?.rank || index + 1}</Text>
                  </View>
                  
                  <View style={styles.badges}>
                    {meta.badge === 'group_favorite' && (
                      <View style={[styles.badge, styles.favoritesBadge]}>
                        <Award size={12} color="#FFF" />
                        <Text style={styles.badgeText}>Group Favorite</Text>
                      </View>
                    )}
                    {meta.badge === 'unanimous' && (
                      <View style={[styles.badge, styles.unanimousBadge]}>
                        <Text style={styles.badgeText}>Unanimous</Text>
                      </View>
                    )}
                    {meta.badge === 'debated' && (
                      <View style={[styles.badge, styles.debatedBadge]}>
                        <Text style={styles.badgeText}>Debated</Text>
                      </View>
                    )}
                    {meta.trend === 'up' && <TrendingUp size={16} color="#22C55E" />}
                    {meta.trend === 'down' && <TrendingDown size={16} color="#EF4444" />}
                    {meta?.rank === 1 && (
                      <View style={[styles.badge, styles.winnerBadge]}>
                        <Crown size={12} color="#FFF" />
                        <Text style={styles.badgeText}>WINNER</Text>
                      </View>
                    )}
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

                {/* Detailed Voting Information */}
                <View style={styles.detailedVotingSection}>
                  <Text style={styles.detailedVotingTitle}>Voting Details</Text>
                  
                  {/* Vote Breakdown by User */}
                  <View style={styles.voteBreakdownSection}>
                    <Text style={styles.breakdownTitle}>Votes by Member:</Text>
                    {(() => {
                      const votingDetails = getRestaurantVotingDetails(restaurant.id, id);
                      return votingDetails.voteBreakdown.map((userVote: any, idx: number) => (
                        <View key={idx} style={styles.userVoteItem}>
                          <Text style={styles.userVoteName}>{userVote.userName}</Text>
                          <View style={styles.userVoteDetails}>
                            {userVote.votes.map((vote: any, voteIdx: number) => (
                              <View key={voteIdx} style={styles.voteDetail}>
                                <Text style={[
                                  styles.voteType, 
                                  vote.vote === 'like' ? styles.likeVote : styles.dislikeVote
                                ]}>
                                  {vote.vote === 'like' ? '👍' : '👎'} {vote.vote}
                                </Text>
                                {vote.reason && (
                                  <Text style={styles.voteReason}>"{vote.reason}"</Text>
                                )}
                              </View>
                            ))}
                          </View>
                        </View>
                      ));
                    })()}
                  </View>

                  {/* Comments by User */}
                  <View style={styles.commentsSection}>
                    <Text style={styles.breakdownTitle}>Comments by Member:</Text>
                    {(() => {
                      const votingDetails = getRestaurantVotingDetails(restaurant.id, id);
                      return votingDetails.discussionBreakdown.map((userComment: any, idx: number) => (
                        <View key={idx} style={styles.userCommentItem}>
                          <Text style={styles.userCommentName}>{userComment.userName}</Text>
                          <View style={styles.userCommentDetails}>
                            {userComment.comments.map((comment: any, commentIdx: number) => (
                              <View key={commentIdx} style={styles.commentDetail}>
                                <Text style={styles.commentText}>"{comment.message}"</Text>
                                <Text style={styles.commentTime}>
                                  {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : 'Unknown date'}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ));
                    })()}
                  </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  winningRestaurantItem: {
    backgroundColor: '#FEF7E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    marginTop: 16,
  },
  collaboratorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    gap: 4,
  },
  rankNumber: {
    fontSize: 16,
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
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  winningRankNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#B45309',
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
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#B45309',
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
  contributorStatsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contributorStatsList: {
    marginTop: 12,
  },
  contributorCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contributorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contributorInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  contributorStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  contributorDetails: {
    marginTop: 8,
  },
  voteBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  voteStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  contributionBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  contributionFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  emptyContributors: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContributorsText: {
    fontSize: 14,
    color: '#999',
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
});