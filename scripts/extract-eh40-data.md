# EH40 Data Extraction Guide

## Overview

The HSE EH40 document contains:
1. **Main table**: Workplace Exposure Limits (WELs) with 8-hr TWA and 15-min STEL
2. **Synonyms appendix**: Alternative names for substances
3. **Biological monitoring appendix**: BGVs for substances requiring biological monitoring

## Option 1: Manual Extraction (Recommended for accuracy)

### Step 1: Extract Main WEL Table

Download EH40 PDF from: https://www.hse.gov.uk/pubns/priced/eh40.pdf

The main table typically contains columns:
- Substance name
- CAS number
- 8-hr TWA (ppm and mg/m³)
- 15-min STEL (ppm and mg/m³)
- Notations (Sk, Sen, Carc, etc.)
- Comments

### Step 2: Create SQL INSERT Statements

```sql
-- Example entries from EH40
INSERT INTO public.eh40_exposure_limits (
    substance_name, cas_number,
    long_term_limit_8hr_twa_ppm, long_term_limit_8hr_twa_mgm3,
    short_term_limit_15min_ppm, short_term_limit_15min_mgm3,
    sk, sen, carc, mut, repr, resp, asthmagen,
    notes, eh40_edition
) VALUES

-- Acetone
('Acetone', '67-64-1', 500, 1210, 1500, 3620, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'EH40/2023'),

-- Benzene (Carcinogen)
('Benzene', '71-43-2', 1, 3.25, NULL, NULL, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Carcinogen - strict control required', 'EH40/2023'),

-- Toluene (Skin notation)
('Toluene', '108-88-3', 50, 191, 100, 384, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Sk notation - can be absorbed through skin', 'EH40/2023'),

-- Isocyanates (Respiratory sensitiser)
('Isocyanates, all (as -NCO)', NULL, 0.02, 0.07, NULL, NULL, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Respiratory sensitiser - can cause occupational asthma', 'EH40/2023'),

-- Lead and inorganic compounds (Biological monitoring)
('Lead and inorganic compounds (as Pb)', '7439-92-1', NULL, 0.15, NULL, NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Biological monitoring required', 'EH40/2023');
```

### Step 3: Add Synonyms

```sql
-- Get the ID of the substance first
DO $$
DECLARE
    acetone_id UUID;
    benzene_id UUID;
BEGIN
    SELECT id INTO acetone_id FROM public.eh40_exposure_limits WHERE cas_number = '67-64-1';
    SELECT id INTO benzene_id FROM public.eh40_exposure_limits WHERE cas_number = '71-43-2';

    -- Add synonyms
    INSERT INTO public.eh40_synonyms (eh40_substance_id, synonym_name, synonym_type) VALUES
    (acetone_id, 'Propanone', 'Chemical name'),
    (acetone_id, 'Dimethyl ketone', 'Common name'),
    (acetone_id, '2-Propanone', 'IUPAC name'),

    (benzene_id, 'Benzol', 'Common name'),
    (benzene_id, 'Cyclohexatriene', 'Chemical name');
END $$;
```

### Step 4: Add Biological Monitoring Data

```sql
-- Get substance IDs
DO $$
DECLARE
    lead_id UUID;
    mercury_id UUID;
BEGIN
    SELECT id INTO lead_id FROM public.eh40_exposure_limits WHERE cas_number = '7439-92-1';
    SELECT id INTO mercury_id FROM public.eh40_exposure_limits WHERE cas_number = '7439-97-6';

    -- Add biological monitoring
    INSERT INTO public.eh40_biological_monitoring (
        eh40_substance_id, determinand, sampling_time,
        biological_guidance_value, biological_guidance_unit, notes
    ) VALUES
    (lead_id, 'Lead in blood', 'Not critical', 60, 'µg/100ml', 'Blood lead concentration - BGV 60 µg/100ml'),
    (lead_id, 'Zinc protoporphyrin', 'Not critical', 20, 'µmol/mol haem', 'Alternative to blood lead'),

    (mercury_id, 'Inorganic mercury in urine', 'Post-shift', 20, 'µmol/mol creatinine', 'Urine mercury - BGV 20 µmol/mol creatinine');
END $$;
```

---

## Option 2: AI-Assisted Extraction

### Use GPT-4o Vision to extract table data

