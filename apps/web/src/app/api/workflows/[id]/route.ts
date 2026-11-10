import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import {
  getWorkflows as listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  createWorkflowExecution,
} from "@/lib/services/workflows"

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
  const workflows = await listWorkflows("")
  const w = workflows.find((x) => x.id === id)
  if (!w) return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  return NextResponse.json(w)
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
  let body: { name?: string; definition?: Record<string, unknown>; isActive?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const workflow = await updateWorkflow(id, {
    name: body.name,
    definition: body.definition,
    isActive: body.isActive,
  })
  return NextResponse.json(workflow)
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
  await deleteWorkflow(id)
  return NextResponse.json({ ok: true })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let body: { input?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const execution = await createWorkflowExecution({
    workflowId: id,
    input: body.input ?? {},
  })
  return NextResponse.json(execution, { status: 201 })
}
