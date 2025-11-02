# Security Documentation

## Overview

This document outlines the security measures implemented in the Safety Copilot application to ensure production-grade security.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Database Security](#database-security)
3. [API Security](#api-security)
4. [Input Validation](#input-validation)
5. [Environment Variables](#environment-variables)
6. [Production Checklist](#production-checklist)
7. [Security Best Practices](#security-best-practices)
8. [Incident Response](#incident-response)

---

## Authentication & Authorization

### Session Management
- **Provider**: Supabase Auth
- **Session Storage**: HTTP-only cookies
- **Session Duration**: Configurable via Supabase dashboard
- **Refresh Tokens**: Automatic refresh handled by Supabase client

### Password Requirements
```
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
```

### User Roles
1. **Basic User**: Limited access to assigned agents and own data
2. **Super Admin**: Full company management, user management, billing
3. **App Owner**: Full platform access (jon@safetycopilot.co.uk only)

### Authorization Middleware
All API routes use authorization middleware:
- `requireAuth()`: Requires any authenticated user
- `requireRole(['super_admin'])`: Requires specific role
- `requireAppOwner()`: Requires app owner access
- `checkCompanyAccess()`: Validates company-level access

---

## Database Security

### Row Level Security (RLS)

RLS is enabled on all tables with the following policies:

#### Users Table
- ✅ Users can view their own profile
- ✅ Users can view other users in their company
- ✅ Users can update only non-sensitive fields on their profile
- ✅ Super admins can create users in their company
- ✅ Super admins can update users in their company (except app owner)
- ✅ Super admins can delete users (except app owner and self)
- ✅ App owner has full access to all users

#### Companies Table
- ✅ Users can view their own company
- ✅ Super admins can update their company
- ✅ Authenticated users can create companies (during signup only)
- ✅ App owner has full access to all companies
- ❌ No one can delete companies via app (manual admin only)

### Protection Against
- **SQL Injection**: Supabase uses parameterized queries
- **Unauthorized Access**: RLS policies enforce access control at database level
- **Data Leakage**: Users can only access data in their company
- **Privilege Escalation**: Cannot self-promote or modify app owner

---

## API Security

### Implemented Protections

#### 1. Input Validation (Zod)
All API routes validate input using Zod schemas:
```typescript
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).regex(...),
  fullName: z.string().min(1).max(100),
  companyName: z.string().min(1).max(200),
})
```

#### 2. Input Sanitization
- Email addresses: Lowercase and trimmed
- String inputs: Trimmed and length-limited
- Special characters: Handled by database parameterization

#### 3. Error Handling
- Production: Generic error messages
- Development: Detailed errors for debugging
- No sensitive information leaked in responses
- All errors logged server-side

#### 4. Authentication Required
All sensitive routes require authentication:
- `/api/users/*` - User management
- `/api/companies/*` - Company management
- `/api/user/me` - Current user profile

#### 5. Authorization Checks
- Role-based access control on all routes
- Company-level access validation
- Prevention of self-modification attacks
- App owner protection (cannot be deleted/modified)

#### 6. Rate Limiting (Recommended for Production)
**TODO**: Implement rate limiting using:
- Vercel Edge Config
- Upstash Redis
- Or custom middleware

Recommended limits:
- Login: 5 attempts per 15 minutes per IP
- Signup: 3 attempts per hour per IP
- API calls: 100 requests per minute per user

---

## Input Validation

### Client-Side (React Hook Form + Zod)
- Email format validation
- Password strength requirements
- Field length limits
- Required field validation

### Server-Side (Zod + Custom Validation)
- All inputs validated even if client-side validation passes
- Type checking
- Format validation
- Range/length validation
- Enum validation for roles

### Sanitization
```typescript
// Email
const sanitizedEmail = email.toLowerCase().trim()

// Text fields
const sanitizedName = name.trim()

// No HTML/script tags allowed (enforced by Zod schemas)
```

---

## Environment Variables

### Required Variables
```bash
NEXT_PUBLIC_SUPABASE_URL          # Public - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public - Anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY         # SECRET - Never expose to client
NEXT_PUBLIC_APP_URL               # Public - App URL
NODE_ENV                          # Public - Environment (development/production)
```

### Security Rules
1. ✅ Never commit `.env.local` to git
2. ✅ Use `.env.example` for documentation
3. ✅ Service role key only used in server-side code
4. ✅ Rotate keys if compromised
5. ✅ Use environment-specific variables in deployment

### Vercel Deployment
Add environment variables in:
```
Vercel Dashboard → Project → Settings → Environment Variables
```

---

## Production Checklist

### Before Deployment

#### Database
- [ ] Apply `supabase/enable_rls.sql` to re-enable RLS
- [ ] Verify all RLS policies are active
- [ ] Test RLS policies with different user roles
- [ ] Set up database backups (automated in Supabase)
- [ ] Configure database connection pooling if needed

#### Authentication
- [ ] Configure email templates in Supabase
- [ ] Set up custom SMTP for emails (optional)
- [ ] Configure OAuth providers if needed
- [ ] Set password policy in Supabase settings
- [ ] Enable email verification requirement

#### API & Security
- [ ] Set `NODE_ENV=production`
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure CORS if needed
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set security headers (Next.js config)

#### Secrets Management
- [ ] Rotate all API keys and secrets
- [ ] Remove development credentials
- [ ] Configure environment variables in Vercel
- [ ] Audit `.gitignore` to ensure secrets not committed
- [ ] Document secret rotation procedure

#### Testing
- [ ] Test signup flow
- [ ] Test login flow with various roles
- [ ] Test unauthorized access attempts
- [ ] Test RLS policies
- [ ] Test API authorization
- [ ] Perform security audit
- [ ] Load testing

#### Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Create alerting rules
- [ ] Set up analytics (optional)

---

## Security Best Practices

### For Developers

1. **Never Log Sensitive Data**
   ```typescript
   // ❌ Bad
   console.log('User password:', password)

   // ✅ Good
   console.log('User authenticated:', userId)
   ```

2. **Always Validate on Server-Side**
   ```typescript
   // Client validation is for UX only
   // Always validate on the server
   ```

3. **Use Parameterized Queries**
   ```typescript
   // ✅ Good (Supabase does this automatically)
   supabase.from('users').select().eq('id', userId)

   // ❌ Bad (never use string concatenation)
   // `SELECT * FROM users WHERE id = '${userId}'`
   ```

4. **Principle of Least Privilege**
   - Grant minimum required permissions
   - Use appropriate role checks
   - Validate company access

5. **Defense in Depth**
   - Multiple layers of security (RLS + API + Middleware)
   - Don't rely on single security measure

### For Users

1. **Strong Passwords**
   - Use unique passwords
   - Enable 2FA (when available)
   - Use password manager

2. **Session Management**
   - Log out on shared devices
   - Review active sessions regularly

3. **Suspicious Activity**
   - Report unusual login attempts
   - Contact admin for security concerns

---

## Incident Response

### If Security Breach Suspected

1. **Immediate Actions**
   - [ ] Disable affected user accounts
   - [ ] Rotate all API keys and secrets
   - [ ] Review audit logs
   - [ ] Document incident details

2. **Investigation**
   - [ ] Identify scope of breach
   - [ ] Check database logs
   - [ ] Review authentication logs
   - [ ] Analyze network traffic

3. **Remediation**
   - [ ] Patch vulnerabilities
   - [ ] Force password resets if needed
   - [ ] Update security policies
   - [ ] Deploy fixes

4. **Communication**
   - [ ] Notify affected users
   - [ ] Document lessons learned
   - [ ] Update security procedures

### Emergency Contacts
- **App Owner**: jon@safetycopilot.co.uk
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support

---

## Security Audit Log

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2025-01-XX | Initial | Security hardening completed | ✅ |

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Web Security Cheat Sheet](https://cheatsheetseries.owasp.org/IndexTopTen.html)

---

## Updates

This document should be reviewed and updated:
- After any security-related changes
- Quarterly for best practices updates
- After security incidents
- When new features are added

Last Updated: 2025-01-XX
