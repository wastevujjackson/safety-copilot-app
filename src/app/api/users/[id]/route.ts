import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUserRole, deleteCompanyUser } from '@/lib/db/users'
import { requireRole, checkCompanyAccess, sanitizeError } from '@/lib/api/auth-middleware'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['basic', 'super_admin']),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireRole(request, ['super_admin'], async (req) => {
    try {
      const user = await getUserById(params.id)

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Check if user has access to this user's company
      if (!checkCompanyAccess(req.user, user.company_id)) {
        return NextResponse.json(
          { error: 'Forbidden - User not in your company' },
          { status: 403 }
        )
      }

      return NextResponse.json({ user })
    } catch (error) {
      console.error('[GET /api/users/:id] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireRole(request, ['super_admin'], async (req) => {
    try {
      const body = await request.json()

      // Validate input
      const validation = updateRoleSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.errors },
          { status: 400 }
        )
      }

      const { role } = validation.data

      // Prevent setting super_admin role by non-app-owners
      if (role === 'super_admin' && !req.user.is_app_owner) {
        return NextResponse.json(
          { error: 'Only app owners can promote users to super admin' },
          { status: 403 }
        )
      }

      // Prevent self-demotion
      if (params.id === req.user.id) {
        return NextResponse.json(
          { error: 'Cannot modify your own role' },
          { status: 400 }
        )
      }

      const { success, error } = await updateUserRole(params.id, role)

      if (!success) {
        return NextResponse.json(
          { error },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('[PATCH /api/users/:id] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireRole(request, ['super_admin'], async (req) => {
    try {
      // Prevent self-deletion
      if (params.id === req.user.id) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        )
      }

      const { success, error } = await deleteCompanyUser(params.id)

      if (!success) {
        return NextResponse.json(
          { error },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('[DELETE /api/users/:id] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}
