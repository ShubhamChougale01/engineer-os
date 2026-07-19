import type { SkillContent } from "../types";

/**
 * Metrics — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const metrics: SkillContent = {
  overview: `
Metrics are numerical measurements of a system's behavior collected over time — request counts, error rates, latency distributions, queue depths, CPU utilization — that are aggregated and stored efficiently specifically to answer "how is my system behaving, in the aggregate, right now and over time" without needing to inspect individual events. Metrics are the second of the three pillars of observability (alongside **Logging** and **Tracing**, both covered alongside this skill), and are the foundation of virtually every production dashboard, alert, and Service Level Objective (SLO) an AI engineer will encounter.

For an AI engineer, metrics are essential for understanding a production system's health at a glance (via dashboards, covered in the **Grafana** skill), for defining and tracking meaningful reliability targets (SLOs, error budgets), and for building the alerting that pages an on-call engineer BEFORE users notice a problem. This page covers metrics THEORY — the fundamental metric types, aggregation mathematics, and design principles — with **Prometheus** (covered in its own skill) as the dominant concrete implementation of these principles in practice.

Key characteristics: **the four fundamental metric types** — counters (monotonically increasing values), gauges (values that go up or down), histograms (distributions of observed values, particularly latency), and summaries (client-side calculated percentiles) — each suited to a specific measurement need; **labels/dimensions**, letting a single metric be sliced and filtered by attributes (which endpoint, which status code, which region); **aggregation** across time and dimensions, the mathematical operations (sum, average, percentile) that turn raw metric data into meaningful signals; and **cardinality**, the genuinely important, easily-overlooked concern of how many DISTINCT label combinations a metric can produce, directly affecting storage cost and query performance.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1980s–1990s | **SNMP** (Simple Network Management Protocol, 1988) establishes early standardized numerical monitoring for network devices, an ancestor of modern application metrics |
| 1990s–2000s | **Nagios** and similar early monitoring tools become standard for infrastructure health checking, though typically limited to simple up/down status rather than rich, dimensional numerical time-series data |
| 2003 | **Ganglia** and **Graphite** (Graphite specifically in 2008) emerge as early time-series-focused monitoring systems, establishing the pattern of storing numerical metrics over time specifically for trend visualization |
| 2012 | **Prometheus** (covered in its own skill) is developed internally at SoundCloud, directly inspired by Google's internal Borgmon monitoring system, introducing a pull-based collection model and a powerful query language (PromQL) for dimensional metric analysis |
| 2015 | Prometheus is donated to the **Cloud Native Computing Foundation (CNCF)**, becoming the de facto standard metrics system for Kubernetes-based, cloud-native infrastructure |
| 2016 | **Grafana** (covered in its own skill) becomes the dominant visualization layer atop Prometheus and other metric sources, completing the modern open-source metrics stack still widely used today |
| 2018 | The concept of **SLOs (Service Level Objectives) and error budgets**, popularized by Google's Site Reliability Engineering book (2016) and subsequent practice, becomes mainstream industry practice for translating raw metrics into meaningful reliability targets |
| 2019–2020s | **OpenTelemetry** (covered in its own skill) emerges to standardize metrics instrumentation alongside logging and tracing, reducing vendor lock-in and fragmentation across the observability ecosystem |

Metrics' history reflects a clear progression from simple, binary infrastructure health checks (Nagios-era up/down monitoring) toward rich, dimensional, queryable time-series data (Prometheus's label-based model) — directly paralleling the broader industry shift from monolithic, simple infrastructure toward complex, distributed, cloud-native systems requiring much richer observability signals.
`,

  "why-it-exists": `
Metrics exist because logging alone (covered in its own skill), despite its genuine value for detailed, per-event diagnostic investigation, is fundamentally the wrong tool for answering a different, equally important class of question: "in aggregate, across potentially millions of requests, how is my system actually performing right now, and how has that changed over time." Deriving this kind of aggregate signal by parsing and counting individual log lines is genuinely expensive and slow at any meaningful scale — exactly the anti-pattern covered in the **Logging** skill's own treatment of this distinction.

The specific insight that makes metrics work efficiently is PRE-AGGREGATION: rather than storing every individual event and computing aggregates later (as querying logs would require), a metrics system increments a counter or records an observation IN REAL TIME as events occur, storing only the resulting compact numerical time series — a request counter doesn't need to remember every individual request that happened, only the running total at each point in time. This pre-aggregation is precisely why metrics storage and query performance scale so much better than log-based aggregation for the specific class of "how many, how often, how fast" questions metrics are designed to answer.

Prometheus's specific historical contribution — a pull-based collection model combined with a rich, LABEL-based dimensional data model — directly addressed a genuine limitation of earlier metrics systems (Graphite's simpler, hierarchical naming scheme): letting engineers slice and filter metrics along multiple independent dimensions simultaneously (by endpoint AND status code AND region, for instance) without needing to pre-plan every possible combination as a separate metric name, a genuinely more flexible and powerful approach that became the modern industry standard.
`,

  "problem-it-solves": `
Metrics solve the **"how do we efficiently track and query aggregate numerical signals about a system's behavior over time, supporting dashboards, alerting, and reliability targets, without the cost of processing every individual raw event"** problem.

Concretely, metrics provide:

- **Efficient, pre-aggregated storage**: a counter or histogram is updated in real time as events occur, storing only the resulting compact time series rather than every individual raw event — dramatically cheaper to store and query than deriving the same aggregate from logs.
- **Dimensional slicing via labels**: a single metric (http_requests_total, for instance) can be filtered and grouped by multiple independent dimensions (endpoint, status code, region) simultaneously, letting one instrumented metric answer many different specific questions.
- **The foundation for meaningful alerting**: metrics-based alerting rules ("alert if error rate exceeds 5% for 5 minutes") provide the standard, efficient mechanism for detecting problems and paging on-call engineers, generally far cheaper and faster than log-based alerting.
- **A quantitative basis for reliability targets**: Service Level Indicators (SLIs, the actual measured metric) and Service Level Objectives (SLOs, the target for that metric) provide a shared, objective vocabulary for defining and tracking "how reliable should this system be" — directly built on metrics data.

What metrics do **not** solve, or solves with a real tradeoff: metrics lack the detailed, per-event context that logging provides — a metric can tell you the error rate spiked, but not WHY any specific request failed, requiring a pivot to logs (or traces) for that detail; metrics have a genuine CARDINALITY concern — labels with too many distinct possible values (a raw user ID as a label, for instance) can cause storage and query costs to explode combinatorially, a well-documented and important operational pitfall; and metrics, being pre-aggregated, cannot retroactively answer a question you didn't think to track at collection time, unlike logs (which retain full event detail) or traces (which retain full per-request structure).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the four fundamental metric types (counter, gauge, histogram, summary) and choose the correct one for a given measurement need.
2. Design metrics with appropriate labels/dimensions, understanding and avoiding cardinality explosion.
3. Explain percentile-based latency measurement (p50, p95, p99) and why averages are often misleading for latency.
4. Design meaningful Service Level Indicators (SLIs) and Service Level Objectives (SLOs) for a production system.
5. Understand error budgets and how they translate an SLO into an actionable operational policy.
6. Design effective alerting rules based on metrics, avoiding both alert fatigue and missed incidents.
7. Recognize when a diagnostic need is genuinely a metrics concern versus a logging or tracing concern.
8. Apply the RED and USE methods as structured frameworks for what to measure in a production system.
9. Answer senior-level interview questions on metric design, cardinality management, and SLO/error-budget practice.
`,

  prerequisites: `
- **Required**: the **Logging** skill (covered alongside this one) — understanding logging's strengths and limitations directly motivates metrics' distinct value proposition.
- **Very helpful**: the **Prometheus** skill (covered alongside this one) for a concrete, production implementation of this page's theoretical concepts.
- **Very helpful**: the **Grafana** skill for how metrics are typically visualized in practice.

Dependency links: **Logging** → this page → **Prometheus** for the concrete implementation → **Grafana** for visualization → **Tracing** and **OpenTelemetry** for the remaining observability pillars and their unification.
`,

  "beginner-concepts": `
### The four fundamental metric types

~~~
Counter: a value that only ever INCREASES (or resets to zero on
    restart) -- total requests served, total errors encountered
Gauge: a value that can go UP OR DOWN -- current memory usage,
    current queue depth, current number of active connections
Histogram: tracks the DISTRIBUTION of observed values across
    configurable buckets -- request latency, response size
Summary: similar to a histogram, but calculates percentiles
    CLIENT-SIDE rather than server-side -- less flexible for
    aggregation across multiple instances, generally less
    preferred than histograms in modern practice
~~~

Choosing the right metric type for a given measurement is the foundational skill — a counter for "how many," a gauge for "how much right now," a histogram for "what's the distribution of this value."

### A basic counter example

~~~python
from prometheus_client import Counter

request_counter = Counter("http_requests_total", "Total HTTP requests", ["method", "status"])

def handle_request(method, status):
    request_counter.labels(method=method, status=status).inc()   -- increments by 1
~~~

Labels (method, status here) let this ONE counter answer many specific questions later: total requests, requests by method, requests by status code, or requests filtered by both simultaneously.

### A basic gauge example

~~~python
from prometheus_client import Gauge

active_connections = Gauge("active_connections", "Current active connections")

def on_connection_open():
    active_connections.inc()

def on_connection_close():
    active_connections.dec()
~~~

Unlike a counter, a gauge can go both up (inc) and down (dec), directly representing a current, point-in-time value rather than an ever-growing total.

### A basic histogram example

~~~python
from prometheus_client import Histogram

request_latency = Histogram("http_request_duration_seconds", "Request latency", ["endpoint"])

def handle_request(endpoint):
    with request_latency.labels(endpoint=endpoint).time():
        process_request()   -- automatically records the duration
~~~

A histogram automatically buckets observed values (request durations, here), later enabling percentile calculations (p50, p95, p99) and other distribution-based analysis — far more informative than a simple average for understanding latency, covered further in Intermediate Concepts.
`,

  "intermediate-concepts": `
### Why averages mislead for latency, and percentiles matter

~~~
Average latency: 200ms  -- sounds fine, but hides the actual distribution

Actual distribution: 95% of requests complete in 50ms,
                      5% of requests take 3000ms (a genuine problem!)
Average = (0.95 * 50 + 0.05 * 3000) = ~197.5ms -- looks similar to
    the "fine" average above, completely masking the real, severe
    tail-latency problem affecting a meaningful fraction of users
~~~

A small number of very slow requests (the "long tail") can be completely hidden by an average, since a few large values pull the average up only modestly relative to many small values — PERCENTILES (p50 = median, p95 = 95th percentile, p99 = 99th percentile) reveal this tail behavior directly, which is why production latency monitoring almost universally uses percentiles rather than averages.

### Cardinality: the critical, easily-overlooked cost concern

~~~python
# WRONG — using a raw user ID as a label creates ONE TIME SERIES
# PER UNIQUE USER, a combinatorial explosion at any meaningful user count
request_counter.labels(user_id=user.id, endpoint=endpoint).inc()

# RIGHT — use a bounded, low-cardinality dimension instead
request_counter.labels(user_tier=user.tier, endpoint=endpoint).inc()
~~~

Every UNIQUE combination of label values creates a separate time series that must be stored and indexed — a label with unbounded or very high cardinality (a raw user ID, a raw IP address, a UUID) can cause a metrics system's storage and query cost to explode, a genuinely common, important production pitfall covered further in Anti-Patterns.

### The RED method: a structured framework for service-level metrics

~~~
Rate: how many requests per second is this service handling?
Errors: how many of those requests are failing?
Duration: how long do requests take (as a distribution, not
    just an average)?
~~~

The RED method (popularized by Tom Wilkie) provides a simple, memorable checklist for what to measure for any REQUEST-DRIVEN service — ensuring these three fundamental signals are tracked for every service is a strong, broadly-applicable baseline before adding more specialized metrics.

### The USE method: a structured framework for resource-level metrics

~~~
Utilization: what percentage of this resource's capacity is
    currently being used? (CPU utilization, disk space used)
Saturation: how much extra, QUEUED work is waiting for this
    resource? (a request queue building up)
Errors: how many errors has this resource generated?
~~~

The USE method (popularized by Brendan Gregg) complements RED, providing a similarly structured checklist specifically for RESOURCES (CPU, memory, disk, network) rather than request-driven services — both frameworks give engineers a starting checklist rather than needing to invent what to measure from scratch for every new system.

### Service Level Indicators, Objectives, and error budgets

~~~
SLI (Service Level Indicator): the ACTUAL metric being measured
    -- e.g., "percentage of requests completing in under 200ms"
SLO (Service Level Objective): the TARGET for that SLI --
    e.g., "99.9% of requests complete in under 200ms, measured
    over a rolling 30-day window"
Error budget: the ALLOWED amount of SLO violation -- if the SLO
    is 99.9%, the error budget is the remaining 0.1%, representing
    a concrete, spendable allowance for acceptable failures/risk
~~~

SLOs and error budgets (popularized by Google's Site Reliability Engineering practice) translate a raw metric into a meaningful, actionable reliability TARGET and a concrete, quantified amount of acceptable risk — directly informing decisions like "should we prioritize new features or reliability work this sprint" based on whether the error budget is being consumed too quickly.
`,

  "advanced-concepts": `
### Percentile aggregation across multiple instances (the averaging-percentiles fallacy)

~~~
You CANNOT correctly average pre-computed p99 values from
multiple server instances to get an overall p99 -- averaging
percentiles produces a MATHEMATICALLY MEANINGLESS result. Correct
aggregation requires either aggregating the underlying histogram
BUCKETS across instances first (then computing the percentile
from the combined buckets), or using a system specifically
designed for this (Prometheus's histogram_quantile function,
covered in the Prometheus skill, does this correctly).
~~~

This is a genuinely subtle, commonly-mishandled pitfall — a summary metric type (client-side percentile calculation) specifically CANNOT be correctly aggregated across instances this way, which is a major reason histograms (server-side bucketing, correctly aggregatable) are generally preferred over summaries in modern Prometheus-based practice.

### Multi-window, multi-burn-rate alerting for SLOs

~~~
A naive SLO alert (simply "alert if the SLI drops below the SLO
threshold right now") produces either too many false alarms
(brief blips) or too-slow detection (averaged over too long a
window). Multi-burn-rate alerting combines SHORT window alerts
(catching FAST error-budget consumption quickly) with LONG
window alerts (catching SLOWER, sustained degradation), each
with an appropriate burn-rate threshold, providing both fast
detection of severe issues and reduced noise from brief transient blips.
~~~

This is a genuinely sophisticated, widely-adopted production alerting pattern (directly from Google's SRE practice) addressing the fundamental tension between alert sensitivity (catching real problems quickly) and alert specificity (avoiding false alarms from normal, brief fluctuations).

### High-cardinality metrics and exemplars

~~~
Modern observability practice (via OpenTelemetry, covered in its
own skill) increasingly links AGGREGATE metrics to SPECIFIC,
individual trace examples via "exemplars" -- a histogram bucket
can reference a specific trace ID representative of a request
that fell into that bucket, letting an engineer jump directly
from "this latency bucket has a concerning number of slow
requests" to "here's an ACTUAL example trace of one such slow request."
~~~

Exemplars directly bridge metrics' aggregate view with tracing's per-request detail, addressing metrics' core limitation (no per-event context) without abandoning metrics' efficient aggregation, a genuinely valuable modern observability integration pattern.

### Cardinality management strategies

~~~
├── Avoid unbounded label values (raw IDs, timestamps, full URLs
│    with query parameters) as label VALUES entirely
├── Use bucketed/categorical dimensions instead (a status CODE
│    category like "4xx" rather than the exact code; a user TIER
│    rather than a raw user ID)
├── Apply cardinality limits/alerts at the metrics system level,
│    catching a cardinality explosion before it degrades the
│    entire metrics system's performance for everyone
└── Push genuinely high-cardinality investigation needs to logs
     or traces instead, which are architecturally better suited
     to per-entity granularity than aggregate metrics are
~~~

### Recording rules for expensive, frequently-queried aggregations

~~~
# Prometheus recording rules pre-compute expensive queries
# (a complex aggregation run frequently, e.g., every dashboard load)
# and store the RESULT as its own simpler metric, avoiding
# repeatedly re-computing the same expensive query on every access
~~~

Recording rules (covered concretely in the **Prometheus** skill) are a production-scale optimization: rather than computing an expensive aggregation query fresh every single time a dashboard is viewed or an alert is evaluated, pre-compute it periodically and store the result, trading a small amount of storage for significantly reduced query-time computation cost.
`,

  "internal-working": `
What happens internally when a Prometheus-style pull-based metrics system collects and stores data, tracing the scrape-and-store cycle:

~~~mermaid
sequenceDiagram
    participant App as Application (instrumented with a client library)
    participant Endpoint as /metrics HTTP endpoint
    participant Prometheus as Prometheus server
    participant TSDB as Time-series database (storage)

    App->>App: increments counters, records histogram\nobservations as events occur (in-memory)
    Prometheus->>Endpoint: periodically SCRAPES (pulls) the /metrics endpoint
    Endpoint-->>Prometheus: current values of every metric,\nin plain-text exposition format
    Prometheus->>TSDB: stores each metric's value\nwith a timestamp, appended to its time series
    Note over TSDB: Each unique label combination is\nits own separate time series
~~~

1. **The application maintains in-memory counters/gauges/histograms**, updating them synchronously as events occur (an HTTP request completing, for instance) — this is genuinely cheap, since it's just incrementing an in-memory number, not writing to disk or a network call per event.
2. **A metrics server (Prometheus) periodically PULLS (scrapes) the current values** from each monitored application's exposed /metrics endpoint, rather than the application pushing data to the metrics server — this pull-based model is a deliberate Prometheus design choice, covered in depth in the **Prometheus** skill.
3. **Each scrape's values are stored as a new data point** in the appropriate time series (one time series per unique metric-name-plus-label-combination), building up a queryable history over time.

**Why this matters**: understanding that metrics are collected via periodic SAMPLING (a scrape every 15 or 30 seconds, typically) rather than capturing every single event individually explains why metrics can miss extremely brief spikes that occur entirely between two scrape intervals, and why metrics complement (rather than replace) logging's ability to capture every individual event's full detail.
`,

  architecture: `
A senior engineer thinks about metrics architecture across several dimensions: designing metrics with appropriate types and bounded cardinality from the start, structuring SLOs and error budgets to drive meaningful operational decisions, and designing alerting that balances sensitivity against noise.

### The metric type selection framework

~~~mermaid
flowchart TB
    Q1{"What are you\nactually measuring?"}
    Q1 -->|"A count that only\never increases"| Counter["Use a Counter"]
    Q1 -->|"A value that can go\nup or down"| Gauge["Use a Gauge"]
    Q1 -->|"The distribution of\nobserved values\n(especially latency)"| Histogram["Use a Histogram"]
~~~

This framework — matching metric type to the actual measurement need — prevents the common mistake of using a gauge for something that should be a counter (or vice versa), which produces mathematically incorrect or misleading aggregations later.

### Designing SLOs that drive real decisions

~~~mermaid
flowchart LR
    SLI["Choose a meaningful SLI\n(what users actually care about)"] --> SLO["Set an SLO target\n(the acceptable threshold)"]
    SLO --> ErrorBudget["Track the error budget\n(remaining acceptable risk)"]
    ErrorBudget --> Decisions["Drive real decisions:\nfeature velocity vs.\nreliability investment"]
~~~

A senior engineer designs SLOs around what USERS actually experience and care about (not necessarily the easiest thing to measure), and ensures the resulting error budget genuinely informs prioritization decisions — an SLO that's never actually referenced when making engineering tradeoffs provides little real value beyond its existence on a dashboard.

### Structuring alerting to minimize both false alarms and missed incidents

~~~mermaid
flowchart TB
    Alert["An alerting rule"] --> Q{"Balances sensitivity\n(catch real issues fast)\nagainst specificity\n(avoid noise)?"}
    Q -->|"Multi-burn-rate alerting"| Good["Short window: fast detection\nof severe issues.\nLong window: sustained\ndegradation detection."]
    Q -->|"Naive single-threshold alert"| Risk["Either too noisy (false alarms)\nor too slow (misses real issues)"]
~~~

This directly connects to the Advanced Concepts' multi-burn-rate alerting pattern — a senior engineer recognizes that alerting design is a genuine engineering discipline in its own right, not simply "set a threshold and alert when exceeded."
`,

  "data-flow": `
Tracing how a single request's latency observation flows from instrumentation through to an SLO dashboard:

~~~mermaid
sequenceDiagram
    participant Request as An incoming request
    participant App as Application (instrumented)
    participant Histogram as In-memory histogram
    participant Prometheus as Prometheus (scrapes periodically)
    participant Grafana as Grafana dashboard
    participant SLO as SLO calculation

    Request->>App: request begins processing
    App->>App: request completes, duration measured
    App->>Histogram: record observation (e.g., 0.045 seconds)\ninto the appropriate bucket
    Prometheus->>App: scrape /metrics endpoint (every 15s)
    App-->>Prometheus: current histogram bucket counts
    Prometheus->>Prometheus: store as time-series data points
    Grafana->>Prometheus: query for p95 latency over the last hour
    Prometheus-->>Grafana: computed p95 value, rendered as a graph
    SLO->>Prometheus: query: percentage of requests under 200ms\nover the rolling 30-day SLO window
    Prometheus-->>SLO: computed SLI value, compared against the SLO target
~~~

The critical detail: the SAME underlying histogram data serves multiple distinct purposes — real-time dashboard visualization (Grafana), and longer-term SLO tracking (comparing the SLI against its target over a 30-day window) — illustrating how a single, well-designed metric can efficiently support many different downstream observability needs without requiring separate instrumentation for each.
`,

  "production-usage": `
### Instrumenting a production service with RED-method metrics

~~~python
from prometheus_client import Counter, Histogram

request_count = Counter("http_requests_total", "Total requests", ["method", "endpoint", "status"])
request_duration = Histogram("http_request_duration_seconds", "Request duration", ["endpoint"])
error_count = Counter("http_errors_total", "Total errors", ["endpoint", "error_type"])

def handle_request(method, endpoint):
    with request_duration.labels(endpoint=endpoint).time():
        try:
            result = process(method, endpoint)
            request_count.labels(method=method, endpoint=endpoint, status="200").inc()
            return result
        except Exception as e:
            error_count.labels(endpoint=endpoint, error_type=type(e).__name__).inc()
            request_count.labels(method=method, endpoint=endpoint, status="500").inc()
            raise
~~~

### Non-negotiables for production metrics

1. **Choose the correct metric type** (counter, gauge, histogram) for each measurement's actual nature.
2. **Apply the RED method for services, USE method for resources** as a baseline instrumentation checklist.
3. **Never use unbounded/high-cardinality values as labels** (raw user IDs, full URLs, timestamps).
4. **Design SLOs around what users actually experience**, not merely what's convenient to measure.
5. **Use percentiles (p50/p95/p99), never raw averages, for latency reporting.**

### Common production patterns

- **RED-method dashboards** for every request-driven service, providing a consistent, comparable baseline view across an entire organization's services.
- **SLO/error-budget tracking** driving genuine sprint-planning and prioritization decisions between feature work and reliability investment.
- **Multi-burn-rate alerting** balancing fast detection of severe issues against noise from brief, normal fluctuations.
- **Recording rules** pre-computing expensive, frequently-viewed aggregations for dashboard performance.
`,

  "industry-examples": `
- **Prometheus and Grafana** (both covered in their own skills): the dominant open-source metrics collection and visualization stack, standard across the Kubernetes/cloud-native ecosystem.
- **Google's Site Reliability Engineering practice**: the origin and primary popularizer of SLOs, error budgets, and the broader discipline of metrics-driven reliability engineering.
- **Datadog, New Relic**: leading commercial observability platforms providing managed metrics collection, dashboards, and alerting alongside logging and tracing.
- **Every major cloud provider's native metrics service** (AWS CloudWatch Metrics, GCP Cloud Monitoring, Azure Monitor Metrics): providing managed metrics infrastructure integrated with each provider's broader ecosystem.
- **Kubernetes' own resource metrics** (via metrics-server and the Horizontal Pod Autoscaler): directly using CPU/memory gauge metrics to drive automatic scaling decisions, a widely-encountered practical application.
`,

  "best-practices": `
1. **Choose the correct metric type** (counter for monotonic totals, gauge for current values, histogram for distributions) for each specific measurement.
2. **Apply the RED method for request-driven services and the USE method for resources** as a structured, comprehensive instrumentation baseline.
3. **Never use unbounded-cardinality values as labels** — no raw user IDs, IP addresses, or full URLs with query parameters.
4. **Use percentiles, never raw averages, for reporting latency**, since averages hide meaningful tail-latency problems.
5. **Design SLIs and SLOs around genuine user experience**, not merely whatever happens to be easiest to instrument.
6. **Use error budgets to drive real prioritization decisions**, not just as a dashboard number nobody references.
7. **Design multi-window, multi-burn-rate alerting** for SLO-based alerts, balancing fast detection against noise.
8. **Use histograms (not summaries) for latency measurement** in modern Prometheus-based systems, given histograms' correct cross-instance aggregability.
9. **Use recording rules for expensive, frequently-queried aggregations**, avoiding repeated expensive computation.
10. **Link metrics to traces via exemplars where supported**, bridging aggregate signals with per-request detail.
`,

  "anti-patterns": `
### High-cardinality labels causing storage/query cost explosion

~~~python
# WRONG — a raw user ID as a label creates one time series
# PER UNIQUE USER, potentially millions of distinct time series
request_counter.labels(user_id=str(user.id)).inc()

# RIGHT — use a bounded, low-cardinality dimension
request_counter.labels(user_tier=user.tier).inc()
~~~

This is one of the single most common, most damaging metrics anti-patterns — a metrics system's storage and query performance can degrade severely or fail entirely once cardinality grows unbounded, a well-documented, genuinely important operational pitfall.

### Using raw averages for latency instead of percentiles

~~~python
# WRONG — reporting only an average latency, hiding tail behavior
average_latency = total_duration / request_count

# RIGHT — track and report percentiles via a histogram
request_duration_histogram.observe(duration)
-- query later: histogram_quantile(0.95, request_duration_histogram)
~~~

Averages can mask a genuinely severe tail-latency problem affecting a meaningful fraction of users, since a small number of very slow requests barely move an average computed across many fast ones — percentiles reveal this directly.

### Other production-grade anti-patterns

- **Averaging pre-computed percentiles across instances**, a mathematically meaningless operation — aggregate the underlying histogram buckets first instead.
- **Setting SLOs based on convenience rather than genuine user experience**, producing targets that don't actually reflect what matters to users.
- **Naive single-threshold alerting**, producing either excessive false alarms or dangerously slow incident detection.
- **Not distinguishing metrics concerns from logging/tracing concerns**, trying to cram detailed per-event context into a metric's inherently aggregate-only model.
- **Ignoring error budgets once set**, treating SLOs as a one-time dashboard exercise rather than an ongoing input to prioritization decisions.
`,

  performance: `
### Rule zero: manage cardinality proactively, not reactively

Cardinality explosion is metrics' single most common, most severe performance/cost failure mode — proactive label design prevents this far more effectively than reactive cleanup after the fact.

### The performance hierarchy (apply in order)

1. **Design labels with bounded cardinality from the start**, never using unbounded values (raw IDs, full URLs, timestamps) as label values.
2. **Use recording rules for expensive, frequently-queried aggregations**, avoiding repeated expensive computation on every dashboard load or alert evaluation.
3. **Use histograms (server-side bucketing) rather than summaries** for latency, since histograms aggregate correctly across instances.
4. **Set appropriate scrape intervals** — more frequent scraping provides finer time resolution at the cost of more storage and query load; less frequent scraping saves resources but can miss brief spikes.
5. **Monitor the metrics system's own cardinality and performance**, catching a growing cardinality problem before it degrades the entire system for every user.

### Micro-level facts worth knowing

- Each unique label combination creates a genuinely separate time series requiring its own storage and index entry — cardinality directly, multiplicatively affects both storage volume and query performance.
- Pre-aggregation (incrementing an in-memory counter as events occur) is dramatically cheaper than deriving the same aggregate by processing raw events after the fact, which is precisely metrics' core efficiency advantage over log-based aggregation.
- Recording rules trade a small amount of additional storage (for the pre-computed result) for potentially large query-time performance savings on expensive, frequently-accessed aggregations.
`,

  scalability: `
Metrics systems' scalability is directly, multiplicatively bounded by cardinality — the number of unique time series a system must store and index — making cardinality management THE central scalability concern for metrics specifically, distinct from other observability pillars' scaling considerations.

### Why cardinality is metrics' unique scaling challenge

~~~mermaid
flowchart LR
    LowCardinality["Bounded labels\n(a few endpoints, status codes)"] --> Manageable["Manageable number\nof time series"]
    HighCardinality["Unbounded labels\n(raw user IDs, full URLs)"] --> Explosion["Combinatorial explosion\nof time series -- storage\nand query cost scale poorly"]
~~~

Unlike logging (where volume scales primarily with event count) or tracing (where volume scales with request count, typically sampled), metrics' cost scales with the CARDINALITY of label combinations — a metric with 10 endpoints and 5 status codes has 50 time series regardless of how many total requests occur, while the same metric with a raw user ID label could have millions of time series.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Cardinality explosion degrading storage/query performance | Redesign labels to use bounded, categorical dimensions instead of unbounded raw values |
| Expensive, frequently-run aggregation queries | Recording rules pre-computing the result periodically |
| A single metrics server's storage/query capacity exceeded | Federation or sharding across multiple metrics server instances (covered concretely in the **Prometheus** skill) |
| Long-term historical metrics storage cost | Downsampling older data to lower time resolution, retaining full resolution only for recent data |
`,

  security: `
### Metrics endpoint exposure and information disclosure

~~~
A metrics endpoint (/metrics) that's inadvertently exposed
publicly can leak genuinely sensitive operational information
(internal service names, request patterns, error details) to
anyone who can reach it -- metrics endpoints should be
appropriately access-controlled, not exposed to the public internet.
~~~

### Essential metrics-related security practices

1. **Restrict access to metrics endpoints** (/metrics) to internal monitoring infrastructure only, never exposing them publicly.
2. **Avoid including sensitive information in metric labels or values**, treating labels with the same sensitivity discipline as log fields.
3. **Be aware that metrics can reveal usage patterns** that might be sensitive in aggregate (revealing, for instance, when a specific rarely-used feature is accessed, potentially deanonymizing a small user population).
4. **Apply appropriate authentication/network isolation** for the metrics collection infrastructure itself (Prometheus, Grafana), consistent with the general infrastructure security practices covered in the **Linux** and **Networking** skills.

See the **OWASP Top 10** skill for the broader web application security context this connects to.
`,

  testing: `
### Testing metric instrumentation

~~~python
from prometheus_client import REGISTRY

def test_request_counter_increments_on_success():
    initial_value = REGISTRY.get_sample_value(
        "http_requests_total", {"method": "GET", "endpoint": "/api/users", "status": "200"}
    ) or 0
    handle_request("GET", "/api/users")
    new_value = REGISTRY.get_sample_value(
        "http_requests_total", {"method": "GET", "endpoint": "/api/users", "status": "200"}
    )
    assert new_value == initial_value + 1

def test_error_counter_increments_on_failure():
    -- simulate a failure and verify the error counter, not just
    -- the general request counter, correctly increments
    ...
~~~

### Testing cardinality bounds

~~~python
def test_metric_labels_have_bounded_cardinality():
    -- verify a metric's labels are drawn from a genuinely
    -- bounded, known set of values, not an unbounded source
    -- (like a raw user ID) that would risk cardinality explosion
    for label_value in get_all_possible_label_values("user_tier"):
        assert label_value in ["free", "pro", "enterprise"]   -- a bounded, known set
~~~

### The senior testing doctrine

- Test that metrics correctly increment/update in response to the specific events they're meant to track, not just that instrumentation code runs without error.
- Test cardinality bounds explicitly for any label whose value source might be genuinely unbounded, catching a potential cardinality explosion before production deployment.
- Test SLO calculation logic explicitly, verifying the SLI computation and error budget math produce correct results for known input scenarios.
- Test alerting rule logic (where feasible) against simulated metric data representing both normal and degraded conditions.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check the metrics dashboard first** (Grafana, or your organization's equivalent) for the relevant service's RED-method metrics, getting an immediate aggregate picture of the situation.
2. **Drill into specific label combinations** to narrow down whether an issue is isolated to a specific endpoint, status code, or other dimension.
3. **Cross-reference with logs** for detailed, per-event context once metrics have narrowed down WHERE and roughly WHEN an issue is occurring.
4. **Check for cardinality issues** if the metrics system itself seems slow or is missing expected data, a signal of a cardinality explosion affecting the entire system.
5. **Verify scrape/collection health** if metrics data seems to have unexpected gaps, checking whether the metrics collection pipeline itself is functioning correctly.

### Debugging common metrics-specific symptoms

- "My error rate dashboard shows a spike but I don't know why" — drill into label combinations (which endpoint, which error type) to narrow down the specific cause, then cross-reference with logs for detailed context.
- "My metrics system has become slow or is dropping data" — suspect a cardinality explosion; check for a recently-introduced label with unbounded values.
- "My average latency looks fine but users are reporting slowness" — check percentiles (p95, p99) specifically, since averages can mask a real tail-latency problem.
- "My alert didn't fire despite a clear problem" — verify the alerting rule's threshold and time window are appropriately calibrated, and check for a possible metrics collection gap during the incident.
`,

  monitoring: `
### Key signals to track

- **RED metrics for every request-driven service**: rate, errors, duration (as a distribution, not just an average).
- **USE metrics for every significant resource**: utilization, saturation, errors.
- **The metrics system's own health**: cardinality growth, scrape success rate, query latency.
- **SLO/error budget consumption rate**, directly informing whether current reliability investment is adequate.

### Tools

Prometheus and Grafana (both covered in their own skills) as the dominant open-source metrics collection and visualization stack; commercial platforms (Datadog, New Relic) providing managed alternatives; cloud-provider-native metrics services for cloud-specific infrastructure.

### Alerting priorities

Alert on SLO error-budget burn rate (using multi-window, multi-burn-rate alerting to balance fast detection against noise), on cardinality growth in the metrics system itself (an early warning of an impending performance problem), and on the RED/USE method's core signals for each critical service/resource.
`,

  deployment: `
### Instrumenting a service for metrics collection at deployment

~~~python
from prometheus_client import start_http_server

if __name__ == "__main__":
    start_http_server(8000)   -- exposes /metrics on port 8000 for Prometheus to scrape
    run_application()
~~~

Production deployments expose a /metrics endpoint (in the Prometheus text exposition format) that a metrics server periodically scrapes — this endpoint should be network-isolated from public access while remaining reachable by internal monitoring infrastructure.

### CI/CD pipeline considerations

Automated tests verifying metric instrumentation correctness (counters incrementing as expected) and cardinality bounds as part of CI, catching instrumentation regressions before they reach production. See the **CI/CD** and **Prometheus** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production metrics setup is considered complete:

- [ ] Correct metric types (counter, gauge, histogram) used for each measurement's actual nature
- [ ] RED-method metrics implemented for every request-driven service; USE-method metrics for critical resources
- [ ] No unbounded-cardinality labels (raw user IDs, full URLs, timestamps) used anywhere
- [ ] Percentile-based latency reporting (p50/p95/p99) used instead of raw averages
- [ ] SLIs and SLOs defined around genuine user experience, with error budgets actively informing prioritization
- [ ] Multi-window, multi-burn-rate alerting configured for SLO-based alerts
- [ ] Metrics endpoints appropriately access-controlled, not exposed publicly
- [ ] Recording rules configured for expensive, frequently-queried aggregations
- [ ] Metrics system's own health (cardinality, scrape success rate) monitored
- [ ] Dashboard views established for at-a-glance service health assessment
`,

  "common-mistakes": `
1. **Using unbounded/high-cardinality values as labels**, causing severe storage and query cost explosion.
2. **Reporting only average latency**, hiding genuinely severe tail-latency problems that percentiles would reveal.
3. **Averaging pre-computed percentiles across instances**, a mathematically meaningless operation.
4. **Choosing the wrong metric type** (a gauge for a monotonic total, or vice versa), producing incorrect aggregations.
5. **Setting SLOs based on convenience rather than genuine user experience.**
6. **Naive single-threshold alerting**, causing either excessive false alarms or dangerously slow detection.
7. **Ignoring error budgets once established**, treating SLOs as a one-time exercise rather than an ongoing operational input.
8. **Not applying the RED/USE methods as a baseline instrumentation checklist**, leaving genuine gaps in coverage.
9. **Exposing metrics endpoints publicly**, risking information disclosure.
10. **Confusing a metrics need with a logging or tracing need**, trying to cram detailed per-event context into an inherently aggregate-only signal.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Metrics system slow or dropping data | Cardinality explosion from an unbounded label | Identify and fix the offending label, redesigning it to use bounded values |
| Latency dashboard looks fine but users report slowness | Reporting average instead of percentile latency, masking tail-latency issues | Switch to percentile-based (p95/p99) latency reporting |
| A cross-instance aggregated percentile looks wrong | Incorrectly averaging pre-computed percentiles rather than aggregating underlying histogram buckets | Use histogram-based aggregation (histogram_quantile in Prometheus) instead |
| Alert didn't fire during an actual incident | Threshold or time window miscalibrated, or a metrics collection gap during the incident | Review and recalibrate the alerting rule; verify collection pipeline health |
| Alert fires too frequently for minor, transient blips | Naive single-window, single-threshold alerting | Implement multi-window, multi-burn-rate alerting |
| Dashboard queries loading slowly | An expensive aggregation query recomputed on every load | Implement a recording rule pre-computing the result periodically |
| Metric shows unexpected/incorrect values | Wrong metric type chosen for the measurement (e.g., a gauge used where a counter was needed) | Verify the metric type matches the actual nature of what's being measured |
`,

  faqs: `
**What are the four fundamental metric types?**
Counter (a monotonically increasing value), gauge (a value that can go up or down), histogram (tracks a distribution of observed values via configurable buckets), and summary (similar to a histogram but calculates percentiles client-side, generally less preferred in modern practice due to aggregation limitations).

**Why shouldn't I just report average latency?**
Because averages hide tail-latency problems — a small number of very slow requests can be almost invisible in an average computed across many fast ones, while percentiles (p95, p99) directly reveal how the slowest fraction of requests are actually performing.

**What is cardinality, and why does it matter?**
The number of distinct label-value combinations a metric can produce — every unique combination creates a separate time series requiring its own storage and index entry, so labels with unbounded or very high cardinality (a raw user ID, for instance) can cause a metrics system's storage and query cost to explode combinatorially.

**What is the RED method?**
A structured checklist (Rate, Errors, Duration) for what to measure in any request-driven service, providing a strong, broadly-applicable baseline instrumentation approach.

**What is an SLO, and how does it relate to an error budget?**
An SLO (Service Level Objective) is a target for a Service Level Indicator (SLI, the actual measured metric) — for example, "99.9% of requests complete in under 200ms"; the error budget is the remaining allowed margin (0.1% in this example), representing a concrete, spendable allowance for acceptable failures that can inform prioritization decisions between feature work and reliability investment.

**Why can't I just average percentiles from multiple server instances?**
Because averaging pre-computed percentiles is mathematically meaningless — correct cross-instance aggregation requires combining the underlying histogram buckets first, then computing the percentile from the combined data, which is precisely why histograms (not summaries) are generally preferred in modern, multi-instance production systems.
`,

  "interview-questions": `
### Junior level

1. **What is the difference between a counter and a gauge?**
   Model answer: a counter only ever increases (or resets to zero on restart), tracking a monotonic total; a gauge can go both up and down, representing a current, point-in-time value.

2. **Why are percentiles preferred over averages for latency reporting?**
   Model answer: averages can hide tail-latency problems, since a small number of very slow requests barely move an average computed across many fast ones; percentiles (p95, p99) directly reveal how the slowest fraction of requests actually perform.

3. **What is cardinality in the context of metrics?**
   Model answer: the number of distinct label-value combinations a metric can produce — each unique combination creates a separate, separately-stored time series.

4. **What does the RED method stand for?**
   Model answer: Rate, Errors, Duration — a structured checklist for what to measure in any request-driven service.

5. **What is an SLO?**
   Model answer: a Service Level Objective, a target for a Service Level Indicator (the actual measured metric), such as "99.9% of requests complete successfully."

### Senior level

6. **Why is using a raw user ID as a metric label a serious anti-pattern?**
   Model answer: it creates one distinct time series per unique user, causing cardinality to grow combinatorially with the number of users — at any meaningful user count, this can cause the metrics system's storage and query performance to degrade severely or fail outright, since each additional user adds an entirely new time series requiring its own storage and index entry, rather than simply adding data points to an existing, bounded set of series.

7. **Explain why you cannot correctly average pre-computed percentile values from multiple server instances, and what the correct approach is instead.**
   Model answer: a percentile is a non-linear statistic computed from an underlying distribution — averaging two already-computed p99 values from different instances doesn't produce the actual p99 of the combined dataset, since it ignores the actual shape of each instance's underlying distribution; the correct approach is to aggregate the underlying HISTOGRAM BUCKET counts across instances first (summing counts in corresponding buckets), then compute the percentile from that combined bucket data — which is precisely why histograms (with server-side bucketing) are preferred over summaries (which only expose client-side-computed percentiles) in modern multi-instance production systems.

8. **Design a multi-window, multi-burn-rate alerting strategy for an SLO, and explain why a naive single-threshold alert is insufficient.**
   Model answer: a naive alert ("fire if the SLI drops below the SLO threshold right now") either produces excessive false alarms from brief, normal fluctuations (if evaluated over a short window) or detects genuine sustained problems too slowly (if evaluated over a long window); a multi-window, multi-burn-rate approach combines a SHORT window with a high burn-rate threshold (catching severe, fast-developing issues quickly) alongside a LONGER window with a lower burn-rate threshold (catching slower, sustained degradation that a short window might dismiss as noise), providing both fast detection of serious problems and reduced false-alarm noise from normal variance.

9. **How would you design SLIs and SLOs for a system serving both interactive user requests and background batch jobs?**
   Model answer: define SEPARATE SLIs/SLOs for each workload type given their genuinely different user-experience expectations — interactive requests likely need a latency-focused SLO (e.g., 99% of requests under 200ms) reflecting users' direct, immediate experience, while batch jobs likely need a completion-time or success-rate SLO (e.g., 99.9% of jobs complete successfully within their scheduled window) reflecting a fundamentally different reliability concern; applying one uniform SLO across both would either be too lenient for interactive requests or unnecessarily strict for batch jobs whose actual user-facing timing tolerance is genuinely different.

10. **Explain the relationship between error budgets and engineering prioritization decisions in SRE practice.**
    Model answer: an SLO's error budget represents the total acceptable amount of unreliability over a given period; tracking how quickly that budget is being consumed provides an objective, shared signal for prioritization — if the error budget is being consumed faster than sustainable, the team should prioritize reliability work over new features; if the error budget has substantial remaining headroom, the team has objective justification for taking on more feature-velocity risk (deploying more frequently, for instance) — this transforms an abstract reliability target into a concrete, actionable operational policy rather than a passive dashboard number.

11. **Why might using a summary metric type instead of a histogram be a mistake in a horizontally-scaled service?**
    Model answer: a summary calculates percentiles CLIENT-SIDE, on each individual instance, meaning you get a p99 PER INSTANCE but no correct way to combine those into an overall p99 across all instances (the averaging-percentiles fallacy applies here too); a histogram instead exposes raw bucket counts, which CAN be correctly summed across instances before computing an overall percentile, making histograms the architecturally correct choice for any service running as multiple horizontally-scaled instances, which describes the overwhelming majority of modern production services.

12. **Design a metrics strategy for monitoring an AI application's LLM API usage, considering cost and latency.**
    Model answer: track token usage as a counter (labeled by model and endpoint, but NOT by raw user ID, to avoid cardinality explosion), track API call latency as a histogram (enabling percentile-based analysis of response time distribution, since LLM latency can vary significantly by request complexity), track a gauge for current in-flight/concurrent API requests (useful for understanding load and potential rate-limit risk), and define an SLO around end-to-end response latency reflecting actual user-facing experience — directly connecting to this platform's AI-specific production monitoring needs while applying the same fundamental metric-type-selection and cardinality-management discipline covered throughout this page.
`,

  "coding-questions": `
### 1. Implement RED-method instrumentation for an HTTP handler

~~~python
from prometheus_client import Counter, Histogram
import time

requests_total = Counter("requests_total", "Total requests", ["endpoint", "status"])
request_duration = Histogram("request_duration_seconds", "Request duration", ["endpoint"])
errors_total = Counter("errors_total", "Total errors", ["endpoint", "error_type"])

def instrumented_handler(endpoint, handler_function):
    start = time.time()
    try:
        result = handler_function()
        requests_total.labels(endpoint=endpoint, status="success").inc()
        return result
    except Exception as e:
        errors_total.labels(endpoint=endpoint, error_type=type(e).__name__).inc()
        requests_total.labels(endpoint=endpoint, status="error").inc()
        raise
    finally:
        request_duration.labels(endpoint=endpoint).observe(time.time() - start)
# Follow-up: why is the duration observation placed in a "finally"
# block rather than only after the successful return, and what
# would be lost if it were only recorded on success?
~~~

### 2. Implement error budget calculation from raw metrics

~~~python
def calculate_error_budget_remaining(total_requests, failed_requests, slo_target=0.999):
    actual_success_rate = (total_requests - failed_requests) / total_requests
    allowed_failure_rate = 1 - slo_target
    actual_failure_rate = failed_requests / total_requests
    budget_consumed_fraction = actual_failure_rate / allowed_failure_rate
    return max(0, 1 - budget_consumed_fraction)
# Follow-up: if budget_consumed_fraction exceeds 1.0 (meaning the
# actual failure rate has exceeded the SLO's allowed failure rate),
# what does that mean operationally, and why does the function
# clamp the result to a minimum of 0 rather than returning a
# negative "remaining budget"?
~~~

### 3. Implement a bounded-cardinality label sanitizer

~~~python
ALLOWED_STATUS_CATEGORIES = {"2xx", "3xx", "4xx", "5xx"}

def categorize_status_code(status_code):
    category = str(status_code)[0] + "xx"
    return category if category in ALLOWED_STATUS_CATEGORIES else "unknown"

def safe_label_value(value, allowed_values, default="other"):
    return value if value in allowed_values else default
# Follow-up: why does bucketing a raw status code (200, 201, 404,
# 500, and so on) into just four categories (2xx, 3xx, 4xx, 5xx)
# dramatically reduce cardinality risk compared to using the exact
# status code as a label directly, and what diagnostic detail is
# genuinely lost by this bucketing (and where should that detail
# be recovered from instead)?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Instrument a service with the four metric types
Build a small application instrumenting a counter, a gauge, a histogram, and (for comparison) a summary, demonstrating each type's correct usage and observing their behavior under simulated load. Deliverable: a working instrumented application with all four metric types. Skills exercised: metric type selection and implementation.

### Lab 2 (Intermediate): Apply the RED method and diagnose a cardinality problem
Instrument a service following the RED method, then deliberately introduce a high-cardinality label (a raw user ID), observe the resulting performance/storage degradation, and fix it by redesigning the label. Deliverable: a before/after demonstration of cardinality management. Skills exercised: RED-method instrumentation, cardinality diagnosis and mitigation.

### Lab 3 (Advanced): Design and calculate an SLO with error budget tracking
Given a simulated stream of request success/failure data, implement SLI calculation, SLO comparison, and error budget tracking, producing a report indicating whether the error budget is being consumed sustainably. Deliverable: a working SLO/error-budget calculation and reporting tool. Skills exercised: SLO design, error budget calculation.

### Lab 4 (Production): Implement multi-window, multi-burn-rate alerting logic
Given simulated time-series metric data representing both a brief transient blip and a sustained degradation, implement alerting logic distinguishing the two correctly (alerting on the sustained issue, not the brief blip), using a multi-window approach. Deliverable: a working alerting logic implementation with test cases for both scenarios. Skills exercised: alerting design, burn-rate calculation.
`,

  "real-projects": `
### 1. A comprehensive RED/USE-method monitoring setup for a microservices architecture
Engineering requirements: consistent RED-method metrics across every request-driven service and USE-method metrics for shared infrastructure resources (databases, message queues), with organization-wide labeling conventions ensuring cross-service comparability and bounded cardinality throughout.

### 2. An SLO-driven reliability program
Engineering requirements: defined SLIs/SLOs for each critical user-facing service reflecting genuine user experience, automated error-budget tracking integrated into sprint planning, and multi-burn-rate alerting configured for each SLO, directly informing the organization's actual reliability-versus-feature-velocity tradeoff decisions.

### 3. A cost and latency monitoring system for LLM API usage
Engineering requirements: token usage counters (bounded by model/endpoint, not raw user ID), latency histograms enabling percentile-based analysis of LLM response times, and an SLO reflecting acceptable end-to-end AI application response latency, directly connecting to this platform's broader AI application production monitoring needs.
`,

  "case-studies": `
### Google's SRE practice popularizing SLOs and error budgets
Google's Site Reliability Engineering book (2016) and subsequent widely-adopted practice around SLOs and error budgets transformed reliability from a vague, subjective aspiration ("we should be more reliable") into a concrete, quantified, and genuinely actionable operational discipline — directly informing real prioritization decisions between feature velocity and reliability investment across the industry. Lesson: translating a qualitative goal into a precise, quantified, and consistently-tracked metric can fundamentally change how an organization actually makes decisions, not merely how it reports on outcomes after the fact.

### Prometheus's label-based dimensional model displacing hierarchical naming
Prometheus's design choice to use flexible, multi-dimensional LABELS (rather than Graphite's earlier, more rigid hierarchical metric naming scheme, like servers.web01.requests.count) directly addressed a genuine limitation: hierarchical naming requires deciding the exact dimensional structure upfront, while labels let engineers slice and filter along ANY combination of dimensions after the fact without needing to have anticipated every possible query shape in advance. Lesson: a more flexible underlying data model (labels versus rigid hierarchy) can provide substantial, compounding value over time as an organization's actual query needs evolve in ways the original metric design couldn't have fully anticipated.

### The averaging-percentiles fallacy as a recurring, widely-taught cautionary example
The mathematical error of averaging pre-computed percentile values across multiple instances — genuinely, provably incorrect, yet a mistake made repeatedly across the industry by engineers unfamiliar with the underlying statistics — has become a widely-cited, commonly-taught cautionary example in observability education specifically because it's simultaneously subtle (the error isn't visually obvious) and consequential (it produces a genuinely wrong, misleading result that can mask real production problems). Lesson: statistical subtleties in observability tooling (percentile aggregation, in this case) can be genuinely non-obvious even to experienced engineers, making this specific kind of "this pattern looks reasonable but is mathematically wrong" knowledge a valuable, durable piece of learned expertise.
`,

  comparisons: `
| Aspect | Counter | Gauge | Histogram | Summary |
|--------|---------|-------|-----------|---------|
| Direction | Only increases (or resets) | Up or down | N/A (bucketed observations) | N/A (bucketed observations) |
| Best fit | Totals: requests, errors | Current state: memory, queue depth | Distributions: latency, size | Distributions (client-side percentiles) |
| Cross-instance aggregation | Simple sum | Simple sum/average | Correct (sum bucket counts, then compute percentile) | INCORRECT to average percentiles directly |
| Modern preference | Standard | Standard | Generally preferred over summary | Generally avoided in multi-instance systems |

| Aspect | Logging | Metrics | Tracing |
|--------|---------|---------|---------|
| Data shape | Per-event, detailed | Pre-aggregated, numerical | Per-request, span-based timing |
| Query cost at scale | Higher (must process events) | Lower (pre-aggregated) | Moderate (typically sampled) |
| Best fit | Detailed diagnostic investigation | Dashboards, alerting, SLOs | Cross-service request timing |

**How seniors choose**: use counters for monotonic totals, gauges for current state, histograms (not summaries) for distributions in any multi-instance system; use metrics generally for efficient aggregate signals (dashboards, alerting, SLOs), reserving logging for detailed per-event investigation and tracing for cross-service timing breakdowns.
`,

  "related-technologies": `
- **Logging** and **Tracing** — the two complementary observability pillars covered alongside this skill, together forming the "three pillars of observability."
- **Prometheus** — the dominant concrete implementation of this page's metric type and collection theory, covered in its own skill.
- **Grafana** — the dominant visualization layer atop Prometheus and similar metrics sources, covered in its own skill.
- **OpenTelemetry** — the vendor-neutral standard unifying metrics instrumentation alongside logging and tracing, covered in its own skill.
- **Kubernetes** — uses gauge-style resource metrics (CPU, memory) directly to drive automatic scaling decisions.

Learning path: **Logging** → this page → **Tracing** for the complementary pillars → **Prometheus** for concrete metrics tooling → **Grafana** for visualization → **OpenTelemetry** for the unifying standard.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Prometheus and Grafana remain the dominant open-source metrics stack, with continued strong adoption across Kubernetes-based and broader cloud-native infrastructure.
- SLOs and error budgets continue to be mainstream industry practice for translating raw metrics into actionable reliability targets, with growing tooling support for automated error-budget-based alerting.
- Continued growth of OpenTelemetry's unified metrics instrumentation, increasingly linking metrics to distributed traces via exemplars.
- Growing application of metrics-driven monitoring specifically to AI/LLM application infrastructure (token usage, inference latency, cost tracking) as a distinct, growing production monitoring need.
`,

  "future-roadmap": `
Where metrics practice is heading, and what's worth betting career time on:

- **Continued dominance of the Prometheus/Grafana ecosystem** for open-source metrics collection and visualization, alongside continued growth of managed commercial alternatives.
- **Continued mainstreaming of SLO/error-budget-driven operational practice**, likely becoming an even more standard, expected part of production engineering discipline industry-wide.
- **Growing integration between metrics and traces via exemplars**, further bridging metrics' aggregate efficiency with tracing's per-request diagnostic depth.
- **What to bet on**: deeply understanding metric type selection, cardinality management, and the SLO/error-budget framework — these transfer directly across any specific metrics tool or vendor's platform, a far more durable investment than familiarity with any single tool's specific query syntax.
`,

  "cheat-sheet": `
~~~python
# ---- The four metric types ----
Counter("requests_total", "...", ["endpoint"]).labels(endpoint="/api").inc()   # only increases
Gauge("active_connections", "...").inc()   # up or down, current state
Histogram("duration_seconds", "...", ["endpoint"]).labels(endpoint="/api").observe(0.045)   # distributions

# ---- Metric type selection ----
Monotonic total (requests, errors)   -> Counter
Current, fluctuating value (queue depth, memory) -> Gauge
Distribution (latency, size)         -> Histogram (NOT Summary in multi-instance systems)
~~~

~~~
# ---- CRITICAL: percentiles, never averages, for latency ----
# Average can hide a severe tail-latency problem entirely.
# p50 = median. p95, p99 = the slowest fraction -- what users actually feel.

# ---- CRITICAL: cardinality management ----
# Every UNIQUE label combination = a SEPARATE time series
# WRONG: labels(user_id=raw_id)   -- millions of time series
# RIGHT: labels(user_tier=tier)   -- a handful of time series

# ---- NEVER average pre-computed percentiles across instances ----
# Mathematically meaningless. Aggregate the underlying HISTOGRAM BUCKETS first.
# This is WHY histograms > summaries in any multi-instance system.
~~~

~~~
# ---- RED method: for request-driven services ----
Rate:     requests per second
Errors:   how many are failing
Duration: distribution (percentiles!), not just an average

# ---- USE method: for resources ----
Utilization: % of capacity currently used
Saturation:  how much extra work is QUEUED
Errors:      errors generated by this resource

# ---- SLO / Error Budget ----
SLI  = the actual measured metric  (e.g., % requests < 200ms)
SLO  = the target for that SLI     (e.g., 99.9%)
Error budget = the remaining allowed margin (0.1%) -- drives real prioritization

# ---- Alerting: avoid naive single-threshold rules ----
# Multi-window, multi-burn-rate: short window (fast detection of severe issues)
# + long window (sustained degradation) -- balances speed against noise
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Counter vs gauge? | Counter: only increases. Gauge: goes up or down, a current value. |
| Why prefer histograms over summaries? | Histograms aggregate CORRECTLY across instances; summaries (client-side %ile) don't. |
| Why do averages mislead for latency? | A few very slow requests barely move an average -- percentiles reveal the real tail. |
| What is cardinality? | The number of distinct label-value combinations -- each is a SEPARATE time series. |
| #1 cardinality anti-pattern? | A raw user ID (or any unbounded value) as a label -- combinatorial storage explosion. |
| The RED method? | Rate, Errors, Duration -- a baseline checklist for request-driven services. |
| The USE method? | Utilization, Saturation, Errors -- a baseline checklist for resources. |
| SLI vs SLO vs error budget? | SLI = the measured metric. SLO = its target. Error budget = the remaining allowed margin. |
| Why can't you average pre-computed percentiles? | Mathematically meaningless -- aggregate the underlying histogram buckets first instead. |
| Why is naive single-threshold alerting risky? | Either too noisy (false alarms) or too slow (misses real sustained issues). |
| Fix for naive alerting? | Multi-window, multi-burn-rate alerting -- fast detection AND reduced noise. |
| Metrics vs logging -- which for an aggregate error rate? | Metrics -- pre-aggregated counters are far cheaper than parsing log lines. |
`,

  mcqs: `
1. What is the key difference between a counter and a gauge metric?
   A) They are identical  B) A counter only increases (or resets); a gauge can go up or down  C) Gauges are always faster  D) Counters can't have labels
   **Answer: B** — counters track monotonic totals; gauges track current, fluctuating state.

2. Why are percentiles generally preferred over averages for latency reporting?
   A) Percentiles are easier to compute  B) Averages can hide tail-latency problems that a small fraction of slow requests would reveal  C) Averages require more storage  D) Percentiles don't need histograms
   **Answer: B** — a small number of very slow requests barely shift an average computed across many fast ones.

3. What happens when a metric label uses an unbounded value like a raw user ID?
   A) Nothing, it works fine at any scale  B) It creates one distinct time series per unique value, potentially causing severe cardinality-driven storage/query cost explosion  C) It makes the metric faster to query  D) It's automatically bucketed by the metrics system
   **Answer: B** — this is one of the most common, damaging metrics anti-patterns.

4. Why is it mathematically incorrect to average pre-computed p99 values from multiple server instances?
   A) It's actually correct  B) Percentiles are non-linear statistics; averaging them ignores each instance's actual underlying distribution shape, producing a meaningless result  C) p99 values can't be numbers  D) Averaging always requires exactly two values
   **Answer: B** — correct aggregation requires combining the underlying histogram buckets first.

5. What does the RED method recommend measuring for a request-driven service?
   A) Redundancy, Efficiency, Durability  B) Rate, Errors, Duration  C) Reliability, Elasticity, Deployment  D) Requests, Endpoints, Databases
   **Answer: B** — a structured, memorable baseline checklist for service-level metrics.

6. What is an error budget?
   A) A financial budget for fixing bugs  B) The remaining allowed margin of unreliability under an SLO, used to inform prioritization decisions  C) A limit on how many errors can be logged  D) A type of alerting rule
   **Answer: B** — translates an SLO into a concrete, actionable operational policy.
`,

  "revision-notes": `
Metrics are numerical measurements of system behavior aggregated over time, the second of the three observability pillars (alongside **Logging** and **Tracing**) — pre-aggregated storage (incrementing counters/updating histograms in real time as events occur) is precisely what makes metrics dramatically cheaper to store and query than deriving equivalent aggregate signals from raw logs. The FOUR FUNDAMENTAL METRIC TYPES each serve a distinct measurement need: COUNTER (monotonically increasing, for totals like request/error counts), GAUGE (can go up or down, for current state like memory usage or queue depth), HISTOGRAM (tracks a distribution via configurable buckets, ideal for latency), and SUMMARY (client-side percentile calculation, generally less preferred than histograms in modern multi-instance systems due to aggregation limitations).

A CRITICAL, frequently-tested insight: AVERAGES MISLEAD FOR LATENCY, since a small number of very slow requests barely shift an average computed across many fast ones, completely masking a genuinely severe tail-latency problem — PERCENTILES (p50/median, p95, p99) directly reveal this tail behavior, which is precisely why production latency monitoring almost universally reports percentiles rather than averages. An equally critical, subtler pitfall: you CANNOT correctly average pre-computed percentile values across multiple server instances — this is a mathematically meaningless operation, since percentiles are non-linear statistics that ignore each instance's actual underlying distribution shape when naively averaged; correct cross-instance aggregation requires summing the underlying HISTOGRAM BUCKET counts first, then computing the percentile from the combined data — precisely why histograms (server-side bucketing, correctly aggregatable) are preferred over summaries in modern, horizontally-scaled production systems.

CARDINALITY — the number of distinct label-value combinations a metric can produce — is metrics' single most important, easily-overlooked cost and scalability concern: every unique combination creates a genuinely SEPARATE time series requiring its own storage and index entry, meaning an unbounded label (a raw user ID, a full URL, a timestamp) can cause combinatorial storage and query cost explosion at any meaningful scale. The fix is designing labels around bounded, categorical dimensions (a user TIER rather than a raw user ID; a status code CATEGORY like "4xx" rather than the exact code) from the start, rather than reactively cleaning up a cardinality problem after it degrades the entire metrics system's performance.

The RED METHOD (Rate, Errors, Duration) provides a structured, memorable baseline checklist for what to measure in any request-driven SERVICE; the USE METHOD (Utilization, Saturation, Errors) provides the complementary checklist for RESOURCES (CPU, memory, disk). Together they give engineers a starting point rather than needing to invent instrumentation coverage from scratch for every new system.

SLIs (Service Level Indicators, the actual measured metric), SLOs (Service Level Objectives, the target for that SLI), and ERROR BUDGETS (the remaining allowed margin of unreliability under the SLO) — popularized by Google's Site Reliability Engineering practice — translate raw metrics into a meaningful, actionable reliability target and a concrete, quantified amount of acceptable risk, directly informing genuine operational decisions like whether to prioritize new feature work or reliability investment in a given period. A naive, single-threshold alert ("fire if the SLI drops below target right now") produces either excessive false alarms (evaluated over too short a window) or dangerously slow detection (evaluated over too long a window) — MULTI-WINDOW, MULTI-BURN-RATE ALERTING addresses this by combining a short window with a high burn-rate threshold (catching severe, fast-developing issues quickly) alongside a longer window with a lower threshold (catching slower, sustained degradation without excessive noise from brief, normal fluctuations).

A senior engineer designs SLIs/SLOs around what USERS actually experience (not merely what's convenient to instrument), applies the RED/USE methods as a comprehensive baseline, proactively manages cardinality from the initial label design rather than reactively, and ensures error budgets genuinely inform prioritization decisions rather than existing as a passive, unreferenced dashboard number. Modern practice increasingly links aggregate metrics directly to individual trace examples via "exemplars" (standardized through OpenTelemetry, covered in its own skill), bridging metrics' efficient aggregate view with tracing's detailed per-request context — directly addressing metrics' core limitation (no per-event detail) without abandoning its fundamental efficiency advantage.
`,

  "learning-roadmap": `
**Week 1 — Metric types and basic instrumentation**: counters, gauges, and histograms, choosing the correct type for a given measurement. Milestone: instrument a small application with all four metric types (Lab 1).

**Week 2 — The RED and USE methods**: applying structured instrumentation checklists to services and resources. Milestone: apply the RED method to a service and deliberately introduce/fix a cardinality problem (Lab 2).

**Week 3 — Percentiles and correct aggregation**: understanding why averages mislead, and the correct approach to cross-instance percentile aggregation. Milestone: demonstrate the averaging-percentiles fallacy concretely and show the correct histogram-based fix.

**Week 4 — SLIs, SLOs, and error budgets**: designing meaningful reliability targets and calculating error budget consumption. Milestone: implement SLO/error-budget calculation and reporting for simulated data (Lab 3).

**Week 5 — Alerting design**: building multi-window, multi-burn-rate alerting logic distinguishing transient blips from sustained degradation. Milestone: implement and test alerting logic against both scenarios (Lab 4).

**Week 6 — Connecting to the broader observability landscape**: understanding metrics' relationship to logging and tracing, and previewing Prometheus/Grafana as concrete tooling. Milestone: for five hypothetical monitoring scenarios, correctly justify which of the three observability pillars best fits each.

Next platform skill once this roadmap is complete: **Tracing** for the complementary cross-service timing pillar, or **Prometheus** for the concrete, production-scale implementation of this page's principles.
`,

  "official-docs": `
- **Prometheus's official documentation on metric types** (prometheus.io/docs/concepts/metric_types) — the authoritative, practical reference for counter/gauge/histogram/summary semantics.
- **Google's Site Reliability Engineering book** (freely available online, sre.google/books) — the primary, foundational source for SLOs and error-budget practice.
- **OpenTelemetry's official metrics specification** — the current standard for metrics instrumentation unified with logging/tracing.
`,

  books: `
- **"Site Reliability Engineering" — Google** — the foundational text on SLOs, error budgets, and metrics-driven reliability practice.
- **"The Site Reliability Workbook" — Google** — practical, hands-on guidance implementing the concepts from the original SRE book.
- **"Observability Engineering" — Charity Majors, Liz Fong-Jones, George Miranda** — a comprehensive, modern treatment of metrics alongside logging and tracing.
- **"Prometheus: Up and Running" — Brian Brazil** — a practical, comprehensive guide to metrics instrumentation and Prometheus specifically, covered in depth in the **Prometheus** skill.
`,

  blogs: `
- **The Prometheus project's own blog and documentation** — practical guidance on metric design and cardinality management.
- **Grafana Labs's engineering blog** — extensive writing on dashboards, alerting, and the broader observability practice.
- **Tom Wilkie's writing on the RED method** and **Brendan Gregg's writing on the USE method** — the original sources popularizing these two structured measurement frameworks.
`,

  "research-papers": `
Metrics practice, as an industry/SRE-driven discipline rather than pure academic research, has limited dedicated peer-reviewed literature; the most relevant related sources:

- **Google's original Borgmon paper/internal documentation** (referenced in the SRE book) — the internal system that directly inspired Prometheus's design.
- General time-series database and statistics literature on percentile estimation and aggregation provides theoretical grounding for the correct-aggregation concerns covered in this page's Advanced Concepts.
`,

  videos: `
- **Rob Ewaschuk's "My Philosophy on Alerting" document/talks** — a widely-referenced, foundational perspective on effective metrics-based alerting design.
- **Various Prometheus/Grafana conference talks** (PromCon, GrafanaCON) covering metric design, cardinality management, and SLO practice in depth.
- **Google SRE team talks on error budgets and SLOs** — direct insight from the practice's original popularizers.
`,

  "github-repos": `
- **prometheus/prometheus** — the official Prometheus source repository, covered in depth in its own skill.
- **grafana/grafana** — the official Grafana source repository, covered in depth in its own skill.
- **open-telemetry/opentelemetry-specification** — the official OpenTelemetry specification, covering unified metrics instrumentation.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Metric type selection**: given a list of measurement scenarios, correctly classify each as needing a counter, gauge, or histogram.
2. **Cardinality analysis**: given a set of proposed metric label schemes, identify which risk cardinality explosion and redesign them appropriately.
3. **Percentile calculation**: given raw latency observations, correctly compute p50/p95/p99 and explain why the average would mislead for this specific dataset.
4. **SLO design**: given a description of a user-facing service, design an appropriate SLI/SLO and calculate error budget consumption from sample data.
5. **Alerting design**: given time-series data representing both a brief spike and sustained degradation, design alerting logic that correctly distinguishes the two.
6. **External practice sets**: Prometheus's own official documentation examples for structured, guided practice with real metric instrumentation.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Instrumentation["Application Instrumentation"]
        Counters["Counters (totals)"]
        Gauges["Gauges (current state)"]
        Histograms["Histograms (distributions)"]
    end
    subgraph Collection["Collection Layer"]
        Prometheus["Prometheus\n(pull-based scraping)"]
    end
    subgraph Analysis["Analysis Layer"]
        RecordingRules["Recording Rules\n(pre-computed aggregations)"]
        Grafana["Grafana\n(dashboards)"]
        Alerting["Alerting Rules"]
    end
    subgraph Reliability["Reliability Framework"]
        SLI["SLI"]
        SLO["SLO"]
        ErrorBudget["Error Budget"]
    end
    Counters --> Prometheus
    Gauges --> Prometheus
    Histograms --> Prometheus
    Prometheus --> RecordingRules
    Prometheus --> Grafana
    Prometheus --> Alerting
    Prometheus --> SLI
    SLI --> SLO
    SLO --> ErrorBudget
    ErrorBudget --> Alerting
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Metrics))
    Foundations
      Overview
      History SNMP Prometheus
      Why it exists
      Problem it solves
    Metric Types
      Counter
      Gauge
      Histogram
      Summary limitations
    Cardinality
      Bounded labels
      Explosion risk
      Management strategies
    Percentiles
      Why averages mislead
      p50 p95 p99
      Cross instance aggregation fallacy
    Structured Frameworks
      RED method
      USE method
    Reliability Practice
      SLI
      SLO
      Error budget
      Multi burn rate alerting
    Advanced
      Exemplars
      Recording rules
    Three Pillars
      Versus logging
      Versus tracing
      OpenTelemetry unification
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default metrics;
