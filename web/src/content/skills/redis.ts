import type { SkillContent } from "../types";

/**
 * Redis — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const redis: SkillContent = {
  overview: `
Redis is an in-memory data store that doubles as a cache, a message broker, and a lightweight primary database, built around one defining bet: keeping data entirely in RAM, with a small, purpose-built set of data structures (not just plain key-value strings), makes an enormous class of application problems dramatically faster and simpler to solve than reaching for a full disk-backed database. Where most databases treat "fast" as a property to optimize for within a broader feature set, Redis treats speed as the starting design constraint everything else is built around.

For an AI engineer, Redis is nearly ubiquitous — the caching layer sitting in front of a slower database (PostgreSQL, MySQL) to absorb repeated reads, the session store for a web application, the rate-limiter protecting an LLM API from abuse, the pub/sub backbone letting multiple server instances coordinate, and increasingly the vector-search-capable store (via Redis Stack's RediSearch module) used for RAG applications needing extremely low-latency retrieval. Redis rarely stands alone as an application's only database — it is the layer that makes everything else faster.

Key characteristics: primarily in-memory (though with configurable disk persistence for durability), single-threaded command execution for the core data operations (a deliberate simplicity/consistency tradeoff, not a limitation to work around), a rich set of native data structures (strings, hashes, lists, sets, sorted sets, streams, and more) each with purpose-built operations, built-in pub/sub messaging, and Redis Cluster for horizontal scaling and sharding across many nodes.
`,

  history: `
Redis was created by **Salvatore Sanfilippo** (widely known by his handle "antirez"), originally to solve a real-time analytics problem for his own startup, later releasing the resulting tool as open source once he recognized its broader usefulness.

| Year | Milestone |
|------|-----------|
| 2009 | Salvatore Sanfilippo releases Redis, originally built to scale the real-time web analytics needs of his own startup, LLOOGG |
| 2010 | VMware hires Sanfilippo to work on Redis full-time, providing the project's first significant corporate backing |
| 2011 | Pivotal (a VMware spinoff) continues sponsoring Redis development |
| 2013 | Redis Sentinel ships, providing automated monitoring, failover, and high-availability management for Redis deployments |
| 2015 | **Redis Cluster** ships, adding native horizontal sharding across many nodes — a major architectural milestone for scaling beyond a single instance's memory capacity |
| 2018 | Redis Labs (the commercial company behind Redis, later renamed simply Redis) begins adding "Redis Modules" (RediSearch, RedisJSON, RedisGraph, RedisTimeSeries), extending Redis's core data structures with specialized capabilities |
| 2020 | Salvatore Sanfilippo steps back from active Redis core development, handing the project to the broader community and Redis Labs' engineering team |
| 2022 | Redis Stack is introduced, bundling core Redis with the most popular modules (RediSearch, RedisJSON, and others) as a unified distribution |
| 2024 | **Redis changes its license** from the permissive BSD license to the more restrictive SSPL/RSALv2 dual license, directly citing cloud providers offering Redis-as-a-service without contributing back — closely echoing MongoDB's 2019 SSPL decision |
| 2024 | In direct response, several major cloud providers and open-source contributors fork Redis to create **Valkey**, now stewarded by the Linux Foundation, positioned as the community-governed continuation of the original open-source Redis |
| 2025+ | Continued Redis Inc. development under the new license, alongside Valkey's independent, foundation-governed development — a permanently split ecosystem, closely mirroring the MySQL/MariaDB precedent |

Redis's 2024 licensing change and the resulting Valkey fork is a direct, almost beat-for-beat repeat of both MongoDB's 2019 SSPL decision and MySQL's 2010 Oracle-acquisition-driven MariaDB fork — a recurring pattern worth recognizing across the database industry: as cloud providers commoditize managed hosting of popular open-source databases, the original stewards increasingly restrict licensing, and the community response is frequently an independent, foundation-governed fork.
`,

  "why-it-exists": `
Redis exists because of a very concrete problem Sanfilippo faced building real-time web analytics: **relational (or even document) databases, being disk-oriented and general-purpose, were simply too slow for the specific, narrow class of operations his application actually needed** — incrementing counters, maintaining sorted leaderboards, and reading/writing small pieces of data at extremely high frequency and low latency.

The prior landscape offered:

1. **General-purpose databases (relational or document)**: flexible and durable, but their disk-oriented architecture and general-purpose query capability came with latency overhead unnecessary for simple, narrow, extremely-high-frequency operations.
2. **Memcached** (an earlier, simpler in-memory cache): fast and simple, but limited to plain key-value string storage — no native support for the richer operations (sorted sets for leaderboards, lists for queues, atomic increments) many real-time applications actually needed.

Redis's insight was that keeping data ENTIRELY in memory, combined with a small set of PURPOSE-BUILT data structures (not just strings) each with operations tailored to common real-world patterns (INCR for counters, sorted sets for leaderboards and range queries, lists for queues), could solve an enormous class of "I need this specific operation to be extremely fast" problems more directly and simply than forcing the same operation through a general-purpose database's more flexible but slower query layer. The single-threaded execution model was itself a deliberate simplicity choice — since commands execute one at a time with no interleaving, an enormous class of concurrency bugs (race conditions between commands) simply cannot occur, trading raw multi-core parallelism for predictability and simplicity.
`,

  "problem-it-solves": `
Redis solves the **"I need certain specific operations to be extremely fast and simple to reason about, faster than a general-purpose database can provide"** problem.

Concretely, Redis provides:

- **In-memory speed**: reads and writes measured in sub-millisecond latency, since data lives in RAM rather than requiring disk I/O for the common case.
- **Purpose-built data structures**: sorted sets for leaderboards and range queries, lists for queues, hashes for structured objects, sets for membership testing and set operations, and streams for append-only event logs — each with operations tailored to its specific use case, rather than forcing every pattern through generic key-value get/set.
- **Atomic operations without explicit locking**: because Redis is single-threaded for command execution, operations like INCR (atomic increment) or a sorted-set update are inherently atomic with no risk of a race condition between two concurrent clients, without the application needing to manage locks itself.
- **Built-in pub/sub messaging**: letting multiple application instances broadcast and subscribe to real-time events without a separate message broker for simpler use cases.
- **Configurable persistence**: while primarily in-memory, Redis can persist data to disk (via RDB snapshots or AOF logging) for durability across restarts, letting teams choose their own point on the speed-versus-durability spectrum.

What Redis deliberately does **not** solve: it is not designed to be a system of record for data requiring the full ACID transactional guarantees and complex relational querying a database like PostgreSQL provides — Redis's transactions (MULTI/EXEC) provide atomicity but not the same isolation guarantees, and its query capability is deliberately narrow (built around specific data structure operations, not an arbitrary declarative query language). It also fundamentally requires enough RAM to hold the working data set, which is a real cost and capacity-planning constraint unlike a disk-oriented database that can hold far more data than fits in memory.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Redis's core data structures (strings, hashes, lists, sets, sorted sets) and choose the right one for a given problem.
2. Use Redis effectively as a cache, including appropriate expiration/eviction strategies and cache invalidation patterns.
3. Implement common patterns (rate limiting, session storage, leaderboards, distributed locks) using Redis's native operations.
4. Understand Redis's persistence options (RDB, AOF) and their durability/performance tradeoffs.
5. Explain Redis's single-threaded execution model and its implications for both simplicity and potential blocking operations.
6. Configure and reason about Redis replication and Redis Sentinel for high availability.
7. Design an appropriate Redis Cluster sharding strategy for horizontal scaling.
8. Use Redis pub/sub and Streams appropriately for messaging and event-driven patterns.
9. Answer senior-level interview questions on Redis's data structures, persistence tradeoffs, and cache invalidation strategy.
`,

  prerequisites: `
- **Required**: general programming fundamentals — Redis's data structures map closely to common programming language primitives (hashes, lists, sets), and this page assumes comfort with those concepts already.
- **Helpful**: the **PostgreSQL** or **MySQL** skill — Redis is almost always deployed ALONGSIDE a primary database as a caching/acceleration layer, and understanding what it's accelerating clarifies why specific Redis patterns exist.
- **Helpful**: the **Caching (Systems)** skill for the general theory (cache-aside, write-through, eviction policies) Redis implements concretely.

Dependency links: general programming fundamentals → **PostgreSQL**/**MySQL** for the primary database Redis typically accelerates → this page → **Caching (Systems)** and **Message Queues** for the broader architectural patterns Redis fits into → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Strings — the simplest data type

~~~
SET user:1:name "Ada"
GET user:1:name
SET page:views 0
INCR page:views          -- atomically increments; returns the new value
EXPIRE user:1:name 3600   -- expires this key after 3600 seconds (1 hour)
~~~

Every Redis key maps to a value of a specific data type; strings are the simplest, supporting atomic operations like INCR/DECR directly at the database level — no need to fetch, increment in application code, and write back, avoiding a race condition entirely.

### Hashes — structured objects

~~~
HSET user:1 name "Ada" email "ada@example.com" age 36
HGET user:1 name
HGETALL user:1
HINCRBY user:1 age 1
~~~

A hash stores multiple field-value pairs under one key, roughly analogous to a small JSON object or a row with named columns — useful for representing a single entity (a user, a product) without needing to store it as a serialized JSON string.

### Lists — ordered collections, often used as queues

~~~
LPUSH tasks "task1"     -- push to the left (front)
RPUSH tasks "task2"      -- push to the right (back)
LRANGE tasks 0 -1         -- get all elements
LPOP tasks                 -- pop from the front (FIFO queue pattern)
~~~

Lists maintain insertion order and support efficient push/pop from either end, making them a natural fit for simple queue (FIFO, using RPUSH + LPOP) or stack (LIFO, using LPUSH + LPOP) patterns.

