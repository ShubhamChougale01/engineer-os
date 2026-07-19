import type { SkillContent } from "../types";

/**
 * gRPC — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const grpc: SkillContent = {
  overview: `
gRPC is a high-performance, open-source remote procedure call (RPC) framework, originally developed by Google, built on top of HTTP/2 and using Protocol Buffers (protobuf) as its default interface definition language and wire serialization format. Where REST (covered in its own skill) models interactions as operations on resources identified by URLs, gRPC models interactions as strongly-typed function calls — a client calls a method on a remote service almost exactly as it would call a local function, with the framework handling serialization, network transport, and deserialization transparently.

For an AI engineer, gRPC is most directly relevant for **internal, high-throughput service-to-service communication** — the connective tissue between microservices within a single organization's infrastructure, particularly in latency-sensitive or high-volume contexts (a model-serving layer being called by many upstream services, for instance, connects naturally to the **Model Serving** category covered elsewhere on this platform). gRPC is generally NOT the right choice for public-facing APIs consumed by a wide, unpredictable range of external clients — that's REST's specific strength — since gRPC requires generated client code from a shared .proto definition, a meaningfully higher integration barrier than REST's "any HTTP client works" model.

Key characteristics: **Protocol Buffers** as the default interface definition language, providing a compact binary wire format and strong, code-generated typing across many languages; **HTTP/2** as the transport, enabling multiplexed streams over a single connection and eliminating HTTP/1.1's head-of-line blocking; support for **four RPC types** (unary request-response, server streaming, client streaming, and full bidirectional streaming) beyond REST's simple request-response model; and **code generation** from a single .proto schema file, producing type-safe client and server stubs across many languages simultaneously.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2000s–2010s | **Google** develops and uses an internal RPC framework called "Stubby" extensively across its own massive-scale internal service infrastructure, addressing the same high-throughput, low-latency internal communication needs gRPC later formalizes publicly |
| 2015 | Google **open-sources gRPC** as a public evolution of Stubby, built on the then-new **HTTP/2** standard and **Protocol Buffers v3** |
| 2015 | gRPC is donated to the **Cloud Native Computing Foundation (CNCF)**, alongside Kubernetes, establishing it as a core piece of cloud-native infrastructure tooling |
| 2016–2018 | Rapid adoption across companies building microservice architectures needing high-throughput internal service communication, particularly within the Kubernetes/cloud-native ecosystem |
| 2018 | **gRPC-Web** is introduced, enabling browser clients to communicate with gRPC services (working around browsers' lack of full HTTP/2 trailer support) via a proxy layer |
| 2019 | gRPC becomes a CNCF **graduated project**, reflecting its maturity and widespread production adoption across the cloud-native ecosystem |
| 2020s | Continued dominance for internal service-to-service communication at companies operating microservice architectures at scale (Netflix, Square, Uber, and many others), alongside continued REST/GraphQL usage at the public-facing edge |

gRPC's direct lineage from Google's internal Stubby framework is a useful lens for understanding its design priorities: it was built to solve Google's OWN internal, massive-scale service-to-service communication needs FIRST, with public open-sourcing following — explaining why its design (strict typing, binary efficiency, HTTP/2 multiplexing) optimizes so heavily for internal performance and correctness over the public-API-friendly broad interoperability REST prioritizes.
`,

  "why-it-exists": `
gRPC exists because Google, operating one of the largest microservice architectures in the world internally, needed an RPC framework that could handle enormous internal request volumes with minimal latency and CPU overhead — needs that neither REST-over-JSON nor older RPC frameworks (like SOAP, or Google's own prior internal tooling) satisfied efficiently at that scale.

The prior alternatives had real limitations for Google's specific internal use case:

1. **REST over JSON**: JSON serialization/deserialization is comparatively CPU-expensive, and JSON's text-based, loosely-typed nature lacks the compile-time type safety and wire efficiency Google's internal services needed at massive request volumes; REST's resource-oriented model also doesn't map naturally onto genuinely bidirectional or streaming use cases.
2. **Older RPC frameworks (SOAP, CORBA, and similar)**: heavier, more complex, and not designed around HTTP/2's specific multiplexing capabilities, which didn't exist when most prior RPC frameworks were designed.
3. **Google's own internal Stubby framework**: powerful and battle-tested at Google's specific scale, but proprietary and internal-only, providing no path for the broader industry (or Google's own increasingly diverse internal teams and open-source-adjacent projects) to benefit from the same design.

gRPC's design directly addresses these gaps: Protocol Buffers' compact binary format and strict schema-driven typing dramatically reduce serialization cost and eliminate a whole class of type-mismatch bugs at compile time; HTTP/2's multiplexing lets many concurrent RPC calls share a single connection efficiently, eliminating HTTP/1.1's head-of-line blocking; and native streaming support directly addresses use cases (long-lived data feeds, bidirectional real-time communication) that a strict request-response model like REST's doesn't naturally accommodate.
`,

  "problem-it-solves": `
gRPC solves the **"how do we enable extremely high-throughput, low-latency, strongly-typed communication between internal services, including genuinely streaming and bidirectional use cases, without REST's JSON serialization overhead or HTTP/1.1's connection-multiplexing limitations"** problem.

Concretely, gRPC provides:

- **Compact, efficient binary serialization** via Protocol Buffers, meaningfully reducing both payload size and CPU cost relative to JSON serialization/deserialization, particularly significant at high request volumes.
- **Compile-time type safety across language boundaries**: a single .proto schema generates strongly-typed client and server code in many different languages simultaneously, catching type mismatches at compile time rather than discovering them at runtime the way a loosely-typed JSON payload might.
- **HTTP/2 multiplexing**: many concurrent RPC calls can share a single underlying TCP connection efficiently, eliminating the connection-per-request overhead and head-of-line blocking limitations of HTTP/1.1.
- **Native support for streaming RPC patterns**: beyond simple request-response, gRPC directly supports server streaming (one request, a stream of responses — useful for large result sets or real-time feeds), client streaming (a stream of requests, one response — useful for uploading large or incremental data), and full bidirectional streaming (both sides streaming independently — useful for real-time, two-way communication).
- **Built-in support for deadlines, cancellation, and retries** as first-class framework features, rather than needing to be implemented ad-hoc atop a simpler request-response model.

What gRPC does **not** solve, or solves with a real tradeoff: it is NOT well-suited for public-facing APIs consumed by a wide, unpredictable range of external clients, since consuming a gRPC service requires generated client code from a shared .proto file — a meaningfully higher integration barrier than REST's "any HTTP client, any language, no special tooling" model; browser clients specifically require gRPC-Web (a compatibility layer, covered in Advanced Concepts) since browsers historically haven't supported the full HTTP/2 feature set gRPC needs directly; and gRPC's binary wire format, while efficient, is not human-readable the way JSON is, meaningfully complicating ad-hoc debugging without specific tooling (grpcurl, covered in Debugging).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain gRPC's core model: Protocol Buffers as the interface definition language, HTTP/2 as the transport, and code generation producing typed client/server stubs.
2. Define a .proto schema with messages and services, and generate client/server code from it.
3. Implement and consume all four gRPC RPC types: unary, server streaming, client streaming, and bidirectional streaming.
4. Understand gRPC's use of HTTP/2 status codes and its own richer status code model for error handling.
5. Apply deadlines, cancellation, and retry policies correctly in a gRPC client.
6. Compare gRPC against REST and GraphQL, articulating specifically when gRPC's tradeoffs are worthwhile.
7. Understand gRPC-Web and its role in enabling browser clients to consume gRPC services.
8. Design and secure gRPC services appropriately, applying TLS and appropriate authentication interceptors.
9. Answer senior-level interview questions on gRPC's architecture, performance characteristics, and appropriate use cases.
`,

  prerequisites: `
- **Required**: the **REST** skill — understanding REST's request-response model and its public-API strengths provides essential contrast for understanding what gRPC trades away and gains.
- **Required**: basic **HTTP** fundamentals, particularly some familiarity with the differences between HTTP/1.1 and HTTP/2 (multiplexing, header compression).
- **Helpful**: familiarity with at least one statically-typed language (**Go**, **Java**, **Rust**, or **TypeScript**) since gRPC's strict typing and code generation model is most naturally experienced in a typed language context.
- **Very helpful**: basic microservices/distributed systems concepts, since gRPC's primary use case is internal service-to-service communication within a larger distributed system.

Dependency links: **REST** → this page → **GraphQL**/**WebSockets**/**Server-Sent Events** for the remaining API styles in this category.
`,

  "beginner-concepts": `
### Defining a service in Protocol Buffers

~~~protobuf
syntax = "proto3";

package example;

message GetUserRequest {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
}
~~~

The .proto file is gRPC's central schema: it declares message types (structured data, analogous to a REST API's request/response bodies, but strictly typed) and services (a set of RPC methods, analogous to a REST API's endpoints, but modeled as callable functions rather than resource URLs).

### Code generation

~~~bash
protoc --go_out=. --go-grpc_out=. user_service.proto
~~~

The protoc compiler generates client and server code directly from the .proto file — for Go, this produces a typed client stub (letting application code call GetUser almost like a local function) and a server interface to implement; the same .proto file can simultaneously generate equivalent code for Python, Java, C++, and many other languages.

### A basic unary RPC call (client side, conceptually)

~~~go
conn, _ := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
client := pb.NewUserServiceClient(conn)
user, err := client.GetUser(context.Background(), &pb.GetUserRequest{Id: 42})
~~~

This looks almost exactly like a local function call, despite actually performing a network round trip to a remote service — the generated client stub handles serialization, the network call, and deserialization transparently.

### A basic unary RPC implementation (server side, conceptually)

~~~go
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.db.FindUser(req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user not found")
    }
    return &pb.User{Id: user.ID, Name: user.Name, Email: user.Email}, nil
}
~~~

The server implements the generated interface directly; gRPC's own status codes (codes.NotFound, here) are the primary error-signaling mechanism, a meaningfully different model than REST's HTTP status codes, covered further in Intermediate Concepts.
`,

  "intermediate-concepts": `
### The four RPC types

~~~protobuf
service DataService {
  rpc GetItem(ItemRequest) returns (Item);                          // unary
  rpc ListItems(ListRequest) returns (stream Item);                  // server streaming
  rpc UploadItems(stream Item) returns (UploadSummary);              // client streaming
  rpc Chat(stream Message) returns (stream Message);                 // bidirectional streaming
}
~~~

- **Unary**: one request, one response — the default, directly analogous to a typical REST request-response call.
- **Server streaming**: one request, a STREAM of responses — useful for large result sets returned incrementally, or a subscription-like feed of updates.
- **Client streaming**: a STREAM of requests, one final response — useful for uploading data incrementally (e.g., a large file in chunks) before receiving a single confirmation.
- **Bidirectional streaming**: both client and server stream independently over the same connection — useful for genuinely real-time, two-way communication (a chat-like interaction, or a live collaborative feature), conceptually overlapping with what **WebSockets** (covered in its own skill) provides, but within gRPC's typed, HTTP/2-native model.

### gRPC status codes

~~~
OK                  -- success
CANCELLED           -- the operation was cancelled (typically by the client)
INVALID_ARGUMENT    -- client specified an invalid argument
DEADLINE_EXCEEDED   -- the operation timed out before completing
NOT_FOUND           -- a requested entity was not found
ALREADY_EXISTS      -- the entity a client tried to create already exists
PERMISSION_DENIED   -- the caller lacks permission
RESOURCE_EXHAUSTED  -- a resource has been exhausted (e.g., a rate limit)
UNAUTHENTICATED     -- the request lacks valid authentication credentials
INTERNAL            -- an internal error occurred
UNAVAILABLE         -- the service is currently unavailable (often transient, safe to retry)
~~~

gRPC defines its OWN status code enumeration (distinct from, though loosely analogous to, REST's HTTP status codes), transmitted as HTTP/2 trailers rather than as the HTTP status line itself — a genuinely different error-signaling mechanism worth understanding precisely rather than assuming direct equivalence with REST's HTTP status codes.

### Deadlines and cancellation

~~~go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()
user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 42})
~~~

Deadlines are a first-class gRPC concept, propagated automatically through a chain of RPC calls (a downstream service call inherits the remaining time budget from its caller's deadline) — a genuinely important distributed-systems discipline that REST APIs typically must implement ad-hoc via custom timeout handling, rather than getting built into the framework itself.

### Interceptors (middleware)

~~~go
func LoggingInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    log.Printf("method=%s duration=%s", info.FullMethod, time.Since(start))
    return resp, err
}
~~~

Interceptors are gRPC's equivalent of REST middleware — cross-cutting concerns (logging, authentication, metrics) implemented once and applied uniformly across every RPC method, rather than duplicated per-handler.

### Protobuf field numbers and backward compatibility

~~~protobuf
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;   // added later -- existing clients simply ignore this new field
}
~~~

Protobuf's field NUMBERS (not field names) are what's actually encoded on the wire — adding a new field with a new, unused number is a backward-compatible change (older clients simply ignore it), while reusing or reassigning an existing field number is a serious, silent-corruption-risk mistake, covered further in Anti-Patterns.
`,

  "advanced-concepts": `
### gRPC-Web for browser clients

~~~mermaid
flowchart LR
    Browser["Browser client\n(gRPC-Web JS client)"] --> Proxy["Envoy or grpc-web proxy\n(translates gRPC-Web <-> native gRPC)"]
    Proxy --> Server["gRPC server\n(native HTTP/2)"]
~~~

Because browsers historically haven't exposed the full HTTP/2 feature set (trailers specifically) that native gRPC needs, browser clients use **gRPC-Web** — a compatible client library and wire variant — communicating through a proxy (commonly Envoy) that translates between gRPC-Web's browser-compatible format and native gRPC to the backend service; this is the standard, necessary architecture for any gRPC service that needs to be consumed directly from a browser.

### Load balancing considerations

~~~
Problem: HTTP/2 multiplexes many RPCs over ONE long-lived connection,
so simple connection-level (L4) load balancing sends ALL of a client's
calls to the SAME backend instance, defeating load distribution.

Solutions:
├── Client-side load balancing (the gRPC client itself distributes
│    calls across known backend instances, often via a name resolver)
├── A proxy/service mesh (Envoy, Linkerd) performing request-level
│    (L7) load balancing, understanding individual gRPC calls
│    within a multiplexed connection
└── gRPC-aware load balancers in cloud provider offerings
~~~

This is a genuinely important, easy-to-overlook operational detail: because gRPC's efficiency comes partly from reusing one connection for many calls, naive connection-level load balancing can inadvertently concentrate load onto a small number of backend instances — a service mesh or gRPC-aware load balancing strategy is typically required for correct load distribution at scale.

### Protocol Buffers versioning and schema evolution

~~~protobuf
// Safe: adding a new field with a new number
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  reserved 4;              -- reserve a removed field's number, preventing accidental reuse
  reserved "phone";         -- reserve a removed field's name similarly
}
~~~

The reserved keyword explicitly prevents a REMOVED field's number or name from being accidentally reused in a future schema change — a genuinely important discipline for long-lived services with many independently-deployed clients, since reusing a field number for a semantically different field would cause old and new clients to silently misinterpret each other's data.

### Server reflection

~~~bash
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 describe example.UserService
~~~

The gRPC Server Reflection protocol lets a service expose its own schema at runtime (analogous to GraphQL's introspection or REST's OpenAPI documentation), enabling tools like grpcurl to interact with a gRPC service without needing the original .proto file locally — genuinely useful for debugging and ad-hoc exploration, covered further in Debugging.

### gRPC and service meshes

~~~mermaid
flowchart LR
    ServiceA["Service A"] --> SidecarA["Envoy sidecar"]
    SidecarA -.mTLS, retries, LB.-> SidecarB["Envoy sidecar"]
    SidecarB --> ServiceB["Service B"]
~~~

gRPC pairs naturally with service mesh architectures (Istio, Linkerd, built on Envoy) since both are HTTP/2-native — a service mesh sidecar can transparently add mutual TLS, retries, circuit breaking, and observability to gRPC traffic without requiring changes to the application code itself, a common, powerful production pattern at genuine microservices scale.
`,

  "internal-working": `
What happens from a gRPC client call to the server's response, at the protocol level:

~~~mermaid
sequenceDiagram
    participant Client
    participant Stub as Generated client stub
    participant HTTP2 as HTTP/2 connection (multiplexed)
    participant Server as gRPC server
    participant Handler as Service method handler

    Client->>Stub: client.GetUser(ctx, request)
    Stub->>Stub: serialize request to protobuf binary
    Stub->>HTTP2: send as an HTTP/2 stream (headers + binary body)
    HTTP2->>Server: (multiplexed alongside other concurrent calls\non the same connection)
    Server->>Server: deserialize protobuf binary to typed request object
    Server->>Handler: invoke the implemented method
    Handler-->>Server: typed response object (or an error with a status code)
    Server->>Server: serialize response to protobuf binary
    Server-->>HTTP2: send as HTTP/2 response (+ trailers with gRPC status)
    HTTP2-->>Stub: response bytes
    Stub->>Stub: deserialize to typed response object
    Stub-->>Client: typed response (or a typed error)
~~~

1. **Serialization is binary and schema-driven**: unlike JSON's flexible, self-describing text format, protobuf's binary format relies entirely on the shared .proto schema to interpret field numbers and types — meaningfully more compact and faster to serialize/deserialize, but requiring the schema to correctly decode the bytes (there's no way to "just read" a protobuf payload without its schema, unlike JSON).
2. **HTTP/2 multiplexing lets many calls share one connection**: multiple concurrent RPC calls (even to different methods) can be interleaved over a single underlying TCP connection as separate HTTP/2 streams, eliminating the connection-per-request overhead and head-of-line blocking that plague HTTP/1.1-based REST APIs under high concurrency.
3. **Status codes travel as HTTP/2 trailers**: gRPC's own status code (OK, NOT_FOUND, and so on) is sent as an HTTP/2 trailer AFTER the response body, not as the HTTP status line itself — this is why gRPC status codes and plain HTTP status codes are related but distinct concepts, and why tools designed only for standard HTTP status-code inspection may not surface gRPC-level errors correctly without gRPC-aware tooling.

**Why this matters**: understanding that gRPC's performance advantage comes from BOTH more efficient serialization (protobuf versus JSON) AND more efficient connection usage (HTTP/2 multiplexing versus HTTP/1.1's per-request overhead) — not from either alone — is the key insight for correctly attributing gRPC's real-world performance characteristics relative to REST.
`,

  architecture: `
A senior engineer thinks about gRPC adoption across several dimensions: whether the actual communication pattern (internal, high-throughput, typed) genuinely fits gRPC's strengths, how to handle browser/public client needs (gRPC-Web or a REST gateway), and load balancing correctness under HTTP/2 multiplexing.

### The "REST at the edge, gRPC internally" pattern

~~~mermaid
flowchart TB
    subgraph Public["Public-facing edge"]
        ExternalClient["External/browser clients"] --> RESTGateway["REST API\n(or gRPC-Web via a proxy)"]
    end
    subgraph Internal["Internal service mesh"]
        RESTGateway --> ServiceA["Service A (gRPC)"]
        ServiceA --> ServiceB["Service B (gRPC)"]
        ServiceB --> ServiceC["Service C (gRPC)"]
    end
~~~

A very common, mature architectural pattern: expose a REST (or GraphQL) API at the public edge, for broad client compatibility, while internal service-to-service communication uses gRPC for its performance and typing benefits — clients never need to know or care that gRPC is used internally at all, directly connecting to the layered-system architecture discussion in the **REST** skill.

### When gRPC is (and isn't) the right choice

~~~
gRPC fits well:
├── High-throughput internal service-to-service communication
├── Latency-sensitive calls where JSON serialization overhead
│    or HTTP/1.1 connection limits are a measured bottleneck
├── Streaming use cases (server streaming, client streaming,
│    or genuinely bidirectional communication)
└── Polyglot microservice architectures needing strict,
     shared, compile-time-enforced typing across languages

Consider an alternative instead:
├── Public-facing APIs needing broad client compatibility -> REST
├── Browser clients without a gRPC-Web proxy layer -> REST or GraphQL
├── Clients needing flexible, varied field/relationship selection -> GraphQL
└── Genuinely simple internal services where gRPC's added
     tooling/codegen complexity isn't justified by a measured need
~~~

This decision framework directly parallels the frameworks covered in the **REST** and **GraphQL** skills — a senior engineer reaches for gRPC deliberately, for internal high-throughput/streaming needs specifically, not as a default choice for every internal service.

### Service mesh integration for cross-cutting concerns

~~~mermaid
flowchart LR
    ServiceA["Service A"] --> SidecarA["Sidecar proxy\n(mTLS, retries, LB, observability)"]
    SidecarA --> SidecarB["Sidecar proxy"]
    SidecarB --> ServiceB["Service B"]
~~~

At genuine microservices scale, a service mesh (Istio, Linkerd) commonly handles cross-cutting concerns (mutual TLS, retries, circuit breaking, distributed tracing) transparently for gRPC traffic via sidecar proxies, keeping this complexity out of individual services' application code.
`,

  "data-flow": `
Tracing a server-streaming RPC end to end (e.g., streaming a large result set incrementally):

~~~mermaid
sequenceDiagram
    participant Client
    participant Stub as Client stub
    participant Server as gRPC server
    participant DB as Database

    Client->>Stub: client.ListItems(ctx, request)
    Stub->>Server: open HTTP/2 stream, send request
    Server->>DB: begin query (potentially a large result set)
    loop For each batch of results
        DB-->>Server: next batch of rows
        Server-->>Stub: stream Item message
        Stub-->>Client: yield item to the client's stream handler
    end
    Server-->>Stub: send trailers (gRPC status: OK)
    Stub-->>Client: stream closed
~~~

The critical detail distinguishing this from a unary call: the client can begin processing early results WHILE the server is still producing later ones (and while the underlying database query may still be executing) — genuinely useful for large result sets where waiting for the ENTIRE response to be assembled before returning anything (as a unary RPC or a typical REST response would require) would introduce unnecessary latency before the client sees its first usable result.
`,

  "production-usage": `
### Defining and implementing a production gRPC service

~~~protobuf
syntax = "proto3";
package inventory;

message GetItemRequest { string item_id = 1; }
message Item { string item_id = 1; string name = 2; int32 quantity = 3; }

service InventoryService {
  rpc GetItem(GetItemRequest) returns (Item);
  rpc WatchInventory(GetItemRequest) returns (stream Item);
}
~~~

~~~go
func (s *server) GetItem(ctx context.Context, req *pb.GetItemRequest) (*pb.Item, error) {
    item, err := s.repo.FindItem(ctx, req.ItemId)
    if errors.Is(err, ErrNotFound) {
        return nil, status.Errorf(codes.NotFound, "item %s not found", req.ItemId)
    }
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to fetch item")
    }
    return &pb.Item{ItemId: item.ID, Name: item.Name, Quantity: item.Quantity}, nil
}
~~~

### Non-negotiables for any production gRPC service

1. **Always use TLS** (or mutual TLS for service-to-service auth) — never deploy plaintext gRPC beyond local development.
2. **Set explicit deadlines on every client call**, never relying on an unbounded default timeout.
3. **Use gRPC-aware load balancing** (client-side load balancing or an L7-aware proxy/service mesh), never naive L4 connection-level load balancing.
4. **Reserve removed protobuf field numbers/names explicitly**, preventing accidental, silently-corrupting reuse.
5. **Implement structured logging/tracing interceptors** uniformly across every service, rather than duplicating this per-handler.

### Common production patterns

- **A service mesh (Istio, Linkerd)** handling mTLS, retries, and observability transparently for internal gRPC traffic.
- **gRPC-Web plus an Envoy proxy** for any gRPC service that needs direct browser consumption.
- **A REST or GraphQL gateway at the public edge**, translating external requests into internal gRPC calls — the common "REST at the edge, gRPC internally" pattern.
- **Buf or a similar schema registry/linting tool** for managing .proto files across many services and teams, catching breaking schema changes before deployment.
`,

  "industry-examples": `
- **Google's internal infrastructure**: gRPC's direct successor to Google's own internal Stubby framework, still extensively used for internal service-to-service communication at Google's own massive scale.
- **Netflix's internal microservices**: gRPC adopted extensively for internal service communication, particularly latency-sensitive paths within Netflix's content delivery and personalization infrastructure.
- **Square's internal payment infrastructure**: gRPC used extensively for internal service-to-service communication, where strict typing and low-latency communication are particularly valuable for financial correctness and performance.
- **Kubernetes itself**: uses gRPC internally for several of its own component-to-component communication needs (e.g., the Container Runtime Interface, CRI), reflecting gRPC's deep integration into the broader cloud-native ecosystem it was donated alongside.
- **Uber's internal service mesh**: extensive internal gRPC usage across its large microservices architecture, paired with service mesh tooling for cross-cutting operational concerns.
- **Many AI/ML model-serving infrastructures**: gRPC is a common choice for the internal interface between a model-serving layer and upstream application services, given its low-latency, strongly-typed characteristics — directly relevant to this platform's **Model Serving** category.
`,

  "best-practices": `
1. **Reserve internal, high-throughput service-to-service communication as gRPC's primary use case** — don't default to it for public-facing APIs without a specific, measured reason.
2. **Always use TLS/mTLS in production**, never deploying plaintext gRPC beyond local development.
3. **Set explicit deadlines on every client call**, and ensure deadline propagation is correctly configured across a chain of internal service calls.
4. **Use gRPC-aware load balancing** (client-side load balancing or an L7-aware proxy/service mesh) rather than naive connection-level load balancing.
5. **Reserve removed protobuf field numbers and names explicitly**, preventing silent, hard-to-diagnose data corruption from accidental reuse.
6. **Design .proto schemas for additive evolution**, adding new fields with new numbers rather than reusing or repurposing existing ones.
7. **Use interceptors for cross-cutting concerns** (logging, auth, metrics) uniformly, rather than duplicating this logic per-handler.
8. **Adopt a schema management tool** (Buf or similar) for linting and breaking-change detection across many .proto files and teams.
9. **Choose the right RPC type deliberately** — don't force a streaming use case into unary calls, or vice versa, based on the actual data flow's shape.
10. **Use gRPC-Web plus a proxy (Envoy) explicitly** for any service needing direct browser consumption, rather than attempting to consume native gRPC from a browser directly.
11. **Pair gRPC with a service mesh at genuine microservices scale**, offloading mTLS, retries, and observability to the mesh layer rather than reimplementing these per-service.
12. **Evaluate honestly whether gRPC's tradeoffs (codegen requirement, binary format, higher integration barrier) fit your actual use case** before adopting it over REST or GraphQL.
`,

  "anti-patterns": `
### Reusing a removed protobuf field number

~~~protobuf
// WRONG — reusing field number 4 for a semantically different field
// after the original field 4 (e.g., an old "phone" field) was removed
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  bool is_verified = 4;   -- if an OLDER client still expects field 4 to be a phone
                            -- string, this causes silent data corruption
}

// RIGHT — reserve the removed field's number and name explicitly
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  reserved 4;
  reserved "phone";
  bool is_verified = 5;   -- use a NEW field number instead
}
~~~

Because protobuf's wire format is keyed on field NUMBERS (not names), reusing a removed field's number for a new, differently-typed field is a genuinely dangerous, silent-corruption-risk mistake — always reserve removed field numbers and names explicitly.

### Naive connection-level load balancing

~~~
# WRONG — a standard L4 (connection-level) load balancer sends ALL of a
# client's multiplexed HTTP/2 calls to the SAME backend instance,
# defeating load distribution across a fleet of instances

# RIGHT — use client-side load balancing, or an L7-aware proxy/service
# mesh that understands individual gRPC calls within a multiplexed connection
~~~

Because gRPC's efficiency comes partly from reusing ONE connection for many calls, naive connection-level load balancing can inadvertently concentrate load onto a small number of backend instances — a common, easy-to-overlook production mistake at scale.

### Other production-grade anti-patterns

- **Deploying gRPC directly to browser clients without gRPC-Web and a proxy**, since browsers historically don't support the full HTTP/2 feature set native gRPC needs.
- **Not setting explicit deadlines**, relying on an unbounded default timeout that can leave a slow downstream call hanging indefinitely.
- **Treating gRPC status codes and plain HTTP status codes as interchangeable**, when they're related but genuinely distinct concepts (gRPC status travels as an HTTP/2 trailer, not the HTTP status line).
- **Adopting gRPC for a public-facing API by default**, without a specific measured need, incurring its higher client integration barrier (generated code requirement) without a corresponding benefit.
- **Not using a schema management/linting tool** for .proto files across multiple teams, risking uncoordinated breaking changes.
`,

  performance: `
### Rule zero: understand where gRPC's performance advantage over REST actually comes from

Both protobuf's binary serialization efficiency AND HTTP/2's connection multiplexing contribute — profiling and attributing performance gains to the correct source matters for making informed architectural tradeoffs.

### The performance hierarchy (apply in order)

1. **Use streaming RPC types where the actual data flow benefits from it** (large result sets via server streaming, incremental uploads via client streaming) rather than forcing everything into unary calls.
2. **Set appropriate deadlines** to avoid resource exhaustion from slow or hung downstream calls accumulating under load.
3. **Use gRPC-aware (client-side or L7 proxy-based) load balancing** to ensure even distribution across backend instances despite HTTP/2 connection reuse.
4. **Pair with a service mesh for connection pooling and retry/circuit-breaking logic** at genuine microservices scale, rather than reimplementing this per-service.
5. **Profile actual serialization/deserialization cost** for very large messages, since protobuf's efficiency advantage over JSON, while real, isn't unlimited for genuinely enormous payloads.

### Micro-level facts worth knowing

- HTTP/2's header compression (HPACK) further reduces per-call overhead for gRPC calls sharing a connection, compounding the multiplexing benefit.
- Protobuf's binary format is meaningfully more CPU-efficient to serialize/deserialize than JSON, particularly significant at high request volumes where this cost is incurred on every single call.
- Because many gRPC calls share one HTTP/2 connection, connection SETUP cost (TLS handshake, in particular) is amortized across far more calls than a typical HTTP/1.1-based REST client's connection-per-request (or even keep-alive) model.
`,

  scalability: `
gRPC's scalability story centers on efficient use of HTTP/2 multiplexing combined with correct, gRPC-aware load balancing — understanding both together is essential, since one without the other can produce surprising results.

### The multiplexing-plus-load-balancing interaction

~~~mermaid
flowchart LR
    Client["Client"] --> LB{"Load balancer type?"}
    LB -->|"L4 (connection-level)\n-- WRONG for gRPC at scale"| SingleInstance["All multiplexed calls\nland on ONE instance"]
    LB -->|"L7-aware / client-side\n-- CORRECT"| ManyInstances["Calls distributed\nacross many instances"]
~~~

Because HTTP/2 multiplexes many RPC calls over one long-lived connection, a NAIVE connection-level load balancer inadvertently concentrates load — correct gRPC scaling REQUIRES either client-side load balancing (the client itself distributes calls across known instances) or an L7-aware proxy/service mesh understanding individual calls within a multiplexed connection.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Naive connection-level load balancing concentrating load | Client-side load balancing, or an L7-aware proxy/service mesh |
| High serialization/deserialization cost at very high request volumes | Protobuf's binary format already provides a meaningful advantage over JSON here; profile further if still a bottleneck |
| Slow downstream calls accumulating and exhausting resources | Explicit deadlines correctly propagated across a call chain |
| Coordinating schema changes across many teams' services | A schema management/linting tool (Buf or similar) with breaking-change detection |
| Browser client scale needs | gRPC-Web plus an appropriately scaled Envoy proxy layer |
`,

  security: `
### TLS and mutual TLS

~~~go
creds, _ := credentials.NewClientTLSFromFile("ca.crt", "")
conn, _ := grpc.Dial("service.internal:443", grpc.WithTransportCredentials(creds))
~~~

Production gRPC deployments should always use TLS, and commonly use MUTUAL TLS (mTLS) for service-to-service authentication within an internal network — verifying both the client's and server's identity cryptographically, a common pattern especially when paired with a service mesh that manages certificate issuance and rotation transparently.

### Authentication interceptors

~~~go
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    token, err := extractTokenFromMetadata(ctx)
    if err != nil || !isValidToken(token) {
        return nil, status.Errorf(codes.Unauthenticated, "invalid or missing token")
    }
    return handler(ctx, req)
}
~~~

Interceptors (gRPC's middleware equivalent) are the standard place to implement authentication checks uniformly across every RPC method, rather than duplicating this logic in each individual handler.

### Essential gRPC security practices

1. **Always use TLS/mTLS in production**, never plaintext beyond local development.
2. **Validate all input within handlers**, treating client-supplied protobuf messages with the same scrutiny as any other untrusted input, despite their strict typing.
3. **Apply authentication/authorization uniformly via interceptors**, not per-handler ad-hoc checks.
4. **Rate-limit at the gRPC or service mesh layer**, particularly for services exposed beyond a fully trusted internal network boundary.
5. **Be cautious with gRPC reflection in production** — while useful for debugging, enabling it broadly can expose your service's full schema to any caller with network access, an information-disclosure consideration analogous to GraphQL's introspection risk.

See the **OWASP Top 10**, **TLS & HTTPS**, and **Web Security** skills for the general depth this applies against.
`,

  testing: `
### Testing a gRPC service (Go example)

~~~go
func TestGetItem_Success(t *testing.T) {
    server := &inventoryServer{repo: mockRepo{item: &Item{ID: "1", Name: "Widget"}}}
    resp, err := server.GetItem(context.Background(), &pb.GetItemRequest{ItemId: "1"})
    require.NoError(t, err)
    require.Equal(t, "Widget", resp.Name)
}

func TestGetItem_NotFound(t *testing.T) {
    server := &inventoryServer{repo: mockRepo{err: ErrNotFound}}
    _, err := server.GetItem(context.Background(), &pb.GetItemRequest{ItemId: "999"})
    st, _ := status.FromError(err)
    require.Equal(t, codes.NotFound, st.Code())
}
~~~

### Testing streaming RPCs

~~~go
func TestListItems_StreamsAllResults(t *testing.T) {
    stream := newMockServerStream()
    err := server.ListItems(&pb.ListRequest{}, stream)
    require.NoError(t, err)
    require.Len(t, stream.sentMessages, expectedCount)
}
~~~

### The senior testing doctrine

- Test gRPC status codes explicitly (using status.FromError to extract the actual gRPC code), not just that an error occurred generically.
- Use an in-process gRPC server/client pair (via bufconn or an equivalent in-memory transport) for fast, network-free integration tests, rather than binding to a real network port.
- Test deadline propagation explicitly, confirming a downstream call respects an inherited deadline from its caller.
- Test streaming RPCs' actual message count and ordering, not just that the stream completes without error.
- Test backward-compatible schema evolution explicitly (an older client's generated code against a newer server schema, and vice versa) for services with independently-deployed, potentially version-skewed clients.
`,

  debugging: `
### The toolbox, in escalation order

1. **Use grpcurl** (a command-line tool for interacting with gRPC services, analogous to curl for REST) to make ad-hoc calls and inspect responses directly, using server reflection if available.
2. **Inspect gRPC status codes explicitly** via status.FromError (or the equivalent in your language), not just generic error messages.
3. **Verify TLS/mTLS configuration explicitly** if calls fail with connection-level errors, since certificate misconfiguration is a common source of confusing, hard-to-diagnose connection failures.
4. **Check deadline propagation** if a call fails with DEADLINE_EXCEEDED unexpectedly — confirm the actual configured deadline and whether it's being inherited correctly across a call chain.
5. **Use distributed tracing** (commonly integrated via a service mesh or OpenTelemetry) to trace a single request across multiple gRPC service hops in a microservices architecture.

### Debugging common gRPC-specific symptoms

- "Calls intermittently fail with UNAVAILABLE" — often a transient network issue or a backend instance being unhealthy; gRPC's built-in retry policies (if configured) can mitigate this for idempotent calls.
- "Load seems concentrated on only a few backend instances" — very likely a naive connection-level load balancing configuration; verify client-side or L7-aware load balancing is actually in effect.
- "A newer client can't communicate with an older server, or vice versa" — check for a protobuf schema compatibility issue, particularly a reused or reassigned field number.
- "Calls hang indefinitely" — check for a missing or misconfigured deadline on the client call.
- "grpcurl can't list available methods" — server reflection is likely disabled; either enable it for debugging purposes or supply the .proto file directly to grpcurl.
`,

  monitoring: `
### Key signals to track

- **Request rate and latency percentiles (p50/p95/p99) per RPC method**, the same universal signals covered across every service on this platform, but tracked per-method given gRPC's function-call-oriented model.
- **gRPC status code distribution**, analogous to REST's HTTP status code distribution — a rising rate of INTERNAL or UNAVAILABLE codes is an important early signal.
- **Connection-level metrics**: active HTTP/2 streams per connection, connection count per backend instance (relevant for detecting load balancing imbalance).
- **Deadline exceeded rate**, indicating either genuinely slow downstream dependencies or an inappropriately tight deadline configuration.

### Tools

Service mesh dashboards (Istio's, Linkerd's) commonly provide built-in gRPC-aware observability out of the box; OpenTelemetry-based distributed tracing integrates naturally with gRPC's interceptor model for cross-service request tracing; Prometheus-based metrics collection via gRPC interceptors is a common, straightforward instrumentation pattern.

### Alerting priorities

Alert on elevated INTERNAL/UNAVAILABLE status code rates with high urgency (indicating genuine service health issues), on latency percentile regressions per RPC method (which can reveal an issue specific to one method rather than the service overall), and on load balancing imbalance across backend instances (a signal of a naive load balancing configuration needing correction).
`,

  deployment: `
### Containerized gRPC service deployment

~~~dockerfile
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN go build -o server .

FROM gcr.io/distroless/base
COPY --from=builder /app/server /server
EXPOSE 50051
ENTRYPOINT ["/server"]
~~~

gRPC services deploy similarly to any containerized service, though with genuine attention needed to load balancing configuration (as covered in Scalability) given HTTP/2's connection multiplexing behavior.

### Service mesh deployment pattern

~~~mermaid
flowchart LR
    Pod1["Service A pod"] --> Sidecar1["Envoy sidecar"]
    Sidecar1 -.mTLS.-> Sidecar2["Envoy sidecar"]
    Sidecar2 --> Pod2["Service B pod"]
~~~

At genuine microservices scale, deploying gRPC services within a service mesh (each pod paired with a sidecar proxy handling mTLS, retries, and load balancing transparently) is the common, mature production pattern, keeping this cross-cutting complexity out of application code.

### CI/CD pipeline considerations

Schema linting and breaking-change detection (via Buf or a similar tool) integrated into the CI pipeline is a gRPC-specific practice worth adopting, directly analogous to GraphQL's schema validation and REST's OpenAPI contract testing. See the **CI/CD** and **Kubernetes** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a gRPC service takes real production traffic:

- [ ] TLS (or mutual TLS for internal service-to-service auth) configured, no plaintext beyond local development
- [ ] Explicit deadlines set on every client call, with correct propagation across call chains verified
- [ ] gRPC-aware load balancing configured (client-side or an L7-aware proxy/service mesh), not naive L4 balancing
- [ ] Removed protobuf field numbers and names explicitly reserved
- [ ] Authentication/authorization implemented via interceptors, applied uniformly
- [ ] Schema linting and breaking-change detection integrated into CI (Buf or equivalent)
- [ ] Appropriate RPC type chosen deliberately for each method's actual data flow (unary/server-streaming/client-streaming/bidirectional)
- [ ] gRPC-Web plus a proxy configured, if browser clients need direct consumption
- [ ] Structured logging, metrics, and distributed tracing instrumented via interceptors
- [ ] Server reflection's production exposure deliberately considered (enabled only where appropriate, given its schema-disclosure implications)
- [ ] Retry policies configured appropriately for idempotent methods specifically
- [ ] Load testing performed with realistic concurrent multiplexed call patterns, not just simple sequential calls
`,

  "common-mistakes": `
1. **Reusing a removed protobuf field number**, causing silent data corruption between old and new clients/servers.
2. **Naive connection-level (L4) load balancing**, inadvertently concentrating load onto a small number of backend instances.
3. **Not setting explicit deadlines**, relying on unbounded default timeouts.
4. **Deploying gRPC directly to browser clients without gRPC-Web and a proxy.**
5. **Treating gRPC status codes as identical to plain HTTP status codes**, missing that gRPC status travels as an HTTP/2 trailer with its own distinct code enumeration.
6. **Adopting gRPC for public-facing APIs by default**, without a specific, measured need justifying its higher client integration barrier.
7. **Not reserving removed field numbers/names explicitly**, leaving a schema evolution trap for future changes.
8. **Forcing a genuinely streaming use case into unary RPC calls**, missing gRPC's specific streaming support that would fit the actual data flow better.
9. **Not using a schema management/linting tool** for .proto files shared across multiple teams, risking uncoordinated breaking changes.
10. **Leaving server reflection broadly enabled in production** without considering its schema-disclosure implications for sensitive services.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| DEADLINE_EXCEEDED | Missing or too-tight deadline, or a genuinely slow downstream dependency | Verify deadline configuration and propagation; investigate downstream latency if the deadline itself is reasonable |
| UNAVAILABLE | Backend instance unhealthy, network partition, or a transient issue | Verify backend health; configure retry policies for idempotent methods |
| UNAUTHENTICATED | Missing or invalid authentication credentials/token | Verify the client is correctly attaching required auth metadata |
| INVALID_ARGUMENT | Client sent a malformed or semantically invalid request | Validate request construction against the .proto schema and business rules |
| Connection refused / TLS handshake failure | Certificate misconfiguration, or the server isn't listening on the expected port | Verify TLS certificate configuration and server startup logs |
| Load concentrated on a few backend instances | Naive L4 connection-level load balancing | Configure client-side load balancing or an L7-aware proxy/service mesh |
| Old client can't communicate with new server (or vice versa) | Protobuf field number reuse or an incompatible breaking schema change | Verify schema compatibility; use reserved fields correctly for removed fields |
| grpcurl reports "server does not support reflection" | Server reflection isn't enabled | Enable reflection for debugging, or supply the .proto file directly to grpcurl |
`,

  faqs: `
**Is gRPC a replacement for REST?**
Not for public-facing APIs — gRPC's higher client integration barrier (requiring generated code from a shared .proto file) makes it a poor fit for broad, unpredictable external client compatibility; gRPC's genuine strength is internal, high-throughput service-to-service communication, commonly paired with REST (or GraphQL) at the public-facing edge in a "REST at the edge, gRPC internally" pattern.

**Can browsers consume gRPC services directly?**
Not natively — browsers historically lack full support for the HTTP/2 features (trailers specifically) native gRPC requires; **gRPC-Web** (a compatible client library) combined with a proxy (commonly Envoy) that translates between gRPC-Web and native gRPC is the standard solution for browser consumption.

**Why is naive load balancing a problem specifically for gRPC?**
Because HTTP/2 multiplexes many RPC calls over one long-lived connection, a standard connection-level (L4) load balancer sends ALL of a client's calls to the same backend instance once that connection is established, defeating load distribution — client-side load balancing or an L7-aware proxy/service mesh is required for correct distribution.

**What's the difference between gRPC status codes and HTTP status codes?**
gRPC defines its own status code enumeration (OK, NOT_FOUND, DEADLINE_EXCEEDED, and others), transmitted as HTTP/2 trailers after the response body — related conceptually to REST's HTTP status codes but a genuinely distinct mechanism, requiring gRPC-aware tooling to inspect correctly.

**When should I use streaming RPCs instead of unary calls?**
Use server streaming for large result sets that benefit from incremental delivery (the client can start processing before the full result is available), client streaming for incremental uploads, and bidirectional streaming for genuinely real-time, two-way communication — force a streaming pattern only when the actual data flow's shape genuinely benefits from it, not by default.

**How does gRPC handle schema evolution/versioning?**
Similar in spirit to GraphQL's additive evolution model: adding new fields with new field numbers is backward-compatible (older clients simply ignore unrecognized fields), while reusing or reassigning existing field numbers is a serious, silent-corruption-risk mistake — the reserved keyword explicitly guards against accidental reuse of removed fields.
`,

  "interview-questions": `
### Junior level

1. **What is Protocol Buffers, and what role does it play in gRPC?**
   Model answer: Protocol Buffers (protobuf) is gRPC's default interface definition language and binary wire serialization format — a .proto schema file defines message types and services, from which client/server code is generated in many languages.

2. **What HTTP version does gRPC use, and why does that matter?**
   Model answer: gRPC is built on HTTP/2, whose multiplexing capability lets many concurrent RPC calls share a single underlying connection, eliminating the connection-per-request overhead and head-of-line blocking that HTTP/1.1-based protocols (like typical REST APIs) can experience under high concurrency.

3. **What are the four RPC types gRPC supports?**
   Model answer: unary (one request, one response), server streaming (one request, a stream of responses), client streaming (a stream of requests, one response), and bidirectional streaming (both sides streaming independently).

4. **Why is gRPC generally not a good fit for a public-facing API consumed by external clients?**
   Model answer: consuming a gRPC service requires generated client code from a shared .proto file, a meaningfully higher integration barrier than REST's "any HTTP client, any language" model, and browsers require an additional gRPC-Web compatibility layer to consume gRPC directly at all.

5. **What happens if you reuse a removed protobuf field's number for a new field?**
   Model answer: since protobuf's wire format is keyed on field numbers rather than names, this causes silent data corruption/misinterpretation between clients or servers still expecting the OLD field's meaning at that number — the reserved keyword should be used to explicitly prevent this.

### Senior level

6. **Why can naive load balancing be a genuine problem specifically for gRPC services, and how do you fix it?**
   Model answer: because HTTP/2 multiplexes many RPC calls over one long-lived connection, a standard L4 (connection-level) load balancer routes all of a client's calls to the same backend instance once a connection is established, concentrating load unevenly; the fix is client-side load balancing (the client itself distributes calls across known instances) or an L7-aware proxy/service mesh that understands individual gRPC calls within a multiplexed connection.

7. **How does gRPC's status code model differ from REST's HTTP status codes, mechanically?**
   Model answer: gRPC status codes are its own enumeration (OK, NOT_FOUND, DEADLINE_EXCEEDED, and so on), transmitted as HTTP/2 trailers AFTER the response body, not as the HTTP status line itself — this is a genuinely distinct mechanism from REST's status-line-based signaling, requiring gRPC-aware tooling (rather than plain HTTP status inspection) to interpret correctly.

8. **When would you choose gRPC over REST for internal service-to-service communication, and when would REST still be preferable even internally?**
   Model answer: choose gRPC when the communication is genuinely high-throughput or latency-sensitive, benefits from strict cross-language typing, or has a genuinely streaming data flow; REST can still be preferable internally for simpler services where gRPC's codegen and tooling overhead isn't justified by a measured performance or typing need, or where the team's existing tooling/expertise favors REST.

9. **How would you enable a browser client to consume a gRPC backend service, architecturally?**
   Model answer: deploy gRPC-Web (a browser-compatible client library and wire variant) on the client side, paired with a proxy (commonly Envoy) that sits between the browser and the native gRPC backend, translating between gRPC-Web's browser-compatible format and native gRPC — browsers cannot consume native gRPC directly due to historical HTTP/2 feature support gaps.

10. **Explain how gRPC's deadline propagation works across a chain of internal service calls, and why this matters.**
    Model answer: a deadline set on an initial client call is propagated automatically to downstream gRPC calls made while handling that request, so a downstream service inherits the REMAINING time budget rather than getting its own independent, potentially longer timeout — this prevents a slow downstream call from silently exceeding what the original caller was actually willing to wait for, a distributed-systems correctness concern that REST APIs typically must implement manually rather than getting as a built-in framework feature.

11. **What are the tradeoffs of enabling gRPC server reflection in production?**
    Model answer: reflection lets tools like grpcurl discover a service's full schema at runtime without needing the .proto file locally, which is genuinely useful for debugging and ad-hoc exploration, but broadly enabling it in production exposes your entire service's schema (method names, message structures) to any caller with network access — an information-disclosure consideration directly analogous to GraphQL's introspection risk, warranting a deliberate, use-case-specific decision rather than a blanket default.

12. **How would you design a .proto schema to support safe, long-term evolution across many independently-deployed clients?**
    Model answer: favor additive changes (new fields with new, previously-unused field numbers) since older clients simply ignore fields they don't recognize; explicitly use the reserved keyword for any removed field's number and name to prevent future accidental reuse; and adopt a schema linting/breaking-change-detection tool (such as Buf) in CI to catch incompatible changes before they reach production, particularly important when many independently-deployed services/clients depend on shared schemas.
`,

  "coding-questions": `
### 1. Implement a unary RPC with proper gRPC status code error handling

~~~go
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    if req.Id <= 0 {
        return nil, status.Errorf(codes.InvalidArgument, "id must be positive, got %d", req.Id)
    }
    user, err := s.db.FindUser(ctx, req.Id)
    if errors.Is(err, ErrNotFound) {
        return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
    }
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to fetch user")
    }
    return &pb.User{Id: user.ID, Name: user.Name}, nil
}
# Follow-up: why is it important to distinguish InvalidArgument (a client
# error) from Internal (a server error) in gRPC's status code model,
# and how does a client typically use this distinction to decide
# whether an operation is safe to retry?
~~~

### 2. Implement a server-streaming RPC

~~~go
func (s *server) ListItems(req *pb.ListRequest, stream pb.InventoryService_ListItemsServer) error {
    items, err := s.repo.FindAll(stream.Context())
    if err != nil {
        return status.Errorf(codes.Internal, "failed to list items")
    }
    for _, item := range items {
        if err := stream.Send(&pb.Item{ItemId: item.ID, Name: item.Name}); err != nil {
            return err
        }
    }
    return nil
}
# Follow-up: how would you modify this to stream results directly from
# a database cursor (rather than loading all items into memory first),
# and why would that change matter for a genuinely large result set?
~~~

### 3. Implement a client-side deadline with propagation to a downstream call

~~~go
func (s *server) AggregateData(ctx context.Context, req *pb.AggregateRequest) (*pb.AggregateResponse, error) {
    -- ctx already carries the deadline from the ORIGINAL caller;
    -- passing it through preserves that budget for the downstream call
    downstreamResp, err := s.downstreamClient.FetchDetail(ctx, &pb.DetailRequest{Id: req.Id})
    if err != nil {
        return nil, err
    }
    return &pb.AggregateResponse{Detail: downstreamResp}, nil
}
# Follow-up: what would go wrong if this handler instead created a BRAND
# NEW context (context.Background()) for the downstream call rather than
# passing through the original ctx, and how would you test that deadline
# propagation is working correctly?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Define a .proto schema and implement a unary RPC service
Design a .proto schema for a simple domain (e.g., an inventory service), generate client/server code, and implement a working unary GetItem RPC with correct gRPC status code error handling. Deliverable: a working gRPC client and server. Skills exercised: protobuf schema design, unary RPC implementation.

### Lab 2 (Intermediate): Implement server streaming and client streaming RPCs
Extend the Lab 1 service with a server-streaming ListItems RPC and a client-streaming UploadItems RPC, testing both explicitly for correct message count and ordering. Deliverable: a service supporting all three non-bidirectional RPC types with tests. Skills exercised: streaming RPC implementation and testing.

### Lab 3 (Advanced): Add deadlines, interceptors, and TLS
Add explicit deadline configuration with correct propagation across a two-service call chain, implement a logging and authentication interceptor, and configure TLS for the connection. Deliverable: a production-hardened two-service gRPC deployment. Skills exercised: deadline propagation, interceptors, TLS configuration.

### Lab 4 (Production): Deploy behind gRPC-aware load balancing and expose via gRPC-Web
Deploy your service behind a load balancer configured correctly for gRPC (client-side or L7-aware), and configure gRPC-Web plus an Envoy proxy to allow a browser client to consume the service directly. Deliverable: a load-balanced deployment with a working browser client. Skills exercised: gRPC-aware load balancing, gRPC-Web/Envoy configuration.
`,

  "real-projects": `
### 1. An internal high-throughput model-serving interface
Engineering requirements: a gRPC service exposing a machine learning model's inference endpoint to many upstream internal services, using unary RPCs for single predictions and server streaming for batch/incremental results, with explicit deadlines to bound inference latency and gRPC-aware load balancing across many model-serving replicas — directly connecting to this platform's **Model Serving** category.

### 2. A polyglot microservices architecture with a shared schema registry
Engineering requirements: multiple internal services written in different languages (Go, Python, Java) communicating via gRPC, with a centrally managed set of .proto schemas linted and checked for breaking changes in CI via a tool like Buf, ensuring type-safe cross-language communication without runtime type mismatches.

### 3. A real-time bidirectional streaming feature (e.g., a live collaborative editing backend)
Engineering requirements: a bidirectional streaming gRPC service handling real-time, two-way communication between clients and a backend service, paired with a service mesh for connection-level observability and resilience, and gRPC-Web plus a proxy for direct browser client support.
`,

  "case-studies": `
### Google's Stubby-to-gRPC evolution
gRPC's direct lineage from Google's internal Stubby framework — battle-tested at Google's own massive internal scale for years before public open-sourcing — illustrates a common, mature pattern: open-sourcing an internal tool once it's proven itself extensively at real production scale, rather than designing a new framework speculatively for external use from the start. Lesson: a framework's internal-first origin story (solving a company's own concrete, measured problem before generalizing for public release) is often a strong signal of genuine production-readiness, worth weighing when evaluating adoption.

### The "REST at the edge, gRPC internally" pattern's broad industry adoption
The common architectural pattern of exposing REST (or GraphQL) at a system's public-facing edge while using gRPC for internal service-to-service communication — adopted across companies as varied as Netflix, Square, and many others — illustrates that different API styles' strengths are genuinely complementary rather than competing, when applied deliberately to the layer of a system they each fit best. Lesson: a mature architecture often doesn't choose ONE API style universally, but applies REST, GraphQL, and gRPC each where their specific strengths (broad interoperability, client-flexible querying, internal performance) genuinely matter most.

### gRPC's donation to and integration within the CNCF/Kubernetes ecosystem
gRPC's early donation to the Cloud Native Computing Foundation, and its subsequent deep integration into cloud-native tooling (Kubernetes' own internal use of gRPC, service mesh projects being built HTTP/2-native specifically to support gRPC well), illustrates how a technology's ecosystem placement and complementary tooling investment can meaningfully accelerate adoption beyond the technology's own merits alone. Lesson: evaluating a technology's surrounding ecosystem (tooling, complementary projects, governance) is often as important as evaluating its standalone technical design when assessing long-term adoption risk.
`,

  comparisons: `
| Aspect | gRPC | REST | GraphQL | WebSockets | Server-Sent Events |
|--------|------|------|---------|------------|---------------------|
| Data format | Protocol Buffers (binary) | Typically JSON | JSON (typed schema) | Any | Text (typically JSON payloads) |
| Transport | HTTP/2 | HTTP/1.1 or HTTP/2 | HTTP (typically POST) | A dedicated WebSocket connection | HTTP/1.1 or HTTP/2 (long-lived) |
| Client integration | Requires generated code from a shared .proto | Any HTTP client, no special tooling | Any HTTP client, typically with a GraphQL client library | Requires WebSocket client support | Native browser EventSource API support |
| Streaming support | Native (unary, server, client, bidirectional) | Not natively (request-response only) | Subscriptions (typically over WebSockets) | Native, full-duplex | Server-to-client only |
| Best fit | High-throughput internal service-to-service communication | Public APIs, standard CRUD, broad interoperability | Flexible client-driven queries, varied field/relationship needs | Real-time bidirectional communication | Server-to-client streaming (LLM token streaming, live feeds) |

**How seniors choose**: reach for gRPC specifically for internal, high-throughput, or genuinely streaming service-to-service communication, especially in polyglot microservice architectures needing strict, shared typing; reach for REST, GraphQL, WebSockets, or Server-Sent Events (each covered in its own skill) when their specific strengths better fit the actual problem — gRPC's higher client integration barrier makes it a poor default for public-facing APIs.
`,

  "related-technologies": `
- **REST** — the API style gRPC most directly contrasts with for public-facing versus internal communication; see its own skill for the full comparison.
- **GraphQL** — the client-flexible query alternative, addressing a genuinely different problem (varied client data needs) than gRPC's internal performance focus.
- **Protocol Buffers** — gRPC's default interface definition language and wire format, worth understanding in its own right for its schema evolution model.
- **HTTP/2** — the transport protocol gRPC is built on top of, whose multiplexing capability underlies much of gRPC's performance advantage.
- **Service meshes (Istio, Linkerd)** — commonly paired with gRPC at genuine microservices scale for transparent mTLS, retries, and observability.
- **Kubernetes** — the container orchestration platform gRPC was donated alongside to the CNCF, and which itself uses gRPC internally for several component interfaces.

Learning path: **REST** → **GraphQL** → this page → **WebSockets**/**Server-Sent Events** for the remaining real-time/streaming API styles in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued dominance of gRPC for internal, high-throughput microservice communication, particularly within Kubernetes/cloud-native and service-mesh-based architectures.
- Continued maturation of gRPC-Web and its surrounding proxy tooling, gradually lowering the barrier to direct browser consumption of gRPC-based backends.
- Growing adoption of gRPC as the internal interface for AI/ML model-serving infrastructures specifically, given its low-latency, strongly-typed characteristics — a genuinely active and growing use case connecting directly to this platform's Model Serving category.
- Continued investment in schema management tooling (Buf and similar) for coordinating .proto schema evolution safely across large, multi-team organizations.
- Given how actively the cloud-native and service mesh ecosystem continues to evolve, verify specific tooling and best-practice details (particular service mesh configurations, gRPC-Web proxy setups) against current official documentation rather than assuming long-term stability of any specific tool's configuration surface.
`,

  "future-roadmap": `
