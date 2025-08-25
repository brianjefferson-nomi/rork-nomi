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

// Separate component for Insights Tab to reduce JSX nesting complexity
interface InsightsTabProps {
  collection: any;
  rankedRestaurants: any[];
  discussions: any[];
  collectionMembers: string[];
  styles: any;
}

function InsightsTab({ collection, rankedRestaurants, discussions, collectionMembers, styles }: InsightsTabProps) {
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
                const participatingMembers = rankedRestaurants.reduce((total, { meta }) => {
                  const uniqueVoters = new Set([
                    ...meta.voteDetails.likeVoters.map((v, index) => `${v.userId}-${index}`),
                    ...meta.voteDetails.dislikeVoters.map((v, index) => `${v.userId}-${index}`)
                  ]);
                  return total + uniqueVoters.size;
                }, 0);
                return totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;
              })()}%
            </Text>
            <Text style={styles.analyticLabel}>Participation Rate</Text>
          </View>
          
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {rankedRestaurants.reduce((total, { meta }) => {
                return total + meta.voteDetails.likeVoters.length + meta.voteDetails.dislikeVoters.length;
              }, 0)}
            </Text>
            <Text style={styles.analyticLabel}>Total Votes</Text>
          </View>
          
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {(() => {
                const totalVotes = rankedRestaurants.reduce((total, { meta }) => {
                  return total + meta.voteDetails.likeVoters.length + meta.voteDetails.dislikeVoters.length;
                }, 0);
                const likeVotes = rankedRestaurants.reduce((total, { meta }) => {
                  return total + meta.voteDetails.likeVoters.length;
                }, 0);
                return totalVotes > 0 ? Math.round((likeVotes / totalVotes) * 100) : 0;
              })()}%
            </Text>
            <Text style={styles.analyticLabel}>Positive Sentiment</Text>
          </View>
          
          <View style={styles.analyticCard}>
            <Text style={styles.analyticValue}>
              {discussions.length}
            </Text>
            <Text style={styles.analyticLabel}>Discussions</Text>
          </View>
        </View>
      </View>

      {/* Voting Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>📊 Voting Insights</Text>
        <View style={styles.insightsGrid}>
          {rankedRestaurants.slice(0, 6).map((restaurant, index) => (
            <View key={restaurant.id} style={styles.insightsContent}>
              <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
              
              {/* Member Voting Details */}
              {(() => {
                const restaurantVotes = rankedRestaurants.find(r => r.id === restaurant.id);
                if (!restaurantVotes?.meta?.voteDetails) return <></>;

                const filteredLikeVoters = restaurantVotes.meta.voteDetails.likeVoters.filter((voter: any) => {
                  if (collection.is_public && !collectionMembers.includes(voter.userId)) {
                    return false;
                  }
                  return voter.name && voter.name !== 'Unknown' && voter.name !== 'Unknown User';
                });

                const filteredDislikeVoters = restaurantVotes.meta.voteDetails.dislikeVoters.filter((voter: any) => {
                  if (collection.is_public && !collectionMembers.includes(voter.userId)) {
                    return false;
                  }
                  return voter.name && voter.name !== 'Unknown' && voter.name !== 'Unknown User';
                });

                return (
                  <View style={styles.votingDetails}>
                    {filteredLikeVoters.length > 0 && (
                      <View style={styles.voteGroup}>
                        <View style={styles.voteHeader}>
                          <ThumbsUp size={12} color="#10B981" />
                          <Text style={styles.voteLabel}>Likes</Text>
                        </View>
                        <Text style={styles.voterNames}>
                          {filteredLikeVoters.length > 0 ? filteredLikeVoters.map((v: any, index: number) => v.name?.split(' ')[0] || 'Unknown').join(', ') : 'None'}
                        </Text>
                      </View>
                    )}
                    {filteredDislikeVoters.length > 0 && (
                      <View style={styles.voteGroup}>
                        <View style={styles.voteHeader}>
                          <ThumbsDown size={12} color="#EF4444" />
                          <Text style={styles.voteLabel}>Dislikes</Text>
                        </View>
                        <Text style={styles.voterNames}>
                          {filteredDislikeVoters.length > 0 ? filteredDislikeVoters.map((v: any, index: number) => v.name?.split(' ')[0] || 'Unknown').join(', ') : 'None'}
                        </Text>
                      </View>
                    )}
                    {filteredLikeVoters.length === 0 && filteredDislikeVoters.length === 0 && (
                      <Text style={styles.noVotes}>No votes yet</Text>
                    )}
                  </View>
                );
              })()}

              {/* Member Comments */}
              {(() => {
                const filteredDiscussions = discussions.filter((discussion: any) => {
                  if (discussion.restaurantId !== restaurant.id) return false;
                  if (collection.is_public && !collectionMembers.includes(discussion.userId)) {
                    return false;
                  }
                  return discussion.userName && discussion.userName !== 'Unknown' && discussion.userName !== 'Unknown User';
                });

                if (filteredDiscussions.length === 0) return <></>;

                return (
                  <View style={styles.commentsSection}>
                    <View style={styles.commentsHeader}>
                      <MessageCircle size={12} color="#6B7280" />
                      <Text style={styles.commentsLabel}>Comments</Text>
                    </View>
                    {filteredDiscussions.slice(0, 2).map((discussion: any) => (
                      <View key={discussion.id} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>{discussion.userName?.split(' ')[0] || 'Unknown'}</Text>
                        <Text style={styles.commentText} numberOfLines={2}>{discussion.message}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>
          ))}
        </View>
      </View>

      {/* Member Activity & Insights */}
      <View style={styles.memberActivitySection}>
        <Text style={styles.sectionTitle}>🎯 Member Activity & Insights</Text>
        {(() => {
          const memberVotingStats: { [key: string]: { likes: number; dislikes: number; comments: number; name: string } } = {};
          
          rankedRestaurants.forEach(({ meta }) => {
            meta.voteDetails.likeVoters.forEach((voter: any) => {
              if (collection.is_public && !collectionMembers.includes(voter.userId)) return;
              if (!voter.name || voter.name === 'Unknown' || voter.name === 'Unknown User') return;
              
              if (!memberVotingStats[voter.userId]) {
                memberVotingStats[voter.userId] = { likes: 0, dislikes: 0, comments: 0, name: voter.name };
              }
              memberVotingStats[voter.userId].likes++;
            });
            
            meta.voteDetails.dislikeVoters.forEach((voter: any) => {
              if (collection.is_public && !collectionMembers.includes(voter.userId)) return;
              if (!voter.name || voter.name === 'Unknown' || voter.name === 'Unknown User') return;
              
              if (!memberVotingStats[voter.userId]) {
                memberVotingStats[voter.userId] = { likes: 0, dislikes: 0, comments: 0, name: voter.name };
              }
              memberVotingStats[voter.userId].dislikes++;
            });
          });

          discussions.forEach((discussion: any) => {
            if (collection.is_public && !collectionMembers.includes(discussion.userId)) return;
            if (!discussion.userName || discussion.userName === 'Unknown' || discussion.userName === 'Unknown User') return;
            
            if (!memberVotingStats[discussion.userId]) {
              memberVotingStats[discussion.userId] = { likes: 0, dislikes: 0, comments: 0, name: discussion.userName };
            }
            memberVotingStats[discussion.userId].comments++;
          });

          return (
            <View style={styles.memberStatsGrid}>
              {Object.entries(memberVotingStats).map(([userId, stats]) => {
                const firstName = stats.name?.split(' ')[0] || 'Unknown';
                
                return (
                  <View key={userId} style={styles.memberStatCard}>
                    <Text style={styles.memberName}>{firstName}</Text>
                    <View style={styles.memberStats}>
                      <View style={styles.statItem}>
                        <ThumbsUp size={14} color="#10B981" />
                        <Text style={styles.statValue}>{stats.likes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <ThumbsDown size={14} color="#EF4444" />
                        <Text style={styles.statValue}>{stats.dislikes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <MessageCircle size={14} color="#6B7280" />
                        <Text style={styles.statValue}>{stats.comments}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
              {Object.keys(memberVotingStats).length === 0 && (
                <Text style={styles.noActivity}>
                  {collection.is_public 
                    ? 'Start voting and commenting to see activity here!' 
                    : 'Collection members can vote and comment to see activity here!'}
                </Text>
              )}
            </View>
          );
        })()}
      </View>
    </View>
  );
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

  // Calculate collection members for privacy filtering
  const collectionMembers = collection?.collaborators && Array.isArray(collection.collaborators) 
    ? collection.collaborators.map((member: any) => typeof member === 'string' ? member : member?.userId || member?.id)
    : [];

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
                    <Text style={styles.voteBreakdown}>{meta.likes} likes · {meta.dislikes} dislikes</Text>
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
                    
                    // Get collection members for privacy filtering
                    const collectionMembers = collection.collaborators && Array.isArray(collection.collaborators) 
                      ? collection.collaborators.map((member: any) => typeof member === 'string' ? member : member?.userId || member?.id)
                      : [];
                    
                    // Only show votes for this specific restaurant
                    meta.voteDetails.likeVoters.forEach(voter => {
                      // For private collections, only show activity from actual members
                      if (!collection.is_public && !collectionMembers.includes(voter.userId)) {
                        return;
                      }
                      
                      // For shared collections, only show activity from actual collection members
                      if (collection.is_public && !collectionMembers.includes(voter.userId)) {
                        return;
                      }
                      
                      // Suppress content for unknown members in shared collections
                      if (collection.is_public && (!voter.name || voter.name === 'Unknown' || voter.name === 'Unknown User')) {
                        return;
                      }
                      
                      restaurantVotes.push({
                        type: 'like',
                        userName: voter.name,
                        firstName: voter.name ? voter.name.split(' ')[0] : 'Unknown',
                        reason: voter.reason,
                        timestamp: voter.timestamp
                      });
                    });
                    
                    meta.voteDetails.dislikeVoters.forEach(voter => {
                      // For private collections, only show activity from actual members
                      if (!collection.is_public && !collectionMembers.includes(voter.userId)) {
                        return;
                      }
                      
                      // For shared collections, only show activity from actual collection members
                      if (collection.is_public && !collectionMembers.includes(voter.userId)) {
                        return;
                      }
                      
                      // Suppress content for unknown members in shared collections
                      if (collection.is_public && (!voter.name || voter.name === 'Unknown' || voter.name === 'Unknown User')) {
                        return;
                      }
                      
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
                          <View key={`${vote.userName}-${vote.type}-${index}`} style={styles.memberVoteItem}>
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
                  {(() => {
                    // Get collection members for privacy filtering
                    const collectionMembers = collection.collaborators && Array.isArray(collection.collaborators) 
                      ? collection.collaborators.map((member: any) => typeof member === 'string' ? member : member?.userId || member?.id)
                      : [];
                    
                    // Filter discussions to only show collection members
                    const filteredDiscussions = discussions.filter(discussion => {
                      // For private collections, only show activity from actual members
                      if (!collection.is_public && !collectionMembers.includes(discussion.userId)) {
                        return false;
                      }
                      
                      // For shared collections, only show activity from actual collection members
                      if (collection.is_public && !collectionMembers.includes(discussion.userId)) {
                        return false;
                      }
                      
                      // Suppress content for unknown members in shared collections
                      if (collection.is_public && (!discussion.userName || discussion.userName === 'Unknown' || discussion.userName === 'Unknown User')) {
                        return false;
                      }
                      
                      return true;
                    });
                    
                    return filteredDiscussions.length > 0 ? (
                      <View style={styles.memberCommentsList}>
                        {filteredDiscussions.slice(0, 6).map((discussion, index) => (
                        <View key={`${discussion.userId}-${discussion.id}-${index}`} style={styles.memberCommentItem}>
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
                                {discussion.restaurantName || 'Collection'} · {discussion.timestamp ? new Date(discussion.timestamp).toLocaleDateString() : 'Unknown date'}
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
                  );
                })()}
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
          </>
        ) : (
          <InsightsTab 
            collection={collection}
            rankedRestaurants={rankedRestaurants}
            discussions={discussions}
            collectionMembers={collectionMembers}
            styles={styles}
          />
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
                    voteRestaurant(showVoteModal.vote, showVoteModal.restaurantId, id, voteReason);
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
                onPress={() => {
                  if (showDiscussionModal && discussionMessage.trim()) {
                    addDiscussion(showDiscussionModal.id, discussionMessage);
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
  sectionTitle: {
    fontSize: 20,
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
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  winningRankingHeader: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  winningRankBadge: {
    backgroundColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  silverRank: {
    backgroundColor: '#C0C0C0',
  },
  bronzeRank: {
    backgroundColor: '#CD7F32',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  winningRankNumber: {
    color: '#1A1A1A',
    fontSize: 18,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  winnerBadge: {
    backgroundColor: '#FEF3C7',
  },
  favoritesBadge: {
    backgroundColor: '#EF4444',
  },
  unanimousBadge: {
    backgroundColor: '#10B981',
  },
  debatedBadge: {
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  votingSection: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  voteStats: {
    marginBottom: 8,
  },
  approvalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  voteBreakdown: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  consensusMeter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: '#10B981',
  },
  consensusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  discussButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  voteReasons: {
    marginTop: 8,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberVotingSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  memberVotingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  memberVotesList: {
    gap: 8,
  },
  memberVoteItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  memberVoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberVoteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberVoteInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberVoteInfo: {
    flex: 1,
  },
  memberVoteName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  memberVoteBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeVoteBadge: {
    backgroundColor: '#FCD34D',
  },
  dislikeVoteBadge: {
    backgroundColor: '#EF4444',
  },
  memberVoteBadgeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberVoteReason: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyVotesContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noVotesText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  noVotesSubtext: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 2,
  },
  memberCommentsSection: {
    marginTop: 12,
  },
  memberCommentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  memberCommentsList: {
    gap: 8,
  },
  memberCommentItem: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberCommentInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  memberCommentInfo: {
    flex: 1,
  },
  memberCommentName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  memberCommentDetail: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  memberCommentText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  discussionsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
  },
  discussionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  discussionUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  discussionMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  discussionTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
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
  insightsContainer: {
    padding: 20,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  insightsGrid: {
    gap: 12,
  },
  insightsContent: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  votingDetails: {
    gap: 6,
  },
  voteGroup: {
    gap: 4,
  },
  voteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  voterNames: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  noVotes: {
    fontSize: 11,
    color: '#D1D5DB',
    fontStyle: 'italic',
  },
  commentsSection: {
    marginTop: 8,
    gap: 4,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  commentItem: {
    gap: 2,
  },
  commentAuthor: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },
  commentText: {
    fontSize: 10,
    color: '#6B7280',
  },
  memberActivitySection: {
    marginBottom: 24,
  },
  memberStatsGrid: {
    gap: 12,
  },
  memberStatCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  memberStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  noActivity: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});
