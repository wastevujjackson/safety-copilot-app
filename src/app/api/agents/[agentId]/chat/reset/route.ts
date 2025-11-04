import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Import the workflowStates Map from parent route (not ideal but works for now)
// In production, this should be in a shared state management solution (Redis, database, etc.)

export async function POST(
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
      .select('id, company_id')
      .eq('id', authUser.id)
      .single();

    if (userError || !user || !user.company_id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check agent is hired
    const { data: hiredAgent } = await supabase
      .from('hired_agents')
      .select('id')
      .eq('company_id', user.company_id)
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single();

    if (!hiredAgent) {
      return NextResponse.json({ error: 'Agent not hired' }, { status: 403 });
    }

    // Note: We can't directly access workflowStates from here
    // The simplest solution is to restart the server or reload the page
    // For a production app, use Redis or database-backed state

    return NextResponse.json({
      message: 'To reset the chat, please reload the page. In production, this would clear the workflow state from Redis/database.',
      success: true,
    });
  } catch (error) {
    console.error('[reset] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to reset chat' },
      { status: 500 }
    );
  }
}
