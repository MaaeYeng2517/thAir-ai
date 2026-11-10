import { createServerClient } from "@/lib/supabase/server"
import { OpenAIProvider } from "@/lib/ai/providers/openai"

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string }

export interface ChatOptions {
  provider: string
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  messages: ChatMessage[]
  organizationId: string
  userId: string
  agentId?: string | null
  conversationId: string
}

export interface ChatResult {
  content: string
  tokensInput: number
  tokensOutput: number
  estimatedCost: number
}

export class AIGateway {
  private providers: Map<string, OpenAIProvider> = new Map()

  getProvider(apiKey: string): OpenAIProvider {
    let provider = this.providers.get(apiKey)
    if (!provider) {
      provider = new OpenAIProvider(apiKey)
      this.providers.set(apiKey, provider)
    }
    return provider
  }

  async streamChat(options: ChatOptions, onToken: (token: string) => void): Promise<ChatResult> {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY is not configured")
    }

    const provider = this.getProvider(openaiKey)

    const inputText = options.messages.map((m) => m.content).join("\n")
    const tokensInput = Math.ceil(inputText.length / 4)

    let fullContent = ""

    for await (const delta of provider.streamChat({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      systemPrompt: options.systemPrompt,
    })) {
      fullContent += delta
      onToken(delta)
    }

    const tokensOutput = Math.ceil(fullContent.length / 4)
    const estimatedCost = this.estimateCost(options.model, tokensInput, tokensOutput)

    await this.recordUsage({
      organizationId: options.organizationId,
      userId: options.userId,
      agentId: options.agentId,
      provider: options.provider,
      model: options.model,
      tokensInput,
      tokensOutput,
      estimatedCost,
    })

    return { content: fullContent, tokensInput, tokensOutput, estimatedCost }
  }

  async chat(options: ChatOptions): Promise<ChatResult> {
    let full = ""
    await this.streamChat(options, (token) => {
      full += token
    })
    return { content: full, tokensInput: 0, tokensOutput: Math.ceil(full.length / 4), estimatedCost: 0 }
  }

  private estimateCost(model: string, tokensInput: number, tokensOutput: number): number {
    const inputCost = (tokensInput / 1000) * 0.0015
    const outputCost = (tokensOutput / 1000) * 0.006
    return Math.round((inputCost + outputCost) * 100000) / 100000
  }

  private async recordUsage(params: {
    organizationId: string
    userId: string
    agentId?: string | null
    provider: string
    model: string
    tokensInput: number
    tokensOutput: number
    estimatedCost: number
  }) {
    const supabase = createServerClient()
    await supabase.from("usage_records").insert({
      organization_id: params.organizationId,
      user_id: params.userId,
      agent_id: params.agentId,
      provider: params.provider,
      model: params.model,
      tokens_input: params.tokensInput,
      tokens_output: params.tokensOutput,
      estimated_cost: params.estimatedCost,
    })
  }
}

export const aiGateway = new AIGateway()
