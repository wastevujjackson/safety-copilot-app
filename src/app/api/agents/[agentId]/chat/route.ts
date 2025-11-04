import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  extractSDSData,
  generateChatResponse,
  ChatMessage,
  SDSExtractionResult,
} from '@/lib/ai/openai';
import {
  WorkflowState,
  initializeWorkflow,
  getNextStep,
  getSystemPromptForStep,
  isStepComplete,
} from '@/lib/agents/coshh-workflow';
import {
  getSubstancesRequiringSurveillance,
} from '@/lib/coshh/health-surveillance-requirements';
import {
  searchProcessHazards,
  getProcessHazardByName,
  suggestProcessHazardsForTask,
  formatProcessHazard,
} from '@/lib/db/process-hazards';

// Store workflow state in memory (in production, use Redis or database)
const workflowStates = new Map<string, WorkflowState>();

// Toggle for using dummy data (set to false when ready to use OpenAI)
const USE_DUMMY_DATA = true;

// Dummy SDS data for testing (matches SDSExtractionResult type)
// Using Toluene Diisocyanate (TDI) - requires mandatory health surveillance
const DUMMY_SDS_DATA: SDSExtractionResult = {
  chemicalName: 'Toluene Diisocyanate (TDI)',
  casNumber: '584-84-9',
  supplier: 'Advanced Chemical Solutions Ltd',
  productCode: 'TDI-2400',
  hazards: [
    { type: 'acute-toxicity', hazardClass: 'Acute Tox. 3', pictogram: 'GHS06', signalWord: 'Danger' },
    { type: 'corrosive', hazardClass: 'Skin Corr. 1B', pictogram: 'GHS05', signalWord: 'Danger' },
    { type: 'serious-health-hazard', hazardClass: 'Resp. Sens. 1', pictogram: 'GHS08', signalWord: 'Danger' },
    { type: 'serious-health-hazard', hazardClass: 'Skin Sens. 1', pictogram: 'GHS08', signalWord: 'Danger' },
    { type: 'serious-health-hazard', hazardClass: 'Carc. 2', pictogram: 'GHS08', signalWord: 'Warning' },
    { type: 'serious-health-hazard', hazardClass: 'STOT SE 3', pictogram: 'GHS08', signalWord: 'Warning' },
    { type: 'serious-health-hazard', hazardClass: 'STOT RE 2', pictogram: 'GHS08', signalWord: 'Warning' }
  ],
  physicalProperties: {
    appearance: 'Clear to pale yellow liquid',
    odour: 'Sharp, pungent odour',
    pH: 'Not applicable',
    flashPoint: '127°C (closed cup)'
  },
  exposureLimits: [
    {
      substance: 'Toluene diisocyanate (TDI)',
      welLongTerm: '0.02 mg/m³ (8-hr TWA)',
      welShortTerm: '0.07 mg/m³ (15-min STEL)',
      source: 'EH40/2005',
      notes: 'Sen - Respiratory sensitiser'
    }
  ],
  firstAid: 'Inhalation: Remove victim to fresh air immediately. If breathing is difficult or has stopped, give artificial respiration. Give oxygen if breathing is difficult. Seek immediate medical attention.\n\nSkin Contact: Remove contaminated clothing immediately. Wash skin thoroughly with soap and water for at least 15 minutes. Seek immediate medical attention.\n\nEye Contact: Rinse immediately with plenty of water for at least 15 minutes, lifting eyelids occasionally. Remove contact lenses if present and easy to do. Seek immediate medical attention.\n\nIngestion: Do NOT induce vomiting. Rinse mouth with water. Never give anything by mouth to an unconscious person. Seek immediate medical attention.',
  storageRequirements: 'Store in original container in a cool, dry, well-ventilated area away from incompatible materials. Keep container tightly closed when not in use. Store away from heat, ignition sources, and direct sunlight. Store away from water and moisture. Keep away from food, drink and animal feedingstuffs.',
  disposalGuidance: 'Dispose of contents and container in accordance with local, regional, national and international regulations. Do not allow into drains or watercourses. Contact licensed waste disposal company.'
};

// Dummy P-Phrases (Precautionary Statements)
const DUMMY_P_PHRASES = [
  { code: 'P201', description: 'Obtain special instructions before use.', type: 'Prevention' },
  { code: 'P260', description: 'Do not breathe dust/fume/gas/mist/vapours/spray.', type: 'Prevention' },
  { code: 'P280', description: 'Wear protective gloves/protective clothing/eye protection/face protection/hearing protection.', type: 'Prevention' },
  { code: 'P284', description: 'In case of inadequate ventilation wear respiratory protection.', type: 'Prevention' },
  { code: 'P301+P330+P331', description: 'IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.', type: 'Response' },
  { code: 'P303+P361+P353', description: 'IF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse skin with water.', type: 'Response' },
  { code: 'P304+P340', description: 'IF INHALED: Remove person to fresh air and keep comfortable for breathing.', type: 'Response' },
  { code: 'P342+P311', description: 'If experiencing respiratory symptoms: Call a POISON CENTER/doctor.', type: 'Response' },
  { code: 'P403+P233', description: 'Store in a well-ventilated place. Keep container tightly closed.', type: 'Storage' },
  { code: 'P405', description: 'Store locked up.', type: 'Storage' }
];

