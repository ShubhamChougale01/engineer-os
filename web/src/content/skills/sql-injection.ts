import type { SkillContent } from "../types";

/**
 * SQL Injection — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const sqlInjection: SkillContent = {
  overview: `
SQL injection (SQLi) is a code-injection vulnerability class where untrusted input changes the structure — not just the data — of a SQL query that an application sends to its database. It happens whenever application code builds a query by concatenating or string-formatting user-controlled input directly into SQL text, instead of keeping the query's grammar and the query's data in two separate channels. It is catalogued as CWE-89, and it is the flagship example behind OWASP's A03:2021-Injection category (see the **OWASP Top 10** skill for the umbrella framework this sits under).

For an AI engineer this is not legacy trivia. Every RAG backend, agent framework, and internal tool that lets a service (or a language model) read or write a relational database re-opens this exact risk. Natural-language-to-SQL features, agent "tool calls" that execute a query, and admin dashboards generated on a deadline are today's most common places SQL injection reappears — often written by engineers who assumed their ORM made the problem disappear. Treating a model's generated SQL, or a user's free-text search box, as anything other than fully untrusted input is how twenty-year-old vulnerabilities keep shipping in brand-new AI products.

Key characteristics: SQL injection is not a flaw in the SQL language itself, nor in the database engine — it is a flaw in how application code assembles queries. It is completely preventable with parameterized queries / prepared statements, a technique that has existed since the 1990s. And yet it remains one of the most frequently found, highest-severity issues in real-world penetration tests and bug bounty programs, because the *convenience* of string-building a query is only ever one keystroke away, and because ORMs — while safe by default — all ship an escape hatch back into raw SQL text that quietly reintroduces the bug.
`,

  history: `
SQL injection was first widely documented by **Jeff Forristal**, writing under the pseudonym "rain forest puppy," in a 1998 article published in Phrack magazine describing how untrusted input could be used to manipulate Microsoft SQL Server queries through ODBC error messages. The technique itself likely existed informally before that, but this is the commonly cited origin of the public, named vulnerability class.

| Year | Milestone |
|------|-----------|
| 1998 | Jeff Forristal (rain forest puppy) publishes the first widely-cited public description of SQL injection, targeting Microsoft SQL Server / ODBC error messages |
| 2000–2004 | Technique spreads through the early penetration-testing and web-hacking community; early manual and semi-automated exploitation tools appear |
| 2005–2009 | Mass automated "SQLi worm" campaigns (commonly associated with the Asprox botnet and similar tooling) scan the open web for concatenated-query patterns in ASP/PHP sites and mass-inject malicious script tags at scale |
| 2009 | The RockYou breach is reportedly linked to SQL injection, exposing roughly 32 million plaintext passwords — later becoming a foundational password-research dataset (hedge: details drawn from public reporting, not an official technical postmortem) |
| 2010 | sqlmap is publicly released and becomes the de facto open-source tool for automated SQL injection detection and exploitation |
| 2013 | The OWASP Top 10 (2013 edition) places Injection — with SQLi as its flagship example — at the number one spot |
| 2015 | The TalkTalk (UK telecom) breach is widely reported as resulting from SQL injection against a legacy web page, becoming a landmark case tied to a record UK regulatory fine |
| 2017 | OWASP Top 10 2017 keeps Injection at number one |
| 2021 | OWASP Top 10 2021 restructures the list; SQL injection now sits under the broader **A03:2021-Injection** category alongside NoSQL, OS command, and LDAP injection |
| 2020s | Despite two decades of known, cheap fixes, injection remains consistently present in bug bounty and pentest findings; a new surface emerges as LLM agents generate and execute SQL on an app's behalf |

The pattern worth noticing across this whole timeline: the vulnerability class has been "solved" at the technical level since prepared statements became common, yet it never disappears — because new code is written every day by engineers who don't yet know the rule, and because ORMs keep a raw-SQL door open for the cases their query builder can't express.
`,

  "why-it-exists": `
SQL injection exists because of one design choice repeated across decades of database-access libraries: an application builds a single string containing both the trusted SQL keywords it wrote and the untrusted data a user supplied, then hands that one string to the database to parse from scratch.

Before parameterized query APIs were common — and even today, whenever a developer reaches for string formatting instead — this concatenation approach was the obvious, easiest way to build a dynamic query: "SELECT * FROM users WHERE id = " plus whatever the user typed. The database has no way to know, once it receives that single string, which part was written by the trusted developer and which part arrived over the network from an anonymous visitor. It just tokenizes and parses the whole thing as SQL grammar. If the attacker's input happens to contain SQL syntax (a quote, a keyword, a comment marker), the parser treats it as *code*, not as the *data* it was supposed to be.

This is the same root cause behind an entire family of injection vulnerabilities — OS command injection, LDAP injection, XML/XXE, and even cross-site scripting (see the **XSS** skill) — the confusion of a code channel and a data channel into one string. SQL injection exists, specifically, because relational databases became the default persistence layer for essentially all web applications, and for a long time the standard way to talk to them was to build query text by hand.
`,

  "problem-it-solves": `
Learning SQL injection deeply solves a very concrete problem for a defender: how do you stop an attacker from reading, modifying, or deleting arbitrary data — or in the worst case executing operating-system commands via database extensions — through your application's normal, legitimate database connection? Mastering this topic also solves a subtler organizational problem: it replaces the false confidence of "we use an ORM so we're safe" with precise knowledge of exactly which ORM APIs are safe by construction and which ones are raw-SQL escape hatches in disguise.

Because so much software touches a relational database, this is arguably the single highest-leverage security topic a working engineer can learn — one habit (always parameterize) prevents an entire class of critical-severity findings across every project you'll ever ship.

What this page deliberately does **not** cover in depth: **NoSQL injection** (operator injection against document databases like MongoDB) is a related but mechanically distinct class — different syntax, same root cause — and gets only a brief comparison here. **OS command injection**, **LDAP injection**, and **XML External Entity (XXE)** attacks share the same code/data-confusion root cause but are different vulnerability classes with their own defenses. And critically: nothing here replaces general secure-coding practice — output encoding for **XSS**, anti-forgery tokens for **CSRF**, or encrypting data at rest and in transit (see **Encryption**, **Hashing**, and **TLS & HTTPS**) are separate controls covered on their own skill pages.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, in terms of code/data confusion, exactly why string-concatenated SQL queries are exploitable.
2. Recognize and (in an authorized lab) construct classic in-band injection — union-based and error-based — against a deliberately vulnerable endpoint.
3. Recognize and construct blind SQL injection — boolean-based and time-based — when no direct query output is visible to the attacker.
4. Explain out-of-band injection and second-order injection, each with a concrete worked scenario.
5. Identify the specific raw-SQL escape hatches in SQLAlchemy, the Django ORM, and Sequelize that reintroduce injection risk despite using an ORM.
6. Write correct parameterized queries / prepared statements in Python (psycopg2 and SQLAlchemy) and at least one other language (Node.js, Java, or PHP).
7. Design a layered defense — parameterization, allowlisting, least-privilege database accounts, and a WAF — and explain precisely why each layer alone is insufficient.
8. Use sqlmap against an authorized target and interpret its findings responsibly.
9. Add a CI static-analysis rule (or code-review checklist item) that blocks string-built SQL from merging.
10. Answer SQL injection interview questions at both a junior level (recognize and fix) and a senior level (systemic prevention, internals, defense-in-depth architecture).
`,

  prerequisites: `
- **Required**: basic SQL — SELECT/INSERT/UPDATE/WHERE and simple joins (see the **PostgreSQL** and **MySQL** skills); a basic understanding of how a web application takes user input from a request and passes it somewhere in the backend; the HTTP request/response model.
- **Helpful**: the **OWASP Top 10** skill for the framework SQL injection sits inside (A03:2021-Injection); the **Python** skill, since the primary code examples use psycopg2 and SQLAlchemy; general familiarity with any ORM (Django ORM, Sequelize, Prisma).
- **Not required**: prior offensive-security experience — this page builds every technique from a plain, safe query upward.

Dependency links: **PostgreSQL** / **MySQL** (the layer this attack targets) → this page → **OWASP Top 10** (the umbrella framework) → **XSS**, **CSRF**, **Encryption**, **Hashing**, **TLS & HTTPS**, **Secrets Management** round out the Security category.
`,

  "beginner-concepts": `
### What a normal, safe-looking query is built from

A web app almost always needs to insert a value the user provided — a username, an ID, a search term — into a query. The vulnerable, naive way to do that is string concatenation:

~~~python
# VULNERABLE: user input concatenated directly into SQL text
username = request.form["username"]
password = request.form["password"]

query = (
    "SELECT * FROM users WHERE username = '" + username +
    "' AND password = '" + password + "'"
)
cursor.execute(query)
~~~

If username and password only ever contain ordinary letters, this "works." The bug is that nothing stops an attacker from typing SQL syntax into that box.

### The classic authentication bypass

Suppose an attacker enters admin' -- as the username (anything as the password). The resulting query text becomes:

~~~sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'anything'
~~~

In SQL, two dashes start a comment that runs to the end of the line. Everything after -- is discarded by the parser, including the password check. The database happily returns the admin row with no valid password required — because the *structure* of the query changed, not just the data inside it.

### The OR '1'='1 trick

Entering ' OR '1'='1 as the username turns the WHERE clause into a condition that is always true for every row, often returning the very first user in the table (frequently an administrator):

~~~sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'
~~~

### UNION-based basics

The SQL UNION keyword combines the results of two SELECT statements, provided they return the same number of columns with compatible types. An attacker who finds an injectable field first probes the column count — commonly with ORDER BY 1, ORDER BY 2, … until an error appears — then submits a payload like:

~~~sql
' UNION SELECT username, password FROM users --
~~~

into a search box or ID parameter, causing the application to render (or otherwise expose) rows from a completely different table than the one the page was designed to query.

### Where injection points hide

Untrusted input is not limited to obvious form fields. Anywhere data crosses into a query is a candidate: URL query parameters, form fields, HTTP headers (User-Agent, X-Forwarded-For, Referer), cookies, JSON request bodies, and even file names or upload metadata that later gets used in a query.
`,

  "intermediate-concepts": `
### Error-based injection

Error-based injection abuses an application that displays raw database error messages to the user. A crafted payload intentionally causes a type-conversion or function error that leaks a piece of data inside the error text itself — for example, forcing a CAST failure or using a function like MySQL's extractvalue() so the database's own error message embeds the value the attacker wants to read. This technique only works because the application compounds one vulnerability (SQLi) with another (verbose error disclosure).

### Blind boolean-based injection

When the page shows no query output and no error text, but its *behavior* still differs based on whether an injected condition is true or false, an attacker can extract data one bit at a time:

~~~sql
' AND 1=1 --
' AND 1=2 --
~~~

The first payload keeps the original query's truth value unchanged (page looks "normal"); the second forces it false (page looks different — a missing record, an empty list, a different HTTP status). By replacing 1=1 with a condition like SUBSTRING of a secret value compared character-by-character, an attacker can reconstruct the whole value through repeated true/false questions.

### Blind time-based injection

If the page behaves *identically* regardless of the injected condition — no visible content or status difference at all — an attacker can still infer true/false using response latency:

~~~sql
' AND (SELECT CASE WHEN (1=1) THEN pg_sleep(5) ELSE pg_sleep(0) END) --
~~~

A five-second delay confirms the condition was true; an instant response confirms it was false. This is the slowest extraction technique but works even when no other channel leaks information.

### Out-of-band (OOB) injection

When neither in-band output nor timing differences are usable (for example, fully asynchronous or queued processing), an attacker may try to make the database itself initiate an outbound connection — a DNS lookup or HTTP request — carrying the stolen data as part of the destination address, using database-specific extended functions. This only works when the network allows the database server to reach the outside world, which is exactly why network egress restrictions on database hosts matter as a defensive control.

### Second-order injection

A payload can be stored safely — properly escaped or parameterized on the way in — and only become dangerous later, when a *different* part of the application reads that stored value and concatenates it, unsafely, into a new query without re-validating it. A classic example: a user sets their display name to a value containing SQL syntax during signup (safely parameterized on insert), and months later an internal admin report builds a query by directly interpolating that stored display name. The bug is not at the entry point — it is at the second, unguarded use. "We already validated this on input" is a false sense of security; every query construction site needs its own parameterization, not just the first one.

### ORM raw-SQL escape hatches

Every mainstream ORM ships an escape hatch for queries its builder can't express — and every one of those escape hatches can reintroduce SQL injection if fed a formatted string instead of bound parameters.

~~~python
# SQLAlchemy — VULNERABLE: f-string built raw SQL
from sqlalchemy import text
name = request.args["name"]
result = conn.execute(text("SELECT * FROM users WHERE name = '" + name + "'"))

# SQLAlchemy — SAFE: bound parameter
result = conn.execute(
    text("SELECT * FROM users WHERE name = :name"),
    {"name": name},
)
~~~

~~~python
# Django ORM — VULNERABLE: .raw() with string formatting
User.objects.raw("SELECT * FROM auth_user WHERE username = '%s'" % username)

# Django ORM — SAFE: .raw() with parameter placeholders
User.objects.raw("SELECT * FROM auth_user WHERE username = %s", [username])
~~~

~~~javascript
// Sequelize — VULNERABLE: string-built raw query (no template literal needed to be unsafe)
const name = req.query.name;
const rows = await sequelize.query(
  "SELECT * FROM users WHERE name = '" + name + "'"
);

// Sequelize — SAFE: bind parameters via replacements
const rows = await sequelize.query(
  "SELECT * FROM users WHERE name = :name",
  { replacements: { name: name }, type: sequelize.QueryTypes.SELECT }
);
~~~
`,

  "advanced-concepts": `
### Stacked queries

Some drivers and configurations allow a single call to execute multiple semicolon-separated statements in one round trip. If reachable, an attacker with an injection point can append an entirely new statement — INSERT, UPDATE, DROP — rather than only manipulating the original SELECT. Most modern drivers disable multi-statement execution by default precisely because of this risk; leaving it enabled "for convenience" is a meaningful risk multiplier.

### Detection methodology as a decision table

| Signal available to the attacker | Technique | What confirms it |
|---|---|---|
| Query results rendered on the page | In-band / UNION-based | Extra rows/columns appear from injected UNION SELECT |
| Raw database errors shown | Error-based | Data leaks inside a crafted type-conversion error message |
| Page content/behavior differs, no errors shown | Blind boolean-based | True/false payloads produce different responses |
| No visible difference at all | Blind time-based | SLEEP()/pg_sleep()-induced delay confirms truth value |
| No in-band or timing channel usable | Out-of-band | DNS/HTTP callback initiated by the database carries data out |

### Second-order and stored-context injection in depth

Beyond the display-name example, second-order injection commonly hides in: audit/logging pipelines that later replay stored request data into an analytics query; batch/ETL jobs that read "already validated" rows from one table and build a query against another; and multi-tenant systems where a value trusted in one tenant's context is unsafely reused in a cross-tenant admin query.

### Why blocklisting and naive "sanitization" fail

Removing or escaping single quotes is not a fix, only an obstacle a determined attacker routes around: numeric-context injection needs no quotes at all (id=1 OR 1=1 with no string literal in sight); comment syntax, alternate whitespace, case variation, and encoding (URL-encoding, double encoding, Unicode homoglyphs) all defeat naive filters; and blocklists reliably break legitimate input too — a last name like O'Brien should not be rejected or mangled by a filter that treats every quote as an attack.

### WAF evasion, understood defensively

Web application firewalls work largely on signatures and heuristics, and determined attackers evade them with inline SQL comments to split keywords, alternate encodings, case randomization, and equivalent-but-differently-shaped SQL constructs. This is presented here purely as the reason a WAF is a compensating control, never the primary defense — the only control that structurally cannot be evaded this way is parameterization, because it never lets attacker input reach the SQL parser as code in the first place.

### A related but distinct class: NoSQL injection

Document databases like MongoDB don't parse SQL text, but they have their own version of the same root cause: if user input is passed directly as a query *object* rather than a plain value, operators like a "not-equal" or "greater-than" operator can be injected to alter query logic (for example, turning a password-equality check into an always-true comparison). The fix is structurally similar — never let untrusted input become part of the query's structure; validate the expected shape and type of every field before it's used in query construction.

### The AI-era surface: LLM-generated SQL

Natural-language-to-SQL features and agent "tools" that let a language model query a database reopen this entire vulnerability class at a new layer. A model can be tricked — via prompt injection in the data it reads, or simply by an ambiguous user request — into producing a query that reads or modifies more than intended. The correct mental model: treat model-generated SQL exactly like untrusted user input. Never execute it directly against a privileged connection; route it through the same parameterized templates or an allowlisted query builder, and run it under a read-only, least-privilege database role (see the **OWASP Top 10** skill's discussion of injection, and the platform's LLM-focused skills for the broader "excessive agency" risk pattern).
`,

  "internal-working": `
The difference between a safe and an unsafe query comes down to *when* the database parser sees the attacker's data relative to when it decides the query's grammar.

~~~mermaid
flowchart TB
    subgraph Unsafe["Concatenated query"]
        A1["App builds one string:\nSQL keywords + user input mixed together"] --> A2["Entire string sent to DB"]
        A2 --> A3["Parser tokenizes the WHOLE string as SQL grammar"]
        A3 --> A4["Attacker's syntax characters (quotes, --, UNION)\nbecome real SQL tokens"]
        A4 --> A5["Query executes with ATTACKER-CONTROLLED structure"]
    end
    subgraph Safe["Parameterized query"]
        B1["App sends a query TEMPLATE with placeholders (e.g. WHERE id = $1)"] --> B2["DB parses and plans the template ONCE"]
        B2 --> B3["App sends parameter VALUES separately, after parsing"]
        B3 --> B4["Values are bound into the already-fixed plan\nas pure data, never re-tokenized as SQL"]
        B4 --> B5["Query executes with the ORIGINAL structure, always"]
    end
~~~

Step by step for the safe path: (1) the driver sends the query text containing placeholders (dollar-numbered in Postgres, question marks in MySQL/JDBC, named parameters in many ORMs) to the database; (2) the database's parser tokenizes and plans *only* the template — at this point it has already fixed the query's grammar, before ever seeing the values; (3) the application then sends the actual parameter values in a separate message; (4) the database binds those values into the fixed plan as literal data, never re-running them through the SQL tokenizer. There is no code path by which a bound parameter value can add a keyword, a comment, or an extra clause, because parsing already finished before the value arrived.

Contrast that with the unsafe path: the entire string — developer's SQL and attacker's input, indistinguishable at this point — is handed to the parser in one shot, and it is tokenized from scratch. If the attacker's substring happens to contain a quote, a semicolon, or the word UNION, the parser has no way to know that "wasn't supposed to be code." It just parses what it received.

A useful side effect of this internal difference: because the query template is fixed and reused, most production databases can cache its execution plan and skip re-planning on every call (see Performance) — parameterization isn't just the security fix, it's usually also the faster path.
`,

  architecture: `
A senior engineer designs for SQL injection at two levels: the shape of a single request through the code, and the layered controls around the whole system so that a single mistake never becomes a full compromise.

### Request-path architecture (where parameterization must live)

~~~mermaid
flowchart LR
    Client["Client request"] --> API["API / controller layer\n(parses & validates input shape)"]
    API --> Svc["Service layer\n(business logic — no raw SQL here)"]
    Svc --> DAL["Data access layer\nONLY place SQL is built —\nalways parameterized / ORM query builder"]
    DAL --> Driver["DB driver\n(binds parameters after parsing)"]
    Driver --> DB[("Database")]
~~~

The rule that matters: SQL text construction should exist in exactly one narrow layer of the codebase (a repository/DAL), never scattered through controllers or business logic — that makes "is every query parameterized?" a reviewable, greppable question instead of an open-ended audit.

### System-level defense-in-depth architecture

~~~mermaid
flowchart TB
    User["Attacker / user traffic"] --> WAF["WAF / edge rules\n(compensating control)"]
    WAF --> App["Application\n(input allowlisting + parameterized DAL)"]
    App --> Role["Least-privilege DB role\n(scoped grants, no DDL for runtime user)"]
    Role --> DB[("Database\nsensitive columns hashed/encrypted at rest")]
    App --> Log["Query & error audit logging"]
    Log --> Mon["Monitoring / alerting\n(suspicious query shapes, error spikes)"]
~~~

Every layer here assumes the one "above" it can fail. The WAF can be bypassed; a code review can miss a raw-SQL escape hatch; a least-privilege role limits what even a successful injection can reach; hashing/encryption limit the value of anything an attacker manages to read; and monitoring gives you the chance to notice and respond even when a control silently failed.
`,

  "data-flow": `
Tracing a single blind boolean-based extraction attempt end to end shows exactly how each piece of the vulnerability chain connects, and where a defense could interrupt it.

~~~mermaid
sequenceDiagram
    participant Attacker
    participant App as Vulnerable App
    participant DB as Database

    Attacker->>App: GET /product?id=7' AND SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a'--
    App->>App: builds query by string concatenation (no parameterization)
    App->>DB: sends the FULL concatenated string as one query
    DB->>DB: parses entire string as SQL grammar (attacker's condition is real SQL now)
    DB-->>App: returns a row (condition true) OR no row (condition false)
    App-->>Attacker: page renders product OR renders "not found"
    Note over Attacker,App: Attacker repeats with each candidate character,\nbinary-searching the alphabet per position
    Attacker->>Attacker: reconstructs the password hash one character at a time
~~~

The step that matters most: the moment the app concatenates the request's id parameter directly into the query, the true/false answer to *any* SQL condition the attacker can phrase becomes visible to them through ordinary application behavior — no error message, no direct data display required. Interrupting this flow at the "builds query by string concatenation" step with a parameterized query removes the entire attack, because the id value would then be bound as a literal integer/string and could never inject a SUBSTRING condition into the query's logic at all.
`,

  "production-usage": `
### How real teams actually keep this fixed, day to day

Mature teams don't rely on individual engineers remembering a rule — they make the safe path the *only convenient* path:

- **ORMs/query builders as the default interface**: SQLAlchemy's Core expression language, the Django ORM's queryset API, Sequelize's model methods, and Prisma's typed client all bind parameters safely by construction. Developers reach for raw SQL only for genuinely unsupported queries.
- **CI-enforced static analysis**: tools like bandit (Python, rule B608 flags string-built SQL), Semgrep with SQL-injection rulesets, and CodeQL/GitHub code scanning run on every pull request and fail the build on string concatenation feeding a query execution call.
- **Code review policy**: any raw-SQL escape hatch (SQLAlchemy text(), Django .raw()/.extra(), Sequelize.query with a built string) requires an explicit reviewer sign-off, treated the same way a team treats disabling a linter rule.
- **Least-privilege database roles per service**: no application connects as the database's superuser/owner; a read-heavy service gets a role with only SELECT grants, a write path gets scoped INSERT/UPDATE grants, and nothing gets DROP/ALTER at runtime.
- **Secrets management for connection strings**: database credentials are pulled from a vault or the platform's secret store at boot, never committed to source control (see the **Secrets Management** skill).
- **Prepared-statement-aware drivers and pooling**: production drivers (psycopg2/asyncpg for Postgres, mysql2 for Node, the JDBC driver for Java) all support server-side prepared statements, and connection pools are sized so plan caching benefits are actually realized across requests.
- **A WAF (managed rulesets like the OWASP ModSecurity Core Rule Set, or a cloud provider's WAF) sits in front of internet-facing traffic as a compensating control**, tuned against real traffic to minimize false positives, never treated as sufficient on its own.
`,

  "industry-examples": `
- **TalkTalk** (UK telecom, 2015) — publicly reported as breached via SQL injection against a legacy web page, exposing customer records; became a landmark case tied to a record UK regulatory fine, widely cited as a lesson in the cost of unpatched legacy code (hedge: details reflect public/regulatory reporting, not this page's independent verification).
- **RockYou** (2009) — reportedly breached via SQL injection, exposing roughly 32 million plaintext passwords; because passwords were stored unhashed, the impact was total the moment the query succeeded. The resulting password list became (and remains) a foundational dataset in password-security research (hedge on specifics of the technical root cause, drawn from public reporting).
- **Sony Pictures** (2011) — the LulzSec group publicly claimed to have used SQL injection, among other techniques, in a breach affecting user data; hedge strongly here — public attacker claims are not the same as an independently confirmed technical postmortem.
- **Modern tooling vendors and cloud providers** (AWS, Google Cloud, Microsoft Azure, and the maintainers of PostgreSQL and MySQL/MariaDB) all ship client drivers whose primary, documented API surface is parameterized-query-first — a reflection of how completely the industry has converged on this as the definitive fix, even if adoption in individual applications lags.
- **Large engineering organizations** (GitHub, Google, and many others running programs like CodeQL/code-scanning at scale) invest heavily in automated static analysis specifically to catch injection patterns — including SQL injection — before code merges, which is itself evidence of how persistently this bug class reappears even inside disciplined engineering cultures.

The pattern across all of these: the fix has been known and cheap for decades, yet the vulnerability keeps recurring wherever new code is written faster than security review can catch a string-built query — which is exactly why this page emphasizes making the safe path the *only* convenient one, rather than relying on vigilance alone.
`,

  "best-practices": `
1. **Always use parameterized queries / prepared statements.** No exceptions, and no "this one case is safe because I control the input" reasoning — that reasoning is exactly how second-order injection happens.
2. **Use your ORM's query builder by default**; treat any raw-SQL escape hatch as an explicit, reviewed exception rather than a routine tool.
3. **Enforce least-privilege database accounts per service.** No application should ever connect with a superuser/owner role; separate read and write roles, and never grant DDL (DROP/ALTER/CREATE) to a runtime application account.
4. **Never treat input validation as your only defense.** Validate/allowlist AND parameterize — and re-check every subsequent use of stored data, not just the entry point (second-order injection).
5. **Turn off verbose database error messages in any environment reachable by untrusted users.** Log full error details server-side only; show generic errors externally.
6. **Use allowlisting — not blocklisting — for the rare cases where a value must become part of query structure** (a table/column name, an ORDER BY direction) since those genuinely cannot be bound as parameters.
7. **Enforce static analysis in CI** (bandit, Semgrep, CodeQL) that flags string concatenation or formatting feeding into an execute()/query() call, so the bug is caught before merge, not in production.
8. **Put a WAF in front of internet-facing applications as a compensating control — never as a substitute** for parameterization; tune it against real traffic to control false positives.
9. **Disable multi-statement/"stacked query" execution** in the database driver configuration unless a specific, reviewed feature genuinely requires it.
10. **Log and alert on suspicious query signals** — DB error rate spikes, unusual query length, comment characters or UNION/SLEEP keywords appearing in logged query shapes.
11. **Treat any LLM/agent-generated SQL exactly like untrusted user input.** Never execute a model's raw generated query text directly; route it through the same parameterization/allowlist layer, under a read-only least-privilege role.
12. **Vault and rotate database credentials** (see the **Secrets Management** skill); never hardcode connection strings in source control or container images.
`,

  "anti-patterns": `
### String concatenation into SQL text

~~~python
# WRONG
query = "SELECT * FROM orders WHERE customer_id = " + customer_id

# RIGHT
cursor.execute("SELECT * FROM orders WHERE customer_id = %s", (customer_id,))
~~~

### Percent-formatting raw SQL in an ORM's raw-query escape hatch

~~~python
# WRONG (Django .raw() with Python string formatting)
Order.objects.raw("SELECT * FROM orders WHERE customer_id = '%s'" % customer_id)

# RIGHT (Django .raw() with a parameter placeholder)
Order.objects.raw("SELECT * FROM orders WHERE customer_id = %s", [customer_id])
~~~

### SQLAlchemy text() built from an f-string

~~~python
# WRONG
conn.execute(text("SELECT * FROM orders WHERE customer_id = " + customer_id))

# RIGHT
conn.execute(text("SELECT * FROM orders WHERE customer_id = :cid"), {"cid": customer_id})
~~~

### "Sanitizing" by stripping quotes instead of parameterizing

~~~python
# WRONG — trivially bypassed (numeric-context injection needs no quote at all)
safe_input = user_input.replace("'", "")
query = "SELECT * FROM orders WHERE customer_id = '" + safe_input + "'"

# RIGHT — the value never touches the SQL parser as text at all
cursor.execute("SELECT * FROM orders WHERE customer_id = %s", (user_input,))
~~~

### Interpolating a dynamic ORDER BY column directly

~~~python
# WRONG — an identifier can't be bound as a parameter, so this gets concatenated
sort_col = request.args["sort"]
query = "SELECT * FROM orders ORDER BY " + sort_col

# RIGHT — allowlist the exact identifiers you'll accept
ALLOWED_SORT_COLUMNS = {"created_at": "created_at", "total": "total_cents"}
sort_col = ALLOWED_SORT_COLUMNS.get(request.args.get("sort"), "created_at")
query = "SELECT * FROM orders ORDER BY " + sort_col   # sort_col is never attacker-controlled text
~~~
`,

  performance: `
### Measure first

~~~bash
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;   -- Postgres/MySQL query plan
~~~

In Postgres, pg_stat_statements is the workhorse for finding both slow queries and *suspiciously shaped* ones — a query whose text changes on every single call is a strong hint that it was built by concatenation rather than parameterization, since parameterized calls with different values still share one normalized query text.

### The counter-intuitive performance win

A common myth is that parameterization "adds overhead." In practice it is usually the same speed or faster in production, because a fixed query template lets the database cache and reuse its execution plan across calls with different parameter values. A concatenated query produces a brand-new, unique query string on every single call — defeating plan caching entirely and forcing the planner to re-parse and re-plan from scratch each time, which also bloats the plan cache with one-off entries.

### Ordered optimization hierarchy

1. **Parameterize always** — correctness and plan-cache reuse come from the same fix.
2. **Use connection pooling with server-side prepare** where the driver supports it (psycopg2/asyncpg for Postgres, prepared statements in the JDBC driver) so the plan-cache benefit is actually realized across pooled connections.
3. **Batch statements** for bulk inserts/updates instead of looping single parameterized calls one at a time.
4. **Address ORM N+1 query patterns** as a separate, secondary performance concern once correctness/security is settled.
5. **Measure with pg_stat_statements (or the MySQL performance schema)** to find both genuinely slow queries and suspicious ones whose text varies per call.
`,

  scalability: `
Parameterization and least-privilege roles scale the same way any correctly designed database access layer does — the security fix and the performance fix are the same fix, so there is no separate "SQLi-safe but slow" tradeoff to manage at scale.

### Where scale interacts with this topic

- **WAF at scale**: managed cloud WAFs scale automatically with traffic but add measurable latency (typically small, single-digit-millisecond overhead — verify against your specific provider's numbers) and require ongoing rule tuning as traffic patterns evolve, or false positives climb with volume.
- **Connection pool exhaustion under attack**: a flood of automated SQLi probe traffic (scanners hammering every parameter with payloads) can behave like a denial-of-service against your connection pool even if every single query is safely parameterized and simply returns "no match" — rate limiting and WAF blocking reduce this load before it reaches the database.
- **Logging pipeline volume during scans**: an automated vulnerability scan against a public endpoint generates a large burst of malformed-query attempts; your centralized logging/alerting pipeline needs headroom to absorb that burst without dropping the legitimate signal buried inside it.

| Bottleneck | Answer |
|---|---|
| WAF latency/false positives at high traffic | Tune rules against real traffic; use a managed ruleset with staged (log-only → block) rollout |
| Connection pool exhaustion from scanner traffic | Rate limit at the edge; block known scanner signatures before they reach the app |
| Logging pipeline overwhelmed during a scan burst | Sample/aggregate low-value log lines; alert on rate-of-change, not raw volume |
| Plan cache bloat from any remaining concatenated queries | Fix the query (parameterize) — this is a correctness bug wearing a performance costume |
`,

  security: `
This is the section where every layer of defense for SQL injection is assembled into one picture. SQL injection is CWE-89 and sits under **OWASP Top 10** A03:2021-Injection (see that skill for the umbrella framework covering injection classes broadly).

### The defense stack, in order of primacy

1. **Parameterized queries / prepared statements — the definitive, primary control.** Every other item on this list is a supporting layer around this one; none of them replace it.
2. **ORM/query-builder default usage.** Lean on SQLAlchemy Core/ORM, the Django ORM, Sequelize's model API, or Prisma's typed client for the vast majority of queries; treat raw SQL as an exception.
3. **Allowlist input validation as defense-in-depth (not a replacement).** Validating that an ID is purely numeric, or that a sort field matches a known set, reduces the attack surface for *other* bugs even though the value will also be safely bound as a parameter regardless.
4. **Least-privilege database accounts.** Separate roles per service and per access pattern (read-only vs read-write); never grant DDL to a runtime application account; this bounds the blast radius if a query-layer control ever fails.
5. **Stored procedures — done right vs wrong.** A stored procedure that uses bound parameters internally is just as safe as parameterized application code:

~~~sql
-- RIGHT: parameters are bound, never concatenated into the query text
CREATE PROCEDURE get_orders_by_customer(IN cust_id INT)
BEGIN
    SELECT * FROM orders WHERE customer_id = cust_id;
END;
~~~

~~~sql
-- WRONG: dynamic SQL built by concatenation INSIDE the procedure is just as injectable
CREATE PROCEDURE get_orders_dynamic(IN sort_col VARCHAR(64))
BEGIN
    SET @sql = CONCAT('SELECT * FROM orders ORDER BY ', sort_col);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
END;
~~~

A stored procedure is not automatically safe just because it lives in the database — dynamic SQL assembled with string concatenation inside a procedure carries the exact same risk as inside application code.

6. **A WAF as a compensating control**, using a managed ruleset (OWASP ModSecurity Core Rule Set, or a cloud provider's WAF) — genuinely useful, and genuinely bypassable, which is why it is never listed first.
7. **Encoding/escaping libraries only as a last resort**, for the narrow case of dynamic identifiers that truly can't be parameterized — use the driver's own identifier-quoting function (for example, psycopg2's sql.Identifier), never hand-rolled string escaping.
8. **Secrets management for database credentials** (see the **Secrets Management** skill) — a leaked connection string compounds any injection incident dramatically.
9. **TLS between application and database, and between client and application** (see the **TLS & HTTPS** skill) — this doesn't prevent SQL injection itself, but it protects credentials and query data in transit, which matters if any part of the path is on a shared or hostile network.
10. **Encryption and hashing for sensitive columns** (see the **Encryption** and **Hashing** skills) — if an attacker does successfully read rows via a successful injection, encrypted columns and hashed passwords mean the dumped data still isn't usable in the clear.
11. **Understand the sibling classes**: **XSS** targets the browser's DOM rather than the database; **CSRF** forges an authenticated action rather than manipulating a query. All three share OWASP's broader injection/broken-trust framing, but each needs its own specific control.
`,

  testing: `
### Tooling

Static analysis: **bandit** (Python, rule B608 flags string-built SQL), **Semgrep** (SQL-injection rulesets across languages), **CodeQL**/GitHub code scanning (taint-tracking from request input to a query execution call). Dynamic testing: **sqlmap** for automated exploitation against an authorized target, **Burp Suite**'s scanner and **OWASP ZAP** for broader web app scanning.

