import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { PexelsImage } from '@/services/pexels';

interface PexelsImageProps {
  image: PexelsImage | null;
  isLoading?: boolean;
  error?: string | null;
  style?: any;
  imageStyle?: any;
  showLoadingIndicator?: boolean;
  fallbackSource?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: () => void;
}

export const PexelsImageComponent: React.FC<PexelsImageProps> = ({
  image,
  isLoading = false,
  error = null,
  style,
  imageStyle,
  showLoadingIndicator = true,
  fallbackSource,
  resizeMode = 'cover',
  onLoad,
  onError
}) => {
  if (isLoading && showLoadingIndicator) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error || !image) {
    if (fallbackSource) {
      return (
        <Image
          source={fallbackSource}
          style={[styles.image, imageStyle]}
          resizeMode={resizeMode}
          onLoad={onLoad}
          onError={onError}
        />
      );
    }
    
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <View style={styles.placeholderContent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: image.src.large }}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
        onLoad={onLoad}
        onError={onError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#e0e0e0',
  },
  placeholderContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
});

export default PexelsImageComponent;
