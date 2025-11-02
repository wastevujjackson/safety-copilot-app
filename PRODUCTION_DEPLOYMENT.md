# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Database (Supabase)

```bash
# Re-enable RLS policies
# Run this SQL in Supabase SQL Editor:
```

```sql
-- See supabase/enable_rls.sql
-- This will:
-- 1. Re-enable RLS on all tables
-- 2. Apply proper security policies
-- 3. Verify policies are active
```

**Verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'companies');
-- Both should show rowsecurity = true
```

### 2. Environment Variables

**Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add the following for **Production**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key (ENCRYPTED)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

**Important:**
- Use **production** Supabase project (not development)
- Mark `SUPABASE_SERVICE_ROLE_KEY` as **Encrypted**
- Rotate all keys from development

### 3. Supabase Configuration

**Email Settings:**
1. Dashboard → Authentication → Email Templates
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

**SMTP (Optional but recommended):**
1. Dashboard → Project Settings → SMTP
2. Configure custom email provider (SendGrid, AWS SES, etc.)

**Auth Settings:**
1. Dashboard → Authentication → Settings
2. Configure:
   - Email confirmation: **Enabled** (recommended)
   - Secure password: **Enabled**
   - Session timeout: 604800 (7 days)
   - Site URL: `https://your-domain.com`
   - Redirect URLs:
     - `https://your-domain.com/auth/callback`
     - `https://your-domain.com/dashboard`

**API Settings:**
1. Dashboard → Project Settings → API
2. Enable **Auto-refresh tokens**
3. Set **JWT expiry**: 3600 (1 hour)

### 4. Security Headers (next.config.ts)

Add security headers to your Next.js config:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

### 5. Testing Before Deployment

**Local Production Build:**
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Run through test scenarios:
# - Signup new company
# - Login as different roles
# - Create users
# - Update roles
# - Delete users
# - Access forbidden resources (should fail)
```

**Manual Security Tests:**
```bash
# Test RLS is working
# 1. Create two companies via signup
# 2. Login as Company A super admin
# 3. Try to access Company B users (should fail)

# Test API authorization
# 1. Call /api/users without auth (should return 401)
# 2. Call /api/users as basic user (should work)
# 3. Try POST /api/users as basic user (should return 403)
```

---

## Deployment Steps

### Option A: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: **Next.js**
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - Add all production environment variables
   - Mark sensitive keys as **Encrypted**

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test production deployment

5. **Configure Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS (Vercel will provide instructions)
   - Enable HTTPS (automatic)

### Option B: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   railway link
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL="..."
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   # ... add all other variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

## Post-Deployment

### 1. Verify Deployment

**Health Checks:**
```bash
# Check app is running
curl https://your-domain.com

# Check API endpoints
curl https://your-domain.com/api/healthcheck

# Check authentication
# Try signup → should receive email
# Try login → should work
```

**Database Checks:**
```sql
-- Verify RLS is active
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- Check app owner exists
SELECT email, role, is_app_owner
FROM users
WHERE is_app_owner = TRUE;
```

### 2. Monitor Application

**Set Up Monitoring:**
- [ ] Vercel Analytics (built-in)
- [ ] Sentry for error tracking
- [ ] Supabase logs monitoring
- [ ] Uptime monitoring (UptimeRobot, Pingdom)

**Alerts:**
- Error rate > 5%
- Response time > 2s
- Database connections > 80%
- Authentication failures spike

### 3. Performance Optimization

**Enable Vercel Features:**
- [ ] Edge Functions (if applicable)
- [ ] Image Optimization
- [ ] Analytics
- [ ] Web Vitals monitoring

**Supabase Optimizations:**
- [ ] Enable Connection Pooling (if needed)
- [ ] Set up Read Replicas (if needed)
- [ ] Configure Database Backups

### 4. Security Post-Launch

**Enable Additional Security:**
```sql
-- Monitor authentication logs
SELECT
  created_at,
  user_id,
  email,
  ip_address
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Regular Security Tasks:**
- [ ] Weekly: Review authentication logs
- [ ] Monthly: Audit user permissions
- [ ] Quarterly: Rotate API keys
- [ ] Yearly: Full security audit

---

## Rollback Plan

If deployment fails or issues are found:

### Immediate Rollback (Vercel)

1. **Via Dashboard:**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

### Database Rollback

1. **Restore from Backup:**
   - Supabase → Database → Backups
   - Select backup point
   - Click "Restore"

2. **Disable RLS (Emergency Only):**
   ```sql
   -- Only if absolutely necessary
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
   ```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check for failed authentication attempts
- Review new signups

**Weekly:**
- Review performance metrics
- Check database usage
- Update dependencies (if needed)

**Monthly:**
- Security audit
- Backup verification
- User permissions audit

**Quarterly:**
- Full security review
- Performance optimization
- Dependency updates

### Backup Strategy

**Supabase Automatic Backups:**
- Enabled by default
- Point-in-time recovery
- 7-day retention (free tier)
- 30-day retention (pro tier)

**Manual Backups:**
```sql
-- Export schema
pg_dump --schema-only > schema.sql

-- Export data
pg_dump --data-only > data.sql
```

---

## Troubleshooting

### Common Issues

**1. Users Can't Login**
- Check Supabase is running
- Verify environment variables
- Check Site URL in Supabase settings
- Review authentication logs

**2. RLS Blocking Legitimate Access**
- Verify policies are correct
- Check user's company_id
- Review policy logs
- Temporarily disable RLS to test (dev only)

**3. Slow Performance**
- Enable database connection pooling
- Check query performance
- Review indexes
- Consider caching

**4. Email Not Sending**
- Check SMTP configuration
- Verify email templates
- Check spam folder
- Review email logs in Supabase

### Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **App Owner**: jon@safetycopilot.co.uk

---

## Success Criteria

Deployment is successful when:
- ✅ App is accessible at production URL
- ✅ HTTPS is working
- ✅ Signup flow works
- ✅ Login flow works
- ✅ RLS policies are active
- ✅ All API routes require proper authorization
- ✅ Error tracking is configured
- ✅ Monitoring is active
- ✅ Backups are enabled
- ✅ App owner can log in

---

## Next Steps After Deployment

1. Create user documentation
2. Set up customer support system
3. Implement rate limiting
4. Add 2FA (optional)
5. Set up CI/CD pipeline
6. Create staging environment
7. Implement feature flags

---

Last Updated: 2025-01-XX
