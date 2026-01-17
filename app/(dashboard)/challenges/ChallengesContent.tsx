'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target,
  Calendar,
  Clock,
  Trophy,
  Users,
  CheckCircle,
  Play,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatDateTime } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { VtcChallenge, ChallengeParticipant } from '@/lib/types/database';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  progress: number;
}

interface ChallengesContentProps {
  challenges: VtcChallenge[];
  participation: ChallengeParticipant[];
  leaderboardData: Record<string, LeaderboardEntry[]>;
  userId: string;
}

export function ChallengesContent({
  challenges,
  participation,
  leaderboardData,
  userId,
}: ChallengesContentProps) {
  const router = useRouter();
  const [joining, setJoining] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const participationMap = new Map(participation.map((p) => [p.challenge_id, p]));

  const filteredChallenges = challenges.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleJoin = async (challengeId: string) => {
    setJoining(challengeId);
    try {
      const supabase = createClient();
      await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: userId,
        progress: 0,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to join challenge:', error);
    } finally {
      setJoining(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="badge-pending">Upcoming</Badge>;
      case 'active':
        return <Badge className="badge-approved">Active</Badge>;
      case 'completed':
        return <Badge className="bg-foreground-dim/20 text-foreground-dim">Completed</Badge>;
      default:
        return null;
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === f
                ? 'bg-ets2 text-black'
                : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Challenges */}
      {filteredChallenges.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-foreground-dim" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Challenges</h3>
            <p className="text-foreground-muted">
              {filter === 'all' ? 'No challenges have been created yet.' : `No ${filter} challenges.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredChallenges.map((challenge, idx) => {
            const userParticipation = participationMap.get(challenge.id);
            const isJoined = !!userParticipation;
            const progressPercent = userParticipation 
              ? Math.min((userParticipation.progress / challenge.target_value) * 100, 100)
              : 0;
            const leaderboard = leaderboardData[challenge.id] || [];

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card variant={challenge.status === 'active' ? 'glow-ets2' : 'default'}>
                  {/* Banner */}
                  {challenge.banner_url && (
                    <div
                      className="h-32 bg-cover bg-center rounded-t-xl"
                      style={{ backgroundImage: `url(${challenge.banner_url})` }}
                    />
                  )}

                  <CardContent className={challenge.banner_url ? '' : 'pt-6'}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(challenge.status)}
                          <Badge>{challenge.challenge_type}</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{challenge.title}</h3>
                        <p className="text-foreground-muted">{challenge.description}</p>
                      </div>
                      <div className="text-right">
                        {challenge.status === 'active' && (
                          <p className="text-sm font-medium text-ets2">
                            {getTimeRemaining(challenge.ends_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground-muted">
                          Goal: {challenge.target_value.toLocaleString()} {challenge.challenge_type}
                        </span>
                        {isJoined && (
                          <span className="text-foreground font-medium">
                            {userParticipation?.progress.toLocaleString()} / {challenge.target_value.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="h-3 bg-background-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-ets2 to-ats transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm text-foreground-muted mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Starts: {formatDate(challenge.starts_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Ends: {formatDate(challenge.ends_at)}
                      </span>
                    </div>

                    {/* Reward */}
                    {challenge.reward_description && (
                      <div className="p-3 bg-ets2/10 border border-ets2/30 rounded-lg mb-4">
                        <p className="text-sm">
                          <Award className="w-4 h-4 inline mr-2 text-ets2" />
                          <span className="text-foreground-muted">Reward:</span>{' '}
                          <span className="text-foreground font-medium">{challenge.reward_description}</span>
                        </p>
                      </div>
                    )}

                    {/* Leaderboard (for active challenges) */}
                    {challenge.status === 'active' && leaderboard.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground-muted mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Top Participants
                        </h4>
                        <div className="space-y-2">
                          {leaderboard.slice(0, 5).map((entry, rank) => (
                            <div
                              key={entry.user_id}
                              className="flex items-center gap-3 p-2 bg-background-tertiary rounded-lg"
                            >
                              <span className={`w-5 text-center font-bold ${
                                rank === 0 ? 'text-amber-400' :
                                rank === 1 ? 'text-gray-400' :
                                rank === 2 ? 'text-amber-700' :
                                'text-foreground-muted'
                              }`}>
                                {rank + 1}
                              </span>
                              <Avatar
                                src={entry.avatar_url}
                                alt={entry.display_name}
                                size="sm"
                              />
                              <span className="flex-1 text-foreground">{entry.display_name}</span>
                              <span className="text-foreground-muted">
                                {entry.progress.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {challenge.status === 'active' && (
                      <div className="flex justify-end">
                        {isJoined ? (
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Joined</span>
                            {userParticipation?.completed && (
                              <Badge className="badge-approved ml-2">Completed!</Badge>
                            )}
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleJoin(challenge.id)}
                            isLoading={joining === challenge.id}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Join Challenge
                          </Button>
                        )}
                      </div>
                    )}

                    {challenge.status === 'upcoming' && (
                      <p className="text-sm text-foreground-muted text-right">
                        Starts {formatDateTime(challenge.starts_at)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
