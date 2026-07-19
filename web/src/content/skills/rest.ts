import type { SkillContent } from "../types";

/**
 * REST — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const rest: SkillContent = {
  overview: `
REST (Representational State Transfer) is the architectural style underlying the overwhelming majority of web APIs built over the last two decades — not a protocol or a standard with a formal specification, but a set of architectural constraints first articulated by Roy Fielding in his year-2000 doctoral dissertation, describing the design philosophy that made the World Wide Web itself scale. When people say "REST API," they typically mean an HTTP-based API that exposes resources (nouns — users, orders, documents) via a small, fixed set of standard HTTP methods (verbs — GET, POST, PUT, PATCH, DELETE), uses URLs to identify resources, and treats each request as self-contained and stateless.

For an AI engineer, REST is foundational in two overlapping ways: it's the interface most backend services (built in **Django**, **Flask**, **Express**, **FastAPI**, **Spring Boot**, and **NestJS**, all covered elsewhere on this platform) expose to clients, and it's also the near-universal way LLM provider APIs (OpenAI, Anthropic, and others) are themselves exposed — understanding REST deeply is prerequisite to understanding both how to build a backend for an AI application and how to correctly, robustly consume the AI provider APIs those applications depend on.

Key characteristics: **statelessness** (each request contains everything needed to process it, with no server-side session state between requests); a **uniform interface** built around standard HTTP methods with well-defined, widely-understood semantics; **resource-oriented URLs** that identify things (nouns) rather than actions (verbs); **representations** (typically JSON) that clients receive and send, decoupled from the resource's actual internal storage format; and **HATEOAS** (Hypermedia as the Engine of Application State) — Fielding's original, most demanding, and most commonly-omitted-in-practice constraint, in which responses include links describing what actions are available next.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2000 | **Roy Fielding**'s doctoral dissertation, "Architectural Styles and the Design of Network-based Software Architectures," formally defines REST as an architectural style, distilled from his work co-authoring the HTTP/1.1 specification |
| 2000s | Web services initially favor **SOAP** (Simple Object Access Protocol) and WSDL for enterprise integration — heavier, XML-based, protocol-driven |
| Mid-2000s | REST gains traction as a simpler alternative to SOAP, particularly as public web APIs (Flickr, del.icio.us, and later Twitter) adopt HTTP-plus-JSON-based designs |
| 2008 | Leonard Richardson proposes the **Richardson Maturity Model**, a widely-cited framework describing levels of "RESTfulness" from plain RPC-over-HTTP up to full HATEOAS |
| 2010s | REST becomes the dominant default for public and internal web APIs, with **OpenAPI/Swagger** emerging to formally document REST API contracts |
| 2015 | **gRPC** is open-sourced by Google, offering a high-performance alternative for internal service-to-service communication (see the **gRPC** skill) |
| 2015 | **GraphQL** is open-sourced by Facebook, offering client-driven queries as an alternative for certain API shapes (see the **GraphQL** skill) |
| 2020s | REST remains the dominant style for public-facing APIs (including nearly every major LLM provider's API), even as gRPC and GraphQL take specific niches for internal service communication and client-flexible querying respectively |

REST's continued dominance for public APIs despite the rise of GraphQL and gRPC reflects a genuine strength: its reliance on plain HTTP semantics, cacheability, and broad tooling/client support makes it the lowest-friction choice for APIs consumed by a wide, unpredictable range of external clients — precisely the profile of most LLM provider APIs.
`,

  "why-it-exists": `
REST exists because Roy Fielding, while co-authoring the HTTP/1.1 specification, needed to articulate WHY certain web architecture decisions produced a system (the World Wide Web) that scaled to a global size no prior distributed system had achieved, and to make sure future extensions to HTTP didn't inadvertently break the properties that enabled that scale.

The prior alternative most directly being reacted against was **RPC-style and SOAP-based web services**, which modeled remote interactions as remote procedure calls — treating the network as if it were transparent, encouraging tightly-coupled client-server designs, chatty protocols, and often stateful server-side sessions that fundamentally limited horizontal scalability. Fielding's dissertation instead asked: what are the architectural properties of the Web itself (a system that DOES scale to billions of clients and servers) and how can we describe them as a reusable style for OTHER network-based systems to adopt?

The result — REST's constraints (statelessness, uniform interface, cacheability, layered system, resource orientation) — exist specifically to preserve those same scaling properties: statelessness lets any server handle any request without session affinity; cacheability lets intermediaries (CDNs, proxies) transparently improve performance; a uniform interface (a small, fixed set of methods) lets generic clients, proxies, and tooling understand ANY REST API without resource-specific knowledge, the same reason a web browser can render any website without needing website-specific code.
`,

  "problem-it-solves": `
REST solves the **"how do we design network APIs that scale to enormous numbers of independent clients and servers, remain understandable across organizational boundaries, and evolve without breaking existing clients"** problem.

Concretely, REST's constraints provide:

- **Horizontal scalability via statelessness**: since no server-side session state is required between requests, any request can be routed to any server instance, enabling straightforward load balancing and horizontal scaling — a direct contrast to stateful, session-affinity-requiring architectures.
- **Transparent caching**: HTTP's built-in caching semantics (covered in Internal Working below) let intermediary caches and CDNs serve repeated requests without hitting the origin server, dramatically improving performance and reducing load at scale.
- **A uniform, learnable interface**: because every REST API uses the same small set of HTTP methods with the same well-understood semantics, a developer (or a generic tool — a browser, curl, an API testing tool) can interact with ANY REST API without prior resource-specific knowledge, unlike an RPC-style API where every method name and semantics must be learned individually.
- **Independent evolvability**: resources and their representations can evolve somewhat independently of clients, particularly when combined with good versioning practices, since the interface contract (standard HTTP methods and status codes) remains stable even as underlying implementations change.
- **Broad interoperability**: because REST relies on plain HTTP and (typically) JSON, virtually any programming language or platform can consume a REST API with no special client library required, a genuine advantage for public APIs serving an unpredictable range of consumers.

What REST does **not** solve, or solves with a real tradeoff: it doesn't prevent over-fetching or under-fetching of data (a client wanting a specific subset of fields still typically receives a resource's full representation, the exact problem **GraphQL** was designed to address); it doesn't provide the wire-efficiency or strict-typing of **gRPC** for high-throughput internal service communication; and full HATEOAS compliance — genuinely enabling a client to navigate an API purely through discovered links — is rarely implemented in practice despite being part of Fielding's original definition.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain REST's core architectural constraints (statelessness, uniform interface, cacheability, layered system, resource orientation, and HATEOAS) and why each exists.
2. Design resource-oriented URLs and select appropriate HTTP methods and status codes for a given API operation.
3. Apply the Richardson Maturity Model to assess how "RESTful" a given API design actually is.
4. Design robust API versioning, pagination, filtering, and error-handling strategies.
5. Understand HTTP caching semantics (ETags, Cache-Control) and apply them to a REST API.
6. Compare REST against GraphQL and gRPC, articulating when each is the better architectural fit.
7. Recognize and avoid common REST anti-patterns (verbs in URLs, ignoring status codes, chatty APIs requiring many round trips).
8. Design and consume REST APIs securely, applying appropriate authentication and rate-limiting patterns.
9. Answer senior-level interview questions on REST's constraints, tradeoffs, and its relationship to GraphQL/gRPC.
`,

  prerequisites: `
- **Required**: basic **HTTP** fundamentals — REST is built entirely on top of HTTP's methods, status codes, and headers, so understanding HTTP itself is essential prerequisite context.
- **Required**: familiarity with **JSON** as a data format, the near-universal representation format for modern REST APIs.
- **Helpful**: at least one backend framework (**Django**, **Flask**, **Express**, **FastAPI**, **Spring Boot**, or **NestJS**) for concrete implementation context.
- **Very helpful**: the **API Authentication** and **Web Security** skills for the security considerations covered here.

Dependency links: **HTTP** and **JSON** → this page → **GraphQL**, **gRPC**, **WebSockets**, and **Server-Sent Events** for the alternative/complementary API styles covered in this same category.
`,

  "beginner-concepts": `
### Resources and URLs

~~~
GET    /users           -- list users (the "users" resource collection)
GET    /users/42        -- get a specific user (resource instance)
POST   /users           -- create a new user
PUT    /users/42        -- replace user 42 entirely
PATCH  /users/42        -- partially update user 42
DELETE /users/42        -- delete user 42
~~~

REST URLs identify RESOURCES (nouns: users, orders, documents), not actions (verbs) — the action is expressed via the HTTP method, not the URL itself. A URL like POST /createUser is a common beginner mistake (a verb baked into the URL), covered further in Anti-Patterns.

### The standard HTTP methods and their semantics

~~~
GET     -- retrieve a resource; safe (no side effects) and idempotent
POST    -- create a new resource, or trigger a non-idempotent action
PUT     -- replace a resource entirely; idempotent
PATCH   -- partially update a resource; not necessarily idempotent
DELETE  -- remove a resource; idempotent
~~~

"Idempotent" means calling the operation multiple times has the same effect as calling it once — DELETE /users/42 called twice still results in user 42 being deleted (the second call may 404, but the end state is identical), whereas POST /users called twice typically creates two separate users.

### Status codes

~~~
200 OK                    -- successful GET/PUT/PATCH
201 Created               -- successful POST that created a resource
204 No Content             -- successful request with no response body (common for DELETE)
400 Bad Request            -- malformed request
401 Unauthorized           -- missing or invalid authentication
403 Forbidden              -- authenticated, but not permitted
404 Not Found               -- resource doesn't exist
409 Conflict                -- request conflicts with the resource's current state
422 Unprocessable Entity    -- well-formed request, but semantically invalid (validation errors)
429 Too Many Requests       -- rate limit exceeded
500 Internal Server Error   -- unexpected server-side failure
~~~

Using status codes correctly and consistently is a genuinely important, easy-to-get-wrong discipline — returning 200 for every response (even errors, communicated only via a body field) discards information generic HTTP tooling relies on, covered further in Anti-Patterns.

### A basic REST request example

~~~
GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 42, "name": "Ada Lovelace", "email": "ada@example.com"}
~~~
`,

  "intermediate-concepts": `
### Nested resources and relationships

~~~
GET /users/42/orders          -- orders belonging to user 42
GET /users/42/orders/7        -- a specific order belonging to user 42
POST /users/42/orders         -- create a new order for user 42
~~~

Nesting URLs to express a genuine ownership/containment relationship is a common, useful REST pattern — but nesting should generally stop at one or two levels deep (/users/42/orders/7/items rather than deeper) to avoid unwieldy, brittle URLs.

### Pagination

~~~
GET /users?page=2&limit=50
GET /users?cursor=eyJpZCI6MTAwfQ&limit=50
~~~

Offset-based pagination (page/limit) is simple but can produce inconsistent results if data changes between requests (an item shifting pages); cursor-based pagination (an opaque cursor pointing to a specific position) is more robust for large or frequently-changing datasets, the same tradeoff covered for large dataset traversal across this platform's database skills.

### Filtering, sorting, and field selection

~~~
GET /users?status=active&sort=-created_at&fields=id,name,email
~~~

Query parameters conventionally express filtering (status=active), sorting (a leading - for descending), and sparse field selection — the latter a partial mitigation for REST's over-fetching problem, though a genuinely flexible field-selection need across many different query shapes is exactly the scenario **GraphQL** was designed to address more completely.

### API versioning strategies

~~~
GET /v1/users            -- URL path versioning (most common, most visible)
GET /users
Accept: application/vnd.example.v2+json   -- header-based versioning (less visible, more "correct" per REST purity)
~~~

URL path versioning (/v1/, /v2/) is the most widely adopted approach in practice — highly visible and simple to route, even though header-based versioning is arguably more aligned with REST's "the URL identifies a resource, not a version of an API" philosophy; most production APIs prioritize the practical visibility of URL versioning over this purity argument.

### Error response format

~~~json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is not valid",
    "details": [{"field": "email", "issue": "invalid_format"}]
  }
}
~~~

A consistent, structured error response format (paired with the correct HTTP status code) is essential for clients to handle errors programmatically rather than parsing human-readable strings.

### Idempotency keys for safe retries

~~~
POST /payments
Idempotency-Key: a1b2c3d4-...
~~~

Since POST is not inherently idempotent, an idempotency key (a client-generated unique identifier) lets a server safely handle a retried request (due to a network timeout, for instance) without creating a duplicate resource — a genuinely important pattern for payment and order-creation APIs specifically.
`,

  "advanced-concepts": `
### The Richardson Maturity Model

~~~mermaid
flowchart TB
    L0["Level 0: The Swamp of POX\nOne URL, one HTTP method (usually POST),\naction encoded in the body — essentially RPC over HTTP"]
    L1["Level 1: Resources\nMultiple URLs for different resources,\nbut still mostly a single HTTP method"]
    L2["Level 2: HTTP Verbs\nProper use of GET/POST/PUT/DELETE\nand HTTP status codes — this is what\nmost APIs called REST actually implement"]
    L3["Level 3: Hypermedia Controls (HATEOAS)\nResponses include links describing\navailable next actions — Fielding's full vision"]
    L0 --> L1 --> L2 --> L3
~~~

Most APIs described as "RESTful" in industry practice sit at **Level 2** — correct use of HTTP verbs and status codes — without implementing Level 3's HATEOAS. This is a genuinely important nuance: Fielding himself has argued that an API without hypermedia controls isn't truly REST at all, yet Level 2 has become the pragmatic, near-universal industry standard for what "REST API" means in practice.

### HATEOAS in practice

~~~json
{
  "id": 42,
  "status": "pending",
  "links": [
    {"rel": "self", "href": "/orders/42"},
    {"rel": "cancel", "href": "/orders/42/cancel", "method": "POST"},
    {"rel": "customer", "href": "/customers/7"}
  ]
}
~~~

A HATEOAS-compliant response includes not just the resource's data, but LINKS describing what actions are currently valid from this state — a client can discover that an order can be cancelled by following the "cancel" link, rather than the client needing hardcoded, out-of-band knowledge of that URL and business rule. Genuinely useful for building thin, adaptable clients, but rarely implemented given the added design and maintenance complexity relative to its perceived benefit for most APIs.

### Content negotiation

~~~
GET /users/42
Accept: application/json

GET /users/42
Accept: application/xml
~~~

The Accept header lets a single resource support multiple representation formats, with the server choosing (or the client requesting) the appropriate one — in practice, JSON has become so dominant that most modern REST APIs support only JSON, with content negotiation's genuine multi-format flexibility rarely exercised.

### Conditional requests and optimistic concurrency

~~~
GET /users/42
-> ETag: "33a64df551"

PUT /users/42
If-Match: "33a64df551"
~~~

ETags (an opaque version identifier for a resource) combined with If-Match/If-None-Match headers implement optimistic concurrency control — a PUT request only succeeds if the resource hasn't changed since the client last read it, preventing a classic lost-update race condition without requiring a pessimistic lock.

### REST versus RPC-over-HTTP in practice

Many APIs marketed as "REST" are genuinely closer to RPC-over-HTTP (Level 0-1 on the Richardson Maturity Model) — a senior engineer recognizes this distinction and evaluates an API on its ACTUAL design properties (resource orientation, correct status code usage, statelessness) rather than assuming "REST" in a product's marketing implies full architectural compliance.
`,

  "internal-working": `
What happens from a REST API client request to response, at the protocol level:

~~~mermaid
sequenceDiagram
    participant Client
    participant LoadBalancer as Load balancer
    participant Server as API server (any instance)
    participant Cache as Cache/CDN (optional)
    participant DB as Database

    Client->>Cache: GET /users/42 (Accept: application/json)
    alt Cached and fresh
        Cache-->>Client: 200 OK (from cache, no origin hit)
    else Not cached or stale
        Cache->>LoadBalancer: forward request
        LoadBalancer->>Server: route to ANY available instance\n(statelessness makes this possible)
        Server->>DB: fetch resource data
        DB-->>Server: resource data
        Server-->>Cache: 200 OK + Cache-Control/ETag headers
        Cache-->>Client: 200 OK (and caches for next time)
    end
~~~

1. **Statelessness enables load balancing**: because the request itself carries everything the server needs (authentication token, any needed context), the load balancer can route it to ANY server instance — no session affinity required, a direct architectural consequence of Fielding's statelessness constraint.
2. **Caching happens transparently at the HTTP layer**: Cache-Control and ETag headers let intermediary caches (a CDN, a reverse proxy) serve repeated GET requests without the origin server being involved at all, a genuinely significant performance and scalability lever unique to REST's HTTP-native design (gRPC and GraphQL, covered in their own skills, don't get this same transparent HTTP caching by default).
3. **The uniform interface lets generic tooling work everywhere**: because every REST API uses the same small set of methods and status codes, tools like curl, Postman, and browsers can interact with any REST API without resource-specific code — this genuinely differs from RPC-style or GraphQL APIs, which typically require some client-side awareness of the specific schema or method set.

**Why this matters**: understanding that caching and load balancing are largely FREE consequences of correctly applying REST's constraints (rather than something requiring custom application-level engineering) is the key insight distinguishing a senior REST API designer from one who merely uses HTTP as a transport for an RPC-style design.
`,

  architecture: `
A senior engineer thinks about REST API design across several dimensions simultaneously: resource modeling, versioning strategy, and the tradeoff between REST's simplicity and other API styles' specific strengths.

### Resource modeling decision framework

~~~mermaid
flowchart TB
    Q1{"Does this map naturally\nto a noun/entity?"}
    Q1 -->|Yes| Resource["Model as a resource\nwith standard CRUD methods"]
    Q1 -->|No, it's an action\n(e.g. 'send email')| Action["Model as a sub-resource action:\nPOST /emails or POST /users/42/actions/send-email"]
    Resource --> Q2{"Does the client need\nflexible field/relationship\nselection across varied queries?"}
    Q2 -->|Yes, heavily so| GraphQLNote["Consider GraphQL\nalongside or instead of REST"]
    Q2 -->|No, standard CRUD is enough| RESTFinal["REST fits well"]
~~~

### When REST is (and isn't) the right choice

~~~
REST fits well:
├── Public-facing APIs consumed by a wide, unpredictable range of clients
├── APIs benefiting from HTTP's transparent caching
├── Standard CRUD-shaped resources
└── Broad language/tooling interoperability requirements

Consider an alternative instead:
├── High-throughput internal service-to-service communication -> gRPC
├── Clients need flexible, varied field/relationship selection -> GraphQL
├── Real-time, bidirectional communication -> WebSockets
└── Server-to-client streaming (e.g. LLM token streaming) -> Server-Sent Events
~~~

This decision framework directly connects to the other four skills in this category (**GraphQL**, **gRPC**, **WebSockets**, **Server-Sent Events**) — a senior engineer doesn't default to REST reflexively, but chooses it deliberately when its specific strengths (caching, broad interoperability, resource-oriented simplicity) genuinely fit the problem.

### API gateway and layering

~~~mermaid
flowchart LR
    Client --> Gateway["API Gateway\n(auth, rate limiting, routing)"]
    Gateway --> ServiceA["Service A (REST)"]
    Gateway --> ServiceB["Service B (REST)"]
    Gateway --> ServiceC["Service C (gRPC internally)"]
~~~

REST's "layered system" constraint explicitly permits (and encourages) intermediary layers — an API gateway can sit between clients and backend services, handling cross-cutting concerns (authentication, rate limiting, request routing) without clients needing awareness of the backend's internal architecture, even if internal services communicate via gRPC for performance.
`,

  "data-flow": `
Tracing a complete REST request through a typical production stack:

~~~mermaid
sequenceDiagram
    participant Client
    participant CDN as CDN/Cache
    participant Gateway as API Gateway
    participant Auth as Auth service
    participant Server as Application server
    participant DB as Database

    Client->>CDN: GET /products/123
    CDN->>Gateway: cache miss, forward
    Gateway->>Auth: validate bearer token
    Auth-->>Gateway: valid, user context
    Gateway->>Server: forward with user context
    Server->>DB: query product 123
    DB-->>Server: product data
    Server-->>Gateway: 200 OK + Cache-Control: max-age=300
    Gateway-->>CDN: 200 OK (CDN caches per Cache-Control)
    CDN-->>Client: 200 OK
~~~

Each step reflects a specific REST constraint at work: the CDN caching step depends entirely on the server having set appropriate Cache-Control headers (an explicit application-level decision, not automatic); the gateway's ability to validate the request independently of the backend server reflects statelessness (the bearer token carries all needed auth context); and the entire chain works with generic, resource-agnostic tooling (the CDN and gateway don't need product-specific logic) because of REST's uniform interface.
`,

  "production-usage": `
### Designing a production REST endpoint

~~~python
# FastAPI example (see the FastAPI skill for framework-specific depth)
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str

@app.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate):
    if await user_exists(payload.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = await create_user_record(payload)
    return user

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await fetch_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
~~~

### Non-negotiables for any production REST API

1. **Correct, consistent status code usage** — 201 for creation, 404 for missing resources, 409 for conflicts, not a blanket 200 with error details buried in the body.
2. **Consistent, structured error responses** across every endpoint, not ad-hoc per-endpoint error shapes.
3. **Explicit versioning strategy** decided before the first breaking change is needed, not improvised under pressure.
4. **Pagination on every collection endpoint** that could return an unbounded number of results.
5. **Rate limiting and authentication** applied consistently, typically at an API gateway layer.

### Common production patterns

- **API gateways** (Kong, AWS API Gateway, or a custom layer) handling cross-cutting concerns (auth, rate limiting, routing) in front of REST services.
- **OpenAPI/Swagger specifications** as the source of truth for an API's contract, enabling generated client SDKs and interactive documentation.
- **Bearer token (JWT) or API key authentication**, covered in depth in the **API Authentication** skill.
- **Structured request/response logging** for observability, correlating a request's full lifecycle across a distributed system.
`,

  "industry-examples": `
- **Nearly every major LLM provider's API** (OpenAI, Anthropic, and others): REST-based (HTTP plus JSON) for the vast majority of endpoints, with Server-Sent Events layered on top specifically for token streaming — directly relevant given this platform's AI engineering focus.
- **Stripe's API**: widely regarded as an exemplar of REST API design — consistent resource modeling, excellent error responses, idempotency key support for payment safety, and thorough documentation.
- **GitHub's REST API**: a large, long-lived public API demonstrating careful versioning (via Accept header media types) and consistent resource/relationship modeling across an enormous surface area.
- **Twilio's API**: another commonly cited example of clear resource-oriented design applied to a genuinely complex domain (communications).
- **Most internal microservice-to-microservice APIs** at companies not requiring gRPC's specific performance characteristics: REST remains the default choice for its simplicity and broad tooling support, even for internal-only communication.
- **Public cloud provider APIs** (AWS, Google Cloud, Azure): predominantly REST-based for their primary control-plane APIs, reflecting REST's continued dominance for APIs serving a wide range of client tooling and SDKs.
`,

  "best-practices": `
1. **Model resources as nouns, actions as HTTP methods** — GET /orders/42/cancel is a common anti-pattern; prefer POST /orders/42/cancel-action or a PATCH updating status.
2. **Use status codes correctly and consistently** — don't return 200 for everything with error details buried in a response body field.
3. **Version your API deliberately from day one**, even if it's just /v1/ — retrofitting versioning after clients depend on an unversioned API is significantly harder.
4. **Always paginate collection endpoints** that could return unbounded results.
5. **Design a consistent, structured error response format** across the entire API, not per-endpoint.
6. **Use idempotency keys for non-idempotent operations that might be retried** (particularly payments and order creation).
7. **Set appropriate Cache-Control and ETag headers** on cacheable GET responses to take advantage of REST's transparent HTTP caching.
8. **Document the API with OpenAPI/Swagger**, keeping the specification as the actual source of truth, not an afterthought.
9. **Apply the principle of least surprise**: a client familiar with HTTP semantics should be able to predict how your API behaves without reading extensive custom documentation.
10. **Rate-limit and authenticate consistently**, typically centralizing this at an API gateway layer rather than duplicating logic per-service.
11. **Avoid deeply nested URLs** (more than two levels) — prefer flatter structures with relationship data expressed in the response body or query parameters.
12. **Evaluate honestly whether REST is the right style** for a given API's actual needs, rather than defaulting to it reflexively.
`,

  "anti-patterns": `
### Verbs in URLs

~~~
# WRONG
POST /createUser
GET  /getUserOrders?userId=42
POST /deleteUser/42

# RIGHT
POST   /users
GET    /users/42/orders
DELETE /users/42
~~~

Baking verbs into URLs (rather than using the HTTP method to express the action) is one of the single most common REST anti-patterns, effectively turning a REST API into RPC-over-HTTP while still calling it "REST."

### Ignoring status codes

~~~json
// WRONG — always returns 200, error state buried in the body
HTTP/1.1 200 OK
{"success": false, "error": "User not found"}

// RIGHT
HTTP/1.1 404 Not Found
{"error": {"code": "USER_NOT_FOUND", "message": "User not found"}}
~~~

Returning 200 for every response discards information generic HTTP tooling (caches, monitoring, client libraries) relies on to distinguish success from failure automatically.

### Other production-grade anti-patterns

- **Chatty APIs requiring many round trips** for a single logical client operation, rather than designing endpoints around actual client use cases (sometimes requiring a purpose-built aggregate endpoint, or considering GraphQL for genuinely variable data needs).
- **No versioning strategy until the first breaking change is urgently needed**, forcing a rushed, poorly-considered versioning decision under pressure.
- **Inconsistent pluralization or naming conventions** across endpoints (/user/42 alongside /orders/7), confusing API consumers.
- **Exposing internal database schema details directly as the API's representation**, tightly coupling the API contract to internal implementation and making future refactoring harder.
- **Not rate-limiting public endpoints**, leaving the API vulnerable to abuse or unintentional overload from a single misbehaving client.
- **Assuming REST automatically means "well-designed"** — an API can use HTTP and JSON while still being poorly designed (Level 0-1 on the Richardson Maturity Model), and calling it "REST" doesn't make it so.
`,

  performance: `
### Rule zero: take advantage of REST's transparent HTTP caching

Correctly set Cache-Control, ETag, and Last-Modified headers on cacheable GET responses BEFORE reaching for custom application-level caching — this is a genuinely significant, often-overlooked performance lever unique to REST's HTTP-native design.

### The performance hierarchy (apply in order)

1. **Set appropriate caching headers** on cacheable responses, letting CDNs and intermediary caches absorb repeated request load without hitting the origin server at all.
2. **Paginate and limit collection responses**, avoiding unbounded result sets that strain both server and client.
3. **Support sparse field selection** (?fields=id,name) for genuinely large resources where clients commonly need only a subset.
4. **Avoid N+1-style chatty API usage patterns** by designing endpoints around actual client use cases, potentially with purpose-built aggregate endpoints for common multi-resource needs.
5. **Use compression (gzip/brotli)** for response bodies, a simple, broadly-supported performance win.
6. **Consider HTTP/2 or HTTP/3** for reduced connection overhead when serving many concurrent clients, particularly relevant for mobile clients on higher-latency networks.

### Micro-level facts worth knowing

- ETags enable conditional GET requests (If-None-Match) returning a lightweight 304 Not Modified when a resource hasn't changed, avoiding re-transferring an unchanged response body.
- Connection reuse (HTTP keep-alive, or HTTP/2 multiplexing) meaningfully reduces per-request overhead for clients making many sequential REST calls.
- JSON serialization/deserialization cost is often a genuinely measurable performance factor at high request volumes — profiling this specifically (rather than assuming it's negligible) is worthwhile for high-throughput APIs.
`,

  scalability: `
REST's statelessness constraint is the single most important architectural property enabling horizontal scale — because no server-side session state is required between requests, any request can be routed to any available server instance.

### The stateless scaling model

~~~mermaid
flowchart LR
    Client --> LB["Load balancer\n(no session affinity needed)"]
    LB --> S1["Server instance 1"]
    LB --> S2["Server instance 2"]
    LB --> S3["Server instance N"]
    S1 --> DB[("Shared database/cache")]
    S2 --> DB
    S3 --> DB
~~~

Because REST requests are self-contained (carrying authentication and all needed context), horizontal scaling is simply a matter of adding more identical server instances behind a load balancer — a direct, structural consequence of following REST's statelessness constraint correctly, not something requiring special additional engineering.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Database becomes the shared bottleneck as server instances scale out | Read replicas, caching layers (Redis, covered in its own skill), and query optimization |
| High request volume for identical, cacheable GET requests | CDN/edge caching, taking full advantage of Cache-Control headers |
| Chatty client usage patterns requiring many sequential requests | Redesign endpoints around actual client use cases, or consider GraphQL for genuinely variable data needs |
| Rate limiting/auth logic duplicated across many services | Centralize at an API gateway layer |
| Need for real-time, low-latency bidirectional communication | REST isn't the right tool at all — see the **WebSockets** skill |
`,

  security: `
### Authentication and authorization

~~~
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
~~~

Bearer tokens (typically JWTs, covered in the **API Authentication** skill) are the dominant REST authentication pattern — the token itself carries the authentication/authorization context, preserving statelessness (no server-side session lookup required).

### Essential REST security practices

1. **Always use HTTPS/TLS** — never transmit credentials or tokens over plain HTTP.
2. **Validate and sanitize all input**, never trusting client-provided data, the same universal discipline covered across the OWASP Top 10 skill.
3. **Apply rate limiting** to prevent abuse and brute-force attacks, typically at an API gateway layer.
4. **Return generic error messages for authentication failures** (401 with a generic message), avoiding leaking whether a specific username/email exists.
5. **Apply the principle of least privilege** in authorization checks — verify not just that a request is authenticated, but that the authenticated principal is authorized for the SPECIFIC resource being accessed (a common vulnerability class: Insecure Direct Object Reference, IDOR).
6. **Never expose sensitive data in URLs** (URLs are commonly logged by proxies and browsers) — sensitive data belongs in the request/response body or headers, not query parameters.
7. **Set appropriate CORS policies** for browser-based clients, restricting which origins may make cross-origin requests.

### A concrete IDOR example

~~~python
# WRONG — checks authentication but not authorization for THIS specific resource
@app.get("/orders/{order_id}")
async def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    return await fetch_order(order_id)   -- any authenticated user can view ANY order!

# RIGHT
@app.get("/orders/{order_id}")
async def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    order = await fetch_order(order_id)
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return order
~~~

See the **OWASP Top 10**, **API Authentication**, and **Web Security** skills for the general depth this applies against.
`,

  testing: `
### Testing a REST endpoint

~~~python
from fastapi.testclient import TestClient

def test_create_user_returns_201():
    client = TestClient(app)
    response = client.post("/users", json={"name": "Ada", "email": "ada@example.com"})
    assert response.status_code == 201
    assert response.json()["email"] == "ada@example.com"

def test_get_nonexistent_user_returns_404():
    client = TestClient(app)
    response = client.get("/users/999999")
    assert response.status_code == 404

def test_duplicate_email_returns_409():
    client = TestClient(app)
    client.post("/users", json={"name": "Ada", "email": "ada@example.com"})
    response = client.post("/users", json={"name": "Ada2", "email": "ada@example.com"})
    assert response.status_code == 409
~~~

### The senior testing doctrine

- Test the actual HTTP contract explicitly: status codes, response shape, and headers, not just that a handler function returns the expected data internally.
- Test authorization boundaries explicitly (a user cannot access another user's resources), not just authentication.
- Test pagination edge cases (empty results, the last page, an out-of-range page number).
- Use contract testing (validating against an OpenAPI specification) to catch drift between documented and actual API behavior.
- Test idempotency explicitly for operations that claim to be idempotent (calling DELETE twice, or PUT with the same payload twice).
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the actual HTTP request/response** (via curl -v, browser dev tools, or a proxy like mitmproxy) — confirm the exact method, headers, and body being sent and received, before assuming the issue is in application logic.
2. **Verify status codes match expectations** — a 500 versus a 422 versus a 404 point to very different root causes.
3. **Check authentication/authorization headers explicitly** — a surprising number of "bugs" are actually a missing or malformed Authorization header.
4. **Verify caching isn't serving stale data** — an intermediary cache or browser cache serving an old response can look identical to an application bug.
5. **Trace the request through each layer** (gateway, auth service, application server, database) in a distributed system, using correlation IDs to follow one request's full path.

### Debugging common REST-specific symptoms

- "Client gets a 404 for a resource I know exists" — check for URL typos, trailing slash inconsistencies, or a versioning mismatch (client calling /v1/ against a /v2/-only endpoint).
- "Response seems cached/stale" — check Cache-Control headers and intermediary caches (CDN, browser) explicitly, possibly using cache-busting query parameters to isolate the issue.
- "Intermittent 401s under load" — often a token expiration/refresh race condition, or a load balancer routing to an instance with a stale auth configuration.
- "POST succeeds but creates duplicate resources on retry" — missing idempotency key support for an operation that clients may retry after a timeout.
`,

  monitoring: `
### Key signals to track

- **Request rate and latency percentiles (p50/p95/p99)** per endpoint, the same universal signals covered across every service on this platform.
- **Status code distribution** — a rising rate of 4xx or 5xx responses is an early, important signal of either a client-side integration issue or a server-side defect.
- **Cache hit ratio** at the CDN/intermediary cache layer, directly reflecting how effectively Cache-Control headers are being utilized.
- **Rate limit rejection rate**, indicating either abuse or a client integration issue causing excessive request volume.

### Tools

Standard APM tools (Datadog, New Relic) and structured logging with correlation IDs for tracing a request across a distributed system; API gateways commonly provide built-in dashboards for request volume, latency, and status code distribution.

### Alerting priorities

Alert on elevated 5xx rates (server-side failures) with high urgency, elevated 4xx rates with lower urgency (often indicating a client integration issue rather than a server defect), and latency percentile regressions that could indicate an emerging capacity or dependency issue before it becomes a full outage.
`,

  deployment: `
### API gateway pattern

~~~mermaid
flowchart LR
    Client --> Gateway["API Gateway\n(auth, rate limit, routing, versioning)"]
    Gateway --> ServiceA["Users service"]
    Gateway --> ServiceB["Orders service"]
    Gateway --> ServiceC["Payments service"]
~~~

Deploying REST services behind an API gateway centralizes cross-cutting concerns (authentication, rate limiting, request routing, and often API versioning) rather than duplicating this logic across every individual service.

### Blue-green and canary deployments

Because REST's statelessness means any server instance can handle any request, blue-green deployments (routing traffic entirely from an old version to a new one) and canary deployments (routing a small percentage of traffic to a new version) are both straightforward to implement — a direct benefit of the statelessness constraint discussed throughout this page.

### CI/CD pipeline considerations

Contract testing against an OpenAPI specification as part of the CI pipeline catches breaking changes before deployment; automated API documentation generation from the OpenAPI spec keeps documentation synchronized with actual behavior. See the **CI/CD** and whichever backend framework skill (**FastAPI**, **Django**, **Express**, etc.) is relevant for framework-specific deployment depth.
`,

  "production-checklist": `
Before a REST API takes real production traffic:

- [ ] Resource-oriented URL design with correct HTTP method usage (no verbs in URLs)
- [ ] Correct, consistent status codes across every endpoint
- [ ] Consistent, structured error response format
- [ ] Explicit API versioning strategy in place from the first release
- [ ] Pagination implemented on every collection endpoint
- [ ] Appropriate Cache-Control/ETag headers set on cacheable responses
- [ ] Authentication and authorization implemented and tested (including IDOR checks)
- [ ] Rate limiting configured, typically at an API gateway layer
- [ ] Input validation applied to every endpoint accepting client data
- [ ] HTTPS/TLS enforced, no plaintext HTTP accepted
- [ ] OpenAPI/Swagger specification published and kept in sync with actual behavior
- [ ] Idempotency key support for non-idempotent operations that may be retried (payments, order creation)
- [ ] Structured logging with correlation IDs for distributed request tracing
- [ ] Monitoring and alerting configured for latency percentiles and status code distribution
- [ ] Load testing performed against expected production traffic patterns
`,

  "common-mistakes": `
1. **Baking verbs into URLs** instead of using HTTP methods to express actions.
2. **Returning 200 for every response**, burying error state in the response body instead of using correct status codes.
3. **No versioning strategy until a breaking change is urgently needed.**
4. **Unbounded collection endpoints without pagination**, risking performance issues at scale.
5. **Checking authentication but not authorization for a specific resource** (IDOR vulnerabilities).
6. **Ignoring HTTP caching semantics**, missing a genuinely significant, largely-free performance lever.
7. **Inconsistent error response formats** across different endpoints, complicating client-side error handling.
8. **Assuming "REST" automatically means well-designed**, without evaluating actual Richardson Maturity Model level.
9. **Deeply nested URLs** (more than two levels), producing brittle, unwieldy API surfaces.
10. **Not implementing idempotency keys for retryable non-idempotent operations**, risking duplicate resource creation.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| 404 for a resource that should exist | URL typo, trailing slash inconsistency, or versioning mismatch | Verify the exact URL and API version being called |
| 401 despite a valid-looking token | Token expired, malformed Authorization header, or clock skew affecting JWT validation | Verify token expiration and header format explicitly |
| 403 despite correct authentication | Authorization check failing for this specific resource (often intentional, sometimes an IDOR-prevention check working correctly) | Verify the authenticated principal's actual permissions for this resource |
| 409 Conflict on resource creation | Attempting to create a resource that violates a uniqueness constraint | Check for an existing resource before creating, or handle the conflict gracefully client-side |
| 422 Unprocessable Entity | Well-formed request body failing semantic/business validation | Inspect the validation error details in the response body |
| 429 Too Many Requests | Rate limit exceeded | Implement exponential backoff and respect Retry-After headers |
| Stale data despite a recent update | Intermediary or browser cache serving a cached response | Verify Cache-Control headers and use cache-busting or conditional requests as needed |
| Duplicate resources created on retry | Missing idempotency key support for a retried POST request | Implement idempotency key handling for retryable operations |
`,

  faqs: `
**Is my API "RESTful" just because it uses HTTP and JSON?**
Not necessarily — using HTTP and JSON as a transport doesn't guarantee correct resource modeling, appropriate status code usage, or statelessness; the Richardson Maturity Model helps assess how genuinely RESTful an API actually is, with most production APIs sitting at Level 2 (correct HTTP verb/status code usage) rather than full Level 3 HATEOAS.

**REST or GraphQL?**
Choose REST for standard CRUD-shaped resources, public APIs benefiting from HTTP's transparent caching, and broad tooling/language interoperability; choose GraphQL when clients need genuinely flexible field/relationship selection across varied query shapes, covered in depth in the **GraphQL** skill.

**REST or gRPC?**
Choose REST for public-facing APIs and broad client compatibility; choose gRPC for high-throughput internal service-to-service communication where wire efficiency and strict typing matter more than broad interoperability, covered in depth in the **gRPC** skill.

**Should I implement HATEOAS?**
For most APIs, the added design and maintenance complexity outweighs the perceived benefit, which is why the overwhelming majority of production "REST" APIs stop at Level 2 of the Richardson Maturity Model; HATEOAS is more commonly justified for APIs with genuinely complex, evolving state machines where client-side hardcoded business logic would be especially brittle.

**How should I version my REST API?**
URL path versioning (/v1/, /v2/) is the most widely adopted, highest-visibility approach in practice, even though header-based versioning is arguably more aligned with REST's resource-identification philosophy — choose based on your team's and clients' practical needs, but decide explicitly and early rather than retrofitting versioning later.

**Why do LLM provider APIs use REST plus Server-Sent Events rather than WebSockets for streaming?**
REST plus SSE fits the LLM streaming use case well because it's a genuinely one-directional (server-to-client) streaming need over a standard HTTP connection, requiring no bidirectional communication — see the **Server-Sent Events** skill for the full architectural reasoning.
`,

  "interview-questions": `
### Junior level

1. **What does "stateless" mean in the context of REST, and why does it matter?**
   Model answer: each request contains everything the server needs to process it, with no server-side session state retained between requests — this allows any server instance to handle any request, directly enabling straightforward horizontal scaling via load balancing.

2. **What's the difference between PUT and PATCH?**
   Model answer: PUT replaces a resource entirely (idempotent — the same PUT request applied twice produces the same end state); PATCH applies a partial update to a resource, and isn't necessarily idempotent depending on how the patch is expressed.

3. **What status code should a successful resource creation return, and what should the response typically include?**
   Model answer: 201 Created, typically including the created resource's representation and often a Location header pointing to the new resource's URL.

4. **Why shouldn't URLs contain verbs like /createUser or /deleteOrder?**
   Model answer: REST URLs should identify resources (nouns); the action is expressed via the HTTP method (POST /users, DELETE /orders/42) — putting verbs in URLs effectively turns the API into RPC-over-HTTP while still calling it REST.

5. **What is idempotency, and which HTTP methods are idempotent?**
   Model answer: an idempotent operation produces the same end state whether called once or multiple times; GET, PUT, and DELETE are idempotent by REST convention, while POST generally is not.

### Senior level

6. **What is the Richardson Maturity Model, and why does it matter for evaluating a "REST" API?**
   Model answer: it describes levels of RESTfulness from Level 0 (RPC-over-HTTP, a single URL/method) through Level 1 (multiple resource URLs), Level 2 (correct HTTP verb and status code usage — where most production APIs sit), to Level 3 (full HATEOAS); it matters because many APIs marketed as "REST" are genuinely closer to RPC-over-HTTP, and the model gives a concrete framework for assessing actual architectural compliance rather than taking a marketing label at face value.

7. **Why does REST's statelessness constraint specifically enable horizontal scalability, in concrete architectural terms?**
   Model answer: because a request carries all context needed to process it (rather than relying on server-retained session state), a load balancer can route any request to any available server instance without needing session affinity — this removes a common scaling bottleneck present in stateful, session-affinity-requiring architectures.

8. **When would you choose GraphQL or gRPC over REST for a new API, and why?**
   Model answer: GraphQL when clients need genuinely flexible field/relationship selection across widely varying query shapes (avoiding REST's over/under-fetching); gRPC for high-throughput internal service-to-service communication needing wire efficiency and strict typing over broad interoperability — REST remains the better default for public-facing APIs prioritizing broad tooling support and transparent HTTP caching.

9. **How would you design idempotency for a payment-creation POST endpoint that clients might retry after a network timeout?**
   Model answer: require a client-generated idempotency key header on the request; the server checks whether a request with that key has already been processed and, if so, returns the original result rather than creating a duplicate payment — this preserves safety under retries despite POST not being inherently idempotent.

10. **Explain a concrete Insecure Direct Object Reference (IDOR) vulnerability in a REST API and how to prevent it.**
    Model answer: an endpoint like GET /orders/{order_id} that checks the request is authenticated but doesn't verify the authenticated user actually owns THAT specific order allows any logged-in user to access any other user's order by guessing/iterating IDs; prevention requires an explicit authorization check comparing the resource's owner against the authenticated principal, not just confirming authentication succeeded.

11. **Why does REST get transparent HTTP caching "for free" in a way that GraphQL and gRPC generally don't?**
    Model answer: REST's resource-oriented GET requests map naturally onto HTTP's built-in caching semantics (Cache-Control, ETags, conditional requests), which intermediary caches and CDNs understand generically; GraphQL typically uses a single POST endpoint for all queries (defeating URL-based caching), and gRPC's binary protocol and typically bidirectional-streaming-capable transport doesn't fit the same HTTP GET caching model as naturally.

12. **How would you approach deprecating a REST API version without breaking existing clients?**
    Model answer: maintain the old version (e.g., /v1/) fully functional alongside the new version (/v2/) for a defined deprecation window, communicate the timeline clearly via documentation and deprecation headers (e.g., a Sunset header), monitor actual /v1/ usage to understand remaining client dependency before removal, and provide a clear migration guide describing the differences.
`,

  "coding-questions": `
### 1. Implement idempotency key handling for a POST endpoint

~~~python
from fastapi import FastAPI, Header, HTTPException

app = FastAPI()
idempotency_cache = {}   -- in production, use a real persistent store (Redis) with TTL

@app.post("/payments")
async def create_payment(payload: dict, idempotency_key: str = Header(...)):
    if idempotency_key in idempotency_cache:
        return idempotency_cache[idempotency_key]
    result = await process_payment(payload)
    idempotency_cache[idempotency_key] = result
    return result
# Follow-up: why is an in-memory dict insufficient for a real production
# implementation, and what would a Redis-backed version with an appropriate
# TTL need to handle correctly (concurrent requests with the same key arriving
# simultaneously, for instance)?
~~~

### 2. Implement cursor-based pagination

~~~python
import base64
import json

def encode_cursor(last_id):
    return base64.urlsafe_b64encode(json.dumps({"id": last_id}).encode()).decode()

def decode_cursor(cursor):
    return json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())["id"]

@app.get("/users")
async def list_users(cursor: str = None, limit: int = 50):
    last_id = decode_cursor(cursor) if cursor else 0
    users = await fetch_users_after(last_id, limit)
    next_cursor = encode_cursor(users[-1].id) if len(users) == limit else None
    return {"data": users, "next_cursor": next_cursor}
# Follow-up: why is cursor-based pagination generally more robust than
# offset-based pagination for a frequently-changing dataset, and what
# happens to an offset-based approach when items are inserted/deleted
# between a client's sequential page requests?
~~~

### 3. Implement a resource-ownership authorization check (IDOR prevention)

~~~python
@app.get("/orders/{order_id}")
async def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    order = await fetch_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    return order
# Follow-up: why does returning 404 (rather than 403) for a resource that
# exists but belongs to another user sometimes make sense from a security
# perspective, and what's the tradeoff involved in that choice?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Design and build a resource-oriented CRUD API
Using a backend framework of your choice, build a complete CRUD REST API for a single resource (e.g., "articles"), applying correct HTTP methods and status codes. Deliverable: a working API passing a checklist of correct method/status-code usage for each operation. Skills exercised: resource modeling, HTTP method/status code correctness.

### Lab 2 (Intermediate): Add pagination, filtering, and versioning
Extend the Lab 1 API with cursor-based pagination, query-parameter filtering/sorting, and a URL-path versioning scheme, including a documented migration path from v1 to a hypothetical v2. Deliverable: a versioned, paginated API with a written versioning policy. Skills exercised: pagination design, versioning strategy.

### Lab 3 (Advanced): Implement caching, idempotency, and authorization
Add appropriate Cache-Control/ETag headers, idempotency key support for a non-idempotent operation, and resource-ownership authorization checks (with an accompanying test proving an IDOR vulnerability is prevented). Deliverable: a production-hardened API with a security test suite. Skills exercised: HTTP caching, idempotency design, authorization testing.

### Lab 4 (Production): Design a HATEOAS-compliant endpoint and evaluate its tradeoffs
Redesign one endpoint from the previous labs to include hypermedia links (HATEOAS, Level 3 on the Richardson Maturity Model), then write a short analysis comparing its added complexity against the benefit for your specific use case. Deliverable: a HATEOAS-compliant endpoint plus a written tradeoff analysis. Skills exercised: HATEOAS design, architectural tradeoff evaluation.
`,

  "real-projects": `
### 1. A public-facing e-commerce product catalog API
Engineering requirements: resource-oriented endpoints for products, categories, and orders; cursor-based pagination for large catalogs; appropriate Cache-Control headers for product listings (which change infrequently) versus order data (which must never be stale); idempotency keys for order/payment creation; and a clear versioning policy supporting long-lived third-party integrations.

### 2. An internal microservice API behind an API gateway
Engineering requirements: a REST API for a specific internal domain (e.g., inventory management), deployed behind a shared API gateway handling authentication and rate limiting centrally; structured logging with correlation IDs for distributed tracing across the broader microservice architecture; and a clear internal API contract documented via OpenAPI, enabling other internal teams to generate client code.

### 3. A REST wrapper exposing an internal gRPC service to external partners
Engineering requirements: an external-facing REST API translating requests into calls against an internal gRPC service (the common "REST at the edge, gRPC internally" pattern), applying REST's broad tooling/language compatibility for external partners while preserving gRPC's internal performance benefits — directly connecting to the **gRPC** skill's own architecture discussion.
`,

  "case-studies": `
### Stripe's API design as an industry benchmark
Stripe's REST API is widely cited across the industry as an exemplar of careful, consistent resource modeling, clear error responses, and idempotency key support specifically engineered for the safety-critical payments domain. Lesson: investing deeply in API design quality (consistency, clear errors, safety mechanisms like idempotency keys) pays enduring dividends in developer trust and integration ease, particularly for APIs handling financially or otherwise critical operations.

### The SOAP-to-REST industry transition
The broad industry shift from SOAP/WSDL-based web services toward REST during the mid-to-late 2000s illustrates how a simpler, HTTP-native architectural style can displace a more heavyweight, protocol-driven predecessor once the ecosystem (tooling, developer familiarity, JSON as a lighter alternative to XML) matures around it. Lesson: architectural simplicity and alignment with an underlying protocol's native semantics (HTTP, in REST's case) can be a more durable competitive advantage than a predecessor's more exhaustive formal specification (WSDL's contract-first rigor, in SOAP's case).

### LLM providers standardizing on REST plus SSE for streaming
The near-universal convergence of major LLM providers on a REST-plus-Server-Sent-Events pattern for chat completion APIs (rather than WebSockets or a custom binary protocol) illustrates REST's continued relevance even for a genuinely novel API use case (streaming AI-generated tokens) that didn't exist when Fielding wrote his original dissertation. Lesson: REST's core constraints (statelessness, HTTP-native design, broad interoperability) remain a strong default even for API needs their original designer never anticipated, provided the actual data flow (one-directional server-to-client streaming, in this case) genuinely fits REST-plus-SSE's specific strengths rather than needing WebSockets' bidirectional capability.
`,

  comparisons: `
| Aspect | REST | GraphQL | gRPC | WebSockets | Server-Sent Events |
|--------|------|---------|------|------------|---------------------|
| Data format | Typically JSON | JSON (typed schema) | Protocol Buffers (binary) | Any (often JSON over text frames) | Text (typically JSON payloads) |
| Transport | HTTP/1.1 or HTTP/2 | HTTP (typically POST) | HTTP/2 | A dedicated WebSocket connection | HTTP/1.1 or HTTP/2 (long-lived) |
| Directionality | Request-response | Request-response | Request-response, streaming, or bidirectional | Full-duplex, bidirectional | Server-to-client only |
| HTTP caching | Native, transparent | Not naturally (single POST endpoint) | Not applicable | Not applicable | Not typically cached |
| Best fit | Public APIs, standard CRUD, broad interoperability | Flexible client-driven queries, varied field/relationship needs | High-throughput internal service communication | Real-time bidirectional communication (chat, collaborative editing) | Server-to-client streaming (LLM token streaming, live feeds) |

**How seniors choose**: reach for REST as the default for public-facing, standard CRUD-shaped APIs prioritizing broad tooling support and transparent HTTP caching; reach for GraphQL, gRPC, WebSockets, or Server-Sent Events (each covered in its own skill in this category) when their specific strengths genuinely match a particular API's actual requirements, rather than defaulting to REST reflexively for every API need.
`,

  "related-technologies": `
- **HTTP** — the foundational protocol REST is built entirely on top of; understanding HTTP methods, status codes, and headers is essential prerequisite context.
- **GraphQL** — the client-driven query alternative addressing REST's over/under-fetching limitation; see its own skill for full depth.
- **gRPC** — the high-performance RPC alternative for internal service-to-service communication; see its own skill for full depth.
- **WebSockets** and **Server-Sent Events** — the real-time and streaming alternatives for use cases REST's request-response model doesn't naturally fit.
- **OpenAPI/Swagger** — the dominant specification format for documenting REST API contracts.
- **API Authentication** — the authentication/authorization patterns (bearer tokens, OAuth, JWTs) most commonly layered onto REST APIs.

Learning path: **HTTP** → this page → **GraphQL**/**gRPC**/**WebSockets**/**Server-Sent Events** for the alternative API styles covered in this same category → **API Authentication** for the security layer.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- REST remains the dominant style for public-facing APIs, including nearly every major LLM provider's chat completion and embedding endpoints.
- Continued industry emphasis on OpenAPI-driven development (generating client SDKs, documentation, and even server stubs directly from an OpenAPI specification) as a practical way to keep a REST API's actual behavior and documentation in sync.
- Growing adoption of HTTP/2 and HTTP/3 for REST APIs, reducing connection overhead particularly relevant for mobile and high-latency client contexts.
- Continued, healthy coexistence between REST, GraphQL, and gRPC — rather than any one style displacing the others, most organizations use each where its specific strengths genuinely fit (REST for public APIs, gRPC for internal high-throughput communication, GraphQL for client-flexible query needs).
- Given how quickly API tooling and provider-specific conventions evolve, verify specific LLM provider API details against their current official documentation rather than assuming long-term stability of any provider-specific endpoint shape.
`,

  "future-roadmap": `
