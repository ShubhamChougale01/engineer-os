import type { SkillContent } from "../types";

/**
 * Caching (Computer Science fundamentals) — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const cachingCs: SkillContent = {
  overview: `
Caching is the technique of storing a copy of data in a faster-to-access location so that future requests for that data can be served more quickly than recomputing or re-fetching it from its original, slower source — one of the single most broadly applicable performance techniques in all of computing, appearing at every layer of the technology stack from CPU hardware (L1/L2/L3 caches) up through operating system page caches, database query caches, and application-level caches (Redis, covered in its own skill). This page covers caching's underlying THEORY: the locality principles that make caching effective at all, the eviction policies that determine what to keep when a cache fills up, and the correctness challenges (staleness, invalidation) that caching introduces.

For an AI engineer, caching theory directly explains why a Redis-backed application cache behaves the way it does, why a CPU's cache hierarchy matters for genuinely performance-critical code, why LLM API response caching and semantic caching (covered in this platform's Context Engineering category) can dramatically reduce cost and latency, and why "there are only two hard things in computer science: cache invalidation and naming things" is a genuinely earned piece of engineering folklore rather than just a joke.

Key characteristics: **locality of reference** (temporal and spatial), the empirical observation that recently- or nearby-accessed data is disproportionately likely to be accessed again soon, which is the fundamental reason caching works at all; **eviction policies** (LRU, LFU, FIFO, and others), determining which cached items to discard when a cache reaches capacity; **cache hit/miss ratio**, the key metric measuring a cache's effectiveness; **write policies** (write-through, write-back, write-around), determining how writes interact with a cache and its underlying data source; and **cache invalidation**, the genuinely difficult problem of knowing when cached data has become stale and must be refreshed or discarded.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1965 | **Maurice Wilkes** proposes the concept of a cache memory for computer hardware, introducing the idea of a small, fast memory layer sitting between the CPU and slower main memory |
| 1968 | **IBM System/360 Model 85** becomes among the first commercial computers to implement a hardware cache, directly demonstrating caching's practical performance benefit at production computing scale |
| 1970 | **László Bélády** publishes foundational work on page replacement algorithms (eviction policies) for virtual memory systems, including the theoretical optimal (but unachievable in practice, since it requires knowing the future) "Bélády's algorithm," still used as a benchmark for evaluating practical eviction policies today |
| 1990s | **Web caching** becomes essential infrastructure as the World Wide Web grows, with browser caches, proxy caches, and eventually Content Delivery Networks (CDNs, covered in this platform's System Design category) applying caching principles at internet scale |
| 2000s | **In-memory key-value caches** (Memcached, 2003, and later Redis, 2009, covered in its own skill) become standard infrastructure components for web application performance, moving caching from a purely hardware/OS concern into everyday application architecture |
| 2010s–2020s | **Distributed caching** and **cache coherence** challenges grow alongside microservices and distributed systems architectures; more recently, **semantic caching** for LLM applications (covered in this platform's Context Engineering category) applies caching principles to the novel problem of recognizing semantically similar (not just identical) requests |

Caching's history reflects a consistent pattern: the SAME fundamental principle (locality of reference makes storing recently/frequently-used data in a faster location valuable) has been successfully applied at every new layer of computing abstraction as it emerged — from CPU hardware in the 1960s to web infrastructure in the 1990s to LLM application architecture today — demonstrating the principle's genuine, durable universality.
`,

  "why-it-exists": `
Caching exists because of a fundamental, persistent asymmetry in computing: fast storage (CPU registers, RAM) has always been dramatically more expensive and limited in capacity than slow storage (disk, network-accessed remote services), and this asymmetry, while its specific magnitudes have changed over decades, has never disappeared — every generation of computing hardware and infrastructure has faced some version of "the fast thing is small and expensive, the slow thing is big and cheap," making caching's core value proposition durable across an otherwise rapidly-changing technology landscape.

The specific insight that makes caching actually WORK, rather than being a hopeful guess, is the empirical observation of **locality of reference**: real-world programs and access patterns are not uniformly random — they exhibit strong TEMPORAL locality (data accessed recently is disproportionately likely to be accessed again soon) and SPATIAL locality (data near recently-accessed data is disproportionately likely to be accessed soon too). Without genuine locality in real access patterns, caching would provide little benefit, since a cache's whole value proposition depends on the assumption that keeping a SMALL subset of "hot" data in fast storage will actually satisfy a large fraction of real requests — an assumption that decades of empirical measurement across virtually every domain (CPU instruction/data access, web page requests, database queries) has consistently validated.

Caching's genuine difficulty, and the reason "cache invalidation" is famously cited as one of computer science's hardest problems, is that a cache is fundamentally a COPY of data that can diverge from its source of truth — the entire discipline of caching is about capturing locality's performance benefit while managing the genuine correctness risk that a stale copy introduces, a tension that recurs at every layer where caching is applied.
`,

  "problem-it-solves": `
Caching solves the **"how do we serve frequently- or recently-accessed data much faster than its original source could provide it, without simply moving ALL data to fast storage (which is too small/expensive to hold everything)"** problem.

Concretely, caching provides:

- **Dramatically reduced latency for repeated access**: serving a cached response (from RAM, or even a CPU register) is orders of magnitude faster than recomputing it or re-fetching it from disk, a network service, or a slow computation.
- **Reduced load on the original data source**: a well-hit cache absorbs a large fraction of requests that would otherwise reach a database, external API, or expensive computation, protecting that underlying resource from being overwhelmed.
- **A principled way to decide WHAT to keep cached** (eviction policies) when a cache's necessarily limited capacity is exceeded, based on well-understood heuristics (recency, frequency) that exploit locality of reference.
- **Reduced cost for expensive external dependencies**: caching LLM API responses, for instance, directly reduces per-token API costs for repeated or semantically similar queries, a genuinely significant, direct application to modern AI application economics.

What caching does **not** solve, or solves with a real tradeoff: caching introduces a genuine CORRECTNESS risk — a cached value can become stale (no longer reflecting the true current state of the underlying data), and correctly invalidating or refreshing stale cache entries is a notoriously difficult problem with no universal, one-size-fits-all solution; caching only helps when locality of reference genuinely exists in the actual access pattern — caching a workload with genuinely uniform, non-repeating access provides little to no benefit and adds pure overhead; and caching adds genuine architectural complexity (an additional component that can fail, additional consistency considerations) that must be weighed against its performance benefit for a given system's actual needs.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain locality of reference (temporal and spatial) and why it's the fundamental reason caching works.
2. Implement and compare common eviction policies: LRU, LFU, FIFO, and explain their respective tradeoffs.
3. Calculate and reason about cache hit ratio, and understand its direct relationship to overall system performance.
4. Explain write-through, write-back, and write-around caching policies and their consistency/performance tradeoffs.
5. Design a cache invalidation strategy appropriate for a given data's actual staleness tolerance.
6. Explain multi-level caching (CPU L1/L2/L3, browser/CDN/application caches) and why hierarchies of caches are common.
7. Recognize cache-related anti-patterns: cache stampede, unbounded cache growth, and inappropriate TTL choices.
8. Apply caching theory to real production systems: HTTP caching, database query caching, and LLM response caching.
9. Answer senior-level interview questions on cache design, eviction policy selection, and invalidation strategy tradeoffs.
`,

  prerequisites: `
- **Required**: the **Data Structures** skill — caching implementations (particularly LRU caches) directly combine hash tables and linked lists, both covered there.
- **Very helpful**: the **Operating Systems** skill for the CPU/memory page cache concepts this page builds on and extends.
- **Very helpful**: the **Redis** skill for a concrete, production-scale application of the theory covered here.
- **Helpful**: the **HTTP** and **CDN** skills for web-specific caching applications.

Dependency links: **Data Structures** → **Operating Systems** → this page → **Redis** for the concrete production implementation, and **Semantic Caching** (in this platform's Context Engineering category) for the AI-specific extension of these principles.
`,

  "beginner-concepts": `
### Locality of reference: why caching works at all

~~~
Temporal locality: data accessed RECENTLY is likely to be
    accessed again SOON (a user's profile, viewed once, is
    likely to be viewed again shortly after)
Spatial locality: data NEAR recently-accessed data is likely
    to be accessed soon too (reading array[5] makes array[6]
    likely to be read next)
~~~

Without genuine locality in real-world access patterns, caching a small subset of "hot" data wouldn't meaningfully help — the entire discipline exists specifically because real access patterns consistently exhibit strong locality, not uniform randomness.

### Cache hit ratio: the fundamental effectiveness metric

~~~
hit_ratio = cache_hits / (cache_hits + cache_misses)

If a cache serves 800 requests directly (hits) and forces 200
requests through to the slower underlying source (misses),
the hit ratio is 800 / 1000 = 80%.
~~~

Hit ratio is the single most important metric for evaluating a cache's effectiveness — a higher hit ratio means more requests are served quickly from the cache, directly reducing average latency and load on the underlying data source.

### A basic cache implementation

~~~python
cache = {}

def get_user(user_id):
    if user_id in cache:
        return cache[user_id]   -- CACHE HIT: fast path
    user = fetch_from_database(user_id)   -- CACHE MISS: slow path
    cache[user_id] = user
    return user
~~~

This simple pattern — check the cache first, fall back to the slow source on a miss, then populate the cache for next time — is the foundational shape of virtually every caching implementation, elaborated with eviction policies, expiration, and invalidation as genuine production needs demand.

### Basic eviction: why caches can't just grow forever

~~~
A cache has FINITE capacity (limited RAM, for instance) --
once it's full, adding a new entry requires EVICTING (removing)
an existing one. The eviction POLICY determines WHICH entry
gets removed, based on a heuristic exploiting locality of
reference (recency, frequency) to keep the entries MOST LIKELY
to be needed again soon.
~~~

### LRU (Least Recently Used) eviction, conceptually

~~~python
from collections import OrderedDict

class SimpleLRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return None
        self.cache.move_to_end(key)   -- mark as most recently used
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)   -- evict the LEAST recently used
~~~

LRU evicts whichever entry hasn't been accessed for the longest time, directly exploiting temporal locality's assumption that recently-used data is more likely to be needed again soon than data that hasn't been touched in a while.
`,

  "intermediate-concepts": `
### Comparing eviction policies

~~~
LRU (Least Recently Used): evict the entry not accessed for
    the longest time -- the most common, generally effective
    default, directly exploiting temporal locality
LFU (Least Frequently Used): evict the entry accessed the
    FEWEST total times -- better for workloads with stable
    "always popular" items, but can struggle to adapt when
    popularity shifts (an old, once-popular item's high count
    can keep it cached long after it's genuinely stopped being useful)
FIFO (First In, First Out): evict the OLDEST inserted entry,
    regardless of access pattern -- simplest to implement,
    but ignores actual usage entirely, generally less effective
    than LRU/LFU for typical real-world access patterns
~~~

No single eviction policy is universally best — LRU is the most commonly effective general-purpose default, but LFU can outperform it for workloads with a stable set of consistently popular items, while FIFO's simplicity trades away real effectiveness for workloads where actual access patterns matter.

### Write policies: how writes interact with a cache

~~~
Write-through: every write goes to BOTH the cache AND the
    underlying data source immediately, keeping them always
    consistent, at the cost of write latency (paying both costs
    on every write)
Write-back: writes go to the cache ONLY, with the underlying
    source updated later (asynchronously, or on eviction) --
    faster writes, but a genuine risk of DATA LOSS if the cache
    fails before the write is propagated to the underlying source
Write-around: writes go DIRECTLY to the underlying source,
    bypassing the cache entirely -- appropriate when written
    data isn't likely to be read again soon (avoiding polluting
    the cache with data that won't benefit from caching)
~~~

Choosing a write policy is a genuine consistency-versus-performance tradeoff, directly analogous to (and often combined with) the durability/consistency considerations covered in this platform's Databases category.

### Time-To-Live (TTL) based expiration

~~~python
import time

cache = {}

def get_with_ttl(key, ttl_seconds, fetch_function):
    if key in cache:
        value, timestamp = cache[key]
        if time.time() - timestamp < ttl_seconds:
            return value   -- still fresh
    value = fetch_function(key)
    cache[key] = (value, time.time())
    return value
~~~

TTL-based expiration proactively discards cached entries after a fixed duration, regardless of access pattern — a simple, widely-used mitigation for staleness, though choosing the RIGHT ttl_seconds value requires understanding the underlying data's actual staleness tolerance (a stock price needs a much shorter TTL than a user's registered country, for instance).

### Cache invalidation strategies

~~~
Proactive invalidation: explicitly remove/update a cache entry
    the MOMENT its underlying data changes -- most accurate, but
    requires the write path to know about and coordinate with
    every relevant cache
TTL-based expiration: accept some staleness, bounded by the
    TTL duration -- simpler, doesn't require write-path coordination,
    but genuinely stale data can be served for up to the TTL window
Cache-aside with explicit invalidation on write: the application
    updates the underlying source, then explicitly invalidates
    (or updates) the corresponding cache entry as part of the SAME
    write operation
~~~

"There are only two hard things in computer science: cache invalidation and naming things" (a widely-cited quip, often attributed to Phil Karlton) reflects genuine, hard-won engineering experience — correctly invalidating exactly the right cache entries at exactly the right time, across a distributed system with multiple cache layers, is a persistently difficult problem without a universal, simple solution.
`,

  "advanced-concepts": `
### Multi-level cache hierarchies

~~~mermaid
flowchart TB
    CPU["CPU"] --> L1["L1 Cache\n(smallest, fastest, ~1ns)"]
    L1 --> L2["L2 Cache\n(larger, slower, ~10ns)"]
    L2 --> L3["L3 Cache\n(larger still, ~30-50ns)"]
    L3 --> RAM["Main RAM\n(~100ns)"]
    RAM --> Disk["Disk\n(~10,000-100,000ns for SSD/HDD)"]
~~~

Modern computing systems layer MULTIPLE cache levels, each trading capacity for speed — a CPU checks L1 first, then L2, then L3, then main RAM, then disk, only paying the cost of a slower layer when a faster one misses; this same layered principle recurs at the application level (a browser cache, then a CDN cache, then an application cache like Redis, then the origin database).

### Cache stampede (thundering herd) and its mitigations

~~~
Problem: a popular cache entry EXPIRES (or is evicted), and
MANY concurrent requests simultaneously experience a cache
miss, all rushing to recompute/refetch the same expensive
data at once -- potentially overwhelming the underlying source
with redundant, simultaneous work that a single cache hit
would have avoided entirely.

Mitigations:
├── Request coalescing: only ONE of the simultaneous requests
│    actually triggers the recomputation; others wait for
│    and reuse that single result
├── Probabilistic early expiration: refresh a cache entry
│    slightly BEFORE its actual expiration, with some randomized
│    jitter, spreading refresh load over time rather than all
│    entries expiring simultaneously
└── Stale-while-revalidate: serve the (slightly) stale cached
     value immediately while asynchronously refreshing it in
     the background, avoiding a synchronous, blocking cache-miss
     penalty on the critical path
~~~

Cache stampede is a genuinely important, production-relevant failure mode — a cache that's WORKING WELL (high hit ratio) can create a severe, sudden load spike on its underlying source at the exact moment a popular entry expires, precisely because so many requests had been depending on that single cached entry.

### Cache coherence in distributed/multi-instance systems

~~~
When multiple application instances each maintain their OWN
local cache (rather than sharing one centralized cache like
Redis), a write on one instance doesn't automatically invalidate
the SAME data cached locally on other instances -- producing a
genuine cache coherence problem, directly analogous to CPU
cache coherence protocols (covered conceptually, not in depth,
here) but at the application/distributed-systems level.
~~~

This is a direct, practical connection to the **Distributed Systems** skill's own treatment of consistency challenges — application-level caching, once distributed across multiple instances, inherits genuine distributed consistency problems that a single, centralized cache (like a shared Redis instance) sidesteps by having one authoritative cached copy.

### Semantic caching for LLM applications

~~~
Traditional caching matches on EXACT key equality (the same
literal query string). Semantic caching (covered in this
platform's Context Engineering category) instead caches based
on SEMANTIC SIMILARITY -- recognizing that "What's the capital
of France?" and "Tell me France's capital city" are different
strings but semantically equivalent queries, potentially
serving a cached LLM response for BOTH without needing an
identical literal match.
~~~

Semantic caching extends this page's core caching theory (locality, hit ratio, eviction) to a genuinely novel matching criterion (embedding-based similarity rather than exact key equality), directly relevant to reducing LLM API cost and latency for AI applications with repeated or similar user queries.

### Belady's algorithm as the theoretical optimum

~~~
Bélády's algorithm evicts whichever cached entry will NOT be
needed for the LONGEST time in the future -- provably optimal,
but requires knowing the future access pattern in advance,
making it impossible to implement in practice for most real
systems. It serves as a THEORETICAL BENCHMARK: how close a
practical policy (LRU, LFU) gets to this unachievable ideal
is a standard way of evaluating real eviction policies'
effectiveness.
~~~
`,

  "internal-working": `
What happens internally when a CPU cache handles a memory access, tracing the hit/miss decision and multi-level fallback:

~~~mermaid
sequenceDiagram
    participant CPU
    participant L1
    participant L2
    participant L3
    participant RAM

    CPU->>L1: request memory address X
    alt L1 HIT
        L1-->>CPU: data returned immediately (~1ns)
    else L1 MISS
        L1->>L2: check L2
        alt L2 HIT
            L2-->>L1: data found, populate L1 too
            L1-->>CPU: data returned (~10ns)
        else L2 MISS
            L2->>L3: check L3
            alt L3 HIT
                L3-->>L2: data found, populate L2 and L1
                L1-->>CPU: data returned (~30-50ns)
            else L3 MISS
                L3->>RAM: fetch from main memory
                RAM-->>L3: data found, populate L3, L2, L1
                L1-->>CPU: data returned (~100ns)
            end
        end
    end
~~~

1. **Each cache level is checked in order, fastest first** — the CPU always tries the smallest, fastest cache (L1) before falling back to progressively larger, slower levels.
2. **A hit at any level populates the FASTER levels above it**, so a subsequent access to the same data will hit at the fastest level directly — this is precisely why data exhibiting locality of reference benefits so dramatically from a cache hierarchy.
3. **Only a complete miss across every cache level** requires the full-cost trip to main memory (or, at the application level, to a database or external API) — the cache hierarchy's entire value proposition is minimizing how often this expensive worst case actually occurs.

**Why this matters**: this exact same layered pattern (check the fastest, most local cache first; fall back progressively to slower, more authoritative sources; populate faster layers on a hit) recurs at every level of the technology stack this platform covers — browser caches, CDNs, application caches (Redis), and database query caches all implement variations of this same fundamental hierarchy, making this internal-working diagram directly transferable conceptual knowledge.
`,

  architecture: `
A senior engineer thinks about caching architecture across several dimensions: choosing an eviction policy and write strategy matched to the actual workload, designing invalidation strategies appropriate to the data's genuine staleness tolerance, and recognizing cache stampede and coherence risks before they manifest in production.

### The caching decision framework

~~~mermaid
flowchart TB
    Q1{"Does the actual access\npattern exhibit genuine\nlocality of reference?"}
    Q1 -->|No, genuinely uniform/random access| SkipCache["Caching won't help much --\nadds overhead without benefit"]
    Q1 -->|Yes| Q2{"How tolerant is this data\nof being slightly stale?"}
    Q2 -->|"Very tolerant\n(rarely-changing reference data)"| LongTTL["Long TTL, or proactive\ninvalidation on write, simple caching"]
    Q2 -->|"Genuinely low tolerance\n(financial balances, security state)"| CarefulInvalidation["Write-through or proactive\ninvalidation, shorter TTL,\ngenuine correctness discipline"]
~~~

This framework — starting from whether locality genuinely exists, then reasoning explicitly about staleness tolerance — is the single most valuable practical caching design skill, preventing both under-caching (missing genuine performance opportunities) and over-caching (introducing correctness risk for data that can't tolerate staleness).

### Designing for cache stampede resilience

~~~mermaid
flowchart LR
    ExpiringEntry["A popular cache entry\napproaching expiration"] --> Mitigation{"Mitigation strategy"}
    Mitigation --> Coalescing["Request coalescing:\nonly ONE request recomputes"]
    Mitigation --> Jitter["Probabilistic early refresh\nwith randomized jitter"]
    Mitigation --> StaleWhileRevalidate["Serve stale, refresh\nasynchronously in the background"]
~~~

A senior engineer designs explicitly for cache stampede resilience for any high-traffic, high-hit-ratio cache entry, recognizing that a well-functioning cache's biggest single risk is precisely the moment a popular entry expires or is evicted.

### Multi-level, multi-layer caching architecture

~~~mermaid
flowchart LR
    Client --> Browser["Browser cache"]
    Browser --> CDN["CDN cache"]
    CDN --> AppCache["Application cache\n(Redis)"]
    AppCache --> Database["Database\n(possibly with its own\nquery cache)"]
~~~

Production web architectures commonly layer MULTIPLE caching levels (browser, CDN, application, database), each serving a different portion of overall traffic and each requiring its own appropriate eviction/invalidation strategy — directly connecting to this platform's **CDN** skill for the specific infrastructure-level application of these principles.
`,

  "data-flow": `
Tracing a request through a multi-level cache hierarchy, from a client request to the ultimate data source:

~~~mermaid
sequenceDiagram
    participant Client
    participant CDN
    participant AppCache as Application cache (Redis)
    participant DB as Database

    Client->>CDN: GET /api/product/42
    alt CDN cache HIT
        CDN-->>Client: cached response (fastest path)
    else CDN cache MISS
        CDN->>AppCache: forward request
        alt Redis cache HIT
            AppCache-->>CDN: cached data
            CDN-->>Client: response (CDN caches this for next time)
        else Redis cache MISS
            AppCache->>DB: query the database
            DB-->>AppCache: result
            AppCache->>AppCache: populate Redis cache for next time
            AppCache-->>CDN: data
            CDN-->>Client: response (CDN caches this too)
        end
    end
~~~

The critical detail: a MISS at each level populates that level's cache for future requests, meaning the SECOND identical request (even from a different client) is progressively more likely to hit at an earlier, faster layer — this is precisely why a well-designed multi-level cache hierarchy can achieve dramatically better AGGREGATE performance across many requests than any single cache layer alone, since each layer absorbs and protects against load reaching the slower layers beneath it.
`,

  "production-usage": `
### Implementing cache-aside with explicit invalidation

~~~python
import redis

r = redis.Redis()

def get_product(product_id):
    cached = r.get("product:" + str(product_id))
    if cached:
        return deserialize(cached)
    product = fetch_from_database(product_id)
    r.setex("product:" + str(product_id), 3600, serialize(product))   -- cache with a 1-hour TTL
    return product

def update_product(product_id, new_data):
    update_database(product_id, new_data)
    r.delete("product:" + str(product_id))   -- invalidate the stale cache entry immediately
~~~

This "cache-aside" pattern (the application explicitly manages checking, populating, and invalidating the cache) combined with an appropriate TTL as a safety net is one of the most common, production-proven caching architectures, covered in concrete depth in the **Redis** skill.

### Non-negotiables for production caching

1. **Verify genuine locality of reference exists** in the actual access pattern before investing in caching infrastructure.
2. **Choose a TTL/invalidation strategy matched to the data's actual staleness tolerance**, not a default value applied uniformly regardless of data sensitivity.
3. **Design for cache stampede resilience** on any high-traffic, high-hit-ratio cache entry.
4. **Monitor cache hit ratio explicitly**, as the primary signal of whether caching is actually providing its intended benefit.
5. **Invalidate proactively on write** for data with genuinely low staleness tolerance, rather than relying solely on TTL expiration.

### Common production patterns

- **Cache-aside** (application manages cache population/invalidation explicitly) as the most common general-purpose pattern.
- **HTTP caching** (Cache-Control headers, ETags, covered in the **REST** skill) as a transparent, protocol-native application of these same principles.
- **Database query result caching**, reducing repeated, expensive query execution for frequently-requested, infrequently-changing data.
- **Semantic caching for LLM responses** (covered in this platform's Context Engineering category), extending these principles to similarity-based rather than exact-match caching.
`,

  "industry-examples": `
- **Every modern CPU's L1/L2/L3 cache hierarchy**: the most foundational, hardware-level application of caching theory, directly underlying all computing performance.
- **Content Delivery Networks** (Cloudflare, Akamai, Fastly, covered in the **CDN** skill): caching content geographically close to end users, a massive-scale application of locality of reference applied to network distance rather than just access recency.
- **Redis** (covered in its own skill): the dominant production in-memory caching layer for web applications, implementing LRU/LFU eviction and various TTL/expiration strategies directly.
- **Every major web browser's HTTP cache**: transparently caching static assets and API responses per server-provided Cache-Control headers, a widely-encountered, everyday application of this page's principles.
- **Database query caches** (built into many database engines, or implemented at the application layer): caching frequently-executed, expensive query results.
- **LLM provider and application-level response caching**: an increasingly common, directly AI-relevant application reducing both latency and per-token API cost for repeated or similar queries.
`,

  "best-practices": `
1. **Verify genuine locality of reference exists** before investing in caching infrastructure — caching a uniformly random access pattern provides little benefit.
2. **Choose an eviction policy matched to the actual access pattern** — LRU as a strong general default, LFU for workloads with stable, consistently popular items.
3. **Match TTL/invalidation strategy to the data's actual staleness tolerance**, not a uniform default applied regardless of data sensitivity.
4. **Design explicitly for cache stampede resilience** on high-traffic cache entries, using request coalescing, jittered expiration, or stale-while-revalidate.
5. **Invalidate proactively on write for genuinely staleness-intolerant data**, rather than relying solely on TTL expiration.
6. **Monitor cache hit ratio as the primary effectiveness signal**, investigating and addressing unexpectedly low hit ratios.
7. **Use multi-level caching deliberately** where genuinely warranted (browser, CDN, application, database), understanding each layer's specific role.
8. **Size caches based on actual working-set analysis**, not an arbitrary capacity guess.
9. **Consider write policy (write-through, write-back, write-around) deliberately** based on the actual consistency/performance tradeoff needed.
10. **Test cache invalidation logic explicitly**, since a subtle invalidation bug can silently serve stale data for an extended period without any obvious error.
`,

  "anti-patterns": `
### Caching data without genuine locality of reference

~~~python
# WRONG — caching results for genuinely unique, one-time-use
# queries (e.g., a randomly-generated report ID never requested again)
# adds cache management overhead with essentially zero hit ratio benefit
cache = {}
def get_one_time_report(unique_report_id):
    if unique_report_id in cache:   -- will almost NEVER hit
        return cache[unique_report_id]
    ...

# RIGHT — recognize when caching genuinely won't help and skip it
def get_one_time_report(unique_report_id):
    return generate_report(unique_report_id)   -- no caching overhead for data with no locality
~~~

Caching data whose actual access pattern lacks genuine locality of reference adds real overhead (memory usage, cache management logic) without a corresponding hit-ratio benefit — a common mistake stemming from treating caching as a default "just add it, it can only help" optimization rather than a deliberate architectural decision.

### Unbounded cache growth

~~~python
# WRONG — a cache with no eviction policy or size limit at all,
# eventually consuming unbounded memory
cache = {}
def get_data(key):
    if key not in cache:
        cache[key] = expensive_fetch(key)   -- NEVER evicts anything, grows forever
    return cache[key]

# RIGHT — bound the cache size explicitly with an appropriate eviction policy
from functools import lru_cache
@lru_cache(maxsize=1000)   -- explicit capacity limit with LRU eviction
def get_data(key):
    return expensive_fetch(key)
~~~

An unbounded cache is a genuine, common production memory leak — every cache needs an explicit size limit and eviction policy, since real systems have finite memory and real workloads' key spaces are often much larger than what should reasonably be kept cached simultaneously.

### Other production-grade anti-patterns

- **Not designing for cache stampede**, letting a popular entry's expiration cause a sudden, severe load spike on the underlying data source.
- **Choosing a TTL uniformly across all data** regardless of actual staleness tolerance, either serving unacceptably stale critical data or unnecessarily refetching stable data too frequently.
- **Not invalidating cache entries on write** for data with genuine staleness intolerance, relying solely on TTL expiration and accepting a stale-data window that isn't actually acceptable.
- **Not monitoring cache hit ratio**, missing signs that a cache isn't actually providing its intended benefit (a poor eviction policy choice, or genuinely low locality in the actual workload).
- **Ignoring cache coherence in multi-instance deployments**, where each instance's local cache can silently diverge from the true underlying data state.
`,

  performance: `
### Rule zero: verify locality of reference before investing in caching at all

If the actual access pattern is genuinely uniform/random, caching adds overhead without a corresponding benefit — always verify this assumption before building caching infrastructure.

### The performance hierarchy (apply in order)

1. **Choose an eviction policy matched to the actual access pattern**, verified empirically where possible (LRU as a strong general default).
2. **Size the cache based on genuine working-set analysis**, not an arbitrary guess — too small a cache thrashes (constant eviction and re-fetching), too large wastes memory.
3. **Design for cache stampede resilience** on high-traffic entries, since a well-hit cache's biggest performance risk is precisely at the moment a popular entry expires.
4. **Use multi-level caching where genuinely warranted**, letting each layer absorb load before it reaches slower layers beneath.
5. **Monitor hit ratio continuously**, treating a declining hit ratio as an early signal requiring investigation (a changed access pattern, an undersized cache, a poorly-chosen eviction policy).

### Micro-level facts worth knowing

- Cache hit ratio has a direct, often dramatic relationship to overall system latency — even a modest improvement in hit ratio (from 80% to 90%, for instance) can meaningfully reduce average latency, since misses typically cost orders of magnitude more than hits.
- A cache that's too small for the actual working set can "thrash" (constantly evicting entries that are about to be needed again), sometimes performing WORSE than no caching at all due to the added management overhead without a corresponding hit-ratio benefit.
- Serialization/deserialization cost for cached values (particularly for complex objects) can itself become a meaningful performance factor, worth profiling for genuinely high-throughput caching layers.
`,

  scalability: `
Caching is itself one of the most fundamental, broadly-applicable scalability techniques, but caching infrastructure has its own scaling considerations as load grows.

### Caching as THE fundamental scalability lever

~~~mermaid
flowchart LR
    HighLoad["High request volume"] --> Cache["A well-hit cache"]
    Cache --> ReducedLoad["Dramatically reduced load\nreaching the underlying,\nharder-to-scale data source"]
~~~

A well-designed cache is often the single highest-leverage scalability improvement available for a read-heavy system, since it can absorb the overwhelming majority of traffic before it ever reaches a harder-to-horizontally-scale resource (a relational database, an external API with rate limits).

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A single cache instance's memory capacity exceeded | Distributed caching (sharding a cache across multiple instances), covered in the **Redis** skill |
| Cache stampede on popular entry expiration | Request coalescing, jittered expiration, or stale-while-revalidate |
| Cache coherence issues across multiple application instances with local caches | Migrate to a centralized, shared cache (Redis) rather than per-instance local caching |
| Declining hit ratio as the workload's key space grows | Re-evaluate cache sizing and eviction policy against the current working set |
| Serialization overhead for complex cached objects at high throughput | Profile and optimize serialization format, or cache smaller, pre-computed representations |
`,

  security: `
### Cache poisoning and cache-based information disclosure

~~~
Cache poisoning: an attacker manipulates a shared cache (a CDN,
    a reverse proxy cache) into storing and serving MALICIOUS or
    incorrect content to OTHER users, exploiting how the cache
    key is computed (e.g., not accounting for a header that
    should have made two requests genuinely distinct)
Information disclosure via shared caches: a cache shared across
    multiple users (a CDN, a reverse proxy) that INCORRECTLY
    caches a response containing user-specific data can leak
    one user's private information to a different user requesting
    the same (incorrectly cached) URL
~~~

Both are genuine, historically-exploited vulnerability classes specifically rooted in caching's core mechanism — a cache key that doesn't correctly account for every dimension that should make two requests distinct (a missing Vary header, for instance) can cause a shared cache to serve one user's private or malicious content to another.

### Essential caching-related security practices

1. **Never cache user-specific, sensitive data in a SHARED cache** (a CDN, a shared reverse proxy) without correctly scoping the cache key to that specific user.
2. **Carefully validate what request dimensions the cache key accounts for**, ensuring genuinely distinct requests (different users, different auth states) produce genuinely distinct cache entries.
3. **Set appropriate Cache-Control headers explicitly** (private versus public, no-store for genuinely sensitive responses) rather than relying on default caching behavior.
4. **Be aware of cache poisoning attack vectors** specifically for any caching layer under partial attacker influence (a CDN caching based on a header an attacker can control).

See the **OWASP Top 10** and **CDN** skills for the broader security context this connects to.
`,

  testing: `
### Testing cache hit/miss behavior explicitly

~~~python
def test_cache_hit_returns_cached_value_without_refetching():
    mock_fetch = Mock(return_value="data")
    cache = Cache(fetch_function=mock_fetch)
    cache.get("key1")   -- first call: miss, fetches and caches
    cache.get("key1")   -- second call: should HIT, not fetch again
    assert mock_fetch.call_count == 1   -- verifies the cache actually prevented a second fetch

def test_cache_invalidation_removes_stale_entry():
    cache.put("key1", "old_value")
    cache.invalidate("key1")
    assert cache.get("key1") is None   -- confirms the invalidated entry is genuinely gone
~~~

### Testing eviction policy behavior

~~~python
def test_lru_evicts_least_recently_used():
    cache = LRUCache(capacity=2)
    cache.put(1, "a")
    cache.put(2, "b")
    cache.get(1)          -- access 1, making 2 the least recently used
    cache.put(3, "c")      -- should evict 2, not 1
    assert cache.get(2) is None
    assert cache.get(1) == "a"
~~~

### The senior testing doctrine

- Test that a cache genuinely prevents redundant work on a hit (verifying the underlying fetch function is called exactly once for repeated identical requests), not just that the returned value is correct.
- Test eviction policy behavior explicitly under a sequence of operations designed to exercise the specific eviction logic.
- Test invalidation correctness explicitly, confirming a write correctly invalidates or updates exactly the right cache entries, not more or fewer.
- Test cache stampede mitigation logic (request coalescing, for instance) under simulated concurrent load.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check the cache hit ratio first** for any performance investigation involving a caching layer, since a low hit ratio directly explains poor performance despite caching being present.
2. **Verify the cache key computation** if stale or incorrect data is being served, checking whether the key correctly captures every dimension that should make requests distinct.
3. **Check TTL and invalidation logic explicitly** if genuinely stale data is observed, confirming writes are correctly triggering invalidation where expected.
4. **Profile for cache stampede symptoms** (a sudden load spike on the underlying source correlating with a popular cache entry's expiration time) if periodic load spikes are observed.
5. **Check for cache coherence issues** across multiple instances if inconsistent behavior is observed depending on which instance serves a request.

### Debugging common caching-specific symptoms

- "Performance is poor despite having a cache" — check the actual hit ratio; a low hit ratio (genuinely low locality, an undersized cache, or a poor eviction policy) directly explains this.
- "Stale data is being served after an update" — check invalidation logic explicitly; verify the write path actually triggers the expected cache invalidation/update.
- "Periodic load spikes on the database correlate with cache entry expiration" — a cache stampede; implement request coalescing or stale-while-revalidate.
- "Different users see each other's cached data" — a serious cache key scoping bug; verify the cache key correctly incorporates user-specific dimensions for any per-user data.
`,

  monitoring: `
### Key signals to track

- **Cache hit ratio**, the single most important caching effectiveness metric, tracked over time to catch degradation early.
- **Cache size/memory usage**, relative to configured capacity, to understand whether the cache is appropriately sized for the actual working set.
- **Eviction rate**, a high eviction rate relative to insertion rate suggesting the cache may be undersized for its working set.
- **Latency for cache hits versus misses separately**, quantifying the actual performance benefit the cache is providing.

### Tools

Redis's own built-in metrics (covered in the **Redis** skill) for production application-level caching; CDN provider dashboards for edge-cache hit ratio and performance; standard APM tools instrumented with cache-specific custom metrics for application-level caching layers.

### Alerting priorities

Alert on declining cache hit ratio (an early signal of a changing access pattern, an undersized cache, or an eviction policy mismatch), on cache memory usage approaching capacity limits, and on latency spikes correlating with cache entry expiration patterns (a cache stampede signal).
`,

  deployment: `
### Configuring cache size and eviction policy for deployment

~~~python
# A Redis deployment explicitly configuring memory limit and
# eviction policy, rather than accepting defaults blindly
# maxmemory 2gb
# maxmemory-policy allkeys-lru
~~~

Production cache deployments should explicitly configure memory limits and eviction policy (rather than accepting defaults), based on genuine working-set analysis and the actual workload's access pattern characteristics.

### CI/CD pipeline considerations

Load testing that specifically measures cache hit ratio under realistic traffic patterns (not just functional correctness) before production deployment, catching cache-sizing or eviction-policy mismatches before they manifest under real load. See the **CI/CD** and **Redis** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production caching layer takes real traffic:

- [ ] Genuine locality of reference verified in the actual access pattern before investing in caching infrastructure
- [ ] Eviction policy chosen deliberately (LRU as a strong default), matched to the actual access pattern
- [ ] Cache size configured explicitly based on genuine working-set analysis, not an arbitrary default
- [ ] TTL/invalidation strategy matched to the specific data's actual staleness tolerance
- [ ] Cache stampede mitigation (request coalescing, jittered expiration, or stale-while-revalidate) designed for high-traffic entries
- [ ] Proactive invalidation on write implemented for genuinely staleness-intolerant data
- [ ] Cache key scoping verified correct for any per-user or per-context data, preventing cross-user information disclosure
- [ ] Monitoring in place for hit ratio, memory usage, and eviction rate
- [ ] Cache coherence considered explicitly for any multi-instance deployment with local (non-shared) caches
- [ ] Security review completed for shared caches (CDN, reverse proxy) handling any user-specific or sensitive data
`,

  "common-mistakes": `
1. **Caching data without verifying genuine locality of reference exists**, adding overhead without a corresponding hit-ratio benefit.
2. **Unbounded cache growth**, a genuine, common production memory leak from missing size limits and eviction policy.
3. **Not designing for cache stampede**, letting a popular entry's expiration cause a sudden, severe load spike.
4. **Applying a uniform TTL regardless of actual staleness tolerance**, either serving unacceptably stale critical data or unnecessarily refetching stable data.
5. **Not invalidating on write for staleness-intolerant data**, relying solely on TTL expiration when that's genuinely insufficient.
6. **Not monitoring cache hit ratio**, missing clear signals of caching ineffectiveness.
7. **Incorrect cache key scoping for per-user data**, risking serious cross-user information disclosure in shared caches.
8. **Ignoring cache coherence in multi-instance deployments** with local, non-shared caches.
9. **Choosing an eviction policy without considering the actual access pattern**, defaulting to LRU without verifying it's genuinely the right fit.
10. **Not testing invalidation logic explicitly**, allowing subtle bugs to silently serve stale data for extended periods.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Stale data served after an update | Missing or broken cache invalidation on write | Verify and fix the write path's invalidation logic explicitly |
| Sudden load spike on the underlying data source | Cache stampede from a popular entry's simultaneous expiration | Implement request coalescing, jittered expiration, or stale-while-revalidate |
| Unbounded memory growth in a caching layer | Missing size limit/eviction policy | Configure an explicit capacity limit with an appropriate eviction policy |
| One user sees another user's cached data | Cache key not correctly scoped to user-specific context | Verify the cache key incorporates every dimension (user ID, auth state) that should make requests distinct |
| Cache hit ratio unexpectedly low | Genuinely low locality in the actual access pattern, an undersized cache, or a poorly-matched eviction policy | Investigate the actual access pattern; adjust sizing or eviction policy accordingly |
| Inconsistent behavior across application instances | Cache coherence issue — each instance maintaining its own local, unsynchronized cache | Migrate to a centralized, shared cache (Redis) rather than per-instance local caching |
| Cache performing worse than no caching at all | Cache thrashing — the cache is too small for the actual working set, constantly evicting soon-to-be-needed entries | Increase cache size to genuinely match the working set, or reconsider whether caching fits this workload |
`,

  faqs: `
**Why does caching actually work?**
Because real-world access patterns exhibit genuine locality of reference (temporal: recently-accessed data is likely to be accessed again soon; spatial: nearby data is likely to be accessed soon too) — without this empirical property, keeping a small subset of data in fast storage wouldn't meaningfully help.

**Which eviction policy should I use?**
LRU (Least Recently Used) is a strong, generally effective default for most workloads; LFU can outperform it specifically for workloads with a stable set of consistently popular items; FIFO is simplest but generally less effective since it ignores actual access patterns entirely.

**What is cache invalidation, and why is it considered so hard?**
It's the problem of knowing when a cached value has become stale (no longer matching the true current state of the underlying data) and needs to be refreshed or removed — it's hard because correctly invalidating exactly the right entries at exactly the right time, especially across multiple cache layers or distributed cache instances, has no universal, simple solution and depends heavily on the specific data and system architecture.

**What is a cache stampede, and how do I prevent it?**
It's when a popular cache entry expires (or is evicted) and many concurrent requests simultaneously experience a cache miss, all rushing to recompute the same expensive data at once, potentially overwhelming the underlying source — prevented via request coalescing (only one request recomputes, others wait and reuse the result), probabilistic early expiration with jitter, or stale-while-revalidate (serving the slightly-stale value while refreshing in the background).

**Should I always add caching to improve performance?**
No — caching only helps when the actual access pattern genuinely exhibits locality of reference; caching genuinely unique, one-time-use data adds management overhead without a corresponding hit-ratio benefit, and caching introduces genuine correctness risk (staleness) that must be weighed against its performance benefit for each specific use case.

**How does semantic caching for LLM applications relate to this page's traditional caching theory?**
Directly — semantic caching (covered in this platform's Context Engineering category) extends the same fundamental principles (locality of reference, hit ratio, eviction) to a novel matching criterion: recognizing semantically SIMILAR queries (via embedding-based similarity) rather than requiring exact literal key equality, letting a cached LLM response serve multiple differently-worded but equivalent user queries.
`,

  "interview-questions": `
### Junior level

1. **What is locality of reference, and why does it matter for caching?**
   Model answer: the empirical observation that recently-accessed data (temporal locality) or data near recently-accessed data (spatial locality) is disproportionately likely to be accessed again soon — this is the fundamental reason caching a small subset of "hot" data can serve a large fraction of real requests.

2. **What is cache hit ratio, and how is it calculated?**
   Model answer: the fraction of requests served directly from the cache versus falling through to the slower underlying source — calculated as cache hits divided by total requests (hits plus misses); it's the primary metric for evaluating a cache's effectiveness.

3. **What does the LRU eviction policy do?**
   Model answer: it evicts whichever cached entry hasn't been accessed for the longest time, directly exploiting temporal locality's assumption that recently-used data is more likely to be needed again soon.

4. **What is the difference between write-through and write-back caching?**
   Model answer: write-through writes to both the cache and the underlying source immediately, keeping them always consistent at the cost of write latency; write-back writes to the cache only, updating the underlying source later, offering faster writes at the risk of data loss if the cache fails before propagation.

5. **What is a TTL (Time-To-Live) in the context of caching?**
   Model answer: a fixed duration after which a cached entry is considered stale and discarded/refreshed, regardless of access pattern — a simple, widely-used mitigation for staleness.

### Senior level

6. **Explain cache stampede and describe at least two mitigation strategies.**
   Model answer: cache stampede occurs when a popular cache entry expires (or is evicted) and many concurrent requests simultaneously experience a cache miss, all rushing to recompute the same expensive data at once, potentially overwhelming the underlying source; mitigations include request coalescing (only one request actually recomputes, others wait for and reuse that result) and stale-while-revalidate (serving the slightly-stale cached value immediately while asynchronously refreshing it in the background, avoiding a synchronous cache-miss penalty).

7. **Why is cache invalidation considered one of the hardest problems in computer science?**
   Model answer: correctly determining exactly when a cached value has become stale, and correctly invalidating exactly the right entries at exactly the right time, becomes genuinely difficult once a system has multiple cache layers, distributed cache instances, or complex data relationships (where updating one piece of data might implicitly invalidate several related cache entries) — there's no universal, simple algorithm that correctly handles invalidation for every possible data model and access pattern, making it a persistent, context-specific engineering challenge rather than a solved problem.

8. **How would you design a cache key scheme to avoid a serious security vulnerability involving shared caches?**
   Model answer: ensure the cache key correctly incorporates EVERY dimension that should make two requests genuinely distinct — critically, for any user-specific or authentication-dependent data, the cache key must include the user's identity or session context; failing to do so in a SHARED cache (a CDN, a reverse proxy) can cause one user's private, cached response to be served to a different user requesting the same URL, a serious information disclosure vulnerability.

9. **Compare LRU and LFU eviction policies and describe a scenario where LFU would outperform LRU.**
   Model answer: LRU evicts based on recency (least recently accessed), while LFU evicts based on total access frequency (least frequently accessed overall); LFU can outperform LRU for a workload with a stable set of consistently popular items alongside frequent one-off accesses to less popular items — LRU might evict a genuinely popular item simply because it wasn't the MOST recent access, while LFU would correctly retain it based on its high overall access frequency; however, LFU can struggle to adapt when popularity genuinely shifts, since an old item's accumulated high frequency count can keep it cached long after it's stopped being useful.

10. **Explain the relationship between a CPU's multi-level cache hierarchy (L1/L2/L3) and application-level multi-layer caching (browser/CDN/Redis/database).**
    Model answer: both apply the exact same underlying principle — check the fastest, most local cache first, falling back progressively to slower, more authoritative sources only on a miss, and populating faster layers on a hit so subsequent access is even faster; the CPU hierarchy applies this to hardware memory access latency differences (nanoseconds), while the application-level hierarchy applies the identical structural pattern to network/computation latency differences (milliseconds to seconds), demonstrating the principle's genuine universality across dramatically different scales and technologies.

11. **How does semantic caching for LLM applications extend traditional caching theory, and what new challenge does it introduce?**
    Model answer: traditional caching matches on exact key equality; semantic caching instead matches on semantic SIMILARITY (via embedding-based comparison), recognizing that differently-worded queries can be equivalent in meaning and could share a cached response — this extends caching's core value (avoiding redundant expensive computation, here an LLM API call) to a broader class of "equivalent" requests, but introduces a genuinely new challenge: choosing an appropriate similarity THRESHOLD (how similar is similar enough to reuse a cached response) is a nuanced tradeoff, since too loose a threshold risks serving a genuinely incorrect or irrelevant cached response for a subtly different query.

12. **Design a caching strategy for a system with both frequently-changing financial data and rarely-changing user profile data.**
    Model answer: for financial data (genuinely low staleness tolerance), use either a very short TTL or, better, proactive invalidation on write (immediately updating/invalidating the cache entry whenever the underlying financial data changes), possibly combined with write-through caching to guarantee consistency; for user profile data (genuinely high staleness tolerance, rarely changes), use a much longer TTL or rely primarily on proactive invalidation on the infrequent writes, since the cost of occasionally serving slightly-stale profile data is low relative to the performance benefit of a long-lived cache entry — the key design principle is matching each data type's specific staleness tolerance to an appropriately tailored strategy, not applying one uniform policy across genuinely different data with genuinely different correctness requirements.
`,

  "coding-questions": `
### 1. Implement an LRU cache with O(1) operations (combining a hash table and doubly linked list)

~~~python
class Node:
    def __init__(self, key, value):
        self.key, self.value = key, value
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.head = Node(None, None)
        self.tail = Node(None, None)
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_to_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)
        return node.value

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
# Follow-up: why does combining a hash table (O(1) lookup) with a
# doubly linked list (O(1) reordering and removal, given a direct
# node reference) achieve O(1) for EVERY operation, when neither
# structure alone could provide this for all three (get, put, evict)?
~~~

### 2. Implement TTL-based expiration with lazy cleanup

~~~python
import time

class TTLCache:
    def __init__(self):
        self.store = {}

    def put(self, key, value, ttl_seconds):
        expiry = time.time() + ttl_seconds
        self.store[key] = (value, expiry)

    def get(self, key):
        if key not in self.store:
            return None
        value, expiry = self.store[key]
        if time.time() > expiry:
            del self.store[key]   -- lazy cleanup: only remove when actually accessed
            return None
        return value
# Follow-up: what is the tradeoff of this "lazy cleanup" approach
# (only removing expired entries when accessed) compared to an
# "active cleanup" approach (a background thread periodically
# scanning and removing expired entries), and when would each be preferable?
~~~

### 3. Implement request coalescing to prevent cache stampede

~~~python
import threading

class CoalescingCache:
    def __init__(self, fetch_function):
        self.fetch_function = fetch_function
        self.cache = {}
        self.in_flight = {}
        self.lock = threading.Lock()

    def get(self, key):
        with self.lock:
            if key in self.cache:
                return self.cache[key]
            if key in self.in_flight:
                event = self.in_flight[key]
            else:
                event = threading.Event()
                self.in_flight[key] = event
                should_fetch = True
        if 'should_fetch' in dir() and should_fetch:
            value = self.fetch_function(key)
            with self.lock:
                self.cache[key] = value
                del self.in_flight[key]
                event.set()
            return value
        event.wait()
        return self.cache[key]
# Follow-up: why does this pattern ensure that even if 100 threads
# call get() for the SAME expired/missing key simultaneously, the
# expensive fetch_function is called only ONCE, with the other 99
# threads waiting for and reusing that single result?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement and measure cache hit ratio
Build a basic cache-aside implementation wrapping a simulated slow data source, generate a realistic access pattern with genuine locality, and measure the actual cache hit ratio achieved. Deliverable: a working cache with measured hit ratio results. Skills exercised: basic caching implementation, hit ratio measurement.

### Lab 2 (Intermediate): Compare eviction policies empirically
Implement LRU, LFU, and FIFO eviction policies, then benchmark all three against several different synthetic access patterns (some with stable popular items, some with shifting popularity), documenting which policy performs best for each pattern. Deliverable: a comparative benchmark across access patterns. Skills exercised: eviction policy implementation, empirical comparison.

### Lab 3 (Advanced): Implement and test cache stampede mitigation
Build a cache experiencing a deliberate stampede scenario (many concurrent requests for an expiring key), then implement and verify request coalescing correctly reduces the underlying fetch calls to exactly one despite the concurrent requests. Deliverable: a before/after demonstration of stampede mitigation. Skills exercised: cache stampede diagnosis, request coalescing implementation.

### Lab 4 (Production): Build a multi-level cache with proactive invalidation
Implement a two-level cache (an in-memory local cache backed by a simulated shared cache), with proactive invalidation on write correctly propagating through both levels, and TTL-based expiration as a safety net. Deliverable: a working multi-level cache with tested invalidation correctness. Skills exercised: multi-level caching, invalidation strategy design.
`,

  "real-projects": `
### 1. A read-heavy API's caching layer
Engineering requirements: a cache-aside caching layer for a read-heavy API (a product catalog, for instance), with an appropriately-sized LRU cache, proactive invalidation on write, and cache stampede mitigation for the most frequently-requested items.

### 2. A CDN-style edge caching configuration for a content delivery use case
Engineering requirements: appropriate Cache-Control header configuration distinguishing genuinely public, cacheable content from private, user-specific content, with correct cache key scoping to prevent cross-user information disclosure, directly connecting to this platform's **CDN** and **REST** skills.

### 3. A semantic cache for an LLM-powered application
Engineering requirements: an embedding-based similarity cache for LLM responses, with a carefully-tuned similarity threshold, appropriate TTL for the underlying model/data's actual staleness tolerance, and monitoring for the specific hit ratio this novel caching approach achieves — directly connecting to this platform's Context Engineering category.
`,

  "case-studies": `
### Bélády's algorithm as an enduring theoretical benchmark
László Bélády's 1970 optimal (but practically unimplementable, since it requires knowing the future) page replacement algorithm remains, more than five decades later, the standard theoretical benchmark against which practical eviction policies (LRU, LFU, and their many variants) are evaluated — illustrating how a theoretically pure, even if practically unachievable, ideal can remain genuinely useful as a reference point for measuring how close real, practical algorithms come to optimal behavior. Lesson: an unimplementable theoretical ideal isn't merely academic — it provides a durable, useful yardstick for evaluating and comparing practical approximations across decades of subsequent engineering work.

### CDNs applying locality of reference to geographic distance
Content Delivery Networks' foundational insight — applying caching's core locality principle not just to TIME (recent access) but to GEOGRAPHIC DISTANCE (caching content physically closer to where it's likely to be requested) — demonstrates how a general principle (locality-based caching) can be creatively extended to an entirely different dimension of "distance" (network/physical distance rather than purely temporal recency) with enormous practical impact at internet scale. Lesson: a fundamental principle's genuine power often lies in its extensibility to new dimensions and contexts its original formulation didn't explicitly anticipate.

### Cache invalidation's enduring reputation as one of computing's hardest problems
The widely-cited engineering quip "there are only two hard things in computer science: cache invalidation and naming things" (often attributed to Phil Karlton) has remained a resonant, frequently-invoked piece of engineering folklore for decades, reflecting genuinely shared, hard-won experience across the industry with how difficult correctly invalidating cached data reliably turns out to be in practice, especially as systems grow more distributed and cache layers multiply. Lesson: some engineering problems remain genuinely difficult not because the underlying concept is complex to STATE, but because correctly and completely handling every edge case in a specific real system's actual architecture requires deep, context-specific engineering judgment that no universal algorithm can fully automate.
`,

  comparisons: `
| Aspect | LRU | LFU | FIFO |
|--------|-----|-----|------|
| Eviction basis | Least recently accessed | Least frequently accessed (total count) | Oldest inserted |
| Adapts to changing popularity | Yes, naturally | Can struggle — high historical count persists | No — ignores access pattern entirely |
| Implementation complexity | Moderate (hash table + doubly linked list) | Higher (requires frequency tracking) | Low (simple queue) |
| Best fit | General-purpose default, most workloads | Stable, consistently popular item sets | Simplicity valued over actual effectiveness |

| Aspect | Write-Through | Write-Back | Write-Around |
|--------|-----------------|--------------|-----------------|
| Consistency | Always consistent | Temporary inconsistency risk | Always consistent (cache bypassed) |
| Write latency | Higher (pays both costs) | Lower (cache only, initially) | Depends on underlying source alone |
| Data loss risk | None | Real, if cache fails before propagation | None |
| Best fit | Genuine strong consistency needs | Write-heavy workloads tolerating some risk | Data unlikely to be read again soon |

**How seniors choose**: use LRU as a strong general-purpose eviction default, reserving LFU for workloads with genuinely stable popular-item patterns; choose write-through for strong consistency needs, write-back for write-heavy workloads that can tolerate some risk, and write-around for data unlikely to benefit from being cached at all.
`,

  "related-technologies": `
- **Data Structures** — LRU cache implementations directly combine hash tables and doubly linked lists, both covered there.
- **Operating Systems** — the CPU/memory page cache concepts this page's multi-level hierarchy directly builds on and generalizes.
- **Redis** — the dominant production application-level caching technology, directly implementing the theory covered on this page at real scale.
- **CDN** — the geographic/network-distance application of caching's locality principle at internet scale.
- **Semantic Caching** (in this platform's Context Engineering category) — the AI-specific extension of these principles to embedding-based similarity matching.

Learning path: **Data Structures** → **Operating Systems** → this page → **Redis** for the concrete, production-scale implementation → **CDN**/**Semantic Caching** for further specialized applications.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Core caching theory (locality of reference, eviction policies, invalidation challenges) remains remarkably stable, directly applicable across every layer of modern computing this platform covers.
- Continued growth of semantic caching specifically for LLM applications, applying traditional caching principles to a genuinely novel embedding-based similarity matching criterion.
- Continued industry emphasis on cache stampede mitigation (request coalescing, stale-while-revalidate) as standard production practice for high-traffic caching layers.
- Growing application of caching principles to AI/ML inference specifically (caching model outputs, embeddings, and intermediate computation results) as a direct cost and latency optimization technique.
`,

  "future-roadmap": `
