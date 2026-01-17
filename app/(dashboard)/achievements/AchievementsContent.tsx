'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Route, Package, Shield, Truck, Users, Lock, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getRarityColor, formatDate } from '@/lib/utils/formatters';
import type { Achievement, AchievementCategory, AchievementRarity } from '@/lib/types/database';

interface EarnedAchievement {
  achievement_id: string;
  unlocked_at: string;
  progress: number;
}

interface AchievementsContentProps {
  achievements: Achievement[];
  earnedAchievements: EarnedAchievement[];
  userProgress: {
    total_distance: number;
    total_jobs: number;
    zero_damage_jobs: number;
    owned_trucks: number;
    total_vehicles: number;
    convoy_attendance: number;
  };
  totalMembers: number;
  earnedCountMap: Record<string, number>;
}

const categoryIcons: Record<AchievementCategory, React.ReactNode> = {
  distance: <Route className="w-5 h-5" />,
  jobs: <Package className="w-5 h-5" />,
  perfect: <Shield className="w-5 h-5" />,
  streak: <Trophy className="w-5 h-5" />,
  fleet: <Truck className="w-5 h-5" />,
  loyalty: <Award className="w-5 h-5" />,
  special: <Users className="w-5 h-5" />,
};

const categoryLabels: Record<AchievementCategory, string> = {
  distance: 'Distance',
  jobs: 'Jobs',
  perfect: 'Perfect Delivery',
  streak: 'Streaks',
  fleet: 'Fleet',
  loyalty: 'Loyalty',
  special: 'Special',
};

const rarityLabels: Record<AchievementRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const rarityColors: Record<AchievementRarity, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

export function AchievementsContent({
  achievements,
  earnedAchievements,
  userProgress,
  totalMembers,
  earnedCountMap,
}: AchievementsContentProps) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');

  const earnedIds = new Set(earnedAchievements.map((e) => e.achievement_id));
  const earnedLookup = new Map(earnedAchievements.map((e) => [e.achievement_id, e]));

  const getProgress = (achievement: Achievement): number => {
    switch (achievement.requirement_type) {
      case 'total_distance':
        return userProgress.total_distance;
      case 'total_jobs':
        return userProgress.total_jobs;
      case 'zero_damage_jobs':
        return userProgress.zero_damage_jobs;
      case 'owned_trucks':
        return userProgress.owned_trucks;
      case 'total_vehicles':
        return userProgress.total_vehicles;
      case 'convoy_attendance':
        return userProgress.convoy_attendance;
      default:
        return 0;
    }
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      const isEarned = earnedIds.has(a.id);
      
      if (filter === 'earned' && !isEarned) return false;
      if (filter === 'locked' && isEarned) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      
      return true;
    });
  }, [achievements, earnedIds, filter, categoryFilter]);

  const stats = {
    total: achievements.length,
    earned: earnedAchievements.length,
    totalPoints: earnedAchievements.reduce((sum, e) => {
      const a = achievements.find((a) => a.id === e.achievement_id);
      return sum + (a?.points || 0);
    }, 0),
  };

  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <Award className="w-8 h-8 text-ets2 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.earned}/{stats.total}</p>
          <p className="text-sm text-foreground-muted">Achievements</p>
        </Card>

        <Card className="text-center py-4">
          <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.totalPoints}</p>
          <p className="text-sm text-foreground-muted">Points</p>
        </Card>

        <Card className="text-center py-4">
          <Check className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">
            {Math.round((stats.earned / stats.total) * 100)}%
          </p>
          <p className="text-sm text-foreground-muted">Completion</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {(['all', 'earned', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-ets2 text-black'
                  : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f === 'earned' ? 'Earned' : 'Locked'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-ats text-white'
                : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                categoryFilter === cat
                  ? 'bg-ats text-white'
                  : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
              }`}
            >
              {categoryIcons[cat]}
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, idx) => {
          const isEarned = earnedIds.has(achievement.id);
          const earned = earnedLookup.get(achievement.id);
          const progress = getProgress(achievement);
          const progressPercent = Math.min((progress / achievement.requirement_value) * 100, 100);
          const rarityPercent = ((earnedCountMap[achievement.id] || 0) / totalMembers) * 100;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden ${
                  isEarned ? getRarityColor(achievement.rarity) : 'opacity-75'
                }`}
                variant={isEarned ? 'glow-ets2' : 'default'}
              >
                {/* Rarity indicator */}
                <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium ${rarityColors[achievement.rarity]}`}>
                  {rarityLabels[achievement.rarity]}
                </div>

                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isEarned 
                        ? 'bg-gradient-to-br from-ets2/30 to-ats/30' 
                        : 'bg-background-tertiary'
                    }`}>
                      {isEarned ? (
                        <span className="text-3xl">🏆</span>
                      ) : (
                        <Lock className="w-6 h-6 text-foreground-dim" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{achievement.name}</h3>
                      <p className="text-sm text-foreground-muted mb-2">{achievement.description}</p>

                      {/* Progress bar */}
                      {!isEarned && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground-muted">Progress</span>
                            <span className="text-foreground">{Math.min(progress, achievement.requirement_value)}/{achievement.requirement_value}</span>
                          </div>
                          <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-ets2 to-ats transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs">
                        <Badge className="flex items-center gap-1">
                          {categoryIcons[achievement.category]}
                          {categoryLabels[achievement.category]}
                        </Badge>
                        <span className="text-foreground-dim">
                          {rarityPercent.toFixed(1)}% have this
                        </span>
                      </div>

                      {isEarned && earned && (
                        <p className="text-xs text-success mt-2">
                          <Check className="w-3 h-3 inline mr-1" />
                          Unlocked {formatDate(earned.unlocked_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Points */}
                <div className="absolute bottom-3 right-4 text-sm font-bold text-ets2">
                  +{achievement.points} pts
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-foreground-dim" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Achievements Found</h3>
            <p className="text-foreground-muted">
              {filter === 'earned' ? "You haven't earned any achievements yet!" : "No locked achievements to show."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
