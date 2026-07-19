import type { SkillContent } from "../types";

/**
 * PostgreSQL — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const postgresql: SkillContent = {
  overview: `
PostgreSQL is an open-source, object-relational database management system built around one defining commitment: correctness and standards compliance first, performance second, never the other way around. Where many databases have historically traded strict ACID guarantees or SQL-standard compliance for raw speed, PostgreSQL's three-decade development history has consistently prioritized getting the hard parts right — transaction isolation, constraint enforcement, extensibility — producing a database engineers describe as "boring" in the best possible sense: it does exactly what the SQL standard and your schema say it will do, reliably, release after release.

For an AI engineer, PostgreSQL is frequently the default choice for the "system of record" underneath an AI application — user accounts, conversation history, application state, and increasingly, vector embeddings themselves via the pgvector extension, letting a single database serve both traditional relational data and similarity search without introducing a separate vector database for many workloads. Its extensibility (custom types, functions, and a genuinely enormous extension ecosystem) means PostgreSQL frequently absorbs responsibilities that would otherwise require a second specialized system.

Key characteristics: full ACID transactions with configurable isolation levels; a sophisticated MVCC (Multi-Version Concurrency Control) engine that lets readers and writers avoid blocking each other; a rich native type system (JSON/JSONB, arrays, ranges, geometric types) beyond plain relational columns; genuine extensibility via a well-defined extension mechanism (PostGIS for geospatial data, pgvector for embeddings, TimescaleDB for time-series); and a permissive open-source license with no single controlling vendor, unlike MySQL's Oracle stewardship.
`,

  history: `
PostgreSQL descends directly from **POSTGRES**, a research project led by **Michael Stonebraker** at UC Berkeley, explicitly designed as a successor to Stonebraker's earlier, hugely influential INGRES project.

| Year | Milestone |
|------|-----------|
| 1986 | The POSTGRES project begins at UC Berkeley, led by Michael Stonebraker, aiming to add object-relational concepts beyond INGRES's purely relational model |
| 1994 | POSTGRES gains a SQL query interface (previously used its own QUEL language), becoming **Postgres95** |
| 1996 | Renamed **PostgreSQL** to reflect its SQL standard compliance and distinguish it from the original POSTGRES |
| 1997–2000 | Early open-source community releases; MVCC, subqueries, and foreign keys mature |
| 2001 | PostgreSQL 7.1 — write-ahead logging (WAL) introduced, a foundational reliability and replication building block |
| 2005 | PostgreSQL 8.0 — native Windows support, savepoints, and significant performance improvements |
| 2010 | PostgreSQL 9.0 — built-in streaming replication and hot standby, a major leap for high-availability deployments |
| 2012 | PostgreSQL 9.2 — native JSON support begins, PostgreSQL's first serious move to accommodate document-style workloads |
| 2014 | PostgreSQL 9.4 — **JSONB** (a binary, indexable JSON type) ships, dramatically improving JSON query performance over plain JSON |
| 2017 | PostgreSQL 10 — native, declarative table partitioning; logical replication |
| 2021 | The **pgvector** extension is released, adding vector similarity search directly inside PostgreSQL — directly relevant to the coming LLM/embeddings boom |
| 2023–2024 | PostgreSQL 16/17 — continued performance work on parallel query execution, logical replication improvements, and pgvector's rapid adoption for RAG/embeddings workloads |
| 2025+ | Continued annual major releases (PostgreSQL's release cadence is yearly, each supported for 5 years) |

PostgreSQL's direct academic lineage — Stonebraker later won the 2014 ACM Turing Award, partly for this body of work — is unusual among production databases and shows up concretely in the engine's design: features are frequently implemented with a rigor and correctness-first philosophy traceable directly to its research origins, rather than being bolted on reactively to chase a competitor's feature.
`,

  "why-it-exists": `
PostgreSQL exists because Michael Stonebraker's research agenda identified a gap the purely relational model (as INGRES and early commercial databases implemented it) didn't address: **real-world data often has richer structure than flat rows and columns** — nested objects, arrays, custom types, geometric and temporal data — and forcing all of it through a rigid relational schema either lost information or required awkward workarounds.

The prior landscape (relational databases circa the mid-1980s) offered:

1. **Strict relational databases**: strong consistency guarantees and a mature theoretical foundation (Codd's relational model), but a rigid type system that struggled with anything beyond simple scalar columns.
2. **Hierarchical/network databases** (older, pre-relational systems): more flexible structure, but without the relational model's query power (SQL, joins) or its strong theoretical guarantees.

PostgreSQL's insight, distilled from the POSTGRES research project, was "object-relational": keep the relational model's rigor (tables, SQL, ACID transactions) as the foundation, but make the TYPE SYSTEM itself extensible — let developers define new column types, new functions operating on them, and new index types supporting efficient queries over them, all without forking the database engine itself. This is precisely why PostgreSQL could later absorb JSON documents (JSONB), geospatial data (PostGIS), and vector embeddings (pgvector) as extensions rather than needing an entirely separate specialized database for each — the extensibility was architected in from the start, decades before any of these specific use cases existed.
`,

  "problem-it-solves": `
PostgreSQL solves the **"I need a database I can trust completely with my data's correctness, that can also grow to handle new, unanticipated data types and workloads without switching engines"** problem.

Concretely, PostgreSQL provides:

- **Uncompromising ACID transactions**: every write is Atomic, Consistent, Isolated, and Durable by default, with configurable isolation levels for when an application needs to trade some isolation strictness for concurrency.
- **A rich, extensible type system**: JSON/JSONB for semi-structured data, arrays, ranges, geometric types, and genuinely custom types via extensions — one database engine serving workloads that would otherwise require several specialized systems.
- **MVCC-based concurrency**: readers never block writers and writers never block readers (for the common case), because each transaction sees a consistent snapshot of the data rather than fighting over locks for ordinary reads.
- **Extensibility as a first-class citizen**: PostGIS (geospatial), pgvector (vector similarity search), TimescaleDB (time-series), and hundreds of other extensions add entirely new capabilities without forking or replacing the core engine.
- **Standards compliance**: PostgreSQL tracks the SQL standard unusually closely among production databases, reducing the "which specific dialect quirks do I need to remember" cost of working across different database engines.

What PostgreSQL deliberately does **not** solve: it is not built from the ground up for the specific "infinitely horizontally scalable across thousands of commodity nodes" workload the way some NoSQL/distributed systems are — PostgreSQL scales vertically very well and horizontally with real effort (read replicas, Citus/sharding extensions, or managed services offering it), but it isn't a native, out-of-the-box globally-distributed system the way Cassandra or CockroachDB are designed to be from inception. It also isn't optimized specifically for pure key-value or wide-column workloads at the extreme low-latency, high-throughput end that Redis or specialized wide-column stores target.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain ACID properties and MVCC precisely enough to reason about concurrent transaction behavior and choose an appropriate isolation level.
2. Design a normalized relational schema, apply appropriate constraints, and know when denormalization is the right tradeoff.
3. Write efficient SQL queries using joins, subqueries, window functions, and CTEs (Common Table Expressions).
4. Use EXPLAIN ANALYZE to diagnose a slow query and choose the correct index type (B-tree, GIN, GiST) to fix it.
5. Use PostgreSQL's JSON/JSONB support appropriately, understanding when semi-structured data belongs in a JSONB column versus a normalized table.
6. Configure and reason about replication (streaming and logical) for read scaling and high availability.
7. Apply the pgvector extension for storing and querying embeddings directly in PostgreSQL.
8. Diagnose and resolve lock contention, connection pool exhaustion, and vacuum/bloat issues in a production database.
9. Answer senior-level interview questions on isolation levels, MVCC internals, and indexing strategy tradeoffs.
`,

  prerequisites: `
- **Required**: basic SQL — SELECT, WHERE, JOIN, GROUP BY; this page assumes you can read and write simple queries already, building from there into indexing, transactions, and internals.
- **Helpful**: general **Computer Science** fundamentals (data structures, particularly trees and hashing) for understanding index internals (B-tree vs. hash vs. GIN) more deeply.
- **Helpful**: exposure to a backend framework (Django, FastAPI, Spring Boot, Express) that talks to PostgreSQL via an ORM — this page explains both the raw SQL/database layer AND how ORMs commonly misuse it (the N+1 query problem referenced throughout the platform's framework skills).

Dependency links: basic SQL fundamentals → this page → **Redis** for the complementary caching layer most PostgreSQL-backed applications add → **Django**/**FastAPI**/**Spring Boot** for the application layer typically sitting on top → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Tables, rows, and basic types

~~~sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO users (email) VALUES ('ada@example.com');
SELECT * FROM users WHERE email = 'ada@example.com';
~~~

SERIAL creates an auto-incrementing integer; PRIMARY KEY enforces uniqueness and non-nullability; UNIQUE and NOT NULL are column-level constraints enforced by the database itself, not just application code — a core reason to prefer database-level constraints over application-only validation.

### Relationships: foreign keys and joins

~~~sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

SELECT posts.title, users.email
FROM posts
JOIN users ON posts.author_id = users.id;
~~~

REFERENCES users(id) creates a foreign key constraint — PostgreSQL refuses to insert a post with an author_id that doesn't exist in users, and ON DELETE CASCADE tells PostgreSQL what to do to posts when their referenced user is deleted (delete them too, in this case).

### Filtering, sorting, and aggregation

~~~sql
SELECT author_id, COUNT(*) AS post_count
FROM posts
WHERE title NOT LIKE 'Draft%'
GROUP BY author_id
HAVING COUNT(*) > 5
ORDER BY post_count DESC
LIMIT 10;
~~~

GROUP BY collapses rows sharing a value into one row per group; HAVING filters groups (after aggregation), distinct from WHERE which filters individual rows BEFORE aggregation — a very common beginner confusion.

### Basic indexing

~~~sql
CREATE INDEX idx_posts_author_id ON posts(author_id);
~~~

An index lets PostgreSQL find matching rows without scanning the entire table — essential once a table grows beyond a few thousand rows; without an index on author_id, the JOIN above would require a full table scan of posts for every query.

### Transactions — the ACID basics

~~~sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
~~~

Everything between BEGIN and COMMIT executes as one atomic unit — if any statement fails, the entire transaction can be rolled back (ROLLBACK), leaving the database exactly as it was before, never in a half-updated state.

### NULL and three-valued logic

~~~sql
SELECT * FROM users WHERE middle_name = NULL;    -- WRONG: always returns zero rows
SELECT * FROM users WHERE middle_name IS NULL;    -- RIGHT: the correct way to test for NULL
~~~

NULL represents "unknown," not "empty" or "zero" — any comparison against NULL (including = NULL) evaluates to NULL (neither true nor false), never matching any row; IS NULL/IS NOT NULL are the only correct ways to test for it.

Common beginner trap: forgetting an index on a foreign key column, causing slow joins invisible with small test data — covered fully in Performance and Anti-Patterns.
`,

  "intermediate-concepts": `
### Window functions

~~~sql
SELECT
    title,
    author_id,
    RANK() OVER (PARTITION BY author_id ORDER BY published_at DESC) AS post_rank
FROM posts;
~~~

Window functions compute a value across a set of related rows (the "window," defined by PARTITION BY) WITHOUT collapsing them into one row per group the way GROUP BY does — here, each post keeps its own row, annotated with its rank among that author's posts, ordered by recency.

### Common Table Expressions (CTEs)

~~~sql
WITH active_authors AS (
    SELECT author_id, COUNT(*) AS post_count
    FROM posts
    WHERE published_at > now() - interval '30 days'
    GROUP BY author_id
    HAVING COUNT(*) > 3
)
SELECT users.email, active_authors.post_count
FROM active_authors
JOIN users ON users.id = active_authors.author_id;
~~~

A CTE (WITH ... AS) names an intermediate query result, making complex multi-step queries readable as a sequence of named steps rather than deeply nested subqueries — PostgreSQL 12+ inlines simple CTEs automatically for performance, but a RECURSIVE CTE (for hierarchical/graph-like queries) is always materialized as its own step.

### JSONB for semi-structured data

~~~sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    payload JSONB NOT NULL
);

INSERT INTO events (payload) VALUES ('{"type": "click", "user_id": 42, "metadata": {"page": "/home"}}');

SELECT payload->>'type' AS event_type
FROM events
WHERE payload->'metadata'->>'page' = '/home';

CREATE INDEX idx_events_payload ON events USING GIN (payload);
~~~

JSONB stores JSON in a decomposed binary format (not the raw text JSON preserves), enabling both efficient querying (via ->/->> operators) and indexing (via GIN indexes) — the -> operator returns a JSONB value, ->> returns text, a frequent source of "why doesn't this comparison work" bugs when the two are confused.

### Isolation levels

~~~sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ... queries that need a consistent snapshot throughout the transaction ...
COMMIT;
~~~

PostgreSQL supports Read Committed (the default — each statement sees the latest committed data), Repeatable Read (the whole transaction sees one consistent snapshot from its start), and Serializable (the strictest — behaves as if transactions ran one at a time, detecting and rejecting genuine conflicts) — higher isolation levels trade some concurrency/throughput for stronger consistency guarantees.

### EXPLAIN ANALYZE — reading a query plan

~~~sql
EXPLAIN ANALYZE
SELECT * FROM posts WHERE author_id = 42;
~~~

~~~
Seq Scan on posts (cost=0.00..1834.00 rows=50 width=120) (actual time=0.02..12.4 rows=47 loops=1)
  Filter: (author_id = 42)
~~~

EXPLAIN shows PostgreSQL's PLANNED execution strategy; ANALYZE actually runs the query and shows real timing — a "Seq Scan" (full table scan) on a large, frequently-filtered table is the single most common signal that a missing index needs adding.

### Constraints beyond NOT NULL and UNIQUE

~~~sql
ALTER TABLE posts ADD CONSTRAINT check_title_length CHECK (length(title) >= 3);
ALTER TABLE accounts ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
~~~

CHECK constraints enforce arbitrary boolean conditions at the database level — a genuine last line of defense against invalid data even if application-level validation has a bug, since the database itself refuses the write.
`,

  "advanced-concepts": `
### MVCC internals

~~~mermaid
flowchart LR
    A["Transaction starts\n(assigned a snapshot)"] --> B["Reads see only rows\ncommitted before this snapshot"]
    B --> C["Writes create NEW row versions\n(old version kept, marked dead)"]
    C --> D["On commit: new version visible\nto future snapshots"]
    D --> E["VACUUM later reclaims\nspace from dead row versions"]
~~~

PostgreSQL's MVCC means an UPDATE doesn't modify a row in place — it creates an entirely new row version and marks the old one as dead (but not immediately removed), which is precisely why readers never block writers (they simply see the appropriate version for their snapshot) but also why VACUUM (reclaiming dead row versions) is a necessary, ongoing maintenance operation, not an optional nicety.

### Index types beyond B-tree

~~~sql
CREATE INDEX idx_posts_title_trgm ON posts USING GIN (title gin_trgm_ops);  -- fuzzy text search
CREATE INDEX idx_locations_geo ON locations USING GiST (coordinates);        -- geometric/range queries
CREATE INDEX idx_events_payload ON events USING GIN (payload);                -- JSONB containment queries
~~~

B-tree (the default) is right for equality and range queries on scalar columns; GIN (Generalized Inverted Index) suits full-text search, JSONB containment, and array membership; GiST (Generalized Search Tree) suits geometric data and range types; choosing the wrong index type either provides no benefit or, in some cases, isn't even usable by the query planner for a given operator.

### Table partitioning

~~~sql
CREATE TABLE events (
    id BIGSERIAL,
    created_at TIMESTAMPTZ NOT NULL,
    payload JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
~~~

Declarative partitioning splits one logical table into physically separate partitions (commonly by date range), letting queries that filter on the partition key scan only the relevant partition(s) ("partition pruning") instead of the entire table — essential for very large, time-series-like tables where old partitions can also be dropped or archived cheaply as a whole.

### Replication: streaming and logical

~~~mermaid
flowchart LR
    Primary["Primary\n(accepts writes)"] -->|WAL streaming| Replica1["Streaming replica\n(read-only, exact copy)"]
    Primary -->|logical replication| Replica2["Logical subscriber\n(can filter/transform,\ndifferent schema possible)"]
~~~

Streaming replication ships the write-ahead log (WAL) to replicas, producing exact, byte-for-byte copies useful for read scaling and failover; logical replication replicates at the level of individual row changes, allowing selective table replication, different schemas between primary and replica, and even replication to a DIFFERENT major PostgreSQL version — a more flexible but more operationally complex mechanism.

### pgvector for embeddings

~~~sql
CREATE EXTENSION vector;

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536)
);

CREATE INDEX idx_documents_embedding ON documents USING hnsw (embedding vector_cosine_ops);

SELECT content, embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM documents
ORDER BY distance
LIMIT 5;
~~~

pgvector adds a native vector column type and approximate-nearest-neighbor index types (IVFFlat, HNSW), letting PostgreSQL perform similarity search directly alongside relational queries and joins — for many RAG (retrieval-augmented generation) applications, this avoids introducing a separate dedicated vector database entirely; see the **Vector Search** and **RAG** skills for the broader context this fits into.

### Advisory locks and row-level locking

~~~sql
SELECT pg_advisory_lock(12345);   -- application-level lock, not tied to any specific row
-- ... critical section ...
SELECT pg_advisory_unlock(12345);

SELECT * FROM accounts WHERE id = 1 FOR UPDATE;   -- row-level lock within a transaction
~~~

FOR UPDATE locks the selected rows for the duration of the transaction, preventing a concurrent transaction from modifying (or also locking) them until this one commits or rolls back — the standard mechanism for preventing lost updates under concurrent writes, directly analogous to Django's select_for_update() and Spring Data JPA's pessimistic locking, both built on this exact PostgreSQL feature.
`,

  "internal-working": `
What happens inside PostgreSQL from a client sending a query to a committed result:

~~~mermaid
flowchart LR
    A["Client sends SQL query"] --> B["Parser\n(syntax check, builds a parse tree)"]
    B --> C["Planner/Optimizer\n(chooses an execution plan\nusing table statistics)"]
    C --> D["Executor\n(runs the chosen plan)"]
    D --> E["Buffer manager\n(reads/writes pages,\ncached in shared_buffers)"]
    E --> F["WAL (Write-Ahead Log)\nrecords the change durably BEFORE\nthe data page itself is flushed"]
    F --> G["Result returned to client"]
~~~

1. **Parsing**: the raw SQL text is parsed into a parse tree, checked for syntactic validity.
2. **Planning/optimization**: the query planner considers multiple possible execution strategies (which index to use, which join order, sequential scan vs. index scan) using table statistics (row counts, value distributions, gathered by ANALYZE) to estimate the cheapest plan.
3. **Execution**: the chosen plan runs, pulling data through the buffer manager, which caches frequently-accessed pages in shared_buffers (PostgreSQL's own memory cache) to avoid disk I/O where possible.
4. **Write-Ahead Logging**: before ANY data change is considered durable, PostgreSQL writes a record of that change to the WAL — this is the foundational durability mechanism: if the server crashes immediately after commit, the WAL can replay the change on restart even if the actual data page hadn't been flushed to disk yet.
5. **MVCC row versioning**: as covered in Advanced Concepts, updates and deletes create/mark row versions rather than modifying in place, letting concurrent transactions see a consistent snapshot without blocking each other for ordinary reads.

**Why VACUUM matters**: because dead row versions (from updates and deletes) aren't immediately removed, a table under heavy write/update load accumulates "bloat" over time; VACUUM (run automatically by autovacuum, or manually) reclaims that space and updates statistics the planner relies on — a table with disabled or misconfigured autovacuum is a very common, very damaging real-world PostgreSQL production issue, often the actual root cause behind "queries have gotten mysteriously slower over the past few months."
`,

  architecture: `
A senior engineer thinks about PostgreSQL at two levels: **the server's internal process/memory architecture** and **how applications should be structured around it** (connection pooling, schema organization, replication topology).

### Server process architecture

~~~mermaid
flowchart TB
    subgraph Server["PostgreSQL server process"]
        Postmaster["Postmaster\n(supervisor process)"]
        Backend1["Backend process\n(one per client connection)"]
        BackendN["Backend process N"]
        SharedBuffers["shared_buffers\n(page cache, shared memory)"]
        WAL["WAL writer"]
        Autovacuum["Autovacuum worker(s)"]
    end
    Postmaster --> Backend1
    Postmaster --> BackendN
    Backend1 --> SharedBuffers
    BackendN --> SharedBuffers
    SharedBuffers --> Disk[("Disk\ndata files + WAL")]
    WAL --> Disk
    Autovacuum --> Disk
~~~

PostgreSQL uses a process-per-connection model (not a thread-per-connection model) — each client connection gets its own OS process, which is why connection pooling (PgBouncer, or connection pooling built into your ORM/driver) matters enormously at scale: creating a new PostgreSQL backend process has real, measurable overhead, and too many concurrent connections directly costs memory and CPU scheduling overhead regardless of how much actual work each connection is doing.

### Application-side architecture around PostgreSQL

~~~
Application servers (many, stateless)
        │
        ▼
  PgBouncer (connection pooler)
        │
        ▼
PostgreSQL primary (writes) ──streaming replication──▶ Read replicas (reads)
~~~

Rules mature teams follow: always pool connections (PgBouncer or your ORM's built-in pool) rather than letting every application instance open many direct connections; route read-heavy queries to replicas where staleness is acceptable; keep schema migrations versioned and reviewed (Flyway, Alembic, Django's migrations) rather than applying ad-hoc schema changes directly in production.
`,

  "data-flow": `
Tracing one query end to end — a SELECT with a WHERE clause matching an indexed column:

~~~mermaid
sequenceDiagram
    participant App
    participant PgBouncer
    participant Backend as PostgreSQL backend process
    participant Planner
    participant Buffer as shared_buffers
    participant Disk

    App->>PgBouncer: SELECT * FROM posts WHERE author_id = 42
    PgBouncer->>Backend: forwards over a pooled connection
    Backend->>Planner: parse and plan the query
    Planner->>Planner: choose Index Scan using idx_posts_author_id\n(based on table statistics)
    Planner->>Buffer: request the relevant index and data pages
    Buffer->>Buffer: check shared_buffers cache first
    Buffer->>Disk: cache miss — read the page from disk
    Disk-->>Buffer: page loaded into shared_buffers
    Buffer-->>Backend: matching rows
    Backend-->>PgBouncer: result set
    PgBouncer-->>App: result set
~~~

The most misunderstood part for newcomers: **an UPDATE or DELETE does not modify or remove data in place** — it writes a new row version (for UPDATE) or marks the row dead (for DELETE), both requiring later VACUUM to reclaim the space; a table with millions of updates and inadequate autovacuum tuning can bloat to many times its logically necessary size, degrading both query performance and disk usage in a way that isn't obvious from row counts alone.
`,

  "production-usage": `
### Connection pooling with PgBouncer

~~~
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
~~~

Because PostgreSQL uses a process-per-connection model, PgBouncer (or an equivalent pooler) sits between the application and PostgreSQL, multiplexing many application-level connections onto a much smaller number of actual PostgreSQL backend processes — transaction-mode pooling (returning a connection to the pool after each transaction, not each client disconnect) is the most common, efficient configuration for typical web application workloads.

### Configuration essentials

~~~
shared_buffers = 4GB              # typically 25% of available RAM
effective_cache_size = 12GB        # hint to the planner about OS-level disk cache availability
work_mem = 64MB                     # per-operation memory for sorts/hashes
maintenance_work_mem = 512MB         # memory for VACUUM, index creation
max_connections = 200                # kept modest; use PgBouncer for the real client count
~~~

Non-negotiables for production:

1. **shared_buffers and effective_cache_size tuned to actual available RAM** — PostgreSQL's defaults are conservative, intended for a shared/small machine, not a dedicated production database server.
2. **autovacuum tuned appropriately, never disabled** — disabling it "to reduce overhead" is one of the most damaging production misconfigurations, leading to severe table/index bloat over time.
3. **WAL archiving and point-in-time recovery configured** — backups alone aren't sufficient for many production requirements; the ability to replay WAL to a specific point in time matters for genuine disaster recovery.

### Common production stacks

- **Web applications**: PostgreSQL + PgBouncer + an ORM (Django's ORM, SQLAlchemy, TypeORM, Spring Data JPA) — the dominant overall pattern across nearly every backend framework covered on this platform.
- **AI/RAG applications**: PostgreSQL + pgvector for embeddings alongside relational application data, avoiding a separate vector database for many workloads.
- **High availability**: a primary with streaming replicas, often managed via Patroni or a cloud provider's managed PostgreSQL offering (Amazon RDS, Google Cloud SQL, Azure Database for PostgreSQL) handling failover automatically.
`,

  "industry-examples": `
- **Instagram**: one of the most cited large-scale PostgreSQL deployments, having published extensively on sharding PostgreSQL across many servers to handle its massive user base, alongside heavy caching layers.
- **Apple**: uses PostgreSQL extensively across internal systems, and multiple Apple engineers have contributed directly to the PostgreSQL project itself.
- **Reddit**: PostgreSQL was central to Reddit's original architecture and remains a significant part of its infrastructure, with published engineering posts on scaling it over the years.
- **Skype (historically)**: used PostgreSQL heavily and open-sourced pgbouncer, the now-ubiquitous connection pooler referenced throughout this page's Production Usage section.
- **Robinhood**: has discussed using PostgreSQL as a core part of its trading platform's data layer, valuing its strong consistency guarantees for financial data.
- **Many AI/ML companies adopting pgvector**: a rapidly growing pattern since 2023, letting teams add vector similarity search directly to an existing PostgreSQL deployment rather than introducing and operating a separate specialized vector database for RAG applications.
- **The PostgreSQL project's own case-study page** documents dozens of additional large-scale, publicly-discussed deployments across finance, government, and technology sectors.

Pattern to notice: PostgreSQL adoption clusters around **applications where data correctness and consistency genuinely matter** (financial transactions, user account data) and, increasingly, **AI applications wanting to avoid operating a separate vector database** via pgvector — precisely the profile of most production AI-application system-of-record needs.
`,

  "best-practices": `
1. **Always index foreign key columns** — PostgreSQL does NOT automatically create an index on a foreign key column (unlike the primary key it references), and un-indexed foreign keys are a frequent source of slow joins and slow cascading deletes.
2. **Use EXPLAIN ANALYZE before assuming a query is slow "because the database is slow"** — nearly every real production slow-query investigation starts here, not with guessing.
3. **Never disable or ignore autovacuum** — tune its parameters for your specific write/update workload rather than turning it off; table bloat is a genuinely severe, hard-to-diagnose-after-the-fact production issue.
4. **Use connection pooling (PgBouncer) in any application with more than a handful of connections** — PostgreSQL's process-per-connection model makes this a real, not optional, production consideration.
5. **Prefer database-level constraints (CHECK, NOT NULL, foreign keys) over application-only validation** — the database is the last line of defense against invalid data, and application bugs will eventually try to write invalid data.
6. **Choose the appropriate isolation level deliberately** — Read Committed (the default) suffices for most application code; reach for Repeatable Read or Serializable specifically when you've identified a genuine race condition it prevents.
7. **Use JSONB for genuinely semi-structured, schema-flexible data**, not as a way to avoid designing a proper relational schema for data that's actually well-structured and relational.
8. **Run ANALYZE after bulk data loads** — the query planner's decisions depend on up-to-date table statistics, which bulk operations can leave stale.
9. **Partition very large, time-series-like tables** by date range, enabling partition pruning and cheap archival/deletion of old partitions.
10. **Back up with both logical dumps (pg_dump) and WAL archiving for point-in-time recovery** — a logical dump alone doesn't let you recover to an arbitrary point in time between backups.
11. **Version and review schema migrations** through your framework's migration tool (Flyway, Alembic, Django migrations) rather than applying ad-hoc DDL changes directly against production.
12. **Monitor for lock contention and long-running transactions** — a single long-running transaction can block autovacuum from cleaning up dead row versions across the ENTIRE database, not just the tables it touches.
`,

  "anti-patterns": `
### Missing index on a foreign key

~~~sql
-- WRONG — no index on author_id, so this join (and any cascading delete)
-- requires a full sequential scan of posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id)
);

-- RIGHT — always index foreign key columns explicitly
CREATE INDEX idx_posts_author_id ON posts(author_id);
~~~

PostgreSQL does NOT automatically index foreign key columns (only the primary key they reference gets an implicit index) — this is one of the most common, most consequential PostgreSQL schema mistakes, invisible with small test data and severe at real production scale.

### Using JSONB to avoid schema design entirely

~~~sql
-- WRONG — a "just put everything in JSONB" schema loses the benefits
-- of constraints, foreign keys, and efficient typed indexing
CREATE TABLE orders (id SERIAL PRIMARY KEY, data JSONB);

-- RIGHT — model genuinely relational data relationally;
-- reserve JSONB for truly semi-structured, variable-shape data
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total NUMERIC(10, 2) NOT NULL,
    metadata JSONB   -- genuinely variable, non-relational extra data
);
~~~

### Other production-grade anti-patterns

- **Disabling autovacuum "for performance"**: causes severe, compounding table/index bloat that eventually degrades performance far more than autovacuum's overhead ever would have.
- **Not using connection pooling**, letting each application instance/replica open many direct PostgreSQL connections, exhausting max_connections and wasting memory on idle backend processes.
- **Long-running transactions left open** (including an application holding a transaction open while waiting on an external API call) — blocks VACUUM from cleaning up dead rows across the database and can hold locks far longer than intended.
- **SELECT * in application code** rather than naming needed columns explicitly — fetches unnecessary data and makes schema changes (adding a column) silently break assumptions elsewhere in the code.
- **Using serial/integer primary keys for a globally-distributed system** without considering that auto-incrementing IDs don't merge cleanly across independently-writing nodes — UUID or a distributed ID scheme is often more appropriate for such architectures.
- **Ignoring EXPLAIN ANALYZE's actual row-count estimates versus reality** — a large gap between the planner's row estimate and the actual row count is a strong signal that table statistics are stale (run ANALYZE) or a query needs restructuring.
`,

  performance: `
### Rule zero: measure first

~~~sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM posts WHERE author_id = 42;
~~~

EXPLAIN ANALYZE with BUFFERS shows both the actual execution time and the exact number of buffer cache hits/misses — never guess at a PostgreSQL performance problem; this single command answers most "why is this slow" questions directly.

### The performance hierarchy (apply in order)

1. **Add the right index** — a missing index on a frequently-filtered or joined column is, by a wide margin, the most common and cheapest fix for a slow query; verify with EXPLAIN ANALYZE that PostgreSQL actually uses the new index (an index isn't automatically used just because it exists).
2. **Fix N+1 query patterns at the application layer** — the same universal ORM discipline covered across every framework skill on this platform (Django's select_related, Spring Data JPA's JOIN FETCH); no amount of database tuning fixes an application making N extra round-trip queries per request.
3. **Run ANALYZE regularly** (autovacuum does this automatically, but bulk loads may need a manual trigger) — the query planner's every decision depends on accurate table statistics.
4. **Tune shared_buffers, work_mem, and effective_cache_size** to your actual hardware and workload — the defaults are conservative and rarely appropriate for a dedicated production server.
5. **Consider partitioning very large tables** by a natural key (commonly date) once a table grows large enough that even well-indexed queries touch too many rows.
6. **Scale reads horizontally with streaming replicas** once a single primary's read capacity is genuinely the bottleneck, routing read-heavy, staleness-tolerant queries to replicas.

### Micro-level facts worth knowing

- COUNT(*) on a large table requires a full scan in PostgreSQL (MVCC means there's no cheap cached row count the way some other databases maintain) — for an approximate count on a huge table, consider reltuples from pg_class or a maintained counter instead.
- A partial index (CREATE INDEX ... WHERE condition) can be dramatically smaller and faster than a full index when queries consistently filter on a specific, common condition (e.g., WHERE status = 'active').
- Bulk inserts are far faster via COPY than many individual INSERT statements — each INSERT pays transaction/WAL overhead individually unless batched.
`,

  scalability: `
PostgreSQL's scaling story is primarily **vertical first, then horizontal with real effort** — a different profile than natively-distributed databases, and an important architectural fact to plan around.

### Read scaling via replication

~~~mermaid
flowchart LR
    App["Application"] --> LB["Read/write router\n(app logic or a proxy)"]
    LB -->|writes| Primary[("Primary")]
    LB -->|reads| R1[("Read replica 1")]
    LB -->|reads| R2[("Read replica N")]
    Primary -->|streaming replication| R1
    Primary -->|streaming replication| R2
~~~

Streaming replicas handle read-heavy traffic that can tolerate some replication lag (typically milliseconds to low seconds); the application (or a proxy) must explicitly route reads to replicas and writes to the primary — PostgreSQL doesn't do this automatically.

### Write scaling: sharding and extensions

For write-heavy workloads exceeding a single primary's capacity, options include Citus (a PostgreSQL extension adding transparent sharding across multiple nodes, now owned by Microsoft) or application-level sharding (partitioning data across entirely separate PostgreSQL instances by a shard key, managed in application code) — both require genuine architectural commitment, unlike a natively-distributed database designed for this from inception.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Missing indexes on hot query paths | Add appropriate indexes; verify usage with EXPLAIN ANALYZE |
| Single primary's write throughput ceiling | Vertical scaling first (more CPU/RAM/faster disks), then Citus/application-level sharding if genuinely necessary |
| Read-heavy workload exceeding one server's capacity | Streaming read replicas, with application-level read/write routing |
| Table bloat from heavy update/delete workloads | Properly tuned autovacuum; consider partitioning to make old partition drops cheap instead of DELETE-and-VACUUM |
| Connection overhead from many application instances | PgBouncer or an equivalent connection pooler, non-negotiable at scale given the process-per-connection model |
`,

  security: `
### PostgreSQL's built-in security features

1. **Role-based access control**: PostgreSQL's permission system (roles, GRANT/REVOKE) controls exactly which users can read, write, or administer specific tables, schemas, or the whole database — apply the principle of least privilege, giving application roles only the specific permissions they need.
2. **Row-level security (RLS)**: policies restricting which ROWS a given role can see or modify, enforced by the database itself regardless of what SQL the application sends — genuinely powerful for multi-tenant applications needing tenant isolation enforced at the database layer, not just application logic.

~~~sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant')::INTEGER);
~~~

3. **SSL/TLS for connections**: encrypting data in transit between the application and the database — should be mandatory for any production deployment, especially over a network you don't fully control.
4. **Parameterized queries prevent SQL injection**: PostgreSQL drivers/ORMs, used correctly with parameterized queries (never string-concatenated SQL), make injection structurally difficult — see the **SQL Injection** skill for the general attack class this defends against.

### What remains the application's responsibility

- **SQL injection via raw, string-concatenated queries**: PostgreSQL itself doesn't prevent this if the application builds SQL by concatenating untrusted input directly — always use parameterized queries or your ORM's safe query-building methods.
- **Secrets management**: database credentials should come from environment variables or a secrets manager, never hardcoded, and rotated periodically (see the **Secrets Management** skill).
- **Encryption at rest**: PostgreSQL itself doesn't encrypt data files by default — full-disk encryption at the OS/infrastructure level, or PostgreSQL's pgcrypto extension for column-level encryption, are the common approaches.
- **Auditing**: the pgaudit extension provides detailed, configurable audit logging for compliance-sensitive environments, beyond PostgreSQL's default logging.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing database-dependent application code involves several distinct strategies, each trading realism against speed.

~~~python
# Using a real, isolated test database (via a fixture in pytest, for example)
import pytest
import psycopg2

@pytest.fixture
def db_connection():
    conn = psycopg2.connect("dbname=test_db")
    yield conn
    conn.rollback()   # roll back any changes made during the test
    conn.close()

def test_insert_user(db_connection):
    cursor = db_connection.cursor()
    cursor.execute("INSERT INTO users (email) VALUES (%s) RETURNING id", ("test@example.com",))
    user_id = cursor.fetchone()[0]
    assert user_id is not None
~~~

### Testcontainers for genuine, isolated integration tests

~~~python
from testcontainers.postgres import PostgresContainer

def test_with_real_postgres():
    with PostgresContainer("postgres:16") as postgres:
        connection_url = postgres.get_connection_url()
        # run migrations and tests against a genuinely real, ephemeral PostgreSQL instance
~~~

Testcontainers spins up a real, disposable PostgreSQL instance in Docker for each test run — catching genuine database-specific behavior (constraint violations, specific SQL dialect quirks) that an in-memory or mocked database approximation would miss entirely.

### The senior testing doctrine

- Wrap each test in a transaction that's rolled back afterward (as shown above) for fast, isolated tests without manual cleanup.
- Use Testcontainers (or an equivalent real-database-in-CI approach) for genuine integration coverage, rather than assuming SQLite or an in-memory substitute behaves identically to production PostgreSQL — they frequently don't, for anything beyond the simplest queries.
- Test migrations themselves (applying them to a copy of production-like data) as part of CI, not just the application code that assumes the resulting schema.
- Never run tests against a shared, persistent database that other tests or developers might be using simultaneously — each test run should be isolated.
`,

  debugging: `
### The toolbox, in escalation order

1. **EXPLAIN ANALYZE** — the first, most important tool for any "why is this query slow" investigation; read the actual vs. estimated row counts and look for sequential scans on large tables.
2. **pg_stat_activity** — shows every currently active connection/query, essential for finding long-running or blocked queries:

~~~sql
SELECT pid, state, query, now() - query_start AS duration
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
~~~

3. **pg_stat_statements extension** — tracks aggregate statistics (total time, call count) per distinct query shape across the whole server, essential for finding which queries actually dominate total database load, not just the slowest single query you happened to notice.
4. **pg_locks** — shows exactly what's locked and by which transaction, essential for diagnosing lock contention:

~~~sql
SELECT * FROM pg_locks WHERE NOT granted;
~~~

5. **Logging slow queries**: log_min_duration_statement (set to, say, 200ms) logs any query exceeding that duration, giving visibility into slow queries you didn't know to look for.
6. **pg_stat_user_tables** — shows per-table statistics including dead tuple counts, essential for diagnosing bloat and confirming autovacuum is keeping up.

### Debugging common PostgreSQL-specific symptoms

- "Queries have gotten mysteriously slower over months with no code changes" — almost always table/index bloat from inadequate autovacuum tuning; check pg_stat_user_tables for high dead-tuple counts.
- "A query using an index in development is doing a sequential scan in production" — often stale statistics (run ANALYZE) or a genuinely different, larger data distribution where the planner correctly determines a sequential scan is actually cheaper.
- "Deadlock detected" errors — two transactions acquired locks in different orders; ensure application code always acquires locks (including implicit ones via UPDATE/SELECT FOR UPDATE) in a consistent order across the codebase.
`,

  monitoring: `
Production PostgreSQL visibility rests on the same three pillars as any production system, with several PostgreSQL-specific signals worth first-class monitoring.

### Key metrics to track

- **Connection count relative to max_connections**: approaching the limit predicts connection-refused errors; a strong argument for PgBouncer.
- **Replication lag** (for streaming replicas): a growing lag risks serving stale reads beyond acceptable staleness tolerance.
- **Cache hit ratio** (shared_buffers hits vs. disk reads): a low ratio suggests shared_buffers is undersized relative to the working data set.
- **Dead tuple counts and autovacuum activity**: catching bloat trending upward before it becomes a severe performance problem.
- **Lock wait counts and long-running transactions**: an early warning for contention issues before they cascade into broader slowdowns.

### Tools

~~~sql
-- pg_stat_statements: which queries dominate total database load
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
~~~

pg_stat_statements (an extension, commonly enabled by default on managed PostgreSQL offerings) is the single most valuable built-in tool for understanding aggregate query load; pgAdmin, Datadog's PostgreSQL integration, and Prometheus's postgres_exporter are common choices for dashboarding these metrics over time — see the **Prometheus** and **Grafana** skills.

### Alerting priorities

Alert on: replication lag exceeding an acceptable threshold, connection count approaching max_connections, disk space approaching capacity (WAL and table bloat both consume disk continuously), and any table's dead-tuple ratio climbing without autovacuum keeping pace.
`,

  deployment: `
### Managed vs. self-hosted

~~~
Managed (Amazon RDS, Google Cloud SQL, Azure Database for PostgreSQL):
  + automated backups, patching, failover, and monitoring largely handled for you
  - less control over exact configuration and extension availability

Self-hosted (on VMs or Kubernetes, e.g. via the Zalando/CrunchyData PostgreSQL operators):
  + full control over configuration, extensions (including less common ones), and tuning
  - operational responsibility for backups, failover, patching, and monitoring
~~~

Most teams, especially smaller ones, benefit from a managed offering's operational simplicity; larger teams with specific extension needs (a less common extension not offered by their cloud provider) or strict data-residency/control requirements more often self-host.

### Backup strategy

~~~bash
pg_dump mydb > backup.sql                    # logical backup — portable, but slower for large databases
pg_basebackup -D /backup/base -Fp -Xs -P       # physical base backup, paired with WAL archiving
~~~

A robust production backup strategy typically combines periodic full backups (logical or physical) with continuous WAL archiving, enabling point-in-time recovery to any moment between full backups — a logical dump alone only lets you restore to the exact moment it was taken.

### High availability

Patroni (a widely used, open-source PostgreSQL high-availability tool) manages automatic failover among a primary and its replicas, using a distributed consensus store (etcd, Consul, or ZooKeeper) to coordinate leader election — the standard self-hosted HA pattern; managed offerings typically provide equivalent automatic failover as a built-in feature.

### CI/CD pipeline

Schema migrations (via your framework's migration tool) run as an explicit, coordinated deploy step, separate from application code deployment — see the **CI/CD** and **Docker** skills, and the framework-specific migration guidance in the **Django**, **Spring Boot**, and other backend framework skills.
`,

  "production-checklist": `
Before a PostgreSQL-backed application takes real traffic:

- [ ] Connection pooling (PgBouncer or equivalent) configured, not relying on direct application-to-database connections at scale
- [ ] shared_buffers, effective_cache_size, and work_mem tuned to actual available hardware
- [ ] autovacuum confirmed enabled and tuned appropriately for the write/update workload — never disabled
- [ ] All foreign key columns explicitly indexed
- [ ] SSL/TLS enabled for all connections
- [ ] Database credentials loaded from environment variables/a secrets manager, never hardcoded
- [ ] Automated backups configured (logical and/or physical), with WAL archiving for point-in-time recovery
- [ ] Backup restoration actually tested, not just assumed to work
- [ ] Replication (streaming and/or logical) configured if read scaling or high availability is required
- [ ] pg_stat_statements enabled for query-load visibility
- [ ] Slow query logging configured (log_min_duration_statement)
- [ ] Row-level security configured if multi-tenant data isolation is required at the database layer
- [ ] Monitoring/alerting wired up for connection count, replication lag, and disk space
- [ ] Schema migrations versioned and applied as an explicit, reviewed deploy step
- [ ] Load test done: known transactions/sec ceiling and query latency under realistic concurrent load
- [ ] Runbook: how to fail over, restore from backup, and roll back a bad migration
`,

  "common-mistakes": `
1. **Not indexing foreign key columns**, causing slow joins and slow cascading operations that are invisible with small test datasets.
2. **Disabling or ignoring autovacuum**, leading to severe table/index bloat that degrades performance in a way that's hard to trace back to its actual root cause months later.
3. **Not using connection pooling**, exhausting max_connections or wasting significant memory on many idle backend processes given PostgreSQL's process-per-connection model.
4. **Assuming an index automatically helps**, without verifying with EXPLAIN ANALYZE that the planner actually chooses to use it for the specific query.
5. **Using JSONB to avoid schema design** for data that's actually well-structured and relational, losing constraints, foreign keys, and efficient typed indexing in the process.
6. **Comparing against NULL with = instead of IS NULL**, silently matching zero rows due to NULL's three-valued logic.
7. **Running COUNT(*) on a huge table expecting it to be instant**, not accounting for MVCC's lack of a cheap cached row count.
8. **Leaving long-running transactions open** (including holding one open while awaiting an external API call), blocking autovacuum and holding locks longer than intended.
9. **Not testing backup restoration**, discovering a backup strategy gap only during an actual incident.
10. **Applying ad-hoc schema changes directly against production** instead of through a versioned, reviewed migration tool.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| duplicate key value violates unique constraint | Attempting to insert a value that already exists in a UNIQUE/PRIMARY KEY column | Handle the conflict explicitly (ON CONFLICT DO NOTHING/UPDATE) or check existence first |
| deadlock detected | Two transactions acquired locks on the same rows in different orders | Ensure consistent lock acquisition order across the application's transactions |
| too many connections | max_connections exceeded, often from missing connection pooling | Configure PgBouncer; reduce per-instance connection pool sizes |
| relation does not exist | A migration wasn't applied in this environment, or a typo in the table/schema name | Verify migrations have run; check the search_path if using multiple schemas |
| could not serialize access due to concurrent update | A SERIALIZABLE isolation transaction detected a genuine conflict | Retry the transaction; this is the isolation level working as intended, not a bug |
| out of shared memory | Too many locks held simultaneously, often from a very large transaction | Increase max_locks_per_transaction, or break the operation into smaller transactions |
| canceling statement due to statement timeout | A query exceeded the configured statement_timeout | Optimize the query (check EXPLAIN ANALYZE), or increase the timeout if the long runtime is genuinely expected |
`,

  faqs: `
**PostgreSQL or MySQL?**
Both are mature, production-proven relational databases. PostgreSQL generally offers a richer type system, stronger standards compliance, and more sophisticated extensibility (JSONB, pgvector, PostGIS); MySQL has historically had a slight edge in simple read-heavy workload raw throughput and an enormous existing deployment base (especially in web hosting/WordPress-adjacent contexts). See the **MySQL** skill for the direct comparison.

**Should I use PostgreSQL or a dedicated vector database for embeddings?**
For many RAG applications, PostgreSQL with pgvector is genuinely sufficient and avoids operating a second specialized system — reach for a dedicated vector database (Pinecone, Qdrant, Milvus) specifically when you need vector-search-specific features (very large scale approximate search with specialized index tuning) beyond what pgvector currently offers well, or when vector search is your application's dominant workload rather than a feature alongside relational data.

**How do I choose between JSON and JSONB?**
Use JSONB almost always — it stores data in a decomposed binary format enabling indexing and efficient querying; plain JSON preserves exact text formatting (including whitespace and key order) but offers none of JSONB's query/index performance benefits, useful only in the rare case you need to preserve the exact original text.

**Is PostgreSQL good for horizontal scaling?**
It scales vertically very well and horizontally with real, deliberate effort (streaming read replicas, Citus for sharding, or application-level sharding) — it is not natively, effortlessly horizontally distributed the way some NoSQL systems are designed to be from inception; plan your scaling strategy deliberately rather than assuming it "just scales."

**What's the difference between a database and a schema in PostgreSQL?**
A PostgreSQL server hosts multiple databases (each fully isolated from the others); within one database, schemas are namespaces for organizing tables (public is the default) — commonly used for multi-tenant applications or organizing a large application's tables into logical groups without needing entirely separate databases.

**Why does my index exist but PostgreSQL still does a sequential scan?**
The query planner chooses whichever plan it estimates is cheapest — for a query matching a large fraction of the table, a sequential scan can genuinely be faster than using an index (avoiding the overhead of many individual index lookups); verify with EXPLAIN ANALYZE whether the planner's estimate is reasonable given your actual data distribution, and run ANALYZE if statistics seem stale.
`,

  "interview-questions": `
### Junior level

1. **What are the ACID properties?**
   Model answer: Atomicity (a transaction fully succeeds or fully fails, never partially), Consistency (a transaction takes the database from one valid state to another, respecting all constraints), Isolation (concurrent transactions don't interfere with each other's intermediate states), Durability (once committed, a transaction's changes survive a crash).

2. **What is the difference between WHERE and HAVING?**
   Model answer: WHERE filters individual rows before aggregation (GROUP BY); HAVING filters GROUPS after aggregation, and can reference aggregate functions like COUNT() or SUM() that WHERE cannot.

3. **Why should you index a foreign key column?**
   Model answer: PostgreSQL does not automatically create an index on a foreign key column (only on the primary key it references); without one, joins and cascading deletes/updates involving that column require a full table scan.

4. **What does EXPLAIN ANALYZE do?**
   Model answer: EXPLAIN shows PostgreSQL's planned execution strategy for a query; ANALYZE additionally actually runs the query, showing real execution time and row counts alongside the plan — essential for diagnosing why a query is slow.

5. **What is the difference between JSON and JSONB?**
   Model answer: JSON stores the exact text as provided, preserving formatting and key order; JSONB stores a decomposed binary representation, enabling efficient indexing and querying at the cost of not preserving the original text exactly — JSONB is preferred for nearly all practical use cases.

### Senior level

6. **Explain MVCC and why readers don't block writers in PostgreSQL.**
   Model answer: Multi-Version Concurrency Control means an UPDATE creates a new row version rather than modifying in place, and each transaction sees a consistent snapshot of the data as of its start (or each statement, depending on isolation level) — readers simply see the appropriate existing version, never needing to wait for a writer's in-progress change to complete.

7. **What is VACUUM for, and what happens if autovacuum is disabled?**
   Model answer: VACUUM reclaims space from dead row versions (created by UPDATE/DELETE under MVCC) and updates the planner's statistics; disabling autovacuum causes progressive table and index bloat, degrading query performance and wasting disk space in a way that compounds over time and can be difficult to fully reverse without a full table rewrite.

8. **What's the difference between B-tree, GIN, and GiST indexes, and when would you use each?**
   Model answer: B-tree (the default) suits equality and range queries on scalar columns; GIN (Generalized Inverted Index) suits full-text search, JSONB containment queries, and array membership; GiST (Generalized Search Tree) suits geometric data and range types — choosing the wrong type either provides no benefit or isn't usable by the planner for certain operators at all.

9. **How does PostgreSQL's process-per-connection model affect production architecture?**
   Model answer: Each client connection consumes a full OS process (not a lightweight thread), meaning connection pooling (PgBouncer) is essential at any real scale — without it, too many concurrent application-level connections directly waste memory and CPU scheduling overhead on the database server, independent of how much actual query work is being done.

10. **What's the difference between streaming replication and logical replication?**
    Model answer: Streaming replication ships the write-ahead log (WAL) to produce exact, byte-for-byte replica copies, used for read scaling and failover; logical replication replicates individual row-level changes, allowing selective table replication, different schemas between primary and subscriber, and cross-major-version replication, at the cost of more operational complexity.

11. **How would you diagnose and fix a query that used an index in development but does a sequential scan in production?**
    Model answer: Run EXPLAIN ANALYZE in production to see the actual plan and estimated-vs-actual row counts; check whether table statistics are stale (run ANALYZE) or whether the production data distribution genuinely makes a sequential scan cheaper (e.g., the WHERE clause matches a large fraction of rows) — the planner's estimate, not intuition, should drive the diagnosis.

12. **How would you add vector similarity search to an existing PostgreSQL-backed application for a RAG feature?**
    Model answer: Install the pgvector extension, add a VECTOR column to store embeddings, create an appropriate approximate-nearest-neighbor index (HNSW or IVFFlat), and query using the distance operators (<=> for cosine distance, for example) — letting embeddings live alongside relational application data without introducing a separate specialized vector database, appropriate for many but not all RAG workload scales.
`,

  "coding-questions": `
### 1. Find the second-highest salary per department using window functions

~~~sql
WITH ranked AS (
    SELECT
        department_id,
        employee_name,
        salary,
        DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
    FROM employees
)
SELECT department_id, employee_name, salary
FROM ranked
WHERE rnk = 2;
-- DENSE_RANK (not RANK) correctly handles ties without skipping a rank number.
-- Follow-up: how would this differ if you needed the Nth highest salary, parameterized?
~~~

### 2. Detect and fix an N+1-shaped query pattern using a single JOIN

~~~sql
-- The N+1 pattern (application code looping and querying per row) rewritten as one query:
SELECT
    posts.id,
    posts.title,
    users.email AS author_email,
    COUNT(comments.id) AS comment_count
FROM posts
JOIN users ON users.id = posts.author_id
LEFT JOIN comments ON comments.post_id = posts.id
GROUP BY posts.id, users.email;
-- Time: one query instead of 1 + N + N (one for posts, N for authors, N for comment counts)
-- Follow-up: at what point does adding more LEFT JOINs to aggregate multiple
-- one-to-many relationships in one query start producing incorrect counts
-- due to row multiplication (the "fan-out" problem), and how would you fix it?
~~~

### 3. Implement a safe, race-condition-free "claim the next job" pattern

~~~sql
BEGIN;
SELECT id FROM job_queue
WHERE status = 'pending'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;
-- application code claims this specific job id, then:
UPDATE job_queue SET status = 'processing' WHERE id = $1;
COMMIT;
-- FOR UPDATE SKIP LOCKED lets multiple concurrent workers each grab a DIFFERENT
-- job without blocking on rows another worker already has locked.
-- Follow-up: why is SKIP LOCKED specifically important here versus plain FOR UPDATE,
-- and what would happen under concurrent workers without it?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Design and query a normalized schema
Design a normalized schema for a small e-commerce catalog (products, categories, orders, order items), with appropriate foreign keys and constraints, and write queries covering joins, aggregation, and filtering. Deliverable: a working schema and a set of correct queries. Skills exercised: schema design, constraints, joins.

### Lab 2 (Intermediate): Diagnose and fix a deliberately slow query
Given a query missing an index (or with a stale-statistics-induced bad plan), use EXPLAIN ANALYZE to diagnose the problem, then fix it. Deliverable: a documented before/after comparison of query plans and timing. Skills exercised: EXPLAIN ANALYZE, indexing strategy.

### Lab 3 (Advanced): Add pgvector-based similarity search
Add a VECTOR column to a table of documents, generate embeddings for sample content, create an HNSW index, and write a similarity search query combined with a relational filter (e.g., "find similar documents within a specific category"). Deliverable: a working hybrid relational + vector search query. Skills exercised: pgvector, index selection, hybrid queries.

### Lab 4 (Production): Set up replication, pooling, and monitoring
Configure a primary with a streaming read replica, set up PgBouncer in front of both, and wire up pg_stat_statements-based monitoring. Deliverable: a production-checklist-compliant setup with a demonstrated read/write split and a load test. Skills exercised: replication, connection pooling, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A RAG knowledge base combining relational metadata and vector search
Engineering requirements: a PostgreSQL schema storing documents, their metadata (source, author, permissions), and pgvector-based embeddings, with hybrid queries combining vector similarity search and relational filtering (e.g., permission-scoped retrieval), row-level security enforcing access control at the database layer. Demonstrates PostgreSQL's distinctive strength for AI applications wanting one database for both relational and vector needs.

### 2. A multi-tenant SaaS platform with database-enforced tenant isolation
Engineering requirements: row-level security policies enforcing tenant data isolation regardless of application-layer bugs, a properly normalized schema with appropriate indexes, and Flyway/Alembic-managed migrations reviewed in CI. Demonstrates production-grade PostgreSQL patterns for a genuinely security-critical multi-tenancy domain.

### 3. A high-throughput job queue using PostgreSQL as the backing store
Engineering requirements: the FOR UPDATE SKIP LOCKED pattern (see Coding Questions) for safe concurrent job claiming, partitioning the job history table by date for cheap archival, and comprehensive monitoring of queue depth and processing latency. Demonstrates PostgreSQL's viability as a job queue backend for moderate-scale needs without introducing a separate message broker.
`,

  "case-studies": `
### Instagram's PostgreSQL sharding at scale
Instagram's widely cited engineering posts on scaling PostgreSQL — including custom sharding logic distributing data across many PostgreSQL instances by user ID — demonstrate that PostgreSQL's "vertical-first, horizontal-with-effort" scaling story can genuinely support massive scale when a team invests in the necessary architecture, though it requires deliberate engineering rather than coming for free. Lesson: choosing PostgreSQL doesn't preclude massive scale, but the horizontal-scaling work is a real, planned investment, not an automatic capability.

### Skype's pgbouncer origin story
Skype's engineering team originally developed and open-sourced PgBouncer specifically to solve PostgreSQL's process-per-connection overhead at their own operational scale — now a near-universal piece of PostgreSQL production infrastructure across the entire ecosystem. Lesson: a specific company's internal infrastructure solution to a genuine, widely-shared pain point can become foundational, ecosystem-wide tooling when open-sourced at the right moment, echoing a similar pattern seen with Netflix's Spring Cloud contributions.

### pgvector's rapid adoption for RAG applications
Since its 2021 release, and accelerating sharply since the 2023 LLM/RAG boom, pgvector has been adopted extremely rapidly by teams wanting to add vector similarity search to an EXISTING PostgreSQL deployment rather than operating a separate specialized vector database — a directly observable case study in how an established, trusted database's extensibility let it absorb a brand-new workload category (embeddings/RAG) years after the core engine's original design, validating PostgreSQL's founding object-relational, extensible-by-design philosophy from the 1980s POSTGRES project.

### The recurring "someone disabled autovacuum" incident
Across the PostgreSQL community, a genuinely common recurring incident pattern involves a team disabling or severely under-tuning autovacuum (often believing it's purely overhead with no benefit), only to discover months later that queries have degraded severely due to accumulated table/index bloat, sometimes requiring a full table rewrite (VACUUM FULL, which locks the table) to fully recover. Lesson: MVCC's core tradeoff — non-blocking reads/writes in exchange for necessary ongoing cleanup — is not optional maintenance overhead to skip, but a fundamental, load-bearing part of how the engine works correctly at all.
`,

  comparisons: `
| Aspect | PostgreSQL | MySQL | MongoDB | SQLite |
|--------|-----------|-------|---------|--------|
| Data model | Relational, extensible (JSONB, custom types) | Relational | Document (BSON) | Relational, embedded |
| ACID transactions | Full, configurable isolation levels | Full (InnoDB engine) | Full since 4.0 (multi-document) | Full |
| Extensibility | Very high (PostGIS, pgvector, hundreds more) | Lower | Limited | Very limited (embedded use case) |
| Horizontal scaling | Vertical-first, horizontal with effort (Citus, sharding) | Similar profile, well-established replication | Native sharding built in | Not applicable (single-file, embedded) |
| Vector search | pgvector extension | Limited native support | Atlas Vector Search (managed only) | Not applicable |
| Best fit | Correctness-critical apps, extensible/hybrid workloads, AI apps wanting relational + vector | Read-heavy web apps, existing MySQL/WordPress ecosystems | Flexible-schema, document-shaped data, rapid iteration | Embedded/local apps, mobile, testing |

**How seniors choose**: reach for PostgreSQL when data correctness, extensibility, or hybrid relational-plus-vector needs matter, or when the team wants one database to reasonably absorb multiple workload types; reach for MySQL when working within an existing MySQL-centric ecosystem or specific read-heavy web hosting context; reach for MongoDB when the data is genuinely document-shaped and schema flexibility is a first-order requirement, not just a convenience; reach for SQLite for embedded, local-first, or testing scenarios where a full client-server database is unnecessary overhead.
`,

  "related-technologies": `
- **SQL** (general, not a separate platform skill but referenced throughout) — the query language PostgreSQL implements closely to the ANSI SQL standard.
- **MySQL** — the other dominant open-source relational database, useful as a direct comparison; see the **MySQL** skill.
- **Redis** — the common complementary caching layer paired with PostgreSQL for hot, frequently-read data.
- **Vector Search** and **RAG** — the broader conceptual context pgvector's embeddings support fits into.
- **Django**, **FastAPI**, **Spring Boot**, **Express**/**NestJS** — the backend frameworks whose ORMs (Django ORM, SQLAlchemy, Spring Data JPA, TypeORM/Prisma) sit on top of PostgreSQL in most production applications.
- **Docker** and **Kubernetes** — how PostgreSQL is commonly containerized and orchestrated, or replaced by a managed cloud offering.
- **Distributed Systems** — the general theory underlying PostgreSQL's replication and (with Citus) sharding capabilities.

