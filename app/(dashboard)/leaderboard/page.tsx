'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { LeaderboardContent } from './LeaderboardContent';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const user = useUser();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await api.leaderboard.get();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading || !user) {
    return (
      <div className="p-6">
        <Header title="Leaderboard" subtitle="VTC driver rankings" />
        <div className="flex justify-center py-12">
            <Trophy className="w-8 h-8 text-foreground-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Leaderboard" 
        subtitle="VTC driver rankings"
      />
      <LeaderboardContent 
        data={data}
        currentUserId={user.id}
      />
    </>
  );
}
