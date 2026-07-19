import type { CheatSheetData } from "./types";

const abac: CheatSheetData = {
  title: "The Ultimate ABAC Cheat Sheet",
  subtitle: "Attribute model · PDP/PEP/PAP/PIP · Rego & Cedar · production toolbelt",
  sections: [
    {
      title: "Core Model — NIST SP 800-162",
      color: "violet",
      rows: [
        { term: "Subject attributes", desc: "Who is asking", code: "role, department, clearance,\nemployment status, team, MFA status" },
        { term: "Resource attributes", desc: "What is being acted on", code: "owner, classification, sensitivity,\nproject id, status, tags" },
        { term: "Action", desc: "What they want to do", code: "read, write, delete, approve,\nexport, invoke" },
        { term: "Environment attributes", desc: "Context of the request", code: "time of day, source IP / zone,\ndevice trust, geolocation, risk score" },
        { term: "Policy", desc: "A boolean rule over the four categories", code: "permit if subject AND resource\nAND action AND environment match" },
        { term: "Deny by default", desc: "No matching rule means deny (fail closed)", code: "unmatched request -> deny\nunreachable PDP -> deny" },
        { term: "The running example", desc: "The canonical ABAC rule used across this page", code: "allow if:\n  subject.role == doctor\n  resource.assigned_to == subject.id\n  resource.patient_consent == true\n  time is business hours" },
        { term: "Attribute vs role", desc: "Attributes compose; roles enumerate", code: "ABAC: department == finance\nRBAC: role == FinanceManager (fixed)" },
      ],
    },
    {
      title: "Reference Architecture",
      color: "blue",
      rows: [
        { term: "PEP", desc: "Policy Enforcement Point — intercepts request, enforces verdict", code: "gathers attributes\ncalls PDP\nallows or rejects" },
        { term: "PDP", desc: "Policy Decision Point — evaluates policy, returns permit/deny", code: "reads policy from PAP\nmay call PIP for missing attrs\nreturns allow / deny" },
        { term: "PIP", desc: "Policy Information Point — resolves missing attributes", code: "DB lookup, HR system,\nidentity provider claim" },
        { term: "PAP", desc: "Policy Administration Point — authors and versions policy", code: "Git-backed policy repo\nreviewed and tested like code" },
        { term: "Request flow", desc: "One decision, five steps", code: "PEP intercepts\n-> gathers attrs (PIP if needed)\n-> PDP evaluates (reads PAP)\n-> verdict returned\n-> PEP enforces" },
        { term: "Deployment topologies", desc: "Where the PDP runs relative to the PEP", code: "sidecar: lowest latency\ncentralized: one place to manage\nembedded: fastest, tightest coupling" },
        { term: "Combining algorithm", desc: "How conflicting rules resolve", code: "must be explicit and documented\nnever left implicit" },
      ],
    },
    {
      title: "Policies as Code",
      color: "emerald",
      rows: [
        { term: "Rego skeleton (OPA)", desc: "General-purpose policy language", code: "package myapp.authz\ndefault allow := false\nallow if {\n  input.subject.role == \"doctor\"\n}" },
        { term: "Rego request input", desc: "JSON document the PDP evaluates against", code: "input.subject.id\ninput.resource.assigned_to\ninput.action\ninput.environment.time" },
        { term: "opa eval", desc: "Run a policy against a request locally", code: "opa eval -d policy.rego -i req.json\n  data.myapp.authz.allow" },
        { term: "opa test", desc: "Unit test policies in CI", code: "opa test policies/ -v" },
        { term: "explain trace", desc: "See exactly which rule fired", code: "opa eval ... --explain full" },
        { term: "Cedar skeleton", desc: "Formally analyzable authorization language (AWS)", code: "permit(principal, action == Action::\"view\", resource)\nwhen { principal.role == \"doctor\" };" },
        { term: "XACML", desc: "Historical OASIS ABAC standard (2003+)", code: "verbose XML; formalized PDP/PEP/PAP/PIP\nlargely superseded by Rego/Cedar" },
        { term: "deny-overrides", desc: "Any matching deny wins (safe default)", code: "permit AND deny both match -> deny" },
        { term: "permit-overrides", desc: "Any matching permit wins (availability-first, rare)", code: "permit AND deny both match -> permit" },
        { term: "first-applicable", desc: "First matching rule wins (order-sensitive)", code: "rules evaluated top to bottom\nstops at first match" },
      ],
    },
    {
      title: "Hybrid Design & Comparisons",
      color: "amber",
      rows: [
        { term: "RBAC then ABAC", desc: "The pattern most production systems actually run", code: "1. RBAC gate: cheap, coarse\n2. ABAC refine: contextual, precise" },
        { term: "ACL", desc: "Per-resource explicit permission list", code: "best for small static resource sets\ndoes not scale to millions of resources" },
        { term: "RBAC", desc: "Role membership decides access", code: "cheap, auditable\nbreaks down: role explosion" },
        { term: "ABAC", desc: "Attributes decide access at request time", code: "handles context: time, ownership, consent\ncost: attribute resolution latency" },
        { term: "ReBAC (Zanzibar-style)", desc: "Relationship graph decides access", code: "best for nested sharing: folders, groups\nsee OpenFGA, Ory Keto" },
        { term: "Trust boundary rule", desc: "Never trust a client-asserted attribute", code: "use verified JWT claims or DB lookups\nnever a raw request header" },
        { term: "Attribute freshness tension", desc: "Fresh vs fast is a real tradeoff", code: "slow-changing attrs: longer TTL\nrevocation-sensitive: short TTL or event push" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Fail-open on PDP failure", desc: "The single most dangerous ABAC mistake", code: "WRONG: except Exception: return True\nRIGHT: except Exception: return False" },
        { term: "Shadow authorization", desc: "Ad hoc checks scattered outside the PEP", code: "if user.role == admin: ...  # buried\nin business logic, unaudited" },
        { term: "Role explosion in disguise", desc: "An attribute enumerating hundreds of values is RBAC again", code: "access_profile: 400 enum values\n-- attributes should compose, not enumerate" },
        { term: "Stale revocation-sensitive cache", desc: "Long TTL on account_suspended lingers access", code: "suspended user still permitted\nuntil cache TTL expires" },
        { term: "Monolithic policy", desc: "One giant rule with dozens of conditions", code: "untestable, unreviewable\nprefer small named rules" },
        { term: "No decision logging", desc: "Or logging only denials", code: "logs must include permits too --\n\"why was this allowed\" matters as much" },
        { term: "Undocumented combining algorithm", desc: "Engineers assume different conflict resolution", code: "always state: deny-overrides\nor permit-overrides, explicitly" },
        { term: "TOCTOU window", desc: "Attribute checked, then resource changes before use", code: "re-verify critical attributes\nas close to the action as possible" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "FastAPI PEP pattern", desc: "Authorization as a dependency", code: "async def authorize(request, resource, action):\n    try: result = await call_pdp(...)\n    except Exception: raise HTTPException(503)\n    if not result: raise HTTPException(403)" },
        { term: "PDP call timeout", desc: "Never let auth stall the hot path", code: "httpx.AsyncClient(timeout=0.3)" },
        { term: "Attribute TTL cache", desc: "Mitigate chatty PIP calls", code: "class TTLAttributeCache:\n    def get(key): check TTL, else fetch\n    def invalidate(key): on write events" },
        { term: "Batch decisions", desc: "Filter a list without one PDP call per item", code: "fetch all needed attrs once\nthen evaluate locally per item" },
        { term: "Bundle distribution", desc: "OPA sidecar polls policy, never blocks on fetch", code: "bundles: poll every 30-60s\nserved from memory between polls" },
        { term: "Decision logging", desc: "Structured log per decision", code: "log.info(\"authz_decision\",\n  subject_id, resource_id, action,\n  verdict, policy_version, latency_ms)" },
        { term: "Metrics to track", desc: "RED plus ABAC-specific signals", code: "decision rate by verdict\nPDP latency p50/p95/p99\ncache hit rate, bundle age" },
        { term: "Sidecar deployment", desc: "OPA next to the app in the same pod", code: "localhost:8181/v1/data/...\nno network hop, no external exposure" },
        { term: "Shadow-mode rollout", desc: "Dry-run a policy change against real traffic", code: "replay sampled historical requests\ncompare old vs candidate policy verdicts" },
        { term: "Related platform skills", desc: "What ABAC assumes and connects to", code: "RBAC: the simpler model this extends\nOAuth 2.0/OIDC, JWT: establish the subject\nCookies and Sessions: identity propagation" },
      ],
    },
  ],
};

export default abac;
