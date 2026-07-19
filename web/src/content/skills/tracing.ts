import type { SkillContent } from "../types";

/**
 * Tracing — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const tracing: SkillContent = {
  overview: `
Distributed tracing is the practice of recording a single request's complete journey as it flows through many independent services in a distributed system, capturing the precise timing and hierarchical structure of every operation the request triggers along the way. Tracing is the third of the three pillars of observability (alongside **Logging** and **Metrics**, both covered alongside this skill), and answers a question neither of the other two pillars can answer well: "for THIS specific slow request, exactly WHERE in the chain of a dozen microservices did the time actually go?"

For an AI engineer, tracing is essential for diagnosing latency problems in any system with more than a handful of interacting services — a common reality for AI applications, which frequently chain together a request-handling API, a vector database lookup, an LLM API call, and possibly multiple tool invocations, any one of which could be the actual source of an unexpectedly slow response. Tracing directly underlies this platform's **Agent Observability** skill, since understanding why an AI agent's multi-step reasoning process took an unexpectedly long time (or made an unexpected sequence of tool calls) requires exactly the kind of hierarchical, timed request reconstruction tracing provides.

Key characteristics: **spans**, the fundamental unit of tracing — a single named, timed operation (an HTTP call, a database query, an LLM API request) with a start time, duration, and parent-child relationships to other spans; **traces**, the complete tree of spans representing one request's entire journey across every service it touched; **trace context propagation**, passing a trace's identifying information (trace ID, parent span ID) across service boundaries so each service's spans can be correctly attached to the same overall trace; and **sampling**, the necessary practice of only fully recording a fraction of all traces, since capturing complete detail for every single request at scale would be prohibitively expensive.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2010 | **Google publishes the Dapper paper**, describing their internal, production-scale distributed tracing infrastructure — the foundational, most influential paper in distributed tracing's history, directly inspiring nearly every tracing system that followed |
| 2012 | **Twitter open-sources Zipkin**, directly inspired by Dapper, becoming one of the earliest widely-adopted open-source distributed tracing systems |
| 2015 | **Uber develops Jaeger**, another widely-adopted open-source distributed tracing system, later donated to the Cloud Native Computing Foundation (CNCF) |
| 2016 | The **OpenTracing** project emerges, attempting to standardize a vendor-neutral tracing instrumentation API so applications wouldn't need to be rewritten for different tracing backends |
| 2019 | **OpenCensus** (Google's own tracing/metrics instrumentation project) and OpenTracing merge to form **OpenTelemetry** (covered in its own skill), unifying tracing instrumentation with logging and metrics under one standard |
| 2019–2020s | Distributed tracing adoption grows significantly alongside the broader industry shift toward microservices architectures, where tracing's core value proposition (understanding cross-service request flow) becomes genuinely essential rather than a nice-to-have |
| 2020s | Continued growth of tracing specifically for AI/LLM application debugging, capturing the multi-step, multi-service nature of RAG pipelines and agentic workflows |

Tracing's history reflects the clearest, most direct example among the three observability pillars of a single foundational paper (Google's Dapper) shaping an entire subsequent field — nearly every distributed tracing system built since 2010, open-source or commercial, directly traces its conceptual lineage back to Dapper's specific design choices (spans, trace IDs, sampling).
`,

  "why-it-exists": `
Distributed tracing exists because, once an application's architecture shifted from a single monolithic process to many independent, communicating microservices, a fundamental question that used to be trivially answerable (where did the time go during this request?) became genuinely difficult: a single user-facing request might trigger calls across a dozen or more independently-deployed services, each potentially adding meaningful latency, and neither logging (which captures per-service events but not inherently their causal, timed relationship across services) nor metrics (which capture aggregate signals, not any specific individual request's detailed path) could reconstruct that request's precise cross-service timeline.

Google's engineers, building and operating one of the world's largest, most complex distributed systems, faced this problem acutely and directly — with requests routinely fanning out across many internal services, understanding why a SPECIFIC slow request was slow (as opposed to understanding aggregate service health, which metrics already handled well) required a fundamentally different kind of instrumentation: one that could follow a single request's identity across every service boundary it crossed, recording the precise timing and hierarchical nesting of every operation along the way.

Dapper's key insight — representing a request's journey as a tree of "spans" (named, timed operations, each aware of its parent span) linked by a shared "trace ID" propagated across every service boundary — directly solved this: it gave engineers a way to visualize and query a SPECIFIC request's complete cross-service execution as a single, coherent timeline, showing exactly which service, and which specific operation within that service, consumed how much of the total request time — a capability neither aggregate metrics nor per-service logs could provide on their own.
`,

  "problem-it-solves": `
Distributed tracing solves the **"for a specific individual request, exactly where across many interacting microservices did its total time actually go, and in what causal, hierarchical order did those operations occur"** problem.

Concretely, tracing provides:

- **A complete, hierarchical timeline for a single request**, showing every operation it triggered (across however many services), each operation's exact duration, and the parent-child relationships between them (which operation called which).
- **Immediate visual identification of the actual bottleneck**, since a trace's visualization (a "waterfall" or "flame graph" view, covered in Beginner Concepts) makes it immediately obvious which specific span consumed the most time, rather than requiring manual timestamp cross-referencing across separately-stored per-service logs.
- **Causal, cross-service correlation** that's structurally guaranteed correct (via trace context propagation), rather than relying on approximate timestamp matching or a manually-threaded correlation ID (covered in the **Logging** skill) that could theoretically be inconsistently applied.
- **A direct connection point for debugging genuinely complex request flows** — particularly relevant for AI applications where a single user request might trigger a chain of retrieval, LLM inference, and tool-calling operations, each a natural candidate for its own span.

What tracing does **not** solve, or solves with a real tradeoff: capturing complete trace detail for EVERY single request at meaningful production scale is prohibitively expensive (in both storage and the performance overhead of the tracing instrumentation itself), requiring deliberate SAMPLING — meaning tracing, unlike metrics, typically only has DETAILED data for a fraction of all requests, not a complete record; tracing requires genuine, consistent instrumentation effort across every service a request might touch, since a service that doesn't properly propagate trace context creates a gap in the resulting trace; and tracing, like logging, doesn't provide metrics' efficient AGGREGATE view of overall system health — you generally need to already suspect a specific problem (or have a specific slow request in hand) before diving into trace data, rather than tracing alone surfacing "the system's error rate is elevated" the way a dashboard-driven metric would.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the core tracing concepts: spans, traces, trace context, and parent-child span relationships.
2. Explain trace context propagation and how it's implemented across service boundaries (HTTP headers, message queue metadata).
3. Read and interpret a trace visualization (waterfall/flame graph view) to identify a request's actual latency bottleneck.
4. Explain sampling strategies (head-based, tail-based) and their tradeoffs for managing tracing's storage/performance cost at scale.
5. Design meaningful span instrumentation for a service, choosing appropriate span boundaries and attributes.
6. Understand tracing's relationship to logging and metrics as the third complementary pillar of observability.
7. Recognize and avoid common tracing anti-patterns: missing context propagation, excessive span granularity, and inappropriate sampling.
8. Apply tracing specifically to debugging AI application request flows (RAG pipelines, agentic tool-calling chains).
9. Answer senior-level interview questions on trace context propagation, sampling strategy, and production debugging technique.
`,

  prerequisites: `
- **Required**: the **Logging** and **Metrics** skills (covered alongside this one) — tracing is the third, complementary pillar completing the observability trilogy these establish.
- **Very helpful**: the **Distributed Systems** skill for understanding why cross-service request tracking becomes genuinely necessary at microservices scale.
- **Very helpful**: the **OpenTelemetry** skill for the modern, standardized instrumentation approach unifying tracing with logging and metrics.

Dependency links: **Logging** → **Metrics** → this page, completing the three pillars of observability → **OpenTelemetry** for the unifying standard across all three.
`,

  "beginner-concepts": `
### Spans: the fundamental unit of tracing

~~~
A span represents ONE named, timed operation:
├── name: "GET /api/orders/42"
├── start_time, end_time (or duration)
├── span_id (unique to this specific operation)
├── parent_span_id (which operation CALLED this one, if any)
└── attributes: key-value metadata (http.status_code, db.statement, etc.)
~~~

A span is the basic building block — a single HTTP request handler, a single database query, a single external API call, each typically becomes its own span with its own precise start/end time.

### Traces: a tree of related spans

~~~mermaid
flowchart TB
    Root["Span: HTTP GET /checkout\n(200ms total)"]
    Root --> Auth["Span: authenticate_user\n(20ms)"]
    Root --> Inventory["Span: check_inventory\n(50ms)"]
    Root --> Payment["Span: charge_payment\n(120ms)"]
    Payment --> Stripe["Span: call Stripe API\n(110ms)"]
~~~

A trace is the complete tree of all spans belonging to ONE specific request — the root span represents the overall request, with child spans representing the operations it triggered, each child potentially having its own children (like the Stripe API call nested under charge_payment here) — this hierarchical structure directly shows both WHAT happened and in WHAT ORDER/nesting.

### Reading a waterfall visualization

~~~
|-- HTTP GET /checkout ------------------------------| 200ms total
    |-- authenticate_user --|  20ms
                              |-- check_inventory --|  50ms
                                                      |-- charge_payment ------------| 120ms
                                                          |-- call Stripe API -----| 110ms
~~~

A waterfall view (the standard trace visualization) makes a request's bottleneck immediately visually obvious — here, charge_payment (and specifically the nested Stripe API call within it) clearly dominates the total request time, precisely the kind of insight that would require painstaking manual correlation to extract reliably from separate per-service logs.

### Basic trace context propagation

~~~python
import requests

def handle_checkout(trace_id, parent_span_id):
    -- pass the SAME trace_id, with THIS operation's span_id as the
    -- new parent, to any downstream service call
    headers = {"X-Trace-Id": trace_id, "X-Parent-Span-Id": current_span_id}
    response = requests.post("http://payment-service/charge", headers=headers)
~~~

Trace context (the trace ID and current span ID) is propagated across service boundaries via HTTP headers (or equivalent metadata for other transport mechanisms) — this is precisely what lets a downstream service's spans be correctly attached to the SAME overall trace, rather than starting an entirely new, disconnected trace.
`,

  "intermediate-concepts": `
### Instrumenting a service with spans

~~~python
from opentelemetry import trace

tracer = trace.get_tracer("payment-service")

def charge_payment(order_id, amount):
    with tracer.start_as_current_span("charge_payment") as span:
        span.set_attribute("order.id", order_id)
        span.set_attribute("payment.amount", amount)
        with tracer.start_as_current_span("call_stripe_api"):
            result = call_stripe(order_id, amount)
        return result
~~~

Modern tracing instrumentation (via OpenTelemetry, covered in its own skill) automatically handles trace context propagation and parent-child span nesting, letting engineers focus on choosing meaningful span boundaries and attaching useful attributes, rather than manually managing trace/span IDs.

### Head-based versus tail-based sampling

~~~
Head-based sampling: the DECISION to fully trace a request is
    made at the VERY START (e.g., "trace 1% of all requests,
    chosen randomly") -- simple to implement, but might miss
    tracing the specific slow/erroring requests you'd actually
    want detailed data for, since the decision is made before
    knowing how the request will turn out

Tail-based sampling: the decision is made AFTER the request
    completes, based on its ACTUAL outcome (e.g., "always keep
    traces for requests that errored or took longer than 1
    second") -- much more likely to retain the traces that are
    actually diagnostically valuable, at the cost of needing to
    buffer complete trace data for every request until a
    keep/discard decision can be made
~~~

Tail-based sampling is generally more valuable for actual production debugging (since it preferentially retains the interesting, problematic traces) but requires meaningfully more infrastructure (buffering complete trace data before the sampling decision) than simpler head-based sampling.

### Span attributes and semantic conventions

~~~python
with tracer.start_as_current_span("db_query") as span:
    span.set_attribute("db.system", "postgresql")
    span.set_attribute("db.statement", "SELECT * FROM orders WHERE id = ?")
    span.set_attribute("db.operation", "SELECT")
~~~

OpenTelemetry defines standardized "semantic conventions" for common span attribute names (db.system, http.method, and many others) — using these standard conventions (rather than inventing ad-hoc attribute names per service) makes traces more consistently interpretable across tools and teams, directly analogous to the **Logging** skill's own emphasis on consistent structured field naming.

### Linking traces to logs and metrics

~~~python
import logging

def log_with_trace_context(message, **fields):
    span = trace.get_current_span()
    span_context = span.get_span_context()
    logging.info(message, extra={
        "trace_id": format(span_context.trace_id, "032x"),
        "span_id": format(span_context.span_id, "016x"),
        **fields,
    })
~~~

Including the current trace ID and span ID directly within structured log entries (covered in the **Logging** skill) lets an engineer jump directly from a specific span in a trace to the exact log lines emitted during that span's execution — a genuinely powerful, increasingly standard cross-pillar observability integration.
`,

  "advanced-concepts": `
### Distributed context propagation across asynchronous boundaries

~~~
Trace context propagation is straightforward across a synchronous
HTTP call (pass headers along). It becomes genuinely harder across
ASYNCHRONOUS boundaries -- a message queue, a background job
scheduled for later execution -- since there's no synchronous
call to attach headers to; the trace context must instead be
explicitly SERIALIZED into the message/job payload itself, and
explicitly deserialized and restored when that message/job is
eventually processed, potentially much later and on an entirely
different machine.
~~~

This is a genuinely important, easy-to-overlook instrumentation gap — many tracing implementations handle synchronous HTTP call propagation well by default, but require explicit, deliberate work to correctly propagate trace context across message queues, background job systems, or other asynchronous boundaries.

### Trace sampling rate tuning and its tradeoffs

~~~
Too LOW a sampling rate: you might simply never capture a
    complete trace for a specific rare, intermittent bug,
    even if it's genuinely production-impacting
Too HIGH a sampling rate: tracing infrastructure storage and
    performance overhead cost grows proportionally, potentially
    becoming a genuine, significant cost line item at scale
~~~

Production tracing systems commonly combine a low BASELINE sampling rate (for general visibility) with tail-based sampling rules specifically ensuring errors and unusually slow requests are ALWAYS retained regardless of the baseline rate — balancing overall cost against the genuine need to capture the specific traces most likely to be diagnostically valuable.

### Span granularity: avoiding both too little and too much detail

~~~
Too COARSE granularity: a single span covering "handle entire
    request" provides little more diagnostic value than a
    simple duration metric would -- you can't see WHERE within
    that broad operation the time actually went
Too FINE granularity: a span for every single trivial internal
    function call produces an overwhelming, hard-to-navigate
    trace with excessive instrumentation overhead, without a
    corresponding genuine diagnostic benefit
~~~

Choosing appropriate span boundaries — typically at meaningful operation boundaries (a database query, an external API call, a significant internal processing stage) rather than either the entire request or every trivial function call — is a genuine, senior-level instrumentation design judgment.

### Tracing for AI agent and RAG pipeline debugging

~~~python
with tracer.start_as_current_span("rag_query") as span:
    with tracer.start_as_current_span("vector_search") as search_span:
        search_span.set_attribute("query.text", query)
        results = vector_db.search(query)
        search_span.set_attribute("results.count", len(results))
    with tracer.start_as_current_span("llm_generation") as gen_span:
        gen_span.set_attribute("model", "gpt-5")
        response = llm.generate(query, context=results)
        gen_span.set_attribute("tokens.total", response.token_count)
~~~

Applying tracing specifically to an AI application's request flow (a RAG pipeline's vector search step, then its LLM generation step, each as a distinct, timed, attribute-rich span) directly reveals which specific stage of an AI request's pipeline is the actual latency bottleneck — a genuinely common, directly relevant AI engineering application, and the foundation of this platform's **Agent Observability** skill's deeper treatment.

### Trace-based root cause analysis in a genuinely complex microservices topology

~~~
At sufficient microservices scale (dozens or hundreds of
services), a single slow request's trace might span many
services with complex, sometimes surprising call topologies
(fan-out to multiple parallel downstream calls, unexpected
retries, cascading calls several layers deep) -- tracing's
tree-structured visualization is specifically what makes this
kind of genuinely complex, otherwise hard-to-reason-about
topology tractable to actually debug.
~~~
`,

  "internal-working": `
What happens internally as a trace's context propagates across two services, tracing the header-passing mechanism:

~~~mermaid
sequenceDiagram
    participant Client
    participant ServiceA as Service A (API gateway)
    participant ServiceB as Service B (order service)
    participant Tracer as Tracing backend (Jaeger/Zipkin)

    Client->>ServiceA: HTTP request (no existing trace context)
    ServiceA->>ServiceA: generate a NEW trace_id, start root span
    ServiceA->>ServiceB: forward request WITH trace context\n(traceparent HTTP header: trace_id + parent span_id)
    ServiceB->>ServiceB: parse incoming trace context,\nstart a NEW child span with the SAME trace_id
    ServiceB->>ServiceB: complete processing, span ends
    ServiceB-->>ServiceA: response
    ServiceA->>ServiceA: root span ends
    ServiceA->>Tracer: (asynchronously) export completed spans
    ServiceB->>Tracer: (asynchronously) export completed spans
    Note over Tracer: Tracer backend reconstructs the FULL\ntrace tree from spans exported by BOTH services,\nlinked by the shared trace_id
~~~

1. **The FIRST service to handle a request (with no existing trace context) generates a brand new trace ID**, starting the root span of what will become the complete trace.
2. **Trace context (trace ID plus the current span's ID) is propagated to every downstream service call**, typically via a standardized HTTP header (the W3C Trace Context standard's traceparent header, in modern OpenTelemetry-based systems).
3. **Each downstream service parses the incoming trace context and starts its OWN child span** using the SAME trace ID (linking it to the overall trace) but a NEW span ID (identifying this specific service's own operation), with the incoming span ID recorded as this new span's parent.
4. **Completed spans are exported asynchronously** (not blocking the actual request) to a centralized tracing backend, which reconstructs the complete trace tree by grouping all spans sharing the same trace ID.

**Why this matters**: understanding that trace context propagation is what STRUCTURALLY guarantees correct cross-service correlation (rather than relying on approximate timestamp matching, as would be necessary without it) explains why a service that fails to correctly forward trace context headers creates a genuine GAP in the resulting trace — that service's operations become invisible to the overall trace, appearing as an unexplained time gap rather than a properly attributed, nested span.
`,

  architecture: `
A senior engineer thinks about tracing architecture across several dimensions: designing appropriate span boundaries and sampling strategy, ensuring trace context propagation is correctly implemented across every service boundary (including genuinely tricky asynchronous ones), and recognizing tracing's specific, complementary role relative to logging and metrics.

### The span granularity decision framework

~~~mermaid
flowchart TB
    Q1{"Is this operation a\nmeaningful, potentially\nslow, independently-\nunderstandable unit of work?"}
    Q1 -->|"Yes (a DB query, an\nexternal API call, a\nsignificant processing stage)"| CreateSpan["Create a dedicated span"]
    Q1 -->|"No (a trivial internal\nfunction call, negligible\nduration)"| SkipSpan["Don't create a separate\nspan -- excessive granularity\nadds overhead without benefit"]
~~~

This framework — choosing span boundaries at meaningful operation boundaries rather than either too coarse (the whole request) or too fine (every function call) — directly determines whether a resulting trace is genuinely useful for diagnosing bottlenecks or either uninformatively vague or overwhelmingly cluttered.

### Designing a production sampling strategy

~~~mermaid
flowchart LR
    Baseline["Low baseline sampling rate\n(e.g., 1% of all requests)"] --> Combined["Combined strategy"]
    TailBased["Tail-based rules: ALWAYS\nkeep errored or slow requests"] --> Combined
    Combined --> Balanced["Manages overall cost while\nretaining diagnostically\nvaluable traces"]
~~~

A senior engineer designs sampling deliberately, typically combining a low baseline rate for general visibility with tail-based rules ensuring genuinely important traces (errors, unusually slow requests) are retained regardless of the baseline rate — a naive uniform sampling rate risks missing exactly the traces you'd most want when debugging a specific problem.

### Ensuring context propagation across ALL boundaries, including asynchronous ones

~~~mermaid
flowchart LR
    SyncCall["Synchronous HTTP calls:\ncontext propagation is often\nhandled automatically by\nmodern tracing libraries"]
    AsyncBoundary["Asynchronous boundaries\n(message queues, background jobs):\nREQUIRES EXPLICIT, deliberate\ncontext serialization/deserialization"]
~~~

A senior engineer specifically audits for asynchronous boundaries (message queues, scheduled jobs) where trace context propagation is NOT automatic and requires deliberate implementation — a common, easily-overlooked gap that silently breaks trace continuity for exactly the kind of complex, multi-stage AI application pipelines (queued background processing, async tool execution) this platform's content increasingly involves.
`,

  "data-flow": `
Tracing a complete RAG pipeline request, illustrating span hierarchy across retrieval and generation stages:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as API service
    participant VectorDB as Vector database
    participant LLM as LLM provider

    Client->>API: POST /chat {query}
    API->>API: start root span "handle_chat_request"
    API->>VectorDB: start child span "vector_search"
    VectorDB-->>API: relevant documents returned
    API->>API: end "vector_search" span (e.g., 45ms)
    API->>LLM: start child span "llm_generation"
    LLM-->>API: generated response
    API->>API: end "llm_generation" span (e.g., 1200ms)
    API->>API: end root span (e.g., 1260ms total)
    API-->>Client: response
~~~

The critical detail: this trace immediately, visually reveals that llm_generation (1200ms) dominates the total request time (1260ms), while vector_search (45ms) is comparatively negligible — precisely the kind of insight an engineer needs to correctly prioritize optimization effort (focusing on LLM call latency/caching rather than vector search performance, in this specific example), reliably extracted from the trace's structure rather than requiring manual cross-referencing of separately-logged timestamps from two different subsystems.
`,

  "production-usage": `
### Instrumenting a production service with OpenTelemetry tracing

~~~python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="tracing-backend:4317"))
)
tracer = trace.get_tracer("my-service")

def handle_request(request):
    with tracer.start_as_current_span("handle_request") as span:
        span.set_attribute("http.method", request.method)
        with tracer.start_as_current_span("database_query"):
            result = query_database(request)
        return result
~~~

### Non-negotiables for production tracing

1. **Ensure trace context propagation is correctly implemented across EVERY service boundary**, including asynchronous ones (message queues, background jobs).
2. **Design a deliberate sampling strategy**, typically combining a low baseline rate with tail-based rules for errors/slow requests.
3. **Choose meaningful span boundaries**, avoiding both excessive coarseness and excessive granularity.
4. **Use standardized semantic conventions** for span attributes, rather than ad-hoc naming per service.
5. **Link traces to logs via shared trace/span IDs**, enabling cross-pillar investigation.

### Common production patterns

- **OpenTelemetry-based instrumentation** (covered in its own skill) as the modern standard, vendor-neutral approach to tracing instrumentation.
- **Jaeger or Zipkin** as widely-used open-source tracing backends for storage, query, and visualization.
- **Tail-based sampling** ensuring errored/slow requests are always retained for detailed investigation.
- **Trace-to-log linking** via exemplars or shared trace IDs, bridging tracing's detail with logging's full-text search capability.
`,

  "industry-examples": `
- **Google's Dapper**: the foundational internal system directly inspiring virtually every subsequent distributed tracing tool, described in the landmark 2010 paper.
- **Jaeger** (originally from Uber, now a CNCF project): a widely-adopted open-source distributed tracing backend, commonly used alongside OpenTelemetry instrumentation.
- **Zipkin** (originally from Twitter): another long-standing, widely-used open-source tracing backend.
- **Datadog APM, New Relic, and similar commercial observability platforms**: provide managed distributed tracing alongside logging and metrics in a unified product.
- **Every major AI application framework's growing tracing integrations** (LangChain's, LlamaIndex's own tracing/observability hooks): directly applying distributed tracing concepts to RAG and agentic pipeline debugging, connecting to this platform's **LangSmith** and **Langfuse** skills.
`,

  "best-practices": `
1. **Ensure trace context propagation across every service boundary**, with specific attention to asynchronous boundaries (message queues, background jobs) that don't propagate context automatically.
2. **Design span boundaries at meaningful operation boundaries** (database queries, external API calls, significant processing stages), avoiding both excessive coarseness and excessive granularity.
3. **Use standardized semantic conventions** for span names and attributes, enabling consistent interpretation across tools and teams.
4. **Design a deliberate sampling strategy** combining a low baseline rate with tail-based rules for errors and slow requests.
5. **Link traces to logs** via shared trace/span IDs, enabling investigators to move fluidly between aggregate trace structure and detailed per-event log context.
6. **Use OpenTelemetry** (covered in its own skill) as the modern, vendor-neutral standard instrumentation approach rather than a proprietary, vendor-specific tracing SDK.
7. **Apply tracing specifically to AI application pipelines** (RAG retrieval-plus-generation stages, agentic tool-calling sequences) where multi-stage latency attribution is genuinely valuable.
8. **Monitor tracing infrastructure's own overhead and cost**, tuning sampling rates as the system scales.
9. **Test that context propagation works correctly** across your specific service topology, including any asynchronous boundaries.
10. **Recognize tracing's specific, complementary role** relative to logging (detailed per-event context) and metrics (efficient aggregate signals), rather than trying to make one pillar substitute for the others.
`,

  "anti-patterns": `
### Missing trace context propagation across asynchronous boundaries

~~~python
# WRONG — a message published to a queue with no trace context,
# breaking trace continuity once it's processed later, elsewhere
def publish_job(job_data):
    queue.publish(job_data)   -- trace context silently lost here

# RIGHT — explicitly serialize and propagate trace context
def publish_job(job_data, trace_context):
    queue.publish({**job_data, "trace_context": serialize(trace_context)})

def process_job(message):
    trace_context = deserialize(message["trace_context"])
    with tracer.start_as_current_span("process_job", context=trace_context):
        handle(message)
~~~

This is one of the single most common tracing gaps in production systems — synchronous HTTP call propagation is often handled automatically by modern tracing libraries, but asynchronous boundaries (queues, scheduled jobs) require deliberate, explicit context propagation that's easy to overlook.

### Excessive span granularity

~~~python
# WRONG — a span for every trivial internal function call,
# producing an overwhelming, hard-to-navigate trace with real
# instrumentation overhead and no corresponding diagnostic benefit
def process_order(order):
    with tracer.start_as_current_span("validate_field_1"): ...
    with tracer.start_as_current_span("validate_field_2"): ...
    with tracer.start_as_current_span("validate_field_3"): ...
    -- dozens more trivial spans...

# RIGHT — span at meaningful operation boundaries
def process_order(order):
    with tracer.start_as_current_span("validate_order"):
        validate_all_fields(order)   -- one span covering the whole validation stage
~~~

### Other production-grade anti-patterns

- **Uniform, naive sampling with no tail-based rules**, risking missing exactly the errored/slow traces most valuable for debugging.
- **Ad-hoc, inconsistent span/attribute naming per service**, undermining consistent cross-service trace interpretation.
- **Not linking traces to logs**, missing the valuable ability to jump from a specific slow span directly to detailed log context.
- **Treating tracing as a substitute for metrics-based dashboards/alerting**, when tracing's per-request depth doesn't provide the efficient aggregate view metrics are specifically designed for.
- **Ignoring tracing infrastructure overhead/cost**, failing to tune sampling rates as request volume scales.
`,

  performance: `
### Rule zero: tracing itself must not meaningfully degrade the requests it's observing

Tracing instrumentation overhead (recording spans, propagating context) must remain low relative to actual request-handling time, or it defeats its own purpose.

### The performance hierarchy (apply in order)

1. **Use asynchronous span export**, never blocking the actual request-handling path on sending completed span data to the tracing backend.
2. **Apply appropriate sampling** to manage both storage cost and instrumentation overhead, rather than attempting to fully trace every single request.
3. **Choose span granularity deliberately**, avoiding excessive per-operation overhead from too many trivial spans.
4. **Batch span export** (sending accumulated completed spans together rather than one network call per span) to reduce export overhead.
5. **Profile tracing's own overhead specifically** in genuinely high-throughput, latency-sensitive code paths.

### Micro-level facts worth knowing

- Modern tracing SDKs (OpenTelemetry's, specifically) are designed with genuinely low per-span overhead, but this overhead is not literally zero and can matter in extremely high-throughput scenarios.
- Tail-based sampling requires buffering complete trace data until a keep/discard decision can be made, incurring real memory/infrastructure cost proportional to the volume of requests being considered, distinct from head-based sampling's simpler, lower-overhead approach.
- Trace context propagation itself (adding a header to every outbound request) has negligible overhead compared to the actual network round-trip cost of the calls it's propagated alongside.
`,

  scalability: `
Tracing's scalability concern centers specifically on managing the genuine storage and processing cost of trace data at production request volume, primarily addressed through deliberate sampling strategy.

### Why sampling is tracing's central scalability lever

~~~mermaid
flowchart LR
    FullTracing["Tracing 100% of requests"] --> Prohibitive["Prohibitively expensive\nstorage and processing cost\nat meaningful production scale"]
    SampledTracing["Sampling (e.g., 1% baseline\n+ tail-based error/slow retention)"] --> Sustainable["Manageable cost while\nretaining diagnostically\nvaluable traces"]
~~~

Unlike metrics (whose cost scales primarily with cardinality, not raw event volume), tracing's cost scales roughly with the volume of DETAILED per-request data retained — making sampling strategy the primary, essential lever for keeping tracing infrastructure cost sustainable at scale.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Tracing storage/processing cost growing unsustainably | Tune sampling rate down for the baseline, relying on tail-based rules for genuinely important traces |
| Missing traces for rare, intermittent production issues | Increase tail-based sampling coverage (always retaining errors/slow requests specifically) |
| Tracing backend query performance degrading at scale | Appropriate indexing and potentially federation/sharding of the tracing backend itself |
| Context propagation gaps across async boundaries at scale | Systematic audit and remediation of every asynchronous integration point |
`,

  security: `
### Sensitive data in span attributes

~~~
Just as logs (covered in the Logging skill) should never
contain sensitive data, span ATTRIBUTES (which are stored and
often retained for a meaningful period in tracing backends)
carry the SAME risk -- a span attribute capturing a full SQL
query with embedded user data, or a full request body, could
inadvertently expose genuinely sensitive information.
~~~

### Essential tracing security practices

1. **Never include sensitive data in span attributes**, applying the same discipline covered in the **Logging** skill to tracing instrumentation.
2. **Restrict access to tracing backend UIs and APIs** to appropriate internal personnel, since traces can reveal detailed internal system architecture and behavior.
3. **Be cautious with automatic instrumentation that captures full request/response bodies**, verifying it doesn't inadvertently expose sensitive fields.
4. **Apply data retention policies to trace data**, consistent with your organization's broader data retention and privacy requirements.

See the **OWASP Top 10** and **Secrets Management** skills for the broader security context this connects to.
`,

  testing: `
### Testing trace context propagation

~~~python
def test_trace_context_propagates_across_service_call():
    with tracer.start_as_current_span("test_root") as root_span:
        trace_id = root_span.get_span_context().trace_id
        response = call_downstream_service()
        -- verify the downstream service's recorded span
        -- shares the SAME trace_id as the root span
        assert get_recorded_span_trace_id(response) == trace_id

def test_async_job_preserves_trace_context():
    with tracer.start_as_current_span("test_root") as root_span:
        trace_id = root_span.get_span_context().trace_id
        publish_job_with_context(job_data)
    processed_span = simulate_job_processing()
    assert processed_span.trace_id == trace_id   -- context survived the async boundary
~~~

### The senior testing doctrine

- Test trace context propagation explicitly across every service boundary type your system uses, including asynchronous ones (message queues, scheduled jobs).
- Test that span attributes are populated correctly and don't inadvertently include sensitive data.
- Test sampling logic explicitly, verifying tail-based rules correctly retain errored/slow request traces.
- Verify span hierarchy (parent-child relationships) is correctly formed for a multi-step operation, not just that individual spans exist.
`,

  debugging: `
### The toolbox, in escalation order

1. **Start with the tracing backend's search interface** (Jaeger, Zipkin, or your platform's equivalent) to find the specific slow or erroring request's trace, typically via its trace ID (often available from a correlated log entry or a returned error response header).
2. **Examine the trace's waterfall visualization** to immediately identify which specific span dominates the total request duration.
3. **Check for unexpected gaps in the trace** (a period of time not accounted for by any visible span), a strong signal of a missing context propagation point at that specific boundary.
4. **Cross-reference the bottleneck span with logs** (via shared trace/span IDs) for detailed, per-event context about what that specific operation was actually doing.

### Debugging common tracing-specific symptoms

- "A request's trace has a mysterious time gap with no corresponding span" — suspect a missing trace context propagation point, commonly at an asynchronous boundary (a message queue, a background job) that wasn't correctly instrumented.
- "I can't find a trace for a specific request I know was slow" — check whether it was actually sampled; if using head-based sampling with a low rate, many requests genuinely won't have detailed trace data available.
- "A trace shows unexpected parallel/fan-out calls I didn't expect" — this can be genuinely valuable diagnostic information, revealing an actual system behavior (parallel downstream calls, unexpected retries) that wasn't obvious from code inspection alone.
- "Span attributes are missing expected detail" — verify the specific instrumentation point actually sets the expected attributes, and check semantic convention naming consistency.
`,

  monitoring: `
### Key signals to track

- **Tracing backend ingestion rate and storage growth**, informing sampling rate tuning decisions.
- **Sampling rate and its effectiveness** (are errored/slow requests actually being retained via tail-based rules), verified periodically.
- **Trace completeness** (the presence of unexpected gaps indicating missing context propagation), particularly for asynchronous integration points.
- **Tracing instrumentation's own performance overhead**, ensuring it remains a small fraction of actual request-handling time.

### Tools

Jaeger and Zipkin's own built-in dashboards for trace volume, storage, and search performance; OpenTelemetry Collector's own metrics for pipeline health; standard infrastructure monitoring for the tracing backend's own resource usage.

### Alerting priorities

Alert on tracing infrastructure failures (traces not being successfully exported/stored, a genuine observability blind spot), on unexpected storage growth (a signal of a sampling misconfiguration), and on detected context propagation gaps at critical asynchronous integration points.
`,

  deployment: `
### Deploying an OpenTelemetry Collector for centralized trace processing

~~~yaml
# A common production pattern: applications export traces to a
# local/sidecar OpenTelemetry Collector, which batches, samples,
# and forwards them to the actual tracing backend -- decoupling
# applications from the specific backend's implementation details
receivers:
  otlp:
    protocols:
      grpc:
processors:
  batch:
  tail_sampling:
    policies:
      - name: errors-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
exporters:
  jaeger:
    endpoint: jaeger-backend:14250
~~~

Deploying a centralized OpenTelemetry Collector (covered in the **OpenTelemetry** skill) as an intermediary between instrumented applications and the actual tracing storage backend is a common, mature production pattern, centralizing sampling logic and backend-specific export configuration.

### CI/CD pipeline considerations

Automated tests verifying trace context propagation across critical service boundaries (particularly newly-added asynchronous integrations) as part of CI, catching propagation gaps before they reach production. See the **CI/CD** and **OpenTelemetry** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production tracing setup is considered complete:

- [ ] Trace context propagation implemented and verified across every service boundary, including asynchronous ones (message queues, background jobs)
- [ ] Span boundaries chosen deliberately at meaningful operation boundaries, avoiding both excessive coarseness and granularity
- [ ] Standardized semantic conventions used for span names and attributes
- [ ] A deliberate sampling strategy configured, combining a low baseline rate with tail-based rules for errors/slow requests
- [ ] No sensitive data included in span attributes
- [ ] Traces linked to logs via shared trace/span IDs
- [ ] OpenTelemetry (or an equivalent standard) used for instrumentation rather than proprietary, vendor-locked tracing SDKs
- [ ] Tracing infrastructure's own overhead profiled and confirmed acceptable
- [ ] Access controls applied to the tracing backend, given its potential to reveal detailed internal system behavior
- [ ] AI-application-specific pipeline stages (retrieval, generation, tool calls) instrumented with meaningful spans where applicable
`,

  "common-mistakes": `
1. **Missing trace context propagation across asynchronous boundaries** (message queues, background jobs), silently breaking trace continuity.
2. **Excessive span granularity**, producing overwhelming, hard-to-navigate traces with real instrumentation overhead.
3. **Uniform, naive sampling with no tail-based rules**, risking missing exactly the errored/slow traces most valuable for debugging.
4. **Ad-hoc, inconsistent span/attribute naming**, undermining consistent cross-service interpretation.
5. **Not linking traces to logs**, missing the valuable ability to move between aggregate trace structure and detailed event context.
6. **Including sensitive data in span attributes**, a genuine security/compliance risk.
7. **Treating tracing as a substitute for metrics-based dashboards/alerting**, when it serves a genuinely distinct diagnostic purpose.
8. **Not testing context propagation explicitly**, discovering gaps only when debugging a real production issue.
9. **Ignoring tracing infrastructure's own overhead/cost**, failing to tune sampling as request volume scales.
10. **Not applying tracing to AI-specific pipeline stages** (retrieval, generation, tool calls) where multi-stage latency attribution is genuinely valuable.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| A trace has an unexplained time gap | Missing trace context propagation at that specific service boundary, often an asynchronous one | Audit and fix context propagation at the specific gap location |
| Can't find a trace for a known slow request | The request wasn't sampled (head-based sampling with a low rate) | Implement tail-based sampling to ensure slow/errored requests are always retained |
| Trace shows an unexpectedly deep or wide call tree | Genuine, previously-unknown system behavior (unexpected fan-out, retries) — often valuable diagnostic information itself | Investigate the revealed behavior directly; this may be the actual root cause, not an instrumentation bug |
| Span attributes missing expected data | The specific instrumentation point doesn't set the expected attribute | Verify and add the missing attribute at the correct instrumentation point |
| Tracing overhead noticeably affecting application performance | Excessive span granularity, or synchronous (blocking) span export | Reduce span granularity; switch to asynchronous, batched span export |
| Traces inconsistent in attribute naming across services | No shared semantic convention adopted organization-wide | Adopt OpenTelemetry's standard semantic conventions consistently |
| Tracing storage cost growing unsustainably | Sampling rate too high for the actual request volume/retention needs | Tune baseline sampling rate down, relying on tail-based rules for important traces |
`,

  faqs: `
**What is the difference between a span and a trace?**
A span is a single named, timed operation (an HTTP call, a database query); a trace is the complete tree of all spans belonging to one specific request, showing the full hierarchical, timed structure of everything that request triggered.

**Why can't I just fully trace every single request in production?**
Because capturing complete trace detail for every request at meaningful production scale is prohibitively expensive in both storage and instrumentation overhead — sampling (recording detailed traces for only a fraction of requests) is a genuine, necessary practice, typically combining a low baseline rate with tail-based rules ensuring errored/slow requests are always retained.

**What is trace context propagation, and why does it matter?**
Passing a trace's identifying information (trace ID, current span ID) across every service boundary a request crosses, so each service's spans can be correctly attached to the same overall trace — without correct propagation, a service's operations become an invisible gap in the resulting trace rather than a properly nested, attributed span.

**What is the difference between head-based and tail-based sampling?**
Head-based sampling decides whether to fully trace a request at the very start (before knowing its outcome); tail-based sampling decides after the request completes, based on its actual outcome (always keeping errored or slow requests, for instance) — tail-based sampling is generally more valuable for debugging but requires more infrastructure to buffer complete trace data before the decision.

**How does tracing relate to logging and metrics?**
Tracing is the third of the three complementary observability pillars — logging provides detailed per-event context, metrics provide efficient aggregate numerical signals, and tracing provides the detailed, hierarchical timing breakdown of a SPECIFIC request's journey across services — modern practice increasingly links all three via shared trace/span IDs (standardized through OpenTelemetry).

**How is tracing specifically relevant to AI applications?**
AI applications frequently chain together multiple distinct stages (a vector database lookup, an LLM API call, tool invocations in an agentic workflow), any of which could be the actual source of unexpected latency — tracing lets each stage become its own span, immediately revealing which specific stage of a complex AI pipeline is the real bottleneck, directly connecting to this platform's **Agent Observability** skill.
`,

  "interview-questions": `
### Junior level

1. **What is a span in distributed tracing?**
   Model answer: a single named, timed operation (like an HTTP call or a database query) with a start time, duration, and a parent-child relationship to other spans.

2. **What is a trace?**
   Model answer: the complete tree of all spans belonging to one specific request, representing that request's entire hierarchical, timed journey across however many services it touched.

3. **Why is distributed tracing needed in a microservices architecture specifically?**
   Model answer: once a single request routinely spans many independently-deployed services, understanding exactly where the total request time went requires following that specific request's identity across every service boundary — something neither per-service logs nor aggregate metrics can reconstruct reliably on their own.

4. **What is trace context propagation?**
   Model answer: passing a trace's identifying information (trace ID and current span ID) across every service boundary a request crosses, so each service's own spans can be correctly linked to the same overall trace.

5. **Why can't every single production request be fully traced?**
   Model answer: capturing complete trace detail for every request is prohibitively expensive in storage and instrumentation overhead at meaningful production scale, requiring deliberate sampling instead.

### Senior level

6. **Explain the difference between head-based and tail-based sampling, and why tail-based sampling is generally considered more valuable for debugging despite its added complexity.**
   Model answer: head-based sampling decides whether to trace a request at the very beginning, before its outcome is known, meaning the decision is essentially a coin flip unrelated to whether the request turns out to be interesting; tail-based sampling makes the keep/discard decision AFTER the request completes, based on its actual outcome (always retaining errors or unusually slow requests, for instance), making it far more likely to preserve exactly the traces an engineer would actually want when debugging a specific production issue — the tradeoff is that tail-based sampling requires buffering complete trace data for every request until the decision can be made, a genuinely more complex and resource-intensive infrastructure requirement than head-based sampling's simpler upfront random decision.

7. **Why is trace context propagation across asynchronous boundaries (message queues, background jobs) genuinely harder than across synchronous HTTP calls, and how would you solve it?**
   Model answer: synchronous HTTP calls have an obvious place to attach trace context (request headers), and many tracing libraries handle this automatically; asynchronous boundaries have no equivalent synchronous call to piggyback context on, since the message/job might be processed much later on an entirely different machine — the solution requires explicitly serializing the trace context into the message/job payload itself at publish time, and explicitly deserializing and restoring it as the current trace context when that message/job is eventually processed, a deliberate instrumentation step that's easy to overlook and represents one of the most common real-world trace-continuity gaps.

8. **How would you decide on appropriate span granularity for a new service being instrumented?**
   Model answer: choose span boundaries at meaningful, independently-understandable operation boundaries (a database query, an external API call, a significant internal processing stage) rather than either the entire request as one span (too coarse, providing little insight into where time actually went) or every trivial internal function call (too fine, producing an overwhelming, hard-to-navigate trace with real instrumentation overhead and no corresponding diagnostic benefit) — the guiding question is whether a specific operation is something an engineer debugging a slow request would genuinely want to see broken out as its own distinct, timed unit.

9. **Explain how you would use distributed tracing to diagnose an unexpectedly slow RAG (retrieval-augmented generation) pipeline request.**
   Model answer: instrument the pipeline with distinct spans for each major stage (a vector database search span, an LLM generation span, and any additional stages like re-ranking or post-processing), each carrying relevant attributes (query text, result count, model name, token count); examining a specific slow request's resulting trace waterfall immediately reveals which stage actually dominated the total time (commonly LLM generation, given typical latency characteristics, but genuinely worth verifying rather than assuming) — directly connecting to this platform's Agent Observability skill's deeper treatment of this exact debugging pattern.

10. **What are OpenTelemetry semantic conventions, and why do they matter for tracing specifically?**
    Model answer: standardized, agreed-upon names for common span attributes (db.system, http.method, and many others) defined by the OpenTelemetry specification — using these conventions consistently, rather than ad-hoc naming invented independently per service or team, ensures traces remain consistently interpretable across different tools, dashboards, and engineers, directly analogous to the value of consistent structured field naming covered in the **Logging** skill.

11. **How would you design a sampling strategy for a system where storage cost is a genuine concern but you also need reliable visibility into rare, intermittent production issues?**
    Model answer: combine a LOW baseline head-based sampling rate (e.g., 1 percent of all requests, providing general visibility into typical system behavior at manageable cost) with TAIL-BASED rules specifically ensuring any request that errored, or exceeded a defined latency threshold, is ALWAYS fully retained regardless of the baseline rate — this combination manages overall storage cost for the vast majority of "normal" traffic while still reliably capturing the specific, rare, diagnostically valuable traces (errors, slow outliers) that a purely low, uniform sampling rate might otherwise miss entirely.

12. **How does linking traces to logs via shared trace/span IDs improve the debugging workflow compared to using either signal alone?**
    Model answer: a trace's waterfall visualization immediately reveals WHICH specific span is the bottleneck or point of failure, but traces typically carry limited per-operation detail (a handful of attributes); by including that same span's trace ID and span ID directly within the structured logs emitted during that span's execution, an engineer can jump directly from "this span is slow/erroring" to "here are the exact detailed log lines describing what that specific operation was actually doing," combining tracing's structural, cross-service overview with logging's rich, detailed per-event context in a single, fluid investigative workflow rather than needing to manually cross-reference timestamps between two disconnected systems.
`,

  "coding-questions": `
### 1. Implement basic span creation with parent-child nesting

~~~python
from opentelemetry import trace

tracer = trace.get_tracer("order-service")

def process_order(order_id):
    with tracer.start_as_current_span("process_order") as parent_span:
        parent_span.set_attribute("order.id", order_id)
        validate_order(order_id)
        charge_payment(order_id)

def validate_order(order_id):
    with tracer.start_as_current_span("validate_order") as span:
        span.set_attribute("order.id", order_id)
        -- validation logic

def charge_payment(order_id):
    with tracer.start_as_current_span("charge_payment") as span:
        span.set_attribute("order.id", order_id)
        -- payment logic
# Follow-up: how does the OpenTelemetry SDK automatically know that
# validate_order's and charge_payment's spans should be CHILDREN of
# process_order's span, without any explicit parent_span_id being
# passed as a function argument?
~~~

### 2. Implement trace context propagation across a message queue boundary

~~~python
from opentelemetry import trace
from opentelemetry.propagate import inject, extract

def publish_job(job_data):
    carrier = {}
    inject(carrier)   -- serializes the CURRENT trace context into carrier
    queue.publish({"data": job_data, "trace_context": carrier})

def process_job(message):
    context = extract(message["trace_context"])   -- restores trace context
    tracer = trace.get_tracer("worker-service")
    with tracer.start_as_current_span("process_job", context=context):
        handle(message["data"])
# Follow-up: why must inject() be called at PUBLISH time (capturing
# the context as it existed then) rather than at process time, and
# what would go wrong if the worker instead tried to generate a
# brand new trace context itself rather than extracting the one
# propagated through the message?
~~~

### 3. Implement a simple tail-based sampling decision function

~~~python
def should_retain_trace(trace_data, baseline_sample_rate=0.01):
    -- ALWAYS retain traces containing an error or exceeding
    -- a latency threshold, regardless of baseline sampling
    if trace_data.has_error or trace_data.total_duration_ms > 1000:
        return True
    -- otherwise, apply the baseline random sampling rate
    import random
    return random.random() < baseline_sample_rate
# Follow-up: why does this function need access to the trace's
# COMPLETE data (including its final outcome and total duration)
# before making a decision, and what infrastructure implication
# does this have compared to a head-based sampling decision that
# could be made the instant a request begins?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Instrument a simple service with basic spans
Build a small multi-function application, instrumenting each significant function with a span, verifying the resulting trace correctly shows parent-child relationships and reasonable durations. Deliverable: a working instrumented application with a visualized trace. Skills exercised: basic span instrumentation.

### Lab 2 (Intermediate): Implement and verify trace context propagation across simulated services
Build a simulation of three separate services (as separate functions or processes) communicating via HTTP or a simulated message queue, verifying via trace inspection that a single request's spans across all three services share the same trace ID. Deliverable: a working cross-service propagation demonstration with a test verifying trace continuity. Skills exercised: context propagation, especially across asynchronous boundaries.

### Lab 3 (Advanced): Set up a local Jaeger tracing backend and analyze a real trace
Using Docker Compose, set up a local Jaeger instance, instrument a small application with OpenTelemetry, and use Jaeger's UI to identify a deliberately-introduced latency bottleneck in a multi-span trace. Deliverable: a screenshot/description of the identified bottleneck via the Jaeger waterfall view. Skills exercised: tracing backend setup, trace analysis.

### Lab 4 (Production): Instrument and trace a simulated RAG pipeline
Build a simulated RAG pipeline (a vector search stage and an LLM generation stage, both simulated with appropriate delays), instrument both stages with distinct, attribute-rich spans, and use the resulting trace to correctly identify which stage dominates total latency. Deliverable: a working instrumented RAG pipeline simulation with trace-based bottleneck identification. Skills exercised: AI-pipeline-specific tracing instrumentation.
`,

  "real-projects": `
### 1. A distributed tracing rollout across an organization's microservices
Engineering requirements: OpenTelemetry-based instrumentation adopted consistently across every service, with standardized semantic conventions, correct context propagation verified across all service boundaries (including message queues), and a deliberate tail-based sampling strategy balancing cost against diagnostic value.

### 2. A latency debugging toolkit for an AI application's RAG/agentic pipeline
Engineering requirements: distinct, attribute-rich spans for each major pipeline stage (retrieval, generation, tool calls), enabling engineers to quickly identify which specific stage of a slow AI request actually dominated its latency, directly connecting to this platform's **Agent Observability** skill.

### 3. A trace-to-log correlation system for faster incident investigation
Engineering requirements: consistent inclusion of trace and span IDs within structured application logs, enabling engineers to move fluidly between a trace's high-level structural view (identifying the bottleneck span) and that span's detailed log context (understanding exactly what happened during it) within one coherent investigative workflow.
`,

  "case-studies": `
### Google's Dapper paper as the foundational blueprint for an entire field
Google's 2010 Dapper paper, describing their internal production distributed tracing system, directly shaped the design of virtually every subsequent tracing tool (Zipkin, Jaeger, and eventually OpenTelemetry's tracing component) — its specific concepts (spans, trace IDs, sampling) remain the standard vocabulary and architecture for distributed tracing more than a decade and a half later. Lesson: a single, well-designed foundational paper solving a genuinely hard, previously-unaddressed problem at real production scale can shape an entire subsequent field's standard architecture for a remarkably long time, a pattern also seen with Dijkstra's shortest-path algorithm and other foundational computer science results.

### The convergence of OpenTracing and OpenCensus into OpenTelemetry
The 2019 merger of two previously-competing standardization efforts (OpenTracing, focused specifically on tracing instrumentation APIs, and OpenCensus, Google's own combined tracing/metrics instrumentation project) into the unified OpenTelemetry project directly reflects the industry's growing recognition that fragmentation across competing, incompatible standards imposed a genuine, unnecessary cost on the ecosystem — competing standards addressing overlapping needs ultimately served users worse than one unified, broadly-adopted standard would. Lesson: standardization efforts that fragment into competing alternatives addressing genuinely overlapping needs often eventually converge, once the ecosystem-wide cost of that fragmentation becomes sufficiently apparent to the parties involved.

### Tracing's growing application to AI agent and RAG pipeline debugging
The recent, rapid growth of tracing specifically applied to AI application debugging (LangSmith, Langfuse, and similar tools, covered in their own skills, applying distributed tracing concepts directly to LLM call chains and agentic tool-calling sequences) illustrates how a general-purpose observability technique, originally developed for conventional microservices debugging, can be productively and rapidly adapted to an entirely new application domain (AI/LLM applications) once that domain's own debugging needs (understanding a multi-step reasoning chain's latency and behavior) turn out to match the original technique's core structural assumptions closely. Lesson: recognizing that a genuinely novel-seeming domain's underlying problem shape actually matches an existing, well-understood technique's assumptions can save significant reinvention effort — AI pipeline debugging didn't need a fundamentally new observability paradigm, just the deliberate application of distributed tracing's existing concepts to a new context.
`,

  comparisons: `
| Aspect | Logging | Metrics | Tracing |
|--------|---------|---------|---------|
| Captures | Per-event, detailed text/structured data | Pre-aggregated numerical signals | Per-request, hierarchical timing data |
| Typical retention | Days to weeks (tiered by level) | Long-term (compact, pre-aggregated) | Short, given sampling (often days) |
| Answers | "What exactly happened during this event?" | "How is the system performing in aggregate?" | "For THIS request, where did the time go across services?" |
| Cost driver | Event volume | Cardinality (unique label combinations) | Sampled request volume and retained detail |

**How seniors choose**: use tracing specifically when you need to understand a SPECIFIC request's cross-service timing and causal structure — a need neither logging (lacking inherent cross-service correlation without manual correlation IDs) nor metrics (lacking any per-request detail at all) can address as directly; combine all three pillars, increasingly unified via OpenTelemetry, rather than treating any one as sufficient alone.
`,

  "related-technologies": `
- **Logging** and **Metrics** — the two complementary observability pillars covered alongside this skill, together forming the complete "three pillars of observability."
- **OpenTelemetry** — the vendor-neutral standard unifying tracing instrumentation with logging and metrics, covered in its own skill.
- **Jaeger** and **Zipkin** — the dominant open-source distributed tracing backends.
- **LangSmith** and **Langfuse** — AI-specific observability platforms applying tracing concepts directly to LLM call chains and agentic workflows, covered in their own skills.
- **Agent Observability** — the AI-specific application of tracing (and logging) to debugging AI agent reasoning and tool-calling behavior.

Learning path: **Logging** → **Metrics** → this page, completing the three pillars of observability → **OpenTelemetry** for the unifying standard → **LangSmith**/**Langfuse**/**Agent Observability** for AI-specific application.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- OpenTelemetry's tracing component continues to be the dominant, standard instrumentation approach, with growing adoption of tail-based sampling as standard production practice.
- Continued rapid growth of tracing applications specifically for AI/LLM applications (RAG pipelines, agentic tool-calling chains), with dedicated AI observability platforms (LangSmith, Langfuse) building directly on distributed tracing concepts.
- Growing integration between tracing and logging/metrics via exemplars and shared trace/span IDs, continuing the broader three-pillars unification trend.
- Given the pace of change in AI-specific observability tooling particularly, verify current platform capabilities and best-practice recommendations against current documentation.
`,

  "future-roadmap": `
Where distributed tracing is heading, and what's worth betting career time on:

- **Continued dominance of OpenTelemetry** as the standard, vendor-neutral tracing instrumentation approach across the industry.
- **Continued rapid growth of AI-specific tracing applications**, likely becoming as standard for AI application debugging as conventional distributed tracing is for microservices debugging today.
- **Growing sophistication in tail-based sampling and cost-aware trace retention**, as tracing infrastructure cost at genuine production scale remains an ongoing consideration.
- **What to bet on**: deeply understanding spans, trace context propagation (especially across genuinely tricky asynchronous boundaries), and sampling strategy tradeoffs — these transfer directly across any specific tracing tool or vendor's platform, and directly apply to the growing, AI-specific tracing applications this platform's broader content increasingly involves.
`,

  "cheat-sheet": `
~~~python
# ---- Spans: the fundamental unit ----
with tracer.start_as_current_span("charge_payment") as span:
    span.set_attribute("order.id", order_id)   # attributes = context
    with tracer.start_as_current_span("call_stripe_api"):
        call_stripe()   # nested = a CHILD span, automatically
~~~

~~~
# ---- Trace = the complete tree of spans for ONE request ----
|-- HTTP GET /checkout --------------------| 200ms
    |-- authenticate --| 20ms
                         |-- check_inventory --| 50ms
                                                 |-- charge_payment ---| 120ms
                                                     |-- Stripe API --| 110ms   <- the ACTUAL bottleneck

# ---- Waterfall view reveals bottlenecks instantly ----
# No manual timestamp cross-referencing across separate log files needed.
~~~

~~~python
# ---- Context propagation: the mechanism that links spans across services ----
# Synchronous HTTP: often automatic (traceparent header)
inject(carrier)   # at publish time -- serialize CURRENT trace context

# Asynchronous boundaries (queues, jobs): NOT automatic -- a common, easy-to-miss gap
extract(message["trace_context"])   # at process time -- restore it
~~~

~~~
# ---- Sampling: can't trace 100% of requests at scale ----
Head-based:  decide at request START (simple, may miss interesting traces)
Tail-based:  decide AFTER completion (always keep errors/slow requests)
# Best practice: low baseline rate (~1%) + tail-based rules for errors/slow requests

# ---- Span granularity ----
Too coarse (whole request as 1 span) -> no insight into WHERE time went
Too fine (every trivial call) -> overwhelming, high overhead, no real benefit
Right: meaningful operation boundaries (DB query, API call, processing stage)

# ---- Link traces to logs ----
# Include trace_id + span_id in structured log entries
# -> jump from "this span is slow" directly to its detailed logs

# ---- AI-specific application ----
# Span per RAG/agent pipeline stage (vector_search, llm_generation, tool_call)
# Immediately reveals which stage is the ACTUAL latency bottleneck
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Span vs trace? | Span: one named, timed operation. Trace: the FULL tree of spans for one request. |
| Why does tracing matter in microservices? | Answers "for THIS request, where did the time go across services" -- logs/metrics can't. |
| What is trace context propagation? | Passing trace_id + span_id across every service boundary so spans link to one trace. |
| Biggest, easiest-to-miss propagation gap? | Asynchronous boundaries (queues, background jobs) -- not automatic like HTTP headers. |
| Head-based vs tail-based sampling? | Head: decide at request start. Tail: decide after completion, based on outcome. |
| Why is tail-based sampling more valuable? | Always retains errors/slow requests -- exactly what's needed for debugging. |
| Right span granularity? | Meaningful operation boundaries (DB query, API call) -- not the whole request, not every function. |
| Why link traces to logs? | Jump from "this span is the bottleneck" directly to its detailed log context. |
| Foundational tracing paper? | Google's Dapper (2010) -- directly inspired Zipkin, Jaeger, and OpenTelemetry. |
| Never put what in span attributes? | Sensitive data -- same discipline as logging. |
| AI-specific tracing use case? | Span per RAG/agent stage -- reveals which stage (retrieval vs generation) is the real bottleneck. |
| Tracing's unique limitation vs logging/metrics? | Sampled, not complete -- can't fully trace every request at production scale. |
`,

  mcqs: `
1. What is the fundamental unit of distributed tracing?
   A) A log line  B) A span -- a single named, timed operation with parent-child relationships  C) A metric counter  D) A database row
   **Answer: B** — a trace is the complete tree of all spans belonging to one request.

2. Why is trace context propagation across asynchronous boundaries (message queues) genuinely harder than across synchronous HTTP calls?
   A) It isn't harder at all  B) There's no synchronous call to attach headers to, requiring explicit serialization into the message payload instead  C) Message queues don't support any metadata  D) Asynchronous code can't be traced
   **Answer: B** — this is one of the most common, easily-overlooked tracing gaps in production systems.

3. What is the key advantage of tail-based sampling over head-based sampling?
   A) It's simpler to implement  B) It makes the keep/discard decision after knowing the request's actual outcome, reliably retaining errors and slow requests  C) It requires no infrastructure  D) It traces 100% of requests
   **Answer: B** — at the cost of needing to buffer complete trace data before the decision.

4. Why is excessive span granularity (a span for every trivial function call) considered an anti-pattern?
   A) It makes traces too short  B) It produces an overwhelming, hard-to-navigate trace with real instrumentation overhead and no corresponding diagnostic benefit  C) It's not actually possible  D) It improves performance
   **Answer: B** — span boundaries should align with meaningful, independently-understandable operations.

5. Why can't every single production request typically be fully traced at meaningful scale?
   A) Tracing is illegal at scale  B) Capturing complete trace detail for every request is prohibitively expensive in storage and instrumentation overhead, requiring sampling  C) Traces can only be created once per day  D) There is no reason -- it should always be done
   **Answer: B** — sampling (often combining head-based and tail-based strategies) is a necessary, standard practice.

6. How does tracing specifically help debug a slow AI RAG pipeline request?
   A) It replaces the need for an LLM  B) Instrumenting each pipeline stage (retrieval, generation) as a distinct span immediately reveals which stage actually dominates total latency  C) It only works for non-AI applications  D) It automatically fixes slow LLM calls
   **Answer: B** — directly connecting to this platform's Agent Observability skill.
`,

  "revision-notes": `
Distributed tracing is the third of the three observability pillars (alongside **Logging** and **Metrics**), answering a question neither of the other two can address well: for a SPECIFIC request, exactly where across many interacting microservices did its total time actually go. The fundamental unit is the SPAN — a single named, timed operation (an HTTP call, a database query, an LLM API request) with a start time, duration, and a parent-child relationship to other spans; a TRACE is the complete tree of all spans belonging to one request, visualized typically as a "waterfall" showing exactly which operation, nested within which other operation, consumed how much time.

Google's 2010 DAPPER PAPER is the foundational, most influential source shaping virtually every subsequent distributed tracing system (Zipkin, Jaeger, and eventually OpenTelemetry) — its core concepts (spans linked by a shared trace ID, propagated across service boundaries) remain the standard architecture more than fifteen years later. TRACE CONTEXT PROPAGATION — passing the trace ID and current span ID across every service boundary a request crosses — is what STRUCTURALLY guarantees correct cross-service correlation; a service that fails to correctly forward this context creates an invisible GAP in the resulting trace, a genuinely common, easily-overlooked production issue, particularly at ASYNCHRONOUS boundaries (message queues, background jobs) where there's no synchronous call to attach headers to, requiring explicit serialization of trace context into the message/job payload itself.

Because capturing complete trace detail for every single request is prohibitively expensive at meaningful production scale, SAMPLING is a necessary, standard practice. HEAD-BASED sampling decides whether to trace a request at the very start, before its outcome is known (simple, but might miss exactly the interesting traces); TAIL-BASED sampling decides after the request completes, based on its actual outcome (always retaining errors or unusually slow requests specifically) — generally more valuable for debugging, at the cost of needing to buffer complete trace data until the decision can be made. Production systems commonly combine a LOW baseline head-based rate with TAIL-BASED rules ensuring genuinely important traces are always retained regardless of the baseline.

Choosing appropriate SPAN GRANULARITY is a genuine design judgment: too coarse (a single span for the entire request) provides little insight into where time actually went; too fine (a span for every trivial function call) produces an overwhelming, hard-to-navigate trace with real instrumentation overhead and no corresponding benefit — the right granularity aligns spans with meaningful, independently-understandable operation boundaries (a database query, an external API call, a significant processing stage). OpenTelemetry's standardized SEMANTIC CONVENTIONS (consistent attribute names like db.system, http.method) ensure traces remain consistently interpretable across different tools, teams, and services, directly analogous to the **Logging** skill's own emphasis on consistent structured field naming.

Modern observability practice increasingly LINKS TRACES TO LOGS via shared trace/span IDs included directly within structured log entries, letting an engineer jump directly from "this specific span is the bottleneck" (identified via the trace's waterfall view) to "here are the exact detailed log lines describing what that operation was actually doing" — combining tracing's structural cross-service overview with logging's rich per-event detail in one coherent investigative workflow, rather than manually cross-referencing timestamps between disconnected systems.

Tracing has a genuinely growing, directly AI-relevant application: instrumenting each stage of a RAG pipeline or agentic tool-calling sequence (a vector search span, an LLM generation span, individual tool-call spans) as distinct, attribute-rich spans immediately reveals which specific stage of a complex, multi-step AI request actually dominates total latency — a debugging pattern directly underlying this platform's **Agent Observability** skill and the AI-specific observability platforms (LangSmith, Langfuse) built on these same underlying distributed tracing concepts. A senior engineer ensures trace context propagation is correctly verified across EVERY service boundary (with specific, deliberate attention to asynchronous ones), designs sampling strategy deliberately rather than accepting a naive uniform rate, and recognizes tracing's genuinely complementary — not substitutable — relationship to logging and metrics, with all three increasingly unified under the OpenTelemetry standard.
`,

  "learning-roadmap": `
**Week 1 — Span and trace fundamentals**: understanding spans, trace trees, and reading waterfall visualizations. Milestone: instrument a small multi-function application producing a correctly-structured trace (Lab 1).

**Week 2 — Trace context propagation**: propagating trace context across synchronous service calls, and understanding the asynchronous-boundary challenge. Milestone: build and verify cross-service trace context propagation, including a simulated asynchronous boundary (Lab 2).

**Week 3 — Tracing backend setup and analysis**: setting up a local Jaeger instance and using it to identify a real latency bottleneck. Milestone: complete Lab 3, identifying a deliberately-introduced bottleneck via Jaeger's waterfall view.

**Week 4 — Sampling strategy design**: head-based versus tail-based sampling, and designing a production-appropriate combined strategy. Milestone: implement a tail-based sampling decision function correctly retaining errors/slow requests.

**Week 5 — Span granularity and semantic conventions**: designing appropriate span boundaries and adopting standardized attribute naming. Milestone: refactor an over-instrumented (excessive granularity) trace into an appropriately-granular one.

**Week 6 — AI-specific application and cross-pillar integration**: instrumenting a simulated RAG pipeline, and linking traces to logs via shared IDs. Milestone: complete Lab 4, correctly identifying the bottleneck stage in a simulated RAG pipeline's trace.

Next platform skill once this roadmap is complete: **Prometheus** and **Grafana** for concrete metrics tooling, or **OpenTelemetry** for the unifying standard across all three observability pillars.
`,

  "official-docs": `
- **OpenTelemetry's official tracing specification** (opentelemetry.io/docs/concepts/signals/traces) — the authoritative, current standard for tracing concepts and instrumentation.
- **The W3C Trace Context specification** — the standardized HTTP header format (traceparent) for trace context propagation across services.
- **Jaeger's official documentation** (jaegertracing.io/docs) — a practical reference for a widely-used open-source tracing backend.
`,

  books: `
- **"Distributed Systems Observability" — Cindy Sridharan** — a widely-recommended, freely-available deep dive into all three observability pillars, including tracing's specific role and design considerations.
- **"Mastering Distributed Tracing" — Yuri Shkuro** (written by Jaeger's creator) — a comprehensive, practical guide to distributed tracing concepts and implementation.
- **"Observability Engineering" — Charity Majors, Liz Fong-Jones, George Miranda** — a modern, comprehensive treatment of tracing alongside logging and metrics.
`,

  blogs: `
- **Honeycomb's engineering blog** — extensive, influential writing on distributed tracing and its role in modern observability practice.
- **The Jaeger and OpenTelemetry project blogs** — practical guidance and updates directly from the maintainers of leading tracing tools.
- **Uber's and Google's own engineering blogs** on their respective tracing systems (Jaeger's origin, Dapper's continued internal evolution).
`,

  "research-papers": `
- **Sigelman, B. et al. — "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure"** (2010, Google technical report) — the foundational, most influential paper in distributed tracing's entire history.
- **Fonseca, R. et al. — "X-Trace: A Pervasive Network Tracing Framework"** (2007) — an earlier, related academic contribution to distributed request tracing.
- See the **Distributed Systems** skill's own research papers section for the broader theoretical context tracing operates within.
`,

  videos: `
- **Yuri Shkuro's talks on distributed tracing and Jaeger** — direct insight from the creator of one of the most widely-used open-source tracing backends.
- **OpenTelemetry project conference talks** (KubeCon, and similar) covering instrumentation best practices and ecosystem updates.
- **Honeycomb's and Charity Majors's talks on observability**, including tracing's specific role within the broader practice.
`,

  "github-repos": `
- **jaegertracing/jaeger** — the official Jaeger source repository, a widely-used open-source distributed tracing backend.
- **openzipkin/zipkin** — the official Zipkin source repository, another long-standing open-source tracing backend.
- **open-telemetry/opentelemetry-specification** — the official OpenTelemetry specification, covering the current standard for tracing instrumentation.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Span instrumentation basics**: instrument a small application with parent-child span relationships, verifying the resulting trace structure is correct.
2. **Context propagation**: implement and test trace context propagation across both a synchronous HTTP call and a simulated asynchronous message queue boundary.
3. **Bottleneck identification**: given a pre-recorded trace with multiple spans, correctly identify which span is the actual latency bottleneck.
4. **Sampling strategy design**: implement a combined head-based-plus-tail-based sampling function and test it against both normal and error/slow-request scenarios.
5. **AI pipeline tracing**: instrument a simulated multi-stage AI pipeline (retrieval, generation) and use the resulting trace to identify the dominant latency stage.
6. **External practice sets**: Jaeger's own official quickstart and example applications for structured, guided practice with a real tracing backend.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Services["Instrumented Services"]
        Gateway["API Gateway\n(root span)"]
        OrderSvc["Order Service"]
        PaymentSvc["Payment Service"]
    end
    subgraph Propagation["Context Propagation"]
        HTTPHeaders["HTTP Headers\n(traceparent)"]
        QueueMetadata["Queue Message Metadata\n(explicit serialization)"]
    end
    subgraph Backend["Tracing Backend"]
        Collector["OpenTelemetry Collector\n(batching, sampling)"]
        Storage["Jaeger/Zipkin Storage"]
        UI["Trace Search + Waterfall UI"]
    end
    subgraph CrossPillar["Cross-Pillar Integration"]
        Logs["Structured Logs\n(shared trace/span IDs)"]
    end
    Gateway -- HTTPHeaders --> OrderSvc
    OrderSvc -- QueueMetadata --> PaymentSvc
    Gateway --> Collector
    OrderSvc --> Collector
    PaymentSvc --> Collector
    Collector --> Storage
    Storage --> UI
    Storage -.linked via IDs.-> Logs
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Tracing))
    Foundations
      Overview
      History Dapper Jaeger Zipkin
      Why it exists
      Problem it solves
    Core Concepts
      Spans
      Traces as trees
      Parent child relationships
      Waterfall visualization
    Context Propagation
      Synchronous HTTP headers
      Asynchronous boundaries
      W3C trace context standard
    Sampling
      Head based
      Tail based
      Combined strategy
    Instrumentation Design
      Span granularity
      Semantic conventions
      Attributes
    Cross Pillar Integration
      Linking traces to logs
      Exemplars
      OpenTelemetry unification
    AI Application
      RAG pipeline stages
      Agent tool call chains
      Agent Observability connection
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default tracing;
