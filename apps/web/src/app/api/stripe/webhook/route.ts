import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { updateSubscriptionPlan } from "@/lib/services/subscription"

export const runtime = "nodejs"

export async function POST(req: Request): Promise<Response> {
  const StripeModule = (await import("stripe")).default
  const stripe = new StripeModule(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-10-28.endive" as any,
  })

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = createServerClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const organizationId = session.metadata?.organizationId
      const plan = (session.metadata?.plan as any) ?? "pro"
      if (organizationId) {
        await updateSubscriptionPlan(organizationId, plan)
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
