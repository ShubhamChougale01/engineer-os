import type { SkillContent } from "../types";

/**
 * JWT (JSON Web Token) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const jwt: SkillContent = {
  overview: `
A JSON Web Token (JWT, pronounced "jot") is a compact, URL-safe, self-contained way to represent claims — statements about a user or system — that can be verified because they are cryptographically signed. A JWT is a string made of three base64url-encoded parts separated by dots: header.payload.signature. Anyone holding the token can read the header and payload instantly (it is encoding, not encryption); the signature is what lets a server trust that the claims have not been tampered with since they were issued.

For an AI engineer, JWTs are everywhere: they are the access tokens OAuth 2.0 servers hand out, the ID tokens OpenID Connect uses to prove who a user is (see the OAuth 2.0 / OIDC skill), the bearer tokens that authenticate calls to your own FastAPI or Express backend, and increasingly the credential format that lets an LLM agent call a downstream API "on behalf of" a user without that API ever touching a database session. Understanding JWTs deeply — not just "it's a token you put in a header" — means understanding what a signature actually proves, what it does not protect, and why "can I revoke this?" is the single hardest production question in token-based auth.

Key characteristics: self-contained (the payload carries the claims, so a receiving service can verify a token without calling back to the issuer), stateless by default (no server-side session store required), signed not encrypted in the overwhelmingly common case (JWS), and standardized (RFC 7519 for the token, RFC 7515 for signing, RFC 7516 for the less common encrypted variant). JWTs trade the simplicity of "look up a session ID in a database" for the complexity of "reason about cryptography, expiry, and revocation" — a trade that is right for some architectures and wrong for others, which is the theme running through this entire page.
`,

  history: `
JWT grew out of the OAuth 2.0 and OpenID Connect (OIDC) work happening at the IETF and at companies like Google, Microsoft, Ping Identity, and Auth0 in the early 2010s. Before JWT, OAuth 2.0 access tokens were opaque strings — the resource server had no choice but to call back to the authorization server on every request to ask "is this token still valid, and who does it belong to?" That round trip did not scale for high-throughput, multi-service architectures. The industry wanted a token format that carried its own claims and could be verified locally with a cryptographic signature.

Mike Jones (Microsoft), John Bradley (Ping Identity), and Nat Sakimura (Nomura Research Institute) authored the core specifications. JWT itself is built on two older, more general specs: JOSE (JSON Object Signing and Encryption) which defines JWS (JSON Web Signature) and JWE (JSON Web Encryption), and JWK (JSON Web Key) which defines how to represent the keys used to sign or encrypt.

| Year | Milestone |
|------|-----------|
| 2010–2012 | OAuth 2.0 core spec work at IETF; need for a self-contained token format identified |
| 2012 | Early JOSE / JWT drafts begin circulating in the IETF oauth and jose working groups |
| 2014 | OpenID Connect Core 1.0 finalized — makes the JWT-based ID Token the standard way to assert identity on top of OAuth 2.0 |
| May 2015 | RFC 7519 (JWT), RFC 7515 (JWS), RFC 7516 (JWE), RFC 7517 (JWK), RFC 7518 (JWA algorithms) all published together |
| 2015–2018 | Library ecosystem matures: jsonwebtoken (Node), PyJWT (Python), jjwt (Java), jose libraries broadly |
| 2015 | The "alg: none" vulnerability class becomes widely known and publicly discussed after several libraries shipped insecure defaults |
| 2019 | Auth0's widely-cited "critical vulnerabilities in JSON Web Token libraries" research popularizes algorithm-confusion attacks (RS256/HS256 key confusion) |
| 2021 | RFC 8725 "JSON Web Token Best Current Practices" published, formally codifying the lessons learned from years of real-world JWT vulnerabilities |
| 2020s | JWT becomes the default access/ID token format for OAuth 2.0 and OIDC across virtually every identity provider (Auth0, Okta, AWS Cognito, Azure AD / Entra ID, Firebase Auth, Keycloak) |

The throughline: JWT was designed to remove a network round trip, and most of its real-world security history is a story of applications re-introducing risk by trusting fields in a token (like the algorithm) that an attacker also controls.
`,

  "why-it-exists": `
Before JWT, the dominant pattern for authenticated APIs was the server-side session: a client logs in, the server creates a session record in memory or in a shared store (Redis, a database table), and hands the client an opaque session ID (usually in a cookie). Every subsequent request sends that ID, and the server looks it up to find out who the user is.

That works well for a single monolithic web app, but it strains at two seams:

1. **Cross-service verification.** In a microservices or API-gateway world, every service that needs to know "who is this request from" would otherwise have to call the auth service (or share its session store) on every single request. That is a network hop, a shared dependency, and a single point of contention on every request path in the system.
2. **Cross-domain and third-party delegation.** OAuth 2.0 needed a token that a resource server (say, a photo-printing service) could accept from a completely different authorization server (say, a photo-hosting service) without a live connection between them. An opaque string cannot carry "this token is valid until 3pm and belongs to user 482" on its own; something has to.

JWT filled that gap: a token format that is self-describing (the payload literally states who it's for, who issued it, and when it expires) and self-verifying (the signature proves those claims haven't been altered), so any service holding the issuer's public key (or shared secret) can validate a request with zero network calls back to the source of truth. It is the same idea as a wax-sealed letter: the contents are readable by whoever holds it, but the seal proves who sent it and that it wasn't reopened in transit.
`,

  "problem-it-solves": `
JWT concretely removes:

- **The session-store bottleneck.** No shared Redis/database lookup needed on every request just to know who the caller is — verification is pure, local cryptography (an HMAC or a signature check).
- **Cross-service auth friction.** Any microservice with the right public key (or shared secret) can independently verify a token issued by a completely different service, enabling zero-trust, horizontally scaled architectures without a central session gatekeeper on the hot path.
- **Cross-domain delegation.** OAuth 2.0 / OIDC flows where an authorization server and a resource server are different companies (Google issuing a token that a third-party app's backend verifies) become tractable — this is precisely the pattern covered in the OAuth 2.0 / OIDC skill.
- **Rich, structured identity data in one artifact.** A JWT can carry roles, permissions, tenant IDs, and other claims directly, so downstream services don't need a second call to fetch "what can this user do" — relevant to both the RBAC and ABAC skills, which describe how those claims get used for authorization decisions.

What JWT deliberately does **not** solve:

- **Revocation.** Once issued and signed, a JWT is valid until it expires — there is no built-in "undo." This is the single most misunderstood limitation and gets its own dedicated treatment later on this page.
- **Confidentiality of the payload**, unless you specifically use JWE. A standard signed JWT (JWS) is readable by anyone who intercepts it — never put secrets, passwords, or sensitive PII directly in the claims.
- **Transport security.** JWT says nothing about how the token gets from client to server; it must always travel over TLS. JWT is a token *format*, not a transport protocol.
- **The "where do I store this on the client" problem.** That is an application architecture decision with real security tradeoffs (localStorage vs httpOnly cookies), covered in depth in this page and in the Cookies & Sessions skill.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely what a JWT is structurally (header.payload.signature) and why base64url encoding is not encryption.
2. Decode a real JWT by hand and identify every registered claim (iss, sub, aud, exp, iat, nbf, jti) and distinguish them from custom claims.
3. Explain the difference between symmetric (HS256) and asymmetric (RS256/ES256) signing, and choose correctly between them for a given architecture.
4. Describe the "alg: none" attack and algorithm-confusion attacks (RS256→HS256 key confusion), and configure a verifier so neither is possible.
5. Distinguish JWS (signed) from JWE (encrypted) and state why the overwhelming majority of "JWTs" in production are JWS-only, meaning the payload is world-readable.
6. Design an access-token + refresh-token pair, including expiry choices and a rotation strategy.
7. Explain why stateless JWTs cannot be revoked outright, and implement at least one mitigation (short expiry, deny-list, token versioning).
8. Reason through the localStorage-vs-httpOnly-cookie storage tradeoff in terms of XSS and CSRF exposure.
9. Implement JWT issuing and verification in Python (PyJWT) and Node (jsonwebtoken), including JWKS-based verification for asymmetric keys.
10. Answer senior-level interview questions about JWT security pitfalls: weak HS256 secrets, missing expiry checks, and unchecked aud/iss claims.
`,

  prerequisites: `
- **Required**: basic HTTP fundamentals (headers, status codes, the Authorization header), what hashing and public-key cryptography are at a conceptual level (you don't need to implement RSA, just know "public key verifies, private key signs").
- **Helpful**: a general web backend in any language (Python/FastAPI, Node/Express) so the code samples land immediately.
- **Deeply related, read alongside or next**: the **OAuth 2.0 / OIDC** skill (JWT is the token format OAuth and OIDC use in practice — OAuth access tokens and OIDC ID tokens are almost always JWTs), the **Cookies & Sessions** skill (the classic "stateless JWT vs stateful session cookie" debate this page resolves in detail), and the **RBAC** / **ABAC** skills (JWT claims are frequently the vehicle that carries the roles or attributes those authorization models act on).

Dependency links on this platform: **HTTP** → this page → **OAuth 2.0 / OIDC** → **RBAC** / **ABAC** for the full authentication-and-authorization stack.
`,

  "beginner-concepts": `
### What a JWT actually looks like

A JWT is one string with two dots in it:

~~~text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItNDgyIiwibmFtZSI6IkFkYSIsImlhdCI6MTcwMDAwMDAwMH0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFmbmWzGZfU
~~~

Split on the dots you get three base64url-encoded segments: **header**.**payload**.**signature**.

### Base64url is encoding, not encryption

This is the single most important beginner fact about JWT: base64url is a reversible text encoding, exactly like base64, just using URL-safe characters (- and _ instead of + and /, and no padding). Anyone can decode it with zero secrets — try it yourself:

~~~python
import base64
import json

def decode_segment(segment: str) -> dict:
    # JWT segments omit padding; base64 needs a multiple of 4 chars
    padded = segment + "=" * (-len(segment) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))

header_b64 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
print(decode_segment(header_b64))
# {'alg': 'HS256', 'typ': 'JWT'}
~~~

There is no secret required to read a JWT's header or payload — never put a password, credit card number, or anything sensitive directly into the claims.

### The three parts, decoded

Given the token above, here is what each part actually contains once decoded:

~~~json
// Header — announces the signing algorithm and token type
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload — the claims (statements about the subject)
{
  "sub": "usr-482",
  "name": "Ada",
  "iat": 1700000000
}

// Signature — computed, NOT base64 of readable JSON
// HMACSHA256(
//   base64UrlEncode(header) + "." + base64UrlEncode(payload),
//   secret
// )
~~~

The signature is a cryptographic output (raw bytes, then base64url-encoded for transport) — it is not "encoded JSON" like the other two parts. It exists purely so a verifier can detect if the header or payload were altered after signing.

### Registered claims (the standard vocabulary)

RFC 7519 defines a small set of optional but standardized claim names so different systems agree on their meaning:

~~~text
iss (issuer)      — who created and signed the token, e.g. "https://auth.example.com"
sub (subject)     — who the token is about, typically a stable user ID
aud (audience)    — who the token is intended for, e.g. "https://api.example.com"
exp (expiration)  — Unix timestamp after which the token MUST be rejected
nbf (not before)  — Unix timestamp before which the token MUST be rejected
iat (issued at)   — Unix timestamp when the token was created
jti (JWT ID)      — a unique identifier for this token, useful for revocation/dedup
~~~

### Custom claims

Anything beyond the registered set is a custom (sometimes called "private") claim — application-specific data like roles, tenant ID, or plan tier:

~~~python
payload = {
    "sub": "usr-482",
    "iss": "https://auth.example.com",
    "aud": "https://api.example.com",
    "exp": 1700003600,
    "iat": 1700000000,
    # custom claims — anything your application needs
    "role": "editor",
    "tenant_id": "acme-corp",
}
~~~

Common beginner trap: assuming a JWT is encrypted because it "looks like gibberish." It is not — it is only signed in the vast majority of real-world usage. See JWS vs JWE in Intermediate Concepts for the encrypted alternative.
`,

  "intermediate-concepts": `
### Signing a JWT end to end (PyJWT)

~~~python
import jwt          # PyJWT — pip install pyjwt
import datetime

SECRET = "a-long-randomly-generated-secret-never-hardcoded-like-this"

now = datetime.datetime.now(tz=datetime.timezone.utc)
payload = {
    "sub": "usr-482",
    "iss": "https://auth.example.com",
    "aud": "https://api.example.com",
    "iat": now,
    "exp": now + datetime.timedelta(minutes=15),   # short-lived access token
    "role": "editor",
}

token = jwt.encode(payload, SECRET, algorithm="HS256")

# Verifying — PyJWT checks exp/nbf/iat automatically; aud/iss must be asked for explicitly
decoded = jwt.decode(
    token,
    SECRET,
    algorithms=["HS256"],           # ALWAYS pin the allowed algorithm(s) explicitly
    audience="https://api.example.com",
    issuer="https://auth.example.com",
)
~~~

Notice two production habits already baked in: an explicit, short expiry, and an explicit algorithms allow-list on decode (never trust the token's own header to tell you which algorithm to use — more on why in Security).

### HS256 vs RS256 vs ES256

~~~text
HS256 (HMAC + SHA-256)  — SYMMETRIC: one shared secret signs AND verifies.
                          Fast. Simple. But every service that verifies tokens
                          must hold the same secret that can also forge tokens.

RS256 (RSA + SHA-256)   — ASYMMETRIC: a private key signs, a public key verifies.
                          The private key stays only on the auth server; any
                          number of resource servers can verify with the public
                          key and can never forge a token. Slower, larger tokens.

ES256 (ECDSA + SHA-256) — ASYMMETRIC, elliptic curve. Same public/private
                          split as RS256, but smaller keys and signatures,
                          faster than RSA for the same security level.
~~~

The deciding question: **does more than one party need to verify tokens that only one party should be able to issue?** If yes (the common case — an auth server issues, many microservices verify), use RS256 or ES256. If the same single service both issues and verifies (e.g. a monolith signing its own short-lived tokens), HS256 is simpler and sufficient — as long as the secret is long, random, and never shared with anything that only needs to verify.

### Node.js with jsonwebtoken

~~~javascript
// npm install jsonwebtoken
const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("private.pem");

const token = jwt.sign(
  { sub: "usr-482", role: "editor" },
  privateKey,
  {
    algorithm: "RS256",
    expiresIn: "15m",
    issuer: "https://auth.example.com",
    audience: "https://api.example.com",
  }
);

const publicKey = fs.readFileSync("public.pem");
try {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],           // pin algorithms — never omit this option
    issuer: "https://auth.example.com",
    audience: "https://api.example.com",
  });
} catch (err) {
  // TokenExpiredError, JsonWebTokenError (bad signature), NotBeforeError, etc.
  console.error("token rejected:", err.message);
}
~~~

### Access tokens vs refresh tokens

The standard pattern splits authentication into two token types with very different lifetimes:

~~~text
Access token  — short-lived (minutes), sent on every API request in the
                Authorization header, verified statelessly by resource servers.
Refresh token — long-lived (days to weeks), sent ONLY to the auth server's
                token endpoint to mint a new access token, usually stored
                server-side (or as an opaque, revocable value) so it CAN be
                revoked, unlike the stateless access token.
~~~

This pairing is the practical answer to "how do we get the low-latency benefit of stateless verification without living with weeks-long unrevocable tokens": keep the stateless token's blast radius small (minutes), and put the actual revocation control on the token that's rarely used and easy to check against a database.

### JWS vs JWE

~~~text
JWS (JSON Web Signature) — the SIGNED variant. Header.Payload.Signature.
                            Payload is base64url, readable by anyone. This is
                            "a JWT" in ~95% of real-world usage.

JWE (JSON Web Encryption) — the ENCRYPTED variant. Five dot-separated parts
                            (header, encrypted key, IV, ciphertext, auth tag).
                            Payload is genuinely unreadable without the
                            decryption key. Used far less often — mostly when
                            the token itself must carry sensitive PII across
                            an untrusted intermediary.
~~~

If someone says "the JWT is encrypted so it's safe to put a password in it," they are almost certainly wrong — check whether the library is actually producing a JWE (5 parts) or a JWS (3 parts, the default in every mainstream JWT library).
`,

  "advanced-concepts": `
### Stateless vs stateful auth — the real tradeoff table

| Dimension | Stateless (JWT) | Stateful (session + store) |
|-----------|------------------|------------------------------|
| Verification cost | Local signature check, no DB hit | DB/cache lookup every request |
| Horizontal scaling | Trivial — any node with the key can verify | Needs a shared session store (Redis) |
| Revocation | Hard — valid until exp unless mitigated | Trivial — delete the session row |
| Token size | Larger (hundreds of bytes to a few KB) | Tiny (an opaque ID, often 16-32 bytes) |
| Claim freshness | Frozen at issue time until re-issued | Always current — the store is the truth |
| Cross-service use | Natural — same public key verifies everywhere | Needs a shared store or a lookup service |

There is no universally "correct" choice — this is precisely the debate covered in depth in the **Cookies & Sessions** skill. Many senior teams land on a hybrid: short-lived stateless JWT access tokens for low-latency verification, backed by a stateful, revocable refresh token or session.

### The revocation problem, precisely

A signed JWT is cryptographically valid until its exp timestamp passes — full stop. There is no built-in call to "invalidate token X." This bites teams the first time they need to handle: a user logging out, a password reset, an admin banning an account, or a compromised token. Mitigations, roughly in order of how much statelessness they sacrifice:

1. **Short expiry** (5-15 minutes for access tokens) — shrinks the exposure window without adding any infrastructure. The default first line of defense.
2. **Refresh-token revocation** — the access token stays stateless and short; the refresh token is stored server-side and checked/deleted on logout or compromise. Revoking the refresh token stops new access tokens from being minted; the current access token still works until it naturally expires.
3. **Deny-list (blacklist) of jti values** — store revoked token IDs (the jti claim) in a fast store like Redis with a TTL equal to the token's remaining lifetime; every verification does one extra lookup. This reintroduces statefulness but keeps the check cheap and bounded.
4. **Allow-list per user session** — the inverse: store currently-valid session/token identifiers and reject anything not present. More storage, stronger guarantee.
5. **Token versioning ("global logout")** — store a tokenVersion (or passwordChangedAt) integer per user; embed it as a custom claim at issue time; on verification, compare it to the current value in the user record. Bumping the version instantly invalidates every previously issued token for that user in one write — the standard trick for "log me out everywhere" and forced password-reset flows.

~~~python
# Token versioning sketch
def issue_token(user) -> str:
    return jwt.encode(
        {"sub": user.id, "ver": user.token_version, "exp": ...},
        SECRET, algorithm="HS256",
    )

def verify_token(token: str, get_current_version) -> dict:
    claims = jwt.decode(token, SECRET, algorithms=["HS256"])
    if claims["ver"] != get_current_version(claims["sub"]):
        raise ValueError("token revoked via version bump")
    return claims
~~~

### Algorithm confusion attacks

Two related attack classes exploit trusting the token's own header:

- **alg: none.** The JWT spec technically allows an "none" algorithm meaning "unsigned." Early or misconfigured libraries would see alg: none in the header and skip signature verification entirely, letting an attacker hand-craft any payload they want. Modern libraries reject "none" by default, but always confirm your verifier is configured with an explicit algorithm allow-list rather than trusting the header.
- **RS256 → HS256 key confusion.** If a server is configured to accept both RS256 and HS256, and it (incorrectly) uses the RS256 *public key* as the HS256 *secret* when the attacker sends alg: HS256, the attacker — who already legitimately has the public key, since public keys are public — can forge a validly "signed" HS256 token using that public key as the HMAC secret. The fix: never let the algorithm come from the token; pin the exact expected algorithm(s) in the verify call, matched to the exact key type you intend to use.

### JWKS and key rotation

Asymmetric verification needs the public key. Rather than hardcoding it, identity providers publish a **JWKS** (JSON Web Key Set) — a JSON document listing the current public keys, each tagged with a kid (key ID) that matches the kid in a token's header:

~~~text
GET https://auth.example.com/.well-known/jwks.json
{
  "keys": [
    { "kid": "2024-key", "kty": "RSA", "n": "...", "e": "AQAB", "alg": "RS256", "use": "sig" },
    { "kid": "2025-key", "kty": "RSA", "n": "...", "e": "AQAB", "alg": "RS256", "use": "sig" }
  ]
}
~~~

Verifiers fetch and cache the JWKS, use a token's kid to pick the right entry, and refresh the cache periodically (and on a kid miss) so keys can rotate without downtime: the auth server starts signing with a new key while the old public key stays published for a grace period so already-issued tokens keep validating until they naturally expire.

### Confidentiality vs integrity — the core mental model

A signature (JWS) gives you **integrity and authenticity**: you can prove the claims haven't changed and who created them. It gives you **zero confidentiality**: anyone can read the claims. Encryption (JWE) gives you confidentiality but is a fundamentally different, much less commonly used mechanism. Conflating the two — "it's signed, so it's secure" — is the single most common conceptual error engineers make with JWT, and it directly causes the "sensitive data left in a JWT payload" class of incidents.
`,

  "internal-working": `
Step by step, here is exactly what happens when a JWT is created and later verified.

~~~mermaid
flowchart LR
    A["Header JSON\n{alg, typ}"] --> B["base64url encode"]
    C["Payload JSON\n{claims}"] --> D["base64url encode"]
    B --> E["header_b64 . payload_b64"]
    D --> E
    E --> F["Sign with algorithm\n(HMAC secret OR RSA/EC private key)"]
    F --> G["signature bytes"]
    G --> H["base64url encode signature"]
    E --> I["Final JWT:\nheader_b64.payload_b64.signature_b64"]
    H --> I
~~~

**Issuing:**
1. Build the header object, typically alg and typ.
2. Build the payload object with registered and custom claims.
3. JSON-serialize each, then base64url-encode each — producing header_b64 and payload_b64.
4. Concatenate them with a dot: signing_input = header_b64 + "." + payload_b64.
5. Run the signing algorithm named in the header over signing_input — HMAC-SHA256 with a shared secret for HS256, or an RSA/ECDSA private-key signature for RS256/ES256 — producing raw signature bytes.
6. base64url-encode the signature and append it: final token = header_b64 + "." + payload_b64 + "." + signature_b64.

**Verifying (the part where correctness actually matters):**
1. Split the token on its dots into the three parts.
2. Decode the header to read the alg field — but do NOT trust it blindly. A correct verifier checks that alg matches what the caller explicitly expects/allows-lists; it never lets the token dictate its own verification algorithm.
3. Re-run the exact same signing operation over header_b64 + "." + payload_b64 using the key the verifier already has (the shared secret, or the issuer's known public key looked up e.g. via JWKS and kid).
4. Compare the freshly computed signature to the signature in the token using a constant-time comparison (to avoid timing attacks that could leak information about the secret).
5. If signatures match: decode the payload and check exp (not expired), nbf (not "not yet valid"), and — critically, and often skipped by less careful libraries — aud and iss against the expected values for this service.
6. Only after all of the above pass is the payload trusted and its claims used for authorization.

The entire security model rests on step 3-4: an attacker who cannot compute a valid signature for a modified payload (because they don't have the secret or private key) cannot forge or tamper with a token undetected. Everything else — expiry, audience, issuer checks — is application-level policy layered on top of that one cryptographic guarantee.
`,

  architecture: `
Think about JWT at two levels: the **token lifecycle architecture** (how tokens are minted, distributed, and verified across services) and the **application layout** (where the JWT logic lives in your codebase).

### Token lifecycle architecture

~~~mermaid
flowchart TB
    U["User / Client"] -->|1 . credentials| AS["Auth Server\n(issues tokens, holds private key)"]
    AS -->|2 . access + refresh token| U
    U -->|3 . Authorization: Bearer access_token| RS1["Resource Server A"]
    U -->|3 . Authorization: Bearer access_token| RS2["Resource Server B"]
    RS1 -->|verify signature locally| JWKS["JWKS endpoint\n(public keys, cached)"]
    RS2 -->|verify signature locally| JWKS
    AS -->|publishes public keys| JWKS
    U -->|4 . refresh when expired| AS
~~~

Key architectural point: resource servers A and B never call the auth server to check a token — they verify independently using the cached public key, which is exactly the network-hop elimination that motivated JWT's design.

### Application layout (a typical FastAPI/Express backend)

~~~text
myservice/
├── auth/
│   ├── tokens.py           # encode/decode helpers, claim construction
│   ├── keys.py             # loads signing key or JWKS client with caching
│   └── dependencies.py     # FastAPI Depends()/Express middleware: extract + verify + attach user
├── api/
│   └── routers/            # route handlers call auth dependency, then trust request.user
├── models/
│   └── user.py             # holds token_version / passwordChangedAt for revocation
└── tests/
    └── test_auth.py        # expired, tampered, wrong-audience, wrong-algorithm cases
~~~

Rule of thumb: token creation and verification logic lives in exactly one module, imported everywhere else — never hand-roll base64/signature logic inline in a route handler, and never let more than one place in the codebase decide which algorithms are acceptable.
`,

  "data-flow": `
Trace a single authenticated API call end to end, from login through to a verified request:

~~~mermaid
sequenceDiagram
    participant C as Client
    participant AS as Auth Server
    participant RS as Resource Server
    participant JW as JWKS cache

    C->>AS: POST /login (username, password)
    AS->>AS: verify credentials
    AS->>AS: build claims (sub, iss, aud, exp, iat, role)
    AS->>AS: sign with private key (RS256)
    AS-->>C: access_token (15m) + refresh_token (14d)

    C->>RS: GET /orders  Authorization: Bearer access_token
    RS->>JW: fetch public key by kid (cached)
    JW-->>RS: public key
    RS->>RS: verify signature, exp, nbf, aud, iss
    alt valid
        RS-->>C: 200 OK + data
    else expired
        RS-->>C: 401 Unauthorized
        C->>AS: POST /token/refresh (refresh_token)
        AS->>AS: check refresh token is not revoked
        AS-->>C: new access_token
    end
~~~

The important detail: the resource server never talks to the auth server on the happy path (the GET /orders → verify → 200 path) — it verifies entirely from data it already has cached. The only time the auth server is contacted again is at login and at refresh, which is precisely where JWT's stateless design pays off under load.
`,

  "production-usage": `
### Libraries teams actually reach for

~~~text
Python:  PyJWT (low-level encode/decode), authlib (full OAuth/OIDC client+server),
         python-jose (JOSE suite incl. JWE), fastapi-users / fastapi.security
         for the FastAPI dependency-injection glue.
Node:    jsonwebtoken (encode/decode), jose (modern, spec-complete, Web Crypto-based),
         passport-jwt for Express middleware integration.
Java:    jjwt, Nimbus JOSE+JWT.
Go:      golang-jwt/jwt.
~~~

### Configuration that belongs in every real deployment

- **Algorithm pinned per verifier, never inferred from the token.** Configure exactly "RS256" or exactly "HS256" — never both unless you have a hard reason and have specifically closed the confusion attack.
- **Separate signing keys per environment** (dev/staging/prod) so a leaked dev secret never affects production.
- **Key rotation schedule** for asymmetric keys — commonly every 90 days — with overlapping validity so in-flight tokens don't suddenly fail.
- **Clock skew tolerance** (a few seconds, e.g. leeway=10 in PyJWT) to absorb minor clock drift between the issuing and verifying machines without rejecting valid tokens.
- **Centralized claim schema** — one shared type/schema (a TypedDict, a Pydantic model, a TypeScript interface) so every service agrees on what "role" or "tenant_id" means and how it's typed.

### Typical project defaults

Access token expiry: 5-15 minutes for high-security APIs (banking, admin), up to 60 minutes for lower-risk internal tools. Refresh token expiry: 7-30 days, often with "rolling" renewal (each use extends the window) or "absolute" expiry (hard cutoff regardless of use) depending on how long an idle session should be allowed to survive.
`,

  "industry-examples": `
- **Auth0 (by Okta)**: one of the identity providers most responsible for popularizing JWT as the default OAuth 2.0 / OIDC token format; their engineering blog is also the source of the widely cited research on algorithm-confusion attacks that shaped modern library defaults.
- **Google**: issues JWT-based ID tokens for "Sign in with Google" (OIDC), and Google Cloud service accounts use signed JWTs to obtain OAuth access tokens for server-to-server API calls.
- **AWS**: Amazon Cognito issues JWTs (ID, access, and refresh tokens) for user pools; API Gateway has built-in JWT authorizers that verify tokens against a configured JWKS endpoint without any custom Lambda code.
- **Microsoft (Entra ID, formerly Azure AD)**: issues JWTs as OAuth 2.0 access tokens and OIDC ID tokens across the entire Microsoft 365 and Azure ecosystem; publishes rotating JWKS endpoints per tenant.
- **Firebase Authentication (Google)**: issues signed JWT ID tokens that client apps send to custom backends, which verify them against Google's published public keys — a textbook example of stateless cross-service verification.
- **Stripe** and many payment/API platforms use short-lived signed tokens (JWT or JWT-adjacent) for scoped, time-boxed API access in specific flows (e.g. Stripe Connect OAuth).

Pattern to notice: every major identity provider converged on the same architecture — an auth server signs with a private key, publishes a rotating JWKS, and every resource server verifies locally. Nobody re-invents this; they configure it.
`,

  "best-practices": `
1. **Always pin the accepted algorithm(s) explicitly on the verifier side** — never derive trust from the alg field inside the token itself.
2. **Use asymmetric signing (RS256/ES256) whenever more than one service verifies tokens issued by another** — it means a compromised resource server can never forge tokens.
3. **Keep access tokens short-lived** (minutes, not hours) — the expiry window is your primary defense against the "can't revoke a stateless token" problem.
4. **Never put sensitive data in the payload** — it's readable by anyone with the token; only identifiers and non-sensitive claims belong there.
5. **Always validate exp, nbf, aud, and iss on every verification** — many real-world incidents trace back to a library or team skipping the aud/iss check and accepting tokens meant for a different service.
6. **Store the signing secret/private key in a secrets manager, not in code or environment files committed to git** — see the Secrets Management skill.
7. **Rotate keys on a schedule, with overlap**, using kid in the header and a JWKS endpoint so rotation is invisible to already-issued tokens.
8. **Pair a stateless access token with a revocable refresh token** — get the performance benefit of statelessness while keeping a real "log out" lever.
9. **Use a battle-tested library, never hand-roll base64/HMAC/RSA signing logic** — this is exactly the kind of code where subtle bugs become critical vulnerabilities.
10. **Include a jti and log it** on issuance — even without full deny-list infrastructure, a unique ID makes later forensics and targeted revocation possible.
11. **Choose token storage location deliberately** (httpOnly cookie vs localStorage) based on your actual XSS/CSRF threat model — don't default without thinking (see Security).
12. **Version claims schemas** — when you add or change a custom claim's meaning, do it in a way that old and new tokens can coexist during rollout (e.g. treat missing claims as a default, don't assume presence).
`,

  "anti-patterns": `
### Storing sensitive data in the payload

~~~text
WRONG:
{ "sub": "usr-482", "ssn": "123-45-6789", "password_hash": "$2b$12$..." }

RIGHT:
{ "sub": "usr-482", "role": "editor" }
~~~
The payload is base64url, not encryption — anyone who intercepts the token (logs, browser devtools, a proxy) reads it in plaintext. Only put identifiers and low-sensitivity claims in a JWS payload.

### Trusting the token's own alg header

~~~python
# WRONG — lets an attacker choose "none" or force algorithm confusion
decoded = jwt.decode(token, key, algorithms=jwt.get_unverified_header(token)["alg"])

# RIGHT — the verifier decides the algorithm, never the token
decoded = jwt.decode(token, key, algorithms=["RS256"])
~~~

### Skipping expiry or audience checks

~~~python
# WRONG — disables PyJWT's built-in exp check, and never looks at aud/iss at all
decoded = jwt.decode(token, key, algorithms=["RS256"],
                      options={"verify_exp": False})

# RIGHT — verify everything relevant to this specific service
decoded = jwt.decode(token, key, algorithms=["RS256"],
                      audience="https://api.example.com",
                      issuer="https://auth.example.com")
~~~
Accepting a token meant for a *different* audience is exactly how a token stolen from Service A ends up working against Service B.

### Treating a JWT as a session with no expiry

~~~text
WRONG: exp set to "10 years from now" so the frontend never has to refresh.
RIGHT: exp of 5-15 minutes, paired with a refresh token that CAN be revoked.
~~~
A long-lived stateless token is a long-lived, unrevocable liability — anyone who steals it has full access for its entire remaining lifetime.

### Weak or hardcoded HS256 secrets

~~~python
# WRONG
SECRET = "secret123"

# RIGHT
import secrets
SECRET = secrets.token_urlsafe(64)   # generate once, store in a secrets manager
~~~
HS256 secrets are brute-forceable if short or guessable; tools exist specifically to crack weak JWT HMAC secrets from a captured token.

### Using HS256 when multiple untrusted services must verify

If every microservice holds the same HS256 secret to verify tokens, every one of those services can also *forge* tokens — a single compromised low-trust service can mint tokens claiming to be any user. Use RS256/ES256 so only the auth server holds the signing (private) key.
`,

  performance: `
### Measure first

~~~bash
python -m timeit -s "import jwt; SECRET='x'*32" "jwt.encode({'sub':'u1'}, SECRET, algorithm='HS256')"
python -m timeit -s "import jwt; SECRET='x'*32; t=jwt.encode({'sub':'u1'}, SECRET, algorithm='HS256')" "jwt.decode(t, SECRET, algorithms=['HS256'])"
~~~

Profile signing and verification specifically when they show up in a hot path (e.g. an API gateway verifying millions of requests per day) — the cryptographic operation, not JSON serialization, is almost always the dominant cost.

### The performance hierarchy

1. **Prefer HMAC (HS256) over RSA (RS256) for raw speed** when only one trusted service signs and verifies — HMAC is roughly an order of magnitude faster than RSA signature verification. If multiple services must verify tokens they don't issue, this tradeoff is overridden by the security requirement for asymmetric keys; use ES256 rather than RS256 in that case for a better speed/security balance (ECDSA verification is cheaper than RSA at equivalent security strength, though RSA verification specifically — as opposed to signing — is often fast too).
2. **Cache the JWKS response**, don't re-fetch it on every verification. A short TTL (minutes) with a background refresh and an on-demand refresh on kid-miss is the standard pattern; nearly every JOSE library ships this caching behavior.
3. **Keep payloads small.** Every claim adds bytes to every request; avoid embedding large arrays (e.g. a full permission list) when a compact role or a lookup key would do — this both speeds up transport and keeps the token from silently growing to hit header size limits (many proxies/load balancers cap header size around 8KB).
4. **Avoid re-parsing the same token twice in one request lifecycle** — decode once in middleware/dependency injection, attach the parsed claims to the request context, and reuse.
5. **Batch or cache downstream authorization lookups** that are driven by JWT claims (e.g. resolving a role into fine-grained permissions) rather than hitting a database per claim per request.
`,

  scalability: `
JWT's entire value proposition is a scalability story: verification is CPU-bound and local, so it scales horizontally with zero added dependency on a shared session store.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> RS1["Resource server pod 1"]
    LB --> RS2["Resource server pod 2"]
    LB --> RS3["Resource server pod N"]
    RS1 & RS2 & RS3 -->|cached, no per-request call| JWKS[("JWKS\n(public keys)")]
    AS["Auth server\n(scales independently, low volume)"] -->|publishes| JWKS
~~~

Because verification needs no database, resource server pods scale purely on CPU/memory for request handling — there is no shared-state bottleneck to worry about at the auth layer itself (contrast with session-cookie architectures, where the session store can become the bottleneck under load — see the Cookies & Sessions skill).

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| RSA verification CPU cost at very high RPS | Switch to ES256 (cheaper at equivalent security), or verify at the edge/API gateway instead of per-service |
| JWKS endpoint overloaded by cache-miss storms (e.g. after a bad deploy resets all caches) | Long-lived cache with jittered refresh, plus a CDN in front of the JWKS endpoint |
| Token size growing (many claims) hits header size limits at load balancers/proxies | Shrink claims to identifiers, resolve rich data via a lookup, or move large data out of the token entirely |
| Deny-list lookups for revocation adding latency at scale | Use a fast in-memory/Redis store keyed by jti with TTL equal to remaining token life, not a general-purpose database |
| Global logout / mass revocation | Token versioning (one write invalidates every existing token for a user) rather than per-token deny-list entries |
`,

  security: `
JWT security is really cryptography-adjacent application security — the token format itself is sound; nearly every real incident comes from how it's verified or where it's stored.

### Core attack surface

1. **alg: none.** A crafted token claims no signature is needed. Defense: reject "none" explicitly and always pass an explicit algorithms allow-list to the verify call — never accept it from the token.
2. **Algorithm confusion (RS256 → HS256).** Attacker sends a token with alg: HS256 whose "signature" is an HMAC computed using the RSA public key (which is, by definition, public) as the HMAC secret; a verifier that trusts the header's algorithm and blindly looks up "the key" for the sub will use the public key as an HMAC secret and accept the forgery. Defense: never allow multiple algorithm families on one verifier unless you have deliberately separated key material and pinned exactly what's expected.
3. **Weak HS256 secrets.** Short or dictionary-guessable HMAC secrets can be brute-forced offline from a single captured token (tools like hashcat and jwt-cracker exist specifically for this). Defense: cryptographically random secrets of at least 256 bits, generated with a secure random source and stored in a secrets manager.
4. **Missing or ignored expiry validation.** Some hand-rolled decoders parse the payload for its claims without ever calling the library's actual verification path, silently skipping exp entirely. Defense: always use the library's verify/decode function (not a manual base64 decode) and never disable verify_exp in production.
5. **Missing aud/iss validation.** A token legitimately issued for Service A is replayed against Service B, which accepts it because it never checked who the token was meant for. Defense: every verifying service must check aud (and often iss) against its own expected values, not just check the signature.
6. **Token leakage via logs, URLs, or Referer headers.** Tokens in query strings get logged by proxies and leak via the Referer header on outbound links. Defense: send tokens only in the Authorization header or a secure cookie, never in a URL.
7. **XSS stealing tokens from localStorage.** If a JWT is stored in localStorage and any script on the page is compromised (a malicious dependency, a stored XSS bug), that script can read and exfiltrate the token directly. Defense: prefer an httpOnly, Secure, SameSite cookie so client-side JavaScript cannot read the token at all — discussed in depth below and in the Cookies & Sessions skill.
8. **CSRF when using cookie storage.** The flip side: an httpOnly cookie is automatically sent by the browser on cross-site requests unless mitigated. Defense: SameSite=Strict or Lax cookies, plus a CSRF token or custom-header check for state-changing requests.
9. **Replay of a stolen but still-valid token.** Signature validity alone doesn't prove the request came from the legitimate holder. Defense: short expiry limits the replay window; binding tokens to a client fingerprint or using DPoP/mTLS-bound tokens (advanced OAuth extensions) closes it further.

### Where JWT storage tradeoffs land

~~~text
localStorage / sessionStorage:
  + simple to implement, works well for pure SPA + separate API domain
  - readable by ANY JavaScript on the page — a single XSS vulnerability
    anywhere in your dependency tree can exfiltrate every token
  - not automatically sent — you must attach it to every request yourself
    (this is also why it's naturally immune to CSRF)

httpOnly Secure SameSite cookie:
  + invisible to JavaScript — an XSS bug cannot directly read the token
  - automatically sent by the browser on matching-origin requests, which
    reintroduces CSRF risk unless SameSite + CSRF tokens are used
  - trickier across different subdomains/domains (CORS + cookie domain rules)
~~~

There is no universally "safe" choice — it is a real tradeoff between XSS exposure and CSRF exposure, which is exactly the debate the Cookies & Sessions skill covers from the session side. Many senior teams land on httpOnly cookies for the token plus strict SameSite and CSRF-token defenses, treating XSS as the more catastrophic and harder-to-fully-prevent class of the two.

See the dedicated **OWASP Top 10**, **Secrets Management**, and **OAuth 2.0 / OIDC** skills for the surrounding security context.
`,

  testing: `
JWT logic deserves explicit, deliberate test cases beyond the happy path — most JWT vulnerabilities are found precisely where tests were missing.

~~~python
# tests/test_auth_tokens.py
import time
import jwt
import pytest
from myservice.auth.tokens import issue_access_token, verify_access_token, AuthError

SECRET = "test-secret-not-used-in-prod"

def test_valid_token_roundtrip():
    token = issue_access_token(user_id="usr-1", role="editor")
    claims = verify_access_token(token)
    assert claims["sub"] == "usr-1"
    assert claims["role"] == "editor"

def test_expired_token_rejected():
    expired = jwt.encode(
        {"sub": "usr-1", "exp": int(time.time()) - 10},
        SECRET, algorithm="HS256",
    )
    with pytest.raises(AuthError, match="expired"):
        verify_access_token(expired)

def test_tampered_payload_rejected():
    token = issue_access_token(user_id="usr-1", role="viewer")
    header, payload, sig = token.split(".")
    # flip one character in the payload — signature no longer matches
    tampered = header + "." + payload[:-1] + ("A" if payload[-1] != "A" else "B") + "." + sig
    with pytest.raises(AuthError, match="signature"):
        verify_access_token(tampered)

def test_wrong_audience_rejected():
    token = jwt.encode(
        {"sub": "usr-1", "aud": "https://other-service.example.com",
         "exp": int(time.time()) + 60},
        SECRET, algorithm="HS256",
    )
    with pytest.raises(AuthError, match="audience"):
        verify_access_token(token)

def test_alg_none_rejected():
    forged = jwt.encode({"sub": "attacker", "exp": int(time.time()) + 60},
                          key=None, algorithm="none")
    with pytest.raises(Exception):
        verify_access_token(forged)
~~~

### The senior testing doctrine for JWT

- Always include an **expired token** test and a **tampered signature** test — these are the two cases that separate "it compiles" from "it's actually secure."
- Test **wrong audience** and **wrong issuer** explicitly — these are the checks most often silently missing in real codebases.
- Test the **alg: none** and, if you support both symmetric and asymmetric verification anywhere, an **algorithm-confusion** attempt.
- For refresh-token flows, test that a **revoked refresh token** is rejected and that rotation invalidates the previous refresh token (if you rotate on use).
- Freeze time in tests (freezegun or monkeypatching time.time) rather than sleeping — expiry logic should never make your test suite slow.
`,

  debugging: `
### The toolbox, in escalation order

1. **Decode the token by hand first** — paste it into jwt.io (or decode locally as shown in Beginner Concepts) to read the header and payload before assuming anything about the bug. Never guess at claim contents.
2. **Check the obvious three**: is the current time past exp? Does aud match this exact service? Does iss match the expected issuer? A shocking share of "auth is broken" bugs are one of these three.
3. **Log the exact library exception**, not a generic "unauthorized" — jsonwebtoken and PyJWT both throw distinctly named errors (TokenExpiredError vs invalid signature vs invalid audience) that point straight at the cause.

~~~python
try:
    claims = jwt.decode(token, key, algorithms=["RS256"], audience=AUD, issuer=ISS)
except jwt.ExpiredSignatureError:
    log.warning("token expired")
except jwt.InvalidAudienceError:
    log.warning("token aud mismatch — wrong service?")
except jwt.InvalidSignatureError:
    log.error("signature mismatch — wrong key or tampered token")
except jwt.PyJWTError as exc:
    log.error("token rejected: %s", exc)
~~~

4. **Verify the key material matches**, not just "a key exists" — a stale cached public key after rotation is a classic cause of sudden, fleet-wide 401s. Check the kid in the token header against what your JWKS cache actually has.
5. **Reproduce with a minimal script** outside the framework: encode a token with the exact claims and key you expect, then decode it the same way production does, to isolate whether the bug is in token creation, verification config, or somewhere else in the request pipeline (e.g. a proxy stripping the Authorization header).
6. **Check clock skew** between issuing and verifying machines if tokens fail right at the edges of their validity window — a few seconds of leeway (leeway= in PyJWT, clockTolerance in jsonwebtoken) usually resolves false-negative expiry failures across distributed systems.

### Debugging JWKS-based verification specifically

- "Works for old tokens, fails for new ones" (or vice versa) after a deploy → almost always a JWKS cache that hasn't picked up a newly rotated key; check the cache refresh logic and force a refresh on a kid it doesn't recognize.
- Confirm you're hitting the correct JWKS URL for the correct environment — mixing a staging issuer's JWKS with a production issuer's tokens is a very easy configuration mistake.
`,

  monitoring: `
### What to measure

- **Token verification failure rate, broken down by reason** (expired, bad signature, wrong audience, wrong issuer, malformed) — a spike in one specific reason usually points at a specific bug or attack, not general noise.
- **Time-to-expiry distribution at verification time** — helps tune access-token lifetime: if most tokens are verified seconds before expiry, your lifetime may be too short and causing excess refresh traffic.
- **Refresh-token usage rate and refresh failures** — a spike in refresh failures often means client clock skew, a revoked session, or a bug in rotation logic.
- **JWKS fetch latency and cache hit rate** — a collapsing cache hit rate signals either a bug or a rotation event; JWKS fetch failures should page someone, since they can cascade into fleet-wide verification failures.

~~~python
from prometheus_client import Counter, Histogram

TOKEN_VERIFY = Counter(
    "jwt_verify_total", "Token verification attempts", ["result", "reason"]
)
JWKS_FETCH_LATENCY = Histogram("jwks_fetch_seconds", "JWKS endpoint fetch latency")

def verify_access_token(token: str) -> dict:
    try:
        claims = jwt.decode(token, get_key(token), algorithms=["RS256"],
                              audience=AUD, issuer=ISS)
        TOKEN_VERIFY.labels(result="success", reason="none").inc()
        return claims
    except jwt.ExpiredSignatureError:
        TOKEN_VERIFY.labels(result="failure", reason="expired").inc()
        raise
    except jwt.InvalidAudienceError:
        TOKEN_VERIFY.labels(result="failure", reason="bad_audience").inc()
        raise
    except jwt.PyJWTError:
        TOKEN_VERIFY.labels(result="failure", reason="other").inc()
        raise
~~~

### Alerting

Alert on a sudden rise in "bad signature" failures (potential forged-token attempts or a key mismatch after a bad deploy), and on JWKS endpoint errors (can silently take down verification fleet-wide). See the Observability category for the broader RED-metrics and tracing setup this plugs into.
`,

  deployment: `
### Key material handling in deployment

~~~dockerfile
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:/usr/local/bin:$PATH"
# The RSA private key is injected at runtime from a secrets manager — NEVER
# baked into the image. Only the public key (or its JWKS URL) is non-secret.
USER appuser
EXPOSE 8000
CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: non-root user limits blast radius if the container is compromised; the private signing key is deliberately excluded from the image and pulled from a vault/secrets manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager) at process start, so the key never lives in source control, CI logs, or a container registry.

### Rollout considerations specific to JWT

- **Key rotation must be a two-phase rollout**: publish the new public key alongside the old one in the JWKS response first, start signing with the new private key second, and only remove the old public key after every token signed with it has naturally expired.
- **Changing algorithm (e.g. HS256 to RS256) requires a migration window** where the verifier accepts both, tagged by kid or a version claim, until all old tokens have expired — never a hard cutover.
- **Health checks should exercise the actual verification path** (not just "is the process up") so a broken JWKS fetch or misconfigured key is caught by the readiness probe before it takes real traffic.
`,

  "production-checklist": `
Before a JWT-based auth system takes real traffic:

- [ ] Signing algorithm explicitly pinned on every verifier — never inferred from the token header
- [ ] Asymmetric signing (RS256/ES256) used wherever more than one service verifies tokens it doesn't issue
- [ ] HS256 secrets (if used) are at least 256 bits of cryptographically random data, stored in a secrets manager
- [ ] Access token expiry is short (minutes); refresh token expiry and rotation policy documented
- [ ] exp, nbf, aud, and iss are all validated on every verification path, with tests proving it
- [ ] "alg: none" and mixed-algorithm (RS256/HS256 confusion) attacks explicitly tested and rejected
- [ ] JWKS endpoint published, cached with sane TTL, and covered by an uptime/latency alert
- [ ] Key rotation runbook exists and has been rehearsed (add new key, dual-publish, cutover, retire old key)
- [ ] Token revocation strategy chosen and implemented (refresh-token revocation, deny-list, or token versioning)
- [ ] Token storage location on the client deliberately chosen (httpOnly cookie vs localStorage) with the matching CSRF/XSS mitigation in place
- [ ] No sensitive PII, secrets, or credentials present in any JWT payload
- [ ] TLS enforced everywhere the token travels; tokens never appear in URLs or query strings
- [ ] Verification failures are metric-tracked by reason, with alerting on anomalous spikes
- [ ] Clock-skew leeway configured to avoid false-negative expiry failures across distributed hosts
- [ ] Logout and "log out everywhere" flows tested end to end, not just the login flow
`,

  "common-mistakes": `
1. **Assuming a JWT is encrypted** — it's base64url-encoded and signed (JWS) in nearly all real usage; anyone can read the payload. Root cause: conflating "looks unreadable" with "is unreadable."
2. **Trusting the alg field from the token to choose the verification algorithm** — this is precisely how alg:none and algorithm-confusion attacks work. Root cause: convenience APIs that read the header before the developer thinks about trust boundaries.
3. **Setting no expiry, or an extremely long one** — turns a stateless token into a long-lived, unrevocable credential. Root cause: avoiding the "annoying" refresh flow instead of implementing it properly.
4. **Not validating aud/iss** — a token meant for one service gets accepted by another. Root cause: many tutorials show jwt.decode() with only a secret/key argument and skip these checks entirely.
5. **Reusing one HS256 secret across many independent services** — any one of them can now forge tokens for all the others. Root cause: treating "share a config value" as equivalent to "share trust."
6. **Putting large or sensitive data in the payload** — bloats every request and leaks data on interception. Root cause: JWT feels like "a place to put user data" rather than "a place to put a small set of trusted claims."
7. **No revocation plan until a real incident forces one** — teams often discover the stateless-revocation limitation only after needing to force-log-out a compromised account in production. Root cause: revocation is invisible until you need it.
8. **Storing the token in localStorage without considering XSS exposure**, or storing it in a cookie without considering CSRF exposure — either without a deliberate choice. Root cause: copying a tutorial's storage pattern without evaluating the actual threat model.
9. **Weak or committed-to-git signing secrets** — a secret checked into source control or reused from a tutorial example is trivially exploitable. Root cause: treating the secret like ordinary configuration instead of a credential.
10. **Not planning for key rotation from day one** — teams hardcode a single key with no kid or JWKS mechanism, then face a painful migration under time pressure the first time a key needs to change. Root cause: rotation feels like a "later" problem until a leak makes it urgent.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| jwt.ExpiredSignatureError / TokenExpiredError | exp timestamp has passed | Client should refresh via the refresh token; check clock sync if it happens unexpectedly early |
| jwt.InvalidSignatureError | Wrong key used to verify, or the token was tampered with | Confirm you're using the correct public key/secret and correct kid; check for accidental key mismatch across environments |
| jwt.InvalidAudienceError | aud claim doesn't match this service's expected audience | Confirm the token was actually issued for this service; check for cross-service token replay |
| jwt.InvalidIssuerError | iss claim doesn't match the trusted issuer | Verify issuer configuration; reject tokens from unexpected issuers |
| jwt.DecodeError / "Not enough segments" | Malformed token, or something (a proxy, a truncating log) mangled the string | Confirm the full Authorization header value is passed through unmodified |
| jwt.InvalidKeyError | Key format mismatch (e.g. passing a raw string where a PEM-formatted key object is expected) | Load and parse the key correctly for the algorithm family in use |
| 401 immediately after a key rotation deploy | JWKS cache serving a stale key set; kid in new tokens not found | Force JWKS cache refresh on kid-miss; verify dual-publish rollout was actually followed |
| "jwt malformed" from jsonwebtoken (Node) | Token isn't three dot-separated segments — often an accidentally double-encoded or truncated token | Log and inspect the raw header value being received |
| Works locally, fails in production with same code | Different SECRET/keys between environments, or algorithm mismatch (HS256 locally vs RS256 in prod config) | Align environment configuration; never let algorithm choice differ silently across environments |
| Silent acceptance of forged tokens | verify_exp/verify_signature disabled, or algorithms=["none"] left in from debugging | Remove all verification bypasses before merging; add a test that specifically checks these are rejected |
`,

  faqs: `
**Q: Is a JWT encrypted?**
No, not by default. A standard JWT is a JWS (signed) token — the payload is base64url-encoded, which anyone can decode without any secret. Encryption requires the separate, much less common JWE format. Never assume confidentiality from a JWT unless you've specifically verified it's a JWE.

**Q: Can I revoke a JWT?**
Not directly — a valid, unexpired signature will always verify successfully; there is no built-in "undo." Real systems mitigate this with short expiry, a revocable refresh token, a deny-list of jti values, or token versioning for mass invalidation. Choose based on how urgently you need revocation to take effect.

**Q: Should I use HS256 or RS256?**
Use RS256 (or ES256) whenever more than one service needs to verify tokens it doesn't itself issue — asymmetric keys mean verifiers can never forge tokens. Use HS256 only when a single trusted service both signs and verifies, and the secret never needs to be shared with a lower-trust party.

**Q: Where should I store a JWT on the client — localStorage or a cookie?**
It's a genuine tradeoff, not a solved problem: localStorage is readable by any JavaScript on the page (XSS risk) but immune to CSRF since it isn't auto-sent; an httpOnly cookie is invisible to JavaScript but auto-sent cross-site unless you configure SameSite and CSRF defenses. See the Security section and the Cookies & Sessions skill for the full tradeoff.

**Q: How is a JWT different from an OAuth access token or an OIDC ID token?**
JWT is a token *format*. OAuth 2.0 and OpenID Connect are protocols that define *how* tokens are obtained and used; in practice, most OAuth access tokens and virtually all OIDC ID tokens are implemented as JWTs. See the OAuth 2.0 / OIDC skill for the full protocol picture that JWT slots into.

**Q: Do I need JWT if I already use session cookies?**
Not necessarily — they solve overlapping problems differently. Session cookies with a server-side store are simpler to revoke and keep smaller on the wire; JWTs scale better across independently verifying services without a shared store. Many production systems use both: a session cookie for the browser-facing web app, and JWTs for API/service-to-service calls. See the Cookies & Sessions skill for the detailed comparison.

**Q: What's the safe minimum length for an HS256 secret?**
At least 256 bits (32 random bytes) of true cryptographic randomness, generated with a secure random source (Python's secrets module, Node's crypto.randomBytes) — never a memorable password or a short string.

**Q: Why did my token suddenly stop verifying after a deploy with no code change?**
The most common cause is a key rotation that wasn't rolled out with overlap — the new key started signing before the old (or new) public key was fully available to every verifier's JWKS cache. Always dual-publish keys during rotation.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What are the three parts of a JWT?* Header, payload, and signature, each base64url-encoded and joined with dots. Model answer: describe what each part contains and that header/payload are simply encoded, not encrypted.
2. *Is a JWT encrypted?* No — a standard JWT is signed (JWS), meaning its payload is readable by anyone; encryption requires the separate JWE format. Strong answers immediately note "never put secrets in the payload."
3. *What does the signature actually prove?* That the header and payload haven't been altered since signing, and (for asymmetric algorithms) who signed it — integrity and authenticity, not confidentiality.
4. *Name three registered claims and what they mean.* Any three of iss, sub, aud, exp, nbf, iat, jti with a correct one-line meaning each.
5. *What is the difference between an access token and a refresh token?* Access tokens are short-lived and sent on every API call; refresh tokens are long-lived, sent only to the auth server to mint new access tokens, and are typically the revocable half of the pair.
6. *Why must JWTs always be sent over HTTPS?* Because the payload is plaintext-readable to anyone intercepting the connection; TLS protects it in transit even though the token format itself provides no confidentiality.

**Senior:**

7. *Explain the "alg: none" vulnerability and how a modern library prevents it.* The spec permits an unsigned token; naive verifiers that read the algorithm from the token header would skip verification entirely. Modern libraries require the caller to pass an explicit algorithms allow-list and reject "none" by default. Strong answers connect this to the general principle: never let untrusted input choose its own verification method.
8. *Explain the RS256/HS256 algorithm-confusion attack.* If a verifier accepts both algorithms and (incorrectly) uses the RSA public key as the HMAC secret when it sees alg: HS256, an attacker who has the public key (which is, by definition, public) can forge a validly "signed" token. Fix: pin exactly one algorithm family per verifier and never derive it from the token.
9. *Why can't you truly revoke a stateless JWT, and how do you mitigate it in a real system?* Verification is pure signature math against exp — there's no server-side state to delete. Mitigations: short expiry, a revocable refresh token, a jti deny-list with TTL, or token versioning for instant mass invalidation. A senior answer picks a mitigation based on required revocation latency versus infrastructure cost.
10. *How would you design key rotation for a service issuing millions of RS256 tokens a day with zero downtime?* Generate a new key pair, publish both keys in JWKS keyed by kid, start signing new tokens with the new key, keep the old public key published until the last token signed with it expires, then retire it — always additive-then-subtractive, never a hard swap.
11. *Where would you store a JWT on a web client, and why?* There's no universally correct answer — walk through the XSS-vs-CSRF tradeoff between localStorage and an httpOnly SameSite cookie, and justify a choice based on the specific application's threat model (does it have first-party JS dependencies you fully control, is it a multi-domain SPA, etc.).
12. *A resource server needs to verify tokens issued by a completely separate auth server it doesn't control. Design the trust setup.* Asymmetric signing (RS256/ES256) at the auth server; the resource server fetches and caches the auth server's public JWKS, verifies aud (this resource server) and iss (the specific trusted auth server) on every token, and never trusts an unlisted issuer — this is exactly the OIDC federation pattern.
`,

  "coding-questions": `
### 1. Hand-decode a JWT without a library (tests understanding of the format, not just API usage)

~~~python
import base64
import hashlib
import hmac
import json

def b64url_decode(segment: str) -> bytes:
    padded = segment + "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(padded)

def decode_jwt(token: str) -> tuple[dict, dict]:
    """Decode header + payload WITHOUT verifying — useful for debugging only."""
    header_b64, payload_b64, _sig_b64 = token.split(".")
    header = json.loads(b64url_decode(header_b64))
    payload = json.loads(b64url_decode(payload_b64))
    return header, payload

def verify_hs256(token: str, secret: str) -> bool:
    """Manually re-implement HS256 signature verification."""
    header_b64, payload_b64, sig_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected_sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    actual_sig = b64url_decode(sig_b64)
    # constant-time comparison prevents timing attacks against the secret
    return hmac.compare_digest(expected_sig, actual_sig)
~~~

Complexity: O(n) in token length for both decode and verify. Follow-ups they'll ask: why hmac.compare_digest instead of ==? (Timing-attack resistance — == short-circuits on the first mismatched byte, leaking information about how much of the guess was correct.) What's missing versus a real library? (exp/nbf/aud/iss checks, algorithm allow-listing, key rotation support.)

### 2. Design and implement a token-versioning revocation mechanism

~~~python
import time
import jwt

SECRET = "prod-secret-loaded-from-vault"

class UserStore:
    """Simplified in-memory stand-in for a real user table."""
    def __init__(self):
        self._versions: dict[str, int] = {}

    def get_version(self, user_id: str) -> int:
        return self._versions.get(user_id, 0)

    def bump_version(self, user_id: str) -> None:
        """Call this on password change, logout-everywhere, or account ban."""
        self._versions[user_id] = self.get_version(user_id) + 1

def issue_token(user_id: str, store: UserStore, ttl_seconds: int = 900) -> str:
    now = int(time.time())
    return jwt.encode(
        {"sub": user_id, "ver": store.get_version(user_id),
         "iat": now, "exp": now + ttl_seconds},
        SECRET, algorithm="HS256",
    )

def verify_token(token: str, store: UserStore) -> dict:
    claims = jwt.decode(token, SECRET, algorithms=["HS256"])
    if claims["ver"] != store.get_version(claims["sub"]):
        raise PermissionError("token revoked: version mismatch")
    return claims
~~~

Complexity: O(1) verification overhead beyond normal signature checking — one integer comparison against a store lookup. Follow-ups: how would you scale get_version to avoid a database hit on every request? (Cache it with a short TTL, or embed the version and accept a small revocation-latency window equal to the cache TTL.) How does this compare to a jti deny-list? (Versioning revokes ALL of a user's tokens in one write; a deny-list revokes individual tokens but needs one entry per revoked token.)

### 3. Build a minimal JWKS-based verifier with key caching

~~~python
import time
import jwt
from jwt import PyJWKClient

class CachedJWKSVerifier:
    """Wraps PyJWKClient to verify RS256 tokens against a rotating key set."""
    def __init__(self, jwks_url: str, audience: str, issuer: str):
        self.client = PyJWKClient(jwks_url, cache_keys=True, lifespan=300)
        self.audience = audience
        self.issuer = issuer

    def verify(self, token: str) -> dict:
        signing_key = self.client.get_signing_key_from_jwt(token)  # matches kid
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],          # pinned — never derived from the token
            audience=self.audience,
            issuer=self.issuer,
            leeway=10,                      # tolerate small clock skew
        )
~~~

Complexity: amortized O(1) per verification thanks to caching; a cache miss costs one HTTP round trip to the JWKS endpoint. Follow-ups: what happens on a rotation the cache hasn't seen yet? (PyJWKClient refreshes on an unrecognized kid.) How would you add a circuit breaker if the JWKS endpoint is down? (Serve from the last-known-good cache with an alert, rather than failing every request.)
`,

  "hands-on-labs": `
### Lab 1 — Decode and verify by hand (beginner, ~1h)
Take a real JWT (mint one with jwt.io's debugger or PyJWT), write a script with zero JWT libraries that base64url-decodes the header and payload, then manually recomputes and compares an HS256 signature using hmac and hashlib. Deliverable: a script plus a short write-up of exactly what the signature check proves and doesn't prove. Skills: base64url encoding, HMAC, the core JWT mental model.

### Lab 2 — Build access + refresh token issuance (intermediate, ~2h)
Implement a small FastAPI or Express service with /login (issues a 15-minute access token and a 14-day refresh token, storing the refresh token server-side), /me (verifies the access token and returns the user), and /token/refresh (validates the refresh token against storage and issues a new access token). Add tests for expired access tokens, revoked refresh tokens, and rotation on refresh. Skills: the full access/refresh pattern, revocation basics.

### Lab 3 — RS256 with JWKS and key rotation (advanced, ~3h)
Stand up an auth server that signs with RS256 and publishes a JWKS endpoint with a kid, and a separate resource server that verifies purely from the cached JWKS with no direct connection to the auth server. Then rotate the key (add a new key pair, dual-publish, cut over signing, retire the old key) without breaking already-issued, still-valid tokens. Skills: asymmetric signing, JWKS, zero-downtime key rotation.

### Lab 4 — Instrument, secure, and deploy (production, ~3h)
Take Lab 3's system and add: Prometheus counters for verification failures by reason, structured logs with a correlation ID, a token-versioning "log out everywhere" endpoint, explicit tests for alg:none and RS256/HS256 confusion attacks (both must be rejected), and a multi-stage Docker deployment where the private key is injected from an environment secret at runtime, never baked into the image. Skills: the entire production and security sections, end to end.
`,

  "real-projects": `
Portfolio-grade projects, each mapping to skills employers screen for in auth/security-adjacent roles:

1. **Multi-service auth gateway** — A central auth server issuing RS256 JWTs plus two independent "resource" microservices that verify tokens purely via a shared JWKS endpoint, with zero direct network calls between resource servers and the auth server on the request path. Demonstrates: asymmetric signing, JWKS-based zero-trust verification, and the core JWT architecture pattern used industry-wide.

2. **Secure SPA + API with a revocation story** — A single-page app talking to a backend API, using httpOnly SameSite cookies for the JWT (not localStorage), CSRF protection on state-changing routes, short-lived access tokens, a revocable refresh-token store, and a working "log out everywhere" endpoint built on token versioning. Demonstrates: real-world client-storage tradeoffs, CSRF/XSS mitigation, and the revocation problem solved end to end.

3. **JWT security test harness** — A tool (CLI or small web app) that takes a JWT and a target verifier configuration and automatically attempts a battery of known attacks: alg:none, RS256/HS256 confusion, expired-token replay, missing-audience acceptance, and weak-secret brute force (against a deliberately weak test secret) — reporting pass/fail for each. Demonstrates: deep security understanding and the ability to build tooling that measurably raises a codebase's security bar — genuinely useful and portfolio-differentiating.

Each project: full test suite covering the attack cases above (not just happy paths), a README explaining the threat model and design decisions, and — for the gateway project — an architecture diagram showing where trust boundaries actually are.
`,

  "case-studies": `
### Auth0's algorithm-confusion research
Auth0's security team published widely cited research demonstrating that several popular JWT libraries, when misconfigured to accept multiple algorithm families, were vulnerable to the RS256/HS256 key-confusion attack — an attacker could use a service's own public key as an HMAC secret to forge valid-looking tokens. Lesson: a cryptographically sound token format can still be broken entirely by an application-level trust decision (accepting the algorithm from the token itself); modern library defaults (mandatory explicit algorithms allow-lists) exist specifically because of this research.

### RFC 8725 — "JSON Web Token Best Current Practices"
Years after the original JWT RFCs shipped, the IETF published a dedicated best-practices document codifying lessons from real-world incidents: always validate all applicable claims, never trust an unsecured "none" algorithm, be explicit about algorithm allow-lists, and be careful with claim value comparisons. Lesson: a spec being technically correct doesn't guarantee safe usage — a widely deployed standard often needs a second, hard-won "here's how people actually got it wrong" document.

### Large identity providers standardizing on JWKS + rotation (Google, Microsoft, AWS Cognito)
Every major identity provider converged independently on the same operational pattern: publish public signing keys at a well-known JWKS URL, tag each with a kid, and rotate on a schedule with overlapping validity. Lesson: this isn't a one-off clever trick, it is the industry-settled answer to "how do you rotate asymmetric keys without breaking already-issued tokens," and any new system issuing JWTs should adopt it rather than inventing a bespoke rotation scheme.

### The "JWT vs sessions" architecture debate at scale
Numerous engineering teams (documented across conference talks and blog postmortems industry-wide) have moved from stateless JWTs back toward session-based or hybrid models after hitting the revocation problem in production — typically after a security incident required force-logging-out users and the team realized it had no fast lever to pull. Lesson: the choice between stateless and stateful auth should be made deliberately up front, with a concrete revocation plan, not discovered under incident pressure. This exact tradeoff is explored fully in the Cookies & Sessions skill.
`,

  comparisons: `
| Dimension | JWT (stateless) | Server-side session (opaque ID + store) | Opaque OAuth token + introspection | PASETO |
|-----------|------------------|-------------------------------------------|--------------------------------------|--------|
| Self-contained | Yes — claims travel with the token | No — server must look up the session | No — resource server must call back to introspect | Yes |
| Revocation | Hard (mitigations needed) | Trivial — delete the session row | Trivial — the issuing server controls state | Same limitation as JWT |
| Verification cost | Local crypto check, no DB hit | DB/cache lookup every request | Network round trip to the auth server | Local crypto check |
| Cross-service scaling | Excellent — any holder of the key verifies | Needs a shared store (e.g. Redis) | Needs a live connection to the auth server | Excellent |
| Payload readability | Readable by anyone (JWS) unless JWE used | N/A — opaque ID reveals nothing | N/A — opaque token reveals nothing | Readable unless using "local" (encrypted) mode |
| Algorithm-confusion risk | Real, must be defended against | N/A | N/A | Designed to eliminate this class by removing algorithm agility |
| Best fit | Multi-service, cross-domain, or high-throughput APIs | Single web app, need instant revocation | OAuth systems that need central control over every check | Teams that want JWT-like ergonomics with fewer footguns |

**How seniors choose**: reach for JWT when multiple independently-scaling services need to verify identity without a shared dependency, and you're willing to design a real revocation strategy up front. Reach for server-side sessions when a single application owns the whole auth surface and instant revocation matters more than horizontal-verification simplicity. Reach for opaque tokens with introspection when the auth server must retain full, real-time control over every token's validity (common in strict OAuth deployments). PASETO is worth knowing about as "JWT's designers' second attempt" — it deliberately removes algorithm agility (the root cause of alg:none and confusion attacks) at the cost of being less universally supported than JWT today.
`,

  "related-technologies": `
- **OAuth 2.0 / OIDC** — the protocols that define how JWTs are actually obtained and used in most real systems; see the OAuth 2.0 / OIDC skill for the full authorization-code flow, scopes, and how ID tokens vs access tokens differ.
- **Cookies & Sessions** — the stateful alternative and the natural next read for the storage-tradeoff and revocation discussions on this page.
- **RBAC** — role-based authorization frequently keyed off a "role" custom claim carried in the JWT payload.
- **ABAC** — attribute-based authorization that can consume any of a JWT's claims (tenant, department, clearance level) as policy inputs.
- **JWKS / JOSE / JWK** — the surrounding key-representation and rotation standards this page relies on for asymmetric verification.
- **PASETO** — a security-hardened alternative token format that removes algorithm agility to close an entire vulnerability class by design.
- **TLS** — the transport-layer requirement every JWT deployment depends on; JWT provides no confidentiality of its own in transit.
- **Secrets Management** (e.g. HashiCorp Vault, AWS Secrets Manager) — where signing keys and HMAC secrets must actually live, never in code.
- **API Gateway / Load Balancer** platforms — many (AWS API Gateway, Kong, Envoy) can verify JWTs directly at the edge, offloading verification from application code.

On this platform, the natural next pages: **OAuth 2.0 / OIDC** → **Cookies & Sessions** → **RBAC** → **ABAC** for the complete authentication-and-authorization stack.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check the IETF datatracker and RFC index for anything newer.

- **RFC 8725 "JSON Web Token Best Current Practices"** (2020) remains the primary consolidated guidance document; if you read one JWT security reference beyond the base RFCs, read this one.
- **DPoP (Demonstrating Proof of Possession, RFC 9449)** and **OAuth 2.0 Mutual-TLS (RFC 8705)** are increasingly adopted extensions that bind a token to a specific client key or certificate, closing the "stolen bearer token works anywhere" gap that plain JWTs have by design — worth knowing as the direction high-security deployments are heading.
- **PASETO** continues to gain adoption in security-conscious teams as a JWT alternative that removes algorithm agility entirely, though JWT remains overwhelmingly dominant due to ecosystem and identity-provider support.
- **Passkeys and WebAuthn** are changing the *login* step (how a user first authenticates) but do not replace JWT's role afterward as the token format carrying the resulting session/authorization state — the two layers are complementary, not competing.
- Major identity providers (Auth0/Okta, Microsoft Entra ID, AWS Cognito, Google Identity) continue to standardize around JWKS-based rotation and short-lived access tokens paired with revocable refresh tokens as documented best practice.

Given how foundational and stable the core JWT spec is, expect the "latest updates" in this space to be mostly about surrounding practices (DPoP, sender-constrained tokens, best-practice documents) rather than changes to the token format itself — verify anything version-specific directly against the IETF datatracker before relying on it.
`,

  "future-roadmap": `
Where JWT-adjacent auth is heading, and what's worth betting career time on:

1. **Sender-constrained tokens become the norm for high-value APIs.** Plain bearer JWTs are valid for anyone holding them; DPoP and mTLS-bound tokens bind a token to a specific client key, so a stolen token alone isn't enough to use it. Expect this to spread from banking/fintech into broader enterprise API usage.
2. **Shorter-lived tokens, more automated refresh.** As tooling for silent, reliable refresh matures, expect default access-token lifetimes to keep shrinking (many providers already default to well under an hour), further reducing the practical impact of JWT's revocation limitation.
3. **PASETO and similarly "footgun-resistant" formats slowly gain ground** in security-first organizations, though JWT's enormous ecosystem and identity-provider support make a full displacement unlikely in the near term — knowing both is the safer bet.
4. **Passwordless and passkey-based login flows** change how a session begins, but the token that represents "you're logged in" to downstream services is very likely to remain JWT (or a close cousin) for the foreseeable future — these are complementary layers, not substitutes.
5. **Standardized revocation signaling** (e.g. OpenID Shared Signals / CAEP-style continuous access evaluation) is an active area aiming to give stateless-token architectures a near-real-time way to propagate "this session should end now" without fully abandoning statelessness.

For your career: the durable, high-leverage knowledge is the trust-boundary reasoning (never trust the token to describe its own verification) and the revocation tradeoff analysis — those transfer across JWT, PASETO, and whatever comes next, even as specific library APIs and provider defaults keep evolving.
`,

  "cheat-sheet": `
~~~text
# --- Structure ---
header.payload.signature   (all base64url; header/payload = JSON)
Encoding, NOT encryption — anyone can read header + payload.

# --- Registered claims ---
iss  issuer            sub  subject (user id)
aud  audience           exp  expiration (Unix ts) — REQUIRED to check
nbf  not-before          iat  issued-at
jti  unique token id   (custom claims: role, tenant_id, etc.)

# --- Algorithms ---
HS256  symmetric  — one shared secret signs AND verifies
RS256  asymmetric — private key signs, public key verifies
ES256  asymmetric — smaller/faster than RS256 at same security

# --- Golden rule ---
Verifier PINS the algorithm explicitly. NEVER read alg from the token
to decide how to verify — this is the root cause of alg:none and
RS256/HS256 confusion attacks.

# --- PyJWT ---
token = jwt.encode(claims, SECRET, algorithm="HS256")
claims = jwt.decode(token, SECRET, algorithms=["HS256"],
                     audience=AUD, issuer=ISS, leeway=10)

# --- Access vs refresh ---
access token   — minutes, sent every request, stateless verify
refresh token  — days/weeks, sent only to auth server, revocable

# --- Revocation mitigations (pick based on urgency) ---
1. short expiry            2. revoke the refresh token
3. jti deny-list (Redis)   4. token versioning (mass invalidation)

# --- Storage tradeoff ---
localStorage      -> XSS can read it,  immune to CSRF
httpOnly cookie   -> XSS can't read it, needs CSRF defense (SameSite)

# --- JWKS / rotation ---
GET /.well-known/jwks.json -> [{kid, kty, n, e, alg}, ...]
Rotate: publish new key alongside old -> sign with new -> retire old
        after every old-signed token has expired.

# --- Never do ---
alg:none accepted · verify_exp disabled · secrets in payload ·
weak/short HS256 secret · single algorithm shared across trust levels
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What are the three parts of a JWT? | Header, payload, signature — dot-separated, base64url-encoded |
| Is a JWT encrypted? | No, by default it's signed (JWS) — payload is world-readable; JWE is the (rare) encrypted variant |
| What does the signature actually verify? | Integrity and authenticity of header+payload — not confidentiality |
| HS256 vs RS256 — key difference? | HS256 is symmetric (one shared secret signs and verifies); RS256 is asymmetric (private key signs, public key verifies) |
| When must you use asymmetric signing? | Whenever more than one service verifies tokens it doesn't itself issue |
| What is the alg:none attack? | A crafted token claims no signature is required; defended against by never trusting the token's own alg field |
| What is algorithm confusion (RS256/HS256)? | Using a public RSA key as an HMAC secret because a verifier trusted the token's stated algorithm |
| Can a stateless JWT be revoked directly? | No — it's valid until exp; mitigate with short expiry, refresh-token revocation, deny-lists, or token versioning |
| Access token vs refresh token? | Short-lived + stateless verification vs long-lived + typically revocable server-side |
| Where should sensitive data go — in the payload? | Never — it's readable by anyone holding the token |
| localStorage vs httpOnly cookie for JWT storage? | localStorage: XSS-exposed, CSRF-immune. httpOnly cookie: XSS-safe, needs CSRF defense |
| What is a JWKS? | A published JSON document of an issuer's current public signing keys, keyed by kid, used for verification and rotation |
| What must every verifier explicitly check besides the signature? | exp, nbf, aud, iss |
| Minimum safe HS256 secret strength? | At least 256 bits of cryptographically random data |
| What claim enables per-token revocation tracking? | jti (JWT ID) |
`,

  mcqs: `
**1. What does base64url encoding provide for a JWT's payload?**

A) Encryption  B) Compression  C) A reversible text encoding, not confidentiality  D) Digital signing

**Answer: C** — base64url is purely an encoding scheme; anyone can decode it without a secret.

**2. A verifier accepts both HS256 and RS256, and uses the RSA public key as the HMAC secret when it sees alg: HS256. What attack does this enable?**

A) alg:none forgery  B) Algorithm-confusion token forgery  C) CSRF  D) SQL injection

**Answer: B** — since the public key is, by definition, public, an attacker can compute a valid HMAC signature using it, forging a token the verifier accepts.

**3. Which of these should always be validated on every JWT verification, beyond the signature itself?**

A) Only exp  B) Only aud  C) exp, nbf, aud, and iss  D) None — signature validity is sufficient

**Answer: C** — signature validity alone doesn't confirm the token hasn't expired or wasn't meant for a different audience/issuer.

**4. Why can't a stateless JWT be revoked the way a database session row can be deleted?**

A) JWTs don't have an expiration field  B) Verification is purely cryptographic against embedded claims, with no server-side record to delete  C) JWTs are encrypted so servers can't read them  D) JWTs are stored in cookies only

**Answer: B** — there's no central record; mitigations like refresh-token revocation or deny-lists are needed to approximate revocation.

**5. Storing a JWT in localStorage instead of an httpOnly cookie primarily changes exposure to which two risks?**

A) SQL injection and CSRF  B) XSS and CSRF  C) DNS spoofing and XSS  D) Clickjacking and SQL injection

**Answer: B** — localStorage is readable by any page JavaScript (XSS risk) but not auto-sent cross-site (CSRF-immune); cookies are the inverse.

**6. What is the primary purpose of a JWKS endpoint?**

A) To store user passwords  B) To publish an issuer's current public signing keys for verifiers to fetch and cache, enabling key rotation  C) To encrypt JWT payloads  D) To log every issued token

**Answer: B** — JWKS lets verifiers fetch the correct public key (matched by kid) without hardcoding it, and enables rotation without breaking already-issued tokens.
`,

  "revision-notes": `
**Structure in 4 lines:** A JWT is header.payload.signature, each part base64url-encoded. Header names the algorithm and type. Payload holds registered claims (iss, sub, aud, exp, nbf, iat, jti) plus custom claims. The signature proves integrity/authenticity — it is not encryption, and the payload is readable by anyone holding the token unless you're specifically using JWE.

**Signing in 3 lines:** HS256 is symmetric — one shared secret both signs and verifies, so anyone who can verify can also forge. RS256/ES256 are asymmetric — a private key signs, a public key verifies, so verifiers can never forge. Use asymmetric whenever more than one service verifies tokens it doesn't issue.

**Security in 5 lines:** Never let the token's own alg field decide the verification algorithm — that's the root cause of alg:none and RS256/HS256 confusion attacks. Always validate exp, nbf, aud, and iss explicitly. Use long, random HS256 secrets or asymmetric keys stored in a secrets manager. Never put sensitive data in the payload. Rotate keys via a published JWKS with kid, dual-publishing during transition.

**The revocation problem in 3 lines:** A signed JWT is valid until exp — there is no built-in revoke. Mitigate with short access-token expiry, a revocable refresh token, a jti deny-list, or token versioning for instant mass invalidation (the strongest, cheapest-per-write option for "log out everywhere").

**Production in 4 lines:** Pair a short-lived stateless access token with a long-lived, revocable refresh token. Choose client storage (httpOnly cookie vs localStorage) deliberately based on your XSS/CSRF threat model. Use battle-tested libraries (PyJWT, jsonwebtoken, jose) — never hand-roll signing. JWT underlies OAuth 2.0 access tokens and OIDC ID tokens, and its claims commonly feed RBAC/ABAC authorization decisions downstream.
`,

  "learning-roadmap": `
A realistic path to production-grade JWT competence:

**Week 1 — Structure and fundamentals.** Beginner Concepts + Lab 1 (hand-decode a JWT). Daily: decode a few real tokens (from jwt.io examples) by hand, identify every claim. Milestone: explain to someone else, without notes, exactly why a JWT is not encrypted.

**Week 2 — Signing and libraries.** Intermediate Concepts: HS256 vs RS256, PyJWT/jsonwebtoken usage, access/refresh patterns. Lab 2 (build issuance + refresh). Milestone: a working login → access token → protected route → refresh flow.

**Week 3 — Security depth.** Advanced Concepts + Security section: alg:none, algorithm confusion, the revocation problem and its mitigations. Write tests for every attack in the Testing section. Milestone: a test suite that specifically rejects alg:none and algorithm-confusion attempts.

**Week 4 — Asymmetric keys, JWKS, and rotation.** Lab 3 (RS256 + JWKS + zero-downtime rotation). Read the Internal Working and Architecture sections closely. Milestone: rotate a signing key in your lab system without invalidating any still-valid token.

**Week 5 — Production hardening.** Deployment, Monitoring, Production Checklist sections; Lab 4 (secrets injection, metrics, versioned revocation). Milestone: a containerized service where the private key is never in the image and verification failures are tracked by reason.

**Week 6 — Interview and system-design polish.** Interview Questions and Coding Questions sections; be able to design the storage tradeoff, revocation strategy, and multi-service trust setup out loud, unprompted.

Then continue to **OAuth 2.0 / OIDC** on this platform — it's the protocol layer that governs how the JWTs you now understand deeply actually get issued and exchanged in real federated systems, followed by **Cookies & Sessions**, **RBAC**, and **ABAC** to complete the authentication-and-authorization stack.
`,

  "official-docs": `
- [RFC 7519 — JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519) — the core spec defining the token structure and registered claims.
- [RFC 7515 — JSON Web Signature (JWS)](https://www.rfc-editor.org/rfc/rfc7515) — defines how signing actually works; read this to understand what "JWT" means in ~95% of real usage.
- [RFC 7516 — JSON Web Encryption (JWE)](https://www.rfc-editor.org/rfc/rfc7516) — the less common encrypted variant.
- [RFC 7517 — JSON Web Key (JWK)](https://www.rfc-editor.org/rfc/rfc7517) and [RFC 7518 — JSON Web Algorithms (JWA)](https://www.rfc-editor.org/rfc/rfc7518) — key representation and the algorithm catalog (HS256, RS256, ES256, etc.).
- [RFC 8725 — JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725) — read this after the core spec; it directly addresses alg:none, algorithm confusion, and claim-validation pitfalls.
- [jwt.io](https://jwt.io/) — the canonical interactive debugger for decoding and inspecting real tokens; also hosts a curated library list per language.
- [PyJWT documentation](https://pyjwt.readthedocs.io/) — this platform's own backend reference implementation for Python JWT handling.
- [jsonwebtoken (npm) documentation](https://github.com/auth0/node-jsonwebtoken) — the standard Node.js library's README doubles as excellent usage documentation.
`,

  books: `
- **OAuth 2.0 Simplified** — Aaron Parecki. Doesn't focus solely on JWT, but the best short, clear treatment of how JWTs fit inside real OAuth/OIDC flows.
- **Web Security for Developers** — Malcolm McDonald. Approachable coverage of the broader threat model (XSS, CSRF) that directly informs JWT storage decisions.
- **API Security in Action** — Neil Madden. Deep, practical coverage of token-based API authentication including JWT pitfalls, written by a security practitioner; excellent for the production/security sections of this page.
- **The Web Application Hacker's Handbook** — Stuttard & Pinto. Not JWT-specific, but foundational for understanding the attacker mindset behind algorithm-confusion and forgery attacks.
- **Solving Identity Management in Modern Applications** — Yvonne Wilson & Abhishek Hingnikar. Practical, vendor-informed coverage of tokens, sessions, and identity architecture end to end.
`,

  blogs: `
- **Auth0 Blog** (auth0.com/blog) — the single highest-signal source on JWT security specifically; originated much of the public algorithm-confusion research.
- **Okta Developer Blog** (developer.okta.com/blog) — practical, example-heavy JWT and OIDC content from another major identity provider's perspective.
- **Ping Identity Blog** — deep OAuth/OIDC/JWT protocol-level writing from engineers directly involved in authoring the specs.
- **Troy Hunt's blog** (troyhunt.com) — broader web security writing that frequently covers real-world token and session vulnerabilities with concrete incident detail.
- **PortSwigger Web Security Academy** (portswigger.net/web-security) — free, hands-on labs specifically covering JWT attacks (alg:none, algorithm confusion, weak secrets) with a real testing environment.
- **IETF OAuth Working Group mailing list / datatracker** — for anyone who wants to track the actual evolution of the specs (DPoP, best-practices updates) at the source.
`,

  "research-papers": `
JWT itself is a specification (RFC), not a subject of academic papers in the traditional sense — the closest "papers" are the RFCs and their best-practices companion:

- **RFC 7519, 7515, 7516, 7517, 7518** — the core JOSE/JWT specification set; read as primary sources, not secondary summaries.
- **RFC 8725 "JSON Web Token Best Current Practices"** — the closest thing to a "lessons learned" research document, synthesizing years of real-world vulnerability reports into concrete guidance.
- **RFC 9449 "OAuth 2.0 Demonstrating Proof of Possession (DPoP)"** — recent standards-track work addressing bearer-token theft, directly relevant to where JWT-based auth is heading.

For genuine academic depth, the closest foundational reading is general applied-cryptography and protocol-security literature rather than JWT-specific papers: study public-key cryptography and HMAC construction fundamentals (any standard applied cryptography textbook, e.g. **"Serious Cryptography"** by Jean-Philippe Aumasson) to fully understand why algorithm-confusion and weak-secret attacks work at the mathematical level, and read the OAuth 2.0 Security Best Current Practice (RFC 9700) for the protocol-level context JWTs operate within.
`,

  videos: `
- **PortSwigger's "JWT attacks" video series and labs** — practical, hands-on demonstrations of alg:none, algorithm confusion, and weak-secret cracking against a real testing target.
- **Auth0's conference talks on JWT security** (various PyCon/security conference recordings) — the team that popularized the algorithm-confusion research explaining it directly.
- **"OAuth 2.0 and OpenID Connect (in plain English)"** — Nate Barbettini (originally an Okta engineer) — an accessible, widely recommended walkthrough of where JWTs fit into OAuth/OIDC flows.
- **IETF OAuth Working Group session recordings** (datatracker.ietf.org) — for anyone who wants to see the actual standards process shaping DPoP and best-practices updates.
- **Conference talks on the "JWT vs sessions" debate** — search recent AppSec/OWASP conference archives for practitioner postmortems on choosing (and sometimes reversing) a stateless-JWT architecture; framing changes yearly so search for recent talks rather than relying on a single fixed reference.
`,

  "github-repos": `
- [jwt-dot-io/jwt.io](https://github.com/jwt-dot-io) and the [jwt.io](https://jwt.io) site itself — the reference decoder and curated library list per language.
- [jpadilla/pyjwt](https://github.com/jpadilla/pyjwt) — this platform's reference Python implementation; read the source, it's compact and well-commented.
- [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — the standard Node library; study the verify() options for a concrete look at algorithm pinning and claim validation.
- [panva/jose](https://github.com/panva/jose) — a modern, spec-complete JOSE (JWS/JWE/JWK) implementation for JavaScript built on the Web Crypto API; excellent for seeing JWE handled properly.
- [golang-jwt/jwt](https://github.com/golang-jwt/jwt) — the standard Go implementation, useful for comparing API design across languages.
- [ticarpi/jwt_tool](https://github.com/ticarpi/jwt_tool) — a security-testing tool specifically built to probe JWT implementations for alg:none, algorithm confusion, and weak secrets; excellent for the security testing lab.
- [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) — includes a dedicated JSON Web Token cheat sheet with concrete secure-implementation guidance.
- [PortSwigger/JWT-labs material](https://portswigger.net/web-security/jwt) — not a repo per se, but the accompanying hands-on lab environment is an essential practical companion.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Format fluency*: decode 5 real-world JWTs (from public API docs or jwt.io examples) entirely by hand — no library — identifying every registered and custom claim.
2. *Signing mechanics*: implement HS256 signing and verification from scratch using only hmac/hashlib (or your language's equivalent), then verify it interoperates correctly with a real JWT library's output.
3. *Attack simulation*: using PortSwigger's Web Security Academy JWT labs, complete the alg:none, algorithm-confusion (RS256/HS256), and weak-secret-brute-force labs.
4. *Revocation design*: implement all three revocation mitigations (refresh-token revocation, jti deny-list, token versioning) against the same sample application, and write a short comparison of latency, storage cost, and revocation speed for each.
5. *Key rotation*: build a two-key JWKS endpoint and simulate a full rotation cycle (add key, dual-publish, cutover signing, retire old key) while continuously verifying a stream of both old and new tokens without any verification failures during the transition.
6. *Storage tradeoff*: build the same login flow twice — once storing the JWT in localStorage, once in an httpOnly SameSite cookie with CSRF protection — and write a short threat-model comparison of what each implementation is and isn't protected against.
7. *System design*: design (on paper/whiteboard) the full token architecture for a system with one auth server and five independently-scaling resource microservices, including key rotation, revocation strategy, and token lifetimes — then defend the design against a peer playing "attacker."

External sets: OWASP Web Security Testing Guide (authentication and session-management chapters), PortSwigger Web Security Academy's JWT category, and any OAuth 2.0/OIDC conformance test suite (for teams building an actual issuer) for protocol-level rigor beyond JWT alone.
`,

  "architecture-diagram": `
The reference production architecture for JWT-based auth across multiple independently-scaling services:

~~~mermaid
flowchart TB
    Client["Client (web/mobile)"] -->|1. login| AuthAPI["Auth Server API"]
    AuthAPI --> AuthDB[("Auth DB\nusers, token_version, refresh tokens")]
    AuthAPI -->|signs with private key| KeyStore["Private signing key\n(secrets manager, never in image)"]
    AuthAPI -->|2. access + refresh token| Client

    AuthAPI -->|publishes public keys| JWKS["JWKS endpoint\n(kid-tagged, cached by verifiers)"]

    Client -->|3. Authorization: Bearer access_token| Gateway["API Gateway / Load Balancer"]
    Gateway --> Svc1["Resource Service A"]
    Gateway --> Svc2["Resource Service B"]
    Svc1 -->|verify locally, cached key| JWKS
    Svc2 -->|verify locally, cached key| JWKS

    Client -->|4. refresh on expiry| AuthAPI

    subgraph Observability
        Metrics["Verification failure metrics by reason"]
        Logs["Structured logs w/ correlation id"]
    end
    Svc1 -.-> Observability
    Svc2 -.-> Observability
    AuthAPI -.-> Observability
~~~

Every resource service verifies independently and locally against a cached JWKS — the auth server is only contacted at login and refresh, which is the entire architectural point of using JWT in the first place.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((JWT))
    Structure
      Header (alg, typ)
      Payload (claims)
      Signature
      base64url != encryption
    Claims
      Registered: iss sub aud exp nbf iat jti
      Custom claims
    Signing
      HS256 symmetric
      RS256 / ES256 asymmetric
      JWS vs JWE
    Security
      alg:none attack
      Algorithm confusion
      Weak HS256 secrets
      Missing exp/aud/iss checks
      Storage: localStorage vs httpOnly cookie
    Lifecycle
      Access token (short-lived)
      Refresh token (revocable)
      Revocation mitigations
        Short expiry
        Deny-list (jti)
        Token versioning
      JWKS and key rotation
    Ecosystem
      OAuth 2.0 / OIDC
      Cookies and Sessions
      RBAC / ABAC
      PyJWT / jsonwebtoken / jose
    Practice
      Interview reflexes
      Coding labs
      Security test harness
~~~
`,
};

export default jwt;
