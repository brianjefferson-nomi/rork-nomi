import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Users } from 'lucide-react-native';
import { usePexelsImage } from '@/hooks/use-pexels-images';
import { PexelsImageComponent } from './PexelsImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface NeighborhoodCardProps {
  neighborhood: string;
  city: string;
  restaurantCount: number;
  onPress: () => void;
}

export function NeighborhoodCard({ 
  neighborhood, 
  city, 
  restaurantCount, 
  onPress 
}: NeighborhoodCardProps) {
  // Get Pexels image for neighborhood
  const { image: pexelsImage, isLoading: imageLoading, error: imageError } = usePexelsImage(
    neighborhood,
    'neighborhood',
    { city }
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <PexelsImageComponent
        image={pexelsImage}
        isLoading={imageLoading}
        error={imageError}
        style={styles.image}
        fallbackSource={{ 
          uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400' 
        }}
        showLoadingIndicator={false}
      />
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{neighborhood}</Text>
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.count}>{restaurantCount} places</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.stat}>
          <MapPin size={14} color="#FFF" />
          <Text style={styles.statText}>{neighborhood}</Text>
        </View>
        <View style={styles.stat}>
          <Users size={14} color="#FFF" />
          <Text style={styles.statText}>{restaurantCount}</Text>
        </View>
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
    marginBottom: 12,
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
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  city: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
});

export default NeighborhoodCard;
