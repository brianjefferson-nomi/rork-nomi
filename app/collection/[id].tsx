import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Users, Heart, Trash2 } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useCollectionById, useCollectionRestaurants, useRestaurants } from '@/hooks/restaurant-store';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const collection = useCollectionById(id);
  const restaurants = useCollectionRestaurants(id);
  const { removeRestaurantFromCollection, deleteCollection } = useRestaurants();

  if (!collection) {
    return (
      <View style={styles.errorContainer}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteCollection(collection.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleRemoveRestaurant = (restaurantId: string, restaurantName: string) => {
    Alert.alert(
      'Remove Restaurant',
      `Remove ${restaurantName} from this collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeRestaurantFromCollection(collection.id, restaurantId)
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: collection.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteCollection}>
              <Trash2 size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.name}>{collection.name}</Text>
          <Text style={styles.description}>{collection.description}</Text>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Heart size={16} color="#FF6B6B" fill="#FF6B6B" />
              <Text style={styles.statText}>{collection.likes} likes</Text>
            </View>
            {collection.collaborators.length > 0 && (
              <View style={styles.stat}>
                <Users size={16} color="#666" />
                <Text style={styles.statText}>{collection.collaborators.length + 1} contributors</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.restaurantsList}>
          <Text style={styles.sectionTitle}>{restaurants.length} Restaurants</Text>
          {restaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No restaurants in this collection yet</Text>
            </View>
          ) : (
            restaurants.map(restaurant => (
              <View key={restaurant.id} style={styles.restaurantItem}>
                <RestaurantCard
                  restaurant={restaurant}
                  onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurant.id } })}
                  compact
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveRestaurant(restaurant.id, restaurant.name)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  restaurantsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  restaurantItem: {
    marginBottom: 12,
  },
  removeButton: {
    marginTop: -8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});