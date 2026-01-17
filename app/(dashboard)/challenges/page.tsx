import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ChallengesContent } from './ChallengesContent';

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get all challenges
  const { data: challenges } = await supabase
    .from('vtc_challenges')
    .select('*')
    .order('starts_at', { ascending: false });

  // Get user's participation data
  const { data: participation } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('user_id', user.id);

  // Get leaderboard for each active challenge
  const activeIds = challenges
    ?.filter(c => c.status === 'active')
    .map(c => c.id) || [];
  
  let leaderboardData: Record<string, { user_id: string; display_name: string; avatar_url: string | null; progress: number }[]> = {};
  
  if (activeIds.length > 0) {
    for (const challengeId of activeIds) {
      const { data: participants } = await supabase
        .from('challenge_participants')
        .select(`
          user_id,
          progress,
          profile:profiles(display_name, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .limit(10);

      leaderboardData[challengeId] = participants?.map((p: { user_id: string; progress: number; profile: { display_name: string; avatar_url: string | null } | { display_name: string; avatar_url: string | null }[] | null }) => ({
        user_id: p.user_id,
        display_name: Array.isArray(p.profile) ? p.profile[0]?.display_name || 'Unknown' : p.profile?.display_name || 'Unknown',
        avatar_url: Array.isArray(p.profile) ? p.profile[0]?.avatar_url || null : p.profile?.avatar_url || null,
        progress: p.progress,
      })) || [];
    }
  }

  return (
    <>
      <Header 
        title="Challenges" 
        subtitle="Compete with your fellow drivers"
      />
      <ChallengesContent 
        challenges={challenges || []}
        participation={participation || []}
        leaderboardData={leaderboardData}
        userId={user.id}
      />
    </>
  );
}
