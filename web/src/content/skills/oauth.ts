import type { SkillContent } from "../types";

/**
 * OAuth 2.0 / OIDC — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const oauth: SkillContent = {
  overview: `
OAuth 2.0 is an **authorization** framework: a set of rules that let a user grant a third-party application limited access to their data on another service, without ever handing over their password. When you click "Continue with Google" on some app and it asks "this app wants to see your email and profile" — that consent screen, and everything that makes it work safely, is OAuth 2.0.

The single most important sentence on this page: **OAuth 2.0 is about authorization (what you're allowed to do), not authentication (who you are)**. OAuth was designed to answer "can this application read my Google Contacts?" — it was never designed to answer "who is logging into this app?" That mismatch caused years of insecure home-grown "login with X" implementations, which is exactly why **OpenID Connect (OIDC)** was layered on top in 2014: a thin, standardized identity layer that reuses OAuth's flows but adds a purpose-built identity token and a formal way to ask "who is this user?" Today, when people say "OAuth login," they almost always mean OAuth 2.0 + OIDC together.

For an AI engineer this topic is unavoidable: every SaaS product needs "Sign in with Google/GitHub/Microsoft," every AI agent that calls a user's calendar, email, or Slack on their behalf needs delegated, scoped access, and every API you protect (including LLM-backed APIs) benefits from OAuth's token model instead of ad-hoc API keys. Agentic AI systems in particular increasingly need to act on a user's behalf against third-party APIs — that is exactly the problem OAuth was built to solve, decades before "agents" existed.

Key characteristics: it is a **delegation protocol**, not a login protocol on its own; it works over HTTPS with redirects and back-channel HTTP calls; it issues short-lived **access tokens** (often JWTs — see the **JWT** skill) instead of passwords; it defines multiple **grant types** for different client shapes (web app, mobile app, machine, TV); and it is deliberately silent about session management on the client, which is why OAuth in a browser app is usually paired with **Cookies & Sessions** (see that skill) to keep the user logged in between requests.
`,

  history: `
OAuth grew out of a very concrete 2006 problem: Blaine Cook was building Twitter's OAuth-like scheme for third-party apps, and separately a handful of engineers at companies like Google, Yahoo, and Ma.gnolia realized every company was independently reinventing "let app X access your data on service Y" — usually by asking users to type their real password into a third-party site, which is a phishing and security nightmare.

| Year | Milestone |
|------|-----------|
| 2006–2007 | Independent efforts (Twitter's "Bridge," Ma.gnolia, others) converge; OAuth community forms |
| 2007 | OAuth 1.0 published — cryptographic request signing, complex to implement correctly |
| 2009 | A session-fixation vulnerability is found in OAuth 1.0; OAuth 1.0a patches it |
| 2010 | OAuth 1.0a becomes RFC 5849 |
| 2012 | **OAuth 2.0** published as RFC 6749 (framework) and RFC 6750 (bearer tokens) — drops request signing for simple bearer tokens over mandatory TLS; explicitly a framework, not a single protocol |
| 2012 | Eran Hammer, the lead editor, resigns from the working group and publicly criticizes 2.0 as "less secure" and too flexible — the split between "2.0 is a menu of options, not a protocol" and "that flexibility was necessary for mobile/native apps" still shapes debates today |
| 2014 | **OpenID Connect 1.0** ships — the identity layer on top of OAuth 2.0, adding the ID token, standardized claims, and discovery |
| 2015 | RFC 7636 — **PKCE** (Proof Key for Code Exchange), designed for native/mobile apps that cannot keep a client secret |
| 2017 | RFC 8252 — OAuth for native apps codifies "always use the system browser, always use PKCE" |
| 2019 | Device Authorization Grant standardized as RFC 8628 (the "enter this code on your phone" flow for TVs/CLIs) |
| 2020 | OAuth Security Best Current Practice (BCP) draft recommends dropping the Implicit and Resource Owner Password grants and using PKCE even for confidential clients |
| 2025 | **OAuth 2.1** consolidation draft (an IETF effort, not a new RFC number as of this writing) folds in the security best practices — no more implicit grant, no more password grant, PKCE mandatory for all authorization-code clients — effectively codifying what production systems already do |

The pattern to notice: OAuth 2.0 was published as a deliberately extensible framework, real-world attacks and mobile-app usage patterns exposed which options were unsafe, and the ecosystem converged on a much narrower "good parts" subset — which is what OAuth 2.1 is standardizing.
`,

  "why-it-exists": `
Before OAuth, the only way for App B to act on your behalf on Service A was the **password anti-pattern**: you typed your Service A username and password directly into App B's form. App B stored it (often in plaintext), used it to log in as you, and now owned a permanent, all-or-nothing credential that could do anything your account could do.

This was broken in every dimension that matters:

- **No scoping**: App B could read your email, delete your contacts, and change your password — there was no way to grant "read-only calendar access" and nothing else.
- **No revocation**: to cut off App B, you had to change your actual password, which broke every other app relying on the old one too.
- **Trust concentration**: a breach at any single third-party app leaked your real password to Service A itself, not just a token.
- **No expiry**: the credential worked forever until you manually rotated your password.
- **Training users to phish themselves**: "enter your Facebook password into this random website" is indistinguishable from a phishing form, so the ecosystem was actively teaching users the exact behavior that phishing attacks exploit.

OAuth's answer: introduce a **trusted intermediary** (the authorization server) that authenticates the user directly on the real service's own login page, asks for explicit, scoped consent ("App B wants: read your calendar"), and hands App B a limited, revocable, expiring **token** instead of the password. The resource owner's real credential never leaves the authorization server's domain.
`,

  "problem-it-solves": `
Concrete pains OAuth removes:

- **Credential sharing** — third-party apps never see the user's real password; they receive a scoped, revocable token instead.
- **All-or-nothing access** — **scopes** let a user grant exactly "read your email" without granting "send email as you" or "delete your account."
- **Permanent access** — access tokens are short-lived (minutes to an hour); a stolen token has a small blast radius, unlike a stolen password.
- **Silent, unrevocable trust** — users can see and revoke individual app grants from their account settings without touching their password.
- **Re-authenticating on every app** — once federated login (OAuth + OIDC) is set up, users reuse an existing trusted identity (Google, GitHub, Microsoft) instead of creating and remembering a new password per site, which also means one fewer password database for that site to protect.
- **Fragmented, insecure device flows** — the Device Authorization Grant gives TVs, CLIs, and IoT devices a safe way to authenticate without a keyboard or a browser on the device itself.

What OAuth deliberately does **NOT** solve:

- **It does not authenticate the user to the client application** by itself. Receiving an access token proves the token holder was *authorized* for some scope; it does not, on its own, cryptographically prove *who* the resource owner is to the client — that gap is exactly why OIDC exists (see below).
- **It does not manage the client-side session.** Once your app knows who the user is, keeping them "logged in" across requests is a separate concern — see the **Cookies & Sessions** skill.
- **It does not define authorization *within* your app** (what a logged-in user is allowed to do inside your product). That's the job of **RBAC** or **ABAC** (see those skills) — OAuth gets a user in the door; RBAC/ABAC decides what they can touch once inside.
- **It does not encrypt or sign the resources being accessed** — that's TLS's and the resource server's job.
- **It is not a single, drop-in-safe protocol** — it is a framework with several grant types, some of which (Implicit, Resource Owner Password) are now considered insecure legacy options. Picking the wrong one is a common, serious mistake covered in Anti-Patterns and Security.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely why OAuth 2.0 is authorization, not authentication, and why OIDC was built on top of it to add identity.
2. Name the four OAuth actors (resource owner, client, authorization server, resource server) and trace a request through all four.
3. Choose the correct grant type (authorization code + PKCE, client credentials, device code) for a given client shape, and explain why the implicit and password grants are deprecated.
4. Implement and explain the Authorization Code flow with PKCE end to end, including the code_verifier/code_challenge exchange.
5. Distinguish access tokens, refresh tokens, and ID tokens by purpose, audience, and lifetime — and know which one is (and is not) safe to send to a resource server.
6. Validate an ID token correctly: signature via JWKS, issuer, audience, expiry, and nonce.
7. Use OIDC discovery (the well-known configuration document) to avoid hardcoding provider endpoints.
8. Identify and defend against the core OAuth vulnerabilities: open redirect, CSRF on the callback, authorization code interception, and token leakage.
9. Design a production social-login flow (Google/GitHub/Apple-style) with short-lived access tokens, refresh rotation, and secure token storage.
10. Read and reason about a real OAuth callback implementation (state, code exchange, token issuance) and identify what it does well and what it defers.
`,

  prerequisites: `
- **Required**: HTTP fundamentals (requests, responses, status codes, redirects), what a URL query string is, and basic web app architecture (client, server, browser).
- **Required**: what a token/credential is conceptually — no cryptography background needed yet.
- **Helpful**: the **JWT** skill — most OAuth access tokens and every OIDC ID token are JWTs; understanding claims and signatures deepens this page significantly.
- **Helpful**: the **Cookies & Sessions** skill — OAuth typically hands off to a cookie-based session once the user is authenticated in your app.
- **Helpful**: basic public-key cryptography intuition (a private key signs, a public key verifies) for the JWKS/key-rotation sections.

Dependency links: **HTTP** → this page → **JWT**, **Cookies & Sessions**, **RBAC**, **ABAC** all interlock with OAuth in a real authentication system. This is the first page in the platform's new **Authentication** category; JWT, Cookies & Sessions, RBAC, and ABAC follow it and are referenced throughout.
`,

  "beginner-concepts": `
### The four actors

Every OAuth flow has exactly four roles. Naming them precisely is the single highest-leverage thing to memorize:

~~~text
Resource Owner     — the user. Owns the data (their Google Calendar, their GitHub repos).
Client              — the application requesting access (your app, wanting to read that calendar).
Authorization Server — issues tokens after the resource owner authenticates and consents (Google's login/consent screen).
Resource Server     — hosts the protected data and accepts the token (Google Calendar API).
~~~

In many systems (Google, GitHub) the authorization server and resource server are operated by the same company but are still logically separate roles — your app never talks to "Google," it talks to Google's authorization server to get a token, then to Google's resource server (the Calendar API) to use it.

### What a "grant" is

A grant type is simply *the specific sequence of steps* the client follows to trade something it has (a login, a secret, a code) for an access token. Beginners should learn one grant deeply before touching the others: the **Authorization Code Grant**, which is used by essentially every web app with a browser and a backend.

### The Authorization Code flow, in plain language

~~~text
1. Your app redirects the user's browser to the authorization server's
   /authorize endpoint, including: your client_id, the scopes you want,
   and a redirect_uri (where to send the user back).
2. The user logs in (if not already) directly on the authorization
   server's own page — your app never sees their password.
3. The user sees a consent screen: "App X wants to: read your email.
   Allow?" They click Allow.
4. The authorization server redirects the browser back to your
   redirect_uri with a short-lived, single-use "authorization code"
   in the query string.
5. Your app's BACKEND (not the browser) sends that code, plus your
   client secret, directly to the authorization server's /token
   endpoint over a server-to-server HTTPS call.
6. The authorization server verifies the code and secret, then
   responds with an access token (and often a refresh token).
~~~

Step 5 is the crucial security property: the authorization code that traveled through the browser (visible in browser history, referrer headers, server logs) is useless by itself — the attacker would also need the client secret, which never leaves your backend.

### A minimal, illustrative client

~~~python
import secrets
from urllib.parse import urlencode

AUTH_ENDPOINT = "https://auth.example.com/authorize"
CLIENT_ID = "my-app-client-id"
REDIRECT_URI = "https://myapp.com/auth/callback"

def build_authorize_url() -> str:
    # state defends against CSRF on the callback -- store it server-side
    # (session or short-lived cache) and verify it when the user returns.
    state = secrets.token_urlsafe(24)
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "openid email profile",
        "state": state,
    }
    return f"{AUTH_ENDPOINT}?{urlencode(params)}"
~~~

### Scopes: the permission menu

A **scope** is a string naming a specific permission — "read:calendar," "openid," "repo." The client asks for a list of scopes; the authorization server's consent screen shows the user exactly what those scopes mean in human language, and the resulting token is restricted to only those scopes. A resource server should always check the token's granted scopes before serving a request — never assume "has a valid token" implies "has every permission."
`,

  "intermediate-concepts": `
### PKCE — Proof Key for Code Exchange

PKCE (pronounced "pixy," RFC 7636) closes a gap in the Authorization Code flow for clients that **cannot** hold a secret safely — mobile apps and single-page apps, where a "client secret" baked into the app binary or JS bundle is just a public string. Mechanics:

~~~text
1. Before redirecting to /authorize, the client generates a random
   code_verifier (a long random string it keeps locally).
2. It derives a code_challenge = BASE64URL(SHA256(code_verifier)).
3. The /authorize request includes code_challenge and
   code_challenge_method=S256 (never leave this as "plain" if avoidable).
4. When exchanging the authorization code at /token, the client also
   sends the original code_verifier.
5. The authorization server hashes the received verifier and compares
   it to the code_challenge it stored earlier -- if they don't match,
   the exchange is rejected.
~~~

~~~python
import base64
import hashlib
import secrets

def generate_pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)                     # kept secret, client-side only
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge
~~~

Why it matters even for confidential (backend) clients: PKCE stops **authorization code interception** attacks regardless of client type — if malware, a misconfigured proxy, or a rogue app on the same mobile device intercepts the redirect and steals the code, it still cannot complete the token exchange without the verifier, which never traveled over the network until the final, TLS-protected /token call. OAuth 2.1 makes PKCE mandatory for every authorization-code client, confidential or not.

### state vs nonce — two different jobs

Both look like "a random string you send and check," but they defend against different attacks:

~~~text
state  -> CSRF protection on the CALLBACK. Proves the browser completing
          the flow is the same one that started it. Required by OAuth 2.0
          for authorization-code and implicit grants.
nonce  -> Replay protection for the ID TOKEN (OIDC only). Embedded inside
          the signed ID token itself; proves this specific ID token was
          issued for this specific browser session, not replayed from a
          previous login or a different session.
~~~

Skipping state lets an attacker start their own OAuth flow, capture the resulting code, and trick a victim's browser into completing it, silently logging the victim into the attacker's account (a session-fixation-style attack). Skipping nonce lets a captured or leaked ID token be replayed into a different session.

### OIDC discovery and JWKS

OpenID Connect providers publish a **well-known configuration document** so clients never hardcode endpoints:

~~~text
GET https://accounts.google.com/.well-known/openid-configuration

Returns JSON with: authorization_endpoint, token_endpoint,
userinfo_endpoint, jwks_uri, issuer, scopes_supported,
response_types_supported, id_token_signing_alg_values_supported ...
~~~

The jwks_uri points to a **JSON Web Key Set** — the provider's current public signing keys, published so any client can verify an ID token's signature without a shared secret. Keys **rotate** periodically (and immediately if a key is compromised); every key carries a kid (key ID) in its JWT header, and clients look up the matching public key by kid rather than assuming a single fixed key forever. See the **JWT** skill for how the signature itself is verified.

### Access token vs refresh token vs ID token

~~~text
Access token  -> "the bearer of this may call the resource server with
                  these scopes." Sent to the RESOURCE SERVER. Short-lived
                  (minutes to ~1h). Opaque OR a JWT -- the client should
                  not need to parse it; the resource server validates it.
Refresh token -> "trade this for a new access token, without re-login."
                  Sent ONLY to the authorization server's /token endpoint.
                  Long-lived (days to months), high-value, must be stored
                  with the highest care, and should rotate on each use.
ID token      -> OIDC only. "This person authenticated, here is who they
                  are." A signed JWT for the CLIENT to consume directly
                  (parse the claims), never sent to a resource server.
~~~

The most common production bug is treating these three as interchangeable — e.g. sending the ID token to an API as if it were an access token, or storing a refresh token in a place an XSS payload can read (see Anti-Patterns and Security).

### Token introspection and revocation

Opaque access tokens (not JWTs) require the resource server to call the authorization server's **introspection endpoint** (RFC 7662) to ask "is this token still valid, and what scopes/subject does it have?" JWTs avoid this round trip by being self-verifiable, at the cost of being harder to revoke early (see Advanced Concepts). The **revocation endpoint** (RFC 7009) lets a client or user proactively invalidate a refresh or access token — critical for "log out everywhere" and "revoke this app's access" features.
`,

  "advanced-concepts": `
### Confidential vs public clients

~~~text
Confidential client -> can keep a secret (a server-side web app backend,
                        a backend service). Authenticates to the token
                        endpoint with client_id + client_secret.
Public client        -> CANNOT keep a secret (mobile app, SPA running
                        entirely in the browser, CLI tool). Must use
                        PKCE instead of a client secret to prove it is
                        the same party that started the flow.
~~~

Treating a JavaScript SPA as if it could hold a "secret" is a category error — anything shipped to the browser is, by definition, public. This is precisely why the Implicit grant (which put tokens directly in a public client's hands with no code-exchange step at all) is now deprecated in favor of Authorization Code + PKCE even for SPAs.

### The deprecated grants, and why

~~~text
Implicit Grant (response_type=token)
  - Returned the access token directly in the URL fragment after login,
    skipping the code-exchange step entirely.
  - Problems: tokens leak into browser history, referrer headers, and
    server access logs; no refresh tokens (by spec); no client
    authentication step at all. Superseded by Authorization Code + PKCE,
    which SPAs can now use safely via a backend-for-frontend or a
    public-client PKCE flow.

Resource Owner Password Credentials Grant (grant_type=password)
  - The client collects the user's actual username/password and trades
    them directly for a token -- literally the pre-OAuth anti-pattern,
    just wrapped in an OAuth-shaped request.
  - Only ever defensible for a company's own first-party legacy client
    migrating incrementally to OAuth, never for third-party integrations.
    OAuth 2.1 removes it entirely.
~~~

### Client Credentials Grant — machine-to-machine

When there is no resource owner at all — a backend service calling another backend service, a scheduled job, a CI pipeline — the Client Credentials Grant lets the client authenticate as *itself*:

~~~python
import httpx

async def get_service_token() -> str:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://auth.example.com/token",
            data={
                "grant_type": "client_credentials",
                "client_id": "billing-service",
                "client_secret": "REDACTED_FROM_SECRETS_MANAGER",
                "scope": "invoices:write",
            },
        )
        resp.raise_for_status()
        return resp.json()["access_token"]
~~~

There is no user, no consent screen, no ID token (there is no "identity" to represent beyond the service itself) — this is authorization between two systems, and it composes naturally with mutual TLS or signed service identities in a zero-trust mesh.

### Device Authorization Grant — no browser on the device

Smart TVs, CLIs, and IoT devices often cannot render a web login. The Device Grant asks the *device* to poll while the *user* completes login on a second screen (phone/laptop):

~~~text
1. Device -> POST /device_authorization: gets a device_code, a short
   user_code, and a verification_uri ("go to example.com/device and
   enter ABCD-1234").
2. Device displays the user_code and polls the token endpoint every
   few seconds with grant_type=device_code.
3. User opens the verification_uri on their phone, logs in, enters the
   code, and approves.
4. Device's next poll succeeds and receives the access token.
~~~

### Multi-tenant and confused-deputy considerations

At scale, a single OAuth client often serves many tenants (e.g. a SaaS product with per-customer Google Workspace connections). The senior-level pitfalls: **always validate the token's audience** (aud claim) matches your resource server, not just "signature is valid" — otherwise a token minted for a different, less-trusted client of the same authorization server could be replayed against you (a confused-deputy attack); and **scope tokens per tenant** so a compromised token for Tenant A's connection cannot be replayed against Tenant B's data, even within the same application.

### Token revocation vs JWT statelessness — the real tradeoff

JWT access tokens are validated locally (fast, no network round trip) but cannot be individually revoked before they expire, because the resource server never asks the authorization server "is this still good?" Production systems resolve this tension with **short access-token lifetimes (5–15 min)** plus a **refresh token that IS checked against a revocable store** on every use — so the maximum damage window from a stolen access token is small, and full account/session revocation happens by killing the refresh token. See the **JWT** skill for the deeper stateless-vs-stateful tradeoff.
`,

  "internal-working": `
Here is exactly what happens, end to end, for the Authorization Code flow with PKCE — the flow that matters most in production:

~~~mermaid
flowchart TD
    A["1. Client generates code_verifier + code_challenge, and a state value"] --> B["2. Browser redirected to /authorize\nwith client_id, redirect_uri, scope, state, code_challenge"]
    B --> C["3. Authorization server authenticates the user\n(its own login page -- client never sees the password)"]
    C --> D["4. Consent screen: user approves requested scopes"]
    D --> E["5. Authorization server redirects browser back to\nredirect_uri with code + state"]
    E --> F["6. Client verifies state matches the one it stored"]
    F --> G["7. Client backend POSTs to /token:\ncode + code_verifier + client credentials"]
    G --> H["8. Authorization server: validates code (single-use, unexpired),\nhashes code_verifier and compares to stored code_challenge"]
    H --> I["9. Authorization server issues access_token (+ refresh_token,\n+ id_token if OIDC scope=openid was requested)"]
    I --> J["10. Client stores tokens server-side; establishes its\nown session (see Cookies & Sessions) for the browser"]
    J --> K["11. Client calls resource server with\nAuthorization: Bearer access_token"]
    K --> L["12. Resource server validates token (signature/JWKS or\nintrospection), checks scope, serves the request"]
~~~

Two details separate a correct implementation from a subtly broken one. First, the authorization **code is single-use and short-lived** (often 30–60 seconds) — the authorization server deletes it the instant it's exchanged, so even if it leaked, replaying it fails. Second, the **redirect_uri sent at step 7 must exactly match** the one used at step 2 — this is what prevents an attacker from registering a look-alike redirect and having the code delivered somewhere else (see Security).

For OIDC, step 9 additionally mints the **ID token**: a JWT whose payload includes the nonce from step 2 (if sent), the issuer, the audience (your client_id), an expiry, and identity claims (sub, email, name, ...). The client must verify all of these before trusting the ID token as proof of identity — signature verification alone is not enough (see Intermediate Concepts and Security).
`,

  architecture: `
### Where OAuth sits in a real application

~~~mermaid
flowchart TB
    subgraph Browser
        U["User"]
    end
    subgraph YourApp["Your application"]
        FE["Frontend (SPA / SSR pages)"]
        BE["Backend: OAuth client\n(/auth/oauth/start, /callback)"]
        SessionStore["Session store\n(cookie + server session, see Cookies & Sessions)"]
    end
    subgraph AS["Authorization Server (Google / GitHub / your own IdP)"]
        AuthEP["/authorize"]
        TokenEP["/token"]
        JWKSEP["/.well-known/jwks.json"]
    end
    subgraph RS["Resource Server"]
        API["Protected API"]
    end

    U -->|1. clicks Login| FE
    FE -->|2. redirect| AuthEP
    U -->|3. login + consent| AuthEP
    AuthEP -->|4. redirect with code| BE
    BE -->|5. exchange code + PKCE verifier| TokenEP
    TokenEP -->|6. tokens| BE
    BE -->|7. verify ID token using| JWKSEP
    BE --> SessionStore
    BE -->|8. call with access_token| API
~~~

The key architectural decision: **the OAuth client role lives on your backend**, not in the browser or mobile app directly, whenever you can arrange it (a "backend-for-frontend" / BFF pattern). The backend is the only party that ever sees the client secret and the refresh token; the browser only ever receives your app's own session cookie or a short-lived app-issued token. This single decision eliminates most of the OAuth-specific browser attack surface (token-in-URL leakage, XSS reading long-lived tokens) by construction.

### Application layout

~~~text
myservice/
├── src/myservice/
│   ├── api/
│   │   └── auth.py            # /auth/oauth/{provider}/start + /callback
│   ├── core/
│   │   ├── security.py        # session/app-token issuance, JWT verification
│   │   └── config.py          # per-provider client_id/secret from env/secrets manager
│   ├── services/
│   │   └── oauth_client.py    # code exchange, JWKS-based ID token verification
│   └── models/
│       └── user.py            # provider + provider_id + email, upsert-on-login
└── tests/
    └── test_oauth_callback.py # state validation, code exchange, error paths
~~~

This mirrors a real implementation pattern: a dedicated OAuth router handling only the redirect dance, a security module owning token verification and your app's own session/JWT issuance, and a user model that stores which external provider identity maps to which local account (see Data Flow and Production Usage for the full sequence).
`,

  "data-flow": `
Tracing one real "Sign in with Google" click end to end, including error paths:

~~~mermaid
sequenceDiagram
    participant U as Browser
    participant App as Your App Backend
    participant G as Google Authorization Server
    participant API as Google APIs (Resource Server)

    U->>App: GET /auth/oauth/google/start
    App->>App: generate state, code_verifier, code_challenge
    App->>App: store state + code_verifier (server-side, TTL ~10 min)
    App-->>U: 302 redirect to Google /authorize\n(client_id, redirect_uri, scope, state, code_challenge)
    U->>G: GET /authorize?...
    G->>U: Login page (if not already signed into Google)
    U->>G: Credentials
    G->>U: Consent screen ("this app wants: email, profile")
    U->>G: Approve
    G-->>U: 302 redirect to redirect_uri?code=...&state=...
    U->>App: GET /auth/oauth/google/callback?code=...&state=...
    App->>App: verify state matches stored value (else 400, abort)
    App->>G: POST /token (code, code_verifier, client_id, client_secret)
    G-->>App: { access_token, refresh_token, id_token, expires_in }
    App->>App: verify id_token: signature via JWKS, iss, aud, exp, nonce
    App->>App: upsert local User by (provider, provider_id); read email/name from claims
    App->>App: issue app's own session (cookie) or app JWT
    App-->>U: 302 redirect to app home, Set-Cookie: session=...
    U->>App: subsequent requests carry the app session cookie
    App->>API: (later, if needed) GET /calendar with Authorization: Bearer access_token
    API-->>App: calendar data (scoped to what was granted)
~~~

Two points senior engineers check first when debugging this flow: whether **state is actually validated** before doing anything else with the callback (skipping this is the most common real-world OAuth bug), and whether the **ID token's claims are read only after signature verification succeeds** — parsing claims from an unverified JWT and trusting them is equivalent to trusting an unsigned cookie.
`,

  "production-usage": `
### The provider-config pattern

Real systems support multiple providers (Google, GitHub, Apple, Microsoft, or a self-hosted IdP) behind one uniform interface: a per-provider config object with authorize_url, token_url, client_id, client_secret (or, for Apple, a dynamically generated client assertion), and requested scope, keyed by a "provider" path segment (/auth/oauth/github/start, /auth/oauth/google/start, ...). This mirrors exactly how this platform's own reference implementation (api/app/api/v1/auth.py) structures it: a single _provider_config lookup function, a single _exchange_and_identify function with a per-provider branch only where the wire format truly differs (GitHub returns raw profile JSON and needs a follow-up call for the primary email; Google and Apple return an OIDC id_token directly).

### Practical operational defaults

- **State storage**: a short-TTL server-side store (Redis in production; an in-process dict is acceptable only for local development, since it will not survive multiple backend instances or restarts).
- **Redirect URI allowlisting**: register the exact redirect_uri with every provider's app console; never construct it dynamically from a request header the client controls.
- **Secrets**: client secrets and Apple's private signing key live in a secrets manager or env vars injected at deploy time — never in source control (see Security).
- **Token delivery to the frontend**: many production systems, including the one referenced above, deliver the resulting app token to the browser via a **URL fragment** (#token=...) rather than a query string, specifically because URL fragments are never sent to the server in subsequent requests and are typically excluded from access/referrer logs and browser history syncing in the same way query strings are not.
- **Sign-up gating**: production auth often needs a kill switch — a signup_enabled flag checked in both the password-registration path and the OAuth callback path, with an explicit allowlist carve-out for admin emails, so an org can freeze new signups without locking out its own operators.
- **Account linking**: look up the user first by (provider, provider_id); if not found, fall back to matching by verified email to link an OAuth identity onto an existing password-based account, rather than silently creating a duplicate account per login method.

### Config sketch

~~~python
from pydantic_settings import BaseSettings

class OAuthSettings(BaseSettings):
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    frontend_url: str = "https://myapp.com"
    admin_emails: list[str] = []

    class Config:
        env_prefix = "AEOS_"   # e.g. AEOS_GOOGLE_CLIENT_ID
~~~

Fail fast at boot if a configured provider is missing required fields, and return a clear 503 ("provider not configured") rather than a confusing downstream error if a client hits an unconfigured provider's start endpoint.
`,

  "industry-examples": `
- **Google Identity Platform**: the reference OIDC implementation most engineers learn against first; publishes a fully compliant discovery document and JWKS, and popularized "Sign in with Google" as a near-universal social login option.
- **GitHub**: a pure OAuth 2.0 (not OIDC) provider for its own login — no id_token, so identity has to be derived by calling the /user REST endpoint after exchanging the code, which is precisely why a real integration needs a provider-specific branch in the code-exchange step (see this platform's own auth.py for the worked example).
- **Auth0 / Okta / Microsoft Entra ID (Azure AD)**: dedicated Identity-as-a-Service platforms; instead of hand-rolling an authorization server, companies buy one of these and get OAuth + OIDC, MFA, enterprise SSO (SAML bridging), and audit logs out of the box — the standard "don't build your own IdP" choice for B2B SaaS.
- **Apple ("Sign in with Apple")**: uniquely requires client authentication via a short-lived ES256-signed JWT client assertion instead of a static client secret, and offers users a private email relay — a good case study in how the spec's flexibility accommodates very different provider trust models.
- **Slack, Stripe, Notion (API integrations)**: OAuth is how third-party apps get scoped, revocable access to a workspace/account's data via their public marketplaces/app directories — the same pattern as social login, applied to app-to-app integration rather than "login."
- **AI agent platforms (2024–2026 trend)**: MCP-style tool connectors and agent frameworks increasingly use OAuth (often client credentials or device-code style flows) to let an autonomous agent call a user's third-party services (email, calendar, docs) with explicit, scoped, user-granted consent rather than a blanket API key — the delegation model OAuth was built for is now central to agentic AI security design.
`,

  "best-practices": `
1. **Always use Authorization Code + PKCE**, even for confidential backend clients — it is now the single recommended flow for every interactive login (OAuth 2.1 makes this mandatory).
2. **Validate state on every callback, before doing anything else** — a missing or mismatched state should immediately 400 the request.
3. **Verify ID tokens fully**: signature via the provider's live JWKS (fetched, cached, and refreshed — never hardcoded), issuer, audience, expiry, and nonce. Never trust claims from a token whose signature you didn't check.
4. **Keep access tokens short-lived (5–15 minutes)** and rely on refresh tokens (rotated on each use) for long sessions — this bounds the damage window of a leaked access token.
5. **Never expose the client secret or refresh token to the browser or a mobile app's storage that a compromised WebView/JS context can read** — keep the OAuth client role on your backend (the BFF pattern).
6. **Register exact redirect URIs** with each provider; never accept a redirect_uri from client-controlled input or construct it dynamically from request headers.
7. **Scope requests to the minimum needed** — request "read profile and email," not the widest scope available, and re-request incrementally if a feature later needs more.
8. **Use HTTPS everywhere**, including localhost development where the provider allows it, and reject any provider redirect over plain HTTP.
9. **Rotate signing keys regularly and support multiple simultaneous keys via kid** so rotation never causes a hard outage for tokens issued moments before the rotation.
10. **Treat the authorization code as single-use and log its consumption** — a code presented twice should be treated as a security event, not silently retried.
11. **Store refresh tokens encrypted at rest** and index them so a single revocation call can invalidate all tokens issued to a compromised client/session.
12. **Prefer a managed Identity Provider (Auth0, Okta, Entra ID, or your cloud's IdP) over hand-rolling an authorization server** unless building an authorization server is genuinely your product — implementing OAuth/OIDC correctly, including every edge case in this page, is a substantial ongoing security responsibility.
`,

  "anti-patterns": `
### Treating the ID token as an API bearer token

~~~text
WRONG: client sends the id_token in the Authorization header to call
       a REST API, and the API "validates" it like an access token.
RIGHT: the id_token is for the CLIENT to read (it says who logged in);
       the ACCESS token -- a separate value, possibly opaque -- is what
       gets sent to resource servers. Mixing them up means a token
       meant only to prove identity to your app ends up granted API
       privileges it was never scoped or intended for.
~~~

### Skipping state ("it's just a redirect, what could go wrong")

~~~python
# WRONG -- no state at all
def oauth_start():
    return redirect(f"{AUTH_URL}?client_id={CID}&redirect_uri={CB}")

# RIGHT -- generate, persist, and verify state
def oauth_start():
    state = secrets.token_urlsafe(24)
    save_pending_state(state)                 # server-side, short TTL
    params = {"client_id": CID, "redirect_uri": CB, "state": state}
    return redirect(f"{AUTH_URL}?{urlencode(params)}")

def oauth_callback(code, state):
    if not consume_pending_state(state):      # missing or already used -> reject
        raise Http400("invalid oauth state")
    ...
~~~

Without state, an attacker can pre-authorize their OWN account, capture the resulting code via a crafted link, and trick a victim into completing the callback — silently logging the victim into the attacker's identity (login CSRF).

### The Implicit grant for a "simpler" SPA

~~~text
WRONG: response_type=token in the browser, token lands in the URL
       fragment and is used directly by JS, no code exchange, no
       client authentication step at all.
RIGHT: Authorization Code + PKCE, even for a pure SPA -- PKCE was
       designed precisely so public clients get the code-exchange
       security properties without needing a client secret.
~~~

### Storing tokens in localStorage

~~~text
WRONG: localStorage.setItem('access_token', token) -- readable by ANY
       script running on the page, including a single XSS payload
       from any dependency.
RIGHT: keep the OAuth tokens server-side; give the browser only an
       HttpOnly, Secure, SameSite cookie for your app's own session
       (see Cookies & Sessions) or a very short-lived token designed
       to be exposed.
~~~

### Trusting an unverified JWT

~~~python
# WRONG -- reads claims without checking the signature
claims = jwt.decode(id_token, options={"verify_signature": False})
email = claims["email"]         # attacker-controlled if this path ships to prod

# RIGHT -- verify against the provider's current JWKS first
signing_key = jwks_client.get_signing_key_from_jwt(id_token)
claims = jwt.decode(id_token, signing_key.key, algorithms=["RS256"],
                     audience=CLIENT_ID, issuer=ISSUER)
~~~

Note: skipping signature verification is sometimes done as a deliberate, documented, temporary shortcut when the token was just received directly from the provider over a fresh TLS connection in the same request (as a stopgap) -- but it must never ship as the permanent state, since any future refactor that passes the token through an extra hop reintroduces full forgeability.

### Overly broad scope requests

~~~text
WRONG: requesting "https://www.googleapis.com/auth/drive" (full Drive
       access) to implement a feature that only reads one file's name.
RIGHT: request the narrowest scope the feature needs (e.g.
       drive.file for app-created files only); users trust -- and
       approve -- narrowly scoped requests far more, and a leaked
       token does far less damage.
~~~
`,

  performance: `
### Measure first

- **Time the token exchange and JWKS fetch separately** from your own app logic — most "OAuth is slow" complaints are actually a provider round trip or an uncached JWKS fetch, not your code.
- Log the duration of /authorize → /callback → /token → session-established as one traced span (see Monitoring) so regressions are visible per stage.

### The optimization hierarchy

1. **Cache the JWKS response** (with an ETag/Cache-Control-aware refresh, or a fixed short TTL like 10–15 minutes) instead of fetching it on every single ID-token verification — this removes a network round trip from your hot login path entirely.
2. **Cache the OIDC discovery document** the same way — it changes essentially never in practice.
3. **Reuse HTTP connections** to the authorization server (a shared, pooled httpx/requests client) rather than opening a new TLS connection per token exchange.
4. **Avoid introspection round trips for JWT access tokens** — verify locally via JWKS instead of calling the authorization server's introspection endpoint on every resource-server request; reserve introspection for opaque tokens or cases needing real-time revocation checks.
5. **Parallelize independent provider calls** where a provider requires more than one (e.g. GitHub's user + emails calls) using async concurrency rather than sequential blocking calls.
6. **Keep refresh-token round trips off the request-critical path** — refresh proactively a little before expiry (e.g. at 80% of lifetime) in a background task, rather than reactively on a 401 in the middle of serving a user request.

None of this is CPU-bound work; essentially all OAuth performance is network-round-trip latency, so the entire hierarchy above is about caching and eliminating round trips, not algorithmic optimization.
`,

  scalability: `
OAuth itself does not need to "scale" in the compute sense — it is a handful of redirects and HTTP calls per login. The scalability concerns are all about the **state and token storage** around it:

~~~mermaid
flowchart LR
    LB["Load balancer"] --> App1["App instance 1"]
    LB --> App2["App instance 2"]
    LB --> App3["App instance N"]
    App1 & App2 & App3 --> Redis[("Redis:\nOAuth state, PKCE verifiers,\nrefresh-token index")]
    App1 & App2 & App3 --> AS["Authorization Server"]
~~~

- **State/PKCE-verifier storage must be shared**, not in-process — a user who starts the flow on instance 1 may land the callback on instance 3 behind a load balancer; an in-memory dict per instance breaks the flow randomly under horizontal scaling. Redis with a short TTL (5–10 minutes) is the standard answer.
- **JWKS caching should be shared or at least per-instance with a sane TTL** to avoid a thundering herd of key-fetch requests against the provider when many instances start simultaneously (a deploy, an autoscale event).

| Bottleneck | Answer |
|------------|--------|
| Per-instance in-memory state store | Move to Redis/shared cache; every instance must see every pending state |
| Authorization-server rate limits under high login volume | Cache JWKS/discovery aggressively; batch nothing else — logins are inherently per-user serial |
| Refresh-token store growth | TTL-expire long-unused refresh tokens; index by user for bulk revocation ("log out everywhere") |
| Thundering herd on key rotation | Support the previous AND new key simultaneously for an overlap window; never force instant, all-at-once invalidation |

Because OAuth logins are inherently one-per-user and low-frequency compared to typical API traffic, the realistic scale target is "millions of users, each logging in occasionally," not "millions of logins per second" — design for correctness and shared state first, raw throughput second.
`,

  security: `
OAuth/OIDC has a well-documented attack surface; each of these has a standard defense:

### Open redirect

If your /authorize or callback handling ever redirects to a URL taken from user input without validation, an attacker can craft a link that starts a legitimate-looking OAuth flow but ends by redirecting the victim to an attacker-controlled site (often carrying the authorization code or token with it). Defense: maintain a strict allowlist of valid redirect_uri values registered with the provider, and never construct a post-login redirect target from unvalidated request data.

### CSRF on the callback (login CSRF)

Covered in Anti-Patterns: without a validated, single-use state parameter tied to the browser session that started the flow, an attacker can pre-complete their own consent and trick a victim into finishing the callback, logging the victim into the attacker's account. Always generate state server-side, store it tied to the initiating session, and consume it exactly once on callback.

### Authorization code interception

A code traveling through a mobile OS's URL-handling mechanism, a shared/insecure network, or a misconfigured proxy could in principle be captured by another app or party. PKCE (see Intermediate Concepts) neutralizes this: possession of the code alone is useless without the code_verifier that only the legitimate client holds.

### Token leakage via referrer headers, logs, and browser history

Access tokens or codes placed in URL **query strings** can leak via the Referer header to third-party resources loaded on the redirect landing page, via server access logs, and via browser history sync. Defenses: prefer POST bodies over query strings wherever the spec allows it, strip Referrer-Policy down (no-referrer or same-origin) on sensitive pages, avoid logging full request URLs on auth endpoints, and — as this platform's own callback does — deliver final tokens to the browser via a URL **fragment** rather than a query string, since fragments are not sent to servers or included in the Referer header at all.

### Confused deputy / audience confusion

Always validate a JWT access token's aud (audience) claim matches your resource server specifically — accepting any token merely because its signature is valid from a trusted issuer allows a token minted for a different, less-trusted client of the same authorization server to be replayed against you.

### Mix-up attacks (multiple authorization servers)

If your app supports several providers, an attacker can attempt to redirect a code/token intended for Provider A's flow into Provider B's callback handling. Defense: bind the state (and the pending PKCE verifier) to the specific provider the flow was started for, and re-check that binding on callback.

### Insufficient token storage protections

Refresh tokens and client secrets must never sit in client-side storage reachable by JavaScript (localStorage, non-HttpOnly cookies) or in source control. Use HttpOnly/Secure/SameSite cookies for session identifiers, a secrets manager for client secrets, and encryption at rest for stored refresh tokens.

See the dedicated **JWT** skill for token-forgery-class attacks (algorithm confusion, none-algorithm, weak signing keys), the **Cookies & Sessions** skill for session-fixation and cookie-attribute hardening, and the **RBAC**/**ABAC** skills for what happens after authentication — OAuth proves who someone is; it is not itself the authorization-within-your-app layer.
`,

  testing: `
