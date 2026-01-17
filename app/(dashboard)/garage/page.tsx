import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { GarageContent } from './GarageContent';

export default async function GaragePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get trucks with photos
  const { data: trucks } = await supabase
    .from('trucks')
    .select(`
      *,
      photos:vehicle_photos(*)
    `)
    .eq('user_id', user.id)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  // Get trailers
  const { data: trailers } = await supabase
    .from('trailers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header 
        title="My Garage" 
        subtitle="Manage your fleet of trucks and trailers"
      />
      <GarageContent 
        trucks={trucks || []} 
        trailers={trailers || []}
      />
    </>
  );
}
