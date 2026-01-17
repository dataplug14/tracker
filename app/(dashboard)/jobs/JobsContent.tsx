'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  Truck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Route,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDistance, formatDate, formatDamage } from '@/lib/utils/formatters';
import type { Job, Truck as TruckType, Trailer } from '@/lib/types/database';

type JobWithRelations = Job & { 
  truck?: Pick<TruckType, 'id' | 'brand' | 'model' | 'custom_name'>;
  trailer?: Pick<Trailer, 'id' | 'trailer_type' | 'custom_name'>;
};

interface JobsContentProps {
  jobs: JobWithRelations[];
}

export function JobsContent({ jobs }: JobsContentProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || 
        job.cargo.toLowerCase().includes(searchLower) ||
        job.source_city.toLowerCase().includes(searchLower) ||
        job.destination_city.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      // Game filter
      const matchesGame = gameFilter === 'all' || job.game === gameFilter;

      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [jobs, search, statusFilter, gameFilter]);

  const toggleExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters & Add */}
        <div className="flex gap-3">
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            options={[
              { value: 'all', label: 'All Games' },
              { value: 'ets2', label: 'ETS2' },
              { value: 'ats', label: 'ATS' },
            ]}
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
          />
          <Link href="/jobs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-foreground-dim" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Found</h3>
            <p className="text-foreground-muted mb-4">
              {jobs.length === 0 
                ? "You haven't submitted any jobs yet."
                : "No jobs match your current filters."
              }
            </p>
            {jobs.length === 0 && (
              <Link href="/jobs/new">
                <Button>Submit Your First Job</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              className="overflow-hidden"
              variant={job.game === 'ets2' ? 'glow-ets2' : 'glow-ats'}
            >
              {/* Job Header Row */}
              <button
                onClick={() => toggleExpand(job.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-background-tertiary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Game Badge */}
                  <Badge variant="game" game={job.game}>
                    {job.game.toUpperCase()}
                  </Badge>

                  {/* Route Info */}
                  <div>
                    <p className="font-semibold text-foreground">
                      {job.source_city} → {job.destination_city}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {job.cargo} • {formatDistance(job.distance_km)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Revenue */}
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(job.revenue, job.game)}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {formatDate(job.completed_at)}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge variant="status" status={job.status}>
                    {job.status}
                  </Badge>

                  {/* Expand Icon */}
                  {expandedJob === job.id ? (
                    <ChevronUp className="w-5 h-5 text-foreground-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-foreground-muted" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedJob === job.id && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {/* Route */}
                    <div className="flex items-start gap-3">
                      <Route className="w-5 h-5 text-foreground-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground-dim uppercase">Route</p>
                        <p className="text-sm font-medium text-foreground">
                          {job.source_city} → {job.destination_city}
                        </p>
                        <p className="text-sm text-foreground-muted">{formatDistance(job.distance_km)}</p>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-foreground-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground-dim uppercase">Revenue</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(job.revenue, job.game)}
                        </p>
                      </div>
                    </div>

                    {/* Damage */}
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-foreground-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground-dim uppercase">Damage</p>
                        <p className={`text-sm font-medium ${
                          job.damage_percent === 0 ? 'text-success' : 
                          job.damage_percent < 5 ? 'text-foreground' : 'text-warning'
                        }`}>
                          {formatDamage(job.damage_percent)}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-foreground-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground-dim uppercase">Completed</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(job.completed_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Truck & Trailer */}
                  {(job.truck || job.trailer) && (
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
                      {job.truck && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4 text-foreground-muted" />
                          <span className="text-foreground">
                            {job.truck.custom_name || `${job.truck.brand} ${job.truck.model}`}
                          </span>
                        </div>
                      )}
                      {job.trailer && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-foreground-muted" />
                          <span className="text-foreground">
                            {job.trailer.custom_name || job.trailer.trailer_type}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Screenshot */}
                  {job.screenshot_url && (
                    <div className="mt-4">
                      <a 
                        href={job.screenshot_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-ets2 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Screenshot
                      </a>
                    </div>
                  )}

                  {/* Review Notes */}
                  {job.review_notes && (
                    <div className="mt-4 p-3 bg-background-tertiary rounded-lg">
                      <p className="text-xs text-foreground-dim uppercase mb-1">Review Notes</p>
                      <p className="text-sm text-foreground-muted">{job.review_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {filteredJobs.length > 0 && (
        <Card padding="sm">
          <CardContent className="flex flex-wrap justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredJobs.length}</p>
              <p className="text-xs text-foreground-muted">Total Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-ets2">
                {formatDistance(filteredJobs.reduce((sum, j) => sum + j.distance_km, 0))}
              </p>
              <p className="text-xs text-foreground-muted">Total Distance</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(filteredJobs.filter(j => j.status === 'approved').reduce((sum, j) => sum + Number(j.revenue), 0))}
              </p>
              <p className="text-xs text-foreground-muted">Approved Revenue</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
