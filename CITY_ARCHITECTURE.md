# City-Specific Architecture

This document explains the new scalable architecture for city-specific home pages.

## Overview

We've implemented a **hybrid approach** that combines the benefits of separate pages with shared components for maximum maintainability and flexibility.

## Architecture Components

### 1. Shared Component (`CityHomePage`)
- **Location**: `components/CityHomePage.tsx`
- **Purpose**: Reusable component that renders city-specific content
- **Features**: 
  - Accepts a `CityConfig` object to customize behavior
  - Handles all city-specific filtering and data loading
  - Renders sections based on city configuration

### 2. City Configuration (`cities.ts`)
- **Location**: `config/cities.ts`
- **Purpose**: Centralized configuration for all cities
- **Features**:
  - Type-safe city configuration interface
  - Easy to add new cities
  - City-specific data (coordinates, filters, images, etc.)

### 3. City-Specific Pages
- **NYC**: `app/(tabs)/nyc.tsx`
- **LA**: `app/(tabs)/la.tsx`
- **Purpose**: Thin wrappers that use the shared component
- **Benefits**: 
  - Separate URLs for SEO
  - City-specific routing
  - Easy to customize per city if needed

## Adding a New City

To add a new city (e.g., Chicago), follow these steps:

### Step 1: Add City Configuration
```typescript
// In config/cities.ts
export const CHICAGO_CONFIG: CityConfig = {
  name: 'Chicago',
  shortName: 'chicago',
  coordinates: { lat: 41.8781, lng: -87.6298 },
  filterPattern: /chicago|loop|river north|gold coast|lincoln park|wicker park|bucktown|west loop|south loop|illinois|il/i,
  greeting: 'Discover Chicago',
  subtitle: 'The best of Chicago dining',
  sectionOrder: 'localFirst',
  neighborhoodImages: {
    'The Loop': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    // ... more neighborhoods
  },
  mockCollections: [
    // City-specific mock collections
  ]
};

// Add to CITIES object
export const CITIES = {
  nyc: NYC_CONFIG,
  la: LA_CONFIG,
  chicago: CHICAGO_CONFIG, // Add this line
} as const;
```

### Step 2: Create City Page
```typescript
// Create app/(tabs)/chicago.tsx
import React from 'react';
import CityHomePage from '@/components/CityHomePage';
import { CHICAGO_CONFIG } from '@/config/cities';

export default function ChicagoHomeScreen() {
  return <CityHomePage cityConfig={CHICAGO_CONFIG} />;
}
```

### Step 3: Update Tab Layout
```typescript
// In app/(tabs)/_layout.tsx, add:
<Tabs.Screen
  name="chicago"
  options={{
    title: "Chicago",
    tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
  }}
/>
```

### Step 4: Update Navigation
```typescript
// In components/SearchWizard.tsx, add Chicago button
<TouchableOpacity 
  style={[styles.cityButton, userLocation?.city === 'Chicago' && styles.cityButtonActive]}
  onPress={() => router.push('/chicago' as any)}
>
  <Text style={[styles.cityButtonText, userLocation?.city === 'Chicago' && styles.cityButtonTextActive]}>Chicago</Text>
</TouchableOpacity>
```

## Benefits of This Architecture

### ✅ **Maintainability**
- Single source of truth for city logic
- Easy to update features across all cities
- DRY principle - no code duplication

### ✅ **Scalability**
- Adding new cities requires minimal code changes
- Configuration-driven approach
- Type-safe city configurations

### ✅ **Flexibility**
- Each city can have custom behavior if needed
- City-specific section ordering
- Custom neighborhood images and collections

### ✅ **SEO & UX**
- Separate URLs for each city (`/nyc`, `/la`)
- City-specific content and branding
- Better user experience with dedicated pages

### ✅ **Performance**
- No filtering logic on every render
- Direct data access for each city
- Optimized for city-specific content

## City Configuration Options

### `CityConfig` Interface
```typescript
interface CityConfig {
  name: string;                    // Display name (e.g., "NYC")
  shortName: string;               // URL-friendly name (e.g., "nyc")
  coordinates: { lat: number; lng: number }; // City center coordinates
  filterPattern: RegExp;           // Regex to filter restaurants by city
  greeting: string;                // Header greeting text
  subtitle: string;                // Header subtitle text
  neighborhoodImages: Record<string, string>; // Neighborhood background images
  mockCollections: Collection[];   // City-specific mock collections
  sectionOrder: 'localFirst' | 'trendingFirst'; // Section ordering preference
}
```

### Section Ordering
- **`localFirst`**: Shows "Local Restaurants" first (NYC style)
- **`trendingFirst`**: Shows "Trending" first (LA style)

## Migration from Old Architecture

The old single-page approach has been replaced with:
1. **Shared component** for all city logic
2. **Configuration-driven** city customization
3. **Separate pages** for better SEO and UX
4. **Type-safe** city management

## Future Enhancements

### Easy to Add:
- City-specific themes/colors
- Custom section layouts per city
- City-specific features (e.g., NYC subway integration)
- Dynamic city loading from API
- Admin panel for city management

### Scaling Considerations:
- When you reach 10+ cities, consider a database-driven approach
- For 50+ cities, implement dynamic routing
- For international expansion, add language/locale support

## Example: Adding Chicago

The Chicago configuration is already included as an example. To enable it:

1. Uncomment the Chicago line in `CITIES` object
2. Create `app/(tabs)/chicago.tsx`
3. Add Chicago tab to the layout
4. Add Chicago button to SearchWizard

This demonstrates how easy it is to extend the system for new cities!