Where gRPC is heading, and what's worth betting career time on:

- **Continued deep integration with service mesh and cloud-native tooling**, likely remaining the default choice for internal microservice communication at organizations operating Kubernetes-based infrastructure.
- **Continued growth as the preferred internal interface for AI/ML model-serving infrastructure**, given its performance characteristics fitting latency-sensitive inference-serving needs well — a genuinely durable, growing use case worth specific attention for AI engineers.
- **Gradual, continued lowering of the browser-consumption barrier** via improving gRPC-Web tooling, though native browser gRPC support (without a proxy layer) remains an open question rather than a near-term certainty.
- **What to bet on**: deeply understanding gRPC's performance characteristics (why it's faster than REST, mechanically) and its distributed-systems-aware features (deadlines, streaming, interceptor-based cross-cutting concerns) — these transfer directly to evaluating ANY internal service communication architecture decision, a more durable and valuable skill than memorizing a specific language's generated-code API surface.
`,

  "cheat-sheet": `
~~~protobuf
// ---- .proto: the schema-driven contract ----
syntax = "proto3";
message GetUserRequest { int32 id = 1; }
message User { int32 id = 1; string name = 2; }
service UserService {
  rpc GetUser(GetUserRequest) returns (User);                    // unary
  rpc ListUsers(ListRequest) returns (stream User);                // server streaming
  rpc UploadUsers(stream User) returns (UploadSummary);            // client streaming
  rpc Chat(stream Message) returns (stream Message);               // bidirectional
}

