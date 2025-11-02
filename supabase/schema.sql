-- Safety Copilot Database Schema
-- Clean slate setup for Supabase with authentication and company management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('basic', 'super_admin');

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role user_role DEFAULT 'basic',
  is_app_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_app_owner ON users(is_app_owner);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
-- Company creators and super admins can view their company
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Super admins can update their company
CREATE POLICY "Super admins can update their company"
  ON companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can create companies (will be handled by signup logic)
CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for users
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can view other users in their company
CREATE POLICY "Users can view company members"
  ON users FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    -- Users cannot change their own role or company
    id = auth.uid() AND
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Super admins can create users in their company
CREATE POLICY "Super admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users
      WHERE role = 'super_admin' AND company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Super admins can update users in their company (including roles)
CREATE POLICY "Super admins can update company users"
  ON users FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    -- Cannot modify app owner
    (SELECT is_app_owner FROM users WHERE id = users.id) = FALSE AND
    -- Must be in same company
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can delete users from their company
CREATE POLICY "Super admins can delete company users"
  ON users FOR DELETE
  USING (
    -- Cannot delete app owner
    is_app_owner = FALSE AND
    -- Must be in same company and be super admin
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- App owner policies (override for full access)
CREATE POLICY "App owner has full companies access"
  ON companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_app_owner = TRUE
    )
  );

CREATE POLICY "App owner has full users access"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_app_owner = TRUE
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed the app owner (jon@safetycopilot.co.uk)
-- Note: This assumes the auth.users entry already exists or will be created manually
-- You'll need to create the auth user first, then update this user's record
-- For now, we'll create a placeholder that can be updated when the auth user is created

-- Create a function to seed app owner after auth user creation
CREATE OR REPLACE FUNCTION seed_app_owner()
RETURNS void AS $$
DECLARE
  owner_auth_id UUID;
BEGIN
  -- Check if app owner already exists
  IF EXISTS (SELECT 1 FROM users WHERE is_app_owner = TRUE) THEN
    RAISE NOTICE 'App owner already exists';
    RETURN;
  END IF;

  -- Get the auth user id for jon@safetycopilot.co.uk
  SELECT id INTO owner_auth_id FROM auth.users WHERE email = 'jon@safetycopilot.co.uk';

  IF owner_auth_id IS NULL THEN
    RAISE NOTICE 'Auth user jon@safetycopilot.co.uk not found. Create auth user first.';
    RETURN;
  END IF;

  -- Update the user to be app owner with super_admin role
  UPDATE users
  SET
    is_app_owner = TRUE,
    role = 'super_admin'
  WHERE id = owner_auth_id;

  RAISE NOTICE 'App owner seeded successfully';
END;
$$ LANGUAGE plpgsql;

-- Instructions for seeding app owner:
-- 1. First create the auth user in Supabase dashboard or via signup
-- 2. Then run: SELECT seed_app_owner();
