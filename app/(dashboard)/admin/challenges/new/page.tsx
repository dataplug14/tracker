import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { NewChallengeForm } from './NewChallengeForm';

export default async function NewChallengePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return (
    <>
      <Header 
        title="Create Challenge" 
        subtitle="Set up a new VTC challenge"
      />
      <NewChallengeForm creatorId={user.id} />
    </>
  );
}
