-- RLS Policies with Security Definer Functions to Avoid Recursion

-- First, disable RLS and drop all policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

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
DROP POLICY IF EXISTS "allow_service_insert_users" ON users;

-- Create security definer functions that bypass RLS
-- These can safely query the users table without causing recursion

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT company_id FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_app_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(is_app_owner, false) FROM users WHERE id = auth.uid();
$$;

-- Now enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- USERS TABLE POLICIES (Using security definer functions)
-- ==============================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can view others in their company
CREATE POLICY "users_view_company_members"
  ON users FOR SELECT
  TO authenticated
  USING (
    company_id = public.current_user_company_id()
    AND public.current_user_company_id() IS NOT NULL
  );

-- Users can update own profile (non-sensitive fields)
CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = public.current_user_role()
    AND company_id = public.current_user_company_id()
    AND is_app_owner = public.current_user_is_app_owner()
  );

-- Allow insert (for signup/service role)
CREATE POLICY "allow_insert_users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Super admins can update users in their company
CREATE POLICY "super_admins_update_users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    is_app_owner = FALSE
    AND public.current_user_role() = 'super_admin'
    AND company_id = public.current_user_company_id()
  )
  WITH CHECK (
    is_app_owner = FALSE
    AND public.current_user_role() = 'super_admin'
    AND company_id = public.current_user_company_id()
  );

-- Super admins can delete users (except app owner and self)
CREATE POLICY "super_admins_delete_users"
  ON users FOR DELETE
  TO authenticated
  USING (
    is_app_owner = FALSE
    AND id != auth.uid()
    AND public.current_user_role() = 'super_admin'
    AND company_id = public.current_user_company_id()
  );

-- App owner has full access
CREATE POLICY "app_owner_full_access"
  ON users FOR ALL
  TO authenticated
  USING (public.current_user_is_app_owner() = true)
  WITH CHECK (public.current_user_is_app_owner() = true);

-- ==============================================
-- COMPANIES TABLE POLICIES
-- ==============================================

-- Users can view their own company
CREATE POLICY "users_view_own_company"
  ON companies FOR SELECT
  TO authenticated
  USING (id = public.current_user_company_id());

-- Super admins can update their company
CREATE POLICY "super_admins_update_company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'super_admin'
    AND id = public.current_user_company_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND id = public.current_user_company_id()
  );

-- Allow company creation (for signup)
CREATE POLICY "allow_create_companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- App owner has full access
CREATE POLICY "app_owner_full_companies_access"
  ON companies FOR ALL
  TO authenticated
  USING (public.current_user_is_app_owner() = true)
  WITH CHECK (public.current_user_is_app_owner() = true);

-- ==============================================
-- VERIFY
-- ==============================================

SELECT 'Policies created successfully' as status;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'companies');
