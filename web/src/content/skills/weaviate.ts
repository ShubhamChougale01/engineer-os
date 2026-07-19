import type { SkillContent } from "../types";

/**
 * Weaviate — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const weaviate: SkillContent = {
  overview: `
Weaviate is an open-source vector database distinguished by treating objects and their relationships as first-class citizens, not just vectors with attached metadata — its data model is closer to a graph or a schema-rich document store than a plain vector index, letting you define classes (like "Article" or "Author"), properties with real types, and cross-references BETWEEN objects, then combine vector similarity search with these structured relationships in one query. Weaviate also distinguishes itself by building vectorization directly into the database via modules — you can hand it raw text and let it call an embedding model itself, rather than always requiring your application to pre-compute embeddings before insertion.

For an AI engineer, Weaviate is frequently the choice when a RAG or semantic search application's data genuinely has meaningful STRUCTURE beyond flat metadata — articles that reference authors, products that belong to categories that belong to departments — and you want to query across those relationships alongside vector similarity, rather than flattening everything into scalar filter fields. Its module system (for vectorization, generative search, and reranking, all pluggable) also makes it a common choice for teams wanting more of the RAG pipeline handled inside the database itself rather than stitched together entirely in application code.

Key characteristics: a schema-based data model with classes, typed properties, and cross-references between objects; built-in vectorization modules (calling out to OpenAI, Cohere, Hugging Face, or a self-hosted model to generate embeddings automatically on insert, rather than requiring pre-computed vectors); GraphQL as its primary query interface (alongside a REST API), a distinctive choice among vector databases; native hybrid search combining vector similarity (via HNSW) with BM25-style keyword scoring; and both a fully open-source, self-hostable core and Weaviate Cloud, a managed offering for teams wanting the convenience without operating infrastructure themselves.
`,

  history: `
Weaviate was created by engineers at **SeMI Technologies** (later renamed Weaviate B.V.), building on earlier internal research into semantic, graph-structured knowledge representation before pivoting specifically toward vector search as its primary, market-defining capability.

| Year | Milestone |
|------|-----------|
| 2016–2018 | SeMI Technologies begins developing what becomes Weaviate, initially exploring semantic knowledge graph representation rather than vector search specifically |
| 2019 | Weaviate is **open-sourced**, with vector search capability increasingly central to its design as the broader embedding-based-search category gains traction |
| 2021 | Weaviate 1.0 ships, establishing its schema-based class/property/cross-reference data model alongside vector search as a mature, combined capability |
| 2022 | Weaviate's module system matures significantly, adding built-in vectorization modules (text2vec-openai, text2vec-cohere, text2vec-huggingface, and others) letting the database itself call an embedding model on insert |
| 2023 | The LLM/RAG application boom drives significant Weaviate adoption growth, with its generative search modules (combining retrieval with LLM-based generation directly within query results) positioning it specifically for RAG use cases |
| 2023 | Weaviate raises significant venture funding to expand Weaviate Cloud (its managed offering) and core engineering |
| 2024 | Continued expansion of hybrid search capabilities and generative module integrations (OpenAI, Cohere, Anthropic, and others) directly within Weaviate's query layer |
| 2024–2025 | Continued releases with performance improvements, expanded multi-tenancy features, and continued focus on being a complete RAG-pipeline-in-a-database rather than purely a vector index |

Weaviate's origin in semantic knowledge graph research, before vector search became its primary market position, directly explains its distinctive data model — classes, typed properties, and cross-references are a genuine, structured graph-adjacent representation, not vector-search functionality with metadata bolted on afterward, a meaningful architectural difference from vector databases that started purely as similarity-search engines and added structure later.
`,

  "why-it-exists": `
Weaviate exists because its founders, working from a semantic-knowledge-representation background, identified a gap in how vector search was typically implemented: **most vector databases treated stored data as flat vectors with simple scalar metadata attached**, when a great deal of real-world data genuinely has meaningful STRUCTURE — objects that reference other objects, properties with real semantic types, hierarchies and relationships — that a purely flat vector-plus-metadata model flattens away unnecessarily.

The prior landscape (vector search tools, pre-Weaviate) offered:

1. **Flat vector-plus-metadata models**: functional for many use cases, but forcing genuinely relational or hierarchical data (an article referencing its author, a product belonging to a category) into flat scalar metadata loses the ability to query across those relationships directly.
2. **Separate pipelines for embedding generation**: most vector databases assumed your application had already computed embeddings before insertion, requiring separate embedding-model infrastructure and application code to bridge the gap between raw content and stored vectors.

Weaviate's insight was to combine a genuinely schema-rich, cross-reference-capable data model (closer to a lightweight knowledge graph than a flat vector store) WITH vector search as a first-class capability, and to build vectorization directly INTO the database via a pluggable module system — letting the database itself call out to an embedding model (OpenAI's, Cohere's, a self-hosted Hugging Face model, or others) when you insert raw content, rather than requiring your application to manage that step separately. This positioned Weaviate specifically for RAG and semantic search applications where the underlying data's structure and relationships genuinely matter, and where reducing the application-side plumbing needed to go from "raw content" to "searchable, vectorized data" has real developer-experience value.
`,

  "problem-it-solves": `
Weaviate solves the **"my data has genuine structure and relationships beyond flat metadata, and I want vector search plus embedding generation handled together, inside the database"** problem.

Concretely, Weaviate provides:

- **A schema-rich data model**: classes with typed properties and cross-references between objects, letting genuinely relational/hierarchical data be modeled directly rather than flattened into scalar metadata.
- **Built-in vectorization modules**: insert raw text (or images, via appropriate modules) and let Weaviate call an embedding model itself (OpenAI, Cohere, Hugging Face, or a self-hosted model), removing the separate embedding-generation step from your application code.
- **Native hybrid search**: combining HNSW-based vector similarity with BM25-style keyword scoring in one query, addressing the same "pure semantic search can miss exact terms" gap covered across this platform's other hybrid-search-capable technologies.
- **Generative search modules**: combining retrieval with LLM-based generation directly within a single query, letting a RAG-style "retrieve then generate an answer" pattern be expressed more directly within Weaviate's own query layer rather than requiring separate application-level orchestration.
- **GraphQL as a primary query interface**: a distinctive choice reflecting Weaviate's graph-adjacent data model, letting queries traverse cross-references between objects alongside vector similarity search.
- **Full open-source availability with a managed cloud option**: Weaviate Cloud provides the same convenience tradeoff Zilliz Cloud offers for Milvus — managed convenience without abandoning open-source portability.

What Weaviate deliberately does **not** solve, or solves with a real tradeoff: its GraphQL-based query interface, while powerful, has a steeper learning curve than a simpler REST/JSON query API for engineers unfamiliar with GraphQL; its built-in vectorization modules add convenience but introduce a dependency on (and cost from) whichever embedding provider's module you use, versus more direct control over your own embedding pipeline; and like Milvus, self-hosting Weaviate at genuine production scale requires real operational investment, though generally considered somewhat lighter-weight than operating a full Milvus cluster.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Weaviate's schema-based data model (classes, properties, cross-references) and how it differs from a flat vector-plus-metadata approach.
2. Define a schema, insert objects (with or without pre-computed vectors), and query using both GraphQL and Weaviate's client SDKs.
3. Use Weaviate's built-in vectorization modules to automatically generate embeddings on insert.
4. Perform hybrid search combining vector similarity and BM25 keyword scoring, tuning the balance between them.
5. Use cross-references to query across related objects in a single request.
6. Apply Weaviate's generative search modules for RAG-style retrieve-then-generate query patterns.
7. Design an appropriate multi-tenancy strategy using Weaviate's native tenant isolation features.
8. Compare Weaviate against Pinecone, Milvus, and Qdrant, articulating the specific tradeoffs of each.
9. Answer senior-level interview questions on Weaviate's data model, module system, and when its structured/schema-rich approach is the right choice.
`,

  prerequisites: `
- **Required**: the **Embeddings** and **Vector Search** skills — foundational concepts Weaviate's vectorization modules and HNSW-based search build on.
- **Very helpful**: the **GraphQL** skill, since Weaviate's primary query interface is GraphQL, a distinctive choice among vector databases.
- **Very helpful**: the **Pinecone** and **Milvus** skills for direct contrast — understanding both a fully managed service and a maximally distributed self-hosted option clarifies exactly where Weaviate's schema-rich, module-based approach sits in the landscape.
- **Helpful**: the **RAG** skill for the application context Weaviate's generative search modules directly serve.

Dependency links: **Embeddings** and **Vector Search** → **GraphQL** for the query interface → **Pinecone**/**Milvus** for contrasting architectures → this page → **Qdrant** for a further self-hosted comparison → **RAG** for the application context.
`,

  "beginner-concepts": `
### Defining a schema (class and properties)

~~~python
import weaviate

client = weaviate.connect_to_local()

client.collections.create(
    name="Article",
    properties=[
        weaviate.classes.config.Property(name="title", data_type=weaviate.classes.config.DataType.TEXT),
        weaviate.classes.config.Property(name="content", data_type=weaviate.classes.config.DataType.TEXT),
        weaviate.classes.config.Property(name="category", data_type=weaviate.classes.config.DataType.TEXT)
    ]
)
~~~