### Sets — unique, unordered collections

~~~
SADD tags:post1 "database" "nosql" "redis"
SISMEMBER tags:post1 "redis"    -- fast O(1) membership check
SINTER tags:post1 tags:post2      -- set intersection: shared tags between two posts
~~~

Sets guarantee uniqueness automatically and support fast membership testing and set operations (union, intersection, difference) directly at the database level, useful for tagging, deduplication, and relationship queries.

### Sorted sets — ranked, scored collections

~~~
ZADD leaderboard 100 "Ada"
ZADD leaderboard 85 "Bob"
ZRANGE leaderboard 0 -1 WITHSCORES         -- all members, ranked ascending by score
ZREVRANGE leaderboard 0 2 WITHSCORES        -- top 3, ranked descending
~~~

A sorted set associates a numeric score with each member, automatically maintaining sorted order — the natural data structure for leaderboards, priority queues, and time-ordered data (using a timestamp as the score).

### Expiration and TTL

~~~
SET session:abc123 "user_data" EX 1800   -- expires in 1800 seconds
TTL session:abc123                         -- check remaining time-to-live
PERSIST session:abc123                      -- remove the expiration, making it permanent
~~~

Automatic expiration (TTL) is central to Redis's role as a cache — data can be set to disappear automatically after a period, without the application needing to explicitly clean up stale entries.

Common beginner trap: storing everything as a serialized JSON string in a plain Redis string value instead of using the appropriate native data structure (hash, sorted set) — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### Cache-aside pattern (the most common Redis usage)

~~~python
def get_user(user_id):
    cached = redis_client.get(f"user:{user_id}")
    if cached is not None:
        return json.loads(cached)

    user = database.query("SELECT * FROM users WHERE id = %s", user_id)
    redis_client.set(f"user:{user_id}", json.dumps(user), ex=3600)
    return user
~~~

The cache-aside pattern is Redis's most common real-world application: check the cache first, fall back to the slower database on a miss, then populate the cache for next time — the application, not Redis itself, is responsible for keeping the cache reasonably fresh (typically via a TTL, or explicit invalidation on writes).

### Cache invalidation on writes

~~~python
def update_user(user_id, new_data):
    database.execute("UPDATE users SET ... WHERE id = %s", user_id)
    redis_client.delete(f"user:{user_id}")   -- invalidate rather than update in place
~~~

Explicitly deleting (rather than trying to update) the cached value on a write is generally the safer, simpler pattern — "there are only two hard things in computer science: cache invalidation and naming things" is a famous, only-half-joking observation, and simple invalidation avoids the harder problem of keeping a cached value's structure in perfect sync with every possible write.

### Rate limiting with INCR and EXPIRE

~~~python
def is_rate_limited(user_id, max_requests=100, window_seconds=60):
    key = f"rate_limit:{user_id}"
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, window_seconds)
    return current > max_requests
~~~

A simple, effective fixed-window rate limiter: INCR atomically increments a per-user counter, and EXPIRE (set only on the first request in a new window) ensures the counter resets after the window — this exact pattern is extremely common for protecting an LLM API endpoint from abuse or runaway cost.

### Distributed locks with SET NX

~~~python
lock_acquired = redis_client.set("lock:resource1", "owner_id", nx=True, ex=10)
if lock_acquired:
    try:
        # critical section
        pass
    finally:
        redis_client.delete("lock:resource1")
~~~

SET with the NX (only set if Not eXists) flag provides a simple distributed lock: only one client can successfully set the key, and the EX expiration prevents a permanently stuck lock if the holder crashes before releasing it — a simplified version of the more rigorous Redlock algorithm covered in Advanced Concepts.

### Pub/Sub messaging

~~~python
# Publisher
redis_client.publish("notifications", json.dumps({"user_id": 42, "message": "New order"}))

# Subscriber
pubsub = redis_client.pubsub()
pubsub.subscribe("notifications")
for message in pubsub.listen():
    if message["type"] == "message":
        handle_notification(json.loads(message["data"]))
~~~

Pub/sub lets multiple subscribers receive messages published to a channel in real time — useful for broadcasting events across multiple application instances, though Redis's basic pub/sub does NOT persist messages for subscribers who weren't connected at publish time (Redis Streams, covered in Advanced Concepts, address this gap).

### Redis transactions with MULTI/EXEC

~~~
MULTI
INCR page:views
SADD viewed_by:page1 "user42"
EXEC
~~~

MULTI queues a sequence of commands, and EXEC executes them all together, uninterrupted by another client's commands in between — providing atomicity (all queued commands execute as a block) but NOT the same rollback-on-error semantics as a relational database transaction; a command that fails partway doesn't automatically undo earlier commands in the same MULTI block.
`,

  "advanced-concepts": `
### Redis's single-threaded execution model

~~~mermaid
flowchart LR
    A["Many client connections"] --> B["Single event loop\n(one thread executes commands)"]
    B --> C["In-memory data structures"]
    B --> D["Background threads:\npersistence (RDB/AOF),\nkey expiration, some I/O"]
~~~

Redis's core command execution is single-threaded — commands run one at a time, with no interleaving, which is precisely why individual commands (and MULTI/EXEC blocks) are atomic without any explicit locking. This is a deliberate design tradeoff: Redis gives up multi-core parallelism for command execution in exchange for eliminating an entire class of race-condition bugs; separate background threads DO handle certain I/O-bound work (persistence writes, some networking since Redis 6's I/O threading improvements), but the actual command logic itself remains single-threaded.

### Why this matters: avoid slow commands

~~~
-- DANGEROUS on a large collection: KEYS scans the ENTIRE keyspace,
-- blocking every other client for the duration on a large database
KEYS user:*

-- SAFER: SCAN incrementally iterates without blocking,
-- trading a single atomic snapshot for non-blocking behavior
SCAN 0 MATCH user:* COUNT 100
~~~

Because Redis is single-threaded, any command that takes a long time to execute (KEYS on a huge keyspace, a poorly-designed Lua script, an operation on an enormous list/set) blocks EVERY other client's commands for its entire duration — this is Redis's single most consequential architectural fact for production operation, directly analogous to Node.js's event-loop-blocking concern, and SCAN's incremental, non-blocking iteration exists specifically to provide a safe alternative to KEYS in production.

### Persistence: RDB snapshots and AOF logging

~~~
save 900 1      -- RDB: snapshot if at least 1 key changed in 900 seconds
appendonly yes   -- AOF: log every write operation for more durable, granular recovery
appendfsync everysec
~~~

RDB (Redis Database) periodically snapshots the entire in-memory dataset to disk — compact and fast to restore from, but can lose data written since the last snapshot on a crash. AOF (Append-Only File) logs every write operation, allowing more granular recovery (losing at most roughly one second of data with appendfsync everysec) at the cost of a larger file and slightly slower write performance. Many production deployments use both together, RDB for fast full-dataset recovery and AOF for minimizing data loss on crash.

### Eviction policies

~~~
maxmemory 4gb
maxmemory-policy allkeys-lru   -- evict least-recently-used keys when memory limit is reached
~~~

When Redis is used purely as a cache (not requiring durability), maxmemory-policy determines what happens when memory fills up — allkeys-lru (evict least-recently-used) and allkeys-lfu (evict least-frequently-used) are common choices; noeviction (the default) instead REJECTS new writes once the memory limit is hit, appropriate when Redis is being used as more than just a disposable cache and data loss via eviction would be unacceptable.

### Redis Cluster and sharding

~~~mermaid
flowchart TB
    Client["Client"] --> Node1["Node 1\n(hash slots 0-5460)"]
    Client --> Node2["Node 2\n(hash slots 5461-10922)"]
    Client --> Node3["Node 3\n(hash slots 10923-16383)"]
    Node1 -->|replication| Node1R["Node 1 replica"]
    Node2 -->|replication| Node2R["Node 2 replica"]
    Node3 -->|replication| Node3R["Node 3 replica"]
~~~

Redis Cluster distributes data across multiple nodes using 16384 hash slots, each key's slot determined by hashing the key (or a specified "hash tag" for keeping related keys on the same node); each node can have replicas for high availability, letting Redis scale both write capacity (via sharding) and read availability (via replicas) beyond a single instance's memory and connection capacity.

### Redis Streams

~~~
XADD orders * customer_id 42 amount 100
XREAD COUNT 10 STREAMS orders 0
XGROUP CREATE orders processors 0
XREADGROUP GROUP processors consumer1 COUNT 10 STREAMS orders >
~~~

Redis Streams provide an append-only log data structure with consumer groups, closing the gap basic pub/sub leaves (message persistence and guaranteed delivery to a group of competing consumers) — a lighter-weight alternative to a full message broker like Kafka or RabbitMQ for many use cases, directly built into Redis itself.

### The Redlock algorithm for distributed locking

The simple SET NX pattern (covered in Intermediate Concepts) works correctly against a single Redis instance, but is NOT safe against a Redis Cluster or a replica failover scenario where the lock could be "lost" during a leadership change — Redlock is Sanfilippo's own proposed algorithm for acquiring a lock safely across multiple independent Redis instances, requiring a majority to agree; it remains a genuinely debated topic in distributed systems circles (notably challenged by Martin Kleppmann's widely-read critique), and teams needing truly rigorous distributed locking guarantees often reach for a purpose-built consensus system (like a database offering serializable transactions, or ZooKeeper/etcd) instead.
`,

  "internal-working": `
What happens inside Redis from a client command to a completed response:

~~~mermaid
flowchart LR
    A["Client sends command\n(e.g. SET key value)"] --> B["Single-threaded event loop\nreceives and parses the command"]
    B --> C["Command executes against\nin-memory data structures"]
    C --> D["Response sent to client"]
    C -.-> E["Background: RDB snapshot\nor AOF log write, if configured"]
    C -.-> F["Background: key expiration\nsweep, lazy + active"]
