import type { SkillContent } from "../types";

const apiGateway: SkillContent = {
  overview: `
An API gateway is a single entry point that sits in front of a collection of backend services (often, but not necessarily, microservices), handling cross-API concerns like authentication, rate limiting, request/response transformation, and routing — building directly on top of the reverse-proxying foundation covered in the immediately preceding **Reverse Proxy** skill, but adding a further layer of API-specific capability that a plain reverse proxy alone doesn't provide.

For an AI engineer, an API gateway directly explains how a company can expose dozens of internal microservices behind one clean, versioned, authenticated public API surface, how per-client rate limiting protects backend services (including, notably, LLM inference endpoints, which are often expensive per-request) from being overwhelmed by any single caller, and how request/response transformation lets internal services evolve their own data formats independently of what's actually promised to external API consumers.

Key characteristics: **the single entry point property**, exactly like a reverse proxy but specifically framed around API consumers rather than generic HTTP clients; **authentication and authorization centralization**, verifying API keys, JWTs, or OAuth tokens once at the gateway rather than in every individual backend service; **rate limiting and quota enforcement**, protecting backend capacity on a per-client, per-API-key basis; **request/response transformation**, translating between an external API contract and internal service formats; and **its close relationship to the Reverse Proxy skill**, since many API gateway products (Kong, and Envoy-based gateways) are literally built on top of reverse proxy technology, adding this further API-specific layer.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2000s | Early **Enterprise Service Buses (ESBs)** attempt to centralize integration and routing logic for service-oriented architectures, an important conceptual precursor to the modern API gateway, though heavier-weight and more tightly coupled to enterprise integration patterns |
| 2011 | **Netflix** publicly discusses its internal API gateway (Zuul, released as open source in 2013), directly motivated by the need to expose a growing, rapidly-changing microservices architecture behind a single, stable, client-friendly API surface |
| 2015 | **Kong** (built on top of NGINX) is released, becoming one of the most widely adopted open-source API gateway products |
| 2015 onward | **Cloud provider managed API gateway services** (AWS API Gateway launching in 2015, later Azure API Management, GCP API Gateway) make production-grade API gateway capability available as a fully-managed service |
| 2016 onward | **Envoy's** rise as a modern, cloud-native proxy directly enables a new generation of API gateway products built on its extensible architecture (Ambassador, among others) |
| 2020s | API gateways become a standard, near-universal component of microservices architectures, and increasingly integrate directly with Kubernetes via the **Gateway API** specification, an evolution beyond the original Ingress resource |

API gateway history reflects the specific, concrete challenge microservices architectures introduced: as a monolith is decomposed into many independent services, SOMETHING needs to present a single, coherent, manageable API surface to external consumers rather than requiring them to understand and directly call dozens of individual internal services — the API gateway is the industry's converged answer to this specific, recurring need.
`,

  "why-it-exists": `
API gateways exist because decomposing a system into microservices (each independently deployable, each potentially owning its own data and API) creates a genuine, practical problem for anyone actually trying to CONSUME that system's functionality: an external client (or even another internal team) would otherwise need to know about, authenticate against, and directly call many individual services, each with potentially inconsistent conventions, and any change to internal service topology would be immediately, directly visible to every consumer.

An API gateway solves this by presenting one single, stable, well-documented API surface to consumers, internally routing each request to whichever backend service actually implements that functionality — directly extending the **Reverse Proxy** skill's own topology-hiding motivation, but adding the specifically API-consumer-facing concerns (authentication, rate limiting per API client, consistent request/response contracts, versioning) that a generic reverse proxy alone doesn't address. This is precisely why API gateways became essential infrastructure as the industry's broader shift toward microservices architectures accelerated.
`,

  "problem-it-solves": `
API gateways solve the **"how do we present a single, consistent, secured, and well-managed API surface to consumers of a system built from many independent backend services"** problem.

Concretely, they provide:

- **Centralized authentication and authorization**: verifying API keys, JWTs, or OAuth tokens once at the gateway, rather than duplicating this logic across every backend service.
- **Per-client rate limiting and quota enforcement**: protecting backend capacity from being overwhelmed by any single API consumer, and enabling tiered API access plans (free tier, paid tier, and others).
- **Request/response transformation**: translating between a stable, external-facing API contract and internal services' own, potentially different, data formats — letting internal services evolve independently.
- **API versioning**: supporting multiple concurrent API versions, routing each to the appropriate backend implementation, letting consumers migrate to a new version on their own schedule.
- **Aggregation**: in some cases, combining responses from multiple backend services into a single consumer-facing response, reducing the number of round trips an external client needs to make.

What API gateways do **not** solve, or solve only partially: an API gateway itself must be made highly available, reusing the same redundancy concerns covered in the **Load Balancers** and **Reverse Proxy** skills; an API gateway centralizing too much business logic (rather than genuinely cross-cutting API concerns) risks becoming an overloaded, hard-to-maintain bottleneck for change — a genuine architectural risk worth deliberately guarding against, covered in this page's anti-patterns section.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what an API gateway is and how it extends reverse-proxy functionality with API-specific concerns.
2. Explain centralized authentication/authorization and per-client rate limiting at the gateway layer.
3. Explain request/response transformation and API versioning strategies.
4. Recognize the "smart gateway, dumb pipes" anti-pattern and why over-centralizing business logic is risky.
5. Compare API gateway products (Kong, cloud-managed gateways, Envoy-based gateways) and their tradeoffs.
6. Connect API gateways to reverse proxies, load balancers, and the broader microservices architecture they front.
7. Answer senior-level interview questions on API gateway design and rate-limiting strategy.
`,

  prerequisites: `
- **Required**: the **Reverse Proxy** skill — API gateways build directly on top of reverse-proxying, adding API-specific capability.
- **Required**: the **OAuth**, **JWT**, and **REST** skills — API gateways directly implement authentication and API-contract concerns covered there.
- **Very helpful**: the **Load Balancers** skill for the underlying traffic-distribution and high-availability concerns.

Dependency chain: **Reverse Proxy** → this page → **CDN** for the progressively more application-aware System Design technologies built on this foundation.
`,

  "beginner-concepts": `
### The basic idea

~~~mermaid
flowchart LR
    Client["API Consumer"] --> GW["API Gateway"]
    GW --> UsersSvc["Users Service"]
    GW --> OrdersSvc["Orders Service"]
    GW --> InventorySvc["Inventory Service"]
~~~

The API consumer only ever calls the gateway's single, stable, documented API surface; the gateway internally routes each request to whichever backend service actually implements that specific piece of functionality.

### Centralized authentication

~~~
Every request arriving at the gateway must present a valid
API key, JWT, or OAuth token. The gateway verifies this ONCE,
before forwarding the request to any backend service --
backend services can then trust that any request reaching
them has already been authenticated.
~~~

This directly connects to the **JWT** and **OAuth** skills' own treatment of token validation — centralizing it at the gateway avoids every individual backend service needing to reimplement the same verification logic.

### Basic rate limiting

~~~
API key "abc123" -> limited to 100 requests per minute
If exceeded: gateway returns 429 Too Many Requests,
    WITHOUT the request ever reaching a backend service.
~~~

Rate limiting at the gateway protects backend capacity from being overwhelmed by any single API consumer, and lets an API provider offer differentiated access tiers (a free tier with a low limit, a paid tier with a higher one).

### A simple API versioning example

~~~
/v1/users  -> routes to the Users Service's v1 implementation
/v2/users  -> routes to the Users Service's v2 implementation
    (perhaps a newer, redesigned version of the same service)
~~~

Versioning at the gateway lets API consumers choose which version to call, and lets a provider run multiple versions simultaneously during a migration period, without breaking existing consumers.
`,

  "intermediate-concepts": `
### Request/response transformation

~~~
External API contract: { "user_id": 123, "full_name": "Ada" }
Internal service's actual format: { "id": 123, "first": "Ada",
    "last": "Lovelace" }

The gateway transforms between these two formats, letting the
internal service's data model evolve independently of what's
actually promised to external consumers.
~~~

This transformation capability is a genuinely valuable form of encapsulation — internal services can refactor their own data models freely, as long as the gateway's transformation logic is updated to preserve the external-facing contract consumers depend on.

### Response aggregation

~~~mermaid
sequenceDiagram
    participant Client
    participant GW as API Gateway
    participant Users as Users Service
    participant Orders as Orders Service

    Client->>GW: GET /users/123/dashboard
    GW->>Users: GET /users/123
    GW->>Orders: GET /orders?user_id=123
    Users-->>GW: user data
    Orders-->>GW: order data
    GW->>GW: combine into one response
    GW-->>Client: combined dashboard response
~~~

Aggregation lets a single external API call trigger multiple internal service calls, combining their results into one consumer-facing response — reducing the number of round trips an external client (especially one on a high-latency mobile connection) needs to make, at the cost of the gateway itself taking on this aggregation logic.

### Quota tiers and API monetization

~~~
free_tier:  100 requests/day
pro_tier:   10,000 requests/day
enterprise_tier: custom negotiated limit
~~~

Gateway-enforced quota tiers are a common foundation for API monetization strategies, letting a business offer differentiated access levels tied to a subscription or pricing plan, enforced consistently and centrally rather than scattered across individual backend services.

### The "smart gateway, dumb pipes" anti-pattern

~~~
A genuine architectural risk: as an API gateway accumulates
MORE and more logic (business rules, complex orchestration,
service-specific validation), it risks becoming an overloaded,
tightly-coupled bottleneck that every team must coordinate
through for any change -- effectively recreating many of the
coordination problems microservices were meant to avoid.
~~~

The platform-wide guidance is to keep the gateway focused on genuinely cross-cutting API concerns (auth, rate limiting, routing, basic transformation) and resist the temptation to centralize deep business logic there, preserving individual services' autonomy.
`,

  "advanced-concepts": `
### Backend-for-Frontend (BFF) pattern

~~~mermaid
flowchart LR
    MobileClient["Mobile App"] --> MobileBFF["Mobile BFF Gateway"]
    WebClient["Web App"] --> WebBFF["Web BFF Gateway"]
    MobileBFF --> Services["Shared Backend Services"]
    WebBFF --> Services
~~~

Rather than one single, generic API gateway serving every type of client identically, the Backend-for-Frontend pattern uses SEPARATE, purpose-built gateway layers tailored to each specific consumer type's actual needs (a mobile app might need more aggressive response aggregation and payload minimization than a web app on a fast connection) — a deliberate specialization tradeoff, adding operational complexity in exchange for each client type getting an interface genuinely optimized for its own needs.

### Circuit breaking and fallback responses at the gateway

~~~
If a backend service is failing (timing out, returning
errors) beyond a configured threshold, the gateway can
"trip" a circuit breaker for that service -- immediately
returning a fallback response (or a fast failure) rather
than continuing to send requests to a service that's
currently unable to handle them, and periodically probing
to detect when the service recovers.
~~~

This directly connects to the **Distributed Systems** skill's own treatment of partial failure — a gateway-level circuit breaker prevents a single failing backend service from degrading the entire gateway's responsiveness for unrelated requests.

### API gateway as the natural home for observability

~~~
Because ALL API traffic passes through the gateway, it's a
natural, centralized point to collect consistent request/
response logging, latency metrics, and distributed tracing
span initiation -- directly connecting to the Logging,
Metrics, and Tracing skills' own observability concerns.
~~~

### GraphQL gateways and schema federation

~~~
Some modern API gateways specifically support GraphQL,
FEDERATING multiple backend services' individual GraphQL
schemas into one combined, consumer-facing schema -- letting
a client issue ONE GraphQL query that the gateway internally
resolves by querying multiple backend services as needed,
directly connecting to the GraphQL skill's own treatment
of this technology.
~~~
`,

  "internal-working": `
Tracing a request through an API gateway performing authentication, rate limiting, and routing:

~~~mermaid
sequenceDiagram
    participant Client
    participant GW as API Gateway
    participant Auth as Auth Verification
    participant RateLimit as Rate Limiter
    participant Backend as Orders Service

    Client->>GW: GET /v1/orders (with API key)
    GW->>Auth: verify API key / JWT
    Auth-->>GW: valid, client_id=abc123
    GW->>RateLimit: check quota for client_id=abc123
    RateLimit-->>GW: within limit (42/100 used this minute)
    GW->>GW: route based on path (/v1/orders -> Orders Service)
    GW->>Backend: forward request (with client_id header added)
    Backend-->>GW: response
    GW->>GW: transform response to external contract
    GW-->>Client: transformed response
~~~

1. **Authentication is verified first**, before any further processing — an invalid credential is rejected immediately, never reaching rate limiting or routing logic.
2. **Rate limiting is checked next**, against the authenticated client's specific quota — exceeding it returns an immediate 429 response without ever reaching a backend service.
3. **Routing directs the request to the appropriate backend service** based on the request path (and potentially its version).
4. **The backend's response is transformed** to match the external-facing API contract before being returned to the client.

**Why this matters**: this concrete ordering (auth, then rate limiting, then routing) reflects a deliberate, fail-fast design — rejecting invalid or over-quota requests as early as possible, before consuming any backend service capacity at all.
`,

  architecture: `
A senior engineer thinks about API gateway architecture in terms of what genuinely belongs at the gateway layer versus what should remain in individual services, how to structure authentication and rate limiting for different consumer tiers, and how to avoid the gateway becoming an organizational bottleneck.

### Deciding what belongs at the gateway versus in individual services

~~~mermaid
flowchart TB
    Concern["A piece of logic"] --> Q{"Is this genuinely a\ncross-cutting API concern\n(auth, rate limiting, routing,\nbasic transformation)?"}
    Q -->|Yes| Gateway["Centralize at the gateway"]
    Q -->|"No -- genuine\nbusiness logic specific\nto one service's domain"| Service["Keep in the\nindividual service"]
~~~

This deliberate discipline directly guards against the "smart gateway, dumb pipes" anti-pattern — a gateway accumulating deep business logic becomes a coordination bottleneck every team must go through for any change, undermining the independence microservices were meant to provide.

### Structuring tiered access for different API consumers

~~~mermaid
flowchart LR
    FreeClient["Free-tier client"] --> GW["API Gateway"]
    PaidClient["Paid-tier client"] --> GW
    GW -->|"100 req/min limit"| FreeRoute["Standard routing"]
    GW -->|"10,000 req/min limit"| PaidRoute["Standard routing\n(same backends)"]
~~~

A senior engineer designs rate limiting and access tiers as gateway-level configuration, decoupled from the backend services' own implementation, letting business/pricing changes (adjusting a tier's limit) happen at the gateway layer without requiring any backend service code changes.

### Considering a Backend-for-Frontend split for genuinely divergent client needs

When a mobile client and a web client have genuinely different, substantial API interaction patterns (aggressive payload minimization and aggregation for mobile versus a richer, less constrained interface for web), a senior engineer considers a dedicated BFF layer per client type rather than forcing one generic gateway configuration to serve both adequately.
`,

  "data-flow": `
Tracing a request through an API gateway performing response aggregation across multiple backend services:

~~~mermaid
sequenceDiagram
    participant Client
    participant GW as API Gateway
    participant Users as Users Service
    participant Orders as Orders Service
    participant Inventory as Inventory Service

    Client->>GW: GET /v1/dashboard/123
    par Parallel backend calls
        GW->>Users: GET /users/123
        GW->>Orders: GET /orders?user=123
        GW->>Inventory: GET /recommendations?user=123
    end
    Users-->>GW: user profile data
    Orders-->>GW: recent orders
    Inventory-->>GW: recommendations
    GW->>GW: aggregate all three into\none combined response
    GW-->>Client: single dashboard response
~~~

The critical detail: the gateway issues the three backend calls IN PARALLEL rather than sequentially, minimizing total added latency from the aggregation itself — a naive sequential implementation would add each backend call's latency on top of the others, while a parallel implementation's total added latency is bounded by the SLOWEST individual backend call, not their sum.
`,

  "production-usage": `
### A representative Kong (built on NGINX) rate-limiting plugin configuration

~~~
plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: local
route: /v1/orders
~~~

### Non-negotiables for production API gateways

1. **Verify authentication before any other processing**, rejecting invalid credentials as early and cheaply as possible.
2. **Enforce rate limiting per authenticated client**, protecting backend capacity from any single consumer's excessive usage.
3. **Resist centralizing genuine business logic at the gateway**, keeping it focused on cross-cutting API concerns.
4. **Make the gateway itself highly available**, reusing the same redundancy principles covered in the **Load Balancers** and **Reverse Proxy** skills.
5. **Version the API deliberately**, supporting a clear migration path for consumers rather than breaking changes with no transition period.

### Common production patterns

- **Kong or an Envoy-based gateway** as the self-managed, open-source choice for teams wanting fine-grained control.
- **Cloud-managed API gateways** (AWS API Gateway, Azure API Management, GCP API Gateway) as the lower-operational-overhead default for many cloud-native teams.
- **Backend-for-Frontend gateways** for products with genuinely divergent client types (mobile versus web) needing substantially different API shapes.
`,

  "industry-examples": `
- **Netflix's Zuul**: an early, influential, publicly-discussed API gateway built specifically to front Netflix's rapidly-growing microservices architecture.
- **Kong**: a widely-adopted open-source API gateway built on NGINX, offering an extensive plugin ecosystem for authentication, rate limiting, and transformation.
- **AWS API Gateway, Azure API Management, GCP API Gateway**: fully-managed cloud API gateway services, now the default choice for many cloud-native architectures.
- **Ambassador and other Envoy-based gateways**: modern, Kubernetes-native API gateways built on Envoy's extensible proxy architecture.
- **GraphQL federation gateways** (Apollo Federation, among others): specialized gateways combining multiple backend GraphQL schemas into one federated, consumer-facing schema.
`,

  "best-practices": `
1. **Verify authentication before any other processing**, failing fast on invalid credentials.
2. **Enforce per-client rate limiting**, protecting backend capacity and enabling tiered access plans.
3. **Keep genuine business logic in individual services**, resisting the "smart gateway, dumb pipes" anti-pattern.
4. **Version the API deliberately**, with a clear, documented migration path between versions.
5. **Make the gateway itself highly available**, avoiding a new single point of failure for the entire API surface.
6. **Use parallel backend calls for response aggregation**, minimizing added latency from combining multiple services' data.
7. **Centralize observability** (logging, metrics, tracing initiation) at the gateway, since all API traffic passes through it.
8. **Consider a Backend-for-Frontend split** when client types have genuinely divergent API interaction needs.
9. **Implement circuit breaking** for backend service calls, preventing one failing service from degrading the entire gateway's responsiveness.
10. **Document the external API contract clearly and separately** from internal service implementation details, preserving the encapsulation the gateway is meant to provide.
`,

  "anti-patterns": `
### The "smart gateway, dumb pipes" anti-pattern

~~~
# WRONG — the gateway accumulates deep business logic
# (complex order-processing rules, service-specific validation)
# becoming a tightly-coupled bottleneck every team must
# coordinate through for any change
# RIGHT — the gateway handles genuinely cross-cutting concerns
# (auth, rate limiting, routing, basic transformation);
# business logic stays in the owning service
~~~

### Sequential (rather than parallel) backend calls during aggregation

~~~python
# WRONG — each backend call waits for the previous one,
# adding their latencies together
def get_dashboard(user_id):
    user = call_users_service(user_id)      # 100ms
    orders = call_orders_service(user_id)   # 100ms
    recs = call_inventory_service(user_id)  # 100ms
    return combine(user, orders, recs)       # total: ~300ms

# RIGHT — parallel calls, bounded by the SLOWEST single call
def get_dashboard(user_id):
    user, orders, recs = parallel_call(
        call_users_service, call_orders_service,
        call_inventory_service, user_id,
    )
    return combine(user, orders, recs)       # total: ~100ms
~~~

### Skipping rate limiting or applying it inconsistently

~~~
# WRONG — some API routes have rate limiting configured,
# others don't, leaving inconsistent protection against
# a single client overwhelming backend capacity
# RIGHT — apply rate limiting consistently across all routes,
# with tiers appropriate to each route's actual cost/sensitivity
~~~

### Other production-grade anti-patterns

- **Running a single, non-redundant gateway instance**, reintroducing a single point of failure for the entire API surface.
- **Breaking changes to the API contract without a versioning strategy**, forcing all consumers to update simultaneously.
- **Not implementing circuit breaking**, letting one failing backend service degrade the gateway's responsiveness for unrelated requests.
`,

  performance: `
### Rule zero: fail fast — reject invalid or over-quota requests before they consume backend capacity

Verifying authentication and rate limits at the gateway, before any backend call, ensures rejected requests never waste backend service resources.

### The performance hierarchy (apply in order)

1. **Verify authentication and rate limits as the very first steps**, rejecting invalid requests immediately.
2. **Parallelize backend calls during response aggregation**, bounding added latency by the slowest single call rather than their sum.
3. **Cache gateway-level responses** for genuinely cacheable, frequently-requested API responses, reducing backend load.
4. **Implement circuit breaking** to avoid wasting time on calls to a currently-failing backend service.
5. **Profile actual gateway-added latency** under realistic traffic, rather than assuming a given configuration's overhead without measurement.

### Micro-level facts worth knowing

- Rate limiting implementations commonly use a token-bucket or sliding-window algorithm, each with a slightly different burst-tolerance characteristic worth understanding for your specific use case.
- Response aggregation's latency is bounded by its SLOWEST constituent backend call when parallelized correctly — a single slow dependency can still dominate overall gateway-added latency even with parallelization.
- JWT verification (a common gateway-layer authentication check) is computationally cheap compared to a database-backed session lookup, one reason JWTs are frequently favored for gateway-layer authentication at scale.
`,

  scalability: `
API gateways directly enable scaling a growing microservices architecture's consumer-facing API surface.

### How API gateways support scaling the API surface itself

~~~mermaid
flowchart LR
    GrowingServices["Growing number of\nbackend microservices"] --> Gateway["Single API gateway\npresents one stable,\nconsistent API surface"]
    Gateway --> Consumers["API consumers unaffected\nby internal service\ntopology changes"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single gateway instance's processing capacity exceeded | Scale the gateway layer horizontally, reusing the **Load Balancers** skill's own redundancy guidance |
| Gateway becoming an organizational bottleneck due to accumulated business logic | Refactor logic back into owning services, restoring the gateway to genuinely cross-cutting concerns only |
| Aggregation latency dominated by one slow backend dependency | Investigate and address that specific backend's latency, or consider caching/fallback strategies for it |
| Divergent client types straining one generic gateway configuration | Consider a Backend-for-Frontend split for genuinely different client needs |
`,

  security: `
### Centralizing authentication at the gateway as a security best practice

~~~
Verifying API keys/JWTs/OAuth tokens ONCE at the gateway,
rather than in every individual backend service, reduces the
risk of an inconsistently-implemented or missing auth check
in some individual service -- a single, well-tested, centrally
maintained authentication implementation is easier to secure
correctly than many independent, potentially-inconsistent ones.
~~~

### Essential API-gateway-related security practices

1. **Verify authentication before any other processing**, and ensure backend services genuinely trust ONLY requests that have passed through the gateway (via mutual TLS or a signed internal header, for instance), not requests reaching them directly.
2. **Apply consistent rate limiting across all routes**, preventing any single unprotected route from becoming an abuse vector.
3. **Validate and sanitize all input at the gateway** where practical, providing a first line of defense before requests reach backend services (directly connecting to the **OWASP Top 10** skill).
4. **Keep gateway software/plugins patched**, since it's a high-value target sitting in the path of all API traffic.

See the **OAuth**, **JWT**, and **OWASP Top 10** skills for the broader security context this connects to.
`,

  testing: `
### Testing centralized authentication

~~~python
def test_request_without_valid_token_is_rejected():
    response = client.get("/v1/orders", headers={})
    assert response.status_code == 401

def test_request_with_valid_token_reaches_backend():
    response = client.get("/v1/orders", headers={"Authorization": "Bearer valid_token"})
    assert response.status_code == 200
~~~

### Testing rate limiting

~~~python
def test_rate_limit_enforced_per_client():
    for _ in range(100):
        client.get("/v1/orders", headers={"X-API-Key": "abc123"})
    response = client.get("/v1/orders", headers={"X-API-Key": "abc123"})
    assert response.status_code == 429
~~~

### The senior testing doctrine

- Test authentication rejection explicitly for missing, expired, and malformed credentials.
- Test rate limiting explicitly at, just under, and just over the configured threshold, verifying correct boundary behavior.
- Test response aggregation's actual parallelism, verifying total latency is bounded by the slowest backend call, not their sum.
- Test circuit breaker behavior explicitly, simulating a failing backend service and verifying the gateway correctly trips and later recovers.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check gateway authentication/rate-limiting logs first** when a client reports unexpected 401s or 429s.
2. **Verify routing configuration** if a request appears to reach the wrong backend service, or an unexpectedly old/new API version.
3. **Check backend service response times individually** if aggregation latency seems unexpectedly high, isolating which specific backend is the bottleneck.
4. **Use distributed tracing** (the **Tracing** skill) to reconstruct the full request path through the gateway and into backend services.

### Debugging common API-gateway-related symptoms

- "A client reports unexpected 401 errors" — verify their credential's validity and expiration, and check for any recent authentication configuration changes at the gateway.
- "A client reports hitting rate limits unexpectedly" — verify the configured limit for their specific tier/API key, and check for any recent tier/quota configuration changes.
- "Aggregated dashboard responses are slow" — check individual backend service response times to isolate the slowest contributor, and verify aggregation calls are genuinely parallelized.
- "Requests are reaching an unexpected API version's backend" — check version-based routing configuration for correctness.
`,

  monitoring: `
### Key signals to track

- **Authentication success/failure rates**, indicating both genuine attack attempts and legitimate credential issues.
- **Rate-limit rejection rates per client/tier**, indicating both abuse patterns and potentially under-provisioned legitimate usage.
- **Per-backend-service latency contribution to aggregated responses**, isolating slow dependencies.
- **Overall gateway request rate, latency, and error rate**, since it sits in the path of all API traffic.

### Tools

API gateway product-specific metrics and dashboards (Kong's admin API, cloud-managed gateway consoles); distributed tracing for end-to-end request path visibility; standard infrastructure monitoring for the gateway's own resource utilization.

### Alerting priorities

Alert on elevated authentication failure rates (a potential attack signal), on unusually high rate-limit rejection rates for a legitimate, paying client tier (a potential under-provisioning issue), and on elevated gateway-layer error rates or latency (a leading indicator of broader backend issues, since all API traffic passes through the gateway).
`,

  deployment: `
### Deploying a redundant, versioned API gateway

Reuses the **Load Balancers** and **Reverse Proxy** skills' own redundancy guidance directly, with the addition of a deliberate API versioning strategy — deploying a new API version alongside the existing one, letting consumers migrate on their own schedule, rather than a single, all-at-once breaking change.

### CI/CD pipeline considerations

Treat gateway routing, authentication, and rate-limiting configuration as version-controlled infrastructure code, with automated validation (configuration correctness checks, and ideally integration tests verifying auth/rate-limit/routing behavior) as part of the deployment pipeline. See the **CI/CD** skill for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production API gateway takes real traffic:

- [ ] Authentication verified as the first processing step for every route
- [ ] Rate limiting consistently applied across all routes, with tiers appropriate to each route's actual sensitivity
- [ ] Business logic kept in owning services, not accumulated at the gateway layer
- [ ] API versioning strategy in place with a clear consumer migration path
- [ ] Gateway itself deployed redundantly
- [ ] Response aggregation calls genuinely parallelized, not sequential
- [ ] Circuit breaking configured for backend service calls
- [ ] Observability (logging, metrics, tracing) centralized at the gateway layer
- [ ] Backend services verify requests genuinely came through the gateway, not directly
`,

  "common-mistakes": `
1. **Accumulating deep business logic at the gateway** ("smart gateway, dumb pipes"), creating an organizational bottleneck.
2. **Performing response aggregation sequentially** rather than in parallel, needlessly adding latency.
3. **Applying rate limiting inconsistently** across routes, leaving some unprotected.
4. **Running a single, non-redundant gateway instance**, reintroducing a single point of failure.
5. **Making breaking API changes without a versioning strategy**, forcing all consumers to update simultaneously.
6. **Not verifying that backend services genuinely trust only gateway-routed requests**, leaving a bypass path if backends remain directly reachable.
7. **Not implementing circuit breaking**, letting one failing backend degrade the gateway's overall responsiveness.
8. **Not centralizing observability** at the gateway despite it being the natural point to do so.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| 401 Unauthorized | Missing, expired, or malformed authentication credential | Verify credential validity and gateway authentication configuration |
| 429 Too Many Requests | Client exceeded their configured rate limit | Verify the client's tier/quota configuration is correctly set |
| 502/503 from the gateway | A backend service is unreachable or failing | Check backend service health; verify circuit breaker behavior is appropriate |
| Slow aggregated responses | Sequential (not parallel) backend calls, or one slow backend dependency | Verify aggregation parallelism; investigate the specific slow backend |
| Requests routed to the wrong API version | Version-based routing misconfiguration | Review and correct version routing rules |
| Backend receiving unauthenticated requests directly | Backend service reachable outside the gateway | Restrict backend services to a private network, reachable only through the gateway |
`,

  faqs: `
**What's the difference between an API gateway and a reverse proxy?**
An API gateway builds directly on top of reverse-proxy functionality (routing, TLS termination), adding API-specific concerns like centralized authentication, per-client rate limiting, request/response transformation, and API versioning — many API gateway products are literally built on reverse proxy technology (Kong on NGINX, several gateways on Envoy).

**Why centralize authentication at the gateway instead of in each service?**
It avoids duplicating (and potentially inconsistently implementing) the same authentication logic across every backend service — a single, well-tested, centrally maintained implementation is easier to secure correctly and easier to update than many independent ones.

**What is the "smart gateway, dumb pipes" anti-pattern?**
A genuine architectural risk where an API gateway accumulates too much business logic over time, becoming a tightly-coupled bottleneck every team must coordinate through for any change — effectively recreating coordination problems microservices architectures were meant to avoid; the fix is keeping the gateway focused on genuinely cross-cutting API concerns only.

**Why should backend calls during response aggregation be parallelized?**
Because sequential calls add each backend's latency together, while parallel calls bound total added latency by the SLOWEST single backend call — a meaningful, often dramatic difference in aggregated response time.

**What is a Backend-for-Frontend (BFF), and when would I use one?**
A dedicated API gateway layer tailored to one specific client type's needs (mobile versus web, for instance), used when different client types have genuinely divergent API interaction requirements substantial enough to justify separate, specialized gateway layers rather than one generic configuration serving all clients adequately but optimally for none.

**How does API versioning at the gateway help consumers?**
It lets a provider run multiple API versions simultaneously, routing each to the appropriate backend implementation, giving consumers a clear, deliberate migration path to a new version on their own schedule rather than facing an abrupt, breaking change with no transition period.
`,

  "interview-questions": `
### Junior level

1. **What is an API gateway?**
   Model answer: a single entry point sitting in front of a collection of backend services, handling cross-API concerns like authentication, rate limiting, routing, and request/response transformation.

2. **How does an API gateway relate to a reverse proxy?**
   Model answer: an API gateway builds directly on top of reverse-proxy functionality (routing, TLS termination), adding further API-specific concerns like centralized authentication and per-client rate limiting.

3. **Why would you centralize rate limiting at the gateway rather than in each backend service?**
   Model answer: it protects all backend services consistently from being overwhelmed by any single API consumer, and lets a provider offer differentiated access tiers, enforced in one place rather than duplicated across many services.

4. **What is API versioning, and why does it matter?**
   Model answer: supporting multiple concurrent versions of an API (e.g., /v1/, /v2/), letting consumers migrate to a new version on their own schedule rather than facing an abrupt breaking change.

### Senior level

5. **Explain the "smart gateway, dumb pipes" anti-pattern in detail — why is it a genuine architectural risk, and how would you guard against it?**
   Model answer: as an API gateway accumulates increasing amounts of business logic (complex validation rules, orchestration workflows, service-specific decision-making) beyond genuinely cross-cutting API concerns, it becomes a shared, tightly-coupled bottleneck that every team must coordinate through for any change touching that logic — this directly undermines a core motivation for adopting microservices in the first place (independent service ownership and deployability); guarding against it requires a deliberate, ongoing architectural discipline: routinely asking whether a given piece of gateway logic is genuinely cross-cutting (auth, rate limiting, basic transformation, routing) or is actually domain-specific business logic that should be pushed back into its owning service, and resisting the short-term convenience of "just adding it to the gateway" when a more disciplined placement would better preserve service autonomy.

6. **How would you design response aggregation at the API gateway to minimize added latency, and what's the key implementation detail that's easy to get wrong?**
   Model answer: issue the constituent backend service calls IN PARALLEL (concurrently) rather than sequentially — the key, easy-to-miss implementation detail is that a naive, straightforward implementation often ends up calling each backend one after another (awaiting each call's result before starting the next), which adds every backend's latency together; a correctly parallelized implementation issues all the calls concurrently and awaits their combined completion, meaning the total added latency from aggregation is bounded by the SLOWEST single backend call, not the sum of all of them — a potentially dramatic difference (three 100ms calls: ~300ms sequential versus ~100ms parallel).

7. **Design an API gateway rate-limiting strategy for a public API with free, pro, and enterprise tiers.**
   Model answer: attach a rate-limit configuration to each API key (or authenticated client identity) reflecting their subscription tier — a free tier with a conservative limit (e.g., 100 requests/day) to encourage upgrades while still providing genuine utility, a pro tier with a substantially higher limit (e.g., 10,000 requests/day) matched to typical paying-customer usage patterns, and an enterprise tier with either a very high or fully custom, individually-negotiated limit; enforce this centrally at the gateway (not duplicated in each backend service) using a rate-limiting algorithm (token bucket is a common choice, since it naturally allows some burst tolerance rather than a harsh, strictly uniform cap) keyed to the authenticated client's identity, returning a 429 response with clear rate-limit-remaining and retry-after information whenever a client's configured limit is exceeded, and exposing gateway-level metrics so the business can observe actual usage patterns per tier to inform future pricing/limit adjustments.

8. **When would you introduce a Backend-for-Frontend (BFF) layer instead of one generic API gateway serving all client types?**
   Model answer: when different client types have GENUINELY divergent API interaction needs substantial enough that one generic gateway configuration would meaningfully underserve at least one of them — a common concrete example is a mobile app on a variable, sometimes-slow network genuinely benefiting from aggressive response aggregation and payload minimization (combining several backend calls into one minimal mobile-optimized response) in a way a web app on a fast, stable connection typically does not need to the same degree; introducing a BFF adds real operational complexity (an additional gateway layer to build, deploy, and maintain per client type), so this decision should be made deliberately, based on evidence that a single generic gateway is genuinely and meaningfully underserving at least one client type's real, measured needs, not merely as a default architectural preference.

9. **How would you ensure backend services can trust that a request reaching them has genuinely already passed through the gateway's authentication and rate-limiting checks, rather than being sent directly, bypassing the gateway?**
   Model answer: restrict backend services to a private network unreachable directly from the public internet (reusing the **Reverse Proxy** skill's own security-boundary guidance), reachable only through the gateway; additionally, have the gateway attach a signed internal header (or use mutual TLS between the gateway and backend services) carrying the already-verified client identity, which backend services can cryptographically verify actually originated from the trusted gateway rather than being spoofed by a request sent directly to the backend by some other means — this combination (network isolation plus a verifiable internal trust signal) closes the specific gap where a backend might otherwise process an unauthenticated request that bypassed the gateway entirely.

10. **A team's API gateway has become a bottleneck — every feature requiring even a small business rule change needs a gateway deployment, coordinated with a central platform team. How would you address this?**
    Model answer: this is a concrete manifestation of the "smart gateway, dumb pipes" anti-pattern — the fix is an audit of the gateway's current logic, explicitly separating genuinely cross-cutting API concerns (which should stay at the gateway) from business logic that has accumulated there over time (which should be migrated back into the specific owning service's own codebase and deployment lifecycle); this migration should be done incrementally, one piece of misplaced logic at a time, verifying behavior is preserved at each step, ultimately restoring each service's ability to deploy its own business-logic changes independently without requiring central platform-team coordination, while the gateway itself returns to handling only genuinely shared, cross-cutting concerns (auth, rate limiting, routing, basic transformation) that legitimately benefit from centralization.
`,

  "coding-questions": `
### 1. Implement a simple token-bucket rate limiter

~~~python
import time

class TokenBucketRateLimiter:
    def __init__(self, capacity, refill_rate_per_second):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate_per_second
        self.last_refill = time.monotonic()

    def allow_request(self):
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
# Follow-up: how does the token-bucket algorithm's allowance
# for short bursts (up to the bucket's full capacity) differ
# from a strict, fixed-window rate limiter's behavior?
~~~

### 2. Implement parallel response aggregation

~~~python
import asyncio

async def get_dashboard(user_id):
    user, orders, recs = await asyncio.gather(
        call_users_service(user_id),
        call_orders_service(user_id),
        call_inventory_service(user_id),
    )
    return {"user": user, "orders": orders, "recommendations": recs}
# Follow-up: what happens to the OTHER two calls if one of the
# three backend calls raises an exception, and how would you
# modify this to return partial results with a fallback for
# the failed dependency instead of failing the entire request?
~~~

### 3. Implement a simple gateway-level circuit breaker

~~~python
import time

class CircuitBreaker:
    def __init__(self, failure_threshold, recovery_timeout):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = "closed"
        self.opened_at = None

    def call(self, backend_fn):
        if self.state == "open":
            if time.monotonic() - self.opened_at > self.recovery_timeout:
                self.state = "half_open"
            else:
                raise Exception("circuit open: failing fast")
        try:
            result = backend_fn()
            self.failure_count = 0
            self.state = "closed"
            return result
        except Exception:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
                self.opened_at = time.monotonic()
            raise
# Follow-up: why does the "half_open" state only allow a
# single trial call through, rather than immediately resuming
# full traffic once the recovery timeout has elapsed?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Set up Kong with basic authentication and rate limiting
Deploy Kong in front of a simple backend service, configure API key authentication and a basic rate-limiting plugin, and verify unauthenticated and over-limit requests are correctly rejected. Deliverable: a working Kong configuration with verified auth and rate-limit enforcement. Skills exercised: basic API gateway configuration.

### Lab 2 (Intermediate): Implement path-based API versioning
Configure routing for /v1/ and /v2/ paths pointing to two different versions of a simple backend service, and verify each version routes correctly and behaves independently. Deliverable: a working multi-version routing configuration. Skills exercised: API versioning strategy implementation.

### Lab 3 (Advanced): Implement parallel response aggregation with a circuit breaker
Build a small gateway service that aggregates responses from three mock backend services in parallel, with a circuit breaker wrapping each backend call, and verify both the parallel-latency benefit and the circuit breaker's correct trip/recovery behavior under simulated backend failure. Deliverable: a working aggregation service with verified parallelism and circuit breaker behavior. Skills exercised: response aggregation, circuit breaking.

### Lab 4 (Production): Design and implement a tiered rate-limiting strategy
Given a described free/pro/enterprise API pricing model, implement gateway-level rate limiting reflecting each tier's limits, and write tests verifying correct enforcement at each tier's boundary. Deliverable: a documented, tested tiered rate-limiting implementation. Skills exercised: applied rate-limiting strategy design.
`,

  "real-projects": `
### 1. A public API platform with tiered access and centralized authentication
Engineering requirements: API-key-based authentication, tiered rate limiting (free/pro/enterprise), and consistent request/response contracts across a growing set of internal microservices.

### 2. A mobile-optimized Backend-for-Frontend gateway
Engineering requirements: a dedicated gateway layer performing aggressive response aggregation and payload minimization specifically for a mobile client, separate from a richer web-client-facing gateway configuration.

### 3. A resilient gateway with circuit breaking and fallback responses
Engineering requirements: circuit breakers wrapping every backend service call, with configured fallback responses (cached or degraded data) for genuinely non-critical backend dependencies, preventing one failing service from degrading the entire gateway's responsiveness.
`,

  "case-studies": `
### Netflix's Zuul as an early, influential API gateway
Netflix built Zuul specifically to front its rapidly-growing microservices architecture with a single, stable, client-friendly API surface, directly motivated by the operational challenges of exposing dozens of independently-evolving services to external and internal consumers alike; Zuul's public discussion and eventual open-sourcing significantly influenced the broader industry's adoption of the API gateway pattern as standard microservices infrastructure. Lesson: solving a genuine, large-scale operational problem (in Netflix's case, managing API consumption across a rapidly-growing microservices fleet) and sharing that solution publicly can meaningfully shape an entire industry's subsequent architectural conventions.

### Kong's growth from an NGINX-based open-source project to a widely-adopted API gateway standard
Kong's decision to build directly on top of NGINX's proven reverse-proxy foundation, rather than building an entirely new proxy engine from scratch, let it focus its own engineering effort specifically on the API-gateway-specific layer (plugins for auth, rate limiting, transformation) while inheriting NGINX's mature, battle-tested core proxying capability. Lesson: building a new, specialized layer of functionality on top of an already-mature, proven foundation (rather than reinventing that foundation) can let a team focus its engineering effort where it adds genuinely new, differentiated value.

### A recurring failure pattern: gateways accumulating business logic until they become an organizational bottleneck
Many organizations adopting microservices architectures have independently arrived at the same painful lesson: an API gateway that gradually accumulates business logic beyond genuinely cross-cutting concerns eventually becomes a shared bottleneck requiring central-team coordination for changes that should have been a single service's independent, autonomous deployment — a pattern significant enough to have an established name ("smart gateway, dumb pipes," used as a cautionary anti-pattern label) in industry architecture discussions. Lesson: a pattern painful and common enough to independently recur across many organizations, and to earn its own established cautionary name in industry discourse, deserves genuinely deliberate, ongoing architectural discipline to avoid, not just awareness that it exists.
`,

  comparisons: `
| Aspect | Reverse Proxy | API Gateway |
|--------|--------------------|------------------|
| Core function | Routing, TLS termination, caching, compression | All of reverse proxy's functions, plus centralized auth, per-client rate limiting, transformation, versioning |
| Typical scope | Any HTTP(S) traffic | Specifically API traffic |
| Common products | NGINX, HAProxy | Kong, AWS/Azure/GCP managed gateways, Envoy-based gateways |

| Aspect | Single Generic Gateway | Backend-for-Frontend (BFF) |
|--------|-----------------------------|----------------------------------|
| Client handling | One configuration serves all client types | Separate, purpose-built gateway per client type |
| Operational complexity | Lower | Higher (more gateway layers to maintain) |
| Best fit | Client types with similar API interaction needs | Client types with genuinely divergent needs (mobile vs. web) |

**How seniors choose**: use a plain reverse proxy when routing and TLS termination genuinely suffice; introduce an API gateway specifically when centralized authentication, per-client rate limiting, or API versioning are genuinely needed; reach for a BFF split only when client types have measurably, substantially divergent API interaction requirements, not as a default architectural preference.
`,

  "related-technologies": `
- **Reverse Proxy** — the foundational technology API gateways directly build on; covered immediately before this page.
- **OAuth**, **JWT** — the authentication mechanisms API gateways commonly centralize verification for.
- **REST**, **GraphQL** — the API paradigms API gateways route and transform traffic for.
- **Load Balancers** — the underlying traffic-distribution and high-availability concerns an API gateway layer also depends on.
- **CDN** — the next System Design skill in this category, extending caching and routing to a globally-distributed edge network.

Learning path: **Reverse Proxy** → this page → **CDN** for the progressively more application-aware System Design technologies built on this foundation.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued growth of Envoy-based API gateway products, building on Envoy's extensible, cloud-native proxy architecture.
- Increasing adoption of the Kubernetes Gateway API specification as the evolving standard for API gateway configuration in containerized environments, superseding the original Ingress resource for more sophisticated routing needs.
- Continued industry emphasis on avoiding the "smart gateway, dumb pipes" anti-pattern as microservices architectures mature and accumulate years of incremental gateway configuration changes.
- Given continued evolution in this space, verify a specific product's current exact feature set and plugin ecosystem against official documentation.
`,

  "future-roadmap": `
Where API gateway technology is heading, and what's worth betting career time on:

- **Continued convergence toward Envoy-based, Kubernetes-native API gateway architectures** as the industry standard, particularly via the Gateway API specification.
- **Continued growth of GraphQL federation gateways** as GraphQL adoption for internal and external APIs continues to spread.
- **Continued emphasis on disciplined separation** between genuinely cross-cutting gateway concerns and service-owned business logic, as a mature, well-understood architectural principle rather than a novel insight.
- **What to bet on**: deeply understanding the underlying concepts (centralized auth, rate limiting, versioning, the smart-gateway anti-pattern, response aggregation) — these transfer directly across any specific product's current configuration syntax, a far more durable investment than memorizing one tool's exact plugin API.
`,

  "cheat-sheet": `
~~~
# ---- API gateway = reverse proxy + API-specific concerns ----
Centralized auth | per-client rate limiting | request/response
transformation | API versioning | response aggregation
~~~

~~~
# ---- Request processing order (fail fast) ----
1. Verify auth (API key / JWT / OAuth token)
2. Check rate limit for authenticated client
3. Route based on path/version
4. Transform response to external contract
~~~

~~~python
# ---- Parallel aggregation: bound by SLOWEST call, not sum ----
user, orders, recs = await asyncio.gather(
    call_users(), call_orders(), call_inventory(),
)
~~~

~~~
# ---- Rate limiting tiers ----
free:       100 req/day
pro:        10,000 req/day
enterprise: custom negotiated
~~~

~~~
# ---- THE anti-pattern to avoid ----
"Smart gateway, dumb pipes": gateway accumulates business
logic -> becomes an org-wide bottleneck every team must go
through. FIX: keep gateway to auth/rate-limit/routing/transform
only -- business logic stays in the owning service.
~~~

~~~
# ---- Backend-for-Frontend (BFF) ----
Use when client types (mobile vs web) have genuinely
divergent API needs -- separate, purpose-built gateway
layers instead of one generic config serving all adequately.
~~~

~~~
# ---- Circuit breaking ----
Failing backend -> trip circuit -> fail fast / fallback
instead of degrading the whole gateway's responsiveness.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is an API gateway? | Single entry point handling auth, rate limiting, routing, transformation for backend services. |
| API gateway vs reverse proxy? | Gateway = reverse proxy + centralized auth, per-client rate limiting, versioning. |
| Why verify auth before rate limiting? | Fail fast — reject invalid requests before spending any further processing. |
| "Smart gateway, dumb pipes"? | Anti-pattern: gateway accumulates business logic, becomes an org-wide bottleneck. |
| Why parallelize aggregation calls? | Total latency bounded by slowest call, not the sum of all calls. |
| What is a Backend-for-Frontend (BFF)? | A dedicated gateway layer tailored to one client type's divergent needs. |
| Why centralize auth at the gateway? | Avoids duplicating/inconsistently implementing auth in every backend service. |
| What does API versioning at the gateway enable? | Multiple API versions running simultaneously, consumers migrate on their own schedule. |
| What is circuit breaking for? | Stop calling a failing backend, fail fast/fallback instead of degrading the whole gateway. |
| Common rate-limiting algorithm? | Token bucket — allows some burst tolerance versus a strict fixed window. |
`,

  mcqs: `
1. What does an API gateway add on top of plain reverse-proxy functionality?
   A) Nothing — they're identical  B) Centralized authentication, per-client rate limiting, transformation, and versioning  C) Only TLS termination  D) Only static file serving
   **Answer: B** — API gateways build directly on reverse-proxying with these further API-specific concerns.

2. Why should authentication be verified before rate limiting at the gateway?
   A) Order doesn't matter  B) To fail fast, rejecting invalid requests before any further processing  C) Rate limiting must always run first  D) Authentication is optional
   **Answer: B** — a deliberate fail-fast design minimizing wasted processing on invalid requests.

3. What is the "smart gateway, dumb pipes" anti-pattern?
   A) A gateway with too little logic  B) A gateway accumulating too much business logic, becoming an organizational bottleneck  C) A required design pattern  D) A type of rate limiting
   **Answer: B** — centralizing business logic beyond cross-cutting concerns undermines microservices' independence.

4. Why should response aggregation calls be made in parallel rather than sequentially?
   A) Parallel calls are always simpler to write  B) Sequential calls add every backend's latency together; parallel calls are bounded by the slowest single call  C) Sequential calls are actually faster  D) It doesn't matter for latency
   **Answer: B** — a potentially dramatic latency difference for multi-backend aggregation.

5. When would a Backend-for-Frontend (BFF) split be justified?
   A) Always, for every architecture  B) When client types have genuinely divergent API interaction needs substantial enough to warrant separate gateway layers  C) Never — one gateway always suffices  D) Only for internal APIs
   **Answer: B** — a deliberate tradeoff of added operational complexity for genuinely better-fitting client-specific interfaces.
`,

  "revision-notes": `
An API gateway is a single entry point sitting in front of a collection of backend services, building directly on top of the **Reverse Proxy** skill's routing and TLS-termination foundation, but adding a further layer of API-specific capability: CENTRALIZED AUTHENTICATION AND AUTHORIZATION (verifying API keys, JWTs, or OAuth tokens once at the gateway, rather than duplicating this logic across every backend service), PER-CLIENT RATE LIMITING (protecting backend capacity from any single consumer, and enabling tiered access plans like free/pro/enterprise), REQUEST/RESPONSE TRANSFORMATION (translating between a stable external API contract and internal services' own, potentially different, data formats), and API VERSIONING (running multiple API versions simultaneously, letting consumers migrate to a new version on their own schedule rather than facing an abrupt breaking change).

A critical request-processing ordering detail: authentication should be verified FIRST, before rate limiting, before any backend call — this is a deliberate FAIL-FAST design, rejecting invalid credentials or over-quota requests as early and cheaply as possible, before any backend service capacity is consumed. RESPONSE AGGREGATION, combining multiple backend services' responses into one consumer-facing response, should issue its constituent backend calls IN PARALLEL rather than sequentially — a sequential implementation adds every backend's latency together, while a correctly parallelized implementation bounds total added latency by the SLOWEST single backend call, a potentially dramatic difference (three 100ms calls: roughly 300ms sequential versus roughly 100ms parallel) that is a frequently-tested implementation detail.

A genuinely important, named architectural risk is the "SMART GATEWAY, DUMB PIPES" ANTI-PATTERN: as an API gateway accumulates increasing amounts of business logic (complex validation, orchestration workflows, service-specific decisions) beyond genuinely cross-cutting API concerns, it becomes a shared, tightly-coupled bottleneck every team must coordinate through for any change touching that logic — directly undermining a core motivation for adopting microservices architectures in the first place (independent service ownership and deployability). The platform-wide guidance is deliberate, ongoing discipline: keep the gateway focused on auth, rate limiting, routing, and basic transformation, pushing genuinely domain-specific business logic back into its owning service.

CIRCUIT BREAKING at the gateway layer (directly connecting to the **Distributed Systems** skill's own partial-failure treatment) prevents one failing backend service from degrading the entire gateway's responsiveness for unrelated requests — tripping to a fast-failure or fallback-response state once a configured failure threshold is exceeded, and periodically probing to detect recovery. The BACKEND-FOR-FRONTEND (BFF) PATTERN uses separate, purpose-built gateway layers tailored to genuinely divergent client types (a mobile app needing aggressive response aggregation and payload minimization, versus a web app on a faster, more stable connection) rather than forcing one generic gateway configuration to serve all client types adequately but optimally for none — a deliberate tradeoff of added operational complexity for better client-specific fit, justified only when client needs genuinely, measurably diverge.

Like a load balancer or reverse proxy, an API gateway must itself be deployed redundantly to avoid becoming a new single point of failure for the entire API surface, and it serves as a natural, centralized point for OBSERVABILITY (logging, metrics, distributed tracing initiation) since all API traffic passes through it. Widely-used real-world examples include Netflix's Zuul (an early, influential gateway built specifically for a rapidly-growing microservices architecture), Kong (built on NGINX, offering an extensive plugin ecosystem), and cloud-managed offerings (AWS API Gateway, Azure API Management, GCP API Gateway) that remove much of the operational burden of self-hosting gateway infrastructure.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding what an API gateway is, its relationship to reverse proxies, and basic Kong configuration. Milestone: complete Lab 1, with verified authentication and rate-limit enforcement.

**Week 2 — Versioning and routing**: implementing path-based API versioning. Milestone: complete Lab 2, with verified independent routing across API versions.

**Week 3 — Aggregation and resilience**: implementing parallel response aggregation with circuit breaking. Milestone: complete Lab 3, with verified parallelism benefit and correct circuit breaker behavior.

**Week 4 — Production application**: designing and implementing a full tiered rate-limiting strategy for a realistic pricing model. Milestone: complete Lab 4, with a documented, tested implementation.

**Week 5 — Architectural discipline**: studying the "smart gateway, dumb pipes" anti-pattern and practicing identifying which logic genuinely belongs at the gateway versus in owning services, using real or example gateway configurations.

Next platform skill once this roadmap is complete: **CDN**, extending caching and routing concepts to a globally-distributed edge network.
`,

  "official-docs": `
- **Kong's official documentation** — a widely-adopted open-source API gateway's comprehensive plugin and configuration reference.
- **AWS API Gateway, Azure API Management, GCP API Gateway official documentation** — the authoritative references for each cloud provider's managed offering.
- **The Kubernetes Gateway API specification** — the evolving standard for API gateway configuration in containerized environments.
`,

  books: `
- **"Building Microservices" — Sam Newman** — covers API gateway design decisions within the broader context of microservices architecture.
- **"System Design Interview" — Alex Xu** — covers API gateway design within broader system design interview scenarios.
- **"Cloud Native Patterns" — Cornelia Davis** — covers API gateway and Backend-for-Frontend patterns within cloud-native architecture design.
`,

  blogs: `
- **Netflix's technology blog on Zuul's design and motivation** — a foundational account of API gateway adoption at scale.
- **Kong's official engineering blog** — practical, product-specific configuration and plugin development guidance.
- **Martin Fowler's writing on the Backend-for-Frontend pattern** — a widely-cited source for this architectural pattern's rationale.
`,

  "research-papers": `
- No single foundational academic paper defines "API gateway" as a term — it's primarily an industry/engineering pattern that emerged from real production microservices experience (Netflix's Zuul being an influential early public example); relevant adjacent material includes general microservices architecture literature and the original Enterprise Service Bus (ESB) integration-pattern writing that conceptually preceded it.
`,

  videos: `
- **Netflix technology talks on Zuul and their broader API gateway evolution** — detailed, firsthand accounts of API gateway adoption at scale.
- **Kong's official conference talks and tutorials** — practical, product-specific configuration walkthroughs.
- **System design interview preparation channels** covering API gateway design as a common interview topic.
`,

  "github-repos": `
- **Kong/kong** — the official Kong API gateway source repository.
- **Netflix/zuul** — the official, open-sourced Zuul repository, a historically influential API gateway implementation.
- **envoyproxy/envoy** — the underlying proxy technology many modern API gateway products are built on.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Rate-limiting design**: given a described API pricing model, design an appropriate tiered rate-limiting configuration.
2. **Aggregation latency analysis**: given a set of backend call latencies, calculate the total added latency for both sequential and parallel aggregation.
3. **Anti-pattern identification**: given a described gateway configuration accumulating specific logic, identify which pieces violate the "smart gateway, dumb pipes" principle and should be migrated to owning services.
4. **Circuit breaker design**: design failure-threshold and recovery-timeout parameters for a circuit breaker given a described backend service's failure characteristics.
5. **External practice sets**: "System Design Interview" (Alex Xu) practice problems covering API gateway design within broader system design scenarios.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Consumers["API Consumers"]
        FreeClient["Free-tier client"]
        ProClient["Pro-tier client"]
    end
    subgraph GatewayLayer["API Gateway Layer (redundant)"]
        Auth["Authentication"]
        RateLimit["Rate Limiting"]
        Routing["Version-based Routing"]
        Transform["Request/Response Transformation"]
    end
    subgraph Backends["Backend Microservices"]
        UsersV1["Users Service v1"]
        UsersV2["Users Service v2"]
        Orders["Orders Service"]
    end
    FreeClient --> Auth
    ProClient --> Auth
    Auth --> RateLimit --> Routing --> Transform
    Transform --> UsersV1
    Transform --> UsersV2
    Transform --> Orders
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((API Gateway))
    Foundations
      Overview
      History Zuul Kong managed gateways
      Why it exists
      Problem it solves
    Core Functions
      Centralized authentication
      Per client rate limiting
      Request response transformation
      API versioning
    Advanced Patterns
      Response aggregation
      Circuit breaking
      Backend for Frontend BFF
      GraphQL federation
    Anti Patterns
      Smart gateway dumb pipes
      Sequential aggregation
      Inconsistent rate limiting
    Relationship to Other Tech
      Builds on Reverse Proxy
      Uses OAuth JWT
      Precedes CDN
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default apiGateway;
