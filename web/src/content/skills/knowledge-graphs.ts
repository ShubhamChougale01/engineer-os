import type { SkillContent } from "../types";

/**
 * Knowledge Graphs — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const knowledgeGraphs: SkillContent = {
  overview: `
A knowledge graph represents information as a network of entities (people, organizations, products, concepts — the nodes) connected by relationships (the edges) that describe how those entities relate to one another, with both nodes and edges optionally carrying properties (attributes) that add further detail. The atomic unit underneath most knowledge graphs is the triple — subject, predicate, object — for example "Ada Lovelace" — "collaborated with" — "Charles Babbage." Stringing many triples together produces a queryable web of facts that can be traversed, searched, and reasoned over in ways a flat document or a table simply cannot support directly.

For an AI engineer, knowledge graphs matter because they give an LLM-based system an explicit, structured representation of relationships that would otherwise be buried, implicitly and unreliably, inside prose. This is the foundation of GraphRAG — an increasingly common pattern that combines a knowledge graph with retrieval-augmented generation so that a system can answer multi-hop questions ("which suppliers of Company A were also involved in the recall affecting Company B") that pure vector similarity search over document chunks struggles to answer, because vector search finds text that is semantically similar to a query, not text that is relationally connected to it in a specific, traceable way.

Key characteristics of a knowledge graph: an explicit schema (or ontology) describing what kinds of entities and relationships are allowed to exist, which brings a degree of consistency and queryability that unstructured text cannot offer; a query language purpose-built for graph pattern matching (Cypher for property graphs, SPARQL for RDF triple stores) rather than SQL's relational-join model; the ability to perform multi-hop traversal and path-finding as first-class, efficient operations; and, critically for an AI engineer, the practical reality that building a good knowledge graph from unstructured text using LLM-based extraction is an imperfect, actively evolving process — entity resolution, relation extraction, and schema consistency are all genuinely hard problems, and a knowledge graph built this way inherits and can compound whatever extraction errors slip through. This page treats the Graph Databases and Neo4j skills as the storage/query layer underneath a knowledge graph, and treats RAG, Vector Search, and Embeddings as the sibling retrieval techniques a knowledge graph is most often combined with or contrasted against.
`,

  history: `
The idea of representing knowledge as a network of connected facts predates modern computing by decades, but the term and practice most AI engineers mean by "knowledge graph" today has a fairly traceable lineage.

| Year | Milestone |
|------|-----------|
| 1960s | Early semantic networks emerge in AI research (Quillian and others) — graphs of concepts and associative links used to model human memory and reasoning, the direct conceptual ancestor of today's knowledge graphs |
| 1980s–1990s | Expert systems and frame-based knowledge representation formalize much of the entity/relationship/property thinking later inherited by knowledge graphs, alongside early description logics that would eventually underpin OWL |
| 1999–2001 | The World Wide Web Consortium begins work on the **Resource Description Framework (RDF)**, a standard for expressing data as subject-predicate-object triples, and the broader **Semantic Web** vision (championed by Tim Berners-Lee) of making web data machine-readable and linkable |
| 2001 | **SPARQL** is developed as a query language for RDF data, later standardized by the W3C in 2008 |
| 2004–2008 | **OWL (Web Ontology Language)** is standardized, giving the Semantic Web community a formal way to define ontologies — classes, properties, and logical constraints over RDF data |
| 2007 | **DBpedia** launches, extracting structured triples from Wikipedia infoboxes at scale, becoming one of the most widely used public knowledge graphs and a common entity-linking target |
| 2012 | **Google popularizes the term "Knowledge Graph"** with the launch of the Google Knowledge Graph, powering the info panels that appear beside search results — this is the moment the term enters mainstream industry vocabulary, even though the underlying ideas long predate it |
| 2010s | Property graph databases (Neo4j prominent among them) and the Cypher query language mature as a popular, more developer-ergonomic alternative to RDF/SPARQL for many applications, especially outside pure Semantic Web contexts |
| 2018–2020 | Large-scale industrial knowledge graphs (Amazon's product graph, Facebook's social/entity graph, Microsoft's Bing/Satori graph) become widely discussed case studies of knowledge graphs used for search, recommendation, and question answering at scale |
| 2022–2024 | The **GraphRAG** pattern emerges and rapidly gains attention, driven by Microsoft Research's published GraphRAG approach and a broader wave of practitioners combining LLM-based entity/relation extraction with graph databases to improve multi-hop reasoning in RAG systems |
| 2023–2025 | Rapid growth in LLM-assisted knowledge graph construction tooling (LLM-driven entity extraction pipelines, graph-augmented RAG frameworks) as teams look for ways to give LLM applications more reliable, structured relational context; this remains an active, imperfect area of practice rather than a solved problem |

Two genuinely distinct technical lineages converge under the "knowledge graph" umbrella: the W3C Semantic Web lineage (RDF, triples, SPARQL, OWL ontologies, formal logical reasoning) and the property-graph-database lineage (Neo4j-style nodes/relationships/properties, Cypher). Both represent entities and relationships, but they differ meaningfully in data model, tooling, and typical use case — covered in depth in Beginner and Intermediate Concepts below.
`,

  "why-it-exists": `
Knowledge graphs exist because two very different kinds of storage — relational tables and unstructured documents — both make a specific class of question expensive or unreliable to answer: **"how are these things connected, and what does the shape of that connection tell me?"**

Before knowledge graphs (and their academic predecessors, semantic networks), an AI engineer or data engineer had two imperfect options for representing entities and relationships:

1. **Relational tables with foreign keys**: expressible, but multi-hop relationship questions ("suppliers of suppliers of this company that were also involved in litigation with a third company") require chains of joins whose cost grows with table size and whose expression in SQL becomes unwieldy past a few hops — see the Graph Databases and Neo4j skills for why index-free adjacency in a graph database solves this specific cost problem.
2. **Unstructured text plus keyword or vector search**: flexible and requires no schema, but has no explicit notion of "this specific entity is related to that specific entity in this specific way" — semantic similarity search can find text that TALKS ABOUT related entities, but cannot reliably answer a precise relational question like "who are ALL the people who reported to this specific manager between 2019 and 2021," because that fact may never appear together in one retrievable chunk, or may be scattered across many chunks in a form vector similarity alone cannot reliably reconstruct.

Knowledge graphs fill this gap by making relationships themselves first-class, queryable, explicit data — not something to be re-derived at query time via joins, and not something merely implied by semantic proximity in embedding space. For an AI engineer working on RAG systems specifically, this is why GraphRAG has become a genuinely useful pattern for a narrow but important class of question: multi-hop reasoning over entities whose relationships matter more than their semantic similarity to the query text.
`,

  "problem-it-solves": `
Knowledge graphs solve the **"facts about how entities relate to each other are scattered across documents, tables, and systems, in a form that is hard to query precisely and hard for an LLM to retrieve reliably for multi-hop questions"** problem.

Concretely, a knowledge graph provides:

- **Explicit, queryable relationships**: "X reports to Y," "X supplies Y," "X was acquired by Y" become first-class edges you can traverse, filter, and aggregate over, rather than facts implicitly buried in prose that must be re-extracted or re-inferred every time they're needed.
- **Multi-hop reasoning as a native operation**: "find all companies within two hops of this supply-chain node that were also flagged in a compliance report" is a graph traversal query, not a chain of brittle re-retrievals or an LLM guessing at a chain of facts it may only have seen in separate contexts.
- **A structural complement to semantic search**: where vector search finds text that is topically or semantically similar to a query, a knowledge graph finds text/entities that are RELATIONALLY connected to a starting point in a specific, traceable, explainable way — this is the essence of the GraphRAG pattern, combining both retrieval strategies.
- **Deduplication and canonicalization of entities**: a well-built knowledge graph resolves "Apple Inc.," "Apple," and "AAPL" to one canonical entity node, something raw unstructured text or independent document chunks do not do for you.
- **Explainability**: a graph traversal path IS an explanation — "here is the exact chain of relationships that produced this answer" — which is often more auditable than an LLM's free-text justification for why two pieces of retrieved text seemed relevant.

What knowledge graphs deliberately do **not** solve, or solve poorly: they are not a good fit for capturing nuanced, context-dependent meaning best expressed in free text (a paragraph explaining WHY a decision was made rarely compresses well into triples without real information loss); building one from unstructured text with LLM-based extraction is genuinely imperfect — extraction errors, missed relationships, and inconsistent entity naming are common and compound over a large corpus; and maintaining a knowledge graph's accuracy as underlying facts change over time is an ongoing operational burden, not a one-time build. Be skeptical of any vendor or blog post claiming near-perfect, fully automated knowledge graph construction from arbitrary text — as of this writing, this remains an active research and engineering problem, not a solved one.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the entity-relationship-property model underlying a knowledge graph, and distinguish the RDF/triple-store lineage from the property-graph lineage.
2. Write basic Cypher and SPARQL queries against a knowledge graph, including multi-hop pattern matching.
3. Design and run an LLM-based pipeline that extracts entities and relationships from unstructured text into a graph, and explain where such pipelines commonly fail.
4. Explain the GraphRAG pattern: how it combines graph traversal with retrieval-augmented generation, and when it outperforms pure vector search for multi-hop questions.
5. Reason clearly about knowledge graph versus vector search tradeoffs, and when a production system should combine both.
6. Identify and mitigate the common pitfalls of LLM-built knowledge graphs: extraction error propagation, schema drift, and entity resolution failures.
7. Describe the operational lifecycle of maintaining a knowledge graph over time as source data changes.
8. Answer senior-level interview questions on ontology design, query language choice (Cypher vs. SPARQL), and the honest limitations of GraphRAG.
`,

  prerequisites: `
- **Required**: general programming fundamentals and basic familiarity with how LLMs process and generate text (prompting, structured output).
- **Very helpful**: the **Graph Databases** skill and the **Neo4j** skill — a knowledge graph almost always lives on top of a graph database (or, less commonly today, a triple store), and understanding index-free adjacency and Cypher directly informs how you design and query a knowledge graph.
- **Very helpful**: the **RAG** skill (rag-fundamentals) — GraphRAG is best understood as an extension/variant of standard RAG, not a wholly separate technique.
- **Helpful**: the **Vector Search** and **Embeddings** skills — knowledge graphs are most often discussed in direct contrast and combination with vector-similarity retrieval, and this page assumes you can compare the two.
- **Helpful**: the **Ontology** skill for a deeper treatment of formal schema design (classes, properties, logical constraints) than this page covers in full.

Dependency links: general programming and LLM basics → **Graph Databases** / **Neo4j** for the storage and query layer → **Embeddings** / **Vector Search** for the retrieval technique knowledge graphs are contrasted against → **RAG** for the overall retrieval-augmented generation context → this page → **Ontology** for deeper formal schema design.
`,

  "beginner-concepts": `
### Entities, relationships, and triples

~~~
Subject          Predicate          Object
Ada Lovelace  --  collaborated_with -->  Charles Babbage
Ada Lovelace  --  born_in           -->  London
Ada Lovelace  --  wrote             -->  Notes on the Analytical Engine
~~~

Every fact in a knowledge graph can be expressed as a triple: subject, predicate, object. The subject and object are entities (nodes); the predicate is the relationship (edge) connecting them. This is the same underlying idea whether you are using an RDF triple store or a property graph database like Neo4j — the difference is mostly in tooling, query language, and how much extra structure (properties on nodes and edges, formal ontologies) sits on top of the base triple.

### Property graphs vs. RDF triple stores

~~~
Property graph (Neo4j-style):
(ada:Person {name: "Ada Lovelace", born: 1815})
    -[:COLLABORATED_WITH {on: "Analytical Engine"}]->
(charles:Person {name: "Charles Babbage"})

RDF triple store (SPARQL-style):
<http://example.org/ada> <http://example.org/collaboratedWith> <http://example.org/charles> .
<http://example.org/ada> <http://example.org/name> "Ada Lovelace" .
~~~

A property graph lets both nodes AND relationships carry arbitrary key-value properties directly (the collaboration itself can note "on: Analytical Engine"). A pure RDF triple store represents everything, including properties, as additional triples — more uniform and more amenable to formal logical reasoning via OWL ontologies, but often more verbose and less immediately intuitive to query for developers used to property graphs. Neo4j and Cypher are the most common property-graph tooling on this platform; SPARQL is the standard query language for RDF triple stores. Most production AI-engineering knowledge graph work today leans toward the property graph model for its developer ergonomics, but understanding RDF/SPARQL matters for interoperability with public knowledge graphs like DBpedia or Wikidata, and for domains (life sciences, government linked data) where RDF remains the norm.

### A basic Cypher query against a knowledge graph

~~~
MATCH (p:Person {name: "Ada Lovelace"})-[:COLLABORATED_WITH]->(other:Person)
RETURN other.name;
~~~

This finds every person Ada Lovelace collaborated with — a single-hop traversal. See the **Neo4j** skill for a full treatment of Cypher's pattern-matching syntax; this page focuses on knowledge-graph-specific concerns (extraction, schema design, GraphRAG) rather than re-deriving Cypher basics.

### A basic SPARQL query against the same fact

~~~
SELECT ?other WHERE {
  ?ada foaf:name "Ada Lovelace" .
  ?ada :collaboratedWith ?other .
}
~~~

SPARQL's SELECT/WHERE structure resembles SQL more than Cypher's pattern-matching syntax does, but it is still fundamentally matching a graph pattern (here, triples matching the given subject-predicate-object shape) rather than performing relational joins.

### Extracting your first triple from text with an LLM

~~~
Prompt: "Extract all (subject, predicate, object) triples from this sentence:
Ada Lovelace collaborated with Charles Babbage on the Analytical Engine."

LLM output (structured JSON):
[
  {"subject": "Ada Lovelace", "predicate": "collaborated_with", "object": "Charles Babbage"},
  {"subject": "Ada Lovelace", "predicate": "worked_on", "object": "Analytical Engine"},
  {"subject": "Charles Babbage", "predicate": "worked_on", "object": "Analytical Engine"}
]
~~~

This is the core loop of LLM-based knowledge graph construction: prompt an LLM to identify entities and the relationships between them in a structured, parseable format, then load those triples into a graph database. It looks simple on one clean sentence — the real difficulty, covered fully in Intermediate and Advanced Concepts, is doing this reliably across a large, messy, real-world corpus.

### Common beginner trap

Treating every noun in a sentence as an entity worth its own node. Not every noun deserves to be a graph node — "the meeting," "yesterday," or a passing adjective rarely warrant first-class entity status unless they are genuinely queried or connected elsewhere in your schema. This mirrors the same node-versus-property judgment call covered in the **Neo4j** skill's Intermediate Concepts.
`,

  "intermediate-concepts": `
### LLM-based entity and relation extraction, end to end

~~~python
import json

EXTRACTION_PROMPT = """
Extract entities and relationships from the text below as JSON.
Entities must have a "name" and a "type" (Person, Organization, Product, Location, Event).
Relationships must have "subject", "predicate", and "object", where subject and object
refer to entity names already extracted. Use a small, consistent set of predicate names
(e.g. works_for, acquired, located_in, founded) -- do not invent a new predicate for
every sentence.

Text:
\"\"\"{text}\"\"\"

Return JSON: {{"entities": [...], "relationships": [...]}}
"""

def extract_graph_from_text(llm_client, text):
    prompt = EXTRACTION_PROMPT.format(text=text)
    response = llm_client.complete(prompt, response_format="json")
    try:
        data = json.loads(response)
    except json.JSONDecodeError:
        # Malformed LLM output is common enough to require explicit handling,
        # not an edge case to ignore -- log and skip rather than crash a batch job.
        return {"entities": [], "relationships": []}
    return data
~~~

The prompt above deliberately constrains the predicate vocabulary ("use a small, consistent set of predicate names") — a critical, easy-to-overlook detail. Left unconstrained, an LLM will happily invent a slightly different predicate for nearly every sentence ("was employed by" vs. "works for" vs. "is staff at"), fragmenting what should be one queryable relationship type into dozens of near-duplicates that make the resulting graph far harder to query consistently. This is one of the most common practical failure modes of LLM-built knowledge graphs, discussed further in Advanced Concepts and Anti-Patterns.

### Entity resolution and canonicalization

~~~python
# Naive extraction from two different documents produces two different
# names for what is really the same entity:
doc1_entities = ["Apple Inc.", "Tim Cook"]
doc2_entities = ["Apple", "Timothy Cook"]

# Entity resolution must decide these refer to the same underlying node,
# typically via a combination of exact/fuzzy string matching, embedding
# similarity (see the Embeddings skill), and sometimes an LLM-based
# "are these the same entity" judgment call for ambiguous cases.
def resolve_entity(name, existing_entities, embedding_fn, threshold=0.85):
    name_embedding = embedding_fn(name)
    for existing in existing_entities:
        similarity = cosine_similarity(name_embedding, embedding_fn(existing))
        if similarity > threshold:
            return existing  # treat as the same canonical entity
    return name  # a genuinely new entity
~~~

Entity resolution (also called entity linking or canonicalization) is arguably the single hardest practical problem in building a knowledge graph from unstructured text: without it, "Apple Inc." and "Apple" become two disconnected nodes, silently fragmenting the graph and undermining exactly the multi-hop reasoning a knowledge graph exists to enable. No fully automated approach is reliably perfect across an open-ended real-world corpus; production systems typically combine automated resolution with some amount of human review or confidence thresholds that route ambiguous cases to a review queue.

### Loading extracted triples into Neo4j idempotently

~~~python
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def load_triples(triples):
    with driver.session() as session:
        for t in triples:
            session.run(
                """
                MERGE (s:Entity {name: $subject})
                MERGE (o:Entity {name: $object})
                MERGE (s)-[:RELATION {type: $predicate}]->(o)
                """,
                subject=t["subject"], object=t["object"], predicate=t["predicate"]
            )
~~~

MERGE (rather than CREATE) is essential here for the same reason it matters in any Neo4j data-loading script (see the **Neo4j** skill): re-running an extraction pipeline over updated or re-processed documents should not create duplicate entity nodes for the same canonical entity.

### Designing a lightweight schema (ontology) up front

~~~
Entity types:  Person, Organization, Product, Location, Event
Relation types: works_for, founded, acquired, located_in, participated_in

Rule: every extracted relationship's predicate must be one of the five
allowed relation types above -- an extraction that produces anything else
is either mapped to the closest allowed type or flagged for manual review.
~~~

Even a lightweight, informally-enforced schema (as opposed to a fully formal OWL ontology — see the **Ontology** skill for that deeper treatment) dramatically improves an LLM-extracted graph's queryability and consistency. Without SOME constraint on the vocabulary of entity types and predicates, an LLM-built graph tends toward schema drift: the same underlying relationship expressed as a growing number of near-synonymous predicate strings over time, discussed further in Advanced Concepts.

### Combining a knowledge graph with vector search (the GraphRAG idea, introduced)

~~~
1. Embed and index document chunks as usual (see Vector Search / Embeddings).
2. ALSO extract entities and relationships from those chunks into a knowledge graph.
3. At query time: use vector search to find semantically relevant chunks/entities,
   THEN traverse the knowledge graph outward from those entities to pull in
   relationally-connected context the vector search alone would not have surfaced.
~~~

This two-step retrieval (semantic search to find a starting point, graph traversal to expand relationally from it) is the core idea behind GraphRAG, covered in full in Advanced Concepts and Internal Working.
`,

  "advanced-concepts": `
### GraphRAG in depth: community summaries and global vs. local queries

~~~mermaid
flowchart TB
    Docs["Source documents"] --> Extract["LLM entity/relation extraction"]
    Extract --> Graph["Knowledge graph\n(entities + relationships)"]
    Graph --> Communities["Community detection\n(e.g. Louvain clustering of the graph)"]
    Communities --> Summaries["LLM-generated summary\nper community/cluster"]
    Query["User query"] -->|local, entity-specific| Graph
    Query -->|global, thematic| Summaries
~~~

The GraphRAG approach popularized by Microsoft Research's published work distinguishes between LOCAL queries (about a specific entity or its immediate neighborhood — well served by direct graph traversal from that entity) and GLOBAL queries (broad, thematic questions like "what are the main themes across this entire corpus" that no single entity's neighborhood answers well). For global queries, the approach runs community detection (see the graph algorithms discussion in the **Neo4j** skill — Louvain clustering is a common choice) to group densely-connected entities, then has an LLM generate a summary of each community ahead of time, so a global query can be answered by retrieving and synthesizing across relevant community summaries rather than trying to traverse the entire graph at query time. This is a genuinely more sophisticated (and more expensive, both in extraction-time LLM calls and in engineering complexity) approach than naive single-hop GraphRAG, and it is still an active area of practice — published benchmarks are promising for certain question types but this is not a universally superior replacement for standard RAG, and the additional cost and complexity should be weighed against the actual query patterns you need to support.

### Extraction error propagation and confidence scoring

~~~python
# Naive extraction treats every LLM-extracted triple as equally trustworthy --
# a genuinely risky assumption at scale. A more defensible pipeline scores
# confidence and treats low-confidence extractions differently.
def extract_with_confidence(llm_client, text):
    prompt = EXTRACTION_PROMPT_WITH_CONFIDENCE.format(text=text)
    response = llm_client.complete(prompt, response_format="json")
    data = json.loads(response)
    high_confidence = [t for t in data["relationships"] if t.get("confidence", 0) >= 0.8]
    low_confidence = [t for t in data["relationships"] if t.get("confidence", 0) < 0.8]
    # Load high-confidence triples directly; route low-confidence ones to a
    # review queue or a second-pass verification step rather than silently
    # trusting them at the same level.
    return high_confidence, low_confidence
~~~

Because an LLM-built knowledge graph is only as reliable as its weakest extraction step, and because errors compound (a wrong entity resolution early in a pipeline can silently corrupt every downstream relationship involving that entity), mature practice treats extraction confidence as a first-class signal — either via the LLM's own expressed confidence (itself an imperfect signal, since LLMs are not reliably calibrated) or via secondary verification (a second LLM call or a smaller classifier checking the first extraction, or cross-referencing against an existing trusted graph). Be honest with stakeholders that a fully-automated, zero-human-review pipeline over an open-ended corpus will contain errors; the right question is usually "how do we detect and bound the damage," not "how do we eliminate errors entirely."

### Schema drift and its long-term cost

~~~
Month 1:  (person)-[:WORKS_FOR]->(company)
Month 4:  (person)-[:EMPLOYED_BY]->(company)      -- a near-duplicate predicate
Month 7:  (person)-[:IS_STAFF_AT]->(company)       -- another near-duplicate
~~~

Without active governance, an LLM-based extraction pipeline run repeatedly over months of new documents tends to drift: the same real-world relationship gets expressed as a slowly growing set of near-synonymous predicate strings, because each extraction call is made somewhat independently and the LLM has no persistent memory of exactly which predicate vocabulary was used last time (unless you explicitly re-supply it as context, as shown in Intermediate Concepts). Left unmanaged, this quietly degrades query reliability over time — a query for WORKS_FOR silently misses every EMPLOYED_BY and IS_STAFF_AT relationship extracted in later months. Mitigations include re-supplying the current predicate vocabulary as part of every extraction prompt, periodic graph audits that cluster and merge near-duplicate predicates, and treating schema evolution as a deliberate, reviewed process rather than something that emerges implicitly from independent extraction runs.

### Hybrid retrieval architectures at query time

~~~mermaid
flowchart LR
    Query["User query"] --> Embed["Embed query"]
    Embed --> VectorSearch["Vector search\n(semantic similarity)"]
    Query --> EntityLink["Entity linking\n(find query entities in the graph)"]
    EntityLink --> GraphTraversal["Graph traversal\n(multi-hop from linked entities)"]
    VectorSearch --> Fusion["Context fusion / re-ranking"]
    GraphTraversal --> Fusion
    Fusion --> LLM["LLM generation"]
~~~

A production GraphRAG system rarely picks ONE retrieval strategy exclusively; it typically runs vector search and graph traversal in parallel (or graph traversal seeded from vector search's top results), then fuses and re-ranks the combined context before it reaches the LLM's generation step. This adds real engineering complexity — entity linking (recognizing which graph entities a free-text query refers to) is itself an imperfect NLP problem, and fusing two differently-shaped retrieval results (ranked text chunks vs. a traversed subgraph) requires deliberate design, not a drop-in library call in most stacks as of this writing.

### Formal ontologies and logical inference (OWL/description logic, briefly)

~~~
If: (Employee) subClassOf (Person)
And: (ada) type Employee
Then a reasoner can infer: (ada) type Person -- without this fact being explicitly stated
~~~

Beyond property graphs and plain RDF triples, a formal ontology (typically expressed in OWL, built on description logic) allows a reasoner to INFER new facts from explicit class hierarchies and logical constraints, not merely retrieve facts that were explicitly stored. This is a genuinely deeper and more formal approach than most LLM-extraction-based knowledge graphs attempt in practice, and it trades flexibility and ease of construction for logical rigor and inference power. See the **Ontology** skill for a full treatment; most GraphRAG-style systems on this platform use a much lighter-weight, informally-enforced schema rather than a full OWL ontology with logical reasoning, because the engineering cost of formal ontology design and maintenance is substantial relative to the benefit for most retrieval-focused use cases.
`,

  "internal-working": `
Tracing what actually happens when a knowledge graph is built from text and then queried via GraphRAG:

~~~mermaid
flowchart LR
    A["Raw documents"] --> B["Chunking\n(split into passages)"]
    B --> C["LLM extraction\n(entities + relationships per chunk)"]
    C --> D["Entity resolution\n(canonicalize duplicate entities)"]
    D --> E["Graph load\n(MERGE nodes/relationships into a\ngraph database, e.g. Neo4j)"]
    E --> F["Query time: entity linking\n(map query text to graph entities)"]
    F --> G["Graph traversal\n(multi-hop from linked entities)"]
    G --> H["Context assembled and passed to the LLM\nalongside any vector-search results"]
~~~

1. **Chunking**: source documents are split into passages, the same chunking step familiar from standard RAG (see the **RAG** skill) — chunk size matters here too, since an LLM extracting relationships needs enough surrounding context in one chunk to correctly identify a relationship's subject and object, especially when they are not both mentioned in the same sentence.
2. **LLM extraction**: each chunk is passed to an LLM with a prompt (as shown in Intermediate Concepts) asking it to identify entities and the relationships between them, ideally with a constrained vocabulary of entity types and predicates supplied as part of the prompt.
3. **Entity resolution**: extracted entity mentions are canonicalized against already-known entities (via string matching, embedding similarity, or an LLM judgment call) so that "Apple Inc." from one chunk and "Apple" from another resolve to the same graph node.
4. **Graph load**: resolved entities and relationships are loaded into the underlying graph database using idempotent MERGE operations (see the **Neo4j** skill), so re-running extraction over updated documents does not create duplicate nodes.
5. **Query-time entity linking**: at query time, the incoming natural-language query must itself be mapped to relevant graph entities — itself an imperfect NLP step, since a query rarely names entities using their exact canonical graph names.
6. **Graph traversal**: starting from linked entities, the system traverses outward (one to a few hops, typically bounded — see the **Neo4j** skill's discussion of unbounded variable-length path risk) to gather relationally-connected context.
7. **Context assembly**: the traversed subgraph's facts (and, in most production systems, vector-search results run in parallel) are assembled into the LLM's context window for final answer generation.

**The most important thing to internalize**: every one of these steps (chunking, extraction, resolution, linking, traversal) is a place where errors can be introduced or compounded, and none of them is fully solved as of this writing — this is precisely why GraphRAG systems require careful evaluation on YOUR specific data and query patterns rather than being assumed to reliably outperform standard RAG out of the box.
`,

  architecture: `
A senior engineer designing a knowledge-graph-backed system thinks about it at three layers: the ingestion/extraction pipeline that builds and maintains the graph, the storage/query layer (a graph database like Neo4j, or a triple store), and the retrieval layer that combines graph traversal with other retrieval techniques at query time.

### Reference architecture

~~~mermaid
flowchart TB
    subgraph Ingestion["Ingestion pipeline (batch or streaming)"]
        Docs["Source documents"] --> Chunk["Chunking"]
        Chunk --> Extract["LLM extraction"]
        Extract --> Resolve["Entity resolution"]
        Resolve --> Load["Idempotent graph load (MERGE)"]
    end
    Load --> GraphDB["Graph database\n(e.g. Neo4j)"]
    subgraph Retrieval["Query-time retrieval"]
        Query["User query"] --> Link["Entity linking"]
        Query --> VecSearch["Vector search over chunks"]
        Link --> Traverse["Graph traversal"]
        GraphDB --> Traverse
        Traverse --> Fusion["Fusion / re-ranking"]
        VecSearch --> Fusion
    end
    Fusion --> LLM["LLM generation"]
~~~

### Recommended project structure

~~~
myapp/
├── ingestion/
│   ├── chunking.py
│   ├── extraction.py        # LLM prompts + parsing for entity/relation extraction
│   ├── entity_resolution.py
│   └── graph_loader.py       # idempotent MERGE-based loading into Neo4j
├── retrieval/
│   ├── entity_linking.py
│   ├── graph_traversal.py    # bounded Cypher queries for GraphRAG
│   ├── vector_search.py
│   └── fusion.py              # combining graph + vector results
├── schema/
│   └── ontology.yaml          # the allowed entity types and predicate vocabulary
├── evaluation/
│   └── graphrag_eval.py       # measuring retrieval quality against a labeled set
└── tests/
~~~

A schema/ontology file kept as an explicit, versioned artifact (even if informal — a YAML list of allowed entity types and predicates, not necessarily a full OWL ontology) is worth calling out architecturally: it is the single artifact most responsible for preventing the schema drift and predicate fragmentation problems discussed in Advanced Concepts, and it should be supplied as context to every extraction prompt, not left to the LLM's own judgment run after run.
`,

  "data-flow": `
Tracing one GraphRAG query end to end, from user question to final answer:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant LinkLLM as Entity linking (LLM or NER)
    participant GraphDB as Graph database
    participant VecDB as Vector store
    participant GenLLM as Generation LLM

    User->>App: "What compliance issues involve suppliers of Acme Corp?"
    App->>LinkLLM: identify entities mentioned in the query
    LinkLLM-->>App: entity = "Acme Corp"
    App->>GraphDB: MATCH (acme)-[:SUPPLIED_BY]->(supplier)-[:FLAGGED_IN]->(report) RETURN supplier, report
    GraphDB-->>App: traversed subgraph (suppliers + compliance reports)
    App->>VecDB: vector search for semantically related passages
    VecDB-->>App: top-k relevant chunks
    App->>App: fuse graph facts + vector chunks into one context
    App->>GenLLM: generate answer using fused context
    GenLLM-->>User: final answer, ideally citing the traversal path as explanation
~~~

The step most teams underestimate is **entity linking** ("identify entities mentioned in the query") — mapping a free-text question to specific graph node identifiers is itself an imperfect natural-language step, prone to the same ambiguity and error as the extraction step that built the graph in the first place. A query mentioning "Acme" when the graph's canonical node is "Acme Corporation" will silently fail to link unless the linking step itself does fuzzy matching or embedding-based resolution, mirroring the entity resolution problem from ingestion. This is why GraphRAG's end-to-end reliability depends on getting BOTH the ingestion-time extraction/resolution AND the query-time entity linking right — a strong graph with weak query-time linking still produces poor answers, and vice versa.
`,

  "production-usage": `
### A minimal, runnable extraction-to-query pipeline

~~~python
import json
from neo4j import GraphDatabase

# Assume llm_client.complete(prompt, response_format="json") calls your LLM provider.

EXTRACTION_PROMPT = """
Extract entities (name, type) and relationships (subject, predicate, object) from
the text below. Use ONLY these entity types: Person, Organization, Product, Location.
Use ONLY these predicates: works_for, founded, acquired, located_in, supplied_by.
If a fact does not fit these types/predicates, omit it rather than inventing a new one.

Text:
\"\"\"{text}\"\"\"

Return JSON: {{"entities": [...], "relationships": [...]}}
"""

def extract(llm_client, text):
    prompt = EXTRACTION_PROMPT.format(text=text)
    raw = llm_client.complete(prompt, response_format="json")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"entities": [], "relationships": []}

def load_into_neo4j(driver, graph_data):
    with driver.session() as session:
        for e in graph_data["entities"]:
            session.run(
                "MERGE (n:Entity {name: $name}) SET n.type = $type",
                name=e["name"], type=e["type"]
            )
        for r in graph_data["relationships"]:
            session.run(
                """
                MATCH (s:Entity {name: $subject})
                MATCH (o:Entity {name: $object})
                MERGE (s)-[rel:RELATION {predicate: $predicate}]->(o)
                """,
                subject=r["subject"], object=r["object"], predicate=r["predicate"]
            )

def query_supplier_chain(driver, company_name):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Entity {name: $name})-[:RELATION {predicate: 'supplied_by'}]->(supplier)
            RETURN supplier.name AS supplier
            """,
            name=company_name
        )
        return [record["supplier"] for record in result]

if __name__ == "__main__":
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))
    text = "Acme Corp is supplied by Global Metals Inc. Global Metals Inc was acquired by Titan Holdings in 2021."
    graph_data = extract(llm_client, text)
    load_into_neo4j(driver, graph_data)
    print(query_supplier_chain(driver, "Acme Corp"))
    driver.close()
~~~

This pipeline is deliberately minimal — a production version adds entity resolution (see Intermediate Concepts), confidence scoring and a review queue for low-confidence extractions, and batching for throughput (processing thousands of documents one LLM call at a time is slow and expensive; batch requests and consider a smaller, cheaper model for high-volume extraction with a larger model reserved for ambiguous cases).

### Common production stacks

- **Neo4j (or another property graph database) as the storage layer**, queried via Cypher, often alongside a vector index (Neo4j itself supports vector indexes natively in recent versions, letting a single database serve both traversal and similarity search).
- **A dedicated vector database (see the Vector Search skill) running alongside the graph database**, with an application-layer fusion step combining both retrieval results, when a single database's native vector capability is insufficient or a team already has an established vector database.
- **LangChain, LlamaIndex, or similar RAG-oriented frameworks' graph-extraction utilities**, used to bootstrap an extraction pipeline rather than writing every prompt and parsing step from scratch, though production teams frequently need to heavily customize the default prompts and entity-type vocabulary for their domain.
`,

  "industry-examples": `
- **Google**: the Knowledge Graph powering search result info panels is one of the most widely known industrial knowledge graphs, built from a combination of structured data partnerships, extraction from the web, and manual curation, used to answer direct factual queries and populate rich search results.
- **Amazon**: maintains a large product knowledge graph connecting products, categories, attributes, and relationships (works well with, replacement for, accessory of), used for search relevance and recommendation.
- **LinkedIn**: builds and maintains an economic graph connecting people, companies, skills, and jobs, used for search, recommendation ("people you may know," job matching), and economic insight reporting.
- **Microsoft**: published the GraphRAG approach (combining LLM-based entity extraction, community detection, and LLM-generated community summaries) as both a research contribution and an open-source implementation, and has discussed applying graph-augmented retrieval within its own product and research contexts.
- **Financial services and compliance teams (various institutions)**: use knowledge graphs to model ownership structures, beneficial-ownership chains, and counterparty relationships for anti-money-laundering and compliance investigations — the same class of multi-hop relationship question that made the Panama Papers investigation (see the **Neo4j** skill's Industry Examples) a widely cited graph-database case study.
- **Pharmaceutical and life sciences organizations**: use RDF-based knowledge graphs extensively (drug-gene-disease-protein relationships), often building on public biomedical ontologies and linked-data standards, reflecting the RDF/SPARQL lineage's continued strength in scientific domains with well-established formal ontologies.

Pattern to notice: knowledge graph adoption clusters around domains where entities have MANY, VARIED, and genuinely important relationships to reason over — search relevance, recommendation, compliance/ownership tracing, and biomedical research — and increasingly, GraphRAG-style multi-hop question answering over enterprise document corpora, though the latter remains a newer and less uniformly proven pattern than the more established use cases above.
`,

  "best-practices": `
1. **Constrain the entity-type and predicate vocabulary before you start extracting**, and re-supply that vocabulary as explicit context in every extraction prompt — the single highest-leverage defense against schema drift and predicate fragmentation.
2. **Treat entity resolution as a first-class pipeline stage, not an afterthought** — a knowledge graph with unresolved duplicate entities silently loses most of the multi-hop reasoning value it was built to provide.
3. **Score extraction confidence and route low-confidence extractions to review** rather than trusting every LLM-extracted triple equally.
4. **Bound every graph traversal query's hop count explicitly** (as in the **Neo4j** skill), since an unbounded multi-hop query over a densely connected graph risks the same combinatorial blowup there as anywhere else.
5. **Combine graph traversal with vector search rather than treating them as mutually exclusive** — GraphRAG's real value is usually in the combination, not in replacing semantic search outright.
6. **Version and audit your schema/ontology as a deliberate, reviewed artifact**, not something that implicitly emerges from independent extraction runs over time.
7. **Evaluate GraphRAG against your OWN query patterns and data**, not against a generic benchmark — multi-hop question types that benefit most vary significantly by domain, and the added engineering cost is only justified where it measurably helps.
8. **Re-run entity resolution periodically as the graph grows**, since new documents may introduce entities that should retroactively merge with ones already in the graph.
9. **Keep a human-reviewable audit trail from source text to extracted triple**, so a wrong or misleading answer can be traced back to the specific extraction that produced it.
10. **Prefer a small number of well-defined relationship types over many highly specific ones**, mirroring the same modeling discipline covered for property graphs generally in the **Neo4j** skill.
11. **Do not assume LLM-based extraction is production-ready without evaluation on YOUR corpus** — extraction quality varies substantially by domain, document structure, and how distinctly named your entities are.
12. **Plan explicitly for graph maintenance as source data changes** — a knowledge graph is a living artifact, not a one-time batch job (see Production Usage and the Common Mistakes section for what this concretely requires).
`,

  "anti-patterns": `
### Unconstrained predicate vocabulary in extraction prompts

~~~
# WRONG -- no constraint on the predicate vocabulary, so an LLM invents a
# slightly different predicate string for nearly every sentence
prompt = "Extract subject-predicate-object triples from this text: " + text

# RIGHT -- explicitly constrain and re-supply the allowed predicate vocabulary
prompt = (
    "Extract triples using ONLY these predicates: works_for, founded, acquired, "
    "located_in, supplied_by. If a fact does not fit, omit it. Text: " + text
)
~~~

Leaving the predicate vocabulary unconstrained is the single most common cause of a fragmented, hard-to-query knowledge graph — the same underlying relationship ends up expressed as dozens of near-synonymous predicate strings across a large corpus.

### Trusting every LLM-extracted triple with equal confidence

~~~python
# WRONG -- loads every extracted triple directly with no verification
load_into_neo4j(driver, extract(llm_client, text))

# RIGHT -- score confidence, route low-confidence extractions to review
graph_data = extract_with_confidence(llm_client, text)
load_into_neo4j(driver, graph_data["high_confidence"])
review_queue.add(graph_data["low_confidence"])
~~~

Because extraction errors compound (a wrong entity or relationship early in a pipeline can silently corrupt every downstream query touching that entity), treating every extraction as equally trustworthy is a common but costly shortcut.

### Skipping entity resolution entirely

~~~
# WRONG -- "Apple Inc.", "Apple", and "AAPL" become three disconnected nodes,
# each with only a fraction of the real entity's actual relationships
MERGE (a:Entity {name: "Apple Inc."})
MERGE (b:Entity {name: "Apple"})
MERGE (c:Entity {name: "AAPL"})

# RIGHT -- resolve to one canonical node before loading
canonical_name = resolve_entity(mention, existing_entities, embedding_fn)
MERGE (a:Entity {name: canonical_name})
~~~

Skipping entity resolution silently fragments the graph, and the failure is often invisible until someone runs a query expecting complete results and quietly gets an incomplete answer instead.

### Other common anti-patterns

- **Unbounded graph traversal in a GraphRAG query**, risking the same combinatorial explosion and slow queries covered in the **Neo4j** skill.
- **Treating GraphRAG as a strict upgrade over standard RAG for every query type**, when in practice it helps specifically for multi-hop, relationship-centric questions and adds real cost and complexity for queries that are better served by plain semantic search.
- **Building a full formal OWL ontology with logical reasoning before validating that a lightweight, informal schema would not have sufficed** — formal ontology design and maintenance is a substantial investment, appropriate for some domains (see the **Ontology** skill) but overkill for many retrieval-focused applications.
- **Never re-running entity resolution or auditing the schema after initial construction**, letting duplicate entities and predicate fragmentation accumulate silently as new documents are processed over months.
`,

  performance: `
### Rule zero: measure the retrieval quality first, not just query latency

~~~
# Before optimizing traversal speed, measure whether GraphRAG is actually
# improving ANSWER QUALITY on a labeled evaluation set versus standard RAG --
# a fast query that retrieves the wrong context is not a performance win.
~~~

Performance work on a knowledge-graph-backed system should start with retrieval quality evaluation (does graph traversal actually surface better context for YOUR query types), not purely with traversal latency — a common trap is optimizing Cypher query speed on a graph that is not actually improving the final answer.

### The optimization hierarchy (apply in order)

1. **Index the entity name/canonical-id property used for entity linking** — exactly the same starting-node-lookup principle covered in the **Neo4j** skill; without it, every query-time entity link requires an expensive full scan.
2. **Bound traversal hop count explicitly** (typically one to three hops for most GraphRAG use cases) — an unbounded traversal on a densely connected graph is both slow and likely to retrieve too much low-relevance context, diluting the LLM's final context window.
3. **Batch extraction LLM calls and consider a cheaper/smaller model for high-volume extraction**, reserving a larger, more capable model for ambiguous entity resolution or low-confidence review cases — extraction cost scales with corpus size and re-processing frequency, and is often the dominant cost driver, not query-time traversal.
4. **Pre-compute and cache expensive traversal patterns** (like community summaries in the GraphRAG community-detection approach) at ingestion time rather than at query time, since community detection algorithms are too expensive to re-run per query.
5. **Tune the fusion/re-ranking step's context budget carefully** — pulling in too much traversed graph context alongside vector-search results can crowd out the LLM's effective context window without proportionally improving answer quality.

### Facts worth knowing

- Entity resolution accuracy tends to matter more for overall system quality than traversal query speed in most GraphRAG deployments — a fast query over a poorly-resolved graph still produces a poor answer.
- The cost of re-running extraction over an entire corpus grows with corpus size and LLM API cost; incremental extraction (processing only new/changed documents) is essential for any corpus beyond a small, static one.
`,

  scalability: `
Scaling a knowledge-graph-backed system has two genuinely distinct dimensions: scaling the underlying graph database (covered fully in the **Graph Databases** and **Neo4j** skills — Causal Clustering, read replicas, and the harder problem of true graph sharding), and scaling the EXTRACTION PIPELINE that builds and maintains the graph from a growing document corpus.

### Extraction pipeline scaling

~~~mermaid
flowchart LR
    NewDocs["New/changed documents"] --> Queue["Extraction job queue"]
    Queue --> Workers["Parallel extraction workers\n(batched LLM calls)"]
    Workers --> Resolution["Entity resolution\n(against existing graph)"]
    Resolution --> Load["Idempotent graph load"]
~~~

Extraction pipeline scaling is primarily an LLM-API-cost and throughput problem: parallelizing extraction across many documents, batching calls where the provider supports it, and processing only new or changed documents incrementally rather than re-extracting an entire corpus on every run. Entity resolution against an already-large graph also becomes more expensive as the graph grows (more existing entities to compare a new mention against), typically requiring an approximate nearest-neighbor index over entity name embeddings (see the **Vector Search** skill) rather than naive pairwise comparison.

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| Missing index on the entity-linking lookup property | Add appropriate indexes/constraints (see the Neo4j skill) |
| Unbounded traversal on a densely connected graph | Bound hop count explicitly; add relationship-type constraints |
| Extraction pipeline throughput/cost as corpus grows | Batch and parallelize LLM calls; process incrementally, not full re-extraction each run |
| Entity resolution cost against a large existing entity set | Approximate nearest-neighbor search over entity embeddings rather than naive pairwise comparison |
| Very large graph exceeding a single graph database instance | The same harder graph-sharding problem covered in the Neo4j skill's Scalability section -- domain partitioning or federated queries rather than transparent sharding |
`,

  security: `
### Attack surface specific to knowledge graphs

1. **Cypher/SPARQL injection**: if any part of a graph query is built by string-concatenating untrusted input (including, notably, LLM-extracted entity names inserted directly into a query string rather than passed as parameters), the same injection risk applies as covered in the **Neo4j** skill — always use parameterized queries.
2. **Prompt injection during extraction**: a source document could contain text deliberately crafted to manipulate the LLM extraction step itself (for example, instructing the model to extract false relationships, or to ignore the predicate-vocabulary constraint) — a genuine, evolving concern whenever LLM extraction runs over untrusted or externally-sourced documents; treat extracted facts from untrusted sources with appropriate skepticism and validation, and see the broader prompt injection discussion in the **RAG** skill.
3. **Sensitive relationship exposure**: a knowledge graph can make previously hard-to-connect sensitive facts (which employees know which other employees, ownership chains, personal relationships) trivially queryable in aggregate, even if each individual fact was already technically public or low-sensitivity — an aggregation risk worth deliberate access-control design, not merely securing the underlying documents.

### What remains the application's responsibility

- **Access control at the graph-traversal level**, not just at the source-document level — a user who should not see a sensitive relationship needs that enforced consistently across every traversal query touching it, since a knowledge graph can make aggregation-based inference easier than the original scattered documents did.
- **Provenance tracking**: retaining a link from each extracted triple back to its source document and extraction confidence, both for auditability and to support removing or correcting facts traced to a bad extraction or a since-retracted source document.
- **Validating extracted facts from untrusted or adversarial sources** before loading them into a graph that downstream systems will trust and traverse.

See the **OWASP Top 10** and **Secrets Management** skills for the general security depth this builds on, and the **Neo4j** skill for graph-database-specific security controls (role-based access control, TLS, parameterized queries).
`,

  testing: `
Testing a knowledge-graph pipeline requires testing three genuinely distinct things: extraction correctness, entity resolution correctness, and query/traversal correctness.

~~~python
import pytest
import json

def test_extraction_respects_predicate_vocabulary(llm_client):
    text = "Ada Lovelace was employed by the Analytical Engine project."
    result = extract(llm_client, text)
    allowed_predicates = {"works_for", "founded", "acquired", "located_in", "supplied_by"}
    for rel in result["relationships"]:
        assert rel["predicate"] in allowed_predicates, (
            f"Extraction produced an out-of-vocabulary predicate: {rel['predicate']}"
        )

def test_entity_resolution_merges_known_variants(embedding_fn):
    existing = ["Apple Inc."]
    resolved = resolve_entity("Apple", existing, embedding_fn, threshold=0.8)
    assert resolved == "Apple Inc."

def test_bounded_traversal_query_returns_expected_hops(neo4j_driver):
    with neo4j_driver.session() as session:
        session.run(
            "CREATE (a:Entity {name:'A'})-[:RELATION {predicate:'supplied_by'}]->(b:Entity {name:'B'})"
        )
        result = session.run(
            "MATCH (a:Entity {name:'A'})-[:RELATION {predicate:'supplied_by'}]->(b) RETURN b.name AS name"
        )
        names = [r["name"] for r in result]
        assert names == ["B"]
~~~

### The senior testing doctrine for knowledge graphs

- Test extraction against a small, hand-labeled set of representative documents with known correct triples, and track precision/recall over time as prompts or models change — extraction quality is not something to assume stays constant across model or prompt updates.
- Test entity resolution explicitly with known tricky cases (abbreviations, common misspellings, genuinely distinct entities with confusingly similar names) rather than only easy exact-match cases.
- Test that graph queries used in production are explicitly bounded (hop count, relationship type) and behave correctly against a small, hand-constructed test graph where the expected result is verifiable by inspection.
- For a full GraphRAG pipeline, evaluate end-to-end answer quality against a labeled question set, comparing GraphRAG's answers to plain vector-search RAG's answers on the SAME questions, specifically on multi-hop questions where the two approaches are expected to differ most.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the raw LLM extraction output for the specific document in question** — most graph quality problems trace back to a malformed, incomplete, or out-of-vocabulary extraction at ingestion time, not a query-time bug.
2. **Check entity resolution logs/decisions for the specific entity involved** — a "missing" relationship in a query is very often actually present in the graph but attached to an unresolved duplicate entity node.
3. **Run EXPLAIN/PROFILE on the underlying Cypher query** (see the **Neo4j** skill) to confirm the query itself is using an index for entity linking and traversing as expected.
4. **Trace provenance from a wrong or missing answer back to its source document** — if you retained a link from each triple to its source text and extraction confidence (as recommended in Best Practices), this is a direct lookup rather than a guessing exercise.
5. **Re-run extraction on the specific problematic passage with a more capable model or a refined prompt**, to distinguish a systematic extraction weakness from a one-off error.

### Debugging common knowledge-graph-specific symptoms

- "A query returns fewer results than expected" — almost always either an unresolved duplicate entity (see #2 above) or an out-of-vocabulary predicate from an inconsistent extraction run (see #1).
- "GraphRAG answers seem worse than plain vector search for a specific question type" — check whether that question is actually multi-hop/relational in nature; GraphRAG's advantage is narrow and specific, and it is not unusual for it to add no value (or even dilute context) on questions that are fundamentally about semantic similarity rather than relationships.
- "The graph has an obviously wrong relationship" — trace provenance to the source document and check whether prompt injection, an ambiguous sentence, or a genuinely wrong LLM extraction produced it, and consider whether your confidence-scoring/review process should have caught it.
`,

  monitoring: `
Production visibility into a knowledge-graph pipeline needs signals at both ingestion time and query time, beyond the standard graph-database metrics covered in the **Neo4j** skill.

### Key metrics to track

- **Extraction success/failure rate**: how often the LLM extraction step returns malformed or unparseable output, a leading indicator of prompt or model regressions.
- **Entity resolution merge rate and manual review queue size**: a growing review queue signals either a genuinely ambiguous corpus or a resolution threshold that needs tuning.
- **Predicate vocabulary drift**: periodically audit the distinct predicate strings actually present in the graph against the intended constrained vocabulary, catching schema drift before it silently degrades query completeness.
- **GraphRAG vs. vector-search-only answer quality**, tracked on an ongoing labeled evaluation set, not just measured once at launch — extraction quality, corpus composition, and query patterns all shift over time.
- **Graph traversal query latency and the standard Neo4j operational metrics** (page cache hit ratio, slow query log volume) covered in the **Neo4j** skill.

### Alerting priorities

Alert on: a sudden spike in extraction failures (often signaling an LLM provider issue or a prompt regression after a deploy), a growing manual entity-resolution review queue, and any measured drop in GraphRAG answer quality against the ongoing evaluation set.
`,

  deployment: `
### Batch vs. incremental ingestion

~~~
Batch (simpler, appropriate for a small or infrequently-updated corpus):
  - Re-extract and reload the entire graph on a schedule (nightly, weekly)
  + simple to reason about, no incremental-update logic needed
  - wasteful and slow as the corpus grows; re-processes unchanged documents

Incremental (necessary for a large or frequently-updated corpus):
  - Track document versions/hashes; extract only new or changed documents
  - Requires idempotent MERGE-based loading (see Production Usage) so repeated
    partial updates never create duplicate nodes
  + scales to a growing, frequently-updated corpus without reprocessing everything
~~~

### A minimal deployment pipeline

~~~yaml
# A simplified CI/CD-style ingestion job definition
ingestion_job:
  trigger: on_new_or_changed_document
  steps:
    - chunk_document
    - extract_entities_and_relationships   # LLM call, batched where possible
    - resolve_entities_against_existing_graph
    - load_into_graph_database              # idempotent MERGE
    - update_predicate_vocabulary_audit_log
~~~

### Rollback and correction strategy

Because an LLM-based extraction pipeline will produce some errors, plan explicitly for correction, not just forward progress: retain provenance (source document and extraction confidence per triple, as recommended in Best Practices) so a bad extraction can be traced and removed, and version your schema/predicate vocabulary so a prompt or model change that introduces new drift can be identified against a known-good baseline. See the **CI/CD** and **Docker** skills for the general deployment discipline this builds on, and the **Neo4j** skill for the underlying graph database's own deployment/backup concerns.
`,

  "production-checklist": `
Before a knowledge-graph-backed system takes real traffic:

- [ ] Entity type and predicate vocabulary explicitly defined and re-supplied in every extraction prompt
- [ ] Entity resolution implemented and tested against known tricky cases (abbreviations, similar names)
- [ ] Extraction confidence scoring in place, with a review path for low-confidence extractions
- [ ] Graph loading uses idempotent MERGE operations, never plain CREATE, for any rerunnable pipeline
- [ ] Provenance retained from each triple back to its source document and extraction confidence
- [ ] All graph queries parameterized; no string-concatenated Cypher/SPARQL from untrusted input
- [ ] Traversal queries explicitly bounded in hop count
- [ ] Entity linking at query time tested against realistic, imprecisely-worded user queries
- [ ] GraphRAG answer quality evaluated against plain vector-search RAG on a labeled question set, specifically on multi-hop questions
- [ ] Incremental ingestion in place if the corpus is large or frequently updated, rather than full re-extraction each run
- [ ] Predicate vocabulary drift audit scheduled periodically, not assumed to stay stable
- [ ] Monitoring/alerting wired up for extraction failure rate, resolution review queue size, and ongoing answer-quality evaluation
- [ ] Access control enforced at the graph-traversal level for any sensitive relationships, not only at the source-document level
- [ ] Runbook: how to trace a wrong answer back to its source extraction and correct or remove it
`,

  "common-mistakes": `
1. **Leaving the extraction predicate vocabulary unconstrained**, leading to fragmented, hard-to-query near-duplicate relationship types over time.
2. **Skipping entity resolution or treating it as a minor detail**, silently fragmenting the graph and undermining the multi-hop reasoning it exists to enable.
3. **Trusting every LLM-extracted triple with equal confidence**, letting extraction errors compound invisibly through downstream queries.
4. **Assuming GraphRAG is a strict upgrade over standard RAG**, when its real advantage is narrow (multi-hop, relationship-centric questions) and it adds genuine cost and complexity elsewhere.
5. **Writing unbounded traversal queries** on a densely connected graph, risking the same combinatorial blowup covered in the **Neo4j** skill.
6. **Building a full formal ontology before validating a lightweight schema would not have sufficed**, over-investing in formal rigor relative to the actual retrieval need.
7. **Treating the knowledge graph as a one-time build rather than a maintained, living artifact**, letting it silently go stale as source data changes without a re-extraction or update process.
8. **Not retaining provenance from triple to source document**, making it far harder to trace, correct, or remove a wrong or misleading extracted fact.
9. **Ignoring query-time entity linking as a source of failure**, assuming a well-built graph alone guarantees good retrieval when imprecise or ambiguous query wording routinely breaks naive linking.
10. **Never auditing predicate vocabulary drift after initial construction**, letting the same relationship fragment into many near-synonymous predicates as the pipeline runs repeatedly over new documents.
`,

  "common-errors": `
| Error / Symptom | Typical Cause | Fix |
|------------------|----------------|-----|
| Query returns fewer results than expected | Unresolved duplicate entity nodes | Re-run/tune entity resolution; audit for near-duplicate entity names |
| Malformed or unparseable extraction output | LLM did not follow the requested JSON structure | Validate and handle parse failures explicitly; consider stricter structured-output constraints |
| Same relationship stored under many different predicate strings | Unconstrained predicate vocabulary in extraction prompts | Constrain and re-supply the allowed predicate vocabulary in every prompt; periodically audit and merge |
| GraphRAG answers no better (or worse) than plain vector search | The query type is not actually multi-hop/relational, or graph context is diluting the LLM's window | Evaluate per query type; route non-relational queries to plain vector search |
| Traversal query extremely slow or appears to hang | Unbounded variable-length path traversal on a dense graph | Bound the hop count explicitly; add relationship-type constraints (see the Neo4j skill) |
| Entity linking fails to find an obviously relevant graph entity | Query wording does not match the canonical entity name closely enough | Use fuzzy/embedding-based entity linking, not exact string matching |
| A clearly wrong relationship appears in the graph | Extraction error, ambiguous source sentence, or prompt injection from an untrusted document | Trace provenance to the source document; validate and remove; reconsider trust level for that source |
`,

  faqs: `
**Is a knowledge graph the same thing as a graph database?**
No — a graph database (like Neo4j) is the storage/query TECHNOLOGY; a knowledge graph is the DATA MODEL (entities, relationships, and often a schema/ontology) that happens to be stored on top of it. You could, in principle, store a knowledge graph in a relational database with heavy denormalization, but a graph database's traversal performance and query ergonomics make it the far more common practical choice — see the **Graph Databases** and **Neo4j** skills.

**Should I use Cypher or SPARQL for my knowledge graph?**
Cypher (property graphs, typically Neo4j) tends to be more approachable and developer-ergonomic for most application-building teams; SPARQL (RDF triple stores) remains the standard in domains with well-established formal ontologies (biomedical research, government linked data) and where interoperability with existing public RDF datasets (DBpedia, Wikidata) matters. Most GraphRAG-style AI-engineering work on this platform leans toward the property-graph/Cypher approach.

**Is GraphRAG always better than plain vector-search RAG?**
No, and be skeptical of any claim that it is. GraphRAG's genuine advantage is on multi-hop, relationship-centric questions where the answer depends on traversing explicit connections between entities; for questions that are fundamentally about semantic/topical similarity, plain vector search is often simpler, cheaper, and just as effective or better. Evaluate on your own query patterns rather than assuming one approach dominates.

**How reliable is LLM-based entity and relationship extraction?**
Genuinely imperfect, and an active area of practice rather than a solved problem as of this writing. Expect extraction errors, missed relationships, and entity resolution failures at any meaningful corpus scale; production systems need confidence scoring, review workflows, and ongoing evaluation, not a "build once and trust forever" assumption.

**How do I keep a knowledge graph up to date as source data changes?**
Treat it as a maintained, living artifact: track document versions/changes, run incremental extraction (not full re-extraction) where possible, periodically audit for entity-resolution drift and predicate-vocabulary fragmentation, and retain provenance so outdated or wrong facts can be traced and corrected rather than silently persisting.

**Do I need a formal ontology (OWL) or is a lightweight schema enough?**
For most retrieval-focused, GraphRAG-style applications, a lightweight, informally-enforced schema (a constrained list of entity types and predicates) is sufficient and much cheaper to build and maintain than a full OWL ontology with logical reasoning. Reach for a formal ontology (see the **Ontology** skill) specifically when you need actual logical inference over class hierarchies, not merely consistent, queryable relationships.

**Can a knowledge graph replace a vector database entirely?**
Rarely as a full replacement — a knowledge graph excels at explicit, structured relational queries, while a vector database excels at semantic similarity search over unstructured text (see the **Vector Search** and **Embeddings** skills). Most production GraphRAG systems combine both rather than choosing one exclusively.
`,

  "interview-questions": `
### Junior level

1. **What is a triple, and what are its three parts?**
   Model answer: The atomic fact unit of a knowledge graph — subject, predicate, object — for example "Ada Lovelace, collaborated_with, Charles Babbage." The subject and object are entities; the predicate is the relationship connecting them.

2. **What is the difference between a property graph and an RDF triple store?**
   Model answer: A property graph (Neo4j-style) lets both nodes and relationships carry arbitrary key-value properties directly; an RDF triple store represents everything, including properties, as additional triples, and is queried with SPARQL rather than Cypher.

3. **What does GraphRAG combine?**
   Model answer: Graph traversal over a knowledge graph with retrieval-augmented generation, so that an LLM system can answer multi-hop, relationship-centric questions that pure vector similarity search struggles with.

4. **Why is entity resolution necessary when building a knowledge graph from text?**
   Model answer: Because the same real-world entity is often mentioned with different names or abbreviations across documents ("Apple Inc." vs. "Apple"); without resolving these to one canonical node, the graph fragments and loses much of its multi-hop reasoning value.

5. **Name one query language for property graphs and one for RDF triple stores.**
   Model answer: Cypher for property graphs; SPARQL for RDF triple stores.

### Senior level

6. **Why does an unconstrained predicate vocabulary in an LLM extraction pipeline cause problems over time, and how do you prevent it?**
   Model answer: Without an explicit, re-supplied constraint, an LLM invents a slightly different predicate string for nearly every sentence, fragmenting what should be one queryable relationship type into many near-duplicates (schema drift). Prevent it by explicitly constraining the allowed predicate vocabulary in every extraction prompt and periodically auditing the graph for drift.

7. **When would you choose GraphRAG over plain vector-search RAG, and when would you not?**
   Model answer: Choose GraphRAG when your query patterns are genuinely multi-hop and relationship-centric (answers depend on traversing explicit entity connections); avoid the added complexity and cost when queries are fundamentally about semantic/topical similarity, where plain vector search is typically simpler and equally or more effective. Evaluate on your own data rather than assuming universal superiority.

8. **How do extraction errors compound in a knowledge-graph pipeline, and what mitigates this?**
   Model answer: A wrong entity resolution or relationship extraction early in a pipeline silently corrupts every downstream query touching that entity, since later queries trust the graph as ground truth. Mitigate with confidence scoring routing low-confidence extractions to review, retained provenance for tracing and correcting errors, and ongoing evaluation rather than a "build once" assumption.

9. **Explain the difference between local and global queries in the GraphRAG community-detection approach.**
   Model answer: Local queries are about a specific entity or its immediate neighborhood, well served by direct graph traversal; global queries are broad, thematic questions no single entity's neighborhood answers well, addressed instead by running community detection over the graph and having an LLM pre-generate summaries per community, so a global query can synthesize across relevant community summaries.

10. **What is schema drift in the context of an LLM-built knowledge graph, and what long-term cost does it impose?**
    Model answer: The gradual fragmentation of what should be one relationship type into many near-synonymous predicate strings, because independent extraction runs have no persistent memory of exactly which vocabulary was used previously. Left unmanaged, it silently degrades query completeness over time, since a query for one predicate misses semantically identical facts stored under a different predicate string.

11. **How would you secure a knowledge-graph-backed system against prompt injection during extraction?**
    Model answer: Treat source documents, especially from untrusted or external origins, as potentially adversarial; validate extracted facts before loading, retain provenance for auditability, and apply appropriate skepticism/confidence thresholds to extractions from lower-trust sources, since a document could be crafted to manipulate the extraction LLM into producing false relationships.

12. **When would a formal OWL ontology be worth the investment over a lightweight, informally-enforced schema?**
    Model answer: When the application genuinely needs logical inference over class hierarchies and constraints (deriving new facts, not just retrieving stored ones) — common in biomedical and formal linked-data domains — versus most retrieval-focused GraphRAG applications, where a lightweight constrained vocabulary is sufficient and far cheaper to build and maintain.
`,

  "coding-questions": `
### Problem 1: Constrained triple extraction and idempotent loading

Write a function that extracts triples from a list of text passages using an LLM, constrained to a fixed predicate vocabulary, and loads them into Neo4j idempotently.

~~~python
import json

ALLOWED_PREDICATES = {"works_for", "founded", "acquired", "located_in", "supplied_by"}

def extract_constrained(llm_client, text):
    prompt = (
        "Extract subject-predicate-object triples from the text below. "
        "Use ONLY these predicates: " + ", ".join(ALLOWED_PREDICATES) + ". "
        "Omit any fact that does not fit. Return JSON list of "
        "{subject, predicate, object}.\\n\\nText:\\n" + text
    )
    raw = llm_client.complete(prompt, response_format="json")
    try:
        triples = json.loads(raw)
    except json.JSONDecodeError:
        return []
    # Defense in depth: filter anything the LLM produced outside the
    # vocabulary anyway, since prompt constraints are not perfectly reliable.
    return [t for t in triples if t.get("predicate") in ALLOWED_PREDICATES]

def load_triples_idempotent(driver, triples):
    with driver.session() as session:
        for t in triples:
            session.run(
                """
                MERGE (s:Entity {name: $subject})
                MERGE (o:Entity {name: $object})
                MERGE (s)-[:RELATION {predicate: $predicate}]->(o)
                """,
                subject=t["subject"], object=t["object"], predicate=t["predicate"]
            )

def process_corpus(llm_client, driver, passages):
    for text in passages:
        triples = extract_constrained(llm_client, text)
        load_triples_idempotent(driver, triples)
~~~

Complexity: extraction cost is O(number of passages) LLM calls; loading is O(number of triples) MERGE operations, each of which is effectively constant-time given proper indexes on the Entity.name property. Follow-up: how would you batch extraction calls to reduce latency and cost across a large corpus? (Answer: batch multiple short passages into one LLM call where context length allows, or use a cheaper model for bulk extraction with a larger model reserved for ambiguous cases.)

### Problem 2: Bounded multi-hop GraphRAG traversal query

Write a Cypher query (and the Python wrapper) that retrieves all entities within two hops of a given entity via a specific relationship type, for use as GraphRAG context.

~~~python
def get_graphrag_context(driver, entity_name, max_hops=2):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (start:Entity {name: $name})-[:RELATION*1..$max_hops]-(connected:Entity)
            RETURN DISTINCT connected.name AS name
            LIMIT 50
            """,
            name=entity_name, max_hops=max_hops
        )
        return [record["name"] for record in result]
~~~

Note: the hop count is explicitly bounded (max_hops, defaulting to 2) and the result is capped with LIMIT, both deliberate defenses against the combinatorial blowup risk of unbounded traversal on a densely connected graph, covered in the **Neo4j** skill. Follow-up: how would you extend this to only traverse specific predicate types rather than any relationship? (Answer: add a WHERE clause filtering on the RELATION's predicate property, or model distinct predicate types as distinct relationship types in Cypher for more efficient filtering.)

### Problem 3: Simple entity resolution via embedding similarity

Write a function that resolves a newly extracted entity mention against a list of already-known canonical entities using embedding cosine similarity.

~~~python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def resolve_entity(mention, known_entities, embedding_fn, threshold=0.85):
    mention_embedding = embedding_fn(mention)
    best_match, best_score = None, 0.0
    for known in known_entities:
        score = cosine_similarity(mention_embedding, embedding_fn(known))
        if score > best_score:
            best_match, best_score = known, score
    if best_score >= threshold:
        return best_match  # treat as the same canonical entity
    return mention  # a genuinely new entity
~~~

Complexity: O(n) embedding comparisons per new mention against n known entities — fine for a small entity set, but requires an approximate nearest-neighbor index (see the **Vector Search** skill) once the known-entity set grows large. Follow-up: what happens when two genuinely distinct entities have very similar names (for example, two different people named "John Smith")? (Answer: pure embedding similarity on names alone will incorrectly merge them; production systems typically incorporate additional disambiguating context — co-occurring entities, dates, or an LLM-based judgment call on the surrounding text — not name similarity alone.)
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Manual triple extraction and Cypher querying

Take five short paragraphs of text about a topic you know well, manually identify the entities and relationships, write them as Cypher CREATE statements, and load them into a local Neo4j instance. Write three Cypher queries against the resulting graph, including at least one two-hop traversal. Deliverable: the Cypher load script and your three queries with their results. Skills exercised: property graph modeling, basic Cypher.

### Lab 2 (Intermediate): LLM-based extraction pipeline with a constrained vocabulary

Build a Python pipeline that extracts entities and relationships from a small corpus (10 to 20 documents) using an LLM, constrained to a fixed vocabulary of five entity types and five predicates. Include basic entity resolution using embedding similarity, and idempotent loading into Neo4j. Deliverable: the pipeline code, the resulting graph, and a short write-up of at least two extraction errors you observed and how you would mitigate them. Skills exercised: LLM structured extraction, entity resolution, idempotent graph loading.

### Lab 3 (Advanced): A working GraphRAG system with evaluation

Combine your knowledge graph from Lab 2 with a vector index over the same document corpus (see the **Vector Search** skill). Build a query-time pipeline that performs entity linking, bounded graph traversal, and vector search, fuses the results, and passes them to an LLM for answer generation. Construct a small labeled evaluation set of 10 to 15 questions, including at least 5 genuinely multi-hop questions, and compare GraphRAG's answers against plain vector-search-only RAG on the same questions. Deliverable: the pipeline code, the evaluation set and results, and an honest write-up of where GraphRAG helped, where it did not, and why. Skills exercised: hybrid retrieval architecture, evaluation methodology, honest tradeoff analysis.

### Lab 4 (Production): Incremental ingestion and schema drift auditing

Extend the Lab 3 pipeline to support incremental ingestion (processing only new or changed documents, tracked by a content hash or version) and add a scheduled audit script that reports on predicate vocabulary drift (distinct predicate strings actually present in the graph versus the intended constrained vocabulary) and flags candidate near-duplicate entities for review. Deliverable: the incremental ingestion logic, the drift-audit script and a sample report, and a short runbook describing how you would respond to a detected drift or duplicate-entity issue in production. Skills exercised: production pipeline design, operational monitoring, graph maintenance discipline.
`,

  "real-projects": `
### Project 1: Domain-specific compliance knowledge graph

Build a knowledge graph over a corpus of regulatory filings or compliance reports for a chosen domain (financial services, supply chain, or similar), extracting entities (organizations, people, locations) and relationships (ownership, supply, involvement in flagged events). Engineering requirements: a constrained, versioned schema; entity resolution tuned for the domain's naming conventions (legal entity suffixes, common abbreviations); provenance tracking from every triple back to its source filing; and a query interface supporting bounded multi-hop traversal for questions like "find all entities within two hops of this organization that were flagged in a compliance report." This mirrors the real-world compliance/ownership-tracing use cases discussed in Industry Examples.

### Project 2: A GraphRAG question-answering system with honest evaluation

Build a full GraphRAG system over a corpus of your choosing (technical documentation, a company's internal wiki export, or a public dataset), combining LLM-based extraction, entity resolution, a graph database, a vector index, and query-time fusion. Engineering requirements: an evaluation harness comparing GraphRAG against plain vector-search RAG on a labeled question set spanning both multi-hop and purely semantic question types; a confidence-scoring and review workflow for low-confidence extractions; and a clear, honest report on which question types GraphRAG measurably helped, framed as a genuine tradeoff analysis rather than an assumption that graph augmentation always helps.

### Project 3: A living knowledge graph with incremental maintenance

Build a knowledge graph over a corpus that changes over time (a news feed, a changelog, or a periodically updated document set), with a scheduled incremental ingestion pipeline, entity-resolution re-auditing as the graph grows, and a predicate-vocabulary drift-monitoring dashboard. Engineering requirements: idempotent, incremental loading that correctly handles both new documents and updates/retractions of previously-ingested facts; a provenance model supporting removal or correction of facts traced to a bad extraction or a retracted source; and monitoring/alerting for extraction failure rate and schema drift, treating the graph explicitly as a maintained, living production artifact rather than a one-time build.
`,

  "case-studies": `
### Google's Knowledge Graph and the shift toward structured search

Google's 2012 Knowledge Graph launch is widely cited as the moment "knowledge graph" entered mainstream industry vocabulary, powering direct-answer info panels beside search results by connecting entities (people, places, things) with curated and extracted relationships. The lesson: a knowledge graph's value is most visible when it lets a system answer a specific factual or relational question directly and confidently, rather than merely pointing to documents that might contain the answer — but building and maintaining one at that scale required substantial ongoing curation investment alongside automated extraction, not automation alone.

### Microsoft Research's GraphRAG and the local/global query distinction

Microsoft Research's published GraphRAG approach popularized the idea of combining LLM-based entity extraction, community detection, and pre-computed community summaries to answer both narrow entity-specific questions and broad thematic questions over a document corpus. The lesson: not all questions benefit equally from graph augmentation — the approach's own framing distinguishes local (entity-specific) from global (thematic) queries precisely because a single retrieval strategy does not serve both well, a useful reminder against treating GraphRAG as a uniform upgrade over standard RAG for every query type.

### The Panama Papers investigation (International Consortium of Investigative Journalists)

Though covered primarily as a Neo4j case study in the **Neo4j** skill, the Panama Papers investigation is equally a knowledge-graph case study: journalists modeled an enormous, deeply interconnected web of shell companies, ownership structures, and individuals as a queryable graph, enabling multi-hop ownership-chain questions that would have been dramatically harder to answer from the raw leaked documents or a relational database. The lesson: knowledge graphs earn their keep specifically on questions that are fundamentally about tracing relationship chains, not on general-purpose document search.

### Early Semantic Web ambitions and their partial realization

The original 2000s Semantic Web vision (RDF, OWL, and machine-readable, linked, reasoned-over web data at global scale) has been only partially realized in the broad, open form originally envisioned — most of the web never adopted RDF markup widely — but its ideas persist strongly in specific domains (biomedical linked data, government open data, DBpedia and Wikidata) and directly influenced today's property-graph and GraphRAG practices. The lesson: a technically elegant vision (fully machine-readable, logically reasoned-over web data) can fail to achieve universal adoption while still leaving a lasting, valuable influence on the narrower problems it turned out to solve well.
`,

  comparisons: `
| Approach | Best for | Query style | Weakness |
|----------|----------|--------------|----------|
| Knowledge graph (property graph, e.g. Neo4j) | Explicit multi-hop relational reasoning between known entities | Cypher pattern matching | Requires extraction/schema investment; poor fit for nuanced free-text meaning |
| Knowledge graph (RDF triple store) | Formal ontologies, logical inference, linked open data interoperability | SPARQL | More verbose; steeper learning curve than property graphs for most application teams |
| Vector search / embeddings | Semantic similarity over unstructured text, no schema required | Nearest-neighbor similarity search | No explicit relational structure; struggles with precise multi-hop questions |
| Plain RAG (vector search only) | General-purpose document Q&A where relationships are not the core question | Retrieve top-k similar chunks, generate | Cannot reliably answer questions requiring reasoning across many explicit connections |
| GraphRAG (graph + vector combined) | Multi-hop, relationship-centric questions layered on a document corpus | Entity linking + traversal + vector fusion | Added engineering/extraction cost; benefit is narrow and must be evaluated per use case, not assumed |
| Relational database with foreign keys | Well-understood, bounded-depth relationships known in advance | SQL joins | Multi-hop queries get expensive and unwieldy as hop count grows |

**How seniors choose**: start by asking whether your actual query patterns require multi-hop relational reasoning between explicit entities, or whether they are fundamentally about semantic/topical similarity. If the latter, plain vector search (see the **Vector Search** and **Embeddings** skills) is usually simpler and sufficient. If the former, and the entities and relationships are well-defined and worth the extraction investment, a knowledge graph — most often a property graph on Neo4j, combined with vector search in a GraphRAG architecture — is the right tool. Reach for a full RDF/OWL ontology specifically when formal logical inference over class hierarchies is a real requirement, not merely consistent relationship querying, which a lighter-weight schema handles well enough for most application-building teams.
`,

  "related-technologies": `
- **Graph Databases** (general concept) — the underlying storage/query paradigm (index-free adjacency, property graphs vs. RDF) that a knowledge graph is built on top of; read this first if you have not already.
- **Neo4j** — the most common property-graph database used to store and query knowledge graphs in practice on this platform; this page assumes and builds on its Cypher coverage.
- **Ontology** — the deeper, more formal treatment of schema design (classes, properties, logical constraints, OWL) referenced throughout this page wherever formal rigor beyond a lightweight constrained vocabulary is warranted.
- **RAG** (rag-fundamentals) — the broader retrieval-augmented generation pattern that GraphRAG extends; read this for chunking, retrieval, and generation fundamentals this page assumes.
- **Vector Search** — the semantic-similarity retrieval technique knowledge graphs are most often combined with or contrasted against; essential for understanding GraphRAG's hybrid architecture.
- **Embeddings** — the underlying representation technique behind vector search and, often, entity resolution (embedding-based similarity matching for canonicalizing entity mentions).
- **Named Entity Recognition / NLP fundamentals** (where covered elsewhere on this platform) — the broader natural-language-processing lineage that LLM-based entity extraction builds on and, in many pipelines, still complements with classical NER models for speed or cost reasons.

Suggested learning path: **Graph Databases** → **Neo4j** → this page (**Knowledge Graphs**) → **RAG** and **Vector Search** for the retrieval context → **Ontology** for deeper formal schema design where warranted.
`,

  "latest-updates": `
As of this writing (knowledge cutoff January 2026), the most active developments in this space are:

- **GraphRAG tooling maturation**: open-source implementations and frameworks (LangChain, LlamaIndex, and Microsoft's own GraphRAG project among others) continue to add more built-in support for entity extraction, community detection, and graph-vector fusion, lowering the engineering barrier to building a GraphRAG pipeline from scratch — though prompt/schema customization for a specific domain typically remains necessary rather than fully automated.
- **Native vector indexing inside graph databases**: recent Neo4j versions (and competing graph databases) have added native vector index support, letting a single database serve both traversal and similarity search, reducing the architectural need for a separate dedicated vector database in some deployments.
- **Growing emphasis on evaluation rigor**: as GraphRAG has moved from research demonstrations to production pilots, there is a growing (and warranted) emphasis on rigorous, per-domain evaluation comparing graph-augmented retrieval against plain vector search, rather than assuming graph augmentation is a uniform improvement.
- **Continued research on automated, more reliable entity resolution and schema induction**, an area still meaningfully imperfect and worth verifying against current literature and vendor benchmarks rather than assuming solved, given how quickly practical tooling in this space has been evolving.

Given how fast this specific area (LLM-assisted knowledge graph construction and GraphRAG) is moving, verify current tooling and benchmark claims with a targeted search before making architecture decisions based on this section alone.
`,

  "future-roadmap": `
Where this space appears to be heading, and where it is reasonable to invest career time:

- **Better automated entity resolution and schema induction**: this remains one of the most genuinely unsolved practical problems in LLM-based knowledge graph construction, and meaningful improvement here would substantially lower the engineering cost of building reliable knowledge graphs from unstructured text — a strong area to build deep, hands-on expertise in.
- **Tighter, more native integration of graph and vector retrieval**: expect continued convergence of graph databases and vector search capability into more unified retrieval platforms, reducing (though probably not eliminating) the architectural complexity of building a hybrid GraphRAG system from separate systems.
- **More rigorous, standardized evaluation methodology for GraphRAG**: as the pattern matures past its early hype phase, expect (and should demand, as a practitioner) better standardized benchmarks distinguishing exactly which question types graph augmentation genuinely helps with, rather than broad, unqualified claims of superiority.
- **Continued relevance of formal ontologies in specific domains**: while lightweight, informally-enforced schemas will likely remain dominant for general AI-engineering RAG use cases, formal OWL-based ontological rigor will likely remain important, and possibly grow, in domains (biomedical, regulatory, scientific) where logical inference and interoperability with existing linked-data standards genuinely matter.

Where to bet career time: deep, practical skill in entity resolution and extraction-pipeline evaluation (not just building a demo pipeline, but rigorously measuring and improving its reliability) is likely to remain valuable regardless of which specific tooling or framework wins out, since the underlying hard problem — turning messy, unstructured text into a trustworthy structured graph — is unlikely to be fully automated away soon.
`,

  "cheat-sheet": `
~~~
KNOWLEDGE GRAPH ESSENTIALS

Core model:
  Triple = subject -- predicate --> object
  Property graph (Neo4j/Cypher): nodes + relationships, BOTH can carry properties
  RDF triple store (SPARQL): everything expressed as triples; supports OWL ontologies + logical inference

Building one from text (LLM extraction pipeline):
  1. Chunk documents
  2. LLM extraction with a CONSTRAINED entity-type + predicate vocabulary
  3. Entity resolution (canonicalize duplicate mentions -- embedding similarity or fuzzy match)
  4. Idempotent load via MERGE (never plain CREATE) into the graph database
  5. Retain provenance: triple -> source document + confidence

GraphRAG query-time flow:
  Query -> entity linking (map free text to graph nodes)
        -> bounded graph traversal (1-3 hops, explicit limit)
        -> ALSO run vector search in parallel
        -> fuse graph facts + vector chunks -> LLM generation

Knowledge graph vs vector search:
  Graph:  explicit relational reasoning, multi-hop, explainable traversal path
  Vector: semantic similarity, no schema needed, weak at precise multi-hop
  Production systems commonly combine BOTH (GraphRAG), not choose one exclusively

Common pitfalls (memorize these):
  - Unconstrained predicate vocabulary -> schema drift (same fact, many predicate strings)
  - Skipped entity resolution -> fragmented graph, silently incomplete queries
  - Trusting every extracted triple equally -> compounding extraction errors
  - Unbounded traversal -> combinatorial blowup, same risk as any graph database
  - Assuming GraphRAG > plain RAG universally -> evaluate per query type, do not assume

Query language quick reference:
  Cypher:  MATCH (a:Entity {name:'X'})-[:RELATION]->(b) RETURN b
  SPARQL:  SELECT ?b WHERE { ?a :relation ?b . ?a :name 'X' . }

Maintenance discipline:
  Version the schema/predicate vocabulary
  Incremental ingestion for changing corpora, not full re-extraction
  Periodic drift + duplicate-entity audits
  Confidence scoring + human review queue for low-confidence extractions
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What are the three parts of a triple? | Subject, predicate, object |
| What is the property graph model? | A graph where both nodes and relationships can carry arbitrary key-value properties |
| What query language is used for property graphs? | Cypher |
| What query language is used for RDF triple stores? | SPARQL |
| What does GraphRAG combine? | Graph traversal over a knowledge graph with retrieval-augmented generation |
| Why is entity resolution necessary? | The same real-world entity is often mentioned with different names/abbreviations; without resolving these, the graph fragments |
| What causes schema drift in an LLM-built knowledge graph? | An unconstrained predicate vocabulary, so the same relationship gets extracted as many near-synonymous predicate strings over time |
| What is index-free adjacency, and why does it matter here? | Direct pointers from a node to its relationships, making traversal O(1) per hop; it is why graph databases handle multi-hop knowledge graph queries efficiently |
| What is the difference between local and global GraphRAG queries? | Local queries concern a specific entity's neighborhood; global queries are broad, thematic questions answered via pre-computed community summaries |
| What should you do with low-confidence LLM extractions? | Route them to a review queue rather than trusting them equally with high-confidence extractions |
| When should you prefer plain vector search over GraphRAG? | When the question is fundamentally about semantic/topical similarity rather than multi-hop relational reasoning |
| What is provenance in a knowledge graph pipeline, and why does it matter? | A retained link from each triple back to its source document and extraction confidence, essential for tracing and correcting wrong facts |
| What is an ontology, in contrast to a lightweight schema? | A formal specification of entity classes, properties, and logical constraints (often in OWL), enabling logical inference, not just consistent relationship naming |
| Why must graph traversal queries be bounded in hop count? | An unbounded traversal on a densely connected graph risks combinatorial blowup in results and query time |
| What is entity linking at query time? | Mapping a free-text user query to specific graph entity nodes, an imperfect NLP step distinct from (but analogous to) ingestion-time entity resolution |
`,

  mcqs: `
1. What does index-free adjacency most directly accelerate in a knowledge graph query?
   A) The initial lookup of a starting node by property value
   B) Traversal from an already-found node to its neighbors
   C) LLM-based entity extraction
   D) Entity resolution against existing entities
   Answer: B — Explanation: index-free adjacency provides direct pointers for hop-to-hop traversal; finding the initial starting node still benefits from a conventional index, exactly as covered in the Neo4j skill.

2. What is the primary cause of "schema drift" in an LLM-built knowledge graph?
   A) Using MERGE instead of CREATE
   B) An unconstrained predicate vocabulary across independent extraction runs
   C) Storing properties on relationships
   D) Using SPARQL instead of Cypher
   Answer: B — Explanation: without a constrained, consistently re-supplied predicate vocabulary, an LLM tends to invent slightly different predicate strings across runs, fragmenting one true relationship type into many.

3. In the GraphRAG community-detection approach, what is a "global" query best served by?
   A) A single bounded traversal from one linked entity
   B) Pre-computed LLM-generated summaries of graph communities
   C) A plain keyword search
   D) An unbounded variable-length path query
   Answer: B — Explanation: global, thematic questions are not well answered by any single entity's neighborhood; the GraphRAG approach pre-computes community summaries at ingestion time specifically to answer these.

4. Why is entity resolution considered one of the hardest practical problems in knowledge graph construction?
   A) It requires a formal OWL ontology to work at all
   B) It has no impact on query completeness
   C) Reliably deciding whether two differently-named mentions refer to the same entity is genuinely difficult and no fully automated approach is perfectly reliable
   D) It only matters for RDF triple stores, not property graphs
   Answer: C — Explanation: entity resolution (canonicalization) is hard precisely because name variation, abbreviation, and ambiguity make "are these the same entity" a genuinely difficult judgment call at scale.

5. When is a knowledge graph LEAST likely to outperform plain vector search?
   A) When the query requires tracing an explicit multi-hop ownership chain
   B) When the query is fundamentally about semantic/topical similarity rather than explicit relationships
   C) When explainability of the retrieval path matters
   D) When the entities and relationships are well-defined and stable
   Answer: B — Explanation: knowledge graphs excel at explicit relational reasoning; for purely semantic-similarity questions, plain vector search is typically simpler and at least as effective.

6. What is the recommended defense against Cypher/SPARQL injection when loading LLM-extracted entities into a graph?
   A) Trust the LLM's output since it is structured JSON
   B) Always use parameterized queries, never string-concatenate extracted values into a query
   C) Use a formal ontology instead
   D) Disable entity resolution
   Answer: B — Explanation: exactly as with SQL injection, parameterized queries structurally prevent injection regardless of where the input (including LLM-extracted entity names) originated.
`,

  "revision-notes": `
A knowledge graph represents entities as nodes and relationships as edges, built from triples (subject, predicate, object), optionally enriched with properties on both nodes and edges. Two lineages exist: the RDF/SPARQL/OWL Semantic Web tradition, oriented toward formal ontologies and logical inference, and the property-graph/Cypher tradition (Neo4j being the most common example on this platform), oriented toward developer ergonomics and application-building. Most AI-engineering knowledge-graph work today favors the property-graph approach, reaching for formal OWL ontologies specifically when logical inference over class hierarchies is a genuine requirement.

Building a knowledge graph from unstructured text typically means an LLM-based extraction pipeline: chunk documents, prompt an LLM to extract entities and relationships using a deliberately CONSTRAINED entity-type and predicate vocabulary, resolve extracted entity mentions to canonical nodes (entity resolution, one of the hardest practical steps), and load the results idempotently (via MERGE, never plain CREATE) into a graph database. Every one of these steps is imperfect, and errors compound downstream — production systems need confidence scoring, a human review path for ambiguous extractions, and retained provenance from each triple back to its source document.

GraphRAG combines this graph with retrieval-augmented generation: at query time, an incoming question is linked to relevant graph entities (entity linking, itself imperfect), the graph is traversed a bounded number of hops outward to gather relationally-connected context, and this is fused with standard vector-search results before reaching the LLM's generation step. The GraphRAG pattern's real advantage is narrow and specific — multi-hop, relationship-centric questions that pure semantic similarity search struggles to answer — not a universal upgrade over plain RAG, and its added engineering and extraction cost should be evaluated against your own query patterns, not assumed.

The most common, costly pitfalls are: an unconstrained predicate vocabulary causing schema drift (the same fact fragmenting into many near-duplicate relationship types over time), skipped or weak entity resolution silently fragmenting the graph, unbounded traversal queries risking the same combinatorial blowup any graph database faces, and treating a knowledge graph as a one-time build rather than a maintained, living artifact requiring incremental updates and periodic drift audits as source data changes.

For query languages, Cypher (property graphs) reads like a visual pattern-matching diagram of the graph shape being searched; SPARQL (RDF) reads more like SQL's SELECT/WHERE structure while still fundamentally matching triple patterns. Security concerns mirror those of any graph database (parameterize every query) plus knowledge-graph-specific risks: prompt injection during extraction from untrusted documents, and sensitive-relationship aggregation risk, where a graph makes previously hard-to-connect sensitive facts trivially queryable together even if each fact was individually low-sensitivity.
`,

  "learning-roadmap": `
### Week 1: Foundations and the two lineages

Read this page's Foundations, Beginner, and Intermediate Concepts sections. Ensure the **Graph Databases** and **Neo4j** skills are already familiar, since this page builds directly on Cypher and index-free adjacency. Complete Hands-on Lab 1 (manual triple extraction and Cypher querying). Milestone: comfortably write basic and two-hop Cypher queries against a small, hand-built knowledge graph.

### Week 2: LLM-based extraction and entity resolution

Read Advanced Concepts, Internal Working, and Architecture. Build a small LLM-based extraction pipeline with a constrained vocabulary and basic entity resolution (Hands-on Lab 2). Milestone: a working, if imperfect, extraction-to-graph pipeline over a 10-to-20-document corpus, with at least two identified and documented extraction errors.

### Week 3: GraphRAG and hybrid retrieval

Read Production Usage, Performance, and Comparisons closely, alongside the **RAG** and **Vector Search** skills if not already familiar. Build a full GraphRAG system with entity linking, bounded traversal, and vector-search fusion (Hands-on Lab 3), including a labeled evaluation set comparing it against plain vector-search RAG. Milestone: an honest, evaluated answer to "does GraphRAG actually help on my query patterns, and for which question types."

### Week 4: Production discipline and maintenance

Read Production Checklist, Common Mistakes, Security, and Monitoring. Extend your pipeline with incremental ingestion and a schema-drift/duplicate-entity audit (Hands-on Lab 4). Review the Interview Questions and complete the MCQs. Milestone: a production-checklist-complete knowledge-graph pipeline with a documented maintenance runbook.

This page's natural next step on the platform is the **Ontology** skill, for a deeper treatment of formal schema design and logical inference where your use case genuinely warrants it, or the **Vector Search** and **RAG** skills in more depth if you have not yet fully covered the retrieval side of this hybrid architecture.
`,

  "official-docs": `
- **W3C RDF specification** (w3.org/RDF) — the formal standard defining the triple data model underlying RDF-based knowledge graphs.
- **W3C SPARQL specification** (w3.org/TR/sparql11-query) — the standard query language for RDF triple stores.
- **W3C OWL specification** (w3.org/OWL) — the standard for formal ontologies and logical inference over RDF data, relevant when your use case needs actual reasoning, not just consistent relationship querying.
- **Neo4j Cypher documentation** (neo4j.com/docs) — the practical, most commonly used reference for property-graph query syntax on this platform; see also the **Neo4j** skill's own Official Documentation section.
- **Microsoft Research's GraphRAG project documentation** — the most widely cited concrete reference implementation and write-up of the GraphRAG pattern, including the local/global query distinction and community-summary approach discussed in Advanced Concepts.

Verify version-specific details directly against current documentation before relying on them for a production decision — this is an actively evolving space, and specific tooling capabilities (native vector indexing in graph databases, for example) have been changing quickly.
`,

  books: `
- **"Designing and Building Enterprise Knowledge Graphs" by Juan Sequeda and Ora Lassila** — a practitioner-oriented treatment of building production knowledge graphs, covering both RDF and property-graph approaches with a strong enterprise-architecture lens.
- **"Learning SPARQL" by Bob DuCharme** — a focused, practical introduction to SPARQL and RDF querying, useful if your work leans toward the Semantic Web/RDF lineage rather than property graphs.
- **"Graph Databases" by Ian Robinson, Jim Webber, and Emil Eifrem** — though framed around graph databases generally (and covered more fully in the **Neo4j** skill's Books section), its chapters on data modeling translate directly to knowledge graph schema design.
- **"Knowledge Graphs: Fundamentals, Techniques, and Applications" by Mayank Kejriwal, Craig Knoblock, and Pedro Szekely** — a more academically grounded, comprehensive treatment of knowledge graph construction techniques, including entity resolution and extraction, useful for a deeper theoretical grounding beyond this page's practitioner focus.
- **"Ontology Engineering" by Elisa Kendall and Deborah McGuinness** — for teams that genuinely need formal ontology design depth beyond this page's lighter-weight schema treatment; see also the **Ontology** skill.

Be aware that given how quickly LLM-based extraction and GraphRAG-specific practice has evolved, book-length treatments necessarily lag current tooling; supplement with current blogs and papers (below) for the LLM-extraction-specific content.
`,

  blogs: `
- **Microsoft Research's GraphRAG blog posts and repository documentation** — the highest-signal source for the specific GraphRAG pattern (community detection, local/global queries) discussed in Advanced Concepts.
- **Neo4j's official engineering blog** — regularly publishes practical knowledge-graph and GraphRAG content specifically oriented around property graphs and Cypher, complementing the more Neo4j-general content referenced in the **Neo4j** skill's Blogs section.
- **The LangChain and LlamaIndex documentation/blogs** — both frameworks maintain active documentation on graph-extraction utilities and GraphRAG-style retrieval chains, useful for seeing how the pattern is being operationalized in popular tooling, though always verify claims against your own evaluation rather than taking framework marketing at face value.
- **DBpedia and Wikidata project blogs/documentation** — useful for understanding large-scale, public RDF knowledge graphs and entity-linking conventions, relevant if your extraction pipeline links against public entities.

High-signal blog content in this space changes quickly; prioritize posts with concrete, reproducible evaluation numbers over broad claims of GraphRAG's general superiority.
`,

  "research-papers": `
Real, foundational papers relevant to this topic:

- **"GraphRAG: A Modular Graph-Based Retrieval-Augmented Generation System" (Microsoft Research, 2024)** — the primary published reference for the GraphRAG pattern discussed throughout this page, including the community-detection and local/global query approach.
- **"DBpedia: A Nucleus for a Web of Open Data" (Auer et al., 2007)** — the foundational paper describing DBpedia's extraction of structured triples from Wikipedia, a widely cited early large-scale knowledge graph construction effort.
- **Foundational RDF, SPARQL, and OWL W3C recommendations** — while formally standards documents rather than academic papers, they are the primary technical references for the Semantic Web lineage discussed in History and Beginner Concepts.
- **Foundational semantic network research (Quillian, 1968, "Semantic Memory")** — the closest true academic-lineage foundational reading for the entity-relationship-network idea underlying modern knowledge graphs, predating the term itself by decades.

Honest caveat: the specific area of LLM-based knowledge graph construction and GraphRAG is moving quickly, and much of the most current, practically relevant work is published as technical reports, blog posts, and open-source project documentation rather than peer-reviewed academic papers as of this writing — treat the GraphRAG paper above as the closest thing to a canonical reference for that specific pattern, and verify newer claims against current literature before relying on them.
`,

  videos: `
- **Neo4j's official conference talks (NODES conference sessions)** — regularly feature practitioner talks specifically on knowledge graph construction and GraphRAG patterns using Neo4j, a strong source of concrete, implementation-level detail.
- **Microsoft Research talks/presentations on GraphRAG** — direct explanations from the team behind the widely cited GraphRAG approach, useful for understanding the reasoning behind the local/global query distinction and community-summary design.
- **General Semantic Web / RDF and SPARQL introductory talks and university course recordings** — useful if you are approaching this topic from the RDF/OWL lineage rather than property graphs, since fewer current practitioner talks focus specifically on that older but still relevant tradition.

As with blogs, prioritize talks that show concrete, reproducible pipeline details and honest evaluation results over talks that only demonstrate a polished, cherry-picked demo.
`,

  "github-repos": `
- **microsoft/graphrag** — the official open-source implementation accompanying Microsoft Research's GraphRAG paper; the most direct, runnable reference for the community-detection-based GraphRAG pattern discussed in Advanced Concepts.
- **neo4j/neo4j** — the Neo4j graph database itself; useful for understanding the underlying storage/query engine most property-graph knowledge graphs on this platform are built on.
- **langchain-ai/langchain** — includes graph-extraction and GraphRAG-oriented retrieval chain utilities; useful for seeing a popular framework's take on operationalizing this pattern, though customization for your domain's entity/predicate vocabulary is typically still necessary.
- **run-llama/llama_index** — similarly includes knowledge-graph construction and query utilities, worth comparing against LangChain's approach for your specific use case.
- **dbpedia/extraction-framework** — the extraction pipeline behind DBpedia, a useful concrete reference for large-scale, rule-based (pre-LLM) knowledge graph construction from semi-structured web data.
- **Wikidata's official tooling repositories** — useful for understanding a large, actively-maintained, collaboratively-edited public knowledge graph's data model and query conventions (via the Wikidata Query Service, SPARQL-based).

Verify star counts, maintenance activity, and current documentation directly before adopting any of these as a production dependency, since activity levels and API stability change over time.
`,

  "practice-problems": `
Ordered by the skill each focuses on:

1. **Triple modeling**: given three paragraphs of biographical text, manually write out the correct triples, deciding deliberately what should be an entity, a relationship, or a property (mirrors the beginner trap covered in Beginner Concepts).
2. **Cypher pattern matching**: write a two-hop and a bounded-variable-length Cypher query against a small sample knowledge graph, verifying results by hand.
3. **Constrained extraction prompt design**: write an extraction prompt that constrains an LLM to a fixed entity-type and predicate vocabulary, and test it against at least five varied sentences, noting any vocabulary violations the LLM still produces despite the constraint.
4. **Entity resolution edge cases**: given a list of ten entity-name variants (abbreviations, misspellings, and at least two genuinely distinct entities with confusingly similar names), design a resolution approach and justify your threshold choices.
5. **GraphRAG vs. plain RAG evaluation**: construct five multi-hop and five purely semantic questions over a small corpus, and manually reason through (or implement) which retrieval approach should perform better on each, then verify.
6. **External practice sets**: the official Neo4j GraphAcademy courses include hands-on Cypher and knowledge-graph-modeling exercises; the W3C's own SPARQL tutorial materials provide equivalent RDF-side practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Ingestion["Ingestion pipeline"]
        Docs["Source documents"] --> Chunk["Chunking"]
        Chunk --> Extract["LLM extraction\n(constrained entity/predicate vocabulary)"]
        Extract --> Resolve["Entity resolution\n(embedding similarity + review queue)"]
        Resolve --> Load["Idempotent MERGE load"]
    end
    Load --> GraphDB[("Graph database\ne.g. Neo4j")]
    Chunk --> VecIndex[("Vector index")]
    subgraph QueryTime["Query-time retrieval"]
        Query["User query"] --> Link["Entity linking"]
        Query --> Embed["Query embedding"]
        Link --> Traverse["Bounded graph traversal"]
        Embed --> Search["Vector similarity search"]
        GraphDB --> Traverse
        VecIndex --> Search
        Traverse --> Fusion["Fusion / re-ranking"]
        Search --> Fusion
    end
    Fusion --> Gen["LLM generation"]
    Gen --> Answer["Answer, ideally with a\ntraceable traversal path"]
~~~

This is the reference GraphRAG production architecture referenced throughout this page: an ingestion pipeline building and maintaining both a knowledge graph and a vector index from the same source documents, and a query-time path that combines entity linking and bounded graph traversal with vector similarity search before fusing both into the LLM's final generation context.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Knowledge Graphs))
    Core model
      Triples (subject-predicate-object)
      Property graphs (Neo4j/Cypher)
      RDF triple stores (SPARQL/OWL)
    Building one
      Chunking
      LLM entity/relation extraction
      Constrained vocabulary
      Entity resolution
      Idempotent loading (MERGE)
      Provenance tracking
    GraphRAG
      Entity linking
      Bounded traversal
      Vector search fusion
      Local vs global queries
      Community detection + summaries
    Tradeoffs
      Knowledge graph strengths
      Vector search strengths
      When to combine both
    Pitfalls
      Extraction error propagation
      Schema drift
      Entity resolution failures
      Unbounded traversal risk
      Maintenance over time
    Ecosystem
      Neo4j
      Ontology
      RAG
      Vector Search
      Embeddings
~~~
`,
};

export default knowledgeGraphs;
