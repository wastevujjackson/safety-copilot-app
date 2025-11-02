# Supabase Database Setup

This directory contains the database migrations for the Safety Copilot platform.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Update Environment Variables

Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PLATFORM_OWNER_EMAIL=your-email@company.com
```

### 3. Run Migrations

You have two options:

#### Option A: Using Supabase Dashboard (Recommended for quick setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `001_initial_schema.sql`
   - `002_row_level_security.sql`
   - `003_seed_data.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Create Platform Owner Account

After running migrations:

1. Sign up through your app with the email matching `PLATFORM_OWNER_EMAIL`
2. The trigger in `003_seed_data.sql` will automatically set you as platform owner
3. OR manually insert the user after getting the auth.users.id from Supabase Auth

### 5. Verify Setup

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if platform owner exists
SELECT * FROM users WHERE is_platform_owner = TRUE;

-- Check if platform company exists
SELECT * FROM companies WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

## Migration Files

- **001_initial_schema.sql**: Creates all tables, enums, indexes, and triggers
- **002_row_level_security.sql**: Implements RLS policies for multi-tenant security
- **003_seed_data.sql**: Seeds platform owner company and creates auto-user trigger

## Database Schema

### Tables

- `companies` - Company/tenant data
- `users` - User accounts with role-based access
- `user_sessions` - Session management
- `agent_executions` - AI agent usage tracking
- `company_usage_metrics` - Daily aggregated company metrics
- `platform_metrics` - Platform-wide analytics

### Security

All tables have Row Level Security (RLS) enabled to ensure:
- Users can only access their company's data
- Platform owner can access all data
- Admins can manage users in their company only

## Troubleshooting

### RLS Policies Not Working

Make sure you're using the correct user context:

```typescript
// Client-side (uses auth.uid())
import { supabase } from '@/config/supabase';

// Server-side (bypasses RLS with service role)
import { getServiceSupabase } from '@/config/supabase';
const supabase = getServiceSupabase();
```

### Platform Owner Not Created

1. Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Verify email matches: Check `PLATFORM_OWNER_EMAIL` env variable
3. Manually insert if needed (see `003_seed_data.sql` comments)

## Next Steps

After database setup:
1. Set up authentication (see `src/lib/auth/`)
2. Create API routes (see `src/app/api/`)
3. Build dashboard UI (see `src/app/dashboard/`)