Where caching theory is heading, and what's worth betting career time on:

- **Continued, near-permanent relevance of the core fundamentals** (locality of reference, eviction policies, hit ratio, invalidation challenges) as a durable foundation applicable to any new computing layer or technology that emerges.
- **Growing application to AI-specific caching challenges**: semantic caching for LLM responses, caching embeddings and intermediate computation results, applying these decades-old principles to genuinely novel AI infrastructure cost/latency optimization needs.
- **Continued emphasis on cache stampede and coherence resilience** as standard, expected production engineering discipline rather than an afterthought.
- **What to bet on**: deeply understanding WHY caching works (locality of reference) and the genuine tradeoffs it introduces (staleness, invalidation difficulty, stampede risk) rather than memorizing any single caching technology's specific API — this transfers directly to evaluating and designing ANY caching layer you'll encounter, from CPU hardware to LLM application architecture, a far more durable investment than syntax-level familiarity with any specific caching library.
`,

  "cheat-sheet": `
~~~
# ---- Why caching works: locality of reference ----
Temporal locality: recently accessed data -> likely accessed again SOON
Spatial locality:   data NEAR recent access -> likely accessed soon too
# No genuine locality in your workload = caching won't help much

# ---- Hit ratio: THE effectiveness metric ----
hit_ratio = hits / (hits + misses)
# Even modest hit-ratio gains (80% -> 90%) meaningfully cut avg latency

