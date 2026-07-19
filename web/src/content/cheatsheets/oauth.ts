import type { CheatSheetData } from "./types";

const oauth: CheatSheetData = {
  title: "The Ultimate OAuth 2.0 / OIDC Cheat Sheet",
  subtitle: "Actors, flows, tokens, PKCE, validation, and production hardening",
  sections: [
    {
      title: "Core Concepts & Actors",
      color: "violet",
      rows: [
        { term: "OAuth 2.0", desc: "Delegated AUTHORIZATION -- not authentication", code: "Grants an app scoped, revocable access\nto a resource, without sharing a password" },
        { term: "OpenID Connect (OIDC)", desc: "Identity layer built on top of OAuth 2.0", code: "Adds the ID token + standardized claims\nto answer WHO the user is" },
        { term: "Resource Owner", desc: "The user who owns the data", code: "Logs in and consents on the\nauthorization server's own page" },
        { term: "Client", desc: "The application requesting access", code: "Confidential (can hold a secret) or\nPublic (SPA, mobile -- cannot)" },
        { term: "Authorization Server", desc: "Authenticates the user, issues tokens", code: "Exposes /authorize, /token,\n/.well-known/openid-configuration" },
        { term: "Resource Server", desc: "Hosts the protected API/data", code: "Accepts Authorization: Bearer <access_token>\nmust check scopes itself" },
        { term: "Scope", desc: "One named permission the client requests", code: "openid email profile\nrepo read:user" },
        { term: "Consent screen", desc: "User approves the requested scopes explicitly", code: "\"App X wants to: read your email. Allow?\"" },
      ],
    },
    {
      title: "Tokens",
      color: "blue",
      rows: [
        { term: "Access token", desc: "Sent to the RESOURCE SERVER; short-lived", code: "Authorization: Bearer eyJhbGc...\nlifetime: 5-15 min ideal" },
        { term: "Refresh token", desc: "Sent ONLY to the token endpoint to get a new access token", code: "grant_type=refresh_token\nrotate on every use; revocable" },
        { term: "ID token", desc: "OIDC only -- for the CLIENT to read identity claims", code: "Signed JWT: sub, email, name,\niss, aud, exp, nonce" },
        { term: "Authorization code", desc: "Short-lived, single-use, exchanged at /token", code: "Lifetime ~30-60 sec\nUseless alone without secret/verifier" },
        { term: "Bearer semantics", desc: "Whoever holds the token can use it", code: "No proof of possession by default\n(DPoP adds binding -- see Advanced)" },
        { term: "Opaque vs JWT tokens", desc: "Two access-token shapes", code: "Opaque -> introspect at auth server\nJWT -> verify locally via JWKS" },
        { term: "Token introspection", desc: "RFC 7662 -- ask the auth server if a token is valid", code: "POST /introspect  token=...\n-> { active: true, scope, sub, exp }" },
        { term: "Token revocation", desc: "RFC 7009 -- invalidate a token proactively", code: "POST /revoke  token=...\nused for logout-everywhere" },
      ],
    },
    {
      title: "The Authorization Code + PKCE Flow",
      color: "emerald",
      rows: [
        { term: "Step 1: generate PKCE pair", desc: "Random verifier, hashed challenge", code: "verifier = random_urlsafe(64)\nchallenge = base64url(sha256(verifier))" },
        { term: "Step 2: redirect to /authorize", desc: "Include state + code_challenge", code: "response_type=code&client_id=...\n&redirect_uri=...&scope=...\n&state=...&code_challenge=...\n&code_challenge_method=S256" },
        { term: "Step 3: user logs in + consents", desc: "On the AUTHORIZATION SERVER's page, never yours", code: "Client never sees the real password" },
        { term: "Step 4: callback with code", desc: "Verify state BEFORE anything else", code: "GET redirect_uri?code=...&state=...\nif state != stored: reject 400" },
        { term: "Step 5: exchange at /token", desc: "Backend call, includes code_verifier", code: "grant_type=authorization_code\ncode=...&code_verifier=...\n&client_id=...&client_secret=..." },
        { term: "Step 6: receive tokens", desc: "Access, refresh, and (if OIDC) ID token", code: "{ access_token, refresh_token,\n  id_token, expires_in }" },
        { term: "state parameter", desc: "CSRF defense on the callback", code: "Generate server-side, store with TTL,\nconsume exactly once" },
        { term: "nonce parameter", desc: "Replay defense embedded in the ID token", code: "Send at /authorize; check it matches\nthe claim inside the returned id_token" },
        { term: "redirect_uri matching", desc: "Must exactly match what's registered", code: "No dynamic construction from request\ninput; register per environment" },
      ],
    },
    {
      title: "Grant Types & Discovery",
      color: "amber",
      rows: [
        { term: "Authorization Code + PKCE", desc: "Default for web apps, mobile apps, SPAs", code: "The only grant to reach for by default\nin 2026" },
        { term: "Client Credentials", desc: "Machine-to-machine, no user involved", code: "grant_type=client_credentials\nclient_id + client_secret -> access_token" },
        { term: "Device Authorization Grant", desc: "No browser on the device (TV, CLI)", code: "POST /device_authorization ->\ndevice_code + user_code + verification_uri\nthen poll /token until approved" },
        { term: "Implicit grant -- DEPRECATED", desc: "Token in URL fragment, no code exchange", code: "response_type=token  (avoid in new systems)\nLeaks via history/logs/referrers" },
        { term: "Resource Owner Password -- DEPRECATED", desc: "Client handles the raw user password", code: "grant_type=password  (avoid in new systems)\nReintroduces the pre-OAuth anti-pattern" },
        { term: "OIDC discovery document", desc: "Never hardcode provider endpoints", code: "GET /.well-known/openid-configuration\n-> authorization_endpoint, token_endpoint,\n   jwks_uri, issuer, scopes_supported" },
        { term: "JWKS (JSON Web Key Set)", desc: "Provider's public signing keys, by kid", code: "GET <jwks_uri>\nlook up key by the JWT header's kid" },
        { term: "Key rotation", desc: "Providers rotate signing keys periodically", code: "Cache JWKS with a TTL; support BOTH\nold and new key during overlap window" },
      ],
    },
    {
      title: "ID Token Validation & Pitfalls",
      color: "rose",
      rows: [
        { term: "Full ID token validation", desc: "ALL checks required, not just signature", code: "1. signature via JWKS (kid lookup)\n2. iss == expected issuer\n3. aud == your client_id\n4. exp not passed (+ small clock skew)\n5. nonce matches what you sent" },
        { term: "Confused deputy / audience mix-up", desc: "A token for a different client gets accepted", code: "ALWAYS check aud -- signature valid\nis NOT the same as meant for you" },
        { term: "Open redirect", desc: "Unvalidated redirect target hijacks the flow", code: "Allowlist exact redirect_uri values\nNever build from client input" },
        { term: "CSRF on callback (login CSRF)", desc: "Missing/reused state lets an attacker\nlog the victim into the attacker's account", code: "Generate, store, and consume state\nexactly once, tied to the session" },
        { term: "Authorization code interception", desc: "Code stolen in transit is exchanged by attacker", code: "PKCE defeats this even for\nconfidential (backend) clients" },
        { term: "Token leakage via URL/logs/referrer", desc: "Tokens in query strings can leak widely", code: "Deliver via URL fragment or POST body;\nnever log token values" },
        { term: "ID token used as an API token", desc: "Classic mix-up bug", code: "WRONG: send id_token to a resource server\nRIGHT: send access_token only" },
        { term: "Tokens in localStorage", desc: "Readable by any XSS payload on the page", code: "Keep tokens server-side; give the browser\nonly an HttpOnly session cookie" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "BFF pattern", desc: "OAuth client role lives on the backend only", code: "Backend holds secret + refresh token;\nbrowser gets a session cookie" },
        { term: "Shared state store", desc: "Multi-instance deploys need Redis, not memory", code: "SET oauth:state:<value> ex=600\nGET/DEL on callback (single-use)" },
        { term: "Proactive token refresh", desc: "Refresh before expiry, not reactively on 401", code: "Refresh at ~80% of access-token lifetime\nAvoid concurrent refresh stampedes" },
        { term: "Minimal scope requests", desc: "Ask for only what the feature needs", code: "drive.file  not  drive\nIncremental consent for later features" },
        { term: "Account linking", desc: "Match by (provider, provider_id) then by email", code: "New OAuth login + existing verified email\n-> link identity, don't duplicate account" },
        { term: "Monitoring essentials", desc: "Login funnel, per-error-code counters, latency", code: "oauth_callback_total{provider,outcome}\noauth_token_exchange_seconds{provider}" },
        { term: "Sign-up gating", desc: "Kill switch checked on both password and OAuth paths", code: "if not signup_enabled and not admin_email:\n    reject" },
        { term: "Managed IdP", desc: "Prefer over hand-rolling an authorization server", code: "Auth0, Okta, Microsoft Entra ID,\nor your cloud provider's IdP" },
        { term: "Related platform skills", desc: "OAuth interlocks with these directly", code: "JWT -- token internals\nCookies & Sessions -- post-login state\nRBAC / ABAC -- authorization inside your app" },
      ],
    },
  ],
};

export default oauth;
