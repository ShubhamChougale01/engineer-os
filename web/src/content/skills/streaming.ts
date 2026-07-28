import type { SkillContent } from "../types";

/**
 * Streaming (LLM UX and infrastructure) — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 *
 * Scope note: this page is the APPLICATION-LEVEL skill for LLM streaming --
 * the UX pattern, the partial-data handling, the tool-call buffering, the
 * client-side rendering discipline. The **Server-Sent Events** skill covers
 * the dominant underlying WIRE PROTOCOL in deep, protocol-specific detail
 * (event format, EventSource, proxy buffering at the HTTP layer). This page
 * assumes SSE (or WebSockets) as the transport and focuses on what an AI
 * engineer must build ON TOP of that transport to make token-by-token
 * generation feel instant, correct, and robust for a real user.
 */
const streaming: SkillContent = {
  overview: `
Streaming, in the context of LLM applications, is the practice of delivering a model's output to the caller incrementally -- token by token, or chunk by chunk -- as it is generated, rather than waiting for the entire response to finish before sending anything back. Concretely, instead of a client issuing a request and blocking for the full multi-second (or multi-minute, for long generations) duration of an inference call, the server begins forwarding generated tokens the moment they exist, and the client renders them as they arrive, producing the now-familiar "typing" effect seen in ChatGPT, Claude.ai, and virtually every modern LLM product.

This is fundamentally a **latency-perception** technique, not a raw-throughput one: streaming a 500-token response does not make the model generate those 500 tokens any faster in aggregate (total generation time is largely unchanged, and streaming often adds a small amount of protocol overhead), but it changes time-to-first-token (TTFT) from "the entire response" to "the first token," which is frequently 10-50x smaller. For an AI engineer this single fact -- streaming trades a (usually irrelevant) small change in total completion time for a dramatic improvement in perceived responsiveness -- is the entire reason this skill exists, and drives essentially every design decision covered on this page.

Streaming touches three genuinely distinct engineering layers that this page treats as one coherent skill: the **transport** layer (how bytes move from server to client over time -- typically Server-Sent Events or WebSockets, covered in their own dedicated skills), the **protocol/format** layer (how a provider's API represents "here is a partial chunk of a structured response," including plain text deltas, partial JSON for structured output, and partial tool-call arguments), and the **UX/rendering** layer (how a frontend takes a rapid sequence of partial updates and renders them smoothly, without flicker, without re-parsing invalid JSON, and without losing state on a dropped connection). Most real-world streaming bugs live at the boundary between these layers -- a transport-layer disconnect that the UX layer doesn't handle gracefully, or a protocol-layer partial JSON chunk that the rendering layer tries to parse as if it were complete.

Key characteristics of LLM streaming specifically: it is **incremental and monotonic** -- once content is emitted it is (with the notable exception of some UI patterns that overwrite previous partial state) never retracted, only appended to; it is **inherently asynchronous and interruptible** -- a user can, and often does, stop generation mid-stream, and a connection can drop mid-stream, both of which the system must handle as first-class, expected events rather than edge cases; and it commonly carries **structurally significant partial data** -- not just partial prose, but partial JSON objects (for structured output) and partial function/tool-call argument strings (for tool calling), each of which requires specialized handling that naive "just render each chunk" logic gets wrong.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1990s-2000s | Early "typewriter effect" UI patterns exist in chat and terminal applications, unrelated to LLMs, establishing the general UX expectation that incremental text display feels more responsive than a blocking wait |
| 2018-2019 | Early neural text-generation demos (GPT-2 and similar) are typically served as a single blocking call; streaming is not yet a standard API feature for language models |
| 2020 | OpenAI's GPT-3 API ships without native token streaming initially; developers building "typing" UIs largely fake it client-side by revealing a fully-received response character by character, an approximation rather than genuine incremental generation |
| 2021-2022 | OpenAI adds true streaming support (server-sent, token-by-token) to its Completions and then Chat Completions APIs, exposed via the stream parameter, making genuine incremental generation available via API for the first time at scale |
| Nov 2022 | ChatGPT launches with a token-streamed chat interface as its signature interaction pattern, cementing "watching the response type itself out" as the default mental model users now have for how an LLM product should feel |
| 2023 | Nearly every major LLM provider (Anthropic, Google, Cohere, open-source serving stacks) adds streaming support, converging heavily on Server-Sent Events as the transport and on a "delta" event model (each chunk carries only the NEW content since the last chunk) |
| 2023-2024 | Streaming tool calls (function calling) becomes a significant new challenge -- providers begin streaming partial tool-call argument JSON incrementally, requiring clients to buffer until a complete, parseable JSON object exists before acting on it |
| 2024-2025 | Streaming structured output (JSON mode, strict schema-constrained generation) becomes common; libraries and SDKs begin offering "partial JSON parsers" that can render a valid, if incomplete, object from a truncated JSON string as it streams |
| 2025 | Streaming is now a default expectation for nearly any user-facing LLM product; the engineering conversation shifts from "should we stream" to "how do we stream reliably" -- reconnection, backpressure, and multi-step agent streaming (tool calls interleaved with text) are now mainstream production concerns |

The overall arc mirrors a familiar pattern in web engineering: an interaction model (blocking request/response) that was adequate when responses were fast becomes a genuine UX liability once response times grow (multi-second LLM generation), and the industry converges on incremental delivery as the fix -- the same story that motivated **Server-Sent Events** and **WebSockets** in the broader web, now specialized for the LLM generation use case.
`,

  "why-it-exists": `
Streaming exists because LLM inference is comparatively slow and the cost scales with output length: generating a 1,000-token response might take several seconds to tens of seconds depending on model size, hardware, and load, and there is no way around this without changing the model or hardware -- the tokens must be generated sequentially (each token's computation depends on the ones before it, an architectural fact covered in depth in the **Inference** skill). Without streaming, a user submitting a prompt stares at a blank screen or a spinner for the entire generation duration, with zero feedback that anything is happening, and zero ability to see whether the response even looks like it's going in a useful direction before it fully completes.

Before streaming was standard, developers had exactly two bad options: block the request until the full response was ready (simple to implement, but the user experience degrades badly as response length or model latency grows -- a 15-second wait with no feedback feels broken even when the system is working correctly), or fake incremental display client-side by first waiting for the full response and THEN "typing it out" artificially (an animation trick that improves the FEEL of responsiveness slightly but adds latency on top of the already-slow full wait rather than removing any, and provides no genuine early value since the full answer must already exist before the fake typing can begin).

Streaming's actual innovation is architectural, not cosmetic: because tokens ARE generated one at a time internally by the model, the serving infrastructure can forward each one to the client the instant it exists, rather than artificially buffering them server-side until the full response is assembled. This turns an unavoidable total latency into a MUCH shorter perceived latency, because a user reading the first few words of a real, still-growing response experiences meaningfully less "waiting" than a user watching a spinner for the same total duration -- even though the underlying computation takes exactly the same wall-clock time either way.
`,

  "problem-it-solves": `
Streaming solves the **"the user is staring at nothing for 5-30+ seconds while a slow, sequential generation process runs, and this feels broken even though the system is working correctly"** problem.

Concretely, streaming provides:

- **Dramatically lower perceived latency (time-to-first-token vs. time-to-last-token)**: a user sees the response beginning within a few hundred milliseconds to low seconds, rather than waiting for the entire generation (which might be 10-60x longer) to complete before seeing anything.
- **Continuous feedback that the system is alive and working**: a growing response is unambiguous evidence of progress; a static spinner leaves the user unable to distinguish "working normally, just slow" from "hung or crashed."
- **Early value and early exit**: a user who sees the first sentence answer their question doesn't need to wait for (or pay the generation cost of) the rest -- many production UIs let a user stop generation the moment they've seen enough, something only possible with incremental delivery.
- **A natural fit for interleaved multi-step agent output**: as an agent reasons, calls tools, and produces a final answer, streaming lets each step's output appear as it happens, rather than the entire multi-step trace appearing at once at the very end (directly relevant to the **Tool Calling** and **Realtime AI** skills).

What streaming deliberately does **not** solve: it does not make the model generate faster in aggregate -- total generation wall-clock time is essentially unchanged (streaming adds a small amount of protocol/chunking overhead, not a speedup); it does not by itself guarantee correctness of PARTIAL output -- a partially-streamed JSON object or partially-streamed tool-call argument string is not valid JSON until it is complete, and naive code that tries to parse every partial chunk as if it were final data will break (a central theme of this page); and it does not eliminate the need for robust error handling -- a stream can be interrupted mid-response by a dropped connection, a client navigating away, or an upstream provider error, and the application must handle a genuinely partial, incomplete response as an expected, first-class outcome rather than an ignorable edge case.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely why streaming improves perceived latency while leaving total generation time essentially unchanged, using time-to-first-token versus time-to-last-token as the concrete framing.
2. Implement a streaming backend endpoint (FastAPI/Server-Sent Events) that proxies an upstream LLM provider's token stream to a client.
3. Implement a frontend consumer that incrementally renders streamed text and partial markdown without flicker or re-render thrash.
4. Correctly buffer and reassemble partial tool-call arguments streamed incrementally, only acting once a complete, valid JSON object exists.
5. Handle streaming structured output, using partial-JSON-aware parsing to render a valid, if incomplete, view of an in-progress object.
6. Design robust mid-stream error handling: distinguishing a clean stream end, an in-band error event, and an abrupt connection drop, and recovering or informing the user appropriately in each case.
7. Explain backpressure in a streaming pipeline and implement a strategy for a slow consumer that cannot keep up with a fast producer.
8. Identify and avoid the most common streaming pitfalls: silent disconnect handling, naive re-render flicker, and server-side full-response buffering that defeats streaming's entire purpose.
9. Compare streaming architectures across providers (OpenAI, Anthropic, open-source serving stacks) and explain when NOT to stream (batch jobs, certain structured-extraction pipelines, evaluation harnesses).
10. Answer senior-level interview questions on streaming architecture, partial-state handling, and its interaction with tool calling and structured output.
`,

  prerequisites: `
- **Required**: the **Server-Sent Events** skill (or the **WebSockets** skill) -- streaming as covered on this page assumes a working transport; this page focuses on what you build ON TOP of that transport, not the transport's own wire mechanics.
- **Required**: basic familiarity with any LLM provider's chat completion API (OpenAI's or Anthropic's), since concrete streaming examples build directly on these APIs.
- **Required**: the **Inference** skill, for the internal reason WHY generation is inherently sequential and streamable (autoregressive, one-token-at-a-time decoding).
- **Helpful**: the **Tool Calling** skill, since a meaningful fraction of this page (streaming partial tool-call arguments) is a direct extension of tool-calling concepts into the streaming context.
- **Helpful**: the **Latency** skill, for the broader vocabulary (TTFT, tokens/second, p50/p99) this page uses when discussing perceived responsiveness.
- **Very helpful**: the **Realtime AI** skill, for the adjacent, more demanding case of voice/live multimodal streaming, which builds on everything covered here.

Dependency links: **Inference** (why generation is sequential) -> **Server-Sent Events** / **WebSockets** (the transport) -> this page (the LLM-specific streaming UX and infrastructure layer) -> **Tool Calling** and **Realtime AI** (specialized extensions).
`,

  "beginner-concepts": `
### What "non-streaming" looks like, and its cost

~~~python
# Non-streaming call: the client blocks until the ENTIRE response exists
response = llm_client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a 500-word essay on Rome."}],
    stream=False,
)
print(response.choices[0].message.content)   # nothing printed until ALL 500+ words are ready
~~~

With stream=False, the client receives one single HTTP response only once generation has fully completed -- for a long response this can mean tens of seconds with literally zero visible output, the exact experience streaming exists to fix.

### The simplest possible streaming call

~~~python
# Streaming call: the client receives a series of incremental chunks
stream = llm_client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a 500-word essay on Rome."}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)   # print each new piece of text as it arrives
~~~

Each chunk carries a DELTA -- only the new text since the last chunk, not the full accumulated response so far -- so the client is responsible for concatenating deltas itself if it needs the full text (covered next). This delta-based model (rather than each chunk repeating the full text-so-far) is the near-universal convention across LLM provider streaming APIs, since it keeps each chunk small.

### Accumulating the full response client-side

~~~python
full_text = ""
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        full_text += delta
        render_partial_response(full_text)   # re-render the UI with the growing text
# after the loop: full_text now holds the complete, final response
~~~

A crucial beginner-level habit: ALWAYS accumulate the full text into a single variable as you go, both so you have the complete final response available once the stream ends (for logging, saving to a database, or further processing) and so any rendering logic operates on the growing whole rather than trying to reason about isolated fragments.

### Time-to-first-token versus time-to-last-token

~~~
Non-streaming:  [================== 8.2s: full response arrives ==================]
                                                                                    -> user sees output

Streaming:      [0.3s: first token] -> [continuous tokens arrive over 8.2s total]
                     -> user sees output almost immediately, and continuously
~~~

The total generation time (8.2 seconds in this illustration) is THE SAME in both cases -- streaming does not make the model faster. What changes is when the user perceives the response beginning: 300 milliseconds instead of 8.2 seconds, a genuinely transformative difference in how "fast" the same underlying system feels.

### A minimal frontend consumer (fetch + ReadableStream)

~~~javascript
async function streamChat(userMessage) {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message: userMessage }),
    headers: { "Content-Type": "application/json" },
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    renderPartial(fullText);   // update the UI incrementally
  }
}
~~~

This is the lower-level alternative to EventSource (covered in depth in the **Server-Sent Events** skill) -- reading a fetch response body as a raw byte stream, decoding it incrementally, and rendering as data arrives; it is commonly used specifically because it supports POST requests and custom headers, which EventSource's constructor does not.
`,

  "intermediate-concepts": `
### Distinguishing event types in a real provider stream

~~~python
# Anthropic-style streaming event types (illustrative; consult current docs
# for the exact, up-to-date event names and payload shapes)
for event in stream:
    if event.type == "content_block_delta":
        append_text(event.delta.text)
    elif event.type == "message_stop":
        finalize_message()
    elif event.type == "error":
        handle_stream_error(event.error)
~~~

Real provider streams are not just a flat sequence of text deltas -- they carry distinct, named event types (content start, content delta, content stop, message stop, error, and provider-specific variants) that a robust client must switch on explicitly, rather than assuming every event is a plain text chunk.

### Buffering partial tool-call arguments

~~~python
# Tool-call arguments arrive as an incrementally-growing JSON STRING,
# not a growing JSON OBJECT -- you cannot safely parse it until it is complete.
tool_call_buffer = ""
tool_call_name = None

for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.tool_calls:
        tc = delta.tool_calls[0]
        if tc.function.name:
            tool_call_name = tc.function.name
        if tc.function.arguments:
            tool_call_buffer += tc.function.arguments   -- append the raw string fragment

    if chunk.choices[0].finish_reason == "tool_calls":
        args = json.loads(tool_call_buffer)   -- ONLY parse once the stream signals completion
        execute_tool(tool_call_name, args)
~~~

This is the single most important tool-calling-specific streaming pattern: a tool call's arguments field is streamed as fragments of a JSON string (for example, chunks like left-brace-quote-l, oc, ation-quote-colon...), and attempting to json.loads a partial fragment will raise a parse error nearly every time -- the correct pattern is to buffer the raw string across every chunk and only parse (and only then execute the tool) once the provider's finish signal indicates the tool call's arguments are complete. See the **Tool Calling** skill for the non-streaming version of this same mechanism.

### Rendering partial markdown without breaking formatting

~~~javascript
function renderPartialMarkdown(text) {
  // A naive markdown renderer applied to a HALF-formed structure like
  // an unclosed code fence or unclosed bold marker can render broken HTML.
  // A safer pattern: only fully re-render fenced code blocks once a
  // matching closing fence has streamed in; render plain text for an
  // still-open, unterminated block instead of guessing.
  const safeText = closeUnterminatedMarkdown(text);
  container.innerHTML = markdownToHtml(safeText);
}
~~~

Because a stream can pause mid-markdown-construct (an opened but not yet closed bold marker, an opened but not yet closed code fence), production markdown-streaming renderers typically post-process the partial text to neutralize unterminated constructs before rendering, rather than feeding raw partial markdown directly into a strict parser that assumes well-formed input.

### Streaming structured output (partial JSON validity)

~~~python
import json

partial = '{"name": "Rome", "population": 28'   # a mid-stream, INCOMPLETE JSON fragment

# json.loads(partial) raises json.JSONDecodeError -- it is not valid JSON yet.
# A "partial JSON" parser instead repairs the fragment into the closest
# valid JSON by closing open strings/objects/arrays, so a UI can render
# a best-effort PARTIAL VIEW of the object as it grows.
repaired = repair_partial_json(partial)   # illustrative helper -- see below for a real implementation sketch
parsed = json.loads(repaired)   # -> {"name": "Rome", "population": 28}   (best-effort, may be truncated)
~~~

Providers offering JSON-mode or schema-constrained structured output typically still stream the JSON as raw text deltas -- the ONLY way to progressively render the growing object is a "partial JSON" repair pass (closing unterminated strings, brackets, and braces) before each parse attempt; several SDKs and open-source libraries (partial-json-parser style tools) exist specifically for this.

### The done/finish signal, and why you must wait for it

~~~python
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        full_text += delta
    if chunk.choices[0].finish_reason is not None:
        # finish_reason: "stop" (natural end), "length" (hit max tokens),
        # "tool_calls" (model wants to call a tool), "content_filter", etc.
        handle_finish(chunk.choices[0].finish_reason, full_text)
~~~

The finish_reason field (or its provider-specific equivalent) is not a mere formality -- it tells you WHY the stream ended, which materially changes what your application should do next (present the answer as final versus resume automatically versus execute a tool versus surface a content-policy message).

### Server-side buffering that quietly defeats streaming

~~~python
# ANTI-PATTERN: this "streaming" endpoint actually buffers the ENTIRE
# response server-side before sending anything -- the client gets zero
# benefit despite the stream=True flag and the SSE content type.
@app.post("/chat")
async def chat(request: ChatRequest):
    full_text = ""
    async for chunk in llm_client.stream_completion(request.messages):
        full_text += chunk.text   # accumulating without yielding anything yet
    return {"text": full_text}    # the client waits just as long as a non-streaming call
~~~

This looks superficially like a streaming implementation (it uses a streaming call to the UPSTREAM provider) but never forwards partial data to ITS OWN client -- a subtle, very common mistake covered in depth in Anti-Patterns and Common Mistakes below.
`,

  "advanced-concepts": `
### Backpressure: when the client cannot keep up with the server

~~~
Producer (LLM generating tokens at, say, 60 tokens/sec)
        |
        v
Server relay layer  --  if the CLIENT is slow to read/render
        |                (a busy main thread, a slow network link),
        v                data can pile up somewhere in the pipeline
Client (rendering incoming tokens)
~~~

Backpressure is the general problem of a fast producer overwhelming a slow consumer -- in an LLM streaming context this most often shows up as the SERVER'S OWN write buffer to the client growing unboundedly if the client's TCP receive window fills up (a slow or congested network path, or a client that has stopped reading, perhaps because its own render loop is blocked). Node.js's response.write() returning false, and .NET/Python async streams awaiting on a write call, are both concrete backpressure signals your server-side streaming code should respect rather than ignore.

~~~javascript
function writeChunk(res, chunk) {
  const ok = res.write(chunk);
  if (!ok) {
    // The OS-level write buffer is full -- pause producing further chunks
    // (or apply flow control to the upstream provider connection, if it
    // supports it) until the 'drain' event fires, rather than continuing
    // to call write() and growing an unbounded in-process buffer.
    return new Promise((resolve) => res.once("drain", resolve));
  }
  return Promise.resolve();
}
~~~

Ignoring backpressure signals and calling write() unconditionally as fast as tokens arrive can cause the server process's own memory to grow unboundedly for a slow client, a genuine production risk under load with many concurrent slow-client streams.

### Client-side backpressure: not every render needs to happen

~~~javascript
// ANTI-PATTERN: re-rendering the full DOM on EVERY single token can itself
// become the bottleneck if tokens arrive faster than the browser can paint.
eventSource.onmessage = (e) => {
  fullText += JSON.parse(e.data).token;
  renderMarkdown(fullText);   -- expensive, called potentially 50+ times/sec
};

// BETTER: batch/throttle rendering to the browser's own paint cadence
let pending = "";
let scheduled = false;
eventSource.onmessage = (e) => {
  pending += JSON.parse(e.data).token;
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      fullText += pending;
      pending = "";
      renderMarkdown(fullText);
      scheduled = false;
    });
  }
};
~~~

This is the client-side mirror of server-side backpressure: rather than performing an expensive re-render synchronously for every single incoming token (which can itself introduce visible jank or dropped frames on a fast stream), batch incoming deltas and flush them at the browser's own natural rendering cadence (requestAnimationFrame), which is both smoother and cheaper.

### Multi-step agent streaming: interleaving text and tool calls

~~~
Stream sequence for a single agent turn that reasons, calls a tool, then answers:

  text delta: "Let me check the weather..."
  tool_call started: get_weather
  tool_call arguments delta: {"loc
  tool_call arguments delta: ation":"P
  tool_call arguments delta: aris"}
  tool_call complete -> execute get_weather("Paris") server-side
  text delta: "It's currently 18C and cloudy in Paris."
  message complete
~~~

A production agent-streaming client must maintain explicit STATE across this sequence -- which "segment" (a text run, or an in-progress tool call) is currently open, buffering each segment's own partial data separately -- rather than treating the entire stream as one undifferentiated sequence of text fragments; this directly extends the tool-call buffering pattern from Intermediate Concepts into a multi-turn, multi-segment context. See the **Tool Calling** and **Realtime AI** skills for the fuller agent-loop and voice-specific versions of this same idea.

### Mid-stream cancellation and cleanup

~~~python
@app.post("/chat")
async def chat(request: Request, chat_request: ChatRequest):
    async def event_generator():
        upstream = llm_client.stream_completion(chat_request.messages)
        try:
            async for chunk in upstream:
                if await request.is_disconnected():
                    break   -- stop pulling from the upstream provider immediately
                yield format_sse(chunk)
        finally:
            await upstream.aclose()   -- ALWAYS release the upstream generation, billed or not
    return StreamingResponse(event_generator(), media_type="text/event-stream")
~~~

A subtle, senior-level correctness and cost concern: if a user closes the tab or clicks "stop" mid-generation, a naive server implementation may keep pulling (and paying for) tokens from the upstream LLM provider even though nobody is listening anymore -- explicitly checking for client disconnection and closing the upstream generation immediately is both a cost control and a resource-hygiene practice.

### Reordering and out-of-order delivery are NOT a concern for a single stream

Within one HTTP response (SSE) or one WebSocket connection, ordering is guaranteed by the underlying transport (TCP, then HTTP framing) -- a client never needs to reorder chunks within a single stream. This becomes a genuine concern only in multi-stream/multi-connection fan-out architectures (multiple parallel agent sub-tasks each streaming independently, later merged), where the application layer, not the transport, is responsible for correct interleaving or sequencing.
`,

  "internal-working": `
Tracing what happens from a user's prompt to incrementally rendered text on screen:

~~~mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Model as LLM inference engine

    User->>Frontend: submits a prompt
    Frontend->>Backend: POST /chat (ordinary HTTP request)
    Backend->>Model: begin generation (stream=true)
    loop For each token the model generates
        Model-->>Backend: token N (as soon as it is computed)
        Backend-->>Frontend: forward token N immediately (SSE/WebSocket frame)
        Frontend->>Frontend: append token N, re-render incrementally
    end
    Model-->>Backend: generation complete (finish_reason)
    Backend-->>Frontend: stream-end signal
    Frontend->>Frontend: finalize message, re-enable input
~~~

1. **The model generates autoregressively, one token at a time**: each new token's computation depends on all previous tokens (covered in depth in the **Inference** skill) -- this sequential dependency is WHY streaming is possible at all: there genuinely is a discrete moment in time at which each token first exists, and nothing prevents forwarding it immediately rather than waiting for the rest.
2. **The serving layer forwards each token the instant it is produced**, rather than buffering server-side -- this is the crux of "true" streaming, and precisely the step a naive or misconfigured implementation can accidentally skip (buffering the full response before responding at all, discussed in Anti-Patterns).
3. **The transport (SSE or WebSocket) delivers each forwarded token incrementally** to the client, over a connection that stays open across the whole generation -- the transport-level mechanics of HOW this delivery works are covered in full in the **Server-Sent Events** and **WebSockets** skills.
4. **The client accumulates and incrementally re-renders**, appending each arriving delta to a growing buffer and updating the UI -- ideally batched to the browser's paint cadence rather than on every single token, as covered in Advanced Concepts.
5. **A finish signal ends the loop**, telling the client definitively why generation stopped (natural completion, length limit, a tool call, a content-policy stop) so it can take the appropriate next action rather than assuming every stream end means "the final answer is ready."

**Why this matters**: every genuine streaming bug traces back to one of these five steps being skipped or done incorrectly -- server-side buffering skips step 2, ignoring backpressure breaks step 3 at scale, naive re-rendering breaks step 4's efficiency, and not handling finish_reason breaks step 5's correctness.
`,

  architecture: `
A senior engineer designing a streaming LLM application thinks in three cooperating layers, each with a distinct, separable responsibility.

~~~mermaid
flowchart TB
    subgraph Layer1["Transport layer"]
        SSEWS["Server-Sent Events or WebSockets\n(see their own skills for wire-level detail)"]
    end
    subgraph Layer2["Protocol / format layer"]
        Deltas["Text deltas, tool-call argument\nfragments, partial JSON for structured output"]
    end
    subgraph Layer3["UX / rendering layer"]
        Render["Incremental rendering, partial markdown\nhandling, backpressure-aware batching,\nerror/disconnect UI states"]
    end
    Layer1 --> Layer2 --> Layer3
~~~

### Backend architecture: the relay pattern

~~~mermaid
flowchart LR
    Client --> App["Your backend\n(auth, business logic,\nrate limiting, logging)"]
    App -->|"stream=true"| Provider["Upstream LLM provider\n(OpenAI, Anthropic, or your\nown inference server)"]
    Provider -.stream of tokens.-> App
    App -.relayed stream.-> Client
~~~

Your backend is typically BOTH a streaming client (of the upstream provider) and a streaming server (to your own frontend) -- its job is to authenticate, apply business logic (content filtering, per-user rate limits, usage logging, tool execution), and RELAY tokens through with minimal added latency, never to accumulate the full response before responding (the single most consequential architectural mistake covered in Anti-Patterns).

### Frontend architecture: a state machine, not just a text buffer

~~~mermaid
flowchart LR
    Idle --> Streaming["Streaming\n(accumulating deltas,\nrendering incrementally)"]
    Streaming --> Complete["Complete\n(finish_reason received,\nfinalize UI)"]
    Streaming --> Errored["Errored\n(in-band error event\nor connection drop)"]
    Streaming --> Cancelled["Cancelled\n(user clicked stop)"]
    Errored --> Idle
    Complete --> Idle
    Cancelled --> Idle
~~~

Treating a streaming response as an explicit state machine (rather than "just append text until nothing more arrives") is what makes error handling, cancellation, and retry logic tractable -- each state has a well-defined set of valid transitions and a well-defined UI representation, discussed further in Testing and Anti-Patterns.
`,

  "data-flow": `
Tracing one complete streaming chat turn end to end, including a tool call in the middle -- the realistic shape of a modern agentic streaming interaction:

~~~mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Provider as LLM Provider
    participant Tool as External tool/API

    User->>Frontend: sends a message
    Frontend->>Backend: POST /chat
    Backend->>Provider: stream_completion(messages, tools=[...])
    Provider-->>Backend: text delta: "Let me check..."
    Backend-->>Frontend: relayed text delta
    Provider-->>Backend: tool_call arguments delta (fragment 1)
    Provider-->>Backend: tool_call arguments delta (fragment 2)
    Provider-->>Backend: tool_call complete signal
    Backend->>Backend: parse buffered arguments JSON
    Backend->>Tool: execute_tool(name, parsed_args)
    Tool-->>Backend: tool result
    Backend->>Provider: continue generation with tool result appended
    Provider-->>Backend: text delta: "It's 18C and cloudy."
    Backend-->>Frontend: relayed text delta
    Provider-->>Backend: message complete (finish_reason: stop)
    Backend-->>Frontend: stream-end signal
    Frontend->>Frontend: finalize message, re-enable input
~~~

The critical detail: the BACKEND, not the frontend, is responsible for buffering and parsing the tool-call arguments and executing the tool -- the frontend typically only needs to render a "using a tool..." indicator during this phase, then resume rendering text deltas once the tool result comes back and generation continues, keeping tool execution (which may involve credentials, internal APIs, or side effects) entirely server-side.
`,

  "production-usage": `
### A production streaming endpoint (FastAPI, relaying an LLM provider)

~~~python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

def format_sse(event_type: str, data: dict) -> str:
    return "event: " + event_type + "\\ndata: " + json.dumps(data) + "\\n\\n"

@app.post("/chat")
async def chat(request: Request, chat_request: ChatRequest, user=Depends(get_current_user)):
    async def event_generator():
        full_text = ""
        try:
            stream = llm_client.chat.completions.create(
                model="gpt-4o",
                messages=chat_request.messages,
                stream=True,
            )
            for chunk in stream:
                if await request.is_disconnected():
                    break   -- stop pulling upstream if nobody is listening
                delta = chunk.choices[0].delta.content
                if delta:
                    full_text += delta
                    yield format_sse("token", {"text": delta})
            yield format_sse("done", {"full_text": full_text})
        except Exception as exc:
            yield format_sse("error", {"message": str(exc)})
        finally:
            save_message_to_db(chat_request.conversation_id, full_text)   -- persist even on partial completion

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
~~~

Notice this endpoint never accumulates full_text and waits before yielding -- every delta is yielded to the client the instant it is received from the upstream provider, with full_text maintained purely for logging/persistence, not for gating what gets sent onward.

### A frontend consumer with incremental rendering (React sketch)

~~~javascript
function useStreamingChat() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle");   -- idle | streaming | done | error

  async function send(message) {
    setText("");
    setStatus("streaming");
    const response = await fetch("/chat", { method: "POST", body: JSON.stringify({ message }) });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = parseSseEvents(buffer);   -- split on double-newline event boundaries
      for (const evt of events.complete) {
        if (evt.type === "token") setText((t) => t + evt.data.text);
        if (evt.type === "error") setStatus("error");
        if (evt.type === "done") setStatus("done");
      }
      buffer = events.remainder;   -- keep any incomplete trailing event for the next read
    }
  }
  return { text, status, send };
}
~~~

Note the buffer/remainder pattern: raw stream chunks do not align neatly with logical SSE event boundaries (a single fetch read() can return a fragment of one event or several events at once), so the client must buffer incoming bytes and only process complete events, carrying any trailing partial event forward to the next read.

### Common production patterns

- **Backend-as-relay**, as shown above -- authenticate, apply business logic, log, and forward, never fully buffering.
- **Streaming with abort support**, wiring a UI "stop" button to an AbortController on the fetch request (frontend) and request.is_disconnected() checks (backend), so cancellation actually stops upstream token consumption rather than merely hiding the UI.
- **Streaming plus final-message persistence**, always saving the accumulated full_text (even if partial, due to an error or cancellation) so a user's conversation history is never silently lost.
`,

  "industry-examples": `
- **OpenAI's ChatGPT and API**: the reference implementation of chat-style token streaming via Server-Sent Events, defining the "delta" event convention many other providers converged on.
- **Anthropic's Claude.ai and Messages API**: streams distinct, named event types (content block start/delta/stop, message stop) rather than a flat text-delta sequence, giving clients explicit structural signals for multi-part responses including tool use.
- **GitHub Copilot / Copilot Chat**: streams inline code suggestions and chat responses incrementally, with careful client-side debouncing to avoid visual flicker as suggestions are generated and often revised token by token.
- **Perplexity AI**: streams both the generated answer text and incrementally-arriving citations/sources, an example of interleaving multiple distinct data types within one streaming response.
- **Vercel's AI SDK**: a widely-used open-source library specifically built to standardize streaming LLM responses (including tool calls and structured output) across multiple providers for frontend frameworks, addressing much of the buffering/parsing complexity covered on this page as a reusable library.
- **Google's Gemini API**: offers a streaming generateContentStream mode with a broadly similar delta-based chunking model, reflecting the strong industry convergence on this pattern.
`,

  "best-practices": `
1. **Stream by default for any user-facing, interactive LLM response** where total generation time meaningfully exceeds what feels instant (roughly 300-500ms) -- the perceived-latency win is close to free relative to its implementation cost.
2. **Never buffer the full response server-side before forwarding anything** -- verify with an actual test (not just code review) that your endpoint forwards the first chunk to the CLIENT quickly, not just that it calls the upstream provider with stream=True.
3. **Always accumulate and persist the full response server-side**, even though you're also streaming it -- you need the complete text for conversation history, logging, and billing/usage tracking regardless of streaming.
4. **Buffer tool-call arguments across chunks and only parse/execute once the completion signal fires** -- never attempt to parse a partial arguments string.
5. **Use a partial-JSON-aware parser for streaming structured output**, rather than either blocking until the object is complete or attempting standard strict JSON parsing on every partial chunk.
6. **Batch client-side rendering to the browser's paint cadence** (requestAnimationFrame or a small debounce window) rather than re-rendering synchronously on every single token, especially for markdown or syntax-highlighted content.
7. **Explicitly model stream state** (idle/streaming/done/error/cancelled) in the frontend rather than inferring status implicitly from whether more data has arrived recently.
8. **Support genuine mid-stream cancellation**, both client-side (aborting the fetch/EventSource) and server-side (stopping upstream token consumption the moment the client disconnects), for cost control and resource hygiene.
9. **Treat a dropped connection as an expected, first-class event**, not an exceptional case -- decide explicitly whether to auto-resume, show a partial result with a retry option, or discard, rather than leaving the UI in an ambiguous stuck state.
10. **Respect backpressure signals on both the server write path and the client render path** rather than assuming an unbounded buffer is always safe.
11. **Distinguish a clean stream end from an in-band error event from an abrupt disconnect** using explicit, distinct signals (a done event, an error event, and a connection-close handler respectively), never conflating any two of them.
12. **Test through your actual production network path** (proxies, load balancers), since intermediary buffering (covered in depth in the **Server-Sent Events** skill) can silently defeat streaming exactly as it does for any SSE-based system.
`,

  "anti-patterns": `
### Server-side full-response buffering (the single most common streaming anti-pattern)

~~~python
# WRONG -- calls the upstream provider with stream=True, but accumulates
# the ENTIRE response before sending anything at all to the actual client.
# This provides ZERO benefit over a plain non-streaming call, while adding
# unnecessary complexity.
@app.post("/chat")
async def chat(request: ChatRequest):
    full_text = ""
    for chunk in llm_client.chat.completions.create(
        model="gpt-4o", messages=request.messages, stream=True
    ):
        delta = chunk.choices[0].delta.content
        if delta:
            full_text += delta
    return {"text": full_text}   -- client waits the FULL generation time regardless

# RIGHT -- forward each delta to the client the instant it is received
@app.post("/chat")
async def chat(request: ChatRequest):
    async def gen():
        for chunk in llm_client.chat.completions.create(
            model="gpt-4o", messages=request.messages, stream=True
        ):
            delta = chunk.choices[0].delta.content
            if delta:
                yield "data: " + json.dumps({"text": delta}) + "\\n\\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
~~~

This is deceptively easy to introduce -- the code even uses stream=True and looks like a streaming implementation -- but if the outer HTTP handler collects all chunks before returning a single JSON body, the client experiences exactly the same latency as a non-streaming call, while the team believes streaming is "already implemented."

### Naive re-render causing visible flicker

~~~javascript
// WRONG -- re-parsing and re-rendering markdown from scratch on every
// single token can cause visible flicker, especially for content with
// syntax highlighting or complex formatting, since the ENTIRE rendered
// output is torn down and rebuilt dozens of times per second.
eventSource.onmessage = (e) => {
  fullText += JSON.parse(e.data).text;
  container.innerHTML = fullMarkdownRender(fullText);   -- full re-render, every token
};

// RIGHT -- batch updates and/or use an incremental-diffing renderer
// (a virtual-DOM-based approach, or explicit append-only text nodes
// for content that hasn't changed)
~~~

Flicker is a genuine, user-visible defect, not a cosmetic nitpick -- it undermines the exact perceived-smoothness benefit streaming exists to provide; batching renders to the paint cadence (covered in Advanced Concepts) is the standard fix.

### Not handling stream disconnects gracefully

~~~javascript
// WRONG -- no error or close handling at all; if the connection drops
// mid-response, the UI silently stops updating with no indication to
// the user of what happened or whether to retry.
const eventSource = new EventSource("/chat");
eventSource.onmessage = (e) => appendText(JSON.parse(e.data).text);

// RIGHT -- explicit error/close handling with a clear UI state
eventSource.onerror = () => {
  eventSource.close();
  setStatus("error");
  showRetryOption();
};
~~~

A stream that silently stops (network blip, server restart, client backgrounded then foregrounded) with no explicit handling leaves the user staring at an incomplete response with no way to know if it's still coming, if it failed, or if they should retry -- treat every one of these as an expected outcome to design for, not an edge case to ignore.

### Other production-grade anti-patterns

- **Parsing partial JSON with a strict parser** and treating the resulting exception as a fatal error rather than an expected, transient state during structured-output streaming.
- **Executing a tool call before its arguments are fully buffered and validated**, risking executing with truncated or malformed arguments.
- **Ignoring backpressure**, allowing an unbounded in-memory buffer to grow for a slow client under load.
- **Conflating "stream ended" with "answer is final and correct"**, without checking finish_reason for length limits, content filtering, or tool-call requirements.
`,

  performance: `
### Rule zero: measure time-to-first-token separately from total time

Streaming's entire value proposition lives in time-to-first-token (TTFT), not total completion time -- a system that has excellent total throughput but a slow TTFT (due to queueing, cold starts, or an unnecessary buffering step before the first forwarded chunk) still feels slow to the user, even though it "streams."

### The performance hierarchy (apply in order)

1. **Verify no accidental server-side buffering** before the first byte is forwarded -- confirm with a direct timing test (measuring when the CLIENT receives its first byte, not just when the upstream call was issued) that TTFT is close to the upstream provider's own TTFT, not inflated by your own relay layer.
2. **Minimize per-chunk processing overhead** on the relay path -- avoid expensive synchronous work (heavy logging, synchronous database writes) inside the per-chunk forwarding loop; defer non-critical work to after the stream completes where possible.
3. **Batch client-side rendering to the browser's paint cadence**, since rendering faster than the display can paint provides no user-visible benefit and can introduce jank.
4. **Choose an appropriate chunk granularity** -- forwarding individual tokens (rather than larger batched groups) generally gives the best perceived responsiveness for chat-style text, at the cost of slightly more per-chunk overhead; for very high-throughput scenarios, a small batching window (a few tokens or a few milliseconds) can reduce overhead with negligible perceived-latency cost.
5. **Profile the full path end to end** (model -> serving layer -> relay backend -> transport -> client render), since a bottleneck anywhere in this chain can silently erase most of streaming's perceived-latency benefit even if every individual component looks fast in isolation.

### Numbers worth knowing (illustrative, verify against your own provider/model)

A well-configured chat completion commonly achieves a TTFT in the low hundreds of milliseconds to low single-digit seconds depending on model size, prompt length, and load, with subsequent tokens arriving at a rate driven by the model's own tokens/second throughput (see the **Inference** and **Latency** skills for the underlying serving-side numbers) -- any relay-layer overhead beyond roughly tens of milliseconds per hop is worth investigating as a potential accidental-buffering or inefficient-processing issue.
`,

  scalability: `
Streaming's scalability story largely inherits from its underlying transport (see the **Server-Sent Events** and **WebSockets** skills for the connection-count and cross-instance-broadcast considerations in full), with one addition specific to LLM streaming: each active stream corresponds to an in-progress, resource-consuming generation on the INFERENCE side, not merely an idle open connection -- meaning connection count and inference-capacity planning must be considered together, not independently.

### Why concurrent streams are more expensive than concurrent idle connections

~~~mermaid
flowchart LR
    Clients["N concurrent streaming clients"] --> Relay["Relay backend\n(connection-count scaling,\nsame as any SSE/WS service)"]
    Relay --> Inference["Inference capacity\n(GPU/accelerator-bound,\nsame N generations running concurrently)"]
~~~

Unlike a typical live-notification SSE stream (which is mostly idle between infrequent updates), each concurrent LLM streaming connection typically corresponds to an ACTIVELY GENERATING model call for its full duration -- meaning the true scaling bottleneck is very often inference capacity (covered in the **Inference** skill), not the relay/transport layer's connection-handling capacity, which is comparatively cheap.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Relay backend connection-handling capacity | Standard horizontal scaling of the relay service, same as any streaming-transport service (see **Server-Sent Events** / **WebSockets**) |
| Upstream inference capacity for many concurrent generations | Request queuing, autoscaling inference workers, and admission control (see the **Inference** skill) |
| A slow client causing server-side buffer growth under load | Explicit backpressure handling (pausing upstream consumption, or dropping/timeouts for persistently unresponsive clients) |
| Cost of continuing to generate for a disconnected client | Explicit disconnect detection stopping upstream consumption immediately (covered in Advanced Concepts and Production Usage) |
`,

  security: `
### Never trust partially-streamed data as complete before it is signaled complete

~~~python
# WRONG -- executing a tool call the moment SOME arguments text has
# arrived, without waiting for and validating the completion signal,
# risking execution with truncated or attacker-influenced malformed input.
if tool_call_buffer:
    execute_tool(tool_call_name, json.loads(tool_call_buffer))   -- unsafe, may be incomplete

# RIGHT -- only parse and execute once the stream explicitly signals completion,
# and validate the parsed arguments against an expected schema before executing
if finish_reason == "tool_calls":
    args = json.loads(tool_call_buffer)
    validate_against_schema(args, expected_schema)   -- see the Tool Calling skill
    execute_tool(tool_call_name, args)
~~~

Treating incomplete, buffered data as actionable before an explicit completion signal is both a correctness bug and a security-relevant one -- tool execution with malformed or attacker-influenced arguments is a materially worse outcome than a delayed but validated execution.

### Authentication and authorization for streaming endpoints

Since a streaming endpoint is typically a long-lived HTTP response (SSE) or a persistent connection (WebSocket), apply the same authentication discipline covered in the **Server-Sent Events** and **WebSockets** skills -- validate the caller's identity and authorization BEFORE beginning generation (not merely before returning the first byte), since beginning an expensive generation for an unauthorized caller is itself a cost and abuse vector.

### Rate limiting and abuse prevention

- **Rate-limit stream initiation** per user/API key, since each stream corresponds to a real, billable inference call, unlike a cheap idle notification connection.
- **Enforce generation limits (max tokens, timeouts) server-side**, not merely client-side, since a malicious or buggy client cannot be trusted to stop a runaway generation on its own.
- **Sanitize any streamed content rendered as HTML**, applying the same output-encoding discipline you would for any user-facing or model-generated content, since streamed markdown/HTML rendering introduces the same XSS surface as any other dynamically rendered content -- see the **Web Security** and **OWASP Top 10** skills.

### Cost-control specific to streaming cancellation

Explicitly stopping upstream token generation the instant a client disconnects (covered in Advanced Concepts) is also a security/abuse-prevention measure -- without it, a client that opens many streams and immediately disconnects can still drive real inference cost if the server keeps generating regardless.
`,

  testing: `
### Testing a streaming endpoint emits incremental chunks, not one blocking response

~~~python
import time

def test_stream_emits_incrementally(client):
    start = time.monotonic()
    first_chunk_time = None
    with client.stream("POST", "/chat", json={"message": "hello"}) as response:
        for chunk in response.iter_lines():
            if first_chunk_time is None:
                first_chunk_time = time.monotonic()
            # keep consuming to let the stream complete
    total_time = time.monotonic() - start
    assert first_chunk_time - start < 1.0   -- first byte should arrive quickly
    assert first_chunk_time < total_time * 0.5   -- first chunk well before total completion
~~~

This test directly targets the single most important streaming regression -- a server that accidentally buffers the full response would fail the first_chunk_time assertion, since its "first chunk" would arrive at essentially the same time as the last.

### Testing tool-call argument buffering across fragmented chunks

~~~python
def test_tool_call_arguments_reassembled_correctly(mock_provider):
    mock_provider.stream_chunks([
        {"tool_call_delta": '{"loc'},
        {"tool_call_delta": 'ation":"P'},
        {"tool_call_delta": 'aris"}'},
        {"finish_reason": "tool_calls"},
    ])
    result = run_streaming_chat(mock_provider)
    assert result.tool_call_args == {"location": "Paris"}
~~~

Explicitly testing that fragmented argument chunks (split at arbitrary, awkward byte boundaries) reassemble into the correct final object catches the exact class of bug that only manifests with real, unpredictable chunk boundaries -- a hazard that a test using only whole, unfragmented payloads will never catch.

### Testing mid-stream disconnect handling

~~~python
async def test_upstream_generation_stops_on_client_disconnect(mock_provider):
    request = simulate_client_disconnect_after(n_chunks=2)
    await run_streaming_handler(request, mock_provider)
    assert mock_provider.tokens_consumed <= 2   -- confirms upstream consumption actually stopped
~~~

### The senior testing doctrine

- Test time-to-first-chunk explicitly, not just eventual full-response correctness, to catch accidental server-side buffering.
- Test with deliberately awkward chunk/fragment boundaries for tool-call arguments and structured output, not only clean, whole payloads.
- Test explicit disconnect and cancellation paths, confirming upstream resource consumption actually stops.
- Test partial-JSON parsing against a range of truncation points (mid-string, mid-key, mid-array), not just one example.
- Test rendering logic doesn't flicker or throw under a rapid sequence of many small updates, ideally with an automated visual-regression or frame-timing check for UI-critical paths.
`,

  debugging: `
### The toolbox, in escalation order

1. **Use curl -N against your own endpoint** to directly observe whether chunks arrive incrementally or all at once -- the fastest way to confirm or rule out accidental server-side buffering (see the **Server-Sent Events** skill for this same technique applied at the transport level).
2. **Log a timestamp on the first forwarded chunk and on the last**, comparing the gap against the upstream provider's own reported timing, to isolate whether latency is being added by your relay layer specifically.
3. **Inspect raw, undecoded network traffic** (browser DevTools' Network tab, or a proxy tool) to see the ACTUAL byte-level chunk boundaries arriving at the client, since these rarely align neatly with logical event boundaries and are a common source of parsing bugs.
4. **Reproduce tool-call/structured-output bugs with a fixed, logged sequence of exact fragment boundaries**, since these bugs are often boundary-dependent and hard to reproduce with a fresh live call each time.
5. **Check for silent client-side render loop issues** (a batched-render implementation that never actually flushes, an infinite loop in a partial-JSON repair function) using browser profiling tools when the UI appears to hang despite the network stream continuing to deliver data.

### Debugging common streaming-specific symptoms

- "Everything arrives at once, right at the end" -- almost always server-side full-response buffering; check every layer between the model and the client for a step that accumulates before forwarding.
- "Tool calls fail with a JSON parse error intermittently" -- almost always attempting to parse tool-call arguments before the completion signal, or an incorrect assumption about how fragments align with JSON token boundaries.
- "The UI flickers or stutters while streaming" -- a naive synchronous full re-render on every token; batch to the paint cadence.
- "The response silently stops partway through with no error shown" -- missing error/close event handling on the client; add explicit onerror/close handling and a corresponding UI state.
- "The server keeps consuming tokens (and cost) after the user navigates away" -- missing client-disconnect detection server-side; add an explicit disconnect check in the forwarding loop.
`,

  monitoring: `
### Key signals to track

- **Time-to-first-token (TTFT)**, tracked as its own dedicated metric distinct from total completion time -- the single most important streaming-specific signal, since it directly measures the perceived-latency benefit streaming is meant to provide.
- **Inter-token latency distribution**, useful for detecting stalls or unexpectedly bursty delivery that might indicate an intermediary buffering issue (see the **Server-Sent Events** skill for the transport-level version of this same concern).
- **Stream completion rate versus abrupt-disconnect rate**, distinguishing clean completions, in-band errors, and client/network-caused disconnects as three separate, separately-alerted signals.
- **Upstream tokens consumed per stream versus tokens actually delivered to the client**, a direct measure of whether disconnect handling is correctly stopping wasted upstream consumption.
- **Tool-call argument parse failure rate**, tracked distinctly from general error rate, since a rising trend here often points to a fragment-buffering bug rather than a genuine model or infrastructure issue.

### Tools

Standard APM tooling instrumented with the streaming-specific custom metrics above; synthetic monitoring that specifically measures TTFT through the real production path (not just eventual success/failure) to catch buffering regressions before users notice; browser performance tooling (Performance/Profiler tabs) for diagnosing client-side render-related jank during development.

### Alerting priorities

Alert on TTFT regressions specifically (a strong, early signal of an accidental-buffering regression anywhere in the relay path), on a rising abrupt-disconnect rate (which may indicate a client-side bug, a network issue, or an infrastructure regression), and on any nonzero tool-call argument parse failure rate, since this should be at or near zero in a correctly implemented system.
`,

  deployment: `
### A production Dockerfile for a streaming relay backend (FastAPI/Uvicorn)

~~~
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt   -- keep the image lean; no build cache bloat

COPY . .

# --timeout-keep-alive extended well beyond the default, since a long-running
# generation must not have its underlying connection prematurely closed by
# the ASGI server's own idle/keep-alive timeout
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", \\
     "--timeout-keep-alive", "120", "--workers", "4"]
~~~

The explicit --timeout-keep-alive extension is a genuinely essential, easy-to-overlook detail for any streaming deployment: a default keep-alive timeout tuned for typical short-lived request/response traffic can prematurely close a connection still actively streaming a long generation.

### Reverse proxy / load balancer configuration

~~~
location /chat {
    proxy_pass http://backend;
    proxy_buffering off;              -- essential: see the Server-Sent Events skill
    proxy_read_timeout 300s;          -- extend beyond a typical short-request timeout
    proxy_set_header Connection "";
    chunked_transfer_encoding off;
}
~~~

Every streaming deployment inherits the exact same no-buffering and extended-timeout configuration requirements covered in depth in the **Server-Sent Events** skill -- this is not a separate concern specific to LLM streaming, but the same transport-level discipline applied to this specific application.

### CI/CD pipeline considerations

Include an automated test in the deployment pipeline that measures actual TTFT through a staging environment configured identically to production (same proxy/load balancer chain), specifically to catch a buffering or timeout-configuration regression before it reaches real users. See the **CI/CD** skill for the broader pipeline discipline this builds on.
`,

  "production-checklist": `
Before a streaming LLM endpoint takes real production traffic:

- [ ] Confirmed (via direct timing test, not code review alone) that no layer between the model and the client buffers the full response before forwarding
- [ ] Time-to-first-token measured and within an acceptable target for the product's latency expectations
- [ ] Tool-call arguments buffered fully and validated against a schema before execution, never executed from a partial fragment
- [ ] Structured-output streaming uses a partial-JSON-aware parser rather than naive strict parsing on every chunk
- [ ] Client explicitly models stream state (idle/streaming/done/error/cancelled) rather than inferring status implicitly
- [ ] Client-side rendering batched to avoid flicker/jank under rapid token arrival
- [ ] Mid-stream disconnect and cancellation stop upstream token consumption immediately, server-side
- [ ] finish_reason (or provider equivalent) explicitly handled for every possible value, not just the natural-completion case
- [ ] Backpressure handling in place on the server write path (respecting drain/flow-control signals)
- [ ] Reverse proxy/load balancer configured for no-buffering and an appropriately extended timeout
- [ ] Full response persisted server-side (even on partial completion) for conversation history and auditing
- [ ] Rate limiting applied to stream initiation, given each stream corresponds to a real, billable inference call
- [ ] Monitoring in place for TTFT, disconnect rate, and tool-call parse failure rate specifically
- [ ] Load tested with a realistic mix of fast and deliberately slow/unresponsive simulated clients
`,

  "common-mistakes": `
1. **Accidentally buffering the full response server-side** despite calling the upstream provider with streaming enabled, providing zero actual latency benefit to the end client.
2. **Parsing tool-call arguments before the completion signal fires**, causing intermittent JSON parse failures on arbitrary fragment boundaries.
3. **Re-rendering the entire output synchronously on every single token**, causing visible flicker or jank, especially for markdown or syntax-highlighted content.
4. **Not handling mid-stream disconnects or errors explicitly**, leaving the UI silently stuck with no indication of failure or a path to retry.
5. **Not stopping upstream token consumption when the client disconnects**, wasting real inference cost on generations nobody is listening to.
6. **Assuming finish_reason always means "the final answer is ready"**, without checking for length limits, content filtering, or a pending tool call.
7. **Treating a streaming response as a flat sequence of text fragments** in a multi-step agent context, losing track of which logical segment (text run versus tool call) is currently open.
8. **Ignoring backpressure**, allowing an unbounded buffer to grow server-side for a slow or unresponsive client under load.
9. **Not testing with deliberately awkward chunk/fragment boundaries**, missing boundary-dependent bugs that only manifest with real, unpredictable network chunking.
10. **Confusing this application-level streaming skill with the transport protocol itself**, re-solving problems (proxy buffering, connection handling) that the **Server-Sent Events** or **WebSockets** skill already addresses at the correct layer.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Entire response arrives at once despite a "streaming" implementation | A layer between the model and the client accumulates the full response before forwarding anything | Verify and fix the specific layer (often the outer HTTP handler) that is buffering; confirm with a direct timing test |
| JSON parse error on tool-call arguments | Attempting to parse a partial, incomplete arguments fragment | Buffer across chunks; parse only once the completion signal fires |
| UI flickers or stutters during streaming | Synchronous full re-render on every incoming token | Batch renders to the browser's paint cadence (requestAnimationFrame or a small debounce window) |
| Stream silently stops with no visible error | Missing error/close event handling on the client | Add explicit onerror/close handlers with a corresponding UI error state |
| Server keeps consuming tokens after client disconnects | Missing client-disconnect detection in the server forwarding loop | Check for disconnection explicitly on every iteration and close the upstream generation immediately |
| Partial JSON structured output fails to render at all until fully complete | Using a strict JSON parser directly on partial data | Use a partial-JSON-aware parser that repairs unterminated strings/objects/arrays before rendering |
| Connection times out mid-generation for long responses | Default ASGI server or reverse proxy timeout tuned for short requests | Extend keep-alive/read timeout explicitly for streaming endpoints |
| Server memory grows under load with many slow clients | Backpressure signals ignored on the write path | Respect drain/flow-control signals; pause producing further chunks until the client catches up |
`,

  faqs: `
**Does streaming make the model generate responses faster overall?**
No -- total generation time is essentially unchanged (streaming adds a small amount of protocol/chunking overhead, not a speedup); what streaming changes is time-to-first-token, which is typically dramatically smaller than total completion time, transforming PERCEIVED latency without touching actual generation speed.

**Should I stream every LLM call in my application?**
Not necessarily -- streaming's benefit is specifically for interactive, user-facing responses where a human is waiting and watching; batch jobs, offline data-extraction pipelines, and evaluation harnesses typically gain nothing from streaming and can add unneeded complexity by adopting it.

**Why can't I just parse each streamed chunk of a tool call's arguments as JSON?**
Because each chunk is a FRAGMENT of a JSON string, not a complete, valid JSON document on its own -- json.loads (or your language's equivalent) will fail on nearly every intermediate fragment; the correct pattern is to buffer the raw string across all chunks and parse only once a completion signal indicates the full string has arrived.

**What is the difference between this skill and the Server-Sent Events skill?**
This page covers the LLM-specific application layer built ON TOP of a streaming transport -- delta/event semantics, tool-call and structured-output partial-data handling, incremental rendering, backpressure, and mid-stream error handling. The **Server-Sent Events** skill covers the underlying wire protocol in depth (the text/event-stream format, the EventSource API, proxy buffering at the HTTP layer) that this page assumes as its transport.

**How do I handle a dropped connection mid-response?**
Treat it as an expected outcome, not an exception: detect it explicitly (an onerror/close handler client-side, a disconnect check server-side), decide on a defined behavior (show the partial response with a retry option, attempt an automatic resume if you've implemented event-ID-based resumption, or discard and prompt the user to resend), and always persist whatever partial response was generated server-side regardless of what the client ultimately sees.

**How do I stream structured output (JSON) without breaking on partial data?**
Use a partial-JSON-aware parser that repairs a truncated JSON fragment (closing unterminated strings, arrays, and objects) into the closest valid JSON before each parse attempt, letting you render a best-effort partial view of the growing object rather than either failing on every intermediate chunk or waiting for full completion before rendering anything.

**Why does my streaming UI flicker?**
Almost always a naive full re-render triggered on every single incoming token; batch incoming deltas and flush the UI update at the browser's own paint cadence (requestAnimationFrame or a small debounce window) instead.
`,

  "interview-questions": `
### Junior level

1. **What is the core benefit of streaming an LLM response, and what does it NOT improve?**
   Model answer: it dramatically improves PERCEIVED latency by delivering the first token in a small fraction of the total generation time, rather than requiring the user to wait for the entire response; it does NOT make the model generate faster overall -- total completion time is essentially unchanged.

2. **What is time-to-first-token (TTFT), and why is it the key streaming metric?**
   Model answer: TTFT is the time from request submission to the first piece of generated content reaching the client; it's the key metric because it directly measures the specific latency perception streaming is designed to improve, as opposed to total completion time which streaming does not change.

3. **Why can't you safely parse a partial chunk of streamed tool-call arguments as JSON?**
   Model answer: each chunk is only a fragment of a growing JSON string, not a complete document, so it is very often syntactically invalid JSON until the full string has arrived; parsing must wait for an explicit completion signal.

4. **What should a client do when a streaming connection drops unexpectedly mid-response?**
   Model answer: treat it as an expected, first-class event -- show a clear error or partial-result state to the user, offer a retry, and never leave the UI silently stuck with no feedback.

5. **Why might a "streaming" backend implementation still feel just as slow as a non-streaming one to the end user?**
   Model answer: if any layer between the model and the client (commonly the backend's own HTTP handler) accumulates the full response before sending anything, the client experiences the same total wait despite the upstream call itself using streaming.

### Senior level

6. **Design a robust client-side buffering strategy for streaming tool-call arguments in a multi-step agent response that interleaves text and tool calls.**
   Model answer: maintain explicit state for which logical segment is currently open (a text run or an in-progress tool call), buffer each tool call's raw argument string separately across its own chunks, only parse and validate against an expected schema once that specific tool call's completion signal fires, execute it, and then resume accumulating the next segment -- never conflating multiple segments' partial data or acting on unvalidated, incomplete arguments.

7. **How would you implement backpressure handling in a streaming relay backend, and what happens if you ignore it?**
   Model answer: respect the underlying write API's backpressure signal (a false return from Node's response.write, or an equivalent async-await point in other stacks) by pausing further writes (and ideally pausing consumption from the upstream provider) until a drain event fires; ignoring this risks an unboundedly growing in-process buffer for slow clients, a genuine memory-exhaustion risk under load with many concurrent slow connections.

8. **How do you handle streaming structured output where the client needs to render a partial, in-progress JSON object?**
   Model answer: use a partial-JSON repair pass (closing unterminated strings, arrays, and objects) on the accumulated text before each parse attempt, rendering a best-effort partial view of the object as it grows, rather than either blocking rendering until the object is fully complete or attempting a strict JSON parse on every raw partial fragment (which will fail on nearly every intermediate state).

9. **What is the correct behavior when a client disconnects mid-generation, and why does it matter beyond just the UI?**
   Model answer: the server should detect the disconnect explicitly (checking for it in the per-chunk forwarding loop) and immediately stop consuming further tokens from the upstream provider -- beyond UI correctness, this is a direct cost-control and resource-hygiene concern, since continuing to generate for nobody wastes real, billable inference capacity.

10. **Explain the architectural distinction between the transport layer, the protocol/format layer, and the UX/rendering layer in a streaming LLM system, and give one failure mode specific to each.**
    Model answer: the transport layer (SSE/WebSockets) delivers bytes incrementally -- a failure here is intermediary proxy buffering silently defeating delivery; the protocol/format layer represents partial data as text deltas, tool-call argument fragments, or partial JSON -- a failure here is parsing a fragment as if it were complete; the UX/rendering layer consumes and displays incoming data -- a failure here is naive synchronous re-rendering causing flicker. Most real bugs occur specifically at the boundary between two of these layers, not cleanly within just one.

11. **Why does an LLM streaming backend often need to be both a streaming client and a streaming server simultaneously, and what should live in that layer?**
    Model answer: because the backend both consumes the upstream provider's own token stream and relays a stream onward to its own frontend client; the backend layer should apply authentication, business logic (content filtering, rate limiting), logging, and tool execution, while relaying tokens through with minimal added latency -- never accumulating the full response before forwarding.

12. **How would you test that a streaming endpoint is genuinely streaming rather than silently buffering the full response?**
    Model answer: measure the time to the first received chunk versus total completion time directly in an automated test, asserting the first chunk arrives meaningfully earlier than the full response would under a non-streaming call -- code review alone (confirming stream=True is passed to the upstream provider) is insufficient, since an outer accumulation step can defeat streaming while looking correct in the code.
`,

  "coding-questions": `
### Problem 1: Implement an SSE event parser that handles partial/split events across chunk boundaries

~~~javascript
// Given a growing raw text buffer of SSE-formatted data (data:/event:/id:
// lines separated by blank lines), return an array of COMPLETE parsed
// events plus any trailing incomplete text to carry forward.
function parseSseEvents(buffer) {
  const events = [];
  const parts = buffer.split("\\n\\n");   // an event ends at a blank line
  const remainder = parts.pop();          // the LAST part may be incomplete -- keep it

  for (const part of parts) {
    const lines = part.split("\\n");
    let eventType = "message";
    let data = "";
    for (const line of lines) {
      if (line.startsWith("event:")) eventType = line.slice(6).trim();
      if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    if (data) {
      events.push({ type: eventType, data: JSON.parse(data) });
    }
  }
  return { complete: events, remainder };
}

// Complexity: O(n) in the length of the buffer per call, since we scan
// the whole accumulated buffer each time -- acceptable for typical chat
// message sizes; for very high-throughput streams, consider tracking
// a scan offset to avoid re-scanning already-processed text.
// Follow-up: how would you handle a MALFORMED event (missing a data:
// line, or invalid JSON in the data payload) without crashing the
// entire parse loop? (Answer: wrap the per-event parse in a try/catch,
// skip and log the malformed event, and continue processing the rest.)
~~~

### Problem 2: Implement a partial-JSON repair function for streaming structured output

~~~python
def repair_partial_json(fragment: str) -> str:
    """
    Given a possibly-truncated JSON fragment, return the closest valid
    JSON string by closing any unterminated string, array, or object,
    so a caller can parse a best-effort partial view.
    """
    stack = []
    in_string = False
    escape = False
    result = []

    for ch in fragment:
        result.append(ch)
        if escape:
            escape = False
            continue
        if ch == "\\\\":
            escape = True
            continue
        if ch == '"' and not escape:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in "{[":
            stack.append(ch)
        elif ch in "}]":
            if stack:
                stack.pop()

    if in_string:
        result.append('"')   # close an unterminated string first

    for opener in reversed(stack):
        result.append("}" if opener == "{" else "]")

    return "".join(result)

# Example: repair_partial_json('{"name": "Rome", "population": 28')
#       -> '{"name": "Rome", "population": 28"}'   -- NOTE: a genuinely
#          robust version must also handle a truncated NUMBER or an
#          unterminated final VALUE gracefully; this sketch illustrates
#          the core bracket/string-closing idea, not a production-ready
#          implementation -- prefer a well-tested library for real use.
# Complexity: O(n) in fragment length.
# Follow-up: how would you handle a fragment truncated in the middle of
# a numeric literal (e.g. ending in "28" with more digits still to come)?
# (Answer: a naive close-brackets approach already handles this correctly
# since a bare trailing number is already valid JSON on its own; the
# harder case is a fragment truncated mid-KEY, before its closing quote
# and colon, which this simple approach cannot meaningfully repair --
# such a key/value pair should typically be dropped from the partial view
# entirely until it completes.)
~~~

### Problem 3: Implement backpressure-aware chunk forwarding for a Node.js streaming endpoint

~~~javascript
async function forwardStream(upstreamAsyncIterable, res) {
  for await (const chunk of upstreamAsyncIterable) {
    const canContinue = res.write("data: " + JSON.stringify(chunk) + "\\n\\n");
    if (!canContinue) {
      // Backpressure: the OS-level write buffer is full.
      // Pause forwarding until the stream signals it has drained.
      await new Promise((resolve) => res.once("drain", resolve));
    }
    if (res.destroyed) break;   // client disconnected -- stop consuming upstream
  }
  res.end();
}

// Complexity: O(n) in the number of chunks; the key correctness property
// is that this function never proceeds to the next chunk while the
// write buffer is full, bounding memory growth for a slow client.
// Follow-up: how would you additionally stop CONSUMING from the upstream
// provider (not just pause forwarding) while waiting for drain, to avoid
// wasting inference cost during a prolonged slow-client stall? (Answer:
// if the upstream iterable supports pausing/backpressure itself -- for
// example an async generator you control -- await the drain BEFORE
// pulling the next upstream chunk, rather than pulling eagerly and
// buffering in application memory.)
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a minimal streaming chat endpoint and consumer

Implement a FastAPI endpoint that calls an LLM provider with stream=True and relays deltas via Server-Sent Events, plus a plain HTML/JavaScript page using EventSource (or fetch/ReadableStream) to render the growing response. Deliverable: a working local demo where the response visibly "types out" rather than appearing all at once; measure and report your endpoint's time-to-first-chunk versus total completion time. Skills exercised: **Server-Sent Events**, basic backend/frontend integration.

### Lab 2 (Intermediate): Add tool-call streaming with correct argument buffering

Extend Lab 1's endpoint to support at least one tool (a simple weather or lookup function), correctly buffering streamed tool-call argument fragments and only executing the tool once a complete, schema-validated JSON object exists. Deliverable: a test suite that feeds deliberately fragmented argument chunks (split at awkward byte boundaries) and asserts correct reassembly and execution. Skills exercised: **Tool Calling**, JSON handling, schema validation.

### Lab 3 (Intermediate/Advanced): Implement partial-JSON structured output rendering

Build a frontend component that renders a streaming, schema-constrained JSON object (for example, a structured product description with several fields) progressively as it streams, using a partial-JSON repair approach rather than waiting for full completion. Deliverable: a UI that visibly fills in fields as they become available, with a fallback that gracefully handles a fragment truncated mid-key. Skills exercised: structured output patterns, frontend state management.

### Lab 4 (Production): Add robust disconnect handling, backpressure, and monitoring

Extend your endpoint with explicit client-disconnect detection (stopping upstream token consumption immediately), backpressure-aware write handling, and TTFT/disconnect-rate monitoring instrumentation. Deliverable: a load test simulating a mix of fast and deliberately slow/unresponsive clients, with metrics demonstrating that a slow client does not cause unbounded memory growth and that disconnected clients stop consuming upstream tokens promptly. Skills exercised: **Monitoring**, **Performance**, production reliability engineering.
`,

  "real-projects": `
### Project 1: A production-grade streaming chat application

Build a full chat application (backend relay plus frontend) supporting: token streaming via SSE, tool calling with correctly buffered arguments, mid-stream cancellation (a working "stop" button), explicit reconnection/error UI states, and conversation persistence that survives partial completions. Engineering requirements: TTFT under a defined target under realistic load; automated tests for fragment-boundary tool-call parsing; load testing with simulated slow clients demonstrating bounded memory use.

### Project 2: A multi-provider streaming abstraction library

Build a small library that normalizes streaming responses (text deltas, tool calls, structured output) across at least two different LLM providers' distinct event formats into one consistent internal representation your application code can consume uniformly. Engineering requirements: a documented internal event schema; adapter implementations for each provider; a test suite verifying correct behavior against recorded, real (or realistically fragmented, mocked) provider stream captures for each provider.

### Project 3: A streaming structured-output extraction pipeline with a live progress UI

Build a system that extracts structured data (for example, several fields from a long document) via a schema-constrained streaming LLM call, rendering a live-updating UI that fills in each field as it becomes available using partial-JSON parsing, with graceful handling of fields truncated mid-value at the point a user might cancel generation early. Engineering requirements: a partial-JSON repair implementation with test coverage across varied truncation points; a clear UI distinction between "field confirmed complete" and "field still streaming, may still change."
`,

  "case-studies": `
### OpenAI's convergence on delta-based SSE for ChatGPT

OpenAI's decision to stream chat responses via Server-Sent Events with a delta-only event payload (each chunk carrying only new content, not the full text-so-far) became the de facto industry convention that most other providers subsequently adopted. Lesson: choosing a genuinely minimal per-chunk payload format (deltas, not full accumulated state) keeps per-event overhead low and scales well to very long responses, at the cost of requiring every consumer to correctly implement client-side accumulation -- a worthwhile, now nearly universal tradeoff.

### Anthropic's structured, named streaming event types

Rather than a flat sequence of text deltas, Anthropic's Messages API streams distinct, explicitly named events (content block start, delta, stop, message stop, and others) even for a single-turn text response, giving clients unambiguous structural signals rather than requiring them to infer segment boundaries implicitly. Lesson: explicit event typing pays for itself the moment a stream needs to represent more than one kind of content (interleaved text and tool use, for instance) -- a lesson directly reflected in this page's emphasis on treating a stream as a segmented state machine rather than a flat text sequence.

### A widely-discussed community pattern: partial-JSON parsing libraries emerging for structured output

As schema-constrained structured output streaming became common, the developer community converged on shared, reusable "partial JSON parser" libraries (rather than every team writing an ad hoc repair function) specifically to handle the recurring, tricky truncation-point edge cases (mid-key truncation, mid-number truncation) correctly once, rather than repeatedly. Lesson: a genuinely tricky, narrowly-scoped parsing problem that recurs across many teams is a strong signal to reach for (or contribute to) a shared, well-tested library rather than reinventing a bespoke, under-tested version for each project.

### Vercel's AI SDK standardizing streaming across providers

Vercel's AI SDK was built specifically to abstract over the meaningfully different streaming event formats of multiple LLM providers, offering frontend framework integrations that handle chunk buffering, tool-call argument reassembly, and partial-JSON rendering as a reusable layer rather than something every application team reimplements from scratch. Lesson: once a pattern (streaming's protocol/format-layer complexity) is well-understood industry-wide, a mature ecosystem typically produces shared libraries that substantially reduce the amount of this page's protocol-layer content a given application team needs to hand-roll themselves -- while the UX/rendering-layer judgment calls (batching strategy, flicker avoidance, error-state design) generally still require application-specific decisions.
`,

  comparisons: `
| Approach | Perceived latency | Implementation complexity | Best fit |
|----------|-------------------|----------------------------|----------|
| **No streaming (blocking request/response)** | Poor for any non-trivial response length -- full wait, zero feedback | Lowest | Batch jobs, background processing, evaluation harnesses where nobody is watching in real time |
| **Client-side fake "typing" animation over a fully-received response** | Slightly better FEEL, but strictly worse actual latency (adds animation time on top of the full wait) | Low | Rarely justified once real streaming is available; occasionally used for a fixed, pre-generated message |
| **True token streaming (SSE)** | Excellent -- TTFT typically a small fraction of total completion time | Moderate (event parsing, partial-data handling, disconnect handling) | The default choice for nearly all interactive, user-facing LLM text generation |
| **True token streaming (WebSockets)** | Equally excellent perceived latency; adds genuine bidirectionality | Higher (connection lifecycle, scaling considerations covered in the WebSockets skill) | Interactive, conversational, or voice/multimodal use cases genuinely needing the client to send frequent messages back over the same channel (see **Realtime AI**) |

### How seniors choose

Seniors default to SSE-based token streaming for any interactive, user-facing text generation unless there is a genuine, concrete need for the client to push frequent messages back over the same real-time channel (voice interruption handling, live collaborative editing alongside generation), in which case WebSockets' added complexity is justified -- this mirrors the same bidirectionality decision test covered in the **Server-Sent Events** and **WebSockets** skills, applied specifically to the LLM streaming use case. They reserve non-streaming, blocking calls specifically for contexts where nobody is watching in real time (batch extraction jobs, evaluation pipelines, scheduled report generation), where streaming's complexity provides no benefit.
`,

  "related-technologies": `
- **Server-Sent Events**: the dominant underlying transport for LLM streaming; this page assumes it as the wire-level mechanism and focuses on the application layer built on top.
- **WebSockets**: the bidirectional alternative transport, relevant when a streaming LLM interaction genuinely needs the client to send frequent messages back over the same channel (see **Realtime AI**).
- **Inference**: explains WHY generation is inherently sequential (autoregressive decoding) and therefore streamable in the first place, plus the serving-side throughput/latency mechanics streaming exposes to the client.
- **Tool Calling**: the non-streaming version of the argument-buffering pattern covered on this page in depth; understanding both together clarifies exactly what streaming adds to an already-understood non-streaming mechanism.
- **Latency**: the broader vocabulary (TTFT, p50/p99, tokens/second) this page borrows and applies specifically to the streaming context.
- **Realtime AI**: the more demanding extension of these same ideas to voice and live multimodal interaction, where streaming, interruption, and backpressure all become significantly higher-stakes.
- **Structured Output** (if present as its own platform skill): the schema-constrained generation this page's partial-JSON-parsing content directly supports when that output is also streamed.
`,

  "latest-updates": `
As of this writing (knowledge cutoff January 2026), the following reflects the general, broadly-stable state of LLM streaming practice; always verify exact API shapes and event-type names against current provider documentation, since these details do change between API versions:

- Server-Sent Events remains the dominant transport for LLM chat completion streaming across essentially all major providers, with a broadly converged (though not identical) delta-based event model.
- Streaming tool calls with incrementally-delivered, fragment-buffered argument JSON is now a standard, expected capability across major provider APIs, rather than a niche or emerging feature.
- Partial-JSON-aware parsing for streaming structured output has matured from ad hoc, per-team implementations into a small number of widely-used shared libraries and SDK-level utilities.
- Multi-provider streaming abstraction libraries (such as Vercel's AI SDK and similar community tooling) have grown significantly in adoption, reducing how much of this page's protocol-layer complexity individual application teams need to hand-roll.
- Streaming in agentic, multi-step contexts (interleaved reasoning, tool calls, and final answers within one logical turn) has become a mainstream production concern as agent frameworks have matured, rather than a specialized or experimental pattern.

Given the pace of change in this space, verify current provider-specific event schemas and any newly standardized conventions directly against official documentation before implementing against them in a new project.
`,

  "future-roadmap": `
Streaming is likely to remain a foundational, largely-settled pattern for LLM application UX going forward, with continued evolution concentrated in a few areas: richer, more standardized event typing for increasingly complex agentic responses (interleaved multi-tool, multi-step traces, rather than simple text-or-tool-call sequences); continued maturation of shared, well-tested partial-JSON and streaming-abstraction libraries, further reducing how much protocol-layer plumbing individual teams need to write themselves; and tighter integration between streaming text/structured-output patterns and streaming multimodal (voice, in particular) patterns as covered in the **Realtime AI** skill, as products increasingly blend text and voice interaction within a single session.

For a working AI engineer, the durable, worth-betting-career-time-on skills are the ones that transfer across whatever specific provider API or library churns underneath: the discipline of never buffering server-side, the buffer-then-validate-then-execute pattern for any streamed structured or semi-structured data, explicit state-machine thinking for stream lifecycle, and backpressure-aware design -- all of which are architecture-level judgment, not provider-specific trivia, and are unlikely to become obsolete even as specific SDKs and event-schema details continue to evolve.
`,

  "cheat-sheet": `
~~~
STREAMING (LLM UX) -- ESSENTIALS

Why: total gen time UNCHANGED; TTFT (time-to-first-token) DRASTICALLY reduced
     -> perceived latency win, not a throughput win

Backend pattern (relay, never buffer):
  for chunk in llm.stream(...):
      if await request.is_disconnected(): break   -- stop upstream immediately
      yield "data: " + json.dumps({"text": chunk.delta}) + "\\n\\n"
  -- NEVER accumulate full_text and return it as one block at the end

Frontend pattern (accumulate + batch-render):
  buffer = ""
  on chunk: buffer += chunk.delta
  requestAnimationFrame(() => render(buffer))   -- not on every single token

Tool calls: BUFFER the raw argument STRING across chunks.
  Only json.loads() once finish_reason == "tool_calls".
  Validate against schema BEFORE executing.

Structured output: use a PARTIAL-JSON repair pass (close open
  strings/brackets/braces) before each parse attempt -- never
  strict-parse a mid-stream fragment directly.

Stream state machine: idle -> streaming -> {done | error | cancelled} -> idle
  Handle ALL THREE end-states explicitly and distinctly.

Backpressure: respect write()'s false/drain signal server-side;
  batch renders client-side. Never let an unbounded buffer grow
  for a slow consumer.

#1 anti-pattern: calling stream=True upstream but accumulating the
  full response before responding to YOUR OWN client -- zero benefit.

Disconnect handling: ALWAYS check for disconnect in the forward loop
  and stop pulling upstream tokens immediately (cost + hygiene).
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What does streaming improve: total generation time or perceived latency? | Perceived latency (specifically time-to-first-token); total generation time is essentially unchanged |
| What is TTFT? | Time-to-first-token -- the time from request submission to the first piece of content reaching the client |
| Why can't you parse a partial tool-call argument chunk as JSON? | It's only a fragment of a growing JSON string, not a complete document, until the completion signal fires |
| What is the #1 streaming anti-pattern? | Accidentally buffering the full response server-side despite using stream=True upstream, giving the client zero benefit |
| What causes streaming UI flicker? | Synchronous full re-render on every single incoming token instead of batching to the paint cadence |
| What should a client do when a stream disconnects mid-response? | Treat it as an expected event: explicit error/close handling, a clear UI state, and a retry option |
| What is backpressure in a streaming pipeline? | A fast producer overwhelming a slow consumer; handled by respecting write/drain signals rather than buffering unboundedly |
| What is a "partial JSON parser" used for? | Repairing a truncated JSON fragment (closing open strings/brackets) so a partial object can be rendered before it's complete |
| Why should a server stop upstream generation on client disconnect? | Cost control and resource hygiene -- continuing to generate for nobody wastes real, billable inference capacity |
| What does finish_reason tell you? | Why the stream ended: natural stop, length limit, a pending tool call, content filtering, etc. -- changes what to do next |
| How does this skill differ from Server-Sent Events? | This page covers the LLM-specific application layer (deltas, tool-call/structured-output buffering, rendering, error handling); SSE covers the underlying wire transport protocol |
| What's the correct order of operations for a streamed tool call? | Buffer argument fragments -> wait for completion signal -> parse JSON -> validate against schema -> execute |
| Why is batching client-side renders to requestAnimationFrame useful? | It aligns UI updates with the browser's actual paint cadence, avoiding wasted, flicker-inducing re-renders faster than the screen can show |
| When should you NOT stream an LLM call? | Batch jobs, background/offline processing, and evaluation pipelines where nobody is watching in real time |
| What is the relay pattern for a streaming backend? | The backend is both an SSE/WS client (to the upstream provider) and server (to its own frontend), forwarding tokens through with minimal added latency |
`,

  mcqs: `
1. What does streaming primarily improve for an LLM response?
   A) Total generation time
   B) Perceived latency (time-to-first-token)
   C) Model accuracy
   D) Token cost
   Answer: B -- Explanation: total generation time is essentially unchanged; streaming dramatically reduces how long a user perceives waiting, by delivering the first content quickly rather than waiting for the entire response.

2. Why is it unsafe to json.loads() a partial tool-call arguments chunk?
   A) JSON parsing is inherently slow
   B) The chunk may be an incomplete fragment of the full argument string
   C) Tool calls are never JSON-formatted
   D) The provider encrypts argument chunks
   Answer: B -- Explanation: argument text streams as fragments of a growing string; only once the completion signal fires is the accumulated string guaranteed to be complete, parseable JSON.

3. What is the single most common streaming anti-pattern in backend implementations?
   A) Using WebSockets instead of SSE
   B) Accumulating the full response server-side before forwarding anything to the client, despite using stream=True upstream
   C) Sending too many small chunks
   D) Forgetting to set Content-Type
   Answer: B -- Explanation: this looks like a streaming implementation (it uses a streaming upstream call) but provides zero client-side benefit if the outer handler buffers everything before responding.

4. What is the correct client-side fix for streaming UI flicker?
   A) Poll the server instead of streaming
   B) Batch/throttle re-renders to the browser's paint cadence instead of rendering on every token
   C) Disable markdown rendering entirely
   D) Reduce the model's token limit
   Answer: B -- Explanation: flicker is usually caused by an expensive synchronous re-render fired on every single incoming token; batching to requestAnimationFrame or a small debounce window fixes it.

5. What should a server do when it detects a client has disconnected mid-stream?
   A) Continue generating and discard the output
   B) Stop consuming further tokens from the upstream provider immediately
   C) Restart the generation with a fresh request
   D) Ignore it, since the connection will time out eventually
   Answer: B -- Explanation: continuing to consume upstream tokens for a disconnected client wastes real, billable inference cost; stopping immediately is both a correctness and cost-control practice.

6. How does a "partial JSON parser" help with streaming structured output?
   A) It encrypts the partial data for security
   B) It repairs a truncated JSON fragment (closing open strings/brackets/braces) so a best-effort partial object can be parsed and rendered
   C) It converts JSON to XML for easier parsing
   D) It blocks all data until the object is fully complete
   Answer: B -- Explanation: standard strict JSON parsers fail on incomplete fragments; a partial-JSON-aware repair pass produces the closest valid JSON so a UI can progressively render an in-progress object.
`,

  "revision-notes": `
Streaming delivers an LLM's output incrementally as it is generated rather than as one blocking response at the end, trading a small amount of added protocol overhead for a dramatic improvement in PERCEIVED latency -- time-to-first-token drops to a small fraction of total completion time, even though total generation time itself is essentially unchanged. This is possible because autoregressive generation is inherently sequential (covered in the **Inference** skill): tokens genuinely exist one at a time, so there is no reason to withhold an already-generated token from the client.

The skill spans three layers: transport (Server-Sent Events or WebSockets, covered in their own dedicated skills), protocol/format (delta-based text chunks, streamed tool-call argument fragments, partial JSON for structured output), and UX/rendering (incremental, flicker-free display, explicit stream-state modeling, backpressure-aware batching). Most real bugs live at the boundary between these layers -- a transport issue the UX layer doesn't handle, or a protocol-layer partial fragment the rendering layer mishandles as if it were complete.

The two most consequential, recurring patterns are: buffer tool-call arguments and structured-output JSON across chunks and only act on them once an explicit completion signal confirms they are whole and valid (never parse or execute against a partial fragment); and never let any layer between the model and the client accumulate the full response before forwarding anything, since this quietly defeats streaming's entire purpose while looking, superficially, like a correct implementation.

Robust production systems treat mid-stream disconnection, backpressure, and cancellation as expected, first-class outcomes, not edge cases: explicit stream-state modeling (idle/streaming/done/error/cancelled), immediate server-side cessation of upstream token consumption on client disconnect, and respecting write/drain backpressure signals on both the server and client sides are what separates a demo-quality streaming implementation from a production-grade one.

This page deliberately does not re-cover the wire-level mechanics of SSE or WebSockets (see their own skills for that depth); it assumes a working transport and focuses on the LLM-specific application layer built on top of it -- the layer where an AI engineer's judgment calls (batching strategy, buffering discipline, disconnect handling, tool-call/structured-output correctness) actually determine whether a streaming feature feels instant and reliable, or merely looks like it streams.
`,

  "learning-roadmap": `
**Week 1**: Master the fundamentals -- read the **Server-Sent Events** skill fully first if you haven't, then implement Lab 1 (a minimal streaming chat endpoint and consumer). Milestone: you can explain TTFT versus total completion time precisely and demonstrate a working incremental "typing" UI.

**Week 2**: Add tool-call streaming with correct argument buffering (Lab 2). Milestone: a test suite proving correct reassembly of arguments split at arbitrary, awkward fragment boundaries, and a tool that only ever executes against complete, validated arguments.

**Week 3**: Implement partial-JSON structured-output rendering (Lab 3) and study the Anti-Patterns and Common Mistakes sections closely, specifically the server-side-buffering trap. Milestone: a UI that progressively fills in structured fields as they stream, with a defined fallback for a fragment truncated mid-key.

**Week 4**: Harden for production -- disconnect handling, backpressure, monitoring (Lab 4). Milestone: a load test demonstrating bounded memory under slow clients and confirming disconnected clients stop consuming upstream tokens promptly; you can walk through the full production checklist confidently.

**Next**: proceed to the **Tool Calling** skill for the non-streaming foundations this page's argument-buffering pattern builds on if you haven't covered it yet, then the **Realtime AI** skill for the more demanding voice/multimodal extension of everything covered here.
`,

  "official-docs": `
- OpenAI API reference, streaming section -- documents the stream parameter, chunk/delta event shape, and finish_reason values for Chat Completions; verify current field names against the live docs, as SDKs evolve.
- Anthropic API reference, Messages API streaming section -- documents Anthropic's distinct named streaming event types (content block start/delta/stop, message stop) and tool-use streaming specifics.
- MDN Web Docs, "Using server-sent events" and "Streams API" (ReadableStream) -- the browser-side foundations this page's frontend examples build on; see the **Server-Sent Events** skill for a fuller treatment.
- Google AI (Gemini) API documentation, streaming generation section -- for comparison against OpenAI's and Anthropic's conventions.
- Vercel AI SDK documentation -- a widely-used open-source abstraction over multiple providers' streaming formats, including tool-call and structured-output streaming utilities.
`,

  books: `
- "Designing Data-Intensive Applications" by Martin Kleppmann -- not streaming-LLM-specific, but the definitive treatment of stream processing, backpressure, and asynchronous system design principles this page's advanced concepts draw on.
- "Building Machine Learning Powered Applications" by Emmanuel Ameisen -- practical grounding in productionizing ML-backed features, including the UX considerations around latency this page's motivation section builds on.
- "High Performance Browser Networking" by Ilya Grigorik -- deep, protocol-level grounding in HTTP streaming, connection behavior, and the network fundamentals underlying any transport this page's streaming sits atop.
- Official provider cookbooks/guides (OpenAI Cookbook, Anthropic's developer guides) -- not traditional books, but the closest thing to authoritative, continuously updated "field manual" material for streaming implementation specifics; verify current examples against them directly since they change with API versions.
`,

  blogs: `
- Anthropic's engineering blog -- periodic posts on Claude's API design, including streaming and tool-use event modeling rationale.
- OpenAI's developer/engineering blog and changelog -- announcements and rationale for streaming API changes, including tool-calling and structured-output streaming features as they've shipped.
- Vercel's engineering blog -- posts on the AI SDK's design, including the reasoning behind its streaming abstraction and partial-JSON handling utilities.
- High-signal individual engineering blogs covering LLM application architecture (search for "streaming LLM UX" and "partial JSON parsing" specifically) -- prefer posts with runnable code and measured latency numbers over purely conceptual pieces; verify any benchmark claims independently given how quickly provider performance characteristics change.
`,

  "research-papers": `
Streaming as covered on this page is primarily an application/systems-engineering pattern rather than a research topic with a dedicated academic literature -- there is no canonical "streaming UX for LLMs" paper in the way there is for, say, attention mechanisms. The closest genuinely relevant foundational reading is on the topic this page's entire rationale depends on: autoregressive, sequential decoding.

- Vaswani et al., "Attention Is All You Need" (2017) -- establishes the Transformer architecture and its autoregressive decoding process, the root technical reason generation is sequential and therefore streamable at all; see the **Inference** skill for this covered in full depth.
- Systems papers on serving-infrastructure throughput/latency tradeoffs (for example, continuous batching and related LLM-serving techniques covered in the **Inference** skill) are the closest adjacent research literature bearing on WHY a given TTFT and tokens/second profile looks the way it does for a specific serving stack.

If you are specifically interested in the transport-protocol research lineage (HTTP streaming, long-lived connections), the **Server-Sent Events** and **WebSockets** skills' own research-papers sections are the more relevant starting point than anything specific to LLM applications.
`,

  videos: `
- Conference talks from OpenAI DevDay and Anthropic developer events (search each provider's official YouTube channel for the relevant year) -- frequently include concrete streaming API walkthroughs and rationale directly from the teams that designed these APIs.
- Vercel's Next.js Conf talks on the AI SDK -- demonstrate practical streaming UI patterns (including tool-call and structured-output streaming) with real, runnable code.
- Any well-produced "build a ChatGPT clone" tutorial series from a reputable engineering educator -- useful for seeing the full-stack streaming implementation end to end, though verify the specific API details shown against current official documentation, since these tutorials age quickly as APIs evolve.
`,

  "github-repos": `
- vercel/ai -- the Vercel AI SDK; a widely-used, actively maintained abstraction over multiple providers' streaming formats, including tool-call and structured-output streaming utilities directly relevant to this page.
- openai/openai-python and openai/openai-node -- official SDKs whose streaming implementations are a good, authoritative reference for the exact chunk/delta shapes and finish_reason handling described on this page.
- anthropics/anthropic-sdk-python and anthropics/anthropic-sdk-typescript -- official SDKs demonstrating Anthropic's named streaming event types and tool-use streaming handling directly.
- Repositories implementing "partial JSON parser" utilities (search "partial json parser streaming" on GitHub) -- several well-tested, MIT-licensed implementations exist; review a couple before hand-rolling your own, given the tricky truncation-point edge cases involved.
- Open-source LLM-serving projects (vLLM, text-generation-inference) -- for the server-side streaming implementation at the inference-engine layer itself, complementary to this page's application-layer focus; see the **Inference** skill for depth here.
- Example "build your own ChatGPT clone" reference repositories from major framework maintainers (Next.js, FastAPI community examples) -- useful, concrete full-stack streaming reference implementations.
`,

  "practice-problems": `
1. Implement the SSE event-boundary parser from Coding Question 1 and extend it to handle a malformed event (missing data: line) without crashing the parse loop.
2. Implement the partial-JSON repair function from Coding Question 2 and extend its test suite to cover truncation mid-key, mid-number, and mid-escape-sequence.
3. Implement the backpressure-aware forwarding function from Coding Question 3 and add a test simulating a client that never drains, asserting the server stops pulling from upstream rather than buffering unboundedly.
4. Build a small state machine (idle/streaming/done/error/cancelled) for a streaming chat UI and write unit tests for every valid and invalid transition.
5. Given a recorded sequence of real (or realistically mocked) tool-call argument fragments from a provider, write a reassembly function and a test suite using the ACTUAL byte-level chunk boundaries observed, not idealized whole-payload fragments.
6. External practice: implement a minimal streaming proxy for at least two different LLM providers' distinct event formats, normalizing both into one consistent internal event representation, as a smaller-scale version of Real Project 2.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    User["User"] --> Frontend["Frontend\n(stream state machine,\nbatched incremental rendering,\npartial-JSON/markdown handling)"]
    Frontend -->|"POST (ordinary request)"| Backend["Backend relay\n(auth, business logic,\nrate limiting, logging,\ndisconnect detection)"]
    Backend -->|"stream=true"| Provider["Upstream LLM provider\nor self-hosted inference server"]
    Provider -.token/tool-call/structured-output deltas.-> Backend
    Backend -.relayed SSE/WebSocket stream.-> Frontend
    Backend --> ToolExec["Tool execution\n(only after argument buffering\n+ schema validation complete)"]
    ToolExec --> Backend
    Backend --> Persistence["Conversation persistence\n(full accumulated text,\neven on partial completion)"]
    Backend --> Monitoring["Monitoring\n(TTFT, disconnect rate,\ntool-call parse failure rate)"]
~~~

This is the reference production architecture this page builds toward: a frontend that treats streaming as an explicit state machine rather than a flat text feed, a backend relay that never buffers the full response and stops upstream consumption immediately on disconnect, and dedicated persistence and monitoring paths that operate independently of what the client ultimately sees.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Streaming))
    Why it exists
      Autoregressive generation is sequential
      TTFT vs total completion time
      Perceived latency, not raw speed
    Transport layer
      Server-Sent Events
      WebSockets
    Protocol format layer
      Text deltas
      Tool-call argument fragments
      Partial JSON structured output
      finish_reason semantics
    UX rendering layer
      Incremental accumulation
      Batched paint-cadence rendering
      Partial markdown safety
      Explicit stream state machine
    Reliability
      Mid-stream disconnect handling
      Backpressure (server write, client render)
      Cancellation and cleanup
      Error vs done vs abrupt-drop
    Production concerns
      Relay pattern (client + server)
      Cost control on disconnect
      Monitoring TTFT and disconnect rate
      Proxy/timeout configuration
    Related skills
      Server-Sent Events
      WebSockets
      Inference
      Tool Calling
      Realtime AI
      Latency
~~~
`,
};

export default streaming;
