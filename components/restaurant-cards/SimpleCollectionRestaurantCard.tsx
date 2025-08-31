import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { useRestaurants } from '@/hooks/restaurant-store';

interface SimpleCollectionRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

export function SimpleCollectionRestaurantCard({ 
  restaurant, 
  onPress, 
  showRemoveButton = false, 
  onRemove 
}: SimpleCollectionRestaurantCardProps) {
  const { favoriteRestaurants, toggleFavorite } = useRestaurants();
  const isFavorite = favoriteRestaurants.includes(restaurant.id);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(restaurant.id);
  };

  const handleRemovePress = (e: any) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  // Format price range to show proper dollar signs
  const formatPriceRange = (priceRange: string | undefined) => {
    if (!priceRange || typeof priceRange !== 'string') return '$$';
    const cleanPrice = priceRange.replace(/[^$]/g, '');
    return cleanPrice.length > 0 ? cleanPrice : '$$';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: restaurant.imageUrl || restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' 
          }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
          <Heart 
            size={20} 
            color={isFavorite ? '#FF6B6B' : '#FFF'} 
            fill={isFavorite ? '#FF6B6B' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Remove Button - Only show if user can manage restaurants */}
        {showRemoveButton && (
          <TouchableOpacity onPress={handleRemovePress} style={styles.removeButton}>
            <X size={16} color="#FFF" strokeWidth={3} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant?.name || 'Restaurant'}
        </Text>
        <Text style={styles.cuisine}>
          {formatPriceRange(restaurant?.priceRange)} • {restaurant?.cuisine || 'Restaurant'}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {restaurant?.neighborhood || restaurant?.location?.address || 'Location not available'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 44, // Position next to the heart button
    backgroundColor: 'rgba(255,107,107,0.9)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 4,
    lineHeight: 20,
  },
  cuisine: {
    fontSize: 13,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 3,
  },
  location: {
    fontSize: 13,
    color: '#717171',
    marginBottom: 0,
  },
});
