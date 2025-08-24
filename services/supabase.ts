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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          cuisine: string;
          price_range: string;
          image_url: string;
          images: string[];
          address: string;
          neighborhood: string;
          hours: string;
          vibe: string[];
          description: string;
          menu_highlights: string[];
          rating: number;
          reviews: string[];
          ai_description?: string;
          ai_vibes?: string[];
          ai_top_picks?: string[];
          created_at: string;
          updated_at: string;
          cached_until?: string;
        };
        Insert: {
          id?: string;
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
          created_at?: string;
          updated_at?: string;
          cached_until?: string;
        };
        Update: {
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
          updated_at?: string;
          cached_until?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description?: string;
          image_url?: string;
          creator_id: string;
          collaborators: string[];
          restaurant_ids: string[];
          is_public: boolean;
          planned_date?: string;
          unique_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          image_url?: string;
          creator_id: string;
          collaborators?: string[];
          restaurant_ids?: string[];
          is_public?: boolean;
          planned_date?: string;
          unique_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          image_url?: string;
          collaborators?: string[];
          restaurant_ids?: string[];
          is_public?: boolean;
          planned_date?: string;
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

  // Plan operations
  async createPlan(planData: Database['public']['Tables']['plans']['Insert']) {
    // Generate unique code if not provided
    if (!planData.unique_code) {
      planData.unique_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const { data, error } = await supabase
      .from('plans')
      .insert(planData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPlanById(id: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPlanByCode(code: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('unique_code', code.toUpperCase())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserPlans(userId: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .or(`creator_id.eq.${userId},collaborators.cs.{"${userId}"}`);
    
    if (error) throw error;
    return data || [];
  },

  async updatePlan(id: string, updates: Database['public']['Tables']['plans']['Update']) {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePlan(id: string) {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);
    
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
  }
};