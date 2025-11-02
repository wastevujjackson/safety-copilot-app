# Safety Copilot - Setup Instructions

## Quick Setup

### 1. Run Database Setup
Open Supabase SQL Editor and run:
```
supabase/COMPLETE_SETUP.sql
```

This single file does everything:
- Creates tables
- Sets up RLS policies
- Creates signup function
- Adds triggers

### 2. Test the App
1. Clear browser data
2. Go to `/signup`
3. Create an account
4. Should redirect to `/dashboard` and work immediately

## How It Works

**The Key to No Recursion:**
1. First RLS policy: `users_view_self` - allows `id = auth.uid()` with NO subqueries
2. Once that exists, all other policies can use `SELECT FROM users WHERE id = auth.uid()` safely
3. No circular dependencies = no infinite recursion

## Architecture

### Database
- Companies (multi-tenant isolation)
- Users (linked to Supabase Auth)
- Agent Executions
- Usage Metrics

### Authentication
- Signup creates: Auth user → Company → User profile (via `signup_with_company()` function)
- Login verifies user exists and is active
- RLS enforces company-level data isolation

### Code Structure
```
src/
  lib/auth/
    index.ts          - signUp, signIn, signOut, getCurrentUser
    validation.ts     - Zod schemas
  hooks/
    useAuth.tsx       - Auth context provider
  components/
    auth/            - Login/Signup forms
    layouts/         - Dashboard layout
```

## Troubleshooting

**"Loading..." stuck on dashboard:**
- Make sure you ran `COMPLETE_SETUP.sql`
- Clear browser data completely
- Check browser console for errors

**"User profile not found":**
- Database RLS policies might not be set up correctly
- Run `COMPLETE_SETUP.sql` again

**Signup works but login doesn't:**
- Clear browser data
- Check user is `is_active = true` in database
