-- ============================================================
-- thAir-AI Database Migrations
-- Run in Supabase SQL Editor (in order)
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  monthly_token_limit  BIGINT NOT NULL DEFAULT 100000,
  monthly_agent_limit  INT NOT NULL DEFAULT 3,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AI PROVIDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_providers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  base_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ai_providers (name, slug, base_url) VALUES
  ('OpenAI', 'openai', 'https://api.openai.com'),
  ('Anthropic', 'anthropic', 'https://api.anthropic.com'),
  ('Google', 'google', 'https://generativelanguage.googleapis.com'),
  ('Mistral', 'mistral', 'https://api.mistral.ai')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- AI MODELS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_models (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID NOT NULL REFERENCES ai_providers(id),
  name            TEXT NOT NULL,
  model_id        TEXT NOT NULL,
  context_window  INT,
  input_cost_per_1k  NUMERIC(10,6),
  output_cost_per_1k NUMERIC(10,6),
  supports_vision BOOLEAN NOT NULL DEFAULT FALSE,
  supports_tools  BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ai_models (provider_id, name, model_id, context_window, input_cost_per_1k, output_cost_per_1k, supports_tools) 
SELECT p.id, m.name, m.model_id, m.ctx, m.in_cost, m.out_cost, m.tools
FROM ai_providers p
JOIN (VALUES
  ('openai', 'GPT-4o', 'gpt-4o', 128000, 0.005, 0.015, TRUE),
  ('openai', 'GPT-4o Mini', 'gpt-4o-mini', 128000, 0.00015, 0.00060, TRUE),
  ('openai', 'GPT-3.5 Turbo', 'gpt-3.5-turbo', 16385, 0.0005, 0.0015, TRUE),
  ('openai', 'o1 Preview', 'o1-preview', 128000, 0.015, 0.060, FALSE),
  ('anthropic', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-20241022', 200000, 0.003, 0.015, TRUE),
  ('anthropic', 'Claude 3 Haiku', 'claude-3-haiku-20240307', 200000, 0.00025, 0.00125, TRUE)
) AS m(provider, name, model_id, ctx, in_cost, out_cost, tools) ON p.slug = m.provider
ON CONFLICT DO NOTHING;

-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by          UUID NOT NULL REFERENCES profiles(id),
  name                TEXT NOT NULL,
  description         TEXT,
  system_prompt       TEXT NOT NULL DEFAULT 'You are a helpful AI assistant.',
  model_id            TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  provider_slug       TEXT NOT NULL DEFAULT 'openai',
  temperature         NUMERIC(3,2) NOT NULL DEFAULT 0.70 CHECK (temperature BETWEEN 0 AND 2),
  max_tokens          INT NOT NULL DEFAULT 2048,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  tools_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  rag_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  knowledge_base_id   UUID,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT 'New conversation',
  model_id        TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  total_tokens    BIGINT NOT NULL DEFAULT 0,
  message_count   INT NOT NULL DEFAULT 0,
  archived        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content         TEXT NOT NULL,
  tokens_used     INT,
  model_id        TEXT,
  provider_slug   TEXT,
  finish_reason   TEXT,
  latency_ms      INT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ============================================================
-- KNOWLEDGE BASES
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  description     TEXT,
  embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  chunk_size      INT NOT NULL DEFAULT 1000,
  chunk_overlap   INT NOT NULL DEFAULT 200,
  document_count  INT NOT NULL DEFAULT 0,
  total_chunks    INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_bases_org ON knowledge_bases(organization_id);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by      UUID NOT NULL REFERENCES profiles(id),
  name             TEXT NOT NULL,
  file_type        TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'md', 'docx')),
  file_size        BIGINT NOT NULL DEFAULT 0,
  storage_path     TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  error_message    TEXT,
  chunk_count      INT NOT NULL DEFAULT 0,
  character_count  INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_kb ON documents(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- ============================================================
-- DOCUMENT CHUNKS (with pgvector)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id      UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  embedding        VECTOR(1536),
  chunk_index      INT NOT NULL DEFAULT 0,
  token_count      INT NOT NULL DEFAULT 0,
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_kb ON document_chunks(knowledge_base_id);
-- Vector similarity index (IVFFlat for approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- TOOL INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS tool_integrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  tool_type       TEXT NOT NULL DEFAULT 'api' CHECK (tool_type IN ('api', 'mcp', 'webhook', 'function')),
  config          JSONB NOT NULL DEFAULT '{}',
  credentials     JSONB NOT NULL DEFAULT '{}',
  schema          JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  execution_count BIGINT NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_tools_org ON tool_integrations(organization_id);

-- ============================================================
-- WORKFLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS workflows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  description     TEXT,
  trigger_type    TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'schedule', 'webhook', 'event')),
  trigger_config  JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  execution_count BIGINT NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);

