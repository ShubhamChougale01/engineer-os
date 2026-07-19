import type { SkillContent } from "../types";

/**
 * MySQL — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const mysql: SkillContent = {
  overview: `
MySQL is the most widely deployed open-source relational database in the world, built around a defining architectural decision that sets it apart from most other databases: a **pluggable storage engine architecture**, where the same SQL layer and client protocol sit on top of swappable underlying storage implementations — most commonly InnoDB today, though MySQL shipped for years with MyISAM as its default. This pluggability is why MySQL's history contains genuine architectural pivots (the MyISAM-to-InnoDB transition being the largest) that a more monolithic database engine couldn't have made as cleanly.

For an AI engineer, MySQL shows up constantly as the database underneath an enormous share of existing web applications — WordPress (and by extension a huge fraction of the web), countless PHP/Node.js/Python applications, and much of the LAMP-stack-era internet's surviving infrastructure. Shipping an AI feature into an established company frequently means integrating with a MySQL database that predates the project by years, making fluency in MySQL's specific quirks (versus PostgreSQL's) a genuinely practical, frequently-needed skill rather than a purely academic comparison.

Key characteristics: InnoDB (the default storage engine since MySQL 5.5) provides full ACID transactions, row-level locking, and crash recovery via its own redo/undo log mechanism; a historically strong reputation for read-heavy web workload performance and replication simplicity; a somewhat more permissive default SQL dialect than PostgreSQL's stricter standards adherence (though modern MySQL's default sql_mode has tightened this considerably); and, since Oracle's 2010 acquisition of Sun Microsystems (MySQL's prior owner), a notable fork ecosystem (MariaDB being the most prominent) driven partly by community concern over single-vendor control.
`,

  history: `
MySQL was created by **Michael "Monty" Widenius**, **David Axmark**, and **Allan Larsson** at a Swedish company (originally TcX, later MySQL AB), building on Widenius's earlier work with a simpler storage engine and explicitly prioritizing speed and simplicity for web-era workloads.

| Year | Milestone |
|------|-----------|
| 1995 | MySQL 1.0 released by MySQL AB (Sweden), initially using the MyISAM storage engine |
| 2000 | MySQL is released under the GPL, cementing its open-source identity |
| 2001 | InnoDB (originally developed independently by Innobase Oy) becomes available as an alternative storage engine, adding ACID transactions and row-level locking MyISAM lacked |
| 2005 | Oracle acquires Innobase Oy (InnoDB's developer) — an early signal of Oracle's growing interest in the MySQL ecosystem |
| 2008 | **Sun Microsystems acquires MySQL AB** for approximately 1 billion dollars |
| 2010 | **Oracle acquires Sun Microsystems**, becoming MySQL's steward — a controversial transition given Oracle's own competing commercial database product |
| 2009–2010 | Michael Widenius and others, concerned about Oracle's stewardship, fork MySQL to create **MariaDB**, intended as a drop-in, community-governed replacement |
| 2010 | MySQL 5.5 makes **InnoDB the default storage engine**, formally ending MyISAM's long reign as the default — a major architectural shift for the entire ecosystem |
| 2015 | MySQL 5.7 — native JSON data type support, improved query optimizer |
| 2018 | **MySQL 8.0** — window functions, CTEs (Common Table Expressions), a fully rewritten data dictionary, and significant SQL-standard-compliance improvements |
| 2020s | Continued MySQL 8.x releases with incremental performance and replication improvements; MariaDB continues diverging further as an independent project with its own feature roadmap |
| 2025+ | Continued MySQL 8.x maintenance and feature releases; the MySQL/MariaDB ecosystem split remains a permanent, stable fact of the broader "MySQL-compatible" database landscape |

The 2010 Oracle acquisition and the resulting MariaDB fork is one of open-source software's most significant governance case studies — unlike the Node.js/io.js fork's eventual reunification, MySQL and MariaDB have remained permanently separate, community-governed-vs-vendor-controlled projects, a genuinely different outcome worth understanding as a contrast.
`,

  "why-it-exists": `
MySQL exists because of a very specific late-1990s problem: **the web's explosive growth needed a database that was fast, simple to set up, and free to use**, at a time when the dominant commercial relational databases (Oracle, IBM DB2, Microsoft SQL Server) were expensive, complex to administer, and aimed at enterprise workloads rather than the emerging generation of web applications.

The prior landscape offered:

1. **Commercial enterprise databases**: mature and feature-rich, but expensive licensing and administrative complexity that didn't match the "spin up a website cheaply and quickly" needs of the dot-com-era web.
2. **Simpler, less capable alternatives**: some existed, but none combined MySQL's specific balance of genuine SQL support, straightforward replication, and raw speed for the read-heavy, relatively simple query patterns most early web applications actually needed.

MySQL's founders bet specifically on SPEED and SIMPLICITY for the common case — the original MyISAM storage engine deliberately traded away transactional guarantees (no true ACID compliance, table-level rather than row-level locking) in exchange for very fast reads and a simple, small footprint, a bet that matched the read-heavy, simple-schema reality of the web applications MySQL initially targeted. As MySQL's usage grew into more transaction-sensitive domains (e-commerce, financial data), InnoDB's later rise and eventual default-engine status represented the ecosystem's collective recognition that ACID guarantees mattered for a growing share of MySQL's actual production use cases — while keeping the pluggable storage engine architecture that made this evolution possible without abandoning MySQL's existing user base or SQL interface.
`,

  "problem-it-solves": `
MySQL solves the **"fast, free, simple-to-deploy relational database for the web's dominant read-heavy workload patterns"** problem, while its pluggable storage engine architecture lets it also serve transaction-heavy needs via InnoDB.

Concretely, MySQL provides:

- **A pluggable storage engine architecture**: the same SQL interface and client protocol work regardless of which underlying storage engine (InnoDB for transactions, MyISAM for legacy/read-heavy needs, Memory for temporary tables) handles the actual data, letting different tables in the same database use different engines suited to their specific access patterns.
- **Straightforward, historically simple replication**: MySQL's binary-log-based replication has been comparatively simple to set up for read scaling, contributing significantly to its dominance in read-heavy web application deployments.
- **A massive existing ecosystem and installed base**: WordPress, Drupal, countless PHP frameworks, and an enormous share of the pre-cloud-native web run on MySQL, meaning fluency in it remains practically valuable regardless of newer databases' technical merits.
- **InnoDB's full ACID compliance**: row-level locking, foreign key constraints, and crash recovery, bringing MySQL to genuine transactional-workload parity with PostgreSQL for the vast majority of practical application needs since becoming the default engine.

What MySQL deliberately does **not** solve, or solves less completely than some alternatives: it historically had a more permissive, less strict SQL dialect (silently truncating or coercing invalid data rather than rejecting it, in older default configurations) — modern MySQL's stricter sql_mode settings have significantly closed this gap, but legacy applications and defaults still vary; its extensibility (custom types, extensions) is considerably more limited than PostgreSQL's, lacking an equivalent to pgvector or PostGIS as first-party, widely-adopted extensions; and its governance, since 2010, sits under a single commercial vendor (Oracle) rather than a neutral foundation, a genuine consideration for teams valuing community-governed open-source stewardship (driving significant MariaDB adoption specifically for this reason).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the pluggable storage engine architecture and why InnoDB became MySQL's default, understanding what MyISAM traded away for speed.
2. Design a normalized MySQL schema, apply appropriate indexes, and write efficient joins and aggregations.
3. Use EXPLAIN to diagnose a slow query and choose an appropriate indexing strategy.
4. Configure and reason about MySQL replication (binary log based) for read scaling and high availability.
5. Understand InnoDB's transaction isolation levels and locking behavior, including the differences from PostgreSQL's MVCC model.
6. Apply MySQL-specific features (JSON columns, generated columns, common table expressions) appropriately.
7. Diagnose and resolve common production issues: connection limits, replication lag, and lock contention.
8. Explain the practical and governance-driven differences between MySQL and MariaDB well enough to make an informed choice.
9. Answer senior-level interview questions on InnoDB internals, isolation levels, and MySQL-specific indexing behavior.
`,

  prerequisites: `
- **Required**: basic SQL — SELECT, WHERE, JOIN, GROUP BY; this page builds from there into MySQL-specific indexing, replication, and InnoDB internals.
- **Very helpful**: the **PostgreSQL** skill — much of this page is best understood as a direct comparison, since the two databases solve overlapping problems with meaningfully different defaults and tradeoffs.
- **Helpful**: general **Computer Science** fundamentals (B-tree data structures) for understanding InnoDB's clustered index architecture more deeply.

Dependency links: basic SQL fundamentals → **PostgreSQL** for a useful contrast → this page → **Redis** for the complementary caching layer most MySQL-backed applications add → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Tables and basic types

~~~sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO users (email) VALUES ('ada@example.com');
SELECT * FROM users WHERE email = 'ada@example.com';
~~~

AUTO_INCREMENT is MySQL's syntax for an auto-incrementing primary key (PostgreSQL's SERIAL equivalent); ENGINE=InnoDB explicitly selects the storage engine — InnoDB has been the default since MySQL 5.5, but specifying it explicitly documents intent and matters when working with older configurations or specific tables that might use a different engine.

### Relationships and joins

~~~sql
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT posts.title, users.email
FROM posts
JOIN users ON posts.author_id = users.id;
~~~

Foreign key constraints in MySQL are only enforced by storage engines that support them (InnoDB does; MyISAM historically did not) — a genuinely important reason InnoDB became the default, since data integrity enforcement is foundational, not optional, for most real applications.

### Filtering, grouping, and aggregation

~~~sql
SELECT author_id, COUNT(*) AS post_count
FROM posts
WHERE title NOT LIKE 'Draft%'
GROUP BY author_id
HAVING COUNT(*) > 5
ORDER BY post_count DESC
LIMIT 10;
~~~

Identical SQL syntax and semantics to PostgreSQL for this common pattern — GROUP BY collapses rows into groups, HAVING filters groups after aggregation, WHERE filters individual rows before it.

### Basic indexing

~~~sql
CREATE INDEX idx_posts_author_id ON posts(author_id);
~~~

Like PostgreSQL, MySQL does NOT automatically index foreign key columns by default in all configurations — always add an explicit index on any column used in joins or frequent WHERE filtering.

### Transactions

~~~sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
~~~

START TRANSACTION (or BEGIN) opens a transaction; COMMIT makes its changes permanent, ROLLBACK undoes them entirely — this ONLY provides true atomicity with InnoDB; MyISAM tables have no transaction support at all, silently committing each statement individually regardless of START TRANSACTION.

### NULL handling

~~~sql
SELECT * FROM users WHERE middle_name = NULL;     -- WRONG: always returns zero rows
SELECT * FROM users WHERE middle_name IS NULL;      -- RIGHT
~~~

Identical three-valued-logic behavior to PostgreSQL — NULL represents "unknown," and only IS NULL/IS NOT NULL correctly test for it.

Common beginner trap: assuming a table has transactional guarantees without confirming its storage engine is InnoDB — covered fully in Intermediate Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### Storage engines in practice

~~~sql
SHOW TABLE STATUS LIKE 'posts';   -- shows the Engine column among other details
ALTER TABLE legacy_table ENGINE = InnoDB;   -- convert an existing MyISAM table
~~~

Checking a table's actual storage engine matters enormously: a MyISAM table has no transaction support, no foreign key enforcement, and table-level (not row-level) locking, meaning a single writer blocks ALL other writers to that table — a severe concurrency limitation InnoDB doesn't share. Legacy MySQL databases (especially anything predating MySQL 5.5) frequently still have MyISAM tables lurking, worth auditing explicitly.

### JSON columns

~~~sql
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payload JSON NOT NULL
);

INSERT INTO events (payload) VALUES ('{"type": "click", "user_id": 42}');

SELECT payload->>'$.type' AS event_type
FROM events
WHERE payload->>'$.user_id' = '42';

CREATE INDEX idx_event_type ON events ((CAST(payload->>'$.type' AS CHAR(50))));
~~~

MySQL's JSON type (since 5.7) stores a validated, optimized binary representation (similar in spirit to PostgreSQL's JSONB, though with a different underlying implementation and query syntax using JSON path expressions like $.type); indexing JSON fields requires a functional/generated column index rather than a native GIN-equivalent index type.

### Generated columns

~~~sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(10, 2),
    quantity INT,
    total DECIMAL(10, 2) AS (price * quantity) STORED
);
~~~

Generated columns compute a value from other columns automatically — STORED persists the computed value physically (allowing it to be indexed, at the cost of storage and write overhead); VIRTUAL (the alternative) computes it on read instead, saving storage but preventing indexing.

### Common Table Expressions and window functions (MySQL 8.0+)

~~~sql
WITH active_authors AS (
    SELECT author_id, COUNT(*) AS post_count
    FROM posts
    GROUP BY author_id
    HAVING COUNT(*) > 3
)
SELECT users.email, active_authors.post_count
FROM active_authors
JOIN users ON users.id = active_authors.author_id;

SELECT title, RANK() OVER (PARTITION BY author_id ORDER BY published_at DESC) AS rnk
FROM posts;
~~~

MySQL 8.0 finally added CTEs and window functions, a significant SQL-standard-compliance catch-up versus PostgreSQL (which had supported both for years prior) — a genuinely important version boundary to be aware of, since many still-deployed MySQL 5.7 databases lack these features entirely.

### EXPLAIN — reading a query plan

~~~sql
EXPLAIN SELECT * FROM posts WHERE author_id = 42;
~~~

~~~
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
| id | select_type | table | type | possible_keys | key  | key_len | ref  | rows | Extra       |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
|  1 | SIMPLE      | posts | ALL  | NULL          | NULL | NULL    | NULL | 5000 | Using where |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
~~~

type: ALL means a full table scan — the single most important column to check; possible_keys/key show whether an available index was actually considered/used; EXPLAIN ANALYZE (MySQL 8.0.18+) additionally provides real execution timing, similar to PostgreSQL's equivalent.

### Replication basics

~~~sql
-- On the replica:
CHANGE MASTER TO MASTER_HOST='primary_host', MASTER_USER='repl_user', MASTER_LOG_FILE='mysql-bin.000001';
START SLAVE;
SHOW SLAVE STATUS;   -- check Seconds_Behind_Master for replication lag
~~~

MySQL's binary-log-based replication (asynchronous by default, though semi-synchronous and group replication options exist) has historically been considered simpler to set up than some alternatives, a real factor in MySQL's read-scaling popularity for web applications.
`,

  "advanced-concepts": `
### InnoDB's clustered index architecture

~~~mermaid
flowchart LR
    A["Primary key\n(the CLUSTERED index)"] --> B["Table data physically stored\nIN primary key order"]
    C["Secondary index\n(e.g. on email)"] --> D["Stores the primary key value,\nNOT a direct row pointer"]
    D -->|lookup| B
~~~

Unlike PostgreSQL (where the table's physical row order is generally independent of any index), InnoDB physically stores table rows in PRIMARY KEY order — this is why choosing a good primary key matters more in MySQL/InnoDB than in many other databases: a monotonically increasing key (like AUTO_INCREMENT) keeps inserts efficient (always appending), while a random key (like an unordered UUID) causes expensive page splits and fragmentation as rows insert into the middle of the existing order. Every secondary index stores the primary key value (not a direct disk pointer) to look up the full row, meaning a secondary index lookup is effectively two index traversals — the secondary index, then the clustered primary key index.

### Isolation levels and next-key locking

~~~sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;   -- MySQL/InnoDB's DEFAULT (unlike PostgreSQL's Read Committed default)
~~~

InnoDB's default isolation level is REPEATABLE READ (stricter than PostgreSQL's default of Read Committed), and InnoDB implements it using "next-key locking" — a combination of row locks and gap locks preventing phantom reads by locking not just matching rows but the GAPS between index entries too, a MySQL/InnoDB-specific mechanism with real behavioral consequences (more locking, different deadlock patterns) that don't map directly onto PostgreSQL's MVCC-based approach to the same isolation guarantee.

### The MySQL/MariaDB fork in practice

~~~mermaid
flowchart TB
    MySQL2008["MySQL AB\n(2008: acquired by Sun)"] --> Oracle["2010: Oracle acquires Sun,\nbecomes MySQL's steward"]
    Oracle --> MySQLToday["MySQL\n(Oracle-governed,\nOracle-specific features:\nMySQL Enterprise, HeatWave)"]
    Oracle -.->|community concern\nover single-vendor control| MariaDB["MariaDB\n(2009 fork,\ncommunity/foundation-governed)"]
    MariaDB --> MariaDBToday["MariaDB today:\nmostly compatible, but diverging\nfeature set (different JSON,\nreplication, storage engine details)"]
~~~

MariaDB began as a drop-in replacement but has diverged meaningfully over a decade-plus of independent development — modern MariaDB has its OWN storage engines (Aria, MyRocks support), its own JSON implementation quirks, and its own replication features not identical to MySQL's; treating them as perfectly interchangeable today is a common, sometimes costly mistake for teams migrating between them.

### Partitioning

~~~sql
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    payload JSON,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
);
~~~

MySQL's partitioning requires the partitioning column to be part of every unique key (including the primary key), a notable constraint versus PostgreSQL's more flexible declarative partitioning — a real architectural difference worth planning around when designing a partitioned MySQL schema.

### Query cache (removed) and modern alternatives

MySQL historically shipped a built-in query result cache, REMOVED entirely in MySQL 8.0 due to poor scalability under concurrent writes (any write to a table invalidated ALL cached queries referencing it, a severe bottleneck at real concurrency) — modern MySQL deployments rely on an external cache (Redis, Memcached) at the application layer instead, the same architectural pattern recommended across every database on this platform.

### Replication topologies: async, semi-sync, and group replication

~~~sql
-- Semi-synchronous replication requires at least one replica to acknowledge
-- receipt before the primary considers a commit successful, reducing (not eliminating)
-- data-loss risk versus fully asynchronous replication's "fire and forget" default.
~~~

MySQL Group Replication and InnoDB Cluster provide a more modern, consensus-based (Paxos-derived) high-availability solution, closer in spirit to PostgreSQL's Patroni-based HA patterns, versus classic asynchronous binary log replication's simpler but weaker consistency guarantees during failover.
`,

  "internal-working": `
What happens inside MySQL/InnoDB from a client query to a committed result:

~~~mermaid
flowchart LR
    A["Client sends SQL query"] --> B["Parser\n(syntax validation)"]
    B --> C["Query optimizer\n(chooses execution plan\nusing table statistics)"]
    C --> D["Storage engine API\n(InnoDB, MyISAM, etc. -\npluggable at this layer)"]
    D --> E["InnoDB buffer pool\n(page cache in memory)"]
    E --> F["InnoDB redo log\n(WAL-equivalent, durability)"]
    F --> G["Result returned to client"]
~~~

1. **Parsing and optimization**: identical conceptually to PostgreSQL — SQL is parsed, and the optimizer chooses an execution plan using gathered statistics.
2. **The pluggable storage engine layer**: this is MySQL's defining architectural distinction — the SQL layer above is storage-engine-agnostic, delegating actual data storage, retrieval, locking, and transaction handling to whichever engine (InnoDB, by default) is configured for each table.
3. **InnoDB's buffer pool**: InnoDB's own memory cache for data and index pages, conceptually equivalent to PostgreSQL's shared_buffers, sized via innodb_buffer_pool_size — one of the single most impactful tuning parameters for InnoDB performance.
4. **The InnoDB redo log**: InnoDB's write-ahead logging mechanism (conceptually equivalent to PostgreSQL's WAL) ensures durability — a change is logged to the redo log before being considered committed, allowing crash recovery by replaying the log.
5. **Clustered index storage**: as covered in Advanced Concepts, InnoDB physically stores table data in primary key order, a structural difference from PostgreSQL's heap-based table storage that has real performance implications for primary key choice.

**Why the pluggable storage engine architecture matters practically**: it explains why "is this table transactional" is a genuinely necessary question to ask in MySQL (unlike PostgreSQL, where every table always has full ACID support) — different tables in the SAME MySQL database can have entirely different consistency and locking guarantees depending on their configured engine, a source of real production surprises for engineers assuming MySQL behaves uniformly across every table.
`,

  architecture: `
A senior engineer thinks about MySQL at two levels: **the pluggable storage engine architecture** (what guarantees a specific table actually has) and **how applications should be structured around MySQL's replication and connection model**.

### The pluggable storage engine layer

~~~mermaid
flowchart TB
    subgraph MySQLServer["MySQL Server"]
        SQL["SQL layer\n(parser, optimizer — engine-agnostic)"]
        InnoDB["InnoDB\n(default: ACID, row-level locking,\nforeign keys, crash recovery)"]
        MyISAM["MyISAM\n(legacy: no transactions,\ntable-level locking, faster for\nsimple read-heavy, static data)"]
        Memory["Memory engine\n(RAM-only, for temp tables)"]
    end
    SQL --> InnoDB
    SQL --> MyISAM
    SQL --> Memory
~~~

Nearly every modern application should use InnoDB for every table by default — MyISAM's remaining legitimate use cases (certain full-text search scenarios in older MySQL versions, specific read-only reference data) have narrowed significantly as InnoDB has matured its own full-text search and performance characteristics over the years.

### Application-side architecture around MySQL

~~~
Application servers (many, stateless)
        │
        ▼
  Connection pool (application-level or ProxySQL)
        │
        ▼
MySQL primary (writes) ──binary log replication──▶ Read replicas (reads)
~~~

Rules mature teams follow: always confirm every production table uses InnoDB explicitly (don't assume); pool connections at the application or proxy layer (ProxySQL is a common MySQL-specific choice, conceptually similar to PostgreSQL's PgBouncer); route read-heavy, staleness-tolerant queries to replicas; and version schema migrations through a framework's migration tool rather than ad-hoc DDL changes.
`,

  "data-flow": `
Tracing one query end to end — a SELECT filtered on an indexed column:

~~~mermaid
sequenceDiagram
    participant App
    participant Proxy as ProxySQL/connection pool
    participant MySQL as MySQL server process
    participant Optimizer
    participant InnoDB
    participant BufferPool as InnoDB buffer pool
    participant Disk

    App->>Proxy: SELECT * FROM posts WHERE author_id = 42
    Proxy->>MySQL: forwards over a pooled connection
    MySQL->>Optimizer: parse and plan the query
    Optimizer->>Optimizer: choose an index scan\nusing idx_posts_author_id
    Optimizer->>InnoDB: request matching rows via the storage engine API
    InnoDB->>BufferPool: check the buffer pool cache first
    BufferPool->>Disk: cache miss — read pages from disk
    Disk-->>BufferPool: pages loaded into the buffer pool
    BufferPool-->>InnoDB: matching rows
    InnoDB-->>MySQL: result set
    MySQL-->>Proxy: result set
    Proxy-->>App: result set
~~~

The most misunderstood part for newcomers: **a secondary index lookup in InnoDB is a two-step process** — first traversing the secondary index to find the matching primary key value(s), then traversing the CLUSTERED (primary key) index to actually fetch the full row data; this is why a query selecting only columns already present in a secondary index (a "covering index") can be noticeably faster than one requiring the additional clustered-index lookup, a MySQL/InnoDB-specific optimization consideration without a direct PostgreSQL equivalent (since PostgreSQL's indexes all point to a heap location directly, not through a second index traversal).
`,

  "production-usage": `
### Connection pooling with ProxySQL

~~~
mysql_servers:
  - address: "mysql-primary"
    hostgroup: 0
  - address: "mysql-replica-1"
    hostgroup: 1
~~~

ProxySQL sits between the application and MySQL, providing connection pooling, automatic read/write splitting based on query analysis, and failover handling — conceptually similar to PgBouncer, though with additional MySQL-specific routing intelligence built in.

### Configuration essentials

~~~
innodb_buffer_pool_size = 8G          # typically 60-70% of available RAM on a dedicated server
innodb_log_file_size = 512M            # larger reduces checkpoint frequency, at the cost of longer crash recovery
max_connections = 500
innodb_flush_log_at_trx_commit = 1     # 1 = full ACID durability (default, safest); 2 = faster, small data-loss window on crash
~~~

Non-negotiables for production:

1. **innodb_buffer_pool_size tuned to actual available RAM** — the single most impactful InnoDB tuning parameter, analogous to PostgreSQL's shared_buffers.
2. **Every production table confirmed to use InnoDB** — audit explicitly with SHOW TABLE STATUS, don't assume.
3. **innodb_flush_log_at_trx_commit left at its safe default (1)** unless a team has deliberately, knowingly accepted the small data-loss window that setting 2 (or 0) trades for performance.

### Common production stacks

- **Web applications, especially PHP/WordPress-adjacent**: MySQL remains the overwhelming default for this specific, enormous ecosystem.
- **Read-heavy applications with straightforward replication needs**: MySQL's replication maturity and simplicity remain a genuine draw for teams prioritizing operational simplicity over PostgreSQL's richer feature set.
- **MariaDB as a drop-in alternative**: many teams, particularly those valuing community governance over single-vendor (Oracle) control, deploy MariaDB instead, with largely (though not perfectly) compatible SQL and tooling.
`,

  "industry-examples": `
- **Facebook (Meta)**: one of the largest MySQL deployments in the world, having developed and open-sourced significant MySQL tooling (MyRocks, a RocksDB-based storage engine optimized for their specific workload; various operational tools) and publishing extensively on operating MySQL at truly massive scale.
- **WordPress and the broader WordPress ecosystem**: WordPress's default and near-universal database choice, meaning MySQL underlies a very substantial fraction of the entire public web.
- **Twitter (X)**: historically ran significant portions of its infrastructure on MySQL (particularly its "Gizzard" sharding framework era), a widely cited large-scale MySQL deployment.
- **Booking.com**: has published extensively on operating MySQL at very large scale for its high-traffic booking platform.
- **GitHub**: uses MySQL as a core part of its infrastructure, with published engineering content on schema migrations and operational practices at scale.
- **Uber (historically)**: notably migrated from PostgreSQL to MySQL early in its scaling journey, citing specific operational and replication considerations at the time — a frequently cited, sometimes debated case study (Uber later revisited aspects of this decision, illustrating that these tradeoffs are workload- and era-specific, not universal truths).
- **YouTube (early years)**: ran on MySQL (with significant custom sharding work, "Vitess," later open-sourced) before Google's broader infrastructure evolution.

Pattern to notice: MySQL adoption clusters around **read-heavy web applications, especially those with an existing PHP/WordPress-adjacent or LAMP-stack heritage**, and companies that have invested deeply in MySQL-specific scaling tooling (MyRocks, Vitess) rather than switching database engines entirely.
`,

  "best-practices": `
1. **Always confirm InnoDB is the storage engine for every production table** — never assume; a lingering MyISAM table from a legacy migration is a genuine, common production surprise.
2. **Choose a good primary key deliberately** — a monotonically increasing key (AUTO_INCREMENT) keeps InnoDB's clustered index insertions efficient; avoid random-order primary keys (like unordered UUIDs) for high-write tables.
3. **Use EXPLAIN before assuming a query is slow "because MySQL is slow"** — check for type: ALL (full table scan) as the first diagnostic signal.
4. **Set innodb_buffer_pool_size deliberately** to a large fraction of available RAM on a dedicated database server — the single highest-leverage InnoDB tuning parameter.
5. **Use covering indexes for frequently-run, performance-critical queries** where practical — avoiding the secondary-index-then-clustered-index double lookup InnoDB otherwise requires.
6. **Never leave innodb_flush_log_at_trx_commit at anything other than 1** unless you've deliberately, knowingly accepted the associated data-loss risk for a specific, measured performance need.
7. **Pool connections** (ProxySQL or application-level pooling) rather than letting every application instance open many direct connections.
8. **Prefer database-level constraints (foreign keys, NOT NULL, CHECK since MySQL 8.0.16+)** over application-only validation, the same universal relational-database discipline as PostgreSQL.
9. **Understand your isolation level's actual behavior** — MySQL/InnoDB's default REPEATABLE READ with next-key locking behaves meaningfully differently from PostgreSQL's default Read Committed; don't assume identical behavior when porting application logic between the two.
10. **Version and review schema migrations** through a framework's migration tool, treating MySQL DDL changes with the same rigor as any other production code change.
11. **Be explicit about MySQL versus MariaDB** when documenting infrastructure and dependencies — the two have diverged enough that "MySQL-compatible" doesn't guarantee identical behavior for every feature.
12. **Monitor replication lag explicitly** for any application routing reads to replicas — stale reads beyond an acceptable threshold are a real, silent correctness risk if unmonitored.
`,

  "anti-patterns": `
### Assuming every table is transactional without checking

~~~sql
-- A legacy table lingering from an old migration, silently NOT transactional:
SHOW TABLE STATUS LIKE 'legacy_orders';
-- Engine: MyISAM  <-- a genuine production surprise if undiscovered

-- Fix: convert explicitly
ALTER TABLE legacy_orders ENGINE = InnoDB;
~~~

Discovering a critical business table is still MyISAM (no transactions, table-level locking) only during a production incident is a genuinely common, avoidable failure — audit storage engines explicitly as part of any MySQL production readiness review.

### Choosing a poor primary key for a high-write table

~~~sql
-- WRONG for a high-write table — a random-order UUID primary key causes
-- expensive page splits as InnoDB's clustered index must insert into the
-- middle of existing pages, not simply append
CREATE TABLE events (id CHAR(36) PRIMARY KEY DEFAULT (UUID()), ...);

-- BETTER — a monotonically increasing key keeps clustered-index inserts
-- efficient; store a UUID as a separate, indexed (non-primary) column if
-- a globally unique external identifier is genuinely needed
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE DEFAULT (UUID()),
    ...
);
~~~

### Other production-grade anti-patterns

- **Ignoring EXPLAIN's type: ALL result**: a full table scan on a large, frequently-queried table is nearly always fixable with an appropriate index; don't accept it as "just how the query is."
- **Not monitoring replication lag**: routing reads to a lagging replica without awareness risks serving stale, incorrect data to users without any visible error.
- **Setting innodb_flush_log_at_trx_commit to 2 (or 0) without a deliberate, understood tradeoff decision**: trades durability guarantees for performance in a way that should be an explicit, documented architectural decision, not an accidental default left unexamined.
- **Treating MariaDB and MySQL as perfectly interchangeable**: a decade-plus of independent development means specific features, JSON handling nuances, and replication details can genuinely differ; verify compatibility for anything beyond the most basic SQL.
- **Using the (removed) query cache mental model in MySQL 8.0+**: the built-in query cache was removed entirely; applications must add their own caching layer (Redis) rather than relying on MySQL to cache query results automatically.
`,

  performance: `
### Rule zero: measure first

~~~sql
EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id = 42;
~~~

EXPLAIN ANALYZE (available since MySQL 8.0.18) provides both the planned execution strategy and real execution timing, the direct MySQL equivalent of PostgreSQL's EXPLAIN ANALYZE — never guess at a MySQL performance problem.

### The performance hierarchy (apply in order)

1. **Add the right index** — check EXPLAIN's type column; ALL (full scan) on a large, frequently-filtered table is the most common, cheapest-to-fix performance problem.
2. **Fix N+1 query patterns at the application layer** — identical universal ORM discipline as every other database covered on this platform.
3. **Consider covering indexes** for hot, performance-critical queries, avoiding InnoDB's secondary-index-then-clustered-index double lookup.
4. **Tune innodb_buffer_pool_size** to actual available RAM — the single highest-leverage InnoDB configuration change.
5. **Choose a good primary key** (monotonically increasing for high-write tables) to keep clustered-index insertions efficient rather than fragmenting.
6. **Scale reads horizontally with replicas** once a single primary's read capacity is genuinely the bottleneck, using ProxySQL or application-level read/write routing.

### Micro-level facts worth knowing

- COUNT(*) on an InnoDB table requires scanning an index (unlike some MyISAM-era assumptions of an instantly available cached count) — for approximate counts on very large tables, consider SHOW TABLE STATUS's Rows estimate or a maintained counter.
- Bulk inserts are far faster using LOAD DATA INFILE or batched multi-row INSERT statements than many individual single-row INSERTs.
- A composite index's column ORDER matters — an index on (author_id, published_at) helps a query filtering on author_id alone or on both columns together, but does NOT help a query filtering on published_at alone.
`,

  scalability: `
MySQL's scaling story, like PostgreSQL's, is primarily **vertical first, then horizontal with real effort** — though MySQL's replication maturity and specific large-scale tooling (Vitess, MyRocks) give it a particularly well-trodden path for certain scaling patterns.

### Read scaling via replication

~~~mermaid
flowchart LR
    App["Application"] --> Proxy["ProxySQL\n(read/write routing)"]
    Proxy -->|writes| Primary[("Primary")]
    Proxy -->|reads| R1[("Read replica 1")]
    Proxy -->|reads| R2[("Read replica N")]
    Primary -->|binary log replication| R1
    Primary -->|binary log replication| R2
~~~

### Write scaling: Vitess and sharding

Vitess (originally developed at YouTube, now a CNCF graduated project) provides transparent sharding, connection pooling, and query routing across many MySQL instances, letting an application interact with what appears to be one large database while Vitess handles the underlying distribution — one of the most mature, production-proven horizontal-scaling solutions specifically for MySQL, used by YouTube, Slack, and others at genuine scale.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Missing indexes on hot query paths | Add appropriate indexes; verify with EXPLAIN that type is not ALL |
| Single primary's write throughput ceiling | Vertical scaling first, then Vitess or application-level sharding if genuinely necessary |
| Read-heavy workload exceeding one server | Binary log replication to read replicas, with ProxySQL or application-level read/write routing |
| Replication lag under heavy write load | Semi-synchronous or group replication for stronger consistency guarantees, at some throughput cost |
| Poor primary key choice causing insert fragmentation | Redesign toward a monotonically increasing primary key; store any needed external unique ID separately |
`,

  security: `
### MySQL's built-in security features

1. **Role-based and grant-based access control**: MySQL's privilege system (GRANT/REVOKE, and roles since MySQL 8.0) controls exactly which users can perform which operations on which databases/tables — apply least privilege to application database accounts.
2. **SSL/TLS for connections**: encrypting data in transit, which should be mandatory for production deployments, especially across any network not fully controlled.
3. **Parameterized queries prevent SQL injection**: identical principle to PostgreSQL — MySQL drivers/ORMs used correctly with parameterized queries make injection structurally difficult (see the **SQL Injection** skill).
4. **Password validation plugins**: MySQL can enforce password complexity policies for database accounts directly at the server level.

### What remains the application's responsibility

- **SQL injection via raw, string-concatenated queries**: MySQL doesn't prevent this if application code builds SQL by concatenating untrusted input directly.
- **Secrets management**: database credentials from environment variables or a secrets manager, never hardcoded (see the **Secrets Management** skill).
- **Encryption at rest**: MySQL Enterprise Edition offers built-in transparent data encryption; the open-source community edition typically relies on filesystem/infrastructure-level encryption instead.
- **Auditing**: MySQL Enterprise Audit (a commercial feature) or open-source alternatives (Percona's audit plugin) provide detailed audit logging for compliance-sensitive environments.

### The MySQL-versus-Oracle-governance security consideration

Because MySQL is Oracle-governed, some advanced security features (transparent data encryption, detailed auditing) are Enterprise-only commercial features, not available in the open-source Community Edition — a genuine practical consideration distinguishing MySQL's security feature availability from PostgreSQL's (where nearly everything, including row-level security, is available in the fully open-source core) or MariaDB's (which has kept more security features open-source specifically as part of its community-governance positioning).

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing MySQL-dependent application code uses the same fundamental strategies as testing against any relational database.

~~~python
import pytest
import mysql.connector

@pytest.fixture
def db_connection():
    conn = mysql.connector.connect(database="test_db")
    yield conn
    conn.rollback()
    conn.close()

def test_insert_user(db_connection):
    cursor = db_connection.cursor()
    cursor.execute("INSERT INTO users (email) VALUES (%s)", ("test@example.com",))
    cursor.execute("SELECT id FROM users WHERE email = %s", ("test@example.com",))
    assert cursor.fetchone() is not None
~~~

### Testcontainers for genuine integration tests

~~~python
from testcontainers.mysql import MySqlContainer

def test_with_real_mysql():
    with MySqlContainer("mysql:8.0") as mysql:
        connection_url = mysql.get_connection_url()
        # run migrations and tests against a genuinely real, ephemeral MySQL instance
~~~

Testcontainers spins up a real, disposable MySQL instance for each test run — important given MySQL's storage-engine-specific behaviors (locking, isolation level defaults) that an approximation (like SQLite) would not accurately replicate.

### The senior testing doctrine

- Wrap each test in a transaction rolled back afterward, for fast, isolated tests (only works correctly against InnoDB tables — a genuine reason to confirm the test database uses InnoDB, not MyISAM).
- Use Testcontainers or an equivalent real-database-in-CI approach for genuine integration coverage, particularly for anything touching isolation-level-sensitive concurrent behavior.
- Explicitly test against the SAME MySQL major version (and, if relevant, MySQL vs. MariaDB) used in production — version-specific SQL feature availability (CTEs, window functions) genuinely matters.
- Never assume a test passing against SQLite or an in-memory substitute guarantees identical production MySQL behavior — verify with a real instance for anything beyond the simplest queries.
`,

  debugging: `
### The toolbox, in escalation order

1. **EXPLAIN / EXPLAIN ANALYZE** — the first, most important tool; check the type column for ALL (full scan) and possible_keys/key for whether an index was considered/used.
2. **SHOW PROCESSLIST** — shows every currently active connection/query, essential for finding long-running or blocked queries:

~~~sql
SHOW FULL PROCESSLIST;
~~~

3. **The Performance Schema and sys schema** — MySQL's built-in, detailed instrumentation layer (analogous in purpose to PostgreSQL's pg_stat_statements), tracking query statistics, lock waits, and I/O patterns at a granular level.
4. **SHOW ENGINE INNODB STATUS** — a detailed dump of InnoDB's internal state, including current lock waits, deadlock information, and buffer pool statistics.
5. **The slow query log**: configuring long_query_time and enabling slow_query_log surfaces queries exceeding a threshold, giving visibility into slow queries you didn't know to look for.
6. **SHOW TABLE STATUS** — confirms a table's actual storage engine, row count estimates, and other metadata, essential for the "is this table even transactional" audit.

### Debugging common MySQL-specific symptoms

- "Deadlock found when trying to get lock" — two transactions acquired locks in conflicting order, exactly analogous to PostgreSQL's deadlock detection; check SHOW ENGINE INNODB STATUS's LATEST DETECTED DEADLOCK section for the specific conflicting statements.
- "A table lingering as MyISAM causing unexpected non-transactional behavior" — audit with SHOW TABLE STATUS across the whole schema, not just the tables you suspect.
- "Replication lag growing unexpectedly" — check SHOW SLAVE STATUS's Seconds_Behind_Master, and investigate whether a single large, long-running write on the primary is the cause.
`,

  monitoring: `
Production MySQL visibility rests on the same three pillars as any production database, with MySQL-specific tooling and signals layered on top.

### Key metrics to track

- **innodb_buffer_pool_hit_ratio**: a low ratio suggests the buffer pool is undersized relative to the active working data set.
- **Replication lag (Seconds_Behind_Master)**: for any application routing reads to replicas, a growing lag risks serving stale data beyond acceptable tolerance.
- **Connection count relative to max_connections**: approaching the limit predicts connection-refused errors.
- **Lock wait counts and deadlock frequency**: an early warning for contention issues before they cascade.
- **Slow query log volume**: a rising trend in queries exceeding long_query_time predicts broader performance degradation.

### Tools

Percona Monitoring and Management (PMM, free and open-source) is a widely used, MySQL-specific monitoring stack built specifically for this ecosystem; Prometheus's mysqld_exporter is the standard choice for integrating MySQL metrics into a broader Prometheus/Grafana observability stack — see the **Prometheus** and **Grafana** skills.

### Alerting priorities

Alert on: replication lag exceeding an acceptable threshold, connection count approaching max_connections, disk space approaching capacity, buffer pool hit ratio trending downward, and any deadlock rate increase.
`,

  deployment: `
### Managed vs. self-hosted

~~~
Managed (Amazon RDS/Aurora, Google Cloud SQL, Azure Database for MySQL):
  + automated backups, patching, failover largely handled for you
  - Aurora specifically is a MySQL-COMPATIBLE proprietary engine, not vanilla MySQL —
    verify actual compatibility for any advanced feature dependency

Self-hosted (VMs or Kubernetes, e.g. via the Percona or Oracle MySQL Operator):
  + full control over configuration, storage engine choices, and version
  - operational responsibility for backups, failover, patching
~~~

### Backup strategy

~~~bash
mysqldump --single-transaction mydb > backup.sql    # logical backup; --single-transaction avoids locking InnoDB tables
xtrabackup --backup --target-dir=/backup             # Percona XtraBackup: physical, non-blocking hot backup
~~~

--single-transaction is essential for mysqldump against InnoDB tables specifically — it takes a consistent snapshot via InnoDB's MVCC rather than locking tables during the backup, avoiding a production-impacting write freeze.

### High availability

MySQL Group Replication and InnoDB Cluster provide built-in, consensus-based automatic failover; alternatively, Orchestrator (originally developed at Booking.com) is a widely used open-source tool for managing classic asynchronous replication topologies with automated failover detection.

### CI/CD pipeline

Schema migrations (via your framework's migration tool) run as an explicit, coordinated deploy step. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before a MySQL-backed application takes real traffic:

- [ ] Every production table confirmed to use InnoDB (audited via SHOW TABLE STATUS, not assumed)
- [ ] innodb_buffer_pool_size tuned to actual available RAM
- [ ] innodb_flush_log_at_trx_commit left at 1 unless a deliberate, documented tradeoff was made
- [ ] Primary keys chosen deliberately (monotonically increasing for high-write tables)
- [ ] Connection pooling (ProxySQL or application-level) configured
- [ ] SSL/TLS enabled for all connections
- [ ] Database credentials loaded from environment variables/a secrets manager
- [ ] Automated backups configured (mysqldump with --single-transaction, or XtraBackup for larger databases)
- [ ] Backup restoration actually tested
- [ ] Replication configured if read scaling or high availability is required, with lag monitored
- [ ] Slow query log enabled with an appropriate long_query_time threshold
- [ ] Performance Schema/sys schema enabled for query-load visibility
- [ ] Monitoring/alerting wired up for replication lag, connection count, and buffer pool hit ratio
- [ ] Schema migrations versioned and applied as an explicit, reviewed deploy step
- [ ] Load test done: known transactions/sec ceiling under realistic concurrent load
- [ ] Runbook: how to fail over, restore from backup, and roll back a bad migration
`,

  "common-mistakes": `
1. **Assuming a table is transactional without confirming its storage engine is InnoDB** — a lingering MyISAM table is a genuine, damaging production surprise.
2. **Choosing a poor primary key** (random-order, like an unordered UUID) for a high-write table, causing InnoDB clustered-index fragmentation and degraded insert performance.
3. **Not indexing foreign key/frequently-filtered columns**, invisible with small test data, severe at real production scale.
4. **Relying on the query cache mental model** — it was removed entirely in MySQL 8.0; applications must implement their own caching layer.
5. **Treating MariaDB and MySQL as perfectly interchangeable** without verifying compatibility for anything beyond the most basic SQL and features.
6. **Setting innodb_flush_log_at_trx_commit to 2 or 0 without understanding the durability tradeoff** being made.
7. **Not monitoring replication lag** when routing reads to replicas, risking silently serving stale data.
8. **Assuming isolation-level behavior identical to PostgreSQL** when porting application logic — MySQL/InnoDB's default REPEATABLE READ with next-key locking behaves meaningfully differently from PostgreSQL's default Read Committed.
9. **Not testing backup restoration**, discovering a gap only during an actual incident.
10. **Applying ad-hoc schema changes directly against production** instead of through a versioned, reviewed migration tool.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Duplicate entry for key PRIMARY | Attempting to insert a value that already exists in a unique/primary key column | Handle the conflict explicitly (INSERT ... ON DUPLICATE KEY UPDATE) or check existence first |
| Deadlock found when trying to get lock | Two transactions acquired locks in conflicting order | Check SHOW ENGINE INNODB STATUS's deadlock section; ensure consistent lock acquisition order |
| Too many connections | max_connections exceeded, often from missing connection pooling | Configure ProxySQL/connection pooling; reduce per-instance pool sizes |
| Table doesn't exist / Unknown table | A migration wasn't applied in this environment, or a typo in the table name | Verify migrations have run in this environment |
| Lock wait timeout exceeded | A transaction waited too long for a lock held by another transaction | Investigate the blocking transaction (SHOW ENGINE INNODB STATUS); consider shortening transaction duration |
| Data too long for column | Attempting to insert a value exceeding a VARCHAR/column's defined length | Validate input length before insertion, or widen the column if genuinely needed |
| Incorrect string value | Inserting data (often emoji or certain Unicode) incompatible with the table's character set | Use utf8mb4 (not the legacy, incomplete utf8) as the connection and column character set |
`,

  faqs: `
**MySQL or PostgreSQL for a new project?**
Both are mature, production-proven relational databases. PostgreSQL generally offers a richer type system, stronger extensibility (JSONB, pgvector, PostGIS), and stricter standards compliance; MySQL offers a historically simpler replication story, an enormous existing ecosystem (especially PHP/WordPress-adjacent), and, via InnoDB, comparable transactional guarantees for most practical needs. See the **PostgreSQL** skill for the direct comparison.

**MySQL or MariaDB?**
MariaDB began as a drop-in MySQL replacement specifically motivated by community concern over Oracle's stewardship, but the two have diverged meaningfully over a decade-plus — verify compatibility for anything beyond basic SQL before assuming interchangeability. Choose MariaDB if community governance (versus single-vendor Oracle control) is a priority; choose MySQL if you need Oracle-specific features (MySQL HeatWave, certain Enterprise features) or want the most widely-documented, largest-installed-base option.

**Is MyISAM ever still appropriate?**
Rarely, for new applications — InnoDB has matured to cover nearly every use case MyISAM historically served better (including full-text search, which InnoDB now supports natively). Confirm any existing MyISAM table's presence is intentional, not a legacy artifact, before assuming it should stay that way.

**Why does MySQL default to REPEATABLE READ while PostgreSQL defaults to Read Committed?**
Different historical design decisions about the tradeoff between consistency guarantees and concurrency — MySQL/InnoDB's REPEATABLE READ default, combined with next-key locking, provides stronger default protection against certain anomalies at some concurrency cost, while PostgreSQL's Read Committed default prioritizes concurrency, with stricter isolation available on request. Neither default is universally "more correct" — they reflect different design philosophies.

**What is Vitess, and when would I need it?**
Vitess (originally built at YouTube) provides transparent sharding and connection management for MySQL at very large scale, letting an application interact with what appears to be a single large database while Vitess handles distribution across many underlying MySQL instances — relevant once a single MySQL primary's write capacity genuinely becomes a bottleneck that vertical scaling and read replicas can't address.

**Does MySQL support vector search for RAG applications?**
Less natively than PostgreSQL's pgvector — MySQL HeatWave (a commercial Oracle Cloud offering) provides vector search capabilities, but the open-source MySQL Community Edition lacks a widely-adopted, first-party equivalent to pgvector as of this page's knowledge cutoff; teams needing vector search alongside MySQL more commonly pair it with a separate dedicated vector database.
`,

  "interview-questions": `
### Junior level

1. **What is a storage engine in MySQL, and why does it matter?**
   Model answer: The storage engine is the underlying component actually handling data storage, retrieval, and locking for a table; MySQL's pluggable architecture lets different tables use different engines (InnoDB for transactions, MyISAM for legacy needs), meaning a table's actual guarantees (transactions, locking granularity) depend on which engine it uses, not just on MySQL as a whole.

2. **Why did InnoDB become MySQL's default storage engine?**
   Model answer: InnoDB provides full ACID transaction support, row-level locking, and foreign key enforcement, which MyISAM (the prior default) lacked entirely — as MySQL's usage grew into more transaction-sensitive applications, InnoDB's guarantees became necessary for the majority of production use cases.

3. **What does EXPLAIN's type: ALL mean?**
   Model answer: A full table scan — MySQL is examining every row rather than using an index, almost always a signal that an appropriate index is missing for the query's filter condition.

4. **What is the difference between MySQL and MariaDB?**
   Model answer: MariaDB is a 2009 community-governed fork of MySQL, created partly in response to Oracle's 2010 acquisition of MySQL's steward (Sun Microsystems); the two have diverged over time and are not perfectly interchangeable for every feature today.

5. **Why should you avoid a random-order UUID as a primary key in a high-write MySQL table?**
   Model answer: InnoDB physically stores table data in primary key order (a clustered index); a random-order key causes expensive page splits as new rows insert into the middle of existing data, versus a monotonically increasing key that simply appends efficiently.

### Senior level

6. **Explain InnoDB's clustered index architecture and why a secondary index lookup requires two index traversals.**
   Model answer: InnoDB stores the table's actual row data physically ordered by the primary key (the clustered index); a secondary index stores the primary key value (not a direct row pointer) for each indexed value, so looking up a row via a secondary index requires first finding the primary key value in the secondary index, then traversing the clustered index to fetch the actual row — a "covering index" (containing all needed columns) avoids this second traversal.

7. **What is next-key locking, and why does InnoDB use it?**
   Model answer: InnoDB's default REPEATABLE READ isolation level uses next-key locking — combining row locks with gap locks on the space between index entries — specifically to prevent phantom reads (new rows appearing in a repeated range query within the same transaction), a stronger default protection than PostgreSQL's Read Committed default provides, at some added locking/concurrency cost.

8. **How does MySQL's binary-log-based replication work, and what's the difference between asynchronous and semi-synchronous replication?**
   Model answer: The primary writes all changes to a binary log; replicas read and apply this log to stay in sync. Asynchronous replication (the default) doesn't wait for any replica to acknowledge before considering a commit successful (risking data loss if the primary fails before a replica catches up); semi-synchronous replication requires at least one replica to acknowledge receipt first, reducing (not eliminating) this risk at some latency cost.

9. **Why was MySQL's query cache removed in version 8.0, and what replaced it architecturally?**
   Model answer: The query cache invalidated ALL cached results for a table on any write to it, creating a severe bottleneck under concurrent write load that got worse, not better, as concurrency increased; it was removed entirely, and modern MySQL applications implement their own caching layer (Redis, Memcached) at the application level instead.

10. **How would you diagnose and resolve a growing replication lag issue?**
    Model answer: Check SHOW SLAVE STATUS's Seconds_Behind_Master to confirm and quantify the lag; investigate whether a single large, long-running write (or a burst of writes) on the primary is overwhelming the replica's single-threaded (in classic replication) apply process, and consider parallel replication settings or semi-synchronous replication if consistency guarantees during the lag window are a concern.

11. **What is Vitess, and what problem does it solve that a single MySQL instance and read replicas cannot?**
    Model answer: Vitess provides transparent sharding across many MySQL instances, letting an application interact with what appears to be a single large database while Vitess routes queries to the correct shard — solving the write-scaling ceiling a single primary eventually hits, which read replicas (which only help read-heavy load) don't address.

12. **What security features are Enterprise-only in MySQL, and why does this matter for architecture decisions?**
    Model answer: Transparent data encryption and detailed audit logging are Oracle MySQL Enterprise (commercial) features, not available in the open-source Community Edition — teams needing these capabilities on open-source MySQL either adopt Percona Server's open-source equivalents, choose MariaDB (which has kept more security features open-source), or accept the Enterprise licensing cost, a genuine architectural and procurement decision distinct from PostgreSQL's fully-open-source equivalent feature set.
`,

  "coding-questions": `
### 1. Find the second-highest salary per department using window functions (MySQL 8.0+)

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
-- Requires MySQL 8.0+ for window function support; MySQL 5.7 would need a
-- correlated subquery or self-join instead.
-- Follow-up: how would you write the equivalent query for a pre-8.0 MySQL version?
~~~

### 2. Design an efficient covering index for a hot query path

~~~sql
-- Query pattern: fetch a user's recent post titles, ordered by date
SELECT title, published_at FROM posts WHERE author_id = 42 ORDER BY published_at DESC LIMIT 10;

-- A covering index includes ALL columns the query needs, avoiding the
-- clustered-index lookup entirely:
CREATE INDEX idx_posts_covering ON posts(author_id, published_at, title);
-- Follow-up: why must author_id be the FIRST column in this composite index,
-- and what would happen to this index's usefulness if the query instead
-- filtered on published_at alone without author_id?
~~~

### 3. Implement a safe upsert (insert or update) pattern

~~~sql
INSERT INTO product_views (product_id, view_count)
VALUES (42, 1)
ON DUPLICATE KEY UPDATE view_count = view_count + 1;
-- Requires a UNIQUE or PRIMARY KEY constraint on product_id for this to work correctly.
-- Time: one atomic statement instead of a separate SELECT-then-INSERT-or-UPDATE,
-- which would be vulnerable to a race condition under concurrent requests.
-- Follow-up: how does MySQL's ON DUPLICATE KEY UPDATE compare to PostgreSQL's
-- INSERT ... ON CONFLICT DO UPDATE, and are there any behavioral differences
-- worth knowing when porting SQL between the two?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Design and query a normalized schema
Design a normalized schema for a small blog application (users, posts, comments), explicitly setting ENGINE=InnoDB, with appropriate foreign keys and indexes. Deliverable: a working schema and a set of correct queries. Skills exercised: schema design, InnoDB basics, joins.

### Lab 2 (Intermediate): Diagnose and fix a slow query with EXPLAIN
Given a query with a missing index (type: ALL in EXPLAIN), diagnose and fix it, then verify the improvement. Deliverable: a documented before/after comparison. Skills exercised: EXPLAIN, indexing strategy.

### Lab 3 (Advanced): Set up replication and measure lag under load
Configure a primary with a binary-log-based read replica, generate write load on the primary, and measure/monitor replication lag under varying load. Deliverable: a documented replication setup with lag measurements. Skills exercised: replication, monitoring, SHOW SLAVE STATUS.

### Lab 4 (Production): Audit storage engines and tune InnoDB configuration
Given a database with a mix of storage engines (some deliberately MyISAM), audit and convert appropriately, then tune innodb_buffer_pool_size and related settings for a target hardware profile. Deliverable: a production-checklist-compliant configuration with before/after benchmarks. Skills exercised: storage engine auditing, InnoDB tuning, the full production checklist.
`,

  "real-projects": `
### 1. A WordPress-adjacent content platform with custom AI features
Engineering requirements: extending an existing MySQL-backed WordPress (or WordPress-like) database with new tables for AI-generated content metadata, ensuring new tables explicitly use InnoDB, adding appropriate indexes for the new query patterns, and integrating a caching layer (Redis) for AI-feature-specific hot data given MySQL's lack of a built-in query cache. Demonstrates the extremely common "extend an existing MySQL application with new AI functionality" scenario.

### 2. A sharded, high-write-volume analytics ingestion pipeline using Vitess
Engineering requirements: a MySQL/Vitess-based system ingesting high-volume event data, sharded appropriately across many underlying MySQL instances, with careful primary key design to avoid clustered-index fragmentation at the target write volume. Demonstrates production-grade MySQL scaling patterns for a genuinely high-throughput workload.

### 3. A migration project moving a legacy MyISAM-heavy schema to InnoDB
Engineering requirements: auditing an existing production database's storage engines, planning a safe, staged migration of MyISAM tables to InnoDB (accounting for locking behavior changes and any application code assuming MyISAM-specific behavior), and verifying data integrity throughout. Demonstrates a genuinely common real-world MySQL modernization project.
`,

  "case-studies": `
### Facebook's MyRocks and MySQL at extreme scale
Facebook's development of MyRocks (a RocksDB-based storage engine optimized for their specific write-heavy, storage-efficiency-focused workload) and their broader public engineering content on operating MySQL at truly massive scale demonstrate that MySQL's pluggable storage engine architecture isn't just a historical artifact — it remains a genuinely active mechanism for extreme-scale operators to tailor MySQL's underlying storage behavior to their specific needs without abandoning the SQL interface and existing tooling ecosystem. Lesson: architectural flexibility designed in decades earlier (the pluggable engine layer) can pay off in ways its original designers never specifically anticipated.

### The 2010 Oracle acquisition and the MariaDB fork
Oracle's acquisition of Sun Microsystems (and with it, MySQL) in 2010 triggered genuine community concern given Oracle's position as a competing commercial database vendor, leading directly to the MariaDB fork by several of MySQL's original creators. Unlike the Node.js/io.js split's eventual reunification, MySQL and MariaDB have remained permanently separate projects with genuinely diverging feature sets over more than a decade. Lesson: not every open-source governance fork reunites — sometimes a permanent split, with both projects continuing independently, is the actual long-term outcome, and teams must make a genuine, lasting choice between them rather than assuming eventual convergence.

### Uber's PostgreSQL-to-MySQL migration
Uber's widely discussed early migration from PostgreSQL to MySQL, citing specific replication and operational considerations at the time, became a frequently cited (and sometimes debated) case study in database choice tradeoffs — illustrating that "which database is better" answers are frequently workload-, era-, and team-expertise-specific rather than universal, timeless truths; the same tradeoffs that motivated Uber's choice at that specific time and scale don't necessarily generalize to every team's situation today.

### YouTube's Vitess origin story
YouTube's development of Vitess to solve MySQL sharding at their own massive scale, later open-sourced and eventually adopted as a CNCF graduated project used by Slack, GitHub, and others, is a direct parallel to Skype's PgBouncer story for PostgreSQL — a company's internal solution to a genuine, widely-shared scaling pain point becoming foundational, ecosystem-wide infrastructure once open-sourced.
`,

  comparisons: `
| Aspect | MySQL | MariaDB | PostgreSQL | SQLite |
|--------|-------|---------|-----------|--------|
| Governance | Oracle-controlled | Community/foundation-governed | Neutral, community-governed | Public domain, small core team |
| Default storage/isolation | InnoDB, REPEATABLE READ default | InnoDB/Aria, similar defaults | Native, Read Committed default | Single-file, serializable-like |
| Extensibility | Limited, mostly engine-level | Limited, its own engines (Aria, MyRocks) | Very high (pgvector, PostGIS, hundreds more) | Very limited (embedded use case) |
| Replication maturity | Very mature, widely used (Vitess for scale) | Similar, plus its own Galera Cluster option | Mature (streaming + logical) | Not applicable |
| Vector search | Limited (Enterprise HeatWave only) | Limited | pgvector, widely adopted | Not applicable |
| Best fit | WordPress/PHP-adjacent web apps, existing MySQL investment | Same as MySQL, community-governance priority | Correctness-critical, extensible, hybrid relational+vector apps | Embedded/local apps, mobile, testing |

**How seniors choose**: reach for MySQL when integrating with an existing MySQL-centric ecosystem (WordPress, established PHP applications) or needing Oracle-specific Enterprise features; reach for MariaDB when community governance matters and MySQL-compatible SQL suffices; reach for PostgreSQL when extensibility (especially pgvector for AI applications), a richer type system, or stricter standards compliance are priorities; reach for SQLite for embedded, local-first, or lightweight testing scenarios.
`,

  "related-technologies": `
- **PostgreSQL** — the other dominant open-source relational database, essential as a direct comparison; see the **PostgreSQL** skill.
- **MariaDB** (referenced throughout, not a separate platform skill) — the community-governed fork born from the 2010 Oracle acquisition.
- **Redis** — the common complementary caching layer, especially important given MySQL 8.0's removal of the built-in query cache.
- **Vitess** — the CNCF-graduated sharding and connection-management project for MySQL at extreme scale.
- **Django**, **FastAPI**, **Spring Boot**, **Express**/**NestJS** — backend frameworks whose ORMs commonly support MySQL as an alternative to PostgreSQL.
- **Docker** and **Kubernetes** — how MySQL is commonly containerized and orchestrated, or replaced by a managed cloud offering (Amazon RDS/Aurora, Google Cloud SQL).
- **Distributed Systems** — the general theory underlying MySQL's replication and Vitess-based sharding capabilities.

