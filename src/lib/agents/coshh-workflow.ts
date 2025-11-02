import { SDSExtractionResult } from '../ai/openai';

export type WorkflowStep =
  | 'upload_sds'
  | 'confirm_sds'
  | 'usage_details'
  | 'environment_assessment'
  | 'worker_exposure'
  | 'control_verification'
  | 'apf_calculation'
  | 'final_review'
  | 'complete';

export interface WorkflowState {
  currentStep: WorkflowStep;
  sdsData?: SDSExtractionResult;
  usageData?: {
    purpose: string;
    quantity: string;
    frequency: string;
    duration: string;
    location: string;
    activities?: string[];
    methodOfUse?: string;
    exposureRoutes?: string[];
    substanceForm?: string;
    whoExposed?: string[];
  };
  environmentData?: {
    ventilation: string;
    temperature: string;
    confinedSpace?: boolean;
    otherHazards: string[];
    location?: string;
    workingEnvironmentDescription?: string;
  };
  workerData?: {
    numberOfWorkers: number;
    trainingLevel: string;
    existingPPE: string[];
    healthSurveillance: boolean;
    whoExposed?: string[];
    trainingProvided?: boolean;
  };
  controlMeasures?: string[];
  apfRequirements?: {
    required: boolean;
    calculatedAPF?: number;
    recommendedRPE?: string;
    fitTestingRequired: boolean;
  };
  validated: boolean;
  completedSteps: WorkflowStep[];
}

export const WORKFLOW_PROMPTS: Record<
  WorkflowStep,
  { systemPrompt: string; userPrompt: string }
> = {
  upload_sds: {
    systemPrompt: `You are an expert Occupational Hygienist helping to create a COSHH assessment.
The user wants to create a new assessment. Ask them to upload the Safety Data Sheet (SDS). Guide them clearly and professionally.
If they mention "create" or "new assessment", guide them to upload the SDS.`,
    userPrompt:
      "Great! Let's create a new COSHH assessment. Please upload the Safety Data Sheet (SDS) for the chemical substance you're assessing. I'll extract the key information automatically.\n\nYou can upload a PDF or image file (JPG, PNG).",
  },

  confirm_sds: {
    systemPrompt: `You are validating extracted SDS data with the user.
Present the extracted information clearly and ask them to confirm or correct any details.
Be thorough - accuracy is critical for worker safety.`,
    userPrompt: 'Please review the extracted information and confirm it is correct.',
  },

  usage_details: {
    systemPrompt: `You are gathering information about how the chemical will be used.
Ask about: purpose, quantity used per occasion, frequency of use, duration of exposure, and location.
Ask questions one at a time for clarity. Be conversational but professional.`,
    userPrompt:
      "Let's understand how this chemical will be used. What is the primary purpose or task?",
  },

  environment_assessment: {
    systemPrompt: `You are assessing the working environment where the chemical will be used.
Ask about: ventilation (natural/mechanical/LEV), temperature conditions, confined spaces, and other hazards present.
This helps determine appropriate control measures.`,
    userPrompt:
      'Now I need to understand the working environment. What type of ventilation is available?',
  },

  worker_exposure: {
    systemPrompt: `You are gathering information about worker exposure.
Ask about: number of workers exposed, their training level, existing PPE available, and any current health surveillance.
This informs the risk assessment.`,
    userPrompt: 'How many workers will potentially be exposed to this substance?',
  },

  control_verification: {
    systemPrompt: `You are an expert in the control hierarchy (elimination → substitution → engineering → administrative → PPE).
Based on the hazards and usage scenario, suggest appropriate control measures.
Present them clearly and ask the user to confirm they are adequate and feasible.
Be cautious and thorough - worker safety depends on this.`,
    userPrompt:
      'Based on the information provided, here are recommended control measures...',
  },

  apf_calculation: {
    systemPrompt: `You are calculating Assigned Protection Factor (APF) requirements for respiratory protection.
If there is an inhalation hazard, determine the required APF by comparing exposure to Workplace Exposure Limits (WEL) from EH40.
Recommend appropriate Respiratory Protective Equipment (RPE) based on HSE guidance.
Specify if fit testing is required (always required for tight-fitting facepieces).`,
    userPrompt: 'Calculating respiratory protection requirements...',
  },

  final_review: {
    systemPrompt: `You are presenting the complete COSHH assessment for final review.
Summarize all key points: hazards, controls, PPE, emergency procedures, health surveillance needs.
Ask the user to confirm everything is correct before generating the final document.
Highlight any high-risk areas that need special attention.`,
    userPrompt: 'Here is your complete COSHH assessment. Please review carefully...',
  },

  complete: {
    systemPrompt: 'Assessment complete.',
    userPrompt: 'Assessment generated successfully.',
  },
};

