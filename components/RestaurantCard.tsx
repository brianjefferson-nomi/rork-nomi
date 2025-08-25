import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin, DollarSign, Clock, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
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

  // Format price range to show proper dollar signs
  const formatPriceRange = (priceRange: string | undefined) => {
    if (!priceRange || typeof priceRange !== 'string') return '$$';
    // Remove any non-dollar sign characters and ensure it's only $ symbols
    const cleanPrice = priceRange.replace(/[^$]/g, '');
    return cleanPrice.length > 0 ? cleanPrice : '$$';
  };

  // Format hours to show days open
  const formatHours = (hours: string) => {
    if (!hours) return 'Hours vary';
    
    // Common patterns for days
    const dayPatterns = {
      'daily': 'Daily',
      'mon-fri': 'Mon-Fri',
      'monday-friday': 'Mon-Fri',
      'tuesday-saturday': 'Tue-Sat',
      'wednesday-sunday': 'Wed-Sun',
      'thursday-monday': 'Thu-Mon',
      'friday-tuesday': 'Fri-Tue',
      'saturday-wednesday': 'Sat-Wed',
      'sunday-thursday': 'Sun-Thu'
    };
    
    const lowerHours = hours.toLowerCase();
    
    // Check for specific day patterns
    for (const [pattern, display] of Object.entries(dayPatterns)) {
      if (lowerHours.includes(pattern)) {
        return display;
      }
    }
    
    // Check for individual days
    if (lowerHours.includes('monday') || lowerHours.includes('mon')) return 'Mon';
    if (lowerHours.includes('tuesday') || lowerHours.includes('tue')) return 'Tue';
    if (lowerHours.includes('wednesday') || lowerHours.includes('wed')) return 'Wed';
    if (lowerHours.includes('thursday') || lowerHours.includes('thu')) return 'Thu';
    if (lowerHours.includes('friday') || lowerHours.includes('fri')) return 'Fri';
    if (lowerHours.includes('saturday') || lowerHours.includes('sat')) return 'Sat';
    if (lowerHours.includes('sunday') || lowerHours.includes('sun')) return 'Sun';
    
    // If no specific pattern found, return first word or default
    const firstWord = hours.split(' ')[0];
    return firstWord && firstWord.length > 0 ? firstWord : 'Hours vary';
  };

  // Create star rating component
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={12} color="#FFD700" fill="#FFD700" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={12} color="#FFD700" fill="#FFD700" />
      );
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={12} color="#E5E5E5" fill="transparent" />
      );
    }
    
    return (
      <View style={styles.starContainer}>
        {stars}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

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
            <Text style={styles.compactPrice}>{formatPriceRange(restaurant.priceRange)}</Text>
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
        {/* Airbnb-style header with rating and price */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            <Text style={styles.price}>{formatPriceRange(restaurant.priceRange)}</Text>
          </View>
          
          <View style={styles.ratingRow}>
            {renderStarRating(restaurant.rating || 0)}
            <Text style={styles.reviewCount}>
              {restaurant.reviews?.length || 0} reviews
            </Text>
          </View>
        </View>
        
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        
        {/* Vibe tags - prominently displayed */}
        {(restaurant.aiVibes || restaurant.vibe || []).length > 0 && (
          <View style={styles.vibeContainer}>
            {(restaurant.aiVibes || restaurant.vibe || []).slice(0, 4).map((v, i) => {
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
        )}
        
        {/* Location and distance */}
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {restaurant.neighborhood}
            {restaurant.distance && ` • ${restaurant.distance}`}
          </Text>
        </View>
        
        {/* Hours */}
        <View style={styles.hoursRow}>
          <Clock size={14} color="#666" />
          <Text style={styles.hoursText}>{formatHours(restaurant.hours)}</Text>
        </View>
        
        {/* Description */}
        {(restaurant.aiDescription || restaurant.description) && (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.aiDescription || restaurant.description}
          </Text>
        )}
        
        {/* Top Picks */}
        {(restaurant.aiTopPicks || restaurant.menuHighlights) && 
         ((restaurant.aiTopPicks?.length || 0) > 0 || (restaurant.menuHighlights?.length || 0) > 0) && (
          <View style={styles.topPicksContainer}>
            <Text style={styles.topPicksLabel}>🔥 Popular dishes</Text>
            <View style={styles.topPicksList}>
              {[...(restaurant.aiTopPicks || []), ...(restaurant.menuHighlights || [])]
                .slice(0, 2)
                .filter(Boolean)
                .map((item, index) => (
                  <Text key={index} style={styles.topPickText} numberOfLines={1}>
                    • {item}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {/* User Notes */}
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  prevButton: {
    left: 12,
  },
  nextButton: {
    right: 12,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFF',
    width: 18,
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
    flex: 1,
    marginRight: 8,
    lineHeight: 24,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#222222',
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '400',
  },
  cuisine: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#717171',
    marginLeft: 4,
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 14,
    color: '#717171',
    marginLeft: 4,
  },
  vibeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  vibeTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  vibeText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#717171',
    lineHeight: 20,
    marginBottom: 12,
  },
  topPicksContainer: {
    marginBottom: 8,
  },
  topPicksLabel: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 6,
  },
  topPicksList: {
    flexDirection: 'column',
  },
  topPickText: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 4,
  },
  noteContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  noteLabel: {
    fontSize: 12,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#717171',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // Compact card styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 4,
  },
  compactCuisine: {
    fontSize: 13,
    color: '#717171',
    marginBottom: 6,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  compactDot: {
    fontSize: 12,
    color: '#717171',
    marginHorizontal: 6,
  },
  compactNeighborhood: {
    fontSize: 13,
    color: '#717171',
  },
  compactFavorite: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
});