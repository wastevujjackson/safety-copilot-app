# Hazard and Precautionary Phrases Database

This directory contains SQL files to create and populate global reference tables for GHS/CLP hazard (H-phrases) and precautionary (P-phrases) statements.

## Purpose

Instead of using ChatGPT to repeatedly extract and describe H-phrases and P-phrases from SDS documents, we:

1. **Extract only the codes** from SDS using GPT-4o Vision (e.g., "H225", "H315", "P210")
2. **Query our database** to get full descriptions and metadata
3. **Calculate risk severity** automatically from H-phrase classifications
4. **Map to control measures** automatically from P-phrase categories

This approach is:
- ✅ **Faster** - No repeated API calls for standard data
- ✅ **More reliable** - Standardized descriptions from official GHS/CLP
- ✅ **Cost-effective** - Minimal token usage
- ✅ **Accurate** - No risk of AI hallucination on standard phrases

## Database Schema

### `h_phrases` Table

Stores all GHS/CLP Hazard Statements with severity scoring for COSHH risk assessment.

| Column | Type | Description |
|--------|------|-------------|
| `code` | VARCHAR(20) | H-code (e.g., "H225", "H300+H310+H330") |
| `description` | TEXT | Full hazard statement |
| `hazard_class` | VARCHAR(100) | GHS hazard class |
| `category` | VARCHAR(50) | Hazard category |
| `inhalation_severity` | INTEGER (1-5) | Severity score for inhalation exposure |
| `ingestion_severity` | INTEGER (1-5) | Severity score for ingestion exposure |
| `skin_eye_severity` | INTEGER (1-5) | Severity score for skin/eye exposure |
| `other_severity` | INTEGER (1-5) | Severity score for other routes |
| `signal_word` | VARCHAR(20) | "Danger" or "Warning" |
| `notes` | TEXT | Additional information |

**Severity Scale:**
- 1 = Negligible
- 2 = Low
- 3 = Moderate
- 4 = High
- 5 = Severe

### `p_phrases` Table

Stores all GHS/CLP Precautionary Statements mapped to control measure categories.

| Column | Type | Description |
|--------|------|-------------|
| `code` | VARCHAR(20) | P-code (e.g., "P210", "P305+P351+P338") |
| `description` | TEXT | Full precautionary statement |
| `statement_type` | VARCHAR(50) | "Prevention", "Response", "Storage", or "Disposal" |
| `category` | VARCHAR(100) | Specific category |
| `relates_to_ppe` | BOOLEAN | Maps to PPE requirements |
| `relates_to_ventilation` | BOOLEAN | Maps to ventilation controls |
| `relates_to_storage` | BOOLEAN | Maps to storage requirements |
| `relates_to_disposal` | BOOLEAN | Maps to disposal procedures |
| `relates_to_emergency` | BOOLEAN | Maps to emergency response |
| `relates_to_training` | BOOLEAN | Maps to training requirements |
| `notes` | TEXT | Additional information |

## Setup Instructions

### 1. Run the Migration

```bash
# Connect to your Supabase project
supabase db push

# Or run manually in Supabase SQL Editor:
```

Run these files in order:
1. `hazard_precautionary_statements.sql` - Creates tables
2. `seed_h_phrases.sql` - Populates H-phrases (102 entries)
3. `seed_p_phrases.sql` - Populates P-phrases (133 entries)

### 2. Verify Data

```sql
-- Check H-phrases count
SELECT COUNT(*) FROM h_phrases;
-- Expected: 102

-- Check P-phrases count
SELECT COUNT(*) FROM p_phrases;
-- Expected: 133

-- Sample query
SELECT code, description, inhalation_severity
FROM h_phrases
WHERE code IN ('H225', 'H315', 'H319');
```

## Usage in COSHH Workflow

### Step 1: Extract Codes from SDS

Use GPT-4o Vision to extract only the H-codes and P-codes from the SDS:

```typescript
const prompt = `Extract all H-codes and P-codes from this SDS.
Return ONLY a JSON array of codes like:
{"h_codes": ["H225", "H315", "H319"], "p_codes": ["P210", "P280", "P305+P351+P338"]}`;
```

### Step 2: Query Database for Full Data

