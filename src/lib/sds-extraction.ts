import { extractHazardCodes, getHPhrasesByCodes, getPPhrasesByCodes } from '@/lib/db/hazard-phrases';
import type { TaskChemical } from '@/types/process-steps';

export interface SDSExtractionResult {
  chemical_name: string;
  cas_number?: string;
  product_code?: string;
  manufacturer?: string;

  // Extracted codes
  h_codes: string[];
  p_codes: string[];

  // Full phrase data from database
  h_phrases: Array<{
    code: string;
    description: string;
    hazard_class: string;
    signal_word: string | null;
  }>;
  p_phrases: Array<{
    code: string;
    description: string;
    statement_type: string;
  }>;

  // Additional SDS info
  physical_state?: 'Solid' | 'Liquid' | 'Gas' | 'Vapor' | 'Aerosol';
  flash_point?: string;
  boiling_point?: string;

  // Auto-populated control measures from P-phrases
  control_measures: {
    operational_controls: string[];
    ventilation: string[];
    ignition_sources: string[];
    hygiene: string[];
    ppe: string[];
    first_aid: {
      general: string[];
      ingestion: string[];
      skin: string[];
      eye: string[];
      inhalation: string[];
    };
    fire: {
      response: string[];
      fighting: string[];
      evacuation: string[];
    };
    spill: {
      response: string[];
      environmental: string[];
    };
    storage: string[];
    handling: string[];
    disposal: string[];
    training: string[];
  };
}

/**
 * Extract H-codes and P-codes from SDS using GPT-4o Vision
 * Returns only the codes - we'll look up descriptions in database
 */
export async function extractCodesFromSDS(sdsFile: File): Promise<{
  h_codes: string[];
  p_codes: string[];
  chemical_name: string;
  cas_number?: string;
  manufacturer?: string;
  physical_state?: string;
}> {
  const formData = new FormData();
  formData.append('file', sdsFile);

  const prompt = `Extract the following information from this Safety Data Sheet (SDS):

1. Chemical/Product name
2. CAS number (if present)
3. Manufacturer/Supplier name
4. Physical state (Solid, Liquid, Gas, Vapor, or Aerosol)
5. ALL H-codes (hazard statements) - e.g., H225, H315, H300+H310
6. ALL P-codes (precautionary statements) - e.g., P210, P280, P305+P351+P338

Return ONLY valid JSON (no markdown):
{
  "chemical_name": "<name>",
  "cas_number": "<CAS number or null>",
  "manufacturer": "<manufacturer or null>",
  "physical_state": "<Solid|Liquid|Gas|Vapor|Aerosol or null>",
  "h_codes": ["H225", "H315", ...],
  "p_codes": ["P210", "P280", ...]
}

IMPORTANT:
- Extract ALL H-codes and P-codes, including combined ones (e.g., H300+H310+H330)
- Return codes in uppercase
- If a code is not present, return empty array
- Do not include descriptions, only codes`;

  formData.append('prompt', prompt);

  try {
    const response = await fetch('/api/vision', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract codes from SDS');
    }

    const data = await response.json();
    const result = JSON.parse(data.message);

    return {
      h_codes: result.h_codes || [],
      p_codes: result.p_codes || [],
      chemical_name: result.chemical_name || 'Unknown Chemical',
      cas_number: result.cas_number || undefined,
      manufacturer: result.manufacturer || undefined,
      physical_state: result.physical_state || undefined,
    };
  } catch (error) {
    console.error('Error extracting codes from SDS:', error);
    throw error;
  }
}

/**
 * Process SDS file and populate full chemical data with database lookups
 */
