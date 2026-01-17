import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const userData = {
    display_name: profile?.display_name || 'Driver',
    avatar_url: profile?.avatar_url,
    role: (roleData?.role || 'driver') as 'owner' | 'manager' | 'driver',
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={userData} />
      <main className="flex-1 min-w-0 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
