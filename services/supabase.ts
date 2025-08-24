import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          bio?: string;
          favorite_restaurants: string[];
          review_count: number;
          photo_count: number;
          tip_count: number;
          checkin_count: number;
          follower_count: number;
          following_count: number;
          is_local_expert: boolean;
          expert_areas: string[];
          joined_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          bio?: string;
          favorite_restaurants?: string[];
          review_count?: number;
          photo_count?: number;
          tip_count?: number;
          checkin_count?: number;
          follower_count?: number;
          following_count?: number;
          is_local_expert?: boolean;
          expert_areas?: string[];
          joined_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          bio?: string;
          favorite_restaurants?: string[];
          review_count?: number;
          photo_count?: number;
          tip_count?: number;
          checkin_count?: number;
          follower_count?: number;
          following_count?: number;
          is_local_expert?: boolean;
          expert_areas?: string[];
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          restaurant_code: string;
          name: string;
          cuisine: string;
          price_range: string;
          image_url: string;
          images: string[];
          address: string;
          neighborhood: string;
          hours?: string;
          vibe: string[];
          description?: string;
          menu_highlights: string[];
          rating: number;
          reviews: string[];
          ai_description?: string;
          ai_vibes: string[];
          ai_top_picks: string[];
          phone?: string;
          website?: string;
          price_level?: number;
          vibe_tags: string[];
          booking_url?: string;
          latitude?: number;
          longitude?: number;
          cached_until?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_code: string;
          name: string;
          cuisine: string;
          price_range: string;
          image_url: string;
          images?: string[];
          address: string;
          neighborhood: string;
          hours?: string;
          vibe?: string[];
          description?: string;
          menu_highlights?: string[];
          rating?: number;
          reviews?: string[];
          ai_description?: string;
          ai_vibes?: string[];
          ai_top_picks?: string[];
          phone?: string;
          website?: string;
          price_level?: number;
          vibe_tags?: string[];
          booking_url?: string;
          latitude?: number;
          longitude?: number;
          cached_until?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          restaurant_code?: string;
          name?: string;
          cuisine?: string;
          price_range?: string;
          image_url?: string;
          images?: string[];
          address?: string;
          neighborhood?: string;
          hours?: string;
          vibe?: string[];
          description?: string;
          menu_highlights?: string[];
          rating?: number;
          reviews?: string[];
          ai_description?: string;
          ai_vibes?: string[];
          ai_top_picks?: string[];
          phone?: string;
          website?: string;
          price_level?: number;
          vibe_tags?: string[];
          booking_url?: string;
          latitude?: number;
          longitude?: number;
          updated_at?: string;
          cached_until?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          collection_code: string;
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
          collaborators: string[];
          unique_code?: string;
          planned_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          collection_code?: string;
          name: string;
          description?: string;
          cover_image?: string;
          created_by: string;
          creator_id?: string;
          occasion?: string;
          is_public?: boolean;
          likes?: number;
          equal_voting?: boolean;
          admin_weighted?: boolean;
          expertise_weighted?: boolean;
          minimum_participation?: number;
          voting_deadline?: string;
          allow_vote_changes?: boolean;
          anonymous_voting?: boolean;
          vote_visibility?: 'public' | 'anonymous' | 'admin_only';
          discussion_enabled?: boolean;
          auto_ranking_enabled?: boolean;
          consensus_threshold?: number;
          restaurant_ids?: string[];
          collaborators?: string[];
          unique_code?: string;
          planned_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          cover_image?: string;
          occasion?: string;
          is_public?: boolean;
          likes?: number;
          equal_voting?: boolean;
          admin_weighted?: boolean;
          expertise_weighted?: boolean;
          minimum_participation?: number;
          voting_deadline?: string;
          allow_vote_changes?: boolean;
          anonymous_voting?: boolean;
          vote_visibility?: 'public' | 'anonymous' | 'admin_only';
          discussion_enabled?: boolean;
          auto_ranking_enabled?: boolean;
          consensus_threshold?: number;
          restaurant_ids?: string[];
          collaborators?: string[];
          unique_code?: string;
          planned_date?: string;
          updated_at?: string;
        };
      };
      collection_members: {
        Row: {
          id: string;
          collection_id: string;
          user_id: string;
          role: 'admin' | 'member';
          vote_weight: number;
          is_verified: boolean;
          expertise: string[];
          joined_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          user_id: string;
          role?: 'admin' | 'member';
          vote_weight?: number;
          is_verified?: boolean;
          expertise?: string[];
          joined_at?: string;
        };
        Update: {
          role?: 'admin' | 'member';
          vote_weight?: number;
          is_verified?: boolean;
          expertise?: string[];
        };
      };
      collection_restaurants: {
        Row: {
          id: string;
          collection_id: string;
          restaurant_id: string;
          added_by: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          restaurant_id: string;
          added_by: string;
          added_at?: string;
        };
        Update: {
          added_by?: string;
          added_at?: string;
        };
      };
      restaurant_votes: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          collection_id?: string;
          vote: 'like' | 'dislike';
          authority: 'regular' | 'verified' | 'admin';
          weight: number;
          reason?: string;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          collection_id?: string;
          vote: 'like' | 'dislike';
          authority?: 'regular' | 'verified' | 'admin';
          weight?: number;
          reason?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          vote?: 'like' | 'dislike';
          authority?: 'regular' | 'verified' | 'admin';
          weight?: number;
          reason?: string;
          is_anonymous?: boolean;
          updated_at?: string;
        };
      };
      user_reviews: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          rating: number;
          review_text?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          rating: number;
          review_text?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          review_text?: string;
          notes?: string;
          updated_at?: string;
        };
      };
      plan_invitations: {
        Row: {
          id: string;
          plan_id: string;
          inviter_id: string;
          invitee_email: string;
          status: 'pending' | 'accepted' | 'declined';
          message?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          inviter_id: string;
          invitee_email: string;
          status?: 'pending' | 'accepted' | 'declined';
          message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'declined';
          updated_at?: string;
        };
      };
      api_calls: {
        Row: {
          id: string;
          user_id?: string;
          endpoint: string;
          method: string;
          request_data?: any;
          response_status?: number;
          response_data?: any;
          duration_ms?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          endpoint: string;
          method: string;
          request_data?: any;
          response_status?: number;
          response_data?: any;
          duration_ms?: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          endpoint?: string;
          method?: string;
          request_data?: any;
          response_status?: number;
          response_data?: any;
          duration_ms?: number;
        };
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          type: 'review' | 'photo' | 'tip' | 'checkin' | 'favorite' | 'collection' | 'vote';
          restaurant_id?: string;
          collection_id?: string;
          content?: string;
          metadata?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'review' | 'photo' | 'tip' | 'checkin' | 'favorite' | 'collection' | 'vote';
          restaurant_id?: string;
          collection_id?: string;
          content?: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          type?: 'review' | 'photo' | 'tip' | 'checkin' | 'favorite' | 'collection' | 'vote';
          restaurant_id?: string;
          collection_id?: string;
          content?: string;
          metadata?: any;
        };
      };
      restaurant_discussions: {
        Row: {
          id: string;
          restaurant_id: string;
          collection_id: string;
          user_id: string;
          message: string;
          parent_id?: string;
          likes: number;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          collection_id: string;
          user_id: string;
          message: string;
          parent_id?: string;
          likes?: number;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          message?: string;
          parent_id?: string;
          likes?: number;
          is_edited?: boolean;
          updated_at?: string;
        };
      };
      user_relationships: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
        };
      };
      restaurant_rankings: {
        Row: {
          id: string;
          collection_id: string;
          restaurant_id: string;
          net_score: number;
          likes: number;
          dislikes: number;
          like_ratio: number;
          engagement_boost: number;
          recency_boost: number;
          distance_boost: number;
          authority_applied: boolean;
          consensus: 'strong' | 'moderate' | 'mixed' | 'low';
          badge?: string;
          trend?: string;
          approval_percent: number;
          rank?: number;
          discussion_count: number;
          vote_details?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          restaurant_id: string;
          net_score?: number;
          likes?: number;
          dislikes?: number;
          like_ratio?: number;
          engagement_boost?: number;
          recency_boost?: number;
          distance_boost?: number;
          authority_applied?: boolean;
          consensus?: 'strong' | 'moderate' | 'mixed' | 'low';
          badge?: string;
          trend?: string;
          approval_percent?: number;
          rank?: number;
          discussion_count?: number;
          vote_details?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          net_score?: number;
          likes?: number;
          dislikes?: number;
          like_ratio?: number;
          engagement_boost?: number;
          recency_boost?: number;
          distance_boost?: number;
          authority_applied?: boolean;
          consensus?: 'strong' | 'moderate' | 'mixed' | 'low';
          badge?: string;
          trend?: string;
          approval_percent?: number;
          rank?: number;
          discussion_count?: number;
          vote_details?: any;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper functions for database operations
export const dbHelpers = {
  // User operations
  async createUser(userData: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Restaurant operations
  async createRestaurant(restaurantData: Database['public']['Tables']['restaurants']['Insert']) {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRestaurantById(id: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async searchRestaurants(query: string, city: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%,neighborhood.ilike.%${city}%`)
      .order('rating', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  async updateRestaurant(id: string, updates: Database['public']['Tables']['restaurants']['Update']) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Collection operations (alias for plans)
  async createPlan(planData: Database['public']['Tables']['collections']['Insert']) {
    try {
      // Generate a unique collection code
      const collectionCode = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('[Supabase] Creating plan with data:', { ...planData, collection_code: collectionCode });
      
      const { data, error } = await supabase
        .from('collections')
        .insert({
          ...planData,
          collection_code: collectionCode
        })
        .select()
        .single();
      
      if (error) {
        console.error('[Supabase] Error creating plan:', error);
        throw error;
      }
      
      console.log('[Supabase] Plan created successfully:', data);
      return data;
    } catch (error) {
      console.error('[Supabase] createPlan error:', error);
      throw error;
    }
  },

  async getPlanById(id: string) {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPlanByCode(code: string) {
    // For now, return null since we don't have unique_code in collections
    // This can be implemented later if needed
    return null;
  },

  async getUserPlans(userId: string) {
    try {
      console.log('[Supabase] Getting plans for user:', userId);
      
      // Get plans where user is creator
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('created_by', userId);
      
      if (error) {
        console.error('[Supabase] Error fetching user plans:', error);
        throw error;
      }
      
      console.log('[Supabase] Found plans:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[Supabase] getUserPlans error:', error);
      throw error;
    }
  },

  async updatePlan(id: string, updates: Database['public']['Tables']['collections']['Update']) {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePlan(id: string) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Collection operations (new names)
  async createCollection(collectionData: Database['public']['Tables']['collections']['Insert']) {
    return this.createPlan(collectionData);
  },

  async getCollectionById(id: string) {
    return this.getPlanById(id);
  },

  async getUserCollections(userId: string) {
    return this.getUserPlans(userId);
  },

  async updateCollection(id: string, updates: Database['public']['Tables']['collections']['Update']) {
    return this.updatePlan(id, updates);
  },

  async deleteCollection(id: string) {
    return this.deletePlan(id);
  },

  // Collection member operations
  async addCollectionMember(memberData: Database['public']['Tables']['collection_members']['Insert']) {
    const { data, error } = await supabase
      .from('collection_members')
      .insert(memberData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCollectionMembers(collectionId: string) {
    const { data, error } = await supabase
      .from('collection_members')
      .select('*, users(name, avatar_url, is_local_expert, expert_areas)')
      .eq('collection_id', collectionId);
    
    if (error) throw error;
    return data || [];
  },

  async removeCollectionMember(collectionId: string, userId: string) {
    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Collection restaurant operations
  async addRestaurantToCollection(collectionId: string, restaurantId: string, userId: string) {
    const { data, error } = await supabase
      .from('collection_restaurants')
      .insert({
        collection_id: collectionId,
        restaurant_id: restaurantId,
        added_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCollectionRestaurants(collectionId: string) {
    const { data, error } = await supabase
      .from('collection_restaurants')
      .select('*, restaurants(*)')
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async removeRestaurantFromCollection(collectionId: string, restaurantId: string) {
    const { error } = await supabase
      .from('collection_restaurants')
      .delete()
      .eq('collection_id', collectionId)
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
  },

  // Alias for backward compatibility
  async removeRestaurantFromPlan(planId: string, restaurantId: string) {
    return this.removeRestaurantFromCollection(planId, restaurantId);
  },

  // Restaurant vote operations
  async createRestaurantVote(voteData: Database['public']['Tables']['restaurant_votes']['Insert']) {
    const { data, error } = await supabase
      .from('restaurant_votes')
      .upsert(voteData, { onConflict: 'restaurant_id,user_id,collection_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserVotes(userId: string, collectionId?: string) {
    let query = supabase
      .from('restaurant_votes')
      .select('*, restaurants(*)')
      .eq('user_id', userId);
    
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getRestaurantVotes(restaurantId: string, collectionId?: string) {
    let query = supabase
      .from('restaurant_votes')
      .select('*, users(name, avatar_url)')
      .eq('restaurant_id', restaurantId);
    
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async deleteRestaurantVote(restaurantId: string, userId: string, collectionId?: string) {
    let query = supabase
      .from('restaurant_votes')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('user_id', userId);
    
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    
    const { error } = await query;
    
    if (error) throw error;
  },

  // Review operations
  async createReview(reviewData: Database['public']['Tables']['user_reviews']['Insert']) {
    const { data, error } = await supabase
      .from('user_reviews')
      .insert(reviewData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('user_reviews')
      .select('*, restaurants(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getRestaurantReviews(restaurantId: string) {
    const { data, error } = await supabase
      .from('user_reviews')
      .select('*, users(name, avatar_url)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Invitation operations
  async createInvitation(invitationData: Database['public']['Tables']['plan_invitations']['Insert']) {
    const { data, error } = await supabase
      .from('plan_invitations')
      .insert(invitationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPlanInvitations(planId: string) {
    const { data, error } = await supabase
      .from('plan_invitations')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateInvitationStatus(id: string, status: 'accepted' | 'declined') {
    const { data, error } = await supabase
      .from('plan_invitations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // API call tracking
  async logApiCall(callData: Database['public']['Tables']['api_calls']['Insert']) {
    const { data, error } = await supabase
      .from('api_calls')
      .insert(callData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getApiCallStats(userId?: string, days: number = 30) {
    let query = supabase
      .from('api_calls')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // User activity operations
  async logUserActivity(activityData: Database['public']['Tables']['user_activities']['Insert']) {
    const { data, error } = await supabase
      .from('user_activities')
      .insert(activityData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserActivities(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*, restaurants(name, image_url), collections(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Restaurant discussion operations
  async createDiscussion(discussionData: Database['public']['Tables']['restaurant_discussions']['Insert']) {
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .insert(discussionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRestaurantDiscussions(restaurantId: string, collectionId: string) {
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .select('*, users(name, avatar_url)')
      .eq('restaurant_id', restaurantId)
      .eq('collection_id', collectionId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getDiscussionReplies(parentId: string) {
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .select('*, users(name, avatar_url)')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async updateDiscussion(id: string, updates: Database['public']['Tables']['restaurant_discussions']['Update']) {
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User relationship operations
  async followUser(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('user_relationships')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('user_relationships')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) throw error;
  },

  async getFollowers(userId: string) {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('*, users!follower_id(name, avatar_url)')
      .eq('following_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('*, users!following_id(name, avatar_url)')
      .eq('follower_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // Restaurant ranking operations
  async calculateRestaurantRanking(collectionId: string) {
    // This would typically call a database function
    const { data, error } = await supabase
      .rpc('calculate_restaurant_ranking', { collection_uuid: collectionId });
    
    if (error) throw error;
    return data;
  },

  async getRestaurantRankings(collectionId: string) {
    const { data, error } = await supabase
      .from('restaurant_rankings')
      .select('*, restaurants(*)')
      .eq('collection_id', collectionId)
      .order('rank', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async updateRestaurantRanking(rankingId: string, updates: Database['public']['Tables']['restaurant_rankings']['Update']) {
    const { data, error } = await supabase
      .from('restaurant_rankings')
      .update(updates)
      .eq('id', rankingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Additional helper functions for components
  async getCollectionDiscussions(collectionId: string, restaurantId?: string) {
    let query = supabase
      .from('restaurant_discussions')
      .select('*, users(name, avatar_url)')
      .eq('collection_id', collectionId);
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async inviteToCollection(collectionId: string, inviterId: string, inviteeEmail: string, message?: string) {
    const { data, error } = await supabase
      .from('plan_invitations')
      .insert({
        plan_id: collectionId,
        inviter_id: inviterId,
        invitee_email: inviteeEmail,
        message
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCollectionSettings(collectionId: string, settings: Database['public']['Tables']['collections']['Update']) {
    return this.updateCollection(collectionId, settings);
  }
};