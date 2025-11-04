-- =============================================
-- PROCESS-GENERATED HAZARDS LIBRARY
-- Substances without SDS that require COSHH assessment
-- =============================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS public.process_hazard_control_measures CASCADE;
DROP TABLE IF EXISTS public.process_generated_hazards CASCADE;

-- Create Process-Generated Hazards Table
CREATE TABLE IF NOT EXISTS public.process_generated_hazards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Hazard identification
    hazard_name TEXT NOT NULL UNIQUE,
    hazard_category VARCHAR(100) NOT NULL, -- "Welding fumes", "Wood dust", "Silica dust", etc.
    process_type TEXT NOT NULL, -- "Welding", "Cutting", "Grinding", "Sanding", etc.

    -- Physical properties
    physical_form VARCHAR(50) NOT NULL, -- "Fume", "Dust", "Mist", "Gas", "Vapour"
    particle_size VARCHAR(50), -- "Respirable (<10 µm)", "Inhalable (<100 µm)", "Total"

    -- Hazard classification (GHS/CLP equivalent)
    -- Since no SDS exists, we assign equivalent H-codes based on known hazards
    equivalent_h_codes TEXT[], -- e.g., ["H350", "H334", "H335"]
    hazard_description TEXT NOT NULL,

    -- EH40 Workplace Exposure Limits (if applicable)
    has_eh40_wel BOOLEAN DEFAULT FALSE,
    eh40_substance_id UUID REFERENCES public.eh40_exposure_limits(id),
    wel_8hr_twa_mgm3 DECIMAL(10,4), -- Direct WEL if not in EH40
    wel_15min_stel_mgm3 DECIMAL(10,4),
    wel_notes TEXT,

    -- Special classifications
    is_carcinogen BOOLEAN DEFAULT FALSE,
    is_respiratory_sensitiser BOOLEAN DEFAULT FALSE,
    is_asthmagen BOOLEAN DEFAULT FALSE,
    is_skin_sensitiser BOOLEAN DEFAULT FALSE,

    -- Severity scoring (for risk assessment)
    inhalation_severity INTEGER CHECK (inhalation_severity BETWEEN 1 AND 5),
    skin_eye_severity INTEGER CHECK (skin_eye_severity BETWEEN 0 AND 5),
    ingestion_severity INTEGER CHECK (ingestion_severity BETWEEN 0 AND 5),

    -- Additional information
    health_effects TEXT, -- Long-term health effects
    acute_effects TEXT, -- Short-term symptoms
    target_organs TEXT[], -- e.g., ["Lungs", "Respiratory system", "Eyes"]

    -- Regulatory notes
    hse_guidance_link TEXT,
    additional_notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Process Hazard Control Measures Table
-- Pre-populated control measures specific to each hazard
CREATE TABLE IF NOT EXISTS public.process_hazard_control_measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hazard_id UUID NOT NULL REFERENCES public.process_generated_hazards(id) ON DELETE CASCADE,

    -- Control hierarchy
    control_type VARCHAR(50) NOT NULL, -- "Elimination", "Substitution", "Engineering", "Administrative", "PPE"
    control_order INTEGER NOT NULL, -- Order in hierarchy (1 = most effective)

    -- Control measure details
    control_measure TEXT NOT NULL,
    effectiveness VARCHAR(20), -- "High", "Medium", "Low"

    -- Relates to COSHH sections (like P-phrases)
    relates_to_operational_controls BOOLEAN DEFAULT FALSE,
    relates_to_ventilation BOOLEAN DEFAULT FALSE,
    relates_to_ppe BOOLEAN DEFAULT FALSE,
    relates_to_monitoring BOOLEAN DEFAULT FALSE,
    relates_to_health_surveillance BOOLEAN DEFAULT FALSE,

    -- Additional guidance
    implementation_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique combination of hazard + control measure
    UNIQUE(hazard_id, control_measure)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_process_hazards_category ON public.process_generated_hazards(hazard_category);
CREATE INDEX IF NOT EXISTS idx_process_hazards_process_type ON public.process_generated_hazards(process_type);
CREATE INDEX IF NOT EXISTS idx_process_hazards_name ON public.process_generated_hazards(hazard_name);
CREATE INDEX IF NOT EXISTS idx_process_hazard_controls_hazard ON public.process_hazard_control_measures(hazard_id);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_process_hazards_fulltext ON public.process_generated_hazards
    USING GIN(to_tsvector('english', hazard_name || ' ' || COALESCE(hazard_description, '')));

-- Enable RLS (read-only for all authenticated users)
ALTER TABLE public.process_generated_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_hazard_control_measures ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for authenticated users)
CREATE POLICY "Allow read access to all authenticated users" ON public.process_generated_hazards
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON public.process_hazard_control_measures
    FOR SELECT TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON public.process_generated_hazards TO authenticated;
GRANT SELECT ON public.process_hazard_control_measures TO authenticated;

-- Add comments
COMMENT ON TABLE public.process_generated_hazards IS 'Library of process-generated hazards that do not have SDS (e.g., welding fumes, wood dust, silica dust)';
COMMENT ON TABLE public.process_hazard_control_measures IS 'Pre-populated control measures for process-generated hazards';

COMMENT ON COLUMN public.process_generated_hazards.equivalent_h_codes IS 'GHS H-codes that would apply if this substance had an SDS (for risk scoring)';
COMMENT ON COLUMN public.process_generated_hazards.hazard_category IS 'High-level category for grouping (Welding fumes, Wood dust, etc.)';
COMMENT ON COLUMN public.process_generated_hazards.process_type IS 'The process that generates this hazard (Welding, Cutting, Grinding, etc.)';
COMMENT ON COLUMN public.process_hazard_control_measures.control_order IS 'Order in control hierarchy (1=Elimination, 2=Substitution, 3=Engineering, 4=Admin, 5=PPE)';
