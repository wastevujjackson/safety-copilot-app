import { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getHiredAgents } from '@/lib/db/agents';
import { createClient } from '@/lib/supabase/server';

interface DashboardLayoutServerProps {
  children: ReactNode;
}

export async function DashboardLayoutServer({ children }: DashboardLayoutServerProps) {
  let hiredAgents = [];

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: user } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', authUser.id)
        .single();

      if (user?.company_id) {
        hiredAgents = await getHiredAgents(user.company_id);
      }
    }
  } catch (error) {
    console.error('[DashboardLayoutServer] Error fetching hired agents:', error);
  }

  return <DashboardLayout hiredAgents={hiredAgents}>{children}</DashboardLayout>;
}
