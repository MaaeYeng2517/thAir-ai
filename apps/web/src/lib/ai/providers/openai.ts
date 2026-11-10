import { OpenAI } from "openai"

export class OpenAIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async *streamChat(params: {
    model: string
    messages: { role: string; content: string }[]
    temperature?: number
    max_tokens?: number
    systemPrompt?: string
  }) {
    const messages = [
      ...(params.systemPrompt ? [{ role: "system", content: params.systemPrompt }] : []),
      ...params.messages.map((m) => ({ role: m.role as any, content: m.content })),
    ]

    const stream = await this.client.chat.completions.create({
      model: params.model,
      messages,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        yield delta
      }
    }
  }

  async chat(params: {
    model: string
    messages: { role: string; content: string }[]
    temperature?: number
    max_tokens?: number
    systemPrompt?: string
  }) {
    let full = ""
    for await (const delta of this.streamChat(params)) {
      full += delta
    }
    return full
  }
}
