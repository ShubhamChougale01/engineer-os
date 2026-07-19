import type { SkillContent } from "../types";

/**
 * Neo4j — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const neo4j: SkillContent = {
  overview: `
Neo4j is a native graph database — data is stored and queried as nodes (entities) and relationships (connections between them) directly, rather than as rows in tables that must be joined at query time to reconstruct connections. Its defining architectural bet is "index-free adjacency": each node physically stores direct pointers to its adjacent relationships, so traversing from one node to its neighbors is a constant-time pointer-following operation regardless of how large the overall database is, fundamentally different from a relational join, whose cost grows with table and result size.

For an AI engineer, Neo4j shows up specifically wherever the QUESTIONS being asked are fundamentally about connections and paths rather than aggregates — "who influenced whom," "what's the shortest path between these two entities," "which documents share overlapping citation chains." This maps directly onto knowledge graphs, a foundational structure for many RAG (retrieval-augmented generation) architectures that need to represent and query entity relationships explicitly rather than relying purely on vector similarity, and onto GraphRAG specifically, an increasingly common pattern combining graph traversal with LLM retrieval for multi-hop reasoning.

Key characteristics: the property graph model (nodes and relationships can both carry arbitrary key-value properties, not just a bare connection); Cypher, a declarative, pattern-matching query language designed specifically to express graph traversals readably; index-free adjacency making relationship traversal performance independent of overall database size; full ACID transaction support (unlike many NoSQL databases that trade this away); and a genuinely different mental model for schema design, centered on "what are the entities and how do they connect" rather than normalized tables.
`,

  history: `
Neo4j was created by **Emil Eifrem**, **Johan Svensson**, and **Peter Neubauer**, motivated by a real content-management problem at a prior company where modeling deeply connected, hierarchical content in a relational database had become genuinely painful.

| Year | Milestone |
|------|-----------|
| 2000 | The founders begin encountering severe performance and modeling problems representing highly connected content-management data relationally, motivating the search for a better model |
| 2003 | Early internal development of what becomes Neo4j begins, initially as a proprietary internal tool |
| 2007 | Neo Technology (the company behind Neo4j) is founded to commercialize the database |
| 2010 | Neo4j 1.0 is released publicly, introducing the property graph model and an early version of what becomes Cypher |
| 2011 | Cypher, Neo4j's declarative graph query language, is introduced, aiming to make graph pattern-matching as readable as SQL is for relational data |
| 2015 | Neo4j 2.0/2.2 — significant Cypher maturation and performance improvements to index-free adjacency traversal |
| 2017 | Neo4j 3.0 — a native Bolt binary protocol replaces the earlier REST-only interface, improving driver performance |
| 2020 | Neo4j 4.0 — multi-database support within a single server instance, and Fabric for federated queries across multiple graphs |
| 2021 | **openCypher** continues as an effort to standardize Cypher as an open query language usable beyond Neo4j itself, alongside the broader industry-wide **GQL (Graph Query Language)** ISO standardization effort Neo4j has actively contributed to |
| 2023 | **GQL becomes an official ISO/IEC international standard** (ISO/IEC 39075), the first new database query language to receive ISO standardization since SQL itself — with Cypher's syntax and semantics a major influence on GQL's design |
| 2023–2025 | Continued Neo4j 5.x releases with significant performance improvements, and rapidly growing adoption specifically for knowledge-graph and GraphRAG use cases tied to the LLM/RAG application boom |

GQL's 2023 ISO standardization is a genuinely significant milestone for the entire graph database industry — Cypher's substantial influence on GQL's design means Neo4j's approach to graph querying has, in effect, helped shape the first new internationally standardized database query language since SQL itself, a rare and notable achievement for any database vendor's own query language.
`,

  "why-it-exists": `
Neo4j exists because its founders hit a very specific, very real wall: **modeling deeply, variably connected data (like hierarchical content with cross-references) in a relational database required an explosion of join tables, and the joins themselves got dramatically slower as the data and its connections grew**, precisely because a relational join's cost is a function of table size, not just the number of connections actually being traversed.

The prior landscape (relational databases for highly connected data) offered:

1. **Many-to-many join tables**: technically expressible, but modeling "friend of a friend of a friend" (a 3-hop traversal) requires three successive joins, each of which must search across the ENTIRE relevant table to find matches — the query gets slower as the tables grow, even though the actual number of paths being followed might be small.
2. **Denormalized, pre-computed connection tables**: a common workaround, materializing common traversal paths ahead of time — but this trades query-time flexibility for write-time complexity and becomes unwieldy for connections whose depth or shape isn't known in advance.

Neo4j's insight was "index-free adjacency": if each node physically stores direct pointers to its own relationships (rather than requiring an index lookup or table scan to find them), then traversing from a node to its neighbors — and from THERE to their neighbors, and so on — becomes a constant-time pointer-following operation at every hop, with total query cost proportional to the actual size of the traversed subgraph, NOT the size of the overall database. This is precisely why multi-hop graph queries (which get dramatically, sometimes prohibitively slower in a relational database as hop count increases) remain fast in Neo4j regardless of how many total nodes exist in the graph.
`,

  "problem-it-solves": `
Neo4j solves the **"my queries are fundamentally about relationships and paths between entities, and a relational database's join cost grows unacceptably as connection depth increases"** problem.

Concretely, Neo4j provides:

- **Index-free adjacency**: relationship traversal cost depends on the size of the actual subgraph traversed, not the total database size — a multi-hop query stays fast even as the overall graph grows to millions of nodes.
- **The property graph model**: both nodes and relationships can carry arbitrary properties (a "KNOWS" relationship between two people can itself have a "since" property, for example), letting the connections themselves carry meaningful data, not just a bare link.
- **Cypher's readable, pattern-matching syntax**: queries visually resemble the graph pattern being matched (parentheses for nodes, arrows for relationships), making complex traversal queries dramatically more readable than the equivalent chain of relational joins.
- **Native support for variable-length and shortest-path queries**: finding "all paths up to 4 hops" or "the shortest path between these two nodes" are first-class, efficient Cypher operations, not something requiring recursive CTEs or application-level graph-walking logic.
- **Full ACID transactions**: unlike many NoSQL databases that traded transactional guarantees for other benefits, Neo4j maintains full ACID compliance.

What Neo4j deliberately does **not** solve, or solves less naturally than alternatives: it is not optimized for the kind of large-scale, simple aggregate queries (SUM, COUNT across millions of unconnected rows) that a columnar analytical database like ClickHouse handles far more efficiently; its data model, while flexible, still benefits from deliberate upfront modeling of what constitutes a node versus a relationship versus a property, a genuine design skill distinct from relational normalization; and while Neo4j scales read capacity via replication (Causal Clustering), truly massive-scale graph sharding across many machines remains a harder, less mature problem across the graph database industry generally than sharding is for simpler data models.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the property graph model and design an appropriate graph schema, choosing what should be a node, a relationship, or a property.
2. Write Cypher queries using pattern matching, including multi-hop traversals, variable-length paths, and shortest-path queries.
3. Explain index-free adjacency and why it makes Neo4j's traversal performance characteristics fundamentally different from a relational join's.
4. Use appropriate indexes and constraints in Neo4j to optimize lookup-by-property performance.
5. Model and query a knowledge graph appropriate for a RAG/GraphRAG application.
6. Understand Neo4j's transaction guarantees and Causal Clustering for read scaling and high availability.
7. Use the APOC library and graph algorithms (PageRank, community detection) for advanced analytical queries.
8. Diagnose and optimize a slow Cypher query using EXPLAIN and PROFILE.
9. Answer senior-level interview questions on index-free adjacency, Cypher's pattern-matching model, and when a graph database is (and isn't) the right choice.
`,

  prerequisites: `
- **Required**: general programming fundamentals; no prior graph database or relational database experience is strictly required, though this page contrasts Neo4j against relational approaches throughout.
- **Very helpful**: the **PostgreSQL** skill — understanding relational joins deeply makes Neo4j's index-free adjacency advantage, and its tradeoffs, far more concrete.
- **Helpful**: general **Computer Science** fundamentals (graph theory basics: nodes, edges, traversal, shortest path) for understanding Cypher's operations and the underlying algorithms more deeply.
- **Helpful**: the **Knowledge Graphs** and **RAG** skills for the broader AI-application context Neo4j frequently serves.

Dependency links: general programming fundamentals → **PostgreSQL** for a useful relational contrast → this page → **Knowledge Graphs** and **RAG** for the AI-application context Neo4j commonly serves → **Docker**/**Kubernetes** for deployment.
`,

  "beginner-concepts": `
### Nodes, relationships, and properties

~~~
CREATE (ada:Person {name: "Ada Lovelace", born: 1815})
CREATE (charles:Person {name: "Charles Babbage", born: 1791})
CREATE (ada)-[:COLLABORATED_WITH {on: "Analytical Engine"}]->(charles)
~~~

A node (in parentheses) represents an entity, labeled with a category (:Person) and carrying properties (name, born); a relationship (in square brackets, connected by an arrow showing direction) connects two nodes and can ALSO carry properties — here, the COLLABORATED_WITH relationship itself has an "on" property describing what they collaborated on.

### Basic Cypher pattern matching

~~~
MATCH (p:Person {name: "Ada Lovelace"})
RETURN p;

MATCH (p:Person)-[:COLLABORATED_WITH]->(other:Person)
WHERE p.name = "Ada Lovelace"
RETURN other.name;
~~~

Cypher's MATCH clause describes a graph PATTERN to find — the syntax visually resembles the shape of the graph being searched, with parentheses for nodes and arrows showing relationship direction; this is Cypher's central design idea, making a query read almost like a diagram of what it's looking for.

### Multi-hop traversal

