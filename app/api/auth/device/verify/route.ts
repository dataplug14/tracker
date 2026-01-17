import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';

/**
 * POST /api/auth/device/verify
 * Verify device code and exchange for access token.
 * 
 * Request body:
 * - code: string (6-digit code from website)
 * - device_name: string (optional device identifier)
 * 
 * Returns access token for desktop app to use.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, device_name } = body;

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Find the device token by code
    const { data: deviceToken, error: findError } = await adminClient
      .from('device_tokens')
      .select('*')
      .eq('code', code)
      .eq('is_verified', false)
      .single();

    if (findError || !deviceToken) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(deviceToken.expires_at) < new Date()) {
      // Delete expired token
      await adminClient
        .from('device_tokens')
        .delete()
        .eq('id', deviceToken.id);

      return NextResponse.json(
        { error: 'Code has expired' },
        { status: 400 }
      );
    }

    // Generate access token
    const accessToken = `vtc_${randomUUID().replace(/-/g, '')}`;

    // Update token with access token and mark as verified
    const { error: updateError } = await adminClient
      .from('device_tokens')
      .update({
        access_token: accessToken,
        is_verified: true,
        device_name: device_name || 'VTC Desktop',
        last_used_at: new Date().toISOString(),
        // Extend expiration for verified tokens (30 days)
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', deviceToken.id);

    if (updateError) {
      console.error('Failed to verify device token:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify code' },
        { status: 500 }
      );
    }

    // Get user profile for the response
    const { data: profile } = await adminClient
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', deviceToken.user_id)
      .single();

    return NextResponse.json({
      access_token: accessToken,
      user_id: deviceToken.user_id,
      display_name: profile?.display_name || 'Driver',
      avatar_url: profile?.avatar_url,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Device verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
