'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { Sidebar } from '@/components/layout/Sidebar';
import { Truck } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Truck className="w-12 h-12 text-ets2" />
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Ensure role is strictly typed for Sidebar
  const sidebarUser = {
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    role: user.role as 'owner' | 'manager' | 'driver',
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={sidebarUser} />
      <main className="flex-1 min-w-0 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