~~~
MATCH (p:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH]->()-[:COLLABORATED_WITH]->(fof:Person)
RETURN DISTINCT fof.name;
~~~

Chaining relationship patterns () -[:REL]-> () -[:REL]-> () expresses a multi-hop traversal directly — finding "collaborators of collaborators" (a 2-hop query) reads almost exactly like the pattern being described, and executes efficiently regardless of how large the overall graph is, thanks to index-free adjacency.

### Updating and deleting

~~~
MATCH (p:Person {name: "Ada Lovelace"})
SET p.notable_for = "First computer programmer"
RETURN p;

MATCH (p:Person {name: "Ada Lovelace"})-[r:COLLABORATED_WITH]->(other)
DELETE r;
~~~

SET updates properties on a matched node/relationship; DELETE removes a matched relationship or node (a node with existing relationships must have those relationships explicitly deleted first, or use DETACH DELETE to remove both together).

### Basic indexes and constraints

~~~
CREATE INDEX person_name_index FOR (p:Person) ON (p.name);
CREATE CONSTRAINT person_name_unique FOR (p:Person) REQUIRE p.name IS UNIQUE;
~~~

An index on a frequently-searched property (like name) speeds up the initial MATCH (p:Person {name: ...}) lookup — index-free adjacency makes TRAVERSAL fast once you have a starting node, but finding that starting node by a property value still benefits from a conventional index, exactly as in a relational database.

Common beginner trap: modeling something that should be a relationship property as a separate intermediate node, or vice versa — covered fully in Intermediate Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### Variable-length path queries

~~~
MATCH (p:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH*1..3]->(connected:Person)
RETURN DISTINCT connected.name;
~~~

The *1..3 syntax matches paths of length 1 to 3 hops — finding everyone reachable within 3 collaboration-steps of Ada, in one declarative query, without needing application-level recursive logic or a recursive CTE the way an equivalent relational query would require.

### Shortest path queries

~~~
MATCH path = shortestPath(
    (a:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH*]-(b:Person {name: "Alan Turing"})
)
RETURN path;
~~~

shortestPath() is a built-in, optimized Cypher function finding the shortest connecting path between two nodes — a genuinely common graph query (degrees-of-separation style questions) that Neo4j handles as a first-class operation rather than something requiring custom application logic.

### Aggregation and grouping

~~~
MATCH (p:Person)-[:COLLABORATED_WITH]->(other:Person)
RETURN p.name, COUNT(other) AS collaborator_count
ORDER BY collaborator_count DESC
LIMIT 10;
~~~

Cypher supports aggregation functions (COUNT, SUM, AVG) and ORDER BY/LIMIT, conceptually similar to SQL's equivalent clauses, letting graph traversal results be aggregated and ranked just as relational query results can be.

### The node-versus-relationship-versus-property modeling decision

~~~
-- Modeling "worked at" as a relationship with properties (usually correct):
(person:Person)-[:WORKED_AT {from: 2020, to: 2023, role: "Engineer"}]->(company:Company)

-- Modeling employment as its own node (correct when the employment record
-- ITSELF needs to connect to other things, e.g. a specific project):
(person:Person)-[:HAS_EMPLOYMENT]->(emp:Employment {from: 2020, to: 2023})-[:AT]->(company:Company)
(emp)-[:WORKED_ON]->(project:Project)
~~~

Whether a real-world concept (like "employment") should be a relationship's properties or its own intermediate node depends on whether that concept itself needs to be independently queried or connected to other things — a genuinely important, frequently-revisited modeling decision, analogous in spirit to (but distinct from) the embed-versus-reference decision in MongoDB's document model.

### MERGE — find-or-create

~~~
MERGE (p:Person {name: "Ada Lovelace"})
ON CREATE SET p.created_at = timestamp()
ON MATCH SET p.last_seen = timestamp();
~~~

MERGE matches an existing node/relationship if one exists, or creates it if it doesn't — Cypher's answer to an "upsert," essential for idempotent data-loading scripts that might run multiple times against the same data without creating duplicates.

### Working with labels and multiple node types

~~~
MATCH (p:Person)
WHERE p:Author OR p:Researcher   -- a node can have multiple labels simultaneously
RETURN p;

CREATE (paper:Document:Paper {title: "On Computable Numbers"})
~~~

A single node can carry multiple labels simultaneously (a person can be both :Author and :Researcher), letting the same entity be found via different categorical queries without duplicating it.
`,

  "advanced-concepts": `
### Index-free adjacency internals

~~~mermaid
flowchart LR
    A["Node: Ada"] -->|direct pointer| R1["Relationship record:\nCOLLABORATED_WITH"]
    R1 -->|direct pointer| B["Node: Charles"]
    A -.->|no index/table scan needed\nto find THIS relationship| R1
~~~

Unlike a relational database, where finding rows related to a given row typically requires an index lookup (or worse, a table scan) against a foreign key column, Neo4j physically stores, on the node itself, a direct pointer chain to its relationships — traversing from a node to its neighbors requires simply following this pointer, an O(1) operation regardless of how many total nodes exist in the database; this is THE defining architectural fact explaining why Neo4j's multi-hop traversal performance doesn't degrade as the overall graph grows, unlike a relational join whose cost scales with table size.

### GraphRAG and knowledge graph patterns

~~~
// A simplified GraphRAG-style knowledge graph:
CREATE (doc:Document {title: "Quarterly Report"})
CREATE (entity1:Entity {name: "Acme Corp", type: "Organization"})
CREATE (entity2:Entity {name: "Q3 Revenue", type: "Metric"})
CREATE (doc)-[:MENTIONS]->(entity1)
CREATE (doc)-[:MENTIONS]->(entity2)
CREATE (entity1)-[:REPORTED]->(entity2)

// A multi-hop GraphRAG-style retrieval query:
MATCH (d:Document)-[:MENTIONS]->(e:Entity)-[:REPORTED]->(related:Entity)
WHERE e.name = "Acme Corp"
RETURN d.title, related.name;
~~~

GraphRAG (a pattern combining graph traversal with LLM-based retrieval) extracts entities and relationships from documents into a knowledge graph, then answers queries by traversing that graph to find related context BEFORE (or alongside) vector similarity search — particularly valuable for multi-hop questions ("what metrics are associated with companies mentioned alongside this topic") that pure vector similarity search struggles to answer directly, since it has no explicit notion of entity relationships, only semantic proximity.

### Graph algorithms via the Graph Data Science library

