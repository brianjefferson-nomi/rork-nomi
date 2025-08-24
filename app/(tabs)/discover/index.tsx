import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Search, Filter, MapPin } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants } from '@/hooks/restaurant-store';

const cuisineTypes = ['All', 'Italian', 'French', 'Chinese', 'American', 'Deli', 'Bakery', 'Gastropub'];
const priceRanges = ['All', '$', '$$', '$$$', '$$$$'];

export default function DiscoverScreen() {
  const { restaurants, userLocation, switchToCity } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCuisine = selectedCuisine === 'All' || 
                             restaurant.cuisine.includes(selectedCuisine);
      
      const matchesPrice = selectedPrice === 'All' || 
                          restaurant.priceRange === selectedPrice;
      
      return matchesSearch && matchesCuisine && matchesPrice;
    });
  }, [restaurants, searchQuery, selectedCuisine, selectedPrice]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.locationSwitcher}>
          <MapPin size={16} color="#666" />
          <TouchableOpacity 
            style={[styles.cityButton, userLocation?.city === 'New York' && styles.cityButtonActive]}
            onPress={() => switchToCity('New York')}
          >
            <Text style={[styles.cityButtonText, userLocation?.city === 'New York' && styles.cityButtonTextActive]}>NYC</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.cityButton, userLocation?.city === 'Los Angeles' && styles.cityButtonActive]}
            onPress={() => switchToCity('Los Angeles')}
          >
            <Text style={[styles.cityButtonText, userLocation?.city === 'Los Angeles' && styles.cityButtonTextActive]}>LA</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search restaurants in ${userLocation?.city || 'NYC'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Cuisine</Text>
            <View style={styles.filterOptions}>
              {cuisineTypes.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.filterChip,
                    selectedCuisine === cuisine && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedCuisine(cuisine)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedCuisine === cuisine && styles.filterChipTextActive
                  ]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Price</Text>
            <View style={styles.filterOptions}>
              {priceRanges.map(price => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.filterChip,
                    selectedPrice === price && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedPrice(price)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedPrice === price && styles.filterChipTextActive
                  ]}>
                    {price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          {filteredRestaurants.length} restaurants found
        </Text>
        
        <View style={styles.restaurantsList}>
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurant.id } })}
              compact
            />
          ))}
        </View>
        
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1A1A1A',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterGroup: {
    marginRight: 16,
  },
  filterLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  results: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  restaurantsList: {
    gap: 12,
  },
  locationSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cityButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  cityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cityButtonTextActive: {
    color: '#FFF',
  },
});