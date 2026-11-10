import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { updateToolIntegration, deleteToolIntegration } from "@/lib/services/toolIntegrations"

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

  let body: { name?: string; type?: string; config?: Record<string, unknown>; isEnabled?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const tool = await updateToolIntegration(id, {
    name: body.name,
    type: body.type,
    config: body.config,
    isEnabled: body.isEnabled,
  })
  return NextResponse.json(tool)
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
  await deleteToolIntegration(id)
  return NextResponse.json({ ok: true })
}
