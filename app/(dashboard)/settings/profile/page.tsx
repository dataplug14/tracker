'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth/hooks';
import { Header } from '@/components/layout/Header';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // We primarily use the user object from auth store, but could re-fetch to be sure
  // For simplicity, we pass the user object. ProfileForm handles the API call for updates.
  
  if (!user) {
    return (
      <div className="p-6">
        <Header title="Profile Settings" subtitle="Manage your account" />
        <div className="flex justify-center py-12">
            <UserCircle className="w-8 h-8 text-foreground-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Profile Settings" 
        subtitle="Manage your account"
      />
      <ProfileSettingsForm profile={user as any} userId={user.id} />
    </>
  );
}
