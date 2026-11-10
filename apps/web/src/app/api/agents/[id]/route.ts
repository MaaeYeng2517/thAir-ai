import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getAgent, updateAgent, deleteAgent } from "@/lib/services/agents"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const agent = await getAgent(id)
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  return NextResponse.json(agent)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await getAgent(id)
  if (!existing) return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  if (existing.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: {
    name?: string
    description?: string | null
    systemPrompt?: string | null
    modelId?: string
    temperature?: number
    maxTokens?: number
    isActive?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const agent = await updateAgent(id, {
    name: body.name,
    description: body.description,
    systemPrompt: body.systemPrompt,
    modelId: body.modelId,
    temperature: body.temperature,
    maxTokens: body.maxTokens,
    isActive: body.isActive,
  })

  return NextResponse.json(agent)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await getAgent(id)
  if (!existing) return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  if (existing.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await deleteAgent(id)
  return NextResponse.json({ ok: true })
}
