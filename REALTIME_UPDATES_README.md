# Real-Time Updates for Restaurant Data

This document describes the real-time update system implemented for restaurant data, including hours, price range, photos, and website information.

## Overview

The real-time update system uses Supabase's real-time subscriptions to automatically update the UI when restaurant data changes in the database. This ensures that users always see the most current information without needing to refresh the page.

## Features

### Real-Time Updates for:
- ✅ **Restaurant Hours** - Automatically updates when hours change
- ✅ **Price Range** - Updates when price range is modified
- ✅ **Website** - Updates when website URL changes
- ✅ **Photos** - Real-time updates for photo uploads, updates, and deletions
- ✅ **Google Photos** - Updates when Google Places photos are added
- ✅ **TripAdvisor Photos** - Updates when TripAdvisor photos are added

### Visual Indicators:
- 🟢 **Live Indicator** - Shows "Live" badge when real-time connection is active
- 🔄 **Automatic Refresh** - UI updates automatically without user intervention
- 📱 **Cross-Platform** - Works on both web and mobile

## Architecture

### 1. Real-Time Subscription Service (`services/realtime-subscriptions.ts`)

The core service that manages Supabase real-time subscriptions:

```typescript
// Subscribe to restaurant table updates
realtimeSubscriptionService.subscribeToRestaurantUpdates({
  onRestaurantUpdate: (update) => {
    // Handle restaurant data updates
  }
});

// Subscribe to restaurant photos updates
realtimeSubscriptionService.subscribeToRestaurantPhotos({
  onRestaurantPhotoInsert: (photo) => {
    // Handle new photo uploads
  },
  onRestaurantPhotoUpdate: (photo) => {
    // Handle photo updates
  },
  onRestaurantPhotoDelete: (photo) => {
    // Handle photo deletions
  }
});
```

### 2. Restaurant Store Integration (`hooks/restaurant-store.tsx`)

The restaurant store automatically subscribes to real-time updates and updates the local state:

```typescript
useEffect(() => {
  const unsubscribe = realtimeSubscriptionService.subscribeToAllRestaurantUpdates({
    onRestaurantUpdate: (update) => {
      // Update local restaurant state
      setRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant.id === update.id 
            ? { ...restaurant, ...update }
            : restaurant
        )
      );
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    }
  });

  return unsubscribe;
}, [queryClient]);
```

### 3. Unified Images Hook (`hooks/use-unified-images.ts`)

The images hook subscribes to photo updates and automatically refreshes when photos change:

```typescript
useEffect(() => {
  const unsubscribe = realtimeSubscriptionService.subscribeToRestaurantPhotos({
    onRestaurantPhotoInsert: (photo) => {
      if (photo.restaurant_id === restaurant.id) {
        loadImages(true); // Refresh images
      }
    }
  });

  return unsubscribe;
}, [restaurant?.id, loadImages]);
```

### 4. Restaurant Detail Page (`app/restaurant/[id].tsx`)

Individual restaurant pages use the `useRestaurantRealtime` hook for specific updates:

```typescript
const { isConnected } = useRestaurantRealtime({
  restaurantId: restaurant?.id,
  onRestaurantUpdate: (update) => {
    // Handle updates for this specific restaurant
  },
  onPhotoInsert: (photo) => {
    refreshImages(); // Refresh photo gallery
  }
});
```

## Database Tables

### Restaurants Table
The system monitors the following fields for real-time updates:
- `hours` - Restaurant operating hours
- `price_range` - Price range (e.g., $, $$, $$$)
- `website` - Restaurant website URL
- `google_photos` - Google Places photos
- `tripadvisor_photos` - TripAdvisor photos
- `updated_at` - Timestamp of last update

### Restaurant Photos Table
The system monitors all operations on the `restaurant_photos` table:
- `INSERT` - New photo uploads
- `UPDATE` - Photo metadata changes
- `DELETE` - Photo deletions

## Usage

### Automatic Updates
Real-time updates work automatically once the system is set up. No additional configuration is required.

### Manual Testing
Use the provided test script to verify real-time updates:

```bash
node test-realtime-updates.js
```

This script will:
1. Update restaurant hours
2. Update price range
3. Update website
4. Insert a test photo

Watch your app to see the changes appear in real-time!

### Connection Status
Check if real-time updates are working by looking for the "Live" indicator on restaurant detail pages.

## Performance Considerations

### Optimizations Implemented:
- **Selective Updates**: Only updates relevant data, not entire objects
- **Query Invalidation**: Uses React Query's smart invalidation system
- **Connection Management**: Automatically cleans up subscriptions on unmount
- **Reduced Polling**: Reduced auto-refresh intervals since real-time updates are available

### Resource Usage:
- **Memory**: Minimal overhead with efficient subscription management
- **Network**: Only sends updates when data actually changes
- **Battery**: Optimized for mobile devices with proper cleanup

## Troubleshooting

### Common Issues:

1. **Updates Not Appearing**
   - Check browser console for connection errors
   - Verify Supabase real-time is enabled
   - Ensure RLS policies allow read access

2. **Connection Issues**
   - Check network connectivity
   - Verify Supabase credentials
   - Look for "Live" indicator on restaurant pages

3. **Performance Issues**
   - Check for memory leaks in subscription cleanup
   - Verify proper unmounting of components
   - Monitor network usage in browser dev tools

### Debug Logging:
The system includes comprehensive logging. Check the browser console for:
- `[RealtimeService]` - Real-time subscription events
- `[RestaurantStore]` - Store update events
- `[useUnifiedImages]` - Image update events
- `[RestaurantDetail]` - Page-specific events

## Future Enhancements

### Planned Features:
- **Offline Support** - Queue updates when offline
- **Conflict Resolution** - Handle concurrent updates
- **Selective Subscriptions** - Subscribe only to specific restaurants
- **Push Notifications** - Notify users of important updates
- **Analytics** - Track real-time update performance

### Potential Integrations:
- **WebSocket Fallback** - Alternative connection method
- **Service Worker** - Background update processing
- **Caching Strategy** - Optimize for slow connections

## Security

### RLS Policies:
The system respects Supabase Row Level Security (RLS) policies:
- Users can only see updates for restaurants they have access to
- Photo updates respect user permissions
- All subscriptions are authenticated

### Data Validation:
- All updates are validated before applying to UI
- Malformed data is logged and ignored
- Fallback to cached data on errors

## Monitoring

### Health Checks:
- Connection status monitoring
- Subscription health tracking
- Error rate monitoring
- Performance metrics

### Alerts:
- Connection failures
- High error rates
- Performance degradation
- Unusual update patterns

---

## Quick Start

1. **Enable Real-Time**: Ensure Supabase real-time is enabled for your project
2. **Deploy**: The system works automatically once deployed
3. **Test**: Use the test script to verify functionality
4. **Monitor**: Check browser console for any issues

The real-time update system is now fully integrated and ready to provide live updates for all restaurant data changes!
