import type { Permission } from './user';

// Agent category
export type AgentCategory =
  | 'risk_assessment'
  | 'incident_reporting'
  | 'compliance_check'
  | 'training'
  | 'audit'
  | 'emergency_response';

// Agent execution status
export type AgentExecutionStatus = 'success' | 'failed' | 'timeout' | 'cancelled';

// Agent context for initialization
export interface AgentContext {
  user_id: string;
  company_id: string;
  permissions: Permission[];
  settings?: Record<string, unknown>;
}

// Generic agent input
export interface AgentInput {
  data: Record<string, unknown>;
  options?: {
    use_cache?: boolean;
    timeout?: number;
    model_preference?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku';
  };
}

// Generic agent output
export interface AgentOutput {
  success: boolean;
  data: Record<string, unknown>;
  tokens_used?: {
    input: number;
    output: number;
    total: number;
  };
  cache_hit?: boolean;
  execution_time_ms?: number;
  error?: string;
}

// Base agent interface - all agents must implement this
export interface HealthSafetyAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  requiredPermissions: Permission[];

  // Core methods
  initialize(context: AgentContext): Promise<void>;
  execute(input: AgentInput): Promise<AgentOutput>;
  validate(input: unknown): input is AgentInput;

  // Lifecycle hooks
  onStart?(): Promise<void>;
  onComplete?(): Promise<void>;
  onError?(error: Error): Promise<void>;
}

// Agent execution record (database)
export interface AgentExecution {
  id: string;
  agent_id: string;
  company_id: string;
  user_id: string;
  tokens_input: number;
  tokens_output: number;
  tokens_total: number;
  cost_usd: number;
  cache_hit: boolean;
  execution_time_ms: number;
  status: AgentExecutionStatus;
  error_message: string | null;
  created_at: Date;
}

// Agent execution with input/output data
export interface AgentExecutionWithData extends AgentExecution {
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
}

// Agent registry for managing agents
export interface AgentRegistryEntry {
  agent: HealthSafetyAgent;
  enabled: boolean;
  company_ids?: string[]; // If set, only these companies can use it
}

// Agent statistics
export interface AgentStats {
  agent_id: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time_ms: number;
  total_tokens_used: number;
  total_cost_usd: number;
  cache_hit_rate: number;
  last_used: Date;
}

// Helper to calculate cost based on tokens
export function calculateTokenCost(
  tokens: number,
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku',
  type: 'input' | 'output'
): number {
  // Prices per 1k tokens (approximate, should be in config)
  const PRICES = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  };

  const pricePerToken = PRICES[model][type] / 1000;
  return tokens * pricePerToken;
}
