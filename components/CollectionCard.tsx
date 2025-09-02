import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Users, Heart } from 'lucide-react-native';
import { Collection } from '@/types/restaurant';
import { useCollectionRestaurants } from '@/hooks/restaurant-store';
import { getMemberCount } from '@/utils/member-helpers';
import { usePexelsImage } from '@/hooks/use-pexels-images';
import { PexelsImageComponent } from './PexelsImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
  showFollowButton?: boolean;
  onFollowToggle?: (collectionId: string, isFollowing: boolean) => void;
  isUserMember?: boolean;
}

export function CollectionCard({ collection, onPress, showFollowButton = false, onFollowToggle, isUserMember = false }: CollectionCardProps) {
  // Debug: Log what the component receives
  console.log(`[CollectionCard] Component received "${collection.name}":`, {
    collaborators: collection.collaborators,
    collaboratorsLength: collection.collaborators?.length || 0,
    memberCount: (collection as any).memberCount,
    id: collection.id
  });
  
  const restaurants = useCollectionRestaurants(collection.id);
  
  // Get Pexels image for collection cover
  const { image: pexelsImage, isLoading: imageLoading, error: imageError } = usePexelsImage(
    collection.name,
    'collection',
    {
      cuisines: restaurants?.map(r => r.cuisine).filter(Boolean) || [],
      city: restaurants?.[0]?.city,
      collectionId: collection.id
    }
  );
  
  // Enhanced data validation and fallbacks
  const restaurantCount = restaurants && Array.isArray(restaurants) ? restaurants.length : 0;
  
  // State to preserve the correct member count when it's first available
  const [preservedMemberCount, setPreservedMemberCount] = useState<number | null>(null);
  
  // Use memberCount from collection data if available, otherwise calculate it
  // If we have collaborators data, recalculate to ensure accuracy
  const calculatedTotalMembers = collection.collaborators && collection.collaborators.length > 0 
    ? getMemberCount(collection.collaborators || []) 
    : ((collection as any).memberCount || getMemberCount(collection.collaborators || []));
  
  // Preserve the correct member count when it's first available
  useEffect(() => {
    if (calculatedTotalMembers > 0 && preservedMemberCount === null) {
      setPreservedMemberCount(calculatedTotalMembers);
      console.log(`[CollectionCard] Preserving member count for "${collection.name}": ${calculatedTotalMembers}`);
    }
  }, [calculatedTotalMembers, preservedMemberCount, collection.name]);
  
  // Use preserved count if available, otherwise use calculated
  const totalMembers = preservedMemberCount || calculatedTotalMembers;
  const memberCountText = totalMembers.toString();
  const likeCount = collection.likes || 0;
  
             // Debug: Log what we're calculating
           console.log(`[CollectionCard] "${collection.name}" (${new Date().toISOString()}):`, {
             memberCount: (collection as any).memberCount,
             calculatedTotalMembers,
             preservedMemberCount,
             finalTotalMembers: totalMembers,
             memberCountText,
             collaborators: collection.collaborators?.length || 0
           });
  

  
  // Determine collection type for display
  const getCollectionType = () => {
    if (collection.is_public) return 'Public';
    if (totalMembers > 1) return 'Shared';
    return 'Private';
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <PexelsImageComponent
        image={pexelsImage}
        isLoading={imageLoading}
        error={imageError}
        style={styles.image}
        fallbackSource={{ 
          uri: collection.cover_image || collection.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' 
        }}
        showLoadingIndicator={false}
      />
      <View style={styles.overlay} />
      
      {/* Collection type badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{getCollectionType()}</Text>
      </View>
      
      {/* Follow/Unfollow button in top right corner */}
      {showFollowButton && collection.is_public && onFollowToggle && (
        <TouchableOpacity 
          style={[styles.followButtonTopRight, (collection.isFollowing || isUserMember) && styles.followingButtonTopRight]}
          onPress={() => onFollowToggle(collection.id, !(collection.isFollowing || isUserMember))}
          activeOpacity={0.8}
        >
          <Text style={[styles.followButtonText, (collection.isFollowing || isUserMember) && styles.followingButtonText]}>
            {(collection.isFollowing || isUserMember) ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Following badge for public collections */}
      {collection.is_public && (collection.isFollowing || isUserMember) && (
        <View style={styles.followingBadge}>
          <Text style={styles.followingBadgeText}>Following</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{collection.name}</Text>
        <Text style={styles.count}>{restaurantCount} places</Text>
        {collection.description && (
          <Text style={styles.description} numberOfLines={1}>
            {collection.description}
          </Text>
        )}
      </View>
      
      <View style={styles.footer}>
        {/* Only show likes for non-public collections */}
        {!collection.is_public && (
          <View style={styles.stat}>
            <Heart size={14} color="#FFF" fill="#FFF" />
            <Text style={styles.statText}>{likeCount}</Text>
          </View>
        )}
        
        <View style={styles.stat}>
          <Users size={14} color="#FFF" />
          <Text style={[styles.statText, { 
            fontWeight: 'bold', 
            fontSize: 14
          }]}>
            {memberCountText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    padding: 8,
    justifyContent: 'flex-end',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  count: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 8,
    paddingTop: 0,
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  // Enhanced styles
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  // Follow button styles (top right corner)
  followButtonTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  followingButtonTopRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  followButtonText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  followingButtonText: {
    color: '#FFF',
  },
  // Following badge styles
  followingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});