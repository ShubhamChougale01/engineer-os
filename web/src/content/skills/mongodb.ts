import type { SkillContent } from "../types";

/**
 * MongoDB — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const mongodb: SkillContent = {
  overview: `
MongoDB is a document database — data is stored as flexible, JSON-like documents (technically BSON, a binary JSON superset) rather than rows in rigid, predefined tables, and related data is commonly embedded directly within a single document instead of split across normalized tables joined at query time. This is MongoDB's defining bet: for many application data models, the way an application actually READS and WRITES data (a user profile with its addresses, a product with its variants) maps far more naturally onto one nested document than onto several relational tables that must be joined back together on every read.

For an AI engineer, MongoDB shows up frequently as the backing store for applications with genuinely variable, evolving, or deeply nested data shapes — conversation logs with arbitrary tool-call metadata, user-generated content with unpredictable structure, or rapidly-iterating product schemas where a rigid relational migration for every field addition would slow the team down. MongoDB Atlas (the managed cloud offering) has also added native vector search capabilities, letting some teams use MongoDB as both their application database and a vector store for RAG applications.

Key characteristics: a flexible, schema-optional document model (though schema validation can be layered on when desired); horizontal scaling via native sharding designed in from the start, rather than added later as an extension; a rich query language and aggregation framework operating directly on nested document structure; multi-document ACID transactions (since MongoDB 4.0), closing a historically significant gap versus relational databases; and a replica-set-based high-availability model where every deployment is, by default, a set of redundant nodes rather than a single server with replication as an afterthought.
`,

  history: `
MongoDB was created by **Dwight Merriman**, **Eliot Horowitz**, and colleagues at **10gen** (the company later renamed MongoDB Inc.), originally conceived as one piece of a broader planned platform-as-a-service before the team recognized the database component itself was the more valuable, independently useful product.

| Year | Milestone |
|------|-----------|
| 2007 | 10gen is founded, initially building a full application platform; MongoDB begins as its database component |
| 2009 | MongoDB is released as a standalone open-source database, as the platform-as-a-service ambitions are set aside in favor of the database itself |
| 2010 | MongoDB 1.6 — sharding support added, reflecting the horizontal-scaling-first design philosophy |
| 2012 | 10gen begins rapid growth, riding the broader "NoSQL movement's" momentum as web-scale applications sought alternatives to purely relational databases |
| 2013 | 10gen renames itself **MongoDB Inc.** |
| 2015 | MongoDB 3.0 — the WiredTiger storage engine becomes available (and later the default), replacing the original MMAPv1 engine and adding document-level locking, a major concurrency improvement |
| 2016 | MongoDB Atlas (the managed cloud database service) launches, becoming the company's primary growth driver in subsequent years |
| 2017 | MongoDB Inc. goes public (IPO) on NASDAQ |
| 2018 | **MongoDB 4.0** — multi-document ACID transactions ship, closing one of the most significant historical gaps between MongoDB and relational databases |
| 2019 | MongoDB adopts the **Server Side Public License (SSPL)**, a controversial licensing change specifically responding to large cloud providers offering MongoDB-as-a-service without contributing back |
| 2021 | MongoDB Atlas adds **vector search** capabilities, positioning MongoDB for the emerging RAG/embeddings application category |
| 2023–2025 | Continued MongoDB 7.x/8.x releases with performance improvements, expanded Atlas Vector Search capabilities, and continued enterprise feature growth |

The 2019 SSPL licensing change is a significant industry case study: MongoDB's move (soon followed by Elastic and others) directly responded to major cloud providers (AWS's DocumentDB being the most direct example) offering managed, MongoDB-API-compatible services without licensing MongoDB or contributing back — a tension between open-source ideals and sustainable commercial models that continues shaping how database companies license their software.
`,

  "why-it-exists": `
MongoDB exists because of a gap its founders identified building earlier web-scale applications: **the relational model's rigid, predefined schema and normalized-tables-joined-at-query-time approach created real friction for applications with naturally hierarchical, rapidly-evolving, or genuinely variable data shapes**, and scaling a relational database horizontally (across many servers) required either expensive proprietary solutions or significant custom sharding engineering effort that most teams shouldn't need to build themselves.

The prior landscape (relational databases, pre-NoSQL-movement) offered:

1. **Rigid schemas requiring migrations for every structural change**: adding a new field, especially one that varied across different types of records, meant an ALTER TABLE migration (potentially locking a large table) even for data that was conceptually optional or variable from the start.
2. **Manual, effortful horizontal scaling**: relational databases were architected assuming a single powerful server (or, later, added replication/sharding as an extension); genuinely native, designed-in horizontal distribution across commodity hardware was not the relational model's original design center.

MongoDB's insight, part of the broader "NoSQL movement" alongside Cassandra, Redis, and others emerging around the same era, was that many application data access patterns are fundamentally document-shaped (fetch one user's complete profile, including their addresses and preferences, in one read) rather than relational-shaped (join five normalized tables to reconstruct that same profile), and that a database designed around that access pattern from the start — flexible schema, embedded nested data, native horizontal sharding — could better match how many real applications actually use their data, trading some of the relational model's normalization guarantees and cross-collection join convenience for simpler, faster reads of naturally document-shaped data and effortless horizontal scaling.
`,

  "problem-it-solves": `
MongoDB solves the **"my application's data is naturally document-shaped and needs to scale horizontally, but the relational model's rigid schema and join-heavy reads create real friction"** problem.

Concretely, MongoDB provides:

- **A flexible document model**: fields can vary between documents in the same collection, and adding a new field to new documents requires no schema migration — genuinely useful for rapidly-iterating applications or data with inherently variable shape (different product types with different attribute sets, for example).
- **Embedded documents matching read patterns**: related data (a user and their addresses) can be embedded in one document, fetched in a single read, instead of requiring a join across normalized tables — often faster for read-heavy, "fetch one complete entity" access patterns.
- **Native horizontal scaling via sharding**: designed in from MongoDB's earliest versions, letting a collection's data be distributed across many servers based on a shard key, without needing a separate extension or third-party tool the way PostgreSQL/MySQL sharding typically requires.
- **A rich query language and aggregation framework**: MongoDB's query language and aggregation pipeline can express filtering, grouping, and transformation directly over nested document structures, including arrays and nested objects.
- **Multi-document ACID transactions (since 4.0)**: closing the historically significant gap where MongoDB previously only guaranteed atomicity at the single-document level.

What MongoDB deliberately does **not** solve, or solves with real tradeoffs: it does not enforce a rigid schema by default, meaning data consistency across documents in the same collection is an application-layer discipline unless schema validation is explicitly configured; embedding related data can lead to document size growth and potential duplication versus normalized relational data, a real modeling tradeoff requiring deliberate design (embed vs. reference decisions, covered in Intermediate Concepts); and while multi-document transactions exist, they carry a real performance cost and are less central to MongoDB's typical usage pattern than transactions are to a relational database's — the idiomatic MongoDB approach still favors designing documents so that most operations are single-document, atomic by MongoDB's default guarantee, rather than routinely reaching for multi-document transactions.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the document data model and design an appropriate schema, including the embed-versus-reference tradeoff for related data.
2. Write MongoDB queries and updates using its query language, including filtering on nested fields and arrays.
3. Use the aggregation pipeline for multi-stage data transformation, grouping, and analytics queries.
4. Design appropriate indexes (including compound and multikey indexes) and use explain() to diagnose slow queries.
5. Understand replica sets and how MongoDB achieves high availability and read scaling through them.
6. Design an effective sharding strategy, including shard key selection tradeoffs.
7. Apply multi-document transactions appropriately, understanding when single-document atomicity suffices instead.
8. Use MongoDB Atlas Vector Search for embeddings-based similarity search in a RAG application context.
9. Answer senior-level interview questions on the document model's tradeoffs, sharding strategy, and consistency guarantees.
`,

  prerequisites: `
- **Required**: general programming fundamentals and basic familiarity with JSON — MongoDB's document model is JSON-like, and this page assumes comfort reading and reasoning about nested JSON structures.
- **Very helpful**: the **PostgreSQL** or **MySQL** skill — understanding the relational model deeply makes MongoDB's tradeoffs (what it gains, what it gives up) far more concrete than learning MongoDB in isolation.
- **Helpful**: general **Distributed Systems** concepts (replication, sharding, consistency models) for understanding MongoDB's replica sets and sharding architecture more deeply.

Dependency links: general programming and JSON fluency → **PostgreSQL**/**MySQL** for a useful relational contrast → this page → **Redis** for the complementary caching layer many MongoDB-backed applications add → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Documents and collections

~~~javascript
// A "collection" is MongoDB's rough equivalent of a table;
// a "document" is roughly equivalent to a row, but nested and flexible
db.users.insertOne({
  name: "Ada",
  email: "ada@example.com",
  createdAt: new Date(),
  address: {           // an EMBEDDED document — no separate "addresses" table/join needed
    city: "London",
    country: "UK"
  }
});
~~~

Unlike a relational row, a MongoDB document can contain nested objects and arrays directly — the address above is embedded, not a foreign-key reference to a separate collection, letting a single query fetch the complete user profile.

### Basic queries

~~~javascript
db.users.find({ "address.country": "UK" });          // dot notation queries into nested fields
db.users.find({ email: "ada@example.com" }).limit(1);
db.users.findOne({ _id: ObjectId("...") });
~~~

_id is MongoDB's automatically-generated primary key (an ObjectId, encoding a timestamp and other metadata) unless explicitly provided; dot notation (address.country) lets queries filter on fields nested arbitrarily deep within a document.

### Updates

~~~javascript
db.users.updateOne(
  { email: "ada@example.com" },
  { $set: { "address.city": "Manchester" } }   // $set updates only the specified field(s)
);

