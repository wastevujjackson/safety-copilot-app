import { NextRequest, NextResponse } from 'next/server'
import { getCompanyUsers, createCompanyUser } from '@/lib/db/users'
import { requireAuth, requireRole, sanitizeError } from '@/lib/api/auth-middleware'
import { z } from 'zod'

// Validation schema
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  role: z.enum(['basic', 'super_admin']).optional(),
})

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req) => {
    try {
      const users = await getCompanyUsers()
      return NextResponse.json({ users })
    } catch (error) {
      console.error('[GET /api/users] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return requireRole(request, ['super_admin'], async (req) => {
    try {
      const body = await request.json()

      // Validate input
      const validation = createUserSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.errors },
          { status: 400 }
        )
      }

      const { email, password, full_name, role } = validation.data

      // Prevent creation of super_admin by non-app-owners
      if (role === 'super_admin' && !req.user.is_app_owner) {
        return NextResponse.json(
          { error: 'Only app owners can create super admins' },
          { status: 403 }
        )
      }

      const { user, error } = await createCompanyUser({
        email,
        password,
        full_name,
        role: role || 'basic',
      })

      if (error) {
        return NextResponse.json(
          { error },
          { status: 400 }
        )
      }

      return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
      console.error('[POST /api/users] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}
