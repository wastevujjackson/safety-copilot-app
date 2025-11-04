-- =============================================
-- HAZARD AND PRECAUTIONARY STATEMENTS TABLES
-- For COSHH Assessment Generation
-- =============================================

-- Drop existing tables and policies if re-running
DROP TABLE IF EXISTS public.h_phrases CASCADE;
DROP TABLE IF EXISTS public.p_phrases CASCADE;

-- Create H-Phrases (Hazard Statements) Table
CREATE TABLE IF NOT EXISTS public.h_phrases (
    code VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    hazard_class VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    -- Risk scoring for exposure routes (1-5 scale for severity)
    inhalation_severity INTEGER CHECK (inhalation_severity BETWEEN 1 AND 5),
    ingestion_severity INTEGER CHECK (ingestion_severity BETWEEN 1 AND 5),
    skin_eye_severity INTEGER CHECK (skin_eye_severity BETWEEN 1 AND 5),
    other_severity INTEGER CHECK (other_severity BETWEEN 1 AND 5),
    -- Additional metadata
    signal_word VARCHAR(20), -- "Danger" or "Warning"
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create P-Phrases (Precautionary Statements) Table
CREATE TABLE IF NOT EXISTS public.p_phrases (
    code VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    statement_type VARCHAR(50) NOT NULL, -- "Prevention", "Response", "Storage", "Disposal"
    category VARCHAR(100), -- More specific category

    -- Map to COSHH Assessment Sections
    -- Section 5: Operational Controls & Precautions
    relates_to_operational_controls BOOLEAN DEFAULT FALSE,
    relates_to_ventilation BOOLEAN DEFAULT FALSE,
    relates_to_ignition_sources BOOLEAN DEFAULT FALSE,
    relates_to_hygiene BOOLEAN DEFAULT FALSE,

    -- Section 6: PPE Requirements
    relates_to_ppe BOOLEAN DEFAULT FALSE,

    -- Section 10: First Aid (Emergency Response - Medical)
    relates_to_first_aid BOOLEAN DEFAULT FALSE,
    relates_to_first_aid_ingestion BOOLEAN DEFAULT FALSE,
    relates_to_first_aid_skin BOOLEAN DEFAULT FALSE,
    relates_to_first_aid_eye BOOLEAN DEFAULT FALSE,
    relates_to_first_aid_inhalation BOOLEAN DEFAULT FALSE,

    -- Section 11: Fire (Emergency Response - Fire)
    relates_to_fire_response BOOLEAN DEFAULT FALSE,
    relates_to_fire_fighting BOOLEAN DEFAULT FALSE,
    relates_to_fire_evacuation BOOLEAN DEFAULT FALSE,

    -- Section 12: Environment (Emergency Response - Spill)
    relates_to_spill_response BOOLEAN DEFAULT FALSE,
    relates_to_environmental_release BOOLEAN DEFAULT FALSE,

    -- Section 13: Storage and Handling
    relates_to_storage BOOLEAN DEFAULT FALSE,
    relates_to_handling BOOLEAN DEFAULT FALSE,
    relates_to_disposal BOOLEAN DEFAULT FALSE,

    -- General
    relates_to_training BOOLEAN DEFAULT FALSE,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_h_phrases_hazard_class ON public.h_phrases(hazard_class);
CREATE INDEX IF NOT EXISTS idx_h_phrases_signal_word ON public.h_phrases(signal_word);
CREATE INDEX IF NOT EXISTS idx_p_phrases_type ON public.p_phrases(statement_type);

-- Enable RLS
ALTER TABLE public.h_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p_phrases ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for all authenticated users)
CREATE POLICY "Allow read access to all authenticated users" ON public.h_phrases
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON public.p_phrases
    FOR SELECT TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON public.h_phrases TO authenticated;
GRANT SELECT ON public.p_phrases TO authenticated;

COMMENT ON TABLE public.h_phrases IS 'GHS/CLP Hazard Statements (H-phrases) with severity scoring for COSHH risk assessment';
COMMENT ON TABLE public.p_phrases IS 'GHS/CLP Precautionary Statements (P-phrases) mapped to control measures';
