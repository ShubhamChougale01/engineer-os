import type { CheatSheetData } from "./types";

const crewai: CheatSheetData = {
  title: "CrewAI",
  subtitle: "Role-based multi-agent teams: agents, tasks, crews, and processes",
  sections: [
    {
      title: "Core Abstractions",
      color: "violet",
      rows: [
        { term: "Agent", desc: "role + goal + backstory shape its prompt/behavior", code: "Agent(role, goal, backstory)" },
        { term: "Task", desc: "A unit of work with an expected output", code: "Task(description, expected_output, agent=...)" },
        { term: "Crew", desc: "Bundles agents + tasks under a process" },
        { term: "kickoff()", desc: "Run the crew end-to-end", code: "crew.kickoff(inputs={...})" },
      ],
    },
    {
      title: "Process Types",
      color: "blue",
      rows: [
        { term: "Sequential", desc: "Tasks run in a fixed order; context passes prior outputs forward" },
        { term: "Hierarchical", desc: "A manager agent dynamically delegates tasks" },
        { term: "context=[...]", desc: "Explicitly pass earlier task outputs into a later task" },
      ],
    },
    {
      title: "Role Design",
      color: "amber",
      rows: [
        { term: "Genuine differentiation", desc: "Vague/overlapping roles → redundant outputs" },
        { term: "Backstory matters", desc: "Fed directly into the agent's prompt — shapes real behavior" },
        { term: "allow_delegation", desc: "Lets an agent ask a teammate for help — trades predictability for flexibility" },
      ],
    },
    {
      title: "Safety (extends Agent Fundamentals)",
      color: "rose",
      rows: [
        { term: "max_iter", desc: "Bound each agent's internal loop — non-negotiable" },
        { term: "Bound delegation depth", desc: "Prevent runaway multi-agent delegation cycles" },
        { term: "Verification stage", desc: "Insert a checking agent to catch compounding hallucination" },
      ],
    },
    {
      title: "Memory",
      color: "emerald",
      rows: [
        { term: "Short-term", desc: "Scoped to a single crew execution" },
        { term: "Long-term", desc: "Persisted across executions" },
        { term: "Entity", desc: "Tracks specific facts/entities encountered" },
      ],
    },
    {
      title: "CrewAI vs. LangGraph",
      color: "cyan",
      rows: [
        { term: "Choose CrewAI", desc: "Naturally role-decomposable \"team\" task — fast setup" },
        { term: "Choose LangGraph", desc: "Precise branching, cycles, arbitrary state control" },
        { term: "Hybrid", desc: "Embed a CrewAI crew as a single node inside a LangGraph graph" },
      ],
    },
  ],
};

export default crewai;
