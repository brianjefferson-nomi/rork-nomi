import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, ImagePlus, Upload } from 'lucide-react-native';
import { PhotoUploadService } from '../services/photo-upload';

interface PhotoUploadButtonProps {
  restaurantId: string;
  userId: string;
  onPhotoUploaded?: (photo: any) => void;
  onError?: (error: string) => void;
  style?: any;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export function PhotoUploadButton({
  restaurantId,
  userId,
  onPhotoUploaded,
  onError,
  style,
  variant = 'primary',
  size = 'medium',
  showText = true,
}: PhotoUploadButtonProps) {
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

  const showUploadOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: () => handleUpload('camera'),
        },
        {
          text: 'Photo Library',
          onPress: () => handleUpload('library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    };

    const sizeStyles = {
      small: { paddingHorizontal: 12, paddingVertical: 8 },
      medium: { paddingHorizontal: 16, paddingVertical: 12 },
      large: { paddingHorizontal: 20, paddingVertical: 16 },
    };

    const variantStyles = {
      primary: {
        backgroundColor: '#007AFF',
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: '#F2F2F7',
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: isUploading ? 0.6 : 1,
    };
  };

  const getTextStyle = () => {
    const baseStyle = {
      marginLeft: 8,
      fontWeight: '600' as const,
    };

    const variantStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#000000' },
      outline: { color: '#007AFF' },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getIconSize = () => {
    const sizes = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return sizes[size];
  };

  const getIconColor = () => {
    const colors = {
      primary: '#FFFFFF',
      secondary: '#000000',
      outline: '#007AFF',
    };
    return colors[variant];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={showUploadOptions}
      disabled={isUploading}
      activeOpacity={0.7}
    >
      {isUploading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#007AFF'} 
        />
      ) : (
        <ImagePlus size={getIconSize()} color={getIconColor()} />
      )}
      
      {showText && (
        <Text style={getTextStyle()}>
          {isUploading ? 'Uploading...' : 'Add Photo'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default PhotoUploadButton;
