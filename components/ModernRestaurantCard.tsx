import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Heart, X, MessageCircle, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Animated Confetti Component
const Confetti = ({ visible, onComplete }: { visible: boolean; onComplete: () => void }) => {
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const confettiPieces = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    rotate: new Animated.Value(0),
    scale: new Animated.Value(1),
  }));

  React.useEffect(() => {
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

interface ModernRestaurantCardProps {
  restaurant: any;
  index: number;
  user: any;
  collectionMembers: string[];
  onVote: (restaurantId: string, vote: 'like' | 'dislike', collectionId?: string, reason?: string) => void;
  onComment: (restaurantId: string) => void;
  collectionId: string;
  isWinning?: boolean;
}

const ModernRestaurantCard: React.FC<ModernRestaurantCardProps> = ({
  restaurant,
  index,
  user,
  collectionMembers,
  onVote,
  onComment,
  collectionId,
  isWinning = false
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
        isWinning && styles.winningCard,
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

const styles = StyleSheet.create({
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
  winningCard: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
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
    color: '#FFFFFF',
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
    backgroundColor: '#E5E7EB',
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
});

export default ModernRestaurantCard;
