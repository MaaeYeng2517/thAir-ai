import { createServerClient } from "@/lib/supabase/server"

export async function auditLog(params: {
  organizationId: string
  userId?: string | null
  action: string
  targetType?: string | null
  targetId?: string | null
  metadata?: Record<string, unknown>
}) {
  const supabase = createServerClient()
  await supabase.from("audit_logs").insert({
    organization_id: params.organizationId,
    user_id: params.userId ?? null,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    metadata: params.metadata ?? {},
  })
}