OAuth flows are inherently network-heavy and interactive, so tests split into fast unit tests around your own logic and a smaller set of integration tests against test/sandbox provider credentials.

~~~python
# tests/test_oauth_callback.py
import pytest
from myservice.api.auth import oauth_callback, _issue_state, _check_state

def test_state_round_trip():
    state = _issue_state()
    _check_state(state)                     # should not raise -- consumed once

def test_state_reuse_is_rejected():
    state = _issue_state()
    _check_state(state)
    with pytest.raises(Exception, match="Invalid or expired"):
        _check_state(state)                 # second use must fail

def test_missing_state_is_rejected():
    with pytest.raises(Exception, match="Invalid or expired"):
        _check_state(None)

@pytest.mark.asyncio
async def test_exchange_and_identify_github(monkeypatch, respx_mock):
    # Mock the provider's token + profile endpoints; assert the function
    # extracts (provider_user_id, email, name) correctly, including the
    # "private primary email" fallback path to /user/emails.
    ...
~~~

### The senior testing doctrine for OAuth

- **Test state handling exhaustively**: missing, expired, reused, and mismatched-provider state must all be rejected — this is the single highest-value test surface in an OAuth implementation.
- **Mock the provider's HTTP endpoints** (respx for httpx, responses for requests) rather than hitting real providers in CI — real provider calls are slow, rate-limited, and require live credentials.
- **Test ID token validation as its own unit**: a valid signature with wrong audience, wrong issuer, expired token, and missing nonce should each be individually tested and rejected.
- **Test account-linking edge cases**: same email arriving via two different providers, a provider changing its returned email, and re-login after a token has been revoked.
- **One true integration test** against a real sandbox app (most providers offer a test/dev app registration) run in a separate, slower CI stage — enough to catch schema drift in provider responses without slowing down every commit.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the redirect chain, not just the final page** — use browser devtools' Network tab with "preserve log" on, since OAuth involves multiple redirects and the failure is often on an intermediate hop (e.g. the provider rejecting your redirect_uri before the user even sees a login page).
2. **Decode the JWT by hand** (base64url-decode the header and payload — no library needed for inspection) to check iss, aud, exp, and nonce match what you expect, before assuming a "signature invalid" error is really about the key.
3. **Check the exact error param on your callback URL** — providers return error and error_description query parameters on failure (access_denied, invalid_scope, redirect_uri_mismatch) that pinpoint the problem far faster than guessing.
4. **Log the state store's contents around the failure** (which states are pending, their timestamps) when debugging "invalid or expired state" reports — this instantly reveals TTL-too-short, multi-instance-without-shared-store, or genuine CSRF-attempt causes.
5. **Verify clocks**: JWT exp/nbf validation is clock-sensitive; a backend server with clock drift will spuriously reject valid, freshly issued tokens. Check NTP sync first when "valid tokens keep failing validation" reports come in.
6. **Use the provider's own token-debugging tools** where available (Google's OAuth Playground, jwt.io for structure inspection — never paste real production tokens into third-party sites) to isolate whether the bug is in your code or in what the provider actually returned.

