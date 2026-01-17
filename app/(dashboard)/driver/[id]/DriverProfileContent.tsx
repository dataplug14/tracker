'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Route,
  Package,
  DollarSign,
  AlertTriangle,
  Shield,
  Trophy,
  Truck,
  Calendar,
  ExternalLink,
  MapPin,
  Award,
  Star,
  Settings,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDistance, formatCurrency, formatDate, formatDamage, getRarityColor } from '@/lib/utils/formatters';
import type { Profile, Job, Truck as TruckType, DriverAchievement, Achievement, VehiclePhoto } from '@/lib/types/database';

type TruckWithPhotos = TruckType & { photos?: VehiclePhoto[] };
type AchievementWithDetails = DriverAchievement & { achievement?: Achievement };

interface DriverProfileContentProps {
  profile: Profile;
  role: string;
  stats: {
    totalKm: number;
    totalJobs: number;
    totalRevenue: number;
    avgDamage: number;
    perfectDeliveries: number;
    favoriteRoutes: { route: string; count: number }[];
  };
  achievements: AchievementWithDetails[];
  trucks: TruckWithPhotos[] | null;
  recentJobs: Job[] | null;
  rank: number;
  isOwnProfile: boolean;
}

export function DriverProfileContent({
  profile,
  role,
  stats,
  achievements,
  trucks,
  recentJobs,
  rank,
  isOwnProfile,
}: DriverProfileContentProps) {
  const featuredTruck = trucks?.find((t) => t.is_featured) || trucks?.[0];

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          {/* Banner */}
          <div 
            className="h-32 bg-gradient-to-r from-ets2/30 to-ats/30"
            style={profile.banner_url ? { 
              backgroundImage: `url(${profile.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          />

          {/* Profile Info */}
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row gap-4 -mt-10">
              <Avatar
                src={profile.avatar_url}
                alt={profile.display_name}
                size="xl"
                rank={rank <= 3 ? rank : undefined}
                className="ring-4 ring-background-secondary"
              />
              
              <div className="flex-1 pt-2 sm:pt-12">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{profile.display_name}</h1>
                  <Badge className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />
                    {role}
                  </Badge>
                  {rank > 0 && rank <= 10 && (
                    <Badge variant="game" game="ets2">
                      <Trophy className="w-3 h-3 mr-1" />
                      #{rank}
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-foreground-muted mb-3">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-foreground-muted">
                  {profile.truckers_mp_id && (
                    <a
                      href={`https://truckersmp.com/user/${profile.truckers_mp_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-ets2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      TruckersMP
                    </a>
                  )}
                  {profile.steam_id && (
                    <a
                      href={`https://steamcommunity.com/profiles/${profile.steam_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-ats"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Steam
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <Link href="/settings/profile">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <Card className="text-center py-4">
          <Route className="w-6 h-6 text-ets2 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatDistance(stats.totalKm)}</p>
          <p className="text-xs text-foreground-muted">Total Distance</p>
        </Card>

        <Card className="text-center py-4">
          <Package className="w-6 h-6 text-ats mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
          <p className="text-xs text-foreground-muted">Jobs Completed</p>
        </Card>

        <Card className="text-center py-4">
          <DollarSign className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-foreground-muted">Total Revenue</p>
        </Card>

        <Card className="text-center py-4">
          <AlertTriangle className="w-6 h-6 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatDamage(stats.avgDamage)}</p>
          <p className="text-xs text-foreground-muted">Avg Damage</p>
        </Card>

        <Card className="text-center py-4">
          <Trophy className="w-6 h-6 text-ets2 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">#{rank || '-'}</p>
          <p className="text-xs text-foreground-muted">Leaderboard</p>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  <Award className="w-5 h-5 inline mr-2 text-ets2" />
                  Achievements ({achievements.length})
                </CardTitle>
                <Link href="/achievements" className="text-sm text-ets2 hover:underline">
                  View All
                </Link>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <p className="text-center text-foreground-muted py-4">No achievements yet</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {achievements.slice(0, 12).map((da) => (
                      <div
                        key={da.id}
                        className={`aspect-square rounded-lg border-2 flex items-center justify-center bg-background-tertiary transition-all hover:scale-105 ${
                          da.achievement ? getRarityColor(da.achievement.rarity) : ''
                        }`}
                        title={da.achievement?.name}
                      >
                        <span className="text-2xl">{da.achievement?.icon === 'trophy' ? '🏆' : da.achievement?.icon === 'star' ? '⭐' : '🎖️'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Jobs */}
          {recentJobs && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Package className="w-5 h-5 inline mr-2 text-ats" />
                    Recent Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentJobs.length === 0 ? (
                    <p className="text-center text-foreground-muted py-4">No approved jobs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {recentJobs.slice(0, 5).map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="game" game={job.game}>
                              {job.game.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="font-medium text-foreground">
                                {job.source_city} → {job.destination_city}
                              </p>
                              <p className="text-xs text-foreground-muted">
                                {job.cargo} • {formatDistance(job.distance_km)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {formatCurrency(job.revenue, job.game)}
                            </p>
                            <p className="text-xs text-foreground-muted">
                              {formatDate(job.completed_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!recentJobs && !isOwnProfile && (
            <Card>
              <CardContent className="text-center py-8 text-foreground-muted">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Job history is private</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Featured Truck */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <Truck className="w-5 h-5 inline mr-2 text-ets2" />
                  {trucks ? 'Featured Truck' : 'Fleet'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trucks === null ? (
                  <div className="text-center py-4 text-foreground-muted">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Fleet is private</p>
                  </div>
                ) : featuredTruck ? (
                  <div>
                    <div className="aspect-video bg-background-tertiary rounded-lg mb-3 overflow-hidden">
                      {featuredTruck.photos?.[0]?.photo_url ? (
                        <img
                          src={featuredTruck.photos[0].photo_url}
                          alt={featuredTruck.custom_name || `${featuredTruck.brand} ${featuredTruck.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Truck className="w-12 h-12 text-foreground-dim" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {featuredTruck.custom_name || `${featuredTruck.brand} ${featuredTruck.model}`}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {featuredTruck.brand} {featuredTruck.model}
                        </p>
                      </div>
                      {featuredTruck.is_featured && (
                        <Star className="w-5 h-5 text-ets2 fill-current" />
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-background-tertiary rounded p-2 text-center">
                        <p className="font-bold text-foreground">{formatDistance(featuredTruck.current_mileage)}</p>
                        <p className="text-foreground-dim">Mileage</p>
                      </div>
                      <div className="bg-background-tertiary rounded p-2 text-center">
                        <p className="font-bold text-foreground">{featuredTruck.total_jobs}</p>
                        <p className="text-foreground-dim">Jobs</p>
                      </div>
                    </div>
                    {trucks.length > 1 && (
                      <p className="text-xs text-foreground-muted mt-3 text-center">
                        +{trucks.length - 1} more vehicles in fleet
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-foreground-muted py-4">No trucks in fleet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Favorite Routes */}
          {stats.favoriteRoutes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    <MapPin className="w-5 h-5 inline mr-2 text-ats" />
                    Favorite Routes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.favoriteRoutes.map((route, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-background-tertiary rounded-lg"
                    >
                      <span className="text-sm text-foreground">{route.route}</span>
                      <Badge>{route.count}x</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
