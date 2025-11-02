import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const coshhGenerateSchema = z.object({
  chemicalName: z.string().min(1, 'Chemical name is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  usage: z.string().min(1, 'Usage is required'),
  location: z.string().min(1, 'Location is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'occasionally']),
  quantity: z.string().min(1, 'Quantity is required'),
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
      .select('id, company_id')
      .eq('id', authUser.id)
      .single();

    if (userError || !user || !user.company_id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = coshhGenerateSchema.parse(body);

    // Get hired agent
    const { data: hiredAgent, error: hiredAgentError } = await supabase
      .from('hired_agents')
      .select('id')
      .eq('company_id', user.company_id)
      .eq('agent_id', 'coshh-generator')
      .eq('status', 'active')
      .single();

    if (hiredAgentError || !hiredAgent) {
      return NextResponse.json(
        { error: 'COSHH Generator agent not hired' },
        { status: 403 }
      );
    }

    // TODO: Call AI service to generate COSHH assessment
    // For now, we'll create a mock assessment
    const mockAssessment = {
      chemicalName: validatedData.chemicalName,
      supplier: validatedData.supplier,
      usage: validatedData.usage,
      location: validatedData.location,
      frequency: validatedData.frequency,
      quantity: validatedData.quantity,
      hazards: [
        {
          type: 'Corrosive',
          severity: 'High',
          description: 'May cause severe skin burns and eye damage',
        },
        {
          type: 'Respiratory',
          severity: 'Medium',
          description: 'May cause respiratory irritation',
        },
      ],
      controlMeasures: [
        'Use appropriate PPE including gloves, goggles, and lab coat',
        'Work in well-ventilated area or fume hood',
        'Store in designated chemical storage area',
        'Keep away from incompatible materials',
        'Ensure emergency eyewash and shower are accessible',
      ],
      emergencyProcedures: {
        skinContact: 'Immediately flush with plenty of water for at least 15 minutes. Remove contaminated clothing. Seek medical attention.',
        eyeContact: 'Rinse cautiously with water for several minutes. Remove contact lenses if present. Seek immediate medical attention.',
        inhalation: 'Move to fresh air. If breathing is difficult, give oxygen. Seek medical attention.',
        ingestion: 'Rinse mouth. Do NOT induce vomiting. Seek immediate medical attention.',
      },
      ppe: {
        eyes: 'Safety goggles or face shield',
        hands: 'Chemical resistant gloves (nitrile or neoprene)',
        body: 'Lab coat or chemical resistant apron',
        respiratory: 'Use in well-ventilated area or wear appropriate respirator',
      },
      disposal: 'Dispose of in accordance with local regulations. Contact waste disposal contractor.',
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    };

    // Save the assessment
    const { data: output, error: outputError } = await supabase
      .from('agent_outputs')
      .insert({
        hired_agent_id: hiredAgent.id,
        company_id: user.company_id,
        created_by: user.id,
        title: `COSHH Assessment: ${validatedData.chemicalName}`,
        output_data: mockAssessment,
      })
      .select()
      .single();

    if (outputError) {
      console.error('[coshh-generate] Error:', outputError);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessment: output }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[coshh-generate] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