### Common "why is my login broken" root causes, ranked by frequency

Mismatched redirect_uri (even a trailing slash difference) > expired/reused authorization code (usually a double-submit from a double-click or a retried request) > clock drift breaking exp validation > stale cached JWKS after a key rotation > state TTL shorter than realistic user login time (slow typers, MFA prompts).
`,

  monitoring: `
### What to measure

- **Login funnel conversion**: /authorize redirects issued → callbacks received → tokens exchanged successfully → app sessions established. A drop at any stage points at a specific failure mode (users abandoning consent, redirect_uri misconfiguration, code-exchange errors).
- **Error rate by error code**: invalid_state, redirect_uri_mismatch, invalid_grant (an expired/reused code), id_token_verification_failed — each needs its own counter, not one generic "oauth_error."
- **Token-exchange and JWKS-fetch latency** (p50/p95/p99) — these are the two network calls in the hot path.
- **Refresh-token usage and rotation success/failure rate** — a spike in refresh failures often precedes a wave of forced re-logins.

### Instrumentation

~~~python
from prometheus_client import Counter, Histogram

OAUTH_CALLBACKS = Counter(
    "oauth_callback_total", "OAuth callback outcomes", ["provider", "outcome"]
)
TOKEN_EXCHANGE_LATENCY = Histogram(
    "oauth_token_exchange_seconds", "Provider token endpoint latency", ["provider"]
)

