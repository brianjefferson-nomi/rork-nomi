# Restaurant Card Architecture

## Overview

The restaurant card system has been simplified to use the original, working `RestaurantCard` component that provides rich content display with proper UI hierarchy, plus a specialized `SimpleCollectionRestaurantCard` for collection detail pages.

## Current Architecture

### 1. RestaurantCard (Main Component)
**Location**: `components/RestaurantCard.tsx`

**Features**:
- ✅ **Rich Content Display**: Shows restaurant name, rating, vibe tags, description, and popular dishes
- ✅ **Image Carousel**: Multiple images with navigation arrows and indicators
- ✅ **Favorite Functionality**: Heart button with proper state management
- ✅ **Compact Mode**: Horizontal layout for space-constrained areas
- ✅ **Smart Content Filtering**: Removes generic menu items, shows only specific dishes
- ✅ **Vibe Tags**: Dynamic generation based on restaurant characteristics
- ✅ **Null Safety**: Comprehensive error handling for missing data

**Content Order**:
1. Restaurant Name + Star Rating
2. Vibe Tags (Casual, Comfortable, etc.)
3. Price • Cuisine
4. Location with map pin
5. Description (if available)
6. Popular Dishes (🔥 icon, if available)

**Usage**:
```tsx
import { RestaurantCard } from '@/components/RestaurantCard';

<RestaurantCard
  restaurant={restaurant}
  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
  compact={false} // Optional: for horizontal layout
/>
```

### 2. SimpleCollectionRestaurantCard (Collection Detail Pages)
**Location**: `components/restaurant-cards/SimpleCollectionRestaurantCard.tsx`

**Features**:
- ✅ **Simple Display**: Basic restaurant info (name, cuisine, location)
- ✅ **Favorite Button**: Heart button for favoriting restaurants
- ✅ **Remove Button**: 'X' button for creators to remove restaurants from collections
- ✅ **Clean Design**: Minimal, focused on collection management
- ✅ **Creator Controls**: Only shows remove button for collection creators/owners

**Usage**:
```tsx
import { SimpleCollectionRestaurantCard } from '@/components/restaurant-cards';

<SimpleCollectionRestaurantCard
  restaurant={restaurant}
  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
  showRemoveButton={canManageRestaurants()}
  onRemove={() => handleRemoveRestaurant(restaurant.id, restaurant.name)}
/>
```

## Implementation Details

### Vibe Tags Generation
The component intelligently generates vibe tags based on:
- **Price Range**: Luxury, Upscale, Casual, Affordable
- **Cuisine Type**: Authentic, Fresh, Spicy, Elegant, etc.
- **Description Analysis**: Romantic, Cozy, Trendy, Bustling, etc.

### Popular Dishes Filtering
Only shows specific menu items, filtering out generic terms like:
- "chef special", "house favorite", "signature dish"
- "popular item", "daily special", "chef's choice"

### Image Handling
- Multiple image support with carousel navigation
- Fallback to default restaurant image
- Error handling for broken image URLs

### Remove Button Functionality
- **Position**: Next to the heart button (top-right corner)
- **Visibility**: Only shown for collection creators/owners
- **Styling**: Red background with white 'X' icon
- **Action**: Calls `onRemove` callback with confirmation dialog

## File Structure

```
components/
├── RestaurantCard.tsx                    # Main restaurant card component
└── restaurant-cards/
    ├── index.ts
    ├── SimpleCollectionRestaurantCard.tsx  # Collection detail pages
    ├── BaseRestaurantCard.tsx             # Legacy
    ├── CollectionRestaurantCard.tsx       # Legacy
    └── SimpleRestaurantCard.tsx           # Legacy
```

## Migration Status

✅ **Homepage**: Updated to use `RestaurantCard`
✅ **CityHomePage**: Updated to use `RestaurantCard`
✅ **Collection Detail Page**: Updated to use `SimpleCollectionRestaurantCard`
✅ **TypeScript**: All type errors resolved

## Benefits of This Approach

1. **Simplified Architecture**: Two focused components for different use cases
2. **Rich Content**: Homepage shows all available restaurant information
3. **Collection Management**: Simple cards with remove functionality for collections
4. **Consistent UI**: Same look and feel across the app
5. **Maintainable**: Easier to update and debug
6. **Performance**: No unnecessary component wrapping

## Future Considerations

- The legacy `restaurant-cards/` folder can be removed once all references are updated
- Consider adding props for customizing which sections to show
- May want to add animation support for card interactions
