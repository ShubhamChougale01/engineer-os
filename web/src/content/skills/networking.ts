import type { SkillContent } from "../types";

/**
 * Networking — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const networking: SkillContent = {
  overview: `
Networking, in the context of software engineering, is the layered set of protocols and conventions that let independent computers exchange data reliably across physical and logical distances — the invisible substrate underlying literally every technology on this platform that involves more than one machine: every REST API call, every database connection, every DNS lookup, every TLS handshake, and every LLM API request. The dominant conceptual model is the **TCP/IP stack** (a practical, four-to-five-layer simplification of the more academic seven-layer OSI model), moving data from an application's bytes down through transport, network, and link layers, across physical media, and back up an equivalent stack on the receiving machine.

For an AI engineer, networking knowledge is the difference between debugging "the API call failed" as a mysterious black box and being able to systematically isolate whether a failure is DNS resolution, TCP connection establishment, TLS handshake, HTTP-level routing, or application logic — a skill that directly underlies effective use of every API-style covered in this platform's own **API Development** category (REST, GraphQL, gRPC, WebSockets, SSE), every cloud deployment in **Cloud & DevOps**, and every distributed system design decision in **System Design**.

Key characteristics: a **layered architecture** (physical, link, network, transport, application) where each layer provides services to the layer above while hiding the complexity of layers below; **IP addressing and routing**, letting packets find their way across interconnected networks to a specific destination host; **TCP and UDP** as the two dominant transport protocols, offering fundamentally different reliability/ordering guarantees for different use cases; **DNS** translating human-readable names into IP addresses; and **TLS/HTTPS** providing encryption and authentication atop the otherwise-plaintext lower layers.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1969 | **ARPANET**, the direct precursor to the modern internet, sends its first message between UCLA and Stanford Research Institute, funded by the U.S. Department of Defense's ARPA |
| 1974 | **Vint Cerf** and **Bob Kahn** publish the paper defining **TCP** (Transmission Control Protocol), establishing the core reliability and flow-control concepts still used today |
| 1983 | ARPANET formally switches to **TCP/IP**, the "flag day" often cited as the practical birth of the modern internet's core protocol suite |
| 1984 | **DNS** (Domain Name System) is introduced, replacing a single centrally-maintained hosts file with a distributed, hierarchical name resolution system as the network grew beyond what manual coordination could support |
| 1989–1991 | **Tim Berners-Lee** invents the **World Wide Web** and **HTTP**, building an application-layer protocol atop the existing TCP/IP foundation, triggering the internet's explosive public growth through the 1990s |
| 1994–1999 | **SSL** (Secure Sockets Layer) is developed by Netscape, later standardized and evolved into **TLS** (Transport Layer Security), adding encryption and authentication atop TCP |
| 2015–2018 | **HTTP/2** (2015) and later **HTTP/3** (built on QUIC, standardized 2021 but developed and adopted starting around 2018) bring multiplexing and further performance improvements to the application layer, addressing limitations in HTTP/1.1's connection model |
| 2010s–2020s | **IPv6** adoption accelerates (though gradually) as IPv4's roughly 4.3 billion address space becomes genuinely exhausted, while cloud computing and containerization (covered in this platform's **Cloud & DevOps** category) add entirely new layers of virtual networking atop the same foundational TCP/IP concepts |

Networking's history is notable for how remarkably STABLE its core layers (IP addressing, TCP's reliability model) have remained across more than four decades, even as the application layer above it (HTTP versions, WebSockets, gRPC) has evolved rapidly — a useful lesson in how a well-designed layered architecture lets innovation happen at one layer without requiring wholesale replacement of the layers beneath it.
`,

  "why-it-exists": `
Computer networking exists because early computing needed a way for independent, geographically distributed machines to exchange data reliably despite unreliable physical links, without requiring every pair of machines to have a pre-arranged, dedicated physical connection — the specific problem ARPANET was funded to solve was building a network resilient enough to survive partial failures (originally for military resilience reasoning, though the internet's actual growth was driven far more by academic and later commercial use).

The key architectural insight that makes modern networking work is **packet switching**: rather than establishing a dedicated physical circuit for each conversation (as traditional telephone networks did), data is broken into small packets, each independently routed across whatever path is currently available, and reassembled at the destination — this lets a single physical network be shared efficiently across many simultaneous conversations, and lets the network route around failed links automatically, since each packet can take a different path.

TCP specifically exists because raw IP packet delivery provides NO reliability guarantee at all — packets can be lost, duplicated, or arrive out of order, since each packet is routed independently with no memory of prior packets. Cerf and Kahn's TCP design layers reliability, ordering, and flow control ON TOP of this fundamentally unreliable packet-delivery substrate, providing applications with what feels like a reliable, ordered stream of bytes despite the genuinely unreliable network underneath — precisely the same "build a reliable abstraction on top of an unreliable primitive" pattern that appears throughout distributed systems design more broadly (covered in this platform's **Distributed Systems** skill).
`,

  "problem-it-solves": `
Networking solves the **"how do independent computers, potentially thousands of miles apart and connected through many intermediary devices they've never directly communicated with, exchange data reliably, efficiently, and securely"** problem.

Concretely, the networking stack provides:

- **Addressing and routing** (IP): every device gets a unique address, and routers along the path use that address to forward packets progressively closer to their destination, without any single device needing to know the network's ENTIRE topology.
- **Reliable, ordered delivery atop an unreliable substrate** (TCP): applications get a clean, ordered byte stream abstraction, with lost packets automatically retransmitted and out-of-order packets automatically reordered, hiding the genuine unreliability of the underlying packet-switched network.
- **Fast, low-overhead delivery when reliability isn't required** (UDP): for use cases (real-time audio/video, DNS queries) where a lost or late packet is better simply discarded than retransmitted, UDP provides a lighter-weight alternative without TCP's ordering/retransmission overhead.
- **Human-readable naming** (DNS): letting users and applications refer to services by memorable names (api.example.com) rather than needing to know and track numeric IP addresses directly, with DNS handling the translation and letting the underlying IP address change without breaking existing references.
- **Confidentiality and authentication** (TLS): encrypting data in transit and cryptographically verifying a server's identity, protecting against eavesdropping and impersonation on a network that, by design, routes packets through many intermediary, untrusted devices.

What networking does **not** solve, or solves with a real tradeoff: it does not guarantee low latency (physical distance and the number of network hops fundamentally bound how fast a packet can travel, a hard physics constraint no protocol design can eliminate); it does not eliminate the CAP theorem's fundamental tradeoffs for distributed systems built on top of it (network partitions are a genuine, unavoidable possibility, covered in the **CAP Theorem** skill); and while TCP provides reliability, it does so with genuine overhead (connection setup, acknowledgment traffic) that some use cases deliberately trade away via UDP.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the layered networking model (physical, link, network, transport, application) and what each layer is responsible for.
2. Explain IP addressing, subnetting basics, and how routers forward packets toward a destination.
3. Explain TCP's three-way handshake, reliability mechanisms, and flow/congestion control at a working level.
4. Explain the difference between TCP and UDP and correctly choose between them for a given use case.
5. Trace a DNS resolution from a hostname to an IP address, including caching and the resolver hierarchy.
6. Explain the TLS handshake and what it provides (confidentiality, integrity, authentication).
7. Use standard networking diagnostic tools (ping, traceroute, dig, curl, netstat/ss) to isolate where a connectivity failure is occurring.
8. Understand NAT, firewalls, and load balancers as practical, everyday networking components in production infrastructure.
9. Answer senior-level interview questions on the networking stack and its relationship to application-level protocol design.
`,

  prerequisites: `
- **Required**: no formal prerequisite, though comfort with a command-line interface (covered in the **Linux** skill, alongside this one in this category) makes the diagnostic tools covered here much more approachable.
- **Very helpful**: the **REST** skill for concrete application-layer (HTTP) context that sits atop the transport/network layers covered here.
- **Very helpful**: the **Linux** skill (covered alongside this one), since networking diagnostic tools and configuration are most commonly exercised on Linux servers.
- **Helpful**: the **TLS & HTTPS** skill for a deeper dive specifically into the encryption layer briefly introduced here.

Dependency links: **Linux** → this page → **TLS & HTTPS** for encryption depth → **Distributed Systems**/**CAP Theorem** for how network unreliability shapes distributed system design → **Load Balancers**/**Reverse Proxy**/**CDN** in the **System Design** category for the infrastructure built atop these fundamentals.
`,

  "beginner-concepts": `
### The layered model

~~~
Application  -- HTTP, DNS, SMTP -- what your program actually cares about
Transport    -- TCP, UDP -- reliability, ordering, port numbers
Network      -- IP -- addressing and routing across networks
Link         -- Ethernet, WiFi -- delivery across a single physical network segment
Physical     -- actual bits over wire, fiber, or radio
~~~

Each layer only needs to understand the layer immediately below and above it — your application code calling an HTTP library never needs to think about Ethernet frames, and a router forwarding IP packets never needs to understand HTTP — this separation of concerns is precisely why the internet has been able to evolve each layer somewhat independently over decades.

### IP addresses and ports

~~~
IP address: 192.168.1.42        -- identifies a specific device (or virtual interface) on a network
Port: 443                        -- identifies a specific application/service on that device

Combined, a "socket" is identified by: IP address + port + protocol (TCP/UDP)
~~~

An IP address gets a packet to the right MACHINE; a port number gets it to the right APPLICATION on that machine — this is why a single server can run many different services (a web server on port 443, a database on port 5432) simultaneously without them interfering with each other.

