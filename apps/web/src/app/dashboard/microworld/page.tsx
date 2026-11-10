"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Play,
  Pause,
  RefreshCw,
  Plus,
  LayoutGrid,
  Bolt,
  Activity,
  Monitor,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Direction = "north" | "south" | "east" | "west"

interface Position {
  x: number
  y: number
}

interface Agent {
  id: string
  name: string
  position: Position
  energy: number
  alive: boolean
  color: string
  dir: Direction
  trail: Position[]
}

interface WorldConfig {
  id: string
  name: string
  width: number
  height: number
  cellSize: number
}

interface WorldEvent {
  type: "spawn" | "move" | "eat" | "die"
  agentId: string
  position: Position
  timestamp: number
}

const DIRECTIONS: Direction[] = ["north", "south", "east", "west"]
const COLOR_PALETTE = [
  "#22d3ee",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#f43f5e",
  "#818cf8",
]

function generateId(): string {
  return crypto.randomUUID()
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

function movePos(pos: Position, dir: Direction): Position {
  switch (dir) {
    case "north":
      return { x: pos.x, y: pos.y - 1 }
    case "south":
      return { x: pos.x, y: pos.y + 1 }
    case "east":
      return { x: pos.x + 1, y: pos.y }
    case "west":
      return { x: pos.x - 1, y: pos.y }
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface MicroworldState {
  config: WorldConfig
  agents: Agent[]
  events: WorldEvent[]
  tick: number
  running: boolean
}

function createWorld(config: WorldConfig): MicroworldState {
  return {
    config,
    agents: [],
    events: [],
    tick: 0,
    running: false,
  }
}

function spawnAgent(state: MicroworldState, name: string): MicroworldState {
  const { width, height } = state.config
  const color = COLOR_PALETTE[randInt(0, COLOR_PALETTE.length - 1)]
  const agent: Agent = {
    id: generateId(),
    name,
    position: { x: randInt(0, width - 1), y: randInt(0, height - 1) },
    energy: 100,
    alive: true,
    color,
    dir: DIRECTIONS[randInt(0, 3)],
    trail: [],
  }
  const events: WorldEvent[] = [
    ...state.events,
    { type: "spawn", agentId: agent.id, position: agent.position, timestamp: Date.now() },
  ]
  return { ...state, agents: [...state.agents, agent], events }
}

function stepWorld(state: MicroworldState): MicroworldState {
  const { width, height } = state.config
  const events: WorldEvent[] = []
  const agents = state.agents.map((agent) => {
    if (!agent.alive) return agent
    let { x, y } = agent.position
    let dir = agent.dir
    let energy = agent.energy - 1

    const next = movePos({ x, y }, dir)
    if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) {
      dir = DIRECTIONS[randInt(0, 3)]
      energy -= 5
    } else {
      x = next.x
      y = next.y
      events.push({
        type: "move",
        agentId: agent.id,
        position: { x, y },
        timestamp: Date.now(),
      })
    }

    if (energy <= 0) {
      energy = 0
      events.push({
        type: "die",
        agentId: agent.id,
        position: { x, y },
        timestamp: Date.now(),
      })
    }

    const trail = [...agent.trail, { x, y }].slice(-40)

    return {
      ...agent,
      position: { x, y },
      dir,
      energy,
      alive: energy > 0,
      trail,
    }
  })

  return {
    ...state,
    agents,
    events: [...state.events, ...events].slice(-200),
    tick: state.tick + 1,
  }
}

export default function MicroworldPage() {
  const [config, setConfig] = useState<WorldConfig>({
    id: generateId(),
    name: "World-1",
    width: 40,
    height: 25,
    cellSize: 18,
  })
  const [state, setState] = useState<MicroworldState>(createWorld(config))
  const [intervalMs, setIntervalMs] = useState(200)
  const [agentName, setAgentName] = useState("Agent")
  const frameRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasSize = useMemo(
    () => ({
      width: config.width * config.cellSize,
      height: config.height * config.cellSize,
    }),
    [config]
  )

  const running = state.running

  const reset = useCallback(() => {
    setState(createWorld(config))
  }, [config])

  const spawn = useCallback(() => {
    setState((s) => spawnAgent(s, agentName || "Agent"))
  }, [agentName])

  const step = useCallback(() => {
    setState((s) => stepWorld(s))
  }, [])

  const toggle = useCallback(() => {
    setState((s) => ({ ...s, running: !s.running }))
  }, [])

  // Animation loop
  useEffect(() => {
    if (!running) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      return
    }

    const loop = (now: number) => {
      if (now - lastTickRef.current >= intervalMs) {
        lastTickRef.current = now
        setState((s) => stepWorld(s))
      }
      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [running, intervalMs])

  // Recreate world when config changes
  useEffect(() => {
    setState(createWorld(config))
  }, [config])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    const { width, height, cellSize } = config

    // Background
    ctx.fillStyle = "hsl(var(--card))"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Grid
    ctx.strokeStyle = "hsl(var(--border))"
    ctx.lineWidth = 1
    for (let i = 0; i <= width; i++) {
      const x = i * cellSize
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasSize.height)
      ctx.stroke()
    }
    for (let i = 0; i <= height; i++) {
      const y = i * cellSize
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasSize.width, y)
      ctx.stroke()
    }

    // Agents
    for (const agent of state.agents) {
      if (!agent.alive) continue
      const cx = agent.position.x * cellSize + cellSize / 2
      const cy = agent.position.y * cellSize + cellSize / 2
      const r = cellSize / 2 - 2

      // trail
      if (agent.trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(
          agent.trail[0].x * cellSize + cellSize / 2,
          agent.trail[0].y * cellSize + cellSize / 2
        )
        for (const p of agent.trail.slice(1)) {
          ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2)
        }
        ctx.strokeStyle = agent.color + "40"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // body
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = agent.color
      ctx.fill()
      ctx.strokeStyle = "hsl(var(--background))"
      ctx.lineWidth = 2
      ctx.stroke()

      // direction indicator
      const len = r * 0.6
      let dx = 0,
        dy = 0
      switch (agent.dir) {
        case "north": dy = -1; break
        case "south": dy = 1; break
        case "east": dx = 1; break
        case "west": dx = -1; break
      }
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + dx * len, cy + dy * len)
      ctx.strokeStyle = "rgba(0,0,0,0.35)"
      ctx.lineWidth = 2
      ctx.stroke()

      // energy ring
      const energyPct = agent.energy / 100
      ctx.beginPath()
      ctx.arc(cx, cy, r + 4, -Math.PI / 2, (-Math.PI / 2) * 1 + (energyPct * 2 * Math.PI) - Math.PI / 2)
      ctx.strokeStyle = agent.color
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }, [state, config, canvasSize])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-5 w-5" /> Microworld
          </h1>
          <p className="text-muted-foreground">
            Agent simulation environment. Agents move, spend energy, and leave trails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={running ? "destructive" : "default"}
            size="sm"
            onClick={toggle}
            disabled={state.agents.length === 0}
          >
            {running ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Play
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={step}>
            <Bolt className="h-4 w-4 mr-2" /> Step
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Canvas */}
        <div
          className="lg:col-span-8 flex flex-col items-center justify-center min-h-[400px] bg-card rounded-xl border border-border p-4 shadow-sm relative"
        >
          <canvas
            ref={canvasRef}
            className="rounded-lg border border-border shadow-inner bg-background"
            width={canvasSize.width}
            height={canvasSize.height}
          />
          {!state.agents.length && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Plus className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No agents yet. Spawn one to start.
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> World Config
              </CardTitle>
              <CardDescription>Grid dimensions and cell size.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Width</label>
                <Input
                  type="number"
                  value={config.width}
                  onChange={(e) =>
                    setConfig({ ...config, width: clamp(parseInt(e.target.value) || 1, 5, 80) })
                  }
                  min={5}
                  max={80}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Height</label>
                <Input
                  type="number"
                  value={config.height}
                  onChange={(e) =>
                    setConfig({ ...config, height: clamp(parseInt(e.target.value) || 1, 5, 60) })
                  }
                  min={5}
                  max={60}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cell size (px)</label>
                <Input
                  type="number"
                  value={config.cellSize}
                  onChange={(e) =>
                    setConfig({ ...config, cellSize: clamp(parseInt(e.target.value) || 8, 8, 40) })
                  }
                  min={8}
                  max={40}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">
                {config.width} × {config.height}
              </span>
              <Button variant="outline" size="sm" onClick={reset}>
                Apply
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Spawn Agent
              </CardTitle>
              <CardDescription>Add a new agent to the world.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent name"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={spawn} disabled={!running && state.agents.length === 0}>
                  Spawn
                </Button>
                <Button variant="outline" size="sm" onClick={() => setState((s) => spawnAgent(s, agentName || "Agent"))}>
                  Spawn (instant)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Simulation
              </CardTitle>
              <CardDescription>Tick speed and runtime controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Tick interval (ms)
                </label>
                <Input
                  type="number"
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(clamp(parseInt(e.target.value) || 50, 30, 5000))}
                  min={30}
                  max={5000}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant={running ? "destructive" : "default"}
                onClick={toggle}
              >
                {running ? "Pause" : "Play"}
              </Button>
              <Button size="sm" variant="outline" onClick={step}>
                Step
              </Button>
              <Button size="sm" variant="outline" onClick={reset}>
                Reset
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Tick</div>
            <div className="text-2xl font-mono font-bold">{state.tick}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Agents</div>
            <div className="text-2xl font-mono font-bold">
              {state.agents.filter((a) => a.alive).length} / {state.agents.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Events</div>
            <div className="text-2xl font-mono font-bold">{state.events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Speed</div>
            <div className="text-2xl font-mono font-bold">{intervalMs} ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Event log */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Event Log
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setState((s) => ({ ...s, events: [] }))}>
            <X className="h-3 w-3" /> Clear
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-48 overflow-y-auto border-t border-border">
            {state.events.slice().reverse().map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2 text-xs border-b border-border/50 last:border-0"
              >
                <span className="font-mono text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", {
                    "bg-blue-500/10 text-blue-400": e.type === "spawn",
                    "bg-cyan-500/10 text-cyan-400": e.type === "move",
                    "bg-green-500/10 text-green-400": e.type === "eat",
                    "bg-red-500/10 text-red-400": e.type === "die",
                  })}>
                    {e.type}
                  </span>
                  <span className="text-muted-foreground">#{e.agentId.slice(-4)}</span>
                  <span className="text-muted-foreground">
                    ({e.position.x},{e.position.y})
                  </span>
                </div>
              </div>
            ))}
            {state.events.length === 0 && (
              <div className="px-4 py-4 text-center text-muted-foreground text-sm">
                No events yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