// Dummy firefighting measures
const DUMMY_FIREFIGHTING = {
  extinguishingMedia: 'Use water spray, alcohol-resistant foam, dry chemical or carbon dioxide. Do not use water jet.',
  specialHazards: 'Vapors may form explosive mixtures with air. Vapors may travel to source of ignition and flash back. Most vapors are heavier than air and will spread along ground and collect in low or confined areas.',
  firefightingEquipment: 'Wear self-contained breathing apparatus and protective clothing to prevent contact with skin and eyes.'
};

// Dummy H-Phrases (not part of SDSExtractionResult but used in preview)
const DUMMY_H_PHRASES = [
  { code: 'H301', description: 'Toxic if swallowed', riskLevel: 'High' as const },
  { code: 'H314', description: 'Causes severe skin burns and eye damage', riskLevel: 'High' as const },
  { code: 'H317', description: 'May cause an allergic skin reaction', riskLevel: 'High' as const },
  { code: 'H334', description: 'May cause allergy or asthma symptoms or breathing difficulties if inhaled', riskLevel: 'High' as const },
  { code: 'H335', description: 'May cause respiratory irritation', riskLevel: 'Medium' as const },
  { code: 'H351', description: 'Suspected of causing cancer', riskLevel: 'High' as const },
  { code: 'H373', description: 'May cause damage to respiratory system through prolonged or repeated exposure', riskLevel: 'High' as const }
];