### TCP's three-way handshake

~~~
Client -> Server: SYN (synchronize, "I want to connect")
Server -> Client: SYN-ACK (synchronize-acknowledge, "okay, and I want to connect too")
Client -> Server: ACK (acknowledge, "confirmed, we're connected")
~~~

Before any actual application data flows, TCP performs this three-step handshake to establish a connection — both sides confirm they can send and receive from each other, and agree on initial sequence numbers used to track packet ordering for the rest of the connection.

### Basic diagnostic commands

~~~bash
ping example.com          -- test basic reachability and round-trip latency
curl -v https://api.example.com   -- verbose HTTP request, showing each step
dig example.com              -- query DNS directly, showing the resolved IP address
~~~

### DNS resolution basics

~~~
1. Your computer checks its local DNS cache
2. If not cached, it asks a configured DNS resolver (often your ISP's or a public one like 8.8.8.8)
3. That resolver queries the DNS hierarchy (root -> TLD -> authoritative
   nameserver) if it doesn't already have the answer cached
4. The resolved IP address is returned and typically cached for future requests
~~~

DNS translates a human-readable name (api.example.com) into the numeric IP address actually needed to route packets — without it, every application would need users to remember and type raw IP addresses.
`,

  "intermediate-concepts": `
### TCP versus UDP: choosing the right transport

~~~
TCP (Transmission Control Protocol):
├── Connection-oriented (handshake required before data flows)
├── Reliable (lost packets automatically retransmitted)
├── Ordered (packets reassembled in the correct sequence)
├── Higher overhead (acknowledgments, handshake, congestion control)
└── Used by: HTTP/HTTPS, most APIs (REST, GraphQL, gRPC), databases

UDP (User Datagram Protocol):
├── Connectionless (no handshake, just send)
├── Unreliable (a lost packet is simply gone, no automatic retry)
├── Unordered (packets may arrive in a different order than sent)
├── Lower overhead (no handshake, no acknowledgment tracking)
└── Used by: DNS queries, real-time audio/video, some gaming, QUIC/HTTP3
~~~

The choice between TCP and UDP is fundamentally about whether your application needs GUARANTEED, ORDERED delivery (use TCP) or whether a late/lost packet is better simply discarded than retransmitted (use UDP) — real-time voice, for instance, would rather skip a lost audio frame than delay the entire stream waiting for a retransmission.

### Subnetting and CIDR notation

~~~
192.168.1.0/24    -- a network of 256 addresses (192.168.1.0 through 192.168.1.255)
10.0.0.0/16       -- a larger network of 65,536 addresses
~~~

The /24, /16 notation (CIDR — Classless Inter-Domain Routing) specifies how many bits of the IP address identify the NETWORK portion versus the HOST portion — a smaller number after the slash means MORE addresses in that network (fewer bits reserved for the network portion, more available for individual hosts).

### NAT (Network Address Translation)

~~~mermaid
flowchart LR
    Device1["Device 192.168.1.10"] --> Router["Router/NAT gateway\n(public IP: 203.0.113.5)"]
    Device2["Device 192.168.1.11"] --> Router
    Router --> Internet["Public Internet"]
~~~

NAT lets many devices on a private network share a single public IP address, translating private addresses to the shared public address (and back) for outgoing/incoming traffic — this is precisely why a home network or an office can have dozens of devices, all sharing one public IP address as far as the rest of the internet is concerned, and is a major reason IPv4's address exhaustion hasn't caused a more immediate crisis.

### Firewalls and security groups

~~~bash
sudo ufw allow 443/tcp        -- allow inbound HTTPS traffic
sudo ufw deny 23/tcp           -- explicitly deny an insecure protocol (telnet)
~~~

A firewall filters traffic based on rules (allowed/denied ports, source IPs, protocols) — in cloud environments, this concept commonly appears as "security groups" (AWS) or "network security groups" (Azure), applying similar filtering logic at the cloud provider's virtual networking layer rather than on the host itself.

### Load balancers as a networking-layer concept

~~~mermaid
flowchart LR
    Client --> LB["Load balancer"]
    LB --> Server1["Server 1"]
    LB --> Server2["Server 2"]
    LB --> Server3["Server 3"]
~~~

A load balancer sits at the network/transport layer (or, for more sophisticated application-aware balancing, the application layer) distributing incoming connections across multiple backend servers — covered in much greater depth in the **Load Balancers** skill within this platform's System Design category, but fundamentally a networking-layer concept at its core.
`,

  "advanced-concepts": `
### The TLS handshake

~~~mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: ClientHello (supported TLS versions, cipher suites)
    Server->>Client: ServerHello + certificate + chosen cipher suite
    Client->>Client: verify certificate against trusted CAs
    Client->>Server: key exchange material (encrypted with server's public key)
    Note over Client,Server: both sides derive a shared symmetric session key
    Client->>Server: encrypted application data (using the session key)
    Server->>Client: encrypted application data
~~~

TLS provides three distinct guarantees: **confidentiality** (data is encrypted, unreadable to eavesdroppers), **integrity** (data cannot be modified in transit without detection), and **authentication** (the client can cryptographically verify it's actually talking to the server it intended to, via the certificate chain) — the handshake's purpose is establishing a shared symmetric session key efficiently, since symmetric encryption is far cheaper computationally than the asymmetric cryptography used during the handshake itself. See the **TLS & HTTPS** skill for a much deeper treatment.

### TCP congestion control

~~~
When packet loss is detected (interpreted as a signal of network
congestion), TCP reduces its sending rate, then gradually increases
it again as packets are successfully delivered -- this "additive
increase, multiplicative decrease" pattern is what prevents a
congested network from collapsing entirely under load, at the cost
of temporarily reduced throughput for the connections sharing that
congested path.
~~~

Congestion control is a genuinely important, often-invisible piece of why the internet as a whole remains stable under load — without it, competing TCP connections would each keep sending as fast as possible, collectively overwhelming congested links and causing cascading packet loss across many unrelated connections.

### HTTP/1.1 versus HTTP/2 versus HTTP/3 at the transport level

~~~
HTTP/1.1: one request per TCP connection at a time (or limited
          pipelining) -- head-of-line blocking is a genuine problem
HTTP/2:   multiplexes many requests over ONE TCP connection --
          solves HTTP/1.1's head-of-line blocking at the HTTP layer,
          but a single LOST PACKET still blocks ALL multiplexed
          streams, since they share one underlying TCP connection
HTTP/3:   built on QUIC (over UDP, not TCP) -- each multiplexed
          stream has INDEPENDENT loss recovery, so one lost packet
          only affects its own stream, not every other multiplexed
          request sharing the connection
~~~

This progression directly illustrates how application-layer protocol evolution (HTTP/2, HTTP/3) has been driven specifically by limitations discovered in the TRANSPORT layer beneath it (TCP's connection-level, not stream-level, loss recovery) — a genuinely important, non-obvious detail explaining why HTTP/3 moved to UDP-based QUIC rather than simply continuing to build atop TCP.

### DNS resolution hierarchy in full

~~~mermaid
flowchart TB
    Resolver["Recursive resolver\n(e.g., 8.8.8.8)"] --> Root["Root nameserver"]
    Root --> TLD["TLD nameserver (.com)"]
    TLD --> Authoritative["Authoritative nameserver\nfor example.com"]
    Authoritative --> Resolver
~~~

A recursive resolver, when it doesn't already have a cached answer, queries the root nameservers (which point to the appropriate top-level-domain nameserver), then the TLD nameserver (which points to the specific domain's authoritative nameserver), then finally the authoritative nameserver (which has the actual answer) — each response is typically cached at every level for its specified TTL (time-to-live), which is why DNS changes can take time to propagate globally.

### IPv6 and address exhaustion

~~~
IPv4: 32-bit addresses -- roughly 4.3 billion possible addresses,
      genuinely exhausted at the registry level for years now
IPv6: 128-bit addresses -- an astronomically larger address space,
      designed specifically to eliminate the need for NAT and
      address scarcity long-term
~~~

IPv6 adoption has been gradual (NAT effectively delayed the urgency of IPv4 exhaustion for consumer/enterprise networks), but understanding both remains relevant, particularly for cloud infrastructure increasingly supporting dual-stack (IPv4 and IPv6 simultaneously) configurations.
`,

  "internal-working": `
What happens when your application makes an HTTPS request, tracing through every layer:

~~~mermaid
sequenceDiagram
    participant App as Application
    participant DNS as DNS resolver
    participant TCP as TCP/IP stack
    participant TLS as TLS layer
    participant Server

    App->>DNS: resolve api.example.com
    DNS-->>App: 203.0.113.10
    App->>TCP: open connection to 203.0.113.10:443
    TCP->>Server: SYN
    Server-->>TCP: SYN-ACK
    TCP->>Server: ACK (TCP connection established)
    App->>TLS: initiate TLS handshake
    TLS->>Server: ClientHello
    Server-->>TLS: ServerHello + certificate
    TLS->>TLS: verify certificate, derive session key
    TLS-->>App: secure channel established
    App->>Server: encrypted HTTP request
    Server-->>App: encrypted HTTP response
~~~

1. **DNS resolution happens first**: the application needs an actual IP address before it can open any network connection at all — this step alone can be a significant, often-overlooked source of latency, particularly on a cold DNS cache.
2. **TCP's three-way handshake establishes the connection**: before any application data (including the TLS handshake itself) can flow, TCP must complete its SYN/SYN-ACK/ACK exchange.
3. **TLS handshake happens ON TOP of the already-established TCP connection**: this is why HTTPS involves genuinely more round trips than plain HTTP — first the TCP handshake, THEN the TLS handshake, before the actual HTTP request/response can even begin.
4. **The application-layer HTTP exchange happens last**, now flowing over an already-established, already-encrypted TCP connection.

**Why this matters**: understanding that a single HTTPS request involves DNS resolution PLUS a TCP handshake PLUS a TLS handshake PLUS the actual HTTP exchange explains why connection REUSE (keep-alive, HTTP/2's connection multiplexing) provides such a significant performance benefit — avoiding repeating the DNS/TCP/TLS setup cost for every subsequent request to the same server is a major, concrete latency win.
`,

  architecture: `
A senior engineer thinks about networking across several dimensions: understanding which layer a given problem actually lives at (essential for effective debugging), designing systems that account for genuine network unreliability, and choosing the right transport/protocol for a given use case's actual requirements.

### The debugging-by-layer discipline

~~~mermaid
flowchart TB
    Q1{"Can you resolve the hostname\nto an IP address at all?"}
    Q1 -->|No| DNS_Issue["DNS problem -- check resolver config, dig the hostname directly"]
    Q1 -->|Yes| Q2{"Can you establish a TCP\nconnection to that IP/port?"}
    Q2 -->|No| TCP_Issue["Network/firewall problem -- check routing, security groups, firewall rules"]
    Q2 -->|Yes| Q3{"Does the TLS handshake\nsucceed?"}
    Q3 -->|No| TLS_Issue["Certificate/TLS config problem"]
    Q3 -->|Yes| Q4{"Does the application\nreturn the expected response?"}
    Q4 -->|No| App_Issue["Application-layer problem -- now debug the actual service logic"]
~~~

This layer-by-layer isolation discipline — systematically checking DNS, then TCP connectivity, then TLS, then application logic, IN THAT ORDER — is the single most valuable practical networking skill for a working engineer, since it prevents wasted time debugging application code when the actual failure is a DNS misconfiguration or a firewall rule.

### Designing for network unreliability

~~~mermaid
flowchart LR
    App["Application"] --> Retry["Retry with backoff"]
    Retry --> Timeout["Explicit timeouts"]
    Timeout --> CircuitBreaker["Circuit breakers for\npersistent failures"]
~~~

Because networks are FUNDAMENTALLY unreliable (packet loss, partitions, latency spikes are not edge cases but expected, routine occurrences at scale), production systems must be designed with explicit timeouts, retry logic with backoff, and circuit breakers — directly connecting to this platform's **Distributed Systems** skill's own treatment of designing for partial failure.

### Choosing a transport/protocol deliberately

~~~
Need guaranteed, ordered delivery of arbitrary data -> TCP (most APIs, databases)
Need lowest possible latency, can tolerate loss -> UDP (real-time audio/video, DNS)
Need a request-response API for broad client compatibility -> REST (over TCP/HTTP)
Need high-throughput internal service communication -> gRPC (over TCP/HTTP2)
Need genuinely bidirectional real-time communication -> WebSockets (over TCP)
Need one-directional server streaming -> Server-Sent Events (over TCP/HTTP)
~~~

This decision framework directly connects every protocol covered in this platform's **API Development** category back to the underlying transport-layer tradeoffs (TCP versus UDP, connection-oriented versus connectionless) covered on this page.
`,

  "data-flow": `
Tracing a packet's journey across the internet, from a client to a distant server:

~~~mermaid
sequenceDiagram
    participant Client
    participant LocalRouter as Local router/gateway
    participant ISP as ISP network
    participant Backbone as Internet backbone
    participant DestISP as Destination ISP
    participant Server

    Client->>LocalRouter: packet destined for Server's IP
    LocalRouter->>ISP: forwards toward the next hop
    ISP->>Backbone: routes based on IP prefix (BGP-determined paths)
    Backbone->>DestISP: forwards toward the destination network
    DestISP->>Server: delivers the packet to its final destination
    Note over Client,Server: Each hop only knows the NEXT hop, not the full path
~~~

The critical detail: no single router along this path knows the ENTIRE route from client to server — each router simply knows, based on its routing table (built via protocols like BGP at the internet backbone level), which NEXT hop gets a packet closer to its destination — this decentralized, hop-by-hop forwarding is precisely what lets the internet route around failures (a downed link simply means routers recalculate and use a different next hop) without requiring any centralized coordination.
`,

  "production-usage": `
### Diagnosing a production connectivity issue systematically

~~~bash
# Step 1: can we resolve DNS?
dig api.example.com

# Step 2: can we reach the IP at all (basic connectivity)?
ping 203.0.113.10

# Step 3: can we establish a TCP connection to the specific port?
nc -zv 203.0.113.10 443

# Step 4: does the full HTTPS request succeed, and where does it fail if not?
curl -v https://api.example.com/health
~~~

This four-step escalation (DNS, ping, TCP port check, full application request) is the standard, systematic approach to isolating a production connectivity issue to the specific layer where it's actually occurring, rather than guessing.

### Non-negotiables for any production networked service

1. **Explicit timeouts on every network call**, never relying on an unbounded default that could hang indefinitely.
2. **Retry logic with exponential backoff** for transient failures, distinguishing retryable (timeout, connection refused) from non-retryable (4xx client errors) failure classes.
3. **TLS everywhere for anything beyond a local development environment** — plaintext HTTP in production is a genuine, common security gap.
4. **Explicit firewall/security group configuration**, allowing only the specific ports/sources genuinely needed.
5. **DNS TTLs configured deliberately**, understanding the tradeoff between fast propagation of changes (low TTL) and reduced DNS query load/latency (higher TTL).

### Common production patterns

- **Load balancers** distributing traffic across multiple backend instances, covered in depth in the **Load Balancers** skill.
- **CDNs** caching content geographically closer to end users, reducing both latency and origin server load, covered in the **CDN** skill.
- **VPNs and private networking** (VPCs in cloud environments) isolating internal service-to-service traffic from the public internet.
- **Health checks** at the load balancer/orchestrator level, using basic TCP or HTTP connectivity checks to determine whether a backend instance should receive traffic.
`,

  "industry-examples": `
- **Every cloud provider's virtual private cloud (VPC) offering** (AWS VPC, GCP VPC, Azure VNet): implements the same fundamental IP addressing, subnetting, and routing concepts covered on this page, virtualized atop shared physical infrastructure.
- **Content delivery networks** (Cloudflare, Akamai, Fastly): built around exploiting DNS and routing to direct users to geographically nearby servers, directly leveraging the DNS and routing concepts covered here.
- **Kubernetes networking**: implements its own virtual networking model (each pod gets an IP address, services get stable virtual IPs) built conceptually atop the same IP/routing fundamentals, just virtualized within a cluster.
- **Every major LLM provider's API infrastructure**: relies on the same DNS-plus-TCP-plus-TLS-plus-HTTP stack covered on this page for every single API call an AI application makes.
- **Root DNS server operators** (a small number of organizations operating the internet's foundational DNS infrastructure): a genuinely critical piece of global internet infrastructure, illustrating DNS's real-world architectural importance.
- **Internet backbone providers and BGP routing**: the real-world mechanism by which packets actually find their way across the global internet's many interconnected, independently-operated networks.
`,

  "best-practices": `
1. **Debug systematically by layer** (DNS, then TCP connectivity, then TLS, then application) rather than guessing where a connectivity issue actually lives.
2. **Always set explicit timeouts** on network calls; never rely on an unbounded default.
3. **Implement retry logic with exponential backoff**, distinguishing retryable from non-retryable failures.
4. **Use TLS everywhere in production**, never plaintext HTTP beyond local development.
5. **Configure firewalls/security groups explicitly**, allowing only genuinely necessary ports and sources.
6. **Choose TCP or UDP deliberately** based on whether guaranteed ordered delivery or minimal latency/overhead matters more for your specific use case.
7. **Understand DNS TTL tradeoffs** and configure them deliberately, not accepting a default without consideration.
8. **Reuse connections where possible** (HTTP keep-alive, connection pooling) to avoid repeatedly paying DNS/TCP/TLS setup costs.
9. **Design for network partitions as an expected occurrence**, not an edge case, in any distributed system.
10. **Use health checks at the load balancer/orchestrator level** to automatically route traffic away from unhealthy instances.
11. **Monitor DNS resolution time, TCP connection time, and TLS handshake time separately**, not just overall request latency, to pinpoint where latency is actually being spent.
12. **Understand NAT and private IP ranges** when debugging connectivity issues in containerized/cloud environments, where multiple layers of address translation are common.
`,

  "anti-patterns": `
### No timeout on network calls

~~~python
# WRONG — no timeout at all, a hung connection blocks indefinitely
response = requests.get("https://api.example.com/data")

# RIGHT — always set an explicit, appropriate timeout
response = requests.get("https://api.example.com/data", timeout=5)
~~~

Omitting an explicit timeout means a single slow or hung downstream service can block a calling application indefinitely, a genuinely common cause of cascading production incidents (one hung dependency exhausting all available request-handling threads/connections).

### Treating network failures as rare exceptions rather than routine occurrences

~~~python
# WRONG — no retry logic at all, treating any network hiccup as fatal
def fetch_data():
    return requests.get("https://api.example.com/data", timeout=5).json()

# RIGHT — retry transient failures with backoff
def fetch_data():
    for attempt in range(3):
        try:
            return requests.get("https://api.example.com/data", timeout=5).json()
        except requests.exceptions.ConnectionError:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
~~~

At any meaningful production scale, transient network failures (a brief packet loss spike, a momentary DNS hiccup, a load balancer routing to an instance mid-restart) are ROUTINE, expected occurrences, not rare edge cases — applications without retry logic will experience unnecessary failures for what would otherwise be transparent, recoverable blips.

### Other production-grade anti-patterns

- **Debugging application code first when the actual issue is DNS or firewall-related**, wasting significant time before checking lower-layer connectivity systematically.
- **Deploying plaintext HTTP in production**, exposing data to interception/tampering on any network segment the traffic traverses.
- **Not distinguishing retryable from non-retryable errors**, retrying a 400 Bad Request (which will never succeed on retry) as if it were a transient network failure.
- **Ignoring DNS TTL implications** when planning infrastructure changes (a DNS cutover with a high TTL can take much longer to propagate than expected).
- **Assuming a successful ping means an application-level service is healthy** — ICMP (ping) reachability doesn't guarantee the actual application (HTTP server, database) on that host is functioning correctly.
`,

  performance: `
### Rule zero: understand where latency is actually being spent

A single HTTPS request's total latency is the SUM of DNS resolution, TCP handshake, TLS handshake, and the actual application request/response — profiling which of these dominates is essential before optimizing the wrong thing.

### The performance hierarchy (apply in order)

1. **Reuse connections** (HTTP keep-alive, connection pooling, HTTP/2 multiplexing) to avoid repeatedly paying DNS/TCP/TLS setup costs for every request.
2. **Cache DNS resolutions appropriately** (respecting TTLs) rather than re-resolving on every single request.
3. **Use a CDN for geographically distributed static/cacheable content**, reducing the physical distance (and therefore latency) between users and the content they're requesting.
4. **Choose UDP-based protocols where latency matters more than guaranteed delivery** (real-time audio/video specifically).
5. **Minimize the number of round trips** an application-level protocol requires (this is precisely why HTTP/2's multiplexing and TLS session resumption both matter for real-world performance).

### Micro-level facts worth knowing

- Physical distance imposes a hard floor on latency (the speed of light in fiber is a genuine physics constraint) — no protocol optimization can make a cross-continental request faster than roughly the speed-of-light-in-fiber round trip time for that distance.
- TLS session resumption (reusing a previously-negotiated session rather than performing a full handshake again) meaningfully reduces the latency cost of TLS for repeat connections to the same server.
- TCP's initial congestion window limits how much data can be sent before the first acknowledgment, meaning very short-lived connections (a single small request) never get the chance to reach TCP's full throughput potential — another reason connection reuse matters for cumulative performance across many requests.
`,

  scalability: `
Networking-layer scalability concerns center on handling ever-larger volumes of concurrent connections and traffic without a single point of failure or bottleneck — the same fundamental concerns underlying this platform's **Load Balancers**, **CDN**, and **Distributed Systems** skills.

### The load-distribution model

~~~mermaid
flowchart LR
    Clients["Many clients"] --> DNS_LB["DNS-based load distribution\n(multiple A records, geo-routing)"]
    DNS_LB --> LB["Load balancer(s)"]
    LB --> Server1["Server 1"]
    LB --> Server2["Server 2"]
    LB --> ServerN["Server N"]
~~~

Scaling a networked service typically layers multiple distribution mechanisms: DNS-level distribution (multiple IP addresses for one hostname, or geographically-aware DNS responses) combined with a dedicated load balancer distributing individual connections across many backend instances — no single mechanism alone handles internet-scale traffic distribution.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A single server's maximum concurrent connection count | Horizontal scaling behind a load balancer |
| Geographic latency for globally distributed users | A CDN or geographically distributed origin servers |
| DNS query volume/latency at scale | Appropriately configured TTLs and a robust, distributed DNS provider |
| TCP connection setup overhead at high request rates | Connection reuse/pooling, HTTP/2 multiplexing |
| A single point of failure in network infrastructure | Redundant links, multiple availability zones/regions, BGP-level redundancy for internet-facing infrastructure |
`,

  security: `
### TLS as the foundational network security layer

~~~
Always use TLS (HTTPS) for anything beyond local development --
plaintext HTTP exposes data to interception (eavesdropping) and
tampering by any intermediary on the network path (a compromised
router, a malicious WiFi access point, an ISP).
~~~

TLS is the single most important networking-layer security control, providing confidentiality, integrity, and authentication — see the **TLS & HTTPS** skill for a comprehensive, dedicated treatment.

### Firewalls and network segmentation

~~~bash
sudo ufw default deny incoming
sudo ufw allow 443/tcp
sudo ufw allow from 10.0.0.0/8 to any port 5432   -- database only reachable from internal network
~~~

Explicit, default-deny firewall configuration (allow only specifically-needed ports/sources, deny everything else by default) is a foundational security practice — a database port, for instance, should typically be reachable only from application servers on an internal network, never directly from the public internet.

### Essential networking security practices

1. **Always use TLS for data in transit**, no exceptions for production traffic.
2. **Apply default-deny firewall rules**, explicitly allowlisting only necessary ports/sources.
3. **Segment networks** (public-facing tier, internal application tier, database tier) so a compromise of one tier doesn't automatically expose the others.
4. **Validate TLS certificates properly**, never disabling certificate verification in production code even to "just get past an error."
5. **Be aware of DNS-based attacks** (DNS spoofing, cache poisoning) and use DNSSEC where the threat model genuinely warrants it.
6. **Understand that ICMP/ping reachability is not a security boundary** — a firewall that blocks application ports but allows ping still meaningfully restricts access.

See the **TLS & HTTPS**, **OWASP Top 10**, and **Secrets Management** skills for further, broader security depth.
`,

  testing: `
### Testing network-dependent application code

~~~python
import pytest
from unittest.mock import patch

def test_fetch_data_retries_on_connection_error():
    with patch("requests.get") as mock_get:
        mock_get.side_effect = [ConnectionError(), ConnectionError(), MockResponse(200)]
        result = fetch_data_with_retry()
        assert mock_get.call_count == 3
        assert result.status_code == 200

def test_fetch_data_respects_timeout():
    with patch("requests.get") as mock_get:
        fetch_data()
        mock_get.assert_called_with(timeout=5)
~~~

### Testing timeout and retry behavior explicitly

~~~python
def test_non_retryable_error_does_not_retry():
    with patch("requests.get") as mock_get:
        mock_get.return_value = MockResponse(400)
        fetch_data_with_retry()
        assert mock_get.call_count == 1   -- a 400 should NOT trigger a retry
~~~

### The senior testing doctrine

- Test that network calls have explicit, appropriate timeouts configured, not just that they eventually complete under happy-path conditions.
- Test retry logic explicitly, including that it correctly distinguishes retryable from non-retryable failures.
- Use integration tests with a real (or realistically simulated) network layer at least occasionally, since mocked unit tests alone can miss genuine connectivity/configuration issues.
- Test DNS resolution and certificate validation behavior explicitly for any code doing custom TLS configuration.
- Use tools like toxiproxy or similar network-fault-injection tools to test application behavior under simulated packet loss, latency, or partition conditions, not just clean network assumptions.
`,

  debugging: `
### The toolbox, in escalation order

1. **dig or nslookup** to verify DNS resolution is working and returning the expected IP address.
2. **ping** for basic reachability testing (though remember this only confirms ICMP works, not that the actual application service is healthy).
3. **nc -zv (netcat) or telnet** to verify a specific TCP port is actually reachable, isolating connectivity from application-level issues.
4. **curl -v** for a fully verbose HTTP(S) request, showing DNS resolution, TCP connection, TLS handshake, and the HTTP exchange all in one command's output.
5. **traceroute/tracert** to see the actual hop-by-hop path packets are taking, useful for diagnosing where along a path latency or packet loss is occurring.
6. **tcpdump or Wireshark** for genuinely deep packet-level inspection, capturing and analyzing raw network traffic when higher-level tools aren't sufficient.

### Debugging common networking-specific symptoms

- "DNS resolves to the wrong IP" — check for stale DNS caching (local machine, or an intermediate resolver) respecting an old TTL; verify the actual authoritative record with dig +trace.
- "Connection times out" — verify with nc whether the specific port is reachable at all; if not, suspect a firewall/security group rule rather than an application bug.
- "TLS handshake fails" — check certificate validity/expiration, hostname mismatch, and whether an outdated TLS version/cipher suite is being rejected by one side.
- "Works from one location but not another" — suspect firewall/security group differences, or a geographically-routed DNS response pointing to a different, possibly misconfigured, server.
`,

  monitoring: `
### Key signals to track

- **DNS resolution time**, tracked separately from overall request latency, since a slow or failing DNS resolver can silently dominate perceived latency.
- **TCP connection establishment time and TLS handshake time**, each tracked as distinct phases of overall request latency.
- **Packet loss and retransmission rates**, a direct signal of network path quality/congestion.
- **Connection count and file descriptor usage** on servers, since exhausting available connections/file descriptors is a common, specific production failure mode.

### Tools

Standard APM tools commonly break down request latency by phase (DNS, connect, TLS, time-to-first-byte); network-specific monitoring (SNMP-based tools, cloud provider VPC flow logs) for infrastructure-level visibility; synthetic monitoring (regularly testing connectivity/latency from multiple geographic locations) for proactively catching regional network issues.

### Alerting priorities

Alert on elevated DNS resolution failures or latency (an early, often-overlooked signal), on TCP connection failures/timeouts (a strong signal of a network or firewall issue rather than an application bug), and on TLS handshake failures specifically (often indicating a certificate expiration or configuration issue requiring urgent attention).
`,

  deployment: `
### Configuring networking for a typical cloud deployment

~~~
VPC (Virtual Private Cloud): 10.0.0.0/16
├── Public subnet: 10.0.1.0/24 (load balancers, NAT gateways)
├── Private subnet (app tier): 10.0.2.0/24 (application servers, not directly internet-reachable)
└── Private subnet (data tier): 10.0.3.0/24 (databases, reachable only from the app tier)
~~~

A common, security-conscious cloud network architecture segments infrastructure into public and private subnets, with only load balancers/NAT gateways directly internet-facing, and application/database tiers reachable only from within the private network — directly connecting to the network segmentation security practice covered earlier on this page.

### DNS and TLS certificate management in deployment

~~~
- Configure DNS records (A/AAAA/CNAME) pointing to the load balancer's
  address, with an appropriate TTL
- Provision and configure TLS certificates (often via a managed
  certificate service, or Let's Encrypt for automated issuance/renewal)
- Configure health checks so the load balancer/orchestrator can detect
  and route around unhealthy backend instances automatically
~~~

### CI/CD pipeline considerations

Network configuration (security groups, VPC settings) increasingly managed as infrastructure-as-code (Terraform, covered in its own skill) rather than manually configured, ensuring reproducibility and auditability. See the **CI/CD** and **Terraform** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a networked production service takes real traffic:

- [ ] TLS configured and enforced for all production traffic, no plaintext HTTP
- [ ] Explicit timeouts configured on every outbound network call
- [ ] Retry logic with exponential backoff implemented, correctly distinguishing retryable from non-retryable failures
- [ ] Firewall/security group rules configured with default-deny, allowing only necessary ports/sources
- [ ] Network segmentation applied (public, application, database tiers appropriately isolated)
- [ ] DNS records configured with an appropriate TTL for your change-frequency needs
- [ ] Health checks configured at the load balancer/orchestrator level
- [ ] Monitoring in place for DNS resolution time, TCP connection time, and TLS handshake time as distinct signals
- [ ] Connection reuse/pooling configured where applicable, avoiding unnecessary repeated handshake overhead
- [ ] Certificate expiration monitoring/auto-renewal configured
- [ ] Load testing performed to understand actual connection-handling capacity limits
- [ ] A documented, systematic debugging runbook (DNS -> TCP -> TLS -> application) available for on-call use
`,

  "common-mistakes": `
1. **No explicit timeout on network calls**, risking indefinite hangs from a slow or unresponsive dependency.
2. **No retry logic, or retry logic that doesn't distinguish retryable from non-retryable failures.**
3. **Debugging application code first when the actual issue is DNS or firewall-related**, wasting significant investigation time.
4. **Deploying plaintext HTTP in production.**
5. **Assuming ping/ICMP reachability means the actual application service is healthy.**
6. **Ignoring DNS TTL implications** when planning infrastructure changes or cutovers.
7. **Not reusing connections**, repeatedly paying DNS/TCP/TLS setup costs unnecessarily.
8. **Confusing TCP and UDP's guarantees**, choosing the wrong transport for a given use case's actual reliability/latency needs.
9. **Not segmenting networks appropriately**, exposing database or internal-only tiers directly to the public internet.
10. **Treating network failures as rare exceptions** rather than routine, expected occurrences requiring explicit handling.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Connection timed out | Firewall blocking the port, or the target host/service is unreachable | Verify with nc/telnet whether the specific port is actually reachable; check firewall/security group rules |
| Connection refused | No process listening on the target port at the destination host | Verify the target service is actually running and listening on the expected port |
| Name or service not known / DNS resolution failure | The hostname doesn't resolve, or the configured DNS resolver is unreachable | Verify with dig/nslookup, check resolver configuration |
| SSL/TLS handshake failure | Certificate expired/invalid, hostname mismatch, or incompatible TLS version/cipher | Check certificate validity and hostname match; verify TLS version compatibility on both ends |
| Connection reset by peer | The remote side abruptly closed the connection, often due to an application-level error or a firewall actively rejecting the connection | Check the remote application's logs, and verify no firewall/security appliance is actively resetting the connection |
| Too many open files / connection pool exhausted | The application isn't properly closing/reusing connections, exhausting available file descriptors | Verify connection pooling/reuse is correctly configured and connections are properly released |
| Intermittent packet loss / high latency | Network congestion, a degraded physical link, or geographic distance | Use traceroute/mtr to identify where along the path the issue is occurring |
`,

  faqs: `
**Why does HTTPS involve more round trips than plain HTTP?**
Because HTTPS requires a TCP handshake FIRST, then a TLS handshake ON TOP of that already-established TCP connection, before any actual HTTP request/response can flow — this is genuinely more round trips than plain HTTP's single TCP handshake, though TLS session resumption and connection reuse both meaningfully reduce this cost for repeat connections.

**Should I use TCP or UDP for my application?**
Use TCP when you need guaranteed, ordered delivery of data (most APIs, databases, file transfers); use UDP when minimizing latency matters more than guaranteed delivery, and a lost or late packet is better simply discarded than retransmitted (real-time audio/video, DNS queries).

**Why does my DNS change take time to propagate?**
DNS responses are cached at multiple levels (your local machine, intermediate resolvers, your ISP) for the duration specified by the record's TTL (time-to-live) — a change won't be visible everywhere until every cached copy's TTL has expired, which is why lowering a TTL BEFORE a planned DNS change is a common, deliberate practice.

**What's the practical difference between HTTP/2 and HTTP/3?**
HTTP/2 multiplexes many requests over one TCP connection, but a single lost packet still blocks every multiplexed stream sharing that connection (since they all depend on the same underlying TCP stream's in-order delivery); HTTP/3, built on QUIC over UDP, gives each multiplexed stream independent loss recovery, so one lost packet only affects its own stream.

**Why is debugging "layer by layer" (DNS, then TCP, then TLS, then application) the recommended approach?**
Because a failure at any lower layer will manifest as a confusing, seemingly application-level symptom if you don't check systematically — jumping straight to debugging application code when the actual issue is a DNS misconfiguration or a firewall rule wastes significant time; checking connectivity layer-by-layer quickly isolates where the actual problem lives.

**Is ping a reliable way to check if my service is healthy?**
No — ping only tests basic ICMP-level network reachability to a host, not whether the actual application (a web server, a database) running on that host is functioning correctly; use an actual application-level health check endpoint for genuine service health verification.
`,

  "interview-questions": `
### Junior level

1. **What is the difference between an IP address and a port number?**
   Model answer: an IP address identifies a specific device on a network; a port number identifies a specific application/service running on that device, letting one machine run many different network services simultaneously without conflict.

2. **What is TCP's three-way handshake, and why is it necessary?**
   Model answer: SYN, SYN-ACK, ACK — a three-step exchange establishing a connection before any application data flows, confirming both sides can send and receive, and agreeing on initial sequence numbers used to track ordering for the rest of the connection.

3. **What is the difference between TCP and UDP?**
   Model answer: TCP is connection-oriented, reliable, and ordered (lost packets are retransmitted, out-of-order packets reassembled); UDP is connectionless, unreliable, and unordered, but has lower overhead — the choice depends on whether guaranteed delivery or minimal latency matters more for a given use case.

4. **What does DNS do, and why is it needed?**
   Model answer: it translates human-readable hostnames (like example.com) into the numeric IP addresses actually needed to route network packets, letting users and applications reference services by memorable names rather than needing to track raw IP addresses.

5. **What does TLS provide, at a high level?**
   Model answer: confidentiality (data is encrypted, unreadable to eavesdroppers), integrity (data can't be modified in transit without detection), and authentication (a client can cryptographically verify it's talking to the intended server).

### Senior level

6. **Walk through what happens, layer by layer, when an application makes an HTTPS request to a new host for the first time.**
   Model answer: first, DNS resolution translates the hostname to an IP address; then TCP performs its three-way handshake to establish a connection; then TLS performs its own handshake (exchanging certificates, verifying identity, deriving a shared session key) ON TOP of the now-established TCP connection; only then does the actual HTTP request/response exchange occur, now flowing over an encrypted, already-established connection.

7. **Why does HTTP/3 use QUIC over UDP rather than continuing to build on TCP the way HTTP/1.1 and HTTP/2 did?**
   Model answer: HTTP/2 multiplexes many requests over one TCP connection, but because TCP guarantees IN-ORDER delivery for the entire connection, a single lost packet blocks delivery of ALL multiplexed streams sharing that connection until it's retransmitted (a form of head-of-line blocking at the transport layer); QUIC, built on UDP, implements its own reliability and multiplexing where each stream has INDEPENDENT loss recovery, so a lost packet only affects its own stream rather than every multiplexed request sharing the connection.

8. **How would you systematically debug a "connection times out" error reported by a client trying to reach your production API?**
   Model answer: check DNS resolution first (does the hostname resolve to the expected IP), then test basic reachability (ping, understanding it only confirms ICMP), then specifically test TCP connectivity to the exact port in question (nc -zv or telnet) to determine whether a firewall/security group is blocking it, then if TCP connects, check TLS handshake success, and only after ruling out each of these lower layers investigate application-level logic — this layer-by-layer isolation prevents wasted debugging time on the wrong layer.

9. **Explain TCP congestion control conceptually and why it matters for overall internet stability.**
   Model answer: TCP interprets packet loss as a signal of network congestion and reduces its sending rate in response, then gradually increases it again as packets are successfully delivered (additive increase, multiplicative decrease); without this self-limiting behavior, many competing TCP connections would each keep sending as fast as possible during congestion, collectively overwhelming already-congested links and potentially causing cascading, widespread packet loss rather than a graceful, distributed slowdown.

10. **Why does connection reuse (keep-alive, connection pooling, HTTP/2 multiplexing) provide such a significant performance benefit?**
    Model answer: establishing a new connection requires paying the full cost of DNS resolution (if not cached), a TCP three-way handshake, and (for HTTPS) a TLS handshake — all before any actual application data can flow; reusing an already-established, already-authenticated connection for subsequent requests avoids repeating all of this setup cost, which can dominate the total latency of a request, particularly for small, frequent requests to the same server.

11. **What is NAT, and why has it delayed the urgency of IPv4 address exhaustion?**
    Model answer: NAT lets many devices on a private network share a single public IP address by translating private addresses to the shared public address for outgoing traffic (and back for corresponding incoming responses); this means an entire home network, office, or even a large organization can operate behind a small number of public IP addresses, dramatically reducing the number of unique public IPv4 addresses actually required globally relative to the number of individual devices connected to the internet.

12. **How would you design a distributed system's networking layer to be resilient to genuine, expected network partitions and packet loss?**
    Model answer: apply explicit timeouts on every network call (never unbounded waits), implement retry logic with exponential backoff that correctly distinguishes transient/retryable failures from permanent/non-retryable ones, use circuit breakers to stop hammering a persistently failing dependency, design idempotent operations where possible so retries are safe, and architect the system's consistency model with an explicit understanding (per the CAP theorem) that network partitions WILL occur and must be handled gracefully rather than assumed away.
`,

  "coding-questions": `
### 1. Implement a function with proper timeout and retry-with-backoff logic

~~~python
import time
import requests

def fetch_with_retry(url, max_retries=3, timeout=5):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=timeout)
            if response.status_code < 500:
                return response
        except requests.exceptions.ConnectionError:
            if attempt == max_retries - 1:
                raise
        time.sleep(2 ** attempt)
    return None
# Follow-up: why does this implementation return early (without retrying)
# for any status code below 500, and why would retrying a 400 Bad
# Request be pointless regardless of how many attempts are made?
~~~

### 2. Write a script that checks DNS, TCP connectivity, and TLS in sequence

~~~python
import socket
import ssl

def diagnose_connectivity(hostname, port=443):
    try:
        ip = socket.gethostbyname(hostname)
        print("DNS resolved to: " + ip)
    except socket.gaierror:
        print("DNS resolution FAILED")
        return

    try:
        sock = socket.create_connection((hostname, port), timeout=5)
        print("TCP connection SUCCEEDED")
    except (socket.timeout, ConnectionRefusedError):
        print("TCP connection FAILED")
        return

    try:
        context = ssl.create_default_context()
        wrapped = context.wrap_socket(sock, server_hostname=hostname)
        print("TLS handshake SUCCEEDED, cert subject: " + str(wrapped.getpeercert()))
    except ssl.SSLError:
        print("TLS handshake FAILED")
# Follow-up: why does this script check DNS, then TCP, then TLS in this
# specific ORDER rather than any other, and how does this order directly
# reflect the layered debugging discipline covered in this page's
# Architecture section?
~~~

### 3. Implement a simple circuit breaker for a network-dependent function

~~~python
import time

class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=30):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"

    def call(self, func, *args):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.reset_timeout:
                self.state = "half-open"
            else:
                raise Exception("circuit breaker is open")
        try:
            result = func(*args)
            self.failure_count = 0
            self.state = "closed"
            return result
        except Exception:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            raise
# Follow-up: why is a circuit breaker's "half-open" state important, and
# what would happen to a persistently failing downstream dependency if
# the circuit breaker only had "open" and "closed" states with no
# intermediate testing phase?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Trace a full HTTPS request layer by layer
Using dig, nc, and curl -v against a real public API, manually observe and document each layer (DNS resolution, TCP connection, TLS handshake, HTTP exchange) of a single HTTPS request. Deliverable: an annotated walkthrough of the observed output at each layer. Skills exercised: layered debugging, diagnostic tool fluency.

### Lab 2 (Intermediate): Implement and test retry/timeout logic
Build a small HTTP client wrapper implementing explicit timeouts and retry-with-backoff logic, correctly distinguishing retryable from non-retryable failures, with a test suite using mocked network failures. Deliverable: a working client wrapper with passing tests covering both failure classes. Skills exercised: resilient network programming, testing network-dependent code.

### Lab 3 (Advanced): Configure a segmented network with firewall rules
Using a cloud provider's VPC/security group features (or a local firewall configuration), set up a segmented network with a public tier, an application tier, and a database tier, verifying via nc that only the intended paths are reachable. Deliverable: a documented network topology with verified access rules. Skills exercised: network segmentation, firewall configuration, security group design.

### Lab 4 (Production): Diagnose a simulated network fault
Using a network fault-injection tool (toxiproxy or similar) to simulate packet loss, added latency, or a full partition between two services, observe and document how an application with proper timeout/retry/circuit-breaker logic behaves compared to one without. Deliverable: a comparative analysis of resilient versus non-resilient application behavior under simulated network faults. Skills exercised: resilience testing, fault injection, distributed systems reasoning.
`,

  "real-projects": `
### 1. A production-grade HTTP client wrapper for microservice communication
Engineering requirements: a shared internal library implementing explicit timeouts, retry-with-backoff (correctly distinguishing retryable/non-retryable failures), circuit breaking, and detailed per-phase latency instrumentation (DNS, connect, TLS, time-to-first-byte), used consistently across all of an organization's internal service-to-service HTTP calls.

### 2. A segmented, security-hardened cloud network architecture
Engineering requirements: a VPC design with public, application, and database subnets, explicit security group rules enforcing least-privilege access between tiers, a load balancer distributing traffic to the application tier, and monitoring for unexpected cross-tier traffic attempts.

### 3. A network diagnostics runbook and tooling suite for on-call engineers
Engineering requirements: a documented, systematic troubleshooting guide (DNS, then TCP, then TLS, then application) paired with a small internal tool automating the four-step diagnostic sequence (dig, ping, nc, curl -v) against a given hostname/port, reducing mean-time-to-diagnosis during production incidents.
`,

  "case-studies": `
### The remarkable stability of IP and TCP across four-plus decades
The core IP addressing model and TCP's fundamental reliability mechanisms have remained largely stable since the early 1980s, even as the application layer above them (HTTP/1.1 to HTTP/2 to HTTP/3, the rise of WebSockets and gRPC) has evolved rapidly and repeatedly. Lesson: a well-designed layered architecture lets innovation happen at higher layers without requiring the foundational layers beneath to be replaced — this same principle (stable, well-abstracted lower layers enabling rapid higher-layer innovation) recurs throughout software architecture generally, not just in networking specifically.

### HTTP/3's move to UDP-based QUIC as a response to a transport-layer limitation
The industry's shift from HTTP/2 (over TCP) to HTTP/3 (over QUIC, built on UDP) illustrates how a limitation discovered at one layer (TCP's connection-level, not stream-level, head-of-line blocking) can eventually justify a genuinely significant architectural change at the layer above (moving off TCP entirely) once that limitation's cost becomes significant enough at scale. Lesson: sometimes solving a persistent problem at the layer where symptoms appear (HTTP) requires reconsidering an assumption at the layer beneath it (TCP) rather than only optimizing within the higher layer's own constraints.

### NAT's role in delaying (not solving) IPv4 exhaustion
NAT was never intended as a permanent solution to IPv4's roughly 4.3 billion address ceiling, yet its widespread adoption meaningfully delayed the practical urgency of that exhaustion for decades by letting many devices share few public addresses, while IPv6 (designed specifically to eliminate the underlying scarcity) has seen much slower adoption than the scale of the problem might suggest. Lesson: a practical workaround (NAT) that sufficiently reduces the URGENCY of a problem can significantly slow adoption of the more architecturally "correct" long-term solution (IPv6), even when the workaround was never intended to be a permanent fix — a dynamic worth recognizing when evaluating whether a "temporary" mitigation might end up being relied upon far longer than originally intended.
`,

  comparisons: `
| Aspect | TCP | UDP |
|--------|-----|-----|
| Connection model | Connection-oriented (handshake required) | Connectionless |
| Reliability | Guaranteed delivery, automatic retransmission | No delivery guarantee, no retransmission |
| Ordering | Guaranteed in-order delivery | No ordering guarantee |
| Overhead | Higher (handshake, acknowledgments, congestion control) | Lower (no handshake, no acknowledgment tracking) |
| Typical use cases | HTTP/HTTPS, REST/GraphQL/gRPC APIs, databases, file transfer | DNS queries, real-time audio/video, some gaming, QUIC/HTTP3 |

| Aspect | HTTP/1.1 | HTTP/2 | HTTP/3 (QUIC) |
|--------|----------|--------|----------------|
| Transport | TCP | TCP | UDP (via QUIC) |
| Multiplexing | Limited (pipelining issues) | Yes, over one connection | Yes, with independent per-stream loss recovery |
| Head-of-line blocking | Significant | Reduced at HTTP layer, still present at TCP layer | Eliminated at the transport layer, per-stream |

**How seniors choose**: use TCP-based protocols (REST, gRPC, most APIs) as the default for anything needing guaranteed delivery; reach for UDP-based approaches (DNS, real-time media, HTTP/3) specifically when minimizing latency and avoiding head-of-line blocking matters more than guaranteed, ordered delivery for every single packet.
`,

  "related-technologies": `
- **Linux** — the operating system whose networking stack (implementing the concepts covered on this page) is exercised directly via its command-line tools; covered alongside this skill.
- **TLS & HTTPS** — a much deeper, dedicated treatment of the encryption layer briefly introduced here.
- **REST**, **GraphQL**, **gRPC**, **WebSockets**, **Server-Sent Events** — the application-layer protocols covered in this platform's API Development category, all built atop the transport/network layers covered on this page.
- **Load Balancers**, **Reverse Proxy**, **CDN**, **API Gateway** — the System Design category's infrastructure components, each fundamentally networking-layer concepts applied at production scale.
- **Distributed Systems** and **CAP Theorem** — how the network's fundamental unreliability (partitions, latency, packet loss) shapes distributed system design tradeoffs.

Learning path: **Linux** → this page → **TLS & HTTPS** for encryption depth → **Load Balancers**/**CDN**/**Distributed Systems** for the production infrastructure and design implications built on these fundamentals.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- HTTP/3 and QUIC continue to see growing adoption across major browsers, CDNs, and cloud providers, gradually becoming a more common default alongside HTTP/2.
- IPv6 adoption continues gradually increasing globally, though NAT and IPv4 remain deeply entrenched in much existing infrastructure.
- Continued growth of service mesh architectures (Istio, Linkerd, covered in the context of gRPC and Kubernetes elsewhere on this platform) adding sophisticated, application-aware networking capabilities (mTLS, retries, observability) atop the fundamental TCP/IP layers covered here.
- Given the pace of protocol evolution at the application layer specifically, verify current adoption status and specific implementation details of newer protocols (HTTP/3, QUIC-based extensions) against current documentation rather than assuming universal support.
`,

  "future-roadmap": `
Where networking is heading, and what's worth betting career time on:

- **Continued gradual IPv6 adoption**, likely remaining a slow, multi-decade transition rather than a rapid cutover, given NAT's continued effectiveness at delaying urgency.
- **Continued growth of HTTP/3/QUIC adoption**, likely becoming the default for latency-sensitive, high-scale web traffic over time.
- **Deepening integration of application-aware networking** (service meshes, sophisticated load balancing) as container/Kubernetes-based infrastructure continues to mature, adding intelligence atop the same foundational TCP/IP concepts.
- **What to bet on**: deeply understanding the layered model and the systematic, layer-by-layer debugging discipline this page emphasizes — these fundamentals have remained stable and relevant for over four decades and transfer directly to diagnosing ANY networked system's issues, a far more durable and valuable skill than memorizing any single protocol version's specific syntax.
`,

  "cheat-sheet": `
~~~
# ---- The layered model (top to bottom) ----
Application (HTTP, DNS)  -> Transport (TCP/UDP)  -> Network (IP)  -> Link (Ethernet/WiFi)  -> Physical

# ---- IP + Port = a socket ----
192.168.1.42:443   # IP gets you to the MACHINE, port gets you to the SERVICE

# ---- TCP three-way handshake ----
Client -> Server: SYN
Server -> Client: SYN-ACK
Client -> Server: ACK    # NOW application data can flow

# ---- TCP vs UDP ----
TCP: reliable, ordered, connection-oriented, higher overhead -> APIs, databases
UDP: unreliable, unordered, connectionless, lower overhead -> DNS, real-time audio/video, HTTP/3
~~~

~~~bash
# ---- The systematic debugging sequence (ALWAYS in this order) ----
dig api.example.com                     # 1. Does DNS resolve?
ping 203.0.113.10                        # 2. Basic reachability (ICMP only!)
nc -zv 203.0.113.10 443                   # 3. Is the specific TCP port reachable?
curl -v https://api.example.com/health     # 4. Full DNS+TCP+TLS+HTTP in one shot
~~~

~~~
# ---- Why HTTPS has more round trips ----
DNS lookup -> TCP handshake -> TLS handshake -> THEN the actual HTTP request
# Connection reuse (keep-alive, HTTP/2) avoids repaying this cost every request

# ---- HTTP/2 vs HTTP/3 ----
HTTP/2: multiplexed over ONE TCP conn -- one lost packet blocks ALL streams
HTTP/3: QUIC over UDP -- each stream has INDEPENDENT loss recovery

# ---- Production non-negotiables ----
# ALWAYS: explicit timeouts + retry-with-backoff (retryable errors only) + TLS everywhere
# NEVER: unbounded waits, retrying 4xx client errors, plaintext HTTP in prod
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What does an IP address vs a port identify? | IP = the machine. Port = the specific application/service on that machine. |
| TCP's three-way handshake? | SYN -> SYN-ACK -> ACK, before any application data flows. |
| TCP vs UDP -- core tradeoff? | TCP: reliable + ordered, higher overhead. UDP: unreliable + unordered, lower overhead. |
| What does DNS do? | Translates human-readable hostnames into the IP addresses needed for routing. |
| What does TLS provide? | Confidentiality (encryption), integrity (tamper detection), authentication (identity verification). |
| Why does HTTPS have more round trips than HTTP? | TCP handshake, THEN a TLS handshake on top, before the actual HTTP exchange. |
| The systematic debugging order? | DNS -> TCP connectivity -> TLS -> application logic. Always in that order. |
| Why does HTTP/3 use UDP (QUIC) instead of TCP? | So one lost packet only blocks its OWN stream, not every multiplexed stream on the connection. |
| What is NAT, and why does it matter? | Lets many devices share one public IP -- delayed IPv4 exhaustion's urgency for decades. |
| Why is ping insufficient for a health check? | It only confirms ICMP reachability, not that the actual application service is working. |
| What triggers TCP congestion control? | Detected packet loss -- interpreted as a congestion signal, so the sender reduces its rate. |
| Non-negotiable for every network call in production? | An explicit timeout -- never rely on an unbounded default. |
`,

  mcqs: `
1. What is the correct order of TCP's three-way handshake?
   A) ACK, SYN, SYN-ACK  B) SYN, SYN-ACK, ACK  C) SYN-ACK, SYN, ACK  D) ACK, ACK, SYN
   **Answer: B** — this must complete before any application data can flow over the connection.

2. Why would an application choose UDP over TCP?
   A) UDP is always more secure  B) UDP has lower overhead and is preferable when a lost/late packet is better discarded than retransmitted  C) UDP guarantees ordered delivery  D) UDP requires a handshake
   **Answer: B** — real-time audio/video and DNS queries are classic UDP use cases for exactly this reason.

