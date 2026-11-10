import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

export const runtime = "nodejs"

export async function POST(req: Request): Promise<Response> {
  const StripeModule = (await import("stripe")).default
  const stripe = new StripeModule(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-10-28.endive" as any,
  })

  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { organizationId: string; plan: "free" | "pro" | "enterprise" }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const priceMap: Record<string, string> = {
    free: "price_free_placeholder",
    pro: process.env.STRIPE_PRICE_PRO!,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
  }

  const priceId = priceMap[body.plan]
  if (!priceId || priceId.includes("placeholder")) {
    return NextResponse.json({ error: "Plan not available for checkout" }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/usage?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/usage`,
    client_reference_id: body.organizationId,
    metadata: { plan: body.plan, organizationId: body.organizationId },
  })

  return NextResponse.json({ url: session.url })
}
