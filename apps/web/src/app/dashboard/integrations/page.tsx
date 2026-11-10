"use client"

import { useState, useEffect } from "react"
import { Plus, Code, File, SlidersHorizontal, Zap, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Tool {
  id: string
  name: string
  type: string
  config: Record<string, unknown>
  is_enabled: boolean
}

interface CurrentOrg {
  organizationId: string | null
  userId: string | null
}

const TYPES = [
  { id: "api", name: "REST API" },
  { id: "mcp", name: "MCP Server" },
  { id: "webhook", name: "Webhook" },
  { id: "database", name: "Database" },
]

export default function IntegrationsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState("api")
  const [config, setConfig] = useState("")
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
      loadTools()
    }
  }, [orgLoaded, org.organizationId])

  async function loadTools() {
    try {
      const res = await fetch(`/api/tools`)
      if (!res.ok) throw new Error("Failed to load tools")
      setTools(await res.json())
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!org.organizationId) {
      setError("Organization not found")
      return
    }
    setLoading(true)
    setError("")
    try {
      const parsed = config ? JSON.parse(config) : {}
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: org.organizationId, name, type, config: parsed }),
      })
      if (!res.ok) throw new Error("Failed to create integration")
      setName("")
      setConfig("")
      await loadTools()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch(`/api/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enabled }),
      })
      await loadTools()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this integration?")) return
    try {
      await fetch(`/api/tools/${id}`, { method: "DELETE" })
      await loadTools()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const iconMap: Record<string, any> = {
    api: Code,
    mcp: SlidersHorizontal,
    webhook: Zap,
    database: File,
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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Register external APIs, MCP servers, and tool connections
          </p>
        </div>
        <Button onClick={() => setName("")} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> New Integration
        </Button>
      </div>

      {error && (
        <div className="p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Integration</CardTitle>
          <CardDescription>Configure an external tool or MCP connection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Slack Notifier"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Configuration (JSON)</label>
              <Textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                placeholder='{ "endpoint": "https://api.example.com", "headers": {...} }'
                rows={4}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Integration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = iconMap[tool.type] || File
          return (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="py-0">
                <div className="text-xs text-muted-foreground mb-3">
                  <div>Type: {tool.type}</div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(tool.id, !tool.is_enabled)}
                >
                  {tool.is_enabled ? "Disable" : "Enable"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(tool.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          )
        })}
        {tools.length === 0 && (
          <Card className="text-center py-12">
            <Terminal className="mx-auto h-12 w-12 opacity-30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No integrations yet</h3>
            <p className="text-muted-foreground text-sm">Add your first tool or MCP connection.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
