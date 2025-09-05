import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

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
          // TripAdvisor fields
          tripadvisor_location_id?: string;
          tripadvisor_rating?: number;
          tripadvisor_review_count?: number;
          tripadvisor_photos?: string[];
          tripadvisor_last_updated?: string;
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
          // TripAdvisor fields
          tripadvisor_location_id?: string;
          tripadvisor_rating?: number;
          tripadvisor_review_count?: number;
          tripadvisor_photos?: string[];
          tripadvisor_last_updated?: string;
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
          // TripAdvisor fields
          tripadvisor_location_id?: string;
          tripadvisor_rating?: number;
          tripadvisor_review_count?: number;
          tripadvisor_photos?: string[];
          tripadvisor_last_updated?: string;
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
      collection_follows: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          collection_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          collection_id?: string;
          updated_at?: string;
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

  // Plan operations (legacy - will be consolidated)
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
          console.error('[getUserPlans] Error details:', {
            message: memberDataError.message,
            details: memberDataError.details,
            hint: memberDataError.hint,
            code: memberDataError.code
          });
          // Don't throw error, continue with other queries
          console.log('[getUserPlans] Continuing with other queries despite member data error');
        } else {
          memberCollectionData = memberData || [];
          console.log('[getUserPlans] Member collection data found:', memberCollectionData.length);
        }
      }
      
      // Combine collections (only user-created and user-member collections)
      const allCollections = [
        ...(createdCollections || []), 
        ...memberCollectionData
      ];
      
      // Deduplicate collections
      const uniqueCollections = allCollections.filter((collection, index, self) => 
        index === self.findIndex(c => c.id === collection.id)
      );
      
      console.log(`[getUserPlans] Found ${uniqueCollections.length} total collections for user ${userId}`);
      console.log(`[getUserPlans] Created: ${createdCollections?.length || 0}, Members: ${memberCollectionData.length}`);
      
      // For each collection, get its members to populate the collaborators field
      console.log('[getUserPlans] Processing collections with members...');
      const collectionsWithMembers = await Promise.all(
        uniqueCollections.map(async (collection, index) => {
          console.log(`[getUserPlans] Processing collection ${index + 1}/${uniqueCollections.length}: ${collection.id}`);
          try {
            const members = await dbHelpers.getCollectionMembers(collection.id);
            console.log(`[getUserPlans] Found ${members.length} members for collection ${collection.id}`);
            
            const collaborators = members.map((member: any) => {
              const userId = member._internalUserId || member.userId || member.id;
              console.log(`[getUserPlans] Mapping member: ${member.name || 'Unknown'} -> ${userId}`);
              return userId;
            });
            
            console.log(`[getUserPlans] Mapped ${collaborators.length} collaborators for collection ${collection.id}`);
            
            return {
              ...collection,
              collaborators
            };
    } catch (error) {
            console.error(`[getUserPlans] Error fetching members for collection ${collection.id}:`, error);
            console.error(`[getUserPlans] Error details for collection ${collection.id}:`, {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
            return {
              ...collection,
              collaborators: []
            };
          }
        })
      );
      
      // Sort by created_at descending
      return collectionsWithMembers.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('[getUserPlans] Exception:', error);
      console.error('[getUserPlans] Exception details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Return empty array instead of throwing to prevent app crashes
      console.log('[getUserPlans] Returning empty array due to error');
      return [];
    }
  },

  async getUserCollections(userId: string) {
    console.log(`[getUserCollections] Starting database query for user: ${userId}... (${new Date().toISOString()})`);
    
    // Get all collections where the user is involved (created or is a collaborator)
    const query = supabase
      .from('collections')
      .select('*')
      .or(`created_by.eq.${userId},collaborators.cs.{${userId}}`)
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[getUserCollections] Database error:', error);
      throw error;
    }
    
    console.log(`[getUserCollections] Raw data from database (${new Date().toISOString()}):`, data?.map(c => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0,
      created_at: c.created_at,
      id: c.id,
      is_public: c.is_public
    })));
    
    // Use the collaborators field that's already populated in the collections table
    const collectionsWithMembers = (data || []).map((collection) => {
      return {
        ...collection,
        collaborators: collection.collaborators || []
      };
    });
    
    console.log(`[getUserCollections] Processed collections (${new Date().toISOString()}):`, collectionsWithMembers?.map(c => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0
    })));
    
    return collectionsWithMembers;
  },

  async getAllCollections(userId?: string) {
    console.log(`[getAllCollections] Starting database query for public collections... (${new Date().toISOString()})`);
    
    // Get all public collections regardless of user involvement
    const query = supabase
      .from('collections')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[getAllCollections] Database error:', error);
      throw error;
    }
    
    console.log(`[getAllCollections] Raw data from database (${new Date().toISOString()}):`, data?.map(c => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0,
      created_at: c.created_at,
      id: c.id,
      is_public: c.is_public
    })));
    
    // Log specific collections for debugging
    const veniceBeach = data?.find(c => c.name === 'Venice Beach Eats');
    const brooklynBrunch = data?.find(c => c.name === 'Brooklyn Brunch Scene');
    
    if (veniceBeach) {
      console.log(`[getAllCollections] Venice Beach Eats raw data (${new Date().toISOString()}):`, {
        id: veniceBeach.id,
        collaborators: veniceBeach.collaborators,
        collaboratorsLength: veniceBeach.collaborators?.length || 0,
        collaboratorsType: typeof veniceBeach.collaborators,
        isArray: Array.isArray(veniceBeach.collaborators)
      });
    }
    
    if (brooklynBrunch) {
      console.log(`[getAllCollections] Brooklyn Brunch Scene raw data (${new Date().toISOString()}):`, {
        id: brooklynBrunch.id,
        collaborators: brooklynBrunch.collaborators,
        collaboratorsLength: brooklynBrunch.collaborators?.length || 0,
        collaboratorsType: typeof brooklynBrunch.collaborators,
        isArray: Array.isArray(brooklynBrunch.collaborators)
      });
    }
    
    // Use the collaborators field that's already populated in the collections table
    const collectionsWithMembers = (data || []).map((collection) => {
      return {
        ...collection,
        collaborators: collection.collaborators || []
      };
    });
    
    console.log(`[getAllCollections] Processed collections (${new Date().toISOString()}):`, collectionsWithMembers?.map(c => ({
      name: c.name,
      collaborators: c.collaborators,
      collaboratorsLength: c.collaborators?.length || 0
    })));
    
    return collectionsWithMembers;
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

  async updateCollection(id: string, updates: Partial<Database['public']['Tables']['collections']['Update']>) {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCollection(id: string, userId: string) {
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
      console.log('[getCollectionMembers] Fetching members for collection:', collectionId);
      
      const { data: membersData, error: membersError } = await supabase
        .from('collection_members')
        .select('*')
        .eq('collection_id', collectionId);
      
      if (membersError) {
        console.error('[getCollectionMembers] Error fetching members:', membersError);
        console.error('[getCollectionMembers] Error details:', {
          message: membersError.message,
          details: membersError.details,
          hint: membersError.hint,
          code: membersError.code
        });
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
      console.error('[getCollectionMembers] Exception:', error);
      console.error('[getCollectionMembers] Exception details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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
    try {
      console.log('[voteRestaurant] Attempting to vote with data:', voteData);
      
      // First, check if a vote already exists for this user/restaurant/collection
      let existingVote = null;
      let checkError = null;
      
      try {
    const { data, error } = await supabase
          .from('restaurant_votes')
      .select('*')
          .eq('restaurant_id', voteData.restaurant_id)
          .eq('user_id', voteData.user_id)
          .eq('collection_id', voteData.collection_id)
          .maybeSingle();
        
        existingVote = data;
        checkError = error;
      } catch (error) {
        console.error('[voteRestaurant] Exception during vote check:', error);
        checkError = error;
      }
      
      if (checkError) {
        console.error('[voteRestaurant] Error checking existing vote:', checkError);
        // If it's a 406 error, try a different approach
        if (checkError && typeof checkError === 'object' && 'code' in checkError && checkError.code === '406') {
          console.log('[voteRestaurant] 406 error detected, trying alternative query');
          // Try a simpler query without the single() constraint
          const { data: existingVotes, error: altError } = await supabase
            .from('restaurant_votes')
      .select('*')
            .eq('restaurant_id', voteData.restaurant_id)
            .eq('user_id', voteData.user_id)
            .eq('collection_id', voteData.collection_id);
          
          if (altError) {
            console.error('[voteRestaurant] Alternative query also failed:', altError);
            throw new Error(`Failed to check existing vote: ${altError.message}`);
          }
          
          existingVote = existingVotes && existingVotes.length > 0 ? existingVotes[0] : null;
        } else {
          throw new Error(`Failed to check existing vote: ${checkError && typeof checkError === 'object' && 'message' in checkError ? checkError.message : 'Unknown error'}`);
        }
      }
      
      let result;
      
      if (existingVote) {
        // Update existing vote
        console.log('[voteRestaurant] Updating existing vote from', existingVote.vote, 'to', voteData.vote);
    const { data, error } = await supabase
          .from('restaurant_votes')
          .update({
            vote: voteData.vote,
            reason: voteData.reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVote.id)
      .select()
      .single();
    
        if (error) {
          console.error('[voteRestaurant] Error updating vote:', error);
          throw new Error(`Failed to update vote: ${error.message}`);
        }
        
        result = data;
      } else {
        // Insert new vote
        console.log('[voteRestaurant] Inserting new vote');
    const { data, error } = await supabase
          .from('restaurant_votes')
          .insert(voteData)
      .select()
      .single();
    
    if (error) {
          console.error('[voteRestaurant] Error inserting vote:', error);
          throw new Error(`Failed to insert vote: ${error.message}`);
        }
        
        result = data;
      }
      
      console.log('[voteRestaurant] Vote successful:', result);
      return result;
    } catch (error) {
      console.error('[voteRestaurant] Exception:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while voting');
      }
    }
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
      console.log('[getCollectionDiscussions] Starting query for collectionId:', collectionId);
      
    let query = supabase
      .from('restaurant_discussions')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
      .eq('collection_id', collectionId);
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
      console.log('[getCollectionDiscussions] Query result:', {
        dataLength: data?.length || 0,
        error: error,
        sampleData: data?.[0] ? {
          id: data[0].id,
          message: data[0].message?.substring(0, 50),
          userName: data[0].users?.name,
          userId: data[0].user_id,
          collectionId: data[0].collection_id
        } : null
      });
    
    if (error) {
        console.error('[getCollectionDiscussions] Error:', error);
        return [];
      }
      
      // Transform the data to match the expected frontend structure
      const transformedData = (data || []).map(discussion => ({
        ...discussion,
        // Map database field names to frontend field names
        userId: discussion.user_id,
        collectionId: discussion.collection_id,
        restaurantId: discussion.restaurant_id,
        userName: discussion.users?.name || 'Unknown User',
        timestamp: discussion.created_at,
        // Keep the original message field
        message: discussion.message
      }));
      
      console.log('[getCollectionDiscussions] Transformed data:', {
        transformedLength: transformedData.length,
        sampleTransformed: transformedData[0] ? {
          id: transformedData[0].id,
          userName: transformedData[0].userName,
          message: transformedData[0].message?.substring(0, 50),
          userId: transformedData[0].userId,
          collectionId: transformedData[0].collectionId,
          restaurantId: transformedData[0].restaurantId,
          // Test if transformation worked
          hasUserId: !!transformedData[0].userId,
          hasCollectionId: !!transformedData[0].collectionId,
          hasRestaurantId: !!transformedData[0].restaurantId,
          // Show raw fields for comparison
          rawUserId: transformedData[0].user_id,
          rawCollectionId: transformedData[0].collection_id,
          rawRestaurantId: transformedData[0].restaurant_id
        } : null
      });
      
      return transformedData;
    } catch (error) {
      console.error('[getCollectionDiscussions] Exception:', error);
      return [];
    }
  },

  async updateDiscussion(discussionId: string, newMessage: string) {
    const { data, error } = await supabase
      .from('restaurant_discussions')
      .update({ 
        message: newMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', discussionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDiscussion(discussionId: string) {
    const { error } = await supabase
      .from('restaurant_discussions')
      .delete()
      .eq('id', discussionId);

    if (error) throw error;
  },

  async getRestaurantComments(collectionId: string, restaurantId: string) {
    try {
    const { data, error } = await supabase
        .from('restaurant_discussions')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
      .eq('collection_id', collectionId)
        .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    
      if (error) {
        console.error('[getRestaurantComments] Error:', error);
        return [];
      }
      
      // Transform the data to match the expected frontend structure
      const transformedData = (data || []).map(discussion => ({
        ...discussion,
        // Map database field names to frontend field names
        userId: discussion.user_id,
        collectionId: discussion.collection_id,
        restaurantId: discussion.restaurant_id,
        userName: discussion.users?.name || 'Unknown User',
        timestamp: discussion.created_at,
        // Keep the original message field
        message: discussion.message
      }));
      
      return transformedData;
    } catch (error) {
      console.error('[getRestaurantComments] Exception:', error);
      return [];
    }
  },

  // User favorites operations
  async updateUserFavorites(userId: string, favoriteRestaurants: string[]) {
    console.log('[updateUserFavorites] Updating favorites for user:', userId);
    console.log('[updateUserFavorites] Favorites to save:', favoriteRestaurants);
    
    const { data, error } = await supabase
      .from('users')
      .update({ favorite_restaurants: favoriteRestaurants })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[updateUserFavorites] Database error:', error);
      throw error;
    }
    
    console.log('[updateUserFavorites] Successfully updated favorites:', data);
    return data;
  },

  async getUserFavorites(userId: string) {
    try {
      console.log('[getUserFavorites] Fetching favorites for user:', userId);
      
      if (!userId) {
        console.log('[getUserFavorites] No user ID provided, returning empty array');
        return [];
      }
      
    const { data, error } = await supabase
      .from('users')
      .select('favorite_restaurants')
      .eq('id', userId)
      .single();
    
      if (error) {
        console.error('[getUserFavorites] Database error:', error);
        return [];
      }
      
      const favorites = data?.favorite_restaurants || [];
      console.log('[getUserFavorites] Retrieved favorites:', favorites);
      return favorites;
    } catch (error) {
      console.error('[getUserFavorites] Exception:', error);
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
  },

  async incrementCollectionViews(collectionId: string) {
    console.log('[incrementCollectionViews] Incrementing views for collection:', collectionId);
    
    try {
      const { error } = await supabase
        .from('collections')
        .update({ 
          views: supabase.rpc('increment_views', { collection_id: collectionId })
        })
        .eq('id', collectionId);
      
      if (error) {
        console.error('[incrementCollectionViews] Error incrementing views:', error);
        // Fallback: manually increment views
        const { data: collection, error: fetchError } = await supabase
          .from('collections')
          .select('views')
          .eq('id', collectionId)
          .single();
        
        if (fetchError) {
          console.error('[incrementCollectionViews] Error fetching current views:', fetchError);
          return;
        }
        
        const currentViews = collection?.views || 0;
        const { error: updateError } = await supabase
          .from('collections')
          .update({ views: currentViews + 1 })
          .eq('id', collectionId);
        
        if (updateError) {
          console.error('[incrementCollectionViews] Error with fallback update:', updateError);
        } else {
          console.log('[incrementCollectionViews] Views incremented successfully (fallback method)');
        }
      } else {
        console.log('[incrementCollectionViews] Views incremented successfully');
      }
    } catch (error) {
      console.error('[incrementCollectionViews] Unexpected error:', error);
    }
  },

  // Collection follow operations
  async followCollection(userId: string, collectionId: string) {
    try {
      // Check if collection_follows table exists by trying to query it
      const { data, error } = await supabase
        .from('collection_follows')
        .insert({
          user_id: userId,
          collection_id: collectionId
        })
        .select();
      
      if (error && (error.code === 'PGRST205' || error.code === '42501' || error.code === '401')) {
        // Store in localStorage as fallback for table not found, RLS policy issues, or auth issues
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        follows[`${userId}_${collectionId}`] = {
          user_id: userId,
          collection_id: collectionId,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('collection_follows', JSON.stringify(follows));
        return [{ user_id: userId, collection_id: collectionId }];
      }
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      // Check if this is a table not found, RLS policy error, or auth error
      if (error?.code === 'PGRST205' || error?.code === '42501' || error?.code === '401') {
        // Store in localStorage as fallback
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        follows[`${userId}_${collectionId}`] = {
          user_id: userId,
          collection_id: collectionId,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('collection_follows', JSON.stringify(follows));
        return [{ user_id: userId, collection_id: collectionId }];
      }
      
      throw error;
    }
  },

  async unfollowCollection(userId: string, collectionId: string) {
    try {
      const { error } = await supabase
        .from('collection_follows')
        .delete()
        .eq('user_id', userId)
        .eq('collection_id', collectionId);
      
      if (error && (error.code === 'PGRST205' || error.code === '42501' || error.code === '401')) {
        // Remove from localStorage as fallback for table not found, RLS policy issues, or auth issues
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        delete follows[`${userId}_${collectionId}`];
        localStorage.setItem('collection_follows', JSON.stringify(follows));
        return;
      }
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      // Check if this is a table not found, RLS policy error, or auth error
      if (error?.code === 'PGRST205' || error?.code === '42501' || error?.code === '401') {
        // Remove from localStorage as fallback
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        delete follows[`${userId}_${collectionId}`];
        localStorage.setItem('collection_follows', JSON.stringify(follows));
        return;
      }
      
      throw error;
    }
  },

  async isFollowingCollection(userId: string, collectionId: string) {
    try {
      const { data, error } = await supabase
        .from('collection_follows')
        .select('id')
        .eq('user_id', userId)
        .eq('collection_id', collectionId)
        .single();
      
      if (error && (error.code === 'PGRST205' || error.code === '42501' || error.code === '401')) {
        // Check localStorage as fallback for table not found, RLS policy issues, or auth issues
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        return !!follows[`${userId}_${collectionId}`];
      }
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return !!data;
    } catch (error: any) {
      // Check if this is a table not found, RLS policy error, or auth error
      if (error?.code === 'PGRST205' || error?.code === '42501' || error?.code === '401') {
        // Check localStorage as fallback
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        return !!follows[`${userId}_${collectionId}`];
      }
      
      throw error;
    }
  },

  async getFollowingCollections(userId: string) {
    try {
      const { data, error } = await supabase
        .from('collection_follows')
        .select('collection_id')
        .eq('user_id', userId);
      
      if (error && (error.code === 'PGRST205' || error.code === '42501' || error.code === '401')) {
        // Get from localStorage as fallback for table not found, RLS policy issues, or auth issues
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        return Object.keys(follows)
          .filter(key => key.startsWith(`${userId}_`))
          .map(key => key.split('_')[1]);
      }
      
      if (error) {
        throw error;
      }
      
      return data?.map(follow => follow.collection_id) || [];
    } catch (error: any) {
      // Check if this is a table not found, RLS policy error, or auth error
      if (error?.code === 'PGRST205' || error?.code === '42501' || error?.code === '401') {
        // Get from localStorage as fallback
        const follows = JSON.parse(localStorage.getItem('collection_follows') || '{}');
        return Object.keys(follows)
          .filter(key => key.startsWith(`${userId}_`))
          .map(key => key.split('_')[1]);
      }
      
      throw error;
    }
  },

  async toggleCollectionLike(collectionId: string, userId: string) {
    console.log('[toggleCollectionLike] Toggling like for collection:', collectionId, 'user:', userId);
    
    try {
      const { data, error } = await supabase.rpc('toggle_collection_like', {
        p_collection_id: collectionId,
        p_user_id: userId
      });
      
      if (error) {
        console.error('[toggleCollectionLike] Error toggling like:', error);
        return { success: false, liked: false, error };
      }
      
      const liked = data === true;
      console.log('[toggleCollectionLike] Like toggled successfully. Liked:', liked);
      return { success: true, liked, error: null };
    } catch (error) {
      console.error('[toggleCollectionLike] Unexpected error:', error);
      return { success: false, liked: false, error };
    }
  },

  async getCollectionLikeStatus(collectionId: string, userId: string) {
    console.log('[getCollectionLikeStatus] Checking like status for collection:', collectionId, 'user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('collection_likes')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('[getCollectionLikeStatus] Error checking like status:', error);
        return false;
      }
      
      const isLiked = data && data.length > 0;
      console.log('[getCollectionLikeStatus] Like status:', isLiked);
      return isLiked;
    } catch (error) {
      console.error('[getCollectionLikeStatus] Unexpected error:', error);
      return false;
    }
  },

  async getCollectionLikeCount(collectionId: string) {
    console.log('[getCollectionLikeCount] Getting like count for collection:', collectionId);
    
    try {
      const { count, error } = await supabase
        .from('collection_likes')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collectionId);
      
      if (error) {
        console.error('[getCollectionLikeCount] Error getting like count:', error);
        return 0;
      }
      
      console.log('[getCollectionLikeCount] Like count:', count);
      return count || 0;
    } catch (error) {
      console.error('[getCollectionLikeCount] Unexpected error:', error);
      return 0;
    }
  },

  // TripAdvisor integration functions
  async enhanceRestaurantWithTripAdvisor(restaurantId: string, tripAdvisorLocationId: string) {
    console.log('[enhanceRestaurantWithTripAdvisor] Enhancing restaurant:', restaurantId, 'with TripAdvisor ID:', tripAdvisorLocationId);
    
    try {
      // Import TripAdvisor service dynamically to avoid circular dependencies
      const { tripAdvisorService } = await import('./tripadvisor');
      
      // Get comprehensive TripAdvisor data
      const tripAdvisorData = await tripAdvisorService.getLocationData(tripAdvisorLocationId, false);
      
      if (!tripAdvisorData.details) {
        console.log('[enhanceRestaurantWithTripAdvisor] No TripAdvisor details found for location:', tripAdvisorLocationId);
        return false;
      }

      // Prepare update data
      const updateData: any = {
        tripadvisor_location_id: tripAdvisorLocationId,
        tripadvisor_rating: tripAdvisorData.details.rating,
        tripadvisor_review_count: tripAdvisorData.details.num_reviews,
        tripadvisor_last_updated: new Date().toISOString()
      };

      // Add photos if available
      if (tripAdvisorData.photos && tripAdvisorData.photos.length > 0) {
        const photoUrls = tripAdvisorData.photos.slice(0, 5).map(photo => 
          photo.sizes.large?.url || photo.sizes.medium?.url || photo.sizes.small?.url
        ).filter(Boolean);
        
        if (photoUrls.length > 0) {
          updateData.tripadvisor_photos = photoUrls;
        }
      }

      // Update restaurant with TripAdvisor data
      const { error } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', restaurantId);

      if (error) {
        console.error('[enhanceRestaurantWithTripAdvisor] Error updating restaurant:', error);
        return false;
      }

      console.log('[enhanceRestaurantWithTripAdvisor] Successfully enhanced restaurant with TripAdvisor data');
      return true;
    } catch (error) {
      console.error('[enhanceRestaurantWithTripAdvisor] Unexpected error:', error);
      return false;
    }
  },

  async getRestaurantsWithTripAdvisorData() {
    console.log('[getRestaurantsWithTripAdvisorData] Getting restaurants with TripAdvisor data');
    
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .not('tripadvisor_location_id', 'is', null);

      if (error) {
        console.error('[getRestaurantsWithTripAdvisorData] Error fetching restaurants:', error);
        return [];
      }

      console.log('[getRestaurantsWithTripAdvisorData] Found', data?.length || 0, 'restaurants with TripAdvisor data');
      return data || [];
    } catch (error) {
      console.error('[getRestaurantsWithTripAdvisorData] Unexpected error:', error);
      return [];
    }
  },

  async updateTripAdvisorDataForRestaurant(restaurantId: string) {
    console.log('[updateTripAdvisorDataForRestaurant] Updating TripAdvisor data for restaurant:', restaurantId);
    
    try {
      // Get restaurant to find TripAdvisor location ID
      const { data: restaurant, error: fetchError } = await supabase
        .from('restaurants')
        .select('tripadvisor_location_id')
        .eq('id', restaurantId)
        .single();

      if (fetchError || !restaurant?.tripadvisor_location_id) {
        console.log('[updateTripAdvisorDataForRestaurant] No TripAdvisor location ID found for restaurant:', restaurantId);
        return false;
      }

      // Enhance with fresh TripAdvisor data
      return await this.enhanceRestaurantWithTripAdvisor(restaurantId, restaurant.tripadvisor_location_id);
    } catch (error) {
      console.error('[updateTripAdvisorDataForRestaurant] Unexpected error:', error);
      return false;
    }
  }
};