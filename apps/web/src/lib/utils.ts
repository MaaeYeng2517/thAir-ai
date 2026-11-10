import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(date)
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
  return num.toLocaleString()
}

export function formatCost(costUsd: number): string {
  if (costUsd < 0.01) return `$${(costUsd * 100).toFixed(4)}¢`
  return `$${costUsd.toFixed(4)}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getModelDisplayName(modelId: string): string {
  const names: Record<string, string> = {
    "gpt-4o": "GPT-4o",
    "gpt-4o-mini": "GPT-4o Mini",
    "gpt-3.5-turbo": "GPT-3.5 Turbo",
    "o1-preview": "o1 Preview",
    "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
    "claude-3-haiku-20240307": "Claude 3 Haiku",
    "gemini-1.5-pro": "Gemini 1.5 Pro",
    "gemini-1.5-flash": "Gemini 1.5 Flash",
  }
  return names[modelId] ?? modelId
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs: Record<string, [number, number]> = {
    "gpt-4o": [0.005, 0.015],
    "gpt-4o-mini": [0.00015, 0.0006],
    "gpt-3.5-turbo": [0.0005, 0.0015],
    "claude-3-5-sonnet-20241022": [0.003, 0.015],
    "claude-3-haiku-20240307": [0.00025, 0.00125],
  }
  const [inCost, outCost] = costs[model] ?? [0.001, 0.002]
  return (inputTokens / 1000) * inCost + (outputTokens / 1000) * outCost
}
