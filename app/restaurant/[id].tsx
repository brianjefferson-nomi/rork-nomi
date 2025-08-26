import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { MapPin, Clock, DollarSign, Heart, ThumbsUp, ThumbsDown, Edit2, Bookmark, ChevronLeft, ChevronRight, Award, UserPlus, UserMinus, Eye, Utensils } from 'lucide-react-native';
import { useRestaurantById, useRestaurants, useRestaurantVotes } from '@/hooks/restaurant-store';

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
  const restaurant = useRestaurantById(id || '');
  const { favoriteRestaurants, toggleFavorite, voteRestaurant, addUserNote, collections, addRestaurantToCollection } = useRestaurants();
  const votes = useRestaurantVotes(id || '');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(restaurant?.userNotes || null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [enhancedImages, setEnhancedImages] = useState<string[]>([]);
  const [foodRecommendations, setFoodRecommendations] = useState<string[]>([]);
  const [loadingEnhancements, setLoadingEnhancements] = useState(true);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  
  const sortedContributors = useMemo(() => (restaurant?.contributors?.slice().sort((a, b) => b.thumbsUp - a.thumbsUp) || []), [restaurant?.contributors]);

  // Enhanced restaurant data loading with proper image assignment and caching
  useEffect(() => {
    const loadData = async () => {
      if (!restaurant) return;
      
      setLoadingEnhancements(true);
      try {
        // Import the image assignment function
        const { assignRestaurantImages, generateValidatedMenuItems, cleanupExpiredCache } = await import('@/services/api');
        
        // Clean up expired cache periodically
        cleanupExpiredCache();
        
        // Assign proper images with fallback logic
        const assignedImages = await assignRestaurantImages({
          photos: restaurant.images || [restaurant.imageUrl],
          cuisine: restaurant.cuisine,
          name: restaurant.name
        });
        
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
        
        setEnhancedImages(assignedImages);
        // Only use actual menu highlights, not generated fallback dishes
        const actualMenuItems = restaurant.aiTopPicks || restaurant.menuHighlights || [];
        setFoodRecommendations(validatedMenuItems.length > 0 ? validatedMenuItems : 
          (actualMenuItems.length > 0 ? actualMenuItems : []).slice(0, 8)
        );
      } catch (error) {
        console.error('Error loading enhanced restaurant data:', error);
        // Fallback to original data
        setEnhancedImages(restaurant.images || [restaurant.imageUrl]);
        // Only use actual menu highlights, not generated fallback dishes
        const actualMenuItems = restaurant.aiTopPicks || restaurant.menuHighlights || [];
        setFoodRecommendations(actualMenuItems.length > 0 ? actualMenuItems.slice(0, 8) : []);
      } finally {
        setLoadingEnhancements(false);
      }
    };
    
    if (restaurant) {
      loadData();
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
    console.log('[RestaurantDetail] Collections data:', collections?.map(c => ({ id: c.id, name: c.name, restaurant_ids: c.restaurant_ids })));
    
    const availableCollections = collections.filter(c => {
      // Handle both restaurant_ids and restaurants fields, and ensure they exist
      const restaurantIds = c.restaurant_ids || [];
      const isAlreadyInCollection = restaurantIds.includes(restaurant.id);
      console.log(`[RestaurantDetail] Collection ${c.name}: restaurant_ids=${restaurantIds}, already_included=${isAlreadyInCollection}`);
      return !isAlreadyInCollection;
    });
    
    console.log('[RestaurantDetail] Available collections after filtering:', availableCollections.length);
    
    if (availableCollections.length === 0) {
      Alert.alert('No Collections', 'This restaurant is already in all your collections or you have no collections.');
      return;
    }

    Alert.alert(
      'Add to Collection',
      'Choose a collection:',
      [
        ...availableCollections.map(c => ({
          text: c.name,
          onPress: async () => {
            try {
              console.log(`[RestaurantDetail] Adding restaurant ${restaurant.id} to collection ${c.id}`);
              await addRestaurantToCollection(c.id, restaurant.id);
              console.log(`[RestaurantDetail] Successfully added to ${c.name}`);
              Alert.alert('Success', `Added to ${c.name}`);
            } catch (error) {
              console.error(`[RestaurantDetail] Error adding to collection:`, error);
              Alert.alert('Error', `Failed to add to ${c.name}. Please try again.`);
            }
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const images = enhancedImages.length > 0 ? enhancedImages : (restaurant?.images || [restaurant?.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400']).filter(img => img && img.trim().length > 0);
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
              const fallback = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&q=80';
              if (enhancedImages.length > 0) {
                setEnhancedImages(prev => {
                  const next = [...prev];
                  next[currentImageIndex] = fallback;
                  return next;
                });
              }
            }}
          />
          
          {loadingEnhancements && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.imageLoadingText}>Loading images...</Text>
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
              <Text style={styles.ratingText}>★ {restaurant.rating}</Text>
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

            {restaurant.bookingUrl && (
              <TouchableOpacity style={styles.reserveButton} onPress={() => {
                try {
                  console.log('Opening booking URL', restaurant.bookingUrl);
                  // Using WebBrowser for a consistent in-app experience
                  import('expo-web-browser').then(WebBrowser => {
                    WebBrowser.openBrowserAsync(restaurant.bookingUrl ?? '');
                  });
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
                <Text style={styles.infoText}>{restaurant.address || 'Address not available'}</Text>
                {restaurant.neighborhood && <Text style={styles.infoSubtext}>{restaurant.neighborhood}</Text>}
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
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
});