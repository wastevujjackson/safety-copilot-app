-- =============================================
-- EH40 WORKPLACE EXPOSURE LIMITS (WELs)
-- HSE Guidance - UK Occupational Exposure Limits
-- =============================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS public.eh40_biological_monitoring CASCADE;
DROP TABLE IF EXISTS public.eh40_synonyms CASCADE;
DROP TABLE IF EXISTS public.eh40_exposure_limits CASCADE;

-- Create EH40 Exposure Limits Table
CREATE TABLE IF NOT EXISTS public.eh40_exposure_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Chemical identification
    substance_name TEXT NOT NULL,
    cas_number VARCHAR(20),

    -- Workplace Exposure Limits (8-hour TWA and 15-min STEL)
    long_term_limit_8hr_twa_ppm DECIMAL(10,4), -- 8-hour Time-Weighted Average (ppm)
    long_term_limit_8hr_twa_mgm3 DECIMAL(10,4), -- 8-hour TWA (mg/m³)
    short_term_limit_15min_ppm DECIMAL(10,4), -- 15-minute Short-Term Exposure Limit (ppm)
    short_term_limit_15min_mgm3 DECIMAL(10,4), -- 15-minute STEL (mg/m³)

    -- Special notations (from EH40)
    -- NOTE: These notations are NOT exhaustive (per EH40 guidance)
    -- FALSE means "not listed in EH40", NOT "definitely does not have this property"
    sk BOOLEAN DEFAULT FALSE, -- Skin notation (can be absorbed through skin)
    sen BOOLEAN DEFAULT FALSE, -- Sensitiser (may cause sensitisation)
    carc BOOLEAN DEFAULT FALSE, -- Carcinogen
    mut BOOLEAN DEFAULT FALSE, -- Mutagen
    repr BOOLEAN DEFAULT FALSE, -- Reproductive toxicant
    resp BOOLEAN DEFAULT FALSE, -- Respiratory sensitiser
    asthmagen BOOLEAN DEFAULT FALSE, -- Can cause occupational asthma

    -- Additional notes and guidance
    notes TEXT,
    comments TEXT,

    -- Flag to indicate if substance needs additional hazard research
    requires_additional_hazard_check BOOLEAN DEFAULT FALSE,

    -- EH40 publication reference
    eh40_edition VARCHAR(20), -- e.g., "EH40/2023"

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure substance name + CAS is unique
    UNIQUE(substance_name, cas_number)
);

-- Create EH40 Synonyms Table (for substance name lookups)
CREATE TABLE IF NOT EXISTS public.eh40_synonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eh40_substance_id UUID NOT NULL REFERENCES public.eh40_exposure_limits(id) ON DELETE CASCADE,

    synonym_name TEXT NOT NULL,
    synonym_type VARCHAR(50), -- "Common name", "Trade name", "Chemical name", "IUPAC name"

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Index for fast synonym lookups
    UNIQUE(eh40_substance_id, synonym_name)
);

-- Create EH40 Biological Monitoring Table
CREATE TABLE IF NOT EXISTS public.eh40_biological_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eh40_substance_id UUID NOT NULL REFERENCES public.eh40_exposure_limits(id) ON DELETE CASCADE,

    -- Biological monitoring guidance
    determinand TEXT NOT NULL, -- What to measure (e.g., "Lead in blood", "Chromium in urine")
    sampling_time TEXT, -- When to sample (e.g., "End of shift", "End of work week")
    biological_guidance_value DECIMAL(10,4), -- BGV value
    biological_guidance_unit VARCHAR(50), -- Unit (e.g., "µmol/L", "µg/L", "mg/g creatinine")

    -- Additional guidance
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One biological monitoring per substance + determinand
    UNIQUE(eh40_substance_id, determinand)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_eh40_substance_name ON public.eh40_exposure_limits(substance_name);
CREATE INDEX IF NOT EXISTS idx_eh40_cas_number ON public.eh40_exposure_limits(cas_number);
CREATE INDEX IF NOT EXISTS idx_eh40_synonyms_name ON public.eh40_synonyms(synonym_name);
CREATE INDEX IF NOT EXISTS idx_eh40_synonyms_substance ON public.eh40_synonyms(eh40_substance_id);
CREATE INDEX IF NOT EXISTS idx_eh40_bio_substance ON public.eh40_biological_monitoring(eh40_substance_id);

-- Create full-text search index on substance names and synonyms
CREATE INDEX IF NOT EXISTS idx_eh40_substance_fulltext ON public.eh40_exposure_limits USING GIN(to_tsvector('english', substance_name));
CREATE INDEX IF NOT EXISTS idx_eh40_synonyms_fulltext ON public.eh40_synonyms USING GIN(to_tsvector('english', synonym_name));

-- Enable RLS (read-only for all authenticated users)
ALTER TABLE public.eh40_exposure_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eh40_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eh40_biological_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for authenticated users)
CREATE POLICY "Allow read access to all authenticated users" ON public.eh40_exposure_limits
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON public.eh40_synonyms
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON public.eh40_biological_monitoring
    FOR SELECT TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON public.eh40_exposure_limits TO authenticated;
GRANT SELECT ON public.eh40_synonyms TO authenticated;
GRANT SELECT ON public.eh40_biological_monitoring TO authenticated;

-- Add comments
COMMENT ON TABLE public.eh40_exposure_limits IS 'HSE EH40 Workplace Exposure Limits (WELs) - UK occupational exposure standards';
COMMENT ON TABLE public.eh40_synonyms IS 'Alternative names and synonyms for EH40 substances to aid lookup';
COMMENT ON TABLE public.eh40_biological_monitoring IS 'Biological monitoring guidance values from EH40';

COMMENT ON COLUMN public.eh40_exposure_limits.long_term_limit_8hr_twa_ppm IS '8-hour time-weighted average exposure limit (ppm)';
COMMENT ON COLUMN public.eh40_exposure_limits.short_term_limit_15min_ppm IS '15-minute short-term exposure limit (ppm)';
COMMENT ON COLUMN public.eh40_exposure_limits.sk IS 'Skin notation - substance can be absorbed through skin';
COMMENT ON COLUMN public.eh40_exposure_limits.sen IS 'Sensitiser - may cause allergic reaction';
COMMENT ON COLUMN public.eh40_exposure_limits.carc IS 'Carcinogen classification';
COMMENT ON COLUMN public.eh40_biological_monitoring.determinand IS 'Biological marker to measure (e.g., Lead in blood)';
COMMENT ON COLUMN public.eh40_biological_monitoring.biological_guidance_value IS 'Biological Guidance Value (BGV)';
