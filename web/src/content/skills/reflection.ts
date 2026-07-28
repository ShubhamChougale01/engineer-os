import type { SkillContent } from "../types";

/**
 * Reflection — full 50-section knowledge page.
 * Covers self-critique loops in AI agents: generate-critique-revise patterns,
 * Reflexion-style verbal self-feedback, self-consistency as a contrasting
 * technique, and an honest treatment of reflection's mixed empirical
 * track record. Sibling skill to Agent Fundamentals, Planning, Evaluation,
 * Hallucination, Prompt Engineering, and LangGraph.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const reflection: SkillContent = {
  overview: `
Reflection, in the context of AI agents, is the practice of having a model evaluate and improve its own output before finalizing it or acting on it, rather than committing to the first thing it generates. Mechanically, it is a second (or third, or Nth) pass over already-generated content: the model, or a separate critic, is prompted to critique a draft against some standard, and that critique is used to produce a revised draft. The core loop is generate, critique, revise — repeated until a stopping condition fires, whether that is a fixed iteration count, a judged "good enough" signal, or a budget running out.

For an AI engineer, reflection sits alongside **Planning** and **Agent Memory** as one of the cross-cutting capabilities layered on top of the perceive-plan-act-observe loop covered in **Agent Fundamentals**. Where Planning is about deciding what to do next, and Memory is about what to remember, Reflection is about verifying and improving what has already been produced — checking an agent's own draft answer, its own proposed plan, or its own tool-call arguments before those are treated as final. It is easy to describe reflection as an unambiguous quality upgrade ("of course checking your work helps"), and this page will resist that framing: the honest, current state of the evidence is that reflection helps meaningfully on some tasks and models, does little or nothing on others, and in some configurations makes results worse while always adding cost and latency. Treating reflection as a guaranteed win, rather than a technique to be evaluated per task like any other, is the single biggest mistake this page tries to prevent.

Key characteristics worth internalizing up front: reflection is not a different kind of model capability, it is a prompting and control-flow pattern built on the same underlying LLM covered in **LLM Fundamentals** and **Prompt Engineering**; it trades latency and token cost for a chance (not a guarantee) of higher quality; it can be implemented with the same model critiquing itself or with a separate critic model or prompt, each with different cost and bias tradeoffs; and it requires an explicit stopping criterion, because an unbounded refine-forever loop is exactly as real a failure mode here as the infinite-loop failure mode covered for general agents in **Agent Fundamentals**. This page treats reflection as one tool in a toolbox that also includes self-consistency (sampling many independent outputs and aggregating, rather than iteratively improving one), external verification (checking against ground truth or executable tests rather than another LLM's opinion), and simply spending the reflection budget on a better first-pass prompt instead.
`,

  history: `
The idea of a system checking and revising its own output is far older than large language models — classical software engineering has always had review, linting, and test-then-fix cycles, and cognitive science has long studied metacognition (thinking about one's own thinking) in humans. What is specific to the LLM era is the discovery that a language model, prompted appropriately, can produce a plausible-sounding critique of its own prior output in natural language, and that this critique can then be fed back in to produce a revision — turning "self-review" from a structural, code-level process into something expressible entirely in prompted text.

| Year | Milestone |
|------|-----------|
| Pre-2022 | Software engineering practice (code review, test-driven development) and cognitive-science research on metacognition establish "check your own work" as a general problem-solving strategy, independent of LLMs |
| 2022 | Chain-of-thought prompting demonstrates that asking a model to reason step by step, rather than jump straight to an answer, improves performance on many reasoning tasks — laying groundwork for the idea that additional inference-time text can improve output quality without changing model weights |
| 2023 | Self-Refine and related generate-critique-revise papers formalize the pattern of prompting a model to critique its own draft output and then revise it, iterating a small number of times |
| 2023 | Reflexion introduces verbal reinforcement: an agent that fails a task generates a natural-language self-reflection on what went wrong, stores it in an episodic memory buffer, and consults that reflection on subsequent attempts at similar tasks — reflection as learning-from-failure-in-text rather than only single-pass polishing |
| 2023–2024 | Self-consistency (sampling multiple independent chain-of-thought outputs and taking a majority vote) becomes a widely cited contrasting technique, showing that "generate several and aggregate" can rival or beat "generate one and iteratively refine it" on some reasoning benchmarks |
| 2024–2025 | A growing body of follow-up evaluation work reports mixed results for self-critique specifically: meaningful gains on tasks with a clear, checkable correctness signal (code that can be executed, math that can be verified), and inconsistent-to-negative gains on open-ended or subjective tasks, especially when the same model critiques itself without an external ground truth |

This page describes the concepts and the current, honest state of the evidence — it does not present reflection as a settled, universally beneficial technique, because the research record genuinely does not support that claim. See Latest Updates and Research Papers for what is current when you read this.
`,

  "why-it-exists": `
Before reflection was treated as a distinct technique, using an LLM meant taking its first completion as final: one prompt, one generation, done — the same single-shot pattern described in **Agent Fundamentals**. This works fine when the first draft is already good enough, but many tasks expose a gap between what a model can generate and what it can recognize as wrong when re-reading the same content with fresh instructions to look for problems. A model asked to "write a function that reverses a linked list" may produce code with an off-by-one bug; the same model, shown that code and asked "does this handle an empty list correctly," will sometimes catch the bug it just made — not because it suddenly became smarter, but because critique is a different prompted task than generation, with a different framing that can surface errors generation's forward momentum glossed over.

The gap reflection filled: **a way to spend additional inference-time compute checking and improving one candidate output, rather than only ever taking the first thing generated.** This is closely related to, but distinct from, the broader idea (see **Planning** and reasoning-model coverage in **LLM Fundamentals**) that spending more computation before finalizing an answer can improve quality — reflection specifically frames that extra computation as an explicit critique-then-revise cycle over a concrete draft, in natural language, rather than only longer internal reasoning before a single final output.

The honest caveat that belongs in this section, not buried later: the mechanism above is a hypothesis about why reflection sometimes works, not a guaranteed property of language models. A model's ability to critique its own output is bounded by the same knowledge and capability limits that produced the flawed output in the first place — if a model does not know a fact, or cannot reliably reason about a certain class of problem, asking it to "check its work" on that fact or problem does not manufacture new capability. This is why reflection helps unevenly: it helps most when the error is the kind of thing a different framing or a fresh read can catch (a logic slip, an unhandled edge case stated explicitly), and helps least when the model's underlying knowledge or reasoning is simply insufficient for the task.
`,

  "problem-it-solves": `
Reflection targets the problem of a first-pass LLM output containing errors, omissions, or quality issues that a second, differently-framed look might catch. Concrete pains it can address:

- **Logical or arithmetic slips in a single generation** that a targeted "check this step" pass sometimes catches, particularly when the model is prompted to verify a specific, checkable claim rather than restate confidence in the whole answer.
- **Unstated edge cases** in generated code or plans, when the critique step is explicitly prompted to look for them ("does this handle empty input, does this handle the size-one case") rather than asking a vague "is this good."
- **Premature termination in agent loops** — see **Agent Fundamentals**' discussion of "am I actually done" — where a verification pass can catch a model declaring success before a goal is genuinely met.
- **Style, structure, and completeness gaps** in generated text, where a critique pass checking against an explicit rubric (does this cover all required sections, does this match the requested tone) can catch omissions a single generation pass missed.
- **Accumulating a reusable, text-form lesson from a failed attempt** (the Reflexion pattern) so that a subsequent attempt at a similar task starts with an explicit note of what went wrong last time, rather than repeating the same mistake with no memory of it.

What reflection deliberately does **not** solve, and should not be expected to:

- **Manufacture knowledge or capability the model does not have.** If the model does not know a fact, or genuinely cannot solve a class of problem, asking it to critique its own attempt does not create the missing knowledge — critique is bounded by the same model doing the generating, and self-critique in particular can only surface what that model is already capable of recognizing as wrong. See **Hallucination** for the closely related failure mode where a model confidently reflects on and "confirms" a fabricated claim rather than catching it.
- **Guaranteed quality improvement on every task.** As covered honestly throughout this page, and especially in Advanced Concepts and FAQs, reflection's benefit is inconsistent across task types, models, and prompt designs — on some tasks it improves measured quality; on others it makes no measurable difference; on some it degrades quality (for instance if the critique step introduces an unnecessary "fix" to something that was already correct).
- **Cheapness.** Every reflection iteration is at least one additional model call — the same latency and cost tax described for agent loops in **Agent Fundamentals** applies directly here, and reflection loops without a stopping criterion are exactly as real a runaway-cost risk as an unbounded agent loop.
- **A substitute for external verification where it is available.** When ground truth exists — a test suite that can actually run the code, a calculator that can actually check the arithmetic, a retrieval system that can actually confirm a fact — using that external signal is almost always more reliable than another round of the same (or a similar) LLM opining on its own output; this distinction is central to Advanced Concepts below.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Define reflection precisely as a generate-critique-revise loop and explain what specifically it adds on top of a single-shot LLM call.
2. Implement a basic generate-critique-revise loop with an explicit maximum iteration count and a concrete stopping condition.
3. Explain the Reflexion pattern (verbal self-feedback stored in memory and reused on subsequent attempts) and how it differs from single-pass self-refinement.
4. Contrast self-consistency (sampling multiple independent outputs and aggregating) with reflection (iteratively improving one output), and state at least two concrete reasons to prefer one over the other for a given task.
5. Distinguish self-critique (same model critiques its own output) from using a separate critic model or prompt, and explain the bias and cost tradeoffs of each.
6. Design a stopping criterion for a reflection loop that avoids both premature termination and infinite refinement.
7. Give at least three concrete examples of tasks where empirical evidence shows reflection helping, and at least two where it shows no benefit or harm, and explain the likely reason for the difference.
8. Explain why "the model says it's better now" is not sufficient evidence that a revision is actually better, and describe what a rigorous evaluation of a reflection pipeline requires.
9. Judge, given a task description, whether reflection, self-consistency, external verification, or simply a better first-pass prompt is the more cost-effective quality lever.
10. Map reflection's place among the sibling agent skills (**Agent Fundamentals**, **Planning**, **Evaluation**, **Hallucination**, **Prompt Engineering**, **LangGraph**) and explain how it composes with each.
`,

  prerequisites: `
- **Required**: a solid grasp of **Agent Fundamentals** — the perceive-plan-act-observe loop, the idea of a stopping condition owned by code rather than the model, and the compounding-error arithmetic of chaining multiple model calls all apply directly to reflection loops, which are themselves a chain of model calls. You should also be comfortable with core **Prompt Engineering** ideas (instructions, few-shot examples, structured output), since both the "generate" and "critique" steps of a reflection loop are just prompted LLM calls.
- **Strongly recommended before this page**: the **Evaluation** skill's core methodology — because judging whether reflection actually helped requires measuring end-to-end quality against a reliable metric or ground truth, not trusting a model's self-reported confidence, and this page leans on that methodology repeatedly.
- **Helpful**: basic Python for the worked examples; familiarity with the **Hallucination** skill, since self-critique of a factual claim can itself hallucinate a plausible-sounding but wrong justification; a first pass over the **Planning** skill, since some reflection-adjacent techniques (re-planning after a failed attempt) sit at the boundary between planning and reflection.
- **Not required**: prior experience with any specific framework. This page builds the generate-critique-revise loop from scratch before mentioning any framework so the concept is not confused with one library's API surface; **LangGraph** is referenced later as one common way to implement reflection loops as an explicit graph with cycles.

Dependency links: **LLM Fundamentals** → **Prompt Engineering** → **Agent Fundamentals** → this page (**Reflection**), alongside **Planning** and **Agent Memory** as sibling cross-cutting capabilities → **Evaluation** (to actually measure whether reflection is helping) and **Hallucination** (to understand a specific failure mode reflection can either mitigate or reproduce) → **LangGraph** (a common implementation substrate for explicit, cyclic reflection loops).
`,

  "beginner-concepts": `
### The single-shot baseline, for contrast

Before defining reflection, be precise about what it adds to. A single-shot call, as in **Agent Fundamentals**, is one prompt, one completion, done — whatever the model produces first is what gets used.

~~~text
Prompt: "Write a Python function that checks if a string is a palindrome."
  -> one completion generated
  -> used as-is, no further model calls for this task
~~~

### The generate-critique-revise loop

Reflection adds two more prompted steps around the same generation: a critique step, where the model (or a different model) is asked to evaluate the draft against some standard, and a revise step, where the model produces a new draft informed by that critique.

~~~text
1. GENERATE: produce an initial draft answer to the task.
2. CRITIQUE: prompt (the same or a different model) to evaluate the draft
   -- what is wrong, missing, or could be improved, specifically.
3. REVISE:   prompt the model to produce a new draft that addresses the
   critique.
4. REPEAT from step 2 with the new draft, until a stopping condition:
   the critique reports no more issues, a maximum iteration count is
   hit, or a budget runs out.
~~~

### A minimal worked example: one critique-revise cycle

~~~python
# A deliberately small, from-scratch reflection loop -- no framework, so
# the mechanics are visible. Uses a stand-in call_llm the same way
# Agent Fundamentals' beginner example does.

def call_llm(prompt: str) -> str:
    """Stand-in for a real LLM API call. Replace with your provider's
    client in a real system."""
    raise NotImplementedError("wire this up to a real LLM API")

def generate_draft(task: str) -> str:
    return call_llm(f"Task: {task}\\nProduce your best answer.")

def critique_draft(task: str, draft: str) -> str:
    return call_llm(
        f"Task: {task}\\nDraft answer:\\n{draft}\\n\\n"
        "List concrete problems with this draft (correctness, missing "
        "edge cases, unclear parts). If there are no real problems, "
        "respond with exactly: NO_ISSUES."
    )

def revise_draft(task: str, draft: str, critique: str) -> str:
    return call_llm(
        f"Task: {task}\\nPrevious draft:\\n{draft}\\n\\n"
        f"Critique:\\n{critique}\\n\\n"
        "Produce a revised draft that addresses the critique."
    )

def reflect_and_revise(task: str, max_iterations: int = 3) -> str:
    draft = generate_draft(task)
    for _ in range(max_iterations):
        critique = critique_draft(task, draft)
        if critique.strip() == "NO_ISSUES":
            break
        draft = revise_draft(task, draft, critique)
    return draft
~~~

Notice the hard cap (max_iterations) — exactly as in an agent loop, a critique step that never reports NO_ISSUES (or a model that keeps finding something to "fix" even when the draft is already fine) will otherwise iterate forever, burning tokens without necessarily improving quality. This is the first thing Advanced Concepts and Common Mistakes come back to: the loop must have an externally enforced stopping condition, not one that depends solely on the critique step's own judgment.

### Reflection vs a plain re-prompt

A subtlety worth being precise about early: simply re-prompting a model with "are you sure, try again" is a weak, unstructured form of reflection at best — it does not tell the model what to look for. Effective reflection prompts the critique step with an explicit standard (correctness, specific edge cases, a rubric) rather than a vague request for confidence, because a model asked only "are you sure" will often just restate confidence in the same answer rather than genuinely re-examining it.
`,

  "intermediate-concepts": `
### Reflexion: verbal self-feedback stored and reused

The Reflexion pattern extends single-pass self-refinement into something closer to learning from experience across attempts, without updating model weights. When an agent fails a task (or a verifier determines the outcome was wrong), it is prompted to produce a natural-language reflection on what went wrong and what to do differently, and this reflection is stored in an episodic memory buffer — see **Agent Memory** for the general storage and retrieval mechanics. On a subsequent attempt at the same or a similar task, that stored reflection is included in the prompt, giving the model an explicit, text-form lesson from its own prior failure rather than starting from scratch each time.

~~~text
Attempt 1: agent tries task, fails (e.g. an executed test suite reports
  failures, or an external verifier flags the outcome as wrong).
Reflect:   "I assumed the input list was always non-empty and did not
  handle the empty-list case, which caused an index error."
Store:     this reflection is appended to an episodic memory buffer.
Attempt 2: agent retries the same or a similar task, with the stored
  reflection included in its prompt/context -- explicitly reminded of
  the specific mistake to avoid this time.
~~~

Reflexion's key departure from a single generate-critique-revise cycle is that the feedback loop spans multiple attempts at a task (or task family), not multiple passes within one generation, and it requires an external or semi-external signal of success or failure to trigger the reflection step meaningfully — without some way to know an attempt failed (executed tests, a verifier, explicit environment feedback), there is nothing to reflect productively on beyond the model's own unverified opinion of its own performance.

### Self-critique with the same model vs a separate critic

The simplest configuration uses the same model for generation and critique — cheaper (one model, one set of API credentials, one prompt template family to maintain) but structurally prone to a specific bias: a model that made an error because it does not know something, or reasons a certain way, will often apply that same gap or bias when critiquing its own output, since the critique is produced by the same underlying capability that produced the flaw. A separate critic — a different model (often stronger, sometimes just differently prompted or differently specialized), or a distinct prompt persona with different instructions and framing — can catch classes of error the generating model is systematically blind to, at the cost of an additional model call (and, if using a different/stronger model, additional expense per call).

~~~text
Same-model self-critique:
  Model A generates -> Model A critiques its own output -> Model A revises
  Cheaper, simpler; critique inherits generation's blind spots.

Separate critic:
  Model A generates -> Model B critiques (different model, or same model
  with a deliberately distinct persona/instructions) -> Model A (or B)
  revises
  More expensive; can catch errors Model A is structurally blind to,
  especially if Model B is a stronger model or has a genuinely different
  vantage point (e.g. explicitly instructed to look only for a narrow
  category of error, such as unhandled edge cases).
~~~

Neither configuration substitutes for external, ground-truth verification where one is available (see Advanced Concepts) — both are still an LLM's opinion about an LLM's output, and that opinion can be wrong in either direction: flagging a correct answer as flawed, or missing a real flaw.

### Self-consistency, as the contrasting technique

Self-consistency takes a different bet entirely: instead of generating one output and iteratively improving it, sample multiple independent outputs (typically with some sampling temperature, so the completions genuinely differ) and aggregate them — commonly by majority vote for tasks with a discrete, checkable answer (a final numeric answer, a multiple-choice selection), or by some other aggregation for less discrete outputs.

~~~text
Reflection:        one draft -> critique -> revise -> critique -> revise ...
                    (sequential, each step conditioned on the last)

Self-consistency:   generate N independent drafts in parallel -> aggregate
                    (e.g. majority vote on the final answer)
                    (parallel, each draft independent of the others)
~~~

The practical tradeoff: self-consistency parallelizes well (all N generations can run concurrently, so wall-clock latency does not have to scale with N the way a sequential reflection loop's latency scales with iteration count) and does not depend on the model being able to accurately critique its own work — it only depends on independent errors being less likely to agree with each other than correct answers are, which holds reasonably well for tasks with one clearly correct final answer and fails to apply cleanly to open-ended tasks with no single "correct" output to vote on. Reflection, by contrast, can in principle catch and fix a specific identified flaw rather than merely hoping the majority of independent attempts happens to avoid it, but only if the critique step can actually recognize the flaw — which, as covered in Why It Exists and repeated throughout this page, is not guaranteed. Many published evaluations report self-consistency matching or beating single-model self-critique on tasks with a clear final-answer structure (certain math and reasoning benchmarks), while reflection-style approaches show more benefit on tasks with an executable or externally checkable intermediate signal (code that can be run against tests). Treat any specific numeric comparison you read as a snapshot from a particular benchmark and model generation, not a permanent ranking — see Comparisons and Latest Updates.
`,

  "advanced-concepts": `
### When reflection helps vs when it is latency and cost with no benefit

The single most important judgment call this page asks you to make repeatedly is: will critique on this task actually surface a fixable error, or will it just add a model call that changes nothing (or makes things worse)? A rough, evidence-informed decision framework:

| Task characteristic | Reflection's likely value |
|---|---|
| Has an executable or otherwise external ground-truth check (tests pass/fail, a calculator confirms arithmetic, a linter flags a real issue) | High -- the critique step can be replaced or grounded by that external signal rather than relying solely on the model's opinion, which is the strongest configuration for reflection |
| Errors are the kind a differently-framed re-read can plausibly catch (an explicitly stated missing edge case, a stated logic step that can be re-verified) | Moderate -- self-critique or a separate critic can sometimes catch these, but not reliably; measure, do not assume |
| The task requires knowledge or reasoning capability the model genuinely lacks | Low to none -- asking the same (or a similarly-limited) model to check its own work does not manufacture the missing capability; a stronger model or an external tool is a better lever |
| The task is short, low-stakes, or the first-pass output is already commonly correct | Low, and often negative in cost-benefit terms -- the added latency and cost is rarely justified by a small, uncertain quality gain |
| The task is open-ended/subjective with no clear correctness signal even for a human judge | Uncertain and inconsistent -- without a way to judge whether a revision is actually better, a reflection loop can "polish" in a direction that is not obviously an improvement, and evaluating it rigorously is itself hard (see **Evaluation**) |

### Empirical honesty: reflection's mixed track record is not a footnote

It is worth stating directly and prominently, not as a caveat buried at the end: published evaluation results on self-critique/self-refinement are genuinely mixed, not uniformly positive. Some studies and practitioner reports find real, measurable gains, particularly where an external or execution-based signal grounds the critique step (code with tests, math with a checkable final answer). Other studies and practitioner reports find that self-critique by the same model produces little to no measurable improvement, or that a model asked to critique a correct answer will sometimes "find" a spurious problem and revise a correct answer into an incorrect one — a specific and well-documented failure mode of ungrounded self-critique. The honest position for an AI engineer to hold is: reflection is a technique to evaluate per task and per model, using the **Evaluation** skill's methodology, not a default quality upgrade to bolt onto every pipeline. Treat any blanket claim that "reflection improves quality" (in either direction) with the same skepticism you would apply to any other unverified performance claim about an LLM technique.

### Stopping criteria for reflection loops, precisely

An unbounded reflection loop is exactly as real a failure mode as an unbounded agent loop (see **Agent Fundamentals**' Failure Modes), and for the same underlying reason: nothing external forces the critique step to eventually say "no more issues" if left to its own judgment alone. A well-designed stopping criterion combines several signals, not just one:

~~~text
1. Hard maximum iteration count (e.g. 2-4) -- enforced in code, always
   present regardless of any other signal, exactly as a step limit is
   enforced for a general agent loop.
2. Explicit "no issues found" signal from the critique step -- but not
   trusted alone, since a critique step can under- or over-report issues.
3. Diminishing-returns detection -- if consecutive revisions are nearly
   identical (e.g. by a simple text-similarity check), further iteration
   is unlikely to be productive; stop rather than iterate on noise.
4. External verification, where available -- if tests pass, or an
   external check confirms correctness, stop regardless of what the
   critique step itself says, since the ground-truth signal is stronger
   than another round of LLM opinion.
5. A cost/token budget, independent of iteration count, exactly as in
   general agent loops -- some critique/revise cycles cost far more
   tokens than others (e.g. a critique that quotes the entire draft back).
~~~

Relying solely on signal 2 (the model's own "I am satisfied" judgment) is the reflection-specific version of the general agent anti-pattern of trusting the model's own judgment as the sole stopping condition — see **Agent Fundamentals**' Anti-Patterns for the parallel case in general agent loops.

### Reflection composed with planning and multi-agent architectures

Reflection is not only applied to a final text output — it composes with **Planning** (a proposed multi-step plan can itself be critiqued and revised before execution begins, catching an infeasible or incomplete plan before any real-world action is taken) and with multi-agent architectures (see **Agent Fundamentals**' multi-agent coverage), where a dedicated "critic" agent role reviews another agent's output as a structurally separate step, which is one concrete way to realize the "separate critic" configuration from Intermediate Concepts without hand-rolling a second prompt template inline.

### Reflection at the tool-call / action level, not just at the final-answer level

A narrower and often higher-value application of reflection is verifying a single proposed action before it executes — for instance, having the agent (or a separate check) confirm that a proposed tool call's arguments are sensible and match the stated goal before the call actually fires, rather than only reflecting on the final answer after all actions have already been taken. This is a lower-latency, more targeted form of reflection than critiquing an entire final output, and it directly supports the "am I actually done, and was that last action actually correct" verification role that **Agent Fundamentals**' Advanced Concepts section flags as one of reflection's most concrete, well-scoped uses inside a general agent loop.
`,

  "internal-working": `
Step by step, here is what actually happens inside one generate-critique-revise cycle, and how the loop as a whole is controlled:

~~~mermaid
flowchart TB
    A["Task / current draft (empty on first pass)"] --> B["GENERATE step:\nLLM call produces (or already has) a draft"]
    B --> C["CRITIQUE step:\nLLM call (same or different model) evaluates\nthe draft against an explicit standard"]
    C --> D{"Critique result"}
    D -->|"Specific issues found"| E["REVISE step:\nLLM call produces a new draft addressing\nthe critique"]
    E --> F{"Stopping condition met?\n(max iterations, diminishing returns,\ncost budget, external check passed)"}
    F -->|No| C
    F -->|Yes| G["Return current draft as final"]
    D -->|"No issues found / explicit approval"| G
~~~

1. **Generate (or receive) a draft**: the first pass through the loop is an ordinary LLM call producing a candidate answer, exactly as in a single-shot call; on subsequent passes, the draft is the output of the previous revise step.
2. **Critique**: a second LLM call is made, prompted with the task and the current draft, asked to evaluate it against an explicit standard (correctness, specific edge cases, a rubric, or — where available — the output of an external check such as a test run). The critique prompt's specificity matters enormously: asking "is this good" tends to produce vague, low-value critique; asking "does this handle input of length zero, does this handle duplicate values, is the time complexity what was requested" produces a critique that a revise step can actually act on.
3. **Decide whether to revise**: if the critique reports no material issues (or, more robustly, if an external check confirms correctness), the loop can stop here rather than manufacturing a change for its own sake.
4. **Revise**: if issues were found, a third LLM call produces a new draft, prompted with the task, the previous draft, and the critique, asked specifically to address the identified issues rather than to regenerate from scratch (which tends to lose whatever was already correct in the prior draft).
5. **Check the stopping condition**: after each revision, the loop checks the combined stopping criteria from Advanced Concepts (iteration count, diminishing returns, budget, external check) before deciding whether to critique again — critically, this check must be enforced in code, not left solely to the critique step's own judgment, for exactly the reason a general agent loop's termination must not depend solely on the model's own assertion that it is done (see **Agent Fundamentals**).
6. **Return**: the loop returns the current draft as final once any stopping condition fires.

The architectural fact this diagram makes visible: each of generate, critique, and revise is a separate, full LLM call with its own latency, token cost, and chance of a wrong judgment — a two-iteration reflection loop is at minimum three model calls (generate, critique, revise) before even checking whether a second critique pass is warranted, which is the direct cost basis for the "reflection is never free" framing throughout this page.
`,

  architecture: `
Understanding reflection architecture, for an AI engineer, means understanding both the internal shape of one critique-revise cycle (above) and how a real application should structure the surrounding control flow, budget enforcement, and — critically — the evaluation harness that determines whether reflection is actually earning its cost for a given task.

### The core components, at a glance

- **The generator** — the LLM call producing the current draft; the same kind of model call covered in **LLM Fundamentals** and **Prompt Engineering**.
- **The critic** — either the same model with a distinct critique prompt, or a genuinely separate model/persona; see Intermediate Concepts for the tradeoff.
- **The reviser** — the LLM call that produces a new draft from the prior draft plus the critique; often the same model as the generator, prompted differently.
- **The stopping-condition controller** — code, not a model, that enforces the maximum iteration count, tracks diminishing returns, checks any external verification signal, and enforces a cost/token budget, exactly analogous to the step-limit/cost-budget controller in a general agent loop (**Agent Fundamentals**).
- **External verification hooks (where available)** — a test runner, a calculator, a retrieval check, or any other ground-truth signal that can confirm or refute the draft's correctness independent of another LLM's opinion; wiring these in, where the task allows it, is consistently the highest-leverage architectural choice for making reflection reliable rather than merely plausible-sounding.

### Application architecture around a reflection loop

~~~mermaid
flowchart TB
    App["Application layer\n(task framing, quality bar)"] --> Loop["Reflection loop controller"]
    Loop --> Gen["Generator LLM call"]
    Gen --> Crit["Critic LLM call\n(same model or separate critic)"]
    Crit --> ExtCheck{"External verification\navailable for this task?"}
    ExtCheck -->|Yes| Verify["Run test / check / retrieval\nconfirmation"]
    ExtCheck -->|No| Decide["Decide from LLM critique alone"]
    Verify --> StopCheck["Stopping-condition controller\n(iterations, diminishing returns,\nbudget, external result)"]
    Decide --> StopCheck
    StopCheck -->|Continue| Rev["Reviser LLM call"]
    Rev --> Crit
    StopCheck -->|Stop| App
~~~

Key architectural principles:

- **The controller, not the critique step, owns termination.** Exactly as in a general agent loop, the model can propose that the draft is now acceptable, but a hard iteration cap and a cost budget enforced in code are the actual backstop.
- **External verification, when available, should sit ahead of (or alongside) the LLM critique, not behind it** — if a test suite can actually confirm correctness, that signal should gate the stopping decision more strongly than another round of LLM opinion, per Advanced Concepts.
- **Critique and revision are logged as first-class artifacts**, not discarded once a final draft is produced — being able to see what was flagged and what changed at each iteration is essential for debugging why a reflection pipeline did or did not improve quality, and directly supports evaluation.
- **The reflection loop's cost is variable, proportional to how many iterations a given task happens to need**, exactly the same operational property flagged for general agent loops in **Agent Fundamentals** — capacity and cost planning must account for a distribution of iteration counts, not a fixed per-task cost.
`,

  "data-flow": `
Tracing one reflection-augmented task end to end, from the initial request to the final revised answer, across two critique-revise cycles, one of which is grounded by an external check:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant Gen as Generator LLM
    participant Crit as Critic LLM
    participant Ext as External check (test runner)
    participant Rev as Reviser LLM

    User->>App: "Write a function that returns the kth largest\nelement in a list."
    App->>Gen: task
    Gen-->>App: draft v1 (uses a naive sort, off-by-one on k)
    App->>Crit: task + draft v1
    Crit-->>App: "Indexing looks off by one for k; also does not\nhandle k larger than the list length"
    App->>Ext: run draft v1 against test cases
    Ext-->>App: 2 of 5 tests fail (confirms the critique)
    App->>Rev: task + draft v1 + critique + failing test cases
    Rev-->>App: draft v2 (fixes indexing, adds a bounds check)
    App->>Ext: run draft v2 against test cases
    Ext-->>App: 5 of 5 tests pass
    App-->>User: draft v2 (stopped: external check passed)
~~~

The two facts this trace makes concrete: first, the external check (the test runner) did real, independent work here — it did not just repeat the critic's opinion, it confirmed the critic was right and, crucially, later confirmed the fix actually worked, which is a materially stronger stopping signal than "the critic says it looks fine now." Second, this whole task consumed at minimum four LLM calls (generate, critique, revise, and any confirming re-critique) plus two external test runs before returning an answer — every one of those calls is latency and cost that a correct-on-the-first-try single-shot generation would not have paid, which is exactly why the decision of whether to apply reflection at all (see Advanced Concepts' decision table) has to be made deliberately, not by default.
`,

  "production-usage": `
### How real teams actually use reflection in production

- **Reflection is applied selectively, not blanketly across every LLM call in a pipeline.** Teams that see real gains typically apply it to a specific, identified failure-prone step (a code-generation step, a data-extraction step with a strict schema) rather than wrapping every generation everywhere in a critique-revise cycle by default.
- **External, executable verification is preferred over LLM-only critique wherever the task allows it.** Code generation with a real test suite, structured-data extraction with a schema validator, and math with a symbolic or numeric checker are the strongest production use cases specifically because the "critique" can be grounded in something other than another LLM's opinion.
- **Iteration counts are kept low and bounded**, commonly one to three revise passes, not an open-ended "keep refining" loop — diminishing returns set in quickly, and the cost of additional iterations rises linearly while the marginal quality gain typically falls.
- **Reflection is evaluated, not assumed, before shipping.** Teams that take reflection seriously run an actual before/after comparison on a representative task set (see **Evaluation**) rather than adopting a critique-revise step because it sounds like it should help.
- **Separate-critic configurations are reserved for higher-stakes steps**, where the extra cost of a second model call (or a stronger, more expensive critic model) is justified by the consequence of a missed error — routine, low-stakes generations more commonly use same-model self-critique or skip reflection entirely.
- **Reflection is combined with, not substituted for, other quality levers** — a better first-pass prompt, a stronger base model, retrieval grounding (see **RAG**), and reflection are all competing (and sometimes complementary) ways to spend a quality budget, and production teams commonly find that improving the first-pass prompt is a cheaper and more reliable lever than adding a reflection pass on top of a weak prompt.

### Typical operational defaults

- Set a hard maximum number of critique-revise iterations per task (commonly one to three), sized to where measured marginal improvement has been shown to taper off for that specific task, not an arbitrary large number.
- Set a hard maximum total token/cost budget per task, independent of iteration count, since critique and revise calls can vary substantially in length.
- Wire in any available external verification (tests, validators, calculators) as a first-class stopping signal, checked before relying on the critique step's own "no issues" report.
- Log every draft, critique, and revision per task, so that "did reflection actually help on this run" can be reconstructed and periodically re-evaluated as models and prompts change.
`,

  "industry-examples": `
- **Coding assistants and autonomous coding agents** commonly use a reflection-like loop grounded in an executable signal: generate code, run the actual test suite, and if tests fail, feed the failure output back as the critique for a revision pass — a concrete, high-value example of reflection where the critique is not another LLM's opinion but a real, checkable result, and one of the most consistently positive reported use cases for this technique.
- **Structured-data extraction pipelines** (across several enterprise-data and document-processing tooling vendors) use a validate-and-retry pattern functionally equivalent to reflection: extract structured fields, validate against a schema, and if validation fails, feed the specific validation errors back for a corrected extraction — again grounded by an external, deterministic check rather than free-form LLM critique.
- **Research and writing assistants** (across several vendors) offer an explicit "critique and improve this draft" step as a user-facing feature, applying reflection to open-ended text where no external ground truth exists — reports on the measured quality benefit of this configuration specifically are more mixed than the code/schema cases above, consistent with the decision table in Advanced Concepts.
- **Multi-agent systems with a dedicated reviewer/critic role** (seen in several research-agent and content-pipeline architectures) implement the "separate critic" configuration from Intermediate Concepts structurally, as a distinct agent whose only job is to review another agent's output before it is finalized, rather than a single model switching hats mid-conversation.
- **Reflexion-style agents in interactive environments** (games, coding benchmarks, and tool-use benchmarks used in agent research) store natural-language reflections from failed attempts and reuse them on subsequent attempts, showing measurable improvement specifically in settings with a clear pass/fail signal per attempt to trigger the reflection meaningfully.

Pattern to notice: the most consistently reported production wins for reflection cluster around tasks with an external, executable, or otherwise checkable correctness signal — code, structured data, and pass/fail agent benchmarks — while open-ended, subjective text-improvement use cases show a more genuinely mixed track record, exactly per the empirical honesty emphasized in Advanced Concepts and History.
`,

  "best-practices": `
1. **Ground the critique step in an external, checkable signal whenever the task allows it** (tests, schema validators, calculators, retrieval confirmation) rather than relying solely on an LLM's opinion of its own or another draft — this is consistently the highest-leverage choice for making reflection actually reliable.
2. **Make the critique prompt specific, not vague.** "List concrete problems with correctness, missing edge cases, and any part that does not match the requirements" produces actionable critique; "is this good" does not.
3. **Set a hard maximum iteration count, enforced in code**, sized to where measured marginal improvement tapers off for the specific task, never left open-ended.
4. **Set a hard cost/token budget, independent of iteration count**, since critique and revise calls vary in length and cost.
5. **Evaluate reflection's actual effect before shipping it**, on a representative task set with a real before/after comparison (see **Evaluation**) — do not adopt a critique-revise step on the assumption that it must help.
6. **Use a separate critic (a different model, or a deliberately distinct persona) for higher-stakes steps**, where catching an error the generating model is structurally blind to justifies the extra cost.
7. **Prefer revising the existing draft over regenerating from scratch** in the revise step, so that whatever was already correct in the prior draft is preserved rather than re-risked.
8. **Detect diminishing returns and stop early** — if consecutive drafts are nearly identical, or the critique step keeps flagging the same unresolved point without progress, further iteration is unlikely to help and is a candidate for early termination or escalation.
9. **Log every draft, critique, and revision**, not just the final output, so that "did reflection help on this run" can be reconstructed and the loop debugged.
10. **Do not trust a model's self-reported confidence that a revision is better** as evidence that it actually is — validate against the task's real success criterion (tests, human review, a rubric checked independently) rather than the model's own assertion.
11. **Consider self-consistency or a stronger single-pass model as competing options** before defaulting to reflection, especially for tasks with a discrete, votable final answer — see Comparisons for when each wins.
12. **Apply reflection selectively to identified failure-prone steps**, not blanketly to every LLM call in a pipeline, since the cost of reflection scales with how many places it is applied, and its benefit does not.
`,

  "anti-patterns": `
### Reflecting without an external check when one is available

~~~text
WRONG: generate code, ask the same model "does this look correct,"
  accept its self-report, ship it -- with an actual test suite sitting
  unused.

RIGHT: generate code, RUN the test suite, feed real failures back as
  the critique, revise, re-run the tests -- let the ground truth, not
  the model's opinion, decide when to stop.
~~~

### Other common reflection-specific anti-patterns

- **No maximum iteration count, or an implausibly generous one** — the reflection-loop version of the general agent unbounded-loop failure mode; a critique step that keeps finding "one more thing" (or a model that keeps "fixing" an already-correct draft) will otherwise burn tokens indefinitely.
- **Treating "the model says it's better now" as sufficient evidence.** A model's self-reported confidence after a revision is not a reliable quality signal on its own; it must be checked against the task's actual success criterion, exactly as a general agent's own "I'm done" signal is not sufficient on its own (see **Agent Fundamentals**).
- **Applying reflection uniformly to every generation in a pipeline "just in case it helps."** This multiplies cost and latency across the whole pipeline for a benefit that, per Advanced Concepts, is genuinely inconsistent across task types — apply it deliberately to identified failure-prone steps, not everywhere by default.
- **Vague critique prompts ("is this good," "check your work") that produce vague, low-value critique.** A critique step needs an explicit standard to check against, or it tends to either rubber-stamp the draft or invent superficial changes.
- **Regenerating from scratch in the revise step instead of editing the existing draft**, which discards whatever was already correct and re-risks it, in addition to being unnecessary extra work.
- **Using self-critique on a task where the model's own knowledge or reasoning is the actual limiting factor.** If the model does not know a fact or cannot reliably reason about a problem class, its self-critique on that exact gap is not a reliable corrective — a stronger model, retrieval grounding (**RAG**), or a different technique entirely is the right lever, not another round of the same limited model reviewing itself.
- **Assuming reflection is a universal quality upgrade and skipping evaluation.** Shipping a critique-revise step without measuring its actual before/after effect on a representative task set is the single most avoidable mistake given how well-documented reflection's mixed track record already is.
`,

  performance: `
### Measure first

Before optimizing a reflection pipeline, instrument and measure, per task: number of critique-revise iterations taken, tokens consumed per iteration and in total, wall-clock latency per iteration and end to end, and — most importantly — actual quality improvement from first draft to final draft, measured against a real success criterion (tests, a rubric, human review), not the model's self-reported confidence. Without the last measurement specifically, you cannot tell whether reflection is earning its cost at all.

### The optimization hierarchy for reflection pipelines (apply in order)

1. **Confirm reflection is earning its cost on this specific task before optimizing its speed** — if a before/after evaluation shows no measurable quality gain, the highest-leverage optimization is removing the reflection step entirely, not making it faster.
2. **Ground the critique in an external check wherever possible**, which both improves reliability and often shortens the loop (a passing test suite is a crisp stop signal, ending iteration sooner than an open-ended LLM critique might).
3. **Reduce iteration count** by making the critique prompt specific enough that the reviser can address most issues in one pass, rather than needing several rounds to converge.
4. **Reduce tokens per step**: keep critique responses focused on concrete issues rather than restating the entire draft; keep the reviser's context to what it needs (task, prior draft, critique) rather than the full history of every earlier iteration.
5. **Choose the smallest/cheapest model that reliably critiques or revises at the needed quality bar**, rather than defaulting to the largest available model for every step — some pipelines use a cheaper model for the critique pass and reserve a stronger model only for the revise pass, or vice versa, depending on which step is the actual bottleneck for quality.
6. **Parallelize independent verification checks** (running multiple test cases, multiple validators) where the architecture supports it, reducing wall-clock latency even when total token cost is similar.

### Facts worth knowing at this level

- Reflection latency is dominated by the number of sequential LLM calls in the loop, exactly as in a general agent loop — a two-iteration reflection cycle is at minimum three to four model calls stacked end to end, unless some steps can be parallelized or short-circuited by an external check.
- Cost scales with total tokens across generate, critique, and revise calls, not just the final draft's tokens — a verbose critique step can cost more than the generation it is critiquing.
- Marginal quality gain per additional iteration tends to fall off quickly in practice; measuring this falloff for your specific task is what should set the iteration cap, not an arbitrary default.
`,

  scalability: `
Scalability for reflection-based systems has the same two distinct dimensions described for general agents in **Agent Fundamentals**: scaling the number of concurrent reflection-augmented requests (an infrastructure/serving concern, largely the same story as scaling any LLM-backed application), and scaling the reliability/cost of any single reflection loop as task complexity grows (an architectural concern specific to iterative refinement).

### The concurrency-scaling story

~~~mermaid
flowchart LR
    LB["Load balancer / task queue"] --> Run1["Reflection loop 1"]
    LB --> Run2["Reflection loop 2"]
    LB --> RunN["Reflection loop N"]
    Run1 & Run2 & RunN --> Router["Model gateway / router"]
    Router --> M1["Generator + critic LLM endpoint(s)"]
    Run1 & Run2 & RunN --> Verify["Shared external verification\n(test runners, validators)"]
~~~

Individual reflection loops are typically independent and scale horizontally the same way independent single-shot requests do; the real constraints are provider rate limits on the (now multiplied, by iteration count) LLM calls, and capacity limits on any shared external verification resource (a shared test-execution sandbox, a shared validator service) that many concurrent loops might contend for.

### Known bottlenecks and answers

| Bottleneck | Answer |
|---|---|
| Task complexity grows -> more reflection iterations needed -> cost and latency rise per task | Cap iterations based on measured diminishing returns, and consider whether the task should be decomposed (see **Planning**) rather than reflected on indefinitely |
| Provider rate limits under many concurrent reflection loops, each multiplying calls by iteration count | Request queuing/backoff, multiple provider accounts, a router that load-balances -- same answer as **Agent Fundamentals**, now multiplied by the reflection loop's own call count |
| Shared external verification capacity (test sandboxes, validators) becomes the constraint under concurrent load | Rate-limit and queue verification access centrally, and cache verification results for identical drafts where possible |
| Cost scaling with both traffic and iterations-per-task | Confirm reflection is earning its cost first (see Performance), then apply the same routing/caching techniques as **LLM Fundamentals**' cost-optimization guidance to whichever calls remain justified |

The single most important scalability idea specific to reflection: like a general agent's resource consumption, a reflection loop's cost per task is not fixed — it depends on how many iterations that particular task happened to need before its stopping condition fired, which means capacity planning must account for a distribution of iteration counts, not a single per-request cost, exactly the same lesson as **Agent Fundamentals**' scalability section, now applied to critique-revise cycles specifically.
`,

  security: `
### Reflection-specific attack surface

1. **Critique-induced degradation of a correct answer.** A specific, well-documented failure mode: a critique step, prompted to find problems, can "find" a spurious issue in an already-correct draft and drive a revision that makes the output worse — not a security vulnerability in the traditional sense, but a real integrity risk when reflection is applied uncritically to high-stakes content, and worth treating with the same seriousness as any other output-integrity concern.
2. **Prompt injection via the draft or critique content itself.** If a draft or a critique includes adversarial text (for instance, if the draft was influenced by untrusted user input, or the critique step ingests untrusted retrieved content as part of its evaluation), a downstream revise step may treat injected instructions as legitimate guidance — the same class of risk covered generally in **LLM Fundamentals** and specifically for tool-using agents in **Agent Fundamentals**, now with an additional stage (the critique) where untrusted content can enter the loop.
3. **Escalating cost as a denial-of-service / cost-abuse vector.** An attacker who can induce a reflection loop into repeatedly finding "issues" (for instance, by crafting an input that reliably triggers a critique step to flag something) has found a cost-amplification attack analogous to inducing an unbounded agent loop — hard iteration and cost limits (see Best Practices) are a security control here, not only a cost control.
4. **False confidence from an unverified "no issues found" signal.** Treating a critique step's self-reported approval as a security or correctness gate (for example, using reflection as the sole check before executing a consequential action) without external verification is a false sense of safety — the critique step's approval is an LLM's opinion, not a guarantee, and should not be the only gate in front of a high-stakes action.

### Defenses

- Ground the critique and stopping decision in external verification wherever the task allows it, rather than treating an LLM critique's approval as sufficient on its own for anything consequential.
- Apply the same untrusted-content discipline used for tool outputs in **Agent Fundamentals** to any external or user-influenced content that reaches the critique step — treat it as data to evaluate, not instructions to obey.
- Enforce hard iteration and cost limits as a security control, not only a cost control, since an unbounded or easily-triggered-into-looping reflection cycle is a viable resource-abuse vector.
- Log every draft, critique, and revision with enough detail to reconstruct why a given output changed, so a case of critique-induced degradation or an injection attempt can be diagnosed after the fact.
- Never use an unverified reflection "approval" as the sole gate in front of an irreversible or high-stakes action — combine it with human approval or external verification, exactly as **Agent Fundamentals**' Security section recommends for consequential tool calls generally.

See the **Guardrails**, **Hallucination**, and **Agent Fundamentals** skills for depth on the general LLM and agent security picture this section specializes for reflection loops specifically.
`,

  testing: `
Testing reflection pipelines combines the non-determinism challenges already present for a single LLM call and for general agent loops (see **Agent Fundamentals**' testing section) with an additional, reflection-specific requirement: tests must assert not just on the final output, but on whether reflection actually improved it relative to the first draft, since that improvement is the entire justification for the extra cost.

~~~python
# Testing a reflection pipeline: assert on end-state quality AND on
# whether the loop's stopping/budget controls actually hold, not on an
# exact sequence of critiques (which can legitimately vary run to run).

def test_reflection_improves_measured_quality_on_known_case():
    # Use a task with a known, checkable ground truth (e.g. a coding
    # task with a real test suite) so "improvement" is not just another
    # LLM's opinion.
    result = reflect_and_revise_with_tests(
        task="implement kth_largest(nums, k)",
        max_iterations=3,
    )
    assert result.final_passes_all_tests
    # A meaningful test also checks the FIRST draft's status, so you can
    # see whether reflection was the thing that fixed it, not a fluke of
    # the first generation already being correct.

def test_reflection_stays_within_iteration_budget():
    result = reflect_and_revise_with_tests(task="...", max_iterations=3)
    assert result.iterations_taken <= 3       # the hard limit must actually hold
    assert result.status in ("converged", "budget_exceeded")

def test_reflection_does_not_degrade_an_already_correct_draft():
    # Regression test against the critique-induced-degradation failure
    # mode: feed in a task whose first draft is already known-correct,
    # and confirm the pipeline does not "fix" it into something wrong.
    result = reflect_and_revise_with_tests(
        task="a task whose naive first draft is already correct",
        max_iterations=3,
    )
    assert result.final_passes_all_tests

def test_reflection_stops_on_external_verification_pass():
    # Confirm the loop honors an external check as a stop signal rather
    # than continuing to iterate needlessly once tests already pass.
    result = reflect_and_revise_with_tests(task="...", max_iterations=5)
    assert result.iterations_taken < 5 or result.final_passes_all_tests
~~~

### Fundamentals-level testing doctrine for reflection

- **Always test against a real success criterion (tests, a validator, a scored rubric), never against the model's own self-reported confidence** — a pipeline that "always reports satisfaction" tells you nothing about whether it actually improved anything.
- **Test the before-and-after delta explicitly, not just the final state**, so you can distinguish "reflection genuinely fixed this" from "the first draft happened to already be correct."
- **Include regression tests for critique-induced degradation** specifically — feed in cases whose first draft is already correct and confirm the pipeline does not introduce a spurious "fix."
- **Test the iteration and cost budget enforcement directly**, as its own test, not just as a side effect of other tests — this is a safety-critical control, exactly as in general agent loops.
- **Separate "did the loop mechanics work" tests (mockable, deterministic) from "did the reflection genuinely improve quality" tests (need real model calls and a scoring approach)** — the latter connects directly to the **Evaluation** skill's methodology, applied specifically to before/after comparisons rather than single-pass outputs.
`,

  debugging: `
### Escalation path for debugging unexpected reflection behavior

1. **Reconstruct the full sequence of drafts and critiques first**, not just the final output — every draft, every critique, and every revision for the run in question. Reflection bugs are overwhelmingly easier to diagnose from the whole sequence than from comparing only the first and last drafts.

~~~python
def print_reflection_trace(result) -> None:
    """Debugging habit: before theorizing about WHY reflection did or
    did not help, print the whole draft/critique/revision sequence."""
    print("--- draft v0 ---")
    print(result.drafts[0])
    for i, (critique, draft) in enumerate(
        zip(result.critiques, result.drafts[1:]), start=1
    ):
        print(f"--- critique {i} ---")
        print(critique)
        print(f"--- draft v{i} ---")
        print(draft)
    print(f"final status: {result.status}, iterations: {result.iterations_taken}")
~~~

2. **Check whether the critique step is producing specific, actionable feedback or vague restatements of confidence** — a critique that never names a concrete issue is the most common reason a reflection loop either terminates immediately with no improvement, or (worse) keeps "finding" vague issues that drive unnecessary iteration.
3. **Check whether a revision actually addressed the critique, or drifted into an unrelated change** — a revise step given loose instructions can sometimes regenerate substantially from scratch rather than editing toward the specific issues raised, discarding correct parts of the prior draft in the process.
4. **Check for critique-induced degradation**: compare the first draft against the final draft using the task's real success criterion, not just visually — if the first draft was already correct and the final draft is not, the critique step likely introduced a spurious "fix."
5. **Check the iteration/cost budget enforcement** — did the loop hit its limit before converging, and if so, was the limit too low for this task's genuine complexity, or is this evidence the task needs external verification or a stronger model rather than more iterations?
6. **Reproduce with a low/near-zero temperature at the critique step** to remove sampling randomness as a variable while isolating whether the issue is in the critique prompt's specificity, the revise prompt's instructions, or a genuine model-capability limitation — same technique as debugging a single LLM call or a general agent's decision step.
7. **Escalate to a proper before/after evaluation** (**Evaluation** skill, applied to first-draft vs. final-draft quality across a representative task set) once single-run debugging has ruled out obvious prompt or budget bugs — some cases are genuine evidence that reflection does not help on this task/model combination at all, not fixable by tuning the loop further.

### Common "it's not a bug, it's the fundamentals" traps

- Reflection "never finds anything to fix": the first-pass generation may already be good enough for this task, or the critique prompt may be too vague to surface real issues — check both before assuming the loop is broken.
- Reflection keeps iterating without visible improvement: likely diminishing returns that the stopping criteria did not catch, or a critique step generating superficial "issues" on an already-adequate draft — see Anti-Patterns.
- Final draft is worse than the first draft on a known-correct case: a specific, well-documented failure mode (critique-induced degradation), not a rare edge case — add a regression test for it and consider whether reflection should be skipped on tasks of this shape entirely.
`,

  monitoring: `
Production reflection-pipeline monitoring extends standard LLM-call monitoring (per **LLM Fundamentals** and **Agent Fundamentals**) with signals specific to critique-revise cycles.

### What to measure

- **Iterations taken per task** (distribution, not just average) — a rising tail of tasks hitting the iteration limit is an early warning that the task set's complexity has outgrown the current budget, or that external verification should be added to shorten the loop.
- **Tokens and cost per task, decomposed by generate/critique/revise step** — since cost is not fixed the way it is for a single-shot call, understanding which step is the expensive one (often the critique, if left unconstrained in length) is essential for cost control.
- **Measured quality delta from first draft to final draft**, against the task's real success criterion — this is the single most important reflection-specific metric, and the one most teams skip in favor of anecdote; without it, you cannot know whether the pipeline is earning its cost.
- **Critique-induced-degradation rate**: how often the final draft scores worse than the first draft on cases where the first draft was already correct — a direct measure of the failure mode covered in Security and Anti-Patterns.
- **External-verification pass rate at each iteration** (where available) — tracking how often iteration one, two, and three each achieve a passing external check shows concretely where the marginal value of additional iterations tapers off for this specific task type.

~~~python
# Minimal instrumentation sketch around a reflection loop.
import time
import logging

logger = logging.getLogger("reflection_runs")

def run_reflection_with_monitoring(task: str, max_iterations: int = 3) -> dict:
    start = time.perf_counter()
    result = reflect_and_revise_with_tests(task=task, max_iterations=max_iterations)
    elapsed = time.perf_counter() - start

    first_ok = result.per_iteration_check_passed[0] if result.per_iteration_check_passed else None
    final_ok = result.final_passes_all_tests

    logger.info(
        "reflection_run_completed",
        extra={
            "iterations_taken": result.iterations_taken,
            "status": result.status,
            "total_tokens": result.total_tokens,
            "latency_seconds": elapsed,
            "first_draft_passed_check": first_ok,
            "final_draft_passed_check": final_ok,
            "degraded_from_correct_first_draft": bool(first_ok) and not final_ok,
        },
    )
    return result
~~~

### Reflection-specific things to watch

- A rising rate of tasks hitting the iteration limit without a passing external check can indicate the task set has genuinely grown more complex, or that the critique step's prompt needs to be more specific to converge faster.
- A nonzero critique-induced-degradation rate should be treated seriously and page someone well before it becomes a customer-visible quality regression, since it means the pipeline can make correct answers worse.
- A measured quality delta near zero across a large sample of tasks is a direct signal that reflection is not earning its cost for that task type and should be reconsidered, not iterated on further.
`,

  deployment: `
Deploying a reflection-augmented feature builds on the deployment concerns already covered in **LLM Fundamentals** and **Agent Fundamentals** (pinned model versions, secrets management, timeouts/retries) with reflection-specific configuration that must be explicit at deploy time.

### Configuration that must be explicit at deployment time

~~~text
REFLECTION_MAX_ITERATIONS=3        # hard cap, sized to where measured
                                    # marginal improvement has been shown
                                    # to taper off for this task
REFLECTION_MAX_TOTAL_TOKENS=15000   # hard cost/token budget independent
                                    # of iteration count
REFLECTION_CRITIC_MODEL=<pinned model, may differ from generator model>
REFLECTION_STEP_TIMEOUT_SECONDS=20  # per-step timeout for each LLM call
EXTERNAL_VERIFICATION_ENABLED=true  # whether tests/validators gate stopping,
                                     # strongly preferred wherever the task allows it
REFLECTION_ENABLED_FOR_TASK_TYPES=code_generation,structured_extraction
                                     # explicit allowlist of task types this
                                     # applies to -- never "everywhere by default"
GENERATOR_MODEL=<pinned model version, not "latest">
~~~

Why each choice matters: the iteration and token budgets are the primary defense against runaway cost and the reflection-specific version of an infinite loop (see Failure Modes); a pinned, possibly distinct critic model lets a team deliberately choose between same-model self-critique and a separate critic per the tradeoffs in Intermediate Concepts, rather than that choice drifting accidentally; enabling external verification wherever the task allows it is consistently the strongest lever for reflection reliability; and an explicit task-type allowlist prevents reflection from silently expanding to every generation in a codebase as new features are added, which is exactly the kind of scope creep Anti-Patterns warns against.

### Rollout practice specific to reflection features

- **Roll out a new or changed reflection step behind a flag**, and run an actual before/after evaluation of end-to-end quality on a representative task set (see **Evaluation**) before full rollout — do not assume the change helps because it sounds like it should.
- **Canary changes to the critique prompt, the iteration cap, or the critic model to a small percentage of traffic first**, monitoring the quality-delta and critique-induced-degradation metrics specifically, before enabling broadly.
- **Keep a no-reflection fallback path** for task types where reflection has not been shown to help, or where its measured benefit does not justify its cost — routing straight to the first-pass generation, rather than defaulting to reflection everywhere, is standard practice for exactly the reasons covered throughout this page.
`,

  "production-checklist": `
Before a reflection-augmented feature takes real production traffic:

- [ ] Hard maximum iteration count configured and enforced in code (not left to the critique step's own judgment)
- [ ] Hard total token/cost budget configured and enforced, independent of the iteration count
- [ ] External verification (tests, validators, calculators) wired in and given precedence over LLM-only critique wherever the task allows it
- [ ] Critique prompt is specific (names concrete standards to check against), not a vague "is this good"
- [ ] Before/after quality evaluation completed on a representative task set, showing a measured, not assumed, improvement -- see **Evaluation**
- [ ] Regression test in place for critique-induced degradation of already-correct drafts
- [ ] Full trace (every draft, critique, and revision) logged per task, with privacy-appropriate redaction
- [ ] Reflection explicitly scoped to an allowlist of task types shown to benefit, not applied to every generation by default
- [ ] Same-model-critique vs. separate-critic decision made deliberately for this task's stakes, not left as an accidental default
- [ ] Monitoring in place for iteration-limit-hit rate, quality delta, and critique-induced-degradation rate
- [ ] A no-reflection fallback path exists for task types where reflection's benefit has not been demonstrated
- [ ] Model versions (generator and, if different, critic) pinned; prompt changes evaluated before shipping, same discipline as any other prompt change
- [ ] Considered explicitly whether this task actually benefits from reflection, versus self-consistency, a stronger single-pass model, or a better first-pass prompt -- documented in the design, not just assumed
`,

  "common-mistakes": `
1. **Assuming reflection is a universal quality upgrade and skipping evaluation** — the most common and most avoidable mistake on this page's topic, given how well-documented reflection's mixed track record already is; always run a real before/after comparison first.
2. **No hard iteration or cost limit**, or one set so generously it might as well not exist — leads directly to runaway cost, mirroring the general agent unbounded-loop failure mode.
3. **Using a vague critique prompt** ("check your work," "is this good") that produces vague, low-value critique instead of specific, actionable feedback.
4. **Trusting the critique step's "no issues found" or a model's self-reported confidence as sufficient evidence of quality**, with no external check or independent evaluation behind it.
5. **Ignoring available external verification** (a test suite, a validator, a calculator) in favor of pure LLM-on-LLM critique, when the external signal would be both cheaper to trust and more reliable.
6. **Applying reflection uniformly to every generation in a pipeline "just in case"** — multiplies cost and latency across the whole pipeline without a proportional, evidenced quality gain everywhere it is applied.
7. **Not testing for critique-induced degradation** — shipping a reflection pipeline without a regression test confirming it does not "fix" an already-correct draft into something wrong.
8. **Confusing reflection with self-consistency**, or defaulting to one without considering the other — they are different techniques with different cost, latency, and applicability profiles; see Comparisons.
9. **Regenerating from scratch in the revise step instead of editing toward the critique**, discarding whatever was already correct in the prior draft.
10. **Debugging from only the first and last drafts instead of the full critique/revision sequence** — the originating misdirection is often visible in an intermediate critique that a quick before/after comparison alone would miss.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Reflection loop runs to the iteration cap on nearly every task | Iteration cap set too low for genuine task complexity, or critique step never reports satisfaction because its prompt is too vague/open-ended | Measure where marginal improvement actually tapers off for this task; tighten the critique prompt's specificity |
| Final draft is worse than the first draft on a known-correct case | Critique-induced degradation -- the critique step "found" a spurious issue and drove an unnecessary revision | Add a regression test for this case; consider gating stopping on external verification rather than LLM critique alone |
| Reflection shows no measurable quality improvement in evaluation | Task's errors stem from a knowledge/capability gap the model cannot self-correct, or the critique prompt is too vague to surface real issues | Reconsider whether reflection is the right lever at all for this task (see Advanced Concepts' decision table); try a stronger base model or retrieval grounding instead |
| Runaway cost from a single task's reflection loop | No hard token/cost budget enforced independent of iteration count | Add an explicit total-token budget, not just an iteration count, since step cost varies |
| Critique step approves output that fails an available external check | LLM critique was trusted without cross-checking against the external, ground-truth signal | Always run and trust available external verification over an LLM's approval; treat the LLM critique as a hint, not a verdict |
| Revise step drifts into unrelated changes not requested by the critique | Revise prompt allows or invites full regeneration rather than targeted editing | Prompt the reviser explicitly to address only the identified issues and preserve the rest of the draft |
| High variance in iteration count for the same task type | Non-deterministic critique/revise decisions at nonzero temperature, compounding across iterations | Lower temperature at the critique step for tasks needing consistency; measure iteration-count distribution, not just an average |
| Separate-critic configuration costs far more than expected | Critic model calls not budgeted separately from generator/reviser calls | Track and budget generate, critique, and revise token costs independently, especially when the critic is a different (possibly pricier) model |
`,

  faqs: `
**Q: Does reflection make an LLM smarter?**
No — it does not add knowledge or reasoning capability the model does not already have. It gives the model (or a separate critic) a second, differently-framed pass at recognizing a mistake it already had the underlying capability to notice, which is a real but bounded effect, not a capability upgrade.

**Q: Is reflection the same as chain-of-thought reasoning?**
No. Chain-of-thought is reasoning through steps within a single generation before producing a final answer; reflection is a separate critique-and-revise pass over an already-produced draft, typically as one or more additional model calls. The two are complementary and often used together, but they are distinct techniques.

**Q: Should I always add a reflection step to improve quality?**
No — this is the central caution of this page. Reflection's measured benefit is inconsistent across tasks and models: strong and fairly reliable where an external, executable check grounds the critique (code with tests, structured data with a validator), and much more mixed — sometimes null, occasionally negative — on open-ended or subjective tasks judged only by another LLM's opinion. Evaluate it per task rather than assuming it helps.

**Q: What's the real difference between reflection and self-consistency?**
Reflection iteratively improves one output through a sequence of critique-and-revise passes; self-consistency samples multiple independent outputs in parallel and aggregates them (commonly by majority vote for tasks with one discrete correct answer). Self-consistency parallelizes better and does not depend on a model's ability to critique itself; reflection can in principle target and fix a specific identified flaw, but only if the critique step can actually recognize it.

**Q: Should the critic be the same model as the generator?**
Either can work, and the choice is a real tradeoff: same-model self-critique is cheaper and simpler but structurally prone to sharing the generator's own knowledge gaps and biases; a separate critic (a different or differently-prompted model) costs more but can catch errors the generator is blind to. Reserve a separate critic for higher-stakes steps where that extra reliability is worth the extra cost.

**Q: How do I stop a reflection loop from running forever?**
Enforce a hard maximum iteration count and a hard total token/cost budget in code, and where available, gate stopping on an external verification signal rather than relying solely on the critique step's own "no issues found" report — never rely on the model's own judgment alone, exactly as with a general agent loop's stopping condition.

**Q: Can reflection make an output worse?**
Yes, and this is a specific, well-documented failure mode, not a rare edge case: a critique step can "find" a spurious problem in an already-correct draft and drive an unnecessary revision that introduces an error. This is one of the strongest reasons to evaluate reflection's actual before/after effect rather than assuming it can only help.

**Q: Where do I go next after this page?**
If your priority is deciding what to do next in a broader agent loop, go to **Planning**; if it's measuring whether reflection (or any technique) actually improved quality, go to **Evaluation**; if it's understanding the closely related risk of a model confidently endorsing a fabricated claim during self-critique, go to **Hallucination**; if it's implementing a reflection loop as an explicit, cyclic graph, go to **LangGraph**; if it's the general agent architecture reflection sits inside, go back to **Agent Fundamentals**.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is reflection, mechanically, in the context of LLM agents?* Model answer sketch: a generate-critique-revise loop where a model's draft output is evaluated against some standard (by itself or a separate critic) and revised based on that critique, repeated until a stopping condition is met.
2. *What's the difference between reflection and a plain "are you sure, try again" re-prompt?* A plain re-prompt gives the model no specific standard to check against and often just produces restated confidence in the same answer; effective reflection prompts the critique step with explicit, checkable criteria (specific edge cases, a rubric, an external check) so it can surface real, actionable issues.
3. *What is the Reflexion pattern?* An agent that fails a task generates a natural-language reflection on what went wrong, stores it in memory, and includes that reflection in its prompt on a subsequent attempt at a similar task — learning from a specific past failure in text, across attempts, rather than only within one generation.
4. *Name two things a reflection loop needs to avoid running forever.* A hard maximum iteration count and a hard cost/token budget, both enforced in code rather than relying solely on the critique step's own judgment that it is finished.
5. *Give one example where reflection reliably helps, and explain why.* Code generation with an executable test suite: the critique can be grounded in an actual pass/fail result rather than an LLM's opinion, which is a much stronger and more reliable signal than free-form self-critique.

**Senior:**

6. *Why is "the model says the revision is better" not sufficient evidence that it actually is?* Because that assertion comes from the same (or a similarly limited) model whose knowledge and reasoning produced the original draft; self-reported confidence is not a reliable quality signal on its own and must be checked against the task's real success criterion — tests, a scored rubric, or independent human review.
7. *Contrast reflection with self-consistency and explain when you would choose each.* Reflection iteratively critiques and revises one output sequentially; self-consistency samples multiple independent outputs in parallel and aggregates them, commonly by majority vote. Self-consistency tends to suit tasks with one discrete, votable correct answer and parallelizes better; reflection can target a specific identified flaw but depends on the critique step's ability to recognize it, and tends to show the strongest evidence of benefit where an external, executable check can ground the critique.
8. *A team wants to add a reflection step to every LLM call in their pipeline because "checking your work can only help." What do you tell them?* Reflection's benefit is empirically inconsistent across task types — evidence is much stronger where an external, checkable signal grounds the critique (code with tests, structured data with a validator) and considerably weaker or mixed for open-ended, subjective tasks judged only by another LLM's opinion; applying it everywhere multiplies cost and latency without a proportional, evidenced quality gain, and it should be evaluated per task and applied selectively to identified failure-prone steps.
9. *How would you design the stopping criteria for a production reflection loop?* Combine a hard maximum iteration count, a hard cost/token budget, an external verification check where available (given precedence over the critique step's own report), and diminishing-returns detection (near-identical consecutive drafts) — never rely on the critique step's own "satisfied" signal as the sole condition.
10. *Explain the risk of critique-induced degradation and how you would guard against it in production.* A critique step, prompted to find problems, can flag a spurious issue in an already-correct draft and drive a revision that introduces an error; guard against it by grounding stopping decisions in external verification wherever possible, and by including regression tests that feed in known-correct first drafts and confirm the pipeline does not degrade them.
11. *When would you use a separate critic model instead of same-model self-critique?* When the stakes of a missed error justify the extra cost of an additional model call, and especially when you suspect the generating model has a systematic blind spot that a differently-prompted or differently-sourced critic is more likely to catch than the same model reviewing its own output.
12. *How would you evaluate whether a reflection pipeline is worth its added latency and cost for a given task?* Run a rigorous before/after comparison on a representative task set (see **Evaluation**), measuring quality against the task's real success criterion (not the model's self-report) for both the first draft and the final, reflected draft, and weigh the measured quality delta against the added latency and token cost per task.
`,

  "coding-questions": `
### 1. Implement a bounded generate-critique-revise loop with a diminishing-returns check

~~~python
from dataclasses import dataclass, field

@dataclass
class ReflectionResult:
    final_draft: str
    status: str          # "converged" | "budget_exceeded" | "no_issues_found"
    iterations_taken: int
    drafts: list = field(default_factory=list)
    critiques: list = field(default_factory=list)

def similarity(a: str, b: str) -> float:
    """Cheap stand-in for a real text-similarity check (e.g. token overlap
    or an embedding cosine similarity in a real system)."""
    a_tokens, b_tokens = set(a.split()), set(b.split())
    if not a_tokens or not b_tokens:
        return 0.0
    return len(a_tokens & b_tokens) / len(a_tokens | b_tokens)

def reflect_and_revise_bounded(
    task: str,
    generate_fn,
    critique_fn,
    revise_fn,
    max_iterations: int = 3,
    max_total_tokens: int = 15000,
    similarity_stop_threshold: float = 0.97,
) -> ReflectionResult:
    """generate_fn(task) -> (draft, tokens)
    critique_fn(task, draft) -> (critique_text, tokens)
    revise_fn(task, draft, critique) -> (new_draft, tokens)
    Real functions would call an LLM API; this signature keeps the
    control flow visible and testable without a network call."""
    draft, tokens = generate_fn(task)
    total_tokens = tokens
    drafts = [draft]
    critiques: list[str] = []

    for i in range(max_iterations):
        critique, tokens = critique_fn(task, draft)
        total_tokens += tokens
        critiques.append(critique)

        if critique.strip() == "NO_ISSUES":
            return ReflectionResult(draft, "no_issues_found", i, drafts, critiques)

        if total_tokens > max_total_tokens:
            return ReflectionResult(draft, "budget_exceeded", i, drafts, critiques)

        new_draft, tokens = revise_fn(task, draft, critique)
        total_tokens += tokens

        # Diminishing-returns guard: stop if the revision barely changed
        # the draft, rather than continuing to iterate on noise.
        if similarity(draft, new_draft) >= similarity_stop_threshold:
            drafts.append(new_draft)
            return ReflectionResult(new_draft, "converged", i + 1, drafts, critiques)

        draft = new_draft
        drafts.append(draft)

    return ReflectionResult(draft, "budget_exceeded", max_iterations, drafts, critiques)
~~~

Complexity: O(max_iterations) LLM calls in the worst case, each dominated by the model's own inference latency, not by this orchestration code. Follow-ups: replace the crude token-overlap similarity with a real embedding-based check; add an external-verification hook that short-circuits the loop the moment a real test suite or validator passes, ahead of the diminishing-returns check.

### 2. Ground reflection in an executable check for a coding task

~~~python
import subprocess

def run_tests_against(code: str, test_file_path: str) -> tuple[bool, str]:
    """Write the candidate code to a module and run a real test suite
    against it, returning (all_passed, output). This is the external,
    ground-truth signal Advanced Concepts recommends over pure LLM
    critique wherever a task allows it."""
    with open("candidate_solution.py", "w") as f:
        f.write(code)
    result = subprocess.run(
        ["python", "-m", "pytest", test_file_path, "-q"],
        capture_output=True, text=True, timeout=30,
    )
    return result.returncode == 0, result.stdout + result.stderr

def reflect_with_test_grounding(task: str, generate_fn, revise_fn,
                                 test_file_path: str, max_iterations: int = 3):
    code, _ = generate_fn(task)
    for i in range(max_iterations):
        passed, output = run_tests_against(code, test_file_path)
        if passed:
            return code, "converged", i
        # The failing test output IS the critique here -- grounded,
        # concrete, and not dependent on an LLM's opinion of its own work.
        code, _ = revise_fn(task, code, critique=output)
    return code, "budget_exceeded", max_iterations
~~~

Complexity: O(max_iterations) LLM calls plus O(max_iterations) test-suite executions. Follow-ups: add a timeout and sandboxing around the test execution itself, since running model-generated code is an untrusted-code-execution concern (see **Security**); cache test results for identical candidate code to avoid redundant runs.

### 3. Compare reflection vs self-consistency on a task with a discrete final answer

~~~python
from collections import Counter

def self_consistency_answer(task: str, sample_fn, n_samples: int = 5) -> str:
    """sample_fn(task) -> a single independently-sampled final answer
    (e.g. a specific numeric result). Aggregate by majority vote."""
    answers = [sample_fn(task) for _ in range(n_samples)]
    return Counter(answers).most_common(1)[0][0]

def reflection_answer(task: str, generate_fn, critique_fn, revise_fn,
                       max_iterations: int = 3) -> str:
    draft, _ = generate_fn(task)
    for _ in range(max_iterations):
        critique, _ = critique_fn(task, draft)
        if critique.strip() == "NO_ISSUES":
            break
        draft, _ = revise_fn(task, draft, critique)
    return draft

# In a real evaluation, run both against a labeled task set and compare
# accuracy against ground truth, plus total tokens/latency for each --
# self_consistency_answer parallelizes trivially across n_samples;
# reflection_answer is inherently sequential across iterations.
~~~

Complexity: self-consistency is O(n_samples) independent LLM calls, parallelizable; reflection is O(max_iterations) sequential LLM calls. Follow-ups: implement a hybrid that samples a small number of independent drafts and applies one reflection pass to each before voting, and measure whether it beats either technique alone on your specific task and model.
`,

  "hands-on-labs": `
### Lab 1 — From-scratch generate-critique-revise loop with one real task (beginner, ~1.5h)
Using a real LLM API, implement the full generate-critique-revise loop from scratch (no framework), with an explicit hard iteration limit, on a task with a checkable answer (e.g. a small coding task with a couple of test cases you write by hand). Deliverable: a working script plus a short write-up comparing the first draft's correctness to the final draft's correctness. Skills exercised: the core loop mechanics, stopping-condition design, and — critically — actually measuring whether reflection helped rather than assuming it did.

### Lab 2 — Reflection vs self-consistency head-to-head (beginner/intermediate, ~2h)
Pick a small benchmark task set with a discrete, checkable final answer (e.g. a set of short math or logic problems). Implement both a reflection pipeline (Lab 1's loop) and a self-consistency pipeline (sample N independent answers, majority vote), run both across the task set, and compare accuracy, total tokens, and wall-clock latency. Deliverable: a short comparison report with numbers, not impressions. Skills exercised: honest empirical comparison of two competing techniques — directly connects to the **Evaluation** skill's methodology.

### Lab 3 — Grounding reflection in an executable check (intermediate, ~2.5h)
Build a reflection pipeline for a coding task where the critique step is replaced (or supplemented) by actually running a real test suite against the generated code, feeding failing test output back as the critique. Include a hard iteration cap and a regression test confirming the pipeline does not degrade an already-correct first draft. Deliverable: a tested module plus a demonstration of the loop converging on a genuinely buggy first draft and stopping promptly on an already-correct one. Skills exercised: external verification grounding, regression testing against critique-induced degradation.

### Lab 4 — Reflexion-style memory across attempts (production, ~3-4h)
Build a small agent that attempts a task in an environment with a clear pass/fail signal (e.g. a coding benchmark task, or a simple rule-based puzzle), and on failure, generates a natural-language reflection stored in a small memory buffer (see **Agent Memory**), which is included in the prompt on a subsequent attempt at a similar task. Measure success rate across multiple attempts with and without the stored reflections. Deliverable: a running experiment, a measured before/after comparison, and a short write-up of whether and how much the stored reflections helped in this specific setting. Skills exercised: the full Reflexion pattern tied together with rigorous evaluation, plus a first taste of how reflection composes with **Agent Memory**.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate reflection mastery (each also reaches into a sibling skill):

1. **Test-grounded code-fixing pipeline** — A service that takes a coding task, generates a candidate solution, runs it against a real test suite, and iterates (feeding failing test output back as critique) up to a hard iteration cap, with full logging of every draft and test result. Demonstrates: external verification grounding, bounded-loop design, and honest measurement of before/after correctness — directly relevant to the **Testing** and **Agent Fundamentals** skills.

2. **Reflection vs. self-consistency benchmark harness** — A small evaluation framework that runs both techniques (and a plain single-shot baseline) across a labeled task set, reporting accuracy, cost, and latency for each, and produces a written recommendation for which technique to use for which task shape. Demonstrates: the architectural-judgment and rigorous-comparison skills this page emphasizes most — bridges directly into the **Evaluation** skill.

3. **Reflexion-style agent with episodic memory and a measured before/after report** — An agent operating in a simple environment with a clear success/failure signal per attempt, storing natural-language reflections on failure and reusing them on subsequent attempts, with a measured success-rate comparison against a no-memory baseline across many attempts. Demonstrates: the full verbal-reinforcement pattern, tied to **Agent Memory** for storage/retrieval and to **Evaluation** for measuring whether the stored reflections actually helped.

Each project should include: explicit iteration/cost budget instrumentation, a documented rationale for whether and where reflection was applied (not applied everywhere by default), a measured before/after quality comparison against the task's real success criterion (not the model's self-report), and a written failure-mode analysis (what happens when the critique step degrades an already-correct draft, when the budget is hit, when no external check is available) — the engineering discipline and honest measurement around the loop is what distinguishes a fundamentals-level demo from a portfolio-grade project.
`,

  "case-studies": `
### The Reflexion paper's episodic-memory result and its scope
Reflexion demonstrated that agents storing and reusing natural-language reflections on their own failures could improve success rates across repeated attempts at tasks in environments with a clear pass/fail signal (coding benchmarks, decision-making tasks). The result depended on having something external or semi-external to trigger the reflection meaningfully — a failed test run, a wrong final answer confirmed against ground truth — not merely the model's own unverified opinion of its performance. Lesson: verbal self-feedback shows its clearest, most reproducible benefit precisely where there is a real signal of failure to reflect on, reinforcing the broader theme that grounding matters more than the reflection mechanism itself.

### Self-Refine and the pattern of diminishing, task-dependent returns
Early self-refine-style work showed measurable gains from iterative self-critique-and-revise on several generation tasks, but follow-up replications and broader evaluations across more task types found the benefit was substantially less consistent than the original framing suggested — strong on some tasks, negligible on others, with the difference correlating with whether the task had some form of checkable structure. Lesson: a promising initial result on a specific benchmark does not generalize automatically to "reflection improves quality," and treating any single paper's headline result as a universal claim about the technique is exactly the overclaiming this page repeatedly warns against.

### Self-consistency outperforming iterative refinement on certain reasoning benchmarks
Several evaluations comparing self-consistency (sample-and-vote) against iterative self-critique on math and multi-step reasoning benchmarks with a single discrete correct answer found self-consistency matching or exceeding reflection's measured benefit, at a cost profile that parallelizes more cleanly. Lesson: reflection is not the only, or even always the best, way to spend additional inference-time compute on quality — for tasks with a votable final answer, sampling more independent attempts is a real, evidence-backed competitor worth testing before defaulting to iterative refinement.

### Coding agents grounding critique in real test execution
Autonomous coding agents that replace or supplement LLM-generated critique with actually running the candidate code against a real test suite have shown some of the most consistently positive, reproducible gains attributed to a reflection-like loop in the broader literature and in practitioner reports. Lesson: the single most reliable way to make a critique-revise loop trustworthy is to ground it in an external, executable signal rather than another round of LLM opinion — directly reinforcing the decision framework in Advanced Concepts.
`,

  comparisons: `
| Dimension | Single-shot generation | Reflection (self-critique, same model) | Reflection (separate critic) | Self-consistency (sample and vote) | External-verification-grounded reflection |
|---|---|---|---|---|---|
| Extra model calls per task | None | 2+ per iteration (critique, revise) | 2+ per iteration, at least one on a different model | N independent samples | 2+ per iteration, plus external check runs (cheap relative to an LLM call) |
| Parallelizable | N/A | Mostly sequential (each pass depends on the last) | Mostly sequential | Highly parallel across samples | Mostly sequential, but the external check itself is fast |
| Depends on model's ability to critique itself | No | Yes, and shares the generator's blind spots | Partially -- can catch generator-specific blind spots | No -- depends on independent errors disagreeing more than correct answers do | Reduced -- the ground-truth check, not an LLM opinion, decides correctness |
| Reliability of the improvement signal | N/A (no improvement claimed) | Weakest -- an LLM's opinion of its own work | Moderate -- a genuinely different vantage point, still an opinion | Strong for tasks with one discrete, votable answer | Strongest -- grounded in an executable or otherwise checkable fact |
| Best for | Fully specified, low-stakes, or already-reliable tasks | Low-stakes tasks where a quick second pass is cheap insurance | Higher-stakes tasks where a generator's known blind spot needs a different check | Reasoning tasks with a single discrete correct answer | Code, structured data, math, or any task with an executable/checkable signal |
| Where covered on this platform | **LLM Fundamentals**, **Prompt Engineering** | This page | This page; multi-agent "critic role" depth in **Agent Fundamentals** | This page (background); reasoning-technique depth in **LLM Fundamentals** | This page; testing/validation depth in **Testing** and **Evaluation** |

**How seniors choose**: start by asking whether an external, checkable signal exists for the task — if yes, ground the critique in it and reflection becomes one of the most reliably beneficial techniques available. If no external check exists, weigh self-consistency (for tasks with one discrete correct answer, favoring parallel cost and a well-evidenced aggregation mechanism) against same-model or separate-critic reflection (for tasks where a specific, nameable flaw is plausible and worth a second, differently-framed pass), and evaluate the actual before/after effect on a representative task set before committing to either — never adopt reflection by default on the assumption that checking your work can only help.
`,

  "related-technologies": `
- **Agent Fundamentals** — the general perceive-plan-act-observe loop that reflection is layered onto; read this first if you have not already, since reflection's stopping-condition and cost-control concerns directly mirror general agent loop concerns.
- **Prompt Engineering** — how to write specific, actionable critique prompts and revise prompts; every step of a reflection loop is a prompted LLM call.
- **Planning** — plan representation and re-planning; a proposed plan can itself be the object of a reflection pass before any execution begins, and re-planning after a failed attempt sits at the boundary between planning and Reflexion-style reflection.
- **Agent Memory** — the storage and retrieval mechanics that make the Reflexion pattern's episodic reflection buffer possible across attempts.
- **Evaluation** — the methodology required to determine, rigorously, whether a reflection pipeline actually improves quality rather than merely appearing to; essential reading before shipping any reflection-based feature.
- **Hallucination** — the closely related risk that a model's self-critique of a factual claim can itself confidently endorse a fabricated justification rather than catching the error; understanding this failure mode is essential context for trusting (or appropriately distrusting) self-critique on factual tasks.
- **LangGraph** — a graph-based orchestration framework well suited to implementing reflection loops as an explicit cycle (generate node, critique node, revise node, conditional edge back or out) with visible, controllable state.
- **Testing** — the discipline of grounding a critique step in a real, executable check (test suites, validators) rather than another LLM's opinion, which this page repeatedly identifies as the strongest lever for reliable reflection.
- **RAG** — retrieval grounding is a complementary quality lever to reflection; for factual tasks, confirming a claim via retrieval is often more reliable than asking a model to self-critique its own unverified assertion.

On this platform, a natural path from here: **Reflection** (this page) → **Evaluation** (to actually measure whether it is working) → **Agent Memory** and **Planning** (to compose reflection into a longer-running agent) → **Hallucination** (to understand the specific factual-endorsement risk in self-critique) → **LangGraph** (to implement reflection loops with explicit, controllable cycles).
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check current benchmark papers and framework documentation for anything more current, since evaluation results in this area continue to evolve and this page will not assert a permanent ranking.

- The empirical picture on self-critique/self-refinement remains genuinely mixed as of this writing: continued reports of solid, reproducible gains where an external or executable signal grounds the critique (code with tests, structured extraction with validators), alongside continued reports of null or inconsistent results for ungrounded, same-model self-critique on open-ended tasks — treat this as an actively studied open question, not a settled matter in either direction.
- Reasoning-oriented models that spend additional inference-time computation before producing a final answer (see **LLM Fundamentals**' Latest Updates) interact with reflection in an evolving way: some practitioner reports suggest that stronger built-in reasoning reduces the marginal value of an explicit external critique-revise loop for certain task types, since more of the "checking" already happens implicitly within a single generation — this tradeoff is still being worked out across different task types and is not yet a settled conclusion.
- Frameworks that make cyclic, stateful control flow explicit (such as **LangGraph**) have made implementing reflection loops with visible, inspectable state more straightforward than hand-rolling the control flow, which has likely contributed to reflection being tried (and evaluated) on a wider range of production tasks than earlier, more ad hoc implementations.
- Multi-agent architectures with a dedicated critic/reviewer role continue to be an active area of practical experimentation, as one concrete way to realize a separate-critic configuration structurally rather than through prompt-switching within a single conversation.

Given how actively this specific question (does self-critique reliably improve quality, and under what conditions) is still being studied and re-evaluated, treat any confident, blanket claim you encounter about reflection's benefit — including framings on this very page — as a summary of the evidence at the time of writing, and re-verify against current benchmark results and your own task-specific evaluation before making an architectural bet on it.
`,

  "future-roadmap": `
Where the reflection picture is heading, and what is worth betting career time on:

1. **The generate-critique-revise pattern, and the honest habit of measuring rather than assuming its benefit, are durable ideas** that will remain useful regardless of which specific model generation or framework is current — the discipline of evaluating a quality technique before shipping it is a better long-term investment than memorizing any one paper's headline result.
2. **Grounding critique in external, executable verification is likely to remain the single most reliable configuration**, and is likely to keep expanding as more task types gain automatable checks (better validators, more sophisticated test-generation, more structured-output tooling) — betting on skills in building and wiring up external verification is likely to age better than betting on ungrounded self-critique prompts alone.
3. **The relationship between reasoning-heavy models (which do more implicit "checking" within a single generation) and explicit reflection loops is still unsettled** — it is plausible that stronger single-pass reasoning reduces reflection's marginal value for some task types over time, while genuinely multi-attempt, execution-grounded tasks (like iterative code fixing) are likely to keep benefiting from an explicit loop regardless of how strong the underlying single-pass model becomes.
4. **Reflexion-style episodic memory across attempts is likely to remain valuable specifically in agentic, multi-attempt settings** (coding agents, tool-use agents, interactive environments) where a real failure signal exists to reflect on — this is a narrower, better-evidenced niche than "reflection improves any generation," and is worth distinguishing clearly in your own mental model.
5. **The field's empirical honesty about reflection's mixed track record is itself still developing** — expect continued, more rigorous benchmarking work to further clarify exactly which task shapes benefit and which do not, rather than a single paper settling the question; treat current best practice (including this page's decision framework) as the current state of an evolving field, not a final answer.

For your career: the highest-leverage, most durable skill from this page is not any specific prompt template for critique, but the disciplined habit of asking "does this actually help, measured against a real success criterion, for this specific task" before adopting reflection — that judgment stays valuable even as specific benchmark results and framework capabilities change underneath it.
`,

  "cheat-sheet": `
~~~text
# --- Core definition ---
Reflection = generate a draft, critique it, revise it, repeat until a
stopping condition fires. Not a different model capability -- a prompting
and control-flow pattern layered on the same LLM from LLM Fundamentals.

# --- The loop ---
GENERATE: produce (or receive) a candidate draft
CRITIQUE: LLM call (same or different model) evaluates the draft against
          an EXPLICIT standard -- vague "is this good" produces weak critique
REVISE:   LLM call produces a new draft addressing the critique
REPEAT until: max iterations hit, external check passes, diminishing
          returns detected, or cost budget hit
(the CONTROLLER, never the critique step alone, must own termination)

# --- Reflexion pattern ---
Fail task -> generate natural-language self-reflection on what went wrong
-> store in episodic memory -> include reflection in prompt on next
attempt at a similar task. Needs a real pass/fail signal to trigger on.

# --- Same-model critique vs separate critic ---
Same model : cheaper, simpler, shares the generator's own blind spots
Separate   : costlier, can catch errors the generator is structurally
             blind to -- reserve for higher-stakes steps

# --- Reflection vs self-consistency ---
Reflection      : ONE draft, sequential critique->revise, targets a
                  specific identified flaw IF the critique can see it
Self-consistency: N independent samples in PARALLEL, aggregate (majority
                  vote) -- no self-critique ability required, parallelizes
                  well, suits tasks with one discrete correct answer

# --- When reflection helps vs is just cost (decision table) ---
External/executable check available (tests, validators)  -> High value
Error is the "differently-framed re-read catches it" kind -> Moderate
Model lacks the underlying knowledge/reasoning capability -> Low/none
Short, low-stakes, first draft usually already correct    -> Negative ROI
Open-ended/subjective, no clear correctness signal         -> Uncertain

# --- Empirical honesty (memorize this) ---
Reflection's track record is MIXED, not universally positive.
Strong evidence: code+tests, structured data+validators, Reflexion in
  pass/fail environments.
Weak/mixed evidence: open-ended text judged only by another LLM opinion.
Can actively HURT: critique-induced degradation of an already-correct draft.
NEVER assume it helps -- evaluate before/after on real success criteria.

# --- Stopping criteria (combine, don't rely on one) ---
1. Hard max iteration count (code-enforced, e.g. 1-3)
2. External verification pass (tests/validator), given PRECEDENCE
3. Diminishing-returns check (near-identical consecutive drafts)
4. Hard token/cost budget, independent of iteration count
NEVER rely solely on the critique step's own "no issues" report.

# --- Production musts ---
Ground critique in an external check wherever the task allows it.
Specific critique prompts (name concrete standards), never vague ones.
Evaluate actual before/after quality delta -- not self-reported confidence.
Test for critique-induced degradation of already-correct drafts.
Scope reflection to an explicit allowlist of task types, not everywhere.
Log every draft, critique, and revision, not just the final output.

# --- Sibling skills map ---
Agent Fundamentals -> the general loop reflection is layered onto
Planning            -> plans can themselves be critiqued before execution
Agent Memory        -> storage for Reflexion's episodic reflection buffer
Evaluation          -> the methodology to prove reflection is earning its cost
Hallucination       -> self-critique can confidently endorse a fabrication
Prompt Engineering  -> writing specific, actionable critique/revise prompts
LangGraph           -> implementing reflection as an explicit, cyclic graph
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is reflection, mechanically? | A generate-critique-revise loop: a draft is evaluated against an explicit standard and revised, repeated until a stopping condition fires |
| What is the Reflexion pattern specifically? | Verbal self-feedback: an agent generates a natural-language reflection on a failed attempt, stores it in memory, and reuses it on a subsequent similar attempt |
| What must own a reflection loop's stopping condition? | Code (max iterations, cost budget, external check), never the critique step's own judgment alone |
| What is the strongest configuration for reliable reflection? | Grounding the critique in an external, executable/checkable signal (tests, validators, calculators) rather than relying on LLM opinion alone |
| How does reflection differ from self-consistency? | Reflection sequentially improves one draft via critique/revise; self-consistency samples multiple independent outputs in parallel and aggregates (e.g. majority vote) |
| What is critique-induced degradation? | A specific failure mode where a critique step flags a spurious issue in an already-correct draft, driving a revision that makes it worse |
| Same-model self-critique vs a separate critic -- key tradeoff? | Same-model is cheaper but shares the generator's own blind spots; a separate critic costs more but can catch errors the generator cannot see in itself |
| What is the single biggest mistake this page warns against? | Assuming reflection is a universal quality upgrade and skipping a real before/after evaluation of whether it actually helps |
| What evidence should NOT be trusted as proof reflection helped? | The model's own self-reported confidence that a revision is better -- must be checked against the task's real success criterion |
| When does reflection's evidence base look strongest? | Tasks with an external, executable check -- code with tests, structured data with validators, Reflexion in pass/fail environments |
| When does reflection's evidence base look weakest/most mixed? | Open-ended, subjective tasks judged only by another LLM's opinion, with no external ground truth |
| What does an effective critique prompt need that a vague one lacks? | An explicit, checkable standard (specific edge cases, a rubric, an external result) rather than a vague "is this good" |
| Which skill provides the methodology to prove reflection is earning its cost? | Evaluation |
| Which skill covers the risk of self-critique confidently endorsing a fabricated claim? | Hallucination |
| What kind of loop shape is well suited to implementing reflection with visible, controllable state? | A graph-based orchestration framework with explicit cycles, e.g. LangGraph |
`,

  mcqs: `
**1. What best defines reflection as covered on this page?**

A) A model simply being asked "are you sure" and repeating its answer  B) A generate-critique-revise loop where a draft is evaluated against an explicit standard and revised, repeated until a stopping condition fires  C) Any technique that samples multiple independent outputs and votes  D) A special model architecture distinct from a standard LLM

**Answer: B** — reflection is a control-flow and prompting pattern layered on the same underlying LLM, not a different kind of model or a vague "are you sure" re-prompt.

**2. Which configuration has the strongest, most consistently reported evidence of improving quality?**

A) Same-model self-critique on open-ended creative writing with no external check  B) Critique grounded in an external, executable signal, such as a real test suite for generated code  C) Asking the model to restate its confidence in the same answer  D) Increasing the model's temperature during generation

**Answer: B** — grounding the critique in an external, checkable result is consistently the strongest and most reliable configuration described throughout this page.

**3. What is critique-induced degradation?**

A) A hardware failure during a long reflection loop  B) A failure mode where a critique step flags a spurious issue in an already-correct draft, driving a revision that makes it worse  C) A technique for improving self-consistency  D) The normal, expected outcome of every reflection loop

**Answer: B** — this is a specific, well-documented risk of ungrounded self-critique, not a rare or hypothetical edge case, and worth explicit regression testing against.

**4. How does self-consistency differ from reflection?**

A) They are the same technique with different names  B) Self-consistency samples multiple independent outputs in parallel and aggregates them; reflection sequentially critiques and revises one output  C) Self-consistency requires a separate critic model; reflection never does  D) Self-consistency only works for text generation, never for reasoning tasks

**Answer: B** — self-consistency is a parallel sample-and-aggregate technique that does not depend on a model's ability to critique itself, while reflection is a sequential critique-and-revise process on one draft.

**5. What should own a reflection loop's stopping condition in a well-designed system?**

A) The critique step's own report that it is satisfied, exclusively  B) A combination of a hard iteration cap, a cost budget, and (where available) an external verification check, enforced in code  C) The user, who must manually stop every run  D) Nothing -- reflection loops should run until tokens run out

**Answer: B** — exactly as in a general agent loop, the model's own assertion that it is done is not sufficient on its own; an externally enforced backstop is required.

**6. What is the honest, evidence-based view of reflection's overall track record that this page emphasizes?**

A) Reflection is a universal quality upgrade that should be applied to every LLM call  B) Reflection never provides any measurable benefit and should be avoided entirely  C) Reflection's benefit is inconsistent across tasks and models -- strong where grounded in external checks, much more mixed on open-ended tasks -- and should be evaluated per task, not assumed  D) Reflection only works with reasoning-oriented models, never with standard models

**Answer: C** — the empirical record is genuinely mixed, and treating reflection as a guaranteed win is the central mistake this page tries to prevent.
`,

  "revision-notes": `
**What reflection is, in five lines:** Reflection is a generate-critique-revise loop layered on top of an LLM: a draft is produced, evaluated against an explicit standard (by the same model or a separate critic), and revised based on that critique, repeated until a stopping condition fires. It is not a different model capability, and it does not manufacture knowledge or reasoning the model does not already have — it gives the model (or a critic) a second, differently-framed pass at recognizing a mistake it already had the underlying capacity to notice. Reflexion extends this into learning from a specific past failure across attempts, by storing a natural-language reflection in memory and reusing it on a subsequent try.

**Reflection vs self-consistency, in four lines:** Reflection sequentially improves one draft through critique and revision; self-consistency samples multiple independent outputs in parallel and aggregates them, commonly by majority vote for tasks with one discrete correct answer. Self-consistency parallelizes better and does not depend on a model's ability to critique itself; reflection can in principle target and fix a specific identified flaw, but only if the critique step can actually recognize it — neither is universally superior, and the right choice depends on the task's structure.

**When reflection helps vs when it is just cost, in four lines:** Reflection shows its strongest, most consistently reported benefit where an external, executable, or otherwise checkable signal grounds the critique — code with real tests, structured data with a validator, Reflexion-style learning in environments with a clear pass/fail signal. Its benefit is considerably more mixed, sometimes null and occasionally negative, on open-ended or subjective tasks judged only by another LLM's opinion, and a critique step can actively degrade an already-correct draft by flagging a spurious issue — a specific, well-documented failure mode, not a rare edge case.

**Stopping criteria and production discipline, in four lines:** A reflection loop must have its termination owned by code, not by the critique step's own judgment alone — combine a hard maximum iteration count, a hard cost/token budget, diminishing-returns detection, and (where available) precedence given to external verification over LLM-only critique. Production teams apply reflection selectively to identified failure-prone steps rather than blanketly across a pipeline, and always evaluate its actual before/after effect on a representative task set rather than assuming a critique-revise step must help.

**The honest bottom line and sibling-skill map, in three lines:** The single biggest mistake to avoid is treating reflection as a guaranteed quality upgrade rather than a technique to evaluate per task, per model, like any other. Evaluation provides the methodology to actually measure whether it worked; Hallucination covers the related risk of self-critique confidently endorsing a fabricated claim; Planning, Agent Memory, and Agent Fundamentals cover the surrounding agent architecture reflection is layered onto, and LangGraph is a common substrate for implementing it as an explicit, cyclic control-flow graph.
`,

  "learning-roadmap": `
A realistic path through reflection and into the sibling skills (adjust pace to your background):

**Week 1 — Prerequisites check.** If you have not already, work through **Agent Fundamentals** and the core of **Prompt Engineering** first — this page assumes both without re-deriving them. Milestone: you can explain the general agent loop's stopping-condition discipline well enough to see why reflection loops need the identical discipline.

**Week 2 — The core loop.** Beginner and Intermediate Concepts sections here; run Lab 1 (from-scratch generate-critique-revise loop) and Lab 2 (reflection vs self-consistency head-to-head). Milestone: you can implement a bounded critique-revise loop and explain, with your own measured numbers, when self-consistency beats it and vice versa on your test task set.

**Week 3 — Grounding and honest evaluation.** Advanced Concepts (the decision table, the empirical-honesty section) and run Lab 3 (grounding reflection in an executable check). Milestone: you can confidently judge, for a new task, whether reflection is likely to earn its cost, and you have a working pipeline that grounds critique in a real test suite rather than LLM opinion alone.

**Week 4 — Production discipline and failure modes.** Production Usage through Production Checklist, plus Anti-Patterns, Common Mistakes, and Debugging. Milestone: a reflection pipeline with enforced iteration/cost budgets, logging, and a regression test for critique-induced degradation.

**Week 5 — Reflexion and composing with agent memory.** Run Lab 4 (Reflexion-style memory across attempts). Milestone: a measured before/after comparison showing whether stored reflections actually improved success rate in your chosen environment, not just an assumption that they did.

**Week 6 onward — Branch into the sibling skills based on your immediate need**: go to **Evaluation** next if your priority is rigorously measuring whether any quality technique (reflection included) is earning its cost; go to **Hallucination** if your agents handle factual claims and you need to understand how self-critique can go wrong specifically there; go to **Planning** if you want to apply reflection to proposed plans before execution; go to **Agent Memory** if you are building out a full Reflexion-style episodic memory system; go to **LangGraph** once you are ready to implement reflection loops as explicit, controllable, cyclic graphs in a production framework. Most engineers should read **Evaluation** immediately after this page, since the discipline of measuring before/after effect is the single most important habit this page tries to instill.
`,

  "official-docs": `
- Provider documentation on structured output and function/tool calling (OpenAI, Anthropic, and other model providers) — relevant because many reflection pipelines implement the critique and revise steps as structured calls rather than free text; check live docs for current schema conventions.
- **LangGraph** official documentation on cyclic graphs and conditional edges — the most directly relevant framework documentation for implementing a generate-critique-revise loop as an explicit, stateful graph rather than hand-rolled control flow.
- **Agent Fundamentals**, **Planning**, and **Agent Memory** sibling-skill pages on this platform — the surrounding architecture reflection is layered onto; read alongside this page's Architecture and Internal Working sections.
- Provider model release notes discussing reasoning/inference-time-compute features — these are the most reliable first source for how a specific model generation's built-in reasoning interacts with the marginal value of an explicit reflection loop.
`,

  books: `
- **Designing Machine Learning Systems** — Chip Huyen. Not reflection-specific, but its treatment of iterative model-improvement pipelines and rigorous evaluation generalizes directly to the "measure before you trust a technique" discipline this page emphasizes throughout.
- **Artificial Intelligence: A Modern Approach** — Russell & Norvig. Useful background on the classical idea of an agent evaluating and revising its own plan or belief state, which predates and conceptually underlies LLM-specific reflection patterns; see also **Agent Fundamentals**'s book recommendations.
- **Thinking, Fast and Slow** — Daniel Kahneman. Not an AI book, but a useful conceptual analogy for the distinction between a fast first-pass generation and a slower, deliberate critique pass — helpful framing for reasoning about why reflection sometimes catches errors a first pass misses, and why it is not free.
- Framework-specific documentation-as-book resources (official guides published alongside **LangGraph**) — treat these as the practical companion to this page's conceptual grounding for implementing reflection loops concretely, and check them for the current API surface rather than relying on a fixed edition.

Given how fast the empirical picture on reflection specifically is still moving, prioritize the **Research Papers** and **Blogs** sections below over any book for current, task-specific evidence — books are best here for durable conceptual framing, not current benchmark results.
`,

  blogs: `
- **Provider engineering/research blogs** (OpenAI, Anthropic, Google DeepMind, Microsoft Research) — high-signal source for how organizations building agent frameworks describe their own experience with self-critique and iterative refinement, including honest discussion of where it did and did not help.
- **LangChain's and LangGraph's official blogs** — practitioner-oriented posts specifically on implementing reflection loops as explicit graphs, common pitfalls, and real before/after results from teams that have shipped these pipelines.
- **Simon Willison's blog** — consistently clear, skeptical, practitioner-grounded writing on LLM self-evaluation, prompt injection risk in multi-step pipelines, and honest treatment of when a technique like reflection does or does not deliver — a good corrective against overclaiming reflection's benefit.
- **Hugging Face blog** — practitioner-oriented explainers on self-refinement, self-consistency, and agent evaluation methodology.
- Independent ML-research summary blogs and newsletters that track and critically summarize new evaluation papers on self-critique and iterative refinement — useful for staying current given how quickly the empirical picture here continues to evolve.
`,

  "research-papers": `
Reflection draws on a specific, identifiable set of foundational papers; here they are with honest framing of what each established and what remains actively debated:

- **"Self-Refine: Iterative Refinement with Self-Feedback"** — the paper most directly formalizing the generate-critique-revise pattern this page describes in Beginner and Intermediate Concepts, demonstrating gains on several generation tasks using the same model for generation and feedback.
- **"Reflexion: Language Agents with Verbal Reinforcement Learning"** — the paper formalizing the pattern of storing natural-language reflections on failed attempts in an episodic memory buffer and reusing them on subsequent attempts, central to the Reflexion coverage in Intermediate Concepts and Case Studies.
- **"Self-Consistency Improves Chain of Thought Reasoning in Language Models"** — the foundational paper for the contrasting sample-and-vote technique covered throughout this page, showing gains from aggregating multiple independent reasoning paths rather than iteratively refining one.
- **Follow-up evaluation and critique work examining self-refinement's limits** — a growing body of papers specifically investigating when self-critique does and does not help, including work highlighting cases where same-model self-critique provides little to no measurable benefit or degrades correct outputs; this is the most directly relevant reading for the empirical-honesty framing emphasized in Advanced Concepts, and is worth seeking out by searching recent proceedings rather than relying on a fixed list, since this specific line of evaluation work continues to expand.
- **ReAct and general agent-loop papers** (see **Agent Fundamentals**' Research Papers) — foundational context for the broader control-flow pattern reflection is layered onto.

This area moves fast enough, and the "does self-critique reliably help" question is contested enough, that the most current and rigorously evaluated findings are best found via a live search of recent proceedings (NeurIPS, ICML, ACL) rather than a fixed list — treat the papers above as the durable foundational layer establishing the core patterns, not a final verdict on when they work.
`,

  videos: `
- Conference talks and technical presentations from the authors of Self-Refine, Reflexion, and self-consistency papers — high-signal for hearing the original framing, motivation, and (in later talks) honest updates on where the technique did and did not generalize.
- Practitioner walkthroughs specifically building a test-grounded, iterative code-fixing agent — useful for seeing the strongest, most consistently evidenced reflection use case implemented end to end.
- Talks from **LangGraph** maintainers on implementing cyclic, stateful reflection loops as explicit graphs, connecting this page's conceptual loop to a concrete production framework.
- University-level AI or NLP course lecture recordings covering iterative refinement and self-evaluation techniques as background before diving into the LLM-specific material on this page.
`,

  "github-repos": `
- **Reflexion** reference implementation repository — the canonical implementation of the verbal-reinforcement, episodic-memory pattern covered in Intermediate Concepts and Case Studies.
- **Self-Refine** reference implementation repository — useful for seeing the original generate-critique-revise pattern implemented concretely across the tasks the paper evaluated.
- **LangGraph** repository — well suited to implementing reflection loops as explicit, cyclic graphs with visible state; good for seeing a production-grade control-flow implementation rather than a from-scratch script.
- Self-consistency reference implementations (often bundled alongside chain-of-thought reasoning benchmark repositories) — useful for seeing the sample-and-vote aggregation pattern implemented concretely, for direct comparison against reflection.
- Autonomous coding-agent repositories that ground their iteration loop in real test execution — useful for seeing the strongest, most consistently evidenced reflection configuration (external-verification grounding) implemented end to end.
- Agent-evaluation and benchmark repositories (spanning coding, tool-use, and reasoning benchmarks) — useful for reproducing or extending the kind of before/after comparison this page insists on before trusting any reflection pipeline.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Loop-mechanics fluency*: implement the bounded generate-critique-revise loop from Coding Questions #1 from memory, then extend it with the diminishing-returns similarity check without looking at the reference implementation.
2. *Grounding judgment*: for ten varied task descriptions (mixing tasks with an obvious external check available, tasks with none, and deliberately ambiguous ones), decide for each whether reflection should be grounded in an external check, left as same-model self-critique, replaced with self-consistency, or skipped entirely — defend each choice in one sentence using the decision table in Advanced Concepts.
3. *Before/after measurement*: given a small labeled task set, measure first-draft accuracy vs. final-draft accuracy after reflection, and separately measure self-consistency's accuracy at the same total token budget — report which technique actually wins on your specific task set, not which one you expected to win.
4. *Critique-induced degradation hunting*: construct five tasks whose naive first draft is already correct, run them through a reflection pipeline, and count how often the final draft is worse than the first — discuss what this tells you about when to trust an unverified critique step.
5. *Stopping-criteria design*: given a hypothetical reflection pipeline with no current stopping logic, design the full combination of iteration cap, cost budget, diminishing-returns check, and external-verification precedence before writing any code, then implement it.
6. *Reflexion vs single-pass reflection*: given an agent operating across multiple attempts at similar tasks with a clear pass/fail signal, implement both a no-memory reflection baseline and a Reflexion-style stored-reflection version, and measure whether the stored reflections actually improve success rate across attempts.

External sets: any current agent- or reasoning-benchmark suite with both a reflection-friendly and self-consistency-friendly task subset, used as a way to see the two techniques compared on real, checkable outcomes rather than anecdote.
`,

  "architecture-diagram": `
The reference architecture for a production reflection-augmented feature — the shape the sibling skills each go deep on one part of:

~~~mermaid
flowchart TB
    Client["Client application"] --> App["Application layer\n(task framing, quality bar)"]
    App --> Decide{"Does this task type have an\nevidenced reflection benefit?\n(see decision table)"}
    Decide -->|No| Direct["Single-pass generation\n(or self-consistency instead)"]
    Decide -->|Yes| Loop["Reflection loop controller"]
    Loop --> Gen["Generator LLM call"]
    Gen --> Crit["Critic LLM call\n(same model or separate critic)"]
    Crit --> ExtCheck{"External verification\navailable?"}
    ExtCheck -->|Yes| Verify["Run test / validator / check\n(ground-truth signal)"]
    ExtCheck -->|No| Judge["Decide from LLM critique alone\n(weaker signal -- flag as such)"]
    Verify --> StopCtl["Stopping-condition controller\n(iterations, diminishing returns,\nbudget, external result precedence)"]
    Judge --> StopCtl
    StopCtl -->|Continue| Rev["Reviser LLM call"]
    Rev --> Crit
    StopCtl -->|Stop| App
    Direct --> App
    App --> Client
    subgraph Support["Supporting systems"]
        Monitor["Iteration count, cost, quality-delta,\ndegradation-rate monitoring"]
        Eval["Evaluation: measured before/after\nquality vs. real success criterion"]
    end
    Loop --> Support
~~~

Every labeled box in this diagram corresponds to a sibling skill on this platform: the "does this task type have an evidenced benefit" gate is the architectural judgment this page emphasizes most; the external-verification path -> **Testing** and **Evaluation**; the stopping-condition controller's discipline -> the same discipline covered for general agent loops in **Agent Fundamentals**; the reflection loop implemented concretely as a graph -> **LangGraph**; monitoring and rigorous evaluation of whether the whole pipeline is earning its cost -> **Evaluation**.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Reflection))
    What it is
      Generate-critique-revise loop
      Layered on the same LLM, not a new capability
      Bounded by the model's own knowledge/reasoning limits
    Patterns
      Self-refine
        Same-pass critique and revision cycle
      Reflexion
        Verbal self-feedback across attempts
        Stored in episodic memory
        Needs a real pass/fail signal
      Self-consistency (contrast)
        Sample N independent outputs
        Aggregate / majority vote
        Parallel, not sequential
    Same-model vs separate critic
      Same model: cheap, shares blind spots
      Separate critic: costlier, catches different errors
    When it helps vs is just cost
      External/executable check available -> strong
      Knowledge/capability gap -> weak or none
      Open-ended/subjective -> mixed, uncertain
      Critique-induced degradation risk
    Stopping criteria
      Hard iteration cap
      Cost/token budget
      Diminishing-returns detection
      External verification precedence
    Empirical honesty
      Mixed track record, not universal
      Measure before/after, never assume
      Not a substitute for missing capability
    Production discipline
      Ground critique in external checks
      Specific, not vague, critique prompts
      Evaluate before shipping
      Log every draft/critique/revision
    Sibling skills
      Agent Fundamentals
      Planning
      Agent Memory
      Evaluation
      Hallucination
      Prompt Engineering
      LangGraph
~~~
`,
};

export default reflection;
