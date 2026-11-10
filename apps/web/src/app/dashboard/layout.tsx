"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  FileText,
  BotMessageSquare,
  CreditCard,
  Settings,
  LogOut,
  LayoutGrid,
  ImagePlus,
  Monitor,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Chat", href: "/dashboard/chat", icon: BotMessageSquare },
  { name: "Mini-LLM Chat", href: "/dashboard/mini-llm", icon: Sparkles },
  { name: "Microworld", href: "/dashboard/microworld", icon: Monitor },
  { name: "Image Studio", href: "/dashboard/image-studio", icon: ImagePlus },
  { name: "AI Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Knowledge Base", href: "/dashboard/knowledge", icon: FileText },
  { name: "Integrations", href: "/dashboard/integrations", icon: LayoutGrid },
  { name: "Workflows", href: "/dashboard/workflows", icon: Bot },
  { name: "Usage & Billing", href: "/dashboard/usage", icon: CreditCard },
  { name: "Observability", href: "/dashboard/observability", icon: Bot },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          "fixed lg:relative lg:static lg:inset-0 lg:w-64 z-50 flex flex-col border-r border-border bg-card transition-transform duration-300 -translate-x-full lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : ""
        )}
      >
        <div className="flex items-center gap-2 px-6 py-6 border-b border-border">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            A
          </div>
          <span className="font-semibold tracking-tight">thAir-AI</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => router.push("/api/auth/signout")}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative lg:pl-64">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden absolute top-4 left-4 z-50"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <span className="sr-only">Close sidebar</span>
          ) : (
            <span className="sr-only">Open sidebar</span>
          )}
        </button>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