~~~
CALL gds.pageRank.stream('myGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC
LIMIT 10;

CALL gds.louvain.stream('myGraph')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name AS name, communityId;
~~~

Neo4j's Graph Data Science (GDS) library provides implementations of well-known graph algorithms — PageRank (influence/importance ranking), Louvain community detection (finding clusters of densely-connected nodes), shortest path variants, and centrality measures — directly executable against the graph without needing to export data to a separate analytics tool.

### Causal Clustering for scaling and high availability

~~~mermaid
flowchart LR
    Client["Client"] --> Core1["Core server 1\n(participates in writes\nvia Raft consensus)"]
    Client --> Core2["Core server 2"]
    Client --> Core3["Core server 3"]
    Core1 -->|Raft replication| ReadReplica1["Read replica\n(read-only, scales reads)"]
    Core2 -->|Raft replication| ReadReplica2["Read replica"]
~~~

Neo4j's Causal Clustering uses the Raft consensus algorithm among "core" servers to provide strongly consistent writes with automatic leader election, plus independently-scalable read replicas for read-heavy workloads — providing both high availability and read scaling, though genuinely horizontal WRITE scaling (sharding a graph across many machines) remains a harder, less mature capability across the graph database industry broadly, including for Neo4j.

### EXPLAIN and PROFILE for query optimization

~~~
EXPLAIN MATCH (p:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH]->(other) RETURN other;
PROFILE MATCH (p:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH]->(other) RETURN other;
~~~

EXPLAIN shows the planned query execution strategy without running it; PROFILE actually executes the query and shows real row counts and timing at each step of the plan — directly analogous to EXPLAIN and EXPLAIN ANALYZE in PostgreSQL, essential for diagnosing whether a query is using an appropriate index for its starting node lookup, or falling back to a full label scan.

### The APOC library

APOC (Awesome Procedures On Cypher) is a widely-used extension library adding hundreds of utility procedures beyond core Cypher — data import/export, graph refactoring operations, virtual graph projections for testing, and much more — considered close to a de facto standard extension for any serious Neo4j deployment, similar in spirit to PostgreSQL's extension ecosystem.
`,

  "internal-working": `
What happens inside Neo4j from a Cypher query to a returned result:

~~~mermaid
flowchart LR
    A["Client sends Cypher query"] --> B["Parser\n(builds an abstract query tree)"]
    B --> C["Query planner\n(chooses a traversal strategy,\nuses statistics for starting-point selection)"]
    C --> D["Execution engine\n(follows index-free adjacency\npointers node-to-node)"]
    D --> E["Page cache\n(in-memory cache of the\nunderlying storage files)"]
    E --> F["Transaction log\n(write-ahead log, durability)"]
    F --> G["Result returned to client"]
~~~

1. **Parsing and planning**: Cypher is parsed into an internal query representation, and the planner decides how to find the query's STARTING node(s) (typically via an index or label scan) — this initial lookup is the one part of a Cypher query that behaves similarly to a relational lookup, benefiting from conventional indexes.
2. **Traversal execution**: once a starting node is found, the execution engine follows index-free adjacency pointers directly from node to relationship to node, with no additional index lookups needed for each subsequent hop — this is the core performance characteristic distinguishing graph traversal from relational joins.
3. **Page cache**: Neo4j caches frequently-accessed portions of its underlying storage files in memory (the page cache), conceptually similar to PostgreSQL's shared_buffers or MySQL's InnoDB buffer pool, sized appropriately for the working graph's size.
4. **Transaction log**: every write is recorded in a write-ahead transaction log before being considered durable, the same foundational durability mechanism (WAL/redo log/binary log) seen across every transactional database on this platform.

**Why the initial node lookup still needs an index**: index-free adjacency accelerates TRAVERSAL from an already-found node to its neighbors — it does nothing to accelerate the very first step of FINDING that starting node by some property value (like a name), which still requires a conventional index (or, absent one, a full label scan across every node with that label) exactly as a relational database would need an index to find a starting row efficiently.
`,

  architecture: `
A senior engineer thinks about Neo4j at two levels: **the property graph model as the primary schema-design decision** (what's a node, what's a relationship, what's a property) and **query pattern design around index-free adjacency's specific strengths**.

### The property graph model as architecture

~~~mermaid
flowchart LR
    subgraph Graph["A property graph"]
        N1["Node: Person\n(properties: name, born)"]
        N2["Node: Company\n(properties: name, founded)"]
        R["Relationship: WORKED_AT\n(properties: from, to, role)"]
    end
    N1 -->|R| N2
~~~

Unlike a relational schema (tables and foreign keys) or a document schema (embed versus reference decisions), a graph schema centers on identifying real-world ENTITIES (nodes), the CONNECTIONS between them (relationships, which can themselves carry meaningful properties), and deciding when a connection's own attributes warrant promoting it to its own intermediate node (see Intermediate Concepts).

### Recommended project structure around Neo4j

~~~
myapp/
├── src/
│   ├── models/               # entity/relationship type definitions (labels, expected properties)
│   ├── queries/                # Cypher queries, often kept as named, reusable, parameterized strings
│   ├── graph_service.py          # application logic wrapping the Neo4j driver
│   └── migrations/                # schema constraint/index setup scripts, versioned
├── tests/
└── requirements.txt
~~~

Rules mature Neo4j teams follow: parameterize Cypher queries (never string-concatenate user input directly into a query, the graph-database equivalent of SQL injection risk); create explicit constraints for uniqueness guarantees and indexes for frequently-searched starting-node properties; and design queries to start from a well-indexed node and traverse OUTWARD, rather than queries requiring a full graph scan.
`,

  "data-flow": `
Tracing one Cypher query end to end — finding collaborators of collaborators:

~~~mermaid
sequenceDiagram
    participant Client
    participant Neo4j as Neo4j server
    participant Planner
    participant IndexLookup as Index lookup (starting node)
    participant Traversal as Index-free adjacency traversal
    participant PageCache

    Client->>Neo4j: MATCH (p:Person {name:'Ada'})-[:COLLAB]->()-[:COLLAB]->(fof) RETURN fof
    Neo4j->>Planner: parse and plan the query
    Planner->>IndexLookup: find the starting node (p) via the name index
    IndexLookup->>PageCache: fetch the Person node with name='Ada'
    PageCache-->>IndexLookup: node found
    IndexLookup->>Traversal: begin traversal from this node
    Traversal->>Traversal: follow COLLABORATED_WITH pointers,\nhop 1, then hop 2 (no index lookups needed per hop)
    Traversal-->>Neo4j: matching "friend of a friend" nodes
    Neo4j-->>Client: result set
~~~

The most misunderstood part for newcomers: **only the STARTING node lookup benefits from a conventional index — every subsequent hop in the traversal uses index-free adjacency's direct pointer-following, with NO additional index lookups required**, which is precisely why a query's total cost scales with the size of the traversed subgraph (how many hops, how many nodes at each hop), not with the total number of nodes in the entire database — a query finding "collaborators of collaborators" of one specific person remains fast whether the graph has a thousand nodes or a hundred million, as long as that specific person's local neighborhood is similarly sized in both cases.
`,

  "production-usage": `
### Connecting and running queries

~~~python
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

with driver.session() as session:
    result = session.run(
        "MATCH (p:Person {name: $name})-[:COLLABORATED_WITH]->(other) RETURN other.name",
        name="Ada Lovelace"
    )
    for record in result:
        print(record["other.name"])
~~~

Always use parameterized queries ($name above), never string-concatenate user input directly into Cypher — the same injection-prevention discipline as parameterized SQL queries, and equally essential.

### Configuration essentials

~~~
dbms.memory.heap.max_size=4G
dbms.memory.pagecache.size=4G
~~~

Non-negotiables for production:

1. **Page cache sized to fit the working graph's relationship/node data** where possible — analogous to PostgreSQL's shared_buffers, a critical tuning parameter for traversal performance.
2. **Explicit constraints and indexes on frequently-searched starting-node properties** — without them, finding a starting node requires an expensive full label scan.
3. **Parameterized queries throughout application code** — never build Cypher via string concatenation with untrusted input.

### Common production stacks

- **Knowledge graphs for RAG/GraphRAG applications**: Neo4j storing extracted entities and relationships, queried alongside (or instead of) pure vector similarity search for multi-hop reasoning questions.
- **Fraud detection and recommendation systems**: classic Neo4j use cases where the QUESTION is inherently relationship-shaped ("is this transaction connected to known fraud rings," "what do similar users also like").
- **Identity and access management graphs**: modeling complex permission/role hierarchies as a graph, where "can user X access resource Y through any chain of role inheritance" is a natural graph traversal question.
`,

  "industry-examples": `
- **eBay**: uses Neo4j for parts of its product catalog and search-relevance infrastructure, leveraging graph relationships between products, categories, and user behavior.
- **NASA**: has used Neo4j for modeling complex, deeply interconnected engineering and mission data (the "Lessons Learned" knowledge base being a widely cited example) where relational modeling proved unwieldy.
- **UBS**: uses Neo4j for financial risk and compliance applications, where tracing complex ownership/relationship chains between entities is a core, recurring business question.
- **Walmart**: has used Neo4j for supply-chain and real-time recommendation use cases, where the underlying question ("which products are frequently bought together, connected through what paths") is naturally graph-shaped.
- **The Panama Papers investigation (International Consortium of Investigative Journalists)**: one of the most widely cited Neo4j case studies, using the database to model and traverse an enormous, deeply interconnected web of shell companies, ownership structures, and individuals, enabling journalists to uncover hidden ownership chains a relational approach would have made dramatically harder to query.
- **Adobe**: uses Neo4j for parts of its identity resolution infrastructure, connecting user identities across many devices and touchpoints.
- **Many emerging GraphRAG-focused AI companies and research teams**: Neo4j has seen rapidly growing adoption specifically for knowledge-graph-backed RAG applications since the GraphRAG pattern gained prominence, given Cypher's natural fit for expressing the multi-hop entity-relationship queries GraphRAG requires.

Pattern to notice: Neo4j adoption clusters around **domains where the actual business question is fundamentally about connections, paths, and relationships** — fraud detection, recommendation, compliance/ownership tracing, and increasingly knowledge-graph-backed AI retrieval — rather than domains needing large-scale simple aggregation or high-volume simple key-value access.
`,

  "best-practices": `
1. **Model based on the actual questions you need to answer**, not an abstract "correct" graph structure — a graph schema should be driven by query patterns, similar in spirit to MongoDB's read-pattern-driven document design.
2. **Create indexes/constraints on properties used to find starting nodes** — index-free adjacency accelerates traversal FROM a node, not the initial lookup TO find it.
3. **Always use parameterized Cypher queries**, never string-concatenating untrusted input — the graph-database equivalent of SQL injection prevention.
4. **Promote a relationship's properties to a full intermediate node** when that concept itself needs independent querying or further connections, not by default for every relationship.
5. **Use MERGE for idempotent data loading** rather than CREATE, avoiding accidental duplicate nodes if a load script runs more than once.
6. **Design queries to start from a well-indexed, specific node and traverse outward**, rather than patterns requiring a full label scan across the entire graph.
7. **Use variable-length path syntax (*1..3) and shortestPath() for genuinely multi-hop questions** rather than manually chaining many separate queries in application code.
8. **Leverage APOC and the Graph Data Science library** for common utility operations and graph algorithms rather than reimplementing them in application code.
9. **Use PROFILE, not just EXPLAIN, when genuinely diagnosing a slow query** — PROFILE shows actual execution statistics, EXPLAIN only the planned strategy.
10. **Use multiple labels on a node deliberately** when an entity genuinely belongs to more than one category, rather than creating awkward, duplicated node structures.
11. **Consider Causal Clustering for read scaling and high availability** once a single instance's read capacity or availability requirements exceed what one server provides.
12. **Recognize when Neo4j is NOT the right tool** — simple aggregate-heavy analytics or pure high-volume key-value access are usually better served by ClickHouse or Redis respectively; reach for Neo4j specifically when the core question is relationship-shaped.
`,

  "anti-patterns": `
### Building queries by string-concatenating user input (Cypher injection)

~~~python
# WRONG — vulnerable to Cypher injection, the graph-database analog of SQL injection
name = request.get("name")
query = "MATCH (p:Person {name: '" + name + "'}) RETURN p"
session.run(query)

# RIGHT — always use parameterized queries
session.run("MATCH (p:Person {name: $name}) RETURN p", name=request.get("name"))
~~~

Constructing Cypher by string concatenation with untrusted input is a genuine, real security vulnerability class, analogous to SQL injection — parameterized queries prevent it structurally, the same universal database discipline as any other query language.

### Over-modeling every attribute as a separate node

~~~
-- WRONG — turning simple scalar attributes into unnecessary intermediate nodes,
-- adding traversal overhead and complexity with no real benefit
(person:Person)-[:HAS_AGE]->(age:Age {value: 36})

-- RIGHT — a simple scalar attribute belongs directly on the node as a property
(person:Person {age: 36})
~~~

A common overcorrection from relational-normalization instincts: not every attribute needs to be its own node — only promote something to a node when it genuinely needs independent identity, its own relationships, or is itself queried as a first-class entity.

### Other production-grade anti-patterns

- **Missing indexes on starting-node lookup properties**: forces an expensive full label scan for the initial MATCH, even though subsequent traversal would otherwise be fast.
- **Unbounded variable-length path queries** (*1.. with no upper bound) on a densely connected graph: can produce an explosively large result set or take a very long time, since the number of possible paths grows combinatorially with hop count in a dense graph.
- **Treating Neo4j as a general-purpose replacement for a relational or document database** for workloads that aren't actually relationship-shaped — a Neo4j deployment used purely for simple key-value lookups or large aggregate analytics is very likely the wrong tool for that specific job.
- **Not using MERGE for data loading scripts that might run more than once**, resulting in duplicate nodes/relationships on a re-run.
- **Ignoring PROFILE output and assuming a query is fast** without verifying the actual execution plan and row counts at each step.
`,

  performance: `
### Rule zero: measure first

~~~
PROFILE MATCH (p:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH*1..3]->(connected) RETURN connected;
~~~

PROFILE shows the actual execution plan with real row counts and timing at each step — never guess at a Cypher performance problem; check specifically whether the starting-node lookup used an index (NodeIndexSeek) or fell back to a full scan (NodeByLabelScan, generally far more expensive).

### The performance hierarchy (apply in order)

1. **Ensure the starting node lookup uses an index** — a missing index on a frequently-searched starting property forces a full label scan before traversal even begins, the most common and most fixable Neo4j performance problem.
2. **Bound variable-length path queries appropriately** (*1..3 rather than unbounded *1..) — an unbounded traversal on a densely connected graph can produce combinatorially explosive results.
3. **Design queries to traverse from a specific, well-indexed node outward**, rather than patterns that must scan broadly across many possible starting points.
4. **Tune page cache size** to fit the working graph's data, analogous to any database's buffer/cache tuning.
5. **Use the Graph Data Science library's optimized algorithm implementations** (PageRank, shortest path variants) rather than hand-rolling equivalent logic in application code or naive Cypher.
6. **Scale reads horizontally with Causal Clustering read replicas** once a single instance's read throughput is genuinely the bottleneck.

### Micro-level facts worth knowing

- Relationship direction in Cypher patterns matters for readability and sometimes for query planning, but Neo4j can traverse relationships in either direction efficiently — an undirected pattern (-[:REL]-) is a valid, sometimes necessary query style.
- COUNT() over a large label or relationship type can require significant work in some cases — Neo4j maintains some count-store optimizations for common cases, but verify with PROFILE for anything performance-critical.
- Batch writes (using UNWIND to process a list of records in one transaction) are significantly more efficient than many individual single-record write transactions for bulk data loading.
`,

  scalability: `
Neo4j's scaling story centers on **Causal Clustering for read scaling and high availability**, with genuinely horizontal write-scaling (sharding a single graph across many machines) remaining a harder, less mature capability than for simpler data models.

### Causal Clustering architecture

~~~mermaid
flowchart LR
    Client["Application"] --> Core1["Core server 1\n(Raft leader — accepts writes)"]
    Client --> Core2["Core server 2\n(Raft follower)"]
    Client --> Core3["Core server 3\n(Raft follower)"]
    Core1 -->|Raft replication| ReadReplica1["Read replica 1"]
    Core1 -->|Raft replication| ReadReplicaN["Read replica N"]
    Client -->|read-heavy queries| ReadReplica1
~~~

Core servers use the Raft consensus algorithm to agree on writes with strong consistency and automatic leader election on failure; read replicas scale read capacity independently, similar in spirit to relational read replicas, though replication here carries the full graph rather than a relational table subset.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Missing index on starting-node lookups | Add appropriate indexes/constraints; verify with PROFILE |
| Single instance's read throughput ceiling | Causal Clustering read replicas |
| High availability for the write path | Causal Clustering's Raft-based core servers with automatic leader election |
| A genuinely enormous graph exceeding one server's memory/storage | Fabric (federated queries across multiple graph databases) or careful graph partitioning by domain, since true transparent sharding of one graph remains a harder problem |
| Unbounded variable-length path queries causing combinatorial blowup | Bound the path length explicitly and add relationship-type/direction constraints to narrow the traversal |
`,

  security: `
### Neo4j's built-in security features

1. **Role-based access control**: Neo4j supports fine-grained permissions controlling which users can read/write specific labels, relationship types, or properties, similar in spirit to relational database GRANT/REVOKE systems.
2. **TLS/SSL for connections**: encrypting data in transit, standard practice for any production database connection.
3. **Parameterized Cypher queries prevent Cypher injection**: the direct analog of SQL injection prevention via parameterized queries — always use them, never string-concatenate untrusted input into a query.

### What remains the application's responsibility

- **Cypher injection via string-concatenated queries**: Neo4j doesn't prevent this if application code builds queries by concatenating untrusted input directly; parameterized queries are the correct, structural defense.
- **Secrets management**: database credentials from environment variables or a secrets manager, never hardcoded.
- **Sensitive property encryption**: Neo4j itself doesn't automatically encrypt specific property values at rest beyond whatever filesystem/infrastructure-level encryption is configured; sensitive data may need application-level encryption before storage.

### Graph-specific security considerations

Because graph databases naturally represent relationships and access patterns explicitly, they're sometimes themselves used to MODEL authorization/permission systems (see Real Projects) — a genuinely elegant use case, but one requiring careful design to avoid the graph itself becoming an attack surface if query results inadvertently traverse into data a user shouldn't see; row-level-security-equivalent patterns (filtering traversals by a user's actual permission scope, enforced consistently across every query) require deliberate application-layer discipline, since Neo4j itself doesn't provide row-level security as a built-in feature the way PostgreSQL does.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Testing Neo4j-dependent application code follows similar principles to testing against any database, with Neo4j-specific tooling for realistic, isolated tests.

~~~python
import pytest
from testcontainers.neo4j import Neo4jContainer

@pytest.fixture
def neo4j_driver():
    with Neo4jContainer("neo4j:5") as neo4j:
        driver = neo4j.get_driver()
        yield driver

def test_create_and_find_person(neo4j_driver):
    with neo4j_driver.session() as session:
        session.run("CREATE (p:Person {name: $name})", name="Ada Lovelace")
        result = session.run("MATCH (p:Person {name: $name}) RETURN p", name="Ada Lovelace")
        assert result.single() is not None
~~~

Testcontainers spins up a real, disposable Neo4j instance for each test run — important given graph traversal and pattern-matching behavior that's difficult to accurately approximate with a mock.

### Testing Cypher queries directly

~~~python
def test_shortest_path_query(neo4j_driver):
    with neo4j_driver.session() as session:
        session.run("""
            CREATE (a:Person {name: 'A'})-[:KNOWS]->(b:Person {name: 'B'})
            CREATE (b)-[:KNOWS]->(c:Person {name: 'C'})
        """)
        result = session.run("""
            MATCH path = shortestPath((a:Person {name: 'A'})-[:KNOWS*]-(c:Person {name: 'C'}))
            RETURN length(path) AS path_length
        """)
        assert result.single()["path_length"] == 2
~~~

### The senior testing doctrine

- Use Testcontainers (or a real, isolated test instance) rather than mocking the driver entirely — graph pattern-matching correctness is genuinely hard to approximate without exercising real Cypher execution.
- Clean up test data between tests (delete created nodes/relationships) to avoid state leaking between test runs, since graph queries can easily be affected by leftover data from a previous test.
- Test multi-hop and shortest-path queries explicitly with small, hand-constructed test graphs where the expected result is easy to verify by inspection.
- Test that parameterized queries correctly handle potentially malicious input (attempted Cypher injection), confirming the parameterization actually prevents it.
`,

  debugging: `
### The toolbox, in escalation order

1. **PROFILE** — the first, most important tool for any "why is this query slow" investigation; shows the actual execution plan, row counts, and timing at each step, revealing whether the starting-node lookup used an index or fell back to a full scan.
2. **EXPLAIN** — shows the planned execution strategy without actually running the query, useful for a quick sanity check before running a potentially expensive query against production data.
3. **Neo4j Browser** (the official web-based tool) — provides visual graph exploration, query execution, and a visual PROFILE plan view, often more intuitive than reading raw text output for understanding a graph query's behavior.
4. **SHOW INDEXES / SHOW CONSTRAINTS** — lists all configured indexes and constraints, useful for confirming an expected index actually exists.
5. **CALL dbms.listQueries()** — shows currently running queries, useful for finding long-running or stuck operations.
6. **Logs** (query log, debug log) — Neo4j can log slow queries exceeding a configured threshold, giving visibility into problematic queries you didn't know to look for.

### Debugging common Neo4j-specific symptoms

- "A simple-looking query is surprisingly slow" — almost always a missing index on the starting-node lookup property; check PROFILE for a NodeByLabelScan (expensive) versus a NodeIndexSeek (fast).
- "A variable-length path query is extremely slow or seems to hang" — likely an unbounded or overly broad path length on a densely connected graph, causing combinatorial explosion; bound the path length and add relationship-type/direction constraints.
- "Cannot delete a node" errors — a node has existing relationships that must be deleted first (or use DETACH DELETE to remove both together in one operation).
`,

  monitoring: `
Production Neo4j visibility rests on the same three pillars as any database, with graph-specific signals worth first-class monitoring.

### Key metrics to track

- **Page cache hit ratio**: a low ratio suggests the cache is undersized relative to the working graph's actual data footprint.
- **Query latency and slow query log volume**: the primary signal for catching missing-index or unbounded-traversal problems before they become widespread.
- **Transaction log size and checkpoint frequency**: relevant to both durability guarantees and disk usage over time.
- **Causal Clustering replica lag**: for any application reading from replicas, a growing lag risks serving stale data.
- **Heap and page cache memory usage**: Neo4j's JVM-based architecture means both JVM heap tuning and page cache sizing matter, similar in spirit to tuning considerations covered in the **Spring Boot**/**Java** skills.

### Tools

Neo4j's built-in metrics can be exported to Prometheus via the neo4j-metrics-exporter, integrated into a broader Prometheus/Grafana observability stack — see the **Prometheus** and **Grafana** skills. Neo4j Browser and Neo4j Bloom (a visual graph exploration tool) provide ad-hoc, visual insight into query behavior and graph structure.

### Alerting priorities

Alert on: page cache hit ratio trending downward, slow query log volume increasing, Causal Clustering replica lag exceeding an acceptable threshold, and disk space approaching capacity given transaction log growth.
`,

  deployment: `
### Managed vs. self-hosted

~~~
Managed (Neo4j Aura, the official managed cloud offering):
  + automated backups, patching, scaling, and Causal Clustering configuration handled for you
  - a genuine ongoing cost, tied specifically to Neo4j's own cloud offering

Self-hosted (VMs or Kubernetes, e.g. via the official Neo4j Helm charts):
  + full control over configuration and version
  - operational responsibility for Causal Clustering setup, backups, and monitoring
~~~

### Backup strategy

~~~bash
neo4j-admin database dump neo4j --to-path=/backup    # offline logical backup
neo4j-admin database backup neo4j --to-path=/backup    # online backup (Enterprise Edition)
~~~

Online, non-blocking backups (a genuine operational convenience) are an Enterprise Edition feature; the open-source Community Edition typically requires taking the database offline or using a replica for consistent backup snapshots.

### High availability

Causal Clustering (covered in Scalability) provides both write high-availability (via Raft-based leader election among core servers) and read scaling (via independently-scalable read replicas) — the standard production high-availability pattern, though it requires either Neo4j Enterprise Edition or Aura's managed offering, since Causal Clustering is not available in the free Community Edition.

### CI/CD pipeline

Constraint and index setup scripts (analogous to relational schema migrations) run as an explicit, versioned deploy step; application-level Cypher queries are typically deployed alongside application code rather than requiring a separate migration tool. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before a Neo4j-backed application takes real traffic:

- [ ] Constraints and indexes created for every frequently-searched starting-node property
- [ ] All application queries parameterized, never string-concatenated with untrusted input
- [ ] Page cache and JVM heap sized appropriately for the working graph's data footprint
- [ ] Authentication and role-based access control configured explicitly
- [ ] TLS/SSL enabled for all connections
- [ ] Automated backups configured and actually tested for restoration
- [ ] Causal Clustering configured if high availability or read scaling is required (Enterprise/Aura)
- [ ] Slow query logging enabled with an appropriate threshold
- [ ] Variable-length path queries bounded appropriately, avoiding unbounded traversal risk
- [ ] Monitoring/alerting wired up for page cache hit ratio, query latency, and replica lag
- [ ] Database credentials loaded from environment variables/a secrets manager
- [ ] MERGE used (not CREATE) for any idempotent data-loading scripts
- [ ] Load test done: known query throughput and latency under realistic concurrent load
- [ ] Runbook: how to fail over, restore from backup, and diagnose a slow query with PROFILE
`,

  "common-mistakes": `
1. **Not indexing frequently-searched starting-node properties**, forcing expensive full label scans before traversal even begins.
2. **String-concatenating user input into Cypher queries**, introducing a genuine Cypher injection vulnerability, the graph-database analog of SQL injection.
3. **Over-modeling simple scalar attributes as separate nodes** out of relational-normalization habit, adding unnecessary traversal complexity with no real benefit.
4. **Writing unbounded variable-length path queries** on a densely connected graph, risking combinatorially explosive result sets or extremely slow execution.
5. **Using CREATE instead of MERGE for data-loading scripts that might run more than once**, resulting in duplicate nodes/relationships.
6. **Choosing Neo4j for a workload that isn't actually relationship-shaped** — simple aggregation or high-volume key-value access are typically better served by ClickHouse or Redis respectively.
7. **Ignoring PROFILE output** and assuming a query is efficient without verifying whether the planner is actually using an available index.
8. **Not deciding deliberately between promoting a relationship's data to its own node** versus keeping it as relationship properties, defaulting inconsistently across a schema.
9. **Attempting to delete a node with existing relationships** without using DETACH DELETE, encountering an avoidable constraint error.
10. **Assuming Causal Clustering (for high availability/scaling) is available in Community Edition** without confirming — it requires Enterprise Edition or Aura.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Cannot delete node, still has relationships | Attempting DELETE on a node with existing relationships | Use DETACH DELETE to remove the node and its relationships together |
| ConstraintValidationFailed | A write violated a uniqueness constraint | Handle the conflict explicitly, or use MERGE instead of CREATE |
| Neo.ClientError.Statement.SyntaxError | Malformed Cypher syntax | Check parentheses/bracket matching and relationship arrow direction carefully |
| Query took an unexpectedly long time / appears to hang | An unbounded variable-length path query on a densely connected graph | Bound the path length explicitly (e.g., *1..3) and add relationship-type constraints |
| ServiceUnavailable / connection refused | Neo4j server not running, or wrong bolt URI/port | Verify the server is running and the connection URI matches the configured bolt port |
| Result missing expected data despite a seemingly correct MATCH | Relationship direction in the pattern doesn't match the actual data's direction | Use an undirected pattern (-[:REL]-) if direction is uncertain, or verify the actual stored direction |
| Memory/heap errors under load | JVM heap or page cache undersized for the working graph and query load | Tune dbms.memory.heap.max_size and dbms.memory.pagecache.size appropriately |
`,

  faqs: `
**When should I use Neo4j instead of PostgreSQL?**
When the core business QUESTIONS are fundamentally about relationships, paths, and multi-hop connections (fraud rings, recommendation chains, organizational hierarchies, knowledge graphs) rather than aggregation over relatively flat, less-connected data. If most of your queries are simple filters and joins one or two levels deep, PostgreSQL (potentially with recursive CTEs for the occasional graph-like query) often remains simpler and sufficient.

**Is Cypher similar to SQL?**
Conceptually, in that both are declarative query languages, but Cypher's pattern-matching syntax (describing the SHAPE of the graph you're looking for) is fundamentally different from SQL's relational algebra-based approach — Cypher reads more like a diagram of the pattern being matched, while SQL reads more like a series of set operations (select, filter, join).

**How does GraphRAG relate to Neo4j?**
GraphRAG is an architectural PATTERN (extracting entities and relationships from documents into a knowledge graph, then using graph traversal alongside or instead of pure vector similarity search for retrieval) that Neo4j is commonly used to implement, given Cypher's natural fit for expressing the multi-hop entity queries GraphRAG requires — see the **RAG** and **Knowledge Graphs** skills for the broader conceptual context.

**Can Neo4j replace a vector database for RAG applications?**
Not typically as a full replacement — Neo4j excels at explicit, structured relationship queries (multi-hop reasoning over known entity connections), while vector databases excel at semantic similarity search over unstructured text; GraphRAG architectures commonly combine both, using vector search for initial semantic retrieval and graph traversal for structured, multi-hop reasoning over the retrieved entities' relationships.

**Is Neo4j ACID-compliant?**
Yes — unlike many NoSQL databases that traded transactional guarantees for other benefits, Neo4j maintains full ACID compliance for its transactions, a genuine differentiator versus some other graph and document database options.

**How does Neo4j scale for very large graphs?**
Causal Clustering provides read scaling and high availability effectively, but genuinely horizontal write-scaling (sharding a single graph's data across many machines while preserving efficient cross-shard traversal) remains a harder, less mature problem across the graph database industry generally — very large-scale deployments often use Fabric (federated queries across multiple separate graph databases) or deliberate domain-based graph partitioning rather than transparent, automatic sharding.
`,

  "interview-questions": `
### Junior level

1. **What is a property graph, and what are its three core components?**
   Model answer: A data model where entities are represented as nodes and connections as relationships, with both nodes and relationships able to carry arbitrary key-value properties — the three core components are nodes, relationships, and properties.

2. **What does Cypher's MATCH clause do?**
   Model answer: It describes a graph PATTERN to search for, using parentheses for nodes and arrows for relationships, visually resembling the shape of the data being matched.

3. **What is the difference between CREATE and MERGE in Cypher?**
   Model answer: CREATE always creates a new node/relationship, potentially creating duplicates if run more than once; MERGE finds an existing match or creates it if none exists, making it the correct choice for idempotent data-loading operations.

4. **Why do you still need an index in Neo4j if index-free adjacency makes traversal fast?**
   Model answer: Index-free adjacency accelerates traversal FROM an already-found node to its neighbors; it does nothing to accelerate the initial lookup TO FIND that starting node by a property value, which still benefits from a conventional index just as in a relational database.

5. **What does DETACH DELETE do, and why is it sometimes necessary?**
   Model answer: It deletes a node along with all of its relationships in one operation; a plain DELETE on a node that still has relationships fails, since Neo4j won't leave "dangling" relationship references.

### Senior level

6. **Explain index-free adjacency and why it makes multi-hop traversal fundamentally different in cost from a relational join.**
   Model answer: Each node physically stores direct pointers to its own relationships, so traversing to a neighbor is an O(1) pointer-following operation with no index lookup or table scan needed; a relational join, by contrast, must search a (potentially large) table for matching foreign-key values at each hop, meaning join cost grows with table size, while Neo4j's traversal cost grows only with the size of the actually-traversed subgraph.

7. **When would you promote a relationship's properties to a separate intermediate node?**
   Model answer: When the concept the relationship represents (like an employment record) itself needs to be independently queried, connected to other entities, or have its own set of further relationships — a plain relationship property is correct when the data is purely descriptive of the connection itself and never needs to stand alone.

8. **How does Neo4j's Causal Clustering provide both high availability and read scaling?**
   Model answer: Core servers use the Raft consensus algorithm to agree on writes with strong consistency and automatic leader election if the current leader fails, providing high availability; independently-scalable read replicas handle read-heavy load without burdening the core write path, providing read scaling — conceptually similar to relational primary/replica patterns, adapted for graph data.

9. **What is GraphRAG, and why would you combine graph traversal with vector similarity search rather than using just one?**
   Model answer: GraphRAG extracts entities and relationships from documents into a knowledge graph, then uses graph traversal for structured, multi-hop reasoning over known relationships (which vector similarity alone can't express, having no explicit notion of entity connections) alongside vector search for semantic similarity over unstructured text (which pure graph queries can't provide) — combining both addresses a broader range of retrieval questions than either alone.

10. **Why is an unbounded variable-length path query risky, and how do you mitigate it?**
    Model answer: On a densely connected graph, the number of possible paths grows combinatorially with hop count, so an unbounded (*1..) traversal can produce an explosively large result set or take a very long time; bounding the path length explicitly (*1..3) and adding relationship-type/direction constraints narrows the search space to something tractable.

11. **How would you diagnose a Cypher query that PROFILE shows is using a full label scan instead of an index?**
    Model answer: Check whether an index actually exists on the property being searched (SHOW INDEXES); if one doesn't exist, create it; if one exists but isn't being used, verify the query's WHERE/pattern clause actually matches the indexed property in a way the planner can recognize (e.g., not wrapped in a function call that prevents index usage).

12. **What is Cypher injection, and how do you prevent it?**
    Model answer: Analogous to SQL injection, it occurs when untrusted user input is concatenated directly into a Cypher query string rather than passed as a parameter, potentially letting an attacker alter the query's structure or behavior; parameterized queries (using $paramName placeholders bound to actual values via the driver) prevent this structurally, the same universal defense pattern as parameterized SQL.
`,

  "coding-questions": `
### 1. Find mutual connections between two people (a common "you may know" recommendation pattern)

~~~
MATCH (a:Person {name: "Ada Lovelace"})-[:KNOWS]-(mutual:Person)-[:KNOWS]-(b:Person {name: "Alan Turing"})
WHERE a <> b AND mutual <> a AND mutual <> b
RETURN DISTINCT mutual.name;
-- Undirected relationship pattern (-[:KNOWS]-) matches regardless of which
-- direction the relationship was originally created in.
-- Follow-up: how would you rank the mutual connections by how many total
-- connections THEY have (a simple influence/popularity signal)?
~~~

### 2. Detect a cycle in a dependency graph (useful for build systems, task graphs)

~~~
MATCH path = (n:Task)-[:DEPENDS_ON*]->(n)
RETURN path LIMIT 1;
-- A path from a node back to ITSELF via one or more DEPENDS_ON relationships
-- indicates a cycle — dangerous for a dependency graph that must be a DAG.
-- Follow-up: how would you modify this to find ALL distinct cycles in the
-- graph, not just confirm one exists, and what's the performance risk of
-- doing so on a very large, densely connected graph?
~~~

### 3. Build a simple GraphRAG-style multi-hop retrieval query

~~~
// Given a knowledge graph of documents, entities, and their relationships:
MATCH (query_entity:Entity {name: $entityName})
MATCH (query_entity)-[:RELATED_TO*1..2]-(related:Entity)
MATCH (doc:Document)-[:MENTIONS]->(related)
RETURN DISTINCT doc.title, related.name
ORDER BY doc.title
LIMIT 20;
-- Finds documents mentioning entities within 2 hops of a given starting entity —
-- a simplified GraphRAG-style retrieval expanding beyond direct mentions.
-- Follow-up: how would you weight or rank results by traversal distance
-- (favoring closer, more directly related entities over more distant ones)?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Model and query a social network
Create a small graph of people and KNOWS relationships, and write queries for direct connections, mutual friends, and simple aggregation (most-connected person). Deliverable: a working graph with correct queries. Skills exercised: property graph modeling, basic Cypher pattern matching.

### Lab 2 (Intermediate): Build a recommendation query using variable-length paths
Given a graph of users, products, and PURCHASED relationships, build a "customers who bought this also bought" recommendation query using multi-hop traversal. Deliverable: a working recommendation query. Skills exercised: variable-length paths, aggregation, query design.

### Lab 3 (Advanced): Build a simple knowledge graph and GraphRAG-style query
Extract entities and relationships from a small set of sample documents into a knowledge graph, then write multi-hop retrieval queries combining document and entity traversal. Deliverable: a working knowledge graph with GraphRAG-style retrieval queries. Skills exercised: knowledge graph modeling, multi-hop retrieval patterns.

### Lab 4 (Production): Optimize a slow query and set up monitoring
Given a deliberately slow Cypher query (missing an index, or an unbounded path), diagnose with PROFILE, fix it, and set up basic Prometheus-based monitoring for page cache hit ratio and query latency. Deliverable: a documented before/after performance comparison and a monitoring dashboard. Skills exercised: PROFILE-driven optimization, indexing, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A GraphRAG-powered knowledge assistant for internal documentation
Engineering requirements: extracting entities (people, projects, systems) and their relationships from internal documents into a Neo4j knowledge graph, combining vector similarity search (via a separate vector store or pgvector) for initial retrieval with graph traversal for multi-hop reasoning over the retrieved entities' relationships, and a clean API layer for an LLM to query both. Demonstrates the increasingly common GraphRAG pattern directly relevant to AI-application engineering.

### 2. A fraud detection system tracing suspicious transaction networks
Engineering requirements: modeling accounts, transactions, and shared attributes (phone numbers, addresses, devices) as a graph, with Cypher queries detecting suspicious patterns (accounts connected through unusual numbers of shared attributes, unusually short paths between accounts that shouldn't be related). Demonstrates a classic, well-proven Neo4j use case where the core question is inherently relationship-shaped.

### 3. A permission and access-control graph for a complex multi-tenant system
Engineering requirements: modeling users, roles, resources, and permission grants (including inherited/nested roles) as a graph, with queries answering "can user X access resource Y through any permission chain" efficiently regardless of how deep or complex the role hierarchy becomes. Demonstrates Neo4j's natural fit for authorization systems with genuinely graph-shaped permission inheritance.
`,

  "case-studies": `
### The Panama Papers investigation
The International Consortium of Investigative Journalists' use of Neo4j to model and traverse an enormous, deeply interconnected network of shell companies, offshore accounts, and individuals during the Panama Papers investigation is one of the most widely cited real-world Neo4j case studies — the investigation's core questions (who ultimately owns this shell company, through how many intermediate entities) were fundamentally graph-shaped, and a relational approach to the same enormous, deeply nested ownership data would have made the necessary multi-hop queries dramatically harder to express and execute efficiently. Lesson: when a domain's core questions are genuinely about tracing connections through an unknown, variable number of intermediate hops, a graph database's fit isn't just a performance optimization — it fundamentally changes what queries are practical to even express.

### GQL's ISO standardization and Cypher's influence
GQL (Graph Query Language) becoming an official ISO/IEC international standard in 2023 — the first new database query language to achieve this status since SQL itself — with Cypher's syntax and semantics as a major influence on its design, is a significant industry milestone. Lesson: a database vendor's own proprietary query language achieving this level of industry-wide influence and eventual standardization is rare, and reflects Cypher's genuine, widely-recognized success at making graph pattern-matching readable and expressive in a way the broader industry converged around rather than fragmenting into many incompatible dialects.

### UBS and financial compliance graph modeling
UBS's use of Neo4j for financial risk and compliance, specifically for tracing complex ownership and relationship chains between entities (a recurring regulatory requirement in finance, closely related in spirit to the Panama Papers use case), demonstrates the pattern's applicability beyond investigative journalism into mainstream, highly regulated enterprise compliance work — wherever "trace the relationship chain between these entities, however many hops it takes" is a recurring, business-critical question, Neo4j's core strength directly applies.

### The rise of GraphRAG since 2023
The rapid growth in Neo4j (and graph databases generally) adoption specifically for GraphRAG-style knowledge-graph-backed RAG applications since the pattern gained prominence in 2023-2024 illustrates a now-familiar pattern across this platform's database skills: an established technology finding significant new relevance and adoption momentum when a new application category (here, LLM-based retrieval-augmented generation) turns out to have needs (multi-hop entity-relationship reasoning) that the technology was already well-suited to address, even though it predates that specific application category by well over a decade.
`,

  comparisons: `
| Aspect | Neo4j | PostgreSQL | MongoDB | ClickHouse |
|--------|-------|-----------|---------|------------|
| Data model | Property graph (nodes, relationships, properties) | Relational (+ JSONB) | Document (BSON) | Columnar (analytics-optimized) |
| Core strength | Multi-hop relationship traversal, path-finding | Correctness, extensibility, general-purpose queries | Flexible, variable-shape document data | Massive-scale aggregation and analytics |
| Query language | Cypher (pattern-matching), converging toward GQL standard | SQL | MongoDB Query Language / aggregation pipeline | SQL (analytics-optimized dialect) |
| Transactions | Full ACID | Full ACID | Multi-document ACID since 4.0 | Limited (analytics-focused, not OLTP) |
| Traversal cost model | Independent of total database size (index-free adjacency) | Grows with table size per join | Not applicable (document-centric, not traversal-centric) | Not applicable (aggregation-centric) |
| Best fit | Fraud detection, recommendations, knowledge graphs/GraphRAG, compliance tracing | Correctness-critical, extensible, relational-plus-vector apps | Variable/hierarchical data, content/catalogs | Large-scale analytical aggregation, dashboards, logs |

**How seniors choose**: reach for Neo4j specifically when the core business questions are about relationships, paths, and multi-hop connections that would require deeply nested, increasingly expensive joins in a relational database; reach for PostgreSQL for general-purpose, correctness-critical relational data (and note its Cypher-inspired openCypher-adjacent extensions and AGE extension exist for occasional graph queries without a dedicated graph database); reach for MongoDB for genuinely variable-shape document data; reach for ClickHouse for large-scale aggregation-heavy analytics — these tools solve genuinely different core problems, and choosing based on the SHAPE of your most important queries (not general popularity) is the right decision framework.
`,

  "related-technologies": `
- **PostgreSQL** — the dominant relational alternative, useful as a direct comparison for understanding why index-free adjacency matters; see the **PostgreSQL** skill.
- **Knowledge Graphs** and **RAG** — the broader AI-application conceptual context Neo4j frequently serves, particularly for GraphRAG patterns.
- **Vector Search** — the complementary semantic-similarity retrieval technique often combined with Neo4j's graph traversal in GraphRAG architectures.
- **Graph Databases** (the general category, referenced throughout, distinct from Neo4j specifically as one implementation) — see the **Graph Databases** skill for the broader landscape.
- **Ontology** — the formal knowledge-modeling discipline informing how entities and relationships are structured in a serious knowledge graph.
- **Docker** and **Kubernetes** — how Neo4j is commonly containerized and orchestrated, or replaced by the managed Neo4j Aura offering.

Learning path: general programming fundamentals → **PostgreSQL** for a relational contrast → this page → **Knowledge Graphs**/**RAG** for the AI-application context → **Vector Search** for the complementary GraphRAG technique → **Docker**/**Kubernetes** for deployment.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Neo4j 5.x** is the current major release line, with continued performance improvements to Cypher execution and expanded Graph Data Science library algorithm coverage.
- **GQL (ISO/IEC 39075)**, standardized in 2023, continues industry adoption momentum, with Neo4j actively aligning Cypher's evolution toward the standard — verify current Cypher-versus-GQL compatibility specifics if portability across graph database vendors matters for your project.
- **GraphRAG-specific tooling** (both Neo4j's own official integrations and broader ecosystem libraries connecting Neo4j to popular LLM/RAG frameworks) continues rapid development given the pattern's growing prominence — verify current library support for your specific LLM framework of choice.
- Given the pace of change specifically in GraphRAG tooling and Graph Data Science library capabilities, check Neo4j's official release notes and documentation for the current state of these rapidly-evolving areas rather than assuming parity with what's described here.
`,

  "future-roadmap": `
Where Neo4j is heading, and what's worth betting career time on:

- **Continued GraphRAG and knowledge-graph-for-AI investment** — given the strategic alignment between Neo4j's core strengths and this rapidly growing application category, expect continued significant feature and integration development here.
- **Continued GQL standard alignment** — as the broader graph database industry converges around the ISO-standardized GQL, expect Cypher's own evolution to track closely, likely easing portability concerns across graph database vendors over time.
- **Continued Graph Data Science library expansion** — more built-in algorithms and improved performance for common analytical graph operations (centrality, community detection, similarity), reducing the need for custom implementations.
- **What to bet on**: deep fluency in property graph modeling (the node-versus-relationship-versus-property decision specifically), Cypher's pattern-matching style, and understanding index-free adjacency's specific performance implications — these fundamentals remain valuable regardless of which specific new Neo4j feature lands next, and increasingly matter given graph databases' growing role in AI-application architecture through GraphRAG.
`,

  "cheat-sheet": `
~~~
-- ---- Nodes, relationships, properties ----
CREATE (ada:Person {name: "Ada", born: 1815})
CREATE (ada)-[:COLLABORATED_WITH {on: "Analytical Engine"}]->(charles:Person {name: "Charles"})

-- ---- Basic pattern matching ----
MATCH (p:Person {name: "Ada"}) RETURN p;
MATCH (p:Person)-[:COLLABORATED_WITH]->(other) WHERE p.name = "Ada" RETURN other;

-- ---- Multi-hop traversal ----
MATCH (p:Person {name: "Ada"})-[:COLLAB*1..3]->(connected) RETURN DISTINCT connected;

-- ---- Shortest path ----
MATCH path = shortestPath((a:Person {name: "Ada"})-[:KNOWS*]-(b:Person {name: "Turing"}))
RETURN path;

-- ---- Upsert (idempotent data loading) ----
MERGE (p:Person {name: "Ada"})
ON CREATE SET p.created_at = timestamp()
ON MATCH SET p.last_seen = timestamp();

-- ---- Indexes and constraints ----
CREATE INDEX person_name_index FOR (p:Person) ON (p.name);
CREATE CONSTRAINT unique_name FOR (p:Person) REQUIRE p.name IS UNIQUE;

-- ---- Diagnose a slow query ----
PROFILE MATCH (p:Person {name: "Ada"})-[:COLLABORATED_WITH]->(other) RETURN other;
-- Watch for NodeByLabelScan (bad, full scan) vs NodeIndexSeek (good, index used)

-- ---- Parameterized queries (ALWAYS, never string-concatenate) ----
-- session.run("MATCH (p:Person {name: $name}) RETURN p", name=user_input)

-- ---- Delete safely ----
MATCH (p:Person {name: "Ada"}) DETACH DELETE p;   -- removes node AND its relationships
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is index-free adjacency? | Each node stores direct pointers to its relationships — traversal is O(1) per hop. |
| Why does this beat a relational join at depth? | Join cost grows with table size; graph traversal cost grows only with the subgraph traversed. |
| Do you still need indexes in Neo4j? | Yes — for finding the STARTING node. Index-free adjacency only helps traversal FROM it. |
| CREATE vs MERGE? | CREATE always inserts (risks duplicates on rerun). MERGE finds-or-creates (idempotent). |
| What does DETACH DELETE do? | Deletes a node AND its relationships together in one operation. |
| Variable-length path syntax? | *1..3 — always bound it; unbounded can explode combinatorially on dense graphs. |
| What is Cypher injection? | String-concatenating user input into a query — the graph-DB analog of SQL injection. |
| PROFILE vs EXPLAIN? | EXPLAIN shows the planned strategy. PROFILE actually runs it with real stats. |
| When to promote a relationship to its own node? | When that concept needs independent querying or its own further relationships. |
| What is GraphRAG? | Combining graph traversal (multi-hop entity reasoning) with vector search for RAG. |
| Is Neo4j ACID-compliant? | Yes — full ACID, a genuine differentiator versus many NoSQL databases. |
| What provides Neo4j's HA and read scaling? | Causal Clustering — Raft consensus among core servers + read replicas. |
| GQL's significance? | ISO-standardized in 2023 — first new DB query language standard since SQL, Cypher-influenced. |
`,

  mcqs: `
1. What makes Neo4j's multi-hop traversal cost independent of total database size?
   A) Caching  B) Index-free adjacency — direct pointers from each node to its relationships  C) Sharding  D) Compression
   **Answer: B** — the defining architectural fact distinguishing graph traversal from relational joins.

2. Do you still need an index in Neo4j if index-free adjacency exists?
   A) Never  B) Yes, for finding the STARTING node by a property value  C) Only for relationships  D) Only in Enterprise Edition
   **Answer: B** — traversal FROM a node is fast; finding that node still needs a conventional index.