Learning path: basic SQL → this page → **Redis** for the complementary caching layer → your chosen backend framework's ORM patterns → **Docker**/**Kubernetes** for deployment → **Vector Search**/**RAG** for the pgvector-specific AI application context.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **PostgreSQL 16/17** are the current major releases, with continued performance improvements to parallel query execution, logical replication (including replication of DDL and sequences in recent versions), and general query planner refinements.
- **pgvector** has continued rapid feature development given its central role in the RAG/embeddings ecosystem, including improvements to HNSW index build performance and additional distance metrics — verify the current pgvector version's specific feature set before relying on a specific capability for a new project.
- PostgreSQL's yearly release cadence (each major version supported for roughly 5 years) continues; verify the current version's support end date before committing a long-lived production deployment to a specific major version.
- Given the pace of extension development specifically (pgvector, Citus, and others evolve on independent release schedules from PostgreSQL core), verify current compatibility between your target PostgreSQL version and any extensions your project depends on.
`,

  "future-roadmap": `
Where PostgreSQL is heading, and what's worth betting career time on:

- **Continued pgvector and AI-workload investment** — given the extension's explosive adoption growth, expect continued performance and feature investment specifically targeting RAG/embeddings use cases, potentially narrowing the gap with dedicated vector databases for more workload scales over time.
- **Continued native scaling improvements** — logical replication and parallel query execution continue maturing each release, gradually reducing (though not eliminating) the operational effort needed for PostgreSQL's horizontal scaling story.
- **Growing "PostgreSQL as the default" trend for new AI-application system-of-record needs** — its combination of correctness guarantees, extensibility, and now native vector search makes it an increasingly common default choice specifically for AI application backends wanting to minimize the number of separate database systems operated.
- **What to bet on**: deep fluency in indexing strategy, EXPLAIN ANALYZE-driven query optimization, and MVCC/transaction isolation reasoning — these fundamentals remain valuable regardless of which specific new PostgreSQL feature or extension lands next, and transfer conceptually to reasoning about nearly any relational database.
`,

  "cheat-sheet": `
