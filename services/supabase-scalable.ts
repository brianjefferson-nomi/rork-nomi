import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Scalable database helpers with improved performance
export const scalableDbHelpers = {
  // =====================================================
  // IMPROVED USER DATA MANAGEMENT
  // =====================================================

  /**
   * Get paginated collections for a user with proper caching
   */
  async getUserCollectionsPaginated(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      includePublic?: boolean;
      useCache?: boolean;
    } = {}
  ) {
    const {
      limit = 20,
      offset = 0,
      includePublic = true,
      useCache = true
    } = options;

    try {
      console.log('[getUserCollectionsPaginated] Fetching collections for user:', userId);

      // Use the database function for better performance
      const { data, error } = await supabase
        .rpc('get_user_collections_paginated', {
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset,
          p_include_public: includePublic
        });

      if (error) {
        console.error('[getUserCollectionsPaginated] Error:', error);
        throw error;
      }

      console.log('[getUserCollectionsPaginated] Found collections:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[getUserCollectionsPaginated] Exception:', error);
      throw error;
    }
  },

  /**
   * Get user activity summary from cache
   */
  async getUserActivitySummary(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_activity_summary')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[getUserActivitySummary] Error:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('[getUserActivitySummary] Exception:', error);
      return null;
    }
  },

  /**
   * Update user activity summary
   */
  async updateUserActivitySummary(userId: string) {
    try {
      const { error } = await supabase
        .rpc('update_user_activity_summary', {
          p_user_id: userId
        });

      if (error) {
        console.error('[updateUserActivitySummary] Error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[updateUserActivitySummary] Exception:', error);
      return false;
    }
  },

  // =====================================================
  // IMPROVED COLLECTION DATA MANAGEMENT
  // =====================================================

  /**
   * Get collection with cached statistics
   */
  async getCollectionWithStats(collectionId: string) {
    try {
      // Get collection data
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (collectionError) {
        console.error('[getCollectionWithStats] Collection error:', collectionError);
        throw collectionError;
      }

      // Get cached stats
      const { data: stats, error: statsError } = await supabase
        .from('collection_stats_cache')
        .select('*')
        .eq('collection_id', collectionId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('[getCollectionWithStats] Stats error:', statsError);
      }

      return {
        ...collection,
        stats: stats || null
      };
    } catch (error) {
      console.error('[getCollectionWithStats] Exception:', error);
      throw error;
    }
  },

  /**
   * Get collection restaurants with pagination
   */
  async getCollectionRestaurantsPaginated(
    collectionId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { limit = 50, offset = 0 } = options;

    try {
      // First get the collection to find restaurant IDs
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('restaurant_ids')
        .eq('id', collectionId)
        .single();

      if (collectionError) {
        console.error('[getCollectionRestaurantsPaginated] Collection error:', collectionError);
        throw collectionError;
      }

      if (!collection.restaurant_ids || collection.restaurant_ids.length === 0) {
        return { restaurants: [], total: 0 };
      }

      // Get paginated restaurant IDs
      const paginatedIds = collection.restaurant_ids.slice(offset, offset + limit);

      // Fetch restaurants
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', paginatedIds)
        .order('name');

      if (restaurantsError) {
        console.error('[getCollectionRestaurantsPaginated] Restaurants error:', restaurantsError);
        throw restaurantsError;
      }

      return {
        restaurants: restaurants || [],
        total: collection.restaurant_ids.length,
        hasMore: offset + limit < collection.restaurant_ids.length
      };
    } catch (error) {
      console.error('[getCollectionRestaurantsPaginated] Exception:', error);
      throw error;
    }
  },

  // =====================================================
  // IMPROVED VOTE MANAGEMENT
  // =====================================================

  /**
   * Vote with rate limiting and caching
   */
  async voteRestaurantWithRateLimit(voteData: {
    restaurant_id: string;
    user_id: string;
    collection_id: string;
    vote: 'like' | 'dislike';
    reason?: string;
  }) {
    try {
      // Check rate limit first
      const { data: rateLimitAllowed, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          p_user_id: voteData.user_id,
          p_action_type: 'vote',
          p_max_requests: 100,
          p_window_minutes: 60
        });

      if (rateLimitError) {
        console.error('[voteRestaurantWithRateLimit] Rate limit check error:', rateLimitError);
        throw new Error('Rate limit check failed');
      }

      if (!rateLimitAllowed) {
        throw new Error('Rate limit exceeded. Please wait before voting again.');
      }

      // Proceed with vote
      const { data, error } = await supabase
        .from('restaurant_votes')
        .upsert(voteData, {
          onConflict: 'restaurant_id,user_id,collection_id'
        })
        .select()
        .single();

      if (error) {
        console.error('[voteRestaurantWithRateLimit] Vote error:', error);
        throw error;
      }

      // Update activity summary
      await this.updateUserActivitySummary(voteData.user_id);

      return data;
    } catch (error) {
      console.error('[voteRestaurantWithRateLimit] Exception:', error);
      throw error;
    }
  },

  /**
   * Get votes with pagination and caching
   */
  async getCollectionVotesPaginated(
    collectionId: string,
    options: {
      limit?: number;
      offset?: number;
      includeUserData?: boolean;
    } = {}
  ) {
    const {
      limit = 50,
      offset = 0,
      includeUserData = true
    } = options;

    try {
      let query = supabase
        .from('restaurant_votes')
        .select(includeUserData ? `
          *,
          users!user_id (
            id,
            name,
            email
          )
        ` : '*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('[getCollectionVotesPaginated] Error:', error);
        throw error;
      }

      // Transform data to include user names
      const transformedData = (data || []).map((vote: any) => ({
        ...vote,
        userName: vote.users?.name || 'Unknown User',
        userEmail: vote.users?.email || ''
      }));

      return transformedData;
    } catch (error) {
      console.error('[getCollectionVotesPaginated] Exception:', error);
      throw error;
    }
  },

  // =====================================================
  // IMPROVED DISCUSSION MANAGEMENT
  // =====================================================

  /**
   * Create discussion with rate limiting
   */
  async createDiscussionWithRateLimit(discussionData: {
    restaurant_id: string;
    collection_id: string;
    user_id: string;
    message: string;
  }) {
    try {
      // Check rate limit
      const { data: rateLimitAllowed, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          p_user_id: discussionData.user_id,
          p_action_type: 'comment',
          p_max_requests: 50,
          p_window_minutes: 60
        });

      if (rateLimitError) {
        console.error('[createDiscussionWithRateLimit] Rate limit check error:', rateLimitError);
        throw new Error('Rate limit check failed');
      }

      if (!rateLimitAllowed) {
        throw new Error('Rate limit exceeded. Please wait before commenting again.');
      }

      // Create discussion
      const { data, error } = await supabase
        .from('restaurant_discussions')
        .insert(discussionData)
        .select()
        .single();

      if (error) {
        console.error('[createDiscussionWithRateLimit] Discussion error:', error);
        throw error;
      }

      // Update activity summary
      await this.updateUserActivitySummary(discussionData.user_id);

      return data;
    } catch (error) {
      console.error('[createDiscussionWithRateLimit] Exception:', error);
      throw error;
    }
  },

  /**
   * Get discussions with pagination
   */
  async getCollectionDiscussionsPaginated(
    collectionId: string,
    options: {
      limit?: number;
      offset?: number;
      restaurantId?: string;
      includeUserData?: boolean;
    } = {}
  ) {
    const {
      limit = 20,
      offset = 0,
      restaurantId,
      includeUserData = true
    } = options;

    try {
      let query = supabase
        .from('restaurant_discussions')
        .select(includeUserData ? `
          *,
          users!user_id (
            id,
            name,
            email
          )
        ` : '*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[getCollectionDiscussionsPaginated] Error:', error);
        throw error;
      }

      // Transform data to include user names
      const transformedData = (data || []).map((discussion: any) => ({
        ...discussion,
        userName: discussion.users?.name || 'Unknown User',
        userEmail: discussion.users?.email || ''
      }));

      return transformedData;
    } catch (error) {
      console.error('[getCollectionDiscussionsPaginated] Exception:', error);
      throw error;
    }
  },

  // =====================================================
  // SYSTEM MONITORING AND MAINTENANCE
  // =====================================================

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    try {
      const { data, error } = await supabase
        .from('system_health')
        .select('*');

      if (error) {
        console.error('[getSystemHealth] Error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[getSystemHealth] Exception:', error);
      return [];
    }
  },

  /**
   * Archive old data
   */
  async archiveOldData(monthsOld: number = 12) {
    try {
      const { error } = await supabase
        .rpc('archive_old_data', {
          p_months_old: monthsOld
        });

      if (error) {
        console.error('[archiveOldData] Error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[archiveOldData] Exception:', error);
      return false;
    }
  },

  /**
   * Update collection stats cache
   */
  async updateCollectionStatsCache(collectionId: string) {
    try {
      const { error } = await supabase
        .rpc('update_collection_stats_cache', {
          p_collection_id: collectionId
        });

      if (error) {
        console.error('[updateCollectionStatsCache] Error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[updateCollectionStatsCache] Exception:', error);
      return false;
    }
  },

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  /**
   * Create user session
   */
  async createUserSession(sessionData: {
    user_id: string;
    session_token: string;
    device_info?: any;
    ip_address?: string;
    expires_at: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('[createUserSession] Error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[createUserSession] Exception:', error);
      throw error;
    }
  },

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionToken: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('[updateSessionActivity] Error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[updateSessionActivity] Exception:', error);
      return false;
    }
  },

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions() {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('[cleanExpiredSessions] Error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[cleanExpiredSessions] Exception:', error);
      return false;
    }
  }
};
