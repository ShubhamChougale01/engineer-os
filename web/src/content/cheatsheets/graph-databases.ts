import type { CheatSheetData } from "./types";

const graphDatabases: CheatSheetData = {
  title: "The Ultimate Graph Databases Cheat Sheet",
  subtitle: "Property graph vs RDF - native vs layered storage - Cypher, Gremlin, SPARQL - the when-to-use decision",
  sections: [
    {
      title: "Data Models",
      color: "violet",
      rows: [
        { term: "Property graph", desc: "Nodes (labeled, with properties) plus typed, directed relationships that can also carry properties", code: "(a:Person {name:'Ada'})-[:KNOWS {since:1833}]->(b:Person)" },
        { term: "RDF triple store", desc: "Everything, including simple attributes, is a subject-predicate-object statement", code: "<ada> <knows> <charles> .\n<ada> <name> 'Ada Lovelace' ." },
        { term: "Node vs edge vs property decision", desc: "Promote to a node only if it needs independent identity or its own edges", code: "// simple: (p)-[:WORKED_AT {from:2020}]->(c)\n// complex: (p)-[:HAS_EMPLOYMENT]->(e)-[:AT]->(c)" },
        { term: "Multiple labels", desc: "One node can belong to more than one category at once", code: "CREATE (p:Person:Author {name:'Ada'})" },
      ],
    },
    {
      title: "Query Languages",
      color: "blue",
      rows: [
        { term: "Cypher (pattern matching)", desc: "Reads like a diagram of the shape being searched for", code: "MATCH (p:Person {name:'Ada'})-[:KNOWS]->(x)\nRETURN x;" },
        { term: "Gremlin (traversal steps)", desc: "Chained, imperative style; portable across many vendor backends", code: "g.V().has('person','name','Ada').out('knows')" },
        { term: "SPARQL (RDF patterns)", desc: "Variables (prefixed ?) bind to matching triple parts", code: "SELECT ?name WHERE {\n  ?p a Person . ?p name ?name . }" },
        { term: "GQL", desc: "ISO/IEC 39075 (2023) - the new international standard, Cypher-influenced", code: "// First new ISO-standardized DB query language since SQL" },
      ],
    },
    {
      title: "Multi-Hop Traversal (Cypher)",
      color: "emerald",
      rows: [
        { term: "2-hop friend-of-a-friend", desc: "Chained relationship patterns express multi-hop directly", code: "MATCH (a {name:'Ada'})-[:KNOWS]->()-[:KNOWS]->(fof)\nRETURN DISTINCT fof;" },
        { term: "Bounded variable-length path", desc: "ALWAYS bound it - unbounded risks combinatorial blowup", code: "MATCH (a)-[:KNOWS*1..3]->(reachable)\nRETURN DISTINCT reachable;" },
        { term: "Shortest path", desc: "A first-class, optimized operation, not app-level recursion", code: "MATCH p = shortestPath((a)-[:KNOWS*..5]-(b))\nRETURN p, length(p);" },
        { term: "Filter before expanding", desc: "Narrow by relationship type/property before the next hop", code: "MATCH (a)-[:KNOWS]->(x) WHERE x.active = true\nMATCH (x)-[:KNOWS]->(y) RETURN y;" },
      ],
    },
    {
      title: "Storage Engine and Indexing",
      color: "amber",
      rows: [
        { term: "Native storage", desc: "Adjacency built into the physical file format - hop = pointer dereference", code: "// e.g. Neo4j, Memgraph - see the Neo4j skill" },
        { term: "Layered storage", desc: "Graph API over another engine (relational/document/wide-column)", code: "// hop = an indexed lookup against an edges table - benchmark, don't assume" },
        { term: "Index-free adjacency speeds up", desc: "Traversal FROM an already-found node", code: "// does NOT speed up finding the starting node" },
        { term: "Property index still required", desc: "For the initial starting-node lookup by attribute value", code: "CREATE INDEX person_name FOR (p:Person) ON (p.name);" },
        { term: "Diagnose a slow query", desc: "Check for a full label/table scan vs an index seek at the start", code: "PROFILE MATCH (p {name:'Ada'})-[:KNOWS]->(x) RETURN x;" },
      ],
    },
    {
      title: "Supernodes and Pitfalls",
      color: "rose",
      rows: [
        { term: "Supernode", desc: "Extremely high-degree node; one hop through it can enumerate millions of edges", code: "// celebrity account, popular product, hub node" },
        { term: "Detect a supernode", desc: "Periodic degree check, not a request-path query", code: "MATCH (n:Person) WITH n, size((n)--()) AS deg\nWHERE deg > 10000 RETURN n.name, deg;" },
        { term: "Mitigate a supernode", desc: "Bound hops, filter early, or split edges via bucket nodes", code: "// (hub)-[:HAS_BUCKET]->(bucket)-[:CONTAINS]->(member)" },
        { term: "Using a graph DB for tabular data", desc: "The classic overkill mistake - simple filters/aggregates belong in SQL", code: "// 'SUM(orders.total) WHERE date > X' needs no traversal at all" },
        { term: "Graph-query injection", desc: "String-concatenated input is the Cypher/Gremlin/SPARQL analog of SQL injection", code: "// ALWAYS parameterize: run(query, name=user_input)" },
      ],
    },
    {
      title: "When To Use / Scaling / Production",
      color: "cyan",
      rows: [
        { term: "Use a graph DB when...", desc: "Queries are genuinely multi-hop and connection-shaped", code: "// fraud rings, recommendation, dependency graphs, GraphRAG" },
        { term: "Skip a graph DB when...", desc: "Workload is dominated by simple filters/aggregates over flat data", code: "// PostgreSQL / a columnar store is simpler and just as fast" },
        { term: "Read scaling / HA", desc: "Mature across the category via replication/consensus clustering", code: "// core nodes (writes) + independently-scalable read replicas" },
        { term: "Write scaling (sharding)", desc: "Genuinely hard - no universal partitioning strategy for arbitrary graphs", code: "// unlike relational sharding by a natural key" },
        { term: "GraphRAG pattern", desc: "Graph traversal (multi-hop) combined with vector search (semantic)", code: "// vector store -> initial retrieval\n// graph DB -> multi-hop reasoning over entities" },
      ],
    },
  ],
};

export default graphDatabases;
