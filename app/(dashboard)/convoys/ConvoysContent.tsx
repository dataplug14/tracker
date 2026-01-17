'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Truck,
  ExternalLink,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { formatDate, formatDateTime } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { Convoy, Profile, Truck as TruckType, ConvoySignup } from '@/lib/types/database';

type ConvoyWithDetails = Convoy & {
  organizer?: Profile;
  signups?: (ConvoySignup & { 
    profile?: Profile;
    truck?: Pick<TruckType, 'id' | 'brand' | 'model' | 'custom_name'>;
  })[];
};

interface ConvoysContentProps {
  convoys: ConvoyWithDetails[];
  userTrucks: Pick<TruckType, 'id' | 'brand' | 'model' | 'custom_name' | 'game'>[];
  userId: string;
}

export function ConvoysContent({ convoys, userTrucks, userId }: ConvoysContentProps) {
  const router = useRouter();
  const [expandedConvoy, setExpandedConvoy] = useState<string | null>(null);
  const [signingUp, setSigningUp] = useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<string>('');

  const now = new Date();
  const upcomingConvoys = convoys.filter(c => new Date(c.scheduled_at) >= now && c.status === 'scheduled');
  const pastConvoys = convoys.filter(c => new Date(c.scheduled_at) < now || c.status !== 'scheduled');

  const isSignedUp = (convoy: ConvoyWithDetails) => {
    return convoy.signups?.some(s => s.user_id === userId);
  };

  const handleSignup = async (convoyId: string) => {
    if (!selectedTruck) return;

    setSigningUp(convoyId);
    try {
      const supabase = createClient();
      await supabase.from('convoy_signups').insert({
        convoy_id: convoyId,
        user_id: userId,
        truck_id: selectedTruck,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to sign up:', error);
    } finally {
      setSigningUp(null);
      setSelectedTruck('');
    }
  };

  const handleCancelSignup = async (convoyId: string) => {
    setSigningUp(convoyId);
    try {
      const supabase = createClient();
      await supabase
        .from('convoy_signups')
        .delete()
        .eq('convoy_id', convoyId)
        .eq('user_id', userId);
      router.refresh();
    } catch (error) {
      console.error('Failed to cancel signup:', error);
    } finally {
      setSigningUp(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'badge-pending';
      case 'in_progress': return 'badge-approved';
      case 'completed': return 'bg-foreground-dim/20 text-foreground-dim';
      case 'cancelled': return 'badge-rejected';
      default: return '';
    }
  };

  const ConvoyCard = ({ convoy, idx }: { convoy: ConvoyWithDetails; idx: number }) => {
    const isExpanded = expandedConvoy === convoy.id;
    const signedUp = isSignedUp(convoy);
    const isPast = new Date(convoy.scheduled_at) < now;
    const filteredTrucks = userTrucks.filter(t => t.game === convoy.game);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
      >
        <Card 
          variant={convoy.game === 'ets2' ? 'glow-ets2' : 'glow-ats'}
          className={isPast ? 'opacity-60' : ''}
        >
          {/* Header */}
          <button
            onClick={() => setExpandedConvoy(isExpanded ? null : convoy.id)}
            className="w-full p-4 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="game" game={convoy.game}>
                    {convoy.game.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(convoy.status)}>
                    {convoy.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {convoy.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-sm text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(convoy.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {convoy.departure_city} → {convoy.arrival_city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {convoy.signups?.length || 0}
                    {convoy.max_participants && ` / ${convoy.max_participants}`} signed up
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {signedUp && (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-foreground-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-foreground-muted" />
                )}
              </div>
            </div>
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-border pt-4">
              {convoy.description && (
                <p className="text-foreground-muted mb-4">{convoy.description}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-background-tertiary rounded-lg p-3">
                  <p className="text-xs text-foreground-dim uppercase mb-1">Route</p>
                  <p className="text-foreground">
                    {convoy.departure_city} → {convoy.arrival_city}
                  </p>
                  {convoy.route_description && (
                    <p className="text-sm text-foreground-muted mt-1">{convoy.route_description}</p>
                  )}
                </div>

                <div className="bg-background-tertiary rounded-lg p-3">
                  <p className="text-xs text-foreground-dim uppercase mb-1">Details</p>
                  <p className="text-foreground">Server: {convoy.server}</p>
                  {convoy.estimated_duration_minutes && (
                    <p className="text-sm text-foreground-muted">
                      ~{convoy.estimated_duration_minutes} min duration
                    </p>
                  )}
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-foreground-muted">Organized by:</span>
                {convoy.organizer && (
                  <Link
                    href={`/driver/${convoy.organizer.id}`}
                    className="flex items-center gap-2 hover:opacity-80"
                  >
                    <Avatar
                      src={convoy.organizer.avatar_url}
                      alt={convoy.organizer.display_name}
                      size="sm"
                    />
                    <span className="text-foreground">{convoy.organizer.display_name}</span>
                  </Link>
                )}
              </div>

              {/* Participants */}
              {convoy.signups && convoy.signups.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-foreground-muted mb-2">
                    Participants ({convoy.signups.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {convoy.signups.map((signup) => (
                      <Link
                        key={signup.id}
                        href={`/driver/${signup.user_id}`}
                        className="flex items-center gap-2 bg-background-tertiary rounded-lg px-3 py-2 hover:bg-background-tertiary/80"
                      >
                        <Avatar
                          src={signup.profile?.avatar_url}
                          alt={signup.profile?.display_name || 'Driver'}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm text-foreground">{signup.profile?.display_name}</p>
                          {signup.truck && (
                            <p className="text-xs text-foreground-muted">
                              {signup.truck.custom_name || `${signup.truck.brand} ${signup.truck.model}`}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Discord Link */}
              {convoy.discord_event_url && (
                <a
                  href={convoy.discord_event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-ats hover:underline mb-4"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Discord
                </a>
              )}

              {/* Sign Up Actions */}
              {!isPast && convoy.status === 'scheduled' && (
                <div className="mt-4 pt-4 border-t border-border">
                  {signedUp ? (
                    <div className="flex items-center justify-between">
                      <p className="text-success flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        You're signed up!
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelSignup(convoy.id)}
                        isLoading={signingUp === convoy.id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Select
                        options={[
                          { value: '', label: 'Select your truck' },
                          ...filteredTrucks.map(t => ({
                            value: t.id,
                            label: t.custom_name || `${t.brand} ${t.model}`,
                          })),
                        ]}
                        value={selectedTruck}
                        onChange={(e) => setSelectedTruck(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSignup(convoy.id)}
                        disabled={!selectedTruck}
                        isLoading={signingUp === convoy.id}
                        variant={convoy.game === 'ets2' ? 'primary-ets2' : 'primary-ats'}
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Upcoming Convoys */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-ets2" />
          Upcoming Convoys ({upcomingConvoys.length})
        </h2>

        {upcomingConvoys.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-foreground-dim" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Convoys</h3>
              <p className="text-foreground-muted">Check back later for scheduled events!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingConvoys.map((convoy, idx) => (
              <ConvoyCard key={convoy.id} convoy={convoy} idx={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Past Convoys */}
      {pastConvoys.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground-muted mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Past Convoys ({pastConvoys.length})
          </h2>
          <div className="space-y-4">
            {pastConvoys.slice(0, 5).map((convoy, idx) => (
              <ConvoyCard key={convoy.id} convoy={convoy} idx={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
