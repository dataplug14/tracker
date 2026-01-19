'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, ExternalLink, Eye, EyeOff, Save, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types/database';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  truckersMpId: z.string().optional(),
  steamId: z.string().optional(),
  privacyShowJobs: z.boolean(),
  privacyShowFleet: z.boolean(),
  privacyShowStats: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileSettingsFormProps {
  profile: Profile | null;
  userId: string;
}

export function ProfileSettingsForm({ profile, userId }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name || '',
      bio: profile?.bio || '',
      truckersMpId: profile?.truckers_mp_id || '',
      steamId: profile?.steam_id || '',
      privacyShowJobs: profile?.privacy_show_jobs ?? true,
      privacyShowFleet: profile?.privacy_show_fleet ?? true,
      privacyShowStats: profile?.privacy_show_stats ?? true,
    },
  });

  const privacyShowJobs = watch('privacyShowJobs');
  const privacyShowFleet = watch('privacyShowFleet');
  const privacyShowStats = watch('privacyShowStats');

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setSaved(false);

    try {
      await api.profiles.update(userId, {
          display_name: data.displayName,
          bio: data.bio || null,
          truckers_mp_id: data.truckersMpId || null,
          steam_id: data.steamId || null,
          privacy_show_jobs: data.privacyShowJobs,
          privacy_show_fleet: data.privacyShowFleet,
          privacy_show_stats: data.privacyShowStats,
      });

      setSaved(true);
      router.refresh();
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const PrivacyToggle = ({ 
    label, 
    description, 
    checked, 
    onChange 
  }: { 
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: (v: boolean) => void;
  }) => (
    <div 
      className="flex items-center justify-between p-4 bg-background-tertiary rounded-lg cursor-pointer hover:bg-background-tertiary/80 transition-colors"
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-3">
        {checked ? (
          <Eye className="w-5 h-5 text-success" />
        ) : (
          <EyeOff className="w-5 h-5 text-foreground-dim" />
        )}
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-foreground-muted">{description}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-success' : 'bg-border'}`}>
        <div className={`w-5 h-5 rounded-full bg-white m-0.5 transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>
              <User className="w-5 h-5 inline mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Your display name"
              {...register('displayName')}
              error={errors.displayName?.message}
            />

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Bio
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-lg input-gaming min-h-[100px] resize-none"
                placeholder="Tell us about yourself..."
                {...register('bio')}
              />
              {errors.bio && (
                <p className="mt-1.5 text-sm text-error">{errors.bio.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* External Links */}
        <Card>
          <CardHeader>
            <CardTitle>
              <ExternalLink className="w-5 h-5 inline mr-2" />
              External Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="TruckersMP ID"
              placeholder="Your TruckersMP user ID"
              {...register('truckersMpId')}
            />

            <Input
              label="Steam ID"
              placeholder="Your Steam ID (64-bit)"
              {...register('steamId')}
            />

            <p className="text-xs text-foreground-muted">
              These IDs will be displayed on your profile with links to your TruckersMP and Steam profiles.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Eye className="w-5 h-5 inline mr-2" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground-muted mb-4">
              Control what other VTC members can see on your profile.
            </p>

            <PrivacyToggle
              label="Show Job History"
              description="Allow others to see your approved jobs"
              checked={privacyShowJobs}
              onChange={(v) => setValue('privacyShowJobs', v)}
            />

            <PrivacyToggle
              label="Show Fleet"
              description="Allow others to see your trucks and trailers"
              checked={privacyShowFleet}
              onChange={(v) => setValue('privacyShowFleet', v)}
            />

            <PrivacyToggle
              label="Show Detailed Stats"
              description="Allow others to see your revenue and damage stats"
              checked={privacyShowStats}
              onChange={(v) => setValue('privacyShowStats', v)}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
