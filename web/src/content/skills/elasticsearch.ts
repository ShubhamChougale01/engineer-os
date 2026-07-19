import type { SkillContent } from "../types";

/**
 * Elasticsearch — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const elasticsearch: SkillContent = {
  overview: `
Elasticsearch is a distributed search and analytics engine built on Apache Lucene, designed around one central bet: full-text search and analytical aggregation over large, often unstructured or semi-structured data need a fundamentally different storage and query model than a transactional relational database provides. Where a relational database optimizes for exact-match lookups and joins over structured rows, Elasticsearch optimizes for "find documents matching this fuzzy, ranked, relevance-scored text query, across possibly billions of documents, in milliseconds" — a genuinely different problem requiring an inverted-index-based architecture purpose-built for it.

For an AI engineer, Elasticsearch shows up in two increasingly overlapping roles: its original, foundational purpose as the search engine behind product search, log aggregation (the "ELK stack" — Elasticsearch, Logstash, Kibana), and application search features; and its newer role, since adding native vector search (k-NN) capabilities, as a genuine option for RAG applications wanting HYBRID search — combining traditional keyword/BM25 relevance scoring with vector similarity search in one query, a capability increasingly valuable for retrieval quality beyond pure semantic search alone.

Key characteristics: an inverted index (mapping each term to the documents containing it) as the foundational data structure enabling fast full-text search, built on Apache Lucene's mature, battle-tested search library; horizontal scaling via sharding designed in from the start, similar in philosophy to MongoDB; a rich query DSL (Domain Specific Language) supporting fuzzy matching, relevance scoring, faceted search, and complex boolean combinations; near-real-time indexing (documents become searchable within about one second of being indexed, not instantly, a deliberate architectural tradeoff); and, since 2021, native vector search capability making it a genuine hybrid search and RAG-retrieval option.
`,

  history: `
Elasticsearch was created by **Shay Banon**, originally building a search engine for his wife's cooking recipe application, before recognizing the underlying distributed search technology's much broader applicability.

| Year | Milestone |
|------|-----------|
| 2004 | Shay Banon builds Compass, an early Java search library wrapping Apache Lucene, for a personal project |
| 2010 | Banon releases **Elasticsearch**, a full rewrite designed from the start to be distributed and horizontally scalable, unlike Compass |
| 2012 | **Elasticsearch BV** (later Elastic) is founded to commercialize and steward the project |
| 2012–2013 | The "ELK stack" (Elasticsearch, Logstash for data ingestion, Kibana for visualization) becomes a widely adopted, cohesive log-aggregation and search solution |
| 2015 | Beats (lightweight data shippers) are added to the stack, becoming "Elastic Stack" |
| 2018 | Elastic goes public (IPO) on the NYSE |
| 2019 | Elastic changes its license from Apache 2.0 to a dual-license model (Elastic License), a move directly motivated by cloud providers (most prominently AWS) offering Elasticsearch-as-a-service without licensing it or contributing back — closely preceding MongoDB's and Redis's later, similar licensing changes |
| 2021 | **AWS forks Elasticsearch** (and Kibana) in direct response, creating **OpenSearch**, now stewarded under the Linux Foundation-adjacent OpenSearch Software Foundation, with continued independent development |
| 2021 | Elastic adds native **k-NN (k-nearest neighbor) vector search** capability, positioning Elasticsearch for the emerging vector-search and RAG application category |
| 2024 | Elastic re-relicenses back toward a fully open-source (AGPL-compatible) model for Elasticsearch and Kibana, a notable reversal responding to continued community and competitive pressure from OpenSearch's success |
| 2025+ | Continued Elastic Stack development alongside OpenSearch's independent, foundation-governed evolution — a permanently split ecosystem, closely mirroring the MySQL/MariaDB and Redis/Valkey precedents |

Elasticsearch's 2019 licensing change, the resulting 2021 OpenSearch fork, and Elastic's 2024 reversal back toward full open-source licensing is a genuinely distinctive case study among this platform's several "cloud-provider-commoditization-driven licensing fork" stories (MongoDB/MariaDB, Redis/Valkey) — Elastic is notably the one company in this pattern that ultimately reversed course and re-opened its licensing, worth understanding as a contrast to the other, more permanent splits.
`,

  "why-it-exists": `
Elasticsearch exists because of a specific, well-understood limitation: **relational databases' native text-matching capability (LIKE, basic full-text search extensions) was never designed for genuinely fast, relevance-ranked, fuzzy full-text search at scale**, and building a distributed, horizontally-scalable search system on top of Lucene (a mature, single-machine Java search library) required real distributed-systems engineering that most application teams shouldn't need to build themselves from scratch.

The prior landscape offered:

1. **Relational databases' basic full-text search extensions**: functional for simple cases, but neither designed for genuinely large-scale full-text relevance ranking nor for horizontal distribution across many machines.
2. **Apache Lucene directly**: an excellent, mature, single-machine search library, but using it directly required significant engineering to add distribution, replication, a usable query API, and operational tooling — exactly the gap Elasticsearch fills.
3. **Apache Solr** (an earlier, still-actively-used Lucene-based search server): solved a similar problem, but Elasticsearch's design (a JSON-based REST API, easier initial setup, and horizontal scaling built in from the start) captured significant developer mindshare as the "easier to get started with, and to scale" alternative.

Elasticsearch's insight was to wrap Lucene's proven, high-performance inverted-index search capability in a distributed system designed from the ground up for horizontal scaling (sharding a single logical index across many nodes) and ease of use (a JSON document model and REST API, rather than Lucene's lower-level Java API), letting application teams get genuinely fast, relevance-ranked full-text search at scale without needing to build the underlying distributed-systems machinery themselves.
`,

  "problem-it-solves": `
Elasticsearch solves the **"I need fast, relevance-ranked, fuzzy full-text search (and/or large-scale log/event analytics) at a scale a relational database's text search capability can't efficiently provide"** problem.

Concretely, Elasticsearch provides:

- **Inverted-index-based full-text search**: mapping each term to every document containing it, enabling fast lookup of "which documents contain this word" without scanning every document's full text at query time.
- **Relevance scoring (BM25 by default)**: ranking search results by how well they match a query, not just whether they match at all — the foundational algorithm behind "did you mean" and "most relevant first" search UX.
- **Horizontal scaling via sharding**: a logical index is split into shards distributed across many nodes, designed in from the start, similar in philosophy to MongoDB's native sharding approach.
- **A rich, expressive query DSL**: supporting fuzzy matching, phrase queries, boolean combinations, faceted aggregations (for filters like "narrow by category" in an e-commerce search UI), and geospatial queries, all expressed as JSON.
- **Near-real-time analytics via aggregations**: the same aggregation framework powering log/metrics dashboards (Kibana) that also powers e-commerce faceted search filters — a genuinely dual-purpose capability.
- **Native vector search (since 2021)**: k-NN search over dense vector embeddings, letting Elasticsearch serve as a hybrid keyword-plus-semantic search engine for RAG applications.

What Elasticsearch deliberately does **not** solve: it is NOT a transactional system of record — Elasticsearch's default consistency model (near-real-time, roughly one-second indexing delay) and its historical lack of full ACID transaction support make it unsuitable as an application's primary, authoritative data store; the standard architectural pattern is Elasticsearch as a SEARCH/ANALYTICS index sitting alongside a genuine system of record (PostgreSQL, MySQL) that remains authoritative, with Elasticsearch's index kept in sync via application logic or a change-data-capture pipeline. It also carries real operational complexity (cluster management, shard sizing, JVM heap tuning) that a smaller application's simple search needs might not justify relative to a lighter-weight alternative.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the inverted index and how it enables fast full-text search fundamentally differently from a relational database's row-scanning approach.
2. Design an appropriate index mapping (Elasticsearch's schema equivalent), including field types and analyzers for text processing.
3. Write queries using Elasticsearch's Query DSL, including match queries, boolean combinations, and filters.
4. Use aggregations for faceted search and analytics use cases.
5. Explain sharding and replication in Elasticsearch, and design an appropriate shard count for a given index.
6. Apply relevance tuning (boosting, custom scoring) to improve search result quality.
7. Use Elasticsearch's k-NN vector search for hybrid keyword-plus-semantic retrieval in a RAG application.
8. Diagnose and optimize slow queries and cluster health issues.
9. Answer senior-level interview questions on the inverted index, sharding strategy, and Elasticsearch's consistency model tradeoffs.
`,

  prerequisites: `
- **Required**: general programming fundamentals and basic familiarity with JSON — Elasticsearch's document model and query DSL are JSON-based throughout.
- **Very helpful**: the **PostgreSQL** or **MySQL** skill — understanding what a relational database's text search capability CAN'T efficiently do makes Elasticsearch's value proposition far more concrete.
- **Helpful**: the **Vector Search** skill for understanding Elasticsearch's k-NN capabilities in the broader context of embedding-based retrieval.
- **Helpful**: general **Distributed Systems** concepts (sharding, replication) for understanding Elasticsearch's cluster architecture more deeply.

Dependency links: general programming and JSON fluency → **PostgreSQL**/**MySQL** for a useful contrast → this page → **Vector Search** and **RAG** for the hybrid-search AI-application context → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Documents and indices

~~~
PUT /products/_doc/1
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones with 30-hour battery",
  "price": 149.99,
  "category": "Electronics"
}
~~~

An "index" in Elasticsearch is roughly analogous to a table in a relational database (a named collection of related documents); a "document" is roughly analogous to a row, but is a full JSON object, similar in spirit to a MongoDB document — this document-oriented, schema-flexible starting point is a deliberate design choice matching how search/log data is typically shaped.

### Basic search queries

~~~
GET /products/_search
{
  "query": {
    "match": {
      "description": "noise cancelling"
    }
  }
}
~~~