```typescript
// Extract EH40 table from PDF
const extractEH40FromPDF = async (pdfFile: File) => {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('prompt', `
    Extract the Workplace Exposure Limits table from this EH40 document.

    For each substance, extract:
    1. Substance name
    2. CAS number
    3. 8-hour TWA (ppm and mg/m³)
    4. 15-minute STEL (ppm and mg/m³)
    5. Notations (Sk, Sen, Carc, Mut, Repr, Resp, Asthma)
    6. Any comments/notes

    Return as JSON array:
    [{
      "substance_name": "...",
      "cas_number": "...",
      "long_term_limit_8hr_twa_ppm": number or null,
      "long_term_limit_8hr_twa_mgm3": number or null,
      "short_term_limit_15min_ppm": number or null,
      "short_term_limit_15min_mgm3": number or null,
      "sk": boolean,
      "sen": boolean,
      "carc": boolean,
      "notes": "..."
    }]
  `);

  const response = await fetch('/api/vision', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

---

## Key Substances to Include (Priority List)

### Common Solvents:
- Acetone
- Ethanol
- Isopropanol (IPA)
- Methanol
- Toluene (Sk)
- Xylene (Sk)
- White spirit
- MEK (Methyl ethyl ketone)

### Hazardous Substances:
- Benzene (Carc, Sk)
- Lead compounds (BioMon)
- Mercury compounds (BioMon)
- Chromium VI compounds (Carc, BioMon)
- Cadmium compounds (Carc, BioMon)
- Asbestos (Carc)

### Sensitisers:
- Isocyanates (Resp, Asthma)
- Epoxy resins (Sen)
- Latex (Sen, Asthma)
- Wood dust (Resp, Carc)
- Flour dust (Resp, Asthma)

### Gases:
- Carbon monoxide
- Carbon dioxide
- Hydrogen sulfide
- Ammonia
- Chlorine

---

## Verification Checklist

After loading data, verify:

```sql
-- Count total substances
SELECT COUNT(*) FROM eh40_exposure_limits;
-- Should be ~500-600 substances from EH40/2023

-- Check substances with skin notation
SELECT COUNT(*) FROM eh40_exposure_limits WHERE sk = TRUE;

-- Check substances requiring biological monitoring
SELECT COUNT(DISTINCT eh40_substance_id) FROM eh40_biological_monitoring;

-- Check synonym coverage
SELECT
    COUNT(DISTINCT el.id) as substances_with_synonyms,
    COUNT(*) as total_synonyms
FROM eh40_synonyms s
JOIN eh40_exposure_limits el ON s.eh40_substance_id = el.id;

-- Test search functionality
SELECT * FROM eh40_exposure_limits WHERE substance_name ILIKE '%acetone%';
SELECT * FROM eh40_synonyms WHERE synonym_name ILIKE '%propanone%';
```

---

## Sample Seed File Structure

Create `/supabase/seed_eh40_data.sql`:

```sql
-- Clear existing data
TRUNCATE TABLE eh40_biological_monitoring CASCADE;
TRUNCATE TABLE eh40_synonyms CASCADE;
TRUNCATE TABLE eh40_exposure_limits CASCADE;

-- Insert main exposure limits
INSERT INTO public.eh40_exposure_limits (...) VALUES
(...),
(...),
-- ... hundreds of entries

-- Insert synonyms (using CTEs to reference substance IDs)
WITH substance_refs AS (
    SELECT id, substance_name, cas_number FROM eh40_exposure_limits
)
INSERT INTO public.eh40_synonyms (eh40_substance_id, synonym_name, synonym_type)
SELECT s.id, syn.name, syn.type FROM substance_refs s
CROSS JOIN LATERAL (VALUES
    -- Acetone synonyms
    (SELECT id FROM substance_refs WHERE cas_number = '67-64-1', 'Propanone', 'Chemical name'),
    (SELECT id FROM substance_refs WHERE cas_number = '67-64-1', 'Dimethyl ketone', 'Common name'),
    -- ... more synonyms
) AS syn(id, name, type)
WHERE s.id = syn.id;

-- Insert biological monitoring
-- ... similar pattern
```

---

## Integration with COSHH Assessment

Once EH40 data is loaded, use in risk assessment:

```typescript
import { getEH40ByCAS, getEH40ControlRequirements } from '@/lib/db/eh40-limits';

// When processing SDS
const chemical = await processSDSFile(sdsFile);

// Look up EH40 data
const eh40 = await getEH40ByCAS(chemical.cas_number);

if (eh40) {
  // Add to COSHH assessment
  assessment.exposure_limits = {
    ...eh40,
    formatted: formatExposureLimit(eh40),
  };

  // Check if additional controls needed
  const controls = await getEH40ControlRequirements(chemical.cas_number);

  if (controls.requiresBiologicalMonitoring) {
    assessment.biological_monitoring_required = true;
    assessment.biological_monitoring_guidance = eh40.biological_monitoring;
  }

  if (controls.skinAbsorption) {
    assessment.additional_controls.push('Skin protection mandatory - substance can be absorbed through skin');
  }

  if (controls.carcinogen) {
    assessment.risk_level = 'Very High';
    assessment.additional_controls.push('Carcinogen - strict control required, consider substitution');
  }
}
```