3. What is the correct systematic order for debugging a network connectivity issue?
   A) Application logic, then TLS, then TCP, then DNS  B) DNS, then TCP connectivity, then TLS, then application logic  C) TLS, then DNS, then application, then TCP  D) There is no reliable order
   **Answer: B** — checking layers in this order prevents wasted time debugging application code when the actual failure is at a lower layer.

4. Why does HTTP/3 use QUIC (built on UDP) instead of TCP?
   A) UDP is more secure than TCP  B) Because TCP's connection-wide in-order delivery means one lost packet blocks ALL multiplexed streams, while QUIC gives each stream independent loss recovery  C) UDP is required for encryption  D) TCP doesn't support HTTP
   **Answer: B** — this directly addresses a form of head-of-line blocking present even in HTTP/2's multiplexing over TCP.

5. What does TLS provide that plain TCP does not?
   A) Faster data transfer  B) Confidentiality, integrity, and authentication via encryption and certificates  C) Guaranteed packet ordering  D) Lower latency
   **Answer: B** — TCP provides reliable, ordered delivery, but no encryption or identity verification on its own.

6. Why is ping/ICMP reachability insufficient to confirm a service is healthy?
   A) Ping doesn't work over the internet  B) It only confirms basic network-layer reachability, not that the actual application (HTTP server, database) is functioning  C) Ping requires TLS  D) Ping only works on UDP
   **Answer: B** — a proper application-level health check endpoint is needed to verify genuine service health.
