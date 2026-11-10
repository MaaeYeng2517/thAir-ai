import { createServerClient } from "@/lib/supabase/server"
import { aiGateway } from "@/lib/ai/gateway"
import { addMessage, getConversation, createConversation, getMessages } from "@/lib/services/conversation"
import { searchChunks } from "@/lib/knowledge/ingest"
import { getUserOrganization } from "@/lib/services/currentOrg"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { organizationId } = await getUserOrganization()

  let body: {
    messages: { role: string; content: string }[]
    agentId?: string | null
    conversationId?: string | null
    model?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    title?: string | null
    knowledgeBaseId?: string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    messages,
    agentId,
    conversationId,
    model = "gpt-4o-mini",
    temperature = 0.7,
    maxTokens,
    systemPrompt,
    title,
    knowledgeBaseId,
  } = body

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 })
  }

  let convId: string = conversationId ?? ""
  if (!convId) {
    const lastUserMsg = messages[messages.length - 1]
    const defaultTitle = lastUserMsg?.content?.slice(0, 60) ?? "New conversation"
    const created = await createConversation({
      agentId: agentId ?? "",
      userId: user.id,
      title: title ?? defaultTitle,
    })
    convId = created.id
  }

  const conversation = await getConversation(convId)
  if (!conversation || conversation.user_id !== user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const existing = await getMessages(convId)
  const existingContents = new Set(existing.map((m) => m.content))
  for (const m of messages) {
    if (m.role === "user" && !existingContents.has(m.content)) {
      await addMessage({
        conversationId: convId,
        role: m.role as any,
        content: m.content,
      })
    }
  }

  const history = await getMessages(convId)
  const chatMessages = history.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content }))

  let ragContext = ""
  if (knowledgeBaseId) {
    try {
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage?.role === "user") {
        const results = await searchChunks({
          knowledgeBaseId,
          query: lastUserMessage.content,
          matchCount: 5,
        })
        if (results.length > 0) {
          ragContext = "\n\nRelevant knowledge base context:\n" + results.map((r) => r.content).join("\n---\n")
        }
      }
    } catch {
      // RAG is best-effort
    }
  }

  const finalSystemPrompt = systemPrompt ? systemPrompt + ragContext : ragContext || undefined

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await aiGateway.streamChat(
          {
            provider: "openai",
            model,
            temperature,
            maxTokens: maxTokens ?? undefined,
            systemPrompt: finalSystemPrompt,
            messages: chatMessages,
            organizationId: organizationId ?? "",
            userId: user.id,
            agentId: agentId ?? null,
            conversationId: convId,
          },
          (token) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
          }
        )

        await addMessage({
          conversationId: convId,
          role: "assistant",
          content: result.content,
          tokens: result.tokensOutput,
        })

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              conversationId: convId,
              tokensInput: result.tokensInput,
              tokensOutput: result.tokensOutput,
              estimatedCost: result.estimatedCost,
            })}\n\n`
          )
        )
        controller.close()
      } catch (err: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message ?? String(err) })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
