-- thAir-AI Phase 1 Schema
-- Supabase PostgreSQL with pgvector

-- Enable extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles
-- ============================================================
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('admin','owner','member','viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- organizations
-- ============================================================
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  plan text default 'free' check (plan in ('free','pro','enterprise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- organization_members
-- ============================================================
create table organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text default 'member' check (role in ('admin','owner','member','viewer')),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- ============================================================
-- subscriptions
-- ============================================================
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  status text default 'active' check (status in ('active','canceled','past_due','incomplete')),
  plan text default 'free' check (plan in ('free','pro','enterprise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- usage_records
-- ============================================================
create table usage_records (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  agent_id uuid,
  provider text not null,
  model text not null,
  tokens_input integer default 0,
  tokens_output integer default 0,
  estimated_cost numeric default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ai_providers
-- ============================================================
create table ai_providers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- ai_models
-- ============================================================
create table ai_models (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid not null references ai_providers(id) on delete cascade,
  name text not null,
  context_window integer,
  input_cost_per_1k numeric default 0,
  output_cost_per_1k numeric default 0,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- agents
-- ============================================================
create table agents (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  system_prompt text,
  model_id uuid not null references ai_models(id),
  temperature numeric default 0.7,
  max_tokens integer default 4096,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- conversations
-- ============================================================
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid not null references agents(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- messages
-- ============================================================
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  tokens integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- knowledge_bases
-- ============================================================
create table knowledge_bases (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- documents
-- ============================================================
create table documents (
  id uuid default uuid_generate_v4() primary key,
  knowledge_base_id uuid not null references knowledge_bases(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  mime_type text,
  status text default 'pending' check (status in ('pending','processing','ready','error')),
  chunk_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- document_chunks
-- ============================================================
create table document_chunks (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  chunk_index integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- tool_integrations
-- ============================================================
create table tool_integrations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type text not null,
  config jsonb default '{}',
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- workflows
-- ============================================================
create table workflows (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  definition jsonb not null default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- workflow_executions
-- ============================================================
create table workflow_executions (
  id uuid default uuid_generate_v4() primary key,
  workflow_id uuid not null references workflows(id) on delete cascade,
  status text default 'pending' check (status in ('pending','running','completed','failed')),
  input jsonb default '{}',
  output jsonb default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- audit_logs
-- ============================================================
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_usage_records_org on usage_records(organization_id);
create index idx_usage_records_created on usage_records(created_at);
create index idx_agents_org on agents(organization_id);
create index idx_conversations_agent on conversations(agent_id);
create index idx_messages_conversation on messages(conversation_id);
create index idx_document_chunks_doc on document_chunks(document_id);
create index idx_document_chunks_embedding on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_workflows_org on workflows(organization_id);
create index idx_audit_logs_org on audit_logs(organization_id);

-- ============================================================
-- RLS
-- ============================================================
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table subscriptions enable row level security;
alter table usage_records enable row level security;
alter table agents enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table knowledge_bases enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table tool_integrations enable row level security;
alter table workflows enable row level security;
alter table workflow_executions enable row level security;
alter table audit_logs enable row level security;

-- Profiles: users can read their own profile
create policy profiles_select_own on profiles for select using (auth.uid() = id);
create policy profiles_update_own on profiles for update using (auth.uid() = id);

-- Organizations: members can read orgs they belong to
create policy organizations_select_member on organizations for select
  using (exists (select 1 from organization_members where organization_id = organizations.id and user_id = auth.uid()));

-- Organization members
create policy organization_members_select_org on organization_members for select
  using (exists (select 1 from organization_members om where om.organization_id = organization_members.organization_id and om.user_id = auth.uid()));

-- Usage records
create policy usage_records_select_org on usage_records for select
  using (exists (select 1 from organization_members where organization_id = usage_records.organization_id and user_id = auth.uid()));

-- Agents
create policy agents_select_org on agents for select
  using (exists (select 1 from organization_members where organization_id = agents.organization_id and user_id = auth.uid()));
create policy agents_insert_org on agents for insert
  with check (exists (select 1 from organization_members where organization_id = agents.organization_id and user_id = auth.uid()));
create policy agents_update_org on agents for update
  using (exists (select 1 from organization_members where organization_id = agents.organization_id and user_id = auth.uid()));
create policy agents_delete_org on agents for delete
  using (exists (select 1 from organization_members where organization_id = agents.organization_id and user_id = auth.uid()));

-- Conversations
create policy conversations_select_org on conversations for select
  using (exists (select 1 from agents join organization_members om on om.organization_id = agents.organization_id where agents.id = conversations.agent_id and om.user_id = auth.uid()));

-- Messages
create policy messages_select_conv on messages for select
  using (exists (select 1 from conversations join agents on agents.id = conversations.agent_id join organization_members om on om.organization_id = agents.organization_id where conversations.id = messages.conversation_id and om.user_id = auth.uid()));

-- Knowledge bases / documents / chunks
create policy knowledge_bases_select_org on knowledge_bases for select
  using (exists (select 1 from organization_members where organization_id = knowledge_bases.organization_id and user_id = auth.uid()));
create policy documents_select_kb on documents for select
  using (exists (select 1 from knowledge_bases join organization_members om on om.organization_id = knowledge_bases.organization_id where knowledge_bases.id = documents.knowledge_base_id and om.user_id = auth.uid()));
create policy document_chunks_select_doc on document_chunks for select
  using (exists (select 1 from documents join knowledge_bases on knowledge_bases.id = documents.knowledge_base_id join organization_members om on om.organization_id = knowledge_bases.organization_id where documents.id = document_chunks.document_id and om.user_id = auth.uid()));

-- Tool integrations
create policy tool_integrations_select_org on tool_integrations for select
  using (exists (select 1 from organization_members where organization_id = tool_integrations.organization_id and user_id = auth.uid()));

-- Workflows
create policy workflows_select_org on workflows for select
  using (exists (select 1 from organization_members where organization_id = workflows.organization_id and user_id = auth.uid()));
create policy workflows_insert_org on workflows for insert
  with check (exists (select 1 from organization_members where organization_id = workflows.organization_id and user_id = auth.uid()));

-- Workflow executions
create policy workflow_executions_select_wf on workflow_executions for select
  using (exists (select 1 from workflows join organization_members om on om.organization_id = workflows.organization_id where workflows.id = workflow_executions.workflow_id and om.user_id = auth.uid()));

-- Audit logs
create policy audit_logs_select_org on audit_logs for select
  using (exists (select 1 from organization_members where organization_id = audit_logs.organization_id and user_id = auth.uid()));
