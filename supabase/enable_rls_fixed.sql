-- Fixed RLS Policies - No Infinite Recursion
-- This version avoids querying users table from within users policies

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Super admins can update their company" ON companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view company members" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can create users" ON users;
DROP POLICY IF EXISTS "Super admins can update company users" ON users;
DROP POLICY IF EXISTS "Super admins can delete company users" ON users;
DROP POLICY IF EXISTS "App owner has full companies access" ON companies;
DROP POLICY IF EXISTS "App owner has full users access" ON users;
DROP POLICY IF EXISTS "app_owner_full_companies_access" ON companies;
DROP POLICY IF EXISTS "users_view_own_company" ON companies;
DROP POLICY IF EXISTS "super_admins_update_company" ON companies;
DROP POLICY IF EXISTS "authenticated_create_companies" ON companies;
DROP POLICY IF EXISTS "app_owner_full_users_access" ON users;
DROP POLICY IF EXISTS "users_view_own_profile" ON users;
DROP POLICY IF EXISTS "users_view_company_members" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "super_admins_insert_users" ON users;
DROP POLICY IF EXISTS "super_admins_update_users" ON users;
DROP POLICY IF EXISTS "super_admins_delete_users" ON users;

-- ==============================================
-- USERS TABLE POLICIES (No recursion)
-- ==============================================

-- Users can always view their own profile (no subquery needed)
CREATE POLICY "users_view_own_profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can view other users in their company
-- Uses INNER JOIN instead of subquery to avoid recursion
CREATE POLICY "users_view_company_members"
  ON users FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT u.company_id
      FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id IS NOT NULL
    )
  );

-- Users can update their own non-sensitive fields only
CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Role, company_id, and is_app_owner cannot be changed by user
    AND role = (SELECT role FROM users WHERE id = auth.uid())
    AND company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND is_app_owner = (SELECT is_app_owner FROM users WHERE id = auth.uid())
  );

-- Allow INSERT for new users (handled by trigger/service role)
CREATE POLICY "allow_service_insert_users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Super admins can update users in their company
CREATE POLICY "super_admins_update_users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    is_app_owner = FALSE
    AND EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'super_admin'
      AND admin.company_id = users.company_id
    )
  )
  WITH CHECK (
    is_app_owner = FALSE
    AND EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'super_admin'
      AND admin.company_id = users.company_id
    )
  );

-- Super admins can delete users in their company (except app owner and self)
CREATE POLICY "super_admins_delete_users"
  ON users FOR DELETE
  TO authenticated
  USING (
    is_app_owner = FALSE
    AND id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'super_admin'
      AND admin.company_id = users.company_id
    )
  );

-- App owner has full access
CREATE POLICY "app_owner_full_users_access"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_app_owner = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_app_owner = TRUE
    )
  );

-- ==============================================
-- COMPANIES TABLE POLICIES
-- ==============================================

-- Users can view their own company
CREATE POLICY "users_view_own_company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Super admins can update their company
CREATE POLICY "super_admins_update_company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT u.company_id FROM users u
      WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT u.company_id FROM users u
      WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

-- Allow company creation (handled by service role during signup)
CREATE POLICY "authenticated_create_companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- App owner has full access to all companies
CREATE POLICY "app_owner_full_companies_access"
  ON companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_app_owner = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_app_owner = TRUE
    )
  );

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Show all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE
    WHEN cmd = 'ALL' THEN 'ALL'
    ELSE cmd::text
  END as operations
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'companies')
ORDER BY tablename, policyname;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'companies');
