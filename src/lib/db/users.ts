import { createClient } from '@/lib/supabase/server'

export type UserRole = 'basic' | 'super_admin'

export interface User {
  id: string
  email: string
  full_name: string | null
  company_id: string | null
  role: UserRole
  is_app_owner: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  password: string
  full_name?: string
  role?: UserRole
}

/**
 * Get the current authenticated user's profile
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (error) return null

  return data
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null

  return data
}

/**
 * Get all users in the current user's company
 */
export async function getCompanyUsers(): Promise<User[]> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser?.company_id) return []

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', currentUser.company_id)
    .order('created_at', { ascending: false })

  if (error) return []

  return data
}

/**
 * Create a new user in the current user's company (super admin only)
 */
export async function createCompanyUser(userData: CreateUserData): Promise<{ user: User | null; error: string | null }> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { user: null, error: 'Not authenticated' }
  }

  if (currentUser.role !== 'super_admin') {
    return { user: null, error: 'Only super admins can create users' }
  }

  if (!currentUser.company_id) {
    return { user: null, error: 'No company associated with user' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.full_name,
      },
    },
  })

  if (authError || !authData.user) {
    return { user: null, error: authError?.message || 'Failed to create auth user' }
  }

  // Update user with company_id and role
  const { data, error } = await supabase
    .from('users')
    .update({
      company_id: currentUser.company_id,
      role: userData.role || 'basic',
      full_name: userData.full_name,
    })
    .eq('id', authData.user.id)
    .select()
    .single()

  if (error) {
    return { user: null, error: 'Failed to update user profile' }
  }

  return { user: data, error: null }
}

/**
 * Update user role (super admin only)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' }
  }

  if (currentUser.role !== 'super_admin' && !currentUser.is_app_owner) {
    return { success: false, error: 'Only super admins can update user roles' }
  }

  // Check target user is in same company
  const targetUser = await getUserById(userId)
  if (!targetUser || targetUser.company_id !== currentUser.company_id) {
    return { success: false, error: 'User not found in your company' }
  }

  if (targetUser.is_app_owner) {
    return { success: false, error: 'Cannot modify app owner' }
  }

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * Delete user from company (super admin only)
 */
export async function deleteCompanyUser(userId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' }
  }

  if (currentUser.role !== 'super_admin' && !currentUser.is_app_owner) {
    return { success: false, error: 'Only super admins can delete users' }
  }

  // Check target user
  const targetUser = await getUserById(userId)
  if (!targetUser || targetUser.company_id !== currentUser.company_id) {
    return { success: false, error: 'User not found in your company' }
  }

  if (targetUser.is_app_owner) {
    return { success: false, error: 'Cannot delete app owner' }
  }

  // Delete from auth (will cascade to users table)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * Update user profile (own profile only)
 */
export async function updateUserProfile(data: { full_name?: string }): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', currentUser.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
