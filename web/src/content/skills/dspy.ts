import type { SkillContent } from "../types";

/**
 * DSPy — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const dspy: SkillContent = {
  overview: `
DSPy is a Python framework from Stanford NLP for **programming** language model pipelines instead of hand-writing prompt strings. The core idea: instead of crafting a giant prompt with careful wording and hand-picked few-shot examples, you declare WHAT each step of your pipeline should do — its inputs, its outputs, and a natural-language description of the task — and DSPy's optimizers figure out HOW to phrase the actual prompt and which examples to include, evaluated against a metric function you supply.

For an AI engineer, DSPy matters because prompt engineering by hand does not scale. A single well-tuned prompt is fine for a demo. A five-step pipeline (retrieve, rerank, extract, reason, format) with hand-tuned prompts at every step is a maintenance nightmare: change the underlying model and every prompt may need re-tuning; change one step and its downstream prompts may silently degrade. DSPy treats prompts as compiled artifacts, not source code you edit by hand — analogous to how you don't hand-write assembly, you write in a higher-level language and let a compiler target the hardware.

Key characteristics: signatures describe input/output contracts and intent declaratively; modules (Predict, ChainOfThought, ReAct, and others) implement a signature using a specific prompting strategy; programs compose modules into pipelines using ordinary Python control flow; and optimizers (historically called teleprompters) search over instructions and few-shot demonstrations to maximize a metric function on a training set. DSPy is model-agnostic by design — the same program can target different LLM backends, and a metric-driven optimization run can be repeated when you switch models.

It's important to be honest about maturity: DSPy is a fast-moving, research-adjacent open-source project. Module names, optimizer names, and APIs have changed across versions since its 2023 debut, and they may have changed further since this page was last verified. Treat exact class names and method signatures here as illustrative of the DSPY MENTAL MODEL, and always check the installed version's own documentation for exact current API surface.
`,

  history: `
DSPy originated at **Stanford NLP**, led by **Omar Khattab** and **Christopher Potts** (Matei Zaharia and others also contributed as advisors/collaborators), growing out of earlier retrieval-augmented pipeline research. The name originally stood for "Declarative Self-improving Python" (also styled as a play on "programming, not prompting").

| Year | Milestone |
|------|-----------|
| 2022 | Predecessor research on composing retrieval-augmented LM pipelines (the DEMONSTRATE-SEARCH-PREDICT line of work) lays the conceptual groundwork |
| 2023 | DSPy released publicly as an open-source framework, formalizing signatures, modules, and teleprompters/optimizers |
| 2023 | Early optimizers such as bootstrap-few-shot style compilers demonstrate that automatically selected demonstrations can match or beat hand-written prompts |
| 2024 | Framework matures: more modules (ReAct-style agents, retrieval modules), broader optimizer families, growing adoption in RAG and agentic pipelines |
| 2024–2025 | Ecosystem integrations appear (vector store connectors, evaluation tooling) and the API is reworked multiple times as the project stabilizes conventions |
| 2025+ | Continued evolution; check the official repository for the current stable API — this page's code examples illustrate the mental model, not a guaranteed-current API surface |

Note on precision: exact version numbers, module names, and release dates for DSPy have shifted rapidly and this page is not a substitute for reading the changelog of the version you install. This history is accurate to the best of available knowledge as of the author's cutoff and should be spot-checked for anything version-specific.
`,

  "why-it-exists": `
Before DSPy (and still, in most teams today), building an LLM pipeline meant writing prompt strings by hand: a system prompt, careful instructions, a handful of hand-picked few-shot examples, maybe some prompt-engineering tricks (chain-of-thought triggers, output formatting hints). This works for a single call to a single model. It breaks down along three axes:

1. **Brittleness.** A prompt tuned by trial and error against GPT-4 might perform noticeably worse — or better, unpredictably — against Claude or a smaller open-weight model. The tuning effort does not transfer; models respond differently to the same wording, and the underlying "why this phrasing works" is rarely well understood by the person who wrote it.
2. **No compounding for pipelines.** A single prompt is manageable. A five-stage pipeline where each stage's output feeds the next multiplies the tuning burden: change stage 2's prompt and stage 3, 4, 5 may now receive different input distributions, silently breaking downstream behavior no one is testing for.
3. **No systematic feedback loop.** Hand prompt-engineering is usually vibes-based: try a phrasing, eyeball a few outputs, ship it. There's rarely a metric function driving the process, so improvements are not measurable or repeatable.

DSPy exists to replace hand-tuned prompt strings with a compiled program: you write the pipeline's structure and intent in Python, supply a metric that says what "good" output looks like, and let an optimizer search the space of instructions and demonstrations. This is directly analogous to the shift from hand-tuned assembly to compiled high-level languages — you describe intent, a compiler targets the specific "hardware" (the specific LLM).
`,

  "problem-it-solves": `
Concrete pains DSPy removes:

- **Manual prompt babysitting.** No more hand-editing a wall of prompt text every time a model update changes behavior. Re-run the optimizer instead.
- **Non-portable prompts.** A prompt tuned for one model's quirks does not need a rewrite from scratch for a different model — recompile the same program against the new model.
- **Untested pipelines.** Because DSPy optimization REQUIRES a metric function and a small labeled/scored dataset, it forces evaluation discipline that ad hoc prompting skips (see the **AI Evals** skill for how to design that metric).
- **Multi-step prompt drift.** In a composed program, each module's signature is a stable contract; changing one module doesn't silently rewrite another's prompt behind your back the way copy-pasted prompt strings do.
- **Guesswork about few-shot examples.** Instead of a developer manually picking 3 examples that "feel representative," bootstrap-style optimizers select and validate examples empirically against the metric.

What DSPy deliberately does **NOT** solve:

- It does not eliminate the need to understand how LLMs respond to prompts — you still need to design a sensible signature (the right input/output fields and task description) and a meaningful metric. Garbage signature or garbage metric in, garbage compiled program out.
- It does not replace fine-tuning. DSPy optimizes prompts and few-shot examples against a FROZEN model; it does not change model weights (see the **Fine-Tuning** skill for the weight-updating alternative and when that lever is the right one instead).
- It does not remove the need for production engineering: latency, cost, caching, retries, and monitoring around the compiled program are still your responsibility.
- It is not a silver bullet for tasks with no reliable metric — if you cannot define "better," DSPy's optimizers have nothing to climb.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the DSPy philosophy — "programming, not prompting" — and articulate what a signature actually declares versus what a hand-written prompt string declares.
2. Write DSPy signatures for a task, choosing sensible input and output fields and a clear task description.
3. Choose between core modules (a direct-prediction module versus a reasoning module versus an agentic/tool-using module) based on task difficulty.
4. Compose multiple modules into a multi-step program using ordinary Python control flow.
5. Write a metric function suitable for driving a DSPy optimizer, and explain why this is the same discipline the AI Evals skill teaches.
6. Describe conceptually what happens when an optimizer/compiler runs: what it searches over, what it needs as input, and what it returns.
7. Explain why a DSPy-compiled program is more portable across models than a hand-tuned prompt, and what "recompiling for a new model" means in practice.
8. Distinguish DSPy's approach from traditional prompt engineering, from fine-tuning, and from manual prompt-versioning workflows.
9. Identify where DSPy fits in a production system and what surrounding infrastructure (versioning, monitoring, caching) it still requires.
10. Recognize DSPy's current maturity level and know to verify version-specific API details before writing production code.
`,

  prerequisites: `
- **Required**: solid Python fluency (functions, classes, basic async is helpful) — see the **Python** skill. Familiarity with calling an LLM API (chat messages, system/user roles) is assumed.
- **Required**: a working understanding of what a prompt is and why wording affects LLM output — see the **Prompt Engineering** skill first if you have never manually iterated on a prompt. DSPy automates a search process that only makes sense once you've felt the pain it's automating.
- **Strongly recommended**: basic evaluation literacy — what a metric function is, what a labeled/scored dataset is for — see the **AI Evals** skill. DSPy optimization is impossible without a metric, so this is not optional in practice.
- **Helpful**: exposure to retrieval-augmented generation concepts (retriever, top-k documents, context stuffing) since many DSPy examples (including this page's worked example) are retrieve-then-answer pipelines. See the **LlamaIndex** skill for the retrieval side in depth.
- **Helpful, not required**: familiarity with the general idea of hyperparameter search or AutoML — DSPy's optimizers are conceptually a search process over prompts/examples rather than over numeric hyperparameters, but the mental model of "define a search space, define a scoring function, let an algorithm search" transfers directly.

Dependency chain on this platform: **Python** → **Prompt Engineering** → **AI Evals** → **DSPy** → **Fine-Tuning** / **Prompt Versioning** for what comes after you have a compiled program in production.
`,

  "beginner-concepts": `
### The core idea in one example

Traditional prompting means writing something like this by hand and iterating on the wording until it "feels" reliable:

~~~text
You are a helpful assistant. Given a question and some context,
answer concisely in one sentence. Think step by step but only
output the final answer. Here are two examples: ...
Question: {question}
Context: {context}
Answer:
~~~

DSPy instead asks you to declare the INTENT of this step as a signature — inputs, outputs, and a short description — and leaves prompt wording to the framework.

### Signatures

A signature is a contract: given these input fields, produce these output fields, doing roughly this task. The simplest way to write one is an inline string shorthand; the more explicit way is a small class.

~~~python
import dspy

# Inline shorthand signature: "inputs -> outputs"
qa_signature = "question, context -> answer"

# More explicit, class-based signature with descriptions
class AnswerQuestion(dspy.Signature):
    "Answer the question using only the provided context. Be concise."

    question: str = dspy.InputField()
    context: str = dspy.InputField(desc="retrieved passages relevant to the question")
    answer: str = dspy.OutputField(desc="a one-sentence answer")
~~~

Notice what is absent: no prompt wording, no "think step by step," no hand-written few-shot examples. That is the point — those choices are left to a module and, later, an optimizer.

### Modules: turning a signature into a callable

A module implements a signature using a specific prompting STRATEGY. The simplest is direct prediction; a slightly smarter one asks the model to reason before answering.

~~~python
# Predict: straightforward "given inputs, produce outputs" strategy
predict_answer = dspy.Predict(AnswerQuestion)

# ChainOfThought: same signature, but the module internally elicits
# a reasoning trace before the final answer (typically improves accuracy
# on tasks requiring multi-step reasoning, at the cost of more tokens)
reason_then_answer = dspy.ChainOfThought(AnswerQuestion)

result = reason_then_answer(
    question="What is the capital of the country north of Mexico?",
    context="Canada shares a long border with the United States, which lies south of it and north of Mexico.",
)
print(result.answer)   # module returns an object with the declared output fields
~~~

Under the hood, calling a module still sends a real prompt to a real LLM — DSPy is generating that prompt from the signature and the module's strategy. You have simply stopped writing that prompt string by hand.

### Programs: composing modules

A program is ordinary Python code that wires modules together — no special DSL, just method calls and control flow.

~~~python
class SimpleQA(dspy.Module):
    def __init__(self):
        super().__init__()
        self.answer = dspy.ChainOfThought(AnswerQuestion)

    def forward(self, question: str, context: str) -> str:
        # Production consideration: guard against empty context so the
        # model is not asked to answer from nothing.
        if not context.strip():
            raise ValueError("context must not be empty for grounded QA")
        return self.answer(question=question, context=context)

qa = SimpleQA()
prediction = qa(question="Who wrote the ABC language?", context="ABC influenced Python; it was designed at CWI.")
~~~

This is DSPy at its most basic: signature (contract), module (strategy), program (composition). Everything else in this page builds on this triangle.
`,

  "intermediate-concepts": `
### Multi-step programs and intermediate signatures

Real pipelines chain several signatures together, where one module's output becomes another's input — the classic example is retrieve-then-answer.

~~~python
class GenerateSearchQuery(dspy.Signature):
    "Turn a user question into a focused search query."
    question: str = dspy.InputField()
    query: str = dspy.OutputField(desc="a short keyword search query")

class AnswerFromContext(dspy.Signature):
    "Answer the question using only the retrieved context. If the context is insufficient, say so explicitly."
    question: str = dspy.InputField()
    context: str = dspy.InputField()
    answer: str = dspy.OutputField()

class RetrieveThenAnswer(dspy.Module):
    def __init__(self, retriever):
        super().__init__()
        self.retriever = retriever                     # e.g. a vector-store wrapper
        self.generate_query = dspy.Predict(GenerateSearchQuery)
        self.answer = dspy.ChainOfThought(AnswerFromContext)

    def forward(self, question: str):
        query = self.generate_query(question=question).query
        # Production consideration: cap retrieved passages and handle
        # empty retrieval results explicitly instead of passing empty context.
        passages = self.retriever(query, k=5)
        if not passages:
            return dspy.Prediction(answer="I don't have enough information to answer that.")
        context = "\\n".join(passages)
        return self.answer(question=question, context=context)
~~~

### Metrics: the thing you cannot skip

An optimizer cannot search for a better program without a way to score outputs. A metric takes an example and a prediction and returns a score (often boolean or a float).

~~~python
def answer_correctness(example, prediction, trace=None) -> bool:
    # Production consideration: normalize whitespace/case so trivial
    # formatting differences don't count as wrong answers.
    gold = example.answer.strip().lower()
    predicted = prediction.answer.strip().lower()
    return gold in predicted or predicted in gold
~~~

This is the exact discipline taught in the **AI Evals** skill: a metric function is a scoring rubric made executable. Without it, DSPy optimizers have no signal to climb.

### Compiling a program with an optimizer (conceptual walkthrough)

At a conceptual level, compiling looks like this (illustrative — check current API for exact class/method names):

~~~python
# 1. A small labeled training set: questions with known-good answers
trainset = [
    dspy.Example(question="Who created Python?", answer="Guido van Rossum").with_inputs("question"),
    dspy.Example(question="What year was Python 3 released?", answer="2008").with_inputs("question"),
    # ... a few dozen examples is often enough to start
]

# 2. Pick an optimizer/teleprompter and give it the metric
optimizer = dspy.BootstrapFewShot(metric=answer_correctness)

# 3. Compile: the optimizer runs the program against trainset, keeps the
#    demonstrations/instructions that score well, discards ones that don't
compiled_qa = optimizer.compile(RetrieveThenAnswer(retriever=my_retriever), trainset=trainset)

# 4. Use the compiled program exactly like the original
answer = compiled_qa(question="Who wrote the ABC language?")
~~~

The output of compilation is not new source code you read and edit — it is a program object that now carries automatically-selected few-shot demonstrations and/or refined instructions baked into how it calls the LLM. Persist it (DSPy programs are typically serializable) so you don't have to recompile on every process start.

### Choosing modules by task difficulty

- Simple extraction/classification with an obvious answer: plain **Predict**.
- Anything requiring multi-step reasoning before the final answer: **ChainOfThought**.
- Tasks needing tool use or iterative retrieval decisions: an agentic module (ReAct-style), which interleaves reasoning with actions.

Start with the simplest module that could plausibly work, measure with your metric, and only reach for a heavier module (and the token cost that comes with it) when the metric shows it's needed.
`,

  "advanced-concepts": `
### Optimizer families and what they actually search over

Different optimizers make different tradeoffs between compile-time cost and quality gained. At a conceptual level (exact class names vary by version):

| Optimizer style | What it searches over | Cost profile |
|---|---|---|
| Bootstrap-few-shot style | Selects/validates which training examples make good few-shot demonstrations | Cheap — mostly running the program on trainset a few times |
| Instruction-search style | Rewrites the natural-language task description in the signature, testing variants against the metric | Moderate — more LLM calls to generate/evaluate candidate instructions |
| Joint search (instructions + demos, sometimes with a search strategy over both) | Combines demonstration selection with instruction rewriting, sometimes using a smaller/cheaper model to propose candidates | Most expensive — but often the highest quality ceiling |

Seniors choose based on budget: a bootstrap-style pass is a reasonable first compile; reach for joint optimization once you have a stable metric and enough training examples to make the extra search cost worth it.

### Compiling as a from-scratch build, every time

An important internals-adjacent fact: compilation is typically a fresh search from the base program and trainset each time you run it — it is not a fine-tune that persists gradient updates. This means: (a) compiling is naturally idempotent given the same inputs and controlled randomness, (b) you should treat the trainset and metric as the real "source of truth" that gets version-controlled, not just the compiled program artifact, and (c) recompiling for a new model is simply re-running the same optimizer call with a different LM configured — no hand-editing required.

### Portability across models — the mechanism, precisely

A hand-tuned prompt encodes assumptions about how ONE model responds to specific wording (how literally it follows instructions, how it handles few-shot formatting, whether it needs an explicit "think step by step" nudge). Swap the underlying model and those assumptions can silently break — the same wording may now confuse the new model or leave easy accuracy on the table because the new model would have responded better to different phrasing.

A DSPy program does not bake in wording — the signature (intent) is model-agnostic; only the COMPILED artifact (instructions + demonstrations) is model-specific. Recompiling means: point the program at the new model, rerun the optimizer against the same trainset and metric, and get a new compiled artifact tuned for the new model's actual behavior. The engineering cost of a model migration becomes "rerun a script and re-evaluate" rather than "manually rewrite and re-tune every prompt in the pipeline by hand."

### Decision table: DSPy vs. hand prompting vs. fine-tuning

| Situation | Best lever |
|---|---|
| You have a metric and a labeled set, model is frozen/API-only | DSPy optimization |
| One-off exploratory prompt, no pipeline, no metric yet | Manual prompt engineering (see the **Prompt Engineering** skill) — build the metric before reaching for DSPy |
| Need the model to internalize a new style/domain vocabulary/latency profile that prompting can't achieve | Fine-tuning (see the **Fine-Tuning** skill) — DSPy cannot change weights |
| Pipeline behavior needs to be reproducible and reviewable across model upgrades in production | DSPy compiled program, checked into version control alongside the trainset/metric, with the deployed artifact tracked like the **Prompt Versioning** skill describes |

### Concurrency and evaluation cost

Compilation runs the program many times against the trainset (and against candidate variants during instruction search), so compile time and API cost scale with trainset size times optimizer complexity. In production teams, this is treated like an offline batch job — run during a build/release step, not inline in a request path — with the compiled artifact cached and reused across requests.

### Edge case: metrics that are themselves LLM calls

Some metrics are cheap to compute exactly (string match, numeric tolerance). Others need an LLM-as-judge because "is this a good summary" has no closed-form check. Using an LLM-based metric inside an optimizer multiplies LLM calls further (one for the pipeline, one for the judge, times every candidate the optimizer tries) — budget for this explicitly, and prefer cheap exact metrics wherever the task allows it.
`,

  "internal-working": `
Step by step, what actually happens when you compile a DSPy program:

1. **Signature to prompt template.** Each module (Predict, ChainOfThought, etc.) has an internal adapter that turns a signature's input fields, output fields, and description into an actual prompt structure sent to the LLM — typically a system-style instruction plus a formatted input/output template.
2. **Zero-shot baseline run.** Before optimization, the program can already run "zero-shot" — the module generates a reasonable default prompt from the signature alone, with no few-shot examples. This is what you get if you skip compilation entirely.
3. **Bootstrap demonstrations.** During compilation, the optimizer runs the (uncompiled or partially-compiled) program against training examples. For each example where the metric scores the output as good, the optimizer keeps the full input/output trace (and, for ChainOfThought-style modules, the reasoning trace too) as a candidate few-shot demonstration.
4. **Candidate assembly.** The optimizer assembles candidate versions of the program: different subsets/orderings of bootstrapped demonstrations, and (for instruction-search optimizers) different candidate instruction phrasings, sometimes proposed by having an LLM suggest rewordings of the task description.
5. **Scoring on a held-out or validation split.** Each candidate program variant is evaluated using the metric function, typically on a validation subset separate from where demonstrations were bootstrapped, to avoid simply memorizing the training examples.
6. **Selection.** The optimizer keeps the candidate (or small ensemble/combination) that scores best, producing the compiled program — an object identical in interface to the original but now carrying the winning demonstrations/instructions baked into how each module builds its prompt.
7. **Inference-time behavior.** At call time, the compiled program's modules build a prompt exactly as before, except now it includes the selected few-shot examples and/or refined instructions automatically, then sends it to the configured LLM and parses the structured output back into the declared output fields.

~~~mermaid
flowchart TD
    A["Signature: declare input/output fields + intent"] --> B["Module: Predict / ChainOfThought wraps signature"]
    B --> C["Zero-shot prompt template generated from signature"]
    C --> D{"Compile requested?"}
    D -- No --> E["Run uncompiled: default prompt, no demos"]
    D -- Yes --> F["Optimizer runs program on trainset"]
    F --> G["Metric scores each output"]
    G --> H["Good-scoring traces kept as candidate few-shot demos"]
    H --> I["Optimizer assembles candidate program variants"]
    I --> J["Candidates scored on validation split"]
    J --> K["Best-scoring variant selected"]
    K --> L["Compiled program: baked-in demos + refined instructions"]
    L --> M["Inference: build prompt with demos, call LLM, parse structured output"]
    E --> M
~~~

The important internals takeaway: DSPy is not magic prompt-writing AI — it is a systematic search-and-select loop over things you could in principle try by hand (which examples to include, how to word the instructions), automated and made measurable by the metric function.
`,

  architecture: `
A typical DSPy application has four layers, mirroring how you'd structure any pipeline-with-a-compile-step system:

1. **Signatures layer** — pure declarations of intent per step. Owned like a schema; changes here are contract changes and should be reviewed as such.
2. **Modules/program layer** — the Python code composing signatures into a pipeline using control flow (loops, conditionals, retries). This is your actual application logic, testable independently of any specific LLM.
3. **Optimization/compile layer** — a separate, typically offline process: load a trainset and metric, run an optimizer, produce and persist a compiled program artifact. This should live in your build/release pipeline, not in the request-serving path.
4. **Serving layer** — the deployed service loads the persisted compiled program (not the raw uncompiled one) and calls it per request, wrapped in the same production concerns as any LLM call: timeouts, retries, caching, rate limiting, observability.

~~~text
project/
  signatures/
    qa.py              # AnswerFromContext, GenerateSearchQuery, ...
  programs/
    retrieve_then_answer.py   # dspy.Module subclasses composing signatures
  optimize/
    trainset.py         # curated labeled examples, version-controlled
    metric.py            # scoring function, version-controlled
    compile.py           # offline script: run optimizer, save compiled program
  compiled_artifacts/
    retrieve_then_answer.v3.json   # serialized compiled program, versioned like a model artifact
  service/
    api.py               # loads compiled_artifacts/*, serves requests
~~~

The key architectural discipline: the trainset and metric are first-class source artifacts (version them like code), and the compiled program is a BUILD OUTPUT (version it like a model checkpoint, not like hand-edited source). Treat a change to the metric or trainset as requiring a recompile-and-re-evaluate cycle before it reaches production, exactly the discipline the **Prompt Versioning** skill recommends for any prompt-shaped production artifact.
`,

  "data-flow": `
Tracing one signature through compilation to a served, compiled program:

~~~mermaid
sequenceDiagram
    participant Dev as Developer
    participant Sig as Signature (AnswerFromContext)
    participant Mod as Module (ChainOfThought)
    participant Opt as Optimizer (e.g. BootstrapFewShot)
    participant Train as Trainset + Metric
    participant LLM as Underlying LLM
    participant Store as Compiled Artifact Store
    participant Svc as Production Service

    Dev->>Sig: Declare input/output fields + task description
    Dev->>Mod: Wrap signature in a prompting strategy
    Dev->>Opt: optimizer.compile(program, trainset)
    Opt->>Train: Load labeled examples + metric function
    loop for each candidate demonstration/instruction
        Opt->>LLM: Run program variant on training example
        LLM-->>Opt: Prediction
        Opt->>Train: Score prediction with metric()
    end
    Opt->>Opt: Select best-scoring variant
    Opt-->>Store: Persist compiled program (demos + instructions baked in)
    Svc->>Store: Load compiled program at startup
    Svc->>LLM: Call compiled program for a real request
    LLM-->>Svc: Structured output parsed into signature's fields
    Svc-->>Dev: Response returned, metrics/logs emitted for monitoring
~~~

Note the split: everything above "Select best-scoring variant" happens once, offline, during compilation. Everything from "Load compiled program at startup" onward happens per production request. Re-running compilation (e.g. after a model swap) only touches the offline half.
`,

  "production-usage": `
How real teams typically run DSPy pipelines:

- **Project layout**: signatures and programs live in application code and are unit-testable without any LLM call (you can assert a program's control flow with a mocked module). The compile step is a separate script, often run in CI or a scheduled job, not inline in the serving path.
- **Trainset curation**: teams build a modest labeled set (often tens to low hundreds of examples) sourced from real production traffic (logged, reviewed, and lightly cleaned) rather than synthetic examples alone, so the optimizer's demonstrations reflect real input distributions.
- **Metric design**: production metrics are usually a blend of cheap exact-match/rule-based checks and, for open-ended tasks, an LLM-as-judge metric run sparingly (it's the most expensive part of compilation) — see the **AI Evals** skill for designing this rubric.
- **Compiled artifact management**: the output of compile.py is serialized and stored alongside a version tag, model name it was compiled against, and the metric score it achieved — treated like a model checkpoint artifact (versioned, diffed, rollback-able).
- **Config**: which LLM backend a program targets is configuration, not code, so recompiling against a different model is a config change plus a rerun of the same compile script.
- **Operational defaults**: request-time timeouts and retries wrap the compiled program exactly like any other LLM call; compile-time runs get more generous timeouts and are expected to be slow and somewhat expensive since they run many candidate evaluations.
`,

  "industry-examples": `
- **Databricks** — has published on using DSPy-style declarative pipeline optimization as part of its LLM tooling and research ecosystem, treating prompt optimization as a first-class, metric-driven step in building retrieval and agent pipelines.
- **Stanford NLP / academic research groups** — the framework's origin; used across multiple published papers on retrieval-augmented generation and reasoning pipelines as the reference implementation for "compiling" LM programs.
- **JetBlue** (reported in DSPy community case studies) — cited as an early adopter exploring DSPy for customer-facing pipeline components, using metric-driven optimization instead of hand-tuned prompts for specific extraction/classification steps.
- **Startups building RAG and agentic products** — many small teams adopt DSPy specifically to avoid re-tuning prompts by hand every time they swap or upgrade an underlying model provider, treating the trainset/metric as the stable asset and the compiled prompt as disposable.

Caveat: adoption details, especially for named companies beyond the Stanford research origin, are the kind of fact that changes quickly and is easy to overstate — verify current usage claims with a fresh search before quoting them as settled facts in, e.g., an interview or a blog post.
`,

  "best-practices": `
1. **Write the metric before writing the pipeline.** If you cannot articulate what "good output" means as code, you are not ready to optimize anything — you are still in the prompt-engineering exploration phase (see the **Prompt Engineering** skill for that phase).
2. **Start with the simplest module.** Try plain Predict before ChainOfThought, and ChainOfThought before an agentic/tool-using module. Escalate only when the metric shows the simpler module is insufficient.
3. **Keep signatures small and single-purpose.** One signature, one clear task. A signature trying to do three things at once produces ambiguous prompts that are hard for any optimizer to improve.
4. **Curate a trainset from real traffic, not synthetic guesses.** Optimizers can only find good demonstrations from the distribution you give them; synthetic examples that don't resemble production inputs produce a compiled program that looks great in testing and underperforms live.
5. **Separate validation from bootstrap examples.** Don't score compiled candidates only on the examples they were bootstrapped from — that measures memorization, not generalization.
6. **Version the trainset and metric like source code.** They are the actual "source" that produces a compiled program; a compiled artifact without its trainset/metric in version control is unreproducible.
7. **Version and tag compiled artifacts by the model they were compiled against.** A program compiled for one model is not guaranteed to perform well on another without recompiling.
8. **Treat compilation as an offline build step**, run in CI/release pipelines, never inline in a live request path — it is slow and makes many LLM calls.
9. **Budget for LLM-as-judge metrics explicitly.** They multiply the number of LLM calls during compilation and can dominate cost; prefer cheap exact metrics wherever a task allows one.
10. **Recompile on model migration, don't hand-patch.** If you catch yourself editing a compiled program's baked-in instructions by hand after a model swap, that's a sign to rerun the optimizer instead.
11. **Log the un-optimized and optimized metric scores side by side.** This is your evidence that compilation actually helped, and your regression signal if a future recompile does worse.
12. **Apply the same versioning discipline you'd use for prompts.** A compiled DSPy program is still, fundamentally, a set of prompts and examples in production — see the **Prompt Versioning** skill for how to track, roll back, and audit it over time.
`,

  "anti-patterns": `
**Compiling without a real metric**

~~~python
# WRONG — a metric that always returns True teaches the optimizer nothing;
# it will "pass" any candidate, so compilation is a no-op wearing a costume.
def fake_metric(example, prediction, trace=None):
    return True

# RIGHT — an actual check tied to task correctness
def real_metric(example, prediction, trace=None):
    return example.answer.strip().lower() in prediction.answer.strip().lower()
~~~

**Hand-editing a compiled program's baked-in prompt**

~~~python
# WRONG — reaching into the compiled artifact and rewriting the
# instruction string by hand defeats the entire point: your next
# recompile will silently discard this manual edit, and no one will notice.
compiled_qa.answer.signature.instructions = "Please answer very concisely."

# RIGHT — change the metric or trainset to reflect the desired behavior,
# then recompile so the change is captured and reproducible.
def conciseness_aware_metric(example, prediction, trace=None):
    is_correct = example.answer.strip().lower() in prediction.answer.strip().lower()
    is_concise = len(prediction.answer.split()) <= 20
    return is_correct and is_concise

compiled_qa = optimizer.compile(RetrieveThenAnswer(retriever), trainset=trainset)
~~~

**Bootstrapping and validating on the same examples**

~~~python
# WRONG — the optimizer's demonstrations came from these exact examples,
# so scoring "success" on them mostly measures memorization.
compiled = optimizer.compile(program, trainset=trainset)
score = evaluate(compiled, trainset)   # inflated, meaningless

# RIGHT — hold out a validation split the optimizer never bootstraps from.
train_examples, val_examples = trainset[:40], trainset[40:]
compiled = optimizer.compile(program, trainset=train_examples)
score = evaluate(compiled, val_examples)
~~~

**Skipping compilation entirely and shipping the zero-shot program**

~~~python
# WRONG — using the raw uncompiled module in production means you get
# DSPy's default prompt template with no tuned demonstrations at all,
# often barely better than a naive hand-written prompt.
qa = SimpleQA()
answer = qa(question=q, context=c)   # never compiled

# RIGHT — compile once (offline), persist, and serve the compiled version.
compiled_qa = optimizer.compile(SimpleQA(), trainset=trainset)
compiled_qa.save("compiled_artifacts/simple_qa.v1.json")
~~~

**Treating the compiled artifact as disposable / not tracking which model it targets**

Shipping a compiled program without recording which underlying LLM it was compiled against means a silent model provider upgrade can quietly degrade quality with no way to trace why — tag every compiled artifact with its target model and the metric score achieved.
`,

  performance: `
Measure before optimizing further — the relevant tools:

- **The metric score itself, on a held-out validation set** — this is your primary "performance" number in DSPy's world: quality per unit of program, not raw latency.
- **Token/cost accounting per call** — count both the pipeline's own LLM calls and, separately, any LLM-as-judge metric calls made during compilation; the latter is often the larger, easy-to-forget cost.
- **Wall-clock compile time** — track how long a compilation run takes; it scales with trainset size times number of candidate variants the optimizer tries.
- **Per-request latency in production** — measured the same way as any LLM-backed service (see the **Monitoring** section below), since a compiled program's inference-time behavior is just prompting-plus-parsing.

Ordered optimization hierarchy once you have baseline numbers:

1. **Get a working metric and a small trainset first** — no amount of optimizer sophistication compensates for an unmeasured pipeline.
2. **Try the cheapest optimizer style (bootstrap-few-shot-like) before joint instruction+demo search** — it is usually a fraction of the compile cost and often captures most of the achievable gain.
3. **Reduce module complexity where the metric allows it** — swap a ChainOfThought module for plain Predict wherever the reasoning trace isn't actually improving the metric; this cuts both compile and inference token cost.
4. **Cache compiled programs and reuse across requests** — never recompile per-request; compilation is a build-time cost, not a runtime one.
5. **Prune trainset size once returns plateau** — bootstrap-style optimizers often show diminishing returns well before "more data always helps"; a smaller trainset that captures the input distribution is cheaper to compile against and easier to keep curated.
6. **Only reach for the most expensive joint-search optimizers once cheaper ones are measured to be insufficient** — the cost difference between optimizer families can be an order of magnitude in LLM calls made during compilation.
`,

  scalability: `
DSPy's scalability story has two independent axes: scaling the OPTIMIZATION process, and scaling the SERVED program.

**Optimization-time scaling**: compile-time cost grows with trainset size and with the optimizer's search breadth (how many candidate demonstrations/instructions it tries). This is an offline, batchable process — parallelize evaluation of candidates across the trainset, and treat it like any other CPU/IO-light batch job that happens to make many LLM API calls (subject to your LLM provider's rate limits).

**Serving-time scaling**: a compiled program, once persisted, is served exactly like any other LLM-backed request handler — horizontal scaling of stateless service instances, each loading the same compiled artifact, is standard. There is no special DSPy-specific serving bottleneck beyond the usual LLM-call latency and provider rate limits.

| Bottleneck | Where it shows up | Mitigation |
|---|---|---|
| LLM provider rate limits during compilation | Optimizer making many parallel candidate-evaluation calls | Throttle/batch compile-time calls; run compilation off-peak |
| LLM-as-judge metric cost | Every candidate evaluation triggers a second LLM call | Prefer exact-match/rule-based metrics; sample judge calls rather than running on every candidate |
| Trainset growth without curation | Metric noise increases, compile time grows, marginal quality gain shrinks | Periodically prune/refresh trainset from recent production traffic instead of only ever appending |
| Recompiling per model version without process discipline | Ad hoc, undocumented recompiles causing quality drift across deployments | Recompile as a tracked release step, tagged with model version and metric score |
| Serving-time latency | Same as any LLM call — compiled program adds no runtime overhead beyond the prompt itself | Standard LLM-serving mitigations: caching, streaming, provider-level scaling |

There is no meaningful "vertical scaling" story specific to DSPy beyond what applies to any LLM-calling service — the framework's compute cost lives almost entirely in compile-time LLM calls, not in a runtime engine of its own.
`,

  security: `
DSPy-specific attack surface is largely the same surface as any LLM-calling pipeline, with a few compilation-specific wrinkles:

- **Prompt injection through retrieved/trained content.** If your metric or trainset ingests untrusted text (e.g., scraped documents used as context in a retrieve-then-answer program), a compiled program can end up with few-shot demonstrations that encode attacker-influenced patterns. Sanitize and review trainset sources exactly as you would any RAG context — see the security guidance in a dedicated **Security** or **LLM Security** skill for injection defenses in depth.
- **Data leakage through bootstrapped demonstrations.** Bootstrapped few-shot examples are literal excerpts from your trainset baked into the compiled program's prompts. If the trainset contains sensitive or regulated data, that data is now embedded in every production prompt sent to the LLM provider — treat trainset curation with the same data-handling rules as any other dataset containing PII/sensitive content.
- **LLM-as-judge metric manipulation.** If a metric's judge model can be influenced by adversarial content in the example being scored, a malicious or corrupted training example can skew which demonstrations the optimizer selects — validate judge behavior against known-good/known-bad examples before trusting it at compile time.
- **Compiled-artifact supply chain.** A serialized compiled program is effectively a config file that fully determines prompt behavior; treat it like any other deployable artifact — sign, checksum, or otherwise verify provenance if compiled artifacts are shared between environments or teams.
- **Secrets in signatures/metrics.** Don't put API keys or credentials in signature descriptions or metric code that might get logged verbatim as part of prompt traces during compilation.
`,

  testing: `
DSPy pipelines are testable at multiple levels, and the discipline should mirror ordinary software testing plus the LLM-specific eval layer:

~~~python
import dspy
import pytest

def test_program_control_flow_without_llm(monkeypatch):
    """Unit test: verify the program's Python logic without calling a real LLM."""
    class FakeChainOfThought:
        def __call__(self, **kwargs):
            return dspy.Prediction(answer="mocked answer")

    program = RetrieveThenAnswer(retriever=lambda q, k: ["fake passage"])
    program.answer = FakeChainOfThought()   # inject a fake module
    result = program(question="does this raise on empty context?")
    assert result.answer == "mocked answer"

def test_empty_retrieval_is_handled_explicitly():
    """Edge case: retriever returns nothing — should not crash or hallucinate silently."""
    program = RetrieveThenAnswer(retriever=lambda q, k: [])
    result = program(question="anything")
    assert "don't have enough information" in result.answer.lower()

def test_metric_function_directly():
    """Metrics are plain functions — test them like any other business logic."""
    example = dspy.Example(answer="Guido van Rossum").with_inputs()
    good_prediction = dspy.Prediction(answer="It was Guido van Rossum.")
    bad_prediction = dspy.Prediction(answer="It was Linus Torvalds.")
    assert answer_correctness(example, good_prediction) is True
    assert answer_correctness(example, bad_prediction) is False

@pytest.mark.slow
def test_compiled_program_meets_quality_bar(compiled_qa, held_out_examples):
    """Integration-style eval test: run the compiled program on a held-out
    set and assert an aggregate score, not per-example exact behavior
    (LLM outputs are not perfectly deterministic)."""
    scores = [answer_correctness(ex, compiled_qa(question=ex.question)) for ex in held_out_examples]
    accuracy = sum(scores) / len(scores)
    assert accuracy >= 0.8   # production quality bar, tune per task
~~~

Senior testing doctrine: test program CONTROL FLOW deterministically with mocked modules (fast, no LLM cost, no flakiness); test the METRIC as plain business logic; reserve real LLM calls for periodic, marked-slow integration evals against a held-out set with an aggregate threshold rather than exact-match assertions per example, since LLM outputs are not bit-for-bit deterministic even at low temperature.
`,

  debugging: `
Escalation path when a DSPy program isn't behaving as expected:

1. **Inspect the actual rendered prompt.** Most DSPy setups expose a way to view the last prompt sent to the LLM (often via the LM client's history or a dedicated inspect/history call) — always look at the literal prompt text before theorizing about signature or module behavior.
2. **Run the uncompiled program first.** If the zero-shot (uncompiled) version already behaves oddly, the problem is in the signature or module choice, not in optimization — fix that layer first.
3. **Check the metric on known-good and known-bad examples by hand.** Feed it a prediction you know is correct and one you know is wrong; if it doesn't discriminate them correctly, the optimizer is being trained against noise.
4. **Diff compiled vs. uncompiled behavior on the same inputs.** If compilation didn't improve the metric score on a validation set, something upstream (trainset quality, metric design, or an unsuitable module choice) is the real bug, not the optimizer.
5. **Check for silently truncated or malformed structured output.** If a module's declared output fields aren't being parsed cleanly, this shows up as unexpectedly empty or garbled fields rather than an exception — inspect raw LLM output alongside the parsed prediction.
6. **Isolate a single module in a multi-step program.** Call the suspect module directly with a fixed input rather than debugging through the full pipeline, to rule out upstream steps feeding it bad input.
7. **Check provider-level logs/rate-limit responses.** If compilation seems to hang or silently underperform, confirm you aren't silently hitting rate limits or timeouts on a subset of candidate evaluations.
`,

  monitoring: `
What to measure in a DSPy-backed production service, with instrumentation:

~~~python
import logging
import time

logger = logging.getLogger("dspy_service")

def answer_question(compiled_program, question: str) -> str:
    start = time.monotonic()
    try:
        prediction = compiled_program(question=question)
        latency_ms = (time.monotonic() - start) * 1000
        logger.info(
            "dspy_call ok question_len=%d answer_len=%d latency_ms=%.1f",
            len(question), len(prediction.answer), latency_ms,
        )
        return prediction.answer
    except Exception:
        latency_ms = (time.monotonic() - start) * 1000
        logger.exception("dspy_call failed latency_ms=%.1f", latency_ms)
        raise
~~~

Key things to track:

- **Per-request latency and error rate** — same as any LLM-backed endpoint.
- **Live quality signal** — periodically re-run the metric against a sample of live traffic (with human review or the same LLM-as-judge used at compile time) to catch quality drift, which is the DSPy-specific equivalent of model/data drift monitoring.
- **Which compiled artifact version is currently deployed**, tagged with its compile-time metric score, so a quality regression can be traced to "did the artifact change" versus "did the underlying model provider change behavior."
- **Token usage per request**, to catch cases where a ChainOfThought-style module's reasoning traces balloon in length over time (e.g., if the underlying model's default verbosity shifts after a provider-side update).
- **Distribution of input characteristics** (question length, retrieval hit rate in a RAG pipeline) to catch when live traffic drifts away from the distribution the trainset represented at compile time — a strong signal it's time to recompile.
`,

  deployment: `
A production-grade Dockerfile for a DSPy-backed service, with per-line rationale:

~~~dockerfile
# Pin a specific Python version — reproducibility for a service whose
# behavior depends on exact library versions (DSPy's API has moved fast).
FROM python:3.11-slim AS base

# Avoid interactive prompts and keep image layers lean.
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

# Copy only dependency manifests first so Docker layer caching avoids
# reinstalling dependencies on every code change.
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

# Copy application code, including the pre-built compiled artifact —
# compilation itself happens in CI, not inside this image.
COPY service/ ./service/
COPY compiled_artifacts/ ./compiled_artifacts/

# Run as a non-root user — standard container hardening.
RUN useradd --create-home appuser
USER appuser

# Health check hits a lightweight endpoint, not one that calls the LLM,
# so container orchestration doesn't burn API cost on liveness checks.
HEALTHCHECK --interval=30s --timeout=5s CMD ["python", "-c", "import sys; sys.exit(0)"]

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "service.api:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Production notes:

- The compiled artifact is baked into the image (or fetched from an artifact store at startup) rather than compiled at container start — compilation is slow and makes many LLM calls, unsuitable for a cold-start path.
- Config for which LLM backend/model to call at inference time should be an environment variable, not hardcoded, so the same image can be validated against a staging model before a production model swap.
- CI should run the compile step as a separate pipeline stage, gated on the metric meeting a quality threshold before the resulting artifact is promoted to the deployable image.
`,

  "production-checklist": `
- [ ] Every module in the pipeline has a signature with clear, single-purpose input/output fields and an unambiguous task description.
- [ ] A metric function exists, is unit-tested on known-good and known-bad examples, and matches the actual production quality bar (see the **AI Evals** skill).
- [ ] A trainset exists, is sourced from realistic input distributions, and is version-controlled.
- [ ] Train/validation split is enforced — compiled candidates are never scored only on examples they were bootstrapped from.
- [ ] Compilation runs as an offline/CI step, not inline in the request-serving path.
- [ ] The compiled artifact is tagged with the model it was compiled against and the metric score it achieved at compile time.
- [ ] The compiled artifact (not the raw uncompiled program) is what's deployed and served.
- [ ] Compiled artifacts are versioned and rollback-able like any other deployable/model artifact — see the **Prompt Versioning** skill for the discipline.
- [ ] Per-request latency, error rate, and token usage are instrumented and alertable.
- [ ] A live-traffic quality sample is periodically re-scored with the metric to catch drift.
- [ ] There's a documented, tested procedure for recompiling against a new model (a config change plus a rerun of the compile script, not a manual prompt edit).
- [ ] LLM-as-judge metric usage (if any) is cost-budgeted and rate-limit-aware, since it multiplies calls during compilation.
- [ ] Sensitive/regulated data has been excluded or scrubbed from the trainset, since bootstrapped examples get embedded verbatim into production prompts.
- [ ] Retries/timeouts wrap the compiled program's inference calls exactly as they would any other LLM API call.
- [ ] Team knows and has verified the exact DSPy version and API surface in use — not just assumed it matches whatever tutorial or blog post they learned from.
`,

  "common-mistakes": `
1. **Treating DSPy as a way to skip evaluation.** It's the opposite — DSPy REQUIRES a metric to do anything useful; teams that adopt it hoping to avoid building an eval harness end up blocked immediately.
2. **Writing an overly broad signature.** A signature trying to do retrieval, reasoning, and formatting all in one step gives the optimizer a confusing, hard-to-improve search space; decompose into focused steps instead.
3. **Skipping the uncompiled sanity check.** If you never look at zero-shot behavior before compiling, you can't tell whether compilation is actually helping or just adding cost.
4. **Reusing the same examples for bootstrap and validation.** This produces compiled programs that look great in-sample and disappoint in production — a classic train/test leakage mistake transplanted into prompt optimization.
5. **Assuming a compiled program transfers to a new model with no changes.** The whole point of the portability story is that you RECOMPILE, not that the same artifact magically works everywhere.
6. **Hand-editing baked-in instructions post-compile.** This creates an untracked divergence between your trainset/metric (the real source of truth) and what's actually deployed.
7. **Ignoring token/cost blowup from ChainOfThought or agentic modules.** Defaulting to the heaviest module "just in case" instead of measuring whether it's needed wastes both compile-time and inference-time budget.
8. **Under-curating the trainset over time.** Letting it grow by pure accumulation without pruning stale or unrepresentative examples degrades both compile time and the quality of selected demonstrations.
9. **Forgetting that compiled programs still need production engineering.** Retries, timeouts, monitoring, and caching don't come for free just because the prompt-tuning problem is automated.
10. **Chasing metric score in isolation from real user outcomes.** A metric is a proxy; validate periodically that improving the metric actually correlates with the production outcome you care about (see the **AI Evals** skill for proxy-metric pitfalls).
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Output field missing or empty on a Predict/ChainOfThought call | LLM didn't follow the expected structured-output format for this signature | Inspect the rendered prompt; tighten the signature's field descriptions; consider a more capable module (ChainOfThought) or a stricter output parser |
| Compiled program performs no better than uncompiled | Metric doesn't discriminate good from bad outputs, or trainset too small/unrepresentative | Hand-test the metric on known examples; grow/refresh the trainset from real traffic |
| Compilation extremely slow or rate-limited | Trainset too large for the optimizer style chosen, or hitting provider rate limits | Use a cheaper optimizer first; throttle concurrent candidate evaluation; shrink trainset |
| Great validation score, poor production quality | Trainset/validation distribution doesn't match live traffic | Refresh trainset from recent, representative production examples |
| Recompiled program worse than the previous one | Metric or trainset changed unintentionally, or new model behaves differently under the same prompts | Diff trainset/metric changes since last compile; compare metric scores side by side, don't just ship blindly |
| Program raises on empty retrieval / empty context | No explicit handling for the retriever returning nothing | Add an explicit guard clause returning a safe fallback answer instead of calling the LLM with empty context |
| Unexpectedly high token usage after a provider model update | Underlying model's default verbosity or reasoning-trace length changed | Recompile against the new model version; consider constraining output length in the signature description |
| Same code, different results across runs during compilation | Nondeterminism from LLM sampling temperature during candidate evaluation | Fix a low temperature for evaluation calls where reproducibility of the compile step matters |
`,

  faqs: `
**Does DSPy replace prompt engineering entirely?**
No. It automates the SEARCH over prompt wording and examples, but you still need to design a good signature (what fields, what task description) and a good metric — both of which require prompt-engineering-adjacent judgment. See the **Prompt Engineering** skill.

**Do I need a large labeled dataset to use DSPy?**
Not necessarily large — many optimizer styles work with tens to low hundreds of examples. What matters more is that the examples are representative of real production inputs and that the metric reliably scores them.

**Is DSPy a replacement for fine-tuning?**
No. DSPy optimizes prompts and few-shot examples against a frozen model's weights; fine-tuning changes the weights themselves. They're different, sometimes complementary, levers — see the **Fine-Tuning** skill for when weight updates are the right tool instead.

**Can I use DSPy without a vector database or retrieval at all?**
Yes — DSPy programs don't require retrieval; the retrieve-then-answer example on this page is one common pattern, not a requirement. Any signature/module composition works for tasks with no external retrieval step.

**How is a compiled DSPy program deployed — do I ship the DSPy library and recompile at startup?**
No — compile once (offline, in CI/release), persist the compiled program artifact, and load that artifact at service startup. Recompiling at request time or even at every process start is unnecessary cost.

**What happens if I switch LLM providers?**
Reconfigure the program to target the new model and rerun the same optimizer/trainset/metric to get a newly compiled artifact suited to that model. This is the core portability benefit over hand-written prompts.

**Is DSPy's API stable enough to build long-term production systems on?**
It has changed meaningfully across versions since its 2023 release. Pin your dependency version explicitly, test upgrades deliberately, and don't assume tutorial code (including some on this page) matches the exact current API without checking the installed version's own documentation.

**Do I still need to version my prompts if I'm using DSPy?**
Yes — a compiled program is still, fundamentally, prompts and examples in production. See the **Prompt Versioning** skill for tracking, auditing, and rolling back compiled artifacts over time.
`,

  "interview-questions": `
**Junior level**

1. *What is a DSPy signature, and how is it different from a hand-written prompt string?*
   Model answer: a signature declares input fields, output fields, and a task description — the INTENT of a step — without specifying prompt wording; a hand-written prompt bakes in specific wording, formatting, and often hand-picked examples directly.

2. *What's the difference between a module and a program in DSPy?*
   Model answer: a module implements a single signature using a prompting strategy (e.g., Predict, ChainOfThought); a program composes multiple modules using ordinary Python control flow into a full pipeline.

3. *Why does DSPy require a metric function to do anything useful?*
   Model answer: optimizers search over candidate prompts/demonstrations and need a way to score which candidates are better; without a metric there is no signal to select good candidates over bad ones.

4. *Give an example of a task where you'd choose ChainOfThought over plain Predict.*
   Model answer: any task requiring multi-step reasoning before a final answer (e.g., multi-hop question answering) tends to benefit from eliciting a reasoning trace first; simple direct extraction/classification usually doesn't need it.

5. *What does "compiling" a DSPy program actually produce?*
   Model answer: a program object with automatically selected few-shot demonstrations and/or refined instructions baked into its modules — not new hand-editable source code.

**Senior level**

6. *Why is a DSPy-compiled program considered more portable across models than a hand-tuned prompt, and what does "recompiling" concretely involve?*
   Model answer: the signature (intent) is model-agnostic; only the compiled artifact (instructions/demos) is model-specific. Recompiling means rerunning the same optimizer against the same trainset/metric but targeting the new model, producing a new artifact tuned to that model's actual behavior — no manual prompt rewriting required.

7. *How would you prevent a compiled program from merely memorizing its training examples?*
   Model answer: hold out a validation split the optimizer never bootstraps demonstrations from, and score candidate programs on that held-out set, not on the training examples used to generate demonstrations.

8. *What's the relationship between DSPy and fine-tuning — when would you reach for one over the other?*
   Model answer: DSPy optimizes prompts/examples against a frozen model; fine-tuning updates model weights. Reach for DSPy when you have an API-only or otherwise frozen model and a measurable task; reach for fine-tuning when prompting-level changes can't achieve the needed behavior/style/latency profile, or when you control training infrastructure and want to bake behavior into the weights themselves.

9. *How do you budget for LLM-as-judge metrics inside a DSPy optimization run?*
   Model answer: recognize that a judge-based metric doubles (or more) the LLM calls made during compilation — one for the pipeline call, one for the judge call, times every candidate the optimizer evaluates; prefer cheap exact-match/rule-based metrics wherever feasible, and reserve judge-based metrics for genuinely open-ended tasks, ideally sampled rather than exhaustive.

10. *What production discipline does a compiled DSPy program still require that DSPy itself does not provide?*
    Model answer: the usual LLM-service production concerns — timeouts, retries, caching, monitoring, cost tracking — plus versioning discipline for the compiled artifact itself (see the **Prompt Versioning** skill), since DSPy automates prompt search but not deployment operations.

11. *How would you decompose a complex, multi-part task into signatures?*
    Model answer: split by natural pipeline stage where intermediate outputs are independently checkable (e.g., query generation, retrieval, answer generation as separate signatures) rather than one signature trying to do everything, which keeps each step's search space small and its contribution to failures debuggable in isolation.

12. *What's a risk of bootstrapped few-shot demonstrations from a sensitive dataset?*
    Model answer: bootstrapped demonstrations get embedded verbatim into every production prompt sent to the LLM provider, so sensitive/regulated data in the trainset effectively leaks into every inference call — trainset curation needs the same data-handling rigor as any other dataset with sensitive content.
`,

  "coding-questions": `
**Problem 1 — Write a signature and metric for a classification task**

Implement a DSPy signature for sentiment classification and a metric function that scores exact label matches, with edge-case handling for case/whitespace differences.

~~~python
import dspy

class ClassifySentiment(dspy.Signature):
    "Classify the sentiment of the given text as positive, negative, or neutral."
    text: str = dspy.InputField()
    sentiment: str = dspy.OutputField(desc="one of: positive, negative, neutral")

def sentiment_metric(example, prediction, trace=None) -> bool:
    # Edge case: normalize case/whitespace so formatting differences
    # don't count as incorrect classifications.
    gold = example.sentiment.strip().lower()
    predicted = prediction.sentiment.strip().lower()
    valid_labels = {"positive", "negative", "neutral"}
    if predicted not in valid_labels:
        # Edge case: model returned something outside the allowed label set —
        # treat as incorrect rather than crashing the eval loop.
        return False
    return gold == predicted

# Complexity: O(1) per example (string comparisons only).
# Follow-up: how would you handle a five-point sentiment scale instead of
# three labels? (Answer: widen valid_labels and consider a partial-credit
# metric returning a float instead of a bool, e.g. 1 - abs(gold_score - pred_score)/4.)
~~~

**Problem 2 — Build and test a two-step program with an explicit edge case**

Implement a program that extracts a structured field, then validates it, handling the case where extraction fails.

~~~python
import dspy

class ExtractDate(dspy.Signature):
    "Extract a date mentioned in the text, in YYYY-MM-DD format. If no date is present, output 'NONE'."
    text: str = dspy.InputField()
    date: str = dspy.OutputField()

class ExtractAndValidateDate(dspy.Module):
    def __init__(self):
        super().__init__()
        self.extract = dspy.Predict(ExtractDate)

    def forward(self, text: str):
        result = self.extract(text=text)
        # Edge case: the signature explicitly allows "NONE" — handle it
        # rather than letting a malformed date string flow downstream.
        if result.date.strip().upper() == "NONE":
            return dspy.Prediction(date=None, valid=False)
        import re
        if not re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", result.date.strip()):
            # Edge case: model didn't follow the requested format —
            # fail closed rather than passing a malformed date onward.
            return dspy.Prediction(date=None, valid=False)
        return dspy.Prediction(date=result.date.strip(), valid=True)

# Test:
def test_no_date_present():
    program = ExtractAndValidateDate()
    program.extract = lambda text: dspy.Prediction(date="NONE")
    result = program(text="This text has no date in it.")
    assert result.valid is False and result.date is None

# Complexity: O(n) in text length for the extraction call (LLM-bound);
# O(1) for the regex validation step.
# Follow-up: how would you extend this to extract MULTIPLE dates? (Answer:
# change the output field to a list-like structure, e.g. a comma-separated
# string parsed into a list, and update the metric to score set overlap
# rather than exact string equality.)
~~~

**Problem 3 — Design a train/validation split and a compile-then-evaluate harness**

Write a function that splits a labeled dataset, compiles a program on the training portion, and reports both train and validation metric scores side by side (to detect overfitting to bootstrapped examples).

~~~python
import random

def compile_and_evaluate(program, optimizer_factory, all_examples, metric, val_fraction=0.3, seed=42):
    # Edge case: shuffle deterministically so results are reproducible,
    # and guard against a validation set so small it's statistically meaningless.
    rng = random.Random(seed)
    shuffled = all_examples[:]
    rng.shuffle(shuffled)
    split_idx = int(len(shuffled) * (1 - val_fraction))
    train_examples, val_examples = shuffled[:split_idx], shuffled[split_idx:]
    if len(val_examples) < 5:
        raise ValueError("validation set too small to trust the reported score")

    optimizer = optimizer_factory(metric=metric)
    compiled = optimizer.compile(program, trainset=train_examples)

    def score(examples):
        results = [metric(ex, compiled(**ex.inputs())) for ex in examples]
        return sum(results) / len(results)

    return {
        "train_score": score(train_examples),
        "val_score": score(val_examples),
        "compiled_program": compiled,
    }

# Complexity: O(n) LLM calls for scoring, where n = len(train_examples) + len(val_examples),
# plus whatever the optimizer itself does internally during compile().
# Follow-up: how would you detect overfitting from this harness's output?
# (Answer: a large gap between train_score and val_score, with val_score
# not meaningfully better than the uncompiled program's baseline score.)
~~~
`,

  "hands-on-labs": `
**Lab 1 — Beginner: signature and module basics**
Build a single-step DSPy program that classifies a short piece of text into one of three categories, using a plain Predict module and an inline signature. Deliverable: a working program plus 5 manually-checked example calls. Skills exercised: signatures, modules, running a program without compilation.

**Lab 2 — Intermediate: metric-driven evaluation**
Take the Lab 1 program, write a metric function, curate 20 labeled examples, and produce an evaluation report (accuracy on the 20 examples) WITHOUT yet compiling anything. Deliverable: a metric function plus a script printing per-example correctness and an aggregate score. Skills exercised: metric design, the evaluation discipline from the **AI Evals** skill applied inside a DSPy context.

**Lab 3 — Intermediate/advanced: compile and compare**
Split your Lab 2 dataset into train/validation, run an optimizer to compile the program, and report train vs. validation metric scores alongside the uncompiled program's baseline score. Deliverable: a short comparison table (uncompiled / compiled-train / compiled-validation) and a written explanation of whether compilation helped and why. Skills exercised: compilation, train/validation discipline, honest interpretation of results.

**Lab 4 — Production: a small retrieve-then-answer service**
Build the two-step retrieve-then-answer program from this page's Intermediate Concepts section, wire it to a small local document set (even a handful of text files) and a simple keyword or embedding-based retriever, compile it, persist the compiled artifact, and serve it behind a minimal HTTP endpoint with logging and a timeout. Deliverable: a runnable service plus a README documenting how to recompile against a different underlying model. Skills exercised: full pipeline architecture, compilation as an offline step, production serving, and the model-portability workflow described in Advanced Concepts.
`,

  "real-projects": `
**Project 1 — Metric-driven FAQ answering pipeline**
Build a retrieve-then-answer DSPy program over a real document set (e.g., your own project's documentation), with a hand-curated trainset of 30–50 real questions and answers, a metric combining exact-match and an LLM-as-judge fallback for open-ended questions, and a compiled, versioned artifact. Engineering requirements: train/validation split, compile step in CI, compiled artifact tagged with model version and score, service wrapping the compiled program with monitoring and timeouts.

**Project 2 — Model-portability demonstration**
Take a single DSPy program and compile it against two different underlying LLMs (e.g., a larger and a smaller model, or two different providers), keeping the trainset and metric identical. Engineering requirements: a comparison report showing metric scores for each compiled variant, a documented recompilation procedure, and a discussion of which model needed more/fewer bootstrapped examples to reach a given quality bar — directly demonstrating the portability claim this page makes about DSPy versus hand-tuned prompts.

**Project 3 — Multi-step extraction-then-summarization pipeline with drift monitoring**
Build a three-stage program (extract structured fields, validate them, summarize into a final report), compile it, deploy it behind a small service, and add a scheduled job that re-scores a sample of live traffic against the original metric weekly to detect quality drift. Engineering requirements: separate signatures per stage, a drift-detection alert when live-traffic metric score drops below a threshold relative to the compile-time validation score, and a documented recompile trigger policy.
`,

  "case-studies": `
**Stanford NLP's original research motivation.** The lesson: DSPy grew out of frustration with hand-tuned, non-transferable prompt pipelines in academic retrieval-augmented generation research — the same pain any engineering team feels when a prompt tuned for one model degrades on the next. The generalizable lesson is that treating prompts as compiled artifacts rather than hand-edited strings is a response to a real, recurring maintenance cost, not just an academic novelty.

**Adoption in RAG-heavy startups (general industry pattern).** Teams building retrieval-augmented products often report that the highest-friction part of shipping isn't the retrieval itself but the constant re-tuning of the "answer generation" prompt every time they experiment with a different underlying model. The lesson: a metric-driven, recompilable approach turns a recurring manual-tuning cost into a scripted, repeatable step — valuable specifically BECAUSE model choice in production is not static.

**Databricks' broader work on LLM pipeline tooling.** The lesson from platforms investing in declarative, metric-driven prompt optimization tooling generally: as organizations run more LLM pipelines at scale, ad hoc prompt engineering per pipeline doesn't scale organizationally either — treating prompt optimization as a governed, evaluated, versioned process becomes necessary once you have more than a handful of pipelines to maintain.

**A cautionary pattern seen across teams adopting DSPy without an eval culture.** The most common failure mode reported anecdotally in the community is teams adopting DSPy hoping it would let them skip building a proper evaluation harness — and getting stuck immediately because DSPy cannot optimize without a metric. The lesson: DSPy does not lower the bar for evaluation rigor, it raises the floor requirement for it. Teams without at least a minimal eval culture (see the **AI Evals** skill) are not ready to adopt DSPy productively yet.
`,

  comparisons: `
| Framework | Core focus | Relationship to DSPy |
|---|---|---|
| **DSPy** | Programming, not prompting — declare signatures and let an optimizer find prompts/few-shot examples via a metric | — |
| **LlamaIndex** | Data ingestion, indexing, and retrieval for RAG — connectors, chunking, vector store integration | Complementary: LlamaIndex is a strong choice for the retrieval side of a pipeline; DSPy can wrap around a LlamaIndex-powered retriever as the "answer generation" and "orchestration" layer that gets metric-optimized. See the **LlamaIndex** skill. |
| **PydanticAI** | Type-safe agent construction — structured inputs/outputs, tool calling, validation via Pydantic models | Complementary/overlapping: PydanticAI focuses on making agent code type-safe and structurally validated; DSPy focuses on automatically optimizing the PROMPTS behind each step. You can use Pydantic-style structured outputs inside a DSPy signature's field types in some setups, but PydanticAI itself doesn't optimize prompt wording the way DSPy's compiler does. See the **PydanticAI** skill. |
| **LangChain / LangGraph** | General-purpose orchestration — chains, agents, graph-based control flow, broad integrations | Different layer: these frameworks focus on ORCHESTRATION and integration breadth; DSPy focuses narrowly on OPTIMIZING the prompts within a pipeline's steps. Some teams use LangChain/LangGraph for orchestration and DSPy for the prompt-optimization layer within specific steps. |
| **Manual prompt engineering** | Hand-crafted prompt strings, hand-picked few-shot examples | The alternative DSPy is explicitly designed to reduce reliance on — see the **Prompt Engineering** skill for the manual discipline DSPy automates the search over. |
| **Fine-tuning** | Updating model weights via gradient-based training on a target task | A different lever entirely: DSPy optimizes against a frozen model; fine-tuning changes the model itself. See the **Fine-Tuning** skill; the two can be combined (e.g., fine-tune a smaller model, then use DSPy to optimize prompts around it). |

**How seniors choose:** if the bottleneck is retrieval quality (bad chunks, weak recall), invest in LlamaIndex-style indexing work first — no amount of prompt optimization fixes bad retrieved context. If the bottleneck is prompt/example quality given decent retrieval, and you have (or can build) a metric, DSPy is the right lever. If the bottleneck is that the model itself lacks the underlying capability or domain knowledge no prompt can elicit, fine-tuning is the right lever. If the bottleneck is agent code correctness/type-safety rather than prompt wording, PydanticAI's structural guarantees matter more than prompt optimization. Most mature production systems end up combining more than one of these rather than treating them as mutually exclusive.
`,

  "related-technologies": `
- **Prompt Engineering** — the manual discipline of writing and iterating on prompt strings; understand this first, since DSPy automates the search this discipline performs by hand. See the **Prompt Engineering** skill.
- **AI Evals** — designing metric functions and evaluation datasets; a hard prerequisite for using DSPy's optimizers meaningfully. See the **AI Evals** skill.
- **Fine-Tuning** — the weight-updating alternative/complement to prompt optimization. See the **Fine-Tuning** skill.
- **Prompt Versioning** — tracking, auditing, and rolling back prompt-shaped production artifacts, which a compiled DSPy program still is. See the **Prompt Versioning** skill.
- **LlamaIndex** — retrieval/indexing infrastructure commonly used as the retrieval half of a DSPy retrieve-then-answer program. See the **LlamaIndex** skill.
- **PydanticAI** — type-safe agent construction; a complementary approach focused on structural correctness rather than prompt optimization. See the **PydanticAI** skill.
- **LangChain / LangGraph** (general orchestration frameworks) — broader integration and control-flow tooling that can sit around a DSPy-optimized step.
- **Vector databases** (e.g., the kind of infrastructure covered in retrieval-focused skills) — the storage layer underneath most retrieve-then-answer DSPy programs.

Suggested learning path on this platform: **Prompt Engineering** → **AI Evals** → **DSPy** → (**Fine-Tuning** and/or **Prompt Versioning** as the next step depending on whether your bottleneck is model capability or production governance).
`,

  "latest-updates": `
DSPy has evolved quickly since its 2023 public release, with multiple reworkings of its API (signature syntax, optimizer/teleprompter naming, module set) across versions. As of this page's authoring, the author's knowledge reflects information available up to early-to-mid 2025 and may not capture subsequent releases.

Given how fast this specific framework moves, the responsible approach is:

1. Check the installed package's version and its own release notes/changelog before writing production code against any specific class or method name mentioned on this page.
2. Treat every code example on this page as illustrating the DURABLE MENTAL MODEL (signatures, modules, programs, optimizers/compilation, metrics) rather than a guaranteed-current API surface.
3. If a specific claim here about a company's adoption, a specific optimizer's name, or a release date matters for a decision you're making, verify it with a fresh web search rather than relying solely on this page.

This is an honest hedge, not a cop-out: the core ideas (declare intent via signatures, optimize against a metric, treat prompts as compiled artifacts) have been stable since DSPy's introduction even as the exact class names around them have shifted.
`,

  "future-roadmap": `
Directions worth watching, stated with appropriate hedging given how fast this space moves:

- **Broader optimizer sophistication** — richer search strategies over instructions and demonstrations, potentially incorporating cheaper proxy models to propose candidates before validating with the target model, to control compilation cost.
- **Deeper agentic/tool-use module support** — as agentic pipelines (tool calling, multi-step planning) become more central to production AI engineering, expect DSPy's module set to keep expanding to cover these patterns natively rather than requiring hand-rolled composition.
- **Tighter integration with evaluation tooling** — since DSPy's entire value proposition depends on metrics, expect continued convergence between DSPy-style optimization and the broader AI evaluation tooling ecosystem (dataset management, LLM-as-judge tooling).
- **Standardization pressure** — as more teams adopt declarative, metric-driven prompt optimization as a category (not just DSPy specifically), expect either DSPy's conventions to become a de facto standard or a competing convention to emerge; this is genuinely uncertain and worth re-checking periodically.

What to bet career time on: the DURABLE skill here is evaluation-driven pipeline development — knowing how to write a good signature, a good metric, and reason about train/validation splits for prompt optimization. That skill transfers even if DSPy's specific API keeps changing or a competing framework becomes more popular; the underlying discipline (programming intent, not prompt wording, validated against a metric) is the part worth internalizing.
`,

  "cheat-sheet": `
~~~text
DSPY ESSENTIALS

Core triangle:
  Signature  = contract: input fields -> output fields + task description
  Module     = a signature + a prompting strategy (Predict, ChainOfThought, ReAct-style)
  Program    = Python code composing modules (dspy.Module subclass, forward() method)

Minimal signature:
  class AnswerQuestion(dspy.Signature):
      "Answer using only the given context."
      question: str = dspy.InputField()
      context: str = dspy.InputField()
      answer: str = dspy.OutputField()

Minimal module usage:
  predict = dspy.Predict(AnswerQuestion)
  reason  = dspy.ChainOfThought(AnswerQuestion)
  result  = reason(question=q, context=c)   # result.answer

Metric (REQUIRED before optimizing anything):
  def metric(example, prediction, trace=None) -> bool | float:
      return example.answer.strip().lower() in prediction.answer.strip().lower()

Compile:
  optimizer = dspy.BootstrapFewShot(metric=metric)     # cheap, first choice
  compiled  = optimizer.compile(program, trainset=train_examples)
  compiled.save("artifact.json")                       # persist, don't recompile per request

Portability across models:
  hand-tuned prompt  -> breaks silently on a new model, needs manual rewrite
  DSPy compiled program -> reconfigure target model, rerun optimizer, get new artifact

Production discipline:
  - trainset + metric = version-controlled source of truth
  - compiled artifact  = build output, tagged with model + score, versioned like a checkpoint
  - compile step runs offline/CI, never inline in request path
  - train/validation split enforced -- never score only on bootstrap examples
  - still needs: timeouts, retries, monitoring, prompt-versioning discipline in prod

What DSPy is NOT:
  - not a replacement for understanding prompting (still need good signatures/metrics)
  - not fine-tuning (frozen weights; optimizes prompts/demos, not the model itself)
  - not free evaluation -- it REQUIRES an eval culture, doesn't replace building one
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is a DSPy signature? | A declaration of a step's input fields, output fields, and task intent — without specifying prompt wording. |
| What does a DSPy module do? | Implements a signature using a specific prompting strategy (e.g., Predict for direct prediction, ChainOfThought for reasoning-first). |
| What is a DSPy program? | Ordinary Python code (a dspy.Module subclass) composing multiple modules into a pipeline. |
| Why does DSPy require a metric function? | Optimizers need a scoring signal to determine which candidate prompts/demonstrations are better; without one, there is nothing to optimize toward. |
| What does "compiling" a DSPy program produce? | A program with automatically selected few-shot demonstrations and/or refined instructions baked in — not new hand-editable source. |
| Why is a compiled DSPy program more portable across models than a hand-tuned prompt? | The signature (intent) is model-agnostic; only the compiled artifact is model-specific, and recompiling for a new model is a config change plus a rerun of the optimizer, not a manual rewrite. |
| Does DSPy replace prompt engineering knowledge? | No — it automates the SEARCH over prompt variations, but designing good signatures and metrics still requires prompting judgment. |
| How does DSPy relate to fine-tuning? | DSPy optimizes prompts/few-shot examples against a frozen model; fine-tuning changes the model's weights. Different levers. |
| What's the risk of bootstrapping and validating on the same examples? | It measures memorization, not generalization — always hold out a validation split the optimizer doesn't bootstrap from. |
| Where should compilation run in a production system? | As an offline/CI build step, never inline in the live request-serving path. |
| What should be version-controlled: the trainset/metric, or the compiled artifact? | Both, but treated differently — trainset/metric like source code, compiled artifact like a build output/model checkpoint. |
| What's the most expensive part of many DSPy optimization runs? | LLM-as-judge metrics, since they multiply LLM calls (one per pipeline call, one per judge call, times every candidate evaluated). |
| What should you do if you catch yourself hand-editing a compiled program's baked-in instructions? | Stop — change the metric or trainset instead and recompile, so the change is tracked and reproducible. |
| Does a compiled DSPy program still need prompt-versioning discipline in production? | Yes — it's still fundamentally prompts and examples in production; see the Prompt Versioning skill. |
| What is DSPy's relationship to LlamaIndex? | Complementary — LlamaIndex typically handles retrieval/indexing; DSPy can optimize the prompts around and after retrieval in the same pipeline. |
`,

  mcqs: `
**1. What does a DSPy signature declare?**
A. The exact prompt wording to send to the LLM
B. Input fields, output fields, and a task description — without prompt wording
C. The specific LLM provider to use
D. A fine-tuning configuration

Answer: B. Explanation: a signature is a contract of intent (inputs, outputs, description); the actual prompt wording is generated by a module and, after optimization, refined by an optimizer — never hand-written directly into the signature.

**2. Why can't a DSPy optimizer do anything useful without a metric function?**
A. Metrics are required by the Python type system
B. The optimizer needs a scoring signal to distinguish better candidate prompts/demonstrations from worse ones
C. Metrics are only used for logging, not optimization
D. DSPy uses metrics solely to estimate token cost

Answer: B. Explanation: optimization is a search process; without a way to score candidates, there is no way to select which demonstrations or instructions are actually better.

**3. What does "recompiling" a DSPy program for a new model involve?**
A. Manually rewriting every prompt string in the pipeline
B. Reconfiguring the target model and rerunning the same optimizer against the same trainset/metric
C. Fine-tuning the new model on the trainset
D. Editing the compiled artifact's instructions by hand

Answer: B. Explanation: this is exactly the portability benefit DSPy provides — the signature stays model-agnostic, and recompilation is a scripted rerun, not a manual prompt-rewriting effort.

**4. How does DSPy's approach to improving pipeline quality differ from fine-tuning?**
A. They are the same thing under different names
B. DSPy changes model weights; fine-tuning changes prompts
C. DSPy optimizes prompts/few-shot examples against a frozen model; fine-tuning updates the model's weights
D. DSPy only works with open-weight models; fine-tuning only works with API-based models

Answer: C. Explanation: these are distinct levers — DSPy never touches model weights, it searches over prompt-level artifacts; fine-tuning does gradient-based weight updates.

**5. What is the risk of scoring a compiled program only on the examples it bootstrapped few-shot demonstrations from?**
A. No risk — this is the correct way to evaluate
B. It measures memorization/in-sample fit rather than generalization to new inputs
C. It makes compilation run faster
D. It causes a compile-time error

Answer: B. Explanation: this is the prompt-optimization equivalent of train/test leakage — a held-out validation split is needed to get a trustworthy quality signal.

**6. Where should the compile step run in a production system?**
A. Inline, on every incoming request, so the program is always freshly optimized
B. As an offline/CI build step, with the resulting artifact persisted and served
C. On the client side, before sending a request
D. It doesn't need to run at all if you use ChainOfThought

Answer: B. Explanation: compilation is slow and makes many LLM calls across candidate evaluations; it belongs in a build/release pipeline, with the compiled artifact cached and served at request time.
`,

  "revision-notes": `
DSPy reframes LLM pipeline development as programming rather than prompting: instead of hand-writing prompt strings, you declare a step's intent via a **signature** (input fields, output fields, task description), implement it with a **module** that encodes a prompting strategy (Predict for direct prediction, ChainOfThought for reasoning-first, agentic modules for tool use), and compose modules into a **program** using ordinary Python control flow. This solves real pain: hand-tuned prompts are brittle across models, don't scale to multi-step pipelines, and are typically tuned by vibes rather than measurement.

The engine that makes this useful is **optimization/compilation**: given a metric function (that scores whether an output is good) and a small trainset, an optimizer runs the program repeatedly, bootstraps candidate few-shot demonstrations from good-scoring runs, sometimes searches over instruction phrasings too, and selects the best-scoring candidate — producing a compiled program with baked-in demonstrations and/or refined instructions. This is not a hand-editable output; changes should flow through the metric/trainset and a recompile, never a manual edit of the compiled artifact.

The portability story is the key payoff: because the signature is model-agnostic and only the compiled artifact is model-specific, migrating to a new underlying LLM means reconfiguring the target model and rerunning the same optimizer against the same trainset/metric — not manually rewriting every prompt by hand. This turns a recurring, error-prone manual-tuning cost into a scripted, repeatable engineering step.

Critically, DSPy does not remove the need for prompting judgment (you still design signatures and interpret module behavior) or for evaluation rigor (metrics are mandatory, not optional — this is the same discipline the AI Evals skill teaches). It is also not a fine-tuning substitute — it optimizes against a frozen model's weights, while fine-tuning changes the weights themselves; the two solve different problems and can be combined. In production, a compiled DSPy program still needs standard LLM-service engineering (timeouts, retries, monitoring, cost tracking) plus the same versioning discipline any prompt-shaped artifact needs, since a compiled program is, underneath, still prompts and examples running in production.

DSPy is a fast-moving, research-adjacent framework whose exact API (module names, optimizer names) has shifted across versions since its 2023 public release. Treat this page's code as illustrating the durable mental model — signatures, modules, programs, metrics, compilation — and always verify exact API details against the installed version's own documentation before writing production code.
`,

  "learning-roadmap": `
**Week 1 — Foundations and signatures.** Read Overview through Prerequisites on this page. Make sure you've done real manual prompt engineering first (see the **Prompt Engineering** skill) so you feel the pain DSPy automates. Write 3–4 signatures for simple tasks (classification, extraction, short-answer QA) and call them with a plain Predict module, no compilation yet. Milestone: comfortable writing a signature and reading its zero-shot output.

**Week 2 — Metrics and evaluation discipline.** Study the **AI Evals** skill in parallel. Write metric functions for your Week 1 tasks, hand-test them against known-good and known-bad predictions, and curate a small (20–40 example) labeled trainset sourced from realistic inputs. Milestone: a metric you trust and a trainset you'd be comfortable optimizing against.

**Week 3 — Compilation and multi-step programs.** Compile your Week 1 programs with a bootstrap-style optimizer, using a proper train/validation split, and compare compiled vs. uncompiled metric scores. Build a two-step retrieve-then-answer program (pairing with the **LlamaIndex** skill for the retrieval half) and compile it end to end. Milestone: a compiled, validated program with a documented quality improvement over the zero-shot baseline.

**Week 4 — Production engineering and portability.** Persist a compiled artifact, wrap it in a minimal service with timeouts/logging/monitoring, and practice the recompile workflow by targeting a second model with the same trainset/metric. Read the **Prompt Versioning** skill and apply its versioning discipline to your compiled artifact. Milestone: a small, monitored service serving a compiled DSPy program, with a tested recompile-for-a-new-model procedure.

Next skill on this platform: once you're comfortable with metric-driven prompt optimization, move to the **Fine-Tuning** skill to understand the complementary, weight-updating lever for cases where no amount of prompt/example optimization can elicit the behavior you need.
`,

  "official-docs": `
- **DSPy official documentation** (Stanford NLP / dspy.ai project site) — the canonical source for current signature syntax, module list, and optimizer/teleprompter names; always check this before relying on any specific class name from a tutorial, including this page.
- **DSPy GitHub repository** — README, examples directory, and changelog/release notes; the fastest way to confirm what API surface exists in the version you've installed.
- **DSPy API reference** (auto-generated from source, typically linked from the documentation site) — the ground truth for method signatures on Signature, Module, Predict, ChainOfThought, and optimizer classes.

Note: because DSPy's API has moved across versions, always cross-check the documentation VERSION against your installed package version rather than assuming the latest docs match an older pinned dependency, or vice versa.
`,

  books: `
- **"Designing Machine Learning Systems" by Chip Huyen** — not DSPy-specific, but essential for the evaluation-driven-development mindset (train/validation discipline, metric design) that DSPy optimization depends on entirely.
- **"Building LLM Applications" style practitioner guides (various authors, check current editions)** — general LLM pipeline engineering books increasingly cover declarative prompt-optimization frameworks like DSPy as part of the broader RAG/agent tooling landscape; verify current editions include DSPy-specific content since this is a fast-changing space.
- **Research papers from the DSPy lineage (see Research Papers section below)** — for DSPy specifically, the primary "books" equivalent is really the original papers and the official documentation, since a settled, comprehensive book treatment of a framework this young and fast-moving may not yet exist or may quickly go stale; verify availability before recommending a specific title.

Honest note: unlike a mature language like Python, DSPy is young enough that there may not yet be a canonical, up-to-date book dedicated to it. The primary durable references are the original research papers and the official documentation/examples, supplemented by general evaluation-driven-development texts for the surrounding discipline.
`,

  blogs: `
- **The official DSPy blog/documentation site's own written guides and example walkthroughs** — highest-signal source for current patterns, since it tracks the actual shipped API.
- **Stanford NLP group publications and associated blog posts** on retrieval-augmented generation and pipeline optimization — useful for the research context behind DSPy's design choices.
- **Practitioner write-ups from teams that have adopted DSPy in production** (search for recent, dated posts specifically, given how fast the API has moved) — prioritize posts that show a full worked example with signatures, a metric, and a compile step, over posts that only show a toy signature with no evaluation.

Caveat: many blog posts about DSPy age quickly given the framework's pace of change — prefer recently dated posts and cross-check any code snippet against the current official documentation before trusting it.
`,

  "research-papers": `
DSPy has a real, citable research lineage — this is not a thin area, though it is young:

- **The original DSPy paper** (Khattab, Potts, Zaharia, and collaborators, Stanford NLP) introducing signatures, modules, and teleprompters/optimizers as a framework for programming — rather than prompting — foundation model pipelines.
- **The predecessor DEMONSTRATE-SEARCH-PREDICT line of research**, which explored composing retrieval and generation steps in LM pipelines and laid conceptual groundwork later formalized in DSPy.
- **Papers on specific optimizer strategies** (bootstrap-based few-shot selection, instruction-search methods) that DSPy's optimizer implementations draw on or were introduced alongside.

If you want the closest FOUNDATIONAL reading beyond DSPy's own papers: look at broader work on prompt optimization and automatic prompt search (treating prompt engineering as a search/optimization problem generally), and work on in-context learning and few-shot example selection, since these are the intellectual ancestors of what DSPy's optimizers do mechanically. Always verify exact paper titles, author lists, and venues via a fresh search rather than trusting a remembered citation, since precise bibliographic details are exactly the kind of fact worth double-checking before citing formally.
`,

  videos: `
- **Talks by the DSPy creators (Omar Khattab and collaborators) at NLP/ML conferences or university seminars** — look for recorded talks introducing the signatures/modules/optimizers framing directly from the source; highest fidelity to the actual design intent.
- **Conference/workshop talks on "programming vs. prompting" or "compound AI systems"** — DSPy is frequently discussed as a concrete instance of the broader "compound AI systems" framing (pipelines of multiple models/steps optimized jointly), a useful wider lens.
- **Recorded live-coding walkthroughs from the DSPy community** (search for recent, dated ones) showing a full signature-to-compiled-program workflow end to end — prioritize these over slide-only talks since seeing the actual API in use is more useful given how much it has changed.

Caveat: specific video titles/creators/dates are not included here since recommending named URLs without verification risks pointing to outdated or incorrect sources — search for current, well-reviewed talks before relying on a specific one.
`,

  "github-repos": `
- **The official DSPy repository (Stanford NLP)** — the framework's source, examples directory, and issue tracker; the single most authoritative technical reference for current API behavior.
- **DSPy examples/cookbook directories** (often within or linked from the main repository) — worked examples of retrieve-then-answer pipelines, classification pipelines, and agentic modules, useful as starting templates.
- **Community-maintained integration repositories** connecting DSPy to specific vector stores or retrieval backends — useful when building the retrieval half of a program (also see the **LlamaIndex** skill for retrieval-focused tooling).
- **Repositories implementing the DEMONSTRATE-SEARCH-PREDICT predecessor work** — useful for understanding the research lineage behind DSPy's design.
- **General "compound AI systems" or "LLM pipeline optimization" repositories** that reference or build on DSPy — useful for seeing DSPy used alongside other tooling in a fuller production-style stack.

Caveat: star counts, exact repository names, and maintenance status change quickly in this space — verify a repository is actively maintained (recent commits, open issues being triaged) before adopting it as a dependency.
`,

  "practice-problems": `
Ordered by skill focus, building from signature basics to full pipeline optimization:

1. **Signature design drills** — write signatures for 5 different simple tasks (classification, extraction, translation-style rewriting, summarization, short QA), focusing on clear, single-purpose input/output fields.
2. **Module selection drills** — for each of the 5 tasks above, decide (and justify) whether Predict or ChainOfThought is more appropriate, then verify your choice empirically with a metric.
3. **Metric-writing drills** — write metrics of increasing sophistication: exact match, normalized match (case/whitespace-insensitive), partial credit (e.g., token overlap or numeric tolerance), and an LLM-as-judge metric for one genuinely open-ended task.
4. **Train/validation discipline drill** — deliberately compile a program while scoring only on bootstrap examples, observe the inflated score, then redo it with a proper held-out split and compare the honest score.
5. **Multi-step composition problem** — build a 3-stage program (e.g., extract → validate → summarize) with a signature per stage, and compile the whole pipeline against a single end-to-end metric.
6. **Model-portability exercise** — compile the same program against two different models with an identical trainset/metric, and analyze what changed in the selected demonstrations/instructions.
7. **External practice**: search for the official DSPy repository's examples/cookbook directory and work through its provided notebooks, since these track the current API most reliably; also search for any current open evaluation-benchmark-style DSPy exercises maintained by the community.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Dev["Development Time (source of truth)"]
        SIG["Signatures\n(input/output fields + intent)"]
        MOD["Modules\n(Predict / ChainOfThought / agentic)"]
        PROG["Program\n(Python composition, dspy.Module)"]
        TRAIN["Trainset\n(version-controlled labeled examples)"]
        METRIC["Metric function\n(version-controlled scoring logic)"]
        SIG --> MOD --> PROG
    end

    subgraph Compile["Compile Time (offline, CI)"]
        OPT["Optimizer / Teleprompter"]
        VAL["Validation split scoring"]
        ARTIFACT["Compiled Program Artifact\n(tagged: model + score + version)"]
        PROG --> OPT
        TRAIN --> OPT
        METRIC --> OPT
        OPT --> VAL --> ARTIFACT
    end

    subgraph Serve["Serving Time (production)"]
        STORE["Artifact Store"]
        SVC["Service (timeouts, retries, caching)"]
        LLM["Underlying LLM Provider"]
        MON["Monitoring: latency, cost, live-traffic metric sampling"]
        ARTIFACT --> STORE --> SVC
        SVC --> LLM --> SVC
        SVC --> MON
    end

    MON -. "quality drift detected" .-> TRAIN
    MON -. "quality drift detected" .-> OPT
~~~

This diagram captures the full lifecycle: signatures/modules/programs and the trainset/metric are the durable source artifacts; compilation is an offline build step producing a versioned, model-tagged artifact; serving wraps that artifact with standard production concerns; and monitoring feeds back into a recompile decision, closing the loop.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((DSPy))
    Philosophy
      Programming not prompting
      Declare intent, not wording
      Prompts as compiled artifacts
    Core Abstractions
      Signature
        Input fields
        Output fields
        Task description
      Module
        Predict
        ChainOfThought
        Agentic / tool-using modules
      Program
        Python composition
        Control flow, loops, conditionals
    Optimization
      Metric function
        Exact match
        Partial credit
        LLM-as-judge
      Trainset
        Curated from real traffic
        Train / validation split
      Optimizer / Teleprompter
        Bootstrap few-shot style
        Instruction search style
        Joint search style
      Compiled Program
        Baked-in demonstrations
        Refined instructions
        Model-tagged artifact
    Production
      Offline compile step in CI
      Persisted, versioned artifact
      Serving: timeouts, retries, monitoring
      Recompile on model migration
      Prompt versioning discipline
    Relationships
      Prompt Engineering: the manual search DSPy automates
      AI Evals: the metric discipline DSPy requires
      Fine-Tuning: weights vs prompts, different lever
      Prompt Versioning: still needed in production
      LlamaIndex: retrieval half of a pipeline
      PydanticAI: type-safe agent construction, complementary
    Caveats
      Fast-moving research-adjacent framework
      API has changed across versions
      Verify current docs before production use
~~~
`,
};

export default dspy;
