import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Heart, BookOpen, Users, Star, Camera, MessageSquare, MapPin, Settings, Edit3, LogOut } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants } from '@/hooks/restaurant-store';
import { supabase } from '@/services/supabase';

export default function ProfileScreen() {
  const { favoriteRestaurants, collections } = useRestaurants();
  
  const stats = [
    { icon: Heart, label: 'Favorites', value: favoriteRestaurants.length, color: '#FF6B6B' },
    { icon: BookOpen, label: 'Collections', value: collections.length, color: '#4A90E2' },
    { icon: Users, label: 'Friends', value: 12, color: '#50C878' },
    { icon: Star, label: 'Reviews', value: 28, color: '#FFD700' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              } else {
                router.replace('/auth');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' }} 
            style={styles.avatar}
          />
          <Text style={styles.name}>Sarah Johnson</Text>
          <Text style={styles.bio}>Food enthusiast & restaurant explorer 🍽️</Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Icon size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Added Le Bernardin to favorites</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Created &ldquo;Date Night Winners&rdquo; collection</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Shared 3 restaurants with friends</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Favorite Cuisines</Text>
            <Text style={styles.preferenceValue}>Italian, Japanese, Mexican</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Dietary Restrictions</Text>
            <Text style={styles.preferenceValue}>Vegetarian options preferred</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Price Range</Text>
            <Text style={styles.preferenceValue}>$$ - $$$</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 20,
    marginTop: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  preferenceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});