async def oauth_callback(provider: str, code: str | None, state: str | None) -> None:
    if not code or not _valid_state(state):
        OAUTH_CALLBACKS.labels(provider=provider, outcome="rejected").inc()
        raise ValueError("invalid callback")
    with TOKEN_EXCHANGE_LATENCY.labels(provider=provider).time():
        tokens = await exchange_code(provider, code)
    OAUTH_CALLBACKS.labels(provider=provider, outcome="success").inc()
~~~

### Structured logging

Log provider, outcome, and a correlation ID on every step of the flow — but **never log the authorization code, access token, refresh token, or raw ID token value**, even at debug level; log their presence/absence and expiry, not their contents. Alert on symptom-level signals users actually feel: a sustained drop in successful-login rate or a spike in id_token_verification_failed, rather than raw request counts.
`,

  deployment: `
### Production-grade config for an OAuth-enabled service

~~~dockerfile
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
# Client secrets and Apple's private key are injected at runtime by the
# orchestrator's secret store -- never baked into the image layers.
USER appuser
EXPOSE 8000
CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: slim base and non-root user shrink the container's own attack surface (defense in depth, independent of OAuth itself); secrets are injected at runtime (env vars from a vault/secret manager, or mounted files) so they never appear in the image, its layer history, or version control.