The match query performs full-text search against a field, automatically handling tokenization (splitting text into searchable terms) and relevance scoring — unlike a relational LIKE '%noise cancelling%' query, this finds documents where the WORDS "noise" and "cancelling" appear (in any order, with other words potentially between them), ranked by how well each document matches.

### Exact-match filtering with term queries

~~~
GET /products/_search
{
  "query": {
    "term": {
      "category.keyword": "Electronics"
    }
  }
}
~~~

term performs an EXACT match against a field (useful for categorical/keyword data, not full-text), distinctly different from match's fuzzy, tokenized text search — a common beginner confusion is using match where an exact term filter was actually needed, or vice versa.

### Combining queries with bool

~~~
GET /products/_search
{
  "query": {
    "bool": {
      "must": [{ "match": { "description": "noise cancelling" } }],
      "filter": [{ "term": { "category.keyword": "Electronics" } }],
      "must_not": [{ "term": { "in_stock": false } }]
    }
  }
}
~~~

bool combines multiple query clauses: must (must match, contributes to relevance score), filter (must match, does NOT affect relevance score, and is cacheable/faster since it doesn't need scoring), and must_not (must not match) — using filter instead of must for pure yes/no conditions (like category or in-stock status) is both faster and more semantically correct than forcing everything through scored matching.

### Basic aggregations

~~~
GET /products/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category.keyword" }
    }
  }
}
~~~

Aggregations compute analytics over the matched documents (here, a count of products per category) — the same underlying mechanism powers both search-result faceting ("narrow by category" filters in an e-commerce UI) and log/metrics dashboards (Kibana visualizations).

Common beginner trap: not understanding the difference between "text" and "keyword" field types, leading to full-text-tokenized fields being used where exact-match aggregation was actually needed — covered fully in Intermediate Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### Mappings: text versus keyword field types

~~~
PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },                                    -- tokenized, full-text searchable
      "category": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }                 -- BOTH: text for search, keyword for exact match/aggregation
      },
      "price": { "type": "float" },
      "in_stock": { "type": "boolean" }
    }
  }
}
~~~

A "text" field is analyzed (tokenized, lowercased, potentially stemmed) for full-text search; a "keyword" field is stored exactly as-is, used for exact matching, sorting, and aggregations — this distinction (and the common pattern of mapping the SAME underlying data both ways, as shown for category above) is one of the most important, most frequently misunderstood Elasticsearch concepts for newcomers.

### Analyzers and tokenization

~~~
GET /_analyze
{
  "analyzer": "standard",
  "text": "The Quick Brown Fox"
}
-- produces tokens: ["the", "quick", "brown", "fox"] (lowercased, split on whitespace)
~~~

An analyzer defines how text is broken into searchable tokens — the standard analyzer (lowercase, split on whitespace/punctuation) is the default, but custom analyzers can add stemming (matching "running" to "run"), synonym handling, or language-specific tokenization, directly shaping what a full-text query will and won't match.

### Sharding and replication

~~~
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
~~~

An index is split into shards (here, 3), each an independent Lucene index distributed across the cluster's nodes, enabling both horizontal write/storage scaling and parallel query execution across shards; replicas (here, 1 replica per shard) provide both high availability (a replica can serve queries if its primary shard's node fails) and additional read throughput.

### Relevance scoring and boosting

~~~
GET /products/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "name": { "query": "headphones", "boost": 2 } } },
        { "match": { "description": "headphones" } }
      ]
    }
  }
}
~~~

boost increases a specific clause's contribution to the overall relevance score — here, a match in the product NAME counts more toward relevance than the same match in the description, reflecting the reasonable intuition that a name match is a stronger relevance signal than a description match.

### Pagination and deep pagination concerns

~~~
GET /products/_search
{
  "from": 20,
  "size": 10,
  "query": { "match_all": {} }
}
~~~

from/size pagination works fine for shallow pagination (the first several pages), but becomes increasingly expensive deep into result sets (Elasticsearch must still compute and sort ALL results up to from+size internally) — search_after (a cursor-based pagination approach) is the recommended alternative for genuinely deep pagination needs.

### Index templates and index lifecycle management

~~~
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": { "number_of_shards": 1 },
    "mappings": { "properties": { "timestamp": { "type": "date" } } }
  }
}
~~~

Index templates automatically apply consistent settings/mappings to new indices matching a pattern (essential for time-series-style log indices, typically one new index per day); Index Lifecycle Management (ILM) automates rolling over, shrinking, and eventually deleting old indices based on age or size, a critical operational feature for the log-aggregation use case where data volume grows continuously.
`,

  "advanced-concepts": `
### The inverted index internals

~~~mermaid
flowchart LR
    Doc1["Document 1:\n'quick brown fox'"] --> Terms["Inverted index:\nquick -> [doc1]\nbrown -> [doc1, doc2]\nfox -> [doc1]"]
    Doc2["Document 2:\n'brown bear'"] --> Terms
    Query["Query: 'brown'"] --> Terms
    Terms -->|lookup| Result["Matching docs: [doc1, doc2]"]
~~~

The inverted index maps each unique term to the list of documents (and positions within them) containing it — the inverse of a forward index (which would map documents to their terms), hence "inverted." This structure is precisely why full-text search is fast: finding documents containing a term is a direct lookup in this index, rather than scanning every document's full text, and Lucene's specific implementation (segments, term dictionaries, and postings lists) is heavily optimized for exactly this access pattern.

### Sharding strategy and the shard-count tradeoff

~~~mermaid
flowchart TB
    Query["Search query"] --> Coordinating["Coordinating node\n(receives the query)"]
    Coordinating --> Shard1["Shard 1\n(on Node A)"]
    Coordinating --> Shard2["Shard 2\n(on Node B)"]
    Coordinating --> Shard3["Shard 3\n(on Node C)"]
    Shard1 --> Merge["Results merged\nand re-ranked by the\ncoordinating node"]
    Shard2 --> Merge
    Shard3 --> Merge
~~~

Choosing shard count is a genuinely consequential, hard-to-change-later decision (changing an index's shard count requires reindexing): too few shards limits horizontal scaling and parallel query capacity; too many shards adds per-shard overhead (each shard has real memory/file-handle cost) and can actually SLOW queries by fragmenting work across more coordination overhead than the data volume justifies — a common, genuinely useful rule of thumb is keeping individual shard size in the tens of gigabytes range, adjusting shard count based on expected total data volume rather than an arbitrary default.

### Near-real-time indexing and the refresh interval

~~~
PUT /products/_settings
{
  "refresh_interval": "1s"
}
~~~

Newly indexed documents aren't IMMEDIATELY searchable — Elasticsearch batches recent writes into an in-memory segment that becomes searchable only after a "refresh" (by default, roughly every second) — this near-real-time (not fully real-time) model is a deliberate performance tradeoff, since making every single write instantly searchable would require much more expensive indexing operations; applications needing tighter consistency for a specific write can force an immediate refresh, at a real performance cost if done routinely rather than for the rare case that genuinely needs it.

### Hybrid search: combining BM25 and vector similarity

~~~
GET /documents/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "content": "climate policy changes" } }
      ]
    }
  },
  "knn": {
    "field": "embedding",
    "query_vector": [0.1, 0.2, 0.3, "..."],
    "k": 10,
    "num_candidates": 100
  },
  "rank": { "rrf": {} }
}
~~~

Reciprocal Rank Fusion (RRF) combines traditional BM25 keyword relevance scoring with k-NN vector similarity search results into one unified ranking — a genuinely powerful hybrid search capability for RAG applications, since keyword matching catches exact terms/names a pure embedding similarity search might miss, while vector search catches semantically related content that shares no exact keywords, and combining both often outperforms either alone for real-world retrieval quality.

### Cluster architecture: master, data, and coordinating nodes

~~~mermaid
flowchart TB
    subgraph Cluster["Elasticsearch cluster"]
        Master["Master-eligible nodes\n(cluster state management,\nshard allocation decisions)"]
        Data["Data nodes\n(store shards, execute\nsearch/index operations)"]
        Coordinating["Coordinating-only nodes\n(route requests,\nmerge results — optional)"]
    end
~~~

A production Elasticsearch cluster typically separates node roles for larger deployments: dedicated master-eligible nodes (making cluster-state decisions like shard allocation, ideally an odd number for quorum-based election) separate from data nodes (doing the actual heavy lifting of storing and querying shards), with optional coordinating-only nodes handling request routing and result merging without holding data themselves — a genuine operational architecture decision for larger clusters, though smaller deployments commonly run combined-role nodes.

### Percolator queries — reverse search

~~~
GET /my_percolator_index/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": { "message": "urgent server outage detected" }
    }
  }
}
~~~

Percolator queries invert the usual search direction: instead of "find documents matching this query," they answer "which of my STORED queries match THIS document" — useful for alerting systems where you have many saved search criteria (alert rules) and need to know which ones a new incoming document (a log line, an event) matches.
`,

  "internal-working": `
What happens inside Elasticsearch from an indexing request to a searchable document:

~~~mermaid
flowchart LR
    A["Client sends index request"] --> B["Coordinating node\nroutes to the correct primary shard"]
    B --> C["Primary shard\nwrites to its in-memory buffer\nand transaction log (translog)"]
    C --> D["Replicated to\nreplica shards"]
    D --> E["Refresh (default ~1s)\nmakes the new segment searchable"]
    E --> F["Periodic merge\ncombines small segments\ninto larger ones"]
~~~

1. **Routing to the correct shard**: the coordinating node (any node can serve this role for a given request) determines which shard a document belongs to (based on a hash of its ID by default) and routes the write there.
2. **Writing to the primary shard**: the write is added to an in-memory buffer AND recorded in the transaction log (translog) for durability — similar in spirit to a write-ahead log, ensuring the write survives a crash before it's been fully persisted to a Lucene segment.
3. **Replication**: the write is replicated to the shard's configured replicas, providing both durability and read-scaling capacity.
4. **Refresh (near-real-time visibility)**: roughly every second (configurable via refresh_interval), the in-memory buffer is written as a new, small, immutable Lucene segment, which THEN becomes searchable — this is why a just-indexed document isn't INSTANTLY searchable, a deliberate design tradeoff.
5. **Segment merging**: because each refresh creates a new small segment, and searching across many small segments has real overhead, Elasticsearch periodically merges smaller segments into larger ones in the background, a genuinely important ongoing maintenance process affecting both search performance and disk usage.

