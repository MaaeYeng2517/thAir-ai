"use client"

import { useState, useEffect } from "react"
import { FileText, Folder, Plus, Upload, Search, BotMessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface KnowledgeBase {
  id: string
  name: string
  description: string | null
  documents: { count: number }[]
}

interface Document {
  id: string
  filename: string
  status: string
  chunk_count: number
  created_at: string
}

interface CurrentOrg {
  organizationId: string | null
  userId: string | null
}

export default function KnowledgePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([])
  const [selectedKb, setSelectedKb] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [kbName, setKbName] = useState("")
  const [kbDesc, setKbDesc] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ content: string; similarity: number }>>([])
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
      loadKbs()
    }
  }, [orgLoaded, org.organizationId])

  async function loadKbs() {
    if (!org.organizationId) return
    try {
      const res = await fetch(`/api/knowledge-bases`)
      if (!res.ok) throw new Error("Failed to load knowledge bases")
      setKbs(await res.json())
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function loadDocuments() {
    if (!selectedKb) return
    try {
      const res = await fetch(`/api/knowledge?knowledgeBaseId=${selectedKb}`)
      if (!res.ok) throw new Error("Failed to load documents")
      setDocuments(await res.json())
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleCreateKb(e: React.FormEvent) {
    e.preventDefault()
    if (!org.organizationId) {
      setError("Organization not found")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/knowledge-bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: org.organizationId, name: kbName, description: kbDesc }),
      })
      if (!res.ok) throw new Error("Failed to create knowledge base")
      const created = await res.json()
      setKbName("")
      setKbDesc("")
      setSelectedKb(created.id)
      await loadKbs()
      await loadDocuments()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    const input = document.getElementById("kb-file") as HTMLInputElement | null
    const file = input?.files?.[0]
    if (!file) {
      setError("Please select a file")
      return
    }
    formData.append("file", file)
    formData.append("knowledgeBaseId", selectedKb!)

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/knowledge", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      await loadDocuments()
      input.value = ""
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch() {
    if (!selectedKb || !searchQuery.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledgeBaseId: selectedKb, query: searchQuery, matchCount: 5 }),
      })
      if (!res.ok) throw new Error("Search failed")
      setSearchResults(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-muted text-muted-foreground",
      processing: "bg-primary/10 text-primary",
      ready: "bg-green/10 text-green-foreground",
      error: "bg-destructive/10 text-destructive",
    }
    return cn("px-2 py-0.5 rounded text-xs font-medium", map[status] || map.pending)
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
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Upload documents and retrieve relevant context for RAG</p>
        </div>
        <Button
          onClick={() => setSelectedKb(null)}
          variant="outline"
          size="sm"
          disabled={!selectedKb}
        >
          <BotMessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </div>

      {error && (
        <div className="p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Knowledge Bases</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleCreateKb} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={kbName}
                onChange={(e) => setKbName(e.target.value)}
                placeholder="e.g. Company Handbook"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={kbDesc}
                onChange={(e) => setKbDesc(e.target.value)}
                placeholder="Optional description"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Knowledge Base"}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            {kbs.map((kb) => (
              <div
                key={kb.id}
                onClick={() => {
                  setSelectedKb(kb.id)
                  loadDocuments()
                }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
                  selectedKb === kb.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border",
                )}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">{kb.name}</span>
                </div>
                {kb.description && <p className="text-xs text-muted-foreground">{kb.description}</p>}
                <div className="text-xs mt-1">
                  {kb.documents?.[0]?.count ?? 0} documents
                </div>
              </div>
            ))}
            {kbs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No knowledge bases yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedKb && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <form onSubmit={handleUpload} className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-primary underline-offset-4 hover:underline">
                  <Upload className="h-4 w-4" /> Choose file
                  <input
                    id="kb-file"
                    type="file"
                    accept=".pdf,.txt,.md,.docx"
                    className="sr-only"
                  />
                </label>
                <Button type="submit" disabled={loading}>
                  {loading ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search knowledge base…"
                  className="w-full"
                />
                <Button size="sm" onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                  Search
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="border-b last:border-0 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{doc.filename}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.status} · {doc.chunk_count} chunks
                      </div>
                    </div>
                    <span className={statusBadge(doc.status)}>{doc.status}</span>
                  </div>
                </Card>
              ))}
              {documents.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No documents uploaded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {searchResults.map((r, i) => (
              <Card key={i} className="p-3 border">
                <div className="text-xs text-muted-foreground mb-1">Relevance: {(r.similarity * 100).toFixed(1)}%</div>
                <p className="text-sm whitespace-pre-wrap">{r.content}</p>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
