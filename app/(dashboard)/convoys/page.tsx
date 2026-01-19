'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { ConvoysContent } from './ConvoysContent';
import { Calendar } from 'lucide-react';

export default function ConvoysPage() {
  const user = useUser();
  const [data, setData] = useState<{ convoys: any[]; userTrucks: any[] }>({ convoys: [], userTrucks: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setIsLoading(true);
        const [convoys, userTrucks] = await Promise.all([
          api.convoys.list(),
          api.trucks.list(user.id),
        ]);
        setData({ convoys, userTrucks });
      } catch (error) {
        console.error('Failed to fetch convoys data', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="p-6">
        <Header title="Convoys" subtitle="Join scheduled group events" />
        <div className="flex justify-center py-12">
            <Calendar className="w-8 h-8 text-foreground-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Convoys" 
        subtitle="Join scheduled group events"
      />
      <ConvoysContent 
        convoys={data.convoys}
        userTrucks={data.userTrucks}
        userId={user.id}
      />
    </>
  );
}
