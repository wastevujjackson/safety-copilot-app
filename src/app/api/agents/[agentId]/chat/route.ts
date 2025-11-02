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

// Store workflow state in memory (in production, use Redis or database)
const workflowStates = new Map<string, WorkflowState>();

// Toggle for using dummy data (set to false when ready to use OpenAI)
const USE_DUMMY_DATA = true;

// Dummy SDS data for testing (matches SDSExtractionResult type)
const DUMMY_SDS_DATA: SDSExtractionResult = {
  chemicalName: 'Acetone',
  casNumber: '67-64-1',
  supplier: 'Test Chemical Supplies Ltd',
  productCode: 'AC-1000',
  hazards: [
    { type: 'flammable', hazardClass: 'Flam. Liq. 2', pictogram: 'GHS02', signalWord: 'Danger' },
    { type: 'health-hazard', hazardClass: 'Eye Irrit. 2', pictogram: 'GHS07', signalWord: 'Warning' },
    { type: 'health-hazard', hazardClass: 'STOT SE 3', pictogram: 'GHS07', signalWord: 'Warning' }
  ],
  physicalProperties: {
    appearance: 'Clear, colorless liquid',
    odour: 'Characteristic sweet odour',
    pH: 'Not applicable',
    flashPoint: '-20°C'
  },
  exposureLimits: [
    {
      substance: 'Acetone',
      welLongTerm: '500 ppm (1210 mg/m³)',
      welShortTerm: '1500 ppm (3620 mg/m³)',
      source: 'EH40/2005'
    }
  ],
  firstAid: 'Inhalation: Remove to fresh air. If breathing is difficult, give oxygen. Get medical attention.\n\nSkin Contact: Wash off immediately with plenty of water. Remove contaminated clothing. Get medical attention if irritation develops.\n\nEye Contact: Rinse immediately with plenty of water for at least 15 minutes. Get medical attention.\n\nIngestion: Do NOT induce vomiting. Never give anything by mouth to an unconscious person. Get medical attention immediately.',
  storageRequirements: 'Store in a cool, well-ventilated area away from incompatible substances and ignition sources. Keep container tightly closed. Store away from oxidizing agents. Keep away from heat, sparks, and flame.',
  disposalGuidance: 'Dispose of in accordance with local regulations. Do not pour into drains or waterways. Consult a licensed waste disposal company.'
};

// Dummy P-Phrases (Precautionary Statements)
const DUMMY_P_PHRASES = [
  { code: 'P210', description: 'Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking.', type: 'Prevention' },
  { code: 'P233', description: 'Keep container tightly closed.', type: 'Prevention' },
  { code: 'P280', description: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'Prevention' },
  { code: 'P305+P351+P338', description: 'IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses, if present and easy to do. Continue rinsing.', type: 'Response' },
  { code: 'P403+P235', description: 'Store in a well-ventilated place. Keep cool.', type: 'Storage' }
];

// Dummy firefighting measures
const DUMMY_FIREFIGHTING = {
  extinguishingMedia: 'Use water spray, alcohol-resistant foam, dry chemical or carbon dioxide. Do not use water jet.',
  specialHazards: 'Vapors may form explosive mixtures with air. Vapors may travel to source of ignition and flash back. Most vapors are heavier than air and will spread along ground and collect in low or confined areas.',
  firefightingEquipment: 'Wear self-contained breathing apparatus and protective clothing to prevent contact with skin and eyes.'
};

