import type { CheatSheetData } from "./types";

const jwt: CheatSheetData = {
  title: "The Ultimate JWT Cheat Sheet",
  subtitle: "Structure · claims · signing · revocation · security · production toolbelt",
  sections: [
    {
      title: "Structure & Encoding",
      color: "violet",
      rows: [
        { term: "Three parts", desc: "header.payload.signature, dot-separated", code: "eyJhbGci...  .  eyJzdWIi...  .  SflKxwR...\nheader        payload        signature" },
        { term: "base64url encoding", desc: "Reversible encoding, NOT encryption — anyone can read it", code: "base64.urlsafe_b64decode(segment + padding)\nno secret required to read header/payload" },
        { term: "Header", desc: "Announces algorithm and token type", code: "{ 'alg': 'HS256', 'typ': 'JWT' }" },
        { term: "Payload", desc: "The claims — statements about the subject", code: "{ 'sub': 'usr-482', 'role': 'editor', 'exp': 1700003600 }" },
        { term: "Signature", desc: "Cryptographic bytes, proves integrity/authenticity only", code: "HMACSHA256(header_b64 + '.' + payload_b64, secret)" },
        { term: "JWS vs JWE", desc: "Signed (readable payload) vs Encrypted (opaque payload)", code: "JWS: 3 parts, ~95% of real usage\nJWE: 5 parts, payload genuinely hidden" },
        { term: "Not encryption", desc: "The #1 misconception", code: "Never put passwords, secrets, or PII\ndirectly in the payload claims" },
      ],
    },
    {
      title: "Claims (Core Objects)",
      color: "blue",
      rows: [
        { term: "iss", desc: "Issuer — who created and signed the token", code: "'iss': 'https://auth.example.com'" },
        { term: "sub", desc: "Subject — who the token is about (user id)", code: "'sub': 'usr-482'" },
        { term: "aud", desc: "Audience — who the token is intended for", code: "'aud': 'https://api.example.com'" },
        { term: "exp", desc: "Expiration — Unix timestamp, MUST be checked", code: "'exp': int(time.time()) + 900   # 15 min" },
        { term: "nbf", desc: "Not-before — token invalid until this time", code: "'nbf': int(time.time())" },
        { term: "iat", desc: "Issued-at — Unix timestamp of creation", code: "'iat': int(time.time())" },
        { term: "jti", desc: "Unique token ID — enables per-token revocation/dedup", code: "'jti': str(uuid.uuid4())" },
        { term: "Custom claims", desc: "App-specific data beyond the registered set", code: "'role': 'editor', 'tenant_id': 'acme-corp'" },
        { term: "Registered vs custom", desc: "Standard vocabulary vs anything your app needs", code: "Registered: iss sub aud exp nbf iat jti\nCustom: role, tenant_id, plan, scope..." },
      ],
    },
    {
      title: "Signing Algorithms",
      color: "emerald",
      rows: [
        { term: "HS256", desc: "Symmetric — one shared secret signs AND verifies", code: "jwt.encode(payload, SECRET, algorithm='HS256')\nAny verifier can also forge tokens" },
        { term: "RS256", desc: "Asymmetric — private key signs, public key verifies", code: "jwt.encode(payload, private_key, algorithm='RS256')\nVerifiers can never forge tokens" },
        { term: "ES256", desc: "Asymmetric ECDSA — smaller/faster than RS256", code: "Same public/private split as RS256\nSmaller keys, cheaper verification" },
        { term: "Choosing HS vs RS/ES", desc: "One issuer + one verifier vs many independent verifiers", code: "Single trusted service: HS256 ok\nMultiple services verify: use RS256/ES256" },
        { term: "PyJWT encode/decode", desc: "Python's standard JWT library", code: "import jwt\ntoken = jwt.encode(claims, SECRET, algorithm='HS256')\nclaims = jwt.decode(token, SECRET, algorithms=['HS256'])" },
        { term: "jsonwebtoken (Node)", desc: "Node's standard JWT library", code: "const jwt = require('jsonwebtoken')\njwt.sign(payload, key, { algorithm: 'RS256', expiresIn: '15m' })\njwt.verify(token, key, { algorithms: ['RS256'] })" },
        { term: "Pin the algorithm", desc: "Golden rule — never trust the token's own alg field", code: "jwt.decode(token, key, algorithms=['RS256'])\n# explicit allow-list, never derived from header" },
        { term: "JWKS", desc: "Published public key set for asymmetric verification", code: "GET /.well-known/jwks.json\n[{ 'kid': '2025-key', 'kty': 'RSA', 'n': '...', 'e': 'AQAB' }]" },
        { term: "Key rotation", desc: "Dual-publish old + new key during transition", code: "1. publish new key alongside old\n2. sign new tokens with new key\n3. retire old key after grace period" },
      ],
    },
    {
      title: "Access / Refresh & Revocation",
      color: "amber",
      rows: [
        { term: "Access token", desc: "Short-lived, sent every request, stateless verify", code: "expiresIn: '5m' to '15m'\nAuthorization: Bearer <access_token>" },
        { term: "Refresh token", desc: "Long-lived, sent only to auth server, revocable", code: "expiresIn: '7d' to '30d'\nstored server-side, checked on refresh" },
        { term: "Cannot revoke a stateless JWT", desc: "Valid until exp — no built-in 'undo'", code: "Signature check alone never consults\nany server-side revocation record" },
        { term: "Mitigation 1: short expiry", desc: "Shrink the exposure window", code: "5-15 min access tokens\nsmallest infra cost, first line of defense" },
        { term: "Mitigation 2: refresh revocation", desc: "Delete/invalidate the refresh token server-side", code: "DELETE FROM refresh_tokens WHERE id = ?\naccess token still valid until natural exp" },
        { term: "Mitigation 3: jti deny-list", desc: "Store revoked token IDs with TTL", code: "redis.setex(f'revoked:{jti}', ttl, 1)\nif redis.exists(f'revoked:{jti}'): reject" },
        { term: "Mitigation 4: token versioning", desc: "Bump a per-user version to invalidate ALL tokens instantly", code: "claims['ver'] = user.token_version\nif claims['ver'] != current_version: reject" },
        { term: "'Logout everywhere'", desc: "One write invalidates every issued token for a user", code: "user.token_version += 1   # done" },
      ],
    },
    {
      title: "Security Pitfalls",
      color: "rose",
      rows: [
        { term: "alg: none attack", desc: "Crafted token claims no signature needed", code: "WRONG: trust alg from token header\nRIGHT: algorithms=['RS256'] explicit allow-list" },
        { term: "Algorithm confusion", desc: "RSA public key misused as HMAC secret", code: "Never accept both RS256 AND HS256\non the same verifier without isolation" },
        { term: "Weak HS256 secret", desc: "Short/guessable secrets are brute-forceable offline", code: "secrets.token_urlsafe(64)  # 256+ bits\nNEVER 'secret123' or a dictionary word" },
        { term: "Missing exp/aud/iss checks", desc: "Signature valid != token meant for you", code: "jwt.decode(token, key, algorithms=['RS256'],\n  audience=AUD, issuer=ISS)  # always pass both" },
        { term: "Sensitive data in payload", desc: "Payload is world-readable, not encrypted", code: "WRONG: {'ssn': '123-45-6789'}\nRIGHT: {'sub': 'usr-482'}  # ids only" },
        { term: "localStorage storage", desc: "XSS-exposed, CSRF-immune", code: "Any page JS can read it if XSS occurs\nNot auto-sent -> no CSRF risk" },
        { term: "httpOnly cookie storage", desc: "XSS-safe, needs CSRF defense", code: "Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict\nAuto-sent cross-site unless SameSite set" },
        { term: "Token in URL/query string", desc: "Leaks via logs and Referer headers", code: "WRONG: /api?token=eyJhbGci...\nRIGHT: Authorization: Bearer <token> header only" },
        { term: "Constant-time compare", desc: "Avoid timing attacks on signature check", code: "hmac.compare_digest(expected, actual)\nnever use == to compare signatures" },
        { term: "Disabled verification options", desc: "Debug flags left on in production", code: "WRONG: options={'verify_exp': False}\nRIGHT: never disable verification in prod" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Clock skew leeway", desc: "Tolerate small drift between machines", code: "jwt.decode(token, key, algorithms=['RS256'], leeway=10)" },
        { term: "PyJWKClient", desc: "Cached JWKS fetch + kid-based key lookup", code: "from jwt import PyJWKClient\nclient = PyJWKClient(jwks_url, cache_keys=True)\nkey = client.get_signing_key_from_jwt(token)" },
        { term: "Verification metrics", desc: "Track failures by reason, not just pass/fail", code: "TOKEN_VERIFY.labels(result='failure', reason='expired').inc()" },
        { term: "Secrets manager", desc: "Never hardcode keys or commit them to git", code: "Load private key / HMAC secret from\nVault, AWS Secrets Manager, etc. at runtime" },
        { term: "Test the attack cases", desc: "Expired, tampered, wrong aud, alg:none — all rejected", code: "def test_alg_none_rejected(): ...\ndef test_tampered_payload_rejected(): ..." },
        { term: "Related platform skills", desc: "Where JWT plugs into the wider auth stack", code: "OAuth 2.0 / OIDC -> issues/consumes JWTs\nCookies & Sessions -> the stateful alternative\nRBAC / ABAC -> consume JWT claims for authz" },
        { term: "Decode without a library (debug only)", desc: "Manual base64url decode for troubleshooting", code: "header_b64, payload_b64, sig_b64 = token.split('.')\njson.loads(b64url_decode(payload_b64))" },
        { term: "Never hand-roll production signing", desc: "Use a battle-tested library", code: "PyJWT / jsonwebtoken / jose\nnot a custom base64+HMAC implementation" },
      ],
    },
  ],
};

export default jwt;
