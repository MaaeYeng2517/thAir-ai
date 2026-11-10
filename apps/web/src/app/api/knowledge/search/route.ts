import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { searchChunks } from "@/lib/knowledge/ingest"

export async function POST(req: Request): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { knowledgeBaseId: string; query: string; matchThreshold?: number; matchCount?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.knowledgeBaseId) {
    return NextResponse.json({ error: "knowledgeBaseId required" }, { status: 400 })
  }
  if (!body.query) {
    return NextResponse.json({ error: "query required" }, { status: 400 })
  }

  try {
    const results = await searchChunks({
      knowledgeBaseId: body.knowledgeBaseId,
      query: body.query,
      matchThreshold: body.matchThreshold,
      matchCount: body.matchCount,
    })
    return NextResponse.json(results)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