### A runnable regression test that guards parameterization

~~~python
# tests/test_user_repo.py
import pytest
from myapp.repositories import UserRepository

def test_username_with_quote_is_stored_literally(db_session):
    """A classic injection-shaped value must be stored and read back unchanged —
    if this ever fails, someone reintroduced string-built SQL."""
    repo = UserRepository(db_session)
    tricky_name = "O'Brien'; DROP TABLE users; --"

    repo.create(username=tricky_name, email="obrien@example.com")
    fetched = repo.get_by_email("obrien@example.com")

    assert fetched.username == tricky_name          # stored exactly as given
    assert repo.count() >= 1                        # table was NOT dropped

def test_search_with_union_payload_returns_no_extra_columns(db_session):
    repo = UserRepository(db_session)
    payload = "nonexistent' UNION SELECT password, email FROM users -- "

    results = repo.search_by_username(payload)

    assert results == []   # treated as a literal (nonexistent) username, nothing more
~~~

### Senior testing doctrine

- Treat "does this survive a quote/comment/UNION-shaped value in the input" as a **mandatory** unit test for every function that touches the database — not an optional edge case.
- Run **sqlmap** (or an equivalent scanner) against staging as a scheduled or CI-gated job for any internet-facing endpoint, with explicit written authorization and scope.
- Negative tests belong in the standard suite, not a separate "security testing" silo that only runs before a release — a raw-SQL refactor introduced on a Tuesday should fail CI the same day, not surface in a pentest six months later.
`,

  debugging: `
