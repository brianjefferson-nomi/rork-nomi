# 🚀 Initial Load Time Optimization Plan

## Current Performance Issues

### 1. **Heavy Initial Data Loading**
- **Problem**: 6+ React Query hooks loading simultaneously on app start
- **Impact**: Blocks UI rendering until all data loads
- **Current Queries**:
  - `restaurantsQuery` - Loads all restaurants from database
  - `votesQuery` - Loads user votes
  - `favoritesQuery` - Loads user favorites  
  - `discussionsQuery` - Loads discussions
  - `dataQuery` - Loads combined data + location
  - `allCollectionsQuery` - Loads all collections

### 2. **Excessive Debug Logging**
- **Problem**: 7K+ console messages during startup
- **Impact**: Significant performance overhead
- **Solution**: Remove/reduce debug logging

### 3. **Synchronous Storage Operations**
- **Problem**: Multiple AsyncStorage.getItem() calls blocking main thread
- **Impact**: UI freezes during storage reads
- **Solution**: Batch storage operations

### 4. **No Lazy Loading**
- **Problem**: All data loads immediately, even if not needed
- **Impact**: Unnecessary network requests and processing
- **Solution**: Load data on-demand

## Optimization Solutions

### Phase 1: Critical Performance Fixes (Immediate Impact)

#### 1.1 Remove Debug Logging
```typescript
// Remove all console.log statements from:
// - hooks/restaurant-store.tsx
// - services/supabase.ts
// - components/CollectionCard.tsx
```

#### 1.2 Optimize React Query Configuration
```typescript
// Reduce initial data loading
const restaurantsQuery = useQuery({
  queryKey: ['restaurants'],
  queryFn: loadRestaurants,
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000, // 1 hour
  retry: 1, // Reduce retries
  retryDelay: 500, // Faster retry
  // Add placeholder data for faster initial render
  placeholderData: [],
});
```

#### 1.3 Implement Lazy Loading
```typescript
// Load only essential data initially
const essentialQueries = useQuery({
  queryKey: ['essentialData'],
  queryFn: async () => {
    // Load only user auth + basic app state
    const [user, location] = await Promise.all([
      loadUser(),
      getUserLocation()
    ]);
    return { user, location };
  }
});

// Load other data on-demand
const loadRestaurants = useCallback(() => {
  // Only load when needed
}, []);
```

### Phase 2: Data Loading Optimization

#### 2.1 Batch Storage Operations
```typescript
// Single storage read instead of multiple
const loadStoredData = async () => {
  const keys = ['userVotes', 'discussions', 'restaurantNotes', 'searchHistory', 'favoriteRestaurants'];
  const values = await AsyncStorage.multiGet(keys);
  return Object.fromEntries(values);
};
```

#### 2.2 Implement Progressive Loading
```typescript
// Load data in stages
const Stage1 = () => {
  // Load: User auth, basic UI state
};

const Stage2 = () => {
  // Load: Essential restaurant data (first 20)
};

const Stage3 = () => {
  // Load: Collections, votes, favorites
};
```

#### 2.3 Add Skeleton Loading States
```typescript
// Show skeleton while loading
const RestaurantSkeleton = () => (
  <View style={styles.skeleton}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonText} />
  </View>
);
```

### Phase 3: Bundle Optimization

#### 3.1 Implement Code Splitting
```typescript
// Lazy load heavy components
const RestaurantDetails = lazy(() => import('./RestaurantDetails'));
const CollectionDetails = lazy(() => import('./CollectionDetails'));
```

#### 3.2 Optimize Images
```typescript
// Use optimized image loading
import { Image } from 'expo-image';

// Preload critical images
const preloadImages = async () => {
  await Image.prefetch(['image1.jpg', 'image2.jpg']);
};
```

#### 3.3 Reduce Bundle Size
```typescript
// Tree shake unused code
// Use dynamic imports for heavy libraries
const heavyLibrary = await import('heavy-library');
```

### Phase 4: Advanced Optimizations

#### 4.1 Implement Service Worker Caching
```typescript
// Cache API responses
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  return cached || fetch(request);
};
```

#### 4.2 Add Preloading
```typescript
// Preload next likely data
const preloadNextData = useCallback(() => {
  // Preload next page of restaurants
  queryClient.prefetchQuery(['restaurants', 'page2']);
}, []);
```

#### 4.3 Optimize Database Queries
```typescript
// Use database indexes
// Limit initial query results
const getRestaurants = async (limit = 20) => {
  return supabase
    .from('restaurants')
    .select('*')
    .limit(limit);
};
```

## Implementation Priority

### 🔥 **High Priority (Immediate)**
1. Remove debug logging (7K messages)
2. Optimize React Query staleTime/gcTime
3. Implement lazy loading for non-essential data
4. Add skeleton loading states

### 🟡 **Medium Priority (Next Sprint)**
1. Batch AsyncStorage operations
2. Implement progressive loading
3. Add code splitting for heavy components
4. Optimize image loading

### 🟢 **Low Priority (Future)**
1. Service worker caching
2. Advanced preloading strategies
3. Database query optimization
4. Bundle size analysis

## Expected Performance Gains

- **Initial Load Time**: 50-70% reduction
- **Time to Interactive**: 60-80% improvement
- **Bundle Size**: 20-30% reduction
- **Memory Usage**: 30-40% reduction

## Measurement

Track these metrics:
- Time to First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Bundle size
- Memory usage
- Network requests count
