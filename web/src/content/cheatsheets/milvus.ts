import type { CheatSheetData } from "./types";

const milvus: CheatSheetData = {
  title: "The Ultimate Milvus Cheat Sheet",
  subtitle: "Disaggregated architecture · schemas & indexes · consistency levels · production toolbelt",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Fully open source", desc: "Apache 2.0, self-hostable — no vendor lock-in (unlike Pinecone)", code: "from pymilvus import MilvusClient\nclient = MilvusClient(uri='http://localhost:19530')" },
        { term: "Explicit schema", desc: "More like a relational schema than Pinecone's implicit metadata", code: "schema.add_field(field_name='vector', datatype=DataType.FLOAT_VECTOR, dim=768)\nschema.add_field(field_name='category', datatype=DataType.VARCHAR, max_length=100)" },
        { term: "Create collection", desc: "The top-level container — roughly like a table", code: "client.create_collection(collection_name='docs', schema=schema)" },
        { term: "Insert", desc: "Vectors + typed scalar fields together", code: "client.insert(collection_name='docs', data=[{'vector':emb,'category':'x'}])" },
      ],
    },
    {
      title: "The #1 Gotcha",
      color: "blue",
      rows: [
        { term: "ALWAYS load_collection() first", desc: "Required before efficient search — easy to forget", code: "client.create_index(collection_name='docs', index_params=idx)\nclient.load_collection(collection_name='docs')  # REQUIRED" },
        { term: "Search combining vector + filter", desc: "SQL-like filter syntax, unlike Pinecone's JSON operators", code: "client.search(collection_name='docs', data=[q], limit=5,\n  filter=\"category == 'electronics' and price < 200\")" },
      ],
    },
    {
      title: "Disaggregated Architecture",
      color: "emerald",
      rows: [
        { term: "Independently scalable tiers", desc: "The core differentiator vs simpler self-hosted DBs", code: "// query nodes | data nodes | index nodes -- each scales on its OWN load" },
        { term: "Message-queue-first ingestion", desc: "Kafka/Pulsar: durability + decouples writes from indexing", code: "// insert -> queue (ack'd) -> index nodes build/update asynchronously" },
        { term: "Consistency levels (tune per query)", desc: "Trade latency for read-after-write guarantee strength", code: "client.search(..., consistency_level='Strong')  # or Bounded/Eventually/Session" },
        { term: "Pluggable index backends", desc: "FAISS is one of several options underneath", code: "// Choosing Milvus doesn't mean abandoning FAISS's algorithms" },
      ],
    },
    {
      title: "Multi-Tenancy & Scale",
      color: "amber",
      rows: [
        { term: "Partitions", desc: "Logical subdivision — similar purpose to Pinecone's namespaces", code: "client.create_partition(collection_name='docs', partition_name='tenant_42')\nclient.search(..., partition_names=['tenant_42'])" },
        { term: "Sharding", desc: "Set at collection creation — hard to change later", code: "client.create_collection(collection_name='docs', shards_num=4)" },
        { term: "GPU acceleration", desc: "For genuinely large-scale index build/search", code: "// Same underlying benefit as FAISS's GPU support" },
      ],
    },
    {
      title: "Deployment Modes",
      color: "rose",
      rows: [
        { term: "Standalone", desc: "Simple, single-machine — dev and smaller-scale prod", code: "docker compose up -d  # milvus-standalone-docker-compose.yml" },
        { term: "Cluster (Kubernetes)", desc: "Full distributed mode — genuine large-scale needs only", code: "helm install my-milvus milvus/milvus --set cluster.enabled=true" },
        { term: "Zilliz Cloud", desc: "Managed alternative — open-source portability preserved", code: "// Built by Milvus's own creators; not locked-in like Pinecone" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Governance", desc: "LF AI & Data Foundation — neutral, not solely Zilliz-controlled", code: "// Similar credibility model to Kubernetes' own foundation governance" },
        { term: "Backup", desc: "Dedicated tooling for disaster recovery", code: "milvus-backup create --name backup1" },
        { term: "Monitor EACH tier separately", desc: "An aggregate metric hides tier-specific bottlenecks", code: "// query nodes, data nodes, index nodes: watch independently" },
        { term: "Self-hosting tradeoff", desc: "Full control + no lock-in, in exchange for real ops burden", code: "// A genuine distributed system: multiple services + MQ + object storage" },
      ],
    },
  ],
};

export default milvus;
