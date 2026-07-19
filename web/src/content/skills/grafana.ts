import type { SkillContent } from "../types";

/**
 * Grafana — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const grafana: SkillContent = {
  overview: `
Grafana is an open-source visualization and dashboarding platform that turns raw time-series data — from **Prometheus**, from log aggregation systems, from tracing backends, and from dozens of other data sources — into readable, interactive dashboards, becoming the dominant visualization layer atop the metrics theory covered in the **Metrics** skill and the concrete Prometheus implementation covered in its own skill. Grafana's genuinely distinctive strength is being data-source-agnostic: rather than being tied to one specific metrics backend, it provides a consistent dashboarding and alerting experience across Prometheus, Elasticsearch, cloud-provider-native metrics, and dozens of other supported sources simultaneously.

For an AI engineer, Grafana is the tool most directly encountered when checking a production system's health at a glance, investigating an ongoing incident visually, or building a dashboard specifically tracking AI-application-relevant metrics (LLM API latency, token usage, cost, error rates). Grafana frequently serves as the shared, organization-wide "single pane of glass" unifying data from Prometheus (metrics), Loki (logs), and Tempo/Jaeger (traces) into one coherent visual investigation experience, directly completing the practical, hands-on tooling side of this platform's three observability pillars.

Key characteristics: **dashboards**, collections of panels (visualizations) arranged to present a coherent view of a system's state, typically built from queries against one or more configured data sources; **panels**, individual visualizations (time-series graphs, gauges, tables, heatmaps) each configured with a specific query and display settings; **data source abstraction**, letting the same dashboarding and alerting features work consistently across many different underlying metrics/logs/tracing backends; **variables**, letting a single dashboard be dynamically parameterized (viewing the same dashboard template for different services, environments, or time ranges) rather than needing a separate dashboard per instance; and **alerting**, Grafana's own alerting engine (evaluating queries against data sources and routing notifications) that can complement or, in some setups, entirely replace Prometheus's own native Alertmanager-based alerting.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2014 | **Torkel Ödegaard** creates Grafana as a fork of Kibana (the visualization layer of the ELK stack, covered in the **Logging** skill), specifically to better support Graphite's time-series data model rather than Kibana's Elasticsearch-centric design |
| 2014–2015 | Grafana quickly expands beyond its Graphite origins to support additional data sources, most significantly **Prometheus** as it emerged and grew in the same period, becoming closely associated with the broader cloud-native/Kubernetes monitoring ecosystem |
| 2018 | **Grafana Labs** is founded as a company to provide commercial support, hosting, and enterprise features around the open-source Grafana project |
| 2018–2019 | Grafana's data source ecosystem expands dramatically, supporting dozens of metrics, logging, and tracing backends, cementing its position as the dominant, vendor-neutral visualization layer across the broader observability landscape |
| 2019 | Grafana Labs introduces **Loki**, a log aggregation system specifically designed to integrate tightly with Grafana (taking design inspiration from Prometheus's own label-based model, but applied to logs), extending Grafana's ecosystem beyond pure visualization into log storage itself |
| 2020 | Grafana Labs introduces **Tempo**, a distributed tracing backend, and **Mimir** (a Prometheus-compatible, horizontally-scalable long-term metrics storage system), completing an integrated "LGTM" stack (Loki, Grafana, Tempo, Mimir) spanning all three observability pillars |
| 2020s | Continued growth of Grafana's alerting capabilities, dashboard-as-code practices (defining dashboards via JSON/version control rather than manual UI configuration), and Grafana Cloud as a widely-adopted managed offering |

Grafana's history reflects a genuine evolution from a narrow, Graphite-specific visualization fork toward becoming the dominant, data-source-agnostic visualization standard across the ENTIRE observability landscape — and, with the LGTM stack's introduction, an increasingly complete, vertically-integrated observability platform in its own right, not merely a visualization layer atop other tools.
`,

  "why-it-exists": `
Grafana exists because raw time-series data — whether from Prometheus, a log aggregation system, or any other metrics/logging backend — is genuinely difficult for a human to interpret directly as raw numbers or JSON responses; engineers need VISUAL representations (graphs, heatmaps, gauges) to quickly recognize patterns, trends, anomalies, and correlations that would be extremely tedious or impossible to notice by reading raw query output alone.

The specific historical catalyst was Torkel Ödegaard's frustration that Kibana (the existing visualization tool at the time, tightly coupled to Elasticsearch specifically) didn't support Graphite's time-series data model well — rather than every metrics backend needing its OWN purpose-built visualization tool (fragmenting the visualization experience across whatever specific backend a team happened to use), Grafana's founding insight was that visualization itself could be a GENERIC, reusable concern, cleanly separated from any specific underlying data source through a pluggable data-source abstraction layer.

This data-source-agnostic design turned out to be genuinely prescient and valuable well beyond its original Graphite-specific motivation: as the observability landscape diversified (Prometheus for metrics, Elasticsearch and Loki for logs, Jaeger and Tempo for traces, plus dozens of cloud-provider-native services), Grafana's pluggable architecture let it become the SHARED, unifying visualization layer across this entire fragmented landscape, rather than engineers needing to learn and switch between many different tools' own separate, backend-specific visualization interfaces.
`,

  "problem-it-solves": `
Grafana solves the **"how do we turn raw time-series data from many different, otherwise-incompatible backends into consistent, readable, interactive visual dashboards, supporting both at-a-glance system health checks and detailed incident investigation, without needing a separate visualization tool per data source"** problem.

Concretely, Grafana provides:

- **Data-source-agnostic visualization**: the same dashboarding features, panel types, and query-building experience work consistently across Prometheus, Elasticsearch, cloud-provider metrics, and dozens of other supported backends.
- **Rich, interactive panel types** (time-series graphs, heatmaps, gauges, tables, and many others) letting engineers choose the visualization best suited to a specific signal's actual shape and diagnostic need.
- **Dashboard templating via variables**, letting one dashboard definition serve many different specific instances (a "service health" dashboard template that can be viewed for any specific service by changing a dropdown, rather than needing a hand-built dashboard per service).
- **Unified cross-signal investigation** (particularly via the LGTM stack — Loki, Grafana, Tempo, Mimir) letting an engineer move fluidly between metrics, logs, and traces within one consistent tool, directly supporting the three-pillars-unification trend covered across the **Logging**, **Metrics**, and **Tracing** skills.
- **A dedicated alerting engine** capable of evaluating queries across any configured data source and routing notifications, either complementing or in some deployments replacing backend-specific alerting (like Prometheus's own Alertmanager).

What Grafana does **not** solve, or solves with a real tradeoff: Grafana itself doesn't STORE metrics/logs/traces (with the exception of its own companion Loki/Tempo/Mimir products) — it's fundamentally a visualization and alerting LAYER atop other systems' storage, meaning Grafana's own usefulness is entirely dependent on the underlying data sources' actual data quality and availability; poorly-designed dashboards (too many panels, confusing layouts, misleading visualizations) can genuinely reduce rather than improve an engineer's ability to understand system state, meaning dashboard design itself is a genuine skill requiring deliberate practice; and Grafana's own alerting, while powerful, introduces a genuine architectural choice (Grafana-native alerting versus a backend's own native alerting, like Prometheus's Alertmanager) that teams must deliberately decide between rather than defaulting to either without consideration.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Grafana's data-source abstraction and why it enables a consistent experience across many different backends.
2. Build effective dashboards choosing appropriate panel types for different kinds of data.
3. Use dashboard variables to build reusable, templated dashboards rather than one-off, hand-built ones.
4. Configure Grafana's alerting engine and understand its relationship to backend-native alerting (like Prometheus's Alertmanager).
5. Apply dashboard design best practices, avoiding common visual anti-patterns that reduce rather than improve clarity.
6. Understand the LGTM stack (Loki, Grafana, Tempo, Mimir) and how it unifies the three observability pillars.
7. Practice "dashboards as code," managing dashboard definitions via version control rather than manual UI-only configuration.
8. Recognize when a dashboard genuinely aids incident investigation versus when it adds visual noise without diagnostic value.
9. Answer senior-level interview questions on dashboard design, alerting architecture, and the LGTM stack.
`,

  prerequisites: `
- **Required**: the **Metrics** skill and, very helpfully, the **Prometheus** skill (covered alongside this one) — Grafana visualizes the data these establish, and doesn't make sense without that foundation.
- **Helpful**: the **Logging** and **Tracing** skills for understanding Grafana's broader role unifying all three observability pillars via the LGTM stack.

Dependency links: **Metrics** → **Prometheus** → this page → **OpenTelemetry** for the unifying instrumentation standard feeding all these visualization and storage layers.
`,

  "beginner-concepts": `
### Dashboards and panels

~~~
A DASHBOARD is a collection of PANELS arranged on a grid --
each panel is an individual visualization (a graph, a gauge,
a table) configured with:
├── A query against a specific data source
├── A visualization type (time series, bar gauge, heatmap, etc.)
└── Display settings (colors, thresholds, units)
~~~

A dashboard is the top-level organizing unit — a typical "service health" dashboard might combine a request-rate graph, an error-rate graph, and a latency-percentile graph, each as a separate panel, giving an at-a-glance view of the RED metrics (covered in the **Metrics** skill) for that service.

### Configuring a data source

~~~yaml
# Grafana's provisioning configuration (or done via the UI)
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    access: proxy
~~~

A data source connects Grafana to an actual underlying system (Prometheus, in this example) — once configured, any dashboard can build panels querying that data source, using its native query language (PromQL, for a Prometheus data source).

### A basic time-series panel

~~~
Panel configuration:
├── Data source: Prometheus
├── Query: rate(http_requests_total[5m])
├── Visualization: Time series (a line graph)
└── Unit: requests/second
~~~

This simple configuration produces a line graph showing request rate over time — the most common, foundational panel type for visualizing how a metric changes over a selected time range.

### Basic dashboard variables

~~~
$service   -- a dashboard variable, populated from a query
             (e.g., label_values(http_requests_total, service))
            letting a user select which specific service's
            data to view from a dropdown

Query using the variable: rate(http_requests_total{service="$service"}[5m])
~~~

A dashboard variable lets ONE dashboard definition serve many different specific contexts (viewing the SAME dashboard template for "order-service," then switching to "payment-service" via a dropdown), avoiding the need to hand-build a separate, nearly-identical dashboard for every individual service.
`,

  "intermediate-concepts": `
### Choosing the right panel type for the data

~~~
Time series graph: how a value changes OVER TIME -- the most
    common panel type, ideal for request rate, error rate, latency
Gauge: a single current value against a threshold -- ideal for
    "current CPU utilization" or "current queue depth"
Heatmap: a distribution changing over time -- ideal for
    visualizing latency distribution evolution (complementing
    a simple percentile line graph with the FULL distribution shape)
Table: tabular, row-based data -- ideal for a ranked list
    (top 10 slowest endpoints, for instance)
Stat panel: a single, prominent number -- ideal for a headline
    KPI (current error budget remaining, total requests today)
~~~

Choosing the panel type that genuinely matches the data's actual shape and the question being asked is a real, important design skill — a table crammed into a bar graph, or a distribution flattened into a single average number, both lose genuine diagnostic information a better-chosen panel type would preserve.

### Building a RED-method dashboard

~~~
A dashboard directly implementing the RED method (covered in
the Metrics skill) for a service:
├── Panel 1: Rate -- request rate over time (time series)
├── Panel 2: Errors -- error rate/percentage over time (time series)
└── Panel 3: Duration -- p50/p95/p99 latency (time series,
     multiple lines, or a heatmap for the full distribution)
~~~

Structuring dashboards directly around established frameworks (RED for services, USE for resources, both covered in the **Metrics** skill) provides a consistent, comparable dashboard layout across an entire organization's services, rather than each team inventing an idiosyncratic dashboard structure.

### Grafana alerting configuration

~~~yaml
# A Grafana-native alert rule (as opposed to Prometheus's own
# Alertmanager-based alerting)
alert:
  condition: A
  data:
    - refId: A
      queryType: prometheus
      model:
        expr: rate(http_requests_total{status="500"}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
~~~

Grafana's own native alerting engine can evaluate queries against ANY configured data source (not just Prometheus), providing a genuinely unified alerting experience across a heterogeneous set of backends — a real architectural alternative to relying solely on each backend's own native alerting mechanism (like Prometheus's Alertmanager).

### Dashboard-as-code practice

~~~json
{
  "dashboard": {
    "title": "Order Service Health",
    "panels": [
      {"title": "Request Rate", "type": "timeseries", "targets": [{"expr": "rate(http_requests_total[5m])"}]}
    ]
  }
}
~~~

Defining dashboards as version-controlled JSON (rather than manually configuring them through the UI and never tracking changes) lets dashboard definitions be reviewed, versioned, and consistently deployed across environments — a genuinely valuable practice directly analogous to infrastructure-as-code more broadly, covered across this platform's Cloud & DevOps category.
`,

  "advanced-concepts": `
### The LGTM stack: Loki, Grafana, Tempo, Mimir

~~~mermaid
flowchart TB
    Loki["Loki\n(log aggregation)"] --> Grafana["Grafana\n(unified visualization)"]
    Tempo["Tempo\n(distributed tracing)"] --> Grafana
    Mimir["Mimir\n(long-term, scalable metrics)"] --> Grafana
~~~

Grafana Labs' "LGTM stack" — Loki (logs), Grafana (visualization), Tempo (traces), Mimir (metrics, Prometheus-compatible but horizontally scalable) — provides a genuinely integrated, vertically-consistent implementation of all three observability pillars from a single vendor, directly addressing the three-pillars-unification trend covered across the **Logging**, **Metrics**, and **Tracing** skills, while remaining built on open standards (Prometheus's query language and data model, for instance) rather than a fully proprietary approach.

### Exemplars: linking metrics dashboards directly to traces

~~~
A Grafana panel visualizing latency (via a Prometheus histogram)
can display EXEMPLARS -- specific data points annotated with a
trace ID representative of a request that produced that
particular latency observation -- letting an engineer click
directly from "this latency bucket looks concerning" to "here's
an ACTUAL example trace of a request that fell into it," bridging
metrics' aggregate view with tracing's per-request depth directly
within Grafana's own UI.
~~~

This directly implements the exemplar concept covered in both the **Metrics** and **Tracing** skills, made concretely usable within Grafana's actual dashboarding interface.

### Dashboard design anti-patterns and cognitive load

~~~
A dashboard with TOO MANY panels, inconsistent color schemes,
or panels answering questions nobody actually asks during an
incident genuinely INCREASES cognitive load during exactly the
high-stress moments (an active incident) when clear, fast
comprehension matters most -- dashboard design should be
deliberately curated around the SPECIFIC questions engineers
actually need answered quickly, not an exhaustive dump of every
possible metric.
~~~

A senior engineer treats dashboard design as a genuine UX discipline — curating panels around actual investigative needs (informed by the RED/USE frameworks, and by post-incident retrospectives about what information was and wasn't useful) rather than accumulating an ever-growing, unfocused collection of every conceivable metric.

### Grafana's role in SLO/error-budget visualization

~~~
Grafana dashboards commonly visualize SLO/error-budget burn
rate directly (covered in depth in the Metrics skill), often
combined with Grafana's own alerting to implement multi-window,
multi-burn-rate alerting logic entirely within Grafana's
configuration, rather than requiring separate Prometheus
alerting rule files.
~~~

### Provisioning and multi-tenancy for large organizations

~~~
At genuine organizational scale, Grafana deployments commonly
use PROVISIONING (defining data sources, dashboards, and
alerting rules as code, applied automatically at startup) and
ORGANIZATION/FOLDER-based access control, letting different
teams manage their own dashboards independently while sharing
common data sources and organizational conventions.
~~~
`,

  "internal-working": `
What happens internally when a Grafana dashboard panel renders, tracing the query-to-visualization pipeline:

~~~mermaid
sequenceDiagram
    participant User as Browser (dashboard view)
    participant Grafana as Grafana server
    participant DataSource as Configured data source (Prometheus)

    User->>Grafana: load dashboard (with selected time range,\nvariable values)
    Grafana->>Grafana: for each panel, construct the actual\nquery (substituting variables, time range)
    Grafana->>DataSource: execute the query\n(e.g., a PromQL request to Prometheus)
    DataSource-->>Grafana: raw time-series data
    Grafana->>Grafana: transform data into the panel's\nvisualization format
    Grafana-->>User: rendered panel (graph, gauge, table)
~~~

1. **A dashboard load triggers a query for EACH panel**, with the current time range and any dashboard variable selections substituted into each panel's underlying query template.
2. **Grafana forwards each query to its configured data source** using that source's native query language (PromQL for Prometheus, LogQL for Loki, and so on) — Grafana itself doesn't store or compute the underlying data, it queries it fresh (or from a cache, depending on configuration) each time.
3. **The returned raw data is transformed into the panel's specific visual representation**, applying any configured thresholds, colors, and units.

**Why this matters**: understanding that Grafana is fundamentally a QUERY-AND-RENDER layer (not a data store, for the base product) explains both its genuine flexibility (any data source implementing the appropriate plugin interface can be visualized) and its fundamental dependency on the underlying data source's own availability and performance — a slow or unavailable Prometheus instance directly produces a slow or broken Grafana dashboard, since Grafana has no independent data of its own to fall back on.
`,

  architecture: `
A senior engineer thinks about Grafana architecture across several dimensions: designing dashboards around genuine investigative needs rather than exhaustive metric dumps, choosing deliberately between Grafana-native and backend-native alerting, and adopting dashboard-as-code practices for consistency and reviewability at organizational scale.

### The dashboard design decision framework

~~~mermaid
flowchart TB
    Q1{"What SPECIFIC question\ndoes an engineer need\nanswered quickly here?"}
    Q1 -->|"Overall service health\nat a glance"| REDDashboard["A RED-method dashboard:\nrate, errors, duration"]
    Q1 -->|"Resource capacity/\nsaturation status"| USEDashboard["A USE-method dashboard:\nutilization, saturation, errors"]
    Q1 -->|"SLO/error-budget\nstatus"| SLODashboard["An SLO-focused dashboard\nwith burn-rate visualization"]
~~~

Structuring dashboard design around the SPECIFIC investigative question a dashboard needs to answer (using established frameworks as a starting point) rather than accumulating every conceivable panel is the single most valuable practical dashboard design discipline.

### Choosing between Grafana-native and backend-native alerting

~~~mermaid
flowchart LR
    Q{"Do you need alerting\nacross MULTIPLE, heterogeneous\ndata sources uniformly?"}
    Q -->|Yes| GrafanaAlerting["Grafana's own native\nalerting engine"]
    Q -->|"No, Prometheus-only,\nwith existing Alertmanager\ninvestment"| PrometheusAlerting["Prometheus's own\nAlertmanager-based alerting"]
~~~

This is a genuine architectural decision, not a default — a senior engineer weighs Grafana's unified, cross-data-source alerting capability against the value of an existing, well-understood Prometheus/Alertmanager setup before choosing which system owns alerting responsibility.

### Adopting dashboard-as-code at organizational scale

~~~mermaid
flowchart LR
    Code["Dashboard JSON in\nversion control"] --> Review["Code review for\ndashboard changes"]
    Review --> Provisioning["Automated provisioning\napplies dashboards consistently\nacross environments"]
~~~

Treating dashboards as version-controlled code (rather than manually-configured, unreviewed UI state) enables the same collaborative, reviewable engineering discipline applied to dashboard changes as to application code changes, directly connecting to this platform's broader **CI/CD** and infrastructure-as-code themes.
`,

  "data-flow": `
Tracing a complete incident investigation workflow using Grafana's unified LGTM-stack visualization, moving from a metrics anomaly to root cause:

~~~mermaid
sequenceDiagram
    participant Engineer
    participant Grafana
    participant Mimir as Mimir/Prometheus (metrics)
    participant Tempo as Tempo (traces)
    participant Loki as Loki (logs)

    Engineer->>Grafana: view service health dashboard
    Grafana->>Mimir: query error rate
    Mimir-->>Grafana: error rate spike visible
    Engineer->>Grafana: click an exemplar on the latency panel
    Grafana->>Tempo: fetch the linked trace
    Tempo-->>Grafana: trace showing the specific slow span
    Engineer->>Grafana: click "view logs" for that span's trace/span ID
    Grafana->>Loki: query logs filtered by trace_id
    Loki-->>Grafana: detailed log lines for that specific request
    Engineer->>Engineer: root cause identified from detailed log context
~~~

The critical detail: this ENTIRE investigation — from noticing an aggregate metrics anomaly, to examining a specific request's trace, to reading that request's detailed logs — happens within ONE tool (Grafana), fluidly moving between all three observability pillars via their shared correlation mechanisms (exemplars linking metrics to traces, trace/span IDs linking traces to logs) — directly demonstrating the practical payoff of the three-pillars-unification trend covered across the **Logging**, **Metrics**, and **Tracing** skills.
`,

  "production-usage": `
### A production-style dashboard provisioning configuration

~~~yaml
apiVersion: 1
providers:
  - name: default
    folder: Services
    type: file
    options:
      path: /etc/grafana/dashboards
~~~

Provisioning lets dashboard JSON files stored in version control be automatically loaded into Grafana at startup, ensuring dashboards are consistently deployed and reproducible across environments (staging, production) rather than manually recreated.

### Non-negotiables for production Grafana usage

1. **Structure dashboards around genuine investigative questions** (RED/USE/SLO frameworks) rather than exhaustive, unfocused metric dumps.
2. **Use dashboard variables** for templated, reusable dashboards rather than hand-building near-duplicate dashboards per service/environment.
3. **Adopt dashboard-as-code** (version-controlled JSON, provisioned automatically) for reviewability and consistency.
4. **Deliberately choose** between Grafana-native alerting and backend-native alerting (Prometheus's Alertmanager), rather than defaulting to either without consideration.
5. **Link metrics, logs, and traces** wherever the underlying data sources support it (exemplars, shared trace IDs).

### Common production patterns

- **The LGTM stack** (Loki, Grafana, Tempo, Mimir) as an integrated, single-vendor implementation of all three observability pillars.
- **RED/USE-method dashboard templates** applied consistently across every service in an organization.
- **Grafana Cloud** as a widely-adopted managed alternative to self-hosting the full stack.
- **SLO/error-budget dashboards** combined with burn-rate alerting, directly implementing the **Metrics** skill's reliability engineering framework visually.
`,

  "industry-examples": `
- **Grafana Labs' own LGTM stack**: Loki, Grafana, Tempo, and Mimir together, a widely-adopted, integrated open-source observability platform.
- **Kubernetes' broader ecosystem**: Grafana is the standard visualization layer paired with Prometheus across virtually every Kubernetes-based monitoring setup, commonly bundled together via the kube-prometheus-stack Helm chart.
- **Countless companies' internal "single pane of glass" dashboards**: Grafana's data-source-agnostic design makes it a common choice specifically for organizations needing to unify visualization across genuinely heterogeneous backend systems (a mix of cloud-provider-native metrics, self-hosted Prometheus, and various logging systems).
- **Grafana Cloud**: a widely-used managed offering, letting organizations adopt the LGTM stack's capabilities without operating the underlying infrastructure themselves.
- **Many observability-focused startups and platforms**: building atop or integrating with Grafana's open, pluggable data-source architecture rather than building a fully proprietary visualization layer from scratch.
`,

  "best-practices": `
1. **Structure dashboards around specific investigative questions** (RED/USE/SLO frameworks), not exhaustive metric dumps that increase cognitive load during incidents.
2. **Use dashboard variables** for templated, reusable dashboard designs rather than hand-building near-duplicate dashboards.
3. **Choose the panel type matching the data's actual shape** — time series for trends, heatmaps for distributions, gauges for current single values.
4. **Adopt dashboard-as-code** for reviewability, versioning, and consistent deployment across environments.
5. **Deliberately decide between Grafana-native and backend-native alerting**, rather than defaulting to either without consideration of your specific data source topology.
6. **Link metrics to traces via exemplars, and traces to logs via shared IDs**, enabling fluid cross-pillar investigation.
7. **Curate dashboards periodically**, removing panels that don't genuinely inform real investigative or monitoring needs.
8. **Apply consistent color/threshold conventions** across dashboards organization-wide, reducing cognitive load when engineers move between different teams' dashboards.
9. **Test dashboards during simulated incidents**, verifying they actually help (not hinder) fast diagnosis under realistic pressure.
10. **Use folder/organization structure and access controls** appropriately at genuine organizational scale, letting teams manage their own dashboards while sharing common conventions.
`,

  "anti-patterns": `
### Dashboard sprawl: too many panels, no curation

~~~
WRONG — a dashboard with 40+ panels covering every conceivable
metric, with no clear organizing structure, making it genuinely
hard to quickly find the specific signal relevant during an
active incident

RIGHT — a focused dashboard structured around the RED method
(rate, errors, duration) or a specific SLO, with additional
detail available via drill-down links rather than crammed onto
the primary view
~~~

Dashboard sprawl genuinely increases cognitive load precisely during the high-stress moments (an active incident) when fast, clear comprehension matters most — more panels are not automatically better; curated, focused dashboards serve investigation better than exhaustive ones.

### Hand-building near-duplicate dashboards per service

~~~
WRONG — manually creating a separate, nearly-identical
dashboard JSON file for every individual service, each requiring
separate manual updates whenever the dashboard TEMPLATE itself
needs a change

RIGHT — one templated dashboard using a $service variable,
letting any engineer view the SAME dashboard structure for
ANY specific service via a dropdown selection
~~~

Not using dashboard variables for genuinely templatable dashboard needs creates significant, ongoing maintenance burden (updating dozens of near-duplicate dashboards whenever the underlying structure needs to change) that a single templated dashboard avoids entirely.

### Other production-grade anti-patterns

- **Manually configuring dashboards through the UI with no version control**, losing change history and making consistent deployment across environments difficult.
- **Inconsistent color/threshold conventions across different dashboards**, increasing cognitive load when engineers move between teams' dashboards during a cross-team incident.
- **Choosing an inappropriate panel type** (cramming a distribution into a single average number, or a ranked list into a line graph) that loses genuine diagnostic information a better-suited panel type would preserve.
- **Not linking metrics/logs/traces where the underlying data sources support it**, missing the genuine investigative fluidity the LGTM stack (or an equivalent unified setup) is specifically designed to provide.
- **Treating dashboard design as a one-time setup task** rather than periodically curating and refining dashboards based on actual, observed investigative needs.
`,

  performance: `
### Rule zero: Grafana's own performance is bounded by its underlying data sources

Since Grafana itself doesn't store the underlying data (for base metrics/logs/traces, excluding its own Loki/Tempo/Mimir products), a slow or overloaded data source directly produces a slow, unresponsive dashboard.

### The performance hierarchy (apply in order)

1. **Ensure underlying data sources (Prometheus, and others) are themselves well-optimized**, since Grafana's dashboard performance is fundamentally bounded by query performance at the source.
2. **Use recording rules (in Prometheus, for instance)** for expensive, frequently-viewed dashboard queries, avoiding repeated expensive computation on every dashboard load.
3. **Limit dashboard time ranges and panel counts appropriately**, since very wide time ranges or an excessive number of simultaneous panel queries can meaningfully slow dashboard load time.
4. **Use appropriate query caching** where Grafana or the underlying data source supports it, reducing redundant computation for frequently-viewed dashboards.
5. **Profile genuinely slow dashboards specifically**, identifying whether the bottleneck is a specific panel's query, the data source's own performance, or Grafana's rendering itself.

### Micro-level facts worth knowing

- A dashboard with many panels each querying the same underlying data source can produce a genuine burst of simultaneous query load on that data source when the dashboard loads.
- Dashboard auto-refresh intervals directly affect underlying data source query load — an aggressively short auto-refresh on a heavily-viewed dashboard can meaningfully add to the underlying data source's total query burden.
- Grafana's own query result caching (where configured) can meaningfully reduce redundant load for frequently-viewed, rarely-changing dashboards.
`,

  scalability: `
Grafana's scalability concern centers on both its own infrastructure (for genuinely large user bases/dashboard counts) and its dependency on underlying data sources' own scalability.

### Why Grafana's scaling story is closely tied to its data sources

~~~mermaid
flowchart LR
    Grafana["Grafana itself\n(relatively lightweight)"] --> DataSources["Underlying data sources\n(Prometheus, Loki, Tempo)"]
    DataSources --> RealBottleneck["The GENUINE scaling\nbottleneck usually lives\nHERE, not in Grafana itself"]
~~~

Grafana itself is relatively lightweight to scale (primarily a query-and-render layer), but the underlying data sources it depends on (particularly a single-node Prometheus instance, covered in its own skill's scalability concerns) are frequently the genuine bottleneck a growing organization encounters first.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Underlying Prometheus instance's query/storage capacity exceeded | Address at the Prometheus/Mimir layer (recording rules, Mimir for horizontal scaling), not within Grafana itself |
| Grafana server itself under heavy concurrent dashboard-viewing load | Horizontal scaling of Grafana instances behind a load balancer (Grafana supports this) |
| Dashboard load times slow due to excessive panel count/query complexity | Curate dashboards to fewer, more focused panels; use recording rules for expensive queries |
| Many teams needing independent dashboard management at scale | Organization/folder structure with appropriate access controls, and dashboard-as-code provisioning |
`,

  security: `
### Access control for dashboards and data sources

~~~
Grafana's own access control (organizations, teams, folder
permissions) should be configured deliberately -- not every
engineer needs access to every team's dashboards or every
configured data source, particularly for data sources that
might expose genuinely sensitive operational or business
information in aggregate.
~~~

### Essential Grafana security practices

1. **Configure appropriate organization/team/folder access controls**, rather than granting broad, unrestricted access by default.
2. **Never expose Grafana's own UI/API publicly without authentication**, consistent with the broader observability infrastructure security practices covered in the **Prometheus** and **Logging** skills.
3. **Be cautious with data sources that might expose sensitive information** even in aggregate (revealing internal service topology, business metrics that shouldn't be broadly visible).
4. **Secure Grafana's own alerting notification channel credentials** (Slack webhooks, PagerDuty keys), consistent with general secrets management practice.
5. **Apply appropriate authentication** (SSO/OAuth integration, where available) rather than relying solely on Grafana's own local user accounts for organizational deployments.

See the **OWASP Top 10** and **Secrets Management** skills for the broader security context this connects to.
`,

  testing: `
### Testing dashboard provisioning and configuration

~~~python
def test_dashboard_json_is_valid():
    with open("dashboards/order-service-health.json") as f:
        dashboard = json.load(f)
    assert dashboard["dashboard"]["title"] == "Order Service Health"
    assert len(dashboard["dashboard"]["panels"]) > 0

def test_dashboard_uses_service_variable():
    -- verify a templated dashboard genuinely uses the $service
    -- variable in its panel queries, rather than being
    -- hardcoded to one specific service
    with open("dashboards/service-health-template.json") as f:
        dashboard = json.load(f)
    for panel in dashboard["dashboard"]["panels"]:
        for target in panel.get("targets", []):
            assert "$service" in target.get("expr", "")
~~~

### The senior testing doctrine

- Validate dashboard JSON syntax and structure as part of CI, catching malformed dashboard definitions before deployment.
- Test that templated dashboards genuinely use their intended variables consistently across every panel, not just some.
- Periodically review dashboards against actual incident retrospectives, verifying they genuinely provided (or would have provided) useful information during real investigations.
- Test alerting rule configuration (whether Grafana-native or backend-native) against known scenarios, verifying expected firing/non-firing behavior.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check the specific panel's query directly** (Grafana's "Explore" view, or the panel's query inspector) to verify it returns the expected data independent of the dashboard's visual presentation.
2. **Verify the underlying data source's own health** (is Prometheus itself responding correctly to the same query directly) if a panel shows no data or an error.
3. **Check dashboard variable resolution**, verifying a templated panel's variable substitution is producing the expected actual query.
4. **Cross-reference with the data source's own native tooling** (Prometheus's own query browser, for instance) to isolate whether an issue is in Grafana's rendering or the underlying data/query itself.

### Debugging common Grafana-specific symptoms

- "A panel shows 'No data' unexpectedly" — verify the underlying query directly against the data source, and check dashboard variable resolution if the panel is templated.
- "A dashboard loads very slowly" — check for an excessive number of panels/queries, an overly wide time range, or a genuinely slow underlying data source query.
- "An alert isn't firing as expected" — verify whether it's a Grafana-native alert or relies on a backend's own alerting (Prometheus's Alertmanager), and check the specific system's configuration accordingly.
- "A templated dashboard's variable dropdown is empty" — verify the variable's underlying query (often a label_values() query against the data source) is returning the expected values.
`,

  monitoring: `
### Key signals to track

- **Dashboard load times**, catching genuinely slow dashboards before they become a recurring investigative friction point.
- **Grafana's own server health** (for self-hosted deployments), particularly under heavy concurrent usage.
- **Alert firing/resolution rate** (for Grafana-native alerting), tracking whether alerting is providing genuinely actionable signal.
- **Data source query error rates**, surfacing underlying data source availability issues that would directly degrade dashboard usefulness.

### Tools

Grafana's own server metrics (which can themselves be visualized in Grafana, a common "meta-monitoring" pattern); standard infrastructure monitoring for self-hosted Grafana deployments; Grafana Cloud's own built-in operational dashboards for managed deployments.

### Alerting priorities

Alert on Grafana server unavailability (a genuine observability blind spot if the visualization layer itself goes down), on underlying data source connectivity failures affecting dashboard functionality, and on Grafana-native alert evaluation failures if using Grafana as the primary alerting engine.
`,

  deployment: `
### Deploying Grafana via the kube-prometheus-stack

~~~bash
helm install monitoring prometheus-community/kube-prometheus-stack
# Grafana is bundled and pre-configured with Prometheus as a data source
~~~

The widely-used kube-prometheus-stack Helm chart (covered in the **Prometheus** skill) bundles Grafana alongside Prometheus and Alertmanager, pre-configured with a Prometheus data source and a curated set of Kubernetes-specific dashboards.

### Dashboard provisioning for consistent multi-environment deployment

~~~yaml
apiVersion: 1
providers:
  - name: default
    folder: Services
    type: file
    options:
      path: /etc/grafana/dashboards
~~~

Provisioning configuration (data sources, dashboards, alerting rules defined as code) ensures Grafana deployments across staging and production environments remain consistent and reproducible, rather than manually recreated per environment.

### CI/CD pipeline considerations

Automated validation of dashboard JSON syntax and structure as part of CI, catching malformed dashboard definitions before they're deployed via provisioning. See the **CI/CD** and **Prometheus** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production Grafana deployment is considered complete:

- [ ] Dashboards structured around genuine investigative questions (RED/USE/SLO frameworks), not exhaustive metric dumps
- [ ] Dashboard variables used for templated, reusable dashboards rather than hand-built near-duplicates
- [ ] Dashboard-as-code (version-controlled JSON, provisioned automatically) adopted for reviewability and consistency
- [ ] A deliberate decision made between Grafana-native and backend-native alerting
- [ ] Metrics linked to traces (exemplars) and traces linked to logs (shared IDs) where underlying data sources support it
- [ ] Appropriate organization/team/folder access controls configured
- [ ] Grafana's own UI/API not publicly exposed without authentication
- [ ] Notification channel credentials (Slack, PagerDuty) secured appropriately
- [ ] Dashboards periodically curated and reviewed against actual incident retrospective learnings
- [ ] Grafana's own health monitored (particularly for self-hosted deployments)
`,

  "common-mistakes": `
1. **Dashboard sprawl** — too many panels with no clear organizing structure, increasing cognitive load during incidents.
2. **Hand-building near-duplicate dashboards per service** instead of using dashboard variables for templating.
3. **Manually configuring dashboards through the UI with no version control**, losing change history and deployment consistency.
4. **Choosing an inappropriate panel type** for the data's actual shape, losing genuine diagnostic information.
5. **Inconsistent color/threshold conventions across dashboards**, increasing cognitive load across teams.
6. **Not linking metrics/logs/traces** where the underlying data sources genuinely support it, missing fluid cross-pillar investigation.
7. **Treating dashboard design as a one-time task** rather than periodically curating based on actual investigative experience.
8. **Not deliberately choosing between Grafana-native and backend-native alerting**, defaulting to one without genuine consideration.
9. **Overly broad access controls**, granting unrestricted dashboard/data-source access by default.
10. **Not testing dashboards during simulated incidents**, discovering they don't actually help during a real one.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| A panel shows "No data" | The underlying query returns nothing, often a variable resolution issue or a genuinely empty result from the data source | Verify the query directly against the data source, and check variable substitution |
| Dashboard loads very slowly | Too many panels, an overly wide time range, or a slow underlying data source query | Curate the dashboard, narrow the time range, or optimize the underlying query (recording rules, for Prometheus) |
| Dashboard variable dropdown is empty | The variable's underlying query (e.g., label_values) returns no results | Verify the variable's query directly and confirm the expected label values exist in the data source |
| An alert doesn't fire as expected | Confusion between Grafana-native alerting and backend-native alerting configuration | Verify which system actually owns this specific alert's evaluation and check its configuration accordingly |
| Inconsistent dashboard appearance across teams | No shared color/threshold/panel-type conventions adopted organization-wide | Establish and document shared dashboard design conventions |
| Dashboard changes lost or inconsistent across environments | Dashboards configured manually via the UI without version control | Adopt dashboard-as-code with provisioning |
| Exemplars/trace links not appearing on a panel | The underlying data source or instrumentation doesn't support/populate exemplars | Verify exemplar support is enabled and correctly configured at the instrumentation and data source level |
`,

  faqs: `
**What is Grafana, fundamentally?**
An open-source, data-source-agnostic visualization and dashboarding platform that turns raw time-series data (from Prometheus, logs, traces, and dozens of other sources) into readable, interactive dashboards — it's primarily a query-and-render layer, not a data storage system (with the exception of its own companion Loki/Tempo/Mimir products).

**Why is Grafana described as "data-source-agnostic," and why does that matter?**
Because the same dashboarding, panel, and alerting features work consistently across many different underlying backends (Prometheus, Elasticsearch, cloud-provider metrics, and more) via a pluggable data-source abstraction — this lets Grafana serve as a single, unifying visualization layer across an organization's genuinely heterogeneous observability infrastructure, rather than requiring a separate tool per backend.

**What is the LGTM stack?**
Loki (log aggregation), Grafana (visualization), Tempo (distributed tracing), and Mimir (horizontally-scalable, Prometheus-compatible metrics storage) — an integrated, single-vendor implementation of all three observability pillars, built on open standards.

**What are dashboard variables for?**
Letting one dashboard definition serve many different specific contexts (viewing the same dashboard template for different services, environments, or time ranges via a dropdown) rather than requiring a separate, hand-built dashboard per instance.

**Should I use Grafana's own native alerting, or Prometheus's Alertmanager?**
This is a genuine architectural decision — Grafana-native alerting provides unified alerting across multiple, heterogeneous data sources; Prometheus's own Alertmanager is the more established, Prometheus-specific choice if your alerting needs are primarily Prometheus-centric and you have existing Alertmanager investment — choose deliberately based on your actual data source topology, not by default.

**Why does dashboard design matter as its own genuine skill?**
Because poorly-designed dashboards (too many panels, inconsistent conventions, mismatched panel types) can genuinely increase cognitive load and slow down incident investigation rather than helping it — effective dashboard design deliberately curates panels around specific investigative questions (using frameworks like RED/USE/SLO) rather than accumulating an exhaustive, unfocused collection of every conceivable metric.
`,

  "interview-questions": `
### Junior level

1. **What is Grafana, and what problem does it solve?**
   Model answer: an open-source visualization platform that turns raw time-series data from various backends into readable, interactive dashboards, solving the problem of making metrics/logs/traces genuinely interpretable by humans rather than raw numbers or JSON.

2. **What is a data source in Grafana?**
   Model answer: a configured connection to an underlying system (Prometheus, Elasticsearch, and others) that Grafana queries to populate dashboard panels, using that source's native query language.

3. **What is a dashboard variable, and why is it useful?**
   Model answer: a parameter (like a service name) that lets one dashboard definition serve many different specific contexts via a dropdown selection, avoiding the need to hand-build a separate, near-identical dashboard per instance.

4. **Name three different panel types and when you'd use each.**
   Model answer: time series (for how a value changes over time, like request rate), gauge (for a single current value against a threshold, like CPU utilization), and table (for tabular, ranked data, like top 10 slowest endpoints).

5. **What is the LGTM stack?**
   Model answer: Loki, Grafana, Tempo, and Mimir — an integrated set of open-source tools from Grafana Labs covering logs, visualization, tracing, and metrics respectively.

### Senior level

6. **Why is Grafana's data-source-agnostic architecture considered a genuinely valuable design choice, beyond its original Graphite-specific motivation?**
   Model answer: as the observability landscape diversified significantly beyond any single backend (Prometheus for metrics, various logging systems, various tracing backends, cloud-provider-native services), Grafana's pluggable data-source abstraction let it become a SHARED, unifying visualization layer across this entire fragmented landscape — engineers get one consistent dashboarding/alerting experience regardless of which specific backend actually stores a given signal, rather than needing to learn and context-switch between many different tools' own separate visualization interfaces.

7. **Explain the tradeoff between Grafana-native alerting and a backend's own native alerting (like Prometheus's Alertmanager), and how you would decide between them.**
   Model answer: Grafana-native alerting can evaluate and alert on queries across MULTIPLE, heterogeneous data sources uniformly, providing a genuinely unified alerting experience when an organization's signals are spread across several different backends; a backend's own native alerting (Prometheus's Alertmanager, specifically) is more established and tightly integrated for that specific backend, and makes sense to retain if an organization's alerting needs are primarily centered on that one backend with existing operational investment already in place — the decision should be based on your actual data source topology (single backend versus genuinely heterogeneous) rather than a default choice.

8. **Why is dashboard design considered a genuine engineering/UX discipline rather than a simple configuration task?**
   Model answer: a poorly-designed dashboard (too many panels, inconsistent conventions, a mismatched panel type for the data's actual shape) can genuinely INCREASE cognitive load during exactly the high-stress moments (an active incident) when fast, clear comprehension matters most — dashboard sprawl and unfocused metric dumps actively work against the goal dashboards are supposed to serve; effective dashboard design requires deliberately curating panels around the SPECIFIC investigative questions engineers actually need answered quickly (informed by frameworks like RED/USE/SLO and by post-incident retrospectives about what information was and wasn't genuinely useful), not accumulating an exhaustive collection of every conceivable metric.

9. **How do exemplars enable cross-pillar investigation within Grafana specifically, and why does this matter for incident response?**
   Model answer: an exemplar is a specific data point within an aggregate metric (like a histogram bucket) annotated with a representative trace ID for a request that produced that specific observation; when a Grafana panel visualizing that metric supports exemplars, an engineer can click directly from "this latency bucket looks concerning" to the actual linked trace in Tempo (or another tracing backend), and from there to that trace's detailed logs in Loki (via shared trace/span IDs) — this lets an entire investigation (noticing an aggregate anomaly, examining a specific request's structure, reading its detailed logs) happen fluidly within ONE tool, directly reducing the friction and context-switching that would otherwise be required moving between separate, disconnected metrics/tracing/logging tools.

10. **What is "dashboard as code," and why would an organization adopt this practice over manual UI configuration?**
    Model answer: defining dashboards as version-controlled JSON files (applied to Grafana via automated provisioning at startup) rather than manually configuring them through Grafana's UI without any change tracking — this enables the SAME collaborative engineering discipline applied to application code (code review for dashboard changes, a clear change history, consistent, reproducible deployment across staging and production environments) to be applied to dashboard configuration as well, avoiding the genuine risk of dashboards silently drifting inconsistently across environments or losing track of who changed what and why over time.

11. **How would you diagnose a Grafana dashboard that's loading very slowly?**
    Model answer: first isolate whether the bottleneck is Grafana itself or the underlying data source, by testing the specific panel's query directly against the data source (Prometheus's own query browser, for instance) independent of Grafana's rendering — if the query itself is slow at the source, consider a recording rule (for Prometheus) to pre-compute the expensive aggregation; if the query is fast at the source but the dashboard as a whole is slow, consider whether the dashboard has an excessive number of simultaneously-querying panels, an overly wide time range multiplying the amount of data each panel needs to process, or an aggressive auto-refresh interval adding unnecessary repeated query load.

12. **Design a dashboard strategy for an organization moving from ad-hoc, hand-built dashboards to a mature, scalable dashboarding practice.**
    Model answer: adopt dashboard-as-code (version-controlled JSON with automated provisioning) as the foundational practice enabling review and consistency; establish shared organization-wide conventions (consistent color schemes, threshold conventions, and panel-type choices) reducing cognitive load when engineers move between different teams' dashboards; build TEMPLATED dashboards using variables for common patterns (a RED-method service-health template usable across every service, rather than one hand-built dashboard per service); and establish a periodic dashboard review/curation practice tied to post-incident retrospectives, actively removing panels that don't genuinely inform real investigative needs and adding ones that repeated incidents reveal were actually missing.
`,

  "coding-questions": `
### 1. Write a dashboard JSON snippet implementing a templated, variable-driven panel

~~~json
{
  "templating": {
    "list": [
      {
        "name": "service",
        "type": "query",
        "query": "label_values(http_requests_total, service)"
      }
    ]
  },
  "panels": [
    {
      "title": "Request Rate for $service",
      "type": "timeseries",
      "targets": [
        {"expr": "rate(http_requests_total{service=\\"$service\\"}[5m])"}
      ]
    }
  ]
}
# Follow-up: why does defining the "service" variable via a
# label_values() query (rather than hardcoding a fixed list of
# service names) ensure the dashboard automatically stays correct
# as new services are added or old ones are removed, without any
# manual dashboard update required?
~~~

### 2. Implement a validation script checking dashboard JSON for common issues

~~~python
import json

def validate_dashboard(dashboard_path):
    with open(dashboard_path) as f:
        data = json.load(f)
    dashboard = data["dashboard"]
    issues = []
    if len(dashboard.get("panels", [])) > 20:
        issues.append("Dashboard has excessive panel count (over 20) -- consider curation")
    for panel in dashboard.get("panels", []):
        if "targets" not in panel or not panel["targets"]:
            issues.append("Panel '" + panel.get("title", "untitled") + "' has no query targets")
    return issues
# Follow-up: why is automating checks like "excessive panel count"
# and "panels with no query" valuable as part of a CI pipeline for
# dashboard-as-code, rather than relying solely on manual dashboard
# review to catch these issues?
~~~

### 3. Implement a RED-method dashboard structure generator

~~~python
def generate_red_dashboard(service_name):
    return {
        "dashboard": {
            "title": service_name + " - RED Metrics",
            "panels": [
                {"title": "Rate", "targets": [{"expr": "rate(http_requests_total{service=\\"" + service_name + "\\"}[5m])"}]},
                {"title": "Errors", "targets": [{"expr": "rate(http_requests_total{service=\\"" + service_name + "\\",status=~\\"5..\\"}[5m])"}]},
                {"title": "Duration (p95)", "targets": [{"expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service=\\"" + service_name + "\\"}[5m]))"}]},
            ]
        }
    }
# Follow-up: how would you refactor this to use a dashboard
# VARIABLE (as in question 1) instead of generating a separate,
# hardcoded JSON file per service, and why is the variable-based
# approach preferable for an organization with many services?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a basic dashboard against a Prometheus data source
Configure a Prometheus data source in a local Grafana instance, build a dashboard with time series, gauge, and table panels visualizing sample metric data. Deliverable: a working dashboard with at least three different panel types. Skills exercised: data source configuration, basic panel building.

### Lab 2 (Intermediate): Build a templated, variable-driven dashboard
Given metrics data for multiple simulated services, build a single templated dashboard using a dashboard variable to switch between viewing any specific service's RED metrics. Deliverable: a working templated dashboard demonstrating variable-driven reuse across multiple services. Skills exercised: dashboard variables, RED-method dashboard design.

### Lab 3 (Advanced): Implement dashboard-as-code with provisioning and CI validation
Define a dashboard as version-controlled JSON, configure Grafana provisioning to load it automatically, and write a CI validation script checking for common dashboard issues (excessive panel count, panels with no queries). Deliverable: a working dashboard-as-code setup with passing CI validation. Skills exercised: dashboard-as-code, provisioning, automated validation.

### Lab 4 (Production): Build a unified LGTM-stack investigation dashboard
Set up local Loki, Tempo, and Mimir (or Prometheus) instances alongside Grafana, instrument a sample application to send data to all three, and build a dashboard demonstrating a complete cross-pillar investigation (from a metrics anomaly, to a linked trace, to that trace's detailed logs). Deliverable: a working LGTM-stack demonstration with documented cross-pillar navigation. Skills exercised: LGTM stack integration, exemplar-based cross-pillar linking.
`,

  "real-projects": `
### 1. An organization-wide RED/USE dashboard template library
Engineering requirements: templated, variable-driven dashboard definitions implementing the RED method for every service and the USE method for shared infrastructure resources, managed as dashboard-as-code with consistent organization-wide color/threshold conventions.

### 2. An SLO/error-budget visualization and alerting system
Engineering requirements: dashboards visualizing SLI/SLO/error-budget burn rate directly (building on the **Metrics** skill's reliability engineering framework), combined with Grafana-native or Prometheus-native alerting implementing multi-window, multi-burn-rate logic.

### 3. A unified, cross-pillar incident investigation platform
Engineering requirements: a deployed LGTM stack (or equivalent) with metrics, logs, and traces all flowing into Grafana, exemplars and shared trace IDs correctly configured for fluid cross-pillar navigation, directly reducing mean-time-to-diagnosis for genuine production incidents.
`,

  "case-studies": `
### Grafana's origin as a Kibana fork addressing a specific gap
Grafana's creation as a fork of Kibana, motivated specifically by Kibana's tight coupling to Elasticsearch not serving Graphite's time-series data model well, illustrates how a genuinely well-scoped, specific technical gap (visualization for a different underlying data model) can motivate a new project that eventually grows into something far more broadly useful than its original narrow motivation. Lesson: a project's origin story (a specific, narrow gap in an existing tool) doesn't constrain its eventual scope — Grafana's data-source-agnostic architecture, developed to solve a narrow Graphite-versus-Kibana problem, turned out to be exactly the right foundation for an entire industry's subsequent diversification of observability backends.

### The LGTM stack as a deliberate, vertically-integrated observability strategy
Grafana Labs' subsequent development of Loki, Tempo, and Mimir — each specifically designed to integrate tightly with Grafana while remaining built on open standards (Prometheus's data model and query language, specifically) — represents a deliberate business and product strategy: rather than remaining purely a visualization layer dependent entirely on other vendors' underlying storage systems, Grafana Labs built out a complete, vertically-integrated observability stack while still preserving compatibility with the broader open ecosystem (Mimir remains Prometheus-compatible, for instance). Lesson: a company can pursue vertical integration (owning more of the stack) without necessarily sacrificing the open, pluggable architecture that made its original product valuable — Grafana remains genuinely data-source-agnostic even as Grafana Labs increasingly offers its own integrated alternative for each pillar.

### Dashboard sprawl as a widely-recognized, recurring organizational anti-pattern
The common, widely-discussed industry pattern of organizations accumulating hundreds of unused, outdated, or overly-cluttered dashboards over time (sometimes called "dashboard graveyards") — dashboards created for a specific past incident and never cleaned up, or built by engineers who have since left the team — reflects a genuine, recurring organizational challenge distinct from any specific tool's technical capabilities. Lesson: even with excellent underlying tooling (Grafana's genuinely powerful, flexible dashboarding capability), the ORGANIZATIONAL DISCIPLINE of curating, reviewing, and retiring dashboards over time is a separate, equally important practice — powerful tooling alone doesn't prevent the accumulation of unfocused, low-value artifacts without deliberate, ongoing curation effort.
`,

  comparisons: `
| Aspect | Grafana | Kibana |
|--------|---------|--------|
| Data source model | Data-source-agnostic, pluggable across dozens of backends | Tightly coupled to Elasticsearch specifically |
| Primary use case | Broad, unified visualization across metrics/logs/traces | Elasticsearch-specific search and log visualization |
| Origin | Forked from Kibana to better support Graphite | The original ELK stack visualization component |

| Aspect | Grafana-native alerting | Prometheus Alertmanager |
|--------|---------------------------|-------------------------------|
| Data source scope | Any configured Grafana data source | Prometheus-specific |
| Best fit | Heterogeneous, multi-backend alerting needs | Prometheus-centric setups with existing Alertmanager investment |

**How seniors choose**: use Grafana as the default, unifying visualization layer across whatever heterogeneous set of metrics/logs/tracing backends an organization actually uses; choose between Grafana-native and Prometheus-native alerting based on genuine data source topology, not by default; adopt the LGTM stack specifically when a single-vendor, vertically-integrated observability platform genuinely fits an organization's needs better than assembling separate best-of-breed tools per pillar.
`,

  "related-technologies": `
- **Metrics** and **Prometheus** — the theoretical foundation and dominant concrete metrics backend Grafana most commonly visualizes.
- **Logging** and **Tracing** — the two other observability pillars Grafana increasingly unifies alongside metrics, particularly via the LGTM stack.
- **OpenTelemetry** — the vendor-neutral instrumentation standard feeding data into the metrics/logs/traces backends Grafana visualizes.
- **Kubernetes** — the platform whose ecosystem (via the kube-prometheus-stack) commonly bundles Grafana as the default visualization layer.
- **Loki, Tempo, Mimir** — Grafana Labs' own companion products completing the LGTM stack's full observability coverage.

Learning path: **Metrics** → **Prometheus** → this page → **OpenTelemetry** for the unifying instrumentation standard across all visualized signals.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Grafana remains the dominant, data-source-agnostic visualization standard across the observability landscape, with continued strong adoption of the LGTM stack for organizations wanting an integrated, single-vendor solution.
- Continued growth of Grafana's own native alerting capabilities and dashboard-as-code tooling, reflecting broader industry emphasis on treating observability configuration as genuine, reviewable code.
- Growing adoption of exemplar-based cross-pillar linking (metrics to traces to logs) as standard practice within mature Grafana deployments.
- Given the pace of feature development across Grafana and its companion LGTM products, verify current capabilities and best-practice recommendations against Grafana's own official documentation.
`,

  "future-roadmap": `
Where Grafana is heading, and what's worth betting career time on:

- **Continued dominance as the standard, vendor-neutral visualization layer** across an increasingly diverse observability backend landscape.
- **Continued growth of the LGTM stack** as a genuinely integrated, single-vendor alternative to assembling separate best-of-breed tools per observability pillar.
- **Growing sophistication in dashboard-as-code and automated dashboard quality/consistency checking**, addressing the recurring "dashboard sprawl" organizational challenge with better tooling discipline.
- **What to bet on**: deeply understanding dashboard design principles (curating around genuine investigative questions, using the RED/USE/SLO frameworks, choosing appropriate panel types) and the data-source-agnostic architecture's practical implications — these transfer directly across any specific Grafana version or even alternative dashboarding tools, a far more durable investment than familiarity with any single dashboard's specific JSON configuration syntax.
`,

  "cheat-sheet": `
~~~
# ---- Grafana = a query-and-render LAYER, not a data store (for base product) ----
# Dashboard -> Panels -> each panel: a query against a configured Data Source

# ---- Panel type selection ----
Time series: how a value changes over TIME (rate, latency trend)
Gauge:       a single CURRENT value against a threshold
Heatmap:     a DISTRIBUTION changing over time (full latency shape)
Table:       ranked/tabular data (top 10 slowest endpoints)
Stat:        one prominent headline number (error budget remaining)
~~~

~~~json
// ---- Dashboard variables: template ONE dashboard, reuse everywhere ----
{"templating": {"list": [{"name": "service", "query": "label_values(http_requests_total, service)"}]}}
// Then: rate(http_requests_total{service="$service"}[5m])
// -- NEVER hand-build a near-duplicate dashboard per service
~~~

~~~
# ---- Dashboard design: curate, don't accumulate ----
# WRONG: 40+ panels, no structure -- increases cognitive load DURING incidents
# RIGHT: structure around RED (rate/errors/duration) or USE (util/saturation/errors)

# ---- Alerting: a genuine architectural CHOICE ----
Grafana-native alerting  -> unified across MULTIPLE heterogeneous data sources
Prometheus Alertmanager  -> Prometheus-centric, existing investment
# Don't default to either -- decide based on your actual data source topology

# ---- Dashboard as code ----
# Version-controlled JSON + automated provisioning, NOT manual UI-only config
# -> reviewable, consistent across environments, no silent drift
~~~

~~~
# ---- The LGTM stack: one vendor, all three pillars, open standards ----
Loki (logs) + Grafana (viz) + Tempo (traces) + Mimir (Prometheus-compatible metrics)

# ---- Exemplars: click from a metric spike straight to a real trace ----
# Bridges aggregate metrics view with per-request tracing depth, in ONE tool

# ---- Grafana's performance is bounded by its DATA SOURCES ----
# A slow/overloaded Prometheus = a slow/broken dashboard -- Grafana has no fallback data
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is Grafana, fundamentally? | A data-source-agnostic query-and-render visualization layer -- not a data store itself. |
| Why "data-source-agnostic"? | Same dashboard/alerting UX across Prometheus, Elasticsearch, and dozens of other backends. |
| What is a dashboard variable for? | Templating ONE dashboard to serve many contexts (services, envs) via a dropdown. |
| What is the LGTM stack? | Loki (logs), Grafana (viz), Tempo (traces), Mimir (metrics) -- one integrated, open stack. |
| Grafana-native vs Prometheus Alertmanager alerting? | Grafana: unified across heterogeneous sources. Alertmanager: Prometheus-centric, established. |
| #1 dashboard design anti-pattern? | Dashboard sprawl -- too many panels increases cognitive load DURING incidents. |
| What are exemplars? | Data points linking a metric observation directly to a representative trace. |
| Why adopt "dashboard as code"? | Reviewable, versioned, consistently reproducible across environments -- no silent drift. |
| What frameworks should structure dashboards? | RED (services), USE (resources), SLO/error-budget (reliability). |
| Why is Grafana's own performance bounded by its data sources? | It queries fresh each time -- no independent fallback data of its own. |
| Grafana's historical origin? | A fork of Kibana, created to better support Graphite's time-series model. |
| Key dashboard maintenance discipline? | Periodic curation tied to incident retrospectives -- remove low-value panels. |
`,

  mcqs: `
1. What does it mean that Grafana is "data-source-agnostic"?
   A) It requires no configuration  B) The same dashboarding and alerting features work consistently across many different underlying backends (Prometheus, Elasticsearch, and more)  C) It only works with one specific database  D) It generates its own data
   **Answer: B** — a pluggable data-source abstraction is Grafana's core, defining architectural choice.

2. What is a dashboard variable used for?
   A) Storing user passwords  B) Letting one dashboard definition serve many different specific contexts (like different services) via a dropdown selection  C) Encrypting dashboard data  D) Speeding up queries automatically
   **Answer: B** — avoiding the need to hand-build near-duplicate dashboards per instance.

3. What is the LGTM stack?
   A) A programming language  B) Loki, Grafana, Tempo, and Mimir -- an integrated open-source stack covering logs, visualization, tracing, and metrics  C) A type of database index  D) A Kubernetes deployment strategy
   **Answer: B** — a vertically-integrated, single-vendor implementation of all three observability pillars.

4. Why is dashboard sprawl (too many panels, no clear structure) considered a genuine anti-pattern?
   A) It uses more disk space  B) It increases cognitive load precisely during high-stress incident investigation when fast comprehension matters most  C) It's illegal in most organizations  D) It makes Grafana crash
   **Answer: B** — effective dashboards are curated around specific investigative questions, not exhaustive metric dumps.

5. What are exemplars used for in Grafana?
   A) Example dashboard templates  B) Linking a specific metric data point directly to a representative trace, enabling cross-pillar investigation  C) A type of alerting rule  D) A backup mechanism
   **Answer: B** — bridging metrics' aggregate view with tracing's per-request depth within one tool.

6. Why is Grafana's own dashboard performance fundamentally bounded by its underlying data sources?
   A) Grafana doesn't support caching at all  B) Grafana is primarily a query-and-render layer that queries data sources fresh each time, with no independent data store of its own (for the base product)  C) Grafana only works offline  D) Data sources are always faster than Grafana
   **Answer: B** — a slow or unavailable Prometheus instance directly produces a slow or broken dashboard.
`,

  "revision-notes": `
Grafana is an open-source, DATA-SOURCE-AGNOSTIC visualization and dashboarding platform — its most defining architectural choice, originating from its creation as a fork of Kibana specifically to better support Graphite's time-series data model, is a pluggable data-source abstraction letting the same dashboarding and alerting features work consistently across dozens of different underlying backends (Prometheus, Elasticsearch, cloud-provider metrics, and many others). This design turned out to be genuinely prescient well beyond its original narrow motivation, letting Grafana become the SHARED, unifying visualization layer across the entire, increasingly-fragmented modern observability landscape.

DASHBOARDS are collections of PANELS (individual visualizations, each configured with a specific query against a data source and a visualization type) arranged to present a coherent system view. Panel type selection is a genuine design skill: TIME SERIES graphs for trends over time, GAUGES for a single current value against a threshold, HEATMAPS for a full distribution's evolution, TABLES for ranked/tabular data, and STAT panels for a single prominent headline number — choosing a panel type that doesn't match the data's actual shape (cramming a distribution into an average, for instance) loses genuine diagnostic information.

DASHBOARD VARIABLES let one dashboard definition serve many specific contexts (different services, environments) via a dropdown selection, avoiding the significant, ongoing maintenance burden of hand-building near-duplicate dashboards per instance — a variable's underlying query (commonly label_values() against the data source) should be dynamic, so the dashboard automatically stays correct as the underlying set of services/environments changes, without manual dashboard updates.

Grafana Labs' "LGTM STACK" — Loki (log aggregation), Grafana (visualization), Tempo (distributed tracing), and Mimir (horizontally-scalable, Prometheus-compatible metrics storage) — provides a genuinely integrated, vertically-consistent, single-vendor implementation of all three observability pillars, built on open standards rather than a fully proprietary approach. EXEMPLARS — specific metric data points annotated with a representative trace ID — enable fluid cross-pillar investigation directly within Grafana's UI: an engineer can click from a concerning latency bucket on a metrics panel directly to a specific example trace, and from that trace to its detailed logs (via shared trace/span IDs), all within one coherent tool rather than manually cross-referencing separate, disconnected systems.

A genuinely important architectural decision, not a default: choosing between GRAFANA-NATIVE ALERTING (which can evaluate and alert across multiple, heterogeneous data sources uniformly) and a specific backend's own native alerting (Prometheus's Alertmanager, most commonly) — the right choice depends on your actual data source topology (genuinely heterogeneous backends favor Grafana-native alerting; a Prometheus-centric setup with existing Alertmanager investment may not need to switch).

DASHBOARD-AS-CODE — defining dashboards as version-controlled JSON, applied via automated provisioning rather than manual, untracked UI configuration — enables the same collaborative engineering discipline (code review, change history, consistent multi-environment deployment) applied to application code to extend to dashboard configuration as well, a genuinely valuable practice directly analogous to broader infrastructure-as-code principles.

The single most important, senior-level dashboard design discipline is recognizing that MORE PANELS ARE NOT AUTOMATICALLY BETTER — "dashboard sprawl" (accumulating an unfocused, exhaustive collection of every conceivable metric with no clear organizing structure) genuinely INCREASES cognitive load precisely during the high-stress moments (an active incident) when fast, clear comprehension matters most. Effective dashboards are deliberately CURATED around specific investigative questions — commonly structured directly around the RED method (rate, errors, duration) for services, the USE method (utilization, saturation, errors) for resources, or SLO/error-budget burn-rate visualization for reliability tracking, all frameworks covered in the **Metrics** skill — with periodic review tied to post-incident retrospectives determining what information genuinely helped (or would have helped) real investigations, rather than treating dashboard design as a one-time setup task. A senior engineer also recognizes that Grafana's own dashboard performance is fundamentally bounded by its underlying data sources' performance, since Grafana itself queries fresh data on each load (for the base product) rather than maintaining an independent data store to fall back on.
`,

  "learning-roadmap": `
**Week 1 — Data sources and basic dashboards**: configuring a Prometheus data source and building basic panels (time series, gauge, table). Milestone: build a working dashboard with at least three different panel types (Lab 1).

**Week 2 — Dashboard variables and templating**: building a single templated dashboard reusable across multiple services/environments. Milestone: build a working templated RED-method dashboard demonstrating variable-driven reuse (Lab 2).

**Week 3 — Dashboard-as-code and validation**: defining dashboards as version-controlled JSON with automated provisioning and CI validation. Milestone: complete a dashboard-as-code setup with a passing CI validation script (Lab 3).

**Week 4 — Alerting configuration**: configuring Grafana-native alerting and understanding its relationship to backend-native alerting. Milestone: implement and test a Grafana-native alert rule against sample data.

**Week 5 — The LGTM stack and cross-pillar investigation**: setting up Loki, Tempo, and Mimir alongside Grafana, and using exemplars for cross-pillar navigation. Milestone: complete Lab 4, demonstrating a full metrics-to-trace-to-logs investigation workflow.

**Week 6 — Dashboard design discipline and organizational practice**: applying RED/USE/SLO frameworks deliberately, and establishing dashboard curation and access-control practices. Milestone: review and refactor an intentionally over-cluttered "dashboard sprawl" example into a focused, well-curated design.

Next platform skill once this roadmap is complete: **OpenTelemetry** for the unifying instrumentation standard feeding data into Prometheus/Loki/Tempo, completing this category's coverage of the three observability pillars and their concrete tooling.
`,

  "official-docs": `
- **Grafana's official documentation** (grafana.com/docs/grafana) — the comprehensive, authoritative reference for dashboards, panels, data sources, and alerting.
- **Grafana Labs' documentation on the LGTM stack** (Loki, Tempo, Mimir) — practical guidance for the integrated observability platform.
- **The Grafana dashboard provisioning documentation** — the authoritative reference for dashboard-as-code and automated configuration.
`,

  books: `
- **"Grafana Cookbook" — various authors** — practical, recipe-style guidance for common Grafana dashboarding and configuration tasks.
- **"Observability Engineering" — Charity Majors, Liz Fong-Jones, George Miranda** — covers dashboard design and cross-pillar observability practice broadly, directly applicable to Grafana usage.
- **"Site Reliability Engineering" and "The Site Reliability Workbook" — Google** — cover the SLO/dashboard design principles commonly implemented via Grafana.
`,

  blogs: `
- **Grafana Labs' own engineering blog** — extensive, authoritative writing on dashboard design, the LGTM stack, and observability best practices directly from the maintainers.
- **Various "dashboard design best practices" blog posts** across the software engineering community, covering the cognitive-load and curation concerns discussed throughout this page.
- **Company engineering blogs** documenting their own Grafana-based observability practice and lessons learned.
`,

  "research-papers": `
Grafana, as an industry/practitioner-driven open-source visualization project rather than pure academic research, has limited dedicated peer-reviewed literature; the most relevant related sources:

- General data visualization and dashboard design literature (Edward Tufte's work on information design, broadly) provides theoretical grounding for effective panel/dashboard design choices.
- See the **Metrics**, **Logging**, and **Tracing** skills' own research references for the theoretical foundations Grafana visualizes concretely.
`,

  videos: `
- **GrafanaCON (the official Grafana conference) talks** — the primary venue for in-depth Grafana technical content and dashboard design best practices directly from the maintainer community and practitioner ecosystem.
- **Grafana Labs' own tutorial and product update videos** — practical guidance on new features and the broader LGTM stack.
- **Various "dashboard design" conference talks** covering the UX/cognitive-load considerations discussed throughout this page.
`,

  "github-repos": `
- **grafana/grafana** — the official Grafana source repository.
- **grafana/loki**, **grafana/tempo**, **grafana/mimir** — the official source repositories for the remaining LGTM stack components.
- **grafana/dashboards** and various community dashboard repositories — curated, reusable dashboard templates for common services and infrastructure.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Basic dashboard building**: configure a data source and build panels of at least three different types visualizing sample data.
2. **Templating practice**: build a single templated dashboard using dashboard variables, verifying it correctly switches between multiple different underlying service contexts.
3. **Dashboard-as-code**: define a dashboard as version-controlled JSON, configure provisioning, and write a validation script checking for common issues (excessive panel count, missing queries).
4. **Alerting configuration**: implement a Grafana-native alert rule and test its firing/non-firing behavior against known scenarios.
5. **Cross-pillar investigation**: set up a minimal LGTM-stack-style environment and demonstrate navigating from a metrics anomaly to a linked trace to that trace's logs.
6. **External practice sets**: Grafana's own official tutorials and the kube-prometheus-stack's included example dashboards for structured, guided practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph DataSources["Data Sources"]
        Prometheus["Prometheus/Mimir\n(metrics)"]
        Loki["Loki\n(logs)"]
        Tempo["Tempo/Jaeger\n(traces)"]
    end
    subgraph GrafanaCore["Grafana"]
        QueryEngine["Query Engine"]
        Dashboards["Dashboards\n(panels + variables)"]
        AlertEngine["Alerting Engine"]
    end
    subgraph Users["Engineers"]
        Dashboard["Dashboard viewing"]
        Investigation["Cross-pillar\ninvestigation via exemplars"]
    end
    subgraph AsCode["Dashboard as Code"]
        JSON["Version-controlled\ndashboard JSON"]
        Provisioning["Automated provisioning"]
    end
    Prometheus --> QueryEngine
    Loki --> QueryEngine
    Tempo --> QueryEngine
    QueryEngine --> Dashboards
    Dashboards --> Dashboard
    Dashboards --> Investigation
    QueryEngine --> AlertEngine
    JSON --> Provisioning --> Dashboards
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Grafana))
    Foundations
      Overview
      History Kibana fork Graphite
      Why it exists
      Problem it solves
    Core Concepts
      Dashboards and panels
      Data source abstraction
      Panel types
    Templating
      Dashboard variables
      Reusable templates
    Alerting
      Grafana native alerting
      Versus Alertmanager
    LGTM Stack
      Loki logs
      Tempo traces
      Mimir metrics
      Exemplars cross pillar
    Dashboard Design
      RED USE SLO frameworks
      Avoiding dashboard sprawl
      Cognitive load
    Operations
      Dashboard as code
      Provisioning
      Access control
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default grafana;