# ---- Eviction policy selection ----
LRU:  evict least RECENTLY used -- strong general-purpose default
LFU:  evict least FREQUENTLY used -- better for stable popular-item sets
FIFO: evict OLDEST inserted -- simplest, ignores access pattern entirely
~~~

~~~
# ---- Write policies ----
Write-through: write to cache + source together -- always consistent, slower writes
Write-back:    write to cache only, sync source later -- fast, but DATA LOSS risk
Write-around:  bypass cache, write straight to source -- for rarely-reread data

# ---- Cache stampede (a WELL-hit cache's biggest risk) ----
# Popular entry expires -> many concurrent requests all miss simultaneously
# FIX: request coalescing (only ONE recomputes) or stale-while-revalidate

# ---- Multi-level hierarchy (the SAME pattern, every layer) ----
CPU: L1 -> L2 -> L3 -> RAM -> Disk
Web: Browser -> CDN -> App cache (Redis) -> Database
# Check fastest first, fall back progressively, populate faster layers on a hit
~~~

~~~
# ---- THE hardest problem: cache invalidation ----
# "There are only two hard things in CS: cache invalidation and naming things."
# Options: proactive invalidation on write, TTL expiration (bounded staleness), or both together

# ---- Security: NEVER cache user-specific data in a SHARED cache without scoping ----
# A wrong cache key = one user's private data served to another user

