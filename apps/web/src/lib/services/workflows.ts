import { createServerClient } from "@/lib/supabase/server"

export type DbWorkflow = {
  id: string
  organization_id: string
  owner_id: string
  name: string
  definition: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DbWorkflowExecution = {
  id: string
  workflow_id: string
  status: "pending" | "running" | "completed" | "failed"
  input: Record<string, unknown>
  output: Record<string, unknown>
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export async function getWorkflows(organizationId: string): Promise<DbWorkflow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as DbWorkflow[]
}

export async function createWorkflow(params: {
  organizationId: string
  ownerId: string
  name: string
  definition?: Record<string, unknown>
}): Promise<DbWorkflow> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      organization_id: params.organizationId,
      owner_id: params.ownerId,
      name: params.name,
      definition: params.definition ?? {},
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbWorkflow
}

export async function updateWorkflow(id: string, params: {
  name?: string
  definition?: Record<string, unknown>
  isActive?: boolean
}): Promise<DbWorkflow> {
  const supabase = createServerClient()
  const updates: Record<string, unknown> = {}
  if (params.name !== undefined) updates.name = params.name
  if (params.definition !== undefined) updates.definition = params.definition
  if (params.isActive !== undefined) updates.is_active = params.isActive

  const { data, error } = await supabase
    .from("workflows")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as DbWorkflow
}

export async function deleteWorkflow(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from("workflows").delete().eq("id", id)
  if (error) throw error
}

export async function createWorkflowExecution(params: {
  workflowId: string
  input: Record<string, unknown>
}): Promise<DbWorkflowExecution> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("workflow_executions")
    .insert({
      workflow_id: params.workflowId,
      status: "pending",
      input: params.input,
      output: {},
    })
    .select()
    .single()

  if (error) throw error
  return data as DbWorkflowExecution
}

export async function getWorkflowExecutions(workflowId: string): Promise<DbWorkflowExecution[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("created_at", { ascending: false })

  if (error) return []
  return (data ?? []) as DbWorkflowExecution[]
}
