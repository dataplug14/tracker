'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Globe,
  Palette,
  MessageSquare,
  Bell,
  Save,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import type { VtcSettings, DiscordConfig } from '@/lib/types/database';

const vtcSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  shortDescription: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  primaryGame: z.enum(['ets2', 'ats']),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  discordUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  twitchUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  isRecruiting: z.boolean(),
  joinInfo: z.string().optional(),
});

const discordSchema = z.object({
  webhookUrl: z.string().url().optional().or(z.literal('')),
  notifyJobApproved: z.boolean(),
  notifyJobRejected: z.boolean(),
  notifyNewConvoy: z.boolean(),
  notifyAchievementUnlock: z.boolean(),
  notifyNewVehicle: z.boolean(),
  notifyWeeklyLeaderboard: z.boolean(),
});

type VTCForm = z.infer<typeof vtcSchema>;
type DiscordForm = z.infer<typeof discordSchema>;

interface VTCSettingsFormProps {
  vtcSettings: VtcSettings | null;
  discordConfig: DiscordConfig | null;
}

export function VTCSettingsForm({ vtcSettings, discordConfig }: VTCSettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'discord'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const vtcForm = useForm<VTCForm>({
    resolver: zodResolver(vtcSchema),
    defaultValues: {
      name: vtcSettings?.name || '',
      slug: vtcSettings?.slug || '',
      shortDescription: vtcSettings?.short_description || '',
      description: vtcSettings?.description || '',
      primaryGame: vtcSettings?.primary_game || 'ets2',
      websiteUrl: vtcSettings?.website_url || '',
      discordUrl: vtcSettings?.discord_url || '',
      twitterUrl: vtcSettings?.twitter_url || '',
      youtubeUrl: vtcSettings?.youtube_url || '',
      twitchUrl: vtcSettings?.twitch_url || '',
      primaryColor: vtcSettings?.primary_color || '#f59e0b',
      secondaryColor: vtcSettings?.secondary_color || '#3b82f6',
      isRecruiting: vtcSettings?.is_recruiting ?? true,
      joinInfo: vtcSettings?.join_info || '',
    },
  });

  const discordForm = useForm<DiscordForm>({
    resolver: zodResolver(discordSchema),
    defaultValues: {
      webhookUrl: discordConfig?.webhook_url || '',
      notifyJobApproved: discordConfig?.notify_job_approved ?? true,
      notifyJobRejected: discordConfig?.notify_job_rejected ?? false,
      notifyNewConvoy: discordConfig?.notify_new_convoy ?? true,
      notifyAchievementUnlock: discordConfig?.notify_achievement_unlock ?? true,
      notifyNewVehicle: discordConfig?.notify_new_vehicle ?? false,
      notifyWeeklyLeaderboard: discordConfig?.notify_weekly_leaderboard ?? true,
    },
  });

  const onSubmitVTC = async (data: VTCForm) => {
    setIsLoading(true);
    setSaved(false);

    try {
      const supabase = createClient();

      if (vtcSettings?.id) {
        await supabase
          .from('vtc_settings')
          .update({
            name: data.name,
            slug: data.slug,
            short_description: data.shortDescription || null,
            description: data.description || null,
            primary_game: data.primaryGame,
            website_url: data.websiteUrl || null,
            discord_url: data.discordUrl || null,
            twitter_url: data.twitterUrl || null,
            youtube_url: data.youtubeUrl || null,
            twitch_url: data.twitchUrl || null,
            primary_color: data.primaryColor,
            secondary_color: data.secondaryColor,
            is_recruiting: data.isRecruiting,
            join_info: data.joinInfo || null,
          })
          .eq('id', vtcSettings.id);
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update VTC settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitDiscord = async (data: DiscordForm) => {
    setIsLoading(true);
    setSaved(false);

    try {
      const supabase = createClient();

      if (discordConfig?.id) {
        await supabase
          .from('discord_config')
          .update({
            webhook_url: data.webhookUrl || null,
            notify_job_approved: data.notifyJobApproved,
            notify_job_rejected: data.notifyJobRejected,
            notify_new_convoy: data.notifyNewConvoy,
            notify_achievement_unlock: data.notifyAchievementUnlock,
            notify_new_vehicle: data.notifyNewVehicle,
            notify_weekly_leaderboard: data.notifyWeeklyLeaderboard,
          })
          .eq('id', discordConfig.id);
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update Discord config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Toggle = ({ 
    label, 
    checked, 
    onChange 
  }: { 
    label: string; 
    checked: boolean; 
    onChange: (v: boolean) => void;
  }) => (
    <div 
      className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg cursor-pointer hover:bg-background-tertiary/80"
      onClick={() => onChange(!checked)}
    >
      <span className="text-foreground">{label}</span>
      <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-success' : 'bg-border'}`}>
        <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-ets2 text-black'
              : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab('discord')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'discord'
              ? 'bg-ats text-white'
              : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Discord
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={vtcForm.handleSubmit(onSubmitVTC)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Building2 className="w-5 h-5 inline mr-2" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="VTC Name"
                {...vtcForm.register('name')}
                error={vtcForm.formState.errors.name?.message}
              />

              <Input
                label="URL Slug"
                placeholder="my-vtc"
                {...vtcForm.register('slug')}
                error={vtcForm.formState.errors.slug?.message}
              />
              <p className="text-xs text-foreground-muted -mt-2">
                Your public page: yoursite.com/vtc/{vtcForm.watch('slug') || 'your-slug'}
              </p>

              <Input
                label="Short Description"
                placeholder="One-liner about your VTC"
                {...vtcForm.register('shortDescription')}
              />

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Full Description
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg input-gaming min-h-[120px] resize-none"
                  placeholder="Tell potential drivers about your VTC..."
                  {...vtcForm.register('description')}
                />
              </div>

              <Select
                label="Primary Game"
                options={[
                  { value: 'ets2', label: 'Euro Truck Simulator 2' },
                  { value: 'ats', label: 'American Truck Simulator' },
                ]}
                {...vtcForm.register('primaryGame')}
              />

              <Toggle
                label="Currently Recruiting"
                checked={vtcForm.watch('isRecruiting')}
                onChange={(v) => vtcForm.setValue('isRecruiting', v)}
              />

              {vtcForm.watch('isRecruiting') && (
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    How to Join
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg input-gaming min-h-[80px] resize-none"
                    placeholder="Instructions for joining your VTC..."
                    {...vtcForm.register('joinInfo')}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Globe className="w-5 h-5 inline mr-2" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Website"
                placeholder="https://yoursite.com"
                {...vtcForm.register('websiteUrl')}
              />
              <Input
                label="Discord Invite"
                placeholder="https://discord.gg/..."
                {...vtcForm.register('discordUrl')}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Twitter/X"
                  placeholder="https://twitter.com/..."
                  {...vtcForm.register('twitterUrl')}
                />
                <Input
                  label="YouTube"
                  placeholder="https://youtube.com/..."
                  {...vtcForm.register('youtubeUrl')}
                />
              </div>
              <Input
                label="Twitch"
                placeholder="https://twitch.tv/..."
                {...vtcForm.register('twitchUrl')}
              />
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Palette className="w-5 h-5 inline mr-2" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded-lg cursor-pointer"
                      {...vtcForm.register('primaryColor')}
                    />
                    <Input
                      {...vtcForm.register('primaryColor')}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded-lg cursor-pointer"
                      {...vtcForm.register('secondaryColor')}
                    />
                    <Input
                      {...vtcForm.register('secondaryColor')}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <a
              href={`/vtc/${vtcForm.watch('slug')}`}
              target="_blank"
              className="text-sm text-ets2 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Public Page
            </a>
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
      )}

      {/* Discord Settings */}
      {activeTab === 'discord' && (
        <form onSubmit={discordForm.handleSubmit(onSubmitDiscord)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Discord Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Webhook URL"
                placeholder="https://discord.com/api/webhooks/..."
                {...discordForm.register('webhookUrl')}
              />
              <p className="text-xs text-foreground-muted">
                Create a webhook in your Discord server settings to receive notifications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="w-5 h-5 inline mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Toggle
                label="Job Approved"
                checked={discordForm.watch('notifyJobApproved')}
                onChange={(v) => discordForm.setValue('notifyJobApproved', v)}
              />
              <Toggle
                label="Job Rejected"
                checked={discordForm.watch('notifyJobRejected')}
                onChange={(v) => discordForm.setValue('notifyJobRejected', v)}
              />
              <Toggle
                label="New Convoy Scheduled"
                checked={discordForm.watch('notifyNewConvoy')}
                onChange={(v) => discordForm.setValue('notifyNewConvoy', v)}
              />
              <Toggle
                label="Achievement Unlocked"
                checked={discordForm.watch('notifyAchievementUnlock')}
                onChange={(v) => discordForm.setValue('notifyAchievementUnlock', v)}
              />
              <Toggle
                label="New Vehicle Added"
                checked={discordForm.watch('notifyNewVehicle')}
                onChange={(v) => discordForm.setValue('notifyNewVehicle', v)}
              />
              <Toggle
                label="Weekly Leaderboard"
                checked={discordForm.watch('notifyWeeklyLeaderboard')}
                onChange={(v) => discordForm.setValue('notifyWeeklyLeaderboard', v)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading}>
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Discord Settings
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
