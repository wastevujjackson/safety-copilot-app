# Chat Flow Updates for Process Hazards

## Summary

Updated the COSHH chat workflow to support **process-generated hazards** (welding fumes, wood dust, etc.) in addition to SDS-based chemicals.

## Changes Made

### 1. Workflow Types (`/src/lib/agents/coshh-workflow.ts`) ✅

**New workflow steps:**
- `select_hazard_source` - User chooses: SDS, Process Hazard, or Both
- `select_process_hazard` - Search and select from process hazards library
- `confirm_hazard` - Generic confirmation (replaces `confirm_sds`)

**New state fields:**
```typescript
export interface WorkflowState {
  hazardSource?: 'sds' | 'process' | 'both';
  processHazards?: ProcessGeneratedHazard[];
  awaitingAdditionalProcessHazard?: boolean;
  // ... existing fields
}
```

**Updated logic:**
- `getNextStep()` - Routes based on `hazardSource` selection
- `has InhalationHazard()` - Checks both SDS + process hazards
- `isStepComplete()` - Validates both hazard types
- `initializeWorkflow()` - Starts at `select_hazard_source` instead of `upload_sds`

### 2. Chat API Route Updates Needed (`/src/app/api/agents/[agentId]/chat/route.ts`)

#### Step 1: Add Process Hazard Imports

```typescript
import {
  searchProcessHazards,
  getProcessHazardByName,
  suggestProcessHazardsForTask,
  formatProcessHazard
} from '@/lib/db/process-hazards';
```

#### Step 2: Handle Hazard Source Selection

Add after line ~423 (handling "create/new" detection):

```typescript
// Handle hazard source selection
if (state.currentStep === 'select_hazard_source') {
  const msgLower = message.toLowerCase();

  if (msgLower.includes('1') || msgLower.includes('sds') || msgLower.includes('chemical product')) {
    state.hazardSource = 'sds';
    state.completedSteps.push('select_hazard_source');
    state.currentStep = 'upload_sds';
    workflowStates.set(stateKey, state);

    return NextResponse.json({
      message: "Great! Please upload the Safety Data Sheet (SDS) using the 📎 button below.",
      complete: false,
      step: state.currentStep,
    });
  } else if (msgLower.includes('2') || msgLower.includes('process') || msgLower.includes('welding') || msgLower.includes('dust') || msgLower.includes('fume')) {
    state.hazardSource = 'process';
    state.completedSteps.push('select_hazard_source');
    state.currentStep = 'select_process_hazard';
    workflowStates.set(stateKey, state);

    return NextResponse.json({
      message: "Let's identify the process-generated hazard.\n\n**Describe the work process:**\nFor example:\n- \"Welding stainless steel\"\n- \"Cutting hardwood\"\n- \"Grinding concrete\"\n\nWhat process generates the hazard?",
      complete: false,
      step: state.currentStep,
    });
  } else if (msgLower.includes('3') || msgLower.includes('both')) {
    state.hazardSource = 'both';
    state.completedSteps.push('select_hazard_source');
    state.currentStep = 'upload_sds';
    workflowStates.set(stateKey, state);

    return NextResponse.json({
      message: "Great! Let's start with the SDS. Please upload it using the 📎 button below.\n\nAfterwards, I'll help you identify the process hazards.",
      complete: false,
      step: state.currentStep,
    });
  }
}
```

#### Step 3: Handle Process Hazard Selection

Add after hazard source selection:

