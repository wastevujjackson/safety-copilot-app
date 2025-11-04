# Task-Based Risk Scoring Implementation

## Overview

This implementation provides a complete workflow for COSHH risk assessment with task-level granularity:

1. **SDS Upload** → Extract H/P codes → Populate chemical hazards
2. **Process Definition** → Define steps and tasks → Assign chemicals to tasks
3. **Risk Scoring** → Calculate severity (DB) + likelihood (AI) → Generate 5×5 matrix per task

---

## Architecture

### Database Schema

#### Tables Created:
1. **`process_steps`** - Workflow stages in COSHH assessment
2. **`tasks`** - Individual tasks within process steps
3. **`task_risk_scoring`** - Risk assessment results per task

#### Key Features:
- ✅ Full RLS (Row Level Security) - users only see their own data
- ✅ Cascading deletes - removing a process step removes all tasks and risk scores
- ✅ JSONB storage for chemicals_involved - flexible chemical data
- ✅ Foreign key constraints to COSHH assessments

**File**: `/supabase/process_steps_and_tasks.sql`

---

## Workflow

### Phase 1: SDS Upload & Chemical Data Population

```typescript
import { processMultipleSDSFiles } from '@/lib/sds-extraction';

// Upload one or more SDS files
const sdsFiles = [...]; // File[] from file input
const chemicals = await processMultipleSDSFiles(sdsFiles);

// Result for each chemical:
{
  chemical_name: "Acetone",
  cas_number: "67-64-1",
  h_codes: ["H225", "H319", "H336"],
  p_codes: ["P210", "P280", "P305+P351+P338"],

  // Full descriptions from database
  h_phrases: [
    { code: "H225", description: "Highly flammable liquid and vapour", ... }
  ],
  p_phrases: [
    { code: "P210", description: "Keep away from heat...", ... }
  ],

  // Auto-populated control measures from P-phrases
  control_measures: {
    operational_controls: ["Keep away from heat..."],
    ppe: ["Wear protective gloves..."],
    first_aid: { ... },
    fire: { ... },
    spill: { ... },
    storage: [...],
    handling: [...],
    disposal: [...],
  }
}
```

**What Gets Auto-Populated**:
- ✅ Section 3: Chemicals & Hazards (H-phrases)
- ✅ Section 5: Operational Controls (P-phrases)
- ✅ Section 6: PPE Requirements (P-phrases)
- ✅ Section 10: First Aid (P-phrases)
- ✅ Section 11: Fire Response (P-phrases)
- ✅ Section 12: Environment/Spill (P-phrases)
- ✅ Section 13: Storage & Handling (P-phrases)

**NOT Auto-Populated** (needs task context):
- ❌ Section 4: Risk Scoring

---

### Phase 2: Process Steps & Tasks Definition

```typescript
import { createProcessStep, createTask } from '@/lib/db/process-steps';

// 1. Create process steps
const step1 = await createProcessStep({
  assessment_id: "...",
  step_number: 1,
  step_name: "Preparation",
  description: "Mixing chemicals in vessel"
});

// 2. Create tasks within the step
const task1 = await createTask({
  process_step_id: step1.id,
  task_order: 1,
  task_type: "Decanting",
  task_name: "Pour Acetone into vessel",

  // Task context (used by AI for likelihood assessment)
  duration: "10 minutes",
  frequency: "Once per shift",
  environment: "Well-ventilated area with fume hood",
  existing_controls: ["PPE (gloves, goggles)", "Fume hood"],

  // Chemicals involved in THIS task
  chemicals_involved: [
    {
      id: "chem-1",
      name: "Acetone",
      cas_number: "67-64-1",
      h_codes: ["H225", "H319", "H336"],
      p_codes: ["P210", "P280", "P305+P351+P338"],
      physical_state: "Liquid",
      volatility: "High",
      concentration: "100%",
      quantity_used: "500ml"
    }
  ]
});
```

---

### Phase 3: Risk Scoring (Per Task)

