import { createServerClient } from "@/lib/supabase/server"
import { getSubscription, getPlanLimit, isUnlimited } from "@/lib/services/subscription"

export interface UsageSummary {
  tokensInput: number
  tokensOutput: number
  estimatedCost: number
  monthStart: string
}

export async function getUsageSummary(organizationId: string): Promise<UsageSummary> {
  const supabase = createServerClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data, error } = await supabase
    .from("usage_records")
    .select("tokens_input, tokens_output, estimated_cost")
    .eq("organization_id", organizationId)
    .gte("created_at", monthStart)

  if (error) {
    return { tokensInput: 0, tokensOutput: 0, estimatedCost: 0, monthStart }
  }

  const records = data as Array<{ tokens_input: number; tokens_output: number; estimated_cost: number }>
  const tokensInput = records.reduce((sum, r) => sum + (r.tokens_input ?? 0), 0)
  const tokensOutput = records.reduce((sum, r) => sum + (r.tokens_output ?? 0), 0)
  const estimatedCost = records.reduce((sum, r) => sum + Number(r.estimated_cost ?? 0), 0)

  return { tokensInput, tokensOutput, estimatedCost, monthStart }
}

export async function checkQuota(organizationId: string, metric: "tokens" | "agents" | "knowledgeBases"): Promise<{
  allowed: boolean
  used: number
  limit: number
  remaining: number
}> {
  const subscription = await getSubscription(organizationId)
  const plan: "free" | "pro" | "enterprise" = (subscription?.plan as any) ?? "free"

  if (metric === "tokens") {
    const usage = await getUsageSummary(organizationId)
    const limit = getPlanLimit(plan, "monthlyTokens")
    if (isUnlimited(limit)) {
      return { allowed: true, used: usage.tokensInput + usage.tokensOutput, limit: -1, remaining: -1 }
    }
    const used = usage.tokensInput + usage.tokensOutput
    const remaining = Math.max(0, limit - used)
    return { allowed: used < limit, used, limit, remaining }
  }

  // For agents/knowledgeBases, count existing records
  if (metric === "agents") {
    const { count } = await createServerClient()
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
    const limit = getPlanLimit(plan, "agents")
    if (isUnlimited(limit)) return { allowed: true, used: count ?? 0, limit: -1, remaining: -1 }
    const used = count ?? 0
    const remaining = Math.max(0, limit - used)
    return { allowed: used < limit, used, limit, remaining }
  }

  if (metric === "knowledgeBases") {
    const { count } = await createServerClient()
      .from("knowledge_bases")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
    const limit = getPlanLimit(plan, "knowledgeBases")
    if (isUnlimited(limit)) return { allowed: true, used: count ?? 0, limit: -1, remaining: -1 }
    const used = count ?? 0
    const remaining = Math.max(0, limit - used)
    return { allowed: used < limit, used, limit, remaining }
  }

  return { allowed: true, used: 0, limit: -1, remaining: -1 }
}
