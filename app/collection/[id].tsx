import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Platform,
  FlatList
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  Heart, 
  X, 
  MessageCircle, 
  Star, 
  Crown, 
  MapPin,
  Users,
  Share2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react-native';
import { useCollectionById, useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { getMemberCount, getMemberIds } from '@/utils/member-helpers';

const { width } = Dimensions.get('window');

// Animated Confetti Component
const Confetti = ({ visible, onComplete }: { visible: boolean; onComplete: () => void }) => {
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    rotate: new Animated.Value(0),
    scale: new Animated.Value(1),
  }));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete());

      // Animate individual confetti pieces
      confettiPieces.forEach((piece, index) => {
        const randomX = (Math.random() - 0.5) * 200;
        const randomY = Math.random() * 300 + 100;
        const randomRotate = Math.random() * 720;

        Animated.parallel([
          Animated.timing(piece.translateX, {
            toValue: randomX,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.translateY, {
            toValue: randomY,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotate, {
            toValue: randomRotate,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(piece.scale, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(piece.scale, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [visible]);

  if (!visible) return null;

                return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confettiPiece,
            {
              transform: [
                { translateX: piece.translateX },
                { translateY: piece.translateY },
                { rotate: piece.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
                { scale: piece.scale },
              ],
            },
          ]}
        >
          <Text style={styles.confettiEmoji}>🎉</Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Modern Restaurant Card Component
interface ModernRestaurantCardProps {
  restaurant: any;
  index: number;
  user: any;
  collectionMembers: string[];
  onVote: (restaurantId: string, vote: 'like' | 'dislike', collectionId?: string, reason?: string) => void;
  onComment: (restaurantId: string) => void;
  collectionId: string;
}

const ModernRestaurantCard: React.FC<ModernRestaurantCardProps> = ({
  restaurant,
  index,
  user,
                  collectionMembers,
  onVote,
  onComment,
  collectionId,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const voteAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const xAnim = useRef(new Animated.Value(1)).current;

  const meta = restaurant.meta || {};
  const userLiked = meta.voteDetails?.likeVoters?.some((v: any) => v.userId === user?.id) || false;
  const userDisliked = meta.voteDetails?.dislikeVoters?.some((v: any) => v.userId === user?.id) || false;

  const likeCount = meta.voteDetails?.likeVoters?.filter((v: any) => {
                  const voteUserIdShort = v.userId?.substring(0, 8);
                  return collectionMembers.includes(voteUserIdShort);
  }).length || 0;

  const dislikeCount = meta.voteDetails?.dislikeVoters?.filter((v: any) => {
                    const voteUserIdShort = v.userId?.substring(0, 8);
                    return collectionMembers.includes(voteUserIdShort);
  }).length || 0;

  const totalVotes = likeCount + dislikeCount;
  const likePercentage = totalVotes > 0 ? (likeCount / totalVotes) * 100 : 0;

  const handleVote = (vote: 'like' | 'dislike') => {
    // Animate the vote button
    const animValue = vote === 'like' ? heartAnim : xAnim;
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
          toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Show confetti for likes
    if (vote === 'like') {
      setShowConfetti(true);
    }

    // Animate the card
    Animated.sequence([
      Animated.timing(voteAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(voteAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    onVote(restaurant.id, vote, collectionId, '');
  };


                return (
    <Animated.View
      style={[
        styles.restaurantCard,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: voteAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -8]
            }) }
          ]
        }
      ]}
    >
      <Confetti visible={showConfetti} onComplete={() => setShowConfetti(false)} />
      

      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.image_url || 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg' }}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
                          </View>

      {/* Restaurant Info */}
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName} numberOfLines={2}>
          {restaurant.name}
                            </Text>
        <View style={styles.restaurantMeta}>
          <View style={styles.metaItem}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.metaText}>{restaurant.address}</Text>
                          </View>
          {restaurant.rating && (
            <View style={styles.metaItem}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.metaText}>{restaurant.rating}</Text>
                        </View>
                      )}
                    </View>
                    </View>

      {/* Vote Progress Bar */}
      {totalVotes > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${likePercentage}%` }]} />
                  </View>
          <Text style={styles.progressText}>
            {Math.round(likePercentage)}% love it ({likeCount}/{totalVotes} votes)
        </Text>
      </View>
      )}

      {/* Voting Buttons */}
      <View style={styles.votingSection}>
                      <TouchableOpacity 
          style={[
            styles.voteButton,
            styles.likeButton,
            userLiked && styles.activeVoteButton
          ]}
          onPress={() => handleVote('like')}
          onPressIn={() => {
            setIsPressed(true);
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            setIsPressed(false);
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <Heart 
              size={24} 
              color={userLiked ? "#FFFFFF" : "#22C55E"} 
              fill={userLiked ? "#FFFFFF" : "transparent"}
            />
          </Animated.View>
          <Text style={[styles.voteCount, userLiked && styles.activeVoteCount]}>
            {likeCount}
          </Text>
                      </TouchableOpacity>

                        <TouchableOpacity
          style={[
            styles.voteButton,
            styles.dislikeButton,
            userDisliked && styles.activeVoteButton
          ]}
          onPress={() => handleVote('dislike')}
          onPressIn={() => {
            setIsPressed(true);
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            setIsPressed(false);
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: xAnim }] }}>
            <X 
              size={24} 
              color={userDisliked ? "#FFFFFF" : "#EF4444"} 
            />
          </Animated.View>
          <Text style={[styles.voteCount, userDisliked && styles.activeVoteCount]}>
            {dislikeCount}
                              </Text>
                        </TouchableOpacity>

        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => onComment(restaurant.id)}
        >
          <MessageCircle size={20} color="#8B5CF6" />
        </TouchableOpacity>
    </View>
    </Animated.View>
  );
};

// Main Collection Detail Page
export default function ModernCollectionDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [commentMessage, setCommentMessage] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  // Data fetching
  const collection = useCollectionById(id!);
  const { restaurants } = useRestaurants();

  // Animate dots when currentCardIndex changes
  useEffect(() => {
    // Animate demo dots
    dotAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentCardIndex ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
      }).start();
    });
  }, [currentCardIndex, dotAnimations]);

  // Debug logging
  console.log('[ModernCollectionDetailPage] Debug:', {
    id,
    hasCollection: !!collection,
    collectionName: collection?.name,
    hasRestaurants: !!restaurants,
    restaurantsCount: restaurants?.length,
    collectionRestaurantIds: collection?.restaurant_ids?.length
  });

  // Collection members
  const collectionMembers = React.useMemo(() => {
    if (!collection) return [];
    return getMemberIds(collection as any);
  }, [collection]);

  // Restaurants with voting data
  const restaurantsWithVotingData = React.useMemo(() => {
    if (!collection?.restaurant_ids || !restaurants) return [];
    
    return collection.restaurant_ids
      .map((restaurantId: string) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
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
  }, [collection?.restaurant_ids, restaurants]);

  // Create dynamic dot animations for real data
  const realDataDotAnimations = useRef<Animated.Value[]>([]).current;
  
  // Initialize dot animations for real data
  useEffect(() => {
    if (restaurantsWithVotingData.length > 0) {
      // Clear existing animations
      realDataDotAnimations.length = 0;
      // Create new animations for each restaurant
      for (let i = 0; i < restaurantsWithVotingData.length; i++) {
        realDataDotAnimations.push(new Animated.Value(i === currentCardIndex ? 1 : 0));
      }
    }
  }, [restaurantsWithVotingData.length, realDataDotAnimations, currentCardIndex]);

  // Animate real data dots when currentCardIndex changes
  useEffect(() => {
    realDataDotAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentCardIndex ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [currentCardIndex, realDataDotAnimations]);

  // Voting function
  const voteRestaurant = useCallback(async (restaurantId: string, vote: 'like' | 'dislike', collectionId?: string, reason?: string) => {
    if (!user || !collectionId) return;
    
    try {
      // Add your voting logic here
      console.log('Voting:', { restaurantId, vote, collectionId, reason });
      } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to vote. Please try again.');
    }
  }, [user]);

  // Comment function
  const handleComment = useCallback(async (restaurantId: string) => {
    if (!commentMessage.trim() || !user || !id) return;
    
    try {
      // Add your comment logic here
      console.log('Commenting:', { restaurantId, comment: commentMessage });
      setCommentMessage('');
      setShowCommentModal(null);
      } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  }, [commentMessage, user, id]);

  // Show demo content if data isn't loaded yet
  if (!collection || !restaurants) {
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

        {/* Demo Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.collectionName}>Demo Collection</Text>
            <Text style={styles.collectionDescription}>This is a demo collection to show the modern design</Text>
            
            <View style={styles.collectionMeta}>
              <View style={styles.headerMetaItem}>
                <Users size={16} color="#9CA3AF" />
                <Text style={styles.headerMetaText}>3 members</Text>
      </View>
              <View style={styles.headerMetaItem}>
                <Star size={16} color="#9CA3AF" />
                <Text style={styles.headerMetaText}>2 restaurants</Text>
      </View>
              <View style={styles.headerMetaItem}>
                <Crown size={16} color="#9CA3AF" />
                <Text style={styles.headerMetaText}>Shared</Text>
            </View>
            </View>
          </View>
        </View>

        {/* Demo Restaurants Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={[
              {
                id: 'demo-1',
                name: 'Demo Restaurant 1',
                address: '123 Demo Street, Demo City',
                rating: '4.5',
                image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                meta: {
                  voteDetails: {
                    likeVoters: [{ userId: 'user1', name: 'Demo User' }],
                    dislikeVoters: []
                  }
                }
              },
              {
                id: 'demo-2',
                name: 'Demo Restaurant 2',
                address: '456 Demo Avenue, Demo City',
                rating: '4.2',
                image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
                meta: {
                  voteDetails: {
                    likeVoters: [],
                    dislikeVoters: [{ userId: 'user2', name: 'Demo User 2' }]
                  }
                }
              },
              {
                id: 'demo-3',
                name: 'Demo Restaurant 3',
                address: '789 Demo Boulevard, Demo City',
                rating: '4.8',
                image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
                meta: {
                  voteDetails: {
                    likeVoters: [{ userId: 'user1', name: 'Demo User' }, { userId: 'user3', name: 'Demo User 3' }],
                    dislikeVoters: []
                  }
                }
              }
            ]}
            renderItem={({ item, index }) => (
              <View style={styles.carouselItem}>
                <ModernRestaurantCard
                  restaurant={item}
                  index={index}
                  user={user}
                  collectionMembers={['user1', 'user2', 'user3']}
                  onVote={(restaurantId, vote) => console.log('Demo vote:', restaurantId, vote)}
                  onComment={(restaurantId) => setShowCommentModal(restaurantId)}
                  collectionId={id || 'demo'}
                />
            </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentCardIndex(index);
            }}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentCardIndex(index);
            }}
            style={styles.carousel}
          />
          
          {/* Carousel Navigation Dots */}
          <View style={styles.carouselDots}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                  setCurrentCardIndex(index);
                }}
              >
                   <Animated.View 
                     style={[
                    styles.carouselDot,
                    {
                      width: dotAnimations[index].interpolate({
                             inputRange: [0, 1],
                        outputRange: [8, 24],
                      }),
                      backgroundColor: dotAnimations[index].interpolate({
                           inputRange: [0, 1],
                        outputRange: ['#D1D5DB', '#3B82F6'],
                      }),
                    }
                  ]}
                />
              </TouchableOpacity>
            ))}
                    </View>
                    
          {/* Poll Statistics */}
          <View style={styles.pollStatisticsContainer}>
            <View style={styles.pollStatisticsHeader}>
              <Text style={styles.pollStatisticsTitle}>Poll Statistics</Text>
              <TouchableOpacity onPress={() => router.push(`/collection/${id}/insights`)}>
                <Text style={styles.pollStatisticsDetails}>Details</Text>
              </TouchableOpacity>
                      </View>
            <View style={styles.voterContainer}>
              <Text style={styles.voterLabel}>Votes by</Text>
              <View style={styles.voterAvatars}>
                {[
                  { id: 'user1', name: 'Demo User', avatar: '👤' },
                  { id: 'user2', name: 'Demo User 2', avatar: '👤' },
                  { id: 'user3', name: 'Demo User 3', avatar: '👤' },
                  { id: 'user4', name: 'Demo User 4', avatar: '👤' },
                  { id: 'user5', name: 'Demo User 5', avatar: '👤' }
                ].map((user, index) => (
                  <View key={user.id} style={[styles.voterAvatar, { marginLeft: index > 0 ? -8 : 0 }]}>
                    <Text style={styles.voterAvatarText}>{user.avatar}</Text>
                  </View>
                ))}
                    </View>
                    </View>
                    </View>
                      </View>
                    
        {/* Comment Modal */}
        <Modal
          visible={!!showCommentModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCommentModal(null)}
        >
          <KeyboardAvoidingView style={styles.modalContainer} behavior="padding">
                    <TouchableOpacity 
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={() => {
                setShowCommentModal(null);
                setCommentMessage('');
              }}
            >
              <View style={{ flex: 1 }} />
                    </TouchableOpacity>
                    
            <View style={styles.commentModal}>
              <View style={styles.commentModalHeader}>
                <Text style={styles.commentModalTitle}>Add Comment</Text>
                    <TouchableOpacity 
                  onPress={() => {
                    setShowCommentModal(null);
                    setCommentMessage('');
                  }}
                  style={styles.closeButton}
                >
                  <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
              
            <TextInput
                style={styles.commentInput}
                placeholder="Share your thoughts about this restaurant..."
                value={commentMessage}
                onChangeText={setCommentMessage}
              multiline
                numberOfLines={4}
                textAlignVertical="top"
            />
            
              <View style={styles.commentModalActions}>
              <TouchableOpacity 
                  style={styles.cancelButton}
                onPress={() => {
                    setShowCommentModal(null);
                    setCommentMessage('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={[styles.submitButton, !commentMessage.trim() && styles.submitButtonDisabled]}
                onPress={() => {
                    console.log('Demo comment:', commentMessage);
                    setCommentMessage('');
                    setShowCommentModal(null);
                }}
                  disabled={!commentMessage.trim()}
              >
                  <Text style={styles.submitButtonText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
      </Modal>
      </View>
    );
  }

  const isSharedCollection = collection.is_public || collectionMembers.length > 1;

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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          <Text style={styles.collectionDescription}>{collection.description}</Text>
          
          <View style={styles.collectionMeta}>
            <View style={styles.headerMetaItem}>
              <Users size={16} color="#9CA3AF" />
              <Text style={styles.headerMetaText}>{collectionMembers.length} members</Text>
          </View>
            <View style={styles.headerMetaItem}>
              <Star size={16} color="#9CA3AF" />
              <Text style={styles.headerMetaText}>{restaurantsWithVotingData.length} restaurants</Text>
        </View>
            {isSharedCollection && (
              <View style={styles.headerMetaItem}>
                <Crown size={16} color="#9CA3AF" />
                <Text style={styles.headerMetaText}>Shared</Text>
        </View>
            )}
          </View>
        </View>
      </View>

      {/* Restaurants Carousel */}
      <View style={styles.carouselContainer}>
        {restaurantsWithVotingData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No restaurants in this collection yet</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={restaurantsWithVotingData}
              renderItem={({ item, index }) => {
                if (!item) return null;
                const { restaurant, meta } = item;
                return (
                  <View style={styles.carouselItem}>
                    <ModernRestaurantCard
                      restaurant={{...restaurant, meta}}
                      index={index}
                      user={user}
                      collectionMembers={collectionMembers}
                      onVote={voteRestaurant}
                      onComment={(restaurantId) => setShowCommentModal(restaurantId)}
                      collectionId={id!}
                    />
                  </View>
                );
              }}
              keyExtractor={(item, index) => item?.restaurant?.id || index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentCardIndex(index);
              }}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentCardIndex(index);
              }}
              style={styles.carousel}
            />
            
            {/* Carousel Navigation Dots */}
            <View style={styles.carouselDots}>
              {restaurantsWithVotingData.map((_, index) => (
              <TouchableOpacity 
                  key={index}
                onPress={() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true });
                    setCurrentCardIndex(index);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.carouselDot,
                      realDataDotAnimations[index] ? {
                        width: realDataDotAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 24],
                        }),
                        backgroundColor: realDataDotAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['#D1D5DB', '#3B82F6'],
                        }),
                      } : {}
                    ]}
                  />
              </TouchableOpacity>
              ))}
            </View>
            
            {/* Poll Statistics */}
            <View style={styles.pollStatisticsContainer}>
              <View style={styles.pollStatisticsHeader}>
                <Text style={styles.pollStatisticsTitle}>Poll Statistics</Text>
                <TouchableOpacity>
                  <Text style={styles.pollStatisticsDetails}>Details</Text>
                </TouchableOpacity>
          </View>
              <View style={styles.voterContainer}>
                <Text style={styles.voterLabel}>Votes by</Text>
                <View style={styles.voterAvatars}>
                  {collectionMembers.slice(0, 5).map((memberId, index) => (
                    <View key={memberId} style={[styles.voterAvatar, { marginLeft: index > 0 ? -8 : 0 }]}>
                      <Text style={styles.voterAvatarText}>👤</Text>
        </View>
                  ))}
                </View>
              </View>
            </View>
            
          </>
        )}
          </View>

      {/* Comment Modal */}
      <Modal
        visible={!!showCommentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCommentModal(null)}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior="padding">
              <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
                onPress={() => {
              setShowCommentModal(null);
              setCommentMessage('');
                }}
              >
            <View style={{ flex: 1 }} />
              </TouchableOpacity>
          
          <View style={styles.commentModal}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Add Comment</Text>
          <TouchableOpacity 
            onPress={() => {
              setShowCommentModal(null);
              setCommentMessage('');
            }}
                style={styles.closeButton}
          >
                <X size={24} color="#6B7280" />
          </TouchableOpacity>
            </View>
          
            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts about this restaurant..."
              value={commentMessage}
              onChangeText={setCommentMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.commentModalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCommentModal(null);
                  setCommentMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !commentMessage.trim() && styles.submitButtonDisabled]}
                onPress={() => handleComment(showCommentModal!)}
                disabled={!commentMessage.trim()}
              >
                <Text style={styles.submitButtonText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    alignItems: 'center',
  },
  collectionName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  collectionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  headerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  carouselContainer: {
    flex: 1,
    paddingTop: 20,
  },
  carousel: {
    flex: 1,
  },
  carouselItem: {
    width: width,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    marginTop: 8,
    gap: 8,
    position: 'relative',
    zIndex: 1,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(209, 213, 219, 0.8)',
  },
  carouselDotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  pollStatisticsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pollStatisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pollStatisticsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  pollStatisticsDetails: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  voterContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16
,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voterLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  voterAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  voterAvatarText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  imageContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  restaurantInfo: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  restaurantMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  votingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  likeButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  dislikeButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  activeVoteButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  activeVoteCount: {
    color: '#fff',
  },
  commentButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  confettiEmoji: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    flex: 1,
  },
  commentModal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    minHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  commentModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