```typescript
import { calculateTaskRiskAssessment } from '@/lib/risk-scoring';
import { upsertTaskRiskScoring } from '@/lib/db/process-steps';

// Calculate risk for a specific task
const riskResult = await calculateTaskRiskAssessment(task1);

// Result:
{
  inhalation: {
    severity: 3,        // From H336 (May cause drowsiness) in database
    likelihood: 4,      // From AI: "High volatility + pouring = high vapor exposure"
    riskScore: 12,      // 3 × 4 = 12 (HIGH RISK)
    rationale: "Acetone is highly volatile. Pouring generates significant vapor..."
  },
  ingestion: {
    severity: 0,        // No ingestion hazard in H-codes
    likelihood: 0,
    riskScore: 0,
    rationale: "Not applicable - no ingestion hazard"
  },
  skinEye: {
    severity: 3,        // From H319 (Eye irritation)
    likelihood: 3,      // From AI: "Possible splashing during pouring"
    riskScore: 9,       // 3 × 3 = 9 (MEDIUM RISK)
    rationale: "Splashing risk during pouring. Eye protection mandatory."
  },
  overallRiskLevel: "High",  // Based on max risk score (12)
  maxRiskScore: 12,
  additionalControlsRequired: [
    "Use closed transfer system to reduce vapor exposure",
    "Increase local exhaust ventilation rate",
    "Mandatory RPE (organic vapor filters) for this task"
  ]
}

// Save to database
await upsertTaskRiskScoring({
  task_id: task1.id,
  inhalation_severity: 3,
  inhalation_likelihood: 4,
  inhalation_risk: 12,
  ingestion_severity: 0,
  ingestion_likelihood: 0,
  ingestion_risk: 0,
  skin_eye_severity: 3,
  skin_eye_likelihood: 3,
  skin_eye_risk: 9,
  overall_risk_level: "High",
  max_risk_score: 12,
  inhalation_rationale: "...",
  skin_eye_rationale: "...",
  additional_controls_required: [...],
  assessed_at: new Date().toISOString(),
  assessed_by_ai: true,
});
```

---

## How It Works

### Severity Calculation (Automatic from Database)

```typescript
// For a task with chemicals: [Acetone, Toluene]
const allHCodes = ["H225", "H319", "H336", "H304", "H315", "H361d"];

// Query database for severity scores
const severity = await calculateExposureSeverities(allHCodes);
// Returns: { inhalation: 5, ingestion: 4, skinEye: 3, other: 4 }

// Takes MAXIMUM severity across all chemicals
```

**Database Lookup** (`h_phrases` table):
- H225 → `inhalation_severity: 3, skin_eye_severity: 2, other_severity: 4`
- H304 → `inhalation_severity: 5, ingestion_severity: 4`
- H336 → `inhalation_severity: 3`

**Result**: `{ inhalation: 5, ingestion: 4, skinEye: 3 }`

---

### Likelihood Assessment (AI-Powered)

AI considers:
- ✅ **Task type** (Spraying vs Wiping has different exposure)
- ✅ **Chemical properties** (Volatility, physical state)
- ✅ **Duration** (5 min vs 8 hours)
- ✅ **Frequency** (Once per week vs continuous)
- ✅ **Environment** (Enclosed space vs outdoor)
- ✅ **Existing controls** (Fume hood, PPE, ventilation)

**Example AI Response**:
```json
{
  "inhalation_likelihood": 4,
  "inhalation_rationale": "Spraying generates fine aerosol. High volatility of acetone. Limited ventilation in booth (6 ACH). Despite RPE, significant vapor exposure expected during 30-minute spray cycle.",

  "skinEye_likelihood": 2,
  "skinEye_rationale": "Full face shield and chemical-resistant suit minimize exposure. Splashing unlikely with controlled spray gun. Good PPE compliance reduces likelihood.",

  "additional_controls_needed": [
    "Upgrade booth ventilation to 10 ACH minimum",
    "Use supplied-air respirator (SAR) instead of filtered RPE",
    "Implement rotation to limit individual exposure to 15 minutes"
  ]
}
```

---

## Risk Matrix (5×5)

| Risk Score | Risk Level | Color    | Action Required |
|-----------|------------|----------|-----------------|
| 15-25     | Very High  | Red      | Stop work immediately. Implement controls before proceeding. |
| 10-14     | High       | Orange   | Additional controls required. Review before proceeding. |
| 5-9       | Medium     | Yellow   | Monitor and review controls. |
| 1-4       | Low        | Green    | Standard controls adequate. |
| 0         | N/A        | Gray     | Not applicable to this route. |

---

## Section 4: Risk Scoring Table Output