// ---- NEVER reuse a removed field's number -- silent corruption risk ----
message User {
  int32 id = 1;
  reserved 2;          // was "phone" -- explicitly reserved, never reused
  reserved "phone";
}
~~~

~~~go
// ---- Client call: looks local, is actually a network round trip ----
conn, _ := grpc.Dial("host:port", grpc.WithTransportCredentials(creds))
client := pb.NewUserServiceClient(conn)
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)   // ALWAYS set deadlines
defer cancel()
user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 42})

// ---- Server: use gRPC's own status codes, not HTTP ones ----
return nil, status.Errorf(codes.NotFound, "user not found")
// OK CANCELLED INVALID_ARGUMENT DEADLINE_EXCEEDED NOT_FOUND
// ALREADY_EXISTS PERMISSION_DENIED RESOURCE_EXHAUSTED UNAUTHENTICATED
// INTERNAL UNAVAILABLE  -- status travels as an HTTP/2 TRAILER, not the status line
~~~

~~~
# ---- Load balancing: L4 (connection-level) is WRONG for gRPC at scale ----
# HTTP/2 multiplexes many calls over ONE connection ->
# a naive L4 LB sends them ALL to one instance.
# FIX: client-side load balancing, or an L7-aware proxy / service mesh.

# ---- Browsers can't speak native gRPC directly ----
# Use gRPC-Web + an Envoy proxy translating gRPC-Web <-> native gRPC.