db.users.updateMany(
  { "address.country": "UK" },
  { $inc: { loginCount: 1 } }                   // $inc atomically increments a numeric field
);
~~~

Update operators ($set, $inc, $push, $pull) modify specific fields atomically without needing to fetch, modify, and rewrite the entire document in application code — a common beginner mistake is fetching a document, modifying it in the application, and writing the WHOLE thing back, losing the benefit of these atomic, targeted operators.

### Arrays and embedded documents

~~~javascript
db.posts.insertOne({
  title: "Hello MongoDB",
  tags: ["database", "nosql"],           // an array field
  comments: [                             // an array of embedded documents
    { author: "Bob", text: "Great post!" }
  ]
});

db.posts.find({ tags: "nosql" });                   // matches if "nosql" is ANY element of the array
db.posts.updateOne(
  { title: "Hello MongoDB" },
  { $push: { comments: { author: "Carol", text: "Thanks!" } } }
);
~~~

Querying an array field with a plain value (tags: "nosql") matches any document where that value is ANYWHERE in the array — a distinctly different, powerful query pattern with no direct single-operator relational SQL equivalent.

### Basic indexing

~~~javascript
db.users.createIndex({ email: 1 });          // 1 = ascending order
db.posts.createIndex({ tags: 1 });            // a "multikey" index — automatically indexes each array element
~~~

MongoDB automatically detects when a field being indexed is an array and creates a "multikey" index, indexing each array element individually — a query on any single tag then uses the index efficiently, no special syntax required beyond the normal createIndex call.

Common beginner trap: fetching, modifying in application code, and writing back an ENTIRE document instead of using targeted update operators — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### The embed-versus-reference decision

~~~javascript
// EMBED when the related data is small, bounded, and almost always read together:
{
  _id: 1,
  name: "Ada",
  address: { city: "London", country: "UK" }   // one-to-one, small, read together — embed
}

// REFERENCE when the related data is large, unbounded, or independently queried:
{
  _id: 1,
  name: "Ada"
}
// separate collection, referenced by id:
{ _id: 101, authorId: 1, title: "Post 1" }
{ _id: 102, authorId: 1, title: "Post 2" }
~~~

This is MongoDB's central schema-design decision, roughly analogous to normalization decisions in relational design but inverted in default preference: embed when data is bounded, one-to-few, and typically read together (avoiding a join-equivalent lookup); reference (store an ID and query separately, or use $lookup to join) when data is unbounded, one-to-many-at-scale, or frequently queried/updated independently of its "parent" — embedding an unbounded array (like ALL of a popular user's posts directly inside their user document) risks unbounded document growth, a genuine anti-pattern.

### The aggregation pipeline

~~~javascript
db.orders.aggregate([
  { $match: { status: "completed" } },                              // stage 1: filter, like WHERE
  { $group: { _id: "$customerId", total: { $sum: "$amount" } } },     // stage 2: group and aggregate, like GROUP BY
  { $sort: { total: -1 } },                                           // stage 3: sort descending
  { $limit: 10 }                                                       // stage 4: top 10
]);
~~~

The aggregation pipeline processes documents through a sequence of stages, each transforming the data before passing it to the next — MongoDB's answer to SQL's SELECT/GROUP BY/ORDER BY, expressed as an explicit, composable pipeline rather than a single declarative statement; $match early in the pipeline (before expensive stages) lets MongoDB use indexes to filter data before the more expensive grouping/sorting work.

### $lookup — MongoDB's join equivalent

~~~javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  }
]);
~~~

$lookup performs a left outer join-equivalent operation, merging matching documents from another collection into an array field — useful when a reference relationship needs to be queried jointly, though MongoDB's overall design philosophy still favors embedding over frequent $lookup usage where the data shape allows it.

### Schema validation

~~~javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      required: ["email"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" }
      }
    }
  }
});
~~~

Despite MongoDB's flexible-by-default document model, schema validation can be explicitly layered on top when a team wants enforcement — a genuine middle ground between "completely schemaless" and a relational database's always-enforced schema, letting teams opt into structure deliberately rather than by default.

### Replica sets

~~~javascript
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
~~~

A replica set is a group of MongoDB instances maintaining the same data set — one primary (accepting writes) and multiple secondaries (replicating from the primary) — with automatic election of a new primary if the current one becomes unavailable; unlike a relational database where replication is often a later addition, MongoDB deployments are, by design, expected to run as replica sets from the start for production use.

### Read and write concerns

~~~javascript
db.orders.insertOne(
  { customerId: 1, amount: 100 },
  { writeConcern: { w: "majority" } }   // wait for acknowledgment from a majority of replica set members
);

db.orders.find({}).readConcern("majority");
~~~

Write concern controls how many replica set members must acknowledge a write before it's considered successful (trading latency for durability guarantees); read concern controls the consistency guarantee of data returned by a read — both are tunable per-operation, letting an application make deliberate consistency-versus-performance tradeoffs rather than accepting one fixed default everywhere.
`,

  "advanced-concepts": `
### Sharding architecture and shard key selection

~~~mermaid
flowchart TB
    App["Application"] --> Router["mongos\n(query router)"]
    Router --> ConfigServers["Config servers\n(cluster metadata)"]
    Router --> Shard1["Shard 1\n(a replica set)"]
    Router --> Shard2["Shard 2\n(a replica set)"]
    Router --> ShardN["Shard N\n(a replica set)"]
~~~

Sharding distributes a collection's data across multiple shards (each itself a replica set) based on a chosen shard key; mongos routers direct each query to the relevant shard(s). Shard key selection is one of MongoDB's most consequential, hard-to-change-later architectural decisions: a poor shard key (e.g., a monotonically increasing field like a timestamp, causing all new writes to hit the SAME shard, a "hot shard" problem) undermines the entire point of sharding, while a well-chosen key (high cardinality, evenly distributed write load) enables genuine horizontal write scaling.

### Multi-document transactions

~~~javascript
const session = client.startSession();
session.startTransaction();
try {
  await accounts.updateOne({ _id: fromId }, { $inc: { balance: -100 } }, { session });
  await accounts.updateOne({ _id: toId }, { $inc: { balance: 100 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
~~~

Multi-document ACID transactions (since MongoDB 4.0 for replica sets, 4.2 for sharded clusters) let multiple documents (potentially across collections) be updated atomically — a genuine capability gap closed versus earlier MongoDB versions, though idiomatic MongoDB schema design still favors structuring data so MOST operations remain single-document (which MongoDB has always guaranteed atomically, without needing an explicit transaction) rather than routinely reaching for multi-document transactions as a default pattern.

### Change streams

~~~javascript
const changeStream = db.orders.watch([
  { $match: { "fullDocument.status": "completed" } }
]);
changeStream.on("change", (change) => {
  console.log("An order was completed:", change.fullDocument);
});
~~~

Change streams let an application subscribe to real-time data changes in a collection (inserts, updates, deletes), built on MongoDB's underlying replication oplog — useful for building reactive features (notifications, cache invalidation, event-driven architectures) without a separate change-data-capture tool.

### Atlas Vector Search

~~~javascript
db.documents.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.1, 0.2, /* ... */],
      numCandidates: 100,
      limit: 5
    }
  }
]);
~~~

MongoDB Atlas (the managed cloud offering specifically, not the open-source Community Edition) provides native vector similarity search via $vectorSearch, letting embeddings live alongside application data in the same MongoDB deployment for RAG applications — a direct competitive response to PostgreSQL's pgvector and dedicated vector databases, though notably an Atlas-specific (not self-hosted open-source) capability as of this page's knowledge cutoff.

### Read preference and secondary reads

~~~javascript
db.orders.find({}).readPref("secondaryPreferred");
~~~

Read preference controls which replica set member(s) a read operation targets — secondaryPreferred routes reads to secondaries when available (reducing load on the primary, at the cost of potentially reading slightly stale data due to replication lag), a tunable tradeoff similar in spirit to routing reads to PostgreSQL/MySQL replicas, but configured per-query rather than requiring a separate proxy layer.

### The WiredTiger storage engine

WiredTiger (MongoDB's default storage engine since 3.2) provides document-level locking (a major concurrency improvement over the earlier MMAPv1 engine's coarser locking) and compression, both contributing significantly to MongoDB's modern write-concurrency and storage-efficiency characteristics — understanding that MongoDB, like MySQL, has its own storage-engine history matters for correctly reasoning about older deployments that might predate WiredTiger's introduction.
`,

  "internal-working": `
What happens inside MongoDB from a client query to a returned result, within a replica set:

~~~mermaid
flowchart LR
    A["Client driver sends query"] --> B["mongod\n(the MongoDB server process)"]
    B --> C["Query planner\n(chooses an index/execution plan)"]
    C --> D["WiredTiger storage engine\n(document-level locking, compression)"]
    D --> E["In-memory cache\n(WiredTiger's own page cache)"]
    E --> F["Oplog write\n(operation log, replication's foundation)"]
    F --> G["Async replication\nto secondary members"]
    G --> H["Result returned to client"]
~~~

