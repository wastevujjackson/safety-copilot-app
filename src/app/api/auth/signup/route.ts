import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeError } from '@/lib/api/auth-middleware'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(200),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, fullName, companyName } = validation.data

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim()
    const sanitizedFullName = fullName.trim()
    const sanitizedCompanyName = companyName.trim()

    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Create auth user
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: true, // Auto-confirm for now, can change later
      user_metadata: {
        full_name: sanitizedFullName,
      },
    })

    if (authError) {
      console.error('[signup] Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create company (using service client to bypass RLS)
    const { data: companyData, error: companyError } = await serviceClient
      .from('companies')
      .insert({ name: sanitizedCompanyName })
      .select()
      .single()

    if (companyError) {
      console.error('[signup] Company error:', companyError)
      // Attempt rollback: delete the auth user
      try {
        await serviceClient.auth.admin.deleteUser(authData.user.id)
      } catch (rollbackError) {
        console.error('[signup] Rollback error:', rollbackError)
      }
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    // Update user with company_id and super_admin role (using service client)
    const { error: userError } = await serviceClient
      .from('users')
      .update({
        company_id: companyData.id,
        role: 'super_admin',
        full_name: sanitizedFullName,
      })
      .eq('id', authData.user.id)

    if (userError) {
      console.error('[signup] User update error:', userError)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // Now sign in the user to create a session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    })

    if (sessionError) {
      console.error('[signup] Session error:', sessionError)
      // User was created but couldn't sign in - they can try logging in manually
      return NextResponse.json({
        user: authData.user,
        company: companyData,
        message: 'Account created. Please log in.',
      })
    }

    return NextResponse.json({
      user: sessionData.user,
      session: sessionData.session,
      company: companyData,
    })
  } catch (error) {
    console.error('[signup] Exception:', error)
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}