### Escalation path

1. **Reproduce the reported input exactly.** Most reported SQL injection findings include a specific payload — reproduce it byte-for-byte before investigating further.
2. **Check application and database logs for the actual query executed.** Log the query *shape* (with placeholders) separately from bound parameter *values* — never log full parameter values if they may contain sensitive data.
3. **Temporarily enable driver-level query logging in a safe (non-production) environment** to see exactly what text reached the database.
4. **Run EXPLAIN on the suspected query** to confirm what the parameter value actually produced, and whether the query's structure changed at all.
5. **Use sqlmap in verbose mode against a staging replica**, never production, and only with explicit authorization, to confirm and characterize a suspected injection point.
6. **Check WAF/reverse-proxy logs** for requests matching known SQL injection signatures — comparing blocked vs. passed requests often reveals whether a control is even seeing the traffic.

~~~bash
sqlmap -u "https://staging.example.com/product?id=1" --batch --level=2 --risk=1
# --batch: non-interactive, --level/--risk: scan intensity — start low on shared staging environments
~~~
`,

  monitoring: `
### What to measure

- **Database error rate**, especially spikes correlated to a specific endpoint or parameter.
- **Query text patterns**: audit/query logs flagged for suspicious keywords (UNION, SLEEP, BENCHMARK, INFORMATION_SCHEMA, xp_cmdshell) appearing where they shouldn't.
- **WAF block/alert counts**, trended over time and correlated with deploys (a spike right after a release often means a new endpoint reopened a control gap).
- **Response-time anomalies correlated with request bodies** — a cluster of unusually slow responses to a specific parameter is a strong time-based blind injection signal.
- **Failed-authentication spikes** correlated with unusual payload shapes in the username/password fields.

