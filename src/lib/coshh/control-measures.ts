/**
 * COSHH Control Measures - Hierarchy of Control
 * Maps P-phrases and substance properties to practical control measures
 */

export type ControlHierarchy =
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe';

export interface ControlMeasure {
  id: string;
  code?: string; // P-phrase code if derived from SDS
  description: string;
  hierarchy: ControlHierarchy;
  icon?: string; // Icon identifier
  category: 'normal' | 'emergency';
  implementationNotes?: string;
}

/**
 * Map P-phrases to practical control measures following UK HSE guidance
 */
export const P_PHRASE_TO_CONTROLS: Record<string, ControlMeasure> = {
  // Prevention - Storage
  'P405': {
    id: 'P405',
    code: 'P405',
    description: 'Store locked up in designated chemical storage area',
    hierarchy: 'administrative',
    icon: 'lock',
    category: 'normal',
    implementationNotes: 'Ensure storage area is clearly signed and access is restricted to authorized personnel only'
  },
  'P403+P233': {
    id: 'P403+P233',
    code: 'P403+P233',
    description: 'Store in well-ventilated area. Keep container tightly closed when not in use',
    hierarchy: 'engineering',
    icon: 'ventilation',
    category: 'normal',
    implementationNotes: 'Storage area should have adequate ventilation to prevent vapour accumulation'
  },
  'P403+P235': {
    id: 'P403+P235',
    code: 'P403+P235',
    description: 'Store in well-ventilated place. Keep cool',
    hierarchy: 'engineering',
    icon: 'temperature',
    category: 'normal',
    implementationNotes: 'Store away from heat sources and direct sunlight'
  },
  'P410+P403': {
    id: 'P410+P403',
    code: 'P410+P403',
    description: 'Protect from sunlight. Store in well-ventilated place',
    hierarchy: 'engineering',
    icon: 'ventilation',
    category: 'normal'
  },

  // Prevention - Handling
  'P201': {
    id: 'P201',
    code: 'P201',
    description: 'Obtain and read Safety Data Sheet before use. Ensure risk assessment is completed',
    hierarchy: 'administrative',
    icon: 'document',
    category: 'normal',
    implementationNotes: 'COSHH assessment must be completed and communicated to all workers'
  },
  'P202': {
    id: 'P202',
    code: 'P202',
    description: 'Do not handle until all safety precautions have been read and understood',
    hierarchy: 'administrative',
    icon: 'stop',
    category: 'normal',
    implementationNotes: 'Provide toolbox talk or training before first use'
  },
  'P210': {
    id: 'P210',
    code: 'P210',
    description: 'Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking',
    hierarchy: 'administrative',
    icon: 'fire-ban',
    category: 'normal',
    implementationNotes: 'Implement hot work permit system if applicable'
  },
  'P233': {
    id: 'P233',
    code: 'P233',
    description: 'Keep container tightly closed when not in use',
    hierarchy: 'administrative',
    icon: 'container',
    category: 'normal'
  },
  'P260': {
    id: 'P260',
    code: 'P260',
    description: 'Do not breathe dust/fume/gas/mist/vapours/spray. Use in well-ventilated area or with Local Exhaust Ventilation (LEV)',
    hierarchy: 'engineering',
    icon: 'no-breathe',
    category: 'normal',
    implementationNotes: 'LEV system must be regularly examined and tested (COSHH Regulation 9)'
  },
  'P261': {
    id: 'P261',
    code: 'P261',
    description: 'Avoid breathing dust/fume/gas/mist/vapours/spray. Ensure adequate ventilation',
    hierarchy: 'engineering',
    icon: 'ventilation',
    category: 'normal'
  },
  'P262': {
    id: 'P262',
    code: 'P262',
    description: 'Do not get in eyes, on skin, or on clothing',
    hierarchy: 'administrative',
    icon: 'warning',
    category: 'normal'
  },
  'P263': {
    id: 'P263',
    code: 'P263',
    description: 'Avoid contact during pregnancy/while nursing',
    hierarchy: 'administrative',
    icon: 'warning',
    category: 'normal',
    implementationNotes: 'Conduct specific risk assessment for pregnant/nursing workers'
  },
  'P264': {
    id: 'P264',
    code: 'P264',
    description: 'Wash hands and exposed skin thoroughly after handling',
    hierarchy: 'administrative',
    icon: 'wash-hands',
    category: 'normal',
    implementationNotes: 'Provide adequate washing facilities'
  },
  'P270': {
    id: 'P270',
    code: 'P270',
    description: 'Do not eat, drink or smoke when using this product',
    hierarchy: 'administrative',
    icon: 'no-food',
    category: 'normal'
  },
  'P271': {
    id: 'P271',
    code: 'P271',
    description: 'Use only outdoors or in well-ventilated area',
    hierarchy: 'engineering',
    icon: 'ventilation',
    category: 'normal'
  },
  'P272': {
    id: 'P272',
    code: 'P272',
    description: 'Contaminated work clothing should not be allowed out of the workplace',
    hierarchy: 'administrative',
    icon: 'clothing',
    category: 'normal',
    implementationNotes: 'Provide laundering service or disposal for contaminated clothing'
  },
  'P273': {
    id: 'P273',
    code: 'P273',
    description: 'Avoid release to the environment',
    hierarchy: 'administrative',
    icon: 'environment',
    category: 'normal'
  },

  // PPE
  'P280': {
    id: 'P280',
    code: 'P280',
    description: 'Wear appropriate personal protective equipment: gloves, protective clothing, eye/face protection',
    hierarchy: 'ppe',
    icon: 'ppe',
    category: 'normal',
    implementationNotes: 'PPE must be suitable for the task - refer to SDS Section 8 for specifications'
  },
  'P281': {
    id: 'P281',
    code: 'P281',
    description: 'Use personal protective equipment as required',
    hierarchy: 'ppe',
    icon: 'ppe',
    category: 'normal'
  },
  'P282': {
    id: 'P282',
    code: 'P282',
    description: 'Wear cold insulating gloves and face shield',
    hierarchy: 'ppe',
    icon: 'ppe-cold',
    category: 'normal'
  },
  'P283': {
    id: 'P283',
    code: 'P283',
    description: 'Wear fire resistant or flame retardant clothing',
    hierarchy: 'ppe',
    icon: 'ppe-fire',
    category: 'normal'
  },
  'P284': {
    id: 'P284',
    code: 'P284',
    description: 'Wear respiratory protection. In case of inadequate ventilation wear respiratory protection',
    hierarchy: 'ppe',
    icon: 'respirator',
    category: 'normal',
    implementationNotes: 'RPE must be face-fit tested. APF calculation required based on exposure levels'
  },
  'P285': {
    id: 'P285',
    code: 'P285',
    description: 'In case of inadequate ventilation wear respiratory protection',
    hierarchy: 'ppe',
    icon: 'respirator',
    category: 'normal'
  },

  // Response - Emergency First Aid
  'P301+P310': {
    id: 'P301+P310',
    code: 'P301+P310',
    description: 'IF SWALLOWED: Immediately call a POISON CENTRE or doctor/physician',
    hierarchy: 'administrative',
    icon: 'phone-emergency',
    category: 'emergency',
    implementationNotes: 'Emergency contact numbers must be clearly displayed'
  },
  'P301+P312': {
    id: 'P301+P312',
    code: 'P301+P312',
    description: 'IF SWALLOWED: Call a POISON CENTRE or doctor if you feel unwell',
    hierarchy: 'administrative',
    icon: 'phone-emergency',
    category: 'emergency'
  },
  'P301+P330+P331': {
    id: 'P301+P330+P331',
    code: 'P301+P330+P331',
    description: 'IF SWALLOWED: Rinse mouth. Do NOT induce vomiting',
    hierarchy: 'administrative',
    icon: 'no-vomit',
    category: 'emergency'
  },
  'P302+P352': {
    id: 'P302+P352',
    code: 'P302+P352',
    description: 'IF ON SKIN: Wash with plenty of water and soap',
    hierarchy: 'administrative',
    icon: 'wash',
    category: 'emergency',
    implementationNotes: 'Emergency washing facilities must be readily accessible'
  },
  'P303+P361+P353': {
    id: 'P303+P361+P353',
    code: 'P303+P361+P353',
    description: 'IF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse skin with water/shower',
    hierarchy: 'administrative',
    icon: 'shower',
    category: 'emergency',
    implementationNotes: 'Emergency shower must be within 10 seconds travel time'
  },
  'P304+P340': {
    id: 'P304+P340',
    code: 'P304+P340',
    description: 'IF INHALED: Remove person to fresh air and keep comfortable for breathing',
    hierarchy: 'administrative',
    icon: 'fresh-air',
    category: 'emergency'
  },
  'P304+P341': {
    id: 'P304+P341',
    code: 'P304+P341',
    description: 'IF INHALED: If breathing is difficult, remove person to fresh air and keep at rest in a position comfortable for breathing',
    hierarchy: 'administrative',
    icon: 'fresh-air',
    category: 'emergency'
  },
  'P305+P351+P338': {
    id: 'P305+P351+P338',
    code: 'P305+P351+P338',
    description: 'IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses if present and easy to do. Continue rinsing',
    hierarchy: 'administrative',
    icon: 'eye-wash',
    category: 'emergency',
    implementationNotes: 'Eye wash station must be readily accessible within 10 seconds'
  },
  'P308+P313': {
    id: 'P308+P313',
    code: 'P308+P313',
    description: 'IF exposed or concerned: Get medical advice/attention',
    hierarchy: 'administrative',
    icon: 'medical',
    category: 'emergency'
  },
  'P310': {
    id: 'P310',
    code: 'P310',
    description: 'Immediately call a POISON CENTRE or doctor',
    hierarchy: 'administrative',
    icon: 'phone-emergency',
    category: 'emergency'
  },
  'P311': {
    id: 'P311',
    code: 'P311',
    description: 'Call a POISON CENTRE or doctor',
    hierarchy: 'administrative',
    icon: 'phone-emergency',
    category: 'emergency'
  },
  'P312': {
    id: 'P312',
    code: 'P312',
    description: 'Call a POISON CENTRE or doctor if you feel unwell',
    hierarchy: 'administrative',
    icon: 'phone-emergency',
    category: 'emergency'
  },
  'P342+P311': {
    id: 'P342+P311',
    code: 'P342+P311',
    description: 'If experiencing respiratory symptoms: Call a POISON CENTRE or doctor',
    hierarchy: 'administrative',
    icon: 'phone-emergency',
    category: 'emergency'
  },
  'P370+P378': {
    id: 'P370+P378',
    code: 'P370+P378',
    description: 'In case of fire: Use appropriate extinguishing media (refer to Section 5 of SDS)',
    hierarchy: 'administrative',
    icon: 'fire-extinguisher',
    category: 'emergency'
  },

  // Response - Spills
  'P391': {
    id: 'P391',
    code: 'P391',
    description: 'Collect spillage. Have spill kit available',
    hierarchy: 'administrative',
    icon: 'spill-kit',
    category: 'emergency',
    implementationNotes: 'Spill kit must be readily available and workers trained in its use'
  },

  // Disposal
  'P501': {
    id: 'P501',
    code: 'P501',
    description: 'Dispose of contents/container in accordance with local/national regulations. Use licensed waste disposal contractor',
    hierarchy: 'administrative',
    icon: 'disposal',
    category: 'normal',
    implementationNotes: 'Maintain waste transfer notes and disposal records'
  },
};