**Why understanding segments and merging matters**: Lucene's segment-based architecture (many small, immutable files rather than one large, mutable structure) is what makes near-real-time indexing possible at all — writes create new segments quickly without needing to modify existing ones in place, but this means query performance and disk usage both depend on how well segment merging keeps pace with the ongoing write rate, a genuine operational concern for high-write-volume indices (like log ingestion) specifically.
`,

  architecture: `
A senior engineer thinks about Elasticsearch at two levels: **the cluster/sharding topology** (how data and query load are distributed) and **index/mapping design** (the equivalent of relational schema design, but for search-optimized data).

### Cluster topology for a production deployment

~~~mermaid
flowchart TB
    LB["Load balancer / client"] --> Coord["Coordinating nodes\n(optional, for larger clusters)"]
    Coord --> Master["Master-eligible nodes\n(odd number, e.g. 3, for quorum)"]
    Coord --> Data1["Data node 1\n(hot tier: recent, frequently-queried data)"]
    Coord --> Data2["Data node 2\n(warm/cold tier: older, less-frequently-queried data)"]
~~~

Larger, log-heavy deployments commonly use "hot-warm-cold" tiered architecture: recent, frequently-queried data lives on fast (hot tier) hardware, while older data migrates (via Index Lifecycle Management) to progressively cheaper, slower storage tiers as it ages and is queried less often — a cost-optimization pattern directly relevant to the log-aggregation use case's naturally time-decaying query interest.

### Index and mapping design as the primary architecture decision

~~~
Application data model decisions in Elasticsearch:
├── What fields need full-text search? (text type, choose analyzers deliberately)
├── What fields need exact match/aggregation/sorting? (keyword type)
├── What's the shard count? (based on expected total data volume,
│                             changing later requires reindexing)
├── Is index lifecycle management needed? (for time-series/log data
│                                           that grows continuously)
└── Is hybrid search (BM25 + k-NN vectors) needed for this use case?
~~~

Rules mature Elasticsearch teams follow: design mappings around actual query needs (text versus keyword per field, deliberately, not by default); size shards based on realistic data-volume projections rather than an arbitrary default shard count; and treat Elasticsearch as a search/analytics index alongside a genuine system of record, not as the sole authoritative data store for anything requiring strict transactional guarantees.
`,

  "data-flow": `
Tracing one search request end to end across a sharded index:

~~~mermaid
sequenceDiagram
    participant Client
    participant Coord as Coordinating node
    participant Shard1 as Shard 1 (Node A)
    participant Shard2 as Shard 2 (Node B)
    participant Shard3 as Shard 3 (Node C)

    Client->>Coord: GET /products/_search { match query }
    Coord->>Shard1: execute query against this shard
    Coord->>Shard2: execute query against this shard
    Coord->>Shard3: execute query against this shard
    Shard1-->>Coord: top-N locally-ranked results
    Shard2-->>Coord: top-N locally-ranked results
    Shard3-->>Coord: top-N locally-ranked results
    Coord->>Coord: merge and re-rank results\nfrom all shards into one final ranking
    Coord-->>Client: final top-N results
~~~

The most misunderstood part for newcomers: **a search query executes independently against EVERY shard of an index (the "scatter" phase), and the coordinating node merges and re-ranks the combined results afterward (the "gather" phase)** — this scatter-gather pattern is why shard count directly affects query parallelism (more shards, more parallel work, up to a point) but also why an excessively high shard count for a given data volume adds coordination overhead without a corresponding benefit, since there's more scattering and gathering happening than the actual data volume justifies.
`,

  "production-usage": `
### Connecting and basic operations

~~~python
from elasticsearch import Elasticsearch

es = Elasticsearch("https://localhost:9200", api_key="your-api-key")

response = es.search(index="products", query={"match": {"description": "noise cancelling"}})
for hit in response["hits"]["hits"]:
    print(hit["_source"]["name"], hit["_score"])
~~~

### Configuration essentials

~~~
# elasticsearch.yml
cluster.name: production-cluster
node.roles: [master, data]
discovery.seed_hosts: ["node1", "node2", "node3"]

# JVM heap: set to roughly 50% of available RAM, never exceeding ~32GB
# (a well-known JVM pointer-compression threshold beyond which heap
# efficiency drops sharply)
~~~

Non-negotiables for production:

1. **JVM heap sized correctly (roughly 50% of available RAM, capped around 32GB)** — leaving the remaining RAM for the OS's file system cache, which Lucene relies on heavily for performance; a common, damaging misconfiguration is giving Elasticsearch's JVM too much heap, starving the OS cache Lucene needs.
2. **An odd number of master-eligible nodes** (typically 3) for reliable quorum-based leader election, avoiding split-brain scenarios.
3. **Shard count planned based on realistic data-volume projections**, since changing it later requires a full reindex.

### Common production stacks

- **Log aggregation (the ELK/Elastic Stack)**: Elasticsearch + Logstash/Beats for ingestion + Kibana for visualization, the original, still extremely common Elasticsearch use case.
- **Application/e-commerce search**: Elasticsearch as a dedicated search index alongside a PostgreSQL/MySQL system of record, with application logic keeping the two in sync.
- **RAG/hybrid search applications**: Elasticsearch's k-NN vector search combined with BM25 keyword relevance, increasingly common for AI applications wanting both semantic and exact-term retrieval quality.
`,

  "industry-examples": `
- **Wikipedia**: uses Elasticsearch for its search functionality, handling full-text search across an enormous, constantly-updated corpus of articles.
- **Uber**: uses Elasticsearch extensively for real-time analytics and search across its logistics and operational data.
- **Netflix**: uses Elasticsearch for log aggregation and operational analytics across its microservices architecture.
- **GitHub**: uses Elasticsearch to power code search functionality across its enormous repository corpus.
- **The Guardian**: has publicly discussed using Elasticsearch for content search and tagging across its publishing platform.
- **Many enterprises' internal observability stacks**: the ELK/Elastic Stack remains one of the most widely deployed log-aggregation and observability solutions industry-wide, appearing in a very large fraction of mid-to-large engineering organizations' operational tooling.
- **A rapidly growing number of RAG/AI application teams**: Elasticsearch's native k-NN vector search and RRF-based hybrid search capabilities have made it an increasingly common choice specifically for teams wanting both keyword and semantic retrieval in one system, rather than operating a separate dedicated vector database alongside their existing search infrastructure.

Pattern to notice: Elasticsearch adoption clusters around **two distinct but related use cases** — full-text search over content (product catalogs, articles, code) and log/operational-event aggregation and analytics — with a rapidly growing third use case (hybrid search for RAG) building directly on the same underlying infrastructure many organizations already operate for the first two.
`,

  "best-practices": `
1. **Design mappings deliberately** — text for full-text search fields, keyword for exact-match/aggregation/sorting fields, and both (as a multi-field) when a single piece of data genuinely needs to serve both purposes.
2. **Use filter context, not must, for pure yes/no conditions** — filters are faster (no scoring overhead) and cacheable, appropriate for category/status/date-range filters that shouldn't affect relevance ranking.
3. **Plan shard count based on realistic data-volume projections**, not an arbitrary default — changing shard count later requires a full reindex, making this a genuinely consequential upfront decision.
4. **Use Index Lifecycle Management for time-series/log data** rather than manually managing rolling indices and deletion.
5. **Never let JVM heap exceed roughly 32GB**, and generally target around 50% of available RAM, leaving the rest for the OS file system cache Lucene relies on.
6. **Use search_after for deep pagination**, not from/size, which becomes increasingly expensive deep into large result sets.
7. **Treat Elasticsearch as a search/analytics index, not a system of record**, keeping a genuine authoritative database as the source of truth and Elasticsearch's index in sync via application logic or change-data-capture.
8. **Use bulk indexing APIs for batch data loading** rather than many individual index requests, dramatically more efficient for loading large datasets.
9. **Tune analyzers deliberately for your actual language/domain needs** (stemming, synonyms, language-specific tokenization) rather than accepting the default standard analyzer for every use case without consideration.
10. **Consider hybrid search (BM25 + k-NN with RRF) for RAG applications** rather than relying purely on vector similarity, since keyword matching catches exact terms/names that pure semantic similarity can miss.
11. **Monitor cluster health (green/yellow/red) as a first-class operational signal**, understanding yellow (missing replicas, degraded but functional) versus red (missing primary shards, genuine data unavailability).
12. **Use dedicated master-eligible nodes for larger production clusters**, separating cluster-state management from the heavy lifting of data storage and query execution.
`,

  "anti-patterns": `
### Confusing text and keyword field types

~~~
-- WRONG — mapping a category field as "text" (tokenized) when exact-match
-- filtering/aggregation was actually needed; "Electronics" and "electronics gear"
-- would both tokenize into overlapping terms, breaking exact-match expectations
{ "category": { "type": "text" } }

-- RIGHT — keyword for exact match, or both if you genuinely need full-text
-- search on the same field too
{ "category": { "type": "keyword" } }
~~~

This is one of the most common, most consequential Elasticsearch mapping mistakes for newcomers — the text/keyword distinction is foundational, and getting it backward for a given field produces confusing, hard-to-debug query behavior.

### Using Elasticsearch as a primary system of record

~~~
-- WRONG architecture: Elasticsearch as the ONLY data store for critical
-- application data, relying on its eventual-consistency, near-real-time
-- model for data that needs strict transactional guarantees

-- RIGHT architecture: PostgreSQL/MySQL as the system of record,
-- Elasticsearch as a search/analytics index kept in sync
~~~

