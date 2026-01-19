'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Mail, Lock, User, ExternalLink, Key, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth/hooks';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  truckersMpId: z.string().optional(),
  steamId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite');
  const { register: registerUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Validate invite code on mount
  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteCode) {
        setInviteValid(false);
        return;
      }

      try {
        const data = await api.invites.validate(inviteCode);

        if (!data) {
          setInviteValid(false);
          return;
        }

        // Check if expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setInviteValid(false);
          return;
        }

        // Check if max uses reached
        if (data.max_uses && data.use_count >= data.max_uses) {
          setInviteValid(false);
          return;
        }

        setInviteValid(true);
      } catch (e) {
        console.error(e);
        setInviteValid(false);
      }
    };

    validateInvite();
  }, [inviteCode]);

  const onSubmit = async (data: RegisterForm) => {
    if (!inviteValid || !inviteCode) return;

    setIsLoading(true);
    setError(null);

    try {
      // Sign up the user (this updates auth store)
      await registerUser(data.email, data.password, {
          display_name: data.displayName,
          truckers_mp_id: data.truckersMpId || null,
          steam_id: data.steamId || null,
      });

      // We need the user ID. registerUser returns void but updates store.
      // However, the api.auth.register called by hooks returns the user/session.
      // But useAuth().register wraps it.
      // We can also fetch current user from 'api.auth.me()' or assume success means we can proceed?
      // Wait, 'useAuth().register' might not handle the complex flow.
      // It calls 'api.auth.register'.
      // If we need the ID to claim invite, we need it.
      
      // Alternative: Use api.auth.register directly to get the user object, AND api.auth.me() to update store?
      // Or just api.auth.register.
      
      // Let's rely on api call here instead of hook for the complex flow, 
      // but then we need to manually update store or reload?
      // The hook 'register' calls 'api.auth.register' then 'set({ user })'.
      // If we use 'api.auth.register' directly, the store won't update immediately.
      // But we are redirecting to dashboard anyway.
      
      // BUT we need the user object to claim the invite.
      // The hook does NOT return the user object (it returns Promise<void>).
      // That's a limitation of the current hook implementation.
      // I'll call api.auth.register directly.
      
      const session = await api.auth.register(data.email, data.password, {
           display_name: data.displayName,
           truckers_mp_id: data.truckersMpId || null,
           steam_id: data.steamId || null,
      });
      
      if (!session?.user) throw new Error('Registration failed');

      // Update the invite usage
      await api.invites.claim(inviteCode, session.user.id);

      // Profile update is handled by metadata in register? 
      // 'api.auth.register' passes metadata. 
      // In real client, Supabase handles metadata -> profile trigger usually.
      // If manual profile update was needed (as in original code), we should do it.
      // Original code did manual update. I'll do it too to be safe.
      await api.profiles.update(session.user.id, {
          display_name: data.displayName,
          truckers_mp_id: data.truckersMpId || null,
          steam_id: data.steamId || null,
      });

      router.push('/dashboard');
      router.refresh();
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (inviteValid === null) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ets2 to-ats mb-4 animate-pulse">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <p className="text-foreground-muted">Validating invite code...</p>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-error/20 mb-4">
          <XCircle className="w-8 h-8 text-error" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Invalid Invite</h1>
          <p className="text-foreground-muted">
            {!inviteCode 
              ? 'A valid invite code is required to register.' 
              : 'This invite code is invalid, expired, or has reached its usage limit.'
            }
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-6">
            <Key className="w-8 h-8 text-foreground-muted mx-auto mb-3" />
            <p className="text-sm text-foreground-muted mb-4">
              Contact a VTC manager to receive an invite code.
            </p>
            <Link href="/login">
              <Button variant="ghost">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ets2 to-ats mb-4">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Join the VTC</h1>
        <p className="text-foreground-muted">Create your driver account</p>
      </div>

      {/* Invite Valid Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-success">
        <CheckCircle className="w-4 h-4" />
        Invite code valid
      </div>

      {/* Register Form */}
      <Card variant="glow-ets2">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
                {error}
              </div>
            )}

            {/* Display Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-foreground-dim" />
              <Input
                placeholder="Display Name"
                className="pl-10"
                {...register('displayName')}
                error={errors.displayName?.message}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-foreground-dim" />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-10"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground-dim" />
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                className="pl-10"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground-dim" />
              <Input
                type="password"
                placeholder="Confirm password"
                className="pl-10"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-background-secondary text-xs text-foreground-dim">Optional Links</span>
              </div>
            </div>

            {/* TruckersMP ID */}
            <div className="relative">
              <ExternalLink className="absolute left-3 top-3 w-5 h-5 text-foreground-dim" />
              <Input
                placeholder="TruckersMP ID (optional)"
                className="pl-10"
                {...register('truckersMpId')}
              />
            </div>

            {/* Steam ID */}
            <div className="relative">
              <ExternalLink className="absolute left-3 top-3 w-5 h-5 text-foreground-dim" />
              <Input
                placeholder="Steam ID (optional)"
                className="pl-10"
                {...register('steamId')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-foreground-muted">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-ets2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ets2 to-ats mb-4 animate-pulse">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <p className="text-foreground-muted">Loading...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
