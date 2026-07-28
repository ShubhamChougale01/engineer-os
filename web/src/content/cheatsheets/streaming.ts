import type { CheatSheetData } from "./types";

const streaming: CheatSheetData = {
  title: "The Ultimate Streaming Cheat Sheet",
  subtitle: "Token-by-token LLM UX -- TTFT, tool-call buffering, partial JSON, backpressure",
  sections: [
    {
      title: "Core Model (why stream at all)",
      color: "violet",
      rows: [
        { term: "TTFT vs total completion time", desc: "Streaming cuts perceived latency, NOT total generation time", code: "// Non-streaming: 8.2s blank screen, then full text\n// Streaming: ~0.3s first token, then continuous growth over 8.2s" },
        { term: "Why it's possible at all", desc: "Autoregressive decoding is sequential -- tokens genuinely exist one at a time", code: "// See the Inference skill for the internal mechanism" },
        { term: "Delta-based chunks", desc: "Each chunk carries only the NEW text, not the full text-so-far", code: "full_text += chunk.delta   // client must accumulate itself" },
        { term: "finish_reason matters", desc: "Tells you WHY the stream ended: stop, length, tool_calls, content_filter", code: "if chunk.finish_reason == 'tool_calls': handle_tool_call()" },
      ],
    },
    {
      title: "Backend: The Relay Pattern",
      color: "blue",
      rows: [
        { term: "Never buffer the full response", desc: "The #1 anti-pattern -- looks like streaming, gives zero benefit", code: "// WRONG: accumulate full_text, then return {\"text\": full_text}\n// RIGHT: yield each delta the instant it arrives" },
        { term: "FastAPI streaming endpoint", desc: "Yield SSE-formatted deltas from an async generator", code: "async def gen():\n    for chunk in llm.stream(msgs):\n        yield 'data: ' + json.dumps({'text': chunk.delta}) + '\\n\\n'\nreturn StreamingResponse(gen(), media_type='text/event-stream')" },
        { term: "Stop upstream on client disconnect", desc: "Cost control -- don't keep paying for tokens nobody reads", code: "if await request.is_disconnected(): break" },
        { term: "Always persist full text server-side", desc: "Even on partial completion -- for history, logging, billing", code: "finally:\n    save_message_to_db(conversation_id, full_text)" },
      ],
    },
    {
      title: "Frontend: Incremental Rendering",
      color: "emerald",
      rows: [
        { term: "Accumulate, then render", desc: "Keep a running buffer; re-render from the growing whole", code: "let fullText = '';\nfullText += delta;\nrender(fullText);" },
        { term: "Batch renders to paint cadence", desc: "Avoid flicker -- don't re-render synchronously on every token", code: "requestAnimationFrame(() => { render(pending); pending = ''; });" },
        { term: "Explicit stream state machine", desc: "idle -> streaming -> done | error | cancelled -- model it, don't infer it", code: "setStatus('streaming'); // ... setStatus('done' | 'error' | 'cancelled')" },
        { term: "Safe partial markdown", desc: "Neutralize unterminated fences/bold markers before rendering", code: "const safe = closeUnterminatedMarkdown(text);\nrender(markdownToHtml(safe));" },
      ],
    },
    {
      title: "Tool Calls & Structured Output",
      color: "amber",
      rows: [
        { term: "Buffer tool-call args as a raw STRING", desc: "Arguments stream as JSON string fragments, not objects", code: "toolBuffer += chunk.delta.tool_calls[0].function.arguments" },
        { term: "Only parse on the completion signal", desc: "Never json.loads() a partial fragment -- it will fail", code: "if finish_reason == 'tool_calls':\n    args = json.loads(toolBuffer)\n    validate_against_schema(args)\n    execute_tool(name, args)" },
        { term: "Partial JSON repair for structured output", desc: "Close open strings/brackets/braces to render a best-effort partial view", code: "repaired = repair_partial_json('{\"name\": \"Rome\", \"pop\": 28')\n// -> '{\"name\": \"Rome\", \"pop\": 28\"}'" },
        { term: "Multi-segment agent streams", desc: "Track which segment (text run vs. tool call) is currently open", code: "// text delta -> tool_call started -> args deltas -> tool_call complete -> text delta" },
      ],
    },
    {
      title: "Errors & Disconnects",
      color: "rose",
      rows: [
        { term: "Three distinct end-states", desc: "Clean done, in-band error event, and abrupt connection drop are NOT the same", code: "eventSource.addEventListener('done', finalize);\neventSource.addEventListener('error', showRetry);" },
        { term: "Never leave the UI silently stuck", desc: "A dropped connection with no handler = an invisible failure", code: "eventSource.onerror = () => { eventSource.close(); setStatus('error'); };" },
        { term: "Support real cancellation", desc: "Wire a 'stop' button to AbortController + server-side disconnect check", code: "controller.abort();   // client\nif await request.is_disconnected(): break   // server" },
        { term: "Test with awkward fragment boundaries", desc: "Split chunks at ugly byte offsets, not clean whole payloads", code: "mock_provider.stream_chunks(['{\"loc', 'ation\":\"P', 'aris\"}'])" },
      ],
    },
    {
      title: "Backpressure & Production",
      color: "cyan",
      rows: [
        { term: "Respect the write() drain signal", desc: "Don't let an unbounded buffer grow for a slow client", code: "if (!res.write(chunk)) await new Promise(r => res.once('drain', r));" },
        { term: "Extend server keep-alive timeouts", desc: "Default timeouts assume short requests, not long generations", code: "uvicorn main:app --timeout-keep-alive 120" },
        { term: "No-buffering at the proxy layer too", desc: "Same SSE transport rule applies -- see the SSE skill", code: "proxy_buffering off;   // nginx" },
        { term: "Monitor TTFT and disconnect rate", desc: "Track separately from total latency and generic error rate", code: "// Alert on rising TTFT -- early signal of an accidental-buffering regression" },
      ],
    },
  ],
};

export default streaming;