### Instrumentation sketch

~~~python
import logging
import re

log = logging.getLogger("db.audit")
SUSPICIOUS_PATTERN = re.compile(r"(?i)(union\\s+select|sleep\\(|benchmark\\(|information_schema)")

def audit_query(query_shape: str, endpoint: str) -> None:
    """Log the query SHAPE (placeholders only, never bound values) for monitoring."""
    if SUSPICIOUS_PATTERN.search(query_shape):
        log.warning("suspicious_query_shape endpoint=%s shape=%s", endpoint, query_shape)
~~~

~~~python
from prometheus_client import Counter

WAF_BLOCKS = Counter("waf_sqli_blocks_total", "WAF blocks matching SQLi rulesets", ["rule_id"])
DB_ERRORS = Counter("db_query_errors_total", "Database errors by endpoint", ["endpoint"])
~~~

Alert on the *symptom* users or defenders would actually notice — a sustained error-rate spike, a burst of WAF blocks, or a latency anomaly tied to one parameter — rather than trying to alert on every individual suspicious character, which drowns real signal in noise.
`,

  deployment: `
### The operational default: least-privilege database roles

~~~sql
-- Runtime application role: only what the service actually needs, nothing else
CREATE ROLE app_orders_service LOGIN PASSWORD '...';           -- unique credential, vaulted
GRANT CONNECT ON DATABASE storefront TO app_orders_service;    -- can connect
GRANT SELECT, INSERT, UPDATE ON orders, order_items TO app_orders_service;  -- only these tables
REVOKE DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM app_orders_service;  -- explicit deny
-- No CREATE, DROP, ALTER grants at all — DDL is a migration-tool concern, not a runtime one
~~~

Why each line matters: a dedicated role per service means a compromise of one service's connection cannot read or write another service's tables; granting only SELECT/INSERT/UPDATE on the exact tables needed means even a successful injection against this connection cannot drop a table or read unrelated data; and never granting DDL means the worst case of a successful injection is data-level, not schema-level, damage.

### Deployment pipeline defaults

