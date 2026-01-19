'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { JobsContent } from './JobsContent';
import { Job } from '@/lib/api/types';
import { Package } from 'lucide-react';

export default function JobsPage() {
  const user = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      if (!user) return;
      try {
        setIsLoading(true);
        // @ts-ignore - Type assertion for API return
        const data = await api.jobs.list(user.id);
        setJobs(data as unknown as Job[]);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchJobs();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Header title="My Jobs" subtitle="Track your deliveries and earnings" />
        <div className="flex justify-center py-12">
            <Package className="w-8 h-8 text-foreground-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="My Jobs" 
        subtitle="Track your deliveries and earnings"
      />
      <JobsContent jobs={jobs as any[]} />
    </>
  );
}
