'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Package, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import type { GameType } from '@/lib/types/database';

const trailerSchema = z.object({
  game: z.enum(['ets2', 'ats']),
  trailerType: z.string().min(1, 'Trailer type is required'),
  brand: z.string().optional(),
  capacity: z.string().optional(),
  customName: z.string().optional(),
  isOwned: z.boolean(),
  isCompanyTrailer: z.boolean(),
});

type TrailerForm = z.infer<typeof trailerSchema>;

const TRAILER_TYPES = [
  { value: 'curtainsider', label: 'Curtainsider' },
  { value: 'box', label: 'Box Trailer' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'lowbed', label: 'Lowbed' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'logging', label: 'Logging' },
  { value: 'car_carrier', label: 'Car Carrier' },
  { value: 'container', label: 'Container' },
  { value: 'hopper', label: 'Hopper' },
  { value: 'silos', label: 'Silos' },
  { value: 'heavy_cargo', label: 'Heavy Cargo' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'special', label: 'Special Transport' },
];

const TRAILER_BRANDS = [
  { value: 'krone', label: 'Krone' },
  { value: 'schmitz', label: 'Schmitz Cargobull' },
  { value: 'wielton', label: 'Wielton' },
  { value: 'schwarzmuller', label: 'Schwarzmüller' },
  { value: 'kogel', label: 'Kögel' },
  { value: 'daf', label: 'DAF' },
  { value: 'profiliner', label: 'Profiliner' },
  { value: 'great_dane', label: 'Great Dane' },
  { value: 'utility', label: 'Utility' },
  { value: 'wabash', label: 'Wabash' },
  { value: 'vanguard', label: 'Vanguard' },
  { value: 'other', label: 'Other/Unknown' },
];

export function NewTrailerForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('ets2');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TrailerForm>({
    resolver: zodResolver(trailerSchema),
    defaultValues: {
      game: 'ets2',
      trailerType: '',
      isOwned: true,
      isCompanyTrailer: false,
    },
  });

  const currentGame = watch('game');
  const isOwned = watch('isOwned');

  const onSubmit = async (data: TrailerForm) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('trailers').insert({
        user_id: user.id,
        game: data.game,
        trailer_type: data.trailerType,
        brand: data.brand || null,
        capacity: data.capacity || null,
        custom_name: data.customName || null,
        is_owned: data.isOwned,
        is_company_trailer: data.isCompanyTrailer,
      });

      if (error) throw error;

      router.push('/garage');
      router.refresh();
    } catch (error) {
      console.error('Failed to add trailer:', error);
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

        {/* Trailer Details */}
        <Card variant={currentGame === 'ets2' ? 'glow-ets2' : 'glow-ats'}>
          <CardHeader>
            <CardTitle>
              <Package className="w-5 h-5 inline mr-2" />
              Trailer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Trailer Type"
              options={[
                { value: '', label: 'Select trailer type' },
                ...TRAILER_TYPES,
              ]}
              {...register('trailerType')}
              error={errors.trailerType?.message}
            />

            <Select
              label="Brand (Optional)"
              options={[
                { value: '', label: 'Select brand' },
                ...TRAILER_BRANDS,
              ]}
              {...register('brand')}
            />

            <Input
              label="Capacity"
              placeholder="e.g., 24t, 40ft"
              {...register('capacity')}
            />

            <Input
              label="Custom Name (Optional)"
              placeholder="Give your trailer a nickname"
              {...register('customName')}
            />
          </CardContent>
        </Card>

        {/* Ownership */}
        <Card>
          <CardHeader>
            <CardTitle>Ownership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isOwned ? 'border-ets2 bg-ets2/10' : 'border-border'
              }`}
              onClick={() => {
                setValue('isOwned', true);
                setValue('isCompanyTrailer', false);
              }}
            >
              <p className="font-medium text-foreground">Owned Trailer</p>
              <p className="text-sm text-foreground-muted">
                You own this trailer in-game
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                !isOwned ? 'border-ats bg-ats/10' : 'border-border'
              }`}
              onClick={() => {
                setValue('isOwned', false);
                setValue('isCompanyTrailer', true);
              }}
            >
              <p className="font-medium text-foreground">Company/Freight Market</p>
              <p className="text-sm text-foreground-muted">
                Trailer from freight market or company jobs
              </p>
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
            Add Trailer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
