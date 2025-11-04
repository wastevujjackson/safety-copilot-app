import { createClient } from '@/lib/supabase/server';

export interface EH40ExposureLimit {
  id: string;
  substance_name: string;
  cas_number: string | null;

  // Exposure limits
  long_term_limit_8hr_twa_ppm: number | null;
  long_term_limit_8hr_twa_mgm3: number | null;
  short_term_limit_15min_ppm: number | null;
  short_term_limit_15min_mgm3: number | null;

  // Special notations (NOTE: NOT exhaustive per EH40 guidance)
  // FALSE means "not listed in EH40", NOT "definitely does not have this property"
  sk: boolean; // Skin absorption
  sen: boolean; // Sensitiser
  carc: boolean; // Carcinogen
  mut: boolean; // Mutagen
  repr: boolean; // Reproductive toxicant
  resp: boolean; // Respiratory sensitiser
  asthmagen: boolean; // Occupational asthma

  notes: string | null;
  comments: string | null;
  requires_additional_hazard_check: boolean;
  eh40_edition: string | null;

  // Relations
  synonyms?: EH40Synonym[];
  biological_monitoring?: EH40BiologicalMonitoring[];
}

export interface EH40Synonym {
  id: string;
  eh40_substance_id: string;
  synonym_name: string;
  synonym_type: string | null;
}

export interface EH40BiologicalMonitoring {
  id: string;
  eh40_substance_id: string;
  determinand: string; // What to measure
  sampling_time: string | null;
  biological_guidance_value: number | null;
  biological_guidance_unit: string | null;
  notes: string | null;
}

/**
 * Search EH40 data by substance name or CAS number
 */
export async function searchEH40Substance(query: string): Promise<EH40ExposureLimit[]> {
  const supabase = await createClient();

  // Try exact match first on substance name or CAS
  let { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select(`
      *,
      synonyms:eh40_synonyms(*),
      biological_monitoring:eh40_biological_monitoring(*)
    `)
    .or(`substance_name.ilike.%${query}%,cas_number.eq.${query}`)
    .limit(10);

  // If no results, try synonym search
  if (!data || data.length === 0) {
    const { data: synonymData } = await supabase
      .from('eh40_synonyms')
      .select(`
        eh40_substance_id,
        eh40_exposure_limits:eh40_substance_id(
          *,
          synonyms:eh40_synonyms(*),
          biological_monitoring:eh40_biological_monitoring(*)
        )
      `)
      .ilike('synonym_name', `%${query}%`)
      .limit(10);

    if (synonymData) {
      data = synonymData.map(s => s.eh40_exposure_limits).filter(Boolean) as any;
    }
  }

  if (error) {
    console.error('Error searching EH40:', error);
    return [];
  }

  return data || [];
}

/**
 * Get EH40 data by exact CAS number
 */
export async function getEH40ByCAS(casNumber: string): Promise<EH40ExposureLimit | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select(`
      *,
      synonyms:eh40_synonyms(*),
      biological_monitoring:eh40_biological_monitoring(*)
    `)
    .eq('cas_number', casNumber)
    .single();

  if (error) {
    console.error('Error fetching EH40 by CAS:', error);
    return null;
  }

  return data;
}

/**
 * Get EH40 data by substance name (fuzzy match)
 */
export async function getEH40ByName(substanceName: string): Promise<EH40ExposureLimit | null> {
  const supabase = await createClient();

  // Try exact match first
  let { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select(`
      *,
      synonyms:eh40_synonyms(*),
      biological_monitoring:eh40_biological_monitoring(*)
    `)
    .ilike('substance_name', substanceName)
    .single();

  // If no exact match, try synonym search
  if (error || !data) {
    const { data: synonymData } = await supabase
      .from('eh40_synonyms')
      .select(`
        eh40_exposure_limits:eh40_substance_id(
          *,
          synonyms:eh40_synonyms(*),
          biological_monitoring:eh40_biological_monitoring(*)
        )
      `)
      .ilike('synonym_name', substanceName)
      .limit(1)
      .single();

    if (synonymData) {
      data = synonymData.eh40_exposure_limits as any;
    }
  }

  if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
    console.error('Error fetching EH40 by name:', error);
    return null;
  }

  return data;
}

/**
 * Get all substances with skin notation (Sk)
 */
