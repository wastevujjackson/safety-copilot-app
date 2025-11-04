/**
 * COSHH Health Surveillance Requirements
 * Based on UK HSE COSHH Regulations 2002 (as amended) and HSG61
 */

export interface HealthSurveillanceRequirement {
  substance: string;
  casNumbers?: string[];
  mandatory: boolean;
  frequency: string;
  surveillanceType: string[];
  legalReference: string;
  additionalInfo?: string;
}

export const HEALTH_SURVEILLANCE_REQUIREMENTS: HealthSurveillanceRequirement[] = [
  // SCHEDULE 6 - MANDATORY HEALTH SURVEILLANCE
  {
    substance: 'Vinyl chloride monomer',
    casNumbers: ['75-01-4'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Clinical assessment', 'Biological monitoring'],
    legalReference: 'COSHH Schedule 6, Part I',
    additionalInfo: 'Specific medical surveillance required under VCM Regulations'
  },
  {
    substance: 'Nitro or amino derivatives of phenol and of benzene or its homologues',
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Blood tests (methaemoglobinaemia)'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Potassium chromate',
    casNumbers: ['7789-00-6'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Skin inspection', 'Respiratory assessment'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Sodium chromate',
    casNumbers: ['7775-11-3'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Skin inspection', 'Respiratory assessment'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Potassium dichromate',
    casNumbers: ['7778-50-9'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Skin inspection', 'Respiratory assessment'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Sodium dichromate',
    casNumbers: ['10588-01-9', '7789-12-0'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Skin inspection', 'Respiratory assessment'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Chromium VI compounds',
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Skin inspection', 'Respiratory assessment', 'Biological monitoring'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Ortho-toluidine',
    casNumbers: ['95-53-4'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Urine cytology'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Dianisidine',
    casNumbers: ['119-90-4'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Urine cytology'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Dichlorobenzidine',
    casNumbers: ['91-94-1'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Urine cytology'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Auramine',
    casNumbers: ['492-80-8'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Urine cytology'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Magenta',
    casNumbers: ['569-61-9'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Urine cytology'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Carbon disulphide',
    casNumbers: ['75-15-0'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Neurological assessment', 'Biological monitoring'],
    legalReference: 'COSHH Schedule 6, Part I'
  },
  {
    substance: 'Benzene',
    casNumbers: ['71-43-2'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Medical examination', 'Blood tests (FBC)', 'Biological monitoring'],
    legalReference: 'COSHH Schedule 6, Part I',
    additionalInfo: 'Full blood count required'
  },

  // ISOCYANATES - MANDATORY
  {
    substance: 'Isocyanates (all types)',
    mandatory: true,
    frequency: 'Before exposure, then at least every 12 months',
    surveillanceType: ['Health questionnaire', 'Respiratory assessment', 'Lung function tests'],
    legalReference: 'COSHH Schedule 6, Part II',
    additionalInfo: 'Includes MDI, TDI, HDI and all other isocyanates'
  },
  {
    substance: 'Methylene diphenyl diisocyanate (MDI)',
    casNumbers: ['101-68-8', '26447-40-5'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 12 months',
    surveillanceType: ['Health questionnaire', 'Respiratory assessment', 'Lung function tests'],
    legalReference: 'COSHH Schedule 6, Part II'
  },
  {
    substance: 'Toluene diisocyanate (TDI)',
    casNumbers: ['584-84-9', '91-08-7'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 12 months',
    surveillanceType: ['Health questionnaire', 'Respiratory assessment', 'Lung function tests'],
    legalReference: 'COSHH Schedule 6, Part II'
  },
  {
    substance: 'Hexamethylene diisocyanate (HDI)',
    casNumbers: ['822-06-0'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 12 months',
    surveillanceType: ['Health questionnaire', 'Respiratory assessment', 'Lung function tests'],
    legalReference: 'COSHH Schedule 6, Part II'
  },

  // COMPRESSED AIR
  {
    substance: 'Work in compressed air',
    mandatory: true,
    frequency: 'Before work, periodically during work',
    surveillanceType: ['Medical examination', 'Fitness assessment'],
    legalReference: 'COSHH Schedule 6, Part I',
    additionalInfo: 'Work in Compressed Air Regulations 1996 apply'
  },

  // SUBSTANCES CAUSING OCCUPATIONAL ASTHMA
  {
    substance: 'Flour dust',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Lung function tests if indicated'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Grain dust',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Lung function tests if indicated'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Wood dust (hardwood)',
    casNumbers: [],
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Nasal examination'],
    legalReference: 'COSHH Regulation 11, HSG61, Carcinogen regulations',
    additionalInfo: 'Hardwood dust is a known carcinogen'
  },
  {
    substance: 'Colophony (rosin)',
    casNumbers: ['8050-09-7'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Lung function tests if indicated'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Glutaraldehyde',
    casNumbers: ['111-30-8'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Skin inspection'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Formaldehyde',
    casNumbers: ['50-00-0'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Skin inspection'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Latex',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Skin inspection'],
    legalReference: 'COSHH Regulation 11, HSG61',
    additionalInfo: 'Natural rubber latex proteins'
  },
  {
    substance: 'Laboratory animals',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Lung function tests if indicated'],
    legalReference: 'COSHH Regulation 11, HSG61',
    additionalInfo: 'Includes rats, mice, guinea pigs, rabbits'
  },
  {
    substance: 'Proteolytic enzymes',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Lung function tests if indicated'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Epoxy resin systems',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Skin inspection'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },
  {
    substance: 'Acrylates',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Health questionnaire', 'Respiratory symptom enquiry', 'Skin inspection'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },

  // BIOLOGICAL MONITORING GUIDANCE VALUES (BMGVs)
  {
    substance: 'Lead and inorganic lead compounds',
    casNumbers: ['7439-92-1'],
    mandatory: true,
    frequency: 'At least every 12 months, or more frequently',
    surveillanceType: ['Blood lead levels', 'Medical examination'],
    legalReference: 'Control of Lead at Work Regulations 2002',
    additionalInfo: 'BMGV: Blood lead 60 μg/100ml for men, 25 μg/100ml for women of reproductive capacity'
  },
  {
    substance: 'Mercury and inorganic mercury compounds',
    casNumbers: ['7439-97-6'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Urine mercury levels', 'Medical examination', 'Neurological assessment'],
    legalReference: 'COSHH Regulation 11, EH40',
    additionalInfo: 'BMGV: Urine mercury 20 μmol/mol creatinine'
  },
  {
    substance: 'Cadmium and cadmium compounds',
    casNumbers: ['7440-43-9'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Urine cadmium levels', 'Medical examination', 'Kidney function tests'],
    legalReference: 'COSHH Regulation 11, EH40',
    additionalInfo: 'BMGV: Urine cadmium 5 μmol/mol creatinine'
  },
  {
    substance: 'Arsenic and arsenic compounds',
    casNumbers: ['7440-38-2'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Urine arsenic levels', 'Medical examination'],
    legalReference: 'COSHH Regulation 11, EH40',
    additionalInfo: 'BMGV: Urine inorganic arsenic 10 μmol/mol creatinine'
  },
  {
    substance: 'Trichloroethylene',
    casNumbers: ['79-01-6'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Biological monitoring', 'Medical examination', 'Liver function tests'],
    legalReference: 'COSHH Regulation 11, EH40',
    additionalInfo: 'BMGV: Urine trichloroacetic acid 150 mg/L'
  },
  {
    substance: 'Aniline',
    casNumbers: ['62-53-3'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Blood tests (methaemoglobinaemia)', 'Medical examination'],
    legalReference: 'COSHH Regulation 11, EH40',
    additionalInfo: 'BMGV: Total p-aminophenol in urine 50 mg/L'
  },

  // CARCINOGENS
  {
    substance: 'Respirable crystalline silica (RCS)',
    casNumbers: ['14808-60-7'],
    mandatory: true,
    frequency: 'Before exposure, then every 3 years (or more frequently)',
    surveillanceType: ['Health questionnaire', 'Respiratory assessment', 'Chest X-ray', 'Lung function tests'],
    legalReference: 'COSHH Regulation 11, HSG61',
    additionalInfo: 'Silicosis risk - construction and quarrying'
  },
  {
    substance: 'Asbestos',
    casNumbers: ['1332-21-4', '12001-29-5'],
    mandatory: true,
    frequency: 'Before exposure, then at least every 3 years',
    surveillanceType: ['Health questionnaire', 'Medical examination', 'Chest X-ray'],
    legalReference: 'Control of Asbestos Regulations 2012',
    additionalInfo: 'Specific asbestos medical required'
  },
  {
    substance: 'Beryllium',
    casNumbers: ['7440-41-7'],
    mandatory: true,
    frequency: 'At least every 12 months',
    surveillanceType: ['Blood beryllium lymphocyte proliferation test', 'Chest X-ray', 'Lung function tests'],
    legalReference: 'COSHH Regulation 11'
  },

  // SUBSTANCES CAUSING OCCUPATIONAL DERMATITIS
  {
    substance: 'Cement (wet)',
    mandatory: true,
    frequency: 'Before exposure, then periodically (at least annually)',
    surveillanceType: ['Skin inspection', 'Health questionnaire'],
    legalReference: 'COSHH Regulation 11, HSG61',
    additionalInfo: 'Chromate dermatitis risk'
  },
  {
    substance: 'Metalworking fluids',
    mandatory: true,
    frequency: 'Before exposure, then at least every 24 months',
    surveillanceType: ['Skin inspection', 'Respiratory symptom enquiry', 'Health questionnaire'],
    legalReference: 'COSHH Regulation 11, HSG61'
  },

  // PESTICIDES
  {
    substance: 'Organophosphate pesticides',
    mandatory: true,
    frequency: 'Before exposure, then every 12 months',
    surveillanceType: ['Blood cholinesterase levels', 'Medical examination', 'Neurological assessment'],
    legalReference: 'COSHH Regulation 11',
    additionalInfo: 'Pre-exposure baseline essential'
  }
];

/**
 * Check if a substance requires mandatory health surveillance
 */
export function requiresHealthSurveillance(
  chemicalName: string,
  casNumber?: string
): HealthSurveillanceRequirement | null {
  const nameLower = chemicalName.toLowerCase();

  // Check exact matches first
  for (const req of HEALTH_SURVEILLANCE_REQUIREMENTS) {
    // Check CAS number match
    if (casNumber && req.casNumbers?.includes(casNumber)) {
      return req;
    }

    // Check name match
    const substanceLower = req.substance.toLowerCase();
    if (nameLower.includes(substanceLower) || substanceLower.includes(nameLower)) {
      return req;
    }
  }

  // Check for partial matches (e.g., "isocyanate" in name)
  const keywords = [
    { keyword: 'isocyanate', substance: 'Isocyanates (all types)' },
    { keyword: 'flour', substance: 'Flour dust' },
    { keyword: 'grain', substance: 'Grain dust' },
    { keyword: 'wood dust', substance: 'Wood dust (hardwood)' },
    { keyword: 'hardwood', substance: 'Wood dust (hardwood)' },
    { keyword: 'latex', substance: 'Latex' },
    { keyword: 'epoxy', substance: 'Epoxy resin systems' },
    { keyword: 'acrylate', substance: 'Acrylates' },
    { keyword: 'silica', substance: 'Respirable crystalline silica (RCS)' },
    { keyword: 'asbestos', substance: 'Asbestos' },
    { keyword: 'cement', substance: 'Cement (wet)' },
    { keyword: 'chromate', substance: 'Chromium VI compounds' },
    { keyword: 'chromium', substance: 'Chromium VI compounds' },
  ];

  for (const { keyword, substance } of keywords) {
    if (nameLower.includes(keyword)) {
      return HEALTH_SURVEILLANCE_REQUIREMENTS.find(req => req.substance === substance) || null;
    }
  }

  return null;
}

/**
 * Get all substances requiring health surveillance from a list
 */
export function getSubstancesRequiringSurveillance(
  substances: Array<{ name: string; casNumber?: string }>
): HealthSurveillanceRequirement[] {
  const requirements: HealthSurveillanceRequirement[] = [];
  const added = new Set<string>();

  for (const substance of substances) {
    const requirement = requiresHealthSurveillance(substance.name, substance.casNumber);
    if (requirement && !added.has(requirement.substance)) {
      requirements.push(requirement);
      added.add(requirement.substance);
    }
  }

  return requirements;
}