# ---- Debugging ----
grpcurl -plaintext localhost:50051 list                 # needs server reflection enabled
grpcurl -plaintext localhost:50051 describe example.UserService

# ---- When to use gRPC vs REST ----
# Internal, high-throughput, typed, streaming needs -> gRPC
# Public-facing, broad client compatibility -> REST
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What language/format does gRPC use by default? | Protocol Buffers (protobuf) -- a compact binary schema-driven format. |
| What transport is gRPC built on, and why does it matter? | HTTP/2 -- multiplexes many calls over one connection, eliminating HTTP/1.1 head-of-line blocking. |
| What are the four RPC types? | Unary, server streaming, client streaming, bidirectional streaming. |
| What happens if you reuse a removed protobuf field number? | Silent data corruption -- old/new clients misinterpret each other's data. ALWAYS use "reserved". |
| Why is naive L4 load balancing wrong for gRPC? | HTTP/2 multiplexing means all of one connection's calls land on ONE backend instance. |
| How do gRPC status codes differ from HTTP status codes? | They're gRPC's own enumeration, sent as an HTTP/2 TRAILER, not the HTTP status line. |
| Why can't browsers consume gRPC natively? | They lack full HTTP/2 trailer support -- gRPC-Web + an Envoy proxy is required. |
| What is deadline propagation? | A downstream call automatically inherits the REMAINING time budget from its caller's deadline. |
| When should you choose gRPC over REST? | Internal, high-throughput, latency-sensitive, or genuinely streaming service-to-service communication. |
| Why is gRPC a poor fit for public APIs? | Consuming it requires generated client code from a shared .proto file -- a high integration barrier. |
| What tool debugs gRPC like curl debugs REST? | grpcurl (works best with server reflection enabled). |
| What's gRPC's direct historical predecessor? | Google's internal "Stubby" RPC framework. |
`,

  mcqs: `