/**
 * Additional substance-specific controls based on properties and usage
 */
export function getAdditionalControls(
  substanceData: {
    hazards?: Array<{ type: string; hazardClass: string }>;
    exposureLimits?: any[];
  },
  usageData?: {
    methodOfUse?: string;
    substanceForm?: string;
    exposureRoutes?: string[];
  },
  environmentData?: {
    ventilation?: string;
    confinedSpace?: boolean;
  }
): ControlMeasure[] {
  const additionalControls: ControlMeasure[] = [];

  // LEV Testing requirement
  if (
    environmentData?.ventilation?.toLowerCase().includes('lev') ||
    environmentData?.ventilation?.toLowerCase().includes('local exhaust') ||
    environmentData?.ventilation?.toLowerCase().includes('extraction')
  ) {
    additionalControls.push({
      id: 'LEV_TESTING',
      description: 'Ensure Local Exhaust Ventilation (LEV) system is examined and tested at least every 14 months (COSHH Regulation 9)',
      hierarchy: 'engineering',
      icon: 'certificate',
      category: 'normal',
      implementationNotes: 'Keep records of LEV examinations for at least 5 years. Display TExT certificate'
    });
  }

  // Confined space controls
  if (environmentData?.confinedSpace) {
    additionalControls.push({
      id: 'CONFINED_SPACE',
      description: 'Confined Space entry procedures must be followed. Permit to work system required. Atmospheric testing before entry',
      hierarchy: 'administrative',
      icon: 'permit',
      category: 'normal',
      implementationNotes: 'Confined Spaces Regulations 1997 apply. Emergency rescue plan required'
    });
  }

  // Respiratory protection if inhalation hazard
  const hasInhalationHazard = substanceData.hazards?.some(h =>
    h.type.includes('health-hazard') ||
    h.hazardClass.toLowerCase().includes('resp') ||
    h.hazardClass.toLowerCase().includes('inhal')
  );

  if (hasInhalationHazard && usageData?.exposureRoutes?.some(r => r.toLowerCase().includes('inhalation'))) {
    additionalControls.push({
      id: 'RPE_FIT_TEST',
      description: 'Respiratory Protective Equipment (RPE) must be face-fit tested for tight-fitting facepieces. Re-test every 3 years or if significant facial changes',
      hierarchy: 'ppe',
      icon: 'fit-test',
      category: 'normal',
      implementationNotes: 'Keep records of face-fit tests. RPE must be adequately maintained and stored'
    });
  }

  // Skin contact controls
  if (usageData?.exposureRoutes?.some(r => r.toLowerCase().includes('skin'))) {
    additionalControls.push({
      id: 'SKIN_PROTECTION',
      description: 'Use appropriate chemical-resistant gloves. Refer to SDS Section 8 for glove material and breakthrough time',
      hierarchy: 'ppe',
      icon: 'gloves',
      category: 'normal',
      implementationNotes: 'Inspect gloves before each use. Replace when damaged or contaminated'
    });
  }

  // Supervision and monitoring
  additionalControls.push({
    id: 'SUPERVISION',
    description: 'Supervisor to monitor workers for signs of ill health or exposure. Daily visual checks of control measures',
    hierarchy: 'administrative',
    icon: 'supervisor',
    category: 'normal',
    implementationNotes: 'Supervisors should be trained to recognize early signs of overexposure'
  });

  // Training
  additionalControls.push({
    id: 'TRAINING',
    description: 'Provide information, instruction and training on hazards, control measures, emergency procedures and correct use of PPE',
    hierarchy: 'administrative',
    icon: 'training',
    category: 'normal',
    implementationNotes: 'Keep training records. Refresh training periodically and when procedures change'
  });

  return additionalControls;
}

/**
 * Extract controls from P-phrases
 */
export function extractControlsFromPPhrases(
  pPhrases: Array<{ code: string; description: string; type: string }>
): ControlMeasure[] {
  const controls: ControlMeasure[] = [];
  const addedCodes = new Set<string>();

  for (const phrase of pPhrases) {
    const control = P_PHRASE_TO_CONTROLS[phrase.code];
    if (control && !addedCodes.has(control.id)) {
      controls.push(control);
      addedCodes.add(control.id);
    }
  }

  return controls;
}

/**
 * Calculate risk score (simplified 5x5 matrix)
 */
export function calculateRiskScore(
  likelihood: 1 | 2 | 3 | 4 | 5,
  severity: 1 | 2 | 3 | 4 | 5
): number {
  return likelihood * severity;
}

/**
 * Get risk rating from score
 */
export function getRiskRating(score: number): {
  level: 'Low' | 'Medium' | 'High' | 'Very High';
  color: string;
} {
  if (score <= 5) return { level: 'Low', color: 'green' };
  if (score <= 12) return { level: 'Medium', color: 'orange' };
  if (score <= 20) return { level: 'High', color: 'red' };
  return { level: 'Very High', color: 'darkred' };
}
