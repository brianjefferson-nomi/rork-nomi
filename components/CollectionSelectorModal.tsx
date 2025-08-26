import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { Database } from '@/services/supabase';

type Collection = Database['public']['Tables']['collections']['Row'];

const { width } = Dimensions.get('window');

interface CollectionSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  collections: Collection[];
  onSelectCollection: (collection: Collection) => void;
  onCreateCollection: () => void;
  restaurantName?: string;
}

export function CollectionSelectorModal({
  visible,
  onClose,
  collections,
  onSelectCollection,
  onCreateCollection,
  restaurantName
}: CollectionSelectorModalProps) {
  const getCollectionImage = (collection: Collection) => {
    // Use collection cover image if available, otherwise use a default
    if (collection.cover_image && collection.cover_image.startsWith('http')) {
      return collection.cover_image;
    }
    
    // Generate a default image based on collection name or occasion
    const defaultImages = [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400',
      'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400'
    ];
    
    // Use collection name to generate a consistent image
    const index = collection.name.length % defaultImages.length;
    return defaultImages[index];
  };

  const getSavedCount = (collection: Collection) => {
    return collection.restaurant_ids?.length || 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {restaurantName ? `Add "${restaurantName}" to collection` : 'Save to collection'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Collections Grid */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.collectionsGrid}>
            {collections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionCard}
                onPress={() => onSelectCollection(collection)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: getCollectionImage(collection) }}
                  style={styles.collectionImage}
                  resizeMode="cover"
                />
                <View style={styles.collectionOverlay}>
                  <Text style={styles.collectionName} numberOfLines={2}>
                    {collection.name}
                  </Text>
                  <Text style={styles.savedCount}>
                    {getSavedCount(collection)} saved
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Create Collection Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={onCreateCollection}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFF" />
            <Text style={styles.createButtonText}>Create collection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  collectionCard: {
    width: (width - 60) / 2, // 2 columns with padding
    height: 180,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  collectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  savedCount: {
    fontSize: 12,
    color: '#CCC',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
});
