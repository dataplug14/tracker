import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/telemetry/job
 * Submit a telemetry-verified job from the desktop app.
 * 
 * Headers:
 * - Authorization: Bearer <access_token>
 * 
 * Request body:
 * - game: 'ets2' | 'ats'
 * - cargo: string
 * - source_city: string
 * - destination_city: string
 * - distance_km: number
 * - revenue: number
 * - damage_percent: number
 * - truck_id?: string
 * - trailer_id?: string
 * - telemetry_data: object (raw telemetry snapshot)
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

    // Update last used timestamp
    await adminClient
      .from('device_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('access_token', accessToken);

    // Parse request body
    const body = await request.json();
    const {
      game,
      cargo,
      source_city,
      destination_city,
      distance_km,
      revenue,
      damage_percent = 0,
      truck_id,
      trailer_id,
      telemetry_data,
      server,
    } = body;

    // Validate required fields
    if (!game || !cargo || !source_city || !destination_city || !distance_km || revenue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['ets2', 'ats'].includes(game)) {
      return NextResponse.json(
        { error: 'Invalid game type' },
        { status: 400 }
      );
    }

    // Create the job with telemetry flag
    const { data: job, error: insertError } = await adminClient
      .from('jobs')
      .insert({
        user_id: deviceToken.user_id,
        game,
        server: server || null,
        cargo,
        source_city,
        destination_city,
        distance_km: Math.round(distance_km),
        revenue: parseFloat(revenue.toFixed(2)),
        damage_percent: parseFloat(damage_percent.toFixed(2)),
        truck_id: truck_id || null,
        trailer_id: trailer_id || null,
        completed_at: new Date().toISOString(),
        is_telemetry_job: true,
        telemetry_data: telemetry_data || null,
        status: 'approved', // Telemetry jobs auto-approved
        reviewed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create telemetry job:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit job' },
        { status: 500 }
      );
    }

    // Update truck stats if truck_id provided
    if (truck_id) {
      await adminClient.rpc('increment_truck_stats', {
        p_truck_id: truck_id,
        p_distance: Math.round(distance_km),
        p_revenue: parseFloat(revenue.toFixed(2)),
      });
    }

    return NextResponse.json({
      success: true,
      job_id: job.id,
      message: 'Job submitted successfully',
    });
  } catch (error) {
    console.error('Telemetry job submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
