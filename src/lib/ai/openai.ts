import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SDSExtractionResult {
  chemicalName: string;
  casNumber?: string;
  supplier?: string;
  productCode?: string;
  hazards: Array<{
    type: string;
    hazardClass: string;
    pictogram?: string;
    signalWord?: string;
  }>;
  physicalProperties?: {
    appearance?: string;
    odour?: string;
    pH?: string;
    flashPoint?: string;
  };
  exposureLimits?: Array<{
    substance: string;
    welLongTerm?: string;
    welShortTerm?: string;
    source: string;
  }>;
  firstAid?: string;
  storageRequirements?: string;
  disposalGuidance?: string;
  rawText?: string;
}

/**
 * Extract data from SDS document using GPT-4o Vision
 */
export async function extractSDSData(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<SDSExtractionResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert Occupational Hygienist specializing in COSHH assessments.
Extract key information from Safety Data Sheets (SDS) following UK HSE guidelines.

Extract the following information:
1. Chemical/Product name
2. CAS number(s)
3. Supplier information
4. Hazard classifications and pictograms
5. Physical properties (appearance, odour, pH, flash point)
6. Workplace Exposure Limits (WEL) - both long-term (8hr TWA) and short-term (15min)
7. First aid measures
8. Storage requirements
9. Disposal guidance

Return structured JSON data only.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all relevant COSHH data from this SDS document. Focus on hazards, exposure limits, and control measures.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for accuracy
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content) as SDSExtractionResult;
}

/**
 * Generate chat response for COSHH assessment conversation
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Generate structured COSHH assessment data
 */
export async function generateCOSHHAssessment(
  sdsData: SDSExtractionResult,
  conversationData: any
): Promise<any> {
  const systemPrompt = `You are an expert Occupational Hygienist creating a COSHH assessment.

Generate a comprehensive COSHH assessment following UK HSE guidance:
- Reference EH40 Workplace Exposure Limits
- Apply control hierarchy (elimination → substitution → engineering → admin → PPE)
- Calculate Assigned Protection Factors (APF) for respiratory hazards
- Specify health surveillance requirements where needed
- Include emergency procedures
- Set appropriate review dates (typically 12 months, or sooner for high risk)

Return structured JSON data that can be saved to the database.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a complete COSHH assessment based on this data:

SDS Information:
${JSON.stringify(sdsData, null, 2)}

Usage Information:
${JSON.stringify(conversationData, null, 2)}

Ensure the assessment includes:
1. Hazard identification
2. Risk assessment (likelihood × severity)
3. Control measures (following control hierarchy)
4. PPE requirements with APF calculations if respiratory hazard
5. Emergency procedures
6. Health surveillance requirements
7. Training needs
8. Review date`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}

/**
 * Validate control measures suggested by AI
 */
export async function validateControlMeasures(
  hazards: any[],
  proposedControls: string[]
): Promise<{ valid: boolean; feedback: string; suggestions?: string[] }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a senior Occupational Hygienist validating COSHH control measures.

Review the proposed controls against UK HSE guidance:
- Do they follow the control hierarchy?
- Are they adequate for the hazard level?
- Are there any critical gaps?
- Do they comply with COSHH regulations?

Be critical and cautious - err on the side of recommending additional controls.`,
      },
      {
        role: 'user',
        content: `Validate these control measures:

Hazards:
${JSON.stringify(hazards, null, 2)}

Proposed Controls:
${proposedControls.join('\n')}

Return JSON with:
- valid (boolean): Are the controls adequate?
- feedback (string): Critical review
- suggestions (array): Additional controls to consider`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}

export default openai;
