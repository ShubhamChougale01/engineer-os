import type { CheatSheetData } from "./types";

const toolCalling: CheatSheetData = {
  title: "Tool Calling",
  subtitle: "Native function calling: schemas, execution loops, and action-level safety",
  sections: [
    {
      title: "Tool Schema",
      color: "violet",
      rows: [
        { term: "Structure", desc: "name, description, typed parameters (JSON Schema)" },
        { term: "Clear & distinct", desc: "The primary signal driving correct tool selection" },
        { term: "Native calling", desc: "Structured, machine-parseable — not free-form text parsing" },
      ],
    },
    {
      title: "Reliability vs. Selection Accuracy",
      color: "blue",
      rows: [
        { term: "Mechanical reliability", desc: "Native calling: output is structurally well-formed" },
        { term: "Selection accuracy", desc: "Separate problem — did it pick the RIGHT tool with RIGHT args" },
        { term: "Neither solves the other", desc: "Both need distinct engineering attention" },
      ],
    },
    {
      title: "Execution Loop",
      color: "emerald",
      rows: [
        { term: "Validate first", desc: "Check args against schema BEFORE execution" },
        { term: "Feed errors back", desc: "As an observation — completes the plan-act-observe loop" },
        { term: "Bound iterations", desc: "Agent Fundamentals' loop-safety guidance, always" },
      ],
    },
    {
      title: "Parallel Tool Calls",
      color: "amber",
      rows: [
        { term: "Use when", desc: "Genuinely independent info needs — fan out in one turn" },
        { term: "Don't use when", desc: "A later call's args depend on an earlier call's result" },
      ],
    },
    {
      title: "Security",
      color: "rose",
      rows: [
        { term: "Guardrails on EVERY call", desc: "Not just ones assumed risky in advance" },
        { term: "Risk-tier tools", desc: "Human-in-the-loop gate for high-risk (irreversible) actions" },
        { term: "Untrusted tool results", desc: "A compromised result can carry a prompt-injection attempt" },
        { term: "Least privilege", desc: "Limit each tool's own permissions to the minimum needed" },
      ],
    },
    {
      title: "Scaling",
      color: "cyan",
      rows: [
        { term: "Selection degrades with scale", desc: "Too many flat options confuse the model" },
        { term: "Hierarchical grouping", desc: "Category selection, then tool selection within it" },
        { term: "Foreshadows", desc: "MCP — standardized tool discovery at large scale" },
      ],
    },
  ],
};

export default toolCalling;