3. What is the correct way to run idempotent data-loading scripts in Cypher?
   A) CREATE  B) MERGE (find-or-create)  C) DELETE then CREATE  D) There is no safe way
   **Answer: B** — CREATE risks duplicates if the script runs more than once.

4. What risk does an unbounded variable-length path query (*1..) carry on a dense graph?
   A) None  B) Combinatorially explosive result sets or very slow execution  C) It automatically gets bounded to 3 hops  D) A syntax error
   **Answer: B** — always bound path length explicitly in production queries.

5. What is GraphRAG?
   A) A Neo4j-only feature  B) A pattern combining graph traversal with vector search for RAG retrieval  C) A replacement for Cypher  D) A caching layer
   **Answer: B** — addresses multi-hop reasoning that pure vector similarity search can't express.

6. Is Neo4j ACID-compliant?
   A) No, it trades this away like most NoSQL databases  B) Yes, full ACID transaction support  C) Only for single-node writes  D) Only in Community Edition
   **Answer: B** — a genuine differentiator versus many other NoSQL-family databases.
`,

  "revision-notes": `
Neo4j is a native graph database storing data as nodes (entities) and relationships (connections), both of which can carry arbitrary properties — the property graph model. Its defining architectural bet is index-free adjacency: each node physically stores direct pointers to its own relationships, making traversal from a node to its neighbors an O(1) pointer-following operation regardless of total database size, fundamentally different from a relational join whose cost grows with table size. This is precisely why multi-hop queries (fraud-ring detection, recommendation chains, "degrees of separation" questions) remain fast in Neo4j as the overall graph grows, while the equivalent relational query (requiring successive joins) gets progressively slower.

