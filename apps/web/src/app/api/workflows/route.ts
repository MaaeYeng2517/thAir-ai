import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import {
  getWorkflows,
  createWorkflow,
} from "@/lib/services/workflows"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const workflows = await getWorkflows(organizationId)
  return NextResponse.json(workflows)
}

export async function POST(req: Request): Promise<Response> {
  const { organizationId, userId } = await getUserOrganization()
  if (!organizationId || !userId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  let body: { name: string; definition?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const workflow = await createWorkflow({
    organizationId,
    ownerId: userId,
    name: body.name,
    definition: body.definition,
  })
  return NextResponse.json(workflow, { status: 201 })
}
