import type { SkillContent } from "../types";

const llmFundamentals: SkillContent = {
  overview: `
LLM Fundamentals covers the core concepts underlying how large language models actually work in practice: tokenization (how raw text is converted into the discrete units a model operates on), context windows (how much text a model can process at once), sampling (how a model turns a probability distribution over next tokens into actual generated text), and scaling laws (the empirical relationships describing how model performance improves with size, data, and compute). This skill is the direct, practical bridge from the "Machine Learning & Deep Learning" category's architectural foundations — especially **Transformers**, **Attention**, and **Embeddings** — to the concrete, everyday realities of building applications on top of large language models like GPT, Claude, and Llama.

Where the previous category covered WHY and HOW the Transformer architecture works, this skill covers what an AI engineer needs to know to actually USE a large language model effectively and correctly — understanding that a model's "context window" is measured in tokens (not words or characters), that sampling parameters like temperature directly control the randomness/creativity of generated output, and that scaling laws explain why bigger models trained on more data reliably (if expensively) produce better results. This is genuinely foundational knowledge for every subsequent skill in this category and the platform's later AI Agents and Production AI categories.

Key characteristics: **tokenization**, the process of converting raw text into the discrete integer IDs a model's embedding layer (covered in the **Embeddings** skill) actually operates on; **context window**, the maximum number of tokens a model can process in a single forward pass, directly connecting to the **Transformers** skill's own treatment of quadratic attention cost; **sampling strategies** (temperature, top-k, top-p/nucleus sampling), the specific techniques controlling how a model's predicted probability distribution over the next token is converted into actual, generated text; and **scaling laws**, the empirically-observed, remarkably predictable relationships between model size, training data, compute, and resulting performance.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2018 | **GPT** (OpenAI) demonstrates that a decoder-only Transformer (covered in the **Transformers** skill) trained via simple next-token prediction on raw text can be effectively fine-tuned for many downstream NLP tasks |
| 2019 | **GPT-2** demonstrates that scaling up model size alone, with no fundamental architectural change, produces meaningfully improved, more coherent text generation, an early hint of the scaling-laws phenomenon |
| 2020 | **Kaplan et al.**'s "Scaling Laws for Neural Language Models" formalizes the empirical relationship between model size, dataset size, compute, and loss, providing a genuinely predictive framework for how much better a larger model trained on more data will actually perform |
| 2020 | **GPT-3** (175 billion parameters) demonstrates striking few-shot learning capabilities directly from a prompt, with no fine-tuning at all, providing dramatic real-world validation of the scaling-laws framework |
| 2022 | **Byte Pair Encoding (BPE)** and similar subword tokenization schemes become the near-universal standard tokenization approach across virtually all major LLMs, directly addressing earlier word-level and character-level tokenization's respective limitations |
| 2022 | **Hoffmann et al.**'s "Chinchilla" paper refines the original scaling laws, demonstrating that many earlier large models were significantly UNDER-trained relative to their size, and that a more balanced model-size-to-training-data ratio produces better performance for a given compute budget |
| 2022–2023 | **ChatGPT**'s release brings context windows, tokenization, and sampling parameters (temperature, and similar) into mainstream developer and even general-public awareness, as millions of people begin directly interacting with and configuring LLM behavior |
| 2023–2025 | **Context window sizes** expand dramatically across the industry (from roughly 2,000-4,000 tokens in early models to 100,000+ and even 1,000,000+ tokens in some modern models), directly reshaping what applications are practically feasible |

LLM Fundamentals' history traces the field's maturation from GPT's initial 2018 demonstration through the empirically rigorous scaling-laws research that transformed "bigger is generally better" from an intuition into a genuinely predictive, quantitative science — directly explaining why the industry's subsequent investment poured so heavily and confidently into training ever-larger models.
`,

  "why-it-exists": `
LLM Fundamentals exists as a distinct body of practical knowledge because building applications ON TOP OF a large language model requires understanding several concrete, practical realities that are genuinely distinct from understanding the underlying Transformer architecture (covered in the previous category) — an AI engineer doesn't typically need to implement backpropagation through a Transformer's attention layers to use GPT or Claude effectively, but they absolutely do need to understand that API pricing and context limits are measured in TOKENS (not characters or words), that a model's actual output is sampled probabilistically (not deterministically retrieved), and that model capability scales in specific, quantifiable ways with size and training data.

This practical, applied knowledge exists specifically because these concrete details directly, tangibly affect how one builds real applications: getting tokenization wrong leads to unexpected API costs or truncated inputs; misunderstanding sampling parameters leads to outputs that are either overly repetitive/predictable or incoherently random; and not understanding scaling laws leads to poor intuitions about what a larger or smaller model can realistically be expected to do. This skill exists to give AI engineers this concrete, practical vocabulary and understanding, directly bridging the architectural theory covered in the previous category to the hands-on, everyday work of building genuinely useful LLM-powered applications.
`,

  "problem-it-solves": `
LLM Fundamentals solves the **"what concrete, practical knowledge does an engineer need to effectively and correctly build applications using large language models"** problem.

Concretely, it provides:

- **Tokenization understanding**: knowing that text is broken into subword tokens (not characters or whole words) directly explains API costs, context limits, and certain surprising model behaviors (like difficulty with character-level tasks such as counting letters in a word).
- **Context window awareness**: understanding a model's maximum processable token count directly shapes what applications are practically feasible (a document far exceeding the context window simply cannot be processed in one pass) and directly connects to the **Transformers** skill's own quadratic attention cost concerns.
- **Sampling strategy control**: understanding temperature, top-k, and top-p sampling gives an engineer precise, practical control over the tradeoff between deterministic, focused output and creative, diverse output for a given application's actual needs.
- **Scaling laws as a predictive framework**: understanding the empirical relationship between model size, data, and compute lets an engineer reason sensibly about what performance improvement to expect from a larger model, informing genuinely important build-versus-buy and model-selection decisions.

What LLM Fundamentals does **not** solve, or solves only partially: understanding these fundamentals doesn't by itself guarantee reliable, correct model outputs — this is precisely why subsequent skills in this category (**Prompt Engineering**, **Evaluation**, **Hallucination**, **Guardrails**) exist to address the genuine, remaining challenges of building trustworthy applications on top of a fundamentally probabilistic text-generation system; and scaling laws describe empirical TRENDS, not guarantees for any specific model or task — a specific application's actual quality still requires genuine, task-specific evaluation, not just an assumption based on model size alone.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain tokenization and why LLMs operate on subword tokens rather than characters or whole words.
2. Explain context window size and its practical implications for application design.
3. Explain temperature, top-k, and top-p sampling, and how each affects generated output.
4. Explain scaling laws and the relationship between model size, data, compute, and performance.
5. Explain the Chinchilla finding and its practical implication for balancing model size against training data.
6. Recognize LLM Fundamentals anti-patterns: ignoring token limits, misconfiguring sampling parameters, assuming larger models are always the right choice.
7. Answer senior-level interview questions on tokenization edge cases and sampling parameter selection.
`,

  prerequisites: `
- **Required**: the **Transformers**, **Attention**, and **Embeddings** skills — this page's practical concepts directly build on and apply that architectural foundation.
- **Very helpful**: the **Deep Learning** skill's own treatment of training dynamics, directly relevant to understanding scaling laws.

Dependency chain: **Transformers**/**Attention**/**Embeddings** (previous category) → this page (LLM Fundamentals) → **Prompt Engineering** → **Fine-Tuning** → the remaining skills in this category.
`,

  "beginner-concepts": `
### Tokenization: breaking text into the units a model actually processes

~~~
"unbelievable" might be tokenized as: ["un", "believ", "able"]
"hello" might be tokenized as: ["hello"] (a single, common token)

Modern LLMs use SUBWORD tokenization (commonly Byte Pair
Encoding, or BPE) -- common whole words get their own single
token, while rarer or longer words are broken into smaller,
more common subword pieces.
~~~

### A simple tokenization example

~~~python
from tiktoken import encoding_for_model

encoding = encoding_for_model("gpt-4")
tokens = encoding.encode("Hello, world!")
print(len(tokens))  # e.g., 4 tokens, NOT 13 characters or 2 words
~~~

This is precisely why API pricing and context limits are measured in TOKENS, not characters or words — a given piece of text's actual token count depends on the specific tokenizer and can be genuinely surprising (especially for non-English text, code, or unusual formatting).

### Context window: how much text a model can process at once

~~~
A model with a "128K context window" can process up to
128,000 TOKENS (not characters or words) in a single request
-- including BOTH the input prompt AND the generated output,
combined.
~~~

### Sampling: how a model turns probabilities into actual text

~~~
At each generation step, a language model produces a
PROBABILITY DISTRIBUTION over its entire vocabulary for the
NEXT token (directly connecting to the Neural Networks
skill's own treatment of softmax). SAMPLING is the process
of actually choosing one specific token from this
distribution -- rather than always picking the single most
likely token (which would produce repetitive, deterministic
output), sampling introduces controlled randomness.
~~~
`,

  "intermediate-concepts": `
### Temperature: controlling randomness

~~~
temperature = 0:    always pick the single most likely token
                     (fully deterministic, most "focused" output)
temperature = 1:    sample directly from the model's own
                     predicted probability distribution
temperature > 1:    flatten the distribution, making LESS
                     likely tokens relatively more probable
                     (more "creative"/random, but riskier output)

Mathematically: temperature divides the logits before the
final softmax -- higher temperature flattens the resulting
probability distribution.
~~~

### Top-k and top-p (nucleus) sampling

~~~
Top-k sampling: only consider the K most likely next tokens,
    redistributing probability mass among just these K options
    before sampling -- directly limits how "unlikely" a chosen
    token can be, regardless of the full distribution's shape.
Top-p (nucleus) sampling: consider the SMALLEST set of tokens
    whose CUMULATIVE probability exceeds a threshold p (e.g.,
    0.9) -- adaptively includes more or fewer candidate tokens
    depending on how "confident" the model's distribution
    currently is (a very peaked distribution includes few
    tokens; a very flat distribution includes many).
~~~

Top-p is generally considered more adaptive than top-k, since it automatically adjusts the candidate pool size based on the model's actual confidence at each specific generation step, rather than using a fixed count regardless of context.

### Scaling laws: the empirical relationship between size, data, and performance

~~~
Kaplan et al. (2020) found that model LOSS (a direct measure
of how well the model predicts held-out text) decreases
PREDICTABLY as a power-law function of model size, dataset
size, and compute -- meaning you can genuinely forecast how
much a larger model (or more training data/compute) will
improve performance, well before actually training it.
~~~

### The Chinchilla finding: balancing model size against training data

~~~
Hoffmann et al. (2022) found that many earlier large language
models (including the original GPT-3) were significantly
UNDER-TRAINED relative to their parameter count -- for a
GIVEN compute budget, a SMALLER model trained on
PROPORTIONALLY MORE data often outperforms a larger model
trained on less data, directly reshaping subsequent industry
practice toward more balanced model-size-to-data ratios.
~~~
`,

  "advanced-concepts": `
### Byte Pair Encoding (BPE): how modern tokenizers are actually built

~~~
BPE starts with individual CHARACTERS as the base vocabulary,
then iteratively merges the MOST FREQUENTLY co-occurring
adjacent pair of tokens into a new, single token -- repeating
this process many times builds up a vocabulary containing
common whole words, common subword pieces, and individual
characters as a fallback for genuinely rare sequences,
ensuring EVERY possible input string can always be tokenized
(even entirely novel words), unlike a purely word-level
vocabulary which would need an "unknown word" fallback token.
~~~

### Why tokenization causes certain surprising model behaviors

~~~
Because a model operates on TOKENS (which don't correspond
1:1 with characters), tasks requiring genuine character-level
reasoning (e.g., "how many letters are in this word,"
"reverse this string") can be genuinely difficult for an LLM
-- the model never actually "sees" individual characters
directly in most cases, only the tokens those characters
happen to be grouped into, which don't align cleanly with
character-level boundaries or counts.
~~~

### The relationship between context window size and quadratic attention cost

~~~
As covered in the Transformers skill, standard self-attention's
computational cost grows QUADRATICALLY with sequence length --
directly explaining why context window sizes, while growing
rapidly over time, still face genuine practical and cost
constraints, and why efficient attention variants (also
covered in the Attention skill) are actively, continuously
researched specifically to make larger context windows more
practically/economically feasible.
~~~

### Repetition penalties and other generation-quality controls

~~~
Beyond temperature/top-k/top-p, production LLM APIs commonly
expose additional generation parameters:
Frequency penalty: reduces the probability of tokens
    proportionally to how often they've ALREADY appeared in
    the generated output so far, directly discouraging repetition.
Presence penalty: reduces the probability of ANY token that
    has appeared at all (regardless of how often), encouraging
    genuinely new topics/vocabulary rather than just avoiding
    literal repetition.
~~~

### Scaling laws' practical limits: emergent capabilities and diminishing returns

~~~
While scaling laws predict smooth, continuous improvement in
LOSS (a specific technical metric), certain DOWNSTREAM
capabilities have been observed to emerge somewhat suddenly
at particular scale thresholds (a genuinely debated
phenomenon in the research community, with some researchers
arguing these "emergent abilities" are partly an artifact of
how a specific capability is MEASURED, rather than a genuine
discontinuity in the underlying model). Additionally, scaling
laws don't guarantee indefinite improvement -- practical
constraints (available high-quality training data, genuine
compute cost) impose real, eventually binding ceilings.
~~~
`,

  "internal-working": `
Tracing the full generation process for a single new token, from the model's raw output through sampling to the final chosen token:

~~~mermaid
sequenceDiagram
    participant Model as Language Model
    participant Logits as Raw Logits\n(one per vocabulary token)
    participant TempScale as Temperature Scaling
    participant Softmax as Softmax
    participant Filter as Top-k / Top-p Filtering
    participant Sample as Sampling

    Model->>Logits: forward pass produces\none raw score per\nvocabulary token
    Logits->>TempScale: divide logits by\ntemperature value
    TempScale->>Softmax: scaled logits
    Softmax->>Softmax: convert to a valid\nprobability distribution\n(directly reusing the Neural\nNetworks skill's softmax treatment)
    Softmax->>Filter: full probability\ndistribution
    Filter->>Filter: restrict to top-k tokens,\nor smallest set exceeding\ncumulative probability p
    Filter->>Sample: filtered, renormalized\ndistribution
    Sample->>Sample: randomly sample ONE\ntoken according to\nthese final probabilities
~~~

1. **The model's forward pass produces raw logits** (one score per possible vocabulary token, directly connecting to the **Transformers** skill's own data-flow treatment).
2. **Temperature scaling divides these logits** before the softmax step, directly controlling how "peaked" or "flat" the resulting probability distribution will be.
3. **Softmax converts the scaled logits into a valid probability distribution** (values between 0 and 1, summing to 1).
4. **Top-k or top-p filtering restricts the candidate pool** to a limited set of the most likely tokens, discarding the long tail of genuinely unlikely options.
5. **A single token is randomly sampled** according to this final, filtered probability distribution, becoming the next generated token.

**Why this matters**: this concrete trace shows exactly how the several distinct generation-control parameters (temperature, top-k, top-p) compose together in a specific, deliberate ORDER to produce the model's final, actual output — understanding this exact sequence is essential for correctly reasoning about how adjusting any one parameter will affect generated text.
`,

  architecture: `
A senior AI engineer thinks about LLM Fundamentals in terms of choosing appropriate sampling parameters for a given application's actual needs, understanding context window constraints when designing a system, and using scaling-law intuition to make sensible model-selection decisions.

### Choosing sampling parameters for a given application

~~~mermaid
flowchart TB
    Application["An LLM-powered\napplication"] --> Q1{"Does the task need\nconsistent, deterministic,\nfactually-precise output\n(e.g., code generation,\ndata extraction)?"}
    Q1 -->|Yes| LowTemp["Low temperature\n(e.g., 0 to 0.3)"]
    Q1 -->|"No -- creative writing,\nbrainstorming, varied\nresponses genuinely desired"| HigherTemp["Higher temperature\n(e.g., 0.7 to 1.0),\noften combined with\ntop-p sampling"]
~~~

### Designing around context window constraints

A senior engineer explicitly accounts for context window limits when designing a system — recognizing that a document exceeding the window must be chunked (directly connecting to the platform's later **RAG** skill) or summarized, and that both the INPUT prompt and the OUTPUT generation together count against the same total token budget.

### Using scaling-law intuition for model selection

~~~mermaid
flowchart LR
    Task["A specific task"] --> Q{"Does the task genuinely\nrequire maximum available\ncapability, or would a\nsmaller, faster, cheaper\nmodel likely suffice?"}
    Q -->|"Maximum capability\ngenuinely needed"| LargerModel["Choose a larger,\nmore capable model"]
    Q -->|"Smaller model likely\nsufficient for this\nspecific, bounded task"| SmallerModel["Choose a smaller,\nfaster, cheaper model\n(directly connecting to\nthe platform's later\nModel Routing skill)"]
`,

  "data-flow": `
Tracing a complete request through an LLM API call, from raw text input to final generated text output, illustrating where tokenization and sampling each occur:

~~~mermaid
sequenceDiagram
    participant User as User Input Text
    participant Tokenizer as Tokenizer
    participant Model as Language Model
    participant Sampling as Sampling\n(temperature/top-p)
    participant Detokenizer as Detokenizer
    participant Output as Final Output Text

    User->>Tokenizer: raw text prompt
    Tokenizer->>Model: token IDs\n(counted against\ncontext window)
    loop For each new token generated
        Model->>Sampling: probability distribution\nover next token
        Sampling->>Model: sampled token ID\n(fed back in for\nthe NEXT step)
    end
    Model->>Detokenizer: full sequence of\ngenerated token IDs
    Detokenizer->>Output: final, human-readable\ngenerated text
~~~

The critical detail: tokenization happens ONCE at the very start (converting the input prompt into token IDs), while sampling happens REPEATEDLY, once for EVERY new token generated — this is precisely why LLM generation is inherently a step-by-step, autoregressive process (directly connecting to the **Transformers** skill's own treatment of decoder-only, causal generation), with each new token depending on all previously generated tokens.
`,

  "production-usage": `
### A representative LLM API call with explicit sampling parameters

~~~python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Summarize this document."}],
    temperature=0.3,       # low temperature for consistent summarization
    top_p=0.9,
    max_tokens=500,        # limits OUTPUT length, counted against context window
    frequency_penalty=0.2,  # mild discouragement of repetition
)
~~~

### Non-negotiables for production LLM usage

1. **Always account for tokenization when estimating cost and context usage**, never assuming a simple character or word count.
2. **Choose sampling parameters deliberately, matched to the task**, low temperature for deterministic/factual tasks, higher temperature for creative tasks.
3. **Explicitly manage context window budget**, accounting for both input prompt and expected output length together.
4. **Don't assume a larger model is always the right choice**, evaluating whether a smaller, faster, cheaper model genuinely suffices for the specific task.
5. **Test tokenization behavior for your specific application's actual input characteristics** (code, non-English text, structured data), since token counts can vary significantly and surprisingly by content type.

### Common production patterns

- **Low or zero temperature for deterministic tasks** (data extraction, code generation, factual Q&A).
- **Moderate-to-high temperature combined with top-p sampling** for creative writing, brainstorming, and varied-response applications.
- **Explicit token counting and budget management** before sending requests, avoiding unexpected truncation or cost overruns.
- **Model routing/tiering** (directly connecting to the platform's later **Model Routing** skill), using smaller models for simpler tasks and larger models only when genuinely needed.
`,

  "industry-examples": `
- **OpenAI's tiktoken library**: the widely-used, canonical tokenizer implementation for GPT-family models, directly used across countless production applications for accurate token counting.
- **Kaplan et al.'s and Hoffmann et al.'s scaling laws research**: directly informed the industry's subsequent training strategy for models like GPT-4, Claude, and Llama, shifting toward more balanced model-size-to-data ratios following the Chinchilla findings.
- **Anthropic's and OpenAI's exposed sampling parameters**: temperature, top-p, and similar parameters are standard, widely-documented options across essentially every major LLM API.
- **Long-context models** (Claude, Gemini, and others supporting context windows of 100K+ to 1M+ tokens): directly demonstrate the industry's continued investment in extending practical context window sizes.
`,

  "best-practices": `
1. **Always account for tokenization when estimating cost and context usage**, testing actual token counts for your specific content type.
2. **Choose sampling parameters deliberately**, matched to whether the task needs deterministic precision or creative variation.
3. **Explicitly manage context window budget**, accounting for both input and expected output length.
4. **Evaluate whether a smaller model genuinely suffices** before defaulting to the largest available model.
5. **Understand and apply frequency/presence penalties** where repetition is a genuine, observed problem for a specific application.
6. **Use scaling-law intuition to set realistic expectations** for what performance improvement a larger model or more training data would actually provide.
7. **Test tokenization behavior for non-English text, code, and structured data specifically**, since token counts can vary significantly and surprisingly from simple English prose.
`,

  "anti-patterns": `
### Estimating cost/context usage by character or word count instead of actual tokens

~~~python
# WRONG — assuming a rough character-count-based estimate
# of context usage, risking unexpected truncation or cost overruns
estimated_tokens = len(text) / 4  # a rough, potentially misleading heuristic

# RIGHT — use the actual tokenizer for the specific model
actual_tokens = len(encoding_for_model("gpt-4").encode(text))
~~~

### Using a high temperature for a task requiring deterministic, factual precision

~~~
# WRONG — using temperature=1.0 (or higher) for a data
# extraction or code generation task, risking inconsistent,
# unpredictable, or factually incorrect output
# RIGHT — use a low temperature (0 to 0.3) for tasks genuinely
# requiring consistent, deterministic, precise output
~~~

### Defaulting to the largest available model regardless of task complexity

~~~
# WRONG — using the most expensive, largest available model
# for every single request, regardless of whether the specific
# task is genuinely complex enough to require it
# RIGHT — evaluate whether a smaller, faster, cheaper model
# genuinely suffices for a given task, reserving the largest
# model for genuinely demanding cases (directly connecting to
# the platform's later Model Routing skill)
~~~

### Other production-grade anti-patterns

- **Not testing tokenization behavior for non-English or structured content**, being surprised by unexpectedly high token counts.
- **Ignoring that both input prompt and output generation count against the same context window budget.**
- **Assuming scaling laws guarantee any specific task's quality**, without genuine, task-specific evaluation.
`,

  performance: `
### Rule zero: token count directly drives both cost and context window usage — measure it accurately, don't estimate it roughly

Since API pricing and context limits are both measured precisely in tokens, using the actual tokenizer (rather than a rough character/word-count heuristic) is essential for accurate cost estimation and avoiding unexpected truncation.

### The performance hierarchy (apply in order)

1. **Use the smallest, cheapest model that genuinely meets the task's quality requirements**, rather than defaulting to the largest available model.
2. **Set max_tokens appropriately** for the expected output length, avoiding both premature truncation and unnecessarily generous (and costly) generation limits.
3. **Choose sampling parameters deliberately**, since lower temperature/top-p settings can sometimes also reduce the need for costly retry/regeneration due to inconsistent output.
4. **Cache or reuse identical/near-identical requests** where genuinely applicable, avoiding redundant token-cost expenditure.

### Micro-level facts worth knowing

- Tokenization is generally NOT 1:1 with words — a rough industry heuristic is approximately 4 characters or 0.75 words per token for typical English text, though this varies meaningfully by content type (code, non-English languages, and structured data often tokenize quite differently).
- Both temperature and top-p/top-k affect generation QUALITY but generally have minimal DIRECT effect on token count/cost, since they control WHICH token is chosen, not how MANY tokens are generated.
- Very low temperature (near 0) can sometimes cause a model to get stuck in repetitive loops for certain prompts, since it always picks the single most likely next token — a genuine, occasionally-relevant edge case worth being aware of.
`,

  scalability: `
Scaling laws directly explain and predict how large language model capability scales with size, data, and compute — a foundational concept for understanding the broader trajectory of this technology.

### How scaling laws inform capability planning

~~~mermaid
flowchart LR
    MoreParams["More model\nparameters"] --> Scaling["Combined with\nproportionally more\ntraining data (Chinchilla-\noptimal ratio)"]
    Scaling --> PredictableImprovement["Predictable, quantifiable\nloss/performance\nimprovement (scaling laws)"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Context window size limited by quadratic attention cost | Use efficient attention variants (covered in the **Attention** skill), or a retrieval-based approach chunking content rather than fitting everything in one context window |
| Uncertain whether a larger model would meaningfully improve a specific task | Use scaling-law intuition for a rough estimate, but always validate with genuine, task-specific evaluation |
| High cost from consistently using the largest available model | Consider model routing/tiering, using smaller models for simpler tasks |
| Diminishing or uncertain returns from further scaling for a specific downstream capability | Recognize scaling laws predict loss improvement specifically, not every downstream capability equally; validate empirically for genuinely critical capabilities |
`,

  security: `
### Tokenization and sampling as a genuine, if often overlooked, security surface

~~~
Certain adversarial prompt-injection techniques (covered in
depth in the platform's later Prompt Injection Defense skill)
specifically exploit tokenization quirks -- crafting input
that tokenizes in an unexpected way to bypass content
filters operating on the RAW TEXT rather than the model's
actual token-level view of the input.
~~~

### Essential LLM-Fundamentals-related security practices

1. **Be aware that content filtering operating on raw text may not perfectly align with how the model actually tokenizes and "sees" that same content**, a genuine, specific consideration for robust safety filtering.
2. **Validate and sanitize input text**, treating it as untrusted, directly reusing general input-validation guidance from the **Deep Learning** and **OWASP Top 10** skills.
3. **Understand that very high temperature settings can produce more unpredictable, potentially less safe output**, a genuine consideration for safety-sensitive applications.

See the **OWASP Top 10** skill for the broader security context this connects to, and the platform's later **Prompt Injection Defense** and **Guardrails** skills for LLM-specific security concerns.
`,

  testing: `
### Testing token counting accuracy

~~~python
def test_token_count_matches_actual_tokenizer():
    text = "def calculate_total(items): return sum(items)"
    actual_count = len(encoding_for_model("gpt-4").encode(text))
    assert actual_count > 0
    # verify this is NOT simply len(text) or len(text.split())
    assert actual_count != len(text.split())
~~~

### Testing sampling parameter behavior

~~~python
def test_zero_temperature_is_deterministic():
    response1 = generate(prompt, temperature=0)
    response2 = generate(prompt, temperature=0)
    assert response1 == response2  # deterministic given temperature=0
~~~

### The senior testing doctrine

- Test actual token counts for your application's specific, representative content types, not just generic English prose.
- Test that temperature=0 produces genuinely deterministic, repeatable output for a given prompt.
- Test context window budget management explicitly, verifying long inputs are correctly chunked/truncated/summarized rather than silently failing.
- Test model behavior across a range of sampling parameter settings to build genuine intuition for their practical effect on your specific application's output.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check actual token counts using the correct tokenizer** first, when cost or context-limit issues arise unexpectedly.
2. **Check sampling parameter configuration** if generated output seems either unexpectedly repetitive/predictable or unexpectedly random/incoherent.
3. **Check whether input content has unusual tokenization characteristics** (code, non-English text, unusual formatting) if token counts seem surprisingly high for the apparent content length.
4. **Reconsider model selection** if output quality seems consistently insufficient despite reasonable prompting and sampling configuration.

### Debugging common LLM-Fundamentals-related symptoms

- "API costs are higher than expected" — verify actual token counts using the correct tokenizer, not a rough character/word estimate.
- "Generated output is repetitive or overly predictable" — check temperature setting; consider raising it or adding frequency/presence penalties.
- "Generated output is incoherent or unpredictable" — check for an excessively high temperature or an inappropriately wide top-k/top-p setting.
- "Input is being unexpectedly truncated" — verify actual token count against the model's context window, accounting for both input and expected output length together.
`,

  monitoring: `
### Key signals to track

- **Actual token usage per request** (input and output separately), directly driving both cost and context-window-budget management.
- **Generation quality metrics** (directly connecting to the platform's later **Evaluation** skill) as a function of sampling parameter configuration.
- **Context window utilization**, watching for requests approaching or exceeding the model's actual limit.
- **Cost per request/session**, directly tied to token usage.

### Tools

Model provider-specific token-counting utilities (tiktoken for OpenAI models, and equivalents for other providers); standard cost-monitoring dashboards tracking token usage over time; experiment tracking for comparing generation quality across different sampling parameter configurations.

### Alerting priorities

Alert on token usage/cost exceeding expected budgets, and on requests approaching or exceeding context window limits, both signals of a genuine need to reconsider prompt design, chunking strategy, or model selection.
`,

  deployment: `
### A representative production token-budget management pattern

~~~python
def build_prompt_within_budget(system_prompt, user_content, max_context_tokens):
    encoding = encoding_for_model("gpt-4")
    system_tokens = len(encoding.encode(system_prompt))
    available_for_content = max_context_tokens - system_tokens - RESERVED_FOR_OUTPUT
    content_tokens = encoding.encode(user_content)
    if len(content_tokens) > available_for_content:
        content_tokens = content_tokens[:available_for_content]  # or chunk/summarize
    return system_prompt + encoding.decode(content_tokens)
~~~

### CI/CD pipeline considerations

Treat sampling parameter configuration (temperature, top-p, and similar) as genuine, version-controlled application configuration, with automated testing verifying expected behavior (determinism at temperature=0, for instance) as part of the deployment pipeline. See the platform's later **Prompt Versioning** and **LLMOps** skills for the broader deployment depth this connects to.
`,

  "production-checklist": `
Before a production LLM-powered application takes real traffic:

- [ ] Actual token counts measured using the correct model-specific tokenizer, not a rough character/word estimate
- [ ] Sampling parameters (temperature, top-p) chosen deliberately, matched to the task's actual determinism/creativity requirements
- [ ] Context window budget explicitly managed, accounting for both input and expected output length together
- [ ] Model selection evaluated against actual task complexity, not defaulting to the largest available model unnecessarily
- [ ] Token usage and cost monitoring in place
- [ ] Tokenization behavior tested for the application's specific, representative content types (code, non-English text, structured data)
- [ ] Long-input chunking/truncation/summarization strategy in place for content exceeding the context window
`,

  "common-mistakes": `
1. **Estimating token count/cost using character or word count** instead of the actual tokenizer.
2. **Using an inappropriately high temperature for tasks needing deterministic, factual precision.**
3. **Defaulting to the largest available model regardless of task complexity**, incurring unnecessary cost.
4. **Not accounting for both input and output tokens together** against the context window budget.
5. **Not testing tokenization behavior for non-English text, code, or structured content specifically.**
6. **Assuming scaling laws guarantee a specific task's quality**, without genuine, task-specific evaluation.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Unexpectedly high API costs | Token count underestimated via a rough character/word heuristic | Use the actual, model-specific tokenizer for accurate counting |
| Input unexpectedly truncated | Context window budget not accounting for both input and output tokens together | Explicitly calculate and reserve budget for expected output length |
| Generated output overly repetitive/predictable | Temperature set too low for a task genuinely needing variation | Raise temperature, or add frequency/presence penalties |
| Generated output incoherent or unpredictable | Temperature (or top-k/top-p) set too high for the task | Lower temperature, or tighten top-k/top-p settings |
| Model struggles with character-level tasks (counting letters, reversing strings) | A fundamental tokenization limitation, not a model quality issue | Consider a different approach (explicit character-level preprocessing) for genuinely character-sensitive tasks |
| Higher-than-expected token counts for code/non-English content | Tokenizer behaves differently for these content types than typical English prose | Measure actual token counts empirically for your specific content type |
`,

  faqs: `
**Why are LLM API costs and context limits measured in tokens rather than characters or words?**
Because the model itself operates on tokens (subword units produced by the tokenizer), not raw characters or whole words — token count is the actual, precise unit of both computational cost and context window usage.

**What is temperature, and how does it affect generated output?**
A parameter controlling how "flattened" the model's probability distribution over the next token becomes before sampling — low temperature produces more deterministic, focused output; higher temperature produces more random, varied output.

**What's the difference between top-k and top-p sampling?**
Top-k restricts candidates to a fixed number of the most likely tokens; top-p (nucleus sampling) adaptively restricts candidates to the smallest set whose cumulative probability exceeds a threshold, adjusting the candidate pool size based on the model's actual confidence at each step.

**What are scaling laws?**
Empirically-observed relationships describing how a language model's loss (performance) improves predictably as a power-law function of model size, training data size, and compute — providing a genuinely predictive framework for forecasting the benefit of training a larger model.

**What did the Chinchilla paper find, and why does it matter?**
That many earlier large models were under-trained relative to their size, and that for a given compute budget, a smaller model trained on proportionally more data often outperforms a larger model trained on less — directly reshaping subsequent industry training practice toward more balanced model-size-to-data ratios.

**Why do LLMs sometimes struggle with tasks like counting letters in a word?**
Because the model operates on tokens (subword units), not individual characters — a word might be a single token or split into a few subword tokens that don't align cleanly with character boundaries, making genuinely character-level reasoning tasks structurally difficult for the model.
`,

  "interview-questions": `
### Junior level

1. **What is tokenization, and why does it matter for using an LLM API?**
   Model answer: the process of converting text into subword tokens, the actual units the model operates on — it matters because API costs and context limits are measured in tokens, not characters or words.

2. **What does temperature control in LLM text generation?**
   Model answer: how "flattened" or "peaked" the model's probability distribution over the next token becomes before sampling — low temperature is more deterministic, high temperature is more random.

3. **What is a context window?**
   Model answer: the maximum number of tokens (input plus output combined) a model can process in a single request.

4. **What are scaling laws?**
   Model answer: empirically-observed relationships showing how a language model's performance improves predictably as model size, training data, and compute increase.

### Senior level

5. **Explain precisely why LLMs sometimes struggle with character-level tasks like counting the number of letters in a word or reversing a string, connecting this directly to tokenization.**
   Model answer: LLMs operate on TOKENS (subword units produced by a tokenizer like BPE), not individual characters directly — a given word might be represented as a single token, or split into a few subword tokens, and this tokenization doesn't align cleanly with character boundaries at all; when asked to count letters or reverse a string, the model isn't reasoning over the actual individual characters it was trained to predict — it's reasoning over token IDs that may represent multi-character chunks, meaning the model has to somehow infer character-level structure from patterns in its training data (which does contain SOME such examples) rather than having direct, structural access to individual characters the way a traditional string-manipulation program would; this is a genuine, structural limitation stemming directly from the tokenization scheme, not merely a matter of the model needing more training or a larger parameter count.

6. **Explain the Chinchilla finding in detail, and describe its practical implication for how you would decide the size of a model to train given a fixed compute budget.**
   Model answer: Hoffmann et al.'s 2022 Chinchilla paper found that many earlier large language models (including GPT-3) had been trained with a disproportionate ratio of PARAMETERS to TRAINING DATA — specifically, for a given fixed compute budget, these earlier models were too large relative to how much data they'd actually been trained on, meaning they hadn't fully "learned" from the compute invested in them; the Chinchilla paper's own experiments demonstrated that a meaningfully SMALLER model, trained on proportionally MORE data (within that same total compute budget), achieved BETTER performance than the larger, under-trained alternative; the practical implication is that when deciding how to allocate a fixed compute budget between model size and training data quantity, one should NOT simply maximize model size — instead, there's an empirically-determined "compute-optimal" ratio between parameters and training tokens that a scaling-law-informed training strategy should target, directly reshaping how the industry approaches large-scale model training after this paper's publication.

7. **A team building a code-generation tool notices their LLM-based system occasionally produces syntactically valid but functionally inconsistent code across repeated identical requests. How would sampling parameters relate to this, and what would you recommend?**
   Model answer: this symptom — INCONSISTENCY across repeated identical requests — is a direct, expected consequence of sampling-based generation with a non-zero temperature (or non-restrictive top-k/top-p settings); at any temperature above 0, the model doesn't deterministically pick its single most likely next token at each step — it samples probabilistically, meaning even IDENTICAL prompts can produce genuinely different outputs across repeated calls; for a code-generation tool where CONSISTENCY and PREDICTABILITY are typically more valuable than creative variation, I would recommend setting temperature to 0 (or very close to it), producing effectively deterministic output for a given prompt — this directly trades away any creative variation (which usually isn't a genuine benefit for code generation) in exchange for the consistency the team is presumably actually looking for; if some variation is genuinely still desired (e.g., generating multiple candidate solutions to choose from), a better approach might be to keep temperature at 0 for the PRIMARY generation but explicitly request multiple, independently-sampled candidates at a low-but-nonzero temperature specifically when variation is deliberately wanted, rather than accepting inconsistency as an unavoidable, unexplained side effect of default settings.

8. **Compare top-k and top-p (nucleus) sampling, explaining a scenario where top-p's adaptive behavior provides a genuine, concrete advantage over top-k's fixed candidate count.**
   Model answer: top-k always restricts the candidate pool to a FIXED number of the most likely next tokens (say, the top 40), regardless of how the model's actual probability distribution is shaped at that specific generation step; top-p instead includes however many tokens are needed for their CUMULATIVE probability to exceed a threshold (say, 0.9), meaning the actual candidate pool size varies dynamically based on the model's confidence at each step; consider a generation step where the model is extremely CONFIDENT (e.g., completing "The capital of France is" — the single correct next token, "Paris," likely has an overwhelming majority of the probability mass) — top-p would correctly include just this one (or very few) token(s) in the candidate pool, since a small number already exceeds the cumulative threshold, closely approximating near-deterministic, high-quality output for this specific, confident step; top-k with a fixed count of 40, by contrast, would still consider 40 candidates regardless of the model's actual confidence, potentially including genuinely unlikely, lower-quality tokens in the sampling pool even when the model "knows" the answer with near-certainty, unnecessarily introducing risk of a poor-quality token being sampled in a case where it really shouldn't be; top-p's adaptive behavior directly avoids this specific failure mode by tightening the candidate pool automatically when the model is genuinely confident, and widening it when the model's own distribution is more genuinely uncertain/flat.

9. **Explain scaling laws' practical limits, specifically addressing why "the model is bigger, so it must be better at this specific task" is not always a safe assumption.**
   Model answer: scaling laws (Kaplan et al., and refined by Chinchilla) describe a genuinely robust, predictable relationship between model size/data/compute and a SPECIFIC technical metric — typically LOSS on held-out text (essentially, how well the model predicts the next token in genuinely representative text) — this is a real, well-validated empirical finding; however, this doesn't automatically guarantee improvement on every specific DOWNSTREAM capability or task a practitioner might care about — some capabilities have been observed to emerge somewhat suddenly at particular scale thresholds rather than improving smoothly (a genuinely debated phenomenon, with some research suggesting these apparent discontinuities are partly an artifact of how the specific capability happens to be measured/scored), and a larger model's improved AVERAGE loss across a huge, general training distribution doesn't guarantee improved performance on a narrow, specific task that might be underrepresented in that training distribution, or that requires a kind of reasoning the loss metric doesn't directly, sensitively capture; for this reason, "we should use a bigger model because scaling laws predict better performance" is a reasonable STARTING hypothesis but should always be validated with genuine, task-specific evaluation (directly connecting to the platform's later **Evaluation** skill) rather than assumed as an automatic, guaranteed consequence of scale alone.

10. **Design a token-budget and model-selection strategy for a customer support chatbot handling both simple FAQ-style questions and complex, multi-turn troubleshooting conversations.**
    Model answer: implement a TIERED model-routing strategy (directly connecting to the platform's later **Model Routing** skill) — use a smaller, faster, cheaper model as the default for genuinely simple, FAQ-style questions (which can often be reliably identified via an initial classification step, or via retrieval-augmented matching against a known FAQ knowledge base), reserving a larger, more capable (and more expensive) model specifically for conversations that are classified as, or empirically detected to be, genuinely complex multi-turn troubleshooting; for token-budget management, explicitly account for the ACCUMULATING conversation history in multi-turn conversations, since each new turn's context includes the FULL prior conversation, meaning token usage (and therefore cost and context-window risk) grows with conversation length — implement a strategy for summarizing or truncating older conversation turns once a length threshold is approached, rather than allowing an unbounded conversation history to eventually exceed the context window or become prohibitively expensive; use a LOW temperature setting for this application overall, since customer support responses generally benefit from consistency and predictability rather than creative variation, directly informed by this page's own sampling-parameter guidance.
`,

  "coding-questions": `
### 1. Implement a simple token-budget-aware prompt truncation function

~~~python
def truncate_to_token_budget(text, max_tokens, encoding):
    tokens = encoding.encode(text)
    if len(tokens) <= max_tokens:
        return text
    truncated_tokens = tokens[:max_tokens]
    return encoding.decode(truncated_tokens)
# Follow-up: why is truncating at the TOKEN level (rather than
# truncating the raw string at an equivalent CHARACTER count)
# important for avoiding a malformed, partially-cut-off final
# token in the truncated output?
~~~

### 2. Implement temperature-scaled softmax sampling from scratch

~~~python
import numpy as np

def sample_with_temperature(logits, temperature=1.0):
    if temperature == 0:
        return np.argmax(logits)  # fully deterministic
    scaled_logits = logits / temperature
    probabilities = np.exp(scaled_logits) / np.sum(np.exp(scaled_logits))
    return np.random.choice(len(logits), p=probabilities)
# Follow-up: what happens numerically as temperature approaches
# 0 (but isn't exactly 0) in this implementation, and why is
# an explicit temperature==0 special case handled separately
# rather than just letting the general formula run with a
# very small temperature value?
~~~

### 3. Implement top-p (nucleus) sampling

~~~python
import numpy as np

def top_p_sample(probabilities, p=0.9):
    sorted_indices = np.argsort(probabilities)[::-1]
    sorted_probs = probabilities[sorted_indices]
    cumulative_probs = np.cumsum(sorted_probs)
    cutoff_index = np.searchsorted(cumulative_probs, p) + 1
    nucleus_indices = sorted_indices[:cutoff_index]
    nucleus_probs = sorted_probs[:cutoff_index]
    nucleus_probs = nucleus_probs / np.sum(nucleus_probs)  # renormalize
    return np.random.choice(nucleus_indices, p=nucleus_probs)
# Follow-up: why is it necessary to RENORMALIZE the nucleus
# probabilities after selecting the top-p subset, rather than
# just sampling with the original (now-truncated) probability
# values directly?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Explore tokenization behavior across content types
Using a tokenizer library like tiktoken, tokenize a variety of content types (English prose, code, non-English text, structured JSON) and document how token counts vary relative to character/word counts for each. Deliverable: a documented tokenization behavior comparison. Skills exercised: practical tokenization understanding.

### Lab 2 (Intermediate): Compare sampling parameter effects on generated output
Using an LLM API, generate text for the same prompt across a range of temperature, top-k, and top-p settings, documenting the qualitative differences in output consistency and creativity. Deliverable: a documented sampling parameter comparison. Skills exercised: practical sampling parameter tuning.

### Lab 3 (Advanced): Implement token-budget management for a long-document summarization pipeline
Build a pipeline that correctly manages token budget when summarizing documents that may exceed the model's context window, implementing appropriate chunking or truncation strategies. Deliverable: a working, tested token-budget-aware pipeline. Skills exercised: applied context window management.

### Lab 4 (Production): Build a model-routing system based on task complexity
Implement a simple classifier that routes requests to either a smaller/cheaper or larger/more capable model based on estimated task complexity, and measure the resulting cost/quality tradeoff. Deliverable: a documented model-routing implementation with measured tradeoffs. Skills exercised: applied model selection strategy.
`,

  "real-projects": `
### 1. A token-budget-aware document processing pipeline
Engineering requirements: accurate token counting for diverse content types, chunking/summarization strategies for content exceeding context windows, and cost monitoring tied to actual token usage.

### 2. A sampling-parameter-tuned application suite
Engineering requirements: distinct sampling parameter configurations for different application components (deterministic for data extraction, creative for content generation), with documented rationale for each choice.

### 3. A tiered model-routing system
Engineering requirements: task-complexity classification directing requests to appropriately-sized models, with measured cost and quality tradeoffs across the tiering strategy.
`,

  "case-studies": `
### GPT-3's dramatic validation of scaling laws in practice
GPT-3's striking few-shot learning capabilities, demonstrated directly from prompting alone with no fine-tuning, provided dramatic, widely-discussed real-world validation of the scaling-laws framework Kaplan et al. had formalized just months earlier — directly confirming that the predicted, quantitative relationship between scale and capability held up at genuinely unprecedented model sizes. Lesson: a rigorously formalized empirical/theoretical framework (scaling laws) gains enormously in credibility and influence when its predictions are dramatically, publicly validated by a subsequent, even larger real-world result.

### The Chinchilla paper's correction of an entire industry's training practice
Hoffmann et al.'s 2022 finding that many earlier large models (including the original GPT-3) were meaningfully under-trained relative to their size prompted a genuine, industry-wide reassessment of model training strategy, directly influencing subsequent models' training approaches toward more balanced model-size-to-data ratios. Lesson: even a well-established, seemingly settled practice (in this case, prior assumptions about optimal model-size-to-data ratios) can be meaningfully corrected by careful, rigorous follow-up empirical research — the field's understanding of scaling continues to actively refine over time, not settling permanently on any single early finding.

### ChatGPT bringing tokenization and sampling parameters into mainstream awareness
ChatGPT's massive 2022 public release directly exposed millions of non-technical users to concepts like context window limits (experienced as "the AI forgot what we discussed earlier") and, for developers building on the underlying API, sampling parameters like temperature — rapidly transforming what had been comparatively niche, research-adjacent technical concepts into widely-discussed, practically important knowledge across a much broader population of both technical and non-technical users. Lesson: a single, sufficiently widely-adopted product can rapidly transform a technical field's previously niche vocabulary and concepts into broadly shared, practically important knowledge across an entire industry and beyond.
`,

  comparisons: `
| Aspect | Low Temperature (near 0) | High Temperature (near 1+) |
|--------|-------------------------------|----------------------------------|
| Determinism | Highly deterministic, repeatable | Variable, less repeatable |
| Best fit | Factual Q&A, code generation, data extraction | Creative writing, brainstorming |
| Risk | Can get stuck in repetitive loops | Can produce incoherent, unpredictable output |

| Aspect | Top-k Sampling | Top-p (Nucleus) Sampling |
|--------|--------------------|--------------------------------|
| Candidate pool size | Fixed count | Adaptive, based on cumulative probability |
| Behavior when model is confident | Still considers k candidates regardless | Naturally narrows to fewer candidates |
| Behavior when model is uncertain | Still considers only k candidates | Naturally widens to more candidates |

**How seniors choose**: default to low temperature for tasks needing consistency and factual precision; use higher temperature combined with top-p sampling for creative, varied-output applications; prefer top-p over top-k for its adaptive behavior matched to the model's actual per-step confidence.
`,

  "related-technologies": `
- **Transformers**, **Attention**, **Embeddings** — the architectural foundation this page's practical concepts directly build on.
- **Prompt Engineering** — covered next in this category, directly building on this page's tokenization and sampling knowledge.
- **Fine-Tuning** — where scaling-law intuition directly informs decisions about model size and training data quantity.
- **Model Routing** (platform's later category) — directly applies this page's model-selection and scaling-law concepts.

Learning path: **Transformers**/**Attention**/**Embeddings** (previous category) → this page (LLM Fundamentals) → **Prompt Engineering** → the remaining skills in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Context window sizes have continued expanding significantly across major providers, with some models now supporting well over 1 million tokens.
- Continued industry-wide application of Chinchilla-informed, more balanced model-size-to-training-data ratios for new model training.
- Continued, active research and debate on the nature of "emergent capabilities" and their relationship to the underlying, smoother scaling-law trends in loss.
- Given continued evolution in this space, verify current specific model context window sizes, pricing, and sampling parameter options against each provider's up-to-date documentation.
`,

  "future-roadmap": `
Where LLM Fundamentals is heading, and what's worth betting career time on:

- **Continued growth of practical context window sizes**, driven by both algorithmic efficiency improvements (efficient attention variants) and continued compute investment.
- **Continued refinement of scaling-law understanding**, including ongoing research into the relationship between scale and specific downstream capabilities, not just aggregate loss.
- **Continued mainstream, widespread practical importance of tokenization and sampling parameter understanding** as more engineers build directly on LLM APIs.
- **What to bet on**: deeply understanding tokenization's practical implications, sampling parameters' concrete effects, and scaling laws' genuine predictive power and limits — these foundational, practical concepts transfer directly to working with any current or future large language model, a far more durable investment than familiarity with any single model's current specific configuration.
`,

  "cheat-sheet": `
~~~
# ---- Tokenization: the actual unit of cost and context ----
Text -> subword tokens (BPE) -- NOT characters, NOT words.
Rough heuristic: ~4 chars or ~0.75 words per token (English)
    -- varies significantly for code/non-English/structured data.
~~~

~~~
# ---- Context window ----
Max TOKENS per request = INPUT tokens + OUTPUT tokens, combined.
Quadratic attention cost (Transformers skill) limits how large
    this can practically/economically grow.
~~~

~~~
# ---- Sampling parameters ----
Temperature: divides logits before softmax
    0 = deterministic (always most likely token)
    higher = flatter distribution, more random/creative
Top-k: fixed-size candidate pool
Top-p (nucleus): SMALLEST set exceeding cumulative prob p
    -- adaptive, generally preferred over top-k
Frequency/presence penalty: discourage repetition/topic reuse
~~~

~~~
# ---- Scaling laws ----
Loss decreases PREDICTABLY (power law) with model size,
    data size, and compute (Kaplan et al., 2020).
Chinchilla (2022): many early large models were UNDER-TRAINED
    -- smaller model + proportionally MORE data often wins
    for a FIXED compute budget.
~~~

~~~
# ---- Practical defaults ----
Deterministic/factual tasks (code, extraction): temp 0-0.3
Creative/varied tasks: temp 0.7-1.0 + top-p
Don't default to the biggest model -- match size to task need.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Why are API costs measured in tokens, not characters? | The model operates on tokens (subword units), the actual unit of computation. |
| What does temperature control? | How flattened/peaked the next-token probability distribution is before sampling. |
| Top-k vs top-p sampling? | Top-k: fixed candidate count. Top-p: adaptive, smallest set exceeding cumulative probability p. |
| What is a context window? | Max tokens per request — INPUT + OUTPUT combined. |
| What do scaling laws describe? | Predictable power-law relationship between model size/data/compute and loss. |
| What did Chinchilla find? | Many early large models were under-trained — smaller model + more data often wins for fixed compute. |
| Why do LLMs struggle counting letters in a word? | They operate on tokens, not individual characters — a structural limitation. |
| Best temperature for code generation? | Low (0-0.3) — consistency and determinism matter more than variety. |
| What does frequency penalty do? | Reduces probability of tokens proportional to how often they've already appeared. |
| Should you always use the biggest model? | No — match model size to actual task complexity; smaller models often suffice. |
`,

  mcqs: `
1. Why are LLM API pricing and context limits measured in tokens rather than characters or words?
   A) It's an arbitrary industry convention  B) The model itself operates on tokens (subword units), the actual unit of computation  C) Tokens are always equal to words  D) Characters can't be counted programmatically
   **Answer: B** — tokenization is the actual representation the model processes.

2. What does setting temperature to 0 produce?
   A) An error  B) Fully deterministic output — always the single most likely next token  C) Maximum randomness  D) No output at all
   **Answer: B** — useful for tasks needing consistent, repeatable output.

3. What is the key difference between top-k and top-p sampling?
   A) They are identical  B) Top-k uses a fixed candidate count; top-p adaptively includes the smallest set exceeding a cumulative probability threshold  C) Top-p doesn't use probabilities  D) Top-k is always better
   **Answer: B** — top-p's adaptive behavior is generally considered more robust across varying model confidence.

4. What did the Chinchilla paper (Hoffmann et al., 2022) find?
   A) Bigger models are always better regardless of data  B) Many earlier large models were under-trained relative to their size; smaller models with proportionally more data often perform better for a fixed compute budget  C) Scaling laws don't exist  D) Tokenization doesn't matter
   **Answer: B** — directly reshaped subsequent industry model-training strategy.

5. Why do LLMs sometimes struggle with tasks like counting letters in a word?
   A) They are poorly trained  B) They operate on tokens (subword units), not individual characters, a structural tokenization limitation  C) This never actually happens  D) It's a temperature setting issue
   **Answer: B** — a genuine, structural consequence of the tokenization scheme, not a training deficiency.
`,

  "revision-notes": `
LLM Fundamentals covers the practical, concrete knowledge needed to actually build applications on top of large language models, directly bridging the previous category's architectural theory (**Transformers**, **Attention**, **Embeddings**) to everyday practical work. TOKENIZATION converts raw text into subword TOKENS (commonly via Byte Pair Encoding, or BPE) — the actual discrete units a model's embedding layer operates on — meaning API pricing and CONTEXT WINDOW limits are measured in tokens, not characters or words, a critical, frequently-tested distinction; a rough heuristic is approximately 4 characters or 0.75 words per token for typical English text, though this varies significantly for code, non-English languages, and structured data.

The CONTEXT WINDOW is the maximum number of tokens (INPUT plus OUTPUT combined) a model can process in a single request, directly connecting to and constrained by the **Transformers** skill's own treatment of standard self-attention's quadratic computational cost — this is precisely why context windows, while growing rapidly over time, still face genuine practical and economic constraints, motivating continued research into efficient attention variants.

SAMPLING is the process of converting a model's predicted probability distribution over the next token (produced via softmax, directly reusing the **Neural Networks** skill's own treatment) into an actual, chosen token. TEMPERATURE divides the logits before softmax — a temperature of 0 produces fully deterministic output (always the single most likely token); higher temperature flattens the distribution, producing more random, varied output. TOP-K sampling restricts candidates to a fixed number of the most likely tokens; TOP-P (nucleus) sampling instead includes the SMALLEST set of tokens whose cumulative probability exceeds a threshold — a critical, frequently-tested distinction is that top-p is generally considered MORE ADAPTIVE than top-k, since it automatically narrows the candidate pool when the model is confident (a peaked distribution) and widens it when the model is uncertain (a flatter distribution), while top-k always considers the same fixed count regardless of the model's actual per-step confidence. FREQUENCY and PRESENCE penalties further discourage literal repetition and topic reuse, respectively.

SCALING LAWS (Kaplan et al., 2020) formalize the empirically-observed, remarkably predictable POWER-LAW relationship between model size, training data size, compute, and resulting LOSS (a direct measure of next-token prediction quality) — providing a genuinely predictive framework for forecasting how much a larger model or more training data would actually improve performance, well before training it. GPT-3's striking few-shot capabilities in 2020 provided dramatic, widely-discussed real-world validation of this framework.

A critical, frequently-tested refinement: the CHINCHILLA finding (Hoffmann et al., 2022) demonstrated that many earlier large models (including the original GPT-3) were significantly UNDER-TRAINED relative to their parameter count — for a GIVEN, FIXED compute budget, a SMALLER model trained on PROPORTIONALLY MORE data often outperforms a larger, under-trained model, directly reshaping subsequent industry training practice toward more balanced, "compute-optimal" model-size-to-training-data ratios.

A genuinely important, structural consequence of tokenization: because LLMs operate on TOKENS rather than individual characters, tasks requiring genuine CHARACTER-LEVEL reasoning (counting letters in a word, reversing a string) can be structurally difficult for a model, since tokenization doesn't align cleanly with character boundaries — this is a real, well-documented limitation stemming directly from the tokenization scheme, not simply a matter of insufficient model scale or training.

SCALING LAWS' PRACTICAL LIMITS are also important: they describe smooth, predictable improvement in the specific technical metric of loss, but don't automatically guarantee improvement on every specific downstream capability — some capabilities have been observed to emerge somewhat suddenly at particular scale thresholds (a genuinely debated research phenomenon), and "the model is bigger, so it must perform better at this specific task" is a reasonable starting hypothesis requiring genuine, task-specific EVALUATION (directly connecting to the platform's later **Evaluation** skill) rather than an assumption automatically guaranteed by scale alone.

A senior AI engineer always measures token counts using the actual, model-specific tokenizer (never a rough character/word heuristic), chooses sampling parameters deliberately (low temperature for deterministic/factual tasks, higher temperature with top-p for creative tasks), explicitly manages context window budget accounting for both input and output together, and evaluates whether a smaller, cheaper model genuinely suffices for a given task rather than defaulting to the largest available model — this practical, applied knowledge directly underlies every subsequent skill in this category, including **Prompt Engineering**, **Fine-Tuning**, **Inference**, **Serving**, **Evaluation**, **Hallucination**, and **Guardrails**.
`,

  "learning-roadmap": `
**Week 1 — Tokenization fundamentals**: understanding subword tokenization, BPE, and its practical implications for cost and context limits. Milestone: complete Lab 1, with a documented tokenization behavior comparison across content types.

**Week 2 — Sampling parameter mastery**: understanding and experimenting with temperature, top-k, and top-p sampling. Milestone: complete Lab 2, with a documented sampling parameter comparison.

**Week 3 — Context window management**: building a token-budget-aware processing pipeline for content exceeding the context window. Milestone: complete Lab 3, with a working, tested pipeline.

**Week 4 — Scaling laws and model selection**: applying scaling-law intuition to a practical model-routing decision. Milestone: complete Lab 4, with a documented model-routing implementation and measured tradeoffs.

Next platform skill once this roadmap is complete: **Prompt Engineering**, directly building on this page's tokenization and sampling foundations.
`,

  "official-docs": `
- **OpenAI's official tiktoken library and API documentation** — the authoritative reference for GPT-family tokenization and sampling parameters.
- **Anthropic's official Claude API documentation** — covers context window sizes and sampling parameters for Claude models.
- **Hugging Face's official documentation on tokenizers** — a comprehensive reference for tokenization schemes across many model families.
`,

  books: `
- **"Speech and Language Processing" — Jurafsky and Martin** — covers tokenization and language modeling fundamentals within its broader, authoritative NLP context.
- **"Natural Language Processing with Transformers" — Tunstall, von Werra, Wolf** — covers practical LLM usage, including tokenization and generation parameters, with strong applied depth.
`,

  blogs: `
- **OpenAI's official technical blog** — regularly publishes accessible explanations of tokenization, sampling, and scaling-related research.
- **Jay Alammar's illustrated blog posts on GPT and tokenization** — exceptionally clear, visual explanations directly relevant to this page.
- **Epoch AI's blog and research on scaling trends** — detailed, quantitative analysis of scaling laws and their industry implications.
`,

  "research-papers": `
- **Kaplan, J. et al. — "Scaling Laws for Neural Language Models"** (2020) — the foundational scaling laws paper.
- **Hoffmann, J. et al. — "Training Compute-Optimal Large Language Models"** (2022, the Chinchilla paper) — the foundational compute-optimal training paper.
- **Sennrich, R. et al. — "Neural Machine Translation of Rare Words with Subword Units"** (2016) — the foundational Byte Pair Encoding for NLP paper.
- **Brown, T. et al. — "Language Models are Few-Shot Learners"** (2020, the GPT-3 paper) — direct empirical validation of scaling laws at unprecedented scale.
`,

  videos: `
- **Andrej Karpathy's "Let's build the GPT Tokenizer" video** — an exceptionally clear, from-scratch walkthrough of tokenization mechanics.
- **Conference talks and explainer videos on scaling laws** from major AI labs (OpenAI, DeepMind, Anthropic).
- **Practical tutorials on sampling parameter tuning** from various LLM API providers' official developer content.
`,

  "github-repos": `
- **openai/tiktoken** — the official OpenAI tokenizer library.
- **huggingface/tokenizers** — a widely-used, high-performance tokenization library supporting many schemes.
- **karpathy/minbpe** — a minimal, educational implementation of Byte Pair Encoding tokenization.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Token count estimation**: given a described piece of text (code, prose, structured data), estimate its actual token count and explain the reasoning.
2. **Sampling parameter selection**: given a described application (creative writing, data extraction, and others), choose and justify appropriate sampling parameters.
3. **Scaling law application**: given described model size and data size changes, estimate the likely effect on model loss using scaling-law intuition.
4. **Context window budget design**: given a described long-document use case, design an appropriate chunking/truncation strategy.
5. **External practice sets**: Andrej Karpathy's tokenizer-building exercises for hands-on tokenization implementation practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Input["Input Processing"]
        Text["Raw Text"] --> Tokenizer["Tokenizer (BPE)"]
        Tokenizer --> TokenIDs["Token IDs"]
    end
    subgraph ModelForward["Model Forward Pass"]
        TokenIDs --> Transformer["Transformer\n(decoder-only)"]
        Transformer --> Logits["Logits (per vocab token)"]
    end
    subgraph Generation["Generation Control"]
        Logits --> Temperature["Temperature Scaling"]
        Temperature --> TopKP["Top-k / Top-p Filtering"]
        TopKP --> Sample["Sample Next Token"]
    end
    Sample -.->|"feed back for\nnext token"| TokenIDs
    Sample --> Detokenizer["Detokenizer"]
    Detokenizer --> Output["Final Text Output"]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LLM Fundamentals))
    Foundations
      Overview
      History GPT scaling laws Chinchilla
      Why it exists
      Problem it solves
    Tokenization
      Byte pair encoding
      Subword units
      Character level limitations
    Context Window
      Input plus output tokens
      Quadratic attention link
      Long context growth
    Sampling
      Temperature
      Top k sampling
      Top p nucleus sampling
      Frequency presence penalty
    Scaling Laws
      Kaplan power law
      Chinchilla compute optimal
      Emergent capabilities debate
      Practical limits
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default llmFundamentals;