1. **Query planning**: MongoDB's query planner evaluates candidate indexes (similar in spirit to a relational query planner) and caches the winning plan for similarly-shaped future queries.
2. **WiredTiger execution**: the chosen plan executes against WiredTiger, which provides document-level locking (multiple documents in the SAME collection can be modified concurrently without blocking each other, unlike the coarser collection- or database-level locking of MongoDB's earlier storage engine).
3. **The oplog (operations log)**: every write is recorded in a special capped collection (the oplog) on the primary — this is the foundational mechanism replica set secondaries use to replicate changes, conceptually analogous to PostgreSQL's WAL or MySQL's binary log, though structured as a queryable collection of individual operations rather than a binary log format.
4. **Asynchronous replication to secondaries**: secondaries continuously tail the primary's oplog, applying each operation to stay in sync — by default this is asynchronous, meaning a write can be acknowledged before all secondaries have applied it (write concern settings, covered in Intermediate Concepts, let an application require stronger guarantees when needed).

**Why understanding the oplog matters**: it's the single most important internal mechanism underlying both replica set replication AND change streams (which are themselves built on tailing the oplog) — a full understanding of MongoDB's consistency guarantees under various write/read concern settings requires understanding that the oplog, not some more abstract consensus mechanism, is the actual foundation both features are built from.
`,

  architecture: `
A senior engineer thinks about MongoDB at two levels: **the replica set as the fundamental unit of deployment** (not a single server) and **document schema design as the primary architectural decision** (since MongoDB itself imposes little structure).

### The replica set as the default deployment unit

~~~mermaid
flowchart TB
    subgraph ReplicaSet["A MongoDB replica set (the standard production unit)"]
        Primary["Primary\n(accepts all writes)"]
        Secondary1["Secondary 1\n(replicates from primary)"]
        Secondary2["Secondary 2\n(replicates from primary,\nor an Arbiter for voting only)"]
    end
    Primary -->|oplog tailing| Secondary1
    Primary -->|oplog tailing| Secondary2
    Secondary1 -.->|automatic election\nif primary fails| Primary
~~~

Unlike many relational database deployments where a single server is the default starting point and replication is added later, a MongoDB production deployment is EXPECTED to be a replica set from the start — this reflects MongoDB's design philosophy that high availability and horizontal scalability are first-class concerns, not afterthoughts.

### Document schema as the primary architecture decision

~~~
Application data model decisions in MongoDB:
├── What's embedded vs. referenced? (bounded, together-read data → embed;
│                                     unbounded, independent data → reference)
├── What's the shard key, if sharding? (high cardinality, write-evenly-distributed)
├── What indexes match actual query patterns? (compound indexes matching
│                                                 filter + sort combinations)
└── Where is schema validation applied deliberately? (opt-in structure,
                                                          not automatic)
~~~

Rules mature MongoDB teams follow: design documents around actual READ patterns (what does the application fetch together, in one operation) rather than mechanically mirroring a relational normalization instinct; choose shard keys deliberately and early, since changing a shard key after significant data has accumulated is a genuinely difficult operation; and apply schema validation where data integrity genuinely matters, rather than relying on "flexible schema" as an excuse to skip data modeling discipline entirely.
`,

  "data-flow": `
Tracing one write operation end to end — an insert into a sharded, replicated collection:

~~~mermaid
sequenceDiagram
    participant App
    participant Mongos as mongos (query router)
    participant ConfigSvr as Config servers
    participant Shard as Target shard (a replica set)
    participant Primary as Shard's primary
    participant Secondary as Shard's secondaries

    App->>Mongos: insertOne({ customerId: 42, ... })
    Mongos->>ConfigSvr: determine which shard owns this shard key range
    ConfigSvr-->>Mongos: shard identity
    Mongos->>Shard: route the insert to the correct shard
    Shard->>Primary: write accepted by the shard's primary
    Primary->>Primary: write recorded in the oplog
    Primary->>Secondary: oplog entry replicated asynchronously
    Primary-->>Mongos: write acknowledged (per configured write concern)
    Mongos-->>App: success
~~~

The most misunderstood part for newcomers: **a write is considered "successful" based on the configured write concern, not necessarily once every replica has the data** — the default write concern (w: 1, acknowledging once the primary has written it) does NOT wait for secondary replication, meaning a primary failure immediately after acknowledging a write, before replication completes, can genuinely lose that write; applications with strict durability needs must explicitly configure a stronger write concern (w: "majority"), trading some write latency for this stronger guarantee.
`,

  "production-usage": `
### Connecting and basic operations

~~~javascript
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://replica1,replica2,replica3/mydb?replicaSet=myReplicaSet");
await client.connect();
const db = client.db("mydb");
~~~

Production connection strings should always list multiple replica set members (not just one), letting the driver automatically discover the current primary and handle failover transparently.

### Configuration essentials

~~~
storage.wiredTiger.engineConfig.cacheSizeGB: 4     # WiredTiger's own cache, tuned to available RAM
replication.replSetName: myReplicaSet
security.authorization: enabled                     # never run production MongoDB without auth enabled
~~~

Non-negotiables for production:

1. **Authentication and authorization always enabled** — MongoDB historically shipped with authentication OFF by default, and numerous widely-publicized incidents of exposed, unauthenticated MongoDB instances being scraped or ransomed resulted directly from this; never deploy without explicitly enabling and configuring auth.
2. **A genuine replica set, never a single standalone instance**, for any production workload requiring durability or availability guarantees.
3. **WiredTiger's cache size tuned deliberately**, not left at defaults that may not match the actual available RAM on a dedicated database server.

### Common production stacks

- **Content and catalog-heavy applications**: MongoDB's document model suits product catalogs with variable attribute sets, content management systems, and similar naturally document-shaped domains.
- **AI/RAG applications on Atlas**: MongoDB Atlas + Atlas Vector Search for teams wanting embeddings alongside application data in one managed service.
- **High-write-volume, horizontally-distributed workloads**: MongoDB's native sharding suits applications anticipating genuine write-scaling needs from the start.
`,

  "industry-examples": `
- **eBay**: uses MongoDB across parts of its product catalog and metadata infrastructure, valuing the document model's fit for variable product attribute sets across very different product categories.
- **Forbes**: rebuilt its publishing platform on MongoDB, citing the document model's natural fit for content management (articles with variable metadata, embedded media references).
- **Toyota**: has publicly discussed using MongoDB for parts of its connected-vehicle data infrastructure, valuing its flexibility for evolving IoT/telemetry data shapes.
- **Adobe**: uses MongoDB across several products, including parts of its Experience Platform, for customer data management at scale.
- **Cisco**: has used MongoDB for network telemetry and configuration data, another naturally document-shaped, variable-schema domain.
- **SEGA and other gaming companies**: use MongoDB for player profile and game-state data, where different games/features naturally produce genuinely variable document shapes.
- **Many rapidly-iterating startups**: MongoDB's flexible schema is a common early-stage choice specifically because it avoids schema-migration friction during a period when a product's data model is still actively changing.

Pattern to notice: MongoDB adoption clusters around **applications with genuinely variable, evolving, or naturally hierarchical/document-shaped data** — content management, product catalogs, IoT/telemetry, and player/user profiles — precisely the profile of many rapidly-iterating AI-application data models (conversation logs, tool-call metadata, user-generated content) before they've stabilized into a fixed shape.
`,

  "best-practices": `
1. **Design documents around read patterns, not mechanical normalization** — ask "what does my application fetch together in one operation" rather than defaulting to relational-style normalization instincts.
2. **Embed bounded, together-read data; reference unbounded or independently-queried data** — the central schema-design decision, get it wrong and either query performance (excessive $lookup) or document growth (unbounded embedding) suffers.
3. **Always enable authentication and authorization** — MongoDB's historical default-off auth has caused numerous well-publicized security incidents from exposed, unauthenticated instances.
4. **Choose a shard key deliberately and early** if sharding is anticipated — changing it after significant data accumulation is a genuinely difficult, high-risk operation.
5. **Use update operators ($set, $inc, $push) instead of fetch-modify-rewrite patterns** — both for atomicity and to avoid unnecessary full-document network transfer and write amplification.
6. **Design indexes to match actual query patterns**, including compound indexes covering both filter and sort fields together, and verify usage with explain().
7. **Apply schema validation deliberately** where data integrity genuinely matters — "flexible schema" should be a deliberate choice, not an excuse to skip data modeling discipline.
8. **Use appropriate write/read concern settings deliberately** — understand the default (w: 1, not waiting for secondary replication) and explicitly configure "majority" where durability genuinely matters more than the small latency cost.
9. **Prefer single-document atomicity over routinely reaching for multi-document transactions** — good schema design keeps most operations single-document (always atomic in MongoDB), reserving transactions for genuinely multi-document needs.
10. **Monitor replica set health and replication lag** explicitly, especially for applications reading from secondaries.
11. **Use the aggregation pipeline's $match stage early**, before expensive $group/$sort stages, letting MongoDB use indexes to filter before the costlier work.
12. **Run explain() on any query you're not confident about**, the same universal database discipline as EXPLAIN in relational databases.
`,

  "anti-patterns": `
### Fetch-modify-rewrite instead of atomic update operators

~~~javascript
// WRONG — fetches the whole document, modifies it in application code,
// then rewrites the WHOLE thing back: not atomic, and wastes bandwidth
const user = await db.users.findOne({ _id: userId });
user.loginCount += 1;
await db.users.replaceOne({ _id: userId }, user);

// RIGHT — an atomic, targeted update operator
await db.users.updateOne({ _id: userId }, { $inc: { loginCount: 1 } });
~~~

The fetch-modify-rewrite pattern is not atomic (a concurrent update between the fetch and the rewrite is silently lost) and transfers far more data than necessary — a genuinely common beginner mistake that update operators exist specifically to prevent.

### Unbounded array embedding

~~~javascript
// WRONG — embedding an unbounded, ever-growing array risks the
// 16MB BSON document size limit and severely degrades performance
// long before hitting it, for a popular user with thousands of posts
{
  _id: 1,
  name: "Ada",
  posts: [ /* thousands of embedded post documents */ ]
}

// RIGHT — reference unbounded relationships in a separate collection
{ _id: 1, name: "Ada" }
{ _id: 101, authorId: 1, title: "Post 1" }
{ _id: 102, authorId: 1, title: "Post 2" }
~~~

