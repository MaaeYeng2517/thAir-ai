import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ingestDocument } from "@/lib/knowledge/ingest"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(req: Request): Promise<Response> {
  const { organizationId } = await getUserOrganization()
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const knowledgeBaseId = searchParams.get("knowledgeBaseId")
  if (!knowledgeBaseId) {
    return NextResponse.json({ error: "knowledgeBaseId required" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("knowledge_base_id", knowledgeBaseId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request): Promise<Response> {
  const { organizationId, userId } = await getUserOrganization()
  if (!organizationId || !userId) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const knowledgeBaseId = formData.get("knowledgeBaseId") as string

  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 })
  if (!knowledgeBaseId) return NextResponse.json({ error: "knowledgeBaseId required" }, { status: 400 })

  const storagePath = `uploads/${organizationId}/${knowledgeBaseId}/${Date.now()}_${file.name}`

  try {
    const result = await ingestDocument({
      knowledgeBaseId,
      filename: file.name,
      storagePath,
      mimeType: file.type ?? null,
      file,
      organizationId,
      userId,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