Learning path: basic SQL → **PostgreSQL** for a useful contrast → this page → **Redis** for the complementary caching layer → your chosen backend framework's ORM patterns → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **MySQL 8.0.x** remains the current major line, with continued incremental performance and replication improvements; MySQL 9.0 (an "innovation release" outside the traditional LTS numbering) has begun appearing in Oracle's release cadence, worth verifying current LTS-vs-innovation-release guidance before a production commitment.
- **MySQL HeatWave** (Oracle Cloud's analytics/ML/vector-search-enabled MySQL offering) continues expanding its feature set, including vector search capabilities not present in the open-source Community Edition — verify current feature availability if evaluating MySQL for a vector-search-dependent AI application.
- **MariaDB** continues its independent release cadence and feature divergence from MySQL, including its own vector search work in recent versions — verify current MariaDB-specific capabilities rather than assuming MySQL feature parity.
- Given MySQL's Oracle-controlled governance and commercial/community edition feature split, verify current Enterprise-versus-Community feature boundaries before committing to a specific security or scaling feature for a new project.
`,

  "future-roadmap": `
Where MySQL is heading, and what's worth betting career time on:

- **Continued MySQL HeatWave investment** for analytics and AI-adjacent workloads, though remaining a commercial, Oracle Cloud-specific offering rather than open-source Community Edition functionality.
- **MariaDB's continued independent divergence**, including its own vector search and analytics investments, worth tracking separately from MySQL's own roadmap given the two projects' permanent split.
- **Vitess's continued maturation** as the standard, CNCF-backed answer to MySQL sharding at extreme scale, likely to remain the dominant open-source approach for teams needing this specific capability.
- **What to bet on**: deep fluency in InnoDB's clustered index architecture and locking behavior, EXPLAIN-driven query optimization, and understanding the practical MySQL-versus-PostgreSQL-versus-MariaDB tradeoffs — these fundamentals remain valuable regardless of which specific new feature lands in Oracle's or MariaDB's next release, and matter practically given how much existing production infrastructure runs on MySQL specifically.
`,

  "cheat-sheet": `
~~~sql
-- ---- Schema basics ----
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author_id INT,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;                        -- ALWAYS be explicit about the engine
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- ---- Confirm a table is transactional ----
SHOW TABLE STATUS LIKE 'posts';          -- check the Engine column

-- ---- Transactions ----
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- ---- Diagnose a slow query ----
EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id = 42;   -- watch for type: ALL

-- ---- JSON ----
SELECT payload->>'$.type' FROM events WHERE payload->>'$.user_id' = '42';

-- ---- Window functions and CTEs (MySQL 8.0+) ----
WITH active AS (SELECT author_id FROM posts GROUP BY author_id HAVING COUNT(*) > 3)
SELECT * FROM users JOIN active ON users.id = active.author_id;

RANK() OVER (PARTITION BY author_id ORDER BY published_at DESC)

-- ---- Safe upsert ----
INSERT INTO views (product_id, count) VALUES (42, 1)
ON DUPLICATE KEY UPDATE count = count + 1;

-- ---- Replication check ----
SHOW SLAVE STATUS;   -- watch Seconds_Behind_Master

-- ---- Production ----
-- innodb_buffer_pool_size tuned to ~60-70% of RAM
-- innodb_flush_log_at_trx_commit = 1 (never lower without a deliberate tradeoff)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is a storage engine? | The pluggable component actually handling a table's storage, locking, and transactions. |
| Why did InnoDB replace MyISAM as default? | Full ACID transactions, row-level locking, foreign keys — MyISAM had none of these. |
| What does EXPLAIN's type: ALL mean? | A full table scan — almost always fixable with an appropriate index. |
| Why avoid random-order UUID primary keys? | InnoDB stores rows IN primary key order (clustered index) — random keys cause fragmentation. |
| What is a covering index? | An index containing all needed columns, avoiding the secondary-to-clustered double lookup. |
| MySQL's default isolation level? | REPEATABLE READ (stricter than PostgreSQL's Read Committed default). |
| What is next-key locking? | Row locks + gap locks, preventing phantom reads under REPEATABLE READ. |
| Why was the query cache removed in 8.0? | Any write invalidated ALL cached queries on that table — a severe bottleneck at concurrency. |
| MySQL vs MariaDB? | A 2009 community fork, motivated by Oracle's 2010 acquisition — diverged significantly since. |
| What is Vitess for? | Transparent sharding across many MySQL instances at extreme write scale (built at YouTube). |
| What must you verify with --single-transaction? | mysqldump uses it to snapshot InnoDB tables without locking them during backup. |
| What is innodb_flush_log_at_trx_commit=1? | Full ACID durability (safe default) — lower values trade it for speed. |
| Does MySQL have vector search built in? | Not in Community Edition — HeatWave (commercial) has it; pgvector remains PostgreSQL's edge. |
`,

  mcqs: `