# ---- Common mistake ----
# Unbounded cache = a real memory leak. ALWAYS set a capacity + eviction policy.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Why does caching work at all? | Locality of reference -- recently/nearby-accessed data is likely accessed again soon. |
| Cache hit ratio formula? | hits / (hits + misses) -- the primary caching effectiveness metric. |
| LRU vs LFU? | LRU: recency-based, adapts naturally. LFU: frequency-based, better for stable popular items. |
| Write-through vs write-back? | Write-through: always consistent, slower. Write-back: faster, but risks data loss on failure. |
| What is a cache stampede? | A popular entry expires -> many concurrent requests all miss and recompute simultaneously. |
| #1 cache stampede fix? | Request coalescing -- only ONE request recomputes, others wait and reuse the result. |
| Why is cache invalidation "hard"? | No universal algorithm correctly handles it for every data model/architecture -- context-specific. |
| Multi-level cache pattern? | Check fastest first, fall back progressively, populate faster layers on a hit -- same at every scale. |
| CDN's core insight? | Applies locality of reference to GEOGRAPHIC distance, not just time. |
| #1 caching security risk? | Wrong cache key scoping in a SHARED cache -> one user's data served to another. |
| #1 common caching mistake? | Unbounded cache growth -- always set an explicit capacity + eviction policy. |
| Bélády's algorithm's role? | The theoretical OPTIMAL (unimplementable) eviction benchmark practical policies are measured against. |
`,

  mcqs: `