~~~

1. **Command reception**: Redis's single-threaded event loop (built on an efficient I/O multiplexing mechanism, similar in spirit to Node.js's event loop) receives and parses incoming commands from potentially many concurrent client connections.
2. **Sequential execution**: each command executes fully, one at a time, against Redis's in-memory data structures — this sequential execution is exactly why individual commands (and MULTI/EXEC blocks) are atomic without any explicit locking mechanism needed.
3. **Response and persistence**: the response is sent back to the client; if persistence is configured (RDB and/or AOF), the write is also recorded for durability, generally handled in a way that doesn't block the main command-processing loop for long (background forking for RDB snapshots, buffered writes for AOF).
4. **Key expiration**: Redis removes expired keys both "lazily" (checking expiration when a key is accessed) and "actively" (a background process periodically sampling and removing expired keys), balancing memory reclamation against the cost of an exhaustive scan.

**Why RDB snapshotting doesn't block the main thread for long**: Redis uses the operating system's fork() to create a child process for RDB snapshot writes, leveraging copy-on-write memory semantics — the child process sees a consistent point-in-time view of memory without needing to pause the parent process's command processing for the snapshot's full duration, though the fork itself has a brief, real cost proportional to dataset size that's worth being aware of for very large datasets.
`,

  architecture: `
A senior engineer thinks about Redis at two levels: **what Redis actually holds in memory and how it's structured** (data structure choice per use case) and **how Redis fits into a broader application architecture** (as an accelerator, not typically a system of record on its own).

### Redis's role in a typical application architecture

~~~mermaid
flowchart TB
    App["Application servers"] --> Redis[("Redis\ncache, sessions, rate limiting,\npub/sub, queues")]
    App --> DB[("PostgreSQL/MySQL/MongoDB\nsystem of record")]
    Redis -.->|cache-aside pattern| DB
~~~

Redis very rarely stands alone as an application's ONLY data store — the overwhelmingly common pattern is Redis accelerating and offloading specific, narrow responsibilities (caching, sessions, rate limiting, real-time coordination) from a slower, more durable primary database that remains the actual system of record.

### Choosing the right data structure per use case

~~~
Use case                          -> Redis data structure
Simple cached value/counter        -> String (with INCR/DECR, EXPIRE)
A structured object (user profile) -> Hash
A queue/stack                       -> List
Tags, deduplication, membership     -> Set
Leaderboard, priority queue          -> Sorted Set
Event log, message queue with groups -> Stream
Real-time broadcast (no persistence) -> Pub/Sub
~~~

Rules mature Redis teams follow: choose the data structure matching the actual access pattern rather than defaulting to strings-with-serialized-JSON for everything; set explicit TTLs on cache entries rather than relying on eviction policy alone; and treat Redis as a specialized accelerator layer with a clear, narrow responsibility, not a general-purpose database replacement.
`,

  "data-flow": `
Tracing one cache-aside request end to end:

~~~mermaid
sequenceDiagram
    participant App
    participant Redis
    participant DB as Primary database

    App->>Redis: GET user:42
    alt Cache hit
        Redis-->>App: cached user data
    else Cache miss
        Redis-->>App: nil (not found)
        App->>DB: SELECT * FROM users WHERE id = 42
        DB-->>App: user row
        App->>Redis: SET user:42 (data) EX 3600
        Redis-->>App: OK
    end
~~~

The most misunderstood part for newcomers: **Redis is not automatically kept in sync with the primary database** — the application is entirely responsible for the cache-aside logic shown above, including invalidating or updating the cached value whenever the underlying database record changes; Redis has no built-in awareness of your PostgreSQL/MySQL schema or its writes, and a common, damaging bug is updating the primary database while forgetting to invalidate the corresponding cached entry, leaving stale data served indefinitely (or until the TTL happens to expire).
`,

  "production-usage": `
### Connecting and basic configuration

~~~
bind 127.0.0.1 -::1
requirepass a-strong-password-here
maxmemory 4gb
maxmemory-policy allkeys-lru
~~~

Non-negotiables for production:

1. **Always set requirepass (or use ACLs) and never expose Redis directly to the internet** — Redis has historically had numerous well-publicized incidents of exposed, unauthenticated instances being scraped or hijacked (frequently for cryptocurrency mining via Lua scripting abuse), a pattern directly analogous to MongoDB's historical exposed-instance incidents.
2. **maxmemory and an appropriate maxmemory-policy configured explicitly** — an unbounded Redis instance can consume all available system memory, and the wrong eviction policy (noeviction when acting purely as a cache) causes writes to fail once memory fills rather than gracefully evicting old data.
3. **Persistence configured deliberately** (RDB, AOF, or both) matching the actual durability requirement — a pure cache may reasonably accept no persistence at all, while Redis used for anything requiring durability (session data, queue contents) needs it configured thoughtfully.

### Common production stacks

