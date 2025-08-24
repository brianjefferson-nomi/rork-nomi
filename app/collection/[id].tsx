import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Users, Heart, Trash2, ThumbsUp, ThumbsDown, MessageCircle, Crown, TrendingUp, TrendingDown, Award } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useCollectionById, useRestaurants } from '@/hooks/restaurant-store';

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
  const collection = useCollectionById(id);
  const { 
    removeRestaurantFromCollection, 
    deleteCollection, 
    voteRestaurant, 
    addDiscussion, 
    getRankedRestaurants, 
    getGroupRecommendations,
    getCollectionDiscussions 
  } = useRestaurants();
  
  const [showVoteModal, setShowVoteModal] = useState<{ restaurantId: string; vote: 'like' | 'dislike' } | null>(null);
  const [voteReason, setVoteReason] = useState('');
  const [showDiscussionModal, setShowDiscussionModal] = useState<string | null>(null);
  const [discussionMessage, setDiscussionMessage] = useState('');
  
  const rankedRestaurants = getRankedRestaurants(id, collection?.collaborators.length);
  const recommendations = collection ? getGroupRecommendations(id) : [];
  const discussions = getCollectionDiscussions(id);

  if (!collection) {
    return (
      <View style={styles.errorContainer}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  console.log('[CollectionDetail] Ranked restaurants:', rankedRestaurants.length);
  console.log('[CollectionDetail] Recommendations:', recommendations.length);
  console.log('[CollectionDetail] Discussions:', discussions.length);

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteCollection(collection.id);
            router.back();
          }
        }
      ]
    );
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
            <TouchableOpacity onPress={handleDeleteCollection}>
              <Trash2 size={20} color="#FF6B6B" />
            </TouchableOpacity>
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
              <Text style={styles.statText}>{collection.collaborators.length} members</Text>
            </View>
          </View>
          
          {/* Collaborators */}
          <View style={styles.collaboratorsSection}>
            <Text style={styles.collaboratorsTitle}>Group Members</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collaboratorsList}>
              {collection.collaborators.map(member => (
                <View key={member.userId} style={styles.collaboratorItem}>
                  <View style={styles.collaboratorAvatar}>
                    <Text style={styles.collaboratorInitial}>{member.name.charAt(0)}</Text>
                    {member.role === 'admin' && <Crown size={12} color="#FFD700" style={styles.adminBadge} />}
                  </View>
                  <Text style={styles.collaboratorName}>{member.name}</Text>
                  {member.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Group Analytics */}
        {collection?.analytics && (
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Group Insights</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticCard}>
                <Text style={styles.analyticValue}>{collection.analytics.participationRate * 100}%</Text>
                <Text style={styles.analyticLabel}>Participation</Text>
              </View>
              <View style={styles.analyticCard}>
                <Text style={styles.analyticValue}>{collection.analytics.consensusScore * 100}%</Text>
                <Text style={styles.analyticLabel}>Consensus</Text>
              </View>
              <View style={styles.analyticCard}>
                <Text style={styles.analyticValue}>{collection.analytics.totalVotes}</Text>
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
              <View key={restaurant.id} style={styles.restaurantItem}>
                <View style={styles.rankingHeader}>
                  <View style={styles.rankBadge}>
                    {meta.rank === 1 && meta.badge === 'top_choice' && <Crown size={16} color="#FFD700" />}
                    {meta.rank === 2 && <Text style={styles.silverRank}>🥈</Text>}
                    {meta.rank === 3 && <Text style={styles.bronzeRank}>🥉</Text>}
                    <Text style={styles.rankNumber}>#{meta.rank}</Text>
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
            {discussions.slice(0, 5).map(discussion => (
              <View key={discussion.id} style={styles.discussionItem}>
                <Text style={styles.discussionUser}>{discussion.userName}</Text>
                <Text style={styles.discussionMessage}>{discussion.message}</Text>
                <Text style={styles.discussionTime}>{discussion.timestamp.toLocaleDateString()}</Text>
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
  collaboratorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
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
});