MongoDB documents have a hard 16MB size limit, and performance degrades well before reaching it for unbounded embedded arrays — a genuinely common schema design mistake for anyone applying "embed for performance" without considering the relationship's actual cardinality bounds.

### Other production-grade anti-patterns

- **Running MongoDB without authentication enabled**: a historically common, severely damaging misconfiguration responsible for numerous publicized data-exposure and ransom incidents.
- **Choosing a poor shard key** (e.g., a monotonically increasing field causing all writes to hit one shard) — undermines the entire purpose of sharding, and is difficult to fix after significant data accumulation.
- **Treating "schemaless" as "no schema design needed"**: MongoDB's flexibility doesn't remove the need for deliberate data modeling — it just moves schema enforcement from mandatory (relational) to optional (MongoDB), a decision that should be made deliberately, not by default.
- **Overusing $lookup as a substitute for proper embedding decisions**: if most queries need to join two collections together, that's a signal the data might be better modeled as embedded rather than referenced.
- **Ignoring explain() output** and assuming a query is using an index without verifying it.
- **Not monitoring replica set health**, missing a secondary falling behind or a failed election until it causes a user-visible problem.
`,

  performance: `
### Rule zero: measure first

~~~javascript
db.orders.find({ customerId: 42 }).explain("executionStats");
~~~

explain("executionStats") shows the chosen execution plan, whether an index was used (or a full collection scan, "COLLSCAN," occurred instead), and actual execution statistics — never guess at a MongoDB performance problem.

### The performance hierarchy (apply in order)

1. **Add the right index** — check explain() output for COLLSCAN (a full collection scan) on large, frequently-queried collections, the most common and cheapest fix.
2. **Design compound indexes matching both filter AND sort fields** in a query, since a single-field index may not satisfy a query that both filters and sorts.
3. **Use update operators instead of fetch-modify-rewrite patterns**, reducing both network transfer and eliminating a race condition.
4. **Use the aggregation pipeline's $match early**, letting index-backed filtering happen before expensive grouping/sorting stages.
5. **Choose an appropriate shard key** if sharding, avoiding hot-shard write concentration.
6. **Tune WiredTiger's cache size** to actual available RAM, analogous to PostgreSQL's shared_buffers or MySQL's InnoDB buffer pool.

### Micro-level facts worth knowing

- MongoDB documents have a hard 16MB size limit — a document approaching this size is nearly always a schema design signal (unbounded embedding) worth addressing, not something to work around with clever encoding.
- Covered queries (where every field a query needs is present in the index itself, avoiding a fetch of the full document) can be noticeably faster, the same concept as a relational covering index.
- Bulk operations (bulkWrite, insertMany) are significantly more efficient than many individual single-document operations for batch workloads.
`,

  scalability: `
MongoDB's scaling story is distinctly **horizontal-first**, with native sharding designed in from the earliest versions — a meaningfully different default posture than PostgreSQL's or MySQL's "vertical first, horizontal with real effort."

### Replica sets for availability and read scaling

~~~mermaid
flowchart LR
    App["Application"] --> Primary[("Primary")]
    App -->|reads, with readPref| Secondary1[("Secondary 1")]
    App -->|reads, with readPref| Secondary2[("Secondary 2")]
    Primary -->|oplog tailing| Secondary1
    Primary -->|oplog tailing| Secondary2
~~~

Every production MongoDB deployment should be a replica set, providing both automatic failover (a new primary is elected if the current one fails) and optional read scaling (routing reads to secondaries via read preference settings).

### Sharded clusters for write scaling

~~~mermaid
flowchart TB
    App["Application"] --> Mongos["mongos routers"]
    Mongos --> Shard1["Shard 1\n(a replica set)"]
    Mongos --> Shard2["Shard 2\n(a replica set)"]
    Mongos --> ShardN["Shard N\n(a replica set)"]
~~~

Sharding distributes data (and write load) across many independent replica sets, based on a shard key — a design-in-from-the-start capability, unlike relational databases where equivalent write-scaling typically requires a dedicated extension (Citus, Vitess) or significant custom engineering.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Missing indexes causing collection scans | Add appropriate indexes; verify with explain() |
| Single replica set's write throughput ceiling | Shard the collection with a well-chosen, high-cardinality shard key |
| Poor shard key causing a "hot shard" | Redesign the shard key (a genuinely difficult migration after significant data accumulation — choose carefully upfront) |
| Read load exceeding one replica set member's capacity | Route reads to secondaries via read preference, accepting some replication-lag staleness |
| Unbounded document growth from embedding | Refactor to reference the unbounded relationship in a separate collection instead |
`,

  security: `
### MongoDB's built-in security features

1. **Authentication and role-based access control**: MongoDB supports username/password auth, x.509 certificates, LDAP, and Kerberos, combined with a role-based permission system controlling exactly what each user can do — critically, this must be EXPLICITLY enabled; MongoDB's historical default of no authentication has caused numerous serious, well-publicized incidents.
2. **TLS/SSL for connections**: encrypting data in transit, essential for any production deployment, especially across an untrusted network.
3. **Field-level encryption**: MongoDB supports client-side field-level encryption, encrypting specific sensitive fields before they ever reach the server, so even a database administrator with full server access cannot read the plaintext.
4. **Network isolation via IP allowlisting**: restricting which hosts can even attempt to connect, a first line of defense especially relevant given the historical pattern of exposed, unauthenticated instances being discovered by internet-wide scanning tools.

### What remains the application's responsibility

- **Injection via unsanitized query construction**: while MongoDB's query language isn't raw SQL, constructing queries from unsanitized user input (particularly when using the $where operator, which executes JavaScript, or building query objects from raw request bodies without validation) can introduce "NoSQL injection" vulnerabilities — a genuinely real, MongoDB-specific attack class worth understanding distinctly from classic SQL injection.
- **Secrets management**: database credentials from environment variables or a secrets manager, never hardcoded.
- **Schema validation as a security boundary**: since MongoDB doesn't enforce schema by default, explicit validation is a genuine security-adjacent consideration for preventing malformed or maliciously-crafted documents.

### The historical "exposed MongoDB" lesson

A well-documented pattern of security incidents throughout MongoDB's history involved instances deployed with authentication disabled (the historical default) and exposed directly to the internet, subsequently discovered by automated scanning and either scraped for data or held for ransom — this remains one of the most cited cautionary examples in database security discussions specifically because it was entirely preventable by simply enabling a feature that existed but wasn't on by default; modern MongoDB and Atlas have shifted toward more secure-by-default configurations, but understanding this history matters for auditing any older or self-managed deployment.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing MongoDB-dependent application code follows similar principles to any database, with MongoDB-specific tooling for realistic, isolated tests.

~~~javascript
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");

describe("UserRepository", () => {
  let mongoServer, client, db;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = await MongoClient.connect(mongoServer.getUri());
    db = client.db("test");
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  it("inserts and retrieves a user", async () => {
    await db.collection("users").insertOne({ email: "test@example.com" });
    const user = await db.collection("users").findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
  });
});
~~~

mongodb-memory-server spins up a genuine, ephemeral MongoDB instance in memory for each test run — faster than a full Docker-based Testcontainers approach for many use cases, while still exercising real MongoDB behavior rather than a mocked approximation.

### Testcontainers as an alternative

~~~python
from testcontainers.mongodb import MongoDbContainer

def test_with_real_mongo():
    with MongoDbContainer("mongo:7.0") as mongo:
        client = mongo.get_connection_client()
        # run tests against a genuinely real, disposable MongoDB instance
~~~

### The senior testing doctrine

- Use a real (in-memory or Testcontainers-based) MongoDB instance for integration tests rather than mocking the driver entirely — MongoDB-specific query and aggregation behavior is hard to accurately approximate with a mock.
- Test aggregation pipelines explicitly, since their multi-stage logic is a common source of subtle bugs (an incorrectly-ordered $match/$group stage producing wrong results).
- Clean up test data between tests (drop the test database or collection) to avoid state leaking between test runs.
- Test schema validation rules explicitly if configured, confirming both valid documents are accepted and invalid ones are correctly rejected.
`,

  debugging: `
### The toolbox, in escalation order

1. **explain("executionStats")** — the first, most important tool for any "why is this query slow" investigation; check for COLLSCAN (full collection scan) versus an index-backed scan (IXSCAN).
2. **db.currentOp()** — shows currently running operations, essential for finding long-running or blocked queries:

~~~javascript
db.currentOp({ "secs_running": { $gt: 5 } });
~~~

3. **MongoDB Compass** (the official GUI) — provides a visual query explain view, schema analysis, and performance insights without needing to memorize every diagnostic command.
4. **rs.status()** — shows the current replica set state, including which member is primary and each member's replication lag:

~~~javascript
rs.status();
~~~

5. **The profiler**: db.setProfilingLevel(1, { slowms: 100 }) logs any operation exceeding 100ms to the system.profile collection, giving visibility into slow operations you didn't know to look for.
6. **mongostat and mongotop**: command-line tools providing real-time server statistics (operations/sec, memory usage) and per-collection read/write time respectively.

### Debugging common MongoDB-specific symptoms

- "Queries are slow despite an index existing" — verify with explain() that the planner is actually CHOOSING to use it; a compound index's field order matters, and a query not matching that order may not use it effectively.
- "A document update seems to have been silently lost" — almost always a fetch-modify-rewrite race condition (see Anti-Patterns); switch to atomic update operators.
- "Replica set keeps electing a new primary unexpectedly" — check network connectivity between members and rs.status() for unexpected member state changes; investigate whether resource exhaustion (CPU, memory) on the primary is causing heartbeat timeouts.
`,

  monitoring: `