-- ============================================================
-- WORKFLOW STEPS
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id  UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order   INT NOT NULL DEFAULT 0,
  name         TEXT NOT NULL,
  step_type    TEXT NOT NULL CHECK (step_type IN ('agent', 'api', 'condition', 'transform', 'delay')),
  config       JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_steps_workflow ON workflow_steps(workflow_id);

-- ============================================================
-- WORKFLOW EXECUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  triggered_by    UUID REFERENCES profiles(id),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'canceled')),
  input_data      JSONB NOT NULL DEFAULT '{}',
  output_data     JSONB NOT NULL DEFAULT '{}',
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_exec_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_wf_exec_org ON workflow_executions(organization_id);

-- ============================================================
-- EXECUTION LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS execution_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id    UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id         UUID REFERENCES workflow_steps(id),
  log_level       TEXT NOT NULL DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
  message         TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exec_logs_execution ON execution_logs(execution_id);

-- ============================================================
-- USAGE RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),
  resource_type   TEXT NOT NULL CHECK (resource_type IN ('chat', 'embedding', 'agent', 'workflow', 'tool')),
  model_id        TEXT,
  provider_slug   TEXT,
  tokens_input    INT NOT NULL DEFAULT 0,
  tokens_output   INT NOT NULL DEFAULT 0,
  tokens_total    INT NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(12, 8) NOT NULL DEFAULT 0,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_org ON usage_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_records(created_at DESC);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: members see their orgs
CREATE POLICY "Members can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Owners can update organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Authenticated can create organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Organization members: see own membership
CREATE POLICY "Users can view org memberships" ON organization_members
  FOR SELECT USING (user_id = auth.uid() OR organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Owners can manage members" ON organization_members
  FOR ALL USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Users can insert own membership" ON organization_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Agents: org-scoped
CREATE POLICY "Org members can view agents" ON agents
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Org members can manage agents" ON agents
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Conversations: user-scoped
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (user_id = auth.uid());

-- Messages: via conversation ownership
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));
CREATE POLICY "Users can insert messages in own conversations" ON messages
  FOR INSERT WITH CHECK (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));

-- Knowledge bases: org-scoped
CREATE POLICY "Org members can view knowledge bases" ON knowledge_bases
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Org members can manage knowledge bases" ON knowledge_bases
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Documents: org-scoped
CREATE POLICY "Org members can view documents" ON documents
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Org members can manage documents" ON documents
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Document chunks: org-scoped
CREATE POLICY "Org members can view chunks" ON document_chunks
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Org members can manage chunks" ON document_chunks
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Tool integrations: org-scoped
CREATE POLICY "Org members can view tools" ON tool_integrations
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Org members can manage tools" ON tool_integrations
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Workflows: org-scoped
CREATE POLICY "Org members can view workflows" ON workflows
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Org members can manage workflows" ON workflows
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Usage records: user-scoped read
CREATE POLICY "Users can view own usage" ON usage_records
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own usage" ON usage_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Audit logs: org admins can view
CREATE POLICY "Org members can view audit logs" ON audit_logs
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile + organization on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  -- Insert profile
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create personal organization
  v_slug := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    '[^a-z0-9]+', '-', 'g'
  )) || '-' || substring(NEW.id::text, 1, 8);

  INSERT INTO organizations (name, slug, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
    v_slug,
    NEW.id
  )
  RETURNING id INTO v_org_id;

  -- Add owner as member
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner');

  -- Create free subscription
  INSERT INTO subscriptions (organization_id, plan, status)
  VALUES (v_org_id, 'free', 'active');

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to perform RAG similarity search
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding   VECTOR(1536),
  match_threshold   FLOAT DEFAULT 0.7,
  match_count       INT DEFAULT 5,
  p_organization_id UUID DEFAULT NULL,
  p_knowledge_base_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id               UUID,
  content          TEXT,
  metadata         JSONB,
  similarity       FLOAT,
  document_id      UUID
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.document_id
  FROM document_chunks dc
  WHERE
    (p_organization_id IS NULL OR dc.organization_id = p_organization_id)
    AND (p_knowledge_base_id IS NULL OR dc.knowledge_base_id = p_knowledge_base_id)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER knowledge_bases_updated_at BEFORE UPDATE ON knowledge_bases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tool_integrations_updated_at BEFORE UPDATE ON tool_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
