import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const hireAgentSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  agentName: z.string().min(1, 'Agent name is required'),
});

export async function POST(request: NextRequest) {
  try {
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
      .select('id, company_id, role')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is super admin
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can hire agents' },
        { status: 403 }
      );
    }

    if (!user.company_id) {
      return NextResponse.json({ error: 'User has no company' }, { status: 400 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = hireAgentSchema.parse(body);

    // Check if agent is already hired
    const { data: existingAgent } = await supabase
      .from('hired_agents')
      .select('id, status')
      .eq('company_id', user.company_id)
      .eq('agent_id', validatedData.agentId)
      .single();

    if (existingAgent) {
      if (existingAgent.status === 'active') {
        return NextResponse.json(
          { error: 'Agent is already hired' },
          { status: 400 }
        );
      }

      // Reactivate cancelled agent
      const { data: reactivated, error: reactivateError } = await supabase
        .from('hired_agents')
        .update({ status: 'active', cancelled_at: null })
        .eq('id', existingAgent.id)
        .select()
        .single();

      if (reactivateError) {
        console.error('[hire-agent] Reactivate error:', reactivateError);
        return NextResponse.json(
          { error: 'Failed to reactivate agent' },
          { status: 500 }
        );
      }

      return NextResponse.json({ hiredAgent: reactivated }, { status: 200 });
    }

    // Hire new agent
    const { data: hiredAgent, error: hireError } = await supabase
      .from('hired_agents')
      .insert({
        company_id: user.company_id,
        agent_id: validatedData.agentId,
        agent_name: validatedData.agentName,
        hired_by: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (hireError) {
      console.error('[hire-agent] Hire error:', hireError);
      return NextResponse.json(
        { error: 'Failed to hire agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ hiredAgent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[hire-agent] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to hire agent' },
      { status: 500 }
    );
  }
}

// Get hired agents for current user's company
export async function GET() {
  try {
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

    // Get hired agents
    const { data: hiredAgents, error: agentsError } = await supabase
      .from('hired_agents')
      .select('*')
      .eq('company_id', user.company_id)
      .eq('status', 'active')
      .order('hired_at', { ascending: false });

    if (agentsError) {
      console.error('[get-hired-agents] Error:', agentsError);
      return NextResponse.json(
        { error: 'Failed to fetch hired agents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ hiredAgents: hiredAgents || [] });
  } catch (error) {
    console.error('[get-hired-agents] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hired agents' },
      { status: 500 }
    );
  }
}