Where REST is heading, and what's worth betting career time on:

- **Continued dominance for public-facing APIs**, with REST's transparent HTTP caching and broad tooling support remaining durable advantages unlikely to be displaced by GraphQL or gRPC for this specific use case.
- **Deepening OpenAPI-driven tooling**, likely continuing to reduce the manual effort of keeping documentation, client SDKs, and even test suites synchronized with an API's actual contract.
- **Continued growth of hybrid architectures**: REST at the public edge, gRPC internally, a pattern likely to remain common rather than any single style "winning" universally.
- **What to bet on**: understanding REST's underlying architectural REASONING (statelessness enabling scale, HTTP-native caching, uniform interface enabling generic tooling) rather than memorizing surface-level conventions — this reasoning transfers directly to evaluating ANY API design choice, including when NOT to use REST, which is a more durable and valuable skill than REST-specific syntax knowledge alone.
`,

  "cheat-sheet": `
~~~
# ---- Resource-oriented URLs (nouns, not verbs) ----
GET    /users           -- list
GET    /users/42         -- retrieve one
POST   /users            -- create        -> 201 Created
PUT    /users/42          -- replace       -> 200 OK
PATCH  /users/42           -- partial update -> 200 OK
DELETE /users/42            -- delete       -> 204 No Content

# ---- Status codes that matter most ----
200 OK | 201 Created | 204 No Content
400 Bad Request | 401 Unauthorized | 403 Forbidden
404 Not Found | 409 Conflict | 422 Unprocessable Entity
429 Too Many Requests | 500 Internal Server Error