A "collection" (Weaviate's current terminology, previously called a "class") defines a schema with typed properties — a genuinely more structured, upfront data-modeling step than Pinecone's more implicit metadata approach, closer in spirit to defining a table's columns in a relational database.

### Inserting objects with automatic vectorization

~~~python
articles = client.collections.get("Article")
articles.data.insert({
    "title": "Understanding RAG Architecture",
    "content": "Retrieval-augmented generation combines...",
    "category": "AI"
})
~~~

If a vectorization module (text2vec-openai, for instance) is configured on the collection, Weaviate automatically generates the embedding from the object's text properties on insert — no separate embedding-generation step needed in your application code, a distinctive convenience versus most other vector databases covered in this category.

### Basic vector similarity search

~~~python
results = articles.query.near_text(query="how does retrieval augmented generation work", limit=5)
for obj in results.objects:
    print(obj.properties["title"])
~~~

near_text() lets you search using raw text directly — Weaviate handles vectorizing your query text using the same module configured for the collection, then performs the similarity search, a direct convenience of the built-in vectorization approach.

### Combining vector search with property filtering

~~~python
from weaviate.classes.query import Filter

results = articles.query.near_text(
    query="retrieval augmented generation",
    filters=Filter.by_property("category").equal("AI"),
    limit=5
)
~~~

Filtering combines vector similarity search with structured property conditions, the same "similar AND matching this condition" capability covered across every vector database in this category.

Common beginner trap: assuming a collection's vectorization module and query-time vectorization automatically stay consistent if you change the module configuration after data already exists — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### Cross-references between objects

~~~python
client.collections.create(
    name="Author",
    properties=[weaviate.classes.config.Property(name="name", data_type=weaviate.classes.config.DataType.TEXT)]
)

client.collections.create(
    name="Article",
    properties=[...],
    references=[weaviate.classes.config.ReferenceProperty(name="hasAuthor", target_collection="Author")]
)

articles.data.insert({"title": "...", "content": "..."}, references={"hasAuthor": author_uuid})
~~~

Cross-references let one object reference another (an Article referencing its Author), and queries can traverse these references — a genuinely graph-adjacent capability distinguishing Weaviate's data model from a flat vector-plus-metadata approach; this is the direct, concrete realization of Weaviate's origin in semantic knowledge representation.

### Querying across cross-references

~~~python
results = articles.query.near_text(
    query="machine learning trends",
    return_references=weaviate.classes.query.QueryReference(link_on="hasAuthor", return_properties=["name"])
)
for obj in results.objects:
    print(obj.properties["title"], obj.references["hasAuthor"].objects[0].properties["name"])
~~~

A single query can return both the matched article's own properties AND its referenced author's properties, avoiding a separate application-level lookup — the direct payoff of modeling relationships as first-class cross-references rather than flattened metadata.

### Hybrid search: tuning the vector-versus-keyword balance

~~~python
results = articles.query.hybrid(
    query="retrieval augmented generation",
    alpha=0.75,   -- 0 = pure keyword (BM25), 1 = pure vector similarity, 0.5 = balanced
    limit=5
)
~~~

Weaviate's hybrid search exposes an explicit alpha parameter tuning the blend between BM25 keyword scoring and vector similarity — a directly tunable knob (versus, for instance, Pinecone's less explicitly parameterized hybrid approach), letting you empirically tune the balance for your specific domain's retrieval quality needs.

### Generative search (RAG within the query layer)

~~~python
response = articles.generate.near_text(
    query="what is retrieval augmented generation",
    single_prompt="Summarize this article in one sentence: {content}",
    limit=3
)
for obj in response.objects:
    print(obj.generated)   -- the LLM-generated response, computed directly as part of the query
~~~

Generative search modules combine retrieval with LLM-based generation directly within Weaviate's query response — a distinctive capability letting a basic RAG pattern be expressed more directly in the database layer itself, rather than requiring the application to separately orchestrate "retrieve, then call an LLM."

### Multi-tenancy

~~~python
client.collections.create(
    name="Article",
    properties=[...],
    multi_tenancy_config=weaviate.classes.config.Configure.multi_tenancy(enabled=True)
)
articles.tenants.create(["tenant-42"])
tenant_articles = articles.with_tenant("tenant-42")
tenant_articles.data.insert({...})
~~~

Weaviate's native multi-tenancy feature provides genuine per-tenant data isolation with dedicated resource allocation per tenant, a more structurally built-in approach than Pinecone's namespaces or Milvus's partitions, reflecting Weaviate's design specifically accounting for multi-tenant SaaS use cases as a first-class scenario.
`,

  "advanced-concepts": `
### The module system architecture

~~~mermaid
flowchart LR
    Insert["Insert raw text"] --> VectorModule["Vectorizer module\n(text2vec-openai,\ntext2vec-cohere, etc.)"]
    VectorModule --> Embedding["Generated embedding"]
    Embedding --> HNSWIndex["HNSW index\n(vector storage + search)"]
    Query["Query"] --> GenerativeModule["Generative module\n(generative-openai, etc.)\n(optional, for RAG-style queries)"]
    HNSWIndex --> GenerativeModule
    GenerativeModule --> Response["Response with\nretrieved objects + generated text"]
~~~

Weaviate's module system is genuinely pluggable — vectorizer modules (text2vec-*), generative modules (generative-*), and reranker modules (reranker-*) can each be swapped independently, letting you choose your preferred embedding provider, LLM provider, and reranking approach separately, while Weaviate's own core (schema, cross-references, HNSW indexing) remains constant across whichever combination you choose.

### BYOV: bring your own vectors

~~~python
articles.data.insert(
    properties={"title": "...", "content": "..."},
    vector=my_precomputed_embedding   -- skip the vectorizer module entirely
)
~~~

Despite Weaviate's built-in vectorization convenience, you can always provide pre-computed vectors directly, bypassing the module system entirely — important for teams with an existing embedding pipeline, custom fine-tuned embedding models, or specific reasons to control embedding generation themselves rather than delegating it to Weaviate's module.

### Consistency and replication

~~~python
client.collections.create(
    name="Article",
    properties=[...],
    replication_config=weaviate.classes.config.Configure.replication(factor=3)
)
~~~

Weaviate supports configurable replication factor for high availability, with tunable consistency levels (similar in spirit to Milvus's consistency-level flexibility) for balancing read/write consistency guarantees against performance.

### GraphQL as the underlying query language

~~~graphql
{
  Get {
    Article(nearText: {concepts: ["retrieval augmented generation"]}, limit: 5) {
      title
      content
      hasAuthor { ... on Author { name } }
    }
  }
}
~~~

While Weaviate's Python/JS/Go client SDKs abstract this away for most common usage (as shown in earlier sections), Weaviate's underlying query interface IS GraphQL — a distinctive architectural choice among vector databases, directly enabling the cross-reference-traversal capability covered earlier, since GraphQL's own data model is naturally suited to expressing "fetch this object AND its related objects" queries.

### Reranking modules

~~~python
results = articles.query.near_text(
    query="RAG architecture",
    limit=20,
    rerank=weaviate.classes.query.Rerank(prop="content", query="RAG architecture")
)
~~~

Weaviate's reranker modules (wrapping providers like Cohere's rerank API) let you retrieve a larger initial candidate set and apply a more sophisticated reranking model directly within the query, the same retrieve-then-rerank pattern covered in the **Pinecone** and **FAISS** skills, but expressed as a built-in Weaviate capability rather than separate application-level orchestration.

### Vector index types beyond HNSW

Weaviate primarily uses HNSW (the same algorithm covered in depth in the **FAISS** skill) as its default vector index, with ongoing work on alternative index types (including flat indexes for smaller collections and specialized compressed variants) for different scale/memory tradeoffs, following the same fundamental speed-versus-memory-versus-recall considerations covered throughout this category.
`,

  "internal-working": `
What happens inside Weaviate from an insert (with automatic vectorization) to a queryable, cross-reference-aware object:

~~~mermaid
flowchart LR
    A["Client inserts object\n(raw text properties)"] --> B["Schema validation\n(properties match defined types)"]
    B --> C["Vectorizer module invoked\n(if configured)\n-> generates embedding"]
    C --> D["Object + vector + properties\nstored, HNSW index updated"]
    D --> E["Cross-references (if any)\nlinked to referenced objects"]
    E --> F["Object is now searchable\nvia vector similarity, BM25,\nor cross-reference traversal"]
~~~

