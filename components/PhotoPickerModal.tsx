import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Camera, ImagePlus, X, Upload } from 'lucide-react-native';
import { PhotoUploadService } from '../services/photo-upload';

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantId: string;
  userId: string;
  onPhotoUploaded?: (photo: any) => void;
  onError?: (error: string) => void;
}

export function PhotoPickerModal({
  visible,
  onClose,
  restaurantId,
  userId,
  onPhotoUploaded,
  onError,
}: PhotoPickerModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (source: 'camera' | 'library') => {
    try {
      setIsUploading(true);

      let result;
      if (source === 'camera') {
        result = await PhotoUploadService.takePhoto();
      } else {
        result = await PhotoUploadService.showImagePicker();
      }

      if (!result || result.canceled) {
        return;
      }

      const imageUri = result.assets?.[0]?.uri;
      if (!imageUri) {
        throw new Error('No image selected');
      }

      const uploadResult = await PhotoUploadService.uploadPhoto(imageUri, restaurantId, userId);

      if (uploadResult.success && uploadResult.photo) {
        onPhotoUploaded?.(uploadResult.photo);
        onClose();
        Alert.alert('Success', 'Photo uploaded successfully!');
      } else {
        const errorMessage = uploadResult.error || 'Upload failed';
        onError?.(errorMessage);
        Alert.alert('Upload Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const renderOption = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void,
    disabled = false
  ) => (
    <TouchableOpacity
      style={[styles.option, disabled && styles.optionDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.optionIcon}>
        {icon}
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, disabled && styles.optionTitleDisabled]}>
          {title}
        </Text>
        <Text style={[styles.optionSubtitle, disabled && styles.optionSubtitleDisabled]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Photo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.uploadingText}>Uploading photo...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Choose how you want to add a photo to this restaurant
              </Text>

              <View style={styles.options}>
                {renderOption(
                  <Camera size={32} color="#007AFF" />,
                  'Take Photo',
                  'Use your camera to take a new photo',
                  () => handleUpload('camera')
                )}

                {renderOption(
                  <ImagePlus size={32} color="#007AFF" />,
                  'Choose from Library',
                  'Select a photo from your photo library',
                  () => handleUpload('library')
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionTitleDisabled: {
    color: '#8E8E93',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  optionSubtitleDisabled: {
    color: '#C7C7CC',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default PhotoPickerModal;
