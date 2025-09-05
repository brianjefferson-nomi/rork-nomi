import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreenSkeleton, RestaurantCardSkeleton, CollectionCardSkeleton, NeighborhoodCardSkeleton } from './SkeletonComponents';
import { FadeInView, StaggeredList, ScaleInView } from './AnimatedContent';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  delay?: number;
}

// Progressive loader that shows skeleton first, then content
export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  isLoading,
  children,
  skeleton,
  delay = 0,
}) => {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, delay]);

  if (isLoading || !showContent) {
    return <View style={styles.container}>{skeleton}</View>;
  }

  return (
    <FadeInView delay={delay} duration={400}>
      {children}
    </FadeInView>
  );
};

// Restaurant list with progressive loading
interface ProgressiveRestaurantListProps {
  restaurants: any[];
  isLoading: boolean;
  renderItem: (restaurant: any, index: number) => React.ReactNode;
  numSkeletons?: number;
}

export const ProgressiveRestaurantList: React.FC<ProgressiveRestaurantListProps> = ({
  restaurants,
  isLoading,
  renderItem,
  numSkeletons = 3,
}) => {
  if (isLoading && restaurants.length === 0) {
    return (
      <View style={styles.horizontalScroll}>
        {Array.from({ length: numSkeletons }).map((_, index) => (
          <RestaurantCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  return (
    <StaggeredList
      delay={200}
      staggerDelay={150}
      style={styles.horizontalScroll}
    >
      {restaurants.map((restaurant, index) => renderItem(restaurant, index))}
    </StaggeredList>
  );
};

// Collection list with progressive loading
interface ProgressiveCollectionListProps {
  collections: any[];
  isLoading: boolean;
  renderItem: (collection: any, index: number) => React.ReactNode;
  numSkeletons?: number;
}

export const ProgressiveCollectionList: React.FC<ProgressiveCollectionListProps> = ({
  collections,
  isLoading,
  renderItem,
  numSkeletons = 3,
}) => {
  if (isLoading && collections.length === 0) {
    return (
      <View style={styles.horizontalScroll}>
        {Array.from({ length: numSkeletons }).map((_, index) => (
          <CollectionCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  return (
    <StaggeredList
      delay={400}
      staggerDelay={150}
      style={styles.horizontalScroll}
    >
      {collections.map((collection, index) => renderItem(collection, index))}
    </StaggeredList>
  );
};

// Neighborhood list with progressive loading
interface ProgressiveNeighborhoodListProps {
  neighborhoods: any[];
  isLoading: boolean;
  renderItem: (neighborhood: any, index: number) => React.ReactNode;
  numSkeletons?: number;
}

export const ProgressiveNeighborhoodList: React.FC<ProgressiveNeighborhoodListProps> = ({
  neighborhoods,
  isLoading,
  renderItem,
  numSkeletons = 4,
}) => {
  if (isLoading && neighborhoods.length === 0) {
    return (
      <View style={styles.horizontalScroll}>
        {Array.from({ length: numSkeletons }).map((_, index) => (
          <NeighborhoodCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  return (
    <StaggeredList
      delay={300}
      staggerDelay={100}
      style={styles.horizontalScroll}
    >
      {neighborhoods.map((neighborhood, index) => renderItem(neighborhood, index))}
    </StaggeredList>
  );
};

// Section with progressive loading
interface ProgressiveSectionProps {
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  delay?: number;
}

export const ProgressiveSection: React.FC<ProgressiveSectionProps> = ({
  title,
  icon,
  isLoading,
  children,
  skeleton,
  delay = 0,
}) => {
  return (
    <FadeInView delay={delay} duration={500}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        
        <ProgressiveLoader
          isLoading={isLoading}
          skeleton={skeleton}
          delay={delay + 200}
        >
          {children}
        </ProgressiveLoader>
      </View>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalScroll: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
});