1. What guarantees does a MyISAM table lack that InnoDB provides?
   A) SELECT support  B) Transactions, row-level locking, foreign keys  C) Indexes  D) Column types
   **Answer: B** — the core reason InnoDB became the default engine.

2. Why does primary key choice matter more in InnoDB than in some other databases?
   A) It doesn't matter  B) InnoDB physically stores rows in primary key order (clustered index)  C) MySQL requires integer primary keys  D) Only for replication purposes
   **Answer: B** — random-order keys cause page-split fragmentation on high-write tables.

3. What does EXPLAIN's "type: ALL" indicate?
   A) All indexes are being used  B) A full table scan, usually fixable with an index  C) A syntax error  D) The query is optimal
   **Answer: B** — the single most important EXPLAIN signal to check first.

4. Why was MySQL's query cache removed in version 8.0?
   A) It was rarely used  B) Any write invalidated all cached results for that table — a severe concurrency bottleneck  C) It was replaced by InnoDB  D) Licensing issues
   **Answer: B** — applications now need their own caching layer (Redis).

5. What motivated the creation of MariaDB in 2009-2010?
   A) A performance improvement  B) Community concern over Oracle's acquisition and stewardship of MySQL  C) A new SQL standard  D) MySQL was being discontinued
   **Answer: B** — a governance-driven fork, not a technical one.