- **Secrets management**: the connection string/credentials are injected at deploy time from a vault or platform secret store (see the **Secrets Management** skill) — never baked into an image or committed to source control.
- **CI gate**: the pipeline runs bandit/Semgrep/CodeQL and fails the build on detected string-built SQL before an image is even produced.
- **WAF/managed ruleset enabled as part of the release**, staged from log-only to blocking mode against a canary slice of traffic before a full rollout.
- **Query/audit logging enabled by default** in the deployed configuration, shipping to the centralized logging pipeline described in Monitoring.
`,

  "production-checklist": `
- [ ] Every database query in the codebase uses parameterized queries or the ORM's safe query builder
- [ ] All raw-SQL/raw-query escape hatches (text(), .raw(), .extra(), sequelize.query with string concatenation) have been reviewed and justified
- [ ] CI runs a static-analysis gate (bandit/Semgrep/CodeQL) that fails the build on string-built SQL
- [ ] Each service connects with a dedicated, least-privilege database role — no DDL grants at runtime, no shared superuser connections
- [ ] Verbose database error messages are disabled in any environment reachable by untrusted users
- [ ] A WAF or managed ruleset is enabled and tuned in front of internet-facing endpoints
- [ ] Database credentials are pulled from a secrets manager/vault, not source control or plain environment files
- [ ] Any stored procedures using dynamic SQL internally have been reviewed for concatenation-based construction
- [ ] Query/audit logging is enabled, logging query shape (not sensitive bound values)
- [ ] Monitoring/alerting exists for DB error-rate spikes, suspicious query keywords, and WAF block volume
- [ ] An authorized sqlmap/pentest scan has been run against staging before launch
- [ ] Database drivers and client libraries are patched to current supported versions
- [ ] Multi-statement/stacked-query execution is disabled in the driver unless explicitly required and reviewed
- [ ] Rate limiting is in place on authentication and search endpoints most likely to be probed
- [ ] Sensitive columns (passwords, PII) are hashed/encrypted independently of query-layer defenses
- [ ] An incident-response runbook exists specifically for a suspected database-layer compromise
`,

  "common-mistakes": `
1. **"We use an ORM, so we're safe."** WHY it's wrong: every mainstream ORM ships raw-SQL escape hatches (text(), .raw(), .extra(), sequelize.query) that bypass safe binding entirely if fed a formatted string.
2. **Blocklisting quotes/semicolons instead of parameterizing.** WHY: trivially bypassed — numeric-context injection needs no quote, and encoding/comment tricks route around naive filters.
3. **Sanitizing only at the input boundary, not at every subsequent use.** WHY: second-order injection lives exactly in that gap — data flows into contexts the original check never anticipated.
4. **Displaying raw database error messages to users.** WHY: turns a blind injection attempt into a fast error-based one, effectively handing the attacker your schema.
5. **Running the application as the database owner/superuser.** WHY: converts "read one table via injection" into "drop the whole database."
6. **Believing a WAF alone is sufficient protection.** WHY: WAFs are signature/heuristic-based and are routinely bypassed with encoding and obfuscation techniques.
7. **Concatenating values assumed to be "trusted"** (internal config, admin-only fields, values from another internal service). WHY: trust boundaries shift over time — today's admin-only field becomes tomorrow's public API parameter.
8. **Skipping injection-specific tests because "the ORM handles it."** WHY: a later "optimization" that drops to raw SQL for performance reasons silently reintroduces the bug with no test to catch it.
9. **Using dynamic SQL inside stored procedures without parameter binding.** WHY: concatenation inside a procedure (EXECUTE(@sql)) is exactly as vulnerable as concatenation in application code.
10. **Treating SQL injection as a solved, legacy problem.** WHY: it remains consistently present in pentest and bug bounty data because new code keeps reintroducing it, and LLM-generated SQL is opening the exact same failure mode in new products.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|---|---|---|
| syntax error near unrecognized token / unterminated quoted string | A raw quote in user input broke a concatenated query | Parameterize the query; never string-build SQL |
| Application displays a raw database stack trace to the user | Debug mode left on, or errors not caught/rendered generically in production | Disable debug mode; show generic errors; log full details server-side only |
| Attacker-visible "column count doesn't match" error | The app is already vulnerable — a near-successful UNION attempt is leaking structure | The fix is parameterization, not suppressing the error message alone |
| "Wrong number of bound parameters" from the driver | Placeholder count in the query text doesn't match the values passed | Review the query-building logic; add a unit test asserting placeholder/value counts match |
| CI fails with a bandit/Semgrep "possible SQL injection" finding | String concatenation or formatting feeds an execute()/query() call | Refactor to bound parameters, or get an explicit reviewed exception if truly unavoidable |
| sqlmap reports "target does not appear to be injectable" | A WAF is blocking test payloads, or the parameter isn't actually reaching a query | Confirm test authorization/scope; check whether traffic is passing through a WAF that needs staged bypass for authorized testing |
| Reports of dropped/altered tables after a suspected injection | Application connected with excessive (DDL-capable) database privileges | Recreate least-privilege roles; revoke DDL grants from the runtime application account |
| Unusually slow responses on specific requests, no clear cause | Likely a time-based blind injection probe (SLEEP()/pg_sleep() calls) | Add query timeouts; alert on latency anomalies tied to specific parameters; confirm parameterization |
`,

  faqs: `
**Q: Is my ORM automatically safe from SQL injection?**
Mostly, for its standard query-builder API — but not for raw-SQL escape hatches like SQLAlchemy's text(), Django's .raw()/.extra(), or Sequelize's raw query calls, which reintroduce the exact same risk if fed a formatted string.

**Q: Does input validation alone stop SQL injection?**
No. It's a useful defense-in-depth layer, but parameterized queries are the definitive, primary fix — validation reduces attack surface for other bugs too, but it does not, by itself, prevent SQL injection.

**Q: Can stored procedures fix SQL injection by themselves?**
Only if the procedure itself uses bound parameters internally. A stored procedure that builds dynamic SQL via string concatenation is exactly as vulnerable as application code doing the same thing.

**Q: Is SQL injection still relevant given modern frameworks?**
Yes — it remains a consistently top-ranked finding in pentests and bug bounty programs because raw-SQL escape hatches, legacy code, and now LLM-generated queries keep reintroducing it.

**Q: What's the difference between SQL injection and NoSQL injection?**
Different mechanics — NoSQL injection typically manipulates query *operators* (like a not-equal or greater-than operator against a document database) rather than SQL text — but the same root cause: untrusted input being treated as query structure instead of plain data.

**Q: Can a WAF fully protect me?**
No. It's a valuable compensating control, but it's signature/heuristic-based and can be bypassed with encoding or obfuscation. It should never be your only defense.

**Q: How do I test my own app for SQL injection legally?**
Only test systems you own or have explicit written authorization to test. Use sqlmap or Burp Suite against a staging environment, never production, without clear scope and authorization.

**Q: Should I let an LLM agent write and execute raw SQL against my production database?**
Treat model-generated SQL exactly like untrusted user input. Never execute it directly — route it through the same parameterization/allowlist layer, restrict the agent's database role to read-only least privilege, and validate the generated query's shape before execution.
`,

  "interview-questions": `
**Junior:**

1. *What is SQL injection?* An attack where untrusted input alters the structure or meaning of a SQL query because the application built that query by concatenating trusted SQL text with unvalidated data, letting an attacker read/modify data or bypass logic like authentication.
2. *Give an example of a vulnerable login query and how an attacker bypasses it.* A query built by string concatenation of username/password; entering admin' -- as the username comments out the password check entirely, returning the admin row.
3. *What's the fix for SQL injection?* Parameterized queries / prepared statements, which send the query structure and the data values as two separate channels so attacker input can never be parsed as SQL syntax.
4. *What is UNION-based SQL injection?* Appending a UNION SELECT clause to pull rows from another table or column, which requires matching the original query's column count and compatible data types.
5. *Why doesn't blocklisting quotes fix SQL injection?* It's bypassable — numeric-context injection needs no quotes at all, and encoding/comment tricks route around simple filters; it also breaks legitimate input like names containing an apostrophe.
6. *What is a prepared statement?* A query template that is parsed and planned once, with placeholders bound to parameter values afterward — values can never be re-tokenized as SQL grammar.

**Senior:**

