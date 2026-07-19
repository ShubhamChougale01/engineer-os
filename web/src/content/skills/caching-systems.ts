import type { SkillContent } from "../types";

const cachingSystems: SkillContent = {
  overview: `
Caching at the systems/distributed level is about storing frequently-accessed data in a fast-access layer (typically an in-memory store like Redis, or a distributed cache cluster) sitting between an application and its primary data store, so repeated reads for the same data avoid the cost of a slower origin lookup — and about correctly managing the genuinely hard problems that emerge once that cache spans MULTIPLE nodes and must stay reasonably consistent with the underlying data as it changes. This skill is deliberately distinct from the platform's Computer-Science-level **Caching (CS)** skill, which covers single-machine caching fundamentals (CPU cache locality, LRU/LFU eviction policies, hit ratio) — this page focuses specifically on caching as a DISTRIBUTED SYSTEM component: cache-aside versus write-through patterns, cache invalidation across multiple application servers, and distributed cache cluster architecture (sharding, replication, consistent hashing).

For an AI engineer, understanding distributed caching systems directly explains how a production API can serve the vast majority of read traffic from Redis rather than hitting a relational database for every request, how an LLM application can cache expensive inference results (or embeddings) keyed on input to avoid redundant, costly recomputation, and why a poorly-designed cache invalidation strategy can cause subtly incorrect data to be served across an entire fleet of application servers simultaneously.

Key characteristics: **cache-aside (lazy loading)**, the dominant pattern where the application checks the cache first, falling back to the origin data store on a miss and populating the cache for next time; **write-through and write-behind**, alternative patterns writing to the cache and origin together (synchronously or asynchronously); **cache invalidation across a distributed application fleet**, the genuinely hard problem of ensuring every application server's view of cached data stays acceptably consistent as underlying data changes; and **distributed cache cluster architecture**, using sharding and consistent hashing (directly connecting to the **Load Balancers** skill's own treatment of this technique) to scale a cache beyond a single node's capacity.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2003 | **memcached** is created by Brad Fitzpatrick for LiveJournal, becoming one of the first widely-adopted, purpose-built distributed in-memory caching systems, directly motivated by the need to reduce database load for a rapidly-growing web application |
| 2000s | memcached becomes standard infrastructure across the industry (notably at Facebook, which published influential engineering work on scaling memcached to enormous size) as web applications increasingly needed to reduce database read load at scale |
| 2009 | **Redis** is released by Salvatore Sanfilippo, offering richer data structures (lists, sets, sorted sets, hashes) beyond memcached's simple key-value model, alongside optional persistence — rapidly becoming the dominant modern choice for distributed caching and beyond |
| 2010s | **Facebook's published engineering work on memcached at scale** (a widely-referenced paper) details real production challenges around cache invalidation, thundering herds, and consistency across an enormous distributed cache deployment |
| 2010s–2020s | Caching becomes a near-universal, default component of production web architecture, with Redis in particular expanding well beyond pure caching into use cases like pub/sub messaging, rate limiting, and session storage |
| 2020s | Managed cloud caching services (AWS ElastiCache, Azure Cache for Redis, and others) become the default deployment choice for many teams, removing the operational burden of self-managing a distributed cache cluster |

Distributed caching's history reflects the direct, practical response to a widely-shared production problem — as web applications scaled, database read capacity became a consistent bottleneck, and purpose-built, simple, extremely fast key-value caching layers (memcached, then Redis) became the standard, near-universal answer.
`,

  "why-it-exists": `
Distributed caching systems exist because primary data stores (relational databases especially) are typically optimized for durability, consistency, and complex querying — not for serving an enormous volume of simple, repeated reads as fast as physically possible. As application read traffic grows, repeatedly querying the primary database for the same, rarely-changing data (a user's profile, a product listing, a computed aggregate) wastes database capacity that could otherwise be spent on genuinely new queries or on writes, and it caps overall read throughput at whatever the database itself can sustain.

A distributed cache solves this by storing a copy of frequently-accessed data in a purpose-built, extremely fast, in-memory layer, letting the vast majority of reads be served from the cache rather than the primary data store — directly extending the **CDN** skill's own edge-caching motivation (reducing origin load, improving latency) but applied within an application's own backend architecture rather than at the internet's geographic edge, and the **Reverse Proxy** skill's single-location response caching extended to a purpose-built, application-wide caching tier.
`,

  "problem-it-solves": `
Distributed caching systems solve the **"how do we serve an enormous volume of repeated reads with very low latency, without proportionally scaling our primary data store's read capacity"** problem.

Concretely, they provide:

- **Reduced primary data store load**: absorbing the vast majority of repeated reads at the cache layer, freeing the primary database's capacity for writes and genuinely novel queries.
- **Dramatically lower read latency**: an in-memory cache lookup is typically orders of magnitude faster than a query against a disk-backed relational database, especially for anything involving joins or aggregation.
- **Horizontal read scalability**: a distributed cache cluster (using sharding and consistent hashing) can scale its own capacity independently of the primary data store's own scaling constraints.
- **Caching computed or expensive-to-derive results**: not just raw data, but the RESULT of an expensive computation (an aggregate query, a rendered page fragment, an LLM inference result) can be cached, avoiding redundant recomputation.

What distributed caching systems do **not** solve, or solve only partially: caching introduces a genuine, unavoidable consistency risk — cached data can become stale relative to the primary data store, and correctly managing this (via appropriate invalidation strategies, covered in depth on this page) requires deliberate design, not an afterthought; and a cache is not a substitute for a primary data store's own durability and correctness guarantees — data that MUST never be lost belongs in a properly durable store, with the cache serving purely as an accelerating layer on top.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain cache-aside, write-through, and write-behind patterns and their respective tradeoffs.
2. Explain cache invalidation strategies for keeping a distributed cache acceptably consistent with its origin data store.
3. Explain cache stampede (thundering herd) and request coalescing as its mitigation.
4. Explain distributed cache cluster architecture: sharding, consistent hashing, and replication.
5. Distinguish this skill's distributed-systems-level caching concerns from the CS-level **Caching (CS)** skill's single-machine eviction-policy focus.
6. Recognize caching anti-patterns: caching without a clear invalidation strategy, cache stampedes, over-caching genuinely volatile data.
7. Answer senior-level interview questions on cache invalidation strategy and distributed cache architecture design.
`,

  prerequisites: `
- **Required**: the **Caching (CS)** skill — this page builds directly on single-machine caching fundamentals (eviction policies, hit ratio) covered there, extending them to a distributed context.
- **Required**: the **Redis** skill for the dominant real-world distributed caching technology this page's concepts directly apply to.
- **Very helpful**: the **CDN** skill (covered immediately before this page) — many of the invalidation and cache-stampede concepts directly parallel edge caching's own treatment of these problems.
- **Very helpful**: the **Load Balancers** skill for the consistent-hashing technique distributed cache clusters rely on.

Dependency chain: **CDN** → this page → **Message Queues** for the next System Design technology in this category.
`,

  "beginner-concepts": `
### The basic idea: cache-aside (lazy loading)

~~~mermaid
sequenceDiagram
    participant App
    participant Cache as Redis Cache
    participant DB as Primary Database

    App->>Cache: GET user:123
    alt cache hit
        Cache-->>App: cached user data
    else cache miss
        Cache-->>App: (nil)
        App->>DB: SELECT * FROM users WHERE id=123
        DB-->>App: user data
        App->>Cache: SET user:123 (with TTL)
    end
~~~

Cache-aside is the dominant, simplest caching pattern: the application itself checks the cache first, falling back to the primary database on a miss and populating the cache for next time — the cache stores only what's actually been requested, and a cache failure simply means every request falls back to the database (slower, but not incorrect).

### A basic Redis caching example

~~~python
def get_user(user_id):
    cached = redis_client.get(f"user:{user_id}")
    if cached:
        return deserialize(cached)
    user = database.query_user(user_id)
    redis_client.setex(f"user:{user_id}", 3600, serialize(user))
    return user
~~~

### TTL (time-to-live): the simplest invalidation strategy

~~~
redis_client.setex("user:123", 3600, data)
~~~

Setting an expiration duration means the cached entry automatically becomes invalid (and is removed) after that duration, forcing a fresh fetch from the database on the next request — simple, but means cached data can be stale for up to the full TTL duration.

### Why caching matters for cost and latency

~~~
Database query (disk-backed, possibly involving joins): ~5-50ms
In-memory cache lookup (Redis): ~0.1-1ms
~~~

This roughly 10-100x latency difference, multiplied across a large fraction of an application's total read traffic, is precisely why caching is such a high-leverage optimization for both user-facing latency and database infrastructure cost.
`,

  "intermediate-concepts": `
### Write-through caching

~~~mermaid
sequenceDiagram
    participant App
    participant Cache
    participant DB

    App->>Cache: write data
    Cache->>DB: write data (synchronously)
    DB-->>Cache: ack
    Cache-->>App: ack
~~~

Write-through writes to the cache and the database together, synchronously, as part of a single logical write operation — ensuring the cache is never stale relative to the database (since every write updates both simultaneously), at the cost of added write latency (waiting for both the cache and database write to complete).

### Write-behind (write-back) caching

~~~mermaid
sequenceDiagram
    participant App
    participant Cache
    participant DB

    App->>Cache: write data
    Cache-->>App: ack (immediately)
    Note over Cache,DB: Asynchronously, later
    Cache->>DB: write data (batched/delayed)
~~~

Write-behind acknowledges a write immediately after updating the cache, asynchronously persisting to the database later (often batched for efficiency) — offering lower write latency than write-through, at the cost of a genuine data-loss risk if the cache fails before the asynchronous database write completes.

### Cache invalidation on write (the standard cache-aside companion pattern)

~~~python
def update_user(user_id, new_data):
    database.update_user(user_id, new_data)
    redis_client.delete(f"user:{user_id}")  # invalidate, don't update
~~~

A common, deliberate practice: on a write, DELETE the cache entry rather than trying to update it in place — this avoids a subtle race condition where an update might overwrite a more recent value that another concurrent process is simultaneously writing to the cache; the next read simply repopulates the cache correctly via the normal cache-aside miss path.

### Cache stampede (thundering herd)

~~~
A popular cache key expires. MANY concurrent requests for
that same key arrive at nearly the same moment, and EACH
one independently experiences a cache miss, triggering a
redundant, simultaneous database query for the SAME data --
potentially overwhelming the database with duplicate work.
~~~

This directly parallels the **CDN** skill's own treatment of the identical problem at the edge-caching layer — the standard mitigation is REQUEST COALESCING (recognizing multiple simultaneous requests for the same missing key and issuing only ONE database query, sharing its result among all waiting requests).

### Cache sharding and consistent hashing

~~~
A single cache node has finite memory capacity. SHARDING
distributes cache keys across MULTIPLE cache nodes (e.g.,
via Redis Cluster), using CONSISTENT HASHING (directly
covered in the Load Balancers skill) so that adding or
removing a cache node only reshuffles a small fraction of
existing key-to-node mappings, rather than nearly all of them.
~~~
`,

  "advanced-concepts": `
### The dogpile effect and probabilistic early expiration

~~~
A refinement on cache stampede mitigation: rather than a
hard, all-at-once TTL expiration, PROBABILISTIC EARLY
EXPIRATION lets a small percentage of requests, as a cache
entry approaches its expiration time, voluntarily treat it
as already-expired and refresh it slightly early -- spreading
out the refresh load over time rather than concentrating it
at the exact moment of expiration, when many concurrent
requests would otherwise all miss simultaneously.
~~~

### Cache invalidation across a distributed application fleet

~~~
When MANY application server instances each maintain their
OWN local (in-process) cache, invalidating a piece of data
requires propagating that invalidation to EVERY instance --
a genuinely harder problem than a single shared, centralized
cache (like a Redis cluster), where invalidation only needs
to happen once, in one place, immediately visible to every
application server reading from it.
~~~

This is a frequently-underappreciated argument in favor of a shared, centralized distributed cache (Redis) over per-instance local in-process caching for data that changes: a shared cache genuinely simplifies invalidation correctness, even though a local in-process cache can offer even lower latency (no network round trip) for genuinely read-heavy, rarely-changing data.

### Read-through and cache-computed-value patterns

~~~
Read-through: the CACHE ITSELF (rather than the application)
    is responsible for fetching from the origin on a miss,
    presenting a simpler interface to the application (which
    always just "reads from the cache").
Computed-value caching: caching not raw data, but the RESULT
    of an expensive computation (an LLM inference result keyed
    on its input, a rendered aggregate report) -- directly
    relevant to AI engineering workloads where recomputing an
    inference result is often far more expensive than a
    typical database query would be.
~~~

### Cache consistency models: strong versus eventual

~~~
Write-through caching (writing to cache and database together
    synchronously) provides STRONGER consistency between cache
    and database, at a real write-latency cost.
Cache-aside with TTL-based expiration provides WEAKER,
    eventually-consistent behavior (data can be stale for up
    to the TTL duration), but with lower write latency and
    architectural simplicity.
~~~

This directly echoes the **CAP Theorem** skill's own consistency-versus-performance tradeoff, applied specifically to the cache-versus-origin-data-store relationship rather than to replica consistency within a single distributed data store.

### Negative caching

~~~
Caching the FACT that a particular lookup returned "not
found," not just successful results -- preventing repeated,
wasted database queries for a key that genuinely doesn't
exist (a common target of cache-penetration-style abuse,
where an attacker deliberately queries many non-existent
keys specifically to bypass the cache and load the database
directly).
~~~
`,

  "internal-working": `
Tracing a request through a cache-aside system experiencing a cache stampede, mitigated via request coalescing:

~~~mermaid
sequenceDiagram
    participant Req1 as Request 1
    participant Req2 as Request 2
    participant Req3 as Request 3
    participant Cache
    participant DB

    Note over Cache: Popular key "product:42" just expired
    Req1->>Cache: GET product:42 -- MISS
    Cache->>Cache: acquire per-key lock for "product:42"
    Req2->>Cache: GET product:42 -- MISS
    Cache->>Cache: sees lock already held,\nWAITS rather than querying DB
    Req3->>Cache: GET product:42 -- MISS
    Cache->>Cache: also waits
    Req1->>DB: SELECT ... WHERE id=42\n(only ONE request reaches the DB)
    DB-->>Req1: product data
    Req1->>Cache: SET product:42
    Cache-->>Req1: return fresh data
    Cache-->>Req2: return the SAME fresh data\n(no separate DB query needed)
    Cache-->>Req3: return the SAME fresh data
~~~

1. **The first request experiencing a cache miss acquires a per-key lock**, signaling to subsequently-arriving requests for the same key that a refresh is already underway.
2. **Subsequent concurrent requests for the same key WAIT** rather than independently querying the database, avoiding redundant, simultaneous work.
3. **Only ONE database query is actually issued**, with its result shared among all requests that were waiting on that specific key.

**Why this matters**: this concrete mechanism (request coalescing via a per-key lock) is precisely what prevents a popular key's expiration from becoming a sudden, correlated database load spike — directly connecting to the identical problem and solution covered in the **CDN** skill's own edge-caching treatment.
`,

  architecture: `
A senior engineer thinks about distributed caching architecture in terms of choosing the right caching pattern (cache-aside, write-through, write-behind) for a given data's read/write characteristics, designing invalidation deliberately rather than as an afterthought, and structuring a cache cluster for both capacity and availability.

### Choosing a caching pattern based on data characteristics

~~~mermaid
flowchart TB
    Data["A piece of data"] --> Q1{"Read-heavy,\nwrite-rarely?"}
    Q1 -->|Yes| CacheAside["Cache-aside\n(simple, standard default)"]
    Q1 -->|"No -- writes are\nfrequent, and cache/DB\nmust stay in sync"| Q2{"Can write latency\nafford a synchronous\ncache+DB write?"}
    Q2 -->|Yes| WriteThrough["Write-through"]
    Q2 -->|"No -- write latency\nis genuinely critical"| WriteBehind["Write-behind\n(accepting some data-loss risk)"]
~~~

### Designing invalidation deliberately, not as an afterthought

~~~mermaid
flowchart LR
    WriteHappens["A write occurs"] --> Invalidate["DELETE the affected\ncache key(s)\n(not update-in-place)"]
    Invalidate --> NextRead["Next read repopulates\ncache correctly via the\nnormal cache-aside miss path"]
~~~

A senior engineer designs the invalidation path alongside the caching path from the start, rather than adding caching first and only later discovering that keeping it correctly synchronized with writes is genuinely difficult — deleting (rather than updating) a cache entry on write is the standard, race-condition-safe default.

### Structuring a distributed cache cluster for capacity and availability

~~~mermaid
flowchart TB
    App["Application servers"] --> Cluster["Redis Cluster\n(sharded via consistent hashing)"]
    Cluster --> Shard1["Shard 1 (+ replica)"]
    Cluster --> Shard2["Shard 2 (+ replica)"]
    Cluster --> Shard3["Shard 3 (+ replica)"]
~~~

A production-grade cache cluster combines SHARDING (for capacity beyond a single node) with REPLICATION (for fault tolerance, so a single shard's failure doesn't lose that shard's cached data entirely) — directly reusing the **Distributed Systems** and **Load Balancers** skills' own replication and consistent-hashing concepts.
`,

  "data-flow": `
Tracing a write-through cache update alongside a subsequent read from a different application server:

~~~mermaid
sequenceDiagram
    participant App1 as App Server 1
    participant Cache
    participant DB
    participant App2 as App Server 2

    App1->>Cache: write product:42 = {price: 19.99}
    Cache->>DB: synchronously write to database
    DB-->>Cache: ack
    Cache-->>App1: ack

    Note over App2: A DIFFERENT app server,\nno direct coordination with App1
    App2->>Cache: GET product:42
    Cache-->>App2: {price: 19.99}\n(immediately consistent,\nsince write-through kept\ncache and DB in sync)
~~~

The critical detail: because the cache is a SHARED, centralized resource (not a per-application-server local cache), App Server 2 sees the fresh data immediately, with no need for App1 to explicitly notify it — this is precisely the simplification a shared distributed cache provides over per-instance local caching, where propagating this same invalidation to every application server instance would be a genuinely harder, separate problem.
`,

  "production-usage": `
### A representative cache-aside implementation with stampede protection

~~~python
import redis
from threading import Lock

redis_client = redis.Redis()
key_locks = {}

def get_product(product_id):
    key = f"product:{product_id}"
    cached = redis_client.get(key)
    if cached:
        return deserialize(cached)

    lock = key_locks.setdefault(key, Lock())
    with lock:
        cached = redis_client.get(key)  # re-check after acquiring lock
        if cached:
            return deserialize(cached)
        product = database.query_product(product_id)
        redis_client.setex(key, 3600, serialize(product))
        return product
~~~

### Non-negotiables for production distributed caching

1. **Always set a TTL**, even alongside explicit invalidation, as a safety net against a missed or failed invalidation.
2. **Delete (not update) cache entries on write**, letting the next read repopulate correctly via the standard cache-aside path.
3. **Implement request coalescing** for any genuinely high-traffic, cacheable key, protecting the origin data store from cache-stampede-driven load spikes.
4. **Use a shared, centralized cache (Redis) rather than per-instance local caching** for data that changes, to keep invalidation genuinely simple and correct.
5. **Design for cache failure gracefully** — a cache-aside pattern should transparently fall back to the origin data store if the cache itself is unavailable, degrading performance but not correctness.

### Common production patterns

- **Redis as the dominant modern choice**, combining simple key-value caching with richer data structures useful for related use cases (rate limiting, session storage, pub/sub).
- **Caching computed/expensive results** (aggregate queries, LLM inference outputs) keyed on their input, not just raw entity data.
- **Negative caching** for known-nonexistent keys, protecting against cache-penetration-style load patterns.
`,

  "industry-examples": `
- **Facebook's memcached deployment at massive scale**: a widely-referenced engineering case study detailing real production challenges (cache invalidation correctness, thundering herds, consistency) at an enormous scale.
- **Redis**: the dominant modern distributed caching technology, adopted virtually universally across production web architectures, extending well beyond pure caching into session storage, rate limiting, and pub/sub messaging.
- **AWS ElastiCache, Azure Cache for Redis**: fully-managed cloud caching services, now the default deployment choice for many teams avoiding self-managed cache cluster operations.
- **LLM application caching patterns**: caching embeddings or inference results keyed on input hash, avoiding redundant, expensive recomputation for repeated or similar queries — an increasingly common pattern in production AI systems.
`,

  "best-practices": `
1. **Always set a TTL as a safety net**, even when explicit invalidation is also implemented.
2. **Delete, don't update, cache entries on write**, avoiding race conditions with concurrent cache population.
3. **Implement request coalescing** for high-traffic cacheable keys, preventing cache-stampede-driven database load spikes.
4. **Prefer a shared, centralized cache over per-instance local caching** for data that changes, simplifying invalidation correctness.
5. **Design for graceful cache failure**, falling back transparently to the origin data store.
6. **Cache computed/expensive results, not just raw entity data**, where recomputation is genuinely costly (LLM inference, complex aggregates).
7. **Use negative caching** for known-nonexistent keys, protecting against cache-penetration abuse patterns.
8. **Choose cache-aside, write-through, or write-behind deliberately**, based on the specific data's actual read/write characteristics and consistency requirements.
9. **Shard and replicate the cache cluster** for both capacity and fault tolerance as scale grows.
10. **Monitor cache hit ratio explicitly**, since it's the clearest signal of whether caching is actually providing its intended benefit.
`,

  "anti-patterns": `
### Caching without a clear invalidation strategy

~~~
# WRONG — data is cached with a long TTL and no explicit
# invalidation on write, meaning updates can take up to the
# full TTL duration to become visible, with no way to force
# an immediate update when genuinely needed
# RIGHT — combine a reasonable TTL (as a safety net) with
# explicit invalidation (delete) on every write path
~~~

### Updating a cache entry in place on write, rather than deleting it

~~~python
# WRONG — a race condition risk: if two concurrent writes
# interleave with their own cache updates, a STALE write's
# cache update could overwrite a MORE RECENT write's cache
# update, leaving the cache permanently inconsistent with
# the database until the next explicit write or TTL expiry
def update_user(user_id, new_data):
    database.update_user(user_id, new_data)
    redis_client.set(f"user:{user_id}", serialize(new_data))

# RIGHT — delete, letting the next read repopulate correctly
def update_user(user_id, new_data):
    database.update_user(user_id, new_data)
    redis_client.delete(f"user:{user_id}")
~~~

### Not protecting against cache stampede for high-traffic keys

~~~
# WRONG — a popular key's expiration triggers many simultaneous,
# redundant database queries for the same data, overwhelming
# the database at exactly the moment the cache is being refreshed
# RIGHT — implement request coalescing (a per-key lock, or a
# dedicated coalescing library) so only ONE query is actually issued
~~~

### Other production-grade anti-patterns

- **Using per-instance local in-process caching for frequently-changing data**, making invalidation genuinely harder to propagate correctly across a fleet.
- **Caching genuinely sensitive data without appropriate access controls on the cache itself**, treating the cache as a lower-security-bar data store than the origin.
- **Not monitoring cache hit ratio**, missing a clear, simple signal of caching effectiveness or a regression.
`,

  performance: `
### Rule zero: caching's benefit is proportional to how read-heavy and how cacheable the actual workload is

Caching provides the most value for genuinely read-heavy data that changes relatively infrequently — a workload with near-constant writes to the same keys sees comparatively little benefit (and real added complexity) from caching.

### The performance hierarchy (apply in order)

1. **Maximize cache hit ratio** for genuinely cacheable data, since this is where caching provides its core latency and database-load-reduction benefit.
2. **Implement request coalescing** for high-traffic keys, avoiding cache-stampede-driven redundant database load.
3. **Cache computed/expensive results**, not just raw data, where recomputation is genuinely costly.
4. **Shard the cache cluster** as data volume or traffic grows beyond a single node's capacity.
5. **Profile actual cache hit ratio and database load** under realistic traffic, rather than assuming a given caching strategy's effectiveness without measurement.

### Micro-level facts worth knowing

- An in-memory cache lookup (Redis) is typically 10-100x faster than a disk-backed relational database query, especially for queries involving joins or aggregation.
- Write-through caching's added write latency comes specifically from waiting for BOTH the cache and database write to complete before acknowledging.
- Negative caching (caching "not found" results) can meaningfully reduce database load for workloads with a significant fraction of legitimately-missing-key lookups.
`,

  scalability: `
Distributed caching directly enables scaling an application's read capacity independently of its primary data store's own scaling constraints.

### How distributed caching supports scaling read-heavy workloads

~~~mermaid
flowchart LR
    GrowingReadTraffic["Growing read traffic"] --> CacheAbsorption["Cache absorbs the vast\nmajority of repeated reads"]
    CacheAbsorption --> DBUnaffected["Primary database sees only\ncache misses + genuinely\nnovel queries + writes"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single cache node's memory capacity exceeded | Shard the cache cluster across multiple nodes using consistent hashing |
| Cache node failure losing that shard's cached data | Add replication within the cache cluster for fault tolerance |
| Cache stampede overwhelming the database on popular key expiration | Implement request coalescing |
| Per-instance local caching's invalidation complexity growing with fleet size | Migrate to a shared, centralized cache (Redis) for data that changes |
`,

  security: `
### The cache as a genuine data store requiring appropriate access controls

~~~
A cache holding sensitive data (session tokens, personal
information) deserves the SAME security scrutiny as the
origin data store it's accelerating -- network isolation,
authentication, and encryption in transit, not a lower
security bar simply because it's "just a cache."
~~~

### Essential distributed-caching-related security practices

1. **Apply appropriate network isolation and authentication** to the cache cluster, treating it as a genuine data store, not a lower-security-bar component.
2. **Encrypt sensitive cached data in transit** (and consider encryption at rest, depending on the cache technology and deployment) if it holds genuinely sensitive information.
3. **Implement negative caching and rate limiting** to protect against cache-penetration-style abuse (deliberately querying many non-existent keys to bypass the cache and load the origin directly).
4. **Avoid caching data across tenant/user boundaries incorrectly**, ensuring cache keys are correctly scoped to prevent one user's cached data being served to another.

See the **Redis**, **OWASP Top 10**, and **TLS & HTTPS** skills for the broader security context this connects to.
`,

  testing: `
### Testing cache-aside behavior

~~~python
def test_cache_miss_falls_back_to_database():
    redis_client.flushall()
    result = get_product(42)
    assert result == database.query_product(42)
    assert redis_client.get("product:42") is not None  # now cached

def test_cache_invalidated_on_update():
    get_product(42)  # populate cache
    update_product(42, {"price": 29.99})
    assert redis_client.get("product:42") is None  # invalidated
~~~

### Testing request coalescing under simulated concurrent misses

~~~python
def test_concurrent_cache_misses_trigger_only_one_db_query():
    redis_client.flushall()
    query_count = simulate_concurrent_requests(get_product, 42, concurrency=50)
    assert database.query_call_count("product", 42) == 1
~~~

### The senior testing doctrine

- Test cache-aside fallback behavior explicitly, verifying correctness (not just performance) when the cache is empty or unavailable.
- Test invalidation explicitly on every write path, verifying stale data isn't served after an update.
- Load-test with simulated concurrent cache misses to verify request coalescing actually prevents redundant database load.
- Test cache cluster failover behavior explicitly if self-managing sharding/replication, verifying data availability during a simulated node failure.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check cache hit/miss metrics first** when investigating unexpectedly high database load or slow response times.
2. **Verify invalidation is actually firing on the relevant write path** if stale data is being served after an update.
3. **Check for a cache stampede pattern** (a spike in database load correlated with a popular key's TTL expiration) if database load spikes periodically and predictably.
4. **Use distributed tracing** (the **Tracing** skill) to confirm whether a slow request is experiencing a cache hit or miss, and where time is actually being spent.

### Debugging common distributed-caching-related symptoms

- "Users see stale data after an update" — verify the write path actually invalidates (deletes) the relevant cache key, and that it's targeting the correct key.
- "Database load spikes periodically" — check for a cache stampede pattern correlated with popular keys' TTL expiration; implement request coalescing if missing.
- "Cache hit ratio dropped unexpectedly" — check for a recent change to key naming, TTL configuration, or cache cluster capacity/eviction behavior.
- "One user's cached data appears for a different user" — check cache key scoping, verifying it correctly includes user/tenant-identifying information where required.
`,

  monitoring: `
### Key signals to track

- **Cache hit ratio**, the clearest signal of caching effectiveness and a leading indicator of any regression.
- **Cache cluster memory utilization and eviction rate**, indicating whether the cluster has adequate capacity for the current working set.
- **Database query rate and latency**, verifying caching is actually reducing load as intended.
- **Cache invalidation latency and success rate**, verifying writes are correctly and promptly invalidating stale entries.

### Tools

Redis's own built-in metrics (INFO command, or a dedicated monitoring integration); standard application monitoring correlating cache hit/miss behavior with response latency; distributed tracing for end-to-end request path visibility including cache interaction.

### Alerting priorities

Alert on a significant, unexpected drop in cache hit ratio (indicating a regression or configuration issue), on cache cluster memory utilization approaching capacity limits (risking increased eviction and reduced effectiveness), and on database load spikes correlated with cache-related events (a potential cache stampede).
`,

  deployment: `
### Deploying a sharded, replicated Redis cluster

~~~
redis-cli --cluster create \\
  10.0.0.1:6379 10.0.0.2:6379 10.0.0.3:6379 \\
  10.0.0.4:6379 10.0.0.5:6379 10.0.0.6:6379 \\
  --cluster-replicas 1
~~~

This representative Redis Cluster setup creates three shards, each with one replica, combining sharding (for capacity) with replication (for fault tolerance) — directly reflecting this page's own architectural guidance.

### CI/CD pipeline considerations

Include cache-invalidation-path testing explicitly in the deployment pipeline for any change touching a cached data model, verifying writes correctly invalidate their corresponding cache entries before the change reaches production. See the **CI/CD** and **Redis** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production distributed cache takes real traffic:

- [ ] TTL configured as a safety net on every cached entry, even alongside explicit invalidation
- [ ] Write paths explicitly delete (not update) their corresponding cache entries
- [ ] Request coalescing implemented for high-traffic, cacheable keys
- [ ] Cache-aside fallback behavior verified for correctness when the cache is unavailable
- [ ] Cache cluster sharded and replicated appropriately for actual capacity and fault-tolerance needs
- [ ] Cache access controls and network isolation appropriate for the sensitivity of cached data
- [ ] Cache hit ratio monitoring and alerting in place
- [ ] Negative caching considered for workloads with significant known-nonexistent-key lookup patterns
`,

  "common-mistakes": `
1. **Caching without a clear invalidation strategy**, relying purely on a long TTL and accepting extended staleness.
2. **Updating (rather than deleting) cache entries on write**, risking a race condition between concurrent writes.
3. **Not protecting high-traffic keys against cache stampede**, risking correlated database load spikes on expiration.
4. **Using per-instance local caching for frequently-changing data**, making correct invalidation propagation genuinely harder.
5. **Treating the cache as a lower-security-bar data store** than the origin, missing appropriate access controls.
6. **Not monitoring cache hit ratio**, missing a clear, simple signal of caching effectiveness or regression.
7. **Choosing write-through or write-behind without genuinely weighing their specific latency/consistency/durability tradeoffs** for the actual data involved.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Stale data served after an update | Write path doesn't invalidate the relevant cache key, or targets the wrong key | Verify and correct the invalidation logic on the write path |
| Database load spikes periodically | Cache stampede on a popular key's TTL expiration | Implement request coalescing |
| Cache hit ratio unexpectedly low | Recent key-naming, TTL, or cluster-capacity change; or workload genuinely not very cacheable | Investigate recent changes; verify workload's actual cacheability |
| One user's cached data appears for another user | Cache key not correctly scoped to user/tenant identity | Correct cache key construction to include necessary scoping |
| Cache cluster running out of memory | Insufficient sharding capacity, or TTLs set too long for the actual working set size | Add shards, or reduce TTLs/cache genuinely necessary data only |
| Write latency increased after adopting caching | Write-through caching's synchronous cache+DB write cost | Verify this tradeoff is genuinely acceptable, or consider write-behind if durability risk is acceptable |
`,

  faqs: `
**How does this Caching (Systems) skill differ from the platform's Caching (CS) skill?**
The Caching (CS) skill covers single-machine caching fundamentals — CPU cache locality, LRU/LFU eviction policies, hit ratio at a computer-science-fundamentals level; this skill covers caching specifically as a DISTRIBUTED SYSTEM component — cache-aside/write-through/write-behind patterns, invalidation across a fleet of application servers, and distributed cache cluster architecture (sharding, replication).

**What is cache-aside, and why is it the dominant pattern?**
The application checks the cache first, falling back to the primary database on a miss and populating the cache for next time; it's dominant because it's simple, degrades gracefully (a cache failure just means slower, not incorrect, reads), and only caches data that's actually been requested.

**Why should I delete, rather than update, a cache entry on write?**
Updating a cache entry in place risks a race condition where a stale concurrent write's cache update could overwrite a more recent write's cache update, leaving the cache permanently inconsistent until the next write or TTL expiry; deleting lets the next read simply repopulate the cache correctly via the standard cache-aside miss path.

**What is a cache stampede, and how do I prevent it?**
When a popular cache key expires and many concurrent requests simultaneously experience a cache miss, each independently triggering a redundant database query for the same data; the standard mitigation is request coalescing — using a per-key lock so only one request actually queries the database, sharing its result with all other waiting requests.

**Why is a shared, centralized cache (Redis) often preferred over per-instance local in-process caching?**
Because invalidating data in a shared cache only needs to happen once, immediately visible to every application server reading from it, while per-instance local caching requires propagating an invalidation to every single instance — a genuinely harder problem, even though local caching can offer lower latency (no network round trip) for data that never changes.

**When should I use write-through instead of cache-aside?**
When the cache and database must never diverge, even briefly, and the added write latency (waiting for both writes to complete) is acceptable — write-through provides stronger consistency at a real write-latency cost, whereas cache-aside with TTL-based expiration accepts brief staleness in exchange for simplicity and lower write latency.
`,

  "interview-questions": `
### Junior level

1. **What is cache-aside, and how does it work?**
   Model answer: the application checks the cache first; on a hit, it returns the cached data; on a miss, it queries the primary database, then stores the result in the cache before returning it, so subsequent requests for the same data are served from the cache.

2. **What is a TTL, and why is it used for cached data?**
   Model answer: a time-to-live duration after which a cached entry automatically expires and is removed, forcing a fresh fetch from the origin on the next request — a simple safety net against cached data becoming indefinitely stale.

3. **Why should a cache entry be deleted, rather than updated, when the underlying data changes?**
   Model answer: updating in place risks a race condition where a stale write's cache update could overwrite a more recent write's update; deleting lets the next read repopulate the cache correctly and safely via the normal cache-aside miss path.

4. **What is a cache stampede?**
   Model answer: when a popular cache key expires and many concurrent requests simultaneously miss, each independently triggering a redundant database query for the same data at once, potentially overwhelming the database.

### Senior level

5. **How does this skill's treatment of caching differ from single-machine CS-level caching concepts like LRU eviction, and why does the platform cover them separately?**
   Model answer: single-machine caching (covered in the CS-level Caching skill) is fundamentally about managing a FIXED, local resource (CPU cache lines, or an in-process memory cache) using eviction policies (LRU, LFU) to decide what to keep when capacity is exceeded, with locality of reference as the core underlying principle; this distributed-systems-level skill is about an entirely different, additional set of concerns that only emerge once a cache is shared across MULTIPLE application servers and must stay reasonably consistent with a separate, external data store — cache-aside/write-through/write-behind pattern selection, invalidation propagation correctness, and distributed cache cluster architecture (sharding, replication) are genuinely distinct problems from "which item should be evicted when a local cache is full," even though both are colloquially called "caching"; the platform separates them because conflating a single-machine eviction-policy discussion with a distributed-invalidation-and-consistency discussion would muddy both.

6. **Design a caching strategy for an e-commerce product catalog that experiences occasional price updates and much heavier read traffic.**
   Model answer: use cache-aside as the primary pattern, since the workload is genuinely read-heavy with comparatively infrequent writes; on a price update, explicitly DELETE the affected product's cache entry (rather than updating it in place) as part of the same transaction/operation that updates the database, ensuring the next read repopulates the cache with the fresh price; set a moderate TTL (e.g., an hour) as a safety net in case an invalidation is ever missed due to an application bug or a direct database update bypassing the normal write path; for genuinely popular products likely to receive many simultaneous requests right after their cache entry is invalidated or expires, implement request coalescing to prevent a cache-stampede-driven spike in redundant database queries for the same product.

7. **A team is debating whether to use per-application-instance local in-process caching or a shared Redis cache for frequently-read, occasionally-updated data. What would you recommend, and why?**
   Model answer: recommend a shared Redis cache as the default, specifically because it makes invalidation correctness dramatically simpler — a single DELETE against the shared cache is immediately visible to every application server instance reading from it, whereas per-instance local caching would require propagating that same invalidation to every individual instance (via a pub/sub broadcast, for instance), a genuinely harder, more error-prone problem to get consistently correct across a growing, dynamically-scaling fleet; per-instance local caching's main advantage (avoiding a network round trip to a separate cache service) is most compelling specifically for data that essentially never changes during a given deployment's lifetime, where invalidation correctness is a non-issue — for data that's occasionally updated, as described here, the shared-cache approach's invalidation-simplicity benefit generally outweighs the added network-hop latency cost.

8. **Explain cache stampede in detail and design a complete mitigation for a high-traffic key.**
   Model answer: cache stampede occurs when a popular cache key's entry expires (or is invalidated) and many requests arrive at nearly the same moment, each independently experiencing a cache miss and triggering its own redundant database query for the identical data — potentially producing a sudden, correlated spike of duplicate database load precisely at the moment the cache is being refreshed; a complete mitigation combines request coalescing (using a per-key lock, so the FIRST request to miss acquires the lock and performs the actual database query, while subsequent concurrent requests for the same key wait and are served the same result once it's available, rather than each independently querying the database) with, ideally, probabilistic early expiration (letting a small percentage of requests, as the entry approaches its expiration time, voluntarily treat it as already-expired and trigger an early, spread-out refresh, reducing the likelihood of many requests hitting the exact expiration moment simultaneously in the first place).

9. **Compare write-through and write-behind caching for a use case tracking real-time inventory counts during a high-traffic flash sale.**
   Model answer: write-through (synchronously writing to both the cache and the database on every inventory update) provides strong consistency between the cache and the database, which is genuinely valuable for inventory counts specifically because an inconsistency here could lead to overselling a limited-stock item — but it adds real write latency, which could become a bottleneck during a flash sale's burst of concurrent purchase attempts; write-behind (acknowledging immediately after the cache write, persisting to the database asynchronously) offers lower write latency, better suited to absorbing a sudden burst of concurrent writes, but introduces a genuine data-loss risk if the cache fails before the asynchronous database write completes — for inventory counts specifically, where correctness (never overselling) is usually valued more highly than raw write latency, write-through (or an even stronger consistency mechanism, potentially involving atomic decrement operations directly in the cache combined with careful reconciliation) is generally the more defensible choice, accepting its added write latency as a reasonable cost for this use case's correctness requirements.

10. **How would you design a distributed cache cluster to handle both a growing dataset size and the risk of individual node failure?**
    Model answer: address growing dataset size via SHARDING — distributing cache keys across multiple cache nodes using consistent hashing (directly reusing the **Load Balancers** skill's own treatment of this technique), so the cluster's total capacity scales by adding more shard nodes, and so that adding or removing a node only reshuffles a small fraction of existing key-to-node mappings rather than nearly all of them; address individual node failure risk via REPLICATION — each shard has one or more replica nodes holding a copy of that shard's data, so a single node's failure doesn't lose that shard's cached data entirely (the cluster can fail over to a healthy replica); in practice, a technology like Redis Cluster implements both of these simultaneously, and a senior engineer would configure an appropriate number of shards (based on actual/projected dataset size and per-node memory capacity) and an appropriate replication factor (based on the acceptable risk of losing a shard's cached data during a node failure, understanding that this only affects the CACHE — the origin database remains the source of truth, so a lost cache shard means increased database load during cache repopulation, not genuine data loss).
`,

  "coding-questions": `
### 1. Implement cache-aside with TTL

~~~python
def get_with_cache_aside(key, fetch_fn, ttl_seconds=3600):
    cached = redis_client.get(key)
    if cached is not None:
        return deserialize(cached)
    value = fetch_fn()
    redis_client.setex(key, ttl_seconds, serialize(value))
    return value
# Follow-up: how would you extend this to also cache a
# "not found" sentinel value (negative caching) when fetch_fn
# raises a NotFoundError, and why would that be useful?
~~~

### 2. Implement invalidate-on-write

~~~python
def update_with_invalidation(key, update_fn):
    result = update_fn()  # performs the actual database write
    redis_client.delete(key)
    return result
# Follow-up: what could go wrong if the database write succeeds
# but the subsequent redis_client.delete call fails (e.g., due
# to a transient network issue) -- and how would a TTL safety
# net help bound the impact of this specific failure mode?
~~~

### 3. Implement request coalescing for cache-stampede protection

~~~python
import threading

_locks = {}
_locks_guard = threading.Lock()

def get_with_coalescing(key, fetch_fn, ttl_seconds=3600):
    cached = redis_client.get(key)
    if cached is not None:
        return deserialize(cached)

    with _locks_guard:
        lock = _locks.setdefault(key, threading.Lock())

    with lock:
        cached = redis_client.get(key)  # re-check after acquiring
        if cached is not None:
            return deserialize(cached)
        value = fetch_fn()
        redis_client.setex(key, ttl_seconds, serialize(value))
        return value
# Follow-up: this implementation's _locks dictionary grows
# unboundedly over time as new keys are seen -- how would you
# modify it to avoid an unbounded memory leak in a long-running
# process handling many distinct keys?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement and test cache-aside with Redis
Set up a local Redis instance, implement a cache-aside function in front of a simple mock database, and write tests verifying correct cache population on miss and correct data return on hit. Deliverable: a working, tested cache-aside implementation. Skills exercised: basic distributed caching implementation.

### Lab 2 (Intermediate): Implement invalidate-on-write and measure staleness
Extend Lab 1's implementation with an update function that invalidates the relevant cache key, and write tests verifying no stale data is ever returned after an update. Deliverable: a working, tested invalidate-on-write implementation. Skills exercised: cache invalidation correctness.

### Lab 3 (Advanced): Implement and load-test request coalescing
Implement request coalescing for a simulated high-traffic cache key, then load-test with many concurrent simulated requests against an expired key, measuring and verifying that only one underlying "database" query is actually issued. Deliverable: a documented load test demonstrating request coalescing's effectiveness. Skills exercised: cache-stampede mitigation and verification.

### Lab 4 (Production): Set up and test a sharded, replicated Redis Cluster
Deploy a local multi-node Redis Cluster with sharding and replication, populate it with test data, and verify both capacity scaling (data correctly distributed across shards) and fault tolerance (data remains available after simulating a node failure). Deliverable: a documented cluster setup with verified sharding and failover behavior. Skills exercised: distributed cache cluster architecture.
`,

  "real-projects": `
### 1. A read-heavy e-commerce product catalog with cache-aside and stampede protection
Engineering requirements: cache-aside caching for product data, invalidate-on-write for price/inventory updates, and request coalescing for popular product pages experiencing high concurrent traffic.

### 2. A write-through caching layer for a real-time inventory management system
Engineering requirements: write-through caching ensuring the cache and database are never inconsistent for inventory counts, specifically to prevent overselling limited-stock items during high-traffic periods.

### 3. An LLM application's inference-result caching layer
Engineering requirements: caching expensive inference/embedding results keyed on a hash of their input, with an appropriate TTL and negative caching for known-invalid inputs, reducing redundant, costly recomputation for repeated or similar queries.
`,

  "case-studies": `
### Facebook's published engineering work on scaling memcached
Facebook's widely-referenced engineering paper detailing memcached deployment at an enormous scale documented real production challenges — thundering herds, cache invalidation correctness across a vast fleet, and the specific engineering solutions (including techniques closely related to request coalescing) developed to address them — directly shaping the broader industry's understanding of these problems as genuine, recurring engineering challenges rather than edge cases. Lesson: operating a well-understood technology (memcached, in this case) at truly enormous scale surfaces genuine, previously-underappreciated engineering challenges that only become visible well beyond typical production scale, and publishing this experience can meaningfully advance an entire industry's collective understanding.

### Redis's growth from a simple caching tool into broader infrastructure
Redis's original caching use case expanded significantly over its history into session storage, rate limiting, pub/sub messaging, and more, as its rich data structures (beyond memcached's simple key-value model) proved useful for a much broader range of problems than pure caching alone — directly explaining Redis's near-universal adoption as general-purpose, fast, in-memory infrastructure rather than a caching-only tool. Lesson: a sufficiently well-designed, general-purpose core technology (rich data structures, extreme speed) can expand well beyond its original, narrower use case, becoming foundational infrastructure for a much broader set of problems.

### A common cache-stampede incident pattern across many organizations
Many organizations have independently experienced the same specific incident pattern: a popular cache key's TTL expiring during a period of high traffic, causing a sudden, correlated spike of redundant database queries that briefly overwhelms the database — common enough to have well-established, standard mitigations (request coalescing, probabilistic early expiration) as a result. Lesson: a failure pattern significant and common enough to independently recur across many different organizations and systems, eventually earning standard, well-known mitigation techniques, is worth proactively designing against from the start rather than waiting to experience it firsthand in production.
`,

  comparisons: `
| Aspect | Cache-Aside | Write-Through | Write-Behind |
|--------|------------------|--------------------|-------------------|
| Write path | App writes to DB only; cache invalidated separately | App writes to cache, which synchronously writes to DB | App writes to cache; DB write happens asynchronously |
| Write latency | Lowest (cache write is separate/optional) | Higher (waits for both writes) | Lowest (only cache write is synchronous) |
| Consistency | Eventually consistent (TTL/invalidation-dependent) | Strongly consistent | Weakest — genuine data-loss risk on cache failure |
| Best fit | Read-heavy, general-purpose default | Data needing cache/DB consistency (inventory, balances) | Write-heavy workloads where some data-loss risk is acceptable |

| Aspect | Shared Distributed Cache (Redis) | Per-Instance Local Cache |
|--------|----------------------------------------|--------------------------------|
| Invalidation complexity | Simple — one delete, immediately visible everywhere | Harder — must propagate to every instance |
| Latency | Network round trip required | Lowest (no network hop) |
| Best fit | Data that changes | Data that essentially never changes during a deployment |

**How seniors choose**: default to cache-aside with a shared Redis cache and invalidate-on-write as the standard, general-purpose pattern; reach for write-through specifically when cache/database consistency is genuinely critical (inventory, financial data); consider per-instance local caching only for genuinely immutable-during-deployment data where the latency benefit outweighs the loss of centralized invalidation simplicity.
`,

  "related-technologies": `
- **Caching (CS)** — the platform's single-machine caching fundamentals skill (eviction policies, hit ratio), which this page deliberately builds beyond into distributed-systems-specific concerns.
- **CDN** — covered immediately before this page, sharing the request-coalescing and invalidation-strategy concepts directly, applied at the internet's geographic edge rather than within an application's backend.
- **Redis** — the dominant real-world technology this page's concepts directly apply to.
- **Load Balancers** — the consistent-hashing technique distributed cache clusters rely on for sharding.
- **CAP Theorem** — the consistency-versus-performance tradeoff directly echoed in this page's cache-aside-versus-write-through comparison.

Learning path: **CDN** → this page → **Message Queues** for the next System Design technology in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued dominance of Redis as the default distributed caching technology, with its data-structure richness increasingly used for adjacent use cases beyond pure caching.
- Growing adoption of caching for LLM inference/embedding results as a standard cost-optimization pattern in production AI application architecture.
- Continued industry emphasis on request coalescing and probabilistic early expiration as standard, expected cache-stampede mitigations rather than advanced, optional techniques.
- Given continued evolution in this space, verify a specific caching technology's current exact feature set and clustering capabilities against official documentation.
`,

  "future-roadmap": `
Where distributed caching technology is heading, and what's worth betting career time on:

- **Continued growth of caching for AI/LLM workloads specifically** (inference result caching, embedding caching, semantic caching for similar-but-not-identical queries) as a distinct, increasingly important caching use case.
- **Continued dominance of Redis and Redis-compatible technologies** as the default distributed caching choice, with managed cloud offerings continuing to reduce operational burden.
- **Continued refinement of cache-stampede mitigation techniques** as standard, built-in features of caching libraries and platforms, rather than requiring custom implementation.
- **What to bet on**: deeply understanding the underlying patterns (cache-aside, invalidation correctness, request coalescing, sharding) — these transfer directly across any specific caching technology's current API, a far more durable investment than memorizing one tool's exact command syntax.
`,

  "cheat-sheet": `
~~~
# ---- Caching patterns ----
Cache-aside:    app checks cache, falls back to DB on miss,
                populates cache -- the dominant default
Write-through:  write to cache + DB synchronously -- strong
                consistency, higher write latency
Write-behind:   write to cache, DB write async/batched --
                lowest latency, real data-loss risk
~~~

~~~python
# ---- Invalidate on write: DELETE, don't update ----
def update(id, data):
    db.update(id, data)
    cache.delete(f"key:{id}")   # next read repopulates correctly
~~~

~~~
# ---- Cache stampede & its fix ----
Popular key expires -> many concurrent misses -> redundant
    DB queries for the SAME data all at once.
FIX: request coalescing (per-key lock) -- only ONE query runs,
    result shared with all waiters.
~~~

~~~
# ---- Shared cache vs per-instance local cache ----
Shared (Redis): ONE delete = invisible everywhere instantly.
Local (in-process): must propagate invalidation to EVERY instance.
Prefer shared for data that changes.
~~~

~~~
# ---- Distributed cache cluster scaling ----
Sharding:     split keys across nodes via consistent hashing
Replication:  per-shard replicas for fault tolerance
~~~

~~~
# ---- Extras worth knowing ----
Negative caching:  cache "not found" too -- stops repeated
                     lookups for keys that don't exist
Probabilistic early expiration: refresh slightly before TTL
                     to spread out refresh load
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is cache-aside? | App checks cache first, falls back to DB on miss, populates cache. |
| Why delete instead of update on write? | Avoids a race condition where a stale write could overwrite a newer cache update. |
| What is a cache stampede? | Popular key expires -> many concurrent misses -> redundant simultaneous DB queries. |
| Fix for cache stampede? | Request coalescing — per-key lock, only one query runs. |
| Write-through vs write-behind? | Write-through = sync to cache+DB, strong consistency. Write-behind = async, lower latency, data-loss risk. |
| Why prefer a shared cache over per-instance local cache? | Invalidation is ONE delete, instantly visible everywhere — no fleet-wide propagation needed. |
| What is negative caching? | Caching "not found" results too, to stop repeated lookups for nonexistent keys. |
| How does a cache cluster scale capacity? | Sharding — consistent hashing splits keys across multiple nodes. |
| How does a cache cluster handle node failure? | Replication — each shard has replica(s) holding a copy of its data. |
| How does this differ from CS-level caching (LRU etc.)? | This is distributed-systems-level: patterns, invalidation across a fleet, cluster architecture — not single-machine eviction policy. |
`,

  mcqs: `
1. What is the dominant, default distributed caching pattern?
   A) Write-behind  B) Cache-aside  C) Write-through  D) No caching at all
   **Answer: B** — simple, degrades gracefully on cache failure, only caches what's actually requested.

2. Why should a cache entry be deleted rather than updated in place on write?
   A) Deleting is faster  B) Updating risks a race condition where a stale write could overwrite a more recent cache update  C) Redis doesn't support updates  D) It's not actually recommended
   **Answer: B** — deleting lets the next read safely repopulate via the normal cache-aside path.

3. What is a cache stampede?
   A) Too much data cached at once  B) A popular key's expiration causing many concurrent requests to redundantly query the database simultaneously  C) A cache cluster failing over  D) A type of eviction policy
   **Answer: B** — mitigated via request coalescing.

4. Why is a shared, centralized cache (like Redis) often preferred over per-instance local in-process caching for changing data?
   A) It's always faster  B) Invalidation only needs to happen once, immediately visible to every application server, versus needing to propagate to every instance individually  C) Local caching doesn't exist  D) Shared caches never fail
   **Answer: B** — a genuinely simpler invalidation correctness story for data that changes.

5. How does sharding help a distributed cache cluster scale?
   A) It duplicates all data on every node  B) It distributes keys across multiple nodes using consistent hashing, scaling total capacity beyond a single node  C) It replaces the need for replication  D) It only works for read-only data
   **Answer: B** — directly reuses the consistent-hashing technique covered in the Load Balancers skill.
`,

  "revision-notes": `
Distributed caching systems store frequently-accessed data in a fast, typically in-memory layer (Redis being the dominant modern technology) between an application and its primary data store, reducing origin load and latency — this skill is deliberately distinct from the platform's **Caching (CS)** skill, which covers single-machine caching fundamentals (eviction policies, hit ratio); this page instead covers caching as a DISTRIBUTED SYSTEM component.

CACHE-ASIDE (lazy loading) is the dominant pattern: the application checks the cache first, falls back to the primary database on a miss, and populates the cache for next time — simple, and degrading gracefully (a cache failure just means slower reads, not incorrect ones). WRITE-THROUGH writes to the cache and database synchronously together, providing STRONG consistency at a real write-latency cost — appropriate for data (inventory counts, financial balances) where cache/database divergence would cause genuine harm. WRITE-BEHIND acknowledges immediately after the cache write, persisting to the database asynchronously (often batched), offering the lowest write latency at the cost of a genuine DATA-LOSS RISK if the cache fails before the database write completes.

A critical, frequently-tested implementation detail: on a write, the standard practice is to DELETE the affected cache entry, NOT update it in place — updating in place risks a race condition where a stale concurrent write's cache update could overwrite a more recent write's update, leaving the cache permanently inconsistent until the next write or TTL expiry; deleting lets the next read safely repopulate the cache via the normal cache-aside miss path.

CACHE STAMPEDE (or "thundering herd," directly paralleling the identical problem covered in the **CDN** skill) occurs when a popular cache key expires and many concurrent requests simultaneously experience a cache miss, each independently triggering a redundant database query for the same data — mitigated via REQUEST COALESCING, using a per-key lock so only the FIRST request actually queries the database, with its result shared among all other concurrently-waiting requests for that same key. PROBABILISTIC EARLY EXPIRATION further refines this by letting a small percentage of requests, as an entry approaches expiration, voluntarily treat it as already-expired and trigger an early, spread-out refresh, reducing the likelihood of many requests hitting the exact expiration moment simultaneously.

A genuinely important architectural point: a SHARED, CENTRALIZED CACHE (Redis) is generally preferred over PER-INSTANCE LOCAL (in-process) caching for data that changes, specifically because invalidation in a shared cache only needs to happen ONCE, immediately visible to every application server reading from it — while per-instance local caching requires propagating that same invalidation to EVERY individual instance, a genuinely harder, more error-prone problem at scale; local caching's advantage (avoiding a network round trip) is most compelling specifically for genuinely immutable-during-deployment data, where invalidation correctness is simply not a concern.

DISTRIBUTED CACHE CLUSTER ARCHITECTURE combines SHARDING (distributing keys across multiple nodes via consistent hashing, directly reusing the **Load Balancers** skill's own treatment of this technique, scaling total capacity beyond a single node) with REPLICATION (per-shard replicas providing fault tolerance, so a single node's failure doesn't lose that shard's cached data entirely) — a technology like Redis Cluster implements both simultaneously. NEGATIVE CACHING (caching the fact that a lookup returned "not found," not just successful results) protects against cache-penetration-style abuse, where repeated queries for known-nonexistent keys would otherwise bypass the cache and load the origin directly on every single request.

For AI engineering specifically, caching COMPUTED OR EXPENSIVE-TO-DERIVE RESULTS (not just raw entity data) is an increasingly important pattern — caching LLM inference results or embeddings keyed on a hash of their input avoids redundant, often genuinely costly recomputation for repeated or similar queries, directly connecting distributed caching's general principles to a concrete, high-value AI application optimization.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding cache-aside, TTL, and basic Redis usage. Milestone: complete Lab 1, with a working, tested cache-aside implementation.

**Week 2 — Invalidation**: implementing and testing invalidate-on-write correctness. Milestone: complete Lab 2, with verified no-stale-data behavior after updates.

**Week 3 — Stampede protection**: implementing and load-testing request coalescing. Milestone: complete Lab 3, with a documented load test demonstrating effectiveness.

**Week 4 — Cluster architecture**: deploying and testing a sharded, replicated Redis Cluster. Milestone: complete Lab 4, with verified sharding and failover behavior.

**Week 5 — Applied pattern selection**: practicing choosing between cache-aside, write-through, and write-behind for a range of described real-world data scenarios, justifying each choice.

Next platform skill once this roadmap is complete: **Message Queues**, the next System Design technology in this category.
`,

  "official-docs": `
- **Redis's official documentation** — the authoritative, comprehensive reference for the dominant modern distributed caching technology.
- **AWS ElastiCache, Azure Cache for Redis official documentation** — the authoritative references for each cloud provider's managed offering.
- **Facebook's published engineering paper on scaling memcached** ("Scaling Memcache at Facebook") — a widely-referenced, detailed account of real production challenges at enormous scale.
`,

  books: `
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — covers caching patterns and distributed consistency concepts with exceptional depth.
- **"System Design Interview" — Alex Xu** — covers distributed caching within broader system design interview scenarios.
- **"Redis in Action" — Josiah Carlson** — a focused, practical guide to Redis usage across caching and adjacent use cases.
`,

  blogs: `
- **Redis's official engineering blog** — practical, product-specific guidance on caching patterns and cluster architecture.
- **Facebook/Meta's engineering blog** — historical and ongoing publication of large-scale caching infrastructure lessons.
- **High Scalability** — regularly covers distributed caching architecture decisions within broader system design case studies.
`,

  "research-papers": `
- **Nishtala, R. et al. — "Scaling Memcache at Facebook"** (2013) — a detailed, widely-referenced account of distributed caching challenges and solutions at enormous production scale.
- **Karger, D. et al. — "Consistent Hashing and Random Trees"** (1997) — the foundational technique underlying distributed cache cluster sharding, directly shared with the **Load Balancers** skill.
`,

  videos: `
- **Redis's official conference talks and tutorials** — practical, product-specific configuration and architecture guidance.
- **Facebook engineering talks on memcached scaling** — detailed, firsthand accounts of distributed caching challenges at scale.
- **System design interview preparation channels** covering distributed caching design as a common interview topic.
`,

  "github-repos": `
- **redis/redis** — the official Redis source repository.
- **memcached/memcached** — the official memcached source repository, an important historical and still-relevant distributed caching technology.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Pattern selection**: given a described data workload (read/write ratio, consistency needs), choose and justify cache-aside, write-through, or write-behind.
2. **Invalidation correctness**: given a described write path, identify whether it correctly invalidates the relevant cache entries and fix any gaps.
3. **Cache stampede mitigation design**: design a complete request-coalescing and probabilistic-early-expiration strategy for a described high-traffic key.
4. **Cluster capacity planning**: given a described dataset size and per-node memory capacity, calculate an appropriate number of shards and replication factor.
5. **External practice sets**: "System Design Interview" (Alex Xu) practice problems covering distributed caching design within broader system design scenarios.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph AppFleet["Application Server Fleet"]
        App1["App Server 1"]
        App2["App Server 2"]
        App3["App Server 3"]
    end
    subgraph CacheCluster["Distributed Cache Cluster (Redis)"]
        Shard1["Shard 1 + Replica"]
        Shard2["Shard 2 + Replica"]
        Shard3["Shard 3 + Replica"]
    end
    subgraph Origin["Primary Data Store"]
        DB["Database"]
    end
    App1 --> CacheCluster
    App2 --> CacheCluster
    App3 --> CacheCluster
    CacheCluster -.->|cache miss| DB
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Caching Systems))
    Foundations
      Overview
      History memcached Redis
      Why it exists
      Problem it solves
      Distinct from CS level caching
    Patterns
      Cache aside
      Write through
      Write behind
      Read through
    Invalidation
      TTL
      Delete on write
      Explicit purge
    Stampede Protection
      Request coalescing
      Probabilistic early expiration
      Negative caching
    Cluster Architecture
      Sharding
      Consistent hashing
      Replication
    Shared vs Local Cache
      Shared cache simpler invalidation
      Local cache lower latency
    AI Specific
      Inference result caching
      Embedding caching
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default cachingSystems;