# ---- Idempotent methods: GET, PUT, DELETE ----
# ---- NOT idempotent by default: POST (use an Idempotency-Key header) ----

# ---- Pagination (cursor-based is more robust than offset-based) ----
GET /users?cursor=eyJpZCI6MTAwfQ&limit=50

# ---- Versioning (URL path is the most common in practice) ----
GET /v1/users

# ---- Caching (REST's transparent HTTP-native superpower) ----
Cache-Control: max-age=300
ETag: "33a64df551"
If-None-Match: "33a64df551"   -- conditional GET -> 304 if unchanged

# ---- Richardson Maturity Model ----
# Level 0: RPC-over-HTTP (one URL, one method)
# Level 1: multiple resource URLs
# Level 2: correct HTTP verbs + status codes  <- most production "REST" APIs live here
# Level 3: HATEOAS (hypermedia links)          <- rarely implemented in practice

# ---- Security essentials ----
# Always HTTPS. Bearer tokens for auth. Check AUTHORIZATION, not just authentication (IDOR!).
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Who defined REST, and when? | Roy Fielding, in his year-2000 doctoral dissertation. |
| What does statelessness enable architecturally? | Any server instance can handle any request -> straightforward horizontal scaling via load balancing. |
| PUT vs PATCH? | PUT replaces a resource entirely (idempotent). PATCH partially updates it (not necessarily idempotent). |
| Which HTTP methods are idempotent? | GET, PUT, DELETE. POST generally is NOT. |
| What's the #1 REST URL anti-pattern? | Verbs in URLs (e.g. /createUser) instead of using the HTTP method. |
| What does the Richardson Maturity Model measure? | How "RESTful" an API actually is, from RPC-over-HTTP (Level 0) to full HATEOAS (Level 3). |
| What level do most production "REST" APIs actually reach? | Level 2 -- correct HTTP verbs and status codes, WITHOUT HATEOAS. |
| Why does REST get HTTP caching "for free"? | Resource-oriented GET requests map natively onto Cache-Control/ETag semantics generic caches understand. |
| What's an idempotency key for? | Letting a client safely retry a non-idempotent POST (e.g. payments) without creating a duplicate. |
| REST vs GraphQL -- when to choose GraphQL? | When clients need flexible, varied field/relationship selection across many query shapes. |
| REST vs gRPC -- when to choose gRPC? | High-throughput internal service-to-service communication needing wire efficiency and strict typing. |
| What is an IDOR vulnerability? | Checking authentication but not resource-specific authorization, letting a user access another user's data. |
`,

  mcqs: `
