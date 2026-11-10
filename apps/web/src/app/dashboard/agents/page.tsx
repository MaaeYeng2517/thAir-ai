"use client"

import { useEffect, useState } from "react"
import { Bot, FileText, Settings, BotMessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  name: string
  description: string | null
  system_prompt: string | null
  model: string
  temperature: number
  max_tokens: number
  is_active: boolean
}

interface CurrentOrg {
  organizationId: string | null
  userId: string | null
}

const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "gpt-4o", name: "GPT-4o" },
]

export default function AgentBuilderPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [editing, setEditing] = useState<Agent | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [model, setModel] = useState("gpt-4o-mini")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [org, setOrg] = useState<CurrentOrg>({ organizationId: null, userId: null })
  const [orgLoaded, setOrgLoaded] = useState(false)

  useEffect(() => {
    loadOrg()
  }, [])

  async function loadOrg() {
    try {
      const res = await fetch("/api/org/current")
      if (!res.ok) throw new Error("Failed to load org")
      const data = await res.json()
      setOrg(data)
    } catch {
      // ignore
    } finally {
      setOrgLoaded(true)
    }
  }

  useEffect(() => {
    if (orgLoaded && org.organizationId) {
      loadAgents()
    }
  }, [orgLoaded, org.organizationId])

  async function loadAgents() {
    if (!org.organizationId) return
    try {
      const res = await fetch(`/api/agents`)
      if (!res.ok) throw new Error("Failed to load agents")
      const data = await res.json()
      setAgents(data)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!org.organizationId || !org.userId) {
      setError("Organization not found")
      return
    }
    setLoading(true)
    setError("")
    try {
      if (editing) {
        const res = await fetch(`/api/agents/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            systemPrompt,
            modelId: model,
            temperature,
            maxTokens,
            isActive: true,
          }),
        })
        if (!res.ok) throw new Error("Update failed")
      } else {
        const res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: org.organizationId,
            name,
            description,
            systemPrompt,
            modelId: model,
            temperature,
            maxTokens,
          }),
        })
        if (!res.ok) throw new Error("Create failed")
      }
      setEditing(null)
      setName("")
      setDescription("")
      setSystemPrompt("")
      setModel("gpt-4o-mini")
      setTemperature(0.7)
      setMaxTokens(4096)
      await loadAgents()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this agent?")) return
    const res = await fetch(`/api/agents/${id}`, { method: "DELETE" })
    if (res.ok) await loadAgents()
  }

  if (!orgLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading organization…</p>
      </div>
    )
  }

  if (!org.organizationId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-lg font-medium mb-2">No organization found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is not a member of any organization yet.
            </p>
            <Button>Contact administrator</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI agents</p>
        </div>
        <Button onClick={() => setEditing(null)} className="ml-auto lg:ml-0">
          <Bot className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </div>

      {error && (
        <div className="p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    agent.is_active
                      ? "bg-green/10 text-green-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {agent.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {agent.description && <CardDescription className="text-sm">{agent.description}</CardDescription>}
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-xs text-muted-foreground mb-3">
                <div className="mb-1">Model: {agent.model}</div>
                <div>Temp: {agent.temperature} · Max tokens: {agent.max_tokens}</div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(agent)
                  setName(agent.name)
                  setDescription(agent.description ?? "")
                  setSystemPrompt(agent.system_prompt ?? "")
                  setModel(agent.model)
                  setTemperature(agent.temperature)
                  setMaxTokens(agent.max_tokens)
                }}
              >
                <Settings className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(agent.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Agent</CardTitle>
            <CardDescription>Configure your AI agent's name, instructions, and model settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Agent Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Coding Assistant"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this agent do?"
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">System Instructions</label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  rows={4}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    disabled={loading}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 (precise)</span>
                    <span>2 (creative)</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Max Tokens</label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Update Agent"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Create Your First Agent</CardTitle>
                <CardDescription>Configure your AI agent's name, instructions, and model settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Agent Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Coding Assistant"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Model</label>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does this agent do?"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">System Instructions</label>
                    <Textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="You are a helpful assistant..."
                      rows={4}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Temperature</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        disabled={loading}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 (precise)</span>
                        <span>2 (creative)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Max Tokens</label>
                      <Input
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving…" : "Create Agent"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
