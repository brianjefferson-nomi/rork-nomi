import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Users } from 'lucide-react-native';
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
  isUserCreator?: boolean;
}

export function CollectionCard({ collection, onPress, showFollowButton = false, onFollowToggle, isUserMember = false, isUserCreator = false }: CollectionCardProps) {
  // Debug: Log what the component receives (only for specific collections)
  if (collection.name === "LA's Hidden Gems") {
    console.log(`[CollectionCard] Component received "${collection.name}":`, {
      collaborators: collection.collaborators,
      collaboratorsLength: collection.collaborators?.length || 0,
      memberCount: (collection as any).memberCount,
      id: collection.id
    });
  }
  
  const restaurants = useCollectionRestaurants(collection.id);
  
  // Debug: Log restaurant data (only for specific collections)
  if (collection.name === "LA's Hidden Gems") {
    console.log(`[CollectionCard] "${collection.name}" restaurants:`, {
      collectionId: collection.id,
      restaurants: restaurants,
      restaurantsLength: restaurants?.length || 0,
      restaurantIds: (collection as any).restaurant_ids?.length || 0
    });
  }
  
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
  
  // Fallback to collection.restaurant_ids if restaurants array is empty
  const finalRestaurantCount = restaurantCount > 0 ? restaurantCount : ((collection as any).restaurant_ids?.length || 0);
  
  // Debug: Log restaurant count information for LA's Hidden Gems
  if (collection.name === "LA's Hidden Gems") {
    console.log(`[CollectionCard] LA's Hidden Gems debug:`, {
      collectionId: collection.id,
      restaurantCount,
      finalRestaurantCount,
      restaurantsArray: restaurants?.length || 0,
      restaurantIds: (collection as any).restaurant_ids?.length || 0,
      restaurants: restaurants,
      restaurantNames: restaurants?.map(r => r.name) || []
    });
  }
  
  
  // State to preserve the correct member count when it's first available
  const [preservedMemberCount, setPreservedMemberCount] = useState<number | null>(null);
  
  // Calculate member count from collaborators + 1 for creator
  const calculatedTotalMembers = getMemberCount(collection.collaborators || []) + 1; // +1 for creator
  
  // Preserve the correct member count when it's first available
  useEffect(() => {
    if (calculatedTotalMembers > 0 && preservedMemberCount === null) {
      setPreservedMemberCount(calculatedTotalMembers);
      if (collection.name === "LA's Hidden Gems") {
        console.log(`[CollectionCard] Preserving member count for "${collection.name}": ${calculatedTotalMembers}`);
      }
    }
  }, [calculatedTotalMembers, preservedMemberCount, collection.name]);
  
  // Use preserved count if available, otherwise use calculated
  const totalMembers = preservedMemberCount || calculatedTotalMembers;
  const memberCountText = totalMembers.toString();
  
  // Debug: Log what we're calculating (only for specific collections)
  if (collection.name === "LA's Hidden Gems") {
    console.log(`[CollectionCard] "${collection.name}" (${new Date().toISOString()}):`, {
      memberCount: (collection as any).memberCount,
      calculatedTotalMembers,
      preservedMemberCount,
      finalTotalMembers: totalMembers,
      memberCountText,
      collaborators: collection.collaborators?.length || 0
    });
  }
  

  
  // Determine collection type for display - use database values as source of truth
  const getCollectionType = () => {
    if (collection.name === "LA's Hidden Gems") {
      console.log(`[CollectionCard] Determining type for "${collection.name}":`, {
        is_public: collection.is_public,
        collection_type: (collection as any).collection_type,
        totalMembers,
        collaborators: collection.collaborators?.length || 0
      });
    }
    
    // Use database collection_type if available, otherwise fall back to calculated logic
    if ((collection as any).collection_type) {
      const dbType = (collection as any).collection_type;
      return dbType.charAt(0).toUpperCase() + dbType.slice(1); // Capitalize first letter
    }
    
    // Fallback to calculated logic
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
      
      {/* Follow/Unfollow button in top right corner - only show if user is not already following, a member, or the creator */}
      {showFollowButton && collection.is_public && onFollowToggle && !(collection.isFollowing || isUserMember || isUserCreator) && (
        <TouchableOpacity 
          style={styles.followButtonTopRight}
          onPress={() => onFollowToggle(collection.id, false)}
          activeOpacity={0.8}
        >
          <Text style={styles.followButtonText}>
            Follow
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Following badge for public collections */}
      {collection.is_public && (collection.isFollowing || isUserMember) && (
        <View style={styles.followingBadge}>
          <Text style={styles.followingBadgeText}>Following</Text>
        </View>
      )}
      
      <View style={[
        styles.content,
        /* Extend content area for private collections to move text up */
        !(collection.is_public || totalMembers > 1) && styles.contentPrivate
      ]}>
        <Text style={styles.name} numberOfLines={2}>{collection.name}</Text>
        <Text style={styles.count}>{finalRestaurantCount} places</Text>
        {collection.description && (
          <Text style={styles.description} numberOfLines={1}>
            {collection.description}
          </Text>
        )}
      </View>
      
      <View style={styles.footer}>
        {/* Show members for public and shared collections only */}
        {(collection.is_public || totalMembers > 1) && (
          <View style={styles.stat}>
            <Users size={14} color="#FFF" />
            <Text style={[styles.statText, { 
              fontWeight: 'bold', 
              fontSize: 14
            }]}>
              {memberCountText}
            </Text>
          </View>
        )}
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
  contentPrivate: {
    paddingBottom: 24, // Extend content area down more for private collections
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