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

// Helper function to analyze comment sentiment
function analyzeCommentSentiment(comment: string): 'positive' | 'negative' | 'neutral' {
  const lowerComment = comment.toLowerCase();
  
  const positiveWords = ['love', 'great', 'amazing', 'excellent', 'perfect', 'wonderful', 'fantastic', 'delicious', 'best', 'awesome', 'outstanding', 'superb', 'incredible'];
  const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'worst', 'disgusting', 'horrible', 'mediocre', 'disappointing', 'overrated', 'expensive', 'rude'];
  
  const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Helper function to calculate fit score based on occasion
function calculateFitScore(restaurant: Restaurant, collection?: Collection): number {
  if (!collection?.occasion) return 0;
  
  const occasion = collection.occasion.toLowerCase();
  const restaurantVibe = restaurant.vibe?.map(v => v.toLowerCase()) || [];
  const restaurantCuisine = restaurant.cuisine?.toLowerCase() || '';
  const restaurantPriceRange = restaurant.priceRange || '';
  
  let fitScore = 0;
  
  // Birthday occasions
  if (occasion.includes('birthday') || occasion.includes('celebration')) {
    if (restaurantVibe.some(v => v.includes('special') || v.includes('celebration') || v.includes('upscale'))) fitScore += 2;
    if (restaurantPriceRange.includes('$$$') || restaurantPriceRange.includes('$$$$')) fitScore += 1;
    if (restaurantVibe.some(v => v.includes('romantic') || v.includes('intimate'))) fitScore += 1;
  }
  
  // Date night occasions
  if (occasion.includes('date') || occasion.includes('romantic')) {
    if (restaurantVibe.some(v => v.includes('romantic') || v.includes('intimate'))) fitScore += 3;
    if (restaurantVibe.some(v => v.includes('upscale') || v.includes('fine dining'))) fitScore += 2;
    if (restaurantPriceRange.includes('$$$') || restaurantPriceRange.includes('$$$$')) fitScore += 1;
  }
  
  // Business occasions
  if (occasion.includes('business') || occasion.includes('work')) {
    if (restaurantVibe.some(v => v.includes('business') || v.includes('professional'))) fitScore += 2;
    if (restaurantVibe.some(v => v.includes('quiet') || v.includes('formal'))) fitScore += 1;
    if (restaurantPriceRange.includes('$$') || restaurantPriceRange.includes('$$$')) fitScore += 1;
  }
  
  // Casual occasions
  if (occasion.includes('casual') || occasion.includes('quick')) {
    if (restaurantVibe.some(v => v.includes('casual') || v.includes('quick'))) fitScore += 2;
    if (restaurantPriceRange.includes('$') || restaurantPriceRange.includes('$$')) fitScore += 1;
  }
  
  return fitScore;
}

