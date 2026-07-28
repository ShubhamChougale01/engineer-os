import type { CheatSheetData } from "./types";

const knowledgeGraphs: CheatSheetData = {
  title: "The Ultimate Knowledge Graphs Cheat Sheet",
  subtitle: "Triples and property graphs · LLM extraction · GraphRAG · production maintenance",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Triple", desc: "The atomic fact unit of every knowledge graph", code: "Subject -- predicate --> Object\nAda Lovelace -- collaborated_with --> Charles Babbage" },
        { term: "Property graph (Neo4j)", desc: "Nodes AND relationships can carry arbitrary properties", code: "(ada:Person)-[:COLLABORATED_WITH {on:'Engine'}]->(charles:Person)" },
        { term: "RDF triple store", desc: "Everything, including properties, expressed as triples", code: "<ada> <collaboratedWith> <charles> .\n<ada> <name> \"Ada Lovelace\" ." },
        { term: "Query language: Cypher", desc: "Property graphs -- visually resembles the pattern searched", code: "MATCH (p:Person {name:'Ada'})-[:COLLAB]->(o) RETURN o;" },
        { term: "Query language: SPARQL", desc: "RDF triple stores -- SQL-like SELECT/WHERE structure", code: "SELECT ?o WHERE { ?p :name 'Ada' . ?p :collab ?o . }" },
        { term: "OWL ontology", desc: "Formal classes/constraints enabling logical inference", code: "Employee subClassOf Person\n=> ada is inferred to be a Person" },
      ],
    },
    {
      title: "Building a Graph from Text (LLM Extraction)",
      color: "blue",
      rows: [
        { term: "Extraction pipeline order", desc: "Chunk -> extract -> resolve -> load -> track provenance", code: "docs -> chunks -> LLM extraction -> entity resolution -> MERGE load" },
        { term: "Constrain the predicate vocabulary", desc: "Prevents the same fact fragmenting into many predicate strings", code: "\"Use ONLY these predicates: works_for, founded, acquired...\"" },
        { term: "Entity resolution", desc: "Canonicalize name variants to one node -- the hardest step", code: "resolve_entity('Apple', ['Apple Inc.'], embed_fn, threshold=0.85)" },
        { term: "Idempotent loading", desc: "MERGE, never CREATE, for any rerunnable ingestion job", code: "MERGE (s:Entity {name:$subject})\nMERGE (s)-[:RELATION {predicate:$p}]->(o)" },
        { term: "Confidence scoring", desc: "Route low-confidence extractions to a human review queue", code: "if triple.confidence < 0.8: review_queue.add(triple)" },
        { term: "Provenance tracking", desc: "Link every triple back to its source doc for auditing", code: "triple.source_doc_id, triple.extraction_confidence" },
      ],
    },
    {
      title: "GraphRAG",
      color: "emerald",
      rows: [
        { term: "The pattern", desc: "Graph traversal (relational) + vector search (semantic)", code: "entity linking -> bounded traversal -> fuse with vector results -> LLM" },
        { term: "Entity linking", desc: "Map free-text query to graph node ids -- itself imperfect", code: "\"Acme\" (query) must resolve to \"Acme Corporation\" (node)" },
        { term: "Bounded multi-hop retrieval", desc: "ALWAYS cap hop count -- same risk as any graph traversal", code: "MATCH (s)-[:RELATION*1..2]-(c) RETURN DISTINCT c LIMIT 50" },
        { term: "Local vs global queries", desc: "Entity-specific traversal vs. pre-computed community summaries", code: "local -> direct traversal\nglobal -> Louvain communities + LLM summaries" },
        { term: "Fusion / re-ranking", desc: "Combine traversed subgraph facts with vector chunks before generation", code: "context = fuse(graph_facts, vector_chunks)[:budget]" },
      ],
    },
    {
      title: "Knowledge Graph vs Vector Search",
      color: "amber",
      rows: [
        { term: "Graph strength", desc: "Explicit, multi-hop, explainable relational reasoning", code: "\"suppliers of suppliers flagged in a compliance report\"" },
        { term: "Vector strength", desc: "Semantic similarity, no schema required", code: "\"documents about topics similar to this question\"" },
        { term: "When to combine", desc: "Multi-hop questions layered on an unstructured corpus", code: "GraphRAG = vector search (find) + graph traversal (expand)" },
        { term: "When NOT to add a graph", desc: "Purely semantic/topical queries -- plain RAG is simpler", code: "// evaluate on YOUR query patterns, do not assume graph always helps" },
      ],
    },
    {
      title: "Pitfalls (Memorize These)",
      color: "rose",
      rows: [
        { term: "Schema drift", desc: "Unconstrained vocabulary -> same fact, many predicate strings", code: "works_for vs employed_by vs is_staff_at -- pick ONE, re-supply it" },
        { term: "Skipped entity resolution", desc: "Fragments the graph -- queries silently return incomplete results", code: "\"Apple Inc.\", \"Apple\", \"AAPL\" left as 3 disconnected nodes" },
        { term: "Extraction error propagation", desc: "One wrong entity/relation corrupts every downstream query", code: "// score confidence; do not trust every triple equally" },
        { term: "Unbounded traversal", desc: "Combinatorial blowup on a densely connected graph", code: "// WRONG: MATCH (a)-[:REL*1..]-(b)  -- no upper bound" },
        { term: "Treating GraphRAG as a strict upgrade", desc: "Its advantage is narrow: multi-hop, relationship-centric questions only", code: "// evaluate GraphRAG vs plain RAG per question type, not universally" },
        { term: "Graph as a one-time build", desc: "It is a living artifact -- source data changes over time", code: "// incremental ingestion + periodic drift/duplicate audits required" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Parameterize every query", desc: "Cypher/SPARQL injection risk -- never string-concatenate input", code: "session.run(\"MATCH (e {name:$n}) RETURN e\", n=user_input)" },
        { term: "Incremental ingestion", desc: "Process new/changed docs only, not a full re-extraction each run", code: "if doc.hash != last_seen_hash[doc.id]: extract(doc)" },
        { term: "Drift audit", desc: "Periodically list distinct predicates vs the intended vocabulary", code: "MATCH ()-[r:RELATION]->() RETURN DISTINCT r.predicate" },
        { term: "Access control at traversal level", desc: "A graph can aggregate scattered facts into a new sensitivity risk", code: "// enforce permission filters on every traversal, not just source docs" },
        { term: "Evaluation harness", desc: "Compare GraphRAG vs plain vector RAG on a labeled question set", code: "eval(graphrag_answers, vector_only_answers, labeled_questions)" },
        { term: "Related skills", desc: "Neo4j (storage), Ontology (formal schema), RAG / Vector Search / Embeddings (retrieval)", code: "Graph Databases -> Neo4j -> Knowledge Graphs -> RAG + Vector Search" },
      ],
    },
  ],
};

export default knowledgeGraphs;
