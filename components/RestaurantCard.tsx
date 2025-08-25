import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { useRestaurants } from '@/hooks/restaurant-store';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
}

export function RestaurantCard({ restaurant, onPress, compact = false }: RestaurantCardProps) {
  const { favoriteRestaurants, toggleFavorite } = useRestaurants();
  const isFavorite = favoriteRestaurants.includes(restaurant.id);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(restaurant.id);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.log('[RestaurantCard] Image failed to load:', images[currentImageIndex]);
  };

  // Ensure we have valid images with fallbacks
  const getValidImages = () => {
    const images = restaurant.images || [restaurant.imageUrl];
    console.log('[RestaurantCard] Raw images:', images);
    const validImages = images.filter(img => {
      const isValid = img && img.trim().length > 0 && img.startsWith('http');
      if (!isValid) {
        console.log('[RestaurantCard] Invalid image URL:', img);
      }
      return isValid;
    });
    console.log('[RestaurantCard] Valid images:', validImages);
    return validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'];
  };

  const images = getValidImages();
  const hasMultipleImages = images.length > 1;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
        <Image 
          source={{ uri: images[0] }} 
          style={styles.compactImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{restaurant.name}</Text>
          <Text style={styles.compactCuisine}>{restaurant.cuisine}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactPrice}>{restaurant.priceRange}</Text>
            <Text style={styles.compactDot}>•</Text>
            <Text style={styles.compactNeighborhood}>{restaurant.neighborhood}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleFavoritePress} style={styles.compactFavorite}>
          <Heart 
            size={20} 
            color={isFavorite ? '#FF6B6B' : '#999'} 
            fill={isFavorite ? '#FF6B6B' : 'transparent'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: images[currentImageIndex] }} 
          style={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }}
        />
        
        {hasMultipleImages && (
          <>
            <TouchableOpacity onPress={prevImage} style={[styles.imageNavButton, styles.prevButton]}>
              <ChevronLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextImage} style={[styles.imageNavButton, styles.nextButton]}>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          </>
        )}
        
        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
          <Heart 
            size={24} 
            color={isFavorite ? '#FF6B6B' : '#FFF'} 
            fill={isFavorite ? '#FF6B6B' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>★ {restaurant.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        
        <View style={styles.locationInfo}>
          <MapPin size={14} color="#666" />
          <Text style={styles.neighborhood} numberOfLines={1}>{restaurant.neighborhood}</Text>
          {restaurant.distance && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.distance}>{restaurant.distance}</Text>
            </>
          )}
        </View>
        
        <View style={styles.details}>
          <Text style={styles.price}>{restaurant.priceRange}</Text>
          <Text style={styles.dot}>•</Text>
          <Clock size={14} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>{restaurant.hours ? restaurant.hours.split(' ')[0] : 'Hours vary'}</Text>
        </View>
        
        <View style={styles.vibeContainer}>
          {(restaurant.aiVibes || restaurant.vibe || []).slice(0, 3).map((v, i) => {
            // Ensure single word and capitalized with safety checks
            if (!v || typeof v !== 'string' || v.trim().length === 0) return null;
            const firstWord = v.split(' ')[0];
            if (!firstWord || firstWord.length === 0) return null;
            const firstChar = firstWord.charAt(0);
            const restOfWord = firstWord.slice(1);
            const cleanTag = (firstChar ? firstChar.toUpperCase() : '') + (restOfWord ? restOfWord.toLowerCase() : '');
            if (!cleanTag || cleanTag.length === 0) return null;
            return (
              <View key={i} style={styles.vibeTag}>
                <Text style={styles.vibeText}>{cleanTag}</Text>
              </View>
            );
          })}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {restaurant.aiDescription || restaurant.description}
        </Text>
        
        {restaurant.aiTopPicks && Array.isArray(restaurant.aiTopPicks) && restaurant.aiTopPicks.length > 0 && (
          <View style={styles.topPicksContainer}>
            <Text style={styles.topPicksLabel}>Top picks:</Text>
            <Text style={styles.topPicksText} numberOfLines={1}>
              {restaurant.aiTopPicks.slice(0, 2).filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        {restaurant.userNotes && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Your note:</Text>
            <Text style={styles.noteText}>{restaurant.userNotes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: 240,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    padding: 10,
    zIndex: 2,
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 10,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  rating: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  vibeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  vibeTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  vibeText: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  noteContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
  },
  noteLabel: {
    fontSize: 12,
    color: '#D4A574',
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  topPicksContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  topPicksLabel: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 4,
  },
  topPicksText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  // Compact card styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  compactImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  compactContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  compactCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactPrice: {
    fontSize: 13,
    color: '#999',
  },
  compactDot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 8,
  },
  compactNeighborhood: {
    fontSize: 13,
    color: '#999',
  },
  compactFavorite: {
    justifyContent: 'center',
    paddingLeft: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  neighborhood: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    color: '#999',
    marginRight: 6,
  },
  dot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 6,
  },
  distance: {
    fontSize: 14,
    color: '#999',
  },
});