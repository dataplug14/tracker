'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Route,
  DollarSign,
  Calendar,
  MapPin,
  ExternalLink,
  Globe,
  MessageSquare,
  Trophy,
  Truck,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import type { VtcSettings, Convoy } from '@/lib/types/database';

interface TopDriver {
  id: string;
  display_name: string;
  avatar_url: string | null;
  distance: number;
}

interface PublicVTCContentProps {
  vtc: VtcSettings;
  stats: {
    drivers: number;
    totalKm: number;
    totalRevenue: number;
  };
  convoys: Convoy[];
  topDrivers: TopDriver[];
}

export function PublicVTCContent({ vtc, stats, convoys, topDrivers }: PublicVTCContentProps) {
  const primaryColor = vtc.primary_color || '#f59e0b';
  const secondaryColor = vtc.secondary_color || '#3b82f6';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div
        className="relative h-64 md:h-80"
        style={{
          background: vtc.banner_url
            ? `url(${vtc.banner_url}) center/cover`
            : `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-6xl mx-auto flex items-end gap-6">
            {vtc.logo_url ? (
              <img
                src={vtc.logo_url}
                alt={vtc.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-background object-cover"
              />
            ) : (
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-background flex items-center justify-center text-4xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                {vtc.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{vtc.name}</h1>
              {vtc.short_description && (
                <p className="text-foreground-muted">{vtc.short_description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card className="text-center py-6">
            <Users className="w-8 h-8 mx-auto mb-2" style={{ color: primaryColor }} />
            <p className="text-3xl font-bold text-foreground">{stats.drivers}</p>
            <p className="text-sm text-foreground-muted">Drivers</p>
          </Card>
          <Card className="text-center py-6">
            <Route className="w-8 h-8 mx-auto mb-2" style={{ color: secondaryColor }} />
            <p className="text-3xl font-bold text-foreground">{formatDistance(stats.totalKm)}</p>
            <p className="text-sm text-foreground-muted">Total Distance</p>
          </Card>
          <Card className="text-center py-6">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-foreground-muted">Revenue</p>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {vtc.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>About Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground-muted whitespace-pre-wrap">{vtc.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Upcoming Convoys */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Upcoming Convoys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {convoys.length === 0 ? (
                    <p className="text-center text-foreground-muted py-4">
                      No upcoming convoys scheduled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {convoys.map((convoy) => (
                        <div
                          key={convoy.id}
                          className="flex items-center justify-between p-4 bg-background-tertiary rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="game" game={convoy.game}>
                                {convoy.game.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-foreground">{convoy.title}</span>
                            </div>
                            <p className="text-sm text-foreground-muted flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {convoy.departure_city} → {convoy.arrival_city}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {formatDateTime(convoy.scheduled_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Drivers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Trophy className="w-5 h-5 inline mr-2" style={{ color: primaryColor }} />
                    Top Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topDrivers.length === 0 ? (
                    <p className="text-center text-foreground-muted py-4">
                      No drivers yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topDrivers.map((driver, idx) => (
                        <div
                          key={driver.id}
                          className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg"
                        >
                          <span className={`w-6 text-center font-bold ${
                            idx === 0 ? 'text-amber-400' :
                            idx === 1 ? 'text-gray-400' :
                            idx === 2 ? 'text-amber-700' :
                            'text-foreground-muted'
                          }`}>
                            #{idx + 1}
                          </span>
                          <Avatar
                            src={driver.avatar_url}
                            alt={driver.display_name}
                            size="sm"
                          />
                          <span className="flex-1 font-medium text-foreground">
                            {driver.display_name}
                          </span>
                          <span className="text-foreground-muted">
                            {formatDistance(driver.distance)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                className="overflow-hidden"
                style={{
                  borderColor: vtc.is_recruiting ? primaryColor : undefined,
                }}
              >
                <div
                  className="h-2"
                  style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
                />
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    {vtc.is_recruiting ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="font-semibold text-foreground">Now Recruiting!</span>
                      </>
                    ) : (
                      <span className="text-foreground-muted">Recruitment Closed</span>
                    )}
                  </div>

                  {vtc.join_info && vtc.is_recruiting && (
                    <p className="text-sm text-foreground-muted mb-4">{vtc.join_info}</p>
                  )}

                  {vtc.discord_url && (
                    <a href={vtc.discord_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full" variant="primary-ats">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Join Discord
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-foreground-muted" />
                    <span className="text-foreground-muted">Primary Game:</span>
                    <Badge variant="game" game={vtc.primary_game || 'ets2'}>
                      {(vtc.primary_game || 'ets2').toUpperCase()}
                    </Badge>
                  </div>

                  {vtc.founded_at && (
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <Calendar className="w-4 h-4" />
                      <span>Founded: {new Date(vtc.founded_at).getFullYear()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Links */}
            {(vtc.website_url || vtc.twitter_url || vtc.youtube_url || vtc.twitch_url) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vtc.website_url && (
                      <a
                        href={vtc.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground p-2 rounded-lg hover:bg-background-tertiary"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    )}
                    {vtc.twitter_url && (
                      <a
                        href={vtc.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground p-2 rounded-lg hover:bg-background-tertiary"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Twitter/X
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    )}
                    {vtc.youtube_url && (
                      <a
                        href={vtc.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground p-2 rounded-lg hover:bg-background-tertiary"
                      >
                        <ExternalLink className="w-4 h-4" />
                        YouTube
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    )}
                    {vtc.twitch_url && (
                      <a
                        href={vtc.twitch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground p-2 rounded-lg hover:bg-background-tertiary"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Twitch
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-foreground-muted py-8">
          Powered by{' '}
          <Link href="/" className="text-ets2 hover:underline">
            VTC Job Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
