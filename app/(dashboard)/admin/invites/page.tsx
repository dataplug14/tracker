'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { InvitesContent } from './InvitesContent';
import { Ticket } from 'lucide-react';

export default function InvitesPage() {
  const user = useUser();
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInvites() {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await api.admin.getInvites();
        setInvites(data || []);
      } catch (error) {
        console.error('Failed to fetch invites', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchInvites();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="p-6">
        <Header title="Invites" subtitle="Manage invites" />
        <div className="flex justify-center py-12">
            <Ticket className="w-8 h-8 text-foreground-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Invites" 
        subtitle="Manage invites"
      />
      <InvitesContent invites={invites} userId={user.id} />
    </>
  );
}