Production MongoDB visibility rests on the same three pillars as any database, with several MongoDB-specific signals worth first-class monitoring.

### Key metrics to track

- **Replication lag** across replica set secondaries — a growing lag risks serving stale reads beyond acceptable tolerance for applications reading from secondaries.
- **WiredTiger cache utilization** — analogous to PostgreSQL's shared_buffers hit ratio, a low effective cache ratio suggests undersized cache relative to the working data set.
- **Connection count** relative to configured limits.
- **Operation counters** (inserts/queries/updates/deletes per second) and their latency distribution.
- **Shard balancer activity** (for sharded clusters) — confirms data is actually being distributed evenly, not accumulating unevenly due to a poor shard key.

### Tools

~~~javascript
db.serverStatus();      // a comprehensive snapshot of server-level metrics
~~~

MongoDB Atlas provides built-in monitoring dashboards for managed deployments; for self-hosted deployments, Prometheus's mongodb_exporter integrates MongoDB metrics into a broader observability stack, and MongoDB Compass provides visual, ad-hoc performance insight — see the **Prometheus** and **Grafana** skills.

### Alerting priorities

Alert on: replication lag exceeding an acceptable threshold, connection count approaching limits, disk space approaching capacity, and any unexpected primary election (which may indicate an underlying resource or network problem worth investigating even after failover succeeds).
`,

  deployment: `
### Managed vs. self-hosted

~~~
Managed (MongoDB Atlas):
  + automated backups, patching, scaling, monitoring, and Atlas Vector Search built in
  - a genuine ongoing cost, and Atlas-specific features (vector search) aren't
    available if self-hosting the open-source Community Edition

Self-hosted (VMs or Kubernetes, e.g. via the MongoDB Community/Enterprise Operator):
  + full control, no Atlas-specific licensing cost
  - operational responsibility for replica set management, sharding, backups, and
    critically, ensuring authentication is properly configured from the start
~~~

MongoDB Atlas has become the company's primary offering and is frequently the simplest path to a properly-configured (secure by default, replica-set-based) production deployment, especially for teams without deep MongoDB operations expertise.

### Backup strategy

~~~bash
mongodump --uri="mongodb://..." --out=/backup           # logical backup
mongorestore --uri="mongodb://..." /backup                # restore from a logical backup
~~~

For larger deployments, physical/file-system-level snapshots (coordinated with a replica set member temporarily taken out of the read/write path) or Atlas's built-in continuous backup are more common than mongodump/mongorestore, which can be slow for very large datasets.

### High availability

A replica set with at least three members (allowing a majority to elect a new primary even if one member fails) is the standard minimum production configuration; Atlas handles this automatically, while self-hosted deployments require deliberate replica set configuration and monitoring.

### CI/CD pipeline

Schema validation rule changes and index additions are typically applied via application startup scripts or a dedicated migration tool (several exist in the Node.js/Python ecosystems specifically for MongoDB), run as an explicit, coordinated deploy step. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before a MongoDB-backed application takes real traffic:

- [ ] Authentication and authorization explicitly enabled — never run with auth disabled
- [ ] TLS/SSL enabled for all connections
- [ ] A genuine replica set (minimum 3 members) configured, never a single standalone instance
- [ ] Network access restricted via IP allowlisting or VPC/private networking
- [ ] Shard key chosen deliberately if sharding, verified to avoid hot-shard write concentration
- [ ] Indexes designed to match actual query patterns, verified with explain()
- [ ] Write concern configured deliberately (majority for durability-critical operations)
- [ ] Document schema validation applied where data integrity genuinely matters
- [ ] WiredTiger cache size tuned to actual available RAM
- [ ] Automated backups configured (mongodump, physical snapshots, or Atlas continuous backup)
- [ ] Backup restoration actually tested
- [ ] Replication lag monitored, especially for applications reading from secondaries
- [ ] Connection string includes all replica set members for automatic failover discovery
- [ ] Monitoring/alerting wired up for replication lag, connection count, and disk space
- [ ] Load test done: known operations/sec ceiling under realistic concurrent load
- [ ] Runbook: how to handle a failed primary election and restore from backup
`,

  "common-mistakes": `
1. **Running MongoDB without authentication enabled**, a historically common, severely damaging misconfiguration behind numerous publicized data-exposure incidents.
2. **Using fetch-modify-rewrite instead of atomic update operators**, losing atomicity and wasting bandwidth.
3. **Embedding unbounded, ever-growing arrays** (all of a user's posts, for example), risking degraded performance well before hitting the 16MB document size limit.
4. **Choosing a poor shard key** (monotonically increasing, causing hot-shard write concentration) without considering write-distribution implications upfront.
5. **Treating "flexible schema" as "no schema design needed"**, skipping deliberate data modeling discipline that MongoDB still genuinely benefits from.
6. **Not verifying index usage with explain()**, assuming an index helps without confirming the planner actually uses it.
7. **Assuming the default write concern (w: 1) provides the same durability guarantee as an explicit majority write concern** — the default does NOT wait for secondary replication.
8. **Overusing $lookup as a substitute for proper embed/reference schema decisions**, rather than treating frequent joins as a signal to reconsider the data model.
9. **Not monitoring replica set replication lag**, especially when reading from secondaries, risking silently serving stale data.
10. **Deploying a single standalone instance for production** instead of a genuine replica set, forfeiting both automatic failover and the durability guarantees replica sets provide.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| E11000 duplicate key error | Attempting to insert a document violating a unique index constraint | Handle the conflict explicitly, or check existence first |
| MongoNetworkError: failed to connect | Network connectivity issue, or authentication misconfiguration | Verify connection string, network access, and credentials |
| WriteConflict | Two operations conflicted within a multi-document transaction | Retry the transaction, MongoDB's recommended handling for this specific error |
| Document exceeds maximum allowed size | A document has grown beyond the 16MB hard limit, usually from unbounded embedding | Refactor to reference the unbounded relationship in a separate collection |
| NotWritablePrimary / NotPrimaryNoSecondaryOk | An application attempted a write against a secondary, or against a primary that has since stepped down | Ensure the driver's connection string lists all replica set members for automatic primary discovery |
| Index build IS running / already in progress | Attempting to create the same index concurrently, or an existing long-running index build | Check current index builds; wait for completion or use background index builds appropriately |
| Query plan uses COLLSCAN despite an existing index | The query's filter/sort doesn't match any existing index's field order | Design a compound index matching both the filter and sort fields in the correct order |
`,

  faqs: `
**MongoDB or PostgreSQL for a new project?**
Choose MongoDB when your data is genuinely document-shaped (variable structure, naturally hierarchical, read-together patterns) and you anticipate needing native horizontal scaling from early on. Choose PostgreSQL when your data is genuinely relational (well-defined entities with many-to-many relationships, needing strong join-heavy query support) or you want richer extensibility (pgvector, PostGIS) alongside relational guarantees. See the **PostgreSQL** skill for the direct comparison, and note that PostgreSQL's own JSONB support has narrowed some of MongoDB's historical "flexible schema" advantage.

**Does MongoDB support transactions?**
Yes, multi-document ACID transactions since MongoDB 4.0 (replica sets) and 4.2 (sharded clusters) — but idiomatic MongoDB schema design still favors structuring data so most operations remain single-document (always atomic by default in MongoDB, without needing an explicit transaction), reserving multi-document transactions for genuinely necessary cases given their real performance cost.

**Is MongoDB "schemaless"?**
Not entirely accurately described that way — MongoDB's schema is FLEXIBLE and optional by default (documents in the same collection can have different fields), but schema validation can be explicitly layered on when a team wants enforcement, and deliberate data modeling (the embed-versus-reference decision especially) remains essential regardless of whether formal validation is configured.

**How do I choose a shard key?**
Prioritize high cardinality (many distinct possible values) and even write distribution (avoiding a field like a timestamp that concentrates all new writes on one shard) — this is one of MongoDB's most consequential, hardest-to-change-later decisions, so model your actual write patterns carefully before choosing, rather than defaulting to a convenient field like _id or a creation timestamp.

**Can MongoDB replace a dedicated vector database for RAG applications?**
For teams already using MongoDB Atlas, Atlas Vector Search is a genuine, increasingly capable option letting embeddings live alongside application data in one managed service — similar in spirit to PostgreSQL's pgvector, though notably an Atlas-specific (managed cloud) capability rather than available in the self-hosted open-source Community Edition as of this page's knowledge cutoff.

**Why did MongoDB change its license to SSPL in 2019?**
Specifically in response to large cloud providers (most directly, AWS's DocumentDB) offering MongoDB-API-compatible managed services without licensing MongoDB itself or meaningfully contributing back to the open-source project — a genuine, ongoing tension in open-source database business models that several other database companies (Elastic, Redis Labs) have navigated with similar licensing changes around the same era.
`,

  "interview-questions": `
### Junior level

1. **What is a document in MongoDB, and how does it differ from a relational row?**
   Model answer: A document is a JSON-like (BSON) structure that can contain nested objects and arrays directly, unlike a flat relational row; related data can be embedded within one document rather than requiring a join across separate tables.

2. **What is the difference between embedding and referencing related data?**
   Model answer: Embedding stores related data directly within the parent document (best for bounded, together-read data); referencing stores a related document's ID and queries it separately or via $lookup (best for unbounded or independently-queried data).

3. **Why should you use update operators like $set and $inc instead of fetching, modifying, and rewriting a whole document?**
   Model answer: Update operators are atomic and targeted — they avoid a race condition where a concurrent update between fetch and rewrite would be silently lost, and they transfer far less data over the network.

4. **What is a replica set?**
   Model answer: A group of MongoDB instances (one primary accepting writes, multiple secondaries replicating from it) maintaining the same data, providing automatic failover if the primary becomes unavailable — the standard, expected unit of production MongoDB deployment.

5. **What does explain() show, and why is it important?**
   Model answer: It shows the query planner's chosen execution plan, including whether an index was used (IXSCAN) or a full collection scan occurred (COLLSCAN) — essential for diagnosing why a query is slow, the same role EXPLAIN plays in relational databases.

### Senior level

6. **How would you decide between embedding and referencing for a specific relationship, and what goes wrong if you choose incorrectly?**
   Model answer: Consider cardinality (one-to-few favors embedding, one-to-many-at-scale favors referencing) and access pattern (data read together favors embedding, independently-queried data favors referencing); choosing embedding for an unbounded relationship risks the 16MB document size limit and degraded performance well before hitting it, while choosing referencing for tightly-coupled, always-together data adds unnecessary $lookup overhead.

7. **What write concern does MongoDB use by default, and what durability tradeoff does that imply?**
   Model answer: The default write concern (w: 1) acknowledges a write once the primary has recorded it, WITHOUT waiting for secondary replication — meaning a primary failure immediately after acknowledgment, before replication completes, can genuinely lose that write; applications needing stronger durability must explicitly configure write concern "majority."

8. **How does shard key selection affect a sharded cluster's scalability, and what makes a shard key "bad"?**
   Model answer: The shard key determines how data (and consequently write load) is distributed across shards; a monotonically increasing key (like a timestamp or auto-incrementing ID) causes all new writes to concentrate on whichever shard currently owns the "highest" range, creating a hot-shard bottleneck that defeats the purpose of sharding — a good shard key has high cardinality and distributes writes evenly across the cluster.

9. **When would you reach for a multi-document transaction versus relying on single-document atomicity?**
   Model answer: MongoDB always guarantees single-document operations are atomic by default, without needing an explicit transaction; multi-document transactions are reserved for genuinely necessary cross-document (or cross-collection) atomicity needs (like a funds transfer between two account documents), used deliberately given their real performance cost rather than as a default pattern for every write.

10. **How does the oplog underpin both replica set replication and change streams?**
    Model answer: Every write on the primary is recorded in the oplog, a special capped collection; secondaries continuously tail and apply this log to stay in sync (replication), and change streams are themselves built by subscribing to this same oplog stream, letting an application react to data changes in near real time without a separate change-data-capture tool.

11. **What is "NoSQL injection," and how does it differ from classic SQL injection?**
    Model answer: NoSQL injection exploits unsanitized user input used to construct MongoDB query objects (particularly dangerous with the $where operator, which executes arbitrary JavaScript) rather than concatenating raw SQL text — the underlying principle (never trust unsanitized user input in a query) is the same as SQL injection, but the specific attack vectors and defenses differ given MongoDB's query language is structured objects, not a string-based query language.

12. **How would you use MongoDB Atlas Vector Search in a RAG application, and what's the tradeoff versus a dedicated vector database?**
    Model answer: Store document embeddings in a field alongside application metadata, create a vector search index, and query with $vectorSearch for similarity search combined with regular MongoDB filtering — the tradeoff is gaining one unified, managed database for both relational-ish application data and vector search (avoiding operating a separate system), at the cost of being tied to MongoDB Atlas specifically (not available in self-hosted open-source MongoDB) and potentially less specialized tuning than a dedicated vector database offers at very large scale.
`,

  "coding-questions": `
### 1. Write an aggregation pipeline computing total revenue per customer, filtered to completed orders

~~~javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$customerId", totalRevenue: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
]);
// $match runs FIRST, letting MongoDB use an index on status before the
// more expensive $group stage processes only the relevant subset of documents.
// Follow-up: how would you additionally filter to only orders from the last 30 days,
// and what compound index would best support this query?
~~~