### Deployment-specific requirements

- **Redirect URIs must be registered per environment** (dev, staging, prod each need their own callback URL registered with every provider) — a classic first-deploy bug is a working local flow that 400s in staging because the provider console only has localhost registered.
- **Shared state store**: Redis (or equivalent) must be reachable from every instance before OAuth logins will work correctly behind a load balancer with more than one replica (see Scalability).
- **Health checks should include the JWKS/discovery reachability** as part of readiness, not liveness — a temporarily unreachable provider shouldn't kill running instances, but a load balancer should stop sending fresh login traffic to an instance that cannot currently verify tokens.
- **Rolling deploys and key rotation**: if you operate your own authorization server, publish the new key alongside the old one in JWKS for an overlap window before removing the old key, so tokens signed moments before a deploy still validate.
`,

  "production-checklist": `
Before an OAuth/OIDC integration takes real user traffic:

- [ ] Authorization Code + PKCE used for every interactive client (no Implicit, no Resource Owner Password grant)
- [ ] state generated server-side, stored with a short TTL in a shared store (Redis), and consumed exactly once per callback
- [ ] Exact redirect_uri registered per environment with every provider; no dynamic construction from request input
- [ ] ID tokens verified: signature via live JWKS, issuer, audience, expiry, and nonce, before any claim is trusted
- [ ] Access tokens short-lived (5–15 min); refresh tokens rotate on each use and are revocable
- [ ] Client secrets and any signing keys (e.g. Apple's) live in a secrets manager, never in source control or image layers
- [ ] OAuth client role (secret, refresh token) lives on the backend, not in browser/mobile client storage
- [ ] Tokens delivered to the browser via a fragment or a first-party HttpOnly cookie, never a logged query string
- [ ] Scopes requested are minimal for the feature; incremental consent used for anything broader
- [ ] Account linking logic tested for same-email-different-provider and re-consent scenarios
- [ ] JWKS and discovery documents cached with sane TTLs; key rotation supports an overlap window
- [ ] Monitoring in place: login-funnel conversion, per-error-code counters, token-exchange latency
- [ ] "Log out everywhere" / revoke-app-access flows tested end to end
- [ ] Sign-up gating (if applicable) enforced identically on password and OAuth paths
- [ ] Load test of the login path with multiple backend instances and the shared state store under concurrent logins
`,

  "common-mistakes": `
1. **Confusing authentication and authorization** — assuming "the user has a valid access token" answers "who is this user," when only a verified ID token (or a call to the userinfo endpoint) actually establishes identity.
2. **Skipping or half-implementing state** — often added later "for CSRF" without actually tying it to the initiating session, defeating its purpose.
3. **Verifying JWT signature but not audience/issuer** — a token from the right provider but meant for a different client still passes signature checks; the confused-deputy gap.
4. **Assuming every provider is OIDC-compliant** — GitHub's classic OAuth returns no id_token at all; code written assuming one exists will silently misbehave or crash on that provider.
5. **Hardcoding provider endpoints instead of using discovery** — breaks silently when a provider migrates an endpoint (rare, but discovery exists precisely so clients don't need to track this).
6. **Using the implicit grant "because it's one redirect simpler"** — trades away code-exchange security properties for marginal implementation convenience.
7. **Storing tokens client-side for "simplicity"** — works in a demo, becomes an XSS-exposed liability the moment any third-party script runs on the page.
8. **Not handling token refresh proactively** — reactive refresh-on-401 adds a full round trip of latency to whatever request happened to hit an expired token, and is easy to get wrong under concurrent requests (thundering-herd refresh calls).
9. **Treating scopes as documentation instead of enforcement** — requesting a scope but never checking it on the resource-server side means the "permission" was cosmetic.
10. **Building a custom authorization server when a managed IdP would do** — reinventing OIDC discovery, JWKS rotation, and consent-screen UX correctly is a much bigger commitment than most teams estimate up front.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| redirect_uri_mismatch | The redirect_uri sent at /authorize differs (even by a trailing slash or http vs https) from what's registered with the provider | Register and send the exact same string; keep per-environment values distinct |
| invalid_grant | Authorization code expired, already used, or code_verifier doesn't match code_challenge | Codes are single-use and short-lived — don't retry a stale code; check PKCE pair generation |
| invalid_state / state mismatch | Missing, expired, or already-consumed state; multi-instance deploy without shared state store | Store state in Redis, not in-process memory, with a TTL long enough for real user login time |
| invalid_scope | Requested a scope the provider doesn't recognize or the client isn't approved for | Check the provider's supported scopes; some scopes require app review/verification |
| access_denied | User declined consent on the provider's screen | Handle gracefully — redirect to your own "login cancelled" state, don't treat as a server error |
| id_token signature verification failed | Stale cached JWKS after key rotation, or clock drift affecting validation windows | Refresh JWKS cache on kid-not-found; sync server clocks (NTP) |
| aud/audience mismatch | Verifying an ID token issued for a different client_id | Always pass and check your own client_id as the expected audience |
| Token exchange 401 from provider | Wrong or expired client_secret, or (for Apple) an expired/incorrectly signed client assertion JWT | Rotate/verify the secret; regenerate the Apple ES256 assertion with correct kid/iss/aud |
| CORS error calling /token from the browser directly | A public/SPA client trying to call a confidential-client-only endpoint cross-origin | Route the exchange through your backend (BFF pattern) instead of calling the provider directly from JS |
| Repeated forced re-logins | Refresh token expired, revoked, or rotation logic invalidated it without issuing a new one correctly | Verify refresh-rotation always returns and persists the NEW refresh token on every use |

The habit that matters: read the provider's error and error_description query parameters first — they are far more specific than the generic exception your own code will raise from them.
`,

  faqs: `
**Q: Is OAuth 2.0 the same as authentication?**
No. OAuth 2.0 grants delegated authorization ("this app may access this scoped resource"). Identity ("who is this user") requires OpenID Connect on top, which adds the ID token and standardized identity claims specifically to close this gap.

**Q: Do I need OIDC if I'm only using OAuth for API access (no login)?**
No — plain OAuth 2.0 (Client Credentials or Authorization Code without the openid scope) is correct and sufficient for pure delegated-access-to-an-API scenarios where there's no need to establish "who is this human."

**Q: Should I ever use the Implicit or Password grants today?**
No, for new systems. Both are being formally removed in OAuth 2.1 and have well-known weaknesses (token leakage for Implicit; password anti-pattern reintroduced for Password grant). Use Authorization Code + PKCE, or Client Credentials for machine-to-machine.

**Q: Why does PKCE matter if my backend can already keep a client secret safe?**
Because PKCE defends against a different attack (authorization code interception) than the client secret does (client impersonation). OAuth 2.1 requires PKCE universally because the two protections are complementary, not redundant.

**Q: Access token, refresh token, or ID token — which do I send to my own API?**
The access token, always — it's the one meant for resource servers. The ID token is for your client to read identity claims from; the refresh token never leaves the token-issuing exchange with the authorization server.

**Q: Should I build my own authorization server or use a managed IdP?**
Use a managed IdP (Auth0, Okta, Entra ID, or a cloud provider's offering) unless authentication infrastructure is genuinely your product. Correctly implementing discovery, JWKS rotation, consent UX, and every item in this page's Security section is a substantial, ongoing responsibility.

**Q: How is OAuth related to the JWT skill on this platform?**
Very tightly: most access tokens and every OIDC ID token are, in practice, JWTs. This page covers when and why those tokens are issued and used; the JWT skill covers how their signatures, claims, and validation actually work at the byte level.

**Q: How does OAuth interact with session cookies?**
OAuth typically runs once, at login, to establish who the user is (via OIDC) or what they're authorized to access (via OAuth). After that, most web apps switch to a conventional cookie-based session (see the Cookies & Sessions skill) for every subsequent request, rather than re-running the OAuth dance on each page load.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What problem does OAuth 2.0 solve?* It lets a user grant a third-party app limited, revocable access to their data on another service without sharing their password — replacing the "type your real password into a third-party form" anti-pattern with scoped, expiring tokens.
2. *Name the four OAuth actors.* Resource owner (user), client (the app requesting access), authorization server (issues tokens after login/consent), resource server (hosts the protected data and accepts the token).
3. *What is the difference between OAuth and OIDC?* OAuth is authorization only; OIDC is a thin identity layer built on top of OAuth that adds a standardized ID token and claims so the client can reliably answer "who is this user."
4. *What is a scope?* A named permission string (e.g. "read:email") the client requests; the consent screen shows it in human terms, and the issued token is restricted to only the approved scopes.
5. *Why is the authorization code exchanged on the backend instead of used directly?* The code that traveled through the browser is visible in history/logs and is useless alone; only the backend, holding the client secret (or PKCE verifier), can complete the exchange for an actual token — this keeps a leaked code from being directly usable.

**Senior:**

6. *Walk through Authorization Code + PKCE end to end, and explain what PKCE specifically defends against.* Generate verifier/challenge before redirecting; challenge sent to /authorize; verifier sent to /token; the authorization server confirms hash(verifier) equals the stored challenge. It defends against authorization code interception — someone who steals the code in transit still can't complete the exchange without the verifier, which never traveled over the network until the final TLS-protected call.
7. *Explain state vs nonce.* state defends the callback against CSRF/login-fixation by proving the browser completing the flow is the one that started it; nonce is embedded in the signed ID token itself to prevent replay of a previously issued token into a new session — different attack, different mechanism, both are "random value you generate and check."
8. *How do you validate an ID token correctly, and what happens if you skip a step?* Verify signature via the provider's current JWKS (looked up by kid), then check issuer, audience (your client_id), expiry, and nonce. Skipping audience allows a token minted for a different client of the same issuer to be replayed against you (confused deputy); skipping signature verification allows a forged token with arbitrary claims.
9. *Why are the Implicit and Resource Owner Password grants deprecated?* Implicit returns tokens directly in a URL fragment with no code-exchange step and by spec no refresh token, leaking tokens into history/logs/referrers with no client authentication; Password grant reintroduces the pre-OAuth anti-pattern of the client handling the user's real credentials directly. Both are formally removed in OAuth 2.1 in favor of Authorization Code + PKCE and Client Credentials respectively.
10. *Design a multi-tenant SaaS product where each customer connects their own Google Workspace via OAuth — what security properties do you enforce?* Store per-tenant tokens scoped and encrypted at rest, always check the token audience matches your client_id, never let a token minted for Tenant A be reachable by code paths serving Tenant B, use incremental/minimal scope per feature, and support per-tenant revocation without affecting other tenants.
11. *Access tokens are JWTs — how do you handle revocation before expiry?* Keep access-token lifetimes short (5–15 min) so unrevoked-but-compromised tokens have a small blast radius; make the refresh token the actual revocable control point (checked against a server-side store on every use) so killing a session means invalidating its refresh token, not trying to revoke a self-verifying JWT.
12. *A provider rotates its signing keys — what breaks if you don't handle it, and how do you handle it correctly?* If you cached a single fixed public key, valid new tokens signed with the new key fail signature verification the moment rotation happens. Correct handling: look up the key by kid from a periodically refreshed JWKS cache, and treat a kid-not-found as a signal to refresh the cache once before failing, not as an immediate hard error.
`,

  "coding-questions": `
### 1. Validate an OAuth callback's state parameter safely (tests CSRF-defense reasoning)

~~~python
import time
import secrets

_pending: dict[str, float] = {}
_TTL_SECONDS = 600

def issue_state() -> str:
    now = time.time()
    for s, ts in list(_pending.items()):          # opportunistic cleanup
        if now - ts > _TTL_SECONDS:
            _pending.pop(s, None)
    state = secrets.token_urlsafe(24)
    _pending[state] = now
    return state

def consume_state(state: str | None) -> bool:
    """Returns True iff the state exists, is unexpired, and has not been used before.
    Consuming (popping) it makes replay of the same state impossible."""
    if not state:
        return False
    issued_at = _pending.pop(state, None)
    if issued_at is None:
        return False
    return (time.time() - issued_at) <= _TTL_SECONDS

assert consume_state(issue_state()) is True
s = issue_state()
consume_state(s)
assert consume_state(s) is False        # reuse rejected
assert consume_state("made-up") is False
assert consume_state(None) is False
~~~

Complexity: O(1) amortized per call (occasional O(n) cleanup pass). Follow-ups: make this work across multiple backend instances (move to Redis with a TTL-native SETNX/expire, since the in-process dict shown here does not survive horizontal scaling — see Scalability); add rate limiting per IP on the /authorize endpoint to blunt state-exhaustion attempts.

### 2. Implement PKCE pair generation and verification (tests crypto-adjacent correctness)

~~~python
import base64
import hashlib
import hmac
import secrets

def generate_pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge

def verify_pkce(verifier: str, expected_challenge: str) -> bool:
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    computed = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    # Constant-time comparison prevents timing side-channels on the check.
    return hmac.compare_digest(computed, expected_challenge)

verifier, challenge = generate_pkce_pair()
assert verify_pkce(verifier, challenge) is True
assert verify_pkce("wrong-verifier", challenge) is False
~~~

Complexity: O(1) — fixed-size hashing regardless of input, aside from the linear cost of hashing the verifier string itself. Follow-ups: explain why hmac.compare_digest matters here (avoids a timing attack that could let an attacker guess the challenge byte-by-byte); explain why S256 (hashed) is required over the legacy "plain" method (plain sends the verifier itself as the challenge, which offers no protection if an attacker can observe the initial /authorize request).

### 3. Minimal ID token claim validator (tests the full OIDC validation checklist)

~~~python
import time

class IdTokenError(Exception):
    pass

def validate_id_token_claims(
    claims: dict,
    expected_issuer: str,
    expected_audience: str,
    expected_nonce: str | None = None,
    clock_skew_seconds: int = 60,
) -> None:
    """Assumes the signature was ALREADY verified against the provider's
    JWKS before this function runs -- claim checks alone are not enough."""
    now = time.time()
    if claims.get("iss") != expected_issuer:
        raise IdTokenError("issuer mismatch")
    aud = claims.get("aud")
    aud_ok = aud == expected_audience or (isinstance(aud, list) and expected_audience in aud)
    if not aud_ok:
        raise IdTokenError("audience mismatch")
    if claims.get("exp", 0) + clock_skew_seconds < now:
        raise IdTokenError("token expired")
    if "nbf" in claims and claims["nbf"] - clock_skew_seconds > now:
        raise IdTokenError("token not yet valid")
    if expected_nonce is not None and claims.get("nonce") != expected_nonce:
        raise IdTokenError("nonce mismatch -- possible replay")

good = {"iss": "https://auth.example.com", "aud": "client-123",
        "exp": time.time() + 300, "nonce": "abc"}
validate_id_token_claims(good, "https://auth.example.com", "client-123", "abc")  # passes
~~~

Complexity: O(1). Follow-ups: extend to support multiple valid issuers during a provider migration; discuss why clock_skew_seconds exists (small, unavoidable clock drift between systems) and why it should stay small (60–120s), not large (it directly widens the token's usable-after-expiry window).
`,

  "hands-on-labs": `
### Lab 1 — Hand-trace an Authorization Code flow (beginner, ~1h)
Register a free OAuth app with GitHub (Settings → Developer settings → OAuth Apps). Using only curl/httpie and a browser, manually walk through: build the /authorize URL, complete login+consent in the browser, capture the code from the redirect, and POST it to /access_token yourself. Deliverable: a short write-up of what each parameter (client_id, redirect_uri, code, state) actually did. Skills: the raw mechanics, without a library hiding any step.

### Lab 2 — Build a minimal OAuth client with PKCE (intermediate, ~3h)
Implement /auth/oauth/start and /auth/oauth/callback for one OIDC provider (Google) in FastAPI: generate state + PKCE pair, redirect, verify state on callback, exchange the code, verify the ID token's signature via the provider's live JWKS, and print the validated claims. Deliverable: a working local login flow plus a short doc explaining each validation step and what attack it defends against. Skills: PKCE, state, JWKS-based verification, all from Intermediate/Advanced Concepts.

### Lab 3 — Multi-provider social login with account linking (advanced, ~4h)
Extend Lab 2 to support GitHub (no id_token — call the profile endpoint instead) and one more OIDC provider, upsert users into a real database keyed by (provider, provider_id), and implement account linking by verified email for a second login method on an existing account. Deliverable: a small test suite covering state reuse, expired code, and the "same email via two providers" linking scenario. Skills: provider abstraction, account-linking edge cases, testing doctrine from this page.

### Lab 4 — Production-harden and deploy (production, ~3h)
Take Lab 3's service, move state/PKCE storage to Redis (to survive multiple instances), add Prometheus counters for callback outcomes and token-exchange latency, deliver the final app token to the browser via a URL fragment, containerize with a multi-stage Dockerfile injecting secrets at runtime, and load-test the login path with several concurrent "users." Deliverable: a short runbook covering what to check first when logins start failing in production. Skills: the entire Production, Monitoring, Deployment, and Scalability sections, end to end.
`,

  "real-projects": `
Portfolio-grade projects that map directly to what employers screen for:

1. **"Sign in with X" starter kit** — A reusable FastAPI (or NestJS) module implementing Authorization Code + PKCE for 3+ providers (Google, GitHub, Microsoft) behind one uniform interface, with full ID token verification, account linking, Redis-backed state storage, and a documented test suite covering every failure path in this page's Common Errors table. Demonstrates: protocol depth, security-first defaults, clean abstraction design — directly reusable across future projects.

2. **A minimal OAuth 2.0 authorization server** — Implement your own /authorize, /token, /introspect, and /.well-known/openid-configuration + JWKS endpoints supporting Authorization Code + PKCE and Client Credentials, with key rotation (two live keys at once) and a simple consent UI. Demonstrates: understanding OAuth from the *issuer's* side, not just the client's — a rarer, more impressive skill to show in interviews. (Do not use this in real production without a serious security review; the value here is educational depth.)

3. **Agent-to-service delegated access gateway** — A small service where an AI agent, acting on behalf of a user, requests scoped access to the user's calendar/email via OAuth (with explicit per-scope consent UI), stores the resulting tokens encrypted, refreshes them proactively, and exposes a narrow internal API the agent calls instead of ever holding raw provider tokens itself. Demonstrates: applying the OAuth delegation model to the agentic-AI access-control problem — highly relevant to current AI engineering roles.

Each project: full ID-token/JWT verification (no verify_signature=False shortcuts left in), a Redis-backed shared state store, structured logging with no secrets logged, a README with the architecture diagram from this page adapted to the project, and a test suite exercising the CSRF/replay/expiry edge cases explicitly.
`,

  "case-studies": `
### GitHub: OAuth without OIDC
GitHub's OAuth implementation predates and does not implement OpenID Connect — there is no id_token. Any integration needing "who is this GitHub user" must call the REST /user endpoint with the access token after exchange, and separately call /user/emails if the profile's primary email is private (a real, frequently-hit edge case — see this platform's own auth.py, which explicitly falls back to the emails endpoint and filters for primary && verified). Lesson: "OAuth provider" does not imply "OIDC provider" — never assume an id_token will be present; check per-provider.

### Apple: client authentication without a static secret
Sign in with Apple requires the client to authenticate to the token endpoint with a short-lived JWT client assertion, signed with ES256 using a private key downloaded once from Apple's developer portal, re-generated fresh (a few minutes' validity) on every token exchange rather than being a long-lived static secret. Lesson: OAuth's "client_secret" is a policy slot, not a fixed shape — different providers fill it with genuinely different trust mechanisms, and a client abstraction has to accommodate that rather than assuming every provider looks like Google.

### A widely-documented class of "Sign in with Google" misconfigurations (2016–2018 era)
Multiple security researchers publicly documented mobile and web apps that verified an ID token's signature but skipped the audience check, allowing a token minted for a different (attacker-controlled) app registered with the same provider to be replayed against the victim app's backend and accepted as a valid login. Lesson: signature validity answers "is this really from the provider," not "was this token meant for me" — audience checking is the second, equally mandatory half of ID token validation, and it is exactly the kind of subtle omission that passes casual testing but fails a real security review.

### The industry-wide deprecation of the Implicit grant (2017–2020)
Following RFC 8252 (OAuth for native apps) and mounting evidence of token leakage via URL fragments, browser history, and referrer headers, the IETF's OAuth Security BCP recommended against the Implicit grant broadly, and OAuth 2.1 formally removes it. Major providers (Google among the first) began deprecating and eventually disabling implicit-grant support for new client registrations. Lesson: a specification's "menu of options" can include options that are later collectively judged unsafe — following current best-practice guidance (PKCE everywhere, no Implicit) matters more than following the original RFC to the letter.
`,

  comparisons: `
| Dimension | OAuth 2.0 + OIDC | SAML 2.0 | Session cookies (own login) | API keys |
|-----------|------------------|----------|------------------------------|----------|
| Primary purpose | Delegated authorization + (via OIDC) federated identity | Federated identity, enterprise SSO | First-party session management after any login method | Simple machine/service authentication |
| Token format | JWT (usually) or opaque | XML (SAML assertions) | Opaque session ID (server-side state) | Opaque static secret |
| Transport | Browser redirects + back-channel HTTP | Browser redirects + XML POST | Cookie header | Custom header (Authorization/X-API-Key) |
| Best for | Social login, third-party API delegation, mobile/native apps | Enterprise B2B SSO (legacy IdPs like ADFS still common) | Traditional web app "logged in" state | Server-to-server, no per-user identity needed |
| Revocation | Refresh-token revocation; short-lived access tokens | Session/assertion-based, IdP-dependent | Immediate (delete server-side session) | Immediate (delete/rotate the key) — but usually all-or-nothing |
| Modern trend | Dominant for consumer + growing in enterprise | Being replaced by OIDC in new enterprise deployments | Still the norm for the browser-facing half of most apps, often set up BY an OAuth/OIDC login | Being phased toward scoped tokens (OAuth client credentials) for finer-grained control |

**How seniors choose**: use OAuth + OIDC whenever a third party (a real IdP, or your own product being integrated into by other apps) is involved, or whenever social login is wanted. Use SAML only when integrating with an enterprise customer whose existing IdP requires it (often layered underneath an OIDC bridge rather than hand-rolled). Use plain session cookies for the ongoing "is this browser logged in" state regardless of which login method established it — see the **Cookies & Sessions** skill. Use API keys only for simple service-to-service cases with no real per-user identity or fine-grained scope needs; reach for OAuth Client Credentials the moment you need expiry, scoping, or rotation without downtime.
`,

  "related-technologies": `
- **JWT** — the token format underneath most OAuth access tokens and every OIDC ID token; see that skill for signature algorithms, claims, and validation internals this page assumes.
- **Cookies & Sessions** — how your app keeps a user "logged in" between requests after OAuth/OIDC establishes who they are once; see that skill for cookie attributes (HttpOnly, Secure, SameSite) and session-fixation defenses.
- **RBAC** — once OAuth/OIDC tells you who the user is, RBAC decides what roles they hold and what actions those roles permit inside your product.
- **ABAC** — a more flexible, attribute/policy-driven alternative to RBAC for fine-grained, contextual authorization decisions after login.
- **SAML 2.0** — the older, XML-based federated-identity standard OIDC has largely displaced for new integrations; still common in enterprise IdPs.
- **mTLS / Zero Trust service identity** — an alternative or complement to Client Credentials for machine-to-machine authentication in a service mesh.
- **WebAuthn / Passkeys** — a parallel, password-less authentication mechanism for the initial login step itself, which can sit in front of (or alongside) an OAuth/OIDC provider's own login page.
- **API Gateways** (Kong, Apigee, AWS API Gateway) — commonly perform access-token validation (JWKS-based) at the edge before a request ever reaches your resource server.

On this platform, the natural next pages in the new **Authentication** category: **JWT** → **Cookies & Sessions** → **RBAC** → **ABAC** — each builds directly on the identity and token concepts introduced here.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025; check the IETF OAuth working group page and openid.net for anything newer.

- **OAuth 2.1** (ongoing IETF consolidation effort, not yet a single numbered RFC as of this writing): folds the Security Best Current Practice into the core spec — PKCE mandatory for every authorization-code client, Implicit and Resource Owner Password grants removed, exact redirect_uri matching required (no partial/prefix matching). Treat "OAuth 2.1" today as "OAuth 2.0 done according to current best practice," which production systems have largely already adopted.
- **RFC 9700** (OAuth 2.0 Security Best Current Practice, published 2025) — formalizes the recommendations OAuth 2.1 draws from; worth reading directly if implementing an authorization server.
- **Rich Authorization Requests (RAR, RFC 9396)** and **Pushed Authorization Requests (PAR, RFC 9126)** — newer extensions letting clients send authorization details as a structured object and pre-register the authorization request server-to-server rather than passing everything through the browser's URL, closing several URL-length and tampering edge cases. Growing adoption in higher-security (open banking, healthcare) deployments.
- **DPoP (Demonstrating Proof of Possession, RFC 9449)** — an emerging mechanism to bind an access token to a specific client key pair, so a stolen bearer token alone is no longer sufficient to use it — a meaningful hardening step beyond plain bearer tokens, seeing early adoption in high-security APIs.
- **Agentic AI and delegated access (2024–2026 trend)**: growing practical use of OAuth (particularly Client Credentials and device-code-style flows) to let autonomous AI agents obtain scoped, user-consented access to third-party services, rather than being handed a user's raw long-lived API keys — an active, fast-moving area worth watching rather than a settled standard yet.
`,

  "future-roadmap": `
Where OAuth/OIDC is heading over the next few years:

1. **OAuth 2.1 becomes "just OAuth."** As tooling and providers converge on it, expect fewer implementations to even offer the deprecated Implicit/Password grants at all — the "good parts" subset becomes the only parts.
2. **Proof-of-possession tokens (DPoP) go mainstream.** Bearer tokens (anyone holding the token can use it) are a known weak point; binding tokens to a client key, so a stolen token alone is insufficient, is likely to spread from high-security APIs into mainstream use over the next several years.
3. **Structured, pre-registered authorization requests (PAR/RAR) reduce the browser's role as the sole carrier of sensitive request data**, particularly in regulated industries (open banking, health data) where request tampering and URL-length limits are real operational concerns today.
4. **Passwordless-first login flows** (WebAuthn/passkeys as the *initial* authentication step, with OAuth/OIDC still handling the delegation/federation layer on top) continue displacing password-based login as the entry point, even though OAuth's delegation model underneath stays largely unchanged.
5. **Agentic AI delegation becomes a first-class OAuth use case.** As AI agents increasingly act on users' behalf against third-party APIs, expect clearer conventions (and likely new extensions) for narrow, auditable, revocable scopes specifically designed for autonomous, non-interactive callers — an extension of the same delegation problem OAuth solved for human-driven apps two decades ago.

For your career: understanding the *why* behind PKCE, audience validation, and short-lived tokens ages far better than memorizing any single provider's SDK — providers change their client libraries constantly, but the protocol-level reasoning in this page has been stable, hard-won knowledge since the 2015–2020 security hardening era.
`,

  "cheat-sheet": `
~~~text
--- Actors ---
Resource Owner   -- the user
Client           -- the app requesting access
Authorization Server -- issues tokens (login + consent happens here)
Resource Server  -- hosts the protected data, accepts the token

--- Core flow: Authorization Code + PKCE (use this by default) ---
1. Client generates code_verifier (random) and code_challenge = base64url(sha256(code_verifier))
2. Redirect to /authorize with: response_type=code, client_id, redirect_uri,
   scope, state, code_challenge, code_challenge_method=S256
3. User logs in + consents on the AUTHORIZATION SERVER's own page
4. Redirect back to redirect_uri with: code, state
5. Client verifies state matches what it stored -- reject if not
6. Backend POSTs to /token: code, code_verifier, client_id, (client_secret
   if confidential), redirect_uri, grant_type=authorization_code
7. Response: access_token, refresh_token, (id_token if scope had openid)

--- Token types ---
Access token  -> sent to RESOURCE SERVER; short-lived (5-15 min ideal)
Refresh token -> sent ONLY to the /token endpoint; rotate on each use
ID token      -> OIDC only; for the CLIENT to read identity claims from

--- state vs nonce ---
state -> CSRF defense on the callback (per OAuth 2.0)
nonce -> replay defense on the ID TOKEN (per OIDC), checked inside the JWT

--- ID token validation checklist (ALL required) ---
1. Signature verified against provider's live JWKS (lookup key by kid)
2. iss (issuer) matches expected provider
3. aud (audience) matches YOUR client_id
4. exp not passed (with small clock-skew allowance)
5. nonce matches what you sent (if you sent one)

--- Deprecated -- do not use in new systems ---
Implicit grant (response_type=token)     -> token in URL fragment, no code exchange
Resource Owner Password grant (grant_type=password) -> client handles raw user password

--- Grant type quick picker ---
Web/mobile/SPA login       -> Authorization Code + PKCE
Machine-to-machine, no user -> Client Credentials
No browser on device (TV/CLI) -> Device Authorization Grant

--- Discovery & keys ---
GET /.well-known/openid-configuration  -> all endpoint URLs, capabilities
GET <jwks_uri>                          -> current public signing keys (by kid)
Keys rotate -- always support the previous AND new key during overlap window

--- Common vulnerabilities to defend ---
Open redirect          -> allowlist exact redirect_uri, never build from input
CSRF on callback        -> validate state, single-use, tied to session
Code interception       -> PKCE (defends confidential clients too)
Token leakage           -> avoid query strings for tokens; no logging tokens
Confused deputy         -> always check aud on every JWT

--- Related platform skills ---
JWT               -- token format/signature internals
Cookies & Sessions -- keeping the browser "logged in" after OAuth
RBAC / ABAC       -- authorization INSIDE your app, after login
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Is OAuth 2.0 authentication or authorization? | Authorization — it grants delegated access; OIDC adds identity on top |
| What are the four OAuth actors? | Resource owner, client, authorization server, resource server |
| What does PKCE defend against? | Authorization code interception — a stolen code alone can't be exchanged without the code_verifier |
| state vs nonce | state = CSRF defense on the callback; nonce = replay defense embedded in the signed ID token |
| Which grant is recommended for web/mobile/SPA login today? | Authorization Code with PKCE |
| Why are Implicit and Password grants deprecated? | Implicit leaks tokens via URL fragments/history/referrers with no client auth; Password grant reintroduces the raw-password anti-pattern |
| What goes to the resource server? | The access token only — never the ID token or refresh token |
| What is the ID token for? | Proving identity to the CLIENT — carries signed claims like sub, email, name, nonce |
| How do you verify a JWT's signing key without a shared secret? | Fetch the provider's JWKS, find the key by kid, verify the signature with that public key |
| What must you check on an ID token besides its signature? | Issuer, audience (your client_id), expiry, and nonce |
| What is the OIDC discovery document? | The /.well-known/openid-configuration JSON listing all endpoint URLs and capabilities, so clients avoid hardcoding them |
| Ideal access token lifetime? | Short — 5 to 15 minutes; refresh tokens (rotated per use) carry the long-lived session |
| Where should the client secret and refresh token live? | On the backend only, never in browser storage or a mobile app readable by JS/WebViews |
| What is a confused-deputy attack in OAuth? | A token valid for one client of the same authorization server is replayed against a different client that failed to check the audience claim |
| Which grant fits machine-to-machine calls with no user? | Client Credentials Grant |
`,

  mcqs: `
**1. A mobile app cannot safely store a client secret. What should it use instead of a static secret when using the Authorization Code grant?**

A) The Implicit grant  B) PKCE (code_verifier/code_challenge)  C) The Resource Owner Password grant  D) Nothing — mobile apps skip client authentication entirely

