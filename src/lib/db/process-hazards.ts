/**
 * Database functions for process-generated hazards
 * Handles substances without SDS (welding fumes, dust, etc.)
 */

import { createClient } from '@/lib/supabase/server';
import type {
  ProcessGeneratedHazard,
  ProcessHazardWithControls,
  ProcessHazardControlMeasure,
  ProcessHazardControlSummary,
} from '@/types/process-hazards';

/**
 * Search process-generated hazards by name or category
 */
export async function searchProcessHazards(query: string): Promise<ProcessGeneratedHazard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('*')
    .or(`hazard_name.ilike.%${query}%,hazard_category.ilike.%${query}%,process_type.ilike.%${query}%`)
    .order('hazard_name')
    .limit(20);

  if (error) {
    console.error('Error searching process hazards:', error);
    return [];
  }

  return data || [];
}

/**
 * Get process hazard by exact name
 */
export async function getProcessHazardByName(hazardName: string): Promise<ProcessHazardWithControls | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select(`
      *,
      control_measures:process_hazard_control_measures(*)
    `)
    .ilike('hazard_name', hazardName)
    .single();

  if (error) {
    console.error('Error fetching process hazard by name:', error);
    return null;
  }

  return data as ProcessHazardWithControls;
}

/**
 * Get process hazard by ID with control measures
 */
export async function getProcessHazardById(hazardId: string): Promise<ProcessHazardWithControls | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select(`
      *,
      control_measures:process_hazard_control_measures(*)
    `)
    .eq('id', hazardId)
    .single();

  if (error) {
    console.error('Error fetching process hazard by ID:', error);
    return null;
  }

  return data as ProcessHazardWithControls;
}

/**
 * Get all process hazards by category
 */
