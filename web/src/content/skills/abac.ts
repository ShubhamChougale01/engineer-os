import type { SkillContent } from "../types";

/**
 * ABAC (Attribute-Based Access Control) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const abac: SkillContent = {
  overview: `
Attribute-Based Access Control (ABAC) is an authorization model where access decisions are computed at request time from **attributes** — properties of the subject making the request, the resource being accessed, the action being attempted, and the environment the request happens in — instead of from a fixed list of roles or a static per-object permission list. A policy is a rule (or set of rules) written against these attributes: "a doctor can view a patient record only if the doctor is assigned to that patient, the request happens during business hours, and the patient has given consent." Nothing about that rule is hard-coded per user or per record; it is evaluated fresh, every time, against whatever attributes are true right now.

For an AI engineer this matters more than it looks. Every serious backend — a FastAPI service behind an LLM product, a multi-tenant SaaS platform, an internal tool with regulated data — eventually hits a wall with simple role checks: real authorization requirements are contextual ("only during business hours," "only if you own it," "only if the document isn't legal-hold," "only from a company IP," "only if the model call is under the tenant's spend cap"). ABAC is the model built specifically to express that kind of policy without an explosion of roles. It is also the model underneath most "policy as code" tooling used in modern platform engineering: Open Policy Agent (OPA), AWS Cedar, and cloud IAM condition blocks are all, at their core, ABAC engines.

ABAC is best understood as sitting next to, not replacing, RBAC (see the **RBAC** skill on this platform). RBAC answers "what can this kind of user generally do" cheaply and auditable; ABAC answers "given everything true about this specific subject, resource, and moment, is this specific action allowed." Most production systems run both together: RBAC narrows the world to a coarse set of permissions, ABAC narrows it further with context. Key characteristics of ABAC: it is declarative (policies are data, not imperative code), evaluated per request (not baked into a token or a table row), attribute-driven (subject, resource, action, environment), and it externalizes the decision from the application through a Policy Decision Point so authorization logic can change without redeploying the app.
`,

  history: `
ABAC did not arrive as a single invention; it accreted from three different lineages that eventually converged on the same idea: decide access from attributes, not identity.

- **Trust management systems** (mid-1990s): PolicyMaker and KeyNote let a request carry a set of credentials (attributes, effectively) and a policy decided trust from them, independent of a central identity directory.
- **Attribute certificates and PMI**: X.509 attribute certificates (late 1990s / early 2000s) let an authority assert attributes about a subject ("this person is a licensed physician") separately from their identity certificate, which is the conceptual seed of subject attributes as first-class access-control inputs.
- **RBAC as the immediate predecessor**: Ferraiolo and Kuhn formalized Role-Based Access Control at NIST in 1992, and the Sandhu RBAC96 model plus the ANSI INCITS 359-2004 standard made RBAC the enterprise default. ABAC grew directly out of RBAC's practical failure mode at scale: "role explosion" (thousands of near-duplicate roles to express small contextual differences) and RBAC's inability to reason about context (time, location, resource state) at all.

The formal, named "ABAC" model was codified by the U.S. federal government: **NIST Special Publication 800-162**, "Guide to Attribute Based Access Control (ABAC) Definition and Considerations" (Hu et al., 2014), is the document every serious ABAC implementation still cites — it defines the subject/object/action/environment attribute taxonomy and the PDP/PEP/PIP/PAP architecture used industry-wide today.

| Year | Milestone |
|------|-----------|
| 1992–1996 | Ferraiolo, Kuhn, Sandhu formalize RBAC at NIST — the model ABAC will later extend |
| 1996 | PolicyMaker (Blaze, Feigenbaum, Lacy) — policy evaluated from attributed credentials, not identity |
| 2003 | XACML 1.0 ratified by OASIS — the first standardized ABAC policy language and reference architecture (PDP/PEP/PAP/PIP) |
| 2004 | ANSI INCITS 359-2004 formalizes RBAC as a national standard |
| 2005–2013 | XACML 2.0 then 3.0 — richer combining algorithms, obligations, delegation |
| 2013 | AWS introduces IAM policy conditions — attribute-based conditions bolted onto an otherwise role/policy system |
| 2014 | NIST SP 800-162 formally defines ABAC for federal systems — the reference document for the model |
| 2016 | Open Policy Agent (OPA) started at Styra as a general-purpose, cloud-native policy engine using the Rego language |
| 2018 | Google publishes the Zanzibar paper — a relationship-based (ReBAC) authorization system powering Drive, YouTube, Photos at planetary scale |
| 2018 | OPA donated to the Cloud Native Computing Foundation |
| 2021 | OPA graduates to CNCF Graduated project status — becomes the de facto standard for policy-as-code in Kubernetes and microservices |
| 2023 | AWS open-sources **Cedar**, a policy language designed for both human readability and formal, provable analysis; ships in AWS Verified Permissions |

The throughline: every decade adds a better way to author and evaluate the same core idea — permit or deny this action based on the attributes true right now — because the previous generation's language was either too rigid (XACML's verbose XML) or too coupled to one vendor (raw IAM conditions).
`,

  "why-it-exists": `
Before ABAC, the world had two access-control tools, and both broke down at real-world scale in the same specific way: neither could express **context**.

- **Access Control Lists (ACLs)**: a per-resource list of "user X can do Y." Precise, but it does not scale — every new file, document, or record needs its own list maintained by hand, and there is no way to say "anyone on the finance team, during working hours, from a corporate device" without writing that logic into the application itself.
- **Role-Based Access Control (RBAC)**: a per-user list of roles, each role a bundle of permissions (see the **RBAC** skill). RBAC scales far better than ACLs for "what kind of user is this," but it hits **role explosion**: to express "a manager can approve expenses under 10,000 for their own department, but not after hours, and not for their own submissions," you either bake that logic into brittle application if-statements bolted onto the role check, or you create Manager-Finance-BusinessHours-NotSelf as a role — and that role count grows combinatorially with every new contextual rule. Large enterprises using pure RBAC have shipped systems with tens of thousands of roles, most used by a single person, because the role was really encoding a context, not a job function.

ABAC exists to close that gap: instead of pre-computing every combination of context into a role, it evaluates context **at decision time** from attributes. The role explosion problem and the "RBAC can't see context" problem are the same problem viewed from two angles, and ABAC is the answer to both: attributes are composable (an unlimited number of small facts) where roles are enumerable (a finite, human-maintained list). The other push was regulatory and government: NIST SP 800-162 was written because federal agencies needed to enforce policies like "a document classified above a user's clearance is denied, in real time, regardless of what role assigned it," which RBAC has no native vocabulary for.
`,

  "problem-it-solves": `
ABAC removes several concrete pains that show up the moment an authorization system needs to reflect real-world nuance:

- **Role explosion**: replaces "one role per contextual variant" with a small set of policies that read attributes. A hospital does not need Doctor-Cardiology-DayShift-OwnPatients-Consented as a role; it needs one policy that checks department, shift, assignment, and consent as attributes.
- **Stale, hand-maintained ACLs**: nobody has to remember to add a row to a per-document permission table when a new employee joins a project — the policy reads project membership as an attribute wherever that membership already lives (an HR system, a project-management tool).
- **Context blindness**: "business hours only," "corporate network only," "only if not on legal hold," "only below this risk score" are all environment or resource attributes ABAC evaluates natively; RBAC and ACLs have no vocabulary for any of them without escaping into custom code.
- **Coupling authorization logic to application code**: with a PDP (Policy Decision Point) externalized from the app, a policy change — tightening a rule, adding a new condition — is a policy deployment, not an application redeploy, code review, and release cycle.
- **Cross-system consistency**: the same policy language and the same PDP can enforce access consistently across ten microservices instead of ten teams each reimplementing "can this user do this" slightly differently.

What ABAC deliberately does **not** solve, and where teams get burned expecting it to:

- **It does not remove the need for coarse-grained gating.** Checking "is this user even a member of this tenant" per request via a giant attribute policy is slower and harder to audit than a simple role/membership check — which is why hybrid RBAC+ABAC (covered in Advanced Concepts) is the real-world default, not pure ABAC.
- **It does not make authorization free.** Every decision needs attributes, and attributes have to come from somewhere (a database, an identity provider, a request header) — ABAC trades a cheap table lookup (role membership) for a potentially expensive attribute-resolution step, which is exactly the Performance section's subject.
- **It does not make decisions self-explanatory.** A "deny" from a role check is trivial to explain ("you don't have the Admin role"). A "deny" from a twelve-condition policy evaluated against attributes fetched from four systems is much harder to explain to a user or reconstruct for an audit — covered in depth in Security and Monitoring.
- **It is not authentication.** ABAC assumes you already know who the subject is (see the **OAuth 2.0/OIDC**, **JWT**, and **Cookies and Sessions** skills) — it only decides what that already-authenticated subject may do.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the NIST ABAC model precisely: subject, resource/object, action, and environment attributes, and how a policy composes them into a permit/deny decision.
2. Draw and explain the PDP/PEP/PAP/PIP reference architecture and say exactly which component does what in a real request.
3. Write a real ABAC policy — in Rego (Open Policy Agent) and in Cedar — for a concrete rule like "a doctor may view a patient record only if assigned, during business hours, with consent on file."
4. Compare ABAC against ACL, RBAC, and ReBAC (Google Zanzibar-style) and justify, with a decision framework, which model fits a given system.
5. Design a hybrid RBAC+ABAC authorization layer — the pattern almost every production system actually ships.
6. Identify the performance risks of attribute-heavy policy evaluation (chatty PIP calls, N+1 attribute lookups) and apply the standard mitigations: caching, embedding attributes in tokens, bundle-based distribution.
7. Explain why ABAC decisions are harder to audit and explain than RBAC decisions, and what production teams do about it (decision logging, policy simulation, explain traces).
8. Wire a Policy Decision Point (Open Policy Agent) into a FastAPI backend as an authorization dependency, with proper error handling and timeouts.
9. Answer senior-level interview questions on combining algorithms (permit-overrides vs deny-overrides), policy conflict resolution, and attribute trust boundaries.
10. Recognize when NOT to reach for ABAC — and when a simpler RBAC or ACL model is the correct engineering call.
`,

  prerequisites: `
- **Required**: a working understanding of authentication versus authorization (know who is different from know what they can do), and basic familiarity with HTTP requests and JSON. Nothing else — this page starts ABAC itself from zero.
- **Strongly recommended first**: the **RBAC** skill on this platform. ABAC is framed throughout this page as the model that extends RBAC's ideas to handle context and role explosion — several sections assume you know what a role and a permission are.
- **Helpful, not required**: the **OAuth 2.0/OIDC**, **JWT**, and **Cookies and Sessions** skills — ABAC consumes the identity those systems establish (a subject and its attributes often arrive as JWT claims or session data), but this page does not require you to have built an auth flow yourself first.
- **For the worked examples**: basic Python and comfort reading a FastAPI route will make the production-usage and coding-questions sections click faster, but the policy languages themselves (Rego, Cedar) are taught from scratch here.

Dependency links on this platform: **RBAC** → **ABAC** (this page) → **OAuth 2.0/OIDC** / **JWT** all interlock into one Authentication and Authorization category; after this page, **OPA/Policy-as-Code** style deployment topics connect directly to the **Kubernetes** and **CI/CD** skills.
`,

  "beginner-concepts": `
### The four attribute categories (NIST SP 800-162)

Every ABAC policy is built from exactly four kinds of facts. Learn these four categories and the rest of ABAC is vocabulary on top of them.

~~~text
Subject attributes    — who is asking: user id, role, department, clearance,
                         employment status, team membership, MFA status
Resource attributes    — what is being acted on: owner, classification,
                         sensitivity, project id, document status, tags
Action                 — what they want to do: read, write, delete, approve,
                         export, invoke
Environment attributes — the context of the request: time of day, day of week,
                         source IP or network zone, device trust level,
                         geolocation, request risk score
~~~

A policy is a boolean rule that reads some combination of these four and returns permit or deny.

### A single policy, expressed in plain language first

Take the running example for this whole page: a hospital record system.

Rule: a doctor can view a patient record only if the doctor is assigned to that patient, the current time is within business hours, and the patient's consent flag is true.

Mapped to the four categories:

~~~text
Subject:     subject.role == "doctor"
Resource:    resource.assigned_to == subject.id
             resource.patient_consent == true
Action:      action == "view"
Environment: environment.time is within business hours
~~~

Notice something important: nothing here mentions a specific doctor's name or a specific patient's record id. The same policy governs every doctor and every patient record, forever, because it reasons about attributes, not identities. Compare that to an ACL, which would need a fresh row for every doctor-patient pairing, or RBAC, which would need a new role for every shift/consent/assignment combination to express the same rule.

### Writing the same policy as data (JSON) — the shape every ABAC engine ultimately consumes

Most ABAC engines separate the **request** (what is happening right now) from the **policy** (the rule). The request is just attributes as data:

~~~json
{
  "subject": { "id": "dr_shubham", "role": "doctor", "department": "cardiology" },
  "resource": { "id": "patient_9182", "assigned_to": "dr_shubham", "patient_consent": true },
  "action": "view",
  "environment": { "time": "2026-07-19T14:30:00Z", "source_ip": "10.2.4.9" }
}
~~~

The policy is evaluated against this document and returns permit or deny. This "request as a JSON document, policy as a rule over that document" shape is the same shape used by XACML, Open Policy Agent, Cedar, and AWS IAM condition blocks — learn this shape once and every ABAC tool looks familiar.

### Permit, deny, and the default

Every ABAC system needs a default when no rule matches. The overwhelmingly correct default, used by essentially every serious system, is **deny by default** (also called fail-closed): if no policy explicitly permits the request, the answer is deny. The alternative (fail-open — permit unless a rule explicitly denies) is a security anti-pattern covered in depth in Anti-Patterns and Security.

### A first hand-written evaluator, to build intuition

Before reaching for a policy engine, it helps to see that ABAC evaluation is, at its core, ordinary boolean logic over a dictionary of facts:

~~~python
from datetime import datetime, time, timezone

def is_business_hours(dt: datetime) -> bool:
    """Simple environment-attribute check: 9am-5pm UTC, weekdays only."""
    local = dt.astimezone(timezone.utc)
    return local.weekday() < 5 and time(9, 0) <= local.time() <= time(17, 0)

def can_view_patient_record(subject: dict, resource: dict, now: datetime) -> bool:
    """A hand-rolled ABAC decision — exactly what a policy engine automates."""
    is_assigned_doctor = (
        subject["role"] == "doctor"
        and resource["assigned_to"] == subject["id"]
    )
    has_consent = resource.get("patient_consent", False)
    return is_assigned_doctor and has_consent and is_business_hours(now)

# Deny by default: absence of a fact means False, never True
doctor = {"id": "dr_shubham", "role": "doctor"}
record = {"assigned_to": "dr_shubham", "patient_consent": True}
allowed = can_view_patient_record(doctor, record, datetime.now(timezone.utc))
~~~

This function IS an ABAC policy — it just is not externalized yet. The rest of this page is about making rules like this declarative, centrally managed, auditable, and reusable across services instead of copy-pasted Python scattered through a codebase.
`,

  "intermediate-concepts": `
### Policy languages: from XACML to Rego to Cedar

Historically, ABAC policies were written in **XACML** (eXtensible Access Control Markup Language), an OASIS-standardized XML dialect. XACML is thorough — it defines combining algorithms, obligations, and a full reference architecture — but its verbosity made it painful to author and review by hand, and it never got broad adoption outside government and large enterprise identity systems. Modern ABAC almost always uses a lighter, code-like policy language instead. The two dominant ones today:

**Open Policy Agent (OPA) and Rego** — a general-purpose, cloud-native policy engine. Rego is a declarative query language (related to Datalog) purpose-built for writing rules over structured data.

~~~rego
package hospital.authz

import future.keywords.if

default allow := false

# The patient-record viewing rule, expressed exactly as the plain-language
# version above: assigned doctor, business hours, consent on file.
allow if {
    input.action == "view"
    input.subject.role == "doctor"
    input.resource.assigned_to == input.subject.id
    input.resource.patient_consent == true
    is_business_hours(input.environment.time)
}

is_business_hours(iso_time) if {
    hour := time.clock([time.parse_rfc3339_ns(iso_time), "UTC"])[0]
    hour >= 9
    hour < 17
}
~~~

**Cedar** — a language released by AWS in 2023, designed to be both easy for humans to read and formally analyzable (so tooling can prove things like "this policy can never grant admin access to an anonymous subject").

~~~text
permit (
    principal,
    action == Action::"view",
    resource
)
when {
    principal.role == "doctor" &&
    resource.assignedTo == principal.id &&
    resource.patientConsent == true &&
    context.isBusinessHours == true
};
~~~

Both examples encode the identical policy; the difference is philosophy. Rego is a general query language you can use for almost any structured-data decision (Kubernetes admission control, CI policy, ABAC) — it is powerful but has a learning curve. Cedar is purpose-built only for authorization, trading generality for readability and formal verifiability.

### Combining algorithms — what happens with multiple matching rules

Real systems have more than one applicable policy (a tenant-level rule, a department rule, a resource-owner rule). ABAC engines need a **combining algorithm** to resolve conflicts, a concept XACML made explicit and every modern engine still needs:

- **Deny-overrides**: if ANY applicable rule says deny, the final decision is deny, even if others say permit. The conservative, security-first default.
- **Permit-overrides**: if ANY applicable rule says permit, the final decision is permit. Used rarely, only where availability matters more than restriction.
- **First-applicable**: evaluate rules in order, return the first one that matches. Predictable but order-sensitive — a maintenance risk if rule order is not disciplined.

Deny-overrides is the field-tested safe default; production ABAC systems should be explicit about which algorithm they use, because it is not visible from any single rule in isolation.

### The PDP/PEP/PIP/PAP architecture, in code

The architecture (covered fully with a diagram in Internal Working and Architecture) maps directly onto a real request:

~~~python
import httpx
from fastapi import Depends, FastAPI, HTTPException, Request

app = FastAPI()
OPA_URL = "http://localhost:8181/v1/data/hospital/authz/allow"

async def authorize(request: Request, resource: dict, action: str) -> None:
    """This function IS the Policy Enforcement Point (PEP): it gathers
    attributes, calls the Policy Decision Point (OPA), and enforces the
    verdict. It never decides anything itself — that is the PDP's job."""
    subject = request.state.user  # populated by your auth middleware
    opa_input = {
        "input": {
            "subject": subject,
            "resource": resource,
            "action": action,
            "environment": {"time": request.state.request_time.isoformat()},
        }
    }
    async with httpx.AsyncClient(timeout=0.3) as client:  # tight timeout — this is on the hot path
        try:
            resp = await client.post(OPA_URL, json=opa_input)
            resp.raise_for_status()
        except httpx.HTTPError:
            # Fail closed: if the PDP is unreachable, deny. Never fail open.
            raise HTTPException(status_code=503, detail="authorization service unavailable")
    if not resp.json().get("result", False):
        raise HTTPException(status_code=403, detail="forbidden")

@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str, request: Request):
    record = await fetch_patient_record(patient_id)   # Policy Information Point lookup
    await authorize(request, resource=record, action="view")
    return record
`,

  "advanced-concepts": `
### Hybrid RBAC plus ABAC — how real systems actually ship this

Pure ABAC (every decision from scratch, no roles at all) is rare in production, for a concrete reason: role checks are cheap, cacheable, and trivially auditable ("does this user have the Admin role" is a single indexed lookup), while attribute evaluation can require several attribute fetches per request. The pattern nearly every mature system converges on is layered:

1. **RBAC gate first**: a coarse, cheap role/permission check decides whether the subject is even in the right ballpark (Doctor role can reach the patient-records API at all; Guest role cannot).
2. **ABAC refine second**: for the subset of requests that pass the RBAC gate, attribute-based policy narrows further with context (this doctor, this patient, this time, this consent flag).

~~~text
Request -> RBAC gate (role has "patient-records:view" permission?)
             |  deny -> 403 immediately, no attribute fetch needed
             v allow
           ABAC refine (assigned_to, business hours, consent)
             |  deny -> 403, decision logged with full attribute snapshot
             v allow
           Serve resource
~~~

This hybrid model gets you RBAC's speed and auditability for the 95% of requests that fail a coarse check, and ABAC's precision for the harder cases that actually need context. Cedar and OPA both support this pattern natively (a role check is just another attribute condition), and it is the model implicitly assumed by the Performance section below.

### Attribute trust boundaries — the subtle correctness issue

Not all attributes are equally trustworthy, and conflating them is a real vulnerability class:

- **Authoritative attributes**: sourced directly from a system of record at decision time (a database row, an identity provider claim freshly verified). Safe to make security decisions on.
- **Client-asserted attributes**: sent by the caller itself (a header, a request body field). Must NEVER be trusted for a security-relevant attribute — a request claiming "role: admin" in a header is worthless unless something authoritative verified it (see the **JWT** skill on signature verification).
- **Cached attributes**: authoritative at fetch time, but potentially stale by decision time. A revoked doctor's access should not survive on a cached "role: doctor" attribute for the length of a long cache TTL — this is the classic tension covered in Performance.

A senior-level mental model: draw a trust boundary around every attribute source and ask "could the requester have forged or influenced this value." Anything client-controlled needs independent verification before a policy can rely on it.

### Decision determinism and policy testing as a first-class discipline

Because policies are declarative and externalized, they can (and should) be unit tested exactly like code — this is the single biggest operational maturity gap between teams that treat ABAC as "config" versus teams that treat it as a system:

~~~rego
package hospital.authz_test

import data.hospital.authz

test_assigned_doctor_during_hours_with_consent_allowed if {
    authz.allow with input as {
        "action": "view",
        "subject": {"id": "d1", "role": "doctor"},
        "resource": {"assigned_to": "d1", "patient_consent": true},
        "environment": {"time": "2026-07-19T14:00:00Z"},
    }
}

test_unassigned_doctor_denied if {
    not authz.allow with input as {
        "action": "view",
        "subject": {"id": "d1", "role": "doctor"},
        "resource": {"assigned_to": "d2", "patient_consent": true},
        "environment": {"time": "2026-07-19T14:00:00Z"},
    }
}
~~~

opa test runs these exactly like a unit test suite, in CI, on every policy change — treat a policy repository the same way you treat an application repository: reviewed, tested, versioned.

### Attribute-heavy evaluation under concurrency

When many requests hit the PDP concurrently, attribute resolution (PIP calls) becomes a fan-out problem: N concurrent requests each needing M attribute lookups is N×M calls to backing systems unless batched or cached. The standard senior-level answer is a decision table:

| Situation | Approach |
|-----------|----------|
| Attribute changes rarely (department, clearance) | Cache with a TTL of minutes; invalidate on write events |
| Attribute changes per-request (time, request risk score) | Compute locally in the PEP, never fetch remotely |
| Attribute is expensive and shared across requests (org-wide feature flags) | Push-based bundle distribution (OPA bundles) instead of per-request pull |
| Attribute must be always-fresh (account suspended flag) | Short TTL cache (seconds) plus event-driven invalidation on suspension |

### Adjacent model worth knowing: ReBAC (Google Zanzibar)

Relationship-Based Access Control (ReBAC), the model behind Google's Zanzibar system (2019 paper) and open-source implementations like OpenFGA and Ory Keto, answers a related but distinct question: not "does this subject have these attributes" but "is this subject connected to this resource through a chain of relationships" (this document's folder's owner shared it with this user's team). ReBAC excels at deeply nested, graph-shaped permission structures (Google Drive-style "can view because a parent folder was shared with a group I'm in") that ABAC attribute rules express awkwardly. Many production systems combine all three: RBAC for coarse gating, ABAC for contextual conditions, ReBAC for graph-shaped resource sharing — covered further in Comparisons.
`,

  "internal-working": `
Every ABAC decision, regardless of engine (XACML, OPA, Cedar, a hand-rolled evaluator), happens through the same architecture, first formalized by XACML and reaffirmed by NIST SP 800-162: four cooperating components with distinct responsibilities.

~~~mermaid
flowchart LR
    U["Subject makes a request"] --> PEP["PEP\nPolicy Enforcement Point\n(intercepts the request)"]
    PEP -->|"gathers subject/resource/action/env"| PDP["PDP\nPolicy Decision Point\n(evaluates policy, returns permit/deny)"]
    PDP <-->|"fetch missing attributes"| PIP["PIP\nPolicy Information Point\n(HR system, DB, IdP)"]
    PDP <-->|"reads policy set"| PAP["PAP\nPolicy Administration Point\n(policy authoring and versioning)"]
    PDP -->|"permit / deny decision"| PEP
    PEP -->|"permit: forward request\ndeny: reject with 403"| R["Resource"]
~~~

Step by step, for one request:

1. **PEP intercepts**: the Policy Enforcement Point sits in the request path — an API gateway plugin, a FastAPI dependency, a service-mesh sidecar. It cannot decide anything itself; its only job is to gather the request into attributes and enforce whatever the PDP returns.
2. **PDP evaluates**: the Policy Decision Point receives subject, resource, action, and environment attributes (often as one JSON document) and evaluates the applicable policy set against them, applying a combining algorithm if more than one rule matches.
3. **PIP fills gaps**: if the PDP needs an attribute it was not handed directly — the patient's consent flag living in a clinical records database, the subject's department living in an HR system — the Policy Information Point resolves it, typically via a database query, an API call, or a directory lookup. This step is the one most responsible for latency and is where caching (Performance section) matters most.
4. **PAP supplies the rules**: the Policy Administration Point is where policies are authored, reviewed, versioned, and published — a Git repository of Rego files pushed as an OPA bundle, or an admin console for Cedar policies in AWS Verified Permissions. The PDP never authors policy; it only reads what the PAP publishes.
5. **PEP enforces**: the PDP returns permit or deny (and, in XACML, optional "obligations" — side effects like "log this access" or "redact this field"). The PEP turns that into an actual HTTP 200 or 403, and nothing else in the system needs to know how the decision was reached.

The critical architectural property this buys you: the PDP is a separate, independently deployable, independently testable component. A policy change is a PAP change and a PDP reload — it never requires touching, testing, or redeploying the application that owns the PEP.
`,

  architecture: `
### Runtime architecture — where each component actually lives

In a modern cloud-native deployment, the four ABAC roles map onto concrete, separately owned pieces of infrastructure:

~~~mermaid
flowchart TB
    subgraph App["Application (owns the PEP)"]
        MW["Auth middleware\n(verifies JWT / session — see JWT skill)"]
        DEP["Authorization dependency\n(the PEP: builds the input document)"]
    end
    subgraph PolicyLayer["Policy layer"]
        OPA["OPA / Cedar engine\n(the PDP — runs as sidecar or service)"]
        Bundle["Policy bundle store\n(the PAP — Git-backed, CI-tested)"]
    end
    subgraph DataLayer["Attribute sources"]
        IdP["Identity provider claims"]
        DB["Application database"]
        HR["HR / directory system"]
    end
    MW --> DEP
    DEP -->|"POST /v1/data/... with input JSON"| OPA
    OPA -->|"pull policy bundle"| Bundle
    OPA -.->|"PIP lookups when needed"| IdP
    OPA -.->|"PIP lookups when needed"| DB
    OPA -.->|"PIP lookups when needed"| HR
    OPA -->|"permit/deny + decision log"| DEP
~~~

The most consequential architectural decision is **where the PDP runs relative to the PEP**:

- **Sidecar** (OPA container next to each service in the same pod): lowest latency (localhost call, no network hop), but N copies of the policy engine to keep in sync.
- **Centralized service** (one PDP cluster all services call over the network): one place to update and monitor, but every authorization check now costs a network round trip and the PDP becomes a shared dependency every service's latency depends on.
- **Embedded library** (policy engine compiled into the app process, e.g. OPA's Go SDK or WASM bundle): fastest possible (in-process call), but ties policy engine upgrades to application deploys, partially reintroducing the coupling ABAC exists to remove.

Most teams start centralized for simplicity, then move to sidecars once authorization latency shows up in P99 request time (see Performance and Scalability).

### Application architecture — where authorization logic lives in your codebase

~~~text
myservice/
├── src/myservice/
│   ├── api/                 # routers — call the authorize() dependency, nothing else
│   ├── authz/
│   │   ├── pep.py           # builds the input document, calls the PDP, enforces the verdict
│   │   ├── attributes.py    # attribute-fetching helpers (the PIP side the app owns)
│   │   └── client.py        # HTTP client to the PDP with timeout/retry/circuit-breaker
│   ├── services/             # business logic — NEVER contains authorization checks directly
│   └── models/
└── policies/                 # the PAP: Rego or Cedar source, its OWN repo or subtree
    ├── hospital/authz.rego
    └── hospital/authz_test.rego
~~~

The rule that keeps this maintainable: authorization checks live in exactly one layer (authz/), never scattered through services/ as ad hoc "if user.role == admin" checks — that scattering is precisely the anti-pattern (Shadow Authorization) covered in Anti-Patterns.
`,

  "data-flow": `
Tracing one request end to end — a doctor viewing a patient record — through every ABAC component:

~~~mermaid
sequenceDiagram
    participant C as Client (doctor's browser)
    participant API as FastAPI (PEP)
    participant DB as Patient DB (PIP)
    participant PDP as OPA (PDP)
    participant Bundle as Policy bundle (PAP)

    C->>API: GET /patients/9182 (Authorization: Bearer JWT)
    API->>API: verify JWT signature, extract subject claims
    API->>DB: fetch patient record 9182 (resource attributes)
    DB-->>API: assigned_to, patient_consent, classification
    API->>PDP: POST /v1/data/hospital/authz/allow  {subject, resource, action, environment}
    PDP->>Bundle: (already loaded in memory from last bundle poll)
    PDP->>PDP: evaluate allow rule against input
    PDP-->>API: { "result": true }
    API->>API: log decision (subject id, resource id, verdict, policy version)
    API-->>C: 200 OK + patient record
~~~

The two details that matter most in this flow: the PDP call happens **after** resource attributes are fetched (the PEP cannot ask "can this doctor view this record" until it knows who the record is assigned to), and the decision is logged with enough detail to reconstruct why it was made — the subject of the Security and Monitoring sections. If the JWT verification step fails, or the PDP call times out, the request must fail closed (403 or 503), never silently fall through to 200.
`,

  "production-usage": `
### Tooling that real teams run

- **Open Policy Agent (OPA)** deployed as a sidecar container (Kubernetes) or a local process, policies distributed as signed "bundles" pulled from an OCI registry or object storage (S3/GCS) on a polling interval (typically 10-60 seconds).
- **AWS Cedar** via Amazon Verified Permissions for AWS-native workloads, or the open-source Cedar SDK embedded directly in a service for full control.
- **Styra DAS** or **Permit.io** as commercial control planes on top of OPA — policy authoring UI, testing, and rollout for teams that do not want to build their own PAP tooling.
- **A hand-rolled evaluator** (as shown in Beginner Concepts) remains a legitimate choice for small systems with a handful of stable rules — do not adopt a policy engine before you have outgrown a well-tested function.

### Configuration and project layout

Policies live in their own versioned repository or subtree, reviewed like code, with CI running policy unit tests (opa test) on every change before a bundle is published. Never let a policy change bypass code review just because it "isn't application code" — a bad policy change is a production security incident exactly like a bad application deploy.

~~~yaml
# opa-bundle-config.yaml — how OPA is told where to pull policy from
services:
  policy-registry:
    url: https://bundles.internal.example.com
bundles:
  hospital-authz:
    service: policy-registry
    resource: bundles/hospital-authz.tar.gz
    polling:
      min_delay_seconds: 30
      max_delay_seconds: 60
~~~

### Operational defaults every production ABAC deployment should start from

- **Deny by default** at every layer: the PDP call itself, and the PEP's handling of a PDP timeout or error, both default to deny.
- **Timeouts on the PDP call** in the tens-to-low-hundreds of milliseconds — an authorization check on the request hot path must never be allowed to become the slowest thing in the request.
- **Decision logging** on every call — not just denies — because "why was this permitted" is asked in incident review as often as "why was this denied."
- **Policy versioning** visible in every decision log line, so a decision can always be tied back to the exact policy text that produced it.
`,

  "industry-examples": `
- **AWS**: IAM policy condition blocks are ABAC in production at planetary scale — tag-based conditions ("only if the resource's Environment tag equals the caller's Department tag") let a single set of IAM policies govern millions of accounts without per-resource permission management. Amazon Verified Permissions (built on Cedar) extends this to application-level authorization as a managed service.
- **Google**: the Zanzibar system (2019 paper) — technically ReBAC rather than pure ABAC, but built on the same "evaluate the decision at request time from external facts" philosophy — authorizes every Drive, Photos, and YouTube access at a scale of trillions of checks per day, and its design directly influenced the open-source OpenFGA and Ory Keto projects.
- **Netflix**: uses attribute-based policy (with OPA-family tooling in their infrastructure stack) to gate internal tooling and service-to-service calls by team, environment, and criticality attributes rather than maintaining role explosions across hundreds of microservices.
- **Styra / the Kubernetes ecosystem broadly**: OPA's Gatekeeper project enforces Kubernetes admission-control policy (attribute-based rules over pod specs, namespaces, labels) across essentially every serious Kubernetes cluster in production — a textbook ABAC use case outside the "user accessing a record" framing.
- **Healthcare and financial services generally**: HIPAA and financial-compliance environments were early, heavy ABAC adopters precisely because "role" alone cannot express "assigned clinician, business hours, consent on file" or "trade below the desk's risk limit, from an approved terminal" — the exact motivating examples throughout this page.

Pattern to notice: the companies operating ABAC at real scale almost never expose raw XACML anymore — they converge on OPA/Rego for infrastructure-shaped policy or Cedar/Zanzibar-family systems for application-shaped and relationship-shaped authorization.
`,

  "best-practices": `
1. **Deny by default, always.** No matching policy, an unreachable PDP, or a malformed request must all resolve to deny — never permit.
2. **Externalize the PDP; never scatter authorization checks through business logic.** One PEP layer, one PDP, so a policy change is never an application redeploy.
3. **Treat policies as code**: version control, code review, and unit tests (opa test or equivalent) on every policy change before it reaches production.
4. **Use hybrid RBAC plus ABAC**: a cheap role gate first, attribute refinement second — pure ABAC on every request is rarely the right cost tradeoff (see Advanced Concepts).
5. **Draw explicit trust boundaries around attributes.** Never let a client-asserted value (an unverified header, a request body field) drive a security decision without independent verification.
6. **Set an aggressive timeout on every PDP call** and have a documented fail-closed behavior for when it is exceeded.
7. **Log every decision, not just denials**, with the subject, resource, action, environment, and the policy version that produced the verdict.
8. **Cache attributes deliberately, with an explicit staleness budget per attribute** — a role changes rarely and can tolerate a longer TTL; an account-suspended flag needs a very short one.
9. **Pick one combining algorithm (deny-overrides is the safe default) and document it** — do not let policy authors guess how conflicts resolve.
10. **Keep policies small and composable** rather than one monolithic rule with dozens of conditions — small, named rules are testable and reviewable; giant ones are not.
11. **Simulate policy changes against real historical requests before rollout** (policy dry-run / shadow mode) so a tightened rule does not silently lock out a legitimate workflow in production.
12. **Rotate and review policies on a schedule**, the same way you review IAM permissions — stale "temporary" exceptions are how ABAC policy sets accumulate their own version of role explosion.
`,

  "anti-patterns": `
### Fail-open on PDP failure — the classic

~~~python
# WRONG: if the policy engine is unreachable, silently allow the request
async def authorize_bad(subject, resource, action) -> bool:
    try:
        return await call_pdp(subject, resource, action)
    except Exception:
        return True   # "just let it through if authz is down" — a real production incident waiting to happen

# RIGHT: unreachable PDP is a deny, and a loud one
async def authorize_good(subject, resource, action) -> bool:
    try:
        return await call_pdp(subject, resource, action)
    except Exception:
        log.error("PDP unreachable, failing closed", subject=subject["id"])
        return False
~~~

### Other production-grade ABAC anti-patterns

- **Shadow authorization**: scattering "if user.role == admin" or ad hoc attribute checks through business logic instead of a single PEP layer — every one of those is an authorization decision nobody can find, test, or audit centrally.
- **Trusting client-supplied attributes**: reading an "is_admin" or "department" value straight from a request header or unsigned cookie without verifying it came from an authoritative source (see the **JWT** skill for why signature verification is non-negotiable here).
- **One giant policy with dozens of nested conditions**: unreadable, untestable, and impossible to reason about which condition caused a given deny. Prefer several small, named rules.
- **No decision logging, or logging only denials**: when an incident review needs to know "who was allowed to see this record and why," logging only failures leaves half the story missing.
- **Role explosion smuggled back in through attributes**: creating an attribute like access_profile with hundreds of enumerated string values is RBAC's role explosion problem wearing an ABAC label — attributes should compose, not enumerate.
- **Embedding fast-changing security-critical attributes in long-lived tokens.** Putting an account_suspended or is_admin flag in a JWT with a long expiry means a revoked user keeps their access until the token naturally expires — see the JWT skill's revocation section.
- **Ignoring combining-algorithm ambiguity**: shipping multiple applicable policies without an explicit, documented combining algorithm, so different engineers assume different conflict-resolution behavior.
`,

  performance: `
### Rule zero: measure the attribute fetch, not just the policy evaluation

Policy evaluation itself (a Rego or Cedar rule matching against an in-memory JSON document) is typically sub-millisecond — it is almost never the bottleneck. The bottleneck is nearly always **attribute resolution**: the PIP calls to databases, HR systems, and identity providers that happen before the PDP can even run.

~~~bash
# Measure where authorization time actually goes in a request
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/patients/9182
# Compare: time spent fetching resource attributes vs the OPA POST itself
~~~

### The optimization hierarchy (apply in order)

1. **Reduce the number of attribute lookups per decision.** Fetch resource attributes once, alongside the resource itself, instead of a separate round trip per attribute.
2. **Cache slow-changing attributes with an explicit TTL**, keyed by subject or resource id — department, clearance level, and team membership rarely change second to second.
3. **Push policy data instead of pulling it per request.** OPA's bundle model loads the policy and reference data into memory and refreshes on a poll interval, so the PDP never makes a network call during evaluation itself — only the PEP's attribute-gathering step does.
4. **Embed stable attributes in the identity token** (JWT claims) so the PEP does not need a network round trip to fetch them at all — but only for attributes that are safe to be stale for the token's lifetime (see the trust-boundary discussion in Advanced Concepts and the JWT skill on claim staleness).
5. **Co-locate the PDP with the caller** (sidecar over centralized service) once network latency to a shared PDP shows up in P99 — a localhost call is routinely under a millisecond; a cross-AZ network hop is not.
6. **Batch decisions** where a request needs many authorization checks at once (e.g. filtering a list of 200 records down to the ones a subject can view) instead of one PDP round trip per record — OPA supports evaluating a policy against a batch of inputs in one call.
7. **Set and enforce a hard timeout** on the PDP call (tens of milliseconds) so a slow attribute source degrades gracefully (fail closed) instead of stalling the whole request pipeline.

### Numbers worth knowing

A well-tuned sidecar OPA deployment typically answers a policy query in under a millisecond once attributes are already assembled; the attribute assembly step (one or two database or cache lookups) is usually 1-10ms; a poorly cached PIP calling out to three separate systems per request can add 50-200ms — often larger than the rest of the request. Optimize the attribute fetch first; it is almost always where the time is.
`,

  scalability: `
Authorization sits on every request's hot path, so its scaling story is really the scaling story of attribute resolution plus PDP throughput.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Service pod 1\n+ OPA sidecar"]
    LB --> S2["Service pod 2\n+ OPA sidecar"]
    LB --> S3["Service pod N\n+ OPA sidecar"]
    S1 & S2 & S3 -->|"poll every 30-60s"| Bundle[("Policy bundle store\n(S3 / OCI registry)")]
    S1 & S2 & S3 -->|"cached attribute lookups"| Cache[("Redis attribute cache")]
    S1 & S2 & S3 -->|"cache miss only"| Src[("HR system / DB / IdP")]
~~~

### Vertical and horizontal scaling

The sidecar-per-instance pattern scales horizontally by construction: every new service replica brings its own PDP, so PDP capacity scales linearly with service capacity and never becomes a shared bottleneck. A centralized PDP service, by contrast, has to scale independently and becomes a new capacity-planning problem the moment request volume grows — which is precisely why most large-scale ABAC deployments migrate from centralized to sidecar as they grow.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Centralized PDP becomes a shared hotspot | Move to sidecar or embedded-library deployment |
| Policy bundle grows large (thousands of rules) | Split into smaller, independently versioned bundles loaded per service domain |
| Attribute source (HR system, legacy DB) can't handle request-time query volume | Cache aggressively; consider a change-data-capture pipeline to keep a fast attribute store in sync instead of querying the source directly |
| Fan-out decisions (authorize a list of 500 resources) | Batch evaluation in one PDP call, not 500 round trips |
| Bundle distribution lag across a large fleet | Push-based bundle invalidation (webhook-triggered pull) instead of relying solely on the polling interval for urgent policy changes |

### The one irreducible cost

No amount of scaling removes the fact that a security-critical, fast-changing attribute (an account_suspended flag, say) needs either a short cache TTL or event-driven invalidation — there is a genuine, physical tradeoff between "authorization is always maximally fresh" and "authorization adds zero latency," and every scaled ABAC system has picked an explicit point on that tradeoff, not avoided it.
`,

  security: `
### ABAC-specific attack surface

1. **Fail-open on PDP unavailability** — covered in Anti-Patterns, but worth restating as a security issue: an attacker who can cause the PDP to time out or crash (a denial-of-service against the authorization layer itself) should never be rewarded with implicit access.
2. **Unverified, client-asserted attributes** — a request that supplies its own role or department value in a header or body field, trusted without independent verification, is a direct privilege-escalation path. Every security-relevant attribute must trace back to an authoritative, verified source (see the **JWT** skill for signature verification, and the **OAuth 2.0/OIDC** skill for how claims get into a token in the first place).
3. **Stale attribute caches used for revocation-sensitive decisions** — caching an "active employee" or "account in good standing" attribute for too long means a fired employee or a suspended account retains access for the length of the cache TTL. This is functionally identical to the token-revocation problem covered in the **JWT** skill and needs the same answer: short TTLs or event-driven invalidation for anything revocation-sensitive.
4. **Policy injection / overly permissive combining algorithms** — a permit-overrides algorithm combined with a poorly scoped "emergency access" policy can let one narrow, well-intentioned rule override every other restriction system-wide. Deny-overrides as the default, plus careful scoping of any permit-type escape hatch, is the mitigation.
5. **Time-of-check to time-of-use (TOCTOU) gaps** — fetching resource attributes, then evaluating a policy, then acting on the resource, leaves a window where the resource's state could change (consent revoked, ownership transferred) between check and use. High-sensitivity operations should re-verify critical attributes as close to the point of action as possible.
6. **Confused-deputy patterns in service-to-service calls** — a downstream service trusting an upstream service's claim about the original subject's attributes without a verifiable chain (see OAuth 2.0's token exchange patterns) can let a compromised or buggy intermediate service impersonate any user's attributes.

### Defenses, concretely

- Fail closed everywhere, by default, with no exceptions carved out for "just this one internal service."
- Every attribute used in a security decision must be traceable to a system of record, with the trust boundary drawn explicitly (Advanced Concepts).
- Sign and verify any attribute that crosses a network boundary the way you would a JWT claim — an unsigned attribute in transit is an attribute an attacker can forge.
- Log every decision with enough context to reconstruct it during an incident, and alert on anomalous denial or permit rate changes (a sudden spike in permits can indicate a policy bug or an attack, exactly like a sudden spike in denials can indicate a legitimate workflow being broken).

See the dedicated **OAuth 2.0/OIDC**, **JWT**, **Cookies and Sessions**, and **RBAC** skills for the identity and coarse-authorization layers ABAC sits on top of, and the platform's **OWASP Top 10** skill for the broader access-control vulnerability class (broken access control has topped the OWASP Top 10 since 2021).
`,

  testing: `
Policies are code and deserve the same test discipline as application logic — this is the single biggest maturity signal in a real ABAC deployment.

~~~rego
# policies/hospital/authz_test.rego
package hospital.authz_test

import data.hospital.authz

test_permits_assigned_doctor_in_hours_with_consent if {
    authz.allow with input as {
        "action": "view",
        "subject": {"id": "d1", "role": "doctor"},
        "resource": {"assigned_to": "d1", "patient_consent": true},
        "environment": {"time": "2026-07-19T10:00:00Z"},
    }
}

test_denies_when_consent_missing if {
    not authz.allow with input as {
        "action": "view",
        "subject": {"id": "d1", "role": "doctor"},
        "resource": {"assigned_to": "d1", "patient_consent": false},
        "environment": {"time": "2026-07-19T10:00:00Z"},
    }
}

test_denies_outside_business_hours if {
    not authz.allow with input as {
        "action": "view",
        "subject": {"id": "d1", "role": "doctor"},
        "resource": {"assigned_to": "d1", "patient_consent": true},
        "environment": {"time": "2026-07-19T23:00:00Z"},
    }
}
~~~

~~~bash
opa test policies/ -v
~~~

### Testing the PEP integration on the application side

~~~python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_authorize_denies_when_pdp_unreachable():
    with patch("myservice.authz.pep.call_pdp", AsyncMock(side_effect=TimeoutError)):
        with pytest.raises(HTTPException) as exc:
            await authorize(fake_request, resource={}, action="view")
    assert exc.value.status_code in (403, 503)   # never 200 on PDP failure
~~~

### The senior testing doctrine for authorization

- **Test the deny path at least as thoroughly as the permit path** — an authorization test suite that only proves "the right people get in" and never proves "the wrong people are kept out" is missing the point.
- **Test the fail-closed behavior explicitly**: simulate a PDP timeout, a malformed response, and a network error, and assert deny in every case.
- **Test combining-algorithm edge cases directly**: two policies that individually permit and deny the same request, evaluated together, must resolve exactly the way the documented algorithm says.
- **Run policy tests in CI on every change to the policy repository**, gated the same way application test suites gate a merge.
- **Periodically replay real historical requests against a candidate policy change (shadow mode)** before rollout, to catch a policy that would have broken a legitimate workflow nobody wrote a unit test for.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the decision log first.** Every well-run ABAC deployment logs the full input document (subject, resource, action, environment) alongside the verdict and the policy version — start there before touching anything else.
2. **Reproduce the exact input locally against the policy** rather than guessing:

~~~bash
opa eval -d policies/hospital/authz.rego \
  -i request.json \
  "data.hospital.authz.allow"
~~~

3. **Use OPA's explain/trace mode** to see exactly which rule fired and why, line by line:

~~~bash
opa eval -d policies/hospital/authz.rego -i request.json \
  --explain full \
  "data.hospital.authz.allow"
~~~

4. **Check attribute freshness** — a surprising deny or permit is very often a stale cached attribute (a role that changed, a consent flag that was updated) rather than a policy bug. Compare the attribute value the PDP actually saw (from the decision log) against the current value in the system of record.
5. **Verify the combining algorithm assumption** — when two policies disagree, confirm which combining algorithm is actually configured; a mismatch between what an engineer assumed (permit-overrides) and what is configured (deny-overrides) is a common source of "the policy looks right but the decision is wrong" bugs.
6. **Check the PDP connectivity and timeout path** — "authorization is randomly failing" is very often a timeout under load, not a policy issue; check PDP latency metrics (Monitoring section) before re-reading the policy for the fifth time.

### Debugging a specific denied request end to end

- [ ] Pull the exact input document from the decision log.
- [ ] Replay it locally with opa eval and --explain full.
- [ ] Diff the attributes in the log against the current system-of-record values.
- [ ] Confirm the policy version in the log matches what is currently deployed (a rollout in progress can mean two different policy versions were live simultaneously).
`,

  monitoring: `
Authorization observability rests on the same three pillars as any production system, with ABAC-specific signals layered on top.

### Structured decision logging

~~~python
import structlog

log = structlog.get_logger()
log.info(
    "authz_decision",
    subject_id=subject["id"],
    resource_id=resource["id"],
    action=action,
    verdict=verdict,
    policy_version=policy_version,
    latency_ms=elapsed_ms,
)
~~~

Log every decision, permit and deny alike, with enough attribute context to reconstruct the "why" during an incident review without needing to reproduce the exact request.

### Metrics

~~~python
from prometheus_client import Counter, Histogram

AUTHZ_DECISIONS = Counter("authz_decisions_total", "Decisions", ["verdict", "policy"])
AUTHZ_LATENCY = Histogram("authz_decision_seconds", "PDP decision latency", ["policy"])

@AUTHZ_LATENCY.labels(policy="hospital.authz").time()
def evaluate(input_doc):
    ...
~~~

Track: decision rate split by permit/deny, PDP latency (p50/p95/p99 — this sits on the request hot path), PDP error/timeout rate, and attribute cache hit rate. A sudden shift in the permit/deny ratio, in either direction, deserves an alert — both an unexpected deny spike (a broken policy locking out legitimate users) and an unexpected permit spike (a broken policy, or an attack) are incidents.

### What to watch specifically for ABAC

- **Attribute cache hit rate** — a collapsing hit rate is an early warning of rising PDP latency before it shows up in the latency histogram.
- **Policy bundle age** — how long since the PDP last successfully pulled a fresh policy bundle; a stale bundle serving an outdated policy silently is a real incident class.
- **Decision-log volume versus request volume** — a gap means some code path is bypassing the PEP (shadow authorization, Anti-Patterns) and not going through logged authorization at all.
`,

  deployment: `
### OPA as a sidecar — the standard production topology

~~~dockerfile
# ---- application image ----
FROM python:3.12-slim AS app
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH"
USER 1000
EXPOSE 8000
CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

~~~yaml
# kubernetes deployment — OPA runs as a sidecar in the same pod
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hospital-api
spec:
  template:
    spec:
      containers:
        - name: api
          image: hospital-api:latest
          ports:
            - containerPort: 8000
          env:
            - name: OPA_URL
              value: "http://localhost:8181/v1/data/hospital/authz/allow"
        - name: opa
          image: openpolicyagent/opa:latest-envoy
          args:
            - "run"
            - "--server"
            - "--addr=localhost:8181"
            - "--set=bundles.hospital.resource=bundles/hospital-authz.tar.gz"
            - "--set=bundles.hospital.service=policy-registry"
          ports:
            - containerPort: 8181
~~~

Why each choice matters: the OPA sidecar listens only on localhost — no other pod can reach it directly, keeping the PDP call fast and preventing it from being exposed as an accidental network-wide authorization endpoint. The bundle configuration means OPA never blocks the application on a policy fetch mid-request — it polls independently and serves from memory. Running as a non-root user (1000) and a slim base image are the same container-hardening defaults covered in the **Python** and **Docker** skills.

### CI/CD for policy changes

lint (opa fmt / opa check) then test (opa test) then a shadow-mode dry run against sampled recent production requests then publish the bundle then a staged rollout that lets each PDP pick up the new bundle on its next poll cycle. Treat every stage as a gate exactly like an application deploy pipeline — see the **CI/CD** skill for the general pattern.
`,

  "production-checklist": `
Before an ABAC layer takes real traffic:

- [ ] Deny-by-default confirmed at every layer: no matching policy, malformed input, and PDP unreachable all resolve to deny
- [ ] PDP call has an explicit, tested timeout and a documented fail-closed behavior on timeout
- [ ] All security-relevant attributes traced to an authoritative source; no client-asserted attribute trusted unverified
- [ ] Combining algorithm chosen explicitly and documented (deny-overrides recommended default)
- [ ] Policies live in version control, reviewed like code, with a passing opa test (or equivalent) suite in CI
- [ ] Decision logging covers both permits and denies, with subject, resource, action, environment, and policy version
- [ ] Metrics in place: decision rate by verdict, PDP latency p50/p95/p99, PDP error rate, attribute cache hit rate
- [ ] Attribute caching TTLs assigned deliberately per attribute, with shorter TTLs for revocation-sensitive attributes
- [ ] Hybrid RBAC gate in place ahead of ABAC refinement for the coarse-grained majority of requests
- [ ] Shadow-mode / dry-run tested for the current policy set against real recent traffic before any tightening rollout
- [ ] Runbook exists for "PDP is down" and "policy bundle is stale" incidents
- [ ] Alerting on anomalous shifts in permit/deny ratio, not just on raw error rate
- [ ] No authorization logic exists outside the designated PEP layer (audited for shadow authorization)
- [ ] Load tested with realistic attribute-fetch latency included, not just the policy evaluation microbenchmark
`,

  "common-mistakes": `
1. **Failing open on PDP errors** — the single most dangerous ABAC mistake; treated at length in Anti-Patterns and Security because it converts an availability problem into a security breach.
2. **Trusting unverified client-supplied attributes** — an unsigned header claiming a role or department is not an attribute, it is user input, and must be verified before use.
3. **No decision logging, or logging only denials** — half the forensic story is missing when an incident asks "why was this permitted."
4. **Treating policy changes as config, not code** — skipping review and testing on a policy change because it "isn't application code" is exactly backwards; a bad policy change is a security incident.
5. **Caching security-critical attributes with a long, undifferentiated TTL** — an account_suspended flag needs a much shorter cache lifetime than a department field, and treating them identically is how revoked access lingers.
6. **Evaluating ABAC on every single request with no RBAC gate** — burns latency and PIP capacity on requests a cheap role check would have rejected instantly.
7. **One monolithic policy instead of small, composable, named rules** — untestable and unreviewable once it grows past a handful of conditions.
8. **No documented combining algorithm** — engineers assume different conflict-resolution behavior, and the system silently does something nobody intended when two policies disagree.
9. **Ignoring TOCTOU windows on high-sensitivity actions** — checking a consent flag, then performing an irreversible action seconds later without re-verifying it, can act on stale state.
10. **Confusing ABAC with authentication** — building elaborate attribute policies while the underlying identity (who the subject actually is) is weakly verified makes the whole policy layer decorative; get the **OAuth 2.0/OIDC** and **JWT** fundamentals right first.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| authz service unavailable (503) on every request | PDP sidecar crashed or not yet ready | Check PDP container health/readiness probe; verify fail-closed behavior is intentional, not a bug |
| Every request denied after a deploy | Policy bundle failed to load (syntax error) or is stale | Check PDP logs for bundle load errors; run opa check on the published bundle |
| Decision differs between replicas of the same service | Bundle polling lag — replicas on different poll cycles have different policy versions momentarily | Expected during rollout; alert only if the gap persists past the max polling interval |
| Permit granted that should have been denied | Stale cached attribute (role/consent changed but cache TTL has not expired) | Shorten TTL for that attribute or add event-driven cache invalidation |
| Two policies disagree and the "wrong" one seems to win | Combining algorithm mismatch between what was assumed and what is configured | Confirm and document the actual combining algorithm; add a test asserting the intended precedence |
| PDP call intermittently times out under load | PIP attribute source (DB/HR system) is the real bottleneck, not the PDP | Profile the attribute-fetch step specifically; add caching or batch the lookups |
| Policy unit tests pass locally but production denies unexpectedly | Test used mock attributes that do not match real production attribute shapes | Add integration tests against real (or realistic) attribute payloads, not only hand-written fixtures |
| Client sends a role/attribute in a request header and it is honored | Attribute trust boundary not enforced — client-asserted value used directly | Only ever use attributes sourced from a verified identity token or authoritative system of record |
`,

  faqs: `
**Q: Is ABAC always better than RBAC?**
No. RBAC is cheaper, simpler to audit, and sufficient for a large share of real authorization needs. ABAC earns its complexity specifically when context (time, ownership, consent, risk) needs to shape the decision. Most production systems use both: RBAC first, ABAC to refine — see Advanced Concepts.

**Q: Do I need Open Policy Agent, or can I just write the checks in my application code?**
For a handful of stable rules, a well-tested function (as shown in Beginner Concepts) is a legitimate, simpler choice. Reach for a dedicated policy engine when you need policies to change independently of application deploys, need the same rules enforced consistently across multiple services, or need policy-level audit and testing tooling.

**Q: What is the difference between XACML and Rego/Cedar?**
XACML is the original OASIS-standardized ABAC language and reference architecture (2003+); it is thorough but XML-verbose and rarely chosen for new systems today. Rego (OPA) and Cedar are modern, more ergonomic policy languages that implement the same underlying PDP/PEP/PIP/PAP model with a much better authoring and testing experience.

**Q: How is ReBAC (Zanzibar-style) different from ABAC?**
ABAC decides from attributes ("this subject's department equals that resource's department"). ReBAC decides from relationship graphs ("this subject is a member of a group that a folder was shared with, and this document is inside that folder"). They solve overlapping but distinct problems — ReBAC is stronger for deeply nested sharing structures; ABAC is stronger for condition-based rules like time and consent.

**Q: Why is ABAC harder to audit than RBAC?**
An RBAC deny has one cause: the subject lacks a role. An ABAC deny can depend on any combination of a dozen attributes fetched from several systems at a specific moment in time — reconstructing "why" after the fact requires the exact attribute snapshot the PDP saw, which is why decision logging (Monitoring) is not optional for ABAC the way it is merely good practice for RBAC.

**Q: What happens if the policy engine is down?**
It must fail closed — every request denied — never fail open. An availability incident in the authorization layer is a real and painful outage, but it is categorically less bad than a security breach caused by silently permitting everything during downtime.

**Q: Can ABAC policies be formally verified?**
Yes, for languages designed with that goal — Cedar in particular supports automated analysis that can prove properties like "no policy in this set can grant action X to an unauthenticated principal." Rego has less of this built in natively, though static analysis tooling exists.

**Q: Is ABAC only for human users, or also for service-to-service calls?**
Both. The subject in an ABAC policy can be a service identity as easily as a human — "service A may call service B's export endpoint only if service A's environment attribute says production and the request risk score is below a threshold" is exactly the same model, and it is a very common pattern in zero-trust service mesh authorization.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is ABAC, in one sentence?* An authorization model where access decisions are computed at request time from attributes of the subject, resource, action, and environment, rather than from a fixed role or a static per-resource list.
2. *Name the four attribute categories in the NIST ABAC model.* Subject, resource/object, action, environment — a strong answer gives one example of each.
3. *What does PDP stand for and what does it do?* Policy Decision Point — it evaluates the applicable policy against the supplied attributes and returns permit or deny; it never enforces anything itself.
4. *What does PEP stand for and what does it do?* Policy Enforcement Point — it intercepts the request, gathers attributes, calls the PDP, and enforces whatever verdict comes back (allow the request through or reject it).
5. *Why should a system deny by default rather than allow by default?* Because an unmatched policy or an unreachable authorization service should never accidentally grant access; deny-by-default (fail closed) means failures are safe failures.

**Senior:**

6. *Walk through the PDP/PEP/PAP/PIP architecture for a real request.* PEP intercepts and assembles subject/resource/action/environment attributes (fetching missing ones from a PIP such as a DB or directory), sends them to the PDP, which evaluates the policy set published by the PAP (with a combining algorithm if multiple rules match), and returns a verdict the PEP enforces. Strong answers mention that the PAP never talks to the PEP directly — only through published policy the PDP loads.
7. *Explain deny-overrides versus permit-overrides.* Deny-overrides: if any applicable rule denies, the final decision is deny regardless of other permits — the conservative, typical default. Permit-overrides: any applicable permit wins even if others deny — used only where availability outweighs restriction. A strong answer notes the combining algorithm must be explicit and documented, since no single rule reveals it.
8. *How would you design authorization for a system doing 10,000 requests per second, where every request needs an ABAC decision?* Hybrid RBAC gate first to reject the bulk of requests cheaply; ABAC refine only for requests that pass; sidecar-deployed PDP to avoid a network hop; attribute caching with per-attribute TTLs tuned to volatility; batch evaluation for list-filtering use cases; hard timeout with fail-closed behavior. Should mention measuring the attribute-fetch step specifically, since it — not policy evaluation — is almost always the bottleneck.
9. *Why is ABAC harder to audit than RBAC, and what mitigates that?* A deny/permit can depend on many attributes from multiple systems at one instant; mitigated by comprehensive decision logging (full attribute snapshot plus policy version) and by keeping policies small, named, and independently testable rather than one large opaque rule.
10. *Compare ABAC and ReBAC (Zanzibar-style) and describe a system that needs both.* ABAC evaluates attribute conditions; ReBAC evaluates relationship graphs (nested group/folder sharing). A document management system needs ReBAC for "shared with a group I'm a member of, through a parent folder" and ABAC for "only during business hours" or "only if not on legal hold" — the two compose rather than compete.
11. *How do you handle the trust boundary problem — a client claiming an attribute about itself?* Never trust a client-asserted attribute for a security decision without verifying it against an authoritative source; typically this means only using attributes that arrived via a verified JWT claim or a server-side lookup, never a raw request header supplied by the caller.
12. *Describe how you would roll out a policy change that tightens access, safely.* Author and unit-test the change, run it in shadow/dry-run mode against a sample of real recent production requests to see what it WOULD have denied, review that diff with stakeholders, then roll out gradually (canary a subset of PDP replicas or services) while watching the permit/deny ratio and error rate for anomalies before a full rollout.
`,

  "coding-questions": `
### 1. Implement a minimal ABAC policy evaluator

~~~python
from dataclasses import dataclass
from typing import Callable

Attributes = dict  # subject/resource/action/environment bundled as one dict

@dataclass
class Policy:
    name: str
    condition: Callable[[Attributes], bool]

class PolicyEvaluator:
    """Deny-overrides evaluator: ANY matching deny beats ANY matching permit."""
    def __init__(self) -> None:
        self.permits: list[Policy] = []
        self.denies: list[Policy] = []

    def add_permit(self, name: str, condition: Callable[[Attributes], bool]) -> None:
        self.permits.append(Policy(name, condition))

    def add_deny(self, name: str, condition: Callable[[Attributes], bool]) -> None:
        self.denies.append(Policy(name, condition))

    def evaluate(self, attrs: Attributes) -> tuple[bool, str]:
        """Returns (allowed, reason) — deny-overrides combining algorithm."""
        for deny in self.denies:
            if deny.condition(attrs):
                return False, "denied by rule: " + deny.name
        for permit in self.permits:
            if permit.condition(attrs):
                return True, "permitted by rule: " + permit.name
        return False, "no matching permit rule — deny by default"

# Usage: the running hospital example
engine = PolicyEvaluator()
engine.add_permit(
    "doctor_views_assigned_patient",
    lambda a: (
        a["subject"]["role"] == "doctor"
        and a["resource"]["assigned_to"] == a["subject"]["id"]
        and a["resource"]["patient_consent"] is True
    ),
)
engine.add_deny(
    "legal_hold_blocks_everything",
    lambda a: a["resource"].get("legal_hold", False) is True,
)
~~~

Complexity: O(number of policies) per decision — fine for tens to low hundreds of rules; beyond that, index policies by resource type or action to avoid scanning irrelevant rules. Follow-ups: add a permit-overrides mode; add rule priority instead of category ordering; add obligations (side effects returned alongside the verdict, like "must log this access").

### 2. Add a TTL attribute cache in front of a slow attribute source

~~~python
import time
from typing import Callable

class TTLAttributeCache:
    """Caches attribute lookups with a per-key TTL — the standard mitigation
    for chatty PIP calls covered in the Performance section."""
    def __init__(self, fetch: Callable[[str], dict], ttl_seconds: float) -> None:
        self._fetch = fetch
        self._ttl = ttl_seconds
        self._store: dict[str, tuple[float, dict]] = {}

    def get(self, key: str) -> dict:
        now = time.monotonic()
        cached = self._store.get(key)
        if cached is not None and now - cached[0] < self._ttl:
            return cached[1]
        value = self._fetch(key)          # cache miss: hit the real attribute source
        self._store[key] = (now, value)
        return value

    def invalidate(self, key: str) -> None:
        """Called on an authoritative write event — e.g. a role change or
        a suspension — so a revoked attribute never survives the full TTL."""
        self._store.pop(key, None)
~~~

Complexity: O(1) get/invalidate. Discussion points: per-attribute TTL instead of one global TTL (a suspension flag needs a much shorter TTL than a department field); event-driven invalidation versus polling; thread-safety if used from multiple request-handling threads (wrap with a lock or use a proper cache library like cachetools with TTL support in production).

### 3. Evaluate a batch of resources against one policy in a single pass

~~~python
def filter_viewable(records: list[dict], subject: dict, now_iso: str) -> list[dict]:
    """Filters a list of resources down to the ones a subject may view,
    without one policy-engine round trip per record — the batching
    optimization from the Performance and Scalability sections."""
    def allowed(record: dict) -> bool:
        return (
            subject["role"] == "doctor"
            and record["assigned_to"] == subject["id"]
            and record.get("patient_consent", False)
        )
    return [r for r in records if allowed(r)]
~~~

Complexity: O(n) in the number of records, one pass, versus O(n) network round trips if each record were checked individually — the difference between milliseconds and seconds at real list sizes. Follow-up: how would this change if the policy needed a PIP lookup per record instead of only local fields? (Answer: batch-fetch the needed attributes for all records first, then evaluate locally — never one lookup per record inside the loop.)
`,

  "hands-on-labs": `
### Lab 1 — Hand-rolled evaluator (beginner, about 1h)
Implement the PolicyEvaluator from Coding Questions, add three more rules for a simple document-sharing app (owner can always view; shared-with list can view; anyone can view if resource is marked public), and write pytest cases proving both the permit and deny paths for each rule. Skills: the core ABAC mental model, deny-by-default, deny-overrides combining.

### Lab 2 — Real OPA policy plus tests (intermediate, about 2h)
Install OPA locally, write the hospital patient-record policy in Rego exactly as shown in Intermediate Concepts, and write a full opa test suite covering: assigned doctor in hours with consent (permit), unassigned doctor (deny), missing consent (deny), outside business hours (deny), and a legal-hold override (deny even for an otherwise-valid request). Skills: Rego syntax, policy testing discipline, combining algorithms.

### Lab 3 — FastAPI plus OPA sidecar end to end (advanced, about 3h)
Stand up the FastAPI service and OPA sidecar from Intermediate Concepts and Deployment using Docker Compose, wire a real authorize() dependency, and add structured decision logging. Deliberately kill the OPA container mid-test and confirm the API fails closed (503, not 200). Skills: PEP implementation, fail-closed behavior, decision logging.

### Lab 4 — Instrument, cache, and load test (production, about 3-4h)
Take Lab 3's service, add the TTLAttributeCache from Coding Questions in front of a simulated slow attribute source (an artificial 100ms delay), add Prometheus metrics for decision rate and PDP latency, and load test with a tool like hey or locust before and after caching. Deliverable: a short report showing the P95 latency improvement from caching and explaining, with numbers, why the attribute fetch — not the policy evaluation — was the bottleneck. Skills: the entire Performance and Monitoring sections, applied end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate ABAC engineering maturity to employers:

1. **A policy-as-code authorization service** — a standalone FastAPI service wrapping OPA, exposing a clean authorize(subject, resource, action, environment) endpoint for other services to call, with a policies/ repository of Rego rules, a full opa test suite in CI, decision logging to structured JSON, Prometheus metrics, and a Docker Compose demo with two example client services. Demonstrates: the full PDP/PEP separation, policy testing discipline, production observability.

2. **A hybrid RBAC plus ABAC access-control library** — a small Python library implementing the layered model from Advanced Concepts: a fast in-memory role/permission check first, falling through to an attribute-based Rego (or hand-rolled) evaluation only when the role check passes. Include a benchmark comparing pure-ABAC-on-every-request latency against the hybrid model's latency at increasing request volume. Demonstrates: architectural judgment, not just policy syntax — the ability to justify a design with numbers.

3. **A multi-tenant SaaS authorization layer with attribute caching and shadow-mode rollout** — a project simulating a real SaaS backend where tenants have their own attribute-based rules (e.g. per-tenant data-residency or spend-limit conditions relevant to an AI product calling LLM APIs), including a TTL attribute cache with per-attribute TTL policy, a shadow-mode tool that replays sampled historical requests against a candidate policy change and reports what would have changed, and a README documenting the combining algorithm and trust-boundary decisions made. Demonstrates: the production-maturity practices (Best Practices, Production Checklist) that separate "wrote a policy" from "runs authorization in production."

Each project: policies and code in version control, tests for both permit and deny paths, decision logging, a README explaining the architecture and the combining algorithm chosen — this is exactly the engineering rigor senior interviews probe for.
`,

  "case-studies": `
### Google Zanzibar: relationships at planetary scale
Google's 2019 Zanzibar paper describes the authorization system behind Drive, Photos, YouTube, and dozens of other products, handling trillions of access checks. It is technically ReBAC rather than ABAC, but it shares ABAC's core philosophy: evaluate the decision at request time from externalized facts, never bake it into the application. Lesson: at truly enormous scale, the shape of your permission model (attributes vs relationship graphs) has to match the shape of your actual data — Google's data is fundamentally a sharing graph, so a graph-native model outperformed an attribute-rule model for their core use case.

### AWS IAM: ABAC via tags, at hyperscale
AWS moved from pure role/policy IAM toward tag-based ABAC specifically to solve role explosion in large organizations — instead of maintaining a role per team per environment per resource type, a handful of policies check whether a resource's tags match the caller's tags. Lesson: ABAC's biggest real-world win is not "more expressive policy" in the abstract, it is collapsing what would have been thousands of near-duplicate roles into a small, composable rule set.

### Open Policy Agent and Kubernetes admission control
OPA's Gatekeeper project became the de facto standard for policy enforcement across Kubernetes clusters industry-wide — every pod creation, every namespace, every resource request can be checked against attribute-based policy (required labels, resource limits, disallowed image registries) before the API server admits it. Lesson: ABAC is not only a "should this user see this record" pattern — the identical model (subject equals the requesting service account, resource equals the pod spec, environment equals the cluster and namespace) governs infrastructure policy just as naturally as application authorization.

### A healthcare compliance incident (illustrative pattern, not a single named company): fail-open outage
A hospital records system's PDP sidecar experienced a rolling restart during a deployment; the application had been configured to fail open on PDP timeout to "avoid disrupting clinicians." For roughly ninety seconds, every patient-record request was permitted regardless of assignment or consent. Lesson: this exact scenario is why fail-closed is treated as non-negotiable throughout this page — an availability blip becomes a reportable compliance breach the moment authorization fails open, and the fix (fail closed, with a clear on-call runbook for the resulting outage) is cheaper than the alternative in every real incident of this shape.
`,

  comparisons: `
| Dimension | ACL | RBAC | ABAC | ReBAC (Zanzibar-style) |
|-----------|-----|------|------|------------------------|
| Decision basis | Per-resource explicit list | Role membership | Attributes of subject/resource/action/environment | Relationship graph traversal |
| Scales with users | Poorly — per-resource list grows unbounded | Well, until role count explodes with context | Well — attributes compose instead of enumerate | Very well for deeply nested sharing |
| Handles context (time, risk, consent) | No | No, natively | Yes — its core purpose | Indirectly, via relationship modeling |
| Ease of audit | High (read the list) | High (read the role) | Lower — needs full attribute snapshot | Moderate — needs the relationship graph at decision time |
| Authoring complexity | Low, but high maintenance burden | Low | Moderate — policy language plus attribute sourcing | Higher — schema design for relationships |
| Typical tooling | Filesystem permissions, simple app tables | Identity providers, app role tables | OPA/Rego, AWS Cedar, XACML (legacy) | Google Zanzibar, OpenFGA, Ory Keto |
| Best fit | Small, static resource sets | "What kind of user is this" gating | "Given everything true right now, is this allowed" | "Is this subject connected to this resource through sharing" |

**How seniors choose**: start with RBAC for coarse gating because it is cheap and auditable; add ABAC specifically where context — not just identity — has to shape the decision (time, ownership, consent, risk score); reach for ReBAC specifically when the resource model is fundamentally a sharing graph (folders, groups, nested permissions) that attribute rules would express awkwardly as deeply nested conditions. Most mature systems at scale run a hybrid of two or all three rather than picking one model dogmatically — see Advanced Concepts for the RBAC+ABAC layering pattern in detail.
`,

  "related-technologies": `
- **RBAC** — the simpler model ABAC extends; see the **RBAC** skill for the role/permission fundamentals this whole page assumes.
- **OAuth 2.0/OIDC** — establishes who the subject is and how their attributes (claims) get issued in the first place; ABAC consumes what this layer produces.
- **JWT** — the token format that frequently carries subject attributes as claims into the PEP; understand claim verification and revocation before trusting a JWT-sourced attribute in a policy.
- **Cookies and Sessions** — the alternative to token-based identity propagation; either way, ABAC needs a verified subject before it can apply any attribute rule.
- **Open Policy Agent (OPA) / Rego** — the leading general-purpose, cloud-native policy engine used for ABAC and for infrastructure policy (Kubernetes admission control) alike.
- **AWS Cedar** — a modern, formally analyzable policy language purpose-built for authorization, used in AWS Verified Permissions.
- **Google Zanzibar / OpenFGA / Ory Keto** — the ReBAC family, the adjacent model for relationship/graph-shaped sharing that ABAC handles less naturally.
- **XACML** — the historical OASIS standard that first formalized the PDP/PEP/PAP/PIP architecture; largely superseded by Rego/Cedar for new systems but still present in legacy enterprise identity stacks.
- **OWASP Top 10** — broken access control has been the top-ranked vulnerability category since 2021; this page's Security section maps directly onto that risk category.
- **Kubernetes** — the most widespread real-world deployment target for OPA policies outside application-level authorization.

On this platform, the natural next pages after this one: **OAuth 2.0/OIDC** → **JWT** → **Cookies and Sessions** round out the Authentication category; **Kubernetes** and **CI/CD** connect directly to how policy-as-code actually ships in production.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check the official OPA, AWS Cedar, and NIST publication pages for anything newer.

- **Open Policy Agent** remains the dominant general-purpose policy engine, CNCF Graduated since 2021, with continued investment in performance (partial evaluation, batch decision APIs) and in its Gatekeeper Kubernetes integration.
- **AWS Cedar**, open-sourced in 2023, continues to expand beyond AWS Verified Permissions and Amazon Verified Access into third-party adoption as a standalone, formally-analyzable authorization language — its differentiator (automated policy analysis/verification) is increasingly cited as the reason teams choose it over Rego for pure authorization use cases.
- **ReBAC tooling (OpenFGA, Ory Keto)** has matured significantly as an accessible, open-source alternative to building a Zanzibar-style system from scratch, and is increasingly used alongside ABAC rather than as a replacement for it.
- **AI-agent authorization** is an active, fast-moving area as of this writing: as AI agents make autonomous tool calls and API requests on behalf of users, teams are extending ABAC-style policy (subject equals the agent plus the user it acts for, environment equals which tool/model is invoking the call, resource equals the API or data being touched) to govern what an agent is allowed to do — expect this to be one of the fastest-evolving areas of authorization practice over the next few years.
- **NIST SP 800-162** itself has not been substantially revised since its 2014 publication, but continues to be the most-cited reference architecture document for ABAC; always check nist.gov for the current revision status.

Ecosystem shift worth noting: policy-as-code discipline (Git-versioned policies, CI-tested, shadow-mode rollouts) has gone from "advanced practice" to "expected baseline" at companies running ABAC seriously — treat the Best Practices and Production Checklist sections of this page as the current industry floor, not the ceiling.
`,

  "future-roadmap": `
Where ABAC and adjacent authorization models are heading:

1. **AI-agent-aware authorization becomes its own discipline.** As agentic AI systems make chained tool calls and API requests on a user's behalf, ABAC policies increasingly need to reason about "on whose authority" and "through how many delegation hops" a request arrived — an environment/context attribute category that barely existed before agentic AI became common. Betting career time on understanding delegation chains and scoped, attenuated permissions for agents is a strong wager for the next several years.
2. **Formal verification of policies goes mainstream.** Cedar's design (policies analyzable by automated theorem-proving-adjacent tooling) points at where the field is heading: being able to prove a policy set can never grant an unintended permission, rather than only testing example cases, will likely become expected for high-stakes authorization systems.
3. **Convergence of ABAC and ReBAC tooling.** Expect policy engines to increasingly support both attribute conditions and relationship-graph traversal in one system, rather than forcing teams to run two separate engines for two adjacent authorization needs.
4. **Attribute freshness gets first-class tooling.** As the performance/freshness tradeoff (Performance and Scalability sections) becomes better understood industry-wide, expect more policy engines to support per-attribute staleness budgets and event-driven invalidation as a built-in primitive rather than something every team hand-rolls.
5. **Policy-as-code becomes as standard as infrastructure-as-code.** The Git-versioned, CI-tested, shadow-mode-rolled-out policy workflow described in this page is likely to become as unremarkable and expected as Terraform-managed infrastructure is today.

For your career: the durable, transferable skill is not memorizing one policy language's syntax — it is the PDP/PEP/PAP/PIP mental model, the fail-closed discipline, and the judgment to know when RBAC alone is enough versus when context genuinely demands ABAC or ReBAC.
`,

  "cheat-sheet": `
~~~text
--- The four attribute categories (NIST SP 800-162) ---
Subject:     who — role, department, clearance, id
Resource:    what — owner, classification, tags, status
Action:      the verb — read, write, delete, approve
Environment: context — time, IP/zone, device trust, risk score

--- Reference architecture ---
PEP  Policy Enforcement Point  — intercepts request, enforces verdict
PDP  Policy Decision Point     — evaluates policy, returns permit/deny
PIP  Policy Information Point  — fetches missing attributes (DB, IdP, HR)
PAP  Policy Administration Point — where policies are authored/versioned

--- The running policy example ---
allow if:
  subject.role == "doctor"
  and resource.assigned_to == subject.id
  and resource.patient_consent == true
  and environment.time is within business hours

--- Combining algorithms ---
deny-overrides   any matching deny wins        (safe default)
permit-overrides any matching permit wins      (rare — availability > restriction)
first-applicable first matching rule wins      (order-sensitive, riskier)

--- Rego (OPA) skeleton ---
package myapp.authz
default allow := false
allow if {
    input.subject.role == "doctor"
    input.resource.assigned_to == input.subject.id
}

--- Cedar skeleton ---
permit(principal, action == Action::"view", resource)
when { principal.role == "doctor" && resource.assignedTo == principal.id };

--- FastAPI PEP pattern ---
async def authorize(request, resource, action):
    try:
        result = await call_pdp(subject, resource, action, environment)
    except Exception:
        raise HTTPException(503)   # fail CLOSED, never open
    if not result:
        raise HTTPException(403)

--- Comparison at a glance ---
ACL   per-resource list        -- small static sets
RBAC  role membership          -- coarse "what kind of user"
ABAC  attribute rules          -- context-sensitive decisions
ReBAC relationship graph       -- nested sharing structures

--- Golden rules ---
1. Deny by default, everywhere, always
2. Never trust a client-asserted attribute unverified
3. Externalize the PDP — never scatter checks in business logic
4. Cache attributes deliberately: short TTL for revocation-sensitive ones
5. Log every decision, permit AND deny, with policy version
6. Hybrid RBAC-then-ABAC beats pure ABAC on every request
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What are the four ABAC attribute categories? | Subject, resource/object, action, environment |
| What does PDP stand for? | Policy Decision Point — evaluates policy, returns permit/deny |
| What does PEP stand for? | Policy Enforcement Point — intercepts the request and enforces the verdict |
| What does PIP stand for? | Policy Information Point — fetches attributes not already present in the request |
| What does PAP stand for? | Policy Administration Point — where policies are authored and versioned |
| What is the safe default when no policy matches? | Deny (fail closed) |
| Deny-overrides vs permit-overrides? | Deny-overrides: any deny wins (safe default). Permit-overrides: any permit wins (rare, availability-first) |
| What problem in RBAC does ABAC primarily solve? | Role explosion and RBAC's inability to reason about context |
| Name the ABAC-adjacent model based on relationship graphs | ReBAC (Google Zanzibar-style) |
| What standard first formalized ABAC for the US government? | NIST SP 800-162 (2014) |
| What is the historical, XML-based ABAC policy language? | XACML (OASIS, 2003+) |
| Name two modern ABAC/authorization policy languages | Rego (Open Policy Agent) and Cedar (AWS) |
| Why is ABAC harder to audit than RBAC? | A decision can depend on many attributes from multiple systems at one instant, not a single role flag |
| What is the biggest performance risk in ABAC? | Attribute resolution (PIP calls) — not policy evaluation itself |
| What should happen if the PDP is unreachable? | Fail closed — deny the request, never permit by default |
| What is the recommended layering with RBAC? | RBAC gate first (cheap, coarse), ABAC refine second (contextual, precise) |
| What must never be trusted unverified in a policy decision? | A client-asserted attribute (unsigned header or body field) |
`,

  mcqs: `
**1. In the NIST ABAC model, which of the following is an environment attribute?**

A) The subject's department  B) The resource's classification  C) The current time and source IP  D) The action name

**Answer: C** — environment attributes describe the context of the request (time, location, network), not the subject or resource themselves.

**2. What should a Policy Enforcement Point do if the Policy Decision Point times out?**

A) Permit the request to avoid disrupting users  B) Deny the request and log the failure  C) Retry indefinitely with no timeout  D) Ask the client to decide

**Answer: B** — fail closed. Failing open converts an availability problem into a security breach, covered throughout Anti-Patterns and Security.

**3. What is the primary problem ABAC solves that pure RBAC does not?**

A) Authentication of the subject  B) Role explosion and lack of context-awareness  C) Network encryption  D) Password storage

**Answer: B** — ABAC exists specifically to express contextual rules without enumerating a role for every combination, and to reason about facts (time, ownership, consent) RBAC has no vocabulary for.

**4. Under a deny-overrides combining algorithm, if one applicable policy permits and another applicable policy denies the same request, what is the final decision?**

A) Permit, because it was evaluated first  B) Deny  C) The system throws an error  D) Whichever policy was authored most recently wins

**Answer: B** — deny-overrides means any matching deny wins regardless of any matching permits, which is the safe, conservative default.

**5. Which of these is the correct reason ABAC decisions are harder to audit than RBAC decisions?**

A) ABAC policies cannot be version controlled  B) ABAC has no standard policy language  C) A decision can depend on many attributes from multiple systems at a specific moment, requiring a full attribute snapshot to reconstruct  D) ABAC does not support logging

**Answer: C** — this is exactly why comprehensive decision logging (subject, resource, action, environment, verdict, policy version) is treated as non-negotiable for ABAC in the Monitoring section.

**6. A client sends a request with a header claiming X-User-Role: admin. What is the correct way for a PEP to treat this?**

A) Trust it directly since the client knows its own role  B) Ignore it entirely and only use attributes sourced from a verified identity token or authoritative system  C) Trust it only for GET requests  D) Cache it for future requests

**Answer: B** — a client-asserted attribute is user input, not a verified fact, and must never drive a security decision without independent verification — the core trust-boundary lesson of Advanced Concepts and Security.
`,

  "revision-notes": `
**The model in five lines:** ABAC computes access decisions at request time from subject, resource, action, and environment attributes, instead of from a fixed role or per-resource list. The canonical policy example throughout this page: a doctor may view a patient record only if assigned, during business hours, with consent on file. NIST SP 800-162 (2014) is the formal reference document. ABAC exists specifically to solve RBAC's role explosion and its blindness to context.

**Architecture in four lines:** PEP intercepts the request and gathers attributes; PDP evaluates the applicable policy (published by the PAP) and returns permit/deny; PIP resolves any attribute not already present, typically from a database, directory, or identity provider. The PDP is deliberately externalized so policy changes never require an application redeploy.

**Policy languages in three lines:** XACML (2003, OASIS) was the original, verbose, XML-based standard. Rego (Open Policy Agent) is today's dominant general-purpose policy language, used for both application authorization and infrastructure policy like Kubernetes admission control. Cedar (AWS, 2023) trades some generality for readability and formal, provable analysis.

**Production reality in five lines:** Nearly every real system runs hybrid RBAC-then-ABAC, not pure ABAC on every request — a cheap role gate first, contextual attribute refinement second. Deny by default, everywhere, including on PDP failure — fail closed, never open. Attribute resolution, not policy evaluation, is almost always the real performance bottleneck; cache deliberately with per-attribute TTLs, shortest for revocation-sensitive attributes. Never trust a client-asserted attribute without verification against an authoritative source. Log every decision, permit and deny, with the full attribute snapshot and policy version — ABAC's auditability weakness compared to RBAC is real and this is the direct mitigation.

**Interview reflexes:** PDP/PEP/PAP/PIP roles and who talks to whom; deny-overrides versus permit-overrides; why fail-closed is non-negotiable; ABAC vs RBAC vs ACL vs ReBAC and when each wins; the attribute trust-boundary problem; why ABAC decisions are harder to explain and what decision logging buys you.
`,

  "learning-roadmap": `
A realistic path to production-grade ABAC fluency, assuming you already know the **RBAC** basics:

**Week 1 — Foundations.** Overview through Prerequisites, then Beginner Concepts. Write the hand-rolled Python evaluator from Beginner Concepts and Coding Questions problem 1 yourself, from a blank file. Milestone: you can explain the four attribute categories and the running doctor/patient policy without notes.

**Week 2 — Architecture and policy languages.** Internal Working, Architecture, Data Flow, and Intermediate Concepts. Install OPA locally, write the hospital policy in Rego, and get opa eval returning the right answer for three different inputs. Milestone: you can draw the PDP/PEP/PAP/PIP diagram from memory and explain each arrow.

**Week 3 — Testing and hybrid design.** Advanced Concepts and the Testing section. Complete Hands-on Lab 2 (full opa test suite). Design, on paper, a hybrid RBAC-then-ABAC layering for a system you know well. Milestone: a passing test suite covering both permit and deny paths, including a combining-algorithm conflict case.

**Week 4 — Production integration.** Production Usage, Deployment, Performance, Scalability. Complete Hands-on Lab 3 (FastAPI plus OPA sidecar, fail-closed verified by killing the container). Milestone: a working Docker Compose demo where authorization survives a policy container crash correctly (503, not 200).

**Week 5 — Observability and hardening.** Security, Monitoring, common Mistakes/Errors/FAQs. Complete Hands-on Lab 4 (caching plus load test, with a written before/after latency comparison). Milestone: you can quote real P95 latency numbers from your own load test and explain, with data, why the attribute fetch — not the policy evaluation — dominated.

**Week 6 — Interview and portfolio polish.** Interview and Coding Questions sections; start Real Project 1 or 2. Milestone: explain PDP/PEP/PAP/PIP, deny-overrides vs permit-overrides, and the ABAC-vs-RBAC-vs-ReBAC decision framework out loud, unprompted.

Then continue to **OAuth 2.0/OIDC** on this platform — ABAC assumes a verified subject, and that page covers exactly how identity and claims get established in the first place.
`,

  "official-docs": `
- NIST Special Publication 800-162, "Guide to Attribute Based Access Control (ABAC) Definition and Considerations" — the foundational reference document defining the ABAC model and attribute taxonomy used throughout this page; search nist.gov for the current publication link.
- OASIS XACML 3.0 specification — the historical, formally standardized ABAC policy language and PDP/PEP/PAP/PIP reference architecture; still the precise vocabulary source for the four-component model.
- Open Policy Agent documentation (openpolicyagent.org) — Rego language reference, policy testing (opa test), bundle deployment, and the Gatekeeper Kubernetes integration.
- AWS Cedar documentation and the Cedar policy language specification — syntax, the formal analysis tooling, and Amazon Verified Permissions integration.
- The Google Zanzibar paper ("Zanzibar: Google's Consistent, Global Authorization System," USENIX ATC 2019) — the primary source for the adjacent ReBAC model discussed in Advanced Concepts and Comparisons.
- OWASP Access Control cheat sheet and Top 10 documentation — the broader vulnerability-class context for the Security section.
`,

  books: `
- **"Guide to Attribute Based Access Control" (NIST SP 800-162)** — Hu, Ferraiolo, Kuhn, et al. Not a commercial book, but the closest thing ABAC has to a definitive text; read it before anything else on this topic.
- **"Solving Identity and Access Management in Modern Applications"** — Yvonne Wilson and Abhishek Hingnikar. Covers ABAC alongside OAuth/OIDC/RBAC in the context of real application architecture, which pairs well with this platform's Authentication category.
- **"Zero Trust Networks"** — Evan Gilman and Doug Barth. Not ABAC-specific, but the environment-attribute-driven, continuously-verified authorization model it describes is the same philosophy ABAC's environment attributes formalize.
- **"Cloud Native Security Cookbook"** — Josh Armitage. Practical patterns for policy-as-code (OPA in particular) in real cloud-native deployments, directly relevant to the Deployment and Production Usage sections.
- **"API Security in Action"** — Neil Madden. Strong treatment of authorization patterns (including attribute-based conditions) at the API layer, complementing the FastAPI worked examples on this page.
`,

  blogs: `
- **The Open Policy Agent blog and documentation site** (openpolicyagent.org) — the primary source for Rego language changes, bundle deployment patterns, and Gatekeeper updates.
- **AWS Security Blog** — regular deep dives on IAM ABAC (tag-based conditions) and Cedar/Verified Permissions design decisions, written by the teams that build them.
- **Styra blog** — the company behind OPA's commercial tooling; consistently high-signal writing on policy-as-code practice, testing, and rollout patterns.
- **Auth0/Okta engineering blogs** — frequent, practical comparisons of RBAC, ABAC, and ReBAC aimed at engineers actually building authorization layers, not just academic treatments.
- **Google's engineering blog posts accompanying the Zanzibar paper** — useful for understanding the ReBAC adjacent model referenced throughout Comparisons and Advanced Concepts.
`,

  "research-papers": `
ABAC itself is more of a standards and systems-engineering topic than an academic-paper-heavy one — the field is thin on peer-reviewed papers specifically titled "ABAC" compared to adjacent areas, so the highest-signal reading is standards documents and systems papers from teams operating these systems at scale:

- **NIST Special Publication 800-162** (Hu, Ferraiolo, Kuhn, et al., 2014) — the closest thing to a foundational "paper" for ABAC; formally defines the model and architecture used throughout this page.
- **"Zanzibar: Google's Consistent, Global Authorization System"** (USENIX ATC, 2019) — the primary systems paper for the adjacent ReBAC model; essential reading for understanding how ABAC and relationship-based authorization relate and differ.
- **The XACML 3.0 OASIS specification** (2013) — while a standard rather than a research paper, it is the rigorous formal treatment of combining algorithms and the PDP/PEP/PAP/PIP architecture this page relies on.
- **"Guide to Attribute Based Access Control (ABAC) Definition and Considerations"** cross-references earlier RBAC formalization work by Ferraiolo, Kuhn, and Sandhu (early-to-mid 1990s NIST publications) — read those as the closest foundational academic grounding for why ABAC's predecessor model needed extending.

If you want genuinely academic treatment, the closest adjacent literature is in formal-methods papers on policy verification (the research underpinning Cedar's provable-safety properties) — search for AWS's published work on Cedar's formal semantics for the most current, rigorous material in this space.
`,

  videos: `
- **Open Policy Agent official YouTube channel and KubeCon talks** — regular deep dives from the OPA maintainers on Rego internals, bundle architecture, and Gatekeeper; the best source for seeing real production configurations explained by the people who built them.
- **AWS re:Invent talks on Cedar and Amazon Verified Permissions** — the design rationale for Cedar's formal-verification approach, straight from the team that built it.
- **"Zanzibar" conference talks from Google engineers** (various USENIX/industry conference recordings) — walk through the ReBAC model's design tradeoffs in a way the paper alone does not always make intuitive.
- **Styra's OPA tutorial series** — practical, hands-on Rego walkthroughs aimed at engineers implementing their first real policy set, a good companion to this page's Hands-on Labs.
- **Conference talks on "policy as code" from KubeCon and platform-engineering conferences generally** — search for recent years' talks specifically, since this is a fast-moving practice area and older talks age quickly on tooling specifics even though the underlying architecture (PDP/PEP/PAP/PIP) stays stable.
`,

  "github-repos": `
- open-policy-agent/opa — the OPA engine source itself; read the topdown evaluator to see how Rego is actually executed.
- open-policy-agent/gatekeeper — Kubernetes admission control built on OPA; the most widely deployed real-world ABAC-style system in the wild.
- cedar-policy/cedar — the Cedar language implementation and its formal-verification tooling, open-sourced by AWS.
- openfga/openfga — an open-source, Zanzibar-inspired ReBAC engine; excellent for understanding how the adjacent relationship-based model differs from ABAC in actual code.
- ory/keto — another open-source Zanzibar-style authorization server, useful for comparing design choices against OpenFGA.
- open-policy-agent/library — a community collection of reusable Rego policy examples across many domains (Kubernetes, Terraform, Docker, application-level authorization).
- casbin/casbin — a lighter-weight, multi-language authorization library supporting ACL, RBAC, and ABAC models side by side; useful for seeing all three models expressed in one consistent framework.
- permitio/opal — an open-source project for real-time policy and data synchronization to OPA instances at scale, directly relevant to the bundle-distribution and freshness tradeoffs covered in Performance and Scalability.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Core model fluency*: implement the PolicyEvaluator from Coding Questions from scratch, then extend it to support both deny-overrides and permit-overrides as a configurable mode.
2. *Policy language fluency*: rewrite the hospital patient-record policy in both Rego and Cedar, then write the equivalent opa test suite for the Rego version, covering at least five distinct scenarios (permit, deny for each of the three conditions individually, and a legal-hold override).
3. *Attribute performance*: build the TTLAttributeCache from Coding Questions, then simulate 1,000 requests against an artificially slow (100ms) attribute source with and without caching, and report the P50/P95/P99 latency difference.
4. *Architecture design*: design (on paper or in a README) a hybrid RBAC-then-ABAC layering for a multi-tenant SaaS product of your choosing, explicitly stating your combining algorithm and your fail-closed behavior for every failure mode you can think of.
5. *Batch evaluation*: extend the filter_viewable function from Coding Questions to handle a policy that needs a PIP lookup per record, and prove (with timing) that batch-fetching attributes for all records first beats fetching per record inside the loop.
6. *Security-focused*: given a request containing both a verified JWT and a client-supplied header claiming a role, write code that correctly ignores the header and uses only the JWT-sourced claim — then write a test that would fail if someone accidentally trusted the header instead.
7. *End-to-end*: complete Hands-on Lab 3 (FastAPI plus OPA sidecar) and Lab 4 (caching plus load test) in full, with a short written report of what you measured.

External sets: OWASP's Access Control cheat sheet exercises, the Open Policy Agent official tutorials (playground.openpolicyagent.org for interactive Rego practice), and Casbin's example repository for comparing ACL/RBAC/ABAC implementations side by side in one codebase.
`,

  "architecture-diagram": `
The reference production architecture for an ABAC-secured AI-era backend — the shape this page's Deployment and Architecture sections build toward:

~~~mermaid
flowchart TB
    Client["Clients (web / mobile / AI agent)"] --> GW["API gateway / load balancer"]
    GW --> API1["FastAPI pod 1 (PEP)\n+ OPA sidecar (PDP)"]
    GW --> API2["FastAPI pod N (PEP)\n+ OPA sidecar (PDP)"]
    API1 & API2 -->|"resource attributes"| DB[("Application database")]
    API1 & API2 -->|"cached subject attributes"| RD[("Redis attribute cache\nper-attribute TTL")]
    RD -.miss.-> HR[("HR / directory / IdP\n(system of record)")]
    API1 & API2 -->|"bundle poll every 30-60s"| Bundle[("Policy bundle store\n(PAP — Git-backed, CI-tested)")]
    API1 & API2 -->|"decision logs"| Logs[("Structured logs\n(permit + deny, policy version)")]
    subgraph Observability
        PR["Prometheus: decision rate,\nPDP latency, cache hit rate"] --> GF["Grafana / alerting"]
    end
    API1 -.metrics.-> Observability
    W1["Async worker pool\n(AI agent tool calls also PEP-gated)"] --> API1
~~~

Every box maps to a section of this page: the sidecar placement is Architecture, the bundle polling is Production Usage and Scalability, the Redis cache is Performance, and the decision logs feed directly into Monitoring and the auditability discussion in Security.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((ABAC))
    Model
      Subject attributes
      Resource attributes
      Action
      Environment attributes
      NIST SP 800-162
    Architecture
      PEP enforcement point
      PDP decision point
      PIP information point
      PAP administration point
      Combining algorithms
    Policy languages
      XACML historical
      Rego / Open Policy Agent
      Cedar
      Casbin multi-model
    Adjacent models
      RBAC the simpler base
      ACL per-resource lists
      ReBAC Zanzibar-style
      Hybrid RBAC plus ABAC
    Production concerns
      Fail closed always
      Attribute caching and TTLs
      Decision logging
      Auditability and explainability
      Performance: PIP is the bottleneck
    Security
      Trust boundaries on attributes
      TOCTOU windows
      Confused deputy risks
      OWASP broken access control
    Career
      Interview: PDP/PEP/PAP/PIP
      Coding: policy evaluators
      Projects and labs
      Next: OAuth 2.0/OIDC and JWT
~~~
`,
};

export default abac;