**Answer: B** — PKCE lets a public client prove it is the same party that started the flow without needing a static secret.

**2. Which token should be sent to a resource server (a protected API)?**

A) The ID token  B) The refresh token  C) The access token  D) The authorization code

**Answer: C** — the access token is scoped for resource-server use; the ID token is for the client, the refresh token is for the token endpoint only, and the code is single-use and already consumed by that point.

**3. What is the primary purpose of the state parameter?**

A) Encrypting the access token  B) CSRF protection on the callback  C) Specifying requested scopes  D) Signing the ID token

**Answer: B** — state proves the browser completing the callback is the same one that initiated the flow, preventing login CSRF.

**4. An ID token has a valid signature from the correct provider. Is that sufficient to trust it?**

A) Yes, signature validity is the only requirement  B) No — issuer, audience, expiry, and nonce must also be checked  C) No, ID tokens can never be trusted  D) Yes, as long as it's over HTTPS

**Answer: B** — a validly signed token could still be meant for a different client (audience mismatch) or expired; full validation requires all the claim checks, not just the signature.

**5. Why was the Implicit grant deprecated?**

A) It's slower than Authorization Code  B) It requires PKCE which is complex  C) It returns the token directly in a URL fragment with no code-exchange or client-authentication step, exposing it to leakage via history/logs/referrers  D) It doesn't support scopes