1. What is gRPC's default interface definition language and wire format?
   A) JSON  B) XML  C) Protocol Buffers  D) YAML
   **Answer: C** — a compact binary format providing strong, code-generated typing across languages.

2. Why does gRPC's use of HTTP/2 provide a performance advantage over typical HTTP/1.1-based REST APIs?
   A) HTTP/2 is always encrypted  B) HTTP/2 multiplexes many concurrent calls over a single connection, eliminating per-request connection overhead and head-of-line blocking  C) HTTP/2 uses less memory  D) HTTP/2 doesn't require TLS
   **Answer: B** — this is gRPC's core transport-level efficiency advantage.

3. Why is naive connection-level (L4) load balancing problematic specifically for gRPC?
   A) gRPC doesn't support load balancing  B) HTTP/2 multiplexing means all of a client's calls on one connection land on the same backend instance, concentrating load  C) gRPC requires a database connection pool  D) L4 load balancers don't support TLS
   **Answer: B** — client-side load balancing or an L7-aware proxy/service mesh is required for correct distribution.

4. What happens if a protobuf field number that was previously removed gets reused for a new, differently-typed field?
   A) The compiler automatically prevents this  B) Silent data corruption/misinterpretation between old and new clients or servers  C) Nothing, it's always safe  D) A runtime exception is always thrown
   **Answer: B** — this is why the reserved keyword should always be used for removed fields.

