import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { X, Star, MoreVertical, Trash2 } from 'lucide-react-native';
import { PhotoUploadService, UploadedPhoto } from '../services/photo-upload';
import { PhotoUploadButton } from './PhotoUploadButton';

interface RestaurantPhotoGalleryProps {
  restaurantId: string;
  userId: string;
  onMainImageSet?: (imageUrl: string) => void;
  style?: any;
  refreshTrigger?: number; // Add refresh trigger prop
}

export function RestaurantPhotoGallery({
  restaurantId,
  userId,
  onMainImageSet,
  style,
  refreshTrigger,
}: RestaurantPhotoGalleryProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const photoSize = (screenWidth - 48) / 2; // 2 columns with padding

  useEffect(() => {
    loadPhotos();
  }, [restaurantId, refreshTrigger]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      console.log(`[RestaurantPhotoGallery] Loading photos for restaurant: ${restaurantId}`);
      const restaurantPhotos = await PhotoUploadService.getRestaurantPhotos(restaurantId);
      console.log(`[RestaurantPhotoGallery] Loaded ${restaurantPhotos.length} photos:`, restaurantPhotos);
      setPhotos(restaurantPhotos);
    } catch (error) {
      console.error('[RestaurantPhotoGallery] Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = (newPhoto: UploadedPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const handleSetAsMain = async (photo: UploadedPhoto) => {
    try {
      const success = await PhotoUploadService.updateRestaurantMainImage(
        restaurantId,
        photo.url
      );

      if (success) {
        onMainImageSet?.(photo.url);
        Alert.alert('Success', 'Main image updated!');
      } else {
        Alert.alert('Error', 'Failed to update main image');
      }
    } catch (error) {
      console.error('Error setting main image:', error);
      Alert.alert('Error', 'Failed to update main image');
    }
  };

  const handleDeletePhoto = (photo: UploadedPhoto) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePhoto(photo.id),
        },
      ]
    );
  };

  const deletePhoto = async (photoId: string) => {
    try {
      setDeletingPhotoId(photoId);
      const success = await PhotoUploadService.deletePhoto(photoId);

      if (success) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
        Alert.alert('Success', 'Photo deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const showPhotoOptions = (photo: UploadedPhoto) => {
    Alert.alert(
      'Photo Options',
      'What would you like to do with this photo?',
      [
        {
          text: 'Set as Main Image',
          onPress: () => handleSetAsMain(photo),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeletePhoto(photo),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderPhoto = ({ item: photo }: { item: UploadedPhoto }) => (
    <View style={{ margin: 8, position: 'relative' }}>
      <TouchableOpacity
        onPress={() => showPhotoOptions(photo)}
        style={{
          width: photoSize,
          height: photoSize * 0.75, // 4:3 aspect ratio
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#F2F2F7',
        }}
      >
        <Image
          source={{ uri: photo.url }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
        
        {deletingPhotoId === photo.id && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 16,
            padding: 6,
          }}
          onPress={() => showPhotoOptions(photo)}
        >
          <MoreVertical size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
      }}
    >
      <Text style={{ fontSize: 16, color: '#8E8E93', marginBottom: 16 }}>
        No photos yet
      </Text>
      <PhotoUploadButton
        restaurantId={restaurantId}
        userId={userId}
        onPhotoUploaded={handlePhotoUploaded}
        variant="outline"
        size="medium"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[{ padding: 20, alignItems: 'center' }, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, color: '#8E8E93' }}>Loading photos...</Text>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Photos ({photos.length})
        </Text>
        <PhotoUploadButton
          restaurantId={restaurantId}
          userId={userId}
          onPhotoUploaded={handlePhotoUploaded}
          variant="primary"
          size="small"
          showText={false}
        />
      </View>

      {photos.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default RestaurantPhotoGallery;
