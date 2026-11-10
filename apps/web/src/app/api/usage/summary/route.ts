import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUsageSummary } from "@/lib/services/quota"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const summary = await getUsageSummary(organizationId)
  return NextResponse.json(summary)
}
