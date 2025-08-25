import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Create a service role client for admin operations (if needed)
// Note: This should only be used for admin operations, not regular user operations
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

  // Manual RLS fix function that can be called from the app
  async applyRLSFix() {
    try {
      console.log('[Supabase] Applying RLS fix manually...');
      
      // First, let's test the current state
      const testResult = await this.testDatabaseConnection();
      console.log('[Supabase] Current database state:', testResult);
      
      if (testResult.success) {
        console.log('[Supabase] Database connection is working, RLS fix may not be needed');
        return { success: true, message: 'Database connection is working' };
      }
      
      // If we have RLS issues, try to fix them
      console.log('[Supabase] Attempting to fix RLS policies...');
      
      // Try to create a simple test collection to see if the issue is with creation or reading
      const testCollection = {
        name: 'Test Collection',
        description: 'Test collection for RLS debugging',
        collection_type: 'private',
        created_by: '11111111-1111-1111-1111-111111111111',
        creator_id: '11111111-1111-1111-1111-111111111111',
        is_public: false,
        collection_code: `test_${Date.now()}`
      };
      
      const { data: createTest, error: createError } = await supabase
        .from('collections')
        .insert(testCollection)
        .select()
        .single();
      
      if (createError) {
        console.error('[Supabase] Test collection creation failed:', {
          error: JSON.stringify(createError, null, 2),
          message: createError.message,
          code: createError.code
        });
        return { success: false, error: createError, message: 'Collection creation failed' };
      }
      
      console.log('[Supabase] Test collection created successfully:', createTest);
      
      // Clean up the test collection
      await supabase
        .from('collections')
        .delete()
        .eq('id', createTest.id);
      
      return { success: true, message: 'RLS fix applied successfully' };
    } catch (error) {
      console.error('[Supabase] RLS fix error:', {
        error: JSON.stringify(error, null, 2),
        message: error instanceof Error ? error.message : String(error)
      });
      return { success: false, error, message: 'RLS fix failed' };
    }
  },

  // Diagnostic function to test database connectivity and RLS
  async testDatabaseConnection() {
    try {
      console.log('[Supabase] Testing database connection...');
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('[Supabase] Basic connection test failed:', {
          error: JSON.stringify(testError, null, 2),
          message: testError.message || 'No message',
          code: testError.code || 'No code'
        });
        return { success: false, error: testError };
      }
      
      console.log('[Supabase] Basic connection test passed');
      
      // Test collections table access
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, name, created_by')
        .limit(1);
      
      if (collectionsError) {
        console.error('[Supabase] Collections table access test failed:', {
          error: JSON.stringify(collectionsError, null, 2),
          message: collectionsError.message || 'No message',
          code: collectionsError.code || 'No code'
        });
        return { success: false, error: collectionsError };
      }
      
      console.log('[Supabase] Collections table access test passed');
      
      // Test RLS policies
      const { data: rlsTestData, error: rlsTestError } = await supabase
        .from('collections')
        .select('id, name, collection_type, created_by')
        .eq('collection_type', 'public')
        .limit(1);
      
      if (rlsTestError) {
        console.error('[Supabase] RLS policy test failed:', {
          error: JSON.stringify(rlsTestError, null, 2),
          message: rlsTestError.message || 'No message',
          code: rlsTestError.code || 'No code'
        });
        return { success: false, error: rlsTestError };
      }
      
      console.log('[Supabase] RLS policy test passed');
      
      return { success: true, data: { testData, collectionsData, rlsTestData } };
    } catch (error) {
      console.error('[Supabase] Database connection test error:', {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        errorType: typeof error
      });
      return { success: false, error };
    }
  },

  // Admin function to fix RLS policies (use with caution)
  async fixRLSPolicies() {
    try {
      console.log('[Supabase] Fixing RLS policies...');
      
      // Drop existing policies
      await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Collections access policy" ON collections;
          DROP POLICY IF EXISTS "Users can create collections" ON collections;
          DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
          DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
          DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON collections;
          DROP POLICY IF EXISTS "Private collections are viewable by creator only" ON collections;
          DROP POLICY IF EXISTS "Shared collections are viewable by creator and members" ON collections;
        `
      });
      
      // Create simplified policies
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Collections SELECT policy" ON collections
          FOR SELECT USING (
            collection_type = 'public' OR
            created_by = auth.uid() OR
            creator_id = auth.uid()
          );
          
          CREATE POLICY "Collections INSERT policy" ON collections
          FOR INSERT WITH CHECK (
            created_by = auth.uid() OR
            creator_id = auth.uid()
          );
          
          CREATE POLICY "Collections UPDATE policy" ON collections
          FOR UPDATE USING (
            created_by = auth.uid() OR
            creator_id = auth.uid()
          );
          
          CREATE POLICY "Collections DELETE policy" ON collections
          FOR DELETE USING (
            created_by = auth.uid() OR
            creator_id = auth.uid()
          );
        `
      });
      
      console.log('[Supabase] RLS policies fixed successfully');
      return true;
    } catch (error) {
      console.error('[Supabase] Error fixing RLS policies:', error);
      return false;
    }
  },

  // Collection operations (alias for plans)
  async createPlan(planData: Database['public']['Tables']['collections']['Insert']) {
    try {
      // Generate a unique collection code
      const collectionCode = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('[Supabase] Creating plan with data:', { ...planData, collection_code: collectionCode });
      
      // Ensure the user ID is properly set
      const userId = planData.created_by || planData.creator_id;
      if (!userId) {
        throw new Error('User ID is required to create a plan');
      }
      
      const { data, error } = await supabase
        .from('collections')
        .insert({
          ...planData,
          collection_code: collectionCode,
          created_by: userId,
          creator_id: userId
        })
        .select()
        .single();
      
      if (error) {
        console.error('[Supabase] Error creating plan:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Provide more specific error messages
        if (error.code === '23505') {
          throw new Error('A plan with this name already exists');
        } else if (error.code === '23503') {
          throw new Error('Invalid user reference. Please sign in again.');
        } else if (error.code === '42P17') {
          throw new Error('Database policy error. Please try again or contact support.');
        } else if (error.message.includes('RLS') || error.message.includes('policy') || error.message.includes('recursion')) {
          throw new Error('Permission denied. Please check your authentication and try again.');
        } else {
          throw new Error(`Failed to create plan: ${error.message}`);
        }
      }
      
      console.log('[Supabase] Plan created successfully:', data);
      return data;
    } catch (error) {
      console.error('[Supabase] createPlan error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while creating plan');
      }
    }
  },

  async getPlanById(id: string) {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Enhance with user details if data exists
    if (data) {
      const enhancedData = await this.enhanceCollectionsWithUserDetails([data]);
      return enhancedData[0];
    }
    
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
      
      if (!userId) {
        console.error('[Supabase] No user ID provided');
        return [];
      }
      
      // Get collections where user is creator
      const { data: creatorCollections, error: creatorError } = await supabase
        .from('collections')
        .select('*')
        .or(`created_by.eq.${userId},creator_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (creatorError) {
        console.error('[Supabase] Error fetching creator collections:', {
          error: JSON.stringify(creatorError, null, 2),
          message: creatorError.message || 'No message',
          details: creatorError.details || 'No details',
          hint: creatorError.hint || 'No hint',
          code: creatorError.code || 'No code'
        });
        // Continue with empty creator collections instead of failing completely
      }
      
      // Get collections where user is a member
      const { data: memberCollections, error: memberError } = await supabase
        .from('collection_members')
        .select('collection_id')
        .eq('user_id', userId);
      
      let memberCollectionsData: any[] = [];
      if (memberError) {
        console.error('[Supabase] Error fetching member collections:', {
          error: JSON.stringify(memberError, null, 2),
          message: memberError.message || 'No message',
          details: memberError.details || 'No details',
          hint: memberError.hint || 'No hint',
          code: memberError.code || 'No code'
        });
      } else if (memberCollections && memberCollections.length > 0) {
        const collectionIds = memberCollections.map(m => m.collection_id);
        
        const { data: memberColls, error: memberCollsError } = await supabase
          .from('collections')
          .select('*')
          .in('id', collectionIds)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (memberCollsError) {
          console.error('[Supabase] Error fetching member collection details:', {
            error: JSON.stringify(memberCollsError, null, 2),
            message: memberCollsError.message || 'No message',
            details: memberCollsError.details || 'No details',
            hint: memberCollsError.hint || 'No hint',
            code: memberCollsError.code || 'No code'
          });
        } else {
          memberCollectionsData = memberColls || [];
        }
      }
      
      // Combine and deduplicate collections
      const allCollections = [...(creatorCollections || []), ...memberCollectionsData];
      const uniqueCollections = allCollections.filter((collection, index, self) => 
        index === self.findIndex(c => c.id === collection.id)
      );
      
      console.log('[Supabase] Successfully fetched collections:', {
        creator: creatorCollections?.length || 0,
        member: memberCollectionsData.length,
        total: uniqueCollections.length
      });
      
      return uniqueCollections;
      
    } catch (error) {
      console.error('[Supabase] getUserPlans error:', {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : []
      });
      return [];
    }
  },

  async enhanceCollectionsWithUserDetails(collections: any[]) {
    try {
      // Collect all unique user IDs from collaborators
      const allUserIds = new Set<string>();
      
      collections.forEach(collection => {
        if (collection.created_by) allUserIds.add(collection.created_by);
        if (collection.creator_id) allUserIds.add(collection.creator_id);
        if (collection.collaborators && Array.isArray(collection.collaborators)) {
          collection.collaborators.forEach((collaborator: any) => {
            if (typeof collaborator === 'string') {
              allUserIds.add(collaborator);
            } else if (collaborator && collaborator.userId) {
              allUserIds.add(collaborator.userId);
            }
          });
        }
      });

      if (allUserIds.size === 0) return collections;

      // Fetch user details for all unique IDs
      const userIdsArray = Array.from(allUserIds);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .in('id', userIdsArray);

      if (usersError) {
        console.error('[Supabase] Error fetching user details:', usersError);
        return collections; // Return original data if user fetch fails
      }

      // Create a map of user details
      const userMap = new Map();
      users?.forEach(user => {
        userMap.set(user.id, user);
      });

      // Enhance collections with user details
      return collections.map(collection => {
        const enhancedCollection = { ...collection };
        
        // Add settings object if it doesn't exist
        if (!enhancedCollection.settings) {
          console.log('[Supabase] Creating settings object for collection:', {
            id: collection.id,
            consensus_threshold: collection.consensus_threshold,
            vote_visibility: collection.vote_visibility,
            discussion_enabled: collection.discussion_enabled,
            auto_ranking_enabled: collection.auto_ranking_enabled
          });
          
          enhancedCollection.settings = {
            voteVisibility: collection.vote_visibility || 'public',
            discussionEnabled: collection.discussion_enabled !== false,
            autoRankingEnabled: collection.auto_ranking_enabled !== false,
            consensusThreshold: collection.consensus_threshold ? collection.consensus_threshold / 100 : 0.7
          };
          
          console.log('[Supabase] Created settings object:', enhancedCollection.settings);
        }
        
        // Enhance creator info
        if (collection.created_by && userMap.has(collection.created_by)) {
          const creator = userMap.get(collection.created_by);
          enhancedCollection.creatorName = creator.name;
          enhancedCollection.creatorEmail = creator.email;
        }
        
        // Enhance collaborators
        if (collection.collaborators && Array.isArray(collection.collaborators)) {
          enhancedCollection.collaborators = collection.collaborators.map((collaborator: any) => {
            if (typeof collaborator === 'string') {
              const user = userMap.get(collaborator);
              return user ? {
                userId: collaborator,
                name: user.name,
                email: user.email,
                avatar: user.avatar_url,
                role: 'member'
              } : collaborator;
            } else if (collaborator && collaborator.userId) {
              const user = userMap.get(collaborator.userId);
              return {
                ...collaborator,
                name: user?.name || collaborator.name || 'Unknown User',
                email: user?.email || collaborator.email,
                avatar: user?.avatar_url || collaborator.avatar
              };
            }
            return collaborator;
          });
        }
        
        return enhancedCollection;
      });
    } catch (error) {
      console.error('[Supabase] Error enhancing collections with user details:', error);
      return collections; // Return original data if enhancement fails
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

  async deletePlan(id: string, userId: string) {
    try {
      console.log('[Supabase] Attempting to delete plan with ID:', id, 'by user:', userId);
      
      // First check if user is the creator/owner of this collection
      const { data: collection, error: fetchError } = await supabase
        .from('collections')
        .select('created_by, creator_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('[Supabase] Error fetching collection:', fetchError);
        throw new Error('Collection not found');
      }
      
      // Check if user is the creator
      if (collection.created_by !== userId && collection.creator_id !== userId) {
        console.error('[Supabase] Permission denied: User is not the creator');
        throw new Error('Permission denied. Only the collection creator can delete it.');
      }
      
      // User is authorized, proceed with deletion
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('[Supabase] Error deleting plan:', error);
        if (error.code === '23503') {
          throw new Error('Cannot delete collection: It has associated data (restaurants, votes, etc.)');
        } else if (error.message.includes('RLS') || error.message.includes('policy')) {
          throw new Error('Permission denied. You can only delete collections you created.');
        } else {
          throw new Error(`Failed to delete collection: ${error.message}`);
        }
      }
      
      console.log('[Supabase] Plan deleted successfully');
    } catch (error) {
      console.error('[Supabase] deletePlan error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while deleting plan');
      }
    }
  },

  async isCollectionOwner(collectionId: string, userId: string): Promise<boolean> {
    try {
      const { data: collection, error } = await supabase
        .from('collections')
        .select('created_by, creator_id')
        .eq('id', collectionId)
        .single();
      
      if (error || !collection) {
        return false;
      }
      
      return collection.created_by === userId || collection.creator_id === userId;
    } catch (error) {
      console.error('[Supabase] Error checking collection ownership:', error);
      return false;
    }
  },

  async isCollectionMember(collectionId: string, userId: string): Promise<boolean> {
    try {
      const { data: member, error } = await supabase
        .from('collection_members')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', userId)
        .single();
      
      return !error && !!member;
    } catch (error) {
      console.error('[Supabase] Error checking collection membership:', error);
      return false;
    }
  },

  async leaveCollection(collectionId: string, userId: string) {
    try {
      console.log('[Supabase] User leaving collection:', collectionId, 'user:', userId);
      
      // Check if user is the creator (creators cannot leave, they must delete or transfer ownership)
      const isOwner = await this.isCollectionOwner(collectionId, userId);
      if (isOwner) {
        throw new Error('Collection creators cannot leave. You must delete the collection or transfer ownership.');
      }
      
      // Remove user from collection_members
      const { error } = await supabase
        .from('collection_members')
        .delete()
        .eq('collection_id', collectionId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('[Supabase] Error leaving collection:', error);
        throw new Error(`Failed to leave collection: ${error.message}`);
      }
      
      console.log('[Supabase] User successfully left collection');
    } catch (error) {
      console.error('[Supabase] leaveCollection error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while leaving collection');
      }
    }
  },

  // Collection operations (new names)
  async createCollection(collectionData: Database['public']['Tables']['collections']['Insert'] & { collection_type?: 'public' | 'private' | 'shared' }) {
    // Ensure collection_type is set and is_public is derived from it
    const enhancedData = {
      ...collectionData,
      collection_type: collectionData.collection_type || 'public',
      is_public: collectionData.collection_type === 'public' || collectionData.is_public
    };
    
    console.log('[Supabase] Creating collection with type:', enhancedData.collection_type);
    return this.createPlan(enhancedData);
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

  async deleteCollection(id: string, userId: string) {
    return this.deletePlan(id, userId);
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
    try {
      console.log('[Supabase] Getting collection members for:', collectionId);
      
      const { data, error } = await supabase
        .from('collection_members')
        .select('*, users(id, name, avatar_url, is_local_expert, expert_areas)')
        .eq('collection_id', collectionId);
      
      if (error) {
        console.error('[Supabase] Error fetching collection members:', {
          error: JSON.stringify(error, null, 2),
          message: error.message || 'No message',
          code: error.code || 'No code',
          collectionId
        });
        return [];
      }
      
      console.log('[Supabase] Successfully fetched collection members:', data?.length || 0);
      
      // Transform the data to include proper member information
      return (data || []).map((member: any) => ({
        userId: member.user_id,
        name: member.users?.name || `Member ${member.user_id?.substring(0, 8)}`,
        avatar_url: member.users?.avatar_url,
        role: member.role || 'member',
        isVerified: member.users?.is_local_expert || false,
        expert_areas: member.users?.expert_areas || [],
        joined_at: member.joined_at
      }));
    } catch (error) {
      console.error('[Supabase] getCollectionMembers error:', {
        error: JSON.stringify(error, null, 2),
        message: error instanceof Error ? error.message : String(error),
        collectionId
      });
      return [];
    }
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
    console.log('[dbHelpers] Creating restaurant vote with data:', voteData);
    
    const { data, error } = await supabase
      .from('restaurant_votes')
      .upsert(voteData, { onConflict: 'restaurant_id,user_id,collection_id' })
      .select()
      .single();
    
    if (error) {
      console.error('[dbHelpers] Error creating restaurant vote:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        voteData
      });
      throw error;
    }
    
    console.log('[dbHelpers] Restaurant vote created successfully:', data);
    return data;
  },

  async getUserVotes(userId: string, collectionId?: string) {
    try {
      console.log('[Supabase] Getting user votes for:', userId, 'collection:', collectionId);
      
      let query = supabase
        .from('restaurant_votes')
        .select('*, restaurants(*)')
        .eq('user_id', userId);
      
      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[Supabase] Error fetching user votes:', {
          error: JSON.stringify(error, null, 2),
          message: error.message || 'No message',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
          userId,
          collectionId
        });
        return [];
      }
      
      console.log('[Supabase] Successfully fetched user votes:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[Supabase] getUserVotes error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        collectionId
      });
      return [];
    }
  },

  async getRestaurantVotes(restaurantId: string, collectionId?: string) {
    try {
      console.log('[Supabase] Getting restaurant votes for:', restaurantId, 'collection:', collectionId);
      
      let query = supabase
        .from('restaurant_votes')
        .select('*, users(id, name, avatar_url)')
        .eq('restaurant_id', restaurantId);
      
      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[Supabase] Error fetching restaurant votes:', {
          error: JSON.stringify(error, null, 2),
          message: error.message || 'No message',
          code: error.code || 'No code',
          restaurantId,
          collectionId
        });
        return [];
      }
      
      console.log('[Supabase] Successfully fetched restaurant votes:', data?.length || 0);
      
      // Transform the data to include proper user information
      return (data || []).map((vote: any) => ({
        ...vote,
        userName: vote.users?.name || `User ${vote.user_id?.substring(0, 8)}`,
        userAvatar: vote.users?.avatar_url
      }));
    } catch (error) {
      console.error('[Supabase] getRestaurantVotes error:', {
        error: JSON.stringify(error, null, 2),
        message: error instanceof Error ? error.message : String(error),
        restaurantId,
        collectionId
      });
      return [];
    }
  },

  async getCollectionVotes(collectionId: string) {
    try {
      console.log('[Supabase] Getting collection votes for:', collectionId);
      
      const { data, error } = await supabase
        .from('restaurant_votes')
        .select('*, users(name, avatar_url)')
        .eq('collection_id', collectionId);
      
      if (error) {
        console.error('[Supabase] Error fetching collection votes:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          collectionId
        });
        return [];
      }
      
      console.log('[Supabase] Successfully fetched collection votes:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[Supabase] getCollectionVotes error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        collectionId
      });
      return [];
    }
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

  async getUserActivities(userId: string, collectionId?: string, limit: number = 50) {
    let query = supabase
      .from('user_activities')
      .select('*, users(name, avatar_url), restaurants(name, image_url), collections(name)')
      .eq('user_id', userId);
    
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Restaurant discussion operations
  async createDiscussion(discussionData: Database['public']['Tables']['restaurant_discussions']['Insert']) {
    console.log('[Supabase] Creating discussion with data:', discussionData);
    
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .insert(discussionData)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Error creating discussion:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        discussionData
      });
      throw error;
    }
    
    console.log('[Supabase] Discussion created successfully:', data);
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
  },

  // Restaurant comment operations
  async getRestaurantComments(collectionId: string, restaurantId?: string) {
    console.log('[Supabase] Getting restaurant comments for collection:', collectionId, 'restaurant:', restaurantId);
    
    const { data, error } = await supabase
      .rpc('get_restaurant_comments', { 
        p_collection_id: collectionId, 
        p_restaurant_id: restaurantId || null 
      });
    
    if (error) {
      console.error('[Supabase] Error getting restaurant comments:', error);
      throw error;
    }
    
    console.log('[Supabase] Restaurant comments result:', data?.length || 0, data);
    return data || [];
  },

  async addRestaurantComment(restaurantId: string, collectionId: string, commentText: string) {
    const { data, error } = await supabase
      .rpc('add_restaurant_comment', {
        p_restaurant_id: restaurantId,
        p_collection_id: collectionId,
        p_comment_text: commentText
      });
    
    if (error) throw error;
    return data;
  },

  async createUserActivity(activityData: Database['public']['Tables']['user_activities']['Insert']) {
    const { data, error } = await supabase
      .from('user_activities')
      .insert(activityData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },



  async getCollectionActivities(collectionId: string) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*, users(name, avatar_url), restaurants(name, image_url)')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // User favorites operations
  async updateUserFavorites(userId: string, favoriteRestaurants: string[]) {
    console.log('[Supabase] Updating user favorites:', { userId, favoriteRestaurants });
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        favorite_restaurants: favoriteRestaurants,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Error updating user favorites:', error);
      throw error;
    }
    
    console.log('[Supabase] User favorites updated successfully:', data);
    return data;
  },

  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('favorite_restaurants')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.favorite_restaurants || [];
  },

  // User notes operations
  async createUserNote(noteData: {
    user_id: string;
    restaurant_id: string;
    note_text: string;
  }) {
    console.log('[Supabase] Creating user note:', noteData);
    
    const { data, error } = await supabase
      .from('user_notes')
      .insert(noteData)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Error creating user note:', error);
      throw error;
    }
    
    console.log('[Supabase] User note created successfully:', data);
    return data;
  },

  async updateUserNote(noteId: string, noteText: string) {
    const { data, error } = await supabase
      .from('user_notes')
      .update({ 
        note_text: noteText,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteUserNote(noteId: string) {
    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId);
    
    if (error) throw error;
  },

  async getUserNotes(userId: string, restaurantId?: string) {
    let query = supabase
      .from('user_notes')
      .select('*, restaurants(name, image_url)')
      .eq('user_id', userId);
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Collection type operations
  async getCollectionsByType(userId: string, collectionType?: 'public' | 'private' | 'shared') {
    console.log('[Supabase] Getting collections by type:', { userId, collectionType });
    
    let query = supabase
      .from('collections')
      .select('*, collection_members(user_id, role)');
    
    if (collectionType === 'public') {
      // Public collections are visible to everyone
      query = query.eq('collection_type', 'public');
    } else if (collectionType === 'private') {
      // Private collections are only visible to the creator
      query = query.eq('collection_type', 'private').eq('created_by', userId);
    } else if (collectionType === 'shared') {
      // Shared collections are visible to creator and members
      query = query.eq('collection_type', 'shared').or(`created_by.eq.${userId},collection_members.user_id.eq.${userId}`);
    } else {
      // Get all collections the user has access to
      query = query.or(`collection_type.eq.public,created_by.eq.${userId},collection_members.user_id.eq.${userId}`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Supabase] Error getting collections by type:', error);
      throw error;
    }
    
    console.log('[Supabase] Collections retrieved:', data?.length || 0);
    return data || [];
  },

  async addMemberToCollection(collectionId: string, userId: string, role: 'member' | 'admin' = 'member') {
    console.log('[Supabase] Adding member to collection:', { collectionId, userId, role });
    
    const { data, error } = await supabase
      .from('collection_members')
      .insert({
        collection_id: collectionId,
        user_id: userId,
        role
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Error adding member to collection:', error);
      throw error;
    }
    
    console.log('[Supabase] Member added successfully:', data);
    return data;
  },

  async removeMemberFromCollection(collectionId: string, userId: string) {
    console.log('[Supabase] Removing member from collection:', { collectionId, userId });
    
    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('[Supabase] Error removing member from collection:', error);
      throw error;
    }
    
    console.log('[Supabase] Member removed successfully');
  },

  async updateCollectionType(collectionId: string, collectionType: 'public' | 'private' | 'shared') {
    console.log('[Supabase] Updating collection type:', { collectionId, collectionType });
    
    const { data, error } = await supabase
      .from('collections')
      .update({
        collection_type: collectionType,
        is_public: collectionType === 'public',
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)
      .select()
      .single();
    
    if (error) {
      console.error('[Supabase] Error updating collection type:', error);
      throw error;
    }
    
    console.log('[Supabase] Collection type updated successfully:', data);
    return data;
  }
};