1. What architectural property of REST directly enables straightforward horizontal scaling via load balancing?
   A) JSON as the data format  B) Statelessness — any request carries everything needed, so any server instance can handle it  C) Using POST for everything  D) HATEOAS
   **Answer: B** — no session affinity is required, since each request is self-contained.

2. Which HTTP method is NOT idempotent by REST convention?
   A) GET  B) PUT  C) DELETE  D) POST
   **Answer: D** — calling POST multiple times typically creates multiple new resources, unlike GET/PUT/DELETE.

3. What is the most common REST URL anti-pattern?
   A) Using nouns for resources  B) Using query parameters for filtering  C) Baking verbs into the URL (e.g. /createUser)  D) Nesting one level of resources
   **Answer: C** — the HTTP method should express the action, not the URL itself.

4. At which Richardson Maturity Model level do most production APIs described as "REST" actually sit?
   A) Level 0  B) Level 1  C) Level 2  D) Level 3 (full HATEOAS)
   **Answer: C** — correct HTTP verb and status code usage, without implementing hypermedia controls.

5. What HTTP mechanism lets REST responses be transparently cached by CDNs and intermediary caches?
   A) Bearer tokens  B) Cache-Control and ETag headers  C) The request body format  D) URL versioning
   **Answer: B** — a genuinely significant, largely free performance lever unique to REST's HTTP-native design.

