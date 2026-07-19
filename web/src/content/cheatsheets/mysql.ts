import type { CheatSheetData } from "./types";

const mysql: CheatSheetData = {
  title: "The Ultimate MySQL Cheat Sheet",
  subtitle: "Storage engines · InnoDB internals · indexing · production toolbelt",
  sections: [
    {
      title: "Schema Basics",
      color: "violet",
      rows: [
        { term: "Table with engine", desc: "ALWAYS be explicit about the storage engine", code: "CREATE TABLE posts (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  title VARCHAR(200)\n) ENGINE=InnoDB;" },
        { term: "Foreign key", desc: "Only enforced by engines that support it (InnoDB does)", code: "FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE" },
        { term: "Index a foreign key", desc: "Not automatic — always add explicitly", code: "CREATE INDEX idx_posts_author_id ON posts(author_id);" },
        { term: "Confirm the engine", desc: "Never assume a table is transactional — check", code: "SHOW TABLE STATUS LIKE 'posts';" },
      ],
    },
    {
      title: "Transactions & InnoDB",
      color: "blue",
      rows: [
        { term: "Transaction", desc: "Only atomic on InnoDB — MyISAM has none of this", code: "START TRANSACTION;\nUPDATE a SET bal=bal-100 WHERE id=1;\nUPDATE b SET bal=bal+100 WHERE id=2;\nCOMMIT;" },
        { term: "Clustered index", desc: "InnoDB stores rows physically IN primary key order", code: "// Random-order UUID PKs cause page-split fragmentation on writes" },
        { term: "Default isolation level", desc: "REPEATABLE READ — stricter than Postgres's default", code: "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;" },
        { term: "Next-key locking", desc: "Row locks + gap locks to prevent phantom reads", code: "// A REPEATABLE READ-specific mechanism, different from PG's MVCC" },
        { term: "Safe upsert", desc: "Atomic insert-or-update, avoids a race condition", code: "INSERT INTO views (id, count) VALUES (42, 1)\nON DUPLICATE KEY UPDATE count = count + 1;" },
      ],
    },
    {
      title: "Query Optimization",
      color: "emerald",
      rows: [
        { term: "Diagnose a slow query", desc: "Watch for type: ALL — a full table scan", code: "EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id=42;" },
        { term: "Covering index", desc: "Contains every needed column — avoids the 2nd lookup", code: "CREATE INDEX idx_covering ON posts(author_id, published_at, title);" },
        { term: "Composite index column order", desc: "Leftmost column must match the query's filter", code: "// (author_id, date) helps filtering on author_id alone or both — NOT date alone" },
        { term: "JSON column", desc: "MySQL's JSON path syntax differs from Postgres's ->", code: "SELECT payload->>'$.type' FROM events\nWHERE payload->>'$.user_id' = '42';" },
      ],
    },
    {
      title: "Modern SQL (8.0+)",
      color: "amber",
      rows: [
        { term: "CTE", desc: "Only since MySQL 8.0 — 5.7 needs a subquery instead", code: "WITH active AS (SELECT author_id FROM posts GROUP BY author_id HAVING COUNT(*)>3)\nSELECT * FROM users JOIN active ON users.id=active.author_id;" },
        { term: "Window function", desc: "Also new in 8.0", code: "RANK() OVER (PARTITION BY author_id ORDER BY published_at DESC)" },
        { term: "Generated column", desc: "STORED = indexable; VIRTUAL = computed on read", code: "total DECIMAL(10,2) AS (price * quantity) STORED" },
      ],
    },
    {
      title: "Replication & Scaling",
      color: "rose",
      rows: [
        { term: "Check replication lag", desc: "The single most important replica health metric", code: "SHOW SLAVE STATUS;   -- watch Seconds_Behind_Master" },
        { term: "Read/write routing", desc: "ProxySQL — MySQL's PgBouncer-equivalent", code: "// writes -> primary hostgroup, reads -> replica hostgroup" },
        { term: "Extreme write scale", desc: "Transparent sharding (built at YouTube)", code: "// Vitess: shard across many MySQL instances behind one interface" },
        { term: "Query cache is GONE", desc: "Removed in 8.0 — bring your own cache", code: "// Use Redis for hot query results, not MySQL's own cache" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Key config tuning", desc: "The single highest-leverage InnoDB setting", code: "innodb_buffer_pool_size = 8G   -- ~60-70% of available RAM" },
        { term: "Durability setting", desc: "Never lower without a deliberate, documented tradeoff", code: "innodb_flush_log_at_trx_commit = 1   -- full ACID (safe default)" },
        { term: "Safe hot backup", desc: "Avoids locking InnoDB tables during the dump", code: "mysqldump --single-transaction mydb > backup.sql" },
        { term: "Live query/lock inspection", desc: "Find long-running or blocked queries", code: "SHOW FULL PROCESSLIST;\nSHOW ENGINE INNODB STATUS;" },
        { term: "MySQL vs MariaDB", desc: "Diverged since the 2010 Oracle acquisition — verify features", code: "// Not perfectly interchangeable beyond basic SQL" },
      ],
    },
  ],
};

export default mysql;
