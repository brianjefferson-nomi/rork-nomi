export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  imageUrl: string;
  images?: string[];
  address: string;
  neighborhood: string;
  hours: string;
  vibe: string[];
  description: string;
  menuHighlights: string[];
  rating: number;
  userNotes?: string;
  bookingUrl?: string;
  reviews?: string[];
  aiDescription?: string;
  aiVibes?: string[];
  aiTopPicks?: string[];
  contributors?: RestaurantContributor[];
  commentsCount?: number;
  savesCount?: number;
  sharesCount?: number;
  averageGroupStars?: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  restaurants: string[];
  createdBy: string;
  collaborators: string[];
  createdAt: Date;
  occasion?: string;
  isPublic: boolean;
  likes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  favoriteRestaurants: string[];
  collections: string[];
  reviewCount?: number;
  photoCount?: number;
  tipCount?: number;
  checkinCount?: number;
  followerCount?: number;
  followingCount?: number;
  isLocalExpert?: boolean;
  expertAreas?: string[];
  joinedDate?: Date;
}

export interface RestaurantVote {
  restaurantId: string;
  userId: string;
  vote: 'like' | 'dislike';
  timestamp?: string;
  authority?: 'regular' | 'verified' | 'admin';
  weight?: number;
}

export interface RestaurantContributor {
  id: string;
  name: string;
  avatar: string;
  thumbsUp: number;
  contributions: string[];
  isVerified?: boolean;
  badges?: string[];
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  joinedDate?: Date;
  reviewCount?: number;
  photoCount?: number;
  tipCount?: number;
  checkinCount?: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'review' | 'photo' | 'tip' | 'checkin' | 'favorite' | 'collection';
  restaurantId?: string;
  collectionId?: string;
  content?: string;
  timestamp: Date;
}

export interface SearchFilter {
  location?: string;
  radius?: number;
  cuisine?: string[];
  priceRange?: ('$' | '$$' | '$$$' | '$$$$')[];
  rating?: number;
  isOpenNow?: boolean;
  features?: string[];
}

export interface ContributorList {
  id: string;
  name: string;
  contributors: string[];
  createdBy: string;
  isPrivate: boolean;
  createdAt: Date;
}

export interface RankedRestaurantMeta {
  restaurantId: string;
  netScore: number;
  likes: number;
  dislikes: number;
  likeRatio: number;
  engagementBoost: number;
  recencyBoost: number;
  distanceBoost: number;
  authorityApplied: boolean;
  consensus: 'strong' | 'moderate' | 'mixed' | 'low';
  badge?: 'group_favorite' | 'debated' | 'unanimous' | 'top_choice';
  trend?: 'up' | 'down' | 'steady';
  approvalPercent: number;
}