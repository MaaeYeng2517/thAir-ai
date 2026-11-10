import { createServerClient } from "@/lib/supabase/server"

export type DbToolIntegration = {
  id: string
  organization_id: string
  name: string
  type: string
  config: Record<string, unknown>
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export async function getToolIntegrations(organizationId: string): Promise<DbToolIntegration[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("tool_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as DbToolIntegration[]
}

export async function createToolIntegration(params: {
  organizationId: string
  name: string
  type: string
  config?: Record<string, unknown>
}): Promise<DbToolIntegration> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("tool_integrations")
    .insert({
      organization_id: params.organizationId,
      name: params.name,
      type: params.type,
      config: params.config ?? {},
      is_enabled: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbToolIntegration
}

export async function updateToolIntegration(id: string, params: {
  name?: string
  type?: string
  config?: Record<string, unknown>
  isEnabled?: boolean
}): Promise<DbToolIntegration> {
  const supabase = createServerClient()
  const updates: Record<string, unknown> = {}
  if (params.name !== undefined) updates.name = params.name
  if (params.type !== undefined) updates.type = params.type
  if (params.config !== undefined) updates.config = params.config
  if (params.isEnabled !== undefined) updates.is_enabled = params.isEnabled

  const { data, error } = await supabase
    .from("tool_integrations")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as DbToolIntegration
}

export async function deleteToolIntegration(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from("tool_integrations").delete().eq("id", id)
  if (error) throw error
}
