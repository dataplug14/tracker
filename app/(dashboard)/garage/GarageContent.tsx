'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Package,
  Plus,
  Star,
  Route,
  DollarSign,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDistance, formatCurrency } from '@/lib/utils/formatters';
import type { Truck as TruckType, Trailer, VehiclePhoto } from '@/lib/types/database';

type TruckWithPhotos = TruckType & { photos?: VehiclePhoto[] };

interface GarageContentProps {
  trucks: TruckWithPhotos[];
  trailers: Trailer[];
}

export function GarageContent({ trucks, trailers }: GarageContentProps) {
  const [activeTab, setActiveTab] = useState<'trucks' | 'trailers'>('trucks');

  const totalVehicles = trucks.length + trailers.length;
  const totalValue = trucks.reduce((sum, t) => sum + Number(t.purchase_price || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ets2/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-ets2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{trucks.length}</p>
              <p className="text-xs text-foreground-muted">Trucks</p>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ats/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-ats" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{trailers.length}</p>
              <p className="text-xs text-foreground-muted">Trailers</p>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-foreground-muted">Fleet Value</p>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatDistance(trucks.reduce((sum, t) => sum + t.total_km, 0))}
              </p>
              <p className="text-xs text-foreground-muted">Total Distance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('trucks')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'trucks'
                ? 'bg-ets2 text-black'
                : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
            }`}
          >
            <Truck className="w-4 h-4 inline mr-2" />
            Trucks ({trucks.length})
          </button>
          <button
            onClick={() => setActiveTab('trailers')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'trailers'
                ? 'bg-ats text-white'
                : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Trailers ({trailers.length})
          </button>
        </div>

        <Link href={activeTab === 'trucks' ? '/garage/truck/new' : '/garage/trailer/new'}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === 'trucks' ? 'Truck' : 'Trailer'}
          </Button>
        </Link>
      </div>

      {/* Vehicle Grid */}
      {activeTab === 'trucks' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trucks.length === 0 ? (
            <Card className="sm:col-span-2 lg:col-span-3 py-12">
              <CardContent className="text-center">
                <Truck className="w-16 h-16 mx-auto mb-4 text-foreground-dim" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Trucks Yet</h3>
                <p className="text-foreground-muted mb-4">Add your first truck to your garage</p>
                <Link href="/garage/truck/new">
                  <Button>Add First Truck</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            trucks.map((truck) => (
              <Card 
                key={truck.id} 
                variant={truck.game === 'ets2' ? 'glow-ets2' : 'glow-ats'}
                className="overflow-hidden"
              >
                {/* Truck Image */}
                <div className="aspect-video bg-background-tertiary relative">
                  {truck.photos?.[0]?.photo_url ? (
                    <img
                      src={truck.photos[0].photo_url}
                      alt={truck.custom_name || `${truck.brand} ${truck.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Truck className="w-12 h-12 text-foreground-dim" />
                    </div>
                  )}

                  {truck.is_featured && (
                    <div className="absolute top-2 left-2">
                      <div className="px-2 py-1 bg-ets2 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-black fill-current" />
                        <span className="text-xs font-semibold text-black">Featured</span>
                      </div>
                    </div>
                  )}

                  <Badge 
                    variant="game" 
                    game={truck.game}
                    className="absolute top-2 right-2"
                  >
                    {truck.game.toUpperCase()}
                  </Badge>
                </div>

                {/* Truck Info */}
                <CardContent>
                  <h3 className="font-semibold text-foreground mb-1">
                    {truck.custom_name || `${truck.brand} ${truck.model}`}
                  </h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    {truck.brand} {truck.model}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-background-tertiary rounded-lg p-2">
                      <p className="font-bold text-foreground">{formatDistance(truck.current_mileage)}</p>
                      <p className="text-foreground-dim">Mileage</p>
                    </div>
                    <div className="bg-background-tertiary rounded-lg p-2">
                      <p className="font-bold text-foreground">{truck.total_jobs}</p>
                      <p className="text-foreground-dim">Jobs</p>
                    </div>
                    <div className="bg-background-tertiary rounded-lg p-2">
                      <p className="font-bold text-foreground">{formatCurrency(truck.total_revenue, truck.game)}</p>
                      <p className="text-foreground-dim">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trailers.length === 0 ? (
            <Card className="sm:col-span-2 lg:col-span-3 py-12">
              <CardContent className="text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-foreground-dim" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Trailers Yet</h3>
                <p className="text-foreground-muted mb-4">Add your first trailer to your garage</p>
                <Link href="/garage/trailer/new">
                  <Button variant="primary-ats">Add First Trailer</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            trailers.map((trailer) => (
              <Card 
                key={trailer.id}
                variant={trailer.game === 'ets2' ? 'glow-ets2' : 'glow-ats'}
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-background-tertiary flex items-center justify-center">
                      <Package className="w-6 h-6 text-foreground-muted" />
                    </div>
                    <Badge variant="game" game={trailer.game}>
                      {trailer.game.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">
                    {trailer.custom_name || trailer.trailer_type}
                  </h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    {trailer.brand || 'Generic'} • {trailer.capacity || 'Standard'}
                  </p>

                  <div className="flex gap-2">
                    {trailer.is_owned && (
                      <Badge className="text-xs">Owned</Badge>
                    )}
                    {trailer.is_company_trailer && (
                      <Badge className="text-xs">Company</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                    <div className="bg-background-tertiary rounded-lg p-2">
                      <p className="font-bold text-foreground">{trailer.total_jobs}</p>
                      <p className="text-foreground-dim">Jobs</p>
                    </div>
                    <div className="bg-background-tertiary rounded-lg p-2">
                      <p className="font-bold text-foreground">{formatDistance(trailer.total_km)}</p>
                      <p className="text-foreground-dim">Distance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