6. What is Vitess primarily used for?
   A) Query caching  B) Transparent sharding across many MySQL instances at extreme scale  C) Password encryption  D) JSON validation
   **Answer: B** — originally built at YouTube, now a CNCF graduated project.
`,

  "revision-notes": `
MySQL is the world's most widely deployed open-source relational database, distinguished architecturally by its pluggable storage engine layer — the same SQL interface sits atop swappable engines, most importantly InnoDB (the default since 5.5, providing full ACID transactions, row-level locking, and foreign keys) versus the legacy MyISAM engine (no transactions, table-level locking) that predates it. This means, unlike PostgreSQL where every table always has identical guarantees, MySQL requires explicitly confirming a table's actual storage engine before assuming it behaves transactionally — a lingering MyISAM table is a genuine, common production surprise.

InnoDB's clustered index architecture is MySQL's most consequential internal-working fact: table data is physically stored in PRIMARY KEY order, meaning a well-chosen, monotonically increasing primary key (AUTO_INCREMENT) keeps inserts efficient, while a random-order key (an unordered UUID) causes expensive page splits and fragmentation. Every secondary index stores the primary key value rather than a direct row pointer, meaning a secondary index lookup requires TWO index traversals unless the query can be satisfied by a "covering index" containing every needed column — a distinctly MySQL/InnoDB performance consideration without a direct PostgreSQL equivalent.

