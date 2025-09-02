# Pexels Image Integration

This project now includes integration with the Pexels API to provide high-quality, relevant images for collections, neighborhoods, and cuisine types.

## 🚀 Features

- **Dynamic Collection Covers**: Automatically fetches relevant images based on collection name, cuisines, and city
- **Neighborhood Images**: Shows neighborhood-specific images for location-based cards
- **Cuisine Images**: Displays food images based on cuisine type
- **City Images**: Fetches city skylines and landmarks
- **Smart Fallbacks**: Graceful degradation when images aren't available
- **Performance Optimized**: Efficient caching and loading states

## 📦 Installation

The Pexels package is already installed:

```bash
npm install pexels
```

## 🔑 API Key

Your Pexels API key is configured in `services/pexels.ts`:

```typescript
const client = createClient('MsSqJ9Z86YrK2mDnhYDKEFIGDpLcsBBMp4MbTf1RXpvywpMHcH8QTLy0');
```

## 🎯 Usage Examples

### 1. Collection Cover Images

```typescript
import { usePexelsImage } from '@/hooks/use-pexels-images';

function CollectionCard({ collection, restaurants }) {
  const { image, isLoading, error } = usePexelsImage(
    collection.name,
    'collection',
    {
      cuisines: restaurants.map(r => r.cuisine).filter(Boolean),
      city: restaurants[0]?.city
    }
  );

  return (
    <PexelsImageComponent
      image={image}
      isLoading={isLoading}
      error={error}
      fallbackSource={{ uri: collection.cover_image }}
    />
  );
}
```

### 2. Neighborhood Images

```typescript
function NeighborhoodCard({ neighborhood, city }) {
  const { image, isLoading, error } = usePexelsImage(
    neighborhood,
    'neighborhood',
    { city }
  );

  return (
    <PexelsImageComponent
      image={image}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### 3. Cuisine Images

```typescript
function CuisineCard({ cuisine }) {
  const { image, isLoading, error } = usePexelsImage(
    cuisine,
    'cuisine'
  );

  return (
    <PexelsImageComponent
      image={image}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### 4. City Images

```typescript
function CityCard({ city }) {
  const { image, isLoading, error } = usePexelsImage(
    city,
    'city'
  );

  return (
    <PexelsImageComponent
      image={image}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

## 🎨 Components

### PexelsImageComponent

A reusable component that handles loading states, errors, and fallbacks:

```typescript
<PexelsImageComponent
  image={pexelsImage}
  isLoading={isLoading}
  error={error}
  style={styles.image}
  fallbackSource={fallbackImage}
  showLoadingIndicator={true}
  resizeMode="cover"
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed to load')}
/>
```

### Props

- `image`: Pexels image object or null
- `isLoading`: Boolean indicating loading state
- `error`: Error message string or null
- `style`: Container styles
- `imageStyle`: Image-specific styles
- `showLoadingIndicator`: Whether to show loading spinner
- `fallbackSource`: Fallback image source
- `resizeMode`: Image resize mode
- `onLoad`: Image load callback
- `onError`: Image error callback

## 🔧 Hooks

### usePexelsImage

Fetches a single image:

```typescript
const { image, isLoading, error, refetch } = usePexelsImage(
  query,
  type,
  additionalContext
);
```

### usePexelsImages

Fetches multiple images:

```typescript
const { images, isLoading, error, refetch } = usePexelsImages(
  queries,
  type,
  additionalContext
);
```

## 🏗️ Service Layer

### PexelsService

Direct service methods for advanced usage:

```typescript
import PexelsService from '@/services/pexels';

// Search for images
const images = await PexelsService.searchImages('pizza', 10);

// Get collection cover
const coverImage = await PexelsService.getCollectionCoverImage(
  'LA Hidden Gems',
  ['Mexican', 'Italian'],
  'Los Angeles'
);

// Get neighborhood image
const neighborhoodImage = await PexelsService.getNeighborhoodImage(
  'Hollywood',
  'Los Angeles'
);
```

## 🎯 Image Types

1. **Collection**: Based on name, cuisines, and city
2. **Neighborhood**: Based on neighborhood name and city
3. **Cuisine**: Based on cuisine type
4. **City**: Based on city name
5. **Custom**: Based on custom search query

## 🔄 Smart Search Logic

The service automatically builds intelligent search queries:

- **Collection**: `"LA Hidden Gems Mexican Italian Los Angeles food"`
- **Neighborhood**: `"Hollywood Los Angeles neighborhood city"`
- **Cuisine**: `"pizza food cuisine"`
- **City**: `"New York skyline cityscape landmark"`

## 🚫 Error Handling

- Graceful fallbacks to existing images
- Loading states for better UX
- Error logging for debugging
- Automatic retry capabilities

## 📱 Performance

- Images are fetched on-demand
- Efficient caching strategies
- Optimized image sizes (large, medium, small)
- Landscape orientation for better mobile display

## 🧪 Testing

Use the `PexelsDemo` component to test all image types:

```typescript
import { PexelsDemo } from '@/components/PexelsDemo';

// Add to your navigation or test screen
<PexelsDemo />
```

## 🔒 Rate Limits

Pexels API has rate limits:
- 200 requests per hour for free tier
- 5000 requests per hour for paid tier

The service includes error handling for rate limit exceeded responses.

## 🎨 Customization

You can customize the search queries by modifying the service methods in `services/pexels.ts`:

```typescript
// Add more context to searches
const searchQuery = `${collectionName} ${cuisines.join(' ')} ${city} food restaurant atmosphere`;
```

## 🚀 Next Steps

1. **Add to Collections**: Update your collection components to use Pexels images
2. **Neighborhood Cards**: Implement neighborhood cards with location-based images
3. **Cuisine Pages**: Add cuisine-specific image galleries
4. **City Views**: Enhance city overview pages with skyline images
5. **Performance**: Implement image preloading for critical sections

## 📚 Resources

- [Pexels API Documentation](https://www.pexels.com/api/)
- [Pexels JavaScript SDK](https://github.com/pexels/pexels-js)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
