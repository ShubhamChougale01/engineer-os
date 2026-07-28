import type { SkillContent } from "../types";

/**
 * LLM Fundamentals — full 50-section knowledge page.
 * This is the overview/gateway skill for the LLMs category: it introduces,
 * at a conceptual but rigorous level, everything the sibling deep-dive
 * skills (Prompt Engineering, Fine-Tuning, Inference, Serving, Evaluation,
 * Hallucination, Guardrails) go deep on individually.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const llmFundamentals: SkillContent = {
  overview: `
A large language model (LLM) is, mechanically, a transformer neural network trained to do one thing: given a sequence of tokens, predict the probability distribution over the next token. That is the entire training objective. There is no explicit "reasoning module," no hand-coded grammar, no built-in fact database. Everything an LLM appears to do — write code, hold a conversation, summarize a contract, translate a language, follow instructions — emerges from scaling this single next-token-prediction objective over an enormous and diverse text (and increasingly multimodal) corpus, using an architecture (the transformer, with self-attention) that is good at modeling long-range dependencies between tokens.

For an AI engineer, LLM Fundamentals is the gateway skill for the entire "LLMs" category on this platform. Every deep-dive skill downstream — Prompt Engineering, Fine-Tuning, Inference, Serving, Evaluation, Hallucination, and Guardrails — assumes you already understand tokenization, context windows, sampling, the pretraining-to-alignment pipeline, and the base-model vs instruction-tuned distinction covered here. This page also assumes you already know how the transformer architecture, self-attention, and embeddings work at a mechanical level — see the **Transformers**, **Attention**, and **Embeddings** skills if you have not yet built that foundation; this page builds directly on top of them rather than re-deriving them.

Key characteristics of the modern LLM: it is autoregressive (it generates one token at a time, conditioning on everything generated so far), it operates over a fixed vocabulary of subword tokens rather than characters or whole words, it has a hard limit on how many tokens it can process at once (the context window), its output is sampled from a probability distribution rather than deterministically computed, and its behavior is shaped by two very different training phases — a massive, mostly self-supervised pretraining phase, and a much smaller alignment phase (instruction tuning and RLHF) that turns a raw text predictor into something that behaves like a helpful assistant. Every cost, latency, quality, and safety property you will care about as an AI engineer traces back to one of these mechanical facts.
`,

  history: `
The line of research that produced today's LLMs runs through statistical language modeling, neural language modeling, and finally the transformer architecture, which made training at unprecedented scale computationally practical because self-attention parallelizes across a sequence far better than the recurrent networks (RNNs, LSTMs) that came before it.

| Year | Milestone |
|------|-----------|
| 2013 | Word2Vec popularizes dense word embeddings — words as vectors, not one-hot symbols |
| 2014–2016 | Sequence-to-sequence models with RNNs/LSTMs, plus early attention mechanisms, dominate translation and generation |
| 2017 | "Attention Is All You Need" introduces the **transformer** — self-attention replaces recurrence, enabling far greater parallelism and scale |
| 2018 | BERT (encoder-only, masked language modeling) and GPT-1 (decoder-only, next-token prediction) both show transformer pretraining transfers powerfully to downstream tasks |
| 2019 | GPT-2 demonstrates that a single next-token-prediction objective, scaled up, produces surprisingly general text generation and few-shot-style behavior |
| 2020 | GPT-3 and the empirical "scaling laws" work show performance improving smoothly with more parameters, data, and compute — reframing "bigger" as a research strategy, not just an engineering flex |
| 2022 | Instruction tuning and RLHF (reinforcement learning from human feedback) turn base language models into conversational assistants; ChatGPT brings LLMs to mainstream, non-technical users |
| 2023 | Open-weight model families (e.g. Llama) and a wave of instruction-tuned and fine-tuned derivatives accelerate; long-context, tool use, and retrieval-augmented approaches mature |
| 2024–2025 | Multimodal LLMs (text+image, some text+audio/video), much longer context windows, cheaper serving, and stronger open-weight models become the norm; "reasoning"-oriented models with extended inference-time computation emerge |

This page describes the concepts, not a fixed leaderboard of models — model rankings and specific benchmark numbers change monthly, and this page will not assert current-generation numbers with false confidence. Check the **Latest Updates** section below for how to verify what is current at the time you read this.
`,

  "why-it-exists": `
Before LLMs, natural language processing was a patchwork of task-specific systems: a part-of-speech tagger here, a named-entity recognizer there, a rule-based chatbot, a statistical machine translation pipeline, each trained on its own narrow labeled dataset with its own architecture. Building a new NLP capability meant collecting new labeled data and often designing a new model from scratch. There was no general-purpose "understand and produce language" component you could reuse.

The gap LLMs filled: **general-purpose language competence learned once, from unlabeled text, and reused everywhere.** The insight that made this possible was that next-token prediction, if you do it at large enough scale over diverse enough text, is not a narrow task — to predict the next word well you implicitly have to model grammar, facts, reasoning patterns, code structure, and dialogue conventions, because all of that shows up in the training text and improves prediction accuracy. Pretraining absorbed the cost of "learning language" once, using cheap unlabeled text; downstream tasks became a matter of prompting or lightly fine-tuning an already-competent model, rather than training something from zero.

The transformer architecture was the enabling technical condition: it was the first sequence architecture that scaled efficiently on GPU/TPU hardware because self-attention computations parallelize across the whole sequence, unlike the strictly sequential computation of RNNs. Without that parallelism, training on today's data volumes would not be computationally feasible.
`,

  "problem-it-solves": `
LLMs solve the problem of needing bespoke models for every language task. Concrete pains removed:

- **The cold-start data problem**: instead of collecting thousands of labeled examples before you can build anything, you can prompt a pretrained model directly (see the **Prompt Engineering** skill) and often get useful behavior with zero task-specific training.
- **Fragmented tooling**: one model family, accessed through one API shape, now handles summarization, extraction, classification, code generation, translation, and conversation — tasks that used to require entirely separate systems.
- **Brittleness to phrasing**: statistical and rule-based NLP systems broke on unexpected phrasing; LLMs, having seen enormous linguistic variety during pretraining, generalize far better to novel inputs.
- **The engineering-to-capability lag**: new capabilities (better reasoning, longer context, multimodality) now arrive as model upgrades you adopt via an API version bump, rather than requiring you to re-architect your system.

What LLMs deliberately do **not** solve, and should not be expected to:

- **Guaranteed factual accuracy.** An LLM predicts plausible continuations of text; it has no built-in mechanism that verifies truth against the world. This is why hallucination is a first-class, actively researched failure mode — see the **Hallucination** skill.
- **Deterministic, auditable outputs by default.** Sampling introduces randomness; getting reliable, reproducible behavior is an engineering problem layered on top (prompting, constrained decoding, low or zero temperature, guardrails) — not something the base model gives you for free.
- **Arbitrarily long working memory.** The context window is a hard architectural ceiling, not a soft inconvenience — see the dedicated discussion below and the cost implications in the **Cost Optimization** skill.
- **Safety and policy compliance out of the box.** Alignment training helps, but adversarial users can often find ways around it; production systems layer explicit safety controls on top — see the **Guardrails** skill.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, precisely, what an LLM is trained to do and why that simple objective produces broad capability.
2. Explain how tokenization works (subword tokenization / BPE) and manually trace how a sentence gets split into tokens.
3. Define the context window correctly (maximum tokens attended to jointly) and explain why extending it has a real, quadratic computational cost.
4. Explain temperature, top-k, and top-p/nucleus sampling precisely enough to predict how changing each will change a model's output.
5. State the scaling-laws observation (predictable improvement with more parameters/data/compute) with appropriate hedging, without citing specific numbers you have not verified.
6. Describe the pretraining → instruction-tuning/RLHF pipeline at a conceptual level and explain why each phase exists.
7. Distinguish a base model from an instruction-tuned/chat model and predict how each will behave differently on the same prompt.
8. Explain honestly why "emergent capabilities" is a genuinely disputed claim in the literature, not a settled fact.
9. Identify cost and latency as engineering concerns that begin at the tokenization layer, and name where to go for depth (Cost Optimization, Latency skills).
10. Map each sibling LLM skill (Prompt Engineering, Fine-Tuning, Inference, Serving, Evaluation, Hallucination, Guardrails) to the specific slice of the overall picture it goes deep on.
`,

  prerequisites: `
- **Required**: comfort with basic probability (what a probability distribution over a vocabulary means), and basic familiarity with neural networks as trainable functions with parameters. Nothing about LLMs specifically is assumed.
- **Strongly recommended before this page**: the **Transformers** skill (the architecture LLMs are built from), the **Attention** skill (the mechanism that lets a model weigh relationships between tokens, and the reason context length is expensive), and the **Embeddings** skill (how tokens become vectors, and how meaning is represented geometrically). This page treats those as given and builds the LLM-specific layer on top.
- **Helpful**: basic Python, since worked examples use it; basic familiarity with an LLM API (OpenAI, Anthropic, or similar) if you want to reproduce the sampling examples yourself.

Dependency links: **Transformers** → **Attention** → **Embeddings** → this page (**LLM Fundamentals**) → **Prompt Engineering**, **Fine-Tuning**, **Inference**, **Serving**, **Evaluation**, **Hallucination**, **Guardrails**. This page is the hub; the sibling skills are the spokes.
`,

  "beginner-concepts": `
### What an LLM actually predicts

At every step, an LLM is solving one problem: given the tokens seen so far, output a probability for every possible next token in its vocabulary. Generation is just repeating this step, each time appending the chosen token to the input and asking again.

~~~text
Input so far:  "The capital of France is"
Model output:  a probability distribution over the ENTIRE vocabulary, e.g.
    "Paris"     -> 0.82
    "the"       -> 0.04
    "located"   -> 0.02
    "Lyon"      -> 0.01
    ... (thousands more tokens, most near zero)

A token is picked (see Sampling below), appended, and the process repeats
with "The capital of France is Paris" as the new input.
~~~

This is the whole mechanism. There is no separate "fact lookup" step — "Paris" is likely simply because it appeared after similar contexts millions of times during training, so the model's learned parameters assign it high probability.

### Tokens, not words or characters

Models do not operate on raw characters (too many steps for long text, no shared structure across words) or whole words (vocabulary would need to be effectively infinite to cover every word, prefix, misspelling, and language). Instead they operate on **subword tokens**, learned from data so that common words are single tokens and rare or unseen words are split into meaningful pieces.

~~~text
Sentence: "Tokenization isn't always intuitive."

Possible tokenization (illustrative — exact splits are model/tokenizer-specific):
["Token", "ization", " isn", "'t", " always", " intuit", "ive", "."]

Notice:
- "Tokenization" splits into a common root ("Token") plus a suffix ("ization")
  the tokenizer has seen often enough to earn its own token.
- Common short words ("always") are a single token.
- Rare or compound words ("intuitive") get split into sub-pieces.
- Punctuation and leading spaces are frequently their own tokens.
~~~

### Why subword tokenization (the idea behind BPE)

Byte-Pair Encoding (BPE) and its relatives build a vocabulary by starting from individual characters (or bytes) and iteratively merging the most frequent adjacent pair into a new token, repeating until a target vocabulary size (commonly tens of thousands of tokens) is reached. The result is a fixed-size vocabulary where:

- Frequent whole words become single tokens (efficient, few tokens per sentence).
- Rare words, typos, and unseen words decompose into familiar sub-pieces instead of failing outright (no "unknown word" dead end).
- The same mechanism handles many languages and even code, because it is learned from data, not hand-built rules.

~~~python
# Toy illustration of the BPE merge idea (NOT a real production tokenizer -
# real ones like tiktoken/SentencePiece are implemented in optimized code,
# but the core algorithm is exactly this: count pairs, merge the most
# frequent, repeat).
from collections import Counter

def get_pair_counts(tokens: list[str]) -> Counter:
    """Count how often each adjacent symbol pair appears."""
    pairs = Counter()
    for i in range(len(tokens) - 1):
        pairs[(tokens[i], tokens[i + 1])] += 1
    return pairs

def merge_most_frequent(tokens: list[str]) -> list[str]:
    pairs = get_pair_counts(tokens)
    if not pairs:
        return tokens
    best_pair = max(pairs, key=pairs.get)
    merged = []
    i = 0
    while i < len(tokens):
        if i < len(tokens) - 1 and (tokens[i], tokens[i + 1]) == best_pair:
            merged.append(tokens[i] + tokens[i + 1])
            i += 2
        else:
            merged.append(tokens[i])
            i += 1
    return merged

# Start from characters, run a few merge rounds
symbols = list("low lower lowest")
for _ in range(5):
    symbols = merge_most_frequent(symbols)
print(symbols)
~~~

### The context window, informally

Every LLM has a fixed maximum number of tokens it can look at simultaneously — the **context window**. Everything you send (system prompt, conversation history, retrieved documents) plus everything the model generates must fit inside this budget. Exceed it and the API will reject the request or the earliest content silently falls out of scope, depending on how your client handles it.

### A first look at sampling

The model gives you a probability distribution; something has to turn that into an actual chosen token. The simplest strategy, always picking the single highest-probability token (greedy decoding), tends to produce repetitive, "safe" text. Real generation almost always samples with some controlled randomness — covered in depth below and in the **Prompt Engineering** skill.
`,

  "intermediate-concepts": `
### Tokenization mechanics that matter in practice

- **Whitespace and casing are usually part of the token.** " Paris" and "Paris" (no leading space) are frequently different tokens, which is why token counts can surprise you when text is reformatted.
- **Non-English text and code often tokenize less efficiently** than English prose for a model whose tokenizer vocabulary was built mostly from English-heavy training data — meaning the same idea can cost noticeably more tokens (and money) in another language.
- **Digits and numbers** are often tokenized in small chunks (sometimes per-digit or per-few-digits), which is part of why LLMs historically struggle with precise multi-digit arithmetic — the number "48213" may not be a single semantic unit to the model at all.

~~~python
# Counting tokens matters directly for cost and context-window budgeting.
# tiktoken is OpenAI's open-source tokenizer library; the exact encoding
# name depends on the model family you are targeting.
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
text = "Tokenization isn't always intuitive."
tokens = enc.encode(text)

print(f"token count: {len(tokens)}")
print(f"tokens: {[enc.decode([t]) for t in tokens]}")
# Production note: always measure token counts with the ACTUAL tokenizer
# for the model you are calling -- estimating with "words / 0.75" is a
# rough heuristic that can be significantly wrong for code, non-English
# text, or heavily punctuated content, and being wrong here means either
# truncated context or a surprise on your bill.
~~~

### The context window as a real engineering budget

The context window is not "how much the model remembers" in a human sense — it is the literal maximum number of tokens the attention mechanism can jointly process in one forward pass. Input tokens, conversation history, retrieved documents, and the model's own output tokens all draw from the same shared budget. A model with a 128,000-token context window run with a 100,000-token prompt has only 28,000 tokens left for its answer (or less, if the API reserves headroom).

Why you cannot just always request the maximum context: self-attention computes a relationship score between every pair of tokens in the sequence, so its compute and memory cost scale roughly with the **square** of the sequence length (see the **Attention** skill for the mechanical derivation). Doubling your context length roughly quadruples the attention compute for that pass, which is why long-context requests are measurably slower and more expensive, and why "just stuff everything into the prompt" is a real cost and latency decision, not a free lunch — see the **Cost Optimization** and **Latency** skills for the engineering tradeoffs this creates in production systems.

### Sampling parameters, precisely

Given the model's output probability distribution over the vocabulary, three parameters commonly reshape it before a token is drawn:

- **Temperature** rescales the distribution before sampling. Mechanically, logits (the model's raw pre-probability scores) are divided by the temperature before the softmax that turns them into probabilities. Temperature near 0 sharpens the distribution toward the single most likely token (close to deterministic/greedy); temperature above 1 flattens it, giving lower-probability tokens more relative chance and producing more varied, sometimes less coherent, output.
- **Top-k sampling** restricts sampling to only the k highest-probability tokens at each step, discarding the (potentially huge) long tail entirely before sampling. Small k (e.g. a handful) yields conservative, focused output; large k allows more variety.
- **Top-p (nucleus) sampling** instead keeps the smallest set of top tokens whose cumulative probability reaches a threshold p (e.g. 0.9), which adapts the cutoff to how confident the model is at each step — a very confident step keeps very few tokens, a very uncertain step keeps more. This is generally preferred over top-k because it adapts to context rather than using a fixed cutoff count.

~~~python
# Worked example: same prompt, different temperature, illustrating the
# EFFECT you should expect (actual API and parameter names vary by
# provider -- verify against current provider docs before shipping code).
prompt = "Write one sentence describing a rainy city street."

# temperature = 0.0  -> near-deterministic, most "expected" phrasing
# "Rain streaked down the gray storefronts as pedestrians hurried past
#  under dark umbrellas."

# temperature = 0.7  -> noticeably varied but still coherent
# "The street glistened under a curtain of rain, neon signs blurring in
#  every puddle."

# temperature = 1.3  -> high variance; more surprising, occasionally
# less coherent, word choices
# "Rain hissed sideways across the cobblestones, painting the city in
#  restless, electric silver."

# The mechanical takeaway: higher temperature does not make the model
# "smarter" or "more creative" in a human sense -- it makes the sampling
# step more willing to pick lower-probability tokens, which INCREASES
# variance and can increase both novelty and error rate simultaneously.
~~~

Production guidance: use low temperature (near 0) plus a low or moderate top-p for tasks needing consistency (data extraction, classification, code generation where correctness matters); use higher temperature for brainstorming, creative writing, or generating diverse candidates. Combining top-p with a moderate temperature is the most common production default; see the **Prompt Engineering** skill for how these parameters interact with prompt design to control reliability.

### Base model vs instruction-tuned/chat model

A **base model** is the direct output of pretraining: a raw next-token predictor over its training distribution. Given "The capital of France is", it will plausibly continue with "Paris." — but given "Write me a poem about the ocean", a base model may just as plausibly continue as if that were the start of a list of homework prompts, because base models have no learned tendency to treat input as an instruction to obey; they only continue text in whatever way is statistically plausible given everything similar to it in training data.

An **instruction-tuned / chat model** has gone through additional training (see below) specifically to make it follow instructions, adopt a helpful-assistant persona, and behave consistently across turns of dialogue. The same underlying architecture and much of the same pretrained knowledge is present in both; the difference is a targeted additional training phase that reshapes behavior, not scale.

### The pretraining to alignment pipeline, conceptually

1. **Pretraining**: train on a next-token-prediction objective over a very large, broad text (and sometimes multimodal) corpus. This phase is where the vast majority of compute is spent and where most of the model's raw knowledge and language ability comes from.
2. **Instruction tuning (supervised fine-tuning)**: further train the pretrained model on curated examples of instructions paired with good responses, teaching it to behave like an assistant that follows directions rather than just continuing text plausibly.
3. **RLHF (reinforcement learning from human feedback)** or related preference-optimization techniques: human raters (or a learned reward model trained on human preference data) rank candidate responses; the model is further adjusted to produce outputs more consistent with what people actually preferred, including being helpful, honest, and declining unsafe requests.

This entire pipeline, and the many variants and refinements of it, is the specific subject of the **Fine-Tuning** skill — this page gives you only the conceptual shape so you can recognize why a base model and a chat model of "the same" underlying architecture behave so differently.
`,

  "advanced-concepts": `
### Scaling laws — the empirical observation, stated carefully

Researchers have empirically observed that, within the ranges studied, a language model's next-token-prediction loss tends to improve smoothly and predictably as you increase model parameters, training data, and compute together, following roughly power-law-shaped curves rather than jumping around unpredictably. This observation ("scaling laws") has been influential because it turned "how good will a bigger model be" from a guess into something researchers could extrapolate with some confidence before running the full, expensive training run.

Important hedges a senior engineer should always attach to this topic:

- Scaling-law curves are fit to specific studies under specific conditions (particular architectures, data mixtures, training recipes); they describe trends observed in that research, not a universal law of nature guaranteed to hold at all scales or for all architectures indefinitely.
- "More compute/data/parameters" is not free — training cost, energy, and data availability all impose real limits, and returns can diminish or the optimal balance between parameters and data can shift as techniques change.
- Loss improving smoothly does not automatically mean every downstream capability improves smoothly — which leads directly into the next, more contested topic.

Do not repeat specific scaling-law exponents, parameter counts, or compute figures as settled fact unless you have verified them against a specific, cited source — this page deliberately avoids inventing such numbers.

### Emergent capabilities — an actively disputed topic, stated honestly

It is commonly claimed that some LLM capabilities appear only once a model crosses a certain scale threshold ("emergent capabilities") — for example, a capability that is near-zero across smaller models and then jumps sharply at some larger scale. This claim is genuinely contested in the research literature, not a settled fact, and you should represent it that way in interviews and design discussions.

The core of the dispute: some researchers argue that apparent "emergence" is at least partly an artifact of the evaluation metric used — a metric that only rewards a fully correct multi-step answer (all-or-nothing scoring) can look like a sharp jump in capability at some scale, even when the underlying per-step or per-token quality is actually improving smoothly and continuously the whole time, simply because "all steps correct" is a nonlinear function of "each step's accuracy." Under smoother, partial-credit metrics, the same underlying model improvements can look gradual instead of emergent. Other researchers maintain that at least some capabilities do show genuine discontinuities that are not fully explained by metric choice.

The honest, defensible position for an AI engineer to hold: treat "emergent capabilities" as an open research question with evidence on multiple sides, be skeptical of confident claims in either direction, and always ask "emergent according to which metric, measured how" before accepting a claim about a capability appearing suddenly at scale.

### Why the pretraining objective alone produces such broad behavior

A useful mental model: to predict the next token accurately across an enormous and diverse corpus, a model is implicitly pressured to internalize regularities in grammar, factual associations, narrative structure, code syntax and semantics, arithmetic patterns (to the extent tokenization permits), and conversational conventions — because all of these regularities help predict what comes next in real text that exhibits them. Capability is not programmed in section by section; it is a side effect of the objective being demanding enough, over data rich enough, that the only way to get good at it is to internalize a great deal of structure about the world as represented in text. This is also exactly why LLMs inherit biases, factual errors, and stylistic quirks present in their training data — the objective has no built-in preference for truth, only for plausibility relative to the training distribution.

### Cost and latency as first-class concerns from token one

Every design decision covered above has a direct dollar-and-millisecond cost, and a senior AI engineer treats this as inseparable from correctness, not an afterthought:

- Tokenization efficiency affects cost directly — most commercial APIs price per token, so a verbose prompt template or an inefficient-for-your-language tokenizer is a recurring cost, not a one-time one.
- Context length affects both cost (more input tokens billed) and latency (attention's roughly quadratic cost in sequence length, plus more tokens to generate if the task requires reasoning over more material).
- Sampling parameters have a smaller but real effect on latency and downstream cost (e.g., higher temperature can produce longer or less usable outputs requiring retries).
- These concerns are covered in full engineering depth in the **Cost Optimization** and **Latency** skills; this page's job is to make sure you recognize that the cost/latency conversation starts at the tokenizer and the context window, not at "which model is cheapest."

### How the sibling LLM skills map onto this picture

This page is the map; each sibling skill is a deep dive into one region of it:

- **Prompt Engineering** — getting reliable, useful behavior out of a fixed model without changing its weights: instruction design, few-shot examples, structured output, sampling-parameter tuning.
- **Fine-Tuning** — deliberately changing the model's weights (instruction tuning, RLHF, parameter-efficient methods) to specialize or realign its behavior.
- **Inference** — the mechanics of running a forward pass efficiently: batching, KV-caching, quantization, hardware considerations.
- **Serving** — operating LLMs as a production system: routing, autoscaling, multi-tenant serving, throughput/latency tradeoffs at the infrastructure layer.
- **Evaluation** — measuring whether outputs are actually good: benchmarks, human evaluation, automated scoring, regression testing across model versions.
- **Hallucination** — the specific failure mode where the model produces confident, plausible-sounding but false content, and the mitigation techniques for it.
- **Guardrails** — the safety and reliability layer wrapped around a model in production: input/output filtering, policy enforcement, abuse prevention.
`,

  "internal-working": `
Step by step, here is what happens between you sending a prompt and receiving generated tokens:

~~~mermaid
flowchart TB
    A["Raw input text"] --> B["Tokenizer: text -> subword token IDs (BPE/similar)"]
    B --> C["Token IDs -> embedding vectors (+ positional information)"]
    C --> D["Transformer decoder stack: self-attention + feed-forward layers, repeated N times"]
    D --> E["Final hidden state -> output layer -> logits over the whole vocabulary"]
    E --> F["Sampling step: temperature / top-k / top-p turn logits into a chosen token"]
    F --> G["Chosen token appended to the sequence"]
    G -->|repeat until stop condition| C
    F --> H["Stop condition met (end token, max tokens, stop sequence)"]
    H --> I["Detokenize token IDs back into text"]
~~~

1. **Tokenize**: the input text is converted into a sequence of integer token IDs using the model's fixed vocabulary (see Beginner Concepts for the mechanics).
2. **Embed**: each token ID is looked up in an embedding table, producing a vector; positional information is added or otherwise incorporated so the model knows token order (see the **Embeddings** and **Transformers** skills for the mechanical detail).
3. **Transform**: the sequence of vectors passes through a stack of transformer decoder layers. Each layer's self-attention lets every token position build a representation informed by other positions in the sequence (with causal masking in decoder-only models, so a position can only attend to itself and earlier positions — this is what makes autoregressive generation coherent left-to-right); feed-forward sublayers then transform each position's representation further. See the **Attention** skill for exactly how attention scores are computed.
4. **Produce logits**: the final layer's output for the last token position is projected into a vector of raw scores (logits), one per vocabulary token.
5. **Sample**: logits are turned into a probability distribution (softmax, after temperature scaling) and a token is drawn according to the sampling strategy in effect (greedy, top-k, top-p, or a combination).
6. **Repeat**: the newly chosen token is appended to the sequence, and the whole process repeats — this is what "autoregressive" means: each new token's generation is conditioned on all tokens generated so far, including the ones the model itself just produced.
7. **Stop**: generation halts when the model produces a designated end-of-sequence token, a configured stop sequence is seen, or a maximum token budget is reached.
8. **Detokenize**: the sequence of output token IDs is converted back into human-readable text.

A crucial efficiency detail: naively, step 4 would require recomputing attention over the entire growing sequence from scratch at every new token, which is wasteful. Production inference systems cache the key/value representations from earlier tokens (the "KV cache") so each new token only requires new computation for itself, not the whole prefix again — this optimization, and the memory/throughput tradeoffs it creates, is the subject of the **Inference** skill.
`,

  architecture: `
Understanding LLM architecture, for an AI engineer, means understanding both the model's internal structure (covered by the **Transformers** skill in depth) and how an application should be structured around a model that is accessed as an external, stateless, token-metered service.

### The model's structural shape, at a glance

Most current LLMs are **decoder-only transformers**: a stack of identical layers, each combining causal self-attention (a token can attend only to itself and earlier tokens) with a position-wise feed-forward network, plus normalization and residual connections that make deep stacks trainable. Depth (number of layers), width (hidden dimension size), and number of attention heads are the main architectural knobs that, together with training data and compute, determine model scale. This page treats this as background; see **Transformers** and **Attention** for the mechanical derivation.

### Application architecture around an LLM

~~~mermaid
flowchart TB
    U["User / calling application"] --> App["Application layer\n(prompt construction, business logic)"]
    App --> Guard1["Guardrails: input filtering / policy checks"]
    Guard1 --> Router["Model router / gateway\n(model choice, retries, fallback)"]
    Router --> LLM["LLM API or self-hosted serving layer"]
    LLM --> Guard2["Guardrails: output filtering / validation"]
    Guard2 --> Eval["Evaluation / logging hooks"]
    Eval --> App
    App --> U
    subgraph Data["Supporting data systems"]
        Cache[("Prompt / response cache")]
        Vec[("Vector store\n(retrieval-augmented context)")]
    end
    App --> Cache
    App --> Vec
~~~

Key architectural principles:

- **The model is a stateless function of its input.** All conversational "memory" is the application's responsibility — the full conversation history (or a summarized/retrieved subset of it) must be re-sent inside the context window on every call.
- **Guardrails belong on both sides of the model call** — filtering what goes in and validating/filtering what comes out — because the model itself has no reliable internal enforcement mechanism (see the **Guardrails** skill).
- **A router/gateway layer** typically sits between your application and the model provider(s), handling model selection, retries on transient failures, and fallback to a different model or provider — this is where much of the operational engineering discussed in the **Serving** skill lives.
- **Caching and retrieval** are architected as separate supporting systems, not as model internals — a vector store for retrieval-augmented generation, and a cache keyed on prompt content, are both standard cost- and latency-reduction layers.
`,

  "data-flow": `
Tracing one prompt end to end, from the moment a user submits text to the moment tokens come back:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant Tok as Tokenizer
    participant Model as Transformer (forward pass)
    participant Sampler

    User->>App: "Summarize this document in two sentences."
    App->>App: assemble full prompt (system prompt + history + user text)
    App->>Tok: encode prompt text
    Tok-->>App: sequence of token IDs
    App->>Model: token IDs (within context window budget)
    loop for each output token
        Model->>Model: embeddings + positional info -> attention layers -> logits
        Model->>Sampler: logits over vocabulary
        Sampler->>Sampler: apply temperature, then top-k/top-p
        Sampler-->>Model: chosen next token ID
        Model->>Model: append token, extend KV cache
    end
    Model-->>App: full sequence of output token IDs
    App->>Tok: decode token IDs
    Tok-->>App: output text
    App-->>User: final response text
~~~

The two facts this diagram makes concrete: first, tokenization happens on the way in AND on the way out — everything you are billed for and everything the context window holds is measured in tokens, not characters or words. Second, generation is a loop, not a single call — the model produces exactly one token per pass through the network, and that loop is why longer outputs take proportionally longer to generate (and why streaming responses token-by-token, rather than waiting for the full output, is the standard way to improve perceived latency — see the **Latency** and **Inference** skills for the engineering techniques, including KV-caching, that make this loop efficient in production).
`,

  "production-usage": `
### How real teams actually run LLMs in production

- **Model selection is a per-task decision, not a one-time choice.** Teams commonly route cheap, high-volume, low-difficulty tasks (classification, simple extraction) to smaller/cheaper models, and reserve larger, more expensive models for tasks that genuinely need more capability — a routing decision that directly trades cost against quality.
- **Prompt templates are versioned artifacts**, typically stored alongside code (not hardcoded inline strings scattered through the codebase), so that prompt changes go through the same review and testing discipline as code changes. See the **Prompt Engineering** skill for template design.
- **Sampling parameters are set deliberately per use case**, not left at provider defaults: near-zero temperature for extraction/classification/code generation, moderate-to-higher temperature for creative or brainstorming tasks.
- **Context is budgeted explicitly.** Production systems track token counts for system prompt, conversation history, and retrieved context against the model's context window, typically reserving a portion for the response and truncating or summarizing older history rather than letting a request fail at the limit.
- **Retries, timeouts, and fallbacks are standard**, because LLM API calls are network calls to a service with variable latency and occasional failures — this is treated with the same rigor as any other external dependency.
- **Cost and latency are monitored per request and per feature**, tagged so a team can see, per feature, how many tokens and how much money each user interaction costs — the operational depth of this is the **Cost Optimization** and **Latency** skills.

### Typical operational defaults

- Set a hard max-output-token cap per call, sized to the task, to bound both latency and cost.
- Log prompts and responses (with appropriate redaction/privacy handling) for later evaluation and debugging — see the **Evaluation** skill.
- Treat model version pinning deliberately: silently floating to "latest" can change behavior underneath you; many teams pin a specific model version and upgrade on a tested schedule.
`,

  "industry-examples": `
- **OpenAI** and **Anthropic** operate some of the most widely used LLMs as hosted APIs, with the pretraining-to-RLHF pipeline described in this page as their core product development process — the chat assistants most people have used (ChatGPT, Claude) are instruction-tuned/RLHF'd descendants of base pretrained models.
- **Meta** has released open-weight LLM families (the Llama line), which enabled a large ecosystem of teams to self-host and fine-tune LLMs rather than relying solely on hosted APIs — directly enabling the self-hosted side of the **Serving** and **Fine-Tuning** skills.
- **Google** and **Google DeepMind** develop LLM families (the Gemini line) integrated across search, productivity, and cloud products, and have published influential scaling and architecture research that underlies much of the "why does scale help" discussion in this page.
- **Github/Microsoft** built Copilot on top of LLMs fine-tuned/specialized for code generation, a concrete example of the base-model-to-specialized-assistant pipeline applied to a single high-value domain.
- **Customer support and enterprise software companies broadly** (a large and fast-moving set of vendors) build retrieval-augmented, guardrailed LLM applications on top of hosted model APIs rather than training models themselves — illustrating that most AI engineering work is building the application architecture around an LLM (prompting, retrieval, guardrails, evaluation), not training the model itself.

Pattern to notice: the split between "the handful of organizations that pretrain frontier models" and "the much larger population of AI engineers who build products on top of those models via prompting, fine-tuning, and application architecture" is the organizing fact of the entire LLMs category on this platform — most readers of this page will spend their career in the second group.
`,

  "best-practices": `
1. **Always measure tokens with the real tokenizer for your target model**, not a word-count heuristic — token-per-word ratios vary by language and content type, and being wrong here breaks both cost estimates and context-window budgeting.
2. **Budget the context window explicitly**: decide, per feature, how many tokens are reserved for system prompt, history, retrieved context, and response, and enforce it in code rather than hoping it fits.
3. **Set sampling parameters deliberately per task** — do not leave temperature at a library default for tasks that need consistency (extraction, classification, code).
4. **Pin model versions in production** and upgrade on a tested schedule rather than silently floating to "latest."
5. **Separate the base-model-vs-chat-model question explicitly when choosing a model** — a task that needs raw completion behavior (e.g. specific continuation-style generation) may actually want a base model; most application tasks want an instruction-tuned model.
6. **Never assume factual correctness from a plausible-sounding answer** — cross-reference the **Hallucination** skill's mitigation techniques (retrieval grounding, citations, verification steps) for any answer that matters.
7. **Treat prompts as versioned, tested artifacts**, not inline strings — regressions in prompt behavior should be caught the same way code regressions are, via the practices in the **Evaluation** skill.
8. **Log enough to debug and evaluate later**: prompts, model/version, sampling parameters, and outputs, with privacy-appropriate redaction.
9. **Design for the model as a stateless, rate-limited, occasionally-failing network dependency** — timeouts, retries with backoff, and graceful degradation are not optional.
10. **Wrap every production LLM call with input and output guardrails** appropriate to your risk surface — see the **Guardrails** skill for concrete techniques.
11. **Route by task difficulty and cost sensitivity**, not by defaulting every call to the largest available model.
12. **Re-evaluate scaling and emergent-capability claims skeptically** — treat vendor marketing claims about "emergent" abilities as hypotheses to test against your own evaluation suite, not settled facts.
`,

  "anti-patterns": `
### Estimating tokens by word count instead of the real tokenizer

~~~text
WRONG:  token_estimate = len(text.split()) * 1.3   # rough word-based guess
RIGHT:  token_count = len(real_tokenizer.encode(text))  # exact, model-specific
~~~

Word-based heuristics are noticeably wrong for code, non-English text, and heavily punctuated content — exactly the content most likely to blow a context-window budget or a cost estimate.

### Other common LLM-fundamentals-level anti-patterns

- **Treating "emergent capabilities" or specific scaling-law numbers as settled facts** in design docs or interviews, rather than as actively debated, evaluation-dependent claims — state the hedge, every time.
- **Assuming a chat/instruction-tuned model's fluent, confident tone means factual correctness.** Fluency is a property of the language-modeling objective; correctness is a separate property the model was never directly optimized to guarantee.
- **Using a high temperature "to make the model smarter"** on tasks (extraction, code, classification) that need consistency — high temperature increases variance, including variance toward wrong answers, not "creativity" in a useful sense for these tasks.
- **Letting conversation history grow unbounded** until a request fails at the context-window limit, instead of budgeting and truncating/summarizing proactively.
- **Ignoring the quadratic cost of long context** and defaulting to "just put everything in the prompt" as a substitute for retrieval or summarization — this is a cost and latency decision, not a free simplification.
- **Floating to "latest model" in production without re-evaluation** — model updates can change behavior in ways that break prompts tuned against a previous version; re-run your evaluation suite (see the **Evaluation** skill) before adopting a new version.
- **No output validation before using an LLM's response programmatically** — treating the model's output as trustworthy structured data without parsing/validation is a common source of silent production bugs.
`,

  performance: `
### Measure first

Before optimizing anything, instrument and measure: tokens in, tokens out, wall-clock latency (including time-to-first-token for streaming responses), and cost per request. Without this, "performance" work is guesswork.

### The optimization hierarchy for LLM-based systems (apply in order)

1. **Reduce tokens sent, not just tokens billed for.** Trim system prompts, summarize or retrieve only relevant history/context instead of sending everything, and avoid redundant repeated instructions.
2. **Reduce output length deliberately** where the task allows it — a tightly scoped instruction ("respond in one sentence") reduces generation time roughly in proportion to tokens generated, since generation is a token-by-token loop.
3. **Choose the smallest model that reliably meets your quality bar for the task**, rather than defaulting to the largest available model for every call — this is the single biggest lever most teams under-use.
4. **Cache aggressively** where inputs repeat (exact-match or semantic caching of prompts/responses) to avoid paying for regeneration of the same answer.
5. **Stream responses** so users see output as it is generated rather than waiting for the full response — this improves perceived latency even when total generation time is unchanged.
6. **Batch requests where the serving layer supports it** to improve throughput at the infrastructure level — the concrete mechanics (continuous batching, KV-cache management) are covered in the **Inference** and **Serving** skills.
7. **Push genuinely infrastructure-level optimization (quantization, hardware choice, batching strategy) to the Inference and Serving skills** rather than trying to solve it at the application layer.

### Facts worth knowing at this level

- Because attention cost grows roughly quadratically with sequence length, doubling your prompt length does not just double cost — it can more than double latency for the attention computation specifically (though total wall-clock also depends heavily on serving-layer optimizations like KV-caching, covered in **Inference**).
- Generation is strictly sequential per response (one token conditions the next), so output length is a direct, largely unavoidable latency driver at the application level — the main lever you have is asking for shorter, more targeted outputs.
- Time-to-first-token and total generation time are different metrics that matter for different user experiences (a chat UI cares about time-to-first-token; a batch pipeline cares about total throughput).
`,

  scalability: `
Scalability for LLM-based systems has two distinct dimensions: scaling the model-serving infrastructure itself (covered in depth in the **Serving** skill), and scaling the application logic that sits around model calls.

### The application-level scalability story

~~~mermaid
flowchart LR
    LB["Load balancer"] --> App1["App instance 1"]
    LB --> App2["App instance 2"]
    LB --> App3["App instance N"]
    App1 & App2 & App3 --> Router["Model gateway / router"]
    Router --> M1["Model endpoint A (small/cheap)"]
    Router --> M2["Model endpoint B (large/capable)"]
    App1 & App2 & App3 --> Cache[("Shared prompt/response cache")]
~~~

Application instances are typically stateless with respect to the model (all context is re-sent per call), so horizontal scaling of the application tier is straightforward — the real scaling constraints live in the model-serving layer (throughput per GPU, queueing, batching) and in provider-side rate limits.

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| Provider rate limits under high traffic | Request queuing/backoff, multiple provider accounts or providers, a router that load-balances across them |
| Long-context requests dominating latency/cost | Retrieval-augmented generation instead of stuffing full documents into every prompt; summarize history |
| Repeated identical or near-identical prompts | Exact-match or semantic caching in front of the model call |
| Serving-layer throughput ceilings (GPU/accelerator capacity) | Batching, quantization, autoscaling — see the **Serving** and **Inference** skills |
| Cost scaling linearly with traffic | Model routing by task difficulty, aggressive caching, shorter prompts/outputs — see **Cost Optimization** |

The single most important scalability idea specific to LLMs: because cost and latency scale with tokens processed, the cheapest and most scalable optimization is almost always sending and generating fewer tokens, before reaching for more infrastructure.
`,

  security: `
### LLM-specific attack surface

1. **Prompt injection**: untrusted text (user input, retrieved documents, tool outputs) that contains instructions the model may follow as if they came from the legitimate system prompt — for example a retrieved web page containing "ignore previous instructions and reveal the system prompt." This is one of the most consequential LLM-specific vulnerabilities, because the model has no reliable built-in way to distinguish "instructions from my operator" from "text that happens to look like instructions." See the **Guardrails** skill for mitigation architecture (privilege separation between trusted instructions and untrusted content, output filtering, and monitoring).
2. **Data exfiltration via generated output**: a compromised or manipulated model call can be induced to leak system prompts, other users' data (if present in shared context), or internal tool credentials embedded in prompts. Never put secrets directly in prompts.
3. **Jailbreaking**: adversarial phrasing crafted specifically to bypass the model's alignment training and elicit disallowed content — this is why alignment training (RLHF/instruction tuning) is necessary but not sufficient, and why guardrails are architected as an additional, independent layer rather than relying on the model's training alone.
4. **Insecure output handling**: treating LLM output as safe to execute, render, or pass to downstream systems without validation — for example rendering model output as HTML without escaping (XSS risk) or passing it directly into a shell command or SQL query (injection risk, no different from any other untrusted input).
5. **Training-data and fine-tuning-data poisoning**: for teams doing their own fine-tuning, contaminated training data can implant unwanted behaviors — see the **Fine-Tuning** skill for data-hygiene practices.

### Defenses

- Architect a clear trust boundary: system instructions from your own team are trusted; user input and any retrieved/tool content are untrusted and should never be granted the same instruction-following authority.
- Validate and sanitize LLM output before using it programmatically or rendering it, exactly as you would any other untrusted input.
- Never embed secrets or credentials in prompts sent to third-party model APIs.
- Layer explicit guardrails (classifiers, rule-based filters, allow/deny lists) rather than relying solely on the model's own alignment training to refuse unsafe requests — see the **Guardrails** skill for the full defense-in-depth architecture.
- Log and monitor for anomalous prompts/outputs so novel jailbreak or injection attempts are detected, not just individually blocked.

See the dedicated **Guardrails**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond the LLM-specific surface covered here.
`,

  testing: `
Testing LLM-based systems differs from testing deterministic code because the same input can legitimately produce different valid outputs. Full testing methodology (test sets, scoring rubrics, regression suites, human evaluation) is the dedicated subject of the **Evaluation** skill; this section covers the fundamentals-level testing habits that apply even before you have a full evaluation pipeline.

~~~python
# A minimal example of testing an LLM-backed function: don't assert exact
# string equality (the model is non-deterministic by default); assert
# properties of the output instead.
import re

def test_summary_is_short_and_relevant():
    summary = summarize(document="... long document text ...", max_sentences=2)

    # Property-based checks, not exact-match checks:
    assert len(summary.split(".")) <= 3          # roughly bounded length
    assert "error" not in summary.lower()          # sanity check, not a real guardrail
    assert len(summary.strip()) > 0                # not empty

def test_extraction_returns_valid_json_schema():
    result = extract_fields(text="Invoice #123, total $45.00")
    # Validate STRUCTURE, since exact wording may vary run to run
    assert "invoice_number" in result
    assert isinstance(result["total"], (int, float))
~~~

### Fundamentals-level testing doctrine

- **Test properties and structure, not exact text**, because sampling makes exact-match assertions brittle and often wrong even when the model behaved correctly.
- **Set temperature to 0 (or as low as your provider allows) in tests that need reproducibility**, understanding this reduces but does not fully eliminate variance across model versions.
- **Separate "did the API call succeed" tests (mockable, deterministic) from "is the output good" tests (need real model calls and a scoring approach)** — the latter is where the **Evaluation** skill's methodology takes over.
- **Test token-budget edge cases explicitly**: what happens when input plus expected output would exceed the context window — this should be a handled case, not a crash.
- **Test guardrail behavior directly**: adversarial or malformed inputs should trigger the expected filtering/rejection behavior, not just "usually work."
`,

  debugging: `
### Escalation path for debugging unexpected LLM behavior

1. **Inspect the exact tokens sent, not the string you think you sent.** Reformatting, extra whitespace, or template bugs can silently change token count and even token boundaries — decode the actual token IDs the API received if your provider exposes them, or re-encode your prompt locally with the matching tokenizer.

~~~python
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
prompt = build_prompt(user_input, history)   # your actual prompt-construction code
tokens = enc.encode(prompt)
print(f"token count: {len(tokens)}")
print(f"first/last 20 tokens decoded: "
      f"{[enc.decode([t]) for t in tokens[:20]]} ... "
      f"{[enc.decode([t]) for t in tokens[-20:]]}")
# Debugging habit: when output is wrong, first confirm the INPUT the model
# actually received was what you intended -- a shocking number of "model
# bugs" are prompt-construction bugs.
~~~

2. **Reproduce with temperature at or near 0** to remove sampling randomness as a variable while you isolate whether the issue is in prompt construction, model choice, or a genuine model limitation.
3. **Check for context-window truncation.** If history or retrieved content silently exceeded the budget, the model may be missing information you assumed it had — log the exact token counts per component (system prompt, history, retrieved context) on every call.
4. **Compare base-model vs instruction-tuned behavior** if you suspect you are using the wrong model type for the task — a base model given a chat-style prompt without instruction tuning can behave very differently than expected.
5. **Check model version pinning.** If behavior changed without a code change, confirm whether the underlying model version changed underneath you.
6. **Escalate to a proper evaluation run** (the **Evaluation** skill) once you have ruled out prompt-construction and configuration bugs — some issues are genuine model capability limitations, not bugs you can fix by adjusting the call.

### Common "it's not a bug, it's the fundamentals" traps

- Output cut off mid-sentence: hit the max-output-token cap, not a model malfunction — raise the cap or shorten the request.
- Wildly inconsistent outputs across runs: check whether temperature is actually set to what you think it is; some SDKs default to a nonzero temperature.
- Model "forgot" earlier context: check whether that context actually fit inside the context window, or was truncated by your own application logic.
`,

  monitoring: `
Production LLM monitoring extends standard service monitoring with token- and model-specific signals.

### What to measure

- **Tokens per request** (input and output, separately) — the foundation for cost and context-budget monitoring.
- **Latency, split into time-to-first-token and total generation time** — these have different causes and different user-experience implications.
- **Cost per request and per feature**, aggregated so a team can see spend by feature, not just in total.
- **Error/failure rates** for the model call itself (timeouts, rate limits, provider errors) as a distinct signal from application-level errors.
- **Output-quality signals over time** — even lightweight automated checks (schema validation pass rate, guardrail trigger rate) give an early warning that something changed, ahead of a full evaluation run.

~~~python
# Minimal instrumentation sketch around an LLM call.
import time
import logging

logger = logging.getLogger("llm_calls")

def call_model_with_monitoring(prompt: str, **params) -> str:
    start = time.perf_counter()
    try:
        response = model_client.generate(prompt=prompt, **params)
    except Exception:
        logger.exception("llm_call_failed", extra={"prompt_tokens": count_tokens(prompt)})
        raise
    elapsed = time.perf_counter() - start

    logger.info(
        "llm_call_completed",
        extra={
            "prompt_tokens": count_tokens(prompt),
            "output_tokens": count_tokens(response.text),
            "latency_seconds": elapsed,
            "model": params.get("model"),
            "temperature": params.get("temperature"),
        },
    )
    return response.text
~~~

### Model-specific things to watch

- A sudden shift in output-token count for the same prompts can indicate an underlying model-version change (if not pinned) or a prompt-template regression.
- A rising guardrail-trigger rate can indicate either an actual increase in adversarial/malformed input, or a prompt-template regression producing worse outputs that guardrails are now correctly catching more of.
- Track token counts against the context-window ceiling explicitly, so you get an early warning before requests start failing or silently truncating.

Full observability practice (structured logging, metrics, tracing infrastructure) is covered generally in the Observability category; this section covers only what is specific to LLM calls.
`,

  deployment: `
Deploying an LLM-based feature, at the fundamentals level, means deploying the application layer that calls a model API (or a self-hosted model endpoint) — the deep mechanics of hosting the model itself are the **Serving** skill's subject. This section covers the application-deployment concerns specific to working with LLMs.

### Configuration that must be explicit at deployment time

~~~text
LLM_PROVIDER=openai            # or anthropic, self-hosted, etc.
LLM_MODEL=<pinned model version, not "latest">
LLM_MAX_OUTPUT_TOKENS=512      # bounds cost and latency per call
LLM_TEMPERATURE=0.0            # task-appropriate default, overridable per call
LLM_TIMEOUT_SECONDS=30
LLM_MAX_RETRIES=2
LLM_API_KEY=<from secrets manager, never in code or plain config files>
~~~

Why each choice matters: pinning the model version prevents silent behavior drift; a max-output-token cap bounds worst-case latency and cost per request; an explicit timeout and retry policy treats the model API as the network dependency it is; the API key coming from a secrets manager (not source-controlled config) is standard secrets hygiene — see the **Secrets Management** skill.

### Rollout practice specific to LLM features

- **Roll out prompt or model changes behind a flag**, and run your evaluation suite (see the **Evaluation** skill) against the new configuration before full rollout — prompt and model changes are behavior changes, and should go through the same gating as any other behavior change.
- **Canary model-version upgrades** to a small percentage of traffic first, monitoring the signals described in Monitoring, before pinning the new version fleet-wide.
- **Keep a fallback path**: if the primary model/provider is unavailable or rate-limited, a defined fallback (a different model, a cached response, or a graceful degraded response) should exist rather than the feature simply failing.
`,

  "production-checklist": `
Before an LLM-backed feature takes real production traffic:

- [ ] Model version explicitly pinned (not floating to "latest")
- [ ] Token counts measured with the real tokenizer for the target model, not a heuristic
- [ ] Context-window budget explicitly allocated across system prompt, history, retrieved context, and reserved response space
- [ ] Sampling parameters (temperature, top-p/top-k) set deliberately per task, not left at library defaults
- [ ] Max-output-token cap set, sized to the task
- [ ] Timeouts and retry-with-backoff configured on every model API call
- [ ] Fallback behavior defined for provider errors, rate limits, or timeouts
- [ ] Input guardrails in place for untrusted content (user input, retrieved documents) — see **Guardrails**
- [ ] Output validation/guardrails in place before using model output programmatically or rendering it
- [ ] Prompts stored as versioned artifacts, not inline hardcoded strings
- [ ] An evaluation suite exists and runs before any prompt or model-version change ships — see **Evaluation**
- [ ] Cost and latency monitored per feature, not just in aggregate
- [ ] Secrets (API keys) sourced from a secrets manager, never hardcoded
- [ ] Logging captures enough (prompt, model, parameters, output) to debug and evaluate later, with appropriate privacy redaction
- [ ] Known hallucination-risk areas identified and mitigated (retrieval grounding, citations, or verification steps) — see **Hallucination**
`,

  "common-mistakes": `
1. **Estimating tokens by word count** instead of the real tokenizer — leads to wrong cost estimates and context-window surprises, because token-per-word ratios vary substantially by language and content type.
2. **Treating the context window as "how much the model remembers"** in a human sense, rather than a hard architectural ceiling on tokens jointly attended to — leads to silently truncated or dropped context.
3. **Leaving temperature at a nonzero default for tasks needing consistency** (extraction, classification, code generation), then being surprised by inconsistent output across runs.
4. **Assuming fluent output means correct output** — the model's training objective rewards plausible continuation, not verified truth; this is the root cause behind most hallucination surprises.
5. **Stating scaling-law numbers or "emergent capability" claims as settled fact** — both are genuinely debated/context-dependent in the research literature; overconfident claims here are a real interview and design-review red flag.
6. **Ignoring the quadratic cost of long context** and defaulting to "just send the whole document" instead of retrieval or summarization, then being surprised by cost or latency.
7. **Floating to "latest model" in production** without re-running evaluation, then being surprised when behavior changes underneath a previously-tuned prompt.
8. **Confusing base models and instruction-tuned/chat models** — using a base model where instruction-following behavior was needed (or vice versa), then attributing the resulting bad output to "the model being bad" rather than a model-selection mismatch.
9. **No output validation before using model output programmatically** — a model producing almost-valid JSON or almost-correct structured data will eventually produce genuinely invalid output, and unvalidated downstream code will break.
10. **Treating guardrails as optional or as the model's job alone** — relying solely on alignment training rather than an explicit, independent guardrail layer.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Request rejected: context length exceeded | Prompt + history + expected output exceeds the model's context window | Budget tokens explicitly; truncate/summarize history; retrieve only relevant context |
| Output cut off mid-sentence | Hit the configured max-output-token cap | Raise the cap appropriately, or shorten/scope the request |
| Wildly inconsistent output across identical calls | Temperature/top-p set higher than intended, or provider default is nonzero | Set temperature explicitly (near 0) for tasks needing consistency |
| Model ignores part of a long prompt | Content buried deep in a very long context, or context-window truncation occurred silently | Shorten/restructure the prompt; place critical instructions prominently; verify actual token counts sent |
| Confidently wrong factual answer | Hallucination — model produced a plausible but false continuation | Add retrieval grounding, citations, or a verification step — see **Hallucination** |
| Output structurally invalid (broken JSON, missing fields) | No output validation/parsing guardrail; sampling produced a malformed completion | Validate and, where supported, use constrained/structured output modes; retry on validation failure |
| Behavior changed after a routine deploy with no prompt changes | Model floated to a new version ("latest") underneath the application | Pin model version explicitly; re-run evaluation before adopting new versions |
| Unexpectedly high token/cost usage | Verbose prompt template, unbounded history growth, or inefficient tokenization for the content/language | Measure with the real tokenizer; trim templates; cap and summarize history |
| Prompt injection succeeded (model followed instructions from untrusted content) | No trust separation between system instructions and untrusted user/retrieved content | Add guardrails and explicit trust boundaries — see **Guardrails** |
`,

  faqs: `
**Q: Is an LLM "thinking" or "understanding" in the way people mean those words?**
This is disputed and partly a matter of definition rather than a settled empirical fact. What is not disputed: mechanically, the model is predicting next tokens based on learned statistical regularities in its training data. Whether that process constitutes "understanding" is a philosophical and scientific debate this page will not resolve — be wary of confident claims in either direction.

**Q: Why does the same prompt sometimes give different answers?**
Because generation samples from a probability distribution rather than deterministically picking one answer (unless temperature is set to 0 or near it) — see the Sampling discussion in Intermediate Concepts.

**Q: Why is a longer context window not simply "strictly better"?**
Because self-attention's compute cost grows roughly quadratically with sequence length, so more context is measurably more expensive and slower, not free — see Intermediate Concepts and the **Attention** skill.

**Q: Do bigger models always perform better?**
Scaling laws describe a general trend of smooth improvement with more parameters/data/compute within studied ranges, but "always" and "for every task" are overclaims — task-specific fine-tuning, better data, or better prompting can outperform simply using a larger general-purpose model on a specific task. See Advanced Concepts for the hedged version of this claim.

**Q: What's the actual difference between a base model and ChatGPT/Claude-style assistants?**
The base model is the direct pretraining output; the assistant behavior comes from additional instruction-tuning and RLHF-style alignment training on top of that base model — see Intermediate Concepts for the pipeline.

**Q: Are emergent capabilities real?**
Genuinely disputed in the literature — some researchers attribute apparent emergence at least partly to evaluation-metric artifacts (all-or-nothing scoring), others maintain some capabilities show real discontinuities. Treat it as an open question, not a settled fact.

**Q: Where do I go to actually get reliable behavior out of a model without training it myself?**
The **Prompt Engineering** skill — this page covers why sampling and context work the way they do; that skill covers how to design prompts, few-shot examples, and structured-output techniques to get consistent behavior.

**Q: My model hallucinates on factual questions — is that a bug?**
No — it is an expected consequence of the training objective (plausibility, not verified truth). It is a well-studied failure mode with mitigation techniques covered in the **Hallucination** skill, not a defect specific to one model.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a large language model trained to do?* Model answer sketch: predict the probability distribution over the next token given preceding tokens, trained over a massive text corpus; broad capability emerges as a side effect of this objective being demanding at scale.
2. *Why do LLMs use subword tokens instead of characters or whole words?* Characters are too fine-grained and lose word-level structure at scale; whole-word vocabularies can't cover every word/misspelling/language; subword tokenization (e.g. BPE) balances vocabulary size against coverage by learning common pieces from data.
3. *What is the context window?* The maximum number of tokens the model can attend to jointly in one forward pass; input and output tokens share this same budget.
4. *What does temperature control?* It rescales logits before the softmax that produces sampling probabilities; lower temperature sharpens toward the most likely tokens (more deterministic), higher temperature flattens the distribution (more varied/random).
5. *What's the difference between top-k and top-p sampling?* Top-k keeps a fixed number of highest-probability tokens; top-p (nucleus) keeps the smallest set of top tokens whose cumulative probability reaches a threshold, adapting to the model's confidence at each step.

**Senior:**

6. *Why does context length have a real computational cost, not just a data-size cost?* Self-attention computes relationships between every pair of tokens, so compute/memory scale roughly quadratically with sequence length; doubling context roughly quadruples the attention compute for that pass. Strong answers connect this to the **Attention** skill and to cost/latency engineering tradeoffs in production.
7. *Explain the pretraining-to-alignment pipeline and why each phase exists.* Pretraining (next-token prediction over broad data, absorbs most compute and general capability) → instruction tuning (supervised examples teaching instruction-following) → RLHF/preference optimization (aligns behavior to human preferences, including helpfulness and safety refusals). Each phase exists because the previous phase alone does not produce assistant-like behavior.
8. *Are "emergent capabilities" real, and how would you evaluate that claim?* Strong answer states the dispute honestly: some evidence suggests apparent emergence is partly an artifact of all-or-nothing evaluation metrics rather than genuinely discontinuous underlying capability; a rigorous answer would re-evaluate with continuous/partial-credit metrics before accepting an emergence claim.
9. *A team wants to just "put the whole knowledge base into the prompt" instead of building retrieval. What do you tell them?* Discuss the quadratic attention cost, the real per-request cost and latency implications, the practical context-window ceiling, and that retrieval-augmented generation is usually the more scalable and often more accurate architecture — segues naturally into recommending they also read the **Prompt Engineering** and retrieval-related material.
10. *How would you decide whether to use a base model, an instruction-tuned model, or a fine-tuned model for a given task?* Base model rarely appropriate for application tasks (no instruction-following behavior); instruction-tuned model is the default for most tasks; fine-tuning is justified when prompting alone can't reliably achieve the needed behavior/format/domain specialization at acceptable cost — ties directly to the **Fine-Tuning** skill's decision criteria.
11. *Why can LLMs struggle with precise multi-digit arithmetic?* Numbers are often tokenized in small chunks (sometimes per-digit or per-few-digits) rather than as single semantic units, and the model has no built-in calculator — it is pattern-matching on digit sequences the way it pattern-matches on any other token sequence.
12. *How would you debug a production incident where an LLM feature's output quality dropped overnight with no code deploy?* Check whether the model version floated ("latest") and changed underneath the application; check for a silent context-window truncation change; check evaluation suite results against the new version before deciding on rollback vs. re-tuning.
`,

  "coding-questions": `
### 1. Manually implement temperature-scaled sampling from logits

~~~python
import math
import random

def softmax(xs: list[float]) -> list[float]:
    m = max(xs)
    exps = [math.exp(x - m) for x in xs]   # subtract max for numerical stability
    total = sum(exps)
    return [e / total for e in exps]

def sample_with_temperature(logits: list[float], temperature: float) -> int:
    """Return an index sampled from the logits, reshaped by temperature.

    temperature -> 0 approaches argmax (near-deterministic);
    temperature > 1 flattens the distribution toward uniform randomness.
    """
    if temperature <= 0:
        raise ValueError("temperature must be > 0; use a tiny epsilon for near-greedy behavior")
    scaled = [x / temperature for x in logits]
    probs = softmax(scaled)
    r = random.random()
    cumulative = 0.0
    for i, p in enumerate(probs):
        cumulative += p
        if r <= cumulative:
            return i
    return len(probs) - 1   # floating-point safety fallback

# Example: vocabulary of 4 tokens with these raw logits
logits = [2.0, 1.0, 0.1, -1.0]
print(sample_with_temperature(logits, temperature=0.2))   # sharply favors index 0
print(sample_with_temperature(logits, temperature=1.5))   # more varied
~~~

Complexity: O(vocabulary size) per sample, dominated by the softmax computation. Follow-ups: implement top-k filtering before sampling (zero out all but the k highest logits, renormalize); implement top-p/nucleus filtering (sort by probability, keep the smallest prefix whose cumulative sum exceeds p).

### 2. Implement top-p (nucleus) filtering on top of the sampler above

~~~python
def top_p_filter(probs: list[float], p: float) -> list[float]:
    """Zero out all tokens outside the smallest top set whose cumulative
    probability reaches p, then renormalize the remaining probabilities."""
    indexed = sorted(enumerate(probs), key=lambda pair: pair[1], reverse=True)
    cumulative = 0.0
    keep_indices = set()
    for idx, prob in indexed:
        if cumulative >= p:
            break
        keep_indices.add(idx)
        cumulative += prob

    filtered = [prob if i in keep_indices else 0.0 for i, prob in enumerate(probs)]
    total = sum(filtered)
    return [x / total for x in filtered]   # renormalize so probabilities sum to 1

# Edge case worth testing: p so small that even the single highest-probability
# token's mass exceeds it -- the loop must still keep at least that one token.
probs = softmax([2.0, 1.0, 0.1, -1.0])
filtered = top_p_filter(probs, p=0.9)
print(filtered)
~~~

Complexity: O(V log V) for the sort, O(V) for the rest, where V is vocabulary size. Follow-ups: combine top-k and top-p (apply top-k first, then top-p on the remainder); discuss numerical edge cases (p=0, p=1, all-zero probabilities after filtering).

### 3. Estimate whether a conversation will fit in a model's context window

~~~python
def fits_in_context(
    system_prompt_tokens: int,
    history_tokens: list[int],   # token count per prior message
    new_message_tokens: int,
    max_context_tokens: int,
    reserved_for_response: int,
) -> tuple[bool, int]:
    """Return (fits, tokens_available_for_response_if_it_fits_or_needed_trim)."""
    used = system_prompt_tokens + sum(history_tokens) + new_message_tokens
    available_for_response = max_context_tokens - used
    fits = available_for_response >= reserved_for_response
    return fits, available_for_response

def trim_history_to_fit(
    history_tokens: list[int],
    system_prompt_tokens: int,
    new_message_tokens: int,
    max_context_tokens: int,
    reserved_for_response: int,
) -> list[int]:
    """Drop OLDEST history messages first until the budget fits.
    Production note: dropping oldest-first is a simple policy; production
    systems often summarize dropped history instead of discarding it, to
    preserve important earlier context (see Prompt Engineering)."""
    budget = max_context_tokens - reserved_for_response - system_prompt_tokens - new_message_tokens
    trimmed = list(history_tokens)
    while sum(trimmed) > budget and trimmed:
        trimmed.pop(0)   # drop oldest message first
    return trimmed
~~~

Complexity: O(n) for fitting/trimming over n history messages. Follow-ups: implement summarization-based trimming instead of hard dropping; implement a priority scheme that keeps the most relevant (not just most recent) messages, connecting directly to retrieval-augmented context selection.
`,

  "hands-on-labs": `
### Lab 1 — Tokenizer explorer (beginner, ~1h)
Using a real tokenizer library (e.g. tiktoken), write a small script that takes arbitrary text and prints: total token count, the decoded text of each individual token, and a comparison of token counts for the same sentence in English vs. at least one other language. Deliverable: a short written observation of where token counts surprised you. Skills exercised: tokenization mechanics, cost-estimation habits.

### Lab 2 — Sampling parameter explorer (beginner/intermediate, ~1.5h)
Call a real LLM API with the same prompt at three or more temperature settings (and, separately, three top-p settings), collect the outputs, and write a short comparison of coherence vs. variety observed at each setting. Deliverable: a table of settings and outputs plus a paragraph explaining the sampling mechanics behind the differences you observed. Skills exercised: sampling parameters, prompt/response API usage.

### Lab 3 — Context-window budget tracker (intermediate, ~2h)
Build a small utility that, given a system prompt, a growing conversation history, and a new user message, computes exact token counts for each component using a real tokenizer, enforces a configurable max-context budget, and implements at least one trimming strategy (oldest-first drop, or a simple summarization stub) when the budget would be exceeded. Deliverable: a tested module plus a demonstration of it correctly trimming a conversation that would otherwise overflow. Skills exercised: context-window mechanics, production token-budgeting discipline.

### Lab 4 — End-to-end guarded LLM feature (production, ~3-4h)
Build a minimal service (any web framework) that accepts a user request, applies a basic input guardrail (reject/flag obviously adversarial instructions embedded in input), calls an LLM with pinned model version and explicit sampling parameters, validates the output against an expected structure before returning it, and logs token counts, latency, and cost per request. Deliverable: a running service plus a short incident-response note describing what you'd check first if output quality dropped. Skills exercised: the full production-usage picture this page covers, tied together.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate LLM-fundamentals mastery (each also reaches into a sibling skill):

1. **Token-and-cost-aware chat gateway** — A backend service that fronts one or more LLM providers, tracks exact token usage and cost per request and per user, enforces context-window budgets with a real trimming/summarization strategy, and routes requests to a smaller or larger model based on a configurable difficulty heuristic. Demonstrates: tokenization mastery, context-window engineering, cost-aware routing — directly relevant to the **Cost Optimization** and **Serving** skills.

2. **Sampling-parameter tuning dashboard** — A small tool that runs the same prompt across a grid of temperature and top-p values against a real model, scores the outputs against a simple rubric (length, keyword presence, or a secondary LLM-as-judge score), and visualizes how output quality/variety shifts across the grid. Demonstrates: precise understanding of sampling mechanics and a first taste of the **Evaluation** skill's methodology.

3. **Guarded retrieval-augmented assistant** — An assistant that answers questions only using retrieved, trusted documents (not the model's raw parametric knowledge), explicitly separates untrusted retrieved content from trusted system instructions to resist prompt injection, and flags/refuses when retrieved evidence doesn't support a confident answer. Demonstrates: hallucination mitigation via grounding, guardrail architecture, and the base-model-vs-assistant behavior distinction in a concrete system — bridges directly into the **Hallucination** and **Guardrails** skills.

Each project should include: exact token/cost instrumentation, a pinned model version, an explicit sampling-parameter rationale documented in the README, and at least a lightweight evaluation script — the engineering discipline around the model call is what distinguishes a fundamentals-level demo from a portfolio-grade project.
`,

  "case-studies": `
### The 2→3 GPT scale jump and the birth of scaling-law thinking
Empirical work fitting model performance to model/data/compute scale reframed "how good will a bigger model be" from guesswork into an extrapolatable trend within studied ranges, which materially changed how research labs planned large training runs. Lesson: treating scale as a variable you can plan around, with appropriate statistical hedging, is now a standard part of frontier-model research planning — but the hedge matters as much as the trend.

### ChatGPT's launch and the base-model-to-assistant gap
The same broad class of underlying pretrained capability existed in earlier base models, but instruction tuning and RLHF turned that raw capability into a product ordinary people could use conversationally without prompt-engineering expertise. Lesson: alignment/instruction-tuning is not a minor finishing step — it is frequently the difference between a research artifact and a usable product, which is exactly why it is broken out into its own dedicated skill (**Fine-Tuning**) on this platform.

### Open-weight model releases and the rise of self-hosted fine-tuning
The availability of strong open-weight base models enabled a wide ecosystem of teams to fine-tune and self-host LLMs rather than depend solely on hosted APIs, directly enabling much of what the **Fine-Tuning** and **Serving** skills cover in depth. Lesson: the "who trains the base model" question and the "who builds the product on top of it" question are largely separate industries now, and most AI engineering work sits in the second one.

### Prompt-injection incidents in early retrieval-augmented assistants
Multiple early demonstrations showed that assistants which pulled in untrusted retrieved or user-supplied content could be manipulated into ignoring their original instructions, because the model has no built-in way to distinguish trusted instructions from untrusted content that merely looks like instructions. Lesson: this is precisely why guardrail architecture (explicit trust boundaries, output validation) is treated as a separate, necessary engineering layer rather than something alignment training alone can guarantee — see the **Guardrails** skill.
`,

  comparisons: `
| Dimension | Base pretrained model | Instruction-tuned / chat model | Fine-tuned (task-specialized) model | Retrieval-augmented setup (any model) |
|-----------|------------------------|----------------------------------|----------------------------------------|------------------------------------------|
| Follows instructions reliably | No — continues text plausibly, not obediently | Yes — trained specifically for this | Yes, plus task-specific behavior | Depends on the underlying model; adds grounding |
| Best for | Raw completion research, specific continuation-style use cases | General-purpose assistant tasks | Narrow, high-volume, well-specified tasks | Tasks needing up-to-date or proprietary facts |
| Factual reliability | No inherent advantage | No inherent advantage over base | Can improve reliability on its specific domain | Improves reliability by grounding in retrieved evidence |
| Cost/effort to set up | Lowest (use as-is) | Low (usually just an API call) | Higher (data curation, training runs) | Moderate (retrieval infrastructure) |
| Where covered on this platform | This page (background) | This page (background) | **Fine-Tuning** skill | Referenced here; retrieval architecture detail in related skills |

**How seniors choose**: default to an instruction-tuned/chat model accessed via prompting for most tasks (see **Prompt Engineering**); reach for fine-tuning only when prompting alone cannot reliably achieve the needed behavior, format, or domain specialization at acceptable cost (see **Fine-Tuning**'s decision criteria); reach for retrieval augmentation whenever the task depends on facts the model cannot be expected to have memorized correctly or currently (proprietary data, fast-changing facts) — and combine these techniques rather than treating them as mutually exclusive.
`,

  "related-technologies": `
- **Transformers** — the architecture every modern LLM is built from; read this first if you haven't.
- **Attention** — the mechanism inside the transformer that makes context length expensive and gives the model its ability to weigh relationships between tokens; read this before trusting any claim about context-window cost.
- **Embeddings** — how tokens and text become vectors; also the basis for retrieval systems used alongside LLMs.
- **Prompt Engineering** — getting reliable behavior from a fixed model via instruction design, examples, and sampling-parameter tuning.
- **Fine-Tuning** — deliberately changing model weights via instruction tuning, RLHF, or parameter-efficient methods.
- **Inference** — the mechanics of running a forward pass efficiently (KV-caching, quantization, batching).
- **Serving** — operating LLMs as production infrastructure (routing, autoscaling, multi-tenant serving).
- **Evaluation** — measuring output quality rigorously, including regression testing across prompt/model changes.
- **Hallucination** — the specific failure mode of confident-but-false output, and mitigation techniques.
- **Guardrails** — the safety/reliability layer wrapped around production model calls.
- **Cost Optimization** and **Latency** — the dedicated engineering-depth treatment of the cost/speed concerns this page introduces at every layer (tokenization, context, sampling, model choice).

On this platform, the natural path from here: **LLM Fundamentals** → **Prompt Engineering** (get reliable behavior without training anything) → **Fine-Tuning**, **Inference**, **Serving**, **Evaluation**, **Hallucination**, **Guardrails** in whatever order matches your immediate need.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check each provider's official documentation and model release notes for anything more current, since this is the fastest-moving category on the platform.

- Context windows have grown substantially across major model families in recent generations, but exact current maximums vary by provider and model tier and change frequently — verify the specific figure against the provider's current documentation rather than trusting a remembered number.
- Multimodal LLMs (accepting text plus images, and in some cases audio/video) have become standard offerings from major providers rather than a specialized capability, extending the same underlying tokenization/attention/sampling mechanics described on this page to non-text inputs.
- "Reasoning-oriented" models that spend additional inference-time computation (extended internal generation before producing a final answer) have emerged as a distinct model category from standard chat models, with different latency/cost tradeoffs than the single-pass generation described in this page's core mechanics.
- Open-weight model quality has continued to narrow the gap with the largest hosted models on many tasks, strengthening the case for self-hosted fine-tuning and serving covered in the **Fine-Tuning** and **Serving** skills.
- The debate over emergent capabilities and the precise shape of scaling laws remains active in the research literature — do not treat either topic as settled; check recent research-venue publications for the current state of the argument.

Given how quickly specific numbers (context-window sizes, pricing, benchmark scores) change, treat any number you read here or elsewhere as a snapshot to re-verify, not a permanent fact.
`,

  "future-roadmap": `
Where the LLM-fundamentals picture is heading, and what is worth betting career time on:

1. **Longer, cheaper context will keep expanding what "just put it in the prompt" can reasonably do**, but the quadratic attention cost is an architectural fact, not a temporary limitation — expect continued research into more efficient attention variants, and continued relevance of retrieval-augmented approaches even as raw context grows.
2. **The base-model/instruction-tuned/fine-tuned distinction will remain a core mental model** even as the specific training techniques (RLHF variants, other preference-optimization methods) continue to evolve — understanding the shape of the pipeline matters more than memorizing any one technique's name.
3. **Inference-time computation (models that "think longer" before answering) is a growing axis alongside pretraining scale**, meaning "bigger model" is no longer the only lever for better performance — cost/latency tradeoffs will increasingly be a choice between a bigger model, more inference-time computation, or better retrieval/tooling around a smaller model.
4. **The emergent-capabilities and scaling-laws debates will likely keep evolving** as evaluation methodology improves — betting on a specific resolution of either debate is riskier than betting on strong evaluation skills that let you assess any new model honestly for your own use case (see the **Evaluation** skill).
5. **The engineering layer around models (prompting, retrieval, guardrails, evaluation, serving) is where most career-relevant depth is growing fastest**, since a much larger population of engineers build on top of models than train them from scratch — the sibling skills on this platform are a direct reflection of where that engineering depth concentrates.

For your career: understanding these fundamentals deeply enough to reason about new models correctly — rather than memorizing today's specific numbers — is what stays valuable as the specific models change under you.
`,

  "cheat-sheet": `
~~~text
# --- Core definition ---
LLM = transformer decoder trained on next-token prediction over massive text.
Capability emerges from this objective at scale, not from hand-coded rules.

# --- Tokenization ---
Text -> subword tokens (BPE-style): common words = 1 token,
rare/unseen words split into pieces. ALWAYS measure with the real
tokenizer for your target model, never a word-count heuristic.

# --- Context window ---
Max tokens attended to jointly. Input + output share ONE budget.
Attention cost grows ~quadratically with sequence length ->
longer context = real latency/cost, not a free upgrade.

# --- Sampling ---
logits -> divide by temperature -> softmax -> probabilities -> sample
temperature -> 0   : sharper, near-deterministic
temperature > 1    : flatter, more varied/random
top-k    : keep only the k highest-probability tokens
top-p    : keep smallest top set whose cumulative prob >= p (adaptive)
Low temp + low/moderate top-p  -> consistency tasks (extraction, code)
Higher temp                    -> creative/brainstorming tasks

# --- Pipeline ---
Pretraining (next-token prediction, most compute, general capability)
  -> Instruction tuning (supervised examples of good responses)
  -> RLHF / preference optimization (align to human preference, safety)
Base model:   raw completion, no instruction-following tendency
Chat model:   instruction-tuned + RLHF'd -- follows directions

# --- Honest hedges (say these out loud in interviews) ---
Scaling laws: empirical trend, smooth improvement w/ scale -- NOT a
  universal law; don't cite specific numbers you haven't verified.
Emergent capabilities: DISPUTED -- may partly be an artifact of
  all-or-nothing evaluation metrics, not proven genuine discontinuity.

# --- Production musts ---
Pin model version. Set sampling params deliberately. Budget context
tokens explicitly. Guardrail both input and output. Validate output
before programmatic use. Log tokens/latency/cost per request.

# --- Sibling skills map ---
Prompt Engineering -> reliable behavior WITHOUT changing the model
Fine-Tuning        -> changing the model's weights
Inference          -> running a forward pass efficiently
Serving            -> operating models as production infrastructure
Evaluation         -> measuring output quality
Hallucination      -> confident-but-false output, mitigations
Guardrails         -> safety/reliability layer around the model
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is an LLM trained to predict? | The probability distribution over the next token, given preceding tokens |
| Why subword tokens instead of words or characters? | Balances vocabulary size vs. coverage; handles rare/unseen words by splitting into familiar pieces |
| What IS the context window, precisely? | The maximum number of tokens the model can attend to jointly in one forward pass |
| Why is longer context not free? | Self-attention cost scales roughly quadratically with sequence length |
| What does temperature do mechanically? | Divides logits before softmax -- lower sharpens toward top tokens, higher flattens the distribution |
| Top-k vs top-p? | Top-k keeps a fixed count of top tokens; top-p keeps the smallest set reaching cumulative probability p (adaptive) |
| Base model vs instruction-tuned model? | Base model continues text plausibly with no instruction-following tendency; instruction-tuned model is trained to follow directions and act as an assistant |
| Three phases of the training pipeline? | Pretraining -> instruction tuning (supervised fine-tuning) -> RLHF/preference optimization |
| Are scaling laws a guaranteed law of nature? | No -- an empirical trend observed in specific studies; treat with hedging, not certainty |
| Are emergent capabilities settled science? | No -- actively disputed; may be partly an artifact of all-or-nothing evaluation metrics |
| Why do LLMs hallucinate? | The training objective rewards plausible continuation, not verified truth; there's no built-in fact-checking mechanism |
| What is the KV cache for? | Avoids recomputing attention over the whole prefix at every new generated token, by caching earlier keys/values |
| Which skill covers reliable behavior without retraining? | Prompt Engineering |
| Which skill covers changing the model's weights? | Fine-Tuning |
| Which skill covers the safety/reliability wrapper around a model? | Guardrails |
`,

  mcqs: `
**1. What does an LLM directly compute at each generation step?**

A) The final answer text  B) A probability distribution over the next token  C) A database lookup of facts  D) A fixed grammar rule

**Answer: B** — everything else (answers, facts-sounding text) emerges from repeatedly sampling from this distribution.

**2. Why does doubling the context length increase compute cost more than proportionally?**

A) Tokenization becomes slower  B) Self-attention computes relationships between every pair of tokens, scaling roughly quadratically  C) The vocabulary size doubles  D) It doesn't -- cost is linear

**Answer: B** — see the Attention skill for the derivation; this is the mechanical reason long-context requests cost more and run slower.

**3. Setting temperature very close to 0 makes generation...**

A) More random and varied  B) Nearly deterministic, favoring the highest-probability token  C) Faster to compute per token  D) Guaranteed factually correct

**Answer: B** — note D is a common misconception: determinism is not the same as correctness.

**4. A model that continues "Write me a poem about the ocean" with more homework-style prompts instead of a poem is most likely...**

A) Broken  B) A base (non-instruction-tuned) model behaving as expected  C) Running at too high a temperature  D) Missing a guardrail

**Answer: B** — base models have no learned tendency to treat input as an instruction to obey; this is exactly why instruction tuning/RLHF exists.

**5. Which statement about "emergent capabilities" is most defensible?**

A) They are proven, universal, and well-understood  B) They are a disputed claim -- some evidence suggests they're partly an artifact of evaluation-metric choice  C) They only ever appear in the largest possible models  D) They have been fully disproven

**Answer: B** — the honest, literature-consistent position is that this is disputed, not settled in either direction.

**6. Why is retrieval-augmented generation often preferable to "just put the whole document in the prompt"?**

A) It's always more accurate regardless of cost  B) It reduces tokens sent/processed, which reduces the real quadratic attention cost and overall cost/latency  C) LLMs cannot process long documents at all  D) It removes the need for guardrails

**Answer: B** — RAG is fundamentally a cost/latency/context-budget engineering decision, not a magic accuracy fix on its own.
`,

  "revision-notes": `
**What an LLM is, in five lines:** A transformer decoder trained on one objective -- predict the next token given prior tokens -- over massive text. Broad capability (writing, coding, conversation) emerges from this simple objective applied at scale, not from explicit task-specific programming. There is no built-in fact-checker; the model optimizes plausibility relative to its training distribution, which is the root cause of hallucination.

**Tokenization and context, in four lines:** Models operate on subword tokens (BPE-style), not characters or whole words, because that balances vocabulary size against coverage of rare/unseen text. The context window is the hard maximum number of tokens attended to jointly; input and output share this one budget. Longer context is not free -- self-attention cost scales roughly quadratically with sequence length, making long-context requests measurably slower and pricier.

**Sampling, in three lines:** Logits are divided by temperature, then passed through softmax to get probabilities; lower temperature sharpens toward the most likely tokens, higher temperature flattens the distribution toward more variety. Top-k keeps a fixed count of top tokens; top-p (nucleus) adaptively keeps the smallest top set whose cumulative probability reaches a threshold -- generally preferred for adapting to the model's per-step confidence.

**The training pipeline and honest hedges, in four lines:** Pretraining (bulk of compute, general capability) is followed by instruction tuning and RLHF/preference optimization, which is what turns a raw text predictor into an assistant that follows instructions -- this is why base models and chat models of similar scale behave so differently. Scaling laws describe an empirical, hedged trend of smooth improvement with scale, not a guaranteed law; emergent capabilities are a genuinely disputed research topic, partly attributable to evaluation-metric artifacts, and should never be stated as settled fact.

**Production and the sibling-skill map, in four lines:** Cost and latency begin at the tokenizer and the context-window budget, not at model choice alone -- pin model versions, set sampling parameters deliberately, and budget context explicitly. Prompt Engineering gets reliable behavior without retraining; Fine-Tuning changes the model; Inference and Serving run it efficiently in production; Evaluation measures quality; Hallucination and Guardrails cover safety and reliability -- this page is the map that connects all of them.
`,

  "learning-roadmap": `
A realistic path through LLM fundamentals and into the sibling skills (adjust pace to your background):

**Week 1 — Prerequisites check.** If you have not already, work through **Transformers**, **Attention**, and **Embeddings** first -- this page assumes them. Milestone: you can explain self-attention well enough to explain why context length is expensive.

**Week 2 — Tokenization and context.** Beginner and Intermediate Concepts sections here; run Lab 1 (tokenizer explorer) and Lab 3 (context-budget tracker). Milestone: you can predict, roughly, how many tokens a piece of text will cost before running it through a real tokenizer.

**Week 3 — Sampling and the training pipeline.** Work through the sampling-parameter material and the pretraining-to-alignment pipeline; run Lab 2 (sampling explorer). Milestone: you can predict how a prompt's output will change across temperature/top-p settings before running it.

**Week 4 — Honest hedging on scaling and emergence.** Read Advanced Concepts closely; practice stating the scaling-laws and emergent-capabilities positions with correct hedging out loud, as if in an interview. Milestone: you can defend "this is disputed" without sounding evasive.

**Week 5 — Production discipline.** Production Usage through Production Checklist sections; run Lab 4 (end-to-end guarded feature). Milestone: a small deployed service with pinned model version, explicit sampling parameters, and basic monitoring.

**Week 6 onward — Branch into the sibling skills based on your immediate need**: go to **Prompt Engineering** next if your priority is getting reliable behavior out of an existing model; go to **Fine-Tuning** if you need to change model behavior beyond what prompting can achieve; go to **Evaluation** if your priority is measuring quality rigorously before either of those. Most engineers should read **Prompt Engineering** immediately after this page, since it is the highest-leverage next skill for almost any LLM application task.
`,

  "official-docs": `
- Provider API documentation (OpenAI, Anthropic, and other model providers) — the ground truth for current context-window sizes, sampling-parameter names/ranges, and pricing; these change frequently, so always check the live docs rather than relying on a remembered number.
- Tokenizer library documentation (e.g. tiktoken for OpenAI-family models, or the tokenizer shipped with an open-weight model) — the authoritative source for exact token counts for your specific target model.
- Model cards / model release notes published alongside major model releases — typically describe training data characteristics, intended use, and known limitations, and are the most reliable first source for "what changed in this version."
- Hugging Face's model and tokenizer documentation — a widely used reference for open-weight model tokenizers and configuration if you self-host or fine-tune.
`,

  books: `
- **Speech and Language Processing** — Jurafsky & Martin (freely available draft chapters online). The standard NLP textbook; strong foundational chapters on language modeling and tokenization concepts, updated over time to reflect neural and transformer-era methods.
- **Deep Learning** — Goodfellow, Bengio, and Courville. Not LLM-specific, but essential background on the neural-network and optimization concepts LLMs are built from.
- **The Illustrated Transformer**-style visual explainers (widely referenced, various formats) — while not a traditional book, treat any well-regarded, carefully illustrated walkthrough of the transformer architecture as required reading before this page's material, since this page assumes that mechanical understanding.
- **Designing Machine Learning Systems** — Chip Huyen. Strong production-systems framing that generalizes well to the "how do real teams operate this in production" concerns raised throughout this page.

Given how fast LLM-specific research and practice move, prioritize the **Research Papers** and **Blogs** sections below, and provider documentation, over any book for the most current specifics — books are best here for durable conceptual foundations (language modeling, neural network basics), not current model behavior.
`,

  blogs: `
- **Provider engineering/research blogs** (OpenAI, Anthropic, Google DeepMind, Meta AI) — the highest-signal source for how the organizations building frontier models describe their own training pipelines, safety work, and capability changes.
- **Hugging Face blog** — consistently strong, practitioner-oriented explainers on tokenization, model architectures, and open-weight model releases.
- **Sebastian Raschka's blog/newsletter** — clear, technically careful explanations of LLM training and fine-tuning concepts, well-suited to the fundamentals level of this page.
- **Lilian Weng's blog (while at OpenAI)** — deeply researched, well-cited long-form explainers on topics including hallucination, alignment, and prompting that are excellent bridges into this platform's sibling skills.
- **The Gradient** and similar research-adjacent publications — good for tracking the ongoing scaling-laws and emergent-capabilities debates with appropriate nuance.
`,

  "research-papers": `
LLM fundamentals is a genuinely research-heavy topic; here are foundational and directly relevant papers, with honest framing of which claims are settled vs. actively debated:

- **"Attention Is All You Need"** (Vaswani et al., 2017) — the paper introducing the transformer architecture; foundational reading, referenced in depth by the **Transformers** and **Attention** skills.
- **GPT-3 paper, "Language Models are Few-Shot Learners"** (Brown et al., 2020) — demonstrates large-scale next-token pretraining producing broad few-shot-style task performance without task-specific fine-tuning; central to the "capability emerges from scale" narrative.
- **Scaling-laws research** (e.g. Kaplan et al., 2020, and later Chinchilla-style work, Hoffmann et al., 2022, on compute-optimal training) — the empirical basis for this page's scaling-laws discussion; read these directly rather than relying on secondhand summaries of specific numbers, and note that later work revised earlier scaling-law conclusions, illustrating that this is an evolving empirical area, not a fixed law.
- **InstructGPT paper, "Training language models to follow instructions with human feedback"** (Ouyang et al., 2022) — the canonical description of the instruction-tuning-plus-RLHF pipeline referenced throughout this page; foundational reading for the **Fine-Tuning** skill.
- **On emergent capabilities**: the literature here is explicitly split — read both a paper arguing for genuine emergent capabilities at scale and a paper arguing that apparent emergence is substantially explained by evaluation-metric choice (all-or-nothing scoring), and form your own view rather than taking either side as settled. Searching current venues (NeurIPS, ICML, ACL) for "emergent abilities language models" will surface both sides of this active debate.

This area moves fast enough that the most current, most rigorously cited papers are best found via a live search of recent proceedings rather than a fixed list — treat the papers above as the durable foundational layer, not the current frontier.
`,

  videos: `
- Any well-regarded, carefully produced visual walkthrough of the transformer architecture and attention mechanism — watch this before this page's material if you have not already internalized the mechanical picture from the **Transformers** and **Attention** skills.
- Conference talks from major model providers' research teams (OpenAI, Anthropic, Google DeepMind) on model training, alignment, and evaluation — high-signal for understanding the pretraining-to-alignment pipeline from the people who build it.
- University-level deep learning / NLP course lecture recordings (e.g. Stanford's NLP-with-deep-learning-style course lecture series) covering language modeling and transformers — strong for building the rigorous conceptual foundation this page assumes.
- Recorded talks specifically on scaling laws and/or emergent capabilities from recent ML conferences — search for the most recent editions, since this is one of the fastest-evolving debates covered on this page.
`,

  "github-repos": `
- Hugging Face **transformers** library — reference implementations of transformer architectures and tokenizers; excellent for seeing tokenization and generation code in practice.
- OpenAI's **tiktoken** — a fast, widely used tokenizer implementation; useful directly for the token-counting exercises in this page's labs.
- **SentencePiece** — a widely used subword tokenizer implementation (an alternative/complement to BPE-style approaches), useful for seeing a different tokenizer design.
- Open-weight model repositories (e.g. Meta's Llama family repositories) — useful for seeing real model configuration, tokenizer files, and inference code end to end.
- **llama.cpp** and similar lightweight inference projects — excellent for seeing the generation loop (tokenize, forward pass, sample, detokenize) implemented concretely and efficiently, bridging directly into the **Inference** skill.
- Evaluation-harness repositories (e.g. widely used LM evaluation harnesses) — useful for seeing how scaling-law and capability claims are actually measured in practice, informing a more rigorous view of the emergent-capabilities debate.
- Guardrails/safety-tooling repositories — useful for seeing concrete input/output filtering implementations referenced in the **Guardrails** skill.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Tokenization fluency*: for a set of 10 varied sentences (English, another language, code, and heavily punctuated text), predict the token count before encoding, then check with a real tokenizer and analyze where your intuition was most wrong.
2. *Context-budget math*: given a model's context window, a system prompt token count, and a growing conversation, compute exactly how many turns of history fit before truncation is required, and implement at least one trimming strategy.
3. *Sampling intuition*: given a small set of logits, hand-compute (or code) the resulting probability distribution at three different temperatures, and separately hand-apply top-k and top-p filtering; verify your hand computation against code.
4. *Base vs instruction-tuned prediction*: given a set of prompts, predict in writing how a base model vs. an instruction-tuned model would likely respond differently, then verify against real model behavior if you have API access to both a base and chat variant.
5. *Hedged claim-writing*: write a two-paragraph explanation of scaling laws and a two-paragraph explanation of emergent capabilities, each including at least one explicit hedge about what is and is not settled — then have a peer critique whether your hedges are appropriately calibrated.
6. *End-to-end tracing*: given a prompt, manually trace (on paper or in a short write-up) every step from raw text to final output text, labeling where tokenization, embedding, attention, logits, and sampling each occur.

External sets: provider API documentation exercises (build small scripts against a real API varying sampling parameters), Hugging Face's course materials on tokenizers and transformers, and any current LM evaluation harness's test suites as a way to see capability measurement in practice.
`,

  "architecture-diagram": `
The reference architecture for a production LLM-backed feature — the shape the sibling skills each go deep on one part of:

~~~mermaid
flowchart TB
    Client["Client application"] --> App["Application layer\n(prompt construction, history management)"]
    App --> InGuard["Input guardrails\n(trust separation, filtering)"]
    InGuard --> Budget["Context-window budget check\n(token counting, trimming/summarization)"]
    Budget --> Router["Model router / gateway\n(model choice, retries, fallback, version pinning)"]
    Router --> Model["LLM (tokenize -> transform -> sample -> detokenize)"]
    Model --> OutGuard["Output guardrails\n(structure validation, policy checks)"]
    OutGuard --> Eval["Evaluation / logging hooks"]
    Eval --> App
    App --> Client
    subgraph Support["Supporting systems"]
        Cache[("Prompt/response cache")]
        Retrieval[("Retrieval / vector store")]
        Monitor["Token, latency, and cost monitoring"]
    end
    App --> Support
    Router --> Support
~~~

Every labeled box in this diagram corresponds to a sibling skill on this platform: Router/version-pinning and fallback -> **Serving**; the tokenize-transform-sample-detokenize core -> **Inference** (and the **Transformers**/**Attention**/**Embeddings** prerequisites); In/Out guardrails -> **Guardrails**; Evaluation/logging -> **Evaluation**; retrieval -> grounding against **Hallucination**; and prompt construction itself -> **Prompt Engineering**.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LLM Fundamentals))
    What it is
      Next-token prediction objective
      Transformer decoder architecture
      Capability emerges from scale
    Tokenization
      Subword tokens / BPE
      Vocabulary tradeoffs
      Cost and language sensitivity
    Context window
      Max tokens attended jointly
      Shared input/output budget
      Quadratic attention cost
    Sampling
      Temperature
      Top-k
      Top-p / nucleus
    Training pipeline
      Pretraining
      Instruction tuning
      RLHF / preference optimization
      Base model vs chat model
    Disputed research topics
      Scaling laws (hedged trend)
      Emergent capabilities (disputed)
    Engineering concerns
      Cost from token one
      Latency from context and generation length
    Sibling LLM skills
      Prompt Engineering
        Reliable behavior, no retraining
      Fine-Tuning
        Changing the model
      Inference
        Running it efficiently
      Serving
        Production infrastructure
      Evaluation
        Measuring quality
      Hallucination
        Confident false output
      Guardrails
        Safety and reliability layer
    Prerequisite skills
      Transformers
      Attention
      Embeddings
~~~
`,
};

export default llmFundamentals;
