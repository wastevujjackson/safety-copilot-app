# Safety Copilot - Setup Instructions

## Database Setup

### Required SQL Files (in order):

1. **`supabase/migrations/001_initial_schema.sql`**
   - Creates all tables, enums, and indexes
   - Run this first in a fresh database

2. **`supabase/CREATE_SIGNUP_FUNCTION.sql`**
   - Creates the `signup_with_company()` function
   - Required for signup to work without RLS recursion

3. **`supabase/WORKING_RLS_SETUP.sql`**
   - Creates RLS policies that actually work
   - Key: Simple policies with no circular dependencies

4. **`supabase/migrations/003_seed_data.sql`**
   - Creates platform owner company
   - Sets up auto-create trigger for platform owner

5. **`supabase/RESET_DATABASE.sql`** (OPTIONAL - for development only)
   - Drops all tables and data
   - Use only when you need to start completely fresh

### Setup Steps:

1. **Fresh Database Setup:**
   ```sql
   -- Run in this exact order:
   1. 001_initial_schema.sql
   2. CREATE_SIGNUP_FUNCTION.sql
   3. WORKING_RLS_SETUP.sql
   4. 003_seed_data.sql
   ```

2. **If You Need to Reset:**
   ```sql
   -- Run these in order:
   1. RESET_DATABASE.sql
   2. 001_initial_schema.sql
   3. CREATE_SIGNUP_FUNCTION.sql
   4. WORKING_RLS_SETUP.sql
   5. 003_seed_data.sql
   ```

## Authentication Flow

### Signup:
1. User fills signup form (email, password, company name)
2. Creates Supabase Auth user
3. Calls `signup_with_company()` function (bypasses RLS)
4. Creates company record
5. Creates user profile record (id matches auth user id)
6. Redirects to dashboard

### Login:
1. User fills login form (email, password)
2. Authenticates with Supabase Auth
3. Fetches user profile + company data
4. Verifies:
   - User profile exists
   - User is active
   - User belongs to a company
5. If all checks pass, redirects to dashboard

### Session Management:
- Uses `supabase.auth.getUser()` (not `getSession()` which can hang)
- Sessions stored in localStorage by Supabase
- Auth state changes monitored with `onAuthStateChange()`

## Security Model

### Multi-Tenant Isolation:
- Each user belongs to ONE company
- Users can only see/edit data within their company
- RLS policies enforce company isolation at database level

### Role Hierarchy:
1. **platform_owner** - Can see all companies/users, platform admin
2. **super_admin** - Company owner, can manage company and all users
3. **admin** - Can manage users within company
4. **user** - Standard user, limited access

### RLS Policies:
- **Companies**: Users can only see their own company (except platform owners)
- **Users**: Users can see themselves + other users in their company
- **Agent Executions**: Users can only see executions from their company
- **Metrics**: Admins can see company metrics, platform owner sees all

## Files You Need

### Keep These:
```
supabase/
  migrations/
    001_initial_schema.sql          ✅ Core database schema
    002_row_level_security.sql      ✅ RLS policies (backup)
    003_seed_data.sql               ✅ Platform owner setup
  CREATE_SIGNUP_FUNCTION.sql        ✅ Signup function
  FINAL_COMPLETE_FIX.sql            ✅ Complete RLS fix
  RESET_DATABASE.sql                ✅ Reset script (dev only)

src/
  proxy.ts                          ✅ Required by Next.js 16 (simplified)
  config/supabase.ts                ✅ Supabase client config
  lib/auth/
    auth.ts                         ✅ Signup/login functions
    session.ts                      ✅ getCurrentUser()
    validation.ts                   ✅ Zod schemas
  hooks/useUser.ts                  ✅ User state hook
```

### Deleted (No longer needed):
- `CHECK_LOGIN_POLICY.sql` - Debug file
- `COMPLETE_FIX.sql` - Old fix attempt
- `DISABLE_RLS_TEMPORARILY.sql` - Debug file
- `FIX_RECURSION_FINAL.sql` - Superseded by FINAL_COMPLETE_FIX.sql

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PLATFORM_OWNER_EMAIL=admin@yourcompany.com
```

## Troubleshooting

### "Infinite recursion detected in policy"
- Run `FINAL_COMPLETE_FIX.sql`
- Clear browser data and re-login

### "Loading..." stuck on dashboard
- Check browser console for errors
- Verify RLS policies are correct
- Ensure user profile exists in database

### Signup works but login doesn't
- Clear browser data completely
- Check user is marked as `is_active = true`
- Verify user has a `company_id`

### Can't see other users in company
- Check RLS policies are enabled
- Verify `company_id` matches between users
- Check user role has permission

## Next Steps

1. Run `FINAL_COMPLETE_FIX.sql` in Supabase
2. Clear browser data
3. Create test account at `/signup`
4. Login should work and show dashboard
5. Build out remaining features
