'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { DeviceLinkContent } from './DeviceLinkContent';
import { Smartphone } from 'lucide-react';

export default function DevicePage() {
  const user = useUser();
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await api.devices.list();
      setDevices(data);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchDevices();
    }
  }, [user]);

  if (isLoading && !user) { // Only show loading if no user yet? Or explicit loading state
     return (
        <div className="p-6">
          <Header title="Device Integration" subtitle="Connect your companion app" />
          <div className="flex justify-center py-12">
              <Smartphone className="w-8 h-8 text-foreground-muted animate-pulse" />
          </div>
        </div>
      );
  }

  return (
    <>
      <Header 
        title="Device Integration" 
        subtitle="Connect your companion app"
      />
      <DeviceLinkContent />
    </>
  );
}
