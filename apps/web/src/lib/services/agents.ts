import { createServerClient } from "@/lib/supabase/server"

export type DbAgent = {
  id: string
  organization_id: string
  owner_id: string
  name: string
  description: string | null
  system_prompt: string | null
  model_id: string
  temperature: number
  max_tokens: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAgents(organizationId: string): Promise<DbAgent[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as DbAgent[]
}

export async function getAgent(id: string): Promise<DbAgent | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("agents").select("*").eq("id", id).single()
  if (error) return null
  return data as DbAgent
}

export async function createAgent(params: {
  organizationId: string
  ownerId: string
  name: string
  description?: string | null
  systemPrompt?: string | null
  modelId: string
  temperature?: number
  maxTokens?: number
}): Promise<DbAgent> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("agents")
    .insert({
      organization_id: params.organizationId,
      owner_id: params.ownerId,
      name: params.name,
      description: params.description ?? null,
      system_prompt: params.systemPrompt ?? null,
      model_id: params.modelId,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4096,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbAgent
}

export async function updateAgent(id: string, params: {
  name?: string
  description?: string | null
  systemPrompt?: string | null
  modelId?: string
  temperature?: number
  maxTokens?: number
  isActive?: boolean
}): Promise<DbAgent> {
  const supabase = createServerClient()
  const updates: Record<string, unknown> = {}
  if (params.name !== undefined) updates.name = params.name
  if (params.description !== undefined) updates.description = params.description
  if (params.systemPrompt !== undefined) updates.system_prompt = params.systemPrompt
  if (params.modelId !== undefined) updates.model_id = params.modelId
  if (params.temperature !== undefined) updates.temperature = params.temperature
  if (params.maxTokens !== undefined) updates.max_tokens = params.maxTokens
  if (params.isActive !== undefined) updates.is_active = params.isActive

  const { data, error } = await supabase.from("agents").update(updates).eq("id", id).select().single()
  if (error) throw error
  return data as DbAgent
}

export async function deleteAgent(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from("agents").delete().eq("id", id)
  if (error) throw error
}
