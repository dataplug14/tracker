-- VTC Job Tracker - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- User display info, avatar, bio, privacy settings
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  truckers_mp_id TEXT,
  steam_id TEXT,
  privacy_show_jobs BOOLEAN DEFAULT true,
  privacy_show_fleet BOOLEAN DEFAULT true,
  privacy_show_stats BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- USER ROLES TABLE
-- Secure role management (owner/manager/driver)
-- ============================================
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'driver');

CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role DEFAULT 'driver' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- VTC MEMBERSHIPS TABLE
-- TruckersMP ID, Steam ID linkage verification
-- ============================================
CREATE TABLE vtc_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  truckers_mp_verified BOOLEAN DEFAULT false,
  steam_verified BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INVITES TABLE
-- Invite codes with expiry
-- ============================================
CREATE TABLE invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  used_by UUID REFERENCES auth.users ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TRUCKS TABLE
-- Driver truck inventory with specs
-- ============================================
CREATE TYPE game_type AS ENUM ('ets2', 'ats');

CREATE TABLE trucks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  game game_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  custom_name TEXT,
  chassis TEXT,
  engine TEXT,
  transmission TEXT,
  purchase_price DECIMAL(12, 2),
  current_mileage INTEGER DEFAULT 0,
  paint_job TEXT,
  has_custom_lights BOOLEAN DEFAULT false,
  accessories TEXT,
  interior TEXT,
  is_featured BOOLEAN DEFAULT false,
  total_jobs INTEGER DEFAULT 0,
  total_km INTEGER DEFAULT 0,
  total_revenue DECIMAL(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TRAILERS TABLE
-- Driver trailer inventory
-- ============================================
CREATE TABLE trailers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  game game_type NOT NULL,
  trailer_type TEXT NOT NULL,
  brand TEXT,
  capacity TEXT,
  custom_name TEXT,
  is_owned BOOLEAN DEFAULT true,
  is_company_trailer BOOLEAN DEFAULT false,
  total_jobs INTEGER DEFAULT 0,
  total_km INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- VEHICLE PHOTOS TABLE
-- Gallery images for vehicles
-- ============================================
CREATE TABLE vehicle_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  truck_id UUID REFERENCES trucks ON DELETE CASCADE,
  trailer_id UUID REFERENCES trailers ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT vehicle_photo_target CHECK (
    (truck_id IS NOT NULL AND trailer_id IS NULL) OR
    (truck_id IS NULL AND trailer_id IS NOT NULL)
  )
);

-- ============================================
-- JOBS TABLE
-- Job records with approval workflow
-- ============================================
CREATE TYPE job_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  game game_type NOT NULL,
  server TEXT,
  cargo TEXT NOT NULL,
  source_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL,
  damage_percent DECIMAL(5, 2) DEFAULT 0,
  truck_id UUID REFERENCES trucks ON DELETE SET NULL,
  trailer_id UUID REFERENCES trailers ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL,
  screenshot_url TEXT,
  status job_status DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES auth.users ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  is_telemetry_job BOOLEAN DEFAULT false,
  telemetry_data JSONB,
  convoy_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- JOB EXPENSES TABLE
-- Fuel and expense tracking per job
-- ============================================
CREATE TYPE expense_type AS ENUM ('fuel', 'repair', 'toll', 'fine', 'ferry', 'other');

CREATE TABLE job_expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs ON DELETE CASCADE NOT NULL,
  expense_type expense_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- Badge definitions and unlock criteria
-- ============================================
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE achievement_category AS ENUM ('distance', 'jobs', 'perfect', 'streak', 'fleet', 'loyalty', 'special');

CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category achievement_category NOT NULL,
  rarity achievement_rarity NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- DRIVER ACHIEVEMENTS TABLE
-- Unlocked badges per driver
-- ============================================
CREATE TABLE driver_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- CONVOYS TABLE
-- Scheduled group events
-- ============================================
CREATE TYPE convoy_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

CREATE TABLE convoys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game game_type NOT NULL,
  server TEXT NOT NULL,
  departure_city TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  route_description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  estimated_duration_minutes INTEGER,
  max_participants INTEGER,
  organizer_id UUID REFERENCES auth.users ON DELETE SET NULL NOT NULL,
  status convoy_status DEFAULT 'scheduled' NOT NULL,
  banner_url TEXT,
  discord_event_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CONVOY SIGNUPS TABLE
-- Driver participation tracking
-- ============================================
CREATE TABLE convoy_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  convoy_id UUID REFERENCES convoys ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  truck_id UUID REFERENCES trucks ON DELETE SET NULL,
  trailer_id UUID REFERENCES trailers ON DELETE SET NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  attended BOOLEAN,
  UNIQUE(convoy_id, user_id)
);

-- Foreign key for jobs.convoy_id
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_convoy FOREIGN KEY (convoy_id) REFERENCES convoys(id) ON DELETE SET NULL;

