import { createClient } from '@/lib/supabase/client'

// =====================================================
// SIGNUP
// =====================================================
export async function signUp(email: string, password: string, fullName: string, companyName: string) {
  const supabase = createClient()

  // Call the signup API route which handles everything
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, companyName }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed')
  }

  return data
}

// =====================================================
// LOGIN
// =====================================================
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  console.log('[signIn] Starting login...')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[signIn] Error:', error.message)
    throw error
  }

  if (!data.session) {
    throw new Error('Please confirm your email before logging in')
  }

  console.log('[signIn] Success! Session established')
  return data
}

// =====================================================
// LOGOUT
// =====================================================
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/login'
}

// =====================================================
// GET CURRENT USER
// =====================================================
export async function getCurrentUser() {
  try {
    // Use API route which uses server-side client (works with RLS)
    const response = await fetch('/api/user/me', {
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('[getCurrentUser] Exception:', error)
    return null
  }
}
