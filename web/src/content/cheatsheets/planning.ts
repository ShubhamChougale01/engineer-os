import type { CheatSheetData } from "./types";

const planning: CheatSheetData = {
  title: "The Ultimate Agent Planning Cheat Sheet",
  subtitle: "Task decomposition · plan-and-execute vs ReAct · hierarchical planning · re-planning · pitfalls",
  sections: [
    {
      title: "Core Planning Patterns",
      color: "violet",
      rows: [
        { term: "Task decomposition", desc: "Break a high-level goal into an ordered sequence of concrete steps", code: "plan = llm.generate('List steps to accomplish: {goal}')" },
        { term: "Plan-and-execute", desc: "Generate the full plan upfront, then execute steps one by one", code: "plan = make_plan(goal)\nfor step in plan: execute(step)" },
        { term: "Interleaved (ReAct-style)", desc: "Reason about the next single step, act, observe, repeat", code: "thought = reason(state)\naction = act(thought)\nstate = observe(action)" },
        { term: "Least-to-most prompting", desc: "Solve easier sub-problems first, use results to solve harder ones", code: "'First list sub-problems from easiest to hardest, then solve in order.'" },
        { term: "Hierarchical planning", desc: "Decompose into sub-goals, each of which has its own sub-plan", code: "goal -> [subgoal_1, subgoal_2]\nsubgoal_1 -> [step_a, step_b]" },
      ],
    },
    {
      title: "Upfront vs. Reactive Tradeoffs",
      color: "blue",
      rows: [
        { term: "Upfront planning: pros", desc: "Predictable step count, easier to review/approve before execution", code: "# good for high-stakes actions needing human sign-off" },
        { term: "Upfront planning: cons", desc: "Brittle when the world doesn't match assumptions made at plan time", code: "# a step failing invalidates the rest of a rigid plan" },
        { term: "Reactive/interleaved: pros", desc: "Adapts as new information arrives at each step", code: "# good for exploratory or uncertain environments" },
        { term: "Reactive/interleaved: cons", desc: "Harder to predict total cost/latency/step count in advance", code: "# no upfront bound on how many LLM calls will be made" },
        { term: "Hybrid pattern", desc: "Coarse upfront plan + fine-grained reactive execution per step", code: "plan = coarse_plan(goal)\nfor step in plan: react_loop(step)" },
      ],
    },
    {
      title: "Re-planning",
      color: "emerald",
      rows: [
        { term: "Re-plan on failure", desc: "When a step fails, regenerate the remaining plan instead of aborting", code: "if step_failed: plan = replan(goal, completed_steps, error)" },
        { term: "Re-plan on new information", desc: "Incorporate new facts discovered mid-execution", code: "if new_info_changes_assumptions: plan = replan(goal, new_info)" },
        { term: "Bounded re-planning", desc: "Cap the number of re-plan attempts to avoid infinite loops", code: "max_replans = 3\nif replan_count >= max_replans: escalate_to_human()" },
        { term: "Plan diffing", desc: "Compare new plan to old plan to understand what changed and why", code: "diff = compare_plans(old_plan, new_plan)" },
      ],
    },
    {
      title: "Plan Verification",
      color: "amber",
      rows: [
        { term: "Plan critique before execution", desc: "Have a separate pass (or model) review the plan for obvious flaws", code: "critique = llm.critique(plan)\nif critique.has_issues: plan = revise(plan, critique)" },
        { term: "Precondition checks", desc: "Verify a step's assumptions hold before executing it", code: "if not precondition_met(step): replan()" },
        { term: "Dry-run / simulation", desc: "Simulate a plan's effects before taking real-world actions", code: "simulate(plan)  # check for destructive/irreversible steps" },
        { term: "Human approval gate", desc: "Require sign-off on plans with high-stakes or irreversible steps", code: "if plan.has_irreversible_step: await human_approval(plan)" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Overly rigid plans", desc: "Break on unexpected input because they can't adapt mid-execution", code: "# always include a re-planning path, not just a fixed script" },
        { term: "Planning loops", desc: "Plan -> fail -> re-plan -> fail -> re-plan with no forward progress", code: "# cap re-plan attempts; escalate instead of looping forever" },
        { term: "Plausible-looking wrong plans", desc: "A plan can look reasonable step-by-step yet be subtly incorrect", code: "# validate against ground truth / test on a sample before trusting" },
        { term: "No cost/latency bound", desc: "Reactive planning without step or token caps can blow up cost", code: "MAX_STEPS = 10\nMAX_TOKENS = 5000" },
        { term: "Ignoring partial progress on failure", desc: "Discarding completed steps and starting over wastes work", code: "plan = replan(goal, completed_steps=done_so_far)" },
      ],
    },
    {
      title: "Related Skills",
      color: "cyan",
      rows: [
        { term: "Agent Fundamentals", desc: "Planning is one core capability within the broader agent loop", code: "# perceive -> plan -> act -> observe" },
        { term: "Reflection", desc: "Self-critique of outputs, often paired with re-planning on failure", code: "# reflection critiques output; planning decides next steps" },
        { term: "LangGraph", desc: "Graph-based state machines are a common substrate for plan execution", code: "# conditional edges implement re-planning branches" },
        { term: "Tool Calling", desc: "Plan steps are usually executed as tool/function calls", code: "# each planned step maps to one or more tool invocations" },
        { term: "Agent Memory", desc: "Past plan outcomes inform future planning decisions", code: "# retrieve prior similar-task plans before generating a new one" },
      ],
    },
  ],
};

export default planning;