/**
 * Determine next workflow step based on current state
 */
export function getNextStep(state: WorkflowState): WorkflowStep {
  const stepOrder: WorkflowStep[] = [
    'upload_sds',
    'confirm_sds',
    'usage_details',
    'environment_assessment',
    'worker_exposure',
    'control_verification',
    'apf_calculation',
    'final_review',
    'complete',
  ];

  const currentIndex = stepOrder.indexOf(state.currentStep);
  const nextIndex = currentIndex + 1;

  // Skip APF calculation if no inhalation hazard
  if (stepOrder[nextIndex] === 'apf_calculation' && !hasInhalationHazard(state)) {
    return stepOrder[nextIndex + 1] || 'complete';
  }

  return stepOrder[nextIndex] || 'complete';
}

/**
 * Check if SDS data indicates inhalation hazard
 */
function hasInhalationHazard(state: WorkflowState): boolean {
  if (!state.sdsData?.hazards) return false;

  const inhalationKeywords = [
    'respiratory',
    'inhalation',
    'vapour',
    'dust',
    'fume',
    'gas',
    'mist',
    'aerosol',
  ];

  return state.sdsData.hazards.some((hazard) =>
    inhalationKeywords.some((keyword) =>
      hazard.type.toLowerCase().includes(keyword)
    )
  );
}

/**
 * Validate if current step is complete
 */
export function isStepComplete(state: WorkflowState): boolean {
  switch (state.currentStep) {
    case 'upload_sds':
      return !!state.sdsData;

    case 'confirm_sds':
      return !!state.sdsData && state.completedSteps.includes('confirm_sds');

    case 'usage_details':
      return (
        !!state.usageData &&
        !!state.usageData.purpose &&
        !!state.usageData.quantity &&
        !!state.usageData.frequency
      );

    case 'environment_assessment':
      return (
        !!state.environmentData &&
        !!state.environmentData.ventilation &&
        !!state.environmentData.workingEnvironmentDescription &&
        !!state.environmentData.temperature &&
        state.environmentData.confinedSpace !== undefined &&
        state.environmentData.otherHazards !== undefined
      );

    case 'worker_exposure':
      return !!state.workerData && state.workerData.numberOfWorkers > 0;

    case 'control_verification':
      return (
        !!state.controlMeasures &&
        state.controlMeasures.length > 0 &&
        state.validated
      );

    case 'apf_calculation':
      return !!state.apfRequirements;

    case 'final_review':
      return state.completedSteps.includes('final_review');

    case 'complete':
      return true;

    default:
      return false;
  }
}

/**
 * Initialize workflow state
 */
export function initializeWorkflow(): WorkflowState {
  return {
    currentStep: 'upload_sds',
    completedSteps: [],
    validated: false,
  };
}

/**
 * Generate system prompt for current workflow step
 */
export function getSystemPromptForStep(state: WorkflowState): string {
  const basePrompt = WORKFLOW_PROMPTS[state.currentStep]?.systemPrompt || '';

  // Add context from previous steps
  let contextPrompt = basePrompt + '\n\n';

  if (state.sdsData) {
    contextPrompt += `Chemical: ${state.sdsData.chemicalName}\n`;
    contextPrompt += `Hazards: ${state.sdsData.hazards.map((h) => h.type).join(', ')}\n`;
  }

  if (state.usageData) {
    contextPrompt += `Usage: ${state.usageData.purpose}\n`;
    contextPrompt += `Frequency: ${state.usageData.frequency}\n`;
  }

  contextPrompt += '\nYou are following UK HSE COSHH regulations and guidance.';
  contextPrompt +=
    '\nReference EH40 for Workplace Exposure Limits where applicable.';
  contextPrompt +=
    '\nAlways follow the control hierarchy: elimination → substitution → engineering controls → administrative controls → PPE.';

  return contextPrompt;
}