`,

  "revision-notes": `
Networking is the layered set of protocols (physical, link, network, transport, application) that let independent computers exchange data reliably across the internet — the invisible substrate underlying every technology on this platform involving more than one machine. The internet's foundational packet-switching model breaks data into independently-routed packets rather than requiring a dedicated circuit per conversation, letting a shared network serve many simultaneous conversations and route around failures automatically, since each packet can take a different path and no single router needs to know the entire network topology.

IP ADDRESSING gets a packet to the right MACHINE; PORT NUMBERS get it to the right APPLICATION on that machine. TCP provides reliable, ordered delivery atop IP's fundamentally unreliable packet delivery, via a three-way handshake (SYN, SYN-ACK, ACK) establishing a connection before any application data flows, plus automatic retransmission of lost packets and reordering of out-of-order ones. UDP, by contrast, is connectionless and provides no reliability or ordering guarantee, trading this away for lower overhead — the choice between TCP and UDP fundamentally comes down to whether guaranteed, ordered delivery (TCP: most APIs, databases) or minimal latency/overhead (UDP: DNS, real-time audio/video, HTTP/3's QUIC) matters more for a given use case.

DNS translates human-readable hostnames into the numeric IP addresses actually needed for routing, via a hierarchical resolution process (recursive resolver, root nameservers, TLD nameservers, authoritative nameservers) with responses cached at multiple levels according to each record's TTL — this caching is why DNS changes can take time to fully propagate. TLS, layered atop an already-established TCP connection, provides confidentiality (encryption), integrity (tamper detection), and authentication (identity verification via certificates) — a genuinely important detail is that HTTPS requires BOTH a TCP handshake AND a subsequent TLS handshake before any actual HTTP request/response can flow, which is precisely why connection reuse (keep-alive, HTTP/2 multiplexing, TLS session resumption) provides such significant real-world performance benefits by avoiding repeated setup costs.

