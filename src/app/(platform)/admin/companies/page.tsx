import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { CompaniesTable } from '@/components/dashboard/platform/CompaniesTable';
import type { CompanyWithMetrics } from '@/types';

export default function CompaniesPage() {
  // TODO: Fetch real data from API
  const companies: CompanyWithMetrics[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      created_at: new Date('2024-01-15'),
      updated_at: new Date(),
      subscription_tier: 'professional',
      subscription_status: 'active',
      max_users: 50,
      max_agents: 15,
      billing_email: 'billing@acme.com',
      monthly_token_limit: 2000000,
      total_spent: 1980,
      last_payment_date: new Date('2024-10-01'),
      trial_ends_at: null,
      current_users: 23,
      active_users: 18,
      total_executions: 1543,
      total_tokens_this_month: 456000,
      total_cost_this_month: 45.60,
    },
    {
      id: '2',
      name: 'BuildCo Industries',
      created_at: new Date('2024-02-20'),
      updated_at: new Date(),
      subscription_tier: 'basic',
      subscription_status: 'active',
      max_users: 10,
      max_agents: 5,
      billing_email: 'admin@buildco.com',
      monthly_token_limit: 500000,
      total_spent: 490,
      last_payment_date: new Date('2024-10-01'),
      trial_ends_at: null,
      current_users: 7,
      active_users: 5,
      total_executions: 432,
      total_tokens_this_month: 128000,
      total_cost_this_month: 12.80,
    },
    {
      id: '3',
      name: 'SafetyFirst LLC',
      created_at: new Date('2024-10-15'),
      updated_at: new Date(),
      subscription_tier: 'trial',
      subscription_status: 'active',
      max_users: 5,
      max_agents: 3,
      billing_email: 'contact@safetyfirst.com',
      monthly_token_limit: 100000,
      total_spent: 0,
      last_payment_date: null,
      trial_ends_at: new Date('2024-10-29'),
      current_users: 3,
      active_users: 2,
      total_executions: 87,
      total_tokens_this_month: 24000,
      total_cost_this_month: 0,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="mt-2 text-gray-600">
              Manage all companies on the platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Companies" value={companies.length.toString()} />
          <StatCard
            label="Active"
            value={companies.filter(c => c.subscription_status === 'active').length.toString()}
            color="green"
          />
          <StatCard
            label="Trials"
            value={companies.filter(c => c.subscription_tier === 'trial').length.toString()}
            color="blue"
          />
          <StatCard
            label="Professional+"
            value={companies.filter(c => c.subscription_tier === 'professional' || c.subscription_tier === 'enterprise').length.toString()}
            color="purple"
          />
        </div>

        <CompaniesTable companies={companies} />
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: string;
  color?: 'gray' | 'green' | 'blue' | 'purple';
}) {
  const colors = {
    gray: 'bg-gray-50 text-gray-900',
    green: 'bg-green-50 text-green-900',
    blue: 'bg-blue-50 text-blue-900',
    purple: 'bg-purple-50 text-purple-900',
  };

  return (
    <div className={`rounded-lg border border-gray-200 p-4 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