Elasticsearch's historical lack of full ACID transactions and its deliberate near-real-time (not instant) indexing model make it a poor fit as an application's sole, authoritative data store for anything requiring strict consistency guarantees — the standard, correct architecture pairs it with a genuine system of record.

### Other production-grade anti-patterns

- **Oversized JVM heap (beyond roughly 32GB, or too large a fraction of available RAM)**: starves the OS file system cache Lucene depends on heavily, often making performance WORSE, not better, despite the larger heap.
- **Choosing an arbitrary default shard count without considering actual data volume**: too many shards for a small index adds unnecessary coordination overhead; too few for a large, growing index limits horizontal scaling and forces a painful reindex later.
- **Using from/size for deep pagination**, incurring increasingly expensive per-request cost as the offset grows, rather than switching to search_after.
- **Ignoring cluster health status**: a persistently yellow or red cluster health signals a real, unaddressed problem (missing replicas or, worse, missing primary shards) that shouldn't be treated as routine background noise.
- **Not using bulk APIs for batch indexing**: issuing many individual index requests for a large data load is dramatically slower and less efficient than the dedicated bulk API.
- **Forcing an immediate refresh routinely** rather than for the rare case that genuinely needs immediate search visibility, incurring real, avoidable performance overhead.
`,

  performance: `
### Rule zero: measure first

~~~
GET /products/_search
{
  "query": { "match": { "description": "noise cancelling" } },
  "profile": true
}
~~~

