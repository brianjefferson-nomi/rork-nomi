import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { MapPin, Clock, DollarSign, Heart, ThumbsUp, ThumbsDown, Edit2, Bookmark, ChevronLeft, ChevronRight, Award, UserPlus, UserMinus, Eye } from 'lucide-react-native';
import { useRestaurantById, useRestaurants, useRestaurantVotes } from '@/hooks/restaurant-store';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = useRestaurantById(id);
  const { favoriteRestaurants, toggleFavorite, voteRestaurant, addUserNote, collections, addRestaurantToCollection } = useRestaurants();
  const votes = useRestaurantVotes(id);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(restaurant?.userNotes || '');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const isFavorite = favoriteRestaurants.includes(restaurant.id);

  const handleSaveNote = () => {
    addUserNote(restaurant.id, noteText);
    setEditingNote(false);
  };

  const handleAddToCollection = () => {
    const availableCollections = collections.filter(c => !c.restaurants.includes(restaurant.id));
    
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
          onPress: () => {
            addRestaurantToCollection(c.id, restaurant.id);
            Alert.alert('Success', `Added to ${c.name}`);
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const images = restaurant.images || [restaurant.imageUrl];
  const hasMultipleImages = images.length > 1;
  const sortedContributors = useMemo(() => (restaurant.contributors?.slice().sort((a, b) => b.thumbsUp - a.thumbsUp) || []), [restaurant.contributors]);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
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
          <Image source={{ uri: images[currentImageIndex] }} style={styles.heroImage} />
          
          {hasMultipleImages && (
            <>
              <TouchableOpacity onPress={prevImage} style={[styles.heroNavButton, styles.heroPrevButton]}>
                <ChevronLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextImage} style={[styles.heroNavButton, styles.heroNextButton]}>
                <ChevronRight size={24} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.heroImageIndicators}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.heroIndicator,
                      index === currentImageIndex && styles.heroActiveIndicator
                    ]}
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
            {(restaurant.aiVibes || restaurant.vibe).map((v, i) => (
              <View key={i} style={styles.vibeTag}>
                <Text style={styles.vibeText}>{v}</Text>
              </View>
            ))}
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
                <Text style={styles.infoText}>{restaurant.address}</Text>
                <Text style={styles.infoSubtext}>{restaurant.neighborhood}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Clock size={18} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoText}>{restaurant.hours}</Text>
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

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Menu Highlights</Text>
            {(restaurant.aiTopPicks || restaurant.menuHighlights).map((item, i) => (
              <View key={i} style={styles.menuItem}>
                <Text style={styles.menuItemText}>• {item}</Text>
              </View>
            ))}
          </View>

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
                  value={noteText}
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
                    setNoteText(restaurant.userNotes || '');
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
  menuItem: {
    paddingVertical: 6,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
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
});