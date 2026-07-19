import type { SkillContent } from "../types";

const agentMemory: SkillContent = {
  overview: `
Agent memory is the set of techniques letting an AI agent retain and reuse information beyond a single, isolated interaction — spanning **short-term memory** (context within a single, ongoing task or conversation), **long-term memory** (information persisted and retrievable across genuinely separate sessions, directly connecting to the **Vector Search** skill for retrieval-based implementations), and **episodic memory** (memory of specific past experiences/interactions, as distinct from general factual knowledge). Every framework covered so far in this category — **LangChain**'s memory abstractions, **CrewAI**'s short-term/long-term/entity memory, the **OpenAI Agents SDK**'s Sessions — implements SOME version of these underlying memory concepts; this skill provides the general, framework-independent vocabulary and design principles underlying all of them.

Memory directly addresses a genuine limitation covered throughout the LLMs category: an LLM itself is fundamentally STATELESS between calls — it has no inherent memory of a prior interaction unless that information is explicitly re-included in the current prompt, directly connecting to **LLM Fundamentals**' own context-window treatment. Agent memory systems are precisely the engineering layer responsible for deciding WHAT information to retain, HOW to store it, and WHEN/HOW to reintroduce it into a future prompt — a genuinely important design space with real tradeoffs between completeness, cost, and retrieval accuracy.

Key characteristics: **short-term (working) memory**, information relevant within a single ongoing task, typically the full or recent conversation history; **long-term memory**, information persisted and retrievable across sessions, often backed by a vector database (directly connecting to **Vector Search**); **episodic memory**, memory of specific past experiences/interactions (as opposed to general facts); **semantic memory**, general factual knowledge extracted and generalized from past experiences; and **memory management strategies** (summarization, truncation, retrieval-based reintroduction) for handling the fundamental tension between unbounded memory growth and finite context windows.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2022–2023 | Early LLM applications handle "memory" simply by re-including the FULL conversation history in each subsequent prompt — a simple approach that directly runs into context-window limits (covered in **LLM Fundamentals**) as conversations grow |
| 2023 | **LangChain**'s memory abstractions (buffer memory, summary memory, and others) formalize several distinct strategies for managing this growing-context problem, directly informing the general memory-management vocabulary covered on this page |
| 2023–2024 | **Retrieval-augmented long-term memory** (storing information in a vector database and retrieving relevant pieces on demand, directly connecting to **Vector Search**) becomes a standard pattern for memory that must persist and remain accessible across genuinely separate sessions, beyond what fits in any single context window |
| 2024 | **CrewAI**'s explicit short-term/long-term/entity memory distinction, and the **OpenAI Agents SDK**'s Sessions abstraction, both formalize memory as a first-class, named framework concept rather than an implicit implementation detail |
| 2024–2025 | Continued research and practical interest in more sophisticated memory architectures — distinguishing episodic from semantic memory, and exploring how agents can generalize specific past experiences into reusable, general knowledge over time |

Agent memory's history directly reflects the broader agent-framework field's progression from a naive "just include everything" approach toward increasingly sophisticated, deliberate memory-management strategies as the genuine cost and context-window limitations of the naive approach became clear through practical experience.
`,

  "why-it-exists": `
Agent memory exists because an LLM is fundamentally STATELESS between individual calls — directly connecting to **LLM Fundamentals**' own treatment of the model having no inherent memory beyond what's explicitly included in its current context window — yet many genuinely valuable agent applications require retaining information ACROSS multiple turns within a single task (short-term memory) or across ENTIRELY SEPARATE sessions (long-term memory), such as remembering a user's stated preferences from a prior conversation, or an agent's own accumulated learnings from past task executions.

Memory systems solve this by deliberately deciding what information to retain, how to store it (in-context for short-term needs, or in a persistent, retrievable store like a vector database for long-term needs, directly connecting to **Vector Search**), and how to reintroduce relevant retained information into a future prompt — directly extending **LLM Fundamentals**' context-window constraints into a genuine engineering discipline for managing what an agent "remembers" and when.
`,

  "problem-it-solves": `
Agent memory addresses the **"how do we let a fundamentally stateless LLM-based agent retain and reuse relevant information across multiple turns and separate sessions, within the constraints of a finite context window"** challenge.

Concretely, memory concepts and techniques provide:

- **Short-term (working) memory**, managing conversation/task context within a single ongoing interaction, directly connecting to **LangChain**'s and the **OpenAI Agents SDK**'s own memory/session abstractions.
- **Long-term memory**, persisting information across genuinely separate sessions, typically via retrieval from a vector database (directly connecting to **Vector Search** and the platform's vector database skills).
- **The episodic-versus-semantic memory distinction**, letting engineers deliberately design for retaining specific past experiences versus generalized, extracted knowledge.
- **Memory-management strategies** (summarization, truncation, selective retrieval) directly addressing the fundamental tension between comprehensive memory and finite context-window/cost constraints, directly connecting to **LLM Fundamentals**' own context-window treatment.

What agent memory does **not** solve, or solves only partially: memory systems don't eliminate the underlying reliability challenges covered throughout the LLMs category — a memory system can faithfully retrieve and reintroduce a PAST hallucinated conclusion just as readily as a correct one, directly connecting to **Agent Fundamentals**' own compounding-error treatment; and no memory strategy avoids the fundamental tradeoff between COMPLETENESS (retaining everything) and COST/RELEVANCE (retaining only what's genuinely useful) — every practical memory design makes a deliberate choice along this spectrum.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Distinguish short-term (working), long-term, episodic, and semantic memory, and explain when each is appropriate.
2. Explain why LLM statelessness necessitates deliberate memory-management engineering.
3. Implement a summarization-based strategy for managing growing short-term conversation memory.
4. Implement a retrieval-based long-term memory system using a vector database.
5. Recognize memory anti-patterns: unbounded context growth, and treating retrieved memory as inherently correct.
6. Compare memory implementations across LangChain, CrewAI, and the OpenAI Agents SDK.
7. Answer senior-level interview questions on memory architecture tradeoffs.
`,

  prerequisites: `
- **Required**: **LLM Fundamentals** (the context-window constraint memory management directly addresses), **Vector Search** (the retrieval mechanism underlying most long-term memory implementations), **Agent Fundamentals** (the compounding-error risk memory can propagate).
- **Very helpful**: familiarity with at least one of **LangChain**, **CrewAI**, or the **OpenAI Agents SDK**'s own memory abstractions, providing concrete implementation context.

Dependency chain: **Agent Fundamentals** → **LangChain** → **LangGraph** → **CrewAI** → **OpenAI Agents SDK** → **AutoGen** → this page (Agent Memory) → **Planning** and the remaining capability-focused skills.
`,

  "beginner-concepts": `
### The naive approach: including full conversation history

~~~python
conversation_history = []

def chat(user_message, model):
    conversation_history.append({"role": "user", "content": user_message})
    response = model.generate(conversation_history)
    conversation_history.append({"role": "assistant", "content": response})
    return response
~~~

This is the simplest possible "memory" — the full conversation is re-sent with every call — but directly runs into **LLM Fundamentals**' own context-window limit as the conversation grows, and re-sending an ever-growing history also directly increases cost with every turn (connecting to the **Inference** skill's own per-token cost treatment).

### Short-term versus long-term memory: a first distinction

~~~
Short-term (working) memory: information relevant WITHIN a
    single ongoing task or conversation -- e.g., what the
    user asked three turns ago in THIS conversation.
Long-term memory: information that must persist and remain
    retrievable ACROSS entirely separate sessions -- e.g.,
    a user's stated preference from a conversation last week.
~~~

### A simple truncation strategy for short-term memory

~~~python
MAX_TURNS = 10

def chat_with_truncation(user_message, model, history):
    history.append({"role": "user", "content": user_message})
    if len(history) > MAX_TURNS * 2:
        history = history[-(MAX_TURNS * 2):]  # keep only the
                                                 # most recent turns
    response = model.generate(history)
    history.append({"role": "assistant", "content": response})
    return response, history
~~~

A sliding-window truncation strategy directly bounds context growth, at the cost of losing very early conversation details — a genuine, deliberate tradeoff every memory strategy must make.
`,

  "intermediate-concepts": `
### Summarization: preserving gist while bounding growth

~~~python
def chat_with_summarization(user_message, model, history, summary):
    context = f"Summary of earlier conversation: {summary}\\n" + format_recent(history)
    response = model.generate(context + user_message)
    if len(history) > THRESHOLD:
        summary = model.generate(f"Summarize this conversation so far: {history}")
        history = []  # reset detailed history, relying on the summary
    return response, history, summary
~~~

Rather than discarding early conversation details entirely (as pure truncation does), summarization uses an ADDITIONAL model call to compress older turns into a concise summary, preserving the general gist while still bounding token cost — a genuinely common middle-ground strategy across **LangChain**'s own summary-memory abstraction and similar patterns in other frameworks.

### Long-term memory via retrieval: connecting to Vector Search

~~~python
def store_long_term_memory(fact, vector_db):
    embedding = embed(fact)  # directly connects to the
                               # Embeddings skill
    vector_db.upsert(embedding, metadata={"fact": fact, "timestamp": now})

def retrieve_relevant_memories(current_context, vector_db, k=5):
    query_embedding = embed(current_context)
    return vector_db.similarity_search(query_embedding, k=k)  # directly
                                                                 # the Vector
                                                                 # Search skill's
                                                                 # ANN retrieval
~~~

This directly implements long-term memory as a RAG-style retrieval pattern (directly connecting to the **LangChain** skill's own RAG treatment) — rather than keeping every past fact permanently in context, only the currently RELEVANT subset (determined via vector similarity) is retrieved and reintroduced.

### Episodic versus semantic memory

~~~
Episodic memory: memory of a SPECIFIC past experience/
    interaction -- e.g., "the user asked about refunds on
    March 3rd and was frustrated about the wait time."
Semantic memory: GENERALIZED factual knowledge, potentially
    EXTRACTED from multiple episodic memories over time --
    e.g., "this user consistently prefers email over phone
    contact" (generalized from several specific past
    interactions where this pattern held).
~~~

### Entity memory: tracking specific entities across a conversation

~~~python
entity_memory = {}  # e.g., {"Alex": {"role": "customer",
                       #    "preference": "email contact"}}

def update_entity_memory(extracted_entities, entity_memory):
    for entity, facts in extracted_entities.items():
        entity_memory.setdefault(entity, {}).update(facts)
~~~

Directly connects to **CrewAI**'s own built-in entity-memory concept — tracking specific facts about specific entities (people, organizations, products) encountered during interaction, distinct from either general conversation history or fully generalized semantic knowledge.
`,

  "advanced-concepts": `
### Why retrieved memory isn't automatically correct

~~~
A long-term memory system faithfully RETRIEVES whatever was
previously STORED -- if an earlier interaction stored a
hallucinated or since-outdated fact, the retrieval mechanism
has no inherent way to recognize this, and will reintroduce
it into a future context just as confidently as a genuinely
correct memory -- directly connecting to Agent Fundamentals'
own compounding-hallucination-risk treatment, but extended
across SESSIONS rather than within a single agent loop.
~~~

### Memory consolidation: from episodic toward semantic

~~~
A more sophisticated memory architecture periodically
CONSOLIDATES multiple specific episodic memories into more
generalized semantic knowledge -- directly analogous to how
human memory is believed to consolidate specific experiences
into generalized understanding over time (e.g., many specific
episodes of a user preferring email responses eventually
consolidating into the general semantic fact "this user
prefers email contact") -- this generalization step requires
its own deliberate design (an additional model call
synthesizing patterns across multiple stored episodes) and
carries its own risk of over-generalizing from too few examples.
~~~

### Memory relevance and staleness: when to forget

~~~
Not all long-term memory should be treated as permanently
valid -- a stored fact ("the user's preferred contact method
is email") may become STALE (the user's preference genuinely
changes) or simply less RELEVANT over time. Sophisticated
memory systems incorporate some notion of recency weighting
or explicit invalidation/update mechanisms, rather than
treating every stored memory as permanently, uniformly valid.
~~~

### The cost of comprehensive memory versus the risk of losing context

~~~
Every memory strategy makes a deliberate tradeoff along the
completeness-versus-cost/relevance spectrum -- retaining and
re-including MORE information reduces the risk of losing
genuinely important context, but directly increases token
cost (Inference skill) and risks diluting the model's
attention with irrelevant retrieved memories (directly
connecting to the Attention skill's own treatment of how
additional context can affect a model's focus).
~~~
`,

  "internal-working": `
Tracing a request through a hybrid short-term/long-term memory system:

~~~mermaid
sequenceDiagram
    participant User
    participant Agent
    participant ShortTerm as Short-Term Memory\n(recent turns + summary)
    participant VectorDB as Long-Term Memory\n(vector database)

    User->>Agent: new message in an\nongoing conversation
    Agent->>ShortTerm: retrieve recent turns\n+ running summary
    Agent->>VectorDB: retrieve relevant\nlong-term memories\n(similarity search)
    VectorDB->>Agent: top-k relevant past facts
    Agent->>Agent: construct prompt:\nshort-term context +\nretrieved long-term facts +\ncurrent message
    Agent->>Agent: generate response
    Agent->>ShortTerm: append this turn;\nsummarize if threshold\nexceeded
    Agent->>VectorDB: store any new,\ngenuinely long-term-\nworthy facts
    Agent->>User: response
~~~

1. **Short-term memory (recent turns, plus a running summary of older ones) is retrieved first**, directly bounding the within-conversation context to a manageable size.
2. **A similarity search against the long-term memory vector database retrieves the top-k most RELEVANT past facts** (directly reusing the **Vector Search** skill's own ANN retrieval mechanics), rather than including the agent's entire memory history.
3. **These two sources are combined into the current prompt**, alongside the user's new message, directly implementing a hybrid short-term/long-term memory architecture.
4. **After generating a response, the short-term memory is updated** (and summarized if it exceeds a threshold), and any genuinely long-term-worthy new facts are stored in the vector database for future retrieval.

**Why this matters**: this trace demonstrates precisely how short-term and long-term memory COMBINE in a practical agent system — neither alone is sufficient (short-term memory can't persist across sessions; long-term memory alone, if ALWAYS fully included, would violate context-window and cost constraints), and the RETRIEVAL step (selecting only the currently relevant subset of long-term memory) is precisely what makes long-term memory practically usable within a finite context window.
`,

  architecture: `
A senior AI engineer thinks about agent memory architecture in terms of deliberately choosing the appropriate memory TYPE (short-term, long-term, episodic, semantic, entity) for a given piece of information, and designing explicit consolidation/staleness-handling mechanisms rather than treating memory as permanently, uniformly valid.

### Choosing the appropriate memory type

~~~mermaid
flowchart TB
    Info["A given piece of\ninformation an agent\nencounters"] --> Q{"Relevant only within\nthe CURRENT task/\nconversation, or must\nit persist ACROSS sessions?"}
    Q -->|Current only| ShortTerm["Short-term memory\n(in-context, possibly\nsummarized)"]
    Q -->|Must persist| Q2{"A specific experience,\nor generalizable\nfactual knowledge?"}
    Q2 -->|Specific experience| Episodic["Episodic memory\n(vector-retrievable)"]
    Q2 -->|Generalizable fact| Semantic["Semantic memory\n(possibly consolidated\nfrom episodic memories)"]
~~~

### Designing for staleness and consolidation

A senior practitioner designs explicit mechanisms for updating or invalidating stale long-term memories, and considers periodic consolidation of episodic memories into more generalized semantic knowledge, rather than treating stored memory as a permanently, uniformly accurate record.
`,

  "data-flow": `
Tracing memory consolidation, converting multiple episodic memories into a semantic fact:

~~~mermaid
sequenceDiagram
    participant Agent
    participant Episodic as Episodic Memory Store
    participant Consolidator as Consolidation Process
    participant Semantic as Semantic Memory Store

    Agent->>Episodic: store: "User asked for\nemail follow-up (March 3)"
    Agent->>Episodic: store: "User asked for\nemail follow-up (March 10)"
    Agent->>Episodic: store: "User asked for\nemail follow-up (March 17)"
    Consolidator->>Episodic: retrieve recent episodes\nfor this user
    Consolidator->>Consolidator: identify a recurring\npattern across episodes\n(an LLM call synthesizing\nacross multiple records)
    Consolidator->>Semantic: store generalized fact:\n"User prefers email contact"
    Agent->>Semantic: future interactions retrieve\nthis GENERALIZED fact directly,\nrather than re-deriving it from\nraw episodes each time
~~~

The critical detail: CONSOLIDATION is an explicit, deliberate PROCESS (typically its own dedicated model call, synthesizing a pattern across multiple stored episodic memories) — it doesn't happen automatically or for free, and a system that never consolidates will keep re-deriving the same generalized insight repeatedly (or never capture it at all), directly motivating this as a genuine, distinct architectural component rather than an incidental side effect of simply storing episodic memories.
`,

  "production-usage": `
### A representative hybrid memory implementation

~~~python
class AgentMemory:
    def __init__(self, vector_db, max_short_term_turns=10):
        self.vector_db = vector_db
        self.short_term = []
        self.summary = ""
        self.max_short_term_turns = max_short_term_turns

    def get_context(self, current_message):
        relevant_long_term = self.vector_db.similarity_search(embed(current_message), k=5)
        return {
            "summary": self.summary,
            "recent_turns": self.short_term,
            "relevant_memories": relevant_long_term,
        }

    def update(self, turn, new_long_term_facts):
        self.short_term.append(turn)
        if len(self.short_term) > self.max_short_term_turns:
            self.summary = summarize(self.summary, self.short_term)
            self.short_term = []
        for fact in new_long_term_facts:
            self.vector_db.upsert(embed(fact), metadata={"fact": fact})
~~~

### Non-negotiables for production memory systems

1. **Bound short-term memory growth explicitly** (truncation or summarization), directly reusing **LLM Fundamentals**' context-window guidance.
2. **Use retrieval (not full inclusion) for long-term memory**, directly reusing **Vector Search**'s own recall/relevance principles.
3. **Design explicit staleness-handling/update mechanisms**, avoiding permanently, uniformly trusting stored memories.
4. **Treat retrieved memory as potentially incorrect**, directly reusing **Agent Fundamentals**' own compounding-error caution, extended across sessions.
5. **Choose the appropriate memory type deliberately** (short-term, episodic, semantic, entity) for each category of information an agent handles.

### Common production patterns

- **Hybrid short-term/long-term memory**, combining bounded in-context history with retrieval-based long-term storage.
- **Entity memory tracking**, maintaining structured facts about specific people/organizations encountered across interactions.
- **Periodic consolidation**, converting recurring episodic patterns into generalized semantic facts.
`,

  "industry-examples": `
- **Customer-support agents remembering prior interactions and stated preferences** across separate sessions, directly leveraging long-term, retrieval-based memory.
- **Personal AI assistants** maintaining both short-term conversational context and long-term user-preference memory.
- **LangChain's, CrewAI's, and the OpenAI Agents SDK's own built-in memory/session abstractions**, each providing framework-specific implementations of the general concepts covered on this page.
`,

  "best-practices": `
1. **Bound short-term memory growth explicitly** via truncation or summarization.
2. **Use retrieval-based long-term memory**, never fully including an agent's entire history in every prompt.
3. **Design explicit staleness-handling/update mechanisms** for long-term memory.
4. **Treat retrieved memory as potentially incorrect**, directly reusing **Agent Fundamentals**' compounding-error caution.
5. **Choose the appropriate memory type deliberately** — short-term, episodic, semantic, or entity — for each category of information.
6. **Consider periodic consolidation** of recurring episodic patterns into generalized semantic knowledge.
7. **Monitor retrieval relevance** for long-term memory, directly reusing **Vector Search**'s own evaluation guidance.
`,

  "anti-patterns": `
### Unbounded context growth

~~~
# WRONG — re-including the ENTIRE, ever-growing conversation
# history in every prompt, eventually exceeding the context
# window and incurring unnecessary, growing cost
# RIGHT — bound short-term memory via truncation or
# summarization, directly reusing LLM Fundamentals' guidance
~~~

### Treating retrieved memory as inherently correct

~~~
# WRONG — assuming any retrieved long-term memory is
# automatically accurate and current, without considering
# it may be stale or have been incorrect from the start
# RIGHT — treat retrieved memory as potentially incorrect,
# directly reusing Agent Fundamentals' compounding-error caution
~~~

### Storing everything as long-term memory indiscriminately

~~~
# WRONG — persisting every single interaction detail as
# long-term memory without any relevance/importance filtering,
# bloating the vector database and degrading retrieval quality
# RIGHT — deliberately decide what's genuinely worth
# persisting long-term versus what's only relevant short-term
~~~

### Other production-grade anti-patterns

- **Never consolidating episodic memories into semantic knowledge**, repeatedly re-deriving the same generalized insight.
- **No staleness-handling mechanism**, treating outdated memories as permanently valid.
- **Not monitoring retrieval relevance for long-term memory**, missing degrading recall quality over time.
`,

  performance: `
### Rule zero: memory retention should reflect genuine future relevance, not comprehensive completeness

Retaining and reintroducing more information than genuinely needed directly increases cost (token usage) and risks diluting the model's attention with irrelevant context — deliberate, relevance-based memory design outperforms indiscriminate completeness.

### The performance hierarchy (apply in order)

1. **Bound short-term memory explicitly** via truncation or summarization, avoiding unnecessary token cost from an ever-growing conversation history.
2. **Use retrieval (top-k relevant results) rather than full inclusion** for long-term memory, directly reusing **Vector Search**'s own efficiency principles.
3. **Consolidate recurring episodic patterns into semantic facts**, reducing the need to re-retrieve and re-process multiple redundant episodic memories.
4. **Monitor and tune retrieval relevance** for long-term memory, directly connecting to **Vector Search**'s own recall@k treatment.

### Micro-level facts worth knowing

- Summarization itself requires an additional model call (directly connecting to the **Inference** skill's own per-call cost treatment) — a genuine tradeoff between the cost of summarizing and the cost/risk of an unbounded, growing context.
- Long-term memory retrieval's performance is fundamentally bounded by the underlying vector database's own ANN search performance, directly connecting to **Vector Search**'s own recall/latency tradeoff treatment.
`,

  scalability: `
Deliberate memory architecture directly determines how confidently an organization can scale agent applications to genuinely long-running, multi-session relationships with users or tasks.

### How disciplined memory design enables scaling

~~~mermaid
flowchart LR
    DeliberateMemory["Bounded short-term +\nretrieval-based long-term +\nexplicit staleness handling"] --> Sustainable["Sustainable memory growth\nregardless of interaction volume"]
    Sustainable --> ConfidentScaling["Confident scaling to\nlong-running, multi-session\nagent relationships"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Short-term context approaching the model's context window | Implement summarization or a sliding-window truncation strategy |
| Long-term memory retrieval degrading in relevance as memory volume grows | Tune the underlying vector database's ANN configuration, consider consolidation |
| Repeatedly re-deriving the same generalized insight from episodic memories | Implement periodic consolidation into semantic memory |
| Stored memories becoming stale/incorrect over time | Design explicit staleness-detection and update/invalidation mechanisms |
`,

  security: `
### Agent memory-specific security considerations, directly extending Agent Fundamentals and Guardrails

~~~
Long-term memory systems, particularly those storing
information about specific USERS across sessions, directly
raise genuine privacy and data-handling considerations --
stored memories may include personally identifiable
information, and retrieval mechanisms must respect
appropriate access boundaries (a memory belonging to one
user should never be retrievable in another user's context).
~~~

### Essential memory-related security practices

1. **Scope long-term memory retrieval strictly to the appropriate user/session/tenant**, never allowing cross-user memory leakage.
2. **Apply data-retention and deletion policies** to stored long-term memories, directly connecting to general privacy/compliance considerations.
3. **Treat retrieved memory content as untrusted input** for prompt-construction purposes, directly reusing the **LangChain** skill's own prompt-injection guidance — a stored memory could, in principle, contain adversarially-crafted content if the storage pathway itself was compromised.
4. **Encrypt sensitive stored memory content** at rest, directly connecting to the **Encryption** skill's own general data-protection guidance.

See **Agent Fundamentals**, **Guardrails**, and **OWASP Top 10** for the broader security context this connects to.
`,

  testing: `
### Testing short-term memory bounding

~~~python
def test_conversation_history_stays_within_bounds():
    memory = AgentMemory(vector_db, max_short_term_turns=5)
    for i in range(20):
        memory.update({"turn": i}, new_long_term_facts=[])
    assert len(memory.short_term) <= 5
~~~

### Testing long-term memory retrieval scoping

~~~python
def test_long_term_memory_is_scoped_per_user():
    store_memory_for_user("user_a", "prefers email", vector_db)
    results = retrieve_relevant_memories("contact preference", vector_db, user_id="user_b")
    assert not any("prefers email" in r for r in results)
~~~

### The senior testing doctrine

- Test short-term memory bounding explicitly, verifying it stays within configured limits regardless of conversation length.
- Test long-term memory retrieval SCOPING explicitly, verifying no cross-user/cross-session memory leakage occurs.
- Test retrieval relevance for long-term memory, directly reusing **Vector Search**'s own evaluation methodology.
- Test staleness-handling behavior, verifying an updated/invalidated memory is correctly reflected in future retrievals.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the exact context constructed for a given prompt first** (short-term history, summary, and retrieved long-term memories), directly analogous to **Agent Fundamentals**' own trajectory-tracing guidance.
2. **Check retrieval relevance specifically** if an agent's response reflects irrelevant or seemingly incorrect "memories."
3. **Check for cross-user/session memory leakage** if an agent surfaces information that shouldn't be accessible in the current context.
4. **Check summarization/truncation configuration** if genuinely important early context appears to have been lost.

### Debugging common agent-memory-related symptoms

- "The agent seems to have forgotten something from earlier in the conversation" — check truncation/summarization configuration and whether the relevant detail survived.
- "The agent references an outdated or incorrect fact" — check for stale long-term memory lacking an update/invalidation mechanism.
- "The agent surfaced information from a different user/session" — check long-term memory retrieval scoping for a leakage bug.
- "Retrieved long-term memories seem irrelevant" — debug the underlying vector database's retrieval configuration, directly reusing **Vector Search**'s own tuning guidance.
`,

  monitoring: `
### Key signals to track

- **Short-term memory size distribution**, watching for conversations frequently approaching truncation/summarization thresholds.
- **Long-term memory retrieval relevance metrics**, directly connecting to **Vector Search**'s own recall@k treatment.
- **Memory retrieval scoping correctness**, actively monitoring for any cross-user/session leakage.
- **Memory store growth rate**, watching for indiscriminate, unfiltered long-term memory accumulation.

### Tools

Vector database-specific monitoring (covered in the platform's vector database skills) for long-term memory retrieval quality; general LLM observability tools for tracing exactly what memory context was constructed for a given interaction.

### Alerting priorities

Alert on any detected cross-user/session memory retrieval (a genuine security incident), and on a significant degradation in long-term memory retrieval relevance metrics over time.
`,

  deployment: `
### A representative deployment configuration

~~~python
memory = AgentMemory(
    vector_db=production_vector_db,  # scoped per-tenant/user
                                        # at the database level
    max_short_term_turns=10,
)
~~~

### CI/CD pipeline considerations

Treat memory-management configuration (truncation thresholds, summarization triggers, retrieval top-k values) as genuine, version-controlled application configuration, with automated tests covering scoping correctness and bounded growth as a deployment gate. See the **CI/CD** skill and the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production agent memory system takes real traffic:

- [ ] Short-term memory growth explicitly bounded (truncation or summarization)
- [ ] Long-term memory uses retrieval (top-k), not full inclusion
- [ ] Long-term memory retrieval strictly scoped per user/session/tenant, with no leakage possible
- [ ] Explicit staleness-handling/update mechanism designed for long-term memory
- [ ] Retrieved memory treated as potentially incorrect, not inherently trusted
- [ ] Sensitive stored memory content encrypted at rest
- [ ] Data-retention/deletion policies applied to stored long-term memories
`,

  "common-mistakes": `
1. **Unbounded short-term context growth**, eventually exceeding the context window and incurring unnecessary cost.
2. **Treating retrieved long-term memory as inherently correct**, ignoring staleness or original-error risk.
3. **Storing everything as long-term memory indiscriminately**, bloating the vector database and degrading retrieval quality.
4. **Never consolidating episodic memories into semantic knowledge.**
5. **No staleness-handling mechanism** for long-term memory.
6. **Insufficient scoping of long-term memory retrieval**, risking cross-user/session leakage.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Agent "forgets" earlier conversation details | Aggressive truncation without adequate summarization | Implement summarization preserving key details before truncating |
| Agent references outdated/incorrect facts | No staleness-handling mechanism for long-term memory | Design explicit memory update/invalidation logic |
| Retrieved memories seem irrelevant | Poorly-tuned vector database retrieval configuration | Tune ANN parameters, reconsider embedding/chunking strategy |
| Agent surfaces another user's information | Insufficient retrieval scoping | Enforce strict per-user/session/tenant scoping at the database level |
| Vector database grows excessively large | Indiscriminate long-term memory storage without filtering | Deliberately filter what's genuinely worth persisting long-term |
| Repeated re-derivation of the same insight | No consolidation mechanism from episodic to semantic memory | Implement periodic consolidation |
`,

  faqs: `
**What is agent memory?**
The set of techniques letting an agent retain and reuse information beyond a single, isolated interaction — spanning short-term, long-term, episodic, and semantic memory.

**Why do LLM-based agents need explicit memory management?**
Because an LLM is fundamentally stateless between calls — it has no inherent memory beyond what's explicitly included in its current context window, directly connecting to LLM Fundamentals' own context-window treatment.

**What is the difference between short-term and long-term memory?**
Short-term memory is relevant within a single ongoing task/conversation; long-term memory must persist and remain retrievable across genuinely separate sessions.

**What is the difference between episodic and semantic memory?**
Episodic memory is a specific past experience/interaction; semantic memory is generalized factual knowledge, potentially consolidated from multiple episodic memories.

**How does long-term memory typically get implemented?**
Via retrieval from a vector database — storing information as embeddings and retrieving only the currently relevant subset via similarity search, directly connecting to the Vector Search skill.

**Why shouldn't I treat retrieved memory as automatically correct?**
Because a memory system faithfully retrieves whatever was stored, including any originally incorrect or since-outdated information — directly connecting to Agent Fundamentals' compounding-error risk, extended across sessions.
`,

  "interview-questions": `
### Junior level

1. **What is agent memory?**
   Model answer: techniques letting an agent retain and reuse information beyond a single interaction, spanning short-term, long-term, episodic, and semantic memory.

2. **Why do LLM-based agents need explicit memory management?**
   Model answer: LLMs are stateless between calls — they have no inherent memory beyond what's explicitly included in the current context window.

3. **What is the difference between short-term and long-term memory?**
   Model answer: short-term memory is relevant within one ongoing conversation/task; long-term memory persists across separate sessions.

4. **How is long-term memory typically implemented?**
   Model answer: via retrieval from a vector database — storing embeddings and retrieving the relevant subset via similarity search.

### Senior level

5. **Explain precisely why "just include the full conversation history" fails as a memory strategy at scale, and what specific engineering tradeoff summarization introduces to address it.**
   Model answer: including the full, ever-growing conversation history in every subsequent prompt directly runs into TWO distinct, compounding problems as a conversation lengthens — first, the model's CONTEXT WINDOW (covered in **LLM Fundamentals**) is finite, so a sufficiently long conversation will eventually exceed it entirely, making the naive approach structurally impossible past some point; second, even before hitting this hard limit, every additional token included directly increases the COST of each subsequent call (connecting to the **Inference** skill's own per-token pricing treatment), so the naive approach's cost grows roughly quadratically across a conversation (each of N turns re-sending an increasingly large history); summarization addresses BOTH concerns by periodically compressing older conversation turns into a concise summary via an ADDITIONAL model call, bounding the ongoing context size regardless of how long the conversation continues — but this introduces its own genuine tradeoff: the summarization call itself has a cost (an additional LLM call per summarization event), and summarization is inherently LOSSY — some specific, potentially relevant details from the original turns may not survive into the compressed summary, meaning summarization trades a BOUNDED, sustainable ongoing cost against a genuine, non-zero risk of losing some earlier detail's fidelity.

6. **A team's customer-support agent occasionally references a user's outdated shipping address from a stored long-term memory, despite the user having provided an updated address in a more recent interaction. Diagnose this and propose a fix.**
   Model answer: this is a direct instance of the STALENESS problem covered in this page's own advanced-concepts and best-practices sections — the long-term memory system evidently STORED the original address as a persisted fact, but has no mechanism to recognize that a MORE RECENT piece of information (the updated address) should supersede or invalidate the earlier one; simply retrieving "the most similar stored memory" via vector similarity search doesn't inherently account for RECENCY or supersession — an old and a new address could both be highly semantically similar to a query about "shipping address," with vector similarity alone providing no signal about which one is currently CORRECT; the fix requires an explicit STALENESS-HANDLING mechanism: at minimum, associating a timestamp with each stored memory and preferring more recent memories when multiple conflicting entries exist for the same fact-type/entity (directly connecting to this page's own entity-memory concept — the shipping address should be tracked as a specific FIELD on the user's entity record, with an UPDATE operation replacing the prior value entirely, rather than as an independent, undifferentiated fact competing with other facts purely on semantic similarity); more sophisticated systems might also implement explicit invalidation (marking a memory as superseded once updated information is received) rather than relying purely on recency-based preference at retrieval time.

7. **Explain the concept of memory consolidation, and design a system that periodically converts a customer-support agent's episodic memories into generalized semantic knowledge about a specific customer.**
   Model answer: memory CONSOLIDATION is the deliberate process of periodically synthesizing multiple SPECIFIC episodic memories (individual past interactions) into more GENERALIZED semantic knowledge — directly analogous to how human memory is believed to consolidate specific experiences into generalized understanding over time; for a customer-support agent, I'd design a periodic (e.g., nightly, or triggered after every N new episodic memories for a given customer) CONSOLIDATION PROCESS: retrieve all of a specific customer's recent episodic memories (individual interaction records) from the vector database, and use a dedicated model call to identify RECURRING PATTERNS across them (e.g., "this customer has asked about billing three times in the past month and has expressed frustration about response time each time" could consolidate into the semantic fact "this customer is currently experiencing billing friction and values fast responses") — storing this consolidated, generalized fact separately (in a distinct semantic-memory store, or as an updated field on the customer's entity record) so future interactions can directly retrieve this GENERALIZED insight rather than needing to re-derive it from scratch by re-examining multiple raw episodic records each time; I'd also design this consolidation process to explicitly flag genuinely LOW-CONFIDENCE generalizations (e.g., a pattern observed only once or twice) differently from well-established ones, avoiding over-generalizing from too few data points.

8. **A production agent's long-term memory retrieval occasionally surfaces information belonging to a different user. Explain the severity of this issue and design a fix that prevents it structurally, not just through application-level filtering.**
   Model answer: this represents a genuinely SEVERE security/privacy incident, not merely a quality-degradation issue — surfacing one user's stored information (which could include personally identifiable or sensitive details) within a DIFFERENT user's session represents a direct privacy violation and potential compliance failure, directly connecting to this page's own security section's guidance on strict retrieval scoping; a fix relying purely on APPLICATION-LEVEL filtering (e.g., retrieving broadly from the vector database and then filtering results by user ID in application code AFTER retrieval) is genuinely fragile — a bug in this filtering logic, or a code path that bypasses it, would directly reintroduce the leakage; the structurally sound fix is to enforce scoping at the DATABASE/STORAGE level itself — using the vector database's own native metadata-filtering or partitioning capabilities (directly connecting to the platform's vector database skills) to ensure a similarity search query for user A's context is STRUCTURALLY INCAPABLE of returning any vector belonging to user B, rather than relying on retrieving broadly and filtering correctly afterward; this could mean using separate vector-database namespaces/collections per user (for stronger isolation, at the cost of potentially more operational overhead managing many collections) or a mandatory, indexed metadata filter (e.g., user_id) applied directly within every similarity-search query itself, verified via automated tests (directly reusing this page's own testing guidance) specifically checking that a query scoped to one user never returns another user's memories under any circumstance.

9. **Compare entity memory against a general vector-database-backed episodic memory store, and explain when tracking information as structured entity memory is preferable.**
   Model answer: a general, vector-database-backed EPISODIC memory store treats each stored memory as a relatively unstructured, semantically-searchable "fact" or "past experience," retrieved via similarity to a current query — well-suited to genuinely diverse, open-ended past experiences where there's no fixed, predictable structure to the information; ENTITY MEMORY, by contrast, explicitly tracks STRUCTURED facts about SPECIFIC, named entities (a particular customer, product, or organization) as fields on a structured record — e.g., a customer entity with explicit \`preferred_contact_method\`, \`shipping_address\`, and \`account_tier\` fields; entity memory is genuinely preferable specifically when the information in question has a PREDICTABLE, STRUCTURED shape and a clear notion of a SINGLE current value that should be UPDATED (not merely accumulated) as new information arrives — the shipping-address staleness scenario from an earlier interview question is a canonical example: modeling this as an explicit entity field with clean UPDATE semantics directly avoids the staleness/supersession ambiguity that arises when treating it as just another semantically-searchable episodic fact competing on similarity alone; general episodic memory remains the better fit for genuinely open-ended, non-structured past experiences (e.g., "the general sentiment and content of a past conversation") that don't map cleanly onto a fixed set of structured entity fields.

10. **Design a memory architecture for a coding assistant that should remember a user's project-specific conventions (e.g., preferred naming style, testing framework) across many separate coding sessions, while also correctly forgetting outdated conventions if the user's project migrates to a new framework.**
    Model answer: I'd model project-specific conventions as ENTITY MEMORY scoped to the specific PROJECT (analogous to a customer entity in the earlier examples, but keyed by project rather than by customer) — explicit structured fields like \`testing_framework\`, \`naming_convention\`, and similar, rather than as loosely-structured episodic memories competing purely on semantic similarity; each field would have clean UPDATE semantics — when the assistant detects (or the user explicitly states) that the project has migrated to a new testing framework, this directly OVERWRITES the \`testing_framework\` field's prior value rather than merely adding a new, competing "memory" alongside the old one, directly avoiding the same staleness/supersession ambiguity covered in the shipping-address example; I'd also design an explicit DETECTION mechanism for recognizing when a stored convention may have become outdated — for example, if the assistant observes the user's actual code repeatedly using a DIFFERENT testing framework than what's stored in entity memory across several separate sessions, this discrepancy should trigger either an automatic update (if confidence is high) or an explicit prompt to the user confirming whether the stored convention should be updated (a human-in-the-loop check, directly connecting to **Agent Fundamentals**' own autonomy-calibration guidance, appropriate here since silently overwriting a user's established preference based on an assistant's own inference carries some genuine risk of getting it wrong) — rather than either rigidly trusting a potentially-outdated stored convention indefinitely, or naively overwriting it on a single, possibly-anomalous observation.
`,

  "coding-questions": `
### 1. Implement a sliding-window truncation memory strategy

~~~python
def truncate_memory(history, max_turns):
    max_messages = max_turns * 2  # user + assistant per turn
    if len(history) > max_messages:
        return history[-max_messages:]
    return history
# Follow-up: what genuine information-loss risk does this
# simple approach carry compared to a summarization strategy?
~~~

### 2. Implement retrieval-scoped long-term memory

~~~python
def store_memory(user_id, fact, vector_db):
    embedding = embed(fact)
    vector_db.upsert(embedding, metadata={"user_id": user_id, "fact": fact})

def retrieve_scoped_memories(user_id, query, vector_db, k=5):
    query_embedding = embed(query)
    return vector_db.similarity_search(
        query_embedding, k=k, filter={"user_id": user_id}  # structural
                                                              # scoping, not
                                                              # post-hoc filtering
    )
# Follow-up: why is applying the user_id filter WITHIN the
# similarity_search call itself more secure than retrieving
# broadly and filtering results afterward in application code?
~~~

### 3. Implement a simple entity-memory update mechanism

~~~python
def update_entity_field(entity_id, field, new_value, entity_store, timestamp):
    entity_store.setdefault(entity_id, {})
    entity_store[entity_id][field] = {"value": new_value, "updated_at": timestamp}

def get_entity_field(entity_id, field, entity_store):
    return entity_store.get(entity_id, {}).get(field, {}).get("value")
# Follow-up: how does this structured-update approach avoid
# the staleness/supersession ambiguity that a purely
# similarity-based episodic memory store would face?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement a summarization-based short-term memory strategy
Build a conversation system that summarizes older turns once a threshold is exceeded, verifying bounded context growth across an extended conversation. Deliverable: a working, tested summarization memory strategy. Skills exercised: basic short-term memory management.

### Lab 2 (Intermediate): Implement a retrieval-based, user-scoped long-term memory system
Build a long-term memory system using a vector database, verifying retrieval is strictly scoped per user with no cross-user leakage. Deliverable: a working, tested scoped long-term memory system. Skills exercised: applied retrieval-based memory and security scoping.

### Lab 3 (Advanced): Implement entity memory with staleness handling
Build an entity-memory system tracking structured facts about specific entities, with explicit update semantics correctly superseding outdated values. Deliverable: a working, tested entity-memory system demonstrating correct staleness handling. Skills exercised: applied entity-memory design.

### Lab 4 (Production): Implement episodic-to-semantic memory consolidation
Build a system that periodically consolidates multiple episodic memories about a specific entity into a generalized semantic fact. Deliverable: a working, tested consolidation pipeline with a documented example. Skills exercised: applied memory consolidation design.
`,

  "real-projects": `
### 1. A personal AI assistant with hybrid short-term/long-term memory
Engineering requirements: summarization-based short-term memory, retrieval-based long-term memory strictly scoped per user, and entity memory for structured user preferences.

### 2. A customer-support agent with staleness-aware entity memory
Engineering requirements: structured entity fields (contact preference, shipping address) with clean update semantics, and explicit staleness-detection triggers.

### 3. A coding assistant remembering project-specific conventions
Engineering requirements: project-scoped entity memory, discrepancy detection between stored conventions and observed code, and human-in-the-loop confirmation for uncertain updates.
`,

  "case-studies": `
### The evolution from naive full-history inclusion toward deliberate memory engineering
Early LLM applications' simple approach of re-including full conversation history directly ran into context-window and cost limitations as usage scaled, directly motivating the field's progression toward deliberate summarization, truncation, and retrieval-based strategies — a genuine, accumulated-experience-driven maturation directly paralleling similar evolutions covered in the **LangChain** skill's own LCEL case study. Lesson: a simple, naive approach ("just include everything") often works fine at small scale but reveals genuine structural limitations as usage grows, motivating deliberate engineering investment specifically once those limitations become concretely costly.

### The convergence on retrieval-based long-term memory across frameworks
Despite their otherwise quite different design philosophies (**LangChain**'s general-purpose abstractions, **CrewAI**'s role-based framing, the **OpenAI Agents SDK**'s minimalism), essentially every major agent framework converged on a broadly similar retrieval-based approach (a vector database, similarity search, top-k relevant retrieval) for implementing long-term memory. Lesson: when multiple independently-designed systems converge on a similar solution to a shared subproblem, this convergence itself is a strong signal that the approach (here, retrieval-based memory) reflects a genuinely sound, close-to-optimal solution for the underlying constraint (a finite context window combined with a need for memory exceeding what fits within it).
`,

  comparisons: `
| Aspect | Short-Term (Working) Memory | Long-Term Memory |
|--------|-------------------------------------|--------------------------|
| Scope | Within a single ongoing task/conversation | Across genuinely separate sessions |
| Typical implementation | In-context (recent turns + summary) | Retrieval from a vector database |
| Growth management | Truncation or summarization | Selective retrieval (top-k), not full inclusion |

| Aspect | Episodic Memory | Semantic Memory |
|--------|------------------------|--------------------------|
| Content | A specific past experience/interaction | Generalized, extracted factual knowledge |
| Derivation | Directly stored as it occurs | Often consolidated from multiple episodic memories |
| Best fit | Recalling a specific past event | Applying a general, learned pattern |

**How seniors choose**: use short-term memory (bounded via truncation/summarization) for within-conversation context; use retrieval-based long-term memory for cross-session persistence; use entity memory for structured, updatable facts about specific entities; consider periodic consolidation to convert recurring episodic patterns into reusable semantic knowledge.
`,

  "related-technologies": `
- **LLM Fundamentals** — the context-window constraint every memory-management strategy directly addresses.
- **Vector Search**, and the vector database skills — the retrieval mechanism underlying most practical long-term memory implementations.
- **Agent Fundamentals** — the compounding-error risk memory systems can propagate across sessions.
- **LangChain**, **CrewAI**, **OpenAI Agents SDK** — the frameworks whose own memory/session abstractions directly implement the general concepts covered on this page.
- **Planning** — covered next in this category, often directly leveraging memory (both short-term and long-term) to inform iterative planning decisions.

Learning path: **Agent Fundamentals** → the framework skills (**LangChain** through **AutoGen**) → this page (Agent Memory) → **Planning** → **Reflection** → **Tool Calling** → **MCP**.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued growth of sophisticated memory architectures explicitly distinguishing episodic and semantic memory, with active research and practical interest in effective consolidation mechanisms.
- Continued convergence on retrieval-based approaches for long-term memory across major agent frameworks.
- Growing attention to memory-related privacy/security practices (strict per-user scoping, data-retention policies) as agent applications handling genuinely long-term, cross-session user relationships become more common.
- Given continued, active development in this space, verify current best-practice recommendations against up-to-date framework-specific documentation.
`,

  "future-roadmap": `
Where agent memory is heading, and what's worth betting career time on:

- **Continued maturity of consolidation mechanisms** (episodic-to-semantic generalization) as a recognized, standard architectural component rather than an advanced, rarely-implemented technique.
- **Continued growth of structured entity memory** alongside general vector-retrieval-based episodic memory, for information genuinely benefiting from clean update/supersession semantics.
- **Continued emphasis on memory-related privacy/security practices** as a first-class production concern.
- **What to bet on**: deeply understanding the general principles of memory-type selection (short-term vs. long-term, episodic vs. semantic, entity vs. general), staleness handling, and strict retrieval scoping — these transfer directly across any specific framework's own memory/session implementation.
`,

  "cheat-sheet": `
~~~
# ---- Memory types ----
Short-term (working): within ONE conversation/task
Long-term:             persists ACROSS sessions (vector DB retrieval)
Episodic:               a SPECIFIC past experience
Semantic:               GENERALIZED knowledge (often consolidated)
Entity:                 structured facts about a specific entity
~~~

~~~
# ---- Why memory management is necessary ----
LLMs are STATELESS between calls (LLM Fundamentals).
Naive "include full history" -> context-window limit +
    growing cost. Must deliberately manage what's retained.
~~~

~~~
# ---- Short-term strategies ----
Truncation (sliding window):  simple, loses early detail
Summarization:                extra LLM call, preserves gist
~~~

~~~
# ---- Long-term: retrieval, not full inclusion ----
store: embed(fact) -> vector_db.upsert(..., metadata={user_id})
retrieve: vector_db.similarity_search(query, k=N,
                                        filter={user_id})
# ALWAYS scope filter WITHIN the query -- never post-hoc!
~~~

~~~
# ---- Non-negotiables ----
Retrieved memory is NOT automatically correct (staleness,
    original hallucination) -- Agent Fundamentals' compounding
    error risk, extended across sessions.
Entity memory needs UPDATE semantics, not just append.
Consolidate recurring episodes -> semantic facts periodically.
Strict per-user/session scoping -- cross-user leakage = security incident.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Why do agents need explicit memory management? | LLMs are stateless between calls — only what's in context is "remembered." |
| Short-term vs. long-term memory? | Within one task/conversation vs. persisting across separate sessions. |
| Episodic vs. semantic memory? | A specific past experience vs. generalized, often-consolidated knowledge. |
| Two short-term strategies? | Truncation (sliding window) and summarization. |
| How is long-term memory typically implemented? | Retrieval (top-k similarity search) from a vector database. |
| Why isn't retrieved memory automatically correct? | It faithfully returns whatever was stored — including stale or hallucinated facts. |
| What is entity memory good for? | Structured facts about a specific entity needing clean UPDATE (not append) semantics. |
| What is memory consolidation? | Periodically synthesizing episodic memories into generalized semantic facts. |
| Why scope retrieval filters WITHIN the query, not post-hoc? | Post-hoc filtering is fragile — a bug or bypass reintroduces cross-user leakage. |
| Biggest security risk in long-term memory? | Cross-user/session memory leakage — a genuine privacy incident. |
`,

  mcqs: `
1. Why do LLM-based agents require explicit memory management?
   A) LLMs remember everything automatically  B) LLMs are stateless between calls — only information explicitly in the context window is available  C) Memory is only needed for tool use  D) It's purely a UI concern
   **Answer: B** — directly connecting to LLM Fundamentals' context-window treatment.

2. What is the key difference between episodic and semantic memory?
   A) They are identical  B) Episodic is a specific past experience; semantic is generalized knowledge, often consolidated from episodes  C) Semantic memory only applies to code  D) Episodic memory doesn't use vector databases
   **Answer: B** — a foundational memory-type distinction.

3. Why is retrieval (top-k similarity search) preferred over full inclusion for long-term memory?
   A) Retrieval is always less accurate  B) Full inclusion of all long-term memory would violate context-window limits and increase cost unnecessarily  C) Retrieval doesn't require a vector database  D) There's no difference in practice
   **Answer: B** — directly connecting to Vector Search's own efficiency principles.

4. Why should retrieved long-term memory NOT be treated as automatically correct?
   A) Vector databases are inherently unreliable  B) A memory system faithfully retrieves whatever was stored, including stale or originally incorrect information  C) Retrieval always returns random results  D) This is not a genuine concern
   **Answer: B** — directly extending Agent Fundamentals' compounding-error risk across sessions.

5. Why must long-term memory retrieval scoping be enforced at the database/query level rather than via post-hoc application-code filtering?
   A) It doesn't matter which layer enforces it  B) Post-hoc filtering is fragile — a bug or bypassed code path could reintroduce cross-user memory leakage, a genuine security incident  C) Database-level filtering is always slower  D) Post-hoc filtering is always more secure
   **Answer: B** — a structural, not merely incidental, security guarantee.
`,

  "revision-notes": `
Agent memory is the set of techniques letting an agent retain and reuse information beyond a single, isolated interaction, directly addressing the fact that LLMs are fundamentally STATELESS between calls (connecting to **LLM Fundamentals**' own context-window treatment) — only information explicitly included in the current prompt is available to the model. Memory spans four key types: SHORT-TERM (working) memory (relevant within one ongoing task/conversation), LONG-TERM memory (must persist and remain retrievable across genuinely separate sessions, typically via retrieval from a vector database, directly connecting to **Vector Search**), EPISODIC memory (a specific past experience/interaction), and SEMANTIC memory (generalized factual knowledge, often CONSOLIDATED from multiple episodic memories over time).

Short-term memory management requires explicit BOUNDING strategies, since naively including the full, ever-growing conversation history directly runs into the context-window limit AND increases cost with every additional token — TRUNCATION (a sliding window keeping only recent turns, simple but lossy of early detail) and SUMMARIZATION (an additional model call compressing older turns into a concise summary, preserving more gist at the cost of an extra call) are the two primary strategies, directly mirrored in **LangChain**'s own buffer/summary memory abstractions.

Long-term memory is standardly implemented as RETRIEVAL — storing information as embeddings in a vector database and retrieving only the top-k currently RELEVANT subset via similarity search (directly reusing **Vector Search**'s own ANN mechanics), rather than ever fully including an agent's entire history. A critical, frequently-tested security detail: retrieval SCOPING (e.g., filtering by user_id) must be enforced STRUCTURALLY, WITHIN the similarity-search query itself — not via post-hoc application-code filtering after a broad retrieval — since the latter is fragile and a single bug could reintroduce genuine cross-user memory leakage, a serious privacy/security incident.

ENTITY MEMORY tracks structured facts about specific, named entities (a customer, project, or organization) as fields with clean UPDATE (not merely append) semantics — directly preferable over general episodic memory specifically when information has a predictable structure and a clear single "current value" that should be overwritten (e.g., a shipping address or a testing-framework preference), avoiding the STALENESS/supersession ambiguity that arises when conflicting facts merely compete on semantic similarity within an undifferentiated episodic store.

A genuinely important, frequently-tested principle is that RETRIEVED MEMORY IS NOT AUTOMATICALLY CORRECT — a memory system faithfully retrieves whatever was originally stored, whether it was accurate at the time, has since become STALE, or was even a hallucinated conclusion to begin with, directly extending **Agent Fundamentals**' own COMPOUNDING HALLUCINATION RISK concept across sessions rather than within a single agent loop. This motivates explicit staleness-handling/update mechanisms rather than treating stored memory as permanently, uniformly valid.

MEMORY CONSOLIDATION is the deliberate, explicit process (typically its own dedicated model call) of synthesizing multiple specific episodic memories into more generalized SEMANTIC knowledge — this doesn't happen automatically or for free, and a system that never consolidates will either repeatedly re-derive the same insight or never capture it as a reusable, generalized fact at all.

A senior AI engineer chooses the appropriate memory type deliberately for each category of information an agent handles, bounds short-term memory growth explicitly, uses retrieval (never full inclusion) for long-term memory, enforces strict, structural per-user/session scoping, designs explicit staleness-handling mechanisms, treats retrieved memory as potentially incorrect, and considers periodic consolidation — this foundational, framework-independent understanding directly applies across every specific framework's own memory/session implementation (**LangChain**, **CrewAI**, the **OpenAI Agents SDK**) and directly sets up the platform's remaining capability-focused skills: **Planning**, **Reflection**, **Tool Calling**, and **MCP**.
`,

  "learning-roadmap": `
**Week 1 — Short-term memory**: implementing a summarization-based strategy bounding conversation context growth. Milestone: complete Lab 1, with verified bounded growth across an extended conversation.

**Week 2 — Retrieval-based long-term memory**: building a vector-database-backed, user-scoped long-term memory system. Milestone: complete Lab 2, with verified retrieval scoping and no cross-user leakage.

**Week 3 — Entity memory**: implementing structured entity memory with correct staleness/update handling. Milestone: complete Lab 3, demonstrating correct supersession of outdated values.

**Week 4 — Consolidation**: building a pipeline periodically consolidating episodic memories into generalized semantic facts. Milestone: complete Lab 4, with a documented consolidation example.

Next platform skill once this roadmap is complete: **Planning**, covering task decomposition and reasoning strategies that often directly leverage the memory concepts covered on this page.
`,

  "official-docs": `
- **LangChain's memory documentation** — buffer, summary, and entity memory abstractions directly implementing the general concepts covered on this page.
- **CrewAI's memory documentation** — its own short-term/long-term/entity memory distinction.
- **The OpenAI Agents SDK's Sessions documentation** — built-in multi-turn conversation-state management.
`,

  books: `
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — relevant general background on data storage, retrieval, and consistency tradeoffs applicable to long-term memory system design.
- Given the specific "agent memory" framing's relative recency, framework-specific documentation and research papers remain the most current, authoritative references for cutting-edge techniques.
`,

  blogs: `
- **Framework-specific blogs (LangChain, CrewAI)** covering memory-abstraction design and best practices.
- **Community writing on RAG-based long-term memory implementations**, directly connecting to the **Vector Search** skill's own practical guidance.
`,

  "research-papers": `
- **General cognitive-science literature on episodic versus semantic memory** provides useful conceptual background, though applied here in an engineering (not literal neuroscience) context.
- Ongoing research into agent memory consolidation and long-horizon agent memory architectures continues to actively develop; consult current publications for the latest techniques.
`,

  videos: `
- **Framework-specific tutorials (LangChain, CrewAI, OpenAI Agents SDK)** on implementing memory/session management.
- **Conference talks on long-running, memory-persistent agent architectures** from major AI engineering conferences.
`,

  "github-repos": `
- **langchain-ai/langchain** — includes reference implementations of buffer, summary, and entity memory.
- **crewAIInc/crewAI** — includes its own short-term/long-term/entity memory implementation.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Memory-type selection**: given a described piece of information an agent encounters, decide the appropriate memory type (short-term, episodic, semantic, entity).
2. **Staleness-handling design**: given a described scenario with conflicting stored facts, design an appropriate update/supersession mechanism.
3. **Retrieval-scoping security review**: given a described memory retrieval implementation, identify whether scoping is enforced structurally or vulnerable to post-hoc-filtering bugs.
4. **Consolidation design**: given a described set of recurring episodic memories, design a consolidation process producing an appropriate generalized semantic fact.
5. **External practice sets**: LangChain's and CrewAI's own official memory-focused tutorials for hands-on practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph MemoryTypes["Memory Types"]
        ShortTerm["Short-term (working)"]
        LongTerm["Long-term (vector DB)"]
        Episodic["Episodic"]
        Semantic["Semantic"]
        Entity["Entity"]
    end
    subgraph Management["Management Strategies"]
        Truncation["Truncation"]
        Summarization["Summarization"]
        Retrieval["Top-k Retrieval"]
        Consolidation["Consolidation"]
    end
    subgraph Safety["Safety & Scoping"]
        Staleness["Staleness Handling"]
        Scoping["Per-user/session Scoping"]
    end
    ShortTerm --> Truncation
    ShortTerm --> Summarization
    LongTerm --> Retrieval
    Episodic --> Consolidation
    Consolidation --> Semantic
    LongTerm --> Safety
    Entity --> Staleness
~~~
`,

  "mind-map": `
~~~mindmap
  root((Agent Memory))
    Foundations
      Overview
      History
      Why it exists LLM statelessness
      Problem it solves
    Memory Types
      Short term working
      Long term
      Episodic
      Semantic
      Entity
    Short Term Strategies
      Truncation
      Summarization
    Long Term Strategies
      Vector database retrieval
      Top k relevance
      Scoping security
    Staleness and Consolidation
      Update semantics
      Episodic to semantic
      Recency weighting
    Security
      Cross user leakage
      Encryption at rest
      Retention policies
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default agentMemory;
