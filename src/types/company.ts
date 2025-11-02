// Subscription tier enum
export type SubscriptionTier = 'trial' | 'basic' | 'professional' | 'enterprise';

// Subscription status
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'past_due';

// Company interface
export interface Company {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  max_users: number;
  max_agents: number;
  billing_email: string | null;
  monthly_token_limit: number | null;
  total_spent: number;
  last_payment_date: Date | null;
  trial_ends_at: Date | null;
}

// Company with usage metrics
export interface CompanyWithMetrics extends Company {
  current_users: number;
  active_users: number;
  total_executions: number;
  total_tokens_this_month: number;
  total_cost_this_month: number;
}

// Company creation input
export interface CreateCompanyInput {
  name: string;
  billing_email?: string;
  subscription_tier?: SubscriptionTier;
  max_users?: number;
  max_agents?: number;
}

// Company update input
export interface UpdateCompanyInput {
  name?: string;
  billing_email?: string;
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
  max_users?: number;
  max_agents?: number;
  monthly_token_limit?: number;
}

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  trial: {
    max_users: 5,
    max_agents: 3,
    monthly_token_limit: 100000,
    trial_days: 14,
    price_monthly: 0,
  },
  basic: {
    max_users: 10,
    max_agents: 5,
    monthly_token_limit: 500000,
    trial_days: 0,
    price_monthly: 49,
  },
  professional: {
    max_users: 50,
    max_agents: 15,
    monthly_token_limit: 2000000,
    trial_days: 0,
    price_monthly: 199,
  },
  enterprise: {
    max_users: -1, // unlimited
    max_agents: -1, // unlimited
    monthly_token_limit: -1, // unlimited
    trial_days: 0,
    price_monthly: 999,
  },
} as const;

// Helper to get subscription limits
export function getSubscriptionLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_LIMITS[tier];
}

// Helper to check if company is within limits
export function isWithinLimits(
  company: CompanyWithMetrics,
  type: 'users' | 'tokens'
): boolean {
  const limits = getSubscriptionLimits(company.subscription_tier);

  if (type === 'users') {
    if (limits.max_users === -1) return true;
    return company.current_users < limits.max_users;
  }

  if (type === 'tokens') {
    if (limits.monthly_token_limit === -1) return true;
    return company.total_tokens_this_month < limits.monthly_token_limit;
  }

  return false;
}

// Helper to check if trial is expired
export function isTrialExpired(company: Company): boolean {
  if (company.subscription_tier !== 'trial') return false;
  if (!company.trial_ends_at) return false;
  return new Date() > new Date(company.trial_ends_at);
}
