"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BotMessageSquare, Send, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  created_at?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [usage, setUsage] = useState<{ tokensInput?: number; tokensOutput?: number; estimatedCost?: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Load an existing conversation or create a default one
    setMessages([
      { role: "assistant", content: "Hello! I'm your thAir-AI assistant. How can I help you today?" },
    ])
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMsg = input
    setInput("")
    setIsStreaming(true)
    setUsage(null)

    setMessages((prev) => [...prev, { role: "user", content: userMsg }])

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
          model: "gpt-4o-mini",
          temperature: 0.7,
          systemPrompt: "You are a helpful AI assistant on the thAir-AI platform.",
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error("Failed to start chat")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6)
          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) {
              setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${parsed.error}` }])
              setIsStreaming(false)
              return
            }
            if (parsed.token) {
              assistantContent += parsed.token
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 && m.role === "assistant" ? { ...m, content: assistantContent } : m
                )
              )
            }
            if (parsed.done) {
              setConversationId(parsed.conversationId ?? conversationId)
              setUsage({
                tokensInput: parsed.tokensInput,
                tokensOutput: parsed.tokensOutput,
                estimatedCost: parsed.estimatedCost,
              })
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message ?? String(err)}` }])
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Chat</span>
          </div>
          {usage && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>In: {usage.tokensInput}</span>
              <span>Out: {usage.tokensOutput}</span>
              <span>Cost: ${usage.estimatedCost?.toFixed(4)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-1 max-w-2xl",
              m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"
            )}
          >
            <Card className={cn("inline-block px-4 py-3 rounded-xl", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border")}>
              <CardContent className="py-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4 bg-background/50 backdrop-blur">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={isStreaming}
            className="flex-1"
          />
          {isStreaming ? (
            <Button type="button" onClick={handleStop} variant="destructive" size="icon" disabled>
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Powered by OpenAI gpt-4o-mini · Streaming responses
        </p>
      </div>
    </div>
  )
}
