import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { NewJobForm } from './NewJobForm';

export default async function NewJobPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get user's trucks
  const { data: trucks } = await supabase
    .from('trucks')
    .select('id, brand, model, custom_name, game')
    .eq('user_id', user.id)
    .order('is_featured', { ascending: false });

  // Get user's trailers
  const { data: trailers } = await supabase
    .from('trailers')
    .select('id, trailer_type, custom_name, game')
    .eq('user_id', user.id);

  return (
    <>
      <Header 
        title="Submit New Job" 
        subtitle="Log your completed delivery"
      />
      <NewJobForm 
        trucks={trucks || []} 
        trailers={trailers || []}
      />
    </>
  );
}
