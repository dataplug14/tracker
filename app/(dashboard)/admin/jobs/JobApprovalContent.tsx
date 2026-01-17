'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  CheckCircle,
  XCircle,
  ExternalLink,
  Truck,
  MapPin,
  DollarSign,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDistance, formatDamage, formatDateTime } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { Job, Profile, Truck as TruckType, Trailer } from '@/lib/types/database';

type JobWithDetails = Job & {
  profile?: Profile;
  truck?: Pick<TruckType, 'id' | 'brand' | 'model' | 'custom_name'>;
  trailer?: Pick<Trailer, 'id' | 'trailer_type' | 'custom_name'>;
};

interface JobApprovalContentProps {
  jobs: JobWithDetails[];
  reviewerId: string;
}

export function JobApprovalContent({ jobs, reviewerId }: JobApprovalContentProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleApprove = async (jobId: string) => {
    setProcessing(jobId);
    try {
      const supabase = createClient();
      
      await supabase
        .from('jobs')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes[jobId] || null,
        })
        .eq('id', jobId);

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: reviewerId,
        action: 'job_approved',
        target_type: 'job',
        target_id: jobId,
        details: { notes: notes[jobId] || null },
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to approve job:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (jobId: string) => {
    setProcessing(jobId);
    try {
      const supabase = createClient();
      
      await supabase
        .from('jobs')
        .update({
          status: 'rejected',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes[jobId] || null,
        })
        .eq('id', jobId);

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: reviewerId,
        action: 'job_rejected',
        target_type: 'job',
        target_id: jobId,
        details: { notes: notes[jobId] || null },
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to reject job:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="p-6">
        <Card className="py-12">
          <CardContent className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
            <p className="text-foreground-muted">No pending jobs to review.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {jobs.map((job) => (
        <Card 
          key={job.id}
          variant={job.game === 'ets2' ? 'glow-ets2' : 'glow-ats'}
        >
          <CardContent>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {job.profile && (
                  <Link href={`/driver/${job.profile.id}`}>
                    <Avatar
                      src={job.profile.avatar_url}
                      alt={job.profile.display_name}
                      size="md"
                    />
                  </Link>
                )}
                <div>
                  <Link 
                    href={`/driver/${job.user_id}`}
                    className="font-semibold text-foreground hover:text-ets2"
                  >
                    {job.profile?.display_name || 'Unknown Driver'}
                  </Link>
                  <p className="text-sm text-foreground-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted {formatDateTime(job.created_at)}
                  </p>
                </div>
              </div>
              <Badge variant="game" game={job.game}>
                {job.game.toUpperCase()}
              </Badge>
            </div>

            {/* Job Details Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-background-tertiary rounded-lg p-3">
                <div className="flex items-center gap-2 text-foreground-muted mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Route</span>
                </div>
                <p className="font-medium text-foreground">
                  {job.source_city} → {job.destination_city}
                </p>
                <p className="text-sm text-foreground-muted">{job.cargo}</p>
              </div>

              <div className="bg-background-tertiary rounded-lg p-3">
                <div className="flex items-center gap-2 text-foreground-muted mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs">Distance</span>
                </div>
                <p className="font-medium text-foreground">{formatDistance(job.distance_km)}</p>
              </div>

              <div className="bg-background-tertiary rounded-lg p-3">
                <div className="flex items-center gap-2 text-foreground-muted mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Revenue</span>
                </div>
                <p className="font-medium text-foreground">{formatCurrency(job.revenue, job.game)}</p>
              </div>

              <div className="bg-background-tertiary rounded-lg p-3">
                <div className="flex items-center gap-2 text-foreground-muted mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Damage</span>
                </div>
                <p className={`font-medium ${
                  job.damage_percent === 0 ? 'text-success' : 
                  job.damage_percent < 5 ? 'text-foreground' : 'text-warning'
                }`}>
                  {formatDamage(job.damage_percent)}
                </p>
              </div>
            </div>

            {/* Vehicle Info */}
            {(job.truck || job.trailer) && (
              <div className="flex flex-wrap gap-3 mb-4">
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
              <a
                href={job.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-ets2 hover:underline mb-4"
              >
                <ExternalLink className="w-4 h-4" />
                View Screenshot
              </a>
            )}

            {/* Review Notes & Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Input
                placeholder="Add review notes (optional)..."
                value={notes[job.id] || ''}
                onChange={(e) => setNotes({ ...notes, [job.id]: e.target.value })}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => handleReject(job.id)}
                  isLoading={processing === job.id}
                  disabled={processing !== null}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApprove(job.id)}
                  isLoading={processing === job.id}
                  disabled={processing !== null}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
