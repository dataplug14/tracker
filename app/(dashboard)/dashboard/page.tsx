import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from './DashboardContent';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get user stats from approved jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('distance_km, revenue, damage_percent, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'approved');

  // Calculate stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    totalKm: 0,
    totalJobs: 0,
    totalRevenue: 0,
    avgDamage: 0,
    weekKm: 0,
    weekJobs: 0,
    monthKm: 0,
    monthJobs: 0,
  };

  if (jobs && jobs.length > 0) {
    stats.totalJobs = jobs.length;
    stats.totalKm = jobs.reduce((sum, j) => sum + (j.distance_km || 0), 0);
    stats.totalRevenue = jobs.reduce((sum, j) => sum + Number(j.revenue || 0), 0);
    stats.avgDamage = jobs.reduce((sum, j) => sum + (j.damage_percent || 0), 0) / jobs.length;

    jobs.forEach((job) => {
      const completedAt = new Date(job.completed_at);
      if (completedAt >= weekAgo) {
        stats.weekKm += job.distance_km || 0;
        stats.weekJobs++;
      }
      if (completedAt >= monthAgo) {
        stats.monthKm += job.distance_km || 0;
        stats.monthJobs++;
      }
    });
  }

  // Get recent jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, truck:trucks(brand, model)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get achievements count
  const { count: achievementsCount } = await supabase
    .from('driver_achievements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get featured truck
  const { data: featuredTruck } = await supabase
    .from('trucks')
    .select('*, photos:vehicle_photos(*)')
    .eq('user_id', user.id)
    .eq('is_featured', true)
    .single();

  // Get upcoming convoys
  const { data: upcomingConvoys } = await supabase
    .from('convoys')
    .select('*, signups:convoy_signups(user_id)')
    .eq('status', 'scheduled')
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(3);

  // Get active challenges
  const { data: activeChallenges } = await supabase
    .from('vtc_challenges')
    .select('*')
    .eq('status', 'active')
    .order('ends_at', { ascending: true })
    .limit(2);

  return (
    <>
      <Header 
        title={`Welcome back, ${profile?.display_name || 'Driver'}`} 
        subtitle="Here's your trucking overview"
      />
      <DashboardContent 
        stats={stats}
        recentJobs={recentJobs || []}
        achievementsCount={achievementsCount || 0}
        featuredTruck={featuredTruck}
        upcomingConvoys={upcomingConvoys || []}
        activeChallenges={activeChallenges || []}
      />
    </>
  );
}
