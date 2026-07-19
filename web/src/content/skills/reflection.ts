import type { SkillContent } from "../types";

const reflection: SkillContent = {
  overview: `
Reflection is the technique of having an agent (or a dedicated, separate model call) explicitly **critique its own prior output**, and use that critique to generate an improved revision — directly extending the platform's own **Planning** skill's plan-revision concept from "revise a plan when execution reveals new information" into a more GENERAL self-improvement loop applicable to any generated output (a piece of code, a written draft, an analysis), not only a multi-step plan. This is the concrete technique underlying the generate-critique-revise CYCLE first introduced as a **LangGraph** implementation example, and directly connects to **Agent Fundamentals**' own compounding-error concept — reflection is precisely the mechanism for CATCHING a flawed intermediate output before it propagates further, rather than only validating a final result after the fact.

Reflection's core mechanic is deliberately simple: after an initial generation, a SEPARATE (or the same) reasoning step evaluates that generation against explicit criteria (correctness, completeness, adherence to instructions), producing structured feedback; this feedback is then fed back into a subsequent generation attempt, repeating until the critique step judges the output satisfactory or a bounded retry limit is reached. This pattern has proven particularly effective for tasks with objectively checkable properties (does generated code pass its tests, does a summary capture the source's key facts) as well as more subjective quality dimensions (is a response appropriately toned, is a plan genuinely well-reasoned).

Key characteristics: **the generate-critique-revise cycle**, the foundational reflection pattern; **self-critique versus external critique** (the same agent critiquing its own output, versus a genuinely separate, dedicated critic agent/model); **objective versus subjective evaluation criteria**, directly connecting to the **Evaluation** skill's own measurement-methodology treatment; **bounded reflection loops**, directly reusing **Agent Fundamentals**' and **Planning**'s loop-safety guidance; and **reflection's limits**, particularly a model's genuine ability to reliably detect its OWN errors, a meaningfully harder problem than detecting someone else's.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2023 | **Self-Refine** and similar early research demonstrates that having an LLM critique and iteratively revise its own output — without any additional training — can measurably improve output quality across a range of tasks, directly establishing reflection as a genuinely useful, training-free technique |
| 2023 | **Reflexion** extends this idea by having an agent maintain an explicit, persisted "reflection" (a form of episodic memory, directly connecting to the **Agent Memory** skill) across MULTIPLE task attempts, letting lessons learned from a failed attempt inform a subsequent, separate attempt at a similar task |
| 2023–2024 | Reflection becomes a standard, widely-adopted pattern across agent frameworks — directly implemented as a cycle in **LangGraph**'s graph model, as a critique-focused specialized agent role in **CrewAI** and **AutoGen**'s reviewer patterns, and conceptually embedded in **Planning**'s own plan-revision treatment |
| 2024 | Growing research attention to reflection's genuine LIMITS — specifically, a model's ability to reliably self-critique degrades for errors it doesn't recognize as errors in the first place (a model that doesn't know a fact is wrong cannot reliably flag its own claim about that fact as wrong) |
| 2024–2025 | Continued refinement of EXTERNAL critique patterns (a genuinely separate, specialized critic model/agent, or verification against external ground truth) as a more reliable alternative to pure self-critique for tasks where self-critique's inherent limits are most consequential |

Reflection's history directly reflects a genuine, honest maturation — from an initially exciting demonstration that self-critique measurably improves output quality, toward an increasingly nuanced understanding of exactly WHEN self-critique is reliable and when it genuinely isn't, motivating a more deliberate mix of self- and external-critique techniques.
`,

  "why-it-exists": `
Reflection exists because an LLM's FIRST attempt at a genuinely complex or nuanced task is often not its BEST possible attempt — directly connecting to **Agent Fundamentals**' own treatment of a single, one-shot generation call's limitations — and having the model (or a separate critic) explicitly evaluate that first attempt against clear criteria, then revise based on identified shortcomings, frequently produces a measurably better final result than accepting the first attempt as final, at the cost of additional model calls.

Reflection solves this by formalizing an explicit GENERATE-CRITIQUE-REVISE cycle: generate an initial output, critique it against explicit criteria (producing structured, actionable feedback rather than a vague "make it better"), and revise based on that specific feedback — directly extending **Planning**'s own plan-revision concept from "revise a plan based on new execution information" to the more general case of "revise ANY generated output based on an explicit, structured critique of it."
`,

  "problem-it-solves": `
Reflection addresses the **"how does an agent improve the quality of a generated output beyond its first, one-shot attempt, using its own (or a separate) critique rather than accepting the first result as final"** challenge.

Concretely, reflection techniques provide:

- **The generate-critique-revise cycle**, a structured, repeatable mechanism for output improvement, directly extending **Planning**'s own plan-revision concept to general output generation.
- **Explicit evaluation criteria**, directly connecting to the **Evaluation** skill's own rigorous measurement methodology — a genuinely useful critique requires clear, specific criteria, not a vague "is this good."
- **Persisted reflection across task attempts** (Reflexion-style), letting lessons learned from a failed attempt inform a genuinely separate, later attempt, directly connecting to the **Agent Memory** skill's own episodic-memory concept.
- **A framework for choosing self- versus external critique**, directly addressing self-critique's genuine, well-documented limits for errors a model doesn't recognize as errors in the first place.

What reflection does **not** solve, or solves only partially: reflection cannot reliably catch an error the underlying model genuinely doesn't recognize as an error — a model's own self-critique is fundamentally bounded by the SAME knowledge/capability limits as its original generation, directly connecting to the **Hallucination** skill's own treatment of confidently-wrong output; and reflection directly trades additional compute cost (at minimum, one extra model call per reflection cycle) for improved output quality — not every task's quality bar justifies this additional cost.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the generate-critique-revise cycle and implement it for a representative generation task.
2. Distinguish self-critique from external critique, and explain when each is more reliable.
3. Design explicit, specific evaluation criteria for a reflection step, rather than vague quality judgments.
4. Implement a bounded reflection loop, directly reusing Agent Fundamentals' and Planning's loop-safety guidance.
5. Explain Reflexion's persisted-reflection pattern and its connection to Agent Memory's episodic memory concept.
6. Recognize reflection's genuine limits: a model cannot reliably self-critique errors it doesn't recognize as errors.
7. Answer senior-level interview questions on reflection design and its tradeoffs.
`,

  prerequisites: `
- **Required**: **Planning** (the plan-revision concept this page directly generalizes), **Agent Fundamentals** (loop-safety guidance, compounding-error concept), **Evaluation** (the measurement-methodology concepts underlying good critique criteria).
- **Very helpful**: **LangGraph** (its cycle-supporting graph model is a natural implementation substrate for reflection loops), **Agent Memory** (Reflexion-style persisted reflection directly connects to episodic memory).

Dependency chain: **Agent Fundamentals** → the framework skills → **Agent Memory** → **Planning** → this page (Reflection) → **Tool Calling** → **MCP**.
`,

  "beginner-concepts": `
### A simple generate-critique-revise cycle

~~~python
def generate_with_reflection(task, model, max_iterations=3):
    output = model.generate(task)
    for _ in range(max_iterations):
        critique = model.generate(f"Critique this output against the task requirements. Is it satisfactory? Task: {task}\\nOutput: {output}")
        if critique.is_satisfactory:
            return output
        output = model.generate(f"Revise this output based on the critique.\\nOutput: {output}\\nCritique: {critique.feedback}")
    return output
~~~

This directly extends **Planning**'s plan-execute-replan pattern to general output generation — GENERATE an initial attempt, CRITIQUE it against the task's requirements, and REVISE based on the specific feedback, repeating until satisfactory or a bounded iteration limit is reached.

### Why vague critique criteria produce poor reflection

~~~
Asking a model "is this good?" produces a vague, often
unhelpfully generic critique -- directly connecting to the
Prompt Engineering skill's own clarity guidance, a USEFUL
critique requires EXPLICIT, SPECIFIC criteria: "Does this
code handle the edge case of an empty input list? Does this
summary include the source's three main statistics? Does
this response directly answer the user's specific question?"
~~~

### Self-critique: the same model evaluating its own output

~~~python
def self_critique(output, task, model):
    return model.generate(
        f"You previously produced this output for the task '{task}': {output}\\n"
        f"Carefully check it against these specific criteria: {criteria}\\n"
        f"List any issues found, or state 'no issues found'."
    )
~~~

The SAME model that generated the output also evaluates it — simple to implement, but genuinely limited by the model's own knowledge/capability, covered further in this page's advanced-concepts section.
`,

  "intermediate-concepts": `
### External critique: a separate, dedicated critic

~~~python
def external_critique(output, task, critic_model, criteria):
    return critic_model.generate(
        f"As an independent reviewer, evaluate this output against the task and criteria.\\n"
        f"Task: {task}\\nCriteria: {criteria}\\nOutput: {output}\\n"
        f"Be skeptical -- actively look for problems rather than assuming correctness."
    )
~~~

Using a genuinely SEPARATE critic (a different model, a different prompt persona, or — directly connecting to **CrewAI** and **AutoGen**'s own reviewer-agent patterns — a distinct agent altogether) can catch issues a purely self-critiquing model might overlook, since the critic isn't anchored to the same reasoning that produced the original (possibly flawed) output.

### Reflexion: persisting reflection across separate task attempts

~~~python
def reflexion_attempt(task, model, prior_reflections, max_attempts=3):
    for attempt in range(max_attempts):
        context = f"Prior lessons learned: {prior_reflections}\\nTask: {task}"
        output = model.generate(context)
        if task_succeeded(output):
            return output
        reflection = model.generate(f"This attempt failed. Why, and what should be done differently next time? Output: {output}")
        prior_reflections.append(reflection)  # directly connects
                                                 # to Agent Memory's
                                                 # episodic memory concept
    return output
~~~

Unlike a single-task generate-critique-revise cycle, Reflexion PERSISTS the lesson learned from a FAILED attempt (an explicit reflection) into future, genuinely SEPARATE attempts at similar tasks — directly implementing the **Agent Memory** skill's own episodic-memory concept, letting an agent build up experience across multiple, distinct task instances rather than only within a single ongoing attempt.

### Bounding reflection loops: directly reusing Agent Fundamentals and Planning

~~~python
def bounded_reflection(task, model, max_iterations=3):
    # ALWAYS bound iterations, directly reusing Agent
    # Fundamentals' and Planning's loop-safety guidance --
    # an unbounded reflection loop risks unproductive,
    # expensive, never-converging revision cycles
    ...
~~~

### Reflection as a specialized agent role

~~~
In multi-agent frameworks (CrewAI, AutoGen), reflection is
often implemented as a DEDICATED reviewer/critic agent role
(directly connecting to CrewAI's own role-differentiation
guidance) rather than the same agent critiquing itself --
this is functionally a form of EXTERNAL critique, benefiting
from the same genuine advantage of not being anchored to the
same reasoning that produced the original output.
~~~
`,

  "advanced-concepts": `
### Why self-critique has genuine, fundamental limits

~~~
A model's self-critique is bounded by the SAME knowledge and
capability limits as its original generation -- if a model
genuinely doesn't know a specific fact is incorrect (rather
than merely having generated it carelessly), asking it to
"check for errors" won't reliably surface THAT specific
error, since the model has no more insight into its own
factual gaps during critique than it did during generation.
This directly connects to the Hallucination skill's own
treatment of confidently-wrong output -- a model confidently
wrong about a fact is often JUST as confidently wrong when
asked to double-check that same fact.
~~~

### When external verification (not just external critique) is necessary

~~~
For factual claims genuinely checkable against ground truth
(a calculation, a piece of code's actual test results, a
retrieved document), EXTERNAL VERIFICATION -- actually
checking the claim against real, external ground truth,
directly connecting to the AutoGen skill's own code-
execution-as-verification pattern and the Hallucination
skill's own RAG-based mitigation -- is considerably more
reliable than EITHER self- or external LLM-based critique
alone, since it doesn't depend on any model's own knowledge
being correct.
~~~

### Reflection and compounding error: reflection as mitigation, not elimination

~~~
Reflection is a genuine, valuable mitigation for Agent
Fundamentals' own compounding-error concept -- catching a
flawed intermediate output before it propagates further --
but it is NOT a complete elimination of this risk, since
reflection itself can fail to catch an error (particularly
one the model doesn't recognize as an error), and a
reflection step can even, in principle, introduce a NEW
error while "fixing" a correctly-identified one.
~~~

### The cost-quality tradeoff of reflection depth

~~~
More reflection iterations generally improve output quality
up to a point, but with DIMINISHING RETURNS -- and each
additional iteration directly adds cost (an additional
model call, connecting to the Inference skill's own per-call
cost treatment). A senior engineer calibrates reflection
depth (max_iterations) to the task's genuine quality bar,
rather than assuming more reflection is always better.
~~~
`,

  "internal-working": `
Tracing a bounded generate-critique-revise cycle with external verification for a code-generation task:

~~~mermaid
sequenceDiagram
    participant Agent
    participant Generator
    participant Critic as External Critic
    participant TestRunner as Test Execution\n(external verification)

    Agent->>Generator: generate code for the task
    Generator->>Agent: initial code
    Agent->>TestRunner: run the code's test suite\n(external verification, not\njust LLM-based critique)
    TestRunner->>Agent: 2 of 5 tests fail\n(concrete, ground-truth feedback)
    Agent->>Critic: critique the code given\nthe specific failing tests
    Critic->>Agent: identified issue: an\nedge case isn't handled
    Agent->>Generator: revise the code based\non this specific feedback
    Generator->>Agent: revised code
    Agent->>TestRunner: re-run the test suite
    TestRunner->>Agent: all 5 tests pass
    Agent->>Agent: reflection loop complete
~~~

1. **An initial output is generated**, directly analogous to **Agent Fundamentals**' planning/acting step.
2. **EXTERNAL VERIFICATION (actually running the tests) provides concrete, ground-truth feedback** — considerably more reliable than pure LLM-based self-critique alone, since it doesn't depend on any model's own knowledge being correct.
3. **A critique step (potentially a separate, external critic) interprets this concrete feedback**, identifying the SPECIFIC issue (an unhandled edge case) rather than a vague "something's wrong."
4. **The output is revised based on this specific feedback**, and the cycle repeats (bounded by a maximum iteration count) until verification succeeds or the bound is reached.

**Why this matters**: this trace demonstrates precisely why COMBINING external verification (concrete, ground-truth feedback) with critique (interpreting what that feedback means and how to act on it) produces a considerably more reliable reflection loop than relying purely on a model's own self-assessment of its output's correctness.
`,

  architecture: `
A senior AI engineer thinks about reflection architecture in terms of deliberately choosing between self-critique, external critique, and external verification matched to a task's genuine error-detectability, and bounding reflection depth appropriately.

### Choosing a critique/verification approach

~~~mermaid
flowchart TB
    Task["A given generated output\nneeding potential revision"] --> Q{"Is there an OBJECTIVE,\nexternally-checkable ground\ntruth (tests, calculations,\nretrieved facts)?"}
    Q -->|Yes| External["Use external verification\n(directly checking against\nground truth)"]
    Q -->|"No -- genuinely\nsubjective quality\n(tone, clarity, structure)"| Critique{"Is the error type one\nthe model would\nplausibly recognize?"}
    Critique -->|Yes| SelfCritique["Self-critique may suffice"]
    Critique -->|"No -- requires a\ngenuinely fresh\nperspective"| ExternalCritique["Use a separate,\nexternal critic"]
~~~

### Bounding reflection depth appropriately

A senior practitioner calibrates \`max_iterations\` to the task's genuine quality bar and the marginal cost of additional reflection cycles, rather than assuming maximal reflection depth is always the right default.
`,

  "data-flow": `
Tracing a request through a Reflexion-style system persisting lessons across separate task attempts:

~~~mermaid
sequenceDiagram
    participant Agent
    participant EpisodicMemory as Episodic Memory\n(Agent Memory skill)
    participant Task as New Task Instance

    Task->>Agent: new, similar task\n(e.g., a different\ncoding problem)
    Agent->>EpisodicMemory: retrieve relevant lessons\nfrom PRIOR failed attempts\nat similar tasks
    EpisodicMemory->>Agent: e.g., "previously forgot\nto handle empty-input\nedge cases"
    Agent->>Agent: generate this attempt,\nINFORMED by the retrieved\nprior lesson
    Agent->>Agent: this attempt succeeds\n(the prior lesson helped\navoid a repeat mistake)
    Agent->>EpisodicMemory: (if it had failed instead,\nstore a NEW reflection\nfor future attempts)
~~~

The critical detail: Reflexion's persisted reflection directly connects to the **Agent Memory** skill's own episodic-memory concept — a lesson learned from ONE task attempt (stored as an episodic memory) directly informs a genuinely SEPARATE, later attempt at a similar task, letting an agent's performance improve across MULTIPLE task instances over time, not merely within a single ongoing generate-critique-revise cycle.
`,

  "production-usage": `
### A representative production reflection loop combining external verification and critique

~~~python
def reflect_and_revise(task, generator, verifier, critic, max_iterations=3):
    output = generator.generate(task)
    for i in range(max_iterations):
        verification_result = verifier.check(output)  # e.g., run
                                                          # tests, check
                                                          # a calculation
        if verification_result.passed:
            return output
        critique = critic.evaluate(output, verification_result.details)
        output = generator.revise(output, critique)
    return output  # returns the best available attempt if
                     # max_iterations is reached without success
~~~

### Non-negotiables for production reflection systems

1. **Bound reflection iterations explicitly**, directly reusing **Agent Fundamentals**' and **Planning**'s loop-safety guidance.
2. **Prefer external verification over pure LLM-based critique** whenever an objective, checkable ground truth exists.
3. **Design explicit, specific evaluation criteria**, avoiding vague "is this good" critique prompts.
4. **Recognize self-critique's genuine limits**, using a separate, external critic for error types a model might not reliably recognize in its own output.
5. **Persist genuinely valuable lessons (Reflexion-style)** across separate task attempts when a task category recurs, directly connecting to **Agent Memory**.

### Common production patterns

- **Code-generation-and-test reflection loops**, directly leveraging external verification (actual test execution) as the primary feedback signal.
- **Content-generation review loops**, using a dedicated reviewer agent/persona for subjective quality dimensions.
- **Reflexion-style persisted learning**, applied to recurring task categories where lessons from past attempts genuinely transfer.
`,

  "industry-examples": `
- **Coding assistants using test-execution feedback to iteratively revise generated code**, directly connecting to **AutoGen**'s own code-execution-as-verification pattern.
- **Content-review pipelines** (research-write-edit, covered in the **CrewAI** skill) using a dedicated editor/reviewer role as a form of external critique.
- **Agentic research assistants** applying Reflexion-style persisted reflection to improve performance across a series of related research tasks over time.
`,

  "best-practices": `
1. **Bound reflection iterations explicitly**, directly reusing **Agent Fundamentals**' and **Planning**'s loop-safety guidance.
2. **Prefer external verification (checking against real ground truth) over pure LLM-based critique** whenever an objective check exists.
3. **Design explicit, specific evaluation criteria** for every critique step, avoiding vague quality judgments.
4. **Use a separate, external critic** for error types the model might not reliably recognize in its own output.
5. **Persist genuinely valuable lessons across task attempts (Reflexion-style)** for recurring task categories.
6. **Calibrate reflection depth to the task's genuine quality bar**, recognizing diminishing returns and cost accumulation.
7. **Recognize reflection mitigates, but doesn't eliminate, compounding-error risk.**
`,

  "anti-patterns": `
### Vague, unhelpful critique criteria

~~~
# WRONG — asking a model "is this output good?" without
# any specific, explicit evaluation criteria, producing
# a vague, often unhelpfully generic critique
# RIGHT — provide explicit, specific criteria directly
# tied to the task's actual requirements
~~~

### Relying purely on self-critique for factually-checkable claims

~~~
# WRONG — using only the same model's own self-critique to
# validate a factual claim that could instead be verified
# against real, external ground truth
# RIGHT — use external verification (actually checking
# the claim) whenever an objective ground truth exists
~~~

### Unbounded reflection loops

~~~
# WRONG — a generate-critique-revise cycle with no maximum
# iteration count, risking an unproductive, expensive,
# never-converging revision cycle
# RIGHT — bound reflection iterations explicitly, directly
# reusing Agent Fundamentals' and Planning's loop-safety guidance
~~~

### Other production-grade anti-patterns

- **Assuming reflection eliminates (rather than merely mitigates) compounding-error risk.**
- **Applying maximal reflection depth uniformly**, regardless of a task's genuine quality bar or the marginal cost of additional iterations.
- **Never persisting genuinely valuable lessons across recurring task categories**, repeatedly re-learning the same lesson from scratch.
`,

  performance: `
### Rule zero: reflection depth should scale with genuine quality requirements, not be applied maximally by default

Additional reflection iterations generally improve quality with diminishing returns, while directly adding cost — calibrate \`max_iterations\` to the task's genuine quality bar rather than assuming more is always better.

### The performance hierarchy (apply in order)

1. **Use external verification (a concrete, checkable ground truth) instead of LLM-based critique whenever possible** — it's both more reliable and often cheaper than an additional model call.
2. **Bound reflection iterations explicitly**, avoiding unproductive, costly, never-converging cycles.
3. **Design specific, efficient critique criteria** that directly target the task's actual requirements, avoiding wasted iterations on vague, unfocused feedback.
4. **Reserve external (separate) critic calls for genuinely error-prone dimensions**, rather than applying them universally when self-critique would suffice.

### Micro-level facts worth knowing

- Each reflection iteration involves at least one additional model call (critique) and often another (revision), directly connecting to the **Inference** skill's own per-call cost treatment — reflection cost scales roughly linearly with the number of iterations performed.
- External verification (e.g., running actual tests) is often both cheaper and more reliable than an equivalent LLM-based critique call, since it doesn't require any additional model inference at all for the verification step itself.
`,

  scalability: `
Deliberate reflection design directly determines how confidently an organization can scale agent output quality without unbounded cost growth.

### How disciplined reflection design enables scaling

~~~mermaid
flowchart LR
    CalibratedReflection["Bounded iterations +\nexternal verification\nwhere possible"] --> SustainableCost["Sustainable, predictable\ncost per generated output"]
    SustainableCost --> ConfidentScaling["Confident scaling to\nhigher output volume\nwithout runaway cost"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Unbounded reflection cost growth | Set an explicit max_iterations, calibrated to genuine quality needs |
| Self-critique missing genuine errors | Use external verification or a separate, external critic |
| Repeatedly re-learning the same lesson across recurring tasks | Implement Reflexion-style persisted reflection via Agent Memory |
| Vague critique producing unproductive revision cycles | Design explicit, specific evaluation criteria |
`,

  security: `
### Reflection-specific security considerations, directly extending Agent Fundamentals and Guardrails

~~~
A reflection loop that revises and re-executes an action
(e.g., a code-generation-and-fix loop that re-runs generated
code after each revision) inherits the SAME action-level
risk surface covered in Agent Fundamentals and Guardrails --
each revised attempt, if it involves a genuinely high-risk
action, warrants the same guardrail scrutiny as the original
attempt, not an implicit pass simply because it followed a
"correction."
~~~

### Essential reflection-related security practices

1. **Apply action-level guardrails to every revised attempt**, not only the original, directly reusing **Agent Fundamentals**' and **Guardrails**' treatment.
2. **Sandbox any code execution used for external verification**, directly reusing the **AutoGen** skill's own code-execution-safety guidance.
3. **Treat external critic feedback as potentially untrusted** if the critic itself processes external, untrusted content, directly reusing the **LangChain** skill's own prompt-injection guidance.

See **Agent Fundamentals**, **Guardrails**, and **AutoGen** for the broader security context this connects to.
`,

  testing: `
### Testing that reflection genuinely improves output quality

~~~python
def test_reflection_improves_code_correctness():
    initial_output = generator.generate(coding_task)
    reflected_output = reflect_and_revise(coding_task, generator, verifier, critic)
    assert test_pass_rate(reflected_output) >= test_pass_rate(initial_output)
~~~

### Testing bounded reflection termination

~~~python
def test_reflection_terminates_within_max_iterations():
    output, iterations_used = reflect_and_revise(hard_task, generator, verifier, critic, max_iterations=5)
    assert iterations_used <= 5
~~~

### The senior testing doctrine

- Test that reflection MEASURABLY improves output quality against a representative task set, directly connecting to the **Evaluation** skill's own rigorous measurement methodology — don't assume reflection helps without verifying it.
- Test bounded reflection termination, verifying the loop respects its configured maximum iteration count.
- Test critique specificity — verify critique output identifies concrete, actionable issues rather than vague statements.
- Test external verification independently from LLM-based critique, confirming it correctly reflects genuine ground truth.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the full generate-critique-revise trace first** (every iteration's output and critique), directly analogous to **Agent Fundamentals**' own trajectory-tracing guidance.
2. **Check critique specificity** if reflection isn't producing meaningful improvement across iterations.
3. **Check whether external verification is available and being used** if a reflection loop relies purely on (potentially unreliable) self-critique for an objectively checkable claim.
4. **Check reflection bounds** if a task's cost/latency is higher than expected.

### Debugging common reflection-related symptoms

- "Reflection doesn't seem to improve output quality" — check critique specificity; vague critique criteria often produce unproductive revision cycles.
- "The agent confidently missed an error across every reflection iteration" — this is a signature of self-critique's genuine limits; consider external verification or a separate, external critic.
- "Reflection cost/latency is higher than expected" — check max_iterations configuration and whether reflection depth is genuinely calibrated to the task's quality bar.
- "The same mistake recurs across separate, similar tasks" — check whether Reflexion-style persisted reflection (Agent Memory) is being used for this recurring task category.
`,

  monitoring: `
### Key signals to track

- **Reflection iteration count distribution**, watching for tasks frequently reaching the bounded maximum without success.
- **Quality improvement across iterations**, directly connecting to the **Evaluation** skill's own measurement methodology — verifying reflection genuinely helps, not merely adding cost.
- **External verification pass rates**, for tasks using concrete, checkable ground truth.
- **Recurring-error patterns across separate task instances**, a signal that Reflexion-style persisted reflection could provide genuine value.

### Tools

General LLM observability tools for tracing the full generate-critique-revise sequence; the **Evaluation** skill's own rigorous measurement methodology applied specifically before-and-after reflection.

### Alerting priorities

Alert on a significant increase in tasks reaching the maximum reflection iteration count without success (a signal of either genuinely difficult tasks or miscalibrated critique criteria), and on reflection's measured quality improvement dropping toward zero (a signal it may no longer be worth its cost).
`,

  deployment: `
### A representative deployment configuration

~~~python
def build_reflection_pipeline(task_type, max_iterations=3):
    if has_objective_verification(task_type):
        return VerifiedReflectionPipeline(max_iterations=max_iterations)
    return CritiqueBasedReflectionPipeline(max_iterations=max_iterations)
~~~

### CI/CD pipeline considerations

Treat critique criteria, reflection bounds, and the choice between self-critique/external-critique/external-verification as genuine, version-controlled application configuration, with automated evaluation (directly connecting to the **Evaluation** skill) confirming reflection's measured quality benefit as a deployment gate. See the **CI/CD** skill and the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production reflection system takes real traffic:

- [ ] Reflection iterations explicitly bounded (max_iterations), calibrated to the task's genuine quality bar
- [ ] External verification used instead of pure LLM-based critique wherever an objective ground truth exists
- [ ] Critique criteria explicit and specific, not vague quality judgments
- [ ] Self-critique's genuine limits recognized — external critic used for error-prone dimensions
- [ ] Action-level guardrails applied to every revised attempt, not only the original
- [ ] Reflection's measured quality improvement verified empirically, not assumed
- [ ] Reflexion-style persisted reflection considered for recurring task categories
`,

  "common-mistakes": `
1. **Vague, unhelpful critique criteria**, producing unproductive revision cycles.
2. **Relying purely on self-critique for factually-checkable claims**, missing genuine errors the model doesn't recognize as errors.
3. **Unbounded reflection loops**, risking unproductive, expensive, never-converging cycles.
4. **Assuming reflection eliminates (rather than merely mitigates) compounding-error risk.**
5. **Applying maximal reflection depth uniformly**, regardless of genuine quality bar or cost.
6. **Never persisting genuinely valuable lessons (Reflexion-style)** across recurring task categories.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Reflection produces no measurable quality improvement | Vague, non-specific critique criteria | Design explicit, task-specific evaluation criteria |
| Model confidently repeats the same error across iterations | Self-critique's genuine limit — the model doesn't recognize the error | Use external verification or a separate, external critic |
| Reflection cost/latency higher than expected | max_iterations not calibrated to genuine quality needs | Reduce reflection depth or reserve it for genuinely quality-critical tasks |
| Same mistake recurs across separate, similar tasks | No persisted reflection across task instances | Implement Reflexion-style persisted reflection via Agent Memory |
| Reflection loop never terminates | Missing bounded max_iterations | Apply Agent Fundamentals'/Planning's loop-safety guidance |
| A revised output introduces a new error while fixing another | Insufficient re-verification after revision | Re-run external verification/critique after every revision, not just the first attempt |
`,

  faqs: `
**What is reflection, in the context of AI agents?**
The technique of having an agent explicitly critique its own (or another's) prior output, and use that critique to generate an improved revision.

**How does reflection relate to Planning's plan-revision concept?**
Reflection directly generalizes plan-revision from "revise a plan based on new execution information" to "revise ANY generated output based on an explicit critique of it."

**What is the difference between self-critique and external critique?**
Self-critique has the same model evaluate its own output; external critique uses a genuinely separate model/agent, which can catch issues self-critique might overlook.

**Why does self-critique have genuine limits?**
Because a model's self-critique is bounded by the same knowledge/capability limits as its original generation — it can't reliably flag an error it doesn't recognize as an error.

**What is Reflexion?**
A pattern that persists lessons learned from a failed task attempt (as an episodic memory) to inform genuinely separate, later attempts at similar tasks.

**When should I use external verification instead of LLM-based critique?**
Whenever an objective, checkable ground truth exists (test execution, a calculation, a retrieved fact) — external verification is considerably more reliable than LLM-based critique alone.
`,

  "interview-questions": `
### Junior level

1. **What is reflection, in the context of AI agents?**
   Model answer: having an agent critique its own (or another's) prior output and use that critique to produce an improved revision.

2. **What is the generate-critique-revise cycle?**
   Model answer: generate an initial output, critique it against explicit criteria, revise based on that specific feedback, repeating until satisfactory or bounded.

3. **What is the difference between self-critique and external critique?**
   Model answer: self-critique uses the same model evaluating its own output; external critique uses a genuinely separate model/agent.

4. **What is Reflexion?**
   Model answer: a pattern persisting lessons from a failed task attempt to inform separate, later attempts at similar tasks.

### Senior level

5. **Explain precisely why self-critique has a fundamental limit, using a concrete example, and explain what mitigates this limit.**
   Model answer: a model's self-critique step uses the SAME underlying knowledge and reasoning capability as its original generation step — if the model genuinely doesn't know a specific fact is incorrect (as opposed to simply having been careless in stating it), asking it to "double-check for errors" doesn't give it any NEW information or capability it didn't have during the original generation, so it has no more basis for recognizing that specific error during critique than it did during generation; for example, if a model incorrectly believes a historical event occurred in a certain year (a genuine gap in its trained knowledge, not a careless slip), asking it to critique its own claim about that year is very unlikely to surface the error, since the model's critique is drawing on the exact same (incorrect) belief; this is directly mitigated by EXTERNAL VERIFICATION — actually checking the claim against real, external ground truth (a retrieved, authoritative source, directly connecting to the **Hallucination** skill's own RAG-based mitigation) — which doesn't depend on the model's own knowledge being correct at all, since it's checking against something genuinely external to the model.

6. **A team's code-generation agent uses only self-critique (no test execution) to validate its own generated code, and occasionally ships code with a subtle logic bug the model consistently fails to catch across multiple reflection iterations. Diagnose this and propose a fix.**
   Model answer: this is a direct, concrete instance of self-critique's fundamental limit covered in this page's own advanced-concepts section — if the model's underlying reasoning has a genuine blind spot regarding this specific type of logic bug (it doesn't recognize the pattern as buggy in the first place), asking it to critique its OWN code repeatedly won't surface this bug, since each critique iteration draws on the same underlying reasoning capability that produced the original, flawed code; the fix is to introduce EXTERNAL VERIFICATION — actually EXECUTING the generated code against a genuine test suite (directly connecting to the **AutoGen** skill's own code-execution-as-verification pattern), providing concrete, ground-truth feedback ("test case 3 failed, expected X but got Y") that doesn't depend on the model's own self-assessment at all; this concrete failure signal can then inform a subsequent, MORE TARGETED critique/revision step (now grounded in a specific, objectively-verified failure rather than the model's own potentially-blind self-assessment), directly implementing the combined verification-plus-critique pattern covered in this page's own internal-working trace.

7. **Explain the tradeoff of reflection depth (max_iterations), and design an appropriate reflection configuration for a customer-facing chatbot response versus a critical financial calculation.**
   Model answer: each additional reflection iteration directly adds cost (at minimum, an additional model call for critique, often another for revision), with quality improvements generally showing DIMINISHING RETURNS as iterations accumulate — a genuine cost-quality tradeoff that should be calibrated to the task's actual stakes rather than applying a single, uniform reflection depth everywhere; for a customer-facing CHATBOT RESPONSE (a relatively low-stakes, easily-corrected-if-wrong, high-VOLUME use case where added latency directly affects user experience), I'd configure a SHALLOW reflection depth (perhaps max_iterations=1, or even skip reflection entirely for routine responses, reserving it for responses flagged as potentially sensitive or complex) — the cost/latency of deep reflection isn't justified by this task's relatively low individual stakes, especially at high volume; for a CRITICAL FINANCIAL CALCULATION (genuinely high-stakes, where an error could have serious real-world consequences, and where the task is likely lower-volume than routine chat responses), I'd configure a DEEPER reflection depth (a higher max_iterations) AND, critically, use EXTERNAL VERIFICATION (actually re-computing the calculation via a trusted, deterministic method) rather than relying on LLM-based critique alone — the higher stakes here clearly justify both additional reflection depth and the more reliable external-verification approach, directly reflecting this page's own guidance to calibrate reflection design to a task's genuine quality bar and error-detectability characteristics.

8. **A team implements Reflexion-style persisted reflection for a customer-support agent handling recurring ticket categories, but notices the agent sometimes over-generalizes from a single unusual past failure, becoming overly cautious on a whole category of otherwise-routine requests. Diagnose this and propose a fix.**
   Model answer: this is directly analogous to the OVER-GENERALIZATION risk covered in the **Agent Memory** skill's own memory-consolidation treatment — a single episodic memory (one unusual, perhaps atypical past failure) is being treated with the SAME weight/confidence as a well-established, RECURRING pattern would warrant, when in fact a single data point provides considerably weaker evidence for a general rule than multiple independent, confirming instances would; the fix is to design the Reflexion persistence mechanism to explicitly track HOW MANY times a given lesson/pattern has been observed/confirmed before treating it as a strong, generally-applicable rule — a lesson observed only once should inform future attempts with appropriately LOWER confidence/influence than one confirmed across several genuinely independent past instances, directly connecting to this page's own reflection-versus-elimination-of-error-risk distinction (a single reflection is a useful signal, but not necessarily a definitive, generally-applicable rule) — this might concretely mean requiring a lesson to recur across at least N separate instances before it meaningfully influences the agent's default behavior for an entire request category, rather than letting any single stored reflection (however unusual or non-representative) disproportionately shape future behavior.

9. **Compare using a dedicated "reviewer" agent role (as in CrewAI's or AutoGen's multi-agent patterns) against having a single agent perform self-critique on its own output, for a multi-stage content-production pipeline.**
   Model answer: a DEDICATED reviewer agent role (directly connecting to **CrewAI**'s own role-differentiation guidance and **AutoGen**'s own reviewer-agent patterns) is functionally a form of EXTERNAL critique — even though it may be powered by the same underlying model, giving it a genuinely DISTINCT role, persona, and explicit instructions to actively look for problems (rather than assume correctness) can produce a meaningfully different critique than having the ORIGINAL generating agent simply re-examine its own work under the same framing/context that produced it in the first place; this "distinct role" framing helps mitigate (though doesn't fully eliminate) self-critique's fundamental limit, since a reviewer explicitly instructed to be skeptical and look for specific categories of problems approaches the task with a genuinely different orientation than the generating agent's own default "produce a good result" framing; for a multi-stage content-production pipeline specifically (research, writing, editing, directly connecting to the **CrewAI** skill's own worked example), a dedicated EDITOR/REVIEWER agent role is generally preferable to having the WRITER agent simply self-critique its own draft, precisely because the editor role can be explicitly configured (via its own distinct role/goal/backstory, per **CrewAI**'s own guidance) to prioritize skeptical, detail-oriented scrutiny in a way that's harder to reliably achieve by asking the SAME agent that just finished writing enthusiastically to "now find problems with what you just wrote."

10. **Design a reflection-based system for validating a generated data-analysis report, combining external verification and critique, and explain why relying on critique alone would be insufficient here.**
    Model answer: I'd design a TWO-LAYERED validation approach: first, EXTERNAL VERIFICATION of every objectively-checkable claim in the report — any specific number, statistic, or calculation cited should be independently RE-COMPUTED from the underlying data (directly connecting to this page's own external-verification guidance and the **Hallucination** skill's own grounding-check treatment), rather than merely asking the generating model to "double check its numbers," since a model that made an arithmetic or data-interpretation error in the first place has no inherent guarantee of catching that SAME error on a self-critique pass; second, for the report's more SUBJECTIVE dimensions (is the analysis's narrative interpretation reasonable, is the report's structure clear and well-organized, are the conclusions appropriately hedged given the data's actual limitations) — dimensions with no objective, externally-checkable ground truth — I'd use a dedicated, EXTERNAL critic (a separate reviewer role or model call, explicitly instructed to skeptically evaluate the report's reasoning and framing) rather than relying on the generating model's own self-assessment; relying on CRITIQUE ALONE (even external critique) would be insufficient specifically for the OBJECTIVELY-CHECKABLE numerical claims, because critique — even from a genuinely separate reviewer — is still fundamentally an LLM-based JUDGMENT about whether a number seems plausible, rather than an actual, independent RE-COMPUTATION verifying the number is correct; only external verification (actually recomputing the figure from the source data) provides a genuine, ground-truth guarantee for these specific, objectively-checkable claims, which is precisely why this page's own best practices distinguish "prefer external verification whenever an objective ground truth exists" from the more general "use external critique for genuinely subjective dimensions."
`,

  "coding-questions": `
### 1. Implement a bounded generate-critique-revise cycle

~~~python
def generate_with_reflection(task, criteria, model, max_iterations=3):
    output = model.generate(task)
    for _ in range(max_iterations):
        critique = model.generate(
            f"Evaluate this output against these specific criteria: {criteria}\\n"
            f"Output: {output}\\nList concrete issues, or state 'satisfactory'."
        )
        if "satisfactory" in critique.lower():
            return output
        output = model.generate(f"Revise this output to address: {critique}\\nOriginal: {output}")
    return output
# Follow-up: why does providing explicit "criteria" (rather
# than a vague "is this good") directly matter for this
# function's actual effectiveness?
~~~

### 2. Implement external verification combined with critique for code generation

~~~python
def verified_reflection(task, generator, test_runner, critic, max_iterations=3):
    code = generator.generate(task)
    for _ in range(max_iterations):
        test_results = test_runner.run(code)
        if test_results.all_passed:
            return code
        critique = critic.evaluate(code, test_results.failures)
        code = generator.revise(code, critique)
    return code
# Follow-up: why is passing test_results.failures (concrete,
# ground-truth information) to the critic step more effective
# than asking the critic to evaluate the code in isolation?
~~~

### 3. Implement Reflexion-style persisted reflection

~~~python
def reflexion_attempt(task, model, memory_store, task_category, max_attempts=3):
    prior_lessons = memory_store.retrieve_relevant(task_category)
    for attempt in range(max_attempts):
        output = model.generate(f"Prior lessons: {prior_lessons}\\nTask: {task}")
        if task_succeeded(output):
            return output
        lesson = model.generate(f"This attempt failed: {output}. What specific lesson should inform future attempts?")
        memory_store.store(task_category, lesson)
        prior_lessons.append(lesson)
    return output
# Follow-up: how would you modify this to avoid over-weighting
# a single, possibly-atypical past failure, per this page's
# own over-generalization caution?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement a basic generate-critique-revise cycle
Build a bounded reflection loop for a writing task, with explicit, specific critique criteria, verifying measurable quality improvement across iterations. Deliverable: a working, tested reflection cycle. Skills exercised: basic generate-critique-revise implementation.

### Lab 2 (Intermediate): Combine external verification with critique for a code-generation task
Build a reflection loop for code generation, using actual test execution as external verification, combined with a critique step interpreting failures. Deliverable: a working, tested verified-reflection system. Skills exercised: applied external verification and critique combination.

### Lab 3 (Advanced): Implement Reflexion-style persisted reflection
Build a system persisting lessons from failed task attempts, informing genuinely separate, later attempts at similar tasks, with appropriate confidence weighting to avoid over-generalization. Deliverable: a working, tested persisted-reflection system with a documented before/after comparison. Skills exercised: applied Reflexion-style memory-informed reflection.

### Lab 4 (Production): Design and validate a reflection depth/cost calibration
Build a system with configurable reflection depth, empirically measuring the quality-versus-cost tradeoff across different max_iterations settings for a representative task. Deliverable: a documented cost-quality analysis informing a recommended production configuration. Skills exercised: applied reflection-depth calibration.
`,

  "real-projects": `
### 1. A code-generation assistant with verified reflection
Engineering requirements: test-execution-based external verification, a critique step interpreting concrete test failures, and bounded revision cycles.

### 2. A content-review pipeline with a dedicated reviewer role
Engineering requirements: a genuinely distinct reviewer/editor agent (directly connecting to CrewAI's role-differentiation guidance), explicit critique criteria, and bounded revision cycles.

### 3. A customer-support agent with Reflexion-style learning
Engineering requirements: persisted episodic lessons from past failed interactions, appropriate confidence weighting to avoid over-generalization, and retrieval-informed generation for recurring ticket categories.
`,

  "case-studies": `
### Self-Refine and Reflexion establishing reflection as a genuinely useful, training-free technique
The demonstration that self-critique and iterative revision measurably improve output quality WITHOUT requiring any additional model training directly established reflection as a broadly-applicable, low-barrier-to-adoption technique across the agent-framework ecosystem. Lesson: not every capability improvement requires expensive additional training — deliberately structuring HOW an existing model is prompted and iterated on (rather than retraining it) can unlock genuine, measurable quality gains at comparatively low cost.

### The field's maturing recognition of self-critique's genuine limits
Following reflection's initial, exciting demonstration of self-critique's value, subsequent research and practical experience revealed self-critique's genuine, fundamental boundary — a model cannot reliably catch an error it doesn't recognize as an error — directly motivating the field's growing emphasis on external verification and external critique as complementary, more reliable techniques for genuinely checkable claims. Lesson: an initially exciting technique's limits often become clearer only through sustained, honest practical experience and research scrutiny — a mature understanding of reflection requires knowing not just WHAT it improves, but precisely WHERE its reliability genuinely breaks down.
`,

  comparisons: `
| Aspect | Self-Critique | External Critique | External Verification |
|--------|----------------------|---------------------------|-------------------------------|
| Mechanism | Same model evaluates its own output | A genuinely separate model/agent evaluates | Actually checking against real ground truth |
| Reliability for unrecognized errors | Low — bounded by same knowledge gap | Moderate — a fresh perspective may help | High — doesn't depend on any model's knowledge |
| Best fit | Subjective quality dimensions, low stakes | Subjective dimensions needing a fresh perspective | Objectively checkable claims (tests, calculations, facts) |

| Aspect | Single-Attempt Reflection | Reflexion (Persisted) |
|--------|----------------------------------|--------------------------------|
| Scope | Within one ongoing task attempt | Across genuinely separate task attempts |
| Mechanism | Generate-critique-revise cycle | Episodic memory of past lessons informing future attempts |
| Best fit | Improving a single output | Recurring task categories benefiting from accumulated experience |

**How seniors choose**: use external verification whenever an objective ground truth exists; use external critique (a genuinely distinct reviewer role) for subjective dimensions or error types the generating model might not reliably self-recognize; reserve pure self-critique for lower-stakes, more easily-detected error types; use Reflexion-style persisted reflection for recurring task categories where lessons genuinely transfer.
`,

  "related-technologies": `
- **Planning** — the plan-revision concept this page directly generalizes into a broader self-improvement loop.
- **Agent Fundamentals** — the compounding-error concept reflection mitigates, and the loop-safety guidance every reflection loop must apply.
- **Agent Memory** — the episodic-memory concept underlying Reflexion's persisted-lesson pattern.
- **Evaluation** — the measurement-methodology principles underlying good, specific critique criteria.
- **Hallucination**, **AutoGen** — the grounding/verification and code-execution-as-verification patterns directly complementing pure LLM-based critique.

Learning path: **Agent Fundamentals** → the framework skills → **Agent Memory** → **Planning** → this page (Reflection) → **Tool Calling** → **MCP**.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued research refinement of exactly when self-critique is reliable versus when external verification/critique is genuinely necessary.
- Continued adoption of reflection as a standard, widely-implemented pattern across major agent frameworks (LangGraph cycles, CrewAI/AutoGen reviewer roles).
- Growing practical emphasis on combining external verification with critique, rather than relying on either alone, for genuinely high-stakes generation tasks.
- Given continued, active research in this space, verify current best-practice recommendations against up-to-date research publications and framework documentation.
`,

  "future-roadmap": `
Where reflection techniques are heading, and what's worth betting career time on:

- **Continued refinement of hybrid verification-plus-critique architectures**, combining external, ground-truth checking with LLM-based interpretive critique.
- **Continued research into more reliable self-critique mechanisms**, though the field's honest recognition of self-critique's fundamental limits is likely to persist as a durable insight.
- **Continued growth of Reflexion-style persisted learning** for recurring, high-volume task categories where accumulated experience genuinely transfers.
- **What to bet on**: deeply understanding WHEN self-critique is reliable versus when external verification/critique is genuinely necessary — this judgment transfers directly across any specific reflection implementation and is durable even as underlying model capabilities improve.
`,

  "cheat-sheet": `
~~~
# ---- Generate-Critique-Revise cycle ----
output = generate(task)
for i in range(max_iterations):   # ALWAYS bound this
    critique = evaluate(output, EXPLICIT criteria)  # not vague!
    if satisfactory: return output
    output = revise(output, critique)
~~~

~~~
# ---- Self-critique vs. external critique vs. external verification ----
Self-critique:        same model, same blind spots -- limited reliability
External critique:    separate model/agent/persona -- catches more
External verification: check against REAL ground truth (tests, facts)
                        -- most reliable for objectively-checkable claims
~~~

~~~
# ---- Choose by error type ----
Objectively checkable (tests, math, retrieved facts)
    -> ALWAYS prefer external verification
Subjective (tone, clarity, structure)
    -> external critique > self-critique
~~~

~~~
# ---- Reflexion: persisted reflection across tasks ----
Store a lesson from a FAILED attempt as episodic memory
    (Agent Memory) -> retrieve it to inform a SEPARATE,
    later attempt at a similar task.
Don't over-weight a SINGLE past failure as a general rule!
~~~

~~~
# ---- Non-negotiables ----
Reflection MITIGATES, doesn't ELIMINATE compounding-error risk
Calibrate depth (max_iterations) to genuine quality bar --
    diminishing returns + real cost per iteration
Guardrails apply to every REVISED attempt too, not just the first
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is reflection? | Critiquing an agent's own (or another's) prior output and revising based on that critique. |
| What is the generate-critique-revise cycle? | Generate, critique against explicit criteria, revise, repeat until satisfactory or bounded. |
| Why does self-critique have a fundamental limit? | It's bounded by the same knowledge/reasoning that produced the original (possibly flawed) output. |
| What mitigates self-critique's limit? | External verification (checking real ground truth) or a genuinely separate external critic. |
| What is Reflexion? | Persisting lessons from a failed attempt (episodic memory) to inform separate, later attempts. |
| When should you prefer external verification over critique? | Whenever an objective, checkable ground truth exists (tests, math, facts). |
| Why must reflection loops be bounded? | Prevents unproductive, expensive, never-converging revision cycles. |
| Does reflection eliminate compounding-error risk? | No — it mitigates it, but can miss errors or even introduce new ones. |
| Reflection depth tradeoff? | More iterations improve quality with diminishing returns, while adding real cost. |
| Reflexion over-generalization risk? | Weighting a single atypical failure as a general rule — require multiple confirmations. |
`,

  mcqs: `
1. What is the generate-critique-revise cycle?
   A) A type of vector index  B) Generate an output, critique it against explicit criteria, revise based on that feedback, repeating until satisfactory or bounded  C) A database transaction pattern  D) A tool-calling mechanism
   **Answer: B** — the foundational reflection pattern.

2. Why does self-critique have a fundamental, well-documented limit?
   A) It's always perfectly reliable  B) It's bounded by the same underlying knowledge/reasoning as the original generation — a model can't reliably flag an error it doesn't recognize as one  C) Self-critique requires no additional compute  D) This limit doesn't exist
   **Answer: B** — directly connecting to the Hallucination skill's confidently-wrong-output treatment.

3. When should external verification be preferred over LLM-based critique?
   A) Never  B) Whenever an objective, externally-checkable ground truth exists (tests, calculations, retrieved facts)  C) Only for creative writing tasks  D) Verification is always less reliable than critique
   **Answer: B** — it doesn't depend on any model's own knowledge being correct.

4. What is Reflexion's key innovation over a single-task reflection cycle?
   A) It requires no memory  B) It persists lessons learned from a failed attempt to inform genuinely separate, later attempts at similar tasks  C) It only works within one conversation  D) It replaces the need for critique entirely
   **Answer: B** — directly connecting to the Agent Memory skill's episodic-memory concept.

5. Why must reflection loops always have a bounded maximum iteration count?
   A) It's optional  B) An unbounded loop risks unproductive, expensive, never-converging revision cycles, directly reusing Agent Fundamentals' loop-safety guidance  C) Bounding only affects logging  D) Reflection loops never fail to converge
   **Answer: B** — a non-negotiable safety practice.
`,

  "revision-notes": `
Reflection is the technique of having an agent explicitly critique its own (or another's) prior output and use that critique to generate an improved revision, directly generalizing the platform's own **Planning** skill's plan-revision concept from "revise a plan based on new execution information" into a broader self-improvement mechanism applicable to any generated output. The foundational pattern is the GENERATE-CRITIQUE-REVISE CYCLE: generate an initial output, critique it against EXPLICIT, SPECIFIC criteria (vague "is this good" prompts produce unproductive, unhelpful critique, directly connecting to **Prompt Engineering**'s own clarity guidance), and revise based on that specific feedback, repeating until satisfactory or a BOUNDED iteration limit is reached (directly reusing **Agent Fundamentals**' and **Planning**'s loop-safety guidance).

A critical, frequently-tested distinction is SELF-CRITIQUE versus EXTERNAL CRITIQUE versus EXTERNAL VERIFICATION: self-critique (the same model evaluating its own output) has a FUNDAMENTAL, well-documented limit — it's bounded by the SAME underlying knowledge/reasoning that produced the original output, so a model that genuinely doesn't recognize a specific error as an error during generation is unlikely to reliably catch that SAME error during self-critique, directly connecting to the **Hallucination** skill's own confidently-wrong-output treatment; EXTERNAL CRITIQUE (a genuinely separate model/agent/persona, directly connecting to **CrewAI**'s and **AutoGen**'s own reviewer-agent role patterns) can catch issues self-critique might overlook, since it isn't anchored to the same reasoning that produced the flawed output; EXTERNAL VERIFICATION (actually checking a claim against real, external ground truth — running tests, recomputing a calculation, retrieving an authoritative source) is the MOST RELIABLE option for OBJECTIVELY CHECKABLE claims, since it doesn't depend on any model's own knowledge being correct at all — the senior practice is to ALWAYS prefer external verification when an objective ground truth exists, reserving external (or, more cautiously, self-) critique for genuinely subjective quality dimensions.

REFLEXION extends single-task reflection by PERSISTING lessons learned from a FAILED attempt (as an episodic memory, directly connecting to the **Agent Memory** skill's own episodic-memory concept) to inform GENUINELY SEPARATE, later attempts at similar tasks — letting an agent's performance improve across multiple, distinct task instances over time, not merely within one ongoing generate-critique-revise cycle. A genuinely important, frequently-tested caution: over-weighting a SINGLE, possibly-atypical past failure as a general rule risks OVER-GENERALIZATION (directly analogous to the **Agent Memory** skill's own memory-consolidation over-generalization risk) — a lesson should require confirmation across MULTIPLE genuinely independent past instances before strongly influencing an agent's default future behavior.

A critical architectural principle: reflection MITIGATES, but does NOT ELIMINATE, **Agent Fundamentals**' own compounding-error risk — a reflection step itself can fail to catch an error (particularly one the model doesn't recognize), and can even, in principle, introduce a NEW error while addressing a correctly-identified one, motivating re-verification after every revision, not just the original attempt.

Reflection DEPTH (max_iterations) involves a genuine cost-quality tradeoff — additional iterations generally improve output quality with DIMINISHING RETURNS while directly adding cost (each iteration requiring at least one additional model call, connecting to the **Inference** skill's own per-call cost treatment) — a senior engineer calibrates reflection depth to a task's genuine quality bar (shallow for low-stakes, high-volume tasks; deeper, combined with external verification, for genuinely high-stakes ones) rather than applying a single, uniform depth universally.

A frequently-tested security detail directly extends **Agent Fundamentals**' and **Guardrails**' action-level guidance: action-level guardrails must apply to EVERY revised attempt within a reflection loop, not only the original — a revised action isn't implicitly safe merely because it followed a "correction."

A senior AI engineer designs explicit, specific critique criteria, prefers external verification whenever an objective ground truth exists, recognizes self-critique's genuine limits and uses external critique for error-prone dimensions, bounds reflection depth appropriately, and considers Reflexion-style persisted reflection (with appropriate confidence weighting) for recurring task categories — this foundational understanding directly sets up the platform's remaining capability-focused skills: **Tool Calling** and **MCP**.
`,

  "learning-roadmap": `
**Week 1 — Generate-critique-revise fundamentals**: building a bounded reflection loop with explicit critique criteria for a writing task. Milestone: complete Lab 1, with verified measurable quality improvement.

**Week 2 — External verification**: building a verified-reflection system for code generation, combining test execution with critique. Milestone: complete Lab 2, with a working, tested verified-reflection pipeline.

**Week 3 — Reflexion**: building a persisted-reflection system informing separate, later task attempts. Milestone: complete Lab 3, with a documented before/after comparison and appropriate confidence weighting.

**Week 4 — Depth calibration**: empirically measuring reflection's quality-versus-cost tradeoff across different depth settings. Milestone: complete Lab 4, with a documented, evidence-based production configuration recommendation.

Next platform skill once this roadmap is complete: **Tool Calling**, covering the function-calling mechanics underlying every agent's interaction with the external world.
`,

  "official-docs": `
- **LangGraph's official documentation** on implementing cyclic, reflection-based agent patterns.
- **CrewAI's and AutoGen's official documentation** on reviewer/critic agent role patterns.
`,

  books: `
- **"Designing Machine Learning Systems" — Chip Huyen** — relevant general background on model evaluation and iterative improvement processes applicable to reflection design.
- Given the LLM-agent-specific reflection framing's relative recency, current research papers remain the most authoritative, up-to-date references.
`,

  blogs: `
- **Research-lab blogs discussing self-critique and reflection techniques** and their measured effectiveness across various tasks.
- **Framework-specific writing on implementing reflection loops** (LangGraph, CrewAI, AutoGen) widely available across AI engineering educational content providers.
`,

  "research-papers": `
- **Madaan, A. et al. — "Self-Refine: Iterative Refinement with Self-Feedback"** — the foundational self-critique-and-revision paper.
- **Shinn, N. et al. — "Reflexion: Language Agents with Verbal Reinforcement Learning"** — the foundational persisted-reflection-across-attempts paper.
- Ongoing research into the reliability limits of self-critique versus external verification continues to actively develop.
`,

  videos: `
- **Conference talks on Self-Refine, Reflexion, and related reflection techniques** from major AI research labs.
- **Tutorials on implementing reflection loops** across LangGraph, CrewAI, and AutoGen, widely available across AI engineering educational content providers.
`,

  "github-repos": `
- **noahshinn/reflexion** — the official Reflexion research implementation.
- **langchain-ai/langgraph** — includes reference implementations of cyclic, reflection-based agent patterns.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Critique-criteria design**: given a described generation task, design explicit, specific evaluation criteria rather than vague quality judgments.
2. **Verification-versus-critique selection**: given a described claim/output, decide whether external verification, external critique, or self-critique is most appropriate.
3. **Reflection-depth calibration**: given a described task's genuine stakes, decide an appropriate max_iterations configuration.
4. **Over-generalization diagnosis**: given a described Reflexion system exhibiting over-cautious behavior, diagnose the likely cause and propose a fix.
5. **External practice sets**: Self-Refine's and Reflexion's own published experiments for hands-on-analogous practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Cycle["Generate-Critique-Revise Cycle"]
        Generate["Generate"]
        Critique["Critique (explicit criteria)"]
        Revise["Revise"]
    end
    subgraph CritiqueTypes["Critique/Verification Types"]
        SelfCritique["Self-Critique (limited)"]
        ExternalCritique["External Critique (separate agent)"]
        ExternalVerification["External Verification (ground truth)"]
    end
    subgraph Persistence["Reflexion (Persisted)"]
        EpisodicLesson["Episodic Lesson Storage"]
        FutureAttempt["Informs Separate Future Attempts"]
    end
    subgraph Safety["Safety"]
        BoundedIter["Bounded max_iterations"]
        Guardrails["Guardrails on Every Revision"]
    end
    Generate --> Critique --> Revise --> Generate
    Critique --> CritiqueTypes
    Cycle --> Persistence
    Cycle --> Safety
~~~
`,

  "mind-map": `
~~~mindmap
  root((Reflection))
    Foundations
      Overview
      History Self Refine Reflexion
      Why it exists
      Problem it solves
    Generate Critique Revise
      Explicit criteria
      Bounded iterations
    Critique Types
      Self critique limits
      External critique
      External verification
    Reflexion
      Persisted episodic lessons
      Informs future attempts
      Over generalization risk
    Compounding Error
      Mitigates not eliminates
      Guardrails on revisions
    Cost Tradeoff
      Diminishing returns
      Depth calibration
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default reflection;
