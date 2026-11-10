import { createServerClient } from "@/lib/supabase/server"

export async function getUserOrganization(): Promise<{
  organizationId: string | null
  userId: string | null
  profile: any | null
}> {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { organizationId: null, userId: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { organizationId: null, userId: user.id, profile: null }
  }

  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)

  if (membersError || !members || members.length === 0) {
    return { organizationId: null, userId: user.id, profile }
  }

  return {
    organizationId: members[0].organization_id,
    userId: user.id,
    profile,
  }
}
