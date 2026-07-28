import type { CheatSheetData } from "./types";

const ontologyCheatSheet: CheatSheetData = {
  title: "The Ultimate Ontology Cheat Sheet",
  subtitle: "Classes, relationships, hierarchies, and constraints for modeling domain knowledge",
  sections: [
    {
      title: "Core Building Blocks",
      color: "violet",
      rows: [
        { term: "Class / concept", desc: "A category of thing in the domain (a noun): Person, Organization, Location.", code: "class Person(BaseModel):\n    name: str" },
        { term: "Property", desc: "An attribute on a single instance, not pointing to another entity.", code: "class Organization(BaseModel):\n    name: str\n    founded_year: int | None" },
        { term: "Relationship", desc: "A typed connection between two instances (a verb): works_at, founded.", code: "founded: Person -> Organization\nworks_at: Person -> Organization" },
        { term: "Hierarchy (is-a)", desc: "General-to-specific class structure; subclasses inherit general facts.", code: "Person\n  Employee (is-a Person)\n    Engineer (is-a Employee)" },
        { term: "Constraint / axiom", desc: "A rule that must always hold, used to reject invalid facts.", code: "founded_year <= current_year\nworks_at: at most one primary" },
        { term: "Domain / range", desc: "The required source class (domain) and target class (range) of a relationship.", code: "works_at domain=Person\nworks_at range=Organization" },
        { term: "Instance", desc: "A specific real-world thing belonging to a class: this exact Person.", code: "Person(name=\"Jensen Huang\")" },
      ],
    },
    {
      title: "Schema vs Taxonomy vs Ontology",
      color: "blue",
      rows: [
        { term: "Schema", desc: "Storage shape only: tables, columns, foreign keys. No meaning-level relationships." },
        { term: "Taxonomy", desc: "A single is-a hierarchy (category tree). No non-hierarchical relationships." },
        { term: "Ontology", desc: "Hierarchy + typed non-hierarchical relationships + properties + constraints." },
        { term: "Rule of thumb", desc: "Every taxonomy can be part of an ontology; a schema or taxonomy alone is not an ontology." },
        { term: "Knowledge graph", desc: "The instance DATA; the ontology is the SCHEMA/meaning layer above it." },
      ],
    },
    {
      title: "RDF / RDFS / OWL Tradition",
      color: "emerald",
      rows: [
        { term: "RDF", desc: "Resource Description Framework: base data model, subject-predicate-object triples.", code: "(Jensen_Huang, founded, NVIDIA)" },
        { term: "RDFS", desc: "RDF Schema: adds classes, subclass-of hierarchies, domain/range on properties." },
        { term: "OWL", desc: "Web Ontology Language: adds formal description-logic semantics and reasoning." },
        { term: "Description logic", desc: "Decidable logic fragment under OWL; guarantees reasoning tasks terminate." },
        { term: "OWL profiles", desc: "OWL 2 EL/QL/RL trade expressiveness for tractable, scalable reasoning performance." },
        { term: "Reasoner", desc: "Software that checks consistency and derives entailed facts from OWL axioms." },
        { term: "When to use this stack", desc: "Genuine automated-reasoning need, or interop with an existing formal standard (SNOMED CT, Gene Ontology)." },
      ],
    },
    {
      title: "Lightweight Ontology in Code",
      color: "amber",
      rows: [
        { term: "Classes as types", desc: "Model each class as a typed data model (Pydantic / JSON Schema).", code: "class Location(BaseModel):\n    name: str" },
        { term: "Relationship type", desc: "Enum plus a validated model enforcing domain and range.", code: "class RelationType(str, Enum):\n    WORKS_AT = \"works_at\"\n    FOUNDED = \"founded\"" },
        { term: "Domain/range validator", desc: "Reject a fact whose source/target class does not match the relationship rule.", code: "if not isinstance(source, expected_source):\n    raise ValueError(\"bad domain\")" },
        { term: "Constraint validator", desc: "Reject facts violating a business rule (future year, bad cardinality).", code: "if founded_year > date.today().year:\n    raise ValueError(\"invalid year\")" },
        { term: "Union domain/range", desc: "Allow more than one valid source or target class to avoid over-rigid schemas.", code: "source: Person | Organization" },
        { term: "Validate then store", desc: "Always validate a candidate fact before writing it into the graph store." },
        { term: "Graph DB constraints", desc: "Mirror ontology rules as native constraints (uniqueness, property existence) too." },
      ],
    },
    {
      title: "Reasoning Concepts",
      color: "rose",
      rows: [
        { term: "Open-world assumption", desc: "Absent fact = unknown, not false. Default for growing, incomplete knowledge graphs." },
        { term: "Closed-world assumption", desc: "Absent fact = false. Default for enforcing business rules at write time." },
        { term: "Asserted typing", desc: "Class membership explicitly labeled at extraction time (the lightweight default)." },
        { term: "Inferred / defined class", desc: "Class membership derived by a reasoner from necessary-and-sufficient conditions." },
        { term: "Transitive closure", desc: "Deriving A part_of C from A part_of B and B part_of C.", code: "if b == c and (a, d) not in closure:\n    closure.add((a, d))" },
        { term: "Ontology alignment", desc: "Mapping corresponding classes/relationships between two independent ontologies." },
        { term: "Upper ontology", desc: "Shared, very general classes (Entity, Agent, Event) reused across domain ontologies." },
      ],
    },
    {
      title: "Pitfalls and Gotchas",
      color: "cyan",
      rows: [
        { term: "Over-engineering", desc: "Designing dozens of classes and deep hierarchies before real use cases or data exist." },
        { term: "Rigid domain/range", desc: "A relationship too narrowly typed rejects valid, messy real-world facts (co-founders, subsidiaries)." },
        { term: "Schema mistaken for ontology", desc: "A schema-optional graph database does not enforce consistency by itself." },
        { term: "No entity resolution", desc: "Missing disambiguation logic produces duplicate nodes for the same real entity." },
        { term: "Ambiguous relationship types", desc: "A generic related_to relationship destroys queryability and validation value." },
        { term: "Frozen ontology", desc: "Never revisiting v1 as real production data reveals gaps and new patterns." },
        { term: "Structural validity is not truth", desc: "Ontology validation catches shape errors, not factual falsehoods from bad extraction." },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "violet",
      rows: [
        { term: "Version the ontology", desc: "Treat it like a shared API contract: additive changes are safe, renames need migration." },
        { term: "Regression suite", desc: "Add every real extraction failure ever found as a permanent test case." },
        { term: "Monitor rejection rate", desc: "Track validation rejections by relationship type; spikes signal drift or regressions." },
        { term: "Provenance tracking", desc: "Record source, confidence, and extraction timestamp for every stored fact." },
        { term: "Bundle ontology with ingestion", desc: "Ship the ontology and the code enforcing it in the same versioned release." },
        { term: "Test domain/range", desc: "Cover at least one valid and one invalid case per relationship type." },
        { term: "Reuse base classes", desc: "Share Entity/Agent/Event/Location-style base classes across domain ontologies." },
        { term: "Sibling skills", desc: "Pairs with Knowledge Graphs and Graph Databases; grounds structured RAG." },
      ],
    },
  ],
};

export default ontologyCheatSheet;
