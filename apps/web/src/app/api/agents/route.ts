import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getAgents, createAgent } from "@/lib/services/agents"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId, userId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const agents = await getAgents(organizationId)
  return NextResponse.json(agents)
}

export async function POST(req: Request): Promise<Response> {
  const { organizationId, userId } = await getUserOrganization()
  if (!organizationId || !userId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  let body: {
    name: string
    description?: string | null
    systemPrompt?: string | null
    modelId: string
    temperature?: number
    maxTokens?: number
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const agent = await createAgent({
    organizationId,
    ownerId: userId,
    name: body.name,
    description: body.description,
    systemPrompt: body.systemPrompt,
    modelId: body.modelId,
    temperature: body.temperature,
    maxTokens: body.maxTokens,
  })

  return NextResponse.json(agent, { status: 201 })
}
