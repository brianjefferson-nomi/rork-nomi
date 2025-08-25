import { Restaurant, RestaurantVote, RankedRestaurantMeta, VoteBreakdown, VoterInfo, VoteEvent, Collection, GroupRecommendation } from '@/types/restaurant';

interface ComputeOptions {
  memberCount?: number;
  collection?: Collection;
  discussions?: Record<string, number>;
}

function getAuthorityWeight(authority: RestaurantVote['authority']): number {
  if (authority === 'admin') return 1.5;
  if (authority === 'verified') return 1.2;
  return 1;
}

function computeConsensus(likeRatio: number): RankedRestaurantMeta['consensus'] {
  if (likeRatio >= 0.8) return 'strong';
  if (likeRatio >= 0.6) return 'moderate';
  if (likeRatio >= 0.4) return 'mixed';
  return 'low';
}

export function computeRankings(
  restaurants: Restaurant[],
  votes: RestaurantVote[],
  options?: ComputeOptions
): { restaurant: Restaurant; meta: RankedRestaurantMeta }[] {
  try {
    console.log('[ranking] Starting computeRankings with:', {
      restaurantCount: restaurants.length,
      voteCount: votes.length,
      options: options ? {
        memberCount: options.memberCount,
        hasCollection: !!options.collection,
        collectionId: options.collection?.id,
        collectionSettings: options.collection?.settings,
        collectionConsensusThreshold: options.collection?.consensus_threshold
      } : 'no options'
    });
    
    const now = Date.now();

    const results = restaurants.map((restaurant, index) => {
      const rvotes = votes.filter((v) => v.restaurantId === restaurant.id);

      let weightedLikes = 0;
      let weightedDislikes = 0;
      let authorityApplied = false;
      let recencyBoost = 0;

      // Build vote breakdown
      const likeVoters: VoterInfo[] = [];
      const dislikeVoters: VoterInfo[] = [];
      const reasons: Record<string, { count: number; examples: string[] }> = {};
      const timeline: VoteEvent[] = [];

      for (const v of rvotes) {
        const weight = getAuthorityWeight(v.authority);
        
        // Handle both string and object collaborators
        const collaborator = options?.collection?.collaborators?.find(m => {
          if (typeof m === 'string') {
            return m === v.userId;
          } else {
            return m.userId === v.userId;
          }
        });
        
        const memberWeight = (typeof collaborator === 'string' ? 1 : collaborator?.voteWeight) ?? 1;
        const finalWeight = (v.weight ?? 1) * weight * memberWeight;
        
        if (weight !== 1 || memberWeight !== 1) authorityApplied = true;
        
        const voterInfo: VoterInfo = {
          userId: v.userId,
          name: (typeof collaborator === 'string' ? 'Unknown' : collaborator?.name) ?? 'Unknown',
          avatar: (typeof collaborator === 'string' ? '' : collaborator?.avatar) ?? '',
          timestamp: new Date(v.timestamp ?? Date.now()),
          weight: finalWeight,
          isVerified: (typeof collaborator === 'string' ? false : collaborator?.isVerified) ?? false,
          reason: v.reason
        };

        if (v.vote === 'like') {
          weightedLikes += finalWeight;
          likeVoters.push(voterInfo);
        } else {
          weightedDislikes += finalWeight;
          dislikeVoters.push(voterInfo);
        }

        // Track reasons
        if (v.reason) {
          const category = categorizeReason(v.reason);
          if (!reasons[category]) {
            reasons[category] = { count: 0, examples: [] };
          }
          reasons[category].count++;
          if (reasons[category].examples.length < 3) {
            reasons[category].examples.push(v.reason);
          }
        }

        // Add to timeline
        timeline.push({
          id: `${v.userId}-${v.restaurantId}-${v.timestamp}`,
          userId: v.userId,
          restaurantId: v.restaurantId,
          vote: v.vote,
          timestamp: new Date(v.timestamp ?? Date.now()),
          reason: v.reason
        });

        if (v.timestamp) {
          const ageDays = Math.max(0, (now - new Date(v.timestamp).getTime()) / (1000 * 60 * 60 * 24));
          const boost = Math.max(0, 1 - Math.min(ageDays / 14, 1)) * 0.5;
          recencyBoost += boost * (v.vote === 'like' ? 1 : -0.5);
        }
      }

      const likes = Math.max(0, Math.round(weightedLikes));
      const dislikes = Math.max(0, Math.round(weightedDislikes));
      const totalVotes = likes + dislikes;
      const netScore = likes - dislikes;
      const likeRatio = totalVotes > 0 ? likes / totalVotes : 0;

      const engagement = (restaurant.commentsCount ?? 0) + (restaurant.savesCount ?? 0) + (restaurant.sharesCount ?? 0);
      const engagementBoost = Math.min(1.5, engagement / 50);
      const discussionCount = options?.discussions?.[restaurant.id] ?? 0;

      const consensus = computeConsensus(likeRatio);

      let badge: RankedRestaurantMeta['badge'] | undefined = undefined;
      // Handle both database format (consensus_threshold) and interface format (settings.consensusThreshold)
      const consensusThreshold = options?.collection?.settings?.consensusThreshold ?? 
                                (options?.collection?.consensus_threshold ? options.collection.consensus_threshold / 100 : 0.7);
      
      if (totalVotes >= 3 && likeRatio >= consensusThreshold) badge = 'group_favorite';
      if (totalVotes >= 3 && likes === totalVotes) badge = 'unanimous';
      if (totalVotes >= 5 && likeRatio >= 0.45 && likeRatio <= 0.55 && (engagement >= 10 || discussionCount >= 5)) badge = 'debated';

      const approvalPercent = Math.round(likeRatio * 100);

      const distanceBoost = 0;

      const composite = netScore + engagementBoost + recencyBoost + distanceBoost;

      let trend: RankedRestaurantMeta['trend'] = 'steady';
      const recent = rvotes
        .slice()
        .sort((a, b) => (new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()))
        .slice(0, 5);
      if (recent.length >= 3) {
        const recentLikes = recent.filter((v) => v.vote === 'like').length;
        const recentDislikes = recent.filter((v) => v.vote === 'dislike').length;
        if (recentLikes >= recentDislikes + 2) trend = 'up';
        else if (recentDislikes >= recentLikes + 2) trend = 'down';
      }

      // Get abstentions
      const allMemberIds = options?.collection?.collaborators?.map(m => {
        if (typeof m === 'string') {
          return m;
        } else {
          return m.userId;
        }
      }) ?? [];
      const votedMemberIds = rvotes.map(v => v.userId);
      const abstentions = allMemberIds.filter(id => !votedMemberIds.includes(id));

      const voteDetails: VoteBreakdown = {
        likeVoters: likeVoters.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        dislikeVoters: dislikeVoters.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        abstentions,
        reasons: Object.entries(reasons).map(([category, data]) => ({
          category,
          count: data.count,
          examples: data.examples
        })).sort((a, b) => b.count - a.count),
        timeline: timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      };

      const meta: RankedRestaurantMeta = {
        restaurantId: restaurant.id,
        netScore,
        likes,
        dislikes,
        likeRatio,
        engagementBoost,
        recencyBoost,
        distanceBoost,
        authorityApplied,
        consensus,
        badge,
        trend,
        approvalPercent,
        rank: 0, // Will be set after sorting
        voteDetails,
        discussionCount
      };

      return { restaurant, meta, composite } as { restaurant: Restaurant; meta: RankedRestaurantMeta } & { composite: number };
    });

    const sorted = results
      .sort((a, b) => b.composite - a.composite)
      .map((r, idx, arr) => {
        r.meta.rank = idx + 1;
        if (idx === 0 && arr.length > 0) {
          r.meta.badge = r.meta.badge ?? 'top_choice';
        }
        return { restaurant: r.restaurant, meta: r.meta };
      });

    console.log('[ranking] computed rankings', sorted.length);
    return sorted;
  } catch (e) {
    console.error('[ranking] error computing rankings', e);
    return restaurants.map((restaurant, index) => ({
      restaurant,
      meta: {
        restaurantId: restaurant.id,
        netScore: 0,
        likes: 0,
        dislikes: 0,
        likeRatio: 0,
        engagementBoost: 0,
        recencyBoost: 0,
        distanceBoost: 0,
        authorityApplied: false,
        consensus: 'low' as const,
        approvalPercent: 0,
        rank: index + 1,
        voteDetails: {
          likeVoters: [],
          dislikeVoters: [],
          abstentions: [],
          reasons: [],
          timeline: []
        },
        discussionCount: 0
      },
    }));
  }
}