1. **Schema validation**: an inserted object's properties are validated against the collection's defined schema (correct types, required fields) — a genuinely more structured validation step than a flat, schemaless metadata approach provides.
2. **Vectorization (if configured)**: if the collection has a vectorizer module configured, Weaviate calls out to that module (which may itself call an external API like OpenAI's, or a locally-hosted model) to generate the object's embedding from its text properties — this step introduces a real, measurable latency and potential external-API dependency on the insert path, worth understanding explicitly.
3. **Index update**: the generated (or provided) vector is added to the collection's HNSW index, and the object's properties are stored for later retrieval/filtering.
4. **Cross-reference linking**: any specified cross-references are recorded, enabling later queries to traverse from this object to its related objects (and vice versa) directly.

**Why the vectorization-on-insert step matters practically**: because Weaviate's built-in vectorizer modules typically call an EXTERNAL embedding API (OpenAI, Cohere) unless you're using a self-hosted module, bulk insertion of a large dataset incurs real, potentially rate-limited, potentially costly API calls during the insert process itself — a genuinely important operational consideration distinguishing Weaviate's convenience-oriented default from a workflow where embeddings are pre-computed once, offline, and inserted as already-computed vectors.
`,

  architecture: `
A senior engineer thinks about Weaviate at two levels: **the schema/class/cross-reference model as the primary data-design decision** (a genuinely different mental model than flat vector-plus-metadata) and **module selection** (vectorizer, generative, reranker) as a key architectural choice affecting both capability and external dependencies.

### Weaviate's data model as architecture

~~~mermaid
flowchart LR
    subgraph Schema["Weaviate schema"]
        ArticleClass["Article collection\n(title, content, category)"]
        AuthorClass["Author collection\n(name)"]
        ArticleClass -->|cross-reference: hasAuthor| AuthorClass
    end
    ArticleClass --> HNSW["HNSW vector index\n(per collection)"]
~~~

Designing a Weaviate schema is closer to relational/graph schema design than defining flat vector metadata — deciding what should be its own collection (with its own vector index) versus a property, and where cross-references genuinely add query value versus unnecessary complexity, is the primary Weaviate-specific design skill.

### Module selection as an architectural decision

~~~
Module decisions when designing a Weaviate deployment:
├── Vectorizer module (or BYOV): which embedding provider,
│                                  and the cost/latency/dependency
│                                  implications of calling it on every insert
├── Generative module (optional): which LLM provider for
│                                    in-query RAG-style generation
├── Reranker module (optional): whether retrieve-then-rerank
│                                  quality improvement is needed
└── Self-hosted vs Weaviate Cloud: operational burden tradeoff,
                                     the same consideration as Milvus's
                                     self-hosted vs Zilliz Cloud choice
~~~

Rules mature teams follow: design the schema around genuine data relationships, using cross-references where they add real query value; choose BYOV (bring your own vectors) when you need tight control over embedding generation or want to avoid per-insert external API costs/latency; and choose modules deliberately, understanding each introduces its own external dependency and cost profile.
`,

  "data-flow": `
Tracing one hybrid, generative RAG-style query end to end:

~~~mermaid
sequenceDiagram
    participant App
    participant Weaviate
    participant VectorizerModule as Vectorizer module
    participant HNSW as HNSW index + BM25
    participant GenerativeModule as Generative module (LLM)

    App->>Weaviate: generate.near_text(query="explain RAG", single_prompt="Summarize: {content}")
    Weaviate->>VectorizerModule: vectorize the query text
    VectorizerModule-->>Weaviate: query embedding
    Weaviate->>HNSW: vector similarity search (+ BM25 if hybrid)
    HNSW-->>Weaviate: top matching objects (properties + cross-references)
    Weaviate->>GenerativeModule: for each result, generate a response\nusing the single_prompt template + object content
    GenerativeModule-->>Weaviate: generated text per object
    Weaviate-->>App: objects with BOTH retrieved properties\nAND LLM-generated summaries, in one response
~~~

The most misunderstood part for newcomers: **a single Weaviate query can invoke MULTIPLE external module calls** (a vectorizer module for the query, potentially a generative module per result, potentially a reranker module) — each representing a real network call to an external API (unless self-hosted modules are used), meaning a seemingly simple generative search query can have meaningfully more latency and cost than a plain vector similarity search, a genuinely important consideration when reasoning about a Weaviate-powered application's actual end-to-end latency and per-query cost.
`,

  "production-usage": `
### Configuring a vectorizer module

~~~yaml
# docker-compose.yml environment configuration
ENABLE_MODULES: text2vec-openai,generative-openai
OPENAI_APIKEY: your-api-key
~~~

Non-negotiables for production:

1. **Understand each configured module's external dependency and cost implications** — a vectorizer or generative module calling an external API introduces both a genuine cost per operation and a dependency on that external service's availability.
2. **Choose BYOV (pre-computed vectors) for large-scale bulk ingestion** where per-insert external API calls would be prohibitively slow, rate-limited, or costly, computing embeddings in a separate, batchable pipeline instead.
3. **Design cross-references deliberately**, matching genuine query needs rather than modeling every possible relationship as a cross-reference by default.

### Common production stacks

- **RAG applications wanting an integrated pipeline**: Weaviate's generative modules letting retrieve-then-generate be expressed more directly in the query layer, reducing application-side orchestration code.
- **Content platforms with genuine relational structure**: articles referencing authors, products belonging to categories belonging to departments — precisely the schema-rich, cross-reference-heavy use case Weaviate's data model directly serves.
- **Multi-tenant SaaS applications**: leveraging Weaviate's native multi-tenancy feature for genuine per-tenant isolation with dedicated resource allocation.
`,

  "industry-examples": `
- **Instabase**: has used Weaviate for semantic search and document understanding capabilities within its AI-powered document processing platform.
- **Various RAG-focused startups**: Weaviate is a common choice specifically for teams wanting generative search modules to reduce the application-level orchestration code needed for a basic RAG pattern.
- **Stack Overflow**: has explored and discussed vector search infrastructure (including Weaviate among the options considered) for semantic search capabilities across its content.
- **Media and content platforms with genuine relational content structure**: publishers with articles-referencing-authors-referencing-publications-style data models are a natural fit for Weaviate's cross-reference capability specifically.
- **Many teams building "chat with your documents" style products**: Weaviate's combination of hybrid search and generative modules directly supports this common product pattern with less custom application code than assembling the same pipeline from a purely vector-only database plus a separate LLM integration.
- **The broader open-source Weaviate community**: given its full open-source availability, Weaviate has a substantial community of self-hosted deployments across a wide range of company sizes and industries, particularly among teams valuing its schema-rich data model for genuinely structured content.

Pattern to notice: Weaviate adoption clusters around **applications with genuinely structured, relational content and teams wanting more of the RAG pipeline (vectorization, generation, reranking) handled directly within the database layer** — a meaningfully different adoption driver than Milvus's large-scale/self-hosting-control focus or Pinecone's pure operational-convenience focus.
`,

  "best-practices": `
1. **Design the schema around genuine data relationships**, using cross-references where they add real query value rather than modeling every conceivable relationship.
2. **Choose BYOV (pre-computed vectors) for large-scale bulk ingestion**, avoiding per-insert external API costs/latency/rate-limiting that a vectorizer module would otherwise incur at scale.
3. **Understand the cost and latency implications of every configured module** — vectorizer, generative, and reranker modules each represent a real external dependency, not a free convenience.
4. **Tune hybrid search's alpha parameter empirically** for your specific domain, rather than assuming a default balance between keyword and vector scoring is optimal.
5. **Use Weaviate's native multi-tenancy feature for genuine multi-tenant isolation needs**, taking advantage of its purpose-built design for this scenario.
6. **Design cross-reference traversal queries deliberately**, understanding the query-time cost of following references versus simply denormalizing frequently-needed data.
7. **Use generative search modules judiciously**, understanding each result potentially incurs a separate LLM API call, with real cost and latency implications at scale.
8. **Choose self-hosted versus Weaviate Cloud deliberately** based on actual operational capacity, the same consideration covered for Milvus's self-hosted-versus-Zilliz-Cloud choice.
9. **Validate retrieval quality empirically when tuning hybrid search or reranking**, rather than assuming a specific configuration works well without measurement.
10. **Monitor module-specific latency and error rates separately** from core vector search performance, since a slow generative module call has a different root cause than a slow HNSW search.
11. **Batch bulk operations** for efficient ingestion, the same universal discipline covered across every database on this platform.
12. **Recognize when Weaviate's schema-rich model is (and isn't) worth the added structure** — a genuinely flat, unstructured dataset may not benefit from cross-references and structured schema design the way genuinely relational content does.
`,

  "anti-patterns": `
### Using vectorizer modules for large-scale bulk ingestion without considering cost/rate limits

~~~python
# WRONG — inserting millions of objects one at a time, each triggering
# a real external API call to a vectorizer module, incurring enormous
# cost and hitting rate limits
for doc in millions_of_documents:
    articles.data.insert({"content": doc})   -- each call hits OpenAI's API individually

# RIGHT — pre-compute embeddings in a batchable, rate-limit-aware pipeline,
# then bulk insert with BYOV
embeddings = embed_in_batches(millions_of_documents)   -- your own batched pipeline
for doc, embedding in zip(millions_of_documents, embeddings):
    articles.data.insert({"content": doc}, vector=embedding)
~~~

This is one of the most damaging, most common Weaviate mistakes at scale — the built-in vectorization convenience is genuinely valuable for smaller-scale or interactive use cases, but becomes a real cost and reliability liability for large-scale bulk ingestion without deliberate batching/rate-limit awareness.

### Over-modeling flat data with unnecessary cross-references

~~~
-- WRONG — creating a cross-reference for every conceivable relationship,
-- even ones that don't correspond to genuine query needs, adding
-- unnecessary schema complexity

-- RIGHT — cross-references specifically where queries genuinely need
-- to traverse from one object to related objects; simple scalar
-- properties for anything not actually queried relationally
~~~

### Other production-grade anti-patterns

