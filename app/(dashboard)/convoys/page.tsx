import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ConvoysContent } from './ConvoysContent';

export const dynamic = 'force-dynamic';

export default async function ConvoysPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get all convoys
  const { data: convoys } = await supabase
    .from('convoys')
    .select(`
      *,
      organizer:profiles!organizer_id(id, display_name, avatar_url),
      signups:convoy_signups(
        id, 
        user_id,
        profile:profiles(id, display_name, avatar_url),
        truck:trucks(id, brand, model, custom_name)
      )
    `)
    .order('scheduled_at', { ascending: true });

  // Get user's trucks for signup
  const { data: userTrucks } = await supabase
    .from('trucks')
    .select('id, brand, model, custom_name, game')
    .eq('user_id', user.id);

  return (
    <>
      <Header 
        title="Convoys" 
        subtitle="Join scheduled group events"
      />
      <ConvoysContent 
        convoys={convoys || []}
        userTrucks={userTrucks || []}
        userId={user.id}
      />
    </>
  );
}
