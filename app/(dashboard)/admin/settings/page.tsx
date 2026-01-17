import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { VTCSettingsForm } from './VTCSettingsForm';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get VTC settings
  const { data: vtcSettings } = await supabase
    .from('vtc_settings')
    .select('*')
    .single();

  // Get Discord config
  const { data: discordConfig } = await supabase
    .from('discord_config')
    .select('*')
    .single();

  return (
    <>
      <Header 
        title="VTC Settings" 
        subtitle="Configure your virtual trucking company"
      />
      <VTCSettingsForm 
        vtcSettings={vtcSettings} 
        discordConfig={discordConfig}
      />
    </>
  );
}
