import { createClient } from '@/lib/supabase/server';
import type {
  ProcessStep,
  Task,
  TaskRiskScoring,
  CreateProcessStepInput,
  CreateTaskInput,
} from '@/types/process-steps';

/**
 * Get all process steps for a COSHH assessment
 */
export async function getProcessSteps(assessmentId: string): Promise<ProcessStep[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_steps')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('step_number');

  if (error) {
    console.error('Error fetching process steps:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all tasks for a process step (with risk scoring)
 */
export async function getTasks(processStepId: string): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      risk_scoring:task_risk_scoring(*)
    `)
    .eq('process_step_id', processStepId)
    .order('task_order');

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all process steps with tasks for an assessment
 */
export async function getProcessStepsWithTasks(assessmentId: string): Promise<ProcessStep[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_steps')
    .select(`
      *,
      tasks:tasks(
        *,
        risk_scoring:task_risk_scoring(*)
      )
    `)
    .eq('assessment_id', assessmentId)
    .order('step_number');

  if (error) {
    console.error('Error fetching process steps with tasks:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new process step
 */
export async function createProcessStep(input: CreateProcessStepInput): Promise<ProcessStep | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_steps')
    .insert({
      assessment_id: input.assessment_id,
      step_number: input.step_number,
      step_name: input.step_name,
      description: input.description,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating process step:', error);
    return null;
  }

  return data;
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      process_step_id: input.process_step_id,
      task_order: input.task_order,
      task_type: input.task_type,
      task_name: input.task_name,
      description: input.description,
      duration: input.duration,
      frequency: input.frequency,
      environment: input.environment,
      existing_controls: input.existing_controls,
      chemicals_involved: input.chemicals_involved,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }

  return data;
}

/**
 * Update a process step
 */
export async function updateProcessStep(
  id: string,
  updates: Partial<Omit<ProcessStep, 'id' | 'assessment_id' | 'created_at' | 'updated_at'>>
): Promise<ProcessStep | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('process_steps')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating process step:', error);
    return null;
  }

  return data;
}

/**
 * Update a task
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'process_step_id' | 'created_at' | 'updated_at'>>
): Promise<Task | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data;
}

/**
 * Delete a process step (cascades to tasks and risk scoring)
 */
export async function deleteProcessStep(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('process_steps')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting process step:', error);
    return false;
  }

  return true;
}

/**
 * Delete a task (cascades to risk scoring)
 */
export async function deleteTask(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }

  return true;
}

/**
 * Create or update task risk scoring
 */
export async function upsertTaskRiskScoring(riskScoring: Omit<TaskRiskScoring, 'id' | 'created_at' | 'updated_at'>): Promise<TaskRiskScoring | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_risk_scoring')
    .upsert({
      task_id: riskScoring.task_id,
      inhalation_severity: riskScoring.inhalation_severity,
      ingestion_severity: riskScoring.ingestion_severity,
      skin_eye_severity: riskScoring.skin_eye_severity,
      inhalation_likelihood: riskScoring.inhalation_likelihood,
      ingestion_likelihood: riskScoring.ingestion_likelihood,
      skin_eye_likelihood: riskScoring.skin_eye_likelihood,
      inhalation_risk: riskScoring.inhalation_risk,
      ingestion_risk: riskScoring.ingestion_risk,
      skin_eye_risk: riskScoring.skin_eye_risk,
      overall_risk_level: riskScoring.overall_risk_level,
      max_risk_score: riskScoring.max_risk_score,
      inhalation_rationale: riskScoring.inhalation_rationale,
      ingestion_rationale: riskScoring.ingestion_rationale,
      skin_eye_rationale: riskScoring.skin_eye_rationale,
      additional_controls_required: riskScoring.additional_controls_required,
      assessed_at: riskScoring.assessed_at,
      assessed_by_ai: riskScoring.assessed_by_ai,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'task_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting task risk scoring:', error);
    return null;
  }

  return data;
}

/**
 * Get task risk scoring
 */
export async function getTaskRiskScoring(taskId: string): Promise<TaskRiskScoring | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_risk_scoring')
    .select('*')
    .eq('task_id', taskId)
    .single();

  if (error) {
    console.error('Error fetching task risk scoring:', error);
    return null;
  }

  return data;
}
