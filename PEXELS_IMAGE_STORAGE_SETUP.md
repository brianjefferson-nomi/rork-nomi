# Pexels Image Storage Setup

This document explains how to set up the Pexels image storage system that automatically saves Pexels images to the database.

## Overview

The system automatically:
1. Fetches images from Pexels API
2. Saves them to the database for future use
3. Reduces API calls by reusing saved images
4. Maintains image metadata and context

## Database Setup

### 1. Run the Migration

Execute the SQL migration to create the `pexels_images` table:

```sql
-- Run this in your Supabase SQL editor
\i database/migrations/create_pexels_images_table.sql
```

### 2. Table Structure

The `pexels_images` table stores:

- **Basic Info**: Pexels ID, image URLs, dimensions, photographer
- **Context**: Collection ID, neighborhood, city, cuisine
- **Type**: Image purpose (collection, neighborhood, cuisine, city, custom)
- **Timestamps**: Created and updated dates

### 3. Indexes

Performance indexes are created for:
- Pexels ID lookups
- Collection ID filtering
- Image type filtering
- City/neighborhood/cuisine filtering

## How It Works

### Collection Images

1. **First Request**: Fetches from Pexels API and saves to database
2. **Subsequent Requests**: Retrieves from database (faster, no API calls)
3. **Context Updates**: Automatically updates image context when needed

### Image Context

Images are saved with context information:
- **Collection ID**: Links image to specific collection
- **City**: For city-specific collections
- **Cuisine**: For cuisine-specific collections
- **Neighborhood**: For neighborhood-specific collections

## API Integration

### PexelsService

The `PexelsService` automatically:
- Checks database first for existing images
- Fetches from Pexels if no saved image exists
- Saves new images to database
- Returns images in consistent format

### usePexelsImage Hook

React hook that:
- Manages image loading states
- Handles errors gracefully
- Automatically saves images to database
- Provides consistent image data

## Benefits

1. **Performance**: Faster image loading after first request
2. **Cost Savings**: Reduced Pexels API calls
3. **Consistency**: Same images for same contexts
4. **Offline Support**: Images available even without internet
5. **Context Awareness**: Images linked to relevant data

## Usage Examples

### Collection Cover Images

```typescript
const { image } = usePexelsImage(
  collection.name,
  'collection',
  {
    cuisines: collection.cuisines,
    city: collection.city,
    collectionId: collection.id
  }
);
```

### Neighborhood Images

```typescript
const { image } = usePexelsImage(
  neighborhood,
  'neighborhood',
  { city: 'NYC' }
);
```

## Error Handling

The system gracefully handles:
- Pexels API failures
- Database connection issues
- Missing image data
- Network timeouts

## Monitoring

Check the console for logs:
- `[PexelsService]` - Image fetching and saving
- `[PexelsImageStorage]` - Database operations
- `[usePexelsImage]` - Hook operations

## Troubleshooting

### Common Issues

1. **Images not saving**: Check database permissions and RLS policies
2. **Slow loading**: Verify database indexes are created
3. **API errors**: Check Pexels API key and rate limits

### Database Queries

Check saved images:
```sql
SELECT * FROM pexels_images WHERE image_type = 'collection';
```

Check image usage:
```sql
SELECT p.*, c.name as collection_name 
FROM pexels_images p 
LEFT JOIN collections c ON p.collection_id = c.id;
```

## Future Enhancements

- Image compression and optimization
- CDN integration for faster delivery
- Image analytics and usage tracking
- Automatic image rotation and variety
- Bulk image operations
