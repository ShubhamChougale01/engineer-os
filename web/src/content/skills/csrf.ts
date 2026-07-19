import type { SkillContent } from "../types";

/**
 * CSRF (Cross-Site Request Forgery) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const csrf: SkillContent = {
  overview: `
Cross-Site Request Forgery (CSRF, sometimes "XSRF") is an attack that tricks a victim's browser into sending a request the victim never intended to send, to a site the victim is already authenticated with. The attacker never sees the victim's cookies or session — they don't need to. They just need the victim's browser to fire a request, because browsers automatically attach ambient credentials (cookies, HTTP auth, client certificates) to every request that targets the matching origin, regardless of which page triggered that request.

For an AI engineer building backend APIs, admin dashboards, agent-control-plane UIs, or any authenticated web surface, CSRF is one of the oldest and most misunderstood classes of vulnerability in the OWASP catalog. It matters even more today because so many "internal tools" (model-eval dashboards, feature-flag panels, prompt-management consoles) are quickly wired up with cookie-based sessions and little thought to state-changing GET/POST endpoints — exactly the conditions CSRF thrives on.

Key characteristics: CSRF is a **confused deputy** attack — the server is tricked into misusing its own authority on the attacker's behalf. It requires the victim to be authenticated (or have some ambient credential) with the target site, requires a predictable state-changing endpoint, and requires the victim's browser to visit attacker-controlled content (a malicious page, a poisoned ad, a crafted email). It does NOT require the attacker to read any response — CSRF is a **write** attack, not a **read** attack, which is exactly the property that distinguishes it from CORS misconfiguration and from XSS (see the XSS skill for that critical distinction).

Modern browsers have shipped real platform-level mitigations (SameSite cookies, Fetch Metadata headers), but CSRF has not disappeared — it has just moved to the edges: misconfigured SameSite=None cookies, legacy browsers, subdomain takeovers, and APIs that quietly reintroduce cookie auth "for convenience." Understanding CSRF deeply means understanding exactly which requests are dangerous, why bearer-token APIs are largely immune, and why "add a CSRF token" is a means, not the actual goal — the goal is proving a request reflects genuine user intent.
`,

  history: `
CSRF is one of the oldest classes of web vulnerability, but it was under-named and under-appreciated for years relative to how damaging it is — partly because, unlike XSS or SQL injection, a working CSRF exploit can be a single innocuous-looking HTML tag.

| Year | Milestone |
|------|-----------|
| 1988 | Norm Hardy formally describes the "confused deputy problem" — the general security concept CSRF is a specific web instance of |
| 2000 | Early web application security researchers privately note that image tags and forms can trigger unwanted authenticated actions on other sites |
| 2001 | Peter Watkins posts a widely cited description of the attack (then often called "session riding") to a security mailing list, using a webmail application as the example |
| 2004–2006 | The term "Cross-Site Request Forgery" and the CSRF acronym become standard among security researchers; early advisories hit high-profile sites |
| 2006–2008 | Public, named incidents (Netflix account changes, uTorrent web UI takeover, Gmail filter injection) push CSRF into mainstream security awareness |
| 2007 | OWASP Top 10 (2007 edition) adds CSRF as its own entry for the first time |
| 2008 | Barth, Jackson & Mitchell publish "Robust Defenses for Cross-Site Request Forgery" (ACM CCS) — the paper that formalizes Origin-header checking and token-based defenses academically |
| 2010s | Synchronizer token pattern becomes a default in mainstream frameworks: Django's CsrfViewMiddleware, Rails' protect_from_forgery, Spring Security CSRF filter |
| 2016 | Google engineer Mike West drafts the SameSite cookie attribute as an IETF proposal; Chrome and other browsers begin experimental support |
| 2020 | Chrome ships SameSite=Lax as the default for cookies that don't explicitly declare a SameSite value (widely reported as Chrome 80, February 2020) — arguably the single biggest platform-level dent ever put in CSRF's attack surface |
| 2020s | Fetch Metadata Request Headers (Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest) reach broad browser support, giving servers a second, independent signal for rejecting cross-site state-changing requests |

The throughline: CSRF defense moved from "purely the application's job" (tokens) toward "a shared responsibility between the browser platform and the application" (SameSite + Fetch Metadata + tokens). Verify exact browser rollout versions on caniuse.com — browser version numbers drift and this page's knowledge is current only through its stated cutoff.
`,

  "why-it-exists": `
CSRF exists because of a foundational, otherwise-useful design decision in HTTP and browsers: **cookies are attached to a request based on the target origin, not based on which page or script initiated the request.**

Before any CSRF-specific defenses existed, the web looked like this:

- A browser stores a session cookie after you log into your bank.
- ANY page you visit afterward — including a completely unrelated, malicious one — can cause your browser to send a request to your bank's domain.
- The browser dutifully attaches your bank's cookie to that request, because from the browser's point of view, "this request is going to bank.com, so bank.com's cookie belongs on it" — full stop. The browser has no concept of "but the user didn't mean to do this."
- The bank's server receives a request with a perfectly valid, perfectly authenticated session cookie. It has no way, by design, to know the request didn't originate from the bank's own page.

This is the ambient authority problem: cookies are automatically, silently attached credentials, and "automatically attached" is exactly what makes them convenient for legitimate use (you don't have to re-type your password on every request) and exactly what makes them dangerous for illegitimate use (anyone who can make your browser fire a request gets those credentials attached for free).

CSRF defenses exist to add a piece of information that ambient credentials alone cannot provide: **proof that this specific request reflects the user's actual, present intent on the actual site**, not a forged request smuggled in from somewhere else.
`,

  "problem-it-solves": `
Studying CSRF (as a concept to defend against) removes several concrete production risks:

- **Unauthorized state changes performed as the victim**: money transfers, password/email changes, added admin users, deleted resources, purchased items, changed shipping addresses — all executed with the victim's real session, so the target application's audit log shows "the victim did this," not "an attacker did this."
- **Login CSRF**: forcing a victim's browser to log into an attacker-controlled account (on a site where the attacker knows the login endpoint), so the victim unknowingly saves data (search history, payment details, uploaded files) into an account the attacker fully controls.
- **Silent, zero-click-for-the-victim exploitation**: a single img tag or auto-submitting form is enough; the victim doesn't need to click "yes" to anything malicious-looking, because nothing malicious-looking is ever shown.
- **Bypassing "the user is logged in" as a security boundary**: without CSRF defenses, being logged in is not the same as having consented to a specific action, even though most naive backend code implicitly assumes it is.

What CSRF and its defenses deliberately do **not** solve:

- **XSS**: if an attacker can run JavaScript on your origin, they can read your CSRF tokens directly from the DOM and simply attach them — CSRF protections do not survive XSS. Fixing CSRF is not a substitute for fixing XSS (see the XSS skill).
- **CORS misconfiguration**: CSRF defenses do nothing to stop a badly configured Access-Control-Allow-Origin from letting a malicious origin *read* your API responses. That is an entirely separate vulnerability class — see the dedicated distinction in Advanced Concepts and Security below.
- **Compromised credentials, session fixation, or a stolen session cookie via a physically insecure device.** CSRF is specifically about forged *requests*, not about someone possessing your actual credentials.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, in interview depth, exactly how a CSRF attack works: what the browser does automatically, what the attacker controls, and what the server sees.
2. Explain precisely why CSRF affects cookie/session-based authentication but typically does NOT affect bearer-token APIs (Authorization: Bearer headers) — and articulate the specific exception (a bearer token stored somewhere the browser attaches automatically, like a cookie, reintroduces the risk).
3. Build a working image-tag GET CSRF proof-of-concept and an auto-submitting form POST CSRF proof-of-concept.
4. Implement the synchronizer token pattern in both Django and FastAPI.
5. Implement and critique the double-submit cookie pattern, including the signed/HMAC variant that resists subdomain cookie-tossing attacks.
6. Configure SameSite=Lax/Strict/None correctly, and state its real-world limitations (subdomains, legacy browsers, top-level GET navigations).
7. Defend an AJAX/fetch-based API using custom request headers, and explain why an HTML form alone cannot forge that defense due to CORS preflight rules.
8. Clearly distinguish CSRF from CORS misconfiguration and from XSS in a whiteboard-quality explanation.
9. Design defense-in-depth for a production application: SameSite + tokens + Origin/Referer validation + Fetch Metadata headers, and justify why relying on any single layer is fragile.
10. Write tests that prove a given endpoint is (or is not) vulnerable to CSRF.
`,

  prerequisites: `
- **Required**: how HTTP requests/responses work (methods, headers, status codes), what a cookie is and how the browser sends it, and the basic idea of "the same-origin policy" as a browser security boundary.
- **Helpful**: session-based authentication mechanics (server-side session store vs client-stored session data) — see the **Cookies & Sessions** skill for the full model this page assumes.
- **Helpful**: familiarity with at least one backend web framework (Django, Flask, FastAPI) to follow the worked code examples.
- **For the CORS-vs-CSRF distinction**: a basic mental model of CORS (Access-Control-Allow-Origin, preflight requests) makes Advanced Concepts click faster, though this page explains it from scratch.

Dependency links: **Cookies & Sessions** → this page → **XSS** (the sibling client-side vulnerability) → **OWASP Top 10** (where CSRF sits inside the broader risk catalog) → **Secrets Management** and **TLS & HTTPS** (for the credential-handling and transport layers CSRF defenses sit on top of).
`,

  "beginner-concepts": `
### The confused deputy, in one sentence

A CSRF attack makes a trusted server (the "deputy") perform an action on the attacker's behalf, using authority (the victim's session) the server wrongly assumes reflects the victim's wishes.

### Why cookies are the ingredient that matters

~~~text
Victim's browser cookie jar for bank.com:
  session_id = abc123   (Secure, HttpOnly, no SameSite restriction)

Any tab, any page, any origin that causes the browser to
request https://bank.com/... will have session_id=abc123
attached automatically. The browser does not ask "who
triggered this request?" — only "what is the target origin?"
~~~

This is why authentication with cookies is the ingredient CSRF exploits: the credential is attached by the *browser*, not by the *page that wants to send the request*. Contrast this with a bearer token that a JavaScript app must explicitly read from memory/localStorage and attach itself — covered fully in Intermediate Concepts.

### Classic example 1 — GET-based CSRF with an image tag

If a state-changing action is (badly) implemented as a GET request, the attacker doesn't even need JavaScript:

~~~html
<!-- Hosted on attacker-site.example, visited by a logged-in victim -->
<img src="https://bank.example/transfer?to=attacker&amount=5000" width="0" height="0">
~~~

The browser tries to load this as an image. It doesn't matter that the response isn't a valid image — the GET request was already sent, with the victim's bank.example session cookie attached, before the browser even looks at the response body. If /transfer actually moves money on a GET, the transfer has already happened.

### Classic example 2 — POST-based CSRF with an auto-submitting form

Most real state-changing actions require POST, so the classic exploit is a hidden, auto-submitting HTML form:

~~~html
<!-- Hosted on attacker-site.example -->
<form id="csrf-form" action="https://bank.example/transfer" method="POST">
  <input type="hidden" name="to" value="attacker-account">
  <input type="hidden" name="amount" value="5000">
</form>
<script>
  document.getElementById("csrf-form").submit();
</script>
~~~

The victim only has to load this page (an ad, a phishing link, a compromised forum post) while already logged into bank.example in another tab. No click is required, no JavaScript alert is shown, and the browser happily attaches the bank.example session cookie because the form's action targets bank.example directly.

### Why GET requests should never have side effects

This is the real beginner lesson: HTTP defines GET as a "safe" method — it should be read-only, cacheable, and pre-fetchable. Treating GET as safe-by-convention is a load-bearing assumption across the entire web (browsers prefetch links, proxies cache GETs, crawlers follow them). Any GET endpoint that changes state is a CSRF vulnerability waiting to be found, independent of any token defense.
`,

  "intermediate-concepts": `
### Why bearer-token APIs are largely immune — the key interview nuance

An API secured with Authorization: Bearer TOKEN headers is not vulnerable to classic CSRF, for a precise reason: **the browser does not automatically attach Authorization headers to cross-origin requests the way it attaches cookies.** A JavaScript app must explicitly read the token (from memory or localStorage) and explicitly set the header on every request. An attacker's page has no way to make the victim's browser "know" the token and attach it — the attacker's page cannot read the victim's localStorage (blocked by the same-origin policy) and cannot force the browser to add a header it doesn't already know.

The important exception: if that bearer token is ALSO stored in a cookie and the server reads it from there, you've reintroduced ambient-credential auth and the CSRF risk returns. "Bearer-token API" only means "CSRF-resistant" when the token genuinely lives in a place JavaScript must explicitly attach — not when it's silently cookie-backed. This distinction is one of the most commonly mis-answered questions in security interviews.

### The synchronizer token pattern (the classic, gold-standard defense)

The server generates a random, unpredictable token, ties it to the user's session, and requires the client to send it back on every state-changing request — in the body or a header, NOT in a cookie (because cookies are exactly the ambient credential an attacker can't read but also doesn't need to, since the browser sends it for them).

~~~python
# Django ships this by default via CsrfViewMiddleware — nothing to hand-roll.
# templates/transfer.html
# <form method="post">
#   {% csrf_token %}
#   <input name="to">
#   <input name="amount">
#   <button type="submit">Send</button>
# </form>

# views.py
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse

@csrf_protect
def transfer_money(request):
    if request.method == "POST":
        to = request.POST["to"]
        amount = request.POST["amount"]
        # csrf_protect (and the default middleware) already rejected the
        # request before this line runs if the token was missing or wrong.
        do_transfer(to, amount)
        return HttpResponse("ok")
    return HttpResponse(status=405)
~~~

FastAPI has no built-in CSRF middleware, so a production app implements the synchronizer pattern explicitly, typically as HMAC-signed tokens tied to the session id:

~~~python
import hmac
import hashlib
import os
import secrets
from fastapi import FastAPI, Request, HTTPException, Depends

app = FastAPI()
CSRF_SECRET = os.environ["CSRF_SECRET"].encode()  # from Secrets Management, never hardcoded

def issue_csrf_token(session_id: str) -> str:
    nonce = secrets.token_urlsafe(16)
    payload = session_id + "." + nonce
    mac = hmac.new(CSRF_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return payload + "." + mac

def verify_csrf_token(token: str, session_id: str) -> bool:
    try:
        payload, mac = token.rsplit(".", 1)
        got_session_id, nonce = payload.split(".", 1)
    except ValueError:
        return False
    if not hmac.compare_digest(got_session_id, session_id):
        return False
    expected_mac = hmac.new(CSRF_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(mac, expected_mac)

async def require_csrf(request: Request):
    session_id = request.session["id"]           # from your session layer
    token = request.headers.get("x-csrf-token")
    if not token or not verify_csrf_token(token, session_id):
        raise HTTPException(status_code=403, detail="invalid or missing CSRF token")

@app.post("/transfer")
async def transfer(request: Request, _: None = Depends(require_csrf)):
    body = await request.json()
    do_transfer(body["to"], body["amount"])
    return {"status": "ok"}
~~~

Note hmac.compare_digest for constant-time comparison — a plain equal-to check leaks timing information an attacker could exploit to guess the token byte by byte (see the Hashing and Encryption skills for why constant-time comparison matters generally).

### The double-submit cookie pattern

A stateless alternative: the server sets a random token both as a cookie AND expects the client to also send it as a header or body field. The server just checks the two values match — no server-side token storage required.

~~~text
1. Server sets:  Set-Cookie: csrf_token=RANDOM123; SameSite=Strict; Secure
2. Client JS reads document.cookie, copies RANDOM123 into a custom header
   on every state-changing fetch/XHR request: X-CSRF-Token: RANDOM123
3. Server checks: does the X-CSRF-Token header value equal the csrf_token
   cookie value? If yes, accept; if no or missing, reject.
~~~

Why this works: an attacker's cross-origin page can trigger the browser to SEND the cookie automatically, but the attacker's page cannot READ the cookie's value (the same-origin policy blocks document.cookie access across origins) and therefore cannot construct a matching header. The naive version has a known weakness — see Advanced Concepts for the signed variant that fixes it.

### Custom headers as an AJAX/fetch defense

Requiring any custom header (X-Requested-With, X-CSRF-Token, or any app-specific header) on state-changing requests is itself a strong defense for JSON/AJAX APIs, independent of the header's value: a plain HTML form (the classic CSRF delivery mechanism) cannot set arbitrary custom headers — forms can only send a fixed set of headers via the enctype attribute (application/x-www-form-urlencoded, multipart/form-data, text/plain). A cross-origin fetch() call that tries to add a custom header triggers a CORS preflight (OPTIONS request); unless the target server's CORS policy explicitly allows that origin and that header, the browser blocks the real request from ever being sent. This is why "just require a custom header" is a legitimate, lightweight CSRF defense for JSON APIs — but only because of how CORS preflight behaves, which is a good reason to understand CORS deeply even though CORS itself is a different vulnerability class (see Advanced Concepts).
`,

  "advanced-concepts": `
### SameSite cookies — the modern default-on defense, and its real limits

The SameSite cookie attribute tells the browser when to attach a cookie on a cross-site request:

- **SameSite=Strict**: the cookie is never sent on any cross-site request, including top-level navigations (clicking a link from another site to yours). Strongest, but breaks flows like "click an email link and land already logged in."
- **SameSite=Lax**: the cookie IS sent on top-level GET navigations (clicking a link) but NOT on cross-site subresource requests, form POSTs, fetch/XHR, or iframes. This is the modern browser default for cookies that don't set SameSite explicitly.
- **SameSite=None**: the cookie is sent on all cross-site requests, cookie behaves as it always did pre-SameSite. Requires the Secure attribute (HTTPS only) in modern browsers.

Why SameSite=Lax is not a full solution by itself:

1. **It still allows cross-site top-level GET.** If a state-changing action is ever reachable by GET (the beginner anti-pattern above), Lax does not stop it.
2. **Subdomains are same-site, not same-origin.** attacker.victim.com and victim.com share SameSite eligibility. A single vulnerable subdomain (an old marketing microsite, a misconfigured staging environment) can be used to stage attacks against the main app if cookies are scoped broadly (Domain=.victim.com).
3. **Legacy and non-browser clients** (older mobile webviews, some embedded browsers) may not enforce SameSite at all, or enforce it inconsistently.
4. **Explicit SameSite=None cookies** (often required for legitimate third-party embedding/payment flows) opt back out of this protection entirely and must rely on other defenses.
5. **It's a mitigation, not a specification-level guarantee across every user agent** — defense in depth (tokens + SameSite) remains the professional standard, not SameSite alone.

### Origin and Referer header validation

The Origin header (sent on POST/PUT/DELETE and cross-origin requests) and the Referer header (sent on most navigations, sometimes stripped) both tell the server where a request came from. A server can reject any state-changing request whose Origin/Referer doesn't match its own expected origin.

~~~python
ALLOWED_ORIGINS = {"https://app.example.com"}

def validate_origin(request) -> bool:
    origin = request.headers.get("origin") or request.headers.get("referer")
    if origin is None:
        # Some legitimate same-origin requests can lack both headers
        # (older browsers, some proxies) — decide fail-open vs fail-closed
        # deliberately; most security-sensitive endpoints should fail-closed.
        return False
    return any(origin.startswith(allowed) for allowed in ALLOWED_ORIGINS)
~~~

Pitfalls: Referer is stripped by privacy tools, some corporate proxies, and by the Referrer-Policy header itself when navigating from HTTPS to a page that sets a strict policy; it is also simply absent on some direct requests. Origin is more reliable (browsers add it deliberately for this purpose) but is still just one signal — use it as a layer, not the only layer.

### Fetch Metadata Request Headers — the emerging browser-native defense

Modern browsers automatically attach Sec-Fetch-Site (same-origin / same-site / cross-site / none), Sec-Fetch-Mode (navigate / cors / no-cors / same-origin), and Sec-Fetch-Dest (document / iframe / image / empty ...) to every request, and these headers cannot be set or spoofed by page JavaScript. A server can reject any state-changing request where Sec-Fetch-Site is cross-site, giving a robust, stateless, browser-verified signal — the direction CSRF defense is heading, though it still requires a fallback for older browsers that don't send these headers.

### CORS misconfiguration is a DIFFERENT vulnerability — do not conflate it with CSRF

This is one of the most frequently confused pairs in web security, and it is worth being extremely precise:

| | CSRF | CORS misconfiguration |
|---|------|------------------------|
| What the attacker gets | The server performs an action (write) | The attacker's script can READ the response of a cross-origin request |
| What's exploited | Browsers auto-attach cookies to requests | The server's Access-Control-Allow-Origin header wrongly trusts the attacker's origin (often by reflecting any Origin) combined with Access-Control-Allow-Credentials: true |
| Does the attacker need JS on their page? | No — an img tag or form is enough | Yes — a fetch/XHR call is required to read the response |
| Defense | SameSite cookies, tokens, Origin checks | Correct, explicit CORS allow-lists; never reflect Origin with credentials enabled |

A concrete broken CORS configuration that turns into a data-theft vulnerability (not a CSRF one):

~~~python
# BROKEN: reflects whatever Origin the browser sends, with credentials allowed
@app.middleware("http")
async def bad_cors(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
~~~

With this in place, attacker-site.example can fetch("https://victim.example/api/me", { credentials: "include" }) from the victim's browser, the browser attaches the victim's cookies (same ambient-credential mechanism CSRF relies on), the server reflects attacker-site.example back as an allowed origin, and — critically different from CSRF — the attacker's JavaScript can now READ the JSON response containing the victim's private data. CSRF tokens do nothing to stop this; the fix is a strict, explicit CORS allow-list. Both bugs share the same root ingredient (ambient cookie credentials attached automatically) but exploit it in opposite directions: CSRF writes blind, CORS misconfiguration reads. See the **OWASP Top 10** skill for how both are catalogued and the **XSS** skill for the third leg of this triangle — a vulnerability that lets an attacker's code run AS the victim's origin, bypassing both defenses simultaneously.

### CSRF and XSS — the other essential distinction

CSRF forges a request using the victim's ambient credentials from an attacker-controlled origin; the attacker's code never touches the victim's origin. XSS runs attacker-supplied script directly inside the victim's origin, in the victim's actual authenticated context. A successful XSS attack can read CSRF tokens straight out of the DOM or cookies (for non-HttpOnly ones) and defeats every CSRF defense described on this page instantly, because the "request" is no longer cross-origin at all — it's same-origin, attacker-authored code. This is why CSRF defenses are necessary but never sufficient: they assume the attacker cannot execute code on your origin. See the **XSS** skill for the full model and defenses.
`,

  "internal-working": `
Step by step, here is what actually happens across a CSRF attack and its mitigation, from the browser's perspective:

~~~mermaid
flowchart TD
    A["Victim logs into bank.example\nBrowser stores session cookie"] --> B["Victim visits attacker-site.example\n(ad, phishing link, forum post)"]
    B --> C["Attacker page contains hidden\nauto-submit form targeting bank.example"]
    C --> D{"Browser evaluates cookie\nattachment rules for the request"}
    D -->|"No SameSite / SameSite=None"| E["Cookie attached automatically\nRequest sent WITH victim's session"]
    D -->|"SameSite=Lax/Strict\n+ this is a cross-site POST"| F["Cookie withheld\nRequest sent WITHOUT session"]
    E --> G{"Server-side defense present?"}
    G -->|"No CSRF token / Origin check"| H["Server executes the action\nas the authenticated victim -- ATTACK SUCCEEDS"]
    G -->|"Synchronizer/double-submit token required"| I["Token missing (attacker cannot read/guess it)\nServer rejects with 403 -- ATTACK BLOCKED"]
    F --> J["Server sees an unauthenticated request\nrejects or treats as anonymous -- ATTACK BLOCKED"]
~~~

The core mechanism at each decision point:

1. **Cookie attachment** happens entirely inside the browser, before any application code runs, based only on the request's target origin and the cookie's SameSite attribute — the attacker cannot influence this decision except by choosing what kind of request to forge (top-level GET navigation vs cross-site POST vs fetch).
2. **Token verification** happens entirely inside the application, after the request arrives. The server must have previously handed the legitimate client a token through a channel the attacker cannot read (the actual page HTML, a same-origin fetch response) — the attacker's forged request has no way to know or guess that value if it is sufficiently random (128+ bits of entropy) and, in the signed double-submit case, is HMAC-bound so it can't simply be re-derived from a cookie the attacker CAN cause to be sent.
3. **Constant-time comparison** (hmac.compare_digest, not ==) matters at the token-check step because naive string comparison in most languages short-circuits on the first mismatched byte, which is a measurable timing difference an attacker could exploit over many requests to reconstruct the token byte-by-byte. See the Hashing skill for the general principle.
`,

  architecture: `
A senior engineer designs CSRF defense at two levels: **where the check happens in the request pipeline**, and **how tokens/config are organized across the codebase**.

### Request pipeline placement

~~~mermaid
flowchart LR
    Client["Browser"] --> Edge["Edge / CDN / WAF\n(can reject obviously\ncross-site POSTs via\nSec-Fetch-Site)"]
    Edge --> MW["App framework CSRF middleware\n(Django CsrfViewMiddleware,\nFlask-WTF, custom FastAPI dependency)"]
    MW -->|"GET / safe methods"| Handler["Route handler\n(no CSRF check needed)"]
    MW -->|"POST/PUT/PATCH/DELETE"| Check{"Token present\nand valid?"}
    Check -->|"yes"| Handler
    Check -->|"no"| Reject["403 Forbidden\n+ structured log entry"]
~~~

The check belongs in shared middleware/dependency layer, never duplicated ad hoc per-handler — a single missed handler is a single missed defense. Safe methods (GET, HEAD, OPTIONS) should never reach the check because they should never be state-changing in the first place (see Beginner Concepts).

### Application layout

~~~text
myservice/
├── src/myservice/
│   ├── security/
│   │   ├── csrf.py            # token issue/verify, HMAC secret loaded from Secrets Management
│   │   └── cors.py             # explicit CORS allow-list, kept deliberately separate from csrf.py
│   ├── api/
│   │   ├── routers/            # route handlers depend on require_csrf() only on mutating routes
│   │   └── middleware.py       # wires csrf + cors + Sec-Fetch-Site checks into the pipeline
│   └── core/config.py          # ALLOWED_ORIGINS, cookie flags (Secure/HttpOnly/SameSite), all env-driven
└── tests/security/
    └── test_csrf.py            # positive AND negative tests (see Testing)
~~~

Keeping csrf.py and cors.py as clearly separate modules is a deliberate architectural statement: they solve different problems (write forgery vs read leakage) and should never share a single "security.py" catch-all that blurs the distinction for the next engineer who touches it.
`,

  "data-flow": `
Trace one attack attempt end-to-end against a properly defended endpoint, and contrast with an undefended one:

~~~mermaid
sequenceDiagram
    participant V as Victim's Browser
    participant A as attacker-site.example
    participant S as bank.example (defended)

    V->>S: GET /login (victim authenticates)
    S-->>V: Set-Cookie: session=abc123; SameSite=Lax; Secure
    Note over V,S: Server also embeds a per-session CSRF token\nin the legitimate transfer form's HTML
    V->>A: Victim navigates to attacker-site.example
    A-->>V: Serves page with hidden auto-submit form\ntargeting https://bank.example/transfer
    V->>S: POST /transfer (cross-site form submit)
    Note over V,S: SameSite=Lax withholds the cookie on this\ncross-site POST -- no session attached
    S-->>V: 401 Unauthorized (no valid session)
    Note over V,S: Even if SameSite were None, the request would\nstill be missing the CSRF token the attacker\ncannot read -- second layer catches it
~~~

The most misunderstood part is that BOTH layers are independent lines of defense, not one belt-and-suspenders redundancy: SameSite protects even endpoints an engineer forgot to add a token to, and tokens protect even cookies an engineer misconfigured as SameSite=None (often required for legitimate embedding scenarios). Removing either layer and assuming "the other one covers it" is how production CSRF vulnerabilities actually happen — a subdomain with a looser cookie policy, or a token-check that was accidentally skipped on one route, is all it takes when only one layer exists.
`,

  "production-usage": `
### Framework defaults teams actually rely on

- **Django**: CsrfViewMiddleware is on by default in new projects; {% csrf_token %} in templates, and the CSRF_COOKIE_SAMESITE / CSRF_COOKIE_SECURE settings should always be explicitly reviewed rather than left at framework defaults for a given Django version.
- **Flask**: no built-in CSRF protection; teams use Flask-WTF's CSRFProtect or flask-seasurf. This is a common source of "we thought Flask had it built in" incidents — verify explicitly.
- **FastAPI**: no built-in CSRF middleware at all (FastAPI/Starlette assume many consumers are bearer-token APIs); production teams either hand-roll the pattern shown in Intermediate Concepts or use a community package (fastapi-csrf-protect), and must make an explicit, documented decision about it.
- **Rails**: protect_from_forgery with: :exception is the long-standing default in generated controllers.
- **ASP.NET Core**: the AntiForgery services and [ValidateAntiForgeryToken] attribute, auto-wired by the default MVC/Razor Pages templates.

### Operational defaults that matter

- Cookies: Secure (HTTPS-only), HttpOnly (unreachable from JavaScript, defeating token-stealing via minor XSS on non-security-critical pages), and an explicit SameSite value — never left unset and never assumed.
- Any endpoint accepting SameSite=None cookies (for legitimate third-party embeds, SSO callbacks, payment iframes) gets extra scrutiny and, ideally, its own tighter Origin allow-list.
- CSRF token TTL is tied to session TTL, not indefinite — a token that outlives its session is a stale credential.
- Reverse proxies and load balancers must be configured to forward the Origin/Referer headers unmodified and must not strip Sec-Fetch-* headers — a surprisingly common way CSRF checks silently break in production only, not in local dev.
`,

  "industry-examples": `
- **Netflix (2006, widely reported)**: a CSRF vulnerability allowed an attacker to change account details (including shipping address on physical DVD accounts) simply by getting a logged-in victim to visit a crafted page — one of the incidents that pushed CSRF into mainstream security awareness.
- **uTorrent (2008, widely reported)**: the web-based control UI for the BitTorrent client accepted state-changing requests without CSRF protection, allowing a malicious webpage to reconfigure the client (including, in some reported variants, directing it to download and run arbitrary torrents) purely because the local web UI trusted any request that reached it.
- **Gmail filter injection (2007, widely reported by security researchers)**: a CSRF flaw in Gmail's filter-creation endpoint allowed an attacker to silently add a mail filter (e.g., forwarding all mail matching a pattern to an attacker address) to a victim's account by having them visit a crafted page while logged in.
- **YouTube (2008, widely reported)**: CSRF issues in account-action endpoints allowed attackers to perform actions like adding videos to a victim's favorites/playlists without consent — a lower-severity but widely cited example of how pervasive the class was even at major platforms.
- **Modern bug bounty programs** (HackerOne/Bugcrowd disclosed reports across many companies) continue to pay out for CSRF findings on state-changing endpoints that lack tokens or rely solely on Referer checking — it remains a live, commonly reported class, not a historical curiosity.

Pattern to notice: every named incident involves a state-changing endpoint (money, email filters, device configuration, favorites) that trusted an authenticated-looking request without proving the request reflected genuine user intent. Treat exact incident details as historically reported and verify specifics via search if citing them professionally — this page's knowledge has a stated cutoff.
`,

  "best-practices": `
1. **Never allow state changes on GET/HEAD/OPTIONS** — this single rule prevents the simplest CSRF variant regardless of any token defense.
2. **Set SameSite explicitly on every cookie** — never rely on browser defaults alone; decide Lax vs Strict per cookie based on its actual purpose.
3. **Use the synchronizer token pattern (or signed double-submit) for every state-changing endpoint**, generated server-side with 128+ bits of entropy.
4. **Bind tokens to the session**, not just to a stateless cookie value, unless using the signed/HMAC double-submit variant specifically designed to be safe without server-side binding.
5. **Compare tokens in constant time** (hmac.compare_digest or equivalent) — never a plain equality check.
6. **Require a custom header on AJAX/JSON APIs** in addition to token validation — it's a cheap, CORS-preflight-enforced extra layer.
7. **Validate Origin (preferred) or Referer as a secondary signal**, never as the sole defense, and fail closed when both are absent on a sensitive endpoint.
8. **Set HttpOnly and Secure on session cookies** so even a minor same-origin script injection elsewhere can't trivially exfiltrate the session cookie itself.
9. **Keep CORS configuration and CSRF configuration in separate modules** — conflating them is how "we handled CSRF" mistakenly becomes "we forgot to lock down CORS."
10. **Log and alert on CSRF validation failures** — a spike is a strong signal of active probing, not just developer error.
11. **Adopt Sec-Fetch-Site checks as an additional, stateless layer** where your minimum supported browser set allows it.
12. **Re-authenticate for the most sensitive actions** (password change, payment method change, adding an admin) regardless of token validity — defense in depth against a valid-but-stale session.
`,

  "anti-patterns": `
### Relying on Referer/Origin alone

~~~python
# WRONG: single point of failure, and both headers can be legitimately absent
def check(request):
    return request.headers.get("referer", "").startswith("https://app.example.com")

# BETTER: Origin/Referer as ONE signal alongside a real token
def check(request, session_id):
    origin_ok = (request.headers.get("origin") or "").startswith("https://app.example.com")
    token_ok = verify_csrf_token(request.headers.get("x-csrf-token", ""), session_id)
    return origin_ok and token_ok
~~~

### State-changing GET endpoints

~~~python
# WRONG: /delete-account?id=42 as a GET is one img tag away from disaster
@app.get("/delete-account")
def delete_account(id: int): ...

# RIGHT: destructive actions require POST/DELETE + CSRF token
@app.post("/delete-account")
def delete_account(id: int, _: None = Depends(require_csrf)): ...
~~~

### Unsigned double-submit cookies on a domain with any subdomain vulnerability

If cookies are scoped Domain=.example.com and any subdomain can be tricked into setting a cookie (a classic "cookie tossing" scenario via a vulnerable subdomain or an old, forgotten service), an attacker can set their OWN csrf_token cookie value on the victim's browser for the whole domain, then simply send that same value as the header — defeating naive double-submit entirely. The fix is the HMAC-signed variant shown in Intermediate Concepts, which ties the token to a server-known secret the attacker cannot reproduce.

### Disabling CSRF protection "just for this one endpoint"

~~~python
# WRONG: a single exemption is a single hole; these accumulate silently over time
@csrf_exempt
def webhook_or_internal_tool(request): ...
~~~

Exemptions should be rare, documented with WHY (e.g., "this endpoint is authenticated via a signed webhook secret, not cookies, so CSRF doesn't apply"), and reviewed whenever the endpoint's auth model changes.

### Treating CORS configuration as CSRF protection

Setting a permissive Access-Control-Allow-Origin does nothing to stop CSRF (forms and img tags don't need CORS permission to send a request) and, if combined with Allow-Credentials: true, actively creates the separate data-leakage vulnerability described in Advanced Concepts.
`,

  performance: `
### Measure first

CSRF defenses are cheap relative to almost everything else in a request's lifecycle (database queries, network calls), but they are not free, and a bad implementation can add real latency at scale:

~~~bash
# Profile the request path including middleware, not just the handler
python -m cProfile -s cumulative app.py
py-spy top --pid <pid>   # live sampling in production, near-zero overhead
~~~

### Cost hierarchy of the common defenses

1. **SameSite cookie check** — effectively free; it's evaluated by the browser, costs the server nothing.
2. **Sec-Fetch-Site header check** — a single string comparison; negligible.
3. **Custom header presence check** — negligible; the CORS preflight cost is paid once per browser session per route via caching (Access-Control-Max-Age), not per request.
4. **Double-submit cookie comparison** — one constant-time string compare; negligible even at high request volume.
5. **HMAC-signed double-submit / synchronizer token verification** — one HMAC-SHA256 computation per request, sub-microsecond on modern hardware; the meaningful cost is a session-store lookup if the synchronizer pattern requires fetching the session (which most session-based auth needs anyway, so this is rarely additive).
6. **Origin/Referer validation** — string prefix comparison against a small allow-list; negligible, keep the allow-list small and precompiled rather than re-parsing config per request.

The practical performance lesson: CSRF defenses are essentially never the bottleneck in a real system. If you find yourself optimizing token verification instead of your database queries or LLM API calls, you are optimizing the wrong layer — verify with a profiler before touching this code for performance reasons.
`,

  scalability: `
CSRF defenses need to scale with the rest of a stateless, horizontally-scaled web tier — the key design question is whether the defense requires server-side state.

### Stateless vs stateful token strategies

| Pattern | Server-side state required | Scales horizontally without extra infra? |
|---------|------------------------------|--------------------------------------------|
| SameSite cookies | None — pure browser behavior | Yes, trivially |
| Sec-Fetch-Site check | None | Yes, trivially |
| Signed (HMAC) double-submit cookie | None — secret is shared config, not per-user state | Yes — any app server with the shared HMAC secret can verify any token |
| Synchronizer token (classic) | Yes — token tied to session, session must be readable by whichever app server handles the request | Requires a shared session store (Redis/Postgres) reachable by every instance — see the Cookies & Sessions skill |

### Practical guidance

- If your session layer is already centralized (Redis-backed sessions across all app instances, which most production systems need anyway for horizontal scaling), the classic synchronizer token adds no new scaling requirement — it rides on infrastructure you already have.
- If you want to avoid any shared session dependency for CSRF specifically, the signed double-submit pattern scales to any number of stateless app instances with nothing more than a shared HMAC secret (managed via the Secrets Management skill, rotated periodically).
- At very high request volumes, prefer the cheapest layers (SameSite, Sec-Fetch-Site) to reject obviously cross-site requests at the edge/WAF, before they ever reach an app server that would do the more expensive token verification — a standard "fail fast, fail cheap" scaling pattern.
`,

  security: `
CSRF sits inside a cluster of closely related web vulnerabilities, and the technology-specific attack surface is really about which OTHER weaknesses make CSRF worse or make its defenses ineffective:

1. **XSS defeats every CSRF defense on this page.** If an attacker can execute JavaScript on your origin, they can read the CSRF token from the DOM or a non-HttpOnly cookie and attach it correctly. Fixing XSS is a prerequisite for CSRF defenses to mean anything — see the **XSS** skill.
2. **Session fixation combined with CSRF** can let an attacker pre-seed a known session id, then use CSRF to perform actions once the victim authenticates into that session — another reason session ids should be rotated on login, not reused.
3. **Weak token generation** (predictable, low-entropy, or reused tokens) collapses the synchronizer/double-submit pattern to no protection at all — use a cryptographically secure random source (Python's secrets module, never random) for at least 128 bits of entropy.
4. **Clickjacking can be layered with CSRF** to trick a victim into actually clicking a submit button inside an invisible iframe rather than relying purely on an auto-submit script — mitigated by X-Frame-Options / Content-Security-Policy frame-ancestors, a related but distinct defense.
5. **CORS misconfiguration is not CSRF and is not fixed by CSRF tokens** — see Advanced Concepts for the full distinction; treat it as its own item on any security review checklist.
6. **Login CSRF** deserves explicit protection too — even unauthenticated login forms should carry CSRF tokens, or an attacker can force a victim to authenticate into an attacker-owned account.
7. **Transport security is a prerequisite, not a substitute**: tokens and cookies sent over plain HTTP can be intercepted or stripped by a network attacker regardless of CSRF defenses — see the **TLS & HTTPS** skill.

See the **OWASP Top 10** skill for how CSRF is currently catalogued relative to broken access control and other categories, and the **Secrets Management** skill for how the HMAC secret behind signed tokens should be stored, rotated, and never hardcoded.
`,

  testing: `
CSRF protection needs both a positive test (legitimate requests still work) and a negative test (forged requests are rejected) — testing only the happy path is a common way teams ship broken protection unknowingly.

~~~python
# tests/security/test_csrf.py
import pytest
from starlette.testclient import TestClient
from myservice.main import app

client = TestClient(app)

def test_transfer_rejected_without_csrf_token():
    # Simulates a forged request: authenticated session, no token
    resp = client.post(
        "/transfer",
        json={"to": "attacker", "amount": 5000},
        cookies={"session": "valid-victim-session"},
    )
    assert resp.status_code == 403

def test_transfer_rejected_with_wrong_csrf_token():
    resp = client.post(
        "/transfer",
        json={"to": "attacker", "amount": 5000},
        cookies={"session": "valid-victim-session"},
        headers={"x-csrf-token": "guessed-or-forged-value"},
    )
    assert resp.status_code == 403

def test_transfer_succeeds_with_valid_csrf_token():
    token = issue_token_for_test_session("valid-victim-session")
    resp = client.post(
        "/transfer",
        json={"to": "friend", "amount": 10},
        cookies={"session": "valid-victim-session"},
        headers={"x-csrf-token": token},
    )
    assert resp.status_code == 200

def test_get_endpoints_never_mutate_state():
    """A GET should never change data -- the single cheapest CSRF prevention."""
    before = get_account_balance("test-account")
    client.get("/transfer?to=x&amount=1")
    after = get_account_balance("test-account")
    assert before == after
~~~

### Senior testing doctrine

- Automate a CSRF PoC generator check in CI for critical endpoints (Burp Suite and OWASP ZAP both include CSRF PoC generation tooling you can script against a staging environment).
- Test SameSite behavior with an actual cross-site request in an integration/E2E environment, not just unit tests — cookie attachment rules are enforced by the browser, and a unit test that constructs requests manually can silently skip this behavior entirely.
- Include a negative test for every new state-changing endpoint as a PR checklist item, not an afterthought — CSRF regressions are usually introduced by a new endpoint that forgot the dependency/decorator, not by breaking an existing one.
`,

  debugging: `
### The toolbox, in escalation order

1. **Reproduce with a minimal HTML file** — an auto-submitting form or an img tag saved locally and opened in a browser is the fastest way to confirm whether an endpoint is actually exploitable, independent of any tooling.
2. **Check the actual request in browser DevTools (Network tab)** — confirm whether the session cookie was attached at all (SameSite may have already blocked it) before assuming the token check is what failed.
3. **Read the exact rejection reason from the server**, not just the status code — "CSRF token missing" and "CSRF token invalid" and "session not found" are different bugs with different fixes; make sure your middleware logs which one occurred.
4. **Test locally across ports/subdomains deliberately** — localhost:3000 talking to localhost:8000 is treated as cross-site by SameSite=Strict/Lax in some browser configurations, a very common "works in prod, fails in dev" (or the reverse) confusion.
5. **Check whether a reverse proxy stripped the Origin, Referer, or Sec-Fetch-* headers** — inspect what the app server actually receives versus what the browser sent, since proxies and CDNs sometimes normalize or drop headers by default.
6. **Use Burp Suite's or OWASP ZAP's CSRF PoC generator** against a staging environment for a systematic, repeatable proof — useful for both confirming a fix and demonstrating a finding to a team.

### Debugging SameSite specifically

- "It works in Chrome but not Safari" (or vice versa) → different browsers rolled out SameSite defaults and Intelligent Tracking Prevention-style restrictions on different timelines; verify current behavior per browser rather than assuming uniformity.
- "Cookie missing on a legitimate cross-site embed" → check whether SameSite=None + Secure is actually required and set for that specific legitimate use case (payment iframes, SSO), separate from your main session cookie's policy.
`,

  monitoring: `
Production visibility for CSRF rests on tracking rejections, not just successes:

~~~python
import structlog

log = structlog.get_logger()

def reject_csrf(request, reason: str):
    log.warning(
        "csrf_rejected",
        reason=reason,                       # "missing_token" | "invalid_token" | "bad_origin"
        path=request.url.path,
        origin=request.headers.get("origin"),
        referer=request.headers.get("referer"),
        ip=request.client.host,
    )
~~~

### What to measure

- **Rate of CSRF rejections per endpoint** — a sudden spike on one endpoint is a strong signal of active probing or an automated attack tool sweeping your app; alert on deviation from baseline, not on a fixed absolute count.
- **Rate of rejections by reason** — a spike in "missing_token" after a frontend deploy often means a client-side regression (the frontend stopped sending the header), not an attack; distinguishing this from real attack traffic saves incident-response time.
- **SameSite-driven cookie absence** — if your load balancer or CDN can report cookie presence, a sudden drop in session-cookie attachment rate can indicate a browser rollout change (a new SameSite default) breaking legitimate cross-site flows you rely on (SSO redirects, payment callbacks) — worth its own dashboard panel given how often browser vendors change these defaults.
- **CORS preflight failure rate** as a related-but-separate metric, so the two vulnerability classes don't get conflated in your dashboards either.
`,

  deployment: `
### Cookie and header configuration checklist for deployment

~~~text
Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax; Path=/
Set-Cookie: csrf_token=<value>; Secure; SameSite=Strict; Path=/
~~~

- **Secure**: never send either cookie over plain HTTP — pairs with the TLS & HTTPS skill's guidance on enforcing HTTPS everywhere.
- **HttpOnly on the session cookie**: JavaScript cannot read it, limiting the blast radius of a minor script injection elsewhere on the page.
- **SameSite=Strict on the CSRF cookie specifically** (in the double-submit pattern) is often stricter than the session cookie's own SameSite setting, since the CSRF cookie has no legitimate reason to ever be sent cross-site.
- **Reverse proxy / CDN configuration**: explicitly verify that Origin, Referer, and Sec-Fetch-* headers pass through unmodified to the app server — some default CDN configurations strip or normalize headers in ways that silently break these checks only in production.

### CI/CD gate

lint/typecheck → unit tests including the negative CSRF tests from Testing → an automated CSRF PoC check against a staging deploy (scripted Burp/ZAP scan or a custom script posting the classic auto-submit-form PoC) → deploy. Treat a failing CSRF PoC check as a release blocker, the same severity class as a failing SQL injection scan — see the **OWASP Top 10** skill for how this fits a broader security gate.
`,

  "production-checklist": `
- [ ] No state-changing endpoint is reachable via GET/HEAD/OPTIONS
- [ ] Every state-changing endpoint requires a valid CSRF token (synchronizer or signed double-submit)
- [ ] Token comparison uses a constant-time function (hmac.compare_digest or equivalent)
- [ ] Session and CSRF cookies both set Secure and an explicit SameSite value
- [ ] Session cookie sets HttpOnly
- [ ] Login endpoints are also protected against login CSRF, not just post-login endpoints
- [ ] CORS allow-list is explicit and never reflects arbitrary Origin values when credentials are allowed
- [ ] Origin/Referer validated as a secondary signal on sensitive endpoints, fail-closed when both are absent
- [ ] Reverse proxy/CDN verified to pass through Origin, Referer, and Sec-Fetch-* headers unmodified
- [ ] CSRF token entropy is 128+ bits from a cryptographically secure source
- [ ] HMAC secret for signed tokens is stored via the platform's secrets manager, not hardcoded or committed
- [ ] Automated negative tests exist for every mutating endpoint (forged/missing token rejected)
- [ ] Monitoring/alerting exists for CSRF rejection spikes, separated by rejection reason
- [ ] Most sensitive actions (payment method, password, admin changes) require re-authentication regardless of token validity
- [ ] Team has a documented, reviewed list of any csrf-exempt endpoints with justification for each
- [ ] Security review confirms CSRF and CORS configurations are handled in separate, clearly named modules
`,

  "common-mistakes": `
1. **Assuming SameSite=Lax alone is a complete fix** — it doesn't stop cross-site fetch/XHR POSTs to non-Lax-friendly methods in every scenario, doesn't cover subdomains as strictly as engineers assume, and doesn't help at all once a cookie is explicitly set to SameSite=None for a legitimate use case elsewhere in the app.
2. **Confusing CORS configuration with CSRF protection** — a permissive CORS policy does nothing to stop a form-based CSRF attack, and can itself introduce the separate data-leakage vulnerability described in Advanced Concepts.
3. **Using plain string equality instead of constant-time comparison** for token verification — a subtle timing side-channel that's easy to introduce and easy to miss in code review.
4. **Storing the CSRF token in a cookie without pairing it with anything else** (unsigned double-submit) on a domain where subdomain cookie-tossing is possible — silently defeats the whole pattern.
5. **Leaving a state-changing action reachable by GET** "just for this one debug/admin route" — the single most common way a CSRF finding shows up in a bug bounty report.
6. **Exempting an endpoint from CSRF checks without documenting why**, so future engineers can't tell if the exemption is still valid after the endpoint's auth model changes.
7. **Trusting Referer alone**, not accounting for it being legitimately absent (privacy tools, strict Referrer-Policy, direct navigation) and rejecting or accepting incorrectly as a result.
8. **Forgetting login CSRF** — protecting every authenticated endpoint but leaving the login form itself unprotected.
9. **Assuming a bearer-token API is automatically safe** without verifying the token isn't also accepted from a cookie somewhere in the auth stack (a common regression when adding "remember me" cookie convenience features later).
10. **Not testing SameSite behavior with a real cross-origin browser request**, relying only on unit tests that construct requests manually and never actually exercise browser cookie-attachment rules.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| 403 Forbidden / "CSRF verification failed" (Django) | Token missing from form, cookie/session mismatch, or Origin didn't match expected values | Confirm {% csrf_token %} present in template; check CSRF_TRUSTED_ORIGINS setting for cross-subdomain setups |
| "CSRF token missing or incorrect" on an AJAX POST | Frontend forgot to read the token and attach it as a header before a fetch/XHR call | Add the token to a shared fetch wrapper/interceptor so every mutating call includes it automatically |
| Session cookie absent on a legitimate cross-site redirect (SSO, payment callback) | SameSite=Lax/Strict blocking a flow that legitimately needs SameSite=None | Set SameSite=None; Secure specifically for that cookie/flow, keep the main session cookie stricter |
| Works locally, fails in production (or the reverse) for CSRF checks | Reverse proxy/CDN stripping Origin/Referer/Sec-Fetch-* headers in one environment but not the other | Explicitly configure the proxy/CDN to forward these headers; verify with a raw request inspection tool |
| Intermittent CSRF failures under load | Token tied to a session store that isn't consistently reachable from every app instance (session store not shared/centralized) | Move to a centralized session store (Redis) or switch to the signed double-submit pattern which needs no shared session state |
| CSRF check passes but data was still modified maliciously | The actual vulnerability was XSS, not CSRF — the attacker's script ran same-origin and read the token legitimately | Fix the XSS; a valid token from a compromised origin is not evidence of a CSRF miss (see the XSS skill) |
| Cross-origin fetch blocked before your CSRF check even runs | This is a CORS preflight failure, a different mechanism entirely | Review your CORS allow-list; don't debug it as if it were a CSRF configuration issue |
`,

  faqs: `
**Q: If I use JWTs in an Authorization header instead of cookies, am I fully immune to CSRF?**
For classic CSRF, yes — the browser won't attach an Authorization header on its own, so an attacker's forged request arrives with no credential at all. You are only re-exposed if that same JWT is ALSO accepted from a cookie somewhere in your auth stack, which some apps do for convenience (e.g., server-rendered pages reading a JWT cookie). Audit every place a token could be read from, not just your intended design.

**Q: Do I still need CSRF tokens if I've set SameSite=Strict on my session cookie?**
Professionally, yes, as defense in depth — SameSite is a strong browser-side mitigation but has real limitations (subdomains, legacy clients, any cookie you're forced to set SameSite=None elsewhere) covered in Advanced Concepts. Relying on a single layer is fragile against edge cases you may not have anticipated.

**Q: Is CSRF the same thing as CORS misconfiguration?**
No — see the dedicated comparison in Advanced Concepts. CSRF is a forged write with no response reading required; CORS misconfiguration is unauthorized reading of a cross-origin response. They share the ambient-cookie ingredient but exploit it in opposite directions.

**Q: Can HTTPS alone prevent CSRF?**
No. HTTPS protects data in transit (see the TLS & HTTPS skill) but does nothing about the browser's cookie-attachment behavior — an attacker's page served over HTTPS can forge a request to your HTTPS site just as easily as over HTTP.

**Q: Why does my form-based CSRF PoC fail against a JSON API?**
Because a plain HTML form cannot set the Content-Type: application/json header or arbitrary custom headers — many JSON APIs are incidentally protected simply because forms can't construct the exact request they expect. This is a real, valid defense (see Custom Headers in Intermediate Concepts), but confirm it deliberately rather than assuming it, since some browsers/edge cases and certain enctype tricks can still produce simple-request-compatible payloads in specific configurations.

**Q: My framework says CSRF protection is "on by default" — can I trust that?**
Verify it applies to every route you think it does (some frameworks exempt API-prefixed routes, JSON endpoints, or anything marked as an API view by convention), and verify the actual version/config in your codebase rather than assuming defaults haven't changed across a framework upgrade.

**Q: Does rate limiting help against CSRF?**
Not directly — a single forged request can be enough to cause damage (one money transfer, one filter added). Rate limiting helps against brute-force token guessing but is not a substitute for token validation itself.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is CSRF in one sentence?* An attack that tricks a victim's authenticated browser into sending a state-changing request to a site the attacker doesn't control content on, relying on the browser automatically attaching cookies.
2. *Give a simple example of a CSRF attack.* A hidden auto-submitting HTML form on an attacker's page that POSTs to a bank's transfer endpoint while the victim is logged into the bank in another tab; the browser attaches the bank's session cookie automatically.
3. *Why shouldn't GET requests change data?* GET is meant to be a "safe" method that's cacheable and pre-fetchable; if it changes state, a single img tag becomes a working CSRF exploit with no JavaScript needed at all.
4. *What is the synchronizer token pattern?* The server issues a random, session-bound token embedded in legitimate forms/requests; the server rejects any state-changing request missing a matching token, because an attacker's forged request has no way to know that value.
5. *What does SameSite=Lax actually do?* Withholds the cookie on cross-site subresource requests, form POSTs, and fetch/XHR calls, but still attaches it on top-level cross-site GET navigations (like clicking a link) — a nuance interviewers specifically probe for.

**Senior:**

6. *Why doesn't CSRF typically affect a bearer-token API?* Because the browser doesn't automatically attach Authorization headers cross-origin the way it attaches cookies — a JavaScript app must explicitly read and attach the token, and an attacker's page can't read another origin's storage to get it. Strong answers add the exception: if the token is also accepted from a cookie, the risk returns.
7. *Distinguish CSRF from CORS misconfiguration precisely.* CSRF is a blind write exploiting automatic cookie attachment with no response-reading required; CORS misconfiguration (reflecting Origin with credentials enabled) lets an attacker's script actually READ a cross-origin authenticated response. Different exploitation direction, different fix (tokens/SameSite vs a strict CORS allow-list).
8. *How does the double-submit cookie pattern work, and what's its known weakness?* Server sets a random value as both a cookie and expects it echoed in a header; server just compares them, no server-side state needed. Weakness: if an attacker can set their own cookie for the domain (subdomain cookie-tossing), naive double-submit is defeated — fixed by HMAC-signing the token to a server-known secret.
9. *Why is XSS worse than CSRF from a defense perspective?* A successful XSS attack runs code in the victim's own origin, letting it read CSRF tokens and non-HttpOnly cookies directly, defeating every CSRF defense at once — CSRF defenses assume the attacker can't execute code on your origin, an assumption XSS breaks.
10. *Design CSRF defense in depth for a payment API.* SameSite=Strict/Lax on session and CSRF cookies, HMAC-signed synchronizer tokens on every mutating call, Origin/Sec-Fetch-Site validation as a secondary signal, re-authentication (step-up auth) for the payment action itself regardless of token validity, and monitoring/alerting on rejection spikes.
11. *When would you accept SameSite=None cookies, and how do you compensate?* Legitimate third-party embedding or cross-site SSO/payment callback flows; compensate with mandatory Secure, stricter token validation on that specific flow, and a narrower Origin allow-list than the rest of the app.
12. *A pentest reports CSRF on a JSON API that requires a custom header. Is it a false positive?* Usually yes, if achieving that exact request truly requires JavaScript with CORS permission the attacker doesn't have — but verify the report isn't describing a bypass (e.g., a simple-request-compatible Content-Type trick, or a CORS misconfiguration granting the attacker origin permission) before dismissing it.
`,

  "coding-questions": `
### 1. Implement HMAC-signed double-submit CSRF middleware (tests HMAC + constant-time comparison + framework middleware thinking)

~~~python
import hmac
import hashlib
import secrets
import time

SECRET = b"replace-with-32-plus-random-bytes-from-secrets-manager"

def issue_token() -> str:
    nonce = secrets.token_urlsafe(16)
    timestamp = str(int(time.time()))
    payload = nonce + "." + timestamp
    mac = hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return payload + "." + mac

def verify_token(token: str, max_age_seconds: int = 3600) -> bool:
    try:
        nonce, timestamp, mac = token.split(".")
    except ValueError:
        return False
    payload = nonce + "." + timestamp
    expected_mac = hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(mac, expected_mac):
        return False
    age = int(time.time()) - int(timestamp)
    return 0 <= age <= max_age_seconds

class CsrfMiddleware:
    """WSGI-style middleware sketch: reject unsafe methods without a valid,
    matching cookie + header pair. Production considerations: constant-time
    comparison (above), token expiry (above), and fail-closed on any
    malformed input rather than raising an unhandled exception."""
    SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        method = environ.get("REQUEST_METHOD", "GET")
        if method in self.SAFE_METHODS:
            return self.app(environ, start_response)
        cookie_token = get_cookie(environ, "csrf_token")
        header_token = environ.get("HTTP_X_CSRF_TOKEN")
        if not cookie_token or not header_token:
            return reject_403(start_response, "missing_token")
        if not hmac.compare_digest(cookie_token, header_token):
            return reject_403(start_response, "mismatched_token")
        if not verify_token(cookie_token):
            return reject_403(start_response, "invalid_or_expired_token")
        return self.app(environ, start_response)
~~~

Complexity: O(1) per request. Follow-ups: how would you rotate SECRET without invalidating every in-flight token (answer: support verifying against a small list of recent secrets, sign new tokens only with the current one); how would you support token expiry across clock skew in a distributed system (answer: use a monotonic, centrally-issued timestamp source or accept small skew tolerance).

### 2. Write a function that detects an obviously CSRF-vulnerable route definition (tests static-analysis thinking)

~~~python
import ast

def find_unsafe_get_mutations(source_code: str) -> list[str]:
    """Flag GET route handlers whose body calls anything matching a
    mutation-like name (naive heuristic, meant for a lint check, not a
    substitute for manual review)."""
    tree = ast.parse(source_code)
    mutation_hints = {"save", "delete", "update", "create", "transfer"}
    findings = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            is_get_route = any(
                isinstance(dec, ast.Call)
                and getattr(dec.func, "attr", "") == "get"
                for dec in node.decorator_list
            )
            if not is_get_route:
                continue
            for inner in ast.walk(node):
                if isinstance(inner, ast.Call) and isinstance(inner.func, ast.Attribute):
                    if inner.func.attr in mutation_hints:
                        findings.append(node.name)
                        break
    return findings

# Production consideration: this is a lint heuristic, not ground truth --
# false positives/negatives are expected; pair it with the runtime negative
# tests from the Testing section for real assurance.
~~~

Complexity: O(n) over the AST nodes. Follow-up: extend it to also flag @csrf_exempt decorators without an adjacent comment explaining why (encourages the documented-exemption best practice).

### 3. Given a request, decide whether it's cross-site under SameSite=Lax semantics (tests deep understanding of the spec, not just tool usage)

~~~python
def is_blocked_by_samesite_lax(method: str, is_cross_site: bool, is_top_level_navigation: bool) -> bool:
    """Returns True if SameSite=Lax would withhold the cookie for this request."""
    if not is_cross_site:
        return False
    if method == "GET" and is_top_level_navigation:
        return False  # Lax explicitly allows this case (e.g. clicking a link)
    return True        # cross-site POST, cross-site fetch/XHR, cross-site iframe subresource, etc.

assert is_blocked_by_samesite_lax("POST", is_cross_site=True, is_top_level_navigation=False) is True
assert is_blocked_by_samesite_lax("GET", is_cross_site=True, is_top_level_navigation=True) is False
assert is_blocked_by_samesite_lax("GET", is_cross_site=True, is_top_level_navigation=False) is True
~~~

Follow-up: why does the third assertion matter for a real vulnerability (answer: an image tag or fetch GET embedded as a subresource, not a top-level navigation, is still blocked by Lax — this is exactly why the beginner GET-CSRF example targets a top-level-looking request or, more realistically, why real apps must still avoid state-changing GET entirely rather than relying on this nuance).
`,

  "hands-on-labs": `
### Lab 1 — Build and fire a CSRF PoC against your own toy app (beginner, ~1h)
Stand up a minimal Flask or FastAPI app with an unprotected POST /transfer endpoint and cookie-based session auth. Write a standalone HTML file with an auto-submitting form and confirm the transfer executes when opened in a browser while logged in. Deliverable: a short writeup of what you observed in DevTools' Network tab. Skills: the raw attack mechanics, viscerally.

### Lab 2 — Add synchronizer tokens and prove the PoC now fails (intermediate, ~2h)
Add a token-issue/verify layer to the app from Lab 1 (hand-roll it, don't use a framework's built-in first). Re-run the exact same PoC and confirm it now gets rejected; then write both the positive and negative pytest tests from the Testing section. Deliverable: before/after PoC results plus passing tests. Skills: synchronizer token pattern, constant-time comparison, test-driven security.

### Lab 3 — Implement and break naive double-submit, then fix it (advanced, ~3h)
Implement the double-submit pattern without HMAC signing. Simulate a subdomain cookie-tossing attack (set a cookie manually via a second local subdomain in your hosts file) and show the naive pattern can be defeated. Then implement the HMAC-signed version and show the same attack now fails. Deliverable: a short report explaining the weakness and the fix. Skills: the exact nuance most engineers get wrong about double-submit.

### Lab 4 — Full defense-in-depth production hardening (production, ~4h)
Take any app from the previous labs and add: explicit SameSite on every cookie, Origin validation middleware, a custom-header requirement on the JSON API surface, structured logging of CSRF rejections with reasons, and a Sec-Fetch-Site check. Load a CORS misconfiguration deliberately (reflect Origin with credentials) and demonstrate — with a separate PoC — that it's a distinct vulnerability your CSRF defenses did nothing to stop. Deliverable: an architecture diagram of your layered defenses plus both PoC reports. Skills: the entire page, end to end, including the CSRF-vs-CORS distinction under your own fingers.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate genuine CSRF/web-security competence to employers:

1. **A reusable CSRF middleware library** — package the HMAC-signed double-submit pattern from this page as a small, well-tested library (for Flask, FastAPI, or Starlette) with configurable token TTL, header name, and cookie flags. Demonstrates: cryptographic correctness (constant-time comparison, real entropy), API design, and test coverage including the subdomain-cookie-tossing edge case.

2. **A CSRF + CORS vulnerability scanner** — a CLI tool that, given a base URL and an authenticated session, probes each discovered endpoint for (a) state-changing GET handlers, (b) missing CSRF tokens on POST/PUT/DELETE, and (c) a reflected-Origin-with-credentials CORS misconfiguration, producing a clear report that explicitly labels each finding as CSRF or CORS. Demonstrates: precise understanding of the distinction this page emphasizes, plus real security-tooling engineering.

3. **A "defense in depth" demo application** — a small but realistic multi-page app (login, profile edit, payment method, admin panel) with every layer from the Production Checklist implemented and documented, plus a companion set of PoC attack pages showing each layer being defeated in isolation (to prove why defense in depth matters) and then blocked once all layers are combined. Demonstrates: end-to-end security engineering judgment, not just one trick.

Each project: tests for both the attack and the defense, a README explaining the threat model, and (for the scanner) a clear ethical-use disclaimer restricting it to systems you own or are authorized to test.
`,

  "case-studies": `
### Netflix account manipulation (widely reported, mid-2000s)
A CSRF vulnerability reportedly allowed attackers to change account details on a logged-in victim's session by getting them to visit a crafted page — no password required, no visible interaction needed. Lesson: authentication (being logged in) is not the same as authorization for a specific action; every state-changing endpoint needs its own proof of intent, not just a valid session.

### uTorrent web UI takeover (widely reported, 2008)
The local web-based control panel trusted any request that reached it, assuming that "it's on localhost/my LAN" was enough of a security boundary. It wasn't — a malicious webpage visited in any browser tab could still reach the local web UI's endpoints. Lesson: CSRF doesn't care whether the target is a public internet service or a local device's web interface; ambient credentials (or, here, ambient trust) are the exploitable ingredient either way.

### Gmail filter injection (widely reported, 2007)
Attackers could silently add a mail-forwarding filter to a victim's account via a crafted page, effectively creating a persistent, invisible eavesdropping channel on all future email — far more damaging than a one-time action because the exploit's effect (silent forwarding) kept paying off long after the initial visit. Lesson: CSRF impact isn't just about the single action performed; consider what a forged "one-time" write can set up for ongoing exploitation.

### The Chrome SameSite=Lax-by-default rollout (industry-wide platform shift, reported around 2020)
Rather than every individual application fixing CSRF one endpoint at a time, a single browser-vendor decision (defaulting cookies without an explicit SameSite attribute to Lax) retroactively hardened a huge swath of the existing web with zero code changes required from most sites. Lesson: the most leveraged security fixes sometimes happen at the platform layer, not the application layer — but also, this rollout broke some legitimate cross-site flows that depended on the old default, illustrating that platform-level security changes carry real migration cost too, a pattern worth remembering when evaluating any sweeping security change.
`,

  comparisons: `
| Dimension | SameSite cookies | Synchronizer token | Signed double-submit cookie | Custom header requirement | Origin/Referer check |
|-----------|-------------------|----------------------|-------------------------------|------------------------------|-------------------------|
| Requires server-side state | No | Yes (session-bound) | No | No (pairs with another check) | No |
| Stops cross-site top-level GET navigation | Partially (Lax allows it) | Yes | Yes | N/A (not form-deliverable anyway) | Yes |
| Survives subdomain cookie-tossing | No (same-site includes subdomains) | Yes | Yes (HMAC-bound) | Yes | Yes |
| Works on legacy/older browsers | Inconsistent | Yes | Yes | Mostly (depends on CORS enforcement) | Yes |
| Defeated by XSS on your origin | Irrelevant to XSS (cookie itself may leak via non-HttpOnly access) | Yes, if token readable | Yes, if token readable | Yes, if header can be set by injected script | N/A |
| Implementation cost | Low (a header) | Medium (session plumbing) | Low-medium (HMAC + secret mgmt) | Low | Low |
| Best used | As a baseline platform-level layer, always on | Traditional server-rendered apps with sessions | Stateless/horizontally-scaled APIs | JSON/AJAX-only APIs as an extra layer | Secondary signal alongside a token |

**How seniors choose**: never just one. SameSite is the free baseline every cookie should have explicitly set. A token-based defense (synchronizer if you already have centralized sessions, signed double-submit if you want statelessness) is the primary layer for anything state-changing. Custom-header requirements and Origin/Referer checks are cheap secondary signals layered on top. The only wrong answer is picking exactly one and calling it done.
`,

  "related-technologies": `
- **Cookies & Sessions** — the ambient-credential mechanism CSRF exploits; understand this skill first for the SameSite/HttpOnly/Secure attribute model in full.
- **XSS** — the sibling client-side vulnerability that, once achieved, defeats every CSRF defense on this page by running code inside your own origin.
- **OWASP Top 10** — the broader risk catalog CSRF sits inside, alongside broken access control and injection classes; read this for how CSRF is currently weighted relative to other risks.
- **SQL Injection** — a different injection-class vulnerability entirely, but frequently discussed alongside CSRF as one of the "classic" web vulnerability trio in interviews and the OWASP catalog.
- **Encryption** and **Hashing** — the HMAC signing used in the signed double-submit pattern and the constant-time comparison discipline both draw directly on these skills.
- **TLS & HTTPS** — the transport-layer prerequisite that keeps cookies and tokens from being intercepted in transit; CSRF defenses assume this layer is already solid.
- **Secrets Management** — where the HMAC secret behind signed CSRF tokens should actually live: never hardcoded, rotated on a schedule, loaded from a vault or platform secret store.
- **CORS** (as a browser mechanism, not a platform skill on its own here) — essential to understand for both why custom-header defenses work and why CORS misconfiguration is a distinct vulnerability from CSRF.

On this platform, a natural next-page sequence: **Cookies & Sessions** → **CSRF** (this page) → **XSS** → **OWASP Top 10** ties the whole web-security cluster together.
`,

  "latest-updates": `
Verified against my knowledge through my stated training cutoff — verify anything version- or date-specific against caniuse.com, the OWASP CSRF Prevention Cheat Sheet, and current browser release notes before citing exact numbers professionally.

- **SameSite=Lax-by-default** shipped in major browsers (widely reported starting with Chrome around version 80 in early 2020); this remains the single biggest platform-level reduction in CSRF's attack surface to date, though rollout details and exact enforcement edge cases have continued to be refined across subsequent browser releases.
- **Fetch Metadata Request Headers** (Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest) reached broad support across major browsers and are increasingly recommended by security guidance as a robust, spoof-resistant secondary signal for rejecting cross-site state-changing requests, independent of cookie behavior.
- **Third-party cookie deprecation efforts** across major browsers have pushed more legitimate cross-site flows (embeds, some SSO patterns) toward explicit SameSite=None + Secure or toward entirely cookie-less alternatives, indirectly shrinking the population of ambient-credential-bearing cookies that CSRF can exploit in the first place.
- **Framework-level defaults continue to tighten**: most mainstream server-rendered frameworks now ship CSRF protection on by default for new projects, shifting more of the residual risk toward hand-rolled APIs (particularly bearer-token-adjacent designs that quietly reintroduce cookie fallbacks) and legacy codebases that predate these defaults.

Given how much of this area is platform/browser-driven rather than purely application-code-driven, treat any specific version number or rollout date in this section as a starting point for verification, not a citation-grade fact.
`,

  "future-roadmap": `
Where CSRF defense is heading, and what's worth betting career time on:

1. **Fetch Metadata headers becoming a standard, load-bearing defense**, not just a secondary signal — as legacy-browser support for these headers becomes near-universal, expect more frameworks to check Sec-Fetch-Site by default alongside or even instead of hand-rolled tokens for many use cases.
2. **Continued erosion of ambient cookie authority generally**, driven by third-party cookie deprecation and privacy-focused browser features — the broader trend of moving away from silently-attached credentials toward explicitly-attached ones (tokens read and attached by application code) structurally shrinks CSRF's relevance over time, even as it makes other patterns (like careful bearer-token storage) more important to get right.
3. **Tokens won't disappear soon.** Legacy clients, non-browser user agents, embedded webviews, and the sheer scale of existing server-rendered applications mean synchronizer/double-submit tokens remain a practical necessity for years, even as browser-native defenses mature — bet on understanding both layers, not either one exclusively.
4. **CORS misconfiguration will likely become the more commonly exploited half of this pair** as CSRF-specific defenses harden across the platform — expect security tooling and bug bounty findings to increasingly emphasize the CORS-credential-leak class as the "easier" mistake to make in modern JSON-API-first architectures.
5. **Security review checklists converging on defense-in-depth by default** in scaffolding tools and frameworks (SameSite + token + header + Fetch Metadata all wired in from project creation), reducing the odds that any single missed layer becomes exploitable — the direction most mature frameworks are already moving.

For your career: understanding WHY each layer exists and WHAT specifically it does and doesn't cover will outlast any single framework's specific API for implementing it — that conceptual model is what this page has tried to build.
`,

  "cheat-sheet": `
~~~text
--- The core distinction ---
CSRF:  attacker forges a WRITE using the victim's ambient cookies.
       Attacker never reads the response. Form/img-tag deliverable.
XSS:   attacker runs code IN the victim's own origin. Defeats CSRF
       defenses entirely (reads tokens/cookies directly).
CORS misconfig: attacker's script READS a cross-origin authenticated
       response, due to a bad Access-Control-Allow-Origin +
       Allow-Credentials:true. Not stopped by CSRF tokens.

--- Why bearer tokens are usually safe ---
Browser auto-attaches COOKIES cross-origin. It does NOT
auto-attach Authorization headers. JS must read + attach a bearer
token explicitly -- attacker's page can't read another origin's
storage to steal it. EXCEPTION: token also accepted from a cookie.

--- Classic attack shapes ---
GET (img tag):  <img src="https://site/transfer?to=x&amount=5000">
POST (auto-form): hidden <form> + document.getElementById(id).submit()

--- SameSite quick reference ---
Strict: never sent cross-site (breaks "click email link, stay logged in")
Lax:    sent on cross-site TOP-LEVEL GET nav; NOT on cross-site
        POST / fetch / XHR / iframe subresource. Modern browser default.
None:   sent always cross-site; REQUIRES Secure attribute.

--- Synchronizer token pattern (Django, built-in) ---
{% csrf_token %} in template; CsrfViewMiddleware checks it server-side.

--- Signed double-submit (framework-agnostic, stateless) ---
1. Set-Cookie: csrf_token=<random>.<hmac(random, SECRET)>
2. Client echoes same value in X-CSRF-Token header on every mutation
3. Server: hmac.compare_digest(cookie_value, header_value) AND
   re-verify the HMAC against SECRET (defeats cookie-tossing attacks
   that defeat the naive/unsigned version)

--- Custom header defense (JSON/AJAX APIs) ---
Require any custom header (X-CSRF-Token, X-Requested-With, etc).
Plain HTML forms cannot set custom headers. A cross-origin fetch()
that tries to triggers a CORS PREFLIGHT -- blocked unless your CORS
allow-list explicitly permits that origin + header.

--- Origin / Referer check (secondary signal only) ---
if not request.headers.get("origin", "").startswith(YOUR_ORIGIN):
    reject()   # fail-closed if both Origin and Referer are absent
               # on a sensitive endpoint

--- Golden rules ---
1. Never let GET/HEAD/OPTIONS change state.
2. Always set SameSite explicitly on every cookie.
3. Use hmac.compare_digest, never == , for token comparison.
4. Layer defenses -- SameSite + token + header + Origin check.
   Never rely on exactly one.
5. CSRF fixes do NOT fix XSS or CORS misconfiguration. Different
   vulnerabilities, different fixes, review separately.
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does CSRF stand for and what class of bug is it? | Cross-Site Request Forgery; a confused-deputy attack that forges a state-changing write using the victim's ambient credentials |
| Why do cookies enable CSRF but bearer tokens usually don't? | Browsers auto-attach cookies cross-origin; Authorization headers must be explicitly read and attached by JS, which an attacker's page can't do for another origin |
| Classic GET-based CSRF delivery | An img tag pointing at a state-changing GET URL |
| Classic POST-based CSRF delivery | A hidden, auto-submitting HTML form targeting the victim endpoint |
| SameSite=Lax allows what cross-site case specifically? | Top-level GET navigations (e.g. clicking a link) -- not cross-site POST/fetch/XHR/iframe subresources |
| Biggest limitation of SameSite alone | Subdomains are same-site (cookie-tossing risk); legacy clients may not enforce it; SameSite=None opts back out entirely |
| Synchronizer token pattern in one line | Server issues a session-bound random token; rejects mutations missing a matching one |
| Double-submit cookie pattern in one line | Server sets a token as both a cookie and expects it echoed as a header/field; compares the two, no server state needed |
| Known weakness of naive (unsigned) double-submit | Subdomain cookie-tossing lets an attacker set their own matching cookie value |
| Fix for that weakness | HMAC-sign the token to a server-known secret so the attacker can't forge a valid signed value |
| Why does hmac.compare_digest matter over == ? | Constant-time comparison prevents a timing side-channel that could leak the token byte by byte |
| CSRF vs CORS misconfiguration -- core difference | CSRF is a blind write with no response read; CORS misconfig lets the attacker's script READ a cross-origin authenticated response |
| Why does XSS defeat CSRF defenses? | XSS runs code same-origin, letting it read tokens/cookies directly -- CSRF defenses assume the attacker can't execute code on your origin |
| Why should GET never change state? | GET is meant to be safe/cacheable/pre-fetchable; a stateful GET is exploitable with just an img tag, no JS required |
| One browser-native defense beyond SameSite | Fetch Metadata headers (Sec-Fetch-Site) -- can't be set/spoofed by page JavaScript |
`,

  mcqs: `
**1. Which request is NOT blocked by SameSite=Lax on a cross-site cookie?**

A) A cross-site fetch() POST  B) A cross-site top-level GET navigation (clicking a link)  C) A cross-site iframe loading an image subresource  D) A cross-site auto-submitting form POST

**Answer: B** — Lax specifically allows top-level GET navigations; all the others are withheld.

**2. Why is a bearer-token API generally resistant to classic CSRF?**

A) Bearer tokens are encrypted  B) Browsers don't automatically attach Authorization headers cross-origin, so JS must explicitly attach the token  C) Bearer tokens expire faster than cookies  D) CORS blocks all bearer-token requests

**Answer: B** — the defining property is that the browser doesn't attach it for you; an attacker's page has no way to read and re-attach it.

**3. An attacker gets a permissive Access-Control-Allow-Origin (reflecting any Origin) combined with Allow-Credentials: true to work against a victim's browser. What vulnerability class is this?**

A) CSRF  B) SQL injection  C) CORS misconfiguration  D) Clickjacking

**Answer: C** — this lets the attacker's script READ a cross-origin authenticated response, which is the defining property of CORS misconfiguration, not CSRF.

**4. What is the known weakness of the naive (unsigned) double-submit cookie pattern?**

A) It requires too much server memory  B) It's vulnerable if an attacker can set their own matching cookie value via a subdomain (cookie-tossing)  C) It doesn't work over HTTPS  D) It can't be used with JSON APIs

**Answer: B** — fixed by HMAC-signing the token value to a server-known secret.

**5. Why does hmac.compare_digest matter for CSRF token verification instead of a plain == check?**

A) It's faster  B) It avoids a timing side-channel that could let an attacker reconstruct the token byte by byte  C) It's required by the HTTP spec  D) It automatically expires old tokens

**Answer: B** — plain equality typically short-circuits on the first mismatched byte, creating a measurable timing difference.

**6. A pentest report says an endpoint requiring a custom X-CSRF-Token header is still vulnerable to CSRF via a plain HTML form. Most likely explanation?**

A) The report is always wrong — forms can never set custom headers  B) The endpoint likely has a separate flaw, such as accepting the token via a form-compatible field too, or a CORS misconfiguration granting the attacker's origin permission  C) HTML forms can set any header if enctype is set correctly  D) Custom headers are never a valid defense

**Answer: B** — a plain HTML form genuinely cannot set arbitrary custom headers; a real finding here usually points to some other bypass or misconfiguration, not a flaw in the header-requirement concept itself.
`,

  "revision-notes": `
**Core mechanics in a few lines:** CSRF exploits ambient authority — browsers auto-attach cookies to any request targeting the matching origin, regardless of which page triggered it. An attacker's img tag or auto-submitting form causes the victim's browser to send a state-changing request with the victim's real session cookie attached, with no click and no visible interaction required. It's a blind write: the attacker never reads the response, which is exactly what separates it from CORS misconfiguration.

**Why bearer tokens differ:** Authorization headers are not auto-attached by the browser the way cookies are — a JS app must explicitly read and attach them, and an attacker's cross-origin page can't read another origin's storage to steal that value. The exception that reintroduces risk: if that same token is also accepted from a cookie somewhere in the stack.

**The defense stack, in order of how they combine:** SameSite (browser-enforced, free, but incomplete alone — subdomains and legacy clients are gaps) + a token defense (synchronizer if you already run centralized sessions, HMAC-signed double-submit if you want statelessness) + a custom-header requirement for JSON APIs (enforced indirectly via CORS preflight) + Origin/Referer as a secondary signal. None of these alone is sufficient; together they cover each other's gaps.

**The two distinctions that matter most in interviews and in practice:** CSRF vs CORS misconfiguration (blind write vs authenticated read; different root header misconfiguration; different fix) and CSRF vs XSS (forged request from an attacker origin vs attacker code running inside your own origin — XSS defeats every CSRF defense described here, because it can read tokens directly). Neither pair should ever be treated as interchangeable in a security review.

**Production discipline:** never allow state-changing GET; always set SameSite explicitly; always use constant-time comparison for tokens; keep CORS and CSRF configuration in separate modules; log and alert on rejection spikes; require step-up re-authentication for the most sensitive actions regardless of token validity.
`,

  "learning-roadmap": `
A realistic path to genuine CSRF competence (adjust pace to your background):

**Day 1–2 — Mechanics.** Read Beginner and Intermediate Concepts closely; build the two classic PoCs (img-tag GET, auto-submit form POST) from Lab 1 against your own toy app. Milestone: you can explain the attack on a whiteboard without notes.

**Day 3–4 — Defenses.** Implement synchronizer tokens (Django's built-in, then hand-rolled for FastAPI) and the signed double-submit pattern from Intermediate Concepts and Lab 2/3. Milestone: your earlier PoC now fails, and you can explain exactly which layer stopped it.

**Day 5 — SameSite and browser behavior.** Read Advanced Concepts' SameSite section carefully; test Strict/Lax/None behavior with real cross-origin requests in a browser, not just unit tests. Milestone: you can state precisely which request shapes Lax does and doesn't block.

**Day 6 — The two critical distinctions.** Work through the CSRF-vs-CORS-misconfiguration and CSRF-vs-XSS sections until you can explain both without hesitation; build the deliberate CORS-misconfiguration PoC from Lab 4 to feel the difference directly, not just read about it.

**Day 7 — Production hardening.** Work through Production Checklist, Testing, and Monitoring; wire up structured logging of rejections and both positive/negative tests for a toy endpoint.

**Week 2 — Full defense in depth.** Complete Lab 4 end to end: every layer combined, PoCs demonstrating each layer being defeated in isolation and then blocked together, plus a written threat-model summary.

Then continue to the **XSS** skill — the sibling client-side vulnerability whose defenses (and failure modes) directly interact with everything covered here — followed by **OWASP Top 10** to see how CSRF and XSS both sit inside the broader risk catalog.
`,

  "official-docs": `
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) — the canonical, continuously updated reference for defense patterns covered on this page.
- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) — precise, browser-vendor-maintained semantics for Strict/Lax/None.
- [MDN: Fetch Metadata Request Headers](https://developer.mozilla.org/en-US/docs/Glossary/Fetch_metadata_request_header) — Sec-Fetch-Site/Mode/Dest reference.
- [Django CSRF protection documentation](https://docs.djangoproject.com/en/stable/ref/csrf/) — the built-in CsrfViewMiddleware, settings, and edge cases (trusted origins, subdomains).
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — where CSRF and related risks are currently catalogued.
- [RFC 6265bis (Cookies: HTTP State Management Mechanism, in-progress update)](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis) — the evolving specification underlying SameSite semantics; verify the current draft/RFC number, as this has been revised multiple times.
`,

  books: `
- **The Web Application Hacker's Handbook, 2nd ed.** — Stuttard & Pinto. The classic deep reference for CSRF alongside every other major web vulnerability class, with a strong practical testing methodology.
- **Real-World Bug Hunting** — Peter Yaworski. Collects real disclosed vulnerability reports, including CSRF findings, with plain-language breakdowns of why each worked.
- **Web Security for Developers** — Malcolm McDonald. A concise, developer-facing (not just pentester-facing) treatment of CSRF, XSS, and CORS side by side — good for exactly the distinctions this page emphasizes.
- **The Tangled Web** — Michal Zalewski. Older but foundational for understanding the browser security model (same-origin policy, cookies) that CSRF exploits.
- **OWASP Testing Guide** (free, OWASP) — the methodology-level companion to the Cheat Sheet series, covering how to actually test for CSRF systematically.
`,

  blogs: `
- **PortSwigger Web Security Academy blog and labs** — hands-on, continuously maintained CSRF material with live practice labs, widely regarded as the best free applied resource for this topic.
- **OWASP blog and Cheat Sheet Series updates** — where defense guidance is revised as browser behavior changes.
- **Google Security Blog** — where SameSite rollout announcements and rationale were published as Chrome shipped the changes.
- **Troy Hunt's blog** (troyhunt.com) — frequent, practically-grounded web security writing that regularly touches CSRF-adjacent topics.
- **Google's web.dev security section** — developer-facing guidance on SameSite, Fetch Metadata, and cookie best practices, kept current with platform changes.
`,

  "research-papers": `
The academic literature specifically on CSRF is comparatively thin relative to topics like cryptography or distributed systems — honestly, most practitioner-grade understanding today comes from OWASP guidance and browser-vendor specifications rather than fresh peer-reviewed research. The closest foundational reading:

- **"Robust Defenses for Cross-Site Request Forgery"** — Barth, Jackson, and Mitchell, ACM CCS 2008. THE seminal paper; formalizes the Origin-header-checking defense and evaluates token-based approaches rigorously. Start here if you read only one paper on this topic.
- **"The Web Origin Concept"** (RFC 6454) — Adam Barth. Not a paper in the traditional sense but the formal specification of the origin concept that underlies both CSRF and CORS reasoning; essential background reading.
- **Norm Hardy's writing on the confused deputy problem** (1988, various publications) — the general systems-security concept CSRF is a specific web instantiation of; worth reading for the broader principle rather than web-specific detail.

For genuinely current research-grade material, the more productive reading is the ongoing IETF drafts around cookies (RFC 6265bis) and Fetch Metadata, since that is where active specification work — the closest thing to "new research" in this space — is actually happening today.
`,

  videos: `
- **PortSwigger Web Security Academy — Cross-site request forgery (CSRF) topic videos and labs** — the most hands-on, currently-maintained walkthroughs available, pairing directly with live practice labs.
- **Conference talks on the SameSite rollout from Google security engineers** (search recent OWASP AppSec / Chrome Dev Summit archives) — useful for understanding the real-world migration pain of a platform-level security change, not just the mechanism.
- **General OWASP AppSec conference talks tagged CSRF/CORS/web-security** — search the OWASP YouTube channel archives; specific talk titles and speakers shift year to year, so search rather than rely on a fixed list here.
- **LiveOverflow's web security series** (YouTube) — approachable, demonstration-heavy explanations of CSRF alongside adjacent vulnerability classes, good for building visual intuition before diving into the formal OWASP material.

Note: I'm deliberately not naming exact talk titles/years I can't verify with confidence — search the channels above for current, specific sessions rather than treating any single title here as authoritative.
`,

  "github-repos": `
- [OWASP/CSRFGuard](https://github.com/OWASP/CSRFGuard) — a long-standing reference implementation of token-based CSRF protection, useful for studying a mature, security-team-maintained approach.
- [django/django — django/middleware/csrf.py](https://github.com/django/django) — read the actual production implementation of CsrfViewMiddleware; excellent for seeing real edge-case handling (trusted origins, subdomains, referer checking as a secondary signal).
- [OWASP/www-project-cheat-sheets](https://github.com/OWASP/CheatSheetSeries) — the source repository behind the CSRF Prevention Cheat Sheet, including its revision history, which is itself instructive about how guidance has evolved.
- [digininja/DVWA](https://github.com/digininja/DVWA) — Damn Vulnerable Web Application; includes a dedicated CSRF module for safe, legal hands-on practice.
- [juice-shop/juice-shop](https://github.com/juice-shop/juice-shop) — OWASP Juice Shop, a deliberately vulnerable modern app with CSRF-adjacent and CORS-misconfiguration challenges, good for practicing the distinction this page emphasizes.
- [portswigger/csrf-poc-generator-references](https://portswigger.net/burp) — Burp Suite's built-in CSRF PoC generator (not a standalone repo, but the standard practitioner tool; check PortSwigger's documentation repositories for scripting references).
- [pallets-eco/flask-wtf](https://github.com/wtforms/flask-wtf) — Flask-WTF's CSRFProtect implementation, a good contrast to Django's approach for a lighter framework.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Attack construction*: build a working img-tag GET CSRF PoC, then a form-based POST CSRF PoC, against a toy app you control (Lab 1).
2. *Token implementation*: hand-roll the synchronizer token pattern for a framework with no built-in support (FastAPI), then compare your implementation against Django's built-in middleware source.
3. *Breaking naive defenses*: implement unsigned double-submit, then demonstrate the subdomain cookie-tossing bypass in a local multi-subdomain test setup; fix it with HMAC signing.
4. *SameSite reasoning*: given a table of request shapes (method, cross-site or not, top-level navigation or not), predict whether SameSite=Lax/Strict would withhold the cookie for each — then verify with real browser requests.
5. *Distinguishing vulnerability classes*: given a set of short vulnerability report descriptions, classify each as CSRF, CORS misconfiguration, or XSS, and justify the classification in one sentence each.
6. *Defense-in-depth design*: given a hypothetical banking API's architecture diagram, annotate where each of SameSite, tokens, custom headers, Origin checks, and Sec-Fetch-Site checks should be enforced.

External practice sets: PortSwigger Web Security Academy's CSRF and CORS lab series (free, guided, with solutions), OWASP Juice Shop's related challenges, DVWA's CSRF module, and general web-security-focused rooms on TryHackMe/HackTheBox that include CSRF scenarios.
`,

  "architecture-diagram": `
The reference layered-defense architecture for a production application handling both cookie-based sessions and a JSON API surface:

~~~mermaid
flowchart TB
    Client["Browser (session cookie + fetch/XHR client)"] --> Edge["Edge / CDN / WAF\nreject obviously cross-site\nstate-changing requests via\nSec-Fetch-Site where supported"]
    Edge --> CookiePolicy["Cookie layer\nSameSite=Lax/Strict, Secure, HttpOnly\nenforced entirely by the browser"]
    CookiePolicy --> AppMW["App CSRF middleware\n(synchronizer or HMAC-signed\ndouble-submit token check)"]
    AppMW --> HeaderCheck["Custom header requirement\n(JSON/AJAX routes only)\nenforced indirectly via CORS preflight"]
    HeaderCheck --> OriginCheck["Origin/Referer validation\n(secondary signal, fail-closed\nwhen both absent on sensitive routes)"]
    OriginCheck --> Handler["Route handler\n(business logic)"]
    AppMW -.on reject.-> Log["Structured log + metric\n(reason: missing/invalid/mismatched)"]
    Log --> Alert["Alerting on rejection-rate spikes"]
    subgraph SeparateConcern["Handled in a SEPARATE module -- not CSRF"]
        CORS["Explicit CORS allow-list\n+ Access-Control-Allow-Credentials\nreviewed independently"]
    end
    Handler -.response.-> CORS
~~~

The diagram deliberately separates the CORS allow-list into its own subgraph: it is enforced independently of every CSRF-specific layer above it, and conflating the two in either code or architecture diagrams is exactly the mistake this page repeatedly warns against.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((CSRF))
    Mechanics
      Confused deputy
      Ambient cookie authority
      GET img-tag exploit
      Auto-submit form POST exploit
      Login CSRF
    Why bearer tokens differ
      No auto-attached Authorization header
      Exception: token also read from a cookie
    Defenses
      SameSite Strict/Lax/None
      Synchronizer token pattern
      Double-submit cookie
      HMAC-signed double-submit
      Custom header + CORS preflight
      Origin/Referer validation
      Sec-Fetch-Site (Fetch Metadata)
    Critical distinctions
      CSRF vs XSS
      CSRF vs CORS misconfiguration
    Production
      Framework defaults (Django/Rails/ASP.NET)
      Testing positive and negative cases
      Monitoring rejection spikes
      Secrets management for HMAC keys
    Ecosystem
      Cookies and Sessions
      OWASP Top 10
      TLS and HTTPS
      Encryption and Hashing
    Career
      Interview distinctions
      PoC labs
      Defense-in-depth project
~~~
`,
};

export default csrf;