export async function getProcessHazardsByCategory(category: string): Promise<ProcessGeneratedHazard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('*')
    .eq('hazard_category', category)
    .order('hazard_name');

  if (error) {
    console.error('Error fetching process hazards by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all process hazards by process type
 */
export async function getProcessHazardsByProcessType(processType: string): Promise<ProcessGeneratedHazard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('*')
    .ilike('process_type', `%${processType}%`)
    .order('hazard_name');

  if (error) {
    console.error('Error fetching process hazards by process type:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all carcinogenic process hazards
 */
export async function getCarcinogenicProcessHazards(): Promise<ProcessGeneratedHazard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('*')
    .eq('is_carcinogen', true)
    .order('hazard_name');

  if (error) {
    console.error('Error fetching carcinogenic process hazards:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all respiratory sensitisers
 */
export async function getRespiratorySensitiserProcessHazards(): Promise<ProcessGeneratedHazard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('*')
    .or('is_respiratory_sensitiser.eq.true,is_asthmagen.eq.true')
    .order('hazard_name');

  if (error) {
    console.error('Error fetching respiratory sensitiser process hazards:', error);
    return [];
  }

  return data || [];
}

/**
 * Get control measures summary for a process hazard
 * Groups controls by COSHH section and hierarchy
 */
export async function getProcessHazardControlSummary(hazardId: string): Promise<ProcessHazardControlSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_hazard_control_measures')
    .select('*')
    .eq('hazard_id', hazardId)
    .order('control_order');

  if (error || !data) {
    console.error('Error fetching process hazard control measures:', error);
    return {
      operational_controls: [],
      ventilation: [],
      ppe: [],
      monitoring: [],
      health_surveillance: [],
      all_controls_by_hierarchy: {
        elimination: [],
        substitution: [],
        engineering: [],
        administrative: [],
        ppe: [],
      },
    };
  }

  const controls = data as ProcessHazardControlMeasure[];

  return {
    operational_controls: controls
      .filter((c) => c.relates_to_operational_controls)
      .map((c) => c.control_measure),
    ventilation: controls.filter((c) => c.relates_to_ventilation).map((c) => c.control_measure),
    ppe: controls.filter((c) => c.relates_to_ppe).map((c) => c.control_measure),
    monitoring: controls.filter((c) => c.relates_to_monitoring).map((c) => c.control_measure),
    health_surveillance: controls
      .filter((c) => c.relates_to_health_surveillance)
      .map((c) => c.control_measure),
    all_controls_by_hierarchy: {
      elimination: controls
        .filter((c) => c.control_type === 'Elimination')
        .map((c) => c.control_measure),
      substitution: controls
        .filter((c) => c.control_type === 'Substitution')
        .map((c) => c.control_measure),
      engineering: controls
        .filter((c) => c.control_type === 'Engineering')
        .map((c) => c.control_measure),
      administrative: controls
        .filter((c) => c.control_type === 'Administrative')
        .map((c) => c.control_measure),
      ppe: controls.filter((c) => c.control_type === 'PPE').map((c) => c.control_measure),
    },
  };
}

/**
 * Format process hazard for display
 */
export function formatProcessHazard(hazard: ProcessGeneratedHazard): string {
  const parts: string[] = [];

  // Hazard name and category
  parts.push(`**${hazard.hazard_name}** (${hazard.hazard_category})`);

  // WEL if applicable
  if (hazard.has_eh40_wel && hazard.wel_8hr_twa_mgm3) {
    parts.push(`WEL: ${hazard.wel_8hr_twa_mgm3} mg/m³ (8-hr TWA)`);
  }

  // Special classifications
  const classifications: string[] = [];
  if (hazard.is_carcinogen) classifications.push('Carcinogen');
  if (hazard.is_respiratory_sensitiser) classifications.push('Respiratory Sensitiser');
  if (hazard.is_asthmagen) classifications.push('Asthmagen');
  if (hazard.is_skin_sensitiser) classifications.push('Skin Sensitiser');

  if (classifications.length > 0) {
    parts.push(`[${classifications.join(', ')}]`);
  }

  return parts.join(' | ');
}

/**
 * Calculate severity from process hazard (like H-phrases for SDS chemicals)
 */
export function getProcessHazardSeverity(hazard: ProcessGeneratedHazard): {
  inhalation: number;
  ingestion: number;
  skinEye: number;
} {
  return {
    inhalation: hazard.inhalation_severity,
    ingestion: hazard.ingestion_severity,
    skinEye: hazard.skin_eye_severity,
  };
}

/**
 * Check if process hazard requires health surveillance
 */
export function requiresHealthSurveillance(hazard: ProcessGeneratedHazard): boolean {
  // Carcinogens, respiratory sensitisers, and asthmagens require health surveillance
  return hazard.is_carcinogen || hazard.is_respiratory_sensitiser || hazard.is_asthmagen;
}

/**
 * Get all unique process categories (for UI dropdown)
 */
export async function getAllProcessCategories(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('hazard_category')
    .order('hazard_category');

  if (error) {
    console.error('Error fetching process categories:', error);
    return [];
  }

  // Remove duplicates
  const uniqueCategories = [...new Set(data.map((row) => row.hazard_category))];
  return uniqueCategories;
}

/**
 * Get all unique process types (for UI dropdown)
 */
export async function getAllProcessTypes(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_generated_hazards')
    .select('process_type')
    .order('process_type');

  if (error) {
    console.error('Error fetching process types:', error);
    return [];
  }

  // Remove duplicates
  const uniqueTypes = [...new Set(data.map((row) => row.process_type))];
  return uniqueTypes;
}

/**
 * Suggest process hazards based on task description
 * Uses AI to match task description to process hazards
 */
export async function suggestProcessHazardsForTask(taskDescription: string): Promise<ProcessGeneratedHazard[]> {
  // This will use ChatGPT to analyze the task description and suggest relevant hazards
  // For now, return keyword-based search
  const keywords = taskDescription.toLowerCase();

  let category = '';
  if (keywords.includes('weld')) category = 'Welding fumes';
  else if (keywords.includes('wood') || keywords.includes('saw') || keywords.includes('sand')) category = 'Wood dust';
  else if (keywords.includes('stone') || keywords.includes('concrete') || keywords.includes('brick') || keywords.includes('silica')) category = 'Silica dust';
  else if (keywords.includes('machine') || keywords.includes('lathe') || keywords.includes('mill')) category = 'Metalworking fluids';
  else if (keywords.includes('diesel') || keywords.includes('forklift')) category = 'Diesel exhaust';
  else if (keywords.includes('flour') || keywords.includes('grain') || keywords.includes('bak')) category = 'Flour/grain dust';

  if (category) {
    return await getProcessHazardsByCategory(category);
  }

  // Fallback: search by task description
  return await searchProcessHazards(taskDescription);
}
