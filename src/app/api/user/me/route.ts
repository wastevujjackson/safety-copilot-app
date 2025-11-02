import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError || !user) {
      console.error('[/api/user/me] User not found:', userError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get company if user has one
    if (user.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.company_id)
        .single()

      return NextResponse.json({ user: { ...user, companies: company } })
    }

    return NextResponse.json({ user: { ...user, companies: null } })
  } catch (error) {
    console.error('[/api/user/me] Exception:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
