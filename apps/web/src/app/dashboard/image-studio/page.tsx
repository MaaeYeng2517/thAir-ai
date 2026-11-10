"use client"

import { FormEvent, useState } from "react"
import {
  ArrowDownToLine,
  ImagePlus,
  LoaderCircle,
  RectangleHorizontal,
  RectangleVertical,
  Sparkles,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const SIZES = [
  { value: "1024x1024", label: "Square", icon: Square, ratio: "1:1" },
  { value: "1536x1024", label: "Landscape", icon: RectangleHorizontal, ratio: "3:2" },
  { value: "1024x1536", label: "Portrait", icon: RectangleVertical, ratio: "2:3" },
] as const

const QUALITIES = [
  { value: "low", label: "Fast" },
  { value: "medium", label: "Balanced" },
  { value: "high", label: "Detailed" },
] as const

const PROMPT_IDEAS = [
  "A tiny glass greenhouse on a rainy city rooftop at blue hour, cinematic photography",
  "An editorial still life of ripe peaches and wildflowers, warm sunlight, analog film",
  "A friendly orange cat astronaut exploring a planet made of soft clouds, storybook art",
]

type GeneratedImage = {
  dataUrl: string
  prompt: string
}

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState("")
  const [size, setSize] = useState<(typeof SIZES)[number]["value"]>("1024x1024")
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]["value"]>("medium")
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, quality }),
      })
      const result = (await response.json()) as { image?: string; error?: string }

      if (!response.ok || !result.image) {
        throw new Error(result.error ?? "Image generation failed. Please try again.")
      }

      setGeneratedImage({ dataUrl: `data:image/png;base64,${result.image}`, prompt: prompt.trim() })
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Image generation failed. Please try again.",
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedSize = SIZES.find((option) => option.value === size) ?? SIZES[0]
  const previewRatio =
    selectedSize.value === "1536x1024"
      ? "aspect-[3/2]"
      : selectedSize.value === "1024x1536"
        ? "aspect-[2/3]"
        : "aspect-square"

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          thAir-AI Creative
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Image Studio</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Turn an idea into an image. Describe what you imagine, choose a format, and let AI bring it to life.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="h-fit border-border/80 bg-card/80 p-5 sm:p-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="image-prompt" className="text-sm font-semibold">
                  Your prompt
                </label>
                <span className="text-xs text-muted-foreground">{prompt.length}/4,000</span>
              </div>
              <Textarea
                id="image-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value.slice(0, 4000))}
                placeholder="Describe the subject, setting, lighting, mood, and style..."
                className="min-h-36 resize-y border-border/80 bg-background/70 leading-relaxed placeholder:text-muted-foreground/70"
                maxLength={4000}
                required
              />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Need inspiration?</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_IDEAS.map((idea, index) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setPrompt(idea)}
                      className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {["Rooftop greenhouse", "Peach still life", "Cloud explorer"][index]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Aspect ratio</legend>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((option) => {
                  const Icon = option.icon
                  const selected = size === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSize(option.value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-[11px] opacity-70">{option.ratio}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Quality</legend>
              <div className="grid grid-cols-3 rounded-xl border border-border bg-background/50 p-1">
                {QUALITIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={quality === option.value}
                    onClick={() => setQuality(option.value)}
                    className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                      quality === option.value
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="h-12 w-full gap-2 text-sm font-semibold" disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating your image...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate image
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Image generation uses your server&apos;s OpenAI API key.
            </p>
          </form>
        </Card>

        <section aria-label="Generated image" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your canvas</h2>
            {generatedImage && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={generatedImage.dataUrl} download="thair-ai-image.png">
                  <ArrowDownToLine className="h-4 w-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
          <div
            className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card/70 ${previewRatio}`}
          >
            {generatedImage ? (
              <img
                src={generatedImage.dataUrl}
                alt={generatedImage.prompt}
                className="h-full w-full object-contain"
              />
            ) : isGenerating ? (
              <div className="flex flex-col items-center gap-4 px-6 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ImagePlus className="h-7 w-7" />
                  <LoaderCircle className="absolute -right-2 -top-2 h-5 w-5 animate-spin text-primary" />
                </div>
                <div>
                  <p className="font-medium">Creating your image</p>
                  <p className="mt-1 text-sm text-muted-foreground">This can take a little while...</p>
                </div>
              </div>
            ) : (
              <div className="flex max-w-sm flex-col items-center gap-4 px-8 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/70 text-muted-foreground">
                  <ImagePlus className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Your next idea starts here</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Write a prompt and generate an original image. Your result will appear on this canvas.
                  </p>
                </div>
              </div>
            )}
          </div>
          {generatedImage && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{generatedImage.prompt}</p>
          )}
        </section>
      </div>
    </div>
  )
}
