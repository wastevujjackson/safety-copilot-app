-- =============================================
-- PROCESS STEPS AND TASKS TABLES
-- For Task-Level Risk Scoring in COSHH Assessments
-- =============================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS public.task_risk_scoring CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.process_steps CASCADE;

-- Create Process Steps Table
CREATE TABLE IF NOT EXISTS public.process_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.coshh_assessments(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure step numbers are unique per assessment
    UNIQUE(assessment_id, step_number)
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_step_id UUID NOT NULL REFERENCES public.process_steps(id) ON DELETE CASCADE,
    task_order INTEGER NOT NULL,
    task_type VARCHAR(100) NOT NULL, -- "Mixing", "Decanting", "Spraying", "Brushing", "Cleaning", etc.
    task_name TEXT NOT NULL,
    description TEXT,

    -- Task context for risk assessment
    duration VARCHAR(100), -- "5 minutes", "1 hour", "Continuous"
    frequency VARCHAR(100), -- "Once per shift", "Daily", "Weekly"
    environment TEXT, -- "Enclosed space", "Well-ventilated area", "Outdoor", "Fume hood"
    existing_controls TEXT[], -- Array of existing controls

    -- Chemicals involved (store as array of chemical names or IDs from SDS data)
    chemicals_involved JSONB NOT NULL, -- Array of {id, name, hCodes, physicalState, etc.}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure task order is unique per process step
    UNIQUE(process_step_id, task_order)
);

-- Create Task Risk Scoring Table
CREATE TABLE IF NOT EXISTS public.task_risk_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,

    -- Severity scores (from H-phrases via database)
    inhalation_severity INTEGER CHECK (inhalation_severity BETWEEN 0 AND 5),
    ingestion_severity INTEGER CHECK (ingestion_severity BETWEEN 0 AND 5),
    skin_eye_severity INTEGER CHECK (skin_eye_severity BETWEEN 0 AND 5),

    -- Likelihood scores (from ChatGPT based on task context)
    inhalation_likelihood INTEGER CHECK (inhalation_likelihood BETWEEN 0 AND 5),
    ingestion_likelihood INTEGER CHECK (ingestion_likelihood BETWEEN 0 AND 5),
    skin_eye_likelihood INTEGER CHECK (skin_eye_likelihood BETWEEN 0 AND 5),

    -- Risk scores (severity × likelihood)
    inhalation_risk INTEGER,
    ingestion_risk INTEGER,
    skin_eye_risk INTEGER,

    -- Overall risk level
    overall_risk_level VARCHAR(20), -- "Low", "Medium", "High", "Very High"
    max_risk_score INTEGER, -- Highest individual risk score

    -- Rationale and recommendations from ChatGPT
    inhalation_rationale TEXT,
    ingestion_rationale TEXT,
    skin_eye_rationale TEXT,
    additional_controls_required TEXT[], -- Array of additional controls needed

    -- Metadata
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by_ai BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One risk scoring per task
    UNIQUE(task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_process_steps_assessment ON public.process_steps(assessment_id);
CREATE INDEX IF NOT EXISTS idx_tasks_process_step ON public.tasks(process_step_id);
CREATE INDEX IF NOT EXISTS idx_task_risk_scoring_task ON public.task_risk_scoring(task_id);

-- Enable RLS
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_risk_scoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Process Steps: Users can only access their own assessments' process steps
CREATE POLICY "Users can access their own process steps" ON public.process_steps
    FOR ALL TO authenticated
    USING (
        assessment_id IN (
            SELECT id FROM public.coshh_assessments
            WHERE user_id = auth.uid()
        )
    );

-- Tasks: Users can only access their own process steps' tasks
CREATE POLICY "Users can access their own tasks" ON public.tasks
    FOR ALL TO authenticated
    USING (
        process_step_id IN (
            SELECT ps.id FROM public.process_steps ps
            JOIN public.coshh_assessments ca ON ps.assessment_id = ca.id
            WHERE ca.user_id = auth.uid()
        )
    );

-- Task Risk Scoring: Users can only access their own tasks' risk scoring
CREATE POLICY "Users can access their own task risk scoring" ON public.task_risk_scoring
    FOR ALL TO authenticated
    USING (
        task_id IN (
            SELECT t.id FROM public.tasks t
            JOIN public.process_steps ps ON t.process_step_id = ps.id
            JOIN public.coshh_assessments ca ON ps.assessment_id = ca.id
            WHERE ca.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.process_steps TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.task_risk_scoring TO authenticated;

-- Add comments
COMMENT ON TABLE public.process_steps IS 'Process steps for COSHH assessments - defines workflow stages';
COMMENT ON TABLE public.tasks IS 'Individual tasks within process steps - unit of risk assessment';
COMMENT ON TABLE public.task_risk_scoring IS 'Task-level risk scoring using 5x5 matrix (severity from H-phrases, likelihood from AI)';

COMMENT ON COLUMN public.tasks.chemicals_involved IS 'JSONB array of chemicals used in this task: [{id, name, hCodes, physicalState, volatility, concentration}]';
COMMENT ON COLUMN public.task_risk_scoring.inhalation_severity IS 'Maximum severity from H-phrases for chemicals in task (1-5 scale)';
COMMENT ON COLUMN public.task_risk_scoring.inhalation_likelihood IS 'AI-assessed likelihood based on task context (1-5 scale)';
COMMENT ON COLUMN public.task_risk_scoring.inhalation_risk IS 'Risk score = severity × likelihood (max 25)';
