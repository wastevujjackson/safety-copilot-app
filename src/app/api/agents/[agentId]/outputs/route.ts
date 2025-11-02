import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', authUser.id)
      .single();

    if (userError || !user || !user.company_id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get hired agent
    const { data: hiredAgent, error: hiredAgentError } = await supabase
      .from('hired_agents')
      .select('id')
      .eq('company_id', user.company_id)
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single();

    if (hiredAgentError || !hiredAgent) {
      return NextResponse.json(
        { error: 'Agent not hired or not found' },
        { status: 404 }
      );
    }

    // Get outputs for this agent
    const { data: outputs, error: outputsError } = await supabase
      .from('agent_outputs')
      .select('*')
      .eq('hired_agent_id', hiredAgent.id)
      .order('created_at', { ascending: false });

    if (outputsError) {
      console.error('[get-agent-outputs] Error:', outputsError);
      return NextResponse.json(
        { error: 'Failed to fetch outputs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ outputs: outputs || [] });
  } catch (error) {
    console.error('[get-agent-outputs] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outputs' },
      { status: 500 }
    );
  }
}
