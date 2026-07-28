import type { CheatSheetData } from "./types";

const mcp: CheatSheetData = {
  title: "The Ultimate MCP (Model Context Protocol) Cheat Sheet",
  subtitle: "Servers vs clients · tools/resources/prompts · transport · building a server · security",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "MCP", desc: "Open protocol standardizing how LLM apps connect to external tools/data", code: "# 'USB-C for AI' — one illustrative framing, not the whole story" },
        { term: "MCP server", desc: "Exposes tools, resources, and/or prompts to any compatible client", code: "server = Server('my-mcp-server')" },
        { term: "MCP client", desc: "The host application (IDE, chat app, agent) that consumes an MCP server", code: "# Claude Desktop, Claude Code, custom agent hosts, etc." },
        { term: "Tools", desc: "Callable functions the model can invoke (the classic function-calling primitive)", code: "@server.tool()\ndef search_docs(query: str) -> str: ..." },
        { term: "Resources", desc: "Read-only data the client can fetch and inject as context", code: "@server.resource('file://{path}')\ndef read_file(path: str) -> str: ..." },
        { term: "Prompts", desc: "Reusable prompt templates a server can expose to clients", code: "@server.prompt()\ndef summarize_template(text: str) -> str: ..." },
      ],
    },
    {
      title: "Transport & Protocol",
      color: "blue",
      rows: [
        { term: "JSON-RPC based", desc: "MCP messages are JSON-RPC 2.0 requests/responses/notifications", code: "{'jsonrpc': '2.0', 'method': 'tools/call', 'params': {...}}" },
        { term: "stdio transport", desc: "Local servers communicate over stdin/stdout — common for dev tools", code: "# client spawns the server process, pipes JSON-RPC over stdio" },
        { term: "HTTP/SSE transport", desc: "Remote servers communicate over HTTP with streaming responses", code: "# used when the server isn't a local subprocess" },
        { term: "Capability negotiation", desc: "Client and server exchange supported capabilities at connection start", code: "initialize -> {'capabilities': {'tools': {}, 'resources': {}}}" },
      ],
    },
    {
      title: "Building a Minimal Server",
      color: "emerald",
      rows: [
        { term: "Official SDK", desc: "Python/TypeScript SDKs provide decorators/helpers for servers", code: "from mcp.server import Server\nfrom mcp.server.stdio import stdio_server" },
        { term: "Register a tool", desc: "Expose one function as a callable MCP tool", code: "@server.tool()\ndef get_weather(city: str) -> str:\n    return fetch_weather(city)" },
        { term: "Run the server", desc: "Start listening for a client connection over stdio", code: "async with stdio_server() as (r, w):\n    await server.run(r, w, init_options)" },
        { term: "Client config", desc: "Point a host app at the server (command + args)", code: "{'mcpServers': {'weather': {'command': 'python', 'args': ['server.py']}}}" },
      ],
    },
    {
      title: "Relationship to Tool Calling",
      color: "amber",
      rows: [
        { term: "MCP != tool calling", desc: "MCP standardizes discovery/transport; the model still uses normal function calling under the hood", code: "# MCP tools get translated into the provider's native tool-call format" },
        { term: "Avoids bespoke integrations", desc: "One server can serve any MCP-compatible client, not just one app", code: "# write once, use in Claude Desktop, Claude Code, custom hosts, etc." },
        { term: "Not a universal solution", desc: "Adoption is still growing; not every tool/provider speaks MCP yet", code: "# hedge: treat as one integration option among several" },
      ],
    },
    {
      title: "Security Considerations",
      color: "rose",
      rows: [
        { term: "New attack surface", desc: "An MCP server is code that executes on the model's behalf — treat it like any other service boundary", code: "# validate all inputs; never trust client-supplied arguments blindly" },
        { term: "Scope permissions narrowly", desc: "Grant a server only the access it needs, not broad filesystem/network reach", code: "# principle of least privilege for server capabilities" },
        { term: "Sandbox side-effecting tools", desc: "Isolate tools that can write/delete/execute from ones that only read", code: "# run destructive tools behind an explicit confirmation step" },
        { term: "Untrusted server risk", desc: "Installing a third-party MCP server means trusting its code fully", code: "# review server source before connecting a client to it" },
      ],
    },
    {
      title: "Related Skills",
      color: "cyan",
      rows: [
        { term: "Tool Calling", desc: "The underlying mechanism MCP tools ultimately map onto", code: "# MCP standardizes discovery, not the call mechanism itself" },
        { term: "Agent Fundamentals", desc: "MCP servers are one way agents gain access to tools/data", code: "# perceive-plan-act loop consumes MCP tools like any other tool" },
        { term: "Claude Code", desc: "A host application that connects to MCP servers for extended capability", code: "# claude mcp add <server-name>" },
        { term: "OpenAI Agents SDK", desc: "Also supports MCP as a way to expose tools to agents", code: "# framework-agnostic protocol, not tied to one vendor" },
        { term: "Guardrails", desc: "Apply input/output validation at the MCP server boundary too", code: "# treat MCP tool inputs as untrusted, same as any user input" },
      ],
    },
  ],
};

export default mcp;
