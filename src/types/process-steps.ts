// =============================================
// PROCESS STEPS AND TASKS TYPES
// For Task-Level Risk Scoring in COSHH Assessments
// =============================================

export interface ProcessStep {
  id: string;
  assessment_id: string;
  step_number: number;
  step_name: string;
  description?: string;
  created_at: string;
  updated_at: string;

  // Relations
  tasks?: Task[];
}

export interface Task {
  id: string;
  process_step_id: string;
  task_order: number;
  task_type: TaskType;
  task_name: string;
  description?: string;

  // Task context for risk assessment
  duration?: string; // "5 minutes", "1 hour", "Continuous"
  frequency?: string; // "Once per shift", "Daily", "Weekly"
  environment?: string; // "Enclosed space", "Well-ventilated area", "Outdoor"
  existing_controls?: string[]; // Array of existing controls

  // Chemicals involved in this task
  chemicals_involved: TaskChemical[];

  created_at: string;
  updated_at: string;

  // Relations
  risk_scoring?: TaskRiskScoring;
}

export type TaskType =
  | 'Mixing'
  | 'Decanting'
  | 'Spraying'
  | 'Brushing'
  | 'Rolling'
  | 'Wiping'
  | 'Pouring'
  | 'Cleaning'
  | 'Transferring'
  | 'Heating'
  | 'Cooling'
  | 'Weighing'
  | 'Diluting'
  | 'Other';

export interface TaskChemical {
  id: string; // Reference to chemical from SDS data
  name: string;
  cas_number?: string;
  h_codes: string[]; // H-phrases for this chemical
  p_codes: string[]; // P-phrases for this chemical
  physical_state?: 'Solid' | 'Liquid' | 'Gas' | 'Vapor' | 'Aerosol';
  volatility?: 'Low' | 'Medium' | 'High';
  concentration?: string; // "100%", "50% solution", etc.
  quantity_used?: string; // "10ml", "500g", etc.
}

export interface TaskRiskScoring {
  id: string;
  task_id: string;

  // Severity scores (from H-phrases via database) - 0-5 scale
  inhalation_severity: number;
  ingestion_severity: number;
  skin_eye_severity: number;

  // Likelihood scores (from ChatGPT based on task context) - 0-5 scale
  inhalation_likelihood: number;
  ingestion_likelihood: number;
  skin_eye_likelihood: number;

  // Risk scores (severity × likelihood) - 0-25 scale
  inhalation_risk: number;
  ingestion_risk: number;
  skin_eye_risk: number;

  // Overall risk level
  overall_risk_level: RiskLevel;
  max_risk_score: number; // Highest individual risk score

  // Rationale and recommendations from ChatGPT
  inhalation_rationale?: string;
  ingestion_rationale?: string;
  skin_eye_rationale?: string;
  additional_controls_required?: string[];

  // Metadata
  assessed_at: string;
  assessed_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface ExposureRoute {
  severity: number; // 0-5
  likelihood: number; // 0-5
  riskScore: number; // 0-25
  rationale?: string;
}

export interface RiskAssessmentResult {
  inhalation: ExposureRoute;
  ingestion: ExposureRoute;
  skinEye: ExposureRoute;
  overallRiskLevel: RiskLevel;
  maxRiskScore: number;
  additionalControlsRequired: string[];
}

// For creating new process steps and tasks
export interface CreateProcessStepInput {
  assessment_id: string;
  step_number: number;
  step_name: string;
  description?: string;
}

export interface CreateTaskInput {
  process_step_id: string;
  task_order: number;
  task_type: TaskType;
  task_name: string;
  description?: string;
  duration?: string;
  frequency?: string;
  environment?: string;
  existing_controls?: string[];
  chemicals_involved: TaskChemical[];
}

// Helper function to determine risk level from max risk score
export function getRiskLevel(maxRiskScore: number): RiskLevel {
  if (maxRiskScore >= 15) return 'Very High';
  if (maxRiskScore >= 10) return 'High';
  if (maxRiskScore >= 5) return 'Medium';
  return 'Low';
}

// Helper function to get risk color for UI
export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'Very High':
      return 'bg-red-600 text-white';
    case 'High':
      return 'bg-orange-500 text-white';
    case 'Medium':
      return 'bg-yellow-500 text-black';
    case 'Low':
      return 'bg-green-500 text-white';
  }
}

// Helper function to get risk score color for UI (0-25 scale)
export function getRiskScoreColor(score: number): string {
  if (score >= 15) return 'bg-red-600 text-white';
  if (score >= 10) return 'bg-orange-500 text-white';
  if (score >= 5) return 'bg-yellow-500 text-black';
  if (score > 0) return 'bg-green-500 text-white';
  return 'bg-gray-200 text-gray-600'; // 0 = not applicable
}
