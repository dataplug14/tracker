// Database types for VTC Job Tracker

export type GameType = 'ets2' | 'ats';
export type UserRole = 'owner' | 'manager' | 'driver';
export type JobStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseType = 'fuel' | 'repair' | 'toll' | 'fine' | 'ferry' | 'other';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'distance' | 'jobs' | 'perfect' | 'streak' | 'fleet' | 'loyalty' | 'special';
export type ConvoyStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  truckers_mp_id: string | null;
  steam_id: string | null;
  privacy_show_jobs: boolean;
  privacy_show_fleet: boolean;
  privacy_show_stats: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Truck {
  id: string;
  user_id: string;
  game: GameType;
  brand: string;
  model: string;
  custom_name: string | null;
  chassis: string | null;
  engine: string | null;
  transmission: string | null;
  purchase_price: number | null;
  current_mileage: number;
  paint_job: string | null;
  has_custom_lights: boolean;
  accessories: string | null;
  interior: string | null;
  is_featured: boolean;
  total_jobs: number;
  total_km: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Trailer {
  id: string;
  user_id: string;
  game: GameType;
  trailer_type: string;
  brand: string | null;
  capacity: string | null;
  custom_name: string | null;
  is_owned: boolean;
  is_company_trailer: boolean;
  total_jobs: number;
  total_km: number;
  created_at: string;
  updated_at: string;
}

export interface VehiclePhoto {
  id: string;
  truck_id: string | null;
  trailer_id: string | null;
  photo_url: string;
  is_primary: boolean;
  caption: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  game: GameType;
  server: string | null;
  cargo: string;
  source_city: string;
  destination_city: string;
  distance_km: number;
  revenue: number;
  damage_percent: number;
  truck_id: string | null;
  trailer_id: string | null;
  started_at: string | null;
  completed_at: string;
  screenshot_url: string | null;
  status: JobStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  is_telemetry_job: boolean;
  telemetry_data: Record<string, unknown> | null;
  convoy_id: string | null;
  created_at: string;
  // Joined data
  truck?: Truck;
  trailer?: Trailer;
  profile?: Profile;
}

export interface JobExpense {
  id: string;
  job_id: string;
  expense_type: ExpenseType;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirement_type: string;
  requirement_value: number;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface DriverAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  // Joined data
  achievement?: Achievement;
}

export interface Convoy {
  id: string;
  title: string;
  description: string | null;
  game: GameType;
  server: string;
  departure_city: string;
  arrival_city: string;
  route_description: string | null;
  scheduled_at: string;
  estimated_duration_minutes: number | null;
  max_participants: number | null;
  organizer_id: string;
  status: ConvoyStatus;
  banner_url: string | null;
  discord_event_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  organizer?: Profile;
  signups?: ConvoySignup[];
}

export interface ConvoySignup {
  id: string;
  convoy_id: string;
  user_id: string;
  truck_id: string | null;
  trailer_id: string | null;
  signed_up_at: string;
  attended: boolean | null;
  // Joined data
  profile?: Profile;
  truck?: Truck;
}

export interface VtcSettings {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  short_description: string | null;
  founded_at: string | null;
  primary_game: GameType;
  website_url: string | null;
  discord_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  twitch_url: string | null;
  join_info: string | null;
  is_recruiting: boolean;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export interface DiscordConfig {
  id: string;
  webhook_url: string | null;
  notify_job_approved: boolean;
  notify_job_rejected: boolean;
  notify_new_convoy: boolean;
  notify_achievement_unlock: boolean;
  notify_new_vehicle: boolean;
  notify_weekly_leaderboard: boolean;
  embed_color: string;
  updated_at: string;
}

export interface Invite {
  id: string;
  code: string;
  created_by: string | null;
  used_by: string | null;
  max_uses: number;
  use_count: number;
  expires_at: string | null;
  created_at: string;
}

export interface VtcChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_description: string | null;
  starts_at: string;
  ends_at: string;
  status: ChallengeStatus;
  created_by: string | null;
  banner_url: string | null;
  created_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  // Joined data
  actor?: Profile;
}

// Driver stats for dashboard and leaderboard
export interface DriverStats {
  user_id: string;
  total_km: number;
  total_jobs: number;
  total_revenue: number;
  avg_damage: number;
  perfect_deliveries: number;
  trucks_owned: number;
  trailers_owned: number;
  achievements_count: number;
  week_km: number;
  week_jobs: number;
  month_km: number;
  month_jobs: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  value: number;
  profile?: Profile;
}
