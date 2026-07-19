import type { CheatSheetData } from "./types";

const csrf: CheatSheetData = {
  title: "The Ultimate CSRF Cheat Sheet",
  subtitle: "Attack mechanics · SameSite · tokens · CORS distinction · production toolbelt",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "CSRF", desc: "Cross-Site Request Forgery — forging a state-changing request using the victim's ambient credentials", code: "Victim logged into bank.example\nAttacker page triggers a request to it\nBrowser auto-attaches the session cookie" },
        { term: "Confused deputy", desc: "General security concept CSRF instantiates — a trusted party is tricked into misusing its authority", code: "Server = the deputy\nIt trusts the request because\na valid session cookie is attached" },
        { term: "Ambient authority", desc: "A credential the browser attaches automatically, without the page having to ask for it", code: "Cookies = ambient (auto-attached)\nAuthorization header = NOT ambient\n(JS must read + attach it itself)" },
        { term: "Same-origin policy", desc: "Browser rule blocking one origin's script from reading another origin's data", code: "https://a.com script CANNOT read\ndocument.cookie or fetch() responses\nfrom https://b.com" },
        { term: "State-changing request", desc: "Any request that creates, updates, or deletes data — the real CSRF target", code: "POST /transfer\nDELETE /account\nPUT /settings" },
        { term: "Safe method", desc: "GET/HEAD/OPTIONS are meant to be read-only, cacheable, pre-fetchable", code: "NEVER: GET /delete-account?id=42\nAlways: DELETE /account/42" },
        { term: "Synchronizer token", desc: "Server-issued, session-bound random value required on every mutation", code: "Server stores/derives token per session\nClient must echo it back\nAttacker can't read or guess it" },
        { term: "Double-submit cookie", desc: "Token set as a cookie AND expected echoed as a header/field; server compares the two", code: "Set-Cookie: csrf_token=abc123\nHeader: X-CSRF-Token: abc123\nServer: values must match" },
        { term: "Login CSRF", desc: "Forcing a victim to log into an attacker-controlled account, not just act within their own", code: "Victim unknowingly saves data into\nan account the attacker owns\nProtect login forms too, not just post-auth" },
      ],
    },
    {
      title: "Attack Mechanics",
      color: "blue",
      rows: [
        { term: "GET CSRF (image tag)", desc: "No JS needed — the browser requests the img src immediately", code: "<img src='https://bank.example/transfer\n?to=attacker&amount=5000' width='0'>" },
        { term: "POST CSRF (auto-submit form)", desc: "Hidden form that submits itself on page load", code: "<form id='f' action='https://bank.example/transfer'\n method='POST'>\n <input type='hidden' name='to' value='x'>\n</form>\n<script>document.getElementById('f').submit()</script>" },
        { term: "Why victim sees nothing", desc: "No alert, no click, no visible UI — the page can look completely blank or unrelated", code: "width='0' height='0' on the img\nor a form styled display:none" },
        { term: "Delivery vectors", desc: "Anywhere a victim's browser loads attacker content while authenticated elsewhere", code: "Malicious ad, phishing link,\nforum post, compromised widget,\ncompromised subdomain" },
        { term: "CSRF + XSS chaining", desc: "XSS lets the attacker read tokens directly, defeating CSRF defenses entirely", code: "XSS = code runs IN your origin\nCan read non-HttpOnly cookies\nand DOM-embedded CSRF tokens" },
        { term: "Bearer-token APIs — why usually safe", desc: "Browser does NOT auto-attach Authorization headers cross-origin", code: "Attacker page can't read victim's\nlocalStorage/memory to steal the\ntoken -- same-origin policy blocks it" },
        { term: "Bearer-token exception", desc: "If the token is also accepted from a cookie somewhere in the stack, risk returns", code: "Audit EVERY place a token can be\nread from -- not just your intended\nAuthorization-header design" },
      ],
    },
    {
      title: "Cookie & SameSite Defenses",
      color: "emerald",
      rows: [
        { term: "SameSite=Strict", desc: "Cookie never sent cross-site, including top-level navigation (clicking a link)", code: "Set-Cookie: session=abc; SameSite=Strict; Secure" },
        { term: "SameSite=Lax", desc: "Sent on cross-site top-level GET nav; withheld on cross-site POST/fetch/XHR/iframe", code: "Set-Cookie: session=abc; SameSite=Lax; Secure\n(modern browser default when unset)" },
        { term: "SameSite=None", desc: "Sent on all cross-site requests; requires Secure. For legitimate embeds/SSO/payments", code: "Set-Cookie: token=abc; SameSite=None; Secure" },
        { term: "Secure attribute", desc: "Cookie only sent over HTTPS — pairs with the TLS & HTTPS skill", code: "Set-Cookie: session=abc; Secure" },
        { term: "HttpOnly attribute", desc: "JavaScript cannot read the cookie — limits blast radius of minor script injection", code: "Set-Cookie: session=abc; HttpOnly; Secure" },
        { term: "SameSite limitation: subdomains", desc: "Subdomains are same-site, not same-origin — a weak subdomain can stage cookie-tossing", code: "attacker.victim.com and victim.com\nshare SameSite eligibility if cookies\nare Domain=.victim.com scoped" },
        { term: "SameSite limitation: legacy clients", desc: "Older browsers/webviews may not enforce SameSite consistently", code: "Never rely on SameSite alone --\npair with a token defense" },
        { term: "Sec-Fetch-Site header", desc: "Browser-set, unspoofable metadata header telling the server the request's origin relationship", code: "Sec-Fetch-Site: cross-site | same-site\n| same-origin | none" },
        { term: "Reject cross-site mutations via Fetch Metadata", desc: "Stateless, browser-verified second layer independent of cookies", code: "if request.headers['sec-fetch-site']\n== 'cross-site' and method != 'GET':\n    reject()" },
      ],
    },
    {
      title: "Token-Based Defenses",
      color: "amber",
      rows: [
        { term: "Django built-in", desc: "CsrfViewMiddleware on by default; template tag embeds the token", code: "{% csrf_token %}\n@csrf_protect  # explicit decorator form" },
        { term: "FastAPI hand-rolled HMAC token", desc: "No built-in middleware -- sign token to a server secret", code: "mac = hmac.new(SECRET, payload.encode(),\n  hashlib.sha256).hexdigest()\ntoken = payload + '.' + mac" },
        { term: "Constant-time comparison", desc: "Never use == for token checks -- avoids a timing side-channel", code: "hmac.compare_digest(got_mac, expected_mac)\n# NOT: got_mac == expected_mac" },
        { term: "Token entropy", desc: "128+ bits from a cryptographically secure source", code: "secrets.token_urlsafe(16)  # good\nrandom.random()             # NEVER" },
        { term: "Signed double-submit fix", desc: "HMAC-bind the cookie value to a server secret so cookie-tossing can't forge it", code: "cookie = nonce + '.' + hmac(nonce, SECRET)\nServer re-derives HMAC, doesn't just\ncompare cookie==header blindly" },
        { term: "Custom header requirement", desc: "Plain HTML forms cannot set arbitrary headers -- a cheap AJAX/JSON API defense", code: "fetch(url, {\n  headers: {'X-CSRF-Token': token}\n})" },
        { term: "Why headers work: CORS preflight", desc: "A cross-origin fetch adding a custom header triggers an OPTIONS preflight the browser enforces", code: "Preflight blocked unless CORS allow-list\nexplicitly permits that origin + header" },
        { term: "Origin header validation", desc: "Sent by browsers on POST/PUT/DELETE and cross-origin requests; reliable secondary signal", code: "if not origin.startswith(ALLOWED):\n    reject()  # fail-closed if absent" },
        { term: "Referer header validation", desc: "Weaker signal -- often stripped by privacy tools or strict Referrer-Policy", code: "Use as SECONDARY signal only,\nnever the sole defense" },
        { term: "Token TTL", desc: "Tie token lifetime to session lifetime, never indefinite", code: "age = now - issued_at\nvalid = 0 <= age <= max_age_seconds" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "CSRF vs CORS misconfiguration", desc: "CSRF = blind write, no response read. CORS misconfig = attacker script READS a cross-origin response", code: "CSRF: img/form, no JS needed\nCORS misconfig: fetch() + credentials\n+ reflected Origin + Allow-Credentials:true" },
        { term: "Reflected-Origin CORS bug (NOT CSRF)", desc: "A different vulnerability class entirely -- tokens do nothing to stop this", code: "# BROKEN:\nresp.headers['Access-Control-Allow-Origin']\n  = request.headers.get('origin')\nresp.headers['Access-Control-Allow-Credentials']\n  = 'true'" },
        { term: "State-changing GET", desc: "The classic mistake -- one img tag is a full exploit, no token check saves you", code: "NEVER: @app.get('/delete-account')\nALWAYS: @app.post('/delete-account')" },
        { term: "Unsigned double-submit weakness", desc: "Subdomain cookie-tossing lets an attacker set a matching cookie themselves", code: "Fix: HMAC-sign the token (see\nToken-Based Defenses section)" },
        { term: "Relying on Referer alone", desc: "Legitimately absent in many cases -- privacy tools, direct navigation, strict policy", code: "Pair with a real token, never\nuse Referer/Origin as the ONLY check" },
        { term: "Undocumented csrf_exempt", desc: "Silent accumulation of holes -- always require a written justification", code: "@csrf_exempt  # WHY? Document it or\n# this becomes a forgotten hole" },
        { term: "XSS defeats every CSRF defense", desc: "Attacker code running same-origin can read tokens and non-HttpOnly cookies directly", code: "Fixing CSRF != fixing XSS\nSee the XSS skill for its own defenses" },
        { term: "Trusting 'on by default'", desc: "Frameworks often exempt API-prefixed or JSON routes by convention -- verify, don't assume", code: "Check your framework version's\nactual exemption list" },
        { term: "Proxy/CDN stripping headers", desc: "Works locally, fails in prod (or reverse) when Origin/Referer/Sec-Fetch-* get dropped", code: "Explicitly configure proxy/CDN to\nforward these headers unmodified" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Django", desc: "CsrfViewMiddleware — on by default in new projects", code: "MIDDLEWARE = [..., 'django.middleware.csrf.\nCsrfViewMiddleware', ...]" },
        { term: "Flask", desc: "No built-in protection -- add Flask-WTF's CSRFProtect", code: "from flask_wtf import CSRFProtect\nCSRFProtect(app)" },
        { term: "FastAPI / Starlette", desc: "No built-in CSRF middleware at all -- hand-roll or use a community package", code: "Depends(require_csrf)  # your own\n# dependency, see Intermediate Concepts" },
        { term: "Rails", desc: "protect_from_forgery is the long-standing controller default", code: "protect_from_forgery with: :exception" },
        { term: "ASP.NET Core", desc: "AntiForgery services + attribute, auto-wired by default templates", code: "[ValidateAntiForgeryToken]" },
        { term: "Testing (positive + negative)", desc: "Prove both that legit requests pass AND forged ones are rejected", code: "assert client.post(url).status_code == 403\n# no token\nassert client.post(url, headers=hdr)\n  .status_code == 200  # valid token" },
        { term: "PoC tooling", desc: "Burp Suite and OWASP ZAP both include CSRF PoC generators for staging tests", code: "Burp: right-click request ->\n'Generate CSRF PoC'" },
        { term: "Monitoring", desc: "Log and alert on rejection spikes, separated by reason", code: "log.warning('csrf_rejected',\n  reason='missing_token', path=path)" },
        { term: "Secrets", desc: "HMAC secret behind signed tokens lives in a vault, never hardcoded", code: "CSRF_SECRET = os.environ['CSRF_SECRET']\n# see the Secrets Management skill" },
      ],
    },
  ],
};

export default csrf;
