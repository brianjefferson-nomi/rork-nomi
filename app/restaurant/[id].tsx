import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { MapPin, Clock, DollarSign, Heart, ThumbsUp, ThumbsDown, Edit2, Bookmark, ChevronLeft, ChevronRight, Award, UserPlus, UserMinus, Eye, Utensils, Camera, Globe } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRestaurantById, useRestaurants, useRestaurantVotes } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { CollectionSelectorModal } from '@/components/CollectionSelectorModal';
import { PhotoUploadButton } from '@/components/PhotoUploadButton';
import { RestaurantPhotoGallery } from '@/components/RestaurantPhotoGallery';
import { PhotoPickerModal } from '@/components/PhotoPickerModal';
import { PhotoUploadService } from '@/services/photo-upload';
import { useUnifiedImages } from '@/hooks/use-unified-images';
import { useRestaurantRealtime } from '@/hooks/use-restaurant-realtime';
import { formatAddressForDisplay } from '@/utils/address-formatting';

const { width } = Dimensions.get('window');

// Helper function to generate cuisine-specific dishes
const generateCuisineSpecificDishes = (cuisine: string, restaurantName: string): string[] => {
  const dishes: Record<string, string[]> = {
    'Italian': ['Margherita Pizza', 'Spaghetti Carbonara', 'Osso Buco', 'Risotto Milanese', 'Tiramisu', 'Bruschetta', 'Penne Arrabbiata', 'Gelato'],
    'Japanese': ['Salmon Sashimi', 'Chicken Teriyaki', 'Miso Ramen', 'Tempura Vegetables', 'California Roll', 'Gyoza', 'Chirashi Bowl', 'Mochi Ice Cream'],
    'Mexican': ['Fish Tacos', 'Guacamole & Chips', 'Carnitas', 'Chicken Enchiladas', 'Churros', 'Quesadillas', 'Pozole', 'Tres Leches Cake'],
    'French': ['Coq au Vin', 'French Onion Soup', 'Crème Brûlée', 'Escargot', 'Bouillabaisse', 'Ratatouille', 'Croissants', 'Macarons'],
    'Thai': ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Massaman Curry', 'Som Tam', 'Thai Basil Chicken', 'Coconut Ice Cream'],
    'Indian': ['Butter Chicken', 'Biryani', 'Naan Bread', 'Samosas', 'Tandoori Chicken', 'Dal Makhani', 'Palak Paneer', 'Kulfi'],
    'American': ['Classic Burger', 'Mac and Cheese', 'BBQ Ribs', 'Apple Pie', 'Buffalo Wings', 'Clam Chowder', 'Cheesecake', 'Fried Chicken'],
    'Chinese': ['Kung Pao Chicken', 'Fried Rice', 'Dumplings', 'Sweet and Sour Pork', 'Peking Duck', 'Hot Pot', 'Dim Sum', 'Fortune Cookies'],
    'Mediterranean': ['Hummus Platter', 'Grilled Octopus', 'Moussaka', 'Baklava', 'Greek Salad', 'Lamb Souvlaki', 'Falafel', 'Tzatziki'],
    'Korean': ['Bulgogi', 'Kimchi', 'Bibimbap', 'Korean BBQ', 'Japchae', 'Tteokbokki', 'Korean Fried Chicken', 'Bingsu']
  };
  
  const cuisineDishes = dishes[cuisine] || ['House Special', 'Chef\'s Choice', 'Daily Special', 'Signature Dish', 'Popular Item'];
  return cuisineDishes.slice(0, 8);
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('[RestaurantDetail] Looking for restaurant with ID:', id);
  const restaurant = useRestaurantById(id || '');
  console.log('[RestaurantDetail] Found restaurant:', restaurant?.name || 'NOT FOUND');
  const { favoriteRestaurants, toggleFavorite, voteRestaurant, addUserNote, collections, addRestaurantToCollection, enhanceRestaurantWithWebsiteAndHours } = useRestaurants();
  const { user } = useAuth();
  const votes = useRestaurantVotes(id || '');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(restaurant?.userNotes || null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [foodRecommendations, setFoodRecommendations] = useState<string[]>([]);
  const [loadingEnhancements, setLoadingEnhancements] = useState(true);
  
  // Use unified images hook
  const { images: unifiedImages, hasUploadedPhotos, uploadedPhotoCount, refreshImages, isLoading: imagesLoading } = useUnifiedImages(restaurant);
  
  // Real-time updates for this restaurant
  const { isConnected } = useRestaurantRealtime({
    restaurantId: restaurant?.id,
    onRestaurantUpdate: (update) => {
      console.log(`[RestaurantDetail] Real-time update received for ${restaurant?.name}:`, update);
      // The restaurant store will handle the update automatically
      // We can add additional UI feedback here if needed
    },
    onPhotoInsert: (photo) => {
      console.log(`[RestaurantDetail] Real-time photo insert for ${restaurant?.name}:`, photo);
      // Refresh images to show the new photo
      refreshImages();
    },
    onPhotoUpdate: (photo) => {
      console.log(`[RestaurantDetail] Real-time photo update for ${restaurant?.name}:`, photo);
      // Refresh images to show the updated photo
      refreshImages();
    },
    onPhotoDelete: (photo) => {
      console.log(`[RestaurantDetail] Real-time photo delete for ${restaurant?.name}:`, photo);
      // Refresh images to remove the deleted photo
      refreshImages();
    }
  });
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [photoGalleryRefreshTrigger, setPhotoGalleryRefreshTrigger] = useState(0);
  
  const sortedContributors = useMemo(() => (restaurant?.contributors?.slice().sort((a, b) => b.thumbsUp - a.thumbsUp) || []), [restaurant?.contributors]);

  // Enhance restaurant with website and hours data if missing
  useEffect(() => {
    if (restaurant && (restaurant.googlePlaceId || restaurant.tripadvisor_location_id)) {
      const needsWebsite = !restaurant.website;
      const needsHours = !restaurant.hours || restaurant.hours === 'Hours vary';
      
      if (needsWebsite || needsHours) {
        console.log(`[RestaurantDetail] Enhancing ${restaurant.name} with website and hours data...`);
        enhanceRestaurantWithWebsiteAndHours(restaurant.id);
      }
    }
  }, [restaurant, enhanceRestaurantWithWebsiteAndHours]);

  // Images are now handled entirely by the useUnifiedImages hook
  // No need for separate image loading logic

  // Get available collections (collections where restaurant is not already added and user has permission to add)
  const availableCollections = useMemo(() => {
    if (!restaurant || !collections || !user) return [];
    
    return collections.filter(c => {
      const restaurantIds = c.restaurant_ids || [];
      const isRestaurantAlreadyAdded = restaurantIds.includes(restaurant.id);
      
      // For public collections, only the creator can add restaurants
      if (c.is_public) {
        const isCreator = c.created_by === user.id || (c as any).creator_id === user.id;
        return !isRestaurantAlreadyAdded && isCreator;
      }
      
      // For private collections, check if user is owner or member
      const isOwner = c.created_by === user.id || (c as any).creator_id === user.id;
      const isMember = (c as any).collaborators && Array.isArray((c as any).collaborators) && (c as any).collaborators.includes(user.id);
      
      return !isRestaurantAlreadyAdded && (isOwner || isMember);
    });
  }, [restaurant, collections, user]);

  // Load food recommendations only (images are handled by useUnifiedImages hook)
  useEffect(() => {
    const loadFoodRecommendations = async () => {
      if (!restaurant) return;
      
      setLoadingEnhancements(true);
      try {
        // Import the menu generation function
        const { generateValidatedMenuItems, cleanupExpiredCache } = await import('@/services/api');
        
        // Clean up expired cache periodically
        cleanupExpiredCache();
        
        // Generate validated menu items with caching
        let validatedMenuItems: string[] = [];
        try {
          validatedMenuItems = await generateValidatedMenuItems(
            restaurant.name,
            restaurant.cuisine,
            restaurant.reviews || [],
            restaurant.id
          );
        } catch (error) {
          console.error('Error generating menu items:', error);
          validatedMenuItems = generateCuisineSpecificDishes(restaurant.cuisine, restaurant.name);
        }
        
        // Only use actual menu highlights, not generated fallback dishes
        const actualMenuItems = restaurant.aiTopPicks || restaurant.menuHighlights || [];
        setFoodRecommendations(validatedMenuItems.length > 0 ? validatedMenuItems : 
          (actualMenuItems.length > 0 ? actualMenuItems : []).slice(0, 8)
        );
      } catch (error) {
        console.error('Error loading food recommendations:', error);
        // Only use actual menu highlights, not generated fallback dishes
        const actualMenuItems = restaurant.aiTopPicks || restaurant.menuHighlights || [];
        setFoodRecommendations(actualMenuItems.length > 0 ? actualMenuItems.slice(0, 8) : 
          generateCuisineSpecificDishes(restaurant.cuisine, restaurant.name)
        );
      } finally {
        setLoadingEnhancements(false);
      }
    };

    if (restaurant) {
      loadFoodRecommendations();
    }
  }, [restaurant]);



  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const isFavorite = favoriteRestaurants.includes(restaurant.id);

  const handleSaveNote = () => {
    if (noteText) {
      addUserNote(restaurant.id, noteText);
    }
    setEditingNote(false);
  };

  const handleAddToCollection = () => {
    if (!restaurant) {
      console.log('[RestaurantDetail] No restaurant data available');
      Alert.alert('Error', 'Restaurant data not available');
      return;
    }
    
    console.log('[RestaurantDetail] Available collections:', collections?.length || 0);
    console.log('[RestaurantDetail] Restaurant ID:', restaurant.id);
    console.log('[RestaurantDetail] Available collections after filtering:', availableCollections.length);
    
    if (availableCollections.length === 0) {
      Alert.alert('No Collections', 'This restaurant is already in all your collections or you have no collections.');
      return;
    }

    setShowCollectionModal(true);
  };

  const handleSelectCollection = async (collection: any) => {
    try {
      console.log(`[RestaurantDetail] Adding restaurant ${restaurant?.id} to collection ${collection.id}`);
      await addRestaurantToCollection(collection.id, restaurant?.id || '');
      console.log(`[RestaurantDetail] Successfully added to ${collection.name}`);
      setShowCollectionModal(false);
      Alert.alert('Success', `Added to ${collection.name}`);
    } catch (error) {
      console.error(`[RestaurantDetail] Error adding to collection:`, error);
      Alert.alert('Error', `Failed to add to ${collection.name}. Please try again.`);
    }
  };

  const handleCreateCollection = () => {
    setShowCollectionModal(false);
    router.push('/create-collection');
  };

  const handlePhotoUploaded = async (photo: any) => {
    console.log('[RestaurantDetail] Photo uploaded successfully:', photo.url);
    
    // Refresh the photo gallery
    setPhotoGalleryRefreshTrigger(prev => prev + 1);
    
    // Refresh unified images to include the new photo
    refreshImages();
  };

  const handleMainImageSet = async (imageUrl: string) => {
    console.log('[RestaurantDetail] Setting main image:', imageUrl);
    
    // Update the main image in the database
    if (restaurant?.id) {
      try {
        await PhotoUploadService.updateRestaurantMainImage(restaurant.id, imageUrl);
        console.log('[RestaurantDetail] Updated restaurant main image in database');
      } catch (error) {
        console.error('[RestaurantDetail] Error updating restaurant main image:', error);
      }
    }
    
    // Refresh unified images to reflect the change
    refreshImages();
    
    // Refresh the photo gallery
    setPhotoGalleryRefreshTrigger(prev => prev + 1);
  };

  // Use unified images as the only source - no fallback to Pexels
  // Show default image while loading
  const defaultImage = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
  const images = imagesLoading ? [defaultImage] : unifiedImages;
  const hasMultipleImages = images.length > 1;
  
  const toggleFollow = (id: string) => {
    setFollowing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Stack.Screen options={{ title: restaurant.name }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImageContainer}>
          <Image 
            source={{ uri: images[currentImageIndex] }} 
            style={styles.heroImage}
                    onError={() => {
          console.log('Image failed to load:', images[currentImageIndex]);
          // Image error handling is now managed by the useUnifiedImages hook
          // No need to manually set fallback images
        }}
          />
          
          {(loadingEnhancements || imagesLoading) && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.imageLoadingText}>
                {imagesLoading ? 'Loading images...' : 'Loading menu items...'}
              </Text>
            </View>
          )}
          
          {/* Real-time connection indicator */}
          {isConnected && (
            <View style={styles.realtimeIndicator}>
              <View style={styles.realtimeDot} />
            </View>
          )}
          

          
          {hasMultipleImages && (
            <>
              <TouchableOpacity onPress={prevImage} style={[styles.heroNavButton, styles.heroPrevButton]} testID="hero-prev">
                <ChevronLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextImage} style={[styles.heroNavButton, styles.heroNextButton]} testID="hero-next">
                <ChevronRight size={24} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.heroImageIndicators}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.heroIndicator,
                      index === currentImageIndex && styles.heroActiveIndicator
                    ]}
                    onPress={() => setCurrentImageIndex(index)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
            </View>
            <View style={styles.rating}>
              <Text style={styles.ratingText}>★ {(() => {
                // Get the best available rating (prioritize Google > TripAdvisor > original)
                if (restaurant.googleRating && restaurant.googleRating > 0) {
                  return Number(restaurant.googleRating).toFixed(1);
                }
                if (restaurant.tripadvisor_rating && restaurant.tripadvisor_rating > 0) {
                  return Number(restaurant.tripadvisor_rating).toFixed(1);
                }
                return (Number(restaurant.rating) || 0).toFixed(1);
              })()}</Text>
            </View>
          </View>

          <View style={styles.vibeContainer}>
            {(() => {
              const validVibes = (restaurant.aiVibes || restaurant.vibe || [])
                .filter(v => v && typeof v === 'string' && v.trim().length > 0)
                .map(v => {
                  // Ensure single word and capitalized with safety checks
                  const firstWord = v.split(' ')[0];
                  if (!firstWord || firstWord.length === 0) return null;
                  const firstChar = firstWord.charAt(0);
                  const restOfWord = firstWord.slice(1);
                  const cleanTag = (firstChar ? firstChar.toUpperCase() : '') + (restOfWord ? restOfWord.toLowerCase() : '');
                  if (!cleanTag || cleanTag.length === 0) return null;
                  return cleanTag;
                })
                .filter(Boolean);
              
              return validVibes.map((cleanTag, i) => (
                <View key={i} style={styles.vibeTag}>
                  <Text style={styles.vibeText}>{cleanTag}</Text>
                </View>
              ));
            })()}
          </View>

          <Text style={styles.description}>{restaurant.aiDescription || restaurant.description}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.iconButton, isFavorite && styles.iconButtonActive]}
              onPress={() => toggleFavorite(restaurant.id)}
              testID="favorite-btn"
            >
              <Heart size={20} color={isFavorite ? '#FFF' : '#FF6B6B'} fill={isFavorite ? '#FF6B6B' : 'transparent'} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={handleAddToCollection} testID="add-to-list-btn">
              <Bookmark size={20} color="#FF6B6B" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setShowPhotoModal(true)}
              testID="add-photo-btn"
            >
              <Camera size={20} color="#FF6B6B" />
            </TouchableOpacity>

            {restaurant.bookingUrl && (
              <TouchableOpacity style={styles.reserveButton} onPress={async () => {
                try {
                  console.log('Opening booking URL', restaurant.bookingUrl);
                  // Using WebBrowser for a consistent in-app experience
                  await WebBrowser.openBrowserAsync(restaurant.bookingUrl ?? '');
                } catch (e) {
                  console.error('Failed to open browser', e);
                  Alert.alert('Unable to open reservation', 'Please try again later.');
                }
              }} testID="reserve-now-btn">
                <Text style={styles.reserveButtonText}>Reserve</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.infoItem}>
              <MapPin size={18} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoText}>{formatAddressForDisplay(restaurant.address || '', restaurant.neighborhood, restaurant.city)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Clock size={18} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoText}>{restaurant.hours || 'Hours vary'}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <DollarSign size={18} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Price Range</Text>
                <Text style={styles.infoText}>{restaurant.priceRange}</Text>
              </View>
            </View>
            {restaurant.website && (
              <View style={styles.infoItem}>
                <Globe size={18} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <TouchableOpacity onPress={async () => {
                    try {
                      console.log('Opening website URL', restaurant.website);
                      await WebBrowser.openBrowserAsync(restaurant.website ?? '');
                    } catch (e) {
                      console.error('Failed to open website', e);
                      Alert.alert('Unable to open website', 'Please try again later.');
                    }
                  }}>
                    <Text style={[styles.infoText, styles.websiteLink]}>
                      {restaurant.website}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>





          {/* Menu Highlights - only show if there are actual menu highlights */}
          {(() => {
            // Only show if there are actual menu highlights (not generated/fallback dishes)
            const menuHighlights = restaurant.menuHighlights || [];
            const aiTopPicks = restaurant.aiTopPicks || [];
            
            // Filter out generic dishes
            const filterGenericDishes = (dishes: string[]) => {
              const genericTerms = [
                'chef special', 'house favorite', 'seasonal dish', 'signature dish', 
                'popular item', 'daily special', 'chef\'s choice', 'house special',
                'special', 'favorite', 'dish', 'item', 'choice', 'recommended'
              ];
              
              return dishes.filter(dish => {
                const lowerDish = dish.toLowerCase();
                return !genericTerms.some(term => lowerDish.includes(term));
              });
            };
            
            // Only use actual menu highlights, not generated dishes
            const actualMenuItems = [
              ...filterGenericDishes(menuHighlights),
              ...filterGenericDishes(aiTopPicks)
            ];
            
            // If no actual menu items, don't show the section
            if (actualMenuItems.length === 0) {
              return null;
            }
            
            return (
              <View style={styles.menuSection}>
                <View style={styles.menuHeader}>
                  <Utensils size={20} color="#FF6B6B" />
                  <Text style={styles.sectionTitle}>Menu Highlights</Text>
                </View>
                {loadingEnhancements ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF6B6B" />
                    <Text style={styles.loadingText}>Loading menu items...</Text>
                  </View>
                ) : (
                  <View style={styles.menuGrid}>
                    {actualMenuItems.slice(0, 8).map((item, i) => (
                      <View key={i} style={styles.menuHighlightItem}>
                        <Text style={styles.menuItemName}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })()}

          {sortedContributors.length > 0 && (
            <View style={styles.contributorsSection}>
              <Text style={styles.sectionTitle}>Top Contributors</Text>
              {sortedContributors.slice(0, 3).map((contributor, index) => {
                const isFollowing = !!following[contributor.id];
                return (
                  <View key={contributor.id} style={styles.contributorItem}>
                    <View style={styles.contributorRank}>
                      {index === 0 && <Award size={16} color="#FFD700" />}
                      {index === 1 && <Award size={16} color="#C0C0C0" />}
                      {index === 2 && <Award size={16} color="#CD7F32" />}
                      <Text style={styles.contributorRankText}>#{index + 1}</Text>
                    </View>
                    <Image source={{ uri: contributor.avatar }} style={styles.contributorAvatar} />
                    <View style={styles.contributorInfo}>
                      <Text style={styles.contributorName}>{contributor.name}</Text>
                      <Text style={styles.contributorContributions}>
                        {contributor.contributions.join(', ')}
                      </Text>
                      <View style={styles.contributorActionsRow}>
                        <TouchableOpacity onPress={() => toggleFollow(contributor.id)} style={[styles.followBtn, isFollowing && styles.followBtnActive]} testID={`follow-${contributor.id}`}>
                          {isFollowing ? <UserMinus size={14} color={isFollowing ? '#FFF' : '#FF6B6B'} /> : <UserPlus size={14} color={isFollowing ? '#FFF' : '#FF6B6B'} />}
                          <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/profile' as any)} style={styles.viewProfileBtn}>
                          <Eye size={14} color="#1A1A1A" />
                          <Text style={styles.viewProfileText}>View Profile</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.contributorStats}>
                      <ThumbsUp size={14} color="#50C878" />
                      <Text style={styles.contributorThumbsUp}>{contributor.thumbsUp}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.votingSection}>
            <Text style={styles.sectionTitle}>Community Rating</Text>
            <View style={styles.voteButtons}>
              <TouchableOpacity 
                style={[styles.voteButton, votes.userVote === 'like' && styles.voteButtonActive]}
                onPress={() => voteRestaurant(restaurant.id, 'like')}
              >
                <ThumbsUp size={20} color={votes.userVote === 'like' ? '#FFF' : '#50C878'} />
                <Text style={[styles.voteText, votes.userVote === 'like' && styles.voteTextActive]}>
                  {votes.likes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.voteButton, votes.userVote === 'dislike' && styles.voteButtonActive]}
                onPress={() => voteRestaurant(restaurant.id, 'dislike')}
              >
                <ThumbsDown size={20} color={votes.userVote === 'dislike' ? '#FFF' : '#FF6B6B'} />
                <Text style={[styles.voteText, votes.userVote === 'dislike' && styles.voteTextActive]}>
                  {votes.dislikes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.noteSection}>
            <View style={styles.noteSectionHeader}>
              <Text style={styles.sectionTitle}>Personal Notes</Text>
              <TouchableOpacity onPress={() => setEditingNote(!editingNote)}>
                <Edit2 size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            {editingNote ? (
              <View>
                <TextInput
                  style={styles.noteInput}
                  value={noteText || ''}
                  onChangeText={setNoteText}
                  placeholder="Add your personal notes..."
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.noteButtons}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => {
                    setNoteText(restaurant.userNotes || null);
                    setEditingNote(false);
                  }}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.noteText}>
                {restaurant.userNotes || 'No notes yet. Tap the edit icon to add some!'}
              </Text>
            )}
          </View>

          {/* Photo Gallery Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoSectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowPhotoGallery(!showPhotoGallery);
                  if (!showPhotoGallery) {
                    // Trigger refresh when opening gallery
                    setPhotoGalleryRefreshTrigger(prev => prev + 1);
                  }
                }}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {showPhotoGallery ? 'Hide' : 'View All'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showPhotoGallery ? (
              <RestaurantPhotoGallery
                restaurantId={restaurant.id}
                userId={user?.id || ''}
                onMainImageSet={handleMainImageSet}
                style={styles.photoGallery}
                refreshTrigger={photoGalleryRefreshTrigger}
              />
            ) : (
              <View style={styles.photoPreview}>
                <Text style={styles.photoPreviewText}>
                  Tap "View All" to see and manage photos
                </Text>
                <PhotoUploadButton
                  restaurantId={restaurant.id}
                  userId={user?.id || ''}
                  onPhotoUploaded={handlePhotoUploaded}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 32 }} />
              </ScrollView>

        {/* Collection Selector Modal */}
        <CollectionSelectorModal
          visible={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          collections={availableCollections}
          onSelectCollection={handleSelectCollection}
          onCreateCollection={handleCreateCollection}
          restaurantName={restaurant?.name}
        />

        {/* Photo Picker Modal */}
        <PhotoPickerModal
          visible={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          restaurantId={restaurant.id}
          userId={user?.id || ''}
          onPhotoUploaded={handlePhotoUploaded}
        />
      </>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageContainer: {
    position: 'relative',
    width: width,
    height: 250,
  },
  heroImage: {
    width: width,
    height: 250,
  },
  heroNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    padding: 12,
    zIndex: 2,
  },
  heroPrevButton: {
    left: 16,
  },
  heroNextButton: {
    right: 16,
  },
  heroImageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  heroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroActiveIndicator: {
    backgroundColor: '#FFF',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
  },
  rating: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
  vibeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  vibeTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 6,
  },
  vibeText: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  actionButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  actionButtonTextActive: {
    color: '#FFF',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF',
  },
  iconButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  reserveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  infoSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  websiteLink: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  menuGrid: {
    gap: 12,
  },
  menuHighlightItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'left',
  },
  votingSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  voteButtonActive: {
    backgroundColor: '#333',
  },
  voteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  voteTextActive: {
    color: '#FFF',
  },
  noteSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
  },
  noteSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noteButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  contributorsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contributorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contributorRank: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    marginRight: 12,
  },
  contributorRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF',
  },
  followBtnActive: {
    backgroundColor: '#FF6B6B',
  },
  followBtnText: { fontSize: 12, color: '#FF6B6B', fontWeight: '600' },
  followBtnTextActive: { color: '#FFF' },
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#F5F5F5' },
  viewProfileText: { fontSize: 12, color: '#1A1A1A', fontWeight: '600' },
  contributorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  contributorContributions: {
    fontSize: 12,
    color: '#666',
  },
  contributorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contributorThumbsUp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#50C878',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  imageLoadingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imageTypeIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageTypeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
  },
  photoSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  photoGallery: {
    minHeight: 200,
  },
  photoPreview: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  photoPreviewText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    textAlign: 'center',
  },
  realtimeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 12,
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
});