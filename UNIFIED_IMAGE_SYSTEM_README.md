# Unified Image System

## Overview

The Unified Image System ensures that all restaurant images are displayed consistently across the entire application, with user-uploaded photos prioritized over fallback images. The system displays uploaded photos in chronological order (oldest first) and provides a seamless experience across restaurant cards, search results, and detail screens.

## Key Features

### 1. **Prioritized Image Display**
- **User-uploaded photos** are always displayed first
- **Fallback images** (Google Places, existing images, defaults) are shown when no uploaded photos exist
- **Consistent ordering** across all components

### 2. **Chronological Ordering**
- Uploaded photos are displayed **oldest first** (ascending by `created_at`)
- This ensures users see their photos in the order they were taken/uploaded
- Maintains a natural timeline of restaurant visits

### 3. **Unified Service Architecture**
- **Single source of truth** for all restaurant images
- **Cached results** for improved performance (5-minute cache)
- **Automatic fallback** to varied default images based on cuisine

### 4. **Cross-Component Consistency**
- Restaurant cards, search results, and detail screens all use the same image service
- No more inconsistencies between different parts of the app
- Real-time updates when photos are uploaded

## Implementation Details

### Core Files

#### 1. `services/unified-image-service.ts`
- **Main service** that handles image prioritization and caching
- **Fetches uploaded photos** from the database (ordered by oldest first)
- **Generates fallback images** based on restaurant cuisine and name
- **Caches results** for 5 minutes to improve performance

#### 2. `hooks/use-unified-images.ts`
- **React hook** that provides unified images to components
- **Automatic refresh** when restaurant data changes
- **Loading states** and error handling
- **Cache management** with manual refresh capabilities

#### 3. `services/photo-upload.ts`
- **Updated to order photos** by `created_at` ascending (oldest first)
- **Maintains existing upload functionality**
- **Integrates with unified image service**

### Component Updates

#### 1. `components/RestaurantCard.tsx`
- **Uses `useUnifiedImages` hook** instead of local image logic
- **Displays uploaded photos first** in image carousel
- **Consistent fallback behavior** across all restaurant cards

#### 2. `app/restaurant/[id].tsx`
- **Integrated with unified image service** for main image display
- **Refreshes images** when photos are uploaded
- **Maintains photo gallery functionality**

#### 3. `hooks/restaurant-store.tsx`
- **Updated restaurant type** to include `uploadedPhotos` field
- **Maintains backward compatibility** with existing data

## Image Priority Order

1. **User-uploaded photos** (oldest first)
2. **Google Places photos** (if available)
3. **Existing restaurant images** (from database)
4. **Main image URL** (if different from above)
5. **Varied default image** (based on cuisine/name)

## Usage Examples

### In Restaurant Cards
```typescript
const { images, hasUploadedPhotos, uploadedPhotoCount } = useUnifiedImages(restaurant);

// images array contains all images in priority order
// hasUploadedPhotos indicates if user has uploaded photos
// uploadedPhotoCount shows number of uploaded photos
```

### In Restaurant Detail Screen
```typescript
const { images, refreshImages } = useUnifiedImages(restaurant);

// Use images for main display
// Call refreshImages() after photo upload to update display
```

### Manual Cache Management
```typescript
import { UnifiedImageService } from '@/services/unified-image-service';

// Clear cache for specific restaurant
UnifiedImageService.clearCache(restaurantId);

// Clear all cache
UnifiedImageService.clearAllCache();
```

## Performance Optimizations

### 1. **Caching Strategy**
- **5-minute cache** for image data
- **Automatic cache invalidation** when photos are uploaded
- **Memory-efficient** cache management

### 2. **Lazy Loading**
- **Images loaded on demand** when components mount
- **Fallback images** generated only when needed
- **Efficient database queries** with proper indexing

### 3. **Error Handling**
- **Graceful fallbacks** when images fail to load
- **Retry mechanisms** for failed requests
- **User-friendly error messages**

## Database Schema

### `restaurant_photos` Table
```sql
CREATE TABLE restaurant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying by restaurant and date
CREATE INDEX idx_restaurant_photos_restaurant_created 
ON restaurant_photos(restaurant_id, created_at ASC);
```

## Migration Notes

### Existing Data
- **No data loss** - existing images are preserved
- **Backward compatibility** maintained
- **Gradual migration** as users upload new photos

### Performance Impact
- **Minimal overhead** - cached results reduce database queries
- **Improved user experience** - consistent image display
- **Better photo management** - chronological ordering

## Testing

The system has been tested with:
- ✅ **Mock restaurant data** with various image combinations
- ✅ **Uploaded photo prioritization** (oldest first)
- ✅ **Fallback image generation** based on cuisine
- ✅ **Cache management** and expiration
- ✅ **Cross-component consistency**

## Future Enhancements

### Potential Improvements
1. **Image optimization** - automatic resizing and compression
2. **CDN integration** - faster image delivery
3. **Batch upload** - multiple photos at once
4. **Photo metadata** - EXIF data extraction
5. **Image recognition** - automatic cuisine-based tagging

### Monitoring
- **Cache hit rates** - monitor performance
- **Upload success rates** - track user engagement
- **Image load times** - optimize delivery
- **Storage usage** - manage costs

## Conclusion

The Unified Image System provides a robust, consistent, and user-friendly approach to restaurant image management. By prioritizing user-uploaded photos and displaying them in chronological order, users get a more personalized and meaningful experience when browsing restaurants.

The system is designed to be:
- **Scalable** - handles growing photo collections
- **Performant** - cached results and efficient queries
- **Consistent** - same images across all components
- **User-centric** - uploaded photos take priority
- **Maintainable** - clean architecture and clear separation of concerns