```
SECTION 4: EXPOSURE ROUTES & RISK SCORING (5×5 Matrix)

Process Step 1: Preparation
┌─────────────────────────────────────────────────────────────────────────┐
│ TASK 1: Decanting Acetone (500ml)                                       │
│ Chemicals: Acetone (H225, H319, H336)                                   │
│ Duration: 10 min | Frequency: Once per shift | Environment: Fume hood  │
├─────────────────────┬──────────┬────────────┬──────────┬───────────────┤
│ Exposure Route      │ Severity │ Likelihood │ Risk (S×L)│ Risk Level   │
├─────────────────────┼──────────┼────────────┼──────────┼───────────────┤
│ Inhalation          │    3     │     4      │    12    │ 🔴 High       │
│ Ingestion           │    0     │     0      │     0    │ ⚪ N/A        │
│ Skin/Eye Contact    │    3     │     3      │     9    │ 🟡 Medium     │
└─────────────────────┴──────────┴────────────┴──────────┴───────────────┘

Rationale:
• Inhalation: High volatility + pouring = significant vapor exposure
• Skin/Eye: Splashing risk during pouring. Eye protection mandatory.

Additional Controls Required:
✓ Use closed transfer system to reduce vapor exposure
✓ Increase local exhaust ventilation rate
✓ Mandatory RPE (organic vapor filters) for this task

───────────────────────────────────────────────────────────────────────────

Process Step 2: Application
┌─────────────────────────────────────────────────────────────────────────┐
│ TASK 2: Spray application of coating                                    │
│ Chemicals: Acetone (H225, H319, H336), Toluene (H225, H304, H315, H361d)│
│ Duration: 30 min | Frequency: Daily | Environment: Spray booth          │
├─────────────────────┬──────────┬────────────┬──────────┬───────────────┤
│ Exposure Route      │ Severity │ Likelihood │ Risk (S×L)│ Risk Level   │
├─────────────────────┼──────────┼────────────┼──────────┼───────────────┤
│ Inhalation          │    5     │     5      │    25    │ 🔴 Very High  │
│ Ingestion           │    4     │     1      │     4    │ 🟢 Low        │
│ Skin/Eye Contact    │    3     │     2      │     6    │ 🟡 Medium     │
└─────────────────────┴──────────┴────────────┴──────────┴───────────────┘

Rationale:
• Inhalation: Spraying generates fine aerosol. Toluene aspiration hazard (H304).
• Skin/Eye: Full PPE reduces contact likelihood despite spraying.

⚠️ VERY HIGH RISK - STOP: Work cannot proceed until controls implemented

Additional Controls Required:
✓ Mandatory supplied-air respirator (SAR) - filtered RPE inadequate
✓ Upgrade booth ventilation to 10 ACH minimum
✓ Implement rotation to limit exposure to 15 minutes per person
✓ Medical surveillance program for toluene exposure
✓ Air monitoring during spraying operations
```

---

## Files Created

### Database:
- `/supabase/process_steps_and_tasks.sql` - Schema for process steps, tasks, risk scoring

### TypeScript:
- `/src/types/process-steps.ts` - Types for ProcessStep, Task, TaskRiskScoring
- `/src/lib/db/process-steps.ts` - CRUD functions for database
- `/src/lib/risk-scoring.ts` - Risk calculation (severity from DB + likelihood from AI)
- `/src/lib/sds-extraction.ts` - SDS upload, code extraction, auto-population

---

## Next Steps

1. **Run database migration**: `supabase/process_steps_and_tasks.sql`
2. **Create UI components**:
   - Process step builder
   - Task definition form
   - Chemical assignment interface
   - Risk scoring display (5×5 matrix)
3. **Update COSHHFormPreview** to show task-by-task risk scoring
4. **Add workflow**: SDS Upload → Process Definition → Risk Scoring → Report Generation

---

## Benefits

✅ **Task-level granularity** - Different tasks with same chemical have different risk scores
✅ **Context-aware** - AI considers duration, environment, controls
✅ **Database-driven severity** - No AI hallucination on hazard data
✅ **Auto-populated controls** - P-phrases map directly to COSHH sections
✅ **Scalable** - Works for 1 chemical or 100 chemicals
✅ **Audit trail** - All risk assessments stored with rationale
✅ **Regulatory compliant** - Meets COSHH requirements for task-based assessment
