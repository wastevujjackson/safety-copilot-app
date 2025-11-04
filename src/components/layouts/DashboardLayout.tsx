'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui';

export interface HiredAgent {
  id: string;
  agent_id: string;
  agent_name: string;
  hired_at: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  hiredAgents?: HiredAgent[];
}

export function DashboardLayout({ children, hiredAgents = [] }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const navigation = getNavigationForRole(user.role, user.is_app_owner);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                Safety Copilot
              </Link>
              {user.companies && (
                <span className="text-sm text-gray-600">
                  • {user.companies.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                {user.role.replace('_', ' ').toUpperCase()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Hired Agents Section */}
            {hiredAgents.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  My Agents
                </div>
                {hiredAgents.map((agent) => {
                  const isActive = pathname === `/dashboard/agents/${agent.agent_id}`;
                  return (
                    <Link
                      key={agent.id}
                      href={`/dashboard/agents/${agent.agent_id}`}
                      className={`
                        block px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      {agent.agent_name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function getNavigationForRole(role: string, isAppOwner: boolean) {
  if (isAppOwner) {
    return [
      { name: 'Platform Dashboard', href: '/admin' },
      { name: 'Companies', href: '/admin/companies' },
      { name: 'Usage & Metrics', href: '/admin/usage' },
      { name: 'Revenue', href: '/admin/revenue' },
      { name: 'Analytics', href: '/admin/analytics' },
    ];
  }

  if (role === 'super_admin') {
    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Agents', href: '/dashboard/agents' },
      { name: 'Users', href: '/dashboard/users' },
      { name: 'Billing', href: '/dashboard/billing' },
      { name: 'Settings', href: '/dashboard/settings' },
      { name: 'Analytics', href: '/dashboard/analytics' },
    ];
  }

  // Basic user
  return [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Agents', href: '/dashboard/agents' },
  ];
}
