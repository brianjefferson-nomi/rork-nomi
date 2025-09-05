import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

// Skeleton loading animation
const SkeletonLoader = ({ style, width = '100%', height = 20 }: { style?: any; width?: string | number; height?: number }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Restaurant card skeleton
export const RestaurantCardSkeleton = () => (
  <View style={styles.restaurantCardSkeleton}>
    <SkeletonLoader width="100%" height={120} style={styles.imageSkeleton} />
    <View style={styles.contentSkeleton}>
      <SkeletonLoader width="80%" height={18} style={styles.titleSkeleton} />
      <SkeletonLoader width="60%" height={14} style={styles.subtitleSkeleton} />
      <View style={styles.ratingSkeleton}>
        <SkeletonLoader width={60} height={14} />
        <SkeletonLoader width={40} height={14} />
      </View>
    </View>
  </View>
);

// Collection card skeleton
export const CollectionCardSkeleton = () => (
  <View style={styles.collectionCardSkeleton}>
    <SkeletonLoader width="100%" height={100} style={styles.collectionImageSkeleton} />
    <View style={styles.collectionContentSkeleton}>
      <SkeletonLoader width="70%" height={16} style={styles.collectionTitleSkeleton} />
      <SkeletonLoader width="50%" height={12} style={styles.collectionSubtitleSkeleton} />
      <View style={styles.collectionStatsSkeleton}>
        <SkeletonLoader width={30} height={12} />
        <SkeletonLoader width={40} height={12} />
      </View>
    </View>
  </View>
);

// Neighborhood card skeleton
export const NeighborhoodCardSkeleton = () => (
  <View style={styles.neighborhoodCardSkeleton}>
    <SkeletonLoader width="100%" height={80} style={styles.neighborhoodImageSkeleton} />
    <View style={styles.neighborhoodContentSkeleton}>
      <SkeletonLoader width="60%" height={14} style={styles.neighborhoodTitleSkeleton} />
      <SkeletonLoader width="40%" height={12} style={styles.neighborhoodCountSkeleton} />
    </View>
  </View>
);

// Section header skeleton
export const SectionHeaderSkeleton = () => (
  <View style={styles.sectionHeaderSkeleton}>
    <SkeletonLoader width={24} height={24} style={styles.iconSkeleton} />
    <SkeletonLoader width={120} height={18} style={styles.sectionTitleSkeleton} />
  </View>
);

// Home screen skeleton
export const HomeScreenSkeleton = () => (
  <View style={styles.homeSkeleton}>
    {/* Header skeleton */}
    <View style={styles.headerSkeleton}>
      <SkeletonLoader width={100} height={24} />
      <SkeletonLoader width={60} height={20} />
    </View>

    {/* Search bar skeleton */}
    <SkeletonLoader width="100%" height={48} style={styles.searchSkeleton} />

    {/* City toggle skeleton */}
    <View style={styles.cityToggleSkeleton}>
      <SkeletonLoader width={80} height={32} />
      <SkeletonLoader width={80} height={32} />
    </View>

    {/* Nearby restaurants section */}
    <SectionHeaderSkeleton />
    <View style={styles.horizontalScrollSkeleton}>
      {[1, 2, 3].map((i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </View>

    {/* Trending section */}
    <SectionHeaderSkeleton />
    <View style={styles.horizontalScrollSkeleton}>
      {[1, 2, 3].map((i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </View>

    {/* Neighborhoods section */}
    <SectionHeaderSkeleton />
    <View style={styles.horizontalScrollSkeleton}>
      {[1, 2, 3, 4].map((i) => (
        <NeighborhoodCardSkeleton key={i} />
      ))}
    </View>

    {/* Collections section */}
    <SectionHeaderSkeleton />
    <View style={styles.horizontalScrollSkeleton}>
      {[1, 2, 3].map((i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  
  // Restaurant card skeleton
  restaurantCardSkeleton: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSkeleton: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  contentSkeleton: {
    padding: 12,
  },
  titleSkeleton: {
    marginBottom: 6,
  },
  subtitleSkeleton: {
    marginBottom: 8,
  },
  ratingSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Collection card skeleton
  collectionCardSkeleton: {
    width: 180,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionImageSkeleton: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  collectionContentSkeleton: {
    padding: 12,
  },
  collectionTitleSkeleton: {
    marginBottom: 6,
  },
  collectionSubtitleSkeleton: {
    marginBottom: 8,
  },
  collectionStatsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Neighborhood card skeleton
  neighborhoodCardSkeleton: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  neighborhoodImageSkeleton: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  neighborhoodContentSkeleton: {
    padding: 8,
  },
  neighborhoodTitleSkeleton: {
    marginBottom: 4,
  },
  neighborhoodCountSkeleton: {},

  // Section header skeleton
  sectionHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  iconSkeleton: {
    marginRight: 8,
    borderRadius: 12,
  },
  sectionTitleSkeleton: {
    borderRadius: 9,
  },

  // Home screen skeleton
  homeSkeleton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  searchSkeleton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
  },
  cityToggleSkeleton: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  horizontalScrollSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
});
