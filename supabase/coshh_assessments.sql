-- =============================================
-- COSHH ASSESSMENTS TABLE
-- Main table for COSHH risk assessments
-- =============================================

-- Drop existing table if re-running
DROP TABLE IF EXISTS public.coshh_assessments CASCADE;

-- Create COSHH Assessments Table
CREATE TABLE IF NOT EXISTS public.coshh_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,

    -- Assessment metadata
    assessment_title TEXT NOT NULL,
    assessment_reference VARCHAR(50), -- e.g., "COSHH-2024-001"
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'in_review', 'approved', 'archived'

    -- Section 1: Assessment Information
    site_location TEXT,
    department TEXT,
    assessor_name TEXT,
    assessment_date DATE,
    review_date DATE,

    -- Section 2: Usage, Environment & Personnel
    activities TEXT[],
    work_area TEXT,
    environment_type TEXT, -- "Indoor", "Outdoor", "Enclosed space", etc.
    number_of_workers INTEGER,
    vulnerable_groups TEXT[],

    -- Shared data (stored as JSONB for flexibility)
    shared_data JSONB, -- Contains additional assessment data

    -- Chemicals data (from SDS uploads)
    chemicals JSONB, -- Array of chemical objects with H/P codes

    -- Auto-populated control measures (from P-phrases)
    operational_controls TEXT[],
    ppe_requirements TEXT[],
    first_aid_measures JSONB, -- {general, ingestion, skin, eye, inhalation}
    fire_response JSONB, -- {response, fighting, evacuation}
    spill_response JSONB, -- {response, environmental}
    storage_handling JSONB, -- {storage, handling, disposal}

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coshh_assessments_user ON public.coshh_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_coshh_assessments_company ON public.coshh_assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_coshh_assessments_status ON public.coshh_assessments(status);

-- Enable RLS
ALTER TABLE public.coshh_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own assessments or company assessments
CREATE POLICY "Users can access their own assessments" ON public.coshh_assessments
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can access company assessments" ON public.coshh_assessments
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.coshh_assessments TO authenticated;

-- Add comments
COMMENT ON TABLE public.coshh_assessments IS 'COSHH risk assessments with chemical hazards and control measures';
COMMENT ON COLUMN public.coshh_assessments.chemicals IS 'Array of chemical objects from SDS uploads: [{name, cas_number, h_codes, p_codes, manufacturer, etc.}]';
COMMENT ON COLUMN public.coshh_assessments.shared_data IS 'Flexible JSONB field for additional assessment data';
