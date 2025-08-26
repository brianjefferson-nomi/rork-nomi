import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Users, Heart } from 'lucide-react-native';
import { Collection } from '@/types/restaurant';
import { useCollectionRestaurants } from '@/hooks/restaurant-store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
}

export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  const restaurants = useCollectionRestaurants(collection.id);
  
  // Enhanced data validation and fallbacks
  const restaurantCount = restaurants && Array.isArray(restaurants) ? restaurants.length : 0;
  const collaboratorCount = collection.collaborators && Array.isArray(collection.collaborators) ? collection.collaborators.length : 0;
  const totalMembers = collaboratorCount + 1; // +1 for the creator
  const likeCount = collection.likes || 0;
  
  // Determine collection type for display
  const getCollectionType = () => {
    if (collection.is_public) return 'Public';
    if (collaboratorCount > 0) return 'Shared';
    return 'Private';
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ 
          uri: collection.cover_image || collection.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' 
        }} 
        style={styles.image} 
      />
      <View style={styles.overlay} />
      
      {/* Collection type badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{getCollectionType()}</Text>
      </View>
      
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
        <View style={styles.stat}>
          <Heart size={14} color="#FFF" fill="#FFF" />
          <Text style={styles.statText}>{likeCount}</Text>
        </View>
        <View style={styles.stat}>
          <Users size={14} color="#FFF" />
          <Text style={styles.statText}>{totalMembers}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
    padding: 12,
    justifyContent: 'flex-end',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 12,
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
    marginTop: 2,
  },
});