- **Not understanding generative search's per-result LLM cost**: a query returning many results, each triggering a separate generative module call, can incur meaningfully more cost and latency than expected without this being obvious from the query's own simplicity.
- **Ignoring hybrid search's alpha parameter and using an unvalidated default**: not tuning the vector-versus-keyword balance empirically for your specific domain's actual retrieval quality needs.
- **Choosing self-hosting without an honest operational-capacity assessment**, the same universal self-hosted-database consideration covered across Milvus and every other self-hostable option in this category.
- **Not accounting for module-specific external dependencies in application resilience planning**: a vectorizer or generative module's external API being unavailable affects your application differently than a core Weaviate infrastructure issue, and error handling should distinguish between them.
`,

  performance: `
### Rule zero: measure module latency separately from core search latency

Since a Weaviate query can invoke multiple external module calls (vectorization, generation, reranking), decompose your latency measurement to understand which specific component dominates — core HNSW search is typically fast, while an external generative module call can dominate overall query latency for generative search patterns.

### The performance hierarchy (apply in order)

1. **Use BYOV for bulk ingestion** rather than per-insert vectorizer module calls, avoiding both latency and cost at scale.
2. **Tune hybrid search's alpha parameter** based on empirical retrieval quality measurement for your specific domain.
3. **Design cross-references and schema deliberately** to match actual query patterns, avoiding unnecessary reference-traversal overhead for relationships that aren't genuinely queried.
4. **Use reranking judiciously**, understanding it adds a real latency cost in exchange for improved final relevance — appropriate when that tradeoff genuinely benefits your application's quality bar.
5. **Consider self-hosted vectorizer modules** (rather than external API-based ones) for latency-sensitive, high-throughput use cases where external API round-trip time becomes a meaningful bottleneck.
6. **Scale Weaviate horizontally** (via its own sharding/replication configuration) once a single instance's capacity is genuinely the bottleneck.

### Micro-level facts worth knowing

- Cross-reference traversal has a real query-time cost proportional to how many references are followed and how many objects are returned per reference — deeply nested cross-reference queries can be meaningfully more expensive than a flat property query.
- Generative search's cost scales with the number of results generated for, not just the number of results retrieved — limiting generative results to genuinely needed count matters for cost control.
- HNSW's own tuning parameters (similar to those covered in the **FAISS** skill) remain relevant within Weaviate's implementation, worth validating empirically for your specific collection's scale and recall requirements.
`,

  scalability: `
Weaviate scales through **horizontal sharding and replication**, generally considered a somewhat lighter operational footprint than Milvus's fully disaggregated microservice architecture, while still providing genuine distributed scaling capability.

### Sharding and replication

~~~python
client.collections.create(
    name="Article",
    properties=[...],
    sharding_config=weaviate.classes.config.Configure.sharding(desired_count=3),
    replication_config=weaviate.classes.config.Configure.replication(factor=2)
)
~~~

Weaviate collections can be sharded across multiple nodes for horizontal scaling, with a configurable replication factor for high availability — a more straightforward, less microservice-heavy architecture than Milvus's approach, appropriate for teams wanting genuine horizontal scale without Milvus's full architectural complexity.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single node's capacity exceeded | Increase sharding count, distributing data across more nodes |
| Vectorizer module rate limits during bulk ingestion | Use BYOV with your own batched, rate-limit-aware embedding pipeline |
| Generative search cost/latency at scale | Limit the number of results generated for; consider a self-hosted generative model for high-volume use |
| Cross-reference traversal cost at scale | Design schema deliberately; consider denormalizing frequently-needed cross-reference data if traversal cost becomes a genuine bottleneck |
| High availability needs | Configure an appropriate replication factor across nodes |
`,

  security: `
### Weaviate's built-in security features

1. **API key and OIDC-based authentication**: Weaviate supports API key authentication and OIDC (OpenID Connect) integration for more sophisticated identity provider integration.
2. **Role-based access control (RBAC)**: fine-grained permissions controlling access to specific collections and operations.
3. **TLS/SSL for connections**: encrypting data in transit, standard practice for any production deployment.
4. **Multi-tenancy's built-in isolation**: genuine per-tenant data isolation as a first-class feature, relevant for multi-tenant SaaS security requirements specifically.

### What remains the application's/operator's responsibility

- **Module API key management**: since vectorizer/generative modules typically call external APIs (OpenAI, Cohere), those providers' own API keys must be managed securely (environment variables/a secrets manager), a genuinely distinct credential-management surface from Weaviate's own authentication.
- **Network isolation**: the same universal self-hosted-database security practice covered across every other self-hosted database on this platform — Weaviate should never be directly exposed to the public internet without appropriate authentication and network controls.
- **Data sent to external modules**: since vectorizer/generative modules send your actual data content to external APIs (unless using self-hosted modules), consider the data-sensitivity implications of this external data flow for any genuinely sensitive content.

### The module-specific security consideration

A genuinely distinctive Weaviate security consideration versus other vector databases: because content is sent to external module APIs (OpenAI, Cohere) for vectorization/generation, your data's exposure surface extends beyond Weaviate's own infrastructure to include whichever external providers your configured modules call — a real consideration for applications with strict data-handling requirements, worth weighing explicitly, similar in spirit to any third-party API integration's data-sharing implications.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing Weaviate-dependent application code follows similar principles to testing against any database, with Weaviate's module system adding a distinct testing consideration around external module dependencies.

~~~python
import pytest
import weaviate

@pytest.fixture
def test_client():
    client = weaviate.connect_to_local()
    yield client
    client.close()

def test_insert_and_search_with_byov(test_client):
    collection = test_client.collections.create(
        name="TestArticle",
        properties=[weaviate.classes.config.Property(name="title", data_type=weaviate.classes.config.DataType.TEXT)]
    )
    collection.data.insert({"title": "Test"}, vector=[0.1] * 8)   -- BYOV avoids needing a real vectorizer module in tests
    results = collection.query.near_vector(near_vector=[0.1] * 8, limit=1)
    assert results.objects[0].properties["title"] == "Test"
    test_client.collections.delete("TestArticle")
~~~

Using BYOV (bring your own vectors) in tests avoids depending on a real external vectorizer module (and its associated cost/latency/reliability) purely for test purposes, a genuinely useful testing pattern specific to Weaviate's module architecture.

### Testing cross-references

~~~python
def test_cross_reference_traversal(test_client):
    -- create Author and Article collections with a cross-reference, as shown in Intermediate Concepts
    -- insert a test author and article referencing it
    results = articles.query.fetch_objects(
        return_references=weaviate.classes.query.QueryReference(link_on="hasAuthor", return_properties=["name"])
    )
    assert results.objects[0].references["hasAuthor"].objects[0].properties["name"] == "Test Author"
~~~

### The senior testing doctrine

- Use BYOV in tests to avoid depending on real external vectorizer/generative modules, keeping tests fast and independent of external API availability/cost.
- Test cross-reference creation and traversal explicitly, since this is one of Weaviate's most distinctive capabilities and a common source of schema-design bugs.
- If genuinely testing module integration (vectorizer/generative behavior), use a separate, clearly-marked integration test suite that's understood to incur real external API cost, run less frequently than the main test suite.
- Test hybrid search's alpha parameter behavior explicitly if your application's retrieval quality depends on a specific tuned value.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check schema validation errors directly** — Weaviate's client libraries provide clear errors for property type mismatches or missing required fields, the first thing to verify when an insert fails unexpectedly.
2. **Verify which vectorization approach is actually being used** — confirm whether a configured module is generating the embedding, or whether you intended to use BYOV but the module configuration is still active and overriding your provided vector.
3. **Weaviate's console/GraphQL playground** — provides interactive query exploration and schema inspection without needing to write client code for every diagnostic check.
4. **Check module-specific logs and error responses** — since vectorizer/generative modules call external APIs, module-specific failures (rate limits, API key issues) surface differently than core Weaviate errors.
5. **Isolate cross-reference query issues** — test simple property queries first, then add cross-reference traversal, to isolate whether an issue is in the base query or the reference-following logic specifically.

### Debugging common Weaviate-specific symptoms

- "Insert fails with a schema validation error" — verify the object's properties match the collection's defined schema exactly, including required fields and correct data types.
- "Search results seem irrelevant despite hybrid search being configured" — check the alpha parameter's actual value; an unintentionally extreme alpha (very close to 0 or 1) may be effectively disabling one of the two hybrid search components.
- "Generative search is slow or expensive" — check how many results are actually being generated for; a large limit with generative search enabled multiplies the number of external LLM API calls.
- "Cross-reference query returns no related objects" — verify the reference was actually created at insert time (using the correct reference property name), not just that the schema defines the cross-reference capability.
`,

  monitoring: `
Production Weaviate visibility rests on the same three pillars as any database, with Weaviate's module system requiring monitoring distinct from core vector search performance.

### Key metrics to track

- **Core vector search latency** (HNSW/BM25 query execution), separate from any module-related latency.
- **Module-specific latency and error rate** (vectorizer, generative, reranker calls), since these represent genuinely distinct external dependencies with their own failure modes.
- **Module-related cost tracking** (external API calls to OpenAI, Cohere, etc.), a genuinely important cost signal distinct from Weaviate's own infrastructure cost.
- **Cross-reference query complexity/cost**, for applications relying heavily on reference traversal.
- **Cluster health** (for sharded/replicated deployments): node availability, shard distribution, replication lag.

### Tools

Weaviate exposes Prometheus-compatible metrics natively, integrating into a broader Prometheus/Grafana observability stack — see the **Prometheus** and **Grafana** skills; Weaviate's own console provides schema and collection-level visibility for ad-hoc inspection.