```typescript
// Handle process hazard search and selection
if (state.currentStep === 'select_process_hazard' && message) {
  const msgLower = message.toLowerCase();

  // Check if user is done adding process hazards
  if (state.awaitingAdditionalProcessHazard && msgLower.includes('no')) {
    state.awaitingAdditionalProcessHazard = false;
    state.completedSteps.push('select_process_hazard');
    state.currentStep = 'confirm_hazard';
    workflowStates.set(stateKey, state);

    const hazardCount = state.processHazards?.length || 0;
    const hazardNames = state.processHazards?.map(h => h.hazard_name).join(', ') || '';

    return NextResponse.json({
      message: `Perfect! This assessment will cover ${hazardCount} process hazard${hazardCount > 1 ? 's' : ''}: **${hazardNames}**.\n\nPlease confirm these are correct.`,
      complete: false,
      step: state.currentStep,
      workflowData: {
        processHazards: state.processHazards?.map(h => ({
          name: h.hazard_name,
          category: h.hazard_category,
          welLimit: h.wel_8hr_twa_mgm3 ? `${h.wel_8hr_twa_mgm3} mg/m³` : 'No WEL',
          isCarcinogen: h.is_carcinogen,
          isRespiratorySensitiser: h.is_respiratory_sensitiser,
          healthEffects: h.health_effects,
        }))
      }
    });
  }

  // Check if user wants to add another hazard
  if (state.awaitingAdditionalProcessHazard && msgLower.includes('yes')) {
    return NextResponse.json({
      message: "Please describe the next process hazard.",
      complete: false,
      step: state.currentStep,
    });
  }

  // Search for process hazards based on user description
  const suggestedHazards = await suggestProcessHazardsForTask(message);

  if (suggestedHazards.length === 0) {
    return NextResponse.json({
      message: `I couldn't find a matching process hazard for "${message}".\n\nPlease try describing it differently, or common examples:\n- Welding\n- Wood cutting/sanding\n- Stone/concrete cutting\n- Diesel vehicles indoors\n- Flour mixing`,
      complete: false,
      step: state.currentStep,
    });
  }

  // Present matches to user
  const hazardList = suggestedHazards.slice(0, 5).map((h, idx) => {
    const warnings = [];
    if (h.is_carcinogen) warnings.push('⚠️ Carcinogen');
    if (h.is_respiratory_sensitiser) warnings.push('⚠️ Resp. Sens.');
    if (h.is_asthmagen) warnings.push('⚠️ Asthma');

    return `${idx + 1}. **${h.hazard_name}**
   Category: ${h.hazard_category}
   WEL: ${h.wel_8hr_twa_mgm3 ? h.wel_8hr_twa_mgm3 + ' mg/m³' : 'No WEL'}
   ${warnings.length > 0 ? warnings.join(' ') : ''}`;
  }).join('\n\n');

  return NextResponse.json({
    message: `I found these matching hazards:\n\n${hazardList}\n\n**Which one best matches your process?** (Enter 1-${Math.min(5, suggestedHazards.length)})`,
    complete: false,
    step: state.currentStep,
    metadata: {
      suggestedHazards: suggestedHazards.slice(0, 5).map(h => h.id), // Store IDs for selection
    }
  });
}

