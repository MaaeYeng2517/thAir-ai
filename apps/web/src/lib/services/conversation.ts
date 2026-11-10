import { createServerClient } from "@/lib/supabase/server"

export type DbConversation = {
  id: string
  agent_id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type DbMessage = {
  id: string
  conversation_id: string
  role: string
  content: string
  tokens: number
  created_at: string
}

export async function getConversations(agentId: string, userId: string): Promise<DbConversation[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("agent_id", agentId)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as DbConversation[]
}

export async function createConversation(params: {
  agentId: string
  userId: string
  title?: string | null
}): Promise<DbConversation> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      agent_id: params.agentId,
      user_id: params.userId,
      title: params.title,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbConversation
}

export async function getConversation(id: string): Promise<DbConversation | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as DbConversation
}

export async function addMessage(params: {
  conversationId: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  tokens?: number
}): Promise<DbMessage> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      role: params.role,
      content: params.content,
      tokens: params.tokens ?? 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbMessage
}

export async function getMessages(conversationId: string): Promise<DbMessage[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) return []
  return (data ?? []) as DbMessage[]
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  const supabase = createServerClient()
  await supabase.from("conversations").update({ title }).eq("id", id)
}
