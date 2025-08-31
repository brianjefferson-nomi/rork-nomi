import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Restaurant } from '@/types/restaurant';
import { BaseRestaurantCard } from './BaseRestaurantCard';

interface CollectionRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export function CollectionRestaurantCard({ 
  restaurant, 
  onPress, 
  compact = false, 
  onRemove, 
  showRemoveButton = false 
}: CollectionRestaurantCardProps) {
  
  // Generate vibe tags based on restaurant characteristics
  const generateVibeTags = () => {
    if (!restaurant) return [];
    
    const vibeTags = restaurant.aiVibes || restaurant.vibe || [];
    
    // Generate more specific vibe tags based on restaurant characteristics
    const generateSpecificTags = () => {
      const description = (restaurant.aiDescription || restaurant.description || '').toLowerCase();
      const cuisine = (restaurant.cuisine || '').toLowerCase();
      const priceRange = restaurant.priceRange;
      const name = (restaurant.name || '').toLowerCase();
      
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
    
    return displayTags;
  };

  const vibeTags = generateVibeTags();

  // Filter out generic dishes and only show specific menu items
  const filterGenericDishes = (dishes: string[]) => {
    if (!dishes || !Array.isArray(dishes)) return [];
    
    const genericTerms = [
      'chef special', 'house favorite', 'seasonal dish', 'signature dish', 
      'popular item', 'daily special', 'chef\'s choice', 'house special',
      'special', 'favorite', 'dish', 'item', 'choice', 'recommended'
    ];
    
    return dishes.filter(dish => {
      if (!dish || typeof dish !== 'string') return false;
      const lowerDish = dish.toLowerCase();
      return !genericTerms.some(term => lowerDish.includes(term));
    });
  };

  const renderVibeTags = () => {
    if (!vibeTags || vibeTags.length === 0) return null;
    
    return (
      <View style={styles.vibeContainer}>
        {(() => {
          const validTags = vibeTags.slice(0, 4)
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
  };

  const renderDescription = () => {
    if (!restaurant) return null;
    if (!restaurant.aiDescription && !restaurant.description) return null;
    
    return (
      <Text style={styles.description} numberOfLines={2}>
        {restaurant.aiDescription || restaurant.description}
      </Text>
    );
  };

  const renderUserNotes = () => {
    if (!restaurant) return null;
    
    const userNotes = restaurant.userNotes;
    if (!userNotes || typeof userNotes !== 'string' || userNotes.trim() === '') return null;
    
    return (
      <View style={styles.noteContainer}>
        <Text style={styles.noteLabel}>Your note:</Text>
        <Text style={styles.noteText}>{userNotes}</Text>
      </View>
    );
  };

  const renderTopPicks = () => {
    if (!restaurant) return null;
    
    // Only show if there are actual menu highlights (not generated/fallback dishes)
    const menuHighlights = restaurant.menuHighlights || [];
    const aiTopPicks = restaurant.aiTopPicks || [];
    
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
  };

  return (
    <BaseRestaurantCard
      restaurant={restaurant}
      onPress={onPress}
      compact={compact}
      onRemove={onRemove}
      showRemoveButton={showRemoveButton}
    >
      {/* Vibe tags - moved closer to restaurant name */}
      {renderVibeTags()}
      
      {/* Description */}
      {renderDescription()}

      {/* User Notes */}
      {renderUserNotes()}

      {/* Top Picks - only show if there are actual menu highlights */}
      {renderTopPicks()}
    </BaseRestaurantCard>
  );
}

const styles = StyleSheet.create({
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
});