- **Caching layer**: Redis in front of PostgreSQL/MySQL/MongoDB, the single most common Redis deployment pattern across nearly every backend framework covered on this platform.
- **Session storage**: Redis backing session state for web applications, letting multiple stateless application instances share session data (see the Django, Flask, Express, and Spring Boot skills' respective session-handling sections).
- **Rate limiting and API protection**: Redis-based rate limiters protecting LLM API endpoints and other cost-sensitive or abuse-prone routes.
- **Job queues**: Redis backing lightweight job queue libraries (Celery with a Redis broker, BullMQ, Sidekiq) for background task processing.
`,

  "industry-examples": `
- **Twitter (X)**: uses Redis extensively for timeline caching and real-time features, one of the most cited large-scale Redis deployments given the platform's need for extremely low-latency reads of frequently-changing data.
- **GitHub**: uses Redis for caching, background job queuing (via Sidekiq), and rate limiting across its platform.
- **Snapchat**: uses Redis for real-time messaging infrastructure, leveraging its low-latency pub/sub and data structure operations.
- **Stack Overflow**: has published detailed engineering content on using Redis as a caching layer to achieve its famously lean server footprint relative to its traffic volume.
- **Instagram**: uses Redis extensively alongside its PostgreSQL infrastructure (see the PostgreSQL skill's Case Studies) for feed and session caching at massive scale.
- **Uber**: uses Redis for various real-time features including rate limiting and caching across its ride-matching and dispatch systems.
- **Many AI-application backends industry-wide**: Redis-based rate limiting in front of expensive LLM API calls is an extremely common, almost default pattern for any production AI feature needing to control per-user cost and abuse exposure.

Pattern to notice: Redis adoption is nearly universal as a SUPPORTING layer rather than a primary database — appearing alongside PostgreSQL, MySQL, or MongoDB in the vast majority of production architectures specifically to absorb the "this needs to be very fast and simple" subset of an application's overall data needs.
`,

  "best-practices": `
1. **Choose the data structure matching the actual access pattern** — sorted sets for leaderboards, hashes for structured objects, lists for queues — rather than defaulting to serialized JSON strings for everything.
2. **Always set an explicit TTL on cache entries** rather than relying solely on an eviction policy, giving predictable, bounded staleness.
3. **Invalidate (delete), don't try to update, cached values on a write** to the underlying source of truth — simpler and less error-prone than keeping a cached value's structure in perfect sync.
4. **Never use KEYS in production** — use SCAN for any operation needing to iterate the keyspace, since KEYS blocks every other client for its full duration on Redis's single-threaded execution model.
5. **Set maxmemory and an appropriate maxmemory-policy explicitly** — never leave Redis's memory usage unbounded, and choose noeviction only when data loss via eviction is genuinely unacceptable.
6. **Always require authentication (requirepass or ACLs) and never expose Redis directly to the internet** — the single most common, most damaging Redis production misconfiguration.
7. **Use pipelining for batches of independent commands** to reduce network round-trip overhead, rather than issuing many individual commands sequentially.
8. **Prefer Redis Streams over basic pub/sub when message persistence or guaranteed delivery to a consumer group matters** — plain pub/sub drops messages for disconnected subscribers.
9. **Configure persistence deliberately based on actual durability needs** — don't assume a default configuration matches your specific tolerance for data loss on a crash.
10. **Use hash tags for related keys in a Redis Cluster deployment** (e.g., {user:42}:profile and {user:42}:sessions) to ensure they land on the same node, enabling multi-key operations that Redis Cluster otherwise restricts across different hash slots.
11. **Monitor slow commands and avoid large, unbounded collections** (a single list/set/hash growing to millions of elements) that make even normally-fast operations on that key slow.
12. **Treat Redis as an accelerator, not a system of record**, unless you've deliberately, knowingly accepted the durability tradeoffs of using it as your primary data store for a specific, bounded use case.
`,

  "anti-patterns": `
### Using KEYS in production code

~~~
-- WRONG — blocks EVERY other client for the entire duration on a large keyspace
KEYS user:*

-- RIGHT — SCAN iterates incrementally without blocking
SCAN 0 MATCH user:* COUNT 100
~~~

KEYS is fine for one-off debugging in a development environment with a small dataset, but using it in application code or against a production-sized keyspace is one of the most common, most damaging Redis anti-patterns, given Redis's single-threaded execution model.

### Storing everything as serialized JSON strings

~~~
-- WRONG — loses the benefit of atomic, targeted operations;
-- every read/write requires full serialization/deserialization
SET user:1 '{"name": "Ada", "email": "ada@example.com", "loginCount": 5}'

-- RIGHT — use a hash for structured data with independently-updatable fields
HSET user:1 name "Ada" email "ada@example.com" loginCount 5
HINCRBY user:1 loginCount 1   -- atomic, targeted increment, no full read-modify-write needed
~~~

### Other production-grade anti-patterns

- **Running Redis without authentication, exposed to the internet**: a historically common, severely damaging misconfiguration behind numerous publicized incidents including cryptocurrency-mining hijacks via Lua script abuse.
- **Not setting maxmemory**, letting Redis consume all available system memory and potentially crash or trigger the OS's out-of-memory killer.
- **Using Redis as a primary system of record without deliberately configuring persistence appropriately** for that use case, then being surprised by data loss on a restart or crash.
- **Growing a single list, set, or hash to an enormous size** (millions of elements), making even normally O(1) or O(log n) operations on that key measurably slower and risking blocking behavior on operations that scale with collection size.
- **Assuming MULTI/EXEC provides rollback-on-error semantics** like a relational database transaction — a failing command within a MULTI block does not automatically undo earlier commands in the same block.
- **Relying on basic pub/sub for messages that must not be lost**, when a disconnected subscriber simply misses messages published during its downtime — use Streams with consumer groups instead for guaranteed delivery.
`,

  performance: `
### Rule zero: measure first

~~~
redis-cli --latency
redis-cli --bigkeys
SLOWLOG GET 10
~~~

--latency measures round-trip command latency directly; --bigkeys samples the keyspace to find unusually large keys (a common hidden performance risk); SLOWLOG GET shows recently executed slow commands — never guess at a Redis performance problem.

### The performance hierarchy (apply in order)

1. **Eliminate slow, blocking commands** (KEYS, unbounded SORT, operations on huge collections) — Redis's single-threaded model means one slow command blocks everything else, the single most consequential Redis performance fact.
2. **Use pipelining for batches of independent commands**, reducing network round-trip overhead by sending multiple commands before waiting for their responses.
3. **Choose the right data structure** — an operation that's O(1) with the right structure (a hash field lookup) can be O(n) with the wrong one (scanning a large list for a match).
4. **Set appropriate TTLs and eviction policies** to keep the working data set within available memory, avoiding both unbounded memory growth and unexpected write failures.
5. **Use Redis Cluster for horizontal scaling** once a single instance's memory capacity or connection/command throughput genuinely becomes the bottleneck.
6. **Consider read replicas** for read-heavy workloads, routing reads to replicas to offload the primary.

### Micro-level facts worth knowing

- Most Redis operations on appropriately-sized data structures are O(1) or O(log n) — the data structure choice itself is usually the dominant factor in whether an operation stays fast at scale, more than any other single tuning knob.
- Lua scripting (EVAL) executes atomically (the whole script runs as one unit, blocking other commands for its duration) — useful for complex atomic operations beyond what MULTI/EXEC alone provides, but a genuinely slow script blocks the entire server for its full execution time.
- Client-side connection pooling matters for Redis just as it does for relational databases — reusing connections rather than establishing a new one per operation avoids real, measurable overhead.
`,

  scalability: `
Redis scales through a combination of **vertical scaling (more RAM), read replicas, and Redis Cluster for horizontal sharding**, with the specific approach depending on whether the bottleneck is memory capacity, read throughput, or write throughput.

### Replication for read scaling and high availability

~~~mermaid
flowchart LR
    App["Application"] -->|writes| Primary[("Primary")]
    App -->|reads| Replica1[("Replica 1")]
    App -->|reads| Replica2[("Replica N")]
    Primary -->|async replication| Replica1
    Primary -->|async replication| Replica2
    Sentinel["Redis Sentinel\n(monitoring + automatic failover)"] -.-> Primary
    Sentinel -.-> Replica1
~~~

Redis replication is asynchronous by default; Redis Sentinel monitors the primary and replicas, automatically promoting a replica to primary if the current primary becomes unavailable — the standard high-availability pattern for a non-clustered Redis deployment.

### Redis Cluster for horizontal scaling

Once a single instance's memory capacity is genuinely the bottleneck (the entire working data set no longer fits in one machine's RAM), Redis Cluster shards data across multiple nodes using 16384 hash slots, with each shard optionally having its own replicas for high availability — see Advanced Concepts for the detailed architecture.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single instance's memory capacity exceeded | Redis Cluster, sharding data across multiple nodes |
| Read-heavy workload exceeding one instance's throughput | Read replicas, with application-level read routing |
| A slow command blocking everything (single-threaded model) | Eliminate KEYS/unbounded operations; use SCAN and appropriately-sized data structures |
| High availability for a non-clustered deployment | Redis Sentinel for monitoring and automatic failover |
| Multi-key operations across a sharded cluster | Hash tags to co-locate related keys on the same shard |
`,

  security: `
### Redis's built-in security features

1. **Authentication**: requirepass (a single shared password) or, since Redis 6, a full ACL system supporting multiple users with fine-grained command and key-pattern permissions — a genuine, meaningful upgrade over the historical single-password model.
2. **TLS/SSL for connections**: encrypting data in transit, since Redis 6+ supports it natively without needing a separate proxy.
3. **Command renaming/disabling**: potentially dangerous commands (FLUSHALL, CONFIG, KEYS) can be renamed or disabled entirely in production configuration, reducing the blast radius if an attacker does gain some access.

### The historical "exposed Redis instances" security lesson

Redis's history includes numerous well-publicized incidents of instances deployed without authentication, directly exposed to the internet, discovered via automated internet-wide scanning, and exploited — notably including attacks abusing Redis's Lua scripting or configuration-write capabilities to achieve remote code execution or install cryptocurrency-mining malware. This closely parallels MongoDB's own historical exposed-instance incidents (see the **MongoDB** skill's Case Studies), and reinforces the same lesson: a security feature that exists but isn't mandatory by default will, at ecosystem scale, inevitably be missed by a meaningful fraction of deployments.

### What remains the application's responsibility

- **Never exposing Redis directly to the internet** — it should sit behind a firewall/VPC, accessible only to application servers that genuinely need it, regardless of whether authentication is also configured.
- **Secrets management**: Redis passwords/ACL credentials from environment variables or a secrets manager, never hardcoded.
- **Data sensitivity awareness**: since Redis data lives in plaintext in memory (and in RDB/AOF files on disk, unless encrypted at the filesystem/infrastructure level), avoid caching highly sensitive data (raw passwords, full payment card numbers) without additional encryption.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing Redis-dependent application code follows similar principles to testing against any external data store.

~~~python
import fakeredis
import pytest

@pytest.fixture
def redis_client():
    return fakeredis.FakeStrictRedis()

def test_cache_aside_pattern(redis_client):
    redis_client.set("user:1", '{"name": "Ada"}')
    cached = redis_client.get("user:1")
    assert cached is not None
~~~

fakeredis provides an in-memory, API-compatible Redis substitute for fast unit tests without needing a real Redis instance — useful for testing application logic that USES Redis without needing to stand up real infrastructure for every test run.

### Testcontainers for genuine integration tests

~~~python
from testcontainers.redis import RedisContainer

def test_with_real_redis():
    with RedisContainer("redis:7") as redis:
        client = redis.get_client()
        # run tests against a genuinely real, disposable Redis instance
~~~

Testcontainers spins up a real, disposable Redis instance for each test run — important for testing anything relying on genuinely Redis-specific behavior (Lua scripting, specific data structure edge cases, expiration timing) that a lighter-weight substitute like fakeredis might not perfectly replicate.

### The senior testing doctrine

- Use a lightweight substitute (fakeredis or similar) for fast unit tests of application logic that merely USES Redis as a cache/store.
- Use Testcontainers for genuine integration tests exercising Redis-specific behavior (Lua scripts, cluster-mode-specific hash tag behavior, precise TTL/expiration timing).
- Test cache invalidation logic explicitly — a common, subtle bug class is forgetting to invalidate a cached value on a corresponding write to the underlying source of truth.
- Never assume application code correctly handles a cache MISS if tests only ever exercise the cache-hit path — explicitly test both.
`,

  debugging: `
### The toolbox, in escalation order

1. **redis-cli MONITOR** — streams every command Redis receives in real time, invaluable for understanding exactly what an application is actually doing against Redis (use cautiously in production given the overhead and sensitive-data-exposure risk of watching every command).
2. **SLOWLOG GET** — shows recently executed commands exceeding a configured latency threshold, the first tool to reach for when investigating "Redis feels slow."
3. **redis-cli --bigkeys** — samples the keyspace to identify unusually large keys, a common hidden cause of slow operations on data structures that have grown unexpectedly large.
4. **INFO command** — provides a comprehensive server-status snapshot (memory usage, connected clients, replication status, persistence status):

~~~
INFO memory
INFO replication
~~~

5. **CLIENT LIST** — shows every currently connected client, useful for diagnosing connection leaks or an unexpectedly high connection count.
6. **redis-cli --latency-history** — tracks latency over time, useful for correlating a latency spike with a specific event (a large RDB snapshot fork, a burst of slow commands).

### Debugging common Redis-specific symptoms

- "Everything feels slow, not just one operation" — almost always a slow, blocking command (KEYS, a huge Lua script, an operation on an oversized collection) given Redis's single-threaded execution model; check SLOWLOG immediately.
- "Memory usage keeps growing unexpectedly" — check for keys without a TTL that should have one, or maxmemory-policy set to noeviction when eviction was actually intended.
- "A cached value is stale/wrong" — almost always a missing or incorrect cache invalidation on the corresponding write path; audit every write path that should invalidate this specific cache key.
`,

  monitoring: `
Production Redis visibility rests on the same three pillars as any production system, with Redis-specific signals worth first-class monitoring given its single-threaded, in-memory architecture.

### Key metrics to track

- **Memory usage relative to maxmemory**: approaching the limit predicts either eviction (if configured) or write failures (if noeviction).
- **Hit rate (cache hits versus misses)**: a declining hit rate suggests either an undersized cache, a TTL that's too short, or a changing access pattern.
- **Command latency and slow command frequency**: the primary signal for Redis's single-threaded-execution-model-specific "is something blocking everything" concern.
- **Replication lag**: for any application reading from Redis replicas, a growing lag risks serving stale data.
- **Connected client count**: an unexpectedly high or growing count may indicate a connection leak in application code.