~~~sql
-- ---- Schema basics ----
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_posts_author_id ON posts(author_id);   -- ALWAYS index foreign keys

-- ---- Transactions ----
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- ---- NULL handling ----
SELECT * FROM users WHERE middle_name IS NULL;   -- never use = NULL

-- ---- Window functions ----
SELECT title, RANK() OVER (PARTITION BY author_id ORDER BY published_at DESC)
FROM posts;

-- ---- CTEs ----
WITH active AS (SELECT author_id FROM posts GROUP BY author_id HAVING COUNT(*) > 3)
SELECT * FROM users JOIN active ON users.id = active.author_id;

-- ---- JSONB ----
SELECT payload->>'type' FROM events WHERE payload->'metadata'->>'page' = '/home';
CREATE INDEX idx_events_payload ON events USING GIN (payload);

-- ---- Diagnose a slow query ----
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM posts WHERE author_id = 42;

-- ---- Row locking (avoid races) ----
SELECT * FROM job_queue WHERE status = 'pending' FOR UPDATE SKIP LOCKED LIMIT 1;

-- ---- pgvector ----
CREATE EXTENSION vector;
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
SELECT * FROM documents ORDER BY embedding <=> '[0.1,0.2]'::vector LIMIT 5;

-- ---- Production ----
-- Always: connection pooling (PgBouncer), tuned autovacuum, indexed foreign keys
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What are the ACID properties? | Atomicity, Consistency, Isolation, Durability. |
| WHERE vs HAVING? | WHERE filters rows before aggregation; HAVING filters groups after. |
| Why index foreign keys explicitly? | PostgreSQL does NOT auto-index them, unlike the primary key they reference. |
| JSON vs JSONB? | JSON preserves exact text; JSONB is binary, indexable, and query-efficient — prefer JSONB. |
| What does EXPLAIN ANALYZE show? | The planner's chosen strategy PLUS actual execution time and row counts. |
| What is MVCC? | Multi-Version Concurrency Control — updates create new row versions, so readers never block writers. |
| What does VACUUM do, and why is it essential? | Reclaims dead row versions from MVCC; disabling it causes severe table bloat. |
| B-tree vs GIN vs GiST? | B-tree: equality/range. GIN: full-text/JSONB/arrays. GiST: geometric/range types. |
| Why does PostgreSQL need connection pooling? | Process-per-connection model — each connection is a real OS process, not a lightweight thread. |
| Streaming vs logical replication? | Streaming: exact WAL-based copy. Logical: row-level changes, flexible schema/version. |
| What does FOR UPDATE SKIP LOCKED do? | Lets concurrent workers each claim a different row without blocking on locked ones. |
| What is pgvector for? | Native vector columns + ANN indexes (HNSW/IVFFlat) for embeddings/RAG similarity search. |
| Why is = NULL always wrong? | NULL means unknown — comparisons against it are always NULL, use IS NULL instead. |
| What does a large EXPLAIN row-estimate gap indicate? | Stale table statistics — run ANALYZE. |
`,

  mcqs: `
