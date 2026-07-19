import type { CheatSheetData } from "./types";

const redis: CheatSheetData = {
  title: "The Ultimate Redis Cheat Sheet",
  subtitle: "Data structures · cache patterns · persistence · production toolbelt",
  sections: [
    {
      title: "Core Data Structures",
      color: "violet",
      rows: [
        { term: "String (with TTL)", desc: "Simplest type — supports atomic INCR/DECR", code: "SET page:views 0 EX 3600\nINCR page:views" },
        { term: "Hash", desc: "A structured object with independently-updatable fields", code: "HSET user:1 name 'Ada' age 36\nHINCRBY user:1 age 1" },
        { term: "List", desc: "Ordered — natural fit for a queue or stack", code: "RPUSH queue task1\nLPOP queue" },
        { term: "Set", desc: "Unique members, fast O(1) membership and set ops", code: "SADD tags:p1 db nosql\nSINTER tags:p1 tags:p2" },
        { term: "Sorted set", desc: "Score-ranked — leaderboards, priority queues", code: "ZADD board 100 Ada\nZREVRANGE board 0 2 WITHSCORES" },
      ],
    },
    {
      title: "Cache Patterns",
      color: "blue",
      rows: [
        { term: "Cache-aside", desc: "Redis has NO automatic awareness of your DB — app owns this", code: "// GET key -> miss? query DB -> SET key value EX ttl" },
        { term: "Invalidate on write", desc: "Delete, don't try to update in place", code: "DEL user:1   // after UPDATE users SET ... in the real DB" },
        { term: "Fixed-window rate limit", desc: "Classic, atomic per-user counter", code: "INCR rate:user42\nEXPIRE rate:user42 60   -- only on first hit in window" },
        { term: "Distributed lock", desc: "NX = only set if not exists; always release via Lua w/ token check", code: "SET lock:res1 token NX EX 10" },
      ],
    },
    {
      title: "Single-Threaded Model",
      color: "emerald",
      rows: [
        { term: "Why INCR is atomic", desc: "Commands execute one at a time — no interleaving", code: "// No lock needed: this IS the guarantee" },
        { term: "NEVER use in production", desc: "Blocks EVERY client for the full scan duration", code: "// WRONG: KEYS user:*" },
        { term: "Safe alternative", desc: "Incremental, non-blocking keyspace iteration", code: "SCAN 0 MATCH user:* COUNT 100" },
        { term: "MULTI/EXEC", desc: "Atomicity ONLY — no rollback-on-error like SQL transactions", code: "MULTI\nINCR views\nSADD viewed_by user42\nEXEC" },
      ],
    },
    {
      title: "Persistence & Eviction",
      color: "amber",
      rows: [
        { term: "RDB", desc: "Periodic snapshot — fast restore, can lose recent writes", code: "save 900 1" },
        { term: "AOF", desc: "Logs every write — granular recovery, larger file", code: "appendonly yes\nappendfsync everysec" },
        { term: "Memory limit + eviction", desc: "Never leave memory usage unbounded", code: "maxmemory 4gb\nmaxmemory-policy allkeys-lru" },
        { term: "noeviction", desc: "Rejects writes instead of evicting — for non-cache use", code: "maxmemory-policy noeviction" },
      ],
    },
    {
      title: "Replication & Scaling",
      color: "rose",
      rows: [
        { term: "Sentinel", desc: "Monitoring + automatic primary failover", code: "// Standard HA pattern for a non-clustered deployment" },
        { term: "Redis Cluster", desc: "16384 hash slots sharded across nodes", code: "// Horizontal scaling once one instance's RAM is the bottleneck" },
        { term: "Hash tags", desc: "Force related keys onto the same shard", code: "SET {user:42}:profile ...\nSET {user:42}:sessions ..." },
        { term: "Streams (vs pub/sub)", desc: "Persisted, consumer-group delivery — pub/sub drops offline msgs", code: "XADD orders * customer_id 42\nXREADGROUP GROUP g1 c1 STREAMS orders >" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "ALWAYS require auth", desc: "Historical default-off caused major hijack incidents", code: "requirepass a-strong-password" },
        { term: "Never expose to the internet", desc: "Private network/VPC access only", code: "bind 127.0.0.1 -::1" },
        { term: "Find slow commands", desc: "The first tool for 'everything feels slow'", code: "SLOWLOG GET 10" },
        { term: "Find oversized keys", desc: "A common hidden cause of slow operations", code: "redis-cli --bigkeys" },
        { term: "Redis vs Valkey", desc: "2024 licensing fork — verify current feature parity", code: "// Valkey: Linux Foundation-governed continuation" },
      ],
    },
  ],
};

export default redis;