### Tools

~~~
INFO stats
~~~

RedisInsight (the official GUI) provides visual monitoring and a query/command interface; Prometheus's redis_exporter is the standard choice for integrating Redis metrics into a broader Prometheus/Grafana observability stack — see the **Prometheus** and **Grafana** skills.

### Alerting priorities

Alert on: memory usage approaching maxmemory, hit rate dropping below an expected baseline, any sustained increase in slow command frequency, and replication lag exceeding an acceptable threshold for applications reading from replicas.
`,

  deployment: `
### Managed vs. self-hosted

~~~
Managed (Amazon ElastiCache, Google Cloud Memorystore, Redis Cloud):
  + automated failover, patching, and scaling largely handled for you
  - Amazon ElastiCache in particular has historically been a fork/compatible-implementation
    rather than vanilla Redis — verify feature compatibility for anything advanced

Self-hosted (VMs or Kubernetes, e.g. via the Redis/Bitnami Helm charts):
  + full control over configuration and version (including choosing Redis vs. Valkey)
  - operational responsibility for replication, Sentinel/Cluster configuration, and security
~~~

### Configuration for production

~~~
requirepass a-strong-password
maxmemory 4gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
~~~

### High availability

Redis Sentinel for non-clustered deployments provides automated monitoring and failover; Redis Cluster provides both sharding AND built-in replica-based high availability per shard, appropriate once horizontal scaling (not just high availability) is genuinely needed.

### Redis versus Valkey

Given the 2024 licensing change and resulting Valkey fork, teams choosing a new deployment should explicitly decide between Redis (Redis Inc.-governed, newer license) and Valkey (Linux Foundation-governed, continuing the original permissive license) — the two remain largely compatible at the protocol level as of this page's knowledge cutoff, but verify current feature parity before assuming perfect interchangeability, echoing the same consideration this page raises for MySQL versus MariaDB.

### CI/CD pipeline

Redis configuration changes (maxmemory, persistence settings, ACLs) are typically managed via infrastructure-as-code (Terraform, Kubernetes manifests) rather than a traditional migration tool, since Redis itself has no schema to migrate. See the **CI/CD**, **Docker**, and **Kubernetes** skills.
`,

  "production-checklist": `
Before a Redis deployment takes real traffic:

- [ ] Authentication configured (requirepass or ACLs) — never run without it
- [ ] Redis never directly exposed to the internet — accessible only within a private network/VPC
- [ ] maxmemory and an appropriate maxmemory-policy explicitly configured
- [ ] Persistence (RDB and/or AOF) configured deliberately, matching the actual durability requirement
- [ ] TLS/SSL enabled for connections if traversing any untrusted network
- [ ] Dangerous commands (FLUSHALL, CONFIG, KEYS) renamed or disabled in production if appropriate
- [ ] Redis Sentinel or Redis Cluster configured for high availability, not a single unmonitored instance
- [ ] Cache invalidation logic tested explicitly for every write path affecting a cached value
- [ ] SLOWLOG monitored, with alerting on sustained slow-command frequency increases
- [ ] Hit rate monitored as a first-class metric
- [ ] No use of KEYS in application code — SCAN used for any keyspace iteration
- [ ] Connection pooling configured on the application side
- [ ] Explicit decision made between Redis and Valkey, with licensing/governance implications understood
- [ ] Load test done: known operations/sec ceiling and latency under realistic concurrent load
- [ ] Runbook: how to fail over and recover from a persistence-backed restart
`,

  "common-mistakes": `
1. **Running Redis without authentication, exposed to the internet**, a historically common, severely damaging misconfiguration behind numerous publicized security incidents.
2. **Using KEYS in production application code**, blocking every other client for the duration given Redis's single-threaded execution model.
3. **Storing everything as serialized JSON strings** instead of using the appropriate native data structure (hash, sorted set), losing the benefit of atomic, targeted operations.
4. **Not setting an explicit TTL on cache entries**, relying solely on an eviction policy and risking unbounded memory growth or unpredictable staleness.
5. **Forgetting to invalidate a cached value when the underlying source of truth changes**, silently serving stale data indefinitely (or until an unrelated TTL happens to expire).
6. **Assuming MULTI/EXEC provides rollback-on-error semantics** like a relational database transaction, when a failing command mid-block doesn't undo earlier commands.
7. **Growing a single list, set, or hash to an enormous, unbounded size**, degrading even normally-fast operations on that specific key.
8. **Using basic pub/sub for messages that must not be lost**, when a disconnected subscriber simply misses anything published during its downtime.
9. **Not setting maxmemory**, letting Redis consume unbounded system memory.
10. **Treating Redis as a system of record without deliberately configuring persistence appropriately** for that specific use case's durability requirements.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| OOM command not allowed when used memory greater than maxmemory | Memory limit reached with maxmemory-policy set to noeviction | Configure an appropriate eviction policy, or increase maxmemory if genuinely needed |
| WRONGTYPE Operation against a key holding the wrong kind of value | Attempting a list operation on a key that's actually a string, for example | Verify the key's actual type (TYPE keyname) before operating on it |
| NOAUTH Authentication required | requirepass is set, but the client didn't authenticate | Send AUTH with the correct password, or configure the client library's password option |
| MISCONF Redis is configured to save RDB snapshots, but is currently not able to persist to disk | A background save failed, often from a disk space or permissions issue | Investigate the underlying disk issue; Redis refuses writes to avoid silent data-loss risk |
| CROSSSLOT Keys in request do not hash to the same slot | A multi-key operation in Redis Cluster spans keys on different shards | Use hash tags ({key}) to co-locate related keys on the same shard |
| CLUSTERDOWN The cluster is down | Insufficient nodes available to serve all hash slots, often during a partial outage | Investigate node health; ensure enough replicas exist for automatic failover |
| BUSY Redis is busy running a script | A Lua script (EVAL) is taking too long, blocking the server | Optimize or time-limit the script; avoid genuinely slow logic inside Lua scripts |
`,

  faqs: `
**Is Redis a database or a cache?**
Both, depending on configuration and usage — Redis is most commonly used as a cache (accelerating a separate primary database), but with appropriate persistence (AOF) and durability configuration, it can serve as a lightweight primary data store for use cases that fit its data-structure-and-latency-focused model well.

**Redis or Memcached for caching?**
Redis offers a richer set of data structures (sorted sets, hashes, lists) and additional capabilities (pub/sub, persistence, Lua scripting) beyond Memcached's simpler key-value model; Memcached has historically had a slight edge in raw simplicity and multi-threaded read performance for the narrowest "just cache simple values" use case. Redis's richer feature set has made it the more commonly chosen default for new projects.

**Why is Redis single-threaded, and isn't that a limitation?**
It's a deliberate design tradeoff, not an oversight — single-threaded command execution eliminates an entire class of race-condition bugs since commands never interleave, at the cost of not using multiple CPU cores for command execution itself (though background operations like persistence do use additional threads/processes). For most real workloads, Redis's raw single-threaded speed is more than sufficient, and the simplicity/correctness benefit outweighs the multi-core parallelism it gives up.

**What's the difference between Redis and Valkey?**
Valkey is a 2024 fork of Redis, created in direct response to Redis's licensing change from the permissive BSD license to the more restrictive SSPL/RSALv2, and is now stewarded by the Linux Foundation as a community-governed continuation of the original open-source model — closely paralleling MySQL's relationship to MariaDB. The two remain largely protocol-compatible as of this page's knowledge cutoff, but verify current feature parity before assuming perfect interchangeability.

**How do I keep a Redis cache in sync with my primary database?**
Redis has no automatic awareness of your primary database's schema or writes — the application is entirely responsible for cache-aside logic (check cache, fall back to database on miss, populate cache) and cache invalidation (deleting or updating the cached value whenever the underlying record changes). This is a genuine, ongoing application-layer responsibility, not something Redis handles for you.

**Can Redis do vector search for RAG applications?**
Yes, via the RediSearch module (bundled in Redis Stack), which adds vector similarity search capability alongside Redis's core data structures — a genuine, increasingly popular option for teams wanting extremely low-latency retrieval alongside their existing Redis caching infrastructure, though verify current feature maturity relative to dedicated vector databases or PostgreSQL's pgvector for your specific scale and recall requirements.
`,

  "interview-questions": `
### Junior level

1. **What is Redis, and how is it typically used in an application architecture?**
   Model answer: An in-memory data store, most commonly used as a caching layer in front of a slower primary database, but also used for sessions, rate limiting, pub/sub messaging, and lightweight job queues.

2. **What is the cache-aside pattern?**
   Model answer: The application checks Redis first; on a cache miss, it queries the primary database, then populates Redis with the result for future requests — Redis itself has no automatic awareness of the primary database's data.

3. **Name three Redis data structures and a use case for each.**
   Model answer: Strings for simple values/counters (INCR); hashes for structured objects like a user profile; sorted sets for leaderboards or anything needing ranked, scored ordering.

4. **Why is INCR atomic, and why does that matter?**
   Model answer: Redis executes commands one at a time on a single thread, so INCR's read-and-increment happens as one uninterrupted operation with no risk of two concurrent clients both reading the same starting value and both incrementing from it, losing an update.

5. **What does setting a TTL (EXPIRE) on a key do?**
   Model answer: It causes the key to automatically expire and be removed after the specified duration, central to Redis's role as a cache where data should naturally become stale and disappear rather than requiring explicit application cleanup.

### Senior level

