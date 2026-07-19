import type { CheatSheetData } from "./types";

const sqlite: CheatSheetData = {
  title: "The Ultimate SQLite Cheat Sheet",
  subtitle: "Serverless architecture · WAL concurrency · dynamic typing · production toolbelt",
  sections: [
    {
      title: "No Server — Just a File",
      color: "violet",
      rows: [
        { term: "Connect", desc: "Opening a file IS connecting — no server to start", code: "import sqlite3\nconn = sqlite3.connect('myapp.db')" },
        { term: "In-memory database", desc: "Fast, fully isolated — ideal for unit tests", code: "conn = sqlite3.connect(':memory:')" },
        { term: "Basic queries", desc: "Standard SQL, parameterized (same injection rules)", code: "conn.execute('INSERT INTO users (name) VALUES (?)', ('Ada',))" },
        { term: "No Docker needed", desc: "Nothing to containerize — it's a library in your process", code: "// Deployment = bundling the library with your app" },
      ],
    },
    {
      title: "Two Surprising Non-Defaults",
      color: "blue",
      rows: [
        { term: "Foreign keys are OFF by default", desc: "Unlike every other relational DB on this platform", code: "conn.execute('PRAGMA foreign_keys=ON')" },
        { term: "Types are NOT strictly enforced", desc: "Type affinity: a REAL column can silently store text", code: "// CREATE TABLE items (price REAL);  -- accepts 'abc' by default!" },
        { term: "STRICT tables (opt-in)", desc: "Closes the type-enforcement gap when you want it", code: "CREATE TABLE items (price REAL) STRICT;" },
      ],
    },
    {
      title: "Concurrency Model",
      color: "emerald",
      rows: [
        { term: "Enable WAL mode", desc: "The #1 recommended setting for any real app", code: "conn.execute('PRAGMA journal_mode=WAL')" },
        { term: "What WAL fixes", desc: "Readers no longer block on an in-progress writer", code: "// Default (rollback journal): writer blocks ALL readers" },
        { term: "What WAL does NOT fix", desc: "Still only ONE writer at a time — a design boundary", code: "// Frequent 'database is locked' = genuine architectural signal" },
        { term: "When to migrate away", desc: "Sustained multi-process write concurrency needs", code: "// -> PostgreSQL/MySQL, not a SQLite tuning problem" },
      ],
    },
    {
      title: "Performance",
      color: "amber",
      rows: [
        { term: "Batch writes in ONE transaction", desc: "Auto-commit gives every statement its own fsync cost", code: "conn.execute('BEGIN')\nfor row in rows: conn.execute('INSERT ...', row)\nconn.commit()" },
        { term: "Diagnose a slow query", desc: "SCAN TABLE (bad) vs SEARCH USING INDEX (good)", code: "EXPLAIN QUERY PLAN SELECT * FROM users WHERE email=?;" },
        { term: "Safe backup of an ACTIVE db", desc: "A plain file copy risks a mid-write inconsistent snapshot", code: "conn.backup(backup_conn)  -- SQLite's own backup API" },
      ],
    },
    {
      title: "Extensions & Local-First AI",
      color: "rose",
      rows: [
        { term: "sqlite-vec", desc: "Native vector similarity search — on-device RAG, zero server", code: "CREATE VIRTUAL TABLE docs USING vec0(embedding FLOAT[384]);" },
        { term: "FTS5", desc: "Built-in full-text search, lighter than Elasticsearch", code: "CREATE VIRTUAL TABLE docs_fts USING fts5(title, content);" },
        { term: "Schema migrations", desc: "Built-in version tracking primitive", code: "PRAGMA user_version;  -- track and apply migrations against this" },
      ],
    },
    {
      title: "When (Not) To Use It",
      color: "cyan",
      rows: [
        { term: "Great fit", desc: "Mobile/desktop apps, local dev, embedded, local-first AI", code: "// Zero admin, single file, real ACID transactions" },
        { term: "Poor fit", desc: "Multi-server backends needing concurrent write access", code: "// That's exactly what PostgreSQL/MySQL are built for" },
        { term: "Security model", desc: "OS file permissions ARE the access control — no network layer", code: "// No exposed-instance risk class like Mongo/Redis/Elasticsearch" },
        { term: "Format stability", desc: "Backward-compatible since 2004, committed through 2050", code: "// Recommended by the Library of Congress as an archival format" },
      ],
    },
  ],
};

export default sqlite;
