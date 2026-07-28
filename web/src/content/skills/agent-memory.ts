import type { SkillContent } from "../types";

/**
 * Agent Memory -- full 50-section knowledge page.
 * This is the sibling skill in the AI Agents category focused specifically on
 * how an agent retains information across turns, steps, and sessions. It
 * assumes the perceive-plan-act-observe loop from Agent Fundamentals and goes
 * deep on the one component that page treats only at a high level: the
 * memory/transcript store.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const agentMemory: SkillContent = {
  overview: `
Agent memory is the set of mechanisms that let an agent carry information forward -- within a single run, across multiple runs, and across sessions separated by days or months -- so it does not have to relearn or re-discover the same facts every time it is invoked. Mechanically, an LLM itself has no persistent memory at all: every call is stateless, and the only "memory" that exists is whatever text happens to be included in that call's context window. Everything this page covers is, at bottom, an engineering answer to one question: given that the model itself remembers nothing between calls, what do we put back into the prompt, from where, and when, so the agent behaves as if it remembers.

This distinction matters enormously for an AI engineer. It is tempting to think of memory the way a human would -- a agent "recalls" something the way a person recalls a childhood event -- but the underlying mechanism is always some combination of: keeping recent conversation text in the prompt (short-term/working memory), retrieving relevant past text from an external store and inserting it into the prompt (long-term memory via retrieval), and compressing or summarizing older text so it takes fewer tokens while preserving the gist (memory compression). There is no fourth option. Every memory architecture you will encounter in a framework or a paper is a variation on how these three techniques are combined, triggered, and tuned.

Agent memory sits at the intersection of several sibling skills on this platform. It assumes the loop described in **Agent Fundamentals** (the transcript that grows every iteration is exactly what memory management operates on). It depends heavily on **Vector Search** and **Embeddings** for the long-term, retrieval-backed half of the picture. It is a close cousin of **RAG**, which solves a structurally similar problem (fetch relevant text, insert it into the prompt) but for external documents rather than an agent's own history. And it interacts directly with **Planning** (a plan is itself a piece of memory the agent must not lose track of) and **Reflection** (a self-critique is only useful if it is remembered on the next attempt). Agent memory is not a solved problem -- there is no consensus "best" architecture, and this page will say so plainly wherever the field is still genuinely unsettled, rather than presenting one company's blog post as the final answer.

Key characteristics worth internalizing up front: memory is always a tradeoff between recall (did we keep the fact we needed) and cost/latency (every token of memory included in a prompt is a token billed and a token that competes with everything else for the model's attention); memory can go stale or become contradictory in ways a single-shot system never has to worry about, because a long-lived agent accumulates facts over time that can become outdated or conflict with newer information; and the choice of what to write to memory, when, and how to retrieve it later is an explicit design decision an AI engineer must make -- it is never automatic, and getting it wrong is one of the most common causes of a "smart" agent behaving in confusing, inconsistent ways over a long-running deployment.
`,

  history: `
The idea of an agent that remembers is older than LLMs -- classical AI planning systems and cognitive architectures (SOAR, ACT-R, and similar research programs) built explicit models of working memory, episodic memory, and long-term declarative memory decades before language models existed, largely borrowing vocabulary directly from cognitive psychology. That vocabulary -- episodic, semantic, procedural -- is exactly the vocabulary this page still uses, because it turned out to map surprisingly well onto the practical problem LLM agents face, even though the underlying implementation (vector embeddings and prompt injection, rather than symbolic frames) is completely different.

| Year | Milestone |
|------|-----------|
| Pre-2020 | Cognitive-architecture research (SOAR, ACT-R) and classical AI planning establish the episodic/semantic/procedural memory vocabulary, independent of LLMs |
| 2020-2022 | Early LLM chat applications hit the context-window wall directly: once a conversation grew long enough, older turns had to be dropped or truncated, since there was no other mechanism to retain them |
| 2022 | Retrieval-augmented approaches (embeddings plus a vector store, as covered in **RAG** and **Vector Search**) are adapted specifically to store and retrieve an agent's own past interactions, not just external documents -- the direct ancestor of modern long-term agent memory |
| 2023 | A wave of "generative agents" research (simulated agents with a memory stream that records observations, reflects on them periodically, and retrieves relevant memories for planning) popularizes explicit memory architecture as a distinct design problem from prompting or tool use |
| 2023-2024 | Memory-management libraries and frameworks emerge as standalone components (rather than being hand-rolled per project), offering conversation summarization, vector-backed long-term stores, and configurable write/read policies as reusable building blocks |
| 2024-2025 | Larger context windows across major providers reduce, but do not eliminate, the pressure for aggressive summarization within a single session -- while making cross-session, cross-user memory (which no context window, however large, naturally solves) the more actively contested design problem |

This page describes durable concepts, not a fixed ranking of memory frameworks or providers -- which library or pattern is considered best practice shifts with nearly every product cycle, and this is one of the least settled areas across the whole agent stack. Check **Latest Updates** below, and the framework-specific sibling skills (**LangChain**, **LangGraph**), for what is current when you read this.
`,

  "why-it-exists": `
Before any deliberate memory engineering, an LLM-backed agent has exactly one form of memory: whatever fits in the current call's context window. This is workable for a short interaction but breaks down along two independent axes as soon as an agent is asked to do anything nontrivial. First, within a single long-running task, the transcript of thoughts, tool calls, and observations described in **Agent Fundamentals** grows every iteration, and eventually either exceeds the context window outright or crowds out earlier, still-relevant information even before hitting the hard limit -- a problem entirely internal to one run. Second, across separate runs or sessions -- a user returning tomorrow, a new conversation with the same customer, a long-lived autonomous agent picking up where it left off -- there is no context window connecting one call to the next at all; whatever the model "knew" from a previous session is gone unless something external explicitly carried it forward.

The gap agent memory fills: a deliberate, engineered layer between the raw context window and the agent's actual information needs, so that (a) a single long run does not silently lose track of what it already learned, and (b) information that should persist across sessions actually does, without simply re-sending the entire history of everything that ever happened, which would be both prohibitively expensive and, past a certain point, physically impossible regardless of cost.

The technical condition that made a rich long-term memory practical, rather than merely a truncated recent-history buffer, was the maturation of embeddings and vector similarity search (see **Embeddings** and **Vector Search**): once arbitrary text could be converted into a vector and compared for semantic similarity cheaply and at scale, it became possible to store a large, growing history of an agent's past interactions and retrieve only the handful of pieces that are actually relevant to the current situation, rather than being forced to choose between "keep everything" (impossible) and "keep only the most recent N turns" (loses anything older, regardless of relevance).
`,

  "problem-it-solves": `
Agent memory solves the problem of an agent needing to act on information that is not present in, and cannot reasonably be squeezed into, the current call's context window. Concrete pains removed:

- **Multi-turn coherence within a single conversation.** Without any memory management, a long conversation eventually either gets truncated (the agent "forgets" what was said early on) or blows the context window budget entirely; a short-term memory strategy (see Beginner Concepts) keeps the conversation coherent within realistic token limits.
- **Continuity across sessions.** A returning user should not have to re-explain their preferences, prior requests, or established facts every single time; long-term memory lets an agent retrieve relevant facts from prior sessions without resending the entire prior history.
- **Avoiding repeated mistakes or repeated work.** An agent that remembers a past failure (this approach did not work, this tool call errored on this kind of input) can avoid repeating it; an agent with no memory of its own past attempts has no mechanism to learn from them, even within the same task.
- **Managing unboundedly growing context cheaply.** Summarization and compression let an agent retain the gist of a long history at a small fraction of the token cost of the raw transcript, which is the only way to keep both cost and latency bounded as interactions accumulate.

What agent memory deliberately does **not** solve, and should not be expected to:

- **Perfect, lossless recall of everything that ever happened.** Summarization is lossy by construction, and retrieval is probabilistic -- a relevant memory can simply fail to be retrieved if it is not phrased similarly enough to the query, exactly as with any retrieval system (see **RAG** and **Vector Search** for the shared retrieval-quality caveats).
- **Automatic correctness or freshness of stored facts.** A memory system will happily retrieve and present a stale or since-contradicted fact with the same confidence as a current one unless the write and read policies explicitly account for staleness -- see Failure Modes below.
- **A substitute for a large enough context window when the task genuinely needs to reason over all of the information at once** (e.g. comparing every line of a long document against every other line) -- retrieval-based memory surfaces the pieces it judges most relevant, not the totality, and is a poor fit for tasks that require true exhaustive recall rather than relevant-fact recall.
- **Privacy or compliance for free.** Persisting information across sessions, especially anything touching personally identifiable information, is a deliberate data-retention decision with real legal and security implications, not a side effect you get to ignore because "the framework handles memory" -- see Security and Privacy below.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, precisely, why an LLM has no memory of its own and why every form of "agent memory" is actually an engineering pattern for deciding what text to put back into the next prompt.
2. Distinguish short-term (in-context conversation buffer) memory from long-term (externally stored, retrieval-backed) memory, and state when each is the right tool.
3. Distinguish episodic, semantic, and procedural memory conceptually, and give a concrete example of each in an agent system.
4. Design a summarization/compression strategy for a growing conversation or transcript, and explain the information-loss tradeoff it makes.
5. Design explicit write and read policies for a long-term memory store: what gets written, when, and how it is retrieved and re-ranked at read time.
6. Explain the fundamental tension between memory richness and context-window cost/latency, and reason quantitatively about when adding more retrieved memory stops helping.
7. Name and explain at least four agent-memory-specific failure modes (stale memory, contradictory memory, unbounded growth, privacy/PII leakage) with a concrete example of each.
8. Implement a basic long-term memory store backed by vector similarity search, including a summarization-based compaction step, from scratch.
9. Map agent memory's relationship to the sibling skills (**Agent Fundamentals**, **Vector Search**, **Embeddings**, **RAG**, **Planning**, **Reflection**, **Tool Calling**, **LangGraph**) and explain what each one assumes memory already provides.
10. Evaluate whether a given production agent's memory design is likely to cause real incidents (stale facts driving wrong decisions, unbounded storage cost, PII retention risk) before it ships.
`,

  prerequisites: `
- **Required**: a solid grasp of **Agent Fundamentals** -- this page assumes you already understand the perceive-plan-act-observe loop and the fact that the transcript it produces grows every iteration; agent memory is the engineering discipline built specifically around managing that growth and extending it across runs.
- **Required**: **LLM Fundamentals**, specifically the concepts of tokens and the context window -- every argument in this page about cost, truncation, and the tension between memory and latency reduces to token-budget arithmetic covered there.
- **Strongly recommended before this page**: **Embeddings** and **Vector Search** -- long-term memory, as implemented in essentially every production system, is retrieval over embedded text, and this page will not re-derive how embeddings or approximate nearest-neighbor search work; it assumes you already have that foundation and focuses on how it is applied specifically to an agent's own history.
- **Helpful**: a first pass over **RAG**, since long-term agent memory and RAG solve structurally similar problems (retrieve relevant text, insert it into the prompt) and share almost all of their failure modes and evaluation techniques, differing mainly in what is being retrieved (an agent's own past interactions versus external documents).
- **Helpful**: basic Python and familiarity with calling an embeddings API and a vector store, if you want to reproduce the worked example in this page yourself.
- **Not required**: prior experience with any specific memory framework or product. This page is framework-agnostic and builds a from-scratch memory store before naming any library, so the concepts are not confused with one library's particular API.

Dependency links: **LLM Fundamentals** and **Agent Fundamentals** -> this page (**Agent Memory**) -> feeds directly into **Planning** (a plan is memory that must not be lost), **Reflection** (a self-critique is only useful if remembered), and the framework skills (**LangChain**, **LangGraph**) that provide memory components off the shelf. **Embeddings** and **Vector Search** are load-bearing prerequisites for the long-term-memory half of this page, and **RAG** is the closest sibling skill in terms of shared technique and shared failure modes.
`,

  "beginner-concepts": `
### There is no such thing as model memory

Start from the mechanical fact: an LLM API call is stateless. Send the same prompt twice and, modulo sampling randomness, you get an independent completion each time -- the model retains nothing from the first call when processing the second. Anything that looks like "the agent remembers" is, without exception, some text that was put back into the prompt by application code. This is the single most important fact in this entire skill, because it means every memory technique below is really a question about what text goes into the next prompt, from where, and why.

~~~text
Call 1: prompt = "My name is Priya. What's 2+2?"      -> completion: "4"
Call 2: prompt = "What's my name?"                     -> completion: model
   has NO idea -- "Priya" was never included in this
   second call's prompt at all.

Call 2 (fixed): prompt = "Earlier, the user said their
   name is Priya. What's my name?"                      -> completion: "Priya"
   -- this only worked because the application code
   explicitly re-included the fact in the new prompt.
~~~

### Short-term memory: the conversation buffer

The simplest and most common form of memory is the conversation buffer: literally keep the recent turns of a conversation (or the recent steps of an agent's transcript, per **Agent Fundamentals**) and resend them, in full, as part of every new call's prompt. This is short-term or "working" memory -- it lives entirely within the current context window, has no persistence beyond it, and disappears the moment the session ends unless something else captures it.

~~~python
# The simplest possible short-term memory: a growing list of turns,
# resent in full on every call. Fine for short conversations; breaks
# down once the buffer approaches the model's context window limit.

class ConversationBuffer:
    def __init__(self):
        self.turns = []  # list of (role, text) tuples

    def add(self, role: str, text: str) -> None:
        self.turns.append((role, text))

    def as_prompt_messages(self) -> list:
        # Every single call resends the ENTIRE buffer -- this is the
        # part that eventually becomes a cost and context-window problem.
        return [{"role": role, "content": text} for role, text in self.turns]

buffer = ConversationBuffer()
buffer.add("user", "My name is Priya.")
buffer.add("assistant", "Nice to meet you, Priya.")
buffer.add("user", "What's my name?")
# call_llm(buffer.as_prompt_messages()) would now correctly answer "Priya"
# because the fact is physically present in this call's prompt.
~~~

### Long-term memory: retrieval instead of resending everything

Once a history grows too large to resend in full, the alternative is not "forget everything past a cutoff" but "store everything, and retrieve only what is relevant to the current situation." This is long-term memory: past interactions are embedded (see **Embeddings**) and stored in a vector store (see **Vector Search**), and at read time the current query is embedded and compared against stored memories to find the handful that are actually relevant, which are then inserted into the prompt -- exactly the retrieval half of a **RAG** pipeline, applied to an agent's own history instead of external documents.

~~~text
Session 1 (weeks ago): user mentions "I'm allergic to shellfish."
  -> written to long-term memory as a fact, embedded and stored.

Session 2 (today): user asks "Can you recommend a restaurant?"
  -> query embedded, compared against stored memories
  -> the shellfish-allergy fact is retrieved as relevant (even though
     the current message never mentions allergies) and inserted into
     the prompt, so the recommendation can account for it.
~~~

### Memory compression: keeping the gist without the tokens

The third basic technique is compression: rather than keeping raw text (whether in a short-term buffer or a long-term store), periodically summarize older content into a much shorter form that preserves the important gist while discarding token-expensive detail. A summary of ten turns might cost a tenth of the tokens of the raw ten turns, at the cost of losing whatever detail the summarization step judged unimportant -- an explicit, lossy tradeoff, not a free win.
`,

  "intermediate-concepts": `
### Episodic, semantic, and procedural memory

Borrowing the vocabulary cognitive-architecture research established decades before LLMs (see History), it is useful to distinguish three kinds of content an agent might remember, because each has a different natural storage shape and a different read pattern:

- **Episodic memory** -- records of specific past events or interactions ("on March 3rd, the user asked about their refund and it was denied"). Episodic memories are naturally timestamped, tied to a specific occasion, and typically retrieved because the current situation resembles a past one.
- **Semantic memory** -- general facts, independent of when or how they were learned ("the user is allergic to shellfish", "the user's preferred name is Priya", "our refund policy allows returns within 30 days"). Semantic memories are naturally stored as standalone facts, not as an episode, and are retrieved because they are relevant to the current topic regardless of when they were established.
- **Procedural memory** -- knowledge of how to do something, typically learned from past successes or failures ("when this API returns a 429, wait and retry rather than treating it as a permanent failure", "for this kind of user request, always confirm the amount before executing a refund"). Procedural memories are naturally stored as rules or lessons, and are retrieved when the agent is about to take an action of the relevant kind.

~~~text
Episodic  : "On the March 3rd call, the customer was frustrated about
             a delayed shipment and we offered a 10% credit."
Semantic  : "This customer's shipping address is in a region with
             frequent carrier delays."
Procedural: "For delayed-shipment complaints from this customer segment,
             offering a credit before escalation resolves the issue in
             most cases, based on past outcomes."
~~~

This distinction is conceptual, not a mandate to build three separate databases -- many production systems store all three as embedded text in a single vector store, distinguished only by metadata tags, and that is a perfectly reasonable engineering choice. The value of the distinction is in reasoning about write and read policy: an episodic memory should probably decay in relevance over time (a specific interaction from a year ago matters less than one from yesterday), a semantic fact should be checked for staleness and contradiction before being trusted (see Advanced Concepts), and a procedural memory is most useful when retrieved at decision time, not conversation time.

### Write policy: what gets stored, and when

A write policy answers: given everything that just happened in a turn or a step, what (if anything) gets committed to long-term memory? Naive policies write everything, which is simple but leads to unbounded, low-signal growth (see Failure Modes); better policies are selective.

~~~text
Naive write policy:
  after every turn, embed and store the entire turn verbatim.
  -- simple, but the store fills with low-value chit-chat alongside
     genuinely important facts, degrading retrieval quality over time.

Selective write policy:
  after every turn, ask a cheap classification step (rule-based or a
  small LLM call): "does this turn contain a durable fact, preference,
  or lesson worth remembering beyond this conversation?"
  -- only write if yes; discard the rest. Slower and adds a small
     extra cost per turn, but keeps the store dense with signal.
~~~

Common triggers for a write, in production systems: an explicit user statement of a preference or fact ("I prefer email over phone calls"); a task outcome, especially a failure, that is likely to recur (a tool call that failed in a specific, generalizable way); an explicit summarization/compaction step (see below) that condenses a block of raw history into a durable summary; and, in some architectures, a periodic "reflection" pass (see the **Reflection** skill) that reviews recent activity and decides what is worth promoting to long-term memory.

### Read policy: retrieval, re-ranking, and injection

A read policy answers: given the current situation, what stored memories actually get pulled into this call's prompt? The baseline approach is a similarity search (embed the current query or state, compare against stored memory embeddings, take the top-k most similar) -- but a naive top-k-by-similarity read policy has well-known weaknesses shared with **RAG**: it can retrieve memories that are semantically similar but not actually the most useful (a memory about the topic, but not about the specific detail needed), and it treats recency and importance as irrelevant unless those are explicitly factored in.

~~~text
Naive read: top-k by embedding similarity to the current query alone.

Better read: combine similarity with recency (weight recent memories
  higher) and importance (weight memories the write policy flagged as
  significant higher), then re-rank -- often as a weighted score rather
  than similarity alone, and sometimes with a final LLM-based re-rank
  step that reads the top candidates and decides which are actually
  relevant to include, discarding superficially similar but practically
  useless matches.
~~~

### Memory compression as an ongoing process, not a one-time event

Summarization/compaction is best thought of as a recurring background process, not a single step. A common pattern: keep the most recent N turns verbatim (short-term buffer), and once the buffer exceeds a threshold, summarize the oldest portion into a compact form, store that summary (either inline, prepended to the buffer, or written out to long-term memory), and drop the raw turns it replaced. This can be applied recursively -- a summary of summaries -- for very long-running agents, though each additional layer of summarization compounds information loss, and there is no universally agreed-upon number of layers past which this becomes actively harmful; teams should measure this empirically for their own task rather than assuming a specific depth is safe.
`,

  "advanced-concepts": `
### The memory-cost-latency tension, quantified

Every piece of memory included in a prompt is billed as input tokens and adds to the time the model spends processing before it can start generating -- so "just retrieve more memories to be safe" is not a free safety margin, it is a direct cost and latency tax, and past a certain point it can actively hurt quality by crowding out the model's attention with low-relevance content (a phenomenon sometimes described informally as the model being "distracted" by too much marginally-relevant context, related to but distinct from the well-documented tendency of models to weight information differently depending on its position in a long context).

~~~text
Retrieving k memories, each averaging T tokens:
  k=3,  T=150  -> ~450 tokens of memory context per call
  k=10, T=150  -> ~1500 tokens of memory context per call
  k=30, T=150  -> ~4500 tokens of memory context per call

Cost and latency scale roughly linearly with k * T. Retrieval QUALITY
does not scale the same way -- past some k, additional retrieved
memories are increasingly likely to be irrelevant noise rather than
missing signal, so you are paying more for a call that performs the
same or worse. There is no universal "right" k; it must be tuned per
task by measuring end-to-end quality against k, exactly as you would
tune retrieval depth in a **RAG** pipeline.
~~~

The engineering implication: memory retrieval depth (k) and summarization aggressiveness are not settings to maximize for safety -- they are parameters that trade recall for cost, latency, and (past a point) actual quality, and should be tuned against measured task performance, not intuition.

### Contradiction and staleness: the problem retrieval alone does not solve

A vector similarity search has no concept of "this fact has since been superseded." If a user said "I live in Chicago" six months ago and "I moved to Denver" last week, both statements are valid, semantically related memories, and a naive read policy may retrieve either or both with no signal about which is current. This is arguably the single most consequential and least solved problem in production agent memory: retrieval finds relevant text, not necessarily true or current text.

~~~text
Stored memory A (6 months old): "User lives in Chicago."
Stored memory B (1 week old):   "User moved to Denver."
Query: "What's the weather like where I live?"

A naive similarity-only read can retrieve BOTH, with no explicit signal
about which supersedes the other -- the model may then genuinely
contradict itself or pick the wrong one depending on which memory
happens to rank marginally higher in the similarity score, which is
not a robust way to resolve a factual conflict.
~~~

Approaches teams use, none of which are a complete solution: attach explicit timestamps to every memory and prefer more recent facts when a conflict is detected (requires an explicit conflict-detection step, which is itself imperfect); explicitly mark a memory as superseded/invalidated when a contradicting fact is written, rather than only ever appending (requires the write policy to actively check for conflicts against existing memories, which is nontrivial and adds cost); or periodically run a consolidation pass (akin to the "reflection" step in generative-agent research) that reviews related memories and resolves contradictions explicitly, at the cost of extra compute and complexity. Be honest with stakeholders that none of these fully closes the gap -- stale and contradictory memory is a standing operational risk for any long-lived agent, not a bug to be fixed once and forgotten.

### Memory as a security and correctness boundary, not just a cost lever

Because retrieved memories are inserted into the prompt as if they were trusted context, a memory store is a place where incorrect, adversarial, or simply outdated information can silently steer an agent's behavior with the same authority as a verified fact -- structurally identical to the prompt-injection risk covered for retrieved documents in **RAG** and for tool outputs in **Agent Fundamentals**, but specific to an agent's own accumulated history rather than external content. A write policy that stores anything a user says without validation, combined with a read policy that injects it into a future prompt without any provenance signal, is a path for a user (or an attacker) to plant a false "fact" that a later session will treat as established truth -- see Security below for the concrete defenses.

### Decision table: which memory technique for which situation

| Situation | Best-fit technique |
|---|---|
| Conversation is short, well within the context window | Plain short-term buffer; no summarization or long-term store needed yet |
| Conversation/transcript is growing past a comfortable token budget, but session-scoped | Summarization/compaction of older turns, kept within the same session |
| Facts need to persist across separate sessions or conversations | Long-term memory: embed and store, retrieve by similarity at read time |
| The agent needs to recall a specific past event, tied to when it happened | Episodic-style storage with timestamps, retrieved by similarity plus recency |
| The agent needs a general fact regardless of when it was learned | Semantic-style storage, retrieved by topical similarity, with staleness/contradiction checks |
| The agent needs to recall how to handle a recurring situation | Procedural-style storage, retrieved at decision time (before choosing an action), not conversation time |
| Facts may become outdated or contradicted over time | Explicit timestamping plus a conflict-detection or periodic consolidation pass -- similarity search alone is not sufficient |

### Multi-agent memory sharing

In a multi-agent system (see **Agent Fundamentals**' treatment of multi-agent architectures), a further design question arises: does each agent have its own private memory, or is there a shared memory store all agents read from and write to? Private memory keeps each agent's context focused and avoids one agent's irrelevant history polluting another's decisions, but risks the same agent-to-agent inconsistency problem covered in Failure Modes if two agents independently form different beliefs about the same fact. Shared memory avoids that inconsistency but reintroduces the context-bloat and relevance-noise problem at a larger scale, since now every agent's writes compete for space in a store every other agent reads from. There is no settled consensus on which is generally better; the right choice depends on how much the agents' roles genuinely need to share state versus stay isolated, and most production multi-agent systems use a hybrid (a small shared "fact" store plus per-agent private working memory).
`,

  "internal-working": `
Step by step, here is what actually happens inside a production-grade agent-memory system across one turn, combining short-term buffering, long-term retrieval, and periodic compression:

~~~mermaid
flowchart TB
    A["New user turn or agent step arrives"] --> B["Short-term buffer:\nappend the new turn"]
    B --> C{"Buffer exceeds\ntoken threshold?"}
    C -->|Yes| D["Summarize oldest portion of\nbuffer into a compact form"]
    D --> E["Replace raw oldest turns with\nthe summary in the buffer"]
    C -->|No| F["Embed current query/state"]
    E --> F
    F --> G["Similarity search against\nlong-term memory store"]
    G --> H["Re-rank candidates by\nsimilarity + recency + importance"]
    H --> I["Select top-k memories to inject"]
    I --> J["Assemble final prompt:\nsystem + retrieved memories +\nshort-term buffer + current turn"]
    J --> K["LLM call"]
    K --> L{"Write policy: does this turn\ncontain a durable fact worth\nremembering long-term?"}
    L -->|Yes| M["Embed and write to\nlong-term memory store,\nwith timestamp and metadata"]
    L -->|No| N["Discard from long-term\nwrite path (still in\nshort-term buffer)"]
~~~

1. **Append to short-term buffer**: every new turn is appended to the in-session buffer first, exactly as in Beginner Concepts -- this is the cheapest and most immediate form of continuity.
2. **Check the compression threshold**: if the buffer has grown past a configured token budget, the oldest portion is summarized (an LLM call, or a cheaper rule-based/extractive method for simpler cases) and the raw turns are replaced by the summary -- trading detail for token cost, deliberately.
3. **Embed the current query or state**: the current turn (or, for a multi-step agent, the current step's context) is converted into a vector using the same embedding model used to store past memories, so that similarity comparison is meaningful -- see **Embeddings** for why using a consistent embedding model matters.
4. **Retrieve candidates**: a similarity search (see **Vector Search**) against the long-term store returns a candidate set, typically larger than the final number that will actually be used (e.g. retrieve 20 candidates to re-rank down to 5).
5. **Re-rank**: candidates are scored by a combination of similarity, recency, and any importance signal recorded at write time, and the final top-k is selected -- this step is what separates a naive memory system from a production-grade one, since similarity alone is a poor proxy for actual usefulness.
6. **Assemble the prompt**: the final prompt combines system instructions, the retrieved long-term memories, the (possibly summarized) short-term buffer, and the current turn -- and this assembled prompt's total token count is exactly the quantity the cost/latency tension in Advanced Concepts is about.
7. **Call the model** and get a response, exactly as in any agent loop.
8. **Apply the write policy**: after the turn completes, a decision (rule-based or another small LLM call) determines whether anything from this turn is worth committing to long-term memory; if so, it is embedded and written with a timestamp and any relevant metadata (source, importance score, category) for future retrieval and staleness handling.

The crucial architectural fact this diagram makes visible: memory read and memory write are two entirely separate pipelines with independent policies, running on different triggers (read happens on every call that needs context; write happens selectively, based on whether this turn actually produced something durable) -- conflating them, or assuming "the framework handles it," is exactly where unbounded growth and low-signal retrieval both originate.
`,

  architecture: `
Understanding agent-memory architecture, for an AI engineer, means understanding both the read/write pipeline above and how a real application should structure the memory component as a first-class, independently testable piece of the system rather than an implicit side effect of prompt construction.

### The core components, at a glance

- **Short-term store** -- typically an in-process or session-scoped buffer (a list of turns, or the agent's own transcript per **Agent Fundamentals**), living only as long as the current session or run.
- **Long-term store** -- typically a vector database (see **Vector Search**) holding embedded representations of past interactions, facts, or lessons, persisted across sessions and, in multi-user systems, scoped per user or per account.
- **Embedding model** -- converts text (both stored memories and incoming queries) into vectors for similarity comparison; must be the same model (or at least a compatible one) at write time and read time, or similarity scores become meaningless.
- **Summarization/compaction component** -- an LLM call (or, for simpler needs, a rule-based extractive method) that compresses older raw content into a shorter durable form.
- **Write-policy component** -- decides what, if anything, from a completed turn gets committed to the long-term store, and with what metadata (timestamp, category, importance, provenance).
- **Read-policy component** -- decides, given the current situation, which stored memories to retrieve and how to re-rank and filter them before injection into the prompt.
- **Consolidation/maintenance component** -- a periodic (not per-turn) process that detects and resolves contradictions, expires or archives stale memories, and enforces retention policies for privacy/compliance reasons.

### Application architecture around a memory system

~~~mermaid
flowchart TB
    App["Application layer"] --> Orchestrator["Agent orchestrator / loop\n(Agent Fundamentals)"]
    Orchestrator --> ShortTerm["Short-term buffer\n(session-scoped)"]
    Orchestrator --> ReadPolicy["Read policy:\nretrieve + re-rank"]
    ReadPolicy --> VectorStore[("Long-term vector store\n(per-user/account scoped)")]
    Orchestrator --> LLM["LLM call"]
    LLM --> WritePolicy["Write policy:\nworth remembering?"]
    WritePolicy -->|yes| Embed["Embed + write with\ntimestamp/metadata"]
    Embed --> VectorStore
    WritePolicy -->|no| Discard["Discard from\nlong-term path"]
    ShortTerm --> Compactor["Compaction: summarize\noldest turns past threshold"]
    Compactor --> ShortTerm
    subgraph Maintenance["Periodic maintenance (not per-turn)"]
        Consolidate["Contradiction detection\nand resolution"]
        Retention["Retention / expiry / PII\npolicy enforcement"]
    end
    VectorStore --> Maintenance
~~~

Key architectural principles:

- **Memory is an explicit, engineered component with its own tests, metrics, and failure modes** -- not an implicit side effect of however the prompt happens to be assembled, and not something a framework's default configuration should be trusted to get right for your specific data-retention and correctness requirements.
- **Long-term storage should be scoped per user/account/tenant from day one.** Retrofitting scoping onto a shared memory store after a cross-user data leak is a far more painful and risky fix than designing scoping in from the start -- see Security below.
- **Maintenance (consolidation, expiry, retention enforcement) is a periodic background process, distinct from the per-turn read/write path.** Trying to do contradiction resolution or PII expiry synchronously on every turn adds latency to every single call for a concern that does not need to be resolved that instant.
- **The embedding model used for the store is a versioned dependency**, exactly like a model version pinned in deployment configuration (see **LLM Fundamentals**) -- changing embedding models without re-embedding the existing store silently breaks similarity search, since old and new vectors are not comparable.
`,

  "data-flow": `
Tracing one turn end to end through a memory-augmented agent, across two sessions separated by time, showing exactly what is written in session 1 and retrieved in session 2:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant Mem as Memory system
    participant Store as Long-term vector store
    participant LLM as LLM

    Note over User,LLM: --- Session 1 (today) ---
    User->>App: "I'm allergic to shellfish, just so you know."
    App->>Mem: process turn (write-policy check)
    Mem->>Mem: classify: durable fact, worth storing
    Mem->>Store: embed + write "user allergic to shellfish"\n(timestamp, category=preference)
    App->>LLM: current turn + short-term buffer
    LLM-->>App: "Got it, I'll keep that in mind."
    App-->>User: reply

    Note over User,LLM: --- Session 2 (three weeks later, new session) ---
    User->>App: "Can you recommend a seafood restaurant?"
    App->>Mem: embed query, retrieve relevant memories
    Mem->>Store: similarity search("seafood restaurant recommendation")
    Store-->>Mem: match: "user allergic to shellfish"\n(similarity: topical overlap via "seafood")
    Mem->>App: inject retrieved memory into prompt
    App->>LLM: current turn + retrieved memory\n(no short-term buffer -- new session)
    LLM-->>App: "Before I recommend a seafood place --\nyou mentioned a shellfish allergy. Want me\nto filter for non-shellfish options?"
    App-->>User: reply
~~~

The two facts this trace makes concrete: first, nothing about session 2's prompt has any connection to session 1 except what was deliberately written to the long-term store and deliberately retrieved -- there is no other channel carrying information between sessions, which is exactly the mechanical point from Beginner Concepts made end to end. Second, retrieval worked here because the stored memory's embedding and the query's embedding were similar enough (both relate to "seafood"/"shellfish") for the vector search to surface the fact -- if the user had instead asked something with no lexical or semantic overlap to "shellfish" or "allergy," this same crucial fact could easily have gone unretrieved, which is the central limitation of similarity-based retrieval covered in Advanced Concepts and Failure Modes.
`,

  "production-usage": `
### How real teams actually run agent memory in production

- **Most production systems separate short-term and long-term memory explicitly**, with different storage backends, different lifetimes, and different policies -- a session-scoped in-memory or cache-backed buffer for short-term, and a dedicated vector database (often the same infrastructure used for **RAG**) for long-term.
- **Write policies are usually more conservative than teams initially expect.** Writing every turn verbatim to long-term memory is the default many teams start with and the default nearly all of them walk back, once they observe the store filling with low-signal content that degrades retrieval quality for the genuinely important facts.
- **Retrieval depth (k) and re-ranking are tuned empirically, not left at framework defaults.** Teams that measure end-to-end task quality against varying k values consistently find a point past which more retrieved memories stop helping and start hurting -- and that point is task-specific, not a fixed constant.
- **Per-user/tenant scoping of long-term memory is treated as a hard security requirement**, not an optional configuration flag -- a memory store that can retrieve one user's stored facts into another user's session is a serious data-leak incident, not a quality bug.
- **Consolidation and staleness handling are run as periodic background jobs**, not synchronously on every read, since contradiction detection and retention-policy enforcement do not need to be resolved within the latency budget of a single user-facing call.
- **Memory content is logged and auditable**, exactly like the transcript logging described in **Agent Fundamentals** -- being able to answer "why did the agent believe X" by tracing back to the specific stored memory and when it was written is standard practice for debugging and for compliance.

### Typical operational defaults

- Cap the short-term buffer at a fixed token budget (well under the model's full context window, leaving room for system instructions, retrieved memories, and the response itself) and trigger summarization once exceeded, rather than waiting until a call actually fails.
- Set a retrieval depth (k) for long-term memory based on measured task performance, typically in the single digits to low tens of memories per call, not hundreds.
- Attach a timestamp and a source/category to every written memory, unconditionally -- these are the minimum metadata needed for any later staleness handling, debugging, or retention-policy enforcement.
- Scope every long-term memory write and read by user/account/tenant identifier as a non-negotiable filter in the retrieval query itself, not as an application-layer afterthought applied after retrieval.
- Run a periodic (not per-request) consolidation job that flags or resolves detected contradictions and enforces any data-retention/expiry policy.
`,

  "industry-examples": `
- **Conversational AI assistants and companion products** (across multiple vendors) commonly implement long-term memory so a returning user's stated preferences, facts, and history persist across sessions without needing to be re-stated -- a direct, user-visible application of the write/read policy pattern covered in Intermediate Concepts.
- **Customer support platforms** frequently give agents access to a customer's interaction history (past tickets, past resolutions) as retrievable long-term memory, so a new support interaction can be informed by what happened previously without the agent re-reading an entire raw ticket history every time -- illustrating the cost-driven motivation for retrieval over "resend everything."
- **Coding assistants and IDE-integrated agents** use a form of procedural memory: recording lessons about a specific codebase (naming conventions, past review feedback, project-specific constraints) that get retrieved and applied to future suggestions in that same project, rather than treating every session as a blank slate.
- **Autonomous research and multi-step task agents** (a fast-growing category discussed in **Agent Fundamentals**) rely heavily on within-run short-term memory management (summarizing a long transcript) since these tasks routinely produce transcripts that would otherwise exceed the context window well before the task is complete.
- **Personalization and recommendation-adjacent agent products** use semantic long-term memory (stored preferences and facts) explicitly to avoid asking a returning user to re-specify context that should already be known, directly trading a small amount of storage and retrieval cost for a materially better user experience.

Pattern to notice: the production-successful examples share explicit separation of short-term and long-term memory, conservative and selective write policies, and per-user data scoping -- the naive "store everything, retrieve by similarity, hope for the best" pattern is common in early prototypes and is almost universally hardened significantly before reaching real production traffic, for exactly the reasons covered in Failure Modes.
`,

  "best-practices": `
1. **Separate short-term and long-term memory explicitly**, with different storage, different lifetimes, and different code paths -- do not conflate "what's in the current session's buffer" with "what should persist across sessions."
2. **Default to a selective write policy, not "store everything."** Classify whether a turn contains a durable fact, preference, or lesson before committing it to long-term memory; an unfiltered store degrades retrieval quality for everyone, not just for the specific low-signal entries.
3. **Attach a timestamp and category/source metadata to every written memory, unconditionally** -- this is the minimum needed for staleness handling, debugging, and retention-policy enforcement, and it is far cheaper to do at write time than to reconstruct later.
4. **Tune retrieval depth (k) empirically against measured end-to-end task quality**, not a framework default -- more retrieved memories is not automatically better, per the cost/latency/relevance tension in Advanced Concepts.
5. **Re-rank retrieved candidates by more than raw similarity** -- combine similarity with recency and any recorded importance signal, since a naive top-k-by-similarity read is a well-documented source of retrieving superficially related but practically unhelpful memories.
6. **Scope every long-term memory write and read by user/account/tenant identifier as a hard filter in the query itself**, never as a post-retrieval filter applied after the fact, and never omitted "for now."
7. **Treat stored memory as untrusted content with respect to instructions**, exactly as tool outputs and retrieved documents are treated in **Agent Fundamentals** and **RAG** -- a stored memory that happens to contain adversarial or manipulated text should not be able to override system instructions simply because it was retrieved from your own store.
8. **Run contradiction detection and consolidation as a periodic background process**, not synchronously per request, since it does not need to be resolved within a single call's latency budget.
9. **Define and enforce an explicit retention/expiry policy** for any memory that could contain personally identifiable information, before shipping, not after a compliance review flags it.
10. **Version and pin the embedding model used for the store**, and re-embed the existing store if the embedding model changes -- old and new embeddings from different models are not directly comparable.
11. **Log which memories were retrieved and used for every call**, exactly like transcript logging for tool calls, so a wrong or confusing agent response can be traced back to the specific stored memory (or absence of one) that drove it.
12. **Measure recall on a representative set of "should this be retrieved" test cases**, not just spot-checking a few examples -- retrieval quality regressions are easy to introduce silently when a write policy, chunking strategy, or embedding model changes.
`,

  "anti-patterns": `
### Storing everything, retrieving by similarity alone, and hoping

~~~text
WRONG: every single turn of every conversation is embedded and written
  to long-term memory verbatim, with no filtering, and retrieval is a
  bare top-k similarity search with no re-ranking, no recency signal,
  and no per-user scoping.
  -- the store fills with low-signal chit-chat, genuinely important
  facts get diluted among noise, contradictory facts accumulate with
  no resolution mechanism, and (if scoping is missing) one user's
  facts can leak into another user's retrieved context.

RIGHT: a selective write policy, explicit metadata (timestamp, category,
  user scope), re-ranking beyond raw similarity, and a periodic
  consolidation pass that resolves contradictions and enforces
  retention policy.
~~~

### Other common agent-memory-specific anti-patterns

- **Treating context-window size as a substitute for memory engineering.** A larger context window reduces, but does not eliminate, the need for deliberate short-term compression, and does nothing at all for cross-session persistence -- "the context window is big enough now" is a common and mistaken justification for skipping memory design entirely.
- **No staleness or contradiction handling.** Writing new facts without ever checking whether they contradict an existing stored memory leads directly to the retrieval of stale or conflicting information with no signal about which is current -- see Failure Modes.
- **Summarizing recursively without measuring information loss.** Applying summarization of summaries repeatedly, with no check on what is being lost at each layer, can silently erode exactly the details a later step needed, and this compounds the same way per-step errors compound in **Agent Fundamentals**' Advanced Concepts.
- **No per-user/tenant scoping on the long-term store.** This is not merely a quality bug -- a memory store that can surface one user's private facts to another user's session is a serious security and privacy incident.
- **Conflating "the framework's default memory component" with "a correct memory design for my data-retention and correctness requirements."** Off-the-shelf memory components in agent frameworks are a reasonable starting point, but their default write policy, retention behavior, and scoping guarantees must be explicitly reviewed against your actual requirements, not assumed adequate.
- **Injecting retrieved memory into the prompt with no provenance or trust boundary**, letting a stored memory (which could itself have been influenced by a prior manipulated input) carry the same implicit authority as a verified system instruction.
- **Measuring memory quality only by "did it retrieve something," not by "was what it retrieved actually correct and useful."** A read policy that reliably retrieves stale or contradicted facts is passing a shallow test while failing the task it exists to serve.
`,

  performance: `
### Measure first

Before optimizing anything, instrument and measure: tokens spent on memory (short-term buffer plus retrieved long-term memories) per call, retrieval latency for the long-term store, end-to-end task quality as a function of retrieval depth (k), and the rate at which retrieved memories are actually used versus ignored by the model's final response (a strong signal of retrieval relevance, closely related to the same metric in **RAG**).

### The optimization hierarchy for agent memory (apply in order)

1. **Tighten the write policy first.** A store with less low-signal content improves both retrieval quality and retrieval latency (smaller index to search, less noise to rank against) -- this is almost always the highest-leverage lever, and it is a data-quality fix, not an infrastructure fix.
2. **Tune retrieval depth (k) against measured task quality**, not intuition -- find the point past which additional retrieved memories stop improving, or start hurting, end-to-end quality, exactly as you would tune retrieval depth in **RAG**.
3. **Compress short-term history proactively**, before it becomes a problem, rather than reactively once a call fails at the context-window limit -- summarization at a sensible threshold keeps both cost and latency predictable.
4. **Cache embeddings for repeated queries or common memory-retrieval patterns**, where applicable, to avoid redundant embedding-model calls for identical or near-identical text.
5. **Re-rank cheaply before re-ranking expensively.** A cheap recency/importance-weighted re-rank on a modest candidate set is usually enough; reserve an additional LLM-based re-rank pass (reading the top candidates and judging relevance) for tasks where retrieval precision genuinely matters enough to justify the extra latency and cost.
6. **Push vector-index-level performance work (approximate nearest-neighbor tuning, index sharding, hardware) to the Vector Search skill** rather than trying to solve it at the memory-policy layer -- these are separate, complementary levers.

### Facts worth knowing at this level

- Memory-related latency has two independent components: the vector similarity search itself (usually fast, sub-100-millisecond-scale for well-indexed stores at reasonable scale) and the extra tokens added to the LLM call (which affects both cost and the model's processing time, and typically dominates total added latency more than the search itself does).
- Retrieval quality, not retrieval speed, is usually the binding constraint on production agent memory systems -- a fast but low-precision retrieval that returns stale or irrelevant memories is a worse problem than a slightly slower, better-ranked one.
- Summarization cost is a real, recurring cost (an LLM call every time the compaction threshold is hit), not a one-time setup cost -- factor it into per-conversation cost estimates for long-running agents.
`,

  scalability: `
Scalability for agent memory has two distinct dimensions: scaling the number of concurrent users/sessions each with their own memory (an infrastructure and data-partitioning concern, closely related to scaling any vector-store-backed system per **Vector Search**), and scaling the quality of retrieval as any single user's stored memory grows over months or years of interaction (a data-quality and retrieval-tuning concern specific to long-lived agent memory).

### The scaling story

~~~mermaid
flowchart LR
    LB["Application layer\n(many concurrent sessions)"] --> ShortTerm["Per-session short-term\nbuffers (isolated)"]
    LB --> VectorStore[("Long-term vector store,\npartitioned/scoped per user")]
    VectorStore --> Maintenance["Periodic consolidation,\nexpiry, retention enforcement"]
~~~

Individual sessions' short-term buffers are naturally isolated and scale horizontally the same way any per-session application state does; the long-term store is the shared, growing resource whose scaling story more closely resembles any large vector database's -- partitioning by user/tenant, index sharding, and approximate nearest-neighbor tuning are the standard levers, covered in depth in **Vector Search**.

### Known bottlenecks and answers

| Bottleneck | Answer |
|---|---|
| A single user's stored memory grows unboundedly over months/years of interaction, degrading retrieval precision and search latency | Periodic consolidation (merge/summarize related old memories), explicit retention/expiry policy, and importance-weighted pruning of low-value entries -- not simply "keep everything forever" |
| Concurrent load across many users' independent memory stores | Partition the vector store by user/tenant (both for scaling and for the hard security requirement of per-user scoping); this is a natural sharding key |
| Write-path cost grows with traffic, since every write is an embedding-model call | Batch embedding calls where possible; apply the selective write policy aggressively so only a fraction of turns actually trigger a write |
| Read-path cost grows with the number of concurrent calls needing retrieval | Cache embeddings for repeated or near-duplicate queries; ensure the vector index itself is scaled per **Vector Search**'s guidance, independent of the memory-policy layer |
| Consolidation/maintenance jobs become expensive as total stored memory grows | Run incrementally (only recently-written or recently-flagged memories) rather than re-scanning the entire store on every maintenance run |

The single most important scalability idea specific to agent memory: unlike a stateless single-shot call, the cost and quality of an agent's memory system are functions of that specific user's accumulated history, not a fixed per-request cost -- capacity and quality planning must account for a distribution of memory-store sizes across users (some near-empty, some with years of accumulated history), not a single representative case.
`,

  security: `
### Agent-memory-specific attack surface

1. **Cross-tenant memory leakage.** If long-term memory is not strictly scoped and filtered by user/account/tenant at the retrieval-query level, one user's stored facts (potentially including personal or sensitive information) can be surfaced into another user's session -- one of the most serious and most avoidable classes of incident specific to agent memory.
2. **Memory poisoning / planted false facts.** A user (or an attacker who can influence what gets written, directly or through a manipulated tool output that the write policy captures) can plant a false "fact" into long-term memory that a future session will retrieve and treat as established truth with the same authority as a verified statement -- structurally the same risk as prompt injection via tool outputs in **Agent Fundamentals**, but persistent across sessions rather than confined to one call.
3. **PII retention beyond what is necessary or disclosed.** A write policy that stores personal details (health information, financial details, precise location, anything a user mentions in passing) without an explicit retention/expiry policy and without clear disclosure creates real legal and compliance exposure, independent of any technical breach.
4. **Retrieved memory used as an instruction-injection vector.** Exactly as with retrieved documents in **RAG** and tool outputs in **Agent Fundamentals**, a stored memory containing adversarial or manipulated text can be treated by the model as an instruction rather than as data to reason about, if the prompt does not clearly separate trusted system instructions from retrieved memory content.
5. **Embedding-model inversion or leakage risk.** Depending on the embedding model and deployment, stored vectors can, in some circumstances, leak information about the underlying text they represent -- a consideration when deciding whether especially sensitive content should be stored as embeddings at all, or handled through a different mechanism with stronger guarantees.

### Defenses

- Enforce per-user/tenant scoping as a hard filter in every retrieval query itself, not as a post-retrieval application-layer check -- treat any code path that can retrieve across scopes as a critical bug, not a minor one.
- Treat every retrieved memory as untrusted content with respect to instructions, the same discipline applied to tool outputs and retrieved documents elsewhere on this platform -- steer the model (via system instructions and, where available, provider-level content/role separation) to treat memory content as data to reason about, not commands to obey.
- Define an explicit retention/expiry policy for any memory that could contain personally identifiable information, and enforce it via the periodic maintenance/consolidation process, not left indefinite by default.
- Validate and, where appropriate, rate-limit or review what gets written to long-term memory, especially for any write path that can be influenced by content the agent did not directly verify (a tool result, a document, another agent's output in a multi-agent system).
- Log every write and every retrieval with enough detail (what was written, what was retrieved, for which user/session) to support an incident investigation after the fact.
- Consider whether especially sensitive categories of information belong in a general-purpose embedded memory store at all, versus a more tightly access-controlled, non-embedded storage mechanism with explicit consent and disclosure.

See the **Security**, **Vector Search**, **RAG**, and **Guardrails** skills for depth beyond the memory-specific surface covered here -- this section is the memory-specific layer on top of the general retrieval and agent security picture covered elsewhere on the platform.
`,

  testing: `
Testing agent memory combines the retrieval-quality testing challenges already present in **RAG** and **Vector Search** (is the right content actually retrieved) with an additional temporal dimension specific to memory: does the system correctly handle facts that change over time, and does it correctly decide what to write in the first place.

~~~python
# Testing an agent memory system: assert on retrieval correctness,
# write-policy behavior, and staleness handling -- not just "did a
# vector search return something."

def test_durable_fact_is_written_and_later_retrieved(memory_system):
    memory_system.process_turn(
        user="I'm allergic to shellfish, just so you know.",
        session_id="session_1",
    )
    results = memory_system.retrieve(
        query="Can you recommend a seafood restaurant?",
        session_id="session_2",   # a different, later session
    )
    assert any("shellfish" in r.text.lower() for r in results)

def test_low_signal_turn_is_not_written(memory_system):
    memory_system.process_turn(user="ok thanks", session_id="session_1")
    all_memories = memory_system.debug_dump_store(user_id="test_user")
    assert not any("ok thanks" in m.text for m in all_memories)

def test_newer_fact_supersedes_older_contradicting_fact(memory_system):
    memory_system.process_turn(user="I live in Chicago.", session_id="s1")
    memory_system.process_turn(user="I moved to Denver last month.", session_id="s2")
    results = memory_system.retrieve(query="Where do I live?", session_id="s3")
    top = results[0].text.lower()
    assert "denver" in top and "chicago" not in top

def test_memory_never_crosses_user_scope(memory_system):
    memory_system.process_turn(user="my account PIN is 4471", session_id="s1", user_id="user_a")
    results = memory_system.retrieve(query="what's my PIN?", session_id="s2", user_id="user_b")
    assert not any("4471" in r.text for r in results)
~~~

### Fundamentals-level testing doctrine for agent memory

- **Test retrieval correctness on a representative, hand-labeled set of "should retrieve X given query Y" cases**, not a handful of hand-picked happy-path examples -- exactly the same discipline as evaluating a **RAG** system's retrieval quality.
- **Test the write policy directly**, asserting both that durable facts are written and that low-signal content is not, since an over-permissive write policy is a slow, hard-to-notice quality regression rather than an obvious failure.
- **Test staleness and contradiction handling explicitly**, with test cases that deliberately introduce a fact and then a later contradicting fact, and assert the system prefers the current one -- this is easy to skip and is exactly where production incidents originate.
- **Test cross-user/tenant isolation as a first-class, non-negotiable security test**, not merely a functional nice-to-have -- a failure here is a security incident, not a quality bug.
- **Separate "did the retrieval/write mechanics work" tests (deterministic, mockable) from "did the retrieved memory actually improve the response" tests (need real model calls and an end-to-end quality judgment)** -- the latter connects directly to the **Evaluation** skill's methodology, applied to memory-augmented outcomes specifically.
`,

  debugging: `
### Escalation path for debugging unexpected agent-memory behavior

1. **Reconstruct exactly what was retrieved and what was written for the failing turn**, not just the final response -- print or log the retrieved memory candidates, their similarity/re-rank scores, and whether anything was written to long-term memory as a result of this turn.

~~~python
def debug_memory_turn(memory_system, query: str, session_id: str, user_id: str) -> None:
    """Debugging habit: before theorizing about why a memory-related
    response looks wrong, inspect exactly what was retrieved and why."""
    candidates = memory_system.retrieve_with_scores(
        query=query, session_id=session_id, user_id=user_id, k=10
    )
    for c in candidates:
        print(f"score={c.score:.3f}  written_at={c.timestamp}  text={c.text!r}")
    print(f"---\nfinal top-k selected: {[c.text for c in candidates[:5]]}")
~~~

2. **Check whether the fact the agent "should have known" was ever written in the first place**, before assuming a retrieval bug -- a surprising number of "the agent forgot" reports trace back to the write policy never storing the fact at all, not to a retrieval failure.
3. **Check the similarity scores of the top retrieved candidates.** A low top score suggests the query and the relevant memory are not phrased similarly enough for embedding similarity to bridge the gap -- a genuine retrieval-recall limitation, not a bug, and a signal that the read policy may need query rewriting or a hybrid keyword-plus-semantic approach (see **Vector Search**).
4. **Check for a stale-or-contradicted-fact scenario specifically** -- if two memories about the same topic with different timestamps both retrieved, verify whether the re-ranking or prompt construction gave any preference to the more recent one, or whether the model was simply left to pick arbitrarily.
5. **Check whether the short-term buffer's summarization dropped the relevant detail.** A long conversation that has been through one or more compaction passes can silently lose exactly the detail a later turn needs -- compare the current buffer content against the raw original transcript if available.
6. **Verify user/session scoping on the specific retrieval call that produced the wrong result** -- a cross-scope leak is a security-severity bug, and any debugging session that surfaces one should escalate immediately rather than being treated as a routine quality issue.
7. **Escalate to a proper multi-case evaluation** (**Evaluation** skill, applied to memory-retrieval quality) once single-turn debugging has ruled out obvious write-policy, scoping, or summarization bugs -- some retrieval misses are genuine embedding-similarity limitations, not fixable by adjusting the loop.

### Common "it's not a bug, it's the fundamentals" traps

- "The agent forgot something I told it" -- check whether it was ever written to long-term memory at all; a selective write policy will, correctly, not store every passing remark.
- "The agent gave outdated information" -- check for an unresolved contradiction between an old and a new stored memory, not a retrieval malfunction.
- "The agent seems to know things it shouldn't" -- check cross-user/session scoping immediately; treat as a potential security incident, not merely a confusing quality bug.
- "The agent's answer contradicts something from earlier in this same conversation" -- check whether short-term buffer summarization dropped or distorted the relevant detail during compaction.
`,

  monitoring: `
Production agent-memory monitoring extends standard retrieval monitoring (per **Vector Search** and **RAG**) with signals specific to write policy, staleness, and cross-session behavior.

### What to measure

- **Write rate and write-policy acceptance rate** -- what fraction of turns actually result in a long-term write, and whether that rate drifts unexpectedly (a rising rate can indicate write-policy regression toward "store everything," a falling rate can indicate the opposite regression toward under-storing).
- **Retrieval score distribution** -- the similarity/re-rank scores of retrieved candidates across real traffic; a rising share of low-confidence top scores is an early signal that queries and stored memories are drifting apart, or that the store has grown noisy.
- **Store size per user/tenant over time** -- unbounded growth with no corresponding consolidation or expiry activity is a leading indicator of both rising cost and degrading retrieval quality.
- **Contradiction/staleness flags raised by the periodic consolidation job** -- a rising rate is a signal worth investigating, not just logging, since it directly predicts user-facing confusion.
- **Cross-scope retrieval attempts blocked by the scoping filter** -- ideally always zero in normal operation; any nonzero rate warrants immediate investigation as a potential security issue, not a metrics curiosity.

~~~python
# Minimal instrumentation sketch around a memory-augmented turn.
import time
import logging

logger = logging.getLogger("agent_memory")

def process_turn_with_monitoring(memory_system, user_text: str, session_id: str, user_id: str) -> dict:
    start = time.perf_counter()
    candidates = memory_system.retrieve_with_scores(
        query=user_text, session_id=session_id, user_id=user_id, k=10
    )
    retrieval_ms = (time.perf_counter() - start) * 1000

    written = memory_system.process_turn(
        user=user_text, session_id=session_id, user_id=user_id
    )

    logger.info(
        "memory_turn_processed",
        extra={
            "user_id": user_id,
            "num_candidates": len(candidates),
            "top_score": candidates[0].score if candidates else None,
            "retrieval_latency_ms": retrieval_ms,
            "wrote_new_memory": bool(written),
        },
    )
    return {"candidates": candidates, "written": written}
~~~

### Agent-memory-specific things to watch

- A rising share of low top-retrieval-scores can indicate the store has grown noisy (write policy too permissive) or that real user language has drifted from how memories were originally phrased at write time.
- A store size growing with no corresponding consolidation activity is an early cost and quality-degradation warning, well before it becomes a visible incident.
- Any nonzero cross-scope retrieval rate should page someone immediately -- this is a security-severity signal, not a routine quality metric.
`,

  deployment: `
Deploying a memory-augmented agent feature builds on the deployment concerns already covered in **Agent Fundamentals** (pinned model version, step/cost budgets, secrets management) with memory-specific configuration that must be explicit at deploy time.

### Configuration that must be explicit at deployment time

~~~text
MEMORY_SHORT_TERM_TOKEN_BUDGET=3000     # threshold that triggers
                                         # summarization/compaction
MEMORY_LONG_TERM_RETRIEVAL_K=8          # number of candidates retrieved
                                         # before re-ranking down further
MEMORY_LONG_TERM_FINAL_K=4              # number actually injected into
                                         # the prompt after re-ranking
MEMORY_WRITE_POLICY=selective           # never "store_everything" in
                                         # production without a specific,
                                         # reviewed reason
MEMORY_EMBEDDING_MODEL=<pinned version, not "latest">
MEMORY_RETENTION_DAYS=180                # explicit expiry, not indefinite
MEMORY_SCOPE_ENFORCEMENT=strict          # hard filter by user/tenant id
                                          # on every retrieval query
MEMORY_CONSOLIDATION_SCHEDULE=daily      # periodic contradiction
                                          # detection and cleanup job
~~~

Why each choice matters: the short-term token budget and retrieval-k settings are the primary levers on both cost/latency and quality, and should be tuned against measured task performance rather than left at a library default; a selective write policy is the single highest-leverage defense against unbounded, low-signal store growth; a pinned embedding model prevents silently incomparable vectors after an unreviewed model upgrade; an explicit retention period is a compliance and privacy requirement, not an optional nicety; and strict scope enforcement on every retrieval query is the primary defense against the cross-tenant leakage failure mode covered in Security.

### Rollout practice specific to agent-memory features

- **Roll out changes to the write policy, retrieval-k, or re-ranking logic behind a flag**, and evaluate retrieval quality and end-to-end task success on a representative, labeled test set (see **Evaluation**) before full rollout -- these are behavior changes with wide blast radius, since they affect every call that touches memory.
- **Never change the embedding model without a planned re-embedding migration** for the existing store -- deploying a new embedding model against an old store's vectors silently breaks similarity search rather than failing loudly.
- **Canary retention-policy and consolidation-job changes carefully**, since a bug in an expiry or contradiction-resolution job can silently delete or alter data that is expensive or impossible to reconstruct.
- **Keep a fallback path that degrades gracefully if the long-term memory store is unavailable** (serve with short-term memory only, rather than failing the whole request), since memory retrieval should be treated as an external dependency with its own timeout and error handling, exactly as any other tool call is treated in **Agent Fundamentals**.
`,

  "production-checklist": `
Before a memory-augmented agent feature takes real production traffic:

- [ ] Short-term buffer has an explicit token budget and a working compaction/summarization trigger, tested past the threshold
- [ ] Long-term write policy is selective (not "store everything"), reviewed, and tested against representative low-signal and high-signal turns
- [ ] Every written memory carries a timestamp and category/source metadata, unconditionally
- [ ] Retrieval depth (k) and re-ranking logic are tuned against measured end-to-end task quality, not left at a framework default
- [ ] Every retrieval and every write is scoped and filtered by user/account/tenant identifier as a hard query-level filter
- [ ] Cross-scope retrieval is covered by an explicit, passing security test, not just assumed correct
- [ ] Explicit retention/expiry policy defined and enforced for any memory that could contain personally identifiable information
- [ ] Periodic consolidation/contradiction-detection job scheduled and monitored, not left as a someday task
- [ ] Embedding model version is pinned; any change to it has a planned re-embedding migration for the existing store
- [ ] Retrieved memory is treated as untrusted content with respect to instructions, not implicitly trusted the same as system instructions
- [ ] Full logging of what was retrieved and what was written per call, for debugging and audit purposes
- [ ] A graceful fallback path exists if the long-term memory store is unavailable (short-term-only degraded mode, not a hard failure)
- [ ] Memory-store size and growth per user/tenant are monitored, with an alert threshold, not discovered only when cost or latency becomes a visible problem
- [ ] Considered explicitly whether this feature actually needs long-term memory, versus short-term buffering alone, or no memory at all -- documented in the design, not just assumed
`,

  "common-mistakes": `
1. **Storing every turn verbatim in long-term memory "to be safe"** -- the most common and most consequential mistake on this page's topic; it degrades retrieval quality for everyone and multiplies storage cost with no proportional benefit.
2. **No per-user/tenant scoping on the long-term store**, or scoping applied only as a post-retrieval filter rather than as a hard filter in the retrieval query itself -- a serious, avoidable security gap.
3. **Treating retrieval similarity as truth.** A retrieved memory is the most semantically similar stored text to the query, not necessarily the most current or correct fact -- confusing these leads directly to the stale/contradictory-memory failure mode.
4. **No staleness or contradiction handling at all.** Assuming new facts simply "override" old ones with no explicit mechanism, when in reality both remain equally retrievable unless something actively marks the older one as superseded.
5. **Choosing retrieval depth (k) by intuition rather than by measuring end-to-end quality against it** -- more retrieved memories is not automatically better, and past a point it actively hurts.
6. **No explicit retention/expiry policy for personally identifiable information**, discovered only when a compliance review or an incident forces the question, rather than designed in from the start.
7. **Confusing short-term buffer management with long-term memory design**, treating "the conversation didn't get truncated" as evidence the memory system is working, when the two solve entirely different problems (session-scoped coherence versus cross-session persistence).
8. **Changing the embedding model without re-embedding the existing store**, silently breaking similarity search rather than failing in an obvious way.
9. **Injecting retrieved memory into the prompt with no separation from trusted system instructions**, creating the same instruction-injection risk covered for tool outputs and retrieved documents elsewhere on the platform.
10. **Assuming the framework's default memory component is correct for your specific requirements** without reviewing its actual write policy, scoping guarantees, and retention behavior against your own data-handling obligations.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Agent repeats questions the user already answered in this conversation | Short-term buffer truncated or summarized in a way that dropped the relevant detail | Review compaction thresholds and summarization prompts; verify the specific detail survives summarization in a test case |
| Agent gives outdated information about the user | Contradicting memories both retrievable with no staleness/preference signal | Add explicit timestamps and a recency-weighted re-rank, or a consolidation pass that marks older facts superseded |
| Agent seems to "know" something it should not, from another user's history | Missing or incorrectly applied per-user/tenant scoping on the retrieval query | Add a hard scope filter at the query level; treat as a security-severity bug, escalate immediately |
| Retrieval returns nothing relevant despite a clearly relevant memory existing | Query phrasing and stored-memory phrasing are too semantically distant for embedding similarity to bridge | Consider query rewriting, hybrid keyword-plus-semantic retrieval, or storing memories in more retrieval-friendly phrasing at write time (see **Vector Search**) |
| Long-term store grows very large with little retrieval-quality benefit | Write policy is too permissive ("store everything") | Tighten the write policy to a selective, classification-gated approach; consider a consolidation pass to merge/prune low-value entries |
| Similarity search returns nonsensical or clearly unrelated results after an embedding-model upgrade | Existing stored vectors were produced by a different embedding model than the one now used for queries | Re-embed the entire existing store with the new model before or immediately after the upgrade; never mix embedding-model versions silently |
| Memory-augmented calls have noticeably higher latency than expected | Retrieval depth (k) or short-term buffer size set too generously, adding unnecessary tokens per call | Tune k and buffer thresholds against measured quality, not left at a maximal default |
| Compliance/privacy review flags retained personal data with no clear justification | No explicit retention/expiry policy was defined for memory that could contain personally identifiable information | Define and enforce a retention policy via the periodic maintenance job before the feature ships, not after a review |
`,

  faqs: `
**Q: Does an LLM actually remember anything between calls on its own?**
No. Every call is stateless; anything that looks like memory is text that application code deliberately re-included in the new prompt, whether from a short-term buffer or retrieved from a long-term store.

**Q: What's the real difference between short-term and long-term memory?**
Short-term memory is the recent conversation or transcript kept and resent within the current context window, with no persistence beyond the session; long-term memory is externally stored (typically as embeddings in a vector store) and persists across sessions, retrieved selectively by similarity rather than resent in full.

**Q: Do I need episodic, semantic, and procedural memory as three separate systems?**
No -- the distinction is conceptual, useful for reasoning about write and read policy (should this decay with time, should it be checked for staleness, should it be retrieved at decision time versus conversation time), not a mandate for three separate databases. Many production systems store all three as tagged entries in a single vector store.

**Q: Why not just retrieve more memories to be safe?**
Because every retrieved memory is billed as input tokens and adds to processing time, and past a certain point additional retrieved memories are more likely to be irrelevant noise than missing signal -- retrieval depth is a tuned parameter, not a dial to maximize; see Advanced Concepts and Performance.

**Q: How do I stop an agent from confidently stating an outdated fact?**
There is no complete fix, but explicit timestamping combined with recency-weighted re-ranking, and a periodic consolidation pass that detects and resolves contradictions, are the standard mitigations -- treat stale/contradictory memory as a standing operational risk to monitor, not a bug you fix once.

**Q: Is long-term memory the same thing as RAG?**
They share the same core mechanism (embed, store, retrieve by similarity, inject into the prompt) and most of the same failure modes, but differ in what is being retrieved: **RAG** typically retrieves external documents, while agent memory retrieves the agent's own past interactions, facts, or lessons. The skills are close siblings, and techniques largely transfer between them.

**Q: What's the single biggest risk specific to agent memory that isn't present in a stateless single-shot system?**
Cross-session persistence itself creates a new class of risk: a false or adversarial fact planted once can be retrieved and treated as true in every future session, and a fact that was once true can silently go stale with no automatic mechanism to notice. Neither risk exists in a system with no persistent memory at all.

**Q: Where do I go next after this page?**
If your priority is the retrieval mechanics underlying long-term memory, go to **Vector Search** and **Embeddings**; if it's applying the same retrieve-and-inject pattern to external documents, go to **RAG**; if it's how memory feeds into multi-step task structure, go to **Planning**; if it's how an agent critiques and improves its own past attempts, go to **Reflection**; if it's a specific framework's memory components, go to **LangChain** or **LangGraph**.
`,

  "interview-questions": `
**Junior/Mid:**

1. *Does an LLM remember anything between two separate API calls?* Model answer sketch: no -- every call is stateless; anything that looks like memory is text explicitly re-included in the next prompt by application code, either from a short-term buffer or retrieved from a long-term store.
2. *What's the difference between short-term and long-term agent memory?* Short-term memory is the recent conversation or transcript kept within the current context window and resent as-is; long-term memory is externally stored (typically as embeddings) and persists across sessions, retrieved selectively rather than resent in full.
3. *Why can't you just always resend the entire conversation history?* It eventually exceeds the context window and, even before that, costs more tokens (and more latency) with every additional turn -- summarization/compression and selective long-term storage exist specifically to avoid this.
4. *What are episodic, semantic, and procedural memory?* Episodic: specific past events tied to an occasion. Semantic: general facts independent of when learned. Procedural: knowledge of how to do something, typically learned from past outcomes.
5. *Name two agent-memory-specific failure modes.* Stale/contradictory memory (retrieval finds relevant text, not necessarily current or true text) and unbounded memory growth (a permissive write policy fills the store with low-signal content); a strong answer also mentions privacy/PII retention risk.

**Senior:**

6. *Why is a naive top-k-similarity read policy insufficient for production agent memory?* Because embedding similarity measures topical relatedness, not correctness, currency, or importance -- it can retrieve a stale or contradicted fact with the same confidence as a current one, and does not account for recency or a recorded importance signal unless the read policy explicitly re-ranks for those.
7. *How would you design a write policy for a long-running customer support agent?* Discuss a selective, classification-gated write step (durable fact/preference/lesson versus routine chit-chat), explicit metadata (timestamp, category, source), and why writing every turn verbatim is a common early mistake that degrades retrieval quality over time.
8. *A user reports the agent gave them outdated information about their own account. How do you debug and fix this?* Reconstruct what was retrieved for that call and its scores; check whether an older and a newer contradicting memory both existed with no resolution signal; propose timestamp-based recency weighting and/or a periodic consolidation pass, while being honest that this does not fully eliminate the risk.
9. *How do you decide the right retrieval depth (k) for a memory-augmented agent?* Measure end-to-end task quality against varying k on a representative test set, since more retrieved memories are not automatically better past a task-specific point, and treat the cost/latency implications as a real, non-negligible factor in the decision, not an afterthought.
10. *How would you architect memory for a multi-agent system where several agents need to share some, but not all, context?* Discuss the private-versus-shared memory tradeoff: private memory keeps each agent's context focused but risks inter-agent inconsistency; shared memory avoids that but reintroduces context bloat at a larger scale; most production systems use a hybrid of a small shared fact store plus per-agent private working memory.
11. *What's the security risk specific to long-term agent memory that doesn't exist in a stateless system?* Cross-tenant leakage if scoping is not enforced at the retrieval-query level, and memory poisoning (a planted false fact retrieved and trusted in a future session) -- both are persistence-specific risks with no equivalent in a system with no memory across calls.
12. *How would you evaluate whether a memory system's retrieval quality is actually good, not just "returns something"?* Build a labeled test set of "should retrieve X given query Y" cases, measure recall and precision against it the same way you would evaluate a **RAG** system, and separately measure whether retrieved memories actually change or improve the final response, not merely whether they were retrieved.
`,

  "coding-questions": `
### 1. Implement a minimal long-term memory store with vector similarity retrieval and a summarization-based compaction step

~~~python
from dataclasses import dataclass, field
from datetime import datetime, timezone
import math

@dataclass
class MemoryEntry:
    text: str
    embedding: list  # a list of floats -- in production, from a real embedding API
    timestamp: datetime
    user_id: str
    category: str = "general"
    importance: float = 0.5  # 0.0-1.0, set by the write-policy classifier

def cosine_similarity(a: list, b: list) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

class LongTermMemoryStore:
    """A deliberately small, from-scratch long-term memory store -- in
    production you would use a real vector database (see Vector Search)
    rather than a Python list, but the write/read policy logic here is
    the same regardless of backend."""

    def __init__(self, embed_fn, summarize_fn):
        self.embed_fn = embed_fn          # text -> embedding vector
        self.summarize_fn = summarize_fn  # list[str] -> short summary string
        self._entries: list[MemoryEntry] = []

    def write(self, text: str, user_id: str, category: str = "general",
              importance: float = 0.5) -> None:
        embedding = self.embed_fn(text)
        entry = MemoryEntry(
            text=text,
            embedding=embedding,
            timestamp=datetime.now(timezone.utc),
            user_id=user_id,
            category=category,
            importance=importance,
        )
        self._entries.append(entry)

    def retrieve(self, query: str, user_id: str, k: int = 5,
                 recency_weight: float = 0.2) -> list[MemoryEntry]:
        # Hard scope filter FIRST -- never rely on a post-retrieval filter
        # for security-relevant isolation between users.
        scoped = [e for e in self._entries if e.user_id == user_id]
        if not scoped:
            return []

        query_embedding = self.embed_fn(query)
        now = datetime.now(timezone.utc)

        def score(entry: MemoryEntry) -> float:
            similarity = cosine_similarity(query_embedding, entry.embedding)
            age_days = max((now - entry.timestamp).total_seconds() / 86400, 0)
            recency = 1.0 / (1.0 + age_days)  # decays toward 0 as age grows
            # Combine similarity, recency, and recorded importance -- a bare
            # similarity-only ranking is exactly the naive read policy this
            # page warns against in Advanced Concepts.
            return (
                (1 - recency_weight) * similarity
                + recency_weight * recency
            ) * (0.5 + 0.5 * entry.importance)

        ranked = sorted(scoped, key=score, reverse=True)
        return ranked[:k]

    def compact_if_needed(self, user_id: str, max_entries: int = 200) -> None:
        """Compaction step: once a user's raw entry count exceeds a
        threshold, summarize the oldest entries into one condensed entry
        and drop the raw ones it replaced -- trading detail for token
        cost, deliberately, exactly as described in Intermediate Concepts."""
        user_entries = [e for e in self._entries if e.user_id == user_id]
        if len(user_entries) <= max_entries:
            return

        user_entries.sort(key=lambda e: e.timestamp)
        to_compact = user_entries[: len(user_entries) - max_entries]
        summary_text = self.summarize_fn([e.text for e in to_compact])

        # Remove the raw entries being compacted...
        to_compact_ids = set(id(e) for e in to_compact)
        self._entries = [e for e in self._entries if id(e) not in to_compact_ids]

        # ...and write the summary back as a single, durable entry.
        self.write(
            text=summary_text,
            user_id=user_id,
            category="consolidated_summary",
            importance=0.6,
        )
~~~

Complexity: O(n) per retrieval where n is the number of entries scoped to a user (fine for a from-scratch example; a real vector database uses an approximate nearest-neighbor index for sub-linear search at scale -- see **Vector Search**). Follow-ups: replace the linear scan with a real vector database and approximate nearest-neighbor index; add an explicit contradiction-detection step that runs during compaction, flagging or resolving entries that assert conflicting facts about the same topic rather than only compacting by volume.

### 2. Implement a selective write-policy classifier

~~~python
def classify_write_worthiness(turn_text: str, classify_fn) -> tuple[bool, str, float]:
    """classify_fn is a stand-in for a small, cheap LLM call (or a
    rule-based heuristic for simpler needs) that judges whether a turn
    contains a durable fact, preference, or lesson worth remembering
    beyond the current session.

    Returns (should_write, category, importance)."""
    result = classify_fn(
        "Does the following message contain a durable fact, stated "
        "preference, or lesson that should be remembered in future "
        "sessions? If yes, classify it as one of: preference, fact, "
        "lesson. If no, say NONE.\\n\\nMessage: " + turn_text
    )
    if result.strip().upper().startswith("NONE"):
        return False, "", 0.0
    category = result.strip().lower()
    # A simple importance heuristic: explicit preferences and safety-
    # relevant facts (allergies, restrictions) are weighted higher than
    # routine lessons, a deliberately simple stand-in for a real scoring
    # model tuned on your own production data.
    importance = 0.8 if category in ("preference", "fact") else 0.5
    return True, category, importance
~~~

Complexity: O(1) per call (one classification call), plus whatever the underlying classify_fn costs. Follow-ups: replace the single classify_fn call with a cheaper rule-based pre-filter (keyword/regex heuristics) that only escalates ambiguous cases to a full LLM classification call, to reduce the per-turn cost of write-policy evaluation at scale.

### 3. Detect a stale-versus-current contradiction between two retrieved memories

~~~python
def resolve_contradiction(older: MemoryEntry, newer: MemoryEntry,
                           detect_contradiction_fn) -> MemoryEntry | None:
    """detect_contradiction_fn is a stand-in for an LLM call that judges
    whether two memory entries assert conflicting facts about the same
    topic. Returns the entry that should be preferred, or None if they
    are not actually contradictory (e.g. both can be true)."""
    verdict = detect_contradiction_fn(older.text, newer.text)
    if verdict == "not_contradictory":
        return None
    # Default policy: prefer the more recent entry when a genuine
    # contradiction is detected -- an explicit, documented choice, not
    # a universal truth; some domains may need a different tie-break
    # (e.g. prefer the entry with higher recorded importance instead).
    return newer if newer.timestamp > older.timestamp else older
~~~

Complexity: O(1) per pair checked; a real consolidation pass would need O(n^2) pairwise checks in the worst case for n entries on the same topic, which is why production systems typically restrict this check to entries already grouped by topic/category rather than comparing every entry against every other entry. Follow-ups: cluster entries by topic first (e.g. via embedding similarity) before running pairwise contradiction checks only within each cluster, to avoid the quadratic blow-up on a large store.
`,

  "hands-on-labs": `
### Lab 1 -- Short-term buffer with compaction (beginner, ~1.5h)
Implement a conversation buffer that tracks token count per turn and, once a configured threshold is exceeded, summarizes the oldest portion using a real LLM call and replaces the raw turns with the summary. Deliverable: a working module plus a short write-up comparing a response generated with the full raw history against one generated after compaction, on a conversation designed to test whether an important early detail survives. Skills exercised: short-term memory management, measuring information loss from summarization.

### Lab 2 -- From-scratch long-term memory store (beginner/intermediate, ~2h)
Using a real embeddings API, implement the long-term memory store from Coding Questions #1 (write, retrieve with combined similarity/recency/importance scoring, and compaction), and populate it with a synthetic multi-session conversation history. Deliverable: a demonstration that a fact stated in an early session is correctly retrieved in a much later session using unrelated-seeming phrasing, plus a second demonstration where retrieval fails on a genuinely dissimilar phrasing, with a written explanation of why. Skills exercised: retrieval mechanics, honest evaluation of retrieval-recall limitations.

### Lab 3 -- Write-policy and contradiction handling (intermediate, ~2.5h)
Extend Lab 2 with the selective write-policy classifier from Coding Questions #2 and the contradiction-resolution logic from Coding Questions #3. Deliverable: a test suite (see Testing) demonstrating that low-signal turns are not written, that a later contradicting fact is correctly preferred over an older one, and a written note on at least one case where your contradiction detection fails or gives an ambiguous result. Skills exercised: production-grade write/read policy design, honest evaluation of staleness handling's real limitations.

### Lab 4 -- Multi-user memory service with scoping and monitoring (production, ~3.5-4h)
Build a small service exposing memory-augmented conversation for multiple simulated users, with strict per-user scoping enforced at the retrieval-query level, a retention/expiry policy for stored memories, full logging of what was written and retrieved per call, and a small evaluation script measuring retrieval precision/recall against a hand-labeled test set. Deliverable: a running service, a passing cross-user isolation test (attempting and failing to retrieve one user's memory from another user's session), an evaluation report, and a short incident-response note describing what you'd check first if a user reported the agent "knew" something it should not. Skills exercised: the full production picture this page covers, tied together, plus a first taste of security-focused testing applied specifically to memory isolation.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate agent-memory mastery (each also reaches into a sibling skill):

1. **Personalized assistant with durable preference memory** -- An agent that learns and retains user preferences (communication style, stated restrictions, recurring requests) across sessions, using a selective write policy and a combined similarity/recency/importance read policy, with a demonstrated test case where a preference stated weeks earlier correctly influences a much later, differently-phrased request. Demonstrates: the full write/read policy design this page emphasizes, and a working retrieval-recall evaluation -- directly relevant to the **Vector Search** and **RAG** skills.

2. **Long-running research agent with staged compaction** -- An agent that performs a multi-step research task long enough to exercise multiple rounds of short-term buffer compaction, with instrumentation showing token cost and a measured information-loss comparison (does the compacted version still answer questions the raw transcript could answer) across compaction depth. Demonstrates: within-run memory management, honest measurement of lossy summarization -- bridges into the **Agent Fundamentals** and **Planning** skills.

3. **Multi-tenant support agent with contradiction handling and audit logging** -- A support-style agent serving multiple simulated customers, with strict per-tenant memory scoping, a periodic consolidation job that detects and resolves stale/contradicting stored facts, full audit logging of writes and retrievals, and a documented retention policy. Demonstrates: the production security and compliance discipline (Security, Production Checklist) applied end to end -- bridges directly into the **Tool Calling** and general **Security** skills.

Each project should include: explicit metrics on write-policy acceptance rate and retrieval precision/recall against a labeled test set (not just anecdotal examples), a documented rationale for the chosen retrieval depth and re-ranking approach, a passing cross-scope isolation test, and a written failure-mode analysis (what happens on a stale-fact scenario, what happens if the memory store is unavailable, what the retention policy covers) -- the engineering discipline around write and read policy is what distinguishes a fundamentals-level demo from a portfolio-grade project.
`,

  "case-studies": `
### The generative-agents memory-stream research and its influence on production design
Research demonstrating simulated agents with a continuous "memory stream" -- recording observations, periodically reflecting on them to form higher-level insights, and retrieving relevant memories by a combination of recency, importance, and relevance for planning -- popularized explicit, multi-factor memory scoring (not similarity alone) as a distinct design problem. Lesson: the combined-scoring read policy covered in this page's Intermediate and Advanced Concepts sections traces directly back to this line of research, and teams that adopted a similarity-only read policy without a recency or importance signal have consistently found it insufficient in practice.

### The shift from "store everything" to selective write policies in conversational products
Several teams building long-lived conversational assistants found that an unfiltered write policy (storing every turn verbatim) led to retrieval quality degrading measurably as stores grew, with genuinely important facts increasingly diluted among routine chit-chat. Moving to a selective, classification-gated write policy materially improved retrieval precision without a proportional loss of useful recall. Lesson: memory quality is much more a data-curation problem than a search-technology problem -- a better vector index does not fix a store full of low-signal content, exactly the same lesson **RAG** teams learn about document chunking and curation.

### Cross-tenant memory leakage as a security incident class
Multiple reported incidents across different products have involved a memory or context system surfacing one user's stored information into another user's session, traced back to missing or incorrectly applied scoping in the retrieval path rather than to any flaw in the underlying model. Lesson: per-user/tenant scoping at the retrieval-query level is a hard security requirement for any persistent memory system, not an optional configuration detail to add later -- this is one of the most consequential and most preventable lessons in this entire page.

### Coding assistants' procedural memory of project-specific conventions
Coding assistants that retain project-specific lessons (naming conventions, past review feedback, known pitfalls in a specific codebase) across sessions have shown materially better alignment with a team's actual conventions than assistants that treat every session as a blank slate, without requiring the user to restate the same guidance repeatedly. Lesson: procedural memory retrieved at decision time (right before a suggestion is made), not just conversation time, is where this category of memory earns its keep -- directly relevant to the **Tool Calling** and **Reflection** skills' territory around informing an agent's future actions with past outcomes.
`,

  comparisons: `
| Dimension | No memory (stateless) | Short-term buffer only | Long-term memory (retrieval-backed) | Long-term memory + summarization/consolidation |
|---|---|---|---|---|
| Persists within one session | No | Yes | Yes | Yes |
| Persists across sessions | No | No | Yes | Yes |
| Handles growing conversation cheaply | N/A (no growth handled) | No -- eventually truncates or hits context limit | Partially -- long-term store avoids resending everything, but within-session buffer still grows | Yes -- explicit compaction manages within-session growth alongside cross-session retrieval |
| Handles staleness/contradiction | N/A | N/A (recent-only, so less exposed) | Exposed unless explicitly handled | Better, via periodic consolidation, but never fully solved |
| Cost/latency profile | Lowest | Low, grows with conversation length until truncation | Moderate, dominated by retrieval depth (k) and embedding calls | Moderate, plus periodic (not per-call) consolidation cost |
| Best for | Fully stateless, single-shot tasks | Short-to-medium single-session conversations | Cross-session personalization, recurring users, long-lived agents | Production systems expecting long-lived, high-volume, multi-session usage |
| Where covered on this platform | **LLM Fundamentals** | This page, Beginner/Intermediate Concepts | This page, Intermediate/Advanced Concepts; retrieval mechanics in **Vector Search**, **Embeddings** | This page, Advanced Concepts and Production sections |

**How seniors choose**: start with no persistent memory at all and add only what the task demonstrably needs -- a short-term buffer if the conversation genuinely spans enough turns to risk truncation, long-term retrieval-backed memory only if cross-session continuity is a real product requirement (not merely a nice-to-have), and summarization/consolidation once measured store growth or measured staleness incidents justify the added complexity. Treat each step in this table as an explicit cost/complexity tradeoff taken on for a demonstrated need, not a default to reach for because a framework makes it easy to enable.
`,

  "related-technologies": `
- **Agent Fundamentals** -- the perceive-plan-act-observe loop this page's memory techniques operate on; read this first if you have not already, since the growing transcript it describes is exactly what short-term memory management manages.
- **LLM Fundamentals** -- tokens and the context window; every cost/latency argument in this page reduces to the token-budget reasoning covered there.
- **Embeddings** -- how text is converted into the vectors that make similarity-based long-term memory retrieval possible; a required foundation for this page's long-term-memory half.
- **Vector Search** -- the indexing and approximate nearest-neighbor search techniques that make retrieval over a large, growing memory store fast at scale; this page assumes that foundation and focuses on the policy layer built on top of it.
- **RAG** -- the closest sibling skill in terms of shared mechanism (embed, store, retrieve, inject) and shared failure modes (irrelevant retrieval, cost/latency tension); the key difference is what is being retrieved -- external documents in RAG, an agent's own history here.
- **Planning** -- a plan is itself a form of memory the agent must not lose track of across steps; this page's short-term memory techniques are directly relevant to how a plan survives a long-running task.
- **Reflection** -- a self-critique is only useful if it is remembered on a future attempt; procedural memory (this page's Intermediate Concepts) is the natural storage mechanism for lessons a reflection step produces.
- **Tool Calling** -- tool outputs are a common source of content a write policy might capture into memory, and share the same "treat as untrusted data" security discipline this page applies to retrieved memories.
- **LangChain** and **LangGraph** -- frameworks that provide memory components (buffers, summarizing memory, vector-store-backed memory) as reusable building blocks; this page's concepts explain what those components are actually doing under the hood.
- **Security** and **Guardrails** -- general disciplines that apply with extra force to a persistent memory store, given the cross-tenant leakage and memory-poisoning risks covered in this page's Security section.

On this platform, the natural path from here: **Agent Fundamentals** -> **Embeddings** and **Vector Search** (the retrieval foundation) -> **Agent Memory** (this page, the policy layer) -> **RAG** (the same retrieval pattern applied to external documents) -> **Planning** and **Reflection** (how memory feeds multi-step structure and self-improvement) -> a specific framework (**LangChain**, **LangGraph**) for implementation.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 -- check current framework documentation and recent release notes for anything more current, since memory architecture is one of the least settled, most actively evolving areas across the whole agent stack.

- Larger context windows across major model providers have reduced, but not eliminated, the pressure for aggressive within-session summarization -- a bigger context window helps short-term memory but does nothing for cross-session persistence, which remains a deliberate engineering problem regardless of context-window size.
- Dedicated memory-management libraries and services (offering configurable write policies, vector-backed long-term stores, and summarization pipelines as reusable components rather than hand-rolled per project) have continued to mature, though there is still no single dominant standard architecture, and different products make meaningfully different tradeoffs on write-policy defaults and staleness handling.
- Framework-level memory components in **LangChain** and **LangGraph** continue to evolve their default behaviors; always review a framework's actual default write policy and scoping guarantees against your specific requirements rather than assuming a sensible default, since this remains an area where defaults vary and change across releases.
- Research and product interest in explicit contradiction detection and memory consolidation (beyond simple recency weighting) is active but still far from a settled best practice -- treat any specific consolidation technique you read about as one reasonable approach among several being explored, not an industry-standard solution.
- The relationship between agent memory and retrieval-augmented generation continues to blur in practice, with some products and frameworks explicitly unifying "memory" and "RAG" retrieval into a single underlying store and pipeline -- worth watching, since it may simplify the engineering surface, but the underlying failure modes (stale/irrelevant retrieval, cost/latency tension) remain the same regardless of how the marketing frames it.

Given how unsettled this specific area is -- there is genuinely no consensus "best" memory architecture at the time of writing -- treat any specific product's or framework's memory design you read about as one point in an actively evolving design space, not a final answer.
`,

  "future-roadmap": `
Where the agent-memory picture is heading, and what is worth betting career time on:

1. **The core distinctions in this page (short-term versus long-term, the write/read policy framing, episodic/semantic/procedural) are durable conceptual tools** that will remain useful regardless of which specific vector database, embedding model, or framework component is current -- understanding these deeply is a better long-term investment than memorizing any one library's memory-component API.
2. **Contradiction detection and staleness handling are likely to remain an actively developing, imperfectly solved problem for the foreseeable future** -- there is no indication of an imminent, fully general solution, and betting on "measure and mitigate, rather than assume solved" is likely to remain the right posture.
3. **Growing context windows will keep shifting the pressure point from within-session buffering toward cross-session and cross-user memory design**, since no amount of context-window growth solves persistence across sessions by itself -- the engineering focus is likely to keep moving toward write-policy quality, retrieval precision, and privacy/retention design rather than raw context capacity.
4. **Privacy, retention, and cross-tenant isolation requirements for persistent agent memory are likely to face increasing regulatory and platform-level scrutiny** as long-lived, memory-augmented agents become more common in consumer and enterprise products -- treating retention policy and scoping as first-class production requirements now, rather than retrofitting them later, is likely to age well.
5. **The line between "agent memory" and "RAG" is likely to keep blurring at the tooling level**, even as the underlying engineering tradeoffs (what to store, what to retrieve, how to rank, how to handle staleness) remain conceptually the same regardless of which term a given product uses.

For your career: the highest-leverage, most durable skill from this page is the disciplined habit of treating memory as an explicit, testable, monitored system component with its own write and read policies -- rather than an implicit side effect of whatever a framework's default configuration happens to do -- and that discipline stays valuable even as the specific tools and architectures underneath it keep changing.
`,

  "cheat-sheet": `
~~~text
# --- Core mechanical fact ---
An LLM has NO memory of its own between calls -- every call is
stateless. "Agent memory" is always: what text gets put back into
the NEXT prompt, from where, and why. There is no fourth option
beyond: keep it in context, retrieve it from a store, or compress it.

# --- Short-term vs long-term ---
Short-term (working) memory : recent turns/transcript kept in the
                               current context window; session-scoped,
                               resent in full, gone when session ends.
Long-term memory             : embedded and stored externally (vector
                               store); persists across sessions;
                               retrieved SELECTIVELY by similarity,
                               not resent in full.

# --- Episodic / semantic / procedural (conceptual, not 3 DBs) ---
Episodic   : specific past event, tied to a time/occasion
Semantic   : general fact, independent of when learned
Procedural : how to do something, learned from past outcomes;
             retrieve at DECISION time, not conversation time

# --- Write policy (what gets stored, when) ---
NEVER default to "store everything verbatim" -- degrades retrieval
quality for everyone as the store grows.
DO: classify each turn -- durable fact/preference/lesson, or discard.
DO: attach timestamp + category/source metadata, unconditionally.

# --- Read policy (what gets retrieved, how) ---
Naive: top-k by embedding similarity alone -- INSUFFICIENT.
Better: similarity + recency weighting + importance weighting,
        re-ranked, then top-k selected for injection.
Tune k against MEASURED task quality -- more retrieved memories is
NOT automatically better; past a point it adds cost/latency AND noise.

# --- Memory compression ---
Trigger: buffer exceeds a token threshold.
Action: summarize oldest portion, replace raw text with summary.
Cost: LOSSY by construction -- measure what's lost, don't assume free.

# --- The memory-cost-latency tension ---
Every retrieved/kept memory = billed input tokens + processing time.
k=3 vs k=30 retrieved memories -> ~10x the memory-token cost, with
retrieval QUALITY not scaling the same way past a task-specific point.

# --- Failure modes (memorize these) ---
Stale/contradictory memory : similarity search has NO notion of
                              "superseded" -- old and new facts both
                              retrievable with no resolution signal
Unbounded memory growth     : permissive write policy -> store fills
                              with low-signal content, degrading recall
Cross-tenant leakage        : missing/weak per-user scoping at the
                              RETRIEVAL QUERY level -- a security bug
Privacy/PII retention risk  : no explicit retention/expiry policy for
                              anything that could contain personal data

# --- Production musts ---
Hard per-user/tenant scope filter on every write AND read query.
Selective write policy, never "store everything."
Timestamp + metadata on every write.
Re-rank beyond raw similarity (recency + importance).
Periodic (not per-call) consolidation: contradiction detection, expiry.
Pin the embedding model; re-embed store on any model change.
Treat retrieved memory as UNTRUSTED DATA, not a trusted instruction.

# --- Sibling skills map ---
Agent Fundamentals -> the loop whose transcript memory manages
Embeddings         -> converts text to vectors for similarity
Vector Search      -> indexing/ANN search that makes retrieval scale
RAG                -> same retrieve-and-inject pattern, for documents
Planning           -> a plan IS memory that must not be lost
Reflection         -> self-critique is only useful if remembered
Tool Calling       -> tool outputs are untrusted, same as memories
LangChain/LangGraph -> framework-level memory components
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Does an LLM remember anything between two separate calls? | No -- every call is stateless; memory is always text explicitly re-included in the next prompt by application code |
| What is short-term (working) memory? | Recent conversation/transcript kept and resent within the current context window; session-scoped, no persistence beyond it |
| What is long-term memory? | Externally stored (typically embedded) information that persists across sessions, retrieved selectively by similarity rather than resent in full |
| What are episodic, semantic, and procedural memory? | Episodic: a specific past event tied to an occasion. Semantic: a general fact independent of when learned. Procedural: knowledge of how to do something, from past outcomes |
| Why is a naive top-k-similarity read policy insufficient? | It measures topical relatedness, not correctness or currency -- it can retrieve a stale or contradicted fact with the same confidence as a current one |
| What's the default write-policy mistake teams make? | Storing every turn verbatim ("store everything"), which degrades retrieval quality as the store fills with low-signal content |
| Why isn't "retrieve more memories to be safe" free? | Every retrieved memory is billed as input tokens and adds processing time; past a point, more retrieved memories add noise, not signal |
| What is the single most consequential agent-memory security risk? | Cross-tenant/cross-user memory leakage from missing or weak scoping enforced at the retrieval-query level |
| How should stored memory be treated with respect to instructions? | As untrusted data to reason about, never as a trusted instruction -- the same discipline applied to tool outputs and retrieved documents |
| What's the standard (imperfect) mitigation for stale/contradictory memory? | Explicit timestamps plus recency-weighted re-ranking, and a periodic consolidation pass -- none of these fully solve the problem |
| What must be true before changing the embedding model used for a memory store? | The existing store must be re-embedded with the new model; old and new vectors are not comparable |
| What's the relationship between agent memory and RAG? | Same core mechanism (embed, store, retrieve, inject) and mostly the same failure modes; RAG retrieves external documents, agent memory retrieves the agent's own history |
| When is procedural memory retrieved? | At decision time (right before choosing an action), not at conversation time |
| What must be defined before shipping any memory system that could store PII? | An explicit retention/expiry policy, enforced by a periodic maintenance process |
| What is the highest-leverage lever for improving retrieval quality in most systems? | Tightening the write policy -- a store with less low-signal content improves both quality and search cost, more than most read-side tuning does |
`,

  mcqs: `
**1. Which statement about LLM memory between calls is correct?**

A) The model retains a hidden internal state across separate API calls  B) Every call is stateless; anything resembling memory is text explicitly reincluded in the next prompt by application code  C) Memory is automatically handled by the model provider's servers with no application involvement  D) Only fine-tuned models can remember prior calls

**Answer: B** -- this is the single most important mechanical fact in this skill; every memory technique is an answer to "what text goes back into the next prompt."

**2. Why is a bare top-k-by-embedding-similarity read policy considered insufficient for production agent memory?**

A) Similarity search is too slow at any scale  B) It cannot distinguish a current fact from an older, contradicted one, since both can be equally similar to a query  C) Embeddings cannot represent facts, only conversational tone  D) It always returns exactly one result

**Answer: B** -- similarity measures topical relatedness, not correctness or currency; this is the core of the stale/contradictory-memory failure mode covered in Advanced Concepts.

**3. What is the most common and most consequential write-policy mistake teams make?**

A) Never writing anything to long-term memory  B) Writing every single turn verbatim to long-term memory with no filtering  C) Writing only procedural memories  D) Requiring human approval before every memory write

**Answer: B** -- an unfiltered "store everything" policy fills the store with low-signal content, degrading retrieval quality for genuinely important facts.

**4. A memory system retrieves one user's stored facts into a different user's session. What kind of problem is this?**

A) A minor quality bug, low priority  B) A security/privacy incident caused by missing or weak per-user/tenant scoping at the retrieval-query level  C) Expected behavior of any shared vector store  D) A sign that retrieval depth (k) is set too high

**Answer: B** -- cross-tenant leakage is one of the most serious and most avoidable failure modes specific to persistent agent memory.

**5. Why should retrieval depth (k) be tuned against measured task quality rather than maximized?**

A) Vector databases charge per retrieved item at a fixed high rate regardless of k  B) More retrieved memories increases token cost and latency, and past a task-specific point adds irrelevant noise rather than missing signal  C) k has no effect on cost or quality  D) Retrieval only works correctly when k equals 1

**Answer: B** -- this is the cost/latency/relevance tension covered in Advanced Concepts and Performance; more is not automatically better.

**6. What is the standard, though imperfect, mitigation for stale or contradictory stored memories?**

A) Deleting the entire memory store weekly  B) Explicit timestamps with recency-weighted re-ranking, plus a periodic consolidation pass that detects and resolves contradictions  C) Increasing the embedding model's dimensionality  D) There is no known mitigation, so the problem should be ignored

**Answer: B** -- and it is important to be honest that these mitigations reduce, but do not fully eliminate, the risk; this remains a genuinely unsettled area of agent-memory engineering.
`,

  "revision-notes": `
**What agent memory is, in five lines:** An LLM has no memory of its own between calls -- every call is stateless, and anything that looks like memory is text application code explicitly re-included in the next prompt. Short-term memory keeps recent conversation/transcript within the current context window, session-scoped and gone once the session ends. Long-term memory externally stores information (typically as embeddings in a vector store) and persists across sessions, retrieved selectively by similarity rather than resent in full. Memory compression (summarization) trades detail for token cost, deliberately and lossily. These three techniques -- keep in context, retrieve from a store, compress -- are the entire toolkit; every framework's memory feature is a variation on combining them.

**The three memory kinds, in three lines:** Episodic memory records specific past events tied to an occasion; semantic memory holds general facts independent of when they were learned; procedural memory captures how to do something, typically learned from past outcomes and best retrieved at decision time rather than conversation time. This is a conceptual distinction useful for reasoning about write and read policy, not a mandate for three separate storage systems.

**Write and read policy, in four lines:** A write policy decides what, if anything, from a completed turn gets committed to long-term memory -- a selective, classification-gated approach beats "store everything," which degrades retrieval quality as the store fills with low-signal content. A read policy decides what gets retrieved and injected into the prompt -- similarity alone is insufficient, since it has no notion of currency or importance; production systems re-rank by combining similarity with recency and a recorded importance signal.

**The core tension and failure modes, in four lines:** Every piece of memory included in a prompt is a real cost and latency tax, and past a point additional retrieved memory adds noise rather than signal -- retrieval depth is a tuned parameter, not a dial to maximize. The core failure modes are stale/contradictory memory (retrieval finds relevant text, not necessarily current or true text), unbounded memory growth (a permissive write policy), and privacy/security risk (cross-tenant leakage from weak scoping, and PII retention with no explicit expiry policy) -- none of these are fully solved problems, and this page is honest that they remain standing operational risks to monitor, not bugs fixed once.

**Production and the sibling-skill map, in three lines:** Production memory systems separate short-term and long-term storage explicitly, scope every write and read by user/tenant as a hard query-level filter, and run contradiction detection and retention enforcement as periodic background processes rather than per-call. Embeddings and Vector Search provide the retrieval foundation; RAG shares the same mechanism and failure modes applied to external documents; Planning and Reflection depend on memory to carry plans and lessons forward; LangChain and LangGraph provide framework-level memory components built on exactly these concepts.
`,

  "learning-roadmap": `
A realistic path through agent memory and into the sibling skills (adjust pace to your background):

**Week 1 -- Prerequisites check.** If you have not already, work through **Agent Fundamentals** and the core of **LLM Fundamentals**' tokens/context-window material, and **Embeddings**. Milestone: you can explain, precisely, why an LLM has no memory of its own and why every memory technique is really a question about what goes back into the next prompt.

**Week 2 -- Short-term memory and compaction.** Beginner and the first half of Intermediate Concepts here; run Lab 1 (short-term buffer with compaction). Milestone: you can implement a token-budgeted buffer with a working summarization trigger and can articulate what information a given compaction step loses.

**Week 3 -- Long-term memory and retrieval policy.** The rest of Intermediate Concepts, plus Advanced Concepts (the cost/latency tension, the decision table); run Lab 2 (from-scratch long-term memory store). Milestone: you can implement write and read policies beyond naive similarity search, and can explain at least one case where retrieval genuinely fails and why.

**Week 4 -- Staleness, contradiction, and security.** Security, Anti-Patterns, and Failure-mode-adjacent sections (Common Mistakes, Common Errors); run Lab 3 (write-policy and contradiction handling). Milestone: a test suite demonstrating correct preference of a newer fact over an older contradicting one, and an honest written note on where your contradiction handling still falls short.

**Week 5 -- Production discipline.** Production Usage through Production Checklist sections; run Lab 4 (multi-user memory service with scoping and monitoring). Milestone: a deployed, monitored memory service with a passing cross-user isolation test and a documented retention policy.

**Week 6 onward -- Branch into the sibling skills based on your immediate need**: go to **Vector Search** next if retrieval scale or precision is your bottleneck; go to **RAG** if you need the same pattern applied to external documents rather than an agent's own history; go to **Planning** or **Reflection** if your priority is how memory feeds multi-step task structure or self-correction; go to **LangChain** or **LangGraph** once you know which framework's memory components you will build on. Most engineers should read **Vector Search** immediately after this page if they have not already, since retrieval quality is the highest-leverage lever on almost everything covered here.
`,

  "official-docs": `
- Provider embeddings-API documentation (OpenAI, Anthropic, Google, and other model/embedding providers) -- the ground truth for current embedding model options, dimensionality, and pricing; check live docs rather than a remembered model name, since these change frequently.
- Vector database documentation (for whichever vector store you use in production) -- the authoritative source for indexing, filtering/scoping syntax, and approximate nearest-neighbor tuning options; see the **Vector Search** skill for how these apply generally.
- Framework documentation for **LangChain** and **LangGraph** memory components -- each sibling skill on this platform links to and builds on the respective framework's official docs for implementation-level memory-component detail beyond this page's framework-agnostic scope.
- Provider release notes for embedding-model updates -- typically describe changes to embedding dimensionality, pricing, and compatibility, all directly relevant to the "pin the embedding model, re-embed on change" guidance in this page's Best Practices.
`,

  books: `
- **Designing Data-Intensive Applications** -- Martin Kleppmann. Not memory-specific, but the treatment of data storage, consistency, and staleness generalizes directly to reasoning about a memory store's contradiction and staleness challenges.
- **Artificial Intelligence: A Modern Approach** -- Russell & Norvig. The classical-AI lineage of the episodic/semantic/procedural memory vocabulary this page borrows, predating and underlying the LLM-specific patterns covered here.
- **Designing Machine Learning Systems** -- Chip Huyen. General production-systems framing (monitoring, evaluation, data quality) that applies directly to treating a memory system as a first-class, testable component rather than an implicit prompt-construction detail.
- Framework-specific documentation-as-book resources (official guides published alongside **LangChain** and **LangGraph**) -- treat these as the practical companion to this page's conceptual grounding, and check them for the current memory-component API surface rather than relying on a fixed edition.

Given how fast this specific area moves and how unsettled best practice still is, prioritize the **Research Papers** and **Blogs** sections below, and current vector-database and framework documentation, over any book for current specifics -- books are best here for durable conceptual foundations, not current framework-component behavior.
`,

  blogs: `
- **Provider engineering/research blogs** (OpenAI, Anthropic, Google DeepMind) -- high-signal source for how organizations building agent and memory toolkits describe their own design choices and observed production lessons.
- **LangChain's official blog** -- practitioner-oriented posts on memory-component design patterns, common pitfalls, and framework updates, often directly reflecting the write/read policy concepts covered on this page.
- **Vector database vendor blogs** (for whichever vector store you use) -- practical, engineering-grounded posts on retrieval tuning, scaling, and real production case studies, complementary to the **Vector Search** skill's territory.
- **Simon Willison's blog** -- consistently clear, skeptical, practitioner-grounded writing on LLM agents and retrieval-augmented systems, including honest treatment of retrieval-quality limitations relevant to this page's failure modes.
- **Hugging Face blog** -- practitioner-oriented explainers on embeddings, retrieval, and memory-adjacent tooling in the open-source ecosystem.
`,

  "research-papers": `
Agent memory draws on both classical cognitive-architecture research and recent LLM-specific work; here are foundational and directly relevant papers, with honest framing of which claims are well-established versus still actively evolving:

- **Generative agents research on simulated believable agent behavior** (Park et al., 2023) -- the paper most directly responsible for popularizing an explicit "memory stream" architecture (recording observations, periodic reflection, and combined recency/importance/relevance retrieval) as a distinct design problem for LLM agents; foundational reading for the multi-factor read policy covered in this page's Intermediate and Advanced Concepts.
- **Classical cognitive-architecture research** (SOAR, ACT-R, and related work) -- not single papers but a decades-long research program establishing the episodic/semantic/procedural memory vocabulary this page borrows; useful background for why that vocabulary exists and what it originally meant before LLMs.
- **Retrieval-augmented generation foundational work** (Lewis et al., 2020, and related RAG literature) -- foundational for the embed-store-retrieve-inject mechanism this page applies to an agent's own history rather than external documents; see the **RAG** skill's Research Papers section for the fuller treatment.
- **Reflexion and related self-critique/verification papers** -- directly relevant to procedural memory's role in letting an agent learn from its own past outcomes, bridging into the **Reflection** skill's territory.
- **Long-context and context-window-scaling papers** (various, across major labs) -- relevant background for understanding why larger context windows reduce but do not eliminate the need for the memory techniques covered here, especially the cross-session persistence problem that context-window size alone cannot solve.

This area moves fast enough, and is unsettled enough, that the most current work on memory consolidation, contradiction detection, and long-term retrieval quality is best found via a live search of recent proceedings (NeurIPS, ICML, ACL) rather than a fixed list -- treat the papers above as the durable foundational layer, not the current frontier.
`,

  videos: `
- Conference talks and technical presentations from vector-database and agent-framework maintainers (covering **LangChain**, **LangGraph**, and major vector-database vendors) walking through real production memory architectures and lessons learned -- high-signal for connecting this page's concepts to concrete implementation choices.
- Recorded talks on the generative-agents memory-stream research listed in Research Papers -- useful for hearing the original authors' framing of recency/importance/relevance scoring directly.
- Practitioner walkthroughs of building a memory-augmented conversational agent from scratch (searching current video platforms for recent, well-regarded examples is more useful than any fixed recommendation here, given how quickly framework APIs change).
- University-level AI or cognitive-science course lecture recordings covering classical episodic/semantic/procedural memory theory as background before diving into the LLM-specific material on this page.
`,

  "github-repos": `
- **LangChain** and **LangGraph** repositories -- widely used frameworks with concrete memory-component implementations (conversation buffers, summarizing memory, vector-store-backed long-term memory); good for seeing real write/read policy code end to end.
- Vector database repositories (for whichever store you use, e.g. an open-source vector database project) -- useful for seeing indexing, filtering/scoping, and approximate nearest-neighbor search implemented concretely, complementary to the **Vector Search** skill.
- Generative-agents reference implementations (associated with the memory-stream research in Research Papers) -- useful for seeing a concrete, well-documented multi-factor read policy (recency, importance, relevance) implemented end to end.
- **RAG** reference implementations and frameworks -- useful for seeing the shared embed-store-retrieve-inject mechanism implemented for external documents, directly transferable to agent memory's own-history use case.
- Reflexion and similar self-critique/verification reference implementations -- useful for seeing procedural-memory-style lesson storage and retrieval implemented concretely, bridging into the **Reflection** skill.
- Embeddings-model client library repositories (for whichever provider you use) -- useful for seeing practical embedding-generation code, batching, and error handling patterns referenced throughout this page's examples.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Mechanics fluency*: implement the long-term memory store from Coding Questions #1 from memory, then extend it with the write-policy classifier from Coding Questions #2 without looking at the reference implementation.
2. *Write-policy judgment*: given 20 varied synthetic conversation turns (a mix of clearly durable facts, clearly low-signal chit-chat, and deliberately ambiguous cases), classify each as write-worthy or not, and defend your classification for the ambiguous ones.
3. *Retrieval-quality evaluation*: build a small labeled test set of 15 "should retrieve memory X given query Y" cases, including at least 5 where the correct memory is phrased very differently from the query, and measure recall for a similarity-only read policy versus a recency/importance-re-ranked one.
4. *Contradiction handling*: given 10 pairs of memories with deliberately conflicting facts (varying in how obviously they conflict), implement and test the contradiction-resolution logic from Coding Questions #3, and identify at least two pairs where your detection fails or is ambiguous.
5. *Security-scoping design*: given a hypothetical multi-tenant memory system with a described (flawed) scoping implementation, identify the specific vulnerability and rewrite the retrieval-query logic to close it, then write a test that would have caught the original flaw.
6. *Cost/latency tradeoff*: given a hypothetical per-token cost and a range of retrieval depths (k), compute the token-cost impact of increasing k, and separately design an experiment you would run to determine the k value past which retrieval quality stops improving for a specific task.

External sets: framework-specific memory-component quickstart tutorials (**LangChain**, **LangGraph**) as hands-on practice once the framework-agnostic concepts here are solid; any current **RAG**-evaluation benchmark's retrieval-quality test set as a way to practice measuring retrieval precision/recall in a closely related context.
`,

  "architecture-diagram": `
The reference architecture for a production memory-augmented agent feature -- the shape the sibling skills each go deep on one part of:

~~~mermaid
flowchart TB
    Client["Client application"] --> App["Application layer\n(session/user identification)"]
    App --> Orchestrator["Agent orchestrator / loop\n(Agent Fundamentals)"]
    Orchestrator --> ShortTerm["Short-term buffer\n(session-scoped, token-budgeted)"]
    ShortTerm --> Compactor["Compaction: summarize\noldest turns past threshold"]
    Orchestrator --> ReadPolicy["Read policy: embed query,\nsimilarity + recency + importance"]
    ReadPolicy --> Scope{"User/tenant scope\nfilter (hard, query-level)"}
    Scope --> VectorStore[("Long-term vector store\n(Vector Search / Embeddings)")]
    VectorStore --> ReadPolicy
    Orchestrator --> LLM["LLM call\n(system + retrieved memory +\nshort-term buffer + current turn)"]
    LLM --> WritePolicy["Write policy:\ndurable fact/preference/lesson?"]
    WritePolicy -->|yes| Embed["Embed + write\n(timestamp, category, scope)"]
    Embed --> VectorStore
    LLM --> App
    subgraph Maintenance["Periodic maintenance (not per-turn)"]
        Consolidate["Contradiction detection\nand resolution"]
        Retention["Retention / expiry / PII\npolicy enforcement"]
    end
    VectorStore --> Maintenance
~~~

Every labeled box in this diagram corresponds to a sibling skill on this platform: the embedding step and vector store -> **Embeddings** and **Vector Search**; the read/write policy layer -> this page's core territory; the same retrieve-and-inject mechanism applied to external documents instead of an agent's own history -> **RAG**; the orchestrator and its transcript -> **Agent Fundamentals**; how a plan or a self-critique gets carried forward via this same memory layer -> **Planning** and **Reflection**; the concrete implementation of the orchestrator itself -> **LangChain** or **LangGraph**.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Agent Memory))
    Mechanical fact
      LLM calls are stateless
      Memory = text re-included in next prompt
      No fourth option beyond context, retrieval, compression
    Short-term memory
      Conversation buffer
      Session-scoped
      Compaction / summarization
    Long-term memory
      Embedding + vector store
      Persists across sessions
      Retrieval by similarity
    Memory kinds
      Episodic
        Specific past events
      Semantic
        General facts
      Procedural
        How to do something
        Retrieved at decision time
    Write policy
      What gets stored
      Selective vs store-everything
      Metadata: timestamp, category, importance
    Read policy
      Similarity search
      Re-ranking: recency + importance
      Retrieval depth k tuning
    The core tension
      Memory richness vs cost/latency
      More retrieved memory is not free
    Failure modes
      Stale and contradictory memory
      Unbounded memory growth
      Cross-tenant leakage
      Privacy / PII retention risk
    Production discipline
      Hard per-user scoping
      Periodic consolidation
      Pinned embedding model
      Retention / expiry policy
    Sibling skills
      Agent Fundamentals
      Embeddings
      Vector Search
      RAG
      Planning
      Reflection
      Tool Calling
      LangChain
      LangGraph
~~~
`,
};

export default agentMemory;