6. What security vulnerability occurs when an endpoint checks authentication but not resource-specific authorization?
   A) Cross-site scripting  B) SQL injection  C) Insecure Direct Object Reference (IDOR)  D) CSRF
   **Answer: C** — a user can access or modify another user's resources by guessing/iterating resource IDs.
`,

  "revision-notes": `
REST (Representational State Transfer) is the architectural style — not a formal protocol — underlying the overwhelming majority of web APIs, first articulated by Roy Fielding in his year-2000 doctoral dissertation as a distillation of the properties that made the World Wide Web itself scale. A REST API exposes resources (nouns) via URLs, uses a small, fixed set of standard HTTP methods (GET, POST, PUT, PATCH, DELETE) to express actions, and treats every request as self-contained and stateless — no server-side session state is retained between requests.

Statelessness is the single most architecturally important constraint: because each request carries everything the server needs to process it, any server instance can handle any request, directly enabling straightforward horizontal scaling via load balancing with no session affinity required. REST's uniform interface (the same small set of methods and status codes used identically across every REST API) is what lets generic tooling (browsers, curl, API testing tools) interact with any REST API without resource-specific knowledge — the same reason a web browser can render any website.

The Richardson Maturity Model describes levels of "RESTfulness": Level 0 (a single URL/method, essentially RPC-over-HTTP), Level 1 (multiple resource URLs), Level 2 (correct HTTP verb and status code usage — where the overwhelming majority of production APIs described as "REST" actually sit), and Level 3 (full HATEOAS, where responses include hypermedia links describing available next actions). Fielding's original definition of REST includes HATEOAS as an essential constraint, yet it's rarely implemented in practice given its added design and maintenance complexity relative to its perceived benefit for most APIs — a genuinely important nuance for evaluating whether an API marketed as "REST" is actually architecturally compliant.

