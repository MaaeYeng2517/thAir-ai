"use client"

import { useState } from "react"
import { User, Shield, Bell, Mail, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const MENU = [
  { name: "Profile", icon: User, href: "#profile" },
  { name: "Security", icon: Shield, href: "#security" },
  { name: "Notifications", icon: Bell, href: "#notifications" },
  { name: "Email", icon: Mail, href: "#email" },
]

export default function SettingsPage() {
  const [active, setActive] = useState("profile")

  return (
    <div className="flex gap-6">
      <aside className="w-64 border-r border-border p-6 shrink-0">
        <nav className="space-y-2">
          {MENU.map((item) => {
            const Icon = item.icon
            const isActive = active === item.href
            return (
              <button
                key={item.name}
                onClick={() => setActive(item.href)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </button>
            )
          })}
        </nav>
        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={() => {
              // signout handled by middleware redirect
            }}
            className="flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {active === "#profile" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Profile</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </div>
            )}
            {active === "#security" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Security</h3>
                <p className="text-sm text-muted-foreground">Change your password and manage API keys.</p>
                <Button variant="outline">Change Password</Button>
              </div>
            )}
            {active === "#notifications" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">Configure email and push notifications.</p>
              </div>
            )}
            {active === "#email" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">Manage email preferences.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
