import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getSubscription } from "@/lib/services/subscription"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const sub = await getSubscription(organizationId)
  return NextResponse.json(sub ?? { plan: "free" })
}
