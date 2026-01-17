'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  Users,
  Server,
  FileText,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import type { GameType } from '@/lib/types/database';

const convoySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  game: z.enum(['ets2', 'ats']),
  server: z.string().min(1, 'Server is required'),
  departureCity: z.string().min(1, 'Departure city is required'),
  arrivalCity: z.string().min(1, 'Arrival city is required'),
  routeDescription: z.string().optional(),
  scheduledAt: z.string().min(1, 'Date and time is required'),
  estimatedDuration: z.number().optional(),
  maxParticipants: z.number().optional(),
  discordEventUrl: z.string().url().optional().or(z.literal('')),
});

type ConvoyForm = z.infer<typeof convoySchema>;

interface ConvoyFormProps {
  organizerId: string;
}

const ETS2_SERVERS = [
  { value: 'sim1', label: 'Simulation 1' },
  { value: 'sim2', label: 'Simulation 2' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'promods', label: 'ProMods' },
];

const ATS_SERVERS = [
  { value: 'sim1', label: 'Simulation' },
  { value: 'arcade', label: 'Arcade' },
];

export function ConvoyForm({ organizerId }: ConvoyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('ets2');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConvoyForm>({
    resolver: zodResolver(convoySchema),
    defaultValues: {
      game: 'ets2',
      scheduledAt: '',
    },
  });

  const currentGame = watch('game');

  const onSubmit = async (data: ConvoyForm) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('convoys').insert({
        title: data.title,
        description: data.description || null,
        game: data.game,
        server: data.server,
        departure_city: data.departureCity,
        arrival_city: data.arrivalCity,
        route_description: data.routeDescription || null,
        scheduled_at: new Date(data.scheduledAt).toISOString(),
        estimated_duration_minutes: data.estimatedDuration || null,
        max_participants: data.maxParticipants || null,
        discord_event_url: data.discordEventUrl || null,
        organizer_id: organizerId,
        status: 'scheduled',
      });

      if (error) throw error;

      router.push('/convoys');
      router.refresh();
    } catch (error) {
      console.error('Failed to create convoy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Game Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedGame('ets2');
                  setValue('game', 'ets2');
                  setValue('server', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentGame === 'ets2'
                    ? 'border-ets2 bg-ets2/10 glow-ets2'
                    : 'border-border hover:border-ets2/50'
                }`}
              >
                <Truck className={`w-8 h-8 mx-auto mb-2 ${currentGame === 'ets2' ? 'text-ets2' : 'text-foreground-muted'}`} />
                <p className="font-semibold text-foreground">ETS2</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGame('ats');
                  setValue('game', 'ats');
                  setValue('server', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentGame === 'ats'
                    ? 'border-ats bg-ats/10 glow-ats'
                    : 'border-border hover:border-ats/50'
                }`}
              >
                <Truck className={`w-8 h-8 mx-auto mb-2 ${currentGame === 'ats' ? 'text-ats' : 'text-foreground-muted'}`} />
                <p className="font-semibold text-foreground">ATS</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card variant={currentGame === 'ets2' ? 'glow-ets2' : 'glow-ats'}>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Event Title"
              placeholder="e.g., Weekend European Tour"
              {...register('title')}
              error={errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-lg input-gaming min-h-[80px] resize-none"
                placeholder="Describe the event..."
                {...register('description')}
              />
            </div>

            <div className="relative">
              <Server className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
              <Select
                label="Server"
                options={[
                  { value: '', label: 'Select server' },
                  ...(currentGame === 'ets2' ? ETS2_SERVERS : ATS_SERVERS),
                ]}
                className="pl-10"
                {...register('server')}
                error={errors.server?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Route */}
        <Card>
          <CardHeader>
            <CardTitle>
              <MapPin className="w-5 h-5 inline mr-2" />
              Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Departure City"
                placeholder="e.g., Rotterdam"
                {...register('departureCity')}
                error={errors.departureCity?.message}
              />
              <Input
                label="Arrival City"
                placeholder="e.g., Berlin"
                {...register('arrivalCity')}
                error={errors.arrivalCity?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Route Description (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-lg input-gaming min-h-[60px] resize-none"
                placeholder="Describe the route, stops, or special instructions..."
                {...register('routeDescription')}
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
          <CardContent className="space-y-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
              <Input
                type="datetime-local"
                label="Date & Time"
                className="pl-10"
                {...register('scheduledAt')}
                error={errors.scheduledAt?.message}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <Clock className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  type="number"
                  label="Estimated Duration (minutes)"
                  placeholder="90"
                  className="pl-10"
                  {...register('estimatedDuration', { valueAsNumber: true })}
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  type="number"
                  label="Max Participants"
                  placeholder="No limit"
                  className="pl-10"
                  {...register('maxParticipants', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="relative">
              <ExternalLink className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
              <Input
                label="Discord Event URL (Optional)"
                placeholder="https://discord.com/events/..."
                className="pl-10"
                {...register('discordEventUrl')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            variant={currentGame === 'ets2' ? 'primary-ets2' : 'primary-ats'}
          >
            Schedule Convoy
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
