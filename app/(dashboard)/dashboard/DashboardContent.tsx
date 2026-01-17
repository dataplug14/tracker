'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Route, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Trophy,
  Truck,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatGauge } from '@/components/ui/StatGauge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDistance, formatDate, formatRelativeTime, getStatusColor } from '@/lib/utils/formatters';
import type { Job, Truck as TruckType, Convoy, VtcChallenge } from '@/lib/types/database';

interface DashboardContentProps {
  stats: {
    totalKm: number;
    totalJobs: number;
    totalRevenue: number;
    avgDamage: number;
    weekKm: number;
    weekJobs: number;
    monthKm: number;
    monthJobs: number;
  };
  recentJobs: (Job & { truck?: { brand: string; model: string } })[];
  achievementsCount: number;
  featuredTruck: (TruckType & { photos?: { photo_url: string; is_primary: boolean }[] }) | null;
  upcomingConvoys: (Convoy & { signups?: { user_id: string }[] })[];
  activeChallenges: VtcChallenge[];
}

export function DashboardContent({
  stats,
  recentJobs,
  achievementsCount,
  featuredTruck,
  upcomingConvoys,
  activeChallenges,
}: DashboardContentProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');

  const displayStats = {
    km: period === 'week' ? stats.weekKm : period === 'month' ? stats.monthKm : stats.totalKm,
    jobs: period === 'week' ? stats.weekJobs : period === 'month' ? stats.monthJobs : stats.totalJobs,
    revenue: stats.totalRevenue,
    damage: stats.avgDamage,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Period Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-background-secondary rounded-lg p-1 border border-border">
          {(['week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p
                  ? 'bg-ets2 text-black'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              {p === 'week' ? '7 Days' : p === 'month' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex items-center justify-center py-6">
            <StatGauge
              value={displayStats.km}
              maxValue={100000}
              label="Distance"
              icon={<Route className="w-5 h-5" />}
              suffix="km"
              variant="ets2"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="flex items-center justify-center py-6">
            <StatGauge
              value={displayStats.jobs}
              maxValue={1000}
              label="Jobs"
              icon={<Package className="w-5 h-5" />}
              variant="ets2"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="flex items-center justify-center py-6">
            <StatGauge
              value={displayStats.revenue}
              maxValue={1000000}
              label="Revenue"
              icon={<DollarSign className="w-5 h-5" />}
              suffix="€"
              variant="ets2"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="flex items-center justify-center py-6">
            <StatGauge
              value={displayStats.damage}
              maxValue={100}
              label="Avg Damage"
              icon={<AlertTriangle className="w-5 h-5" />}
              suffix="%"
              variant={displayStats.damage > 5 ? 'ats' : 'ets2'}
            />
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Jobs</CardTitle>
              <Link href="/jobs" className="text-sm text-ets2 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs yet</p>
                  <Link href="/jobs/new">
                    <Button size="sm" className="mt-3">Submit First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          job.game === 'ets2' ? 'bg-ets2/20' : 'bg-ats/20'
                        }`}>
                          <Truck className={`w-5 h-5 ${job.game === 'ets2' ? 'text-ets2' : 'text-ats'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {job.source_city} → {job.destination_city}
                          </p>
                          <p className="text-sm text-foreground-muted">
                            {job.cargo} • {formatDistance(job.distance_km)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="status" status={job.status}>
                          {job.status}
                        </Badge>
                        <p className="text-xs text-foreground-muted mt-1">
                          {formatRelativeTime(job.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glow-ets2">
              <CardContent className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ets2/20 to-ats/20 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-ets2" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{achievementsCount}</p>
                  <p className="text-sm text-foreground-muted">Achievements Unlocked</p>
                </div>
              </CardContent>
              <div className="px-5 pb-5">
                <Link href="/achievements">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Badges
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
            >
              <Card variant="glow-ats">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-ats" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="p-3 bg-background-tertiary rounded-lg"
                      >
                        <p className="font-medium text-foreground">{challenge.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-foreground-muted">
                            Target: {challenge.target_value.toLocaleString()} {challenge.challenge_type}
                          </span>
                          <span className="text-xs text-ats">
                            Ends {formatDate(challenge.ends_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/challenges" className="block mt-3">
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Challenges
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Featured Truck */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-ets2" />
                  Featured Truck
                </CardTitle>
              </CardHeader>
              <CardContent>
                {featuredTruck ? (
                  <div>
                    <div className="aspect-video bg-background-tertiary rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {featuredTruck.photos?.[0]?.photo_url ? (
                        <img 
                          src={featuredTruck.photos[0].photo_url} 
                          alt={featuredTruck.custom_name || `${featuredTruck.brand} ${featuredTruck.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Truck className="w-12 h-12 text-foreground-dim" />
                      )}
                    </div>
                    <p className="font-semibold text-foreground">
                      {featuredTruck.custom_name || `${featuredTruck.brand} ${featuredTruck.model}`}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {formatDistance(featuredTruck.current_mileage)} • {featuredTruck.total_jobs} jobs
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-foreground-muted">
                    <p className="text-sm">No featured truck set</p>
                    <Link href="/garage">
                      <Button variant="ghost" size="sm" className="mt-2">
                        Go to Garage
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Convoys */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ats" />
                  Upcoming Convoys
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingConvoys.length === 0 ? (
                  <p className="text-center text-sm text-foreground-muted py-4">
                    No upcoming convoys
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingConvoys.map((convoy) => (
                      <div
                        key={convoy.id}
                        className="p-3 bg-background-tertiary rounded-lg"
                      >
                        <p className="font-medium text-foreground">{convoy.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(convoy.scheduled_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {convoy.signups?.length || 0} signed up
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-foreground-muted">
                          <MapPin className="w-3 h-3" />
                          {convoy.departure_city} → {convoy.arrival_city}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/convoys" className="block mt-3">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