REST gets transparent HTTP caching largely "for free": because resource-oriented GET requests map naturally onto HTTP's built-in Cache-Control and ETag semantics, intermediary caches and CDNs can serve repeated requests without hitting the origin server at all — a genuinely significant performance and scalability lever that GraphQL (typically using a single POST endpoint for all queries) and gRPC don't get as naturally. Common production essentials include correct, consistent status code usage (not a blanket 200 with error details buried in the body), a deliberate versioning strategy decided from day one, pagination on every collection endpoint, and idempotency keys for non-idempotent operations (particularly payments) that clients might retry after a network timeout.

The most important REST security discipline beyond standard authentication is resource-specific AUTHORIZATION — checking not just that a request is authenticated but that the authenticated principal is actually permitted to access THIS specific resource, since failing to do so produces an Insecure Direct Object Reference (IDOR) vulnerability, a common and serious REST API security defect. A senior engineer evaluates whether REST is the right architectural choice deliberately rather than defaulting to it reflexively — REST fits public-facing APIs, standard CRUD-shaped resources, and use cases benefiting from broad tooling interoperability and transparent HTTP caching, while GraphQL, gRPC, WebSockets, and Server-Sent Events (each covered in their own skills in this category) better fit flexible client-driven queries, high-throughput internal service communication, real-time bidirectional communication, and server-to-client streaming respectively.
`,

  "learning-roadmap": `
