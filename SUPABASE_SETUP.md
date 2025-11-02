# Supabase Configuration Guide

## Prerequisites

1. A Supabase account at https://supabase.com
2. Node.js and npm installed
3. The following environment variables set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 1: Install Dependencies

Ensure you have the correct Supabase packages installed:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and wait for it to be provisioned
4. Once ready, go to Project Settings > API
5. Copy the following values to your `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Apply Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Open the file: `supabase/schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run"

This will create:
- `companies` table
- `users` table (extends auth.users)
- User role enum (`basic`, `super_admin`)
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- Trigger for new user creation
- Function to seed app owner

## Step 4: Create App Owner Account

### Option A: Via Supabase Dashboard (Recommended)

1. Go to Authentication > Users
2. Click "Add User"
3. Enter:
   - Email: `jon@safetycopilot.co.uk`
   - Password: (create a secure password)
   - Auto Confirm User: ✅ (check this)
4. Click "Create User"

5. Go back to SQL Editor and run:
```sql
SELECT seed_app_owner();
```

This will:
- Mark jon@safetycopilot.co.uk as the app owner
- Set role to super_admin
- Give full access to all companies and users

### Option B: Via API Signup

1. Use the signup API to create the account:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jon@safetycopilot.co.uk",
    "password": "your_secure_password",
    "fullName": "Jon Jackson",
    "companyName": "Safety Copilot"
  }'
```

2. Confirm the email if required

3. Run the seed function in SQL Editor:
```sql
SELECT seed_app_owner();
```

## Step 5: Configure Email Authentication (Optional)

1. In Supabase Dashboard, go to Authentication > Email Templates
2. Customize confirmation, password reset templates
3. Go to Authentication > Providers
4. Configure SMTP settings for custom email domain (optional)

## Step 6: Verify Configuration

Run the following checks:

### 1. Check Environment Variables

```bash
# Run this in your terminal
node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)"
```

Both values should be defined.

### 2. Test Database Connection

In Supabase SQL Editor, run:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should return: companies, users
```

### 3. Check RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Should show multiple policies for companies and users tables
```

### 4. Verify App Owner

```sql
SELECT id, email, role, is_app_owner, company_id
FROM users
WHERE email = 'jon@safetycopilot.co.uk';

-- Should return one row with is_app_owner = true, role = 'super_admin'
```

### 5. Test Authentication Flow

Try logging in via your app:

```bash
# Start your Next.js app
npm run dev

# Open browser to http://localhost:3000/login
# Try logging in with jon@safetycopilot.co.uk
```

### 6. Test API Endpoints

```bash
# Test login (after logging in via UI, or use credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jon@safetycopilot.co.uk",
    "password": "your_password"
  }'

# Should return user session
```

## Step 7: Security Checklist

- ✅ RLS is enabled on all tables
- ✅ Anon key is used for client-side (never service key)
- ✅ Service role key is kept secret and NOT in environment variables
- ✅ App owner account is secured with strong password
- ✅ Email confirmation is enabled (optional but recommended)

## Common Issues

### Issue: "relation does not exist"
**Solution**: Schema not applied. Go to Step 3 and apply the schema.

### Issue: "JWT expired" or authentication errors
**Solution**:
1. Check environment variables are correct
2. Clear browser cookies
3. Restart Next.js dev server

### Issue: Can't create users or companies
**Solution**: Check RLS policies are applied:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Issue: App owner not found
**Solution**:
1. Make sure auth user exists: `SELECT * FROM auth.users WHERE email = 'jon@safetycopilot.co.uk'`
2. Run seed function: `SELECT seed_app_owner();`

## User Flow

### New Company Signup
1. User goes to `/signup`
2. Fills in email, password, full name, company name
3. System creates:
   - Auth user
   - Company record
   - User profile with `super_admin` role
4. User is auto-logged in and redirected to dashboard

### Super Admin Adding Users
1. Super admin goes to user management
2. Clicks "Add User"
3. Enters email, password, name, role (basic/super_admin)
4. New user is created in same company
5. New user receives email (if configured)
6. New user can log in with credentials

### Role Permissions

**Basic User**:
- View own profile
- View company members
- Update own profile (name only)

**Super Admin**:
- All basic user permissions
- Create new users in company
- Update user roles
- Delete users (except app owner)
- Update company details

**App Owner** (jon@safetycopilot.co.uk):
- Full access to all companies
- Full access to all users
- Cannot be deleted or modified by others

## Next Steps

1. Customize email templates in Supabase dashboard
2. Set up custom domain for emails (optional)
3. Configure OAuth providers (Google, GitHub, etc.) if needed
4. Set up database backups
5. Monitor authentication logs in Supabase dashboard
