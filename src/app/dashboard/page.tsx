import { DashboardLayoutServer } from '@/components/layouts/DashboardLayoutServer';
import { MetricCard } from '@/components/dashboard/platform/MetricCard';
import { Card, CardHeader, CardContent } from '@/components/ui';

export default async function CompanyDashboard() {
  // TODO: Fetch real data from API
  const metrics = {
    totalUsers: 23,
    activeUsersToday: 18,
    totalExecutionsToday: 142,
    totalExecutionsThisMonth: 1543,
    tokensUsedThisMonth: 456000,
    tokensRemaining: 1544000,
    tokenLimit: 2000000,
    costThisMonth: 45.60,
    mostUsedAgent: 'Risk Assessment',
  };

  const recentActivity = [
    {
      id: '1',
      user: 'john@acme.com',
      agent: 'Risk Assessment',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'success',
    },
    {
      id: '2',
      user: 'sarah@acme.com',
      agent: 'Incident Report',
      timestamp: new Date(Date.now() - 1000 * 60 * 32),
      status: 'success',
    },
    {
      id: '3',
      user: 'mike@acme.com',
      agent: 'Compliance Check',
      timestamp: new Date(Date.now() - 1000 * 60 * 47),
      status: 'success',
    },
  ];

  const tokenUsagePercentage = (metrics.tokensUsedThisMonth / metrics.tokenLimit) * 100;

  return (
    <DashboardLayoutServer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your team&apos;s safety agent usage
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Team Members"
            value={metrics.totalUsers}
            subtitle={`${metrics.activeUsersToday} active today`}
          />

          <MetricCard
            title="Executions Today"
            value={metrics.totalExecutionsToday}
            subtitle={`${metrics.totalExecutionsThisMonth.toLocaleString()} this month`}
          />

          <MetricCard
            title="Tokens Used"
            value={`${Math.round(tokenUsagePercentage)}%`}
            subtitle={`${metrics.tokensRemaining.toLocaleString()} remaining`}
          />

          <MetricCard
            title="Cost This Month"
            value={`$${metrics.costThisMonth.toFixed(2)}`}
            subtitle="Monthly spending"
          />
        </div>

        {/* Token Usage Progress */}
        <Card>
          <CardHeader
            title="Token Usage This Month"
            subtitle={`${metrics.tokensUsedThisMonth.toLocaleString()} of ${metrics.tokenLimit.toLocaleString()} tokens used`}
          />
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    tokenUsagePercentage > 90
                      ? 'bg-red-600'
                      : tokenUsagePercentage > 75
                      ? 'bg-yellow-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${tokenUsagePercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {tokenUsagePercentage > 90 && (
                  <span className="text-red-600 font-medium">
                    ⚠️ You&apos;re approaching your token limit. Consider upgrading your plan.
                  </span>
                )}
                {tokenUsagePercentage <= 90 && (
                  <span>
                    {metrics.tokensRemaining.toLocaleString()} tokens remaining for this billing cycle
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader
            title="Recent Activity"
            subtitle="Latest agent executions from your team"
          />
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium text-gray-900">{activity.agent}</p>
                        <p className="text-sm text-gray-500">{activity.user}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Manage Users"
            description="Add or remove team members"
            href="/dashboard/users"
            icon="👥"
          />
          <QuickActionCard
            title="View Analytics"
            description="Detailed usage and performance metrics"
            href="/dashboard/analytics"
            icon="📊"
          />
          <QuickActionCard
            title="Billing Settings"
            description="Manage subscription and payments"
            href="/dashboard/billing"
            icon="💳"
          />
        </div>
      </div>
    </DashboardLayoutServer>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
