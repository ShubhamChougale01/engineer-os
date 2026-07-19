import type { SkillContent } from "../types";

const reverseProxy: SkillContent = {
  overview: `
A reverse proxy is a server that sits in front of one or more backend servers, intercepting client requests and forwarding them to the appropriate backend, then relaying the backend's response back to the client — all while the client remains unaware of which specific backend server actually handled the request, or how many backends exist at all. Where the **Load Balancers** skill (covered immediately before this one) focuses specifically on distributing traffic across multiple equivalent backend instances, a reverse proxy is the broader category of "front door" component that performs this interception, and load balancing is simply one of the most common things a reverse proxy does — in fact, most real-world software (NGINX, HAProxy, Envoy) functions as both simultaneously.

For an AI engineer, understanding reverse proxies directly explains how a production API gets TLS termination, request/response header manipulation, caching, and compression applied uniformly without every individual backend service needing to implement each of these itself, and how a single public-facing domain can transparently route to many different internal services. This foundational role directly sets up the **API Gateway** skill immediately following this one, which adds authentication, rate limiting, and API-specific concerns on top of the same basic reverse-proxying mechanism.

Key characteristics: **request forwarding**, receiving a client request and relaying it to an appropriate backend, then relaying the response back; **the "hidden backend" property**, where clients only ever interact with the reverse proxy's own address, never learning the backend topology directly; **cross-cutting concern centralization** (TLS termination, compression, caching, header manipulation) applied once at the proxy layer rather than duplicated across every backend service; and **its contrast with a forward proxy**, which acts on behalf of CLIENTS (hiding their identity from servers), while a reverse proxy acts on behalf of SERVERS (hiding backend topology from clients) — a frequently-confused but important distinction.
`,

  history: `
| Year | Milestone |
|------|-----------|
| Early-to-mid 1990s | **Forward proxies** (client-side caching/filtering proxies) become common first, for corporate content filtering and caching; the REVERSE proxy concept follows as web traffic grows and server-side scaling/interception needs emerge |
| Mid-to-late 1990s | Early web servers (Apache among them) begin supporting reverse-proxy-style configurations (mod_proxy), letting a single server front multiple backend applications |
| 2004 | **NGINX** is released by Igor Sysoev, explicitly designed to solve the C10K problem (handling ten thousand concurrent connections efficiently) and rapidly becomes one of the most widely deployed reverse proxies and web servers |
| 2000s | **HAProxy** (released 2001, gaining rapid adoption through the decade) becomes a dominant choice specifically for combined reverse-proxy-and-load-balancing use cases |
| 2010s | Reverse proxies become a standard, expected layer in virtually every production web architecture, commonly handling TLS termination, compression, and static asset caching in front of application servers |
| 2016 onward | **Envoy** (from Lyft) emerges as a modern, cloud-native reverse proxy purpose-built for dynamic microservices environments, becoming the standard data-plane component in service mesh architectures (Istio, and others) |
| 2020s | Reverse proxy functionality increasingly appears as a built-in, often implicit part of Kubernetes Ingress controllers and API gateway products, rather than a separately hand-configured standalone component for many teams |

Reverse proxy history closely parallels load balancer history (both are often the same underlying software), with the throughline being an industry-wide move from simple, single-purpose components toward sophisticated, cloud-native proxies (Envoy especially) purpose-built for the dynamic, ephemeral service topologies of modern microservices architectures.
`,

  "why-it-exists": `
Reverse proxies exist because it's architecturally inefficient and operationally fragile to expose every individual backend server directly to the public internet, and to duplicate cross-cutting concerns (TLS handling, compression, caching, access logging) inside every single backend application. Without a reverse proxy, each backend service would need its own public IP and its own TLS certificate management, clients would need direct knowledge of internal service topology (breaking encapsulation and making internal refactoring visible to external clients), and every backend would need to reimplement the same cross-cutting infrastructure concerns redundantly.

A reverse proxy solves this by becoming the single, well-known point of contact for clients, internally routing to whichever backend service actually needs to handle a given request, and centralizing cross-cutting infrastructure concerns in one place rather than scattering duplicate implementations across every backend. This directly builds on the **Load Balancers** skill's own "single stable entry point" motivation, extending it to the broader set of concerns a front-door component can usefully centralize beyond pure traffic distribution.
`,

  "problem-it-solves": `
Reverse proxies solve the **"how do we present a single, stable, well-managed front door to clients while flexibly routing internally to and centralizing cross-cutting concerns for a potentially complex, changing backend architecture"** problem.

Concretely, they provide:

- **Backend topology hiding**: clients never need to know how many backend servers exist, what internal addresses they use, or how that topology changes over time.
- **Centralized TLS termination**: handling the expensive TLS handshake and encryption/decryption once, rather than duplicating certificate management and cryptographic overhead across every backend service.
- **Centralized cross-cutting concerns**: compression, response caching, access logging, and request/response header manipulation applied uniformly at one layer.
- **Path-based and host-based routing**: directing requests to different backend services based on the URL path or the Host header, letting one public domain front multiple distinct internal services.
- **A security boundary**: the reverse proxy is the only component genuinely exposed to the public internet, letting backend servers live on a private, more tightly-controlled internal network.

What reverse proxies do **not** solve, or solve only partially: a reverse proxy itself must be made highly available (the same redundancy concern covered in the **Load Balancers** skill applies directly here); a reverse proxy alone doesn't provide API-specific concerns like authentication, authorization, or fine-grained per-client rate limiting — this is precisely the gap the **API Gateway** skill (covered next in this category) fills, building further capability on top of the same underlying reverse-proxying mechanism.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what a reverse proxy is and how it differs from a forward proxy.
2. Explain the cross-cutting concerns a reverse proxy commonly centralizes (TLS termination, compression, caching, header manipulation).
3. Configure path-based and host-based routing rules for a reverse proxy.
4. Explain how a reverse proxy relates to and overlaps with load balancing.
5. Recognize reverse proxy anti-patterns: exposing backends directly, missing security headers, misconfigured buffering.
6. Connect reverse proxies to the API Gateway and CDN skills covered elsewhere in this category.
7. Answer senior-level interview questions on reverse proxy configuration and architecture decisions.
`,

  prerequisites: `
- **Required**: the **Load Balancers** skill — reverse proxies frequently perform load balancing as one of their core functions.
- **Required**: the **Networking** and **TLS & HTTPS** skills — reverse proxies directly operate on and terminate these protocols.
- **Very helpful**: the **REST** skill for understanding the HTTP request/response model reverse proxies inspect and manipulate.

Dependency chain: **Load Balancers** → this page → **API Gateway** → **CDN** for the progressively more application-aware System Design technologies built on this foundation.
`,

  "beginner-concepts": `
### The basic idea

~~~mermaid
flowchart LR
    Client["Client"] --> RP["Reverse Proxy\n(public-facing)"]
    RP --> App["Application Server\n(private network)"]
    RP --> Static["Static File Server\n(private network)"]
~~~

The client only ever talks to the reverse proxy's public address; the reverse proxy decides internally which backend actually handles the request, and the client never sees or needs to know the backend's actual private address.

### Forward proxy versus reverse proxy

~~~
Forward proxy: sits in front of CLIENTS, acting on their
    behalf -- hides the CLIENT's identity from the server
    (e.g., a corporate proxy filtering employee web access).
Reverse proxy: sits in front of SERVERS, acting on their
    behalf -- hides the SERVER's (backend) identity from
    the client.
~~~

This distinction is frequently confused but genuinely important: a forward proxy protects/controls the client's outbound traffic, while a reverse proxy protects/manages the server side's inbound traffic — despite the underlying technical mechanism (intercepting and forwarding requests) being conceptually similar.

### A simple NGINX reverse proxy configuration

~~~
server {
    listen 80;
    location / {
        proxy_pass http://localhost:8080;
    }
}
~~~

This minimal configuration forwards every request received on port 80 to a backend application server running on port 8080 — the client never directly contacts port 8080.

### TLS termination at the reverse proxy

~~~
Client <--HTTPS--> Reverse Proxy <--HTTP--> Backend Server
~~~

The reverse proxy handles the TLS handshake and encryption/decryption, then communicates with the backend over plain HTTP on a trusted internal network — directly connecting to the **TLS & HTTPS** skill's own treatment of where encryption boundaries are placed in a real architecture.
`,

  "intermediate-concepts": `
### Path-based routing

~~~
location /api/ {
    proxy_pass http://api_backend;
}
location /static/ {
    proxy_pass http://static_backend;
}
~~~

Path-based routing lets one public domain front multiple genuinely distinct backend services, each responsible for a different portion of the URL space — a common pattern for gradually migrating a monolith to microservices, routing some paths to new services while others continue hitting the legacy backend.

### Host-based (virtual host) routing

~~~
server {
    server_name api.example.com;
    location / { proxy_pass http://api_backend; }
}
server {
    server_name www.example.com;
    location / { proxy_pass http://web_backend; }
}
~~~

Host-based routing lets a single reverse proxy instance serve multiple distinct domains, each routed to its own backend — commonly used to consolidate infrastructure for multiple related services or products under one reverse proxy layer.

### Response caching at the reverse proxy

~~~
location /static/ {
    proxy_pass http://static_backend;
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
}
~~~

Caching frequently-requested, rarely-changing responses (static assets, for instance) directly at the reverse proxy layer reduces load on backend servers and improves response latency for clients — a smaller-scale, single-location precursor to the **CDN** skill's own edge-caching concepts covered later in this category.

### Header manipulation

~~~
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Host $host;
~~~

Since the reverse proxy sits between the client and the backend, the backend would otherwise see the reverse proxy's own IP address as the apparent client, and the connection as always being plain HTTP (even if the client used HTTPS to reach the proxy) — X-Forwarded-* headers preserve this original client information for the backend to use (in logging, rate limiting, or redirect generation).
`,

  "advanced-concepts": `
### Buffering and its performance/memory tradeoff

~~~
proxy_buffering on;
proxy_buffer_size 8k;
proxy_buffers 8 8k;
~~~

A reverse proxy can buffer a backend's response before relaying it to a (potentially slow) client, freeing the backend to move on to the next request quickly rather than being held open waiting for a slow client connection to fully receive the response — a genuinely important technique for protecting backend capacity, at the cost of the reverse proxy's own memory usage growing with buffered response size and concurrent connection count.

### Reverse proxy as a security boundary

~~~
Client <--public internet--> Reverse Proxy <--private network--> Backends
~~~

Placing backend servers on a private network, reachable only through the reverse proxy, significantly reduces the attack surface directly exposed to the public internet — backend servers can be hardened and firewalled more aggressively since they're expected to only ever receive traffic from the trusted reverse proxy, directly connecting to the **OWASP Top 10** skill's own defense-in-depth principles.

### WebSocket and long-lived connection proxying

~~~
location /ws/ {
    proxy_pass http://websocket_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
~~~

Proxying WebSocket connections (covered in the **WebSockets** skill) requires explicit configuration to correctly handle the HTTP Upgrade handshake and maintain the long-lived, bidirectional connection through the proxy, rather than the proxy's default request/response assumptions (appropriate for typical short-lived HTTP requests) incorrectly terminating or mishandling the connection.

### The reverse proxy versus API gateway boundary

~~~mermaid
flowchart LR
    ReverseProxy["Reverse Proxy\n(routing, TLS, caching,\ncompression)"] --> APIGateway["+ API Gateway\n(auth, rate limiting,\nrequest transformation,\nAPI versioning)"]
~~~

Modern API gateways (covered in the next skill in this category) are frequently BUILT ON TOP OF reverse proxy technology (Envoy underlies several popular API gateway products), adding a further layer of API-specific concerns — recognizing this relationship helps clarify when a plain reverse proxy suffices versus when the additional API gateway capabilities are genuinely needed.
`,

  "internal-working": `
Tracing a request through a reverse proxy performing TLS termination, path-based routing, and response caching:

~~~mermaid
sequenceDiagram
    participant Client
    participant RP as Reverse Proxy
    participant Cache as Response Cache
    participant Backend as Backend Server

    Client->>RP: HTTPS request to /static/logo.png
    RP->>RP: TLS termination (decrypt)
    RP->>Cache: check cache for this path
    alt cache hit
        Cache-->>RP: cached response
    else cache miss
        RP->>Backend: forward as plain HTTP\n(with X-Forwarded-* headers)
        Backend-->>RP: response
        RP->>Cache: store response
    end
    RP->>RP: TLS encryption
    RP-->>Client: HTTPS response
~~~

1. **TLS is terminated at the reverse proxy**, decrypting the incoming request before any further processing.
2. **The proxy checks its own response cache first** for cacheable paths, avoiding an unnecessary round trip to the backend entirely on a cache hit.
3. **On a cache miss, the request is forwarded to the appropriate backend** (selected via path-based routing), with X-Forwarded-* headers added to preserve original client information.
4. **The response is optionally stored in the cache** (for future requests to the same path) before being encrypted and relayed back to the client.

**Why this matters**: this concrete flow shows how a reverse proxy centralizes multiple cross-cutting concerns (TLS, caching, routing, header management) in a single pass, sparing the backend server from needing to implement any of them itself.
`,

  architecture: `
A senior engineer thinks about reverse proxy architecture in terms of which cross-cutting concerns to centralize, how to structure routing rules for a growing service landscape, and how to keep the proxy layer itself from becoming a bottleneck or single point of failure.

### Deciding what to centralize at the reverse proxy layer

~~~mermaid
flowchart TB
    Concern["A cross-cutting concern\n(TLS, compression, caching,\nheader manipulation)"] --> Q{"Would duplicating this\nin every backend service\nbe wasteful or error-prone?"}
    Q -->|Yes| Centralize["Centralize at the\nreverse proxy layer"]
    Q -->|"No -- genuinely\nservice-specific logic"| KeepInService["Keep in the\nindividual backend service"]
~~~

### Structuring routing for a growing service landscape

~~~mermaid
flowchart LR
    RP["Reverse Proxy"] --> Legacy["/legacy/* -> Legacy Monolith"]
    RP --> UsersSvc["/api/users/* -> Users Service"]
    RP --> OrdersSvc["/api/orders/* -> Orders Service"]
~~~

Path-based routing rules structured around a service's actual API surface (rather than ad-hoc, historically-accumulated rules) make a growing microservices architecture's routing configuration far easier to reason about and extend — a common, deliberate pattern for gradually strangling a legacy monolith by routing new functionality's paths to new services while legacy paths continue hitting the original monolith.

### Ensuring the reverse proxy itself is highly available

This directly reuses the **Load Balancers** skill's own redundancy guidance — a reverse proxy, like a load balancer, must itself be deployed redundantly (an active-passive pair, or a cloud-managed equivalent) to avoid becoming a new single point of failure for the entire architecture behind it.
`,

  "data-flow": `
Tracing a request through a reverse proxy performing buffered response relay to a slow client:

~~~mermaid
sequenceDiagram
    participant SlowClient as Slow Client
    participant RP as Reverse Proxy (buffering)
    participant Backend

    SlowClient->>RP: request
    RP->>Backend: forward request
    Backend-->>RP: full response (fast)
    RP->>RP: buffer entire response
    Note over Backend: Backend is now FREE to\nhandle the next request --\nit doesn't wait on the slow client
    RP-->>SlowClient: relay response\n(at the client's own slow pace)
~~~

The critical detail: buffering lets the backend server complete its work and move on quickly, with the reverse proxy absorbing the cost of a slow client connection — without buffering, the backend itself would remain occupied (holding open a connection and associated resources) for as long as it takes the slow client to fully receive the response, directly reducing the backend's effective request-handling capacity.
`,

  "production-usage": `
### A production-representative NGINX reverse proxy configuration

~~~
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/example.crt;
    ssl_certificate_key /etc/ssl/private/example.key;

    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }

    location /static/ {
        proxy_pass http://static_backend;
        proxy_cache my_cache;
        proxy_cache_valid 200 1h;
    }
}
~~~

### Non-negotiables for production reverse proxies

1. **Always set X-Forwarded-* headers**, so backend services retain access to genuine client information for logging, rate limiting, and redirect generation.
2. **Make the reverse proxy itself redundant**, reusing the same high-availability approach covered in the **Load Balancers** skill.
3. **Structure routing rules around the actual service architecture**, keeping configuration maintainable as the backend landscape grows.
4. **Configure buffering deliberately**, understanding its memory-versus-backend-capacity tradeoff for your specific traffic patterns.
5. **Explicitly configure WebSocket/long-lived-connection handling** for any paths that need it, rather than relying on default assumptions suited only to short request/response cycles.

### Common production patterns

- **NGINX or HAProxy as a combined reverse proxy and load balancer**, the most common real-world deployment pattern.
- **Envoy as the data plane in a service mesh**, providing sophisticated Layer 7 reverse-proxying purpose-built for dynamic microservices.
- **Strangler-fig-pattern routing**, gradually migrating paths from a legacy monolith to new services via path-based routing rules.
`,

  "industry-examples": `
- **NGINX**: one of the most widely deployed reverse proxies and web servers globally, combining reverse proxying, load balancing, and caching in one product.
- **HAProxy**: widely used specifically for its combined reverse-proxy-and-load-balancing performance and reliability.
- **Envoy**: the modern, cloud-native reverse proxy underlying many service mesh (Istio) and API gateway products, purpose-built for dynamic microservices environments.
- **Cloudflare and other CDN providers**: operate reverse proxies at massive scale, directly connecting to and overlapping with the **CDN** skill covered later in this category.
- **AWS Application Load Balancer**: functions as both a Layer 7 load balancer and reverse proxy in AWS's managed service ecosystem.
`,

  "best-practices": `
1. **Always preserve original client information** via X-Forwarded-* headers for backend consumption.
2. **Make the reverse proxy itself redundant**, avoiding a new single point of failure.
3. **Structure path/host-based routing rules around the actual service architecture**, keeping configuration maintainable as the system grows.
4. **Centralize genuinely cross-cutting concerns** (TLS, compression, caching) at the proxy layer, but keep genuinely service-specific logic in the backend itself.
5. **Configure buffering deliberately**, understanding its tradeoff for your specific traffic and client characteristics.
6. **Explicitly configure long-lived connection handling** (WebSockets, Server-Sent Events) rather than relying on defaults suited only to short request/response cycles.
7. **Restrict backend servers to a private network**, reachable only through the reverse proxy, minimizing public attack surface.
8. **Monitor reverse proxy resource utilization and error rates** as a distinct, critical signal, since it sits in the path of all production traffic.
`,

  "anti-patterns": `
### Exposing backend servers directly to the public internet

~~~
# WRONG — backend servers each have their own public IP,
# reachable directly, bypassing the reverse proxy entirely
# and defeating its security-boundary and centralization purpose
# RIGHT — backend servers live on a private network, reachable
# ONLY through the reverse proxy
~~~

### Forgetting X-Forwarded-* headers

~~~
# WRONG — backend sees every request as coming from the
# reverse proxy's own IP, breaking client-IP-based rate
# limiting, geolocation, and logging
location / {
    proxy_pass http://backend;
    # missing proxy_set_header directives
}

# RIGHT
location / {
    proxy_pass http://backend;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
~~~

### Misconfigured buffering for WebSocket/streaming endpoints

~~~
# WRONG — default buffering assumptions applied to a
# WebSocket or Server-Sent Events endpoint, breaking the
# long-lived, incrementally-delivered connection
# RIGHT — explicitly disable/adjust buffering and configure
# Upgrade/Connection headers for these specific paths
~~~

### Other production-grade anti-patterns

- **Running a single, non-redundant reverse proxy instance**, reintroducing a single point of failure.
- **Overly permissive or missing security headers** (CORS, CSP, and others) at the proxy layer where they'd otherwise be centrally enforced.
- **Path-based routing rules accumulated ad-hoc over time**, becoming difficult to reason about as the service landscape grows.
`,

  performance: `
### Rule zero: centralizing cross-cutting concerns at the proxy layer generally improves overall system performance

Handling TLS termination, compression, and caching once at the proxy layer (rather than redundantly in every backend) reduces total system resource consumption and typically improves response latency for cacheable content.

### The performance hierarchy (apply in order)

1. **Cache aggressively at the proxy layer** for genuinely cacheable, frequently-requested content, avoiding unnecessary backend round trips entirely.
2. **Enable response buffering** to free backend capacity from slow client connections, tuned to your actual traffic's connection-speed distribution.
3. **Enable compression at the proxy layer** (gzip/brotli) for compressible content types, reducing bandwidth and improving client-perceived latency.
4. **Terminate TLS at the proxy**, offloading this cost from individual backend servers.
5. **Profile actual proxy-layer overhead** under realistic traffic, rather than assuming a given configuration's cost without measurement.

### Micro-level facts worth knowing

- NGINX's event-driven architecture (as opposed to a thread-per-connection model) is specifically what lets it efficiently handle tens of thousands of concurrent connections on modest hardware.
- Buffering trades reverse-proxy memory usage for backend capacity — tune buffer sizes to your actual response-size and client-speed characteristics.
- Response caching's benefit scales directly with how cacheable and how frequently-requested a given path actually is; caching unnecessarily-dynamic content provides little benefit and risks serving stale data.
`,

  scalability: `
Reverse proxies directly enable several distinct scalability patterns beyond pure load balancing.

### How reverse proxies support scaling a growing service landscape

~~~mermaid
flowchart LR
    Monolith["Legacy monolith"] --> Strangle["Strangler-fig migration:\nnew paths routed to new\nservices via the reverse proxy"]
    Strangle --> Microservices["Gradually-growing\nmicroservices architecture"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single reverse proxy instance's processing capacity exceeded | Scale the proxy layer horizontally (multiple redundant instances), reusing the **Load Balancers** skill's own guidance |
| Backend capacity strained by slow client connections | Enable response buffering at the proxy layer |
| Growing, hard-to-maintain routing configuration | Restructure path-based routing rules around the actual current service architecture, rather than ad-hoc historical accumulation |
| Repeated redundant TLS/compression cost across many backend services | Centralize these concerns at the reverse proxy layer |
`,

  security: `
### The reverse proxy as a defense-in-depth security boundary

~~~
Restricting backend servers to a private network, reachable
ONLY through the reverse proxy, significantly reduces the
attack surface directly exposed to the public internet --
backends can be hardened more aggressively knowing all
incoming traffic has already passed through the proxy layer.
~~~

### Essential reverse-proxy-related security practices

1. **Restrict backend servers to a private network**, never exposing them directly to the public internet.
2. **Centrally enforce security headers** (Content-Security-Policy, X-Frame-Options, and others covered in the **OWASP Top 10** skill) at the reverse proxy layer for consistency across all backend services.
3. **Keep TLS configuration current** (modern cipher suites, certificate rotation) at the proxy layer, since it's the actual TLS termination point.
4. **Validate and sanitize X-Forwarded-* headers** from any UPSTREAM proxy layer (if your proxy sits behind another proxy/CDN) to prevent header spoofing from untrusted sources.

See the **TLS & HTTPS** and **OWASP Top 10** skills for the broader security context this connects to.
`,

  testing: `
### Testing path-based routing configuration

~~~python
def test_api_path_routes_to_api_backend():
    response = client.get("https://proxy.example.com/api/users")
    assert response.headers["X-Backend-Server"] == "api_backend"

def test_static_path_routes_to_static_backend():
    response = client.get("https://proxy.example.com/static/logo.png")
    assert response.headers["X-Backend-Server"] == "static_backend"
~~~

### Testing X-Forwarded-* header propagation

~~~python
def test_client_ip_preserved_through_proxy():
    response = client.get(
        "https://proxy.example.com/api/whoami",
        headers={"X-Forwarded-For": "203.0.113.5"},
    )
    assert response.json()["client_ip"] == "203.0.113.5"
~~~

### The senior testing doctrine

- Test routing rules explicitly for every distinct path/host pattern, verifying requests reach the intended backend.
- Test that X-Forwarded-* headers are correctly set and consumed by backend services.
- Load-test the reverse proxy layer itself under realistic traffic, verifying it doesn't become a bottleneck before backend capacity is reached.
- Test WebSocket/long-lived-connection paths explicitly, verifying the Upgrade handshake and connection persistence work correctly through the proxy.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check reverse proxy access/error logs first** when a request appears to reach the wrong backend, or not reach any backend at all.
2. **Verify routing rule precedence and matching** if a request seems to hit an unexpected backend — routing rule ordering and specificity can cause surprising matches.
3. **Check X-Forwarded-* header propagation** if backend-side client-IP-dependent logic (rate limiting, geolocation) is behaving unexpectedly.
4. **Use distributed tracing** (the **Tracing** skill) to confirm the actual path a request took through the proxy and into the backend.

### Debugging common reverse-proxy-related symptoms

- "Requests are reaching the wrong backend" — check routing rule precedence/specificity; more specific rules should generally be evaluated before more general ones.
- "Backend-side rate limiting or geolocation is broken" — check whether X-Forwarded-* headers are being set and correctly parsed.
- "WebSocket connections drop unexpectedly" — verify Upgrade/Connection header configuration for that specific path.
- "Response caching seems to be serving stale content" — check the configured cache validity duration and cache invalidation triggers for the affected path.
`,

  monitoring: `
### Key signals to track

- **Request rate, latency, and error rate at the proxy layer**, since it sits in the path of all production traffic.
- **Cache hit/miss ratio** for cacheable paths, indicating how effectively the proxy layer is reducing backend load.
- **Per-backend request distribution**, verifying routing rules are directing traffic as intended.
- **TLS handshake success/failure rates and certificate expiration**, since the proxy is the actual TLS termination point.

### Tools

Reverse proxy product-specific metrics (NGINX's status module, HAProxy's stats page); standard infrastructure monitoring for the proxy layer's own resource utilization; distributed tracing for confirming end-to-end request routing behavior.

### Alerting priorities

Alert on elevated error rates or latency at the proxy layer (a leading indicator of broader issues, since all traffic passes through it), on certificate expiration approaching, and on unexpectedly low cache hit rates for paths expected to be highly cacheable.
`,

  deployment: `
### Deploying a redundant reverse proxy layer

Reuses the **Load Balancers** skill's own redundancy guidance directly — a self-managed active-passive pair with a floating IP, or (more commonly in modern architectures) a cloud provider's inherently redundant managed offering (which often combines load balancing and reverse-proxying in a single managed service).

### CI/CD pipeline considerations

Treat reverse proxy routing configuration as genuine, version-controlled infrastructure code, with automated validation (configuration syntax checks, and ideally integration tests verifying routing behavior) as part of the deployment pipeline before any configuration change reaches production. See the **CI/CD** skill for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production reverse proxy takes real traffic:

- [ ] Backend servers restricted to a private network, unreachable directly from the public internet
- [ ] X-Forwarded-* headers correctly configured and verified to reach backend services
- [ ] TLS termination configured with current, secure cipher suites and valid, monitored certificates
- [ ] Path/host-based routing rules structured clearly around the actual service architecture
- [ ] Response caching configured deliberately for genuinely cacheable paths, with appropriate validity durations
- [ ] Buffering configured appropriately for actual traffic and client-speed characteristics
- [ ] WebSocket/long-lived-connection paths explicitly configured, not relying on defaults
- [ ] Reverse proxy layer itself deployed redundantly
- [ ] Security headers centrally enforced at the proxy layer
`,

  "common-mistakes": `
1. **Exposing backend servers directly to the public internet**, bypassing the reverse proxy's security-boundary purpose.
2. **Forgetting X-Forwarded-* headers**, breaking backend-side client-IP-dependent logic.
3. **Misconfiguring buffering for WebSocket/streaming endpoints**, breaking long-lived connections.
4. **Running a single, non-redundant reverse proxy instance**, reintroducing a single point of failure.
5. **Letting routing configuration accumulate ad-hoc over time**, becoming difficult to reason about.
6. **Not centrally enforcing security headers** at the proxy layer where they'd otherwise be consistently applied.
7. **Caching genuinely dynamic content inappropriately**, risking serving stale data to users.
8. **Not monitoring proxy-layer error rates and latency as a distinct, critical signal.**
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| 502 Bad Gateway | Backend server unreachable or returning an invalid response | Check backend server health and reverse proxy connectivity to it |
| 504 Gateway Timeout | Backend taking longer than the configured proxy timeout to respond | Investigate backend latency; adjust timeout configuration if genuinely appropriate |
| Requests reaching the wrong backend | Routing rule precedence/specificity misconfiguration | Review and reorder routing rules by specificity |
| Backend sees the proxy's IP instead of the real client IP | Missing X-Forwarded-For header configuration | Add the appropriate proxy_set_header directive |
| WebSocket connection immediately drops | Missing Upgrade/Connection header configuration for that path | Add explicit WebSocket proxying configuration |
| Stale content served from cache | Overly long cache validity duration for genuinely dynamic content | Adjust cache validity duration or add explicit invalidation |
`,

  faqs: `
**What's the difference between a reverse proxy and a load balancer?**
A reverse proxy is the broader category of "front door" component that intercepts and forwards client requests to backend servers, centralizing cross-cutting concerns like TLS termination and caching; load balancing (distributing traffic across multiple equivalent backend instances) is one specific, very common function a reverse proxy performs — most real-world software (NGINX, HAProxy) does both simultaneously.

**What's the difference between a forward proxy and a reverse proxy?**
A forward proxy acts on behalf of clients, hiding their identity from servers (e.g., a corporate proxy filtering employee traffic); a reverse proxy acts on behalf of servers, hiding backend topology from clients — despite a similar underlying interception mechanism, they serve genuinely opposite purposes.

**Why should backend servers not be directly exposed to the public internet?**
Restricting backends to a private network, reachable only through the reverse proxy, significantly reduces the public attack surface and lets backends be hardened more aggressively, since they can assume all incoming traffic has already passed through the trusted proxy layer.

**Why do I need to configure X-Forwarded-* headers?**
Because the backend would otherwise see the reverse proxy's own IP address as the apparent client and the connection as always being plain HTTP — X-Forwarded-For and X-Forwarded-Proto preserve the genuine original client information the backend needs for logging, rate limiting, and redirect generation.

**When would I need an API gateway instead of (or in addition to) a plain reverse proxy?**
When you need API-specific concerns beyond pure routing and cross-cutting infrastructure handling — authentication, fine-grained per-client rate limiting, request/response transformation, and API versioning — which is precisely what the **API Gateway** skill (covered next in this category) adds, frequently building on the same underlying reverse-proxying mechanism.

**How does response buffering at the reverse proxy help backend capacity?**
Buffering lets the reverse proxy absorb a slow client connection's full response-delivery time, freeing the backend server to move on to its next request immediately rather than staying occupied waiting for a slow client to finish receiving data.
`,

  "interview-questions": `
### Junior level

1. **What is a reverse proxy?**
   Model answer: a server that sits in front of one or more backend servers, intercepting and forwarding client requests to the appropriate backend and relaying responses back, while hiding the backend topology from the client.

2. **How does a reverse proxy differ from a forward proxy?**
   Model answer: a forward proxy acts on behalf of clients (hiding their identity from servers), while a reverse proxy acts on behalf of servers (hiding backend topology from clients) — opposite purposes despite a similar underlying mechanism.

3. **Why would you terminate TLS at the reverse proxy rather than at each backend server?**
   Model answer: it centralizes the expensive TLS handshake and certificate management in one place, rather than duplicating this cost and operational burden across every backend server.

4. **What are X-Forwarded-* headers for?**
   Model answer: they preserve the original client's IP address and protocol information, which the backend would otherwise lose since it only sees the reverse proxy as the apparent connecting party.

### Senior level

5. **Explain the relationship between a reverse proxy, a load balancer, and an API gateway — are they three separate things or overlapping concepts?**
   Model answer: they're genuinely overlapping concepts implemented, in practice, by much of the same underlying software — a reverse proxy is the broad category (intercepting and forwarding requests, centralizing cross-cutting concerns like TLS and caching); load balancing (distributing traffic across multiple equivalent backend instances) is one common function a reverse proxy performs; an API gateway builds further on top of reverse-proxying, adding API-specific concerns (authentication, fine-grained rate limiting, request/response transformation, versioning) — in real deployments, a single product (NGINX, HAProxy, Envoy, or a dedicated API gateway product built on Envoy) frequently performs all three roles simultaneously, so the distinction is more about WHICH CONCERNS are being addressed than about genuinely separate pieces of infrastructure.

6. **Why is exposing backend servers directly to the public internet, even alongside a reverse proxy, a security anti-pattern?**
   Model answer: it defeats the reverse proxy's security-boundary purpose entirely — an attacker could bypass the proxy's centralized TLS enforcement, security headers, and any access controls by simply connecting directly to a backend's own public IP; backend servers should be restricted to a private network reachable ONLY through the reverse proxy, letting them be hardened more aggressively (tighter firewall rules, fewer exposed ports) under the assumption that all legitimate traffic has already passed through the trusted proxy layer.

7. **How would you design routing for gradually migrating a legacy monolith to microservices (the strangler-fig pattern) using a reverse proxy?**
   Model answer: configure the reverse proxy with path-based (or, if appropriate, more fine-grained content-based) routing rules that default to sending all traffic to the legacy monolith initially; as new functionality is built as standalone services, add specific routing rules directing just those new services' paths to the new microservices, while all other paths continue hitting the monolith unchanged; this lets the migration proceed incrementally, path by path, with the reverse proxy's routing configuration itself serving as the authoritative, easily-auditable record of migration progress, and lets any individual migrated path be rolled back quickly (reverting just its specific routing rule) if a problem is discovered, without needing to touch the underlying services themselves.

8. **A team's WebSocket-based real-time feature stopped working after a reverse proxy was introduced in front of the backend. What's the likely cause, and how would you fix it?**
   Model answer: the reverse proxy is very likely applying its default HTTP request/response handling assumptions (which assume a short-lived request followed by a complete response) to the WebSocket path, rather than correctly recognizing and passing through the HTTP Upgrade handshake that WebSocket connections require to switch from HTTP to a persistent, bidirectional connection; the fix is to explicitly configure that specific path in the reverse proxy to set the Upgrade and Connection headers appropriately (proxy_http_version 1.1 with Upgrade/Connection header pass-through, in NGINX's case) and typically to adjust or disable response buffering for that path, since a WebSocket connection's traffic pattern doesn't fit the buffer-then-relay model appropriate for typical short HTTP responses.

9. **How would you decide what cross-cutting concerns to centralize at the reverse proxy layer versus keeping in individual backend services?**
   Model answer: centralize concerns that are genuinely uniform and infrastructure-level in nature across all or most backend services — TLS termination, gzip/brotli compression, static-asset caching, and consistent security header enforcement are strong candidates, since duplicating them per-service would be wasteful and error-prone (subtle inconsistencies between services' individual implementations); keep genuinely service-specific business logic (application-level authorization decisions tied to a specific service's domain model, for instance) within the individual backend service itself, since centralizing overly specific logic at the proxy layer tends to create a monolithic, hard-to-maintain proxy configuration that couples unrelated services' concerns together.

10. **Design a highly available reverse proxy layer for a production system that cannot tolerate the proxy itself becoming a single point of failure.**
    Model answer: deploy at least two reverse proxy instances behind either a self-managed floating/virtual IP failover setup (using a tool like keepalived, with one instance active and one standby) or, more commonly and simply in a modern cloud architecture, place the reverse proxy instances behind a cloud provider's own managed load balancing service, which is inherently redundant across multiple underlying nodes/availability zones as part of the managed offering itself; either approach directly reuses the same high-availability principle covered in the **Load Balancers** skill, since a non-redundant reverse proxy instance would simply relocate — rather than eliminate — the single point of failure it was meant to help address for the backend fleet behind it.
`,

  "coding-questions": `
### 1. Write an NGINX configuration implementing path-based routing with TLS termination

~~~
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/ssl/certs/example.crt;
    ssl_certificate_key /etc/ssl/private/example.key;

    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /static/ {
        proxy_pass http://static_backend;
        proxy_cache my_cache;
        proxy_cache_valid 200 1h;
    }
}
# Follow-up: how would you add a THIRD location block routing
# /ws/ to a WebSocket backend, and what specific directives
# would that block need beyond the two shown above?
~~~

### 2. Implement a minimal reverse proxy in Python

~~~python
import http.server
import urllib.request

class ReverseProxyHandler(http.server.BaseHTTPRequestHandler):
    BACKEND = "http://localhost:9000"

    def do_GET(self):
        req = urllib.request.Request(
            self.BACKEND + self.path,
            headers={"X-Forwarded-For": self.client_address[0]},
        )
        with urllib.request.urlopen(req) as backend_response:
            self.send_response(backend_response.status)
            for header, value in backend_response.getheaders():
                self.send_header(header, value)
            self.end_headers()
            self.wfile.write(backend_response.read())
# Follow-up: this minimal implementation buffers the entire
# backend response in memory before relaying it -- what's the
# risk for a very large response, and how would streaming the
# response instead address it?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Configure NGINX as a basic reverse proxy with TLS termination
Set up NGINX in front of a simple backend HTTP server, configure TLS termination with a self-signed certificate, and verify requests are correctly forwarded and X-Forwarded-* headers are correctly received by the backend. Deliverable: a working configuration with verified header propagation. Skills exercised: basic reverse proxy and TLS termination configuration.

### Lab 2 (Intermediate): Implement path-based and host-based routing
Configure NGINX to route /api/* and /static/* to two different backend servers, and separately configure host-based routing for two different domain names pointing to different backends. Deliverable: a working multi-backend routing configuration with verified correct routing. Skills exercised: path-based and host-based routing.

### Lab 3 (Advanced): Configure and test response caching and WebSocket proxying
Configure NGINX to cache static asset responses with an appropriate validity duration, and separately configure and test WebSocket proxying for a simple echo WebSocket server, verifying the connection persists correctly through the proxy. Deliverable: a working configuration with verified cache hit behavior and functioning WebSocket proxying. Skills exercised: response caching and long-lived connection proxying.

### Lab 4 (Production): Design and implement a strangler-fig migration routing configuration
Given a simulated legacy monolith and two simulated new microservices, design and implement reverse proxy routing rules that gradually migrate specific paths to the new services while all other traffic continues hitting the legacy monolith, documenting the migration's routing configuration as it evolves. Deliverable: a documented, incrementally-evolving routing configuration demonstrating the migration pattern. Skills exercised: applied routing design for a realistic migration scenario.
`,

  "real-projects": `
### 1. A reverse-proxy-based strangler-fig migration for a legacy monolith
Engineering requirements: path-based routing rules incrementally migrating specific API paths from a legacy monolith to new microservices, with the routing configuration itself serving as an auditable record of migration progress.

### 2. A centralized TLS and security-header enforcement layer for a multi-service architecture
Engineering requirements: a single reverse proxy layer terminating TLS and centrally enforcing consistent security headers (CSP, X-Frame-Options) across many backend services, removing the need for each service to implement this individually.

### 3. A WebSocket-aware reverse proxy configuration for a real-time collaborative application
Engineering requirements: correctly configured Upgrade/Connection header handling and buffering adjustments for WebSocket paths, alongside standard HTTP routing and caching for the application's other, conventional API endpoints.
`,

  "case-studies": `
### NGINX's creation to solve the C10K problem
Igor Sysoev created NGINX specifically to address the "C10K problem" — efficiently handling ten thousand or more concurrent connections, which thread-per-connection web server architectures of the time struggled with — using an event-driven, non-blocking architecture instead; this specific architectural choice directly explains NGINX's continued dominance as a reverse proxy for high-concurrency production workloads decades later. Lesson: a foundational architectural decision made to solve a specific, well-articulated scaling problem can provide a durable competitive advantage lasting far longer than the original problem's own prominence in industry discussion.

### The strangler-fig pattern's reliance on reverse proxy routing for safe, incremental monolith migration
The strangler-fig pattern (a widely-cited software migration strategy, named for a fig species that gradually grows around and eventually replaces its host tree) is, in practice, almost always implemented using exactly the path-based routing capability covered on this page — a reverse proxy's routing configuration becomes the actual mechanism enabling teams to migrate a legacy system incrementally, path by path, with each migrated path being independently revertible by simply changing its specific routing rule. Lesson: a seemingly simple infrastructure capability (path-based routing) can be the concrete, practical enabler of an entire, otherwise-abstract architectural migration strategy discussed in industry literature.

### Envoy's adoption as the universal data plane across multiple service mesh products
Envoy's design as a modern, purpose-built reverse proxy for dynamic microservices environments led to its adoption as the underlying data plane for multiple, otherwise-competing service mesh control planes (Istio being the most prominent), demonstrating that a sufficiently well-designed, general-purpose reverse proxy can become shared, foundational infrastructure across an entire ecosystem rather than being tied to one specific vendor's control-plane product. Lesson: building a genuinely general-purpose, well-abstracted core component (rather than one tightly coupled to a specific product's business logic) can position that component to become foundational infrastructure well beyond its original creator's own specific use case.
`,

  comparisons: `
| Aspect | Reverse Proxy | Forward Proxy |
|--------|--------------------|--------------------|
| Acts on behalf of | The server (backend) | The client |
| Hides | Backend topology, from the client | Client identity, from the server |
| Common use case | TLS termination, routing, caching for a service | Corporate content filtering, client anonymization |

| Aspect | Plain Reverse Proxy | API Gateway |
|--------|--------------------------|------------------|
| Core function | Routing, TLS termination, caching, compression | All of reverse proxy's functions, plus auth, rate limiting, transformation |
| Typical scope | Any HTTP(S) traffic | Specifically API traffic |
| Common products | NGINX, HAProxy | Kong, AWS API Gateway, Envoy-based gateways |

**How seniors choose**: use a plain reverse proxy (NGINX/HAProxy) when routing, TLS termination, and basic caching genuinely suffice; reach for a dedicated API gateway (covered next in this category) specifically when authentication, fine-grained per-client rate limiting, or request/response transformation are genuinely needed on top of basic reverse-proxying.
`,

  "related-technologies": `
- **Load Balancers** — the closely related, often-combined System Design technology covered immediately before this page.
- **API Gateway** — builds directly on reverse-proxying, adding API-specific concerns; covered next in this category.
- **CDN** — extends reverse-proxy-style caching and routing to a globally-distributed edge network; covered later in this category.
- **TLS & HTTPS**, **Networking** — the foundational protocols reverse proxies directly operate on.
- **WebSockets**, **SSE** — long-lived connection protocols requiring explicit reverse proxy configuration.

Learning path: **Load Balancers** → this page → **API Gateway** → **CDN** for the progressively more application-aware System Design technologies built on this foundation.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued growth of Envoy-based reverse proxying as the standard data plane for service mesh architectures.
- Increasing convergence of reverse proxy, load balancer, and API gateway functionality into single, unified cloud-native products.
- Continued adoption of Kubernetes Gateway API as the evolving standard abstraction for reverse-proxy-style routing in containerized environments.
- Given continued evolution in this space, verify a specific product's current exact feature set and configuration syntax against official documentation.
`,

  "future-roadmap": `
Where reverse proxy technology is heading, and what's worth betting career time on:

- **Continued convergence of reverse proxy, load balancer, and API gateway functionality** into unified, cloud-native products, reducing the practical distinction between these categories for many teams.
- **Continued growth of service-mesh-integrated reverse proxying** (Envoy-based) as microservices architectures mature further.
- **Continued evolution of Kubernetes-native routing abstractions** (Gateway API) as the preferred standard for containerized workload traffic management.
- **What to bet on**: deeply understanding the underlying concepts (routing, TLS termination, cross-cutting concern centralization, the reverse-versus-forward-proxy distinction) — these transfer directly across any specific product's current configuration syntax, a far more durable investment than memorizing one tool's exact directives.
`,

  "cheat-sheet": `
~~~
# ---- What a reverse proxy does ----
Sits in FRONT of backend servers, intercepts client requests,
forwards to the right backend, relays the response back.
Client never sees backend topology directly.
~~~

~~~
# ---- Reverse proxy vs forward proxy ----
Reverse proxy: acts for the SERVER -- hides backend from client
Forward proxy: acts for the CLIENT -- hides client from server
~~~

~~~
# ---- Core NGINX directives ----
proxy_pass http://backend;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Host $host;
~~~

~~~
# ---- Routing patterns ----
Path-based:  location /api/ { ... }  location /static/ { ... }
Host-based:  server_name api.example.com; / www.example.com;
~~~

~~~
# ---- Cross-cutting concerns centralized here ----
TLS termination | compression | response caching |
security headers | access logging | request/response
header manipulation
~~~

~~~
# ---- WebSocket proxying needs explicit config ----
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
~~~

~~~
# ---- Non-negotiables ----
- Backends on a PRIVATE network only, never public-facing directly
- X-Forwarded-* headers always set
- Reverse proxy itself deployed redundantly (no new SPOF)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is a reverse proxy? | Front-door server intercepting client requests, forwarding to backends, hiding backend topology. |
| Reverse proxy vs forward proxy? | Reverse acts for the server; forward acts for the client. |
| Why terminate TLS at the reverse proxy? | Centralizes expensive handshake/cert management instead of duplicating per backend. |
| What do X-Forwarded-* headers do? | Preserve original client IP/protocol info that the backend would otherwise lose. |
| Why keep backends off the public internet? | Reduces attack surface; only the trusted proxy is directly exposed. |
| Path-based vs host-based routing? | Path-based routes by URL path; host-based routes by domain/Host header. |
| Why does buffering help backend capacity? | Proxy absorbs slow-client delivery time, freeing backend to move to the next request. |
| What needs special config for WebSockets? | Upgrade/Connection header pass-through, and usually disabling buffering. |
| Reverse proxy vs API gateway? | API gateway = reverse proxy + auth, rate limiting, transformation, versioning. |
| What is the strangler-fig pattern? | Incrementally migrating a monolith via path-based routing rules to new services. |
`,

  mcqs: `
1. What does a reverse proxy primarily hide from the client?
   A) The client's own IP address  B) The backend server topology  C) The TLS certificate  D) Nothing — it hides nothing
   **Answer: B** — clients only know the reverse proxy's address, never the backend's actual topology.

2. How does a reverse proxy differ from a forward proxy?
   A) They are identical  B) A reverse proxy acts on behalf of servers; a forward proxy acts on behalf of clients  C) A forward proxy only works with HTTPS  D) A reverse proxy is only used for caching
   **Answer: B** — opposite purposes despite a similar underlying interception mechanism.

3. Why are X-Forwarded-* headers necessary?
   A) They're not necessary  B) Without them, the backend sees the proxy's IP/protocol instead of the real client's, breaking IP-dependent logic  C) They enable TLS termination  D) They configure load balancing algorithms
   **Answer: B** — they preserve original client information for the backend to use.

4. Why should backend servers be restricted to a private network behind the reverse proxy?
   A) It's not necessary if TLS is used  B) It reduces the public attack surface, since only the trusted proxy is directly exposed  C) It improves compression  D) It's required for path-based routing
   **Answer: B** — a core defense-in-depth security practice.

5. What's the key difference between a plain reverse proxy and an API gateway?
   A) They are unrelated technologies  B) An API gateway adds API-specific concerns (auth, rate limiting, transformation) on top of the same underlying reverse-proxying mechanism  C) A reverse proxy is always faster  D) An API gateway cannot do routing
   **Answer: B** — API gateways are frequently built directly on top of reverse proxy technology.
`,

  "revision-notes": `
A reverse proxy sits in front of one or more backend servers, intercepting client requests, forwarding them to the appropriate backend, and relaying responses back — clients only ever interact with the reverse proxy's own address, remaining unaware of backend topology entirely. This is distinct from, but easily confused with, a FORWARD PROXY, which acts on behalf of CLIENTS (hiding their identity from servers) rather than on behalf of SERVERS (hiding backend topology from clients) as a reverse proxy does.

Reverse proxies centralize CROSS-CUTTING CONCERNS that would otherwise need to be duplicated across every backend service: TLS TERMINATION (handling the expensive handshake and certificate management once, at the proxy layer, communicating with backends over trusted internal plain HTTP), COMPRESSION, RESPONSE CACHING (a smaller-scale precursor to the **CDN** skill's edge-caching concepts), and SECURITY HEADER enforcement. PATH-BASED ROUTING (directing /api/* to one backend, /static/* to another) and HOST-BASED ROUTING (directing different domains to different backends) let one reverse proxy instance front an entire, potentially-complex service landscape — directly enabling the STRANGLER-FIG migration pattern, where a legacy monolith is gradually replaced by routing specific paths to new microservices over time while the rest continues hitting the original monolith.

A critical, easily-overlooked detail: X-FORWARDED-* HEADERS (X-Forwarded-For, X-Forwarded-Proto, Host) must be explicitly configured, since the backend would otherwise see every request as coming from the reverse proxy's own IP address, over what always appears to be plain HTTP, breaking any backend-side logic depending on genuine client IP or protocol information (rate limiting, geolocation, redirect generation). BUFFERING lets the reverse proxy absorb a slow client connection's full response-delivery time, freeing the backend server to move on to its next request immediately, trading reverse-proxy memory usage for backend capacity — a deliberate tradeoff tuned to actual traffic and client-speed characteristics.

WEBSOCKET and other long-lived-connection proxying (Server-Sent Events, and others) requires EXPLICIT configuration (Upgrade/Connection header pass-through, typically disabled or adjusted buffering) since a reverse proxy's default assumptions are built around short-lived, complete request/response cycles, not persistent bidirectional connections — a commonly-tested gap when WebSocket functionality unexpectedly breaks after introducing a reverse proxy.

A reverse proxy also serves as a genuine SECURITY BOUNDARY: restricting backend servers to a private network, reachable only through the proxy, significantly reduces the public attack surface, letting backends be hardened more aggressively under the assumption that all legitimate traffic has already passed through the trusted proxy layer — directly connecting to the **OWASP Top 10** skill's defense-in-depth principles. Like a load balancer (covered immediately before this page, and frequently the SAME underlying software), a reverse proxy must itself be deployed redundantly to avoid becoming a new single point of failure for the entire architecture behind it.

The relationship between a plain reverse proxy, a load balancer, and an API gateway (covered next in this category) is best understood as overlapping concerns rather than three genuinely separate technologies: a reverse proxy is the broad category of front-door interception and cross-cutting-concern centralization; load balancing (distributing traffic across equivalent backend instances) is one specific function a reverse proxy commonly performs; an API gateway builds FURTHER on top of the same reverse-proxying mechanism, adding authentication, fine-grained per-client rate limiting, and request/response transformation — in real deployments, a single product (NGINX, HAProxy, or an Envoy-based API gateway) frequently performs all three roles at once.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding what a reverse proxy is, the reverse-vs-forward-proxy distinction, and basic NGINX configuration. Milestone: complete Lab 1, with a working TLS-terminating reverse proxy and verified header propagation.

**Week 2 — Routing**: implementing path-based and host-based routing for multiple backends. Milestone: complete Lab 2, with verified correct routing across multiple backend services and domains.

**Week 3 — Caching and long-lived connections**: configuring response caching and WebSocket proxying. Milestone: complete Lab 3, with verified cache hit behavior and functioning WebSocket proxying.

**Week 4 — Production application**: designing and implementing a realistic strangler-fig migration routing configuration. Milestone: complete Lab 4, with a documented, incrementally-evolving routing configuration.

Next platform skill once this roadmap is complete: **API Gateway**, building directly on this page's reverse-proxying foundation with API-specific concerns.
`,

  "official-docs": `
- **NGINX's official reverse proxy documentation** — the authoritative, widely-referenced configuration reference.
- **HAProxy's official documentation** — covers combined reverse-proxy-and-load-balancing configuration in depth.
- **Envoy's official documentation** — the modern, cloud-native reverse proxy's comprehensive configuration reference.
`,

  books: `
- **"NGINX: From Beginner to Pro" — Rahul Sharma** — a focused, practical guide to NGINX's reverse proxy and web server configuration.
- **"System Design Interview" — Alex Xu** — covers reverse proxies and their role within broader system design scenarios.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — provides the broader architectural context reverse proxies operate within.
`,

  blogs: `
- **The official NGINX and HAProxy engineering blogs** — practical, product-specific configuration and performance guidance.
- **Lyft's engineering blog on Envoy** — detailed coverage of a modern, cloud-native reverse proxy's design and motivation.
- **Martin Fowler's writing on the strangler-fig pattern** — the original, widely-cited source for this incremental migration strategy.
`,

  "research-papers": `
- No single foundational academic paper defines "reverse proxy" as a term — the concept is primarily an industry/engineering pattern; relevant adjacent papers include Google's Maglev paper (referenced in the **Load Balancers** skill) for the closely related load balancing function reverse proxies commonly perform.
`,

  videos: `
- **NGINX and HAProxy official conference talks and tutorials** — practical, product-specific configuration walkthroughs.
- **Lyft engineering talks on Envoy's design** — detailed explanations of modern reverse proxy architecture for microservices.
- **System design interview preparation channels** covering reverse proxy configuration as a common interview topic.
`,

  "github-repos": `
- **nginx/nginx** — the official NGINX source repository.
- **haproxy/haproxy** — the official HAProxy source repository.
- **envoyproxy/envoy** — the official Envoy source repository.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Routing rule design**: given a described multi-service architecture, design appropriate path-based and host-based routing rules.
2. **Header propagation debugging**: given a described symptom (backend sees wrong client IP), diagnose and fix the missing configuration.
3. **WebSocket proxying configuration**: given a plain reverse proxy configuration, add the necessary directives to correctly support a WebSocket endpoint.
4. **Strangler-fig migration design**: design an incremental routing migration plan for a described legacy monolith and a set of new microservices.
5. **External practice sets**: "System Design Interview" (Alex Xu) practice problems covering reverse proxy and API gateway design within broader scenarios.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Public["Public Internet"]
        Client["Clients"]
    end
    subgraph ProxyLayer["Reverse Proxy Layer (redundant)"]
        RP1["Reverse Proxy Instance 1"]
        RP2["Reverse Proxy Instance 2"]
    end
    subgraph Private["Private Network"]
        API["API Backend Service"]
        Static["Static Asset Backend"]
        WS["WebSocket Backend"]
    end
    Client --> RP1
    Client --> RP2
    RP1 --> API
    RP1 --> Static
    RP1 --> WS
    RP2 --> API
    RP2 --> Static
    RP2 --> WS
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Reverse Proxy))
    Foundations
      Overview
      History NGINX HAProxy Envoy
      Why it exists
      Problem it solves
    Core Concepts
      Forward vs reverse proxy
      Request forwarding
      Backend topology hiding
    Routing
      Path based routing
      Host based routing
      Strangler fig migration
    Cross Cutting Concerns
      TLS termination
      Compression
      Response caching
      Header manipulation X-Forwarded
    Advanced
      Buffering tradeoffs
      Security boundary
      WebSocket proxying
      Reverse proxy vs API gateway
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default reverseProxy;