A genuinely important architectural detail explaining HTTP's own evolution: HTTP/2 multiplexes many requests over ONE TCP connection, but because TCP guarantees in-order delivery for the ENTIRE connection, a single lost packet blocks ALL multiplexed streams sharing it — a transport-layer form of head-of-line blocking. HTTP/3, built on QUIC over UDP instead of TCP, gives each multiplexed stream INDEPENDENT loss recovery, so a lost packet only affects its own stream — a direct illustration of how a limitation discovered at one layer (TCP) can eventually justify a significant architectural change at the layer above it (moving HTTP off TCP entirely).

The single most valuable practical networking skill is SYSTEMATIC, LAYER-BY-LAYER DEBUGGING: check DNS resolution first (dig), then basic TCP connectivity to the specific port (nc/telnet, understanding ping alone only confirms ICMP, not application health), then TLS handshake success, and only then investigate application-level logic — this discipline prevents wasted time debugging application code when the actual failure is a lower-layer issue like DNS misconfiguration or a firewall rule. Production essentials include explicit timeouts on every network call (never unbounded waits), retry logic with exponential backoff that correctly distinguishes retryable failures from permanent ones (like a 400 Bad Request, which will never succeed on retry), TLS everywhere in production, and explicit, default-deny firewall/network segmentation — because network partitions, packet loss, and latency spikes are ROUTINE, expected occurrences at any meaningful production scale, not rare edge cases, a discipline directly connecting to this platform's **Distributed Systems** and **CAP Theorem** skills.
`,

  "learning-roadmap": `
