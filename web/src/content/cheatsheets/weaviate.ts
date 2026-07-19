import type { CheatSheetData } from "./types";

const weaviate: CheatSheetData = {
  title: "The Ultimate Weaviate Cheat Sheet",
  subtitle: "Schema & cross-references · modules · hybrid & generative search · production toolbelt",
  sections: [
    {
      title: "Schema-Rich Data Model",
      color: "violet",
      rows: [
        { term: "Collections (classes)", desc: "Typed properties — closer to a relational schema than flat metadata", code: "client.collections.create(name='Article', properties=[\n  Property(name='title', data_type=DataType.TEXT)])" },
        { term: "Cross-references", desc: "Link objects to other objects — genuinely graph-adjacent", code: "references=[ReferenceProperty(name='hasAuthor', target_collection='Author')]" },
        { term: "Query across references", desc: "Fetch a matched object AND its related object in ONE call", code: "articles.query.near_text(query='...',\n  return_references=QueryReference(link_on='hasAuthor', return_properties=['name']))" },
      ],
    },
    {
      title: "Built-In Vectorization Modules",
      color: "blue",
      rows: [
        { term: "Auto-vectorize on insert", desc: "Insert raw text — Weaviate calls the embedding API itself", code: "vectorizer_config=Configure.Vectorizer.text2vec_openai()" },
        { term: "near_text search", desc: "Query with raw text — Weaviate vectorizes it for you", code: "articles.query.near_text(query='how does RAG work', limit=5)" },
        { term: "BYOV (bring your own vectors)", desc: "ALWAYS use for bulk ingestion — avoid per-insert API cost", code: "articles.data.insert({...}, vector=my_precomputed_embedding)" },
        { term: "Why BYOV matters at scale", desc: "Vectorizer modules = real external API calls, rate limits, cost", code: "// Millions of individual OpenAI calls during bulk insert = disaster" },
      ],
    },
    {
      title: "Hybrid & Generative Search",
      color: "emerald",
      rows: [
        { term: "Hybrid search alpha", desc: "0 = pure BM25 keyword, 1 = pure vector similarity", code: "articles.query.hybrid(query='...', alpha=0.75, limit=5)" },
        { term: "Tune alpha empirically", desc: "Don't assume a default — validate against real queries", code: "// Build a small eval set, compare retrieval quality at several alphas" },
        { term: "Generative search", desc: "Retrieval + LLM generation combined in ONE query response", code: "articles.generate.near_text(query='...', single_prompt='Summarize: {content}')" },
        { term: "Cost scales PER RESULT", desc: "Not per query — limit result count for cost control", code: "// A large result limit with generative search multiplies LLM API calls" },
      ],
    },
    {
      title: "Multi-Tenancy",
      color: "amber",
      rows: [
        { term: "Native tenant isolation", desc: "First-class feature — dedicated per-tenant resources", code: "client.collections.create(name='Article',\n  multi_tenancy_config=Configure.multi_tenancy(enabled=True))" },
        { term: "Create & use a tenant", desc: "Similar purpose to Pinecone namespaces / Milvus partitions", code: "articles.tenants.create(['tenant-42'])\narticles.with_tenant('tenant-42').data.insert({...})" },
      ],
    },
    {
      title: "Query Interface",
      color: "rose",
      rows: [
        { term: "GraphQL underneath", desc: "A distinctive choice — matches the cross-reference data model", code: "{ Get { Article(nearText: {concepts: [\"RAG\"]}) { title } } }" },
        { term: "Client SDKs abstract it", desc: "Most usage doesn't require writing raw GraphQL", code: "// Python/JS/Go clients wrap this for common operations" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Open source + managed option", desc: "Self-hostable (Apache-licensed core) OR Weaviate Cloud", code: "// Same open-source-plus-managed model as Milvus/Zilliz Cloud" },
        { term: "Module API keys", desc: "Manage separately from Weaviate's own auth", code: "ENABLE_MODULES: text2vec-openai\nOPENAI_APIKEY: ..." },
        { term: "Data sent to external APIs", desc: "A genuine, distinctive data-handling consideration", code: "// Vectorizer/generative modules send your content to OpenAI/Cohere" },
        { term: "Sharding & replication", desc: "Lighter footprint than Milvus's full microservice architecture", code: "sharding_config=Configure.sharding(desired_count=3)\nreplication_config=Configure.replication(factor=2)" },
      ],
    },
  ],
};

export default weaviate;
