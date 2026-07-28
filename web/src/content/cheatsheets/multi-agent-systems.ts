import type { CheatSheetData } from "./types";

const multiAgentSystems: CheatSheetData = {
  title: "The Ultimate Multi-Agent Systems Cheat Sheet",
  subtitle: "Topologies, message passing, coordination, failure modes, evaluation, and production guardrails",
  sections: [
    {
      title: "Core Topologies",
      color: "violet",
      rows: [
        { term: "Orchestrator-worker", desc: "Coordinator decomposes task, fans out to independent workers, aggregates", code: "orchestrator.decompose(task)\n-> dispatch(workers)\n-> aggregate(results)" },
        { term: "Hierarchical", desc: "Nested orchestrator-worker: manager delegates to sub-managers to agents", code: "manager -> sub_manager -> worker\n# more nesting = more indirection, harder tracing" },
        { term: "Peer-to-peer / debate", desc: "Agents address each other directly, often iterating propose-critique-revise", code: "proposal = propose(q)\nfor round in range(MAX_ROUNDS):\n    critique = critic(proposal)\n    if approved(critique): break\n    proposal = revise(proposal, critique)" },
        { term: "Blackboard", desc: "Agents read/write shared state; no direct messaging; coordination emerges", code: "board.post(key, value)\nboard.needs(key)  # signals an open question" },
        { term: "Default choice", desc: "Start with ONE agent; add agents only once a golden-set gap is measured", code: "# prototype single_agent(task) first\n# compare quality/cost vs multi-agent before committing" },
        { term: "Topology decision rule", desc: "Match the shape to the problem, don't force one pattern everywhere", code: "known decomposition -> orchestrator-worker\nnested sub-problems -> hierarchical\ngenuine disagreement -> debate\nunknown contributors -> blackboard" },
        { term: "Chain (simplest form)", desc: "Fixed sequence, each stage's output feeds the next", code: "result = writer(researcher(topic))" },
      ],
    },
    {
      title: "Message Passing & Handoffs",
      color: "blue",
      rows: [
        { term: "Structured message schema", desc: "Never pass raw free text when the receiver needs specific fields", code: "class AgentMessage(BaseModel):\n    sender: str\n    task_id: str\n    content: str\n    structured_payload: dict | None = None" },
        { term: "output_pydantic handoff", desc: "Validate a worker's output before it becomes another agent's input", code: "class Findings(BaseModel):\n    developments: list[str]\n    sources: list[str]\nFindings.model_validate_json(worker_output)" },
        { term: "Context trimming", desc: "Pass only the structured subset a downstream agent needs, not full raw output", code: "# large unfiltered context dilutes attention and costs more tokens" },
        { term: "A2A Protocol", desc: "Standardized wire format for CROSS-ORGANIZATION agent-to-agent delegation", code: "agent_card = fetch('/.well-known/agent.json')\n# Task states: submitted -> working -> input-required -> completed" },
        { term: "MCP vs A2A boundary", desc: "MCP = agent-to-tool/data; A2A = agent-to-agent", code: "# one agent is often both an MCP client AND an A2A server/client" },
        { term: "Internal vs external protocol", desc: "Lightweight schema in-process; A2A only at org/vendor boundaries", code: "# don't reach for a heavyweight external protocol for in-process calls" },
      ],
    },
    {
      title: "Coordination & Consensus",
      color: "emerald",
      rows: [
        { term: "Decomposition", desc: "Breaking a task into sub-tasks -- the single highest-leverage design step", code: "# a bad decomposition dominates every other quality lever" },
        { term: "Concurrent fan-out", desc: "Dispatch independent sub-tasks at once, bounded by a semaphore", code: "semaphore = asyncio.Semaphore(5)\nasync def bounded(fn):\n    async with semaphore:\n        return await asyncio.wait_for(fn(), timeout=15)\nresults = await asyncio.gather(*(bounded(w) for w in workers))" },
        { term: "Majority vote", desc: "Sample N independent answers, pick the most common", code: "from collections import Counter\nCounter(normalize(a) for a in answers).most_common(1)" },
        { term: "Semantic clustering vote", desc: "Cluster near-duplicate open-ended answers before voting", code: "if similarity_fn(a, cluster[0]) >= 0.85:\n    cluster.append(a)  # then pick largest cluster" },
        { term: "Judge / arbiter model", desc: "An LLM picks the best of several candidate outputs", code: "best = judge_llm(candidates, rubric)" },
        { term: "Manager delegation", desc: "Manager reads agent capabilities, assigns/reviews work dynamically", code: "plan = manager_llm(task, available_workers)\nchosen = parse_worker_choices(plan)" },
        { term: "Aggregation step", desc: "Synthesize, vote, or merge multiple worker outputs into one result", code: "final = synthesize_llm('\\n\\n'.join(worker_outputs))" },
      ],
    },
    {
      title: "Failure Modes",
      color: "amber",
      rows: [
        { term: "Deadlock", desc: "Circular wait -- A delegates to B, B delegates back to A, neither proceeds", code: "# fix: keep delegation edges a DAG; detect cycles at design time" },
        { term: "Cycle detection (DFS)", desc: "Detect a delegation cycle in the topology graph before runtime", code: "WHITE, GRAY, BLACK = 0, 1, 2\n# standard 3-color DFS cycle check on the delegation adjacency list" },
        { term: "Livelock", desc: "Active work with no convergence -- endless debate/revision loop", code: "# fix: positive stop condition + HARD round cap, always both" },
        { term: "Round cap pattern", desc: "Hard backstop even when the approval signal is inconsistent", code: "for i in range(MAX_ROUNDS):\n    if approved: break\nelse:\n    log.warning('hit max_rounds without convergence')" },
        { term: "Redundant work", desc: "Overlapping agent roles both independently doing the same sub-task", code: "# audit: could either agent plausibly claim this task? tighten roles" },
        { term: "Runaway delegation cost", desc: "Unbounded fan-out/delegation burns tokens with no stopping point", code: "# fix: max_iter, max_execution_time, wall-clock budget on WHOLE pipeline" },
        { term: "Worker timeout with no fallback", desc: "One hung worker silently blocks the entire fan-out", code: "try:\n    r = await asyncio.wait_for(worker(), timeout=T)\nexcept asyncio.TimeoutError:\n    r = degraded_fallback()" },
        { term: "Non-transactional runs", desc: "Earlier agents may succeed (and cost money) before a later one fails", code: "try:\n    result = run_pipeline(task)\nexcept Exception as e:\n    raise RuntimeError(f'Pipeline failed: {e}') from e" },
      ],
    },
    {
      title: "Evaluation & Debugging",
      color: "rose",
      rows: [
        { term: "Three evaluation levels", desc: "Per-agent, handoff, whole-pipeline -- never only the first", code: "# a system can pass 1+2 and still fail 3 if decomposition/aggregation is wrong" },
        { term: "Golden-set eval at pipeline level", desc: "Score the FINAL assembled output, not just individual agents", code: "assert final_output_matches_expected(result, golden_example)" },
        { term: "Structural assertions only", desc: "Never assert exact LLM text; assert schema/shape/required fields", code: "assert result is not None\nassert ResponseSchema.model_validate(result)" },
        { term: "Inspect earlier stages first", desc: "A wrong final answer often traces to decomposition or a lossy handoff", code: "for stage_output in pipeline_trace:\n    print(stage_output.agent, stage_output.raw[:200])" },
        { term: "Shared correlation id", desc: "Log task_id through every agent and every hop from day one", code: "logger.info('agent_hop', task_id=tid, from_agent=a, to_agent=b)" },
        { term: "Per-agent metrics", desc: "Track cost/latency per agent role, not just whole-pipeline aggregates", code: "AGENT_LATENCY.labels(agent_role=role).observe(duration_seconds)" },
        { term: "Delegation loop detection", desc: "Count repeated from/to agent pairs in the trace to spot livelock", code: "Counter((e['from_agent'], e['to_agent']) for e in trace)" },
        { term: "Agent-count regression test", desc: "Catch silent pipeline growth (delegation creep) in CI", code: "assert len(crew.agents) <= EXPECTED_MAX_AGENTS" },
      ],
    },
    {
      title: "Security & Production",
      color: "cyan",
      rows: [
        { term: "Injection propagation", desc: "Treat every inter-agent handoff as untrusted, not just first retrieval", code: "# injected content in worker A output can reach worker B via context" },
        { term: "Least-privilege tool scoping", desc: "Each agent gets only the tools its role needs -- security boundary", code: "researcher = Agent(tools=[search_tool])   # NOT every tool" },
        { term: "Rate limit by pipeline multiplier", desc: "Size auth/rate limits to N agents' worth of LLM calls per request", code: "# a 5-agent pipeline endpoint needs ~5x single-agent quota headroom" },
        { term: "Async job queue for long runs", desc: "Long/hierarchical pipelines don't fit a sync request/response API", code: "POST /runs -> {run_id, status: queued}\nGET /runs/{id} -> poll for result" },
        { term: "Wall-clock pipeline budget", desc: "Cap the WHOLE run, not only individual agent timeouts", code: "await asyncio.wait_for(run_pipeline(task), timeout=120)" },
        { term: "Human-in-the-loop checkpoint", desc: "Explicit approval gate at the highest-consequence action points", code: "if action.is_irreversible: await request_human_approval(action)" },
        { term: "Health checks", desc: "readyz verifies LLM providers and any remote (A2A) agents reachable", code: "GET /healthz -> process alive\nGET /readyz  -> deps reachable" },
        { term: "Framework fit cheat", desc: "Pick based on control-flow needs, not popularity", code: "LangGraph -> hand-wired graphs/cycles\nCrewAI -> role-based sequential/hierarchical\nAutoGen -> open-ended conversation" },
      ],
    },
  ],
};

export default multiAgentSystems;
