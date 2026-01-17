import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { JobsContent } from './JobsContent';

export default async function JobsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get all user jobs with truck and trailer info
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      truck:trucks(id, brand, model, custom_name),
      trailer:trailers(id, trailer_type, custom_name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header 
        title="My Jobs" 
        subtitle="Track your deliveries and earnings"
      />
      <JobsContent jobs={jobs || []} />
    </>
  );
}
