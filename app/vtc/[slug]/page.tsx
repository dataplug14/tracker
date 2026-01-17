import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PublicVTCContent } from './PublicVTCContent';

interface VTCPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicVTCPage({ params }: VTCPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get VTC settings
  const { data: vtc, error } = await supabase
    .from('vtc_settings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !vtc) {
    notFound();
  }

  // Get VTC stats
  const { count: driverCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { data: jobStats } = await supabase
    .from('jobs')
    .select('distance_km, revenue')
    .eq('status', 'approved');

  const stats = {
    drivers: driverCount || 0,
    totalKm: jobStats?.reduce((sum, j) => sum + (j.distance_km || 0), 0) || 0,
    totalRevenue: jobStats?.reduce((sum, j) => sum + Number(j.revenue || 0), 0) || 0,
  };

  // Get upcoming convoys
  const { data: convoys } = await supabase
    .from('convoys')
    .select('*')
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(3);

  // Get top drivers
  const { data: topJobStats } = await supabase
    .from('jobs')
    .select('user_id, distance_km')
    .eq('status', 'approved');

  const userTotals = new Map<string, number>();
  topJobStats?.forEach((job) => {
    userTotals.set(job.user_id, (userTotals.get(job.user_id) || 0) + (job.distance_km || 0));
  });

  const topUserIds = Array.from(userTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let topDrivers: { id: string; display_name: string; avatar_url: string | null; distance: number }[] = [];
  if (topUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', topUserIds);

    topDrivers = profiles?.map((p) => ({
      ...p,
      distance: userTotals.get(p.id) || 0,
    })).sort((a, b) => b.distance - a.distance) || [];
  }

  return (
    <PublicVTCContent
      vtc={vtc}
      stats={stats}
      convoys={convoys || []}
      topDrivers={topDrivers}
    />
  );
}

export async function generateMetadata({ params }: VTCPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: vtc } = await supabase
    .from('vtc_settings')
    .select('name, short_description')
    .eq('slug', slug)
    .single();

  return {
    title: vtc ? `${vtc.name} | VTC Tracker` : 'VTC Not Found',
    description: vtc?.short_description || 'Virtual Trucking Company',
  };
}