7. *Explain, at an internal level, how a parameterized query prevents injection.* The database parses and fixes the query's grammar from the template alone, before parameter values ever arrive; values are bound into the already-fixed plan as literal data, so there is no code path by which a value can add a keyword, comment, or clause — contrast with concatenation, where the whole string (including attacker input) is tokenized from scratch as one blob of SQL.
8. *What is second-order SQL injection, and why does it evade simple defenses?* A payload is stored safely (properly parameterized) on the way in, but read and unsafely concatenated into a *different* query later without re-validation — it evades checks that only look at the original entry point, since the danger only appears at the second, unguarded use.
9. *How would you detect blind SQL injection with no visible errors or content differences?* Boolean-based (compare responses for injected true/false conditions) and time-based (SLEEP()/pg_sleep(), measured via latency); if neither in-band channel exists, consider out-of-band exfiltration via DNS/HTTP callbacks initiated by the database, where network egress allows it.
10. *Why can applications using an ORM still be vulnerable?* Every mainstream ORM ships raw-SQL escape hatches (SQLAlchemy's text(), Django's .raw()/.extra(), Sequelize's raw query calls) that bypass the ORM's safe parameter binding if fed a formatted string instead of bound parameters.
11. *Design a layered defense for a service that must stay safe even if one control fails.* Parameterized queries (primary) + least-privilege database role (bounds blast radius) + input allowlisting (defense-in-depth against related bugs) + a WAF (network-layer compensating control) + hashed/encrypted sensitive columns (limits value of any successful read) + monitoring/alerting on anomalous queries — each layer independently reduces risk if a different one fails.
12. *How does SQL injection risk change for an AI agent that translates natural language into SQL?* The model's output must be treated as untrusted input exactly like user-typed text — never executed directly against a privileged connection; route it through parameterized templates or an allowlisted query builder, restrict the database role the agent uses to read-only least privilege, and validate the generated query's shape (reject DDL/DML keywords it shouldn't need) before execution.
`,

  "coding-questions": `
### 1. Fix this vulnerable login function

~~~python
# VULNERABLE
def login(conn, username, password):
    query = (
        "SELECT * FROM users WHERE username = '" + username +
        "' AND password = '" + password + "'"
    )
    return conn.execute(query).fetchone()

# FIXED — parameterized, and note password should be a HASH comparison in real code,
# not a plaintext equality check (see the Hashing skill)
def login(conn, username, password_hash):
    row = conn.execute(
        "SELECT * FROM users WHERE username = %s",
        (username,),
    ).fetchone()
    if row is None:
        return None
    stored_hash = row["password_hash"]
    return row if verify_password(password_hash, stored_hash) else None
~~~

Discussion: the fix removes the injection risk entirely because username is bound as literal data. The second, equally important fix is comparing password *hashes* rather than concatenating a plaintext password into the query at all — even a safely parameterized plaintext-password comparison is a design smell (see the **Hashing** skill).

### 2. Implement a safe dynamic sorting function

~~~python
# An API accepts a "sort" query parameter and must map it to a column name —
# identifiers cannot be bound as query parameters in most drivers, so allowlist instead.

ALLOWED_SORT_FIELDS = {
    "name": "name",
    "created": "created_at",
    "price": "price_cents",
}

def build_sorted_query(sort_param: str) -> str:
    column = ALLOWED_SORT_FIELDS.get(sort_param, "created_at")   # unknown input -> safe default
    return "SELECT * FROM products ORDER BY " + column
~~~

Complexity: O(1) lookup. Follow-up: why can't we just parameterize the column name like a value? Because a bound parameter is always treated as data (a string/number literal), never as an identifier — the database would try to sort by the literal string "price_cents" rather than the column named price_cents. Allowlisting is the correct pattern specifically because identifiers sit outside what parameter binding can express.

### 3. Simulate boolean-based blind extraction (educational, authorized-lab context only)

~~~python
def extract_char_via_oracle(oracle, position: int, alphabet: str =
                             "abcdefghijklmnopqrstuvwxyz0123456789") -> str:
    """oracle(position, candidate) -> bool is a stand-in for a true/false
    SQL condition against a lab target you are authorized to test.
    Binary-searches the alphabet instead of trying every character linearly."""
    lo, hi = 0, len(alphabet) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        # oracle asks: "is the character at position <= alphabet[mid]?"
        if oracle(position, alphabet[mid], "<="):
            hi = mid
        else:
            lo = mid + 1
    return alphabet[lo]
~~~

Complexity: O(log k) oracle queries per character (k = alphabet size), O(n log k) for a secret of length n — dramatically fewer requests than a linear character-by-character scan. Follow-up: this is precisely the technique tools like sqlmap automate; it must only ever be run against systems you own or have explicit written authorization to test.
`,

  "hands-on-labs": `
### Lab 1 — Reproduce the classic bypass (beginner, ~1h)
Stand up a local deliberately-vulnerable app (OWASP Juice Shop or DVWA, or a five-line Flask+SQLite login you write yourself with string-concatenated SQL). Reproduce the admin' -- authentication bypass. Deliverable: a short write-up explaining, in your own words, exactly why the comment syntax defeats the password check. Skills: recognizing concatenated SQL, first hands-on exploit.

### Lab 2 — UNION-based extraction, then the fix (intermediate, ~2h)
Extend the lab app with a search endpoint that's injectable. Determine the column count via ORDER BY probing, then extract usernames and password hashes from a users table via a UNION SELECT payload. Then rewrite the endpoint using parameterized queries and prove the identical payload no longer works. Skills: UNION technique, before/after verification of a fix.

### Lab 3 — Blind extraction script (advanced, ~3h)
Build a Python script that extracts a secret value character-by-character from your own lab app using boolean-based and then time-based blind techniques, with no visible output difference to rely on. Skills: scripting an extraction oracle, understanding both blind-injection channels end to end.

### Lab 4 — Full defense-in-depth stack (production, ~3–4h)
Take a small FastAPI or Flask service backed by Postgres. Add least-privilege database roles (separate read/write grants), enable pg_stat_statements/query logging, add a Semgrep or bandit CI rule that fails the build on string-built SQL, and put the app behind a basic WAF (for example ModSecurity's Core Rule Set on a reverse proxy). Demonstrate a blocked attack appearing in the WAF log. Skills: the entire layered-defense stack, operationally.
`,

  "real-projects": `
1. **Secure CRUD API with a written threat model** — build a small CRUD API (inventory or blog) using parameterized queries throughout, least-privilege database roles, allowlisted sortable fields, and a CI pipeline running Semgrep/bandit plus a scripted, authorized sqlmap scan against a staging instance. Deliverable: a written threat model documenting each control and precisely what it defends against. Demonstrates: end-to-end defense-in-depth thinking, not just "I parameterized my queries."

2. **A lightweight SQL-injection guard-rail library** — build a small wrapper/middleware around a database driver in a language of your choice that inspects outbound query calls in development/test environments and raises a loud error if a query was built via string formatting rather than bound parameters. Demonstrates: deep understanding of how parameterization actually works at the driver level, and the ability to build tooling that enforces a security rule automatically rather than relying on review.

3. **Natural-language-to-SQL agent with a safety layer** — build a small LLM-backed feature that translates a user's natural-language question into a SQL query against a sample read-only database, but never executes the model's raw text directly: validate the generated query against an allowlist of tables/columns, reject disallowed keywords (DROP/DELETE/UPDATE/semicolon-separated statements), execute only through a read-only least-privilege role, and log every generated query for audit. Demonstrates: the AI-era version of this exact vulnerability class, and a concrete mitigation pattern for it.

Each project: a src layout with a clear repository/DAL layer where all SQL construction lives, a test suite including injection-shaped regression tests, CI enforcing static analysis, and a README documenting the threat model — this is what turns "I know what SQL injection is" into a portfolio piece a senior interviewer takes seriously.
`,

  "case-studies": `
### TalkTalk (2015)
Widely reported as breached via SQL injection against a legacy web page, exposing customer records; became a landmark case tied to a record UK regulatory fine (hedge: details reflect public/regulatory reporting rather than this page's independent technical verification). Lesson: SQL injection risk doesn't disappear with old code — it compounds, and regulators increasingly treat a known, cheaply preventable vulnerability class as an aggravating factor rather than a mitigating one.

### RockYou (2009)
Reportedly breached via SQL injection, exposing roughly 32 million plaintext passwords. Because those passwords were stored unhashed, the impact of the query-layer breach was immediate and total. Lesson: severity compounds with how sensitive data is stored — hashing (see the **Hashing** skill) and encryption (see the **Encryption** skill) limit the blast radius even when a query-layer defense fails.

### Sony Pictures (2011)
The LulzSec group publicly claimed to have used SQL injection, among other techniques, in a breach affecting user data (hedge heavily: this is drawn from attacker claims and public reporting, not a confirmed official technical postmortem). Lesson: attribution in public breach reporting is often incomplete or contested — as a defender, treat a plausible reported vector seriously and prioritize the cheap, definitive fix (parameterization) rather than waiting for perfect certainty about root cause.

### Mass automated SQLi worms (mid-to-late 2000s)
Automated campaigns (commonly associated with the Asprox botnet and similar tooling) scanned the open web for concatenated-query patterns in ASP/PHP sites and mass-injected malicious script tags at scale, turning a single application-level bug class into a mass web-malware distribution mechanism. Lesson: a vulnerability class doesn't need to specifically target you to hurt you — automated scanners find and exploit it opportunistically, which is exactly why baseline hygiene (parameterize everywhere, always) matters even for sites that don't feel like "high value" targets.
`,

  comparisons: `
| Dimension | SQL Injection | NoSQL Injection | Command Injection | XSS | CSRF |
|---|---|---|---|---|---|
| Target layer | SQL query parser/DB engine | Document/DB query operators | OS shell | Browser DOM / JS engine | Authenticated session / browser |
| Root cause | Code/data confusion in SQL text | Operator/structure confusion in query objects | Code/data confusion in shell commands | Untrusted data rendered as executable markup/script | Missing verification a request was intentionally made by the user |
| Primary fix | Parameterized queries / prepared statements | Strict schema validation + safe query-builder APIs | Avoid shell invocation; argument arrays, allowlists | Output encoding / contextual escaping, CSP | Anti-CSRF tokens, SameSite cookies |
| Typical impact | Data read/write/delete; sometimes RCE via extended procedures | Data read/write, auth bypass | Remote code execution | Session hijack, defacement, credential theft | Unwanted state-changing actions performed as the victim |
| Where it's covered on this platform | This page | Briefly here; see database-specific skills for depth | Not a dedicated skill page currently | See the **XSS** skill | See the **CSRF** skill |

**How seniors choose**: this isn't a "pick one" decision — a senior engineer recognizes all five as instances of the same meta-pattern (untrusted input crossing a trust boundary and being interpreted as code, structure, or instructions instead of plain data) and builds one discipline — separate code from data, validate at every boundary, apply least privilege, layer defenses — that generalizes across all of them. See the **OWASP Top 10** skill for that unifying framework.
`,

  "related-technologies": `
- **PostgreSQL** / **MySQL** — the database layer this attack targets; understanding query parsing and EXPLAIN plans in either deepens the intuition for exactly why parameterization works.
- **OWASP Top 10** — SQL injection is the flagship example of A03:2021-Injection; read that skill for the umbrella framework this page sits inside.
- **XSS** — the sibling client-side injection class; same code/data-confusion root cause, a completely different execution context (browser vs. database).
- **CSRF** — a different mechanism (forged authenticated requests) commonly reviewed alongside SQL injection in the same security assessment.
- **Encryption** and **Hashing** — reduce the blast radius of a successful SQL injection data exfiltration; a dumped table of hashed passwords or encrypted columns is far less damaging than one in the clear.
- **TLS & HTTPS** — protects data and credentials in transit; doesn't prevent SQL injection itself but is part of the same overall defense-in-depth posture.
- **Secrets Management** — how database credentials should be stored and rotated so a leaked connection string doesn't compound an injection incident.
- **sqlmap, Semgrep, CodeQL, Burp Suite / OWASP ZAP** — the tooling ecosystem for testing and static analysis referenced throughout this page.
- **SQLAlchemy, the Django ORM, Sequelize, Prisma** — the ORM layers whose safe APIs and raw-SQL escape hatches were covered in depth in Intermediate Concepts and Anti-Patterns.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early 2026) — check owasp.org and cwe.mitre.org directly for anything newer, since this is a fast-moving, compliance-relevant area.

- The **OWASP Top 10 2021** edition, with SQL injection under A03:2021-Injection, remains the widely referenced framework as of this writing; check owasp.org for whether a newer edition has since been published.
- OWASP maintains a separate, actively evolving **Top 10 for Large Language Model Applications** project covering risks like excessive agency and insecure output handling — directly relevant to the natural-language-to-SQL and agent-tool-execution risks discussed in Advanced Concepts; verify its current contents on owasp.org rather than relying on any specific item list here.
- CI-native static analysis (Semgrep, CodeQL/GitHub code scanning) has continued becoming a default rather than an optional add-on in mainstream engineering organizations, specifically because injection classes including SQLi keep reappearing in fast-moving codebases.
- The practical emerging risk this page flags for AI engineers specifically: agent frameworks and natural-language-to-SQL features that execute model-generated queries against production databases — treat this as the same vulnerability class in a new outfit, not a new problem.
`,

  "future-roadmap": `
1. **AI-assisted static analysis** catching subtler injection patterns — including taint-tracking across ORM raw-SQL escape hatches — becoming a standard, expected part of CI rather than a differentiator.
2. **Natural-language-to-SQL and agentic database tools going mainstream**, reintroducing SQLi-shaped risk at the LLM-output layer; expect emerging patterns (read-only least-privilege agent roles, generated-query allowlists, query-shape validators) to formalize into named, documented best practices.
3. **Zero-trust database access patterns** — per-query authorization proxies and policy engines sitting between application and database — reducing reliance on "the application already validated it" as the sole trust boundary.
4. **Continued convergence on secure-by-default ORMs and drivers**, making raw string-built SQL an explicit, audited opt-in rather than the path of least resistance it has historically been.

Bet your career time on: fluency with parameterization across multiple languages, the ability to read ORM internals well enough to spot raw-SQL escape hatches on sight, and the emerging discipline of treating LLM-generated queries as untrusted input by default.
`,

  "cheat-sheet": `
~~~text
--- The core rule ---
NEVER build SQL by concatenating/formatting untrusted input into query text.
ALWAYS bind untrusted values as parameters, after the query's structure is fixed.

--- Vulnerable pattern (any language) ---
query = "SELECT * FROM t WHERE col = '" + user_input + "'"   # WRONG, always

--- Python: psycopg2 ---
cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))

--- Python: SQLAlchemy Core ---
conn.execute(text("SELECT * FROM orders WHERE id = :id"), {"id": order_id})

--- Python: Django ORM ---
Order.objects.filter(id=order_id)                       # safe by construction
Order.objects.raw("SELECT * FROM orders WHERE id = %s", [order_id])  # raw, still safe if parameterized

--- Node.js: pg ---
await client.query("SELECT * FROM orders WHERE id = $1", [orderId]);

--- Java: JDBC PreparedStatement ---
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE id = ?");
ps.setInt(1, orderId);

--- PHP: PDO ---
$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$orderId]);