// Dummy Control Measures (organized by category)
const DUMMY_CONTROL_MEASURES = {
  riskBeforeControls: {
    likelihood: 4,
    severity: 5,
    score: 20,
    rating: 'High Risk'
  },
  riskAfterControls: {
    likelihood: 1,
    severity: 5,
    score: 5,
    rating: 'Low Risk'
  },
  normalControls: [
    {
      code: 'P201',
      description: 'Obtain and read Safety Data Sheet before use. Ensure COSHH risk assessment is completed',
      hierarchy: 'administrative',
      icon: 'document'
    },
    {
      code: 'P260',
      description: 'Do not breathe vapours/spray. Use Local Exhaust Ventilation (LEV) system',
      hierarchy: 'engineering',
      icon: 'ventilation'
    },
    {
      code: 'P280',
      description: 'Wear nitrile gloves, chemical-resistant coveralls, safety goggles and face shield',
      hierarchy: 'ppe',
      icon: 'ppe'
    },
    {
      code: 'P284',
      description: 'Wear respiratory protection (half-mask with A1P2 filters). RPE must be face-fit tested',
      hierarchy: 'ppe',
      icon: 'respirator'
    },
    {
      code: 'LEV_TEST',
      description: 'Ensure LEV system is examined and tested every 14 months (COSHH Reg 9). Display TExT certificate',
      hierarchy: 'engineering',
      icon: 'certificate'
    },
    {
      code: 'SUPERVISION',
      description: 'Supervisor to conduct daily checks: monitor workers for symptoms, check control measures functioning, verify PPE use',
      hierarchy: 'administrative',
      icon: 'supervisor'
    },
    {
      code: 'TRAINING',
      description: 'Provide training on: hazards, control measures, PPE use, emergency procedures. Refresh annually',
      hierarchy: 'administrative',
      icon: 'training'
    }
  ],
  storageControls: [
    {
      code: 'P405',
      description: 'Store locked up in designated chemical storage area with restricted access',
      hierarchy: 'administrative',
      icon: 'lock'
    },
    {
      code: 'P403',
      description: 'Store in well-ventilated area. Keep container tightly closed when not in use',
      hierarchy: 'administrative',
      icon: 'storage'
    },
    {
      code: 'P410',
      description: 'Protect from sunlight. Store away from heat sources and ignition sources',
      hierarchy: 'administrative',
      icon: 'temperature'
    }
  ],
  handlingControls: [
    {
      code: 'P264',
      description: 'Wash hands and exposed skin thoroughly after handling. Use dedicated washing facilities',
      hierarchy: 'administrative',
      icon: 'wash-hands'
    },
    {
      code: 'P273',
      description: 'Avoid release to environment. Use bunded areas. Prevent entry to drains/watercourses',
      hierarchy: 'administrative',
      icon: 'environment'
    },
    {
      code: 'P271',
      description: 'Use only outdoors or in well-ventilated area. Do not use in confined spaces',
      hierarchy: 'administrative',
      icon: 'outdoor'
    }
  ],
  disposalControls: [
    {
      code: 'P501',
      description: 'Dispose of contents/container via licensed waste contractor. Keep waste transfer notes',
      hierarchy: 'administrative',
      icon: 'disposal'
    }
  ],
  firstAidControls: [
    {
      code: 'P301+P330+P331',
      description: 'IF SWALLOWED: Rinse mouth. Do NOT induce vomiting. Call emergency services immediately',
      hierarchy: 'administrative',
      icon: 'first-aid',
      category: 'first-aid'
    },
    {
      code: 'P303+P361+P353',
      description: 'IF ON SKIN: Remove contaminated clothing immediately. Rinse with water for 15 minutes. Use emergency shower',
      hierarchy: 'administrative',
      icon: 'first-aid',
      category: 'first-aid'
    },
    {
      code: 'P304+P340',
      description: 'IF INHALED: Remove to fresh air. Keep at rest. If breathing difficult, give oxygen',
      hierarchy: 'administrative',
      icon: 'first-aid',
      category: 'first-aid'
    },
    {
      code: 'P305+P351+P338',
      description: 'IF IN EYES: Rinse cautiously with water for 15 minutes. Remove contact lenses if present. Use eye wash station',
      hierarchy: 'administrative',
      icon: 'first-aid',
      category: 'first-aid'
    },
    {
      code: 'P342+P311',
      description: 'If experiencing respiratory symptoms (wheeze, cough, breathlessness): Call emergency services/occupational health',
      hierarchy: 'administrative',
      icon: 'first-aid',
      category: 'first-aid'
    }
  ],
  spillControls: [
    {
      code: 'SPILL_RESPONSE',
      description: 'Evacuate area and establish exclusion zone. Eliminate ignition sources',
      hierarchy: 'administrative',
      icon: 'spill',
      category: 'spill'
    },
    {
      code: 'SPILL_PPE',
      description: 'Don full chemical-resistant PPE and respiratory protection before entering spill area',
      hierarchy: 'administrative',
      icon: 'spill',
      category: 'spill'
    },
    {
      code: 'SPILL_CONTAIN',
      description: 'Use spill kit to contain and absorb. Prevent entry to drains. Use inert absorbent material',
      hierarchy: 'administrative',
      icon: 'spill',
      category: 'spill'
    },
    {
      code: 'SPILL_DISPOSE',
      description: 'Place contaminated materials in sealed, labeled container. Dispose as hazardous waste',
      hierarchy: 'administrative',
      icon: 'spill',
      category: 'spill'
    }
  ]
};

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
      .select('id, company_id, full_name')
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

    // Parse form data
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const messagesJson = formData.get('messages') as string;
    const file = formData.get('file') as File | null;

    const previousMessages: ChatMessage[] = messagesJson
      ? JSON.parse(messagesJson)
      : [];

    // Get or initialize workflow state
    const stateKey = `${user.id}-${hiredAgent.id}`;
    let state = workflowStates.get(stateKey) || initializeWorkflow();

    // Handle file upload (SDS)
    if (file && (state.currentStep === 'upload_sds' || state.awaitingAdditionalSds)) {
      try {
        let sdsData;

        if (USE_DUMMY_DATA) {
          // Use dummy data for testing
          console.log('[chat] Using dummy SDS data for testing');
          sdsData = DUMMY_SDS_DATA;
        } else {
          // Convert file to base64
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = buffer.toString('base64');

          // Extract SDS data using GPT-4o vision
          sdsData = await extractSDSData(base64, file.type);
        }

        // Initialize or update SDS arrays
        if (!state.sdsData) {
          // First SDS upload
          state.sdsData = sdsData;
          state.allSdsData = [sdsData];
          state.completedSteps.push('upload_sds');
          state.awaitingAdditionalSds = true; // Now ask if there are more
          state.currentStep = 'confirm_hazard';
        } else {
          // Additional SDS upload
          state.allSdsData = state.allSdsData || [state.sdsData];
          state.allSdsData.push(sdsData);
          state.awaitingAdditionalSds = true; // Ask again if there are more
        }

        workflowStates.set(stateKey, state);

        // Build list of all substances for preview
        const allSubstances = (state.allSdsData || [state.sdsData]).filter(Boolean).map(sds => ({
          name: sds.chemicalName,
          manufacturer: sds.supplier,
          hazards: sds.hazards.map(h => h.type),
          hazardPictograms: sds.hazards,
          hPhrases: DUMMY_H_PHRASES,
          pPhrases: DUMMY_P_PHRASES,
          workplaceExposureLimitLTEL: sds.exposureLimits?.[0]?.welLongTerm,
          workplaceExposureLimitSTEL: sds.exposureLimits?.[0]?.welShortTerm,
          firstAid: sds.firstAid,
          firefighting: DUMMY_FIREFIGHTING,
          storageRequirements: sds.storageRequirements,
        }));

        // Generate confirmation message
        const confirmationMessage = `Great! I've extracted the following information from the SDS:

**Chemical Name:** ${sdsData.chemicalName}
${sdsData.casNumber ? `**CAS Number:** ${sdsData.casNumber}` : ''}
${sdsData.supplier ? `**Supplier:** ${sdsData.supplier}` : ''}

**Identified Hazards:**
${sdsData.hazards.map((h) => `• ${h.type} - ${h.hazardClass}`).join('\n')}

${
  sdsData.exposureLimits && sdsData.exposureLimits.length > 0
    ? `**Workplace Exposure Limits:**
${sdsData.exposureLimits
  .map((el) => `• ${el.substance}: ${el.welLongTerm || 'N/A'} (8hr TWA)`)
  .join('\n')}`
    : ''
}

${allSubstances.length > 1 ? `\n**Total substances uploaded:** ${allSubstances.length}\n` : ''}

**Are there any other substances used simultaneously with ${sdsData.chemicalName}?** (Yes/No)

If yes, please upload the additional SDS. If no, I'll proceed with the assessment.`;

        return NextResponse.json({
          message: confirmationMessage,
          complete: false,
          step: state.currentStep,
          workflowData: {
            hazardousSubstances: allSubstances
          }
        });
      } catch (error) {
        console.error('[chat] SDS extraction error:', error);
        return NextResponse.json({
          message:
            "I had trouble reading that SDS. Could you try uploading it again, or provide the information manually? I'll need the chemical name and main hazards at minimum.",
          complete: false,
          step: state.currentStep,
        });
      }
    }

    // Handle text messages
    if (message) {
      // Update state based on user response
      const msgLower = message.toLowerCase();

      // Detect if user wants to create a new assessment from initial menu
      const wantsToCreate = msgLower.match(/create|new|start|begin/);
      if (state.currentStep === 'select_hazard_source' && wantsToCreate && !state.sdsData && !state.processHazards) {
        // Show hazard type selection
        const response = `Great! Let's create a new COSHH assessment.

**What type of hazard are you assessing?**

1️⃣ **Chemical product with SDS** (e.g., solvents, cleaning products, paints)
2️⃣ **Process-generated hazard** (no SDS) - e.g., welding fumes, wood dust, silica dust
3️⃣ **Both** - SDS chemicals AND process hazards used together

Please select 1, 2, or 3.`;

        return NextResponse.json({
          message: response,
          complete: false,
          step: state.currentStep,
        });
      }

      // ===== HANDLE HAZARD SOURCE SELECTION =====
      if (state.currentStep === 'select_hazard_source') {
        if (msgLower.includes('1') || msgLower.includes('sds') || msgLower.includes('chemical product')) {
          state.hazardSource = 'sds';
          state.completedSteps.push('select_hazard_source');
          state.currentStep = 'upload_sds';
          workflowStates.set(stateKey, state);

          return NextResponse.json({
            message: "Great! Please upload the Safety Data Sheet (SDS) using the 📎 button below.",
            complete: false,
            step: state.currentStep,
          });
        } else if (msgLower.includes('2') || msgLower.includes('process')) {
          state.hazardSource = 'process';
          state.completedSteps.push('select_hazard_source');
          state.currentStep = 'select_process_hazard';
          workflowStates.set(stateKey, state);

          return NextResponse.json({
            message: "Let's identify the process-generated hazard.\n\n**Describe the work process:**\nFor example:\n- \"Welding stainless steel\"\n- \"Cutting hardwood\"\n- \"Grinding concrete\"\n- \"Operating diesel forklift indoors\"\n- \"Mixing flour\"\n\nWhat process generates the hazard you need to assess?",
            complete: false,
            step: state.currentStep,
          });
        } else if (msgLower.includes('3') || msgLower.includes('both')) {
          state.hazardSource = 'both';
          state.completedSteps.push('select_hazard_source');
          state.currentStep = 'upload_sds';
          workflowStates.set(stateKey, state);

          return NextResponse.json({
            message: "Great! Let's start with the SDS. Please upload it using the 📎 button below.\n\nAfterwards, I'll help you identify the process hazards.",
            complete: false,
            step: state.currentStep,
          });
        }
      }

      // ===== HANDLE PROCESS HAZARD SELECTION =====
      if (state.currentStep === 'select_process_hazard') {
        // Check if user is done adding process hazards
        if (state.awaitingAdditionalProcessHazard && msgLower.includes('no')) {
          state.awaitingAdditionalProcessHazard = false;
          state.completedSteps.push('select_process_hazard');
          state.currentStep = 'confirm_hazard';
          workflowStates.set(stateKey, state);

          const hazardCount = state.processHazards?.length || 0;
          const hazardNames = state.processHazards?.map(h => h.hazard_name).join(', ') || '';

          return NextResponse.json({
            message: `Perfect! This assessment will cover ${hazardCount} process hazard${hazardCount > 1 ? 's' : ''}: **${hazardNames}**.\n\nPlease confirm these are correct.`,
            complete: false,
            step: state.currentStep,
          });
        }

        // Check if user wants to add another hazard
        if (state.awaitingAdditionalProcessHazard && msgLower.includes('yes')) {
          return NextResponse.json({
            message: "Please describe the next process hazard.",
            complete: false,
            step: state.currentStep,
          });
        }

        // Check if user is selecting a numbered option
        if (/^\s*[1-5]\s*$/.test(message)) {
          // User selected a number - need to retrieve from temporary storage
          // For now, we'll handle this in the next section
          // In production, store suggested hazards in workflow state
        }

        // Search for process hazards based on user description
        const suggestedHazards = await suggestProcessHazardsForTask(message);

        if (suggestedHazards.length === 0) {
          return NextResponse.json({
            message: `I couldn't find a matching process hazard for "${message}".\n\nPlease try describing it differently. Common examples:\n- Welding\n- Wood cutting/sanding\n- Stone/concrete cutting\n- Diesel vehicles indoors\n- Flour mixing`,
            complete: false,
            step: state.currentStep,
          });
        }

        // If only one match, auto-select it
        if (suggestedHazards.length === 1) {
          const fullHazard = await getProcessHazardByName(suggestedHazards[0].hazard_name);

          if (fullHazard) {
            if (!state.processHazards) {
              state.processHazards = [];
            }
            state.processHazards.push(fullHazard);
            state.awaitingAdditionalProcessHazard = true;
            workflowStates.set(stateKey, state);

            const warnings = [];
            if (fullHazard.is_carcinogen) warnings.push('⚠️ Carcinogen');
            if (fullHazard.is_respiratory_sensitiser) warnings.push('⚠️ Respiratory Sensitiser');
            if (fullHazard.is_asthmagen) warnings.push('⚠️ Asthma Hazard');

            return NextResponse.json({
              message: `Added: **${fullHazard.hazard_name}**\n${warnings.length > 0 ? warnings.join(' ') + '\n' : ''}\nWEL: ${fullHazard.wel_8hr_twa_mgm3 ? fullHazard.wel_8hr_twa_mgm3 + ' mg/m³' : 'No WEL'}\n\n**Are there any other process hazards in this assessment?** (Yes/No)`,
              complete: false,
              step: state.currentStep,
            });
          }
        }

        // Multiple matches - present list to user
        const hazardList = suggestedHazards.slice(0, 5).map((h, idx) => {
          const warnings = [];
          if (h.is_carcinogen) warnings.push('⚠️ Carcinogen');
          if (h.is_respiratory_sensitiser) warnings.push('⚠️ Resp. Sens.');
          if (h.is_asthmagen) warnings.push('⚠️ Asthma');

          return `${idx + 1}. **${h.hazard_name}**\n   Category: ${h.hazard_category}\n   WEL: ${h.wel_8hr_twa_mgm3 ? h.wel_8hr_twa_mgm3 + ' mg/m³' : 'No WEL'}\n   ${warnings.length > 0 ? warnings.join(' ') : ''}`;
        }).join('\n\n');

        // Store suggested hazards temporarily
        state.completedSteps.push('awaiting_hazard_selection');
        (state as any).tempSuggestedHazards = suggestedHazards.slice(0, 5);
        workflowStates.set(stateKey, state);

        return NextResponse.json({
          message: `I found these matching hazards:\n\n${hazardList}\n\n**Which one best matches your process?** (Enter 1-${Math.min(5, suggestedHazards.length)})`,
          complete: false,
          step: state.currentStep,
        });
      }

      // Handle user selecting from numbered list
      if (state.currentStep === 'select_process_hazard' && /^\s*[1-5]\s*$/.test(message) && (state as any).tempSuggestedHazards) {
        const selectedIndex = parseInt(message.trim()) - 1;
        const tempHazards = (state as any).tempSuggestedHazards;

        if (tempHazards && tempHazards[selectedIndex]) {
          const selectedHazard = tempHazards[selectedIndex];
          const fullHazard = await getProcessHazardByName(selectedHazard.hazard_name);

          if (fullHazard) {
            if (!state.processHazards) {
              state.processHazards = [];
            }
            state.processHazards.push(fullHazard);
            state.awaitingAdditionalProcessHazard = true;
            delete (state as any).tempSuggestedHazards; // Clear temp storage
            workflowStates.set(stateKey, state);

            const warnings = [];
            if (fullHazard.is_carcinogen) warnings.push('⚠️ Carcinogen');
            if (fullHazard.is_respiratory_sensitiser) warnings.push('⚠️ Respiratory Sensitiser');
            if (fullHazard.is_asthmagen) warnings.push('⚠️ Asthma Hazard');

            return NextResponse.json({
              message: `Added: **${fullHazard.hazard_name}**\n${warnings.length > 0 ? warnings.join(' ') + '\n' : ''}\nWEL: ${fullHazard.wel_8hr_twa_mgm3 ? fullHazard.wel_8hr_twa_mgm3 + ' mg/m³' : 'No WEL'}\n\n**Are there any other process hazards in this assessment?** (Yes/No)`,
              complete: false,
              step: state.currentStep,
            });
          }
        }
      }

      // Handle response to "Are there more substances?" question
      if (state.awaitingAdditionalSds && state.currentStep === 'confirm_hazard') {
        if (msgLower.includes('yes')) {
          // User wants to upload another SDS
          state.multipleSubstances = true;
          workflowStates.set(stateKey, state);

          return NextResponse.json({
            message: "Please upload the SDS for the next substance using the 📎 button.",
            complete: false,
            step: state.currentStep,
          });
        } else if (msgLower.includes('no')) {
          // User is done uploading, proceed with workflow
          state.awaitingAdditionalSds = false;
          state.multipleSubstances = (state.allSdsData?.length || 0) > 1;

          const substanceCount = state.allSdsData?.length || 1;
          const substanceNames = state.allSdsData?.map(sds => sds.chemicalName).join(', ') || state.sdsData?.chemicalName || '';

          workflowStates.set(stateKey, state);

          return NextResponse.json({
            message: `Perfect! This assessment will cover ${substanceCount} substance${substanceCount > 1 ? 's' : ''}: **${substanceNames}**.\n\nPlease confirm the extracted information is correct, and we'll proceed with gathering usage details.`,
            complete: false,
            step: state.currentStep,
          });
        }
      }

      if (state.currentStep === 'confirm_hazard' && !state.awaitingAdditionalSds && !state.awaitingAdditionalProcessHazard && (msgLower.includes('confirm') || msgLower.includes('yes') || msgLower.includes('correct'))) {
        state.completedSteps.push('confirm_hazard');
        state.currentStep = 'usage_details';
      }

      // Capture user responses and populate state data
      if (state.currentStep === 'usage_details') {
        if (!state.usageData) {
          state.usageData = { purpose: '', quantity: '', frequency: '', duration: '', location: '' };

          // Auto-populate from SDS data
          if (state.sdsData?.physicalProperties?.appearance) {
            // Extract form from appearance (e.g., "Clear, colorless liquid" -> "Liquid")
            const appearance = state.sdsData.physicalProperties.appearance.toLowerCase();
            if (appearance.includes('liquid')) state.usageData.substanceForm = 'Liquid';
            else if (appearance.includes('gas')) state.usageData.substanceForm = 'Gas';
            else if (appearance.includes('solid') || appearance.includes('powder')) state.usageData.substanceForm = 'Solid/Powder';
            else state.usageData.substanceForm = 'Liquid'; // Default
          }

          // Auto-populate exposure routes from hazards and first aid
          if (state.sdsData?.hazards || state.sdsData?.firstAid) {
            const routes: string[] = [];
            const firstAid = state.sdsData.firstAid?.toLowerCase() || '';
            const hazards = state.sdsData.hazards?.map(h => h.type.toLowerCase()).join(' ') || '';

            if (firstAid.includes('inhalation') || hazards.includes('respiratory') || hazards.includes('inhalation')) {
              routes.push('Inhalation');
            }
            if (firstAid.includes('skin') || hazards.includes('skin') || hazards.includes('dermal')) {
              routes.push('Skin contact');
            }
            if (firstAid.includes('eye') || hazards.includes('eye')) {
              routes.push('Eye contact');
            }
            if (firstAid.includes('ingestion') || firstAid.includes('swallowed')) {
              routes.push('Ingestion');
            }

            if (routes.length > 0) {
              state.usageData.exposureRoutes = routes;
            }
          }
        }

        if (!state.usageData.purpose) {
          state.usageData.purpose = message;
        } else if (!state.usageData.activities || state.usageData.activities.length === 0) {
          state.usageData.activities = message.split(',').map(s => s.trim());
        } else if (!state.usageData.methodOfUse) {
          state.usageData.methodOfUse = message;
        } else if (!state.usageData.quantity) {
          state.usageData.quantity = message;
        } else if (!state.usageData.frequency) {
          state.usageData.frequency = message;
        } else if (!state.usageData.duration) {
          state.usageData.duration = message;
        } else if (!state.usageData.location) {
          state.usageData.location = message;
        }
      } else if (state.currentStep === 'environment_assessment') {
        if (!state.environmentData) {
          state.environmentData = {
            ventilation: '',
            temperature: '',
            confinedSpace: undefined as boolean | undefined,
            otherHazards: []
          };
        }

        const envData = state.environmentData;

        if (envData.confinedSpace === undefined) {
          // First question: confined space Yes/No - set to true only if they say yes, otherwise false
          envData.confinedSpace = msgLower.includes('yes') ? true : false;
        } else if (!envData.workingEnvironmentDescription) {
          // Second question: environment description
          envData.workingEnvironmentDescription = message;
          // Override confinedSpace if they mention "confined" in the description
          if (msgLower.includes('confined')) {
            envData.confinedSpace = true;
          }
        } else if (!envData.ventilation) {
          envData.ventilation = message;
        } else if (!envData.temperature) {
          // Check if temperature includes unit (C, F, °C, °F)
          const hasUnit = message.match(/[°]?[CFcf]/);
          if (hasUnit) {
            // Temperature has unit, store it and mark complete
            envData.temperature = message;
            envData.otherHazards = ['complete']; // Mark as complete
          } else {
            // Store temperature without unit temporarily, don't set otherHazards
            envData.temperature = message;
            // Keep otherHazards undefined so we know to ask for unit
          }
        } else if (envData.temperature && !envData.temperature.match(/[°]?[CFcf]/) && envData.otherHazards?.length === 0) {
          // Temperature was entered without unit, user just answered unit question
          const unit = msgLower.includes('f') || msgLower.includes('fahrenheit') ? '°F' : '°C';
          envData.temperature = `${envData.temperature}${unit}`;
          envData.otherHazards = ['complete']; // Mark as complete
        }
      } else if (state.currentStep === 'worker_exposure') {
        if (!state.workerData) {
          state.workerData = { numberOfWorkers: 0, trainingLevel: '', existingPPE: [], healthSurveillance: false };
        }

        // Check if we're waiting for temperature unit from previous step
        const envData = state.environmentData;
        if (envData?.temperature && !envData.temperature.match(/[°]?[CFcf]/)) {
          // User is answering the C/F question from environment step
          const unit = msgLower.includes('f') || msgLower.includes('fahrenheit') ? '°F' : '°C';
          envData.temperature = `${envData.temperature}${unit}`;
          // Don't process as worker data, return to ask first worker question
          state.workerData.whoExposed = []; // Will trigger the first question below
        } else if (!state.workerData.whoExposed || state.workerData.whoExposed.length === 0) {
          state.workerData.whoExposed = message.split(',').map(s => s.trim());
        } else if (!state.workerData.numberOfWorkers || state.workerData.numberOfWorkers === 0) {
          state.workerData.numberOfWorkers = parseInt(message) || 0;
        } else if (!state.workerData.trainingLevel) {
          state.workerData.trainingLevel = message;
        } else if (state.workerData.trainingProvided === undefined || state.workerData.trainingProvided === null) {
          state.workerData.trainingProvided = msgLower.includes('yes');
        } else if (!state.workerData.existingPPE || state.workerData.existingPPE.length === 0) {
          state.workerData.existingPPE = msgLower === 'none' ? [] : message.split(',').map(s => s.trim());
        } else if ((state.workerData as any).healthScreening === undefined || (state.workerData as any).healthScreening === null) {
          (state.workerData as any).healthScreening = msgLower.includes('yes');
        } else if (state.workerData.healthSurveillance === undefined || state.workerData.healthSurveillance === null) {
          state.workerData.healthSurveillance = msgLower.includes('yes');
        }
      }

      let responseMessage: string;

      if (USE_DUMMY_DATA) {
        // Generate dummy responses based on workflow step
        console.log('[chat] Using dummy response for step:', state.currentStep);

        if (state.currentStep === 'usage_details') {
          // Initialize usage data if not exists
          if (!state.usageData) {
            state.usageData = {
              purpose: '',
              quantity: '',
              frequency: '',
              duration: '',
              location: ''
            };
          }

          // Progressive question flow for usage details
          if (!state.usageData.purpose) {
            responseMessage = "Thank you for confirming the chemical information.\n\nI've identified from the SDS that this is a **liquid** substance with potential exposure routes: **" + (state.usageData.exposureRoutes?.join(', ') || 'Inhalation, Skin contact, Eye contact') + "**.\n\nLet's collect the usage details. **What is the primary purpose or task for using acetone?** (e.g., cleaning, degreasing, parts washing)";
          } else if (!state.usageData.activities || state.usageData.activities.length === 0) {
            responseMessage = "Got it. **What specific activities involve this chemical?** Please list the activities separated by commas (e.g., cleaning, surface preparation, degreasing).";
          } else if (!state.usageData.methodOfUse) {
            responseMessage = "Thanks. **How is the chemical used or applied?** Please list the methods separated by commas (e.g., Spray, Hand apply, Pour, Connecting/disconnecting hose, Generated from task, Cleaning up).";
          } else if (!state.usageData.quantity) {
            responseMessage = "Good. **Approximately how much is used per operation?** (e.g., 500ml, 1 litre, 2 litres)";
          } else if (!state.usageData.frequency) {
            responseMessage = "Good. **How frequently is this chemical used?** (e.g., Daily, Weekly, Monthly, Occasionally)";
          } else if (!state.usageData.duration) {
            responseMessage = "Almost done with usage details. **What is the typical duration of exposure per session?** (e.g., 15-30 minutes, 1-2 hours)";
          } else if (!state.usageData.location) {
            responseMessage = "Final question for usage. **Where is this work carried out?** (e.g., Workshop Area 3, Production Floor, Maintenance Bay)";
          } else {
            // All usage data collected, move to next step
            state.completedSteps.push('usage_details');
            state.currentStep = 'environment_assessment';
            responseMessage = "Perfect! I've collected all the usage information.\n\nNow let's assess the working environment. **What type of ventilation is available?** (e.g., Natural ventilation, Mechanical ventilation, Local Exhaust Ventilation (LEV))";
          }
        } else if (state.currentStep === 'environment_assessment') {
          // Initialize environment data if not exists
          if (!state.environmentData) {
            state.environmentData = {
              ventilation: '',
              temperature: '',
              confinedSpace: undefined as boolean | undefined,
              otherHazards: []
            };
          }

          const envData = state.environmentData;

          // Progressive question flow for environment
          if (envData.confinedSpace === undefined) {
            responseMessage = "Now let's assess the working environment. **Is this work carried out in a confined space?** (Yes/No)";
          } else if (!envData.workingEnvironmentDescription) {
            responseMessage = "Thanks. **Can you describe the working environment?** (Confined space, Inside, Outside)";
          } else if (!envData.ventilation) {
            responseMessage = "Good. **What type of ventilation/extraction is in place?** (e.g., Natural ventilation, Mechanical ventilation, Local Exhaust Ventilation (LEV), None)";
          } else if (!envData.temperature) {
            responseMessage = "**What is the typical temperature in this area?** (e.g., 20°C, 68°F, Ambient, Hot, Cold)";
          } else if (envData.temperature && !envData.temperature.match(/[°]?[CFcf]/) && envData.otherHazards.length === 0) {
            responseMessage = "Is that temperature in **Celsius or Fahrenheit**? (C/F)";
          } else {
            // All environment data collected, move to next step
            state.completedSteps.push('environment_assessment');
            state.currentStep = 'worker_exposure';
            responseMessage = "Perfect! I've completed the environment and usage section.\n\nNow let's review the personnel who could be exposed. **Who will be exposed to this chemical?** (e.g., Maintenance workers, Production staff)";
          }
        } else if (state.currentStep === 'worker_exposure') {
          // Initialize worker data if not exists
          if (!state.workerData) {
            state.workerData = {
              numberOfWorkers: 0,
              trainingLevel: '',
              existingPPE: [],
              healthSurveillance: false
            };
          }

          // Progressive question flow for worker exposure
          if (!state.workerData.whoExposed || state.workerData.whoExposed.length === 0) {
            responseMessage = "Now let's gather information about worker exposure. **Who will be exposed to this chemical?** (e.g., Maintenance workers, Production staff)";
          } else if (!state.workerData.numberOfWorkers || state.workerData.numberOfWorkers === 0) {
            responseMessage = "Got it. **How many workers will potentially be exposed?** (Please provide a number)";
          } else if (!state.workerData.trainingLevel) {
            responseMessage = "Thanks. **What is the training level of these workers?** (e.g., COSHH awareness trained, No formal training, Advanced chemical handling)";
          } else if (state.workerData.trainingProvided === undefined || state.workerData.trainingProvided === null) {
            responseMessage = "**Has specific training been provided for handling this chemical?** (Yes/No)";
          } else if (!state.workerData.existingPPE || state.workerData.existingPPE.length === 0) {
            responseMessage = "**What PPE is currently available or being used?** (e.g., Nitrile gloves, Safety glasses) - or type 'none' if no PPE currently used";
          } else if ((state.workerData as any).healthScreening === undefined || (state.workerData as any).healthScreening === null) {
            responseMessage = "**Have workers been screened for pre-existing health conditions that could be aggravated by exposure?** (e.g., respiratory conditions, skin sensitivities, allergies) (Yes/No)";
          } else if (state.workerData.healthSurveillance === undefined || state.workerData.healthSurveillance === null) {
            responseMessage = "**Is ongoing health surveillance currently in place for these workers?** (Yes/No)";
          } else {
            // All worker data collected, move to next step
            state.completedSteps.push('worker_exposure');
            state.currentStep = 'control_verification';
            responseMessage = "Perfect! I've collected all the worker exposure information.\n\nI now have enough information to build your COSHH assessment. Would you like me to proceed with generating the assessment?";
          }
        } else {
          responseMessage = "Thank you. I'm processing this information to build your COSHH assessment.";
        }
      } else {
        // Generate system prompt based on workflow state
        const systemPrompt = getSystemPromptForStep(state);

        // Build conversation history for AI
        const aiMessages: ChatMessage[] = [
          ...previousMessages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          {
            role: 'user',
            content: message,
          },
        ];

        // Generate response
        responseMessage = await generateChatResponse(aiMessages, systemPrompt);
      }

      // Check if step is complete and move to next
      const stepComplete = isStepComplete(state);
      if (stepComplete && state.currentStep !== 'complete') {
        const nextStep = getNextStep(state);
        state.currentStep = nextStep;
        state.completedSteps.push(state.currentStep);
      }

      // Check if workflow is complete
      const workflowComplete = state.currentStep === 'complete';

      // If complete, generate final assessment
      let assessmentId: string | undefined;
      if (workflowComplete && state.sdsData) {
        const { data: output } = await supabase
          .from('agent_outputs')
          .insert({
            hired_agent_id: hiredAgent.id,
            company_id: user.company_id,
            created_by: user.id,
            title: `COSHH Assessment: ${state.sdsData.chemicalName}`,
            output_data: {
              sdsData: state.sdsData,
              usageData: state.usageData,
              environmentData: state.environmentData,
              workerData: state.workerData,
              controlMeasures: state.controlMeasures,
              apfRequirements: state.apfRequirements,
            },
          })
          .select('id')
          .single();

        assessmentId = output?.id;

        // Clear workflow state
        workflowStates.delete(stateKey);
      } else {
        // Save updated state
        workflowStates.set(stateKey, state);
      }

      // Build workflow data for preview
      const workflowData: any = {
        assessorName: user.full_name,
      };

      if (state.sdsData) {
        // Get all SDS data (support for multiple substances)
        const allSds = state.allSdsData || [state.sdsData];

        workflowData.hazardousSubstances = allSds.map(sdsData => ({
          name: sdsData.chemicalName,
          manufacturer: sdsData.supplier,
          casNumber: sdsData.casNumber,
          hazards: sdsData.hazards?.map(h => h.type),
          hazardPictograms: sdsData.hazards,
          hPhrases: DUMMY_H_PHRASES,
          pPhrases: DUMMY_P_PHRASES,
          workplaceExposureLimitLTEL: sdsData.exposureLimits?.[0]?.welLongTerm,
          workplaceExposureLimitSTEL: sdsData.exposureLimits?.[0]?.welShortTerm,
          // Add usage data fields if available (same for all substances in this assessment)
          howUsed: state.usageData?.purpose,
          quantityUsed: state.usageData?.quantity,
          frequencyOfUse: state.usageData?.frequency,
          durationOfUse: state.usageData?.duration,
          activities: state.usageData?.activities,
          methodOfUse: state.usageData?.methodOfUse,
          exposureRoutes: state.usageData?.exposureRoutes,
          substanceForm: state.usageData?.substanceForm,
          location: state.environmentData?.location || state.usageData?.location,
          // Add environment data fields (same for all substances)
          workingEnvironment: state.environmentData?.ventilation,
          workingEnvironmentDescription: state.environmentData?.workingEnvironmentDescription,
          temperature: state.environmentData?.temperature,
          confinedSpace: state.environmentData?.confinedSpace,
          // Add worker data fields (same for all substances)
          whoExposed: state.workerData?.whoExposed,
          numberOfWorkers: state.workerData?.numberOfWorkers,
          trainingLevel: state.workerData?.trainingLevel,
          trainingProvided: state.workerData?.trainingProvided,
          existingPPE: state.workerData?.existingPPE,
          healthScreening: (state.workerData as any)?.healthScreening,
          healthSurveillance: state.workerData?.healthSurveillance,
          // Add SDS safety information (specific to each substance)
          firstAid: sdsData.firstAid,
          firefighting: DUMMY_FIREFIGHTING,
          storageRequirements: sdsData.storageRequirements,
          // Add other fields
          controlMeasures: state.controlMeasures || [],
        }));

        // Check for mandatory health surveillance requirements
        const substancesForSurveillance = allSds.map(sds => ({
          name: sds.chemicalName,
          casNumber: sds.casNumber,
        }));
        const surveillanceRequirements = getSubstancesRequiringSurveillance(substancesForSurveillance);

        if (surveillanceRequirements.length > 0) {
          workflowData.healthSurveillanceRequirements = surveillanceRequirements;
        }

        // Add control measures (dummy data for now)
        workflowData.controlMeasures = DUMMY_CONTROL_MEASURES;
      }

      return NextResponse.json({
        message: responseMessage,
        complete: workflowComplete,
        assessmentId,
        step: state.currentStep,
        workflowData: Object.keys(workflowData).length > 0 ? workflowData : undefined,
      });
    }

    return NextResponse.json(
      { error: 'No message or file provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[chat] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
