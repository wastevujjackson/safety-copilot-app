import { calculateExposureSeverities } from '@/lib/db/hazard-phrases';
import type { Task, TaskChemical, RiskAssessmentResult, RiskLevel } from '@/types/process-steps';

/**
 * Calculate severity scores for a task from its chemicals' H-phrases
 */
export async function calculateTaskSeverity(chemicals: TaskChemical[]): Promise<{
  inhalation: number;
  ingestion: number;
  skinEye: number;
}> {
  // Collect all H-codes from all chemicals in this task
  const allHCodes = chemicals.flatMap(c => c.h_codes);

  // Remove duplicates
  const uniqueHCodes = [...new Set(allHCodes)];

  // Calculate max severity for each exposure route using database
  const severities = await calculateExposureSeverities(uniqueHCodes);

  return {
    inhalation: severities.inhalation || 0,
    ingestion: severities.ingestion || 0,
    skinEye: severities.skinEye || 0,
  };
}

/**
 * Use ChatGPT to assess likelihood of exposure for a task
 */
export async function assessTaskLikelihood(task: Task, severity: {
  inhalation: number;
  ingestion: number;
  skinEye: number;
}): Promise<{
  inhalation_likelihood: number;
  inhalation_rationale: string;
  ingestion_likelihood: number;
  ingestion_rationale: string;
  skinEye_likelihood: number;
  skinEye_rationale: string;
  additional_controls_needed: string[];
}> {
  // Build the prompt for ChatGPT
  const chemicalDetails = task.chemicals_involved.map(c => `
  ${c.name}${c.cas_number ? ` (CAS: ${c.cas_number})` : ''}:
  - Physical state: ${c.physical_state || 'Unknown'}
  - Volatility: ${c.volatility || 'Unknown'}
  - Concentration: ${c.concentration || 'Unknown'}
  - Quantity used: ${c.quantity_used || 'Unknown'}
  - H-phrases: ${c.h_codes.join(', ') || 'None'}
  `).join('\n');

  const prompt = `You are assessing occupational exposure risk for a specific task in a COSHH risk assessment.

TASK DETAILS:
- Task type: ${task.task_type}
- Task name: ${task.task_name}
- Description: ${task.description || 'Not provided'}
- Duration: ${task.duration || 'Unknown'}
- Frequency: ${task.frequency || 'Unknown'}
- Environment: ${task.environment || 'Unknown'}
- Existing controls: ${task.existing_controls?.join(', ') || 'None specified'}

CHEMICALS INVOLVED:
${chemicalDetails}

SEVERITY SCORES (already calculated from H-phrases):
- Inhalation severity: ${severity.inhalation}/5 ${severity.inhalation === 0 ? '(Not applicable)' : ''}
- Ingestion severity: ${severity.ingestion}/5 ${severity.ingestion === 0 ? '(Not applicable)' : ''}
- Skin/eye severity: ${severity.skinEye}/5 ${severity.skinEye === 0 ? '(Not applicable)' : ''}

Based on the task type, chemicals, duration, frequency, environment, and existing controls, rate the LIKELIHOOD (0-5) of exposure via each route.

LIKELIHOOD SCALE:
0 = Not applicable (no hazard via this route)
1 = Highly unlikely (rare, well-controlled, minimal contact)
2 = Unlikely (occasional, good controls in place)
3 = Possible (regular exposure, moderate controls)
4 = Likely (frequent exposure, limited controls)
5 = Highly likely (continuous exposure, poor/no controls)

IMPORTANT CONSIDERATIONS:
- For inhalation: Consider volatility, dust generation, aerosol formation, ventilation
- For ingestion: Consider hand-to-mouth transfer, eating/drinking in area, hygiene practices
- For skin/eye: Consider splashing, contact during handling, PPE effectiveness

Return ONLY valid JSON (no markdown formatting):
{
  "inhalation_likelihood": <0-5>,
  "inhalation_rationale": "<Brief 1-2 sentence explanation>",
  "ingestion_likelihood": <0-5>,
  "ingestion_rationale": "<Brief 1-2 sentence explanation>",
  "skinEye_likelihood": <0-5>,
  "skinEye_rationale": "<Brief 1-2 sentence explanation>",
  "additional_controls_needed": ["<Control 1>", "<Control 2>", ...]
}

If a route has severity 0, set likelihood to 0 and rationale to "Not applicable - no hazard via this route".

For additional_controls_needed:
- Only include if ANY risk score (severity × likelihood) is ≥10 (High or Very High risk)
- Provide specific, actionable controls (e.g., "Use closed transfer system", "Mandatory RPE with organic vapor filters")
- Empty array if no additional controls needed
`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent risk assessment
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to assess likelihood with ChatGPT');
    }

    const data = await response.json();
    const aiResponse = data.message;

    // Parse JSON response
    const result = JSON.parse(aiResponse);

    return {
      inhalation_likelihood: result.inhalation_likelihood,
      inhalation_rationale: result.inhalation_rationale,
      ingestion_likelihood: result.ingestion_likelihood,
      ingestion_rationale: result.ingestion_rationale,
      skinEye_likelihood: result.skinEye_likelihood,
      skinEye_rationale: result.skinEye_rationale,
      additional_controls_needed: result.additional_controls_needed || [],
    };
  } catch (error) {
    console.error('Error assessing task likelihood:', error);

    // Fallback: Conservative default values
    return {
      inhalation_likelihood: severity.inhalation > 0 ? 3 : 0,
      inhalation_rationale: 'Unable to assess - using conservative default',
      ingestion_likelihood: severity.ingestion > 0 ? 2 : 0,
      ingestion_rationale: 'Unable to assess - using conservative default',
      skinEye_likelihood: severity.skinEye > 0 ? 3 : 0,
      skinEye_rationale: 'Unable to assess - using conservative default',
      additional_controls_needed: ['Manual risk assessment required - AI assessment failed'],
    };
  }
}

