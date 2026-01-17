import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { JobApprovalContent } from './JobApprovalContent';

export default async function AdminJobsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get pending jobs with driver info
  const { data: pendingJobs } = await supabase
    .from('jobs')
    .select(`
      *,
      profile:profiles!user_id(id, display_name, avatar_url),
      truck:trucks(id, brand, model, custom_name),
      trailer:trailers(id, trailer_type, custom_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <>
      <Header 
        title="Job Approvals" 
        subtitle={`${pendingJobs?.length || 0} pending jobs`}
      />
      <JobApprovalContent jobs={pendingJobs || []} reviewerId={user.id} />
    </>
  );
}
