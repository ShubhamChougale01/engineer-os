import type { SkillContent } from "../types";

const planning: SkillContent = {
  overview: `
Planning is the family of techniques an agent uses to DECOMPOSE a complex, multi-step goal into a sequence of concrete, manageable sub-tasks before (or while) executing them — directly extending the "plan" step of **Agent Fundamentals**' plan-act-observe loop from a single, per-iteration decision into a deliberate, often MULTI-STEP reasoning process in its own right. Where a simple agent loop plans one step at a time reactively (deciding only the immediate next action), genuinely complex tasks — booking a multi-leg trip, refactoring a large codebase, conducting comprehensive research — often benefit from an agent explicitly generating a more complete, upfront plan, and then executing (and potentially revising) that plan over time.

This skill covers the core planning strategies an agent can use: **task decomposition** (breaking a complex goal into an explicit sequence or hierarchy of sub-tasks), **the reactive-versus-upfront-planning tradeoff** (directly extending the distinction introduced in **Agent Fundamentals**), specific decomposition techniques like **chain-of-thought-style sequential planning** and **tree-of-thought-style exploratory planning** (considering and comparing multiple candidate plans/paths before committing), and **plan revision** (adapting an existing plan based on new information encountered during execution, directly connecting to the platform's later **Reflection** skill).

Key characteristics: **task decomposition**, breaking a complex goal into concrete, actionable sub-tasks; **upfront versus reactive planning**, a genuine, deliberate tradeoff between predictability/reviewability and adaptability; **exploratory planning** (tree-of-thought and similar), considering multiple candidate plans before committing to one; **plan revision**, adapting a plan based on new information encountered mid-execution; and **hierarchical planning**, decomposing a plan across multiple levels of abstraction (a high-level plan further broken into detailed sub-plans).
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2022 | **Chain-of-thought prompting** (covered in the **Prompt Engineering** skill) demonstrates that explicitly generating intermediate reasoning steps significantly improves an LLM's performance on complex, multi-step problems — directly foreshadowing the value of explicit planning for agentic tasks |
| 2022 | **ReAct** (covered in **Agent Fundamentals**) interleaves reasoning (a form of lightweight, per-step planning) with concrete actions, establishing the foundational reactive-planning pattern most simple agent loops still use |
| 2023 | **Tree-of-Thought** prompting/reasoning is introduced, formalizing an EXPLORATORY planning approach — generating and comparing multiple candidate reasoning paths/plans before committing to one, rather than following a single, linear chain |
| 2023 | **Plan-and-execute** agent architectures gain prominence, explicitly separating an upfront PLANNING phase (generating a complete, multi-step plan before execution begins) from a subsequent EXECUTION phase, directly contrasting with ReAct's more purely reactive, step-by-step approach |
| 2024 | **LangGraph**'s cycle-supporting graph model (covered in its own skill) becomes a common implementation substrate for PLAN REVISION patterns — an agent's plan-execute-replan loop naturally maps onto a graph with a cycle back to a planning node |
| 2024–2025 | Continued research and practical refinement of hierarchical and hybrid planning approaches, combining upfront planning's predictability with reactive planning's adaptability for genuinely complex, long-horizon agentic tasks |

Planning's history directly reflects the broader agentic-AI field's progression from simple, per-step reactive reasoning (ReAct) toward increasingly deliberate, structured, and even EXPLORATORY planning strategies as the genuine complexity of real-world, long-horizon agentic tasks became clearer through practical experience.
`,

  "why-it-exists": `
Planning exists because purely REACTIVE, step-by-step decision-making (deciding only the immediate next action, as in a simple ReAct-style agent loop covered in **Agent Fundamentals**) can be genuinely insufficient for complex, multi-step tasks where the OPTIMAL sequence of steps benefits from being considered more HOLISTICALLY upfront — a task requiring five interdependent steps may produce a meaningfully better outcome if the agent reasons about the entire sequence's structure and dependencies before committing to the first action, rather than making each decision in isolation based only on the immediately preceding observation.

Planning techniques solve this by giving an agent explicit mechanisms to DECOMPOSE a complex goal into a structured sequence (or hierarchy) of sub-tasks, optionally EXPLORE and compare multiple candidate plans before committing, and REVISE an existing plan as new information is encountered during execution — directly extending **Agent Fundamentals**' single, per-iteration "plan" step into a more deliberate, sometimes multi-step reasoning process genuinely proportional to a task's actual complexity.
`,

  "problem-it-solves": `
Planning addresses the **"how does an agent decompose a complex, multi-step goal into a coherent, well-sequenced set of actions, rather than making potentially short-sighted, purely reactive step-by-step decisions"** challenge.

Concretely, planning techniques provide:

- **Task decomposition**, breaking a complex goal into concrete, actionable, appropriately-ordered sub-tasks, directly extending **Agent Fundamentals**' planning concept.
- **The upfront-versus-reactive planning choice**, letting engineers deliberately trade off predictability/reviewability (upfront planning, more inspectable before execution begins) against flexibility/adaptability (reactive planning, better suited to genuinely unpredictable environments).
- **Exploratory planning** (tree-of-thought and similar), letting an agent consider and compare multiple candidate approaches before committing, directly connecting to the **Evaluation** skill's own comparative-assessment concepts.
- **Plan revision**, letting an agent adapt an existing plan based on new information encountered mid-execution, directly connecting to the platform's later **Reflection** skill and to **LangGraph**'s own cycle-supporting graph model.

What planning does **not** solve, or solves only partially: planning techniques don't eliminate the underlying reliability challenges covered throughout the LLMs category — a flawed or hallucinated PLAN can be just as confidently wrong as a flawed reactive decision, and an elaborate upfront plan built on an incorrect premise can compound this error across every subsequent step, directly connecting to **Agent Fundamentals**' own compounding-error treatment; and planning inherently trades some computational cost/latency (generating and potentially revising an explicit plan) for improved task-level coherence — not every task genuinely benefits from this additional planning overhead.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain task decomposition and construct a decomposed plan for a complex, multi-step goal.
2. Explain the tradeoff between upfront (plan-and-execute) and reactive (ReAct-style) planning.
3. Explain exploratory planning (tree-of-thought) and when comparing multiple candidate plans is worthwhile.
4. Implement a plan-execute-replan loop, directly connecting to LangGraph's cycle-supporting graph model.
5. Recognize planning anti-patterns: over-planning simple tasks, and never revising a plan despite new contradicting information.
6. Compare hierarchical planning against flat, single-level decomposition.
7. Answer senior-level interview questions on planning strategy selection and its tradeoffs.
`,

  prerequisites: `
- **Required**: **Agent Fundamentals** (the planning concept this page directly extends), **Prompt Engineering** (chain-of-thought, the foundational technique underlying sequential planning).
- **Very helpful**: **LangGraph** (its cycle-supporting graph model is a natural implementation substrate for plan-execute-replan patterns), **Agent Memory** (planning decisions often need to reference and update memory).

Dependency chain: **Agent Fundamentals** → the framework skills → **Agent Memory** → this page (Planning) → **Reflection** → **Tool Calling** → **MCP**.
`,

  "beginner-concepts": `
### A simple decomposed plan

~~~python
def generate_plan(goal, model):
    prompt = f"Break this goal into a numbered list of concrete, sequential sub-tasks: {goal}"
    return model.generate(prompt).split("\\n")

plan = generate_plan("Write a blog post comparing three cloud providers", model)
# ["1. Research provider A's pricing and features",
#  "2. Research provider B's pricing and features",
#  "3. Research provider C's pricing and features",
#  "4. Write a comparison outline",
#  "5. Write the full blog post"]
~~~

This directly extends **Agent Fundamentals**' planning concept — rather than the agent deciding only the SINGLE immediate next action, it generates a more complete, upfront breakdown of the entire task.

### Reactive versus upfront planning: a first comparison

~~~
Reactive (ReAct-style, per Agent Fundamentals): decide ONE
    action at a time, based on the current state -- flexible,
    but each decision is made with limited "lookahead."
Upfront (plan-and-execute): generate a MORE COMPLETE plan
    BEFORE executing any of it -- more holistic, but the
    plan may need revision if reality diverges from
    assumptions made during initial planning.
~~~

### Executing a plan sequentially

~~~python
def execute_plan(plan, agent):
    results = []
    for step in plan:
        result = agent.execute_step(step, context=results)
        results.append(result)
    return results
~~~

Each step's execution can use the RESULTS of prior steps as context, directly analogous to **CrewAI**'s own \`context\` parameter passing earlier task outputs to later tasks.
`,

  "intermediate-concepts": `
### Plan-and-execute with explicit replanning

~~~python
def plan_execute_replan(goal, model, agent, max_replans=3):
    plan = generate_plan(goal, model)
    results = []
    for _ in range(max_replans):
        for step in plan:
            result = agent.execute_step(step, context=results)
            results.append(result)
            if result.reveals_plan_is_invalid:
                plan = generate_plan(goal, model, prior_results=results)
                break  # restart execution with the revised plan
        else:
            return results  # completed without needing to replan
    return results
~~~

This directly implements a bounded (\`max_replans\`, reusing **Agent Fundamentals**' loop-safety guidance) plan-execute-replan cycle — genuinely well-suited to implementation as a **LangGraph** graph, with the replanning trigger forming an explicit conditional edge back to the planning node.

### Tree-of-thought: exploring multiple candidate plans

~~~python
def tree_of_thought_plan(goal, model, num_candidates=3, evaluator=None):
    candidates = [generate_plan(goal, model) for _ in range(num_candidates)]
    scored = [(plan, evaluator(plan)) for plan in candidates]
    return max(scored, key=lambda x: x[1])[0]  # select the
                                                   # highest-scoring
                                                   # candidate plan
~~~

Rather than committing to a single, linear plan (a "chain of thought"), tree-of-thought generates and COMPARES multiple candidate plans before selecting the best one — directly analogous to the **judge-panel** pattern (generating multiple independent attempts, scoring them, and selecting/synthesizing the best), at the cost of the additional compute required to generate and evaluate multiple candidates.

### Hierarchical planning: multiple levels of abstraction

~~~python
def hierarchical_plan(goal, model):
    high_level_plan = generate_plan(goal, model)  # e.g., ["Research", "Draft", "Review"]
    detailed_plan = {}
    for high_level_step in high_level_plan:
        detailed_plan[high_level_step] = generate_plan(high_level_step, model)
    return detailed_plan
~~~

A high-level plan is further decomposed into detailed sub-plans for each high-level step, directly analogous to how a human project manager might break a project into phases, and each phase into specific tasks — genuinely useful for tasks complex enough that a single, flat decomposition would be unwieldy.

### Connecting planning to memory

~~~
A planning step often needs to reference prior context --
directly connecting to the Agent Memory skill -- e.g.,
retrieving a user's stated preferences (long-term memory)
or the current conversation's recent history (short-term
memory) to inform a more contextually-appropriate plan.
~~~
`,

  "advanced-concepts": `
### The genuine cost-benefit tradeoff of exploratory planning

~~~
Tree-of-thought-style exploratory planning (generating and
comparing MULTIPLE candidate plans) genuinely improves
outcome quality for tasks where the "best" approach is
genuinely non-obvious and worth deliberating over -- but it
directly multiplies compute cost (N candidate plans instead
of one, plus evaluation overhead), directly connecting to
the Inference skill's own per-call cost treatment. A senior
engineer reserves this technique specifically for tasks
where the quality improvement genuinely justifies this cost,
rather than applying it universally.
~~~

### Why plan revision (not just execution) is essential for long-horizon tasks

~~~
An upfront plan is generated based on the AGENT'S CURRENT
UNDERSTANDING at planning time -- but genuinely long-horizon
tasks often reveal NEW information during execution that
the original plan didn't anticipate (a required resource
turns out to be unavailable, an intermediate result
contradicts an assumption the plan was built on) -- directly
connecting to the platform's later Reflection skill's own
self-critique treatment, a planning system that NEVER revises
its plan despite such new, contradicting information risks
continuing to execute an increasingly ill-suited plan.
~~~

### Planning and compounding hallucination risk

~~~
An upfront plan built on a HALLUCINATED premise (e.g., the
agent incorrectly believes a certain tool/resource exists,
or misjudges a task's actual requirements) can compound this
single error across EVERY subsequent planned step -- directly
extending Agent Fundamentals' own compounding-hallucination-
risk treatment specifically to the PLANNING phase itself,
motivating explicit verification of a plan's key assumptions
before committing significant execution effort to it.
~~~

### Hybrid planning: combining upfront structure with reactive adaptability

~~~
Many production systems adopt a HYBRID approach -- an upfront,
HIGH-LEVEL plan (providing overall structure and
predictability) combined with REACTIVE, per-step decision-
making WITHIN each high-level step's execution (providing
adaptability to unanticipated, step-level details) -- directly
combining the genuine strengths of both approaches rather
than committing exclusively to one or the other.
~~~
`,

  "internal-working": `
Tracing a plan-execute-replan cycle when execution reveals the original plan is flawed:

~~~mermaid
sequenceDiagram
    participant Agent
    participant Planner
    participant Executor
    participant Environment

    Agent->>Planner: generate_plan(goal)
    Planner->>Agent: initial plan (steps 1-4)
    Agent->>Executor: execute step 1
    Executor->>Environment: perform action
    Environment->>Executor: result (as expected)
    Agent->>Executor: execute step 2
    Executor->>Environment: perform action
    Environment->>Executor: result (CONTRADICTS an\nassumption the plan\nwas built on)
    Agent->>Agent: detect plan invalidity
    Agent->>Planner: generate_plan(goal,\nprior_results=[step1,\nstep2 results])
    Planner->>Agent: REVISED plan\n(reflecting new information)
    Agent->>Executor: execute revised step 3
~~~

1. **An initial plan is generated upfront**, based on the agent's understanding at planning time.
2. **Execution proceeds step by step**, with each step's actual result compared against the plan's underlying assumptions.
3. **When a step's result CONTRADICTS an assumption the plan was built on**, the agent detects this plan invalidity, directly analogous to a checkpoint-verification mechanism (**Agent Fundamentals**' own compounding-error mitigation).
4. **The plan is explicitly REVISED**, incorporating the new information from the results observed so far, and execution continues with the updated plan.

**Why this matters**: this trace demonstrates precisely why UPFRONT planning alone is insufficient for long-horizon tasks in genuinely unpredictable environments — the REVISION step is what prevents an agent from continuing to blindly execute an increasingly ill-suited plan once new, contradicting information emerges, directly connecting to **LangGraph**'s own cycle-supporting graph model as a natural implementation substrate for this exact pattern.
`,

  architecture: `
A senior AI engineer thinks about planning architecture in terms of deliberately choosing between reactive, upfront, and hybrid planning strategies matched to a task's genuine predictability and complexity, and designing explicit plan-revision triggers rather than assuming an initial plan remains valid throughout execution.

### Choosing a planning strategy

~~~mermaid
flowchart TB
    Task["A given complex task"] --> Q{"Is the environment/task\nstructure genuinely\npredictable upfront?"}
    Q -->|"Yes -- well-understood,\nstable structure"| Upfront["Upfront (plan-and-execute)\nplanning"]
    Q -->|"No -- genuinely\nunpredictable, needs\nstep-by-step adaptation"| Reactive["Reactive (ReAct-style)\nplanning"]
    Q -->|"Mixed -- structure known\nat a high level, details\nemerge during execution"| Hybrid["Hybrid: upfront high-level\nplan + reactive step execution"]
~~~

### Designing explicit plan-revision triggers

A senior practitioner defines explicit conditions under which a plan should be revised (a step's result contradicting a key assumption, an unexpected error, new information from long-term memory), rather than assuming an initial plan remains valid indefinitely.
`,

  "data-flow": `
Tracing a request through a hierarchical, hybrid planning system:

~~~mermaid
sequenceDiagram
    participant User
    participant HighLevelPlanner as High-Level Planner
    participant Phase as Phase Executor
    participant ReactiveAgent as Reactive Step Agent

    User->>HighLevelPlanner: "Write a comprehensive\nmarket analysis report"
    HighLevelPlanner->>HighLevelPlanner: decompose into phases:\nResearch, Analysis, Writing
    HighLevelPlanner->>Phase: execute "Research" phase
    Phase->>ReactiveAgent: handle specific research\nsteps reactively (per Agent\nFundamentals' ReAct loop)
    ReactiveAgent->>Phase: research findings
    Phase->>HighLevelPlanner: "Research" phase complete
    HighLevelPlanner->>Phase: execute "Analysis" phase\n(using research findings)
    Phase->>ReactiveAgent: handle analysis steps reactively
    ReactiveAgent->>Phase: analysis results
    Phase->>HighLevelPlanner: "Analysis" phase complete
    HighLevelPlanner->>User: (continues through\n"Writing" phase similarly)
~~~

The critical detail: the HIGH-LEVEL plan (Research, Analysis, Writing) provides overall structure and predictability, while EACH PHASE's actual execution proceeds REACTIVELY (a ReAct-style, per-step agent loop, directly reusing **Agent Fundamentals**), directly implementing the hybrid planning approach that combines upfront structure with reactive, step-level adaptability.
`,

  "production-usage": `
### A representative production plan-execute-replan implementation

~~~python
def run_planned_task(goal, model, agent, max_replans=3):
    plan = generate_plan(goal, model)
    results = []
    replans = 0
    i = 0
    while i < len(plan) and replans < max_replans:
        result = agent.execute_step(plan[i], context=results)
        results.append(result)
        if plan_invalidated(result, plan):
            plan = generate_plan(goal, model, prior_results=results)
            replans += 1
            i = 0  # restart with the revised plan
        else:
            i += 1
    return results
~~~

### Non-negotiables for production planning systems

1. **Bound replanning attempts explicitly** (\`max_replans\`), directly reusing **Agent Fundamentals**' loop-safety guidance.
2. **Choose the planning strategy deliberately** (reactive, upfront, or hybrid) matched to the task's genuine predictability.
3. **Design explicit plan-revision trigger conditions**, rather than assuming an initial plan remains permanently valid.
4. **Verify a plan's key assumptions before significant execution investment**, directly mitigating compounding-hallucination risk at the planning stage.
5. **Reserve exploratory (tree-of-thought) planning for tasks genuinely justifying its additional compute cost.**

### Common production patterns

- **Plan-and-execute agents** for well-understood, structured tasks benefiting from upfront coherence.
- **Hybrid hierarchical planning**, combining a high-level plan with reactive, per-phase execution.
- **Tree-of-thought planning** for genuinely high-stakes or ambiguous tasks where comparing multiple candidate approaches is worth the additional cost.
`,

  "industry-examples": `
- **Trip-planning and complex-task-automation agents**, using plan-and-execute architectures to coordinate genuinely multi-step, interdependent bookings/actions.
- **Coding agents planning a multi-file refactor upfront** before executing individual file-level changes reactively.
- **Research-assistant agents** using hierarchical planning (research phases, then detailed research steps within each phase) for comprehensive, multi-source research tasks.
`,

  "best-practices": `
1. **Choose the planning strategy deliberately** (reactive, upfront, or hybrid), matched to the task's genuine predictability and complexity.
2. **Bound replanning attempts explicitly**, directly reusing **Agent Fundamentals**' loop-safety guidance.
3. **Design explicit plan-revision trigger conditions**, rather than assuming an initial plan remains valid throughout execution.
4. **Verify a plan's key assumptions before significant execution investment**, directly mitigating compounding-hallucination risk.
5. **Reserve exploratory (tree-of-thought) planning for tasks genuinely justifying its cost.**
6. **Consider hierarchical decomposition** for tasks complex enough that a flat, single-level plan would be unwieldy.
7. **Leverage relevant memory (short-term and long-term)** when generating a plan, directly connecting to the **Agent Memory** skill.
`,

  "anti-patterns": `
### Over-planning simple, well-understood tasks

~~~
# WRONG — generating an elaborate, multi-step upfront plan
# (or worse, tree-of-thought exploration across multiple
# candidate plans) for a genuinely simple, single-step task
# RIGHT — reserve explicit planning overhead for tasks
# genuinely complex enough to benefit from it
~~~

### Never revising a plan despite contradicting information

~~~
# WRONG — continuing to execute an original plan step by
# step even after an intermediate result clearly contradicts
# a key assumption the plan was built on
# RIGHT — design explicit plan-revision triggers, directly
# connecting to the Reflection skill's self-critique concept
~~~

### Unbounded replanning

~~~
# WRONG — allowing an agent to replan indefinitely without
# a maximum replan count, risking an unproductive,
# expensive, never-converging plan-execute-replan cycle
# RIGHT — bound replanning attempts explicitly, directly
# reusing Agent Fundamentals' loop-safety guidance
~~~

### Other production-grade anti-patterns

- **Committing significant execution effort to a plan without verifying its key assumptions first.**
- **Using tree-of-thought exploration universally** rather than reserving it for tasks genuinely justifying the additional compute cost.
- **Flat, single-level decomposition for a task genuinely complex enough to benefit from hierarchical structure.**
`,

  performance: `
### Rule zero: planning overhead should scale with genuine task complexity, not be applied uniformly

A simple, single-step task gains nothing from elaborate upfront planning or exploratory tree-of-thought comparison — reserve this overhead specifically for tasks genuinely complex or ambiguous enough to benefit.

### The performance hierarchy (apply in order)

1. **Match planning strategy to genuine task complexity** — reactive for simple/unpredictable tasks, upfront/hierarchical for complex, well-structured ones.
2. **Bound replanning attempts explicitly**, avoiding unproductive, costly plan-execute-replan cycles.
3. **Reserve exploratory (tree-of-thought) planning for genuinely high-value decisions**, given its multiplied compute cost.
4. **Verify key plan assumptions cheaply before committing to expensive execution**, avoiding wasted effort on a flawed plan.

### Micro-level facts worth knowing

- Each planning step (generating or revising a plan) involves at least one full LLM call, directly connecting to the **Inference** skill's own per-call cost treatment — planning overhead scales with both plan complexity and the number of replanning cycles required.
- Tree-of-thought's cost scales roughly linearly with the number of candidate plans generated and evaluated, a genuine, deliberate tradeoff against improved outcome quality for genuinely difficult decisions.
`,

  scalability: `
Deliberate planning-strategy selection directly determines how confidently an organization can scale agent systems to genuinely complex, long-horizon, multi-step tasks.

### How disciplined planning design enables scaling

~~~mermaid
flowchart LR
    MatchedStrategy["Planning strategy matched\nto genuine task complexity +\nbounded replanning"] --> Reliable["Reliable completion of\nincreasingly complex,\nlong-horizon tasks"]
    Reliable --> ConfidentScaling["Confident scaling to\nadditional task complexity\nwithout runaway cost"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A flat plan becoming unwieldy for a highly complex task | Adopt hierarchical planning across multiple abstraction levels |
| Unproductive, never-converging replanning cycles | Bound replanning attempts explicitly |
| High compute cost from universal tree-of-thought exploration | Reserve exploratory planning specifically for genuinely high-value decisions |
| A plan built on an unverified, incorrect assumption | Verify key assumptions before committing significant execution effort |
`,

  security: `
### Planning-specific security considerations, directly extending Agent Fundamentals and Guardrails

~~~
An upfront plan that includes HIGH-RISK actions (as
identified in Agent Fundamentals and Guardrails) should be
subject to the SAME action-level guardrail scrutiny as any
individual, reactively-decided action -- a plan is not
exempt from action-level safety review merely because it
was generated as part of a more deliberate, upfront process.
~~~

### Essential planning-related security practices

1. **Apply action-level guardrails to every planned step**, directly reusing **Agent Fundamentals**' and **Guardrails**' treatment, not only to reactively-decided actions.
2. **Review high-risk actions within an upfront plan before execution begins**, potentially via human-in-the-loop review of the plan itself, directly connecting to **Agent Fundamentals**' autonomy-level guidance.
3. **Treat any external information incorporated into planning** (e.g., long-term memory, retrieved documents) as potentially untrusted, directly reusing the **LangChain** skill's own prompt-injection guidance.

See **Agent Fundamentals** and **Guardrails** for the broader security context this connects to.
`,

  testing: `
### Testing plan decomposition quality

~~~python
def test_plan_decomposes_complex_goal_into_actionable_steps():
    plan = generate_plan("Write a technical blog post about vector databases", model)
    assert len(plan) >= 3  # genuinely decomposed, not a single vague step
~~~

### Testing plan-revision triggering

~~~python
def test_plan_is_revised_when_assumption_is_contradicted():
    results = run_planned_task(goal, model, agent_with_unexpected_result, max_replans=3)
    assert replanning_occurred(results)
~~~

### The senior testing doctrine

- Test that generated plans genuinely decompose a complex goal into concrete, actionable sub-tasks, not vague, unhelpfully broad ones.
- Test that plan revision correctly triggers when a step's result contradicts a key planning assumption.
- Test bounded replanning — verify the system terminates within its configured maximum replan count.
- Use the **Evaluation** skill's rigorous measurement methodology for assessing overall planned-task completion quality against representative goals.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the exact generated plan first**, directly analogous to **Agent Fundamentals**' own trajectory-tracing guidance.
2. **Check which specific step's result triggered (or failed to trigger) a replan**, if plan revision behaved unexpectedly.
3. **Check the planning prompt's clarity/specificity** if generated plans seem vague or poorly decomposed.
4. **Check replanning bounds** if a task's execution ran longer/cost more than expected.

### Debugging common planning-related symptoms

- "The generated plan is too vague to execute" — check the planning prompt's specificity, directly connecting to the **Prompt Engineering** skill's own clarity guidance.
- "The agent kept executing a plan that was clearly wrong" — check the plan-revision trigger logic for missing or overly-narrow conditions.
- "Replanning happened far more than expected" — inspect what's repeatedly invalidating the plan; consider whether the underlying task/environment is genuinely too unpredictable for upfront planning.
- "A tree-of-thought comparison selected a poor candidate plan" — check the evaluator/scoring function's own quality and criteria.
`,

  monitoring: `
### Key signals to track

- **Plan-decomposition quality** (number of steps, specificity), directly connecting to the **Evaluation** skill's own measurement methodology.
- **Replanning frequency**, watching for tasks requiring unusually frequent plan revision (a signal of either genuine task unpredictability or an under-specified initial planning prompt).
- **Planned-task completion rate**, directly connecting to **Agent Fundamentals**' own trajectory-observability treatment.
- **Tree-of-thought candidate-plan quality distribution**, for systems using exploratory planning.

### Tools

General LLM observability tools for tracing the full plan-execute-replan sequence; the **Evaluation** skill's own rigorous measurement methodology applied specifically to planned-task outcomes.

### Alerting priorities

Alert on a significant increase in replanning frequency (a signal of degraded planning quality or an increasingly unpredictable task environment), and on tasks reaching their maximum replan bound without successful completion.
`,

  deployment: `
### A representative deployment configuration

~~~python
def build_planning_agent(model, agent, max_replans=3, planning_strategy="hybrid"):
    if planning_strategy == "hybrid":
        return HierarchicalPlanExecuteAgent(model, agent, max_replans=max_replans)
    elif planning_strategy == "reactive":
        return ReactiveAgent(model, agent)
    return PlanExecuteAgent(model, agent, max_replans=max_replans)
~~~

### CI/CD pipeline considerations

Treat planning prompts, replanning-trigger logic, and strategy selection (reactive/upfront/hybrid) as genuine, version-controlled application configuration, with automated evaluation (directly connecting to the **Evaluation** skill) against representative complex tasks as a deployment gate. See the **CI/CD** skill and the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production planning-based agent system takes real traffic:

- [ ] Planning strategy (reactive, upfront, hybrid) chosen deliberately, matched to genuine task complexity
- [ ] Replanning attempts explicitly bounded (max_replans)
- [ ] Explicit plan-revision trigger conditions designed and tested
- [ ] Key plan assumptions verified before significant execution investment
- [ ] Action-level guardrails applied to every planned step, not only reactively-decided ones
- [ ] Exploratory (tree-of-thought) planning reserved specifically for tasks genuinely justifying its cost
- [ ] Automated evaluation against representative complex tasks as a deployment gate
`,

  "common-mistakes": `
1. **Over-planning genuinely simple, well-understood tasks.**
2. **Never revising a plan despite intermediate results clearly contradicting it.**
3. **Unbounded replanning**, risking an unproductive, never-converging cycle.
4. **Committing significant execution effort without verifying a plan's key assumptions first.**
5. **Using tree-of-thought exploration universally** rather than reserving it for genuinely high-value decisions.
6. **Flat decomposition for a task genuinely complex enough to benefit from hierarchical planning.**
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Generated plan is too vague to execute | Under-specified or unclear planning prompt | Tighten the planning prompt's specificity, directly reusing Prompt Engineering guidance |
| Agent keeps executing an obviously-wrong plan | Missing or overly-narrow plan-revision trigger conditions | Define explicit, broader trigger conditions for replanning |
| Replanning occurs excessively | Task/environment genuinely more unpredictable than upfront planning suits | Consider a more reactive or hybrid planning strategy |
| Tree-of-thought selects a poor candidate plan | Weak or poorly-designed evaluator/scoring function | Improve the evaluator's criteria and quality |
| Unexpectedly high cost for a simple task | Unnecessary use of elaborate upfront or exploratory planning | Match planning strategy to genuine task complexity |
| Plan execution never terminates | Missing bounded replanning limit | Apply Agent Fundamentals' bounded-iteration guidance to replanning |
`,

  faqs: `
**What is planning, in the context of AI agents?**
The family of techniques an agent uses to decompose a complex, multi-step goal into a sequence of concrete sub-tasks before or while executing them.

**How does planning relate to Agent Fundamentals' plan-act-observe loop?**
Planning directly extends the single, per-iteration "plan" step into a more deliberate, sometimes multi-step reasoning process — either upfront (before any execution) or as an ongoing, revisable process.

**What is the difference between reactive and upfront planning?**
Reactive planning decides only the immediate next action based on the current state; upfront planning generates a more complete plan before execution begins.

**What is tree-of-thought planning?**
An exploratory planning approach that generates and compares multiple candidate plans before selecting the best one, rather than committing to a single, linear plan.

**Why is plan revision important?**
Because an upfront plan is based on the agent's understanding at planning time — genuinely long-horizon tasks often reveal new information during execution that the original plan didn't anticipate.

**When should I use hierarchical planning?**
When a task is complex enough that a single, flat decomposition would be unwieldy — breaking a high-level plan into detailed sub-plans for each high-level step.
`,

  "interview-questions": `
### Junior level

1. **What is planning in the context of AI agents?**
   Model answer: decomposing a complex, multi-step goal into a sequence of concrete sub-tasks before or while executing them.

2. **What is the difference between reactive and upfront planning?**
   Model answer: reactive planning decides one action at a time based on current state; upfront planning generates a more complete plan before execution.

3. **What is tree-of-thought planning?**
   Model answer: generating and comparing multiple candidate plans before selecting the best one.

4. **Why might a plan need to be revised mid-execution?**
   Model answer: because new information encountered during execution may contradict an assumption the original plan was built on.

### Senior level

5. **Explain precisely when upfront planning provides a genuine advantage over purely reactive, step-by-step decision-making, with a concrete example.**
   Model answer: upfront planning provides a genuine advantage specifically when a task's steps have meaningful INTERDEPENDENCIES that benefit from being considered HOLISTICALLY rather than decided in isolation — a purely reactive agent, deciding only the immediate next action based on the current state, may make a locally-reasonable decision at step 2 that turns out to be SUBOPTIMAL once step 4's requirements become clear, simply because it had no visibility into the later step when making the earlier decision; consider planning a multi-city trip itinerary: a reactive agent might book a seemingly reasonable flight for the first leg without considering that a LATER leg's timing constraints would have favored a different first-leg choice, whereas an upfront plan considering the ENTIRE itinerary's structure before booking anything can identify and avoid this kind of locally-reasonable-but-globally-suboptimal decision; the concrete tradeoff is that upfront planning requires the environment/task structure to be sufficiently PREDICTABLE at planning time for this holistic reasoning to be genuinely reliable — if key details (flight availability, pricing) are likely to change unpredictably between planning and execution, the upfront plan's assumptions may not hold, favoring a more reactive or hybrid approach instead.

6. **A team's plan-and-execute research agent occasionally continues executing an increasingly irrelevant research plan even after early results suggest the topic requires a substantially different research approach. Diagnose this and propose a fix.**
   Model answer: this is a direct instance of MISSING OR OVERLY-NARROW PLAN-REVISION TRIGGERS, covered in this page's own anti-patterns section — the agent's plan-execute loop is evidently only checking for narrow, expected forms of step failure (e.g., a tool call erroring out) rather than the more subtle signal of an intermediate RESULT substantively contradicting the plan's underlying assumptions about the topic's nature or scope; the fix requires broadening the plan-revision trigger condition beyond simple execution errors to include an explicit, deliberate CHECK — after each research step, an additional model call (or the same agent's own reasoning) should assess "does this result suggest the current plan's approach is still well-suited to the goal, or does it suggest a substantially different approach is now warranted" — directly analogous to the **Reflection** skill's own self-critique treatment applied specifically at the planning level, rather than relying solely on hard execution failures to trigger replanning; this additional check does introduce some extra cost (an additional model call per step, connecting to the **Inference** skill's own per-call cost treatment), representing a genuine tradeoff between more responsive plan revision and the added computational overhead of checking after every single step versus only at coarser-grained checkpoints.

7. **Explain the genuine cost-benefit tradeoff of tree-of-thought planning compared to a single, linear chain-of-thought plan, and identify a scenario where tree-of-thought is clearly worth the additional cost.**
   Model answer: a single, linear chain-of-thought plan requires only ONE plan-generation model call, directly minimizing cost, but commits to a single reasoning path without ever comparing it against genuine alternatives — if that single path happens to be suboptimal (or outright flawed) due to how the model's initial reasoning unfolded, there's no built-in mechanism to catch this before execution begins; tree-of-thought planning generates MULTIPLE candidate plans and evaluates them before selecting the best one, directly multiplying the cost (N plan-generation calls plus evaluation overhead) but providing a genuine quality safeguard against committing to a single, possibly-suboptimal reasoning path; a scenario where this cost is clearly justified: a genuinely HIGH-STAKES, EXPENSIVE-TO-EXECUTE task where a suboptimal plan would waste substantial downstream resources — for example, planning a complex, costly infrastructure migration where multiple genuinely different valid approaches exist (a lift-and-shift approach versus a more involved re-architecting approach), and where the cost of generating and comparing a handful of candidate high-level plans (a relatively small, fixed additional planning cost) is clearly justified by the substantially larger cost/risk of committing to and executing a suboptimal migration approach without ever having considered genuine alternatives.

8. **Design a hierarchical planning system for an agent tasked with "conduct a comprehensive competitive analysis of five competitors," explaining why a flat, single-level plan would be less effective here.**
   Model answer: a FLAT, single-level plan for this task might look something like "1. Research competitor A. 2. Research competitor B. ... 5. Research competitor E. 6. Write the analysis" — this flat structure genuinely obscures the fact that "research competitor A" is ITSELF a substantially complex, multi-faceted sub-task (researching pricing, product features, market positioning, customer sentiment, and more, for EACH of the five competitors), and treating it as a single, undifferentiated plan step risks the agent executing it too superficially, without its own internal structure guiding thorough coverage; a HIERARCHICAL plan instead decomposes this into a HIGH-LEVEL plan ("Research each competitor," "Synthesize cross-competitor comparison," "Write the final analysis") and, for the "Research each competitor" high-level step specifically, a DETAILED sub-plan applied to EACH of the five competitors (research pricing, research product features, research market positioning, research customer sentiment) — this hierarchical structure ensures the genuinely substantial "research" phase receives its own appropriately-detailed internal decomposition, directly analogous to how a human project manager would break "conduct competitive analysis" into phases, and each phase into specific, concrete tasks, rather than treating the entire multi-faceted research effort as a single, undifferentiated line item in a flat plan.

9. **A production coding agent uses an upfront plan-and-execute approach for multi-file refactoring tasks. It occasionally produces a plan that assumes a function exists in a specific file, when that function was actually already moved to a different file in an earlier, unrelated change. Explain this failure using concepts from this page and Agent Fundamentals, and propose a mitigation.**
   Model answer: this is a direct instance of a PLAN BUILT ON AN INCORRECT (effectively hallucinated, or more precisely, OUTDATED) ASSUMPTION, directly connecting to this page's own treatment of planning and compounding hallucination risk, and to **Agent Fundamentals**' own foundational compounding-error concept — the agent's upfront plan was generated based on some understanding of the codebase's current structure, but this understanding was evidently incorrect or stale (perhaps based on outdated information, or an assumption the agent made without actually verifying the function's current location), and every subsequent planned step referencing that function's assumed location inherits and potentially compounds this single incorrect premise; the mitigation directly extends this page's own "verify a plan's key assumptions before significant execution investment" best practice: before committing to executing a multi-step refactoring plan, the agent should explicitly VERIFY its plan's key structural assumptions (e.g., actually searching the current codebase to confirm the function's real, current location) rather than relying purely on its own internal, potentially-outdated belief about the codebase's structure — directly analogous to a RAG-style grounding check (connecting to the **Hallucination** skill's own retrieval-based mitigation treatment) applied specifically to the planning phase, verifying assumptions against the actual, current ground truth before investing further execution effort building on top of them.

10. **Compare a purely reactive ReAct-style agent, a plan-and-execute agent, and a hybrid hierarchical-plan-with-reactive-execution agent for the task of "debug and fix a failing test in a large codebase," and recommend an approach.**
    Model answer: a purely REACTIVE ReAct-style agent would decide one debugging action at a time (e.g., "read the failing test," then based on that result, "read the function it calls," then based on THAT result, decide the next investigative step) — genuinely well-suited to debugging's inherently UNPREDICTABLE nature, since the actual root cause and the specific investigative path needed to find it typically cannot be known upfront; a pure PLAN-AND-EXECUTE agent, by contrast, would need to commit to a full debugging plan BEFORE investigating anything, which is a poor fit here — debugging is precisely the kind of task where the NEXT useful step genuinely depends on what the PREVIOUS step's investigation revealed, making a rigid upfront plan likely to become invalid almost immediately; a HYBRID hierarchical approach captures the best of both: a high-level plan providing overall STRUCTURE (e.g., "1. Reproduce the failure, 2. Identify the root cause, 3. Implement and verify a fix") while each high-level phase's ACTUAL execution proceeds REACTIVELY (the specific investigative steps within "identify the root cause" are decided one at a time, adapting to what each investigative step reveals, exactly as a purely reactive agent would); I'd recommend this HYBRID approach specifically — the high-level structure provides useful overall progress-tracking and prevents the agent from getting lost in an unstructured, potentially unproductive investigation, while the reactive execution WITHIN each phase correctly respects debugging's genuinely unpredictable, discovery-driven nature, directly avoiding the poor fit a pure upfront plan would represent for this specific kind of task.
`,

  "coding-questions": `
### 1. Implement a bounded plan-execute-replan loop

~~~python
def plan_execute_replan(goal, model, agent, max_replans=3):
    plan = generate_plan(goal, model)
    results = []
    replans = 0
    i = 0
    while i < len(plan):
        result = agent.execute_step(plan[i], context=results)
        results.append(result)
        if plan_invalidated(result, plan) and replans < max_replans:
            plan = generate_plan(goal, model, prior_results=results)
            replans += 1
            i = 0
        else:
            i += 1
    return results, replans
# Follow-up: why is it important to return replans alongside
# results, and how would you use this in production monitoring?
~~~

### 2. Implement tree-of-thought plan selection

~~~python
def tree_of_thought_plan(goal, model, evaluator, num_candidates=3):
    candidates = [generate_plan(goal, model) for _ in range(num_candidates)]
    scores = [evaluator(c) for c in candidates]
    best_index = scores.index(max(scores))
    return candidates[best_index]
# Follow-up: how would you modify this to SYNTHESIZE the
# best elements from multiple candidates, rather than
# selecting only one candidate wholesale?
~~~

### 3. Implement hierarchical plan decomposition

~~~python
def hierarchical_plan(goal, model, max_depth=2):
    high_level_steps = generate_plan(goal, model)
    if max_depth <= 1:
        return {step: None for step in high_level_steps}
    return {step: generate_plan(step, model) for step in high_level_steps}
# Follow-up: how would you extend this to support genuinely
# arbitrary depth, recursively decomposing sub-plans further
# when a sub-task is itself still too complex?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement basic task decomposition
Build a function that decomposes a complex goal into a concrete, actionable, numbered plan, verifying genuine decomposition (not vague, single-step output). Deliverable: a working, tested plan-generation function. Skills exercised: basic task decomposition.

### Lab 2 (Intermediate): Implement a bounded plan-execute-replan loop
Build a plan-execute-replan system that detects when a step's result invalidates the current plan and revises it accordingly, with bounded replanning attempts. Deliverable: a working, tested plan-revision system. Skills exercised: applied plan-revision design.

### Lab 3 (Advanced): Implement tree-of-thought exploratory planning
Build a system generating and comparing multiple candidate plans via an explicit evaluator, selecting the best one. Deliverable: a working, tested tree-of-thought planning system with a documented comparison against single-chain planning. Skills exercised: applied exploratory planning.

### Lab 4 (Production): Build a hybrid hierarchical-reactive planning system
Build a system with an upfront, high-level plan and reactive, per-step execution within each high-level phase. Deliverable: a working, tested hybrid planning system for a genuinely complex, multi-phase task. Skills exercised: applied hybrid planning architecture.
`,

  "real-projects": `
### 1. A trip-planning agent with plan-and-execute architecture
Engineering requirements: upfront itinerary planning considering interdependent constraints, with explicit replanning when a booking step reveals a constraint violation.

### 2. A research-assistant agent with hierarchical planning
Engineering requirements: a high-level research plan decomposed into detailed sub-plans per research phase, with memory integration for prior findings.

### 3. A debugging agent with hybrid hierarchical-reactive planning
Engineering requirements: a high-level debugging structure (reproduce, diagnose, fix, verify) with reactive, step-by-step investigation within each phase.
`,

  "case-studies": `
### Tree-of-Thought's demonstration of exploratory planning's value for genuinely difficult problems
The introduction of tree-of-thought reasoning/planning demonstrated that for genuinely difficult problems where a single, linear reasoning chain frequently fails, explicitly generating and comparing multiple candidate approaches can meaningfully improve outcome quality, directly justifying its additional compute cost for sufficiently high-value decisions. Lesson: for problems where a single attempt has a meaningfully high failure/suboptimality rate, explicitly generating and comparing multiple independent attempts (directly analogous to the platform's own judge-panel pattern) is often a more reliable strategy than trying to improve a single attempt's quality through prompting alone.

### The shift from purely reactive toward plan-and-execute and hybrid architectures for long-horizon tasks
As agentic systems have been applied to increasingly complex, long-horizon tasks, practitioners have increasingly recognized that purely reactive, step-by-step decision-making (while well-suited to genuinely unpredictable environments) can produce locally-reasonable-but-globally-suboptimal outcomes for tasks with meaningful step interdependencies, motivating the field's growing adoption of upfront and hybrid planning architectures. Lesson: as a technology is applied to increasingly ambitious use cases, limitations of an earlier, simpler approach (purely reactive planning) that were tolerable at smaller scale often become genuinely limiting at greater task complexity, motivating deliberate architectural evolution.
`,

  comparisons: `
| Aspect | Reactive (ReAct-style) | Upfront (Plan-and-Execute) | Hybrid (Hierarchical) |
|--------|-------------------------------|-----------------------------------|-------------------------------|
| Planning granularity | One step at a time | Full plan before execution | High-level upfront, reactive within |
| Predictability | Lower | Higher (until revision needed) | Balanced |
| Best fit | Genuinely unpredictable environments | Well-understood, structured tasks | Mixed: known structure, unpredictable details |

| Aspect | Chain-of-Thought (linear) | Tree-of-Thought (exploratory) |
|--------|----------------------------------|--------------------------------------|
| Candidate plans considered | One | Multiple, compared |
| Cost | Lower | Higher (multiplied by candidates) |
| Best fit | Straightforward tasks | High-stakes or genuinely ambiguous decisions |

**How seniors choose**: default to reactive planning for genuinely unpredictable tasks; use upfront/hierarchical planning for well-structured, interdependent multi-step tasks; reserve tree-of-thought exploration for genuinely high-value decisions justifying its additional cost; always bound replanning and verify key plan assumptions before significant execution investment.
`,

  "related-technologies": `
- **Agent Fundamentals** — the foundational plan-act-observe loop this page's planning strategies directly extend.
- **Prompt Engineering** — chain-of-thought, the foundational technique underlying sequential planning.
- **LangGraph** — its cycle-supporting graph model, a natural implementation substrate for plan-execute-replan patterns.
- **Agent Memory** — providing the context (short-term and long-term) that informs a well-grounded plan.
- **Reflection** — covered next in this category, directly extending this page's plan-revision concept into a more general self-critique loop.

Learning path: **Agent Fundamentals** → the framework skills → **Agent Memory** → this page (Planning) → **Reflection** → **Tool Calling** → **MCP**.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued research and practical refinement of hybrid planning approaches, combining upfront structure with reactive adaptability for genuinely complex, long-horizon agentic tasks.
- Continued adoption of LangGraph's (and similar frameworks') cycle-supporting graph models as a standard implementation substrate for plan-execute-replan patterns.
- Growing practical emphasis on explicit plan-assumption verification before committing to expensive execution, directly connecting to broader hallucination-mitigation practices.
- Given continued, active research in this space, verify current best-practice recommendations against up-to-date agent-framework documentation and research publications.
`,

  "future-roadmap": `
Where agent planning techniques are heading, and what's worth betting career time on:

- **Continued maturity of hybrid, hierarchical planning architectures** as the standard approach for genuinely complex, long-horizon agentic tasks.
- **Continued research into more efficient exploratory-planning techniques**, seeking to capture tree-of-thought's quality benefits at lower computational cost.
- **Continued emphasis on explicit plan-assumption verification** as a standard, expected practice rather than an advanced technique.
- **What to bet on**: deeply understanding the general principle of matching planning strategy (reactive, upfront, hybrid, exploratory) to a task's genuine structure and predictability — this transfers directly across any specific framework's own planning implementation and informs sound architectural judgment for novel agentic applications.
`,

  "cheat-sheet": `
~~~
# ---- Reactive vs. upfront vs. hybrid ----
Reactive:  decide ONE step at a time -- best for unpredictable tasks
Upfront:   generate a FULL plan before executing -- best for
             well-understood, interdependent tasks
Hybrid:    upfront HIGH-LEVEL plan + reactive execution within
             each phase -- best for mixed predictability
~~~

~~~
# ---- Plan-execute-replan (bound it!) ----
plan = generate_plan(goal)
for step in plan:
    result = execute(step)
    if result contradicts a plan assumption:
        plan = generate_plan(goal, prior_results)  # REPLAN
        # ALWAYS bound max_replans -- Agent Fundamentals'
        # loop-safety guidance
~~~

~~~
# ---- Tree-of-Thought (exploratory) ----
Generate N candidate plans -> evaluate/score each ->
    select (or synthesize from) the best.
Multiplies cost by N -- reserve for genuinely high-stakes
    or ambiguous decisions, NOT universally.
~~~

~~~
# ---- Hierarchical planning ----
High-level plan (phases) -> detailed sub-plan PER phase.
Use when a flat, single-level plan would be unwieldy.
~~~

~~~
# ---- Non-negotiables ----
Verify key plan ASSUMPTIONS before expensive execution
    (a hallucinated premise compounds across every planned step!)
Apply action-level guardrails to EVERY planned step, not
    just reactively-decided ones.
Design explicit plan-revision TRIGGER conditions -- don't
    blindly execute a plan that's clearly gone wrong.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is planning (for agents)? | Decomposing a complex goal into concrete sub-tasks before/while executing. |
| Reactive vs. upfront planning? | One step at a time vs. a full plan generated before execution. |
| What is tree-of-thought planning? | Generate and compare multiple candidate plans, select/synthesize the best. |
| Why must plans sometimes be revised? | New info during execution may contradict an assumption the plan relied on. |
| Why bound replanning attempts? | Prevents an unproductive, never-converging plan-execute-replan cycle. |
| What is hierarchical planning? | A high-level plan further decomposed into detailed sub-plans per phase. |
| Why verify plan assumptions before execution? | A flawed premise compounds across every subsequent planned step. |
| When is tree-of-thought worth its extra cost? | Genuinely high-stakes or ambiguous decisions, not routine tasks. |
| Best fit for hybrid planning? | Known high-level structure, but unpredictable step-level details. |
| Do guardrails apply to planned (not just reactive) actions? | Yes — every planned high-risk step needs the same action-level scrutiny. |
`,

  mcqs: `
1. What is task decomposition in the context of agent planning?
   A) Deleting unnecessary tools  B) Breaking a complex goal into a sequence of concrete, actionable sub-tasks  C) Compressing conversation history  D) A type of guardrail
   **Answer: B** — the foundational planning operation.

2. What is the key difference between reactive and upfront planning?
   A) They are identical  B) Reactive decides one action at a time; upfront generates a more complete plan before execution begins  C) Upfront planning never uses LLM calls  D) Reactive planning is always slower
   **Answer: B** — a genuine, deliberate strategic tradeoff.

3. Why is plan revision (replanning) necessary for long-horizon tasks?
   A) It's never necessary  B) New information encountered during execution may contradict assumptions the original plan was built on  C) Plans are always perfect on the first attempt  D) Only for tasks without tools
   **Answer: B** — directly connecting to the Reflection skill's self-critique concept.

4. What is tree-of-thought planning's core mechanism?
   A) A single linear reasoning chain  B) Generating and comparing multiple candidate plans before selecting the best one  C) Deleting the current plan entirely  D) Storing plans in a vector database
   **Answer: B** — an exploratory planning approach with genuinely multiplied compute cost.

5. Why should action-level guardrails apply to every step in an upfront plan, not just reactively-decided actions?
   A) Upfront plans are inherently safe  B) A plan is not exempt from action-level safety review merely because it was generated as part of a deliberate, upfront process  C) Guardrails only work on single-step agents  D) This is not a genuine concern
   **Answer: B** — directly extending Agent Fundamentals' and Guardrails' action-level constraint guidance.
`,

  "revision-notes": `
Planning is the family of techniques an agent uses to decompose a complex, multi-step goal into a sequence of concrete sub-tasks, directly extending the "plan" step of **Agent Fundamentals**' plan-act-observe loop from a single, per-iteration decision into a more deliberate reasoning process. A foundational, frequently-tested distinction is REACTIVE planning (deciding one action at a time based on current state, as in ReAct, covered in **Agent Fundamentals**) versus UPFRONT planning (plan-and-execute: generating a more complete plan before execution begins) — reactive planning suits genuinely unpredictable environments where the next useful step depends on what prior steps revealed, while upfront planning suits well-understood, structured tasks with meaningful step INTERDEPENDENCIES benefiting from holistic, upfront consideration.

TREE-OF-THOUGHT is an exploratory planning approach generating and COMPARING multiple candidate plans (rather than committing to a single linear chain-of-thought) before selecting (or synthesizing from) the best one — directly analogous to the platform's own judge-panel pattern, genuinely improving outcome quality for difficult, ambiguous decisions at the cost of MULTIPLIED compute (N candidate plans plus evaluation overhead); this should be RESERVED for genuinely high-stakes or ambiguous decisions justifying this added cost, not applied universally.

PLAN REVISION is essential for long-horizon tasks because an upfront plan is built on the agent's UNDERSTANDING AT PLANNING TIME — genuinely long-horizon tasks often reveal new information during execution that CONTRADICTS this understanding, and a system with no explicit plan-revision trigger risks continuing to execute an increasingly ill-suited plan; **LangGraph**'s cycle-supporting graph model is a natural implementation substrate for this exact plan-execute-replan pattern, with the replanning trigger forming a conditional edge back to the planning node. Replanning attempts must be explicitly BOUNDED (directly reusing **Agent Fundamentals**' loop-safety guidance), avoiding an unproductive, never-converging cycle.

A critical, frequently-tested risk is that planning directly extends **Agent Fundamentals**' COMPOUNDING HALLUCINATION concept specifically to the PLANNING PHASE — a plan built on a hallucinated or outdated premise (e.g., an incorrect assumption about available resources or the current state of a system) compounds this single error across EVERY subsequent planned step, motivating explicit VERIFICATION of a plan's key assumptions before committing significant execution effort, directly analogous to a RAG-style grounding check applied at the planning stage.

HIERARCHICAL PLANNING decomposes a high-level plan into detailed sub-plans for each high-level step (or phase), genuinely useful when a flat, single-level decomposition would be unwieldy for a sufficiently complex task — directly analogous to how a human project manager breaks a project into phases, and each phase into specific tasks. Many production systems adopt a HYBRID approach — an upfront, HIGH-LEVEL plan providing overall structure, combined with REACTIVE, per-step decision-making WITHIN each phase's execution — capturing upfront planning's predictability alongside reactive planning's genuine adaptability to unanticipated, step-level details.

A frequently-tested security detail: action-level guardrails (covered in **Agent Fundamentals** and **Guardrails**) must apply to EVERY step within an upfront plan, not only to reactively-decided actions — a plan is not exempt from action-level safety scrutiny merely because it was generated as part of a more deliberate, upfront process.

A senior AI engineer chooses the planning strategy (reactive, upfront, hybrid) deliberately matched to a task's genuine predictability and complexity, bounds replanning attempts explicitly, designs explicit plan-revision trigger conditions, verifies key plan assumptions before significant execution investment, and reserves exploratory tree-of-thought planning for genuinely high-value decisions — this foundational understanding directly sets up the platform's remaining capability-focused skills: **Reflection** (extending plan revision into a more general self-critique loop), **Tool Calling**, and **MCP**.
`,

  "learning-roadmap": `
**Week 1 — Task decomposition**: building a basic function decomposing a complex goal into a concrete, actionable plan. Milestone: complete Lab 1, with verified genuine decomposition.

**Week 2 — Plan-execute-replan**: building a bounded plan-revision system detecting and responding to plan-invalidating results. Milestone: complete Lab 2, with a working, tested plan-revision system.

**Week 3 — Exploratory planning**: building a tree-of-thought system comparing multiple candidate plans. Milestone: complete Lab 3, with a documented comparison against single-chain planning.

**Week 4 — Hybrid hierarchical planning**: building a system combining an upfront high-level plan with reactive per-phase execution. Milestone: complete Lab 4, with a working, tested hybrid planning system.

Next platform skill once this roadmap is complete: **Reflection**, covering self-critique loops that directly extend this page's plan-revision concept into a more general improvement mechanism.
`,

  "official-docs": `
- **LangGraph's official documentation** on plan-and-execute and cyclic agent patterns, directly relevant implementation guidance for this page's concepts.
- **Framework-specific planning-agent examples** across LangChain, CrewAI, and similar, illustrating practical plan-execute-replan implementations.
`,

  books: `
- **"Artificial Intelligence: A Modern Approach" — Russell & Norvig** — foundational, general AI-planning concepts (classical planning, hierarchical task networks) providing useful conceptual background, adapted here to LLM-based agentic contexts.
- Given the LLM-agent-specific framing's relative recency, current research papers and framework documentation remain the most up-to-date practical references.
`,

  blogs: `
- **Community and framework-specific writing on plan-and-execute agent architectures**, widely available across AI engineering educational content providers.
- **Research-lab blogs discussing tree-of-thought and related exploratory reasoning techniques.**
`,

  "research-papers": `
- **Yao, S. et al. — "Tree of Thoughts: Deliberate Problem Solving with Large Language Models"** — the foundational exploratory-planning paper.
- **Wei, J. et al. — "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"** (covered in the **Prompt Engineering** skill) — the foundational sequential-reasoning paper underlying linear planning.
- **Various plan-and-execute agent architecture papers** exploring the upfront-versus-reactive planning tradeoff in LLM-based agentic systems.
`,

  videos: `
- **Conference talks on agent planning architectures** from major AI research labs and agent-framework maintainers.
- **Tutorials on implementing plan-and-execute and tree-of-thought patterns** across various AI engineering educational content providers.
`,

  "github-repos": `
- **langchain-ai/langgraph** — includes reference plan-and-execute agent implementations directly relevant to this page's concepts.
- Community repositories implementing tree-of-thought reasoning/planning techniques.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Strategy selection**: given a described task, decide whether reactive, upfront, or hybrid planning is most appropriate, and justify the choice.
2. **Plan-revision trigger design**: given a described scenario, design explicit conditions under which a plan should be revised.
3. **Tree-of-thought cost-benefit analysis**: given a described decision, assess whether exploratory planning's additional cost is genuinely justified.
4. **Hierarchical decomposition design**: given a described complex goal, design an appropriate multi-level plan decomposition.
5. **External practice sets**: LangGraph's own official plan-and-execute tutorials for hands-on practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Strategies["Planning Strategies"]
        Reactive["Reactive (per-step)"]
        Upfront["Upfront (plan-and-execute)"]
        Hybrid["Hybrid (hierarchical)"]
    end
    subgraph Exploration["Exploratory Planning"]
        ToT["Tree-of-Thought"]
        CoT["Chain-of-Thought (linear)"]
    end
    subgraph Revision["Plan Revision"]
        Trigger["Revision Trigger Detection"]
        Replan["Bounded Replanning"]
    end
    subgraph Safety["Safety"]
        AssumptionCheck["Verify Key Assumptions"]
        Guardrails["Action-Level Guardrails on Every Step"]
    end
    Strategies --> Exploration
    Strategies --> Revision
    Revision --> Safety
~~~
`,

  "mind-map": `
~~~mindmap
  root((Planning))
    Foundations
      Overview
      History ReAct Tree of Thought Plan and Execute
      Why it exists
      Problem it solves
    Strategies
      Reactive per step
      Upfront plan and execute
      Hybrid hierarchical
    Exploratory Planning
      Tree of thought
      Chain of thought linear
      Cost benefit tradeoff
    Plan Revision
      Trigger conditions
      Bounded replanning
      LangGraph cycles
    Hierarchical Decomposition
      High level phases
      Detailed sub plans
    Risks
      Compounding hallucination in plans
      Assumption verification
      Guardrails on planned steps
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default planning;