5. How do gRPC status codes get transmitted on the wire?
   A) As the HTTP status line, exactly like REST  B) As an HTTP/2 trailer, after the response body  C) In a separate status endpoint  D) They aren't transmitted at all
   **Answer: B** — a genuinely distinct mechanism from REST's HTTP-status-line-based error signaling.

6. Why is gRPC generally a poor fit for public-facing APIs consumed by a wide range of external clients?
   A) It's always slower than REST  B) Consuming it requires generated client code from a shared .proto schema, a higher integration barrier than REST's "any HTTP client" model  C) It doesn't support JSON at all  D) It can't run over the internet
   **Answer: B** — REST's broad, tooling-free client compatibility remains the better fit for public APIs.
`,

  "revision-notes": `
gRPC is a high-performance, open-source RPC framework originally developed by Google (as a public evolution of its internal Stubby framework), built on HTTP/2 and using Protocol Buffers (protobuf) as its default interface definition language and binary wire format. Where REST models interactions as operations on resources identified by URLs, gRPC models interactions as strongly-typed function calls — a .proto schema file declares message types and services, from which client/server code is GENERATED across many languages simultaneously, providing compile-time type safety across language boundaries in a way REST's typically loosely-typed JSON payloads don't.

gRPC's performance advantage over REST comes from two combined factors: protobuf's compact binary serialization (meaningfully more CPU- and bandwidth-efficient than JSON) and HTTP/2's multiplexing (letting many concurrent RPC calls share a single connection, eliminating HTTP/1.1's connection-per-request overhead and head-of-line blocking). gRPC natively supports four RPC types — unary (simple request-response), server streaming, client streaming, and full bidirectional streaming — directly accommodating use cases (large incremental result sets, real-time two-way communication) that REST's strict request-response model doesn't naturally fit.

