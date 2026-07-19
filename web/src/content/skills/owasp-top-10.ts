import type { SkillContent } from "../types";

/**
 * OWASP Top 10 — full 50-section knowledge page.
 * Note: code fences use ~~~ (never backtick fences), and this file contains
 * zero backtick characters and zero dollar-brace interpolation sequences.
 * This page is the capstone/map for the Security category: it cross-references
 * every sibling security skill (SQL Injection, XSS, CSRF, Encryption, Hashing,
 * TLS & HTTPS, Secrets Management, OAuth 2.0/OIDC, JWT, Cookies & Sessions,
 * RBAC, ABAC) against the specific OWASP category it maps to.
 */
const owaspTop10: SkillContent = {
  overview: `
OWASP — the Open Worldwide Application Security Project (until a 2023 rebrand, the Open Web Application Security Project) — is a nonprofit foundation dedicated to improving software security. It runs entirely on volunteer contributions from security practitioners, and everything it produces (documents, tools, chapters, conferences like AppSec Global) is free and open. OWASP does not sell products, does not certify companies, and takes no vendor money in exchange for placement in its guidance — that independence is why its output is trusted across the industry.

The **OWASP Top 10** is OWASP's flagship project: a periodically updated, data-driven awareness document describing the ten application security risks considered most critical at the time of publication. It is deliberately NOT a compliance checklist, NOT an exhaustive vulnerability catalog, and NOT a substitute for a real threat model of your specific application. It is a prioritization tool — a way to point limited security attention at the risks that hurt the most applications, most often, most severely.

For an AI engineer, the Top 10 matters for two reasons. First, everything you ship — a FastAPI backend, an agent tool that calls internal APIs, a RAG pipeline reading from a database, an admin dashboard for a model — is a web application with the exact same attack surface as any other web app, and the Top 10 is the fastest way to get a baseline of what to defend against. Second, this page is explicitly the **map** for every other skill in the Security category on this platform: SQL Injection, XSS, CSRF, Encryption, Hashing, TLS and HTTPS, and Secrets Management are all deep dives into specific OWASP categories, and OAuth 2.0/OIDC, JWT, Cookies and Sessions, RBAC, and ABAC are deep dives into the access-control and authentication categories. Read this page first to understand where each of those skills fits, then go deep on each one individually.

Key characteristics of the Top 10 as a document: it is community-produced (hundreds of unpaid contributors review drafts), partially data-driven (built from real vulnerability data contributed by AppSec tooling vendors and testing firms across hundreds of thousands of applications) and partially survey-driven (a practitioner survey adds categories the data alone would under-rank), mapped to formal weakness taxonomy (CWE — Common Weakness Enumeration) so tools and reports can reference it precisely, and revised roughly every three to four years as the threat landscape shifts. The current, most authoritative edition this page treats as its primary reference is **OWASP Top 10:2021**.
`,

  history: `
OWASP was founded in 2001 by **Mark Curphey**, motivated by a simple observation: security research at the time was overwhelmingly focused on network and operating-system security, while the application layer — the code developers actually wrote — was mostly ignored, even though it was becoming the dominant source of real breaches. OWASP set out to fix that gap by producing free, vendor-neutral, practitioner-written guidance.

The Top 10 project began two years later, in 2003, as an attempt to answer a question every engineering leader was asking: "if we can only fix ten things, which ten things matter most?" It has been revised on roughly this cadence:

| Year | Milestone |
|------|-----------|
| 2001 | OWASP founded by Mark Curphey to fix the application-security awareness gap |
| 2003 | First OWASP Top 10 published |
| 2004 | First revision |
| 2007 | Revision; risk-rating methodology tightened |
| 2010 | Revision explicitly reframed around **risk**, not just vulnerability type — impact and likelihood, not only "does this bug exist" |
| 2013 | Revision; Cross-Site Request Forgery (CSRF) appears as its own category (A8) |
| 2017 | Revision; CSRF is removed as a standalone category (frameworks had made built-in CSRF defenses common enough that incidence dropped sharply); Using Components with Known Vulnerabilities and Insufficient Logging and Monitoring gain prominence |
| 2021 | Major revision (current primary reference for this page): categories are reframed around root cause rather than symptom — Broken Access Control jumps from #5 to #1, Cryptographic Failures replaces Sensitive Data Exposure, three brand-new categories appear (Insecure Design, Software and Data Integrity Failures, Server-Side Request Forgery), and for the first time two categories were added purely from a community practitioner survey rather than raw incidence data |
| 2023 | OWASP the organization renames from "Open Web Application Security Project" to "Open Worldwide Application Security Project," reflecting a broader mandate beyond just the web (mobile, APIs, cloud, and — new in this era — LLM applications) |
| 2023–2025 | The adjacent **OWASP Top 10 for LLM Applications** project launches and iterates rapidly (v1.0 in 2023, revised editions following), addressing risks like prompt injection that the classic web-focused Top 10 was never designed to cover |

Honesty about currency: my training data gives me high confidence in the 2021 edition's content, structure, and rationale — treat it as this page's primary reference. I am aware OWASP typically begins data collection for a new edition a couple of years after the previous one ships, so a newer full revision may exist or be in progress by the time you read this. I have not verified the contents of any edition beyond 2021 with certainty, so if you need the current official list, check owasp.org/Top10 directly before citing a category number in an audit or a job interview.
`,

  "why-it-exists": `
Before the Top 10 existed, "application security" mostly meant network security applied to a web server: firewalls, patched operating systems, locked-down ports. That stack does nothing to stop a SQL injection in your own login form, because the attacker is talking to your application exactly the way a legitimate user would — over port 443, through the firewall, straight into code you wrote.

The gap the Top 10 filled was **prioritized, code-level awareness for people who are not security specialists**. In the early 2000s, developers had no common vocabulary for "the ten things that keep breaking," no simple document they could hand to a manager to justify a security budget, and no shared checklist that a penetration tester, an auditor, and a developer could all point to and mean the same thing. Security knowledge lived in expensive consultants' heads and dense academic papers.

The Top 10 solved this by being **short, ranked, and free**. Ten items is a number a busy engineering team can actually internalize, unlike a 300-page standard. Ranking (even imperfectly) tells you where to start. And because it costs nothing and carries no vendor's fingerprints, it became the shared language: "we're vulnerable to A03" means the same thing whether you're talking to a developer, an auditor, or a bug bounty hunter, anywhere in the world.

It also exists to counter a specific failure mode: security-by-obscurity thinking, where teams assumed "no one would guess our URL structure" or "our app isn't a big enough target." The Top 10's data-driven backbone — real vulnerability data from real applications — makes the case with evidence rather than fear: these exact classes of bugs recur, at scale, across every industry, regardless of how obscure the target feels.
`,

  "problem-it-solves": `
Concretely, the Top 10 removes these pains:

- **Prioritization paralysis.** Given unlimited possible vulnerability classes, teams didn't know where to start. The Top 10 says: start here, because these categories account for most real-world incidents.
- **Vocabulary fragmentation.** Before a shared taxonomy, a pentest report, a bug bounty submission, and an internal Jira ticket about "the same kind of bug" used three different names. CWE-mapped Top 10 categories give everyone one label.
- **The training cold-start problem.** New developers need a fast on-ramp to "what does insecure code even look like." Ten categories with concrete examples is a teachable unit; a 300-page standard is not.
- **The audit justification problem.** Compliance frameworks (PCI-DSS, SOC 2) need a citable, industry-recognized baseline to point to instead of inventing their own security taxonomy from scratch.

What the Top 10 deliberately does **not** solve, and never claimed to:

- It is **not a complete threat model** for your specific application. Your business logic — the exact rules of your checkout flow, your permissions model, your pricing engine — is unique to you, and no generic top-ten list will find a flaw in logic that only you built. That is what the Insecure Design category gestures at, but it cannot replace real threat modeling (see Advanced Concepts and Hands-on Labs).
- It is **not exhaustive**. There are hundreds of CWE entries; the Top 10 surfaces the ten categories judged highest-impact at a point in time. A category not being in the list does not mean it is safe to ignore — CSRF is the canonical example, discussed in depth below.
- It is **not compliance**. "We checked the Top 10 box" is not the same as being secure; auditors and regulators use it as a reference point, not a certificate.
- It does **not cover business-logic abuse, fraud, or AI/LLM-specific risks** (prompt injection, training-data poisoning, model extraction). Those live in adjacent, purpose-built projects — see Comparisons and Related Technologies for the OWASP Top 10 for LLM Applications, and this platform's **AI Red Teaming** and **Prompt Injection Defense** skills.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what OWASP is, what the Top 10 project is, and precisely what it is (and is not) meant to be used for.
2. Name and explain all ten OWASP Top 10:2021 categories, with a concrete real-world example of each.
3. Explain how the list is compiled — the mix of contributed incidence data, CWE mapping, and community survey — and why that methodology matters for interpreting the list correctly.
4. Map each sibling security skill on this platform (SQL Injection, XSS, CSRF, Encryption, Hashing, TLS and HTTPS, Secrets Management, OAuth 2.0/OIDC, JWT, Cookies and Sessions, RBAC, ABAC) to the specific OWASP category or categories it addresses.
5. Describe how real organizations operationalize the Top 10: secure-SDLC checkpoints, training curricula, pentest and bug-bounty scoping, and compliance mapping (PCI-DSS, SOC 2).
6. Read and triage a vulnerability report (internal finding, pentest result, or bug bounty submission) and classify it correctly against a Top 10 category and CWE.
7. Identify the Top 10's limitations: what it does not cover (business logic, AI/LLM risks) and why "OWASP Top 10 compliant" is not a meaningful security claim on its own.
8. Explain CSRF's specific history in the Top 10 — why it was removed and why it still matters today.
9. Design a secure-SDLC pipeline (threat modeling, SAST, SCA, secrets scanning, DAST) that operationalizes Top 10 categories as automated gates.
10. Speak fluently about this material in an interview: name categories under pressure, give an example for each, and discuss at least one real breach per category.
`,

  prerequisites: `
- **Required**: basic web application literacy — you should know what an HTTP request/response is, what a database query looks like, and roughly how a login form works. Nothing else; this page explains every security concept from first principles.
- **Helpful**: any exposure to writing backend code (any language) makes the code examples click faster, but is not required to understand the concepts.
- **For full depth on each category**: this page is deliberately the overview. For hands-on mastery of individual categories, follow up with the dedicated skills: **SQL Injection** and **XSS** (both under A03: Injection), **Encryption**, **Hashing**, and **TLS and HTTPS** (all under A02: Cryptographic Failures), **OAuth 2.0/OIDC**, **JWT**, **Cookies and Sessions**, **RBAC**, and **ABAC** (together covering A01: Broken Access Control and A07: Identification and Authentication Failures), **Secrets Management** (A07's credential-handling half, plus A05 misconfiguration), and **CSRF** (removed from the current Top 10, but still a live risk — see History and this page's dedicated notes below).

Dependency links: this page has no strict prerequisite skill on the platform — it is designed as the entry point into the Security category. After this page, the natural next stop for an AI-focused engineer is **AI Red Teaming** or **Prompt Injection Defense**, since those extend this exact awareness-and-defense mindset into LLM-specific territory that the classic Top 10 does not cover.
`,

  "beginner-concepts": `
### What "application security risk" actually means

A security risk in an application is a combination of a **weakness** (a mistake in code, config, or design), a **threat actor** who can reach and exploit it, and an **impact** if they succeed. The Top 10 ranks categories of weakness by how often they occur, how easy they are to exploit, and how bad the impact tends to be — not by any single one of those factors alone.

### The CIA triad — the three things you are protecting

~~~text
Confidentiality — only authorized parties can read the data
Integrity       — only authorized parties can change the data, and changes are detectable
Availability    — the system keeps working for legitimate users
~~~

Every OWASP Top 10 category threatens at least one leg of this triad. Injection (A03) and Cryptographic Failures (A02) usually threaten confidentiality. Broken Access Control (A01) and Software and Data Integrity Failures (A08) threaten integrity. SSRF (A10) can threaten all three depending on what the attacker reaches.

### A first, concrete example: SQL Injection (part of A03)

~~~python
# VULNERABLE: user input concatenated directly into a SQL string
def get_user(username: str):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return db.execute(query)

# An attacker submits: username = "admin' --"
# The final query becomes:
# SELECT * FROM users WHERE username = 'admin' --'
# Everything after -- is a SQL comment: the password check is gone.

# SAFE: parameterized query — the driver treats input as DATA, never as SQL syntax
def get_user_safe(username: str):
    query = "SELECT * FROM users WHERE username = %s"
    return db.execute(query, (username,))
`,

  "intermediate-concepts": `
### The ten categories of OWASP Top 10:2021, one at a time

Each category below states what it means and gives one concrete example. Numbers in parentheses are the approximate rank; A01 is considered the highest-priority category in the 2021 edition.

**A01:2021 — Broken Access Control.** The application fails to properly enforce what a given user is allowed to do or see. Example: an invoice URL like site.com/invoices?id=1002 — changing the id to 1003 returns another customer's invoice because the server never checks that the logged-in user actually owns invoice 1003 (an Insecure Direct Object Reference, IDOR). See the RBAC and ABAC skills for how to design authorization models that prevent this class of bug at the architecture level, and Cookies and Sessions for how session state should carry identity safely.

**A02:2021 — Cryptographic Failures.** Sensitive data is exposed or tampered with because cryptography was missing, weak, or misused — renamed from "Sensitive Data Exposure" to point at the root cause rather than the symptom. Example: a database storing passwords as unsalted MD5 hashes, cracked in bulk within hours using rainbow tables once the database leaks. See the Encryption, Hashing, and TLS and HTTPS skills for the full technical depth here — those three skills together are this category's deep dive.

**A03:2021 — Injection.** Untrusted input is interpreted as code or commands by an interpreter (SQL, a shell, an LDAP query, or a browser's DOM). The 2021 edition folded Cross-Site Scripting (XSS) into this category. Example: the SQL injection shown in Beginner Concepts, or a search box that echoes user input straight into HTML, letting an attacker inject a script tag that steals other users' session cookies. See the dedicated SQL Injection and XSS skills.

**A04:2021 — Insecure Design.** A new 2021 category capturing flaws in the design itself, not just bugs in implementation — no amount of secure coding fixes a feature that was never threat-modeled. Example: a password-reset endpoint that returns a different error message for "email not found" versus "wrong code," letting an attacker enumerate every registered email address, because no one asked "how could this be abused" at design time.

**A05:2021 — Security Misconfiguration.** The most common category by raw incidence: default credentials left in place, verbose stack traces exposed to users, unnecessary features or ports enabled, cloud storage left publicly readable, or missing security headers. Example: an Amazon S3 bucket holding customer documents left with public read access because the default permission was never reviewed. This category overlaps heavily with how authentication and session systems are deployed — see OAuth 2.0/OIDC, JWT, Cookies and Sessions, RBAC, and ABAC for the specific configuration choices (token lifetimes, cookie flags, role definitions) that most often get misconfigured in practice.

**A06:2021 — Vulnerable and Outdated Components.** Using a library, framework, or runtime with a known, unpatched vulnerability. Example: the Log4Shell vulnerability (CVE-2021-44228) in the widely used Java logging library Log4j allowed remote code execution simply by having the vulnerable version log a specially crafted string — no code of your own had to be wrong, only your dependency tree.

**A07:2021 — Identification and Authentication Failures.** Weaknesses in how the app verifies who a user is — renamed and broadened from "Broken Authentication." Example: an application with no rate limiting or account lockout, letting an attacker try millions of leaked password-and-email pairs (credential stuffing) against the login form until a match succeeds. This is the other half of the access-control story: see OAuth 2.0/OIDC and JWT for delegated and token-based authentication, Cookies and Sessions for session-based authentication, RBAC and ABAC for what happens after identity is established, and Secrets Management for keeping the credentials and signing keys behind all of this safe.

**A08:2021 — Software and Data Integrity Failures.** A new 2021 category covering code and infrastructure that doesn't verify integrity — insecure deserialization, unsigned software updates, and compromised CI/CD pipelines all live here. Example: the SolarWinds Orion supply-chain attack, where attackers compromised the build pipeline itself and shipped a trojanized software update, signed with the vendor's own legitimate certificate, to thousands of downstream customers.

**A09:2021 — Security Logging and Monitoring Failures.** Without adequate logging, detection, and alerting, breaches go unnoticed for months. Example: an application that never logs failed login attempts or access-control denials has no way to detect a slow, patient credential-stuffing campaign or an insider silently walking through other users' records via IDOR.

**A10:2021 — Server-Side Request Forgery (SSRF).** The application fetches a remote resource using a URL supplied (directly or indirectly) by the user, letting an attacker make the server issue requests it never intended to — often reaching internal-only systems. Example: an image-preview feature that fetches whatever URL a user submits; an attacker submits the cloud provider's internal metadata endpoint address instead of an image URL, and the server obligingly fetches temporary cloud credentials on the attacker's behalf. This exact mechanism was central to the 2019 Capital One breach.

### CSRF: dropped from the list, still real

Cross-Site Request Forgery tricks a logged-in user's browser into submitting an unwanted request (transferring funds, changing an email address) to a site where they're already authenticated, using their existing session cookie. It was its own category (A8) in the 2013 edition, but was removed starting with the 2017 revision because widespread framework-level defenses (anti-CSRF tokens, the SameSite cookie attribute) had pushed its measured incidence down sharply — and it has not returned as a standalone category in 2021 either. It still deserves its own skill on this platform because "handled by the framework" is not the same as "handled correctly": misconfigured CORS, APIs consumed by non-browser clients, or a forgotten legacy endpoint can all reintroduce it. See the dedicated CSRF skill for the mechanics and modern defenses.
`,

  "advanced-concepts": `
### How the list is actually compiled

The OWASP Top 10:2021 methodology blends two very different inputs, and understanding the blend is what separates people who quote the list from people who know how to use it correctly:

1. **Contributed incidence data.** OWASP asks AppSec tooling vendors, testing firms, and bug bounty platforms to contribute anonymized vulnerability data from real application assessments — hundreds of thousands of applications in the 2021 dataset. Each finding is mapped to a specific CWE (Common Weakness Enumeration) identifier, then CWEs are grouped into candidate risk categories and ranked by a combination of incidence rate (how many apps had at least one instance), exploitability, and impact estimates.
2. **A practitioner survey.** Because raw incidence data underrepresents risks that are catastrophic but less common, or hard for automated scanners to find, OWASP also surveys hundreds of AppSec professionals and asks which risks they believe deserve inclusion regardless of what the data shows. In the 2021 edition, this survey is explicitly how Insecure Design (A04) and Server-Side Request Forgery (A10) entered the list — they were community-nominated on top of the eight data-driven categories.

This matters because it explains a common misreading: "if it's not in the Top 10, it's rare." Some real risks (like CSRF) are simply well-defended by default tooling now, which lowers their measured incidence without eliminating the risk on a specific misconfigured system. The list measures **aggregate industry risk at a point in time**, not "risk to your specific application right now."

### CWE mapping in practice

Every Top 10 category is really a bucket of specific CWE entries. A03 Injection, for instance, bundles CWE-89 (SQL Injection), CWE-79 (Cross-Site Scripting), CWE-78 (OS Command Injection), and others. This mapping is what lets a static analysis tool say "this finding is CWE-89, which rolls up to OWASP A03" automatically, and it's why pentest reports and bug bounty triage almost always cite both the CWE number and the OWASP category — the CWE is the precise technical classification, the OWASP category is the business-priority label.

### Risk rating: likelihood times impact, not just "does the bug exist"

A senior AppSec engineer never treats "found an instance of category X" as automatically critical. The OWASP Risk Rating Methodology (a companion project) scores likelihood (ease of discovery, ease of exploit, awareness, intrusion detection) against impact (financial, reputational, data sensitivity, compliance exposure) to produce an actual severity, because the same category of bug can be a P4 (SQL injection in an internal read-only reporting tool behind VPN and MFA) or a P0 (SQL injection in a public login form on a payments API) depending entirely on context.

### Decision table: which document to reach for

| You need to... | Reach for |
|---|---|
| Quick awareness training for developers | OWASP Top 10 |
| An objective, checklist-style verification standard for an audit | OWASP ASVS (Application Security Verification Standard) |
| Precise technical taxonomy for a specific bug | CWE (Common Weakness Enumeration) |
| API-specific risk guidance | OWASP API Security Top 10 |
| LLM/agent-specific risk guidance | OWASP Top 10 for LLM Applications |
| A specific threat model for YOUR application | STRIDE or PASTA threat modeling, done by your own team — no generic list substitutes for this |

### Where the list breaks down

The Top 10 is a category-level document; it says nothing about **chained** vulnerabilities, where two individually low-severity findings compose into a critical one (a low-severity information disclosure that leaks an internal hostname, chained with an SSRF that reaches it, chained with a misconfigured internal admin panel with no auth). Real-world breaches are almost always chains, not single Top 10 hits — which is exactly why threat modeling (A04's territory) and defense in depth matter more than checking ten boxes.
`,

  "internal-working": `
"How the Top 10 works" really means: how does raw vulnerability data become a ranked, published list? Here is the pipeline OWASP runs roughly every three to four years:

~~~mermaid
flowchart LR
    A["Vendors and testing firms\ncontribute anonymized findings\nfrom real assessments"] --> B["Findings normalized\nand mapped to CWE IDs"]
    B --> C["CWEs grouped into\ncandidate risk categories"]
    C --> D["Rank by incidence,\nexploitability, impact"]
    E["Practitioner survey:\nwhat deserves inclusion\nregardless of raw data?"] --> F["Top-voted survey categories\nmerged in"]
    D --> G["Draft Top 10\npublished for public comment"]
    F --> G
    G --> H["Community review period\n(GitHub issues, public feedback)"]
    H --> I["Final edition published\n(e.g. OWASP Top 10:2021)"]
~~~

Step by step:

1. **Data contribution**: organizations that run SAST, DAST, and manual pentests across many client applications donate de-identified results — this is why the list reflects what actual assessments find, not theoretical risk.
2. **CWE normalization**: every finding is tagged with a specific CWE ID so different vendors' terminology ("SQLi", "SQL injection", "database injection") collapses into one canonical weakness type.
3. **Category formation and ranking**: related CWEs are grouped (all injection types together, all crypto misuse together) and ranked using a formula weighing how many applications were affected, how easy the flaw is to find and exploit, and how severe a successful exploit tends to be.
4. **Survey overlay**: a separate, smaller number of survey-nominated categories is added on top of the data-ranked list — capturing risks the data underweights.
5. **Public draft and comment**: the draft list is published openly (historically as a GitHub repository) and the security community submits corrections, disputes, and evidence before the edition is finalized.

This is why the Top 10 is best understood not as "the ten worst bugs" but as "the ten categories our combined global evidence and expert judgment currently say deserve the most attention."
`,

  architecture: `
Rather than a runtime system architecture, "architecture" for the OWASP Top 10 means: how should a security program be structured around a software development lifecycle so that these ten risk categories are actually addressed at every stage, not just remembered during an annual audit?

### The secure-SDLC architecture

~~~mermaid
flowchart TB
    subgraph Design["Design"]
        TM["Threat modeling (STRIDE/PASTA)\ncatches Insecure Design (A04)\nbefore code is written"]
    end
    subgraph Code["Code"]
        SC["Secure coding standards +\npeer review\ncatches Injection (A03),\nBroken Access Control (A01)"]
        SAST["SAST in the IDE / pre-commit\ncatches Injection, crypto misuse"]
    end
    subgraph Build["Build"]
        SCA["Software Composition Analysis\ncatches Vulnerable Components (A06)"]
        SECR["Secrets scanning\ncatches leaked keys feeding A02/A07"]
        SIGN["Artifact signing / provenance\ncatches Integrity Failures (A08)"]
    end
    subgraph Test["Test"]
        DAST["DAST / dynamic scans\ncatches Misconfiguration (A05),\nInjection, SSRF (A10)"]
        PENTEST["Manual pentest\ncatches business-logic and\nAccess Control gaps automation misses"]
    end
    subgraph Deploy["Deploy"]
        IAC["IaC / config scanning\ncatches Security Misconfiguration (A05)"]
    end
    subgraph Runtime["Runtime"]
        WAF["WAF / rate limiting\nmitigates Injection, Auth Failures (A07)"]
        LOG["Centralized logging + SIEM\ncatches Logging/Monitoring Failures (A09)"]
    end
    Design --> Code --> Build --> Test --> Deploy --> Runtime
    Runtime -->|incident learnings feed back| Design
~~~

### Organizational structure

Mature AppSec programs pair a small central security team with a **security champion** embedded in each product team — someone who is not a full-time security engineer but who owns the checklist, triages SAST/DAST findings for their service, and escalates anything that needs the central team's depth. This is how the Top 10's ten categories scale to an organization with hundreds of services and a handful of dedicated security engineers: the central team builds the automated gates (SAST, SCA, secrets scanning) once, and champions apply judgment locally.
`,

  "data-flow": `
Tracing a single code change through a secure-SDLC checkpoint — the concrete way an organization operationalizes the Top 10 on every pull request:

~~~mermaid
sequenceDiagram
    participant Dev as Developer
    participant Repo as Git repository
    participant CI as CI pipeline
    participant SAST as SAST scanner
    participant SCA as Dependency (SCA) scanner
    participant Champ as Security champion
    participant DAST as Staging DAST scan
    participant Gate as Production deploy gate

    Dev->>Repo: open pull request (new endpoint + DB query)
    Repo->>CI: trigger pipeline
    CI->>SAST: scan changed files
    SAST-->>CI: finding: possible CWE-89 (SQL Injection, maps to A03)
    CI->>SCA: scan dependency manifest
    SCA-->>CI: finding: outdated library, known CVE (maps to A06)
    CI-->>Dev: pipeline fails, findings posted as PR comments
    Dev->>Repo: push fix (parameterized query, bump dependency)
    Repo->>CI: re-trigger pipeline
    CI->>SAST: re-scan
    SAST-->>CI: clean
    CI->>Champ: request review for auth-sensitive change
    Champ-->>CI: approve — access control logic verified against RBAC model
    CI->>DAST: deploy to staging, run baseline scan
    DAST-->>CI: no new findings
    CI->>Gate: all checks green
    Gate-->>Dev: deploy approved to production
    Note over Dev,Gate: Every OWASP category becomes an automated or human checkpoint,\nnot a once-a-year audit item.
~~~

The insight this diagram makes concrete: the Top 10 only creates value when its categories are wired into checkpoints that block or flag real changes. A document read once during onboarding and never operationalized into tooling changes nothing.
`,

  "production-usage": `
### As a secure-SDLC checklist

Teams turn each Top 10 category into a specific, automatable check rather than a vague reminder. In practice this means: SAST rules tagged by CWE/OWASP category running in CI (catches A03 Injection, parts of A02), SCA (software composition analysis) scanning every dependency manifest on every build (A06), secrets scanning on every commit (feeds A07 and A02), infrastructure-as-code scanning for public storage buckets and open security groups (A05), and DAST baseline scans against staging before every production deploy (A05, A03, A10).

### As a training curriculum

New-hire AppSec training is almost universally structured around the ten categories because it gives a shared, bounded syllabus: one module per category, each with a runnable vulnerable application (OWASP Juice Shop and WebGoat are the two most widely used free training targets) so developers exploit the bug themselves before learning the fix. This "break it yourself first" approach measurably improves retention over reading a policy document.

### As pentest and bug-bounty scoping language

Penetration test statements of work and bug bounty program policies routinely cite the Top 10 to set expectations: "in scope: findings mapped to OWASP Top 10 categories A01 through A10; explicitly out of scope: denial-of-service testing." Severity in a bug bounty triage queue is frequently anchored to which category a report maps to, combined with the OWASP Risk Rating Methodology for the specific likelihood and impact.

### As a compliance mapping anchor

PCI-DSS (the Payment Card Industry Data Security Standard) requirement 6.2.4 (in recent revisions) explicitly references addressing common software attacks including injection and other OWASP Top 10-style risks in custom code review processes. SOC 2 auditors, while not mandating the Top 10 by name, routinely accept "we run SAST/DAST mapped to OWASP Top 10 categories, with evidence" as part of the security criteria evidence package. Neither framework treats the Top 10 as sufficient on its own — it's a recognizable reference point layered under a broader control set.
`,

  "industry-examples": `
- **Equifax (2017)** — a public breach exposing roughly 147 million people's data, root-caused to an unpatched Apache Struts vulnerability: a textbook A06 Vulnerable and Outdated Components failure, compounded by A09 Logging and Monitoring failures that let the intrusion go undetected for months.
- **Capital One (2019)** — attacker exploited a misconfigured web application firewall to perform Server-Side Request Forgery against AWS's instance metadata service, retrieving temporary IAM credentials and then reading data from S3 buckets: the case study that made A10 SSRF a headline risk and directly motivated its addition to the 2021 list.
- **PortSwigger (maker of Burp Suite)** — builds its entire free Web Security Academy curriculum around Top 10-style categories (injection, access control, SSRF, and more), making it one of the most widely used hands-on training resources in the industry; referenced again in Videos and Practice Problems below.
- **HackerOne and Bugcrowd** (bug bounty platforms) — both organize public vulnerability disclosure statistics and program scoping documentation around OWASP-style categories, and publish annual reports showing which Top 10 categories dominate paid-out reports (access control and injection consistently rank highest).
- **Netflix, Google, and Microsoft** — all publish public secure-SDLC guidance (Netflix's paved-road security tooling, Google's BeyondCorp/zero-trust access model, Microsoft's Security Development Lifecycle) that maps directly onto Top 10 categories even where the Top 10 itself isn't cited by name — the categories describe the same underlying risks regardless of the internal program's branding.
`,

  "best-practices": `
1. **Treat the Top 10 as a floor, not a ceiling.** Passing a Top 10-focused scan is the minimum bar, not proof of security — pair it with real threat modeling for your specific application logic.
2. **Automate every category you can.** SAST for injection, SCA for vulnerable components, secrets scanning for credential leakage, IaC scanning for misconfiguration — humans should review what tools cannot, not everything.
3. **Fix root cause categories, not just symptoms.** A02 Cryptographic Failures and A07 Authentication Failures are frequently the same underlying mistake (weak secret handling) manifesting twice — see the Secrets Management skill.
4. **Default-deny access control.** Design RBAC/ABAC so every new endpoint starts with no access and permissions are explicitly granted, never the reverse — this single habit prevents most A01 findings.
5. **Parameterize, never concatenate.** Every interpreter boundary (SQL, shell, LDAP, HTML) needs a safe API that separates code from data — see SQL Injection and XSS for the concrete APIs.
6. **Validate allow-lists for outbound requests.** Any feature that fetches a user-influenced URL (webhooks, previews, imports) needs a strict destination allow-list to prevent A10 SSRF — never just "block private IP ranges" alone, since DNS rebinding and redirects bypass naive blocklists.
7. **Log security-relevant events, not everything.** Failed logins, access-control denials, and privilege changes need durable, centralized, alertable logs (A09) — verbose debug logs of application internals do not substitute for this.
8. **Pin and monitor dependencies continuously**, not just at release time — A06 vulnerabilities are disclosed daily against libraries you already shipped.
9. **Threat-model before building, not after a pentest finds the gap** — Insecure Design (A04) is cheapest to fix on a whiteboard.
10. **Rotate and vault every secret** — no credential, API key, or signing key belongs in source control, container images, or CI logs; see Secrets Management.
11. **Assume every category can chain.** Review findings for combinations (a low-severity info leak plus SSRF plus an exposed internal service) rather than triaging each in isolation.
12. **Re-scope your Top 10 usage as your app evolves.** An LLM-integrated feature introduces risks the classic Top 10 never anticipated — bring in the OWASP Top 10 for LLM Applications alongside it, not instead of it.
`,

  "anti-patterns": `
### "We ran a scanner once before launch" — treating the Top 10 as a one-time checkbox

~~~text
WRONG: Annual pentest, findings fixed, box checked, no further scanning until next year's audit.
RIGHT: SAST/SCA/secrets scanning on every commit; DAST on every staging deploy; pentest
       supplements continuous automation, it does not replace it.
~~~

### Chasing scanner output without triage

Automated tools produce false positives constantly, especially SAST for injection-style findings. Blindly "fixing" every flagged line without understanding exploitability wastes engineering time and trains developers to ignore the tool. Senior teams triage: reproduce, confirm exploitability, then fix — or explicitly suppress with a documented reason.

### Treating "not in the current Top 10" as "safe to ignore"

CSRF is the standing example: removed from the list since 2017 because framework defaults improved industry-wide, but a misconfigured CORS policy or a hand-rolled API can silently reintroduce it on your specific system. The list measures aggregate industry incidence, not your application's actual exposure.

### Fixing the symptom, not the category's root cause

~~~python
# WRONG: patch the one SQL injection a scanner found, leave the pattern everywhere else
def get_order(order_id):
    return db.execute("SELECT * FROM orders WHERE id = " + order_id)  # still concatenated

# RIGHT: fix the pattern at the data-access layer once, so it cannot recur
def get_order(order_id: int):
    return db.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
~~~

### Confusing compliance with security

"We are OWASP Top 10 compliant" is not a real, verifiable claim — the Top 10 is an awareness document, not a certification standard (that's what ASVS is for). Using this phrase in a security questionnaire response is itself a minor red flag to a knowledgeable reviewer.

### Ignoring business logic because it isn't a named category

Price manipulation in a checkout flow, coupon-stacking abuse, or a workflow that lets a "pending" order ship without payment confirmation are real, damaging vulnerabilities that no Top 10 category names directly — they require actual threat modeling of your specific application (A04's spirit, but the work is yours to do).
`,

  performance: `
### Measure first

Security controls have real latency and CPU cost — the senior move is to measure before and after adding a control, not assume it's free or assume it's too expensive to bother with.

~~~bash
# Baseline an endpoint before and after adding an authorization check / WAF rule / hashing step
hey -z 30s -c 50 https://staging.example.com/api/orders
# Compare p50/p95/p99 latency and error rate against the same run post-change
~~~

### The cost hierarchy of common security controls

1. **Authorization checks (A01 defenses)** — a well-indexed ownership lookup (WHERE user_id = current_user AND id = requested_id) is effectively free; the mistake to avoid is an N+1 query pattern checking permissions row-by-row instead of in one query.
2. **Password hashing (A02/A07 defense)** — intentionally slow by design. Bcrypt at a cost factor of 12 costs roughly 200 to 300 milliseconds per hash on typical server hardware; this is a feature (it slows attackers doing offline cracking), not a bug, but it means login endpoints should never hash synchronously in a request path shared with latency-sensitive traffic without capacity planning for it. See the Hashing skill for tuning cost factors against your actual threat model.
3. **TLS handshakes (A02 defense)** — a full TLS 1.3 handshake costs one network round trip; session resumption (session tickets) reduces repeat-connection cost to near zero. Terminate TLS at a load balancer or CDN edge to amortize this across many backend instances rather than doing it per application server. See TLS and HTTPS.
4. **WAF / rate limiting (A03, A07, A10 defense)** — a well-tuned reverse-proxy WAF typically adds low single-digit milliseconds of latency; the real cost is false-positive tuning time, not runtime overhead.
5. **Structured security logging (A09 defense)** — the risk is blocking the request path on synchronous log writes; use async/buffered logging shipping to a central sink so security visibility never becomes a latency bottleneck.
6. **SAST/DAST/SCA in CI** — these cost CI minutes, not production latency; the optimization lever here is scanning only changed files/dependencies incrementally rather than a full scan on every commit, to keep pipeline feedback fast enough that developers don't route around it.
`,

  scalability: `
Security programs scale the same way engineering organizations do: centralize what can be automated, distribute what needs judgment, and never let manual review become the bottleneck on release velocity.

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| Manual pentest cannot keep pace with daily deploys | Continuous automated SAST/DAST/SCA in CI; reserve manual pentest for high-risk changes and periodic full-app coverage |
| Central security team cannot review every PR across hundreds of services | Security champion model — one embedded reviewer per team, escalating only genuinely hard cases centrally |
| Threat modeling doesn't scale to hundreds of features | Lightweight, templated per-feature threat model (a one-page STRIDE pass) required only for new trust-boundary-crossing features, not every PR |
| Secrets sprawl across dozens of microservices | Centralized secrets manager/vault with per-service scoped access, not per-service .env files |
| Authorization logic duplicated and drifting across services | Centralize policy in a shared RBAC/ABAC service or library so access-control bugs are fixed once, not per-service |
| Dependency vulnerability alerts overwhelm teams | Auto-triage by exploitability and reachability (is the vulnerable code path actually called?), not raw CVE count |

### Structural diagram

~~~mermaid
flowchart TB
    Central["Central AppSec team\n(tooling, standards, deep incident response)"]
    Champ1["Security champion — Team A"]
    Champ2["Security champion — Team B"]
    Champ3["Security champion — Team C"]
    Central -->|builds and maintains gates| SAST["Shared SAST/SCA/secrets CI gates"]
    Central -->|trains and supports| Champ1
    Central -->|trains and supports| Champ2
    Central -->|trains and supports| Champ3
    Champ1 --> SAST
    Champ2 --> SAST
    Champ3 --> SAST
~~~

The horizontal story: as the organization grows from one team to a hundred, the central team's headcount grows sub-linearly because its leverage is tooling and standards, while champion count grows linearly with team count — this is the only ratio that scales.
`,

  security: `
This section is deliberately meta: since the whole page is about security, here is the attack surface and defense posture around **how the Top 10 itself gets used**, plus where to go for depth on each category.

### Attackers do not read your compliance checklist

Real attackers do not care which categories are in the current edition — they exploit whatever is easiest to reach, then chain it with the next weakness they find. A "Top 10 clean" scan result is not evidence of security against a determined, chained attack; it is evidence that the ten most common categories were checked. Defense in depth (multiple independent controls, so one failure doesn't cascade into full compromise) matters more than any single category being clean.

### Mapping every sibling skill to its category, precisely

- **A01 Broken Access Control** — see **RBAC** and **ABAC** for how to design the authorization model itself, and **Cookies and Sessions** for how identity is carried between requests without letting session fixation or hijacking undermine the access-control decision.
- **A02 Cryptographic Failures** — see **Encryption** (protecting data confidentiality at rest and in transit), **Hashing** (integrity and one-way password storage), and **TLS and HTTPS** (transport-layer protection and certificate trust).
- **A03 Injection** — see **SQL Injection** (the classic database case) and **XSS** (injection into the browser's DOM, folded into this category since 2021).
- **A05 Security Misconfiguration and A07 Identification and Authentication Failures** — see **OAuth 2.0/OIDC** and **JWT** for delegated and token-based authentication done correctly, **Cookies and Sessions** for stateful web authentication, and **RBAC**/**ABAC** again for the authorization layer that sits immediately downstream of authentication.
- **A07 (credential-handling half) and A02 (secrets-as-crypto-material half)** — see **Secrets Management** for vaulting, rotation, and never committing keys.
- **CSRF** — not a standalone 2021 category (removed starting 2017), but see the dedicated **CSRF** skill for the mechanics and why misconfigured CORS or non-browser API clients can still reintroduce it.

### Supply-chain trust of the document itself

Only treat owasp.org and the official OWASP GitHub organization as authoritative sources for the Top 10's text — search results and third-party "cheat sheet" PDFs occasionally misquote category numbers or, in a few documented cases, have been used as phishing lures ("download our OWASP compliance checklist"). Verify against the primary source before citing a category in an audit.
`,

  testing: `
### The tool stack, by what it catches

~~~bash
# SAST (static analysis) — reads source code, catches A03/A02 patterns before runtime
semgrep --config p/owasp-top-ten ./src

# SCA (software composition analysis) — flags known-vulnerable dependencies (A06)
pip-audit
npm audit --audit-level=high

# Secrets scanning — catches committed credentials feeding A02/A07
gitleaks detect --source . --verbose

# DAST (dynamic analysis) — attacks a running app like an outsider would (A03, A05, A10)
docker run -t zaproxy/zap-stable zap-baseline.py -t https://staging.example.com
~~~

### Senior testing doctrine

- **Automated scanning covers breadth, manual pentest covers depth.** SAST/DAST/SCA reliably catch the mechanical, pattern-matchable categories (injection, known-vulnerable components, missing headers); they are weak at business logic and chained findings, which is what manual pentest and bug bounty programs are for.
- **Shift left, but don't skip right.** Catching a SQL injection at commit time (SAST) is cheaper than catching it in staging (DAST), which is cheaper than catching it in production (pentest or, worst case, an attacker) — but skipping DAST/pentest because SAST passed misses whole categories like SSRF and misconfiguration that only manifest at runtime.
- **Test the negative case for access control.** Don't just test that Alice can see Alice's data — explicitly test that Alice cannot see Bob's data by ID manipulation; this single test pattern catches the majority of real-world A01 findings.
- **Triage before trusting a scanner's severity rating.** A tool's default "critical" for a SQL injection finding in unreachable dead code is not actually critical; confirm reachability and exploitability before prioritizing a fix.
- **Re-run the full battery on every dependency bump**, not just your own code changes — a transitive dependency update can introduce A06 risk without a single line of your own code changing.
`,

  debugging: `
### Escalation path for triaging a reported vulnerability (internal finding, pentest result, or bug bounty submission)

1. **Reproduce it exactly, in an isolated environment** — never validate a security finding by testing against production if it can be avoided; use staging or a local sandbox.
2. **Classify it**: which CWE, which OWASP category, and — critically — is this a true positive or a scanner/reporter misunderstanding? Many bug bounty submissions misclassify low-impact information disclosure as high-severity.
3. **Assess real exploitability and impact** using the OWASP Risk Rating approach: how easy is discovery, how easy is exploitation, what data or systems are actually reachable if it succeeds?
4. **Check for chaining** — does this finding combine with anything else known (an SSRF plus an internal admin panel with no auth, for instance) to become worse than its individual rating suggests?
5. **Patch the root cause, not just the reported instance** — grep the codebase for the same anti-pattern elsewhere (see Anti-Patterns) before closing the ticket.
6. **Write a regression test that fails on the old code and passes on the fix**, so the same class of bug cannot silently reappear.
7. **Disclose and document**: update the internal vulnerability tracker with CWE/OWASP tags for trend reporting, and if it came through a bug bounty program, coordinate responsible disclosure timing with the reporter.

~~~text
# Quick manual checks worth running by hand during triage
curl -i https://staging.example.com/api/invoices?id=1002    # IDOR probe (A01)
curl -i https://staging.example.com/ -H "X-Forwarded-Host: evil.com"  # header trust probe (A05)
curl -i "https://staging.example.com/fetch?url=http://169.254.169.254/latest/meta-data/"  # SSRF probe (A10)
~~~
`,

  monitoring: `
### What to log per category, and why

Security monitoring exists to answer "did anyone actually attempt or succeed at this" after the fact — a control with no logging (A09 failure) means an incident is discovered by an outside party, or never discovered at all.

~~~python
import logging

security_log = logging.getLogger("security")

def handle_login(username: str, success: bool, ip: str) -> None:
    # Every failed login is a signal; aggregate to detect credential stuffing (A07)
    security_log.info(
        "login_attempt",
        extra={"username": username, "success": success, "ip": ip},
    )

def handle_access_denied(user_id: int, resource_id: int, action: str) -> None:
    # Access-control denials are the earliest signal of IDOR probing (A01)
    security_log.warning(
        "access_denied",
        extra={"user_id": user_id, "resource_id": resource_id, "action": action},
    )

def handle_outbound_fetch(url: str, allowed: bool) -> None:
    # Log every server-initiated outbound request; alert on blocked-destination attempts (A10)
    security_log.info("outbound_fetch", extra={"url": url, "allowed": allowed})
~~~

### What good monitoring alerts on

- A spike in failed logins from a single IP or against a single account (A07: credential stuffing / brute force).
- A single user ID generating an unusually high rate of access-denied events (A01: someone is probing for IDOR).
- Any outbound request blocked by an egress allow-list, especially targeting link-local or metadata-endpoint addresses (A10: SSRF attempt).
- New or unexpected dependency CVEs surfaced by continuous SCA scanning against your deployed manifest (A06).
- Any write to a security-sensitive configuration (IAM policy, security group, admin role grant) outside a change-managed deploy (A05, A01).

### The discipline that matters most

Centralize logs somewhere an attacker who compromises the application server cannot also delete them (a separate log-shipping pipeline to a SIEM or log aggregation service), and set alert thresholds low enough to catch a slow, patient attacker — the average real-world breach dwell time before detection is measured in many weeks to months in industry breach reports, precisely because A09 failures are so common.
`,

  deployment: `
### A hardened Dockerfile addressing A05 and A06 directly

~~~dockerfile
# Pin an exact, minimal base image — reduces attack surface and the A06 dependency footprint
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
# Install only what is declared and locked — no surprise transitive upgrades
RUN pip install uv && uv sync --frozen --no-dev

FROM python:3.12-slim
# Create a non-root user — limits blast radius if the app is ever compromised (A05 hardening)
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH"
# Never bake secrets into the image — they are injected at runtime from a vault (A02/A07)
# No ARG or ENV lines here carry API keys, DB passwords, or signing keys.
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Per-line justification: the slim, pinned base minimizes A06 exposure; the frozen lockfile install prevents unreviewed dependency drift; the non-root user limits what a successful exploit can do on the host; the deliberate absence of any secret-bearing ENV/ARG line prevents A02/A07 credential leakage into image layers (image layers are effectively permanent and often end up in a registry other people can pull).

### A CI security gate (conceptual pipeline stages)

~~~yaml
# .github/workflows/security-gate.yml (illustrative)
name: security-gate
on: [pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SAST (catches A03 injection patterns)
        run: semgrep --config p/owasp-top-ten --error
      - name: SCA (catches A06 known-vulnerable dependencies)
        run: pip-audit
      - name: Secrets scan (catches A02/A07 leaked credentials)
        run: gitleaks detect --source . --exit-code 1
      - name: IaC scan (catches A05 misconfiguration in Terraform/K8s manifests)
        run: checkov -d infra/
~~~

Every stage maps to a specific OWASP category so a failing pipeline tells the developer exactly which risk class blocked the merge, not just "security check failed."
`,

  "production-checklist": `
Before a web application takes real traffic:

- [ ] Every endpoint enforces server-side authorization (never trust a hidden form field or client-side check) — A01
- [ ] IDOR test performed on every resource-by-ID endpoint (can user A fetch user B's record by changing an ID) — A01
- [ ] All sensitive data encrypted at rest and in transit; TLS 1.2+ enforced, weak ciphers disabled — A02
- [ ] Passwords hashed with bcrypt/argon2/scrypt, never a fast general-purpose hash — A02
- [ ] All database queries parameterized; all HTML output contextually encoded — A03
- [ ] New trust-boundary-crossing features have at least a lightweight threat model on file — A04
- [ ] No default credentials anywhere; verbose error/debug output disabled in production — A05
- [ ] Security headers set (Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security) — A05
- [ ] Dependency scanning (SCA) runs continuously, not just at release — A06
- [ ] Rate limiting and account lockout/backoff on authentication endpoints; MFA available for sensitive accounts — A07
- [ ] Session cookies flagged HttpOnly, Secure, and SameSite appropriately — A07, CSRF
- [ ] CI/CD pipeline requires signed commits or artifact provenance; no unreviewed third-party build steps — A08
- [ ] Deserialization of untrusted data avoided, or done only with strict allow-listed types — A08
- [ ] Failed logins, access denials, and privilege changes are logged to a tamper-resistant, centralized store with alerting — A09
- [ ] Any server-initiated fetch of a user-influenced URL goes through a strict destination allow-list — A10
- [ ] Secrets pulled from a vault at runtime; none present in source control, images, or CI logs — Secrets Management
`,

  "common-mistakes": `
1. **Treating the Top 10 as exhaustive** — business logic flaws and application-specific abuse cases are never covered by a generic list; teams that stop at "we're Top 10 clean" miss most of their real risk.
2. **Confusing category rank with severity for your app** — A01 being ranked first industry-wide doesn't mean an A06 finding in your specific stack isn't your most urgent fix this quarter.
3. **Fixing scanner findings without understanding exploitability** — burns engineering trust in the tooling and doesn't actually reduce risk if the "fix" is cosmetic.
4. **Assuming framework defaults are permanent** — CSRF protection, secure cookie flags, and ORM parameterization are usually on by default, but a misconfiguration or an escape hatch (raw SQL, disabled CSRF middleware for an API route) silently removes them.
5. **Ignoring categories that don't map to a scanner finding** — A04 Insecure Design and A09 Logging/Monitoring Failures are rarely caught by automated tools; they require deliberate process (threat modeling, log review), not just "run a scanner."
6. **Not re-testing after a dependency upgrade** — A06 risk is continuous, not a one-time check at initial adoption.
7. **Logging too much or too little** — logging entire request bodies can itself leak sensitive data into log stores (a self-inflicted A02/A09 problem); logging nothing prevents detection entirely.
8. **Believing "not publicly exposed" is a real control** — internal-only services are still reachable via SSRF (A10), compromised laterally-moving attackers, or a misconfigured internal load balancer; "internal" is not "safe."
9. **Skipping threat modeling for AI/LLM features** because they don't map cleanly to a classic Top 10 category — those features need the OWASP Top 10 for LLM Applications' categories (prompt injection, insecure output handling) in addition to the classic ten.
10. **Using outdated category numbers** — quoting the 2017 list's numbering (when CSRF was already gone but the reshuffling since 2021 changed several ranks) in a 2021-and-later context creates confusion in audits and interviews; always state which edition year you mean.
`,

  "common-errors": `
| Mistake | Typical cause | Fix |
|---|---|---|
| SAST tool flags a "SQL injection" in code that's actually parameterized | Pattern-matching tool can't always see through an ORM abstraction layer | Manually verify; suppress with a documented justification, don't blanket-disable the rule |
| Pentest report cites an OWASP category that doesn't match the actual CWE | Reporter used the category loosely rather than checking the CWE mapping | Re-classify using the official CWE-to-category mapping before prioritizing |
| Team confuses 2017 and 2021 category numbers in a report | Both editions are still widely referenced online; numbering shifted between them | Always state the edition year explicitly (e.g. "A01:2021") in any written finding |
| "Top 10 compliant" claimed in a security questionnaire | Misunderstanding that the Top 10 is an awareness document, not a certification | Reference OWASP ASVS level or a real audit standard instead for compliance claims |
| DAST scan reports SSRF but the endpoint is unreachable from the internet | Scanner tests defaults without knowledge of network segmentation | Confirm actual network reachability before triaging severity |
| CSRF finding dismissed as "not applicable, not in the current Top 10" | Confusing "removed from the list" with "not a real risk" | Treat it as a live risk regardless of list membership; see the CSRF skill |
| Dependency scanner reports a CVE in a library function you never call | SCA tools flag by package version, not by reachability of the vulnerable code path | Prioritize by reachability analysis, not raw CVE count |
| Security logging fills disk and gets rotated out before anyone reviews it | No retention policy tied to detection window needs | Ship logs to a centralized store with a retention period long enough to catch slow attacks |
`,

  faqs: `
**Q: Is the OWASP Top 10 a law or a standard I have to follow?**
No. It is a voluntary, community-produced awareness document. No regulator mandates "OWASP Top 10 compliance" by that name, though frameworks like PCI-DSS reference addressing similar risk categories in custom code, and auditors often accept Top 10-aligned tooling as evidence within a broader control set.

**Q: Which edition should I study for interviews right now?**
The 2021 edition, since it's my confirmed, high-confidence reference and — as far as I can verify — the most recent full edition widely adopted at the time of writing. Always check owasp.org/Top10 for anything published after your source's knowledge cutoff before stating a category number as current fact.

**Q: Why was CSRF removed, and should I stop worrying about it?**
It was removed starting with the 2017 edition (not 2021, though many summaries conflate the two) because framework-level defenses became common enough to lower measured incidence industry-wide. You should not stop worrying about it — misconfigured CORS, hand-rolled APIs, or a disabled framework default can reintroduce it on your specific system. See the dedicated CSRF skill.

**Q: Does passing an OWASP-Top-10-focused scan mean my app is secure?**
No. It means the ten most common categories, as automated tooling can detect them, weren't found. It says nothing about your business logic, chained vulnerabilities, or risks the Top 10 doesn't cover at all (like most AI/LLM-specific risks).

**Q: How is the OWASP API Security Top 10 different from this list?**
It's a sibling project scoped specifically to API risks (like broken object-level authorization and excessive data exposure through API responses) that overlaps with but isn't identical to the general web-application Top 10 — use it specifically when your primary attack surface is an API rather than a full web UI.

**Q: Is there an OWASP list for AI/LLM applications?**
Yes — the **OWASP Top 10 for LLM Applications**, a distinct and much newer project addressing risks like prompt injection, insecure output handling, and training-data poisoning that this classic Top 10 was never designed to cover. See the Comparisons section, and this platform's **AI Red Teaming** and **Prompt Injection Defense** skills for the deep dive.

**Q: Do I need to memorize all ten category names for an interview?**
Yes, in practice — it is one of the most commonly asked application-security interview topics, and being unable to name and give an example of each signals shallow security exposure. See Interview Questions and Flash Cards below.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the OWASP Top 10?* A community-produced, periodically updated awareness document ranking the ten most critical web application security risk categories, built from contributed vulnerability data plus a practitioner survey. It is not a compliance checklist or exhaustive vulnerability list.
2. *Name three categories from the 2021 edition and give an example of each.* Any three of the ten with a concrete example — e.g. A01 Broken Access Control (IDOR via URL ID manipulation), A03 Injection (SQL injection via string concatenation), A06 Vulnerable and Outdated Components (Log4Shell in Log4j).
3. *What's the difference between authentication and authorization, and which OWASP categories cover each?* Authentication verifies identity (A07 Identification and Authentication Failures); authorization decides what an authenticated identity is allowed to do (A01 Broken Access Control). They are separate categories because they fail independently.
4. *What is SQL injection and how do you prevent it?* Untrusted input interpreted as SQL syntax rather than data, usually from string concatenation; prevented with parameterized queries/prepared statements, never string-building queries with user input.
5. *Why was CSRF removed from the Top 10?* Framework-level defenses (anti-CSRF tokens, SameSite cookies) became common enough by the 2017 edition that measured incidence dropped, so it no longer ranked among the top ten by data — but it can still occur where those defenses are missing or misconfigured.

**Senior:**

6. *Walk through how the OWASP Top 10 list is actually compiled.* Contributed anonymized vulnerability data from vendors/testing firms, normalized to CWE IDs, grouped and ranked by incidence/exploitability/impact for roughly eight categories, plus a practitioner survey that added the remaining categories (Insecure Design and SSRF in 2021) regardless of raw data ranking. Strong answers explain why this matters for interpretation: the list reflects aggregate industry data, not your specific application's risk.
7. *Explain Server-Side Request Forgery and design a defense for a URL-preview feature.* The server fetches a URL supplied by the user and can be tricked into reaching internal-only resources (cloud metadata endpoints, internal admin panels); defenses include a strict destination allow-list (not a denylist), disabling redirects or re-validating the destination after each redirect hop, and network-level segmentation so the fetching service cannot reach sensitive internal endpoints even if application logic is bypassed.
8. *How would you scope a bug bounty program's severity using OWASP categories?* Map each report to its CWE and OWASP category first for classification, then apply the OWASP Risk Rating Methodology (likelihood factors like ease of discovery/exploit, impact factors like data sensitivity and business impact) for actual severity and payout tier — category alone is not sufficient for severity.
9. *A pentest finds a "low severity" information disclosure and a separate "low severity" SSRF. Why might you treat the combination as critical?* Chained vulnerabilities compose: the information disclosure might reveal an internal hostname the SSRF can then reach, turning two individually low findings into a path to full internal network access — the Top 10's category-level view doesn't model chains, so senior triage has to look across findings, not within one category at a time.
10. *How do you decide whether the current OWASP Top 10 is even the right framework for a given application?* If the attack surface is primarily an API, OWASP API Security Top 10 is more precise; if the application has LLM/agent components, the OWASP Top 10 for LLM Applications is required in addition; the classic Top 10 remains the right baseline for a traditional web application, but should never be the only lens.
11. *Design a secure-SDLC pipeline that operationalizes as many Top 10 categories as possible as automated gates.* SAST (A03/A02 patterns) and secrets scanning (A02/A07) at commit time, SCA (A06) on every dependency change, IaC scanning (A05) before deploy, DAST (A03/A05/A10) against staging, with manual pentest and lightweight threat modeling (A04) reserved for high-risk or novel features — see the Data Flow and Deployment sections for the concrete pipeline.
12. *Why is "OWASP Top 10 compliant" not a meaningful security claim?* The Top 10 is explicitly an awareness document with no formal verification criteria; a real compliance/verification claim should reference a standard designed for that purpose, like OWASP ASVS, with an actual audit trail behind it.
`,

  "coding-questions": `
### 1. Find and fix the Broken Access Control (A01) bug

~~~python
# VULNERABLE: fetches any invoice by ID with no ownership check
@app.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(404)
    return invoice   # BUG: never checks invoice.owner_id against current_user.id

# FIXED: ownership enforced server-side, in the same query (avoids a second round trip)
@app.get("/invoices/{invoice_id}")
def get_invoice_safe(invoice_id: int, current_user: User = Depends(get_current_user)):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.owner_id == current_user.id)
        .first()
    )
    if not invoice:
        # Same 404 whether it doesn't exist or belongs to someone else —
        # avoids leaking existence of other users' records (a minor A01/A04 detail)
        raise HTTPException(404)
    return invoice
~~~

Complexity/considerations: the fix is O(1) extra work — a single indexed WHERE clause, not a second query — so there is no performance excuse for skipping it. Follow-up: how would you test this automatically for every resource-by-ID endpoint in the codebase? (Answer: a generic authorization fuzz test that logs in as user A, enumerates known resource IDs, and asserts every response belonging to user B returns 403/404.)

### 2. Find and fix the Injection (A03) bug

~~~python
# VULNERABLE: string-built SQL, classic injection
def search_products(term: str):
    query = "SELECT * FROM products WHERE name LIKE '%" + term + "%'"
    return db.execute(query)

# FIXED: parameterized query — the driver escapes the value, never treats it as SQL
def search_products_safe(term: str):
    query = "SELECT * FROM products WHERE name LIKE %s"
    return db.execute(query, (f"%{term}%",))
~~~

Complexity/considerations: no performance cost to parameterization — prepared statements are frequently faster on repeated calls due to query plan caching. Follow-up: what if the search needs to support LIKE wildcards the user supplies themselves (e.g. searching for a literal percent sign)? (Answer: escape the wildcard characters in the parameter value before binding, never in the query string.)

### 3. Find and fix the SSRF (A10) bug

~~~python
# VULNERABLE: fetches whatever URL the user supplies, no destination check
import requests

def fetch_preview(url: str):
    return requests.get(url, timeout=5).content   # can reach internal-only hosts

# FIXED: strict allow-list of destination hosts, resolved and re-checked after redirects
import ipaddress
import socket

ALLOWED_HOSTS = {"images.trusted-cdn.com"}

def is_safe_destination(hostname: str) -> bool:
    if hostname not in ALLOWED_HOSTS:
        return False
    # Defend against DNS pointing an allowed hostname at an internal IP
    resolved_ip = socket.gethostbyname(hostname)
    return not ipaddress.ip_address(resolved_ip).is_private

def fetch_preview_safe(url: str):
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if not is_safe_destination(parsed.hostname or ""):
        raise ValueError("destination not allowed")
    response = requests.get(url, timeout=5, allow_redirects=False)  # re-check on redirect manually
    return response.content
~~~

Complexity/considerations: allow-lists (not deny-lists of "private" ranges) are required because deny-lists are trivially bypassed by DNS rebinding or redirect chains; disabling automatic redirect-following and re-validating each hop closes the redirect bypass. Follow-up: how would this change in a microservice architecture where the fetching service runs in the same network as sensitive internal services? (Answer: network-level segmentation — the fetching service should run in a network segment with no route to sensitive internals at all, so even a bypassed application check fails closed.)
`,

  "hands-on-labs": `
### Lab 1 — Break it yourself (beginner, about 2 hours)
Stand up OWASP Juice Shop (a deliberately vulnerable web app) locally with Docker and complete the beginner-tier challenges for Injection, Broken Access Control, and Security Misconfiguration. Deliverable: a short writeup per solved challenge naming the OWASP category, the CWE, and the one-line root cause. Skills exercised: recognizing each category by exploiting it firsthand, not just reading about it.

### Lab 2 — Automated scanning and triage (intermediate, about 3 hours)
Take any small web app repository (yours or a sample), run Semgrep with an OWASP-Top-10-mapped ruleset, run an SCA tool against its dependency manifest, and run an OWASP ZAP baseline scan against a running instance. Deliverable: a triage table (finding, CWE, OWASP category, true/false positive, fix or suppression justification). Skills exercised: distinguishing real findings from noise, the core daily skill of an AppSec engineer.

### Lab 3 — Threat model a real feature (advanced, about 4 hours)
Pick a feature with a genuine trust boundary (a file upload, a webhook receiver, or an admin impersonation feature) and run a lightweight STRIDE pass on it: for each of Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege, identify at least one concrete risk and a mitigation. Map any findings back to an OWASP category where one applies, and note explicitly where the risk is pure business logic that no Top 10 category names. Deliverable: a one-page threat model document. Skills exercised: the Insecure Design (A04) mindset, applied for real.

### Lab 4 — Wire a full CI security gate (production, about 5 hours)
Add SAST, SCA, secrets scanning, and IaC scanning to a real CI pipeline (GitHub Actions or equivalent) for a sample application, gating merges on all four passing, with each failure message stating the OWASP category it maps to. Then run a DAST baseline scan against a staging deploy as a separate pipeline stage. Deliverable: a working pipeline plus a short report of what each gate caught during setup. Skills exercised: the entire secure-SDLC section, operationalized end to end.
`,

  "real-projects": `
Portfolio-grade projects, each demonstrating skills employers screen AppSec-adjacent engineers for:

1. **Vulnerable-app pentest report** — Deploy OWASP Juice Shop or a similar intentionally vulnerable app, perform a structured manual pentest, and write a professional-grade report: executive summary, per-finding CWE and OWASP category, risk rating using the OWASP Risk Rating Methodology, and remediation guidance. Demonstrates: the exact deliverable a junior AppSec or pentest role produces daily.

2. **Security findings dashboard** — Build a small service that ingests SAST, SCA, and DAST tool output (even from open-source scanners), normalizes findings to CWE/OWASP categories, and exposes a dashboard showing trend lines per category over time and per repository. Demonstrates: the aggregation and prioritization tooling real AppSec teams build internally, plus general backend and data-visualization skills.

3. **A hardened reference application with a written security case** — Build a small full-stack app (auth, a resource users own, a search feature, a file upload) deliberately designed against every applicable Top 10 category from the start — parameterized queries, strict access control tests, secrets in a vault, security headers, structured security logging — and write a document explaining, category by category, what specific design or code choice defends against it. Demonstrates: end-to-end secure engineering judgment, not just finding bugs but building correctly the first time.

Each project should include: a CI pipeline with the security gates from the Deployment section, a written report or README mapping findings/decisions to specific OWASP categories and CWEs, and honest limitations (what a real threat model would still need to cover that this project doesn't).
`,

  "case-studies": `
### Equifax (2017) — A06 Vulnerable and Outdated Components, compounded by A09
An unpatched Apache Struts vulnerability, publicly known and patchable for months before exploitation, was used to breach data on roughly 147 million people. The intrusion also went undetected for an extended period. Lesson: dependency patching is not optional busywork — a known, patchable CVE left unpatched is one of the most preventable categories of catastrophic breach, and detection gaps turn a bad incident into a historic one.

### Capital One (2019) — A10 Server-Side Request Forgery
An attacker exploited a misconfigured web application firewall to perform SSRF against AWS's instance metadata service, retrieving temporary IAM credentials that were then used to access and exfiltrate data from S3 buckets, affecting over 100 million applicants and customers. Lesson: SSRF against cloud metadata endpoints is not a theoretical risk — it directly yields cloud credentials, and it's the exact case study that got SSRF added to the 2021 Top 10 by community survey.

### SolarWinds (2020) — A08 Software and Data Integrity Failures
Attackers compromised the build pipeline itself and shipped a trojanized software update, signed with the vendor's legitimate certificate, to thousands of downstream organizations including U.S. government agencies. Lesson: integrity failures in your build/deploy pipeline can be worse than a bug in your own code, because the compromise inherits your own trust relationship with every customer — this is exactly why A08 exists as its own category.

### Peloton API (2021) — A01 Broken Access Control
Security researchers found that Peloton's API allowed any authenticated user to query private account data (including data marked private) belonging to other users, because authorization checks on the API endpoints didn't verify the requester actually owned or should see the requested profile data. Lesson: access control has to be enforced on every single endpoint independently — a login requirement is authentication, not authorization, and the two failing together (or one failing while the other holds) is one of the most common real-world patterns behind A01 findings.
`,

  comparisons: `
| Document | Scope | Primary audience | Verification-style? |
|---|---|---|---|
| OWASP Top 10 | Ten highest-priority web app risk categories | Developers, engineering leadership, awareness training | No — awareness, not audit criteria |
| OWASP ASVS (Application Security Verification Standard) | Comprehensive, leveled, testable security requirements | Security architects, auditors, pentesters | Yes — explicitly designed for verification |
| CWE (Common Weakness Enumeration) | Hundreds of precise technical weakness types | Tool vendors, researchers, precise bug classification | Taxonomy, not a priority list |
| OWASP API Security Top 10 | Ten risks specific to API attack surface (object-level authorization, excessive data exposure, etc.) | Teams whose primary surface is an API, not a full web UI | No — awareness, API-scoped |
| OWASP Top 10 for LLM Applications | Ten risks specific to LLM/agent applications (prompt injection, insecure output handling, training data poisoning, etc.) | AI engineers, LLM application teams | No — awareness, newer and still evolving fast |
| CIS Controls / NIST SSDF | Broad organizational security control frameworks | CISOs, compliance and risk teams | Partially — structured controls, audited against |

**How seniors choose**: use the OWASP Top 10 for fast, shared-vocabulary awareness training and initial risk triage; reach for ASVS when you need an actual auditable checklist with pass/fail criteria; use CWE when you need to classify a specific technical finding precisely; bring in the API-specific or LLM-specific Top 10 the moment your primary attack surface shifts to an API or an LLM-integrated feature — using the classic web-focused Top 10 alone on an API-only or LLM-heavy product misses most of the real risk in both cases.
`,

  "related-technologies": `
- **SQL Injection** and **XSS** — the two classic injection mechanisms that make up A03; go here for the deep technical mechanics and defenses.
- **Encryption**, **Hashing**, and **TLS and HTTPS** — the three-part deep dive on A02 Cryptographic Failures, covering data-at-rest, data-integrity/password-storage, and data-in-transit respectively.
- **OAuth 2.0/OIDC** and **JWT** — delegated and token-based authentication mechanisms, central to A07 Identification and Authentication Failures.
- **Cookies and Sessions** — stateful web authentication fundamentals, also central to A07 and to why CSRF still matters despite its removal from the current list.
- **RBAC** and **ABAC** — the two dominant authorization models, the direct answer to A01 Broken Access Control.
- **Secrets Management** — vaulting, rotation, and credential hygiene underpinning both A02 and A07.
- **CSRF** — removed from the Top 10 since 2017 but still a live, distinct risk; see its own skill for the mechanics and modern SameSite-cookie-era defenses.
- **AI Red Teaming** and **Prompt Injection Defense** — the natural extension of this page's mindset into risks the classic Top 10 does not cover at all, governed instead by the OWASP Top 10 for LLM Applications.
- **OWASP ASVS, CWE, OWASP API Security Top 10** — the adjacent, non-platform-skill documents referenced throughout this page for when the classic Top 10 isn't precise or scoped enough on its own.

On this platform, the natural next pages after this capstone are the individual Security-category skills for depth on any category that concerns your current project, followed by **AI Red Teaming** and **Prompt Injection Defense** for the AI-specific extension.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff — check owasp.org/Top10 directly for anything more recent before citing a category number as current.

- **OWASP Top 10:2021** remains this page's confirmed, primary reference — the last full edition I can describe with high confidence in its exact category names, numbering, and rationale.
- **2023**: OWASP the organization renamed from "Open Web Application Security Project" to "Open Worldwide Application Security Project," reflecting a scope beyond the browser-centric web (mobile, cloud, APIs, and LLM applications).
- **OWASP Top 10 for LLM Applications**: launched in 2023 and has iterated through multiple revisions since, given how fast LLM application risks (prompt injection, insecure output handling, excessive agency) are evolving — this is the single fastest-moving OWASP project relevant to this platform's audience, and I recommend checking it directly rather than relying on any static summary, including this one.
- **OWASP API Security Top 10**: a maintained sibling project with its own periodic revisions, worth checking separately if your primary surface is an API.
- I am not confident whether a full numbered successor to the 2021 web-application Top 10 (a "2024" or "2025" edition) has been finalized by the time you are reading this — OWASP's historical cadence (roughly every three to four years) would place a plausible next edition in this general window, but treat that as a hypothesis to verify, not a fact.
`,

  "future-roadmap": `
Where this space is heading, and what deserves career investment:

1. **A next full revision is plausible but unconfirmed from here.** Given the historical three-to-four-year cadence (2017 to 2021), a further revision is a reasonable expectation; verify directly with owasp.org rather than assuming any specific year or content.
2. **The LLM-application Top 10 will keep maturing fast**, likely converging toward more stable, broadly agreed-upon categories as the industry accumulates more real incident data on prompt injection, agentic tool misuse, and data leakage through model outputs — this is the highest-growth adjacent area for an AI engineer to track, more so than the classic list itself.
3. **Automation keeps swallowing the mechanical categories.** Injection and known-vulnerable-component detection are increasingly caught earlier (IDE-integrated SAST, automatic dependency-update bots), which will likely keep pushing the industry's residual risk toward the categories automation struggles with: access control logic, insecure design, and business logic abuse.
4. **Verification-grade standards (like ASVS) will keep gaining ground over awareness lists** as organizations mature past "we did Top 10 training" toward "we can prove, checklist by checklist, that a control exists" for audit and customer-trust purposes.
5. **API and AI-specific attack surface will keep growing relative to classic browser-rendered web apps** — betting career time on understanding API security and LLM-application security specifically, on top of this page's foundation, is the highest-leverage move for an AI engineer over the next several years.

For your career: know the classic Top 10 cold for interviews and baseline hygiene, but invest your deeper study time in ASVS-style verification thinking and the LLM-application risk space, since that is where this platform's audience will spend most of their actual working risk surface.
`,

  "cheat-sheet": `
~~~text
OWASP TOP 10:2021 — ONE SCREEN

A01 Broken Access Control        -> enforce ownership server-side on every request
                                     see: RBAC, ABAC, Cookies and Sessions
A02 Cryptographic Failures       -> encrypt at rest/in transit, strong hashing, no weak TLS
                                     see: Encryption, Hashing, TLS and HTTPS
A03 Injection (incl. XSS)        -> parameterize queries, contextually encode output
                                     see: SQL Injection, XSS
A04 Insecure Design              -> threat-model before coding; no control fixes bad design
A05 Security Misconfiguration    -> no defaults, no verbose errors, security headers on
                                     see: OAuth 2.0/OIDC, JWT, Cookies and Sessions, RBAC, ABAC
A06 Vulnerable/Outdated Components -> continuous SCA scanning, patch fast (Log4Shell, Struts)
A07 Identification/Auth Failures -> rate limit, MFA, safe session handling
                                     see: OAuth 2.0/OIDC, JWT, Cookies and Sessions, RBAC, ABAC, Secrets Management
A08 Software/Data Integrity Failures -> verify signatures, avoid unsafe deserialization
A09 Security Logging/Monitoring Failures -> log denials and failed logins, centralize, alert
A10 Server-Side Request Forgery  -> allow-list destinations, re-check after redirects

REMOVED FROM CURRENT LIST, STILL REAL:
CSRF — dropped as standalone since 2017 (framework defaults improved); still occurs via
       misconfigured CORS or hand-rolled APIs. See: CSRF skill.

METHODOLOGY:
Contributed incidence data (CWE-mapped) -> ranks ~8 categories
Practitioner survey                     -> adds remaining categories (A04, A10 in 2021)

NOT COVERED HERE:
Business logic abuse, API-specific risk (-> OWASP API Security Top 10),
LLM/agent risk (-> OWASP Top 10 for LLM Applications; see AI Red Teaming,
Prompt Injection Defense skills)

USE IT FOR: awareness training, pentest/bounty scoping, SAST/DAST triage vocabulary
DON'T USE IT AS: a compliance certificate, a complete threat model, an exhaustive list
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What organization publishes the Top 10? | OWASP — the Open Worldwide Application Security Project (renamed from "Web" in 2023) |
| Is the Top 10 a compliance standard? | No — a data-driven awareness document; ASVS is the verification-style standard |
| Which category is ranked #1 in the 2021 edition? | A01 Broken Access Control |
| What replaced "Sensitive Data Exposure" in 2021, and why? | A02 Cryptographic Failures — renamed to point at the root cause, not the symptom |
| Which two 2021 categories came from the practitioner survey, not raw data? | A04 Insecure Design and A10 Server-Side Request Forgery |
| What did A03 Injection absorb in the 2021 edition? | Cross-Site Scripting (XSS) |
| When was CSRF removed as a standalone category, and why? | Starting with the 2017 edition — framework-level defenses lowered its measured incidence |
| What CWE-mapped category did Log4Shell fall under? | A06 Vulnerable and Outdated Components |
| What did the Capital One 2019 breach demonstrate? | A10 SSRF reaching cloud instance metadata to steal IAM credentials |
| What does A08 Software and Data Integrity Failures cover? | Insecure deserialization plus unverified CI/CD/build-pipeline and update integrity |
| Why does the Top 10 not catch most business logic flaws? | It's a generic category list; unique application logic requires real threat modeling, not a fixed checklist |
| What does OWASP ASVS add that the Top 10 doesn't? | Testable, leveled verification requirements suitable for an actual audit |
| What separate OWASP project covers LLM-specific risks? | The OWASP Top 10 for LLM Applications |
| What is the two-part compilation methodology? | Contributed CWE-mapped incidence data plus a practitioner survey overlay |
| What should you always state alongside a Top 10 category number? | The edition year (e.g. A01:2021), since numbering and category names have shifted across editions |
`,

  mcqs: `
**1. Which OWASP Top 10:2021 category was newly created (not renamed from a prior edition) to address missing threat modeling and abuse-case consideration?**

A) A01 Broken Access Control  B) A04 Insecure Design  C) A06 Vulnerable and Outdated Components  D) A09 Security Logging and Monitoring Failures

**Answer: B** — Insecure Design is a genuinely new 2021 category; the others are renamed/refocused continuations of prior editions' categories.

**2. A feature fetches a URL supplied by the user to generate a thumbnail. An attacker submits a cloud metadata endpoint address instead. Which category does this describe?**

A) A03 Injection  B) A05 Security Misconfiguration  C) A10 Server-Side Request Forgery  D) A08 Software and Data Integrity Failures

**Answer: C** — this is the textbook SSRF pattern, and the mechanism behind the Capital One breach.

**3. Why was CSRF removed from the Top 10 starting in 2017?**

A) It stopped being technically possible  B) Framework-level default defenses reduced its measured incidence  C) OWASP decided it was out of scope for web apps  D) It was merged into A03 Injection

**Answer: B** — widespread anti-CSRF tokens and SameSite cookie defaults lowered incidence in the contributed data, not because the underlying attack became impossible.

**4. What is the correct relationship between the OWASP Top 10 and CWE?**

A) They are competing, incompatible taxonomies  B) The Top 10 categories are each a curated grouping of specific CWE entries  C) CWE replaced the Top 10 in 2021  D) CWE only applies to network vulnerabilities, not application code

**Answer: B** — each Top 10 category rolls up multiple precise CWE identifiers, which is what lets tools map specific findings to the higher-level category.

**5. Which statement about how the 2021 list was compiled is accurate?**

A) Every category came purely from automated scanner statistics  B) It was decided entirely by a single OWASP board vote with no data  C) Eight categories came from contributed incidence data and two came from a practitioner survey  D) It is identical in method to a government-issued vulnerability disclosure list

**Answer: C** — this hybrid data-plus-survey methodology is specific to how OWASP compiles the Top 10, and explains why some categories (like A04 and A10) exist despite lower raw incidence data.

**6. Why is "we passed an OWASP Top 10 scan" not a sufficient security claim on its own?**

A) The Top 10 is outdated and irrelevant  B) Scans cannot detect business logic flaws, chained vulnerabilities, or risks outside the ten listed categories  C) OWASP requires a paid certification to make this claim  D) The Top 10 only applies to mobile apps

**Answer: B** — the Top 10 is a category-level awareness tool; it does not model business logic, vulnerability chains, or non-web-application risks like LLM-specific threats.
`,

  "revision-notes": `
**What it is, in five lines:** OWASP is a nonprofit, vendor-neutral foundation improving software security through free, community-produced work. The Top 10 is its flagship project: a periodically revised, data-driven awareness document ranking the ten most critical web application risk categories. It is built from contributed, CWE-mapped vulnerability data plus a practitioner survey — not from theory alone. It is explicitly not a compliance checklist, not exhaustive, and not a substitute for a real threat model of your specific application. This page's confirmed primary reference is the 2021 edition; verify anything claimed newer directly with owasp.org.

**The ten categories, compressed:** A01 Broken Access Control (enforce ownership server-side), A02 Cryptographic Failures (encrypt and hash correctly), A03 Injection including XSS (parameterize, encode), A04 Insecure Design (threat-model before coding), A05 Security Misconfiguration (no defaults, no verbose errors), A06 Vulnerable and Outdated Components (patch and scan continuously), A07 Identification and Authentication Failures (rate-limit, MFA, safe sessions), A08 Software and Data Integrity Failures (verify signatures, avoid unsafe deserialization), A09 Security Logging and Monitoring Failures (log and alert on denials and failed logins), A10 Server-Side Request Forgery (allow-list destinations). CSRF was removed as standalone since 2017 but remains a real risk where defaults are missing or misconfigured.

**How organizations use it:** as automated secure-SDLC gates (SAST for A03/A02, SCA for A06, secrets scanning for A02/A07, IaC scanning for A05, DAST for A03/A05/A10), as a shared training curriculum (Juice Shop, WebGoat), as pentest/bug-bounty scoping vocabulary, and as a citable reference point within compliance frameworks like PCI-DSS and SOC 2 — never as the sole compliance criterion itself.

**Where it maps to this platform's sibling skills:** SQL Injection and XSS for A03; Encryption, Hashing, and TLS and HTTPS for A02; OAuth 2.0/OIDC, JWT, Cookies and Sessions, RBAC, and ABAC for A01 and A07; Secrets Management for the credential-handling parts of A02/A07; and CSRF for the risk that no longer has a standalone category but is still real.

**Its limits, and what's next:** it does not cover business logic abuse, chained vulnerability paths, or AI/LLM-specific risk. For those, real threat modeling is irreplaceable, and the adjacent OWASP Top 10 for LLM Applications — backed on this platform by the AI Red Teaming and Prompt Injection Defense skills — is the necessary extension for anyone building LLM-integrated applications.
`,

  "learning-roadmap": `
A realistic path from zero to interview-ready and production-capable:

**Week 1 — Foundations.** Read Overview through Problem It Solves; understand what OWASP is and what the Top 10 is/isn't. Milestone: explain to a non-security colleague, in two sentences, why the Top 10 exists and its biggest limitation.

**Week 2 — The ten categories cold.** Beginner and Intermediate Concepts; memorize all ten names, numbers, and one example each. Do Hands-on Lab 1 (Juice Shop). Milestone: name all ten unprompted, with an example, in under two minutes.

**Week 3 — Methodology and internals.** Advanced Concepts, Internal Working, Architecture, Data Flow. Understand the CWE mapping and the data-plus-survey compilation method. Milestone: explain why CSRF isn't in the list without saying "it's not dangerous anymore."

**Week 4 — Production operationalization.** Production Usage through Security sections; do Hands-on Lab 2 (scanning and triage). Milestone: run SAST, SCA, and a DAST baseline scan against a real small app and triage the findings yourself.

**Week 5 — Quality, incident response, interview prep.** Testing through FAQs, then Interview Questions and Coding Questions. Do Hands-on Lab 3 (threat model a real feature). Milestone: fix all three Coding Questions from memory, unaided.

**Week 6 — Full pipeline and portfolio.** Hands-on Lab 4 (CI security gate) and one Real Project. Milestone: a working, documented secure-SDLC pipeline on your GitHub, with findings mapped to OWASP categories in the README.

After this capstone, continue to **AI Red Teaming** or **Prompt Injection Defense** on this platform — the same category-based awareness mindset, extended into the risks this classic Top 10 was never designed to cover.
`,

  "official-docs": `
- [OWASP Top 10 project page](https://owasp.org/www-project-top-ten/) — the authoritative source; always check here for the current edition before citing a category number.
- [OWASP Top Ten:2021 document](https://owasp.org/Top10/) — the full 2021 edition text, methodology, and per-category detail this page treats as primary reference.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — dense, practical, per-topic defensive guidance (SQL Injection Prevention, XSS Prevention, Authentication, and many more) that pairs directly with this page's categories.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — the verification-style standard to reach for when you need auditable, testable requirements rather than an awareness list.
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) — the API-scoped sibling project.
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — the fast-evolving AI/LLM-specific sibling project; check this directly rather than relying on any static summary given how quickly it iterates.
- [OWASP Web Security Testing Guide (WSTG)](https://owasp.org/www-project-web-security-testing-guide/) — step-by-step manual testing methodology per category.
`,

  books: `
- **The Web Application Hacker's Handbook** — Dafydd Stuttard and Marcus Pinto. The classic, deeply technical manual testing reference; still the best single book for learning to think like an attacker across every Top 10 category.
- **Alice and Bob Learn Application Security** — Tanya Janca. The most approachable, developer-friendly modern introduction, organized close to how real AppSec programs operate.
- **Threat Modeling: Designing for Security** — Adam Shostack. The definitive book on the A04 Insecure Design mindset — how to find flaws before they become code.
- **The Tangled Web** — Michal Zalewski. A dense, precise treatment of browser and web-platform security internals, essential for really understanding Injection and XSS at the mechanism level.
- **Real-World Bug Hunting** — Peter Yaworski. Case-study-driven, built entirely from real disclosed bug bounty reports mapped to recognizable vulnerability classes — excellent companion to this page's Case Studies section.
- **Security Engineering** — Ross Anderson. Broader than web application security, but foundational for understanding why security engineering as a discipline exists and how risk, not just bugs, should drive decisions.
`,

  blogs: `
- **OWASP.org project blogs and mailing lists** — where category changes and new project announcements (like LLM Top 10 revisions) are discussed first.
- **PortSwigger Web Security Academy** (portswigger.net/web-security) — free, hands-on labs and write-ups organized almost exactly along Top 10-style categories; the highest-signal free practical resource in the field.
- **Troy Hunt** (troyhunt.com) — real breach analysis and practical web security writing from the creator of Have I Been Pwned.
- **Google Project Zero blog** — deep, technical vulnerability research; higher-level than typical web-app Top 10 content but excellent for understanding exploitation depth.
- **Snyk blog** — strong, current coverage of dependency vulnerabilities and supply-chain risk (A06/A08 territory).
- **Krebs on Security** — real-world breach reporting that regularly maps back to a recognizable Top 10 category, good for building case-study intuition.
`,

  "research-papers": `
Honest caveat: the OWASP Top 10 itself is a practitioner document, not an academic one, and dedicated peer-reviewed papers analyzing it specifically are thin. The closest genuinely foundational reading instead comes from adjacent academic and industry-research work:

- **CWE (Common Weakness Enumeration) documentation and the CWE/SANS Top 25** — the closest thing to a rigorously maintained, cross-referenced technical taxonomy underlying the Top 10's category groupings.
- **Microsoft's Security Development Lifecycle (SDL) papers and Adam Shostack's threat modeling literature** — the closest formal treatment of the Insecure Design (A04) territory.
- **Verizon Data Breach Investigations Report (DBIR)**, published annually — not a single paper, but the closest thing to a rigorous, data-driven empirical study of what breach patterns actually look like industry-wide, and a good real-world check against the Top 10's category priorities.
- **"Writing Secure Code"** — Michael Howard and David LeBlanc. Older but foundational industry writing that predates and heavily influenced the secure-coding-practices thinking behind categories like Injection and Cryptographic Failures.

If your goal is genuinely academic depth rather than practitioner grounding, treat this page and the OWASP documents themselves as the primary source, and use the CWE/SANS Top 25 and DBIR as the closest empirically rigorous companions.
`,

  videos: `
- **PortSwigger Web Security Academy video walkthroughs** — practical, lab-paired explanations of nearly every Top 10 category, from a source widely regarded as the industry's best free hands-on training.
- **DEFCON and Black Hat talks on the Capital One and Equifax breaches** — multiple independent conference talks dissect both incidents in technical detail; searching either conference's published archive by breach name surfaces strong material for the Case Studies covered on this page.
- **LiveOverflow (YouTube)** — clear, exploit-focused explanations of web vulnerability classes, good for building genuine mechanistic intuition beyond definitions.
- **NahamSec (YouTube/Twitch)** — live bug bounty hunting sessions that show real Top 10-category triage and exploitation reasoning in practice.
- **OWASP AppSec Global conference keynotes** — recordings from OWASP's own annual conference, including talks by Top 10 project leads explaining methodology changes edition to edition.
`,

  "github-repos": `
- [OWASP/Top10](https://github.com/OWASP/Top10) — the official Top 10 project repository, including historical drafts and community discussion.
- [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) — the source for the practical, per-category defensive cheat sheets referenced in Official Docs.
- [juice-shop/juice-shop](https://github.com/juice-shop/juice-shop) — the intentionally vulnerable training application used in Hands-on Lab 1 and industry-wide onboarding.
- [WebGoat/WebGoat](https://github.com/WebGoat/WebGoat) — OWASP's own deliberately insecure Java training application, an alternative/complement to Juice Shop.
- [OWASP/wstg](https://github.com/OWASP/wstg) — the Web Security Testing Guide source, a step-by-step manual testing methodology mapped to categories.
- [OWASP/ASVS](https://github.com/OWASP/ASVS) — the Application Security Verification Standard's source repository.
- [returntocorp/semgrep-rules](https://github.com/semgrep/semgrep-rules) (Semgrep's public rule sets) — includes OWASP-Top-10-tagged static analysis rules usable directly in the CI gate shown in Deployment.
- [zaproxy/zaproxy](https://github.com/zaproxy/zaproxy) — OWASP ZAP, the free DAST tool used in the Testing and Hands-on Labs sections.
- [OWASP/www-project-top-10-for-large-language-model-applications](https://github.com/OWASP/www-project-top-10-for-large-language-model-applications) — the source repository for the LLM-application sibling project referenced throughout this page.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Category recall*: flashcard drill all ten category names, numbers, and one example each until you can produce them unprompted in under two minutes (see Flash Cards above).
2. *Hands-on exploitation*: complete OWASP Juice Shop's challenges tier by tier, starting with the ones explicitly tagged Injection and Broken Access Control.
3. *Guided labs by category*: PortSwigger Web Security Academy's labs, filtered by topic (Access control, SQL injection, SSRF, and so on) — each lab has a specific, verifiable "solved" state.
4. *Triage practice*: pull publicly disclosed reports from HackerOne's Hacktivity feed, filter by CWE, and practice re-classifying each into its OWASP category and estimating a risk rating before reading the program's own severity assessment.
5. *Full-chain thinking*: TryHackMe or HackTheBox web application rooms that require chaining two or more low-severity findings into a full compromise — the exact skill the Top 10's category-level view doesn't teach on its own.
6. *Pipeline building*: wire the CI security gate from Hands-on Lab 4 against three different sample applications of increasing complexity, tuning false-positive rates each time.

External sets: OWASP Juice Shop and WebGoat (self-contained, free), PortSwigger Web Security Academy (free, guided, extremely high signal), HackerOne Hacktivity (real disclosed reports, free to browse), TryHackMe's "Web Fundamentals" and "OWASP Top 10" learning paths (structured, some paid content).
`,

  "architecture-diagram": `
A reference defense-in-depth production architecture, showing which layer defends against which OWASP category:

~~~mermaid
flowchart TB
    Client["Client (browser / API consumer)"] --> CDN["CDN / edge — TLS termination\n(A02 defense)"]
    CDN --> WAF["WAF + rate limiting\n(A03, A07, A10 defense)"]
    WAF --> GW["API gateway — authn/authz enforcement,\ntoken validation (A01, A07 defense)"]
    GW --> SVC1["Service — parameterized queries,\noutput encoding (A03 defense)"]
    GW --> SVC2["Service — server-side ownership checks\non every resource (A01 defense)"]
    SVC1 & SVC2 --> DB[("Database — encrypted at rest,\nleast-privilege DB accounts (A02, A01 defense)")]
    SVC1 & SVC2 --> VAULT[("Secrets vault — no credentials\nin code or images (A02, A07 defense)")]
    SVC1 & SVC2 -->|outbound fetch, allow-listed| EXT["External services\n(A10-guarded egress)"]
    SVC1 & SVC2 --> LOG["Centralized security logging + SIEM\n(A09 defense)"]
    CI["CI/CD pipeline — SAST, SCA, secrets scan,\nsigned artifacts (A06, A08 defense)"] -.deploys.-> SVC1
    CI -.deploys.-> SVC2
~~~

Every layer in this diagram maps to a specific category from this page — the architecture itself is the practical answer to "how do I actually defend against the Top 10," not just a list to memorize.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OWASP Top 10))
    Organization
      OWASP — nonprofit, vendor-neutral
      Renamed 2023: Open Worldwide App Sec Project
      Adjacent projects: ASVS, API Top 10, LLM Top 10
    Methodology
      Contributed incidence data
      CWE mapping
      Practitioner survey overlay
      Risk Rating Methodology
    2021 Categories
      A01 Broken Access Control
        RBAC
        ABAC
        Cookies and Sessions
      A02 Cryptographic Failures
        Encryption
        Hashing
        TLS and HTTPS
      A03 Injection
        SQL Injection
        XSS
      A04 Insecure Design
        Threat modeling STRIDE PASTA
      A05 Security Misconfiguration
        OAuth 2.0 / OIDC
        JWT
      A06 Vulnerable and Outdated Components
        SCA scanning
      A07 Identification and Auth Failures
        OAuth 2.0 / OIDC
        JWT
        Cookies and Sessions
        Secrets Management
      A08 Software and Data Integrity Failures
        CI/CD pipeline integrity
      A09 Security Logging and Monitoring Failures
        SIEM centralized logging
      A10 Server-Side Request Forgery
        Allow-list egress
    Removed but relevant
      CSRF — gone since 2017
        CSRF skill
    Beyond the Top 10
      Business logic abuse
      OWASP API Security Top 10
      OWASP Top 10 for LLM Applications
        Prompt Injection Defense
        AI Red Teaming
    Practice
      Secure SDLC pipeline
      Pentest and bug bounty
      Compliance mapping PCI-DSS SOC2
~~~
`,
};

export default owaspTop10;