The profile API shows detailed timing for each stage of query execution across shards — never guess at an Elasticsearch performance problem; use profile (or the simpler _explain endpoint for understanding a specific document's relevance score) to see exactly where time is spent.

### The performance hierarchy (apply in order)

1. **Use filter context instead of must for non-scoring conditions** — faster execution and cacheable results for pure yes/no filtering.
2. **Ensure appropriate field types** (keyword for exact match/aggregation) — an aggregation on a text field either fails or behaves unexpectedly, and using the wrong type can force expensive workarounds.
3. **Right-size shard count for actual data volume** — too many or too few shards both hurt performance, in different ways.
4. **Use bulk APIs for indexing**, dramatically more efficient than individual document indexing requests for batch loads.
5. **Tune JVM heap and let the OS file system cache do its job** — oversized heap starves the cache Lucene depends on.
6. **Use search_after for deep pagination**, avoiding from/size's increasingly expensive behavior at large offsets.

### Micro-level facts worth knowing

- Segment merging is a genuinely important background process — a high-write-volume index with merging falling behind accumulates many small segments, degrading query performance measurably; monitor merge activity for write-heavy indices.
- Force-merging segments (optimizing an index down to fewer, larger segments) can meaningfully improve read performance for indices that are no longer being actively written to (common for older log indices in a hot-warm-cold architecture), but is an expensive operation that shouldn't be run routinely on actively-written indices.
- Caching (the query cache, the request cache) helps significantly for repeated identical queries/filters, but cache invalidation on writes means a high-write-volume index sees less benefit from this than a mostly-read, occasionally-updated one.
`,

  scalability: `
Elasticsearch's scaling story is distinctly **horizontal-first**, with sharding designed in from the earliest versions — similar in philosophy to MongoDB, and a meaningfully different default posture than a relational database's vertical-first profile.

### Horizontal scaling via sharding

~~~mermaid
flowchart LR
    Coord["Coordinating layer"] --> Data1["Data node 1\n(shards 1, 4)"]
    Coord --> Data2["Data node 2\n(shards 2, 5)"]
    Coord --> DataN["Data node N\n(shards 3, 6)"]
~~~

Adding more data nodes lets Elasticsearch automatically rebalance shards across the expanded cluster, distributing both storage and query load — the standard, designed-in-from-the-start path for scaling beyond a single machine's capacity.

### Hot-warm-cold architecture for time-series/log data

~~~mermaid
flowchart LR
    Hot["Hot tier\n(fast storage, recent,\nfrequently-queried data)"] -->|ILM rollover| Warm["Warm tier\n(cheaper storage,\nolder, less-queried data)"]
    Warm -->|ILM rollover| Cold["Cold tier\n(cheapest storage,\nrarely-queried, often\nsearchable-but-slower)"]
~~~

For the log-aggregation use case specifically, tiered storage (managed via Index Lifecycle Management) lets an organization keep a large volume of historical data queryable at a much lower cost than keeping everything on the fastest, most expensive tier indefinitely.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single node's capacity exceeded | Add more data nodes; Elasticsearch rebalances shards automatically |
| Wrong shard count chosen upfront | Reindex into a new index with a corrected shard count (a real, planned operation, not instant) |
| Growing log/time-series data volume | Index Lifecycle Management with hot-warm-cold tiering to manage cost as data ages |
| Deep pagination performance | search_after cursor-based pagination instead of from/size |
| Query load from many concurrent users | More data nodes and/or dedicated coordinating-only nodes to spread request-routing overhead |
`,

  security: `
### Elasticsearch's built-in security features

1. **Authentication and role-based access control**: Elastic's security features (bundled as part of the default distribution since version 8, previously a paid add-on in earlier versions) provide user authentication and fine-grained, role-based permissions on indices and operations.
2. **TLS/SSL for connections**: encrypting data in transit, essential for any production deployment, and required by default in recent Elasticsearch versions specifically to prevent the historical pattern of exposed, unauthenticated instances.
3. **Field-level and document-level security**: restricting which specific fields or documents a given role can see, useful for multi-tenant search applications needing fine-grained access control beyond simple index-level permissions.

### The historical "exposed Elasticsearch instances" security lesson

Elasticsearch's history includes numerous well-publicized incidents of instances deployed without authentication (a real historical gap, particularly before security features became bundled by default), directly exposed to the internet, and subsequently scraped or exploited — a pattern directly parallel to MongoDB's and Redis's own historical exposed-instance incidents covered in those skills' respective sections, reinforcing the same industry-wide lesson about ecosystem-scale consequences of insecure defaults.

### What remains the application's responsibility

- **Query injection via unsanitized input in query construction**: while Elasticsearch's JSON-based Query DSL is less directly injection-prone than raw SQL string concatenation, building complex queries from unsanitized user input still requires careful validation, particularly for query types that can execute scripts (like scripted fields or certain aggregation types).
- **Secrets management**: API keys/credentials from environment variables or a secrets manager, never hardcoded.
- **Network isolation**: Elasticsearch should never be directly exposed to the public internet regardless of authentication configuration, sitting instead behind a private network/VPC with only application servers granted access.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing Elasticsearch-dependent application code follows similar principles to testing against any external search/data system.

~~~python
import pytest
from testcontainers.elasticsearch import ElasticSearchContainer

@pytest.fixture
def es_client():
    with ElasticSearchContainer("elasticsearch:8.11.0") as es:
        client = es.get_client()
        yield client

def test_index_and_search(es_client):
    es_client.index(index="test_products", document={"name": "Wireless Headphones"})
    es_client.indices.refresh(index="test_products")   -- force immediate searchability for the test
    response = es_client.search(index="test_products", query={"match": {"name": "headphones"}})
    assert response["hits"]["total"]["value"] == 1
~~~

Note the explicit indices.refresh() call in the test — without it, the near-real-time indexing delay could cause a flaky test that sometimes doesn't find a just-indexed document, a genuinely Elasticsearch-specific testing consideration.

### The senior testing doctrine

- Use Testcontainers (or a real, isolated test cluster) rather than mocking the client entirely — full-text search relevance and aggregation behavior is genuinely hard to accurately approximate with a mock.
- Always explicitly refresh the index after writes in tests, avoiding flaky test failures from the near-real-time indexing delay.
- Test mapping behavior explicitly (confirm a field is actually indexed as expected type), since a mapping mismatch can silently produce unexpected query behavior rather than a clear error.
- Clean up test indices between test runs to avoid state leaking between tests.
`,

  debugging: `
### The toolbox, in escalation order

1. **The _explain API** — shows exactly why (or why not) a specific document matched a query, and the detailed relevance score calculation, essential for debugging "why isn't this document showing up" or "why is this ranked lower than expected" questions.
2. **The profile API** — shows detailed per-shard, per-query-clause timing, the first tool for any "why is this query slow" investigation.
3. **Cluster health and cat APIs**: _cluster/health, _cat/indices, _cat/shards give a quick, human-readable overview of cluster and index state.
4. **_cat/thread_pool** — shows thread pool statistics, useful for diagnosing whether indexing or search request queues are backing up under load.
5. **Slow logs**: configuring index-level slow query and slow indexing logs surfaces operations exceeding a threshold, giving visibility into problems you didn't know to look for.
6. **Kibana's Dev Tools console** — a convenient interactive environment for running and iterating on queries directly against the cluster.

### Debugging common Elasticsearch-specific symptoms

- "A document I just indexed doesn't show up in search" — almost always the near-real-time indexing delay (roughly one second by default); either wait, or explicitly refresh if immediate visibility is genuinely needed.
- "Aggregation on a field fails or behaves unexpectedly" — check whether the field is mapped as keyword (needed for most aggregations) versus text (analyzed, generally not directly aggregatable without fielddata, itself a real memory cost).
- "Cluster health is yellow" — typically means replica shards aren't allocated (often because there's only one node, and replicas can't be allocated to the SAME node as their primary) — investigate node count and replica configuration.
- "Cluster health is red" — a primary shard is unavailable, a genuine data-availability problem requiring immediate investigation, distinct from yellow's less urgent "missing replica" state.
`,

  monitoring: `
Production Elasticsearch visibility rests on the same three pillars as any distributed system, with several Elasticsearch-specific signals worth first-class monitoring.

### Key metrics to track

- **Cluster health status (green/yellow/red)**: the single most important top-level signal, checked first in any Elasticsearch operational investigation.
- **JVM heap usage and garbage collection pause frequency**: given Elasticsearch's JVM-based architecture, GC pauses directly affect query/indexing latency, similar in spirit to the JVM tuning concerns covered in the **Spring Boot** skill.
- **Indexing and search request latency/throughput**: the primary application-facing performance signals.
- **Segment count and merge activity**: a growing, un-merged segment count for a heavily-written index predicts degrading query performance.
- **Disk usage and shard allocation**: approaching disk capacity risks Elasticsearch's own watermark-based protective mechanisms kicking in (read-only index enforcement to prevent running out of disk entirely).

### Tools

Kibana's Stack Monitoring feature provides built-in dashboards for cluster health, node resource usage, and index statistics; Elastic's own APM (Application Performance Monitoring) integrates with the broader Elastic Stack; for teams preferring a Prometheus-based stack, the elasticsearch_exporter integrates Elasticsearch metrics into Prometheus/Grafana — see the **Prometheus** and **Grafana** skills.

### Alerting priorities

Alert on: cluster health transitioning to yellow or red, JVM heap usage approaching the configured limit, disk usage approaching watermark thresholds, and any sustained increase in slow query/indexing log volume.
`,

  deployment: `
### Managed vs. self-hosted

~~~
Managed (Elastic Cloud, Amazon OpenSearch Service):
  + automated cluster management, scaling, and patching largely handled for you
  - Amazon OpenSearch Service specifically runs OpenSearch (the 2021 AWS fork),
    not vanilla Elasticsearch — verify which you actually need given any
    feature or licensing-specific requirements

Self-hosted (VMs or Kubernetes, e.g. via the Elastic Cloud on Kubernetes (ECK) operator):
  + full control over configuration and the choice between Elasticsearch and OpenSearch
  - operational responsibility for cluster management, JVM tuning, and security configuration
~~~

### Backup strategy

~~~
PUT /_snapshot/my_backup_repository
{
  "type": "s3",
  "settings": { "bucket": "my-elasticsearch-backups" }
}

PUT /_snapshot/my_backup_repository/snapshot_1
~~~

Elasticsearch's snapshot API provides incremental, cluster-consistent backups to a configured repository (commonly S3 or another cloud object store) — the standard production backup mechanism.

### High availability

Replicas (configured per-index, covered in Intermediate Concepts) provide the primary high-availability mechanism at the shard level; an odd number of master-eligible nodes (typically 3) ensures reliable quorum-based leader election for cluster-state management, avoiding split-brain scenarios during network partitions.

### CI/CD pipeline

Index templates and mapping changes are typically applied via infrastructure-as-code or application startup scripts rather than a traditional relational migration tool, since Elasticsearch mappings have their own update semantics (some field type changes require reindexing rather than an in-place ALTER-equivalent). See the **CI/CD**, **Docker**, and **Kubernetes** skills.
`,

  "production-checklist": `
Before an Elasticsearch deployment takes real traffic:

- [ ] Authentication and role-based access control configured explicitly
- [ ] TLS/SSL enabled for all connections
- [ ] Elasticsearch never directly exposed to the public internet
- [ ] JVM heap sized to roughly 50% of available RAM, capped around 32GB
- [ ] Shard count planned based on realistic data-volume projections
- [ ] An odd number (typically 3) of master-eligible nodes configured
- [ ] Replicas configured for every production index requiring high availability
- [ ] Index Lifecycle Management configured for time-series/log data
- [ ] Mappings designed deliberately (text versus keyword per field's actual use)
- [ ] Snapshot-based backups configured and actually tested for restoration
- [ ] search_after used for any genuinely deep pagination need
- [ ] Bulk APIs used for batch indexing, not many individual document requests
- [ ] Cluster health monitored as a first-class metric, with alerting on yellow/red
- [ ] Slow query/indexing logs enabled with an appropriate threshold
- [ ] Load test done: known query/indexing throughput and latency under realistic load
- [ ] Runbook: how to diagnose a yellow/red cluster and restore from a snapshot
`,

  "common-mistakes": `
1. **Confusing text and keyword field types**, using tokenized text fields where exact-match filtering/aggregation was actually needed, or vice versa.
2. **Using Elasticsearch as a primary system of record** for data requiring strict transactional guarantees, rather than pairing it with a genuine authoritative database.
3. **Oversizing JVM heap** beyond roughly 32GB or too large a fraction of available RAM, starving the OS file system cache Lucene depends on and often making performance worse.
4. **Choosing an arbitrary default shard count** without considering actual data-volume projections, later requiring a painful reindex to correct.
5. **Using from/size for deep pagination**, incurring increasingly expensive cost as the offset grows, rather than search_after.
6. **Not using bulk APIs for batch data loading**, dramatically slower than the dedicated bulk indexing endpoint.
7. **Ignoring cluster health status**, treating a persistently yellow or red cluster as routine background noise rather than a real, unaddressed problem.
8. **Running Elasticsearch without authentication, exposed to the internet**, a historically common, severely damaging misconfiguration paralleling MongoDB's and Redis's own equivalent histories.
9. **Forcing immediate refresh routinely** rather than only for the rare case genuinely needing immediate search visibility, incurring avoidable performance overhead.
10. **Not planning for Index Lifecycle Management on continuously-growing log/time-series data**, leading to unmanaged, ever-growing index counts and disk usage.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| mapper_parsing_exception | Attempting to index a value incompatible with the field's mapped type | Check the field's mapping matches the actual data shape, or reindex with a corrected mapping |
| search_phase_execution_exception | An error occurred during the scatter-gather query execution across shards | Check the detailed error for the specific shard-level failure reason |
| circuit_breaking_exception | A query/aggregation attempted to use more memory than the configured circuit breaker allows | Optimize the query (reduce aggregation cardinality, use filters), or increase the circuit breaker limit if genuinely justified |
| cluster_block_exception: index read-only | Disk usage exceeded the configured watermark, triggering automatic read-only protection | Free disk space or adjust watermark settings, then manually remove the read-only block |
| version_conflict_engine_exception | Two concurrent updates to the same document conflicted (optimistic concurrency control) | Retry the update, or use the appropriate retry_on_conflict parameter |
| illegal_argument_exception: Fielddata is disabled on text fields | Attempting to aggregate/sort on a text field without fielddata enabled | Use the field's keyword sub-field for aggregation/sorting instead, the standard fix |
| no_shard_available_action_exception | The shard needed to serve this request isn't currently available | Check cluster health; investigate node availability and shard allocation |
`,

  faqs: `
**Elasticsearch or OpenSearch?**
Both descend from the same 2021 fork point and remain largely API-compatible for core functionality, but have diverged in licensing (Elasticsearch's 2024 re-opening toward AGPL-compatible licensing versus OpenSearch's Apache 2.0/Linux-Foundation-adjacent governance) and some newer features. Choose based on current licensing preferences, cloud provider ecosystem (AWS's managed OpenSearch Service versus Elastic Cloud), and verify current feature parity for anything advanced before committing.

**Elasticsearch or a relational database's full-text search for a new project?**
Reach for Elasticsearch when you need genuinely fast, relevance-ranked, fuzzy full-text search at real scale, faceted search/aggregation, or log/analytics use cases; a relational database's basic full-text search extensions remain sufficient for simpler, smaller-scale text search needs where introducing an entirely separate system isn't justified.

**Can Elasticsearch replace a dedicated vector database for RAG applications?**
Increasingly, yes, for many use cases — its native k-NN vector search combined with BM25 keyword scoring via Reciprocal Rank Fusion provides genuine hybrid search capability, often outperforming pure vector similarity search alone; teams already operating Elasticsearch for search/log purposes frequently find this a natural extension rather than introducing an entirely separate vector database.

**Why isn't my just-indexed document showing up in search results?**
Elasticsearch's near-real-time (not instant) indexing model means a document typically becomes searchable within about one second (the default refresh_interval), not immediately upon indexing — this is a deliberate performance tradeoff, and applications needing tighter consistency for specific operations can force an immediate refresh, at a real performance cost if done routinely.

**Is Elasticsearch ACID-compliant?**
Not in the same sense as a relational database — Elasticsearch provides document-level atomicity and optimistic concurrency control (via version numbers), but not multi-document transactions or the same isolation guarantees a relational database provides, reinforcing why it's typically paired with a genuine system of record rather than used as one itself.

**How do I choose the right number of shards?**
Base it on realistic projections of total data volume, targeting individual shard sizes in the tens-of-gigabytes range as a common rule of thumb, since changing shard count later requires a full reindex — err toward slightly fewer, larger shards for smaller datasets, since excessive shard count for the actual data volume adds coordination overhead without benefit.
`,

  "interview-questions": `
### Junior level

1. **What is an inverted index, and why does it make full-text search fast?**
   Model answer: A data structure mapping each unique term to the documents (and positions) containing it — finding documents matching a term becomes a direct lookup rather than scanning every document's full text, fundamentally different from a relational LIKE query's row-scanning approach.

2. **What is the difference between a text field and a keyword field?**
   Model answer: A text field is analyzed/tokenized for full-text search (matching individual words, potentially with stemming); a keyword field is stored exactly as-is, used for exact matching, sorting, and aggregations — a very common beginner mistake is using the wrong type for a given field's actual use case.

3. **What does the bool query's filter clause do differently from must?**
   Model answer: Both require a match, but must contributes to the relevance score while filter does not and is cacheable — filter is faster and more semantically correct for pure yes/no conditions (like category or status) that shouldn't affect ranking.

4. **What is near-real-time indexing?**
   Model answer: A newly indexed document typically becomes searchable within about one second (the default refresh interval), not instantly — a deliberate performance tradeoff, since making every write instantly searchable would require much more expensive indexing operations.

5. **What is a shard, and why does an index have more than one?**
   Model answer: A shard is an independent Lucene index, one piece of a larger logical index, distributed across a cluster's nodes — splitting an index into multiple shards enables horizontal scaling of both storage and parallel query execution beyond a single machine's capacity.

### Senior level

6. **Explain the scatter-gather query execution pattern and its implications for shard count.**
   Model answer: A search query executes independently against every shard of an index (scatter), and a coordinating node merges and re-ranks the combined results (gather); this means more shards enable more query parallelism up to a point, but an excessive shard count for a given data volume adds coordination overhead (more scattering/gathering) without a proportional performance benefit, since each shard also carries real per-shard memory/file-handle cost.

7. **Why should JVM heap generally not exceed roughly 32GB in Elasticsearch, and what happens if you oversize it?**
   Model answer: A well-known JVM pointer-compression optimization becomes unavailable beyond roughly 32GB of heap, reducing memory efficiency sharply; additionally, oversizing heap (even below that threshold) as too large a fraction of available RAM starves the OS file system cache that Lucene relies on heavily for read performance, often making overall performance WORSE despite the larger heap.

8. **How would you design a hybrid search query combining keyword and vector similarity search, and why might that outperform either alone?**
   Model answer: Combine a traditional match query (BM25 relevance scoring) with a knn query (vector similarity), unified via Reciprocal Rank Fusion (RRF); this outperforms pure vector search alone for queries where exact term/name matching matters (which embeddings can miss) and outperforms pure keyword search alone for semantically related content sharing no exact keywords (which BM25 can miss) — combining both captures a broader range of genuine relevance signals.

9. **What's the difference between Elasticsearch and OpenSearch, and why do they exist as separate projects?**
   Model answer: Both descend from the same codebase; OpenSearch was forked by AWS in 2021 in direct response to Elastic's 2019 licensing change away from a fully open-source model, and the two have since diverged somewhat in licensing (Elastic notably reversed back toward open licensing in 2024) and some newer features, while remaining largely API-compatible for core functionality.

10. **Why is Index Lifecycle Management particularly important for log-aggregation use cases specifically?**
    Log/time-series data grows continuously and has naturally time-decaying query interest (recent data is queried far more than old data); ILM automates rolling over to new indices, migrating older indices to cheaper storage tiers (hot-warm-cold), and eventually deleting data past its retention period, managing both cost and operational overhead that would otherwise require constant manual intervention as data volume grows indefinitely.

11. **How would you diagnose and fix a cluster in "yellow" health status?**
    Model answer: Yellow means all primary shards are allocated but some replica shards are not — commonly caused by having fewer nodes than the configured replica count requires (a replica cannot be allocated to the same node as its primary); investigate node count and either add nodes or adjust the replica configuration to match actual cluster capacity.

12. **What are the tradeoffs of using Elasticsearch as an application's primary data store versus pairing it with a relational database?**
    Model answer: Elasticsearch lacks full multi-document ACID transactions and has a near-real-time (not instant) consistency model, making it a poor fit as the sole authoritative store for data requiring strict transactional guarantees; the standard, correct architecture pairs Elasticsearch (as a search/analytics index) alongside a genuine system of record (PostgreSQL/MySQL), with application logic or change-data-capture keeping the search index reasonably in sync.
`,

  "coding-questions": `
### 1. Build a faceted product search query (search + aggregation together)

~~~
GET /products/_search
{
  "query": {
    "bool": {
      "must": [{ "match": { "name": "headphones" } }],
      "filter": [{ "range": { "price": { "lte": 200 } } }]
    }
  },
  "aggs": {
    "by_category": { "terms": { "field": "category.keyword" } },
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [{ "to": 50 }, { "from": 50, "to": 150 }, { "from": 150 }]
      }
    }
  }
}
-- Returns matching products AND facet counts (by category, by price range)
-- in ONE request, exactly the pattern behind most e-commerce search UIs.
-- Follow-up: how would you make the category facet counts reflect ALL matching
-- products regardless of a category filter the user has already applied
-- (a common "sticky facet counts" UX requirement)?
~~~

### 2. Implement cursor-based deep pagination with search_after

~~~
GET /products/_search
{
  "size": 20,
  "query": { "match_all": {} },
  "sort": [{ "_id": "asc" }],
  "search_after": ["product_id_from_last_page"]
}
-- Each subsequent page passes the sort value(s) of the LAST result from the
-- previous page, avoiding from/size's increasingly expensive deep-offset cost.
-- Follow-up: why does search_after require a tiebreaker field (like _id) in
-- the sort, and what could go wrong without one if the primary sort field
-- has duplicate values?
~~~

### 3. Build a hybrid search query combining BM25 and vector similarity

~~~
GET /documents/_search
{
  "query": {
    "match": { "content": "quarterly revenue growth" }
  },
  "knn": {
    "field": "embedding",
    "query_vector": [0.12, 0.34, "..."],
    "k": 10,
    "num_candidates": 100
  },
  "rank": { "rrf": {} }
}
-- Reciprocal Rank Fusion merges the BM25-ranked and vector-similarity-ranked
-- result sets into one unified ranking.
-- Follow-up: how would you weight the keyword versus vector contribution
-- differently (rather than RRF's default equal weighting) if you determined
-- through evaluation that one signal was more reliable for your specific domain?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a product search index with faceted filtering
Design a mapping for a product catalog (with appropriate text/keyword fields), index sample data, and build search queries with category/price facets. Deliverable: a working faceted search API. Skills exercised: mapping design, bool queries, aggregations.

### Lab 2 (Intermediate): Diagnose and fix a slow query
Given a slow query (caused by a wrong field type, missing filter-context usage, or an oversized shard count), use the profile API to diagnose and fix it. Deliverable: a documented before/after performance comparison. Skills exercised: profile API, query optimization.

### Lab 3 (Advanced): Build a hybrid search RAG retrieval endpoint
Index a small document set with both text content and vector embeddings, and build a hybrid BM25-plus-k-NN search endpoint using RRF. Deliverable: a working hybrid retrieval API, compared against pure-keyword and pure-vector baselines. Skills exercised: k-NN search, RRF, retrieval quality evaluation.

### Lab 4 (Production): Set up ILM, monitoring, and cluster health alerting
Configure Index Lifecycle Management for a simulated log-ingestion index, set up cluster health monitoring, and simulate a node failure to observe replica-based failover. Deliverable: a production-checklist-compliant deployment with a documented failover test. Skills exercised: ILM, monitoring, high availability, the full production checklist.
`,

  "real-projects": `
### 1. A hybrid search backend for an internal knowledge base RAG assistant
Engineering requirements: indexing internal documents with both full-text content and vector embeddings, a hybrid BM25-plus-k-NN retrieval endpoint using RRF, and role-based document-level security ensuring users only retrieve content they're authorized to see. Demonstrates Elasticsearch's increasingly common role as a unified search-and-vector-retrieval backend for AI applications.

### 2. A centralized log aggregation and alerting platform
Engineering requirements: ingesting logs from many microservices via Beats/Logstash, Index Lifecycle Management for cost-effective long-term retention, Kibana dashboards for operational visibility, and percolator-based alerting rules matching incoming log patterns against saved alert criteria. Demonstrates the classic, still extremely common ELK/Elastic Stack observability use case.

### 3. An e-commerce product search and recommendation engine
Engineering requirements: a product catalog index with deliberate text/keyword field design, faceted search (category, price range, brand), relevance tuning via field boosting, and "more like this" recommendation queries based on product similarity. Demonstrates Elasticsearch's original, foundational application-search use case at production quality.
`,

  "case-studies": `
### The 2019 Elastic licensing change, the OpenSearch fork, and the 2024 reversal
Elastic's 2019 shift away from Apache 2.0, AWS's 2021 OpenSearch fork in direct response, and Elastic's own 2024 reversal back toward fully open-source licensing together form one of the most distinctive licensing-and-forking case studies among this platform's several similar stories (MongoDB/SSPL, Redis/Valkey, MySQL/MariaDB) — Elastic is notably the ONE company in this recurring pattern to have ultimately reversed course. Lesson: the "cloud provider commoditization forces a licensing change" pattern doesn't necessarily end in a permanent split; competitive pressure from a successful fork (OpenSearch's continued growth) can itself motivate the original steward to reconsider and re-open, a genuinely different outcome worth contrasting against the other permanent splits covered elsewhere on this platform.

### Wikipedia's search infrastructure
Wikipedia's use of Elasticsearch to power full-text search across its enormous, constantly-updated multilingual article corpus is a strong, publicly visible proof point for Elasticsearch's core value proposition at genuine internet scale — handling both the sheer text volume and the need for relevance-ranked, typo-tolerant search across a dataset most users interact with daily.

### GitHub's code search
GitHub's use of Elasticsearch to power code search across its massive repository corpus illustrates a somewhat specialized full-text search challenge — code has different tokenization needs than natural-language prose (identifiers, punctuation-heavy syntax, camelCase/snake_case splitting) — demonstrating Elasticsearch's analyzer customization flexibility applied to a genuinely different text-search domain than typical e-commerce or content search.

### The rise of hybrid search for RAG since 2023
The rapid growth in Elasticsearch's k-NN vector search and RRF-based hybrid search adoption specifically for RAG applications since 2023-2024 illustrates the same recurring pattern seen across this platform's other database skills (PostgreSQL/pgvector, MongoDB/Atlas Vector Search): an established, widely-deployed general-purpose technology (here, a search engine that predates the LLM/RAG boom by over a decade) finding significant new relevance when a new application category's needs turn out to align well with capabilities the technology was already well-positioned to add.
`,

  comparisons: `
| Aspect | Elasticsearch | OpenSearch | PostgreSQL (full-text) | A dedicated vector database |
|--------|---------------|-----------|------------------------|-------------------------------|
| Core strength | Full-text search + log analytics + hybrid vector search | Same core capabilities (2021 fork) | Basic full-text search alongside relational data | Pure vector similarity search, often at very large scale |
| Governance | Elastic (re-opened toward AGPL-compatible in 2024) | Linux Foundation-adjacent, Apache 2.0 | Neutral, community-governed | Varies by vendor |
| Scaling model | Native sharding, designed in from the start | Same (shared lineage) | Vertical-first, extensions for sharding | Usually purpose-built for horizontal scale |
| Query language | Query DSL (JSON) | Same (largely compatible) | SQL | Vendor-specific APIs, often simpler |
| Best fit | Full-text search, log aggregation, RAG hybrid search | Same use cases, AWS-ecosystem-aligned or licensing-sensitive teams | Simple text search alongside relational data | Pure, very-large-scale vector similarity needs |

**How seniors choose**: reach for Elasticsearch (or OpenSearch) when you need genuinely fast, relevance-ranked full-text search, log/operational analytics, or hybrid keyword-plus-vector search for RAG at meaningful scale; reach for PostgreSQL's basic full-text search when your search needs are simple and you'd rather not introduce a separate system; reach for a dedicated vector database when vector search alone, at very large scale with specialized tuning needs, is your dominant workload rather than one feature alongside text search.
`,

  "related-technologies": `
- **PostgreSQL** and **MySQL** — the relational databases Elasticsearch commonly pairs alongside as a search/analytics index, not a replacement for.
- **Vector Search** and **RAG** — the broader AI-application conceptual context Elasticsearch's k-NN and hybrid search capabilities serve.
- **Prometheus** and **Grafana** — the alternative, more general-purpose observability stack sometimes used instead of (or alongside) Kibana for metrics visualization.
- **Docker** and **Kubernetes** — how Elasticsearch is commonly containerized and orchestrated, or replaced by a managed offering (Elastic Cloud, Amazon OpenSearch Service).
- **Distributed Systems** — the general theory underlying Elasticsearch's sharding, replication, and cluster consensus mechanisms.

Learning path: general programming and JSON fluency → **PostgreSQL**/**MySQL** for a useful contrast → this page → **Vector Search**/**RAG** for the hybrid-search AI-application context → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Elasticsearch 8.x** is the current major line, with security features bundled by default (a notable shift from earlier versions where they were a paid add-on), and continued expansion of native vector search (k-NN) and RRF-based hybrid search capabilities.
- Elastic's **2024 re-licensing** back toward a fully open-source (AGPL-compatible) model for Elasticsearch and Kibana continues to reshape the competitive dynamic with OpenSearch — verify current licensing terms for both projects before a new deployment decision.
- **OpenSearch** continues independent development under its own roadmap, with some feature divergence from Elasticsearch growing over time since the 2021 fork — verify current feature parity for anything advanced (particularly newer vector search and hybrid search capabilities) before assuming interchangeability.
- Given the pace of change specifically in vector/hybrid search capabilities across both Elasticsearch and OpenSearch, check each project's official release notes for current capabilities rather than assuming parity with what's described here.
`,

  "future-roadmap": `
Where Elasticsearch (and OpenSearch) are heading, and what's worth betting career time on:

- **Continued hybrid search and RAG-specific tooling investment** — given the strong alignment between Elasticsearch's existing strengths (relevance ranking, scale) and the RAG application category's needs, expect continued significant feature development in this area across both Elasticsearch and OpenSearch.
- **Continued divergence or realignment between Elasticsearch and OpenSearch** — worth monitoring given Elastic's 2024 licensing reversal; the competitive and technical relationship between the two projects may continue evolving in ways that affect long-term technology choices.
- **Growing overlap with dedicated vector database capabilities** — as Elasticsearch's native vector search matures, expect it to remain a genuine, increasingly capable alternative to operating a separate vector database for many (though not all) RAG application scales.
- **What to bet on**: deep fluency in mapping design (the text-versus-keyword decision specifically), the Query DSL's bool/filter patterns, and understanding the inverted index and scatter-gather query model — these fundamentals remain valuable and largely transferable between Elasticsearch and OpenSearch given their shared lineage, regardless of which specific project a given deployment ultimately uses.
`,

  "cheat-sheet": `
~~~
-- ---- Index and document basics ----
PUT /products/_doc/1
{ "name": "Wireless Headphones", "price": 149.99, "category": "Electronics" }

-- ---- Mapping: text (full-text) vs keyword (exact match) ----
PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "category": { "type": "text", "fields": { "keyword": { "type": "keyword" } } }
    }
  }
}

