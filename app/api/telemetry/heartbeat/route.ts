import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/telemetry/heartbeat
 * Keep-alive signal from desktop app.
 * Updates user's online status and last seen timestamp.
 * 
 * Headers:
 * - Authorization: Bearer <access_token>
 * 
 * Request body (optional):
 * - game_running: boolean
 * - current_city: string
 * - current_job: object (active job info)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.slice(7);
    const adminClient = createAdminClient();

    // Validate access token
    const { data: deviceToken, error: tokenError } = await adminClient
      .from('device_tokens')
      .select('user_id, expires_at')
      .eq('access_token', accessToken)
      .eq('is_verified', true)
      .single();

    if (tokenError || !deviceToken) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(deviceToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Access token expired' },
        { status: 401 }
      );
    }

    // Parse optional body
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    // Update last used on device token
    await adminClient
      .from('device_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('access_token', accessToken);

    // Update profile online status
    await adminClient
      .from('profiles')
      .update({
        is_online: true,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', deviceToken.user_id);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      next_heartbeat_in: 30, // Seconds until next expected heartbeat
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/telemetry/heartbeat
 * Signal that desktop app is disconnecting.
 * Sets user offline.
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.slice(7);
    const adminClient = createAdminClient();

    // Validate access token
    const { data: deviceToken } = await adminClient
      .from('device_tokens')
      .select('user_id')
      .eq('access_token', accessToken)
      .eq('is_verified', true)
      .single();

    if (deviceToken) {
      // Set user offline
      await adminClient
        .from('profiles')
        .update({
          is_online: false,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', deviceToken.user_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
