import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { LeaderboardContent } from './LeaderboardContent';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get all approved jobs with user info
  const { data: allJobs } = await supabase
    .from('jobs')
    .select(`
      user_id,
      distance_km,
      revenue,
      completed_at,
      profile:profiles(id, display_name, avatar_url)
    `)
    .eq('status', 'approved');

  // Aggregate stats per user
  const userStatsMap = new Map<string, {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    total_km: number;
    total_jobs: number;
    total_revenue: number;
  }>();

  allJobs?.forEach((job) => {
    const existing = userStatsMap.get(job.user_id);
    const profile = Array.isArray(job.profile) ? job.profile[0] : job.profile;
    
    if (existing) {
      existing.total_km += job.distance_km || 0;
      existing.total_jobs += 1;
      existing.total_revenue += Number(job.revenue || 0);
    } else {
      userStatsMap.set(job.user_id, {
        user_id: job.user_id,
        display_name: profile?.display_name || 'Unknown',
        avatar_url: profile?.avatar_url || null,
        total_km: job.distance_km || 0,
        total_jobs: 1,
        total_revenue: Number(job.revenue || 0),
      });
    }
  });

  const leaderboardData = Array.from(userStatsMap.values());

  return (
    <>
      <Header 
        title="Leaderboard" 
        subtitle="VTC driver rankings"
      />
      <LeaderboardContent 
        data={leaderboardData}
        currentUserId={user.id}
      />
    </>
  );
}