--- Classic authentication-bypass payloads (authorized testing/lab use only) ---
admin' --
' OR '1'='1
' UNION SELECT username, password FROM users --

--- Blind detection payloads (authorized testing/lab use only) ---
' AND 1=1 --      (baseline true)
' AND 1=2 --      (baseline false)
' AND SLEEP(5) -- (time-based: confirms via delay, MySQL)
' AND pg_sleep(5) -- (time-based: Postgres)

--- Dynamic identifiers (can't be parameters) ---
ALLOWED = {"name": "name", "created": "created_at"}
col = ALLOWED.get(user_choice, "created_at")   # allowlist, never raw concatenation

--- Defense-in-depth checklist ---
1. Parameterize EVERY query, no exceptions
2. Least-privilege DB role per service (no DDL at runtime)
3. Allowlist inputs that must become identifiers/structure
4. Disable verbose DB errors in production
5. WAF as a compensating control, never the only control
6. Hash passwords, encrypt sensitive columns (limits blast radius)
7. Vault DB credentials, never hardcode
8. CI static analysis (bandit / Semgrep / CodeQL) blocking string-built SQL
9. Treat LLM-generated SQL as untrusted input — never eval it directly
~~~
`,

  "flash-cards": `
| Front | Back |
|---|---|
| What is the root cause of SQL injection? | String concatenation mixes trusted SQL code and untrusted data into one string, so the database can't tell them apart |
| What is the definitive fix? | Parameterized queries / prepared statements — structure and data travel as two separate channels |
| CWE / OWASP mapping | CWE-89; OWASP Top 10 A03:2021-Injection |
| UNION-based injection needs what precondition? | Matching column count and compatible types with the original query |
| Boolean-based blind injection relies on what? | Observable behavior difference (content/status) between a true and a false injected condition |
| Time-based blind injection relies on what? | Response latency (SLEEP()/pg_sleep()) when no other output difference exists |
| Out-of-band injection uses what channel? | A DNS/HTTP callback the database itself initiates, carrying stolen data |
| What is second-order injection? | A payload stored safely, later read and unsafely concatenated into a DIFFERENT query without re-validation |
| Why is blocklisting quotes insufficient? | Bypassable via numeric-context injection, encoding, and comment tricks; also breaks legitimate input |
| Are ORMs automatically safe? | Their query-builder API is; raw-SQL escape hatches (text(), .raw(), .extra(), sequelize.query) are not |
| Is input validation enough on its own? | No — it's defense-in-depth; parameterization is the primary, definitive control |
| Are stored procedures automatically safe? | Only if they bind parameters internally; dynamic SQL built via concatenation inside a procedure is equally vulnerable |
| Is a WAF a full defense? | No — it's a compensating control, bypassable via encoding/obfuscation |
| What limits the blast radius of a successful injection? | Least-privilege database roles, and hashing/encrypting sensitive columns |
| How should LLM-generated SQL be treated? | Exactly like untrusted user input — never executed directly; parameterized/allowlisted, run under a read-only least-privilege role |
`,

  mcqs: `
**1. What does this payload do to a concatenated login query: admin' -- ?**

A) Escapes the apostrophe safely  B) Comments out the rest of the query, skipping the password check  C) Causes a syntax error only  D) Has no effect

**Answer: B** — two dashes start a SQL comment, discarding everything after it, including the password condition.

**2. Which of these is the primary, definitive fix for SQL injection?**

A) Blocklisting single quotes  B) Displaying generic error messages  C) Parameterized queries / prepared statements  D) A web application firewall

**Answer: C** — A, B, and D are useful supporting layers; only parameterization structurally prevents the vulnerability.

**3. An attacker gets no visible query output and no error text, but the page returns a 404 for one injected condition and a 200 for another. What technique is this?**

A) Error-based injection  B) Out-of-band injection  C) Boolean-based blind injection  D) Second-order injection

**Answer: C** — a true/false behavioral difference with no direct output is the definition of boolean-based blind injection.

**4. Which of the following is a raw-SQL escape hatch that can reintroduce SQL injection despite using an ORM?**

A) Django's Model.objects.filter()  B) SQLAlchemy's text() fed a formatted string  C) A parameterized psycopg2 execute() call  D) Sequelize's model .findAll()

**Answer: B** — filter()/findAll() bind safely by construction; text() with a formatted string bypasses that safety entirely.

**5. Why is a stored procedure not automatically safe from SQL injection?**

A) Stored procedures can't accept parameters at all  B) Databases don't support stored procedures for SELECT statements  C) A procedure can still build dynamic SQL via string concatenation internally, which is equally vulnerable  D) Stored procedures always run with superuser privileges

**Answer: C** — the vulnerability is about how the query text is constructed, not about which layer (application vs. procedure) constructs it.

**6. What is the correct way to let an API safely accept a user-chosen sort column?**

A) Bind the column name as a query parameter like any other value  B) Concatenate it directly since it's "just a column name"  C) Map it through an allowlist dictionary to a known-safe identifier  D) Strip any quote characters from it first

**Answer: C** — identifiers can't be bound as parameters in most drivers, so allowlisting to a known-safe set is the correct pattern; A is impossible in most driver APIs, B and D are exactly the anti-patterns this page warns against.
`,

  "revision-notes": `
**Root cause in one line:** SQL injection happens when an application concatenates untrusted input directly into SQL query text, letting the database parser mistake attacker-controlled data for actual query structure — the same code/data confusion behind XSS, command injection, and LDAP injection.

**Attack surface:** classic in-band techniques (UNION-based, which requires matching column count/types, and error-based, which abuses verbose error messages) work when output or errors are visible; blind techniques (boolean-based, comparing true/false behavior, and time-based, using SLEEP()/pg_sleep() delays) work when they aren't; out-of-band techniques use DNS/HTTP callbacks the database itself triggers when no other channel exists; second-order injection hides in data that was safely stored but later unsafely reused in a different query.

**The fix, precisely:** parameterized queries / prepared statements separate query structure from data so a bound value can never be re-tokenized as SQL syntax — this is true across psycopg2, SQLAlchemy, the Django ORM, Node's pg driver, JDBC, and PDO alike. ORMs are safe by construction through their query-builder APIs, but every one of them ships a raw-SQL escape hatch (text(), .raw()/.extra(), sequelize.query with string concatenation) that reopens the exact same vulnerability if fed a formatted string.

**Defense-in-depth, in order of primacy:** parameterization (primary and definitive) → allowlist input validation (supporting layer, never a replacement) → least-privilege database roles (bounds blast radius) → hashed/encrypted sensitive columns (limits the value of a successful read) → a WAF (compensating network-layer control, bypassable, never sufficient alone) → secrets management for credentials → CI-enforced static analysis to keep string-built SQL from ever merging.

**The AI-era angle:** natural-language-to-SQL features and database-querying agents reopen this entire vulnerability class at the LLM-output layer — treat any model-generated query exactly like untrusted user input, execute it only under a read-only least-privilege role, and never eval a model's raw SQL text directly against a production database.
`,

  "learning-roadmap": `
