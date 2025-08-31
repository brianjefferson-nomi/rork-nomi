import React from 'react';
import { Restaurant } from '@/types/restaurant';
import { BaseRestaurantCard } from './BaseRestaurantCard';

interface SimpleRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  showFavoriteButton?: boolean;
}

export function SimpleRestaurantCard({ 
  restaurant, 
  onPress, 
  compact = false, 
  onRemove, 
  showRemoveButton = false,
  showFavoriteButton = true
}: SimpleRestaurantCardProps) {
  
  return (
    <BaseRestaurantCard
      restaurant={restaurant}
      onPress={onPress}
      compact={compact}
      onRemove={onRemove}
      showRemoveButton={showRemoveButton}
      showFavoriteButton={showFavoriteButton}
    />
  );
}