Cypher, Neo4j's declarative query language, expresses graph patterns visually — parentheses for nodes, arrows for relationships — making complex traversal queries read almost like a diagram of what's being searched for. Cypher's influence was substantial enough that GQL (Graph Query Language), standardized as ISO/IEC 39075 in 2023, became the first new database query language to achieve ISO standardization since SQL itself, a significant industry milestone for a vendor's own query language.

Only the STARTING node lookup in a Cypher query benefits from a conventional index — index-free adjacency accelerates traversal FROM an already-found node, not the initial search TO find it, meaning indexes and constraints on frequently-searched properties remain essential, just as in a relational database. The central schema-design decision in Neo4j is what should be a node versus a relationship versus a property: promote a concept to its own node when it needs independent querying or further relationships; keep it as a relationship property when it's purely descriptive of that one connection.

MERGE (find-or-create) is Cypher's essential tool for idempotent data loading, avoiding the duplicate nodes CREATE would produce if a load script runs more than once. Variable-length path queries (*1..3) and shortestPath() are first-class, efficient Cypher operations for multi-hop and path-finding questions that would require recursive CTEs or application-level graph-walking logic in a relational database — but unbounded variable-length queries on a densely connected graph risk combinatorially explosive result sets, so bounding path length explicitly is essential production discipline.

