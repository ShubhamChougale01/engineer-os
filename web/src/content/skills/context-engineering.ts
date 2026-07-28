import type { SkillContent } from "../types";

/**
 * Context Engineering — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const contextEngineering: SkillContent = {
  overview: `
Context engineering is the discipline of deciding exactly what goes into an LLM's context window, in what form, in what order, and at what cost — so the model has the highest-quality signal available to do its job within a hard token budget. It is broader than "prompt engineering": prompt engineering is about wording one instruction well; context engineering is about curating the FULL payload sent on every call — the system prompt, few-shot examples, retrieved documents, tool/function schemas, prior conversation turns, working memory, and scratchpad state — so the model's limited attention is spent on what actually matters.

For an AI engineer, context engineering is the single highest-leverage skill for building agents and RAG systems that hold up in production, because most real failures are not "the model is dumb" — they are "the model was never given (or was given too much of) the right information." A frontier model handed a bloated, disorganized, 80,000-token context will underperform a smaller model handed a clean, well-ranked 4,000-token context. This page treats the context window as a scarce, expensive, attention-diluting resource, and teaches the techniques to manage it: compression, retrieval and reranking, prompt caching, structuring/ordering, and multi-turn memory management.

Key characteristics of the discipline: it is empirical (you measure what helps with evals, not guess), it is economic (every token costs money and latency), it is architectural (it touches retrieval, memory, tool design, and orchestration — not just wording), and it degrades gracefully only if you design for degradation — models get measurably worse at using information buried in the middle of a long context, even when the nominal context window is huge. This skill sits next to and depends on **RAG**, **Vector Search**, **Embeddings**, **Agent Memory**, **Semantic Caching**, **Cost Optimization**, **Latency**, and **AI Evals** — context engineering is the connective discipline that makes all of them work together instead of fighting each other.
`,

  history: `
"Context engineering" is not a single invented technology with one founder — it is a discipline name that crystallized as the community realized prompt engineering alone did not explain why production LLM apps failed. The building blocks (retrieval-augmented generation, attention mechanisms, summarization) predate the term by years.

| Period | Milestone |
|--------|-----------|
| 2017 | "Attention Is All You Need" (Vaswani et al.) — the Transformer architecture that makes every token attend to every other token, the mechanical root of why context window size and quality both matter |
| 2020 | Retrieval-Augmented Generation (RAG) paper (Lewis et al.) formalizes retrieving documents into a model's context instead of relying purely on parametric memory |
| 2020–2022 | Early GPT-3 era: context windows of ~2K–4K tokens force aggressive prompt trimming; "prompt engineering" becomes the dominant vocabulary |
| 2022–2023 | Chain-of-thought, ReAct, and agent scratchpad patterns show that HOW you structure intermediate reasoning in-context changes output quality, not just the final instruction |
| 2023 | Context windows expand fast (32K, 100K, 200K+ token models ship); the "lost in the middle" research (Liu et al., 2023) shows retrieval accuracy drops for facts placed mid-context even when the window is technically large enough |
| 2023–2024 | Prompt caching / context caching ships in major LLM APIs, reusing computed key-value state for repeated prefixes — turning context engineering into a direct cost/latency lever, not just a quality one |
| 2024 | "Context engineering" becomes the community's preferred umbrella term (popularized in agent-building circles) precisely to distinguish it from prompt engineering — the point being emphasized is that curating retrieved context, memory, and tool outputs is now the dominant engineering problem in agent systems |
| 2024–2025 | Long-context and needle-in-a-haystack benchmarks become standard evaluation practice; compression techniques (e.g. LLMLingua-style prompt compression) and structured context scaffolding (XML/markdown sectioning) become common production patterns |

Treat exact model context-window sizes, pricing, and specific benchmark numbers as moving targets. My knowledge cutoff is January 2026, and even facts current as of then may already be stale — verify current context limits and prompt-caching terms against the provider's official docs before depending on a specific number in production.
`,

  "why-it-exists": `
Before context engineering had a name, three separate problems were each being solved ad hoc, badly:

1. **The context window is finite and expensive.** Every token in the prompt is paid for (input tokens are billed, and processing them adds latency before the first output token even appears). Teams were stuffing entire documents, entire conversation histories, and every tool's full output into every call, because it was the path of least resistance — and then wondering why costs and latency exploded.
2. **More context did not mean better answers.** As context windows grew from 4K to 100K+ tokens, engineers assumed "just put everything in" was now viable. Research and production experience showed the opposite: models are measurably less reliable at using facts placed in the middle of a long context than facts near the start or end — the "lost in the middle" effect — and needle-in-a-haystack style probes reveal degradation that a benchmark advertising "200K context" does not disclose.
3. **Prompt engineering vocabulary didn't cover the problem.** "Write a better instruction" is a small fraction of what actually determines agent quality. What matters more, in practice, is: which documents got retrieved, how they were ranked and truncated, whether stale conversation history was still present, whether a tool's raw JSON dump ate half the budget, and whether the system prompt was competing with retrieved content for the model's attention.

Context engineering exists to name and systematize the answer: treat everything that enters the context window as a budgeted, curated, ordered payload — not an ever-growing dumping ground. It reframes "prompt engineering" (word one instruction well) as one small piece of a bigger job: engineer the whole context.
`,

  "problem-it-solves": `
Context engineering removes concrete, recurring production pains:

- **Silent quality degradation from context bloat.** Without a discipline for what belongs in the window, contexts grow monotonically (every retrieved chunk kept "just in case," every tool result appended in full, every conversation turn preserved forever) until the model's effective accuracy drops — often without any error being thrown. Context engineering catches this with token budgets and evals before it reaches users.
- **Cost and latency creep.** Tokens cost money on both sides, and time-to-first-token scales with input length. Uncontrolled context growth is a silent cost/latency bug. Prompt caching and compression directly attack this — see the **Cost Optimization** and **Latency** skills for the broader economics.
- **The "lost in the middle" failure mode.** Even nominally-long-context models retrieve facts unreliably from the middle of a large context. Context engineering solves this with ordering (put the most decision-critical content near the start or end), reranking to shrink the candidate set, and summarization to remove noise before it ever competes for attention.
- **Stale or contradictory context in multi-turn agents.** Long conversations accumulate outdated facts, superseded tool results, and contradictory instructions. Without deliberate memory management (sliding windows, summarization checkpoints, explicit invalidation), agents confidently act on stale information — see the **Agent Memory** skill.
- **Tool-output flooding.** Agents that call many tools (search, code execution, APIs) can have their context window consumed entirely by raw JSON/HTML dumps from a single tool call, crowding out the actual task. Context engineering requires compressing and summarizing tool results before they re-enter the loop.

What context engineering deliberately does **NOT** solve: it does not make a weak model smart, it does not replace the need for good retrieval quality (garbage retrieved at the top of the ranking is still garbage, just well-placed garbage), and it does not eliminate the need for evaluation — you cannot know your context strategy is working without measuring it (see **AI Evals**). It is also not the same discipline as **Semantic Caching**, which caches whole responses by the meaning of a query; context engineering is about what goes INTO the window on every call, cached or not.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between prompt engineering and context engineering, and justify why the latter is the broader, more consequential discipline for agents and RAG systems.
2. Describe the "lost in the middle" effect and needle-in-a-haystack degradation, and design context layouts that mitigate them.
3. Build a token budget that allocates space across system prompt, few-shot examples, retrieved context, conversation history, tool schemas, and scratchpad — and defend the allocation with numbers.
4. Apply compression techniques (summarization, extractive/abstractive compression, hierarchical summarization, prompt-compression tools) to fit more useful signal into fewer tokens.
5. Combine retrieval and reranking to keep only the highest-value chunks in context, and articulate how this differs from and complements RAG's retrieval step.
6. Configure and reason about prompt caching (KV-cache reuse for repeated prefixes) — including when a cache hit happens, why it saves cost/latency, and how it differs from semantic response caching.
7. Structure a context payload (ordering, XML/markdown scaffolding, delimiters) so the model can reliably parse and prioritize it.
8. Design multi-turn agent memory: short-term sliding windows vs long-term summarized/stored memory, and when to checkpoint.
9. Evaluate context engineering decisions empirically, tying token cost and latency to measured answer quality rather than intuition.
10. Recognize context-window size claims for what they are — nominal capacity, not a guarantee of reliable recall across that capacity — and hedge accordingly when making architecture decisions.
`,

  prerequisites: `
- **Required**: a working understanding of how LLMs consume prompts (tokens, system/user/assistant roles) and basic familiarity with calling an LLM API. If you have not yet built anything with an LLM SDK, start with the **Prompt Engineering** and **LLM Fundamentals** skills first.
- **Required**: basic familiarity with embeddings and vector similarity — you cannot design retrieval-aware context strategies without knowing what a retrieved "chunk" is. See the **Embeddings** and **Vector Search** skills.
- **Helpful**: exposure to building a RAG pipeline end to end (see the **RAG** skill) — context engineering is largely about what RAG hands to the model, and how to trim/rank/compress it.
- **Helpful**: some experience building a multi-turn agent or chatbot, so the memory-management sections land concretely rather than abstractly.
- **For the caching sections**: passing familiarity with how attention/KV-cache works in transformers makes prompt caching intuitive rather than magical; not required, but the Internal Working section builds it from scratch.

Dependency links: **Prompt Engineering** + **Embeddings** + **Vector Search** → **RAG** → **this page** → **Agent Memory**, **Semantic Caching**, **Cost Optimization**, **Latency**, **AI Evals** all build on or interlock with context engineering directly.
`,

  "beginner-concepts": `
### What actually goes "in the context"

Every LLM call sends one flattened sequence of tokens, even though we mentally separate it into parts:

~~~text
[system prompt]
[few-shot examples, if any]
[retrieved documents / RAG chunks]
[tool/function schemas the model may call]
[conversation history: prior user/assistant turns]
[the current user message]
[scratchpad / working notes, for agents]
~~~

The model has no built-in concept of "this part is more important" — attention is learned, not declared. That is the entire reason context engineering exists: YOU decide what's in that sequence, and the model's output quality is a direct function of that decision.

### The context window is a token budget, not a "feature"

A "128K context window" is a hard ceiling on the total of input + output tokens (the exact split rules vary by provider — check current docs). Every component above eats into that same budget:

~~~python
# Illustrative token accounting for a single LLM call.
# Real tokenizers differ by model family; use the provider's tokenizer
# to count exactly rather than estimating word-count / 0.75.
budget_tokens = 128_000
reserved_for_output = 4_000          # leave room for the model's answer
usable_input_budget = budget_tokens - reserved_for_output

allocation = {
    "system_prompt": 800,
    "tool_schemas": 1_500,
    "few_shot_examples": 1_200,
    "retrieved_context": 6_000,       # from RAG — the biggest lever you control
    "conversation_history": 3_000,    # trimmed/summarized, not raw
}
used = sum(allocation.values())
print(f"used {used} of {usable_input_budget} input tokens")  # plan headroom, don't max it out
~~~

Production consideration: always reserve real headroom (not just enough for the expected output — enough for a longer-than-expected one) and fail predictably (truncate or summarize) rather than silently erroring when a request would exceed the window.

### Counting tokens, not estimating them

~~~python
# Never estimate tokens by character or word count in anything that touches
# a real budget — different tokenizers segment text differently, and code,
# non-English text, and JSON tokenize much less efficiently than prose.
import tiktoken  # OpenAI's tokenizer library; other providers expose their own

enc = tiktoken.get_encoding("cl100k_base")  # pick the encoding for your model family
text = "Retrieved document chunk goes here..."
token_count = len(enc.encode(text))
print(token_count)
~~~

### Why "just paste in the whole document" fails

A 50-page PDF pasted whole into a prompt is the single most common beginner mistake. It burns budget on boilerplate (headers, footers, repeated legal text), pushes the actually-relevant paragraph into the "lost in the middle" zone, and costs money on every single turn of a conversation if it's re-sent each time. The fix — covered across this page — is retrieval (only fetch relevant chunks, see **RAG**), compression (summarize before inserting), and caching (avoid re-paying for unchanged prefixes).

### A minimal, well-structured context payload

~~~python
# A deliberately small, well-organized system+user payload beats a huge,
# disorganized one. Notice: retrieved context is fenced and labeled, not
# just concatenated into the instructions.
system_prompt = (
    "You are a support assistant. Answer ONLY using the CONTEXT section. "
    "If the answer is not in CONTEXT, say you don't know."
)

context_block = "\\n\\n".join(
    f"[SOURCE {i+1}: {doc['title']}]\\n{doc['text']}"
    for i, doc in enumerate(top_ranked_chunks)  # already reranked, already trimmed
)

user_message = f"CONTEXT:\\n{context_block}\\n\\nQUESTION: {user_question}"
~~~

The labeled, delimited structure above is a beginner-level example of the "structuring context" idea developed fully in Intermediate and Advanced Concepts.
`,

  "intermediate-concepts": `
### Token budgeting across components, deliberately

A working professional's job is to turn the beginner "allocation dict" into a policy with rules, not fixed numbers:

~~~python
# A token-budget policy: retrieval gets what's left after fixed costs,
# and conversation history is capped and summarized rather than growing forever.
def build_budget(model_context_window: int, max_output_tokens: int) -> dict:
    fixed = {
        "system_prompt": 600,
        "tool_schemas": 1_200,       # grows with the number of tools — audit this
    }
    reserved = max_output_tokens
    remaining = model_context_window - sum(fixed.values()) - reserved
    # Split the remainder with a policy, not a guess:
    history_cap = min(remaining * 0.3, 4_000)     # history never dominates
    retrieval_cap = remaining - history_cap        # retrieval gets the rest
    return {**fixed, "conversation_history": history_cap, "retrieved_context": retrieval_cap}
~~~

Production consideration: log the actual token usage per component on every call (see Monitoring) so the budget policy is tuned against real traffic, not assumptions.

### Compression: summarization of history

~~~python
# Summarize older turns into a compact rolling summary instead of keeping
# every message verbatim. This is the single most common technique for
# controlling multi-turn conversation cost and avoiding "lost in the middle."
def maybe_compress_history(messages: list[dict], summarizer_llm, keep_last: int = 6) -> list[dict]:
    if len(messages) <= keep_last:
        return messages
    older, recent = messages[:-keep_last], messages[-keep_last:]
    summary_prompt = (
        "Summarize this conversation history into <150 words, preserving "
        "facts, decisions, and open questions. Drop small talk.\\n\\n"
        + "\\n".join(f"{m['role']}: {m['content']}" for m in older)
    )
    # Use a cheap/fast model for summarization — it's a utility call, not the main task.
    summary = summarizer_llm.complete(summary_prompt, max_tokens=200, timeout=10)
    return [{"role": "system", "content": f"Earlier conversation summary: {summary}"}] + recent
~~~

### Extractive vs abstractive compression

- **Extractive compression**: select and keep the most relevant existing sentences/spans verbatim (e.g. rerank sentences by relevance score, keep the top N). Cheap, faithful, but can lose connective context.
- **Abstractive compression**: have a model rewrite the content more densely (true summarization). Can preserve meaning better across a whole document but risks introducing subtle inaccuracies (a summarization hallucination is still a hallucination) — always eval abstractive compression against faithfulness, not just brevity.
- **Prompt-compression tooling** (LLMLingua-style approaches): use a small model to score token-level or sentence-level importance and drop low-information tokens from a prompt before sending it to the expensive model, often achieving large size reductions with modest quality loss on tasks that tolerate some lossiness. Treat published compression-ratio numbers as illustrative, not guaranteed — validate on your own task with your own evals.

### Retrieval and reranking as a context-shrinking step

Context engineering and **RAG** meet directly here: retrieval's job is not just "find relevant documents," it's "find the SMALLEST set of highest-value chunks so the context stays clean." A two-stage retrieve-then-rerank pipeline (fast vector search over a large candidate pool, then a slower but more accurate cross-encoder reranker over the top ~50) consistently beats "shove the top-20 vector-search hits into context" because reranking filters out near-duplicate or tangentially-relevant chunks before they dilute attention. See the **Vector Search** and **Embeddings** skills for the retrieval mechanics; this skill's job is what you do with the results once retrieved.

~~~python
# Illustrative reranking step: shrink 50 candidates down to the 5 that
# actually earn a place in the context window.
def select_context(query: str, candidates: list[dict], reranker, top_k: int = 5) -> list[dict]:
    scored = reranker.score(query, [c["text"] for c in candidates])  # cross-encoder relevance scores
    ranked = sorted(zip(candidates, scored), key=lambda p: p[1], reverse=True)
    return [c for c, _ in ranked[:top_k]]
~~~

### Structuring context for the model

Ordering and scaffolding measurably change reliability:

- **Recency and primacy**: put the most decision-critical instruction or fact near the START (system prompt) or the END (right before the question) — the two positions models attend to most reliably. Don't bury the key constraint in the middle of ten retrieved paragraphs.
- **Delimiters and labels**: fence retrieved content distinctly (XML tags like <context> or clearly labeled markdown sections) so the model can distinguish "trusted instruction" from "retrieved data" — this also raises the bar for prompt-injection attacks that hide instructions inside retrieved text (see Security).
- **Consistent formatting**: if every retrieved chunk is labeled the same way (source, title, snippet), the model learns the pattern within the prompt and uses it more reliably than inconsistent, ad hoc formatting.

~~~xml
<!-- Illustrative context scaffold — not a real XML schema, just consistent
     structure the model can learn to parse within a single prompt. -->
<system>
You are a policy assistant. Use only the documents in context. Cite source ids.
</system>
<context>
  <doc id="1" title="Refund Policy">Refunds are issued within 14 days...</doc>
  <doc id="2" title="Shipping Policy">Standard shipping takes 3-5 days...</doc>
</context>
<question>Can I get a refund after 20 days?</question>
~~~
`,

  "advanced-concepts": `
### The "lost in the middle" effect, precisely

Empirical studies of long-context models (notably Liu et al., 2023, "Lost in the Middle") found that retrieval accuracy over a long context is highest when the relevant fact sits near the beginning or end of the prompt, and measurably lower when it sits in the middle — a U-shaped performance curve — even though the model's stated context window comfortably fit the whole input. This is a property of how these models were trained and how attention patterns statistically favor edges, not a bug you can code around; you can only design around it (ordering, shrinking the candidate set via retrieval/reranking, or explicitly re-stating critical facts near the end of the prompt).

### Needle-in-a-haystack degradation vs nominal window size

A model advertising a 200K-token context window is not guaranteeing 100% recall at every position across 200K tokens. Needle-in-a-haystack benchmarks (insert one fact at varying depths in a long filler document, ask the model to retrieve it) reveal that recall reliability varies by position, by total context length, and by model — and these numbers change with every model release. Treat any specific benchmark figure (including ones you've seen quoted elsewhere) as a snapshot in time; re-run your own needle tests against the exact model version you plan to ship, as part of your **AI Evals** suite, rather than trusting a vendor's marketing page.

### Prompt caching — KV-cache reuse, not response caching

Transformers compute key/value (KV) tensors for every token in the context during the forward pass; this is the expensive part of processing a long prompt. Prompt caching (offered by major LLM APIs) lets the provider reuse the already-computed KV state for a REPEATED PREFIX of your prompt across calls, so you pay less and wait less for the portion of the context that didn't change.

~~~python
# Illustrative pattern: put the STABLE, REPEATED part of the prompt first
# (system prompt, tool schemas, a large static reference document), and the
# VARYING part (the user's specific question) last. Providers cache the
# stable prefix; only the varying suffix is computed fresh each call.
# Check your provider's current docs for the exact API shape and minimum
# cacheable prefix length — these details change between releases.
request = {
    "system": large_static_system_prompt,      # identical across many calls -> cache hit
    "context": large_static_reference_doc,     # also stable -> part of the cached prefix
    "messages": [{"role": "user", "content": this_turns_question}],  # varies -> always fresh
}
~~~

Why order matters: caching works on a PREFIX match — if you put the varying user question before the stable system content, you break the cache on every single call, because the very first tokens differ. Structure prompts stable-content-first specifically to maximize cache hits.

Prompt caching is economically distinct from **Semantic Caching**: prompt caching reuses computed transformer internals for an identical (or identical-prefix) request; semantic caching skips calling the LLM at all by matching a NEW query to a semantically similar PAST query and returning its stored response. You can and often should use both — semantic caching to avoid the call entirely, prompt caching to make the calls you do make cheaper.

### Hierarchical summarization for long conversations

A single rolling summary loses fidelity linearly as a conversation grows. Hierarchical (multi-level) summarization keeps this bounded:

~~~mermaid
flowchart TB
    T1["Turns 1-10"] --> S1["Summary A"]
    T2["Turns 11-20"] --> S2["Summary B"]
    T3["Turns 21-30"] --> S3["Summary C"]
    S1 & S2 & S3 --> M["Meta-summary\\n(summary of summaries)"]
    M --> C["Current context: meta-summary + last N raw turns"]
~~~

Each level compresses the level below it; only the meta-summary plus the most recent raw turns enter the live context window, bounding growth regardless of conversation length. This connects directly to the **Agent Memory** skill's short-term vs long-term memory split: short-term memory is the raw recent turns, long-term memory is the (possibly externally stored, retrievable) summary hierarchy.

### Tool-result compression for agentic loops

Agents that call search APIs, code execution, or other tools accumulate raw tool output in the context on every loop iteration. Left unmanaged, ten tool calls can consume the entire budget before the model even reasons about the answer.

~~~python
# Compress a tool's raw output before it re-enters context, keeping only
# what's relevant to the current step's goal.
def summarize_tool_result(raw_result: str, current_goal: str, summarizer_llm) -> str:
    if len(raw_result) < 500:   # small results don't need compression
        return raw_result
    prompt = (
        f"Extract only the information relevant to: {current_goal!r}\\n"
        f"From this tool output, in under 100 words:\\n{raw_result[:8000]}"
    )
    return summarizer_llm.complete(prompt, max_tokens=150, timeout=10)
~~~

Production consideration: cap the raw_result slice sent to the summarizer itself (shown above as [:8000]) — otherwise the "compression" step becomes its own uncontrolled-context problem.

### Context window sizes across model families — a caveat, not a table of numbers

Different model families ship with different nominal context windows, and these numbers change every few months as providers ship new versions. Two things matter more than memorizing a specific number: (1) nominal window size and RELIABLE usable window size are different things — always validate with your own needle-in-a-haystack and task-specific evals rather than assuming the advertised maximum is safely usable; (2) larger windows do not remove the need for retrieval and compression — they widen the room for error just as much as the room for content, and cost/latency scale with tokens used regardless of the ceiling. Check current, model-specific context limits and pricing directly against the provider's official documentation before committing to an architecture — do not rely on any number quoted from training data as still accurate.
`,

  "internal-working": `
Context engineering decisions matter because of how transformer attention actually processes the sequence you send it. At a mechanical level:

~~~mermaid
flowchart LR
    A["Your assembled context\\n(system + retrieved + history + tools + query)"] --> B["Tokenizer"]
    B --> C["Token embeddings + positional encoding"]
    C --> D["Self-attention layers:\\nevery token attends to every other token"]
    D --> E["KV cache built per token\\n(reusable if prefix repeats)"]
    E --> F["Next-token prediction, autoregressively"]
    F --> G["Output tokens"]
~~~

1. **Tokenization**: your assembled context (every component you chose to include) is split into tokens by the model's tokenizer. Different content types tokenize at different densities — natural-language prose is efficient; JSON, code, and non-Latin scripts often use more tokens per "unit of information," which is one concrete reason to summarize raw tool JSON before inserting it.
2. **Positional encoding**: each token gets a representation of both its content and its position in the sequence. This is part of the mechanical root of position-dependent recall (the "lost in the middle" effect) — the model's learned attention patterns statistically favor certain positions, shaped by the distribution of training data (where important information more often appeared near the start/end of documents).
3. **Self-attention**: every token computes attention scores against every other token in the context (in the standard architecture, this is quadratic in sequence length, which is also the computational reason long contexts cost more and process more slowly — see Performance). More tokens in context = more competing signal for the model to weigh, not "more knowledge for free."
4. **KV cache**: during generation, the model caches the key/value projections it computed for already-processed tokens so it doesn't recompute them for every new output token. Prompt caching (Advanced Concepts) exposes exactly this internal mechanism across separate API calls: if a new request shares an identical prefix with a previous one, the provider can reuse the previously computed KV state for that prefix instead of recomputing it, which is why prefix STABILITY (put static content first) is the deciding factor in whether you get a cache hit.
5. **Autoregressive generation**: the model produces output tokens one at a time, each conditioned on the entire context plus previously generated output tokens. This is why front-loading critical constraints in the system prompt shapes the ENTIRE output, while a constraint buried at the very end of a long context competes with everything the model already attended to.

The practical takeaway for context engineering: every token you add is not "free extra memory" — it is additional content that dilutes attention, costs compute quadratically in sequence length, and either helps or hurts cache reuse depending on where it sits in the sequence.
`,

  architecture: `
Context engineering shows up as a distinct layer in an LLM application's architecture — usually called a **context assembler** or **context builder** — sitting between retrieval/memory systems and the LLM call itself.

### System architecture

~~~mermaid
flowchart TB
    U["User query"] --> R["Retriever\\n(Vector Search / RAG)"]
    U --> M["Memory store\\n(Agent Memory: short + long term)"]
    R --> RR["Reranker"]
    RR --> CB["Context Assembler"]
    M --> CB
    TS["Tool schemas registry"] --> CB
    SP["System prompt template"] --> CB
    CB --> BUD{"Fits token budget?"}
    BUD -->|no| COMP["Compressor\\n(summarize / extract / prune)"]
    COMP --> CB
    BUD -->|yes| CACHE["Cache-aware ordering\\n(stable prefix first)"]
    CACHE --> LLM["LLM API call"]
    LLM --> OUT["Response"]
    OUT --> M
~~~

### Application layout for a service that does context engineering seriously

~~~text
myagent/
├── context/
│   ├── budget.py         # token budget policy per model/config
│   ├── assembler.py      # orders + assembles final prompt payload
│   ├── compressor.py     # summarization / extractive compression
│   └── cache_policy.py   # decides prefix layout for prompt-caching
├── retrieval/            # see RAG / Vector Search skills
├── memory/               # see Agent Memory skill — short/long-term stores
├── tools/                # tool implementations + schemas
├── evals/                # needle-in-haystack, faithfulness, cost/quality tradeoff tests
└── api/                  # the service entrypoint (FastAPI etc.)
~~~

The architectural discipline: the context assembler is the ONLY place that decides the final prompt shape. Retrieval, memory, and tools each produce candidate content; they do not decide how much of it survives into the final context — that decision belongs to the assembler, governed by the budget policy, so it's auditable and testable in one place instead of scattered across the codebase.
`,

  "data-flow": `
Trace one turn of an agent conversation that uses retrieval, memory, and tools, through the context-engineering lens:

~~~mermaid
sequenceDiagram
    participant U as User
    participant App as Application
    participant Mem as Memory store
    participant Ret as Retriever + Reranker
    participant CB as Context Assembler
    participant LLM as LLM API

    U->>App: new message
    App->>Mem: fetch relevant short/long-term memory
    Mem-->>App: recent turns + summarized history
    App->>Ret: retrieve candidates for this query
    Ret->>Ret: vector search (wide) -> rerank (narrow)
    Ret-->>App: top-k relevant chunks
    App->>CB: assemble(system, tools, memory, retrieved, query)
    CB->>CB: check token budget
    alt over budget
        CB->>CB: compress (summarize/prune lowest-value items)
    end
    CB->>CB: order stable content first (cache-aware)
    CB->>LLM: final prompt payload
    LLM-->>App: response (+ maybe tool calls)
    App->>Mem: persist this turn (raw + update summary if needed)
    App-->>U: response
~~~

The critical junctions where context engineering acts: (1) retrieval returns candidates, but reranking and top-k selection decide what SURVIVES; (2) the assembler enforces the budget, compressing rather than blindly truncating when over budget; (3) ordering is decided last, specifically to maximize prompt-cache hits on the stable portions across turns. If a tool call happens mid-turn, its raw result re-enters this same pipeline (through the compressor) before the next LLM call, rather than being appended raw.
`,

  "production-usage": `
### How real teams operationalize context engineering

- **A dedicated context-budget config, not scattered constants.** Mature teams define budget policy (per model, since different models have different windows and pricing) in one config file, versioned like any other production config, and log actual usage against it per request.
- **Retrieval and reranking as a pipeline stage, not inline code.** Production RAG systems separate "get candidates" (vector search) from "select what enters context" (rerank + top-k + dedup near-duplicate chunks) as an explicit stage — see the **RAG** and **Vector Search** skills for the retrieval mechanics this stage depends on.
- **Cache-aware prompt templates.** Teams using prompt caching structure their prompt TEMPLATES (not just individual calls) so static content (system prompt, tool schemas, long reference documents) always occupies the same leading token span, maximizing cache hit rate across the whole traffic pattern, not just within one conversation.
- **Summarization as a scheduled/triggered job, not ad hoc.** Long-running agent sessions trigger summarization at defined checkpoints (every N turns, or when history exceeds a token threshold) rather than summarizing reactively mid-request, which adds latency to the user-facing call. Some teams run summarization asynchronously right after a turn completes, so it's ready before the next turn needs it.
- **Per-component token logging.** Every production LLM call logs how many tokens went to system prompt, retrieved context, history, and tools separately — this is what makes it possible to see "retrieval context ballooned last week" instead of just "cost went up."
- **Config-driven top-k and compression thresholds**, tuned by evals (see **AI Evals**) against real task performance, not fixed once and forgotten — the right top-k for a legal-document RAG system and a customer-support FAQ bot are different, and drift as document corpora and query patterns change.
`,

  "industry-examples": `
- **Anthropic and OpenAI**: both ship prompt/context caching directly in their APIs specifically because customers were re-sending large, static system prompts and reference documents on every call — a canonical, provider-level acknowledgment that context reuse is a first-class production concern, not a niche optimization.
- **Perplexity and other answer-engine products**: their core product loop is retrieval + reranking + careful context assembly — deciding which of many retrieved web sources actually earn a place in the model's context, in what order, with citations mapped back to specific source spans — is effectively their core context-engineering problem, distinct from and on top of the underlying model.
- **GitHub Copilot / AI coding assistants**: these systems assemble context from multiple sources under tight latency budgets — open files, cursor position, recently edited files, repository structure — deciding what fraction of a large codebase's signal fits in a small, fast-response context window is a textbook context-engineering problem specific to code assistants.
- **Customer-support and enterprise RAG vendors** (the broad category of "chat with your docs" products): the entire commercial value proposition rests on context engineering quality — retrieving the right policy paragraph, compressing conversation history so support agents' long sessions don't degrade answer quality, and citing sources faithfully. Vendors in this space differentiate primarily on retrieval + context assembly quality, not on which base LLM they call.
- **Long-context research and evaluation groups** (both inside major labs and independent researchers) publish needle-in-a-haystack and "lost in the middle" style benchmarks specifically because customers of long-context models kept discovering degraded reliability in production that the nominal context-window marketing number didn't predict — this research directly shaped how teams now validate context strategies before shipping (see AI Evals).

Pattern to notice: no serious production team treats "put more in the context window" as a strategy on its own — the common thread is always retrieval quality, compression discipline, and cache-aware structuring layered on top of whatever the underlying model provides.
`,

  "best-practices": `
1. **Budget every component explicitly** — system prompt, tool schemas, retrieved context, history, scratchpad — and log actual token usage per component on every call. You cannot manage what you don't measure.
2. **Retrieve narrow, then rerank narrower still.** A large vector-search candidate pool followed by a reranker and a small top-k beats dumping many marginally-relevant chunks into context.
3. **Put the most decision-critical content near the start or the end of the prompt**, never buried alone in the middle, given the "lost in the middle" effect.
4. **Compress before you truncate.** Truncation silently drops information; summarization preserves the gist. Prefer summarizing older history and low-value tool output over hard-cutting it.
5. **Structure context with consistent delimiters/labels** (XML tags or consistent markdown sections) so the model can reliably distinguish instructions from retrieved data — this also raises the bar against prompt injection hidden in retrieved content (see Security).
6. **Order prompts for cache hits: stable content first, variable content last.** This is nearly free to implement and directly cuts cost and latency when using prompt caching.
7. **Never re-send content the model doesn't need this turn.** A tool result relevant to turn 3 is often irrelevant noise by turn 8 — actively prune, don't just accumulate.
8. **Checkpoint long conversations with hierarchical summarization**, not one ever-growing rolling summary, so quality degrades gracefully as sessions lengthen (see Agent Memory).
9. **Treat context-window size as "nominal capacity," not "reliable capacity."** Validate recall at the lengths and positions you'll actually use with your own needle-in-a-haystack evals before trusting a vendor's max-window number.
10. **Separate context engineering from response caching** — build both prompt caching (KV reuse) and semantic caching (skip the call) where applicable; they solve different cost problems and compose well together (see Semantic Caching).
11. **Make the context assembler a single, testable component** in your architecture, not logic scattered across retrieval, memory, and tool-handling code.
12. **Eval context strategy changes like you eval prompts** — A/B test top-k, compression thresholds, and ordering changes against task accuracy and faithfulness, not intuition (see AI Evals).
`,

  "anti-patterns": `
### "Just paste the whole document in" (context stuffing)

~~~python
# WRONG: dumping an entire 50-page document into every call regardless
# of relevance to the current question. Burns budget, dilutes attention,
# and re-costs money on every single turn if repeated across a conversation.
prompt = f"Here is the full manual:\\n{entire_manual_text}\\n\\nQuestion: {question}"

# RIGHT: retrieve only the relevant sections, rerank, and label them.
relevant_chunks = rerank(retrieve(question, corpus=manual_chunks), top_k=5)
context_block = "\\n\\n".join(f"[Section: {c.title}]\\n{c.text}" for c in relevant_chunks)
prompt = f"CONTEXT:\\n{context_block}\\n\\nQuestion: {question}"
~~~

### Unbounded conversation history

~~~python
# WRONG: keep appending every message forever — cost, latency, and
# "lost in the middle" quality all degrade as the conversation grows.
messages.append({"role": "user", "content": new_message})
# ... send ALL of "messages", unconditionally, every turn

# RIGHT: cap and summarize on a policy, as shown in Intermediate Concepts.
messages = maybe_compress_history(messages, summarizer_llm, keep_last=6)
messages.append({"role": "user", "content": new_message})
~~~

### Raw tool-output flooding

Appending an entire raw API/JSON response from a tool call directly into the agent's context, unfiltered, on every loop iteration — after a handful of tool calls, the "task" competes with megabytes of irrelevant JSON for the model's attention. Always compress tool results to what's relevant to the current step (Advanced Concepts) before they re-enter the loop.

### Burying the instruction in the middle

~~~text
WRONG:
[3000 tokens of retrieved context]
"Only answer in JSON matching this schema: {...}"   <- buried, easy to miss
[2000 more tokens of retrieved context]
[question]

RIGHT:
"Only answer in JSON matching this schema: {...}"   <- in the system prompt, up front
[retrieved context, clearly labeled]
[question]
"Remember: respond ONLY in the JSON schema above."  <- reinforced near the end too
~~~

### Breaking prompt caching by putting variable content first

~~~python
# WRONG: user-specific content first means the "stable" system prompt and
# reference doc never occupy an identical prefix across calls -> no cache hit.
prompt = f"{user_question}\\n\\n{static_system_prompt}\\n\\n{static_reference_doc}"

# RIGHT: stable content first, variable content last -> maximizes prefix
# reuse for prompt caching across many calls.
prompt = f"{static_system_prompt}\\n\\n{static_reference_doc}\\n\\n{user_question}"
~~~

### Treating context-window size as a quality guarantee

Assuming "the model has a 200K window, so I can just put everything in and it'll find what it needs" — ignores the lost-in-the-middle effect entirely and is the single most common architecture-level mistake teams make when long-context models first become available to them.
`,

  performance: `
### Measure first

~~~python
# Instrument every LLM call with per-component token counts and latency,
# BEFORE trying to optimize anything. You cannot fix what you haven't measured.
import time

def call_llm_with_metrics(context_parts: dict, llm_client, **kwargs):
    token_counts = {k: count_tokens(v) for k, v in context_parts.items()}
    full_prompt = assemble(context_parts)  # your assembler function
    start = time.perf_counter()
    response = llm_client.complete(full_prompt, timeout=30, **kwargs)
    elapsed = time.perf_counter() - start
    log.info("llm_call", tokens=token_counts, total_in=sum(token_counts.values()),
             latency_s=round(elapsed, 3))
    return response
~~~

### The optimization hierarchy (apply in order)

1. **Retrieve less, better.** Improve reranking and top-k selection before anything else — a smaller, higher-precision context is faster, cheaper, AND more accurate simultaneously. This is the rare optimization with no tradeoff.
2. **Compress what must stay.** Summarize history and tool output rather than sending raw text; this shrinks tokens without losing the gist, unlike blunt truncation.
3. **Exploit prompt caching.** Restructure prompts so static content forms a stable, reused prefix — this is close to a free win on both cost and time-to-first-token wherever your traffic repeats similar system prompts/reference material across calls.
4. **Reduce round trips, not just size.** An agent that calls 8 tools sequentially pays 8x the context-assembly and latency overhead; batch or parallelize tool calls where the task allows it (see the Latency skill for the broader picture).
5. **Right-size the model to the task.** A smaller/cheaper model for summarization and reranking utility calls, reserving the frontier model for the final reasoning step, keeps the expensive model's context lean and the overall pipeline cheaper.
6. **Only then, consider a larger context window** as a last resort for tasks that genuinely need broad context (e.g. whole-codebase reasoning) — and even then, validate reliability at that length with needle-in-a-haystack evals rather than assuming it "just works."

### Concrete numbers worth internalizing (order-of-magnitude, not precise)

Processing cost and latency scale with input tokens (and, due to the attention mechanism, scale worse than linearly as sequence length grows — see Internal Working). A prompt with twice the tokens is not simply twice the cost in wall-clock terms once you're deep into a very long context. Treat any specific per-token pricing or latency figure as something to verify against current provider docs at build time — these numbers move every few months and I will not repeat unverified specific figures here.
`,

  scalability: `
Context engineering intersects with scalability in two directions: scaling to more USERS (throughput) and scaling to longer SESSIONS/larger CORPORA (context growth over time).

### Scaling to more users

~~~mermaid
flowchart LR
    LB["Load balancer"] --> A1["App instance 1"]
    LB --> A2["App instance 2"]
    A1 & A2 --> VDB[("Vector store\\n(shared, RAG)")]
    A1 & A2 --> MEM[("Memory store\\n(Redis/Postgres, shared)")]
    A1 & A2 --> LLM["LLM API\\n(provider-side prompt cache)"]
~~~

Memory and retrieval stores must be shared, externalized services (not in-process state) so any app instance can serve any user's next turn — the same statelessness principle as any horizontally scaled service. Provider-side prompt caching benefits from MANY requests sharing the same stable prefix (e.g. the same system prompt across all users of a feature), so at scale, standardizing prompt templates across your fleet increases cache hit rate, not just per-conversation reuse.

### Scaling to longer sessions and larger corpora

| Bottleneck | Answer |
|------------|--------|
| Conversation grows unboundedly long | Hierarchical summarization checkpoints (Advanced Concepts), bounding context growth regardless of session length |
| Document corpus grows into millions of chunks | Better indexing/ANN search (see Vector Search) plus a reranking stage — retrieval quality, not context-window size, is the lever |
| Many tools, each with a schema, crowd the budget | Only expose the subset of tool schemas relevant to the current task/step, not the full tool registry on every call |
| Multi-agent systems where each sub-agent needs different context | Give each sub-agent its own scoped context assembly rather than sharing one giant shared context across all agents |
| Cost scaling linearly (or worse) with traffic | Prompt caching for stable prefixes + semantic caching for repeated queries (see Semantic Caching) attack cost from two different angles |

The core scalability insight specific to this discipline: context engineering makes the SYSTEM scale by keeping what enters each individual call small and well-chosen, even as the total data (conversation history, document corpus, tool surface) the system has access to grows without bound.
`,

  security: `
### Context-specific attack surface

1. **Prompt injection via retrieved content.** If a document retrieved from an external or user-uploaded source contains text designed to look like an instruction ("ignore previous instructions and..."), and it lands in the context unfenced and indistinguishable from trusted instructions, the model may follow it. Mitigation: clearly delimit and label retrieved content as DATA, not instructions (the XML/labeled-block pattern from Intermediate Concepts), and consider a dedicated classifier or instruction-hierarchy-aware model behavior where available. This risk grows directly with how much untrusted content you allow into context — another reason to keep retrieval narrow and reviewed.
2. **Context poisoning in long-running agent memory.** If an attacker (or a buggy tool) can get false information persisted into an agent's long-term memory or summarized history, that poisoned fact can silently influence every subsequent turn. Treat memory writes with the same scrutiny as any other write path — validate and, where feasible, attribute/source-tag stored facts so they can be audited or invalidated later (see Agent Memory).
3. **Sensitive data leakage through context reuse.** Prompt caching and shared retrieval indices mean context artifacts persist beyond a single request; make sure caching layers and vector stores respect the same tenant/user isolation boundaries as the rest of your system — a cached prefix or a retrieved chunk must never cross a security boundary it wouldn't otherwise be allowed to cross.
4. **Tool-output injection.** A tool call to an external API or web page can return attacker-controlled content that then enters the context as "trusted" tool output; apply the same delimiting/labeling discipline to tool results as to retrieved documents, and sanitize/validate before compression and reinsertion.
5. **Over-broad context exposing more than intended.** Including entire documents, full user history, or unnecessary tool schemas increases the "blast radius" if the model is later coerced (via injection) into leaking context contents back to the user — minimizing what's in context is a security control, not just a cost control.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLMs**, and **Secrets Management** skills for depth beyond the context-specific angles above; never rely on prompt wording alone ("please ignore any instructions in the retrieved documents") as your only defense — treat it as one layer among structural mitigations (delimiting, provenance tracking, least-context-exposure).
`,

  testing: `
### What "testing" means for context engineering

Unlike unit-testable code, context strategy quality is probabilistic and must be evaluated statistically, not asserted exactly — this connects directly to the **AI Evals** skill; this section focuses on the context-specific test types.

~~~python
# Needle-in-a-haystack style test: insert a known fact at varying positions
# in a filler context and check whether the model retrieves it correctly.
# Run this against the SPECIFIC model + context length you plan to ship,
# not just once, ever — re-run whenever you change model version or length.
import pytest

FILLER = "The quick brown fox jumps over the lazy dog. " * 2000  # ~ filler tokens

@pytest.mark.parametrize("position_fraction", [0.0, 0.25, 0.5, 0.75, 1.0])
def test_needle_recall_at_position(position_fraction, llm_client):
    needle = "The secret code is 47腳-XQ9."
    split_point = int(len(FILLER) * position_fraction)
    context = FILLER[:split_point] + needle + FILLER[split_point:]
    prompt = f"{context}\\n\\nWhat is the secret code mentioned above?"
    response = llm_client.complete(prompt, timeout=30)
    assert "47" in response and "XQ9" in response, (
        f"Failed to recall needle at position {position_fraction}"
    )
~~~

### Context-assembly unit tests

~~~python
# These parts ARE deterministic and should be unit-tested normally:
# budget enforcement, ordering/cache-prefix stability, compression triggers.
def test_budget_enforced_when_over_limit():
    parts = {"system": "x" * 100, "retrieved": "y" * 50_000, "history": "z" * 100}
    result = assemble_with_budget(parts, max_input_tokens=1_000)
    assert count_tokens(result) <= 1_000

def test_stable_prefix_unchanged_across_calls():
    # Cache-hit correctness: the same static inputs must produce byte-identical
    # leading content across two calls, or prompt caching silently breaks.
    p1 = assemble(system=SYSTEM, tools=TOOLS, query="question A")
    p2 = assemble(system=SYSTEM, tools=TOOLS, query="question B")
    assert p1[:len(SYSTEM) + len(TOOLS)] == p2[:len(SYSTEM) + len(TOOLS)]
~~~

### The senior testing doctrine for context engineering

- Separate **deterministic** tests (budget math, ordering, cache-prefix stability — normal unit tests, run on every commit) from **probabilistic** evals (needle recall, faithfulness, task accuracy — run on a schedule/nightly against a fixed test set, tracked over time as a metric, not a pass/fail gate alone).
- Faithfulness testing matters as much as recall: verify compressed/summarized context didn't introduce claims not present in the source (an LLM-as-judge check, or stricter, an entailment check).
- Regression-test context changes the same way you'd regression-test a prompt change — a top-k or compression-threshold tweak that improves cost can silently regress accuracy; always eval both dimensions together.
`,

  debugging: `
### The toolbox, in escalation order

1. **Log the exact assembled prompt for a failing request.** Before anything else, reproduce the failure by inspecting the FULL final prompt sent — not the pieces, the assembled whole — because ordering/truncation bugs only show up in the final artifact.
2. **Check token counts per component against the budget.** A silent truncation (retrieved context or history got cut mid-sentence) is one of the most common causes of "the model gave a weird/wrong answer" — verify nothing was chopped in a way that changed meaning.
3. **Bisect the context.** If a fact isn't being used correctly, try the same query with ONLY that fact in context (removing everything else) to confirm the model can use it at all — if it works isolated but fails in the full context, you have a lost-in-the-middle or attention-dilution problem, not a retrieval problem.
4. **Move the suspect content to the start or end and retest.** If moving a fact's position fixes the output, you've confirmed a positional degradation issue — the fix is ordering/reranking, not prompt wording.
5. **Check prompt-cache hit/miss where applicable.** Providers exposing cache statistics let you confirm whether your "stable prefix" assumption actually holds — a cache-miss on content you believed was static usually means a subtle non-determinism (a timestamp, a randomly-ordered dict, a non-deterministic retrieval tie-break) crept into what should be the fixed prefix.
~~~text
# Illustrative debugging checklist output, not a real API:
prompt_cache_stats(request_id)
  -> {"cached_prefix_tokens": 1200, "fresh_tokens": 340, "hit": true}
# If hit is unexpectedly false, diff today's "stable" prefix against
# yesterday's byte-for-byte to find what changed.
~~~
6. **Diff compressed vs original content for faithfulness drift.** If a summarization step is suspected of distorting meaning, diff the summary's claims against the source with an LLM-as-judge or entailment check — this isolates compression bugs from retrieval or ordering bugs.
7. **Re-run the specific needle-in-a-haystack test at the failure's context length and position** (see Testing) to confirm whether you've hit a known model-level degradation zone versus an application bug.
`,

  monitoring: `
Production visibility for context engineering rests on token-level and quality-level instrumentation together — cost dashboards alone hide quality regressions, and quality evals alone hide cost blowups.

### Per-component token metrics

~~~python
from prometheus_client import Histogram

CONTEXT_TOKENS = Histogram(
    "llm_context_tokens", "Tokens per context component",
    ["component"],  # system_prompt, retrieved, history, tools, scratchpad
)

def record_context_metrics(context_parts: dict) -> None:
    for name, text in context_parts.items():
        CONTEXT_TOKENS.labels(component=name).observe(count_tokens(text))
~~~

### What to track

- **Token usage per component, per route** — catches silent context bloat (e.g. retrieval starting to return larger chunks after a corpus update) before it shows up only as a cost-dashboard anomaly.
- **Prompt-cache hit rate** — a dropping hit rate on a route that should be stable is an early signal that something broke prefix determinism (see Debugging).
- **Retrieval precision proxies** — fraction of retrieved chunks actually cited/used in the final answer, if your pipeline can attribute this; a low ratio suggests over-retrieval diluting context.
- **Compression faithfulness spot-checks** — periodic LLM-as-judge sampling comparing summaries against source content, tracked as a metric over time, not just checked once at launch.
- **Task accuracy / faithfulness on a fixed eval set**, run on a schedule, correlated against any context-strategy config change (top-k, compression thresholds, budget splits) so regressions are caught before they reach users — see **AI Evals** for the broader evaluation discipline this plugs into.
- **Latency broken down by context-assembly time vs LLM call time** — a slow reranker or summarizer inflates user-facing latency just as much as a slow model call, but shows up in a different part of the trace (see the **Latency** skill).
`,

  deployment: `
### Deploying a context assembler as a first-class service component

~~~python
# A minimal, production-shaped context assembler module. It centralizes
# budget enforcement, compression triggering, and cache-aware ordering
# so no caller can accidentally bypass the policy.
from dataclasses import dataclass

@dataclass
class ContextBudget:
    max_input_tokens: int
    reserved_output_tokens: int
    history_fraction: float = 0.3  # remaining budget share reserved for history

def assemble_context(
    system_prompt: str,
    tool_schemas: str,
    retrieved_chunks: list[str],
    history: list[dict],
    query: str,
    budget: ContextBudget,
    compressor,
) -> str:
    fixed_tokens = count_tokens(system_prompt) + count_tokens(tool_schemas)
    remaining = budget.max_input_tokens - budget.reserved_output_tokens - fixed_tokens
    if remaining <= 0:
        raise ValueError("Fixed context alone exceeds budget — reduce tool schemas or system prompt")

    history_budget = int(remaining * budget.history_fraction)
    retrieval_budget = remaining - history_budget

    history_text = compressor.fit_history(history, max_tokens=history_budget, timeout=10)
    retrieved_text = compressor.fit_chunks(retrieved_chunks, max_tokens=retrieval_budget)

    # Stable content FIRST (cache-friendly), variable content LAST.
    return (
        f"{system_prompt}\\n\\n{tool_schemas}\\n\\n"
        f"CONTEXT:\\n{retrieved_text}\\n\\n"
        f"HISTORY:\\n{history_text}\\n\\n"
        f"QUESTION: {query}"
    )
~~~

Why each design choice matters: budget enforcement raises loudly (ValueError) rather than silently truncating fixed content the caller didn't control; history and retrieval each get a computed sub-budget rather than an ad hoc guess; the compressor is injected (a Protocol/interface, testable with a fake) rather than hardcoded, so summarization strategy can change without touching the assembler; ordering is fixed to keep static content first for cache reuse.

### Rollout practice

- Ship context-strategy changes (new top-k, new compression threshold, new budget split) behind a flag, A/B tested against your eval set and real traffic cost/quality metrics before a full rollout — treat it with the same rigor as a model version change.
- Version your prompt TEMPLATES (the static portions) explicitly — a silent template edit breaks prompt-cache assumptions across your fleet and is easy to lose track of without versioning.
- Keep the compressor's model choice configurable and monitored separately from the main task model — a cheap summarization model quietly degrading is a common, easy-to-miss production regression.
`,

  "production-checklist": `
Before a context-engineered agent or RAG system takes real traffic:

- [ ] Token budget explicitly defined per component (system, tools, retrieved, history, scratchpad), with reserved output headroom
- [ ] Retrieval + reranking pipeline in place — not raw top-k vector search results dumped straight into context
- [ ] Compression (summarization/extraction) triggers before hard truncation anywhere in the pipeline
- [ ] Context scaffolding uses consistent delimiters/labels distinguishing instructions from retrieved/tool data
- [ ] Prompt templates structured stable-content-first for prompt-cache reuse, and cache hit rate is monitored
- [ ] Hierarchical or checkpointed summarization for long-running conversations, not one unboundedly growing history
- [ ] Tool outputs compressed/filtered before re-entering the context on subsequent loop iterations
- [ ] Needle-in-a-haystack and faithfulness evals run against the SPECIFIC model version and context lengths in production use
- [ ] Per-component token usage logged and dashboarded; alerts on unexpected growth
- [ ] Prompt-injection mitigations applied to all externally-sourced content entering context (retrieved docs, tool results)
- [ ] Memory writes (long-term/session memory) validated and source-attributed where feasible, to limit context poisoning risk
- [ ] Multi-tenant isolation verified across shared caches, vector stores, and memory stores
- [ ] Cost and latency budgets tied to token usage, reviewed against real traffic, not assumed from vendor pricing pages alone
- [ ] Rollback plan for context-strategy changes (template/version pinning) if a rollout regresses accuracy or cost
`,

  "common-mistakes": `
1. **Assuming a bigger context window solves a quality problem.** It solves a CAPACITY problem; quality still degrades with poor ordering and low-precision retrieval regardless of how much room is available.
2. **Never measuring per-component token usage.** Teams optimize prompts by feel because they've never actually logged how many tokens go to each part of the context — you cannot improve what you don't measure.
3. **Treating truncation as compression.** Silently cutting the end (or middle) of retrieved content or history changes meaning; summarization preserves gist, hard truncation does not.
4. **Retrieving too much "to be safe."** More retrieved chunks feels safer but actively hurts accuracy past a point by diluting attention and pushing key facts into the lost-in-the-middle zone — precision beats recall once a document IS in the candidate pool.
5. **Ignoring prompt-cache prefix stability.** Small, invisible non-determinism (dict key ordering, timestamps, randomly-tie-broken retrieval results) in what should be a stable prefix silently kills cache hit rates and nobody notices until a cost review.
6. **Letting conversation history grow unboundedly.** Without a summarization checkpoint policy, cost, latency, and lost-in-the-middle risk all grow with every turn of a long session.
7. **Appending raw tool output every loop iteration.** In agentic loops, this is the fastest way to exhaust a context budget on noise rather than task-relevant signal.
8. **Conflating context engineering with prompt engineering.** Wordsmithing the instruction while leaving retrieval, ordering, and memory unmanaged fixes a small fraction of real production failures.
9. **Confusing prompt caching with semantic caching.** Assuming enabling one gives you the benefits of the other — they solve different problems (KV-cache reuse for identical prefixes vs skipping the LLM call for semantically similar queries) and are usually both worth implementing, not interchangeably.
10. **Skipping evals on context-strategy changes.** Changing top-k or a compression threshold "because it seems reasonable" without re-running faithfulness/accuracy evals is how quiet regressions ship.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Request rejected: context length exceeded | Assembled prompt exceeds the model's max tokens | Enforce a budget check BEFORE the call; compress or drop lowest-priority content, don't let the call fail |
| Model ignores an instruction that IS in the prompt | Instruction buried in the middle of a long context (lost-in-the-middle) | Move critical instructions to system prompt and/or restate near the end |
| Correct fact retrieved but not used in the answer | Fact present but diluted among many low-relevance chunks | Improve reranking / reduce top-k; verify with a bisection test (Debugging) |
| Prompt-cache hit rate unexpectedly low | Non-deterministic content in the "stable" prefix (timestamps, unordered dict serialization) | Diff the prefix byte-for-byte across calls; remove non-determinism from cached portion |
| Summary omits or invents a fact | Abstractive compression without faithfulness checking | Add an entailment/LLM-judge faithfulness check on summaries; fall back to extractive compression for high-stakes content |
| Agent loop context balloons after a few tool calls | Raw tool output appended unfiltered each iteration | Compress tool results to what's relevant to the current step before reinsertion |
| Answer quality degrades sharply in long sessions | No summarization checkpoint; raw history sent every turn | Add checkpointed/hierarchical summarization at a token or turn-count threshold |
| Retrieved content leaks across users/tenants | Shared vector store or cache without tenant scoping | Enforce tenant/user isolation in retrieval and caching layers |
| Model follows an instruction hidden inside retrieved text | Retrieved content not clearly delimited from trusted instructions | Fence/label retrieved content explicitly as data; treat as untrusted input |

The habit that matters: reproduce with the FULL assembled prompt logged, not the individual pieces — most context bugs only appear once everything is put together in the actual order sent.
`,

  faqs: `
**Q: Is context engineering just a rebrand of prompt engineering?**
No — prompt engineering is about wording one instruction well; context engineering is the broader discipline of deciding what enters the context window at all (retrieved documents, history, tool outputs, memory) and how it's structured and budgeted. Prompt engineering is one small piece of it.

**Q: If my model has a 1M-token context window, do I still need retrieval and compression?**
Yes. A larger window raises the ceiling on what CAN fit; it does not fix positional degradation (lost in the middle) or the cost/latency that scales with tokens used. Retrieval and compression remain the levers for quality and economics regardless of window size.

**Q: What's the difference between prompt caching and semantic caching?**
Prompt caching reuses computed transformer internals (KV cache) for a repeated PREFIX of a request — it's a cost/latency optimization at the token-processing level. Semantic caching (see the **Semantic Caching** skill) matches a new query to a semantically similar past query and returns its stored response, skipping the LLM call entirely. They address different problems and typically compose well together.

**Q: How much of my context budget should go to retrieved content vs conversation history?**
There's no universal ratio — it depends on the task. A document-QA system should weight heavily toward retrieved content; a long-running personal-assistant agent needs more history/memory budget. Set a policy, measure task accuracy against it with evals, and tune from there rather than guessing.

**Q: Should I summarize with the same model I use for the main task?**
Usually no — summarization and reranking are utility calls well-suited to a smaller/cheaper/faster model, keeping the expensive frontier model's calls reserved for the reasoning that actually needs it.

**Q: How do I know if my context strategy is actually working?**
Run needle-in-a-haystack tests at your production context lengths, and faithfulness/accuracy evals on a fixed test set, tracked over time and correlated with any strategy change — see **AI Evals**. Intuition about "this prompt looks fine" does not substitute for measurement.

**Q: Does context engineering replace fine-tuning?**
No — they solve different problems. Context engineering shapes what the model sees per call; fine-tuning changes the model's weights/behavior itself. Many production systems use both: a lightly fine-tuned or well-prompted base model plus disciplined context engineering on top.

**Q: What's the single highest-leverage context engineering change most teams should make first?**
Add retrieval + reranking with a small top-k instead of dumping large raw documents into context, and start logging per-component token usage. Both are cheap to implement and typically produce the largest immediate quality and cost improvement.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is context engineering, and how is it different from prompt engineering?* Context engineering is curating everything that enters the context window (retrieved docs, history, tool outputs, memory, schemas) under a token budget; prompt engineering is wording one instruction. The former is the broader, more consequential discipline for agents/RAG.
2. *What is the "lost in the middle" effect?* Models retrieve facts less reliably when they sit in the middle of a long context than near the start or end, even within a nominally large context window — mitigated by ordering, reranking to shrink the candidate set, and restating key facts near the end.
3. *Why would you compress conversation history instead of just sending all of it?* Unbounded history grows cost and latency linearly (or worse) and increases lost-in-the-middle risk; summarization keeps the gist while bounding growth.
4. *What's the difference between extractive and abstractive compression?* Extractive keeps original spans verbatim (faithful, may lose connective context); abstractive rewrites more densely via a model (can lose fidelity — must check for hallucinated claims).
5. *Why does ordering matter for prompt caching?* Caching reuses computed state for a matching PREFIX; if variable content comes first, no two requests share an identical prefix, so cache hits never occur. Stable content must lead.

**Senior:**

6. *Design a token budget policy for an agent with retrieval, memory, and 15 tools.* Discussion should cover: reserved output tokens, fixed costs (system prompt, tool schemas — noting these grow with tool count and may need per-task filtering), a policy split between retrieval and history budgets, compression triggers when over budget, and logging per-component usage to tune the policy against real traffic.
7. *Explain mechanically why "lost in the middle" happens.* Ties to attention patterns learned during training (favoring positions correlated with importance in training data distributions) and positional encoding; it's a property of the model, not something prompt wording alone fixes — answer should distinguish "can't fix" from "can design around" (ordering, reranking, restating).
8. *How would you validate that a context strategy change (e.g. new top-k) didn't regress quality?* A/B eval against a fixed test set measuring task accuracy/faithfulness alongside cost/latency, tracked over time — not a one-off manual check; strong answers mention needle-in-a-haystack re-validation if context length also changed.
9. *A production agent's cost tripled after adding a new tool. How do you debug it?* Check per-component token logging first (did tool schemas or its raw output balloon context?), verify whether raw tool results are being compressed before reinsertion, and check prompt-cache hit rate for regressions from non-deterministic prefix content.
10. *How do prompt caching and semantic caching differ, and would you use both?* Prompt caching reuses KV-cache state for identical prefixes (cost/latency optimization at the token level, always same query→same computation reused); semantic caching returns a stored response for a semantically similar query, skipping the LLM call. They compose: semantic cache first (skip the call entirely if a near-duplicate query was seen before), prompt cache as a fallback cost optimization for calls that do go through.
11. *How do you defend against prompt injection carried in retrieved documents?* Delimit/label retrieved content as untrusted data distinct from system instructions, apply the least-context-exposure principle (retrieve narrowly), and consider provenance/source tagging for anything written into long-term memory; note this is defense-in-depth, not a single fix.
12. *What would you measure to decide whether a bigger context window is worth adopting for your product?* Task-specific needle-in-a-haystack recall at the target length and positions, cost/latency delta per call, and whether retrieval+compression already solves the problem more cheaply — a bigger window is a last resort, not a default upgrade.
`,

  "coding-questions": `
### 1. Token-budget-aware context assembler (tests budgeting + prioritization)

~~~python
def assemble_within_budget(
    system_prompt: str,
    retrieved_chunks: list[str],   # already ranked, best first
    history: list[str],            # already ordered oldest to newest
    query: str,
    max_tokens: int,
    count_tokens_fn,
) -> str:
    """Greedily include highest-priority content first, dropping the lowest
    priority items (oldest history, then lowest-ranked chunks) if over budget."""
    fixed = system_prompt + "\\n\\n" + query
    remaining = max_tokens - count_tokens_fn(fixed)
    if remaining <= 0:
        raise ValueError("system prompt + query alone exceed the budget")

    kept_chunks = []
    for chunk in retrieved_chunks:            # best-ranked first
        cost = count_tokens_fn(chunk)
        if cost <= remaining:
            kept_chunks.append(chunk)
            remaining -= cost
        else:
            break   # lower-ranked chunks would fit worse signal per token; stop

    kept_history = []
    for turn in reversed(history):            # keep MOST RECENT history first
        cost = count_tokens_fn(turn)
        if cost <= remaining:
            kept_history.insert(0, turn)
            remaining -= cost
        else:
            break

    context_block = "\\n\\n".join(kept_chunks)
    history_block = "\\n".join(kept_history)
    return f"{system_prompt}\\n\\nCONTEXT:\\n{context_block}\\n\\nHISTORY:\\n{history_block}\\n\\nQUESTION: {query}"

# Complexity: O(n) over chunks + O(m) over history turns.
# Follow-up they'll ask: what if a single chunk doesn't fit but a smaller
# summarized version of it would? -> trigger compression instead of skipping.
~~~

### 2. Hierarchical summarizer for long conversation history (tests recursive compression thinking)

~~~python
def hierarchical_summarize(turns: list[str], summarizer_llm, chunk_size: int = 10) -> str:
    """Summarize "turns" in chunks, then summarize the summaries, recursively,
    until a single compact summary remains. Bounds summary growth regardless
    of how many turns exist."""
    if len(turns) <= chunk_size:
        joined = "\\n".join(turns)
        return summarizer_llm.complete(
            f"Summarize concisely, preserving key facts and decisions:\\n{joined}",
            max_tokens=150, timeout=10,
        )

    level_summaries = []
    for i in range(0, len(turns), chunk_size):
        batch = turns[i:i + chunk_size]
        level_summaries.append(
            summarizer_llm.complete(
                f"Summarize concisely:\\n{chr(10).join(batch)}", max_tokens=150, timeout=10
            )
        )
    # Recurse: summarize the summaries, one level up.
    return hierarchical_summarize(level_summaries, summarizer_llm, chunk_size)

# Complexity: O(n) total summarization calls across all levels (geometric series).
# Follow-up: how do you avoid re-summarizing unchanged early chunks every
# time new turns arrive? -> cache each level's summary, only recompute the
# levels touched by new turns (an incremental/streaming variant).
~~~

### 3. Needle-position sensitivity check (tests eval-mindset, not just code)

~~~python
def needle_recall_by_position(llm_client, filler_text: str, needle: str,
                               positions: list[float]) -> dict[float, bool]:
    """Insert "needle" at each fractional position in "filler_text" and check
    whether the model recalls it — a minimal, runnable needle-in-a-haystack
    harness. Real evals should run many trials per position and report a rate."""
    results = {}
    for frac in positions:
        idx = int(len(filler_text) * frac)
        context = filler_text[:idx] + " " + needle + " " + filler_text[idx:]
        prompt = f"{context}\\n\\nRepeat back the secret phrase mentioned above, exactly."
        answer = llm_client.complete(prompt, timeout=30, max_tokens=50)
        results[frac] = needle.strip() in answer
    return results

# Complexity: O(len(positions)) LLM calls. Follow-up: how would you make this
# statistically meaningful rather than anecdotal? -> repeat each position N
# times with varied filler content and needles, report a recall RATE with
# confidence intervals, not a single boolean per position.
~~~
`,

  "hands-on-labs": `
### Lab 1 — Token budget dashboard (beginner, ~1.5h)
Instrument a simple LLM call wrapper that counts tokens per component (system prompt, context, history) using the provider's tokenizer, logs them, and enforces a hard budget with a clear error rather than a silent API failure. Deliverable: a small script that demonstrates the budget rejecting an over-limit request BEFORE calling the API. Skills: token counting, budget enforcement, defensive coding.

### Lab 2 — Retrieve, rerank, compare (intermediate, ~2.5h)
Build a tiny RAG pipeline over a small document set (see the **RAG** skill for the retrieval mechanics). Compare three context strategies against the same set of test questions: (a) top-20 vector search results dumped raw, (b) top-5 after reranking, (c) top-5 reranked plus abstractive compression of each chunk. Score answer accuracy and measure tokens used for each. Deliverable: a table showing the accuracy/cost tradeoff across strategies. Skills: the retrieval-to-context pipeline, viscerally.

### Lab 3 — Needle-in-a-haystack harness (advanced, ~3h)
Build the harness sketched in Coding Questions #3 into a proper eval: multiple needles, multiple positions, multiple trials per position, against your target model and target context length. Plot recall rate vs position. Deliverable: a chart showing whether/where your chosen model degrades, and a written recommendation for how your application should structure context given the result. Skills: empirical evaluation, the core "verify, don't assume" discipline of this skill.

### Lab 4 — Production-grade context assembler with caching (production, ~4h)
Take Lab 2's pipeline and wrap it into a service: a context assembler enforcing budgets (Deployment section pattern), hierarchical conversation summarization for multi-turn sessions, prompt-caching-aware ordering (stable content first), structured logging of per-component tokens, and a /healthz endpoint. Load test it and confirm cache hit rate and latency behave as expected across repeated calls with a shared system prompt. Skills: the whole production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering roles):

1. **Context-aware document Q&A service** — A FastAPI service wrapping retrieval + reranking + a context assembler with an enforced token budget, hierarchical summarization for follow-up questions in a session, and per-component token/cost logging exposed via a metrics endpoint. Demonstrates: RAG integration, budget discipline, observability — directly relevant to "chat with your docs" style products.

2. **Long-running agent with tiered memory** — An agent that calls multiple tools across many turns, with short-term memory (recent raw turns) and long-term memory (checkpointed hierarchical summaries, externally stored), tool-output compression before reinsertion into context, and a needle-in-a-haystack style eval proving recall holds up across long sessions. Demonstrates: agent memory design, compression discipline, empirical validation — ties directly to the **Agent Memory** skill.

3. **Cost/latency-optimized multi-provider context router** — A service that assembles context once, then routes to either a cached-response path (semantic cache hit) or an LLM call structured for maximum prompt-cache reuse (stable-prefix-first ordering), tracking cost and latency savings from each layer separately. Demonstrates: the composition of prompt caching and semantic caching, cost engineering — directly relevant to production LLM cost control roles.

Each project: instrumented token/cost logging, a small eval suite (needle recall + faithfulness spot-checks) rather than "it looked right when I tried it," a README explaining the context budget policy and why it was chosen, and a documented before/after comparison against a naive "stuff everything in" baseline — that comparison is what makes the engineering judgment visible to an interviewer.
`,

  "case-studies": `
### The "lost in the middle" research and its production fallout
Research (notably Liu et al., 2023) demonstrated that long-context models retrieve facts less reliably from the middle of a context than from the edges — a finding that directly contradicted the assumption many teams had made when adopting early long-context models ("the window is big enough, just put it all in"). Lesson: a model's advertised context-window size measures capacity, not reliable recall across that capacity; teams that skipped their own position-sensitivity testing discovered degraded production accuracy only after shipping.

### Prompt caching's arrival as a first-class API feature
When major LLM providers shipped prompt/context caching, it was a direct response to observed production traffic patterns: many customers were re-sending large, mostly-static system prompts and reference documents on every call. Lesson: context engineering discipline (recognizing what's stable vs variable in your prompts) turned directly into a cost/latency lever the moment the infrastructure existed to exploit it — teams that had already structured prompts stable-content-first captured the benefit immediately; teams with variable content mixed throughout the prompt had to refactor to benefit at all.

### RAG systems degrading as corpora grew, fixed by reranking
A recurring pattern reported across many RAG deployments: retrieval quality that looked fine on a small initial document set degraded as the corpus grew into the tens or hundreds of thousands of chunks, because pure top-k vector search increasingly surfaced marginally-relevant near-duplicates. Adding a reranking stage on top of a wider initial candidate pool consistently restored quality without needing a bigger context window. Lesson: retrieval and context assembly quality, not model capability, is usually the actual bottleneck as RAG systems scale.

### Agent context bloat from unfiltered tool output
A common failure story in early agent-framework adoption: agents that called multiple tools per task accumulated raw, unfiltered tool output (full API JSON responses, full page HTML from web-browsing tools) directly in context across loop iterations, until the task instruction itself became a small fraction of an increasingly noisy context — degrading both accuracy and cost. Lesson: agentic systems need tool-output compression as a first-class pipeline stage, not an afterthought bolted on after launch.
`,

  comparisons: `
| Dimension | Context Engineering | Prompt Engineering | RAG | Semantic Caching | Fine-Tuning |
|-----------|---------------------|---------------------|-----|-------------------|-------------|
| What it changes | What/how much enters the context window, per call | The wording/structure of one instruction | What content gets retrieved to put in context | Whether the LLM is called at all for a given query | The model's weights/behavior itself |
| Scope | Whole payload: system + retrieved + history + tools + memory | Usually just the instruction/task text | The retrieval step specifically (a context-engineering INPUT) | A response cache layer, orthogonal to context content | Training-time, not per-request |
| Solves cost/latency? | Yes — directly (compression, caching, budgeting) | Indirectly at best | Indirectly (better retrieval reduces context needed) | Yes — for repeated/similar queries | Not directly; may reduce prompt length needed |
| Solves lost-in-the-middle? | Yes — its core concern (ordering, reranking, compression) | No | Partially (better ranking shrinks the candidate set) | No — unrelated concern | No — unrelated concern |
| Requires infrastructure? | Yes (budgeting, compression, sometimes a vector store) | No — just prompt text | Yes (vector store, embeddings) | Yes (cache store + similarity matching) | Yes (training pipeline, data) |
| Relationship to this skill | — | A subset/tool within context engineering | A major INPUT that context engineering shapes and budgets | A sibling/complementary optimization at the response level | A separate lever, sometimes combined with good context engineering to reduce prompt length needs |

**How seniors choose**: these are not mutually exclusive choices — a mature production system layers most of them. Start with solid retrieval (RAG) and disciplined context assembly (this skill); add semantic caching where query patterns repeat; add prompt caching wherever prompt structure allows a stable prefix; reach for fine-tuning only when context engineering and good prompting have been tried and a specific, measured gap remains (e.g. a narrow output-format or style requirement that's cheaper to bake into weights than to re-specify every call).
`,

  "related-technologies": `
- **RAG (Retrieval-Augmented Generation)** — supplies the candidate documents that context engineering must budget, rank, and compress; learn RAG's retrieval mechanics first if you haven't.
- **Vector Search** — the ANN search infrastructure behind retrieval; context engineering's reranking stage typically sits directly on top of vector search results.
- **Embeddings** — the representations that make similarity-based retrieval possible in the first place; foundational to both RAG and Vector Search.
- **Agent Memory** — the short-term/long-term memory architecture for multi-turn agents; context engineering's summarization and checkpointing techniques are the mechanics that make agent memory practical within a token budget.
- **Semantic Caching** — a sibling optimization that skips the LLM call entirely for semantically similar past queries; complementary to, and distinct from, prompt caching (KV-cache reuse) covered on this page.
- **Prompt Engineering** — the narrower discipline of wording a single instruction well; one tool within the broader context-engineering toolkit.
- **Cost Optimization** — the economics (tokens = dollars) that motivate much of this page's compression and caching guidance; see it for the fuller cost picture across an LLM application.
- **Latency** — time-to-first-token and overall response time are directly shaped by context size and assembly overhead; see it for the fuller latency picture, including non-context-related levers.
- **AI Evals** — the evaluation discipline required to validate any context-strategy decision (needle-in-a-haystack, faithfulness, accuracy) rather than relying on intuition.
- **LLM Fundamentals / Prompt Engineering** — prerequisite grounding in how models consume prompts at all, before tackling the budgeting and structuring problems here.

On this platform, the natural learning path: **Embeddings** → **Vector Search** → **RAG** → **this page (Context Engineering)** → **Agent Memory** → **Semantic Caching** → **AI Evals** → **Cost Optimization** / **Latency**.
`,

  "latest-updates": `
This is a fast-moving area, and my knowledge cutoff is January 2026 — treat everything below as a snapshot that may already be dated, and verify current details against provider documentation and recent benchmarks before making architecture decisions.

- **Prompt/context caching in major LLM APIs** has continued to mature since its introduction, with providers refining pricing models, minimum cacheable prefix requirements, and cache lifetime semantics — check the specific provider's current docs rather than assuming details from an earlier release still hold.
- **"Context engineering" as a term** has become the community's preferred umbrella phrase (particularly in agent-building and applied-LLM circles) specifically to emphasize that curating retrieved content, memory, and tool outputs matters more than instruction wording alone — this page reflects that framing.
- **Long-context benchmarking practice** (needle-in-a-haystack and related position-sensitivity tests) has become a standard part of serious model evaluation, precisely because nominal context-window size proved to be a poor proxy for reliable recall across that window — expect this kind of evaluation to keep being necessary for any new model release you adopt.
- **Prompt-compression tooling** (approaches in the LLMLingua family and similar) continues to be an active research area; compression-ratio and quality-retention numbers are benchmark- and task-specific — validate on your own workload rather than trusting a single published ratio.
- **Context-window sizes across model families** keep growing, and keep shipping with the same caveat: bigger nominal windows do not eliminate the value of retrieval, reranking, and compression, and reliable-recall-at-length still needs independent verification per model version.

For anything you plan to ship, re-verify current context-window limits, prompt-caching terms, and pricing directly against the provider's official, dated documentation — do not rely on any specific figure quoted from a training snapshot.
`,

  "future-roadmap": `
Where the discipline appears to be heading, and what's worth investing career time in, with appropriate hedging given how fast this area moves:

- **Context engineering as a named, standard discipline** looks likely to keep solidifying — expect more dedicated tooling (context assemblers, budget-management libraries, prompt-cache-aware prompt builders) to emerge as first-class parts of the AI-engineering toolchain, rather than bespoke code in every project. Investing in the underlying principles here (budgeting, compression, ordering, evaluation) is a safer bet than any single tool.
- **Context windows will keep growing, and the "lost in the middle" problem will keep needing independent verification per model** — betting your architecture entirely on "the window is big enough now" without your own position-sensitivity evals is likely to remain a mistake for the foreseeable future, even as raw capacity increases.
- **Prompt caching economics will likely keep improving and becoming more standardized across providers**, making stable-prefix prompt design an increasingly default-expected practice rather than an advanced optimization — worth internalizing now rather than treating as optional.
- **Compression techniques (both classical summarization and learned prompt-compression models) will likely keep improving**, but faithfulness verification of compressed context is likely to remain a permanent requirement, not a problem that gets fully "solved" — the evaluation discipline (AI Evals) is the durable skill, more than any specific compression tool.
- **Agent memory and context engineering are likely to keep converging** as agent systems become more common — expect the line between "memory architecture" and "context engineering" to blur further; understanding both together (rather than as separate topics) is likely to be increasingly valuable.
- Treat all of the above as reasoned projection, not certainty — re-evaluate this roadmap against current developments rather than treating it as fixed, especially anything more than a year past this page's knowledge cutoff.
`,

  "cheat-sheet": `
~~~text
CONTEXT ENGINEERING — ESSENTIALS
=================================

WHAT'S IN THE CONTEXT (all share one token budget):
  system prompt | few-shot examples | retrieved context (RAG)
  | tool/function schemas | conversation history | scratchpad | query

CORE PRINCIPLES
  1. Budget every component explicitly; log actual usage per call.
  2. Retrieve narrow, then rerank narrower still (precision > recall).
  3. Put decision-critical content near the START or END, never
     buried alone in the middle ("lost in the middle" effect).
  4. Compress before you truncate (summarize > hard-cut).
  5. Order stable content FIRST, variable content LAST
     (maximizes prompt-cache hits).
  6. Evaluate strategy changes with real evals — never ship on intuition.

TOKEN BUDGET SKETCH
  usable_input = window - reserved_output
  fixed = system_prompt + tool_schemas
  remaining = usable_input - fixed
  history_budget = remaining * 0.3   (policy, not a law)
  retrieval_budget = remaining - history_budget

COMPRESSION TECHNIQUES
  extractive   -> keep top-ranked original spans verbatim
  abstractive  -> model rewrites more densely (check faithfulness!)
  hierarchical -> summarize chunks, then summarize the summaries
  prompt-compression tools -> drop low-information tokens (LLMLingua-style)

PROMPT CACHING vs SEMANTIC CACHING
  prompt caching   -> reuses KV-cache for a repeated PREFIX (same call, cheaper/faster)
  semantic caching -> skips the LLM call for a similar PAST query (different skill)
  -> use both; they solve different problems

PITFALLS
  - "just paste the whole doc in" -> dilutes attention, costs money every turn
  - unbounded conversation history -> cost + lost-in-the-middle risk grow forever
  - raw tool JSON dumped into context every loop iteration
  - variable content first -> breaks prompt-cache prefix matching
  - trusting nominal window size as a reliability guarantee -> always
    needle-in-a-haystack test your own model + length + position

VALIDATE WITH
  needle-in-a-haystack recall by position | faithfulness of summaries
  | task accuracy vs top-k/compression config | cost & latency per component
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is context engineering? | The discipline of curating, compressing, structuring, and budgeting everything that enters an LLM's context window (system prompt, retrieved docs, history, tools, memory) — broader than prompt engineering. |
| What is the "lost in the middle" effect? | Facts placed in the middle of a long context are recalled less reliably than facts near the start or end, even within a nominally sufficient context window. |
| Why doesn't a bigger context window fix quality problems? | It raises capacity but doesn't fix positional attention degradation or the need for precise retrieval — more low-relevance content still dilutes attention. |
| What's the difference between extractive and abstractive compression? | Extractive keeps original spans verbatim (faithful, less connective); abstractive has a model rewrite/summarize (denser, must be checked for hallucinated claims). |
| What does prompt caching actually reuse? | The already-computed key/value (KV) tensors for a repeated PREFIX of the context, avoiding recomputing that portion's attention state on a new call. |
| Why must stable content go first in a cache-aware prompt? | Caching matches on a PREFIX; if variable content comes first, no two calls share an identical prefix and no cache hit ever occurs. |
| How is prompt caching different from semantic caching? | Prompt caching reuses transformer internals for identical prefixes (still calls the LLM); semantic caching returns a stored response for a similar past query (skips the call entirely). |
| What is hierarchical summarization for and how does it work? | Bounds conversation-history growth in long sessions by summarizing chunks of turns, then summarizing the summaries recursively, so context size stays roughly constant regardless of session length. |
| Why compress tool output before reinserting it into an agent's context? | Raw tool/API results (JSON, HTML) can flood the context across loop iterations, crowding out the actual task signal; compress to what's relevant to the current step. |
| What should you do before trusting a vendor's advertised context-window size? | Run your own needle-in-a-haystack recall tests at the specific lengths and positions your application uses, against the exact model version you'll ship. |
| Why is retrieval + reranking better than just a larger top-k from vector search? | A wide vector-search pool followed by a precise reranker filters out near-duplicate/marginal chunks before they dilute attention — smaller, higher-precision context beats a larger, noisier one. |
| What's the risk of unlabeled retrieved content in a prompt? | It can be indistinguishable from trusted instructions to the model, enabling prompt injection if the retrieved source contains attacker-crafted text. |
| What's the first thing to instrument when starting context engineering work? | Per-component token usage and latency, logged on every call — you can't optimize or debug what you haven't measured. |
| Does context engineering replace the need for evals? | No — context-strategy changes (top-k, compression thresholds, ordering) must be validated with accuracy/faithfulness evals, the same as any prompt or model change. |
| What's the relationship between context engineering and Agent Memory? | Agent Memory defines the short-term/long-term memory architecture; context engineering supplies the compression, budgeting, and checkpointing mechanics that make that memory fit within a token budget. |
`,

  mcqs: `
**1. Why does the "lost in the middle" effect occur?**
A) It's a bug specific to one vendor's API
B) Models' learned attention patterns statistically favor content near the start/end of a sequence over the middle
C) It only happens with context windows under 4K tokens
D) It's fixed automatically by prompt caching

*Answer: B — it's a property of how attention patterns were shaped during training, not a specific vendor bug, and prompt caching (a cost/latency optimization) does not address it.*

**2. What does prompt caching actually reuse across calls?**
A) The full generated response from a previous call
B) A semantically similar past query's stored answer
C) Previously computed key/value (KV) tensors for a repeated prefix of the context
D) The retrieved documents from a previous RAG query

*Answer: C — prompt caching is a KV-cache reuse mechanism for identical prefixes; reusing a full past response for a similar query is semantic caching (a different, complementary technique).*

**3. Why must "stable" content be placed first in a cache-aware prompt template?**
A) Because models read left to right and forget content placed later
B) Because caching matches on a prefix, and any variable content before the stable part breaks prefix identity across calls
C) Because system prompts are always shorter than retrieved context
D) It doesn't matter — caching works regardless of order

*Answer: B — cache hits require an identical prefix; putting variable content first means no two requests share that prefix.*

**4. A team increases their RAG system's top-k from 5 to 30 "to be safe," and answer accuracy drops. What's the most likely cause?**
A) The model's context window is too small to hold 30 chunks
B) Lower-ranked, less relevant chunks are diluting attention and pushing key facts toward the less-reliable middle of the context
C) Vector search always returns worse results as k increases
D) Prompt caching stopped working

*Answer: B — beyond a point, more retrieved content (especially lower-precision chunks) hurts more than it helps due to attention dilution and lost-in-the-middle risk; precision matters more than raw recall once relevant content is in the candidate pool.*

**5. What distinguishes extractive from abstractive compression?**
A) Extractive is always more accurate than abstractive
B) Extractive selects/keeps original text spans verbatim; abstractive has a model rewrite/summarize content, risking introduced inaccuracies
C) Abstractive compression is only usable for code, not prose
D) They are the same technique with different names

*Answer: B — and because abstractive compression involves generation, its output should be faithfulness-checked against the source, unlike extractive selection of original spans.*

**6. Why is context engineering considered broader than prompt engineering?**
A) It requires more code
B) Prompt engineering only concerns wording a single instruction; context engineering covers the full payload — retrieved content, history, tool schemas, memory — and how it's budgeted and structured
C) Context engineering doesn't involve writing any prompts at all
D) They are interchangeable terms for the same practice

*Answer: B — prompt engineering is one small tool (wording an instruction) within the broader context-engineering job of deciding and shaping everything that enters the window.*
`,

  "revision-notes": `
Context engineering is the discipline of deciding what enters an LLM's context window — system prompt, retrieved documents, tool schemas, conversation history, and memory — and how it's budgeted, ordered, and compressed, as distinct from prompt engineering's narrower focus on wording a single instruction. The context window is a scarce, expensive resource: every token costs money and latency, and — critically — more tokens do not mean better answers. Models exhibit the "lost in the middle" effect, recalling facts less reliably when they sit mid-context than near the start or end, a property that persists even in models with very large nominal context windows; nominal window size measures capacity, not reliable recall across that capacity, and must be validated empirically (needle-in-a-haystack tests) rather than trusted from marketing figures.

The core toolkit: token budgeting (explicit allocations per component, logged and tuned against real traffic); retrieval and reranking (a wide vector-search candidate pool narrowed by a precision-focused reranker, so only the highest-value chunks earn a place in context — see the RAG, Vector Search, and Embeddings skills for the mechanics this depends on); compression (extractive selection of original spans, abstractive summarization with faithfulness checks, and hierarchical summarization that bounds long-conversation growth by summarizing summaries recursively); and structuring (ordering critical content near the start/end, using consistent delimiters/labels to distinguish trusted instructions from retrieved data, which also raises the bar against prompt injection).

Prompt caching reuses the transformer's already-computed key/value state for a repeated PREFIX of the context across calls, cutting cost and latency — but only if stable content (system prompt, tool schemas, static reference material) is placed FIRST in the prompt template, since caching matches on prefix identity. This is mechanically and economically distinct from semantic caching (a sibling skill), which matches a new query to a similar past query and skips the LLM call entirely; production systems typically benefit from using both together.

Multi-turn agent memory connects tightly to this discipline (see Agent Memory): short-term memory is the recent raw turns kept in context, long-term memory is externally stored and checkpointed via summarization, and tool-result compression prevents agentic loops from flooding context with raw JSON/HTML across iterations. Every context-strategy decision — top-k, compression thresholds, budget splits, ordering changes — should be validated with evals (needle-in-a-haystack recall, faithfulness checks, task accuracy) rather than intuition, and tied to the cost/latency economics covered in the Cost Optimization and Latency skills.

Treat every specific context-window size, pricing figure, and benchmark number in this space as a fast-moving target: knowledge cutoff January 2026, verify current figures against provider documentation before committing an architecture to them.
`,

  "learning-roadmap": `
### Week 1 — Foundations
Read this page's Foundations and Concepts sections. Build the beginner labs: a token-counting wrapper and a simple budget-enforcing context assembler (Lab 1). Milestone: you can explain, without notes, why "just paste the whole document in" is a mistake, and demonstrate a budget rejecting an over-limit request.

### Week 2 — Retrieval-aware context assembly
Study the **RAG**, **Vector Search**, and **Embeddings** skills alongside this page's retrieval/reranking material. Build Lab 2 (retrieve, rerank, compare). Milestone: a table showing accuracy/cost tradeoffs across raw top-k vs reranked top-k vs compressed context, on a small document set you built yourself.

### Week 3 — Compression, caching, and structuring
Deep-dive Advanced Concepts: prompt caching mechanics, hierarchical summarization, ordering for cache hits. Restructure a prompt template to be cache-aware and verify hit rate. Milestone: you can explain the mechanical difference between prompt caching and semantic caching without hesitation, and show a working hierarchical summarizer (Coding Question #2).

### Week 4 — Evaluation and long-context reliability
Build the needle-in-a-haystack harness (Lab 3) against a model and context length you actually plan to use. Read the **AI Evals** skill in parallel. Milestone: a chart of recall vs position for your target model, and a written recommendation for how your application should structure context given the result.

### Week 5 — Production hardening
Build Lab 4: a production-shaped context assembler with budget enforcement, checkpointed summarization, tool-output compression, structured logging, and cache-aware ordering, deployed and load-tested. Milestone: a working service demonstrating measurable cost/latency improvement over a naive baseline, with an eval suite proving accuracy didn't regress.

### What's next
Once this page's material is solid, the natural next platform skill is **Agent Memory** (deepen the short-term/long-term memory architecture this page's compression techniques feed into), followed by **Semantic Caching** (the complementary response-level caching layer) and **AI Evals** (formalize the evaluation practice this page repeatedly leans on).
`,

  "official-docs": `
- **Anthropic documentation** — prompt/context caching guides and model context-window specifications; check for the current API shape, minimum cacheable prefix length, and pricing before implementing (details change between releases).
- **OpenAI documentation** — context length and prompt-caching documentation per model family; the authoritative source for current token limits and caching mechanics for their models.
- **Provider tokenizer libraries** (e.g. tiktoken for OpenAI-family models) — the correct way to COUNT tokens for budget enforcement; never estimate from word/character counts in production code.
- **Model-family release notes** for whichever models you deploy — context-window sizes and caching support change with every major release; always check the specific version you're shipping, not a general family name.
- Because context-window sizes, caching APIs, and pricing are genuinely moving targets, treat any of the above as something to re-check at build time rather than something this page can state precisely and have remain accurate.
`,

  books: `
- **"Attention Is All You Need" (Vaswani et al., 2017)** — not a book but the foundational paper; read it once to understand WHY attention position and sequence length matter mechanically, which underlies almost every context-engineering technique on this page.
- **Designing Data-Intensive Applications (Martin Kleppmann)** — not about LLMs directly, but the best available treatment of caching, indexing, and system design tradeoffs that context engineering borrows heavily from (prompt caching is, structurally, a caching problem).
- **Building LLM-powered applications / applied-LLM engineering guides** (multiple emerging titles as of this writing) — look for current editions specifically covering RAG and agent architecture, since context engineering as a named discipline is recent enough that dedicated, canonical books are still emerging; prefer well-reviewed, recently-updated titles over older prompt-engineering-only books.
- **Information Retrieval textbooks** (e.g. Manning, Raghavan, Schütze's "Introduction to Information Retrieval") — the reranking and relevance-ranking techniques central to context engineering's retrieval stage have decades of IR research behind them; this is the deeper foundational reading if you want rigor beyond "call a reranker API."

Honest caveat: this is a young, fast-moving discipline — there isn't yet a single canonical, long-settled textbook the way there is for, say, algorithms. Prioritize recent, well-reviewed material and primary sources (papers, official docs) over older books that predate context/prompt caching and long-context benchmarking practice.
`,

  blogs: `
- **Anthropic's engineering/applied-AI blog posts on context and agent design** — high-signal, practitioner-facing writing directly from a frontier lab building these systems; look for posts specifically on context management and agent architecture.
- **OpenAI's engineering blog and cookbook** — practical, code-forward guides including prompt caching usage patterns and long-context best practices.
- **Independent applied-LLM engineering blogs and newsletters** covering RAG, agent architecture, and context management in production — favor authors who show real production metrics (cost, latency, accuracy deltas) over ones making unqualified claims about a technique's benefits.
- **Research-lab blog posts accompanying long-context and lost-in-the-middle papers** — often more accessible than the papers themselves and a good way to stay current on evolving benchmark practice.

Filter aggressively: this is a topic with a lot of low-signal "10 prompt engineering tips" content; prioritize sources that show measured before/after numbers on a concrete system over generic advice.
`,

  "research-papers": `
This is a topic with real foundational papers underneath it, even though "context engineering" itself is more of a practitioner umbrella term than a single research subfield. Foundational and closely-related reading:

- **"Attention Is All You Need" (Vaswani et al., 2017)** — the Transformer architecture; the mechanical root of why sequence position and length affect model behavior at all.
- **"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020)** — the foundational RAG paper; essential background for understanding what context engineering's retrieval stage is built on.
- **"Lost in the Middle: How Language Models Use Long Contexts" (Liu et al., 2023)** — the key empirical paper establishing the positional-degradation effect this page repeatedly references; read this directly if you build anything long-context-dependent.
- **Needle-in-a-haystack style long-context evaluation work** (methodology popularized across multiple model releases and independent evaluators from 2023 onward) — no single canonical paper, but the methodology itself is worth understanding and reproducing against your own models, as this page's Testing section demonstrates.
- **Prompt-compression research** (approaches in the LLMLingua family and related work) — if you plan to use automated prompt compression, read the specific paper behind whatever tool you adopt rather than assuming published compression ratios transfer to your task.

Honest gap: because "context engineering" is a young, practitioner-driven umbrella term rather than an academic subfield with its own dedicated literature, there is no single comprehensive survey paper covering the whole discipline as this page presents it — the closest foundational reading is the combination of the Transformer paper, the RAG paper, and the lost-in-the-middle paper above, plus the RAG/Vector Search/Embeddings skills' own research-paper sections for the retrieval side.
`,

  videos: `
- **Conference talks from applied-AI engineering teams (Anthropic, OpenAI, and similar) on agent and RAG architecture** — look for recent talks specifically addressing context management, agent memory, and production RAG lessons, since these are more likely to reflect current best practice than older prompt-engineering-focused talks.
- **Talks and tutorials specifically covering the "lost in the middle" research and long-context evaluation methodology** — worth watching a walkthrough if the paper's dense; visual explanations of the position-vs-recall curves make the effect concrete quickly.
- **RAG and vector-database vendor conference talks** covering retrieval + reranking pipeline design — often the most concrete, production-numbers-included content available on the retrieval side of context engineering.
- **Practitioner walkthroughs of building agentic systems** that specifically discuss context/memory management, tool-output compression, and cost control — prefer talks that show real before/after metrics over ones offering only qualitative advice.

Because specific video titles and speakers age quickly and I cannot verify current availability, search for recent (last 12 months relative to when you're studying) talks from the above categories rather than relying on any single named video as a stable reference.
`,

  "github-repos": `
- **Provider-official SDK repositories** (Anthropic's and OpenAI's Python/TypeScript SDKs) — the canonical, always-current reference for how prompt/context caching is actually invoked in code; prefer these over blog-post code snippets that may lag API changes.
- **tiktoken** (OpenAI's tokenizer library) — the reference implementation for accurate token counting against OpenAI-family models; essential for real budget enforcement rather than estimation.
- **LLMLingua and similar prompt-compression repositories** — reference implementations of learned prompt-compression techniques; read the README's benchmark methodology critically before trusting a headline compression ratio for your own task.
- **Popular RAG framework repositories** (LangChain, LlamaIndex, and similar) — study their context-assembly and retrieval-pipeline modules specifically (not the whole framework) to see production-shaped implementations of reranking, chunk selection, and prompt templating.
- **Needle-in-a-haystack evaluation harness repositories** (several independent open-source implementations exist) — a good starting point rather than building the eval harness fully from scratch, though the minimal version in this page's Coding Questions section is enough to understand the mechanics.
- **Reranker model repositories** (cross-encoder reranking models available on model hubs) — needed to implement the retrieve-then-rerank pattern central to this page's retrieval guidance.
- **Vector database repositories** (see the Vector Search skill for the dedicated list) — the retrieval infrastructure this page's context-assembly techniques sit on top of.

Verify star counts, maintenance activity, and last-commit dates before depending on any of the above in production — this is a fast-moving ecosystem and repository health changes quickly.
`,

  "practice-problems": `
Ordered by skill focus, easiest to hardest:

1. **Token budgeting basics** — Write a function that counts tokens per component of a mock prompt and raises a clear error if the total exceeds a given budget, using a real tokenizer library. (Budgeting fundamentals.)
2. **Greedy context selection under budget** — Given a ranked list of retrieved chunks and a token budget, select the maximal-value subset that fits (see Coding Question #1 for a starting shape); extend it to prefer compressing a chunk over dropping it entirely when it's close to fitting.
3. **Position-sensitivity probe** — Implement and run a small needle-in-a-haystack test (Coding Question #3) against a model you have API access to, at 3+ positions, and report whether you observe the lost-in-the-middle pattern.
4. **Hierarchical summarizer** — Implement the recursive summarizer from Coding Question #2 and test it against a synthetic 100-turn conversation, verifying the final context size stays bounded regardless of turn count.
5. **Cache-aware prompt refactor** — Take an existing prompt template with variable content mixed throughout, refactor it to be stable-prefix-first, and (if you have access to a caching-enabled API) measure the resulting cache hit rate and cost difference.
6. **Faithfulness checker for compressed context** — Build a small LLM-as-judge or entailment-based check that flags when an abstractive summary introduces a claim not supported by the source text.
7. **End-to-end agent context pipeline** — Combine retrieval + reranking + compression + budgeting + cache-aware ordering into one assembler (Deployment section pattern) and validate it against a small eval set comparing it to a naive "concatenate everything" baseline.

External practice: look for open long-context and RAG evaluation benchmark sets (several are maintained by research groups and model evaluation organizations) to test your context strategies against realistic, harder test cases beyond what you can construct alone.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Inputs
        Q["User query"]
        DOCS[("Document corpus")]
        MEMSTORE[("Memory store\\n(short + long term)")]
        TOOLS["Tool registry + schemas"]
    end

    Q --> EMB["Embed query"]
    EMB --> VS["Vector Search\\n(wide candidate pool)"]
    DOCS --> VS
    VS --> RR["Reranker\\n(narrow to top-k)"]

    Q --> MEMSTORE
    MEMSTORE --> SUM["Hierarchical summarizer\\n(checkpointed)"]

    RR --> CA["Context Assembler"]
    SUM --> CA
    TOOLS --> CA
    SP["System prompt template\\n(stable)"] --> CA

    CA --> BUDCHK{"Within token budget?"}
    BUDCHK -->|no| COMP["Compressor\\n(summarize / prune lowest value)"]
    COMP --> CA
    BUDCHK -->|yes| ORDER["Cache-aware ordering\\n(stable prefix first, query last)"]

    ORDER --> SEMCHK{"Semantic cache hit?"}
    SEMCHK -->|yes| CACHED["Return cached response"]
    SEMCHK -->|no| LLM["LLM API call\\n(provider prompt cache reused\\nfor stable prefix)"]

    LLM --> TOOLCALL{"Tool call requested?"}
    TOOLCALL -->|yes| EXEC["Execute tool"]
    EXEC --> TCOMP["Compress tool result"]
    TCOMP --> CA
    TOOLCALL -->|no| RESP["Final response"]

    RESP --> MEMSTORE
    RESP --> METRICS["Per-component token/cost/latency logging"]
    CACHED --> METRICS
~~~

This diagram traces one full agent turn: retrieval and memory feed the context assembler, which enforces the budget (compressing if needed) and orders content for prompt-cache reuse, checks a semantic cache before paying for an LLM call, and — if the model requests a tool — compresses that tool's result before it re-enters the same assembler for the next loop iteration. Every path terminates in the same metrics/logging sink, so cost, latency, and token usage are observable regardless of which branch a given turn took.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Context Engineering))
    Foundations
      Context window as scarce resource
      Prompt engineering vs context engineering
      Lost in the middle effect
      Needle-in-a-haystack degradation
    Token Budgeting
      System prompt
      Tool schemas
      Retrieved context
      Conversation history
      Scratchpad / output reserve
    Compression
      Extractive
      Abstractive
      Hierarchical summarization
      Prompt-compression tooling
    Retrieval and Ranking
      Vector search candidate pool
      Reranking
      Top-k selection
      Link to RAG / Vector Search / Embeddings
    Caching
      Prompt caching (KV reuse)
      Cache-aware ordering
      Semantic caching (sibling skill)
    Structuring
      Ordering: start/end priority
      Delimiters and labels
      XML / markdown scaffolding
    Agent Memory
      Short-term sliding window
      Long-term checkpointed summaries
      Tool-output compression
    Production Concerns
      Cost and latency
      Monitoring per-component tokens
      Security: injection and poisoning
      Evaluation and AI Evals
~~~
`,
};

export default contextEngineering;