-- ============================================
-- VTC SETTINGS TABLE
-- Company info for public page
-- ============================================
CREATE TABLE vtc_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  short_description TEXT,
  founded_at DATE,
  primary_game game_type DEFAULT 'ets2',
  website_url TEXT,
  discord_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  twitch_url TEXT,
  join_info TEXT,
  is_recruiting BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#f59e0b',
  secondary_color TEXT DEFAULT '#3b82f6',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- DISCORD CONFIG TABLE
-- Webhook settings
-- ============================================
CREATE TABLE discord_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_url TEXT,
  notify_job_approved BOOLEAN DEFAULT true,
  notify_job_rejected BOOLEAN DEFAULT false,
  notify_new_convoy BOOLEAN DEFAULT true,
  notify_achievement_unlock BOOLEAN DEFAULT true,
  notify_new_vehicle BOOLEAN DEFAULT false,
  notify_weekly_leaderboard BOOLEAN DEFAULT true,
  embed_color TEXT DEFAULT '#f59e0b',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- AUDIT LOGS TABLE
-- Admin action history
-- ============================================
CREATE TYPE audit_action AS ENUM (
  'job_approved', 'job_rejected', 
  'driver_activated', 'driver_deactivated', 'driver_role_changed',
  'convoy_created', 'convoy_updated', 'convoy_cancelled',
  'invite_created', 'invite_revoked',
  'settings_updated', 'discord_config_updated'
);

CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users ON DELETE SET NULL NOT NULL,
  action audit_action NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- VTC CHALLENGES TABLE
-- VTC-wide challenge definitions
-- ============================================
CREATE TYPE challenge_status AS ENUM ('upcoming', 'active', 'completed');

CREATE TABLE vtc_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  reward_description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status challenge_status DEFAULT 'upcoming' NOT NULL,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CHALLENGE PARTICIPANTS TABLE
-- Driver participation in challenges
-- ============================================
CREATE TABLE challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES vtc_challenges ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_completed_at ON jobs(completed_at);
CREATE INDEX idx_jobs_game ON jobs(game);
CREATE INDEX idx_trucks_user_id ON trucks(user_id);
CREATE INDEX idx_trailers_user_id ON trailers(user_id);
CREATE INDEX idx_driver_achievements_user_id ON driver_achievements(user_id);
CREATE INDEX idx_convoy_signups_convoy_id ON convoy_signups(convoy_id);
CREATE INDEX idx_convoy_signups_user_id ON convoy_signups(user_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vtc_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE convoys ENABLE ROW LEVEL SECURITY;
ALTER TABLE convoy_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vtc_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vtc_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- USER ROLES POLICIES
-- ============================================
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

CREATE POLICY "Owners can update roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true
    )
  );

-- ============================================
-- TRUCKS POLICIES
-- ============================================
CREATE POLICY "Users can view own trucks" ON trucks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others trucks if public" ON trucks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = trucks.user_id 
      AND profiles.privacy_show_fleet = true
    )
  );

CREATE POLICY "Users can insert own trucks" ON trucks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trucks" ON trucks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trucks" ON trucks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRAILERS POLICIES
-- ============================================
CREATE POLICY "Users can view own trailers" ON trailers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others trailers if public" ON trailers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = trailers.user_id 
      AND profiles.privacy_show_fleet = true
    )
  );

CREATE POLICY "Users can insert own trailers" ON trailers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trailers" ON trailers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trailers" ON trailers
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- JOBS POLICIES
-- ============================================
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved jobs of others if public" ON jobs
  FOR SELECT USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = jobs.user_id 
      AND profiles.privacy_show_jobs = true
    )
  );

CREATE POLICY "Managers can view all jobs" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can update jobs" ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

-- ============================================
-- ACHIEVEMENTS POLICIES
-- ============================================
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- ============================================
-- DRIVER ACHIEVEMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view own achievements" ON driver_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others achievements" ON driver_achievements
  FOR SELECT USING (true);

-- ============================================
-- CONVOYS POLICIES
-- ============================================
CREATE POLICY "Anyone can view scheduled convoys" ON convoys
  FOR SELECT USING (true);

CREATE POLICY "Managers can insert convoys" ON convoys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

CREATE POLICY "Managers can update convoys" ON convoys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

-- ============================================
-- CONVOY SIGNUPS POLICIES
-- ============================================
CREATE POLICY "Anyone can view signups" ON convoy_signups
  FOR SELECT USING (true);

CREATE POLICY "Users can signup for convoys" ON convoy_signups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signup" ON convoy_signups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own signup" ON convoy_signups
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- VTC SETTINGS POLICIES
-- ============================================
CREATE POLICY "Anyone can view vtc settings" ON vtc_settings
  FOR SELECT USING (true);

CREATE POLICY "Owners can update vtc settings" ON vtc_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true
    )
  );

-- ============================================
-- DISCORD CONFIG POLICIES
-- ============================================
CREATE POLICY "Owners can view discord config" ON discord_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true
    )
  );

CREATE POLICY "Owners can update discord config" ON discord_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true
    )
  );

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================
CREATE POLICY "Managers can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

CREATE POLICY "Managers can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

-- ============================================
-- INVITES POLICIES
-- ============================================
CREATE POLICY "Anyone can validate invites" ON invites
  FOR SELECT USING (true);