### 2. Implement a safe, atomic "claim the next available item" pattern

~~~javascript
const result = await db.inventory.findOneAndUpdate(
  { status: "available" },
  { $set: { status: "reserved", reservedBy: userId, reservedAt: new Date() } },
  { sort: { createdAt: 1 }, returnDocument: "after" }
);
// findOneAndUpdate is atomic — it finds and updates in a single operation,
// preventing two concurrent requests from both claiming the SAME item.
// Follow-up: how would you handle the case where reservations should expire
// after a timeout if never confirmed, and what MongoDB feature (TTL indexes)
// would help implement that cleanly?
~~~

### 3. Design a schema for a blog with comments, justifying embed vs. reference

~~~javascript
// Comments: bounded-ish, typically read together with the post -> embed,
// but cap or paginate if a post could realistically get thousands of comments
{
  _id: 1,
  title: "Hello MongoDB",
  authorId: 42,              // REFERENCE the author: independently queried,
                               // shared across many posts, not bounded to this post
  comments: [                 // EMBED comments: read together with the post,
    { author: "Bob", text: "Great post!", createdAt: ISODate("...") }
  ]
}
// Follow-up: at what comment-count scale would you reconsider embedding
// comments and switch to a separate, referenced collection instead, and why?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Model and query a product catalog
Design a document schema for a product catalog with genuinely variable attributes across categories (electronics vs. clothing, for example), and write queries filtering on nested and array fields. Deliverable: a working catalog with correct queries. Skills exercised: document modeling, nested/array queries.

### Lab 2 (Intermediate): Build an aggregation pipeline for analytics
Given an orders collection, build a multi-stage aggregation pipeline computing revenue trends over time, grouped and sorted appropriately. Deliverable: a working analytics query. Skills exercised: the aggregation pipeline, $match/$group/$sort staging.

### Lab 3 (Advanced): Set up a replica set and simulate a failover
Configure a three-member replica set, write data, then simulate a primary failure and observe automatic election of a new primary. Deliverable: a documented failover test. Skills exercised: replica sets, rs.status(), high availability.

### Lab 4 (Production): Design a sharding strategy and add Atlas Vector Search
Design and justify a shard key for a high-write-volume collection, and (using MongoDB Atlas) add vector search capability to a small RAG-style document store. Deliverable: a documented sharding rationale and a working hybrid metadata + vector search query. Skills exercised: sharding strategy, Atlas Vector Search, the full production checklist.
`,

  "real-projects": `
### 1. A conversation history store for an AI chat application
Engineering requirements: a MongoDB schema storing conversation threads with embedded messages (bounded per conversation, read together), referenced user profiles, and TTL indexes for automatically expiring old, inactive conversation data. Demonstrates MongoDB's natural fit for variable-shape, naturally hierarchical AI application data.

### 2. A RAG knowledge base using MongoDB Atlas Vector Search
Engineering requirements: documents storing content, metadata, and embeddings in one collection, an Atlas Vector Search index, and hybrid queries combining vector similarity search with metadata filtering (e.g., permission-scoped retrieval). Demonstrates MongoDB's competitive positioning against PostgreSQL's pgvector for unified relational-ish-plus-vector applications.

### 3. A multi-tenant IoT telemetry ingestion platform
Engineering requirements: a sharded MongoDB cluster ingesting high-volume, variable-shape telemetry data from many device types, with a carefully chosen shard key (e.g., a compound key combining device ID and time bucket to avoid both hot-sharding and excessive fragmentation), and change streams powering real-time alerting on specific telemetry patterns. Demonstrates production-grade MongoDB sharding and change stream usage for a genuinely high-throughput, variable-schema domain.
`,

  "case-studies": `
### The historical "exposed MongoDB instances" security incidents
A well-documented, recurring pattern throughout MongoDB's earlier history involved instances deployed with authentication disabled (the historical default) directly exposed to the internet, discovered via automated scanning, and subsequently scraped or held for ransom — affecting thousands of instances across multiple incidents over several years. Lesson: a security-relevant feature that exists but isn't on by default will, at scale across an entire ecosystem, inevitably be missed by a meaningful fraction of deployments — this incident pattern directly influenced later movement across the database industry (including MongoDB's own evolution) toward more secure-by-default configurations.

### MongoDB's SSPL licensing change
MongoDB's 2019 shift to the Server Side Public License, directly motivated by large cloud providers offering MongoDB-API-compatible managed services (AWS's DocumentDB being the clearest example) without licensing MongoDB or contributing back, illustrates a genuine, ongoing tension in open-source database business models — how does a company build a sustainable business around an open-source database when the largest potential customers (cloud providers) can legally offer competing managed versions without reciprocal contribution? Lesson: open-source licensing choices are as much business-model decisions as legal/philosophical ones, and this specific tension has reshaped licensing across several prominent open-source database and infrastructure projects since.

### eBay and Forbes: document model fit for variable, content-heavy domains
Both companies' publicly discussed MongoDB adoptions for product catalog (eBay) and publishing platform (Forbes) needs specifically cite the document model's natural fit for genuinely variable data shapes — different product categories with different attribute sets, or articles with varying embedded media and metadata — that would require either an unwieldy, sparse relational schema or extensive use of a JSON column type to represent equivalently in a relational database. Lesson: the document model's value proposition is most concrete precisely where data genuinely varies in shape across records, not as a universal default choice regardless of data model fit.

### MongoDB's response to the vector search / RAG era
MongoDB Atlas's addition of native vector search capabilities, closely following pgvector's rise and the broader RAG application boom, demonstrates a now-familiar pattern across established databases (also seen with PostgreSQL/pgvector): rather than losing ground entirely to purpose-built vector databases, established, widely-deployed general-purpose databases have moved quickly to add competitive vector search capabilities, letting existing users avoid introducing an entirely separate specialized system for many RAG workload scales.
`,

  comparisons: `
