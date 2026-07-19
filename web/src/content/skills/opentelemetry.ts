import type { SkillContent } from "../types";

/**
 * OpenTelemetry — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const opentelemetry: SkillContent = {
  overview: `
OpenTelemetry (often abbreviated OTel) is a vendor-neutral, open-source observability framework providing standardized APIs, SDKs, and data formats for generating and collecting **Logging**, **Metrics**, and **Tracing** telemetry — the three pillars covered in their own skills — unifying what had historically been three separate, often incompatible instrumentation approaches into one coherent standard. OpenTelemetry directly completes this platform's Observability category: it's the modern, standard way applications are actually instrumented, with the resulting telemetry data then flowing into backends like **Prometheus** (metrics) and visualized via **Grafana** (or its own companion Loki/Tempo, together forming the LGTM stack).

For an AI engineer, OpenTelemetry is increasingly the expected instrumentation approach for any new service — rather than learning separate, vendor-specific instrumentation libraries for metrics, logs, and traces (and potentially needing to re-instrument an application if you switch observability vendors later), OpenTelemetry provides one consistent API whose underlying EXPORT destination can be swapped via configuration alone. This vendor neutrality is particularly valuable for AI applications, which frequently need to integrate with multiple, evolving observability platforms (LangSmith, Langfuse, and general-purpose tools) as an organization's AI tooling stack matures.

Key characteristics: **a unified API and SDK** across logging, metrics, and tracing, instrumented once regardless of which backend ultimately receives the data; **the OpenTelemetry Collector**, a standalone, deployable component that receives, processes (batches, samples, filters), and exports telemetry data to one or more backends, decoupling applications from backend-specific export logic; **semantic conventions**, standardized naming for common telemetry attributes (http.method, db.system) ensuring consistent interpretation across different instrumented services and tools; **auto-instrumentation**, automatically instrumenting common libraries/frameworks without requiring manual code changes in many cases; and **vendor neutrality**, letting an organization change observability backends (from a self-hosted stack to a commercial platform, or vice versa) by changing Collector export configuration, without needing to re-instrument application code.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2016 | The **OpenTracing** project launches, aiming to standardize a vendor-neutral tracing instrumentation API so applications wouldn't need backend-specific tracing SDKs |
| 2017–2018 | **OpenCensus**, Google's own combined tracing-and-metrics instrumentation project (evolved from earlier internal work), gains adoption alongside OpenTracing, resulting in two competing, overlapping standardization efforts |
| 2019 | **OpenTracing and OpenCensus formally merge** to form **OpenTelemetry**, explicitly recognizing that fragmentation across two competing standards addressing genuinely overlapping needs served the industry worse than one unified effort |
| 2021 | OpenTelemetry's **tracing and metrics APIs reach stable (GA) status**, marking genuine production-readiness after roughly two years of consolidation and refinement following the OpenTracing/OpenCensus merger |
| 2022–2023 | OpenTelemetry's **logging support matures toward stability**, completing the framework's coverage of all three observability pillars under one unified standard |
| 2023–2024 | **Auto-instrumentation** capabilities mature significantly across major languages, letting many common frameworks and libraries be automatically instrumented with minimal or no manual code changes |
| 2020s | OpenTelemetry becomes the **second-most active CNCF project by contributor count** (after Kubernetes itself), reflecting its rapid, broad industry adoption as the standard instrumentation approach across the observability ecosystem |

OpenTelemetry's history is a particularly clear, direct example of industry-wide convergence following recognized fragmentation — two separate, well-intentioned standardization efforts (OpenTracing, OpenCensus) explicitly merged once their overlapping scope and competing existence was recognized as a genuine cost to the broader ecosystem, a pattern less commonly seen this explicitly in software standardization efforts generally.
`,

  "why-it-exists": `
OpenTelemetry exists because, prior to its creation, instrumenting an application for observability meant choosing among several genuinely incompatible, vendor-specific SDKs — an application instrumented with one commercial APM vendor's proprietary tracing library couldn't easily switch to a different vendor without significant re-instrumentation work throughout the entire codebase, creating genuine vendor lock-in that served observability vendors' business interests more than it served the engineers actually trying to build reliable, observable systems.

The specific catalyst for OpenTelemetry's creation was the recognition that TWO separate, competing standardization efforts (OpenTracing, focused narrowly on tracing instrumentation APIs, and OpenCensus, Google's broader combined tracing-plus-metrics project) were BOTH trying to solve a genuinely overlapping problem — vendor-neutral instrumentation — but their continued separate existence meant library authors and application developers still faced a confusing choice between two incompatible "vendor-neutral" standards, undermining the very goal both projects were independently pursuing. Recognizing this, the two projects' maintainers made the deliberate decision to merge rather than continue competing, forming OpenTelemetry specifically to provide ONE genuinely unified standard rather than two competing "standard" options.

OpenTelemetry's core design insight — cleanly separating INSTRUMENTATION (how applications generate telemetry data) from EXPORT (where that data ultimately goes) — directly solves the vendor lock-in problem: an application instrumented once with OpenTelemetry's vendor-neutral API can send its telemetry to Prometheus, a commercial APM platform, or an entirely different backend later, simply by reconfiguring the OpenTelemetry Collector's export destination, with zero changes required to the application's own instrumentation code.
`,

  "problem-it-solves": `
OpenTelemetry solves the **"how do we instrument applications for logging, metrics, and tracing using ONE consistent, vendor-neutral standard, avoiding both the fragmentation of separate incompatible tools per signal type and the vendor lock-in of proprietary, backend-specific instrumentation SDKs"** problem.

Concretely, OpenTelemetry provides:

- **A single, unified instrumentation API** across all three observability pillars, letting engineers learn and apply one consistent approach rather than three separate, backend-specific instrumentation libraries.
- **Vendor neutrality via the separation of instrumentation from export**: applications are instrumented once, with the actual destination (Prometheus, a commercial platform, a self-hosted LGTM stack) configured separately at the Collector level, letting backends be changed without re-instrumenting application code.
- **The OpenTelemetry Collector**, a dedicated component handling telemetry processing (batching, sampling, filtering, format translation) centrally, decoupling this processing logic from individual application instances.
- **Standardized semantic conventions**, ensuring telemetry attributes (http.method, db.system, and many others) are named consistently across different services, teams, and even different organizations using OpenTelemetry, enabling genuinely portable dashboards, queries, and tooling.
- **Auto-instrumentation** for many common frameworks and libraries, letting engineers get meaningful baseline telemetry (HTTP request tracing, database query timing) with minimal or no manual instrumentation code.

What OpenTelemetry does **not** solve, or solves with a real tradeoff: OpenTelemetry itself doesn't STORE or VISUALIZE telemetry data — it's an instrumentation and collection standard, requiring an actual backend (Prometheus, Grafana's LGTM stack, or a commercial platform) to store and analyze the resulting data; adopting OpenTelemetry across a large, existing codebase with prior vendor-specific instrumentation represents genuine migration effort, not an instant, free upgrade; and while OpenTelemetry's API is stable, the SPECIFIC feature maturity (particularly for logging, historically the last pillar to reach full stability) can vary somewhat across different language SDKs, requiring verification of current status for a specific language/signal combination.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain OpenTelemetry's architecture: the API/SDK layer, the Collector, and exporters.
2. Instrument an application with OpenTelemetry for traces, metrics, and logs using its unified API.
3. Configure the OpenTelemetry Collector for receiving, processing, and exporting telemetry data.
4. Apply OpenTelemetry's semantic conventions consistently across instrumentation.
5. Use auto-instrumentation to gain baseline telemetry with minimal manual code changes.
6. Understand OpenTelemetry's role in enabling vendor neutrality and avoiding observability vendor lock-in.
7. Recognize and avoid common OpenTelemetry anti-patterns: inconsistent semantic convention usage, and Collector misconfiguration.
8. Design a migration strategy from vendor-specific instrumentation to OpenTelemetry for an existing codebase.
9. Answer senior-level interview questions on OpenTelemetry's architecture, the Collector's role, and vendor-neutral instrumentation strategy.
`,

  prerequisites: `
- **Required**: the **Logging**, **Metrics**, and **Tracing** skills (all covered alongside this one) — OpenTelemetry is the unifying instrumentation standard across exactly these three pillars, and doesn't make sense without that foundation.
- **Very helpful**: the **Prometheus** and **Grafana** skills for understanding common backend destinations OpenTelemetry data typically flows into.

Dependency links: **Logging** → **Metrics** → **Tracing** → **Prometheus** → **Grafana** → this page, the natural completion of the Observability category, unifying every prior skill's concepts under one standard.
`,

  "beginner-concepts": `
### OpenTelemetry's layered architecture

~~~
Application code
    -> OpenTelemetry API (vendor-neutral instrumentation calls)
        -> OpenTelemetry SDK (implements the API, handles
             batching, sampling configuration)
            -> Exporter (sends data to a specific backend,
                 e.g., OTLP, Prometheus, Jaeger)
                -> (optionally) OpenTelemetry Collector
                    -> Final backend (Prometheus, Grafana
                         Tempo, a commercial platform)
~~~

This layering is precisely what enables vendor neutrality: application code only ever calls the stable, vendor-neutral API; SWAPPING the exporter (or reconfiguring the Collector) changes where data ultimately goes, without touching the instrumented application code at all.

### Basic trace instrumentation

~~~python
from opentelemetry import trace

tracer = trace.get_tracer("my-service")

def handle_request():
    with tracer.start_as_current_span("handle_request") as span:
        span.set_attribute("http.method", "GET")
        -- process the request
        return "result"
~~~

### Basic metric instrumentation

~~~python
from opentelemetry import metrics

meter = metrics.get_meter("my-service")
request_counter = meter.create_counter("http.server.requests", description="Total requests")

def handle_request():
    request_counter.add(1, {"http.method": "GET", "http.status_code": 200})
~~~

### Basic log instrumentation

~~~python
import logging
from opentelemetry._logs import set_logger_provider
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler

set_logger_provider(LoggerProvider())
handler = LoggingHandler()
logging.getLogger().addHandler(handler)

logging.info("Request processed successfully")
~~~

Notice the SAME general pattern (a tracer, a meter, a logging handler, all obtained from OpenTelemetry's API) applies consistently across all three signal types — one consistent mental model rather than three completely different instrumentation approaches.
`,

  "intermediate-concepts": `
### The OpenTelemetry Collector

~~~yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  batch:
exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  otlp/tempo:
    endpoint: "tempo:4317"
service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/tempo]
~~~

The Collector receives telemetry from instrumented applications (via the OTLP protocol, OpenTelemetry's own standard wire format), processes it (batching here, though sampling, filtering, and attribute manipulation are also common), and exports it to one or more actual backends — centralizing this processing/routing logic OUTSIDE individual application instances.

### Auto-instrumentation

~~~bash
# Many languages support automatic instrumentation of common
# frameworks (web frameworks, database clients, HTTP clients)
# WITHOUT manual code changes, via a Python example:
opentelemetry-instrument python my_app.py
~~~

Auto-instrumentation automatically wraps common library calls (an HTTP request, a database query) with appropriate spans/metrics, providing meaningful baseline telemetry immediately, with manual instrumentation reserved for genuinely custom, application-specific logic beyond what auto-instrumentation covers.

### Semantic conventions in practice

~~~python
# Using OpenTelemetry's standardized semantic convention names,
# rather than inventing ad-hoc attribute names per service
span.set_attribute("http.method", "GET")           -- standard convention
span.set_attribute("http.status_code", 200)          -- standard convention
span.set_attribute("db.system", "postgresql")          -- standard convention
span.set_attribute("db.statement", "SELECT * FROM users")
~~~

Consistently using OpenTelemetry's documented semantic conventions (rather than each team inventing its own attribute names) ensures telemetry remains interpretable by generic tools and dashboards built against the standard naming, directly connecting to the **Tracing** and **Metrics** skills' own emphasis on consistent field naming.

### Context propagation via OpenTelemetry

~~~python
from opentelemetry.propagate import inject, extract

def make_downstream_call():
    headers = {}
    inject(headers)   -- automatically adds the W3C traceparent header
    requests.get("http://downstream-service/api", headers=headers)
~~~

OpenTelemetry standardizes trace context propagation using the W3C Trace Context specification, ensuring interoperability even between services instrumented by DIFFERENT teams or using different specific OpenTelemetry language SDKs — a genuinely important standardization benefit for organizations with polyglot microservices.

### Resource attributes: identifying the source of telemetry

~~~python
from opentelemetry.sdk.resources import Resource

resource = Resource.create({
    "service.name": "order-service",
    "service.version": "1.4.2",
    "deployment.environment": "production",
})
~~~

Resource attributes describe WHERE telemetry originated (which service, version, environment, host) consistently across all three signal types, letting a backend correlate metrics, logs, and traces from the SAME source even without explicit trace/span IDs linking every individual signal.
`,

  "advanced-concepts": `
### The Collector's processing pipeline in depth

~~~
Receivers: accept telemetry data (OTLP, Jaeger, Zipkin, Prometheus
    remote-write, and many other formats)
Processors: transform data in-flight -- batching (grouping data
    for efficient export), sampling (tail-based sampling,
    covered in the Tracing skill, is commonly implemented HERE),
    attribute filtering/redaction (removing sensitive data before
    export), and resource detection (automatically enriching
    telemetry with Kubernetes/cloud metadata)
Exporters: send processed data to one or more final backends,
    potentially different backends for different signal types
    simultaneously (metrics to Prometheus, traces to Tempo)
~~~

The Collector's receiver-processor-exporter pipeline architecture is genuinely flexible — a single Collector deployment can ingest telemetry in multiple different formats, apply sophisticated processing (including tail-based sampling, requiring the Collector to buffer complete traces before deciding what to export), and route different signal types to entirely different backend destinations, all via configuration rather than application code changes.

### Collector deployment topologies: agent versus gateway

~~~mermaid
flowchart LR
    subgraph AgentPattern["Agent (sidecar/daemonset) pattern"]
        App1["App"] --> AgentCollector["Collector\n(local agent)"]
    end
    subgraph GatewayPattern["Gateway (centralized) pattern"]
        App2["App"] --> GatewayCollector["Centralized\nCollector gateway"]
    end
~~~

Organizations commonly deploy Collectors in BOTH roles: a lightweight agent (running as a sidecar or Kubernetes DaemonSet) close to each application instance for local batching/initial processing, forwarding to a centralized gateway Collector that performs more sophisticated processing (tail-based sampling requiring cross-instance visibility) and handles the actual export to backend systems.

### Migrating from vendor-specific instrumentation to OpenTelemetry

~~~
A common, pragmatic migration strategy:
├── Start with NEW services instrumented directly with
│    OpenTelemetry from day one
├── For EXISTING, vendor-instrumented services, use available
│    bridges/shims (many observability vendors provide an
│    OpenTelemetry-compatible export path even for their own
│    proprietary SDKs) as an interim step
└── Gradually re-instrument existing services with native
     OpenTelemetry instrumentation as engineering capacity allows,
     rather than requiring an all-at-once, risky big-bang migration
~~~

A senior engineer plans OpenTelemetry adoption incrementally, recognizing that a full, immediate re-instrumentation of a large existing codebase is rarely practical or necessary, given the availability of interim bridging approaches.

### OpenTelemetry for AI-specific instrumentation

~~~python
with tracer.start_as_current_span("llm_call") as span:
    span.set_attribute("gen_ai.system", "openai")
    span.set_attribute("gen_ai.request.model", "gpt-5")
    span.set_attribute("gen_ai.usage.prompt_tokens", 150)
    span.set_attribute("gen_ai.usage.completion_tokens", 320)
    response = call_llm(prompt)
~~~

OpenTelemetry has begun standardizing semantic conventions SPECIFICALLY for generative AI/LLM instrumentation (the gen_ai.* attribute namespace), directly relevant to this platform's broader AI engineering focus — applying the same vendor-neutral instrumentation discipline to AI-specific signals (token usage, model name, prompt/completion details) that's long been standard for conventional web service telemetry.

### The OTLP protocol as OpenTelemetry's own standard wire format

~~~
OTLP (OpenTelemetry Protocol) is OpenTelemetry's own defined
wire format for transmitting telemetry data between SDKs,
Collectors, and backends -- supporting gRPC and HTTP transport,
becoming increasingly the universal "lingua franca" many
observability backends natively accept, reducing the need
for format-translation logic that earlier, more fragmented
tooling required.
~~~
`,

  "internal-working": `
What happens internally as telemetry flows from an instrumented application through the Collector to a final backend, tracing the complete pipeline:

~~~mermaid
sequenceDiagram
    participant App as Instrumented application
    participant SDK as OpenTelemetry SDK
    participant Agent as Collector (agent, local)
    participant Gateway as Collector (gateway, centralized)
    participant Backend as Final backend (Prometheus/Tempo)

    App->>SDK: create span, record metric, emit log\n(via the OpenTelemetry API)
    SDK->>SDK: batch accumulated telemetry\n(configurable batch size/interval)
    SDK->>Agent: export via OTLP (gRPC/HTTP)
    Agent->>Agent: local processing (additional batching,\nresource attribute enrichment)
    Agent->>Gateway: forward via OTLP
    Gateway->>Gateway: centralized processing\n(tail-based sampling, filtering)
    Gateway->>Backend: export in the backend's\nnative expected format
~~~

1. **Application code calls the OpenTelemetry API**, which the SDK implementation actually handles — creating spans, recording metric observations, emitting structured logs, all through one consistent programming model.
2. **The SDK batches telemetry locally** before exporting, reducing the network overhead of sending every individual span/metric/log line as a separate network call.
3. **Data flows through one or more Collector instances** (commonly an agent close to the application, then a centralized gateway), each potentially applying additional processing (sampling, filtering, format translation) before the data reaches its final backend destination.

**Why this matters**: understanding this layered flow — application to SDK to (optionally) agent Collector to (optionally) gateway Collector to backend — explains precisely WHERE vendor-neutral flexibility actually lives: application code and the SDK layer remain completely vendor-neutral and unchanged regardless of the final backend, while the EXPORT configuration (which Collector, which final backend) can be changed entirely independently, without touching a single line of instrumented application code.
`,

  architecture: `
A senior engineer thinks about OpenTelemetry architecture across several dimensions: designing Collector deployment topology appropriate for the organization's scale, applying semantic conventions consistently to preserve interoperability, and planning incremental migration from any existing vendor-specific instrumentation.

### The Collector deployment topology decision framework

~~~mermaid
flowchart TB
    Q1{"What's your\norganization's scale\nand processing needs?"}
    Q1 -->|"Small, single-cluster,\nsimple export needs"| SingleCollector["A single, centralized\nCollector deployment\nmay be sufficient"]
    Q1 -->|"Large, multi-cluster,\nneeding tail-based\nsampling or complex routing"| AgentGateway["Agent-plus-gateway\ntopology: local agents\nforwarding to a\ncentralized gateway"]
~~~

This decision — matching Collector deployment complexity to genuine organizational scale and processing needs, rather than defaulting to either extreme — directly reflects the same judicious-application discipline covered throughout this platform's architecture-focused skills.

### Designing for vendor neutrality from the start

~~~mermaid
flowchart LR
    App["Application instrumented\nwith OpenTelemetry API"] --> Neutral["Vendor-NEUTRAL --\nnever touches backend-\nspecific SDK code"]
    Neutral --> Swappable["Backend can be swapped\nvia Collector config alone,\nzero application changes"]
~~~

A senior engineer designs new services with OpenTelemetry instrumentation from day one specifically to preserve this vendor-neutrality benefit — avoiding a future situation where switching observability vendors requires expensive, risky application-level re-instrumentation.

### Incremental migration planning for existing, vendor-instrumented codebases

~~~mermaid
flowchart LR
    NewServices["New services:\nOpenTelemetry-native\nfrom day one"] --> Coexist["Coexist with"]
    ExistingServices["Existing vendor-instrumented\nservices: bridge/shim\nOR gradual re-instrumentation"] --> Coexist
~~~

Rather than requiring a risky, all-at-once migration, a senior engineer plans incremental OpenTelemetry adoption — new services instrumented natively from the start, existing services migrated gradually via available bridges or as engineering capacity allows.
`,

  "data-flow": `
Tracing a complete request's telemetry (a trace, associated metrics, and correlated logs) from generation through the Collector to three different specialized backends:

~~~mermaid
sequenceDiagram
    participant App as Application (OpenTelemetry-instrumented)
    participant Collector as OpenTelemetry Collector
    participant Tempo as Tempo (traces)
    participant Mimir as Mimir/Prometheus (metrics)
    participant Loki as Loki (logs)

    App->>App: handle a request -- generates a span,\nincrements a counter, emits a log line,\nALL correlated via shared trace/span IDs\nand resource attributes
    App->>Collector: export all three signal types via OTLP
    Collector->>Collector: batch, process (sampling, filtering)
    par Route each signal type to its specialized backend
        Collector->>Tempo: export the trace data
        Collector->>Mimir: export the metric data
        Collector->>Loki: export the log data (with trace_id/span_id preserved)
    end
~~~

The critical detail: ONE application, instrumented ONCE with OpenTelemetry's unified API, produces all three telemetry signal types simultaneously, correlated via shared identifiers (trace ID, resource attributes) — and the Collector routes each signal type to its OWN specialized backend (traces to Tempo, metrics to Mimir, logs to Loki), directly implementing the LGTM stack's architecture (covered in the **Grafana** skill) while keeping the APPLICATION itself completely agnostic to which specific backends are ultimately receiving its telemetry.
`,

  "production-usage": `
### A production-style OpenTelemetry SDK initialization

~~~python
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

resource = Resource.create({"service.name": "order-service", "deployment.environment": "production"})

trace.set_tracer_provider(TracerProvider(resource=resource))
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="otel-collector:4317"))
)
~~~

### Non-negotiables for production OpenTelemetry adoption

1. **Instrument new services with OpenTelemetry from day one**, preserving vendor neutrality rather than accumulating future migration debt.
2. **Deploy the Collector as a dedicated component**, rather than having every application export directly to a final backend, centralizing processing/routing logic.
3. **Apply semantic conventions consistently** across every instrumented service.
4. **Set consistent resource attributes** (service.name, deployment.environment) identifying telemetry's source across all three signal types.
5. **Use auto-instrumentation for common frameworks** where available, reserving manual instrumentation for genuinely custom logic.

### Common production patterns

- **The LGTM stack** (covered in the **Grafana** skill) as a common backend destination, with OpenTelemetry as the standard instrumentation layer feeding it.
- **Agent-plus-gateway Collector topology** for organizations at genuine scale needing tail-based sampling or sophisticated routing.
- **Incremental migration** from vendor-specific instrumentation, using available bridges for existing services while new services adopt OpenTelemetry natively.
- **AI-specific instrumentation** using the emerging gen_ai.* semantic conventions for LLM call tracking (tokens, model, latency).
`,

  "industry-examples": `
- **The Cloud Native Computing Foundation (CNCF)**: OpenTelemetry is one of its most actively-developed projects, reflecting deep, broad industry investment and adoption.
- **Grafana Labs' LGTM stack**: commonly fed by OpenTelemetry-instrumented applications, directly connecting this skill to the **Grafana**, **Prometheus**, **Logging**, and **Tracing** skills covered throughout this category.
- **Every major commercial observability vendor** (Datadog, New Relic, Honeycomb, and many others): now supports OpenTelemetry as a first-class ingestion format, reflecting the industry's broad acceptance of OpenTelemetry as the standard instrumentation layer regardless of which specific backend a customer ultimately chooses.
- **LangSmith and Langfuse** (covered in their own skills): increasingly building on or interoperating with OpenTelemetry's emerging generative AI semantic conventions for LLM-specific observability.
- **Kubernetes' broader ecosystem**: OpenTelemetry auto-instrumentation is commonly deployed via a Kubernetes Operator, automatically injecting instrumentation into application pods with minimal manual configuration.
`,

  "best-practices": `
1. **Instrument new services with OpenTelemetry from day one**, preserving vendor neutrality rather than accumulating future migration debt.
2. **Deploy a dedicated OpenTelemetry Collector** rather than having applications export directly to final backends, centralizing processing and routing logic.
3. **Apply semantic conventions consistently** across every service, using OpenTelemetry's documented standard attribute names rather than inventing ad-hoc naming.
4. **Set consistent resource attributes** (service.name, service.version, deployment.environment) across all signal types from a given service.
5. **Use auto-instrumentation for common frameworks/libraries**, reserving manual instrumentation specifically for custom, application-specific logic.
6. **Plan incremental migration** from any existing vendor-specific instrumentation rather than attempting a risky, all-at-once re-instrumentation.
7. **Use the Collector's processing pipeline** (sampling, filtering, redaction) for cross-cutting concerns rather than duplicating this logic in every application.
8. **Choose an agent-plus-gateway Collector topology** for genuine organizational scale, a simpler single-Collector deployment for smaller setups.
9. **Apply the emerging AI-specific semantic conventions (gen_ai.*)** for LLM/agent instrumentation, staying aligned with the broader ecosystem's standardization direction.
10. **Verify current feature maturity** for your specific language SDK and signal type, since maturity has historically varied (particularly for logging) across the OpenTelemetry ecosystem's evolution.
`,

  "anti-patterns": `
### Instrumenting directly against a specific vendor's proprietary SDK

~~~python
# WRONG — instrumenting directly with a specific commercial
# vendor's proprietary tracing SDK, creating genuine vendor lock-in
from proprietary_vendor_sdk import start_span
with start_span("handle_request"):
    process()

# RIGHT — instrument against OpenTelemetry's vendor-neutral API,
# with the actual backend configured separately at the Collector level
from opentelemetry import trace
tracer = trace.get_tracer("my-service")
with tracer.start_as_current_span("handle_request"):
    process()
~~~

Instrumenting directly against a proprietary vendor SDK recreates exactly the vendor lock-in problem OpenTelemetry was created to solve — switching observability vendors later would require re-instrumenting the entire codebase.

### Inconsistent semantic convention usage across services

~~~python
# WRONG — different services inventing their own ad-hoc attribute
# names for the same underlying concept
# Service A:
span.set_attribute("httpMethod", "GET")
# Service B:
span.set_attribute("method", "GET")
# Service C:
span.set_attribute("http_verb", "GET")

# RIGHT — consistently using OpenTelemetry's standard semantic convention
span.set_attribute("http.method", "GET")   -- the SAME name, everywhere
~~~

Inconsistent attribute naming across services undermines cross-service dashboards, queries, and tooling that assume consistent, standard naming — exactly the interoperability benefit semantic conventions are meant to provide.

### Other production-grade anti-patterns

- **Having every application export directly to a final backend** rather than through a Collector, duplicating processing/routing logic and losing centralized control.
- **Not using tail-based sampling at the Collector level** when genuine, sophisticated sampling needs exist, relying only on simpler head-based sampling that might miss important traces.
- **Including sensitive data in telemetry attributes**, applying insufficient discipline compared to the **Logging** and **Tracing** skills' own emphasis on never logging sensitive data.
- **Attempting a risky, all-at-once migration** from existing vendor-specific instrumentation rather than an incremental, bridged approach.
- **Not verifying current feature maturity** for a specific language SDK/signal combination before depending on it in production, given historically variable maturity across the ecosystem.
`,

  performance: `
### Rule zero: OpenTelemetry's own instrumentation overhead must remain low relative to actual application work

Given OpenTelemetry increasingly instruments a huge share of production services, its own SDK efficiency has been a significant engineering focus throughout its development.

### The performance hierarchy (apply in order)

1. **Use the SDK's built-in batching** (BatchSpanProcessor, and equivalents for metrics/logs) rather than exporting every individual telemetry item synchronously.
2. **Apply appropriate sampling** at either the SDK or Collector level, managing overall telemetry volume and cost.
3. **Use auto-instrumentation judiciously**, since automatically instrumenting EVERY possible library call can produce excessive telemetry volume beyond what's genuinely useful.
4. **Deploy Collector agents close to applications** (as a sidecar or DaemonSet) to minimize network latency for the initial export hop.
5. **Profile OpenTelemetry's own overhead specifically** in genuinely high-throughput, latency-sensitive services.

### Micro-level facts worth knowing

- OpenTelemetry SDKs are designed with genuinely low per-operation overhead as a core project goal, but this overhead is not literally zero and should be verified for extremely high-throughput scenarios.
- The Collector's own resource usage scales with the volume of telemetry it processes — appropriately sizing and potentially horizontally scaling Collector deployments matters at genuine production scale.
- Batching configuration (batch size, flush interval) directly trades off between export efficiency (larger batches, less frequent flushing) and telemetry data latency (how quickly data becomes visible in the backend).
`,

  scalability: `
OpenTelemetry's scalability concern centers on both SDK-level efficiency within instrumented applications and Collector-level capacity for processing the aggregate telemetry volume across an entire organization.

### Why Collector topology matters at scale

~~~mermaid
flowchart LR
    ManyApps["Many application instances,\neach with their own SDK"] --> AgentCollectors["Local agent Collectors\n(distribute the initial\nprocessing load)"]
    AgentCollectors --> GatewayCollector["Centralized gateway\nCollector(s)\n(can be horizontally scaled)"]
~~~

As an organization's number of instrumented services and instances grows, a single, centralized Collector can become a genuine bottleneck — the agent-plus-gateway topology distributes initial processing load across many local agents, with the gateway layer itself horizontally scalable as needed.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A single Collector instance's processing capacity exceeded | Adopt an agent-plus-gateway topology, horizontally scaling the gateway layer |
| Excessive telemetry volume/cost at genuine production scale | Deliberate sampling strategy at the Collector level, particularly for traces |
| SDK-level instrumentation overhead in extremely high-throughput services | Profile specifically, tune batching configuration, consider more selective auto-instrumentation |
| Tail-based sampling requiring cross-instance trace visibility | A centralized gateway Collector specifically responsible for tail-based sampling decisions |
`,

  security: `
### Sensitive data in telemetry attributes

~~~
Applying the SAME discipline covered in the Logging and Tracing
skills, OpenTelemetry span/metric/log attributes should NEVER
include sensitive data (passwords, full payment details, API
keys) -- the Collector's processor pipeline can implement
attribute filtering/redaction as an additional safety net, but
this should complement, not replace, disciplined instrumentation
choices at the source.
~~~

### Essential OpenTelemetry security practices

1. **Never include sensitive data in telemetry attributes** at the instrumentation source, applying the same discipline as logging and tracing generally.
2. **Use Collector processors for attribute filtering/redaction** as an additional safety net, not a substitute for disciplined instrumentation.
3. **Secure the Collector's own network exposure**, since it's a genuine, sensitive infrastructure component handling potentially large volumes of operational data.
4. **Apply appropriate authentication for OTLP endpoints**, particularly for Collectors receiving telemetry across genuine network/trust boundaries.
5. **Be cautious with auto-instrumentation's default behavior**, verifying it doesn't inadvertently capture sensitive request/response body content.

See the **OWASP Top 10** and **Secrets Management** skills for the broader security context this connects to.
`,

  testing: `
### Testing OpenTelemetry instrumentation

~~~python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

def test_handle_request_creates_expected_span():
    exporter = InMemorySpanExporter()
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    handle_request()

    spans = exporter.get_finished_spans()
    assert len(spans) == 1
    assert spans[0].name == "handle_request"
    assert spans[0].attributes.get("http.method") == "GET"
~~~

### The senior testing doctrine

- Use an in-memory span/metric exporter for fast, isolated unit tests verifying instrumentation correctness without needing a real Collector/backend.
- Test that semantic convention attribute names are used consistently, catching ad-hoc naming deviations before they reach production.
- Test Collector configuration (via integration tests against a real, locally-running Collector) for genuinely important processing/routing logic.
- Test that sensitive data never appears in generated telemetry attributes.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check the Collector's own logs and metrics** first, verifying it's correctly receiving, processing, and exporting telemetry as expected.
2. **Use a local, simple Collector configuration with a debug/logging exporter** to inspect raw telemetry data directly, isolating whether an issue is in instrumentation or downstream processing/export.
3. **Verify resource attributes and semantic convention naming** if telemetry appears in the backend but seems inconsistent or hard to correlate across services.
4. **Check SDK-level batching/export configuration** if telemetry seems delayed or missing entirely.

### Debugging common OpenTelemetry-specific symptoms

- "Telemetry isn't appearing in the backend at all" — verify the Collector's receiver configuration matches the SDK's export endpoint, and check Collector logs for connection or processing errors.
- "Traces are missing spans from a specific service" — check that service's instrumentation and export configuration specifically, and verify trace context propagation across the relevant service boundary.
- "Telemetry from different services is hard to correlate" — verify consistent resource attributes (service.name, and similar) and semantic convention usage across the involved services.
- "Auto-instrumentation isn't capturing an expected library's calls" — verify the specific library has auto-instrumentation support in your language's OpenTelemetry distribution, and check auto-instrumentation configuration/version compatibility.
`,

  monitoring: `
### Key signals to track

- **Collector health and resource usage** (a self-referential but genuinely important "meta-monitoring" concern), since Collector failures create observability blind spots.
- **Export success/failure rates** from applications to Collectors, and from Collectors to final backends.
- **Telemetry volume trends**, informing sampling and cost management decisions.
- **SDK-level instrumentation overhead**, particularly for genuinely high-throughput, latency-sensitive services.

### Tools

The Collector's own built-in metrics and logging for self-monitoring; standard infrastructure monitoring for Collector deployment health; backend-specific tooling (Prometheus, Grafana) for visualizing the actual telemetry data once it reaches its final destination.

### Alerting priorities

Alert on Collector unavailability or export failures (a genuine observability pipeline blind spot), on significant telemetry volume changes (potentially indicating an instrumentation regression or a genuine application behavior change), and on SDK-level export errors from instrumented applications.
`,

  deployment: `
### Deploying the OpenTelemetry Collector in Kubernetes

~~~yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
spec:
  config: |
    receivers:
      otlp:
        protocols: {grpc: {}, http: {}}
    processors:
      batch: {}
    exporters:
      otlp/tempo: {endpoint: "tempo:4317"}
    service:
      pipelines:
        traces: {receivers: [otlp], processors: [batch], exporters: [otlp/tempo]}
~~~

The OpenTelemetry Operator for Kubernetes lets Collector configuration be managed declaratively as a Kubernetes custom resource, and can additionally handle automatic instrumentation injection into application pods, significantly simplifying deployment at genuine cluster scale.

### CI/CD pipeline considerations

Automated testing of instrumentation correctness (via in-memory exporters) and Collector configuration validation as part of CI, catching telemetry pipeline regressions before they reach production. See the **CI/CD** and **Kubernetes** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production OpenTelemetry deployment is considered complete:

- [ ] Applications instrumented against OpenTelemetry's vendor-neutral API, not a proprietary vendor SDK directly
- [ ] A dedicated Collector deployed, rather than applications exporting directly to final backends
- [ ] Semantic conventions applied consistently across every instrumented service
- [ ] Consistent resource attributes (service.name, deployment.environment) set across all signal types
- [ ] Auto-instrumentation used for common frameworks where available and appropriate
- [ ] Sampling strategy configured deliberately at the Collector level
- [ ] No sensitive data present in telemetry attributes, verified via testing/review
- [ ] Collector deployment topology (single instance versus agent-plus-gateway) matched to genuine organizational scale
- [ ] Collector's own health and resource usage monitored
- [ ] An incremental migration plan documented for any remaining vendor-specific instrumentation
`,

  "common-mistakes": `
1. **Instrumenting directly against a proprietary vendor SDK**, recreating the exact vendor lock-in OpenTelemetry was designed to solve.
2. **Inconsistent semantic convention usage across services**, undermining cross-service dashboard and query interoperability.
3. **Having every application export directly to final backends** rather than through a centralized Collector.
4. **Including sensitive data in telemetry attributes**, applying insufficient discipline relative to logging/tracing security practice.
5. **Attempting a risky, all-at-once migration** from existing vendor-specific instrumentation instead of an incremental, bridged approach.
6. **Not verifying current feature maturity** for a specific language SDK/signal combination before production dependence.
7. **Overusing auto-instrumentation indiscriminately**, producing excessive telemetry volume beyond genuine diagnostic value.
8. **Not deploying a Collector deployment topology matched to genuine organizational scale**, either over- or under-engineering the setup.
9. **Not monitoring the Collector's own health**, missing a genuine observability pipeline blind spot.
10. **Not applying emerging AI-specific semantic conventions (gen_ai.*)** for LLM/agent instrumentation, missing alignment with the broader ecosystem's standardization direction.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Telemetry not appearing in the backend at all | Collector receiver/exporter misconfiguration, or a network connectivity issue | Check Collector logs directly, verify endpoint configuration on both the SDK and Collector sides |
| Traces missing spans from a specific service | That service's instrumentation or context propagation not correctly configured | Verify instrumentation and trace context propagation specifically at that service boundary |
| Inconsistent or hard-to-correlate telemetry across services | Inconsistent resource attributes or semantic convention naming | Standardize resource attributes and semantic conventions across all services |
| Excessive telemetry volume/cost | No deliberate sampling strategy, or overly broad auto-instrumentation | Configure sampling at the Collector level; scope auto-instrumentation more deliberately |
| Auto-instrumentation not capturing expected calls | The specific library lacks auto-instrumentation support, or a version compatibility issue | Verify library support and version compatibility in your language's OpenTelemetry distribution |
| Sensitive data found in telemetry | Instrumentation code directly including sensitive fields as attributes | Fix the specific instrumentation point; add Collector-level redaction as an additional safety net |
| Collector itself becoming a bottleneck | Single-Collector topology insufficient for genuine organizational telemetry volume | Adopt an agent-plus-gateway topology, horizontally scaling the gateway layer |
`,

  faqs: `
**What is OpenTelemetry, fundamentally?**
A vendor-neutral, open-source observability framework providing standardized APIs, SDKs, and data formats for generating and collecting logging, metrics, and tracing telemetry — unifying what were historically three separate, often incompatible instrumentation approaches under one standard.

**Why does OpenTelemetry matter for avoiding vendor lock-in?**
Because it cleanly separates instrumentation (how applications generate telemetry, using OpenTelemetry's own vendor-neutral API) from export (where that telemetry ultimately goes, configured separately at the Collector level) — an application instrumented once with OpenTelemetry can have its telemetry destination changed (from one backend to another) without any application code changes at all.

**What is the OpenTelemetry Collector?**
A standalone, deployable component that receives telemetry from instrumented applications, processes it (batching, sampling, filtering, format translation), and exports it to one or more final backends — centralizing this processing/routing logic outside individual application instances.

**What are semantic conventions, and why do they matter?**
Standardized, documented names for common telemetry attributes (http.method, db.system, and many others) — using them consistently across every instrumented service ensures telemetry remains interpretable by generic dashboards, queries, and tooling built against the standard naming, rather than requiring custom handling for each service's own ad-hoc attribute names.

**How does OpenTelemetry relate to Prometheus, Grafana, and the LGTM stack?**
OpenTelemetry is the instrumentation LAYER (how applications generate telemetry); Prometheus, Grafana's LGTM stack, and commercial platforms are BACKENDS that store and visualize the resulting data — OpenTelemetry-instrumented applications commonly export their telemetry (via the Collector) into exactly these kinds of backends.

**How does OpenTelemetry apply specifically to AI applications?**
OpenTelemetry has begun standardizing semantic conventions specifically for generative AI/LLM instrumentation (the gen_ai.* attribute namespace), letting engineers apply the same vendor-neutral instrumentation discipline to AI-specific signals (token usage, model name, prompt/completion details) that's long been standard for conventional web service telemetry, directly relevant to platforms like LangSmith and Langfuse.
`,

  "interview-questions": `
### Junior level

1. **What is OpenTelemetry?**
   Model answer: a vendor-neutral, open-source observability framework providing standardized APIs and tooling for generating and collecting logging, metrics, and tracing telemetry.

2. **What is the OpenTelemetry Collector?**
   Model answer: a standalone component that receives telemetry from instrumented applications, processes it (batching, sampling, filtering), and exports it to one or more backend systems.

3. **How does OpenTelemetry help avoid vendor lock-in?**
   Model answer: by separating instrumentation (using OpenTelemetry's own vendor-neutral API) from export (configured separately, typically at the Collector level) — the actual backend can be changed without needing to re-instrument application code.

4. **What are semantic conventions?**
   Model answer: standardized, documented names for common telemetry attributes (like http.method or db.system), ensuring consistent interpretation across different services and tools.

5. **What is auto-instrumentation?**
   Model answer: automatically instrumenting common libraries and frameworks (web frameworks, database clients) without requiring manual code changes, providing meaningful baseline telemetry immediately.

### Senior level

6. **Explain why OpenTracing and OpenCensus merged to form OpenTelemetry, and what this reveals about standardization efforts generally.**
   Model answer: both projects were independently pursuing the same underlying goal (vendor-neutral observability instrumentation) but their continued separate existence meant developers still faced a confusing choice between two competing "standard" options, undermining the actual goal of standardization; recognizing this, the maintainers deliberately merged rather than continue competing — illustrating that competing standardization efforts addressing genuinely overlapping needs often eventually converge once the ecosystem-wide cost of that fragmentation becomes apparent to the parties involved.

7. **Describe the agent-plus-gateway Collector deployment topology and explain when it becomes necessary over a single, centralized Collector.**
   Model answer: an agent-plus-gateway topology deploys lightweight Collector agents close to each application instance (as a sidecar or Kubernetes DaemonSet) handling initial local processing, which then forward telemetry to a centralized gateway Collector performing more sophisticated processing (particularly tail-based sampling, which requires visibility across an entire trace's spans before making a keep/discard decision); this becomes necessary once a single, centralized Collector's processing capacity is exceeded by genuine organizational telemetry volume, or once genuinely sophisticated cross-instance processing (like tail-based sampling) is needed that a simpler topology can't support efficiently.

8. **How would you plan a migration from an existing, large codebase instrumented with a proprietary vendor's tracing SDK to OpenTelemetry?**
   Model answer: avoid a risky, all-at-once re-instrumentation; instead, instrument all NEW services with OpenTelemetry natively from day one, use available bridges/shims (many observability vendors provide an OpenTelemetry-compatible export path even for their existing proprietary instrumentation) as an interim measure for EXISTING services, and gradually re-instrument existing services with native OpenTelemetry instrumentation as engineering capacity allows over time, rather than treating the migration as a single, high-risk, big-bang project.

9. **Why is consistent semantic convention usage across services genuinely important, beyond just "being tidy"?**
   Model answer: telemetry attributes with inconsistent naming across services (one service using httpMethod, another using method, a third using http_verb for the same underlying concept) directly undermine the ability to build generic, cross-service dashboards, queries, and alerting rules that assume standard attribute names — consistent semantic convention usage is precisely what makes OpenTelemetry's vendor-neutral, standardized instrumentation genuinely valuable at an organizational scale, rather than merely shifting the interoperability problem from "incompatible SDKs" to "incompatible attribute naming within one nominally-standard SDK."

10. **Explain how OpenTelemetry's layered architecture (API, SDK, exporter, Collector) specifically enables the vendor-neutrality benefit.**
    Model answer: application code calls only the stable, vendor-neutral OpenTelemetry API; the SDK implements this API's actual behavior (batching, sampling configuration) and hands processed telemetry to an exporter, which sends it in a specific wire format (commonly OTLP) to either a Collector or directly to a backend; because the APPLICATION never directly references a specific backend's proprietary format or endpoint, changing the ultimate destination (swapping which exporter is configured, or reconfiguring the Collector's own export destination) requires zero changes to the instrumented application code itself — the vendor-neutrality lives entirely in this clean separation between the stable, unchanging application-facing API and the swappable, backend-specific export configuration.

11. **How would you apply OpenTelemetry's emerging generative AI semantic conventions to instrument an LLM-powered application, and why does this matter?**
    Model answer: use the gen_ai.* attribute namespace (gen_ai.system for the provider, gen_ai.request.model for the specific model, gen_ai.usage.prompt_tokens and gen_ai.usage.completion_tokens for token counts) when creating spans around LLM API calls, rather than inventing ad-hoc attribute names for these AI-specific signals; this matters because it extends OpenTelemetry's broader interoperability benefit (consistent, standard naming enabling generic dashboards/tooling) specifically to the growing AI observability space, letting AI-specific observability platforms (LangSmith, Langfuse) and general-purpose tools interoperate around a shared, standard vocabulary for LLM telemetry rather than each platform inventing its own incompatible AI-specific instrumentation approach.

12. **Design an OpenTelemetry Collector pipeline for a scenario requiring different processing for traces versus metrics versus logs, all exported to different specialized backends.**
    Model answer: configure separate pipelines within one Collector configuration, each with its own receivers/processors/exporters combination — a traces pipeline receiving OTLP trace data, applying a tail-based sampling processor (retaining errors/slow requests preferentially), and exporting to Tempo; a metrics pipeline receiving OTLP metric data, applying a batch processor, and exporting to Prometheus/Mimir; and a logs pipeline receiving OTLP log data, applying an attribute-redaction processor (removing any accidentally-included sensitive fields as a safety net), and exporting to Loki — this pipeline-per-signal-type structure lets each telemetry type receive appropriately-tailored processing while still being managed within one unified Collector configuration and deployment.
`,

  "coding-questions": `
### 1. Implement basic multi-signal OpenTelemetry instrumentation for a request handler

~~~python
from opentelemetry import trace, metrics
import logging

tracer = trace.get_tracer("order-service")
meter = metrics.get_meter("order-service")
request_counter = meter.create_counter("http.server.requests")
logger = logging.getLogger("order-service")

def handle_order_request(order_id):
    with tracer.start_as_current_span("handle_order_request") as span:
        span.set_attribute("order.id", order_id)
        request_counter.add(1, {"endpoint": "/orders"})
        logger.info("Processing order " + str(order_id))
        -- process the order
        return "success"
# Follow-up: why does calling all three (tracer, meter, logger)
# within the SAME span's active context automatically let the
# emitted log line be correlated with this specific span's trace
# and span IDs, without any manual ID-passing required?
~~~

### 2. Configure an OpenTelemetry Collector pipeline with tail-based sampling

~~~yaml
receivers:
  otlp:
    protocols: {grpc: {}}
processors:
  tail_sampling:
    policies:
      - name: errors-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow-requests-policy
        type: latency
        latency: {threshold_ms: 1000}
  batch: {}
exporters:
  otlp/tempo:
    endpoint: "tempo:4317"
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [tail_sampling, batch]
      exporters: [otlp/tempo]
# Follow-up: why must tail_sampling be configured at the
# CENTRALIZED Collector (gateway) level rather than within an
# application's own SDK, given that this processor needs to see
# a trace's COMPLETE outcome (error status, total duration)
# before deciding whether to retain it?
~~~

### 3. Implement a resource attribute helper ensuring consistency across signal types

~~~python
from opentelemetry.sdk.resources import Resource
import os

def create_service_resource():
    return Resource.create({
        "service.name": os.environ.get("SERVICE_NAME", "unknown-service"),
        "service.version": os.environ.get("SERVICE_VERSION", "unknown"),
        "deployment.environment": os.environ.get("DEPLOYMENT_ENV", "development"),
    })
# Follow-up: why is it important that this SAME resource object
# (or an identically-configured one) be used when initializing
# the TracerProvider, MeterProvider, AND LoggerProvider for a
# given service, rather than each provider being configured with
# its own independently-constructed resource attributes?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Instrument an application with all three OpenTelemetry signal types
Build a small application instrumenting traces, metrics, and logs using OpenTelemetry's unified API, verifying via an in-memory exporter that all three signal types are correctly generated and correlated. Deliverable: a working, tested multi-signal instrumented application. Skills exercised: unified multi-signal instrumentation.

### Lab 2 (Intermediate): Deploy and configure an OpenTelemetry Collector
Set up a local Collector receiving OTLP data from an instrumented application, configuring separate pipelines exporting metrics to Prometheus and traces to a tracing backend (Jaeger or Tempo). Deliverable: a working Collector deployment with verified multi-backend export. Skills exercised: Collector configuration, pipeline design.

### Lab 3 (Advanced): Implement tail-based sampling and semantic convention consistency
Configure a Collector's tail-based sampling processor ensuring errors and slow requests are always retained, and audit/fix a set of deliberately-inconsistent semantic convention attribute names across simulated services. Deliverable: a working tail-sampling configuration and a semantic-convention consistency audit/fix. Skills exercised: sampling configuration, semantic convention discipline.

### Lab 4 (Production): Instrument an LLM application call using AI-specific semantic conventions
Instrument a simulated LLM API call using OpenTelemetry's emerging gen_ai.* semantic conventions (model, token usage, provider), verifying the resulting span/attributes correctly capture this AI-specific telemetry. Deliverable: a working, AI-specific instrumented application demonstrating gen_ai.* convention usage. Skills exercised: AI-specific OpenTelemetry instrumentation.
`,

  "real-projects": `
### 1. An organization-wide migration from vendor-specific instrumentation to OpenTelemetry
Engineering requirements: an incremental migration plan instrumenting new services natively with OpenTelemetry, bridging existing vendor-instrumented services via available compatibility shims, and a shared, organization-wide semantic convention and resource attribute standard applied consistently.

### 2. A Collector deployment supporting multi-backend export with tail-based sampling
Engineering requirements: an agent-plus-gateway Collector topology, with the gateway performing tail-based sampling (always retaining errors/slow requests) and routing traces, metrics, and logs to their respective specialized backends (Tempo, Mimir, Loki, or equivalent).

### 3. A standardized AI observability instrumentation library
Engineering requirements: a shared internal library applying OpenTelemetry's gen_ai.* semantic conventions consistently across every AI-application service in an organization, capturing model, token usage, and latency information for every LLM call, feeding into both general-purpose observability tooling and AI-specific platforms (LangSmith, Langfuse) simultaneously via OpenTelemetry's vendor-neutral instrumentation.
`,

  "case-studies": `
### The OpenTracing/OpenCensus merger as a model for resolving standardization fragmentation
The 2019 merger of OpenTracing and OpenCensus into OpenTelemetry — explicitly recognizing that two competing, overlapping standardization efforts served the industry worse than one unified approach — stands as one of the clearest, most direct examples of deliberate industry convergence in software standardization history. Lesson: when multiple standardization efforts address genuinely overlapping problems, the ecosystem-wide cost of continued fragmentation (developers facing a confusing choice between "competing standards," a contradiction in terms) can become apparent enough to motivate an explicit, deliberate merger, rather than the market simply picking a "winner" through prolonged competition.

### OpenTelemetry's rapid rise to become one of CNCF's most active projects
OpenTelemetry becoming the second-most active CNCF project by contributor count (after Kubernetes itself) within a few years of its formation reflects both genuine, broad industry recognition of the vendor-lock-in problem it solves and the practical value every major commercial observability vendor found in supporting a common, standard ingestion format rather than requiring customers to use only their own proprietary instrumentation. Lesson: a standard that genuinely serves BOTH the direct technical need (vendor-neutral instrumentation for engineers) AND the business interests of the broader ecosystem (vendors gaining customers who'd otherwise face switching costs) can achieve remarkably fast, broad adoption, since it aligns incentives across what might otherwise seem like competing parties.

### The extension of OpenTelemetry's semantic conventions to generative AI
The recent, ongoing development of OpenTelemetry's gen_ai.* semantic conventions specifically for LLM/generative AI instrumentation illustrates how an established, general-purpose standard can extend to cover a genuinely new domain (AI applications) by applying its existing core principles (standardized attribute naming, vendor-neutral instrumentation) rather than requiring an entirely separate, AI-specific standardization effort from scratch. Lesson: a well-designed, sufficiently general standard's underlying principles (not just its specific initial attribute vocabulary) can extend productively to entirely new technology domains as they emerge, avoiding the need to reinvent foundational standardization work for every new application area.
`,

  comparisons: `
| Aspect | OpenTelemetry | Vendor-specific proprietary SDKs |
|--------|-----------------|---------------------------------------|
| Vendor lock-in | None — instrumentation is vendor-neutral | Genuine, significant — re-instrumentation required to switch |
| Coverage | Unified across logging, metrics, tracing | Often narrower, sometimes covering only one or two pillars |
| Ecosystem support | Broad — supported by virtually every major backend | Limited to that specific vendor's own backend |
| Migration cost if switching backends | Low — change Collector export config only | High — re-instrument the entire codebase |

| Aspect | OpenTracing/OpenCensus (historical) | OpenTelemetry (current) |
|--------|-----------------------------------------|-------------------------------|
| Scope | Separate, competing, overlapping efforts | One unified, merged standard |
| Signal coverage | Tracing only (OpenTracing) or tracing+metrics (OpenCensus) | Logging, metrics, AND tracing together |
| Current status | Deprecated in favor of OpenTelemetry | The active, maintained standard |

**How seniors choose**: instrument all new services with OpenTelemetry's vendor-neutral API by default, reserving proprietary vendor SDKs only for genuinely specific features OpenTelemetry doesn't yet support (verified against current documentation); plan incremental, bridged migration for any existing vendor-specific instrumentation rather than an all-at-once re-instrumentation.
`,

  "related-technologies": `
- **Logging**, **Metrics**, **Tracing** — the three observability pillars OpenTelemetry unifies under one standard; covered in their own skills throughout this category.
- **Prometheus** and **Grafana** — common backend destinations for OpenTelemetry-instrumented telemetry data.
- **Kubernetes** — commonly hosts the OpenTelemetry Collector (often via the OpenTelemetry Operator) and benefits from auto-instrumentation injection.
- **LangSmith** and **Langfuse** — AI-specific observability platforms increasingly interoperating with OpenTelemetry's emerging generative AI semantic conventions.
- **Agent Observability** — the AI-specific application of unified observability (built on OpenTelemetry's principles) to debugging AI agent behavior.

Learning path: **Logging** → **Metrics** → **Tracing** → **Prometheus** → **Grafana** → this page, completing the Observability category by unifying every prior skill's concepts under one modern, standard instrumentation approach.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- OpenTelemetry's tracing and metrics APIs remain stable and widely adopted, with logging support continuing to mature toward the same level of stability and ecosystem support.
- Continued rapid growth of OpenTelemetry's generative AI semantic conventions (gen_ai.*), reflecting the broader industry's need for standardized LLM/agent observability.
- Growing adoption of auto-instrumentation capabilities across major languages, reducing the manual instrumentation burden for common frameworks.
- Given OpenTelemetry's continued rapid, active development (reflected in its status as one of CNCF's most active projects), verify current feature maturity and specific language SDK capabilities against official OpenTelemetry documentation.
`,

  "future-roadmap": `
Where OpenTelemetry is heading, and what's worth betting career time on:

- **Continued, likely near-total dominance as THE standard instrumentation approach** across the observability industry, given its broad ecosystem support and genuine vendor-neutrality benefit.
- **Continued rapid development of AI-specific semantic conventions**, likely becoming as standard for AI application observability as conventional web service instrumentation is today.
- **Growing maturity of auto-instrumentation**, further reducing the manual instrumentation effort required for common frameworks and libraries.
- **What to bet on**: deeply understanding OpenTelemetry's layered architecture (API, SDK, Collector, exporters) and the vendor-neutrality principle it embodies, along with semantic convention discipline — these transfer directly across any specific backend or vendor an organization ultimately chooses, and directly position you to apply the same principles to the rapidly-growing AI-specific observability space this platform's broader content increasingly involves.
`,

  "cheat-sheet": `
~~~python
# ---- Unified API across all three pillars ----
from opentelemetry import trace, metrics
tracer = trace.get_tracer("my-service")
meter = metrics.get_meter("my-service")

with tracer.start_as_current_span("handle_request") as span:
    span.set_attribute("http.method", "GET")   # SEMANTIC CONVENTION, not ad-hoc naming
    meter.create_counter("http.server.requests").add(1)
    logging.info("processed")   # auto-correlated via the active span context
~~~

~~~yaml
# ---- The Collector: receive -> process -> export ----
receivers: {otlp: {protocols: {grpc: {}}}}
processors: {batch: {}, tail_sampling: {policies: [...]}}   # sampling lives HERE, centrally
exporters: {otlp/tempo: {endpoint: "tempo:4317"}, prometheus: {...}}
service:
  pipelines:
    traces: {receivers: [otlp], processors: [tail_sampling, batch], exporters: [otlp/tempo]}
~~~

~~~
# ---- THE core value: vendor neutrality ----
App code -> OTel API (STABLE, never changes) -> SDK -> Exporter -> Collector -> Backend
# Swap the BACKEND by reconfiguring the Collector -- ZERO application code changes

# ---- History: two competing standards merged into one ----
# OpenTracing (tracing only) + OpenCensus (Google's tracing+metrics) -> OpenTelemetry (2019)

# ---- Collector topology ----
# Small scale: a single centralized Collector is often enough
# Large scale / tail-based sampling: agent (per-app) + gateway (centralized) topology

# ---- AI-specific semantic conventions (gen_ai.*) ----
span.set_attribute("gen_ai.system", "openai")
span.set_attribute("gen_ai.request.model", "gpt-5")
span.set_attribute("gen_ai.usage.prompt_tokens", 150)
~~~

~~~
# ---- Migration discipline ----
# NEW services: OpenTelemetry native from day one
# EXISTING vendor-instrumented services: bridge/shim first, migrate incrementally
# NEVER a risky, all-at-once re-instrumentation

# ---- Common anti-pattern ----
# Instrumenting directly against a proprietary vendor SDK = recreates the EXACT
# lock-in problem OpenTelemetry was built to solve.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is OpenTelemetry? | A vendor-neutral standard unifying logging, metrics, and tracing instrumentation. |
| How does it avoid vendor lock-in? | Separates instrumentation (stable API) from export (swappable Collector config). |
| What is the Collector? | A standalone component that receives, processes, and exports telemetry to backends. |
| What are semantic conventions? | Standardized attribute names (http.method, db.system) for consistent interpretation. |
| History: what merged to form OpenTelemetry? | OpenTracing (tracing) + OpenCensus (Google's tracing+metrics), merged in 2019. |
| What is auto-instrumentation? | Automatic instrumentation of common libraries, no manual code changes needed. |
| Agent vs gateway Collector topology? | Agent: local, per-app. Gateway: centralized, handles tail-based sampling. |
| Why must tail-based sampling live at the gateway? | It needs to see a trace's COMPLETE outcome before deciding to keep/discard it. |
| #1 anti-pattern to avoid? | Instrumenting directly against a proprietary vendor SDK -- recreates lock-in. |
| Migration strategy for existing codebases? | Incremental: new services native, existing services bridged, never all-at-once. |
| AI-specific semantic convention namespace? | gen_ai.* -- model, token usage, provider for LLM call instrumentation. |
| What does OTLP stand for? | OpenTelemetry Protocol -- its own standard wire format for telemetry data. |
`,

  mcqs: `
1. What is OpenTelemetry's core purpose?
   A) A database for storing metrics  B) A vendor-neutral standard unifying logging, metrics, and tracing instrumentation  C) A dashboard visualization tool  D) A programming language
   **Answer: B** — it's an instrumentation and collection standard, not a storage/visualization backend itself.

2. How does OpenTelemetry specifically enable vendor neutrality?
   A) It only works with one vendor  B) By separating instrumentation (a stable, vendor-neutral API) from export (swappable Collector/exporter configuration)  C) It requires no configuration at all  D) It doesn't actually provide vendor neutrality
   **Answer: B** — the backend can be changed without touching instrumented application code.

3. What two competing projects merged in 2019 to form OpenTelemetry?
   A) Prometheus and Grafana  B) OpenTracing and OpenCensus  C) Jaeger and Zipkin  D) Loki and Tempo
   **Answer: B** — explicitly recognizing that fragmentation across two overlapping standards served the industry poorly.

4. What is the OpenTelemetry Collector responsible for?
   A) Writing application code  B) Receiving, processing (batching, sampling, filtering), and exporting telemetry data to backends  C) Only visualizing dashboards  D) Storing passwords
   **Answer: B** — centralizing processing/routing logic outside individual application instances.

5. Why should tail-based sampling typically be configured at a centralized gateway Collector rather than within an application's own SDK?
   A) It's faster in the SDK  B) Tail-based sampling needs to see a trace's complete outcome (error status, duration) before deciding whether to retain it, requiring cross-span visibility a single application instance doesn't have alone  C) SDKs don't support sampling at all  D) There is no real reason
   **Answer: B** — this is precisely the architectural reason for the agent-plus-gateway Collector topology.

6. What is a genuine anti-pattern when adopting OpenTelemetry?
   A) Using semantic conventions consistently  B) Instrumenting directly against a proprietary vendor SDK instead of OpenTelemetry's vendor-neutral API  C) Deploying a Collector  D) Using auto-instrumentation
   **Answer: B** — this recreates the exact vendor lock-in problem OpenTelemetry was created to solve.
`,

  "revision-notes": `
OpenTelemetry (OTel) is a vendor-neutral, open-source observability framework unifying the standardized instrumentation of LOGGING, METRICS, and TRACING — the three pillars covered in their own skills — under one consistent API and SDK, directly completing this platform's Observability category. It formed in 2019 from the explicit MERGER of two previously-competing standardization efforts, OpenTracing (tracing-focused) and OpenCensus (Google's combined tracing-plus-metrics project), once their maintainers recognized that continued separate existence undermined the very vendor-neutrality goal both were independently pursuing.

OpenTelemetry's core architectural insight is cleanly SEPARATING INSTRUMENTATION FROM EXPORT: application code calls only OpenTelemetry's stable, vendor-neutral API (a tracer for spans, a meter for metrics, a logging handler for logs); the actual EXPORT destination (Prometheus, a commercial platform, Grafana's LGTM stack) is configured separately, typically at the OPENTELEMETRY COLLECTOR level — a standalone component receiving telemetry (via OTLP, OpenTelemetry's own standard wire format), processing it (batching, sampling, filtering, resource enrichment), and exporting it to one or more final backends. This separation is precisely what enables VENDOR NEUTRALITY: switching observability backends requires reconfiguring the Collector's export destination, with ZERO changes to instrumented application code.

SEMANTIC CONVENTIONS — standardized, documented attribute names (http.method, db.system, and many others) — ensure telemetry remains consistently interpretable across different services, teams, and tools; inconsistent, ad-hoc attribute naming across services (one team using httpMethod, another using method for the same concept) directly undermines the interoperability benefit semantic conventions are specifically meant to provide. AUTO-INSTRUMENTATION automatically instruments common libraries and frameworks (web frameworks, database clients) without manual code changes, providing meaningful baseline telemetry immediately, with manual instrumentation reserved for genuinely custom, application-specific logic.

Collector deployment TOPOLOGY is a genuine architectural decision: a single, centralized Collector may suffice for smaller deployments, while genuine organizational scale (or the need for TAIL-BASED SAMPLING specifically, covered in depth in the **Tracing** skill) typically requires an AGENT-PLUS-GATEWAY topology — lightweight agent Collectors near each application instance handling initial local processing, forwarding to a centralized gateway Collector that performs more sophisticated, cross-instance-aware processing (tail-based sampling specifically requires seeing a trace's complete outcome before deciding whether to retain it, something a single application instance's own SDK can't do alone).

A genuinely important, senior-level migration discipline: rather than attempting a risky, all-at-once re-instrumentation of an existing, large codebase using proprietary vendor SDKs, a mature adoption strategy instruments ALL NEW services with OpenTelemetry natively from day one, uses available BRIDGES/SHIMS (many observability vendors provide an OpenTelemetry-compatible export path even for their own existing proprietary instrumentation) as an interim measure for EXISTING services, and gradually re-instruments those existing services as engineering capacity allows over time.

OpenTelemetry has begun extending its standardization principles to a genuinely new domain: GENERATIVE AI/LLM instrumentation, via the emerging gen_ai.* semantic convention namespace (capturing model name, token usage, provider), directly relevant to this platform's broader AI engineering focus and interoperating with AI-specific observability platforms like LangSmith and Langfuse — illustrating how a well-designed, sufficiently general standard's underlying principles can extend productively to new technology domains as they emerge, without requiring an entirely separate standardization effort from scratch.

The single most common, most damaging anti-pattern to avoid is INSTRUMENTING DIRECTLY AGAINST A PROPRIETARY VENDOR SDK rather than OpenTelemetry's own vendor-neutral API — this recreates precisely the vendor lock-in problem OpenTelemetry was specifically created to solve, since switching observability vendors later would then require expensive, risky re-instrumentation throughout the entire codebase, exactly the outcome vendor-neutral instrumentation is meant to prevent.
`,

  "learning-roadmap": `
**Week 1 — Unified multi-signal instrumentation**: instrumenting traces, metrics, and logs using OpenTelemetry's consistent API. Milestone: build a working, tested multi-signal instrumented application (Lab 1).

**Week 2 — The Collector**: deploying and configuring a Collector with multiple pipelines exporting to different backends. Milestone: complete a working Collector deployment with verified multi-backend export (Lab 2).

**Week 3 — Semantic conventions and resource attributes**: applying consistent attribute naming and resource identification across services. Milestone: audit and fix a set of deliberately-inconsistent semantic convention violations.

**Week 4 — Sampling and Collector topology**: implementing tail-based sampling and understanding agent-plus-gateway deployment patterns. Milestone: complete Lab 3, configuring tail-based sampling correctly at the gateway level.

**Week 5 — Auto-instrumentation and migration strategy**: using auto-instrumentation for common frameworks, and planning incremental migration from vendor-specific instrumentation. Milestone: document a migration plan for a hypothetical existing, vendor-instrumented codebase.

**Week 6 — AI-specific instrumentation and category consolidation**: applying gen_ai.* semantic conventions, and reviewing how OpenTelemetry unifies every prior Observability category skill. Milestone: complete Lab 4, instrumenting a simulated LLM call with AI-specific semantic conventions.

This completes the Observability category's learning path: **Logging** → **Metrics** → **Tracing** → **Prometheus** → **Grafana** → **OpenTelemetry**.
`,

  "official-docs": `
- **OpenTelemetry's official documentation** (opentelemetry.io/docs) — the comprehensive, authoritative reference for the specification, SDKs, and Collector configuration.
- **OpenTelemetry's semantic conventions specification** — the authoritative reference for standardized attribute naming, including the emerging generative AI conventions.
- **The OTLP (OpenTelemetry Protocol) specification** — the authoritative reference for OpenTelemetry's standard wire format.
`,

  books: `
- **"Learning OpenTelemetry" — Ted Young and Austin Parker** — a comprehensive, practical guide to OpenTelemetry directly from contributors to the project.
- **"Observability Engineering" — Charity Majors, Liz Fong-Jones, George Miranda** — covers OpenTelemetry within the broader modern observability practice context.
- **"Cloud Native Observability with OpenTelemetry" — Alex Boten** — a practical, hands-on guide focused specifically on OpenTelemetry adoption.
`,

  blogs: `
- **The OpenTelemetry project's own blog** — release announcements, best-practice guidance, and roadmap updates directly from the maintainers.
- **Grafana Labs' engineering blog** — extensive writing on OpenTelemetry's integration with the LGTM stack specifically.
- **Various commercial observability vendors' blogs** (Datadog, Honeycomb, New Relic) covering their own OpenTelemetry integration and migration guidance for customers.
`,

  "research-papers": `
OpenTelemetry, as an industry/practitioner-driven open-source standardization effort rather than pure academic research, has limited dedicated peer-reviewed literature; the most relevant related sources:

- **Google's original Dapper and Borgmon work** (referenced in the **Tracing** and **Metrics** skills) — the foundational internal systems whose concepts OpenTelemetry's tracing and metrics APIs directly build upon.
- The **CNCF's own project documentation and governance records** for OpenTelemetry provide historical context on its formation and ongoing development process.
`,

  videos: `
- **KubeCon and CloudNativeCon talks on OpenTelemetry** — the primary venue for in-depth technical content directly from the maintainer community.
- **The OpenTelemetry project's own YouTube channel and community meeting recordings** — ongoing development updates and tutorials.
- **Various "Getting Started with OpenTelemetry" tutorial series** across major cloud providers and observability vendors.
`,

  "github-repos": `
- **open-telemetry/opentelemetry-specification** — the official specification repository, the authoritative source for the standard itself.
- **open-telemetry/opentelemetry-collector** and **opentelemetry-collector-contrib** — the official Collector source repositories (core and community-contributed components respectively).
- **open-telemetry/semantic-conventions** — the official semantic conventions repository, including the emerging generative AI conventions.
- Language-specific SDK repositories (open-telemetry/opentelemetry-python, -java, -js, and others) for each language's specific implementation.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Multi-signal instrumentation**: instrument an application with traces, metrics, and logs using OpenTelemetry's unified API, verifying correlation via shared resource attributes and trace context.
2. **Collector configuration**: configure a Collector pipeline receiving OTLP data and exporting to at least two different backend types simultaneously.
3. **Semantic convention audit**: given a set of services with inconsistent attribute naming, identify and correct the inconsistencies using standard semantic conventions.
4. **Sampling configuration**: implement tail-based sampling ensuring errors and slow requests are always retained, testing against both normal and problematic scenarios.
5. **AI-specific instrumentation**: instrument a simulated LLM call using the gen_ai.* semantic conventions, capturing model, token usage, and latency correctly.
6. **External practice sets**: OpenTelemetry's own official "Getting Started" guides for each major language, for structured, guided practice with real instrumentation.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Application["Instrumented Application"]
        API["OpenTelemetry API\n(vendor-neutral, stable)"]
        SDK["OpenTelemetry SDK\n(batching, sampling config)"]
    end
    subgraph CollectorLayer["OpenTelemetry Collector"]
        Receivers["Receivers (OTLP, etc.)"]
        Processors["Processors\n(batch, sampling, filtering)"]
        Exporters["Exporters"]
    end
    subgraph Backends["Backends"]
        Prometheus["Prometheus/Mimir\n(metrics)"]
        Tempo["Tempo/Jaeger\n(traces)"]
        Loki["Loki\n(logs)"]
    end
    API --> SDK --> Receivers
    Receivers --> Processors --> Exporters
    Exporters --> Prometheus
    Exporters --> Tempo
    Exporters --> Loki
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OpenTelemetry))
    Foundations
      Overview
      History OpenTracing OpenCensus merger
      Why it exists
      Problem it solves
    Architecture
      API and SDK layers
      Exporters
      OTLP protocol
    Collector
      Receivers processors exporters
      Agent versus gateway topology
      Tail based sampling
    Semantic Conventions
      Standardized attribute names
      Resource attributes
      Cross service consistency
    Instrumentation
      Manual instrumentation
      Auto instrumentation
      Context propagation
    Vendor Neutrality
      Separation of concerns
      Avoiding lock in
      Migration strategy
    AI Specific
      Gen AI semantic conventions
      LangSmith Langfuse interop
    Unifying Role
      Logging pillar
      Metrics pillar
      Tracing pillar
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default opentelemetry;