**Week 1 — HTTP and REST fundamentals**: HTTP methods, status codes, resource-oriented URL design. Milestone: build a basic CRUD REST API using a backend framework of choice, with correct method/status code usage.

**Week 2 — Pagination, filtering, and versioning**: cursor-based pagination, query-parameter filtering/sorting, and an explicit versioning strategy. Milestone: extend the Week 1 API with pagination and a documented versioning policy.

**Week 3 — Caching and idempotency**: HTTP caching semantics (Cache-Control, ETags, conditional requests), and idempotency key design for non-idempotent operations. Milestone: add appropriate caching headers and idempotency key support to a payment-like endpoint.

**Week 4 — Security**: authentication (bearer tokens/JWTs), resource-specific authorization, and IDOR prevention. Milestone: write a test suite proving authorization boundaries are correctly enforced.

**Week 5 — The Richardson Maturity Model and HATEOAS**: assessing an API's actual RESTfulness, and implementing a HATEOAS-compliant endpoint to evaluate its tradeoffs firsthand. Milestone: complete a written analysis comparing HATEOAS's benefit against its added complexity for a specific use case.

**Week 6 — Architectural decision-making**: comparing REST against GraphQL, gRPC, WebSockets, and Server-Sent Events for a range of hypothetical API scenarios. Milestone: document a decision framework applied to at least three different hypothetical scenarios.