**Week 1 — The layered model and addressing fundamentals**: understanding physical/link/network/transport/application layers, IP addressing, and port numbers. Milestone: explain each layer's responsibility and correctly identify which layer a given networking concept belongs to.

**Week 2 — TCP, UDP, and the handshake**: TCP's three-way handshake, reliability/ordering mechanisms, and choosing between TCP and UDP for a given use case. Milestone: correctly explain and justify a TCP-versus-UDP choice for at least three different hypothetical application scenarios.

**Week 3 — DNS and TLS**: DNS resolution hierarchy and caching, and the TLS handshake's purpose and guarantees. Milestone: trace and explain a complete DNS resolution and TLS handshake using dig and curl -v against a real endpoint.

**Week 4 — Diagnostic tooling and systematic debugging**: dig, ping, nc, curl -v, traceroute, and the systematic layer-by-layer debugging discipline. Milestone: diagnose a deliberately-introduced connectivity issue (DNS, firewall, or TLS misconfiguration) using only command-line tools, correctly identifying the actual root cause layer.

**Week 5 — Production resilience patterns**: timeouts, retry-with-backoff, circuit breakers, and designing for network partitions as expected occurrences. Milestone: build and test an HTTP client wrapper implementing all three patterns correctly.

**Week 6 — Network architecture and security**: NAT, firewalls/security groups, network segmentation, and cloud VPC design. Milestone: design and document a segmented network architecture (public/application/database tiers) with appropriate access rules.