1. What is locality of reference, and why does it matter for caching?
   A) A network routing concept  B) The empirical observation that recently/nearby-accessed data is disproportionately likely to be accessed again soon -- the fundamental reason caching works  C) A database normalization rule  D) A CPU instruction set feature
   **Answer: B** — without genuine locality, caching a small subset of data wouldn't meaningfully help.

2. What does the LRU eviction policy do?
   A) Evicts the oldest inserted entry regardless of access  B) Evicts whichever entry hasn't been accessed for the longest time  C) Evicts entries randomly  D) Never evicts anything
   **Answer: B** — directly exploiting temporal locality's assumption about recently-used data.

3. What is a cache stampede?
   A) Too many cache hits at once  B) A popular cache entry's expiration causing many concurrent requests to simultaneously miss and recompute the same expensive data  C) A cache running out of memory  D) A type of eviction policy
   **Answer: B** — mitigated via request coalescing, jittered expiration, or stale-while-revalidate.

4. Why is cache invalidation considered one of the hardest problems in computer science?
   A) It requires too much memory  B) No universal, simple algorithm correctly determines when and what to invalidate across every possible data model and distributed cache architecture  C) It's actually a solved, simple problem  D) It only affects small caches
   **Answer: B** — correctly invalidating exactly the right entries at exactly the right time is a persistent, context-specific engineering challenge.

