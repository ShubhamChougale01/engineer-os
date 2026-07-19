import type { CheatSheetData } from "./types";

const elasticsearch: CheatSheetData = {
  title: "The Ultimate Elasticsearch Cheat Sheet",
  subtitle: "Inverted index · Query DSL · sharding · hybrid search · production toolbelt",
  sections: [
    {
      title: "Documents & Mapping",
      color: "violet",
      rows: [
        { term: "Index a document", desc: "An index is roughly a 'table'; a document is a JSON object", code: "PUT /products/_doc/1\n{ \"name\": \"Wireless Headphones\", \"price\": 149.99 }" },
        { term: "text vs keyword", desc: "The single most important, most confused mapping decision", code: "\"category\": { \"type\": \"text\", \"fields\": { \"keyword\": {\"type\":\"keyword\"} } }" },
        { term: "text field", desc: "Tokenized/analyzed — for fuzzy full-text search", code: "\"name\": { \"type\": \"text\" }" },
        { term: "keyword field", desc: "Exact match — required for aggregation/sorting", code: "\"status\": { \"type\": \"keyword\" }" },
      ],
    },
    {
      title: "Query DSL",
      color: "blue",
      rows: [
        { term: "Full-text search", desc: "Fuzzy, tokenized, relevance-scored (BM25)", code: "{ \"query\": { \"match\": { \"description\": \"noise cancelling\" } } }" },
        { term: "must vs filter", desc: "filter is faster + cacheable — no scoring for yes/no conditions", code: "\"bool\": {\n  \"must\": [{ \"match\": {...} }],\n  \"filter\": [{ \"term\": { \"category.keyword\": \"Electronics\" } }]\n}" },
        { term: "Aggregations (facets)", desc: "Same mechanism powers e-commerce facets AND Kibana dashboards", code: "\"aggs\": { \"by_category\": { \"terms\": { \"field\": \"category.keyword\" } } }" },
        { term: "Deep pagination", desc: "NEVER from/size for deep pages — use a cursor instead", code: "{ \"size\": 20, \"sort\": [{\"_id\":\"asc\"}], \"search_after\": [\"last_id\"] }" },
      ],
    },
    {
      title: "Internals",
      color: "emerald",
      rows: [
        { term: "Inverted index", desc: "term -> documents containing it. The core speed mechanism.", code: "// quick -> [doc1]\n// brown -> [doc1, doc2]" },
        { term: "Near-real-time indexing", desc: "~1 second delay before a new doc is searchable (refresh_interval)", code: "// Don't expect INSTANT searchability after indexing" },
        { term: "Scatter-gather queries", desc: "Runs on EVERY shard, then the coordinator merges/re-ranks", code: "// More shards = more parallelism, but also more coordination overhead" },
        { term: "Diagnose a slow query", desc: "Detailed per-shard, per-clause timing", code: "{ \"query\": {...}, \"profile\": true }" },
      ],
    },
    {
      title: "Sharding & Scaling",
      color: "amber",
      rows: [
        { term: "Shard count", desc: "Hard to change later — plan for realistic data volume", code: "\"settings\": { \"number_of_shards\": 3, \"number_of_replicas\": 1 }" },
        { term: "Rule of thumb", desc: "Target shard sizes in the tens-of-GB range", code: "// Too many shards = coordination overhead; too few = scaling ceiling" },
        { term: "ILM (log/time-series data)", desc: "Hot-warm-cold tiering as data ages", code: "// Automates rollover, tier migration, and eventual deletion" },
        { term: "Cluster health", desc: "green (all good) / yellow (missing replicas) / red (missing primaries)", code: "GET /_cluster/health" },
      ],
    },
    {
      title: "Hybrid Search (RAG)",
      color: "rose",
      rows: [
        { term: "k-NN vector search", desc: "Native since 2021 — embeddings alongside text data", code: "\"knn\": { \"field\": \"embedding\", \"query_vector\": [...], \"k\": 10, \"num_candidates\": 100 }" },
        { term: "Hybrid: BM25 + vector", desc: "Reciprocal Rank Fusion merges both rankings", code: "{ \"query\": {\"match\":{...}}, \"knn\": {...}, \"rank\": { \"rrf\": {} } }" },
        { term: "Why hybrid beats either alone", desc: "Keywords catch exact terms; vectors catch semantic matches", code: "// Combine both for better real-world retrieval quality" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "JVM heap rule", desc: "~50% of RAM, NEVER exceed ~32GB (pointer-compression limit)", code: "// Oversized heap starves the OS file cache Lucene depends on" },
        { term: "Not a system of record", desc: "No multi-doc ACID — pair with a real DB as source of truth", code: "// Elasticsearch = search/analytics index, NOT primary storage" },
        { term: "Bulk indexing", desc: "Dramatically faster than many individual index requests", code: "POST /_bulk\n{ \"index\": { \"_index\": \"products\" } }\n{ \"name\": \"...\" }" },
        { term: "ALWAYS require auth", desc: "Historical exposed-instance incidents — same lesson as Mongo/Redis", code: "// Never expose Elasticsearch directly to the internet" },
      ],
    },
  ],
};

export default elasticsearch;
