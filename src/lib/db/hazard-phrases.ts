import { createClient } from '@/lib/supabase/server';

export interface HPhraseData {
  code: string;
  description: string;
  hazard_class: string;
  category: string | null;
  inhalation_severity: number | null;
  ingestion_severity: number | null;
  skin_eye_severity: number | null;
  other_severity: number | null;
  signal_word: string | null;
  notes: string | null;
}

export interface PPhraseData {
  code: string;
  description: string;
  statement_type: string;
  category: string | null;

  // Section 5: Operational Controls & Precautions
  relates_to_operational_controls: boolean;
  relates_to_ventilation: boolean;
  relates_to_ignition_sources: boolean;
  relates_to_hygiene: boolean;

  // Section 6: PPE Requirements
  relates_to_ppe: boolean;

  // Section 10: First Aid (Emergency Response - Medical)
  relates_to_first_aid: boolean;
  relates_to_first_aid_ingestion: boolean;
  relates_to_first_aid_skin: boolean;
  relates_to_first_aid_eye: boolean;
  relates_to_first_aid_inhalation: boolean;

  // Section 11: Fire (Emergency Response - Fire)
  relates_to_fire_response: boolean;
  relates_to_fire_fighting: boolean;
  relates_to_fire_evacuation: boolean;

  // Section 12: Environment (Emergency Response - Spill)
  relates_to_spill_response: boolean;
  relates_to_environmental_release: boolean;

  // Section 13: Storage and Handling
  relates_to_storage: boolean;
  relates_to_handling: boolean;
  relates_to_disposal: boolean;

  // General
  relates_to_training: boolean;

  notes: string | null;
}

/**
 * Get H-phrases by codes (e.g., ["H225", "H315", "H319"])
 */
export async function getHPhrasesByCodes(codes: string[]): Promise<HPhraseData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('h_phrases')
    .select('*')
    .in('code', codes)
    .order('code');

  if (error) {
    console.error('Error fetching H-phrases:', error);
    return [];
  }

  return data || [];
}

/**
 * Get P-phrases by codes (e.g., ["P210", "P280", "P305+P351+P338"])
 */
export async function getPPhrasesByCodes(codes: string[]): Promise<PPhraseData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('p_phrases')
    .select('*')
    .in('code', codes)
    .order('code');

  if (error) {
    console.error('Error fetching P-phrases:', error);
    return [];
  }

  return data || [];
}

/**
 * Get P-phrases filtered by control measure type
 */
