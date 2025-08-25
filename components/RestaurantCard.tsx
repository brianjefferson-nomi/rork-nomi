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

  // Create star rating component - using original store design
  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
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
        {/* Header with name and rating on same row */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            {renderStarRating(restaurant.rating || 0)}
          </View>
        </View>
        
        {/* Vibe tags */}
        {(() => {
          const vibeTags = restaurant.aiVibes || restaurant.vibe || [];
          console.log(`[RestaurantCard] Vibe tags for ${restaurant.name}:`, vibeTags);
          
          // Generate more specific vibe tags based on restaurant characteristics
          const generateSpecificTags = () => {
            const description = (restaurant.aiDescription || restaurant.description || '').toLowerCase();
            const cuisine = restaurant.cuisine.toLowerCase();
            const priceRange = restaurant.priceRange;
            const name = restaurant.name.toLowerCase();
            
            const specificTags = [];
            
            // Price-based tags
            if (priceRange === '$$$$') {
              specificTags.push('Luxury', 'Fine Dining');
            } else if (priceRange === '$$$') {
              specificTags.push('Upscale', 'Sophisticated');
            } else if (priceRange === '$$') {
              specificTags.push('Casual', 'Comfortable');
            } else {
              specificTags.push('Affordable', 'Quick Bite');
            }
            
            // Cuisine-based tags
            if (cuisine.includes('italian')) {
              specificTags.push('Authentic', 'Traditional');
            } else if (cuisine.includes('japanese') || cuisine.includes('sushi')) {
              specificTags.push('Fresh', 'Artisanal');
            } else if (cuisine.includes('mexican')) {
              specificTags.push('Spicy', 'Vibrant');
            } else if (cuisine.includes('french')) {
              specificTags.push('Elegant', 'Refined');
            } else if (cuisine.includes('american')) {
              specificTags.push('Classic', 'Comfort');
            } else if (cuisine.includes('thai')) {
              specificTags.push('Aromatic', 'Bold');
            } else if (cuisine.includes('indian')) {
              specificTags.push('Spiced', 'Rich');
            }
            
            // Description-based tags
            if (description.includes('romantic') || description.includes('intimate')) {
              specificTags.push('Romantic');
            }
            if (description.includes('cozy') || description.includes('warm')) {
              specificTags.push('Cozy');
            }
            if (description.includes('trendy') || description.includes('modern')) {
              specificTags.push('Trendy');
            }
            if (description.includes('rustic') || description.includes('farm')) {
              specificTags.push('Rustic');
            }
            if (description.includes('elegant') || description.includes('sophisticated')) {
              specificTags.push('Elegant');
            }
            if (description.includes('bustling') || description.includes('energetic')) {
              specificTags.push('Bustling');
            }
            if (description.includes('quiet') || description.includes('serene')) {
              specificTags.push('Serene');
            }
            if (description.includes('authentic') || description.includes('traditional')) {
              specificTags.push('Authentic');
            }
            if (description.includes('innovative') || description.includes('creative')) {
              specificTags.push('Innovative');
            }
            if (description.includes('family') || description.includes('friendly')) {
              specificTags.push('Family-friendly');
            }
            if (description.includes('date') || description.includes('romantic')) {
              specificTags.push('Date Night');
            }
            if (description.includes('business') || description.includes('professional')) {
              specificTags.push('Business');
            }
            if (description.includes('outdoor') || description.includes('patio')) {
              specificTags.push('Outdoor');
            }
            if (description.includes('rooftop') || description.includes('view')) {
              specificTags.push('Rooftop');
            }
            if (description.includes('historic') || description.includes('landmark')) {
              specificTags.push('Historic');
            }
            if (description.includes('local') || description.includes('neighborhood')) {
              specificTags.push('Local');
            }
            if (description.includes('organic') || description.includes('farm-to-table')) {
              specificTags.push('Farm-to-table');
            }
            if (description.includes('vegan') || description.includes('vegetarian')) {
              specificTags.push('Plant-based');
            }
            
            // Remove duplicates and limit to 4 tags
            const uniqueTags = [...new Set(specificTags)];
            return uniqueTags.slice(0, 4);
          };
          
          // Use specific tags if available, otherwise fallback to default
          const displayTags = vibeTags.length > 0 ? vibeTags : generateSpecificTags();
          
          return (
            <View style={styles.vibeContainer}>
              {(() => {
                const validTags = displayTags.slice(0, 4)
                  .filter(v => v && typeof v === 'string' && v.trim().length > 0)
                  .map(v => {
                    const firstWord = v.split(' ')[0];
                    if (!firstWord || firstWord.length === 0) return null;
                    const firstChar = firstWord.charAt(0);
                    const restOfWord = firstWord.slice(1);
                    const cleanTag = (firstChar ? firstChar.toUpperCase() : '') + (restOfWord ? restOfWord.toLowerCase() : '');
                    if (!cleanTag || cleanTag.length === 0) return null;
                    return cleanTag;
                  })
                  .filter(Boolean);
                
                return validTags.map((cleanTag, i) => (
                  <View key={i} style={styles.vibeTag}>
                    <Text style={styles.vibeText}>{cleanTag}</Text>
                  </View>
                ));
              })()}
            </View>
          );
        })()}
        
        {/* Price and cuisine */}
        <Text style={styles.cuisine}>{formatPriceRange(restaurant.priceRange)} · {restaurant.cuisine}</Text>
        
        {/* Location and distance */}
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {restaurant.neighborhood}
            {restaurant.distance && ` • ${restaurant.distance}`}
          </Text>
        </View>
        
        {/* Description */}
        {(restaurant.aiDescription || restaurant.description) && (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.aiDescription || restaurant.description}
          </Text>
        )}

        {/* User Notes */}
        {restaurant.userNotes && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Your note:</Text>
            <Text style={styles.noteText}>{restaurant.userNotes}</Text>
          </View>
        )}

        {/* Top Picks - only show if there are actual menu highlights */}
        {(() => {
          // Only show if there are actual menu highlights (not generated/fallback dishes)
          const menuHighlights = restaurant.menuHighlights || [];
          const aiTopPicks = restaurant.aiTopPicks || [];
          
          // Filter out generic dishes and only show specific menu items
          const filterGenericDishes = (dishes: string[]) => {
            const genericTerms = [
              'chef special', 'house favorite', 'seasonal dish', 'signature dish', 
              'popular item', 'daily special', 'chef\'s choice', 'house special',
              'special', 'favorite', 'dish', 'item', 'choice', 'recommended'
            ];
            
            return dishes.filter(dish => {
              const lowerDish = dish.toLowerCase();
              return !genericTerms.some(term => lowerDish.includes(term));
            });
          };
          
          // Only use actual menu highlights, not generated dishes
          const actualMenuItems = [
            ...filterGenericDishes(menuHighlights),
            ...filterGenericDishes(aiTopPicks)
          ];
          
          // If no actual menu items, don't show the section
          if (actualMenuItems.length === 0) {
            return null;
          }
          
          return (
            <View style={styles.topPicksContainer}>
              <Text style={styles.topPicksLabel}>🔥 Popular dishes</Text>
              <View style={styles.topPicksList}>
                {actualMenuItems
                  .slice(0, 2)
                  .filter(Boolean)
                  .map((item, index) => (
                    <Text key={index} style={styles.topPickText} numberOfLines={1}>
                      • {item}
                    </Text>
                  ))}
              </View>
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
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
    height: 280,
  },
  image: {
    width: '100%',
    height: 280,
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
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222222',
    flex: 1,
    marginRight: 8,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  cuisine: {
    fontSize: 15,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 10,
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
  vibeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
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
    fontSize: 15,
    color: '#717171',
    lineHeight: 22,
    marginBottom: 16,
  },
  topPicksContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  topPicksLabel: {
    fontSize: 15,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 8,
  },
  topPicksList: {
    flexDirection: 'column',
  },
  topPickText: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 6,
  },
  noteContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  noteLabel: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#717171',
    fontStyle: 'italic',
    lineHeight: 20,
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