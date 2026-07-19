import type { SkillContent } from "../types";

/**
 * TLS & HTTPS — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const tlsHttps: SkillContent = {
  overview: `
TLS (Transport Layer Security) is the cryptographic protocol that turns plain HTTP into HTTPS — it wraps an ordinary TCP connection in a layer that gives you three guarantees: confidentiality (nobody on the wire can read the bytes), integrity (nobody can tamper with the bytes without detection), and authentication (you can cryptographically prove which server — and optionally which client — you are actually talking to). It sits directly on top of TCP and directly underneath the application protocol, most commonly HTTP, which is why "HTTPS" is really just "HTTP running inside a TLS tunnel." See the **Networking** skill for the TCP layer TLS rides on.

For an AI engineer this is not a niche security topic to skim. Every API call to a model provider, every webhook, every internal microservice call, every browser session to your product runs over TLS. You will configure it in load balancers, debug "certificate verify failed" errors in Python's requests or httpx, decide whether your internal service mesh needs mutual TLS, and answer for it in security reviews and interviews. Getting the mental model right — the handshake, the certificate chain, the trust store — pays off across your entire career, not just this one page.

TLS is not a single algorithm; it is a negotiated combination of building blocks: a key-exchange algorithm (usually elliptic-curve Diffie-Hellman) to agree on a shared secret over a public channel, a symmetric cipher (usually AES-GCM or ChaCha20-Poly1305) to encrypt the actual data cheaply, and a hash-based construction (HMAC/HKDF) to derive keys and check integrity. This is the textbook example of **hybrid cryptography** — asymmetric crypto is slow but solves "how do two strangers agree on a secret," symmetric crypto is fast but requires a shared secret first. TLS uses asymmetric operations once per connection to bootstrap a symmetric key, then does the bulk of the work with cheap symmetric ciphers. See the **Encryption** skill for the full symmetric-vs-asymmetric picture, and the **Hashing** skill for how HMAC/HKDF derive and verify keys inside the handshake.

Key characteristics: it is a layered protocol (record layer carries handshake, alert, and application-data sub-protocols), it is versioned (SSL 2.0/3.0 are dead, TLS 1.0/1.1 are deprecated, TLS 1.2 is legacy-but-common, TLS 1.3 is current and mandatory-track), and its trust model is a hierarchy of certificates rooted in a small set of Certificate Authorities that your operating system and browser trust by default.
`,

  history: `
TLS descends from **SSL (Secure Sockets Layer)**, designed at Netscape by a team including Taher Elgamal to secure the then-new World Wide Web for e-commerce. SSL 1.0 never shipped publicly because it had serious flaws found in internal review. SSL 2.0 shipped in 1995 and was quickly found to have design weaknesses (weak MAC construction, no protection against handshake tampering). SSL 3.0 (1996) was a near-total rewrite that fixed most of those problems and became the real foundation of everything that followed. In 1999 the IETF took over stewardship, renamed the protocol TLS to avoid trademark issues, and TLS has been an open, standards-track protocol ever since.

| Year | Milestone |
|------|-----------|
| 1994 | SSL 1.0 designed at Netscape, never released publicly (fatal flaws found pre-launch) |
| 1995 | SSL 2.0 released — first public version, later found weak |
| 1996 | SSL 3.0 released — the real foundation; later broken by the POODLE attack (2014) |
| 1999 | TLS 1.0 (RFC 2246) — IETF takes over, essentially SSL 3.1 |
| 2006 | TLS 1.1 (RFC 4346) — mitigates CBC-mode chosen-plaintext issues |
| 2008 | TLS 1.2 (RFC 5246) — SHA-256, AEAD cipher suites (GCM); the long-lived workhorse version |
| 2011–2014 | A wave of practical attacks: BEAST, CRIME, Lucky 13, Heartbleed (an OpenSSL bug, not a protocol flaw), POODLE |
| 2015 | Let's Encrypt public beta — free, automated certificates via ACME, funded by ISRG |
| 2018 | TLS 1.3 finalized as RFC 8446 after roughly four years of public drafts and formal cryptographic analysis |
| 2018 | Chrome begins marking all plain HTTP pages "Not Secure," accelerating industry-wide HTTPS adoption |
| 2020 | Major browsers deprecate TLS 1.0/1.1; CA/Browser Forum caps public certificate validity at 398 days |
| 2023–2025 | Post-quantum hybrid key exchange (X25519 combined with a lattice-based algorithm) rolls out at CDN/browser scale; Encrypted Client Hello (ECH) moves toward broader deployment |

The lesson underneath this history: almost every version bump existed to kill a real, demonstrated attack on the previous one. TLS 1.3 is not an incremental tidy-up — it is the direct result of a decade of "here is how 1.2 gets broken in practice."
`,

  "why-it-exists": `
Before SSL, the web ran entirely on plaintext HTTP. That was fine for serving static documents, but the moment anyone wanted to type a credit card number into a browser, three problems appeared that HTTP alone could never solve:

- **No confidentiality**: any router, ISP, WiFi access point, or proxy between client and server could read every byte — passwords, card numbers, session cookies, everything.
- **No integrity**: an on-path attacker could silently rewrite the response — inject ads, swap a download for malware, alter a bank balance shown on screen — and neither side would know.
- **No authentication**: you had no cryptographic way to know the server claiming to be your bank was actually your bank rather than an impostor answering on the same IP or a spoofed DNS entry.

The world before SSL/TLS treated the network as trustworthy by default, which is exactly backwards: any network you do not fully control (the public internet, coffee-shop WiFi, a shared corporate LAN, a mobile carrier's infrastructure) should be treated as hostile. TLS exists to make that hostile-network assumption survivable — it moves trust off the wire and onto cryptographic keys and a certificate hierarchy instead.
`,

  "problem-it-solves": `
TLS solves the **untrusted-network problem**: how do two parties who have never met, communicating over a channel controlled by adversaries, get confidentiality, integrity, and authenticity?

Concretely, TLS removes:

- **Eavesdropping** — a passive attacker capturing packets sees only ciphertext (plus a small amount of metadata, discussed in SNI below).
- **Tampering** — every record is protected by an authenticated encryption construction (AEAD); any bit-flip invalidates the authentication tag and the connection is torn down.
- **Impersonation** — the server certificate, validated against a trusted root, cryptographically proves the server holds the private key matching the certificate for that domain name.
- **Replay in the handshake** — nonces and fresh key material per session prevent an attacker from recording and replaying an old handshake to establish a fraudulent session.

What TLS deliberately does **not** solve:

- **Endpoint compromise** — if the server is hacked or the client device has malware, TLS protected the wire, not the endpoints. It cannot stop a phishing page that has a perfectly valid certificate for "paypa1-secure.com."
- **What the application does with the data after decryption** — TLS does not prevent SQL injection, XSS, or business-logic flaws (see the **SQL Injection**, **XSS**, and **OWASP Top 10** skills — those live entirely above the TLS layer).
- **Traffic analysis** — packet sizes and timing can leak information even when content is encrypted; TLS does not hide that you connected to a given IP, and historically did not even hide which hostname you requested (see the SNI section).
- **Application-level authentication** — TLS proves the server's identity to the client, but proving the client's identity to the server (logging a user in) is a separate concern, solved by cookies/sessions, JWTs, or OAuth (see those skills) — unless you deploy mutual TLS, covered later.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, step by step, the TLS 1.3 one-round-trip handshake and contrast it precisely with the TLS 1.2 two-round-trip handshake.
2. Describe the certificate chain of trust from a self-signed root, through an intermediate CA, to a leaf certificate, and explain exactly how a browser validates it.
3. Read an X.509 certificate and identify subject, issuer, validity period, public key, and Subject Alternative Names — and explain why SANs matter more than the Subject Common Name today.
4. Explain what the CA/Browser Forum is, why it exists, and how Let's Encrypt and the ACME protocol automated free certificate issuance.
5. Design a mutual TLS (mTLS) setup for service-to-service authentication and explain when it beats shared API keys.
6. Explain precisely why plaintext HTTP leaks data to network intermediaries, and why HSTS is still necessary even if your server always redirects HTTP to HTTPS.
7. Explain the SNI extension, why it exists, and its known privacy limitation.
8. Diagnose the most common TLS misconfigurations: expired certs, weak cipher suites, missing intermediate certificates, and mixed content.
9. Evaluate certificate pinning as a defense and articulate its operational risk.
10. Design a TLS termination architecture for a production system, including the internal plaintext-vs-mTLS tradeoff.
`,

  prerequisites: `
- **Required**: basic understanding of how a TCP connection works (three-way handshake, client/server roles) and what an HTTP request/response looks like. See the **Networking** skill for TCP fundamentals if you have not covered it — this page assumes you know a "connection" exists before encryption is layered on top of it.
- **Helpful, not required**: the **Encryption** skill (symmetric vs asymmetric cryptography, Diffie-Hellman) makes the handshake internals click faster. The **Hashing** skill (HMAC, key derivation functions, digests) makes the record-layer integrity and key-schedule sections easier.
- **For production sections**: comfort with basic Linux command-line tools (see the **Linux** skill) is useful for the openssl and curl examples.

Dependency links on this platform: **Networking** → **Encryption** / **Hashing** → this page → **Secrets Management** (protecting private keys) and **OWASP Top 10** (transport-layer protection as one item on that list) all build on TLS fluency.
`,

  "beginner-concepts": `
### What a certificate actually is, in plain terms

A TLS certificate is a small signed document that says "the holder of this private key controls this domain name, and I — a Certificate Authority you already trust — vouch for that." You can look at any certificate:

~~~bash
# Show the certificate a server presents, human-readable
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -text
~~~

The output will show you a Subject, an Issuer, a validity window, a public key, and a list of extensions — all covered in depth later in this page.

### HTTP vs HTTPS, minimally

~~~text
http://example.com/login    -> plaintext TCP, port 80 by default
https://example.com/login   -> TLS-wrapped TCP, port 443 by default
~~~

Same HTTP request and response format inside both — the only difference is whether a TLS handshake happens first, and whether the bytes that follow are encrypted. This is why HTTPS does not require a different HTTP verb, header set, or body format; TLS is a transparent tunnel underneath HTTP.

### The absolute minimum handshake mental model

1. Client says hello and lists what cryptography it supports.
2. Server picks a cipher, sends its certificate, and both sides derive a shared secret using public-key math (without ever sending the secret itself over the wire — this is the "magic" of Diffie-Hellman key exchange, covered fully in the Encryption skill).
3. Both sides now have the same symmetric key and switch to fast symmetric encryption (AES or ChaCha20) for the rest of the connection.
4. The browser only proceeds if the certificate's chain leads back to a Certificate Authority it already trusts, AND the certificate's name list matches the domain you typed.

### Seeing it happen with curl

~~~bash
curl -v https://example.com
# Look for lines like:
#   * TLSv1.3 (OUT), TLS handshake, Client hello
#   * TLSv1.3 (IN), TLS handshake, Server hello
#   * SSL certificate verify ok.
~~~

### The padlock icon and what it actually promises

The browser padlock means exactly one thing: this connection is encrypted and the server proved ownership of a certificate matching this domain, issued by a CA the browser trusts. It says NOTHING about whether the site is trustworthy, honest, or safe — a phishing site can absolutely have a perfectly valid, padlock-earning certificate. This confusion is one of the most common beginner misunderstandings and a genuine production security issue (see Anti-Patterns and Security).

### Ports and URL schemes

~~~text
Scheme  Default port   Protocol underneath
http    80             plain TCP
https   443             TLS over TCP
~~~

Common beginner trap: assuming HTTPS is "HTTP plus a login step" — it is not. It is the exact same HTTP, wrapped in an encrypted tunnel that exists before any HTTP bytes are exchanged at all.
`,

  "intermediate-concepts": `
### The building blocks TLS negotiates

Every TLS handshake picks three independent things, together sometimes loosely called a "cipher suite":

~~~text
Key exchange:      how client and server agree on a shared secret
                    (TLS 1.3: (EC)DHE only — ephemeral Diffie-Hellman, elliptic-curve or finite-field)
Bulk cipher + mode: how application data is encrypted
                    (AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305 — all AEAD in TLS 1.3)
Hash for the PRF/HKDF: which hash function derives keys and computes the Finished/MAC values
                    (SHA-256 or SHA-384)
~~~

In TLS 1.3 the negotiable list shrank to five AEAD cipher suites total — a deliberate simplification that removed dozens of legacy, individually-breakable combinations that existed in TLS 1.2 (static RSA key exchange, CBC-mode ciphers, RC4, 3DES, MD5/SHA-1 MACs).

### Certificates in practice: generating and inspecting

~~~bash
# Generate a private key and a self-signed cert for local development
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem \\
  -days 365 -nodes -subj "/CN=localhost"

# Check expiry, subject, and issuer quickly
openssl x509 -in cert.pem -noout -dates -subject -issuer

# Verify a certificate chain against the system trust store
openssl verify -CAfile chain.pem leaf.pem
~~~

### Certificate chain, in practice

A production certificate is never presented alone — it comes with one or more **intermediate certificates** so the client can build the full chain without needing every intermediate pre-installed:

~~~text
Leaf cert (yourdomain.com)
   signed by  ->  Intermediate CA cert
                     signed by  ->  Root CA cert (already in the OS/browser trust store)
~~~

A server that forgets to send the intermediate certificate ("incomplete chain") often still "works" in Chrome (which can fetch the missing intermediate via the Authority Information Access extension) but fails hard in curl, most HTTP client libraries, and older mobile OS versions that don't do this chasing — a classic production bug covered in Common Errors.

### TLS in Python — a working client

~~~python
import ssl
import socket

context = ssl.create_default_context()  # verifies hostname + chain by default

with socket.create_connection(("example.com", 443), timeout=5) as sock:
    with context.wrap_socket(sock, server_hostname="example.com") as tls_sock:
        cert = tls_sock.getpeercert()
        print(cert["subject"])
        print(cert["notAfter"])
~~~

Production note: never call ssl._create_unverified_context() or pass verify equals False in requests/httpx outside of a throwaway local script — it silently disables both chain and hostname validation, turning HTTPS into "encrypted, but talking to anyone."

### HSTS in practice

~~~text
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
~~~

max-age is in seconds (63072000 is about two years), includeSubDomains extends the rule to every subdomain, and preload is a request to be baked directly into browser source code so even the very first-ever visit to your domain is HTTPS-only (see the internal-working and security sections for why this header exists at all).

### SNI in practice

~~~bash
# Ask specifically for the cert matching one hostname on a shared IP
openssl s_client -connect 93.184.216.34:443 -servername example.com
~~~

Without -servername, a server hosting many domains on one IP (any CDN, any shared load balancer) would not know which certificate to present — this is exactly what the SNI extension solves, covered fully in Advanced Concepts.
`,

  "advanced-concepts": `
### TLS 1.3's key schedule — how the shared secret becomes several keys

TLS never uses one raw shared secret directly as an encryption key. It runs the (EC)DHE shared secret through **HKDF** (HMAC-based Key Derivation Function — see the **Hashing** skill for HMAC internals) in a layered schedule: an Early Secret (from a pre-shared key or zero if none), combined into a Handshake Secret (mixed with the DHE shared secret), combined into a Master Secret, from which separate keys are derived for client-handshake-traffic, server-handshake-traffic, client-application-traffic, and server-application-traffic. Deriving separate keys per direction and per phase means compromising one traffic key does not expose the others, and it is why TLS 1.3 can encrypt the Certificate message itself — something TLS 1.2 could never do because its keys weren't ready that early.

### Forward secrecy, precisely

Forward secrecy means: if an attacker records today's encrypted traffic and steals the server's long-term private key next year, they still cannot decrypt today's traffic. TLS 1.3 makes this mandatory by requiring ephemeral (EC)DHE key exchange for every single handshake — the server's certificate key only ever signs the exchange, it never directly encrypts data. TLS 1.2 optionally supported "static RSA" key exchange, where the client encrypted the shared secret directly with the server's long-term RSA public key — if that private key ever leaked, every past recorded session became decryptable. This is precisely the class of catastrophic risk Heartbleed created: a memory-disclosure bug in OpenSSL that could leak a server's private key, and any traffic recorded under non-forward-secret cipher suites became retroactively breakable.

### 0-RTT resumption — speed versus replay risk

For a client resuming a previous TLS 1.3 session, the server can issue a Pre-Shared Key (PSK) ticket; on the next connection the client can send encrypted application data in its very first flight, before the handshake even completes ("0-RTT"). This is extremely fast but has a real weakness: a network attacker can capture that first encrypted flight and replay it verbatim, and the server has no cryptographic way to distinguish a replay from the original — because there's no fresh randomness exchanged yet. The mitigation is architectural, not cryptographic: only allow 0-RTT for requests that are safe to receive twice (idempotent, side-effect-free, e.g. a GET), never for anything that spends money, changes state, or sends an email exactly once.

### Session resumption without 0-RTT

Both TLS versions support cheaper reconnection: TLS 1.2 used session IDs or session tickets; TLS 1.3 unifies this behind the PSK mechanism used for 0-RTT (but you can use the PSK for a normal 1-RTT resumption too, which avoids the replay risk while still skipping a full asymmetric handshake). Production load balancers must share a session ticket encryption key across all their nodes, or resumption silently fails whenever a client's next request lands on a different node — a real, non-obvious scaling gotcha.

### SNI's privacy gap and Encrypted Client Hello (ECH)

Server Name Indication sends the target hostname in the ClientHello, in the clear, so a shared-IP server knows which certificate to present before any encryption keys exist. The side effect: any passive observer (an ISP, a censor, a coffee-shop WiFi operator) can see which hostname you are connecting to even though the rest of the session is encrypted — HTTPS hides the URL path and page content but historically not the domain name. Encrypted Client Hello wraps the entire ClientHello (including SNI) in an outer, encrypted layer using a public key the client fetches from DNS (an HTTPS/SVCB resource record), closing this gap where deployed — as of my knowledge, ECH is live at meaningful scale behind Cloudflare and in current versions of Firefox and Chrome, but is not yet universal; verify current rollout status if it matters for your threat model.

### Downgrade protection

TLS 1.3 embeds special "downgrade sentinel" values in the ServerRandom field specifically so that if an active attacker strips the modern version options from a handshake to force a fallback to TLS 1.2 or 1.1, the client can detect the sentinel and abort — a direct, engineered response to real-world downgrade attacks (like POODLE, which relied on forcing a fallback to SSL 3.0).

### Cipher suite negotiation decision table

| Scenario | What actually gets negotiated | Why |
|----------|-------------------------------|-----|
| Modern browser to modern server, both TLS 1.3 | X25519 key share + AES-128-GCM or ChaCha20-Poly1305 | Fastest, forward-secret by default, hardware-accelerated on most CPUs (AES-NI) or fast in software (ChaCha20 on mobile) |
| Legacy client stuck on TLS 1.2 | ECDHE-RSA or ECDHE-ECDSA key exchange + AES-GCM | Server should disable static RSA key exchange and CBC-only suites even at 1.2 |
| Old embedded device, no TLS 1.2 support | Should be rejected outright in production | Supporting TLS 1.0/1.1 reintroduces BEAST/POODLE-class exposure for the whole fleet |
| mTLS internal service mesh | ECDHE + AES-GCM, both sides present client certs | Identity is proven cryptographically, not by network location |
`,

  "internal-working": `
### The TLS 1.3 handshake, message by message (1 round trip)

~~~mermaid
flowchart TD
    A["Client: ClientHello\\n(supported versions, cipher suites,\\nkey_share guess e.g. X25519, SNI)"] --> B["Server: ServerHello\\n(chosen cipher, its key_share)"]
    B --> C["Both sides now compute the same\\nshared secret via ECDHE and derive\\nhandshake traffic keys via HKDF"]
    C --> D["Server (encrypted from here):\\nEncryptedExtensions, Certificate,\\nCertificateVerify, Finished"]
    D --> E["Client verifies cert chain + hostname,\\nverifies CertificateVerify signature,\\nverifies server Finished"]
    E --> F["Client sends its own Finished\\n(encrypted) -- handshake complete"]
    F --> G["Application data flows both ways,\\nencrypted with application traffic keys"]
~~~

Because the client guesses which key-exchange group the server will accept and sends its key share in the very first message, the server can derive the shared secret and start sending encrypted data (certificate included) in its very first reply. The client can send its Finished message, and application data, right after — meaning useful application data can flow after just one round trip. That single change (predictive key_share) is the core reason TLS 1.3 needs only 1-RTT instead of 2.

### The TLS 1.2 handshake, message by message (2 round trips)

~~~mermaid
flowchart TD
    A["Client: ClientHello"] --> B["Server: ServerHello, Certificate,\\nServerKeyExchange, ServerHelloDone"]
    B --> C["Client verifies cert, computes\\npre-master secret, sends\\nClientKeyExchange"]
    C --> D["Client: ChangeCipherSpec, Finished"]
    D --> E["Server: ChangeCipherSpec, Finished"]
    E --> F["Application data flows both ways"]
~~~

TLS 1.2 negotiates the cipher suite and THEN separately exchanges key material in a second flight, and both sides must explicitly signal "switching to encryption now" via ChangeCipherSpec before their Finished messages — an extra flight that TLS 1.3 eliminates entirely by folding key agreement into the very first exchange and making encryption implicit the moment keys exist.

### Why 1.3 is faster AND more secure, not a tradeoff between the two

Faster: one fewer round trip before application data flows (roughly half the added latency of the handshake, which matters enormously on high-latency mobile networks), plus optional 0-RTT for resumed connections.

More secure, for reasons that are mechanically tied to the same redesign: (1) forward secrecy is mandatory because static RSA key exchange was removed entirely, not merely made optional; (2) the handshake transcript is authenticated end-to-end via the Finished MACs covering every prior message, closing gaps attackers had exploited to inject or truncate messages; (3) everything after ServerHello is encrypted, including the certificate, reducing what a passive observer can fingerprint; (4) the cipher suite list was cut from dozens of combinations (many individually broken over the years) to five AEAD suites, removing whole attack classes (CBC-padding oracles like Lucky 13, RC4 biases, compression-based CRIME) by construction rather than by configuration discipline.

### The record layer underneath all of this

Both handshake messages and application data travel inside TLS records — small framed units with a type, version, length, and (post-handshake) an authenticated ciphertext. AEAD ciphers combine encryption and a MAC-equivalent authentication tag in one primitive, so a single verify-and-decrypt operation both restores the plaintext and confirms it hasn't been tampered with; TLS 1.2's older CBC-then-HMAC ("MAC-then-encrypt" in some suites) construction is exactly what padding-oracle attacks like Lucky 13 exploited, which is another reason TLS 1.3 requires AEAD only.
`,

  architecture: `
A senior engineer needs both the **protocol architecture** (how TLS layers relate) and the **system architecture** (where TLS termination physically happens in a real deployment).

### Protocol layering

~~~mermaid
flowchart TB
    subgraph App["Application layer"]
        HTTP["HTTP / HTTP-2 / gRPC / WebSocket messages"]
    end
    subgraph TLSLayer["TLS"]
        Handshake["Handshake protocol\\n(negotiate keys + identity)"]
        Record["Record protocol\\n(frame + AEAD-encrypt everything)"]
        Alert["Alert protocol\\n(signal errors / close_notify)"]
    end
    subgraph Transport["Transport layer"]
        TCP["TCP (or QUIC for HTTP/3, TLS 1.3 built in)"]
    end
    HTTP --> Record
    Handshake --> Record
    Alert --> Record
    Record --> TCP
~~~

HTTP itself has zero awareness that TLS exists — it just writes bytes to what looks like a normal reliable stream. The Handshake and Alert sub-protocols are themselves carried as record types, which is why TLS libraries expose a single socket-like abstraction to the application.

### System architecture: where TLS lives in a real deployment

~~~text
Internet
   |
   v
[ CDN edge / Cloudflare, Akamai ] --terminates TLS, caches static assets
   |  (re-encrypts, TLS to origin)
   v
[ Load balancer / reverse proxy: nginx, Envoy, ALB ] --terminates TLS
   |
   +--> plaintext HTTP inside trusted VPC  --- OR ---  mTLS to every backend
   |
   v
[ Application services ]  <---- mTLS between services in a mesh (Istio/Linkerd)
   |
   v
[ Databases, caches ]  <---- TLS to managed DB/Redis is standard in cloud providers
~~~

The recurring architectural decision (expanded fully in Production Usage and Scalability) is: terminate TLS as close to the edge as practical for CPU efficiency and centralized certificate management, then decide deliberately — per compliance requirement and threat model — whether internal hops stay plaintext (fast, simple, relies on network isolation) or get re-encrypted with mTLS (slower, but each hop authenticates independently, which matters if you cannot fully trust your internal network, e.g. multi-tenant clusters or strict zero-trust policies).
`,

  "data-flow": `
Trace one full HTTPS page load, from a cold TCP connection to the first byte of response body:

~~~mermaid
sequenceDiagram
    participant C as Client (browser)
    participant N as Network
    participant S as Server

    C->>N: TCP SYN
    N->>S: TCP SYN
    S->>N: TCP SYN-ACK
    N->>C: TCP SYN-ACK
    C->>N: TCP ACK
    Note over C,S: TCP connection established (see Networking skill)

    C->>S: ClientHello (SNI=example.com, key_share, cipher list)
    S->>C: ServerHello (chosen cipher, key_share)
    Note over C,S: Both derive shared secret via ECDHE + HKDF
    S->>C: EncryptedExtensions, Certificate, CertificateVerify, Finished (all encrypted)
    C->>C: Validate cert chain to trusted root, check hostname vs SAN, verify signature
    C->>S: Finished (encrypted)
    Note over C,S: TLS 1.3 handshake complete in 1 round trip

    C->>S: Encrypted HTTP GET /index.html
    S->>C: Encrypted HTTP 200 + response body
    Note over C,S: Connection often kept alive and reused for subsequent requests
~~~

Two facts fall out of this trace that explain a huge amount of real-world behavior: first, the TCP handshake happens BEFORE any TLS bytes exist — TLS cannot start until a reliable byte stream is already established, which is why a TCP-level problem (firewall, MTU, packet loss) looks identical to a "TLS is broken" symptom until you check with a plain TCP tool first. Second, hostname validation happens entirely on the CLIENT after receiving the certificate — the server never "checks" whether it's serving the right domain; it just presents whatever certificate the SNI-selected virtual host is configured with, and the client decides whether to trust it.
`,

  "production-usage": `
### Where TLS termination actually happens

Almost no production team hand-rolls TLS inside application code. The standard pattern is to terminate TLS at a dedicated layer:

- **CDN / edge** (Cloudflare, Akamai, Fastly) for public-facing traffic — handles certificate issuance/renewal automatically ("Universal SSL"), absorbs the handshake CPU cost at the edge, and can re-encrypt to origin.
- **Reverse proxy / load balancer** (nginx, Envoy, HAProxy, cloud-managed ALB/NLB) for anything not behind a CDN, or as the next hop after one.
- **Kubernetes ingress controllers** with cert-manager automating issuance via ACME (Let's Encrypt) directly against Kubernetes Ingress/Certificate resources.

### A representative modern nginx TLS config

~~~nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;      # never enable 1.0/1.1 in production
    ssl_ciphers HIGH:!aNULL:!MD5;       # let TLS 1.3 use its own fixed AEAD suites
    ssl_prefer_server_cipher_order off; # client ordering is fine for 1.3-era clients

    ssl_session_cache shared:SSL:10m;   # session resumption across workers
    ssl_stapling on;                    # OCSP stapling -- avoid a client round trip
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
~~~

### Certificate automation with ACME / cert-manager

~~~yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: example-com-tls
spec:
  secretName: example-com-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - example.com
    - www.example.com
~~~

cert-manager watches this resource, talks the ACME protocol to Let's Encrypt, completes an HTTP-01 or DNS-01 challenge automatically, and renews well before the 90-day expiry — the operational default on this platform's own recommended stack, and on essentially every serious Kubernetes deployment today.

### Operational defaults worth adopting

Minimum TLS 1.2, prefer 1.3; disable compression (CRIME mitigation); rotate certificates automatically, never manually; monitor expiry with real alerting, not a calendar reminder; keep private keys out of git and container images entirely (see the **Secrets Management** skill).
`,

  "industry-examples": `
- **Cloudflare**: operates "Universal SSL," automatically issuing and renewing certificates for every domain behind its edge network, terminating TLS for a very large share of the public web's traffic; also a leading driver of Encrypted Client Hello deployment and post-quantum hybrid key exchange at scale.
- **Let's Encrypt (Internet Security Research Group)**: the nonprofit CA that made free, automated, short-lived (90-day) certificates the industry default via the ACME protocol — directly responsible for the web's shift from "most sites are HTTP" to "most sites are HTTPS" over roughly a decade.
- **Google**: pushed HTTPS adoption aggressively through Chrome's "Not Secure" warnings on plain HTTP pages and HTTPS as a search-ranking signal; also maintains BoringSSL, a widely used TLS implementation fork of OpenSSL used inside Chrome and Google's own infrastructure.
- **Netflix and other large streaming/microservice shops**: use mutual TLS extensively for service-to-service authentication inside their internal networks, issuing short-lived per-service certificates automatically rather than relying on static shared secrets between services.
- **Meta/Facebook**: operates one of the largest internal mTLS deployments in the industry as part of a "zero trust" internal network model — every internal RPC call is both encrypted and mutually authenticated rather than relying on the internal network perimeter for trust.
- **Istio / service-mesh adopters broadly**: automatically issue and rotate short-lived workload identity certificates (via SPIFFE/SPIRE-style identities) so every pod-to-pod call in a Kubernetes cluster is mTLS-authenticated without any application code change — a pattern directly relevant to this platform's own microservice-style backend, where an auth service, a billing service, and a skills API talking to each other internally are exactly the kind of traffic mTLS is designed to protect.

Pattern to notice: the entire industry has converged on the same idea from two directions — automate public certificate issuance completely (Let's Encrypt/ACME) and automate internal certificate issuance completely (service mesh mTLS) — because manual certificate management does not survive contact with real operational scale.
`,

  "best-practices": `
1. **Terminate TLS at a dedicated layer** (CDN, load balancer, ingress controller) rather than inside application code — centralizes cert management and keeps crypto libraries patched in one place.
2. **Automate issuance and renewal end to end** (ACME/cert-manager/Let's Encrypt) — manual certificate renewal is one of the single most common causes of production outages.
3. **Support TLS 1.2 and 1.3 only**; disable 1.0/1.1 entirely — they carry known, exploitable weaknesses with no legitimate reason to keep them on in 2026.
4. **Always send the full chain, not just the leaf certificate** — missing intermediates break non-browser clients silently (see Common Errors).
5. **Enable HSTS with a long max-age and includeSubDomains**, and submit to the preload list for anything security-sensitive — closes the first-request-is-still-plaintext gap.
6. **Enable OCSP stapling** — the server fetches its own revocation status and hands it to the client, avoiding an extra client-side round trip to a CA's OCSP responder (which is also a privacy leak of which sites a user visits).
7. **Prefer ECDSA certificates over RSA where client support allows** — smaller signatures, faster handshakes, lower CPU per connection at scale.
8. **Use short-lived certificates and automate rotation** — a 90-day certificate that auto-renews is safer in practice than a 2-year certificate someone might forget, and it shrinks the blast radius if a key ever leaks.
9. **Monitor certificate expiry with real alerting** (30/14/7/1 day thresholds), not tribal knowledge — expired certificates are entirely preventable outages.
10. **Use mTLS for service-to-service auth inside zero-trust or multi-tenant environments** rather than static API keys passed over plaintext internal networks.
11. **Never disable certificate verification in application HTTP clients**, even "temporarily" — it has a well-documented habit of surviving into production.
12. **Keep private keys out of source control and container images**; fetch them from a secrets manager or mount them at runtime (see the **Secrets Management** skill).
`,

  "anti-patterns": `
### Disabling certificate verification "just to get past an error"

~~~python
# WRONG — silently accepts any certificate from anyone, including an attacker
import requests
requests.get("https://api.example.com/data", verify=False)

# RIGHT — fix the actual chain problem (missing intermediate, wrong CA bundle,
# or a genuinely expired/misconfigured cert) instead of muting the check
import requests
requests.get("https://api.example.com/data", verify="/etc/ssl/certs/ca-bundle.crt")
~~~

verify=False (or the shell-level curl -k) does not "temporarily relax" security — it removes hostname AND chain validation entirely, turning an authenticated encrypted channel into merely an encrypted one to whoever answers.

### Sending only the leaf certificate

~~~text
WRONG:  server presents only leaf.pem
        -> Chrome may still work (fetches missing intermediate via AIA)
        -> curl, most non-browser clients, older mobile OSes: fail with
           "unable to get local issuer certificate"

RIGHT:  server presents fullchain.pem (leaf + intermediate(s), in order)
        -> works everywhere, no client-side guessing required
~~~

### Treating the padlock as a trust signal for the SITE rather than the CONNECTION

The padlock proves the connection is encrypted and the domain is authenticated — it says nothing about whether the domain belongs to a legitimate business. Training users (or your own product copy) to "look for the padlock" as an anti-phishing measure is actively misleading; phishing domains routinely have valid certificates.

### Long-lived, manually managed certificates

Two-year (or longer) manually tracked certificates rot into "nobody remembers who owns renewal" outages. Prefer 90-day automated certificates — the shorter lifetime forces automation to exist, which removes the human failure mode entirely.

### Rolling your own crypto or hand-parsing certificates

Writing custom X.509 parsing, custom TLS record handling, or a homegrown "lightweight" handshake is a decades-long list of subtly broken reimplementations. Use a maintained, audited TLS library (OpenSSL, BoringSSL, rustls, the platform's own OS-provided stack) — never hand-roll this layer.

### HPKP-style aggressive pinning without a backup plan

Pinning a certificate or public key and then rotating it without first deploying the new pin is a self-inflicted outage — exactly why browser-level HTTP Public Key Pinning was deprecated (see Advanced Concepts/Security). If you pin at all, always pin at least two keys (current plus next) and have a tested rollback path.
`,

  performance: `
### Measure before optimizing

~~~bash
# Full external grading of a live server's TLS configuration
# (SSL Labs' online scanner is the standard first stop)

# Local/CLI check of protocol versions, ciphers, and known weaknesses
testssl.sh https://example.com

# Time exactly how long the handshake itself takes
curl -w "connect: %{time_connect} tls: %{time_appconnect} total: %{time_total}\\n" \\
  -o /dev/null -s https://example.com
~~~

### The optimization hierarchy, applied in order

1. **Use TLS 1.3** — collapses the handshake from 2 round trips to 1, the single biggest latency win available, especially on high-latency mobile networks (can shave 100+ ms off connection setup on a slow link).
2. **Enable session resumption** (session tickets / PSK) so repeat visitors skip the full asymmetric handshake entirely — turns a 1-RTT handshake into effectively 0 extra round trips for the crypto negotiation.
3. **Enable OCSP stapling** so the client never has to make a separate round trip to a CA's revocation responder before trusting the certificate.
4. **Prefer ECDSA over RSA certificates** — elliptic-curve signatures are dramatically cheaper to verify and produce than RSA at equivalent security levels, which matters directly to handshake CPU cost at high connections-per-second.
5. **Keep connections alive and reuse them (HTTP keep-alive / HTTP-2 multiplexing)** — the handshake cost is paid once per connection, not once per request; connection reuse amortizes it to near zero for subsequent requests.
6. **Terminate TLS on hardware/software with AES-NI (or use ChaCha20-Poly1305 on hardware without it)** — AES-GCM is essentially free on modern server CPUs with AES-NI; ChaCha20 is the better choice on hardware lacking that instruction set (many mobile devices).
7. **Consider HTTP/3 (QUIC)** for very lossy or high-latency networks — QUIC integrates TLS 1.3 directly into the transport and can complete connection setup in fewer round trips than TCP+TLS layered separately, and avoids TCP head-of-line blocking entirely.

### Numbers worth knowing

A full TLS 1.3 handshake typically adds roughly one network round trip of latency versus a bare TCP connection; TLS 1.2 typically added two. On a transcontinental connection (roughly 100 ms round trip), that difference alone is on the order of 100 ms saved per new connection — which is exactly why every major browser and CDN pushed hard for 1.3 adoption.
`,

  scalability: `
TLS scales the way most stateless request-handling infrastructure scales — horizontally — with two TLS-specific wrinkles: handshake CPU cost and session-state sharing across nodes.

~~~mermaid
flowchart LR
    Client --> CDN["CDN edge -- terminates TLS,\\ncaches, absorbs most handshake load"]
    CDN --> LB["Load balancer -- terminates TLS\\nfor origin traffic"]
    LB --> N1["App node 1"]
    LB --> N2["App node 2"]
    LB --> N3["App node N"]
    LB -.session ticket key.-> SharedStore[("Shared session-ticket key store\\n(so resumption works\\nregardless of which node answers)")]
~~~

### Bottleneck table

| Bottleneck | Cause | Answer |
|------------|-------|--------|
| Handshake CPU at high connections/sec | Asymmetric crypto (signature verify, key exchange) is far more expensive than symmetric | Prefer ECDSA over RSA; terminate at the edge/CDN to spread load; enable session resumption to skip full handshakes on repeat connections |
| Session resumption "randomly" failing at scale | Each load-balanced node generated its own session-ticket encryption key | Share one ticket-encryption key (rotated regularly) across every terminating node |
| Double encryption cost internally | Re-encrypting with mTLS on every internal hop in a service mesh | Usually still worth it for zero-trust guarantees; mitigate with hardware-accelerated ciphers and sidecar proxies (Envoy) that specialize in this |
| Cert renewal at fleet scale | Manually rotating certificates across hundreds of nodes | Fully automate with ACME/cert-manager; treat certificates as short-lived, disposable, and self-renewing |
| Cold-start handshake latency | New connections pay the full handshake round trip | Keep-alive connections, HTTP/2 multiplexing, or HTTP/3 (QUIC) to reduce how often a full handshake is needed |

The single biggest scalability decision most teams face is exactly the TLS-termination architecture question from earlier: terminate once at the edge and trust the internal network (cheaper, simpler, faster to scale) versus mTLS everywhere (more CPU and operational overhead, but no internal hop is ever implicitly trusted).
`,

  security: `
### TLS-specific attack surface

1. **Downgrade attacks** — forcing a handshake to fall back to a weaker, breakable version (the mechanism behind POODLE against SSL 3.0). TLS 1.3's downgrade sentinels are the direct engineered defense.
2. **Weak/legacy cipher suites left enabled** — RC4 (statistical biases), 3DES (birthday-bound block size), CBC-mode padding oracles (Lucky 13, and the related BEAST/POODLE family) — the fix is disabling them at the server, not just avoiding them at the client.
3. **Implementation bugs, not protocol bugs** — Heartbleed was a buffer over-read bug in OpenSSL's heartbeat extension handling, unrelated to any TLS protocol weakness, and it could leak private keys and in-memory secrets directly from a running server. Lesson: patch your TLS library aggressively; the protocol being sound does not protect you from an implementation flaw.
4. **Certificate mis-issuance / CA compromise** — if any trusted CA is compromised or coerced into issuing a fraudulent certificate for a domain it doesn't control, an attacker can perform an authenticated-looking man-in-the-middle. Certificate Transparency logs (public, append-only logs of every issued certificate, which browsers now require for public trust) exist specifically so mis-issuance can be detected after the fact.
5. **Client code disabling verification** — the single most common real-world TLS vulnerability in application code is not a protocol flaw at all; it is a developer setting verify=False, -k, or an equivalent flag to silence a certificate error during development that then ships to production.
6. **Corporate TLS-inspecting proxies and root-CA injection** — some corporate/security appliances install a private root CA on managed devices and MITM all TLS traffic to inspect it; this is "legitimate" only when the device owner consented and controls the root store — the exact same mechanism is what a malicious actor would need for a real MITM, which is why the trust-store model matters so much (see Certificate Pinning tradeoffs, covered as its own topic in Advanced/Comparisons context, and in the misconfiguration discussion above).

### Where TLS composes with other security skills on this platform

TLS protects data in transit; it says nothing about data at rest (see the **Encryption** skill for that), passwords (see the **Hashing** skill for proper password hashing, separate from TLS entirely), request forgery (see **CSRF**), or injected scripts (see **XSS**) — all of which operate entirely inside the TLS tunnel and are unaffected by how good your TLS configuration is. Treat TLS as necessary but nowhere near sufficient; the **OWASP Top 10** skill situates "insufficient transport layer protection" as one item among many, not the whole picture.

### Secrets hygiene for TLS itself

Private keys are secrets like any other — never commit them to git, never bake them into container images, rotate them on a schedule, and fetch them from a secrets manager or platform-native TLS integration at runtime (see the **Secrets Management** skill).
`,

  testing: `
### Tools that actually exercise a TLS configuration

~~~bash
# Comprehensive external grading (protocol versions, cipher strength, known CVEs)
testssl.sh https://staging.example.com

# Confirm the full chain resolves and verifies, exactly as a real client would
openssl s_client -connect staging.example.com:443 -servername staging.example.com \\
  -verify_return_error </dev/null

# Confirm HSTS header is actually present and correctly configured
curl -sI https://staging.example.com | grep -i strict-transport-security
~~~

### Local development certificates that behave like real ones

~~~bash
# mkcert creates a locally-trusted CA and issues real, browser-trusted
# certificates for localhost/dev domains -- no verify=False anywhere
mkcert -install
mkcert localhost 127.0.0.1 ::1
~~~

Using mkcert instead of disabling verification in development means your test suite exercises the exact same certificate-validation code path that production uses — the senior-level testing doctrine here is: never test with verification off, because that is precisely the code path most likely to silently regress.

### Automated tests around your own TLS-dependent code

~~~python
import pytest
import ssl
import requests

def test_client_rejects_expired_certificate(expired_cert_server):
    """Uses a local test server presenting a deliberately expired cert."""
    with pytest.raises(requests.exceptions.SSLError):
        requests.get(expired_cert_server.url, timeout=2)

def test_client_rejects_hostname_mismatch(wrong_hostname_server):
    with pytest.raises(requests.exceptions.SSLError, match="hostname"):
        requests.get(wrong_hostname_server.url, timeout=2)
~~~

### The senior testing doctrine for TLS

Test the FAILURE paths deliberately (expired cert, wrong hostname, self-signed cert, revoked cert) rather than only the happy path — an HTTP client that "works" against a valid cert but has never been tested against an invalid one has an unverified security boundary. Include TLS configuration checks (testssl.sh or equivalent) as a CI/CD gate before deploying any change to a load balancer or ingress configuration, not as an occasional manual audit.
`,

  debugging: `
### The toolbox, in escalation order

1. **curl -v** — the first stop for "is my HTTPS endpoint even reachable and what does the handshake look like":

~~~bash
curl -v https://example.com 2>&1 | grep -i -A2 "SSL certificate\\|TLS handshake"
~~~

2. **openssl s_client** — a raw TLS client that shows you exactly what the server presents, including the full chain and the negotiated protocol/cipher:

~~~bash
openssl s_client -connect example.com:443 -servername example.com -showcerts
~~~

3. **Browser DevTools Security tab** — for a running page, shows the negotiated protocol version, cipher suite, and certificate chain the browser actually accepted, including any mixed-content warnings.

4. **Check the TCP layer FIRST if the handshake never even starts** — a "connection reset" or timeout before any TLS bytes appear is almost always a firewall, security group, or routing problem, not a certificate problem; a plain nc or telnet to the port disambiguates instantly.

5. **Wireshark** — captures the handshake in full detail (ClientHello/ServerHello, extensions, alerts); note that TLS 1.3 encrypts almost everything past ServerHello, so you cannot decrypt application data without the session keys — for genuine decryption during debugging, set the SSLKEYLOGFILE environment variable so your TLS library logs session keys Wireshark can use, only ever in a controlled debugging environment, never in production.

6. **Read the TLS alert code, not just "it failed"** — alerts like certificate_expired, unknown_ca, bad_certificate, and handshake_failure each point at a different layer of the problem (time/validity, trust store, chain/hostname, and cipher-suite mismatch respectively).

### Common debugging sequence for "works in browser, fails in my script"

Browsers do more automatic recovery than most HTTP client libraries (fetching missing intermediates via AIA, more lenient about certain edge cases) — when a script fails where a browser succeeds, suspect a missing intermediate certificate first, then check whether the script's CA bundle is stale or points at the wrong trust store.
`,

  monitoring: `
### What to measure

- **Days until certificate expiry**, per domain, with alerting thresholds well before the deadline — this is the single highest-value TLS metric because it converts a total-outage failure mode into a routine, low-urgency renewal task.
- **Handshake failure rate**, broken down by TLS alert type — a spike in unknown_ca or bad_certificate often means a botched deployment; a spike in handshake_failure often means a client population using an unsupported protocol version or cipher.
- **Protocol version and cipher suite distribution** across real traffic — tells you when it's actually safe to drop TLS 1.2 support, rather than guessing.
- **Handshake latency (p50/p95/p99)** — a regression here often points at a misconfigured OCSP stapling setup or a session-ticket-key mismatch across load-balancer nodes.

### Instrumentation example

~~~python
import ssl
import socket
import datetime
from prometheus_client import Gauge

CERT_EXPIRY_DAYS = Gauge(
    "tls_certificate_expiry_days",
    "Days until the certificate for a monitored host expires",
    ["hostname"],
)

def check_certificate_expiry(hostname: str, port: int = 443) -> None:
    """Fetch the live certificate and record days until expiry."""
    context = ssl.create_default_context()
    with socket.create_connection((hostname, port), timeout=5) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as tls_sock:
            cert = tls_sock.getpeercert()
            expires = datetime.datetime.strptime(
                cert["notAfter"], "%b %d %H:%M:%S %Y %Z"
            )
            days_left = (expires - datetime.datetime.utcnow()).days
            CERT_EXPIRY_DAYS.labels(hostname=hostname).set(days_left)
~~~

Run this on a schedule (a cron job or a dedicated exporter) against every production hostname, and alert at 30/14/7/1-day thresholds — most certificate-expiry outages are entirely preventable with this one gauge wired into a dashboard.

### What NOT to rely on

A calendar reminder or "someone will remember" is not monitoring — certificate expiry is one of the most common, most preventable production outages in the entire industry precisely because teams treat it as a manual process instead of an automated, alerted metric.
`,

  deployment: `
### A production-grade Kubernetes Ingress with automated certificates

~~~yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # automates ACME issuance
    nginx.ingress.kubernetes.io/ssl-redirect: "true"    # force HTTPS
spec:
  tls:
    - hosts:
        - example.com
      secretName: example-com-tls    # cert-manager populates and renews this
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
~~~

Per-line reasoning: the cluster-issuer annotation delegates ALL certificate lifecycle (issuance, ACME challenge completion, renewal) to cert-manager rather than any human; ssl-redirect enforces HTTPS at the ingress so no code path can accidentally serve plaintext; the secretName is a Kubernetes Secret cert-manager writes to and continuously refreshes — application pods never handle the private key directly, the ingress controller does.

### Serving topology

- **Public traffic**: CDN or load balancer terminates TLS, handles certificate rotation centrally.
- **Internal service-to-service traffic**: either plaintext inside a fully trusted VPC (simpler, faster, common for single-tenant infra) or mTLS via a service mesh sidecar (Istio/Linkerd inject Envoy proxies that handle mTLS transparently, no application code changes) when zero-trust guarantees are required.
- **Health checks**: TLS termination points need their own /healthz that does NOT require a valid client certificate, so orchestrator liveness/readiness probes aren't accidentally blocked by an mTLS policy meant for real traffic.

### CI/CD gate

lint the TLS/ingress configuration → run testssl.sh or equivalent against a staging deployment → confirm certificate auto-renewal is actually wired up (not just present at initial deploy) → deploy with a rolling update → verify the new pods present the expected certificate before shifting traffic.
`,

  "production-checklist": `
Before a service takes real HTTPS traffic:

- [ ] TLS 1.2 and 1.3 only; TLS 1.0/1.1 and all SSL versions explicitly disabled
- [ ] Full certificate chain served (leaf + intermediates), verified with a non-browser client (curl/openssl), not just a browser
- [ ] Certificate issuance and renewal fully automated (ACME/cert-manager or CDN-managed), zero manual steps
- [ ] Certificate expiry monitored with alerting at 30/14/7/1-day thresholds
- [ ] Strict-Transport-Security header set with a long max-age and includeSubDomains; preload submitted for security-sensitive domains
- [ ] All HTTP traffic redirected to HTTPS at the edge/load balancer, not left to individual services
- [ ] OCSP stapling enabled
- [ ] Only modern, AEAD cipher suites enabled; weak/legacy suites (RC4, 3DES, CBC-only) disabled
- [ ] No application code path can set verify=False / -k / equivalent in production configuration
- [ ] Private keys never committed to git or baked into container images; sourced from a secrets manager at runtime
- [ ] Internal service-to-service traffic's trust model deliberately chosen (plaintext-in-VPC vs mTLS), documented, not accidental
- [ ] Session-ticket keys shared consistently across all load-balanced TLS-terminating nodes
- [ ] Mixed-content audit done on any page served over HTTPS (no HTTP subresources)
- [ ] Downgrade/handshake-failure alerting in place to catch client-compatibility regressions early
- [ ] Runbook exists for "certificate expired unexpectedly" and "CA/ACME provider outage" scenarios
`,

  "common-mistakes": `
1. **Letting a certificate expire** — because renewal was manual, or automation quietly broke and nobody was alerted; the single most common TLS-related outage in the industry.
2. **Serving only the leaf certificate** — works in some browsers via AIA chasing, breaks in curl/most SDKs/older mobile clients; always serve the full chain.
3. **Disabling certificate verification to "fix" a dev error** and shipping that flag to production — turns an authenticated channel into merely an encrypted one.
4. **Leaving TLS 1.0/1.1 enabled "for compatibility"** long after any real client population needs them — keeps known-weak protocol versions reachable for zero benefit.
5. **Assuming the padlock means the site is trustworthy** — it only means the connection is encrypted and the domain name matches a certificate; phishing sites have valid certificates too.
6. **Forgetting HSTS**, assuming "we always redirect HTTP to HTTPS server-side is enough" — the very first request before any redirect happens is still plaintext and interceptable; HSTS is what closes that gap.
7. **Mixed content**: loading images/scripts/styles over plain HTTP on an HTTPS page — browsers block or warn on this, and it reintroduces a tampering surface on an otherwise-secure page.
8. **Pinning certificates aggressively without a rotation plan** — causes self-inflicted outages when the pinned key is rotated and old app versions can no longer connect.
9. **Sharing a private key across many servers without proper access control**, or worse, checking it into source control — a leaked key requires revocation and reissuance across everything that used it.
10. **Not testing failure paths** (expired, wrong-hostname, revoked certificates) — teams routinely test only the happy-path handshake, leaving the actual security boundary unverified.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| NET::ERR_CERT_AUTHORITY_INVALID / unknown_ca | Self-signed cert, or a missing intermediate breaking chain-building | Serve the full chain; use a publicly trusted CA (Let's Encrypt) for anything public |
| ERR_CERT_DATE_INVALID | Certificate expired, or server/client clock is wrong | Renew the certificate (automate it); check system clock/NTP |
| SSL_ERROR_BAD_CERT_DOMAIN / hostname mismatch | Certificate's SAN list doesn't include the hostname you requested | Reissue with the correct SAN entries; check you're hitting the intended virtual host |
| unable to get local issuer certificate (curl/openssl) | Server sent only the leaf certificate, no intermediate | Configure the server to send fullchain.pem, not just the leaf |
| handshake_failure / no shared cipher suite | Client and server have no overlapping supported protocol version or cipher suite | Check for a very old client or an overly restrictive server cipher config; verify TLS 1.2 is still enabled if legacy clients exist |
| SSL: CERTIFICATE_VERIFY_FAILED (Python) | Missing/outdated CA bundle, corporate proxy injecting its own root, or a genuinely invalid cert | Update certifi/OS CA bundle; install the corporate root CA properly if that's the real cause; never silence with verify=False |
| Mixed content warning/blocked resource | HTTPS page loading an HTTP subresource | Change the resource URL to HTTPS, or make it protocol-relative/relative |
| ERR_SSL_PROTOCOL_ERROR | Server not actually listening with TLS on that port, or a proxy misrouting plaintext to a TLS port | Confirm the service is actually configured for TLS on that port; check load balancer listener configuration |
| revoked certificate warning | Certificate was revoked (key compromise, CA policy) but client still tries to use it | Reissue a fresh certificate immediately; investigate why revocation happened |

Debugging habit that matters: reproduce with openssl s_client first — it shows you exactly what the server sends, without any browser-side "helpful" auto-recovery masking the real problem.
`,

  faqs: `
**Q: Is HTTPS mandatory for all websites, even ones with no login or sensitive data?**
Effectively yes today — browsers label plain HTTP "Not Secure," search engines rank HTTPS higher, and free automated certificates (Let's Encrypt) removed the cost/effort excuse entirely. There is no longer a good reason to serve any production site over plain HTTP.

**Q: Does HTTPS slow down my site?**
Negligibly with TLS 1.3 and modern hardware — the handshake adds roughly one round trip on a fresh connection, amortized to near-zero with session resumption and connection reuse. The security and SEO benefits dwarf this cost.

**Q: What's the difference between a domain-validated (DV), organization-validated (OV), and extended-validation (EV) certificate?**
DV only proves you control the domain (what Let's Encrypt issues, in seconds, automatically). OV/EV additionally verify organizational identity through a manual process. Browsers today display DV, OV, and EV certificates almost identically in the address bar, so EV's practical security/UX benefit over DV is much smaller than it once was — most of the industry has standardized on automated DV.

**Q: Do I need mTLS for my internal microservices?**
Only if your threat model requires it — if your internal network is a single trusted VPC with strong network-level isolation, plaintext internal traffic is a common, defensible choice. If you're in a multi-tenant environment, have strict compliance requirements, or want genuine zero-trust guarantees (no implicit trust from network location alone), mTLS via a service mesh is the standard answer.

**Q: What happened with Heartbleed — was that a flaw in TLS itself?**
No — Heartbleed was a memory-safety bug in OpenSSL's implementation of the (optional) TLS heartbeat extension, not a flaw in the TLS protocol design. It's the canonical example of why "the protocol is sound" and "your specific implementation is safe" are different claims, and why staying current on TLS library patches matters as much as protocol version choice.

**Q: Should I still support TLS 1.0 or 1.1 for legacy clients?**
Almost certainly not in 2026 — both are deprecated by every major browser and carry known weaknesses; the tiny remaining client population using them is generally better served by an explicit "please upgrade" message than by reintroducing known-weak cryptography for your entire fleet.

**Q: What is certificate pinning and should I use it?**
Pinning a specific certificate or public key in a client (typically a mobile app) so it rejects any other certificate, even one from a trusted CA. It defends against CA compromise/mis-issuance but has bricked real production apps when teams rotated keys without updating the pin first — use it deliberately, with a tested rotation plan, generally only in mobile apps you fully control, not for general web traffic.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What does HTTPS actually add on top of HTTP?* Confidentiality (encryption), integrity (tamper detection via AEAD), and server authentication (via a validated certificate) — same HTTP semantics underneath, wrapped in a TLS tunnel.
2. *What is inside an X.509 certificate?* Subject, issuer, validity period (notBefore/notAfter), the subject's public key, and extensions including Subject Alternative Names, which browsers now check instead of the Subject Common Name.
3. *Why does a certificate need a chain rather than just being self-signed?* So the browser can verify it back to a small, pre-installed set of trusted root CAs without needing to hard-code every possible server's certificate; the chain (leaf signed by intermediate, intermediate signed by root) lets trust be delegated and rotated without re-shipping browsers.
4. *What is SNI and why does it exist?* An extension where the client states the target hostname in the ClientHello, so a server hosting many domains on one IP knows which certificate to present before any encryption exists — necessary because the HTTP Host header (which would otherwise identify the site) is inside the encrypted layer.
5. *If my server always redirects HTTP to HTTPS, do I still need HSTS?* Yes — the very first request, before any redirect can happen, is still sent in plaintext and can be intercepted/rewritten by an on-path attacker (SSL-stripping); HSTS tells the browser to never even attempt plaintext again for that domain.

**Senior:**

6. *Walk through the TLS 1.3 handshake and explain why it's one round trip.* Client sends ClientHello with a predicted key_share; server responds with ServerHello plus its own key_share, and both sides can now derive the shared secret and handshake traffic keys, letting the server send its (encrypted) Certificate/CertificateVerify/Finished in that same reply; the client verifies and sends its Finished, and application data can flow right after — collapsing what TLS 1.2 split across two separate flights into one.
7. *Why is TLS 1.3 considered more secure, not just faster?* Forward secrecy is mandatory (static RSA key exchange removed entirely), the handshake transcript is authenticated end-to-end, everything past ServerHello is encrypted, and the cipher suite list was cut to five AEAD-only combinations, removing whole historical attack classes (CBC padding oracles, RC4 bias, compression-based CRIME) by construction.
8. *Explain forward secrecy and why Heartbleed was so damaging in combination with its absence.* Forward secrecy means a leaked long-term private key can't decrypt past sessions, because each session used an ephemeral key. Heartbleed could leak a server's private key from memory; on connections that used non-forward-secret (static RSA) key exchange, any traffic recorded earlier become retroactively decryptable once that key leaked — forward secrecy (mandatory in 1.3) closes exactly this exposure.
9. *Design the TLS termination architecture for a multi-tenant Kubernetes platform. What do you decide about internal traffic?* Terminate public TLS at the ingress/load balancer with automated cert issuance (cert-manager/ACME); for internal pod-to-pod traffic, given multi-tenancy, choose mTLS via a service mesh sidecar (Istio/Linkerd) rather than trusting the network perimeter, since different tenants sharing infrastructure means the internal network itself cannot be assumed trustworthy.
10. *What's the tradeoff with certificate pinning, and why did browsers drop HPKP?* Pinning defends against CA compromise/mis-issuance but is brittle — rotating the pinned key/cert without first shipping the new pin to clients bricks connectivity. Browsers removed HPKP specifically because this operational risk (self-inflicted outages) outweighed its marginal security benefit versus newer defenses like Certificate Transparency monitoring.
11. *Explain 0-RTT resumption's replay risk and how you'd mitigate it in a real API.* 0-RTT lets a resuming client send encrypted application data before the handshake completes using a PSK, but an attacker can capture and replay that exact first flight, and the server has no fresh randomness yet to detect the replay; mitigate by only allowing 0-RTT for idempotent, side-effect-free operations (e.g., GETs) and rejecting it for anything that mutates state or spends money.
12. *How does SNI leak information even over an otherwise-encrypted connection, and what fixes it?* SNI is sent in cleartext in the ClientHello so a shared-IP server knows which certificate to present, meaning any passive observer can see which hostname you're connecting to. Encrypted Client Hello (ECH) fixes this by encrypting the entire ClientHello using a public key fetched via DNS, hiding the SNI value from network observers where deployed.
`,

  "coding-questions": `
### 1. Verify a certificate's expiry and hostname match programmatically

~~~python
import ssl
import socket
import datetime

def check_https_endpoint(hostname: str, port: int = 443, timeout: float = 5.0) -> dict:
    """Connect, verify the chain + hostname (default context does both),
    and return expiry info. Raises ssl.SSLCertVerificationError on failure."""
    context = ssl.create_default_context()
    with socket.create_connection((hostname, port), timeout=timeout) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as tls_sock:
            cert = tls_sock.getpeercert()
            not_after = datetime.datetime.strptime(
                cert["notAfter"], "%b %d %H:%M:%S %Y %Z"
            )
            days_remaining = (not_after - datetime.datetime.utcnow()).days
            return {
                "subject": dict(x[0] for x in cert["subject"]),
                "issuer": dict(x[0] for x in cert["issuer"]),
                "days_remaining": days_remaining,
                "san": [entry[1] for entry in cert.get("subjectAltName", [])],
            }

# Usage: raises immediately if the chain or hostname doesn't validate --
# the ssl module does both checks by default via create_default_context().
info = check_https_endpoint("example.com")
assert info["days_remaining"] > 0
~~~

Complexity: O(1) network round trip plus certificate parsing. Follow-ups: add a timeout-based retry with backoff; extend it to walk and print the full chain via cert_der/get_verified_chain in newer Python versions; turn it into the Prometheus exporter shown in Monitoring.

### 2. Simulate a minimal Diffie-Hellman key exchange (teaches the handshake's core idea)

~~~python
import secrets

# Small numbers for teaching purposes only -- real TLS uses elliptic-curve
# groups (X25519) or large safe-prime finite fields, never numbers this small.
P = 23   # public prime (modulus)
G = 5    # public generator

def generate_keypair():
    private = secrets.randbelow(P - 2) + 1     # never reused, never sent
    public = pow(G, private, P)                 # safe to send in the clear
    return private, public

def shared_secret(their_public: int, my_private: int) -> int:
    return pow(their_public, my_private, P)

# Both sides only ever exchange the "public" values over the network
alice_priv, alice_pub = generate_keypair()
bob_priv, bob_pub = generate_keypair()

alice_secret = shared_secret(bob_pub, alice_priv)
bob_secret = shared_secret(alice_pub, bob_priv)
assert alice_secret == bob_secret   # both derived the SAME secret
# without either side ever transmitting alice_priv or bob_priv
~~~

Discussion points: this is exactly the "how do two strangers agree on a secret over a public channel" problem from Why It Exists; real TLS 1.3 uses X25519 (elliptic-curve) for smaller keys and faster computation at equivalent security, and this raw exchange has no authentication at all yet — that's what the certificate and CertificateVerify signature add on top.

### 3. Parse and validate a certificate chain manually (senior-flavored)

~~~python
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.x509.verification import PolicyBuilder, Store

def validate_chain(leaf_pem: bytes, intermediate_pem: bytes, root_pem: bytes, hostname: str):
    """Build and verify a chain using the cryptography library's
    verification API (a modern, auditable alternative to hand-rolling this)."""
    leaf = x509.load_pem_x509_certificate(leaf_pem, default_backend())
    intermediate = x509.load_pem_x509_certificate(intermediate_pem, default_backend())
    root = x509.load_pem_x509_certificate(root_pem, default_backend())

    store = Store([root])
    builder = PolicyBuilder().store(store)
    verifier = builder.build_server_verifier(x509.DNSName(hostname))
    chain = verifier.verify(leaf, [intermediate])
    return chain   # raises VerificationError on any failure (expiry, signature, name)
~~~

Complexity: O(chain length) signature verifications. Follow-ups: what happens if the intermediate is missing (verification fails, matching the real-world curl error); what happens if the leaf is expired (fails at the date-check step); how would you also check OCSP/CRL revocation status (a separate network call this function doesn't make).
`,

  "hands-on-labs": `
### Lab 1 — Inspect and compare handshakes (beginner, about 1 hour)
Use openssl s_client against three different sites and record the negotiated TLS version, cipher suite, and whether the full chain was sent. Then use curl -v against the same three and compare what each tool reports. Deliverable: a short table of findings. Skills: reading a live handshake, recognizing TLS 1.2 vs 1.3 negotiation, spotting a missing intermediate.

### Lab 2 — Stand up HTTPS locally with a trusted certificate (intermediate, about 2 hours)
Install mkcert, generate a locally-trusted certificate for localhost, and serve a simple app (any framework) over HTTPS using it. Then deliberately break it three ways: use an expired cert, a wrong-hostname cert, and no cert at all — observe exactly how your HTTP client (not just the browser) reports each failure. Skills: local TLS setup, reading validation error types, the difference between browser and library error recovery behavior.

### Lab 3 — Automate certificate issuance with ACME (intermediate/advanced, about 3 hours)
Using a real domain you control (or a staging ACME endpoint to avoid rate limits), run Certbot to obtain a certificate via the HTTP-01 challenge, install it into an nginx config, and confirm auto-renewal is scheduled. Then deploy the same idea in Kubernetes using cert-manager against a ClusterIssuer. Deliverable: both configs, plus a paragraph on what each step of the ACME protocol actually proved. Skills: ACME challenge types, cert-manager, real production TLS automation.

### Lab 4 — Build and instrument a certificate-expiry monitor (production, about 3 hours)
Take the monitoring code from this page, extend it to check a list of hostnames, expose it as a Prometheus exporter, and wire an alert rule for less than 14 days remaining. Then deliberately let a self-signed test certificate "expire" (or use a short-lived one) and confirm the alert fires. Skills: the full monitoring section, end to end, plus the operational discipline that prevents the single most common TLS-related outage.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **TLS configuration auditor** — A CLI/service that takes a list of hostnames, runs testssl.sh-equivalent checks (protocol versions, cipher strength, chain completeness, HSTS presence, OCSP stapling), and produces a scored report with remediation guidance. Demonstrates: deep protocol knowledge, tooling integration, and the ability to translate crypto details into actionable findings — directly relevant to security-engineering and platform-engineering roles.

2. **mTLS-secured microservice mesh demo** — Two or three small services (e.g., an API, an auth service, a billing service, mirroring this platform's own conceptual architecture) that authenticate each other via mutual TLS, with short-lived certificates issued by a private CA you stand up (step-ca is a good fit), automatic rotation, and a demonstration that a service presenting no certificate or an untrusted one is rejected. Demonstrates: PKI operations, service-to-service auth design, and zero-trust architecture thinking.

3. **Certificate lifecycle automation pipeline** — A full ACME-based pipeline: domain ownership proven via DNS-01 challenge, certificate issued by Let's Encrypt staging, deployed to a load balancer/ingress, renewal automated well before expiry, and expiry monitored with alerting (reusing the exporter from Lab 4). Demonstrates: the complete production TLS operational story end to end, from issuance to observability.

Each project: documented architecture diagram, a README explaining every security decision made (and why), and — where relevant — a small test suite exercising both the happy path and the failure paths (expired/wrong-hostname/untrusted certs). The engineering discipline around the crypto is what gets senior interviews, not the crypto math itself.
`,

  "case-studies": `
### Let's Encrypt: democratizing HTTPS for the entire web
Before 2015, obtaining a certificate typically cost money and required a manual, often clunky validation process — a real barrier for small sites, hobby projects, and anyone in a lower-resource environment. Let's Encrypt, backed by the Internet Security Research Group with support from major browser vendors and infrastructure companies, made certificates free and issuance fully automatable via the ACME protocol. Lesson: removing cost and manual friction from a security control is often more impactful at internet scale than any single cryptographic improvement — adoption is a distribution problem as much as a technical one.

### Heartbleed: an implementation bug, not a protocol flaw, with protocol-level consequences
A 2014 buffer over-read in OpenSSL's heartbeat extension let an attacker read arbitrary chunks of a server's memory, including private keys, session data, and user credentials, from millions of servers running the affected OpenSSL versions. Because many of those servers used non-forward-secret cipher suites, previously recorded encrypted traffic became retroactively decryptable once a leaked key was recovered. Lesson: "TLS is theoretically sound" and "this specific server is safe today" are different claims — implementation quality and forward secrecy (mandatory in TLS 1.3) both matter as independent layers of defense.

### DigiNotar: what happens when a Certificate Authority itself is compromised
In 2011, a Dutch Certificate Authority, DigiNotar, was breached, and the attacker issued fraudulent certificates for major domains (including Google properties), which were then used in real man-in-the-middle attacks against users, notably in Iran. Browsers responded by permanently distrusting DigiNotar's root, and the incident directly accelerated industry investment in Certificate Transparency (public logs of every certificate issued, so mis-issuance can be detected quickly) and stricter CA audit requirements via the CA/Browser Forum. Lesson: the entire chain-of-trust model is only as strong as its weakest trusted CA, which is why detection mechanisms (CT logs) matter alongside prevention.

### Chrome's "Not Secure" labeling: a UX change that moved the whole web
Starting around 2018, Chrome began visibly marking plain HTTP pages as "Not Secure" in the address bar, escalating in visibility over subsequent releases. Combined with HTTPS as a search-ranking signal and free automated certificates already being available, this single browser UX decision converted "HTTPS is nice to have" into "HTTPS is the assumed default" across the industry within a few years. Lesson: security defaults enforced at the client/browser level can shift industry-wide behavior faster than any amount of developer education alone.
`,

  comparisons: `
| Dimension | TLS 1.2 | TLS 1.3 | mTLS | VPN / IPsec | Application-level auth (JWT/OAuth) |
|-----------|---------|---------|------|-------------|--------------------------------------|
| What it protects | Transport confidentiality/integrity/server auth | Same, stronger and faster | Transport + mutual (both sides) authentication | Whole-network tunnel, any protocol | Identity/authorization at the application layer |
| Round trips to first data | 2 | 1 (0 with resumption) | 1 (both sides present certs) | Handshake varies by protocol | N/A — rides on top of an existing TLS connection |
| Forward secrecy | Optional (static RSA key exchange still allowed) | Mandatory | Mandatory (built on TLS 1.3 typically) | Depends on configuration | Not applicable — this is a different layer |
| Proves client identity? | No (server-only auth by default) | No (server-only auth by default) | Yes — this is the whole point | Depends on auth method used | Yes, but at the application layer, not the transport layer |
| Typical use case | Legacy compatibility, still common | Default choice for anything new | Service-to-service auth in zero-trust/microservice environments | Site-to-site or remote-access network-level trust | User login sessions, API authorization |
| Operational overhead | Moderate | Lower (simpler negotiation, fewer suites) | Higher (per-service certs, rotation, revocation) | Higher (tunnel/gateway infrastructure) | Lower (mostly application code + a token store) |

**How seniors choose**: use TLS 1.3 by default everywhere and keep 1.2 only for genuine legacy-client compatibility; reach for mTLS specifically when you need cryptographic proof of WHICH service is calling you (not just that the network path is private) — typically inside a service mesh; use a VPN when you need whole-network-level trust between sites or remote workers rather than per-connection application trust; use JWT/OAuth for proving WHO a human user is, layered on top of a TLS connection that already protects the wire — these are complementary, not competing, choices, and most real production systems combine several of them at once.
`,

  "related-technologies": `
- **Encryption** — the symmetric/asymmetric cryptography TLS is built from; understand this first to make the handshake internals click.
- **Hashing** — HMAC and HKDF, the machinery behind TLS's key derivation and integrity checks; also relevant to certificate fingerprints.
- **Networking** — the TCP layer TLS rides on top of, and DNS, which is involved in both hostname resolution and, increasingly, in Encrypted Client Hello's key discovery.
- **Secrets Management** — where private keys should actually live in production, never in source control or container images.
- **OWASP Top 10** — situates transport-layer protection as one of many web application security concerns, alongside injection, broken authentication, and others.
- **OAuth / JWT** — application-layer identity and authorization that typically runs inside an already-established TLS connection; TLS proves the server, these prove the user.
- **Let's Encrypt / ACME / cert-manager** — the modern automated-issuance stack most production teams actually run.
- **Service mesh (Istio/Linkerd concepts)** — the standard way mTLS gets deployed transparently across microservices without application code changes.
- **HTTP/2 and HTTP/3 (QUIC)** — modern transport protocols that either assume TLS (HTTP/2 in practice) or integrate it directly into the transport (QUIC/HTTP/3), both changing the performance calculus discussed in this page's Performance section.

On this platform, the natural next pages: **Encryption** → **Hashing** → this page → **Secrets Management** → **OWASP Top 10**, with **Networking** as useful background at any point in that order.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early 2026) — check the IETF TLS working group pages and major CA/browser vendor blogs for anything newer.

- **TLS 1.3 (RFC 8446) is the settled default** across major browsers, CDNs, and server stacks; TLS 1.0 and 1.1 are broadly deprecated and disabled by default in current browser releases.
- **Encrypted Client Hello (ECH)** has moved from experimental to real deployment behind major CDNs (notably Cloudflare) and is supported in current versions of Firefox and Chrome, closing the historical SNI cleartext-hostname gap where fully deployed — coverage is not yet universal across the web; verify current adoption if your threat model depends on it.
- **Post-quantum hybrid key exchange** (combining a classical elliptic-curve exchange like X25519 with a lattice-based post-quantum algorithm) is being rolled out at meaningful scale by major browsers and CDNs, as a hedge against future quantum-capable adversaries recording today's traffic for later decryption ("harvest now, decrypt later"). Treat exact algorithm names and rollout percentages as something to verify against current vendor documentation rather than memorize as fixed facts.
- **Certificate lifetimes continue trending shorter** — the CA/Browser Forum's Baseline Requirements have already cut maximum public certificate validity substantially from the historical multi-year norm, and further reductions have been discussed/adopted in forum ballots, reinforcing that automation (ACME/cert-manager) is now a requirement, not a convenience.
- **HTTP/3 (QUIC) adoption** continues to grow, which matters here because QUIC integrates TLS 1.3 directly into the transport rather than layering it on top of TCP, changing some of the performance tradeoffs discussed in this page.
`,

  "future-roadmap": `
Where transport security is heading over the next few years:

1. **Post-quantum migration becomes mandatory, not optional.** As lattice-based and other post-quantum algorithms mature and standardize further, expect hybrid classical-plus-post-quantum key exchange to become the default rather than an opt-in experiment, driven by the "harvest now, decrypt later" threat model — data encrypted today could be recorded and decrypted years from now once quantum computing matures.
2. **Encrypted Client Hello reaching near-universal deployment**, finally closing the last major plaintext-metadata leak in an otherwise fully encrypted connection.
3. **Certificate lifetimes keep shrinking**, pushing the entire industry further toward fully automated issuance and rotation — any team still manually managing certificates will find that operational model increasingly unsustainable as maximum validity periods continue to fall.
4. **mTLS and service-mesh-based zero-trust models keep expanding** inside large organizations, as the assumption that an internal network can be implicitly trusted continues to erode industry-wide.
5. **QUIC/HTTP-3 adoption keeps growing**, further blurring the line between "the transport" and "TLS" since QUIC bakes TLS 1.3 in natively rather than layering it separately on top of TCP.

For your career: understanding the TLS 1.3 handshake deeply, being fluent in certificate lifecycle automation (ACME), and knowing when and why to reach for mTLS are the three things that separate "knows HTTPS has a padlock" from "can design a production transport-security architecture" — bet your learning time there rather than on protocol trivia from deprecated versions.
`,

  "cheat-sheet": `
~~~text
--- Ports & schemes ---
http://  -> plaintext TCP, port 80
https:// -> TLS over TCP, port 443

--- TLS 1.3 handshake (1-RTT) ---
Client: ClientHello (versions, ciphers, key_share guess, SNI)
Server: ServerHello (chosen cipher, key_share)
        -> both derive shared secret via ECDHE + HKDF
Server: EncryptedExtensions, Certificate, CertificateVerify, Finished (all encrypted)
Client: verifies chain + hostname + signature, sends Finished
        -> application data flows

--- TLS 1.2 handshake (2-RTT) ---
Client: ClientHello
Server: ServerHello, Certificate, ServerKeyExchange, ServerHelloDone
Client: ClientKeyExchange, ChangeCipherSpec, Finished
Server: ChangeCipherSpec, Finished
        -> application data flows

--- Certificate chain ---
Root CA (self-signed, in trust store)
  -> signs -> Intermediate CA
       -> signs -> Leaf/server certificate
Serve fullchain.pem (leaf + intermediates), never just the leaf.

--- X.509 fields worth knowing ---
Subject / Issuer / Validity (notBefore, notAfter)
Subject Public Key Info (algorithm + key)
Extensions: SAN (hostnames), Basic Constraints (is this a CA?),
  Key Usage / Extended Key Usage, Authority Information Access (OCSP/AIA)

--- Common commands ---
openssl s_client -connect host:443 -servername host -showcerts
openssl x509 -in cert.pem -noout -dates -subject -issuer
openssl verify -CAfile chain.pem leaf.pem
curl -v https://host
testssl.sh https://host

--- Production essentials ---
TLS 1.2 + 1.3 only; disable 1.0/1.1
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
OCSP stapling on
Automate issuance/renewal: ACME (Let's Encrypt) / cert-manager
Never verify=False / curl -k in production code
Private keys: secrets manager, never git, never image layers

--- mTLS ---
Both client and server present certs; both verify each other.
Use for service-to-service auth in zero-trust / service-mesh setups.

--- SNI ---
Client sends target hostname in ClientHello (cleartext) so a
shared-IP server knows which cert to present. ECH encrypts this.
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| How many round trips before app data in TLS 1.3 vs 1.2? | 1 round trip (1.3) vs 2 round trips (1.2) before application data flows |
| Why is TLS 1.3 forward-secret by default? | Static RSA key exchange was removed; only ephemeral (EC)DHE is allowed, so a leaked long-term key can't decrypt past sessions |
| What is a certificate chain? | Leaf cert signed by an intermediate CA, signed by a root CA already in the trust store — lets browsers verify without hard-coding every server's cert |
| What does SNI solve? | Lets a server hosting many domains on one IP know which certificate to present, since the encrypted HTTP Host header isn't available yet |
| What does HSTS solve that "always redirect to HTTPS" doesn't? | The very first request before any redirect happens is still plaintext and interceptable; HSTS tells the browser to never attempt plaintext again |
| What's inside an X.509 certificate? | Subject, issuer, validity period, public key, and extensions including Subject Alternative Names |
| What is ACME? | The protocol (RFC 8555) that lets a CA automatically validate domain control and issue a certificate, e.g. via Let's Encrypt |
| What is mTLS? | Mutual TLS — both client and server present certificates, so each side authenticates the other |
| Was Heartbleed a TLS protocol flaw? | No — it was a memory-safety bug in OpenSSL's implementation of the heartbeat extension |
| Why did browsers drop HPKP (public key pinning)? | Rotating a pinned key without updating clients first caused real outages; the operational risk outweighed the benefit |
| What replaced 15 dozen legacy cipher suites in TLS 1.3? | Five AEAD-only cipher suites |
| What is OCSP stapling for? | The server fetches its own revocation status and hands it to the client, avoiding an extra client round trip and a privacy leak |
| What's the risk of 0-RTT resumption? | Captured early data can be replayed by an attacker; only safe for idempotent, side-effect-free requests |
| What does the padlock icon actually prove? | The connection is encrypted and the domain matches a CA-validated certificate — nothing about the site's trustworthiness |
| What is the CA/Browser Forum? | The consortium of CAs and browser vendors that sets baseline requirements like maximum certificate validity and issuance rules |
`,

  mcqs: `
**1. How many network round trips does a full TLS 1.3 handshake typically need before application data flows?**

A) 0  B) 1  C) 2  D) 3

**Answer: B** — the client's predictive key_share lets the server respond with everything needed (including its encrypted certificate) in one reply; TLS 1.2 needed 2.

**2. Why is a missing intermediate certificate often invisible in a browser but breaks curl or most SDKs?**

A) Browsers ignore certificate errors  B) Browsers can fetch missing intermediates via the Authority Information Access extension, most non-browser clients don't  C) curl doesn't support TLS 1.3  D) SDKs always disable verification

**Answer: B** — browsers do extra chain-building work (AIA chasing) that most HTTP client libraries and older mobile stacks don't perform.

**3. What made Heartbleed catastrophic on connections using static RSA key exchange specifically?**

A) It broke AES encryption directly  B) It could leak the server's private key, and without forward secrecy, previously recorded traffic became retroactively decryptable once that key leaked  C) It only affected TLS 1.3  D) It was a DDoS vulnerability

**Answer: B** — the bug leaked server memory including private keys; forward-secret cipher suites would have limited the blast radius to future sessions only.

**4. What does the Strict-Transport-Security header actually prevent that a server-side HTTP-to-HTTPS redirect alone does not?**

A) Expired certificates  B) An on-path attacker intercepting and rewriting the very first plaintext request before any redirect happens  C) Weak cipher suites  D) Missing intermediate certificates

**Answer: B** — this is the classic SSL-stripping gap; HSTS tells the browser to never issue a plaintext request to that domain again after the first HSTS-bearing response (or immediately, if preloaded).

**5. Why does SNI need to send the hostname in the clear in classic TLS?**

A) For performance reasons only  B) So the server can select the correct certificate before the encrypted layer's keys exist yet, since the request happens before any encryption is established  C) Because HTTP requires it  D) It doesn't — SNI is always encrypted

**Answer: B** — Encrypted Client Hello (ECH) is the newer mechanism specifically designed to close this gap where deployed.

**6. What is the main operational risk of certificate/public-key pinning?**

A) It makes handshakes slower  B) It requires a new CA  C) Rotating the pinned certificate or key without first updating clients can break connectivity entirely for anyone on the old pin  D) It's incompatible with TLS 1.3

**Answer: C** — this exact risk is why browser-level HPKP was deprecated; app-level pinning still requires a careful, tested rotation plan.
`,

  "revision-notes": `
**Core mental model in a few lines:** TLS wraps a TCP connection to add confidentiality, integrity, and server authentication. It uses hybrid cryptography — expensive asymmetric operations (ECDHE key exchange, certificate signatures) run once per handshake to bootstrap a shared secret, then cheap symmetric AEAD ciphers (AES-GCM, ChaCha20-Poly1305) protect the actual data, with HMAC/HKDF deriving and verifying keys throughout.

**Handshake in a few lines:** TLS 1.3 collapses key negotiation into the first message exchange (client predicts a key_share) so application data can flow after just one round trip, and makes forward secrecy mandatory by removing static RSA key exchange entirely. TLS 1.2 needed two full round trips because key exchange and cipher negotiation happened in separate flights, and it optionally allowed the weaker, non-forward-secret static RSA path.

**Certificates in a few lines:** An X.509 certificate binds a public key to a subject (including Subject Alternative Names, which matter more than the legacy Common Name field today), signed by an issuer. A chain runs from a self-signed root CA (pre-installed in the trust store) through zero or more intermediates down to the leaf server certificate; browsers validate by walking that chain, checking signatures and validity dates, checking revocation, and matching SANs against the requested hostname. Serve the full chain, not just the leaf.

**Production in a few lines:** Terminate TLS at a dedicated layer (CDN, load balancer, ingress) rather than in application code; automate issuance and renewal completely via ACME (Let's Encrypt) or cert-manager; enable HSTS, OCSP stapling, and modern-only cipher suites; monitor expiry with real alerting; decide deliberately whether internal service-to-service traffic is plaintext-in-a-trusted-VPC or mTLS-everywhere, rather than defaulting to whichever is easiest.

**Interview reflexes:** 1-RTT vs 2-RTT handshake and why, forward secrecy and its relationship to Heartbleed-class leaks, why HSTS matters even with a server-side redirect, what SNI leaks and how ECH fixes it, the operational risk of certificate pinning, and the plaintext-vs-mTLS internal-traffic tradeoff for a service architecture.
`,

  "learning-roadmap": `
A realistic path to production-grade TLS fluency (adjust pace to your background):

**Week 1 — Foundations and the mental model.** Overview through Prerequisites, plus Beginner Concepts. Run curl -v and openssl s_client against a handful of real sites; read the certificates you get back. Milestone: you can explain HTTP vs HTTPS and describe a certificate's key fields out loud.

**Week 2 — The handshake, cold.** Internal Working and Data Flow sections; do Lab 1 (compare handshakes across sites). Draw the TLS 1.3 handshake from memory, then the TLS 1.2 one, and explain precisely where the extra round trip goes. Milestone: you can whiteboard both handshakes without notes.

**Week 3 — Certificates and trust in depth.** Intermediate and Advanced Concepts, plus Lab 2 (local HTTPS with mkcert, then deliberately break it three ways). Milestone: you can explain chain validation, SAN vs CN, and forward secrecy without hesitation.

**Week 4 — Production operations.** Production Usage, Deployment, Monitoring, and Production Checklist sections; do Lab 3 (ACME automation) and Lab 4 (expiry monitor). Milestone: a working ACME-issued certificate with automated renewal and a monitored expiry metric, on infrastructure you control.

**Week 5 — Architecture decisions and mTLS.** Architecture, Scalability, and Security sections; sketch (or build) the mTLS microservice demo from Real Projects. Milestone: you can defend, with tradeoffs, a specific TLS-termination architecture for a given system.

**Week 6 — Interview and portfolio polish.** Interview Questions, Coding Questions, Case Studies. Explain Heartbleed, DigiNotar, and the HSTS/SSL-stripping gap out loud, unprompted, with the underlying mechanism, not just the headline.

Then continue to **Secrets Management** on this platform — private key handling is the natural next layer once TLS itself is solid — or **OWASP Top 10** to see where transport security fits among the full spread of web application risks.
`,

  "official-docs": `
- [RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446) — the authoritative specification; dense but the single source of truth for handshake details.
- [RFC 5246 — The Transport Layer Security (TLS) Protocol Version 1.2](https://www.rfc-editor.org/rfc/rfc5246) — for understanding what changed and why 1.3 exists.
- [RFC 8555 — Automatic Certificate Management Environment (ACME)](https://www.rfc-editor.org/rfc/rfc8555) — the protocol behind Let's Encrypt and cert-manager.
- [Let's Encrypt documentation](https://letsencrypt.org/docs/) — practical, well-written docs on the modern automated-issuance workflow.
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/) — generates production-ready TLS config for nginx/Apache/others at "modern," "intermediate," or "old" compatibility levels.
- [CA/Browser Forum Baseline Requirements](https://cabforum.org/baseline-requirements/) — the actual rules governing publicly trusted certificate issuance and validity periods.
- [cert-manager documentation](https://cert-manager.io/docs/) — the Kubernetes-native certificate automation project referenced throughout Production Usage and Deployment.
`,

  books: `
- **Bulletproof SSL and TLS** — Ivan Ristić. The single most thorough practitioner's book on TLS deployment, configuration, and the history of attacks that shaped the protocol.
- **Serious Cryptography, 2nd ed.** — Jean-Philippe Aumasson. Excellent grounding in the cryptographic primitives (Diffie-Hellman, AEAD, HMAC/HKDF) that TLS assembles.
- **Network Security with OpenSSL** — Viega, Messier, Chandra. Older but still useful for hands-on OpenSSL command fluency.
- **High Performance Browser Networking** — Ilya Grigorik (free online). Excellent chapters connecting TLS handshake cost directly to real page-load performance.
- **The Tangled Web** — Michal Zalewski. Broader browser security model context that situates TLS/HTTPS among the rest of web security (mixed content, same-origin policy, and more).
`,

  blogs: `
- **Let's Encrypt / ISRG blog** — direct source on ACME evolution, short-lived certificate initiatives, and issuance statistics.
- **Cloudflare blog** — consistently detailed, technical posts on TLS 1.3 deployment, Encrypted Client Hello, and post-quantum hybrid key exchange rollout.
- **Scott Helme (scotthelme.co.uk)** — deeply practical HSTS, HTTP security headers, and certificate transparency content, plus the report-uri and securityheaders.com tools.
- **Ivan Ristić's SSL Labs blog** — the team behind the SSL Labs scanner; frequent deep dives on real-world TLS misconfiguration data.
- **The Cloudflare/Fastly/Akamai engineering blogs generally** — large-scale TLS termination operators publish some of the best applied performance and security writing on this topic.
`,

  "research-papers": `
TLS-specific formal and applied research worth reading:

- **"A Formal Security Analysis of the Signal Messaging Protocol"**-style rigor aside, the most directly relevant paper is the collection of formal analyses done DURING TLS 1.3 standardization — notably work by Cremers, Horvat, and others verifying the 1.3 handshake's security properties (forward secrecy, downgrade resistance) using formal methods before the RFC was finalized.
- **"This POODLE Bites: Exploiting the SSL 3.0 Fallback"** (Möller, Duong, Kotowicz, 2014) — the original POODLE writeup; a clean example of a downgrade-plus-padding-oracle attack.
- **"Lucky Thirteen: Breaking the TLS and DTLS Record Protocols"** (AlFardan, Paterson, 2013) — the timing-based padding-oracle attack against CBC-mode TLS that directly motivated AEAD-only cipher suites in TLS 1.3.
- **"The Matter of Heartbleed"** (Durumeric et al., 2014) — the empirical measurement study of Heartbleed's real-world impact across the internet.
- **"Analysis of the HTTPS Certificate Ecosystem"** (Durumeric et al., 2013) and follow-on Certificate Transparency papers — foundational reading on why the CA trust model needed public, auditable logs.
- If this list feels thin relative to a mature protocol: that's honest — most of the deepest TLS research is either IETF working-group formal-analysis work (not traditional academic papers) or empirical measurement studies from groups like the Censys/ZMap teams; treat the RFC 8446 appendices themselves as close to primary-source "research" on the design rationale.
`,

  videos: `
- **Ivan Ristić — various TLS deployment talks** — practitioner-focused, directly maps to the Bulletproof SSL/TLS book.
- **David Wong — "Real World Cryptography" conference talks** — clear explanations of the cryptographic primitives underneath TLS.
- **Cloudflare engineering talks on Encrypted Client Hello and post-quantum TLS** (conference talks from Cloudflare's crypto team) — current-state deployment reality, not just theory.
- **"TLS 1.3: The New Design" talks from IETF/USENIX Enigma-style venues** — good for understanding the standardization process and the security rationale, not just the wire format.
- **Let's Encrypt team talks on ACME's design** — useful for understanding why the challenge-response model (HTTP-01/DNS-01/TLS-ALPN-01) was designed the way it was.
`,

  "github-repos": `
- [letsencrypt/boulder](https://github.com/letsencrypt/boulder) — Let's Encrypt's actual ACME CA server implementation; read this to see ACME from the CA's side.
- [certbot/certbot](https://github.com/certbot/certbot) — the reference ACME client; a great way to see the challenge/response flow in real code.
- [cert-manager/cert-manager](https://github.com/cert-manager/cert-manager) — the Kubernetes-native certificate automation project referenced throughout this page.
- [FiloSottile/mkcert](https://github.com/FiloSottile/mkcert) — the standard tool for locally-trusted development certificates; small, readable Go codebase.
- [drwetter/testssl.sh](https://github.com/drwetter/testssl.sh) — the widely used command-line TLS configuration scanner referenced in Testing and Performance.
- [smallstep/certificates](https://github.com/smallstep/certificates) (step-ca) — a practical private CA you can stand up yourself for the mTLS lab/project on this page.
- [openssl/openssl](https://github.com/openssl/openssl) — the reference (and most widely deployed) TLS implementation; worth browsing even if you never contribute.
- [rustls/rustls](https://github.com/rustls/rustls) — a modern, memory-safe TLS implementation in Rust; a good contrast to OpenSSL's C codebase for understanding implementation-bug risk (see Heartbleed).
- [ssllabs/ssllabs-scan](https://github.com/ssllabs/ssllabs-scan) — a command-line wrapper around the SSL Labs API for automating the grading tool referenced in Performance and Testing.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Reading handshakes*: run openssl s_client -showcerts against five different real-world sites; record TLS version, cipher suite, and whether the intermediate was included; explain any differences you find.
2. *Certificate anatomy*: pick any certificate you retrieved above and identify every field discussed in this page (subject, issuer, validity, SAN, key usage) without looking anything up.
3. *Handshake tracing*: draw the TLS 1.3 handshake from memory, then annotate exactly which messages are encrypted and which are not, and why.
4. *Failure-path coding*: write the three deliberately-broken test servers from Lab 2 (expired, wrong-hostname, self-signed-untrusted) and write client code (in the language of your choice) that correctly distinguishes each failure type from the exception/error it raises.
5. *ACME end to end*: complete an HTTP-01 challenge manually (place the token file yourself, trigger validation via the ACME staging API) before ever using an automated client — doing it by hand once makes automation click.
6. *Architecture design*: given a hypothetical multi-tenant SaaS platform with a public API and three internal microservices, write a one-page design doc choosing and justifying a TLS-termination and internal-trust architecture.
7. *Monitoring*: extend the certificate-expiry Prometheus exporter from this page to check an entire fleet from a config file, and add a Grafana panel/alert rule for it.

External sets: SSL Labs' own test-site suite (badssl.com — a collection of intentionally misconfigured TLS endpoints for exactly this kind of practice), the Cryptopals crypto challenges (not TLS-specific, but builds the primitive-level intuition this page assumes), and Let's Encrypt's staging environment for safe, rate-limit-free ACME practice.
`,

  "architecture-diagram": `
The reference production architecture for TLS termination and internal trust — the shape you'll design repeatedly in real systems:

~~~mermaid
flowchart TB
    Client["Clients (browsers, mobile apps, API consumers)"] --> CDN["CDN edge\\n(Cloudflare/Akamai/Fastly)\\nterminates public TLS, caches static assets"]
    CDN -->|"re-encrypted TLS"| LB["Load balancer / Ingress\\n(nginx/Envoy/ALB)\\nterminates TLS, HSTS, OCSP stapling"]
    LB -->|"plaintext (trusted VPC)\\n-- OR --\\nmTLS (zero trust)"| API1["API service pod 1"]
    LB -->|"plaintext / mTLS"| API2["API service pod N"]
    API1 & API2 -->|"mTLS (service mesh sidecar)"| AUTH["Auth service"]
    API1 & API2 -->|"mTLS"| BILL["Billing service"]
    AUTH & BILL -->|"TLS (managed by cloud provider)"| DB[("PostgreSQL / managed DB")]
    subgraph CertOps["Certificate automation"]
        CM["cert-manager"] -->|ACME| LE["Let's Encrypt"]
        CM --> LB
        MESH["Service mesh CA\\n(short-lived workload certs)"] --> API1
        MESH --> API2
        MESH --> AUTH
        MESH --> BILL
    end
~~~

Every arrow in this diagram represents a deliberate choice: which hops get mTLS, which stay plaintext inside a trusted boundary, and which certificate authority (public CA via ACME, or an internal mesh CA) issues the certificate involved.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((TLS and HTTPS))
    Foundations
      Confidentiality integrity authentication
      HTTP vs HTTPS
      Hybrid crypto: asymmetric bootstraps symmetric
    Handshake
      TLS 1.3: 1-RTT
      TLS 1.2: 2-RTT
      Forward secrecy
      0-RTT resumption and replay risk
      Downgrade protection
    PKI and Certificates
      X.509 fields: subject issuer SAN validity
      Chain of trust: root intermediate leaf
      CA slash Browser Forum
      Let's Encrypt and ACME
      Certificate Transparency
    Extensions
      SNI
      Encrypted Client Hello
      OCSP stapling
    Production patterns
      TLS termination at edge/LB
      mTLS for service-to-service auth
      HSTS
      Certificate automation and rotation
    Misconfigurations
      Expired certs
      Weak cipher suites
      Missing intermediates
      Mixed content
      Aggressive pinning without rotation plan
    Real incidents
      Heartbleed
      POODLE
      DigiNotar
    Career
      Interview classics
      Labs and projects
      Reading path
~~~
`,
};

export default tlsHttps;
