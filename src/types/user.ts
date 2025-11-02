// User role hierarchy
export type UserRole = 'basic' | 'super_admin';

// User interface
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  company_id: string | null;
  role: UserRole;
  is_app_owner: boolean;
  created_at: string;
  updated_at: string;
  companies?: any; // Company object from join
}

// User session
export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

// User profile with company data
export interface UserProfile extends User {
  company?: Company;
}

// User creation input
export interface CreateUserInput {
  email: string;
  password: string;
  company_id?: string;
  role?: UserRole;
}

// User update input
export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_company',
    'manage_users',
    'promote_users',
    'manage_billing',
    'access_all_agents',
    'view_analytics',
  ] as const,
  basic: [
    'access_assigned_agents',
    'view_own_data',
  ] as const,
} as const;

export type Permission =
  | typeof ROLE_PERMISSIONS.super_admin[number]
  | typeof ROLE_PERMISSIONS.basic[number];

// Helper to check if user has permission
export function hasPermission(user: User, permission: Permission): boolean {
  if (user.is_app_owner) {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[user.role] as readonly Permission[];
  return permissions.includes(permission);
}

// Helper to check if user can manage another user
export function canManageUser(manager: User, targetUser: User): boolean {
  // App owner can manage anyone
  if (manager.is_app_owner) {
    return true;
  }

  // Must be in same company
  if (manager.company_id !== targetUser.company_id) {
    return false;
  }

  // Super admin can manage anyone in their company
  if (manager.role === 'super_admin') {
    return true;
  }

  return false;
}

// Import company type (will be defined in company.ts)
import type { Company } from './company';
