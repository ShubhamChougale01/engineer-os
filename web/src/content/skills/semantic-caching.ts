import type { SkillContent } from "../types";

/**
 * Semantic Caching — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const semanticCaching: SkillContent = {
  overview: `
Semantic caching is a technique for reusing LLM responses across queries that mean the same thing, even when their exact wording differs. A traditional cache keyed on a hash of the input string treats "What's the capital of France?" and "France's capital city?" as two completely unrelated requests. A semantic cache treats them as the same request, because it compares meaning (via embeddings and vector similarity) instead of comparing bytes.

For an AI engineer, this matters because LLM calls are the most expensive and slowest part of most production pipelines. Real user traffic is astonishingly repetitive in intent even when it's diverse in phrasing — support bots see the same handful of questions phrased a thousand different ways, RAG systems answer the same "what does clause 4.2 mean" question from many users, and internal tools get the same "how do I request PTO" question every week. Semantic caching is the technique that turns that repetition into free (or near-free) cache hits instead of paying full inference cost and latency every single time.

Key characteristics: it sits in front of (or alongside) the LLM call as a lookup layer; it depends on an **embedding model** to turn text into vectors, a **vector search** index (or a vector-capable store like FAISS, Pinecone, Redis, or Qdrant) to find near neighbors, and a similarity threshold to decide what counts as "close enough" to be the same question. It is fundamentally probabilistic — unlike exact-match caching, a semantic cache can return a wrong answer with high confidence, which is why it belongs in the toolkit of **Context Engineering** (the broader discipline of managing what goes into the context window) as a cost/latency optimization that requires careful engineering judgment about where it is safe to use, not a free lunch that is always safe to bolt onto every LLM call.
`,

  history: `
Semantic caching isn't a single invention with one named inventor — it's the natural convergence of three older ideas: HTTP/CDN caching (cache by key, serve without recomputation), memoization (cache the result of a pure function call), and nearest-neighbor / similarity search (found in information retrieval since the 1970s). What's new is applying these ideas to LLM calls specifically, where a "cache key" needs to represent meaning rather than an exact string, because natural-language queries are almost never repeated verbatim by different users.

| Year | Milestone |
|------|-----------|
| 1990s–2000s | Web caching (CDNs, HTTP ETags) and memoization become standard engineering tools — exact-match only |
| 2013–2018 | word2vec, GloVe, then contextual embeddings (ELMo, BERT) make "semantic similarity of text" a practical, computable quantity |
| 2019–2021 | Approximate Nearest Neighbor (ANN) libraries (FAISS from Meta AI, later HNSW-based stores) make embedding search fast at scale — originally built for search/recommendation, not LLM caching |
| 2022 | ChatGPT-driven explosion in LLM API traffic exposes cost and latency as first-class production problems for AI teams |
| 2023 | GPTCache (Zilliz) released — one of the first purpose-built open-source semantic caching libraries for LLM apps, pluggable with FAISS/Milvus/Redis as the vector backend |
| 2023 | Redis adds vector similarity search (via RediSearch / Redis Stack), making "Redis as a semantic cache" a mainstream pattern for teams already running Redis for exact-match caching |
| 2023–2024 | LangChain and LlamaIndex ship built-in semantic cache integrations (e.g. wrappers around GPTCache, Redis, and various vector stores), making semantic caching a checkbox rather than a from-scratch build |
| 2024–2025 | Momento and several vector-database vendors (Pinecone, Qdrant, Weaviate) publish reference architectures and managed offerings positioning their stores explicitly as "semantic cache" backends, not just RAG backends |

The throughline: semantic caching became necessary only once LLM inference became expensive and slow enough, and embeddings became cheap and fast enough, that "embed the query and look up a neighbor" started costing less than "just call the model." That crossover point is what created this as a distinct skill rather than a footnote inside caching generally.
`,

  "why-it-exists": `
Before semantic caching, teams building LLM applications had exactly two caching options, and both were unsatisfying:

1. **No caching at all** — every request, including exact duplicates and near-duplicates, pays full model latency (hundreds of milliseconds to several seconds) and full token cost. Fine for a demo; ruinous at scale for a support bot answering the same 50 questions all day.
2. **Exact-match caching** — hash the prompt string (or a normalized version of it) and look up a dictionary or Redis key. This catches genuinely identical requests (same user double-clicking "Submit", a retried request after a timeout) but misses the overwhelming majority of real-world repetition, because humans never phrase the same question the same way twice. "What's the capital of France?", "France's capital city?", and "capital of france" are three different cache keys under exact match, and three separate full-price LLM calls, despite being the same question a well-informed 8-year-old could answer once and reuse.

Semantic caching exists to close that gap. It generalizes "same request" from "same bytes" to "same meaning," using the same embedding technology that already exists on most AI teams' shelves for **Embeddings**-based **Vector Search** and RAG. The insight was: if you can already embed a document and find its nearest neighbors for retrieval, you can embed a *query* and find its nearest neighbor among *past queries* — and if that neighbor is close enough, its cached answer is very likely the right answer for the new query too, at a tiny fraction of the cost of an LLM call.
`,

  "problem-it-solves": `
Semantic caching removes concrete, measurable pains:

- **Redundant inference cost.** If 30% of your support-bot traffic is semantically duplicate questions, exact-match caching might catch 2-3% of it (typos and phrasing kill hash matches), while semantic caching can realistically catch a large share of that 30%, cutting token spend proportionally. See the **Cost Optimization** skill for the broader cost picture this plugs into.
- **Redundant latency.** A cache hit returns in single-digit-to-low-double-digit milliseconds (an embedding call plus a vector lookup) versus hundreds of milliseconds to seconds for a full generation, especially for longer responses or slower models. See the **Latency** skill.
- **Load on rate-limited APIs.** Every cache hit is a request that never touches your token-per-minute or requests-per-minute quota with the model provider, which matters when you're bursting near provider limits.
- **Inconsistent answers to the same underlying question.** Somewhat perversely, a semantic cache can *improve* consistency: if "what's your refund policy" is answered slightly differently every time an LLM is sampled fresh, a cache pins one accepted answer and serves it uniformly (this cuts both ways — see Security and Staleness below).

What semantic caching deliberately does **not** solve:

- It does not solve the problem of the underlying answer being wrong — a wrong answer, once cached, gets served to everyone who asks a similar-enough question, faster.
- It is not a substitute for **AI Evals** or answer quality checks; a cache only ever reflects the quality of whatever response first got stored in it.
- It is not appropriate for personalized, time-sensitive, or creative responses (a "write me a poem" or "what's my account balance" query should almost never be served from a semantic cache — see Where It's Dangerous, below, and the Advanced Concepts section).
- It does not replace prompt-level or KV-cache optimizations (see the **Context Engineering** skill) — those reduce the cost of a *given* LLM call; semantic caching avoids making the call at all.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, precisely, why exact-match caching fails on natural-language queries and what "semantic" means in this context.
2. Describe the full semantic cache lookup pipeline: embed → similarity search → threshold decision → hit/miss → (on miss) generate → store.
3. Choose an embedding model and a vector store for a semantic cache with an explicit tradeoff rationale (latency, cost, dimensionality, recall).
4. Tune a similarity threshold deliberately, understanding the false-positive (wrong answer served) vs false-negative (cache miss when a hit was possible) tradeoff.
5. Design a tiered cache (exact match first, semantic fallback second, LLM call last) and justify the ordering.
6. Identify staleness risk in a cached answer and implement at least one invalidation strategy (TTL, event-driven, versioning).
7. Distinguish workloads where semantic caching helps (RAG Q&A over static knowledge, support bots, FAQ-heavy traffic) from workloads where it is dangerous (personalized data, real-time facts, creative generation).
8. Instrument a semantic cache to measure hit rate, and connect hit rate to concrete cost and latency savings.
9. Recognize the security and correctness risks of serving a cached response to an adversarial or subtly different query, and describe at least one mitigation.
10. Evaluate cache quality as a first-class part of an evals pipeline, not an afterthought.
`,

  prerequisites: `
- **Required**: a working understanding of what an embedding is (a vector representation of text) and what cosine similarity measures. If these are new to you, read the **Embeddings** skill first — this page assumes you know what "embed a string" means and won't re-derive it.
- **Required**: basic familiarity with vector search / nearest-neighbor lookup. See the **Vector Search** skill for ANN algorithms (HNSW, IVF) and index tradeoffs — this page uses those concepts without re-teaching them.
- **Helpful**: hands-on exposure to at least one vector store — **FAISS** (library, self-hosted, no server), **Pinecone** or **Qdrant** (managed/self-hosted vector databases), or **Redis** with vector search enabled. This page references all four as backend options.
- **Helpful**: basic familiarity with how LLM API calls are billed (tokens in, tokens out) — see the **Cost Optimization** skill — so the ROI arguments in this page land concretely rather than abstractly.
- **Helpful but not required**: prior exposure to RAG (Retrieval-Augmented Generation), since the most common production home for semantic caching is a RAG Q&A system.

Dependency chain: **Embeddings** → **Vector Search** → this page → informs **Cost Optimization**, **Latency**, and connects to **AI Evals** and **AI Red Teaming** for correctness and safety.
`,

  "beginner-concepts": `
### The core idea, with no jargon

A cache is a place you store an answer so you don't have to recompute it. A semantic cache stores LLM answers keyed not by the literal question text, but by the *meaning* of the question, so a differently-worded question that means the same thing can still find the stored answer.

### Why exact-match caching isn't enough

~~~python
# A naive exact-match cache: a dictionary keyed on the literal prompt string
cache: dict[str, str] = {}

def ask_naive(question: str, llm_call) -> str:
    if question in cache:
        return cache[question]          # only hits on BYTE-IDENTICAL text
    answer = llm_call(question)
    cache[question] = answer
    return answer

# These are the same question to a human, but three separate cache entries:
ask_naive("What's the capital of France?", llm_call)
ask_naive("France's capital city?", llm_call)          # MISS -- full LLM call again
ask_naive("what is the capital of france", llm_call)   # MISS -- full LLM call again
~~~

Even lightly normalizing (lowercasing, stripping punctuation) only catches trivial variation. It will never catch genuine paraphrase, word reordering, or synonyms — that requires understanding meaning, which is exactly what an embedding model provides.

### The minimal semantic cache

~~~python
import numpy as np

# Pretend embed_text() calls an embedding model and returns a vector.
# In production this is a real API call -- see the Embeddings skill.
def embed_text(text: str) -> np.ndarray:
    ...

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    # Cosine similarity: 1.0 = identical direction (same meaning),
    # 0.0 = unrelated, -1.0 = opposite. Values near 1.0 mean "very similar".
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

class TinySemanticCache:
    """The whole idea in ~15 lines -- not production-ready, but this IS the mechanism."""
    def __init__(self, threshold: float = 0.92):
        self.entries: list[tuple[np.ndarray, str, str]] = []  # (embedding, question, answer)
        self.threshold = threshold

    def get(self, question: str) -> str | None:
        query_vec = embed_text(question)
        best_score, best_answer = 0.0, None
        for vec, _stored_question, answer in self.entries:
            score = cosine_similarity(query_vec, vec)
            if score > best_score:
                best_score, best_answer = score, answer
        # Only return the cached answer if it's confidently close enough --
        # this threshold is the single most important tuning knob in the whole skill.
        if best_score >= self.threshold:
            return best_answer
        return None

    def put(self, question: str, answer: str) -> None:
        self.entries.append((embed_text(question), question, answer))
~~~

This linear scan over every entry is fine for a few hundred cached questions and is exactly how a first prototype should look. It stops working once you have thousands of entries, which is where a real vector index (FAISS, Pinecone, Qdrant, Redis) takes over — see Intermediate Concepts.

### The one number that matters: the threshold

The threshold (0.92 above) decides whether a candidate match counts as a "hit." Set it too low (e.g. 0.7) and unrelated questions start matching each other, returning wrong answers confidently. Set it too high (e.g. 0.99) and only near-identical text matches, and you've rebuilt exact-match caching with extra steps and extra cost. Threshold tuning is covered in depth in Intermediate and Advanced Concepts — treat any semantic cache you build without deliberately tuning this number as a liability, not a feature.
`,

  "intermediate-concepts": `
### Replacing the linear scan with a real vector index

At meaningful scale (thousands to millions of cached Q&A pairs), a linear scan over every stored embedding is too slow. This is exactly the problem the **Vector Search** skill covers in depth: approximate nearest neighbor (ANN) indexes like HNSW give you sub-linear lookup time at the cost of a small, tunable chance of missing the true nearest neighbor.

~~~python
# Using FAISS as the semantic cache's vector index -- see the FAISS skill for index internals.
import faiss
import numpy as np

class FaissSemanticCache:
    def __init__(self, dim: int, threshold: float = 0.92):
        # IndexFlatIP = exact inner-product search; for real scale swap in
        # an HNSW or IVF index (faiss.IndexHNSWFlat) for approximate, faster search.
        self.index = faiss.IndexFlatIP(dim)
        self.answers: list[str] = []
        self.threshold = threshold

    def _normalize(self, vec: np.ndarray) -> np.ndarray:
        # Inner product on L2-normalized vectors == cosine similarity.
        # Skipping normalization is a common bug that silently breaks thresholds.
        return vec / (np.linalg.norm(vec) + 1e-10)

    def get(self, query_vec: np.ndarray) -> str | None:
        if self.index.ntotal == 0:
            return None
        q = self._normalize(query_vec).reshape(1, -1).astype("float32")
        scores, idxs = self.index.search(q, k=1)   # k=1: nearest neighbor only
        best_score, best_idx = float(scores[0][0]), int(idxs[0][0])
        if best_score >= self.threshold:
            return self.answers[best_idx]
        return None

    def put(self, vec: np.ndarray, answer: str) -> None:
        v = self._normalize(vec).reshape(1, -1).astype("float32")
        self.index.add(v)
        self.answers.append(answer)
~~~

Production note: FAISS's in-process index has no built-in persistence, TTL, or eviction — you must serialize the index yourself (faiss.write_index) and handle expiry in your own metadata layer. That's the tradeoff for its speed and zero-server-cost simplicity; managed stores like Pinecone or Qdrant give you persistence and metadata filtering out of the box at higher operational cost.

### Tiered caching: exact match first, semantic fallback second

The single highest-leverage production pattern. Exact match is cheap (a hash lookup, no embedding call needed) and has zero false-positive risk; semantic match is more expensive (an embedding call) and carries a small correctness risk. Check cheap-and-safe before expensive-and-risky:

~~~python
import hashlib

def normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())

def ask_tiered(question: str, exact_cache: dict, semantic_cache, llm_call, embed_text) -> str:
    key = hashlib.sha256(normalize(question).encode()).hexdigest()

    # Tier 1: exact match -- free, zero embedding calls, zero false-positive risk
    if key in exact_cache:
        return exact_cache[key]

    # Tier 2: semantic match -- one embedding call, small similarity-threshold risk
    query_vec = embed_text(question)
    semantic_hit = semantic_cache.get(query_vec)
    if semantic_hit is not None:
        exact_cache[key] = semantic_hit   # backfill tier 1 for next identical retry
        return semantic_hit

    # Tier 3: miss -- pay for the real LLM call
    answer = llm_call(question)
    exact_cache[key] = answer
    semantic_cache.put(query_vec, answer)
    return answer
~~~

### TTL and eviction

Cached answers go stale. Two independent knobs:

- **TTL (time-to-live)**: expire an entry after N minutes/hours/days regardless of use. Essential whenever the underlying knowledge changes (prices, policies, document versions).
- **Eviction policy**: when the cache is full, what gets removed? LRU (least recently used) is the default for general-purpose caches; for a semantic cache serving support questions, an LFU (least frequently used) policy often fits better, since the value of caching is concentrated in a small set of very frequently asked questions.

~~~python
import time

class TTLEntry:
    def __init__(self, answer: str, ttl_seconds: float):
        self.answer = answer
        self.expires_at = time.monotonic() + ttl_seconds   # monotonic: immune to clock changes

    def is_expired(self) -> bool:
        return time.monotonic() >= self.expires_at
~~~

### Choosing an embedding model for caching, specifically

The embedding model doesn't need to be the biggest or most accurate one available — it needs to be **fast, cheap, and consistent**, because you call it on every incoming query (a cache miss cost you already pay for anyway, but a cache lookup should never become the bottleneck). Smaller embedding models (or a distilled/quantized variant) are often the right choice here even if you use a larger, higher-quality embedding model elsewhere in your RAG pipeline — see the **Embeddings** skill for model selection tradeoffs.
`,

  "advanced-concepts": `
### The threshold is a decision boundary, not a constant

Treating the similarity threshold as one fixed number for an entire application is the beginner mistake; the senior version tunes it per query class, and sometimes per query, because different domains carry very different costs for a false-positive hit:

| Query class | Risk of a wrong cached answer | Threshold posture |
|---|---|---|
| "What are your business hours?" | Low — stable fact, low consequence if briefly stale | Loose threshold (e.g. 0.85-0.90), aggressive caching |
| "What's the price of plan X?" | Medium — changes occasionally, user-visible if wrong | Medium threshold + short TTL |
| "What's my account balance?" | Severe — personalized, must never be shared across users | Do not semantically cache at all; scope any cache strictly per-user, or skip caching entirely |
| "Write me a poem about my dog" | N/A — creative, intentionally non-deterministic | Do not cache; caching defeats the purpose of generation |
| Medical/legal/safety-critical answers | Severe — wrong answer has real-world harm | Require human-reviewed cache entries only, or disable semantic caching in favor of always-fresh generation |

### Why cosine similarity is not "meaning equality"

Embeddings cluster text by topical and lexical similarity, not by logical equivalence. "What's the capital of France?" and "What was the former capital of France?" (Paris was not always the answer in every historical period, but more importantly the two questions ask genuinely different things) can embed very close together, because the surface form is nearly identical, even though the correct answers differ. This is the core failure mode of semantic caching: **similarity of phrasing is being used as a proxy for similarity of intent, and the proxy is imperfect.** Negation is the sharpest version of this problem — "Is X covered by the warranty?" and "Is X NOT covered by the warranty?" embed close together under most general-purpose embedding models despite having opposite correct answers. Any production semantic cache over a domain with negation-heavy or conditional questions needs either a higher threshold, an explicit negation check, or a secondary verification step before serving a cached hit.

### Cache poisoning and adversarial queries

Because a semantic cache accepts *any* incoming query as a potential match against stored entries, an attacker (or just an unlucky user) can craft a query that embeds close enough to a sensitive cached answer to extract it, or close enough to an intentionally wrong answer to get it served to legitimate users if that wrong answer was ever cached. This overlaps directly with **AI Red Teaming** and **Prompt Injection Defense**: a cache is an attack surface, not just an optimization. Concretely: if a jailbreak attempt or prompt-injection payload ever produces a harmful response that gets cached, a semantically similar (but superficially different) follow-up attempt from another user could retrieve that cached harmful response directly, skipping any guardrails that would have re-triggered on a fresh LLM call. Mitigation: run safety/moderation checks on the response *before* writing to cache (not just before returning the original response), and re-validate on read for high-risk categories rather than trusting a historical write blindly.

### Embedding drift and index staleness

If you ever change your embedding model (a new version, a different provider, a fine-tuned model), previously stored embeddings are **not comparable** to newly generated ones — cosine similarity between vectors from two different embedding models is meaningless. This forces a full cache invalidation and re-embedding of any retained Q&A pairs whenever the embedding model changes, which is easy to forget in a system with a long-lived cache and an evolving embedding pipeline.

### Combining semantic caching with response-level determinism

Because most production LLM calls sample with some temperature, "the same question" doesn't even deterministically map to "the same answer" from the LLM itself — caching implicitly imposes determinism on an otherwise non-deterministic system. This is desirable for factual Q&A (one canonical answer, consistently served) and undesirable for anything where response diversity is the point. Decide, explicitly, whether your product wants "consistent" or "fresh each time," because a semantic cache always pushes toward "consistent."

### Multi-tenant isolation

In a multi-tenant SaaS product, a naive shared semantic cache can leak: Tenant A's cached answer, built from Tenant A's private documents in a RAG pipeline, can be served to Tenant B if their queries embed similarly. Cache keys (or a metadata filter in the vector store, supported by Pinecone/Qdrant namespaces or Redis key prefixes) must include a tenant/user scope wherever the underlying answer is not genuinely global knowledge.
`,

  "internal-working": `
Step by step, here is what happens on every incoming query in a semantic-cache-backed system:

~~~mermaid
flowchart TD
    A["Incoming query"] --> B["Normalize text\n(lowercase, trim, strip punctuation)"]
    B --> C{"Exact-match\ncache hit?"}
    C -- yes --> D["Return cached answer\n(fastest path, ~1ms)"]
    C -- no --> E["Embed query\n(embedding model call)"]
    E --> F["Vector similarity search\nagainst cached query embeddings\n(FAISS / Pinecone / Redis / Qdrant)"]
    F --> G{"Top match score\n>= threshold?"}
    G -- yes --> H["Return cached answer\n(fast path, ~10-50ms)"]
    G -- no --> I["Call the LLM\n(slow path, hundreds of ms to seconds)"]
    I --> J["Optional: safety/quality check\non the new response"]
    J --> K["Write embedding + answer\nto semantic cache, and hash to exact cache"]
    K --> L["Return generated answer"]
~~~

1. **Normalize.** Lowercase, trim whitespace, and often strip trailing punctuation before either caching tier touches the text — this makes the exact-match tier catch more trivial variation for free, before any embedding call is even needed.
2. **Exact-match check.** A hash lookup (dictionary, Redis GET) against previously seen normalized queries. Zero embedding cost, zero false-positive risk, and it is checked first precisely because it's the cheapest and safest possible hit.
3. **Embed the query.** Only on an exact-match miss does the system pay for an embedding call — one embedding call is far cheaper and faster than one full LLM generation, which is the entire economic basis of this technique.
4. **Vector similarity search.** The query embedding is compared against the store of previously cached query embeddings via an ANN or exact index (see the **Vector Search** skill for how HNSW/IVF indexes make this sub-linear at scale).
5. **Threshold decision.** The top result's similarity score is compared against a configured threshold. This is the single decision point where correctness risk is introduced — everything upstream is close to risk-free.
6. **Hit path.** Return the stored answer directly, no LLM call at all.
7. **Miss path.** Call the LLM as normal, optionally run a safety/quality check on the fresh response, then write both the new query's embedding and its answer into the semantic cache (and its hash into the exact-match tier) so the next similar query hits.

The order of steps 2 and 3-5 (cheap-and-safe before expensive-and-risky) is the architectural decision that makes tiered caching work, and is worth internalizing as the default shape for this entire skill.
`,

  architecture: `
Semantic caching is usually a thin, largely stateless service layer sitting between your application logic and your LLM provider, backed by two stateful stores: an exact-match key-value store and a vector index.

### Component architecture

~~~mermaid
flowchart TB
    subgraph App["Application layer"]
        Handler["Request handler / RAG orchestrator"]
    end
    subgraph CacheLayer["Semantic Cache Layer"]
        Norm["Normalizer"]
        Exact["Exact-match store\n(Redis / in-memory dict)"]
        Embed["Embedding client"]
        VecSearch["Vector similarity search\n(FAISS / Pinecone / Redis / Qdrant)"]
        Threshold["Threshold policy\n(per query-class rules)"]
    end
    subgraph Backends["Backends"]
        LLM["LLM API"]
        Safety["Moderation / safety check"]
    end
    Handler --> Norm --> Exact
    Exact -- miss --> Embed --> VecSearch --> Threshold
    Threshold -- hit --> Handler
    Threshold -- miss --> LLM --> Safety --> CacheLayer
    Exact -- hit --> Handler
~~~

### Where this lives in a real application

Most teams implement the cache layer as a small internal library or sidecar service, not a hand-rolled check inside every call site — every LLM call in the codebase should route through one shared cache-aware client, so threshold policy and invalidation logic live in exactly one place:

~~~
myservice/
├── src/myservice/
│   ├── llm/
│   │   ├── client.py            # thin wrapper: cache-aware LLM calls, THE only place llm_call() is invoked directly
│   │   ├── cache/
│   │   │   ├── exact_store.py   # Redis/dict-backed exact-match tier
│   │   │   ├── semantic_store.py # FAISS/Pinecone/Qdrant-backed tier
│   │   │   ├── policy.py        # per-query-class thresholds, TTLs
│   │   │   └── invalidation.py  # TTL sweep, event-driven purge hooks
│   │   └── safety.py            # moderation check before cache writes
│   └── rag/                     # retrieval + generation orchestration, calls llm.client
└── tests/
~~~

Rules: no code path calls the raw LLM SDK directly except the cache-aware client — this guarantees every request benefits from the cache and every cache-write goes through the same safety check. The policy module is where domain knowledge (which query classes should never be cached, what threshold to use where) is centralized and reviewable, rather than scattered as magic numbers across call sites.
`,

  "data-flow": `
Trace a single support-bot question end to end, from the moment a user submits it to the moment they see a response:

~~~mermaid
sequenceDiagram
    participant User
    participant API as App API
    participant Cache as Cache Layer
    participant Emb as Embedding Model
    participant Vec as Vector Store
    participant LLM as LLM Provider

    User->>API: "What's your return policy?"
    API->>Cache: lookup(question)
    Cache->>Cache: normalize + hash, check exact-match store
    Note over Cache: exact-match miss (never seen this exact phrasing)
    Cache->>Emb: embed(question)
    Emb-->>Cache: query_vector
    Cache->>Vec: search(query_vector, k=1)
    Vec-->>Cache: (score=0.94, stored_answer)
    Note over Cache: 0.94 >= threshold (0.90) -> HIT
    Cache-->>API: cached answer
    API-->>User: response in ~30ms, zero LLM tokens spent

    Note over User,LLM: --- A genuinely new question, hours later ---
    User->>API: "Do you accept returns after 60 days?"
    API->>Cache: lookup(question)
    Cache->>Cache: exact-match miss
    Cache->>Emb: embed(question)
    Emb-->>Cache: query_vector_2
    Cache->>Vec: search(query_vector_2, k=1)
    Vec-->>Cache: (score=0.71, some_answer)
    Note over Cache: 0.71 < threshold (0.90) -> MISS
    Cache->>LLM: generate(question, context)
    LLM-->>Cache: fresh answer
    Cache->>Cache: safety-check, then write to exact + semantic stores
    Cache-->>API: fresh answer
    API-->>User: response in ~800ms, full LLM cost paid once
~~~

The critical thing this trace makes visible: the cost and latency of the *first* time a question (or its semantic neighborhood) is asked is unavoidable — the win comes entirely from every *subsequent* similar question after that, which is why hit rate over time, not any single request, is the metric that matters (see Monitoring).
`,

  "production-usage": `
### Where it actually gets deployed

The overwhelmingly common production home for semantic caching is in front of a RAG Q&A system or a customer-support chatbot — high-repeat-query, relatively static-knowledge workloads where the same handful of intents recur constantly. It is far less common (and often actively wrong) to put a semantic cache in front of a general-purpose chat assistant, code generation tool, or anything producing personalized or creative output.

### Tooling landscape

- **GPTCache** (Zilliz) — a purpose-built open-source library specifically for LLM semantic caching; pluggable embedding backends and pluggable vector stores (FAISS, Milvus, and others), with built-in similarity evaluation strategies. The most direct "semantic caching as a library" option.
- **Redis with vector search** (RediSearch / Redis Stack) — many teams already run Redis for exact-match caching, sessions, and rate limiting; adding a vector index to the same Redis deployment lets one operational system serve both caching tiers. Attractive when Redis is already part of the stack; less attractive as a from-scratch choice purely for vector search, where a dedicated vector database may have better ANN performance at large scale.
- **LangChain / LangGraph cache integrations** — LangChain ships cache abstractions that can wrap GPTCache, Redis, or a custom vector-store-backed cache, letting teams already using LangChain's LLM wrappers add semantic caching with a few lines of configuration rather than a custom pipeline.
- **Momento** — a managed serverless cache platform that has published semantic-caching-oriented offerings; the appeal is avoiding operating your own Redis/vector infra, at the cost of vendor lock-in and less control over ANN algorithm choice.
- **Dedicated vector databases** (Pinecone, Qdrant, Weaviate) — usable as the semantic tier's backend even though they're primarily marketed for RAG retrieval; the same index that finds relevant documents can find relevant cached queries, often with metadata filtering (useful for multi-tenant isolation and query-class-specific thresholds).

I'm not confident about exact current pricing, specific version numbers, or which of these tools has the fastest ANN implementation this month — that landscape moves quickly; verify current benchmarks and pricing directly with each vendor before committing.

### Typical configuration a team lands on

- Embedding model: a small, fast, cheap model dedicated to the cache lookup (does not need to match whatever embedding model powers your primary RAG retrieval).
- Threshold: usually tuned empirically against a labeled set of "should this pair have matched" examples (see Testing), starting conservative (high threshold, few false-positive hits) and loosening gradually as confidence grows.
- TTL: hours to a few days for support/FAQ content, matched to how often the underlying knowledge base actually changes.
- Exact-match tier: nearly always present as tier 1, implemented as a plain Redis GET/SET or in-process dict for single-instance deployments.
`,

  "industry-examples": `
- **Customer support platforms** (the broad category including Intercom-, Zendesk-, and Salesforce-style AI support tooling): semantic caching over FAQ-style questions is one of the most commonly cited production use cases in vendor engineering blogs and conference talks, because support traffic is exactly the "same handful of intents, endless phrasings" shape this technique targets.
- **Zilliz** (maintainers of GPTCache and the Milvus vector database): builds and publishes semantic caching as a first-class recommended pattern for teams using Milvus/Zilliz Cloud for RAG, explicitly positioning it as a cost/latency layer on top of retrieval infrastructure they already sell.
- **Redis** (the company, via Redis Stack / RediSearch): markets vector similarity search explicitly for "LLM semantic caching" use cases in its documentation and blog content, aimed at teams that already run Redis and want to add this capability without new infrastructure.
- **Internal-tools and documentation-Q&A bots** at many mid-size and large tech companies (a very common internal build, less often publicly named): "ask this bot about our internal wiki/policies" tools are a textbook fit — highly repetitive queries, relatively static source documents, low tolerance for the cost of full LLM calls on every Slack message.
- **E-commerce product-question bots**: "does this ship internationally," "what's the return window," "is this compatible with X" are asked constantly in slightly different phrasings across a large customer base, making them a natural semantic-caching target for cost control at scale.

I don't have verified, specific, attributable production metrics (e.g. "Company X cut costs by Y%") for named companies beyond what's in vendor marketing content, and I'd rather say that honestly than invent a number — treat any specific percentage you see quoted elsewhere as a claim to verify against the source, not a fact to repeat.
`,

  "best-practices": `
1. **Always build the exact-match tier first, semantic tier second.** It's cheaper, safer, and catches a meaningful share of repetition on its own with zero risk of a wrong answer.
2. **Scope threshold policy by query class, not globally.** A single global threshold is a beginner setup; production systems tune thresholds per domain of question, tightest where a wrong answer is most costly.
3. **Never cache personalized or account-specific responses across users.** If caching is used at all for such queries, scope the cache key/namespace strictly per-user.
4. **Run safety/moderation checks before writing to cache, not only before returning to the user.** A cache write persists a response far beyond the single request it originated from.
5. **Set a TTL on every cache entry, even a generous one.** An un-expiring cache is a slow-motion staleness bug waiting to surface the moment underlying data changes.
6. **Re-embed and fully invalidate the cache whenever the embedding model changes.** Cosine similarity across embeddings from different models is meaningless; mixing them silently corrupts the cache.
7. **Instrument hit rate, miss rate, and near-miss rate (queries just under threshold) from day one.** You cannot tune a threshold you aren't measuring against.
8. **Prefer a smaller, faster, cheaper embedding model for the cache lookup than for primary RAG retrieval**, since it runs on every single incoming query, including ones that ultimately miss.
9. **Log which cache entry served a hit alongside the served response**, so a bad cached answer can be traced back to its origin and purged, not just silently repeated forever.
10. **Treat cache correctness as part of your evals suite** (see **AI Evals**), not a separate concern — a semantic cache changes what response a user actually receives, so it belongs in the same quality bar as the model itself.
11. **Isolate cache namespaces per tenant in multi-tenant systems**, using metadata filters or key prefixes supported by your vector store (Pinecone namespaces, Qdrant collections/filters, Redis key prefixes).
12. **Provide a manual purge/invalidate path for operators**, not just automatic TTL expiry — when a wrong cached answer is discovered, someone needs to be able to remove it immediately, not wait out the TTL.
`,

  "anti-patterns": `
### Caching everything indiscriminately

~~~python
# WRONG: every LLM call goes through the semantic cache, no exceptions
def ask(question: str) -> str:
    return semantic_cache_or_llm(question)   # even for "what's my order status?"

# RIGHT: explicitly route personalized/creative/time-sensitive queries around the cache
def ask(question: str, query_class: str) -> str:
    if query_class in {"personalized", "creative", "time_sensitive"}:
        return llm_call(question)             # always fresh, never cached
    return semantic_cache_or_llm(question)     # safe to cache: static FAQ-style knowledge
~~~

Not every query belongs in a semantic cache. Caching a "what's my account balance" query is not a performance bug waiting to happen — it's a correctness and privacy bug from the first request.

### One global threshold for every domain

~~~python
# WRONG: same threshold whether the topic is "store hours" or "medical dosage"
THRESHOLD = 0.85

# RIGHT: threshold is a policy decision per query class, reviewed like any other business rule
THRESHOLDS = {
    "store_hours": 0.85,       # low stakes if occasionally wrong
    "pricing": 0.92,           # medium stakes, changes sometimes
    "medical_or_legal": 1.01,  # effectively "never serve from cache" -- impossible score, forces miss
}
~~~

### Writing to cache before checking response safety

~~~python
# WRONG: cache the LLM's raw output immediately, safety check happens only on the way out
answer = llm_call(question)
semantic_cache.put(question, answer)   # a harmful/wrong response is now PERSISTED
return moderate(answer)

# RIGHT: moderate first, only persist what's safe to serve to future users
answer = llm_call(question)
safe_answer = moderate(answer)
if is_safe(safe_answer):
    semantic_cache.put(question, safe_answer)
return safe_answer
~~~

### Ignoring embedding-model version drift

~~~python
# WRONG: swap the embedding model, keep the old cached vectors as-is
# -- similarity scores against them are now meaningless numbers, not similarities

# RIGHT: version the cache by embedding model, and invalidate on model change
cache_key_prefix = f"embed_model_v{EMBEDDING_MODEL_VERSION}"
~~~

### No monitoring of near-misses

Teams that only log hit/miss, without also logging the *score* of near-misses (queries that scored just under threshold), have no data to tune the threshold with later — they can only guess. Log the score on every lookup, hit or miss.
`,

  performance: `
### Measure first

~~~python
import time

def timed_lookup(cache, query_vec) -> tuple[str | None, float]:
    start = time.perf_counter()
    result = cache.get(query_vec)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return result, elapsed_ms

# In production, emit this as a histogram metric (see Monitoring), split by
# hit vs miss, so you can see the ACTUAL latency win, not an assumed one.
~~~

Never assume the cache is faster — measure the embedding-call + vector-search latency against the LLM-call latency it's replacing, for your actual models and actual store, under actual load.

### The optimization hierarchy for a semantic cache

1. **Tiered lookup first**: exact match before semantic match, always. This alone often removes the majority of embedding calls for genuinely repeated traffic.
2. **A small, fast embedding model for the lookup path.** The cache-lookup embedding call runs on every request including misses — it must be fast enough that even a miss doesn't meaningfully slow down the overall request.
3. **An ANN index, not exact search, once past a few thousand entries.** Exact k-NN search over a large cache degrades linearly; HNSW-style indexes (see **Vector Search**, **FAISS**) keep lookup near-constant as the cache grows.
4. **Batch embedding calls where possible** (e.g. backfilling a cache from historical logs) rather than one-at-a-time, to amortize API round-trip overhead.
5. **Co-locate the vector store with the application** (same region/data center) — network round-trip to a distant vector database can dwarf the actual search time for a cache that's supposed to be a fast path.
6. **Cache the embedding of the query itself for the duration of a single request** if multiple cache tiers or fallback checks need it, rather than re-embedding the same text twice.

### Concrete order-of-magnitude expectations

An LLM generation call typically costs hundreds of milliseconds to several seconds depending on model and output length. An embedding call for a short query is typically tens of milliseconds. A vector search against a well-indexed store of thousands to low millions of entries is typically single-digit to low-double-digit milliseconds. An exact-match hash lookup is sub-millisecond. These are rough, order-of-magnitude figures to reason with, not benchmarks to cite verbatim — always measure against your specific models, stores, and network topology.
`,

  scalability: `
Semantic caching scales in two independent dimensions: the traffic volume hitting the cache, and the number of stored entries the cache has to search against.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> App1["App instance 1"]
    LB --> App2["App instance N"]
    App1 & App2 --> ExactShared[("Shared exact-match store\n(Redis cluster)")]
    App1 & App2 --> VecShared[("Shared vector store\n(Pinecone/Qdrant/Redis, replicated)")]
    App1 & App2 -->|miss| LLM["LLM provider"]
~~~

### Traffic volume

The cache layer itself should be stateless at the application-instance level, with the actual state (exact-match entries, vector index) living in a shared store every instance can reach — otherwise each app instance builds its own disjoint cache and hit rate collapses as traffic is load-balanced across instances. This mirrors the standard "stateless services + shared state store" pattern from general web-service scalability.

### Entry-count growth

As the number of cached Q&A pairs grows into the hundreds of thousands or millions, an exact/linear vector search (fine at prototype scale) becomes a bottleneck; this is precisely the problem ANN indexes (HNSW, IVF) solve, at the cost of small, tunable recall loss — see **Vector Search** for the algorithmic tradeoffs.

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| Vector search slows as entries grow | ANN index (HNSW) instead of exact search; shard the index if a single node's memory is exceeded |
| Each app instance has its own disjoint cache | Move to a shared, centrally-reachable store (managed vector DB, or a Redis cluster) instead of an in-process index per instance |
| Embedding calls become the bottleneck under high QPS | Batch embedding requests where request patterns allow; consider a smaller/faster embedding model dedicated to the cache path |
| Vector store becomes a single point of failure | Replicate the store (most managed vector DBs and Redis clusters support this natively); have a documented fallback of "cache unreachable -> skip straight to LLM" rather than failing the whole request |
| Unbounded cache growth exhausts memory/storage | TTL-based expiry plus an eviction policy (LRU or LFU) sized to your actual working set of frequent questions |

### The graceful-degradation principle

A semantic cache should never be a hard dependency for correctness — if the vector store or embedding service is briefly unavailable, the system should fall back to calling the LLM directly (slower and more expensive, but still correct) rather than failing the request outright. Treat the cache as a performance optimization with a documented failure mode, not a critical-path dependency.
`,

  security: `
### The cache as a distinct attack surface

A semantic cache introduces risks beyond the underlying LLM call, because it accepts arbitrary incoming text and matches it against a persisted store of prior responses — see **AI Red Teaming** for the broader practice of probing these systems.

1. **Cache poisoning via prompt injection.** If an attacker can get a harmful, incorrect, or manipulated response generated once (via a jailbreak or **Prompt Injection Defense**-relevant attack) and that response gets cached, subsequent semantically similar queries from *other, legitimate* users can retrieve the poisoned response directly — potentially bypassing safety checks that only run on the original generation path. Mitigation: run moderation/safety checks specifically on the path that writes to cache, and treat any cache write as equivalent in risk to a fresh, unreviewed model output because that's exactly what it is.
2. **Cross-tenant / cross-user data leakage.** In a multi-tenant system, if cache entries aren't scoped by tenant or user, a query from Tenant B can retrieve a cached answer that was generated using Tenant A's private context (documents, account data). This is a data-isolation bug, not merely a quality bug, and should be treated with the same seriousness as a database query missing a tenant filter.
3. **Query-similarity probing for extraction.** An attacker who suspects sensitive information is cached (e.g. a previously answered question containing PII or confidential context) could iteratively craft semantically similar queries to try to surface it, especially if the cache has no access control of its own and only inherits whatever the application layer enforces.
4. **Serving stale-but-confident wrong answers.** Not a classic "security" issue in the traditional sense, but a trust and safety issue: an out-of-date cached answer served with full apparent confidence (no indication to the user that it's a cache hit from potentially outdated context) can cause real harm in domains like pricing, compliance, or safety guidance.

### Concrete defenses

- Run the same moderation/safety pipeline on cache-write paths as on live-response paths — never assume a cached answer is automatically safe just because it was safe once.
- Scope cache keys and vector-store namespaces per tenant/user wherever the underlying content isn't genuinely public knowledge.
- Set conservative thresholds and short TTLs for any domain with regulatory, medical, legal, or financial consequences — or exclude that domain from semantic caching entirely.
- Log which cached entry served every hit, so a discovered problem can be traced to its origin and purged, and so patterns of adversarial probing can be detected.
- Treat cache invalidation tooling (the ability for an operator to purge a bad entry immediately) as a required production capability, not an optional nice-to-have.

See the dedicated **AI Red Teaming** and **Prompt Injection Defense** skills for the broader adversarial-testing practice this connects to.
`,

  testing: `
Testing a semantic cache means testing a probabilistic matching system, which is a different discipline from testing deterministic code — you're validating a threshold and a policy, not just a function's return value.

~~~python
# tests/test_semantic_cache.py
import pytest
from myservice.llm.cache.semantic_store import SemanticCache

@pytest.fixture
def cache():
    # Use a small, fast, deterministic embedding stub in tests --
    # never hit a real embedding API in unit tests (slow, costs money, flaky).
    return SemanticCache(embed_fn=fake_embed, threshold=0.90)

def test_paraphrase_hits(cache):
    cache.put("What's the capital of France?", "Paris")
    # A genuine paraphrase SHOULD hit -- this is the whole point of the feature
    assert cache.get("France's capital city?") == "Paris"

def test_unrelated_question_misses(cache):
    cache.put("What's the capital of France?", "Paris")
    # A genuinely different question must NOT hit, even if topically adjacent
    assert cache.get("What's the population of France?") is None

def test_negation_does_not_falsely_hit(cache):
    cache.put("Is the warranty valid for water damage?", "Yes, covered.")
    # The classic failure mode: negated questions embed close to their originals
    # but have an OPPOSITE correct answer -- this must not silently pass.
    result = cache.get("Is the warranty NOT valid for water damage?")
    assert result is None or result != "Yes, covered."

def test_ttl_expiry(cache, monkeypatch):
    cache.put("store hours?", "9-5 Mon-Fri", ttl_seconds=1)
    monkeypatch.setattr("time.monotonic", lambda: cache._now() + 2)  # fast-forward
    assert cache.get("what are your hours?") is None  # expired, must miss
~~~

### The senior testing doctrine for semantic caches

- Build a labeled "should-match / should-not-match" dataset from real or representative queries specific to your domain — this is a small, targeted **AI Evals**-style dataset, not a generic test suite, and it's the only reliable way to tune a threshold with evidence instead of guesswork.
- Explicitly test known hard cases: negation, near-synonyms with different scope ("all returns" vs "returns within 30 days"), and personalized-looking queries that must never hit.
- Test the fallback path: what happens to correctness and latency when the vector store is unreachable — the system must still answer correctly (just slower), never fail the request.
- Re-run the labeled threshold-tuning dataset any time the embedding model changes; a threshold tuned for one embedding model is not guaranteed to transfer to another.
- Treat a wrong cache hit found in production as a bug to add to the regression dataset, not just an incident to close.
`,

  debugging: `
### The toolbox, in escalation order

1. **Log every lookup's top similarity score, not just hit/miss.** A miss with a score of 0.89 against a threshold of 0.90 tells you the threshold is nearly right; a miss at 0.40 tells you the query genuinely has no cached neighbor. Without the raw score, "why didn't this hit?" is unanswerable after the fact.

~~~python
import logging
logger = logging.getLogger("semantic_cache")

def get(self, question: str) -> str | None:
    query_vec = self.embed(question)
    score, answer = self._search(query_vec)
    logger.debug(
        "cache_lookup question=%r top_score=%.4f threshold=%.4f hit=%s",
        question, score, self.threshold, score >= self.threshold,
    )
    return answer if score >= self.threshold else None
~~~

2. **When a wrong answer was served from cache, trace it back to its origin.** Log the originating question/context at write time, alongside the answer, so "why did this get cached in the first place" is answerable, not just "what got served."
3. **Reproduce with the exact embedding model version.** If debugging a suspicious hit or miss, confirm which embedding model produced the stored vector versus the one producing the live query vector — a silent model-version mismatch (see Anti-Patterns) is one of the most common root causes of "the cache is behaving weirdly" reports.
4. **Visualize a cluster of confusing queries.** Dimensionality-reduce (e.g. with t-SNE or UMAP, offline, not in the hot path) a sample of embeddings for a domain that's producing bad hits, to see visually whether the embedding model is genuinely clustering semantically-distinct queries together (a model-choice problem) versus the threshold simply being mis-tuned (a policy problem).
5. **Check for the exact-match tier masking a semantic-tier bug.** If exact match is catching most traffic, a broken semantic tier can go unnoticed for a long time — periodically audit semantic-tier hit rate in isolation (see Monitoring) to make sure it isn't silently degraded to zero.
6. **When debugging "the cache never hits," check normalization first.** Trailing whitespace, inconsistent casing, or unstripped punctuation reaching the embedding call can subtly shift embeddings enough to miss a threshold that would otherwise be crossed — always log the exact normalized string that was embedded.
`,

  monitoring: `
### The metrics that matter

~~~python
from prometheus_client import Counter, Histogram

CACHE_LOOKUPS = Counter(
    "semantic_cache_lookups_total", "Cache lookups", ["tier", "result"]
)  # tier: exact|semantic, result: hit|miss

CACHE_SCORE = Histogram(
    "semantic_cache_top_score", "Top similarity score per semantic lookup",
    buckets=[0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99, 1.0],
)

LLM_CALLS_AVOIDED = Counter(
    "llm_calls_avoided_total", "LLM calls skipped due to cache hits"
)

def get(self, question: str) -> str | None:
    # ... exact-match check ...
    score, answer = self._semantic_search(question)
    CACHE_SCORE.observe(score)
    hit = score >= self.threshold
    CACHE_LOOKUPS.labels(tier="semantic", result="hit" if hit else "miss").inc()
    if hit:
        LLM_CALLS_AVOIDED.inc()
    return answer if hit else None
~~~

### What to track and why

- **Hit rate (exact + semantic, and each tier separately).** The headline number: what fraction of traffic never touched the LLM. This is the direct input to a cost/latency ROI calculation — connect it explicitly to the **Cost Optimization** and **Latency** skills by reporting "$X saved" and "Y ms saved on average" alongside the raw hit rate.
- **Score distribution near the threshold.** A histogram of top scores reveals whether the threshold is well-placed: a cluster of misses just below threshold suggests the threshold may be slightly too strict for real traffic; a cluster of hits just above it with known-bad outcomes suggests the opposite.
- **Wrong-hit rate (a quality metric, not a volume metric).** Sampled human or LLM-judge review of a slice of served cache hits, feeding into **AI Evals**, to catch confidently-wrong answers that a pure hit-rate number would never reveal.
- **Cache staleness age.** Distribution of "how old is the cached entry that served this hit" — a rising staleness age on a domain with frequently-changing facts is an early warning that TTLs are too generous or invalidation isn't firing.
- **Fallback/failure rate of the cache backend itself.** How often the vector store or embedding service is unreachable and the system fell back to a direct LLM call — this should be near zero, and any sustained rise is an infrastructure incident, not a cache-tuning issue.

Alert on symptoms that matter to users and cost (falling hit rate, rising wrong-hit rate) rather than only on infrastructure internals (CPU on the vector store node), mirroring the RED-metrics philosophy used for any production service.
`,

  deployment: `
### A minimal production-shaped cache service (FastAPI + Redis vector search)

~~~python
# app/cache_service.py
from fastapi import FastAPI, HTTPException
from redis.commands.search.query import Query
import redis
import numpy as np

app = FastAPI()
r = redis.Redis(host="redis", port=6379, decode_responses=False)

EMBEDDING_DIM = 384          # must match your embedding model's output size
THRESHOLD = 0.90             # starting point -- tune per query class in production
INDEX_NAME = "semantic_cache_idx"

@app.post("/cache/lookup")
def lookup(question: str, embedding: list[float]):
    """embedding is computed by the caller (or a sidecar) using a shared embedding client."""
    if len(embedding) != EMBEDDING_DIM:
        raise HTTPException(400, "embedding dimension mismatch")
    vec = np.array(embedding, dtype=np.float32).tobytes()
    q = (
        Query(f"*=>[KNN 1 @embedding $vec AS score]")
        .sort_by("score")
        .return_fields("answer", "score")
        .dialect(2)
    )
    try:
        results = r.ft(INDEX_NAME).search(q, query_params={"vec": vec})
    except redis.exceptions.ConnectionError:
        # Cache backend down -- degrade gracefully, caller should fall back to a real LLM call
        return {"hit": False, "degraded": True}
    if not results.docs:
        return {"hit": False}
    top = results.docs[0]
    score = 1 - float(top.score)  # Redis returns distance; convert to similarity
    return {"hit": score >= THRESHOLD, "answer": top.answer if score >= THRESHOLD else None, "score": score}
~~~

~~~dockerfile
# Dockerfile -- the cache service is a small, independently scalable component
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY app/ app/
# Non-root user: standard container hardening, no reason a cache lookup needs root
RUN useradd -m cacheuser
USER cacheuser
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.cache_service:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Per-line rationale: a dedicated small service (not embedded logic scattered across the app) makes the cache independently deployable, scalable, and observable; a graceful ConnectionError fallback ensures a Redis outage degrades to "always call the LLM" rather than 500-ing every request; the embedding dimension check catches a silent embedding-model mismatch before it corrupts search results rather than after.

### Operational notes

- Deploy the vector index (Redis Stack, or a managed Pinecone/Qdrant instance) with replication — treat it with the same seriousness as your primary database, since an outage degrades performance/cost, not correctness, provided the graceful-fallback path is implemented.
- Version your index schema (embedding dimension, distance metric) alongside your embedding model version; a mismatch here fails loudly (dimension error) or, worse, silently returns meaningless scores if the metric configuration is wrong.
`,

  "production-checklist": `
Before a semantic cache takes real production traffic:

- [ ] Exact-match tier implemented and checked before any embedding call
- [ ] Threshold tuned per query class against a labeled should-match/should-not-match dataset, not left at a library default
- [ ] TTL configured on every cache entry, matched to how often the underlying knowledge actually changes
- [ ] Personalized, account-specific, and creative-generation queries explicitly excluded from caching (or strictly per-user scoped)
- [ ] Safety/moderation check runs on the cache-write path, not only the direct-response path
- [ ] Multi-tenant isolation enforced via cache key/namespace scoping, if applicable
- [ ] Graceful fallback to a direct LLM call implemented if the vector store or embedding service is unreachable
- [ ] Hit rate, near-miss score distribution, and wrong-hit rate instrumented and dashboarded
- [ ] Manual purge/invalidate capability available to operators for a discovered bad entry
- [ ] Cache fully invalidated and re-embedded on any embedding-model version change
- [ ] Negation and conditional-question edge cases specifically tested
- [ ] Origin (source question/context) logged alongside every cached answer for traceability
- [ ] Vector store replicated / backed up, sized for expected entry-count growth
- [ ] Load tested at expected QPS with realistic query-repetition patterns, not just synthetic identical queries
`,

  "common-mistakes": `
1. **Treating the threshold as a one-time setting.** Real traffic distribution shifts over time; a threshold tuned once at launch drifts out of calibration as query patterns evolve.
2. **Caching personalized responses by mistake.** A support bot answering "what's the status of my order" can accidentally get cached and served to a different user asking a similarly-worded question about their own, different order.
3. **Forgetting that different embedding models produce incomparable vectors.** Swapping embedding providers without invalidating the existing cache silently corrupts every similarity score computed against old entries.
4. **Skipping the exact-match tier entirely** and paying for an embedding call even on genuinely byte-identical repeated queries, when a hash lookup would have been essentially free.
5. **No TTL at all**, on the assumption that "the knowledge base doesn't change that often" — until it does, and stale answers persist indefinitely with no expiry mechanism to catch them.
6. **Not testing negation and scope-narrowing questions**, which is the single most common category of confidently-wrong semantic cache hit in real deployments.
7. **Measuring only aggregate hit rate**, never wrong-hit rate — a cache can look like a huge success by the numbers while quietly serving incorrect answers at a meaningful rate.
8. **Assuming the cache is always faster** without measuring — a poorly indexed vector store at scale, or a slow embedding API, can make the "fast path" slower than just calling the LLM.
9. **No fallback path when the cache backend is down**, turning an optimization layer into a hard dependency and a new source of outages.
10. **Applying one global cache policy across wildly different query domains** instead of scoping threshold, TTL, and even whether-to-cache-at-all per query class.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Cache never hits, even on obvious paraphrases | Threshold set too high, or embedding-model version mismatch between write and read paths | Log top scores on every lookup; verify embedding model version consistency; lower threshold based on labeled data |
| Cache hits confidently on unrelated questions | Threshold set too low, or embedding model not well-suited to short queries | Raise threshold; test with a should-not-match dataset; consider a different embedding model |
| Wrong answer served for a negated question | Embedding model puts negated/non-negated phrasings close together | Raise threshold for the affected query class, or add an explicit negation check before trusting a hit |
| Dimension mismatch error from vector store | Embedding model changed without updating the index schema | Recreate the index with the new dimension; fully re-embed and reload cached entries |
| Cache "hit" returns stale pricing/policy info | No TTL, or TTL too long relative to how often the source data changes | Set/shorten TTL; add event-driven invalidation on known data-change events |
| Sudden drop in hit rate after a deploy | Embedding model or preprocessing/normalization logic changed silently | Version-tag the cache by embedding-model + normalization version; invalidate on any change |
| Requests time out under load | Vector store under-provisioned, or no ANN index (exact search at scale) | Add/upgrade to an ANN index (HNSW); scale the vector store; add a request timeout with fallback to direct LLM call |
| One tenant sees another tenant's cached answer | No tenant scoping on cache keys/namespace | Add tenant ID to cache key or vector-store namespace/metadata filter |

The general habit: log the raw similarity score on every lookup, hit or miss — nearly every one of these symptoms is diagnosable from that single number plus which query triggered it.
`,

  faqs: `
**Q: Isn't semantic caching just RAG retrieval pointed at old answers instead of documents?**
Mechanically, yes — it reuses the same embedding + vector search machinery. Conceptually, they answer different questions: RAG retrieval asks "what documents are relevant to help answer this query," while semantic caching asks "have I already generated a good answer to a sufficiently similar query." Many production systems use the same vector store technology (see **Vector Search**, **FAISS/Pinecone/Redis/Qdrant**) for both, in separate indexes.

**Q: What similarity threshold should I start with?**
There's no universal correct number — it depends entirely on your embedding model and domain. A common starting point in practice is somewhere in the 0.85-0.95 cosine-similarity range, then tuned empirically against a labeled dataset of your own should-match/should-not-match query pairs (see Testing). Don't ship a threshold you haven't validated against real examples from your domain.

**Q: Should I cache multi-turn conversations, or only single-shot Q&A?**
Semantic caching is dramatically easier to reason about for single-shot, stateless Q&A, where "the query" is unambiguous. Caching within a multi-turn conversation requires deciding what "the query" even means (the latest message? the whole conversation so far?) and is far more prone to context-dependent wrong hits — most production systems restrict semantic caching to single-shot or FAQ-style interactions for this reason.

**Q: Does semantic caching replace prompt-level caching (KV-cache reuse)?**
No — they solve different layers of the same broad **Context Engineering** problem. Prompt/KV-cache reuse speeds up and cheapens a *given* LLM call by reusing computation on a shared prefix; semantic response caching avoids making the LLM call at all for a *repeated intent*. Production systems often use both simultaneously.

**Q: How do I know if my cache is actually saving money, not just adding complexity?**
Instrument hit rate and connect it directly to avoided token cost and avoided latency (see Monitoring, and the **Cost Optimization** skill). If hit rate is low for your traffic pattern (genuinely diverse, non-repetitive queries), a semantic cache may add embedding-call cost and correctness risk without meaningful savings — measure before committing to the architecture.

**Q: Is a semantic cache ever dangerous even for "safe" FAQ-style content?**
Yes, whenever the underlying facts change (pricing, policy, availability) and the cache isn't invalidated in step with them — a cache always trades a small amount of freshness for a large amount of cost/latency savings, and that tradeoff needs to be a conscious choice, not an accident.

**Q: What's the honest failure mode if I get the threshold wrong in the "too loose" direction?**
Confidently wrong answers served at scale, often invisible unless you specifically monitor wrong-hit rate — this is the single most important risk to communicate to stakeholders before enabling semantic caching on anything customer-facing.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between exact-match caching and semantic caching?* Exact-match compares literal strings (or their hashes); semantic caching compares meaning via embeddings and similarity search, so paraphrased queries can still hit.
2. *Why would "What's the capital of France?" and "France's capital city?" fail to hit an exact-match cache?* They are different byte sequences, so their hashes differ, even though a human recognizes them as the same question — exact-match caching has no concept of meaning.
3. *What does the similarity threshold control?* The boundary between "close enough to reuse the cached answer" and "different enough to require a fresh LLM call" — it trades hit rate against correctness risk.
4. *Name one workload where semantic caching helps and one where it's dangerous.* Helps: RAG Q&A over relatively static knowledge, FAQ-style support bots. Dangerous: personalized responses (account balances), time-sensitive facts, creative generation.
5. *What is a tiered cache in this context?* Checking a cheap, risk-free exact-match tier first, and only falling back to a semantic (embedding-based) lookup on a miss, before finally calling the LLM.

**Senior:**

6. *Walk through what happens, in order, on an incoming query to a well-built semantic cache.* Normalize → exact-match check → (on miss) embed → vector similarity search → threshold decision → hit returns cached answer / miss calls the LLM → safety-check the fresh response → write to both cache tiers. Strong answers explain WHY the cheap/safe steps come first.
7. *Why can two negated questions ("is X covered" vs "is X not covered") be dangerous for a semantic cache?* Many embedding models place negated and non-negated phrasings close together in vector space because negation is a small lexical change, even though the correct answers are opposite — this is a structural blind spot of similarity-based matching, not a bug you can threshold your way out of alone.
8. *How would you tune a similarity threshold in a principled way?* Build a labeled dataset of should-match/should-not-match query pairs from real or representative traffic, sweep threshold values, and pick the point that balances hit rate against an acceptable wrong-hit rate for that specific domain — repeat per query class, not globally.
9. *What happens to a semantic cache when you change the embedding model, and why?* Every previously stored vector becomes incomparable to newly generated ones, because cosine similarity between vectors from two different models is not meaningful — this forces a full cache invalidation and re-embedding.
10. *How does semantic caching interact with security and AI red-teaming concerns?* A harmful response generated once via a jailbreak or injection attack, if cached, can be retrieved by semantically similar future queries from other users, potentially bypassing safety checks that only ran on the original path — mitigation is moderating responses before they're written to cache, not only before they're returned.
11. *Design a semantic cache for a multi-tenant SaaS support bot. What's the one thing you must get right first?* Tenant isolation on cache keys/namespace — without it, one tenant's cached answer (built from their private context) can leak to another tenant's semantically similar query, which is a data-isolation bug more severe than any performance concern.
12. *How do you measure whether a semantic cache is actually worth the complexity?* Instrument hit rate and connect it to concrete avoided token cost and avoided latency; separately sample and review served cache hits for a wrong-hit rate, since aggregate hit rate alone can hide confidently wrong answers.
`,

  "coding-questions": `
### 1. Implement a bounded, TTL-aware semantic cache (tests correctness + eviction reasoning)

~~~python
import time
import numpy as np
from dataclasses import dataclass, field

@dataclass
class CacheEntry:
    vector: np.ndarray
    answer: str
    created_at: float
    ttl_seconds: float
    hits: int = 0

    def is_expired(self, now: float) -> bool:
        return now - self.created_at >= self.ttl_seconds

class BoundedSemanticCache:
    """LRU-ish eviction by hit count when full; TTL expiry checked on every read."""
    def __init__(self, capacity: int, threshold: float = 0.9):
        self.capacity = capacity
        self.threshold = threshold
        self.entries: list[CacheEntry] = []

    def _cosine(self, a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))

    def get(self, query_vec: np.ndarray) -> str | None:
        now = time.monotonic()
        # Purge expired entries lazily -- avoids a separate background sweep for this exercise
        self.entries = [e for e in self.entries if not e.is_expired(now)]
        best_score, best_entry = 0.0, None
        for e in self.entries:
            score = self._cosine(query_vec, e.vector)
            if score > best_score:
                best_score, best_entry = score, e
        if best_entry is not None and best_score >= self.threshold:
            best_entry.hits += 1
            return best_entry.answer
        return None

    def put(self, query_vec: np.ndarray, answer: str, ttl_seconds: float = 3600) -> None:
        if len(self.entries) >= self.capacity:
            # Evict least-frequently-used entry -- fits a "handful of very common
            # questions" workload better than pure LRU for a support-bot cache.
            self.entries.sort(key=lambda e: e.hits)
            self.entries.pop(0)
        self.entries.append(CacheEntry(query_vec, answer, time.monotonic(), ttl_seconds))
~~~

Complexity: O(n) per lookup and per eviction scan, where n is capacity — fine for a few thousand entries; swap the linear scan for an ANN index (see Intermediate Concepts) beyond that. Follow-up they may ask: make eviction O(log n) with a heap keyed on hit count, or move to a real vector index for scale.

### 2. Threshold sweep to find the best operating point (tests evaluation methodology)

~~~python
import numpy as np

def sweep_threshold(pairs: list[tuple[np.ndarray, np.ndarray, bool]], candidates: list[float]) -> float:
    """
    pairs: (query_vec_a, query_vec_b, should_match) labeled examples.
    Returns the threshold that maximizes accuracy over the labeled set.
    In production, weight false positives more heavily than false negatives --
    a wrong cached answer is worse than an avoidable extra LLM call.
    """
    def cosine(a, b):
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))

    best_threshold, best_score = candidates[0], -1.0
    for t in candidates:
        correct = 0
        for vec_a, vec_b, should_match in pairs:
            predicted_match = cosine(vec_a, vec_b) >= t
            # Penalize false positives (wrong hit) 3x harder than false negatives (missed hit)
            if predicted_match == should_match:
                correct += 1
            elif predicted_match and not should_match:
                correct -= 3
            # false negative: no penalty beyond not scoring a point -- a miss just costs an LLM call
        if correct > best_score:
            best_score, best_threshold = correct, t
    return best_threshold
~~~

Discussion points: why false positives (wrong cached answer served) should be weighted worse than false negatives (an avoidable but harmless extra LLM call) in the scoring function; how this generalizes to per-query-class thresholds.

### 3. Tiered lookup with graceful degradation (tests production resilience thinking)

~~~python
def ask_with_fallback(question: str, exact_cache, semantic_cache, embed_fn, llm_call) -> str:
    normalized = " ".join(question.lower().split())
    if normalized in exact_cache:
        return exact_cache[normalized]

    try:
        query_vec = embed_fn(question)
        hit = semantic_cache.get(query_vec)
    except (ConnectionError, TimeoutError):
        # Cache backend unreachable -- degrade to direct LLM call, never fail the request
        hit, query_vec = None, None

    if hit is not None:
        exact_cache[normalized] = hit
        return hit

    answer = llm_call(question)
    exact_cache[normalized] = answer
    if query_vec is not None:
        semantic_cache.put(query_vec, answer)
    return answer
~~~

Complexity: O(1) amortized for the exact tier, dependent on the vector index for the semantic tier. Follow-up: add a circuit breaker so repeated backend failures stop retrying the cache path for a cooldown window instead of adding latency on every request.
`,

  "hands-on-labs": `
### Lab 1 — Build the minimal semantic cache (beginner, ~1h)
Implement the TinySemanticCache from Beginner Concepts using a real embedding API call. Test it with 10 hand-written paraphrase pairs and 10 hand-written unrelated pairs; print the similarity score for each and find a threshold that separates them. Skills: embeddings, cosine similarity, threshold intuition.

### Lab 2 — Swap in a real vector index (intermediate, ~2h)
Replace the linear scan with a FAISS index (or Redis vector search, or Qdrant). Load 500 synthetic FAQ question/answer pairs, embed and index them, then fire 100 paraphrased test queries and measure hit rate and lookup latency versus the linear-scan version. Deliverable: a table comparing latency at 500 vs 50,000 entries. Skills: **Vector Search**, ANN indexes, benchmarking.

### Lab 3 — Tiered cache with TTL and monitoring (advanced, ~3h)
Build the full tiered pipeline (exact-match tier + semantic tier + TTL expiry), instrument it with the Prometheus metrics from the Monitoring section, and simulate realistic traffic (a mix of exact repeats, paraphrases, and genuinely novel queries) to produce a hit-rate dashboard. Skills: production caching architecture, instrumentation.

### Lab 4 — Adversarial and negation stress test (production, ~2h)
Take Lab 3's cache and specifically attack it: craft negated versions of cached questions, near-miss questions with a narrower scope ("all returns" vs "returns within 30 days"), and a simulated cache-poisoning scenario (a harmful response gets cached, then a similar benign-looking query tries to retrieve it). Write up which failed, why, and what threshold/policy change fixes each. Skills: **AI Red Teaming** mindset applied to caching, evals-driven tuning.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate this skill to employers:

1. **Semantic-cached FAQ bot with a full evals harness** — a RAG-backed FAQ bot over a real or synthetic document set, with a tiered semantic cache in front of the LLM call, a labeled should-match/should-not-match test suite driving threshold tuning, and a dashboard showing hit rate, cost saved, and a sampled wrong-hit rate. Demonstrates: the full skill end to end, plus **AI Evals** discipline applied to a caching layer specifically.

2. **Multi-tenant support-bot cache with isolation and red-team suite** — extend the above to simulate multiple tenants with private knowledge bases, prove cache isolation holds under adversarial testing (attempt cross-tenant leakage, negation attacks, cache-poisoning attempts), and document every mitigation. Demonstrates: security-conscious system design, **AI Red Teaming** applied concretely, production-grade multi-tenancy thinking.

3. **Cache-aware LLM gateway** — a small gateway service (FastAPI) that every LLM call in a toy application routes through, implementing tiered caching, graceful degradation on backend failure, per-query-class threshold policy, and full observability (Prometheus metrics, structured logs tracing every hit back to its origin). Demonstrates: production architecture, resilience engineering, connects directly to **Cost Optimization** and **Latency** with real before/after numbers from your own load tests.

Each project: full type hints, a pytest suite covering hit/miss/negation/TTL/fallback behavior, CI, and a README with an architecture diagram and a clearly stated threshold-tuning methodology — the engineering discipline around the cache is what distinguishes a toy demo from a portfolio piece.
`,

  "case-studies": `
### GPTCache (Zilliz): purpose-built semantic caching as a library
Zilliz, the company behind the Milvus vector database, built and open-sourced GPTCache specifically to address LLM API cost and latency, with pluggable embedding backends and pluggable vector-store backends (including FAISS and Milvus itself). Lesson: semantic caching was significant enough as a distinct problem, separate from general-purpose vector search or RAG retrieval, to justify its own dedicated open-source project rather than being treated as a minor RAG feature.

### Redis positioning vector search explicitly for LLM caching
Redis added vector similarity search (via Redis Stack / RediSearch) and has published documentation and reference architectures explicitly framing it as a semantic caching backend for LLM applications, not only as a RAG retrieval store. Lesson: teams already operating Redis for exact-match caching, sessions, and rate limiting have a strong incentive to extend that same operational investment into semantic caching rather than standing up a separate specialized vector database, illustrating how "which vector store" decisions are often driven as much by existing operational footprint as by raw ANN performance.

### The generic "support bot" pattern across the industry
Across a wide range of customer-support and internal-tools AI products (support platforms, internal wiki Q&A bots, e-commerce product-question bots), the same shape recurs: highly repetitive intents, endless phrasing variation, relatively static underlying knowledge. Lesson: semantic caching's value is highly workload-shape-dependent — it is a targeted tool for "repetitive intent, static knowledge" traffic, not a general-purpose LLM optimization to bolt onto every product indiscriminately, and the industry's actual deployments cluster tightly around exactly that shape.

I don't have verified, citable production metrics (specific cost-reduction percentages) for named companies beyond general vendor-published patterns, and would rather flag that gap than invent a number.
`,

  comparisons: `
| Dimension | Exact-match caching | Semantic caching | Full RAG re-retrieval every time | No caching |
|---|---|---|---|---|
| Catches paraphrased duplicate queries | No | Yes | N/A (retrieves docs, not cached answers) | No |
| False-positive (wrong answer) risk | None | Present, threshold-dependent | None (always generates fresh) | None |
| Added latency per request | Near-zero (hash lookup) | Small (embedding call + vector search) | N/A | None (but pays full LLM latency) |
| Added infra to operate | A key-value store | A key-value store + a vector index | A vector index (for documents, already needed for RAG) | None |
| Cost savings on repetitive traffic | Modest (misses most real-world repetition) | Large, if traffic is genuinely repetitive in intent | None | None |
| Staleness risk | Present (needs TTL) | Present (needs TTL), plus embedding-model-version risk | None (always fresh) | None |
| Appropriate for personalized queries | Only if scoped per-user | Only if strictly scoped per-user; usually best avoided | Yes (retrieval can be personalized) | Yes |

**How seniors choose**: start with exact-match caching always — it's nearly free and risk-free. Add a semantic tier only once you've measured that a meaningful share of traffic is semantically (not literally) repetitive, and only for query domains where a wrong cached answer is an acceptable, boundable risk (FAQ-style, relatively static knowledge). Never apply semantic caching uniformly across an entire product surface without domain-by-domain review — the right architecture is almost always "tiered cache for some query classes, always-fresh generation for others," decided deliberately per class rather than globally.
`,

  "related-technologies": `
- **Embeddings** — the foundational technology that makes "meaning" computable as a vector; read this first if you haven't.
- **Vector Search** — the ANN algorithms (HNSW, IVF) and index tradeoffs that make similarity lookup fast at scale; semantic caching is one specific application of this broader skill.
- **FAISS / Pinecone / Redis / Qdrant** — concrete vector store options usable as a semantic cache's backend; each covered as its own skill on this platform with its own tradeoffs (self-hosted library vs managed service vs general-purpose data store gaining vector capability).
- **Context Engineering** — the broader discipline this skill is a specialized sibling of; Context Engineering covers managing what's IN the context window (including KV/prompt caching to speed up a given call), while semantic caching is specifically about avoiding the call entirely by reusing a past response.
- **Cost Optimization** — the umbrella skill for reducing LLM spend; semantic caching is one of the highest-leverage tactics within it for repetitive-query workloads.
- **Latency** — the umbrella skill for reducing response time; semantic caching's biggest win (skipping generation entirely) is a direct latency lever.
- **AI Evals** — the discipline of measuring response quality; a semantic cache's correctness (wrong-hit rate) belongs inside your evals practice, not outside it.
- **AI Red Teaming** and **Prompt Injection Defense** — adversarial testing practices directly relevant to cache-poisoning and cross-tenant leakage risks covered in Security.
- **RAG (Retrieval-Augmented Generation)** — the most common production home for semantic caching; the same embedding/vector-search machinery often serves both document retrieval and cache lookup, in separate indexes.

On this platform, a natural path: **Embeddings** → **Vector Search** → this page → **Cost Optimization** and **Latency** for the ROI case, **AI Evals** and **AI Red Teaming** for the correctness/safety case.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025 — this space moves quickly and I'd recommend checking each named tool's current documentation before making a production decision.

- **GPTCache** continues to be referenced as one of the primary purpose-built open-source semantic caching libraries, with pluggable embedding and vector-store backends; check its repository for current supported backends and release cadence rather than assuming feature parity with older versions.
- **Redis's vector search capability** (via Redis Stack / RediSearch) has matured as a mainstream option for teams wanting to add semantic caching without new infrastructure; verify current index types and performance characteristics directly against Redis's current documentation, as this has been an actively evolving area.
- **LangChain and LlamaIndex** have continued expanding built-in cache abstractions that wrap GPTCache, Redis, and various vector stores — the specific integration surface changes frequently enough that checking current framework docs is more reliable than relying on any specific code example's continued validity.
- **Momento and other managed/serverless cache platforms** have published semantic-caching-positioned offerings; pricing, feature scope, and specific ANN algorithm choices for these are the kind of detail that changes often and is worth verifying directly with the vendor rather than trusting a cached (no pun intended) summary.
- I do not have confident, verified knowledge of benchmark numbers, specific version releases, or pricing for any of these tools as of today's date — treat every specific figure in this page's Production Usage and Industry Examples sections as illustrative and directional, and verify anything load-bearing to a real decision against current sources.
`,

  "future-roadmap": `
Where this space appears to be heading, and what's worth investing career time in:

1. **Tighter integration into standard LLM-app frameworks.** Semantic caching is increasingly becoming a checkbox configuration option inside LangChain/LlamaIndex-style frameworks rather than a from-scratch build — the differentiating skill shifts from "can you implement it" to "can you tune the threshold and policy correctly for a given domain," which is exactly the judgment this page emphasizes.
2. **Better handling of the negation/scope-narrowing failure mode.** Expect embedding models and caching libraries to develop more explicit handling for semantically-close-but-logically-opposite queries (negation, scope changes), since this remains the sharpest known failure mode of similarity-based caching. Betting on understanding this failure mode deeply (rather than just the happy-path mechanics) is durable career-relevant knowledge regardless of which specific tool wins.
3. **Convergence with evals tooling.** As **AI Evals** practices mature industry-wide, expect cache-hit correctness to become a standard slice of eval dashboards rather than a separate, often-skipped concern — teams that already treat cache quality as an evals problem will be ahead of this convergence.
4. **Growing overlap with agentic and multi-step systems.** As agent frameworks (multi-step, tool-using LLM systems) become more common, caching intermediate sub-query results semantically (not just final user-facing answers) is a natural extension — the underlying threshold/staleness/security tradeoffs covered on this page apply directly, just at a finer grain.
5. **Increasing scrutiny on the security angle.** As **AI Red Teaming** matures as a discipline, expect cache-poisoning and cross-tenant leakage to get more attention as a distinct category of AI system vulnerability, rather than being treated as a minor footnote to prompt injection.

For your career: the durable, tool-agnostic skills here are threshold-tuning methodology, staleness/invalidation design, and adversarial thinking about what a cache can leak or poison — those transfer regardless of which specific library or vendor wins the tooling race.
`,

  "cheat-sheet": `
~~~python
# --- The core idea ---
# Exact-match cache: hash(prompt) -> answer. Misses paraphrases.
# Semantic cache: embed(query) -> nearest neighbor among past query embeddings -> answer if similar enough.

# --- Minimal lookup logic ---
def semantic_get(question, index, answers, embed_fn, threshold=0.90):
    vec = embed_fn(question)
    score, idx = index.search(vec, k=1)          # cosine similarity or inner product
    return answers[idx] if score >= threshold else None

# --- Tiered cache (the production default) ---
# 1. exact match (hash lookup, free, zero risk)
# 2. semantic match (embedding call + vector search, small risk)
# 3. LLM call (slow, expensive, always correct-as-the-model-allows)

# --- Threshold posture by risk ---
# low-stakes static facts   -> loose threshold (~0.85), aggressive caching
# medium-stakes, changes    -> medium threshold + short TTL
# personalized / creative / -> do NOT cache, or scope strictly per-user
#   safety-critical

# --- Staleness controls ---
TTL_SECONDS = 3600            # expire regardless of use
# + event-driven invalidation whenever source docs/policies change
# + full cache wipe + re-embed whenever the EMBEDDING MODEL changes

# --- Security musts ---
# - moderate/safety-check responses BEFORE writing to cache, not just before returning
# - scope cache keys/namespaces per tenant/user in multi-tenant systems
# - log the originating query for every cached answer (traceability)

# --- Metrics to instrument ---
# hit_rate (exact + semantic, separately)
# top_score histogram (near-threshold visibility)
# wrong_hit_rate (sampled human/LLM-judge review)
# avoided_llm_calls -> ties directly to cost + latency savings

# --- Tools (verify current details before committing) ---
# GPTCache          - purpose-built OSS semantic caching library
# Redis + RediSearch - vector search on infra you may already run
# LangChain/LlamaIndex - framework-level cache wrappers
# FAISS/Pinecone/Qdrant - vector index backends
# Momento           - managed/serverless option
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does exact-match caching key on? | A hash of the literal prompt string — misses any paraphrase or reordering |
| What does semantic caching key on? | The embedding (meaning) of the query, compared via similarity search against past query embeddings |
| What is the similarity threshold? | The score cutoff deciding whether a candidate match counts as a cache hit; the main tool for tuning the hit-rate vs wrong-answer tradeoff |
| Why check exact match before semantic match? | Exact match is free (hash lookup) and has zero false-positive risk; semantic match costs an embedding call and carries correctness risk |
| Why is negation dangerous for semantic caches? | Many embedding models place negated and non-negated phrasings close together despite opposite correct answers |
| What breaks when you change the embedding model? | Every previously stored vector becomes incomparable to new ones — cosine similarity across different models is meaningless; requires full re-embedding |
| Name a workload where semantic caching helps | RAG Q&A over relatively static knowledge, or a customer-support FAQ bot |
| Name a workload where semantic caching is dangerous | Personalized responses (account data), time-sensitive facts, or creative generation |
| What is cache poisoning in this context? | A harmful/wrong response generated once (e.g. via prompt injection) gets cached and served to other, semantically-similar future queries |
| What's the fix for multi-tenant leakage? | Scope cache keys/namespaces per tenant or user |
| What should happen before writing a fresh LLM response to cache? | A safety/moderation check — cache writes persist a response beyond its original request |
| What's the graceful-degradation principle for a cache backend outage? | Fall back to a direct LLM call rather than failing the request — the cache should never be a hard dependency for correctness |
| What two numbers should you log on every semantic lookup? | The top similarity score and whether it crossed the threshold (hit vs miss) |
| Which is the cheaper caching tier: exact-match or semantic? | Exact-match — a hash lookup, no embedding call needed |
| What single metric best hides a cache correctness problem if not tracked separately? | Aggregate hit rate — it can look great while wrong-hit rate quietly stays nonzero |
`,

  mcqs: `
**1. Why does exact-match caching miss "What's the capital of France?" vs "France's capital city?"**

A) The LLM gives different answers each time  B) They hash to different keys despite meaning the same thing  C) Exact-match caches don't support questions  D) The embedding model is too slow

**Answer: B** — exact-match compares literal byte sequences, and these are different strings despite identical meaning.

**2. In a well-designed tiered cache, which check happens first?**

A) LLM call  B) Semantic (embedding) search  C) Exact-match lookup  D) Safety moderation

**Answer: C** — exact-match is cheapest and carries zero false-positive risk, so it's checked before paying for an embedding call.

**3. What happens if you swap your embedding model but keep old cached vectors as-is?**

A) Nothing, embeddings are always comparable  B) Similarity scores against old vectors become meaningless  C) The cache automatically re-embeds itself  D) Only the TTL is affected

**Answer: B** — cosine similarity between vectors from two different embedding models is not a valid comparison; the cache must be invalidated and re-embedded.

**4. Which query type is generally the WORST fit for semantic caching?**

A) "What are your store hours?"  B) "What's my current account balance?"  C) "What's your return policy?"  D) "Do you ship internationally?"

**Answer: B** — personalized, account-specific data must not be served from a shared semantic cache, since a similar-sounding query from a different user could retrieve someone else's data.

**5. Why is a negated question ("is X NOT covered") a known risk for semantic caches?**

A) Negated questions can't be embedded at all  B) They typically embed far away from the original question, causing false misses  C) They often embed close to the non-negated version despite having an opposite correct answer  D) Vector stores reject negation tokens

**Answer: C** — negation is a small lexical change that many embedding models don't weight heavily, so a negated and non-negated question can score as "similar" while requiring different answers.

**6. What's the recommended response when the vector store backend is temporarily unreachable?**

A) Fail the request immediately  B) Return a random cached answer  C) Fall back to calling the LLM directly  D) Wait indefinitely for the store to recover

**Answer: C** — the cache should be a performance optimization with a documented failure mode, never a hard dependency for correctness; falling back to a direct LLM call keeps the request correct, just slower.
`,

  "revision-notes": `
**The core idea in 3 lines:** Exact-match caching hashes the literal prompt and misses paraphrases. Semantic caching embeds the incoming query and looks up its nearest neighbor among past query embeddings; if the similarity score clears a threshold, it returns the stored answer instead of calling the LLM again.

**The mechanism in 5 lines:** Normalize the query, check a cheap exact-match tier first (zero risk), then on a miss embed the query and run a vector similarity search (FAISS/Pinecone/Redis/Qdrant) against cached query embeddings. A threshold decides hit vs miss — too loose returns wrong answers, too tight rarely hits. On a genuine miss, call the LLM, safety-check the response, and write it into both cache tiers for next time.

**Where it helps vs where it's dangerous, in 4 lines:** It shines on high-repeat-query, relatively static-knowledge workloads — RAG Q&A, FAQ-style support bots, internal documentation bots. It's dangerous for personalized responses (never share across users), time-sensitive facts (stale answers persist past their validity), and creative generation (caching defeats the point of asking for something new).

**Risk and invalidation in 4 lines:** Staleness is the central risk — set TTLs matched to how often underlying facts change, and fully invalidate + re-embed whenever the embedding model itself changes, since vectors from different models aren't comparable. Security risk compounds this: a harmful response cached once (via prompt injection) can be retrieved by later similar queries unless moderation runs on the write path, and multi-tenant systems must scope cache keys per tenant to avoid leaking one user's cached context to another.

**Measurement and judgment in 4 lines:** Track hit rate (tying directly to Cost Optimization and Latency wins), but also sample and review served hits for a wrong-hit rate — aggregate hit rate alone hides confidently wrong answers. Tune thresholds per query class against a labeled dataset, not as one global constant. Treat cache quality as part of your AI Evals practice, not a separate afterthought, and always implement graceful degradation to a direct LLM call if the cache backend is unavailable.
`,

  "learning-roadmap": `
A realistic path to production competency with semantic caching (adjust pace to your background):

**Week 1 — Foundations.** Make sure **Embeddings** and **Vector Search** are solid first — this page assumes them. Read Beginner and Intermediate Concepts here; build the TinySemanticCache from Beginner Concepts against a real embedding API. Milestone: you can explain, out loud, why exact-match caching misses paraphrases and semantic caching doesn't.

**Week 2 — Real infrastructure.** Swap the linear scan for a real vector index (FAISS, or Redis vector search, or Qdrant) — Lab 2. Build the tiered cache from Intermediate Concepts. Milestone: a working exact-match + semantic two-tier lookup with measured latency at two different scales.

**Week 3 — Threshold discipline and testing.** Build a labeled should-match/should-not-match dataset for a domain you care about; sweep thresholds; specifically test negation and scope-narrowing cases (Testing, Coding Question 2). Milestone: a threshold you chose with evidence, not intuition, and a written explanation of the tradeoff you picked.

**Week 4 — Production hardening.** Implement TTL, graceful degradation on backend failure, safety-check-before-cache-write, and full monitoring (hit rate, near-miss score histogram, wrong-hit rate) — Lab 3. Milestone: a dashboard you'd trust to make a go/no-go call on rolling this out further.

**Week 5 — Security and multi-tenancy.** Run the adversarial stress test from Lab 4: negation attacks, cache-poisoning simulation, cross-tenant leakage attempts. Fix what breaks. Milestone: a written incident-response note for each vulnerability you found and how you closed it.

**Week 6 — Portfolio project.** Build the "Semantic-cached FAQ bot with a full evals harness" from Real Projects, end to end, with real before/after cost and latency numbers from your own load tests.

Then continue to **AI Evals** on this platform to formalize the quality-measurement side of this skill, or to **Cost Optimization** to place this technique in the broader context of reducing LLM spend systematically.
`,

  "official-docs": `
- [Redis vector search documentation](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/vectors/) — RediSearch's vector similarity capabilities, index types, and query syntax.
- [FAISS documentation](https://faiss.ai/) and [github.com/facebookresearch/faiss wiki](https://github.com/facebookresearch/faiss/wiki) — index types (Flat, IVF, HNSW) and how to choose between them.
- [Pinecone documentation](https://docs.pinecone.io/) — managed vector database docs, including namespace-based multi-tenant isolation patterns relevant to cache scoping.
- [Qdrant documentation](https://qdrant.tech/documentation/) — open-source/managed vector database docs, including payload filtering usable for per-tenant or per-query-class cache scoping.
- [GPTCache documentation/repository](https://github.com/zilliztech/GPTCache) — the purpose-built semantic caching library; read its architecture docs for a concrete reference implementation of everything on this page.
- [LangChain caching documentation](https://python.langchain.com/) — search current docs for "cache" / "LLM cache" integrations, since specific pages move between releases.

I'm not fully confident every one of these URLs is still at that exact path given how quickly documentation sites reorganize — verify the link resolves and search each site's docs directly if it has moved.
`,

  books: `
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not semantic-caching-specific, but the definitive treatment of caching, consistency, and staleness tradeoffs that every argument in this page's Staleness and Scalability sections rests on.
- **Building LLM Applications** (general category — check current editions/authors) — most current LLM-application-engineering books include a chapter on caching strategies including semantic caching; verify current, well-reviewed titles at time of reading, as this category is new and evolving quickly.
- **Introduction to Information Retrieval** — Manning, Raghavan, Schütze (free online). The classical IR foundations (nearest-neighbor search, similarity metrics) that embedding-based semantic caching builds directly on top of.
- **Designing Machine Learning Systems** — Chip Huyen. Strong treatment of production ML system design, including caching and serving-layer tradeoffs that generalize well to the semantic-caching case.

I'm intentionally not naming a "the definitive semantic caching book" because I'm not confident one canonical, widely-agreed-upon text exists yet for this specific, fast-moving sub-topic — the strongest current material lives in vendor documentation, engineering blogs, and the library repositories themselves (see GitHub Repositories, below).
`,

  blogs: `
- **Zilliz blog** (zilliz.com/blog) — GPTCache's maintainers; the most direct source of semantic-caching-specific engineering content, architecture rationale, and benchmarks.
- **Redis blog** (redis.io/blog) — vector search and semantic caching use cases from the team building RediSearch.
- **Pinecone learning center** (pinecone.io/learn) — strong general vector-search and RAG content, much of which applies directly to the semantic-cache-as-a-vector-index pattern.
- **Qdrant blog** (qdrant.tech/blog) — vector database engineering content, including multi-tenancy and filtering patterns relevant to cache isolation.
- **LangChain blog** (blog.langchain.dev) — framework-level caching integration announcements and patterns as they ship.

High-signal filter: prefer posts that show actual benchmark methodology (labeled datasets, measured hit rates, before/after latency numbers) over posts that only assert savings without showing how they measured them.
`,

  "research-papers": `
Semantic caching specifically is a young, engineering-driven topic rather than one with a deep, established academic literature of its own — I don't want to invent paper titles that don't exist. The genuinely foundational reading is one layer down, in the technologies semantic caching composes:

- **"Efficient Estimation of Word Representations in Vector Space"** (Mikolov et al., 2013, word2vec) — the origin of "meaning as a vector" that all embedding-based similarity techniques, including semantic caching, ultimately rest on.
- **"Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks"** (Reimers & Gurevych, 2019) — directly relevant, since sentence-level embeddings optimized for semantic similarity are exactly what a semantic cache's lookup embedding model needs to be good at.
- **"Billion-scale similarity search with GPUs"** (Johnson, Douze, Jégou, 2017) — the FAISS paper; foundational for understanding how large-scale approximate nearest-neighbor search (the mechanism under every semantic cache's vector-search step) actually works.
- **"Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs"** (Malkov & Yashunin, 2018) — the HNSW paper, the ANN algorithm behind most modern vector search implementations used as cache backends.

If a more specific, peer-reviewed "semantic caching for LLMs" paper exists that I'm not aware of, treat that as a gap in my knowledge rather than evidence one doesn't exist — search current academic databases (arXiv, ACL Anthology) for the latest work before assuming this reading list is exhaustive.
`,

  videos: `
- **Zilliz / Milvus community talks on GPTCache** — search Zilliz's YouTube channel and conference talk recordings (e.g. from vector-database and LLMOps-focused conferences) for walkthroughs of GPTCache's architecture directly from its maintainers.
- **Redis vector search talks** — Redis has presented RediSearch's vector capabilities, including LLM caching use cases, at various Redis-hosted and third-party developer conferences; search Redis's own YouTube channel for the current version of this content.
- **General "building production RAG systems" conference talks** (from LLMOps-focused conferences and vendor developer days) frequently include a caching segment, since it's a recurring cost-optimization topic in that talk genre.

I don't have high confidence in specific talk titles, speaker names, or exact publication dates for this narrow a topic, and would rather point you to the right channels/conferences to search currently than invent a specific citation. This is a fast-moving, practitioner-driven space where the best current content is often less than a year old.
`,

  "github-repos": `
- [zilliztech/GPTCache](https://github.com/zilliztech/GPTCache) — the reference open-source semantic caching library; read its architecture docs and source for a concrete, working implementation of everything covered on this page.
- [facebookresearch/faiss](https://github.com/facebookresearch/faiss) — the vector similarity search library most semantic caches use as (or model themselves after) their index backend.
- [qdrant/qdrant](https://github.com/qdrant/qdrant) — open-source vector database with payload filtering useful for per-tenant/per-query-class cache scoping.
- [redis/redis](https://github.com/redis/redis) plus [RediSearch](https://github.com/RediSearch/RediSearch) — Redis core and its search/vector module, for teams building a semantic cache on infrastructure they likely already run.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) — search its cache module for current semantic-cache-adjacent integrations (GPTCache, Redis, and others).
- [pgvector/pgvector](https://github.com/pgvector/pgvector) — vector similarity search as a Postgres extension; a relevant option for teams that want a semantic cache backend without adding a new database technology at all.
- [milvus-io/milvus](https://github.com/milvus-io/milvus) — the vector database GPTCache was originally built alongside; useful to read for how a purpose-built vector database approaches the same ANN problem FAISS solves as a library.

Verify current star counts, maintenance activity, and release cadence directly on GitHub before depending on any of these in production — activity levels shift over time.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Threshold intuition*: given 20 hand-labeled query pairs (10 true paraphrases, 10 genuinely different but topically related), compute cosine similarity for each pair using a real embedding model and find the threshold that best separates the two groups.
2. *Negation stress test*: write 10 question/negated-question pairs in a domain of your choice (returns policy, warranty terms, eligibility rules) and measure how many of them score above a 0.90 threshold despite having opposite correct answers — quantify the failure rate of naive thresholding on this specific failure mode.
3. *Tiered cache implementation*: build the exact-match + semantic two-tier lookup from scratch (no external cache library), including TTL expiry, and write tests for hit, miss, expired-hit, and fallback-on-backend-failure scenarios.
4. *Scale benchmark*: measure lookup latency for a linear-scan cache versus a FAISS HNSW-indexed cache at 100, 10,000, and 1,000,000 stored entries; produce a latency-vs-scale chart and identify the crossover point where the index becomes necessary.
5. *Multi-tenant isolation audit*: build a toy multi-tenant cache, then write an adversarial test suite that attempts to retrieve one tenant's cached answer via a semantically similar query from a different tenant — confirm your isolation mechanism (namespace/key scoping) actually prevents every attempt.
6. *Cost/latency ROI calculation*: given a real or synthetic traffic log with repeated intents, compute actual token cost and latency saved by a semantic cache at several threshold settings, and produce a report recommending a specific threshold with the tradeoff explicitly justified.

External sets: no dedicated public "semantic caching" problem sets exist yet that I'm confident recommending by name — the most useful external practice is building against real vector-search benchmark datasets (e.g. those used to evaluate FAISS/HNSW) and adapting them into a caching-specific evaluation harness as above.
`,

  "architecture-diagram": `
The reference production architecture for a semantic-cache-backed LLM service — the shape this page has built toward throughout:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/support widget)"] --> LB["Load balancer / API gateway"]
    LB --> API1["App service pod 1"]
    LB --> API2["App service pod N"]
    subgraph CacheTier["Shared Semantic Cache Tier"]
        Exact[("Exact-match store\n(Redis)")]
        VecIdx[("Vector index\nFAISS / Pinecone / Redis / Qdrant\nnamespaced per tenant")]
        Policy["Per-query-class threshold + TTL policy"]
    end
    API1 & API2 --> Exact
    Exact -- miss --> Embed["Embedding model\n(small, fast, dedicated)"]
    Embed --> VecIdx
    VecIdx --> Policy
    Policy -- hit --> API1
    Policy -- miss --> LLM["LLM provider"]
    LLM --> Safety["Safety / moderation check"]
    Safety --> CacheTier
    subgraph Obs["Observability"]
        Metrics["Hit rate, score histograms,\nwrong-hit sampling"]
        Logs["Structured logs: query, score,\ncache-entry origin"]
    end
    CacheTier -.emits.-> Obs
    LLM -.emits.-> Obs
~~~

Every box here maps to a skill on this platform: **Embeddings** and **Vector Search** power the middle tier; **AI Evals** and **AI Red Teaming** drive the Safety and Observability layers; **Cost Optimization** and **Latency** are the outcomes this whole diagram exists to improve.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Semantic Caching))
    The Problem
      Exact-match misses paraphrases
      Hash keys vs meaning
      Redundant cost and latency
    Mechanism
      Embed the query
      Vector similarity search
      Similarity threshold
      Hit returns cached answer
      Miss triggers LLM call
    Architecture
      Exact-match tier
      Semantic tier
      Embedding model choice
      Vector store choice
      TTL and eviction
    Risks
      Staleness
      Negation blind spot
      Cache poisoning
      Cross-tenant leakage
      Embedding-model drift
    Where it helps
      RAG Q&A over static knowledge
      FAQ support bots
      High-repeat-query workloads
    Where it's dangerous
      Personalized responses
      Time-sensitive facts
      Creative generation
    Production Practice
      Tiered lookup ordering
      Threshold tuning per query class
      Safety check before cache write
      Monitoring hit rate and wrong-hit rate
      Graceful degradation on backend failure
    Tooling
      GPTCache
      Redis vector search
      LangChain and LlamaIndex integrations
      FAISS Pinecone Qdrant
      Momento
    Connections
      Embeddings
      Vector Search
      Context Engineering sibling
      Cost Optimization
      Latency
      AI Evals
      AI Red Teaming
~~~
`,
};

export default semanticCaching;