MySQL/InnoDB's default isolation level is REPEATABLE READ (stricter than PostgreSQL's Read Committed default), implemented via "next-key locking" — combining row locks and gap locks to prevent phantom reads, with real behavioral and deadlock-pattern consequences distinct from PostgreSQL's MVCC-based approach to similar guarantees. Application logic ported between the two databases should never assume identical isolation behavior without verification.

The 2010 Oracle acquisition of MySQL's steward (Sun Microsystems) triggered the MariaDB fork, created by several of MySQL's original developers specifically over governance concerns — unlike Node.js's io.js fork, MySQL and MariaDB have remained permanently, independently diverging projects for over a decade, meaning "MySQL-compatible" no longer guarantees identical behavior for anything beyond basic SQL. MySQL's query cache (a built-in result cache) was removed entirely in version 8.0 because any write invalidated all cached queries referencing that table, a severe bottleneck under concurrent write load — modern MySQL applications must implement their own caching layer (Redis) rather than relying on a database-level query cache.

MySQL's scaling story mirrors PostgreSQL's vertical-first, horizontal-with-effort profile, though MySQL's replication maturity (binary-log-based, historically simpler to set up) and specific large-scale tooling (Vitess, built at YouTube for transparent sharding; MyRocks, built at Facebook for storage efficiency at extreme scale) give it particularly well-trodden, production-proven paths for certain scaling patterns. EXPLAIN (and EXPLAIN ANALYZE since 8.0.18) remains the essential first diagnostic tool for any slow-query investigation, with type: ALL (a full table scan) as the most common, most fixable signal.
`,

  "learning-roadmap": `
