import type { CheatSheetData } from "./types";

const sse: CheatSheetData = {
  title: "The Ultimate Server-Sent Events Cheat Sheet",
  subtitle: "One-directional streaming · how LLMs stream tokens · the proxy buffering trap",
  sections: [
    {
      title: "Core Model (deliberately one-directional)",
      color: "violet",
      rows: [
        { term: "Plain HTTP, no handshake needed", desc: "Just a response with Content-Type: text/event-stream that stays open", code: "res.setHeader('Content-Type', 'text/event-stream');" },
        { term: "Simple text wire format", desc: "data:/event:/id: lines, blank line ends an event", code: "data: {\"token\": \"Hello\"}\\n\\n" },
        { term: "Server-to-client ONLY", desc: "Client's outgoing messages = a SEPARATE ordinary HTTP request", code: "// A 'conversation' = POST to send + SSE stream to receive. Two mechanisms, not one." },
        { term: "Built-in browser support", desc: "No library needed -- EventSource handles parsing + reconnect", code: "const es = new EventSource('/stream');\nes.onmessage = (e) => console.log(JSON.parse(e.data));" },
      ],
    },
    {
      title: "Why LLM Providers ALL Use This",
      color: "blue",
      rows: [
        { term: "Token streaming = one-directional by nature", desc: "One request in, a stream of tokens out -- exactly SSE's shape", code: "// OpenAI, Anthropic, virtually every provider standardized on this" },
        { term: "Backend relay pattern", desc: "Your server is BOTH an SSE client (upstream) and SSE server (to your frontend)", code: "async for chunk in llm.stream_completion(msgs):\n    yield 'data: ' + json.dumps({'token': chunk.text}) + '\\n\\n'" },
        { term: "Always send a final done event", desc: "In a finally block -- so error paths still signal completion", code: "yield 'event: done\\ndata: {}\\n\\n'" },
      ],
    },
    {
      title: "Reconnection & Resumption",
      color: "emerald",
      rows: [
        { term: "Auto-reconnect is FREE", desc: "EventSource retries automatically on drop -- no extra code needed", code: "retry: 3000   // server suggests the reconnect delay in ms" },
        { term: "Resumption needs server-side work", desc: "SSE only provides the Last-Event-ID PROTOCOL hook", code: "const lastId = req.headers['last-event-id'];\n// YOU must replay events starting after lastId" },
        { term: "Heartbeat for sparse streams", desc: "A comment line keeps idle-timeout proxies from disconnecting you", code: ": heartbeat\\n\\n   // ignored by EventSource, keeps conn alive" },
      ],
    },
    {
      title: "THE #1 Production Gotcha",
      color: "amber",
      rows: [
        { term: "Intermediary buffering", desc: "Works locally, breaks in prod: a proxy/CDN/LB buffers the WHOLE response", code: "// Symptom: all data arrives at once, at the very end" },
        { term: "Fix (nginx)", desc: "Disable buffering explicitly for the streaming location", code: "location /stream {\n  proxy_buffering off;\n  proxy_set_header Connection '';\n}" },
        { term: "ALWAYS verify through the real prod path", desc: "Not just a direct-to-origin test", code: "curl -N https://yourapi.com/stream   // -N disables curl's own buffering" },
      ],
    },
    {
      title: "Auth & Cleanup",
      color: "rose",
      rows: [
        { term: "EventSource CANNOT set custom headers", desc: "A real browser API limitation", code: "const es = new EventSource('/stream?token=' + authToken);" },
        { term: "Alternative: fetch + ReadableStream", desc: "Full header control, but you lose auto-reconnect", code: "// Use only when custom headers are genuinely required" },
        { term: "ALWAYS clean up on disconnect", desc: "req.on('close') -- otherwise subscriptions/cursors leak forever", code: "req.on('close', () => subscription.unsubscribe());" },
      ],
    },
    {
      title: "When to Use SSE vs WebSockets",
      color: "cyan",
      rows: [
        { term: "Use SSE for", desc: "One-directional: LLM token streaming, notifications, live feeds, progress bars", code: "" },
        { term: "Use WebSockets instead for", desc: "BOTH sides need frequent, unprompted messages: chat, collab editing", code: "// See the WebSockets skill" },
        { term: "SSE often avoids cross-instance broadcast", desc: "Each client's stream is usually driven by THAT client's own request", code: "// Unlike a WS chat room, no pub/sub backplane needed for basic LLM streaming" },
      ],
    },
  ],
};

export default sse;
