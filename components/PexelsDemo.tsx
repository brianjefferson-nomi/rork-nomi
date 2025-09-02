import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Search, Image as ImageIcon, RefreshCw } from 'lucide-react-native';
import { usePexelsImage, usePexelsImages } from '@/hooks/use-pexels-images';
import { PexelsImageComponent } from './PexelsImage';

export function PexelsDemo() {
  const [searchQuery, setSearchQuery] = useState('pizza');
  
  // Example: Single image for a cuisine
  const { image: cuisineImage, isLoading: cuisineLoading, error: cuisineError, refetch: refetchCuisine } = usePexelsImage(
    'pizza',
    'cuisine'
  );
  
  // Example: Collection cover image
  const { image: collectionImage, isLoading: collectionLoading, error: collectionError, refetch: refetchCollection } = usePexelsImage(
    "LA's Hidden Gems",
    'collection',
    { cuisines: ['Mexican', 'Italian'], city: 'Los Angeles' }
  );
  
  // Example: Neighborhood image
  const { image: neighborhoodImage, isLoading: neighborhoodLoading, error: neighborhoodError, refetch: refetchNeighborhood } = usePexelsImage(
    'Hollywood',
    'neighborhood',
    { city: 'Los Angeles' }
  );
  
  // Example: City image
  const { image: cityImage, isLoading: cityLoading, error: cityError, refetch: refetchCity } = usePexelsImage(
    'New York',
    'city'
  );
  
  // Example: Multiple images
  const { images: multipleImages, isLoading: multipleLoading, error: multipleError, refetch: refetchMultiple } = usePexelsImages(
    ['sushi', 'ramen', 'dumplings'],
    'cuisine'
  );

  const handleRefresh = (type: string) => {
    switch (type) {
      case 'cuisine':
        refetchCuisine();
        break;
      case 'collection':
        refetchCollection();
        break;
      case 'neighborhood':
        refetchNeighborhood();
        break;
      case 'city':
        refetchCity();
        break;
      case 'multiple':
        refetchMultiple();
        break;
    }
    Alert.alert('Refreshed', `Refreshed ${type} images`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pexels Image Integration Demo</Text>
      
      {/* Cuisine Image */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cuisine Image (Pizza)</Text>
          <TouchableOpacity onPress={() => handleRefresh('cuisine')} style={styles.refreshButton}>
            <RefreshCw size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <PexelsImageComponent
          image={cuisineImage}
          isLoading={cuisineLoading}
          error={cuisineError}
          style={styles.demoImage}
          showLoadingIndicator={true}
        />
        {cuisineError && <Text style={styles.errorText}>Error: {cuisineError}</Text>}
      </View>

      {/* Collection Cover Image */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collection Cover (LA's Hidden Gems)</Text>
          <TouchableOpacity onPress={() => handleRefresh('collection')} style={styles.refreshButton}>
            <RefreshCw size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <PexelsImageComponent
          image={collectionImage}
          isLoading={collectionLoading}
          error={collectionError}
          style={styles.demoImage}
          showLoadingIndicator={true}
        />
        {collectionError && <Text style={styles.errorText}>Error: {collectionError}</Text>}
      </View>

      {/* Neighborhood Image */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Neighborhood (Hollywood, LA)</Text>
          <TouchableOpacity onPress={() => handleRefresh('neighborhood')} style={styles.refreshButton}>
            <RefreshCw size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <PexelsImageComponent
          image={neighborhoodImage}
          isLoading={neighborhoodLoading}
          error={neighborhoodError}
          style={styles.demoImage}
          showLoadingIndicator={true}
        />
        {neighborhoodError && <Text style={styles.errorText}>Error: {neighborhoodError}</Text>}
      </View>

      {/* City Image */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>City (New York)</Text>
          <TouchableOpacity onPress={() => handleRefresh('city')} style={styles.refreshButton}>
            <RefreshCw size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <PexelsImageComponent
          image={cityImage}
          isLoading={cityLoading}
          error={cityError}
          style={styles.demoImage}
          showLoadingIndicator={true}
        />
        {cityError && <Text style={styles.errorText}>Error: {cityError}</Text>}
      </View>

      {/* Multiple Images */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Multiple Cuisine Images</Text>
          <TouchableOpacity onPress={() => handleRefresh('multiple')} style={styles.refreshButton}>
            <RefreshCw size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {multipleImages.map((image, index) => (
            <View key={index} style={styles.multipleImageContainer}>
              <PexelsImageComponent
                image={image}
                isLoading={multipleLoading}
                error={multipleError}
                style={styles.multipleImage}
                showLoadingIndicator={false}
              />
              <Text style={styles.imageLabel}>Image {index + 1}</Text>
            </View>
          ))}
        </ScrollView>
        {multipleError && <Text style={styles.errorText}>Error: {multipleError}</Text>}
      </View>

      <Text style={styles.footer}>
        All images are fetched from Pexels API and cached for performance.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  demoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  horizontalScroll: {
    marginHorizontal: -8,
  },
  multipleImageContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
  multipleImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  imageLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 32,
  },
});

export default PexelsDemo;
