import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, BotMessageSquare, FileText, ImagePlus, LayoutGrid, Monitor, Sparkles } from "lucide-react"

const STATS = [
  { label: "Total Agents", value: "0", icon: Bot },
  { label: "Conversations", value: "0", icon: BotMessageSquare },
  { label: "Knowledge Bases", value: "0", icon: FileText },
  { label: "Integrations", value: "0", icon: LayoutGrid },
]

const QUICK_LINKS = [
  { name: "Create Agent", href: "/dashboard/agents", icon: Bot },
  { name: "Start Chat", href: "/dashboard/chat", icon: BotMessageSquare },
  { name: "Mini-LLM Chat", href: "/dashboard/mini-llm", icon: Sparkles },
  { name: "Open Microworld", href: "/dashboard/microworld", icon: Monitor },
  { name: "Generate an Image", href: "/dashboard/image-studio", icon: ImagePlus },
  { name: "Upload Knowledge", href: "/dashboard/knowledge", icon: FileText },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to thAir-AI. Manage your AI agents and ecosystem from here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {QUICK_LINKS.map((link, i) => {
          const Icon = link.icon
          return (
            <Card key={i} className="group cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {link.name}
                </CardTitle>
                <CardDescription>Get started with {link.name.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={link.href} className="text-primary text-sm font-medium hover:underline">
                  Go →
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
