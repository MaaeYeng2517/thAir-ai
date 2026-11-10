import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("knowledge_bases")
    .select("*, documents(count)")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  let body: { name: string; description?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("knowledge_bases")
    .insert({
      organization_id: organizationId,
      name: body.name,
      description: body.description ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
