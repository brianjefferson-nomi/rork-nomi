import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { UserPlus, UserCheck, MapPin, Star, Camera, MessageSquare, CheckCircle } from 'lucide-react-native';
import { RestaurantContributor } from '@/types/restaurant';

interface ContributorCardProps {
  contributor: RestaurantContributor;
  onFollow?: (contributorId: string) => void;
  onViewProfile?: (contributorId: string) => void;
  onAddToList?: (contributorId: string) => void;
  compact?: boolean;
}

export function ContributorCard({ 
  contributor, 
  onFollow, 
  onViewProfile, 
  onAddToList,
  compact = false 
}: ContributorCardProps) {
  
  const handleFollow = () => {
    onFollow?.(contributor.id);
  };

  const handleViewProfile = () => {
    onViewProfile?.(contributor.id);
  };

  const handleAddToList = () => {
    onAddToList?.(contributor.id);
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleViewProfile}>
        <Image source={{ uri: contributor.avatar }} style={styles.compactAvatar} />
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={styles.compactName} numberOfLines={1}>{contributor.name}</Text>
            {contributor.isVerified && (
              <CheckCircle size={14} color="#4A90E2" fill="#4A90E2" />
            )}
          </View>
          <Text style={styles.compactStats}>
            {contributor.thumbsUp} 👍 • {contributor.reviewCount || 0} reviews
          </Text>
          {contributor.badges && contributor.badges.length > 0 && (
            <Text style={styles.compactBadge}>{contributor.badges[0]}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleFollow} style={styles.compactFollowBtn}>
          {contributor.isFollowing ? (
            <UserCheck size={16} color="#4A90E2" />
          ) : (
            <UserPlus size={16} color="#666" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewProfile} style={styles.profileSection}>
          <Image source={{ uri: contributor.avatar }} style={styles.avatar} />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{contributor.name}</Text>
              {contributor.isVerified && (
                <CheckCircle size={16} color="#4A90E2" fill="#4A90E2" />
              )}
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.followers}>
                {contributor.followerCount || 0} followers
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.following}>
                {contributor.followingCount || 0} following
              </Text>
            </View>
            {contributor.badges && contributor.badges.length > 0 && (
              <View style={styles.badgesContainer}>
                {contributor.badges.slice(0, 2).map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={handleFollow} 
            style={[
              styles.followButton,
              contributor.isFollowing && styles.followingButton
            ]}
          >
            {contributor.isFollowing ? (
              <>
                <UserCheck size={16} color="#4A90E2" />
                <Text style={styles.followingText}>Following</Text>
              </>
            ) : (
              <>
                <UserPlus size={16} color="#FFF" />
                <Text style={styles.followText}>Follow</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleAddToList} style={styles.addToListButton}>
            <Text style={styles.addToListText}>Add to List</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contributionStats}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Star size={16} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.statValue}>{contributor.reviewCount || 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Camera size={16} color="#FF6B6B" />
          </View>
          <View>
            <Text style={styles.statValue}>{contributor.photoCount || 0}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <MessageSquare size={16} color="#4A90E2" />
          </View>
          <View>
            <Text style={styles.statValue}>{contributor.tipCount || 0}</Text>
            <Text style={styles.statLabel}>Tips</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <MapPin size={16} color="#50C878" />
          </View>
          <View>
            <Text style={styles.statValue}>{contributor.checkinCount || 0}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
        </View>
      </View>

      <View style={styles.thumbsUpContainer}>
        <Text style={styles.thumbsUpText}>
          👍 {contributor.thumbsUp} people found their contributions helpful
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  followers: {
    fontSize: 13,
    color: '#666',
  },
  dot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 6,
  },
  following: {
    fontSize: 13,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '500',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  followingButton: {
    backgroundColor: '#E8F4FD',
  },
  followText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followingText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  addToListButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addToListText: {
    fontSize: 12,
    color: '#666',
  },
  contributionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  thumbsUpContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  thumbsUpText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  compactStats: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  compactBadge: {
    fontSize: 10,
    color: '#4A90E2',
    fontWeight: '500',
  },
  compactFollowBtn: {
    padding: 8,
  },
});