// Handle user selecting a process hazard from list
if (state.currentStep === 'select_process_hazard' && message && /^[1-5]$/.test(message.trim())) {
  // User selected a number - retrieve from metadata (stored temporarily)
  // In production, store in workflow state or session
  const selectedIndex = parseInt(message.trim()) - 1;

  // For now, re-search and get the nth result (in production, use stored IDs)
  const previousMessage = previousMessages[previousMessages.length - 2]?.content || '';
  const matches = previousMessage.match(/Describe the work process.*?(?=Which one)/s);
  const processDescription = matches ? matches[0] : '';

  if (processDescription) {
    const hazards = await suggestProcessHazardsForTask(processDescription);
    const selectedHazard = hazards[selectedIndex];

    if (selectedHazard) {
      // Get full hazard details with control measures
      const fullHazard = await getProcessHazardByName(selectedHazard.hazard_name);

      if (fullHazard) {
        // Add to state
        if (!state.processHazards) {
          state.processHazards = [];
        }
        state.processHazards.push(fullHazard);
        state.awaitingAdditionalProcessHazard = true;
        workflowStates.set(stateKey, state);

        return NextResponse.json({
          message: `Added: **${fullHazard.hazard_name}**\n\n**Are there any other process hazards in this assessment?** (Yes/No)`,
          complete: false,
          step: state.currentStep,
        });
      }
    }
  }

  return NextResponse.json({
    message: "I couldn't find that selection. Please try describing the process again.",
    complete: false,
    step: state.currentStep,
  });
}
```

#### Step 4: Update SDS File Upload Handler

Change line ~351 from:
```typescript
state.currentStep = 'confirm_sds';
```

To:
```typescript
state.currentStep = 'confirm_hazard';
```

And update the confirmation message to ask about process hazards if `hazardSource === 'both'`:

```typescript
// After SDS extraction, check if we also need process hazards
if (state.hazardSource === 'both' && !state.processHazards) {
  confirmationMessage += `\n\n**Great! Now let's identify any process hazards.** Describe the work process (e.g., "Welding", "Cutting wood"):`;
}
```

#### Step 5: Update Confirmation Step

Replace all `confirm_sds` references with `confirm_hazard`:

Line ~468:
```typescript
if (state.currentStep === 'confirm_hazard' && !state.awaitingAdditionalSds && !state.awaitingAdditionalProcessHazard) {
  if (msgLower.includes('confirm') || msgLower.includes('yes') || msgLower.includes('correct')) {
    state.completedSteps.push('confirm_hazard');
    state.currentStep = 'usage_details';
  }
}
```

#### Step 6: Update Workflow Data Builder

Add process hazards to preview data (line ~816):

```typescript
// Add process hazards to workflowData
if (state.processHazards && state.processHazards.length > 0) {
  workflowData.processHazards = state.processHazards.map(hazard => ({
    name: hazard.hazard_name,
    category: hazard.hazard_category,
    physicalForm: hazard.physical_form,
    welLimit: hazard.wel_8hr_twa_mgm3 ? `${hazard.wel_8hr_twa_mgm3} mg/m³ (8-hr TWA)` : null,
    isCarcinogen: hazard.is_carcinogen,
    isRespiratorySensitiser: hazard.is_respiratory_sensitiser,
    isAsthmagen: hazard.is_asthmagen,
    healthEffects: hazard.health_effects,
    acuteEffects: hazard.acute_effects,
    targetOrgans: hazard.target_organs,
    // Get control measures
    controlMeasures: {
      operational: hazard.control_measures?.filter(c => c.relates_to_operational_controls).map(c => c.control_measure) || [],
      ventilation: hazard.control_measures?.filter(c => c.relates_to_ventilation).map(c => c.control_measure) || [],
      ppe: hazard.control_measures?.filter(c => c.relates_to_ppe).map(c => c.control_measure) || [],
      monitoring: hazard.control_measures?.filter(c => c.relates_to_monitoring).map(c => c.control_measure) || [],
      healthSurveillance: hazard.control_measures?.filter(c => c.relates_to_health_surveillance).map(c => c.control_measure) || [],
    }
  }));
}
```

## Testing Checklist

- [ ] Start chat → Shows 3 options (SDS, Process, Both)
- [ ] Select option 1 (SDS) → Prompts for SDS upload
- [ ] Select option 2 (Process) → Prompts for process description
- [ ] Select option 3 (Both) → Prompts for SDS first, then process
- [ ] Describe process hazard → Shows matching results from database
- [ ] Select hazard from list → Confirms selection, asks for more
- [ ] Add multiple process hazards → Tracks all in state
- [ ] Preview form shows process hazards with control measures
- [ ] Mixed SDS + process → Both appear in preview

## UI Updates Needed (Next Step)

The chat component already handles file uploads and text messages. No major UI changes needed, but consider:

1. **Visual indicators** for hazard type in preview (📄 SDS vs ⚙️ Process)
2. **Control measure sections** that merge P-phrases + process controls
3. **Health surveillance flags** that check both SDS H-phrases AND process hazard flags

## Database Prerequisites

Before testing, ensure these are run in Supabase:

```bash
# Schema
/supabase/process_generated_hazards.sql

# Seed data
/supabase/seed_process_hazards.sql
```

Verify with:
```sql
SELECT COUNT(*) FROM process_generated_hazards; -- Should be ~20
SELECT COUNT(*) FROM process_hazard_control_measures; -- Should be ~50+
```

## Example Conversation Flow

**User:** "Create new assessment"

**Bot:** "What type of hazard are you assessing?
1️⃣ Chemical product with SDS
2️⃣ Process-generated hazard (no SDS)
3️⃣ Both"

**User:** "2"

**Bot:** "Describe the work process:
- Welding stainless steel
- Cutting hardwood
..."

**User:** "Welding stainless steel"

**Bot:** "I found these matching hazards:

1. **Stainless steel welding fume**
   Category: Welding fumes
   WEL: 5 mg/m³
   ⚠️ Carcinogen ⚠️ Resp. Sens.

Which one best matches? (Enter 1)"

**User:** "1"

**Bot:** "Added: **Stainless steel welding fume**

Are there any other process hazards? (Yes/No)"

**User:** "No"

**Bot:** "Perfect! This assessment will cover 1 process hazard: **Stainless steel welding fume**.

Please confirm this is correct."

**User:** "Yes"

**Bot:** "Thank you for confirming. Let's understand how this hazard will be encountered.

What is the primary purpose or task? (e.g., fabrication, repairs)"

[Continue with existing usage_details flow...]
