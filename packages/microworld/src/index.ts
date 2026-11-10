export type WorldId = string
export type AgentId = string
export type EntityId = string
export type ScenarioId = string

export type Direction = "north" | "south" | "east" | "west"

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Bounds {
  min: Position
  max: Position
}

export interface Cell {
  x: number
  y: number
  passable: boolean
  entityId: EntityId | null
}

export interface Grid {
  size: Size
  cells: Cell[][]
}

export interface Entity {
  id: EntityId
  type: string
  position: Position
  props: Record<string, unknown>
}

export interface Agent {
  id: AgentId
  name: string
  position: Position
  energy: number
  alive: boolean
  props: Record<string, unknown>
}

export interface StepResult {
  worldId: WorldId
  tick: number
  agents: Agent[]
  entities: Entity[]
  events: WorldEvent[]
}

export interface WorldEvent {
  type: string
  actorId: AgentId | EntityId | null
  targetId: AgentId | EntityId | null
  position?: Position
  payload: Record<string, unknown>
  timestamp: number
}

export interface WorldConfig {
  id: WorldId
  name: string
  size: Size
  maxTicks: number
  passableRate: number
}

export interface World {
  id: WorldId
  name: string
  size: Size
  grid: Grid
  agents: Map<AgentId, Agent>
  entities: Map<EntityId, Entity>
  tick: number
  config: WorldConfig
}

export interface Scenario {
  id: ScenarioId
  name: string
  description?: string | null
  world: WorldConfig
  agents: Omit<Agent, "id">[]
  entities: Omit<Entity, "id">[]
}

export interface MicroworldEngine {
  createWorld(config: WorldConfig): World
  spawnAgent(world: World, agent: Omit<Agent, "id">): Agent
  spawnEntity(world: World, entity: Omit<Entity, "id">): Entity
  step(world: World, actions: Record<AgentId, unknown>): StepResult
  reset(world: World): World
}

export interface MicroworldOptions {
  seed?: number
  deterministic?: boolean
}
