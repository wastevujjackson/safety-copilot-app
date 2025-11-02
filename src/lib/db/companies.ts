import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './users'

export interface Company {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * Get the current user's company
 */
export async function getCurrentCompany(): Promise<Company | null> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser?.company_id) return null

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', currentUser.company_id)
    .single()

  if (error) return null

  return data
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) return null

  return data
}

/**
 * Update company details (super admin only)
 */
export async function updateCompany(data: { name?: string }): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' }
  }

  if (currentUser.role !== 'super_admin' && !currentUser.is_app_owner) {
    return { success: false, error: 'Only super admins can update company details' }
  }

  if (!currentUser.company_id) {
    return { success: false, error: 'No company associated with user' }
  }

  const { error } = await supabase
    .from('companies')
    .update(data)
    .eq('id', currentUser.company_id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * Get all companies (app owner only)
 */
export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  if (!currentUser?.is_app_owner) return []

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []

  return data
}
