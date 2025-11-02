import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCompany, updateCompany, getAllCompanies } from '@/lib/db/companies'
import { requireAuth, requireRole, sanitizeError } from '@/lib/api/auth-middleware'
import { z } from 'zod'

const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
})

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req) => {
    try {
      // If app owner, return all companies, otherwise return current company
      if (req.user.is_app_owner) {
        const companies = await getAllCompanies()
        return NextResponse.json({ companies })
      } else {
        const company = await getCurrentCompany()
        return NextResponse.json({ company })
      }
    } catch (error) {
      console.error('[GET /api/companies] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}

export async function PATCH(request: NextRequest) {
  return requireRole(request, ['super_admin'], async (req) => {
    try {
      const body = await request.json()

      // Validate input
      const validation = updateCompanySchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.issues },
          { status: 400 }
        )
      }

      const { name } = validation.data

      const { success, error } = await updateCompany({ name })

      if (!success) {
        return NextResponse.json(
          { error },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('[PATCH /api/companies] Error:', error)
      return NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      )
    }
  })
}
