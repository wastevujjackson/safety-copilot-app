import { ReactNode } from 'react';
import { DashboardLayoutServer } from '@/components/layouts/DashboardLayoutServer';

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutServer>{children}</DashboardLayoutServer>;
}