Neo4j maintains full ACID transaction compliance, a genuine differentiator versus many NoSQL-family databases that traded this guarantee away. Causal Clustering (using Raft consensus among core servers, plus independently-scalable read replicas) provides both high availability and read scaling, though genuinely horizontal write-scaling of a single large graph across many machines remains a harder, less mature problem industry-wide than for simpler data models. GraphRAG — combining graph traversal for structured, multi-hop entity reasoning with vector similarity search for semantic retrieval — has driven significant recent Neo4j adoption growth specifically in AI-application architectures, addressing retrieval questions that neither technique alone answers well.
`,

  "learning-roadmap": `
**Week 1 — Property graph fundamentals**: nodes, relationships, properties, and basic Cypher pattern matching. Milestone: model and query a small social network graph.

**Week 2 — Multi-hop queries and modeling decisions**: variable-length paths, shortestPath(), and the node-versus-relationship-versus-property design decision. Milestone: build a "friends of friends" recommendation query and justify at least two modeling decisions explicitly.

**Week 3 — Indexes, constraints, and MERGE**: creating appropriate indexes for starting-node lookups, uniqueness constraints, and idempotent data loading with MERGE. Milestone: write a data-loading script that's safely re-runnable without creating duplicates.

**Week 4 — Query optimization**: PROFILE-driven diagnosis of a slow query, bounding variable-length paths, and understanding index-free adjacency's precise performance implications. Milestone: fix a deliberately introduced missing-index scenario, documenting the before/after PROFILE output.