**Answer: C** — Implicit skipped the secure code-exchange step entirely, exposing tokens to multiple leakage vectors.

**6. What is the correct place to check a resource-server request's authorization scope?**

A) The resource server should check the token's granted scopes on every request  B) Scope checking is optional if TLS is used  C) The authorization server enforces scope forever, so the resource server can trust any valid token unconditionally  D) Scopes are purely documentation for the consent screen

**Answer: A** — a valid token proves the request is from an authenticated party with SOME granted scopes; the resource server must still check those scopes match what the specific endpoint requires.
`,

  "revision-notes": `
**Core distinction in one line:** OAuth 2.0 grants delegated authorization ("this app may access this scoped resource"); OpenID Connect adds identity on top via a signed ID token, answering "who is this user."

**The four actors and the default flow:** resource owner, client, authorization server, resource server. Default flow for anything interactive: Authorization Code + PKCE — redirect to /authorize with a code_challenge and state, user logs in and consents on the authorization server's own page, code comes back to your redirect_uri, your backend exchanges it (with the code_verifier and, for confidential clients, the client secret) at /token for an access token, refresh token, and (if OIDC) an ID token.

**Token discipline:** access token → resource server, short-lived (5–15 min). Refresh token → token endpoint only, rotates per use, is the real revocation lever. ID token → client only, never sent to an API. state defends the callback from CSRF; nonce (inside the ID token) defends against replay. Validate every ID token fully: signature via JWKS-by-kid, issuer, audience, expiry, nonce — signature alone is not enough.

**Deprecated, avoid in new systems:** Implicit grant (token in a URL fragment, no code exchange, no client auth) and Resource Owner Password grant (client handles the raw password) — both formally removed under OAuth 2.1 in favor of Authorization Code + PKCE and Client Credentials.

