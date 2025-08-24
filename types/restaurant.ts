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
  phone?: string;
  website?: string;
  priceLevel?: number;
  vibeTags?: string[];
}

export interface Collection {
  id: string;
  collection_code?: string;
  name: string;
  description?: string;
  cover_image?: string;
  created_by: string;
  creator_id?: string;
  occasion?: string;
  is_public: boolean;
  likes: number;
  equal_voting: boolean;
  admin_weighted: boolean;
  expertise_weighted: boolean;
  minimum_participation: number;
  voting_deadline?: string;
  allow_vote_changes: boolean;
  anonymous_voting: boolean;
  vote_visibility: 'public' | 'anonymous' | 'admin_only';
  discussion_enabled: boolean;
  auto_ranking_enabled: boolean;
  consensus_threshold: number;
  restaurant_ids: string[];
  collaborators: string[] | CollectionMember[];
  unique_code?: string;
  planned_date?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  coverImage?: string;
  restaurants?: string[];
  createdBy?: string;
  createdAt?: Date;
  isPublic?: boolean;
  votingRules?: VotingRules;
  settings?: CollectionSettings;
  analytics?: CollectionAnalytics;
}

export interface CollectionMember {
  userId: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  voteWeight: number;
  isVerified?: boolean;
  expertise?: string[];
}

export interface VotingRules {
  equalVoting: boolean;
  adminWeighted: boolean;
  expertiseWeighted: boolean;
  minimumParticipation: number;
  votingDeadline?: Date;
  allowVoteChanges: boolean;
  anonymousVoting: boolean;
}

export interface CollectionSettings {
  voteVisibility: 'public' | 'anonymous' | 'admin_only';
  discussionEnabled: boolean;
  autoRankingEnabled: boolean;
  consensusThreshold: number;
}

export interface CollectionAnalytics {
  totalVotes: number;
  participationRate: number;
  consensusScore: number;
  topInfluencers: string[];
  votingPatterns: Record<string, number>;
  decisionTimeline: VoteEvent[];
}

export interface VoteEvent {
  id: string;
  userId: string;
  restaurantId: string;
  vote: 'like' | 'dislike';
  timestamp: Date;
  reason?: string;
  previousVote?: 'like' | 'dislike';
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
  collectionId?: string;
  vote: 'like' | 'dislike';
  timestamp?: string;
  authority?: 'regular' | 'verified' | 'admin';
  weight?: number;
  reason?: string;
  isAnonymous?: boolean;
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
  rank: number;
  voteDetails: VoteBreakdown;
  discussionCount: number;
}

export interface VoteBreakdown {
  likeVoters: VoterInfo[];
  dislikeVoters: VoterInfo[];
  abstentions: string[];
  reasons: VoteReason[];
  timeline: VoteEvent[];
}

export interface VoterInfo {
  userId: string;
  name: string;
  avatar: string;
  timestamp: Date;
  weight: number;
  isVerified?: boolean;
  reason?: string;
}

export interface VoteReason {
  category: string;
  count: number;
  examples: string[];
}

export interface RestaurantDiscussion {
  id: string;
  restaurantId: string;
  collectionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  replies?: RestaurantDiscussion[];
  likes: number;
  isEdited?: boolean;
}

export interface GroupRecommendation {
  id: string;
  type: 'compromise' | 'alternative' | 'similar';
  title: string;
  description: string;
  restaurants: string[];
  confidence: number;
  reasoning: string;
  createdAt: Date;
}