Next platform skill once this roadmap is complete: **GraphQL** for the client-driven query alternative, or **API Authentication** for a deeper security-layer treatment.
`,

  "official-docs": `
- **RFC 9110/9111/9112 (HTTP Semantics, Caching, and Message Syntax)** — the current official IETF specifications for HTTP, the protocol REST is built on top of.
- **Roy Fielding's dissertation, "Architectural Styles and the Design of Network-based Software Architectures"** (2000) — the original, primary source defining REST as an architectural style.
- **OpenAPI Specification (spec.openapis.org)** — the dominant specification format for documenting REST API contracts.
- **MDN Web Docs — HTTP** — comprehensive, practical reference documentation for HTTP methods, status codes, and headers.
`,

  books: `
- **"RESTful Web APIs" — Leonard Richardson, Mike Amundsen, Sam Ruby** — the definitive practical treatment of REST API design, written by the creator of the Richardson Maturity Model.
- **"Building Microservices" — Sam Newman** — covers REST API design extensively within the broader context of microservice architecture and inter-service communication choices.
- **"API Design Patterns" — JJ Geewax** — a comprehensive, pattern-based treatment of API design decisions applicable across REST and other API styles.
- **Roy Fielding's dissertation itself** — while dense and academic, remains the essential primary source for understanding REST's original architectural reasoning.
`,

  blogs: `
- **Stripe's own API documentation and engineering blog** — widely cited as an exemplar of REST API design in practice.
- **Various backend framework-specific blogs** (FastAPI, Django REST Framework, Express) covering REST implementation patterns in each specific ecosystem.
- **martinfowler.com's articles on REST maturity and API design** — accessible, widely-referenced explanations of the Richardson Maturity Model and related concepts.
- **The official OpenAPI Initiative blog** — updates on the OpenAPI specification and associated tooling.
`,

  "research-papers": `
- **Fielding, R. — "Architectural Styles and the Design of Network-based Software Architectures"** (2000, doctoral dissertation, UC Irvine) — the foundational, primary source defining REST.
- **Fielding, R. and Taylor, R. — "Principled Design of the Modern Web Architecture"** (2002, ACM Transactions on Internet Technology) — a peer-reviewed treatment of the same architectural reasoning, condensed from the dissertation.
- See the **HTTP** skill's Research Papers section for the foundational RFC history underlying REST's transport layer.
`,

  videos: `
- **Roy Fielding's own talks and interviews on REST** — available across various conference archives, offering direct insight from REST's original author.
- **Various "REST API Design Best Practices" conference talks** (from conferences like API World, QCon) covering practical production API design.
- **Framework-specific REST API tutorials** (FastAPI, Django REST Framework, Express, Spring Boot official channels) for hands-on implementation walkthroughs.
- **"REST vs GraphQL vs gRPC" comparative talks** (various creators) providing a quick comparative overview across this category's related skills.
`,

  "github-repos": `
- **OAI/OpenAPI-Specification** — the official OpenAPI Specification repository, the standard for documenting REST API contracts.
- **public-apis/public-apis** — a large, curated list of public REST APIs, useful for studying real-world API design patterns across many domains.
- Framework-specific example repositories (Django REST Framework, FastAPI, Express) demonstrating REST implementation patterns in each ecosystem — see each framework's own skill for specific repository references.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Resource modeling basics**: design a resource-oriented URL scheme (with correct HTTP methods and status codes) for a given domain (e.g., a library system with books, authors, and loans).
2. **Pagination design**: implement both offset-based and cursor-based pagination for a large dataset, and write a test demonstrating the specific failure mode offset-based pagination exhibits under concurrent inserts.
3. **Caching implementation**: add Cache-Control and ETag support to an existing endpoint, and write a test verifying a conditional GET returns 304 when the resource is unchanged.
4. **Idempotency design**: implement idempotency key handling for a non-idempotent operation, including a test simulating a concurrent duplicate request.
5. **Authorization/IDOR testing**: write a test suite proving a set of endpoints correctly enforces resource-specific authorization, not just authentication.
6. **External practice sets**: Stripe's API documentation for studying exemplary REST design in a real, complex domain; the OpenAPI Specification's own examples for contract-design practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client Layer
        Browser["Browser client"]
        Mobile["Mobile client"]
        Server_["Server-to-server client"]
    end
    subgraph Edge
        CDN["CDN / Cache\n(transparent HTTP caching)"]
        Gateway["API Gateway\n(auth, rate limit, versioning, routing)"]
    end
    subgraph Services
        UsersService["Users service (REST)"]
        OrdersService["Orders service (REST)"]
        PaymentsService["Payments service (REST,\nidempotency-key protected)"]
    end
    subgraph Data
        DB[("Database")]
        Cache["Redis cache"]
    end
    Browser --> CDN
    Mobile --> CDN
    Server_ --> Gateway
    CDN --> Gateway
    Gateway --> UsersService
    Gateway --> OrdersService
    Gateway --> PaymentsService
    UsersService --> DB
    OrdersService --> DB
    PaymentsService --> DB
    UsersService --> Cache
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((REST))
    Foundations
      Overview
      History Fielding 2000
      Why it exists
      Problem it solves
    Core Constraints
      Statelessness
      Uniform interface
      Cacheability
      Layered system
      Resource orientation
      HATEOAS
    Design Elements
      Resource-oriented URLs
      HTTP methods and idempotency
      Status codes
      Pagination filtering versioning
      Error response format
    Richardson Maturity Model
      Level 0 RPC over HTTP
      Level 1 resources
      Level 2 HTTP verbs
      Level 3 HATEOAS
    Production Concerns
      Caching ETags Cache-Control
      Idempotency keys
      Security IDOR authZ
      API gateways
    Comparisons
      Versus GraphQL gRPC WebSockets SSE
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default rest;
