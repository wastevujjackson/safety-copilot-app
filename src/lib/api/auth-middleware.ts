import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/db/users'
import type { User, UserRole } from '@/types/user'

export interface AuthenticatedRequest extends NextRequest {
  user: User
}

/**
 * Middleware to require authentication for API routes
 */
export async function requireAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return await handler(authenticatedRequest)
  } catch (error) {
    console.error('[requireAuth] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

/**
 * Middleware to require specific role for API routes
 */
export async function requireRole(
  request: NextRequest,
  roles: UserRole[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // App owner bypasses all role checks
    if (user.is_app_owner) {
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = user
      return await handler(authenticatedRequest)
    }

    // Check if user has required role
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return await handler(authenticatedRequest)
  } catch (error) {
    console.error('[requireRole] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

/**
 * Middleware to require app owner access
 */
export async function requireAppOwner(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    if (!user.is_app_owner) {
      return NextResponse.json(
        { error: 'Forbidden - App owner access required' },
        { status: 403 }
      )
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return await handler(authenticatedRequest)
  } catch (error) {
    console.error('[requireAppOwner] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

/**
 * Check if user can access resource in their company
 */
export function checkCompanyAccess(user: User, resourceCompanyId: string | null): boolean {
  // App owner can access all companies
  if (user.is_app_owner) {
    return true
  }

  // User must be in same company
  return user.company_id === resourceCompanyId
}

/**
 * Sanitize error messages to avoid leaking sensitive info
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // In production, don't leak internal error messages
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred'
    }
    return error.message
  }
  return 'An unexpected error occurred'
}
