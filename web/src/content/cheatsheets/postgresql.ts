import type { CheatSheetData } from "./types";

const postgresql: CheatSheetData = {
  title: "The Ultimate PostgreSQL Cheat Sheet",
  subtitle: "Schema & transactions · MVCC & indexing · pgvector · production toolbelt",
  sections: [
    {
      title: "Schema Basics",
      color: "violet",
      rows: [
        { term: "Table with constraints", desc: "Enforce data integrity at the database level", code: "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL\n);" },
        { term: "Foreign key", desc: "ALWAYS index this column explicitly — Postgres doesn't", code: "author_id INTEGER REFERENCES users(id) ON DELETE CASCADE\nCREATE INDEX idx_posts_author_id ON posts(author_id);" },
        { term: "CHECK constraint", desc: "A database-level last line of defense", code: "ALTER TABLE accounts ADD CONSTRAINT chk_balance CHECK (balance >= 0);" },
        { term: "NULL handling", desc: "Never compare with = NULL — always matches nothing", code: "WHERE middle_name IS NULL" },
      ],
    },
    {
      title: "Querying",
      color: "blue",
      rows: [
        { term: "WHERE vs HAVING", desc: "WHERE filters rows before grouping, HAVING after", code: "SELECT author_id, COUNT(*) FROM posts\nGROUP BY author_id HAVING COUNT(*) > 5;" },
        { term: "Window functions", desc: "Per-row ranking without collapsing groups", code: "RANK() OVER (PARTITION BY author_id ORDER BY published_at DESC)" },
        { term: "CTE", desc: "Name an intermediate step for readable multi-step queries", code: "WITH active AS (SELECT ... ) SELECT * FROM active JOIN ..." },
        { term: "JSONB query", desc: "-> returns JSONB, ->> returns text", code: "payload->'metadata'->>'page' = '/home'" },
        { term: "JSONB index", desc: "GIN indexes make containment queries fast", code: "CREATE INDEX idx ON events USING GIN (payload);" },
      ],
    },
    {
      title: "Transactions & MVCC",
      color: "emerald",
      rows: [
        { term: "Transaction", desc: "Atomic: all-or-nothing across statements", code: "BEGIN;\nUPDATE a SET bal = bal - 100;\nUPDATE b SET bal = bal + 100;\nCOMMIT;" },
        { term: "MVCC", desc: "Updates create new row versions — readers never block writers", code: "// old version stays until VACUUM reclaims it" },
        { term: "VACUUM", desc: "Never disable autovacuum — bloat compounds silently", code: "VACUUM ANALYZE posts;" },
        { term: "Row locking", desc: "Prevent lost updates under concurrent writes", code: "SELECT * FROM accounts WHERE id=1 FOR UPDATE;" },
        { term: "Safe job queue claiming", desc: "Concurrent workers each grab a different row", code: "SELECT * FROM jobs WHERE status='pending'\nFOR UPDATE SKIP LOCKED LIMIT 1;" },
      ],
    },
    {
      title: "Indexing & Performance",
      color: "amber",
      rows: [
        { term: "Diagnose a slow query", desc: "The first tool, always — never guess", code: "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM posts WHERE author_id=42;" },
        { term: "B-tree (default)", desc: "Equality and range queries on scalar columns", code: "CREATE INDEX idx ON posts(author_id);" },
        { term: "GIN", desc: "Full-text search, JSONB containment, array membership", code: "CREATE INDEX idx ON posts USING GIN (title gin_trgm_ops);" },
        { term: "GiST", desc: "Geometric data and range types", code: "CREATE INDEX idx ON locations USING GiST (coordinates);" },
        { term: "Partitioning", desc: "Prune huge time-series tables to relevant partitions", code: "CREATE TABLE events (...) PARTITION BY RANGE (created_at);" },
      ],
    },
    {
      title: "pgvector & AI",
      color: "rose",
      rows: [
        { term: "Vector column", desc: "Native embedding storage alongside relational data", code: "CREATE EXTENSION vector;\nembedding VECTOR(1536)" },
        { term: "ANN index", desc: "HNSW for approximate nearest-neighbor search", code: "CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);" },
        { term: "Similarity query", desc: "Cosine distance operator, combinable with relational filters", code: "ORDER BY embedding <=> '[0.1,0.2]'::vector LIMIT 5;" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Connection pooling", desc: "Essential — Postgres uses one OS process per connection", code: "# PgBouncer: pool_mode = transaction" },
        { term: "Key config tuning", desc: "Defaults are conservative for a dedicated server", code: "shared_buffers = 4GB\neffective_cache_size = 12GB" },
        { term: "Find slow/long queries", desc: "Live visibility into what's running right now", code: "SELECT pid, query, now()-query_start FROM pg_stat_activity;" },
        { term: "Aggregate query load", desc: "Which queries dominate total database time", code: "SELECT query, total_exec_time FROM pg_stat_statements\nORDER BY total_exec_time DESC;" },
        { term: "Backup with PITR", desc: "Logical dump alone can't restore to an arbitrary moment", code: "pg_dump mydb > backup.sql\n# + continuous WAL archiving" },
      ],
    },
  ],
};

export default postgresql;
