import type { CheatSheetData } from "./types";

const mcp: CheatSheetData = {
  title: "MCP",
  subtitle: "Model Context Protocol: standardized tool discovery and integration",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Client-server", desc: "AI app (client) <-protocol-> tool/data provider (server)" },
        { term: "Analogy", desc: "A web browser and any HTTP-compliant website" },
        { term: "Three primitives", desc: "Tools (invoke), Resources (read), Prompts (templates)" },
      ],
    },
    {
      title: "The M×N → M+N Reduction",
      color: "blue",
      rows: [
        { term: "Without a standard", desc: "M apps × N tools = up to M×N custom integrations" },
        { term: "With MCP", desc: "Each side implements the protocol once = M + N" },
        { term: "Grows favorably", desc: "The bigger M and N get, the bigger the savings" },
      ],
    },
    {
      title: "Transports",
      color: "amber",
      rows: [
        { term: "stdio", desc: "Local, same-machine server — lower latency" },
        { term: "HTTP/SSE", desc: "Remote, independently-hosted server" },
      ],
    },
    {
      title: "Complementary, Not a Replacement",
      color: "emerald",
      rows: [
        { term: "Coexists with native tools", desc: "LangChain @tool, CrewAI tools, etc. can be used alongside MCP" },
        { term: "Major frameworks support it", desc: "LangChain, CrewAI, OpenAI Agents SDK, AutoGen all have MCP clients" },
      ],
    },
    {
      title: "Security Non-Negotiables",
      color: "rose",
      rows: [
        { term: "New trust boundary", desc: "Third-party servers can supply malicious content" },
        { term: "Curated allowlist", desc: "Never connect production agents to unvetted servers" },
        { term: "Uniform guardrails", desc: "Same action-level scrutiny as native tools — no implicit trust" },
        { term: "Untrusted resources/results", desc: "Treat like any other external, prompt-injectable content" },
      ],
    },
    {
      title: "When to Build an MCP Server",
      color: "cyan",
      rows: [
        { term: "Good fit", desc: "A capability genuinely reused across multiple apps/frameworks" },
        { term: "Poor fit", desc: "A capability genuinely specific to one application" },
        { term: "Selection accuracy", desc: "Still needs clear, distinct descriptions — MCP doesn't fix this" },
      ],
    },
  ],
};

export default mcp;