export async function getSubstancesWithSkinAbsorption(): Promise<EH40ExposureLimit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select('*')
    .eq('sk', true)
    .order('substance_name');

  if (error) {
    console.error('Error fetching substances with skin notation:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all substances requiring biological monitoring
 */
export async function getSubstancesWithBiologicalMonitoring(): Promise<EH40ExposureLimit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select(`
      *,
      biological_monitoring:eh40_biological_monitoring(*)
    `)
    .not('biological_monitoring', 'is', null);

  if (error) {
    console.error('Error fetching substances with biological monitoring:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all carcinogens
 */
export async function getCarcinogens(): Promise<EH40ExposureLimit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select('*')
    .eq('carc', true)
    .order('substance_name');

  if (error) {
    console.error('Error fetching carcinogens:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all respiratory sensitisers
 */
export async function getRespiratorySensitisers(): Promise<EH40ExposureLimit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('eh40_exposure_limits')
    .select('*')
    .or('sen.eq.true,resp.eq.true,asthmagen.eq.true')
    .order('substance_name');

  if (error) {
    console.error('Error fetching respiratory sensitisers:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a chemical requires additional controls based on EH40
 */
export async function getEH40ControlRequirements(casOrName: string): Promise<{
  hasWEL: boolean;
  requiresBiologicalMonitoring: boolean;
  skinAbsorption: boolean;
  sensitiser: boolean;
  carcinogen: boolean;
  limits: EH40ExposureLimit | null;
}> {
  // Try CAS first, then name
  let limits = await getEH40ByCAS(casOrName);
  if (!limits) {
    limits = await getEH40ByName(casOrName);
  }

  if (!limits) {
    return {
      hasWEL: false,
      requiresBiologicalMonitoring: false,
      skinAbsorption: false,
      sensitiser: false,
      carcinogen: false,
      limits: null,
    };
  }

  return {
    hasWEL: !!(limits.long_term_limit_8hr_twa_ppm || limits.long_term_limit_8hr_twa_mgm3 || limits.short_term_limit_15min_ppm || limits.short_term_limit_15min_mgm3),
    requiresBiologicalMonitoring: (limits.biological_monitoring?.length || 0) > 0,
    skinAbsorption: limits.sk,
    sensitiser: limits.sen || limits.resp || limits.asthmagen,
    carcinogen: limits.carc || limits.mut || limits.repr,
    limits,
  };
}

/**
 * Format exposure limit for display
 */
export function formatExposureLimit(limit: EH40ExposureLimit): string {
  const parts: string[] = [];

  if (limit.long_term_limit_8hr_twa_ppm || limit.long_term_limit_8hr_twa_mgm3) {
    const ppm = limit.long_term_limit_8hr_twa_ppm ? `${limit.long_term_limit_8hr_twa_ppm} ppm` : '';
    const mgm3 = limit.long_term_limit_8hr_twa_mgm3 ? `${limit.long_term_limit_8hr_twa_mgm3} mg/m³` : '';
    parts.push(`8-hr TWA: ${[ppm, mgm3].filter(Boolean).join(' / ')}`);
  }

  if (limit.short_term_limit_15min_ppm || limit.short_term_limit_15min_mgm3) {
    const ppm = limit.short_term_limit_15min_ppm ? `${limit.short_term_limit_15min_ppm} ppm` : '';
    const mgm3 = limit.short_term_limit_15min_mgm3 ? `${limit.short_term_limit_15min_mgm3} mg/m³` : '';
    parts.push(`15-min STEL: ${[ppm, mgm3].filter(Boolean).join(' / ')}`);
  }

  const notations: string[] = [];
  if (limit.sk) notations.push('Sk (Skin)');
  if (limit.sen) notations.push('Sen (Sensitiser)');
  if (limit.carc) notations.push('Carc');
  if (limit.mut) notations.push('Mut');
  if (limit.repr) notations.push('Repr');
  if (limit.resp) notations.push('Resp Sen');
  if (limit.asthmagen) notations.push('Asthma');

  if (notations.length > 0) {
    parts.push(`[${notations.join(', ')}]`);
  }

  return parts.join(' | ');
}

/**
 * IMPORTANT: Check if additional hazard research needed
 * EH40 notations (Sk, Sen, Carc) are NOT exhaustive
 *
 * This function helps determine if you should:
 * 1. Check SDS for additional hazard info
 * 2. Consult other sources (ECHA, NIOSH, etc.)
 * 3. Cross-reference with H-phrases from SDS
 */
export function shouldCheckAdditionalHazards(
  eh40Data: EH40ExposureLimit | null,
  hCodes: string[]
): {
  needsAdditionalCheck: boolean;
  reasons: string[];
  recommendations: string[];
} {
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // No EH40 data found
  if (!eh40Data) {
    reasons.push('No EH40 WEL found for this substance');
    recommendations.push('Check SDS for all hazard information');
    recommendations.push('Consult ECHA C&L Inventory for EU classification');
    return { needsAdditionalCheck: true, reasons, recommendations };
  }

  // H-phrases suggest hazards not in EH40 notations
  const hasCarcinogenHPhrase = hCodes.some(code => ['H350', 'H350i', 'H351'].includes(code));
  const hasSkinAbsorptionHPhrase = hCodes.some(code => ['H310', 'H311', 'H312'].includes(code));
  const hasSensitiserHPhrase = hCodes.some(code => ['H317', 'H334'].includes(code));
  const hasMutagenicHPhrase = hCodes.some(code => ['H340', 'H341'].includes(code));
  const hasReproductiveHPhrase = hCodes.some(code => ['H360', 'H361', 'H362'].includes(code.substring(0, 4)));

  // Cross-check H-phrases vs EH40 notations
  if (hasCarcinogenHPhrase && !eh40Data.carc) {
    reasons.push('SDS indicates carcinogenic hazard (H350/H351) but not in EH40 Carc notation');
    recommendations.push('Verify carcinogenic classification with IARC/EU CLP');
  }

  if (hasSkinAbsorptionHPhrase && !eh40Data.sk) {
    reasons.push('SDS indicates dermal toxicity (H310/H311/H312) but no Sk notation in EH40');
    recommendations.push('Implement skin protection controls - substance may be absorbed through skin');
  }

  if (hasSensitiserHPhrase && !eh40Data.sen && !eh40Data.resp) {
    reasons.push('SDS indicates sensitisation (H317/H334) but no Sen notation in EH40');
    recommendations.push('Implement sensitisation controls - pre-employment and health surveillance may be required');
  }

  if (hasMutagenicHPhrase && !eh40Data.mut) {
    reasons.push('SDS indicates mutagenic hazard (H340/H341) but no Mut notation in EH40');
    recommendations.push('Verify mutagenic classification - may require enhanced controls');
  }

  if (hasReproductiveHPhrase && !eh40Data.repr) {
    reasons.push('SDS indicates reproductive toxicity (H360/H361) but no Repr notation in EH40');
    recommendations.push('Implement reproductive health controls - exclude pregnant workers from exposure');
  }

  // Flag if set in database
  if (eh40Data.requires_additional_hazard_check) {
    reasons.push('Flagged in EH40 database for additional hazard verification');
    recommendations.push('Consult latest SDS and regulatory databases');
  }

  const needsAdditionalCheck = reasons.length > 0;

  if (!needsAdditionalCheck) {
    recommendations.push('EH40 notations align with SDS H-phrases - no additional checks required');
  }

  return { needsAdditionalCheck, reasons, recommendations };
}

/**
 * Get comprehensive hazard summary combining EH40 + H-phrases
 */
export function getCombinedHazardSummary(
  eh40Data: EH40ExposureLimit | null,
  hCodes: string[]
): {
  exposureLimits: string | null;
  skinAbsorption: boolean;
  sensitiser: boolean;
  carcinogen: boolean;
  mutagen: boolean;
  reproductive: boolean;
  requiresBiologicalMonitoring: boolean;
  warnings: string[];
} {
  const additionalCheck = shouldCheckAdditionalHazards(eh40Data, hCodes);

  return {
    exposureLimits: eh40Data ? formatExposureLimit(eh40Data) : null,
    skinAbsorption: eh40Data?.sk || hCodes.some(c => ['H310', 'H311', 'H312'].includes(c)),
    sensitiser: eh40Data?.sen || eh40Data?.resp || eh40Data?.asthmagen || hCodes.some(c => ['H317', 'H334'].includes(c)),
    carcinogen: eh40Data?.carc || hCodes.some(c => ['H350', 'H350i', 'H351'].includes(c)),
    mutagen: eh40Data?.mut || hCodes.some(c => ['H340', 'H341'].includes(c)),
    reproductive: eh40Data?.repr || hCodes.some(c => c.startsWith('H36')),
    requiresBiologicalMonitoring: (eh40Data?.biological_monitoring?.length || 0) > 0,
    warnings: additionalCheck.reasons,
  };
}
