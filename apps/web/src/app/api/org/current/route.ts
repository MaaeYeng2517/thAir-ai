import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserOrganization } from "@/lib/services/currentOrg"

export async function GET(): Promise<Response> {
  const { organizationId, userId, profile } = await getUserOrganization()
  return NextResponse.json({ organizationId, userId, profile })
}
