export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: "admin" | "user"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "admin" | "user"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "admin" | "user"
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: "free" | "pro" | "enterprise"
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: "free" | "pro" | "enterprise"
          owner_id: string
        }
        Update: {
          name?: string
          slug?: string
          plan?: "free" | "pro" | "enterprise"
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: "owner" | "admin" | "member"
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: "owner" | "admin" | "member"
        }
        Update: {
          role?: "owner" | "admin" | "member"
        }
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan: "free" | "pro" | "enterprise"
          status: "active" | "canceled" | "past_due" | "trialing"
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          monthly_token_limit: number
          monthly_agent_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan?: "free" | "pro" | "enterprise"
          status?: "active" | "canceled" | "past_due" | "trialing"
          monthly_token_limit?: number
          monthly_agent_limit?: number
        }
        Update: {
          plan?: "free" | "pro" | "enterprise"
          status?: "active" | "canceled" | "past_due" | "trialing"
          monthly_token_limit?: number
          monthly_agent_limit?: number
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          name: string
          description: string | null
          system_prompt: string
          model_id: string
          provider_slug: string
          temperature: number
          max_tokens: number
          is_active: boolean
          tools_enabled: boolean
          rag_enabled: boolean
          knowledge_base_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          name: string
          description?: string | null
          system_prompt?: string
          model_id?: string
          provider_slug?: string
          temperature?: number
          max_tokens?: number
          is_active?: boolean
          tools_enabled?: boolean
          rag_enabled?: boolean
          knowledge_base_id?: string | null
          metadata?: Json
        }
        Update: {
          name?: string
          description?: string | null
          system_prompt?: string
          model_id?: string
          provider_slug?: string
          temperature?: number
          max_tokens?: number
          is_active?: boolean
          tools_enabled?: boolean
          rag_enabled?: boolean
          knowledge_base_id?: string | null
          metadata?: Json
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          agent_id: string | null
          title: string
          model_id: string
          total_tokens: number
          message_count: number
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          agent_id?: string | null
          title?: string
          model_id?: string
          total_tokens?: number
          message_count?: number
          archived?: boolean
        }
        Update: {
          title?: string
          model_id?: string
          total_tokens?: number
          message_count?: number
          archived?: boolean
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: "user" | "assistant" | "system" | "tool"
          content: string
          tokens_used: number | null
          model_id: string | null
          provider_slug: string | null
          finish_reason: string | null
          latency_ms: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: "user" | "assistant" | "system" | "tool"
          content: string
          tokens_used?: number | null
          model_id?: string | null
          provider_slug?: string | null
          finish_reason?: string | null
          latency_ms?: number | null
          metadata?: Json
        }
        Update: {
          content?: string
          tokens_used?: number | null
          finish_reason?: string | null
          latency_ms?: number | null
        }
      }
      knowledge_bases: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          name: string
          description: string | null
          embedding_model: string
          chunk_size: number
          chunk_overlap: number
          document_count: number
          total_chunks: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          name: string
          description?: string | null
          embedding_model?: string
          chunk_size?: number
          chunk_overlap?: number
        }
        Update: {
          name?: string
          description?: string | null
          document_count?: number
          total_chunks?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          knowledge_base_id: string
          organization_id: string
          uploaded_by: string
          name: string
          file_type: "pdf" | "txt" | "md" | "docx"
          file_size: number
          storage_path: string
          status: "pending" | "processing" | "ready" | "failed"
          error_message: string | null
          chunk_count: number
          character_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          knowledge_base_id: string
          organization_id: string
          uploaded_by: string
          name: string
          file_type: "pdf" | "txt" | "md" | "docx"
          file_size: number
          storage_path: string
          status?: "pending" | "processing" | "ready" | "failed"
        }
        Update: {
          status?: "pending" | "processing" | "ready" | "failed"
          error_message?: string | null
          chunk_count?: number
          character_count?: number
          updated_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          knowledge_base_id: string
          organization_id: string
          content: string
          embedding: number[] | null
          chunk_index: number
          token_count: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          knowledge_base_id: string
          organization_id: string
          content: string
          embedding?: number[] | null
          chunk_index?: number
          token_count?: number
          metadata?: Json
        }
        Update: {
          embedding?: number[] | null
        }
      }
      tool_integrations: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          name: string
          slug: string
          description: string | null
          tool_type: "api" | "mcp" | "webhook" | "function"
          config: Json
          credentials: Json
          schema: Json
          is_active: boolean
          execution_count: number
          last_executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          name: string
          slug: string
          description?: string | null
          tool_type?: "api" | "mcp" | "webhook" | "function"
          config?: Json
          credentials?: Json
          schema?: Json
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          config?: Json
          credentials?: Json
          schema?: Json
          is_active?: boolean
          execution_count?: number
          last_executed_at?: string | null
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          name: string
          description: string | null
          trigger_type: "manual" | "schedule" | "webhook" | "event"
          trigger_config: Json
          is_active: boolean
          execution_count: number
          last_executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          name: string
          description?: string | null
          trigger_type?: "manual" | "schedule" | "webhook" | "event"
          trigger_config?: Json
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          trigger_type?: "manual" | "schedule" | "webhook" | "event"
          trigger_config?: Json
          is_active?: boolean
          execution_count?: number
          last_executed_at?: string | null
          updated_at?: string
        }
      }
      workflow_steps: {
        Row: {
          id: string
          workflow_id: string
          step_order: number
          name: string
          step_type: "agent" | "api" | "condition" | "transform" | "delay"
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          step_order?: number
          name: string
          step_type: "agent" | "api" | "condition" | "transform" | "delay"
          config?: Json
        }
        Update: {
          step_order?: number
          name?: string
          config?: Json
        }
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          organization_id: string
          triggered_by: string | null
          status: "pending" | "running" | "completed" | "failed" | "canceled"
          input_data: Json
          output_data: Json
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          organization_id: string
          triggered_by?: string | null
          status?: "pending" | "running" | "completed" | "failed" | "canceled"
          input_data?: Json
          output_data?: Json
        }
        Update: {
          status?: "pending" | "running" | "completed" | "failed" | "canceled"
          output_data?: Json
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
      }
      usage_records: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          resource_type: "chat" | "embedding" | "agent" | "workflow" | "tool"
          model_id: string | null
          provider_slug: string | null
          tokens_input: number
          tokens_output: number
          tokens_total: number
          cost_usd: number
          conversation_id: string | null
          agent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          resource_type: "chat" | "embedding" | "agent" | "workflow" | "tool"
          model_id?: string | null
          provider_slug?: string | null
          tokens_input?: number
          tokens_output?: number
          tokens_total?: number
          cost_usd?: number
          conversation_id?: string | null
          agent_id?: string | null
        }
        Update: Record<string, never>
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
        }
        Update: Record<string, never>
      }
      ai_providers: {
        Row: {
          id: string
          name: string
          slug: string
          base_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          base_url?: string | null
          is_active?: boolean
        }
        Update: {
          is_active?: boolean
        }
      }
      ai_models: {
        Row: {
          id: string
          provider_id: string
          name: string
          model_id: string
          context_window: number | null
          input_cost_per_1k: number | null
          output_cost_per_1k: number | null
          supports_vision: boolean
          supports_tools: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          name: string
          model_id: string
          context_window?: number | null
          input_cost_per_1k?: number | null
          output_cost_per_1k?: number | null
          supports_vision?: boolean
          supports_tools?: boolean
          is_active?: boolean
        }
        Update: {
          is_active?: boolean
        }
      }
    }
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          p_organization_id?: string
          p_knowledge_base_id?: string
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
          document_id: string
        }[]
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Organization = Database["public"]["Tables"]["organizations"]["Row"]
export type Agent = Database["public"]["Tables"]["agents"]["Row"]
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type KnowledgeBase = Database["public"]["Tables"]["knowledge_bases"]["Row"]
export type Document = Database["public"]["Tables"]["documents"]["Row"]
export type DocumentChunk = Database["public"]["Tables"]["document_chunks"]["Row"]
export type ToolIntegration = Database["public"]["Tables"]["tool_integrations"]["Row"]
export type Workflow = Database["public"]["Tables"]["workflows"]["Row"]
export type WorkflowStep = Database["public"]["Tables"]["workflow_steps"]["Row"]
export type WorkflowExecution = Database["public"]["Tables"]["workflow_executions"]["Row"]
export type UsageRecord = Database["public"]["Tables"]["usage_records"]["Row"]
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
