import type { CheatSheetData } from "./types";

const crewai: CheatSheetData = {
  title: "The Ultimate CrewAI Cheat Sheet",
  subtitle: "Agents, tasks, processes, delegation, tool scoping, Flows, and production guardrails",
  sections: [
    {
      title: "Core Primitives & Setup",
      color: "violet",
      rows: [
        { term: "Agent", desc: "Role/goal/backstory define its system prompt and behavior", code: "from crewai import Agent\nagent = Agent(role='Senior Research Analyst',\n  goal='Find accurate sourced facts', backstory='You cite everything.')" },
        { term: "role", desc: "Anchors perspective and vocabulary the agent reaches for", code: "role='Technical Writer'" },
        { term: "goal", desc: "Explicit objective the agent optimizes outputs against", code: "goal='Turn research into a clear 300-word article'" },
        { term: "backstory", desc: "Shapes tone, caution level, implicit priorities", code: "backstory='You write for a time-pressed technical audience.'" },
        { term: "Task", desc: "Unit of work: description, expected_output, assigned agent", code: "from crewai import Task\ntask = Task(description='Research {topic}',\n  expected_output='5 bullets with sources', agent=agent)" },
        { term: "expected_output", desc: "Real success criterion injected into prompt, not decoration", code: "expected_output='A bulleted list of exactly 5 items, each under 40 words'" },
        { term: "Crew", desc: "Composes agents + tasks under a process", code: "from crewai import Crew, Process\ncrew = Crew(agents=[a1, a2], tasks=[t1, t2],\n  process=Process.sequential)" },
        { term: "kickoff", desc: "Runs the crew with interpolated inputs", code: "result = crew.kickoff(inputs={'topic': 'small language models'})" },
        { term: "LLM per agent", desc: "Set model, temperature, and timeout explicitly", code: "from crewai import LLM\nLLM(model='gpt-4o-mini', temperature=0.2, timeout=30)" },
      ],
    },
    {
      title: "Processes & Delegation",
      color: "blue",
      rows: [
        { term: "Process.sequential", desc: "Fixed task order — cheaper, predictable, default choice", code: "Crew(process=Process.sequential, ...)" },
        { term: "Process.hierarchical", desc: "Manager agent dynamically plans/assigns tasks", code: "Crew(process=Process.hierarchical,\n  manager_llm=LLM(model='gpt-4o'), ...)" },
        { term: "context=[...]", desc: "Explicitly threads a prior task's output forward", code: "writing_task = Task(..., context=[research_task])" },
        { term: "allow_delegation", desc: "Lets an agent hand sub-work to another agent mid-run", code: "Agent(..., allow_delegation=True)  # default: keep OFF" },
        { term: "Delegation default", desc: "Off by default; enable per agent with identified need only", code: "# broad always-on delegation = leading cause of runaway cost" },
        { term: "Manager agent role", desc: "Reads agent role descriptions, assigns/reviews work", code: "# hierarchical adds its own planning/review LLM calls" },
        { term: "Decision rule", desc: "Sequential when order is knowable; hierarchical when it isn't", code: "# default to sequential unless you have a concrete reason not to" },
        { term: "Flows", desc: "Deterministic event/state layer composing crews + plain code", code: "from crewai.flow.flow import Flow, listen, start\nclass MyFlow(Flow):\n    @start()\n    def step_one(self): ..." },
      ],
    },
    {
      title: "Tools, Structure & Memory",
      color: "emerald",
      rows: [
        { term: "Per-agent tool scoping", desc: "Attach tools to the agent whose role needs them, least privilege", code: "from crewai_tools import SerperDevTool\nAgent(..., tools=[SerperDevTool()])" },
        { term: "output_pydantic", desc: "Validated structured output for reliable inter-task handoff", code: "class Findings(BaseModel):\n    developments: list[str]\n    sources: list[str]\nTask(..., output_pydantic=Findings)" },
        { term: "output_json", desc: "Raw JSON-schema-validated output, alternative to Pydantic", code: "Task(..., output_json=SomeSchema)" },
        { term: "Crew memory", desc: "Shares recalled facts/entities across the whole crew run", code: "Crew(..., memory=True)" },
        { term: "max_iter", desc: "Caps an agent's internal reasoning/tool loop", code: "Agent(..., max_iter=6)" },
        { term: "max_execution_time", desc: "Wall-clock cap per agent execution", code: "Agent(..., max_execution_time=120)" },
        { term: "Async kickoff", desc: "Run independent tasks/crews concurrently", code: "result = await crew.kickoff_async(inputs={...})" },
        { term: "verbose=True", desc: "Surfaces intermediate reasoning and tool calls for debugging", code: "Agent(..., verbose=True)\nCrew(..., verbose=True)" },
      ],
    },
    {
      title: "Failure Modes & Debugging",
      color: "amber",
      rows: [
        { term: "Agents talking past each other", desc: "Usually underspecified expected_output or missing context", code: "# fix: tighten expected_output, add output_pydantic" },
        { term: "Redundant work", desc: "Overlapping agent roles both doing the same sub-task", code: "# audit: could either agent plausibly claim this task?" },
        { term: "Runaway task loops", desc: "Unbounded delegation or endless manager revision requests", code: "# fix: max_iter, max_execution_time, disable allow_delegation" },
        { term: "Inspect tasks_output first", desc: "Debug retrieval-style: check earlier tasks before the LLM/prompt", code: "for t in result.tasks_output:\n    print(t.agent, t.raw[:200])" },
        { term: "Missing context bug", desc: "Downstream task lacks info an earlier task produced", code: "# check: did you declare context=[upstream_task]?" },
        { term: "Non-transactional runs", desc: "Earlier tasks may succeed (and cost money) before a later one fails", code: "try:\n    result = crew.kickoff(...)\nexcept Exception as e:\n    raise RuntimeError(f'Crew failed: {e}') from e" },
        { term: "Delegation loop detection", desc: "Count from_agent/to_agent pairs in the verbose trace", code: "from collections import Counter\nCounter((e['from_agent'], e['to_agent'])\n  for e in trace if e['type']=='delegation')" },
        { term: "Crew size creep", desc: "Track task/agent count over time to catch silent growth", code: "log.info('crew_shape', num_agents=len(crew.agents),\n  num_tasks=len(crew.tasks))" },
      ],
    },
    {
      title: "Comparisons & When to Use What",
      color: "rose",
      rows: [
        { term: "CrewAI vs single agent", desc: "Only decompose once a single well-tooled agent is a proven limit", code: "# compare quality + cost/latency on a golden set first" },
        { term: "CrewAI vs LangGraph", desc: "Declarative role/task/process vs explicit hand-wired graph", code: "# LangGraph wins on precise branching/state control" },
        { term: "CrewAI vs AutoGen", desc: "Task-assigned roles vs conversation-driven multi-agent chat", code: "# AutoGen wins for genuinely open-ended debate/discussion" },
        { term: "CrewAI vs OpenAI Agents SDK", desc: "Higher-level opinionated framework vs minimal native primitives", code: "# Agents SDK wins when you want the lightest abstraction" },
        { term: "Cost multiplier", desc: "N tasks = roughly N additional full LLM round trips", code: "# a 5-task hierarchical crew can cost/take 5x+ a single call" },
        { term: "Golden-set justification", desc: "Never ship a crew on pattern-popularity alone", code: "# prove crew_quality > single_agent_quality on a labeled set" },
        { term: "Hedge honestly", desc: "No framework here is definitively superior — fast-moving space", code: "# prototype simplest option first, add machinery only when justified" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Small, focused crews", desc: "Compose via Flows/plain code, not one giant delegation-heavy crew", code: "research_crew.kickoff(...); writing_crew.kickoff(...)" },
        { term: "Sync vs async serving", desc: "Short sequential crews sync; long/hierarchical crews async job queue", code: "# celery/async worker + polling or webhook result delivery" },
        { term: "Per-task usage logging", desc: "Log tokens/latency per task, not just crew totals", code: "log.info('crew_run', num_tasks=len(result.tasks_output),\n  tokens=result.token_usage)" },
        { term: "Health checks", desc: "readyz verifies LLM + tool APIs reachable before serving", code: "GET /healthz -> process alive\nGET /readyz  -> LLM/tool deps reachable" },
        { term: "Rate limit/auth crew endpoints", desc: "Size limits to the crew's LLM-call multiplier, not single-agent baseline", code: "# a 5-task crew endpoint needs ~5x the quota headroom" },
        { term: "Testing doctrine", desc: "Structural/golden-set assertions only, never exact-text asserts", code: "assert result is not None\nassert len(str(result)) > 0" },
        { term: "Least-privilege tools", desc: "Security boundary, not just organization — scope per agent", code: "# a writer agent should never hold a send-email or exec-SQL tool" },
        { term: "Injection propagation", desc: "Treat tool output as untrusted at every hop, not just first retrieval", code: "# injected content in researcher output can reach writer via context" },
        { term: "Production checklist habit", desc: "Justify multi-agent design in writing before shipping", code: "# 'why did this need >1 agent' documented in the README" },
      ],
    },
  ],
};

export default crewai;
