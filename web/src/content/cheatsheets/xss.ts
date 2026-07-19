import type { CheatSheetData } from "./types";

const xss: CheatSheetData = {
  title: "The Ultimate XSS Cheat Sheet",
  subtitle: "Stored/reflected/DOM · output encoding · CSP · framework auto-escaping · production toolbelt",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "XSS", desc: "Attacker-controlled script executes in a victim's browser, in the site's own origin", code: "Attacker script runs AS the site\nCan read cookies, DOM, make authenticated requests" },
        { term: "Stored (persistent) XSS", desc: "Payload saved server-side (comment, profile field) and served to every later viewer", code: "comment = \"<script>steal(document.cookie)</script>\"\n# saved to DB, rendered unescaped for all visitors" },
        { term: "Reflected XSS", desc: "Payload comes from the current request (query param) and is echoed back immediately", code: "GET /search?q=<script>evil()</script>\n# server reflects q directly into the HTML response" },
        { term: "DOM-based XSS", desc: "Vulnerable sink is client-side JS itself; payload never touches the server", code: "element.innerHTML = location.hash.slice(1)\n# no server round-trip involved at all" },
        { term: "Sink", desc: "Any point where a string is inserted as HTML/JS/URL context without encoding", code: "innerHTML, document.write, eval,\nv-html, dangerouslySetInnerHTML" },
        { term: "Same-origin policy", desc: "Why XSS is dangerous — script now has the victim's own origin privileges", code: "Cookies, localStorage, DOM, fetch()\nall become attacker-readable" },
        { term: "Mutation XSS (mXSS)", desc: "Payload looks safe pre-sanitization but the browser's own HTML parser mutates it into an exploit", code: "Sanitizer sees safe markup;\nbrowser re-parses it differently -> script executes" },
      ],
    },
    {
      title: "Output Encoding by Context",
      color: "blue",
      rows: [
        { term: "HTML entity encoding", desc: "For inserting untrusted data into HTML body context", code: "< -> &lt;   > -> &gt;   & -> &amp;\n\" -> &quot;  ' -> &#x27;" },
        { term: "HTML attribute encoding", desc: "Different rule set than body context — quotes matter most here", code: "<div title=\"USER_INPUT_ENCODED\">\n# always quote attributes, then encode quotes" },
        { term: "JavaScript string escaping", desc: "For inserting untrusted data inside a script block or JS string literal", code: "var name = \"USER_INPUT_JS_ESCAPED\";\n# escape backslash, quote, and </script> sequences" },
        { term: "URL encoding", desc: "For untrusted data placed into a URL query string or path segment", code: "encodeURIComponent(userInput)" },
        { term: "CSS value encoding", desc: "For untrusted data injected into a style attribute or stylesheet", code: "expression(), url(javascript:...) are\nlegacy CSS injection vectors -- avoid raw CSS interpolation" },
        { term: "Context mismatch bug", desc: "Using HTML encoding inside a JS context (or vice versa) still leaves an exploitable gap", code: "HTML-encoding a value placed inside\n<script>var x = 'VALUE'</script> does NOT stop injection" },
        { term: "One rule", desc: "Encode for the context you are writing INTO, not the context the data came from", code: "Body -> HTML encode\nAttribute -> attribute encode\nScript -> JS encode" },
      ],
    },
    {
      title: "Framework Auto-Escaping",
      color: "emerald",
      rows: [
        { term: "React JSX", desc: "Auto-escapes all expression interpolations by default", code: "<div>{userInput}</div>  // safe, auto-escaped" },
        { term: "React escape hatch", desc: "Bypasses auto-escaping entirely — requires manual sanitization first", code: "<div dangerouslySetInnerHTML={{__html: safeHtml}} />\n# safeHtml MUST be sanitized (DOMPurify) first" },
        { term: "Vue v-html", desc: "Same danger as dangerouslySetInnerHTML — raw HTML injection point", code: "<div v-html=\"trustedHtmlOnly\"></div>\n# never bind directly to user input" },
        { term: "Vue text interpolation", desc: "Mustache syntax auto-escapes by default, like JSX", code: "<div>{{ userInput }}</div>  // safe" },
        { term: "Django/Jinja2 autoescaping", desc: "On by default since Django 1.0 / modern Jinja2 — {{ }} auto-escapes", code: "{{ user_input }}  {# auto-escaped #}\n{{ user_input|safe }}  {# opts OUT -- dangerous #}" },
        { term: "DOMPurify", desc: "Sanitization library for cases where some real HTML must be allowed (rich text, markdown render)", code: "import DOMPurify from 'dompurify';\nconst clean = DOMPurify.sanitize(rawHtml);" },
        { term: "Never trust '|safe' / dangerouslySetInnerHTML by default", desc: "These exist for pre-sanitized, trusted content only", code: "Audit every use in code review\nRequire a comment justifying why it's safe" },
      ],
    },
    {
      title: "Content Security Policy (CSP)",
      color: "amber",
      rows: [
        { term: "CSP header", desc: "Browser-enforced allowlist of script/style/resource sources — defense-in-depth even if a payload lands", code: "Content-Security-Policy: default-src 'self'" },
        { term: "script-src directive", desc: "Restricts where executable scripts may load from", code: "script-src 'self' https://cdn.example.com" },
        { term: "Nonce-based CSP", desc: "Per-request random token that must match on every allowed inline script tag", code: "Content-Security-Policy: script-src 'nonce-r4nd0m'\n<script nonce=\"r4nd0m\">...</script>" },
        { term: "Hash-based CSP", desc: "Allowlists a specific inline script by its SHA hash instead of a nonce", code: "script-src 'sha256-abc123...='" },
        { term: "unsafe-inline (avoid)", desc: "Defeats most of CSP's protection by allowing any inline script to run", code: "script-src 'unsafe-inline'  # avoid in production" },
        { term: "CSP report-only mode", desc: "Roll out safely — observe violations via reports before enforcing", code: "Content-Security-Policy-Report-Only: ...\nreport-uri /csp-violation-report" },
        { term: "CSP is defense-in-depth", desc: "Not a substitute for output encoding — assume it can be misconfigured or bypassed", code: "Fix the injection first,\nCSP limits blast radius second" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "'Sanitize input' framing", desc: "Wrong mental model — the correct discipline is contextual OUTPUT encoding at render time", code: "Store raw data; encode at every\noutput sink, per context" },
        { term: "innerHTML with template literals", desc: "Classic DOM XSS sink even in modern JS code", code: "// UNSAFE:\nel.innerHTML = 'Hello ' + name + '!'\n// (any template-literal or concat build of innerHTML is the same risk)" },
        { term: "location.hash / URL as a sink", desc: "Fully client-side — no server involvement, easy to overlook in review", code: "el.innerHTML = decodeURIComponent(location.hash)" },
        { term: "JSON embedded in HTML", desc: "Must escape </script> and Unicode line separators, not just quotes", code: "json.dumps(data).replace('</', '<\\\\/')" },
        { term: "Trusting Content-Type alone", desc: "Browsers may sniff content type regardless of the declared header", code: "Always set X-Content-Type-Options: nosniff" },
        { term: "Rich-text editor without a sanitizer", desc: "The most common real-world stored-XSS source in production apps", code: "Sanitize with DOMPurify server- AND\nclient-side before ever rendering" },
        { term: "Cookie theft via XSS", desc: "Mitigate the blast radius with HttpOnly cookies — see the Cookies & Sessions skill", code: "Set-Cookie: session=abc; HttpOnly; Secure\n# JS can no longer read it even post-XSS" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "DOMPurify", desc: "Battle-tested HTML sanitizer for allowing safe rich text", code: "npm install dompurify" },
        { term: "OWASP ZAP / Burp Suite", desc: "Automated + manual scanners with dedicated XSS detection modules", code: "Passive + active scan modes\ninclude reflected/stored XSS checks" },
        { term: "CSP evaluator", desc: "Google's tool for auditing a CSP policy for common weaknesses", code: "https://csp-evaluator.withgoogle.com" },
        { term: "eslint-plugin-react (no-danger)", desc: "Lints against dangerouslySetInnerHTML usage in CI", code: "\"react/no-danger\": \"warn\"" },
        { term: "Trusted Types (browser API)", desc: "Forces DOM XSS sinks to only accept values from a vetted policy function", code: "Content-Security-Policy: require-trusted-types-for 'script'" },
        { term: "Security headers baseline", desc: "Pair CSP with these for a stronger overall posture", code: "X-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nReferrer-Policy: strict-origin-when-cross-origin" },
        { term: "OWASP reference", desc: "See the OWASP Top 10 skill — XSS falls under A03:2021-Injection", code: "Cross-reference: OWASP Top 10, CSRF,\nCookies & Sessions, Secrets Management skills" },
      ],
    },
  ],
};

export default xss;