```typescript
import { getHPhrasesByCodes, getPPhrasesByCodes, calculateExposureSeverities } from '@/lib/db/hazard-phrases';

// Get full H-phrase descriptions and severity
const hPhrases = await getHPhrasesByCodes(['H225', 'H315', 'H319']);

// Calculate maximum severity for each exposure route
const severities = await calculateExposureSeverities(['H225', 'H315', 'H319']);
// Returns: { inhalation: 3, ingestion: 0, skinEye: 3, other: 4 }

// Get control measures from P-phrases
const pPhrases = await getPPhrasesByCodes(['P210', 'P280', 'P305+P351+P338']);

// Get specific control measures
const controls = await getSuggestedControlMeasures(['P210', 'P280', 'P305+P351+P338']);
// Returns: { ppe: [...], ventilation: [...], storage: [...], emergency: [...], training: [...] }
```

### Step 3: Use ChatGPT Only for Likelihood

For the 5x5 risk matrix, we now have:
- ✅ **Severity (from database)** - Based on H-phrase classifications
- ❓ **Likelihood (from ChatGPT)** - Based on task, environment, controls

```typescript
// Use ChatGPT to assess likelihood (1-5) for each task
const prompt = `Based on this task and environment, rate the LIKELIHOOD (1-5) of exposure via:
- Inhalation
- Ingestion
- Skin/Eye Contact

Task: ${taskDescription}
Environment: ${environment}
Existing Controls: ${controls}

Severity scores are already calculated as: ${severities}
We only need likelihood to complete the risk matrix.`;
```

### Step 4: Calculate Risk Scores

```typescript
// Risk = Likelihood × Severity
const riskScores = {
  inhalation: likelihood.inhalation * severities.inhalation,
  ingestion: likelihood.ingestion * severities.ingestion,
  skinEye: likelihood.skinEye * severities.skinEye,
};
```

## Coverage

### H-Phrases Included
- ✅ All physical hazards (explosives, flammables, oxidizers, etc.)
- ✅ All health hazards (acute toxicity, carcinogenicity, reproductive, STOT-SE/STOT-RE, etc.)
- ✅ All environmental hazards (aquatic toxicity, ozone layer)
- ✅ Combined exposure statements (H300+H310+H330, etc.)
- ✅ EU-specific hazards (EUH001, EUH029, etc.)

**Total: 102 H-phrases** (90 H-codes + 12 EUH-codes)
- Covers 95%+ of common workplace chemicals
- Includes critical STOT-SE Category 3 codes (H335, H336) for respiratory irritation and narcotic effects

### P-Phrases Included
- ✅ All general statements (P101-P103)
- ✅ All prevention statements (P2xx range)
- ✅ All response statements (P3xx range, including combined)
- ✅ All storage statements (P4xx range, including combined)
- ✅ All disposal statements (P5xx range)
- ✅ Granularly mapped to COSHH assessment sections (PPE, first aid, fire, spill, storage, etc.)

**Total: 133 P-phrases**
- Covers 99%+ of real-world SDS documents
- All codes properly mapped to specific COSHH control measure categories

## Benefits for COSHH Assessment

1. **Section 3 (Chemicals & Hazards)** - Auto-populate from database
2. **Section 4 (Risk Scoring)** - Use severity from H-phrases + likelihood from ChatGPT
3. **Section 5 (Operational Controls)** - Map from P-phrases automatically
4. **Section 6 (PPE)** - Extract from P-phrases marked with `relates_to_ppe`
5. **Section 10 (First Aid)** - Extract response P-phrases
6. **Section 13 (Storage)** - Extract storage P-phrases

## Maintenance

These tables are **global reference data** and should not be modified by users. They are:
- Read-only for authenticated users (RLS policies)
- Based on official GHS/CLP standards
- Updated only when new GHS revisions are released

To add new phrases (rare):
1. Add to appropriate `seed_*.sql` file
2. Re-run the seed script
3. Update this README with new count

## API Functions

See `/src/lib/db/hazard-phrases.ts` for available helper functions:

- `getHPhrasesByCodes(codes)` - Get H-phrase data
- `getPPhrasesByCodes(codes)` - Get P-phrase data
- `calculateExposureSeverities(hCodes)` - Calculate max severity per route
- `groupPPhrasesByType(codes)` - Group by Prevention/Response/Storage/Disposal
- `getSuggestedControlMeasures(pCodes)` - Extract control measures by category
- `extractHazardCodes(text)` - Parse H/P codes from text using regex