**Week 5 — Knowledge graphs and GraphRAG**: extracting entities/relationships from documents into a graph, and building multi-hop retrieval queries combining graph traversal with (conceptually) vector search. Milestone: complete Lab 3, building a small GraphRAG-style knowledge graph and retrieval query.

**Week 6 — Production practices**: Causal Clustering, security (parameterized queries, access control), monitoring, and the Graph Data Science library's algorithms. Milestone: complete the Lab 4 hands-on project end to end, satisfying the production checklist.

Next platform skill once this roadmap is complete: **Knowledge Graphs** and **RAG** for the deeper AI-application context, or **Vector Search** for the complementary GraphRAG technique.
`,

  "official-docs": `
- **neo4j.com/docs** — the official Neo4j documentation, comprehensive and the primary reference for Cypher syntax, configuration, and Causal Clustering setup.
- **neo4j.com/docs/cypher-manual** — the dedicated Cypher query language reference, essential depth beyond this page's overview.
- **neo4j.com/docs/graph-data-science** — the official Graph Data Science library documentation for PageRank, community detection, and other graph algorithms.
- **neo4j.com/labs/apoc** — the official APOC library documentation, the de facto standard extension for serious Neo4j deployments.
- **gql-standard.org** — the official GQL (ISO/IEC 39075) standard information, relevant for understanding Cypher's relationship to the broader industry standard.
`,

  books: `
