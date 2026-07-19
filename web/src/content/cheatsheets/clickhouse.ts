import type { CheatSheetData } from "./types";

const clickhouse: CheatSheetData = {
  title: "The Ultimate ClickHouse Cheat Sheet",
  subtitle: "Columnar storage · MergeTree design · batch inserts · production toolbelt",
  sections: [
    {
      title: "Table Design",
      color: "violet",
      rows: [
        { term: "MergeTree basics", desc: "The foundational table engine", code: "CREATE TABLE events (\n  event_time DateTime, user_id UInt64, event_type String\n) ENGINE = MergeTree()\nORDER BY (event_time, user_id);" },
        { term: "ORDER BY key", desc: "THE most consequential design decision — hard to change later", code: "// Match your most common filter/group-by columns,\n// ordered low-to-high cardinality" },
        { term: "Partitioning", desc: "Enables pruning + cheap bulk drops of old data", code: "PARTITION BY toYYYYMM(event_time)" },
        { term: "TTL", desc: "Automatic retention management — no manual cleanup needed", code: "TTL event_time + INTERVAL 90 DAY;" },
      ],
    },
    {
      title: "The #1 Operational Rule",
      color: "blue",
      rows: [
        { term: "ALWAYS batch inserts", desc: "Single-row inserts create excessive 'parts'", code: "INSERT INTO events VALUES\n  (now(),1,'view'), (now(),2,'click'), /* thousands more */;" },
        { term: "Why this matters", desc: "Each insert = a new part; background merge must keep up", code: "// Frequent tiny inserts overwhelm merging -> degraded perf" },
        { term: "Watch for the warning sign", desc: "The direct, explicit signal something's wrong", code: "SELECT table, count() FROM system.parts\nWHERE active GROUP BY table;   -- 'too many parts'?" },
      ],
    },
    {
      title: "Aggregate Queries (the core strength)",
      color: "emerald",
      rows: [
        { term: "Why columnar is fast here", desc: "Reads ONLY the columns a query needs", code: "SELECT event_type, COUNT(*) FROM events\nWHERE event_time >= today()-7 GROUP BY event_type;" },
        { term: "Approximate distinct count", desc: "HyperLogLog-based — bounded error, dramatically faster", code: "SELECT uniq(user_id) FROM events;   -- not uniqExact() at scale" },
        { term: "Approximate percentiles", desc: "t-digest based — standard for latency dashboards", code: "SELECT quantile(0.95)(latency_ms) FROM requests;" },
        { term: "Materialized view", desc: "Incrementally computed ON INSERT (unlike Postgres's snapshot)", code: "CREATE MATERIALIZED VIEW daily_counts\nENGINE = SummingMergeTree() ORDER BY (date, type)\nAS SELECT toDate(event_time) AS date, event_type AS type, count() AS c\nFROM events GROUP BY date, type;" },
      ],
    },
    {
      title: "Consistency Model",
      color: "amber",
      rows: [
        { term: "ReplacingMergeTree", desc: "Dedup happens during BACKGROUND merges, NOT on insert", code: "ENGINE = ReplacingMergeTree(updated_at)\nORDER BY id;" },
        { term: "FINAL", desc: "Forces correctness NOW — real, sometimes big perf cost", code: "SELECT * FROM users FINAL WHERE id = 42;" },
        { term: "Sparse primary index", desc: "Indexes every Nth row — narrows to a RANGE, not one row", code: "// NOT good for point lookups by ID — use a row-oriented DB for that" },
      ],
    },
    {
      title: "Scaling & Diagnostics",
      color: "rose",
      rows: [
        { term: "Distributed table", desc: "Scatter-gather across shards, similar to Elasticsearch", code: "ENGINE = Distributed(my_cluster, default, events, rand());" },
        { term: "Diagnose a slow query", desc: "Confirm the sparse index is actually being used", code: "EXPLAIN indexes = 1 SELECT ...;" },
        { term: "Query load overview", desc: "Which queries dominate total load, like pg_stat_statements", code: "SELECT * FROM system.query_log ORDER BY query_duration_ms DESC;" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "NOT a system of record", desc: "No multi-row transactions, weak point-lookup performance", code: "// Pair with PostgreSQL/MySQL as the OLTP source of truth" },
        { term: "Feed it via", desc: "Change-data-capture or direct event-stream ingestion", code: "// Kafka table engine, CDC pipeline, or batched app-level writes" },
        { term: "Backup", desc: "Built-in commands or cloud object storage", code: "BACKUP TABLE events TO Disk('backups', 'events.zip');" },
        { term: "Grafana pairing", desc: "Native ClickHouse data source — the classic dashboard stack", code: "// ClickHouse -> Grafana for real-time analytics dashboards" },
      ],
    },
  ],
};

export default clickhouse;
