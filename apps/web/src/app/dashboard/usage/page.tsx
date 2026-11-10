"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Bot, FileText, TrendingUp, DollarSign } from "lucide-react"

interface CurrentOrg {
  organizationId: string | null
  userId: string | null
}

export default function UsagePage() {
  const [usage, setUsage] = useState<any>(null)
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
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
      loadData()
    }
  }, [orgLoaded, org.organizationId])

  async function loadData() {
    try {
      const [usageRes, subRes] = await Promise.all([
        fetch("/api/usage/summary"),
        fetch("/api/subscriptions"),
      ])
      if (usageRes.ok) setUsage(await usageRes.json())
      if (subRes.ok) {
        const sub = await subRes.json()
        setPlan(sub.plan ?? "free")
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getLimit = (p: string, metric: string) => {
    const limits: Record<string, Record<string, number>> = {
      free: { tokens: 5000, agents: 3, knowledgeBases: 1 },
      pro: { tokens: 100000, agents: 50, knowledgeBases: 20 },
      enterprise: { tokens: -1, agents: -1, knowledgeBases: -1 },
    }
    return limits[p]?.[metric] ?? 0
  }

  const tokenLimit = getLimit(plan, "tokens")
  const used = usage?.tokensInput ? usage.tokensInput + (usage.tokensOutput ?? 0) : 0
  const remaining = tokenLimit < 0 ? -1 : Math.max(0, tokenLimit - used)
  const pct = tokenLimit < 0 ? 0 : Math.min(100, Math.round((used / tokenLimit) * 100))

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
      <div>
        <h1 className="text-2xl font-bold">Usage & Billing</h1>
        <p className="text-muted-foreground">
          Track token consumption, model usage, and subscription plan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Plan
            </CardTitle>
            <CardDescription>{plan.toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full">Manage Subscription</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tokens This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{used.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {tokenLimit < 0 ? "Unlimited" : `${remaining.toLocaleString()} remaining of ${tokenLimit.toLocaleString()}`}
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-3">
              <div
                className={`bg-primary h-2 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground mt-1">
              {tokenLimit < 0 ? "Unlimited" : `${getLimit(plan, "agents")} max`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Knowledge Bases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground mt-1">
              {getLimit(plan, "knowledgeBases")} max
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Records</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Usage is recorded automatically with each AI chat response. Generate activity to see data here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