6. **Explain Redis's single-threaded execution model and its practical implications for production operation.**
   Model answer: Commands execute one at a time with no interleaving, making individual commands (and MULTI/EXEC blocks) atomic without explicit locking — but it also means ANY slow command (KEYS on a large keyspace, an oversized Lua script, an operation on a huge collection) blocks EVERY other client for its full duration, making avoiding slow/blocking commands a first-order production concern.

7. **What's the difference between RDB and AOF persistence, and when would you use each (or both)?**
   Model answer: RDB periodically snapshots the entire dataset (compact, fast restore, but can lose data since the last snapshot); AOF logs every write operation (more granular recovery, larger file, slightly slower writes). Many production deployments use both: RDB for fast full-dataset recovery, AOF for minimizing data loss on crash.

8. **How would you implement rate limiting using Redis, and why is this pattern atomic and race-condition-free?**
   Model answer: INCR a per-client counter key, and EXPIRE it (only on the first increment in a new window) to reset after the rate-limit window; because both INCR and the surrounding logic execute against Redis's single-threaded model, concurrent requests from the same client are correctly serialized without a separate application-level lock.

9. **Why is KEYS dangerous in production, and what should you use instead?**
   Model answer: KEYS scans the entire keyspace in one blocking operation, and given Redis's single-threaded execution, this blocks every other client for the scan's full duration on a large database; SCAN provides the same iteration capability incrementally, in small batches, without blocking.

10. **How does Redis Cluster distribute data, and what is a "hash tag" used for?**
    Model answer: Redis Cluster divides the keyspace into 16384 hash slots, distributed across nodes; a key's slot is determined by hashing the key (or the portion inside curly braces, a "hash tag," if present) — hash tags let related keys be forced onto the same shard, enabling multi-key operations that Redis Cluster otherwise restricts across keys on different shards (which would raise a CROSSSLOT error).

11. **What's the difference between Redis's MULTI/EXEC and a relational database transaction?**
    Model answer: MULTI/EXEC provides atomicity (all queued commands execute as an uninterrupted block) but not the same rollback-on-error semantics as a relational transaction — if one command in the block fails, earlier commands in that same block are NOT automatically rolled back, a meaningful difference from ACID transaction semantics.

12. **What is the Redlock algorithm, and why is it controversial?**
    Model answer: Redlock is Salvatore Sanfilippo's proposed algorithm for acquiring a distributed lock safely across multiple independent Redis instances, requiring a majority to agree; it has been notably challenged (most prominently by Martin Kleppmann's widely-read critique) on theoretical distributed-systems-correctness grounds around clock and timing assumptions, and teams needing rigorous, provably-correct distributed locking guarantees often reach for a purpose-built consensus system instead.
`,

  "coding-questions": `
### 1. Implement a sliding-window rate limiter (more precise than fixed-window)

~~~python
import time

def is_rate_limited(redis_client, user_id, max_requests=100, window_seconds=60):
    key = f"rate_limit:{user_id}"
    now = time.time()
    pipe = redis_client.pipeline()
    pipe.zremrangebyscore(key, 0, now - window_seconds)   # remove entries outside the window
    pipe.zadd(key, {str(now): now})                          # record this request
    pipe.zcard(key)                                            # count requests in the current window
    pipe.expire(key, window_seconds)
    results = pipe.execute()
    request_count = results[2]
    return request_count > max_requests
# Using a sorted set (score = timestamp) instead of a simple counter avoids the
# fixed-window pattern's edge-case burst-at-boundary problem.
# Follow-up: how does this sliding-window approach's memory cost compare to the
# simple fixed-window INCR-based approach, and when would that tradeoff matter?
~~~

### 2. Implement a simple leaderboard with top-N and rank lookup

~~~python
redis_client.zadd("leaderboard", {"Ada": 100, "Bob": 85, "Carol": 92})

top_3 = redis_client.zrevrange("leaderboard", 0, 2, withscores=True)
ada_rank = redis_client.zrevrank("leaderboard", "Ada")   # 0-indexed rank, descending by score
# Time: O(log n) for ZADD/ZRANK, O(log n + m) for ZRANGE returning m elements
# Follow-up: how would you implement "show me the players ranked just above and
# below a specific player" (a common leaderboard UI pattern) efficiently?
~~~

### 3. Implement a simple distributed lock with safe release

~~~python
import uuid

def acquire_lock(redis_client, resource, ttl_seconds=10):
    token = str(uuid.uuid4())
    acquired = redis_client.set(f"lock:{resource}", token, nx=True, ex=ttl_seconds)
    return token if acquired else None

