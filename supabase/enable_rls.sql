-- Re-enable Row Level Security with proper policies
-- Run this after testing is complete

-- Re-enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
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

-- ==============================================
-- COMPANIES TABLE POLICIES
-- ==============================================

-- App owner has full access to all companies
CREATE POLICY "app_owner_full_companies_access"
  ON companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_app_owner = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_app_owner = TRUE
    )
  );

-- Users can view their own company
CREATE POLICY "users_view_own_company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Super admins can update their company
CREATE POLICY "super_admins_update_company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT company_id FROM users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

-- Only allow company creation during signup (handled by trigger)
CREATE POLICY "authenticated_create_companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Prevent deletion of companies (must be done manually by admin)
-- No DELETE policy = no one can delete via app

-- ==============================================
-- USERS TABLE POLICIES
-- ==============================================

-- App owner has full access to all users
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

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can view other users in their company
CREATE POLICY "users_view_company_members"
  ON users FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    AND company_id IS NOT NULL
  );

-- Users can update ONLY their own non-sensitive fields
CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    -- Can only update self
    id = auth.uid()
    -- Cannot change role
    AND role = (SELECT role FROM users WHERE id = auth.uid())
    -- Cannot change company
    AND company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    -- Cannot make self app owner
    AND is_app_owner = (SELECT is_app_owner FROM users WHERE id = auth.uid())
  );

-- Super admins can insert users in their company (via trigger from auth.users)
CREATE POLICY "super_admins_insert_users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be super admin
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
    -- New user must be in same company
    AND company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Super admins can update users in their company (except app owner)
CREATE POLICY "super_admins_update_users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    -- Target user is not app owner
    is_app_owner = FALSE
    AND
    -- Target user is in same company
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    -- Cannot make someone app owner
    is_app_owner = FALSE
    AND
    -- Must stay in same company
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can delete users from their company (except app owner)
CREATE POLICY "super_admins_delete_users"
  ON users FOR DELETE
  TO authenticated
  USING (
    -- Cannot delete app owner
    is_app_owner = FALSE
    AND
    -- Cannot delete self
    id != auth.uid()
    AND
    -- Must be in same company and be super admin
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Verify policies are active
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE
    WHEN cmd = 'ALL' THEN 'SELECT, INSERT, UPDATE, DELETE'
    ELSE cmd::text
  END as operations
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'companies')
ORDER BY tablename, policyname;
