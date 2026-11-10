"use client"

import { useState, useEffect, useRef } from "react"
import {
  BotMessageSquare,
  Send,
  StopCircle,
  Settings,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

type MiniModel = "gpt-4o-mini" | "gpt-3.5-turbo" | "gpt-4o"

const MODELS: { id: MiniModel; name: string; desc: string }[] = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Fast, low cost" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "Classic, reliable" },
  { id: "gpt-4o", name: "GPT-4o", desc: "Most capable" },
]

const SYSTEM_PRESETS = [
  { name: "Helpful Assistant", prompt: "You are a helpful, concise AI assistant." },
  { name: "Code Expert", prompt: "You are an expert software engineer. Give clear, practical answers with code when helpful." },
  { name: "Thai Tutor", prompt: "You are a friendly Thai language tutor. Help the user practice and explain in simple terms." },
  { name: "Summarizer", prompt: "You are a summarization assistant. Condense information into clear, structured summaries." },
]

function generateId(): string {
  return crypto.randomUUID()
}

export default function MiniLLMChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: "สวัสดี! ฉันคือ Mini-LLM chatbot บน thAir-AI เลือกโมเดลและ system prompt แล้วเริ่มคุยได้เลย",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [model, setModel] = useState<MiniModel>("gpt-4o-mini")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PRESETS[0].prompt)
  const [usage, setUsage] = useState<{
    tokensInput?: number
    tokensOutput?: number
    estimatedCost?: number
  } | null>(null)
  const [error, setError] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userText = input.trim()
    setInput("")
    setError("")
    setUsage(null)
    setIsStreaming(true)

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    }
    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    abortRef.current = new AbortController()

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          model,
          temperature,
          maxTokens,
          systemPrompt,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "Failed to start chat")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n\n")
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.token) {
              full += parsed.token
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: full } : m
                )
              )
            }
            if (parsed.done) {
              setUsage({
                tokensInput: parsed.tokensInput,
                tokensOutput: parsed.tokensOutput,
                estimatedCost: parsed.estimatedCost,
              })
            }
          } catch (err) {
            if (err instanceof Error && err.message && !err.message.includes("JSON")) {
              setError(err.message)
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return
      setError(err?.message ?? String(err))
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id && !m.content
            ? { ...m, content: `Error: ${err?.message ?? String(err)}` }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  const clearChat = () => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: "แชทถูกล้างแล้ว พร้อมเริ่มใหม่",
        timestamp: Date.now(),
      },
    ])
    setUsage(null)
    setError("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Mini-LLM Chat
          </h1>
          <p className="text-muted-foreground text-sm">
            Lightweight chat with configurable small models and system prompts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings((s) => !s)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="border-b border-border py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <BotMessageSquare className="h-4 w-4" />
                {MODELS.find((m) => m.id === model)?.name ?? model}
              </CardTitle>
              {usage && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>In {usage.tokensInput ?? 0}</span>
                  <span>Out {usage.tokensOutput ?? 0}</span>
                  <span>${(usage.estimatedCost ?? 0).toFixed(5)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    )}
                  >
                    {m.content || (isStreaming ? "…" : "")}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3">
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e as any)
                    }
                  }}
                  placeholder="พิมพ์ข้อความ… (Enter เพื่อส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
                  disabled={isStreaming}
                  rows={2}
                  className="resize-none flex-1"
                />
                {isStreaming ? (
                  <Button
                    type="button"
                    onClick={handleStop}
                    variant="destructive"
                    size="icon"
                    className="shrink-0"
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {MODELS.find((m) => m.id === model)?.desc} · Streaming via /api/chat
              </p>
            </div>
          </CardContent>
        </Card>

        {showSettings && (
          <Card className="w-80 shrink-0 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="h-4 w-4" /> Configuration
              </CardTitle>
              <CardDescription>Model, prompt, and generation params.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as MiniModel)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Temperature ({temperature.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Max tokens</label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
                  min={64}
                  max={8192}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">System prompt preset</label>
                <div className="flex flex-wrap gap-1.5">
                  {SYSTEM_PRESETS.map((p) => (
                    <Button
                      key={p.name}
                      type="button"
                      variant={systemPrompt === p.prompt ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSystemPrompt(p.prompt)}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">System prompt</label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={5}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
