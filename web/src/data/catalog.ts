/**
 * The complete skill catalog: every category and skill on the platform.
 *
 * `contentStatus` drives both the UI badge and the buildout tracker:
 *  - "done"        → full 50-section page exists in src/content/skills/
 *  - "in-progress" → being written
 *  - "todo"        → registered, structured stub shown
 *
 * Categories are ordered as a learning path: fundamentals → backend →
 * infrastructure → ML → LLM/agent engineering → production AI.
 */

export type ContentStatus = "done" | "in-progress" | "todo";

export interface Skill {
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  status: ContentStatus;
  /** react-icons/si export name (e.g. "SiPython") for skills that are a
   *  real product/brand. Undefined for conceptual skills with no logo —
   *  callers fall back to the parent category's emoji. */
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface SkillSeed {
  slug: string;
  name: string;
  description: string;
  status?: ContentStatus;
}

const s = (slug: string, name: string, description: string, status: ContentStatus = "todo"): SkillSeed => ({
  slug,
  name,
  description,
  status,
});

const RAW: { category: Category; skills: SkillSeed[] }[] = [
  {
    category: { id: "programming", name: "Programming", emoji: "💻", description: "Core languages every AI engineer builds with." },
    skills: [
      s("python", "Python", " — from scripts to production services.", "done"),
      s("javascript", "JavaScript", "The language of the web and the Node.js runtime.", "done"),
      s("typescript", "TypeScript", "Typed JavaScript for large, maintainable codebases.", "done"),
      s("go", "Go", "Simple, fast, concurrent — infrastructure's favorite language.", "done"),
      s("rust", "Rust", "Memory-safe systems programming without garbage collection.", "done"),
      s("java", "Java", "The enterprise workhorse powering JVM ecosystems.", "done"),
      s("cpp", "C++", "High-performance systems, inference engines, and game engines.", "done"),
    ],
  },
  {
    category: { id: "backend", name: "Backend Engineering", emoji: "⚙️", description: "Frameworks for building production APIs and services." },
    skills: [
      s("fastapi", "FastAPI", "Modern async Python APIs with automatic docs and validation.", "done"),
      s("django", "Django", "Batteries-included Python web framework.", "done"),
      s("flask", "Flask", "Minimal, flexible Python microframework.", "done"),
      s("express", "Express", "The default Node.js web framework.", "done"),
      s("spring-boot", "Spring Boot", "Production-grade Java services with convention over configuration.", "done"),
      s("nodejs", "Node.js", "Event-driven JavaScript runtime for servers.", "done"),
      s("nestjs", "NestJS", "Structured, TypeScript-first Node.js framework.", "done"),
    ],
  },
  {
    category: { id: "databases", name: "Databases", emoji: "🗄️", description: "Relational, document, graph, and analytical storage." },
    skills: [
      s("postgresql", "PostgreSQL", "The world's most advanced open-source relational database.", "done"),
      s("mysql", "MySQL", "The most widely deployed open-source RDBMS.", "done"),
      s("mongodb", "MongoDB", "Document database for flexible schemas.", "done"),
      s("redis", "Redis", "In-memory data store: cache, queue, and more.", "done"),
      s("neo4j", "Neo4j", "Native graph database for connected data.", "done"),
      s("elasticsearch", "Elasticsearch", "Distributed search and analytics engine.", "done"),
      s("clickhouse", "ClickHouse", "Columnar OLAP database for real-time analytics.", "done"),
      s("sqlite", "SQLite", "The embedded database inside everything.", "done"),
    ],
  },
  {
    category: { id: "vector-databases", name: "Vector Databases", emoji: "🧭", description: "Similarity search engines powering RAG and semantic retrieval." },
    skills: [
      s("faiss", "FAISS", "Meta's library for efficient similarity search.", "done"),
      s("pinecone", "Pinecone", "Managed vector database as a service.", "done"),
      s("milvus", "Milvus", "Open-source, cloud-native vector database.", "done"),
      s("weaviate", "Weaviate", "Vector database with hybrid search and modules.", "done"),
      s("qdrant", "Qdrant", "Rust-powered vector search engine.", "done"),
      s("chroma", "Chroma", "Developer-friendly embedded vector store.", "done"),
    ],
  },
  {
    category: { id: "api-development", name: "API Development", emoji: "🔌", description: "Protocols and styles for exposing services." },
    skills: [
      s("rest", "REST", "The dominant architectural style for web APIs.", "done"),
      s("graphql", "GraphQL", "Client-driven query language for APIs.", "done"),
      s("grpc", "gRPC", "High-performance RPC with Protocol Buffers.", "done"),
      s("websockets", "WebSockets", "Full-duplex, persistent connections.", "done"),
      s("sse", "Server-Sent Events", "One-way streaming over HTTP — how LLMs stream tokens.", "done"),
    ],
  },
  {
    category: { id: "authentication", name: "Authentication", emoji: "🔑", description: "Identity, sessions, and access control." },
    skills: [
      s("oauth", "OAuth 2.0 / OIDC", "Delegated authorization and federated identity.", "done"),
      s("jwt", "JWT", "Stateless, signed tokens for auth.", "done"),
      s("cookies-sessions", "Cookies & Sessions", "Stateful web authentication fundamentals.", "done"),
      s("rbac", "RBAC", "Role-based access control.", "done"),
      s("abac", "ABAC", "Attribute-based, policy-driven access control.", "done"),
    ],
  },
  {
    category: { id: "security", name: "Security", emoji: "🛡️", description: "Attacks, defenses, and cryptography fundamentals." },
    skills: [
      s("sql-injection", "SQL Injection", "The classic injection attack and how to kill it.", "done"),
      s("xss", "XSS", "Cross-site scripting: injection into the browser.", "done"),
      s("csrf", "CSRF", "Cross-site request forgery and same-site defenses.", "done"),
      s("encryption", "Encryption", "Symmetric, asymmetric, and applied cryptography.", "done"),
      s("hashing", "Hashing", "Digests, password hashing, and integrity.", "done"),
      s("tls-https", "TLS & HTTPS", "Transport security: handshakes, certs, PKI.", "done"),
      s("secrets-management", "Secrets Management", "Vaults, rotation, and never committing keys.", "done"),
      s("owasp-top-10", "OWASP Top 10", "The canonical list of web application risks.", "done"),
    ],
  },
  {
    category: { id: "systems", name: "Systems Fundamentals", emoji: "🐧", description: "The layer beneath every service you ship." },
    skills: [
      s("linux", "Linux", "The OS of production: shell, processes, filesystems.", "done"),
      s("networking", "Networking", "TCP/IP, DNS, HTTP — how bytes move.", "done"),
      s("operating-systems", "Operating Systems", "Processes, memory, scheduling, syscalls.", "done"),
    ],
  },
  {
    category: { id: "computer-science", name: "Computer Science", emoji: "🧮", description: "Data structures, algorithms, and design foundations." },
    skills: [
      s("dsa", "Data Structures", "Arrays to graphs: organizing data for efficiency.", "done"),
      s("algorithms", "Algorithms", "Sorting, searching, dynamic programming, complexity.", "done"),
      s("oop", "OOP", "Objects, encapsulation, inheritance, polymorphism.", "done"),
      s("solid", "SOLID Principles", "Five principles of maintainable object design.", "done"),
      s("design-patterns", "Design Patterns", "Reusable solutions to recurring design problems.", "done"),
      s("concurrency", "Concurrency", "Doing many things at once, correctly.", "done"),
      s("multithreading", "Multithreading", "Threads, locks, races, and synchronization.", "done"),
      s("caching-cs", "Caching", "Locality, eviction policies, and cache design.", "done"),
    ],
  },
  {
    category: { id: "cloud-devops", name: "Cloud & DevOps", emoji: "☁️", description: "Infrastructure, containers, and delivery pipelines." },
    skills: [
      s("aws", "AWS", "The largest cloud: core services and patterns.", "done"),
      s("azure", "Azure", "Microsoft's cloud platform.", "done"),
      s("gcp", "GCP", "Google Cloud: data and ML-centric cloud.", "done"),
      s("docker", "Docker", "Containers: build once, run anywhere.", "done"),
      s("kubernetes", "Kubernetes", "Container orchestration at scale.", "done"),
      s("terraform", "Terraform", "Infrastructure as code.", "done"),
      s("cicd", "CI/CD", "Automated build, test, and deploy pipelines.", "done"),
      s("github-actions", "GitHub Actions", "CI/CD native to GitHub.", "done"),
      s("jenkins", "Jenkins", "The veteran self-hosted CI server.", "done"),
      s("git", "Git", "Distributed version control mastery.", "done"),
    ],
  },
  {
    category: { id: "system-design", name: "System Design", emoji: "🏗️", description: "Designing distributed systems that scale." },
    skills: [
      s("distributed-systems", "Distributed Systems", "Consensus, replication, failure models.", "done"),
      s("cap-theorem", "CAP Theorem", "Consistency vs availability under partition.", "done"),
      s("load-balancers", "Load Balancers", "Distributing traffic across servers.", "done"),
      s("reverse-proxy", "Reverse Proxy", "Nginx & friends: the front door of services.", "done"),
      s("api-gateway", "API Gateway", "Single entry point: routing, auth, rate limits.", "done"),
      s("cdn", "CDN", "Content delivery at the edge.", "done"),
      s("caching-systems", "Caching (Systems)", "Cache-aside, write-through, invalidation at scale.", "done"),
      s("message-queues", "Message Queues", "Async decoupling of producers and consumers.", "done"),
      s("kafka", "Kafka", "Distributed event streaming platform.", "done"),
      s("rabbitmq", "RabbitMQ", "The classic AMQP message broker.", "done"),
    ],
  },
  {
    category: { id: "observability", name: "Observability", emoji: "📈", description: "Knowing what production is doing." },
    skills: [
      s("logging", "Logging", "Structured logs and aggregation.", "done"),
      s("metrics", "Metrics", "Counters, gauges, histograms, SLOs.", "done"),
      s("tracing", "Tracing", "Following requests across services.", "done"),
      s("prometheus", "Prometheus", "Pull-based metrics and alerting.", "done"),
      s("grafana", "Grafana", "Dashboards over any data source.", "done"),
      s("opentelemetry", "OpenTelemetry", "The vendor-neutral observability standard.", "done"),
    ],
  },
  {
    category: { id: "machine-learning", name: "Machine Learning & Deep Learning", emoji: "🧠", description: "From classical ML to transformers." },
    skills: [
      s("machine-learning", "Machine Learning", "Supervised, unsupervised, and the ML lifecycle.", "done"),
      s("deep-learning", "Deep Learning", "Training deep neural networks.", "done"),
      s("neural-networks", "Neural Networks", "Perceptrons, backprop, activation functions.", "done"),
      s("cnn", "CNNs", "Convolutional networks for spatial data.", "done"),
      s("rnn", "RNNs", "Recurrent networks for sequences.", "done"),
      s("transformers", "Transformers", "The architecture behind modern AI.", "done"),
      s("attention", "Attention", "Query-key-value: the core mechanism.", "done"),
      s("embeddings", "Embeddings", "Meaning as vectors.", "done"),
      s("vector-search", "Vector Search", "ANN algorithms: HNSW, IVF, quantization.", "done"),
    ],
  },
  {
    category: { id: "llms", name: "LLMs", emoji: "✨", description: "Working with large language models." },
    skills: [
      s("llm-fundamentals", "LLM Fundamentals", "Tokens, context windows, sampling, scaling laws.", "done"),
      s("prompt-engineering", "Prompt Engineering", "Getting reliable behavior out of models.", "done"),
      s("fine-tuning", "Fine-Tuning", "SFT, LoRA, RLHF: adapting models.", "done"),
      s("inference", "Inference", "KV caches, batching, speculative decoding.", "done"),
      s("serving", "Serving", "vLLM, TGI, and LLM serving infrastructure.", "done"),
      s("evaluation", "Evaluation", "Benchmarks, LLM-as-judge, eval harnesses.", "done"),
      s("hallucination", "Hallucination", "Why models confabulate and how to mitigate it.", "done"),
      s("guardrails", "Guardrails", "Input/output safety and policy enforcement.", "done"),
    ],
  },
  {
    category: { id: "ai-agents", name: "AI Agents", emoji: "🤖", description: "LLMs that plan, use tools, and act." },
    skills: [
      s("agents-fundamentals", "Agent Fundamentals", "Loops, tools, planning, autonomy levels.", "done"),
      s("langchain", "LangChain", "The most popular LLM application framework.", "done"),
      s("langgraph", "LangGraph", "Graph-based stateful agent orchestration.", "done"),
      s("crewai", "CrewAI", "Role-based multi-agent teams.", "done"),
      s("openai-agents-sdk", "OpenAI Agents SDK", "OpenAI's official agent framework.", "done"),
      s("autogen", "AutoGen", "Microsoft's multi-agent conversation framework.", "done"),
      s("agent-memory", "Agent Memory", "Short-term, long-term, and episodic memory.", "done"),
      s("planning", "Planning", "Task decomposition and reasoning strategies.", "done"),
      s("reflection", "Reflection", "Self-critique loops for better outputs.", "done"),
      s("tool-calling", "Tool Calling", "Function calling: the agent-world interface.", "done"),
      s("mcp", "MCP", "Model Context Protocol: standardized tool servers.", "done"),
    ],
  },
  {
    category: { id: "rag", name: "RAG & Knowledge", emoji: "📚", description: "Grounding models in your data." },
    skills: [
      s("rag-fundamentals", "RAG", "Retrieval-augmented generation end to end.", "done"),
      s("knowledge-graphs", "Knowledge Graphs", "Entities and relations as a queryable graph.", "done"),
      s("ontology", "Ontology", "Formal modeling of domain knowledge.", "done"),
      s("graph-databases", "Graph Databases", "Storage engines for connected data.", "done"),
    ],
  },
  {
    category: { id: "production-ai", name: "Production AI", emoji: "🚀", description: "Running AI systems for real users." },
    skills: [
      s("ai-monitoring", "AI Monitoring", "Tracing, drift, and quality in production.", "done"),
      s("cost-optimization", "Cost Optimization", "Token budgets, caching, model routing.", "done"),
      s("latency", "Latency", "TTFT, streaming, and speed engineering.", "done"),
      s("ai-scaling", "Scaling AI", "From one GPU to a fleet.", "done"),
      s("streaming", "Streaming", "Token streaming UX and infrastructure.", "done"),
      s("realtime-ai", "Realtime AI", "Low-latency multimodal interaction.", "done"),
      s("voice-ai", "Voice AI", "STT, TTS, and speech-to-speech pipelines.", "done"),
      s("vision-ai", "Vision AI", "Multimodal models that see.", "done"),
      s("ocr", "OCR", "Extracting text from documents and images.", "done"),
      s("image-generation", "Image Generation", "Diffusion models and image APIs.", "done"),
      s("video-models", "Video Models", "Generation and understanding of video.", "done"),
    ],
  },
  {
    category: { id: "mlops", name: "MLOps & Data Engineering", emoji: "🔁", description: "The lifecycle and pipelines behind models." },
    skills: [
      s("mlops-fundamentals", "MLOps", "Versioning, reproducibility, model lifecycle.", "done"),
      s("mlflow", "MLflow", "Experiment tracking and model registry.", "done"),
      s("kubeflow", "Kubeflow", "ML workflows on Kubernetes.", "done"),
      s("wandb", "Weights & Biases", "Experiment tracking for deep learning.", "done"),
      s("feature-stores", "Feature Stores", "Consistent features for training and serving.", "done"),
      s("airflow", "Airflow", "Workflow orchestration with DAGs.", "done"),
      s("spark", "Spark", "Distributed data processing.", "done"),
      s("data-pipelines", "Data Pipelines", "ETL/ELT design and reliability.", "done"),
    ],
  },
  // ── 2026 additions: production AI engineering essentials ──────────────────
  {
    category: { id: "ai-dev-platforms", name: "AI Development Platforms & Coding Agents", emoji: "🧑‍💻", description: "Agentic coding tools that write, review, and ship software." },
    skills: [
      s("claude-code", "Claude Code", "Anthropic's agentic coding CLI: skills, hooks, MCP, and autonomous workflows.", "done"),
    ],
  },
  {
    category: { id: "ai-evaluation", name: "AI Evaluation & Reliability", emoji: "🧪", description: "Measuring and guaranteeing LLM system quality." },
    skills: [
      s("ai-evals", "AI Evals", "Designing evals: golden datasets, LLM-as-judge, regression testing.", "done"),
      s("ai-harness", "AI Harness", "Evaluation harnesses: automated pipelines that score AI systems continuously.", "done"),
    ],
  },
  {
    category: { id: "context-engineering", name: "Context Engineering", emoji: "🧩", description: "Getting the right information into the context window, efficiently." },
    skills: [
      s("context-engineering", "Context Engineering", "Compression, window optimization, prompt caching, long-context strategies.", "done"),
      s("semantic-caching", "Semantic Caching", "Caching LLM responses by meaning, not exact-match keys.", "done"),
    ],
  },
  {
    category: { id: "agent-engineering", name: "Agent Engineering", emoji: "🕸️", description: "Building, coordinating, and governing systems of agents." },
    skills: [
      s("multi-agent-systems", "Multi-Agent Systems", "Orchestration, communication, and coordination of agent teams.", "done"),
      s("agent-observability", "Agent Observability", "Tracing, debugging, and monitoring agent behavior in production.", "done"),
      s("human-in-the-loop", "Human-in-the-Loop AI", "Approval gates, escalation, and oversight in agent systems.", "done"),
    ],
  },
  {
    category: { id: "model-serving", name: "Model Serving & Inference", emoji: "⚡", description: "Engines that run LLMs fast, locally and at scale." },
    skills: [
      s("vllm", "vLLM", "High-throughput LLM serving with PagedAttention and continuous batching.", "done"),
      s("ollama", "Ollama", "Running open models locally with one command.", "done"),
      s("sglang", "SGLang", "Fast structured generation and serving with RadixAttention.", "done"),
    ],
  },
  {
    category: { id: "ai-protocols", name: "AI Protocols & Standards", emoji: "📡", description: "The standards connecting models, tools, and agents." },
    skills: [
      s("structured-outputs", "Structured Outputs", "JSON Schema-constrained generation and function calling standards.", "done"),
      s("openai-responses-api", "OpenAI Responses API", "OpenAI's unified stateful API for tools and agents.", "done"),
      s("openai-realtime-api", "OpenAI Realtime API", "Low-latency speech-to-speech and streaming multimodal sessions.", "done"),
      s("a2a-protocol", "Agent-to-Agent (A2A) Protocol", "Standardized communication between independent agents.", "done"),
    ],
  },
  {
    category: { id: "ai-safety", name: "AI Safety & Governance", emoji: "🔒", description: "Defending, aligning, and governing AI systems." },
    skills: [
      s("prompt-injection-defense", "Prompt Injection Defense", "Detecting and neutralizing injected instructions in untrusted input.", "done"),
      s("ai-red-teaming", "AI Red Teaming", "Adversarial testing: jailbreaks, data leakage, and abuse scenarios.", "done"),
    ],
  },
  {
    category: { id: "llmops", name: "LLMOps", emoji: "🛠️", description: "Operating LLM applications across their lifecycle." },
    skills: [
      s("llmops", "LLMOps", "Prompt management, experiment tracking, and cost monitoring end to end.", "done"),
      s("prompt-versioning", "Prompt Versioning", "Treating prompts as versioned, tested, deployable artifacts.", "done"),
      s("model-routing", "Model Routing", "Sending each request to the cheapest model that can handle it.", "done"),
    ],
  },
  {
    category: { id: "ai-observability", name: "AI Observability Platforms", emoji: "🔭", description: "Platforms for tracing and evaluating LLM applications." },
    skills: [
      s("langsmith", "LangSmith", "LangChain's tracing, eval, and prompt-management platform.", "done"),
      s("langfuse", "Langfuse", "Open-source LLM tracing, analytics, and evaluation.", "done"),
    ],
  },
  {
    category: { id: "ai-frameworks", name: "AI Frameworks", emoji: "🧰", description: "Modern frameworks for LLM and agent applications." },
    skills: [
      s("llamaindex", "LlamaIndex", "The data framework for RAG and knowledge-grounded LLM apps.", "done"),
      s("dspy", "DSPy", "Programming — not prompting — LLMs, with optimizable pipelines.", "done"),
      s("pydantic-ai", "PydanticAI", "Type-safe agent framework built on Pydantic validation.", "done"),
    ],
  },
];

// Only skills that are an actual product/brand get a logo here — every name
// below was verified against react-icons' bundled Simple Icons export list
// before being added. Conceptual skills (RAG, Reflection, Attention, ...)
// intentionally have no entry and fall back to their category's emoji.
const SKILL_ICONS: Record<string, string> = {
  python: "SiPython",
  javascript: "SiJavascript",
  typescript: "SiTypescript",
  go: "SiGo",
  rust: "SiRust",
  cpp: "SiCplusplus",
  fastapi: "SiFastapi",
  django: "SiDjango",
  flask: "SiFlask",
  express: "SiExpress",
  "spring-boot": "SiSpringboot",
  nodejs: "SiNodedotjs",
  nestjs: "SiNestjs",
  postgresql: "SiPostgresql",
  mysql: "SiMysql",
  mongodb: "SiMongodb",
  redis: "SiRedis",
  neo4j: "SiNeo4J",
  elasticsearch: "SiElasticsearch",
  clickhouse: "SiClickhouse",
  sqlite: "SiSqlite",
  milvus: "SiMilvus",
  qdrant: "SiQdrant",
  graphql: "SiGraphql",
  jwt: "SiJsonwebtokens",
  linux: "SiLinux",
  "owasp-top-10": "SiOwasp",
  gcp: "SiGooglecloud",
  docker: "SiDocker",
  kubernetes: "SiKubernetes",
  terraform: "SiTerraform",
  "github-actions": "SiGithubactions",
  jenkins: "SiJenkins",
  git: "SiGit",
  kafka: "SiApachekafka",
  rabbitmq: "SiRabbitmq",
  prometheus: "SiPrometheus",
  grafana: "SiGrafana",
  opentelemetry: "SiOpentelemetry",
  langchain: "SiLangchain",
  langgraph: "SiLanggraph",
  crewai: "SiCrewai",
  mcp: "SiModelcontextprotocol",
  vllm: "SiVllm",
  ollama: "SiOllama",
  mlflow: "SiMlflow",
  wandb: "SiWeightsandbiases",
  airflow: "SiApacheairflow",
  spark: "SiApachespark",
  "claude-code": "SiClaudecode",
  "pydantic-ai": "SiPydantic",
};

export const CATEGORIES: Category[] = RAW.map((r) => r.category);

export const SKILLS: Skill[] = RAW.flatMap((r) =>
  r.skills.map((sk) => ({
    ...sk,
    status: sk.status ?? "todo",
    categoryId: r.category.id,
    icon: SKILL_ICONS[sk.slug],
  })),
);

export const SKILL_BY_SLUG: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((sk) => [sk.slug, sk]),
);

export const skillsByCategory = (categoryId: string): Skill[] =>
  SKILLS.filter((sk) => sk.categoryId === categoryId);

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);