**Week 1 — Schema and storage engine fundamentals**: tables, constraints, foreign keys, and understanding InnoDB versus MyISAM's guarantees. Milestone: design and query a normalized schema, confirming every table explicitly uses InnoDB.

**Week 2 — Transactions and indexing**: ACID properties via InnoDB, basic indexing, and using EXPLAIN to diagnose a deliberately slow query. Milestone: fix a missing-index scenario, documenting the before/after EXPLAIN output.

**Week 3 — InnoDB internals**: clustered index architecture, primary key choice, covering indexes, and isolation levels (REPEATABLE READ, next-key locking). Milestone: design an efficient covering index for a given hot query pattern.

**Week 4 — Modern SQL features and JSON**: CTEs and window functions (MySQL 8.0+), JSON column usage and indexing, generated columns. Milestone: rewrite a correlated-subquery-based query using a window function instead.

**Week 5 — Replication and scaling**: binary log replication, read/write routing, and an introduction to Vitess for sharding at scale. Milestone: set up a primary and a read replica, demonstrating and monitoring replication lag.

**Week 6 — Production practices**: connection pooling (ProxySQL), backup/restore (mysqldump with --single-transaction, or XtraBackup), monitoring (Performance Schema, PMM), and security. Milestone: complete the Lab 4 hands-on project end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Redis** for the complementary caching layer (essential given MySQL 8.0's removed query cache), or **PostgreSQL** for a deeper direct comparison.
`,

  "official-docs": `
- **dev.mysql.com/doc** — the official MySQL documentation, the primary reference for every SQL feature, configuration parameter, and storage engine detail referenced throughout this page.
- **mariadb.com/kb** — the official MariaDB Knowledge Base, essential for understanding where MariaDB has diverged from MySQL specifically.
- **vitess.io/docs** — the official Vitess documentation for sharding and scaling MySQL at extreme scale.
- **dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html** — the official InnoDB storage engine documentation, essential depth beyond this page's overview.
- **proxysql.com/documentation** — the official ProxySQL documentation for connection pooling and read/write routing configuration.
`,

  books: `
- **"High Performance MySQL" (4th ed.) — Silvia Botros and Jeremy Tinley** — the definitive, widely recommended deep dive on MySQL performance, replication, and production operations, matching this page's Performance and Scalability sections in depth.
- **"MySQL 8 Query Performance Tuning" — Jesper Wisborg Krogh** — focused specifically on the EXPLAIN-driven optimization workflow covered in this page's Performance section.
- **"Learning MySQL" (2nd ed.) — Vinicius M. Grippa and Sergey Kuzmichev** — a practical, broad introduction covering the full breadth of MySQL's features.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not MySQL-specific, but essential foundational reading for the replication and distributed-systems concepts underlying this page's Scalability section.
`,

  blogs: `
- **The official MySQL Server Blog (dev.mysql.com/blog-archive)** — release announcements and deep technical posts directly from the MySQL team at Oracle.
- **Percona's blog** — consistently excellent, practical MySQL content spanning performance tuning, InnoDB internals, and open-source alternatives to Enterprise-only features.
- **The Facebook/Meta engineering blog** — periodic posts on MyRocks and operating MySQL at extreme scale, directly relevant to this page's Case Studies section.
- **The Vitess blog and YouTube Engineering's historical posts** — deep content on sharding MySQL, directly relevant to this page's Scalability section.
`,

  "research-papers": `
MySQL itself, as a widely deployed production system rather than a research project, has relatively little dedicated academic literature of its own — the most relevant foundational reading concerns transaction processing and replication theory applicable across relational databases generally:

- **Gray, J. and Reuter, A. — "Transaction Processing: Concepts and Techniques"** (1992) — the same foundational transaction-processing text referenced in the **PostgreSQL** skill, directly applicable to understanding InnoDB's locking and isolation mechanisms.
- **The MySQL/InnoDB team's own published documentation on next-key locking and gap locking** (part of the official reference manual rather than a formal paper) is the closest primary source for the specific locking mechanism InnoDB implements for REPEATABLE READ.
- For the sharding architecture underlying Vitess, see general distributed-systems literature on sharding and consistent hashing referenced in the **Distributed Systems** skill — Vitess's own design documents (available via its GitHub repository) provide the closest primary-source explanation of its specific approach.
`,

  videos: `
- **Percona Live conference talks** (widely available on YouTube) — the primary annual conference for the MySQL/MariaDB ecosystem, featuring deep talks from core contributors, Percona engineers, and large-scale production users.
- **Oracle's official MySQL YouTube channel** — release announcements and feature deep-dives directly from the MySQL team.
- **"Use the Index, Luke!" (Markus Winand)** — the same indexing-focused resource referenced in the **PostgreSQL** skill, with MySQL-specific sections covering InnoDB's clustered index behavior specifically.
- **Vitess Conference talks** — covering sharding architecture and production experience from companies operating Vitess at scale.
- **Facebook/Meta's engineering conference talks** on MyRocks and MySQL at extreme scale — directly relevant to this page's Case Studies section.
`,

  "github-repos": `
- **mysql/mysql-server** — the official MySQL server source, useful for understanding the SQL layer and storage engine interface directly (advanced reading).
- **MariaDB/server** — the MariaDB fork's own source, useful for understanding exactly where and how it has diverged from MySQL over time.
- **vitess/vitess** — the sharding and scaling project originally built at YouTube, now CNCF-graduated.
- **facebook/mysql-5.6** (and successor MyRocks-related repositories) — Facebook's MySQL fork incorporating MyRocks, referenced in Case Studies.
- **percona/percona-server** — Percona's MySQL fork, notable for including several Enterprise-equivalent features (like audit logging) in an open-source release.
- **sysown/proxysql** — the connection pooling and read/write routing tool referenced throughout Production Usage and Deployment.
- **github/gh-ost** — GitHub's own online schema migration tool for MySQL, a widely used, production-proven approach to zero-downtime schema changes on large tables.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Schema and storage engines**: given a database with mixed storage engines, audit and identify which tables lack transactional guarantees, then plan a safe conversion to InnoDB.
2. **Query optimization**: given a slow query and its EXPLAIN output showing type: ALL, identify and add the correct index, verifying the improvement.
3. **Covering indexes**: design a covering index for a specific hot query pattern, and explain why column order in the composite index matters.
4. **Window functions and CTEs**: solve a ranking/reporting problem using MySQL 8.0's window functions, then write the equivalent pre-8.0 query using a correlated subquery or self-join for comparison.
5. **Replication**: set up a primary/replica pair, generate write load, and observe/diagnose replication lag under varying conditions.
6. **External practice sets**: the official MySQL tutorial for structured, guided practice; "Use the Index, Luke!" for indexing-specific exercises applicable across MySQL and PostgreSQL; LeetCode's SQL track for interview-style query problems.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application servers\n(stateless, many instances)"] --> ProxySQL["ProxySQL\n(connection pooling,\nread/write routing)"]
    ProxySQL --> Primary[("MySQL primary\n(InnoDB, accepts writes)")]
    Primary -->|binary log replication| Replica1[("Read replica 1")]
    Primary -->|binary log replication| ReplicaN[("Read replica N")]
    ProxySQL -->|read queries| Replica1
    ProxySQL -->|read queries| ReplicaN
    App --> Cache[("Redis\ncomplementary caching layer -\nreplaces the removed query cache")]
    subgraph Scaling["At extreme scale"]
        Vitess["Vitess\n(transparent sharding)"]
    end
    Primary -.-> Scaling
    subgraph Observability
        PerfSchema["Performance Schema"]
        PMM["Percona Monitoring\nand Management"]
    end
    Primary -.-> PerfSchema
    PerfSchema -.-> PMM
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((MySQL))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Storage Engines
      InnoDB
      MyISAM legacy
      Pluggable architecture
      Choosing the right engine
    InnoDB Internals
      Clustered index
      Secondary index lookups
      Next-key locking
      Isolation levels
    Query Optimization
      EXPLAIN and EXPLAIN ANALYZE
      Covering indexes
      Composite index order
      Generated columns
    Modern SQL
      JSON columns
      CTEs and window functions
      MySQL 8.0 vs 5.7
    Scaling and HA
      Binary log replication
      ProxySQL
      Vitess sharding
      MyRocks at scale
    Ecosystem
      MySQL vs MariaDB
      Governance history
      Vector search limitations
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default mysql;