### Alerting priorities

Alert on: module-specific error rate increases (distinguishing external API issues from core Weaviate issues), module-related cost trending unexpectedly upward, core search latency degrading beyond acceptable thresholds, and cluster health issues for sharded/replicated deployments.
`,

  deployment: `
### Self-hosted deployment via Docker

~~~yaml
version: "3.4"
services:
  weaviate:
    image: semitechnologies/weaviate:1.24.0
    environment:
      ENABLE_MODULES: text2vec-openai,generative-openai
      OPENAI_APIKEY: your-api-key
    ports:
      - "8080:8080"
~~~

Weaviate's self-hosted deployment (via Docker Compose for smaller scale, or Kubernetes for genuine production scale) is generally considered a somewhat simpler operational footprint than Milvus's fully disaggregated microservice architecture, though still requiring genuine operational attention for production use.

### Kubernetes deployment for production scale

~~~bash
helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm install my-weaviate weaviate/weaviate --set replicas=3
~~~

The official Weaviate Helm chart manages a genuinely distributed, replicated deployment for production-scale needs.

### Weaviate Cloud as the managed alternative

For teams preferring not to self-host, Weaviate Cloud provides Weaviate's capabilities as a managed service — the same convenience-versus-control tradeoff covered for Zilliz Cloud/Milvus, since the underlying Weaviate software remains open-source and portable.

### CI/CD pipeline

Schema definitions (collections, properties, cross-references) are typically managed via infrastructure-as-code or application-level provisioning scripts, run as an explicit, versioned deploy step. See the **CI/CD**, **Docker**, and **Kubernetes** skills for the broader deployment pipeline context.
`,

  "production-checklist": `
Before a Weaviate-backed application takes real traffic:

- [ ] Schema (collections, properties, cross-references) designed deliberately around actual data relationships and query needs
- [ ] Vectorizer module choice (or BYOV) made deliberately, considering cost/latency implications at your actual scale
- [ ] Bulk ingestion uses BYOV with a batched, rate-limit-aware embedding pipeline, not per-insert vectorizer module calls
- [ ] Hybrid search's alpha parameter tuned and validated empirically for your domain
- [ ] Generative search's per-result cost understood and result count limited appropriately
- [ ] Authentication (API key or OIDC) and role-based access control configured explicitly
- [ ] TLS/SSL enabled for all connections
- [ ] Network isolation configured, never directly exposing Weaviate to the public internet
- [ ] Module API keys (OpenAI, Cohere, etc.) loaded from environment variables/a secrets manager
- [ ] Multi-tenancy configured explicitly if genuine per-tenant isolation is required
- [ ] Sharding and replication configured appropriately for your scale and availability requirements
- [ ] Module-specific monitoring in place, distinct from core vector search metrics
- [ ] Data-sensitivity implications of external module API calls (OpenAI, Cohere) explicitly considered
- [ ] Load test done: known query throughput and latency, including module-related latency, under realistic load
- [ ] Runbook: how to diagnose module-specific failures versus core Weaviate infrastructure issues
`,

  "common-mistakes": `
1. **Using vectorizer modules for large-scale bulk ingestion without batching/rate-limit awareness**, incurring enormous cost and hitting rate limits.
2. **Over-modeling flat data with unnecessary cross-references**, adding schema complexity without corresponding query value.
3. **Not understanding generative search's per-result LLM cost**, being surprised by cost/latency that scales with result count.
4. **Ignoring hybrid search's alpha parameter and using an unvalidated default**, missing potential retrieval quality improvements from empirical tuning.
5. **Assuming module configuration changes automatically re-vectorize existing data**, when changing a vectorizer module doesn't retroactively affect already-inserted objects' embeddings.
6. **Not distinguishing module-specific errors/latency from core Weaviate performance** in monitoring and debugging, conflating genuinely different failure modes.
7. **Choosing self-hosting without an honest operational-capacity assessment**, the same universal consideration across every self-hostable vector database.
8. **Not considering the data-sensitivity implications of sending content to external module APIs** (OpenAI, Cohere) for vectorization/generation.
9. **Designing schema without genuine relational structure in mind**, missing Weaviate's core differentiating value if the data doesn't actually benefit from cross-references.
10. **Not testing cross-reference creation and traversal explicitly**, a common source of schema-design bugs given this capability's relative complexity versus simpler flat metadata.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Schema validation error on insert | Object properties don't match the collection's defined types, or a required field is missing | Verify properties match the schema exactly |
| Vectorizer module error (rate limit, API key issue) | The configured external embedding API (OpenAI, Cohere) rejected the request | Check API key validity and rate limit status; consider BYOV for bulk operations |
| Cross-reference not found in query results | The reference was never actually created at insert time, despite being defined in the schema | Verify the insert call included the reference with the correct property name and target object UUID |
| Generative module error | The configured generative module's external API call failed | Check the generative provider's API key and status; verify prompt template syntax |
| Hybrid search results seem entirely keyword-based or entirely vector-based | The alpha parameter is set to an extreme value (near 0 or 1) | Adjust alpha toward a more balanced value and re-evaluate retrieval quality |
| Collection not found | Referencing a collection name that doesn't exist or has a typo | Verify the collection name with client.collections.list_all() or equivalent |
| Connection refused | Weaviate isn't running or isn't reachable at the configured address | Verify the Weaviate instance is running and the connection URL/port is correct |
`,

  faqs: `
**Weaviate or Pinecone/Milvus/Qdrant?**
Choose Weaviate specifically when your data has genuine relational structure benefiting from cross-references, or when you want vectorization/generation/reranking handled directly within the database via modules rather than entirely in application code. Choose Pinecone for zero operational burden, Milvus for maximum self-hosted scale/architectural sophistication, or Qdrant for a lighter-weight, performance-focused self-hosted option — see each respective skill for direct comparison.

**Do I have to use Weaviate's built-in vectorization modules?**
No — BYOV (bring your own vectors) lets you provide pre-computed embeddings directly, bypassing the module system entirely, important for large-scale bulk ingestion (avoiding per-insert external API costs) or when you have specific reasons to control embedding generation yourself.

**Why does Weaviate use GraphQL instead of a simpler REST/JSON query API?**
Weaviate's schema-rich, cross-reference-capable data model is naturally suited to GraphQL's own data model, which directly supports expressing "fetch this object and its related objects" queries; most client SDKs abstract this away for common usage, but understanding the underlying GraphQL layer helps for more complex queries.

**What is generative search, and is it the same as building a full RAG pipeline myself?**
Generative search combines retrieval with LLM-based generation directly within Weaviate's query response, reducing the application-level orchestration code needed for a basic retrieve-then-generate pattern — it's a genuine convenience for simpler RAG patterns, though more complex RAG pipelines (multi-step reasoning, complex prompt engineering, agentic patterns) still typically require application-level orchestration beyond what generative search alone provides.

**How does Weaviate's multi-tenancy compare to Pinecone's namespaces or Milvus's partitions?**
Weaviate's multi-tenancy is a more structurally built-in, first-class feature specifically designed for multi-tenant SaaS isolation with dedicated per-tenant resource allocation, reflecting deliberate design attention to this scenario, versus Pinecone's namespaces (a simpler logical partitioning mechanism) or Milvus's partitions (similarly a logical subdivision, though Milvus's overall architecture wasn't specifically designed around multi-tenancy as its primary use case).

**Is Weaviate open source?**
Yes — fully open-source and self-hostable, with Weaviate Cloud as an optional managed alternative, the same open-source-plus-managed-option model covered for Milvus, distinct from Pinecone's fully closed-source approach.
`,

  "interview-questions": `
### Junior level

1. **What makes Weaviate's data model different from a flat vector-plus-metadata approach?**
   Model answer: Weaviate uses a schema-based model with typed properties and cross-references between objects (like an Article referencing its Author), letting genuinely relational data be modeled and queried directly, rather than flattening everything into scalar metadata fields.

2. **What does Weaviate's built-in vectorization capability provide?**
   Model answer: You can insert raw text and let Weaviate's configured vectorizer module (calling OpenAI, Cohere, or another embedding provider) automatically generate the embedding, rather than requiring your application to pre-compute it separately.

3. **What is BYOV?**
   Model answer: Bring your own vectors — providing a pre-computed embedding directly at insert time, bypassing Weaviate's vectorizer module entirely.

4. **What query language does Weaviate primarily use?**
   Model answer: GraphQL, a distinctive choice among vector databases, directly enabling its cross-reference traversal capability; most client SDKs abstract this away for common usage.

5. **What is a cross-reference in Weaviate?**
   Model answer: A link from one object to another (like an Article to its Author), letting queries traverse and retrieve related objects' properties in one request rather than requiring a separate lookup.

### Senior level

6. **Why must you be careful using vectorizer modules for large-scale bulk ingestion?**
   Model answer: Vectorizer modules typically call an external embedding API (OpenAI, Cohere) per insert unless self-hosted, meaning bulk-inserting a large dataset incurs real, potentially rate-limited, potentially expensive external API calls during ingestion — BYOV with a separately batched embedding pipeline avoids this at scale.

7. **How does Weaviate's generative search work, and what's its cost/latency implication at scale?**
   Model answer: Generative search retrieves matching objects and then calls a configured generative module (an external LLM API, typically) to generate a response PER RESULT, directly within the query — cost and latency scale with the number of results generated for, not just the number retrieved, so limiting result count matters for cost control at scale.

