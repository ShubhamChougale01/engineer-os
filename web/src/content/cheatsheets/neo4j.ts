import type { CheatSheetData } from "./types";

const neo4j: CheatSheetData = {
  title: "The Ultimate Neo4j Cheat Sheet",
  subtitle: "Property graph model · Cypher pattern matching · GraphRAG · production toolbelt",
  sections: [
    {
      title: "Property Graph Basics",
      color: "violet",
      rows: [
        { term: "Create nodes & a relationship", desc: "Both nodes AND relationships can carry properties", code: "CREATE (a:Person {name: 'Ada'})\nCREATE (a)-[:COLLABORATED_WITH {on: 'Engine'}]->(b:Person {name: 'Charles'})" },
        { term: "Basic pattern match", desc: "Query syntax visually resembles the graph shape", code: "MATCH (p:Person {name: 'Ada'})-[:COLLABORATED_WITH]->(other)\nRETURN other;" },
        { term: "Multiple labels", desc: "One node can belong to more than one category", code: "CREATE (p:Person:Author {name: 'Ada'})" },
        { term: "Update / delete", desc: "DETACH DELETE removes a node AND its relationships", code: "SET p.notable_for = '...'\nMATCH (p) DETACH DELETE p;" },
      ],
    },
    {
      title: "Multi-Hop & Path Queries",
      color: "blue",
      rows: [
        { term: "Variable-length path", desc: "ALWAYS bound it — unbounded risks combinatorial blowup", code: "MATCH (p)-[:COLLAB*1..3]->(connected) RETURN DISTINCT connected;" },
        { term: "Shortest path", desc: "A first-class, optimized Cypher operation", code: "MATCH path = shortestPath((a)-[:KNOWS*]-(b)) RETURN path;" },
        { term: "Undirected pattern", desc: "Matches a relationship regardless of stored direction", code: "MATCH (a)-[:KNOWS]-(b) RETURN b;" },
        { term: "Idempotent upsert", desc: "MERGE finds-or-creates — use for any rerunnable load script", code: "MERGE (p:Person {name: 'Ada'})\nON CREATE SET p.created_at = timestamp();" },
      ],
    },
    {
      title: "The Key Architectural Fact",
      color: "emerald",
      rows: [
        { term: "Index-free adjacency", desc: "Direct pointers node-to-relationship — O(1) per hop", code: "// Traversal cost = size of subgraph traversed, NOT total DB size" },
        { term: "But the START node still needs an index", desc: "Adjacency speeds traversal FROM a node, not finding it", code: "CREATE INDEX person_name_idx FOR (p:Person) ON (p.name);" },
        { term: "Diagnose a slow query", desc: "Watch for NodeByLabelScan (bad) vs NodeIndexSeek (good)", code: "PROFILE MATCH (p:Person {name:'Ada'})-[:COLLAB]->(o) RETURN o;" },
      ],
    },
    {
      title: "Schema Design",
      color: "amber",
      rows: [
        { term: "Relationship property (usual case)", desc: "Purely descriptive of one connection — keep it simple", code: "(p)-[:WORKED_AT {from: 2020, role: 'Eng'}]->(c)" },
        { term: "Promote to a node when...", desc: "The concept needs independent querying or its own edges", code: "(p)-[:HAS_EMPLOYMENT]->(e:Employment)-[:AT]->(c)\n(e)-[:WORKED_ON]->(project)" },
        { term: "Uniqueness constraint", desc: "Database-enforced, prevents accidental duplicates", code: "CREATE CONSTRAINT unique_name FOR (p:Person) REQUIRE p.name IS UNIQUE;" },
      ],
    },
    {
      title: "GraphRAG & AI Use Cases",
      color: "rose",
      rows: [
        { term: "GraphRAG pattern", desc: "Graph traversal (multi-hop) + vector search (semantic)", code: "// Vector store -> initial retrieval\n// Neo4j -> multi-hop reasoning over entity relationships" },
        { term: "Multi-hop entity retrieval", desc: "Documents mentioning entities within N hops of a topic", code: "MATCH (e:Entity {name: $q})-[:RELATED_TO*1..2]-(r)\nMATCH (d:Document)-[:MENTIONS]->(r)\nRETURN DISTINCT d.title;" },
        { term: "Graph Data Science algorithms", desc: "PageRank, community detection — built in, no export needed", code: "CALL gds.pageRank.stream('myGraph') YIELD nodeId, score" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "ALWAYS parameterize queries", desc: "Cypher injection is the graph-DB analog of SQL injection", code: "// session.run('MATCH (p {name:$name})...', name=user_input)" },
        { term: "Causal Clustering", desc: "Raft-based HA + read replicas (Enterprise/Aura only)", code: "// Core servers (writes) + independently-scalable read replicas" },
        { term: "ACID transactions", desc: "A genuine differentiator vs many NoSQL databases", code: "// Full ACID compliance, unlike many document/wide-column stores" },
        { term: "APOC library", desc: "The de facto standard extension — hundreds of utilities", code: "CALL apoc.help('text')" },
      ],
    },
  ],
};

export default neo4j;
