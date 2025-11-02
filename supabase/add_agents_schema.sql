-- AI Agents Schema
-- Tables for managing hired agents and their outputs

-- Hired agents table (tracks which agents a company has subscribed to)
CREATE TABLE hired_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL, -- matches agent.id from the frontend (e.g. 'coshh-generator')
  agent_name TEXT NOT NULL,
  hired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hired_by UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  cancelled_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(company_id, agent_id)
);

-- Agent outputs table (stores generated assessments/documents)
CREATE TABLE agent_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hired_agent_id UUID NOT NULL REFERENCES hired_agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  output_data JSONB NOT NULL, -- stores the actual assessment data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_hired_agents_company_id ON hired_agents(company_id);
CREATE INDEX idx_hired_agents_status ON hired_agents(status);
CREATE INDEX idx_agent_outputs_hired_agent_id ON agent_outputs(hired_agent_id);
CREATE INDEX idx_agent_outputs_company_id ON agent_outputs(company_id);
CREATE INDEX idx_agent_outputs_created_by ON agent_outputs(created_by);

-- Enable RLS
ALTER TABLE hired_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hired_agents
-- Users can view hired agents for their company
CREATE POLICY "users_view_company_hired_agents"
  ON hired_agents FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Super admins can hire agents for their company
CREATE POLICY "super_admins_hire_agents"
  ON hired_agents FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can update (cancel) hired agents
CREATE POLICY "super_admins_update_hired_agents"
  ON hired_agents FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- App owner has full access
CREATE POLICY "app_owner_full_hired_agents_access"
  ON hired_agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_app_owner = TRUE
    )
  );

-- RLS Policies for agent_outputs
-- Users can view outputs from their company
CREATE POLICY "users_view_company_outputs"
  ON agent_outputs FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can create outputs for their company's hired agents
CREATE POLICY "users_create_outputs"
  ON agent_outputs FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    AND hired_agent_id IN (
      SELECT id FROM hired_agents
      WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
      AND status = 'active'
    )
  );

-- Users can update their own outputs
CREATE POLICY "users_update_own_outputs"
  ON agent_outputs FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Super admins can delete outputs from their company
CREATE POLICY "super_admins_delete_outputs"
  ON agent_outputs FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- App owner has full access
CREATE POLICY "app_owner_full_outputs_access"
  ON agent_outputs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_app_owner = TRUE
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_agent_outputs_updated_at
  BEFORE UPDATE ON agent_outputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Verification
SELECT 'Agent tables created successfully' as status;
