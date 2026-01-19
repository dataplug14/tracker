'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { DriversContent } from './DriversContent';
import { Users } from 'lucide-react';

export default function DriversPage() {
  const user = useUser();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDrivers() {
      // Role check is handled by middleware/component logic, but doubly safe here
      if (!user) return;
      try {
        setIsLoading(true);
        const [driversData, leaderboardData] = await Promise.all([
           api.admin.getDrivers(),
           api.leaderboard.get()
        ]);
        
        // Map leaderboard stats to job map
        const countMap: Record<string, number> = {};
        if (leaderboardData) {
            leaderboardData.forEach((stat: any) => {
                countMap[stat.user_id] = stat.total_jobs;
            });
        }
        
        setDrivers(driversData || []);
        // We need to store countMap in state or pass it?
        // DriversContent needs jobCountMap.
        // I'll add state for it.
        setJobCounts(countMap);
        
      } catch (error) {
        console.error('Failed to fetch drivers', error);
        setDrivers([]); 
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchDrivers();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="p-6">
        <Header title="Drivers" subtitle="Manage VTC drivers" />
        <div className="flex justify-center py-12">
            <Users className="w-8 h-8 text-foreground-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Drivers" 
        subtitle="Manage VTC drivers"
      />
      <DriversContent drivers={drivers} jobCountMap={jobCounts} />
    </>
  );
}
