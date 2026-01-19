import { z } from 'zod';

// Models
export type GameType = 'ets2' | 'ats';
export type UserRole = 'owner' | 'manager' | 'driver';
export type JobStatus = 'pending' | 'approved' | 'rejected';
export type ConvoyStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// Zod Schemas

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(2),
  avatar_url: z.string().nullable(),
  role: z.enum(['owner', 'manager', 'driver']),
  created_at: z.string(),
});

export const TruckSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  game: z.enum(['ets2', 'ats']),
  brand: z.string(),
  model: z.string(),
  custom_name: z.string().nullable(),
  plate: z.string().nullable().optional(),
  created_at: z.string(),
});

export const TrailerSchema = z.object({
  id: z.string().uuid(),
  trailer_type: z.string(),
  custom_name: z.string().nullable(),
});

export const JobSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  game: z.enum(['ets2', 'ats']),
  source_city: z.string(),
  destination_city: z.string(),
  cargo: z.string(),
  distance_km: z.number().positive(),
  revenue: z.number().nonnegative(),
  damage_percent: z.number().min(0).max(100),
  status: z.enum(['pending', 'approved', 'rejected']),
  truck_id: z.string().nullable(),
  trailer_id: z.string().nullable(),
  completed_at: z.string(),
  created_at: z.string(),
  
  // Joined fields (optional)
  truck: TruckSchema.partial().optional(),
  trailer: TrailerSchema.partial().optional(),
  profile: ProfileSchema.partial().optional(),
});

export const ConvoySignupSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  profile: ProfileSchema.pick({ id: true, display_name: true, avatar_url: true }).optional(),
  truck: TruckSchema.pick({ id: true, brand: true, model: true, custom_name: true }).optional(),
});

export const ConvoySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  game: z.enum(['ets2', 'ats']),
  server: z.string(),
  departure_city: z.string(),
  arrival_city: z.string(),
  scheduled_at: z.string(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  organizer: ProfileSchema.optional(),
  signups: z.array(ConvoySignupSchema).optional(),
});

export const InviteSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  created_by: z.string().nullable(),
  used_by: z.string().nullable(),
  max_uses: z.number(),
  use_count: z.number(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
  
  creator: ProfileSchema.pick({ display_name: true }).optional(),
  user: ProfileSchema.pick({ display_name: true }).optional(),
});

export const DriverStatsSchema = z.object({
  user_id: z.string(),
  display_name: z.string(),
  avatar_url: z.string().nullable(),
  total_km: z.number(),
  total_jobs: z.number(),
  total_revenue: z.number(),
});

// Auth Types
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  inviteCode: z.string(),
  truckersMpId: z.string().optional(),
  steamId: z.string().optional(),
});

// TypeScript Types inferred from Zod
export type Profile = z.infer<typeof ProfileSchema>;
export type Truck = z.infer<typeof TruckSchema>;
export type Trailer = z.infer<typeof TrailerSchema>;
export type Job = z.infer<typeof JobSchema>;
export type Convoy = z.infer<typeof ConvoySchema>;
export type ConvoySignup = z.infer<typeof ConvoySignupSchema>;
export type Invite = z.infer<typeof InviteSchema>;
export type DriverStats = z.infer<typeof DriverStatsSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegisterData = z.infer<typeof RegisterDataSchema>;
