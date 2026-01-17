import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { AchievementsContent } from './AchievementsContent';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('requirement_value');

  // Get user's earned achievements
  const { data: earnedAchievements } = await supabase
    .from('driver_achievements')
    .select('achievement_id, unlocked_at, progress')
    .eq('user_id', user.id);

  // Get user stats for progress calculation
  const { data: jobs } = await supabase
    .from('jobs')
    .select('distance_km, damage_percent')
    .eq('user_id', user.id)
    .eq('status', 'approved');

  const { count: trucksCount } = await supabase
    .from('trucks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: trailersCount } = await supabase
    .from('trailers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: convoyAttendance } = await supabase
    .from('convoy_signups')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('attended', true);

  // Calculate user's current progress
  const userProgress = {
    total_distance: jobs?.reduce((sum, j) => sum + (j.distance_km || 0), 0) || 0,
    total_jobs: jobs?.length || 0,
    zero_damage_jobs: jobs?.filter(j => j.damage_percent === 0).length || 0,
    owned_trucks: trucksCount || 0,
    total_vehicles: (trucksCount || 0) + (trailersCount || 0),
    convoy_attendance: convoyAttendance || 0,
  };

  // Get total VTC members for rarity calculation
  const { count: totalMembers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Calculate how many people have each achievement
  const { data: achievementCounts } = await supabase
    .from('driver_achievements')
    .select('achievement_id');

  const earnedCountMap = new Map<string, number>();
  achievementCounts?.forEach((a) => {
    earnedCountMap.set(a.achievement_id, (earnedCountMap.get(a.achievement_id) || 0) + 1);
  });

  return (
    <>
      <Header 
        title="Achievements" 
        subtitle="Unlock badges by reaching milestones"
      />
      <AchievementsContent 
        achievements={allAchievements || []}
        earnedAchievements={earnedAchievements || []}
        userProgress={userProgress}
        totalMembers={totalMembers || 1}
        earnedCountMap={Object.fromEntries(earnedCountMap)}
      />
    </>
  );
}
