
const AFFILIATE_ID_KEY = 'user_affiliate_id';
const AFFILIATE_STATS_KEY = 'affiliate_stats';

interface AffiliateStats {
  clicks: number;
}

// Gets or creates the user's unique affiliate ID.
export function getAffiliateId(): string {
  let affiliateId = localStorage.getItem(AFFILIATE_ID_KEY);
  if (!affiliateId) {
    affiliateId = 'ref' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(AFFILIATE_ID_KEY, affiliateId);
  }
  return affiliateId;
}

// Increments the click count for a given ref code.
export function trackAffiliateClick(refCode: string): void {
  try {
    const statsJson = localStorage.getItem(AFFILIATE_STATS_KEY);
    const allStats: { [key: string]: AffiliateStats } = statsJson ? JSON.parse(statsJson) : {};
    
    if (allStats[refCode]) {
      allStats[refCode].clicks = (allStats[refCode].clicks || 0) + 1;
    } else {
      allStats[refCode] = { clicks: 1 };
    }
    
    localStorage.setItem(AFFILIATE_STATS_KEY, JSON.stringify(allStats));
  } catch (error) {
    console.error("Failed to track affiliate click:", error);
    // Clear potentially corrupted data
    localStorage.removeItem(AFFILIATE_STATS_KEY);
  }
}

// Retrieves the click and earnings data for the current user's ID.
export function getAffiliateStats(): { clicks: number; credits: number } {
  const affiliateId = getAffiliateId();
  try {
    const statsJson = localStorage.getItem(AFFILIATE_STATS_KEY);
    const allStats: { [key: string]: AffiliateStats } = statsJson ? JSON.parse(statsJson) : {};
    
    const userStats = allStats[affiliateId];
    const clicks = userStats?.clicks || 0;
    
    // 1 click = 1 credit earned
    const credits = clicks * 1;
    
    return { clicks, credits };
  } catch (error) {
    console.error("Failed to get affiliate stats:", error);
    return { clicks: 0, credits: 0 };
  }
}