def release_lock(redis_client, resource, token):
    # Lua script ensures the check-and-delete is atomic, preventing a race
    # where the lock expired and was re-acquired by someone else before we delete it
    script = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
    else
        return 0
    end
    """
    redis_client.eval(script, 1, f"lock:{resource}", token)
# Follow-up: why is a plain "GET then DEL if it matches" (two separate commands,
# not a single Lua script) unsafe here, and what specific race condition does the
# Lua script's atomicity prevent?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a cache-aside layer for a slow database query
Given a slow database query, implement a Redis-backed cache-aside pattern with an appropriate TTL, and measure the latency improvement on repeated reads. Deliverable: a working cache layer with before/after latency measurements. Skills exercised: cache-aside pattern, TTL configuration.

### Lab 2 (Intermediate): Implement rate limiting and a distributed lock
Build both a fixed-window rate limiter and a distributed lock (with safe, token-verified release) for a simulated concurrent-access scenario. Deliverable: working implementations with tests demonstrating correct behavior under concurrent access. Skills exercised: INCR/EXPIRE patterns, SET NX, Lua scripting for atomic check-and-delete.

### Lab 3 (Advanced): Build a leaderboard and a Streams-based job queue
Implement a sorted-set-based leaderboard with top-N and rank queries, and a Redis Streams-based job queue with a consumer group processing jobs reliably (including handling a consumer crash mid-processing). Deliverable: working leaderboard and queue implementations. Skills exercised: sorted sets, Streams, consumer groups.

### Lab 4 (Production): Configure persistence, replication, and monitoring
Set up a Redis primary with a replica and Sentinel for automatic failover, configure both RDB and AOF persistence, and wire up monitoring for hit rate and slow commands. Deliverable: a production-checklist-compliant deployment with a documented failover test. Skills exercised: replication, Sentinel, persistence configuration, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A rate-limited, cost-controlled gateway in front of an LLM API
Engineering requirements: a Redis-backed sliding-window rate limiter per user/API key, a cache-aside layer for repeated identical prompts (where appropriate), and Redis Streams for queuing and processing requests asynchronously under load. Demonstrates the extremely common "protect an expensive AI API from cost and abuse" real-world use case.

### 2. A real-time collaborative feature using pub/sub and sorted sets
Engineering requirements: Redis pub/sub broadcasting live updates to connected clients (e.g., a collaborative document's cursor positions), combined with a sorted-set-based "recently active users" tracker using timestamps as scores. Demonstrates Redis's fit for real-time, low-latency coordination features.

### 3. A session store and feature-flag system for a multi-instance web application
Engineering requirements: Redis-backed session storage shared across many stateless application instances, combined with a hash-based feature-flag configuration store that can be updated centrally and read with minimal latency by every instance. Demonstrates Redis's common role enabling horizontally-scaled, stateless application architectures.
`,

  "case-studies": `
### The 2024 Redis licensing change and the Valkey fork
Redis Inc.'s 2024 shift from the permissive BSD license to the more restrictive SSPL/RSALv2, citing cloud providers commercializing Redis without contributing back, directly echoes MongoDB's 2019 SSPL decision and Oracle's 2010 MySQL acquisition (which drove the MariaDB fork) — the resulting Valkey fork, quickly adopted and stewarded by the Linux Foundation with backing from major cloud providers, demonstrates this has become an almost recognizable, repeating pattern in the open-source database industry. Lesson: as a popular open-source database matures and cloud providers commoditize its managed hosting, licensing tension between the original steward and the broader ecosystem is now a predictable, recurring event, not a one-off surprise — teams should factor this pattern into long-term technology choices.

### Twitter's timeline caching at extreme scale
Twitter's well-known use of Redis for timeline caching, needing to serve extremely high-volume, frequently-changing, low-latency reads, is a strong proof point for Redis's core value proposition: for the specific "this needs to be blazingly fast" subset of a much larger application's data needs, an in-memory, purpose-built data structure store can outperform trying to solve the same problem within a general-purpose database's architecture.

### Stack Overflow's lean infrastructure via aggressive caching
Stack Overflow's publicly documented, famously lean server footprint relative to its enormous traffic volume relied heavily on aggressive Redis-based caching, becoming a widely cited case study in how a relatively small number of servers can serve very high traffic when a fast caching layer correctly absorbs the vast majority of read load that would otherwise hit a slower primary database directly.

### The Redlock controversy
Salvatore Sanfilippo's own proposed Redlock algorithm for distributed locking across multiple Redis instances, and Martin Kleppmann's widely-read technical critique challenging its correctness under certain clock-drift and process-pause scenarios, is a genuinely instructive case study in distributed-systems reasoning: even a database's own creator's proposed solution to a hard distributed-systems problem can face serious, technically substantive challenge from the broader community, and teams needing rigorous distributed locking guarantees should understand this debate rather than assuming Redlock is an uncontested, provably-correct solution.
`,

  comparisons: `
| Aspect | Redis | Memcached | Valkey | PostgreSQL |
|--------|-------|-----------|--------|-----------|
| Data model | Rich (strings, hashes, lists, sets, sorted sets, streams) | Simple key-value only | Same as Redis (a fork) | Relational (+ JSONB) |
| Persistence | Optional (RDB/AOF) | None (purely in-memory) | Same as Redis | Full durability by default |
| Governance | Redis Inc. (SSPL/RSALv2 since 2024) | Open-source, no single vendor | Linux Foundation (community) | Neutral, community-governed |
| Concurrency model | Single-threaded command execution | Multi-threaded | Same as Redis | Multi-process (per connection) |
| Best fit | Caching, sessions, rate limiting, pub/sub, leaderboards | Simple, pure key-value caching | Same use cases as Redis, license-sensitive teams | System of record, correctness-critical data |

**How seniors choose**: reach for Redis (or Valkey) when you need rich data structures beyond simple key-value, pub/sub, or Streams alongside caching; reach for Memcached when the need is purely simple key-value caching and its slightly different multi-threaded performance profile is measured to matter; reach for Valkey specifically when community governance and license permissiveness are priorities; never reach for Redis/Valkey/Memcached as a replacement for a genuine system-of-record database like PostgreSQL — they solve a fundamentally different problem (speed and specific data-structure operations) than durability and complex relational querying.
`,

  "related-technologies": `
- **Caching (Systems)** — the general theory (cache-aside, write-through, eviction policies) Redis implements concretely; see that skill for the broader conceptual framework.
- **Message Queues** — Redis Streams and pub/sub provide lightweight messaging capability; see this skill for the broader message-broker landscape (Kafka, RabbitMQ) Redis sits alongside.
- **PostgreSQL** and **MySQL** — the primary databases Redis most commonly accelerates as a caching layer; see both skills.
- **MongoDB** — another common pairing, with Redis accelerating a MongoDB-backed application the same way it does for relational databases.
- **Distributed Systems** — the general theory underlying Redis Cluster's sharding and the Redlock distributed-locking debate.
- **Docker** and **Kubernetes** — how Redis is commonly containerized and orchestrated, or replaced by a managed cloud offering (ElastiCache, Memorystore, Redis Cloud).

Learning path: general programming fundamentals → **PostgreSQL**/**MySQL**/**MongoDB** for the primary database Redis accelerates → this page → **Caching (Systems)** and **Message Queues** for the broader architectural context → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Redis's 2024 licensing change** (to SSPL/RSALv2) and the resulting **Valkey fork** (Linux Foundation-governed) remain the most significant recent development in the Redis ecosystem — verify the current state of feature parity and community momentum between the two before committing a new project to either, since both continue active, independent development.
- **Redis Stack** (bundling core Redis with RediSearch, RedisJSON, and other modules) continues to be the primary distribution for teams wanting vector search and JSON document capabilities alongside core Redis data structures.
- Given the pace of change specifically in the Redis-versus-Valkey ecosystem split, verify current licensing terms and feature availability for whichever option you're evaluating, rather than assuming this page's description remains current indefinitely.
- Cloud provider managed offerings (Amazon ElastiCache, Google Cloud Memorystore) have their own independent feature and compatibility roadmaps relative to both Redis and Valkey — verify current compatibility before assuming a managed offering supports a specific newer feature.
`,

  "future-roadmap": `
Where Redis (and Valkey) are heading, and what's worth betting career time on:

- **Continued divergence or convergence between Redis and Valkey** — worth monitoring over time; the two may continue diverging feature-wise (each adding capabilities independently) or largely track each other's core capabilities, and this will meaningfully affect long-term technology choices for teams currently on either.
- **Continued growth of Redis Stack's search/vector/JSON capabilities** as a competitive response to PostgreSQL's pgvector and dedicated vector databases for RAG application use cases.
- **Continued emphasis on Redis/Valkey as the default caching-and-more layer** across nearly every modern web/AI application architecture, regardless of the underlying primary database choice — this pattern shows no sign of changing.
- **What to bet on**: deep fluency in Redis's core data structures and their appropriate use cases, the cache-aside pattern and invalidation discipline, and understanding the single-threaded execution model's implications — these fundamentals remain valuable and largely identical whether a specific deployment ultimately runs Redis or Valkey, given their close compatibility.
`,

  "cheat-sheet": `
~~~
-- ---- Data structures ----
SET key value EX 3600          -- string, with TTL
HSET user:1 name "Ada" age 36    -- hash: structured object
LPUSH queue "task1"               -- list: queue/stack
SADD tags "a" "b"                  -- set: unique, membership tests
ZADD leaderboard 100 "Ada"          -- sorted set: ranked/scored

-- ---- Cache-aside pattern ----
-- 1. GET key -> if hit, return it
-- 2. On miss: query the real database, then SET key value EX ttl
-- 3. On write to the source of truth: DEL key (invalidate, don't try to update)

-- ---- Rate limiting ----
INCR rate_limit:user42
EXPIRE rate_limit:user42 60   -- only set on the FIRST request in a window

-- ---- Distributed lock (simplified) ----
SET lock:resource1 token NX EX 10
-- release only via a Lua script checking the token matches before DEL

-- ---- NEVER in production ----
-- KEYS pattern   <- blocks EVERYTHING (single-threaded). Use SCAN instead.
SCAN 0 MATCH user:* COUNT 100

-- ---- Transactions (atomicity, NOT rollback-on-error) ----
MULTI
INCR views
SADD viewed_by "user42"
EXEC

-- ---- Persistence ----
-- RDB: periodic snapshot, fast restore, can lose recent writes
-- AOF: logs every write, granular recovery, larger file
appendonly yes
appendfsync everysec

-- ---- Production ----
requirepass a-strong-password
maxmemory 4gb
maxmemory-policy allkeys-lru
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Why is Redis so fast? | Data lives entirely in RAM, with purpose-built data structures per use case. |
| Why is Redis single-threaded? | A deliberate tradeoff: eliminates race conditions between commands, at the cost of multi-core parallelism. |
| Why is KEYS dangerous in production? | It blocks EVERY other client for its full duration — use SCAN instead. |
| What is cache-aside? | Check cache, fall back to the database on miss, populate cache — the application manages this, not Redis. |
| RDB vs AOF? | RDB: periodic snapshot, fast restore. AOF: logs every write, more granular recovery. |
| Does MULTI/EXEC roll back on error? | No — atomicity only. A failing command doesn't undo earlier ones in the block. |
| What's a hash tag for? | Forces related keys onto the same Cluster shard, enabling multi-key operations. |
| Sorted set use case? | Leaderboards, priority queues, anything needing ranked/scored ordering. |
| What is Redlock, and why controversial? | A distributed-locking algorithm across instances — challenged on clock-assumption correctness grounds. |
| Redis vs Valkey? | Valkey: 2024 Linux Foundation fork, created after Redis's SSPL/RSALv2 licensing change. |
| What must you ALWAYS configure in production? | requirepass/ACLs, maxmemory + eviction policy — never expose Redis to the internet. |
| Streams vs pub/sub? | Streams persist messages and support consumer groups; pub/sub drops messages for offline subscribers. |
| Historical Redis security lesson? | Exposed, unauthenticated instances were hijacked for crypto-mining via Lua/config abuse. |
`,

  mcqs: `
1. Why does Redis's single-threaded execution model make INCR atomic?
   A) It uses a database lock  B) Commands execute one at a time with no interleaving  C) It's not actually atomic  D) Only in Cluster mode
   **Answer: B** — no other command can interleave between the read and increment.

2. What is the danger of using KEYS in a production Redis instance?
   A) It's deprecated  B) It blocks every other client for its full scan duration  C) It only returns 10 results  D) It requires special permissions
   **Answer: B** — the single-threaded model means this is a severe, avoidable production risk.

3. What does the cache-aside pattern require the APPLICATION to handle?
   A) Nothing, Redis manages it automatically  B) Checking the cache, falling back to the database, and invalidating on writes  C) Only reading, never writing  D) TTL configuration only
   **Answer: B** — Redis has no automatic awareness of the primary database's data.

4. Does Redis's MULTI/EXEC provide rollback if a command fails mid-block?
   A) Yes, automatically  B) No — it provides atomicity of execution, not rollback-on-error  C) Only with AOF enabled  D) Only in Cluster mode
   **Answer: B** — a meaningful difference from relational database transaction semantics.

5. What is Valkey?
   A) A Redis competitor built from scratch  B) A 2024 Linux Foundation fork of Redis, created after its licensing change  C) A Redis GUI tool  D) A deprecated Redis version
   **Answer: B** — closely parallels the MySQL-to-MariaDB fork story.

6. What's the correct way to iterate a large keyspace without blocking other clients?
   A) KEYS pattern  B) SCAN with MATCH and COUNT  C) GETALL  D) There's no safe way
   **Answer: B** — SCAN iterates incrementally instead of blocking for one large operation.
`,

  "revision-notes": `
Redis is an in-memory data store built around the bet that keeping data entirely in RAM, combined with a small set of purpose-built data structures (strings, hashes, lists, sets, sorted sets, streams) rather than generic key-value storage, solves an enormous class of "this needs to be extremely fast" application problems more directly than a general-purpose database. It is overwhelmingly deployed as a SUPPORTING layer — caching, sessions, rate limiting, pub/sub, lightweight queues — alongside a primary database (PostgreSQL, MySQL, MongoDB) that remains the actual system of record, rather than as a standalone database in most architectures.

Redis's single-threaded command execution is a deliberate design choice, not a limitation: because commands execute one at a time with no interleaving, individual commands (and MULTI/EXEC blocks) are atomic without any explicit locking, eliminating an entire class of race-condition bugs. The direct cost of this choice is Redis's single most consequential production concern — any slow command (KEYS on a large keyspace, an oversized Lua script, an operation on a huge collection) blocks EVERY other client for its full duration; SCAN provides a safe, incremental alternative to KEYS specifically to avoid this.

The cache-aside pattern is Redis's most common real-world usage: the application checks Redis first, falls back to the slower primary database on a miss, then populates Redis for next time. Redis itself has no automatic awareness of the primary database's schema or writes — cache invalidation (typically deleting, not trying to update, a cached value when its source-of-truth record changes) is entirely the application's responsibility, and forgetting it is one of the most common, damaging real-world Redis bugs.

Redis's persistence is optional and configurable: RDB periodically snapshots the full dataset (compact, fast restore, but can lose recent writes), while AOF logs every write operation (more granular recovery, larger file, slightly slower writes) — many production deployments combine both, choosing the specific durability-versus-performance tradeoff deliberately rather than accepting a default that may not match the actual use case's requirements. Eviction policies (allkeys-lru, allkeys-lfu, or noeviction) determine behavior once maxmemory is reached, essential to configure explicitly rather than leaving Redis's memory usage unbounded.

Redis's 2024 licensing change (to the more restrictive SSPL/RSALv2, citing cloud providers commercializing Redis without contributing back) directly triggered the Valkey fork, now Linux Foundation-governed — closely paralleling MongoDB's 2019 SSPL decision and MySQL's 2010 Oracle-acquisition-driven MariaDB fork, a now-recognizable, recurring pattern across the open-source database industry as cloud providers commoditize managed hosting. Redis Cluster provides native horizontal sharding across 16384 hash slots for scaling beyond a single instance's memory capacity, with hash tags letting related keys be co-located on the same shard for multi-key operations. A historically common, severely damaging misconfiguration — running Redis without authentication, exposed to the internet — parallels MongoDB's equivalent history and remains the most important single security lesson for any production Redis deployment.
`,

  "learning-roadmap": `
**Week 1 — Data structure fundamentals**: strings, hashes, lists, sets, sorted sets, and choosing the right structure for a given problem. Milestone: implement a working leaderboard and a simple job queue using appropriate native data structures.

**Week 2 — Caching patterns**: cache-aside, TTL configuration, and cache invalidation discipline. Milestone: build a cache-aside layer for a slow query, measuring the latency improvement, and explicitly test the invalidation path.

**Week 3 — Common production patterns**: rate limiting (fixed and sliding window), distributed locks (with safe, token-verified release via Lua scripting), and pub/sub. Milestone: implement both rate-limiting approaches and a safe distributed lock, testing under simulated concurrency.

**Week 4 — Persistence and single-threaded implications**: RDB versus AOF tradeoffs, eviction policies, and understanding why slow commands are dangerous. Milestone: configure both persistence mechanisms and deliberately reproduce (then fix) a KEYS-in-production-code anti-pattern.

**Week 5 — Replication and Streams**: Redis Sentinel for high availability, Redis Streams with consumer groups for reliable message processing. Milestone: set up a primary/replica/Sentinel configuration and build a Streams-based job queue handling consumer failures gracefully.

**Week 6 — Scaling and production practices**: Redis Cluster and shard key/hash tag design, security (authentication, network isolation), and monitoring. Milestone: complete the Lab 4 hands-on project end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Message Queues** for the broader messaging landscape Redis Streams fits into, or **Caching (Systems)** for the general theory this page's patterns implement concretely.
`,

  "official-docs": `
- **redis.io/docs** — the official Redis documentation, comprehensive and the primary reference for every command and configuration option referenced throughout this page.
- **valkey.io/docs** — the official Valkey documentation, essential for understanding where and how it has (or hasn't) diverged from Redis since the 2024 fork.
- **redis.io/docs/latest/develop/interact/programmability** — the official Lua scripting documentation for building atomic, complex operations beyond MULTI/EXEC.
- **redis.io/docs/latest/operate/oss_and_stack/management/scaling** — the official Redis Cluster and scaling documentation.
- **redis.io/docs/latest/develop/data-types/streams** — the official Redis Streams documentation for messaging and event-log use cases.
`,

  books: `
- **"Redis in Action" — Josiah L. Carlson** — a widely recommended, practical introduction covering Redis's data structures and common application patterns (caching, rate limiting, leaderboards) in depth.
- **"Redis Essentials" — Maxwell Dayvson Da Silva and Hugo Lopes Tavares** — a broad, practical coverage of Redis features including persistence, replication, and clustering.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not Redis-specific, but essential foundational reading for the distributed-systems concepts (including the same author's Redlock critique) referenced throughout this page's Advanced Concepts section.
- **"Seven Databases in Seven Weeks" (2nd ed.) — Luc Perkins et al.** — includes a solid introductory chapter on Redis in the broader context of comparing database paradigms, useful alongside the **MongoDB**/**PostgreSQL**/**MySQL** skills.
`,

  blogs: `
- **The official Redis blog (redis.io/blog)** — release announcements, best-practice guidance, and the 2024 licensing change's official rationale directly from Redis Inc.
- **The Valkey project blog and GitHub discussions** — the community/Linux Foundation perspective on the fork's ongoing development.
- **Antirez's (Salvatore Sanfilippo's) personal blog** — deep, historical technical content directly from Redis's creator, including his own writing on the Redlock algorithm and its critique.
- **The Twitter/X and Stack Overflow engineering blogs** — periodic posts on their respective large-scale Redis usage, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
Redis, as a widely deployed production system built by a single primary author rather than an academic research effort, has relatively little dedicated academic literature of its own — the most relevant reading concerns distributed locking and consensus theory directly relevant to the Redlock debate:

- **Kleppmann, M. — "How to do distributed locking"** (2016, personal blog, widely cited and treated as authoritative technical critique) — the widely-read critique of the Redlock algorithm, essential reading for understanding the theoretical concerns around Redis-based distributed locking at genuine rigor.
- **Lamport, L. — "The Part-Time Parliament"** (1998) and **Ongaro, D. and Ousterhout, J. — "In Search of an Understandable Consensus Algorithm (Raft)"** (2014) — the foundational Paxos and Raft consensus papers referenced across this platform's distributed-systems-adjacent skills, relevant background for evaluating Redlock's claims and alternatives.
- Antirez's own blog posts explaining Redis's internal design decisions (not formal papers, but authoritative primary-source design rationale) are the closest thing to a "research paper" for understanding WHY Redis is architected the way it is.
`,

  videos: `
- **RedisConf and Redis Day conference talks** (widely available on YouTube) — the primary conferences for the Redis ecosystem, featuring deep talks from Redis Inc. engineers and large-scale production users.
- **Salvatore Sanfilippo's own talks** on Redis's design philosophy and internals, offering direct insight from the creator.
- **Twitter/X's and Stack Overflow's engineering conference talks** on their respective Redis usage at scale — directly relevant to this page's Case Studies section.
- **Martin Kleppmann's conference talks on distributed locking**, covering the Redlock critique in depth with clear visual explanations of the underlying correctness concerns.
`,

  "github-repos": `
- **redis/redis** — the database's own source code, notably approachable to read given Sanfilippo's emphasis on code clarity, a genuinely good resource for understanding the event loop and data structure implementations directly.
- **valkey-io/valkey** — the Linux Foundation-governed fork's source, useful for tracking exactly how and where it has diverged from Redis since 2024.
- **redis/redis-py, redis/node-redis, redis/jedis** — the official language-specific client libraries.
- **jamesls/fakeredis** — the in-memory, API-compatible Redis testing substitute referenced in this page's Testing section.
- **redis/redis-om-python** (and equivalents) — object-mapping libraries adding structured schema conveniences on top of Redis's flexible data model.
- **RedisInsight** (redis/RedisInsight) — the official GUI referenced in this page's Monitoring section.
- **antirez/redlock-rb** and related Redlock implementations — for exploring the distributed-locking algorithm referenced in Advanced Concepts and its ongoing critique.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Data structure selection**: given several described use cases (leaderboard, queue, tag system, structured object), choose and implement the correct Redis data structure for each.
2. **Cache-aside and invalidation**: implement a cache-aside layer for a slow operation, then deliberately introduce and fix a cache-invalidation bug (a write path that forgets to invalidate).
3. **Rate limiting**: implement both fixed-window and sliding-window rate limiters, comparing their behavior at window boundaries under simulated burst traffic.
4. **Distributed locking**: implement a safe distributed lock with token-verified release via Lua scripting, and write a test demonstrating the unsafe alternative's race condition.
5. **Streams and consumer groups**: build a Streams-based job queue, then simulate a consumer crash mid-processing and verify the pending job is correctly recoverable by another consumer.
6. **External practice sets**: the official Redis interactive tutorial (try.redis.io or similar) for structured, guided practice; Redis University's free official courses for deeper, certification-track learning.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application servers\n(stateless, many instances)"] --> Redis[("Redis primary")]
    Redis -->|async replication| Replica1[("Replica 1")]
    Redis -->|async replication| ReplicaN[("Replica N")]
    Sentinel["Redis Sentinel\n(monitoring + automatic failover)"] -.-> Redis
    Sentinel -.-> Replica1
    App -->|cache-aside| DB[("PostgreSQL/MySQL/MongoDB\nsystem of record")]
    App -->|rate limiting| Redis
    App -->|pub/sub, Streams| Redis
    subgraph Cluster["At horizontal scale"]
        Shard1["Shard 1"]
        ShardN["Shard N"]
    end
    Redis -.-> Cluster
    subgraph Observability
        RedisInsight["RedisInsight"]
        Prometheus["redis_exporter\n+ Prometheus/Grafana"]
    end
    Redis -.-> Observability
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Redis))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Data Structures
      Strings
      Hashes
      Lists
      Sets and Sorted Sets
      Streams
    Core Patterns
      Cache-aside
      Rate limiting
      Distributed locks
      Pub-Sub
    Internals
      Single-threaded model
      Persistence RDB and AOF
      Eviction policies
      Key expiration
    Scaling and HA
      Replication and Sentinel
      Redis Cluster
      Hash tags and sharding
    Ecosystem
      Redis vs Valkey
      Redis Stack modules
      Vector search
    Production
      Security and auth
      Monitoring
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default redis;
