import { createServerClient } from "@/lib/supabase/server"
import * as pdfParse from "pdf-parse"
import mammoth from "mammoth"

export type Chunk = {
  content: string
  chunkIndex: number
  metadata: Record<string, unknown>
}

export function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  const arrayBufferPromise = file.arrayBuffer()

  if (name.endsWith(".pdf")) {
    return arrayBufferPromise.then(async (buf) => {
      const data = Buffer.from(buf)
      const pdf = new pdfParse.PDFParse({ data })
      const text = await pdf.getText()
      return text.text
    })
  }

  if (name.endsWith(".docx")) {
    return arrayBufferPromise.then((buf) =>
      mammoth.extractRawText({ buffer: Buffer.from(buf) }).then((res: any) => res.value)
    )
  }

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return file.text()
  }

  throw new Error(`Unsupported file type: ${file.name}`)
}

export function chunkText(text: string, maxChars = 1000, overlap = 200): Chunk[] {
  const chunks: Chunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length)

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end)
      const lastNewline = text.lastIndexOf("\n", end)
      const breakPoint = Math.max(lastPeriod, lastNewline)
      if (breakPoint > start && breakPoint < end) {
        end = breakPoint + 1
      }
    }

    const content = text.slice(start, end).trim()
    if (content.length > 0) {
      chunks.push({ content, chunkIndex: index, metadata: {} })
      index++
    }

    start = end - overlap
    if (start < 0) start = 0
    if (start >= text.length) break
  }

  return chunks
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured")

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Embedding failed: ${err}`)
  }

  const data = await res.json()
  return data.data.map((item: any) => item.embedding)
}

export async function ingestDocument(params: {
  knowledgeBaseId: string
  filename: string
  storagePath: string
  mimeType: string | null
  file: File
  organizationId: string
  userId: string
}) {
  const supabase = createServerClient()

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      knowledge_base_id: params.knowledgeBaseId,
      filename: params.filename,
      storage_path: params.storagePath,
      mime_type: params.mimeType,
      status: "processing",
      chunk_count: 0,
    })
    .select()
    .single()

  if (docError) throw docError

  try {
    const text = await extractText(params.file)
    const chunks = chunkText(text)
    const embeddings = await embedTexts(chunks.map((c) => c.content))

    const chunkRows = chunks.map((c, i) => ({
      document_id: doc.id,
      content: c.content,
      embedding: embeddings[i],
      metadata: c.metadata,
      chunk_index: c.chunkIndex,
    }))

    const { error: chunkError } = await supabase.from("document_chunks").insert(chunkRows)
    if (chunkError) throw chunkError

    await supabase
      .from("documents")
      .update({ status: "ready", chunk_count: chunks.length })
      .eq("id", doc.id)

    return { documentId: doc.id, chunkCount: chunks.length }
  } catch (err) {
    await supabase.from("documents").update({ status: "error" }).eq("id", doc.id)
    throw err
  }
}

export async function searchChunks(params: {
  knowledgeBaseId: string
  query: string
  matchThreshold?: number
  matchCount?: number
}) {
  const supabase = createServerClient()
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured")

  const [queryEmbedding] = await embedTexts([params.query])

  const { data, error } = await supabase.rpc("match_document_chunks", {
    kb_id: params.knowledgeBaseId,
    query_embedding: queryEmbedding,
    match_threshold: params.matchThreshold ?? 0.3,
    match_count: params.matchCount ?? 5,
  })

  if (error) throw error
  return (data ?? []) as Array<{
    id: string
    content: string
    similarity: number
    document_id: string
    chunk_index: number
  }>
}