function categorizeReason(reason: string): string {
  const lower = reason.toLowerCase();
  if (lower.includes('expensive') || lower.includes('price') || lower.includes('cost')) return 'Price';
  if (lower.includes('service') || lower.includes('staff') || lower.includes('waiter')) return 'Service';
  if (lower.includes('food') || lower.includes('taste') || lower.includes('flavor') || lower.includes('delicious')) return 'Food Quality';
  if (lower.includes('atmosphere') || lower.includes('ambiance') || lower.includes('vibe') || lower.includes('mood')) return 'Atmosphere';
  if (lower.includes('location') || lower.includes('distance') || lower.includes('far') || lower.includes('close')) return 'Location';
  if (lower.includes('wait') || lower.includes('busy') || lower.includes('crowded') || lower.includes('reservation')) return 'Availability';
  if (lower.includes('clean') || lower.includes('dirty') || lower.includes('hygiene')) return 'Cleanliness';
  return 'Other';
}

export function generateGroupRecommendations(
  restaurants: { restaurant: Restaurant; meta: RankedRestaurantMeta }[],
  collection: Collection
): GroupRecommendation[] {
  const recommendations: GroupRecommendation[] = [];
  
  // Find controversial choices (high engagement, split votes)
  const controversial = restaurants.filter(r => 
    r.meta.badge === 'debated' && r.meta.likeRatio >= 0.4 && r.meta.likeRatio <= 0.6
  );
  
  if (controversial.length > 0) {
    const topControversial = controversial[0];
    const similarCuisines = restaurants.filter(r => 
      r.restaurant.cuisine === topControversial.restaurant.cuisine &&
      r.restaurant.id !== topControversial.restaurant.id &&
      r.meta.consensus === 'strong'
    ).slice(0, 3);
    
    if (similarCuisines.length > 0) {
      recommendations.push({
        id: `compromise-${Date.now()}`,
        type: 'compromise',
        title: `Since the group is split on ${topControversial.restaurant.name}`,
        description: `Here are highly-rated ${topControversial.restaurant.cuisine} alternatives with strong group consensus`,
        restaurants: similarCuisines.map(r => r.restaurant.id),
        confidence: 0.8,
        reasoning: `Based on similar cuisine preferences and higher group agreement`,
        createdAt: new Date()
      });
    }
  }
  
  // Find alternatives for low-consensus choices
  const lowConsensus = restaurants.filter(r => r.meta.consensus === 'low' && r.meta.likes > 0);
  if (lowConsensus.length > 0) {
    const alternatives = restaurants.filter(r => 
      r.meta.consensus === 'strong' &&
      r.restaurant.priceRange === lowConsensus[0].restaurant.priceRange
    ).slice(0, 3);
    
    if (alternatives.length > 0) {
      recommendations.push({
        id: `alternative-${Date.now()}`,
        type: 'alternative',
        title: 'Alternative suggestions',
        description: 'Based on your group\'s preferences and similar price range',
        restaurants: alternatives.map(r => r.restaurant.id),
        confidence: 0.7,
        reasoning: 'Similar price range with higher group consensus',
        createdAt: new Date()
      });
    }
  }
  
  return recommendations;
}
