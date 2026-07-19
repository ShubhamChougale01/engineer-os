import type { CheatSheetData } from "./types";

const agentsFundamentals: CheatSheetData = {
  title: "Agent Fundamentals",
  subtitle: "The plan-act-observe loop, tool use, and autonomy levels",
  sections: [
    {
      title: "The Agent Loop",
      color: "violet",
      rows: [
        { term: "Plan", desc: "Decide the next action based on accumulated context", code: "reasoning step" },
        { term: "Act", desc: "Invoke a tool: search, calculation, code execution, API call", code: "tool_call()" },
        { term: "Observe", desc: "Examine the tool's result, append to context" },
        { term: "Repeat", desc: "Loop until the agent's own judgment says the task is done" },
        { term: "Why needed", desc: "A single LLM call can't access current info, take real actions, or iteratively refine" },
      ],
    },
    {
      title: "Tool Use",
      color: "blue",
      rows: [
        { term: "Tool", desc: "External function/API the agent can invoke", code: "get_weather(loc)" },
        { term: "Structured calling", desc: "Prefer explicit, typed tool interfaces over prompt-based parsing" },
        { term: "Untrusted results", desc: "Validate/sanitize tool outputs fed back into context (injection risk)" },
        { term: "Least privilege", desc: "Grant only the tool permissions genuinely needed for the task" },
      ],
    },
    {
      title: "Autonomy Spectrum",
      color: "amber",
      rows: [
        { term: "Fully human-supervised", desc: "Every step requires explicit approval — max safety, min speed" },
        { term: "Human-in-the-loop", desc: "Autonomous for low-risk, pauses for high-risk actions" },
        { term: "Fully autonomous", desc: "No human checkpoint — max speed, max risk" },
        { term: "Calibration rule", desc: "Match autonomy to genuine task stakes, never maximize by default" },
      ],
    },
    {
      title: "Compounding Risk",
      color: "rose",
      rows: [
        { term: "Compounding hallucination", desc: "An early wrong conclusion becomes context for every later step" },
        { term: "Checkpoint verification", desc: "Verify intermediate conclusions, not just final output" },
        { term: "Traceability", desc: "Root-causing a bad result requires the FULL trajectory, not the final answer" },
      ],
    },
    {
      title: "Loop Safety",
      color: "emerald",
      rows: [
        { term: "Max iteration count", desc: "Non-negotiable safety net against runaway/unproductive loops" },
        { term: "Termination condition", desc: "Agent's own completion judgment + a hard iteration ceiling" },
        { term: "Context growth", desc: "Each iteration adds to context — watch for context-window limits" },
      ],
    },
    {
      title: "Multi-Agent & History",
      color: "cyan",
      rows: [
        { term: "Multi-agent decomposition", desc: "Split genuinely independent sub-tasks across specialized agents" },
        { term: "Benefit", desc: "Specialization + parallelization vs. one generalist agent sequentially" },
        { term: "ReAct (2022)", desc: "Yao et al. — reasoning interleaved with actions; foundation of all agent frameworks" },
        { term: "AutoGPT (2023)", desc: "Showed both agentic potential and real limits of unsupervised autonomy" },
      ],
    },
  ],
};

export default agentsFundamentals;
