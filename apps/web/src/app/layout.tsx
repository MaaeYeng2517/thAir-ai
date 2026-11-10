import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "thAir-AI — Build. Connect. Orchestrate. Intelligence.",
    template: "%s | thAir-AI",
  },
  description:
    "The AI Ecosystem Platform for everyone. Build AI agents, manage knowledge bases, orchestrate workflows, and integrate AI into your business.",
  keywords: ["AI agents", "AI platform", "LLM", "RAG", "AI ecosystem", "AI workflow"],
  authors: [{ name: "thAir-AI Team" }],
  creator: "thAir-AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "thAir-AI — AI Ecosystem Platform",
    description: "Build. Connect. Orchestrate. Intelligence.",
    siteName: "thAir-AI",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  )
}