-- ---- Full-text search ----
GET /products/_search
{ "query": { "match": { "description": "noise cancelling" } } }

-- ---- Combining queries: must (scored) vs filter (fast, cacheable, unscored) ----
GET /products/_search
{
  "query": {
    "bool": {
      "must": [{ "match": { "description": "headphones" } }],
      "filter": [{ "term": { "category.keyword": "Electronics" } }]
    }
  }
}

-- ---- Aggregations (faceted search) ----
GET /products/_search
{ "size": 0, "aggs": { "by_category": { "terms": { "field": "category.keyword" } } } }

-- ---- Deep pagination (NOT from/size) ----
GET /products/_search
{ "size": 20, "sort": [{ "_id": "asc" }], "search_after": ["last_id"] }

-- ---- Hybrid search (BM25 + vector) ----
GET /docs/_search
{
  "query": { "match": { "content": "revenue growth" } },
  "knn": { "field": "embedding", "query_vector": [...], "k": 10, "num_candidates": 100 },
  "rank": { "rrf": {} }
}

-- ---- Diagnose ----
GET /products/_search
{ "query": {...}, "profile": true }
GET /_cluster/health   -- green / yellow / red

-- ---- Production ----
-- JVM heap: ~50% of RAM, NEVER exceed ~32GB
-- 3 master-eligible nodes for quorum. Bulk API for batch indexing.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is an inverted index? | Maps each term to the documents containing it — enables fast lookup vs. full-text scanning. |
| text vs keyword field type? | text: tokenized, full-text searchable. keyword: exact match, sorting, aggregation. |
| must vs filter in a bool query? | must affects relevance score. filter doesn't — faster, cacheable, for yes/no conditions. |
| What is near-real-time indexing? | A doc becomes searchable ~1 second after indexing (refresh_interval), not instantly. |
| What is scatter-gather? | A query runs on EVERY shard (scatter); the coordinating node merges/re-ranks (gather). |
| Why not oversize JVM heap past ~32GB? | Loses a JVM pointer-compression optimization AND starves the OS file cache Lucene needs. |
| from/size vs search_after? | from/size gets expensive at deep offsets. search_after is cursor-based, stays fast. |
| Is Elasticsearch ACID-compliant like a relational DB? | No — pair it with a real system of record; don't use it as the sole authoritative store. |
| What does yellow cluster health mean? | Primary shards OK, but replicas aren't allocated (often: not enough nodes). |
| What is RRF? | Reciprocal Rank Fusion — merges BM25 keyword results with k-NN vector results. |
| Elasticsearch vs OpenSearch? | 2021 AWS fork after Elastic's licensing change; Elastic reversed back to open license in 2024. |
| Why use bulk APIs for loading data? | Dramatically more efficient than many individual index requests. |
| Historical ES security lesson? | Exposed, unauthenticated instances were breached — same lesson as MongoDB/Redis. |
`,

  mcqs: `
