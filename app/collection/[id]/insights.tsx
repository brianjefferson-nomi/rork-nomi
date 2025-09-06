import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  Heart, 
  X, 
  MessageCircle, 
  Users, 
  Star, 
  Crown, 
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Trophy
} from 'lucide-react-native';

import { useCollectionById, useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { getMemberIds, isCreator, isMember, canManageRestaurants } from '@/utils/member-helpers';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

// Helper function to get member count
function getMemberCount(collection: any): number {
  if (!collection) return 0;
  return getMemberIds(collection).length;
}

// Main Insights Page Component
export default function CollectionInsightsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  console.log('Insights page loaded with id:', id);

  // Simple test - if this doesn't show, there's a routing issue
  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>No collection ID provided</Text>
      </View>
    );
  }

  // Data fetching
  const collection = useCollectionById(id!);
  const { restaurants } = useRestaurants();
  
  // Direct database fetch as fallback
  const [directCollection, setDirectCollection] = useState<any>(null);
  
  useEffect(() => {
    const fetchCollectionDirectly = async () => {
      if (!id) return;
      
      try {
        console.log('[Insights] Fetching collection directly from database:', id);
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('[Insights] Error fetching collection:', error);
        } else {
          console.log('[Insights] Successfully fetched collection:', data);
          setDirectCollection(data);
        }
      } catch (err) {
        console.error('[Insights] Exception fetching collection:', err);
      }
    };
    
    // Only fetch if collection from hook is not available
    if (!collection) {
      fetchCollectionDirectly();
    }
  }, [id, collection]);
  
  // Use direct collection if hook collection is not available
  const finalCollection = collection || directCollection;

  // Get collection members
  const collectionMembers = useMemo(() => {
    if (!finalCollection) return [];
    return getMemberIds(finalCollection as any);
  }, [finalCollection]);

  // Process restaurants with voting data
  const restaurantsWithVotingData = useMemo(() => {
    if (!finalCollection?.restaurant_ids || !restaurants) return [];
    
    return finalCollection.restaurant_ids
      .map((restaurantId: string) => {
        const restaurant = restaurants.find((r: any) => r.id === restaurantId);
        if (!restaurant) return null;
        
        const meta = (restaurant as any).meta || {};
        return { restaurant, meta };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const aRank = a.meta?.rank || 999;
        const bRank = b.meta?.rank || 999;
        return aRank - bRank;
      });
  }, [finalCollection?.restaurant_ids, restaurants]);

  // Calculate participation data
  const participationData = useMemo(() => {
    const totalMembers = getMemberCount(finalCollection);
    const participatingMembers = restaurantsWithVotingData.reduce((total: number, item: any, restaurantIndex: number) => {
      const { meta } = item || {};
      const memberLikeVoters = meta.voteDetails?.likeVoters?.filter((v: any) => {
        const voteUserIdShort = v.userId?.substring(0, 8);
        return collectionMembers.includes(voteUserIdShort);
      }) || [];
      
      const memberDislikeVoters = meta.voteDetails?.dislikeVoters?.filter((v: any) => {
        const voteUserIdShort = v.userId?.substring(0, 8);
        return collectionMembers.includes(voteUserIdShort);
      }) || [];
      
      const uniqueVoters = new Set([
        ...memberLikeVoters.map((v: any) => `${v.userId?.substring(0, 8)}-${restaurantIndex}`),
        ...memberDislikeVoters.map((v: any) => `${v.userId?.substring(0, 8)}-${restaurantIndex}`)
      ]);
      return total + uniqueVoters.size;
    }, 0);
    
    const participationRate = totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;
    const has75PercentParticipation = participationRate >= 75;
    
    return {
      totalMembers,
      participatingMembers,
      participationRate,
      has75PercentParticipation
    };
  }, [collection, restaurantsWithVotingData, collectionMembers]);

  // Debug logging
  console.log('[CollectionInsightsPage] Debug:', {
    id,
    hasCollection: !!collection,
    collectionName: collection?.name,
    hasRestaurants: !!restaurants,
    restaurantsCount: restaurants?.length,
    collectionRestaurants: collection?.restaurant_ids?.length
  });

  // Debug logging
  console.log('Insights Debug:', {
    hasCollection: !!collection,
    hasDirectCollection: !!directCollection,
    hasFinalCollection: !!finalCollection,
    hasRestaurants: !!restaurants,
    restaurantsCount: restaurants?.length,
    collectionRestaurants: finalCollection?.restaurant_ids?.length,
    restaurantsWithVotingData: restaurantsWithVotingData.length,
    collectionName: finalCollection?.name,
    collectionId: id,
    collectionData: finalCollection,
    restaurantsData: restaurants?.slice(0, 2), // First 2 restaurants for debugging
    restaurantIds: finalCollection?.restaurant_ids
  });

  // Show loading state only if no collection data is available
  if (!finalCollection) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        
        {/* Custom Back Button */}
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Loading State */}
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading insights...</Text>
            <Text style={styles.loadingSubtext}>Fetching collection data and voting statistics</Text>
            <Text style={styles.debugText}>Collection ID: {id}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const isSharedCollection = finalCollection.is_public || collectionMembers.length > 1;

  // Show message if no restaurants data
  if (!restaurants || restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        
        {/* Custom Back Button */}
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No restaurants found</Text>
            <Text style={styles.loadingSubtext}>This collection doesn't have any restaurants yet</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Collection Insights</Text>
          <Text style={styles.subtitle}>{finalCollection.name}</Text>
          <Text style={styles.debugText}>Debug: Page is rendering</Text>
        </View>

        {/* Show message if no restaurants in collection */}
        {restaurantsWithVotingData.length === 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No restaurants in this collection</Text>
            <Text style={styles.loadingSubtext}>Add restaurants to see voting insights</Text>
          </View>
        )}

        {/* Group Insights */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>📊 Group Insights</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{participationData.participationRate}%</Text>
              <Text style={styles.analyticLabel}>Participation Rate</Text>
            </View>
            
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>
                {restaurantsWithVotingData.reduce((total: number, item: any) => {
                  const { meta } = item || {};
                  const memberLikeVoters = meta.voteDetails?.likeVoters?.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  }) || [];
                  const memberDislikeVoters = meta.voteDetails?.dislikeVoters?.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
                  }) || [];
                  return total + memberLikeVoters.length + memberDislikeVoters.length;
                }, 0)}
              </Text>
              <Text style={styles.analyticLabel}>Total Votes</Text>
            </View>
            
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{restaurantsWithVotingData.length}</Text>
              <Text style={styles.analyticLabel}>Restaurants</Text>
            </View>
            
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{collectionMembers.length}</Text>
              <Text style={styles.analyticLabel}>Members</Text>
            </View>
          </View>
        </View>

        {/* Voting Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>🍽️ Restaurant Voting Breakdown</Text>
          <View style={styles.insightsGrid}>
            {restaurantsWithVotingData.slice(0, 6).map((item: any, index: number) => {
              const { restaurant, meta } = item || {};
              const memberLikeVoters = meta.voteDetails?.likeVoters?.filter((v: any) => {
                const voteUserIdShort = v.userId?.substring(0, 8);
                return collectionMembers.includes(voteUserIdShort);
              }) || [];
              const memberDislikeVoters = meta.voteDetails?.dislikeVoters?.filter((v: any) => {
                const voteUserIdShort = v.userId?.substring(0, 8);
                return collectionMembers.includes(voteUserIdShort);
              }) || [];
              
              const totalVotes = memberLikeVoters.length + memberDislikeVoters.length;
              const approvalRate = totalVotes > 0 ? Math.round((memberLikeVoters.length / totalVotes) * 100) : 0;

              if (!restaurant) return null;

              return (
                <View key={restaurant.id} style={styles.insightsContent}>
                  <View style={styles.restaurantHeader}>
                    <View style={styles.restaurantImageContainer}>
                      {restaurant.imageUrl ? (
                        <Image 
                          source={{ uri: restaurant.imageUrl }} 
                          style={styles.restaurantImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.restaurantImagePlaceholder}>
                          <Text style={styles.restaurantImagePlaceholderText}>
                            {restaurant.name?.charAt(0).toUpperCase() || 'R'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.restaurantTitleContainer}>
                      <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
                      <Text style={styles.restaurantSubtitle}>
                        {participationData.has75PercentParticipation ? 
                          `Ranked #${index + 1} • ${restaurant.cuisine || 'Restaurant'}` :
                          `${restaurant.cuisine || 'Restaurant'} • ${participationData.participationRate}% participation`
                        }
                      </Text>
                    </View>
                    <View style={styles.restaurantRank}>
                      {participationData.has75PercentParticipation ? (
                        <Text style={styles.rankText}>#{index + 1}</Text>
                      ) : null}
                    </View>
                  </View>
                  
                  {/* Vote Statistics */}
                  <View style={styles.voteStatsContainer}>
                    <View style={styles.voteStat}>
                      <View style={styles.voteStatHeader}>
                        <Heart size={16} color="#22C55E" />
                        <Text style={styles.voteStatLabel}>Likes</Text>
                      </View>
                      <Text style={styles.voteStatValue}>{memberLikeVoters.length}</Text>
                    </View>
                    
                    <View style={styles.voteStat}>
                      <View style={styles.voteStatHeader}>
                        <X size={16} color="#EF4444" />
                        <Text style={styles.voteStatLabel}>Dislikes</Text>
                      </View>
                      <Text style={styles.voteStatValue}>{memberDislikeVoters.length}</Text>
                    </View>
                    
                    <View style={styles.voteStat}>
                      <View style={styles.voteStatHeader}>
                        <TrendingUp size={16} color="#3B82F6" />
                        <Text style={styles.voteStatLabel}>Approval</Text>
                      </View>
                      <Text style={styles.voteStatValue}>
                        {totalVotes > 0 ? Math.round((memberLikeVoters.length / totalVotes) * 100) : 0}%
                      </Text>
                    </View>
                  </View>
                  
                  {/* Voter List */}
                  {totalVotes > 0 && (
                    <View style={styles.voterListContainer}>
                      <Text style={styles.voterListTitle}>Voters:</Text>
                      <View style={styles.voterList}>
                        {[...memberLikeVoters, ...memberDislikeVoters].slice(0, 5).map((voter, voterIndex) => (
                          <View key={`${voter.userId}-${voterIndex}`} style={styles.voterItem}>
                            <View style={[
                              styles.voterAvatar, 
                              memberLikeVoters.includes(voter) ? styles.likeVoter : styles.dislikeVoter
                            ]}>
                              <Text style={styles.voterAvatarText}>
                                {voter.name?.charAt(0).toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <Text style={styles.voterName} numberOfLines={1}>
                              {voter.name || 'Anonymous'}
                            </Text>
                          </View>
                        ))}
                        {totalVotes > 5 && (
                          <Text style={styles.moreVotersText}>+{totalVotes - 5} more</Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Collection Status */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>📈 Collection Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Collection Type</Text>
              <Text style={styles.statusValue}>
                {isSharedCollection ? 'Shared' : 'Private'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Participation Threshold</Text>
              <Text style={styles.statusValue}>
                {participationData.has75PercentParticipation ? '✅ Met (75%+)' : '⏳ Pending'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Ranking Status</Text>
              <Text style={styles.statusValue}>
                {participationData.has75PercentParticipation ? 'Final Rankings' : 'Voting in Progress'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  customHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  analyticsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    minWidth: (width - 52) / 2,
    alignItems: 'center',
  },
  analyticValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  analyticLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  insightsGrid: {
    gap: 16,
  },
  insightsContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantImagePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  restaurantTitleContainer: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  restaurantSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  restaurantRank: {
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  voteStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voteStat: {
    alignItems: 'center',
    flex: 1,
  },
  voteStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  voteStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  voteStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  voterListContainer: {
    marginTop: 8,
  },
  voterListTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  voterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voterAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  likeVoter: {
    backgroundColor: '#DCFCE7',
  },
  dislikeVoter: {
    backgroundColor: '#FEE2E2',
  },
  voterAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  voterName: {
    fontSize: 12,
    color: '#374151',
    maxWidth: 80,
  },
  moreVotersText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  debugText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
