import type { SkillContent } from "../types";

/**
 * Planning — full 50-section knowledge page.
 * Covers how agents decompose a high-level goal into an ordered sequence of
 * steps before and while acting: task decomposition, plan-and-execute vs.
 * ReAct-style interleaved reasoning-and-acting, least-to-most prompting,
 * hierarchical planning, re-planning, and plan verification/critique.
 * Sibling skills referenced throughout: Agent Fundamentals, Reflection,
 * LangGraph, Tool Calling, Agent Memory, CrewAI.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const planning: SkillContent = {
  overview: `
Planning, in the context of AI agents, is the process by which an agent turns a high-level, often underspecified goal into an ordered sequence of smaller steps that can actually be executed — either fully up front, incrementally as it goes, or some blend of both. It is the "PLAN" part of the perceive-plan-act-observe loop introduced in **Agent Fundamentals**, pulled out and treated as its own first-class engineering concern, because how an agent plans has an outsized effect on its cost, latency, reliability, and how predictable its behavior is to the humans building and operating it.

At the mechanical level, planning is still "just" prompted LLM calls: there is no separate planning module bolted onto the model, the same way there is no separate "agent module" beyond the control loop described in Agent Fundamentals. What planning contributes is a specific pattern for structuring those calls — asking the model to think about the shape of the whole task (or a meaningful chunk of it) before or between individual actions, rather than deciding the very next micro-step in isolation every single time. Whether that structuring happens once at the start (plan-and-execute), continuously at every step (ReAct-style interleaved planning), or hierarchically across multiple levels of sub-goals, is the central design axis this page covers.

For an AI engineer, planning matters because it is where the tradeoff between predictability and adaptiveness becomes concrete and decidable. A plan built entirely up front is easy to inspect, cost-estimate, and test before it runs — but it can also break the moment reality diverges from what the planner assumed, requiring an explicit re-planning mechanism to recover. A plan built one step at a time, reactively, adapts naturally to surprises — but its total cost and step count are not known until the run finishes, and it is harder to reason about or bound in advance. Neither approach is strictly better; this page is honest that the right choice is task-dependent, and that planning quality is heavily model-dependent and still an active area of research, not a solved problem with one correct recipe.

Key characteristics of planning as covered here: it produces an explicit, inspectable artifact (a plan) in the plan-and-execute style, or an implicit, step-by-step decision process in the ReAct style; it must account for the possibility that any given step can fail or return unexpected information, which means re-planning is not an edge case but a designed-for, expected occurrence; it interacts directly with **Agent Memory** (a plan is part of what an agent needs to remember and track progress against) and with **Reflection** (verifying a plan before executing it, or critiquing a completed step, are both reflection-flavored activities applied specifically to plans); and it is one of the areas where naive implementations most visibly fail in production — overly rigid plans that snap the moment an assumption is violated, planning loops where an agent re-plans forever without making progress, and plans that read as perfectly reasonable but are subtly, confidently wrong in a way that is hard to catch without dedicated verification.
`,

  history: `
Planning as a concept is far older than language models: it is a core subfield of classical AI, going back to symbolic planners that searched a space of possible action sequences to reach a goal state from a starting state, using formal representations of preconditions and effects (the STRIPS-style planning representation, and the standardized Planning Domain Definition Language, PDDL, that grew out of it, are the best-known artifacts of this era). These classical planners were precise and provably correct within their formal model of the world, but required that world to be hand-encoded in advance — they could not plan over a task described in a sentence of natural language the way an LLM-based planner can.

| Period | Milestone |
|---|---|
| 1970s-1990s | Classical AI planning matures: STRIPS-style formalisms, hierarchical task network (HTN) planning, and PDDL as a standard representation for describing planning problems to a solver |
| Pre-2020 | Reinforcement-learning agents learn implicit "plans" as policies, without an explicit, human-readable plan artifact; useful in narrow, well-simulated domains but not for open-ended, natural-language goals |
| 2022 | Chain-of-thought prompting demonstrates that asking a language model to "think step by step" materially improves multi-step reasoning quality — an important precursor insight, even though chain-of-thought is not itself a full planning architecture |
| 2022 | The Least-to-Most prompting paper proposes explicitly decomposing a hard problem into an ordered sequence of easier subproblems, solving them in order, and using each subproblem's answer to help solve the next — an early, influential LLM-native planning pattern |
| 2022 | The ReAct paper formalizes interleaving explicit reasoning traces with tool-calling actions in a single loop, effectively treating "decide the next step" as a continuous, per-step planning act rather than a single up-front planning act |
| 2023 | Plan-and-execute style agent architectures (producing a full plan up front, then executing and selectively re-planning) are popularized as an alternative to pure ReAct, aiming for lower cost and more predictable behavior on tasks whose shape is largely knowable in advance |
| 2023-2024 | Hierarchical planning patterns (breaking a goal into sub-goals, each of which may itself be planned and executed as a smaller task) become common in more sophisticated agent frameworks, echoing classical HTN planning but driven by natural-language prompting instead of formal domain models |
| 2024-2025 | Graph-based orchestration frameworks (see **LangGraph**) mature as a way to represent plans and re-planning explicitly as a stateful graph rather than an implicit prompt-driven loop, making plan structure and re-planning triggers first-class, inspectable parts of the system |

This page describes durable concepts, not a fixed ranking of frameworks or a claim that any one planning technique reliably outperforms the others across all tasks — planning quality is heavily dependent on the underlying model's reasoning capability and on how well the task matches the chosen planning pattern, and this remains an active area of research. Check the **Latest Updates** section and the framework-specific sibling skills for what is current when you read this.
`,

  "why-it-exists": `
Before planning was treated as its own concern, early agent loops (as introduced in **Agent Fundamentals**) simply asked the model, at every single step, "given everything so far, what is the very next thing to do?" This works, and it is exactly the ReAct pattern — but it has a real cost: the model has to re-derive its sense of the overall shape of the task at every step, purely from the accumulated transcript, with no persistent, explicit representation of "here is the multi-step plan I am following and here is where I am in it." For tasks with a genuinely long or complex structure, this can produce meandering behavior, redundant steps, or a loss of the overall goal amid many small tactical decisions.

The gap planning filled: **a way for an agent to reason about the shape of a whole task, or a meaningful chunk of it, rather than only the very next step.** By asking the model to produce an explicit plan — a numbered list of sub-goals or actions — before (or periodically during) execution, the plan itself becomes a persistent artifact: something the agent can check its progress against, something a human can review before any action is taken, and something that can be re-generated deliberately (re-planning) when it stops matching reality, rather than being silently and implicitly revised one step at a time with no record of the change.

The technical and practical condition that made explicit planning valuable in the LLM era was the recognition — formalized by results like least-to-most prompting and later plan-and-execute architectures — that decomposing a hard problem into an explicit ordered sequence of easier subproblems, and solving them in that order with each subproblem's answer informing the next, measurably helps a model handle problems that are too complex to solve correctly in one shot, especially when the subproblems build on each other. This is the same "decompose before you solve" intuition that underlies classical planning, expressed instead through natural-language prompting rather than a formal domain model.
`,

  "problem-it-solves": `
Planning solves the problem of making a multi-step agent's behavior both correct on complex tasks and reasonably predictable, inspectable, and controllable to the humans operating it. Concrete pains removed:

- **Tasks too complex to reliably solve in a single reasoning pass.** Decomposing a hard goal into an ordered sequence of easier subproblems, and solving them in order (least-to-most style), measurably helps on problems where each subproblem's answer genuinely informs the next — a single undivided attempt is more likely to lose track of a complex goal's structure.
- **The need for a persistent, checkable notion of progress.** An explicit plan gives the agent (and any human reviewing it) something concrete to check "am I on step 3 of 5" against, rather than inferring progress implicitly from an unstructured transcript.
- **Predictability and pre-execution review.** A plan produced up front can be inspected, cost-estimated, and — for consequential tasks — approved by a human before any tool with real side effects is invoked, which a purely reactive, step-by-step loop does not naturally support.
- **Reducing wasted, redundant, or wandering steps.** A rough plan sketched in advance gives an agent a sense of direction that a step-by-step-only loop can lack, particularly on long-horizon tasks where the goal can otherwise get lost amid tactical decisions.
- **Hierarchical decomposition of genuinely large goals.** Some tasks are naturally structured as sub-goals that are themselves multi-step (write a report, which requires researching, then drafting, then editing) — hierarchical planning gives a principled way to decompose across these levels rather than flattening everything into one long, undifferentiated step list.

What planning deliberately does **not** solve, and should not be expected to:

- **Guaranteed correctness of the plan itself.** A plan can look entirely reasonable — well-formatted, logically ordered, plausible-sounding — and still be subtly wrong: missing a necessary step, ordering steps incorrectly, or resting on a false assumption about the world. Planning produces a plan; it does not, by itself, verify that the plan is right. See Advanced Concepts and Anti-Patterns.
- **Elimination of the need to react to new information.** No amount of up-front planning quality removes the need for re-planning when a step fails or returns something the plan did not anticipate; treating a plan as fixed and final regardless of what execution reveals is one of the most common failure modes on this page.
- **Reliability that exceeds the reliability of the individual steps being planned.** Planning changes how steps are decided, not the fact that each step is still a probabilistic LLM decision or a fallible tool call — the compounding-error arithmetic covered in **Agent Fundamentals** still applies to a planned sequence of steps exactly as it does to a reactively decided one.
- **A free upgrade over simpler architectures.** Many tasks that "sound like" they need multi-step planning are, on closer inspection, better served by a single well-prompted call or a fixed, deterministic pipeline with no model-decided branching at all — reaching for elaborate planning machinery by default, when the task's step sequence is actually fixed and knowable, is itself an anti-pattern covered below.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Define what a "plan" is in the context of an LLM agent and explain how planning relates to, but is distinct from, the general perceive-plan-act-observe loop covered in **Agent Fundamentals**.
2. Contrast plan-and-execute (produce a full plan up front, then execute it) with ReAct-style interleaved reasoning-and-acting (decide one step at a time), and state the concrete cost/predictability/adaptiveness tradeoffs of each.
3. Explain least-to-most prompting and describe a task where decomposing into ordered subproblems demonstrably helps versus attempting the task in one shot.
4. Describe hierarchical planning (sub-goals that are themselves planned and executed as smaller tasks) and identify when a task genuinely warrants this extra structure versus a flat plan.
5. Identify the conditions that should trigger re-planning (a step fails, a tool returns unexpected information, an assumption behind the plan is invalidated) and design a re-planning strategy for a concrete task.
6. Explain why plan verification/critique — checking a plan before executing it — is a distinct activity from generating the plan, and connect this to the **Reflection** skill's self-critique techniques.
7. Given a task description, judge whether it needs upfront planning, interleaved planning, hierarchical planning, or no explicit planning at all (a fixed pipeline or single call) — and justify the judgment honestly.
8. Name and explain at least three planning-specific failure modes (overly rigid plans, planning loops, plausible-but-wrong plans) with a concrete example of each.
9. Explain why the cost and step count of an interleaved/reactive planning approach is harder to predict in advance than an upfront plan's, and what that implies for budgeting and monitoring.
10. Design and defend a basic set of guardrails (plan step limits, re-planning attempt limits, human review of a plan before execution) for a real planning-based agent before it goes anywhere near production.
`,

  prerequisites: `
- **Required**: a solid understanding of **Agent Fundamentals** — the perceive-plan-act-observe loop, the distinction between a single-shot call and an agent, tool use, and the compounding-error arithmetic are all assumed here without re-derivation. Planning is a deep dive into the "plan" part of that loop, not a replacement for understanding the loop as a whole.
- **Strongly recommended before this page**: familiarity with **Tool Calling**, since a plan is only useful insofar as its steps map to real, executable actions (tool calls); and a first pass over the **Reflection** skill, since plan verification/critique is a specific application of reflection techniques to a plan rather than to a finished output.
- **Helpful**: basic Python for the worked examples; familiarity with **Agent Memory**, since tracking progress against a plan (which step are we on, what has been learned so far) is a memory-management concern; a first pass over **LangGraph** is useful context, since graph-based orchestration is a common way production systems represent plans and re-planning explicitly.
- **Not required**: prior experience with any specific agent framework, or with classical AI planning formalisms (STRIPS, PDDL) — this page explains the relevant history for context but does not assume you have used a symbolic planner.

Dependency links: **Agent Fundamentals** (the loop) → this page (**Planning**, the "plan" step deep dive) → **Reflection** (verifying and critiquing plans and their execution) → **Agent Memory** (tracking plan state and progress) → **Tool Calling** (executing a plan's steps) → **LangGraph**, **CrewAI** (frameworks that give planning and re-planning explicit, structured representation).
`,

  "beginner-concepts": `
### What a plan actually is

At its simplest, a plan is an ordered list of steps that, if each one succeeds, will accomplish the stated goal. Nothing more mysterious than that. The list can live as plain text the model generates, a structured list of objects an application parses, or a graph in a framework like **LangGraph** — but the underlying idea is the same regardless of representation.

~~~text
Goal: "Find out if it will rain tomorrow in the city where our next
       team offsite is happening, and suggest whether to bring an
       umbrella."

Plan:
  1. Look up the location of the next team offsite.
  2. Get tomorrow's weather forecast for that location.
  3. Decide, based on the forecast, whether to recommend an umbrella.
  4. Compose the final answer.
~~~

### Plan-and-execute, the simplest version

The most direct way to use a plan is: ask the model to produce the whole plan first, then execute each step in order, feeding the result of each step into the next as needed.

~~~text
1. PLAN:    ask the model, given the goal, to produce a numbered list
   of steps.
2. EXECUTE: for each step in order, either call a tool, call the model
   again with just that sub-task, or run deterministic code -- whichever
   the step calls for.
3. CHECK:   after each step, confirm it produced what the plan assumed
   it would. If not, this is a trigger to re-plan (see Intermediate
   Concepts), not to blindly continue.
4. FINISH:  once all steps have executed successfully, compose the
   final answer from the accumulated results.
~~~

### A minimal worked example: generate then execute

~~~python
# A deliberately tiny plan-and-execute loop -- no framework, so the
# mechanics are visible. In production you would parse a structured
# plan (e.g. JSON) rather than a numbered text list, and you would use
# real tool calling (see the Tool Calling skill) instead of string
# matching, but this illustrates the two-phase shape without hiding it
# behind a library.

def call_llm(prompt: str) -> str:
    """Stand-in for a real LLM API call. Replace with your provider's
    client in a real system."""
    raise NotImplementedError("wire this up to a real LLM API")

def generate_plan(goal: str) -> list:
    instructions = (
        f"Goal: {goal}\\n"
        "Produce a numbered plan of 3-6 concrete steps to achieve this "
        "goal. Return ONLY the numbered list, one step per line."
    )
    raw = call_llm(instructions)
    # A production version would ask for structured JSON output and
    # validate it against a schema, rather than parsing numbered text.
    steps = [line.split(".", 1)[1].strip() for line in raw.splitlines() if line.strip()]
    return steps

def execute_step(step: str, context: str) -> str:
    instructions = (
        f"Context so far: {context}\\n\\n"
        f"Execute this single step and report the result: {step}"
    )
    return call_llm(instructions)

def run_plan_and_execute(goal: str, max_replans: int = 2) -> str:
    plan = generate_plan(goal)
    context = f"Goal: {goal}"
    for step in plan:
        result = execute_step(step, context)
        # Production note: a real implementation checks here whether the
        # result matches what the plan assumed, and re-plans if not --
        # see Intermediate Concepts for the re-planning trigger.
        context += f"\\nStep '{step}' result: {result}"
    return context
~~~

Notice that the plan is generated once, entirely separate from execution — this is the defining feature of plan-and-execute, and the direct contrast with the ReAct pattern from **Agent Fundamentals**, where the model decides the very next step at every single iteration rather than committing to a full sequence up front.
`,

  "intermediate-concepts": `
### Plan-and-execute vs. ReAct, precisely

**Agent Fundamentals** already introduced these two patterns at a high level; here is the planning-specific depth. Plan-and-execute separates "decide the shape of the whole task" (one model call, or a small number of them) from "carry out each step" (potentially many calls, but each one narrowly scoped to a single known step). ReAct fuses these into one continuous loop: at every iteration, the model reasons about the current state and decides the single next action, with no separately generated, inspectable multi-step plan ever existing as an artifact.

~~~text
Plan-and-execute:
  [one planning call] -> plan = [step1, step2, step3, step4]
  execute step1 -> execute step2 -> execute step3 -> execute step4
  (re-plan only if execution reveals the plan will not work)

ReAct:
  Thought -> Action -> Observation -> Thought -> Action -> Observation -> ...
  (no separately generated plan; each next action decided fresh,
  informed only by the accumulated transcript so far)
~~~

The tradeoff is exactly the one named in this skill's scope: plan-and-execute is more predictable (you can inspect, cost-estimate, and review the plan before any action executes) but less adaptive (a step's surprising result may not be handled correctly unless the system explicitly detects the mismatch and triggers re-planning). ReAct is more adaptive (every step incorporates the very latest information) but its total cost and step count are not knowable until the run finishes, since there is no plan to inspect in advance — you are trading a bounded, inspectable cost estimate for continuous adaptiveness, and there is no technique that gives you both for free.

### Least-to-most prompting

Least-to-most prompting is a specific decomposition technique: given a hard problem, first ask the model to break it into an ordered sequence of strictly easier subproblems, then solve them in order, explicitly feeding each subproblem's solution into the prompt for solving the next one. The key mechanism is that later subproblems are solved with the benefit of earlier subproblems' answers already established as context, rather than the model having to hold the entire problem's structure in its reasoning at once.

~~~text
Hard problem: "What is the total cost of shipping 3 packages, given
that each package costs a $5 base fee plus $2 per kg, and the packages
weigh 4kg, 7kg, and 2kg respectively?"

Least-to-most decomposition:
  Subproblem 1: What does one package weighing 4kg cost?
    -> $5 + $2*4 = $13
  Subproblem 2: What does one package weighing 7kg cost?
    -> $5 + $2*7 = $19
  Subproblem 3: What does one package weighing 2kg cost?
    -> $5 + $2*2 = $9
  Subproblem 4 (uses answers to 1-3): What is the total?
    -> $13 + $19 + $9 = $41
~~~

Least-to-most is closely related to, but distinct from, plain chain-of-thought prompting: chain-of-thought asks the model to show its reasoning within a single pass, while least-to-most explicitly structures that reasoning as a sequence of separately posed and separately answered subproblems, which tends to help more on problems where a single-pass attempt would otherwise conflate or lose track of intermediate quantities. It is a genuinely useful technique for planning-adjacent tasks, but — like every technique on this page — its benefit is model- and task-dependent, and it is not a guarantee that decomposition always beats a single-pass attempt on every problem.

### Hierarchical planning: sub-goals within a plan

Some goals do not decompose naturally into a single flat list of atomic steps — they decompose into sub-goals, each of which may itself require its own multi-step plan. Hierarchical planning makes this explicit: a top-level plan names sub-goals, and each sub-goal is expanded into its own plan (potentially recursively) only when it is time to execute it, rather than flattening the entire task into one long list up front.

~~~text
Top-level plan for "Produce a competitor analysis report":
  1. Research sub-goal: gather data on each competitor
  2. Analysis sub-goal: synthesize findings into comparative insights
  3. Writing sub-goal: draft the report
  4. Review sub-goal: check the draft against the original brief

Each sub-goal, expanded only when reached:
  Research sub-goal's own plan:
    1a. Identify the list of competitors to research
    1b. For each competitor, gather pricing, feature set, and recent news
    1c. Consolidate findings into a structured summary
~~~

Hierarchical planning echoes classical hierarchical task network (HTN) planning from symbolic AI (see History), but driven by natural-language prompting rather than a hand-authored formal domain model. It is most valuable when a task's sub-goals are genuinely heterogeneous in nature (research vs. writing vs. review call for different tool sets and different verification criteria) — for tasks that are uniformly a flat sequence of similar steps, hierarchical structure adds complexity without a proportional benefit, and a flat plan is simpler to reason about and debug.

### Re-planning: when and how

A plan is a hypothesis about how the task will go, not a guarantee. Re-planning is the deliberate act of regenerating some or all of the remaining plan when execution reveals the original plan will not work as written. Common triggers:

- **A step fails outright** (a tool call errors, a lookup returns "not found") in a way the plan did not account for.
- **A step succeeds but returns information that invalidates a later step's assumption** (the plan assumed the customer's order was still processing, but the lookup shows it already shipped, so the "cancel order" step no longer makes sense).
- **An explicit verification/critique step (see Advanced Concepts) flags the plan, or a completed step, as wrong** before execution has even hit a hard failure.

~~~text
Original plan: [lookup_order, cancel_order, notify_customer]
Execution: lookup_order returns "status: already shipped"
Trigger:   the plan's assumption (order is cancellable) is now false
Re-plan:   [lookup_order, check_return_policy, notify_customer_of_return_process]
~~~

Re-planning should itself be bounded — a re-planning attempt limit, exactly analogous to the step limit covered in **Agent Fundamentals**, prevents an agent from re-planning indefinitely without making progress, which is one of this page's named failure modes (see Advanced Concepts and Anti-Patterns).
`,

  "advanced-concepts": `
### Plan verification and critique before execution

Generating a plan and verifying that it is correct are two distinct activities, and conflating them is a common source of the "plausible-but-wrong plan" failure mode. A plan can be well-formatted, logically sequenced, and read as entirely sensible, while still resting on a false assumption, omitting a necessary step, or ordering two steps incorrectly in a way that only becomes obvious on close inspection. Plan verification is the deliberate act of checking a generated plan — ideally with a separate model call, a different prompt framing, or a rule-based check — before committing resources to executing it.

~~~text
Generated plan (looks reasonable):
  1. Look up the customer's account.
  2. Issue the refund.
  3. Notify the customer.

Verification pass catches:
  - Step 2 assumes the account lookup in step 1 confirms a refund is
    actually owed -- but the plan never checks eligibility. Missing
    step: "Check whether this order is within the refund window."
~~~

This is precisely a planning-specific application of the **Reflection** skill's general self-critique technique: a second pass, ideally with an explicit checklist or a differently framed prompt ("what could go wrong with this plan? what does it assume that might not be true?"), catches classes of error that generation alone tends to miss, because the same reasoning pass that produced a plausible-sounding plan is not well positioned to notice its own blind spots. Verification does not guarantee correctness either — it is itself a fallible LLM call — but layering it on top of generation measurably reduces the rate at which subtly-wrong plans reach execution unchecked.

### Upfront planning vs. reactive/interleaved planning: the cost-predictability tradeoff, precisely

The tradeoff named in this skill's scope deserves a precise treatment. An upfront plan of n steps has a knowable cost floor before execution starts: you can estimate roughly n model calls (for execution) plus the planning call(s), and a human can review the plan's shape before any tool with side effects runs. A reactive, interleaved (ReAct-style) approach has no such floor — the number of steps a given task will actually take is only known once the run finishes, because each step's decision genuinely depends on what the previous step returned.

| Property | Upfront plan (plan-and-execute) | Reactive/interleaved (ReAct) |
|---|---|---|
| Cost predictability before execution | High -- plan length is known before any action runs | Low -- true step count only known after the run completes |
| Adaptiveness to surprising intermediate results | Requires an explicit re-planning trigger to handle | Native -- every step incorporates the latest observation |
| Ease of pre-execution human review | High -- the whole plan can be shown to a reviewer before anything executes | Low -- there is no single artifact to review before execution begins |
| Risk of a stale plan (assumptions invalidated mid-execution) | Real, and requires detection + re-planning | Not applicable in the same way -- there is no persistent plan to go stale |
| Risk of drifting/looping with no persistent structure | Lower -- the plan provides an explicit sense of "where am I in the task" | Higher -- nothing but the transcript anchors the sense of overall progress |

Neither column is strictly better. The honest recommendation: use upfront planning when the task's step structure is largely knowable in advance and predictability/reviewability matters (customer-facing consequential actions, cost-sensitive workloads); use reactive/interleaved planning when the task's correct next step is genuinely unknown until you see the previous result and the domain does not tolerate the rigidity of a fixed plan; and, as covered in Intermediate Concepts, many production systems use a hybrid — a rough upfront plan at the sub-goal level, executed with ReAct-style adaptiveness within each sub-goal.

### Failure modes, named precisely

- **Overly rigid plans that break on unexpected input.** A plan generated against one set of assumptions about the world can become nonsensical the moment those assumptions are violated (an item is out of stock, an account does not exist, a file is not where expected) — if there is no mechanism to detect the mismatch and trigger re-planning, the agent either barrels ahead executing steps that no longer make sense, or fails outright partway through.
- **Planning loops.** An agent that keeps re-planning without ever converging on an executable plan (because each new plan hits the same or a new obstacle, and re-planning is triggered again) burns cost and time without making progress — this is the planning-specific analogue of the non-termination failure mode covered in **Agent Fundamentals**, and needs the same class of fix: a hard limit on re-planning attempts, with an explicit "give up and escalate" path once it is hit.
- **Plans that look reasonable but are subtly wrong.** As covered above under Plan Verification, a plan can be well-formed and plausible while missing a step, ordering steps incorrectly, or resting on an unstated false assumption — this is arguably the hardest failure mode to catch, precisely because it does not announce itself the way an outright execution failure does; it requires deliberate verification, not just "does the plan parse and look like a list of steps."
- **Over-decomposition.** Breaking a task into far more, far smaller steps than it warrants multiplies the number of LLM calls (and thus cost, latency, and the number of independent chances to fail) without a proportional gain in correctness — least-to-most-style decomposition helps when subproblems are genuinely easier to solve in isolation, not as a default "always decompose more" instinct.
- **Under-decomposition.** The opposite failure: treating a genuinely complex, heterogeneous goal as one flat step (or a plan with too few, too coarse steps) can overload a single step's reasoning burden the same way a single-shot call would struggle with a task that actually needed multiple, distinct reasoning passes.

### Decision table: which planning pattern fits which task

| Task characteristic | Best fit |
|---|---|
| Step sequence fully knowable up front, no surprises expected | Plan-and-execute with a simple flat plan, minimal re-planning machinery |
| Correct next step genuinely depends on the previous step's result | ReAct-style interleaved planning, or plan-and-execute with a well-designed re-planning trigger |
| Sub-goals are heterogeneous in nature (different tools, different verification needs per sub-goal) | Hierarchical planning, expanding each sub-goal's own plan only when reached |
| Task is hard enough that a single reasoning pass tends to lose track of intermediate quantities or logic | Least-to-most style decomposition into ordered subproblems |
| Consequential, costly, or irreversible actions involved | Plan-and-execute with a mandatory human-review-of-the-plan step before execution |
| Task is actually a fixed, known sequence regardless of results | No agentic planning needed at all -- a deterministic pipeline, per **Agent Fundamentals** |
`,

  "internal-working": `
Step by step, here is what actually happens inside a plan-and-execute cycle with re-planning, the production-grade shape most systems converge on:

~~~mermaid
flowchart TB
    A["Goal received"] --> B["Planning call: LLM generates an ordered\nplan (list of steps / sub-goals)"]
    B --> C{"Verification pass:\ndoes the plan hold up to critique?"}
    C -->|"Flagged as flawed"| B
    C -->|"Passes / human-approved"| D["Execute next step\n(tool call, sub-plan, or LLM call)"]
    D --> E{"Did the step succeed as the\nplan assumed it would?"}
    E -->|Yes, more steps remain| D
    E -->|"No -- assumption invalidated\nor step failed"| F["Re-plan: regenerate remaining\nsteps given new information"]
    F --> G{"Re-planning attempt limit\nreached?"}
    G -->|No| C
    G -->|Yes| H["Escalate / fail gracefully,\ndo not re-plan forever"]
    E -->|"Yes, all steps complete"| I["Compose final answer\nfrom accumulated results"]
~~~

1. **Plan generation**: given the goal (and, for hierarchical planning, the current sub-goal), an LLM call produces an ordered list of steps. In production this is typically requested as structured output (a JSON list of step objects with a description and, where known, the tool each step will use) rather than free text, so the application can parse and track it reliably — see **Tool Calling** for structured output mechanics.
2. **Verification (optional but recommended for consequential tasks)**: a separate pass — a different prompt, a different model call, or a rule-based check — reviews the plan for missing steps, wrong ordering, or unstated false assumptions, per Advanced Concepts. For low-stakes tasks, teams often skip this to save cost and latency; for consequential tasks, skipping it is a common and risky shortcut.
3. **Step execution**: each step is executed in order — a tool call, a sub-plan (hierarchical planning), or a narrowly scoped LLM call. Critically, each step's actual result is captured, not assumed to match what the plan predicted.
4. **Mismatch detection**: after each step, the application (or a dedicated check, sometimes itself an LLM call) compares the actual result against what the plan assumed would happen. This is the trigger point for re-planning, and it is the single most important piece of engineering in the whole cycle — a plan-and-execute system with no mismatch detection is simply a rigid script wearing a planning-shaped hat.
5. **Re-planning**: when a mismatch is detected, the remaining steps are regenerated given the new information, rather than blindly continuing to execute a plan that no longer matches reality. This is bounded by a re-planning attempt limit, exactly as step count is bounded in **Agent Fundamentals**, to prevent planning loops.
6. **Completion**: once every step has executed successfully (or the plan has otherwise reached its goal state), the accumulated results are composed into the final answer.

The crucial architectural fact this diagram makes visible: a plan is a hypothesis, and the system's resilience comes entirely from how well it detects when that hypothesis has been falsified and how gracefully it recovers — not from how well-written the initial plan looks. A beautifully formatted plan with no mismatch-detection or re-planning path is not meaningfully safer than no plan at all, once execution meets messy reality.
`,

  architecture: `
Understanding planning architecture, for an AI engineer, means understanding both the plan-execute-replan cycle's internal shape (above) and how a real application should be structured around a component whose step count, and even whose step content, can change mid-run rather than being fixed once execution begins.

### The core components, at a glance

- **The planner** — the LLM call (or calls) responsible for producing the plan; conceptually the same kind of prompted call covered in **Prompt Engineering**, specialized to produce a structured, ordered list of steps rather than a single answer.
- **The plan representation** — how the plan is stored and tracked: a simple ordered list, a list of sub-goals each with their own nested plan (hierarchical), or an explicit graph of nodes and edges (see **LangGraph**), which makes branching and re-planning paths first-class and inspectable rather than implicit in application code.
- **The executor** — the code (and, for each step, the tool call or LLM call) that actually carries out one step of the plan and captures its real result.
- **The verifier/critic** — an optional but recommended component, distinct from the planner, that checks a generated plan (or a just-completed step) for correctness before proceeding; see **Reflection** for the general technique this specializes.
- **The re-planner** — logic (often the same LLM call as the planner, re-invoked with updated context) that regenerates the remaining plan when a mismatch is detected, bounded by a re-planning attempt limit.
- **Plan/progress memory** — the record of which steps have executed, with what results, and what the current remaining plan is; this is squarely an **Agent Memory** concern, since a long-running planned task needs this state to persist and remain accurate across many steps.

### Application architecture around a planning-based agent

~~~mermaid
flowchart TB
    U["User / calling application"] --> App["Application layer\n(goal framing)"]
    App --> Planner["Planner\n(LLM call: goal -> ordered plan)"]
    Planner --> Verifier["Verifier / critic\n(optional: checks plan before execution)"]
    Verifier -->|approved| Executor["Executor\n(runs each step in order)"]
    Verifier -->|"flagged, or human rejects"| Planner
    Executor --> ToolExec["Tool execution\n(search, DB, code exec, internal API)"]
    ToolExec --> Mismatch{"Result matches\nplan's assumption?"}
    Mismatch -->|yes| Executor
    Mismatch -->|no| Replanner["Re-planner\n(regenerate remaining steps)"]
    Replanner --> Budget["Re-planning attempt\nlimit enforcement"]
    Budget -->|under limit| Verifier
    Budget -->|limit hit| Escalate["Escalate / fail gracefully"]
    Executor -->|all steps done| App
    App --> U
    Executor <--> Memory[("Plan / progress memory")]
~~~

Key architectural principles:

- **The plan is an explicit, first-class object, not an implicit byproduct of a transcript.** Whether represented as a list, a nested hierarchy, or a graph, the application should be able to answer "what is the current plan, and where in it are we" at any point, rather than having to re-infer it from free text.
- **Mismatch detection and re-planning are engineered components, not an afterthought bolted on if something crashes.** Exactly as in **Agent Fundamentals**' guidance that the loop, not the model, owns termination, here the application, not the model's own unchecked confidence, owns the decision to re-plan.
- **Verification is a distinct pipeline stage from generation**, ideally implemented as a separate call or check, because the same reasoning pass that produces a plan is poorly positioned to reliably catch its own errors — see Advanced Concepts and **Reflection**.
- **Re-planning attempts and total plan-execution steps are both bounded**, independently, in code — a planning system needs both a step budget (as in **Agent Fundamentals**) and a re-planning budget, since these are two distinct ways a run can run away from you.
`,

  "data-flow": `
Tracing one planning-based task end to end, from the user's request through a re-planning event to the final answer:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant Planner as Planner (LLM)
    participant Exec as Executor
    participant Tool as Tool executor
    participant Replan as Re-planner (LLM)

    User->>App: "Refund my order 41822 if it's still eligible."
    App->>Planner: goal + available tools
    Planner-->>App: plan = [lookup_order, check_eligibility,\n  issue_refund, notify_customer]
    App->>Exec: execute step 1: lookup_order(41822)
    Exec->>Tool: lookup_order(41822)
    Tool-->>Exec: result: "status: delivered 40 days ago"
    Exec-->>App: step 1 result recorded
    App->>Exec: execute step 2: check_eligibility(...)
    Exec->>Tool: check_eligibility(order=41822, days_since=40)
    Tool-->>Exec: result: "NOT eligible -- window is 30 days"
    Exec-->>App: mismatch: plan assumed eligibility would hold
    App->>Replan: re-plan given "order not eligible, 40 days since delivery"
    Replan-->>App: new plan = [check_eligibility (done),\n  explain_ineligibility, offer_store_credit, notify_customer]
    App->>Exec: execute new step: explain_ineligibility
    Exec-->>App: step result recorded
    App->>Exec: execute new step: offer_store_credit
    Exec->>Tool: offer_store_credit(order=41822)
    Tool-->>Exec: result: "credit issued"
    Exec-->>App: step result recorded
    App->>Exec: execute new step: notify_customer
    Exec-->>App: final composed answer
    App-->>User: "Your order isn't eligible for a refund (past the\n30-day window), but we've issued store credit instead."
~~~

The two facts this trace makes concrete: first, the original plan was entirely reasonable given what was known at planning time, and still turned out to be wrong once execution revealed new information — this is exactly why plan verification (checking the plan's assumptions before execution) and mismatch detection (checking results against assumptions during execution) are both necessary, and neither alone is sufficient. Second, re-planning did not restart the whole task from scratch — it preserved the already-completed step's result and regenerated only the remaining steps given the new information, which is the efficient, production-grade way to re-plan; naively discarding all progress and re-planning the entire task from the beginning wastes the work already done and risks repeating the same now-known-to-be-wrong assumption.
`,

  "production-usage": `
### How real teams actually run planning-based agents in production

- **Most production planning is shallow and bounded, not deeply hierarchical.** A flat plan of three to six steps, with a simple mismatch check and a small re-planning attempt limit, handles the large majority of real tasks; deep, multi-level hierarchical planning is reserved for genuinely heterogeneous, large-scope goals, not applied as a default.
- **Plan verification is applied selectively, weighted by consequence.** Low-stakes, easily-reversible tasks often skip an explicit verification pass to save cost and latency; tasks involving money, irreversible actions, or customer communication commonly require a verification pass, and often a human review of the plan, before execution begins.
- **Re-planning attempt limits are configured explicitly**, separate from the step-execution limit, because a run can exhaust its re-planning budget while having taken very few actual execution steps, or vice versa — conflating the two hides which resource is actually being exhausted.
- **Structured plan representations (JSON step lists, or an explicit graph via LangGraph) are preferred over free-text plans** in production, because they can be parsed reliably, validated against a schema before execution, and displayed to a human reviewer without relying on the model to have formatted free text correctly and consistently.
- **Mismatch detection is often a lightweight, deterministic check where possible** (does this tool's result satisfy this specific precondition), reserving a full LLM-based re-evaluation for cases where the mismatch is genuinely ambiguous or requires judgment.
- **Observability tracks plan changes explicitly**, not just step-by-step tool calls — logging the original plan, every re-planning event with its trigger and the new plan produced, and the final executed sequence, because debugging why a task took an unexpected path requires seeing where and why the plan changed, not just what actions eventually ran.

### Typical operational defaults

- Set a hard maximum plan length (number of steps) as a sanity check on the planner's output, catching pathologically over-decomposed plans before they reach execution.
- Set a hard maximum number of re-planning attempts per task, independent of the execution step count, with an explicit escalate-to-human or fail-gracefully path once it is hit.
- Require structured (schema-validated) plan output rather than free-text numbered lists, so plans can be parsed, displayed, and checked reliably.
- Log every plan generated, every verification/critique result, and every re-planning event with its trigger, for later debugging — this is planning's analogue of **Agent Fundamentals**' full-transcript logging guidance, applied specifically to the plan's lifecycle.
- Treat plan verification as mandatory, not optional, for any task involving money, irreversible side effects, or direct customer communication.
`,

  "industry-examples": `
- **Customer support and order-management automation** commonly use plan-and-execute for multi-step requests ("cancel my subscription and refund the last charge if eligible"), generating a short plan, checking eligibility conditions explicitly, and re-planning (e.g. offering store credit instead of a refund) when an eligibility check fails — a direct, high-value example of mismatch-driven re-planning in a consequential, customer-facing context.
- **Coding agents** frequently use a lightweight hierarchical plan (e.g. "understand the failing test, locate the relevant code, propose a fix, run tests, iterate") where the "run tests" step doubles as both an execution step and a built-in, ground-truth mismatch detector — if tests fail unexpectedly, that is itself the re-planning trigger, illustrating how a good verification mechanism can be baked directly into the task rather than requiring a separate LLM-based check.
- **Research and report-generation assistants** commonly use hierarchical planning (research sub-goal, then analysis sub-goal, then writing sub-goal), expanding each sub-goal into its own smaller plan only when reached, rather than flattening a whole report's worth of work into one long list up front — a good example of hierarchical planning earning its complexity because the sub-goals are genuinely heterogeneous.
- **Enterprise workflow automation platforms** (automating multi-step internal processes across ticketing, deployment, and internal APIs) commonly require a human-reviewable plan before any step with real side effects executes, reflecting the production pattern of mandatory plan verification and review for consequential actions described above.
- **Multi-agent orchestration frameworks** (see **CrewAI**) often implement a manager or orchestrator role whose job is specifically to produce and adjust a plan across the sub-agents it delegates to, making planning an explicit, separated responsibility from the sub-agents that execute individual steps.

Pattern to notice: the production-successful examples keep plans short and bounded, build mismatch detection directly into the task where possible (a test suite, an eligibility check) rather than relying solely on a separate LLM judgment call, and reserve deep hierarchical structure and heavy verification machinery for tasks whose genuine complexity or stakes warrant the added cost.
`,

  "best-practices": `
1. **Default to the simplest planning approach that fits the task** — no explicit planning (a fixed pipeline) if the step sequence is fully known, a flat plan-and-execute if the sequence is largely knowable with occasional surprises, ReAct-style interleaving if the correct next step genuinely depends on the previous result at every turn, and hierarchical planning only when sub-goals are genuinely heterogeneous.
2. **Require structured, schema-validated plan output**, not free-text numbered lists, so plans can be parsed, displayed to reviewers, and checked programmatically before execution.
3. **Build mismatch detection as an explicit step after every execution step**, not as an afterthought triggered only by an outright crash — a step can "succeed" mechanically while still invalidating the plan's assumptions, and only explicit checking catches this.
4. **Separate plan verification from plan generation.** Use a distinct prompt, call, or rule-based check to critique a plan before executing it, especially for consequential tasks — the same reasoning pass that generated a plan is poorly positioned to catch its own blind spots.
5. **Bound re-planning attempts independently of execution step count**, with an explicit escalate-or-fail-gracefully path once the limit is hit, to prevent planning loops.
6. **Prefer plans that use ground-truth, built-in verification where the task allows it** (a test suite, a database constraint, a policy check) over relying solely on an LLM's judgment that a step succeeded.
7. **Preserve completed work when re-planning** — regenerate only the remaining steps given new information, rather than discarding all progress and re-planning the entire task from scratch.
8. **Require human review of the plan before execution for consequential, costly, or irreversible tasks**, exactly as **Agent Fundamentals** recommends human approval for consequential individual tool calls, now applied at the plan level.
9. **Set a sanity-check maximum plan length**, catching pathologically over-decomposed or under-decomposed plans before they reach execution.
10. **Log the full lifecycle of a plan** — the original plan, every verification result, every re-planning event and its trigger, and the final executed sequence — not just the final answer.
11. **Use least-to-most-style decomposition specifically for problems where subproblems genuinely build on each other**, not as a default "always break things into more pieces" instinct — over-decomposition has its own cost and reliability tax.
12. **Evaluate planning-based agents on end-to-end task success across a representative task set that includes tasks requiring re-planning**, not only on "clean path" tasks where the original plan happens to hold — a system that only handles the case where nothing goes wrong is not meaningfully tested.
`,

  "anti-patterns": `
### Treating a generated plan as ground truth with no verification

~~~text
WRONG: generate a plan, execute every step in order, assume success
  because each individual tool call returned without an error -- never
  checking whether the step's result actually satisfies what the next
  step in the plan assumes.

RIGHT: after each step, explicitly check the result against the plan's
  assumption for that step, and treat a mismatch as a re-planning
  trigger, not something to silently paper over by continuing anyway.
~~~

### Other common planning-specific anti-patterns

- **No re-planning attempt limit, or an implausibly generous one.** An agent that keeps regenerating a plan every time it hits an obstacle, without a hard cap, can loop indefinitely without making progress — the planning-specific analogue of the infinite-loop failure mode in **Agent Fundamentals**.
- **Discarding all completed work on every re-plan.** Regenerating the entire plan from scratch, rather than preserving already-completed steps and their results, wastes work and risks re-deriving (or repeating) the exact assumption that just proved wrong.
- **Over-decomposing every task into many tiny steps "to be thorough."** This multiplies LLM calls, cost, latency, and the number of independent chances for any one step to fail, without a proportional gain in correctness — least-to-most decomposition helps specifically when subproblems genuinely build on each other, not as a blanket instinct.
- **Under-decomposing a genuinely heterogeneous task into one flat step or a too-coarse plan**, overloading a single step's reasoning burden the way a single-shot call would struggle with a task that actually needed several distinct reasoning passes.
- **Confusing a plausible-looking plan with a correct one.** A plan that is well-formatted and logically ordered can still rest on an unstated false assumption or omit a necessary step; treating "the plan parses and reads sensibly" as sufficient evidence of correctness is a direct path to the plausible-but-wrong-plan failure mode.
- **Applying deep hierarchical planning to a task that is really a flat sequence.** Nesting sub-plans within sub-plans for a task that does not have genuinely heterogeneous sub-goals adds representational and debugging complexity without benefit.
- **No mandatory human review for consequential plans.** Letting a plan that will take costly, irreversible, or customer-facing actions execute fully autonomously, with no review checkpoint, mirrors the same anti-pattern **Agent Fundamentals** flags for individual tool calls, now at the whole-plan level.
`,

  performance: `
### Measure first

Before optimizing a planning-based system, instrument and measure, per task run: number of planning calls (including re-planning), number of execution steps, tokens consumed by planning versus execution versus verification, wall-clock latency broken down the same way, and how often re-planning is triggered and why. Without this breakdown, "the agent is slow" or "the agent re-plans too much" are guesses, not engineering.

### The optimization hierarchy for planning-based systems (apply in order)

1. **Reduce unnecessary re-planning first**, since each re-planning event is a full additional LLM call on top of the execution steps it does not replace — tightening mismatch-detection logic so it only triggers a re-plan for genuine, meaningful deviations (not noise or overly strict equality checks) is almost always the highest-leverage lever.
2. **Right-size plan granularity.** Over-decomposed plans multiply execution-step LLM calls for marginal benefit; under-decomposed plans can force expensive, error-prone single steps — tune toward the coarsest decomposition that still keeps each step reliably solvable.
3. **Reserve verification passes for consequential tasks or steps**, rather than running a full separate verification LLM call on every plan regardless of stakes, since verification itself is not free.
4. **Use ground-truth checks over LLM-judged mismatch detection wherever the task allows it** (a test suite, a database constraint, a numeric eligibility check) — these are typically cheaper and more reliable than an additional model call asked "did this step succeed as expected."
5. **Choose the smallest/cheapest model that reliably produces a correct plan for the planning call**, reserving a stronger, more expensive model for execution steps or verification passes that genuinely need deeper reasoning.
6. **Cache or reuse sub-plans for recurring sub-goals** across similar tasks, where the sub-goal's shape is stable across runs, to avoid re-deriving the same decomposition repeatedly.

### Facts worth knowing at this level

- Planning-based systems have at least two distinct cost centers — planning/re-planning calls and execution-step calls — and they do not scale the same way; a system that looks cheap on "happy path" tasks (few re-plans) can look very different in cost distribution once real-world tasks trigger re-planning more often than test fixtures suggested.
- Re-planning cost is proportional to how many remaining steps need to be regenerated, not the whole plan, if implemented to preserve completed work — this is a direct performance argument for the "preserve completed work when re-planning" best practice above, not just a correctness one.
- End-to-end task success rate, measured across tasks that require at least one re-planning event, is a materially more honest signal of a planning system's real-world performance than success rate on clean-path tasks alone.
`,

  scalability: `
Scalability for planning-based systems has the same two dimensions as any agentic system covered in **Agent Fundamentals** — scaling concurrent task volume (largely an infrastructure/serving concern) and scaling the reliability of a single run as task complexity grows — plus a planning-specific wrinkle: plan length and re-planning frequency both tend to grow with task complexity, in a way that is harder to predict up front than a fixed pipeline's cost.

### The concurrency-scaling story

~~~mermaid
flowchart LR
    LB["Load balancer / task queue"] --> Run1["Planning-based run 1"]
    LB --> Run2["Planning-based run 2"]
    LB --> RunN["Planning-based run N"]
    Run1 & Run2 & RunN --> Router["Model gateway / router"]
    Router --> M1["LLM endpoint\n(planning + execution + verification calls)"]
    Run1 & Run2 & RunN --> ToolPool["Shared tool execution\n(rate-limited, sandboxed)"]
~~~

Individual planning-based runs are typically independent and scale horizontally the same way independent agent runs do in **Agent Fundamentals**; the specific constraint planning adds is that a single task's total call volume (planning plus execution plus any re-planning plus any verification) is less predictable in advance than a fixed pipeline's, which complicates capacity planning under concurrent load.

### Known bottlenecks and answers

| Bottleneck | Answer |
|---|---|
| Task complexity grows -> plans grow longer and re-planning becomes more frequent -> total calls per task rises unpredictably | Prefer hierarchical planning (bounding each sub-goal's plan length independently) over one ever-longer flat plan; monitor re-planning frequency as its own scaling signal |
| Verification passes add a full extra LLM call per plan | Apply verification selectively, weighted by task consequence, rather than unconditionally on every plan |
| Provider rate limits under many concurrent planning-based runs | Same answer as **Agent Fundamentals**: request queuing/backoff, multiple provider accounts, a routing layer -- now multiplied by planning's less predictable per-task call volume |
| Shared tool/API capacity becomes the constraint under concurrent load | Rate-limit and queue tool access centrally, exactly as in **Agent Fundamentals** |
| Re-planning attempts consuming budget faster than execution steps for certain task types | Track and alert on re-planning-attempt exhaustion as a distinct metric from step-limit exhaustion, since they indicate different problems |

The single most important scalability idea specific to planning: unlike a fixed pipeline, a planning-based task's total resource consumption depends not only on how many steps the task needs but on how many times it needs to re-plan, which is itself a function of how often reality diverges from the plan's assumptions — capacity planning for planning-based systems should explicitly account for a distribution of re-planning frequency, not just a distribution of step counts.
`,

  security: `
### Planning-specific attack surface

1. **Manipulated tool results steering re-planning toward an unsafe plan.** Since re-planning is triggered by, and incorporates, the actual results of executed steps, adversarial or manipulated content in a tool result can steer the re-planner toward generating a plan that includes an unsafe or unintended action — this is the planning-specific expression of the prompt-injection risk covered in **Agent Fundamentals**, with the added wrinkle that it can persist across a re-planning event rather than affecting only the single step where it was introduced.
2. **Plan approval bypass.** If a system is designed to require human review of a plan before execution but has a fallback or edge case that skips this check (a timeout that defaults to auto-approval, a code path that bypasses review under certain conditions), that gap becomes the actual security boundary, not the review step itself — audit every path that can lead to execution, not just the intended one.
3. **Re-planning loop as a resource-abuse vector.** An attacker who can induce a planning system into repeated, expensive re-planning cycles (by supplying inputs that reliably trigger a mismatch and thus a re-plan) has found a cost-amplification attack analogous to the unbounded-loop resource-abuse vector in **Agent Fundamentals**, but specific to the planning/re-planning cycle rather than the execution loop.
4. **Plan verification bypass through adversarial plan content.** If the verifier itself is an LLM call, content that would manipulate a planner (per point 1) can equally manipulate a verifier into approving a plan it should have flagged — treating the verifier as automatically more trustworthy than the planner, without independent safeguards, is a false sense of security.

### Defenses

- Treat tool results feeding into a re-planning call as untrusted content with respect to instructions, exactly as **Agent Fundamentals** recommends for tool results feeding a single decision step — the re-planner should reason about tool output as data, not obey embedded instructions within it.
- Audit every code path that can lead to plan execution, ensuring there is no fallback, timeout, or edge case that bypasses a mandated human-review-of-the-plan step for consequential tasks.
- Enforce a hard re-planning attempt limit as a security control, not only a cost-efficiency one, since repeated re-planning is a viable resource-abuse vector.
- Do not treat an LLM-based verifier as an independent, trustworthy safeguard against adversarial content by default — where stakes are high, combine LLM-based verification with rule-based or deterministic checks (does this plan include a disallowed tool, does this plan's total estimated cost exceed a threshold) that cannot be talked out of flagging a problem the way a prompted model call potentially can.
- Log every plan, verification result, and re-planning event, including the tool results that triggered each re-plan, so an incident involving a manipulated plan can be reconstructed after the fact.

See the **Guardrails**, **Tool Calling**, and **Reflection** skills for depth beyond the planning-specific surface covered here — this section is the planning-specific layer on top of the general agent security picture in **Agent Fundamentals**.
`,

  testing: `
Testing planning-based systems combines the non-determinism challenges already present for agents generally (see **Agent Fundamentals**' testing section) with an additional requirement: tests must specifically exercise the re-planning path, not just the "everything goes as the original plan expected" happy path, since re-planning behavior is where much of a planning system's real-world reliability actually lives.

~~~python
# Testing a planning-based agent: assert on plan structure where it can
# be checked deterministically, and on end-to-end outcomes across both
# clean-path and re-planning-required scenarios.

def test_plan_has_reasonable_length():
    plan = generate_plan(goal="Refund order 41822 if eligible.")
    assert 2 <= len(plan) <= 8   # sanity-check against pathological plans

def test_plan_includes_required_eligibility_check():
    plan = generate_plan(goal="Refund order 41822 if eligible.")
    step_text = " ".join(plan).lower()
    assert "eligib" in step_text  # regression test for the missing-step
                                  # failure mode caught in Advanced Concepts

def test_replanning_triggers_on_ineligibility():
    result = run_plan_and_execute(
        goal="Refund order 41822 if eligible.",
        force_tool_result={"check_eligibility": "NOT eligible"},
    )
    assert result.replanned is True
    assert "credit" in result.final_answer.lower() or "not eligible" in result.final_answer.lower()

def test_replanning_attempt_limit_is_enforced():
    # Simulate a task that will never resolve to an executable plan.
    result = run_plan_and_execute(goal="...", force_persistent_mismatch=True)
    assert result.status in ("escalated", "failed_gracefully")
    assert result.replan_attempts <= MAX_REPLAN_ATTEMPTS

def test_completed_steps_preserved_across_replan():
    result = run_plan_and_execute(goal="Refund order 41822 if eligible.")
    # The lookup_order step should not be re-executed after a re-plan
    # triggered by the eligibility check, per the "preserve completed
    # work" best practice.
    lookup_calls = [c for c in result.tool_calls if c.tool_name == "lookup_order"]
    assert len(lookup_calls) == 1
~~~

### Fundamentals-level testing doctrine for planning

- **Test the re-planning path as a first-class scenario**, not an incidental side effect of other tests — construct scenarios that deliberately violate a plan's assumptions and assert the system detects the mismatch and re-plans sensibly.
- **Test plan structure where it can be checked deterministically** (plan length within a sane range, presence of a specific required step) before falling back to more expensive, harder-to-assert end-to-end task success evaluation for full correctness.
- **Test that completed work is preserved across a re-plan**, not silently re-executed or discarded, since this is both a correctness and a cost concern.
- **Test the re-planning attempt limit directly**, exactly as **Agent Fundamentals** recommends testing the step-limit enforcement directly — this is a safety-critical control, and regressions here are expensive incidents.
- **Separate deterministic plan-structure tests (mockable) from true end-to-end task-success evaluation (needs real model calls and a scoring approach)**, connecting the latter to the **Evaluation** skill's methodology, applied to plans and re-planning outcomes rather than single-call outputs.
`,

  debugging: `
### Escalation path for debugging unexpected planning behavior

1. **Reconstruct the full plan lifecycle first**, not just the final output — the original plan, every verification result, every re-planning event with its trigger, and the final executed sequence.

~~~python
def print_plan_lifecycle(result) -> None:
    """Debugging habit: before theorizing about WHY a planning-based
    agent produced a wrong result, print the whole plan lifecycle."""
    print("--- original plan ---")
    for i, step in enumerate(result.original_plan):
        print(f"  {i+1}. {step}")
    for event in result.replanning_events:
        print(f"--- re-plan triggered by: {event.trigger} ---")
        for i, step in enumerate(event.new_plan):
            print(f"  {i+1}. {step}")
    print("--- executed steps ---")
    for step in result.executed_steps:
        print(f"  {step.description} -> {step.result}")
    print(f"final status: {result.status}")
~~~

2. **Identify whether the failure originated in planning, execution, or re-planning**, since a wrong final answer downstream of a subtly-wrong original plan needs a different fix (better plan verification) than one downstream of a mismatch that should have triggered a re-plan but did not (better mismatch-detection logic).
3. **Check whether a plan was plausible-but-wrong** — read the original plan cold, independent of the final outcome, and ask whether it actually accounted for every precondition the later steps assumed; this is the same exercise plan verification should have performed before execution, done retroactively for debugging.
4. **Check the re-planning attempt limit and history** — did the agent re-plan an unreasonable number of times before failing or succeeding, and if so, was the mismatch-detection logic too sensitive (triggering re-plans on noise) or was the task genuinely this volatile?
5. **Check whether completed work was preserved or wastefully discarded across a re-plan**, both for correctness (was a step re-executed with different, inconsistent results the second time) and for cost.
6. **Reproduce with a low/near-zero temperature** on the planning call to remove sampling randomness as a variable while isolating whether the issue is in the planner's prompt, the task's genuine difficulty, or a real capability limitation — same technique as debugging a single decision step in **Agent Fundamentals**, applied here to the planning call specifically.
7. **Escalate to a proper multi-run evaluation** (**Evaluation** skill, applied to plan quality and end-to-end task success) once single-run debugging has ruled out obvious prompt, schema, or mismatch-detection bugs.

### Common "it's not a bug, it's the fundamentals" traps

- Agent executed a step that no longer made sense: mismatch detection did not catch that an earlier step's result invalidated a later step's assumption — check the mismatch-detection logic's coverage, not just whether it exists.
- Agent re-planned repeatedly without converging: check whether the re-planning attempt limit is actually being enforced, and whether the underlying obstacle triggering each re-plan is one the agent genuinely has a tool to resolve at all.
- Plan looked fine in review but failed in execution: this is the plausible-but-wrong-plan failure mode: the plan needed deeper verification (checking assumptions explicitly), not just a format/readability check.
`,

  monitoring: `
Production monitoring of planning-based agents extends standard agent monitoring (per **Agent Fundamentals**) with signals specific to the plan lifecycle.

### What to measure

- **Plan length distribution** — a rising tail of unusually long plans can indicate over-decomposition creeping in, or genuinely more complex incoming tasks outgrowing the current planning approach.
- **Re-planning frequency and its triggers, categorized** — how often tasks require at least one re-plan, and what fraction of re-plans are triggered by outright tool failures versus assumption-invalidating results versus verification-pass rejections; a single aggregate "re-planning rate" hides which trigger is actually driving it.
- **Re-planning attempt exhaustion rate** — how often tasks hit the hard re-planning attempt limit without resolving, a direct signal of planning loops or genuinely unsolvable-as-scoped tasks.
- **Verification rejection rate** — how often a generated plan fails its own verification pass before ever reaching execution, an early signal of planner prompt or model quality issues.
- **End-to-end task success rate, split by whether re-planning was required** — since a system's success rate on clean-path tasks can look very different from its success rate on tasks that needed at least one re-plan, and the latter is the more honest signal of real-world robustness.

~~~python
# Minimal instrumentation sketch around a plan-and-execute run.
import time
import logging

logger = logging.getLogger("planning_runs")

def run_planning_agent_with_monitoring(goal: str) -> dict:
    start = time.perf_counter()
    result = run_plan_and_execute(goal=goal)   # your real planning agent
    elapsed = time.perf_counter() - start

    logger.info(
        "planning_run_completed",
        extra={
            "original_plan_length": len(result.original_plan),
            "replan_count": len(result.replanning_events),
            "replan_triggers": [e.trigger for e in result.replanning_events],
            "final_status": result.status,
            "latency_seconds": elapsed,
            "total_tokens": result.total_tokens,
        },
    )
    return result
~~~

### Planning-specific things to watch

- A rising re-planning-attempt-exhaustion rate is an early, specific signal of planning loops or a task category the current planner/mismatch-detection design genuinely cannot handle, and should prompt investigation before it becomes a broader reliability incident.
- A sudden drop in verification-pass rate can indicate a regression in the planner's prompt, tool descriptions, or the underlying model, and should be treated with the same urgency as a prompt regression in a single-call system.
- A widening gap between clean-path success rate and re-planning-required success rate suggests the re-planning mechanism itself, not the base planner, is the weaker link and deserves focused attention.
`,

  deployment: `
Deploying a planning-based agent feature builds on the deployment concerns already covered in **Agent Fundamentals** (pinned model version, secrets management, timeouts/retries, step and cost budgets) with planning-specific configuration that must be explicit at deploy time.

### Configuration that must be explicit at deployment time

~~~text
PLAN_MAX_STEPS=6                    # sanity-check ceiling on plan length,
                                     # catches pathological over-decomposition
PLAN_MAX_REPLAN_ATTEMPTS=3          # hard cap, independent of execution
                                     # step count, on re-planning attempts
PLAN_REQUIRE_VERIFICATION=true      # whether a distinct verification pass
                                     # runs before any plan executes
PLAN_REQUIRE_HUMAN_REVIEW_FOR=refund,cancel_subscription,delete_account
                                     # consequential task types requiring
                                     # human review of the plan pre-execution
PLAN_STRUCTURED_OUTPUT_SCHEMA=<schema for the plan's step objects>
LLM_MODEL=<pinned model version, not "latest">
~~~

Why each choice matters: the plan-length ceiling and re-planning attempt cap are the primary defenses against pathological plans and planning loops respectively (two distinct failure modes, and thus two distinct limits, per Advanced Concepts); requiring verification and, for consequential task types, human review, is where the plausible-but-wrong-plan failure mode gets caught before it can cause real-world harm; requiring a structured output schema for the plan (rather than free-text numbered lists) is what makes automated verification, human review display, and mismatch detection reliable in the first place.

### Rollout practice specific to planning features

- **Roll out changes to the planner's prompt, the plan schema, or the re-planning trigger logic behind a flag**, and evaluate end-to-end task success specifically on a task set that includes scenarios requiring re-planning (see **Evaluation**) before full rollout — these are behavior changes with a wider blast radius than a single prompt change, since they affect the shape of every plan generated.
- **Canary changes to mismatch-detection sensitivity carefully.** Making it more sensitive (triggering more re-plans) trades cost/latency for adaptiveness; making it less sensitive trades adaptiveness for cost — monitor both re-planning frequency and end-to-end success rate before and after any change here.
- **Keep a non-planning fallback path** for task categories where planning-based execution's success rate does not meet the bar — falling back to a simpler fixed pipeline or a single well-prompted call, or routing to a human, rather than the feature failing outright.
`,

  "production-checklist": `
Before a planning-based agent feature takes real production traffic:

- [ ] Hard maximum plan length configured as a sanity check on the planner's output
- [ ] Hard maximum re-planning attempt limit configured and enforced, independent of the execution step limit
- [ ] Structured, schema-validated plan output required (not free-text numbered lists)
- [ ] Mismatch detection implemented after every execution step, not only on outright tool errors
- [ ] Plan verification pass implemented and required for consequential task types
- [ ] Human-review-of-the-plan gate defined and enforced for consequential, costly, or irreversible task types, with no bypass path
- [ ] Completed work is preserved (not re-executed or discarded) when a re-plan occurs
- [ ] Full plan lifecycle (original plan, verification results, every re-planning event and its trigger, executed sequence) logged per run
- [ ] End-to-end task success rate measured separately for clean-path and re-planning-required scenarios — see **Evaluation**
- [ ] Re-planning-attempt-exhaustion and verification-rejection-rate monitoring in place, alerting before either becomes a reliability incident
- [ ] Tool outputs feeding into re-planning are treated as untrusted data, not instructions (see Security)
- [ ] A non-planning fallback path exists for task categories where planning-based success does not meet the bar
- [ ] Model version pinned; planner prompt and schema changes evaluated before shipping, same discipline as any other prompt change
- [ ] Considered explicitly whether this task actually needs planning at all, versus a fixed pipeline, a single call, or plain ReAct — documented in the design, not just assumed
`,

  "common-mistakes": `
1. **Skipping plan verification for consequential tasks to save cost or latency** — the exact category of task where a plausible-but-wrong plan does the most damage if it reaches execution unchecked.
2. **No re-planning attempt limit, or one set so generously it might as well not exist** — leads directly to planning loops that burn cost without making progress.
3. **Treating a well-formatted, sensible-reading plan as evidence of correctness** — plausibility is not the same as correctness; a plan can miss a necessary step or rest on a false assumption while still reading perfectly reasonably.
4. **Discarding all completed work on every re-plan** instead of preserving already-executed steps and their results, wasting effort and risking re-derivation of the exact wrong assumption.
5. **Over-decomposing every task into many tiny steps "for thoroughness"** — multiplies LLM calls and failure surface without a proportional correctness gain; decomposition should be justified by the task, not applied by default.
6. **Conflating the step-execution limit with the re-planning attempt limit**, hiding which resource is actually being exhausted when a task runs long or fails.
7. **Using free-text plans instead of structured, schema-validated output**, making automated verification and reliable human review harder than they need to be.
8. **No human-review gate for consequential plans**, deploying a fully autonomous planning agent for costly, irreversible, or customer-facing actions without a review checkpoint.
9. **Applying deep hierarchical planning to tasks that are actually a flat, uniform sequence** — adds representational and debugging complexity without a matching benefit.
10. **Debugging from the final answer alone instead of the full plan lifecycle** — the originating issue (a missing step in the original plan, a mismatch that should have triggered a re-plan but did not) is often several steps upstream of the visibly wrong output.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Agent executes a step that no longer makes sense | Mismatch detection did not catch that an earlier result invalidated a later step's assumption | Review and broaden mismatch-detection coverage; do not rely solely on outright tool errors as the only re-planning trigger |
| Agent re-plans repeatedly without ever finishing | No re-planning attempt limit enforced, or the underlying obstacle is genuinely unresolvable with the agent's current tool set | Enforce a hard re-planning attempt limit with an escalate-or-fail-gracefully path; investigate whether the task needs a tool the agent lacks |
| Plan looks fine on review but fails during execution | Plan was plausible but rested on an unstated false assumption, and verification either did not run or was too shallow | Add or deepen the verification pass; explicitly prompt the verifier to check assumptions, not just formatting/logical order |
| Same step re-executed after a re-plan, with a different result the second time | Re-planning logic discards all progress instead of preserving completed steps | Regenerate only the remaining steps on re-plan; carry forward already-completed steps' results into the new plan's context |
| Plan is far longer than the task seems to warrant | Over-decomposition, often from a planner prompt that rewards granularity without a corresponding accuracy benefit | Set a sanity-check maximum plan length; review the planner's prompt for instructions that over-encourage fine-grained steps |
| Human review step silently skipped for a consequential task | A fallback, timeout, or edge-case code path bypasses the intended review gate | Audit every code path that can lead to execution; ensure there is no default-approve fallback |
| High variance in plan shape for the same task type | Non-deterministic planning call (nonzero temperature) compounding across the planner and any re-planning calls | Lower temperature at the planning call for tasks needing consistency; measure plan-length and re-plan-count distributions, not just averages |
| Verification pass approves a plan that a human reviewer would reject | Verifier is itself an LLM call vulnerable to the same blind spots (or adversarial content) as the planner | Combine LLM-based verification with rule-based checks for high-stakes plans; do not treat the verifier as automatically more trustworthy than the planner |
`,

  faqs: `
**Q: Is planning just chain-of-thought prompting?**
No, though they are related. Chain-of-thought asks a model to show its reasoning within a single pass toward one answer; planning produces an explicit, ordered sequence of steps meant to be executed (often with tool calls and real-world observations between them), and can be verified, tracked, and re-generated as a distinct artifact — chain-of-thought reasoning can appear inside a single planning call, but planning is a broader architectural pattern, not a synonym for it.

**Q: When should I use plan-and-execute instead of ReAct?**
When the task's step sequence is largely knowable in advance and you value predictability, cost-estimability, and the ability to review a plan before any action executes. Use ReAct instead when the correct next step genuinely depends on what the previous step returned at every turn, and the domain does not tolerate the rigidity of committing to a plan up front. See the decision table in Advanced Concepts.

**Q: Do I always need a separate verification step for a generated plan?**
Not always — for low-stakes, easily reversible tasks, many production systems skip it to save cost and latency. For tasks involving money, irreversible actions, or direct customer communication, skipping verification is a real risk, since a plausible-but-wrong plan is specifically the failure mode verification exists to catch.

**Q: What's the real difference between hierarchical planning and just having a longer flat plan?**
Hierarchical planning expands each sub-goal into its own plan only when execution reaches it, which keeps each level's planning call focused on a narrower, more homogeneous set of steps; a long flat plan tries to reason about the entire task's structure in one planning call, which can strain the planner's ability to keep heterogeneous sub-goals (research vs. writing vs. review, for example) coherent all at once.

**Q: How do I stop an agent from re-planning forever?**
Enforce a hard re-planning attempt limit in code, exactly analogous to the step limit in **Agent Fundamentals**, with an explicit escalate-to-human or fail-gracefully path once the limit is hit — never rely on the model's own judgment about whether it should keep trying.

**Q: My agent's plan looked completely reasonable but the task still failed — why?**
This is the plausible-but-wrong-plan failure mode: a plan can be well-formatted and logically ordered while still missing a necessary step, ordering two steps incorrectly, or resting on an unstated false assumption. A dedicated verification pass, explicitly prompted to check assumptions rather than just formatting, is the mechanism designed to catch this — see Advanced Concepts.

**Q: Where do I go next after this page?**
If your priority is executing a plan's steps reliably, go to **Tool Calling**; if it's tracking a plan's progress and state across a long-running task, go to **Agent Memory**; if it's building the verification/critique mechanism this page recommends, go to **Reflection**; if it's representing plans and re-planning explicitly as a stateful graph, go to **LangGraph**; if it's coordinating planning across multiple specialized agents, go to **CrewAI**.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a plan, in the context of an LLM agent?* Model answer sketch: an ordered list of steps, generated by the model given a goal, that if each step succeeds will accomplish that goal — it can be represented as free text, a structured list, or a graph, but the core idea is an explicit, inspectable artifact rather than an implicit, step-by-step decision.
2. *What's the difference between plan-and-execute and ReAct?* Plan-and-execute generates a full plan up front and then executes it (re-planning only if needed); ReAct decides the single next action at every step, interleaving reasoning and acting continuously with no separately generated multi-step plan artifact.
3. *What is least-to-most prompting?* A decomposition technique: break a hard problem into an ordered sequence of easier subproblems, solve them in order, and feed each subproblem's answer into solving the next one, which helps on problems where later subproblems genuinely build on earlier answers.
4. *Why might a plan need to be re-generated mid-task?* Because a step can fail outright, or succeed but return information that invalidates an assumption a later step depended on — a plan is a hypothesis about how the task will go, not a guarantee, and re-planning is the designed-for response to that hypothesis being falsified.
5. *Name one failure mode specific to planning-based agents.* Overly rigid plans that break on unexpected input, planning loops (re-planning repeatedly without converging), or plausible-but-wrong plans (a well-formatted plan that is still subtly incorrect) — any one, explained, is a strong answer.

**Senior:**

6. *Why is plan verification a distinct step from plan generation, and why does that distinction matter?* Because the same reasoning pass that produces a plausible-sounding plan is poorly positioned to notice its own blind spots — an independent verification pass, ideally with a different prompt framing focused on checking assumptions and completeness rather than formatting, measurably catches subtly-wrong plans that generation alone tends to miss, though it is itself a fallible LLM call and not a correctness guarantee.
7. *How would you decide between a flat plan and a hierarchical plan for a given task?* Use hierarchical planning when the task's sub-goals are genuinely heterogeneous in nature (different tools, different verification needs per sub-goal), expanding each sub-goal into its own plan only when reached; use a flat plan when the task is a largely uniform sequence of similar steps, since added hierarchy without genuine heterogeneity adds representational and debugging complexity without benefit.
8. *Explain the cost-predictability tradeoff between upfront planning and reactive/interleaved planning in concrete terms.* An upfront plan gives a knowable cost floor and step count before execution starts, enabling pre-execution review and cost estimation, but risks going stale if reality diverges from its assumptions, requiring a re-planning mechanism; reactive/interleaved planning adapts natively to every new observation but its total step count and cost are unknowable until the run finishes, complicating budgeting and capacity planning.
9. *A production planning agent keeps hitting its re-planning attempt limit on a specific task category. How do you investigate?* Reconstruct the full plan lifecycle for failing runs (original plan, every re-planning trigger and resulting plan); check whether the underlying obstacle is one the agent's current tool set can actually resolve at all (in which case raising the limit will not help); check whether mismatch-detection logic is over-sensitive and triggering re-plans on noise rather than genuine deviations; and consider whether the task category needs hierarchical decomposition or a different tool rather than more re-planning budget.
10. *How would you design guardrails for a planning-based agent whose plans can include tools that spend money?* Require structured, schema-validated plan output; require a mandatory verification pass and human review of the plan before execution for any plan containing a money-moving tool; enforce a hard re-planning attempt limit as both a cost and a security control; treat tool results feeding into re-planning as untrusted data with respect to instructions; and log the full plan lifecycle for auditability.
11. *What's the risk of discarding all progress on every re-plan, and how do you avoid it?* Discarding completed steps wastes real work and risks re-deriving, or even repeating, the exact assumption that just proved wrong; the fix is to regenerate only the remaining steps given the new information, carrying forward already-completed steps' results as fixed context for the new plan.
12. *Why doesn't planning repeal the compounding-error arithmetic from Agent Fundamentals?* Planning changes how a sequence of steps is decided (all at once, versus one at a time, versus hierarchically) but each individual step is still a probabilistic LLM decision or a fallible tool call — the overall success rate of a planned n-step sequence still compounds multiplicatively across those n steps exactly as an unplanned reactive sequence would, unless verification/reflection specifically recovers some of that lost reliability.
`,

  "coding-questions": `
### 1. Implement a plan-and-execute loop with mismatch detection and bounded re-planning

~~~python
from dataclasses import dataclass, field

@dataclass
class PlanStep:
    description: str
    tool_name: str | None
    expected_outcome: str | None

@dataclass
class ExecutedStep:
    description: str
    result: str
    matched_expectation: bool

@dataclass
class PlanResult:
    final_answer: str | None
    status: str          # "success" | "replan_exhausted" | "crashed"
    replan_count: int
    executed_steps: list = field(default_factory=list)

def generate_plan(goal: str, context: str, plan_fn) -> list:
    """plan_fn(goal, context) -> list[PlanStep] -- stands in for the real
    structured-output LLM call. In production, request and validate JSON
    against a schema rather than parsing free text."""
    return plan_fn(goal, context)

def check_mismatch(step: PlanStep, result: str, mismatch_fn) -> bool:
    """mismatch_fn(expected, actual) -> bool -- prefer a deterministic,
    rule-based check where the task allows it; fall back to an LLM
    judgment call only when the mismatch is genuinely ambiguous."""
    if step.expected_outcome is None:
        return False
    return mismatch_fn(step.expected_outcome, result)

def run_plan_with_replanning(goal: str, tools: dict, plan_fn, exec_fn,
                              mismatch_fn, max_replans: int = 3) -> PlanResult:
    context = f"Goal: {goal}"
    executed: list[ExecutedStep] = []
    replan_count = 0

    plan = generate_plan(goal, context, plan_fn)
    i = 0
    while i < len(plan):
        step = plan[i]
        try:
            result = exec_fn(step, tools, context)
        except Exception as exc:                      # noqa: BLE001
            result = f"error: {exc}"

        mismatched = check_mismatch(step, result, mismatch_fn)
        executed.append(ExecutedStep(step.description, result, not mismatched))
        context += f"\\nStep '{step.description}' -> {result}"

        if mismatched:
            if replan_count >= max_replans:
                return PlanResult(None, "replan_exhausted", replan_count, executed)
            replan_count += 1
            # Preserve completed work: only regenerate the REMAINING plan,
            # informed by everything executed so far.
            remaining_goal = f"{goal}\\n(Adjust remaining steps given: {result})"
            plan = plan[: i + 1] + generate_plan(remaining_goal, context, plan_fn)
        i += 1

    return PlanResult(context, "success", replan_count, executed)
~~~

Complexity: O(len(plan) + total re-planning calls) LLM calls in the worst case. Follow-ups: add a plan-length sanity check that rejects pathologically long generated plans before execution begins; add a distinct verification pass (a separate call) between generate_plan and execution for consequential goals.

### 2. Least-to-most decomposition: solve subproblems in order, feeding answers forward

~~~python
def solve_least_to_most(problem: str, decompose_fn, solve_subproblem_fn) -> str:
    """decompose_fn(problem) -> list[str] of ordered, easier subproblems.
    solve_subproblem_fn(subproblem, prior_answers) -> str -- solves one
    subproblem given the answers already established for earlier ones."""
    subproblems = decompose_fn(problem)
    prior_answers: list[tuple] = []

    for subproblem in subproblems:
        answer = solve_subproblem_fn(subproblem, prior_answers)
        prior_answers.append((subproblem, answer))

    # The final subproblem, by convention, is expected to combine the
    # earlier answers into the overall solution.
    return prior_answers[-1][1]
~~~

Complexity: O(number of subproblems) LLM calls. Follow-ups: cap the number of subproblems the decomposition step is allowed to produce, mirroring the plan-length sanity check above; discuss when least-to-most helps versus when a single-pass chain-of-thought attempt is sufficient (problems where subproblems do not meaningfully depend on each other gain little from this structure).

### 3. Detect a planning loop (repeated re-planning without new information)

~~~python
def is_planning_loop(replan_history: list, window: int = 2) -> bool:
    """Return True if the last 'window' re-planning triggers were
    effectively identical -- a signal the agent is re-planning without
    making genuine progress, rather than responding to new information
    each time."""
    if len(replan_history) < window:
        return False
    recent_triggers = [event.trigger for event in replan_history[-window:]]
    return len(set(recent_triggers)) == 1

# Production note: detecting this mid-run lets the orchestrator escalate
# to a human or fail gracefully immediately, rather than burning the
# remaining re-planning budget on a cycle that will not resolve itself.
~~~

Complexity: O(window) per check. Follow-ups: generalize exact trigger equality to a similarity threshold using an embedding or a lightweight classifier; combine with the hard re-planning attempt limit from Question 1 as a defense-in-depth pair, not a replacement for it.
`,

  "hands-on-labs": `
### Lab 1 — From-scratch plan-and-execute with one real tool (beginner, ~1.5h)
Using a real LLM API and a single real tool, implement plan generation (ask the model for a numbered plan) followed by sequential execution, with no re-planning yet. Deliverable: a working script plus a short write-up of a case where the plan's assumption turned out to be wrong and the system had no way to recover. Skills exercised: the basic plan-and-execute shape, and firsthand exposure to why re-planning is necessary.

### Lab 2 — Add mismatch detection and bounded re-planning (beginner/intermediate, ~2h)
Extend Lab 1 with an explicit check, after each step, of whether the result matches what the plan assumed, and a re-planning call (bounded by a hard attempt limit) that regenerates only the remaining steps when a mismatch is detected. Deliverable: a demonstration of the same case from Lab 1 now recovering via re-planning, plus a demonstration of the re-planning limit firing on a deliberately unresolvable scenario. Skills exercised: mismatch-detection design, bounded re-planning.

### Lab 3 — Plan verification pass and least-to-most decomposition (intermediate, ~2.5h)
Add a distinct verification step (a separate prompt or call) that critiques a generated plan for missing steps or false assumptions before execution begins, and separately implement a least-to-most decomposition for a multi-part numeric or logical problem. Deliverable: a documented case where verification catches a plausible-but-wrong plan that would otherwise have executed, plus a comparison of least-to-most decomposition versus a single-pass attempt on the same problem. Skills exercised: plan verification/critique, subproblem decomposition.

### Lab 4 — Hierarchical planning with human-review gate for consequential tasks (production, ~3.5-4h)
Build a small service that plans a task with genuinely heterogeneous sub-goals (e.g. research, then draft, then review), expanding each sub-goal into its own plan only when reached, with a mandatory human-review-of-the-plan gate before any sub-goal involving a consequential action executes, full plan-lifecycle logging, and a small evaluation script measuring end-to-end success across at least ten representative tasks, including some requiring re-planning. Deliverable: a running service, an evaluation report split by clean-path versus re-planning-required tasks, and a short incident-response note describing what you'd check first if the re-planning-attempt-exhaustion rate spiked. Skills exercised: the full production planning picture this page covers, tied together, plus a first taste of the **Evaluation** skill applied to plan quality.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate planning mastery (each also reaches into a sibling skill):

1. **Eligibility-aware refund/support agent** — A planning-based agent that handles multi-step customer requests (cancel, refund, replace) with an explicit eligibility-check step, mismatch detection that re-plans (e.g. to offering store credit) when eligibility fails, and full plan-lifecycle logging. Demonstrates: mismatch-driven re-planning in a consequential, customer-facing context — directly relevant to the **Tool Calling** and **Agent Memory** skills.

2. **Least-to-most decomposition solver with a verification harness** — A system that decomposes multi-part quantitative or logical problems using least-to-most prompting, and separately evaluates, across a benchmark set of problems, how often the decomposed approach outperforms a single-pass chain-of-thought attempt, and on what problem characteristics. Demonstrates: honest, measured evaluation of when decomposition helps versus when it does not, directly relevant to the **Evaluation** skill.

3. **Hierarchical research-and-report agent with plan review** — An agent that plans a report-writing task hierarchically (research sub-goal, analysis sub-goal, writing sub-goal, review sub-goal), expanding each only when reached, with a mandatory human-review checkpoint of the top-level plan before any research tool calls begin, and a verification pass on the final draft against the original brief. Demonstrates: hierarchical planning applied to genuinely heterogeneous sub-goals, bridging into the **Reflection** and **CrewAI** skills.

Each project should include: explicit plan-length and re-planning-attempt budgets, instrumentation distinguishing planning calls from execution calls from re-planning calls, a documented rationale for why the chosen planning pattern (flat, hierarchical, least-to-most, or none at all) fits the task, a measured end-to-end success rate split between clean-path and re-planning-required scenarios, and a written failure-mode analysis (what happens when a plan's assumption is wrong, when re-planning is triggered repeatedly, when a step fails) — the engineering discipline around detecting and recovering from a wrong plan is what distinguishes a fundamentals-level demo from a portfolio-grade project.
`,

  "case-studies": `
### The autonomous-agent demo wave's planning-shaped lesson
The 2023 wave of open-source "fully autonomous" agent projects (covered in **Agent Fundamentals**' case studies) often included an ambitious, open-ended planning component that would generate long, speculative plans for broad goals with minimal bounds on plan length or re-planning frequency. Widespread practical experience showed these agents commonly produced plans that looked reasonable on paper but diverged badly from what turned out to be achievable, triggering repeated re-planning that consumed cost without converging. Lesson: a planner's ability to generate a plausible-looking plan for an arbitrarily broad goal is not evidence that the plan is achievable or correctly scoped — bounded plan length, bounded re-planning attempts, and an honest sense of what the task's tool set can actually accomplish matter more than a planner's fluency.

### Least-to-most prompting's contribution to compositional generalization
Research on least-to-most prompting specifically highlighted that models attempting certain compositional problems in a single pass would frequently conflate or lose track of intermediate quantities, while explicitly decomposing into ordered subproblems and feeding each answer forward materially improved performance on that class of problem. Lesson: decomposition is not a universal accuracy booster — it specifically helps when subproblems genuinely build on each other in a way a single reasoning pass tends to lose track of, which is a meaningfully narrower claim than "decomposing more is always better," and matches the honest, hedged framing this page maintains throughout.

### Ground-truth verification beating LLM-judged mismatch detection in coding agents
Coding agents that treat a real test suite's pass/fail result as the mismatch-detection and re-planning trigger (rather than asking a separate LLM call to judge whether a step "seemed to succeed") have shown materially more reliable re-planning behavior, because the ground-truth signal cannot be talked out of flagging a genuine problem the way a prompted judgment call potentially can. Lesson: wherever a task offers a deterministic, ground-truth way to check a plan's assumptions, prefer it over an additional LLM-based verification call — directly relevant to the **Reflection** skill's own preference for ground-truth verification where available.

### Hierarchical planning adopted for heterogeneous sub-goal isolation
Teams building report- and research-generation agents found that flattening a task with genuinely distinct sub-goals (research, analysis, writing, review) into one long plan produced worse results than expanding each sub-goal into its own focused plan only when reached, because a single planning call trying to reason about all four sub-goals' worth of structure at once tended to produce shallower, less coherent plans for each. Lesson: hierarchical planning's real, well-evidenced benefit is keeping each planning call's reasoning burden focused and homogeneous, echoing the same context-isolation lesson **Agent Fundamentals** draws about multi-agent systems — the benefit comes from focus, not from a mysterious capability boost inherent to "having a hierarchy."
`,

  comparisons: `
| Dimension | No explicit planning (fixed pipeline / ReAct) | Flat plan-and-execute | Hierarchical planning | Least-to-most decomposition |
|---|---|---|---|---|
| When it fits | Step sequence fixed and known, or correct next step genuinely depends on every prior result | Step sequence largely knowable up front, occasional surprises expected | Sub-goals are genuinely heterogeneous in nature | A single hard problem whose subproblems build on each other |
| Predictability before execution | Low (ReAct) or by definition fixed (pipeline) | High -- whole plan inspectable before execution | Moderate -- top-level plan inspectable, sub-plans generated later | High for the decomposition step, execution cost grows with subproblem count |
| Adaptiveness to surprises | High (ReAct) or none (pipeline, by design) | Requires an explicit re-planning trigger | Requires re-planning within and across levels | Not really applicable -- designed for decomposition, not adaptiveness |
| Typical failure mode if misapplied | Pipeline: breaks on any unanticipated branch; ReAct: unpredictable cost/step count | Overly rigid if re-planning is missing or under-triggered | Added complexity without benefit if sub-goals are not actually heterogeneous | Over-decomposition of problems that did not need it |
| Where covered on this platform | **Agent Fundamentals** | This page | This page; representation depth in **LangGraph** | This page |

**How seniors choose**: start from whether the task's step sequence is actually knowable up front; if yes and simple, a fixed pipeline; if the correct next step is genuinely unknowable until you see results and the space is small, ReAct; if the shape is largely knowable but needs a review/predictability story, plan-and-execute with re-planning; if sub-goals are genuinely heterogeneous, add hierarchy; if a single hard problem's subproblems build on each other, apply least-to-most decomposition specifically to that problem, not as a blanket architectural choice. Each added layer of planning structure is a deliberate cost/complexity tradeoff, not a default upgrade.
`,

  "related-technologies": `
- **Agent Fundamentals** — the perceive-plan-act-observe loop this page's "plan" step is drawn from; read this first if you have not already.
- **Reflection** — self-critique and verification techniques that this page specializes into plan verification/critique before execution.
- **Agent Memory** — tracking a plan's progress, completed steps, and accumulated context across a long-running task; essential for any plan longer than a couple of steps.
- **Tool Calling** — designing and safely exposing the functions each plan step actually calls; a plan is only as good as the tools it can invoke.
- **LangGraph** — a graph-based orchestration framework that gives plans and re-planning paths explicit, inspectable structure rather than leaving them implicit in application code.
- **CrewAI** — a multi-agent framework where an orchestrator/manager role commonly owns planning and delegation across specialized sub-agents.
- **OpenAI Agents SDK** and **AutoGen** — frameworks whose agent loops can be combined with plan-and-execute or hierarchical planning patterns described here.
- **Evaluation** — the general methodology for measuring end-to-end task success, applied here specifically to plan quality and re-planning outcomes.
- **Guardrails** — general safety-control discipline that applies with extra force to plans involving consequential or irreversible actions.

On this platform, the natural path from here: **Agent Fundamentals** → **Planning** (this page) → **Reflection** (verify and critique plans and steps) → **Agent Memory** (track plan state and progress over long tasks) → **Tool Calling** (execute plan steps reliably) → **LangGraph** or **CrewAI** (give planning and multi-agent coordination explicit, production-grade structure).
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check each framework's official documentation and recent research for anything more current, since agent planning techniques remain an active, fast-moving area of research rather than a settled body of best practice.

- Reasoning-oriented models that spend additional inference-time computation before answering (see **LLM Fundamentals**' and **Agent Fundamentals**' Latest Updates sections) are changing the planning picture in an evolving way: some teams report that stronger single-pass reasoning reduces the need for elaborate explicit decomposition on certain problem types, while others find explicit planning and re-planning still measurably improve reliability on genuinely multi-step, information-dependent tasks — this tradeoff is still being actively worked out and should not be assumed to resolve uniformly across task types.
- Graph-based orchestration frameworks (see **LangGraph**) continue to mature as a preferred way to represent plans, sub-goals, and re-planning triggers explicitly and inspectably, reflecting a broader industry shift (also noted in **Agent Fundamentals**) away from fully open-ended, implicit agent loops and toward bounded, structured, more reviewable architectures.
- Research on hierarchical and compositional planning for LLM agents continues actively, without a single settled "best" hierarchical decomposition strategy — treat any specific claimed technique's benefit as task- and model-dependent rather than universally applicable.
- Plan verification and self-critique techniques (see **Reflection**) are an active area of applied research, with ongoing work on how to make an LLM-based verifier more reliably catch its own planner's blind spots rather than sharing them — this page's recommendation to combine LLM-based and rule-based verification for high-stakes plans reflects the current, honest state of that work rather than a fully solved problem.

Given how quickly specific technique effectiveness, benchmark results, and framework capabilities change in this category, treat any specific claim about which planning pattern "reliably works best" as a snapshot to re-verify against current research and documentation, not a permanent finding.
`,

  "future-roadmap": `
Where the planning picture is heading, and what is worth betting career time on:

1. **The core distinctions on this page — upfront versus interleaved planning, hierarchical decomposition, and re-planning triggers — are durable ideas** that will remain relevant regardless of which specific model generation or framework is current, because they describe fundamental cost/predictability/adaptiveness tradeoffs, not framework-specific mechanics.
2. **Structured, schema-validated plan representations are likely to keep displacing free-text plans** in production systems, following the same trajectory that structured tool calling displaced free-text tool-call parsing in **Agent Fundamentals**' history — betting on comfort with structured output and plan schemas is a safer long-term investment than betting on any one framework's plan format.
3. **The industry's center of gravity is visibly shifting toward bounded, inspectable, human-reviewable planning** (mirroring **Agent Fundamentals**' broader shift away from open-ended autonomy), which makes skills in plan verification, mismatch-detection design, and honest architectural judgment about when planning is warranted likely to age better than betting on any specific "fully autonomous planner" pattern.
4. **Stronger single-pass reasoning models may reduce, but are unlikely to eliminate, the need for explicit multi-step planning** — some tasks will keep requiring genuine adaptation to real-world results across multiple actions that no amount of pretrained reasoning alone substitutes for, but the boundary of "which tasks need explicit planning versus a strong single-pass attempt" will likely keep shifting as base model reasoning improves.
5. **Plan verification and re-planning are still an actively developing engineering discipline**, not a solved problem — expect continued evolution in how these are architected and evaluated, and treat current best practices (including the ones on this page) as the current state of an evolving field.

For your career: the highest-leverage, most durable skill from this page is the disciplined habit of distinguishing "does this plan look reasonable" from "is this plan actually correct," and building the mismatch-detection and re-planning machinery that assumes plans will sometimes be wrong rather than hoping they will not be — that judgment stays valuable even as the specific frameworks and models underneath it change.
`,

  "cheat-sheet": `
~~~text
# --- Core definition ---
Planning = turning a high-level goal into an ordered sequence of steps,
either fully up front (plan-and-execute), continuously per-step (ReAct),
or hierarchically across sub-goals. Not a separate module -- prompted
LLM calls structured a specific way, on top of the Agent Fundamentals loop.

# --- Plan-and-execute vs ReAct ---
Plan-and-execute : generate full plan up front, then execute it.
                   More predictable/reviewable, less adaptive to
                   surprises without an explicit re-plan trigger.
ReAct            : decide one step at a time, interleaving reasoning
                   and acting. Maximally adaptive, cost/step count NOT
                   known until the run finishes.

# --- Least-to-most prompting ---
Decompose a hard problem into ordered, easier subproblems; solve in
order; feed each answer forward into solving the next. Helps when
subproblems genuinely build on each other -- not a universal booster.

# --- Hierarchical planning ---
Top-level plan names sub-goals; each sub-goal expanded into its OWN
plan only when reached (not flattened up front). Worth the complexity
only when sub-goals are genuinely heterogeneous (different tools,
different verification needs).

# --- Re-planning ---
Triggers: a step fails outright; a step succeeds but invalidates a
  later step's assumption; a verification pass flags the plan.
Rule: preserve completed work, regenerate only the REMAINING steps.
Rule: bound re-planning attempts, separately from execution step limit.

# --- Plan verification / critique ---
A SEPARATE pass from generation (different prompt/call/rule-based
check) that reviews a plan for missing steps, wrong ordering, or
unstated false assumptions -- BEFORE execution. Mandatory for
consequential/costly/irreversible tasks. Prefer ground-truth checks
(tests, DB constraints) over LLM-judged checks where the task allows it.

# --- Failure modes (memorize these) ---
Overly rigid plans      : no mismatch detection / re-planning trigger
Planning loops          : no re-planning attempt limit enforced
Plausible-but-wrong plan: reads sensibly, still wrong -- verification
                          is the ONLY defense, format-checking is not enough

# --- Production musts ---
Structured, schema-validated plan output (not free-text lists).
Hard PLAN_MAX_STEPS + hard PLAN_MAX_REPLAN_ATTEMPTS (two separate limits).
Mandatory human review of the plan for consequential task types.
Log the full plan lifecycle: original plan, verification results, every
  re-planning event + trigger, executed sequence -- not just final output.
Treat tool results feeding re-planning as untrusted DATA, not commands.

# --- Sibling skills map ---
Agent Fundamentals -> the loop this page's "plan" step belongs to
Reflection         -> the general self-critique technique behind
                       plan verification
Agent Memory       -> tracking plan progress across a long-running task
Tool Calling       -> executing each plan step reliably
LangGraph          -> explicit, inspectable graph representation of
                       plans and re-planning paths
CrewAI             -> orchestrator/manager role that owns planning
                       across specialized sub-agents
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is a plan, mechanically? | An ordered list of steps, generated by an LLM given a goal, meant to be executed to accomplish that goal -- an explicit, inspectable artifact |
| What's the core difference between plan-and-execute and ReAct? | Plan-and-execute generates the full plan up front then executes it; ReAct decides one step at a time, interleaving reasoning and acting continuously |
| What is least-to-most prompting? | Decompose a hard problem into ordered, easier subproblems, solve them in order, feeding each answer forward into the next |
| When does hierarchical planning earn its extra complexity? | When a task's sub-goals are genuinely heterogeneous in nature (different tools/verification needs), not for uniform flat sequences |
| Name the three common re-planning triggers. | A step fails outright; a step succeeds but invalidates a later assumption; a verification pass flags the plan before execution |
| What should happen to completed work when a re-plan occurs? | It should be preserved; only the remaining steps should be regenerated, not the whole plan from scratch |
| Why is plan verification a distinct step from plan generation? | The same reasoning pass that produced a plausible plan is poorly positioned to catch its own blind spots -- an independent check catches subtly-wrong plans generation alone misses |
| What is the "plausible-but-wrong plan" failure mode? | A plan that is well-formatted and logically ordered while still missing a step, mis-ordering steps, or resting on an unstated false assumption |
| What is a planning loop? | An agent re-planning repeatedly without ever converging on an executable plan -- the planning-specific analogue of non-termination |
| Why does the cost of ReAct-style planning stay unpredictable until a run finishes? | Because each step's decision genuinely depends on the previous step's result, so total step count and cost cannot be known in advance the way an upfront plan's length can |
| Why doesn't good planning repeal the compounding-error arithmetic from Agent Fundamentals? | Each planned step is still a probabilistic LLM decision or fallible tool call; overall success still compounds multiplicatively across steps unless verification specifically recovers some reliability |
| What two limits should a planning system enforce, separately? | A maximum plan length (sanity check on the planner) and a maximum re-planning attempt count (independent of execution step count) |
| What is the safest default check for whether a step's result matches the plan's assumption? | A ground-truth, deterministic check (a test result, a database constraint, an eligibility rule) over an additional LLM judgment call, wherever the task allows it |
| Where does planning fit relative to Agent Fundamentals' loop? | Planning is a deep dive into the "plan" step of the perceive-plan-act-observe loop, not a replacement for understanding that loop |
| What should gate a consequential plan (money, irreversible actions) before execution? | A mandatory human review step, with no fallback or timeout path that bypasses it |
`,

  mcqs: `
**1. What is the defining difference between plan-and-execute and ReAct?**
A) Plan-and-execute never uses tools
B) Plan-and-execute generates a full plan up front, ReAct decides one step at a time
C) ReAct is always cheaper
D) They are the same pattern with different names

Answer: B. Explanation: plan-and-execute separates planning (once, up front) from execution (many steps); ReAct fuses reasoning and acting into a single continuous per-step decision, with no separate plan artifact. Neither claim in A, C, or D is accurate.

**2. Least-to-most prompting is most helpful for which class of problem?**
A) Any problem, universally, regardless of structure
B) Problems whose subproblems genuinely build on each other's answers
C) Problems that require no reasoning at all
D) Problems that must be solved in a single LLM call

Answer: B. Explanation: least-to-most's benefit comes from feeding earlier subproblems' answers into solving later ones; it is not a universal accuracy booster, and problems whose subproblems do not meaningfully depend on each other gain little from it.

**3. Why is plan verification typically implemented as a separate pass from plan generation?**
A) Because generation is always wrong
B) Because the same reasoning pass that produced a plan is poorly positioned to catch its own blind spots
C) Because verification is cheaper than generation
D) Because it is required by every LLM provider's API

Answer: B. Explanation: an independent check, often with a different prompt framing focused on assumptions and completeness, catches classes of error that generation alone tends to miss -- though verification is itself a fallible LLM call, not a guarantee.

**4. What is the correct response to detecting a mismatch between a step's result and the plan's assumption?**
A) Ignore it and continue executing the original plan
B) Immediately fail the entire task with no recovery attempt
C) Trigger re-planning, regenerating the remaining steps given the new information, bounded by an attempt limit
D) Retry the exact same step indefinitely until it matches the assumption

Answer: C. Explanation: a mismatch is the designed-for trigger for re-planning; regenerating only the remaining steps (preserving completed work) and bounding the number of re-planning attempts avoids both silently proceeding on a stale plan and looping indefinitely.

**5. Which of the following best describes hierarchical planning's real, well-evidenced benefit?**
A) It always produces a shorter overall plan
B) It is always cheaper than a flat plan
C) It keeps each planning call's reasoning focused on a narrower, more homogeneous set of steps for genuinely heterogeneous sub-goals
D) It eliminates the need for re-planning entirely

Answer: C. Explanation: hierarchical planning's benefit is context and reasoning focus per sub-goal, not a guaranteed cost or length reduction, and it does not remove the need for mismatch detection and re-planning within or across sub-goals.

**6. A plan reads as well-formatted and logically ordered, yet the task still fails. What failure mode does this most likely illustrate?**
A) An infinite loop
B) A planning loop
C) A plausible-but-wrong plan
D) Over-decomposition

Answer: C. Explanation: this is the specific failure mode where a plan appears reasonable on inspection but rests on a missing step, wrong ordering, or an unstated false assumption -- caught by dedicated verification, not by format checking.
`,

  "revision-notes": `
Planning is how an agent turns a high-level goal into an ordered sequence of steps, either generated fully up front (plan-and-execute), decided continuously one step at a time (ReAct), or expanded hierarchically across sub-goals. It is not a separate module bolted onto an LLM but a specific pattern for structuring the same prompted calls covered in **Agent Fundamentals**, applied specifically to the "plan" stage of the perceive-plan-act-observe loop. The central tradeoff is between predictability (an upfront plan can be inspected, cost-estimated, and reviewed before execution) and adaptiveness (a reactive, step-by-step approach incorporates every new observation immediately, but its total cost is unknowable until the run finishes) — neither is strictly better, and the right choice is genuinely task-dependent.

Least-to-most prompting decomposes a hard problem into an ordered sequence of easier subproblems, solving them in order and feeding each answer forward — it specifically helps when subproblems build on each other, not as a universal accuracy booster. Hierarchical planning expands a top-level plan's sub-goals into their own nested plans only when reached, and earns its added complexity specifically when sub-goals are genuinely heterogeneous in nature, not for uniform flat sequences.

A plan is a hypothesis, not a guarantee: re-planning is the deliberate, designed-for response to a step failing outright, a step's result invalidating a later assumption, or a verification pass flagging the plan. Good re-planning preserves already-completed work and regenerates only the remaining steps, and is bounded by an explicit re-planning attempt limit, independent of the execution step limit, to prevent planning loops. Plan verification/critique — checking a plan's assumptions and completeness before execution, ideally via a separate call or check rather than the same pass that generated it — is the primary defense against the "plausible-but-wrong plan" failure mode: a plan that reads as entirely sensible while still being subtly incorrect.

Production planning systems keep plans short and bounded, prefer structured/schema-validated plan representations over free text, apply mismatch detection after every execution step (not only outright failures), require verification and human review for consequential task types, and log the full plan lifecycle — original plan, every re-planning event and its trigger, and the executed sequence — not just the final answer. Crucially, planning does not repeal the compounding-error arithmetic from **Agent Fundamentals**: each planned step is still a probabilistic decision or fallible tool call, so a planned sequence's overall reliability still compounds multiplicatively across its steps unless verification and reflection specifically recover some of that reliability.

The most durable, transferable skill this page teaches is not any specific planning technique but the disciplined habit of treating every generated plan as a falsifiable hypothesis: building mismatch detection and bounded re-planning as first-class engineering, rather than trusting a plan's plausible appearance as evidence of its correctness. Next stop: **Reflection**, for the general self-critique and verification techniques this page specialized specifically into plan checking.
`,

  "learning-roadmap": `
### Week 1 — Foundations and the core loop distinction
Read Overview through Prerequisites, then Beginner and Intermediate Concepts. Milestone: implement the from-scratch plan-and-execute loop in Beginner Concepts and the ReAct-vs-plan-and-execute comparison from Intermediate Concepts, and be able to explain, in your own words, which one a specific real task would need and why.

### Week 2 — Failure modes and verification
Read Advanced Concepts, Internal Working, Architecture, and Data Flow. Milestone: complete Hands-on Lab 2 (mismatch detection and bounded re-planning), and be able to name and give a concrete example of all three named failure modes: overly rigid plans, planning loops, and plausible-but-wrong plans.

### Week 3 — Production discipline
Read Production Usage through Security, then Testing through Production Checklist. Milestone: complete Hands-on Lab 3 (plan verification and least-to-most decomposition), and produce a production checklist for a planning-based feature of your own choosing, using the Production Checklist section as a template.

### Week 4 — Depth, breadth, and synthesis
Read Common Mistakes through Case Studies, then Comparisons through Future Roadmap. Milestone: complete Hands-on Lab 4 (hierarchical planning with a human-review gate), or one of the Real Projects, and write a one-page design document for a planning-based agent that explicitly states which planning pattern (none, flat, ReAct, hierarchical, least-to-most) fits your chosen task and why, per the decision table in Advanced Concepts.

### Where to go next
Once this page is solid, the natural next stop is **Reflection**, since plan verification and mismatch detection are specialized applications of the general self-critique and verification techniques that skill covers in depth — followed by **Agent Memory** for tracking plan state over long-running tasks, and **LangGraph** or **CrewAI** for representing plans and re-planning as explicit, production-grade structure.
`,

  "official-docs": `
- **ReAct paper (Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models")** — the original formalization of interleaving reasoning traces with tool-calling actions; foundational reading for the ReAct half of this page's core comparison.
- **Least-to-Most Prompting paper (Zhou et al.)** — the original proposal for decomposing a hard problem into ordered, easier subproblems and solving them in sequence; foundational reading for the decomposition technique covered in Intermediate Concepts.
- **LangGraph official documentation** — practical, current documentation for representing plans, sub-goals, and re-planning as an explicit stateful graph; check this for the concrete mechanics behind the architectural ideas in Internal Working and Architecture.
- **CrewAI official documentation** — practical, current documentation for role-based multi-agent orchestration, where a manager/orchestrator role commonly owns planning and delegation.
- **Your LLM provider's own agent/planning cookbook or guide (OpenAI, Anthropic, or similar)** — check for provider-specific structured-output conventions for representing plans, since exact schema mechanics vary by provider and change over time; this page deliberately stays framework- and provider-agnostic on those specifics.

Always check official documentation for current API surface and conventions before treating anything on this page as gospel about a specific provider's or framework's exact interface — this page teaches the durable concepts, not a frozen snapshot of any one tool's syntax.
`,

  books: `
- **"Artificial Intelligence: A Modern Approach" by Stuart Russell and Peter Norvig** — the canonical AI textbook; its treatment of classical planning (STRIPS, HTN planning) is the conceptual ancestor of the LLM-native planning patterns on this page, and worth reading for the formal grounding even though LLM planning is prompted rather than symbolic.
- **"Reinforcement Learning: An Introduction" by Richard Sutton and Andrew Barto** — useful background on how agents that "plan" via learned policies differ from the explicit, natural-language plan artifacts this page focuses on; good contrast reading, not a direct match to LLM planning.
- **Any current, well-reviewed book specifically on building LLM agents (check recent publication dates)** — this is a fast-moving practical area; prefer a recently published, well-reviewed title over an older one, and cross-check any framework-specific claims against that framework's current official documentation.

Honest caveat: dedicated, mature books specifically on LLM agent planning (as opposed to classical AI planning or general agent-building) are still a thin and fast-evolving category as of this page's knowledge cutoff — treat the research papers in that section, and current official framework documentation, as the more reliably up-to-date sources for this specific topic, and use the classical AI textbooks above for durable conceptual grounding rather than current best practice.
`,

  blogs: `
- **The engineering blogs of major agent-framework maintainers (LangChain/LangGraph, CrewAI, and similar)** — these tend to publish concrete, current write-ups of plan-and-execute and re-planning patterns as their frameworks evolve; check post dates and prefer recent ones, since recommended patterns shift with each framework's own maturation.
- **Applied engineering blog posts from teams running production coding agents** — several such teams have published detailed accounts of using test-suite results as a ground-truth re-planning trigger (see Case Studies); high-signal reading for the "prefer ground-truth verification where available" theme running through this page.
- **Posts specifically analyzing failure cases from the 2023 autonomous-agent demo wave** — useful, high-signal reading for concrete, real examples of the overly-rigid-plan and planning-loop failure modes this page names, grounding the abstract failure-mode descriptions in actual incident write-ups.

Prefer engineering-team blog posts with concrete before/after metrics and named failure cases over general "how to prompt an agent to plan" listicles, which tend to overclaim a single technique's reliability without the hedging this topic genuinely warrants.
`,

  "research-papers": `
This is a genuinely active research area, and the following are real, foundational papers directly relevant to this page's core topics — treat this as the closest solid foundational reading rather than an exhaustive or fully current survey, and check for more recent work building on these before assuming they represent the current state of the art:

- **"ReAct: Synergizing Reasoning and Acting in Language Models" (Yao et al., 2022)** — the foundational paper formalizing interleaved reasoning-and-acting, directly underlying this page's ReAct coverage.
- **"Least-to-Most Prompting Enables Complex Reasoning in Large Language Models" (Zhou et al., 2022)** — the foundational paper on decomposing a hard problem into ordered, easier subproblems, directly underlying this page's least-to-most coverage.
- **"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (Wei et al., 2022)** — not a planning paper per se, but the closely related precursor work establishing that asking a model to reason step by step improves multi-step task performance, which planning techniques build on and extend.
- **Foundational classical AI planning literature (STRIPS-style formalisms, hierarchical task network planning)**, as surveyed in Russell and Norvig's textbook — the conceptual ancestor of this page's hierarchical planning coverage, predating LLMs but establishing the sub-goal decomposition idea this page adapts.

Honest caveat: LLM-native research specifically on plan verification/self-critique, re-planning trigger design, and hierarchical planning for agents continues to evolve rapidly, and this page's knowledge cutoff means more recent work than what is listed above almost certainly exists — treat this list as a solid starting point for foundational understanding, not a current, exhaustive bibliography, and search for recent work before citing any specific claimed result as current best practice.
`,

  videos: `
- **Conference talks from the authors of the ReAct and Least-to-Most Prompting papers** (where available on the usual academic conference video platforms) — hearing the original authors walk through their own motivating examples is generally higher-signal than a third-party summary.
- **Framework-maintainer conference talks and official YouTube channels for LangGraph and CrewAI** — look for talks specifically covering plan representation, re-planning, and multi-agent orchestration design decisions, since these tend to be more current and framework-accurate than general third-party tutorials.
- **Recorded engineering talks from teams describing production agent incidents** (search for talks on "agent reliability," "autonomous agent failure modes," or similar from major AI engineering conferences) — useful for grounding this page's failure-mode discussion in concrete, narrated real-world examples.

As with Blogs above, prefer talks given by people who built and operated a real planning-based system over general explainer content, and check upload dates given how quickly recommended patterns in this space evolve.
`,

  "github-repos": `
- **LangGraph (official repository)** — graph-based orchestration framework; study its examples for explicit plan/state representation and conditional re-planning edges, directly relevant to Architecture and Internal Working above.
- **CrewAI (official repository)** — role-based multi-agent framework; study its manager/orchestrator patterns for how planning and delegation are represented across sub-agents.
- **Reference/example implementations of ReAct-style agent loops** (search major agent-framework repositories for "ReAct" examples) — useful for comparing a from-scratch loop like this page's Beginner Concepts example against a framework's production-grade version.
- **Reference/example implementations of plan-and-execute agents** (search major agent-framework repositories for "plan and execute" or "planner" examples) — useful for seeing how a real framework structures plan generation, execution, and re-planning as distinct, composable components.
- **Repositories implementing or evaluating least-to-most prompting** (often found alongside academic paper reproductions) — useful for seeing the decomposition technique implemented directly against a benchmark, rather than only described in the paper.
- **Repositories dedicated to agent evaluation harnesses** (general agent-evaluation tooling, not planning-specific) — useful for adapting general agent-evaluation methodology to measure plan quality and re-planning outcomes specifically, per the Testing and Coding Questions sections above.

Check each repository's activity and last-updated date before relying on it as representative of current best practice — this remains a fast-moving space, and a repository that was state-of-the-art two years ago may reflect since-superseded conventions.
`,

  "practice-problems": `
Ordered by the skill they primarily exercise, building from the Coding Questions above:

1. **Plan-length sanity checker** — write a function that rejects a generated plan if it exceeds a configurable maximum step count, and returns a clear reason. Exercises: the plan-length guardrail from Best Practices and Production Checklist.
2. **Mismatch-detection rule engine** — given a small set of step "expected outcome" descriptions and actual results, implement a rule-based (non-LLM) mismatch checker for at least three concrete precondition types (a value equals X, a status is one of a set of allowed values, a numeric threshold is not exceeded). Exercises: preferring ground-truth checks over LLM-judged mismatch detection, per Performance and Case Studies.
3. **Bounded re-planner with progress preservation** — extend Coding Question 1's implementation to explicitly unit-test that completed steps are never re-executed after a re-plan, and that the re-planning attempt counter is correctly incremented and enforced. Exercises: the re-planning attempt limit and progress-preservation best practices.
4. **Planning-loop detector** — extend Coding Question 3's has_repeated_failure_loop-style function (from **Agent Fundamentals**) into a planning-specific version that detects when the last N re-planning triggers were effectively identical, and returns a recommendation to escalate rather than continue. Exercises: the planning-loop failure mode from Advanced Concepts.
5. **Least-to-most vs single-pass comparison harness** — build a small evaluation script that runs the same set of compositional problems through both a least-to-most decomposition approach and a single-pass chain-of-thought attempt, and reports accuracy for each. Exercises: honest, measured evaluation of when decomposition helps, per Case Studies and the hedged tone of this page.
6. **External practice set**: search for "agent planning benchmark" or "multi-step task planning evaluation" datasets from recent academic agent-evaluation research, and adapt a handful of tasks from such a set to test your own plan-and-execute implementation end to end.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Input
        Goal["High-level goal"]
    end

    subgraph Planning
        Planner["Planner\n(LLM: goal -> ordered plan)"]
        Verifier["Verifier / critic\n(checks plan before execution)"]
        HumanReview["Human review gate\n(for consequential tasks)"]
    end

    subgraph Execution
        Executor["Executor\n(runs each step in order)"]
        ToolLayer["Tool execution layer\n(search, DB, code exec, internal APIs)"]
        Mismatch["Mismatch detector\n(ground-truth checks preferred)"]
    end

    subgraph Recovery
        Replanner["Re-planner\n(regenerates remaining steps)"]
        Budget["Re-planning attempt\nlimit enforcement"]
        Escalate["Escalation / graceful failure"]
    end

    subgraph StateLayer["Cross-cutting state"]
        Memory[("Plan / progress memory")]
        Logs[("Full plan-lifecycle log")]
    end

    Goal --> Planner
    Planner --> Verifier
    Verifier -->|flagged| Planner
    Verifier -->|approved, consequential| HumanReview
    Verifier -->|approved, low-stakes| Executor
    HumanReview -->|approved| Executor
    HumanReview -->|rejected| Planner
    Executor --> ToolLayer
    ToolLayer --> Mismatch
    Mismatch -->|matches assumption| Executor
    Mismatch -->|mismatch detected| Replanner
    Replanner --> Budget
    Budget -->|under limit| Verifier
    Budget -->|limit reached| Escalate
    Executor <--> Memory
    Planner <--> Logs
    Replanner <--> Logs
    Executor -->|all steps complete| FinalAnswer["Final answer"]
~~~

This diagram represents a reference production architecture for a planning-based agent: planning and verification are separated from execution, re-planning is a bounded, monitored recovery path rather than an unbounded retry loop, and plan/progress state and full lifecycle logging are cross-cutting concerns feeding every stage rather than being bolted on only at the end.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Planning))
    Core Patterns
      Plan-and-execute
      ReAct (interleaved)
      Least-to-most prompting
      Hierarchical planning
    Lifecycle
      Plan generation
      Verification / critique
      Execution
      Mismatch detection
      Re-planning
    Tradeoffs
      Predictability vs adaptiveness
      Cost known upfront vs unknown until done
      Flat vs hierarchical decomposition depth
    Failure Modes
      Overly rigid plans
      Planning loops
      Plausible-but-wrong plans
      Over/under-decomposition
    Production Concerns
      Plan-length limits
      Re-planning attempt limits
      Structured plan schemas
      Human review for consequential plans
      Full plan-lifecycle logging
    Sibling Skills
      Agent Fundamentals
      Reflection
      Agent Memory
      Tool Calling
      LangGraph
      CrewAI
~~~
`,
};

export default planning;
