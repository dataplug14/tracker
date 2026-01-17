import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DriverProfileContent } from './DriverProfileContent';

interface DriverProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverProfilePage({ params }: DriverProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get driver profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Get driver role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', id)
    .single();

  // Get driver stats from approved jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('distance_km, revenue, damage_percent, completed_at, source_city, destination_city')
    .eq('user_id', id)
    .eq('status', 'approved');

  // Calculate stats
  const stats = {
    totalKm: 0,
    totalJobs: 0,
    totalRevenue: 0,
    avgDamage: 0,
    perfectDeliveries: 0,
    favoriteRoutes: [] as { route: string; count: number }[],
  };

  if (jobs && jobs.length > 0) {
    stats.totalJobs = jobs.length;
    stats.totalKm = jobs.reduce((sum, j) => sum + (j.distance_km || 0), 0);
    stats.totalRevenue = jobs.reduce((sum, j) => sum + Number(j.revenue || 0), 0);
    stats.avgDamage = jobs.reduce((sum, j) => sum + (j.damage_percent || 0), 0) / jobs.length;
    stats.perfectDeliveries = jobs.filter(j => j.damage_percent === 0).length;

    // Calculate favorite routes
    const routeCounts = new Map<string, number>();
    jobs.forEach((job) => {
      const route = `${job.source_city} → ${job.destination_city}`;
      routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
    });
    stats.favoriteRoutes = Array.from(routeCounts.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  // Get achievements
  const { data: achievements } = await supabase
    .from('driver_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', id)
    .order('unlocked_at', { ascending: false });

  // Get trucks (if public or own profile)
  let trucks = null;
  if (profile.privacy_show_fleet || id === user.id) {
    const { data } = await supabase
      .from('trucks')
      .select(`
        *,
        photos:vehicle_photos(*)
      `)
      .eq('user_id', id)
      .order('is_featured', { ascending: false });
    trucks = data;
  }

  // Get recent jobs (if public or own profile)
  let recentJobs = null;
  if (profile.privacy_show_jobs || id === user.id) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', id)
      .eq('status', 'approved')
      .order('completed_at', { ascending: false })
      .limit(10);
    recentJobs = data;
  }

  // Get leaderboard rank
  const { data: allStats } = await supabase
    .from('jobs')
    .select('user_id, distance_km')
    .eq('status', 'approved');

  const userTotals = new Map<string, number>();
  allStats?.forEach((job) => {
    userTotals.set(job.user_id, (userTotals.get(job.user_id) || 0) + (job.distance_km || 0));
  });
  
  const sortedUsers = Array.from(userTotals.entries())
    .sort((a, b) => b[1] - a[1]);
  const rank = sortedUsers.findIndex(([uid]) => uid === id) + 1;

  return (
    <>
      <Header 
        title={profile.display_name} 
        subtitle="Driver Profile"
      />
      <DriverProfileContent 
        profile={profile}
        role={roleData?.role || 'driver'}
        stats={stats}
        achievements={achievements || []}
        trucks={trucks}
        recentJobs={recentJobs}
        rank={rank}
        isOwnProfile={id === user.id}
      />
    </>
  );
}