- **"Graph Databases" (2nd ed.) — Ian Robinson, Jim Webber, and Emil Eifrem** — written partly by Neo4j's own co-founder, the definitive, widely recommended introduction to graph database concepts and Neo4j specifically.
- **"Learning Neo4j" — Rik Van Bruggen** — a practical, project-based introduction to Cypher and common graph modeling patterns.
- **"Graph Algorithms" — Mark Needham and Amy E. Hodler** — focused specifically on the Graph Data Science library's algorithms (PageRank, community detection, similarity) with practical Neo4j examples.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not Neo4j-specific, but essential foundational reading for the distributed-systems concepts underlying Causal Clustering's Raft-based consensus.
`,

  blogs: `
- **The official Neo4j blog (neo4j.com/blog)** — release announcements, GraphRAG-specific guidance, and deep technical posts directly from the Neo4j team.
- **The Neo4j Developer Blog and Neo4j Graph Data Science blog** — practical tutorials and algorithm deep-dives.
- **The International Consortium of Investigative Journalists' technical writeups** on the Panama Papers investigation's graph analysis methodology, directly relevant to this page's Case Studies section.
- **Emil Eifrem's (Neo4j's co-founder and CEO) talks and posts** on graph database design philosophy and GraphRAG's emergence.
`,

  "research-papers": `
- **Robinson, I., Webber, J., and Eifrem, E. — "Graph Databases"** (the book, referenced above, functions as close to a foundational primary-source text given co-authorship by Neo4j's own creator).
- **Angles, R. and Gutierrez, C. — "Survey of Graph Database Models"** (2008, ACM Computing Surveys) — a widely cited academic survey of the graph database model space, useful foundational context beyond Neo4j specifically.
- **The GQL (ISO/IEC 39075) standard documentation itself** — while a formal standard rather than a research paper, its development process and specification documents are the closest primary source for understanding Cypher's influence on graph query language standardization.
- For the Raft consensus algorithm underlying Causal Clustering, see **Ongaro, D. and Ousterhout, J. — "In Search of an Understandable Consensus Algorithm"** (2014), the same foundational paper referenced in the **Redis** and **MongoDB** skills for their own respective consensus mechanisms.
`,

  videos: `
- **NODES (Neo4j's annual developer conference) talks** (widely available on YouTube) — the primary conference for the Neo4j ecosystem, featuring deep talks from Neo4j engineers, GraphRAG practitioners, and large-scale production users.
- **Neo4j's official YouTube channel** — tutorial series covering Cypher fundamentals through Graph Data Science and GraphRAG-specific content.
- **"Neo4j and GraphRAG" conference talks** from recent NODES events — covering the pattern's rapid emergence and practical implementation guidance.
- **Emil Eifrem's keynote talks** on graph database design philosophy, offering direct insight from Neo4j's co-founder.
`,

  "github-repos": `
- **neo4j/neo4j** — the database's own source code, an advanced but genuinely rewarding read for understanding Cypher execution and storage internals directly.
- **neo4j/graph-data-science** — the official Graph Data Science library source, referenced throughout Advanced Concepts and Real Projects.
- **neo4j-contrib/neo4j-apoc-procedures** — the APOC library source, the de facto standard extension referenced throughout this page.
- **neo4j/neo4j-python-driver** (and equivalents for other languages) — the official language-specific driver repositories.
- **testcontainers/testcontainers-python** (neo4j module) — the testing tool referenced in this page's Testing section.
- **neo4j-graph-examples** (various official example repositories) — real, well-documented example datasets and queries covering common patterns like fraud detection and recommendations.
- **neo4j/NaLLM and related GraphRAG example repositories** — official and community examples specifically demonstrating GraphRAG patterns combining Neo4j with LLM frameworks.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Pattern matching fundamentals**: given a described social network, write Cypher queries for direct connections, mutual friends, and simple filtering.
2. **Multi-hop and shortest-path queries**: implement and test a "degrees of separation" query and a bounded variable-length recommendation query.
3. **Modeling decisions**: given a described domain (e.g., employment history, product purchases), design a graph schema justifying each node-versus-relationship-versus-property decision.
4. **Query optimization**: given a slow query and its PROFILE output showing a full label scan, diagnose and fix it with an appropriate index.
5. **Knowledge graphs**: extract entities and relationships from a small set of sample text documents into a graph, then write multi-hop retrieval queries over it.
6. **External practice sets**: Neo4j's own free GraphAcademy courses for structured, guided practice; the official Neo4j example datasets (movies, fraud detection, recommendations) for hands-on exploration with real, well-documented data.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    App["Application\n(parameterized Cypher queries)"] --> Driver["Neo4j Bolt driver"]
    Driver --> Core1["Core server 1\n(Raft leader)"]
    Driver --> Core2["Core server 2"]
    Driver --> Core3["Core server 3"]
    Core1 -->|Raft replication| ReadReplica1["Read replica 1"]
    Core1 -->|Raft replication| ReadReplicaN["Read replica N"]
    subgraph GraphRAG["GraphRAG architecture"]
        VectorStore["Vector store\n(semantic retrieval)"]
        KnowledgeGraph["Neo4j knowledge graph\n(multi-hop entity reasoning)"]
        LLM["LLM"]
    end
    VectorStore --> LLM
    KnowledgeGraph --> LLM
    subgraph Extensions
        APOC["APOC library"]
        GDS["Graph Data Science\n(PageRank, community detection)"]
    end
    Core1 -.-> Extensions
    subgraph Observability
        Browser["Neo4j Browser / Bloom"]
        Prometheus["Prometheus + Grafana"]
    end
    Core1 -.-> Observability
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Neo4j))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Property Graph Model
      Nodes
      Relationships
      Properties
      Labels
    Cypher
      Pattern matching
      Multi-hop traversal
      Shortest path
      MERGE upsert
    Internals
      Index-free adjacency
      Starting node indexes
      PROFILE and EXPLAIN
    Advanced Features
      Graph Data Science
      APOC library
      Causal Clustering
    AI Applications
      Knowledge graphs
      GraphRAG
      Combining with vector search
    Production
      Security and Cypher injection
      Monitoring
      Backup and HA
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default neo4j;