1. Does PostgreSQL automatically create an index on a foreign key column?
   A) Yes, always  B) No — only the referenced primary key gets one  C) Only for BIGINT columns  D) Only in PostgreSQL 16+
   **Answer: B** — one of the most common, consequential PostgreSQL schema mistakes to forget.

2. What is the correct way to test for NULL in a WHERE clause?
   A) column = NULL  B) column IS NULL  C) column == NULL  D) column != ''
   **Answer: B** — NULL's three-valued logic makes = NULL always evaluate to NULL, matching nothing.

3. What does VACUUM reclaim?
   A) Disk space from dropped tables only  B) Space from dead row versions created by MVCC updates/deletes  C) Nothing, it's just a statistics refresh  D) Index fragmentation only
   **Answer: B** — essential, ongoing maintenance, not optional overhead.

4. Which index type is best suited for JSONB containment queries?
   A) B-tree  B) Hash  C) GIN  D) BRIN
   **Answer: C** — GIN (Generalized Inverted Index) is designed for this and full-text search.

5. Why is connection pooling (PgBouncer) considered essential at scale?
   A) It encrypts connections  B) PostgreSQL uses one OS process per connection, a real resource cost  C) It replaces the need for indexes  D) It's only needed for replication
   **Answer: B** — the process-per-connection model makes this a real production concern.

