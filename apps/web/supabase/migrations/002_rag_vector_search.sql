-- thAir-AI Phase 4: RAG vector search function

-- match_document_chunks: cosine similarity search over document_chunks within a knowledge base
create or replace function match_document_chunks (
  kb_id uuid,
  query_embedding vector(1536),
  match_threshold float8 default 0.3,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  similarity float8,
  document_id uuid,
  chunk_index int
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.document_id,
    dc.chunk_index
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where d.knowledge_base_id = kb_id
    and d.status = 'ready'
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