A genuinely important, easy-to-overlook operational detail: because HTTP/2 multiplexes many calls over ONE connection, naive CONNECTION-LEVEL (L4) load balancing sends all of a client's calls to the same backend instance once a connection is established, concentrating load unevenly — correct gRPC scaling requires client-side load balancing or an L7-aware proxy/service mesh that understands individual calls within a multiplexed connection. gRPC also has its own STATUS CODE model (OK, NOT_FOUND, DEADLINE_EXCEEDED, and others), transmitted as HTTP/2 trailers after the response body rather than via the HTTP status line — a genuinely distinct mechanism from REST's status-code signaling, requiring gRPC-aware tooling (like grpcurl) to inspect correctly.

Protobuf's wire format is keyed on FIELD NUMBERS rather than field names — adding a new field with a new, previously-unused number is a safe, backward-compatible schema change, while reusing a removed field's number for a new, differently-typed field causes silent data corruption between old and new clients/servers; the reserved keyword explicitly guards against this by preventing accidental reuse of removed fields' numbers and names. Deadlines are a first-class gRPC concept that PROPAGATE automatically across a chain of internal service calls, a distributed-systems correctness discipline REST APIs typically must implement manually rather than getting as a built-in framework feature.

Because consuming a gRPC service requires generated client code from a shared .proto schema — a meaningfully higher integration barrier than REST's "any HTTP client, any language, no special tooling" model — gRPC is generally NOT the right choice for public-facing APIs serving a wide, unpredictable range of external clients; its genuine strength is internal, high-throughput, latency-sensitive service-to-service communication, commonly paired with REST (or GraphQL) at a system's public-facing edge in the mature, common "REST at the edge, gRPC internally" architectural pattern. Browser clients require gRPC-Web (a compatible client library) combined with a translating proxy (commonly Envoy), since browsers historically lack the full HTTP/2 feature set native gRPC needs. gRPC pairs naturally with service mesh architectures (Istio, Linkerd) at genuine microservices scale, letting a sidecar proxy transparently handle mutual TLS, retries, and observability without requiring changes to application code.
`,

  "learning-roadmap": `