5. What is a serious security risk specific to shared caches (like a CDN)?
   A) Slower response times  B) An incorrectly-scoped cache key causing one user's private, cached data to be served to a different user  C) Higher storage costs  D) Reduced hit ratio
   **Answer: B** — the cache key must correctly incorporate every dimension (like user identity) that should make requests genuinely distinct.

6. Why do CPU caches use a multi-level hierarchy (L1, L2, L3)?
   A) To make the CPU more complex  B) To trade capacity for speed across levels, checking the fastest first and falling back progressively, the same pattern applied at every scale of computing  C) Because a single cache level is illegal  D) To reduce power consumption only
   **Answer: B** — this exact layered pattern recurs at the application level too (browser, CDN, Redis, database).
`,

  "revision-notes": `
Caching stores a copy of data in a faster-to-access location so future requests can be served more quickly than recomputing or re-fetching from the original, slower source — one of computing's most broadly applicable performance techniques, appearing at every layer from CPU hardware (L1/L2/L3) through OS page caches up to application-level caches (Redis) and CDNs. Caching WORKS specifically because real-world access patterns exhibit genuine LOCALITY OF REFERENCE: TEMPORAL locality (recently-accessed data is likely accessed again soon) and SPATIAL locality (data near recently-accessed data is likely accessed soon too) — without this empirical property, keeping a small "hot" subset of data in fast storage wouldn't meaningfully help, since a cache's entire value proposition depends on this assumption holding true.

