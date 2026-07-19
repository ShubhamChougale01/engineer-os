import type { SkillContent } from "../types";

/**
 * Server-Sent Events — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const sse: SkillContent = {
  overview: `
Server-Sent Events (SSE) is a standardized, HTTP-native protocol for one-directional streaming from a server to a client — the server keeps a single HTTP response open and sends a continuous stream of discrete text-formatted events over time, while the client (via the browser's built-in EventSource API, or an equivalent library elsewhere) automatically receives and processes each event as it arrives. Where **WebSockets** (covered in its own skill) provides genuinely bidirectional communication, SSE deliberately does ONLY one direction — server to client — and in exchange gets meaningful simplicity: it's plain HTTP (no protocol upgrade or special handshake), works over standard HTTP/1.1 or HTTP/2, and includes automatic reconnection built directly into the browser's EventSource API.

For an AI engineer, SSE is the single most directly relevant real-time protocol on this platform: it is the dominant, near-universal mechanism by which every major LLM provider (OpenAI, Anthropic, and others) streams generated tokens back to a client as they're produced, rather than making the client wait for a complete response. Understanding SSE deeply is essential both for correctly implementing a streaming chat interface consuming an LLM API and for building your OWN backend's streaming endpoints (progress updates, live logs, incremental results) using the same well-understood, simple pattern.

Key characteristics: **plain HTTP**, requiring no special protocol upgrade — an SSE endpoint is simply a normal HTTP response with a specific content type (text/event-stream) that stays open and streams data incrementally; a simple, human-readable **text-based event format** (data:, event:, id: fields, separated by newlines); **automatic reconnection** built into the browser's EventSource API, including the ability to resume from the last received event ID; and a deliberately **one-directional** design — the client cannot send messages back over the same connection (any client-to-server communication happens via separate, ordinary HTTP requests).
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2004–2006 | Early "Comet" techniques (a general term for various server-push workarounds atop HTTP, including long polling) become common for approximating real-time updates in web applications, predating any standardized server-push mechanism |
| 2006 | **Opera** implements an early version of what becomes Server-Sent Events, under the name "server-sent events," as part of early HTML5-era experimentation |
| 2009–2011 | SSE is formalized as part of the **HTML5** specification effort (alongside WebSockets, developed concurrently as a genuinely different, complementary real-time mechanism), with the **EventSource** JavaScript API standardized for browser consumption |
| 2011 | Widespread browser support for EventSource/SSE stabilizes across major browsers (with the notable long-standing exception of Internet Explorer, which never implemented it natively) |
| 2015+ | SSE sees steady, if less publicized, adoption for genuinely one-directional streaming use cases — live sports scores, stock tickers, notification feeds — often overshadowed in public discussion by WebSockets' more prominent, general-purpose reputation |
| 2020–2022 | **OpenAI's ChatGPT and API** (and shortly after, virtually every other major LLM provider) adopt SSE as the standard mechanism for streaming generated tokens to clients incrementally, dramatically raising SSE's practical, everyday relevance for an entire generation of AI application developers |
| 2020s | SSE becomes, in practice, the single most common real-time protocol encountered by AI engineers specifically, given its near-universal adoption across LLM provider APIs for token streaming |

SSE's relatively quiet early history — standardized alongside WebSockets in the same HTML5 era, but historically less discussed — followed by its sudden, dramatic relevance surge once LLM providers standardized on it for token streaming is a useful case study in how a protocol's real-world importance can shift dramatically based on which specific application pattern (chat-style incremental generation) becomes widespread years after the protocol's original standardization.
`,

  "why-it-exists": `
Server-Sent Events exists because a genuinely large class of real-time web application needs — live sports scores, stock price updates, notification feeds, progress indicators, and (though not foreseen at SSE's original standardization) LLM token streaming — are fundamentally ONE-directional: the server has new data to push to the client over time, but the client doesn't need to send frequent messages back over that same channel. For this specific, common shape of problem, **WebSockets** (developed concurrently, in the same HTML5 era) is genuine overkill: its full bidirectional capability, stateful connection model, and more complex handshake solve a broader problem than what a one-directional streaming need actually requires.

Prior to SSE's standardization, developers needing server-to-client streaming had to choose between: building this atop **long polling** (the same inefficient workaround motivating WebSockets' own creation, covered in the **WebSockets** skill) or reaching for the full complexity of WebSockets even when genuine bidirectionality wasn't needed. SSE's designers recognized this specific, common gap and standardized a genuinely simpler protocol purpose-built for it: plain HTTP (no special handshake or protocol upgrade), a simple text-based event format any developer could read and debug directly, and — critically — automatic reconnection handling built directly into the browser's EventSource API, removing a genuine implementation burden that WebSocket clients must handle manually.

SSE's design bet was specifically that "give me the simplest possible tool that solves EXACTLY the one-directional streaming problem, with less complexity than WebSockets, rather than a more powerful bidirectional tool I don't actually need" is the right default for this large, common class of use cases — a bet that has been strongly validated by SSE's eventual, dominant adoption for LLM token streaming specifically, a use case that is, at its core, exactly this one-directional streaming pattern.
`,

  "problem-it-solves": `
Server-Sent Events solves the **"how do I stream data from the server to the client incrementally, over time, without WebSockets' bidirectional complexity, using plain HTTP that's simple to implement, debug, and reason about"** problem.

Concretely, SSE provides:

- **Plain HTTP streaming**: an SSE endpoint is just a normal HTTP response with Content-Type: text/event-stream that stays open, sending data incrementally — no special protocol upgrade or handshake beyond standard HTTP, meaningfully simpler to implement and reason about than WebSockets' upgrade mechanism.
- **A simple, human-readable event format**: text-based data:/event:/id: fields separated by newlines, directly readable and debuggable (via curl, or simply reading network traffic) without needing specialized WebSocket-aware tooling.
- **Automatic reconnection with resumption**: the browser's EventSource API automatically reconnects if the connection drops, and can resume from the last successfully received event (via the Last-Event-ID header) if the server supports it — a genuine convenience that WebSocket clients must implement manually.
- **Compatibility with standard HTTP infrastructure**: since SSE is plain HTTP, it works through standard proxies, load balancers, and CDNs without requiring the WebSocket-aware infrastructure configuration covered in the **WebSockets** skill.
- **A natural fit for the LLM token-streaming pattern specifically**: a client sends one request (a chat completion request, for instance) and receives a stream of incremental tokens back — exactly SSE's one-directional streaming shape, requiring no bidirectional capability at all.

What SSE does **not** solve, or solves with a real tradeoff: it provides NO mechanism for the client to send data back over the same streaming connection (any client-to-server communication requires a separate, ordinary HTTP request) — a genuine limitation for use cases needing true bidirectional real-time communication (chat, collaborative editing), which need **WebSockets** instead; browser connections-per-domain limits (historically 6 for HTTP/1.1) can constrain how many concurrent SSE connections a single page can maintain, though HTTP/2 substantially mitigates this; and Internet Explorer never implemented EventSource natively, requiring a polyfill for that specific legacy browser (a diminishing but historically real concern).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain SSE's core model: plain HTTP streaming, the text/event-stream content type, and the browser's EventSource API.
2. Implement an SSE server endpoint and consume it via EventSource, handling multiple event types.
3. Understand SSE's automatic reconnection behavior and implement event ID-based resumption on the server side.
4. Explain precisely why SSE (rather than WebSockets) is the standard mechanism for LLM token streaming.
5. Design a robust SSE-based streaming API, including appropriate error handling and connection lifecycle management.
6. Compare SSE against WebSockets, REST, GraphQL, and gRPC, articulating specifically when SSE's one-directional simplicity is the right fit.
7. Recognize and mitigate SSE-specific production concerns: proxy buffering issues, connection limits, and timeout handling.
8. Apply appropriate authentication patterns to SSE endpoints, given their plain-HTTP, long-lived nature.
9. Answer senior-level interview questions on SSE's architecture, its relationship to LLM streaming, and appropriate use cases.
`,

  prerequisites: `
- **Required**: basic **HTTP** fundamentals, particularly the concept of a streaming (chunked-transfer or otherwise incrementally-delivered) HTTP response.
- **Required**: the **WebSockets** skill (covered alongside this one in this category) — understanding WebSockets' genuinely bidirectional model provides the essential contrast for understanding exactly what SSE deliberately gives up and gains.
- **Helpful**: the **REST** skill, since SSE endpoints are typically exposed as a specific kind of REST-adjacent HTTP endpoint.
- **Very helpful**: basic familiarity with any major LLM provider's streaming API (OpenAI's or Anthropic's chat completion streaming, for instance) for concrete, directly relevant application context.

Dependency links: **REST** → **GraphQL** → **gRPC** → **WebSockets** → this page, completing this category's API styles.
`,

  "beginner-concepts": `
### The SSE wire format

~~~
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"token": "Hello"}

data: {"token": " world"}

event: done
data: {}

~~~

Each event is a plain-text block: one or more data: lines (the actual payload), an optional event: line (naming a custom event type, defaulting to "message" if omitted), an optional id: line (for resumption, covered in Intermediate Concepts), and a blank line marking the end of that event — genuinely simple, human-readable, and directly debuggable without special tooling.

### A basic server endpoint (Node.js/Express example)

~~~javascript
app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    res.write("data: " + JSON.stringify({time: Date.now()}) + "\\n\\n");
  }, 1000);

  req.on("close", () => clearInterval(interval));
});
~~~

The server simply writes plain-text-formatted event data to the response stream over time, keeping the connection open — genuinely simpler than WebSockets' handshake and framing, since it's built entirely on standard HTTP response streaming.

### A basic client (browser JavaScript, via EventSource)

~~~javascript
const eventSource = new EventSource("/stream");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

eventSource.onerror = (error) => {
  console.log("Connection error (EventSource will auto-reconnect)");
};
~~~

The browser's built-in EventSource API handles the HTTP request, parses the incoming event stream, and dispatches onmessage for each received event — critically, it ALSO handles reconnection automatically if the connection drops, with no additional application code required for that specific behavior.

### Custom event types

~~~
event: token
data: {"text": "Hello"}

event: done
data: {}

~~~

~~~javascript
eventSource.addEventListener("token", (event) => {
  appendToken(JSON.parse(event.data).text);
});

eventSource.addEventListener("done", () => {
  eventSource.close();
});
~~~

Named event types (via the event: field) let a single SSE stream carry semantically distinct kinds of events, each handled by its own listener — directly relevant to LLM streaming APIs, which commonly use distinct event types for incremental tokens versus a final "stream complete" signal.
`,

  "intermediate-concepts": `
### Event IDs and resumption

~~~
id: 42
data: {"token": "Hello"}

id: 43
data: {"token": " world"}

~~~

Each event can carry an id: field; if the connection drops and the browser's EventSource automatically reconnects, it sends a Last-Event-ID header with the value of the last successfully received event's ID — letting a well-designed server RESUME the stream from where it left off, rather than starting over or losing events that occurred during the disconnection.

~~~javascript
app.get("/stream", (req, res) => {
  const lastEventId = req.headers["last-event-id"];
  const startFrom = lastEventId ? parseInt(lastEventId) + 1 : 0;
  streamEventsStartingFrom(res, startFrom);
});
~~~

Implementing resumption correctly requires the server to actually track/replay events from the requested starting point — SSE provides the PROTOCOL mechanism (the header) for this, but the application must implement the actual resumption logic itself.

### The retry field (reconnection timing)

~~~
retry: 3000
data: {"status": "processing"}

~~~

The retry: field lets the server suggest how long the browser should wait before attempting to reconnect after a connection drop (in milliseconds) — a genuine, if modest, lever for tuning reconnection behavior server-side, without requiring any client-side configuration.

### Streaming LLM tokens (the dominant real-world SSE use case)

~~~python
# FastAPI example, streaming an LLM provider's own SSE response through to the client
from fastapi.responses import StreamingResponse

@app.post("/chat")
async def chat(request: ChatRequest):
    async def event_generator():
        async for chunk in llm_client.stream_completion(request.messages):
            yield "data: " + json.dumps({"token": chunk.text}) + "\\n\\n"
        yield "event: done\\ndata: {}\\n\\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
~~~

This pattern — a backend proxying/relaying an upstream LLM provider's own SSE stream (or generating one from a local model) through to its own client — is genuinely the single most common real-world SSE implementation an AI engineer will write, directly connecting this skill to this platform's broader LLM application engineering context.

### Handling connection close and cleanup

~~~javascript
app.get("/stream", (req, res) => {
  const subscription = subscribeToUpdates((data) => {
    res.write("data: " + JSON.stringify(data) + "\\n\\n");
  });

  req.on("close", () => {
    subscription.unsubscribe();   -- essential: clean up server-side resources
                                    -- when the client disconnects
  });
});
~~~

Correctly handling the request's close event (firing when the client disconnects, whether intentionally or due to a network failure) is essential for avoiding server-side resource leaks — a subscription, a database cursor, or an upstream connection left open indefinitely for a client that's no longer listening.

### Multiple concurrent event streams and the connection limit

~~~
Browser HTTP/1.1 connections-per-domain limit: historically 6
-> if a page opens 6+ EventSource connections to the same domain,
   additional ones will queue, waiting for an existing connection to close

HTTP/2 mitigates this significantly via multiplexing,
allowing many more logical streams over fewer underlying connections
~~~

A genuinely important, easy-to-overlook browser-level constraint: historically, browsers limit concurrent HTTP/1.1 connections to a single domain (commonly 6), meaning a page opening several separate EventSource connections to the same origin can hit this ceiling — HTTP/2 (where a single connection multiplexes many logical streams) substantially mitigates this specific concern.
`,

  "advanced-concepts": `
### Proxy and load balancer buffering pitfalls

~~~
Problem: some proxies/load balancers buffer HTTP responses by default,
holding data until a certain buffer size is reached or the response
completes -- this defeats SSE's incremental delivery, since the client
receives nothing until the buffer flushes (potentially the ENTIRE
stream at once, at the very end, rather than incrementally).

Common culprits and fixes:
├── Nginx: proxy_buffering off; (for the relevant location block)
├── Some CDNs: explicit streaming/no-buffering configuration required
└── Verify with a real, direct test (not just assuming
     configuration is correct) that events actually arrive
     incrementally through your FULL production request path
~~~

This is one of the single most common, most confusing SSE production issues: everything works correctly in local development (no intermediary proxy), but a deployed production environment's proxy/load balancer buffers the response, breaking the incremental streaming behavior silently — always test through the ACTUAL production request path, not just a direct connection to the origin server.

### Keeping connections alive through idle periods

~~~javascript
setInterval(() => {
  res.write(": heartbeat\\n\\n");   -- a comment line (starting with a colon),
                                      -- ignored by EventSource but keeps
                                      -- the connection from being closed
                                      -- by an idle-timeout-enforcing intermediary
}, 15000);
~~~

Because some intermediaries (proxies, load balancers) close connections after a period of inactivity, sending periodic comment lines (SSE's specific mechanism for "keep this connection alive without dispatching an actual event") is a common, important production practice for long-lived SSE streams with potentially sparse actual data.

### Authentication for SSE endpoints

~~~javascript
-- EventSource's constructor doesn't support custom headers directly,
-- so authentication commonly happens via a token in the URL,
-- a cookie, or by using the fetch API with a ReadableStream instead
-- of EventSource when custom header support is genuinely needed
const eventSource = new EventSource("/stream?token=" + authToken);
~~~

A genuinely important browser API limitation: the standard EventSource constructor doesn't support setting custom request headers (unlike a typical fetch call) — authentication is typically handled via a URL query parameter, a cookie sent automatically with the request, or by abandoning EventSource in favor of manually consuming a fetch response's ReadableStream (losing EventSource's built-in reconnection convenience, but gaining full header control) when custom headers are genuinely required.

### SSE versus chunked transfer encoding, and HTTP/2 considerations

~~~
SSE is typically delivered via HTTP's chunked transfer encoding under
HTTP/1.1 (the server doesn't know the total response length in advance),
while HTTP/2 has its own native framing that doesn't require explicit
chunked encoding for the same streaming behavior -- SSE's TEXT FORMAT
(data:/event:/id:) remains identical regardless of which underlying
HTTP version delivers it.
~~~

Understanding that SSE's event FORMAT is a separate concern from the underlying HTTP transport mechanism delivering it (chunked encoding under HTTP/1.1, versus native framing under HTTP/2) clarifies why SSE works consistently across HTTP versions without requiring format changes.

### Client-side reconstruction of a full response from streamed tokens

~~~javascript
let fullResponse = "";
eventSource.addEventListener("token", (event) => {
  fullResponse += JSON.parse(event.data).text;
  updateUIWithPartialResponse(fullResponse);
});
~~~

A common application-level pattern specific to LLM token streaming: the client accumulates each incremental token into a growing full response string, updating the UI progressively (the classic "typing" chat interface effect) — a genuine application-level responsibility SSE itself doesn't handle, similar to how WebSockets leaves message-envelope design to the application.
`,

  "internal-working": `
What happens from an SSE client request to a continuous stream of received events:

~~~mermaid
sequenceDiagram
    participant Client as Browser (EventSource)
    participant Server as SSE server
    participant Source as Data source\n(LLM API, live feed, etc.)

    Client->>Server: GET /stream (Accept: text/event-stream)
    Server-->>Client: HTTP 200, Content-Type: text/event-stream\n(response stays OPEN)
    loop As new data becomes available
        Source-->>Server: new data (a generated token, an update)
        Server-->>Client: data: {...}\\n\\n  (written to the still-open response)
        Client->>Client: EventSource parses the event,\nfires onmessage/addEventListener
    end
    Note over Client,Server: Connection stays open until the server\nends the response or the client closes it
    alt Connection drops unexpectedly
        Client->>Server: automatic reconnection (with Last-Event-ID header)
        Server-->>Client: resume streaming (if the server implements resumption)
    end
~~~

1. **The request is plain HTTP**: a normal GET request (or POST, if using fetch/ReadableStream instead of EventSource, since EventSource itself only supports GET) with an Accept: text/event-stream header (implicit when using EventSource), no special upgrade handshake required.
2. **The response stays open and streams incrementally**: rather than a typical HTTP response completing and closing the connection, the server keeps writing additional data: blocks to the SAME response over time, with the underlying HTTP transport (chunked encoding under HTTP/1.1, or HTTP/2's native framing) delivering each write incrementally to the client as it happens.
3. **EventSource parses and dispatches automatically**: the browser's built-in EventSource implementation handles parsing the text/event-stream format, buffering partial events until a complete one is received, and dispatching the appropriate event handler — application code never needs to manually parse the wire format.
4. **Automatic reconnection uses Last-Event-ID**: if the connection drops, EventSource automatically attempts to reconnect (after the retry: interval, if specified), sending the ID of the last successfully received event so a well-designed server can resume rather than restart the stream.

**Why this matters**: understanding that SSE's entire mechanism is built on ordinary, incremental HTTP RESPONSE STREAMING (not a special protocol) is the key insight explaining both its simplicity (works through standard HTTP infrastructure, is directly debuggable) and its most common production pitfall (intermediary proxy buffering silently breaking the incremental delivery this mechanism depends on).
`,

  architecture: `
A senior engineer thinks about SSE-based system design across several dimensions: confirming the genuine one-directional fit, designing for production-grade proxy/infrastructure compatibility, and building the client-to-server "other half" of a chat-style interaction correctly.

### The genuine one-directional fit test

~~~mermaid
flowchart TB
    Q1{"Does the client need to send\nfrequent messages back over the\nSAME real-time channel (not just\nan occasional separate request)?"}
    Q1 -->|"Yes, genuinely bidirectional"| WS["Use WebSockets instead\n(see its own skill)"]
    Q1 -->|"No, server pushes updates,\nclient sends via separate\nordinary requests if at all"| SSE_["SSE fits well"]
~~~

This directly mirrors the bidirectionality test covered in the **WebSockets** skill from the opposite direction — SSE is the RIGHT default for one-directional server-push needs specifically because it avoids WebSockets' stateful-connection scaling complexity entirely for a use case that doesn't actually need bidirectional capability.

### The LLM chat application pattern

~~~mermaid
flowchart LR
    User["User types a message"] --> POST["POST /chat\n(ordinary HTTP request,\nnot part of the SSE stream)"]
    POST --> Backend["Backend"]
    Backend --> LLMProvider["LLM provider API\n(itself streaming via SSE)"]
    LLMProvider -.SSE stream of tokens.-> Backend
    Backend -.SSE stream relayed to client.-> Client["Client receives\nincremental tokens"]
~~~

A genuinely important architectural clarification: the user's OUTGOING message is sent as an ordinary HTTP request (typically POST), entirely separate from the SSE stream, which handles ONLY the incoming, incremental response tokens — SSE's one-directional nature means the "conversation" as a whole is actually built from two separate mechanisms (a normal request for the user's turn, an SSE stream for the assistant's turn), not one bidirectional channel.

### Production infrastructure compatibility

~~~mermaid
flowchart LR
    Client --> CDN_LB["CDN / Load balancer\n(MUST be configured for\nno-buffering / streaming passthrough)"]
    CDN_LB --> Server["Application server"]
~~~

Because SSE depends entirely on incremental HTTP response delivery, every intermediary in the actual production request path (CDN, load balancer, reverse proxy) must be explicitly configured NOT to buffer the response — a genuine, deliberate infrastructure configuration concern, not something that "just works" by default in every environment.
`,

  "data-flow": `
Tracing a complete LLM chat streaming interaction end to end, the pattern most AI engineers will actually build:

~~~mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant LLMProvider as LLM Provider API

    User->>Frontend: types a message, hits send
    Frontend->>Backend: POST /chat {messages: [...]}\n(ordinary HTTP request)
    Backend->>LLMProvider: stream_completion(messages)\n(the provider's OWN SSE stream)
    Backend-->>Frontend: HTTP 200, Content-Type: text/event-stream\n(response stays open)
    loop For each token generated
        LLMProvider-->>Backend: SSE event: {"token": "Hel"}
        Backend-->>Frontend: relayed SSE event: {"token": "Hel"}
        Frontend->>Frontend: append token, update UI incrementally
    end
    LLMProvider-->>Backend: SSE event: stream complete
    Backend-->>Frontend: event: done
    Frontend->>Frontend: finalize message, re-enable input
~~~

The critical architectural detail: the backend is often BOTH an SSE client (consuming the upstream LLM provider's own SSE stream) AND an SSE server (relaying/re-streaming those tokens to its own frontend client) — a genuinely common "double SSE" pattern, where the backend's job is largely to authenticate, apply business logic (content filtering, logging, rate limiting), and pass the incremental tokens through, rather than buffering the entire response before responding.
`,

  "production-usage": `
### A production SSE endpoint relaying LLM tokens (FastAPI example)

~~~python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

@app.post("/chat")
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    async def event_generator():
        try:
            async for chunk in llm_client.stream_completion(request.messages):
                yield "data: " + json.dumps({"token": chunk.text}) + "\\n\\n"
        except Exception as e:
            yield "event: error\\ndata: " + json.dumps({"message": str(e)}) + "\\n\\n"
        finally:
            yield "event: done\\ndata: {}\\n\\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
~~~

Note the X-Accel-Buffering: no header — a specific, commonly needed instruction for nginx-based deployments to disable response buffering for this endpoint, directly addressing the proxy buffering pitfall covered in Advanced Concepts.

### Non-negotiables for any production SSE endpoint

1. **Verify no-buffering configuration through the ACTUAL production request path** (not just a direct connection to the origin server), since intermediary proxy buffering is the single most common SSE production issue.
2. **Handle client disconnection (req.on close) explicitly**, cleaning up any server-side resources (subscriptions, upstream connections) tied to that specific client.
3. **Implement a distinct error event type**, letting the client distinguish a genuine error from normal stream completion.
4. **Send periodic heartbeat/comment lines** for long-lived streams with potentially sparse actual data, preventing idle-timeout-triggered disconnection.
5. **Authenticate appropriately given EventSource's header limitation** (via a token in the URL, a cookie, or fetch/ReadableStream if custom headers are genuinely required).

### Common production patterns

- **Relaying an upstream LLM provider's own SSE stream** through your own backend, applying authentication, business logic, and logging along the way — the single most common real-world SSE pattern for AI engineers.
- **Live progress indicators** for long-running backend operations (a data export, a batch job) streamed incrementally rather than requiring the client to poll repeatedly.
- **Live notification feeds** and **live dashboard updates**, both genuinely one-directional server-push use cases fitting SSE well.
`,

  "industry-examples": `
- **OpenAI's Chat Completions API streaming mode**: uses SSE as the standard mechanism for streaming generated tokens incrementally, the single most influential and widely-consumed real-world SSE implementation for AI engineers specifically.
- **Anthropic's Messages API streaming mode**: similarly uses SSE for incremental response streaming, following the same broadly-adopted industry pattern.
- **Nearly every other major LLM provider's API**: has converged on SSE as the standard token-streaming mechanism, making it a genuinely universal skill for consuming ANY LLM provider's streaming endpoint.
- **Financial market data tickers** (stock price feeds, sports score updates): a long-standing, pre-LLM-era SSE use case fitting its genuinely one-directional, server-push data flow well.
- **GitHub's live build/CI status updates**: streaming incremental status updates for a running build or workflow, a genuinely one-directional server-push need.
- **Various live notification systems** across many web applications, where SSE provides a simpler alternative to WebSockets for a use case that doesn't need bidirectional communication.
`,

  "best-practices": `
1. **Apply the genuine one-directional fit test before adopting SSE** — confirm the client doesn't need to send frequent messages back over the same real-time channel; if it does, use WebSockets instead.
2. **Always verify no-buffering configuration through the actual production request path**, including every intermediary (CDN, load balancer, reverse proxy), not just a direct connection to the origin server.
3. **Implement a distinct error event type**, letting clients distinguish genuine errors from normal stream completion.
4. **Handle client disconnection explicitly** (via the request's close event), cleaning up server-side resources tied to that specific client.
5. **Send periodic heartbeat/comment lines** for long-lived streams with potentially sparse data, preventing idle-timeout disconnection.
6. **Design event IDs and server-side resumption logic** for streams where losing events during a brief disconnection would be genuinely problematic.
7. **Choose an appropriate authentication mechanism** given EventSource's lack of custom header support (URL token, cookie, or fetch/ReadableStream if headers are genuinely required).
8. **Use distinct named event types** (via event:) for semantically different kinds of events within one stream, rather than requiring clients to parse a generic data: payload's own internal type field.
9. **Test through a realistic production-like environment** (with actual intermediary proxies/load balancers in the path) before assuming local-development behavior will hold in production.
10. **Keep the client-to-server "other half" of an interaction as ordinary, separate HTTP requests**, not attempting to force bidirectional communication into SSE's inherently one-directional model.
11. **Monitor for silently stalled streams** (a connection that's open but has stopped delivering events, rather than one that's explicitly closed) as a distinct failure mode from outright connection loss.
12. **Consider HTTP/2 deployment** to mitigate the historical browser per-domain connection limit if a page needs several concurrent SSE streams.
`,

  "anti-patterns": `
### Forcing a genuinely bidirectional use case into SSE

~~~javascript
// WRONG — trying to simulate bidirectional communication by pairing
// an SSE stream with a SEPARATE polling mechanism for client-to-server
// messages, when the use case (e.g., a chat feature where the client
// ALSO needs to push frequent, low-latency messages) genuinely needs
// bidirectional communication
const eventSource = new EventSource("/updates");
setInterval(() => fetch("/poll-for-my-outgoing-messages"), 500);   // an awkward workaround

// RIGHT — use WebSockets for genuinely bidirectional needs
const socket = new WebSocket("wss://example.com/chat");
~~~

Attempting to approximate bidirectional communication by combining an SSE stream with separate polling is a genuine anti-pattern when the actual use case needs true bidirectional, low-latency communication — WebSockets exists precisely for this case, and using it directly is simpler than this kind of workaround.

### Not verifying production proxy buffering configuration

~~~
# WRONG — assuming SSE "just works" in production because it worked
# in local development, without verifying that every intermediary
# proxy/load balancer in the ACTUAL production path is configured
# for no-buffering/streaming passthrough

# RIGHT — explicitly test through the real production request path,
# and configure known buffering culprits explicitly:
proxy_buffering off;   -- nginx
~~~

This is the single most common, most confusing SSE production failure mode — everything appears correct in code and in local testing, but a production intermediary silently buffers the response, breaking incremental delivery without an obvious error.

### Other production-grade anti-patterns

- **Not handling client disconnection**, leaking server-side resources (database cursors, upstream subscriptions) for clients that are no longer listening.
- **No distinct error event type**, leaving clients unable to distinguish a genuine server-side error from normal stream completion.
- **Assuming EventSource supports custom request headers**, then being surprised authentication doesn't work as expected — EventSource's constructor genuinely doesn't support this.
- **No heartbeat for long-lived, sparse-data streams**, risking idle-timeout disconnection from an intermediary.
- **Ignoring the browser per-domain connection limit** when a page opens several separate EventSource connections under HTTP/1.1, without considering HTTP/2 or consolidating into fewer streams.
`,

  performance: `
### Rule zero: verify no-buffering configuration end to end

The single biggest "performance" issue for SSE in practice isn't a genuine latency problem — it's an intermediary silently buffering the ENTIRE response, making a genuinely fast backend appear to deliver nothing until the very end.

### The performance hierarchy (apply in order)

1. **Verify and explicitly configure no-buffering** through every intermediary in the production request path (proxy_buffering off in nginx, equivalent settings for other proxies/CDNs).
2. **Send heartbeats appropriately spaced** — frequent enough to avoid idle-timeout disconnection, infrequent enough to avoid meaningful bandwidth waste.
3. **Consider HTTP/2 deployment** if a page needs many concurrent SSE streams, mitigating the historical HTTP/1.1 per-domain connection limit via multiplexing.
4. **Design efficient event granularity** — for LLM token streaming specifically, streaming individual tokens (rather than larger batched chunks) provides the best perceived responsiveness, at the cost of slightly more individual events to process.
5. **Profile actual end-to-end latency** (time from a token being generated upstream to it appearing in the client's UI) rather than assuming a working SSE implementation is automatically low-latency — buffering anywhere in the path can silently add significant, otherwise invisible delay.

### Micro-level facts worth knowing

- SSE's text-based format has slightly more per-event overhead than a genuinely optimized binary protocol would, though this is rarely the actual bottleneck relative to the underlying data-generation rate (an LLM's own token generation speed, for instance) in practice.
- Because SSE is plain HTTP, standard HTTP-level performance tools and techniques (connection reuse, HTTP/2 multiplexing) apply directly, unlike WebSockets' more specialized considerations.
- EventSource's automatic reconnection includes a small delay (configurable via retry:) before reconnecting, a deliberate design choice to avoid hammering a server that may be experiencing genuine issues.
`,

  scalability: `
SSE's scalability story is meaningfully simpler than WebSockets', precisely because it avoids WebSockets' core stateful-connection scaling challenge in one specific but important way: an SSE connection, while long-lived, doesn't require the CLIENT'S specific connection to be reachable for OTHER clients' updates the way a bidirectional chat room's cross-instance delivery does — each client's SSE stream is typically independent, driven by that same client's own request (an LLM chat completion, for instance), rather than needing to receive updates originating from OTHER clients.

### Why SSE often avoids the cross-instance broadcast problem entirely

~~~mermaid
flowchart LR
    ClientA["Client A"] --> Instance1["Server instance 1\n(streams A's OWN LLM response)"]
    ClientB["Client B"] --> Instance2["Server instance 2\n(streams B's OWN LLM response)"]
~~~

For the dominant LLM-streaming use case specifically, each client's SSE stream is driven entirely by THAT client's own request/response — instance 1 doesn't need to deliver any data originating from client B, unlike a WebSocket-based chat room where any client's message might need to reach any other connected client. This means the harder cross-instance pub/sub backplane problem covered in the **WebSockets** skill often simply doesn't arise for SSE's most common use case, a genuine, meaningful scalability simplification.

### When SSE DOES need cross-instance coordination

For use cases like a live notification feed or a shared live dashboard (where an update originating from ANY source needs to reach ALL currently-connected clients, not just the client whose own request triggered it), SSE-based systems DO face a version of the same cross-instance broadcast problem WebSockets faces, and benefit from the same pub/sub backplane pattern (Redis or similar) covered in the **WebSockets** skill.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Browser per-domain HTTP/1.1 connection limit | Deploy over HTTP/2, which multiplexes many logical streams over fewer underlying connections |
| Many long-lived open connections consuming server resources | Standard connection-count capacity planning, similar to any long-lived-connection service; consider a dedicated streaming gateway service if scale is significant |
| A shared live-update use case needing cross-instance delivery | The same pub/sub backplane pattern (Redis or similar) covered in the WebSockets skill |
| Intermediary proxy buffering silently degrading perceived latency | Explicit no-buffering configuration verified through the actual production path |
`,

  security: `
### Authentication given EventSource's header limitation

~~~javascript
-- EventSource's constructor cannot set custom headers, so common approaches:
const eventSource = new EventSource("/stream?token=" + authToken);   -- URL token
-- OR rely on an httpOnly session cookie sent automatically with the request
-- OR use fetch's ReadableStream directly (losing auto-reconnect) for full header control
~~~

Since a token in a URL is more exposed (visible in server logs, browser history, referrer headers) than a proper Authorization header, consider using a short-lived, single-use token specifically for the SSE connection, or rely on a cookie-based session (with appropriate CSRF-equivalent protections for the endpoint) when the exposure risk of a URL-based token is a genuine concern for your use case.

### CORS and cross-origin SSE

~~~javascript
res.setHeader("Access-Control-Allow-Origin", "https://trusted-frontend.example.com");
res.setHeader("Access-Control-Allow-Credentials", "true");
~~~

Standard CORS rules apply to SSE endpoints exactly as they would to any other HTTP endpoint — an SSE endpoint intended to be consumed cross-origin must set appropriate CORS headers, the same universal discipline covered across any cross-origin HTTP API.

### Essential SSE security practices

1. **Never rely solely on a URL-based token for genuinely sensitive data** without considering its exposure in logs/history; prefer a cookie-based session or a short-lived, connection-specific token where practical.
2. **Validate authentication/authorization on every SSE connection request**, the same as any other protected HTTP endpoint.
3. **Apply appropriate CORS configuration** for any SSE endpoint consumed cross-origin.
4. **Rate-limit SSE connection establishment**, preventing a client from opening an excessive number of concurrent streaming connections.
5. **Avoid streaming sensitive data unnecessarily** — since SSE responses may pass through various intermediaries (proxies, CDNs), apply the same data-sensitivity discipline you would for any HTTP response passing through similar infrastructure.

See the **OWASP Top 10**, **API Authentication**, and **Web Security** skills for the general depth this applies against.
`,

  testing: `
### Testing an SSE endpoint (Node.js/Express example)

~~~javascript
const request = require("supertest");

test("stream endpoint sends events with the expected format", (done) => {
  const req = request(app).get("/stream");
  req.expect(200).expect("Content-Type", /text\\/event-stream/);
  let receivedData = "";
  req.on("data", (chunk) => {
    receivedData += chunk.toString();
    if (receivedData.includes("data: ")) {
      expect(receivedData).toMatch(/data: .*\\n\\n/);
      req.abort();
      done();
    }
  });
  req.end();
});
~~~

### Testing client disconnection cleanup

~~~javascript
test("server cleans up subscription when client disconnects", async () => {
  const unsubscribeSpy = jest.fn();
  mockSubscribeToUpdates.mockReturnValue({unsubscribe: unsubscribeSpy});
  const req = request(app).get("/stream");
  const response = req.end();
  await simulateClientDisconnect(response);
  expect(unsubscribeSpy).toHaveBeenCalled();
});
~~~

### The senior testing doctrine

- Test the actual event format explicitly (correct data:/event:/id: structure), not just that SOME data was received.
- Test client disconnection cleanup explicitly, confirming server-side resources are released.
- Test error event handling explicitly, verifying clients can distinguish a genuine error from normal completion.
- Test resumption behavior explicitly if implemented, simulating a disconnection and reconnection with Last-Event-ID.
- Test through a realistic proxy-in-the-path setup (not just a direct connection) at least once before production deployment, specifically to catch buffering issues that wouldn't appear in a simpler test setup.
`,

  debugging: `
### The toolbox, in escalation order

1. **Use curl directly** (curl -N to disable curl's own output buffering) to inspect the raw event stream and confirm whether events actually arrive incrementally or all at once at the end — the single most useful first diagnostic step for a suspected buffering issue.
2. **Check the Content-Type header** is correctly set to text/event-stream, since an incorrect content type can cause a browser or intermediary to handle the response differently than expected.
3. **Inspect each intermediary in the production request path individually** (direct-to-origin, then through each proxy/load balancer layer) to isolate exactly where buffering (if present) is being introduced.
4. **Verify EventSource's actual received events** via browser developer tools' Network tab (which can show an EventSource connection's individual received events), distinguishing a client-side parsing issue from a server-side delivery issue.
5. **Check for silently stalled (versus explicitly closed) connections**, a distinct failure mode where the connection remains open but has simply stopped delivering events — heartbeat/comment lines help distinguish this from genuine inactivity.

### Debugging common SSE-specific symptoms

- "Works locally but not in production, with the entire response arriving at once at the very end" — almost certainly intermediary proxy buffering; verify no-buffering configuration through the actual production path.
- "Connection keeps disconnecting and reconnecting" — check for an idle-timeout-enforcing intermediary; consider adding heartbeat/comment lines if data is genuinely sparse.
- "Authentication doesn't work as expected" — verify you're not attempting to set a custom header on EventSource's constructor (which isn't supported); use a URL token or cookie-based approach instead.
- "Client misses events after a brief disconnection" — verify event ID-based resumption is actually implemented server-side, not just that the client is reconnecting.
`,

  monitoring: `
### Key signals to track

- **Active SSE connection count**, the streaming equivalent of tracking concurrent request load for a typical service.
- **Time-to-first-byte and inter-event latency**, specifically useful for detecting a buffering issue (a large gap before the first event, or events arriving in unexpected bursts rather than incrementally) that might not be obvious from aggregate request-completion metrics alone.
- **Connection duration distribution**, helping distinguish genuinely long-running streams from unexpectedly short ones (which might indicate premature disconnection or an error).
- **Error event rate**, tracked as a distinct signal from generic HTTP error rates, since a stream can complete with an in-band error event rather than a failed HTTP status.

### Tools

Standard APM tools instrumented with SSE-specific custom metrics (connection count, inter-event latency); curl-based synthetic monitoring specifically testing for incremental delivery (not just eventual completion) through the actual production path, catching buffering regressions proactively; browser developer tools for client-side debugging during development.

### Alerting priorities

Alert specifically on a rising gap between time-to-first-byte and expected values (an early, important signal of intermediary buffering regressions), on connection duration anomalies (unexpectedly short streams suggesting premature disconnection), and on elevated in-band error event rates.
`,

  deployment: `
### Nginx configuration for SSE (a common, essential deployment detail)

~~~
location /stream {
    proxy_pass http://backend;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection "";
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
}
~~~

Explicitly disabling proxy buffering (and related caching/connection settings) for SSE endpoints specifically is a genuinely essential, easy-to-overlook nginx (or equivalent proxy) configuration detail — the single most common source of "it works locally but not in production" SSE issues.

### CDN and cloud load balancer considerations

~~~
Many CDNs and managed load balancers require EXPLICIT configuration
(or specific product features) to support streaming/no-buffering
responses correctly -- verify your specific provider's documentation
and test through the ACTUAL production path rather than assuming
default behavior supports SSE correctly.
~~~

### CI/CD pipeline considerations

Include an integration test that verifies actual incremental delivery (not just eventual response completion) through a staging environment that mirrors production's proxy/load balancer configuration, specifically to catch buffering regressions before they reach production. See the **CI/CD** skill for the general pipeline depth this builds on.
`,

  "production-checklist": `
Before an SSE endpoint takes real production traffic:

- [ ] Genuine one-directional fit confirmed (not a use case actually needing WebSockets' bidirectional capability)
- [ ] No-buffering configuration explicitly verified through the ACTUAL production request path (every proxy/CDN/load balancer layer)
- [ ] Content-Type: text/event-stream set correctly
- [ ] Client disconnection handled explicitly, cleaning up server-side resources
- [ ] A distinct error event type implemented, letting clients distinguish errors from normal completion
- [ ] Heartbeat/comment lines implemented for long-lived, potentially sparse-data streams
- [ ] Event ID-based resumption implemented, if losing events during a brief disconnection would be problematic for your use case
- [ ] Authentication mechanism chosen appropriately given EventSource's header limitation
- [ ] CORS configured correctly for any cross-origin consumption
- [ ] Rate limiting applied to connection establishment
- [ ] Monitoring in place for time-to-first-byte and inter-event latency specifically (not just aggregate request metrics)
- [ ] Load testing performed with realistic concurrent connection counts through a production-like proxy configuration
`,

  "common-mistakes": `
1. **Not verifying no-buffering configuration through the actual production request path**, the single most common SSE production issue.
2. **Forcing a genuinely bidirectional use case into SSE**, rather than using WebSockets when the client also needs to send frequent messages back.
3. **Not handling client disconnection**, leaking server-side resources for clients that are no longer listening.
4. **Assuming EventSource supports custom request headers**, then being surprised authentication doesn't work as expected.
5. **No distinct error event type**, leaving clients unable to tell a genuine error from normal stream completion.
6. **No heartbeat for long-lived, sparse-data streams**, risking idle-timeout disconnection.
7. **Not implementing event ID-based resumption** for use cases where losing events during a brief disconnection genuinely matters.
8. **Ignoring the browser per-domain connection limit** under HTTP/1.1 when a page needs several concurrent SSE streams.
9. **Treating an SSE URL-based auth token with the same casualness as a header-based one**, without considering its greater exposure in logs/history.
10. **Not testing through a realistic proxy-in-the-path setup**, missing buffering issues that wouldn't appear in a simpler direct-connection test.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Entire response arrives at once, at the very end, instead of incrementally | Intermediary proxy/load balancer buffering the response | Explicitly disable buffering (proxy_buffering off in nginx, or the equivalent for your specific infrastructure) |
| Connection repeatedly disconnects and reconnects | An idle-timeout-enforcing intermediary closing the connection during quiet periods | Implement periodic heartbeat/comment lines |
| Authentication fails despite a seemingly correct token | Attempting to set a custom header on EventSource's constructor, which isn't supported | Use a URL query parameter token or a cookie-based session instead |
| Client misses events after a brief disconnection | No event ID-based resumption implemented server-side | Implement id: fields and Last-Event-ID-based resumption logic |
| CORS error when consuming a cross-origin SSE endpoint | Missing or incorrect Access-Control-Allow-Origin configuration | Configure CORS headers correctly for the SSE endpoint, same as any cross-origin HTTP API |
| Additional EventSource connections queue/stall under HTTP/1.1 | Browser per-domain connection limit reached | Deploy over HTTP/2, or consolidate into fewer concurrent streams |
| Server-side resource leak observed over time | Client disconnection not handled, subscriptions/cursors left open | Implement req.on("close") cleanup logic explicitly |
`,

  faqs: `
**Why does virtually every LLM provider use SSE for token streaming, rather than WebSockets?**
Because LLM token streaming is fundamentally a one-directional data flow — the client sends one request, then receives a stream of incremental tokens back — SSE's simplicity (plain HTTP, no special handshake, automatic reconnection) fits this need precisely, without requiring WebSockets' bidirectional capability that this specific use case doesn't actually need.

**Can the client send messages back over an SSE connection?**
No — SSE is deliberately, architecturally one-directional (server to client only); any client-to-server communication (like a user's next chat message) happens via a separate, ordinary HTTP request, entirely independent of the SSE stream carrying the response.

**Why does my SSE implementation work locally but not in production?**
The single most common cause is an intermediary proxy, load balancer, or CDN buffering the HTTP response by default, holding all the data until the response completes rather than delivering it incrementally — explicitly configuring no-buffering (proxy_buffering off in nginx, or the equivalent for your infrastructure) through the ACTUAL production request path is the standard fix.

**Does EventSource support custom authentication headers?**
No — the standard EventSource constructor doesn't support setting custom request headers; common workarounds include a token in the URL query string, relying on a cookie-based session, or using fetch's ReadableStream directly (losing EventSource's automatic reconnection convenience) when custom headers are genuinely required.

**How does SSE handle reconnection?**
Automatically, built directly into the browser's EventSource API — if a connection drops, the browser waits (per the server's suggested retry: interval, if provided) and reconnects automatically, sending a Last-Event-ID header so a well-designed server can resume the stream from where it left off rather than starting over.

**SSE or WebSockets for a new real-time feature?**
Apply the genuine bidirectionality test: if the client needs to send frequent, unprompted messages back over the same real-time channel (chat, collaborative editing), use WebSockets; if the need is genuinely one-directional (server pushing updates, notifications, LLM token streaming), SSE is simpler and avoids WebSockets' stateful-connection scaling complexity entirely.
`,

  "interview-questions": `
### Junior level

1. **What is the fundamental directionality difference between SSE and WebSockets?**
   Model answer: SSE is deliberately one-directional (server to client only); WebSockets provides genuine bidirectional communication where either side can send messages independently at any time.

2. **What content type does an SSE response use, and why does that matter?**
   Model answer: text/event-stream — it signals to the browser (and any intermediary) that the response is a streaming event source, letting the browser's EventSource API parse it correctly as an ongoing stream rather than a completed response.

3. **Why is SSE the standard mechanism LLM providers use for streaming generated tokens?**
   Model answer: because token streaming is fundamentally a one-directional server-to-client data flow (the client sends one request, then receives incremental tokens), SSE's simplicity fits this need precisely without requiring WebSockets' unneeded bidirectional capability.

4. **Does EventSource handle reconnection automatically?**
   Model answer: yes — if a connection drops, the browser's built-in EventSource API automatically attempts to reconnect after a delay, without requiring any additional application code for that basic behavior.

5. **Can a client send data back to the server over an active SSE connection?**
   Model answer: no — SSE is architecturally one-directional; any client-to-server communication requires a separate, ordinary HTTP request outside the SSE stream itself.

### Senior level

6. **What is the single most common SSE production issue, and how do you diagnose and fix it?**
   Model answer: intermediary proxy/load balancer/CDN buffering the HTTP response, causing the entire stream to arrive at once at the end rather than incrementally — diagnosed by testing with curl -N through the actual production request path (comparing direct-to-origin behavior against behavior through each intermediary layer) and fixed by explicitly disabling buffering for the relevant endpoint (proxy_buffering off in nginx, or the equivalent configuration for other infrastructure).

7. **How does SSE's event ID and Last-Event-ID mechanism support resumption, and what must the server implement for this to actually work?**
   Model answer: each event can carry an id: field; if the connection drops and EventSource automatically reconnects, it sends a Last-Event-ID header with that value — but SSE only provides the PROTOCOL mechanism for this; the server must actually implement logic to track/replay events starting from the requested ID for genuine resumption to work, rather than simply restarting the stream from the beginning.

8. **Why does SSE often avoid the cross-instance broadcast/pub-sub-backplane problem that WebSockets faces, for the LLM streaming use case specifically?**
   Model answer: because each client's SSE stream in this use case is typically driven entirely by THAT client's own request (an LLM completion call), a given server instance doesn't need to deliver data originating from OTHER clients' requests — unlike a WebSocket-based chat room where any client's message might need to reach any other connected client, meaningfully simplifying SSE's horizontal scaling story for this specific common pattern (though a shared live-update use case would still face a similar cross-instance problem).

9. **How would you handle authentication for an SSE endpoint, given EventSource's limitations?**
   Model answer: since EventSource's constructor doesn't support custom request headers, use a token in the URL query string (accepting its greater exposure risk in logs/history, and mitigating with a short-lived, connection-specific token where practical), rely on a cookie-based session sent automatically with the request, or abandon EventSource in favor of manually consuming a fetch response's ReadableStream when full custom-header control is genuinely required.

10. **Design the architecture for a chat application streaming an LLM's response, explaining why it isn't actually one single bidirectional channel.**
    Model answer: the user's outgoing message is sent as an ordinary HTTP POST request, entirely separate from the SSE stream; the backend then relays the LLM provider's own streamed tokens back to the client via a separate SSE GET-style streaming response — the "conversation" is architecturally built from two distinct, one-directional mechanisms (a request for the user's turn, a stream for the assistant's turn), not a single bidirectional WebSocket-style channel, which is why SSE fits this dominant AI application pattern so precisely without needing WebSockets' additional capability.

11. **What heartbeat mechanism does SSE provide, and why is it needed?**
    Model answer: a comment line (starting with a colon, e.g. ": heartbeat") that EventSource ignores as an actual event but that keeps the underlying connection active — needed because some intermediaries close connections after a period of apparent inactivity, and a long-lived stream with genuinely sparse data (long gaps between real events) could otherwise be disconnected unnecessarily.

12. **When would you choose WebSockets over SSE even for what initially seems like a server-push-heavy feature?**
    Model answer: when the client also genuinely needs to send frequent, unprompted messages back over the same real-time channel (not just an occasional separate request) — for example, a live collaborative cursor-tracking feature where every participant's cursor movements need to be both sent and received in real time is genuinely bidirectional, even though it might initially look like a "mostly server push" use case; the deciding factor is whether BOTH directions need frequent, independent, low-latency communication, not just which direction seems more prominent.
`,

  "coding-questions": `
### 1. Implement an SSE endpoint with heartbeat and disconnection cleanup

~~~javascript
function streamEndpoint(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const subscription = subscribeToUpdates((data) => {
    res.write("data: " + JSON.stringify(data) + "\\n\\n");
  });

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\\n\\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    subscription.unsubscribe();
  });
}
# Follow-up: why must both clearInterval AND subscription.unsubscribe
# be called on disconnection, and what specific resource leak would
# occur if either were omitted?
~~~

### 2. Implement event ID-based resumption

~~~javascript
function streamWithResumption(req, res, eventLog) {
  const lastEventId = req.headers["last-event-id"];
  const startIndex = lastEventId ? parseInt(lastEventId) + 1 : 0;

  res.setHeader("Content-Type", "text/event-stream");

  for (let i = startIndex; i < eventLog.length; i++) {
    res.write("id: " + i + "\\ndata: " + JSON.stringify(eventLog[i]) + "\\n\\n");
  }

  const subscription = eventLog.subscribe((newEvent, index) => {
    res.write("id: " + index + "\\ndata: " + JSON.stringify(newEvent) + "\\n\\n");
  });

  req.on("close", () => subscription.unsubscribe());
}
# Follow-up: what would happen if eventLog grew unboundedly over a
# very long-running application, and how would you design a bounded
# event log (e.g., a fixed-size ring buffer) while still supporting
# meaningful resumption for reasonably recent disconnections?
~~~

### 3. Implement a backend relaying an upstream LLM provider's SSE stream

~~~python
from fastapi.responses import StreamingResponse
import json

async def relay_llm_stream(request):
    async def event_generator():
        try:
            async for chunk in llm_client.stream_completion(request.messages):
                if is_content_policy_violation(chunk.text):
                    yield "event: error\\ndata: " + json.dumps({"message": "content policy violation"}) + "\\n\\n"
                    return
                yield "data: " + json.dumps({"token": chunk.text}) + "\\n\\n"
        except UpstreamError as e:
            yield "event: error\\ndata: " + json.dumps({"message": str(e)}) + "\\n\\n"
        finally:
            yield "event: done\\ndata: {}\\n\\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
# Follow-up: why is it important for the "done" event to be sent in a
# finally block (rather than only after the try block's normal
# completion), and what client-side bug would result if it were
# omitted specifically in the error-handling path?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a basic SSE server and client
Implement an SSE endpoint streaming periodic timestamp updates, and a browser client consuming it via EventSource, displaying each update as it arrives. Deliverable: a working, incrementally-updating client. Skills exercised: basic SSE wire format, EventSource API usage.

### Lab 2 (Intermediate): Implement heartbeat, error events, and disconnection cleanup
Extend the Lab 1 server with heartbeat comment lines, a distinct error event type (triggered by a simulated failure condition), and explicit client disconnection cleanup, verifying cleanup via a test. Deliverable: a production-hardened SSE endpoint with a test suite. Skills exercised: heartbeat implementation, error event design, resource cleanup.

### Lab 3 (Advanced): Implement event ID-based resumption
Add event ID tracking and Last-Event-ID-based resumption logic, testing that a simulated disconnection and reconnection correctly resumes from the last received event rather than restarting or losing events. Deliverable: a resumable SSE stream with a test proving correct resumption behavior. Skills exercised: event ID design, resumption logic.

### Lab 4 (Production): Build a backend relaying an LLM provider's streaming API
Implement a backend endpoint that calls a real (or mocked) LLM provider's streaming completion API and relays the incremental tokens to your own SSE endpoint, including content-policy-style error handling and a proper "done" event, deployed behind an nginx configuration with explicit no-buffering settings, verified via curl -N through the full path. Deliverable: a working, production-configured LLM streaming relay. Skills exercised: LLM streaming relay pattern, proxy buffering configuration and verification.
`,

  "real-projects": `
### 1. An LLM-powered chat application's streaming backend
Engineering requirements: a backend endpoint receiving a user's chat message via ordinary POST, calling an LLM provider's streaming completion API, and relaying incremental tokens to the frontend via SSE, with proper error event handling, authentication (given EventSource's header limitations), and verified no-buffering configuration through the full production deployment path (CDN, load balancer, application server).

### 2. A live data export/batch job progress indicator
Engineering requirements: an SSE endpoint streaming incremental progress updates (percentage complete, current stage) for a long-running backend operation, with heartbeat handling for operations with genuinely sparse progress updates, and a distinct completion event carrying the final result location/summary.

### 3. A live notification feed shared across multiple connected clients
Engineering requirements: an SSE-based notification system where an update originating from any source (a new comment, a status change) needs to reach all currently-connected clients interested in that specific resource, requiring a Redis pub/sub backplane (the same cross-instance broadcast pattern covered in the WebSockets skill) since this specific use case, unlike simple LLM streaming, does need cross-instance delivery.
`,

  "case-studies": `
### LLM providers' convergence on SSE for token streaming
The near-universal convergence of OpenAI, Anthropic, and virtually every other major LLM provider on SSE as the standard token-streaming mechanism — despite WebSockets being available and more broadly discussed in general web development circles — is a striking case study in choosing the SIMPLEST tool that genuinely fits the actual problem's shape, rather than the more general-purpose or more prominently-discussed option. Lesson: a use case's genuine directionality (one-way here) should drive the protocol choice, not a technology's general popularity or perceived sophistication — SSE's relative quietness in broader web development discourse didn't prevent it from becoming the dominant, correct choice for this specific, now enormously common pattern.

### SSE's "quiet" pre-LLM history followed by a sudden relevance surge
SSE's standardization alongside WebSockets in the same HTML5 era, followed by over a decade of comparatively modest, less-publicized adoption (largely for tickers, notifications, and similar niche uses) before ChatGPT's launch suddenly made it one of the most practically important protocols for an entire generation of AI application developers, illustrates how a technology's real-world significance can shift dramatically based on which application patterns become widespread, sometimes many years after the technology's original standardization. Lesson: a protocol or tool's current relative obscurity doesn't necessarily reflect its long-term importance — genuine architectural fit for an emerging, eventually-widespread use case can matter more than a technology's contemporaneous popularity.

### The recurring "works locally, breaks in production" buffering lesson
The extremely common pattern of SSE implementations working correctly in local development (no intermediary proxy) but silently breaking once deployed behind a production proxy/CDN/load balancer with default buffering behavior is a recurring, widely-shared lesson across companies and engineers adopting SSE, underscoring a general principle: any behavior depending on INCREMENTAL delivery through a network path must be explicitly tested through the ACTUAL production infrastructure, not assumed to transfer correctly from a simpler local testing environment. Lesson: infrastructure-dependent behaviors (buffering, timeouts, connection limits) require testing through genuinely representative infrastructure, not just application-level unit or integration tests against a direct connection.
`,

  comparisons: `
| Aspect | Server-Sent Events | WebSockets | REST | GraphQL | gRPC |
|--------|---------------------|------------|------|---------|------|
| Directionality | Server-to-client only | Full-duplex, bidirectional | Request-response | Request-response (subscriptions add server push) | Request-response, streaming, or bidirectional |
| Transport | Plain HTTP (chunked or HTTP/2 native) | A dedicated protocol atop an HTTP-upgraded TCP connection | HTTP/1.1 or HTTP/2 | HTTP (typically POST) | HTTP/2 |
| Reconnection | Automatic, built into EventSource, with Last-Event-ID resumption support | Manual, application-implemented | Not applicable (stateless per-request) | Not applicable | Configurable retry policies |
| Client integration | Native browser EventSource API, no library required | Native browser WebSocket API, though libraries (Socket.IO) are common | Any HTTP client | Any HTTP client, typically with a GraphQL client library | Requires generated code from a shared .proto |
| Best fit | Server-to-client streaming (LLM token streaming, live feeds, notifications) | Real-time bidirectional communication (chat, collaborative editing, voice) | Public APIs, standard CRUD | Flexible client-driven queries | High-throughput internal service communication |

**How seniors choose**: reach for SSE specifically for genuinely one-directional server-to-client streaming needs — LLM token streaming being the single most common, directly AI-relevant case — where its plain-HTTP simplicity and automatic reconnection are a better fit than WebSockets' unneeded bidirectional capability; reach for WebSockets, REST, GraphQL, or gRPC (each covered in its own skill) when their specific strengths better fit the actual problem.
`,

  "related-technologies": `
- **WebSockets** — the genuinely bidirectional alternative, covered alongside this skill for direct contrast on exactly when each fits better.
- **REST**, **GraphQL**, **gRPC** — the request-response-oriented API styles this category also covers, each solving a genuinely different problem than SSE's one-directional streaming focus.
- **HTTP** — the protocol SSE is built directly and entirely on top of, with no special upgrade mechanism required.
- **LLM provider APIs (OpenAI, Anthropic)** — the single most common, directly relevant real-world consumer of SSE for an AI engineer specifically, given their near-universal adoption of SSE for token streaming.
- **Nginx and other reverse proxies** — worth understanding specifically for their buffering configuration, the single most common SSE production pitfall.

Learning path: **REST** → **GraphQL** → **gRPC** → **WebSockets** → this page, completing this category's API styles — directly connecting to this platform's broader LLM/AI application engineering skills for practical, everyday application.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- SSE remains the dominant, near-universal mechanism for LLM token streaming across virtually every major provider's API, a pattern that has held consistently since it was first widely adopted.
- Continued strong browser support for EventSource across all major modern browsers, with Internet Explorer's historical lack of native support representing a diminishing (and by now largely irrelevant) legacy concern for most production applications.
- Growing familiarity and tooling maturity specifically around the "backend relaying an upstream LLM provider's SSE stream" pattern, given its centrality to modern AI application backend engineering.
- Continued reliance on explicit, deliberate no-buffering proxy/CDN configuration as a genuinely necessary production deployment step, rather than this becoming a "solved," invisible concern — verifying this through the actual production path remains an essential practice.
- Given how central SSE has become to LLM application development specifically, verify current provider-specific streaming API details (exact event formats, error handling conventions) against each provider's own official documentation, since these details can evolve independently of the underlying SSE protocol itself.
`,

  "future-roadmap": `
Where Server-Sent Events is heading, and what's worth betting career time on:

- **Continued, likely permanent dominance for LLM token streaming specifically**, given how precisely SSE's one-directional model fits this now enormously common, foundational AI application pattern.
- **Continued broad, stable browser and infrastructure support**, with SSE unlikely to be displaced for its core one-directional streaming use case by either WebSockets (genuine overkill for this specific pattern) or any emerging alternative protocol.
- **Growing practical importance specifically for AI engineers**, as SSE-based streaming backend patterns (relaying, authenticating, and applying business logic atop an upstream LLM provider's own stream) become an increasingly standard, expected skill for building production AI applications.
- **What to bet on**: deeply understanding the genuine one-directional fit test (recognizing precisely when SSE's simplicity is the right choice versus when WebSockets' bidirectional capability is genuinely needed) and the production deployment discipline (verifying no-buffering configuration through the real request path) — these are the durable, transferable skills, far more valuable long-term than any specific provider's exact streaming event format, which can and does evolve.
`,

  "cheat-sheet": `
~~~
# ---- Wire format: simple, human-readable text ----
data: {"token": "Hello"}

event: done
data: {}

: heartbeat            # a comment line -- ignored by EventSource, keeps conn alive

id: 42                 # for resumption via Last-Event-ID on reconnect
data: {"token": " world"}

retry: 3000             # suggests reconnect delay in ms
~~~

~~~javascript
// ---- Server (Express) ----
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.write("data: " + JSON.stringify({token: "Hi"}) + "\\n\\n");
req.on("close", () => cleanup());   // ALWAYS clean up server resources

// ---- Client (browser, built-in, no library needed) ----
const es = new EventSource("/stream");
es.onmessage = (e) => console.log(JSON.parse(e.data));
es.addEventListener("done", () => es.close());
// Auto-reconnects on drop, sends Last-Event-ID automatically. No extra code needed.
~~~

~~~
# ---- THE #1 production gotcha: intermediary buffering ----
# Works locally, breaks in prod = a proxy/LB/CDN is buffering the response.
# FIX (nginx): proxy_buffering off;
# Test with:  curl -N https://yourapi.com/stream   (disables curl's own buffering)

# ---- EventSource CANNOT set custom headers ----
# Auth via URL token, a cookie, or fetch+ReadableStream (loses auto-reconnect)

# ---- SSE is ONE-DIRECTIONAL ----
# Client's outgoing message = a SEPARATE ordinary HTTP request, NOT part of the stream.
# This is EXACTLY how LLM chat streaming works: POST to send, SSE stream to receive.

# ---- SSE vs WebSockets ----
# One-directional (LLM tokens, notifications, live feeds) -> SSE (simpler!)
# Both directions need frequent messages (chat, collab editing) -> WebSockets
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Core SSE directionality? | Server-to-client ONLY -- deliberately one-directional. |
| What content type does SSE use? | text/event-stream |
| How does SSE handle reconnection? | Automatically, built into EventSource, with Last-Event-ID resumption support. |
| Why do virtually all LLM providers use SSE for streaming? | Token generation is a genuinely one-directional data flow -- SSE fits it precisely. |
| #1 SSE production issue? | Intermediary proxy/CDN/LB buffering the response -- fix with proxy_buffering off. |
| Can a client send data back over an SSE connection? | No -- the client's messages go over a SEPARATE, ordinary HTTP request. |
| Does EventSource support custom headers? | No -- use a URL token, a cookie, or fetch+ReadableStream instead. |
| What keeps a long-lived, sparse-data SSE stream alive? | A heartbeat comment line (starting with a colon), ignored by EventSource. |
| SSE vs WebSockets -- when to choose SSE? | The need is genuinely one-directional (LLM tokens, notifications, live feeds). |
| How do you debug SSE buffering issues? | curl -N through the ACTUAL production path, not just a direct-to-origin test. |
| Why does SSE often avoid WebSockets' cross-instance broadcast problem? | Each client's stream is usually driven by that SAME client's own request (e.g. an LLM call). |
| What must the server do to support resumption? | Track/replay events from the ID in the client's Last-Event-ID header -- SSE only provides the protocol hook. |
`,

  mcqs: `
1. What is the fundamental directionality of Server-Sent Events?
   A) Bidirectional, like WebSockets  B) Server-to-client only  C) Client-to-server only  D) It depends on the framework
   **Answer: B** — any client-to-server communication happens via a separate, ordinary HTTP request.

2. Why do virtually all major LLM providers use SSE for streaming generated tokens?
   A) It's faster than any alternative  B) Token generation is a genuinely one-directional server-to-client data flow, which SSE fits precisely without unneeded bidirectional complexity  C) SSE supports binary data better  D) It's required by the HTML5 spec for AI APIs
   **Answer: B** — this is the single most important reason for SSE's dominance in this specific use case.

3. What is the single most common SSE production issue?
   A) Browser incompatibility  B) An intermediary proxy/load balancer/CDN buffering the HTTP response, breaking incremental delivery  C) SSE requires a database  D) SSE doesn't work over HTTPS
   **Answer: B** — diagnosed via curl -N through the actual production path and fixed with explicit no-buffering configuration.

4. Does the browser's EventSource API support setting custom request headers?
   A) Yes, exactly like fetch  B) No — authentication typically uses a URL token, a cookie, or an alternative approach like fetch+ReadableStream  C) Only in Chrome  D) Only with a polyfill
   **Answer: B** — a genuine, important limitation of the standard EventSource constructor.

5. How does EventSource support resuming a stream after a disconnection?
   A) It cannot resume at all  B) It automatically sends a Last-Event-ID header on reconnect, which the SERVER must use to replay events from that point  C) It restarts the entire application  D) It requires WebSockets underneath
   **Answer: B** — SSE provides the protocol mechanism, but the server must implement the actual resumption logic.

6. Why does SSE often avoid the cross-instance pub/sub broadcast problem that WebSockets commonly faces?
   A) SSE doesn't support multiple server instances at all  B) For the common LLM-streaming use case, each client's stream is driven by that same client's own request, so no cross-instance delivery is needed  C) SSE always runs on a single server  D) SSE uses a different database
   **Answer: B** — though a shared live-update use case would still face a similar cross-instance problem, requiring the same pub/sub backplane pattern as WebSockets.
`,

  "revision-notes": `
Server-Sent Events (SSE) is a standardized, HTTP-native protocol for one-directional streaming from a server to a client — the server keeps a single HTTP response open (Content-Type: text/event-stream) and writes a continuous stream of discrete, text-formatted events over time, while the browser's built-in EventSource API automatically receives, parses, and dispatches each event. Where **WebSockets** provides genuine bidirectional communication, SSE deliberately does ONLY server-to-client, gaining meaningful simplicity in exchange: plain HTTP with no special protocol upgrade, a simple human-readable text format (data:/event:/id: fields), and — critically — automatic reconnection with resumption support built directly into the browser, a genuine convenience WebSocket clients must implement manually.

SSE is, for AI engineers specifically, the single most practically important real-time protocol on this platform: it is the dominant, near-universal mechanism by which virtually every major LLM provider (OpenAI, Anthropic, and others) streams generated tokens back to a client incrementally. This dominance follows directly from LLM token streaming's genuine data flow shape — the client sends ONE request, then receives a stream of incremental tokens back — which is precisely SSE's one-directional design target, requiring none of WebSockets' bidirectional capability. Critically, the client's OUTGOING message (a user's next chat turn) is sent as a SEPARATE, ordinary HTTP request, entirely independent of the SSE stream carrying the response — a "conversation" is architecturally built from two distinct one-directional mechanisms, not one bidirectional channel.

The single most common, most confusing SSE production issue is INTERMEDIARY PROXY BUFFERING: many proxies, load balancers, and CDNs buffer HTTP responses by default, holding all the data until the response completes rather than delivering it incrementally — this defeats SSE's entire mechanism silently, often working correctly in local development (no intermediary in the path) while failing in production. The standard fix (proxy_buffering off in nginx, or the equivalent setting elsewhere) must be explicitly verified through the ACTUAL production request path, using tools like curl -N, rather than assumed to work by default.

EventSource's automatic reconnection sends a Last-Event-ID header (based on each event's optional id: field) on reconnect, but SSE only provides this PROTOCOL mechanism — the server must actually implement logic to track and replay events from the requested ID for genuine resumption to work. A genuinely important browser API limitation: EventSource's constructor does NOT support custom request headers, meaning authentication commonly relies on a URL query parameter token, a cookie-based session, or abandoning EventSource for a manually-consumed fetch ReadableStream when full header control is genuinely required. Long-lived streams with sparse data should send periodic HEARTBEAT comment lines (lines starting with a colon, ignored by EventSource) to prevent idle-timeout-triggered disconnection by intermediaries.

SSE's scalability story is often meaningfully simpler than WebSockets': for the dominant LLM-streaming use case, each client's stream is typically driven entirely by that SAME client's own request, so a server instance doesn't need to deliver data originating from OTHER clients — avoiding the harder cross-instance pub/sub backplane problem WebSockets commonly faces. However, use cases like a shared live notification feed (where an update from ANY source needs to reach ALL connected clients) DO face a similar cross-instance broadcast challenge, requiring the same Redis-based pub/sub backplane pattern covered in the **WebSockets** skill. A senior engineer applies the genuine one-directional fit test before choosing SSE: if the client also needs to send frequent, unprompted messages back over the same real-time channel, WebSockets is the correct choice instead.
`,

  "learning-roadmap": `
**Week 1 — SSE fundamentals**: the wire format, a basic server endpoint, and consuming it via EventSource. Milestone: build a working, incrementally-updating client for a simple periodic-update server.

**Week 2 — Production essentials**: heartbeat implementation, distinct error events, and explicit client disconnection cleanup. Milestone: harden the Week 1 server with all three, with tests verifying resource cleanup.

**Week 3 — Resumption and authentication**: event ID-based resumption logic, and choosing an appropriate authentication approach given EventSource's header limitation. Milestone: implement and test resumption behavior after a simulated disconnection.

**Week 4 — The LLM streaming relay pattern**: building a backend that consumes an upstream LLM provider's SSE stream and relays it to your own client, including error handling. Milestone: build a working relay against a real or mocked LLM provider streaming API.

**Week 5 — Production deployment and buffering**: configuring nginx (or an equivalent proxy) for no-buffering, and verifying correct incremental delivery through a realistic production-like path using curl -N. Milestone: deploy behind a proxy and prove incremental delivery survives the full path.

**Week 6 — Architectural decision-making**: applying the genuine one-directional fit test and comparing SSE against WebSockets/REST/GraphQL/gRPC for a range of hypothetical real-time feature scenarios. Milestone: document a decision framework applied to at least three different hypothetical scenarios, completing this category's five API styles.

This completes the **API Development** category's learning path: **REST** → **GraphQL** → **gRPC** → **WebSockets** → **Server-Sent Events**.
`,

  "official-docs": `
- **The HTML Living Standard's Server-Sent Events section (html.spec.whatwg.org)** — the official, current specification defining SSE's wire format and the EventSource API.
- **MDN Web Docs — Server-Sent Events and EventSource** — comprehensive, practical documentation for the browser API and event format.
- **OpenAI's API documentation on streaming** — the standard reference for how one major LLM provider implements and expects clients to consume its own SSE-based token streaming.
- **Anthropic's API documentation on streaming Messages** — the equivalent reference for Anthropic's own SSE-based streaming implementation.
`,

  books: `
- **"High Performance Browser Networking" — Ilya Grigorik** — includes technically precise coverage of SSE alongside WebSockets within the broader context of browser networking and streaming protocols.
- **"Building LLM Applications" style current books** covering practical streaming backend patterns for consuming and relaying LLM provider APIs, typically covering SSE-based relay patterns directly.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — covers the broader streaming and event-based system design concerns relevant to production SSE architecture at scale.
`,

  blogs: `
- **OpenAI's and Anthropic's own engineering/developer blogs** — practical guidance on correctly consuming and building against their respective streaming APIs.
- **Various company engineering blogs documenting SSE production deployment lessons**, particularly around the common proxy buffering pitfall.
- **Nginx's own official documentation and blog** on proxy buffering configuration, directly relevant to the single most common SSE production issue.
`,

  "research-papers": `
Server-Sent Events, as a protocol standardized through the W3C/WHATWG HTML5 process rather than academic research, has limited dedicated peer-reviewed literature; the most relevant related reading:

- **The HTML Living Standard's own SSE specification** — the closest equivalent to a formal technical specification.
- See the **WebSockets** skill's own history section for the concurrent HTML5-era standardization context both protocols share.
- General literature on incremental/streaming HTTP response delivery and proxy buffering behavior provides useful supporting technical grounding.
`,

  videos: `
- **Various "Server-Sent Events Explained" tutorials** covering the protocol's mechanics and the EventSource API.
- **OpenAI's and Anthropic's own developer conference talks and documentation videos** on building against their streaming APIs.
- **"SSE vs WebSockets" comparative talks** (various creators) providing a quick comparative overview directly relevant to this category.
- **Nginx configuration tutorials specifically covering proxy buffering** for SSE/streaming endpoints, directly addressing the most common production pitfall.
`,

  "github-repos": `
- **The WHATWG HTML specification repository** — the official source for the current SSE and EventSource specification text.
- **Various open-source LLM client library repositories** (for OpenAI, Anthropic, and others) demonstrating real-world SSE consumption patterns for token streaming.
- **eventsource-polyfill and similar repositories** — historical polyfills for EventSource support in browsers lacking native implementation (primarily a legacy concern by now).
- Framework-specific SSE/streaming response examples (FastAPI's StreamingResponse, Express's raw response streaming) — see each framework's own skill for specific implementation references.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Wire format basics**: implement a basic SSE server sending periodic updates, and a client consuming it via EventSource, verifying correct event parsing.
2. **Production hardening**: add heartbeat, a distinct error event type, and disconnection cleanup, with tests proving each works as expected.
3. **Resumption implementation**: implement event ID tracking and Last-Event-ID-based resumption, testing that a simulated disconnection correctly resumes rather than restarts or loses events.
4. **LLM streaming relay**: build a backend relaying a real or mocked LLM provider's streaming completion API to your own SSE endpoint, including proper error and completion event handling.
5. **Buffering diagnosis**: deploy an SSE endpoint behind an nginx proxy with DEFAULT (buffering-enabled) configuration, observe the broken behavior, then fix it explicitly and verify the fix via curl -N.
6. **External practice sets**: OpenAI's or Anthropic's own streaming API documentation and quickstart examples for practicing real-world LLM streaming consumption specifically.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client
        Browser["Browser (EventSource)"]
    end
    subgraph Edge
        CDN_LB["CDN / Load balancer\n(MUST be configured: no buffering)"]
    end
    subgraph Backend
        AppServer["Application server\n(SSE endpoint)"]
    end
    subgraph Upstream
        LLMProvider["LLM Provider API\n(its own SSE stream)"]
    end
    Browser -- "GET /chat (ordinary request for outgoing message)" --> CDN_LB
    CDN_LB --> AppServer
    AppServer -- "stream_completion()" --> LLMProvider
    LLMProvider -. "SSE: incremental tokens" .-> AppServer
    AppServer -. "SSE: relayed tokens" .-> CDN_LB
    CDN_LB -. "SSE: relayed tokens" .-> Browser
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Server-Sent Events))
    Foundations
      Overview
      History HTML5 era
      Why it exists
      Problem it solves
    Core Model
      text event-stream content type
      data event id fields
      EventSource API
      Automatic reconnection
    Resumption
      Event IDs
      Last-Event-ID header
      Server-side replay logic
    Production Essentials
      Heartbeat comment lines
      Error event type
      Disconnection cleanup
    The Number One Pitfall
      Proxy buffering
      curl -N diagnosis
      proxy_buffering off
    LLM Streaming
      Token streaming pattern
      Backend relay architecture
      Two mechanisms not one channel
    Scaling
      Often avoids cross instance broadcast
      Pub sub backplane when needed
    Security
      No custom headers limitation
      URL token or cookie auth
      CORS
    Comparisons
      Versus WebSockets REST GraphQL gRPC
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default sse;