8. **Explain Weaviate's hybrid search alpha parameter and how you'd tune it.**
   Model answer: Alpha blends BM25 keyword scoring (alpha near 0) with vector similarity scoring (alpha near 1); the right value depends on your specific domain's retrieval quality needs and should be validated empirically against real queries and expected results, rather than assumed from a default.

9. **When would cross-references genuinely add value versus being unnecessary schema complexity?**
   Model answer: When queries genuinely need to traverse from one object to related objects in a single request (fetching an article and its author's name together, for instance) — modeling every conceivable relationship as a cross-reference regardless of actual query needs adds unnecessary schema complexity without corresponding benefit.

10. **How does Weaviate's module system architecture provide flexibility, and what's the tradeoff?**
    Model answer: Vectorizer, generative, and reranker modules are each independently pluggable, letting you choose your preferred provider for each concern while Weaviate's core (schema, cross-references, HNSW indexing) remains constant; the tradeoff is that each configured module introduces its own external dependency, cost, and potential failure mode that must be understood and monitored separately from core Weaviate performance.

11. **How does Weaviate's multi-tenancy differ architecturally from simply using a metadata filter for tenant isolation?**
    Model answer: Weaviate's native multi-tenancy provides genuine, structurally built-in per-tenant data isolation with dedicated resource allocation, a more first-class feature than relying purely on a metadata/scalar filter for tenant scoping (which requires the application to correctly apply that filter on every query, with no structural enforcement) — though similar in spirit to Pinecone's namespaces, Weaviate's implementation reflects deliberate design attention to multi-tenant SaaS scenarios specifically.

12. **What's the genuine data-security consideration specific to Weaviate's module system?**
    Model answer: Because vectorizer/generative modules typically send your actual content to external provider APIs (OpenAI, Cohere) for processing, your data's exposure surface extends beyond Weaviate's own infrastructure to include those external providers — a consideration worth weighing explicitly for applications with strict data-handling requirements, distinct from Weaviate's own infrastructure security, and addressable via self-hosted module alternatives if needed.
`,

  "coding-questions": `
### 1. Design a schema with cross-references for a content platform

~~~python
client.collections.create(
    name="Author",
    properties=[weaviate.classes.config.Property(name="name", data_type=weaviate.classes.config.DataType.TEXT)]
)

client.collections.create(
    name="Article",
    properties=[
        weaviate.classes.config.Property(name="title", data_type=weaviate.classes.config.DataType.TEXT),
        weaviate.classes.config.Property(name="content", data_type=weaviate.classes.config.DataType.TEXT)
    ],
    references=[weaviate.classes.config.ReferenceProperty(name="hasAuthor", target_collection="Author")],
    vectorizer_config=weaviate.classes.config.Configure.Vectorizer.text2vec_openai()
)
# Follow-up: how would you extend this schema to support articles with
# MULTIPLE authors, and what does that imply about the cross-reference's
# cardinality configuration?
~~~

### 2. Implement a robust bulk ingestion pipeline using BYOV

~~~python
def bulk_ingest_with_precomputed_vectors(collection, documents, embedding_model, batch_size=100):
    with collection.batch.dynamic() as batch:
        for i in range(0, len(documents), batch_size):
            chunk = documents[i:i + batch_size]
            embeddings = embedding_model.embed_batch([doc["content"] for doc in chunk])
            for doc, embedding in zip(chunk, embeddings):
                batch.add_object(properties=doc, vector=embedding)
# Follow-up: why does using BYOV here avoid a major operational risk that
# using Weaviate's built-in text2vec-openai module directly for this same
# bulk operation would introduce, especially for a dataset of millions of documents?
~~~

### 3. Implement a hybrid search with tuned alpha and result reranking

~~~python
def search_with_tuning(collection, query_text, alpha=0.6, limit=20, final_k=5):
    results = collection.query.hybrid(
        query=query_text,
        alpha=alpha,
        limit=limit,
        rerank=weaviate.classes.query.Rerank(prop="content", query=query_text)
    )
    return results.objects[:final_k]
# Follow-up: how would you design an evaluation set to empirically determine
# the best alpha value for your specific domain, and what metric would you
# use to compare different alpha settings' retrieval quality?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a schema-rich content search feature
Define a schema with at least two collections and a cross-reference between them, insert sample data (using a vectorizer module or BYOV), and implement basic vector search combined with cross-reference retrieval. Deliverable: a working search feature retrieving both matched objects and their related objects. Skills exercised: schema design, cross-references, basic search.

### Lab 2 (Intermediate): Implement hybrid search with empirical alpha tuning
Build a hybrid search feature, create a small evaluation set of queries with known expected relevant results, and empirically test several alpha values to find the best-performing balance for your dataset. Deliverable: a documented alpha-tuning analysis. Skills exercised: hybrid search, empirical evaluation, retrieval quality measurement.

### Lab 3 (Advanced): Build a generative RAG feature using Weaviate's generative modules
Configure a generative module, and build a "retrieve and summarize" or "retrieve and answer" feature using Weaviate's built-in generative search, comparing the development effort against implementing the same pattern with a separate vector-only database plus manual LLM orchestration. Deliverable: a working generative search feature with a documented development-effort comparison. Skills exercised: generative modules, RAG pattern implementation.

### Lab 4 (Production): Deploy Weaviate with multi-tenancy and monitoring
Deploy Weaviate via Docker/Kubernetes with multi-tenancy enabled, implement a multi-tenant application with isolation tests, and set up module-specific monitoring distinguishing core search performance from module-related latency/cost. Deliverable: a production-checklist-compliant multi-tenant deployment with monitoring. Skills exercised: multi-tenancy, deployment, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A "chat with your documentation" RAG product feature
Engineering requirements: a Weaviate schema modeling documents and their sections as cross-referenced collections, hybrid search combining keyword and semantic matching, and generative search modules directly producing summarized or synthesized answers from retrieved content. Demonstrates Weaviate's distinctive fit for reducing RAG pipeline orchestration code via its module system.

### 2. A publishing platform's content recommendation and relationship system
Engineering requirements: a schema modeling articles, authors, categories, and tags as cross-referenced collections, enabling both "similar articles" vector search and "articles by this author's frequent co-authors" relationship-traversal queries in one system. Demonstrates Weaviate's cross-reference capability applied to genuinely relational content.

### 3. A multi-tenant SaaS knowledge base search product
Engineering requirements: Weaviate's native multi-tenancy providing genuine per-customer data isolation, BYOV-based bulk ingestion for each tenant's initial document corpus (avoiding vectorizer module cost/rate-limit issues at onboarding scale), and ongoing incremental updates using the vectorizer module for the lower-volume ongoing insert stream. Demonstrates a realistic, cost-aware hybrid approach to Weaviate's vectorization convenience versus BYOV control.
`,

  "case-studies": `
### Weaviate's origin in semantic knowledge representation
Weaviate's founders' background in semantic knowledge graph research, predating its current market position as a vector database, directly explains its distinctive schema-rich, cross-reference-capable data model — a genuine architectural inheritance from a different starting point than vector databases that began purely as similarity-search engines. Lesson: a technology's origin story and its founders' original problem framing often leave a lasting, identifiable architectural signature, even after the product's primary market positioning shifts significantly (here, from knowledge representation to vector search specifically).

### The module system as a deliberate flexibility-versus-simplicity tradeoff
Weaviate's pluggable module system (vectorizer, generative, reranker modules each independently swappable) reflects a deliberate architectural bet: rather than building one opinionated, fixed pipeline, Weaviate lets teams choose their preferred provider for each concern while keeping its core capabilities constant. Lesson: a modular, pluggable architecture trades some simplicity (more configuration decisions, more potential external dependencies to understand) for genuine flexibility (swapping an embedding or LLM provider without changing your core database or application architecture) — a tradeoff worth making deliberately based on how much provider flexibility a specific project's requirements actually demand.

### GraphQL as an underlying query language for a graph-adjacent data model
Weaviate's choice of GraphQL as its primary query interface, a distinctive choice among vector databases (most of which use REST/JSON-based query APIs), directly reflects its cross-reference-capable data model's genuine alignment with GraphQL's own strength at expressing "fetch this object and its related objects" queries. Lesson: choosing a query language/interface that genuinely matches your data model's actual shape (rather than defaulting to whatever's most common in the broader category) can produce a more naturally expressive API, even at the cost of a steeper learning curve for engineers unfamiliar with that specific query paradigm.

### Generative search modules directly targeting the RAG application category
Weaviate's continued investment in generative search modules (combining retrieval with LLM-based generation directly within the query layer) since the 2023 RAG boom illustrates a deliberate strategic response to a growing application category's specific needs — rather than remaining purely a vector-search engine and leaving all RAG orchestration to application code, Weaviate chose to absorb more of that pipeline directly into the database layer itself as a differentiating capability.
`,

  comparisons: `
| Aspect | Weaviate | Pinecone | Milvus | Qdrant |
|--------|---------|---------|--------|--------|
| Open source | Yes | No (closed source) | Yes | Yes |
| Data model | Schema-rich, cross-references (graph-adjacent) | Flat metadata | Explicit schema, no native cross-references | Flat payload/metadata |
| Built-in vectorization | Yes (pluggable modules) | No (bring your own) | No (bring your own) | No (bring your own) |
| Generative search modules | Yes, built in | No | No | No |
| Query interface | GraphQL (primary), client SDKs abstract it | REST/gRPC, JSON-based | REST/gRPC | REST/gRPC |
| Best fit | Genuinely relational content, integrated RAG pipeline convenience | Zero-ops, fast time to production | Large-scale, maximally distributed self-hosted needs | Lightweight, performance-focused self-hosted needs |

**How seniors choose**: reach for Weaviate specifically when your data has genuine relational structure benefiting from cross-references, or when built-in vectorization/generation modules would meaningfully reduce your application's RAG pipeline orchestration code; reach for Pinecone for zero operational burden; reach for Milvus for maximum self-hosted scale and architectural sophistication; reach for Qdrant for a lighter-weight, performance-focused self-hosted alternative without Weaviate's schema-rich modeling or Milvus's full distributed complexity.
`,

  "related-technologies": `
- **GraphQL** — Weaviate's primary query interface; see the **GraphQL** skill for the general query language theory this builds on.
- **Pinecone** and **Milvus** — the fully managed and maximally self-hosted-scale alternatives respectively, essential direct comparisons; see both skills.
- **Qdrant** — the other major open-source, self-hostable vector database, positioned as a lighter-weight alternative; see the **Qdrant** skill.
- **Embeddings** and **Vector Search** — the foundational concepts underlying Weaviate's vectorizer modules and HNSW-based search.
- **RAG** — the application context Weaviate's generative search modules directly target.
- **Docker** and **Kubernetes** — the deployment technologies for self-hosted Weaviate.

Learning path: **Embeddings** and **Vector Search** → **GraphQL** → **Pinecone**/**Milvus** for contrasting architectures → this page → **Qdrant** for a further comparison → **RAG** for the application context.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Weaviate 1.24.x** and later releases continue expanding module support (additional vectorizer, generative, and reranker provider integrations) and refining multi-tenancy and replication features.
- **Weaviate Cloud** continues expanding its managed offering, positioning itself alongside Zilliz Cloud as a middle ground between full self-hosting and closed-source managed services.
- Continued growth in generative search module capabilities specifically, given the ongoing RAG application category's demand for more integrated retrieve-and-generate pipeline support.
- Given the rapid pace of the broader vector database ecosystem's evolution, verify current module provider support, multi-tenancy feature maturity, and performance characteristics against Weaviate's official documentation rather than assuming parity with what's described here.
`,

  "future-roadmap": `
Where Weaviate is heading, and what's worth betting career time on:

- **Continued module system expansion**, likely adding support for more embedding, generative, and reranking providers over time, reinforcing its position as an integrated RAG-pipeline-in-a-database.
- **Continued multi-tenancy feature investment**, given its clear strategic alignment with multi-tenant SaaS use cases specifically.
- **Continued cross-reference and schema capability refinement**, likely remaining Weaviate's core, distinctive differentiator versus flatter vector-database data models.
- **What to bet on**: deep fluency in schema design for genuinely relational data (the class/property/cross-reference model), hybrid search tuning, and understanding the cost/latency implications of module-based architectures — these concepts transfer meaningfully to reasoning about any vector database with growing "integrated pipeline" ambitions, not just Weaviate specifically.
`,

  "cheat-sheet": `
~~~python
import weaviate

client = weaviate.connect_to_local()

# ---- Schema: classes, typed properties, cross-references ----
client.collections.create(
    name="Article",
    properties=[
        weaviate.classes.config.Property(name="title", data_type=weaviate.classes.config.DataType.TEXT),
        weaviate.classes.config.Property(name="category", data_type=weaviate.classes.config.DataType.TEXT)
    ],
    references=[weaviate.classes.config.ReferenceProperty(name="hasAuthor", target_collection="Author")],
    vectorizer_config=weaviate.classes.config.Configure.Vectorizer.text2vec_openai()  # or none, for BYOV
)

# ---- Insert: automatic vectorization OR bring your own vector (BYOV) ----
articles.data.insert({"title": "...", "category": "AI"}, references={"hasAuthor": author_uuid})
articles.data.insert({"title": "..."}, vector=my_precomputed_embedding)  # BYOV - use for BULK ingestion!

# ---- Search: raw text, auto-vectorized ----
results = articles.query.near_text(query="how does RAG work", limit=5)

# ---- Hybrid search: tune the vector/keyword balance ----
articles.query.hybrid(query="...", alpha=0.75, limit=5)  # 0=keyword(BM25), 1=vector

# ---- Cross-reference traversal in one query ----
articles.query.near_text(query="...",
  return_references=weaviate.classes.query.QueryReference(link_on="hasAuthor", return_properties=["name"]))

# ---- Generative search (RAG in the query layer) ----
articles.generate.near_text(query="...", single_prompt="Summarize: {content}")

# ---- Multi-tenancy ----
articles.tenants.create(["tenant-42"])
articles.with_tenant("tenant-42").data.insert({...})

# ---- ALWAYS use BYOV for bulk ingestion (avoid per-insert external API calls!) ----
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What distinguishes Weaviate's data model? | Schema-rich: classes, typed properties, cross-references — graph-adjacent, not flat. |
| What is a cross-reference? | A link from one object to another, queryable in a single request (e.g., Article -> Author). |
| Built-in vectorization? | Yes — pluggable modules (text2vec-openai, etc.) generate embeddings on insert automatically. |
| What is BYOV? | Bring your own vectors — skip the vectorizer module, provide a pre-computed embedding. |
| Why use BYOV for bulk ingestion? | Avoids per-insert external API cost/rate-limits that vectorizer modules incur at scale. |
| Primary query interface? | GraphQL — a distinctive choice, enabling natural cross-reference traversal. |
| Hybrid search alpha parameter? | 0 = pure BM25 keyword, 1 = pure vector similarity — tune empirically per domain. |
| What is generative search? | Retrieval + LLM generation combined directly in one query response. |
| Generative search cost scaling? | Per RESULT generated for, not just per query — limit result count for cost control. |
| Weaviate's multi-tenancy? | Native, first-class per-tenant isolation with dedicated resource allocation. |
| Is Weaviate open source? | Yes — self-hostable, with Weaviate Cloud as an optional managed alternative. |
| Module system security consideration? | Content is sent to EXTERNAL APIs (OpenAI, Cohere) for vectorization/generation. |
| When does Weaviate's structure genuinely pay off? | When data has real relationships — not for flat, unstructured datasets. |
`,

  mcqs: `
1. What distinguishes Weaviate's data model from a flat vector-plus-metadata approach?
   A) Faster indexing  B) A schema-rich model with cross-references between objects  C) No support for filtering  D) Smaller storage footprint
   **Answer: B** — a genuinely graph-adjacent model, not just vectors with attached scalars.

2. Why should you use BYOV (bring your own vectors) for large-scale bulk ingestion?
   A) It's required by Weaviate  B) Avoids per-insert external API costs and rate limits that vectorizer modules incur  C) It's faster to write code for  D) BYOV is the only option available
   **Answer: B** — the vectorizer module's convenience becomes a real cost/reliability risk at scale.

3. What does Weaviate's hybrid search alpha parameter control?
   A) Replication factor  B) The blend between BM25 keyword scoring and vector similarity scoring  C) Number of shards  D) Cross-reference depth
   **Answer: B** — 0 is pure keyword, 1 is pure vector, tuned empirically.

4. What is generative search, and what does its cost scale with?
   A) A caching mechanism; free  B) Retrieval + LLM generation in one query; cost scales per result generated for  C) A backup feature; scales with storage  D) A reranking-only feature
   **Answer: B** — a large result limit with generative search multiplies external LLM API calls.

5. What is Weaviate's primary query interface?
   A) Raw SQL  B) GraphQL  C) A proprietary binary protocol only  D) XML-RPC
   **Answer: B** — a distinctive choice among vector databases, matching its cross-reference-capable data model.

6. Is Weaviate open source?
   A) No, fully proprietary like Pinecone  B) Yes — self-hostable, with Weaviate Cloud as an optional managed layer  C) Only the core engine, not the modules  D) Open source only for non-commercial use
   **Answer: B** — the same open-source-plus-managed-option model as Milvus, unlike Pinecone.
`,

  "revision-notes": `
Weaviate is an open-source vector database distinguished by a schema-rich data model — classes with typed properties and CROSS-REFERENCES between objects — reflecting its founders' origin in semantic knowledge graph research rather than starting purely as a similarity-search engine. This lets genuinely relational data (articles referencing authors, products belonging to categories) be modeled and queried directly, retrieving both a matched object's own properties AND its related objects' properties in one request, rather than flattening everything into scalar metadata the way most other vector databases require.

Weaviate's built-in module system is its other major differentiator: vectorizer modules (text2vec-openai, text2vec-cohere, and others) let you insert raw text and have Weaviate automatically generate embeddings by calling an external embedding API, removing a separate embedding-generation step from application code. This convenience carries a genuine operational risk at scale, however — bulk-inserting a large dataset through a vectorizer module incurs real, potentially rate-limited, potentially costly external API calls during ingestion itself; BYOV (bring your own vectors, providing pre-computed embeddings directly) is the correct approach for large-scale bulk ingestion, reserving vectorizer modules for smaller-scale or genuinely interactive insert patterns.

Weaviate's hybrid search exposes an explicit alpha parameter blending BM25 keyword scoring (alpha near 0) with vector similarity scoring (alpha near 1), a directly tunable knob that should be validated empirically against real retrieval-quality measurements for a specific domain rather than assumed from a default value. Generative search modules combine retrieval with LLM-based generation directly within Weaviate's query response, letting a basic RAG pattern be expressed more directly in the database layer — but cost and latency scale with the number of RESULTS generated for, not just the number retrieved, making result-count limits a genuine cost-control consideration at scale.

GraphQL is Weaviate's underlying, primary query interface — a distinctive choice among vector databases, directly reflecting the natural alignment between GraphQL's own data model and Weaviate's cross-reference-traversal capability, though most client SDKs abstract this away for common usage patterns. Weaviate's native multi-tenancy feature provides genuine, first-class per-tenant data isolation with dedicated resource allocation, reflecting deliberate design attention to multi-tenant SaaS scenarios specifically, a somewhat more structurally built-in approach than Pinecone's namespaces or Milvus's partitions.

A genuinely distinctive security/data-handling consideration specific to Weaviate: because vectorizer and generative modules typically send actual content to external provider APIs (OpenAI, Cohere), an application's data-exposure surface extends beyond Weaviate's own infrastructure to include those external providers — worth weighing explicitly for applications with strict data-handling requirements, addressable via self-hosted module alternatives where needed. Weaviate is fully open-source and self-hostable (with Weaviate Cloud as an optional managed alternative, the same open-source-plus-managed-option model as Milvus/Zilliz Cloud), generally considered a somewhat lighter operational footprint than Milvus's fully disaggregated microservice architecture while still requiring genuine operational investment at production scale.
`,

  "learning-roadmap": `
**Week 1 — Weaviate fundamentals**: schema definition (classes, properties), inserting objects with and without vectorizer modules, and basic vector search. Milestone: build a working search feature over a small dataset using both auto-vectorization and BYOV.

**Week 2 — Cross-references and relational modeling**: designing schemas with genuine cross-references, and querying across them in a single request. Milestone: build a two-collection schema with a cross-reference, retrieving both a matched object and its related object's properties together.

**Week 3 — Hybrid search and empirical tuning**: understanding and tuning the alpha parameter, building a small evaluation set to measure retrieval quality at different settings. Milestone: document an alpha-tuning analysis with measured retrieval quality results.

**Week 4 — Generative search and RAG integration**: configuring generative modules, building a retrieve-and-generate feature, and understanding its cost/latency scaling. Milestone: build a working generative search feature, comparing its development effort against manual RAG orchestration.

**Week 5 — Multi-tenancy and production resilience**: implementing native multi-tenancy with isolation tests, and designing bulk ingestion pipelines using BYOV to avoid vectorizer module cost/rate-limit issues at scale. Milestone: build a multi-tenant application with a cost-aware, BYOV-based bulk ingestion pipeline.

**Week 6 — Deployment and architectural decision-making**: self-hosted deployment via Docker/Kubernetes versus Weaviate Cloud, module-specific monitoring, and comparing Weaviate against Pinecone/Milvus/Qdrant for specific hypothetical workloads. Milestone: complete a production-checklist-compliant deployment, with a documented rationale for choosing (or not choosing) Weaviate for a specific described application.

Next platform skill once this roadmap is complete: **Qdrant** for a further self-hosted vector database comparison, or **RAG** for going deeper on the application architecture Weaviate's generative modules directly serve.
`,

  "official-docs": `
- **weaviate.io/developers/weaviate** — the official Weaviate documentation, comprehensive and the primary reference for schema design, modules, and query syntax covered throughout this page.
- **weaviate.io/developers/weaviate/model-providers** — the official documentation on vectorizer, generative, and reranker module configuration and provider options.
- **weaviate.io/developers/weaviate/concepts/data** — the official data model documentation covering classes, properties, and cross-references in depth.
- **weaviate.io/developers/weaviate/manage-data/multi-tenancy** — the official multi-tenancy documentation.
`,

  books: `
Given Weaviate's nature as a rapidly-evolving open-source project, there is limited book-length treatment specifically of Weaviate; the most relevant reading covers the broader RAG and vector search domain:

- **"Building LLM Applications" style current books covering RAG architecture** — typically include Weaviate as one of several vector database options in worked examples, useful for the broader application-integration context.
- **"Learning GraphQL" — Eve Porcello and Alex Banks** — not Weaviate-specific, but useful foundational reading for understanding the query interface Weaviate's underlying API is built on.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not Weaviate-specific, but essential foundational reading for the general distributed-systems concepts underlying Weaviate's sharding/replication model.
`,

  blogs: `
- **The official Weaviate blog (weaviate.io/blog)** — release announcements, RAG architecture guidance, and educational content directly from the Weaviate team.
- **Weaviate's own podcast and educational video series** — covering vector search, RAG, and Weaviate-specific feature deep-dives.
- **Various RAG-application engineering blogs discussing Weaviate's generative search modules** — practical, applied content on integrating retrieve-and-generate patterns.
`,

  "research-papers": `
Weaviate itself, as a commercial open-source project, has limited dedicated academic literature of its own — the most relevant foundational reading concerns the vector search theory and knowledge-graph concepts it builds on:

- See the **FAISS** and **Vector Search** skills' Research Papers sections for the foundational HNSW paper underlying Weaviate's own vector indexing.
- **Hogan, A. et al. — "Knowledge Graphs"** (2021, ACM Computing Surveys) — a comprehensive survey of knowledge graph concepts directly relevant to understanding Weaviate's cross-reference-capable data model's origins.
- **Hartig, O. and Perez, J. — "Semantics and Complexity of GraphQL"** (2017, WWW) — a foundational academic treatment of GraphQL's query semantics, relevant to understanding Weaviate's underlying query interface.
`,

  videos: `
- **Weaviate's official YouTube channel and podcast** — tutorials, architecture deep-dives, and feature walkthroughs directly from the Weaviate team.
- **Weaviate's community meetups and conference talks** — covering real-world usage patterns and production deployment experiences.
- **"Vector Databases Explained" style comparative content** (various creators) covering Weaviate alongside Pinecone, Milvus, and Qdrant for a comparative quick reference.
- **RAG architecture conference talks** featuring Weaviate's generative search modules as a discussed or demonstrated capability.
`,

  "github-repos": `
- **weaviate/weaviate** — the database's own source code, the primary reference for understanding its architecture directly.
- **weaviate/weaviate-python-client** (and equivalents for other languages) — the official client SDK repositories.
- **weaviate/recipes** — Weaviate's own official collection of tutorials and example applications, demonstrating common RAG and search use cases directly.
- **weaviate/weaviate-helm** — the official Kubernetes Helm chart for production deployment.
- **weaviate/weaviate-io** — the source for Weaviate's own documentation site.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Schema design**: given a described content domain (articles, authors, categories), design a Weaviate schema with appropriate cross-references, justifying each modeling decision.
2. **Vectorization strategy**: implement both an auto-vectorized insert path and a BYOV bulk-ingestion path for the same dataset, comparing cost/latency implications.
3. **Hybrid search tuning**: build a small evaluation set and empirically determine the best alpha value for a specific domain's retrieval quality.
4. **Cross-reference queries**: implement and test queries traversing cross-references in both directions (from Article to Author, and finding all Articles by a given Author).
5. **Generative search**: implement a retrieve-and-summarize feature using generative search modules, and measure its actual cost/latency at varying result-count limits.
6. **External practice sets**: Weaviate's own official "recipes" repository for structured, guided practice with real example applications; the official Weaviate documentation's quickstart guides for hands-on schema design and query exercises.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application"] -->|GraphQL/REST via client SDK| Weaviate[("Weaviate")]
    subgraph Schema["Schema"]
        Article["Article collection"]
        Author["Author collection"]
        Article -->|cross-reference: hasAuthor| Author
    end
    Weaviate -.-> Schema
    subgraph Modules["Pluggable module system"]
        Vectorizer["Vectorizer module\n(text2vec-openai, etc.)"]
        Generative["Generative module\n(generative-openai, etc.)"]
        Reranker["Reranker module"]
    end
    Weaviate -.-> Modules
    Modules -->|external API calls| ExternalAPIs["OpenAI / Cohere / etc."]
    subgraph MultiTenant["Multi-tenancy"]
        Tenant1["Tenant A"]
        Tenant2["Tenant B"]
    end
    Weaviate -.-> MultiTenant
    subgraph ManagedAlt["Managed alternative"]
        WeaviateCloud["Weaviate Cloud"]
    end
    Weaviate -.->|or use| ManagedAlt
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Weaviate))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Data Model
      Classes and collections
      Typed properties
      Cross-references
      Schema design
    Module System
      Vectorizer modules
      Generative modules
      Reranker modules
      BYOV bring your own vectors
    Query Capabilities
      GraphQL interface
      near_text search
      Hybrid search alpha
      Cross-reference traversal
    RAG Integration
      Generative search
      Retrieve then generate
      Cost scaling per result
    Multi-tenancy
      Native tenant isolation
      Dedicated resource allocation
    Deployment
      Self-hosted Docker Kubernetes
      Weaviate Cloud managed
      Sharding and replication
    Comparisons
      Versus Pinecone
      Versus Milvus Qdrant
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default weaviate;
