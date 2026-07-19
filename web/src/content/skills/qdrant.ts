import type { SkillContent } from "../types";

/**
 * Qdrant — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const qdrant: SkillContent = {
  overview: `
Qdrant is an open-source vector database written in Rust, built around a specific engineering bet: a genuinely fast, memory-efficient, resource-conscious vector search engine, with a simpler operational footprint than a fully disaggregated system like Milvus, can serve the large majority of production vector search needs without requiring either Milvus's full distributed-microservice complexity or Pinecone's closed-source vendor lock-in. Where Weaviate differentiates through a schema-rich, cross-reference data model and built-in vectorization modules, Qdrant differentiates through raw performance efficiency, a comparatively lean operational profile, and a filtering system specifically engineered to stay fast even under complex, highly selective metadata conditions.

For an AI engineer, Qdrant is frequently the choice when a team wants a self-hosted, open-source vector database but doesn't need (or want to pay the operational cost of) Milvus's fully disaggregated architecture — a genuinely common sweet spot for teams at small-to-medium scale wanting production-grade performance, precise control over filtering behavior, and straightforward Docker/Kubernetes deployment without standing up a message-queue-coordinated distributed system. Qdrant's choice of Rust as its implementation language (the same language covered in this platform's own **Rust** skill, chosen specifically for memory safety without garbage-collection pauses) directly reflects its performance-and-efficiency-first design priorities.

Key characteristics: written in Rust for memory safety and predictable, GC-pause-free performance; a payload (metadata) filtering system specifically engineered with efficient indexing so complex, highly selective filters remain fast even combined with vector search; HNSW as its core vector indexing algorithm, with quantization options (scalar, product, and binary quantization) for memory efficiency at scale; a straightforward, comparatively simple deployment model (a single binary/container, with distributed clustering as an opt-in capability rather than an assumed default architecture); and both a fully open-source, self-hostable core (Apache 2.0) and Qdrant Cloud, a managed offering for teams wanting the convenience without operating infrastructure themselves.
`,

  history: `
Qdrant was created by **Andrey Vasnetsov** and **Andrei Zavgorodny**, originally built to solve a specific need at a similarity-search-heavy startup before the two founded a company around the resulting engine, choosing Rust deliberately for its performance and safety characteristics.

| Year | Milestone |
|------|-----------|
| 2020 | Development begins, motivated by the founders' direct experience needing genuinely fast, memory-efficient vector similarity search for production applications |
| 2021 | Qdrant is **open-sourced** under the Apache 2.0 license, built in Rust from the outset |
| 2021 | Qdrant Inc. (the company) is founded to commercially steward the project and build a managed cloud offering around it |
| 2022 | Continued growth in adoption, with Qdrant's specific engineering emphasis on filtering performance and resource efficiency drawing attention from teams comparing it against Milvus's heavier architecture and Pinecone's closed-source model |
| 2023 | The LLM/RAG application boom drives significant Qdrant adoption growth, alongside every other vector database in this category, with Qdrant's simpler operational footprint specifically appealing to smaller teams and startups |
| 2023 | **Qdrant Cloud** (the managed offering) launches and expands, providing a middle-ground option between full self-hosting and a closed-source service |
| 2024 | Continued expansion of quantization options (binary quantization in particular, offering dramatic memory savings for certain embedding types) and filtering performance improvements |
| 2024–2025 | Continued releases with performance benchmarking increasingly emphasized in Qdrant's own public positioning, alongside expanded multi-tenancy and hybrid search (dense plus sparse vector) support |

Qdrant's choice to build in Rust from the very beginning, rather than a more common choice like Go or C++ for a systems-level database project, directly reflects a deliberate engineering bet on memory safety without garbage-collection pauses — the same tradeoff analysis covered in this platform's **Rust** skill, applied specifically to the vector-search domain where consistent, predictable low-latency performance under concurrent load is a genuine, measurable product differentiator.
`,

  "why-it-exists": `
Qdrant exists because its founders identified a specific gap in the emerging vector database landscape: **existing options in the space were either not purpose-built for vector search's specific performance characteristics, or came with more operational and architectural complexity than many teams' actual scale genuinely required**, and a leaner, Rust-based engine specifically engineered for raw speed and efficient filtering could serve a large share of real-world production needs without that overhead.

The prior landscape (early vector database options, around Qdrant's founding) offered:

1. **General-purpose databases with vector extensions**: functional, but not purpose-built for vector search's specific performance profile.
2. **Early dedicated vector databases with heavier architectural footprints**: solving the feature gap, but at a genuine operational complexity cost (a fully disaggregated microservice architecture, for instance) that not every team's actual scale requirements justified.

Qdrant's insight was that a large share of teams building vector-search-powered applications genuinely needed strong performance and correct, efficient metadata filtering, WITHOUT needing the extreme, billion-vector distributed scale that justifies a fully disaggregated architecture's operational cost — and that choosing Rust specifically (for predictable, GC-pause-free performance and memory safety) plus a deliberately simpler, more monolithic-by-default deployment model (clustering as an opt-in capability, not an assumed default) could deliver excellent performance at a genuinely lower operational complexity than the alternative of always reaching for the most architecturally sophisticated option. This positioned Qdrant specifically for the substantial, common middle ground between "I need Milvus's full distributed scale" and "I just want raw FAISS with no operational layer at all."
`,

  "problem-it-solves": `
Qdrant solves the **"I need production-grade, self-hosted vector search with fast, correct metadata filtering, without Milvus's full distributed-architecture operational complexity or Pinecone's vendor lock-in"** problem.

Concretely, Qdrant provides:

- **Genuinely fast, memory-efficient search**: built in Rust specifically for predictable performance without garbage-collection pauses, a real, measurable engineering advantage for latency-sensitive production workloads.
- **A filtering system engineered for correctness and speed together**: Qdrant's payload indexing is specifically designed so complex, highly selective metadata filters remain fast when combined with vector search, addressing a common weak point in some other vector databases where heavily-filtered queries can degrade substantially.
- **Quantization options for memory efficiency**: scalar, product, and binary quantization let you trade some precision for dramatically reduced memory footprint at scale, similar in spirit to FAISS's Product Quantization but as a built-in database capability rather than a raw algorithmic building block.
- **A comparatively simple deployment model**: a single binary/container runs a fully-functional Qdrant instance, with distributed clustering available as an opt-in capability for genuine scale needs, rather than requiring a fully disaggregated architecture by default the way Milvus does.
- **Full open-source licensing (Apache 2.0) with Qdrant Cloud as an optional managed layer**: no vendor lock-in for the self-hosted path, with a managed convenience option available.

What Qdrant deliberately does **not** solve, or solves with a real tradeoff: it doesn't provide Weaviate's schema-rich cross-reference data model or built-in vectorization modules — Qdrant's data model is more straightforwardly points (vectors) with an attached JSON payload, closer to Pinecone's flat metadata model than Weaviate's structured schema; and while Qdrant supports distributed clustering for genuine scale needs, it doesn't target the same extreme, billion-vector-plus, fully disaggregated architecture Milvus specifically targets — Qdrant's sweet spot is strong performance at small-to-large (not necessarily the most extreme) scale, with operational simplicity as a deliberate, explicit design priority.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Qdrant's core design priorities (performance, filtering correctness/speed, operational simplicity) and how they differ from Milvus's and Weaviate's respective emphases.
2. Create collections, upsert points with vector and payload data, and perform similarity search combined with payload filtering.
3. Use Qdrant's filter syntax effectively, including nested conditions and range/geo filters.
4. Apply quantization options (scalar, product, binary) to trade precision for memory efficiency at scale.
5. Understand Qdrant's HNSW-based indexing and its configuration parameters.
6. Design an appropriate multi-tenancy strategy using Qdrant's payload-based approach.
7. Deploy Qdrant in a self-hosted context (Docker/Kubernetes) versus using Qdrant Cloud.
8. Compare Qdrant against Pinecone, Milvus, and Weaviate, articulating each option's specific tradeoffs.
9. Answer senior-level interview questions on Qdrant's filtering architecture, quantization tradeoffs, and when it's the right (or wrong) choice.
`,

  prerequisites: `
- **Required**: the **Embeddings** and **Vector Search** skills — Qdrant stores and searches vector embeddings using the same ANN algorithm concepts covered there.
- **Very helpful**: the **FAISS** skill, since Qdrant's HNSW indexing and quantization options build on the same underlying algorithmic concepts.
- **Very helpful**: the **Pinecone**, **Milvus**, and **Weaviate** skills for direct comparison — understanding the other three major options in this category clarifies precisely where Qdrant's performance-and-simplicity-focused positioning fits.
- **Helpful**: the **Rust** skill for understanding the language Qdrant is implemented in and why that choice matters for its performance characteristics.

Dependency links: **Embeddings** and **Vector Search** → **FAISS** for algorithmic grounding → **Pinecone**/**Milvus**/**Weaviate** for contrasting architectures → this page → **RAG** for the application context → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Creating a collection

~~~python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url="http://localhost:6333")

client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)
~~~

A "collection" in Qdrant is the top-level container for a set of related vectors and their payloads — size and distance must match your embedding model's actual output and intended comparison metric.

### Upserting points with vector and payload data

~~~python
from qdrant_client.models import PointStruct

client.upsert(
    collection_name="documents",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, 0.3, "..."],
            payload={"category": "electronics", "price": 149.99, "in_stock": True}
        )
    ]
)
~~~

Qdrant calls stored items "points" (a vector plus its ID and payload), and "upsert" (like Pinecone's) is the core update-or-insert write operation — payload is Qdrant's term for what Pinecone calls metadata, functionally the same concept.

### Basic similarity search

~~~python
results = client.query_points(
    collection_name="documents",
    query=[0.15, 0.22, 0.31, "..."],
    limit=5
)
for point in results.points:
    print(point.id, point.score, point.payload)
~~~

query_points() returns the most similar points to the query vector, along with each match's similarity score and payload — directly analogous to Pinecone's query() or Milvus's search().

### Combining search with payload filtering

~~~python
from qdrant_client.models import Filter, FieldCondition, MatchValue, Range

results = client.query_points(
    collection_name="documents",
    query=[0.15, 0.22, 0.31, "..."],
    query_filter=Filter(
        must=[
            FieldCondition(key="category", match=MatchValue(value="electronics")),
            FieldCondition(key="price", range=Range(lte=200))
        ]
    ),
    limit=5
)
~~~

Qdrant's filter syntax uses explicit Filter/FieldCondition objects (rather than Pinecone's JSON operator dictionaries or Milvus's SQL-like expressions or Weaviate's Filter builder) — combining vector similarity with structured payload conditions in one query, the same "similar AND matching this condition" capability seen throughout this category.

Common beginner trap: creating a collection with the wrong distance metric relative to how the embedding model was actually trained — covered fully in Intermediate Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### Payload indexing for filter performance

~~~python
client.create_payload_index(
    collection_name="documents",
    field_name="category",
    field_schema="keyword"
)
~~~

Explicitly indexing a payload field used for frequent filtering is a genuinely important Qdrant-specific performance practice — without an index, filtering on a payload field requires scanning, while an indexed field enables efficient, targeted filtering, directly analogous to why you'd index a frequently-filtered column in a relational database.

### Nested and complex filter conditions

~~~python
from qdrant_client.models import Filter, FieldCondition, MatchAny, MatchExcept

query_filter = Filter(
    must=[FieldCondition(key="category", match=MatchAny(any=["electronics", "computers"]))],
    must_not=[FieldCondition(key="status", match=MatchValue(value="discontinued"))],
    should=[FieldCondition(key="featured", match=MatchValue(value=True))]
)
~~~

must (AND, required), must_not (NOT, excluded), and should (OR, boosts relevance but doesn't require a match) can be combined and nested, providing expressive filter logic comparable to the operators covered in the **Pinecone**, **Milvus**, and **Weaviate** skills, with Qdrant's own specific syntax.

### Quantization for memory efficiency

~~~python
from qdrant_client.models import ScalarQuantization, ScalarQuantizationConfig, ScalarType

client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    quantization_config=ScalarQuantization(
        scalar=ScalarQuantizationConfig(type=ScalarType.INT8, quantile=0.99, always_ram=True)
    )
)
~~~

Scalar quantization (compressing float32 vector components to int8) is one of several quantization options Qdrant provides, trading some precision for meaningfully reduced memory usage — the same fundamental tradeoff covered in the **FAISS** skill's Product Quantization discussion, offered here as a built-in collection configuration rather than a separate algorithmic step you'd build yourself.

### Multi-tenancy via payload-based partitioning

~~~python
client.upsert(
    collection_name="documents",
    points=[PointStruct(id=1, vector=[...], payload={"tenant_id": "tenant-42", "category": "electronics"})]
)

results = client.query_points(
    collection_name="documents",
    query=[...],
    query_filter=Filter(must=[FieldCondition(key="tenant_id", match=MatchValue(value="tenant-42"))]),
    limit=5
)
~~~

Unlike Pinecone's namespaces or Weaviate's native multi-tenancy feature, Qdrant's common multi-tenancy approach is simply payload-based filtering combined with a payload index on the tenant field — simpler conceptually, though requiring the application to correctly apply the tenant filter on every query, since there's no structurally separate namespace enforcing isolation the way Pinecone's model provides.

### Named vectors for multi-vector points

~~~python
client.create_collection(
    collection_name="documents",
    vectors_config={
        "text_embedding": VectorParams(size=768, distance=Distance.COSINE),
        "image_embedding": VectorParams(size=512, distance=Distance.COSINE)
    }
)
~~~

Qdrant supports multiple named vectors per point (a text embedding AND an image embedding on the same point, for instance), letting a single collection support multi-modal search or multiple embedding models for the same underlying entity — a distinctive capability useful for genuinely multi-modal applications.
`,

  "advanced-concepts": `
### HNSW configuration and tuning

~~~python
from qdrant_client.models import HnswConfigDiff

client.update_collection(
    collection_name="documents",
    hnsw_config=HnswConfigDiff(m=16, ef_construct=200)
)

results = client.query_points(collection_name="documents", query=[...], limit=5, search_params={"hnsw_ef": 128})
~~~

Qdrant's HNSW parameters (m, ef_construct at index-build time; hnsw_ef at query time) map directly onto the same HNSW concepts covered in depth in the **FAISS** skill — the same speed-versus-recall tradeoff, exposed as tunable Qdrant configuration rather than a raw FAISS parameter.

### Binary quantization for extreme memory efficiency

~~~python
from qdrant_client.models import BinaryQuantization, BinaryQuantizationConfig

client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    quantization_config=BinaryQuantization(binary=BinaryQuantizationConfig(always_ram=True))
)
~~~

Binary quantization compresses each vector component to a single bit, providing extremely aggressive memory reduction (and correspondingly fast comparison operations, since bitwise operations are very cheap) — most effective for embedding models specifically well-suited to this level of compression (some models retain surprisingly good recall even under binary quantization, others degrade substantially), making empirical validation on your actual embedding model essential before committing to this approach in production.

### Filtering architecture: why Qdrant emphasizes filter performance specifically

~~~mermaid
flowchart LR
    Query["Query: vector + filter"] --> PayloadIndex["Payload index\n(narrows candidates by filter FIRST,\nif selective enough)"]
    PayloadIndex --> HNSWTraversal["HNSW graph traversal\n(restricted to filtered candidates)"]
    HNSWTraversal --> Results["Top-k results"]
~~~

A well-known challenge for HNSW-based vector databases generally is that naively applying a filter AFTER finding approximate nearest neighbors (rather than integrating filtering into the search itself) can produce poor results when the filter is highly selective (few candidates match) — Qdrant's specific engineering investment in this area (efficiently combining payload filtering with HNSW graph traversal, rather than treating them as two independent, sequential steps) is one of its most distinctive technical differentiators, directly addressing a genuine, well-documented weak point in some other implementations.

### Distributed clustering (opt-in, not default)

~~~python
# Cluster configuration is set at deployment time, not assumed by default
# the way Milvus's architecture requires
~~~

Qdrant supports distributed clustering (sharding and replication across multiple nodes) for genuine scale needs, but — reflecting its "simple by default, sophisticated when needed" design philosophy — a single-node Qdrant deployment is a complete, fully-functional system on its own, with clustering as an explicit, opt-in capability rather than an assumed baseline architecture the way Milvus's fully disaggregated design requires from the start.

### Hybrid search with sparse vectors

~~~python
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    sparse_vectors_config={"text_sparse": SparseVectorParams()}
)

results = client.query_points(
    collection_name="documents",
    query=dense_query_vector,
    using="dense",
    query_filter=None,
    limit=5
)
~~~

Qdrant supports hybrid search combining dense and sparse vectors (conceptually similar to Pinecone's and Weaviate's hybrid search capabilities), addressing the same "pure semantic search can miss exact terms" gap covered throughout this category.
`,

  "internal-working": `
What happens inside Qdrant from an upsert/search call to a result:

~~~mermaid
flowchart LR
    A["Client upsert/search call"] --> B["Qdrant server\n(Rust, single process\nor distributed cluster)"]
    B --> C["Payload storage\n(JSON-like, with optional\nfield-specific indexes)"]
    B --> D["Vector storage\n(HNSW index,\noptionally quantized)"]
    C --> E["Filter evaluation"]
    D --> F["HNSW graph traversal"]
    E --> F
    F --> G["Top-k results returned"]
~~~

1. **Request handling**: Qdrant's Rust-based server process handles the incoming request — for a single-node deployment, this is genuinely simpler than Milvus's multi-service architecture, with the server itself managing both payload and vector storage directly.
2. **Combined filter-and-vector search**: rather than filtering results AFTER a pure vector search (a naive approach that can produce poor results under highly selective filters, as covered in Advanced Concepts), Qdrant's engine integrates payload filtering into the HNSW graph traversal itself where possible, a genuine engineering investment specifically addressing this common weak point.
3. **Quantization (if configured)**: if the collection uses quantization, vector comparisons operate on the compressed representation, trading some precision for reduced memory footprint and (for binary quantization especially) faster comparison operations.
4. **Result assembly**: matching points' scores, IDs, and payloads are assembled into the response.

**Why Rust's memory-safety-without-garbage-collection matters here specifically**: because vector search is a genuinely latency-sensitive, memory-intensive workload (holding large HNSW graphs and vector data in memory, serving many concurrent queries), a language without garbage-collection pauses provides more PREDICTABLE tail latency than a garbage-collected language might under the same load — directly analogous to why Redis's single-threaded model and Node.js's event loop each make their own specific tradeoffs for predictable performance, just applied here via Rust's ownership-based memory management instead.
`,

  architecture: `
A senior engineer thinks about Qdrant at two levels: **its deliberately simpler, single-binary-by-default deployment model** (a genuine contrast to Milvus's assumed distributed architecture) and **payload/filter design as the primary engineering decision**, since Qdrant's data model is more straightforwardly flat (points with payloads) than Weaviate's schema-rich cross-reference model.

### Qdrant's deployment simplicity as architecture

~~~mermaid
flowchart TB
    subgraph SingleNode["Single-node Qdrant (the default, complete deployment)"]
        QdrantServer["Qdrant server (Rust)"]
        Storage["Local storage:\nvectors (HNSW) + payloads"]
        QdrantServer --> Storage
    end
    subgraph Cluster["Distributed cluster (opt-in, for genuine scale)"]
        Node1["Qdrant node 1"]
        Node2["Qdrant node 2"]
        NodeN["Qdrant node N"]
    end
~~~

Unlike Milvus, where a genuinely production-grade deployment assumes multiple microservices and a message queue from the start, a single Qdrant node is a complete, fully-functional system — clustering is an explicit choice made when genuine scale requirements justify it, not an architectural assumption baked in from the beginning.

### Payload and filter design as the primary decision

~~~
Application design decisions in Qdrant:
├── Payload schema (what fields need filtering, indexed explicitly
│                     for filter performance)
├── Quantization strategy (scalar/product/binary, validated
│                            empirically against your actual
│                            embedding model's recall tolerance)
├── Named vectors (if multi-modal or multiple embeddings
│                    per entity are genuinely needed)
├── Multi-tenancy approach (payload-based filtering with an
│                             indexed tenant field, applied
│                             consistently by the application)
└── Single-node vs distributed cluster (based on actual scale needs)
~~~

Rules mature teams follow: explicitly index payload fields used for frequent filtering; validate quantization choices empirically against your specific embedding model's actual recall tolerance; and consistently apply tenant-scoping filters at the application layer if using payload-based multi-tenancy, since Qdrant doesn't structurally enforce this the way Pinecone's namespaces or Weaviate's native multi-tenancy do.
`,

  "data-flow": `
Tracing one filtered search query end to end:

~~~mermaid
sequenceDiagram
    participant App
    participant Qdrant
    participant PayloadIndex as Payload index
    participant HNSW as HNSW graph

    App->>Qdrant: query_points(vector=embedding,\nfilter={category: electronics, price <= 200}, limit=5)
    Qdrant->>PayloadIndex: evaluate filter conditions,\nidentify candidate points matching the filter
    Qdrant->>HNSW: traverse the HNSW graph,\nrestricted to (or informed by) filtered candidates
    HNSW-->>Qdrant: top-k matching points among filtered candidates
    Qdrant-->>App: results with scores and payloads
~~~

The most misunderstood part for newcomers: **a highly selective filter combined with vector search is NOT simply "search first, then filter"** — if it were, a filter matching only 0.1% of a collection could force scanning a huge number of approximate-nearest-neighbor candidates before finding enough that also pass the filter, or worse, silently return fewer than the requested top-k results; Qdrant's specific engineering investment in integrating filtering with HNSW traversal directly (rather than treating them as two independent sequential steps) is precisely what addresses this genuine, well-documented challenge other implementations sometimes handle less gracefully.
`,

  "production-usage": `
### Deploying Qdrant with Docker

~~~bash
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
~~~

A single Docker command runs a complete, fully-functional Qdrant instance — genuinely simpler than Milvus's multi-service Docker Compose requirement, directly reflecting Qdrant's deliberate operational-simplicity design priority.

### Non-negotiables for production

1. **Explicitly index every payload field used for frequent filtering** — an unindexed filter field forces a less efficient scan-based evaluation.
2. **Validate quantization choices empirically** against your actual embedding model's recall tolerance before committing to it in production — binary quantization especially can have model-dependent recall impact.
3. **Choose distributed clustering deliberately** only when genuine scale requirements justify the added operational complexity, not as a default.

### Common production stacks

- **RAG applications at small-to-medium scale**: Qdrant's straightforward deployment and strong filtering performance make it a common choice for teams wanting self-hosted control without Milvus's architectural overhead.
- **Applications with heavily-filtered vector search**: e-commerce search, permission-scoped document retrieval, and similar use cases where filter selectivity is genuinely important benefit specifically from Qdrant's filtering-performance engineering emphasis.
- **Qdrant Cloud for teams wanting Qdrant's capabilities without self-hosting**: the same managed-convenience tradeoff covered for Zilliz Cloud/Milvus and Weaviate Cloud/Weaviate.
`,

  "industry-examples": `
- **X (Twitter)**: has publicly discussed using Qdrant for recommendation and content-similarity infrastructure, valuing its performance characteristics at genuine production scale.
- **HuggingFace**: has referenced Qdrant in various semantic search and embedding-related tooling and educational content, reflecting its standing within the broader ML/AI tooling ecosystem.
- **Many startups and smaller engineering teams**: Qdrant's comparatively simple operational footprint makes it a common choice specifically for teams wanting self-hosted, open-source vector search without dedicating significant infrastructure engineering effort to operating it.
- **Discord**: has explored vector search infrastructure options (including Qdrant among evaluated choices) for content moderation and similarity-detection use cases at scale.
- **Various e-commerce and content platforms**: specifically valuing Qdrant's filtering performance for product search and content recommendation scenarios with genuinely complex, highly selective filter conditions.
- **Qdrant's own growing customer base** (both self-hosted open-source users and Qdrant Cloud customers): spans a wide range of company sizes, with a notable concentration among teams specifically prioritizing performance benchmarks and operational simplicity in their vector database evaluation process.

Pattern to notice: Qdrant adoption clusters around **teams wanting genuine self-hosted control and strong performance without Milvus's full architectural complexity** — a distinct middle-ground positioning from Milvus's large-scale/disaggregated-architecture focus, Weaviate's schema-rich/integrated-pipeline focus, and Pinecone's fully-managed-convenience focus.
`,

  "best-practices": `
1. **Explicitly index every payload field used for frequent filtering** — a genuinely important, easy-to-overlook Qdrant-specific performance practice.
2. **Validate quantization choices empirically** against your specific embedding model's actual recall tolerance, especially for binary quantization's more aggressive compression.
3. **Choose distributed clustering deliberately** based on actual scale needs, taking advantage of Qdrant's genuine "simple by default" deployment model rather than assuming distributed complexity is always necessary.
4. **Apply tenant-scoping filters consistently at the application layer** if using payload-based multi-tenancy, since Qdrant doesn't structurally enforce this isolation the way Pinecone's namespaces or Weaviate's native multi-tenancy do.
5. **Tune HNSW parameters (m, ef_construct, hnsw_ef) empirically** for your actual data and recall requirements, the same discipline covered in the **FAISS** skill.
6. **Use named vectors for genuinely multi-modal or multi-embedding-per-entity use cases**, rather than creating separate collections unnecessarily.
7. **Choose the correct distance metric matching your embedding model's actual training/intended comparison method** — the same universal vector-database consideration covered throughout this category.
8. **Batch upserts** for efficient bulk ingestion, the same universal discipline covered across every database on this platform.
9. **Consider Qdrant Cloud if self-hosting's operational burden outweighs its benefits** for your specific team's capacity and priorities.
10. **Monitor filter selectivity and query latency together**, since Qdrant's filtering-and-search integration performance characteristics depend on both factors jointly.
11. **Use must/must_not/should filter combinations deliberately**, understanding should's OR/boost semantics differ meaningfully from must's required-AND semantics.
12. **Test recall empirically when using quantization**, comparing quantized search results against unquantized (exact or standard HNSW) results on representative data.
`,

  "anti-patterns": `
### Filtering on an unindexed payload field expecting good performance

~~~python
# WRONG — filtering on 'category' without ever creating a payload index for it,
# forcing a less efficient evaluation path
client.query_points(collection_name="documents", query=[...],
    query_filter=Filter(must=[FieldCondition(key="category", match=MatchValue(value="electronics"))]))
# (no payload index was ever created for 'category')

# RIGHT — explicitly index frequently-filtered fields
client.create_payload_index(collection_name="documents", field_name="category", field_schema="keyword")
~~~

This is one of the most common, most easily-fixed Qdrant performance mistakes — the filtering-performance engineering investment Qdrant makes is most effective when payload fields used for filtering are explicitly indexed.

### Assuming payload-based multi-tenancy provides the same structural isolation as Pinecone's namespaces

~~~python
# RISKY — relying purely on application code to remember to apply the
# tenant filter on EVERY query, with no structural enforcement if forgotten
results = client.query_points(collection_name="documents", query=[...], limit=5)
# (forgot the tenant_id filter — this could leak data across tenants!)

# SAFER — wrap all tenant-scoped queries in a function that ALWAYS
# applies the tenant filter, making the omission structurally harder
def tenant_scoped_search(client, tenant_id, query_vector, limit=5):
    return client.query_points(collection_name="documents", query=query_vector,
        query_filter=Filter(must=[FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))]), limit=limit)
~~~

Because Qdrant's payload-based multi-tenancy has no structural enforcement (unlike Pinecone's namespace scoping or Weaviate's native multi-tenancy), a forgotten filter is a genuine, serious data-isolation bug risk — wrapping tenant-scoped access in a consistently-used application-layer abstraction mitigates this risk.

### Other production-grade anti-patterns

- **Using binary quantization without empirical recall validation**: some embedding models tolerate this aggressive compression well, others degrade substantially — never assume, always measure.
- **Choosing distributed clustering prematurely** for a workload that a single, well-resourced node would handle comfortably, adding unnecessary operational complexity.
- **Not batching bulk upserts**: issuing many individual point upserts instead of efficiently batched operations.
- **Ignoring the distance metric mismatch risk**: using the wrong distance metric (L2 versus cosine/dot product) relative to how the embedding model was actually trained, producing subtly wrong relevance rankings.
`,

  performance: `
### Rule zero: measure filter selectivity and search performance together

Since Qdrant's performance characteristics depend jointly on filter selectivity and vector search parameters, measure end-to-end query latency under REALISTIC filter conditions, not just unfiltered vector search benchmarks alone.

### The performance hierarchy (apply in order)

1. **Index every payload field used for frequent filtering** — the single most common, most impactful Qdrant-specific performance fix.
2. **Tune HNSW parameters empirically** (the same fundamental tradeoffs covered in the **FAISS** skill) for your actual data scale and recall requirements.
3. **Use quantization deliberately, validated empirically**, for genuinely memory-constrained large-scale collections.
4. **Batch upserts** for efficient bulk ingestion.
5. **Consider named vectors' storage/compute cost** if using multiple embeddings per point — each named vector maintains its own HNSW index, a real resource multiplier.
6. **Scale to a distributed cluster** only once a single node's capacity is genuinely the measured bottleneck.

### Micro-level facts worth knowing

- Qdrant's Rust implementation avoids garbage-collection pauses, providing more predictable tail latency under concurrent load than a garbage-collected implementation might exhibit at the same throughput.
- Binary quantization's memory savings are dramatic (potentially 32x versus float32), but its recall impact is genuinely embedding-model-dependent — some models (particularly those trained with this compression in mind) tolerate it well, others do not, making empirical validation essential rather than optional.
- always_ram=True (seen in quantization configuration examples) keeps quantized vectors in memory for fastest access, at a real memory cost versus allowing them to be paged from disk — a deliberate tradeoff worth understanding for your specific deployment's memory budget.
`,

  scalability: `
Qdrant's scaling story reflects its "simple by default, sophisticated when needed" design philosophy — a single node handles a genuinely substantial workload well, with distributed clustering available as an explicit, opt-in step for scale beyond that.

### Single-node capacity and vertical scaling

A single, appropriately-resourced Qdrant node (adequate RAM for the HNSW index and payload data, sufficient CPU for concurrent query handling) is Qdrant's default, complete deployment unit — appropriate for a large share of real-world production workloads without needing to reach for distributed clustering at all.

### Distributed clustering for genuine scale

~~~mermaid
flowchart LR
    Client["Client"] --> Node1["Qdrant node 1\n(shard + replica)"]
    Client --> Node2["Qdrant node 2\n(shard + replica)"]
    Client --> NodeN["Qdrant node N\n(shard + replica)"]
~~~

When genuine scale requirements exceed a single node's capacity, Qdrant supports sharding and replication across a cluster of nodes — a real, distributed-scaling capability, though deliberately simpler in its operational model than Milvus's fully disaggregated microservice architecture.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Missing payload indexes causing slow filtered queries | Explicitly index frequently-filtered payload fields |
| Memory usage too high for full-precision vectors at scale | Scalar, product, or binary quantization, validated empirically for recall impact |
| Single node's capacity genuinely exceeded | Distributed clustering (sharding and replication) |
| Multiple named vectors' combined resource cost | Consider whether all named vectors are genuinely needed, or if some could be a separate, smaller collection |
| Highly selective filters degrading vector search quality | Qdrant's own filtering-and-HNSW integration is specifically engineered to address this; verify payload indexing is correctly configured |
`,

  security: `
### Qdrant's built-in security features

1. **API key authentication**: Qdrant supports API key-based authentication for access control.
2. **TLS/SSL for connections**: encrypting data in transit, standard practice for any production deployment.
3. **Role-based access control** (available in more recent Qdrant versions and Qdrant Cloud): fine-grained permissions for production deployments needing more than simple API-key-based access.

### What remains the application's responsibility

- **Application-level tenant isolation enforcement**: since Qdrant's payload-based multi-tenancy has no structural enforcement (unlike Pinecone's namespaces or Weaviate's native multi-tenancy), the application must consistently apply tenant-scoping filters on every relevant query — a genuine, application-level security responsibility worth taking seriously given the real data-leakage risk if forgotten.
- **Network isolation**: Qdrant should never be directly exposed to the public internet without appropriate authentication, the same universal self-hosted-database security practice covered across every other self-hosted database on this platform.
- **Secrets management**: API keys and credentials loaded from environment variables/a secrets manager, never hardcoded.

### The self-hosting security tradeoff

The same universal self-hosted-database consideration covered for Milvus and Weaviate: choosing to self-host Qdrant means your own team is directly responsible for correctly securing the deployment, in exchange for genuine control over data residency and no vendor lock-in — Qdrant Cloud provides a managed alternative for teams preferring not to take on this responsibility directly.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing Qdrant-dependent application code follows similar principles to testing against any database, with Qdrant's straightforward Docker deployment making genuine integration testing simple.

~~~python
import pytest
from testcontainers.qdrant import QdrantContainer
from qdrant_client import QdrantClient

@pytest.fixture
def qdrant_client():
    with QdrantContainer("qdrant/qdrant:latest") as qdrant:
        client = QdrantClient(url=qdrant.get_connection_url())
        yield client

def test_upsert_and_search(qdrant_client):
    qdrant_client.create_collection(collection_name="test", vectors_config=VectorParams(size=8, distance=Distance.COSINE))
    qdrant_client.upsert(collection_name="test", points=[PointStruct(id=1, vector=[0.1]*8, payload={"category": "test"})])

    results = qdrant_client.query_points(collection_name="test", query=[0.1]*8, limit=1)
    assert results.points[0].id == 1
~~~

### Testing tenant isolation explicitly given the lack of structural enforcement

~~~python
def test_tenant_isolation(qdrant_client):
    # insert data for two different tenants
    qdrant_client.upsert(collection_name="docs", points=[
        PointStruct(id=1, vector=[0.1]*8, payload={"tenant_id": "tenant-a"}),
        PointStruct(id=2, vector=[0.1]*8, payload={"tenant_id": "tenant-b"})
    ])
    results = tenant_scoped_search(qdrant_client, "tenant-a", [0.1]*8, limit=10)
    assert all(p.payload["tenant_id"] == "tenant-a" for p in results.points)
~~~

Given Qdrant's payload-based multi-tenancy has no structural enforcement, explicitly testing that tenant-scoped queries never leak another tenant's data is a genuinely important, non-optional test to write, distinct from a database (Pinecone, Weaviate) where namespace/tenant isolation is more structurally guaranteed.

### The senior testing doctrine

- Use Testcontainers for genuine integration tests exercising real Qdrant behavior (filtering, quantization effects).
- Explicitly test tenant isolation given the lack of structural enforcement in the payload-based approach.
- Test payload index behavior explicitly, confirming filtered queries return expected results and perform reasonably.
- Test quantization's recall impact empirically if used, comparing against unquantized search results.
`,

  debugging: `
### The toolbox, in escalation order

1. **Qdrant's own web UI/dashboard** — provides visual collection inspection, point browsing, and basic query testing without needing to write client code for every diagnostic check.
2. **Check payload index configuration** — verify a frequently-filtered field actually has an index created for it, a common, easily-fixed source of unexpectedly slow filtered queries.
3. **Verify distance metric and vector dimension match** between the collection configuration and your actual embedding model's output.
4. **Qdrant's logs** — review server logs for errors during upsert/search operations, particularly for quantization or clustering-related issues.
5. **Test filter logic in isolation** (without the vector similarity component) to confirm filter syntax and logic are correct before assuming a combined query's unexpected results are a filtering bug specifically.

### Debugging common Qdrant-specific symptoms

- "Filtered queries are much slower than unfiltered ones" — verify the filtered payload field has an explicit index; this is the most common cause.
- "Search results seem irrelevant" — verify the distance metric matches how the embedding model was actually trained/intended to be compared.
- "Fewer results returned than the requested limit" — with a highly selective filter, verify enough matching data actually exists; this may be expected behavior rather than a bug.
- "Quantized search recall seems poor" — quantization's recall impact is genuinely embedding-model-dependent; compare against unquantized search results empirically rather than assuming a specific quantization type works well universally.
`,

  monitoring: `
Production Qdrant visibility rests on the same three pillars as any database, with monitoring being comparatively simpler than Milvus's multi-tier architecture given Qdrant's more consolidated deployment model.

### Key metrics to track

- **Query latency**, both for filtered and unfiltered searches, tracked separately to understand filter-performance impact.
- **Memory usage**, especially relevant for quantization decisions and for understanding whether a single node's capacity is approaching its practical ceiling.
- **Payload index coverage**: confirming frequently-filtered fields actually have indexes, a useful periodic audit.
- **Cluster health** (if using distributed clustering): node availability, shard distribution, replication status.

### Tools

Qdrant exposes Prometheus-compatible metrics natively, integrating into a broader Prometheus/Grafana observability stack — see the **Prometheus** and **Grafana** skills; Qdrant's own web UI provides ad-hoc visibility into collections and basic query testing.

### Alerting priorities

Alert on: query latency degrading beyond acceptable thresholds (especially for filtered queries specifically), memory usage approaching capacity, and (for clustered deployments) node/replica health issues.
`,

  deployment: `
### Self-hosted deployment via Docker

~~~bash
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
~~~

A single Docker command provides a complete, production-capable Qdrant instance — genuinely simpler than Milvus's multi-service requirement, directly reflecting Qdrant's deliberate operational-simplicity design priority.

### Kubernetes deployment for production/clustered use

~~~bash
helm repo add qdrant https://qdrant.github.io/qdrant-helm
helm install my-qdrant qdrant/qdrant --set replicaCount=3
~~~

The official Qdrant Helm chart manages a Kubernetes-based deployment, supporting distributed clustering for genuine scale needs.

### Qdrant Cloud as the managed alternative

For teams preferring not to self-host, Qdrant Cloud provides Qdrant's capabilities as a managed service — the same convenience-versus-control tradeoff covered for Zilliz Cloud/Milvus and Weaviate Cloud/Weaviate, with the underlying open-source software remaining portable.

### Backup strategy

~~~python
client.create_snapshot(collection_name="documents")
~~~

Qdrant's built-in snapshot capability provides a straightforward backup mechanism for collections, an important operational practice for any production self-hosted deployment.

### CI/CD pipeline

Collection configuration (vector parameters, payload indexes, quantization settings) is typically managed via infrastructure-as-code or application-level provisioning scripts, run as an explicit, versioned deploy step. See the **CI/CD**, **Docker**, and **Kubernetes** skills.
`,

  "production-checklist": `
Before a Qdrant-backed application takes real traffic:

- [ ] Every frequently-filtered payload field explicitly indexed
- [ ] Distance metric confirmed to match your embedding model's actual training/intended comparison
- [ ] Quantization choice (if used) validated empirically against your specific embedding model's recall tolerance
- [ ] Tenant isolation (if payload-based multi-tenancy is used) consistently enforced via a tested application-layer abstraction
- [ ] HNSW parameters tuned and validated for your actual data scale and recall requirements
- [ ] API key authentication and TLS/SSL configured explicitly
- [ ] Network isolation configured, never directly exposing Qdrant to the public internet
- [ ] Bulk ingestion uses batched upserts, not one-point-at-a-time requests
- [ ] Single-node versus distributed clustering choice made deliberately based on actual scale needs
- [ ] Backup strategy (snapshots) configured and actually tested
- [ ] Monitoring configured for query latency (filtered and unfiltered separately) and memory usage
- [ ] Secrets (API keys) loaded from environment variables/a secrets manager
- [ ] Load test done: known query throughput and latency under realistic concurrent load, including realistic filter selectivity
- [ ] Runbook: how to restore from backup and diagnose slow filtered queries
`,

  "common-mistakes": `
1. **Not indexing frequently-filtered payload fields**, forcing a less efficient filter evaluation path.
2. **Assuming payload-based multi-tenancy has structural isolation enforcement** the way Pinecone's namespaces or Weaviate's native multi-tenancy do, risking a genuine data-leakage bug if a tenant filter is forgotten.
3. **Using binary quantization without empirical recall validation**, since its recall impact is genuinely embedding-model-dependent.
4. **Choosing distributed clustering prematurely** for a workload a single node would handle comfortably.
5. **Using the wrong distance metric** relative to how the embedding model was actually trained.
6. **Not batching bulk upserts**, issuing many individual point requests instead of efficiently batched ones.
7. **Not tuning HNSW parameters empirically**, assuming defaults are appropriate for your actual data scale and recall requirements without validation.
8. **Ignoring memory cost when using multiple named vectors per point**, since each maintains its own HNSW index.
9. **Not testing tenant isolation explicitly**, given the genuine risk of a forgotten filter leaking data across tenants in the payload-based approach.
10. **Choosing self-hosting without an honest operational-capacity assessment**, the same universal self-hosted-database consideration across every option in this category.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Vector dimension mismatch | Vector provided doesn't match the collection's configured size | Verify your embedding model's actual output dimensionality matches the collection configuration |
| Collection not found | Referencing a collection name that doesn't exist or was deleted | Verify the collection name and confirm it exists |
| Filtered query is slow | The filtered payload field has no index created for it | Explicitly create a payload index for the field |
| Fewer results than requested limit | Filter is highly selective and fewer matching points exist than the requested limit | Verify enough matching data exists; this may be expected behavior |
| Unauthorized / 401 error | Missing or invalid API key | Verify the API key is correctly configured and hasn't been revoked |
| Poor recall with quantization enabled | The specific embedding model doesn't tolerate the chosen quantization level well | Test a less aggressive quantization option, or validate whether unquantized search meets your latency requirements instead |
| Point not found on retrieval by ID | The ID doesn't exist, or was deleted, or a mismatch between expected ID type (integer vs UUID) | Verify the point ID and its type match what was actually used at insert time |
`,

  faqs: `
**Qdrant or Pinecone/Milvus/Weaviate?**
Choose Qdrant when you want self-hosted, open-source control with strong performance and correct filtering behavior, without Milvus's full distributed-architecture operational complexity; choose Pinecone for zero operational burden; choose Milvus for maximum self-hosted scale; choose Weaviate for schema-rich relational data modeling or built-in vectorization/generative modules — see each respective skill for direct comparison.

**How does Qdrant's filtering compare to other vector databases?**
Qdrant places specific engineering emphasis on efficiently combining payload filtering with HNSW vector search, addressing a well-known challenge (highly selective filters degrading naive "search then filter" approaches) more directly than some alternatives — a genuine technical differentiator, though all major vector databases in this category provide combined vector-plus-filter search capability in some form.

**Does Qdrant have structural multi-tenancy like Pinecone's namespaces?**
Not in the same structurally-enforced sense — Qdrant's common multi-tenancy approach is payload-based filtering (with an indexed tenant field), requiring the application to consistently apply the tenant filter on every query, a genuine, non-trivial responsibility versus Pinecone's namespace or Weaviate's native multi-tenancy structural isolation.

**What is quantization, and when should I use it in Qdrant?**
Quantization compresses vector representations (scalar, product, or binary) to reduce memory usage, trading some precision for efficiency — appropriate for genuinely large-scale collections where memory is a real constraint, but recall impact is model-dependent and should always be validated empirically, especially for the more aggressive binary quantization option.

**Why does Qdrant use Rust?**
For memory safety and predictable, garbage-collection-pause-free performance — genuinely important characteristics for a latency-sensitive, memory-intensive workload like vector search serving many concurrent queries, the same tradeoff analysis covered in this platform's own **Rust** skill.

**Is Qdrant good for small-scale applications, or only large scale?**
Genuinely good for both — a single Qdrant node handles a substantial range of workload scales comfortably as a complete, self-contained deployment, with distributed clustering available only when genuine scale requirements justify the added complexity, making it a common choice specifically for teams NOT yet needing (or never needing) Milvus's full distributed architecture.
`,

  "interview-questions": `
### Junior level

1. **What is Qdrant, and what language is it written in?**
   Model answer: An open-source vector database written in Rust, chosen specifically for memory safety and predictable, garbage-collection-pause-free performance.

2. **What is a "point" in Qdrant?**
   Model answer: A stored item consisting of a vector, an ID, and an optional JSON payload (metadata) — Qdrant's term for what Pinecone calls a vector-plus-metadata entry.

3. **Why should you explicitly index payload fields used for filtering?**
   Model answer: Without an index, filtering on a payload field requires a less efficient evaluation path; explicitly indexing a frequently-filtered field enables faster, targeted filtering, directly analogous to indexing a column in a relational database.

4. **What is quantization, and what does it trade off?**
   Model answer: Compressing vector representations (scalar, product, or binary) to reduce memory usage, trading some precision/recall for efficiency — the specific recall impact depends on the embedding model and should be validated empirically.

5. **Is clustering required to use Qdrant in production?**
   Model answer: No — a single Qdrant node is a complete, fully-functional deployment; distributed clustering is an opt-in capability for genuine scale needs, not an architectural assumption.

### Senior level

6. **Why is naively combining a highly selective filter with vector similarity search a genuine technical challenge, and how does Qdrant address it?**
   Model answer: If filtering is applied AFTER finding approximate nearest neighbors (rather than integrated into the search), a highly selective filter (matching few candidates) can force scanning many approximate results before finding enough that pass the filter, or return fewer results than requested; Qdrant specifically engineers its payload indexing to integrate with HNSW graph traversal, addressing this challenge more directly than a naive sequential approach would.

7. **How does Qdrant's multi-tenancy approach differ from Pinecone's namespaces, and what's the practical security implication?**
   Model answer: Qdrant's common approach is payload-based filtering (an indexed tenant field), with no structural isolation enforcement — the application must consistently apply the tenant filter on every relevant query, a genuine, ongoing responsibility, versus Pinecone's namespace scoping which structurally separates data by namespace at the API level.

8. **Why does Qdrant's choice of Rust matter for its performance characteristics specifically?**
   Model answer: Rust provides memory safety without a garbage collector, meaning Qdrant avoids GC pause-related latency spikes under high concurrent load and memory pressure — a genuinely important characteristic for a memory-intensive, latency-sensitive workload like vector search serving many simultaneous queries.

9. **How would you decide between scalar, product, and binary quantization for a specific large-scale collection?**
   Model answer: Start by measuring whether memory is genuinely a constraint at your scale; if so, empirically test each quantization option's recall impact against your SPECIFIC embedding model (since recall degradation is model-dependent, especially for binary quantization's more aggressive compression), choosing the most memory-efficient option that still meets your recall requirement.

10. **When would you choose Qdrant over Milvus for a self-hosted vector database?**
    Model answer: When your scale doesn't genuinely require Milvus's fully disaggregated, independently-scaling microservice architecture, and you'd rather have a simpler, single-binary-by-default deployment model with strong performance and filtering behavior — Qdrant's "simple by default, sophisticated when needed" philosophy fits teams at small-to-large (but not necessarily the most extreme) scale better than Milvus's assumed distributed complexity.

11. **How would you test that your application's tenant isolation is genuinely correct given Qdrant's lack of structural multi-tenancy enforcement?**
    Model answer: Write explicit tests inserting data for multiple distinct tenants, then querying with each tenant's scoping filter and asserting that results never include another tenant's data — since there's no structural guarantee the way there would be with a namespace-based system, this test should be a genuinely non-optional part of the test suite, not an afterthought.

12. **What's the tradeoff between using named vectors (multiple embeddings per point) versus separate collections?**
    Model answer: Named vectors let a single point support multiple embedding types (text and image, for instance) with a shared payload and identity, convenient for genuinely multi-modal entities, but each named vector maintains its own HNSW index, a real memory/compute cost multiplier — separate collections might be more appropriate if the different embedding types don't genuinely need to be queried against the same underlying entity together.
`,

  "coding-questions": `
### 1. Design a collection with quantization and validate recall empirically

~~~python
from qdrant_client.models import ScalarQuantization, ScalarQuantizationConfig, ScalarType

client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    quantization_config=ScalarQuantization(scalar=ScalarQuantizationConfig(type=ScalarType.INT8, quantile=0.99))
)

# Compare quantized search against an unquantized baseline collection for recall validation
def measure_recall(quantized_client, exact_client, test_queries, k=10):
    recalls = []
    for query in test_queries:
        quantized_results = {p.id for p in quantized_client.query_points(collection_name="documents", query=query, limit=k).points}
        exact_results = {p.id for p in exact_client.query_points(collection_name="documents_exact", query=query, limit=k).points}
        recalls.append(len(quantized_results & exact_results) / k)
    return sum(recalls) / len(recalls)
# Follow-up: how would you decide whether the measured recall is
# "acceptable," and what factors (application use case, cost savings
# from quantization, latency requirements) would inform that threshold?
~~~

### 2. Implement a safe, consistently-enforced tenant-scoped search wrapper

~~~python
class TenantScopedQdrantClient:
    def __init__(self, client, collection_name):
        self.client = client
        self.collection_name = collection_name

    def search(self, tenant_id, query_vector, additional_filter=None, limit=5):
        conditions = [FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))]
        if additional_filter:
            conditions.append(additional_filter)
        return self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=Filter(must=conditions),
            limit=limit
        )
# By wrapping ALL tenant-scoped access through this class, forgetting the
# tenant filter becomes structurally harder than if every call site had
# to remember to add it manually.
# Follow-up: how would you write a test suite proving this wrapper genuinely
# prevents any code path from accidentally querying without tenant scoping?
~~~

### 3. Build a hybrid search combining dense vectors with payload filtering and reranking

~~~python
def hybrid_filtered_search(client, query_vector, category_filter, rerank_model, query_text, candidate_k=20, final_k=5):
    candidates = client.query_points(
        collection_name="documents",
        query=query_vector,
        query_filter=Filter(must=[FieldCondition(key="category", match=MatchValue(value=category_filter))]),
        limit=candidate_k
    )
    reranked = rerank_model.rerank(query_text, [p.payload["content"] for p in candidates.points])
    return reranked[:final_k]
# Follow-up: why does retrieving more candidates (candidate_k=20) than
# ultimately needed generally improve final relevance after reranking,
# and how would filter selectivity affect your choice of candidate_k?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a basic filtered similarity search feature
Create a collection, upsert points with vectors and payloads, explicitly index a payload field, and implement combined similarity-plus-filter search. Deliverable: a working filtered search script. Skills exercised: collection creation, upserting, payload indexing, filtering.

### Lab 2 (Intermediate): Compare quantization options empirically
Build collections with scalar, product, and binary quantization (plus an unquantized baseline), and measure recall and memory usage for each against your actual embedding model. Deliverable: a documented comparison table. Skills exercised: quantization configuration, empirical recall measurement.

### Lab 3 (Advanced): Build a robust multi-tenant system with tested isolation
Implement payload-based multi-tenancy with a consistently-enforced application-layer wrapper (see Coding Questions), and write a comprehensive test suite proving tenant isolation genuinely holds. Deliverable: a working, thoroughly-tested multi-tenant retrieval system. Skills exercised: multi-tenancy patterns, isolation testing.

### Lab 4 (Production): Deploy Qdrant with monitoring and measure filter-performance impact
Deploy Qdrant via Docker/Kubernetes, set up Prometheus/Grafana monitoring, and measure query latency under varying filter selectivity to understand your deployment's actual performance characteristics. Deliverable: a production-checklist-compliant deployment with a documented filter-selectivity-versus-latency analysis. Skills exercised: deployment, monitoring, performance analysis, the full production checklist.
`,

  "real-projects": `
### 1. A permission-scoped enterprise document search system
Engineering requirements: a Qdrant collection with indexed payload fields for department, access level, and document type, combined vector-plus-filter search ensuring users only retrieve documents they're authorized to see, and a rigorously tested application-layer permission-enforcement wrapper given the lack of structural multi-tenancy guarantees. Demonstrates Qdrant's filtering-performance strength applied to a genuinely security-sensitive use case.

### 2. A cost-optimized, self-hosted RAG backend for a resource-constrained team
Engineering requirements: a single-node Qdrant deployment (deliberately avoiding premature distributed clustering), binary or scalar quantization validated empirically for the team's specific embedding model, and straightforward Docker-based deployment matching a smaller team's actual operational capacity. Demonstrates Qdrant's "simple by default" positioning for teams specifically not needing Milvus's full architectural complexity.

### 3. An e-commerce product search with complex, highly selective filters
Engineering requirements: a product catalog with indexed payload fields for category, brand, price range, and availability, supporting genuinely complex, highly selective filter combinations (a specific brand, in a specific price range, in stock, in a specific category) combined with semantic similarity search, directly leveraging Qdrant's filtering-performance engineering emphasis. Demonstrates a real-world scenario where Qdrant's specific technical differentiator (efficient filtering under high selectivity) provides genuine, measurable value.
`,

  "case-studies": `
### The choice of Rust as a deliberate performance and safety bet
Qdrant's founders choosing Rust from the project's inception — rather than a more common choice like Go (used by many infrastructure projects) or C++ — reflects a deliberate bet on memory safety without garbage-collection pauses, directly informed by the same tradeoffs covered in this platform's **Rust** skill. Lesson: a foundational technology choice made early in a project's life (here, the implementation language itself) can become a genuine, durable competitive differentiator if it aligns well with the specific performance characteristics the product actually needs, rather than being an incidental implementation detail.

### Qdrant's filtering-performance engineering as a specific technical differentiator
Qdrant's deliberate engineering investment in efficiently combining payload filtering with HNSW vector search — addressing a well-known, genuine challenge (naive filter-after-search approaches degrading under high filter selectivity) — illustrates how a vector database can differentiate itself not through a fundamentally different data model (as Weaviate does) or a fundamentally different distributed architecture (as Milvus does), but through deep engineering investment in a specific, well-understood technical pain point shared across the category. Lesson: sometimes the most durable competitive advantage comes not from a novel architectural approach but from simply engineering a known, common problem better than competitors have, a less flashy but genuinely valuable differentiation strategy.

### The "simple by default" positioning against Milvus's architectural sophistication
Qdrant's deliberate choice to make single-node deployment a complete, production-capable default, with distributed clustering as an explicit opt-in rather than an architectural assumption, directly positions it against Milvus's fully disaggregated, distributed-by-design approach. Lesson: not every vector database needs to compete on the same axis (maximum theoretical scale) — Qdrant's bet that a large share of the market's actual needs sit comfortably within single-node or modestly-clustered capacity, valuing operational simplicity over architectural maximalism, is a genuine, valid strategic position distinct from "trying to be the most scalable option at any cost."

### Growing adoption specifically among performance-benchmark-conscious teams
Qdrant's public positioning and marketing frequently emphasize direct performance benchmarks against competitors, reflecting (and reinforcing) adoption specifically among engineering teams who prioritize measured, empirical performance comparisons in their vector database evaluation process, rather than defaulting to whichever option is most prominently featured in RAG tutorials (a dynamic more associated with Pinecone's adoption pattern, as covered in that skill's own Case Studies section). Lesson: different vector databases in this category have cultivated genuinely different adoption communities and evaluation cultures, worth understanding when interpreting any specific vendor's own comparative claims.
`,

  comparisons: `
| Aspect | Qdrant | Pinecone | Milvus | Weaviate |
|--------|--------|---------|--------|----------|
| Open source | Yes (Apache 2.0) | No | Yes | Yes |
| Implementation language | Rust | Not public | Go/C++ | Go |
| Deployment default | Single binary, complete by itself | Fully managed | Fully disaggregated microservices | Simpler, more monolithic |
| Filtering performance emphasis | Very high, a core differentiator | Standard | Standard | Standard |
| Built-in vectorization | No (bring your own) | No | No | Yes (pluggable modules) |
| Multi-tenancy | Payload-based, no structural enforcement | Namespaces, structurally isolated | Partitions | Native, first-class isolation |
| Best fit | Performance-focused, operationally simple self-hosted needs | Zero-ops, fast time to production | Large-scale, maximally distributed self-hosted needs | Rich schema modeling, integrated RAG pipeline convenience |

**How seniors choose**: reach for Qdrant specifically when you want strong performance and correct filtering behavior with a genuinely simple self-hosted operational footprint, without Milvus's architectural complexity or Weaviate's schema-rich overhead if your data doesn't need it; reach for Pinecone for zero-ops convenience; reach for Milvus for maximum distributed scale; reach for Weaviate for genuinely relational data or integrated vectorization/generation pipeline convenience.
`,

  "related-technologies": `
- **Rust** — the language Qdrant is implemented in; see the **Rust** skill for the memory-safety-without-garbage-collection tradeoffs directly relevant to understanding Qdrant's performance design.
- **FAISS** — the algorithmic foundation for HNSW and quantization concepts Qdrant implements as built-in database capabilities.
- **Pinecone**, **Milvus**, **Weaviate** — the other major vector database options, essential direct comparisons; see each respective skill.
- **Embeddings** and **Vector Search** — the foundational concepts underlying Qdrant's core capabilities.
- **RAG** — the application context Qdrant, like every vector database in this category, most commonly serves.
- **Docker** and **Kubernetes** — the deployment technologies for self-hosted Qdrant.

Learning path: **Embeddings** and **Vector Search** → **FAISS** → **Pinecone**/**Milvus**/**Weaviate** for contrasting architectures → this page → **RAG** for the application context → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Qdrant** continues active development with ongoing performance benchmarking emphasis, expanded quantization options, and refined filtering performance.
- **Qdrant Cloud** continues expanding its managed offering, positioning alongside Zilliz Cloud and Weaviate Cloud as a middle-ground option between full self-hosting and closed-source managed services.
- Continued expansion of hybrid search (dense plus sparse vector) capabilities and multi-tenancy features, reflecting ongoing RAG-application demand across the broader vector database category.
- Given the rapid pace of the broader vector database ecosystem's evolution, verify current Qdrant version-specific features, benchmark comparisons, and quantization capabilities against official documentation rather than assuming parity with what's described here.
`,

  "future-roadmap": `
Where Qdrant is heading, and what's worth betting career time on:

- **Continued filtering-performance and quantization investment**, likely remaining Qdrant's core, distinctive technical differentiators versus the broader vector database category.
- **Continued emphasis on operational simplicity** as a deliberate positioning against more architecturally complex alternatives, likely to remain a durable strategic choice given its clear appeal to smaller, resource-conscious teams.
- **Continued Rust ecosystem alignment**, benefiting from the broader Rust language and tooling ecosystem's own continued maturation (see the **Rust** skill's own Future Roadmap for the broader context).
- **What to bet on**: deep fluency in payload filtering design (indexing, must/must_not/should semantics), quantization tradeoffs, and understanding when Qdrant's "simple by default" model is the right architectural choice versus Milvus's full distributed sophistication — these concepts, plus the shared HNSW/quantization algorithmic fluency from the **FAISS** skill, transfer meaningfully regardless of which specific vector database a given project ultimately chooses.
`,

  "cheat-sheet": `
~~~python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue, Range

client = QdrantClient(url="http://localhost:6333")

# ---- Create collection ----
client.create_collection(
    collection_name="docs", vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)

# ---- ALWAYS index payload fields you filter on ----
client.create_payload_index(collection_name="docs", field_name="category", field_schema="keyword")

# ---- Upsert (points = vector + ID + payload) ----
client.upsert(collection_name="docs", points=[
    PointStruct(id=1, vector=emb, payload={"category": "electronics", "price": 149.99})
])

# ---- Search: vector similarity + payload filter, in one call ----
client.query_points(
    collection_name="docs", query=query_vector, limit=5,
    query_filter=Filter(must=[
        FieldCondition(key="category", match=MatchValue(value="electronics")),
        FieldCondition(key="price", range=Range(lte=200))
    ])
)

# ---- Quantization: trade precision for memory (VALIDATE recall empirically) ----
quantization_config=ScalarQuantization(scalar=ScalarQuantizationConfig(type=ScalarType.INT8))
# BinaryQuantization -> extreme compression, model-dependent recall impact

# ---- Multi-tenancy: payload-based, NO structural enforcement ----
# ALWAYS wrap tenant-scoped queries in a function that ALWAYS applies the filter
def tenant_search(client, tenant_id, q, limit=5):
    return client.query_points(collection_name="docs", query=q, limit=limit,
        query_filter=Filter(must=[FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))]))

# ---- Deployment: single binary is a COMPLETE deployment ----
# docker run -p 6333:6333 qdrant/qdrant
# Clustering is opt-in, not assumed (unlike Milvus)

# ---- Why Rust? ----
# Memory safety WITHOUT garbage collection -> predictable tail latency under load
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What language is Qdrant written in, and why? | Rust — memory safety without GC pauses, predictable tail latency. |
| What is a "point" in Qdrant? | A vector + ID + JSON payload — Qdrant's term for Pinecone's vector+metadata entry. |
| Why explicitly index payload fields? | Without an index, filtering falls back to a much less efficient path. |
| Qdrant's core technical differentiator? | Deep engineering investment in filtering-plus-HNSW performance, not a new data model. |
| Does Qdrant require clustering for production? | No — a single node is a complete, fully-functional deployment by default. |
| Qdrant's multi-tenancy approach? | Payload-based filtering — NO structural enforcement, unlike Pinecone/Weaviate. |
| What must you do for safe multi-tenancy? | Wrap ALL tenant queries in a consistently-applied filter function; test isolation explicitly. |
| What is quantization here? | Scalar/product/binary compression — trades precision for memory, model-dependent recall. |
| Why validate quantization empirically? | Recall impact varies a lot by embedding model, especially for binary quantization. |
| Qdrant vs Milvus, in one sentence? | Qdrant: simple by default, opt-in clustering. Milvus: distributed microservices by default. |
| Does Qdrant include built-in vectorization? | No — bring your own vectors, unlike Weaviate's pluggable modules. |
| Naive filter-then-search problem? | A highly selective filter can starve ANN results — Qdrant engineers around this directly. |
| Is Qdrant open source? | Yes — Apache 2.0, self-hostable, with Qdrant Cloud as an optional managed layer. |
`,

  mcqs: `
1. What language is Qdrant implemented in, and why does that matter?
   A) Go, for simplicity  B) Rust, for memory safety without garbage-collection pauses  C) Python, for ease of extension  D) Java, for JVM tooling
   **Answer: B** — predictable tail latency under concurrent, memory-intensive load.

2. What is Qdrant's core, most distinctive technical differentiator?
   A) A schema-rich cross-reference data model  B) Deep engineering investment in efficient filtering combined with HNSW search  C) Fully managed, zero-ops hosting only  D) Built-in LLM generation modules
   **Answer: B** — unlike Weaviate (data model) or Milvus (distributed architecture), Qdrant differentiates on filtering performance.

3. Is distributed clustering required to run Qdrant in production?
   A) Yes, always  B) No — a single node is a complete, production-capable deployment by default  C) Only for collections over 1000 points  D) Only with Qdrant Cloud
   **Answer: B** — clustering is opt-in for genuine scale needs, not an architectural assumption.

4. Does Qdrant's payload-based multi-tenancy structurally enforce isolation like Pinecone's namespaces?
   A) Yes, identically  B) No — the application must consistently apply the tenant filter itself  C) Only with binary quantization enabled  D) Only in clustered deployments
   **Answer: B** — a genuine, non-trivial application-layer responsibility, unlike Pinecone or Weaviate.

5. Why must quantization choices be validated empirically rather than assumed?
   A) Quantization is deprecated  B) Recall impact is genuinely embedding-model-dependent, especially for binary quantization  C) Qdrant doesn't actually support quantization  D) It only affects write speed, not search quality
   **Answer: B** — some models tolerate aggressive compression well, others degrade substantially.

6. What genuine technical problem does Qdrant's filtering engineering specifically address?
   A) Slow network latency  B) Highly selective filters degrading naive "search then filter" approaches  C) Missing authentication  D) Lack of a REST API
   **Answer: B** — integrating filtering into HNSW traversal rather than treating them as separate sequential steps.
`,

  "revision-notes": `
Qdrant is an open-source vector database written in Rust, differentiating itself within the vector database category not through a novel data model (as Weaviate does with cross-references) or a fully disaggregated distributed architecture (as Milvus does), but through deep engineering investment in raw performance, memory efficiency, and — most distinctively — correctly and efficiently combining metadata filtering with HNSW vector search. Its choice of Rust specifically reflects a deliberate bet on memory safety without garbage-collection pauses, providing more predictable tail latency under concurrent, memory-intensive load than a garbage-collected implementation might exhibit.

Qdrant's core technical differentiator addresses a well-known, genuine challenge in HNSW-based vector search: naively applying a filter AFTER finding approximate nearest neighbors can produce poor results when the filter is highly selective, since few of the found neighbors may actually pass the filter. Qdrant specifically engineers its payload indexing to integrate with HNSW graph traversal directly, rather than treating filtering and search as two independent sequential steps — explicitly indexing frequently-filtered payload fields is essential to realizing this benefit, and forgetting to do so is one of the most common, most easily-fixed Qdrant performance mistakes.

Qdrant's deployment model reflects a "simple by default, sophisticated when needed" philosophy: a single Qdrant node (via one Docker command) is a complete, fully-functional, production-capable deployment on its own, with distributed clustering (sharding and replication) available as an explicit, opt-in capability for genuine scale needs — a meaningfully simpler default operational footprint than Milvus's fully disaggregated microservice architecture, positioning Qdrant specifically for the substantial middle ground of teams wanting self-hosted control and strong performance without that added architectural complexity.

Quantization (scalar, product, and binary) provides built-in memory-efficiency options trading precision for reduced footprint — the same fundamental tradeoff covered in the FAISS skill's Product Quantization discussion, offered here as a database configuration rather than a raw algorithmic building block. Binary quantization's recall impact is genuinely embedding-model-dependent, making empirical validation against your specific model essential rather than assuming any quantization choice works well universally.

A genuinely important architectural distinction versus Pinecone and Weaviate: Qdrant's common multi-tenancy approach is payload-based filtering (an indexed tenant field) with NO structural isolation enforcement — the application must consistently apply the tenant-scoping filter on every relevant query, a real, ongoing responsibility that, if forgotten even once, risks genuine data leakage across tenants. Wrapping all tenant-scoped access in a consistently-used application-layer abstraction, and testing isolation explicitly, is essential production discipline given this lack of structural guarantee.

Qdrant is fully open-source (Apache 2.0) and self-hostable, with Qdrant Cloud as an optional managed alternative, the same open-source-plus-managed-option model covered for Milvus/Zilliz Cloud and Weaviate/Weaviate Cloud, distinct from Pinecone's fully closed-source approach. Its adoption pattern clusters specifically around teams prioritizing measured performance benchmarks and operational simplicity in their vector database evaluation, a genuinely different adoption driver than Milvus's large-scale/self-hosting focus, Weaviate's schema-rich/integrated-pipeline focus, or Pinecone's pure convenience focus.
`,

  "learning-roadmap": `
**Week 1 — Qdrant fundamentals**: creating collections, upserting points with vectors and payloads, and basic similarity search. Milestone: build a working search script over a small dataset.

**Week 2 — Filtering and payload indexing**: explicit payload indexing, must/must_not/should filter combinations, and combining vector search with structured filters. Milestone: fix a deliberately introduced unindexed-filter performance problem, documenting the before/after latency.

**Week 3 — Quantization and HNSW tuning**: scalar, product, and binary quantization, empirical recall measurement, and HNSW parameter tuning. Milestone: compare quantization options empirically against your own embedding model, documenting recall and memory tradeoffs.

**Week 4 — Multi-tenancy and safe isolation patterns**: payload-based tenant scoping, building a consistently-enforced application-layer wrapper, and comprehensive isolation testing. Milestone: build a multi-tenant system with a thorough test suite proving isolation genuinely holds.

**Week 5 — Production deployment and monitoring**: Docker/Kubernetes deployment, Qdrant Cloud as an alternative, and Prometheus/Grafana monitoring for filtered-versus-unfiltered query latency. Milestone: complete Lab 4, a production-checklist-compliant deployment with performance analysis.

**Week 6 — Architectural decision-making**: comparing Qdrant against Pinecone, Milvus, and Weaviate for specific hypothetical workloads, articulating when Qdrant's performance-and-simplicity focus is (or isn't) the right choice. Milestone: document a clear decision framework justifying Qdrant (or an alternative) for a specific described application.

Next platform skill once this roadmap is complete: **RAG** for the deeper application architecture context, or revisit **FAISS** for the shared algorithmic foundations underlying Qdrant's HNSW and quantization implementations.
`,

  "official-docs": `
- **qdrant.tech/documentation** — the official Qdrant documentation, comprehensive and the primary reference for collections, filtering, and quantization covered throughout this page.
- **qdrant.tech/documentation/concepts/filtering** — the official filtering documentation, essential depth beyond this page's overview.
- **qdrant.tech/documentation/guides/quantization** — the official quantization documentation covering scalar, product, and binary options in depth.
- **qdrant.tech/documentation/guides/distributed_deployment** — the official distributed clustering documentation.
`,

  books: `
Given Qdrant's nature as a rapidly-evolving open-source project, there is limited book-length treatment specifically of Qdrant; the most relevant reading covers the broader vector search and Rust systems-programming domains:

- **"Foundations of Vector Retrieval" — Sebastian Bruch** — a focused, technically rigorous treatment of the vector search algorithms (HNSW, quantization) Qdrant implements, the same foundational content referenced in the **FAISS** skill.
- **"Programming Rust" (2nd ed.) — Jim Blandy, Jason Orendorff, Leonora Tindall** — not Qdrant-specific, but useful for understanding the language Qdrant is implemented in and its performance/safety characteristics.
- **"Building LLM Applications" style current books covering RAG architecture** — typically include Qdrant as one of several vector database options in worked examples.
`,

  blogs: `
- **The official Qdrant blog (qdrant.tech/blog)** — release announcements, performance benchmarking content, and quantization deep-dives directly from the Qdrant team.
- **Qdrant's engineering blog specifically emphasizes performance benchmark comparisons** against other vector databases, useful for understanding its own comparative positioning claims (worth triangulating against independent sources given any vendor's inherent bias in self-comparison).
- **Various RAG-application engineering blogs discussing Qdrant's filtering performance** in real-world, highly-selective-filter use cases.
`,

  "research-papers": `
Qdrant itself, as an engineering-focused open-source project, has limited dedicated academic literature of its own — the most relevant foundational reading concerns the vector search algorithms it implements:

- See the **FAISS** and **Vector Search** skills' Research Papers sections for the foundational HNSW paper (Malkov and Yashunin) and Product Quantization paper (Jégou, Douze, Schmid) underlying Qdrant's own index and quantization implementations.
- For binary quantization and hashing-based vector compression more broadly, see literature on locality-sensitive hashing (LSH) and binary embedding techniques, foundational context for understanding binary quantization's specific tradeoffs.
`,

  videos: `
- **Qdrant's official YouTube channel** — tutorials, benchmarking deep-dives, and feature walkthroughs directly from the Qdrant team.
- **Qdrant's conference talks** at various AI/ML and vector-database-focused conferences — covering filtering architecture and production deployment experiences.
- **"Vector Databases Explained" style comparative content** (various creators) covering Qdrant alongside Pinecone, Milvus, and Weaviate for a comparative quick reference.
`,

  "github-repos": `
- **qdrant/qdrant** — the database's own source code (Rust), the primary reference for understanding its architecture and filtering engine directly.
- **qdrant/qdrant-client** — the official Python client library referenced throughout this page's code examples.
- **qdrant/qdrant-helm** — the official Kubernetes Helm chart for production deployment.
- **qdrant/examples** — Qdrant's own official collection of tutorials and example applications.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Basic usage and filtering**: create a collection, upsert points, index a payload field, and implement combined similarity-plus-filter search.
2. **Quantization comparison**: build collections with scalar, product, and binary quantization over the same dataset, measuring recall and memory usage for each.
3. **Filter-performance diagnosis**: given a deliberately unindexed filter field causing slow queries, diagnose and fix the issue, documenting the before/after latency.
4. **Multi-tenant isolation**: implement a consistently-enforced tenant-scoping wrapper and write a comprehensive test suite proving isolation genuinely holds.
5. **HNSW tuning**: tune m, ef_construct, and hnsw_ef parameters empirically for a specific recall target on your own data.
6. **External practice sets**: Qdrant's own official examples repository for structured, guided practice; the official Qdrant documentation's quickstart guides for hands-on filtering and quantization exercises.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application"] -->|REST/gRPC| Qdrant[("Qdrant\n(Rust, single binary by default)")]
    subgraph SingleNode["Default: single-node deployment"]
        Storage["Payload storage + HNSW index"]
    end
    Qdrant -.-> SingleNode
    subgraph OptInCluster["Opt-in: distributed cluster"]
        Node1["Node 1"]
        Node2["Node N"]
    end
    Qdrant -.->|only if genuine scale needs| OptInCluster
    subgraph FilterEngine["Filtering + HNSW integration"]
        PayloadIndex["Payload index"]
        HNSW["HNSW graph"]
        PayloadIndex --> HNSW
    end
    Qdrant -.-> FilterEngine
    subgraph Quantization["Memory efficiency"]
        Scalar["Scalar (int8)"]
        Product["Product"]
        Binary["Binary (extreme compression)"]
    end
    Qdrant -.-> Quantization
    subgraph ManagedAlt["Managed alternative"]
        QdrantCloud["Qdrant Cloud"]
    end
    Qdrant -.->|or use| ManagedAlt
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Qdrant))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Model
      Points vectors and payloads
      Written in Rust
      Distance metrics
    Filtering
      Payload indexing
      must must_not should
      Filter plus HNSW integration
    Quantization
      Scalar
      Product
      Binary
      Empirical recall validation
    Deployment
      Single node by default
      Opt-in distributed clustering
      Qdrant Cloud managed
    Multi-tenancy
      Payload-based approach
      No structural enforcement
      Application-layer responsibility
    Comparisons
      Versus Pinecone
      Versus Milvus
      Versus Weaviate
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default qdrant;
