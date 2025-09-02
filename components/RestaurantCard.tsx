import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Heart, MapPin, DollarSign, Clock, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { capitalizeRestaurantName, formatNeighborhoodName } from '@/utils/text-formatting';
import { useRestaurants } from '@/hooks/restaurant-store';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

export function RestaurantCard({ restaurant, onPress, compact = false, showRemoveButton = false, onRemove }: RestaurantCardProps) {
  const { favoriteRestaurants, toggleFavorite } = useRestaurants();
  const isFavorite = favoriteRestaurants.includes(restaurant.id);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  // Debug: Log restaurant data for Google Places enhancement
  console.log(`[RestaurantCard] Rendering: ${restaurant.name}`);
  console.log(`  - Rating: ${restaurant.rating}, Google Rating: ${restaurant.googleRating}`);
  console.log(`  - Images: ${restaurant.images?.length || 0}, Google Photos: ${restaurant.googlePhotos ? 'Yes' : 'No'}`);
  console.log(`  - Editorial Summary: ${restaurant.editorialSummary ? 'Yes' : 'No'}`);
  console.log(`  - Google Place ID: ${restaurant.googlePlaceId ? 'Yes' : 'No'}`);
  console.log(`  - Full restaurant object:`, restaurant);

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
    // Prioritize Google Places photos if available
    let images = [];
    
    // First, try Google Places photos
    if (restaurant.googlePhotos) {
      images.push(restaurant.googlePhotos);
    }
    
    // Then add any other images
    if (restaurant.images && restaurant.images.length > 0) {
      images = [...images, ...restaurant.images];
    }
    
    // Finally, add the main image URL if different
    if (restaurant.imageUrl && !images.includes(restaurant.imageUrl)) {
      images.push(restaurant.imageUrl);
    }
    
    console.log('[RestaurantCard] Raw images:', images);
    const validImages = images.filter(img => {
      const isValid = img && img.trim().length > 0 && img.startsWith('http');
      if (!isValid) {
        console.log('[RestaurantCard] Invalid image URL:', img);
      }
      return isValid;
    });
    console.log('[RestaurantCard] Valid images:', validImages);
    
    // If no valid images, generate a varied default based on restaurant name
    if (validImages.length === 0) {
      return [getVariedDefaultImage(restaurant)];
    }
    
    return validImages;
  };

  // Function to get varied default images based on restaurant name/cuisine
  const getVariedDefaultImage = (restaurant: Restaurant): string => {
    const name = restaurant.name.toLowerCase();
    const cuisine = restaurant.cuisine?.toLowerCase() || '';
    
    // Enhanced food category-based images with better variety
    const foodImages = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', // Restaurant interior
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', // Pizza
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', // Burger
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', // Sushi
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', // Pasta
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', // Japanese
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', // Mexican
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400', // Thai
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', // Indian
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', // American
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400', // Chinese
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', // Mediterranean
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400', // Korean
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', // French
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', // Fine dining
    ];
    
    // Use restaurant name to generate a consistent but varied image
    let imageIndex = 0;
    for (let i = 0; i < name.length; i++) {
      imageIndex += name.charCodeAt(i);
    }
    imageIndex = imageIndex % foodImages.length;
    
    // Enhanced cuisine-based overrides
    if (cuisine.includes('pizza') || name.includes('pizza')) {
      imageIndex = 1; // Pizza image
    } else if (cuisine.includes('burger') || name.includes('burger') || name.includes('king')) {
      imageIndex = 2; // Burger image
    } else if (cuisine.includes('sushi') || cuisine.includes('japanese') || name.includes('sushi')) {
      imageIndex = 3; // Sushi image
    } else if (cuisine.includes('italian') || name.includes('pasta') || name.includes('pizza')) {
      imageIndex = 4; // Italian image
    } else if (cuisine.includes('japanese') || name.includes('sushi') || name.includes('ramen')) {
      imageIndex = 5; // Japanese image
    } else if (cuisine.includes('mexican') || name.includes('taco') || name.includes('burrito')) {
      imageIndex = 6; // Mexican image
    } else if (cuisine.includes('thai') || name.includes('thai')) {
      imageIndex = 7; // Thai image
    } else if (cuisine.includes('indian') || name.includes('curry') || name.includes('tandoor')) {
      imageIndex = 8; // Indian image
    } else if (cuisine.includes('american') || name.includes('burger') || name.includes('diner')) {
      imageIndex = 9; // American image
    } else if (cuisine.includes('chinese') || name.includes('wok') || name.includes('dragon')) {
      imageIndex = 10; // Chinese image
    } else if (cuisine.includes('mediterranean') || name.includes('greek') || name.includes('falafel')) {
      imageIndex = 11; // Mediterranean image
    } else if (cuisine.includes('korean') || name.includes('bbq') || name.includes('seoul')) {
      imageIndex = 12; // Korean image
    } else if (cuisine.includes('french') || name.includes('bistro') || name.includes('le ')) {
      imageIndex = 13; // French image
    } else if (cuisine.includes('fine dining') || name.includes('steak') || name.includes('grill')) {
      imageIndex = 14; // Fine dining image
    }
    
    return foodImages[imageIndex];
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
    // Show Google Places rating if available and different from original
    const displayRating = restaurant.googleRating && restaurant.googleRating !== rating ? restaurant.googleRating : rating;
    const isGoogleRating = restaurant.googleRating && restaurant.googleRating !== rating;
    const hasGoogleData = restaurant.googlePlaceId || restaurant.googleRating || restaurant.googlePhotos;
    
    return (
      <View style={styles.ratingContainer}>
        <Text style={isGoogleRating ? [styles.ratingText, styles.googleRatingText] : styles.ratingText}>
          ★ {displayRating.toFixed(1)}
          {isGoogleRating && <Text style={styles.googleRatingLabel}> (Google)</Text>}
        </Text>
        {hasGoogleData && (
          <View style={styles.googleBadge}>
            <Text style={styles.googleBadgeText}>GP</Text>
          </View>
        )}
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
          <Text style={styles.compactName} numberOfLines={1}>{capitalizeRestaurantName(restaurant.name)}</Text>
          <Text style={styles.compactCuisine}>{restaurant.cuisine}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactPrice}>{formatPriceRange(restaurant.priceRange)}</Text>
            <Text style={styles.compactDot}>•</Text>
            <Text style={styles.compactNeighborhood}>{formatNeighborhoodName(restaurant.neighborhood)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleFavoritePress} style={styles.compactFavorite} activeOpacity={0.7}>
          <Heart 
            size={20} 
            color={isFavorite ? '#FF6B6B' : '#666'} 
            fill={isFavorite ? '#FF6B6B' : 'transparent'}
            strokeWidth={2}
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
        
        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton} activeOpacity={0.7}>
          <Heart 
            size={24} 
            color={isFavorite ? '#FF6B6B' : '#FFFFFF'} 
            fill={isFavorite ? '#FF6B6B' : 'transparent'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Header with name and rating on same row */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.name} numberOfLines={1}>{capitalizeRestaurantName(restaurant.name)}</Text>
            {renderStarRating(restaurant.rating || 0)}
          </View>
          
          {/* Vibe tags - moved closer to restaurant name */}
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
        </View>
        
        {/* Price and cuisine */}
        <Text style={styles.cuisine}>{formatPriceRange(restaurant.priceRange)} · {restaurant.cuisine}</Text>
        
        {/* Location and distance */}
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {`${restaurant.neighborhood || 'Unknown area'}${restaurant.distance ? ` • ${restaurant.distance}` : ''}`}
          </Text>
        </View>
        
        {/* Description */}
        {(restaurant.aiDescription || restaurant.description) && (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.aiDescription || restaurant.description}
          </Text>
        )}
        
        {/* Editorial Summary from Google Places */}
        {restaurant.editorialSummary && (
          <View style={styles.editorialContainer}>
            <Text style={styles.editorialSummary} numberOfLines={2}>
              {restaurant.editorialSummary}
            </Text>
            <Text style={styles.googleLabel}>Google Places</Text>
          </View>
        )}

        {/* User Notes */}
        {(() => {
          const userNotes = restaurant.userNotes;
          if (userNotes && typeof userNotes === 'string' && userNotes.trim() !== '') {
            return (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Your note:</Text>
                <Text style={styles.noteText}>{userNotes}</Text>
              </View>
            );
          }
          return null;
        })()}

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
                      {`• ${item}`}
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
    height: 180,
  },
  image: {
    width: '100%',
    height: 180,
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
    left: 16,
  },
  nextButton: {
    right: 16,
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
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 6,
  },
  headerTop: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  googleRatingText: {
    color: '#4A90E2',
  },
  googleRatingLabel: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '400',
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
  vibeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: 4,
  },
  vibeTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  vibeText: {
    fontSize: 10,
    color: '#0066CC',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#717171',
    lineHeight: 18,
    marginBottom: 6,
  },
  editorialSummary: {
    fontSize: 13,
    color: '#4A90E2',
    lineHeight: 18,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  editorialContainer: {
    marginBottom: 6,
  },
  googleLabel: {
    fontSize: 10,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 2,
  },
  googleBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },
  googleBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  topPicksContainer: {
    marginTop: 6,
    marginBottom: 6,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  topPicksLabel: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 4,
  },
  topPicksList: {
    flexDirection: 'column',
  },
  topPickText: {
    fontSize: 12,
    color: '#717171',
    fontWeight: '400',
    marginBottom: 3,
  },
  noteContainer: {
    marginTop: 6,
    padding: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
  },
  noteLabel: {
    fontSize: 12,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
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