Next platform skill once this roadmap is complete: **TLS & HTTPS** for a deeper encryption-layer treatment, or **Load Balancers**/**CDN** to apply these fundamentals to production-scale system design.
`,

  "official-docs": `
- **RFC 791 (Internet Protocol)** and **RFC 9293 (TCP)** — the foundational IETF specifications defining IP and TCP.
- **RFC 1035 (Domain Names — Implementation and Specification)** — the foundational DNS specification.
- **RFC 8446 (TLS 1.3)** — the current TLS specification.
- **MDN Web Docs — HTTP** — comprehensive, practical documentation covering the application-layer protocols built atop the networking fundamentals covered on this page.
`,

  books: `
- **"Computer Networking: A Top-Down Approach" — Kurose and Ross** — one of the most widely used, comprehensive academic textbooks on networking, notable for its top-down (application-layer-first) teaching approach.
- **"TCP/IP Illustrated, Volume 1" — W. Richard Stevens** — a classic, deeply technical, protocol-level treatment of TCP/IP internals.
- **"High Performance Browser Networking" — Ilya Grigorik** — an excellent, practically-focused treatment of networking specifically as it affects real-world web application performance.
- **"Computer Networks" — Andrew Tanenbaum** — another long-standing, comprehensive academic reference covering the full networking stack.
`,

  blogs: `
- **Cloudflare's engineering blog** — extensive, technically deep writing on DNS, TLS, HTTP/3/QUIC, and internet infrastructure generally, from a company operating at genuinely global network scale.
- **APNIC's blog** — in-depth technical writing on internet routing, addressing, and infrastructure from a regional internet registry's perspective.
- **Julia Evans's blog (jvns.ca)** — accessible, detailed explanations of networking concepts (DNS, TCP, packet capture) written for a broad engineering audience.
- **Various cloud provider engineering blogs** documenting VPC design, load balancing, and network architecture at production scale.
`,

  "research-papers": `
- **Cerf, V. and Kahn, R. — "A Protocol for Packet Network Intercommunication"** (1974, IEEE Transactions on Communications) — the foundational paper defining TCP/IP's core concepts.
- **Mockapetris, P. — RFC 1034/1035 (Domain Names)** (1987) — the foundational DNS specification documents.
- **The QUIC and HTTP/3 IETF specifications** — the current, primary technical references for understanding the latest evolution of the application/transport layer interaction covered in this page's Advanced Concepts.
- General distributed systems literature on network partitions and the CAP theorem (covered in the **CAP Theorem** skill's own research papers section) for the theoretical grounding on how network unreliability shapes distributed system design.
`,

  videos: `
- **Various "How the Internet Works" explainer series** (from well-regarded technical YouTube channels) covering the layered model and packet routing accessibly.
- **Cloudflare's own technical talks and blog-accompanying videos** on DNS, TLS, and HTTP/3 internals.
- **Conference talks on QUIC and HTTP/3 adoption** (from IETF and major web performance conferences) covering the transport-layer motivations in depth.
- **Julia Evans's conference talks** on networking internals and debugging tools, known for accessible, precise technical explanations.
`,

  "github-repos": `
- **The Linux kernel's own networking subsystem source** (within torvalds/linux) — the actual implementation of much of the networking stack covered conceptually on this page.
- **Various "computer networking" curated learning repositories** aggregating tutorials, RFC references, and practice exercises.
- **wireshark/wireshark** — the source for the most widely used packet-capture and analysis tool, useful for genuinely deep, hands-on protocol-level learning.
- **quic-go, or similar QUIC implementation repositories** — for engineers wanting to study HTTP/3's underlying transport protocol implementation directly.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Layered model basics**: given a list of networking concepts (IP address, TCP handshake, HTTP request, Ethernet frame), correctly assign each to its proper layer.
2. **TCP vs UDP decision-making**: for a list of hypothetical application scenarios (a file transfer, a video call, a DNS query, a REST API), justify the correct transport protocol choice for each.
3. **DNS tracing**: use dig +trace against a real domain to manually observe the full resolution hierarchy (root, TLD, authoritative), documenting each step.
4. **Systematic debugging**: given a deliberately broken connectivity scenario (a firewall rule blocking a specific port), use the four-step diagnostic sequence to correctly identify the root cause.
5. **Resilience patterns**: implement a network call wrapper with timeout, retry-with-backoff, and circuit-breaker logic, testing all three patterns explicitly.
6. **External practice sets**: Cloudflare's own "How DNS Works" and "How HTTPS Works" interactive explainers for structured, visual practice with these specific concepts.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client["Client Side"]
        App["Application"]
        DNSResolver["DNS resolver (local/cached)"]
        TCPStackC["TCP/IP stack"]
    end
    subgraph Internet["Public Internet"]
        DNSHierarchy["DNS hierarchy\n(root -> TLD -> authoritative)"]
        Routers["Routers (hop-by-hop forwarding)"]
    end
    subgraph ServerSide["Server Side"]
        LB["Load balancer"]
        TLSTerm["TLS termination"]
        Server["Application server"]
    end
    App --> DNSResolver
    DNSResolver --> DNSHierarchy
    App --> TCPStackC
    TCPStackC --> Routers
    Routers --> LB
    LB --> TLSTerm
    TLSTerm --> Server
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Networking))
    Foundations
      Overview
      History ARPANET TCP/IP
      Why it exists
      Problem it solves
    Layered Model
      Physical link network transport application
      Each layer hides complexity below
    Addressing
      IP addresses and ports
      Subnetting CIDR
      NAT
    Transport
      TCP handshake reliability
      UDP tradeoffs
      Congestion control
    Naming
      DNS hierarchy
      Caching and TTL
    Security
      TLS handshake
      Confidentiality integrity authentication
      Firewalls segmentation
    HTTP Evolution
      HTTP1.1 versus HTTP2 versus HTTP3
      QUIC and head of line blocking
    Debugging
      Layer by layer discipline
      dig ping nc curl traceroute
    Resilience
      Timeouts
      Retry with backoff
      Circuit breakers
    Comparisons
      TCP versus UDP
      HTTP versions
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default networking;
