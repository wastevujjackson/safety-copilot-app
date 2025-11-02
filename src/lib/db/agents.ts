import { createClient } from '@/lib/supabase/server';

export interface HiredAgent {
  id: string;
  agent_id: string;
  agent_name: string;
  hired_at: string;
  status: string;
}

export async function getHiredAgents(companyId: string): Promise<HiredAgent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hired_agents')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('hired_at', { ascending: false });

  if (error) {
    console.error('[getHiredAgents] Error:', error);
    return [];
  }

  return data || [];
}
