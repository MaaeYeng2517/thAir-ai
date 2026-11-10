import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const IMAGE_SIZES = ["1024x1024", "1536x1024", "1024x1536"] as const
const IMAGE_QUALITIES = ["low", "medium", "high"] as const

type ImageSize = (typeof IMAGE_SIZES)[number]
type ImageQuality = (typeof IMAGE_QUALITIES)[number]

export async function POST(req: Request): Promise<Response> {
  const supabase = createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Please sign in to generate images." }, { status: 401 })
  }

  let body: { prompt?: unknown; size?: unknown; quality?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
  if (!prompt) {
    return NextResponse.json({ error: "Enter a prompt before generating an image." }, { status: 400 })
  }
  if (prompt.length > 4000) {
    return NextResponse.json({ error: "Prompts must be 4,000 characters or fewer." }, { status: 400 })
  }

  const size: ImageSize = IMAGE_SIZES.includes(body.size as ImageSize)
    ? (body.size as ImageSize)
    : "1024x1024"
  const quality: ImageQuality = IMAGE_QUALITIES.includes(body.quality as ImageQuality)
    ? (body.quality as ImageQuality)
    : "medium"
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "Image generation is not configured. Add OPENAI_API_KEY to the server environment." },
      { status: 503 },
    )
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size,
        quality,
        n: 1,
      }),
      signal: AbortSignal.timeout(90_000),
    })

    if (!response.ok) {
      const providerError = await response.text()
      console.error("OpenAI image generation request failed", {
        status: response.status,
        response: providerError,
      })
      return NextResponse.json(
        { error: "The image could not be generated. Please try again." },
        { status: 502 },
      )
    }

    const result = (await response.json()) as {
      data?: Array<{ b64_json?: string }>
    }
    const image = result.data?.[0]?.b64_json

    if (!image) {
      console.error("OpenAI image generation returned no image data")
      return NextResponse.json(
        { error: "The image service returned no image. Please try again." },
        { status: 502 },
      )
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("OpenAI image generation request failed", error)
    return NextResponse.json(
      { error: "The image service could not be reached. Please try again." },
      { status: 502 },
    )
  }
}
