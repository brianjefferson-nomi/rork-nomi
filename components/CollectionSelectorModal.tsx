import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { Database } from '@/services/supabase';
import { LinearGradient } from 'expo-linear-gradient';

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
    if ((collection as any).cover_image && (collection as any).cover_image.startsWith('http')) {
      return (collection as any).cover_image;
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
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {restaurantName ? `Add ${restaurantName} to collection` : 'Save to collection'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
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
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: getCollectionImage(collection) }}
                    style={styles.collectionImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                    style={styles.collectionOverlay}
                  >
                    <Text style={styles.collectionName} numberOfLines={2}>
                      {collection.name}
                    </Text>
                    <Text style={styles.savedCount}>
                      {getSavedCount(collection)} saved
                    </Text>
                  </LinearGradient>
                  <View style={styles.cardShadow} />
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
              <Plus size={18} color="#FFF" />
              <Text style={styles.createButtonText}>Create collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  collectionCard: {
    width: (width - 72) / 2, // 2 columns with padding
    height: 160,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    position: 'relative',
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
    padding: 16,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  savedCount: {
    fontSize: 13,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  cardShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#FFF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
});