1. What does an inverted index map?
   A) Documents to their terms  B) Terms to the documents containing them  C) Shards to nodes  D) Queries to results
   **Answer: B** — the "inverse" of a forward index, enabling fast term lookup.

2. Which field type should you use for exact-match filtering and aggregation?
   A) text  B) keyword  C) Either works identically  D) Neither supports aggregation
   **Answer: B** — text is tokenized/analyzed; keyword is stored exactly as-is.

3. Why does the filter clause in a bool query execute faster than must for the same condition?
   A) It uses a different index  B) It skips relevance scoring and is cacheable  C) It only checks the first shard  D) It's not actually faster
   **Answer: B** — appropriate for pure yes/no conditions that shouldn't affect ranking.

4. What does Elasticsearch's near-real-time indexing model mean in practice?
   A) Writes are instantly searchable  B) A document becomes searchable roughly one second after indexing by default  C) Writes are never searchable  D) Only applies to keyword fields
   **Answer: B** — a deliberate performance tradeoff via the refresh_interval.

5. Why should JVM heap generally not exceed about 32GB in Elasticsearch?
   A) It's a hard licensing limit  B) A JVM pointer-compression optimization is lost beyond that threshold, and it starves the OS file cache  C) Elasticsearch caps it automatically  D) It causes a crash
   **Answer: B** — a well-known, genuinely important JVM/Lucene tuning consideration.

6. What is Reciprocal Rank Fusion (RRF) used for?
   A) Sharding strategy  B) Merging BM25 keyword and k-NN vector search results into one ranking  C) Cluster health monitoring  D) Backup scheduling
   **Answer: B** — the core mechanism behind Elasticsearch's hybrid search capability.
`,

  "revision-notes": `
Elasticsearch is a distributed search and analytics engine built on Apache Lucene, using an inverted index (mapping each term to the documents containing it) as its foundational data structure — enabling fast full-text search fundamentally differently from a relational database's row-scanning approach to text matching. Its historical dual purpose — full-text search (product catalogs, content, code) and log/operational-event aggregation (the ELK/Elastic Stack) — has grown a significant third use case since 2021: native k-NN vector search combined with BM25 keyword relevance via Reciprocal Rank Fusion, making Elasticsearch a genuine hybrid search option for RAG applications.

The text-versus-keyword field type distinction is Elasticsearch's most fundamental, most frequently misunderstood mapping concept: text fields are analyzed/tokenized for full-text search, while keyword fields are stored exactly as-is for exact matching, sorting, and aggregation — a single field is often mapped BOTH ways (as a multi-field) when it genuinely needs to serve both purposes. In queries, the bool query's filter clause (unscored, cacheable, for pure yes/no conditions) should be preferred over must (scored, contributes to relevance ranking) for anything that shouldn't affect result ordering, both for correctness and performance.

