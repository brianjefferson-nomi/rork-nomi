# Restaurant Photo Upload System

A complete photo upload system that allows users to upload, manage, and organize photos for restaurants directly in your app.

## 🚀 Features

- **Camera Integration**: Take photos directly with the device camera
- **Photo Library Access**: Select photos from the device's photo library
- **Photo Management**: View, delete, and set photos as main restaurant image
- **Real-time Updates**: Photos appear immediately in the restaurant detail screen
- **User Attribution**: Track who uploaded each photo
- **Storage Optimization**: Efficient image storage with Supabase Storage

## 📱 User Experience

### For Users:
1. **Upload Photos**: Tap the camera icon in restaurant detail screen
2. **Choose Source**: Select "Take Photo" or "Choose from Library"
3. **Manage Photos**: View all photos in the "Photos" section
4. **Set Main Image**: Long-press any photo to set as main restaurant image
5. **Delete Photos**: Remove unwanted photos with confirmation

### For Developers:
- Clean, reusable components
- Type-safe TypeScript implementation
- Error handling and loading states
- Optimized image processing

## 🛠️ Setup Instructions

### 1. Database Setup

Run the migration in your Supabase dashboard:

```sql
-- Copy and paste the contents of:
-- database/migrations/create_restaurant_photos_table.sql
```

This creates:
- `restaurant_photos` table for metadata
- `restaurant-photos` storage bucket
- Proper RLS policies for security

### 2. Verify Setup

Run the setup verification script:

```bash
node scripts/setup-photo-upload.js
```

### 3. Test the Feature

1. Open any restaurant detail screen
2. Tap the camera icon in the action buttons
3. Take or select a photo
4. View the photo in the "Photos" section

## 📁 File Structure

```
services/
├── photo-upload.ts              # Core photo upload service

components/
├── PhotoUploadButton.tsx        # Upload button component
├── RestaurantPhotoGallery.tsx   # Photo gallery with management
└── PhotoPickerModal.tsx         # Modal for photo selection

database/migrations/
└── create_restaurant_photos_table.sql  # Database setup

scripts/
├── setup-photo-upload.js        # Setup verification
└── update-restaurant-images.js  # Manual image updates
```

## 🔧 Components Overview

### PhotoUploadButton
A versatile button component for triggering photo uploads:

```tsx
<PhotoUploadButton
  restaurantId="restaurant-id"
  userId="user-id"
  onPhotoUploaded={(photo) => console.log('Photo uploaded!')}
  variant="primary" // primary, secondary, outline
  size="medium"     // small, medium, large
  showText={true}
/>
```

### RestaurantPhotoGallery
Full photo management interface:

```tsx
<RestaurantPhotoGallery
  restaurantId="restaurant-id"
  userId="user-id"
  onMainImageSet={(imageUrl) => console.log('Main image updated!')}
/>
```

### PhotoPickerModal
Modal for photo selection with camera/library options:

```tsx
<PhotoPickerModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  restaurantId="restaurant-id"
  userId="user-id"
  onPhotoUploaded={(photo) => console.log('Photo uploaded!')}
/>
```

## 🎯 Integration Points

### Restaurant Detail Screen
The photo upload is integrated into the main restaurant detail screen with:

- **Camera Icon**: In the action buttons row
- **Photos Section**: Collapsible section showing all photos
- **Real-time Updates**: New photos appear immediately

### Image Display Priority
The system displays images in this order:
1. User-uploaded photos (newest first)
2. Google Places photos
3. TripAdvisor photos
4. Default fallback images

## 🔒 Security & Permissions

### Row Level Security (RLS)
- Users can only see photos for restaurants
- Users can only delete their own photos
- Authenticated users can upload photos

### Storage Security
- Photos stored in private Supabase Storage bucket
- Public URLs generated for display
- Automatic cleanup when photos are deleted

### Permissions Required
- Camera access (for taking photos)
- Photo library access (for selecting photos)

## 📊 Database Schema

### restaurant_photos Table
```sql
CREATE TABLE restaurant_photos (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Storage Structure
```
restaurant-photos/
├── restaurant-id-1/
│   ├── photo-1.jpg
│   └── photo-2.jpg
└── restaurant-id-2/
    └── photo-1.jpg
```

## 🚀 Usage Examples

### Basic Photo Upload
```typescript
import { PhotoUploadService } from '@/services/photo-upload';

// Upload a photo
const result = await PhotoUploadService.uploadPhoto(
  imageUri,
  restaurantId,
  userId
);

if (result.success) {
  console.log('Photo uploaded:', result.photo);
}
```

### Get Restaurant Photos
```typescript
// Get all photos for a restaurant
const photos = await PhotoUploadService.getRestaurantPhotos(restaurantId);
console.log('Restaurant photos:', photos);
```

### Delete a Photo
```typescript
// Delete a photo
const success = await PhotoUploadService.deletePhoto(photoId);
if (success) {
  console.log('Photo deleted successfully');
}
```

### Update Main Image
```typescript
// Set a photo as the main restaurant image
const success = await PhotoUploadService.updateRestaurantMainImage(
  restaurantId,
  photoUrl
);
```

## 🎨 Customization

### Styling
All components use consistent styling that matches your app's design system. You can customize:

- Button variants and sizes
- Photo grid layout
- Modal appearance
- Loading states

### Image Processing
The system automatically:
- Resizes images to optimal dimensions
- Compresses for faster uploads
- Generates thumbnails
- Handles different image formats

## 🔧 Troubleshooting

### Common Issues

1. **Photos not uploading**
   - Check Supabase connection
   - Verify storage bucket exists
   - Check user permissions

2. **Photos not displaying**
   - Verify image URLs are accessible
   - Check network connectivity
   - Clear app cache

3. **Permission errors**
   - Ensure camera/photo library permissions granted
   - Check RLS policies in Supabase

### Debug Mode
Enable debug logging by setting:
```typescript
console.log('[PhotoUpload] Debug mode enabled');
```

## 📈 Performance Considerations

- Images are compressed before upload
- Thumbnails generated for faster loading
- Lazy loading for photo galleries
- Efficient database queries with proper indexing

## 🔄 Future Enhancements

Potential improvements:
- Image editing capabilities
- Photo tagging and categorization
- Batch photo uploads
- Photo sharing between users
- Advanced image filters
- Photo compression options

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the component documentation
3. Test with the setup verification script
4. Check Supabase logs for errors

---

**Ready to use!** Your restaurant photo upload system is now fully integrated and ready for users to start adding photos to restaurants.
