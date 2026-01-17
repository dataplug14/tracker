import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { DriversContent } from './DriversContent';

export default async function AdminDriversPage() {
  const supabase = await createClient();
  
  // Get all drivers with their roles and stats
  const { data: drivers } = await supabase
    .from('profiles')
    .select(`
      *,
      role:user_roles(role, is_active)
    `)
    .order('created_at', { ascending: false });

  // Get job counts per user
  const { data: jobCounts } = await supabase
    .from('jobs')
    .select('user_id')
    .eq('status', 'approved');

  const jobCountMap = new Map<string, number>();
  jobCounts?.forEach((j) => {
    jobCountMap.set(j.user_id, (jobCountMap.get(j.user_id) || 0) + 1);
  });

  return (
    <>
      <Header 
        title="Driver Management" 
        subtitle={`${drivers?.length || 0} registered drivers`}
      />
      <DriversContent 
        drivers={drivers || []}
        jobCountMap={Object.fromEntries(jobCountMap)}
      />
    </>
  );
}
