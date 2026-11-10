import { createServerClient } from "@/lib/supabase/server"

export type Plan = "free" | "pro" | "enterprise"

export const PLAN_LIMITS: Record<Plan, { monthlyTokens: number; agents: number; knowledgeBases: number }> = {
  free: { monthlyTokens: 5000, agents: 3, knowledgeBases: 1 },
  pro: { monthlyTokens: 100000, agents: 50, knowledgeBases: 20 },
  enterprise: { monthlyTokens: -1, agents: -1, knowledgeBases: -1 },
}

export interface DbSubscription {
  id: string
  organization_id: string
  status: string
  plan: Plan
  created_at: string
  updated_at: string
}

export async function getSubscription(organizationId: string): Promise<DbSubscription | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error) return null
  return data as DbSubscription
}

export async function createSubscription(params: {
  organizationId: string
  plan?: Plan
}): Promise<DbSubscription> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      organization_id: params.organizationId,
      plan: params.plan ?? "free",
      status: "active",
    })
    .select()
    .single()

  if (error) throw error
  return data as DbSubscription
}

export async function updateSubscriptionPlan(organizationId: string, plan: Plan): Promise<DbSubscription> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error) throw error
  return data as DbSubscription
}

export function getPlanLimit(plan: Plan, metric: "monthlyTokens" | "agents" | "knowledgeBases"): number {
  return PLAN_LIMITS[plan][metric]
}

export function isUnlimited(limit: number): boolean {
  return limit < 0
}
