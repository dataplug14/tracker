import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ProfileSettingsForm } from './ProfileSettingsForm';

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <>
      <Header 
        title="Profile Settings" 
        subtitle="Manage your profile and privacy"
      />
      <ProfileSettingsForm profile={profile} userId={user.id} />
    </>
  );
}