6. What does pgvector add to PostgreSQL?
   A) A new SQL dialect  B) Native vector columns and approximate-nearest-neighbor indexes  C) Automatic sharding  D) A GraphQL API
   **Answer: B** — letting embeddings/RAG similarity search live alongside relational data.
`,

  "revision-notes": `
PostgreSQL is an open-source, object-relational database built on a research lineage (Michael Stonebraker's POSTGRES project) that prioritizes correctness, SQL standards compliance, and extensibility over raw speed as its founding design philosophy. Its MVCC (Multi-Version Concurrency Control) engine means updates create new row versions rather than modifying data in place, letting readers and writers avoid blocking each other for the common case — a design that trades ongoing VACUUM maintenance (reclaiming dead row versions) for this concurrency benefit, and disabling or under-tuning autovacuum is one of the most common, most damaging real-world PostgreSQL production mistakes.

PostgreSQL's extensibility is architecturally central, not bolted on: JSONB (a binary, indexable JSON type), PostGIS (geospatial data), and pgvector (vector embeddings for RAG applications) all extend the core engine's type system rather than requiring separate specialized databases — a direct payoff of the original object-relational design philosophy from the 1980s. For many AI applications, pgvector lets a single PostgreSQL deployment serve both traditional relational data and similarity search, avoiding the operational cost of a separate vector database.

The single most common, most consequential PostgreSQL schema mistake is forgetting to index foreign key columns — unlike the primary key a foreign key references, PostgreSQL does NOT automatically create an index on the referencing column, making joins and cascading operations slow at real data volumes despite feeling fine in small-scale development testing. EXPLAIN ANALYZE is the essential diagnostic tool for any "why is this query slow" investigation, showing both the planner's chosen execution strategy and real timing/row-count data.

Because PostgreSQL uses a process-per-connection model (not lightweight threads), connection pooling (PgBouncer) is a near-mandatory production consideration at any real scale — too many direct application-to-database connections waste memory and CPU scheduling overhead regardless of actual query load. Isolation levels (Read Committed by default, Repeatable Read, Serializable) let applications trade concurrency for stronger consistency guarantees deliberately, and row-level locking (SELECT ... FOR UPDATE, with SKIP LOCKED for concurrent job-queue-style patterns) prevents lost updates under concurrent writes.

PostgreSQL's scaling story is vertical-first, horizontal-with-real-effort: streaming replication provides read scaling and high availability, while genuinely write-heavy horizontal scaling requires deliberate architecture (Citus for sharding, or application-level partitioning) rather than coming automatically the way some natively-distributed databases are designed to provide from inception. This tradeoff — strong consistency and rich features in exchange for scaling requiring genuine engineering investment — is precisely why PostgreSQL remains the default choice for correctness-critical, extensibility-valuing applications rather than the extreme horizontal-scale end of the database spectrum.
`,

  "learning-roadmap": `
**Week 1 — SQL and schema fundamentals**: tables, constraints, foreign keys, joins, aggregation, and basic indexing. Milestone: design and query a normalized schema for a small application domain.

**Week 2 — Transactions and isolation**: ACID properties, isolation levels, row-level locking (FOR UPDATE), and deliberately reproducing then fixing a race condition. Milestone: implement the safe job-queue-claiming pattern (see Coding Questions) and verify it under concurrent load.

**Week 3 — Query optimization**: EXPLAIN ANALYZE, index types (B-tree, GIN, GiST), and fixing a deliberately introduced slow query. Milestone: diagnose and fix a missing-index scenario, documenting the before/after query plan.

**Week 4 — JSONB and pgvector**: semi-structured data modeling, JSONB indexing, and adding vector similarity search for a small RAG-style feature. Milestone: build a hybrid relational + vector search query.

**Week 5 — Replication and scaling**: streaming replication, read/write routing, and an introduction to partitioning for large tables. Milestone: set up a primary and a streaming replica, demonstrating a read/write split.

**Week 6 — Production practices**: connection pooling (PgBouncer), backup/restore (including point-in-time recovery), monitoring (pg_stat_statements), and security (row-level security, SSL). Milestone: complete the Lab 4 hands-on project end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Redis** for the complementary caching layer, or **Vector Search**/**RAG** for going deeper on pgvector's application context.
`,

  "official-docs": `
- **postgresql.org/docs** — the official PostgreSQL documentation, exceptionally thorough and precise, the primary reference for every SQL feature and configuration parameter referenced throughout this page.
- **pgvector's GitHub repository (pgvector/pgvector)** — the authoritative source for pgvector's current feature set, index types, and distance operators.
- **postgresql.org/docs/current/mvcc.html** — the official MVCC and concurrency control documentation, essential depth beyond this page's overview.
- **pgbouncer.org** — the official PgBouncer documentation for connection pooling configuration.
- **postgresql.org/docs/current/runtime-config-resource.html** — the official configuration parameter reference for shared_buffers, work_mem, and related tuning settings.
`,

  books: `
- **"PostgreSQL: Up and Running" (3rd ed.) — Regina Obe and Leo Hsu** — a widely recommended, practical introduction covering the breadth of PostgreSQL's features including extensions like PostGIS.
- **"The Art of PostgreSQL" — Dimitri Fontaine** — a deep, SQL-first approach emphasizing writing efficient queries and leveraging PostgreSQL's advanced features well.
- **"PostgreSQL 14 Administration Cookbook" — Simon Riggs and Gianni Ciolli** — focused specifically on the production administration, tuning, and operations concerns covered in this page's Production Usage, Performance, and Deployment sections.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not PostgreSQL-specific, but essential foundational reading for the distributed-systems and replication concepts underlying this page's Scalability section.
`,

  blogs: `
- **The official PostgreSQL blog and planet.postgresql.org** — an aggregator of PostgreSQL community blog content, extremely high-signal for release announcements and deep technical posts.
- **CrunchyData's blog** — consistently excellent, practical PostgreSQL content spanning performance, security, and pgvector-specific topics.
- **Citus Data's (now Microsoft's) engineering blog** — deep content on PostgreSQL scaling and sharding, directly relevant to this page's Scalability section.
- **The Instagram Engineering blog** — periodic posts on their PostgreSQL sharding architecture, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
- **Stonebraker, M. and Rowe, L. — "The Design of POSTGRES"** (1986, ACM SIGMOD) — the original research paper describing the POSTGRES project's design goals and object-relational model, the direct intellectual ancestor of modern PostgreSQL.
- **Stonebraker, M. et al. — "The POSTGRES Data Model"** (1987, VLDB) — further foundational detail on the extensible type system that later enabled JSONB, PostGIS, and pgvector as natural extensions rather than bolted-on features.
- **Gray, J. and Reuter, A. — "Transaction Processing: Concepts and Techniques"** (1992) — the classic, foundational textbook on transaction processing and concurrency control theory underlying MVCC and isolation levels generally, applicable well beyond PostgreSQL specifically.
- For approximate nearest-neighbor search theory underlying pgvector's HNSW/IVFFlat index types, see the foundational reading referenced in the **Vector Search** skill.
`,

  videos: `
- **PGCon and PostgreSQL Conference talks** (widely available on YouTube) — the primary annual conferences for the PostgreSQL community, featuring deep talks directly from core contributors.
- **"Postgres Vision" and CrunchyData's conference talks** — practical, production-focused PostgreSQL content.
- **"Use the Index, Luke!" (Markus Winand's indexing-focused talks and companion website)** — an excellent, widely recommended deep dive specifically on SQL indexing strategy, applicable to PostgreSQL and other relational databases alike.
- **pgvector-specific conference talks** from recent PGCon/Postgres Vision events — covering the extension's rapid evolution for RAG/AI application use cases.
`,

  "github-repos": `
- **postgres/postgres** — the database's own source code, an advanced but genuinely rewarding read for understanding MVCC, the planner, and WAL internals directly.
- **pgvector/pgvector** — the pgvector extension's source, referenced throughout this page's Advanced Concepts and Real Projects sections.
- **pgbouncer/pgbouncer** — the standard connection pooler's source, originally developed at Skype (see Case Studies).
- **citusdata/citus** — the Citus sharding extension (now Microsoft-owned), referenced in Scalability.
- **zalando/patroni** — the widely used PostgreSQL high-availability and automatic failover tool referenced in Deployment.
- **cybertec-postgresql/pg_timetable** and other well-known extension repositories — useful for exploring the breadth of PostgreSQL's extension ecosystem.
- **dalibo/pev2** — a visual EXPLAIN plan analyzer, useful for the query-optimization practice referenced throughout Performance and Debugging.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Schema design**: normalize a deliberately denormalized schema (e.g., a single wide table) into properly related tables with appropriate constraints and foreign keys.
2. **Query optimization**: given a slow query and its EXPLAIN ANALYZE output, identify the missing index or stale-statistics issue and fix it.
3. **Window functions and CTEs**: solve a ranking/reporting problem (e.g., top N per group, running totals) using window functions instead of correlated subqueries.
4. **Concurrency**: implement and load-test the FOR UPDATE SKIP LOCKED job-queue pattern under simulated concurrent workers.
5. **pgvector**: build a small hybrid relational + vector similarity search feature, comparing HNSW vs. IVFFlat index build time and query recall tradeoffs.
6. **External practice sets**: PostgreSQL Exercises (pgexercises.com) for structured, guided SQL practice; "Use the Index, Luke!" for indexing-specific exercises; LeetCode's SQL track for interview-style query problems.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application servers\n(stateless, many instances)"] --> PgBouncer["PgBouncer\n(connection pooling)"]
    PgBouncer --> Primary[("PostgreSQL primary\n(accepts writes)")]
    Primary -->|streaming replication| Replica1[("Read replica 1")]
    Primary -->|streaming replication| ReplicaN[("Read replica N")]
    PgBouncer -->|read queries| Replica1
    PgBouncer -->|read queries| ReplicaN
    Primary --> WALArchive[("WAL archive\n(point-in-time recovery)")]
    App --> Cache[("Redis\ncomplementary caching layer")]
    subgraph Extensions
        PgVector["pgvector\n(embeddings/RAG)"]
        PostGIS["PostGIS\n(geospatial)"]
    end
    Primary -.-> Extensions
    subgraph Observability
        StatStatements["pg_stat_statements"]
        Monitoring["Prometheus + Grafana"]
    end
    Primary -.-> StatStatements
    StatStatements -.-> Monitoring
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((PostgreSQL))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core SQL
      Tables and constraints
      Joins and aggregation
      Window functions and CTEs
      JSONB
    Transactions and Concurrency
      ACID properties
      MVCC internals
      Isolation levels
      Row-level locking
    Indexing and Performance
      B-tree GIN GiST
      EXPLAIN ANALYZE
      Partitioning
      Autovacuum and bloat
    Scaling and HA
      Streaming replication
      Logical replication
      Connection pooling PgBouncer
      Citus and sharding
    AI and Extensions
      pgvector embeddings
      PostGIS geospatial
      Hybrid relational plus vector
    Production
      Security and RLS
      Backup and PITR
      Monitoring
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default postgresql;
