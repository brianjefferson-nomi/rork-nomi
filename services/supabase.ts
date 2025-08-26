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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
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
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          name: string;
          description?: string;
          created_by: string;
          collection_code: string;
          is_public: boolean;
          occasion?: string;
          equal_voting: boolean;
          minimum_participation: number;
          likes: number;
          admin_weighted: boolean;
          expertise_weighted: boolean;
          allow_vote_changes: boolean;
          anonymous_voting: boolean;
          vote_visibility: string;
          discussion_enabled: boolean;
          auto_ranking_enabled: boolean;
          consensus_threshold: number;
          restaurant_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_by: string;
          collection_code: string;
          is_public?: boolean;
          occasion?: string;
          equal_voting?: boolean;
          minimum_participation?: number;
          likes?: number;
          admin_weighted?: boolean;
          expertise_weighted?: boolean;
          allow_vote_changes?: boolean;
          anonymous_voting?: boolean;
          vote_visibility?: string;
          discussion_enabled?: boolean;
          auto_ranking_enabled?: boolean;
          consensus_threshold?: number;
          restaurant_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_by?: string;
          collection_code?: string;
          is_public?: boolean;
          occasion?: string;
          equal_voting?: boolean;
          minimum_participation?: number;
          likes?: number;
          admin_weighted?: boolean;
          expertise_weighted?: boolean;
          allow_vote_changes?: boolean;
          anonymous_voting?: boolean;
          vote_visibility?: string;
          discussion_enabled?: boolean;
          auto_ranking_enabled?: boolean;
          consensus_threshold?: number;
          restaurant_ids?: string[];
          updated_at?: string;
        };
      };
      collection_members: {
        Row: {
          id: string;
          collection_id: string;
          user_id: string;
          role: string;
          vote_weight: number;
          is_verified: boolean;
          expertise: string[];
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          user_id: string;
          role?: string;
          vote_weight?: number;
          is_verified?: boolean;
          expertise?: string[];
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          user_id?: string;
          role?: string;
          vote_weight?: number;
          is_verified?: boolean;
          expertise?: string[];
          joined_at?: string;
        };
      };
      restaurant_votes: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          collection_id: string;
          vote: string;
          reason?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          collection_id: string;
          vote: string;
          reason?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          collection_id?: string;
          vote?: string;
          reason?: string;
        };
      };
      restaurant_discussions: {
        Row: {
          id: string;
          restaurant_id: string;
          collection_id: string;
          user_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          collection_id: string;
          user_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          collection_id?: string;
          user_id?: string;
          message?: string;
        };
      };
      user_notes: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          note_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          note_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          note_text?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Database helper functions
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

  async updateUser(id: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Collection/Plan operations
  async createPlan(planData: {
    name: string;
    description?: string;
    plannedDate?: string;
    isPublic?: boolean;
    occasion?: string;
    collection_type?: 'public' | 'private' | 'shared';
    userId?: string; // Add userId parameter
  }) {
    const collectionCode = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine is_public based on collection_type
    const isPublic = planData.collection_type === 'public' || (planData.isPublic ?? true);
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: planData.name,
        description: planData.description || '',
        created_by: planData.userId || 'current-user-id', // Use provided userId or fallback
        collection_code: collectionCode,
        collection_type: planData.collection_type || 'public',
        is_public: isPublic, // Keep for backward compatibility
        occasion: planData.occasion || 'general',
        equal_voting: true,
        minimum_participation: 1,
        likes: 0,
        admin_weighted: false,
        expertise_weighted: false,
        allow_vote_changes: true,
        anonymous_voting: false,
        vote_visibility: 'public',
        discussion_enabled: true,
        auto_ranking_enabled: true,
        consensus_threshold: 50,
        restaurant_ids: []
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserPlans(userId: string) {
    try {
      console.log('[getUserPlans] Starting to fetch plans for user:', userId);
      
      // Get all collections the user should have access to:
      // 1. Collections created by the user (public, private, shared)
      // 2. Collections where the user is a member
      // 3. All public collections (for discovery)
      
      // First, get collections that the user created
      const { data: createdCollections, error: createdError } = await supabase
        .from('collections')
        .select('*')
        .eq('created_by', userId);
      
      if (createdError) {
        console.error('[getUserPlans] Error fetching created collections:', createdError);
        // Don't throw error, continue with other queries
        console.log('[getUserPlans] Continuing with other queries despite created collections error');
      }
      
      console.log('[getUserPlans] Created collections found:', createdCollections?.length || 0);
      
      // Then, get collections where the user is a member
      const { data: memberCollections, error: memberError } = await supabase
        .from('collection_members')
        .select('collection_id')
        .eq('user_id', userId);
      
      if (memberError) {
        console.error('[getUserPlans] Error fetching member collections:', memberError);
        // Don't throw error, continue with other queries
        console.log('[getUserPlans] Continuing with other queries despite member collections error');
      }
      
      console.log('[getUserPlans] Member collections found:', memberCollections?.length || 0);
      
      // Get the actual collection data for collections where user is a member
      let memberCollectionData: any[] = [];
      if (memberCollections && memberCollections.length > 0) {
        const collectionIds = memberCollections.map(m => m.collection_id);
        console.log('[getUserPlans] Fetching member collection data for IDs:', collectionIds);
        
        const { data: memberData, error: memberDataError } = await supabase
          .from('collections')
          .select('*')
          .in('id', collectionIds);
        
        if (memberDataError) {
          console.error('[getUserPlans] Error fetching member collection data:', memberDataError);
          // Don't throw error, continue with other queries
          console.log('[getUserPlans] Continuing with other queries despite member data error');
        } else {
          memberCollectionData = memberData || [];
          console.log('[getUserPlans] Member collection data found:', memberCollectionData.length);
        }
      }
      
      // Get all public collections for discovery
      const { data: publicCollections, error: publicError } = await supabase
        .from('collections')
        .select('*')
        .eq('is_public', true);
      
      if (publicError) {
        console.error('[getUserPlans] Error fetching public collections:', publicError);
        // Don't throw error, continue with other queries
        console.log('[getUserPlans] Continuing with other queries despite public collections error');
      }
      
      console.log('[getUserPlans] Public collections found:', publicCollections?.length || 0);
      
      // Combine all collections
      const allCollections = [
        ...(createdCollections || []), 
        ...memberCollectionData, 
        ...(publicCollections || [])
      ];
      
      // Deduplicate collections
      const uniqueCollections = allCollections.filter((collection, index, self) => 
        index === self.findIndex(c => c.id === collection.id)
      );
      
      console.log(`[getUserPlans] Found ${uniqueCollections.length} total collections for user ${userId}`);
      console.log(`[getUserPlans] Created: ${createdCollections?.length || 0}, Members: ${memberCollectionData.length}, Public: ${publicCollections?.length || 0}`);
      
      // Sort by created_at descending
      return uniqueCollections.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('[getUserPlans] Exception:', error);
      throw error;
    }
  },

  async getAllCollections() {
    // Get all public collections for discovery
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAllRestaurants() {
    // Get all restaurants from database
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getRestaurantsByIds(restaurantIds: string[]) {
    // Get specific restaurants by their IDs
    if (!restaurantIds || restaurantIds.length === 0) {
      console.log('[getRestaurantsByIds] No restaurant IDs provided');
      return [];
    }
    
    console.log('[getRestaurantsByIds] Fetching restaurants with IDs:', restaurantIds);
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .in('id', restaurantIds)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('[getRestaurantsByIds] Database error:', error);
      throw error;
    }
    
    console.log('[getRestaurantsByIds] Found restaurants:', data?.length || 0);
    console.log('[getRestaurantsByIds] Restaurant data:', data);
    
    return data || [];
  },

  async getRestaurantsByCodes(restaurantCodes: string[]) {
    // Get specific restaurants by their restaurant_codes
    if (!restaurantCodes || restaurantCodes.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .in('restaurant_code', restaurantCodes)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async updatePlan(id: string, updates: Partial<Database['public']['Tables']['collections']['Update']>) {
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
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);
    
    if (error) throw error;
  },

  async leaveCollection(collectionId: string, userId: string) {
    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async createCollection(collectionData: {
    name: string;
    description?: string;
    created_by: string;
    is_public?: boolean;
    occasion?: string;
  }) {
    const collectionCode = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enhancedData = {
      ...collectionData,
      collection_code: collectionCode,
      equal_voting: true,
      minimum_participation: 1,
      likes: 0,
      admin_weighted: false,
      expertise_weighted: false,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 50,
      restaurant_ids: []
    };
    
    const { data, error } = await supabase
      .from('collections')
      .insert(enhancedData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addCollectionMember(collectionId: string, userId: string, role: 'member' | 'admin' = 'member') {
    const memberData = {
      collection_id: collectionId,
      user_id: userId,
      role,
      vote_weight: 1,
      is_verified: false,
      expertise: []
    };
    
    const { data, error } = await supabase
      .from('collection_members')
      .insert(memberData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update collection type based on new contributor count
    await dbHelpers.updateCollectionTypeBasedOnContributors(collectionId);
    
    return data;
  },

  async removeCollectionMember(collectionId: string, userId: string) {
    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Update collection type based on new contributor count
    await dbHelpers.updateCollectionTypeBasedOnContributors(collectionId);
    
    return true;
  },

  async getCollectionMembers(collectionId: string) {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('collection_members')
        .select('*')
        .eq('collection_id', collectionId);
      
      if (membersError) {
        return [];
      }
      
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(member => member.user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name, avatar_url, is_local_expert, expert_areas')
            .in('id', userIds);
          
          const usersMap = new Map();
          if (usersData) {
            usersData.forEach(user => usersMap.set(user.id, user));
          }
          
          return membersData.map((member: any) => {
            const userData = usersMap.get(member.user_id);
            return {
              memberId: `member_${member.user_id?.substring(0, 8)}`,
              name: userData?.name || `Member ${member.user_id?.substring(0, 8)}`,
              avatar_url: userData?.avatar_url,
              role: member.role || 'member',
              isVerified: userData?.is_local_expert || false,
              expert_areas: userData?.expert_areas || [],
              joined_at: member.joined_at,
              _internalUserId: member.user_id
            };
          });
        }
      }
      
      return (membersData || []).map((member: any) => ({
        memberId: `member_${member.user_id?.substring(0, 8)}`,
        name: `Member ${member.user_id?.substring(0, 8)}`,
        avatar_url: null,
        role: member.role || 'member',
        isVerified: false,
        expert_areas: [],
        joined_at: member.joined_at,
        _internalUserId: member.user_id
      }));
      
    } catch (error) {
      return [];
    }
  },



  // Voting operations
  async getUserVotes(userId: string, collectionId?: string) {
    try {
      let query = supabase
        .from('restaurant_votes')
        .select('*')
        .eq('user_id', userId);
      
      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getRestaurantVotes(restaurantId: string, collectionId?: string) {
    try {
      let query = supabase
        .from('restaurant_votes')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getCollectionVotes(collectionId: string) {
    try {
      const { data, error } = await supabase
        .from('restaurant_votes')
        .select('*')
        .eq('collection_id', collectionId);
      
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getCollectionVotesWithUsers(collectionId: string) {
    try {
      const { data, error } = await supabase
        .from('restaurant_votes')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('collection_id', collectionId);
      
      if (error) {
        console.error('[getCollectionVotesWithUsers] Error:', error);
        return [];
      }
      
      // Transform the data to include user names
      const votesWithUsers = (data || []).map(vote => ({
        ...vote,
        userName: vote.users?.name || 'Unknown User',
        userEmail: vote.users?.email || ''
      }));
      
      return votesWithUsers;
    } catch (error) {
      console.error('[getCollectionVotesWithUsers] Exception:', error);
      return [];
    }
  },

  async voteRestaurant(voteData: {
    restaurant_id: string;
    user_id: string;
    collection_id: string;
    vote: 'like' | 'dislike';
    reason?: string;
  }) {
    const { data, error } = await supabase
      .from('restaurant_votes')
      .insert(voteData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Discussion operations
  async createDiscussion(discussionData: {
    restaurant_id: string;
    collection_id: string;
    user_id: string;
    message: string;
  }) {
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .insert(discussionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCollectionDiscussions(collectionId: string, restaurantId?: string) {
    try {
      let query = supabase
        .from('restaurant_discussions')
        .select('*')
        .eq('collection_id', collectionId);
      
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getRestaurantComments(collectionId: string, restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('restaurant_discussions')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  },

  // User favorites operations
  async updateUserFavorites(userId: string, favoriteRestaurants: string[]) {
    const { data, error } = await supabase
      .from('users')
      .update({ favorite_restaurants: favoriteRestaurants })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserFavorites(userId: string) {
    try {
      if (!userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('favorite_restaurants')
        .eq('id', userId)
        .single();
      
      if (error) {
        return [];
      }
      
      return data?.favorite_restaurants || [];
    } catch (error) {
      return [];
    }
  },

  // User notes operations
  async createUserNote(noteData: {
    user_id: string;
    restaurant_id: string;
    note_text: string;
  }) {
    const { data, error } = await supabase
      .from('user_notes')
      .insert(noteData)
      .select()
      .single();
    
    if (error) throw error;
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
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Collection management operations
  async getCollectionsByType(userId: string, collectionType?: 'public' | 'private' | 'shared') {
    try {
      console.log('[getCollectionsByType] Fetching collections for user:', userId, 'type:', collectionType);
      
      if (collectionType === 'private') {
        // Private collections: collections created by the user with collection_type = 'private'
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('created_by', userId)
          .eq('collection_type', 'private')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('[getCollectionsByType] Error fetching private collections:', error);
          return [];
        }
        
        console.log('[getCollectionsByType] Found private collections:', data?.length || 0);
        return data || [];
        
      } else if (collectionType === 'shared') {
        // Shared collections: collections where user is a member and collection_type = 'shared'
        const { data: memberCollections, error: memberError } = await supabase
          .from('collection_members')
          .select('collection_id')
          .eq('user_id', userId);
        
        if (memberError) {
          console.error('[getCollectionsByType] Error fetching member collections:', memberError);
          return [];
        }
        
        if (memberCollections && memberCollections.length > 0) {
          const collectionIds = memberCollections.map(m => m.collection_id);
          const { data, error } = await supabase
            .from('collections')
            .select('*')
            .in('id', collectionIds)
            .eq('collection_type', 'shared')
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('[getCollectionsByType] Error fetching shared collections:', error);
            return [];
          }
          
          console.log('[getCollectionsByType] Found shared collections:', data?.length || 0);
          return data || [];
        } else {
          console.log('[getCollectionsByType] No member collections found');
          return [];
        }
        
      } else {
        // Public collections: all collections with collection_type = 'public' OR collections created by the user
        const { data: publicCollections, error: publicError } = await supabase
          .from('collections')
          .select('*')
          .eq('collection_type', 'public')
          .order('created_at', { ascending: false });
        
        if (publicError) {
          console.error('[getCollectionsByType] Error fetching public collections:', publicError);
          return [];
        }
        
        const { data: userCollections, error: userError } = await supabase
          .from('collections')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });
        
        if (userError) {
          console.error('[getCollectionsByType] Error fetching user collections:', userError);
          return [];
        }
        
        // Combine and deduplicate
        const allCollections = [...(publicCollections || []), ...(userCollections || [])];
        const uniqueCollections = allCollections.filter((collection, index, self) => 
          index === self.findIndex(c => c.id === collection.id)
        );
        
        console.log('[getCollectionsByType] Found public collections:', uniqueCollections.length);
        return uniqueCollections.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch (error) {
      console.error('[getCollectionsByType] Exception:', error);
      return [];
    }
  },

  async addMemberToCollection(collectionId: string, userId: string, role: 'member' | 'admin' = 'member') {
    const memberData = {
      collection_id: collectionId,
      user_id: userId,
      role,
      vote_weight: 1,
      is_verified: false,
      expertise: []
    };
    
    const { data, error } = await supabase
      .from('collection_members')
      .insert(memberData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeMemberFromCollection(collectionId: string, userId: string) {
    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async updateCollectionType(collectionId: string, collectionType: 'public' | 'private' | 'shared') {
    console.log('[updateCollectionType] Updating collection:', collectionId, 'to type:', collectionType);
    
    // Update both collection_type and is_public for consistency
    const isPublic = collectionType === 'public';
    
    const { data, error } = await supabase
      .from('collections')
      .update({ 
        collection_type: collectionType,
        is_public: isPublic // Keep for backward compatibility
      })
      .eq('id', collectionId)
      .select()
      .single();
    
    if (error) {
      console.error('[updateCollectionType] Error:', error);
      throw error;
    }
    
    console.log('[updateCollectionType] Successfully updated collection:', data.name);
    return data;
  },

  async migrateCollectionTypes() {
    console.log('[migrateCollectionTypes] Starting migration of collection types');
    
    try {
      // Update collections based on is_public and membership
      const { data: collections, error } = await supabase
        .from('collections')
        .select('*');
      
      if (error) {
        console.error('[migrateCollectionTypes] Error fetching collections:', error);
        return;
      }
      
      console.log('[migrateCollectionTypes] Found collections to migrate:', collections?.length || 0);
      
      for (const collection of collections || []) {
        // Get all members for this collection (including creator)
        const { data: members, error: memberError } = await supabase
          .from('collection_members')
          .select('user_id')
          .eq('collection_id', collection.id);
        
        if (memberError) {
          console.error(`[migrateCollectionTypes] Error fetching members for collection ${collection.name}:`, memberError);
          continue;
        }
        
        // Count total contributors (creator + members)
        const totalContributors = (members?.length || 0) + 1; // +1 for creator
        
        let newType = 'public'; // default
        
        if (totalContributors === 1) {
          // Only creator - make it private
          newType = 'private';
        } else if (totalContributors > 1) {
          // Multiple contributors - make it shared
          newType = 'shared';
        }
        
        // Update the collection type
        const { error: updateError } = await supabase
          .from('collections')
          .update({ 
            collection_type: newType,
            is_public: newType === 'public' // Keep for backward compatibility
          })
          .eq('id', collection.id);
        
        if (updateError) {
          console.error(`[migrateCollectionTypes] Error updating collection ${collection.name}:`, updateError);
        } else {
          console.log(`[migrateCollectionTypes] Updated collection "${collection.name}" to type: ${newType} (${totalContributors} contributors)`);
        }
      }
      
      console.log('[migrateCollectionTypes] Migration completed successfully');
    } catch (error) {
      console.error('[migrateCollectionTypes] Migration failed:', error);
    }
  },

  async updateCollectionTypeBasedOnContributors(collectionId: string) {
    console.log('[updateCollectionTypeBasedOnContributors] Updating collection type for:', collectionId);
    
    try {
      // Get all members for this collection
      const { data: members, error: memberError } = await supabase
        .from('collection_members')
        .select('user_id')
        .eq('collection_id', collectionId);
      
      if (memberError) {
        console.error('[updateCollectionTypeBasedOnContributors] Error fetching members:', memberError);
        return;
      }
      
      // Count total contributors (creator + members)
      const totalContributors = (members?.length || 0) + 1; // +1 for creator
      
      let newType = 'public'; // default
      
      if (totalContributors === 1) {
        // Only creator - make it private
        newType = 'private';
      } else if (totalContributors > 1) {
        // Multiple contributors - make it shared
        newType = 'shared';
      }
      
      // Update the collection type
      const { error: updateError } = await supabase
        .from('collections')
        .update({ 
          collection_type: newType,
          is_public: newType === 'public' // Keep for backward compatibility
        })
        .eq('id', collectionId);
      
      if (updateError) {
        console.error('[updateCollectionTypeBasedOnContributors] Error updating collection:', updateError);
      } else {
        console.log(`[updateCollectionTypeBasedOnContributors] Updated collection to type: ${newType} (${totalContributors} contributors)`);
      }
    } catch (error) {
      console.error('[updateCollectionTypeBasedOnContributors] Error:', error);
    }
  }
};