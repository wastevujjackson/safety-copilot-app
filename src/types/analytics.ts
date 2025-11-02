// Company usage metrics (daily aggregated)
export interface CompanyUsageMetrics {
  id: string;
  company_id: string;
  date: Date;
  total_executions: number;
  total_tokens: number;
  total_cost_usd: number;
  unique_users: number;
  unique_agents: number;
  cache_hit_rate: number;
  created_at: Date;
}

// Platform-wide metrics (daily aggregated)
export interface PlatformMetrics {
  id: string;
  date: Date;
  total_companies: number;
  active_companies: number;
  total_users: number;
  active_users: number;
  total_executions: number;
  total_revenue_usd: number;
  total_costs_usd: number;
  new_companies: number;
  churned_companies: number;
  created_at: Date;
}

// Real-time usage summary
export interface UsageSummary {
  period: 'day' | 'week' | 'month' | 'year';
  start_date: Date;
  end_date: Date;
  total_executions: number;
  total_tokens: number;
  total_cost: number;
  average_execution_time: number;
  cache_hit_rate: number;
  top_agents: AgentUsage[];
  top_users: UserUsage[];
}

// Agent usage breakdown
export interface AgentUsage {
  agent_id: string;
  agent_name: string;
  executions: number;
  tokens_used: number;
  cost_usd: number;
  average_time_ms: number;
  success_rate: number;
}

// User usage breakdown
export interface UserUsage {
  user_id: string;
  user_email: string;
  executions: number;
  tokens_used: number;
  cost_usd: number;
  unique_agents_used: number;
}

// Revenue metrics
export interface RevenueMetrics {
  period: 'day' | 'week' | 'month' | 'year';
  start_date: Date;
  end_date: Date;
  total_revenue: number;
  total_costs: number;
  gross_profit: number;
  profit_margin: number;
  mrr: number; // Monthly recurring revenue
  arr: number; // Annual recurring revenue
  average_revenue_per_company: number;
  churn_rate: number;
  customer_lifetime_value: number;
  by_tier: RevenueBytier[];
}

// Revenue breakdown by subscription tier
export interface RevenueBytier {
  tier: 'trial' | 'basic' | 'professional' | 'enterprise';
  companies: number;
  revenue: number;
  percentage: number;
}

// Time series data point
export interface TimeSeriesDataPoint {
  date: Date;
  value: number;
  label?: string;
}

// Chart data for dashboards
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Dashboard summary for platform owner
export interface PlatformDashboardSummary {
  total_companies: number;
  active_companies: number;
  total_users: number;
  active_users_today: number;
  mrr: number;
  total_executions_today: number;
  total_cost_today: number;
  average_cost_per_execution: number;
  growth_rate: number; // Month over month
  churn_rate: number;
  usage_trend: TimeSeriesDataPoint[];
  revenue_trend: TimeSeriesDataPoint[];
  top_companies: CompanyRanking[];
}

// Company ranking for top companies view
export interface CompanyRanking {
  company_id: string;
  company_name: string;
  subscription_tier: 'trial' | 'basic' | 'professional' | 'enterprise';
  total_users: number;
  executions_this_month: number;
  revenue_this_month: number;
  tokens_used_this_month: number;
}

// Dashboard summary for company admins
export interface CompanyDashboardSummary {
  total_users: number;
  active_users_today: number;
  total_executions_today: number;
  total_executions_this_month: number;
  tokens_used_this_month: number;
  tokens_remaining: number | null; // null if unlimited
  cost_this_month: number;
  most_used_agent: string;
  usage_trend: TimeSeriesDataPoint[];
  top_users: UserUsage[];
}

// Alert thresholds
export interface AlertThreshold {
  type: 'token_limit' | 'cost_limit' | 'user_limit' | 'error_rate';
  threshold: number;
  current_value: number;
  exceeded: boolean;
  percentage_used: number;
}
