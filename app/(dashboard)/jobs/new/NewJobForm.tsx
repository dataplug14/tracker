'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Truck, 
  Package, 
  MapPin, 
  Route, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Upload,
  Server,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import type { GameType } from '@/lib/types/database';

const jobSchema = z.object({
  game: z.enum(['ets2', 'ats']),
  server: z.string().optional(),
  cargo: z.string().min(1, 'Cargo name is required'),
  sourceCity: z.string().min(1, 'Source city is required'),
  destinationCity: z.string().min(1, 'Destination city is required'),
  distanceKm: z.number().min(1, 'Distance must be at least 1 km'),
  revenue: z.number().min(0, 'Revenue must be positive'),
  damagePercent: z.number().min(0).max(100, 'Damage must be 0-100%'),
  truckId: z.string().optional(),
  trailerId: z.string().optional(),
  completedAt: z.string().min(1, 'Completion date is required'),
});

type JobForm = z.infer<typeof jobSchema>;

interface VehicleOption {
  id: string;
  brand?: string;
  model?: string;
  trailer_type?: string;
  custom_name: string | null;
  game: GameType;
}

interface NewJobFormProps {
  trucks: VehicleOption[];
  trailers: VehicleOption[];
}

const ETS2_SERVERS = [
  { value: 'sim1', label: 'Simulation 1' },
  { value: 'sim2', label: 'Simulation 2' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'promods', label: 'ProMods' },
  { value: 'singleplayer', label: 'Singleplayer' },
];

const ATS_SERVERS = [
  { value: 'sim1', label: 'Simulation' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'singleplayer', label: 'Singleplayer' },
];

export function NewJobForm({ trucks, trailers }: NewJobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('ets2');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      game: 'ets2',
      damagePercent: 0,
      completedAt: new Date().toISOString().slice(0, 16),
    },
  });

  const currentGame = watch('game');

  const filteredTrucks = trucks.filter((t) => t.game === currentGame);
  const filteredTrailers = trailers.filter((t) => t.game === currentGame);

  const onSubmit = async (data: JobForm) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('jobs').insert({
        user_id: user.id,
        game: data.game,
        server: data.server || null,
        cargo: data.cargo,
        source_city: data.sourceCity,
        destination_city: data.destinationCity,
        distance_km: data.distanceKm,
        revenue: data.revenue,
        damage_percent: data.damagePercent,
        truck_id: data.truckId || null,
        trailer_id: data.trailerId || null,
        completed_at: new Date(data.completedAt).toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      router.push('/jobs');
      router.refresh();
    } catch (error) {
      console.error('Failed to submit job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
                  setValue('truckId', '');
                  setValue('trailerId', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentGame === 'ets2'
                    ? 'border-ets2 bg-ets2/10 glow-ets2'
                    : 'border-border hover:border-ets2/50'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-ets2/20 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-ets2" />
                </div>
                <p className="font-semibold text-foreground">Euro Truck Simulator 2</p>
                <p className="text-xs text-foreground-muted">Europe & Beyond</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGame('ats');
                  setValue('game', 'ats');
                  setValue('truckId', '');
                  setValue('trailerId', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentGame === 'ats'
                    ? 'border-ats bg-ats/10 glow-ats'
                    : 'border-border hover:border-ats/50'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-ats/20 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-ats" />
                </div>
                <p className="font-semibold text-foreground">American Truck Simulator</p>
                <p className="text-xs text-foreground-muted">United States</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card variant={currentGame === 'ets2' ? 'glow-ets2' : 'glow-ats'}>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Server */}
            <div className="relative">
              <Server className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
              <Select
                label="Server"
                options={[
                  { value: '', label: 'Select server (optional)' },
                  ...(currentGame === 'ets2' ? ETS2_SERVERS : ATS_SERVERS),
                ]}
                className="pl-10"
                {...register('server')}
              />
            </div>

            {/* Cargo */}
            <div className="relative">
              <Package className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
              <Input
                label="Cargo"
                placeholder="e.g., Electronics, Machinery"
                className="pl-10"
                {...register('cargo')}
                error={errors.cargo?.message}
              />
            </div>

            {/* Cities */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  label="From City"
                  placeholder="e.g., Rotterdam"
                  className="pl-10"
                  {...register('sourceCity')}
                  error={errors.sourceCity?.message}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  label="To City"
                  placeholder="e.g., Berlin"
                  className="pl-10"
                  {...register('destinationCity')}
                  error={errors.destinationCity?.message}
                />
              </div>
            </div>

            {/* Distance & Revenue */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <Route className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  type="number"
                  label="Distance (km)"
                  placeholder="e.g., 1500"
                  className="pl-10"
                  {...register('distanceKm', { valueAsNumber: true })}
                  error={errors.distanceKm?.message}
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  type="number"
                  label={`Revenue (${currentGame === 'ets2' ? '€' : '$'})`}
                  placeholder="e.g., 45000"
                  className="pl-10"
                  {...register('revenue', { valueAsNumber: true })}
                  error={errors.revenue?.message}
                />
              </div>
            </div>

            {/* Damage & Date */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  type="number"
                  label="Damage %"
                  placeholder="0"
                  step="0.1"
                  min="0"
                  max="100"
                  className="pl-10"
                  {...register('damagePercent', { valueAsNumber: true })}
                  error={errors.damagePercent?.message}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-9 w-5 h-5 text-foreground-dim" />
                <Input
                  type="datetime-local"
                  label="Completed At"
                  className="pl-10"
                  {...register('completedAt')}
                  error={errors.completedAt?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Truck"
              options={[
                { value: '', label: 'Select a truck (optional)' },
                ...filteredTrucks.map((t) => ({
                  value: t.id,
                  label: t.custom_name || `${t.brand} ${t.model}`,
                })),
              ]}
              {...register('truckId')}
            />

            <Select
              label="Trailer"
              options={[
                { value: '', label: 'Select a trailer (optional)' },
                ...filteredTrailers.map((t) => ({
                  value: t.id,
                  label: t.custom_name || t.trailer_type || 'Trailer',
                })),
              ]}
              {...register('trailerId')}
            />

            {filteredTrucks.length === 0 && (
              <p className="text-sm text-foreground-muted">
                No {currentGame.toUpperCase()} trucks in your garage yet.{' '}
                <a href="/garage/truck/new" className="text-ets2 hover:underline">
                  Add one
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            variant={currentGame === 'ets2' ? 'primary-ets2' : 'primary-ats'}
          >
            Submit for Review
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
