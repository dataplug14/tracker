import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/auth/device
 * Generate a device linking code for desktop app authentication.
 * 
 * Returns a 6-digit code that expires in 5 minutes.
 * User enters this code in the desktop app to authenticate.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate 6-digit code
    const code = generateSecureCode();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Use admin client to insert (bypasses RLS)
    const adminClient = createAdminClient();
    
    // Delete any existing unverified codes for this user
    await adminClient
      .from('device_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('is_verified', false);

    // Create new device token with code
    const { error: insertError } = await adminClient
      .from('device_tokens')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt.toISOString(),
        is_verified: false,
      });

    if (insertError) {
      console.error('Failed to create device token:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code,
      expires_at: expiresAt.toISOString(),
      expires_in_seconds: 300,
    });
  } catch (error) {
    console.error('Device code generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a cryptographically secure 6-digit code.
 */
function generateSecureCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 900000) + 100000; // 100000-999999
  return code.toString();
}
