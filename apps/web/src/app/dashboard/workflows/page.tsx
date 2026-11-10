"use client"

import { useState, useEffect } from "react"
import { Plus, Bot, Play, FileText, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Workflow {
  id: string
  name: string
  definition: Record<string, unknown>
  is_active: boolean
  created_at: string
}

interface CurrentOrg {
  organizationId: string | null
  userId: string | null
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [name, setName] = useState("")
  const [definition, setDefinition] = useState("")
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
      loadWorkflows()
    }
  }, [orgLoaded, org.organizationId])

  async function loadWorkflows() {
    try {
      const res = await fetch(`/api/workflows`)
      if (!res.ok) throw new Error("Failed to load workflows")
      setWorkflows(await res.json())
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!org.organizationId || !org.userId) {
      setError("Organization not found")
      return
    }
    setLoading(true)
    setError("")
    try {
      const parsed = definition ? JSON.parse(definition) : {}
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: org.organizationId, name, definition: parsed }),
      })
      if (!res.ok) throw new Error("Failed to create workflow")
      setName("")
      setDefinition("")
      await loadWorkflows()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRun(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "POST", body: JSON.stringify({}) })
      if (!res.ok) throw new Error("Failed to run workflow")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this workflow?")) return
    try {
      await fetch(`/api/workflows/${id}`, { method: "DELETE" })
      await loadWorkflows()
    } catch (e: any) {
      setError(e.message)
    }
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
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Automate multi-step AI processes</p>
        </div>
        <Button onClick={() => setName("")} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> New Workflow
        </Button>
      </div>

      {error && (
        <div className="p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create Workflow</CardTitle>
          <CardDescription>Define a sequence of AI agent and API steps</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily Research Summary"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Definition (JSON)</label>
              <Textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder='{ "steps": [ { "type": "agent", "agentId": "...", "prompt": "..." } ] }'
                rows={5}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Workflow"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {workflows.map((wf) => (
          <Card key={wf.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{wf.name}</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-xs text-muted-foreground mb-3">
                <div>Status: {wf.is_active ? "Active" : "Inactive"}</div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRun(wf.id)}
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-2" /> Run
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(wf.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
        {workflows.length === 0 && (
          <Card className="text-center py-12">
            <Terminal className="mx-auto h-12 w-12 opacity-30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="text-muted-foreground text-sm">Create your first automated workflow.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
