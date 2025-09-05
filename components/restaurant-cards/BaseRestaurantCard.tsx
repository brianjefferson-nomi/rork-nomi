import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin, ChevronLeft, ChevronRight, Star, X } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useUnifiedImages } from '@/hooks/use-unified-images';

interface BaseRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  showFavoriteButton?: boolean;
  children?: React.ReactNode;
}

export function BaseRestaurantCard({ 
  restaurant, 
  onPress, 
  compact = false, 
  onRemove, 
  showRemoveButton = false,
  showFavoriteButton = true,
  children 
}: BaseRestaurantCardProps) {
  const { favoriteRestaurants, toggleFavorite } = useRestaurants();
  const isFavorite = favoriteRestaurants.includes(restaurant.id);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  
  // Use unified images hook
  const { images, hasUploadedPhotos, uploadedPhotoCount } = useUnifiedImages(restaurant);

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

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Use unified images from the hook
  const hasMultipleImages = images.length > 1;

  // Format price range to show proper dollar signs
  const formatPriceRange = (priceRange: string | undefined) => {
    if (!priceRange || typeof priceRange !== 'string') return '$$';
    // Remove any non-dollar sign characters and ensure it's only $ symbols
    const cleanPrice = priceRange.replace(/[^$]/g, '');
    return cleanPrice.length > 0 ? cleanPrice : '$$';
  };

  // Get the best available rating (prioritize Google > TripAdvisor > original)
  const getBestRating = (restaurant: any): number => {
    // Priority: Google > TripAdvisor > original
    if (restaurant.googleRating && restaurant.googleRating > 0) {
      return Number(restaurant.googleRating);
    }
    if (restaurant.tripadvisor_rating && restaurant.tripadvisor_rating > 0) {
      return Number(restaurant.tripadvisor_rating);
    }
    return Number(restaurant.rating) || 0;
  };

  // Create star rating component
  const renderStarRating = (rating: number) => {
    const bestRating = getBestRating(restaurant);
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>★ {bestRating.toFixed(1)}</Text>
      </View>
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <TouchableOpacity style={styles.compactCardContent} onPress={onPress} activeOpacity={0.9}>
          <Image 
            source={{ uri: images[0] }} 
            style={styles.compactImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }}
          />
          <View style={styles.compactContent}>
            <Text style={styles.compactName} numberOfLines={1}>{restaurant?.name || 'Restaurant'}</Text>
            <Text style={styles.compactCuisine}>{restaurant?.cuisine || 'Cuisine'}</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactPrice}>{formatPriceRange(restaurant?.priceRange)}</Text>
              <Text style={styles.compactDot}>•</Text>
              <Text style={styles.compactNeighborhood}>{restaurant?.neighborhood || 'Location'}</Text>
              {(restaurant as any)?.distance_display && (
                <>
                  <Text style={styles.compactDot}>•</Text>
                  <Text style={styles.compactDistance}>{(restaurant as any).distance_display}</Text>
                </>
              )}
            </View>
          </View>
          {showFavoriteButton && (
            <TouchableOpacity onPress={handleFavoritePress} style={styles.compactFavorite}>
              <Heart 
                size={20} 
                color={isFavorite ? '#FF6B6B' : '#999'} 
                fill={isFavorite ? '#FF6B6B' : 'transparent'}
              />
            </TouchableOpacity>
          )}
          {showRemoveButton && onRemove && (
            <TouchableOpacity onPress={handleRemovePress} style={styles.compactRemoveButton}>
              <X size={16} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardContent} onPress={onPress} activeOpacity={0.95}>
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
                      index === currentImageIndex ? styles.activeIndicator : styles.inactiveIndicator
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.name} numberOfLines={1}>{restaurant?.name || 'Restaurant'}</Text>
              {getBestRating(restaurant) > 0 && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>★ {getBestRating(restaurant).toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View style={styles.actions}>
              {showFavoriteButton && (
                <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
                  <Heart 
                    size={20} 
                    color={isFavorite ? '#FF6B6B' : '#999'} 
                    fill={isFavorite ? '#FF6B6B' : 'transparent'}
                  />
                </TouchableOpacity>
              )}
              {showRemoveButton && onRemove && (
                <TouchableOpacity onPress={handleRemovePress} style={styles.removeButton}>
                  <X size={16} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.details}>
            <View style={styles.infoRow}>
              <Text style={styles.price}>{formatPriceRange(restaurant?.priceRange)}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.cuisine}>{restaurant?.cuisine || 'Cuisine'}</Text>
            </View>
            
            {restaurant?.neighborhood && (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#666" />
                <Text style={styles.locationText}>
                  {restaurant.neighborhood}
                  {(restaurant as any)?.distance_display && ` • ${(restaurant as any).distance_display}`}
                </Text>
              </View>
            )}
            
            {restaurant?.description && (
              <Text style={styles.description} numberOfLines={2}>
                {restaurant.description}
              </Text>
            )}
          </View>
          
          {/* Custom content from children */}
          {children}
        </View>
      </TouchableOpacity>
    </View>
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
  cardContent: {
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
  inactiveIndicator: {
    backgroundColor: 'rgba(255,255,255,0.5)',
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
    right: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 6,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cuisine: {
    fontSize: 13,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#717171',
    marginLeft: 4,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: '#717171',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  dot: {
    fontSize: 12,
    color: '#717171',
    marginHorizontal: 6,
  },
  details: {
    marginTop: 6,
  },
  // Compact card styles
  compactCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactCardContent: {
    flexDirection: 'row',
    padding: 12,
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
  compactDistance: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  compactFavorite: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  compactRemoveButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