| Aspect | MongoDB | PostgreSQL | MySQL | Redis |
|--------|---------|-----------|-------|-------|
| Data model | Document (BSON) | Relational (+ JSONB) | Relational | Key-value (+ data structures) |
| Schema | Flexible, optional validation | Rigid, enforced | Rigid, enforced | Schemaless (values only) |
| Horizontal scaling | Native sharding, designed in | Vertical-first, extensions for sharding | Vertical-first, Vitess for sharding | Native clustering |
| Transactions | Multi-document ACID since 4.0 | Full ACID, mature | Full ACID (InnoDB) | Limited (MULTI/EXEC, not full ACID) |
| Vector search | Atlas Vector Search (managed only) | pgvector (self-hosted, widely adopted) | Limited (Enterprise HeatWave only) | Vector search modules available |
| Best fit | Variable/hierarchical data, content/catalogs, horizontal-scale-from-start needs | Correctness-critical, extensible, relational-plus-vector apps | Existing MySQL/PHP ecosystems | Caching, sessions, real-time data structures |

**How seniors choose**: reach for MongoDB when data is genuinely variable/document-shaped and horizontal write scaling is an early, anticipated need; reach for PostgreSQL when data is genuinely relational or you want the strongest extensibility/vector-search story in the self-hosted open-source space; reach for MySQL when integrating with an existing MySQL-centric ecosystem; reach for Redis as a complementary caching/real-time layer alongside any of the above, not typically as a system of record on its own.
`,

  "related-technologies": `
- **PostgreSQL** and **MySQL** — the dominant relational alternatives, essential as direct comparisons; see both skills.
- **Redis** — the common complementary caching layer paired with MongoDB for hot, frequently-read data.
- **Distributed Systems** — the general theory underlying MongoDB's replica sets, sharding, and consistency model tradeoffs.
- **Vector Search** and **RAG** — the broader conceptual context Atlas Vector Search fits into.
- **Docker** and **Kubernetes** — how MongoDB is commonly containerized and orchestrated, or replaced by the managed Atlas offering.
- **Node.js**, **Python** — the languages most commonly used with MongoDB's official drivers (the Node.js driver historically being especially prominent, given MongoDB's frequent pairing with the MEAN/MERN stack).

Learning path: general programming and JSON fluency → **PostgreSQL**/**MySQL** for a relational contrast → this page → **Redis** for the complementary caching layer → **Docker**/**Kubernetes** for deployment → **Vector Search**/**RAG** for the Atlas Vector Search application context.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **MongoDB 7.x/8.x** are the current major release lines, with continued performance improvements, expanded aggregation pipeline capabilities, and continued Atlas Vector Search feature growth (additional index types, improved query performance).
- **Atlas Vector Search** continues rapid feature development given its central role in MongoDB's AI/RAG positioning — verify current capabilities (supported distance metrics, index types, scale limits) before committing to it for a new project.
- MongoDB's continued investment in Atlas as its primary product emphasis means some of the most actively developed features (vector search, advanced monitoring, serverless instances) are Atlas-specific rather than available in the self-hosted open-source Community Edition — verify which tier a specific feature requires before planning an architecture around it.
- Given the pace of change specifically around AI/vector-search features, check MongoDB's official release notes and Atlas documentation for the current state of these capabilities rather than assuming parity with what's described here.
`,

  "future-roadmap": `
Where MongoDB is heading, and what's worth betting career time on:

- **Continued Atlas Vector Search investment** — given the strategic importance of AI/RAG workloads to MongoDB's positioning against PostgreSQL/pgvector and dedicated vector databases, expect continued rapid feature development here.
- **Continued blurring of "NoSQL vs. relational" boundaries** — MongoDB's multi-document transactions and PostgreSQL's JSONB have each narrowed the other's historical differentiator, a trend likely to continue as both ecosystems keep borrowing successful ideas from each other.
- **Growing emphasis on Atlas as the primary deployment model** — self-hosted MongoDB remains fully viable and open-source, but an increasing share of new, advanced capabilities are likely to appear in Atlas first (or exclusively), a genuine consideration for teams planning a long-term self-hosted strategy.
- **What to bet on**: deep fluency in document schema design (the embed-versus-reference decision specifically), the aggregation pipeline, and shard key selection — these fundamentals remain valuable regardless of which specific new feature lands in MongoDB's next release, and transfer conceptually to reasoning about document databases generally.
`,

  "cheat-sheet": `
~~~javascript
// ---- Documents & basic queries ----
db.users.insertOne({ name: "Ada", address: { city: "London" } });   // embedded document
db.users.find({ "address.city": "London" });                          // dot notation for nested fields

// ---- Atomic update operators (never fetch-modify-rewrite) ----
db.users.updateOne({ _id: id }, { $set: { city: "Manchester" } });
db.users.updateOne({ _id: id }, { $inc: { loginCount: 1 } });
db.posts.updateOne({ _id: id }, { $push: { comments: newComment } });

// ---- Embed vs reference ----
// Embed: bounded, one-to-few, read together (e.g. address)
// Reference: unbounded, one-to-many-at-scale, independently queried (e.g. all posts by an author)

// ---- Aggregation pipeline ----
db.orders.aggregate([
  { $match: { status: "completed" } },     // filter FIRST, uses indexes
  { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
]);

// ---- Join equivalent ----
{ $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } }

// ---- Indexing ----
db.posts.createIndex({ tags: 1 });          // auto-detects arrays -> multikey index
db.orders.find({...}).explain("executionStats");   // watch for COLLSCAN vs IXSCAN

// ---- Transactions (use sparingly — most ops are single-doc atomic already) ----
const session = client.startSession();
session.startTransaction();
// ... operations with { session } ...
await session.commitTransaction();

// ---- Write/read concern ----
db.orders.insertOne(doc, { writeConcern: { w: "majority" } });

// ---- Production ----
// ALWAYS enable authentication. NEVER a single standalone instance in production.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is a document? | A JSON-like (BSON) structure that can nest objects/arrays directly, unlike a flat row. |
| Embed vs reference? | Embed: bounded, read-together data. Reference: unbounded, independently-queried data. |
| Why use $set/$inc instead of fetch-modify-rewrite? | Atomic and race-condition-free; also avoids transferring the whole document. |
| What does a replica set provide? | Automatic primary election/failover — the standard, expected production unit. |
| Default write concern? | w: 1 — acknowledges once the primary writes, does NOT wait for replication. |
| What makes a shard key "bad"? | Low cardinality or monotonically increasing — causes a hot-shard bottleneck. |
| Document size limit? | 16MB — approaching it signals a schema design problem (unbounded embedding). |
| What does explain() show? | The chosen plan: COLLSCAN (full scan, bad) vs IXSCAN (index used, good). |
| Are multi-document transactions the default pattern? | No — good schema keeps most ops single-document (always atomic by default). |
| What is the oplog? | The operation log powering both replica set replication AND change streams. |
| Historical MongoDB security lesson? | Auth was off by default — thousands of exposed, unauthenticated instances were breached. |
| What is NoSQL injection? | Unsanitized input building query objects — especially dangerous with $where. |
| Atlas Vector Search availability? | Managed Atlas only — not in the self-hosted open-source Community Edition. |
`,

  mcqs: `
1. What should you use instead of fetching a document, modifying it, and writing it back?
   A) replaceOne always  B) Atomic update operators like $set and $inc  C) A transaction every time  D) There's no alternative
   **Answer: B** — atomic and avoids a lost-update race condition.

2. What determines whether related data should be embedded or referenced?
   A) Random choice  B) Whether it's bounded and typically read together (embed) vs unbounded/independent (reference)  C) Always embed for performance  D) Always reference for consistency
   **Answer: B** — MongoDB's central schema-design decision.

3. What does MongoDB's default write concern (w: 1) NOT guarantee?
   A) The write reached the primary  B) That secondaries have replicated the write yet  C) The document is valid JSON  D) A response is returned
   **Answer: B** — a primary failure right after acknowledging can lose that write without "majority".

4. What's the most common cause of a "hot shard" problem?
   A) Too many indexes  B) A shard key with low cardinality or monotonically increasing values  C) Using $lookup too often  D) Enabling authentication
   **Answer: B** — all new writes concentrate on one shard, defeating the purpose of sharding.

5. Historically, what was the most damaging common MongoDB security misconfiguration?
   A) Weak TLS ciphers  B) Running with authentication disabled, exposed to the internet  C) Using too many indexes  D) Embedding documents
   **Answer: B** — led to numerous well-publicized data-exposure and ransom incidents.

6. Are multi-document ACID transactions MongoDB's idiomatic default pattern for every write?
   A) Yes, always required  B) No — good schema design keeps most operations single-document, which is always atomic by default  C) Only for reads  D) They don't exist in MongoDB
   **Answer: B** — transactions exist (since 4.0) but are reserved for genuinely necessary multi-document cases.
`,

  "revision-notes": `
MongoDB is a document database storing flexible, JSON-like (BSON) documents rather than rigid relational rows, letting related data be embedded directly within a single document instead of split across normalized tables requiring joins. This design bet pays off specifically for applications whose data is naturally document-shaped and whose access pattern is "fetch one complete entity in one read" — content management, product catalogs, and variable-schema domains like AI conversation logs — while trading away some of the relational model's normalization guarantees and cross-collection query convenience.

The central, most consequential MongoDB schema-design decision is embed versus reference: embed bounded, together-read related data (a user's address) directly in the parent document; reference unbounded or independently-queried data (a user's potentially unlimited posts) in a separate collection. Getting this wrong in either direction causes real problems — embedding an unbounded relationship risks the hard 16MB document size limit and degraded performance well before hitting it, while over-referencing bounded, together-read data adds unnecessary $lookup overhead that embedding would have avoided.

Update operators ($set, $inc, $push) provide atomic, targeted modifications to specific document fields — using them instead of a fetch-modify-rewrite pattern in application code is essential both for atomicity (avoiding a lost-update race condition under concurrent writes) and efficiency (avoiding unnecessary full-document network transfer). The aggregation pipeline is MongoDB's answer to SQL's SELECT/GROUP BY/ORDER BY, processing documents through explicit, composable stages ($match, $group, $sort) — placing $match early lets MongoDB use indexes to filter before more expensive grouping/sorting work, the same universal "filter before you aggregate" principle as relational query optimization.

Unlike relational databases where a single server is often the default starting point, a production MongoDB deployment is expected to be a replica set (one primary, multiple secondaries) from the start, providing automatic failover via primary election. The default write concern (w: 1) acknowledges a write once the primary has recorded it WITHOUT waiting for secondary replication — a genuine durability tradeoff applications with strict requirements must explicitly override with a stronger write concern ("majority"). Multi-document ACID transactions exist since MongoDB 4.0, closing a historically significant capability gap, but idiomatic MongoDB schema design still favors keeping most operations single-document (always atomic by default in MongoDB) rather than routinely reaching for transactions.

MongoDB's scaling story is distinctly horizontal-first, with native sharding designed in from early versions — a meaningfully different default posture than relational databases' "vertical-first, horizontal-with-real-effort" profile. Shard key selection is one of MongoDB's most consequential, hardest-to-change-later decisions: a poor choice (low cardinality, monotonically increasing) concentrates writes on a single shard, defeating sharding's entire purpose. MongoDB's historical default of authentication being OFF caused numerous well-publicized security incidents from exposed, unauthenticated instances — a permanent lesson in why security-relevant defaults matter at ecosystem scale, and why explicitly enabling authentication is a non-negotiable production requirement.
`,

  "learning-roadmap": `
**Week 1 — Document model fundamentals**: documents, collections, basic queries (including dot notation and array queries), and atomic update operators. Milestone: model and query a genuinely variable-shape data domain (e.g., a product catalog with different attribute sets per category).

**Week 2 — Schema design decisions**: the embed-versus-reference tradeoff, applying it deliberately across several relationship types, and schema validation. Milestone: design a blog schema justifying each embed/reference decision explicitly.

**Week 3 — The aggregation pipeline**: $match, $group, $sort, $lookup, and building multi-stage analytics queries. Milestone: build an aggregation pipeline computing a real analytics question over sample data.

**Week 4 — Indexing and performance**: creating appropriate indexes (including compound and multikey), using explain() to diagnose and fix a slow query. Milestone: fix a deliberately introduced COLLSCAN scenario.

**Week 5 — Replication and transactions**: replica set configuration, write/read concerns, primary election/failover, and multi-document transactions. Milestone: set up a replica set, simulate a failover, and implement a multi-document transaction for a genuine cross-document atomicity need.

**Week 6 — Sharding and production practices**: shard key selection, security (authentication, TLS), monitoring, and (optionally) Atlas Vector Search. Milestone: complete the Lab 4 hands-on project end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Redis** for the complementary caching layer, or **Vector Search**/**RAG** for going deeper on Atlas Vector Search's application context.
`,

  "official-docs": `
