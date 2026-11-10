export type Role = "admin" | "owner" | "member" | "viewer"
export type Plan = "free" | "pro" | "enterprise"
export type AgentStatus = "active" | "inactive"
export type RunStatus = "pending" | "running" | "completed" | "failed"

export interface Profile {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role: Role
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: Plan
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: Role
  created_at: string
}

export interface Subscription {
  id: string
  organization_id: string
  status: string
  plan: Plan
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  id: string
  organization_id: string
  user_id: string
  agent_id?: string | null
  provider: string
  model: string
  tokens_input: number
  tokens_output: number
  estimated_cost: number
  created_at: string
}

export interface AIProvider {
  id: string
  name: string
  is_enabled: boolean
  created_at: string
}

export interface AIModel {
  id: string
  provider_id: string
  name: string
  context_window?: number | null
  input_cost_per_1k: number
  output_cost_per_1k: number
  is_enabled: boolean
  created_at: string
}

export interface Agent {
  id: string
  organization_id: string
  owner_id: string
  name: string
  description?: string | null
  system_prompt?: string | null
  model_id: string
  temperature: number
  max_tokens: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  agent_id: string
  user_id: string
  title?: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  tokens: number
  created_at: string
}

export interface KnowledgeBase {
  id: string
  organization_id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  knowledge_base_id: string
  filename: string
  storage_path: string
  mime_type?: string | null
  status: "pending" | "processing" | "ready" | "error"
  chunk_count: number
  created_at: string
  updated_at: string
}

export interface ToolIntegration {
  id: string
  organization_id: string
  name: string
  type: string
  config: Record<string, unknown>
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  organization_id: string
  owner_id: string
  name: string
  definition: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: RunStatus
  input: Record<string, unknown>
  output: Record<string, unknown>
  started_at?: string | null
  completed_at?: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id?: string | null
  action: string
  target_type?: string | null
  target_id?: string | null
  metadata: Record<string, unknown>
  created_at: string
}
