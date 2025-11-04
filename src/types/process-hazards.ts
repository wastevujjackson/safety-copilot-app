/**
 * Process-Generated Hazards Types
 * For substances without SDS (welding fumes, dust, etc.)
 */

export interface ProcessGeneratedHazard {
  id: string;

  // Identification
  hazard_name: string;
  hazard_category: string; // "Welding fumes", "Wood dust", "Silica dust", etc.
  process_type: string; // "Welding", "Cutting", "Grinding", etc.

  // Physical properties
  physical_form: 'Fume' | 'Dust' | 'Mist' | 'Gas' | 'Vapour' | 'Aerosol';
  particle_size?: string; // "Respirable (<10 µm)", "Inhalable (<100 µm)", etc.

  // Hazard classification (GHS equivalent)
  equivalent_h_codes: string[]; // e.g., ["H350", "H334"]
  hazard_description: string;

  // EH40 Workplace Exposure Limits
  has_eh40_wel: boolean;
  eh40_substance_id?: string;
  wel_8hr_twa_mgm3?: number;
  wel_15min_stel_mgm3?: number;
  wel_notes?: string;

  // Special classifications
  is_carcinogen: boolean;
  is_respiratory_sensitiser: boolean;
  is_asthmagen: boolean;
  is_skin_sensitiser: boolean;

  // Severity scoring (for risk assessment)
  inhalation_severity: number; // 1-5
  skin_eye_severity: number; // 0-5
  ingestion_severity: number; // 0-5

  // Health effects
  health_effects: string; // Long-term
  acute_effects: string; // Short-term
  target_organs: string[];

  // Guidance
  hse_guidance_link?: string;
  additional_notes?: string;

  // Relations
  control_measures?: ProcessHazardControlMeasure[];

  created_at: Date;
  updated_at: Date;
}

export interface ProcessHazardControlMeasure {
  id: string;
  hazard_id: string;

  // Control hierarchy
  control_type: 'Elimination' | 'Substitution' | 'Engineering' | 'Administrative' | 'PPE';
  control_order: number; // 1=Elimination, 5=PPE

  // Control details
  control_measure: string;
  effectiveness: 'High' | 'Medium' | 'Low';

  // Relates to COSHH sections
  relates_to_operational_controls: boolean;
  relates_to_ventilation: boolean;
  relates_to_ppe: boolean;
  relates_to_monitoring: boolean;
  relates_to_health_surveillance: boolean;

  implementation_notes?: string;

  created_at: Date;
}

/**
 * Process hazard search result with grouped controls
 */
export interface ProcessHazardWithControls extends ProcessGeneratedHazard {
  control_measures: ProcessHazardControlMeasure[];
}

/**
 * Auto-populated control measures from process hazard library
 */
export interface ProcessHazardControlSummary {
  operational_controls: string[];
  ventilation: string[];
  ppe: string[];
  monitoring: string[];
  health_surveillance: string[];
  all_controls_by_hierarchy: {
    elimination: string[];
    substitution: string[];
    engineering: string[];
    administrative: string[];
    ppe: string[];
  };
}

/**
 * Process hazard categories for UI filtering
 */
export const PROCESS_HAZARD_CATEGORIES = [
  'Welding fumes',
  'Wood dust',
  'Silica dust',
  'Metalworking fluids',
  'Diesel exhaust',
  'Flour/grain dust',
  'Stone dust',
  'Rubber processing fumes',
  'Vehicle exhaust',
] as const;

export type ProcessHazardCategory = (typeof PROCESS_HAZARD_CATEGORIES)[number];

/**
 * Common process types for task assignment
 */
export const PROCESS_TYPES = [
  'Welding (MIG, TIG, arc, oxy-acetylene)',
  'Welding stainless steel',
  'Soldering',
  'Cutting wood',
  'Sanding wood',
  'Routing wood',
  'Cutting stone/concrete',
  'Grinding stone/concrete',
  'Drilling stone/concrete',
  'Machining metal',
  'Grinding metal',
  'Mixing flour/grain',
  'Operating diesel vehicles indoors',
  'Abrasive blasting',
  'Rubber vulcanisation',
] as const;

export type ProcessType = (typeof PROCESS_TYPES)[number];