- **mongodb.com/docs** — the official MongoDB documentation, comprehensive and the primary reference for every feature covered in this page.
- **mongodb.com/docs/manual/core/aggregation-pipeline** — the official aggregation pipeline reference, essential depth beyond this page's overview.
- **mongodb.com/docs/atlas/atlas-vector-search** — the official Atlas Vector Search documentation for RAG/embeddings use cases.
- **mongodb.com/docs/manual/sharding** — the official sharding documentation, essential for shard key selection guidance.
- **mongodb.com/docs/manual/replication** — the official replica set documentation covering elections, write/read concerns, and high availability configuration.
`,

  books: `
- **"MongoDB: The Definitive Guide" (3rd ed.) — Shannon Bradshaw, Eoin Brazil, and Kristina Chodorow** — the most widely recommended comprehensive introduction, covering the document model, aggregation, and administration in depth.
- **"MongoDB in Action" (2nd ed.) — Kyle Banker et al.** — a practical, project-based introduction to schema design and application integration.
- **"Practical MongoDB Aggregations" — Paul Done** — focused specifically on mastering the aggregation pipeline, matching this page's Intermediate/Advanced Concepts sections in depth.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not MongoDB-specific, but essential foundational reading for the replication, sharding, and consistency-model concepts underlying this page's Scalability section.
`,

  blogs: `
- **The official MongoDB blog (mongodb.com/blog)** — release announcements, schema design guidance, and Atlas Vector Search updates directly from the MongoDB team.
- **The MongoDB Developer Hub (mongodb.com/developer)** — practical tutorials and best-practice guides spanning beginner to advanced topics.
- **Percona's blog** (also covers MongoDB, not just MySQL) — independent, practical MongoDB operations and performance content.
- **The Forbes and eBay engineering blogs** — periodic posts on their respective MongoDB adoptions, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
MongoDB, as a widely deployed production system, has relatively little dedicated academic literature of its own — the most relevant foundational reading concerns the broader NoSQL/document-database movement and distributed consensus theory:

- **DeCandia, G. et al. — "Dynamo: Amazon's Highly Available Key-value Store"** (2007, SOSP) — though describing a different system, this is one of the most influential papers of the broader NoSQL movement MongoDB emerged alongside, establishing much of the vocabulary (eventual consistency, partition tolerance tradeoffs) relevant to reasoning about MongoDB's own replication and sharding design.
- **Chang, F. et al. — "Bigtable: A Distributed Storage System for Structured Data"** (2006, OSDI) — another foundational NoSQL-era paper, useful comparative context for understanding the design space MongoDB's document model occupies relative to wide-column alternatives.
- For the Raft/Paxos-family consensus algorithms underlying MongoDB's replica set primary election, see the foundational reading (Ongaro and Ousterhout's Raft paper specifically) referenced in the **Distributed Systems** skill.
`,

  videos: `
- **MongoDB.local and MongoDB World conference talks** (widely available on YouTube) — the primary annual conferences for the MongoDB ecosystem, featuring deep talks directly from MongoDB engineers and large-scale production users.
- **The official MongoDB YouTube channel** — tutorial series and feature deep-dives, including dedicated Atlas Vector Search content.
- **"MongoDB Schema Design" talks and workshops** — several well-regarded conference talks specifically addressing the embed-versus-reference decision in depth with real-world examples.
- **Fireship's "MongoDB in 100 Seconds" and related rapid-overview content** — useful for a quick conceptual refresher.
`,

  "github-repos": `
- **mongodb/mongo** — the database's own source code, an advanced but genuinely rewarding read for understanding WiredTiger integration, the query planner, and replication internals directly.
- **mongodb/mongo-csharp-driver, mongodb/node-mongodb-native, mongodb/mongo-python-driver** — the official language-specific driver repositories, useful for understanding exactly how application code interacts with MongoDB at the protocol level.
- **nodkz/mongodb-memory-server** — the in-memory MongoDB testing tool referenced in this page's Testing section.
- **testcontainers/testcontainers-node** (and equivalents for other languages) — for genuine, isolated integration testing referenced throughout Testing.
- **mongodb/mongo-tools** — the official mongodump/mongorestore and related backup/restore tooling.
- **Automattic/mongoose** — the widely used Node.js object modeling library for MongoDB, adding optional schema enforcement on top of the flexible document model.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Document modeling**: given a set of relationships (users, posts, comments, tags), justify an embed-versus-reference decision for each and design the resulting schema.
2. **Query and update operators**: given a fetch-modify-rewrite anti-pattern example, refactor it to use appropriate atomic update operators.
3. **Aggregation pipeline**: solve a multi-stage analytics problem (e.g., top customers by revenue in a date range) using $match, $group, $sort, and $limit.
4. **Indexing**: given a slow query and its explain() output showing COLLSCAN, design and add the correct index (including compound index field ordering).
5. **Sharding**: given a described write pattern, evaluate several candidate shard keys and justify which best avoids a hot-shard problem.
6. **External practice sets**: MongoDB University's free official courses for structured, guided practice; the official MongoDB documentation's tutorials for hands-on schema design and aggregation exercises.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application servers\n(stateless, many instances)"] --> Mongos["mongos routers\n(if sharded)"]
    Mongos --> Shard1["Shard 1: a replica set"]
    Mongos --> ShardN["Shard N: a replica set"]
    subgraph Shard1Detail["Shard 1 detail"]
        P1["Primary"]
        S1a["Secondary"]
        S1b["Secondary"]
        P1 -->|oplog| S1a
        P1 -->|oplog| S1b
    end
    Shard1 -.-> Shard1Detail
    App --> Cache[("Redis\ncomplementary caching layer")]
    subgraph AtlasFeatures["Atlas-specific"]
        VectorSearch["Atlas Vector Search\n(embeddings for RAG)"]
        Backup["Continuous backup"]
    end
    Shard1 -.-> AtlasFeatures
    subgraph Observability
        Compass["MongoDB Compass"]
        Prometheus["mongodb_exporter\n+ Prometheus/Grafana"]
    end
    Shard1 -.-> Observability
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((MongoDB))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Document Model
      Documents and collections
      Embed vs reference
      Update operators
      Schema validation
    Querying
      Dot notation
      Array queries
      Aggregation pipeline
      Lookup joins
    Replication and HA
      Replica sets
      Oplog
      Write and read concerns
      Change streams
    Scaling
      Sharding architecture
      Shard key selection
      Mongos routers
    Transactions
      Single-document atomicity
      Multi-document ACID
      When to use each
    AI and Vector Search
      Atlas Vector Search
      RAG application patterns
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

export default mongodb;