**Week 1 — Protocol Buffers and unary RPCs**: .proto schema design, code generation, and implementing a basic unary RPC service with correct gRPC status code error handling. Milestone: build a working gRPC client/server pair for a simple domain.

**Week 2 — Streaming RPC types**: implementing and testing server streaming, client streaming, and bidirectional streaming RPCs. Milestone: extend the Week 1 service with at least one streaming RPC type, with tests verifying correct message count/ordering.

**Week 3 — Deadlines, interceptors, and TLS**: deadline configuration and propagation, implementing logging/authentication interceptors, and configuring TLS/mTLS. Milestone: add all three to the service, with a test proving deadline propagation across a two-service call chain.

**Week 4 — Load balancing and service mesh integration**: understanding the HTTP/2-multiplexing-plus-load-balancing interaction, and deploying behind gRPC-aware load balancing or a basic service mesh. Milestone: deploy multiple backend replicas and verify even load distribution.

**Week 5 — gRPC-Web and browser consumption**: configuring gRPC-Web and an Envoy proxy for direct browser client consumption. Milestone: build a working browser client consuming the gRPC service via gRPC-Web.

**Week 6 — Schema evolution and architectural decision-making**: practicing safe additive schema evolution (including reserved fields), and comparing gRPC against REST/GraphQL for a range of hypothetical scenarios. Milestone: document a decision framework applied to at least three different hypothetical scenarios, and demonstrate a backward-compatible schema change.

Next platform skill once this roadmap is complete: **WebSockets** for the real-time bidirectional communication alternative, or **Server-Sent Events** for the server-to-client streaming alternative this category also covers.
`,

  "official-docs": `
- **grpc.io** — the official gRPC project documentation, covering the framework across all its supported languages.
- **protobuf.dev** — the official Protocol Buffers documentation, covering schema syntax, code generation, and schema evolution best practices.
- **The gRPC GitHub organization (github.com/grpc)** — the official source repositories for the core framework and language-specific implementations.
- **buf.build's documentation** — the leading schema management/linting tool for Protocol Buffers, widely adopted for CI-integrated breaking-change detection.
`,

  books: `
- **"gRPC: Up and Running" — Kasun Indrasiri and Danesh Kuruppu** — a comprehensive, practical treatment of gRPC covering all four RPC types, security, and production deployment patterns.
- **"Building Microservices" — Sam Newman** — covers gRPC within the broader microservices communication context, useful for the architectural decision-making this page emphasizes.
- **"Cloud Native Patterns" — Cornelia Davis** — covers service mesh integration patterns directly relevant to production gRPC deployments at scale.
`,

  blogs: `
- **The official gRPC blog (grpc.io/blog)** — release announcements and best-practice guidance directly from the gRPC project maintainers.
- **Google Cloud's engineering blog posts on gRPC** — practical guidance from the framework's originating organization.
- **Buf's engineering blog** — extensive coverage of Protocol Buffers schema management, linting, and breaking-change detection best practices.
- **Various company engineering blogs** (Netflix, Square, Uber) documenting their own internal gRPC adoption experiences and lessons learned at scale.
`,

  "research-papers": `
gRPC itself, as an industry engineering framework rather than an academic research project, has limited dedicated peer-reviewed literature; the most relevant related reading:

- **The HTTP/2 specification (RFC 9113)** — the foundational IETF specification for the transport protocol gRPC is built on top of, essential for understanding gRPC's multiplexing-derived performance characteristics precisely.
- **The Protocol Buffers language guide and encoding specification** — the closest equivalent to a formal technical specification for gRPC's default wire format.
- General distributed systems literature on RPC frameworks (going back to foundational RPC concepts) provides useful historical and conceptual grounding for gRPC's design choices.
`,

  videos: `
- **Official gRPC conference talks** (from KubeCon, CNCF-affiliated conferences) covering production deployment patterns, service mesh integration, and performance characteristics.
- **Google Cloud's official gRPC tutorials and talks**, given the framework's Google origin.
- **"gRPC vs REST vs GraphQL" comparative talks** (various creators) providing a quick comparative overview across this category's related skills.
- **Buf's own talks and tutorials** on Protocol Buffers schema management best practices.
`,

  "github-repos": `
- **grpc/grpc** — the official core gRPC framework repository (C-based core, with language-specific bindings).
- **protocolbuffers/protobuf** — the official Protocol Buffers repository, including the protoc compiler.
- **bufbuild/buf** — the leading schema management, linting, and breaking-change detection tool for Protocol Buffers.
- **grpc-ecosystem/grpc-gateway** — a widely used tool for generating a REST/JSON gateway automatically from a gRPC service's .proto definition, directly supporting the "REST at the edge, gRPC internally" pattern.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Schema design basics**: design a .proto schema for a given domain (e.g., a ride-sharing service with drivers, riders, and trips), including appropriate use of the four RPC types where each genuinely fits.
2. **Status code discipline**: implement a service with comprehensive, correct gRPC status code usage (distinguishing InvalidArgument, NotFound, PermissionDenied, and Internal appropriately) and write tests verifying each.
3. **Streaming implementation**: implement a server-streaming RPC delivering results incrementally from a database cursor, and a client-streaming RPC accepting incremental uploads with a single final summary response.
4. **Deadline propagation testing**: write a test proving a downstream gRPC call correctly inherits and respects a deadline propagated from an upstream caller.
5. **Schema evolution practice**: given an existing .proto schema, practice both a safe additive change and (in a separate branch, for learning purposes) an unsafe field-number-reuse change, observing the resulting behavior difference between old and new clients.
6. **External practice sets**: the official gRPC documentation's own language-specific tutorials for structured, guided practice; Buf's own getting-started guide for schema management practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Public["Public-facing edge"]
        ExternalClients["External/browser clients"]
        RESTGateway["REST/GraphQL gateway\n(or grpc-gateway)"]
    end
    subgraph BrowserPath["Browser-specific path"]
        BrowserClient["Browser client (gRPC-Web)"]
        EnvoyProxy["Envoy proxy\n(gRPC-Web <-> native gRPC)"]
    end
    subgraph Mesh["Service mesh (internal)"]
        ServiceA["Service A (gRPC)"]
        SidecarA["Sidecar (mTLS, LB, retries)"]
        ServiceB["Service B (gRPC)"]
        SidecarB["Sidecar"]
        ServiceC["Service C (gRPC)"]
        SidecarC["Sidecar"]
    end
    ExternalClients --> RESTGateway
    BrowserClient --> EnvoyProxy
    RESTGateway --> SidecarA
    EnvoyProxy --> SidecarA
    SidecarA --> ServiceA
    ServiceA --> SidecarB --> ServiceB
    ServiceB --> SidecarC --> ServiceC
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((gRPC))
    Foundations
      Overview
      History Google Stubby
      Why it exists
      Problem it solves
    Core Model
      Protocol Buffers schema
      Code generation
      HTTP2 transport
      Four RPC types
    Error Handling
      gRPC status codes
      HTTP2 trailers
    Reliability
      Deadlines and propagation
      Retries
      Interceptors
    Scale
      HTTP2 multiplexing
      Load balancing L4 vs L7
      Service mesh integration
    Schema Evolution
      Field numbers
      Reserved keyword
      Buf linting
    Browser Access
      gRPC-Web
      Envoy proxy
    Comparisons
      Versus REST GraphQL WebSockets SSE
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default grpc;
