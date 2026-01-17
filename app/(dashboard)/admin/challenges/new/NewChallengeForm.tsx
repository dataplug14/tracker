'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Target,
  Calendar,
  Award,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';

const challengeSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  challengeType: z.string().min(1, 'Challenge type is required'),
  targetValue: z.number().min(1, 'Target value is required'),
  rewardDescription: z.string().optional(),
  startsAt: z.string().min(1, 'Start date is required'),
  endsAt: z.string().min(1, 'End date is required'),
});

type ChallengeForm = z.infer<typeof challengeSchema>;

interface NewChallengeFormProps {
  creatorId: string;
}

const CHALLENGE_TYPES = [
  { value: 'km', label: 'Total Kilometers' },
  { value: 'jobs', label: 'Jobs Completed' },
  { value: 'revenue', label: 'Revenue Earned' },
  { value: 'perfect', label: 'Perfect Deliveries' },
];

export function NewChallengeForm({ creatorId }: NewChallengeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
  });

  const onSubmit = async (data: ChallengeForm) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const startsAt = new Date(data.startsAt);
      const endsAt = new Date(data.endsAt);
      const now = new Date();

      let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
      if (startsAt <= now && endsAt > now) {
        status = 'active';
      } else if (endsAt <= now) {
        status = 'completed';
      }

      const { error } = await supabase.from('vtc_challenges').insert({
        title: data.title,
        description: data.description,
        challenge_type: data.challengeType,
        target_value: data.targetValue,
        reward_description: data.rewardDescription || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status,
        created_by: creatorId,
      });

      if (error) throw error;

      router.push('/challenges');
      router.refresh();
    } catch (error) {
      console.error('Failed to create challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card variant="glow-ets2">
          <CardHeader>
            <CardTitle>
              <Target className="w-5 h-5 inline mr-2" />
              Challenge Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Challenge Title"
              placeholder="e.g., January Distance Sprint"
              {...register('title')}
              error={errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-lg input-gaming min-h-[100px] resize-none"
                placeholder="Describe the challenge and rules..."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-error">{errors.description.message}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Challenge Type"
                options={[
                  { value: '', label: 'Select type' },
                  ...CHALLENGE_TYPES,
                ]}
                {...register('challengeType')}
                error={errors.challengeType?.message}
              />

              <Input
                type="number"
                label="Target Value"
                placeholder="e.g., 10000"
                {...register('targetValue', { valueAsNumber: true })}
                error={errors.targetValue?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Calendar className="w-5 h-5 inline mr-2" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                label="Start Date & Time"
                {...register('startsAt')}
                error={errors.startsAt?.message}
              />
              <Input
                type="datetime-local"
                label="End Date & Time"
                {...register('endsAt')}
                error={errors.endsAt?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reward */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Award className="w-5 h-5 inline mr-2" />
              Reward (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Reward Description"
              placeholder="e.g., Special Discord role, Priority convoy slot"
              {...register('rewardDescription')}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Challenge
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
