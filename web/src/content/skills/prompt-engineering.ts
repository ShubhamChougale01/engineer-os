import type { SkillContent } from "../types";

const promptEngineering: SkillContent = {
  overview: `
Prompt engineering is the discipline of deliberately designing the input text given to a large language model to reliably elicit the desired behavior — since an LLM's output is entirely shaped by its input (there's no separate "configuration" beyond the prompt itself, the sampling parameters covered in the **LLM Fundamentals** skill, and the model's own weights), the prompt is the single most direct, immediately-actionable lever an AI engineer has for controlling model behavior without retraining or fine-tuning anything.

This skill covers the specific, empirically-validated techniques — few-shot examples, chain-of-thought reasoning, explicit role/system instructions, structured output formatting — that have been repeatedly shown to reliably improve an LLM's output quality, consistency, and correctness for a given task. Prompt engineering is genuinely the first, lowest-cost tool an AI engineer should reach for when building an LLM-powered application, well before considering the more expensive, complex alternatives (fine-tuning, covered in the next skill) — a well-engineered prompt can often achieve results comparable to a fine-tuned model, at a fraction of the cost and complexity.

For an AI engineer, mastering prompt engineering directly determines how effectively they can extract reliable, useful behavior from an off-the-shelf LLM, and understanding WHY specific techniques (like chain-of-thought) work — directly connecting to the model's own autoregressive, token-by-token generation process covered in the **Transformers** skill — provides the genuine, transferable intuition needed to design NEW effective prompts for novel tasks, rather than merely following a fixed checklist of known tricks.

Key characteristics: **zero-shot versus few-shot prompting**, whether the prompt includes example input-output pairs demonstrating the desired behavior; **chain-of-thought prompting**, explicitly asking the model to reason step-by-step before producing a final answer, directly improving performance on tasks requiring multi-step reasoning; **system prompts and role-setting**, establishing persistent context/persona/constraints that shape the model's behavior across an entire conversation; and **structured output prompting**, explicitly instructing the model to produce output in a specific, parseable format (JSON, and others).
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2020 | **GPT-3**'s release directly popularizes "prompting" as a genuinely new paradigm — demonstrating that a single pretrained model could perform an enormous range of tasks purely through carefully-crafted input text, with no task-specific fine-tuning required at all |
| 2021 | **Prompt-based few-shot learning** research formalizes and systematically studies the practice of including example input-output pairs directly in the prompt, quantifying its substantial effect on task performance |
| 2022 | **Wei et al.**'s **"Chain-of-Thought Prompting"** paper demonstrates that explicitly prompting a model to show its step-by-step reasoning before producing a final answer dramatically improves performance on tasks requiring multi-step logical or arithmetic reasoning |
| 2022 | **"Let's think step by step"** (Kojima et al.) demonstrates that even a simple, generic instruction to reason step-by-step (without any task-specific few-shot examples) can trigger substantial chain-of-thought-style reasoning improvements — "zero-shot chain-of-thought" |
| 2022–2023 | **System prompts** become a standard, explicitly-supported API feature (distinct from user messages) across major LLM providers, letting developers establish persistent behavioral instructions separate from the actual conversation content |
| 2023 | **ReAct** (Reason + Act) prompting combines chain-of-thought reasoning with explicit tool-use actions, directly foreshadowing and connecting to the platform's later **AI Agents** category |
| 2023–2024 | **Structured output / JSON mode** becomes a standard, explicitly-supported feature across major LLM APIs, directly addressing the practical need for reliably parseable model output in production applications |

Prompt engineering's history reflects the field's rapid, empirical discovery of a genuinely new paradigm — that a single pretrained model's behavior could be substantially, reliably shaped purely through carefully-designed input text, without any weight updates at all — with specific techniques (chain-of-thought especially) emerging from rigorous empirical research demonstrating dramatic, reproducible performance improvements on previously difficult reasoning tasks.
`,

  "why-it-exists": `
Prompt engineering exists because a large language model's behavior, while ultimately determined by its fixed, trained weights, is genuinely and substantially STEERABLE at inference time purely through the INPUT TEXT it's given — a model trained via next-token prediction on vast, diverse text learns to continue text in a way that's statistically consistent with whatever CONTEXT precedes it, meaning the specific way a task is framed, the examples provided, and the explicit instructions given all directly, measurably shape the model's subsequent output.

This creates a genuine, practical opportunity: rather than needing to retrain or fine-tune a model (an expensive, slow, and often impractical option for most AI engineers, covered in the next skill) every time a new task or behavior is needed, a carefully-designed PROMPT can often elicit dramatically improved performance from the SAME underlying, unchanged model. Prompt engineering exists specifically to systematize this observation — providing a body of empirically-validated techniques (few-shot examples, chain-of-thought, structured formatting) that reliably improve output quality across a genuinely wide range of tasks, giving AI engineers a fast, low-cost, immediately-actionable lever for improving LLM application behavior.
`,

  "problem-it-solves": `
Prompt engineering solves the **"how do we reliably elicit the desired behavior from a large language model, purely through the input text, without retraining or fine-tuning it"** problem.

Concretely, it provides:

- **A fast, low-cost first lever for improving LLM application quality**: prompt changes can be iterated on in seconds/minutes, versus the days/weeks and genuine expense of fine-tuning (covered in the next skill).
- **Few-shot examples**, directly demonstrating the desired input-output pattern within the prompt itself, letting the model infer and apply the pattern to a new input without any weight updates.
- **Chain-of-thought reasoning**, explicitly prompting the model to show intermediate reasoning steps, directly improving accuracy on tasks requiring multi-step logic, arithmetic, or reasoning that a single, immediate answer would likely get wrong.
- **System prompts and explicit role/constraint-setting**, establishing persistent behavioral context (a persona, a set of rules, a specific output format) that shapes the model's behavior consistently across an entire conversation or application.
- **Structured output prompting**, reliably eliciting machine-parseable output formats (JSON, and others) essential for integrating LLM output into a larger software system.

What prompt engineering does **not** solve, or solves only partially: prompting cannot teach a model genuinely NEW knowledge or capabilities it fundamentally lacks — it can only elicit and better-organize capabilities the model's training already instilled; prompting alone cannot eliminate HALLUCINATION (covered in depth in its own later skill) — a model can still confidently generate plausible-sounding but factually incorrect content regardless of how well-crafted the prompt is; and prompt engineering's improvements, while often substantial, are generally more modest and less reliable than genuine fine-tuning (covered in the next skill) for tasks requiring deep, consistent behavioral change across a very large volume of production use.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain zero-shot versus few-shot prompting and when each is appropriate.
2. Explain chain-of-thought prompting and why it improves performance on multi-step reasoning tasks.
3. Explain the role of system prompts versus user messages in shaping model behavior.
4. Explain structured output prompting techniques for reliably eliciting parseable formats like JSON.
5. Recognize prompt engineering anti-patterns: vague instructions, missing examples for a genuinely ambiguous task, ignoring output format specification.
6. Compare prompting strategies (zero-shot, few-shot, chain-of-thought, ReAct) and identify which fits a given task.
7. Answer senior-level interview questions on prompt design tradeoffs and debugging unreliable LLM output.
`,

  prerequisites: `
- **Required**: the **LLM Fundamentals** skill (covered immediately before this one) — prompt engineering directly builds on tokenization, context window, and sampling concepts covered there.
- **Very helpful**: the **Transformers** skill — understanding autoregressive, causal generation directly explains WHY chain-of-thought prompting works.

Dependency chain: **LLM Fundamentals** → this page (Prompt Engineering) → **Fine-Tuning** for the next skill in this category.
`,

  "beginner-concepts": `
### Zero-shot versus few-shot prompting

~~~
Zero-shot: ask the model to perform a task directly, with NO
    examples provided.
    "Classify the sentiment of this review: 'The food was cold.'"

Few-shot: provide a FEW example input-output pairs directly
    in the prompt, before the actual task.
    "Review: 'Amazing service!' Sentiment: Positive
     Review: 'Terrible wait times.' Sentiment: Negative
     Review: 'The food was cold.' Sentiment:"
~~~

Few-shot examples directly demonstrate the desired pattern (including the exact expected output format), often substantially improving reliability and consistency compared to a purely zero-shot instruction, especially for tasks with a genuinely ambiguous or unusual expected format.

### A simple chain-of-thought example

~~~
Without chain-of-thought:
"If a store has 23 apples and sells 8, then receives a
shipment of 15 more, how many apples does it have?" -> "30"
(often WRONG for a model that jumps straight to an answer)

With chain-of-thought:
"...Let's think step by step." ->
"The store starts with 23 apples. After selling 8, it has
23 - 8 = 15 apples. After receiving 15 more, it has
15 + 15 = 30 apples. The answer is 30."
~~~

Explicitly asking the model to show its work generally produces MORE accurate final answers for multi-step problems, directly connecting to the **Transformers** skill's own treatment of autoregressive generation — each generated token can attend to (and build on) every previously generated token, so generating intermediate reasoning steps gives the model genuine "working space" to build toward a correct final answer, rather than needing to jump directly to it.

### System prompts versus user messages

~~~python
messages = [
    {"role": "system", "content": "You are a helpful customer support agent for a software company. Always be concise and professional."},
    {"role": "user", "content": "How do I reset my password?"},
]
~~~

The system prompt establishes PERSISTENT context/behavior for the entire conversation, while user messages represent the actual, turn-by-turn conversation content — this separation lets an application establish consistent behavioral guardrails independent of whatever a user happens to type.
`,

  "intermediate-concepts": `
### Zero-shot chain-of-thought: a simple, generic trigger

~~~
Appending a simple phrase like "Let's think step by step" to
a prompt -- WITHOUT any task-specific few-shot examples at all
-- has been empirically shown (Kojima et al., 2022) to trigger
substantial chain-of-thought-style reasoning improvements on
many tasks, a remarkably simple, generic, and broadly
applicable prompting technique.
~~~

### Structured output prompting

~~~
Explicit instruction: "Respond ONLY with valid JSON matching
this exact schema: {"name": string, "age": number}. Do not
include any other text."

Modern LLM APIs increasingly support a dedicated "JSON mode"
or "structured output" feature, directly constraining the
model's generation to conform to a specified schema, providing
a MORE RELIABLE guarantee than prompt instructions alone
(which a model can still occasionally fail to follow exactly).
~~~

### Role-setting and persona prompting

~~~
"You are an expert Python code reviewer. Review the following
code for bugs, style issues, and potential security
vulnerabilities, being thorough but constructive."

Explicitly establishing a role/persona can shift the model's
generated output toward patterns statistically associated
with that role in its training data (e.g., a more critical,
detail-oriented tone for a "code reviewer" persona) --
directly reflecting the model's own training on vast, diverse
text where different roles/personas exhibit genuinely
different characteristic language patterns.
~~~

### Prompt templates and variable substitution

~~~python
prompt_template = """
You are a summarization assistant. Summarize the following
document in {num_sentences} sentences, focusing on {focus_area}.

Document: {document_text}
"""

prompt = prompt_template.format(
    num_sentences=3, focus_area="financial implications",
    document_text=full_document,
)
~~~

Production prompt engineering typically involves reusable TEMPLATES with variable substitution, rather than hand-writing a unique prompt for every single request — directly connecting to the platform's later **Prompt Versioning** skill's treatment of managing these templates systematically.

### Delimiters for clearly separating instructions from content

~~~
Use explicit delimiters (triple quotes, XML-style tags, or
similar) to clearly separate INSTRUCTIONS from the actual
CONTENT the model should operate on:

"Summarize the text between the triple quotes:
\\"\\"\\"
{document_text}
\\"\\"\\"
"

This helps the model correctly distinguish between the task
instruction and the data it's being asked to process,
reducing the risk of the model misinterpreting part of the
CONTENT as an additional instruction.
~~~
`,

  "advanced-concepts": `
### Why chain-of-thought works, mechanistically

~~~
A decoder-only Transformer (covered in the Transformers skill)
generates tokens AUTOREGRESSIVELY, with each new token's
generation directly conditioned on ALL previously generated
tokens (via causal self-attention). When a model is asked to
jump DIRECTLY to a final answer for a genuinely multi-step
problem, it has effectively only ONE "forward pass worth" of
computation to arrive at a potentially complex answer.
CHAIN-OF-THOUGHT lets the model "externalize" its
intermediate reasoning as actual generated tokens, which then
become part of the CONTEXT for generating subsequent tokens
-- effectively giving the model additional "thinking steps"
it can build on, rather than needing to compute the entire
multi-step answer in one immediate leap.
~~~

### ReAct: combining reasoning and action

~~~
ReAct (Reason + Act) prompting interleaves explicit REASONING
steps with concrete ACTIONS (like calling an external tool or
API), and OBSERVATIONS (the results of those actions) --
directly foreshadowing and connecting to the platform's later
AI Agents category, where this same reason-act-observe loop
becomes the foundational pattern for building agents that use
tools to accomplish tasks beyond pure text generation.
~~~

### Self-consistency: sampling multiple reasoning paths

~~~
Rather than generating a SINGLE chain-of-thought response,
SELF-CONSISTENCY (Wang et al., 2022) generates MULTIPLE
independent chain-of-thought responses (via sampling with a
non-zero temperature, directly connecting to the LLM
Fundamentals skill's own treatment of sampling), then takes
the MAJORITY-VOTE final answer across all of them -- often
meaningfully more accurate than any single chain-of-thought
response alone, at the cost of requiring multiple model calls.
~~~

### Prompt sensitivity and the need for systematic evaluation

~~~
LLM output can be surprisingly SENSITIVE to seemingly minor
prompt phrasing changes -- word choice, example ordering, or
even whitespace/formatting can sometimes produce measurably
different output quality. This directly motivates the
platform's later Evaluation skill's own treatment of
systematic, rigorous testing across prompt variations, rather
than relying on a single, informal "it seems to work" check.
~~~

### The limits of prompting: when fine-tuning becomes necessary

~~~
Prompting alone struggles when: the desired behavior requires
consistent adherence across an EXTREMELY large volume of
production requests (where even a small per-request failure
rate compounds into a significant absolute number of failures);
the task requires deep, specialized domain knowledge poorly
represented in the model's general training data; or context
window constraints prevent including SUFFICIENT few-shot
examples/instructions for a genuinely complex task -- these
are precisely the scenarios where fine-tuning (covered in the
next skill) becomes the more appropriate, if more expensive, choice.
~~~
`,

  "internal-working": `
Tracing how chain-of-thought prompting changes a model's generation process, illustrating exactly where the "extra thinking" happens:

~~~mermaid
sequenceDiagram
    participant Prompt as Prompt (with CoT trigger)
    participant Model as Language Model
    participant Reasoning as Generated Reasoning\nTokens
    participant FinalAnswer as Final Answer Tokens

    Prompt->>Model: "...Let's think step by step."
    Model->>Reasoning: generate intermediate\nreasoning step 1\n(conditioned on the prompt)
    Reasoning->>Model: reasoning step 1 becomes\npart of the CONTEXT for\nthe next generation step
    Model->>Reasoning: generate intermediate\nreasoning step 2\n(conditioned on prompt +\nreasoning step 1)
    Reasoning->>Model: reasoning step 2 also\nbecomes part of context
    Model->>FinalAnswer: generate final answer\n(conditioned on prompt +\nBOTH reasoning steps)
~~~

1. **The prompt includes an explicit trigger** ("Let's think step by step") encouraging the model to generate intermediate reasoning rather than jumping directly to a final answer.
2. **Each generated reasoning step becomes part of the growing context** available to the model for generating the NEXT token — directly connecting to the **Transformers** skill's own causal, autoregressive generation mechanics.
3. **By the time the model generates its final answer**, it has the FULL benefit of its own previously-generated reasoning steps as context, effectively having "worked through" the problem incrementally rather than needing to compute the entire answer in a single, immediate leap.

**Why this matters**: this concrete trace explains precisely why chain-of-thought prompting works — it's not a mysterious trick, but a direct, mechanistic consequence of how autoregressive generation actually works, giving the model genuine additional "computation," externalized as generated tokens, to build toward a correct answer.
`,

  architecture: `
A senior practitioner thinks about prompt engineering architecture in terms of choosing the right prompting strategy for a given task's complexity, structuring system prompts deliberately, and building reusable, testable prompt templates rather than ad-hoc, one-off prompts.

### Choosing a prompting strategy for task complexity

~~~mermaid
flowchart TB
    Task["A given LLM task"] --> Q1{"Does the task require\ngenuine multi-step\nreasoning (math, logic,\nplanning)?"}
    Q1 -->|Yes| CoT["Use chain-of-thought\n(zero-shot or few-shot)"]
    Q1 -->|"No -- a more\ndirect classification/\ngeneration task"| Q2{"Is the expected output\nformat/pattern genuinely\nambiguous or unusual?"}
    Q2 -->|Yes| FewShot["Use few-shot examples\nto demonstrate the\nexact desired pattern"]
    Q2 -->|"No -- straightforward,\nwell-understood task"| ZeroShot["Zero-shot prompting\nlikely suffices"]
~~~

### Structuring system prompts deliberately

A senior practitioner uses the system prompt specifically for PERSISTENT, application-level behavior (persona, tone, output format constraints, safety guardrails), keeping it separate from the actual per-request user content — this separation, directly supported by modern LLM APIs, provides a cleaner, more maintainable way to establish consistent application behavior.

### Building reusable, testable prompt templates

~~~mermaid
flowchart LR
    AdHoc["Ad-hoc, one-off\nprompt for each request"] -.->|"avoid"| Reusable["Reusable prompt\nTEMPLATE with variable\nsubstitution, version-\ncontrolled and testable"]
`,

  "data-flow": `
Tracing a request through a production application using a structured, few-shot prompt template with explicit output-format instructions:

~~~mermaid
sequenceDiagram
    participant App as Application
    participant Template as Prompt Template
    participant LLM as Language Model API
    participant Parser as Output Parser
    participant Result as Structured Result

    App->>Template: fill template with\nrequest-specific variables\n(document text, and others)
    Template->>LLM: complete prompt (system\nprompt + few-shot examples\n+ actual request + format\ninstructions)
    LLM->>Parser: generated text output\n(expected to be valid JSON)
    Parser->>Parser: parse and validate\nagainst expected schema
    alt parsing succeeds
        Parser->>Result: structured, usable result
    else parsing fails
        Parser->>App: retry with a corrective\nprompt, or fall back\nto an error path
    end
~~~

The critical detail: even with careful structured-output prompting, a production application should explicitly handle the case where the model's output DOESN'T conform to the expected format — directly connecting to this platform's later **Guardrails** skill's own treatment of validating and constraining LLM output before it's trusted by downstream systems.
`,

  "production-usage": `
### A representative few-shot, structured-output prompt template

~~~python
SYSTEM_PROMPT = """You are a customer support ticket classifier.
Classify each ticket into exactly one category: billing, technical, or account.
Respond ONLY with valid JSON: {"category": string, "confidence": number}"""

FEW_SHOT_EXAMPLES = """
Ticket: "I was charged twice this month." -> {"category": "billing", "confidence": 0.95}
Ticket: "The app crashes when I upload a photo." -> {"category": "technical", "confidence": 0.9}
"""

def classify_ticket(ticket_text):
    prompt = f"{FEW_SHOT_EXAMPLES}\\nTicket: \\"{ticket_text}\\" ->"
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": SYSTEM_PROMPT},
                  {"role": "user", "content": prompt}],
        temperature=0,
    )
    return json.loads(response.choices[0].message.content)
~~~

### Non-negotiables for production prompt engineering

1. **Use few-shot examples for tasks with a genuinely ambiguous or unusual expected output format**, rather than relying on instructions alone.
2. **Use chain-of-thought prompting for genuine multi-step reasoning tasks**, directly connecting to the mechanistic explanation covered above.
3. **Use explicit structured-output instructions (or a dedicated JSON mode API feature)** for output that must be reliably machine-parseable.
4. **Handle output-format failures explicitly**, never assuming the model will always perfectly conform to requested formatting.
5. **Version-control and systematically test prompt templates**, treating them as genuine application code, not disposable, ad-hoc text.

### Common production patterns

- **System prompts establishing persistent persona, tone, and safety constraints**, separate from per-request user content.
- **Few-shot examples embedded in reusable prompt templates**, rather than hand-crafted per request.
- **Chain-of-thought triggers** for tasks genuinely requiring multi-step reasoning.
- **Structured output validation with explicit retry/fallback logic** for handling occasional format non-compliance.
`,

  "industry-examples": `
- **OpenAI's and Anthropic's official prompt engineering guides**: widely-referenced, practical documentation covering few-shot, chain-of-thought, and structured output techniques for their respective models.
- **ReAct-based agent frameworks**: directly build on chain-of-thought-plus-tool-use prompting, foreshadowing the platform's later AI Agents category (LangChain, LangGraph, and others).
- **Customer support and content moderation systems**: widely use few-shot, structured-output prompting for reliable, consistent classification and routing tasks.
- **Code generation tools** (GitHub Copilot, and others): rely heavily on carefully-engineered system prompts and context construction to produce reliable, contextually-appropriate code suggestions.
`,

  "best-practices": `
1. **Use few-shot examples for genuinely ambiguous or unusual expected output formats.**
2. **Use chain-of-thought prompting for tasks requiring genuine multi-step reasoning.**
3. **Use explicit structured-output instructions or a dedicated JSON mode** for machine-parseable output.
4. **Separate persistent behavioral instructions (system prompt) from per-request content (user messages).**
5. **Use clear delimiters** to separate instructions from the content being operated on.
6. **Handle output-format failures explicitly**, with retry or fallback logic, never assuming perfect compliance.
7. **Version-control and systematically test prompt templates**, treating them as genuine, testable application code.
8. **Consider self-consistency (multiple sampled reasoning paths, majority vote)** for genuinely high-stakes reasoning tasks where the added cost is justified.
`,

  "anti-patterns": `
### Vague, underspecified instructions for a genuinely ambiguous task

~~~
# WRONG — "Summarize this." (no length, focus, or format
# guidance, leaving the model to guess at genuinely important
# unstated requirements)
# RIGHT — "Summarize this document in exactly 3 sentences,
# focusing specifically on financial implications, written
# for a non-technical audience."
~~~

### Relying on instructions alone for a genuinely unusual output format

~~~
# WRONG — asking for a specific, unusual output structure via
# instructions alone, with no examples, risking inconsistent
# compliance across different inputs
# RIGHT — provide 2-3 few-shot examples directly demonstrating
# the exact desired output format
~~~

### Assuming a model will always perfectly comply with a requested format

~~~python
# WRONG — no error handling if the model's output isn't
# valid JSON, causing an unhandled exception in production
result = json.loads(response.text)  # can raise if malformed

# RIGHT — handle parsing failures explicitly
try:
    result = json.loads(response.text)
except json.JSONDecodeError:
    result = retry_with_corrective_prompt(response.text)
~~~

### Other production-grade anti-patterns

- **Using chain-of-thought for genuinely simple, direct tasks**, adding unnecessary latency/cost with no meaningful accuracy benefit.
- **Not version-controlling prompt templates**, losing track of what specific prompt produced a given historical result.
- **Mixing instructions and content without clear delimiters**, risking the model misinterpreting part of the content as an instruction.
`,

  performance: `
### Rule zero: prompt engineering is almost always the cheapest, fastest lever to try before reaching for fine-tuning

Iterating on a prompt takes seconds to minutes and costs nothing beyond API calls; fine-tuning (covered in the next skill) takes considerably longer and costs meaningfully more — always exhaust reasonable prompt engineering approaches first.

### The performance hierarchy (apply in order)

1. **Start with a clear, well-specified zero-shot prompt**, establishing a baseline before adding complexity.
2. **Add few-shot examples** if the task's expected output format is genuinely ambiguous or the zero-shot baseline underperforms.
3. **Add chain-of-thought prompting** specifically for tasks requiring genuine multi-step reasoning.
4. **Consider self-consistency (multiple sampled responses, majority vote)** for genuinely high-stakes tasks where the added latency/cost is justified.
5. **Only move to fine-tuning** (covered in the next skill) once prompt engineering approaches have been genuinely exhausted and still fall short.

### Micro-level facts worth knowing

- Chain-of-thought prompting increases both latency and token cost (since the model generates additional reasoning tokens before its final answer), a genuine, deliberate tradeoff for improved accuracy on tasks that need it.
- Few-shot examples consume context window budget (directly connecting to the **LLM Fundamentals** skill), meaning there's a genuine tradeoff between the number of examples included and the remaining budget for actual task content.
- Self-consistency's majority-vote approach requires multiple independent model calls, multiplying cost and latency proportionally — a deliberate tradeoff reserved for genuinely high-stakes reasoning tasks.
`,

  scalability: `
Prompt engineering's core value proposition is precisely that it scales a single, unchanged model's usefulness across an enormous range of tasks, without requiring a separate fine-tuned model per task.

### How prompt engineering scales across many different tasks

~~~mermaid
flowchart LR
    SingleModel["A single, pretrained\nlanguage model"] --> ManyPrompts["Many DIFFERENT,\ncarefully-engineered\nprompts"]
    ManyPrompts --> ManyTasks["Effectively serves an\nenormous range of\ndistinct tasks, with NO\nseparate fine-tuning\nrequired per task"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Prompt engineering alone insufficient for a task requiring deep, consistent behavioral change at scale | Consider fine-tuning (covered in the next skill) |
| Context window budget limiting the number of few-shot examples that fit | Consider retrieval-augmented example selection, or fine-tuning if the task genuinely requires more examples than fit |
| Chain-of-thought's added latency/cost unacceptable for a high-throughput application | Reserve chain-of-thought specifically for genuinely complex reasoning steps, using simpler zero-shot prompting elsewhere |
| Prompt sensitivity causing inconsistent quality across similar inputs | Systematic evaluation (covered in the platform's later **Evaluation** skill) to identify and address genuinely fragile prompt phrasing |
`,

  security: `
### Prompt injection: a genuine, LLM-specific security concern

~~~
Because a model's behavior is entirely shaped by its INPUT
TEXT, an attacker can potentially craft malicious input
specifically designed to override or subvert an application's
intended system prompt/instructions -- directly connecting to
the platform's later Prompt Injection Defense skill, a
genuinely significant, LLM-specific security concern distinct
from traditional injection attacks (SQL injection, XSS,
covered in the Security category).
~~~

### Essential prompt-engineering-related security practices

1. **Use clear delimiters separating instructions from user-provided content**, reducing (though not eliminating) the risk of content being misinterpreted as an instruction.
2. **Never rely on prompt instructions alone for genuinely security-critical constraints** — combine with output validation and guardrails (covered in the platform's later **Guardrails** skill).
3. **Validate and sanitize any user-provided content included in a prompt**, treating it as untrusted, directly reusing general input-validation guidance from the **OWASP Top 10** skill.

See the platform's later **Prompt Injection Defense** and **Guardrails** skills for the dedicated, in-depth treatment of these LLM-specific security concerns.
`,

  testing: `
### Testing prompt template output correctness

~~~python
def test_classification_prompt_returns_valid_json():
    result = classify_ticket("I was charged twice this month.")
    assert "category" in result and "confidence" in result
    assert result["category"] in ["billing", "technical", "account"]
~~~

### Testing chain-of-thought's actual accuracy improvement

~~~python
def test_chain_of_thought_improves_math_accuracy():
    zero_shot_accuracy = evaluate(math_problems, prompt_style="direct")
    cot_accuracy = evaluate(math_problems, prompt_style="chain_of_thought")
    assert cot_accuracy > zero_shot_accuracy
~~~

### The senior testing doctrine

- Test prompt templates against a representative sample of genuinely varied inputs, not just a single, favorable example.
- Test that structured-output prompts genuinely produce parseable output across a range of inputs, including edge cases.
- Systematically compare prompting strategies (zero-shot, few-shot, chain-of-thought) empirically for a given task, rather than assuming a specific technique's benefit without measurement.
- Test explicit handling of output-format failures, verifying graceful fallback rather than an unhandled exception.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check the exact prompt actually sent to the model** first when output seems unexpectedly wrong, verifying template variable substitution occurred correctly.
2. **Check whether few-shot examples genuinely demonstrate the exact desired pattern** if output format is inconsistent.
3. **Check whether the task genuinely requires chain-of-thought** if a multi-step reasoning task's accuracy seems poor.
4. **Check for prompt sensitivity** (minor phrasing changes producing meaningfully different results) if output quality seems surprisingly inconsistent across similar inputs.

### Debugging common prompt-engineering-related symptoms

- "Output format is inconsistent across similar requests" — add or improve few-shot examples demonstrating the exact desired format.
- "Multi-step reasoning tasks produce incorrect answers" — add chain-of-thought prompting (even a simple "let's think step by step" trigger).
- "Model output seems to ignore part of the instructions" — check for overly long, unclear, or poorly-structured prompts; consider clearer delimiters and more explicit instructions.
- "Structured output occasionally fails to parse" — add explicit retry logic with a corrective prompt, or use a dedicated JSON mode API feature if available.
`,

  monitoring: `
### Key signals to track

- **Output format compliance rate** (the fraction of responses that successfully parse against an expected schema), a direct signal of structured-output prompting reliability.
- **Task-specific accuracy/quality metrics** (directly connecting to the platform's later **Evaluation** skill), tracked across prompt template versions.
- **Token usage and latency per request**, particularly relevant for chain-of-thought and self-consistency approaches that add generation cost.

### Tools

Prompt versioning and experiment tracking tools (directly connecting to the platform's later **Prompt Versioning** skill); standard application logging capturing the exact prompt sent and response received for debugging; systematic evaluation harnesses (covered in the **Evaluation** skill) for comparing prompt variations.

### Alerting priorities

Alert on a significant drop in output format compliance rate (a leading indicator of a prompt template regression or an underlying model change), and on task-specific quality metrics degrading below an acceptable threshold.
`,

  deployment: `
### A representative prompt template deployment pattern

~~~python
# Prompt templates stored as version-controlled configuration,
# not hard-coded inline strings scattered throughout the codebase
from prompts import load_template

template = load_template("ticket_classifier", version="v3")
prompt = template.render(ticket_text=ticket_text)
~~~

### CI/CD pipeline considerations

Treat prompt template changes as genuine, version-controlled application changes, with automated evaluation against a representative test set as a deployment gate before a new prompt version replaces the current production template — directly connecting to the platform's later **Prompt Versioning** skill. See the **CI/CD** skill for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production prompt-engineered application takes real traffic:

- [ ] Few-shot examples included for any task with a genuinely ambiguous or unusual expected output format
- [ ] Chain-of-thought prompting used for tasks genuinely requiring multi-step reasoning
- [ ] Structured-output instructions (or a dedicated JSON mode feature) used for machine-parseable output requirements
- [ ] System prompt and user message content clearly, deliberately separated
- [ ] Explicit output-format failure handling in place (retry or fallback), never assuming perfect compliance
- [ ] Prompt templates version-controlled and systematically tested against representative inputs
- [ ] Clear delimiters used to separate instructions from user-provided content, mitigating (not eliminating) prompt injection risk
`,

  "common-mistakes": `
1. **Vague, underspecified instructions for a genuinely ambiguous task**, leaving important requirements unstated.
2. **Relying on instructions alone for an unusual output format**, without few-shot examples demonstrating it.
3. **Assuming a model will always perfectly comply with a requested format**, without explicit failure handling.
4. **Using chain-of-thought for genuinely simple tasks**, adding unnecessary latency/cost.
5. **Not version-controlling prompt templates**, losing track of what produced a given historical result.
6. **Mixing instructions and content without clear delimiters**, risking misinterpretation.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Output format inconsistent across similar requests | Missing or insufficient few-shot examples | Add clear examples demonstrating the exact desired format |
| Multi-step reasoning tasks produce wrong answers | No chain-of-thought prompting used | Add a chain-of-thought trigger or explicit reasoning instruction |
| Structured output occasionally fails to parse | No explicit handling for format non-compliance | Add retry logic with a corrective prompt, or use a dedicated JSON mode feature |
| Model output seems to ignore instructions | Overly long, unclear, or poorly-delimited prompt | Clarify instructions, use explicit delimiters, simplify where possible |
| Output quality inconsistent across seemingly similar inputs | Prompt sensitivity to minor phrasing/formatting differences | Systematically evaluate and refine the specific fragile phrasing |
| Unexpectedly high latency/cost | Chain-of-thought or self-consistency used for a task that doesn't genuinely need it | Reserve these techniques for genuinely complex reasoning tasks |
`,

  faqs: `
**What's the difference between zero-shot and few-shot prompting?**
Zero-shot asks the model to perform a task directly with no examples; few-shot provides example input-output pairs directly in the prompt, demonstrating the desired pattern — generally improving reliability for tasks with an ambiguous or unusual expected format.

**Why does chain-of-thought prompting improve accuracy on reasoning tasks?**
Because a model generates text autoregressively, with each token conditioned on all previous tokens — explicitly generating intermediate reasoning steps gives the model additional "computation," externalized as generated tokens, to build toward a correct final answer, rather than needing to compute a complex answer in one immediate leap.

**What is a system prompt, and how does it differ from a user message?**
The system prompt establishes persistent, application-level behavior (persona, tone, constraints) for an entire conversation; user messages represent the actual, turn-by-turn conversation content — this separation lets an application maintain consistent behavior independent of specific user input.

**How do I reliably get JSON or other structured output from an LLM?**
Use explicit instructions specifying the exact expected schema, ideally combined with a dedicated "JSON mode" or "structured output" API feature where available, and always handle the case where output fails to parse as expected.

**When should I use prompt engineering versus fine-tuning?**
Prompt engineering should be the first, lowest-cost approach tried for most tasks; fine-tuning (covered in the next skill) becomes appropriate specifically when prompting genuinely can't achieve the needed reliability at scale, when the task requires deep domain knowledge poorly represented in general training data, or when context window constraints prevent including sufficient examples/instructions.

**What is self-consistency, and when is it worth the added cost?**
Generating multiple independent chain-of-thought responses and taking the majority-vote final answer, often more accurate than a single response — worth the added cost (multiple model calls) specifically for genuinely high-stakes reasoning tasks where the accuracy improvement justifies the expense.
`,

  "interview-questions": `
### Junior level

1. **What is prompt engineering?**
   Model answer: the discipline of deliberately designing the input text given to an LLM to reliably elicit desired behavior, without retraining or fine-tuning the model.

2. **What is few-shot prompting?**
   Model answer: including example input-output pairs directly in the prompt, demonstrating the desired pattern, before the actual task request.

3. **What is chain-of-thought prompting?**
   Model answer: explicitly prompting a model to show step-by-step reasoning before producing a final answer, improving accuracy on multi-step reasoning tasks.

4. **What is a system prompt?**
   Model answer: a persistent, application-level instruction establishing behavior/persona/constraints for an entire conversation, distinct from per-turn user messages.

### Senior level

5. **Explain mechanistically why chain-of-thought prompting improves accuracy, connecting this directly to how autoregressive Transformers generate text.**
   Model answer: a decoder-only Transformer generates each new token conditioned on ALL previously generated tokens via causal self-attention (directly connecting to the **Transformers** skill); if a model is asked to produce a final answer to a genuinely multi-step problem IMMEDIATELY, it effectively has only the computation available within a single forward pass to arrive at a potentially complex answer, with no way to "revise" or build on intermediate work; chain-of-thought prompting lets the model instead generate intermediate reasoning steps as actual tokens, which then become part of the CONTEXT informing subsequent token generation — this externalizes the model's "working," letting later tokens (including the final answer) directly attend to and build on this explicit intermediate reasoning, effectively giving the model additional "thinking" opportunities distributed across multiple generation steps rather than requiring the entire multi-step computation to happen implicitly within a single step.

6. **A team's structured-output prompt for extracting data into JSON occasionally produces malformed output that fails to parse in production. How would you diagnose and address this?**
   Model answer: first, verify whether the application is using a dedicated "JSON mode" or structured-output API feature if the model provider offers one — this provides a genuinely stronger guarantee of schema conformance than instruction-based prompting alone, since it directly constrains the model's generation rather than merely requesting a format; if such a feature isn't available or isn't being used, strengthen the prompt with explicit, unambiguous formatting instructions and 2-3 few-shot examples directly demonstrating the exact expected JSON structure, including how edge cases (missing fields, unusual input) should be handled; regardless of these improvements, ALWAYS implement explicit error handling for parsing failures in production — never assume perfect compliance — implementing a retry-with-corrective-prompt strategy (feeding the malformed output back to the model along with an explicit note about the parsing error, asking it to correct the format) as a practical, effective fallback for the residual cases where even a well-engineered prompt occasionally fails to produce valid output.

7. **Explain self-consistency prompting, and design a decision framework for when its added cost is justified for a specific application.**
   Model answer: self-consistency generates MULTIPLE independent chain-of-thought responses to the same prompt (via sampling with non-zero temperature, ensuring genuine diversity across the samples) and takes the majority-vote final answer across all of them, generally achieving meaningfully higher accuracy than any single chain-of-thought response alone, since errors in any individual reasoning path are less likely to be replicated consistently across multiple independent attempts; the added cost is a direct multiple of the number of samples generated (e.g., 5 samples means roughly 5x the token cost and latency of a single response); this tradeoff is justified specifically for GENUINELY HIGH-STAKES tasks where the accuracy improvement has real, quantifiable value exceeding the added cost — a medical diagnosis support tool, a financial calculation feeding an important business decision, or a legal document analysis task, for instance — but is generally NOT justified for high-volume, lower-stakes tasks (casual chatbot responses, simple classification) where the added latency/cost per request, multiplied across a large request volume, would represent a substantial expense for a comparatively modest accuracy gain.

8. **Compare providing few-shot examples versus fine-tuning a model on the same set of examples, explaining the genuine tradeoffs of each approach.**
   Model answer: few-shot examples included directly in the prompt cost NOTHING beyond the additional token usage/context-window budget they consume for EVERY single request, and can be changed instantly (simply editing the prompt template) with no separate training process required at all, making iteration extremely fast and low-cost; however, they're limited by context window size (only so many examples can practically fit alongside the actual task content) and must be re-processed by the model on every single request, adding some per-request latency/cost; fine-tuning (covered in the next skill) instead updates the model's actual WEIGHTS based on a training set of examples, meaning the learned pattern becomes a permanent part of the model itself, requiring NO per-request context-window budget for examples at inference time, and can potentially learn from a MUCH larger set of examples than could ever fit in a single prompt — but this comes at the cost of a genuinely more expensive, slower training process, the operational complexity of managing a custom fine-tuned model, and reduced flexibility (changing the desired behavior requires re-fine-tuning, rather than simply editing a prompt); the right choice depends on the actual example-set size, how frequently the desired behavior needs to change, and whether the per-request context-window cost of few-shot examples is acceptable at the application's actual production scale.

9. **A prompt that reliably works well in initial testing starts producing noticeably lower-quality output when deployed to production, handling genuinely diverse real-world user input. What would you investigate?**
   Model answer: this pattern strongly suggests the INITIAL TESTING SET wasn't sufficiently representative of the actual diversity of real-world production input — prompt engineering, and few-shot examples specifically, can be surprisingly sensitive to how well the demonstrated examples and instructions actually generalize to inputs that differ meaningfully from what was tested; investigate by collecting a genuinely representative sample of actual production inputs (particularly ones producing lower-quality output) and systematically comparing them against the original test set's characteristics — are production inputs longer, shorter, in a different language, using different terminology, or structured differently than the test examples the prompt was originally validated against? Based on this analysis, the fix typically involves either broadening the few-shot examples to better cover the actual diversity of production input, adding more explicit, general instructions covering edge cases the original examples didn't anticipate, or in some cases recognizing that the task's genuine diversity exceeds what a small number of few-shot examples can reasonably cover, motivating a shift toward fine-tuning (covered in the next skill) on a larger, more genuinely representative dataset.

10. **Design a prompt engineering strategy for a multi-step customer support workflow that needs to (a) classify the incoming request, (b) extract relevant structured details, and (c) generate an appropriate response, all reliably and consistently.**
    Model answer: rather than attempting a single, monolithic prompt handling all three steps simultaneously (risking the model conflating or inconsistently handling the genuinely distinct sub-tasks), decompose this into a PIPELINE of separate, focused prompts, each optimized for its specific sub-task: (1) a classification prompt using few-shot examples and low temperature, producing a structured category label with high consistency; (2) an extraction prompt using structured-output/JSON-mode instructions specifically tailored to the fields relevant for the classified category (potentially different extraction schemas per category, informed by step 1's output); (3) a response-generation prompt using the classified category and extracted details as explicit context, potentially with a higher temperature if some natural, varied phrasing in the final customer-facing response is genuinely desirable, while still using a system prompt establishing consistent tone/persona; each of these three prompts should be independently version-controlled, tested, and evaluated (directly connecting to the platform's later **Prompt Versioning** and **Evaluation** skills), since decomposing the workflow this way lets each step be independently debugged, improved, and evaluated without needing to disentangle interacting effects from a single, overly-complex combined prompt.
`,

  "coding-questions": `
### 1. Implement a few-shot prompt template builder

~~~python
def build_few_shot_prompt(examples, new_input, task_description):
    prompt = f"{task_description}\\n\\n"
    for example_input, example_output in examples:
        prompt += f"Input: {example_input}\\nOutput: {example_output}\\n\\n"
    prompt += f"Input: {new_input}\\nOutput:"
    return prompt
# Follow-up: why might the ORDER of the few-shot examples in
# the prompt (not just their content) sometimes affect the
# model's output, and what practical mitigation could you
# apply if this is observed?
~~~

### 2. Implement a self-consistency majority-vote function

~~~python
from collections import Counter

def self_consistency_answer(prompt, model_call_fn, num_samples=5):
    answers = [model_call_fn(prompt, temperature=0.7) for _ in range(num_samples)]
    extracted_answers = [extract_final_answer(a) for a in answers]
    most_common = Counter(extracted_answers).most_common(1)
    return most_common[0][0]
# Follow-up: what happens if the num_samples answers are
# roughly evenly split among several different values (no
# clear majority) -- what does this suggest about the model's
# genuine confidence/reliability for this specific input,
# and how might you handle this case?
~~~

### 3. Implement a structured-output parser with retry logic

~~~python
import json

def extract_json_with_retry(model_call_fn, prompt, max_retries=2):
    for attempt in range(max_retries + 1):
        response_text = model_call_fn(prompt)
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            if attempt < max_retries:
                prompt = f"{prompt}\\n\\nYour previous response was not valid JSON: {response_text}\\nPlease respond with ONLY valid JSON."
            else:
                raise
# Follow-up: why is it important to include the model's
# ACTUAL previous (malformed) response in the corrective
# retry prompt, rather than simply repeating the original
# instructions unchanged?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Compare zero-shot and few-shot prompting on a classification task
Using an LLM API, compare zero-shot and few-shot prompting for a text classification task, measuring accuracy and output-format consistency for each approach. Deliverable: a documented comparison. Skills exercised: basic prompting strategy comparison.

### Lab 2 (Intermediate): Measure chain-of-thought's effect on multi-step reasoning accuracy
Using a set of multi-step math or logic problems, compare direct-answer prompting against chain-of-thought prompting, measuring the resulting accuracy difference. Deliverable: a documented accuracy comparison. Skills exercised: chain-of-thought evaluation.

### Lab 3 (Advanced): Build and test a structured-output extraction pipeline with retry logic
Build a prompt-based data extraction pipeline producing structured JSON output, implement retry logic for handling occasional format failures, and test it against a range of genuinely varied inputs. Deliverable: a working, tested extraction pipeline. Skills exercised: structured-output prompting and error handling.

### Lab 4 (Production): Design and implement a multi-step prompt pipeline for a realistic workflow
Given a described multi-step task (classification, extraction, response generation), design and implement a decomposed prompt pipeline with independently version-controlled and tested prompts for each step. Deliverable: a documented, working multi-step pipeline. Skills exercised: applied prompt pipeline design.
`,

  "real-projects": `
### 1. A customer support ticket classification and routing system
Engineering requirements: few-shot, structured-output prompting for reliable classification, with explicit output-validation and retry logic.

### 2. A multi-step reasoning assistant using chain-of-thought and self-consistency
Engineering requirements: chain-of-thought prompting for complex problem-solving, with self-consistency majority-voting for genuinely high-stakes queries.

### 3. A versioned, tested prompt template library
Engineering requirements: reusable, version-controlled prompt templates with systematic evaluation against representative test sets, directly connecting to the platform's later Prompt Versioning skill.
`,

  "case-studies": `
### GPT-3's demonstration of prompting as a genuinely new paradigm
GPT-3's 2020 release directly demonstrated that a single, unchanged pretrained model could perform an enormous range of tasks purely through carefully-crafted prompts, with no task-specific fine-tuning at all — a genuinely new paradigm that rapidly reshaped how the industry thought about deploying and using large language models. Lesson: a sufficiently large, well-trained model can make an entirely new mode of interaction (prompting, rather than training) practically viable, fundamentally changing the economics and accessibility of building on top of that model.

### Chain-of-thought prompting's rigorous empirical validation
Wei et al.'s 2022 chain-of-thought paper didn't just propose a clever prompting trick — it rigorously, empirically demonstrated dramatic, reproducible accuracy improvements on standardized reasoning benchmarks, directly connecting this observed improvement to genuine, mechanistic reasoning about how autoregressive generation works. Lesson: a prompting technique's credibility and widespread adoption benefits enormously from rigorous empirical validation against standardized benchmarks, not just anecdotal, informal demonstration.

### The rapid standardization of structured output/JSON mode across LLM providers
The relatively rapid, near-universal adoption of dedicated "JSON mode" or structured-output features across major LLM API providers directly reflects the industry's recognition that reliable, machine-parseable output is a genuinely common, critical production need — moving this capability from a fragile, instruction-based best-effort into a directly-supported, more reliable API feature. Lesson: when a large enough fraction of an ecosystem's practitioners independently discover the same practical need (reliable structured output), providers often respond by directly, natively supporting that need as a first-class feature, rather than leaving it to be solved entirely through prompt engineering alone.
`,

  comparisons: `
| Aspect | Zero-Shot Prompting | Few-Shot Prompting |
|--------|--------------------------|--------------------------|
| Examples provided | None | 2 or more input-output pairs |
| Best fit | Straightforward, well-understood tasks | Tasks with an ambiguous or unusual expected format |
| Context window cost | Lower | Higher (examples consume budget) |

| Aspect | Direct Answer Prompting | Chain-of-Thought Prompting |
|--------|------------------------------|----------------------------------|
| Reasoning shown | No — jumps directly to an answer | Yes — explicit intermediate steps |
| Best fit | Simple, direct tasks | Multi-step reasoning, math, logic |
| Cost | Lower (fewer generated tokens) | Higher (additional reasoning tokens) |

**How seniors choose**: start with a clear zero-shot prompt as a baseline; add few-shot examples for ambiguous output formats; add chain-of-thought specifically for genuine multi-step reasoning tasks; reserve self-consistency for genuinely high-stakes cases where its added cost is clearly justified.
`,

  "related-technologies": `
- **LLM Fundamentals** — the tokenization, context window, and sampling concepts this page's practical techniques directly build on.
- **Fine-Tuning** — covered next in this category, the more expensive, complex alternative when prompt engineering alone proves insufficient.
- **Prompt Versioning** (platform's later category) — the operational discipline of managing prompt templates systematically in production.
- **AI Agents** category (LangChain, LangGraph, and others) — directly builds on ReAct-style reasoning-plus-action prompting patterns.
- **Guardrails** — where structured-output validation and safety constraints are covered in further depth.

Learning path: **LLM Fundamentals** → this page (Prompt Engineering) → **Fine-Tuning** → the remaining skills in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Structured output / JSON mode features have become standard, widely-supported across essentially all major LLM API providers.
- Continued industry emphasis on systematic prompt evaluation and versioning as standard, expected engineering practice, rather than ad-hoc, informal iteration.
- Continued growth of ReAct-style and agentic prompting patterns as the foundation for the broader AI Agents ecosystem.
- Given continued evolution in this space, verify current best-practice prompting techniques and specific API features against up-to-date provider documentation.
`,

  "future-roadmap": `
Where prompt engineering is heading, and what's worth betting career time on:

- **Continued standardization of structured-output and other reliability-focused API features**, reducing reliance on instruction-based prompting alone for critical formatting requirements.
- **Continued growth of agentic, tool-using prompting patterns** as the foundation for increasingly sophisticated AI agent systems.
- **Continued emphasis on systematic, rigorous prompt evaluation** as a standard engineering practice, directly connecting to the platform's Evaluation skill.
- **What to bet on**: deeply understanding WHY specific prompting techniques work (the mechanistic connection to autoregressive generation, few-shot pattern demonstration) — this transfers directly to designing effective prompts for entirely new tasks and models, a far more durable investment than memorizing any single, currently-popular prompting trick.
`,

  "cheat-sheet": `
~~~
# ---- Zero-shot vs few-shot ----
Zero-shot: task instruction only, no examples
Few-shot:  2+ example input->output pairs demonstrating
    the EXACT desired pattern/format
~~~

~~~
# ---- Chain-of-thought: why it works ----
Autoregressive gen: each token conditioned on ALL previous
    tokens. CoT externalizes reasoning as generated tokens,
    giving the model "working space" to build toward a
    correct answer, instead of jumping straight there.
Trigger: "Let's think step by step" (works even zero-shot!)
~~~

~~~
# ---- System prompt vs user message ----
System:  PERSISTENT behavior/persona/constraints (whole convo)
User:    per-turn actual conversation content
~~~

~~~
# ---- Structured output ----
Explicit schema instructions + few-shot examples, OR use a
    dedicated JSON-mode API feature (stronger guarantee).
ALWAYS handle parse failures explicitly -- never assume
    perfect compliance.
~~~

~~~
# ---- Self-consistency ----
Sample MULTIPLE independent CoT responses (temp > 0) ->
    majority vote. More accurate, but Nx cost/latency.
    Reserve for genuinely high-stakes reasoning tasks.
~~~

~~~
# ---- Progression: cheapest lever first ----
Zero-shot -> few-shot -> chain-of-thought -> self-consistency
    -> ONLY THEN consider fine-tuning (next skill)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Zero-shot vs few-shot prompting? | Zero-shot: no examples. Few-shot: demonstrate the pattern with examples. |
| Why does chain-of-thought improve accuracy? | Externalizes reasoning as tokens the model can condition on, vs one-shot leap to an answer. |
| System prompt vs user message? | System = persistent app behavior. User = per-turn conversation content. |
| Best practice for unreliable JSON output? | Explicit schema + few-shot + dedicated JSON mode + retry on parse failure. |
| What is self-consistency? | Multiple sampled CoT responses, majority vote — more accurate, costs more. |
| What is ReAct prompting? | Interleaves reasoning + tool-use actions + observations. |
| When to use fine-tuning instead of prompting? | Task needs deep consistency at scale, specialized knowledge, or exceeds context budget. |
| Why use delimiters in a prompt? | Separates instructions from content, reducing misinterpretation risk. |
| First lever to try for improving LLM app quality? | Prompt engineering — cheapest, fastest to iterate, before fine-tuning. |
| What triggers zero-shot chain-of-thought? | Simply appending "Let's think step by step." |
`,

  mcqs: `
1. What is few-shot prompting?
   A) Asking the model a question with no context  B) Including example input-output pairs directly in the prompt to demonstrate the desired pattern  C) Training the model on new data  D) Using a smaller model
   **Answer: B** — directly demonstrates the exact expected format/pattern.

2. Why does chain-of-thought prompting improve accuracy on multi-step reasoning tasks?
   A) It makes the model larger  B) It lets the model externalize intermediate reasoning as generated tokens, which then inform subsequent token generation  C) It reduces token usage  D) It disables sampling entirely
   **Answer: B** — a direct, mechanistic consequence of autoregressive generation.

3. What is the difference between a system prompt and a user message?
   A) They are identical  B) The system prompt establishes persistent, application-level behavior; user messages are per-turn conversation content  C) System prompts are always shorter  D) User messages can't contain instructions
   **Answer: B** — a deliberate separation supported by modern LLM APIs.

4. Why should production applications explicitly handle structured-output parsing failures?
   A) They never actually occur  B) A model can still occasionally fail to perfectly conform to a requested format, even with careful prompting  C) JSON parsing is inherently unreliable  D) This is only relevant for classification tasks
   **Answer: B** — never assume perfect compliance; handle failures with retry/fallback logic.

5. What is self-consistency prompting?
   A) Using the same prompt every time  B) Generating multiple independent chain-of-thought responses and taking the majority-vote answer  C) A method for reducing token cost  D) A way to disable temperature
   **Answer: B** — often more accurate than a single response, at a proportional cost increase.
`,

  "revision-notes": `
Prompt engineering is the discipline of deliberately designing an LLM's input text to reliably elicit desired behavior, without retraining or fine-tuning the model — the fastest, lowest-cost lever an AI engineer has for shaping LLM application behavior, and the first approach that should be exhausted before considering the more expensive alternative of **Fine-Tuning** (covered in the next skill).

ZERO-SHOT prompting asks the model to perform a task directly with no examples; FEW-SHOT prompting includes example input-output pairs directly in the prompt, demonstrating the desired pattern — generally improving reliability and format consistency for tasks with a genuinely ambiguous or unusual expected structure, at the cost of consuming additional context window budget (directly connecting to the **LLM Fundamentals** skill).

CHAIN-OF-THOUGHT prompting (Wei et al., 2022) explicitly asks the model to show step-by-step reasoning before producing a final answer, dramatically improving accuracy on tasks requiring multi-step logic or arithmetic. A critical, frequently-tested mechanistic explanation: because a decoder-only Transformer generates each token conditioned on ALL previously generated tokens via causal self-attention, chain-of-thought lets the model EXTERNALIZE its intermediate reasoning as actual generated tokens, which then become part of the context informing subsequent generation — giving the model genuine additional "thinking" distributed across multiple generation steps, rather than requiring a complex multi-step computation to happen implicitly within a single, immediate leap to an answer. Remarkably, even a simple, generic trigger phrase ("Let's think step by step," Kojima et al., 2022) can elicit substantial chain-of-thought-style improvements without any task-specific few-shot examples at all — "zero-shot chain-of-thought."

SYSTEM PROMPTS establish PERSISTENT, application-level behavior (persona, tone, constraints, output format expectations) for an entire conversation, kept deliberately separate from USER MESSAGES representing per-turn conversation content — a clean architectural separation directly supported by modern LLM APIs. STRUCTURED OUTPUT prompting explicitly instructs the model to produce machine-parseable output (commonly JSON), ideally combined with a dedicated "JSON mode" API feature (providing a stronger conformance guarantee than instructions alone) — critically, production applications must ALWAYS explicitly handle the case where output fails to parse as expected, never assuming perfect compliance, typically via retry-with-corrective-prompt logic.

SELF-CONSISTENCY (Wang et al., 2022) generates MULTIPLE independent chain-of-thought responses (via sampling with non-zero temperature) and takes the majority-vote final answer, often meaningfully more accurate than a single response alone, at a directly proportional cost/latency increase — a technique reserved specifically for genuinely high-stakes reasoning tasks where this added expense is clearly justified. REACT (Reason + Act) prompting interleaves explicit reasoning with concrete tool-use actions and their observed results, directly foreshadowing and connecting to the platform's later AI Agents category's own reason-act-observe agent loop.

A senior practitioner follows a clear escalation hierarchy: start with a well-specified zero-shot prompt, add few-shot examples for ambiguous formats, add chain-of-thought for genuine multi-step reasoning, consider self-consistency for genuinely high-stakes cases, and only THEN move to fine-tuning once prompt engineering approaches are genuinely exhausted — always using clear delimiters to separate instructions from user-provided content (both for clarity and as a partial mitigation against prompt injection, covered in depth in the platform's later **Prompt Injection Defense** skill), and always version-controlling and systematically evaluating prompt templates as genuine, testable application code rather than disposable, ad-hoc text.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding zero-shot versus few-shot prompting and basic system prompt usage. Milestone: complete Lab 1, with a documented zero-shot vs few-shot comparison.

**Week 2 — Chain-of-thought mastery**: measuring chain-of-thought's effect on multi-step reasoning accuracy. Milestone: complete Lab 2, with a documented accuracy comparison.

**Week 3 — Structured output and reliability**: building and testing a structured-output extraction pipeline with explicit retry logic. Milestone: complete Lab 3, with a working, tested pipeline.

**Week 4 — Applied pipeline design**: designing a decomposed, multi-step prompt pipeline for a realistic workflow. Milestone: complete Lab 4, with a documented, working implementation.

Next platform skill once this roadmap is complete: **Fine-Tuning**, covering the more expensive, complex alternative when prompt engineering alone proves insufficient.
`,

  "official-docs": `
- **OpenAI's official prompt engineering guide** — a widely-referenced, practical resource covering few-shot, chain-of-thought, and structured output techniques.
- **Anthropic's official prompt engineering documentation** — extensive, practical guidance specific to Claude models.
- **Google's official prompting guide for Gemini models** — covers similar techniques with provider-specific guidance.
`,

  books: `
- **"Prompt Engineering for Generative AI" — James Phoenix and Mike Taylor** — a focused, practical guide to modern prompting techniques.
- **"Natural Language Processing with Transformers" — Tunstall, von Werra, Wolf** — covers prompting within the broader context of Transformer-based NLP.
`,

  blogs: `
- **Lilian Weng's blog on prompt engineering** — exceptionally thorough, technically rigorous coverage of prompting techniques and their research basis.
- **The official OpenAI and Anthropic engineering blogs** — practical, provider-specific prompting guidance and case studies.
- **Prompting Guide (promptingguide.ai)** — a widely-referenced, comprehensive, community-maintained resource covering a broad range of prompting techniques.
`,

  "research-papers": `
- **Brown, T. et al. — "Language Models are Few-Shot Learners"** (2020, the GPT-3 paper) — the foundational demonstration of prompting as a viable paradigm.
- **Wei, J. et al. — "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"** (2022) — the foundational chain-of-thought paper.
- **Kojima, T. et al. — "Large Language Models are Zero-Shot Reasoners"** (2022) — the foundational zero-shot chain-of-thought paper.
- **Wang, X. et al. — "Self-Consistency Improves Chain of Thought Reasoning in Language Models"** (2022) — the foundational self-consistency paper.
- **Yao, S. et al. — "ReAct: Synergizing Reasoning and Acting in Language Models"** (2023) — the foundational ReAct paper.
`,

  videos: `
- **DeepLearning.AI's "ChatGPT Prompt Engineering for Developers" course** — a widely-used, practical introduction to prompt engineering.
- **Conference talks on chain-of-thought and self-consistency research** from major AI labs.
- **Practical prompt engineering tutorials** from OpenAI's and Anthropic's official developer content.
`,

  "github-repos": `
- **openai/openai-cookbook** — the official OpenAI repository with extensive practical prompting examples and techniques.
- **dair-ai/Prompt-Engineering-Guide** — a widely-referenced, comprehensive, community-maintained prompt engineering resource.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Prompting strategy selection**: given a described task, choose and justify zero-shot, few-shot, or chain-of-thought prompting.
2. **Few-shot example design**: given a described ambiguous task, design 2-3 few-shot examples demonstrating the desired output format.
3. **Chain-of-thought application**: given a multi-step reasoning problem, write an effective chain-of-thought prompt.
4. **Structured output design**: given a described data extraction task, design a prompt with explicit schema instructions and retry-handling logic.
5. **External practice sets**: DeepLearning.AI's prompt engineering course exercises for hands-on practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph PromptDesign["Prompt Design Decisions"]
        TaskType["Task Type"] --> ZeroShot["Zero-shot?"]
        TaskType --> FewShot["Few-shot examples?"]
        TaskType --> CoT["Chain-of-thought?"]
    end
    subgraph PromptStructure["Prompt Structure"]
        SystemPrompt["System Prompt\n(persistent behavior)"]
        UserMessage["User Message\n(per-turn content)"]
        Delimiters["Clear Delimiters"]
    end
    subgraph OutputHandling["Output Handling"]
        StructuredOutput["Structured Output\n(JSON mode)"]
        ParseValidate["Parse & Validate"]
        RetryFallback["Retry / Fallback"]
    end
    PromptDesign --> PromptStructure --> OutputHandling
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Prompt Engineering))
    Foundations
      Overview
      History GPT-3 CoT ReAct
      Why it exists
      Problem it solves
    Core Techniques
      Zero shot
      Few shot
      Chain of thought
      Zero shot CoT
    Prompt Structure
      System prompt
      User messages
      Delimiters
      Templates
    Structured Output
      JSON mode
      Schema instructions
      Retry on failure
    Advanced
      Self consistency
      ReAct reason and act
      Prompt sensitivity
      Limits of prompting
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default promptEngineering;