**Week 1 — Foundations.** Read Overview through Prerequisites; complete Hands-on Lab 1 (reproduce the classic admin' -- bypass in a local vulnerable app). Milestone: explain, unprompted, why a single quote breaks a concatenated query.

**Week 2 — Classic in-band techniques.** Beginner and Intermediate Concepts; Lab 2 (UNION-based extraction, then fix it). Milestone: successfully extract data via UNION SELECT in your own lab, then prove the fix blocks the identical payload.

**Week 3 — Blind and out-of-band techniques.** Advanced Concepts; Lab 3 (build a blind extraction script). Milestone: your script extracts a secret value using boolean-based and time-based techniques with zero visible output difference.

**Week 4 — ORM pitfalls and the definitive fix.** Re-read Anti-Patterns and the Security section closely; refactor any raw-SQL usage in a personal project to bound parameters. Milestone: you can spot a raw-SQL escape hatch in someone else's code on sight.

**Week 5 — Defense-in-depth and production hardening.** Production Usage through Production Checklist; Lab 4 (full stack: least-privilege roles, CI static analysis, WAF). Milestone: a small service on your GitHub with a documented, layered defense against this exact vulnerability class.

**Week 6 — Interview and portfolio polish.** Interview Questions, Coding Questions; start Real Project 3 (the natural-language-to-SQL agent with a safety layer) if you're building toward AI-engineering roles specifically. Milestone: explain the full defense stack out loud, unprompted, at both junior and senior depth.

Continue next to the **OWASP Top 10** skill for the broader framework this vulnerability sits inside, then **XSS** to complete the injection-class picture from the client side.
`,

  "official-docs": `
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection) — the canonical overview page.
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) — the definitive, actionable prevention reference; read this in full.
- [CWE-89: Improper Neutralization of Special Elements used in an SQL Command](https://cwe.mitre.org/data/definitions/89.html) — MITRE's formal classification.
- [PortSwigger Web Security Academy — SQL injection](https://portswigger.net/web-security/sql-injection) — free, hands-on labs covering every technique on this page.
- [OWASP Testing Guide — Testing for SQL Injection](https://owasp.org/www-project-web-security-testing-guide/) — methodology for authorized testing.
`,

  books: `
- **The Web Application Hacker's Handbook** — Dafydd Stuttard & Marcus Pinto. The classic, comprehensive reference on web application attack techniques including SQL injection in exhaustive depth.
- **SQL Injection Attacks and Defense** — edited by Justin Clarke. A book dedicated entirely to this vulnerability class, from detection through exploitation through defense.
- **Real-World Bug Hunting** — Peter Yaworski. Bug bounty write-ups across vulnerability classes, including practical SQL injection findings, with a beginner-friendly narrative style.
- **Web Security for Developers** — Malcolm McDonald. A short, developer-focused (not pentester-focused) tour of the major web vulnerability classes including SQL injection — good as a first read before the denser handbooks.
- **Architecture Patterns with Python** — Percival & Gregory. Not security-focused, but its repository-pattern approach is exactly the "SQL construction lives in one narrow layer" architecture this page recommends.
`,

  blogs: `
- **PortSwigger Research** (portswigger.net/research) — deep technical write-ups on injection and other web vulnerability classes from the team behind Burp Suite.
- **OWASP blog and cheat sheet series** (owasp.org) — the community-maintained source of truth for prevention guidance.
- **Troy Hunt's blog** (troyhunt.com) — breach analysis and commentary, including many SQL-injection-related incidents, from the maintainer of Have I Been Pwned.
- **Semgrep blog** (semgrep.dev/blog) — practical static-analysis-focused posts on catching injection patterns in CI.
- **Snyk blog** (snyk.io/blog) — application security content with a strong developer-tooling angle, including injection classes.
`,

  "research-papers": `
Honest framing: SQL injection is overwhelmingly a *practitioner* topic — most of the best material is industry write-ups, conference talks, and tooling documentation rather than peer-reviewed academic papers. The closest foundational reading is the original industry disclosure, not a formal paper:

- **Forristal, J. ("rain forest puppy"), "NT Web Technology Vulnerabilities," Phrack Magazine, 1998** — the widely cited first public description of the technique; foundational reading despite not being an academic paper.

Real academic papers exist on automated detection and prevention, worth reading if you want the research angle (verify exact titles/years/venues independently, since these are recalled from memory rather than freshly looked up):

- **Boyd, S. W. & Keromytis, A. D., "SQLrand: Preventing SQL Injection Attacks," ACNS 2004** — an early academic proposal for randomizing SQL keywords to detect injected code.
- **Buehrer, G., Weide, B. W., & Sivilotti, P. A. G., "Using Parse Tree Validation to Prevent SQL Injection Attacks," SEM 2005** — comparing the structure of the intended query's parse tree to the executed query's parse tree as a detection mechanism.
- **Halfond, W. G. J., Viegas, J., & Orso, A., "A Classification of SQL-Injection Attacks and Countermeasures," ISSSE 2006** — a widely cited survey/taxonomy paper covering most of the attack types on this page.

For AI engineers, the closer and more current research is emerging around **LLM tool-use safety and prompt injection**, which shares this page's core "untrusted input becoming executable instructions" theme even though it isn't SQL-injection research per se.
`,

  videos: `
- **PortSwigger / Burp Suite Academy video walkthroughs** on SQL injection — paired directly with the free hands-on labs; the best "watch then do" pairing available.
- **LiveOverflow (YouTube)** — web security explainer videos that build attack techniques, including SQL injection, from first principles with real demonstrations.
- **Computerphile — "SQL Injection"** — a short, accessible explanation aimed at a general technical audience, good for the very first exposure to the concept.
- **DEF CON / Black Hat conference talks on web application injection techniques** — search each conference's published archive for the specific year's SQL/injection-focused talks; hedge on any specific talk title since conference lineups change yearly.
`,

  "github-repos": `
- [sqlmapproject/sqlmap](https://github.com/sqlmapproject/sqlmap) — the standard open-source automated SQL injection detection and exploitation tool; read the source to understand detection heuristics, not just the CLI.
- [digininja/DVWA](https://github.com/digininja/DVWA) — Damn Vulnerable Web Application, a deliberately vulnerable PHP/MySQL app with graded difficulty levels, ideal for Lab 1–3.
- [juice-shop/juice-shop](https://github.com/juice-shop/juice-shop) — OWASP Juice Shop, a modern deliberately vulnerable web app covering SQLi alongside the full OWASP Top 10.
- [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) — the source repository behind the official prevention cheat sheets.
- [payloadbox/sql-injection-payload-list](https://github.com/payloadbox/sql-injection-payload-list) — a large curated payload reference, useful for understanding technique variety (authorized testing only).
- [swisskyrepo/PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings) — a broader payload/technique reference spanning many vulnerability classes, including a deep SQL injection section.
- [semgrep/semgrep](https://github.com/semgrep/semgrep) and its registry of SQL-injection rules — the static-analysis tool referenced throughout Production Usage and Testing.
- [github/codeql](https://github.com/github/codeql) — GitHub's semantic code analysis engine, including taint-tracking queries for SQL injection.
- [sqlalchemy/sqlalchemy](https://github.com/sqlalchemy/sqlalchemy) — read the source for text() and bound-parameter handling to see the safe/unsafe boundary discussed in this page firsthand.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Recognition*: given ten short code snippets across Python/JS/Java/PHP, label each as vulnerable or safe and explain why in one sentence.
2. *Classic exploitation*: in an authorized lab, achieve an authentication bypass, then a UNION-based data extraction, against two different deliberately vulnerable endpoints.
3. *Blind extraction*: write a script implementing both boolean-based and time-based extraction against a lab target with no visible output difference; compare how many requests each technique needed.
4. *Refactor to safety*: take five vulnerable snippets (one per language covered in this page) and rewrite each using parameterized queries, with a one-line justification per fix.
5. *Allowlisting*: implement a safe dynamic ORDER BY / column-selection feature and write a test proving an injection-shaped sort parameter is rejected or ignored, not executed.
6. *Defense-in-depth design*: given a system diagram, mark where you would add parameterization, least-privilege roles, a WAF, and monitoring — and justify why each is necessary even with the others present.

**External sets:** PortSwigger Web Security Academy's SQL injection labs (free, the best-structured path); OWASP Juice Shop challenges; TryHackNet/HackTheBox web-focused rooms; picoCTF web exploitation challenges for a lighter, gamified entry point.
`,

  "architecture-diagram": `
The reference production defense-in-depth architecture for any service that touches a relational database:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/API consumers)"] --> WAF["WAF / managed ruleset\n(compensating control)"]
    WAF --> LB["Load balancer / API gateway"]
    LB --> App1["App instance 1\n(allowlisted input + parameterized DAL)"]
    LB --> App2["App instance N"]
    App1 & App2 --> Role["Least-privilege DB role\n(scoped grants, no runtime DDL)"]
    Role --> DB[("Relational database\nsensitive columns hashed/encrypted at rest")]
    App1 & App2 -->|vault-fetched creds| Secrets["Secrets manager / vault"]
    App1 & App2 -->|query shape + errors| Log["Audit / query logging"]
    Log --> Mon["Monitoring & alerting\n(error spikes, suspicious query shapes, WAF blocks)"]
    CI["CI pipeline: bandit / Semgrep / CodeQL gate"] -.blocks merge on\nstring-built SQL.-> App1
~~~

Every box maps to a section on this page: WAF and Role to Security, Secrets to the **Secrets Management** skill, Log/Mon to Monitoring, and the CI gate to Production Usage and Testing.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((SQL Injection))
    Root cause
      Code/data confusion
      String-concatenated queries
      CWE-89 / OWASP A03:2021
    Attack types
      In-band
        Union-based
        Error-based
      Blind
        Boolean-based
        Time-based
      Out-of-band
      Second-order
      Stacked queries
    ORM pitfalls
      SQLAlchemy text()
      Django .raw() / .extra()
      Sequelize raw query()
    The fix
      Parameterized queries
      Prepared statements
      Allowlisted identifiers
    Defense in depth
      Least-privilege DB roles
      WAF as compensating control
      Hashing and Encryption
      Secrets Management
      Monitoring and audit logging
    Tooling
      sqlmap
      Semgrep / bandit / CodeQL
      Burp Suite / OWASP ZAP
    AI-era surface
      Natural-language-to-SQL
      Agent tool execution
      Treat model output as untrusted input
    Related skills
      OWASP Top 10
      XSS
      CSRF
      PostgreSQL / MySQL
`,
};

export default sqlInjection;
