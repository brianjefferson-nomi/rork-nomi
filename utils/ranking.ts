import { Restaurant, RestaurantVote, RankedRestaurantMeta } from '@/types/restaurant';

interface ComputeOptions {
  memberCount?: number;
}

function getAuthorityWeight(authority: RestaurantVote['authority']): number {
  if (authority === 'verified' || authority === 'admin') return 1.2;
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
    const now = Date.now();

    const results = restaurants.map((restaurant) => {
      const rvotes = votes.filter((v) => v.restaurantId === restaurant.id);

      let weightedLikes = 0;
      let weightedDislikes = 0;
      let authorityApplied = false;
      let recencyBoost = 0;

      for (const v of rvotes) {
        const weight = getAuthorityWeight(v.authority);
        if (weight !== 1) authorityApplied = true;
        if (v.vote === 'like') weightedLikes += (v.weight ?? 1) * weight;
        if (v.vote === 'dislike') weightedDislikes += (v.weight ?? 1) * weight;

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

      const consensus = computeConsensus(likeRatio);

      let badge: RankedRestaurantMeta['badge'] | undefined = undefined;
      if (totalVotes >= 3 && likeRatio >= 0.7) badge = 'group_favorite';
      if (totalVotes >= 3 && likes === totalVotes) badge = 'unanimous';
      if (totalVotes >= 5 && likeRatio >= 0.45 && likeRatio <= 0.55 && engagement >= 10) badge = 'debated';

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
      };

      return { restaurant, meta, composite } as { restaurant: Restaurant; meta: RankedRestaurantMeta } & { composite: number };
    });

    const sorted = results
      .sort((a, b) => b.composite - a.composite)
      .map((r, idx, arr) => {
        if (idx === 0 && arr.length > 0) {
          r.meta.badge = r.meta.badge ?? 'top_choice';
        }
        return { restaurant: r.restaurant, meta: r.meta };
      });

    console.log('[ranking] computed rankings', sorted.length);
    return sorted;
  } catch (e) {
    console.error('[ranking] error computing rankings', e);
    return restaurants.map((restaurant) => ({
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
        consensus: 'low',
        approvalPercent: 0,
      },
    }));
  }
}
