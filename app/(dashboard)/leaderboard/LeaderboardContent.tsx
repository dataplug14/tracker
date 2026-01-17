'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Route, Package, DollarSign, Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatCurrency, formatNumber, getRankBadge } from '@/lib/utils/formatters';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_km: number;
  total_jobs: number;
  total_revenue: number;
}

interface LeaderboardContentProps {
  data: LeaderboardEntry[];
  currentUserId: string;
}

type Metric = 'km' | 'jobs' | 'revenue';

export function LeaderboardContent({ data, currentUserId }: LeaderboardContentProps) {
  const [metric, setMetric] = useState<Metric>('km');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (metric) {
        case 'km':
          return b.total_km - a.total_km;
        case 'jobs':
          return b.total_jobs - a.total_jobs;
        case 'revenue':
          return b.total_revenue - a.total_revenue;
      }
    });
  }, [data, metric]);

  const getValue = (entry: LeaderboardEntry) => {
    switch (metric) {
      case 'km':
        return formatDistance(entry.total_km);
      case 'jobs':
        return `${formatNumber(entry.total_jobs)} jobs`;
      case 'revenue':
        return formatCurrency(entry.total_revenue);
    }
  };

  const top3 = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  const currentUserRank = sortedData.findIndex((e) => e.user_id === currentUserId) + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Metric Toggle */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setMetric('km')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            metric === 'km'
              ? 'bg-ets2 text-black'
              : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
          }`}
        >
          <Route className="w-4 h-4" />
          Distance
        </button>
        <button
          onClick={() => setMetric('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            metric === 'jobs'
              ? 'bg-ets2 text-black'
              : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
          }`}
        >
          <Package className="w-4 h-4" />
          Jobs
        </button>
        <button
          onClick={() => setMetric('revenue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            metric === 'revenue'
              ? 'bg-ets2 text-black'
              : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Revenue
        </button>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex justify-center items-end gap-4 py-8">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="text-center">
              <Link href={`/driver/${top3[1].user_id}`}>
                <div className="relative">
                  <Avatar
                    src={top3[1].avatar_url}
                    alt={top3[1].display_name}
                    size="lg"
                    rank={2}
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                </div>
              </Link>
              <p className="font-semibold text-foreground mt-3">{top3[1].display_name}</p>
              <p className="text-sm text-foreground-muted">{getValue(top3[1])}</p>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="text-center -mb-4">
              <Link href={`/driver/${top3[0].user_id}`}>
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <Avatar
                    src={top3[0].avatar_url}
                    alt={top3[0].display_name}
                    size="xl"
                    rank={1}
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
              </Link>
              <p className="font-bold text-lg text-foreground mt-4">{top3[0].display_name}</p>
              <p className="text-ets2 font-semibold">{getValue(top3[0])}</p>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="text-center">
              <Link href={`/driver/${top3[2].user_id}`}>
                <div className="relative">
                  <Avatar
                    src={top3[2].avatar_url}
                    alt={top3[2].display_name}
                    size="lg"
                    rank={3}
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                </div>
              </Link>
              <p className="font-semibold text-foreground mt-3">{top3[2].display_name}</p>
              <p className="text-sm text-foreground-muted">{getValue(top3[2])}</p>
            </div>
          )}
        </div>
      )}

      {/* Your Rank Card */}
      {currentUserRank > 0 && (
        <Card variant="glow-ets2">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Medal className="w-6 h-6 text-ets2" />
              <div>
                <p className="text-sm text-foreground-muted">Your Rank</p>
                <p className="text-2xl font-bold text-foreground">#{currentUserRank}</p>
              </div>
            </div>
            {sortedData[currentUserRank - 1] && (
              <p className="text-lg font-semibold text-ets2">
                {getValue(sortedData[currentUserRank - 1])}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Rankings */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Rank</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Driver</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground-muted">
                  {metric === 'km' ? 'Distance' : metric === 'jobs' ? 'Jobs' : 'Revenue'}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.user_id === currentUserId;
                const rankBadge = getRankBadge(rank);

                return (
                  <tr
                    key={entry.user_id}
                    className={`table-row ${
                      isCurrentUser ? 'bg-ets2/10' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className={`rank-badge ${rankBadge.className}`}>
                        {rank <= 3 ? rankBadge.label : `#${rank}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/driver/${entry.user_id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <Avatar
                          src={entry.avatar_url}
                          alt={entry.display_name}
                          size="sm"
                          rank={rank <= 3 ? rank : undefined}
                        />
                        <span className={`font-medium ${isCurrentUser ? 'text-ets2' : 'text-foreground'}`}>
                          {entry.display_name}
                          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">
                      {getValue(entry)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {sortedData.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No ranking data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