export async function getPPhrasesByType(
  codes: string[],
  filterType?:
    | 'operational_controls'
    | 'ventilation'
    | 'ignition_sources'
    | 'hygiene'
    | 'ppe'
    | 'first_aid'
    | 'first_aid_ingestion'
    | 'first_aid_skin'
    | 'first_aid_eye'
    | 'first_aid_inhalation'
    | 'fire_response'
    | 'fire_fighting'
    | 'fire_evacuation'
    | 'spill_response'
    | 'environmental_release'
    | 'storage'
    | 'handling'
    | 'disposal'
    | 'training'
): Promise<PPhraseData[]> {
  const supabase = await createClient();

  let query = supabase
    .from('p_phrases')
    .select('*')
    .in('code', codes);

  // Apply filter if specified
  if (filterType) {
    const columnMap = {
      'operational_controls': 'relates_to_operational_controls',
      'ventilation': 'relates_to_ventilation',
      'ignition_sources': 'relates_to_ignition_sources',
      'hygiene': 'relates_to_hygiene',
      'ppe': 'relates_to_ppe',
      'first_aid': 'relates_to_first_aid',
      'first_aid_ingestion': 'relates_to_first_aid_ingestion',
      'first_aid_skin': 'relates_to_first_aid_skin',
      'first_aid_eye': 'relates_to_first_aid_eye',
      'first_aid_inhalation': 'relates_to_first_aid_inhalation',
      'fire_response': 'relates_to_fire_response',
      'fire_fighting': 'relates_to_fire_fighting',
      'fire_evacuation': 'relates_to_fire_evacuation',
      'spill_response': 'relates_to_spill_response',
      'environmental_release': 'relates_to_environmental_release',
      'storage': 'relates_to_storage',
      'handling': 'relates_to_handling',
      'disposal': 'relates_to_disposal',
      'training': 'relates_to_training',
    };
    query = query.eq(columnMap[filterType], true);
  }

  const { data, error } = await query.order('code');

  if (error) {
    console.error('Error fetching P-phrases by type:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate maximum severity for exposure routes from H-phrases
 * Returns object with max severity for each route
 */
export async function calculateExposureSeverities(hCodes: string[]): Promise<{
  inhalation: number;
  ingestion: number;
  skinEye: number;
  other: number;
}> {
  const hPhrases = await getHPhrasesByCodes(hCodes);

  const severities = {
    inhalation: 0,
    ingestion: 0,
    skinEye: 0,
    other: 0,
  };

  hPhrases.forEach(phrase => {
    if (phrase.inhalation_severity && phrase.inhalation_severity > severities.inhalation) {
      severities.inhalation = phrase.inhalation_severity;
    }
    if (phrase.ingestion_severity && phrase.ingestion_severity > severities.ingestion) {
      severities.ingestion = phrase.ingestion_severity;
    }
    if (phrase.skin_eye_severity && phrase.skin_eye_severity > severities.skinEye) {
      severities.skinEye = phrase.skin_eye_severity;
    }
    if (phrase.other_severity && phrase.other_severity > severities.other) {
      severities.other = phrase.other_severity;
    }
  });

  return severities;
}

/**
 * Group P-phrases by statement type (Prevention, Response, Storage, Disposal)
 */
export async function groupPPhrasesByType(codes: string[]): Promise<{
  prevention: PPhraseData[];
  response: PPhraseData[];
  storage: PPhraseData[];
  disposal: PPhraseData[];
}> {
  const pPhrases = await getPPhrasesByCodes(codes);

  return {
    prevention: pPhrases.filter(p => p.statement_type === 'Prevention'),
    response: pPhrases.filter(p => p.statement_type === 'Response'),
    storage: pPhrases.filter(p => p.statement_type === 'Storage'),
    disposal: pPhrases.filter(p => p.statement_type === 'Disposal'),
  };
}

/**
 * Extract H and P codes from text using regex
 * Matches patterns like H225, H300+H310, P210, P305+P351+P338
 */
export function extractHazardCodes(text: string): {
  hCodes: string[];
  pCodes: string[];
} {
  // Match H-codes (including combined like H300+H310)
  const hCodeRegex = /\b(H\d{3}(?:\+H\d{3})*|EUH\d{3})\b/gi;
  const hMatches = text.match(hCodeRegex) || [];
  const hCodes = [...new Set(hMatches.map(code => code.toUpperCase()))];

  // Match P-codes (including combined like P305+P351+P338)
  const pCodeRegex = /\bP\d{3}(?:\+P\d{3})*/gi;
  const pMatches = text.match(pCodeRegex) || [];
  const pCodes = [...new Set(pMatches.map(code => code.toUpperCase()))];

  return { hCodes, pCodes };
}

/**
 * Get suggested control measures from P-phrases mapped to COSHH sections
 */
export async function getSuggestedControlMeasures(pCodes: string[]): Promise<{
  // Section 5: Operational Controls
  operational_controls: string[];
  ventilation: string[];
  ignition_sources: string[];
  hygiene: string[];

  // Section 6: PPE
  ppe: string[];

  // Section 10: First Aid
  first_aid: string[];
  first_aid_ingestion: string[];
  first_aid_skin: string[];
  first_aid_eye: string[];
  first_aid_inhalation: string[];

  // Section 11: Fire
  fire_response: string[];
  fire_fighting: string[];
  fire_evacuation: string[];

  // Section 12: Environment/Spill
  spill_response: string[];
  environmental_release: string[];

  // Section 13: Storage & Handling
  storage: string[];
  handling: string[];
  disposal: string[];

  // General
  training: string[];
}> {
  const pPhrases = await getPPhrasesByCodes(pCodes);

  return {
    operational_controls: pPhrases.filter(p => p.relates_to_operational_controls).map(p => p.description),
    ventilation: pPhrases.filter(p => p.relates_to_ventilation).map(p => p.description),
    ignition_sources: pPhrases.filter(p => p.relates_to_ignition_sources).map(p => p.description),
    hygiene: pPhrases.filter(p => p.relates_to_hygiene).map(p => p.description),

    ppe: pPhrases.filter(p => p.relates_to_ppe).map(p => p.description),

    first_aid: pPhrases.filter(p => p.relates_to_first_aid).map(p => p.description),
    first_aid_ingestion: pPhrases.filter(p => p.relates_to_first_aid_ingestion).map(p => p.description),
    first_aid_skin: pPhrases.filter(p => p.relates_to_first_aid_skin).map(p => p.description),
    first_aid_eye: pPhrases.filter(p => p.relates_to_first_aid_eye).map(p => p.description),
    first_aid_inhalation: pPhrases.filter(p => p.relates_to_first_aid_inhalation).map(p => p.description),

    fire_response: pPhrases.filter(p => p.relates_to_fire_response).map(p => p.description),
    fire_fighting: pPhrases.filter(p => p.relates_to_fire_fighting).map(p => p.description),
    fire_evacuation: pPhrases.filter(p => p.relates_to_fire_evacuation).map(p => p.description),

    spill_response: pPhrases.filter(p => p.relates_to_spill_response).map(p => p.description),
    environmental_release: pPhrases.filter(p => p.relates_to_environmental_release).map(p => p.description),

    storage: pPhrases.filter(p => p.relates_to_storage).map(p => p.description),
    handling: pPhrases.filter(p => p.relates_to_handling).map(p => p.description),
    disposal: pPhrases.filter(p => p.relates_to_disposal).map(p => p.description),

    training: pPhrases.filter(p => p.relates_to_training).map(p => p.description),
  };
}
