import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import {
  getToolIntegrations,
  createToolIntegration,
} from "@/lib/services/toolIntegrations"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const tools = await getToolIntegrations(organizationId)
  return NextResponse.json(tools)
}

export async function POST(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  let body: { name: string; type: string; config?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const tool = await createToolIntegration({
    organizationId,
    name: body.name,
    type: body.type,
    config: body.config,
  })
  return NextResponse.json(tool, { status: 201 })
}