/**
 * Calculate complete risk assessment for a task
 * Combines database severity with AI likelihood assessment
 */
export async function calculateTaskRiskAssessment(task: Task): Promise<RiskAssessmentResult> {
  // Step 1: Calculate severity from H-phrases (database lookup)
  const severity = await calculateTaskSeverity(task.chemicals_involved);

  // Step 2: Assess likelihood using ChatGPT
  const likelihood = await assessTaskLikelihood(task, severity);

  // Step 3: Calculate risk scores (severity × likelihood)
  const inhalationRisk = severity.inhalation * likelihood.inhalation_likelihood;
  const ingestionRisk = severity.ingestion * likelihood.ingestion_likelihood;
  const skinEyeRisk = severity.skinEye * likelihood.skinEye_likelihood;

  // Step 4: Determine overall risk level
  const maxRiskScore = Math.max(inhalationRisk, ingestionRisk, skinEyeRisk);
  const overallRiskLevel = getRiskLevel(maxRiskScore);

  return {
    inhalation: {
      severity: severity.inhalation,
      likelihood: likelihood.inhalation_likelihood,
      riskScore: inhalationRisk,
      rationale: likelihood.inhalation_rationale,
    },
    ingestion: {
      severity: severity.ingestion,
      likelihood: likelihood.ingestion_likelihood,
      riskScore: ingestionRisk,
      rationale: likelihood.ingestion_rationale,
    },
    skinEye: {
      severity: severity.skinEye,
      likelihood: likelihood.skinEye_likelihood,
      riskScore: skinEyeRisk,
      rationale: likelihood.skinEye_rationale,
    },
    overallRiskLevel,
    maxRiskScore,
    additionalControlsRequired: likelihood.additional_controls_needed,
  };
}

/**
 * Helper function to determine risk level from max risk score
 */
function getRiskLevel(maxRiskScore: number): RiskLevel {
  if (maxRiskScore >= 15) return 'Very High';
  if (maxRiskScore >= 10) return 'High';
  if (maxRiskScore >= 5) return 'Medium';
  return 'Low';
}

/**
 * Batch calculate risk assessments for multiple tasks
 */
export async function calculateMultipleTaskRisks(tasks: Task[]): Promise<Map<string, RiskAssessmentResult>> {
  const results = new Map<string, RiskAssessmentResult>();

  // Process tasks sequentially to avoid rate limiting
  for (const task of tasks) {
    const result = await calculateTaskRiskAssessment(task);
    results.set(task.id, result);
  }

  return results;
}

/**
 * Get risk matrix color class for UI
 */
export function getRiskMatrixColor(riskScore: number): string {
  if (riskScore >= 15) return 'bg-red-600 text-white'; // Very High
  if (riskScore >= 10) return 'bg-orange-500 text-white'; // High
  if (riskScore >= 5) return 'bg-yellow-500 text-black'; // Medium
  if (riskScore > 0) return 'bg-green-500 text-white'; // Low
  return 'bg-gray-200 text-gray-600'; // Not applicable
}

/**
 * Get severity/likelihood color for individual cells
 */
export function getSeverityLikelihoodColor(value: number): string {
  if (value === 5) return 'bg-red-100 border-red-400';
  if (value === 4) return 'bg-orange-100 border-orange-400';
  if (value === 3) return 'bg-yellow-100 border-yellow-400';
  if (value === 2) return 'bg-green-100 border-green-400';
  if (value === 1) return 'bg-blue-100 border-blue-400';
  return 'bg-gray-100 border-gray-300'; // 0 or N/A
}