// Dummy H-Phrases (not part of SDSExtractionResult but used in preview)
const DUMMY_H_PHRASES = [
  { code: 'H225', description: 'Highly flammable liquid and vapour', riskLevel: 'High' as const },
  { code: 'H319', description: 'Causes serious eye irritation', riskLevel: 'Medium' as const },
  { code: 'H336', description: 'May cause drowsiness or dizziness', riskLevel: 'Medium' as const }
];

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
    if (file && state.currentStep === 'upload_sds') {
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

        state.sdsData = sdsData;
        state.completedSteps.push('upload_sds');
        state.currentStep = 'confirm_sds';

        workflowStates.set(stateKey, state);

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

Please confirm this information is correct, or let me know what needs to be corrected.`;

        return NextResponse.json({
          message: confirmationMessage,
          complete: false,
          step: state.currentStep,
          workflowData: {
            hazardousSubstances: [
              {
                name: sdsData.chemicalName,
                manufacturer: sdsData.supplier,
                hazards: sdsData.hazards.map(h => h.type),
                hazardPictograms: sdsData.hazards,
                hPhrases: DUMMY_H_PHRASES,
                pPhrases: DUMMY_P_PHRASES,
                workplaceExposureLimitLTEL: sdsData.exposureLimits?.[0]?.welLongTerm,
                workplaceExposureLimitSTEL: sdsData.exposureLimits?.[0]?.welShortTerm,
                firstAid: sdsData.firstAid,
                firefighting: DUMMY_FIREFIGHTING,
                storageRequirements: sdsData.storageRequirements,
              }
            ]
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
      // Detect if user wants to create a new assessment
      const wantsToCreate = message.toLowerCase().match(/create|new|start|begin/);
      if (state.currentStep === 'upload_sds' && wantsToCreate && !state.sdsData) {
        // Guide them to upload SDS
        const response = "Great! Let's create a new COSHH assessment. Please upload the Safety Data Sheet (SDS) for the chemical substance you're assessing. I'll extract the key information automatically.\n\nYou can upload a PDF or image file (JPG, PNG) using the 📎 button below.";

        return NextResponse.json({
          message: response,
          complete: false,
          step: state.currentStep,
        });
      }

      // Update state based on user response
      const msgLower = message.toLowerCase();
      if (state.currentStep === 'confirm_sds' && (msgLower.includes('confirm') || msgLower.includes('yes') || msgLower.includes('correct'))) {
        state.completedSteps.push('confirm_sds');
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

        if (!state.workerData.whoExposed || state.workerData.whoExposed.length === 0) {
          state.workerData.whoExposed = message.split(',').map(s => s.trim());
        } else if (!state.workerData.numberOfWorkers || state.workerData.numberOfWorkers === 0) {
          state.workerData.numberOfWorkers = parseInt(message) || 0;
        } else if (!state.workerData.trainingLevel) {
          state.workerData.trainingLevel = message;
        } else if (state.workerData.trainingProvided === undefined || state.workerData.trainingProvided === null) {
          state.workerData.trainingProvided = msgLower.includes('yes');
        } else if (!state.workerData.existingPPE || state.workerData.existingPPE.length === 0) {
          state.workerData.existingPPE = msgLower === 'none' ? [] : message.split(',').map(s => s.trim());
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
          } else if (state.workerData.healthSurveillance === undefined || state.workerData.healthSurveillance === null) {
            responseMessage = "**Is health surveillance currently in place for these workers?** (Yes/No)";
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
      const workflowData: any = {};

      if (state.sdsData) {
        workflowData.hazardousSubstances = [
          {
            name: state.sdsData.chemicalName,
            manufacturer: state.sdsData.supplier,
            hazards: state.sdsData.hazards?.map(h => h.type),
            hazardPictograms: state.sdsData.hazards,
            hPhrases: DUMMY_H_PHRASES,
            pPhrases: DUMMY_P_PHRASES,
            workplaceExposureLimitLTEL: state.sdsData.exposureLimits?.[0]?.welLongTerm,
            workplaceExposureLimitSTEL: state.sdsData.exposureLimits?.[0]?.welShortTerm,
            // Add usage data fields if available
            howUsed: state.usageData?.purpose,
            quantityUsed: state.usageData?.quantity,
            frequencyOfUse: state.usageData?.frequency,
            durationOfUse: state.usageData?.duration,
            activities: state.usageData?.activities,
            methodOfUse: state.usageData?.methodOfUse,
            exposureRoutes: state.usageData?.exposureRoutes,
            substanceForm: state.usageData?.substanceForm,
            location: state.environmentData?.location || state.usageData?.location,
            // Add environment data fields
            workingEnvironment: state.environmentData?.ventilation,
            workingEnvironmentDescription: state.environmentData?.workingEnvironmentDescription,
            temperature: state.environmentData?.temperature,
            confinedSpace: state.environmentData?.confinedSpace,
            // Add worker data fields
            whoExposed: state.workerData?.whoExposed,
            numberOfWorkers: state.workerData?.numberOfWorkers,
            trainingLevel: state.workerData?.trainingLevel,
            trainingProvided: state.workerData?.trainingProvided,
            existingPPE: state.workerData?.existingPPE,
            healthSurveillance: state.workerData?.healthSurveillance,
            // Add SDS safety information
            firstAid: state.sdsData.firstAid,
            firefighting: DUMMY_FIREFIGHTING,
            storageRequirements: state.sdsData.storageRequirements,
            // Add other fields
            controlMeasures: state.controlMeasures || [],
          }
        ];
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