export async function processSDSFile(sdsFile: File): Promise<SDSExtractionResult> {
  // Step 1: Extract codes from SDS using Vision API
  const extraction = await extractCodesFromSDS(sdsFile);

  // Step 2: Look up full H-phrase data from database
  const hPhrases = await getHPhrasesByCodes(extraction.h_codes);

  // Step 3: Look up full P-phrase data from database
  const pPhrases = await getPPhrasesByCodes(extraction.p_codes);

  // Step 4: Auto-populate control measures from P-phrases
  const controlMeasures = {
    operational_controls: pPhrases
      .filter(p => p.relates_to_operational_controls)
      .map(p => p.description),
    ventilation: pPhrases
      .filter(p => p.relates_to_ventilation)
      .map(p => p.description),
    ignition_sources: pPhrases
      .filter(p => p.relates_to_ignition_sources)
      .map(p => p.description),
    hygiene: pPhrases
      .filter(p => p.relates_to_hygiene)
      .map(p => p.description),
    ppe: pPhrases
      .filter(p => p.relates_to_ppe)
      .map(p => p.description),
    first_aid: {
      general: pPhrases
        .filter(p => p.relates_to_first_aid && !p.relates_to_first_aid_ingestion && !p.relates_to_first_aid_skin && !p.relates_to_first_aid_eye && !p.relates_to_first_aid_inhalation)
        .map(p => p.description),
      ingestion: pPhrases
        .filter(p => p.relates_to_first_aid_ingestion)
        .map(p => p.description),
      skin: pPhrases
        .filter(p => p.relates_to_first_aid_skin)
        .map(p => p.description),
      eye: pPhrases
        .filter(p => p.relates_to_first_aid_eye)
        .map(p => p.description),
      inhalation: pPhrases
        .filter(p => p.relates_to_first_aid_inhalation)
        .map(p => p.description),
    },
    fire: {
      response: pPhrases
        .filter(p => p.relates_to_fire_response)
        .map(p => p.description),
      fighting: pPhrases
        .filter(p => p.relates_to_fire_fighting)
        .map(p => p.description),
      evacuation: pPhrases
        .filter(p => p.relates_to_fire_evacuation)
        .map(p => p.description),
    },
    spill: {
      response: pPhrases
        .filter(p => p.relates_to_spill_response)
        .map(p => p.description),
      environmental: pPhrases
        .filter(p => p.relates_to_environmental_release)
        .map(p => p.description),
    },
    storage: pPhrases
      .filter(p => p.relates_to_storage)
      .map(p => p.description),
    handling: pPhrases
      .filter(p => p.relates_to_handling)
      .map(p => p.description),
    disposal: pPhrases
      .filter(p => p.relates_to_disposal)
      .map(p => p.description),
    training: pPhrases
      .filter(p => p.relates_to_training)
      .map(p => p.description),
  };

  return {
    chemical_name: extraction.chemical_name,
    cas_number: extraction.cas_number,
    manufacturer: extraction.manufacturer,
    h_codes: extraction.h_codes,
    p_codes: extraction.p_codes,
    h_phrases: hPhrases.map(h => ({
      code: h.code,
      description: h.description,
      hazard_class: h.hazard_class,
      signal_word: h.signal_word,
    })),
    p_phrases: pPhrases.map(p => ({
      code: p.code,
      description: p.description,
      statement_type: p.statement_type,
    })),
    physical_state: extraction.physical_state as any,
    control_measures: controlMeasures,
  };
}

/**
 * Process multiple SDS files
 */
export async function processMultipleSDSFiles(sdsFiles: File[]): Promise<SDSExtractionResult[]> {
  const results: SDSExtractionResult[] = [];

  // Process sequentially to avoid rate limiting
  for (const file of sdsFiles) {
    try {
      const result = await processSDSFile(file);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      // Continue processing other files even if one fails
    }
  }

  return results;
}

/**
 * Convert SDS extraction result to TaskChemical format
 */
export function sdsToTaskChemical(sds: SDSExtractionResult): TaskChemical {
  return {
    id: crypto.randomUUID(),
    name: sds.chemical_name,
    cas_number: sds.cas_number,
    h_codes: sds.h_codes,
    p_codes: sds.p_codes,
    physical_state: sds.physical_state,
    volatility: undefined, // Can be inferred from flash point/boiling point later
    concentration: undefined, // User should specify
    quantity_used: undefined, // User should specify
  };
}

/**
 * Extract H/P codes from text (for manual entry or paste)
 */
export function extractCodesFromText(text: string): {
  h_codes: string[];
  p_codes: string[];
} {
  return extractHazardCodes(text);
}
