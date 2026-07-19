import type { CheatSheetData } from "./types";

const owaspTop10: CheatSheetData = {
  title: "The Ultimate OWASP Top 10 Cheat Sheet",
  subtitle: "The 2021 categories · how the list is built · how teams use it · platform skill map",
  sections: [
    {
      title: "What OWASP Is",
      color: "violet",
      rows: [
        { term: "OWASP", desc: "Open Worldwide Application Security Project — nonprofit producing free security standards", code: "Community-driven, vendor-neutral,\nfunds itself via donations and corporate members" },
        { term: "OWASP Top 10", desc: "A data-driven AWARENESS document, not a compliance checklist or exhaustive vuln list", code: "Ranks the most impactful risk CATEGORIES,\nnot every possible vulnerability" },
        { term: "Not a complete threat model", desc: "Business-logic flaws and app-specific risks fall outside its ten categories", code: "Still need dedicated threat modeling\nfor your specific application" },
        { term: "How it's compiled", desc: "Combines incidence/breach data with a structured industry practitioner survey", code: "CWE (Common Weakness Enumeration)\nmapping underlies each category" },
        { term: "Revision cadence", desc: "Updated roughly every 3-4 years as the threat landscape shifts", code: "This page treats the 2021 edition as\nprimary -- verify if a newer edition has shipped" },
        { term: "OWASP Top 10 for LLM Applications", desc: "A newer, separate OWASP project covering AI/LLM-specific risks (prompt injection, etc.)", code: "See the Prompt Injection Defense and\nAI Red Teaming skills for that adjacent list" },
        { term: "Not a substitute for pentesting", desc: "A checklist starting point, not proof of security when 'checked off'", code: "Pair with real penetration testing\nand ongoing threat modeling" },
      ],
    },
    {
      title: "The 10 Categories (2021)",
      color: "blue",
      rows: [
        { term: "A01 Broken Access Control", desc: "Users acting outside intended permissions — see the RBAC and ABAC skills", code: "IDOR: GET /orders/12345\nwithout checking it belongs to the requester" },
        { term: "A02 Cryptographic Failures", desc: "Weak/missing crypto exposing sensitive data — see Encryption, Hashing, TLS & HTTPS skills", code: "Plaintext passwords, weak TLS ciphers,\nhome-rolled crypto" },
        { term: "A03 Injection", desc: "Untrusted data changes command/query logic — see SQL Injection and XSS skills", code: "SQL, NoSQL, OS command,\nand cross-site scripting all fall here" },
        { term: "A04 Insecure Design", desc: "Missing security controls at the design phase, not just a coding bug", code: "No threat model, no rate limiting\nby design, no abuse-case analysis" },
        { term: "A05 Security Misconfiguration", desc: "Default credentials, verbose errors, unnecessary features enabled", code: "Debug mode left on in production,\ndefault admin/admin credentials" },
        { term: "A06 Vulnerable and Outdated Components", desc: "Using libraries/frameworks with known CVEs", code: "npm audit / pip-audit / Dependabot\ncatch this category" },
        { term: "A07 Identification and Authentication Failures", desc: "Weak auth flows — see OAuth 2.0/OIDC, JWT, Cookies & Sessions skills", code: "Weak password policy, no MFA,\npredictable session tokens" },
        { term: "A08 Software and Data Integrity Failures", desc: "Trusting unsigned updates/plugins/CI pipelines without integrity checks", code: "Unsigned auto-update mechanism,\ninsecure deserialization" },
        { term: "A09 Security Logging and Monitoring Failures", desc: "Attacks go undetected because nothing is logged or alerted on", code: "See the Logging, Metrics,\nand Monitoring platform skills" },
        { term: "A10 Server-Side Request Forgery (SSRF)", desc: "Server tricked into making requests to unintended internal/external destinations", code: "app.fetch(user_supplied_url)\n# can reach internal metadata endpoints" },
      ],
    },
    {
      title: "How Teams Use the List",
      color: "emerald",
      rows: [
        { term: "Secure SDLC checkpoint", desc: "Reviewed at design and code-review stages as a baseline risk checklist", code: "PR template: 'Which OWASP category(ies)\ndoes this change touch?'" },
        { term: "Security training curriculum", desc: "Most application-security onboarding is structured around these ten categories", code: "Foundational reading before\nrole-specific security training" },
        { term: "Pentest / bug bounty scoping", desc: "Testers use it as a starting checklist, then go well beyond it for app-specific logic", code: "Scope doc: 'Test for OWASP Top 10\nplus business-logic abuse cases'" },
        { term: "Compliance mapping", desc: "Referenced by PCI-DSS, SOC 2, and other frameworks as a baseline expectation", code: "PCI-DSS Requirement 6.5 explicitly\nreferences OWASP Top 10 categories" },
        { term: "WAF rule tuning", desc: "Commercial/open-source WAFs ship rule sets organized around these categories", code: "ModSecurity Core Rule Set (CRS)\nmaps directly to OWASP categories" },
        { term: "Static/dynamic analysis tool mapping", desc: "SAST/DAST tools tag findings with their corresponding OWASP category", code: "Semgrep, Snyk, and Burp Suite all\nlabel findings by OWASP category" },
        { term: "Risk prioritization language", desc: "Gives security and engineering a shared vocabulary for triage conversations", code: "'This is an A01 finding, sev-high' --\nunderstood across security and eng teams" },
      ],
    },
    {
      title: "Platform Skill Cross-Reference",
      color: "amber",
      rows: [
        { term: "A01 -> Access Control skills", desc: "Deep dive into fixing broken access control", code: "See: RBAC, ABAC skills" },
        { term: "A02 -> Cryptography skills", desc: "Deep dive into fixing cryptographic failures", code: "See: Encryption, Hashing, TLS & HTTPS,\nSecrets Management skills" },
        { term: "A03 -> Injection skills", desc: "Deep dive into the two most common injection classes", code: "See: SQL Injection, XSS skills" },
        { term: "A07 -> Identity skills", desc: "Deep dive into authentication done right", code: "See: OAuth 2.0/OIDC, JWT,\nCookies & Sessions skills" },
        { term: "CSRF (historical A05/2017, now folded in)", desc: "Dropped from a standalone 2021 category but still a real, common vulnerability", code: "See: CSRF skill for why it still matters\ndespite not being a 2021 top-level category" },
        { term: "A09 -> Observability skills", desc: "Deep dive into detecting attacks as they happen", code: "See: Logging, Metrics,\nMonitoring, Tracing skills" },
        { term: "AI/LLM-specific risks", desc: "Not covered by the classic Top 10 at all — a separate, newer list exists", code: "See: Prompt Injection Defense,\nAI Red Teaming skills" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "'We're OWASP compliant' as a claim", desc: "OWASP Top 10 is not a certification — there is nothing to be 'compliant' with", code: "Correct framing: 'We test against\nand mitigate OWASP Top 10 risk categories'" },
        { term: "Checklist theater", desc: "Checking a box per category without real testing gives false confidence", code: "Each category needs concrete tests,\nnot just a documented mitigation claim" },
        { term: "Treating it as exhaustive", desc: "Business-logic flaws, race conditions, and app-specific abuse cases live outside it", code: "Still need dedicated threat modeling\nper application" },
        { term: "Ignoring category overlap", desc: "Many real vulnerabilities span multiple categories at once", code: "A leaked API key (A02/A05) enabling\nan SSRF (A10) is one incident, two categories" },
        { term: "Citing an outdated edition", desc: "Always state which edition year you're referencing — the categories do shift", code: "This page's category list = 2021 edition;\ncheck for a newer edition before citing externally" },
        { term: "Assuming it covers AI-specific risk", desc: "Prompt injection, model exfiltration, and agent tool-abuse are NOT in the classic Top 10", code: "See the separate OWASP Top 10\nfor LLM Applications project" },
        { term: "One-time review only", desc: "Threats and the list itself evolve — revisit this mapping periodically, not once at launch", code: "Re-run the mapping exercise\nat each major release or annually" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "OWASP ZAP", desc: "Free, open-source DAST scanner covering most Top 10 categories out of the box", code: "zap-baseline.py -t https://staging.example.com" },
        { term: "Semgrep / Snyk Code", desc: "SAST tools with rule sets pre-tagged by OWASP category", code: "semgrep --config p/owasp-top-ten ." },
        { term: "OWASP Dependency-Check", desc: "Flags known-vulnerable dependencies for A06", code: "dependency-check --project app --scan ." },
        { term: "OWASP Cheat Sheet Series", desc: "Companion project with deep, practical per-topic guidance beyond the Top 10 summary", code: "cheatsheetseries.owasp.org" },
        { term: "ModSecurity Core Rule Set", desc: "WAF rules organized around OWASP categories for the edge layer", code: "SecRuleEngine On\nInclude crs-setup.conf" },
        { term: "Threat modeling frameworks", desc: "STRIDE/PASTA pair well with the Top 10 to cover business-logic gaps", code: "Use alongside, not instead of,\nthe Top 10 checklist" },
        { term: "Cross-reference", desc: "Every Security-category platform skill maps back to one or more of these ten", code: "SQL Injection, XSS, CSRF, Encryption,\nHashing, TLS & HTTPS, Secrets Management" },
      ],
    },
  ],
};

export default owaspTop10;