CACHE HIT RATIO (hits divided by total requests) is the single most important effectiveness metric — even modest hit-ratio improvements (80% to 90%) can meaningfully reduce average latency, since a miss typically costs orders of magnitude more than a hit. EVICTION POLICIES determine what to discard when a finite-capacity cache fills up: LRU (Least Recently Used) is the strong, generally effective default, evicting whichever entry hasn't been accessed longest; LFU (Least Frequently Used) can outperform LRU for workloads with stable, consistently popular items, though it can struggle to adapt when popularity genuinely shifts (an old item's high historical count can keep it cached long after it stops being useful); FIFO (First In, First Out) is simplest but ignores actual access patterns entirely, generally less effective. Bélády's algorithm (evicting whichever entry won't be needed for the longest future time) is the theoretical OPTIMUM, unimplementable in practice since it requires knowing the future, but serves as a durable benchmark for evaluating practical policies.

WRITE POLICIES determine how writes interact with the cache: write-through writes to both cache and source immediately (always consistent, higher write latency); write-back writes to the cache only, propagating to the source later (faster writes, genuine data-loss risk if the cache fails first); write-around bypasses the cache entirely for writes (appropriate when written data isn't likely to be re-read soon). TTL (Time-To-Live) expiration proactively discards entries after a fixed duration regardless of access pattern, a simple staleness mitigation whose correct duration depends entirely on the underlying data's actual staleness tolerance.

CACHE INVALIDATION — correctly knowing when a cached value has become stale and must be refreshed — is genuinely, famously difficult ("there are only two hard things in computer science: cache invalidation and naming things"), since no universal algorithm correctly handles every data model and distributed cache architecture; production systems typically combine PROACTIVE INVALIDATION on write (for staleness-intolerant data) with TTL expiration as a safety net. CACHE STAMPEDE is a critical production failure mode specifically affecting well-hit caches: when a popular entry expires, many concurrent requests simultaneously miss and rush to recompute the same expensive data at once, potentially overwhelming the underlying source — mitigated via REQUEST COALESCING (only one request actually recomputes, others wait and reuse the result), probabilistic early expiration with jitter, or STALE-WHILE-REVALIDATE (serving the slightly-stale value while refreshing asynchronously in the background).

MULTI-LEVEL CACHE HIERARCHIES (CPU's L1/L2/L3/RAM/disk, or the application-level browser/CDN/Redis/database chain) all apply the exact SAME structural pattern: check the fastest, most local layer first, fall back progressively to slower, more authoritative layers only on a miss, and populate faster layers on a hit so subsequent access is even faster — CDNs extend this same locality principle creatively to GEOGRAPHIC distance rather than just temporal recency. A genuinely important SECURITY consideration: caches SHARED across multiple users (a CDN, a reverse proxy) require correctly-scoped cache keys incorporating every dimension (particularly user identity/auth state) that should make requests genuinely distinct — an incorrectly-scoped cache key is a serious, real vulnerability class that can leak one user's private data to another. A senior engineer verifies genuine locality of reference exists before investing in caching at all, matches TTL/invalidation strategy deliberately to each specific data type's actual staleness tolerance rather than applying a uniform default, and designs explicitly for cache stampede resilience on any high-traffic cache entry, recognizing that a well-functioning cache's greatest single risk occurs precisely at the moment its most popular entries expire.
`,

  "learning-roadmap": `
**Week 1 — Locality of reference and hit ratio**: understanding why caching works, and measuring cache effectiveness empirically. Milestone: build a basic cache-aside implementation and measure its actual hit ratio against a realistic access pattern (Lab 1).

**Week 2 — Eviction policies**: implementing and comparing LRU, LFU, and FIFO across different synthetic workloads. Milestone: complete a comparative eviction policy benchmark, documenting which policy wins for which access pattern (Lab 2).

**Week 3 — Write policies and TTL-based expiration**: write-through, write-back, write-around tradeoffs, and choosing appropriate TTLs for different data staleness tolerances. Milestone: implement TTL-based expiration and justify appropriate TTL values for at least three different hypothetical data types.

**Week 4 — Cache invalidation and stampede mitigation**: proactive invalidation strategies, and implementing request coalescing to prevent cache stampede. Milestone: complete Lab 3, demonstrating stampede mitigation under simulated concurrent load.

**Week 5 — Multi-level caching and security**: understanding cache hierarchies (CPU to application-level), and correctly scoping cache keys to prevent cross-user information disclosure. Milestone: complete Lab 4, building a working multi-level cache with tested invalidation correctness.

**Week 6 — Production application and connection to broader systems**: connecting caching theory to Redis, CDNs, and semantic caching for LLM applications. Milestone: design a complete caching strategy for a hypothetical system with both staleness-sensitive and staleness-tolerant data types, justifying every design decision.

Next platform skill once this roadmap is complete: **Redis** for the concrete, production-scale implementation of these principles, or **CDN** for the geographic-distance application of the same fundamentals.
`,

  "official-docs": `
- **Redis's official documentation on eviction policies** (redis.io/docs/reference/eviction) — a practical, authoritative reference for eviction policy configuration in a widely-used production caching system.
- **MDN Web Docs on HTTP caching** — comprehensive, practical documentation on Cache-Control headers and browser/proxy caching behavior.
- **Cloudflare's documentation on CDN caching** — an authoritative reference for geographic/edge caching configuration.
`,

  books: `
- **"Computer Architecture: A Quantitative Approach" — Hennessy and Patterson** — the definitive academic reference for CPU cache hierarchy design and analysis.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — covers caching within the broader context of data-intensive system design, including consistency and invalidation tradeoffs.
- **"High Performance Browser Networking" — Ilya Grigorik** — excellent, practically-focused coverage of HTTP and browser caching specifically.
- **"Site Reliability Engineering" — Google** — covers cache stampede and related production reliability concerns from a large-scale operational perspective.
`,

  blogs: `
- **Redis's own engineering blog** — practical guidance on caching patterns and eviction policy tuning from the maintainers of a leading production caching technology.
- **Cloudflare's engineering blog** — extensive, technically deep writing on CDN caching, cache poisoning, and edge caching architecture.
- **Various "cache stampede" and "thundering herd" explainer blog posts** across the software engineering community, covering mitigation techniques in depth.
`,

  "research-papers": `
- **Bélády, L. — "A Study of Replacement Algorithms for a Virtual-Storage Computer"** (1966, IBM Systems Journal) — the foundational paper on page replacement/eviction algorithms, including the theoretical optimum still used as a benchmark today.
- **Wilkes, M. — "Slave Memories and Dynamic Storage Allocation"** (1965) — among the earliest formal proposals of cache memory for computing hardware.
- General distributed systems literature on cache coherence protocols provides relevant theoretical grounding for multi-instance caching challenges.
`,

  videos: `
- **Various "How CPU Caches Work" explainer videos** covering the hardware-level cache hierarchy accessibly.
- **Redis's own official documentation videos/tutorials** on eviction policy and caching pattern configuration.
- **Conference talks specifically on cache stampede and large-scale caching architecture** (from companies operating at genuine internet scale) for real-world production depth.
`,

  "github-repos": `
- **redis/redis** — the official Redis source code, a production-grade implementation of the eviction and expiration theory covered on this page.
- **Various "LRU cache implementation" example repositories** across many languages, illustrating the hash-table-plus-linked-list combination concretely.
- **facebook/rocksdb** — a widely-used embedded database with sophisticated internal caching (block cache) directly applying this page's principles at storage-engine scale.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Hit ratio measurement**: implement a basic cache-aside pattern and measure hit ratio against both a realistic (locality-exhibiting) and a genuinely random access pattern, comparing the results.
2. **Eviction policy implementation**: implement LRU, LFU, and FIFO from scratch, verifying correct eviction behavior under a specific sequence of operations for each.
3. **TTL and invalidation design**: given a set of different data types (financial data, user profiles, static reference data), design and justify an appropriate TTL/invalidation strategy for each.
4. **Cache stampede mitigation**: implement request coalescing and verify, under simulated concurrent load, that an expensive fetch operation is called exactly once despite many simultaneous requests for the same missing key.
5. **Cache key security review**: given a set of example cache key schemes for a multi-user system, identify which ones have a genuine cross-user information disclosure vulnerability and correct them.
6. **External practice sets**: Redis's own official caching pattern tutorials for structured, guided practice with a real production caching technology.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Hardware["Hardware Layer"]
        L1["CPU L1 Cache"]
        L2["CPU L2 Cache"]
        L3["CPU L3 Cache"]
        RAM["Main RAM"]
    end
    subgraph Application["Application Layer"]
        Browser["Browser Cache"]
        CDNCache["CDN Edge Cache"]
        AppCache["Application Cache (Redis)"]
        DBCache["Database Query Cache"]
    end
    subgraph Theory["Shared Underlying Theory"]
        Locality["Locality of Reference"]
        Eviction["Eviction Policies\n(LRU, LFU, FIFO)"]
        Invalidation["Invalidation Strategies"]
        Stampede["Stampede Mitigation"]
    end
    L1 --> L2 --> L3 --> RAM
    Browser --> CDNCache --> AppCache --> DBCache
    Locality --> L1
    Locality --> Browser
    Eviction --> AppCache
    Invalidation --> AppCache
    Stampede --> CDNCache
    Stampede --> AppCache
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Caching))
    Foundations
      Overview
      History Wilkes Belady
      Why it exists
      Problem it solves
    Locality of Reference
      Temporal locality
      Spatial locality
      Why caching works at all
    Eviction Policies
      LRU
      LFU
      FIFO
      Belady optimal benchmark
    Write Policies
      Write through
      Write back
      Write around
    Invalidation
      TTL expiration
      Proactive invalidation
      The hardest problem
    Stampede and Coherence
      Cache stampede
      Request coalescing
      Stale while revalidate
      Multi instance coherence
    Multi Level Hierarchies
      CPU L1 L2 L3
      Browser CDN Redis database
      CDN geographic locality
    Security
      Cache key scoping
      Cache poisoning
      Information disclosure
    AI Extension
      Semantic caching
      Embedding similarity
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default cachingCs;