**Production discipline:** keep the OAuth client role (secrets, refresh tokens) on the backend, never in browser/mobile storage reachable by JS; store state/PKCE verifiers in a shared store (Redis) for multi-instance deploys; register exact redirect URIs per environment; cache JWKS/discovery with sane TTLs and support key rotation with an overlap window; never log token values; check audience on every JWT to avoid confused-deputy replay; prefer a managed IdP over hand-rolling an authorization server unless that's genuinely your product. After login, everyday "is this browser logged in" state is handled by a conventional session (see Cookies & Sessions), not by re-running OAuth on every request.
`,

  "learning-roadmap": `
A realistic path to production-grade OAuth/OIDC fluency:

**Week 1 — Foundations and mental model.** Overview through Prerequisites, plus Beginner Concepts. Do Lab 1 (hand-trace a real GitHub OAuth flow with curl). Milestone: you can explain, unprompted, why OAuth is authorization and not authentication.

**Week 2 — The flow that matters most.** Intermediate Concepts (PKCE, state/nonce, discovery, JWKS, the three token types) plus Internal Working and Data Flow. Do Lab 2 (build a minimal client with PKCE and real ID token verification). Milestone: your own working Google login, with every validation step explained in your own words.

**Week 3 — Beyond the happy path.** Advanced Concepts (confidential vs public clients, deprecated grants, Client Credentials, Device Grant, multi-tenant considerations) plus Security and Anti-Patterns. Do Lab 3 (multi-provider social login with account linking). Milestone: you can name and defend against every vulnerability in the Security section from memory.

**Week 4 — Production hardening.** Production Usage through Production Checklist, plus Testing and Debugging. Do Lab 4 (Redis-backed state, metrics, secure token delivery, containerized deploy). Milestone: a deployed, monitored, tested OAuth integration you would be comfortable putting in front of real users.

**Week 5 — Interview and portfolio polish.** Interview/Coding Questions, Case Studies, Comparisons. Build Real Project 1 (the multi-provider starter kit) or Project 3 (the agentic-AI delegation gateway) if you're targeting AI engineering roles specifically. Milestone: explain PKCE, state/nonce, audience validation, and the Implicit-grant deprecation out loud, unprompted, with the "why" for each.

Then continue to **JWT** on this platform to go one level deeper into how the tokens themselves are signed and verified, followed by **Cookies & Sessions**, **RBAC**, and **ABAC** to complete the Authentication category.
`,

  "official-docs": `
- [RFC 6749 — The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749) — the core spec; read the grant-type sections directly at least once.
- [RFC 6750 — Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750) — how access tokens are actually sent and validated.
- [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636) — short, precise, worth reading in full.
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — the ID token, claims, and discovery specification.
- [RFC 8252 — OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252) — why PKCE and the system browser are mandatory for mobile.
- [RFC 8628 — Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628) — the TV/CLI login flow.
- [RFC 9700 — OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700) — the consolidated modern guidance behind OAuth 2.1.
- [OAuth 2.1 draft](https://oauth.net/2.1/) — the in-progress consolidation of the above into one narrower spec.
- [Google Identity Platform OIDC docs](https://developers.google.com/identity/openid-connect/openid-connect) — a clean, compliant reference implementation to read alongside the specs.
`,

  books: `
- **OAuth 2 in Action** — Justin Richer & Antonio Sanso. The most thorough, implementation-focused OAuth book; written by an author of several core specs.
- **OpenID Connect in Action** — Prabath Siriwardena. Companion depth specifically on the OIDC identity layer this page builds on.
- **Advanced API Security** — Prabath Siriwardena & Nuwan Dias. Covers OAuth, OIDC, and broader API security together — good for seeing how the pieces compose in a real system.
- **Web Application Security** — Andrew Hoffman. Not OAuth-specific, but the CSRF, session, and token-handling chapters directly inform how to implement OAuth callbacks safely.
- **Identity and Data Security for Web Development** — Jonathan LeBlanc & Tim Messerschmidt. A practical, implementation-first companion for the token-handling and storage guidance in this page's Security section.
`,

  blogs: `
- **Auth0 blog** (auth0.com/blog) — consistently detailed, provider-neutral explainer content on OAuth/OIDC flows and vulnerabilities.
- **Okta Developer blog** (developer.okta.com/blog) — deep dives on token validation, PKCE, and real integration walkthroughs.
- **Aaron Parecki's blog** (aaronparecki.com) — one of the OAuth 2.1 and PKCE spec authors; precise, first-hand explanations.
- **Ping Identity blog** — enterprise-focused OAuth/OIDC/SAML comparisons, useful for the Comparisons section's enterprise angle.
- **PortSwigger Web Security Academy** (portswigger.net/web-security) — the best free, hands-on resource for OAuth-specific vulnerability labs (open redirect, CSRF, token leakage).
- **IETF OAuth Working Group mailing list archives** — where the actual security debates behind OAuth 2.1 happen, for readers who want primary-source depth.
`,

  "research-papers": `
Research on OAuth specifically is thinner than on core cryptography or distributed systems — most of the field's rigor lives in RFCs and formal security analyses rather than traditional papers. The closest foundational and directly relevant reading:

- **"A Formal Analysis of OAuth 2.0"** (or equivalently titled formal-verification work presented at IEEE S&P / CCS in the mid-2010s) — models the protocol and its flows formally, identifying the classes of attacks (state omission, redirect confusion) this page covers practically.
- **"Do Not Trust Me: Using Malicious IdPs for Analyzing and Attacking Single Sign-On"** (S&P, 2016) — a widely cited empirical study of real-world OIDC/OAuth SSO implementation flaws, directly underpinning the audience-confusion and mix-up-attack content in this page's Security section.
- **RFC 9700 (OAuth Security BCP)** — while formally a specification rather than an academic paper, it functions as the field's living, peer-reviewed security-analysis document and is the closest thing to a comprehensive "state of OAuth security" reference.
- If you want the deeper cryptographic foundation underneath the tokens themselves (JWT signing algorithms, key management), see the research-papers section of the **JWT** skill on this platform — that is genuinely the more paper-rich adjacent topic.
`,

  videos: `
- **Aaron Parecki — "OAuth 2.0 and OpenID Connect (in plain English)"** (YouTube, Okta) — widely regarded as the clearest single explainer of the whole protocol family; a great first watch before this page's Advanced Concepts.
- **Nate Barbettini — OAuth/OIDC conference talks** — practical, implementation-focused walkthroughs of common integration mistakes.
- **PKCE explained talks from Okta/Auth0 developer conferences** — visual walkthroughs of the code_verifier/code_challenge exchange that pair well with this page's Intermediate Concepts section.
- **IETF OAuth Working Group session recordings** — for readers who want to watch the actual standardization debates (state of OAuth 2.1, DPoP, PAR/RAR) unfold.
- **PortSwigger's OAuth vulnerability walkthroughs** — short, hands-on videos demonstrating open redirect, CSRF, and token-leakage attacks against deliberately vulnerable labs.
`,

  "github-repos": `
- [oauthlib/oauthlib](https://github.com/oauthlib/oauthlib) — a widely used, spec-compliant Python OAuth implementation; good for reading how RFC details translate into code.
- [authlib/authlib](https://github.com/authlib/authlib) — a modern Python OAuth/OIDC client and server library with clean, readable internals.
- [panva/node-openid-client](https://github.com/panva/node-openid-client) — a rigorously spec-compliant OIDC client for Node; excellent reference for correct discovery/JWKS/ID-token handling.
- [ory/hydra](https://github.com/ory/hydra) — an open-source OAuth 2.0/OIDC server; reading its code is a great way to see the *issuer* side of every flow in this page.
- [ory/fosite](https://github.com/ory/fosite) — the extensible OAuth2/OIDC framework underneath Hydra; even more focused on spec-correct primitives.
- [dexidp/dex](https://github.com/dexidp/dex) — an OIDC identity provider that federates to upstream providers (Google, GitHub, LDAP); a good, approachable example of provider abstraction.
- [PortSwigger/oauth-labs](https://portswigger.net/web-security/oauth) (Web Security Academy, linked from GitHub-hosted writeups) — hands-on vulnerable-by-design OAuth labs.
- This platform's own **api/app/api/v1/auth.py** — a compact, real, multi-provider (GitHub/Google/Apple) Authorization Code implementation with state-based CSRF protection, worth re-reading after finishing this page.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *State handling*: implement issue/consume-once/expire semantics for the state parameter with unit tests for reuse, expiry, and forged values (Coding Question 1 above is a starting point — extend it with a Redis-backed version).
2. *PKCE*: implement code_verifier/code_challenge generation and verification, including a test proving the legacy "plain" method offers no protection against an observed /authorize request.
3. *ID token validation*: build a full validator (signature via JWKS, issuer, audience, expiry, nonce) and write a test per rejected-claim scenario — six or more distinct failure tests.
4. *Provider abstraction*: implement the Authorization Code exchange for two providers with genuinely different response shapes (one OIDC with an id_token, one classic-OAuth like GitHub needing a follow-up profile call) behind one interface.
5. *Account linking*: given a user database, write the upsert logic for "new OAuth login, existing email, different provider" without creating a duplicate account, with tests for both orderings (password-first-then-OAuth, OAuth-first-then-password).
6. *Security review exercise*: given a deliberately flawed OAuth callback handler (skip state, skip audience check, or log the access token), find and fix each flaw — a great mock-interview or pair-review exercise.
7. *Token refresh*: implement proactive refresh-before-expiry with a single-flight guard so concurrent requests near expiry don't trigger a refresh stampede against the authorization server.

External sets: PortSwigger Web Security Academy's OAuth topic (hands-on vulnerable labs, free); OWASP's OAuth-related cheat sheets for a checklist-style review; any managed IdP's (Auth0/Okta) free developer sandbox for testing real end-to-end flows against a compliant provider.
`,

  "architecture-diagram": `
The reference production architecture for OAuth/OIDC login in a real AI-era SaaS product:

~~~mermaid
flowchart TB
    Client["Browser / mobile app"] --> FE["Frontend"]
    FE -->|1. start login| BE["Backend: OAuth client (BFF)"]
    BE -->|2. redirect w/ PKCE + state| AS["Authorization Server\n(Google / GitHub / Auth0 / your own IdP)"]
    AS -->|3. login + consent| Client
    AS -->|4. redirect w/ code| BE
    BE -->|5. state lookup| Redis[("Redis: pending state,\nPKCE verifiers, TTL")]
    BE -->|6. exchange code| AS
    BE -->|7. fetch/verify keys| JWKS["Provider JWKS\n(cached w/ TTL)"]
    BE -->|8. upsert identity| DB[("User DB:\nprovider + provider_id + email")]
    BE -->|9. issue session/app token| FE
    FE -->|10. session cookie| Client
    BE -->|later: call w/ access_token| RS["Resource Server / third-party API"]
    subgraph Observability
        M["Metrics: funnel, errors, latency"]
        L["Structured logs (no token values)"]
    end
    BE -.-> Observability
~~~

Every box maps to a section on this page: Redis-backed state to Scalability and Production Usage, JWKS caching to Performance, the User DB upsert to Data Flow, and the Observability subgraph to Monitoring.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OAuth 2.0 / OIDC))
    Foundations
      Authorization vs authentication
      Four actors
      Why OIDC exists
    Flows
      Authorization Code + PKCE
      Client Credentials
      Device Authorization Grant
      Deprecated: Implicit, Password
    Tokens
      Access token
      Refresh token
      ID token
      JWKS & key rotation
    Protections
      state -- CSRF
      nonce -- replay
      PKCE -- code interception
      Audience check -- confused deputy
    Production
      Provider config pattern
      Redis-backed state
      BFF pattern
      Monitoring & metrics
    Security
      Open redirect
      Token leakage
      Mix-up attacks
      Revocation strategy
    Ecosystem
      JWT
      Cookies and Sessions
      RBAC and ABAC
      SAML
      Managed IdPs
~~~
`,
};

export default oauth;
