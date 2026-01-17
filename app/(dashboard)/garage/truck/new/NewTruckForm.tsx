'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import type { GameType } from '@/lib/types/database';

const truckSchema = z.object({
  game: z.enum(['ets2', 'ats']),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  customName: z.string().optional(),
  chassis: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  purchasePrice: z.number().optional(),
  currentMileage: z.number().optional(),
  paintJob: z.string().optional(),
});

type TruckForm = z.infer<typeof truckSchema>;

const ETS2_BRANDS = [
  { value: 'volvo', label: 'Volvo' },
  { value: 'scania', label: 'Scania' },
  { value: 'mercedes', label: 'Mercedes-Benz' },
  { value: 'man', label: 'MAN' },
  { value: 'daf', label: 'DAF' },
  { value: 'renault', label: 'Renault' },
  { value: 'iveco', label: 'Iveco' },
];

const ATS_BRANDS = [
  { value: 'peterbilt', label: 'Peterbilt' },
  { value: 'kenworth', label: 'Kenworth' },
  { value: 'volvo_vnl', label: 'Volvo VNL' },
  { value: 'freightliner', label: 'Freightliner' },
  { value: 'international', label: 'International' },
  { value: 'mack', label: 'Mack' },
  { value: 'western_star', label: 'Western Star' },
];

export function NewTruckForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('ets2');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TruckForm>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      game: 'ets2',
      currentMileage: 0,
    },
  });

  const currentGame = watch('game');

  const onSubmit = async (data: TruckForm) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('trucks').insert({
        user_id: user.id,
        game: data.game,
        brand: data.brand,
        model: data.model,
        custom_name: data.customName || null,
        chassis: data.chassis || null,
        engine: data.engine || null,
        transmission: data.transmission || null,
        purchase_price: data.purchasePrice || null,
        current_mileage: data.currentMileage || 0,
        paint_job: data.paintJob || null,
      });

      if (error) throw error;

      router.push('/garage');
      router.refresh();
    } catch (error) {
      console.error('Failed to add truck:', error);
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
                  setValue('brand', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentGame === 'ets2'
                    ? 'border-ets2 bg-ets2/10 glow-ets2'
                    : 'border-border hover:border-ets2/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-ets2/20 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-5 h-5 text-ets2" />
                </div>
                <p className="font-semibold text-foreground">ETS2</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGame('ats');
                  setValue('game', 'ats');
                  setValue('brand', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentGame === 'ats'
                    ? 'border-ats bg-ats/10 glow-ats'
                    : 'border-border hover:border-ats/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-ats/20 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-5 h-5 text-ats" />
                </div>
                <p className="font-semibold text-foreground">ATS</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Truck Details */}
        <Card variant={currentGame === 'ets2' ? 'glow-ets2' : 'glow-ats'}>
          <CardHeader>
            <CardTitle>Truck Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Brand"
              options={[
                { value: '', label: 'Select brand' },
                ...(currentGame === 'ets2' ? ETS2_BRANDS : ATS_BRANDS),
              ]}
              {...register('brand')}
              error={errors.brand?.message}
            />

            <Input
              label="Model"
              placeholder="e.g., FH16, 579"
              {...register('model')}
              error={errors.model?.message}
            />

            <Input
              label="Custom Name (Optional)"
              placeholder="e.g., The Beast"
              {...register('customName')}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Chassis"
                placeholder="e.g., 6x4"
                {...register('chassis')}
              />
              <Input
                label="Engine"
                placeholder="e.g., 750hp"
                {...register('engine')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Purchase Price"
                placeholder="0"
                {...register('purchasePrice', { valueAsNumber: true })}
              />
              <Input
                type="number"
                label="Current Mileage (km)"
                placeholder="0"
                {...register('currentMileage', { valueAsNumber: true })}
              />
            </div>

            <Input
              label="Paint Job"
              placeholder="e.g., Metallic Blue"
              {...register('paintJob')}
            />
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
            Add Truck
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
