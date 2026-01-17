import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ConvoyForm } from './ConvoyForm';

export default async function NewConvoyPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return (
    <>
      <Header 
        title="Schedule Convoy" 
        subtitle="Create a new group event"
      />
      <ConvoyForm organizerId={user.id} />
    </>
  );
}
