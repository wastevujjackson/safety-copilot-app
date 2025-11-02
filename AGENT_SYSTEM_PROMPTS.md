# Agent System Prompts & Customization

## Overview

Each AI agent in Safety Copilot uses **system prompts** to define their behavior, personality, and strict operational guidelines. These prompts are managed by the platform owner through the admin dashboard.

## How System Prompts Work with OpenAI

### System Prompt Structure

OpenAI's chat models accept three types of messages:
1. **System** - Sets the behavior and guidelines for the AI
2. **User** - The user's input
3. **Assistant** - The AI's responses

### Example for COSHH Agent

```typescript
const messages = [
  {
    role: 'system',
    content: `You are a COSHH Assessment Assistant for Safety Copilot.

STRICT GUIDELINES:
- Always follow UK HSE regulations and COSHH ACOP L5
- Never suggest eliminating PPE as a control measure
- Always apply the hierarchy of controls in order:
  1. Elimination
  2. Substitution
  3. Engineering controls
  4. Administrative controls
  5. PPE (last resort)
- Validate all WEL (Workplace Exposure Limits) against EH40
- Calculate APF (Assigned Protection Factor) requirements accurately
- Flag any substance requiring health surveillance

PERSONALITY:
- Professional but friendly
- Patient and thorough
- Safety-focused
- Clear and concise communication

CURRENT STEP: ${currentStep}
TASK: ${taskDescription}`
  },
  {
    role: 'user',
    content: 'I need to create a COSHH assessment for acetone'
  }
];
```

## Benefits of System Prompt Customization

### 1. **Consistency Across All Users**
All companies using the COSHH agent get the same high-quality, regulation-compliant advice.

### 2. **Platform-Wide Updates**
The owner can update agent behavior instantly for all users by modifying the system prompt.

### 3. **Quality Control**
Ensures agents follow best practices and legal requirements without user intervention.

### 4. **Brand Voice**
Maintain Safety Copilot's professional, safety-first tone across all interactions.

## Owner Dashboard - Agent Management

### Proposed Features

#### 1. **Agent System Prompt Editor**
```
Location: /dashboard/owner/agents/[agentId]/prompts

Features:
- Rich text editor for system prompt
- Version history (track all changes)
- A/B testing (compare prompt versions)
- Validation warnings (check for common issues)
- Preview mode (test prompts before deployment)
```

#### 2. **Agent Configuration**
```typescript
interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number; // 0-1, controls randomness
  maxTokens: number;
  model: 'gpt-4o' | 'gpt-4o-mini';
  guidelines: {
    regulations: string[]; // e.g., ['UK HSE COSHH', 'EH40']
    strictRules: string[]; // Non-negotiable requirements
    recommendations: string[]; // Suggested best practices
  };
  workflowSteps: WorkflowStep[];
  validationRules: ValidationRule[];
}
```

#### 3. **Step-Specific Prompts**
Each workflow step can have its own focused prompt:

```typescript
const stepPrompts = {
  upload_sds: `Extract the following from the SDS:
    - Chemical name and CAS number
    - Supplier information
    - Hazard pictograms
    - H-phrases
    - WEL values (long-term and short-term)

    Validate against EH40 database.`,

  confirm_sds: `Review extracted data with user.
    Ask for corrections if anything seems incorrect.`,

  usage_details: `Collect comprehensive usage information:
    - How is the substance used?
    - Who is exposed?
    - Substance form (solid/liquid/gas)
    - Quantity used
    - Frequency and duration

    IMPORTANT: Be thorough - this affects risk assessment.`,

  // ... more steps
};
```

## Implementation Plan

### Phase 1: Basic System Prompts
- Hardcoded prompts in workflow file
- Single prompt per agent
- No customization UI

### Phase 2: Database-Stored Prompts
- Move prompts to database (`agent_system_prompts` table)
- Owner can edit via admin panel
- Version control for prompt changes
- Rollback capability

### Phase 3: Advanced Features
- A/B testing different prompts
- Analytics on prompt performance
- Auto-optimization suggestions
- Multi-language support

## Database Schema

```sql
-- Agent system prompts
CREATE TABLE agent_system_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  prompt_text TEXT NOT NULL,
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  model TEXT DEFAULT 'gpt-4o-mini',
  guidelines JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT false,
  performance_metrics JSONB,
  UNIQUE(agent_id, version)
);

-- Step-specific prompts
CREATE TABLE agent_step_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, step_name)
);

-- Prompt performance tracking
CREATE TABLE prompt_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES agent_system_prompts(id),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Example: COSHH Agent Guidelines

### Strict Rules (Non-Negotiable)
```
1. Always follow UK HSE COSHH Regulations 2002 (as amended)
2. Reference COSHH ACOP L5 for all assessments
3. Validate WEL values against EH40/2005
4. Never recommend eliminating PPE without adequate engineering controls
5. Flag substances requiring health surveillance
6. Calculate APF requirements for respiratory protection
7. Ensure elimination/substitution is always considered first
8. Apply hierarchy of controls in correct order
9. Include emergency procedures for all substances
10. Set review dates to 12 months maximum
```

### Best Practices (Recommended)
```
- Suggest local exhaust ventilation where appropriate
- Recommend exposure monitoring for high-risk substances
- Provide specific PPE recommendations with standards
- Include method statements for high-risk activities
- Link control measures to specific exposure routes
- Document training requirements
- Reference manufacturer SDS information
```

### Validation Rules
```
- WEL values must match EH40 database
- APF calculations must be mathematically correct
- All hazard pictograms must be from GHS system
- Risk ratings must follow standard matrix
- Review dates cannot exceed 12 months
- Emergency contacts must include phone numbers
```

## Future Enhancements

### 1. **Agent Marketplace**
Allow other safety consultants to create and sell custom agents with their own prompts.

### 2. **Company-Specific Customization**
Let companies customize agent behavior for their specific needs (while maintaining safety standards).

### 3. **Regulatory Updates**
Automatically update prompts when regulations change.

### 4. **AI Training Data**
Use successful assessments to improve agent responses over time.

### 5. **Multi-Agent Collaboration**
Allow agents to consult with each other (e.g., COSHH agent asks Fire Risk agent about flammable substances).

## Security Considerations

### Prompt Injection Protection
```typescript
// Sanitize user input before sending to AI
function sanitizeInput(input: string): string {
  // Remove potential prompt injection attempts
  return input
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/\[INST\]/gi, '')
    .trim();
}
```

### Access Control
- Only platform owners can modify system prompts
- Changes are logged and versioned
- Rollback capability for problematic prompts
- Review process before deployment

## Cost Management

### Token Optimization
```typescript
// Estimate token usage for cost control
const estimatedTokens =
  systemPrompt.length / 4 + // System prompt
  conversationHistory.length * 100 + // Average message length
  2000; // Max response tokens

if (estimatedTokens > 10000) {
  // Summarize conversation history
  conversationHistory = summarizeHistory(conversationHistory);
}
```

### Model Selection
- GPT-4o: High-quality, expensive (~$2.50/1M tokens)
- GPT-4o-mini: Good quality, cost-effective (~$0.15/1M tokens)
- Use mini for most tasks, reserve full GPT-4o for complex assessments

## Summary

System prompts are the foundation of Safety Copilot's AI agents. They ensure:
- ✅ Regulatory compliance
- ✅ Consistent quality
- ✅ Platform-wide control
- ✅ Easy updates and improvements
- ✅ Safety-first approach

The owner dashboard will provide complete control over agent behavior while maintaining the high standards users expect from Safety Copilot.