Elasticsearch's near-real-time (not instant) indexing model — a document typically becomes searchable roughly one second after indexing, via a configurable refresh_interval — is a deliberate performance tradeoff, since making every write instantly searchable would require far more expensive indexing operations; this is the source of a genuinely common "why isn't my just-indexed document showing up" question. Search queries execute via a scatter-gather pattern: independently against every shard of an index, with a coordinating node merging and re-ranking results afterward — meaning shard count directly affects query parallelism, but an excessive shard count for the actual data volume adds coordination overhead without corresponding benefit, since changing shard count later requires a full reindex, making the initial choice genuinely consequential.

JVM heap tuning is a critical, Elasticsearch-specific production concern: heap should generally target roughly 50% of available RAM and never exceed approximately 32GB (beyond which a JVM pointer-compression optimization is lost), leaving the remaining RAM for the OS file system cache that Lucene relies on heavily — oversizing heap is a common, damaging misconfiguration that often makes performance worse, not better. Elasticsearch lacks full multi-document ACID transactions, reinforcing why it's the standard, correct architecture to pair it with a genuine system of record (PostgreSQL/MySQL) rather than use it as an application's sole authoritative data store.

Elasticsearch's 2019 licensing change (away from Apache 2.0), AWS's resulting 2021 OpenSearch fork, and Elastic's own 2024 reversal back toward fully open-source licensing form a distinctive case study among this platform's several similar licensing-driven fork stories — notably the one case where the original steward ultimately reversed course rather than the split becoming permanent. Index Lifecycle Management (ILM) automates hot-warm-cold tiered storage for continuously-growing log/time-series data, managing cost as data ages and is queried less frequently — essential operational infrastructure for the log-aggregation use case specifically.
`,

  "learning-roadmap": `
**Week 1 — Document and mapping fundamentals**: indices, documents, the text-versus-keyword distinction, and basic match/term queries. Milestone: design a mapping for a small product catalog and write correct full-text and exact-match queries.

**Week 2 — Query DSL depth**: bool query combinations (must/filter/must_not/should), aggregations for faceted search, and relevance boosting. Milestone: build a faceted product search endpoint with category and price-range facets.

**Week 3 — Cluster architecture and scaling**: sharding, replication, the scatter-gather query model, and choosing an appropriate shard count. Milestone: set up a multi-node cluster and observe query behavior across shards.

**Week 4 — Performance and indexing at scale**: bulk indexing, Index Lifecycle Management, JVM heap tuning, and using profile/_explain to diagnose slow queries. Milestone: fix a deliberately introduced slow-query scenario, documenting the before/after profile output.

**Week 5 — Hybrid search for RAG**: k-NN vector search, Reciprocal Rank Fusion, and building a hybrid retrieval endpoint. Milestone: complete Lab 3, comparing hybrid search quality against pure-keyword and pure-vector baselines.

**Week 6 — Production practices**: security (authentication, TLS), monitoring (cluster health, JVM metrics), backup/restore via snapshots, and high availability. Milestone: complete the Lab 4 hands-on project end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Vector Search**/**RAG** for the deeper AI-application context, or **Prometheus**/**Grafana** for the broader observability stack Elasticsearch commonly integrates with.
`,

  "official-docs": `
- **elastic.co/guide** — the official Elastic Stack documentation, comprehensive and the primary reference for the Query DSL, mapping, and cluster configuration referenced throughout this page.
- **opensearch.org/docs** — the official OpenSearch documentation, essential for understanding where and how it has diverged from Elasticsearch since the 2021 fork.
- **elastic.co/guide/en/elasticsearch/reference/current/knn-search.html** — the official k-NN vector search documentation for RAG/hybrid search use cases.
- **elastic.co/guide/en/elasticsearch/reference/current/ilm-index-lifecycle.html** — the official Index Lifecycle Management documentation, essential for log-aggregation use cases.
- **lucene.apache.org** — the official Apache Lucene documentation, the underlying search library Elasticsearch is built on.
`,

  books: `
- **"Elasticsearch: The Definitive Guide" — Clinton Gormley and Zachary Tong** — the most widely recommended, comprehensive introduction (available free online), covering the full breadth of Elasticsearch's capabilities in depth, though some newer features postdate the book.
- **"Elasticsearch in Action" (2nd ed.) — Madhusudhan Konda** — a practical, up-to-date introduction covering modern Elasticsearch versions and features.
- **"Relevant Search" — Doug Turnbull and John Berryman** — focused specifically on relevance tuning and search quality, matching this page's Intermediate/Advanced Concepts sections in depth.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not Elasticsearch-specific, but essential foundational reading for the distributed-systems concepts (sharding, replication, consensus) underlying this page's Scalability section.
`,

  blogs: `
- **The official Elastic blog (elastic.co/blog)** — release announcements, hybrid search guidance, and the 2019/2024 licensing changes' official rationale directly from Elastic.
- **The OpenSearch project blog** — the community/AWS-adjacent perspective on the fork's ongoing development.
- **The Wikipedia and GitHub engineering blogs** — periodic posts on their respective Elasticsearch usage at scale, directly relevant to this page's Case Studies section.
- **Doug Turnbull's blog (softwaredoug.com)** — deep, practical content on search relevance tuning, matching the "Relevant Search" book above.
`,

  "research-papers": `
Elasticsearch, as a widely deployed production system built on Lucene, has relatively little dedicated academic literature of its own — the most relevant foundational reading concerns information retrieval theory and Lucene's own design:

- **Robertson, S. and Zaragoza, H. — "The Probabilistic Relevance Framework: BM25 and Beyond"** (2009) — the foundational academic treatment of the BM25 relevance-scoring algorithm Elasticsearch uses by default, essential for understanding relevance ranking at genuine rigor.
- **Manning, C., Raghavan, P., and Schutze, H. — "Introduction to Information Retrieval"** (2008, freely available online) — the widely used foundational textbook covering inverted indices, tokenization, and relevance ranking theory generally, directly applicable to understanding Elasticsearch's underlying algorithms.
- For the approximate nearest-neighbor search algorithms underlying Elasticsearch's k-NN vector search, see the foundational reading referenced in the **Vector Search** skill.
`,

  videos: `
- **ElasticON (Elastic's annual conference) talks** (widely available on YouTube) — the primary conference for the Elastic Stack ecosystem, featuring deep talks from Elastic engineers and large-scale production users.
- **The official Elastic YouTube channel** — tutorial series covering fundamentals through hybrid search and ILM-specific content.
- **OpenSearchCon talks** — covering OpenSearch's own development and production usage from companies operating it at scale.
- **Doug Turnbull's conference talks on search relevance** — deep, practical content on relevance tuning matching his book and blog.
`,

  "github-repos": `
- **elastic/elasticsearch** — the project's own source code, an advanced but genuinely rewarding read for understanding Lucene integration and cluster coordination internals directly.
- **opensearch-project/OpenSearch** — the Linux Foundation-adjacent fork's source, useful for tracking exactly how and where it has diverged from Elasticsearch since 2021.
- **elastic/elasticsearch-py** (and equivalents for other languages) — the official language-specific client libraries.
- **testcontainers/testcontainers-python** (elasticsearch module) — the testing tool referenced in this page's Testing section.
- **elastic/kibana** — the official visualization tool's source, paired with Elasticsearch in the classic ELK/Elastic Stack.
- **o19s/elasticsearch-learning-to-rank** — a widely used plugin for machine-learning-based relevance ranking, referenced in the context of advanced relevance tuning.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Mapping design**: given a described dataset (product catalog, log events), design an appropriate mapping distinguishing text and keyword fields correctly.
2. **Query DSL**: build a bool query combining full-text search, exact-match filtering, and date-range filtering for a described search requirement.
3. **Aggregations**: build a faceted search response returning both matching documents and category/price-range facet counts in one query.
4. **Performance diagnosis**: given a slow query and its profile API output, identify the bottleneck (wrong field type, missing filter context, or shard-count issue) and fix it.
5. **Hybrid search**: build a BM25-plus-k-NN hybrid search query using RRF, and compare its results against pure-keyword and pure-vector baselines on a small sample dataset.
6. **External practice sets**: Elastic's own official "Getting Started" tutorials for structured, guided practice; the "Elasticsearch: The Definitive Guide" companion exercises for deeper query DSL practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Application / Kibana"] --> Coord["Coordinating layer"]
    Coord --> Master1["Master-eligible node 1"]
    Coord --> Master2["Master-eligible node 2"]
    Coord --> Master3["Master-eligible node 3"]
    Coord --> DataHot["Data nodes: HOT tier\n(recent, frequently-queried)"]
    Coord --> DataWarm["Data nodes: WARM/COLD tier\n(older, less-queried, ILM-managed)"]
    DataHot -->|ILM rollover| DataWarm
    subgraph HybridSearch["Hybrid search for RAG"]
        BM25["BM25 keyword scoring"]
        KNN["k-NN vector search"]
        RRF["Reciprocal Rank Fusion"]
    end
    DataHot -.-> HybridSearch
    App2["Genuine system of record\n(PostgreSQL/MySQL)"] -.->|sync via app logic /\nchange-data-capture| DataHot
    subgraph Observability
        Kibana["Kibana dashboards"]
        Prometheus["elasticsearch_exporter\n+ Prometheus/Grafana"]
    end
    DataHot -.-> Observability
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Elasticsearch))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Concepts
      Inverted index
      Text vs keyword mapping
      Analyzers
      Near-real-time indexing
    Query DSL
      Match queries
      Bool must vs filter
      Aggregations
      search_after pagination
    Cluster Architecture
      Sharding
      Replication
      Scatter-gather queries
      Master and data nodes
    AI and Hybrid Search
      k-NN vector search
      Reciprocal Rank Fusion
      GraphRAG-adjacent RAG patterns
    Ecosystem
      ELK and Elastic Stack
      Elasticsearch vs OpenSearch
      Licensing history
    Production
      JVM heap tuning
      Index Lifecycle Management
      Security and auth
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default elasticsearch;