CREATE POLICY "Managers can insert invites" ON invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

CREATE POLICY "Managers can update invites" ON invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

-- ============================================
-- CHALLENGES POLICIES
-- ============================================
CREATE POLICY "Anyone can view challenges" ON vtc_challenges
  FOR SELECT USING (true);

CREATE POLICY "Managers can manage challenges" ON vtc_challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
      AND is_active = true
    )
  );

CREATE POLICY "Users can view own challenge participation" ON challenge_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user role (security definer)
CREATE OR REPLACE FUNCTION get_user_role(target_user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result user_role;
BEGIN
  SELECT role INTO result
  FROM user_roles
  WHERE user_id = target_user_id AND is_active = true;
  
  RETURN COALESCE(result, 'driver');
END;
$$;

-- Function to check if user is manager or owner
CREATE OR REPLACE FUNCTION is_manager_or_owner(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = target_user_id
    AND role IN ('owner', 'manager')
    AND is_active = true
  );
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New Driver')
  );
  
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'driver');
  
  INSERT INTO vtc_memberships (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trailers_updated_at
  BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_convoys_updated_at
  BEFORE UPDATE ON convoys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vtc_settings_updated_at
  BEFORE UPDATE ON vtc_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: Default Achievements
-- ============================================
INSERT INTO achievements (name, description, icon, category, rarity, requirement_type, requirement_value, points) VALUES
-- Distance achievements
('Road Warrior', 'Drive your first 1,000 km', 'trophy', 'distance', 'common', 'total_distance', 1000, 10),
('Long Hauler', 'Drive 5,000 km total', 'truck', 'distance', 'common', 'total_distance', 5000, 25),
('Highway Legend', 'Drive 10,000 km total', 'road', 'distance', 'rare', 'total_distance', 10000, 50),
('Continental Driver', 'Drive 25,000 km total', 'map', 'distance', 'rare', 'total_distance', 25000, 100),
('Trans-Continental', 'Drive 50,000 km total', 'globe', 'distance', 'epic', 'total_distance', 50000, 200),
('Million Miler', 'Drive 100,000 km total', 'star', 'distance', 'legendary', 'total_distance', 100000, 500),

-- Jobs achievements
('First Delivery', 'Complete your first job', 'package', 'jobs', 'common', 'total_jobs', 1, 10),
('Regular Driver', 'Complete 10 jobs', 'clipboard', 'jobs', 'common', 'total_jobs', 10, 25),
('Reliable Trucker', 'Complete 50 jobs', 'check-circle', 'jobs', 'common', 'total_jobs', 50, 50),
('Century Driver', 'Complete 100 jobs', 'award', 'jobs', 'rare', 'total_jobs', 100, 100),
('Master Hauler', 'Complete 250 jobs', 'medal', 'jobs', 'rare', 'total_jobs', 250, 200),
('Trucking Legend', 'Complete 500 jobs', 'crown', 'jobs', 'epic', 'total_jobs', 500, 350),
('Grand Master', 'Complete 1,000 jobs', 'gem', 'jobs', 'legendary', 'total_jobs', 1000, 500),

-- Perfect delivery achievements
('Perfect Delivery', 'Complete a job with 0% damage', 'shield', 'perfect', 'common', 'zero_damage_jobs', 1, 20),
('Careful Driver', 'Complete 10 jobs with 0% damage', 'shield-check', 'perfect', 'rare', 'zero_damage_jobs', 10, 75),
('Precision Master', 'Complete 50 jobs with 0% damage', 'target', 'perfect', 'epic', 'zero_damage_jobs', 50, 200),

-- Fleet achievements
('First Truck', 'Own your first truck', 'truck', 'fleet', 'common', 'owned_trucks', 1, 15),
('Small Fleet', 'Own 5 vehicles', 'trucks', 'fleet', 'rare', 'total_vehicles', 5, 50),
('Fleet Owner', 'Own 10 vehicles', 'warehouse', 'fleet', 'epic', 'total_vehicles', 10, 100),
('Transport Tycoon', 'Own 25 vehicles', 'building', 'fleet', 'legendary', 'total_vehicles', 25, 250),

-- Special achievements
('Convoy Participant', 'Join your first convoy', 'users', 'special', 'common', 'convoy_attendance', 1, 30),
('Convoy Regular', 'Attend 10 convoys', 'users-round', 'special', 'rare', 'convoy_attendance', 10, 100),
('Heavy Hauler', 'Deliver heavy cargo 25 times', 'weight', 'special', 'rare', 'heavy_cargo_jobs', 25, 75);

-- ============================================
-- SEED DATA: Default VTC Settings
-- ============================================
INSERT INTO vtc_settings (name, slug, description, short_description)
VALUES (
  'VTC Job Tracker',
  'vtc-job-tracker',
  'A virtual trucking company dedicated to Euro Truck Simulator 2 and American Truck Simulator.',
  'Professional virtual trucking since 2024'
);

-- ============================================
-- SEED DATA: Default Discord Config
-- ============================================
INSERT INTO discord_config (webhook_url) VALUES (NULL);