// Helper function to calculate guardrail score
function calculateGuardrailScore(likes: number, dislikes: number, totalMembers: number, totalVotes: number): number {
  let guardrailScore = 0;
  
  // Majority Agreement Rule: Restaurant must reach at least 60% positive
  const positiveRatio = totalVotes > 0 ? likes / totalVotes : 0;
  if (positiveRatio >= 0.6) {
    guardrailScore += 3; // Bonus for meeting majority agreement
  } else if (positiveRatio < 0.4) {
    guardrailScore -= 5; // Penalty for low agreement
  }
  
  // 75% of contributors must engage before selecting a winner
  const engagementRatio = totalMembers > 0 ? totalVotes / totalMembers : 0;
  if (engagementRatio >= 0.75) {
    guardrailScore += 2; // Bonus for high engagement
  } else if (engagementRatio < 0.5) {
    guardrailScore -= 3; // Penalty for low engagement
  }
  
  return guardrailScore;
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
        collectionConsensusThreshold: options.collection?.consensus_threshold,
        collectionKeys: options.collection ? Object.keys(options.collection) : []
      } : 'no options'
    });
    
    const now = Date.now();
    const totalMembers = options?.memberCount || 1;

    const results = restaurants.map((restaurant, index) => {
      const rvotes = votes.filter((v) => v.restaurantId === restaurant.id);

      // 1. WEIGHTED VOTES
      let weightedVoteScore = 0;
      let positiveComments = 0;
      let negativeComments = 0;
      let authorityApplied = false;

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

        // Weighted Votes: Like = +2 points, Dislike = -2 points
        if (v.vote === 'like') {
          weightedVoteScore += 2 * finalWeight;
          likeVoters.push(voterInfo);
        } else {
          weightedVoteScore -= 2 * finalWeight;
          dislikeVoters.push(voterInfo);
        }

        // Weighted Comments: Analyze sentiment in reasons
        if (v.reason) {
          const sentiment = analyzeCommentSentiment(v.reason);
          if (sentiment === 'positive') {
            positiveComments += 0.5 * finalWeight;
          } else if (sentiment === 'negative') {
            negativeComments += 0.5 * finalWeight;
          }
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
      }

      const likes = likeVoters.length;
      const dislikes = dislikeVoters.length;
      const totalVotes = likes + dislikes;
      const likeRatio = totalVotes > 0 ? likes / totalVotes : 0;

      // 2. SENTIMENT SCORE (from comments)
      const sentimentScore = positiveComments - negativeComments;

      // 3. FIT SCORE (match to occasion tags)
      const fitScore = calculateFitScore(restaurant, options?.collection);

      // 4. GUARDRAILS
      const guardrailScore = calculateGuardrailScore(likes, dislikes, totalMembers, totalVotes);

      // Calculate final restaurant score
      const restaurantScore = weightedVoteScore + sentimentScore + fitScore + guardrailScore;

      const consensus = computeConsensus(likeRatio);

      let badge: RankedRestaurantMeta['badge'] | undefined = undefined;
      const consensusThreshold = options?.collection?.settings?.consensusThreshold ?? 
                                (options?.collection?.consensus_threshold ? options.collection.consensus_threshold / 100 : 0.7);
      
      if (totalVotes >= 3 && likeRatio >= consensusThreshold) badge = 'group_favorite';
      if (totalVotes >= 3 && likes === totalVotes) badge = 'unanimous';
      if (totalVotes >= 5 && likeRatio >= 0.45 && likeRatio <= 0.55) badge = 'debated';

      const approvalPercent = Math.round(likeRatio * 100);

      // Calculate engagement metrics for display
      const engagement = (restaurant.commentsCount ?? 0) + (restaurant.savesCount ?? 0) + (restaurant.sharesCount ?? 0);
      const engagementBoost = Math.min(1.5, engagement / 50);
      const discussionCount = options?.discussions?.[restaurant.id] ?? 0;

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
        netScore: restaurantScore,
        likes,
        dislikes,
        likeRatio,
        engagementBoost,
        recencyBoost: 0, // Removed from new algorithm
        distanceBoost: 0,
        authorityApplied,
        consensus,
        badge,
        trend: 'steady', // Simplified for new algorithm
        approvalPercent,
        rank: 0, // Will be set after sorting
        voteDetails,
        discussionCount
      };

      return { restaurant, meta, composite: restaurantScore } as { restaurant: Restaurant; meta: RankedRestaurantMeta } & { composite: number };
    });

    // Apply tie-breaker rules
    const sorted = results
      .sort((a, b) => {
        const scoreDiff = b.composite - a.composite;
        
        // If scores are within 2 points, apply tie-breaker
        if (Math.abs(scoreDiff) <= 2) {
          // Tie-breaker 1: Higher likes per capita
          const aLikesPerCapita = a.meta.likes / Math.max(1, a.meta.likes + a.meta.dislikes);
          const bLikesPerCapita = b.meta.likes / Math.max(1, b.meta.likes + b.meta.dislikes);
          
          if (Math.abs(aLikesPerCapita - bLikesPerCapita) > 0.01) {
            return bLikesPerCapita - aLikesPerCapita;
          }
          
          // Tie-breaker 2: Better fit to occasion
          const aFitScore = calculateFitScore(a.restaurant, options?.collection);
          const bFitScore = calculateFitScore(b.restaurant, options?.collection);
          
          return bFitScore - aFitScore;
        }
        
        return scoreDiff;
      })
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
