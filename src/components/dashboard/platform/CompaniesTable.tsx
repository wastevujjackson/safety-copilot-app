'use client';

import { CompanyWithMetrics } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui';

interface CompaniesTableProps {
  companies: CompanyWithMetrics[];
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  return (
    <Card>
      <CardHeader title="All Companies" subtitle={`${companies.length} total companies`} />
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Company
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Plan
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                  Users
                </th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                  Executions
                </th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                  Cost (MTD)
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(company.subscription_tier)}`}>
                      {company.subscription_tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(company.subscription_status)}`}>
                      {company.subscription_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-gray-900">{company.current_users}</div>
                    <div className="text-sm text-gray-500">of {company.max_users === -1 ? '∞' : company.max_users}</div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {company.total_executions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    ${company.total_cost_this_month.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function getTierColor(tier: string) {
  const colors = {
    trial: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-yellow-100 text-yellow-800',
  };
  return colors[tier as keyof typeof colors] || colors.basic;
}

function getStatusColor(status: string) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    past_due: 'bg-orange-100 text-orange-800',
  };
  return colors[status as keyof typeof colors] || colors.active;
}
