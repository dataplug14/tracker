import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { InvitesContent } from './InvitesContent';

export default async function AdminInvitesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get all invites
  const { data: invites } = await supabase
    .from('invites')
    .select(`
      *,
      creator:profiles!created_by(display_name),
      user:profiles!used_by(display_name)
    `)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header 
        title="Invite Management" 
        subtitle="Create and manage invite codes"
      />
      <InvitesContent invites={invites || []} userId={user.id} />
    </>
  );
}
