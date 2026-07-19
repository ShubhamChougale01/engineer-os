import type { SkillContent } from "../types";

/**
 * RBAC (Role-Based Access Control) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const rbac: SkillContent = {
  overview: `
Role-Based Access Control (RBAC) is an authorization model that decides what an already-identified user is allowed to do by grouping permissions into named roles and assigning those roles to users, instead of granting permissions to individuals one by one. A user gets access not because "Priya can approve invoices" is written down somewhere, but because Priya is assigned the Finance-Approver role, and that role carries the invoices:approve permission. Change what Finance-Approver can do, and every Finance-Approver instantly inherits the change — you never touch a user record.

RBAC is the dominant authorization model in production software: it is how AWS IAM, Kubernetes, Azure, Salesforce, Snowflake, GitHub organizations, and virtually every internal admin panel decide who can see and do what. For an AI engineer this matters in three concrete places — building multi-tenant SaaS backends where different customers' staff need different access, scoping what an AI agent's tool-calling layer is permitted to touch (agents are, functionally, non-human users that need the same least-privilege discipline), and operating the Kubernetes clusters that run inference and training workloads, where RBAC is the literal access-control mechanism for the cluster API.

RBAC is formalized by a NIST standard (later ANSI INCITS 359-2004) built around four core entities: Users, Roles, Permissions, and Sessions. A Permission is an approval to perform an operation on an object (invoices:approve, pods:list). A Role is a named collection of permissions that mirrors a job function (Approver, Auditor, Admin). A Session is the runtime instant where a user activates some subset of their assigned roles for a period of work. This indirection — user to role to permission, rather than user to permission directly — is the entire idea, and everything else (hierarchies, constraints, multi-tenant scoping) is refinement on top of it.

Key characteristics: RBAC is fundamentally identity-agnostic about context — it answers "does this role have this permission" without looking at time of day, resource ownership, or request attributes. That is a deliberate trade-off: it makes RBAC easy to reason about and audit, but it is also RBAC's defining limitation. When you need "an editor can only edit documents they own" or "approve only during business hours," you need attribute-awareness — that is exactly what the ABAC skill on this platform covers as the next step up in flexibility. RBAC also sits strictly downstream of authentication: OAuth 2.0/OIDC, JWT, and Cookies & Sessions (see those skills) establish WHO is making the request; RBAC decides WHAT that identity may do once it is inside your system.
`,

  history: `
RBAC's roots are in 1970s military and government access-control research — Discretionary Access Control (DAC, owners grant access) and Mandatory Access Control (MAC, a central authority enforces classification levels like Bell-LaPadula). Both worked for their niches but were a poor fit for ordinary commercial IT, where access maps to job function, not military clearance or file ownership.

David Ferraiolo and Rick Kuhn, researchers at the U.S. National Institute of Standards and Technology (NIST), published the paper that named and formalized the model in 1992, observing that most organizations were already informally assigning "roles" to staff and that formalizing role-to-permission mapping as the unit of access control would make administration tractable at scale. Ravi Sandhu and colleagues extended this into the influential RBAC96 family of models (RBAC0 through RBAC3), which introduced role hierarchies and constraints as separate, composable dimensions. NIST and INCITS later merged this research into a single ratified standard.

| Year | Milestone |
|------|-----------|
| 1970s | Bell-LaPadula (MAC) and early DAC models dominate — built for military classification, not business roles |
| 1992 | Ferraiolo and Kuhn publish "Role-Based Access Control," formally naming and defining the model at NIST |
| 1996 | Sandhu, Coyne, Feinstein, and Youman publish the RBAC96 family: RBAC0 (flat), RBAC1 (+ hierarchies), RBAC2 (+ constraints), RBAC3 (both) |
| 2000 | NIST proposes a unified RBAC standard, consolidating academic variants into one reference model |
| 2004 | ANSI INCITS 359-2004 ratified — RBAC becomes a formal American National Standard |
| 2000s | Enterprise IAM goes mainstream: Windows Active Directory groups, LDAP group-based ACLs, early SaaS admin panels all implement RBAC informally |
| 2006 | AWS launches; IAM (added 2010) becomes the reference implementation of cloud RBAC-plus-policy at massive scale |
| 2017 | Kubernetes 1.6 makes RBAC the default authorization mode, replacing the older, coarser ABAC file-based mode |
| 2019 | Google publishes the Zanzibar paper, describing a relationship-based (ReBAC) authorization system built to solve problems RBAC alone could not — the modern rival/complement to RBAC at hyperscale |
| 2020s | SaaS platforms hit "role explosion" at scale and increasingly adopt hybrid RBAC+ABAC/ReBAC (Cedar, OpenFGA, SpiceDB, OPA) rather than pure RBAC |

The throughline: RBAC won because it matches how organizations already think (job functions), and every subsequent access-control model (ABAC, ReBAC) exists to patch RBAC's specific blind spots rather than replace it outright — most production systems today layer RBAC (coarse, role-level gating) underneath ABAC or ReBAC (fine-grained, contextual decisions).
`,

  "why-it-exists": `
Before RBAC was formalized, the default was granting permissions directly to individuals — Discretionary Access Control. A file owner or system admin decided, per user, per resource: "Bob can read this," "Alice can write that." This works fine for a filesystem shared by a handful of people. It collapses at organizational scale for a structural reason: employees join, leave, and change roles constantly, but the permissions that were granted to them as individuals do not move with them. Every reorg, every promotion, every offboarding meant hunting down and editing potentially hundreds of individual access-control entries scattered across systems.

The alternative that existed — Mandatory Access Control — solved a different problem (preventing declassification in military/government systems) with a rigid, centrally-administered classification lattice. It was never designed for "which of our 200 employees can approve a purchase order," and forcing business permissions into MAC's clearance-level model was awkward and inflexible.

The gap RBAC filled: organizations already organize people by job function (Accountant, Manager, Support Agent). What was missing was a formal indirection layer that let administrators grant and revoke permissions to that function once, and have every current and future occupant of that function inherit the change automatically. Provisioning a new hire becomes "assign them the Support Agent role" instead of manually replicating another Support Agent's dozen individual grants. Offboarding becomes "remove their role assignments" instead of an audit of everything they might have touched.
`,

  "problem-it-solves": `
RBAC concretely removes:

- **Per-user permission sprawl.** Permissions are granted to a role once; a thousand users in that role inherit it identically. Onboarding and offboarding become single operations (assign/remove a role) instead of N individual grants.
- **Untraceable access.** "Who can approve refunds over ten thousand dollars?" becomes a query against role assignments (who holds Refund-Approver) instead of a manual audit of every user's individual permission set. This is the difference between an auditable system and an unauditable one.
- **Drift between org structure and system access.** Roles map to job functions, so access control naturally mirrors how the business already thinks and communicates, instead of an ad hoc parallel structure only engineers understand.
- **Unenforceable segregation policies.** With roles as first-class objects, you can express and mechanically enforce rules like "no single person may both create and approve a payment" (separation of duties) — something that is nearly impossible to police when permissions are scattered per user.

What RBAC deliberately does **not** solve:

- **Context-aware decisions.** RBAC cannot natively express "editors may edit documents they own" or "managers may approve expenses only for their own direct reports" or "block access outside business hours." A role check is blind to the specific resource instance and the surrounding request context — it only knows the role's static permission set. This exact limitation is what the ABAC skill on this platform addresses; ABAC evaluates attributes of the user, resource, and environment at decision time, so treat RBAC and ABAC as complementary layers, not competitors.
- **Authentication.** RBAC assumes you already know who the caller is. Establishing that identity is the job of the OAuth 2.0/OIDC, JWT, and Cookies & Sessions skills — RBAC starts exactly where those leave off.
- **Relationship-based access** (Alice can edit any document in a folder Bob shared with her) — that is the territory of ReBAC systems like Google's Zanzibar, SpiceDB, and OpenFGA, covered briefly in Comparisons.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the NIST RBAC model precisely: Users, Roles, Permissions, Sessions, and how they compose.
2. Distinguish RBAC0 (flat), RBAC1 (hierarchical), RBAC2 (constrained), and RBAC3 (hierarchical + constrained) and know which one a real system is using.
3. Clearly separate authentication (who you are) from authorization (what you can do) and place OAuth/JWT/Cookies correctly on one side of that line and RBAC on the other.
4. Implement a production-grade RBAC permission check in a FastAPI/SQLAlchemy backend using dependency injection, including role hierarchy resolution.
5. Recognize and mitigate the role explosion problem in large organizations.
6. Design multi-tenant, organization-scoped role assignment so the same user can hold different roles in different tenants.
7. Read and write Kubernetes Role, ClusterRole, and RoleBinding manifests and explain how they map onto the NIST model.
8. Compare RBAC against ACLs, ABAC, and ReBAC, and justify which to reach for given a concrete scenario.
9. Apply the principle of least privilege and design an auditable role-assignment process.
10. Answer senior-level interview questions on separation of duties, role explosion, and multi-tenant RBAC design.
`,

  prerequisites: `
- **Required**: basic backend web development (HTTP, REST endpoints), a working idea of what a database table and a foreign key are. This page starts from zero RBAC knowledge.
- **Required conceptually**: an understanding that authentication and authorization are different problems. If that distinction is fuzzy, read the **JWT** or **Cookies & Sessions** skill's overview first — RBAC assumes identity is already resolved.
- **Helpful**: familiarity with **OAuth 2.0 / OIDC** (how identity and claims arrive at your backend), SQL (many-to-many join tables), and basic Kubernetes concepts if you want the K8s RBAC sections to land fully.
- **For the worked backend example**: comfort with FastAPI-style dependency injection and SQLAlchemy ORM models is assumed but re-taught from first principles in Intermediate Concepts.

Dependency links on this platform: **OAuth 2.0/OIDC**, **JWT**, **Cookies & Sessions** (establish identity) → this page (decide access) → **ABAC** (the context-aware evolution) → **Kubernetes** (a real-world RBAC deployment at infrastructure scale).
`,

  "beginner-concepts": `
### The four NIST entities

RBAC's entire vocabulary is four nouns:

~~~text
User        — a human or service identity (already authenticated)
Role        — a named job function, e.g. "Editor", "Billing-Admin"
Permission  — an approval to perform an operation on an object, e.g. "invoices:approve"
Session     — the runtime instant a user activates some of their roles to do work
~~~

The relationships: a User is assigned zero or more Roles. A Role is granted zero or more Permissions. A User's effective permissions in a Session are the union of permissions across the roles they have activated. Nobody is ever granted a permission directly — that indirection through Role is the whole point.

### A minimal example, in plain data

~~~text
Roles:
  Viewer  -> [documents:read]
  Editor  -> [documents:read, documents:write]
  Admin   -> [documents:read, documents:write, documents:delete, users:manage]

Users:
  alice -> [Viewer]
  bob   -> [Editor]
  carol -> [Admin]
~~~

Alice can read documents but not write them. Bob can read and write. Carol can do everything, including managing other users. Promoting Bob from Editor to Admin is a single role reassignment — nobody edits a giant list of Bob's individual permissions.

### The simplest possible check, in code

~~~python
# The absolute minimum RBAC check — no database yet, just to build intuition.
ROLE_PERMISSIONS = {
    "viewer": {"documents:read"},
    "editor": {"documents:read", "documents:write"},
    "admin":  {"documents:read", "documents:write", "documents:delete", "users:manage"},
}

USER_ROLES = {
    "alice": {"viewer"},
    "bob": {"editor"},
    "carol": {"admin"},
}

def has_permission(username: str, permission: str) -> bool:
    """A user's effective permissions are the union across all their roles."""
    roles = USER_ROLES.get(username, set())
    effective = set()
    for role in roles:
        effective |= ROLE_PERMISSIONS.get(role, set())
    return permission in effective

assert has_permission("alice", "documents:read") is True
assert has_permission("alice", "documents:write") is False
assert has_permission("carol", "users:manage") is True
~~~

### Naming permissions

A production convention worth adopting immediately: name permissions as "resource:action" pairs (invoices:approve, users:delete, pods:list). This gives you a flat, greppable, sortable namespace and makes "list every permission touching invoices" a simple string filter.

### Authorization vs authentication — the line that matters

Before going further, fix this distinction firmly: authentication proves identity ("this bearer token belongs to user 482, verified by signature"); authorization decides access ("user 482 holds the Editor role, which permits documents:write"). The **JWT** skill covers how the token in the example above gets verified and trusted; RBAC only starts once that trust already exists. Conflating the two — for example, treating "the request has a valid token" as "the request is allowed" — is the single most common authorization bug, covered again in Anti-Patterns and Common Mistakes.
`,

  "intermediate-concepts": `
### Role hierarchies — RBAC1

Real job functions nest: a Senior-Editor should get everything an Editor gets, plus more, without re-listing Editor's permissions. RBAC1 adds role hierarchies: a role can inherit from a parent role.

~~~text
Admin
  extends Senior-Editor
    extends Editor
      extends Viewer
~~~

Assigning someone Senior-Editor implicitly grants every permission of Editor and Viewer too. This mirrors org charts (a Director inherits everything a Manager inherits) and dramatically cuts duplication versus copy-pasting permission sets between similar roles.

### Constraints — RBAC2 and RBAC3

Hierarchies alone don't stop bad access combinations. RBAC2 adds constraints on top of a flat model; RBAC3 combines constraints with hierarchies. The two constraint families that matter in practice:

- **Static separation of duties (SSD)**: a user can never simultaneously hold two conflicting roles, e.g. Invoice-Creator and Invoice-Approver. Enforced at assignment time — the system refuses to assign the second conflicting role.
- **Dynamic separation of duties (DSD)**: a user may hold both roles, but can only *activate* one per session — enforced at session-activation time, not assignment time. This is looser and used when the conflict only matters at the moment of acting, not at the moment of holding the role.
- **Cardinality constraints**: e.g. "at most one active Break-Glass-Admin session at a time," or "a role may have at most N members."

~~~python
# A minimal static-SoD checker — refuse a role assignment that creates a conflict.
CONFLICTING_ROLE_PAIRS = {
    frozenset({"invoice-creator", "invoice-approver"}),
    frozenset({"payment-initiator", "payment-approver"}),
}

def assign_role(user_roles: set, new_role: str) -> None:
    proposed = user_roles | {new_role}
    for pair in CONFLICTING_ROLE_PAIRS:
        if pair.issubset(proposed):
            raise ValueError(
                "Separation-of-duties violation: cannot hold " + " and ".join(sorted(pair))
            )
    user_roles.add(new_role)
~~~

### A real backend: FastAPI + SQLAlchemy dependency-injection pattern

This platform's own backend already uses a permission-check dependency (require_admin) that inspects the authenticated user and raises 403 for non-admins. RBAC generalizes that exact pattern into named, database-backed permissions instead of a single is_admin flag.

~~~python
# models.py — many-to-many User<->Role and Role<->Permission, plus RBAC1 hierarchy
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.db import Base

user_roles = Table(
    "user_roles", Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
)

role_permissions = Table(
    "role_permissions", Base.metadata,
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id"), primary_key=True),
)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)   # e.g. "invoices:approve"

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("roles.id"), nullable=True)   # RBAC1 hierarchy
    parent = relationship("Role", remote_side=[id])
    permissions = relationship("Permission", secondary=role_permissions)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    roles = relationship("Role", secondary=user_roles)
~~~

~~~python
# rbac.py — resolve a user's effective permissions, walking the role hierarchy
def resolve_role_permissions(role, seen=None) -> set:
    """Union of a role's own permissions and everything it inherits, cycle-safe."""
    if seen is None:
        seen = set()
    if role.id in seen:
        return set()          # guard against a misconfigured hierarchy cycle
    seen.add(role.id)
    perms = {p.name for p in role.permissions}
    if role.parent is not None:
        perms |= resolve_role_permissions(role.parent, seen)
    return perms

def effective_permissions(user) -> set:
    perms: set = set()
    for role in user.roles:
        perms |= resolve_role_permissions(role)
    return perms
~~~

~~~python
# deps.py — the FastAPI dependency-injection permission check, generalizing require_admin
from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user   # existing authentication dependency

def require_permission(permission: str):
    """Dependency FACTORY: returns a dependency that checks one specific permission.

    Usage: Depends(require_permission("invoices:approve"))
    This is the direct generalization of this platform's own require_admin dependency —
    instead of one hardcoded is_admin flag, it checks membership in a named permission set.
    """
    def _check(user = Depends(get_current_user)) -> object:
        if permission not in effective_permissions(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Missing permission: " + permission,
            )
        return user
    return _check
~~~

~~~python
# routers/invoices.py — using the dependency
from fastapi import APIRouter, Depends
from app.deps import require_permission

router = APIRouter()

@router.post("/invoices/{invoice_id}/approve")
def approve_invoice(invoice_id: int, user = Depends(require_permission("invoices:approve"))):
    # By the time this function body runs, authentication AND authorization
    # have both already passed — the handler only contains business logic.
    ...
~~~

Production consideration: effective_permissions hits the database on every request unless cached. Cache the resolved permission set per user (keyed by a version/etag that bumps on any role or permission change) in Redis or an in-process TTL cache — see Performance for the invalidation strategy.

### Static vs dynamic role assignment

Static assignment is what the examples above show: a role is assigned to a user ahead of time and stays until explicitly revoked. Dynamic assignment activates a role only for a bounded window — just-in-time (JIT) access, break-glass emergency admin, or a workflow-driven temporary elevation ("on-call engineer gets Prod-Debugger for 4 hours"). Dynamic assignment shrinks the standing attack surface (nobody sits on unused elevated access) at the cost of needing an expiry and approval mechanism — the domain of Privileged Access Management (PAM) tooling.
`,

  "advanced-concepts": `
### Role explosion

The pathology that eventually hits every large RBAC deployment: as an organization tries to model more nuance ("Editor for Region A," "Editor for Region A during Q4," "Editor for Region A except payroll documents"), the number of distinct roles grows combinatorially with the number of dimensions you try to capture — region, department, resource type, time window. A company can end up with thousands of near-duplicate roles that nobody fully understands, each drifting slightly out of sync with the others. Symptoms: role names nobody can explain, roles with a single member, and permission audits that take days.

Mitigations, roughly in order of how much they change your architecture:

1. **Parameterize roles instead of enumerating them.** One Editor role plus a scope attribute (region=A) resolved at check time, instead of Editor-Region-A, Editor-Region-B, Editor-Region-C as separate roles.
2. **Push the parameterization into a genuine attribute check** — this is precisely the point where teams migrate the fine-grained dimension into ABAC and keep RBAC only for the coarse, stable layer (see the ABAC skill: "can this role even touch this resource type" stays RBAC; "does this specific instance belong to this user's team" becomes an attribute rule).
3. **Periodic role mining / cleanup**: analyze actual permission usage and merge or delete roles nobody effectively uses — an access-governance process, not a one-time fix.

### Multi-tenant RBAC — organization-scoped roles

A single-tenant role table (user_id, role_id) breaks the moment one person needs different access in different organizations — a contractor who is Admin for Client A and read-only Viewer for Client B. The fix is to scope the assignment, not the role definition:

~~~python
# user_roles now carries a tenant/organization scope
user_org_roles = Table(
    "user_org_roles", Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("org_id", ForeignKey("organizations.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
)

def effective_permissions_in_org(user, org_id: int) -> set:
    """Same resolution as before, but only over roles assigned within this org."""
    roles_in_org = [r for (u_id, o_id, r) in user.org_role_rows if o_id == org_id]
    perms: set = set()
    for role in roles_in_org:
        perms |= resolve_role_permissions(role)
    return perms
~~~

The role definitions (Admin, Editor, Viewer) stay global and reusable; only the *assignment* is tenant-scoped. Every permission check in a multi-tenant system must therefore take two inputs — the permission AND the tenant/org context — never just the permission alone, or you create a cross-tenant privilege leak (see Security).

### RBAC in Kubernetes — a real industry example

Kubernetes' native authorization mode is RBAC, and it maps almost exactly onto the NIST vocabulary: a **Role** (or cluster-wide **ClusterRole**) is a named set of permissions (called "rules": which API groups, resources, and verbs are allowed); a **RoleBinding** (or **ClusterRoleBinding**) assigns that Role to a **Subject** (a User, Group, or ServiceAccount) — this is literally the User-to-Role assignment.

~~~yaml
# A namespaced Role: permission to read Pods in the "payments" namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: payments
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
# A RoleBinding: assign that Role to a user — the "user gets role" step
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: payments
subjects:
  - kind: User
    name: jane
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
~~~

Role vs ClusterRole is a scoping decision, not a permission-model decision — a ClusterRole grants across all namespaces (or grants access to cluster-scoped resources like Nodes) while a Role is confined to one namespace. Kubernetes deliberately has no built-in role hierarchy or SoD constraint layer; those become policy-engine concerns (Open Policy Agent's Gatekeeper, Kyverno) layered on top when an organization needs RBAC1/RBAC2-style richness in-cluster.

### RBAC vs ABAC vs ReBAC at scale

Pure role-level checks answer "can any Editor do this," never "can this specific user do this to this specific resource instance." Google's Zanzibar paper (2019) describes a relationship-based model (ReBAC) built because RBAC/ACL hybrids could not scale to Google's object graph (a document shared with a folder shared with a group shared with a user, evaluated in milliseconds at enormous QPS). The practical senior-engineer takeaway: RBAC is the right tool for coarse, stable, job-function-shaped access; ReBAC/ABAC is the right tool for fine-grained, per-resource, contextual access — and most serious production systems run both, RBAC gating broad capability and ABAC/ReBAC gating specific instances.

### Caching and staleness

Effective-permission resolution (walking a hierarchy, joining across tables) is too expensive to redo on every request at scale. Cache the resolved set (in Redis, keyed by user id and a version counter), and bump the version counter on ANY event that could change the result: role reassignment, role permission edits, hierarchy edits, or org membership changes. A cache that is stale for even a few seconds after a permission is revoked is a real security bug, not just a performance nuisance — see Security and Performance for the concrete pattern.
`,

  "internal-working": `
Regardless of the specific framework, an RBAC permission check performs the same sequence of steps under the hood:

~~~mermaid
flowchart LR
    A["Request arrives\nwith identity token"] --> B["Authentication layer\nverifies signature, resolves User"]
    B --> C["Load User's Role\nassignments (DB or cache)"]
    C --> D["Resolve effective permissions:\nunion across roles, walk hierarchy"]
    D --> E{"Does the resolved set\ncontain the required\npermission?"}
    E -->|yes| F["Allow — continue to handler"]
    E -->|no| G["Deny — 403 Forbidden"]
~~~

1. **Authentication happens first, always.** The request carries a token or session cookie (see the JWT / Cookies & Sessions skills); this step turns "a bearer token" into "User 482, verified." RBAC has nothing to say if this step fails or is skipped — that is a hard prerequisite, not part of the authorization model.
2. **Role assignment lookup.** The system fetches which roles this User currently holds — from a database join table, an in-memory cache, or embedded directly in a signed token's claims (a common optimization: put role names in the JWT payload so no database round-trip is needed, at the cost of stale roles until the token expires — see Security for why this must be short-lived).
3. **Effective permission resolution.** Roles are expanded into the flat set of permissions they carry, including anything inherited through a role hierarchy (RBAC1). This is where cycle-guards and memoization matter for correctness and speed (see Advanced Concepts and the coding-questions section for the algorithm).
4. **The decision.** The requested permission (or, more precisely, the resource+action pair the endpoint requires) is tested for membership in the resolved set. The correct default, always, is **deny**: absence of an explicit grant means no access, never the reverse.
5. **The outcome propagates.** Allow continues into the actual business logic; deny short-circuits with a 403 (distinct from 401 — 401 means "I don't know who you are," 403 means "I know who you are, and the answer is no").

The one internal detail that causes the most production bugs: step 2 can be sourced from a **cache or token claim that goes stale**. A role revoked at 10:00:00 might still be honored by a request at 10:00:05 if the check reads a five-second-old cache entry or a token issued before the revocation. Designing the invalidation path (webhook-driven cache bust, short token TTL, or a revocation list) is a first-class part of implementing RBAC correctly, not an afterthought.
`,

  architecture: `
### System-level architecture

At the system level, RBAC sits as a discrete layer between authentication and business logic, and it is worth drawing it as its own box rather than burying it inside each service:

~~~mermaid
flowchart TB
    Client["Client"] --> GW["API gateway / edge"]
    GW --> AuthN["Authentication service\n(verifies OAuth/OIDC token or session)"]
    AuthN --> Svc["Application service"]
    Svc --> AuthZ["Authorization layer\n(RBAC permission resolution)"]
    AuthZ --> Store[("Role / Permission store\n(Postgres + Redis cache)")]
    AuthZ -->|allow| Handler["Business logic handler"]
    AuthZ -->|deny| Reject["403 Forbidden"]
    Handler --> DB[("Application data")]
    Admin["Admin console"] -->|manage roles| Store
    Audit["Audit log"] -.every grant/revoke/decision.-> Store
~~~

The important architectural rule: authorization checks belong at the boundary of every request handler (or a shared middleware/dependency layer, as in the FastAPI example), never scattered ad hoc inside business logic, and never trusted purely on the client side. The Role/Permission store is a small number of tables that change relatively rarely (roles, permissions, hierarchy edges) plus one table that changes often (assignments) — that asymmetry is exactly why the assignment table is the one worth caching aggressively.

### Application-level layout

A production backend implementing RBAC organizes it as its own module, not smeared across route handlers:

~~~text
myservice/
├── src/myservice/
│   ├── api/                 # route handlers — call require_permission(...), nothing more
│   ├── auth/
│   │   ├── authentication.py   # token/session verification (JWT / Cookies skill territory)
│   │   └── rbac/
│   │       ├── models.py       # Role, Permission, hierarchy, assignment tables
│   │       ├── resolver.py     # effective_permissions(), hierarchy walk, cache lookup
│   │       └── deps.py         # require_permission() dependency factory
│   ├── services/            # business logic — never re-implements auth checks
│   └── admin/               # role/permission management UI + audit trail
└── migrations/               # seeds default roles/permissions on deploy
~~~

The dependency direction matters: api/ depends on auth/rbac/, never the reverse; services/ should be able to assume authorization has already happened by the time it is called, keeping business logic free of access-control noise.
`,

  "data-flow": `
Tracing one authorized request end to end — a user calling POST /invoices/42/approve:

~~~mermaid
sequenceDiagram
    participant C as Client
    participant API as API handler
    participant AuthN as Authentication (JWT/session)
    participant RBAC as RBAC resolver
    participant Cache as Permission cache (Redis)
    participant DB as Role/Permission DB

    C->>API: POST /invoices/42/approve (Bearer token)
    API->>AuthN: verify token signature + expiry
    AuthN-->>API: User(id=482) resolved
    API->>RBAC: require_permission("invoices:approve") for User 482
    RBAC->>Cache: get cached effective permissions for user 482
    alt cache hit and fresh
        Cache-->>RBAC: {"invoices:read", "invoices:approve", ...}
    else cache miss or stale
        RBAC->>DB: load roles, permissions, hierarchy for user 482
        DB-->>RBAC: role rows + permission rows
        RBAC->>RBAC: resolve hierarchy, union permissions
        RBAC->>Cache: store resolved set with version tag
    end
    RBAC->>RBAC: check "invoices:approve" in effective set
    alt permission present
        RBAC-->>API: allow
        API->>API: run approve_invoice business logic
        API-->>C: 200 OK
    else permission absent
        RBAC-->>API: deny
        API-->>C: 403 Forbidden
    end
~~~

The two branch points worth internalizing: authentication failure returns 401 and never reaches the RBAC step at all; RBAC failure returns 403 after identity was successfully established. Confusing these two status codes in your API is a small but telling sign of not understanding the authentication/authorization boundary — see Common Mistakes.
`,

  "production-usage": `
### Where the role/permission data lives

Most production systems store roles, permissions, and assignments in a relational database (the join-table schema shown in Intermediate Concepts), with a fast cache layer (Redis, or an in-process TTL cache for single-instance services) in front of the read path, since permission checks vastly outnumber permission changes.

### Policy engines instead of hand-rolled checks

Beyond a certain complexity, teams stop hand-writing "if permission in set" checks scattered through code and adopt a dedicated policy engine that centralizes the decision:

- **Casbin** — an open-source authorization library with pluggable models (RBAC, ABAC, ACL) defined in a small policy-definition language, embeddable directly in a backend.
- **Open Policy Agent (OPA)** — a general-purpose policy engine using the Rego language; commonly deployed as a sidecar that services query for allow/deny decisions, popular in Kubernetes admission control and microservice authorization.
- **AWS Cedar** — a policy language purpose-built for fine-grained authorization, open-sourced by AWS and used inside Amazon Verified Permissions.
- **OpenFGA / SpiceDB** — open-source implementations inspired by Google's Zanzibar, aimed at the ReBAC/fine-grained end of the spectrum once pure RBAC stops being enough.

### Cloud IAM as RBAC at scale

AWS IAM, Azure RBAC, and GCP IAM are the industrial-strength versions of exactly this model: an IAM Role bundles a policy document (permissions); it is attached to a principal (user, group, or service); evaluation walks explicit deny, then explicit allow, defaulting to deny. Reading AWS IAM's evaluation logic is one of the best ways to see NIST RBAC concepts at planet scale.

### Operational defaults worth adopting

- Seed a fixed set of default roles and permissions via a database migration at deploy time — never create roles ad hoc through the admin UI in production without going through review.
- Keep a small number of coarse roles (Admin, Member, Viewer) as the RBAC layer, and push anything resource-instance-specific to an ABAC/ownership check instead of minting a new role.
- Log every role assignment, revocation, and permission-set edit to an append-only audit trail from day one — retrofitting audit logging after an incident is far more painful than building it in.
`,

  "industry-examples": `
- **AWS**: IAM is RBAC (roles carrying policy documents) plus a rich policy-evaluation layer (explicit deny, resource-based policies, conditions) — arguably the most widely used RBAC implementation in the world, gating access to every AWS service.
- **Kubernetes**: RBAC is the default, in-tree authorization mode for the cluster API — every kubectl command and every in-cluster service account request is mediated by Role/ClusterRole/RoleBinding evaluation (see Advanced Concepts for the manifests).
- **GitHub**: organizations assign members to teams with roles (Owner, Maintainer, Member, and per-repository roles like Write/Triage/Read) — a textbook hierarchical RBAC layered over a social coding platform.
- **Salesforce**: "Profiles" and "Permission Sets" are Salesforce's names for roles and additive permission bundles, applied across an enormous configurable object model — one of the most mature enterprise RBAC implementations in commercial software.
- **Snowflake**: the data warehouse's entire access-control model is RBAC — roles are granted to users and to other roles (a native hierarchy), and every object grant (SELECT on a table, USAGE on a warehouse) flows through a role.
- **Okta / Auth0**: as identity providers, they let customers define application roles and groups that are asserted as claims in the OIDC/JWT tokens they issue — the identity layer feeding directly into an RBAC decision downstream (the OAuth/JWT-to-RBAC handoff in practice).
`,

  "best-practices": `
1. **Default to deny.** Absence of an explicit permission grant must mean no access. Never structure a check as "allow unless explicitly blocked."
2. **Keep authentication and authorization as separate, explicit layers.** A valid token proves identity, nothing more; never let "the request is authenticated" stand in for "the request is authorized."
3. **Name permissions as resource:action pairs** (invoices:approve, users:delete) for a flat, greppable, self-documenting namespace.
4. **Keep the number of roles small and stable.** Reach for parameterization or ABAC before minting a new near-duplicate role — this is the single biggest defense against role explosion.
5. **Scope every assignment to a tenant/organization in multi-tenant systems**, never just to a global user id — cross-tenant leakage is the most common multi-tenant RBAC bug.
6. **Enforce separation of duties where money, security, or compliance is involved** (no one person both creates and approves the same class of transaction), and enforce it in code, not policy documents alone.
7. **Cache resolved permissions, but invalidate correctly.** A permission cache with no invalidation path is a slow-motion privilege-escalation bug waiting to expire.
8. **Check permissions at the server, on every request, at the boundary** — never trust a hidden UI button as an access control; the client can always call the API directly.
9. **Log every grant, revocation, and role edit to an immutable audit trail**, and review it periodically, not just after an incident.
10. **Apply the principle of least privilege by default for new roles**: start from zero permissions and add explicitly, rather than cloning an over-privileged role and trying to remove what's not needed.
11. **Prefer short-lived, cache-busted, or claim-based role data over long-lived unverified assumptions** — a revoked role should take effect within seconds, not until a token naturally expires hours later.
12. **Treat AI agents and service accounts as first-class RBAC subjects**, scoped to the minimum tool/API permissions they need, exactly like a human user — an over-privileged agent is a bigger blast radius than an over-privileged employee because it acts continuously and at machine speed.
`,

  "anti-patterns": `
### Treating authentication as authorization

~~~python
# WRONG — any authenticated user can approve invoices
@router.post("/invoices/{id}/approve")
def approve_invoice(id: int, user = Depends(get_current_user)):
    ...

# RIGHT — authentication AND authorization are both checked, explicitly
@router.post("/invoices/{id}/approve")
def approve_invoice(id: int, user = Depends(require_permission("invoices:approve"))):
    ...
~~~

A valid session or token only proves identity. Skipping the permission check because "they're logged in" is the most common real-world authorization bug.

### The god-role / superadmin escape hatch

~~~python
# WRONG — a single is_superadmin bypass defeats every constraint you designed
if user.is_superadmin or "invoices:approve" in effective_permissions(user):
    approve()

# RIGHT — even the highest-privileged role is still just a role with an explicit,
# reviewable permission set; no silent bypass flag
if "invoices:approve" in effective_permissions(user):
    approve()
~~~

Superadmin bypass flags are convenient in a demo and catastrophic in an audit — they cannot be scoped, logged meaningfully, or subjected to separation-of-duties constraints.

### Hardcoding role name checks instead of permission checks

~~~python
# WRONG — couples business logic to a specific role name; breaks the moment
# you rename a role or need a second role that should also qualify
if user.role == "editor":
    allow_edit()

# RIGHT — check the permission, not the role name; roles are just a bundling
# mechanism and should stay swappable
if "documents:write" in effective_permissions(user):
    allow_edit()
~~~

### Role explosion via copy-paste

Creating Editor-RegionA, Editor-RegionB, Editor-RegionC as separate roles instead of one Editor role plus a scoped attribute check. Each becomes a maintenance liability that drifts independently. See Advanced Concepts for the parameterization and ABAC-handoff fix.

### Client-side-only enforcement

Hiding an "Approve" button in the UI for non-approvers while the backend endpoint still accepts the request from anyone authenticated. The UI check is a usability nicety; the server-side check is the actual security boundary — never confuse the two.

### Stale permission caches with no invalidation path

Caching effective permissions (good) without any mechanism to bust the cache on role change (bad) — a revoked permission silently remains usable until an arbitrary TTL expires. Always tie cache invalidation to the specific mutation events (role assignment change, role permission edit, hierarchy edit).
`,

  performance: `
### Measure first

~~~bash
# Time the actual permission-resolution path under load, not just the endpoint overall
python -m cProfile -s cumulative -m myservice.auth.rbac.resolver
~~~

Before optimizing, confirm the permission check is actually a hot path in your profile — for most CRUD apps it is a handful of indexed joins and is not the bottleneck; for high-throughput APIs (thousands of requests/sec per instance) it very much can be.

### The optimization hierarchy

1. **Index the assignment tables.** user_roles and role_permissions must have indexes on both foreign key columns; an unindexed join here is the single most common source of a slow permission check.
2. **Cache resolved effective-permission sets**, keyed by user (and org, in multi-tenant systems) plus a version tag, in Redis or an in-process TTL cache. Resolving a role hierarchy on every single request is wasted work once the underlying data changes only occasionally.
3. **Invalidate precisely, not by blanket TTL alone.** On any role/permission/hierarchy mutation, bump the version tag (or publish an invalidation event) so the very next request sees the new truth — a five-minute TTL alone means a revoked permission can remain usable for up to five minutes.
4. **Avoid N+1 role/permission queries.** Load a user's roles and their permissions (and hierarchy ancestors) in one batched query, not one query per role.
5. **Embed roles in the auth token as a last-resort speed optimization**, accepting the trade-off that revocation now waits for token expiry — only acceptable with short-lived tokens (minutes, not days) plus a refresh flow, and never for high-privilege roles.
6. **For extremely hot, small, fixed permission sets**, a bitmask representation (each permission is one bit in an integer) turns a set-membership check into a single AND operation — see the bitmask coding question for the concrete implementation and its ceiling (practical up to roughly 64 flags per integer, more with bitset arrays).
`,

  scalability: `
RBAC's data (roles, permissions, hierarchy) is small and read-heavy; assignments are the part that grows with your user base. The scaling story is mostly about the caching and invalidation layer, not the model itself.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Service instance 1"]
    LB --> S2["Service instance 2"]
    LB --> S3["Service instance N"]
    S1 & S2 & S3 --> Cache[("Shared Redis cache\neffective permissions, versioned")]
    S1 & S2 & S3 --> DB[("Role/Permission DB\n(source of truth)")]
    Admin["Admin action:\nrole/permission edit"] -->|publish invalidation| Bus["Pub/sub (Redis/Kafka)"]
    Bus -.invalidate.-> Cache
~~~

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| Every request re-resolves the full role hierarchy from the DB | Shared cache (Redis) keyed by user/org, versioned for correct invalidation |
| Cache invalidation lag across many service instances | Pub/sub invalidation event on every role/permission mutation, not a bare TTL alone |
| Multi-tenant assignment table growth (millions of rows) | Index on (user_id, org_id); partition by org_id if a single tenant table becomes too large |
| Deep or wide role hierarchies slow to resolve | Memoize per-role resolved permission sets; flatten and materialize the hierarchy periodically instead of walking it on every request |
| Centralized policy engine becomes a request-path dependency | Deploy the policy engine as a local sidecar (OPA's common pattern) to avoid a network hop on every check |

Horizontally, RBAC scales the same way any read-heavy, rarely-written dataset scales: stateless service instances, a shared cache in front of the source of truth, and precise event-driven invalidation rather than trusting a TTL alone.
`,

  security: `
### RBAC-specific attack surface

1. **Confused deputy via missing tenant scoping.** A permission check that verifies "does this user have invoices:approve" without also verifying "...within THIS organization" lets a user in Org A approve an invoice belonging to Org B. Every check in a multi-tenant system must take the tenant/org as an explicit input, never an implicit assumption.
2. **Stale cached or token-embedded roles.** If roles live in a JWT claim or a cache with no invalidation path, a revoked role remains effectively active until the token expires or the cache TTL lapses. Keep role-bearing tokens short-lived, and always pair caching with event-driven invalidation (see Performance).
3. **Privilege escalation through role hierarchy misconfiguration.** An accidental parent-role edge (Viewer mistakenly configured as a child of Admin) silently grants far more than intended. Treat hierarchy edits with the same review rigor as a production code change, and write tests that assert the exact resolved permission set for every role (see Testing).
4. **Direct object reference despite a passing role check.** RBAC alone confirms "this role can edit documents," not "this specific document belongs to this user." A role-only check on an endpoint like GET /documents/{id} without an ownership/tenant check is an authorization bypass — this is exactly the gap ABAC closes; see the ABAC skill.
5. **Client-side-only enforcement.** Hiding a button is not a security boundary; the server must independently enforce every check regardless of what the UI would have allowed the user to click.
6. **Superadmin/god-role bypass flags.** As shown in Anti-Patterns, a single is_superadmin escape hatch defeats every other constraint (including separation-of-duties rules) and cannot be meaningfully audited.
7. **Tampered or forged role claims.** If roles are asserted in a JWT, verify the token's signature before trusting ANY claim inside it — an unverified token lets an attacker simply write "admin" into the payload. This is squarely the JWT skill's territory; RBAC's correctness is entirely dependent on that verification having already happened.

### Defenses

- Always include the tenant/organization id as an explicit parameter in every permission check function signature — make it structurally impossible to forget.
- Pair any caching or token-embedding of roles with a hard invalidation path (see Performance) and keep the token TTL short.
- Log every authorization decision (allow AND deny) with the user, permission, and resource involved, feeding into the audit trail covered in Monitoring.
- Apply least privilege as a default posture for every new role and every new user — start at zero, add explicitly, review periodically.
- Layer resource-instance ownership checks (or a full ABAC policy) on top of the role check wherever "this role can act on this resource type" is not the same question as "this user can act on this specific resource instance."

See the **OWASP Top 10**, **JWT**, and **Secrets Management** skills for the surrounding security context this page assumes.
`,

  testing: `
Test the permission-resolution logic directly, independent of HTTP, and test the enforcement boundary at the API layer separately.

~~~python
# tests/test_rbac_resolver.py
import pytest
from myservice.auth.rbac.resolver import resolve_role_permissions, effective_permissions

def make_role(name, permissions=(), parent=None):
    role = FakeRole(name=name, permissions=set(permissions), parent=parent)
    return role

def test_flat_role_has_its_own_permissions():
    viewer = make_role("viewer", {"documents:read"})
    assert resolve_role_permissions(viewer) == {"documents:read"}

def test_hierarchy_inherits_parent_permissions():
    viewer = make_role("viewer", {"documents:read"})
    editor = make_role("editor", {"documents:write"}, parent=viewer)
    assert resolve_role_permissions(editor) == {"documents:read", "documents:write"}

def test_cyclic_hierarchy_does_not_infinite_loop():
    a = make_role("a", {"x"})
    b = make_role("b", {"y"}, parent=a)
    a.parent = b   # misconfigured cycle: a -> b -> a
    result = resolve_role_permissions(a)
    assert "x" in result and "y" in result   # resolves, does not hang

@pytest.mark.parametrize("roles,permission,expected", [
    (["viewer"], "documents:read", True),
    (["viewer"], "documents:write", False),
    (["editor"], "documents:write", True),
])
def test_effective_permissions_matrix(roles, permission, expected):
    user = FakeUser(roles=[ROLE_FIXTURES[r] for r in roles])
    assert (permission in effective_permissions(user)) is expected
~~~

~~~python
# tests/test_api_authorization.py — the enforcement boundary, via the actual endpoint
def test_viewer_cannot_approve_invoice(client, viewer_token):
    resp = client.post("/invoices/1/approve", headers={"Authorization": "Bearer " + viewer_token})
    assert resp.status_code == 403

def test_approver_can_approve_invoice(client, approver_token):
    resp = client.post("/invoices/1/approve", headers={"Authorization": "Bearer " + approver_token})
    assert resp.status_code == 200
~~~

### The senior testing doctrine

- Test the resolved permission set for **every role** in your system explicitly — a role's effective permissions should never be "whatever the code happens to compute," it should be an asserted, reviewed contract.
- Include an explicit negative test for every protected endpoint (a user WITHOUT the permission gets 403), not just the happy path — negative-path coverage is where most real authorization bugs hide.
- Test separation-of-duties constraints as first-class cases: assigning both halves of a conflicting pair must fail.
- Test multi-tenant isolation directly: a user with a role in Org A must be denied when acting on an Org B resource, even holding the identical role name.
- Run the full authorization test suite in CI on every change to the role/permission schema or hierarchy — this is exactly the kind of regression that is invisible in a manual smoke test.
`,

  debugging: `
### Escalation path for "why does/doesn't this user have access"

1. **Confirm which entity actually failed.** A 401 means authentication never resolved an identity — look at the token/session layer (JWT/Cookies skills), not RBAC. A 403 means identity was resolved but the permission check failed — that is squarely RBAC's territory.
2. **Dump the user's raw role assignments** directly from the database, bypassing any cache: what roles are assigned, in what org/tenant scope.
3. **Resolve the hierarchy by hand** (or with a debug endpoint) to see the full effective permission set the system believes this user has, and compare it against what the endpoint requires.
4. **Check the cache, not just the database.** If the DB shows a role was revoked but the request still succeeds, the cache is stale — inspect the cache entry's version/TTL directly (redis-cli GET on the key) before assuming a code bug.
5. **Check tenant/org scoping explicitly.** A very common "why does this user have access to something they shouldn't" bug is a permission check that never filtered by organization at all.
6. **Reproduce with the smallest possible role set.** Strip the user down to a single role in a test environment and re-run the check; add roles back one at a time until the unexpected behavior reappears — this isolates whether a specific role or the hierarchy resolution itself is at fault.
7. **Audit-log replay.** If an audit trail exists (it should — see Monitoring), replay the exact sequence of grants/revokes for this user to see precisely when their effective permissions changed relative to when the request was made.

~~~python
# A debug helper worth keeping around in non-production environments
def debug_explain_access(user, permission: str) -> dict:
    roles = [r.name for r in user.roles]
    resolved = effective_permissions(user)
    return {
        "user_id": user.id,
        "assigned_roles": roles,
        "resolved_permissions": sorted(resolved),
        "has_permission": permission in resolved,
    }
~~~
`,

  monitoring: `
### What to measure

- **Authorization decision rate**, split allow vs deny, per endpoint — a sudden spike in denies on one endpoint often signals a misconfigured role or a broken deploy; a sudden spike in allows on a sensitive endpoint can signal a compromised or over-broadened role.
- **Permission cache hit rate and invalidation latency** — a falling hit rate means your caching layer isn't earning its complexity; a growing gap between "role revoked" and "cache actually reflects it" is a live security risk, not just a performance metric.
- **Role and permission mutation events** — every create/edit/delete of a role, permission, or hierarchy edge, and every assignment/revocation, logged with who performed it and when.
- **Separation-of-duties violation attempts** — count how often the system blocks a conflicting role assignment; a rising trend suggests process problems upstream (people requesting access they shouldn't).

~~~python
from prometheus_client import Counter

AUTHZ_DECISIONS = Counter(
    "authz_decisions_total", "RBAC authorization decisions", ["endpoint", "decision"]
)

def require_permission(permission: str):
    def _check(user = Depends(get_current_user)):
        allowed = permission in effective_permissions(user)
        AUTHZ_DECISIONS.labels(endpoint=permission, decision="allow" if allowed else "deny").inc()
        if not allowed:
            raise HTTPException(status_code=403, detail="Missing permission: " + permission)
        return user
    return _check
~~~

### The audit trail

Every grant, revoke, and role/permission definition change belongs in an append-only audit log — who made the change, what changed, and when — retained long enough to satisfy your compliance requirements (SOC 2, HIPAA, and similar frameworks routinely require exactly this). This log is also your primary tool for periodic access review: "show me every user who was granted Admin in the last quarter and confirm each grant was justified" should be a query, not an investigation.
`,

  deployment: `
### Seeding roles and permissions as part of deployment

Role and permission definitions are configuration, not ad hoc admin-UI edits — they belong in versioned migrations so environments stay consistent and changes go through code review.

~~~python
# migrations/0007_seed_rbac_defaults.py — illustrative Alembic-style migration
def upgrade():
    op.bulk_insert(permission_table, [
        {"name": "invoices:read"},
        {"name": "invoices:approve"},
        {"name": "users:manage"},
    ])
    op.bulk_insert(role_table, [
        {"name": "viewer"},
        {"name": "approver"},
        {"name": "admin"},
    ])
    # role_permissions and hierarchy links inserted here, referencing the ids above
~~~

### Deployment-time checklist for RBAC specifically

- Default roles and permissions are seeded via migration, not manually created post-deploy.
- Cache invalidation is wired to the actual mutation path (an admin-console edit must publish an invalidation event, not just write to the DB and hope the cache TTL is short enough).
- The permission-check dependency (require_permission or equivalent) is applied on every protected route — a missing dependency on one new endpoint is a silent authorization hole, so consider a CI check or lint rule that flags routes without an explicit auth dependency.
- Break-glass/emergency-access roles (if any) are time-bound and heavily audited, never a standing grant.
- Rolling deploys that change role/permission schema are backward compatible for the duration of the rollout (old and new instances must agree on the schema mid-deploy).
`,

  "production-checklist": `
Before an RBAC implementation takes real production traffic:

- [ ] Every protected endpoint has an explicit permission check — none rely on "the user is logged in" alone
- [ ] Authentication and authorization failures return distinct status codes (401 vs 403) and are logged distinctly
- [ ] Roles and permissions are seeded via versioned migration, not manual admin-UI creation
- [ ] Role hierarchy resolution is cycle-safe (tested with an explicit misconfigured-cycle test case)
- [ ] Every permission check in a multi-tenant system takes the org/tenant as an explicit, mandatory input
- [ ] Effective-permission caching has a real invalidation path tied to mutation events, not a bare TTL alone
- [ ] Separation-of-duties constraints are enforced in code at assignment time, for every conflicting role pair that matters
- [ ] No superadmin/god-role bypass flag exists anywhere in the codebase
- [ ] Every grant, revoke, and role/permission edit is written to an append-only audit log
- [ ] Negative-path tests exist for every protected endpoint (unauthorized user gets 403)
- [ ] Role-bearing tokens (if used) are short-lived, with a refresh flow that re-checks current role state
- [ ] Metrics exist for allow/deny rate per endpoint and for cache hit rate
- [ ] A documented process exists for periodic access review (who has what, is it still justified)
- [ ] Break-glass/emergency access, if it exists, is time-bound and specially audited
- [ ] AI agents and service accounts are scoped to explicit, minimal roles, exactly like human users
- [ ] The full authorization test suite runs in CI on every change touching the role/permission schema
`,

  "common-mistakes": `
1. **Treating "authenticated" as "authorized."** These are different questions; skipping the permission check because a valid token is present is the single most frequent real-world RBAC bug — it silently grants every logged-in user every action.
2. **Forgetting tenant scoping in multi-tenant systems.** A permission check that never filters by organization allows cross-tenant access even when the role name and permission are otherwise correct.
3. **Building a superadmin bypass flag "just for support."** It defeats every constraint you carefully designed (including separation of duties) and is invisible to audit unless you specifically log its use — which teams usually forget to do.
4. **Hardcoding role name comparisons in business logic** (if user.role == "editor") instead of permission checks — this couples code to a specific role's existence and breaks the moment roles are renamed or split.
5. **Copy-pasting roles instead of parameterizing them**, leading to role explosion — dozens of near-identical roles that drift independently and nobody fully understands six months later.
6. **Caching permissions with no invalidation path.** A revoked role that remains effectively active for minutes (or until token expiry) because nothing ever busts the cache is a security bug wearing a performance-optimization costume.
7. **Confusing role-level access with resource-instance access.** "This role can edit documents" is not the same claim as "this user can edit THIS document" — the second requires an ownership or attribute check RBAC alone cannot express.
8. **Enforcing access control only in the UI.** Hiding a button is a usability choice; skipping the equivalent server-side check leaves the actual API wide open to anyone who calls it directly.
9. **No audit trail for role/permission changes.** Without a log of who granted what and when, an access-review or incident investigation becomes archaeology instead of a query.
10. **Treating AI agents as exempt from the model.** Giving an agent's tool-calling layer a single broad "do anything" credential instead of a scoped role is the same mistake as an over-privileged human account, except the agent can act on it continuously and at machine speed.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Every request returns 403, even for admins | Cache never populated, or role/permission seed migration didn't run | Verify the seed migration applied; inspect the cache directly for the affected user |
| Revoked role still grants access minutes later | Permission cache has no invalidation hook, or role claims embedded in a long-lived token | Wire cache invalidation to the revoke event; shorten token TTL and re-check on refresh |
| User has access to another organization's data | Permission check omitted the tenant/org id as an input | Add org id as a mandatory parameter to every permission-check function; add a regression test |
| Infinite loop / stack overflow resolving a role's permissions | Misconfigured role hierarchy contains a cycle | Add a cycle guard (seen-set) to the hierarchy walk; add a test with an intentional cycle |
| Assigning a role silently creates a conflicting combination | No separation-of-duties enforcement at assignment time | Add an explicit SoD constraint check in the assignment function, not just in documentation |
| New endpoint accessible to anyone with a valid token | Permission dependency omitted on that specific route | Add a CI check or code-review checklist item verifying every route declares an explicit auth dependency |
| 401 returned where 403 was expected (or vice versa) | Authentication and authorization logic conflated in one check | Separate the two checks explicitly; 401 = unknown identity, 403 = known identity, insufficient permission |
| Permission check passes in staging, fails in production | Role/permission seed data differs between environments | Ensure seed migrations are identical across environments; never hand-edit roles directly in production |
`,

  faqs: `
**Q: Is RBAC enough on its own, or do I need ABAC too?**
RBAC is enough when access genuinely only depends on job function (any Editor can edit any document). The moment access depends on the specific resource instance or context ("only documents you own," "only during business hours"), you need attribute-awareness — that's the ABAC skill, layered on top of RBAC rather than replacing it.

**Q: Should permission checks live in the database, the token, or both?**
Both, for different reasons. The database is the durable source of truth for role assignments. Embedding resolved roles in a short-lived token (or a cache) avoids a database round trip on every request, at the cost of some staleness until the token/cache refreshes — acceptable for low-sensitivity roles, risky for high-privilege ones without a very short TTL.

**Q: How many roles should a system have?**
As few as the business genuinely requires — most systems are well served by somewhere between five and twenty roles. If you find yourself creating a new role for every combination of department, region, and time window, that's the role explosion pattern; parameterize or move to ABAC instead of continuing to multiply roles.

**Q: What's the real difference between a Role in Kubernetes and a Role in the NIST model?**
They're the same concept: a named bundle of permissions (verbs on resources). Kubernetes' RoleBinding is exactly the NIST model's user-to-role assignment step, just with its own YAML vocabulary and a namespace-vs-cluster scoping dimension layered on top.

**Q: Static or dynamic role assignment — which should I use?**
Static (standing assignment) for ordinary day-to-day access. Dynamic/just-in-time assignment for anything privileged and rarely needed (emergency production access, temporary elevated debugging rights) — it shrinks the standing attack surface at the cost of needing an expiry and approval workflow.

**Q: Does RBAC apply to AI agents, or only human users?**
It applies directly. An agent's tool-calling layer is functionally a non-human user and should be assigned the minimum role needed for its task, following the exact same least-privilege discipline as a human account — arguably more strictly, since an over-privileged agent can act continuously without a human pausing to reconsider.

**Q: How do I handle a user who legitimately needs different access in different customer organizations?**
Scope the role *assignment* to the organization, not the role definition itself — see the multi-tenant RBAC pattern in Advanced Concepts. The same Admin role definition can be assigned to a user in Org A while a Viewer role is assigned to that same user in Org B.

**Q: What actually breaks when a role hierarchy has a cycle?**
Naive recursive resolution infinite-loops or stack-overflows. Always implement hierarchy resolution with an explicit "seen" set that short-circuits on a repeated role id — treat cycles as a data-integrity bug to catch with a test, not something that should ever reach production.
`,

  "interview-questions": `
**Junior / Mid-level:**

1. *What is RBAC, in one sentence?* Model answer: authorization by assigning permissions to named roles, and roles to users, instead of granting permissions directly to individuals — so administering access means managing role membership, not per-user grants.
2. *What's the difference between authentication and authorization?* Model answer: authentication establishes identity ("who are you," handled by mechanisms like OAuth/JWT/sessions); authorization decides access ("what can you do," RBAC's job) — and authorization always assumes authentication already succeeded.
3. *Why use roles instead of assigning permissions directly to users?* Model answer: roles are an indirection layer — updating a role's permissions instantly updates every current and future holder of that role, instead of editing potentially thousands of individual user records.
4. *What is a role hierarchy?* Model answer: RBAC1's addition where a role can inherit permissions from a parent role (a Senior-Editor role automatically includes everything an Editor role includes), reducing duplicated permission definitions.
5. *What HTTP status code should a failed authorization check return, and why not the authentication failure code?* Model answer: 403 Forbidden, because identity was successfully established (unlike 401 Unauthorized, which means identity itself could not be resolved) — the distinction matters for both correct client behavior and clear logging.
6. *Give an example of an RBAC anti-pattern.* Model answer: a superadmin/god-role bypass flag that skips permission checks entirely — it defeats every other constraint in the system and is typically invisible to audit.

**Senior:**

7. *Walk through implementing an RBAC permission check as a dependency in a FastAPI backend.* Model answer: a require_permission(permission) dependency factory that depends on an existing get_current_user authentication dependency, resolves the user's effective permissions (unioning across roles and walking any hierarchy), and raises 403 if the permission is absent — generalizing a single hardcoded is_admin flag into named, database-backed permissions. Strong answers mention caching the resolved set and invalidating it on role/permission mutation.
8. *Explain separation of duties and how you'd enforce it.* Model answer: static SoD prevents a user from simultaneously holding two conflicting roles (enforced at assignment time, refusing the second grant); dynamic SoD allows holding both but restricts activating both within the same session. Strong answers give a concrete example (invoice creator vs approver) and note this requires roles to be explicit, first-class objects — a reason RBAC exists at all.
9. *How would you design RBAC for a multi-tenant SaaS product?* Model answer: scope the role *assignment* (not the role definition) to an organization/tenant id — the same global Admin role can be assigned to a user in one org and not another; every permission check must take the tenant as a mandatory input, and forgetting it is the classic cross-tenant leak.
10. *What is role explosion, and how do you mitigate it?* Model answer: the combinatorial growth of near-duplicate roles as an organization tries to encode multiple dimensions (region, department, time) directly as separate roles. Mitigate by parameterizing roles with an attribute checked at decision time, or migrating that dimension to ABAC, keeping RBAC for the coarse, stable layer only.
11. *How does Kubernetes implement RBAC, and how does it map to the NIST model?* Model answer: a Role or ClusterRole defines permission rules (verbs on API resources); a RoleBinding or ClusterRoleBinding assigns that role to a Subject (user, group, or service account) — directly analogous to NIST's Role and User-Role-Assignment concepts, with a namespace-vs-cluster scoping dimension Kubernetes adds on top. Strong answers note Kubernetes has no native hierarchy or SoD layer, which is why policy engines like OPA get layered in for that richness.
12. *When would you reach for ABAC or ReBAC instead of RBAC?* Model answer: when the decision depends on the specific resource instance or contextual attributes rather than just the caller's job function — "edit only documents you own," "approve only during business hours," or Google Zanzibar-style relationship graphs at extreme scale. Strong answers frame this as additive, not a replacement: RBAC gates coarse capability, ABAC/ReBAC gates the specific instance.
`,

  "coding-questions": `
### 1. Resolve effective permissions across a role hierarchy (cycle-safe)

~~~python
# Given a role that may have a parent (RBAC1 hierarchy), return the full set
# of permissions available to it, safely handling a misconfigured cycle.
class RoleNode:
    def __init__(self, name, permissions, parent=None):
        self.name = name
        self.permissions = set(permissions)
        self.parent = parent

def resolve_permissions(role: RoleNode, seen: set | None = None) -> set:
    if seen is None:
        seen = set()
    if role.name in seen:
        return set()          # cycle guard: already visited, contribute nothing further
    seen.add(role.name)
    perms = set(role.permissions)
    if role.parent is not None:
        perms |= resolve_permissions(role.parent, seen)
    return perms

# Tests
viewer = RoleNode("viewer", {"read"})
editor = RoleNode("editor", {"write"}, parent=viewer)
admin = RoleNode("admin", {"delete"}, parent=editor)
assert resolve_permissions(admin) == {"read", "write", "delete"}

# Misconfigured cycle: viewer secretly points back to admin
viewer.parent = admin
result = resolve_permissions(admin)
assert result == {"read", "write", "delete"}   # terminates, no infinite recursion
~~~

Complexity: O(R + E) where R is the number of distinct roles visited and E the number of hierarchy edges traversed, since each role is resolved at most once thanks to the seen-set. Follow-ups interviewers ask: what if the same base role is reachable via two different parent paths (diamond inheritance)? Add memoization (cache resolved sets per role name) so shared ancestors aren't re-walked repeatedly across sibling branches. What if permissions need to be revoked at a specific level rather than only added? That requires an explicit "deny" concept, which pure additive-hierarchy RBAC does not model — a sign you've hit RBAC's limits and need a richer policy engine.

### 2. Separation-of-duties conflict checker for a proposed role change

~~~python
# Given a set of conflicting role pairs and a user's current + proposed roles,
# determine whether assigning a new role would create an SoD violation.
def check_sod_violation(current_roles: set, new_role: str, conflicts: set) -> str | None:
    """conflicts is a set of frozenset({role_a, role_b}) pairs that cannot coexist.
    Returns the offending role name if a violation would occur, else None."""
    proposed = current_roles | {new_role}
    for pair in conflicts:
        if pair.issubset(proposed):
            # Return the OTHER role in the pair — the one already held that conflicts
            (other,) = pair - {new_role}
            return other
    return None

conflicts = {frozenset({"invoice-creator", "invoice-approver"})}
assert check_sod_violation({"invoice-creator"}, "invoice-approver", conflicts) == "invoice-creator"
assert check_sod_violation({"viewer"}, "invoice-approver", conflicts) is None
~~~

Complexity: O(C) where C is the number of conflict pairs, since each is checked once against the proposed set (set membership itself is O(1) average case). Follow-ups: how would you support conflicts among THREE or more roles rather than just pairs (generalize frozenset pairs to frozensets of arbitrary size, and check subset membership the same way)? How would you distinguish static SoD (checked at assignment time, as here) from dynamic SoD (checked at session-activation time, allowing both roles to be held but not both active simultaneously — requires tracking active sessions, not just assignments)?

### 3. Bitmask permission set for a fixed, small permission catalog

~~~python
# When the full permission catalog is small and fixed (<= 64 flags), representing
# a role's permissions as bits in an integer turns membership checks into O(1)
# bitwise operations — a real production technique for extremely hot paths.
PERMISSIONS = ["read", "write", "delete", "approve", "manage_users"]
BIT = {name: 1 << i for i, name in enumerate(PERMISSIONS)}   # e.g. "read" -> 1, "write" -> 2

def permissions_to_mask(names) -> int:
    mask = 0
    for name in names:
        mask |= BIT[name]
    return mask

def has_permission(mask: int, name: str) -> bool:
    return (mask & BIT[name]) != 0

editor_mask = permissions_to_mask(["read", "write"])
assert has_permission(editor_mask, "write") is True
assert has_permission(editor_mask, "delete") is False
~~~

Complexity: O(1) per check regardless of how many permissions exist in the mask, versus O(1) average for a hash-set membership test too — the real win here is memory density and cache-friendliness (one 64-bit integer versus a Python set object) for systems checking millions of permissions per second, not asymptotic complexity. Follow-up: what happens past 64 permissions? You need an array of integers (a bitset) and must OR/AND across the correct word — at that point, ask whether the added complexity is worth it versus a plain hash set, which is almost always the right default unless profiling proves otherwise.
`,

  "hands-on-labs": `
### Lab 1 — In-memory RBAC engine (beginner, about 1 hour)
Build the four NIST entities (Users, Roles, Permissions, Sessions) as plain Python classes with no database. Implement has_permission(user, permission) and a role hierarchy with at least three levels. Write tests proving inheritance works and that removing a role immediately changes the result. Skills: the core model, without any framework noise.

### Lab 2 — FastAPI + SQLAlchemy permission-checked API (intermediate, about 3 hours)
Implement the User/Role/Permission/hierarchy schema from Intermediate Concepts against a real database, add the require_permission dependency factory, and protect at least four endpoints across two different permissions. Write both positive and negative tests (403 for missing permission). Skills: the full worked backend pattern, end to end.

### Lab 3 — Multi-tenant, cached RBAC service (advanced, about 4 hours)
Extend Lab 2 to scope role assignments by organization, add a Redis-backed effective-permission cache with correct invalidation on any role/permission mutation, and write a test that proves a user's access in Org A never leaks into Org B. Add separation-of-duties enforcement for one conflicting role pair. Skills: multi-tenant scoping, caching correctness, SoD constraints.

### Lab 4 — Kubernetes RBAC in a real cluster (production, about 2 hours)
Using a local cluster (kind or minikube), create a namespace, a ServiceAccount, a Role scoped to that namespace granting only get/list on pods, and a RoleBinding attaching the Role to the ServiceAccount. Prove the ServiceAccount can list pods in its namespace but is denied in a different namespace, and denied for a verb (delete) it was not granted. Skills: reading and writing real RBAC manifests, understanding Role vs ClusterRole scoping.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate RBAC competence to employers:

1. **Multi-tenant admin console with full audit trail.** A backend service where organizations manage their own users and roles, with org-scoped role assignment, a require_permission dependency protecting every mutating endpoint, separation-of-duties enforcement on at least one conflicting role pair, and an append-only audit log of every grant/revoke exposed through an admin API. Demonstrates: the full production RBAC pattern, multi-tenancy, and auditability — exactly what SaaS employers screen for.

2. **RBAC-to-ABAC migration case study.** Start with a pure RBAC system that has visibly hit role explosion (deliberately over-parameterized roles like Editor-RegionA, Editor-RegionB), then refactor it to a single Editor role plus an attribute check (region membership evaluated at request time). Ship both versions with a README explaining the trade-off and when each is the right call. Demonstrates: judgment about RBAC's limits, not just RBAC's mechanics — directly sets up the ABAC skill.

3. **A minimal Kubernetes-style RBAC engine.** Implement your own Role/RoleBinding-equivalent YAML-configured authorization layer for a toy API gateway, including namespace-scoped and cluster-scoped roles. Compare your design's decisions against real Kubernetes RBAC in a short write-up. Demonstrates: deep understanding of how a real, widely-used RBAC implementation actually works under the hood.

Each project: full type hints/tests, a schema diagram, a threat-model paragraph covering at least the cross-tenant and stale-cache risks from Security, and a README explaining the design trade-offs — the engineering discipline around the code is what gets senior interviews.
`,

  "case-studies": `
### Kubernetes 1.6: replacing file-based ABAC with in-cluster RBAC
Kubernetes originally shipped a coarse, file-based authorization mode (confusingly also called ABAC in its own docs, though simpler than the attribute-based model this platform's ABAC skill describes) that required editing a static policy file and restarting the API server to change access — unworkable for a fast-moving multi-team cluster. Kubernetes 1.6 (2017) made RBAC the default, exposing Role/ClusterRole/RoleBinding as first-class API objects that could be created, updated, and audited through the same API as everything else in the cluster. Lesson: making the access-control model a first-class, API-managed object (not a config file requiring a restart) is what let RBAC actually scale operationally inside Kubernetes.

### AWS IAM: RBAC as the backbone of an entire cloud platform
AWS IAM formalized roles (bundles of policy statements) attached to principals, with an explicit evaluation order (explicit deny always wins, then explicit allow, defaulting to deny) that has become the reference mental model for production authorization far beyond AWS itself. Lesson: a small number of clearly specified evaluation rules (deny-overrides, default-deny) prevents the ambiguity that plagues home-grown authorization logic, and is worth copying even outside of AWS.

### A cautionary tale: role explosion in enterprise IAM deployments
A recurring, widely-reported pattern in large enterprise identity deployments (documented across IAM vendor case studies and access-governance research) is organizations accumulating thousands of near-duplicate roles as they try to encode department, region, and project dimensions directly as separate roles, eventually requiring dedicated "role mining" and cleanup initiatives just to make the role catalog auditable again. Lesson: role explosion isn't a hypothetical warning, it's the default failure mode of RBAC at scale without deliberate parameterization discipline — exactly why teams increasingly reach for ABAC/ReBAC for the fine-grained dimension.

### Google Zanzibar: when RBAC/ACL hybrids hit a wall
Google's 2019 Zanzibar paper describes building a unified relationship-based authorization system after concluding that ACL and RBAC approaches, layered ad hoc across many products, could not consistently express or evaluate fine-grained, relationship-driven access ("anyone in this group that this folder was shared with") at Google's scale and latency requirements. Lesson: RBAC is excellent at coarse, role-shaped access; once access genuinely depends on a graph of relationships between specific resources, a purpose-built ReBAC system (Zanzibar, or its open-source descendants OpenFGA and SpiceDB) is the right tool, not a further-elaborated RBAC hierarchy.
`,

  comparisons: `
| Dimension | RBAC | ACL | ABAC | ReBAC (Zanzibar-style) |
|-----------|------|-----|------|--------------------------|
| Unit of grant | Role (bundle of permissions) | Per-resource, per-user entry | Policy evaluated against attributes | Relationship edge in an object graph |
| Granularity | Coarse — role-level | Fine, but per-resource only | Very fine — any attribute combination | Very fine — arbitrary relationship chains |
| Context-awareness | None natively | None | Full (time, resource state, environment) | Full, via relationship traversal |
| Administration at scale | Easy — manage role membership | Hard — grows with resources x users | Moderate — policy authoring discipline | Moderate-hard — schema + relationship data |
| Auditability | Very strong ("who holds this role") | Weak — scattered per-resource entries | Strong, but policy logic must be readable | Strong, but requires graph-aware tooling |
| Typical implementation | DB tables + hierarchy, or cloud IAM | Filesystem permissions, early web ACLs | OPA, Cedar, custom policy engines | Zanzibar, OpenFGA, SpiceDB |
| Best fit | Access that maps to job function | Small, simple, resource-owner-driven systems | Access with real contextual rules | Deep sharing/relationship graphs at scale |

**How seniors choose:** start with RBAC for anything that maps cleanly to job function — it's the easiest to administer and audit, and it is what most systems need for 80% of their access decisions. Reach for ABAC the moment you need "own resources only" or contextual rules layered on top of roles rather than instead of them — see the ABAC skill for exactly this handoff. Reach for a ReBAC system only when access is fundamentally about a graph of relationships between resources at a scale where RBAC/ABAC policy authoring becomes unmanageable (Google-scale sharing graphs, not a typical SaaS app). ACLs alone are rarely the right choice for a new system today — they're what RBAC was invented to replace.
`,

  "related-technologies": `
- **OAuth 2.0 / OIDC** — establishes WHO the caller is and can carry role/group claims in its tokens; RBAC consumes that identity, it doesn't produce it. See the OAuth skill.
- **JWT** — the token format that very often carries the role claims RBAC checks read; understanding signature verification there is a hard prerequisite for trusting any embedded role. See the JWT skill.
- **Cookies & Sessions** — the alternative, stateful way identity is established before RBAC runs; see that skill for the session-based equivalent of a bearer token.
- **ABAC** — the direct next step up in flexibility from RBAC, adding attribute- and context-awareness (resource ownership, time, environment) that RBAC cannot express natively. Read this skill next.
- **Open Policy Agent (OPA) / Casbin / AWS Cedar** — general-purpose policy engines that can implement RBAC (and ABAC) as a configured policy rather than hand-written checks scattered through code.
- **Kubernetes** — the reference production deployment of RBAC as a cluster's native authorization mode (Role/ClusterRole/RoleBinding).
- **LDAP / Active Directory** — the classic enterprise identity store whose group memberships are frequently mapped directly onto application roles.
- **OpenFGA / SpiceDB** — open-source, Zanzibar-inspired ReBAC systems relevant once RBAC/ABAC alone stop scaling to relationship-graph-shaped access needs.

On this platform, the natural next pages: **OAuth 2.0/OIDC** and **JWT** (if identity isn't solid yet) → this page → **ABAC** → **Kubernetes** for RBAC at infrastructure scale.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check the NIST, Kubernetes, and cloud-provider documentation directly for anything newer.

- **AWS Cedar** (open-sourced 2023, continuously developed): a policy language purpose-built for fast, analyzable authorization decisions, powering Amazon Verified Permissions — representative of the industry's move toward standardized, verifiable policy languages layered above simple role checks.
- **Zanzibar-inspired open-source systems** (OpenFGA, SpiceDB) have matured significantly, giving teams a real off-the-shelf option for relationship-based authorization instead of building it in-house — relevant once an RBAC deployment shows role-explosion symptoms.
- **Kubernetes RBAC remains stable and foundational**: no major model changes recently, but the surrounding ecosystem (OPA Gatekeeper, Kyverno) has continued to mature as the standard way to layer policy-based constraints on top of native RBAC.
- **Fine-grained authorization ("FGA") has become common vendor terminology** for hybrid RBAC+ABAC+ReBAC offerings (Auth0 FGA, Okta, and others), reflecting the broader industry trend that pure RBAC alone is increasingly treated as the coarse layer of a two-layer authorization stack rather than the whole answer.
- **AI agent authorization is an emerging, unsettled area**: as agentic systems gained tool-calling capability through 2024-2025, teams began applying RBAC-style least-privilege scoping to what an agent's tools can access, though no single standard has emerged yet — treat this as an actively evolving space rather than settled practice.
`,

  "future-roadmap": `
Where RBAC-adjacent authorization is heading, and what's worth betting career time on:

1. **Hybrid RBAC+ABAC as the default architecture**, not a sophisticated exception. Expect more systems to explicitly split "coarse role gates the capability" from "attribute policy gates the specific instance" as a standard two-layer design, rather than trying to force everything into role names.
2. **Standardized, verifiable policy languages** (Cedar and its peers) continuing to gain ground over ad hoc "if permission in set" checks scattered through application code — policy-as-code with the same review rigor as application code.
3. **Fine-grained authorization services becoming a standard piece of infrastructure**, the way identity providers (Auth0, Okta) became standard for authentication — expect "authorization as a managed service" (OpenFGA-as-a-service, Cedar-based offerings) to keep growing rather than every team hand-rolling RBAC tables from scratch.
4. **AI agent and tool-permission scoping maturing into its own discipline.** As agentic systems take more autonomous actions, expect explicit, auditable, least-privilege scoping of what tools/APIs an agent may invoke to become as standard as RBAC is for human users today — this is genuinely unsettled territory worth watching closely.
5. **Continued growth of ReBAC for relationship-heavy products** (anything resembling Google Docs-style nested sharing) as open-source Zanzibar descendants make that model accessible outside hyperscalers.

For your career: understanding the NIST RBAC model cold, knowing precisely where it breaks down (role explosion, lack of context-awareness), and being able to design the RBAC-to-ABAC/ReBAC handoff is the skill that separates "can add an is_admin flag" from "can design an organization's access-control architecture."
`,

  "cheat-sheet": `
~~~text
# --- Core NIST model ---
User        -> assigned ->  Role(s)
Role        -> granted  ->  Permission(s)   (permission = "resource:action")
Session     -> a runtime instant where a user activates some subset of roles

RBAC0  flat roles, no hierarchy, no constraints
RBAC1  + role hierarchy (senior role inherits junior role's permissions)
RBAC2  + constraints (separation of duties, cardinality) on a flat model
RBAC3  hierarchy AND constraints combined

# --- Authn vs authz ---
Authentication = WHO you are   (OAuth/OIDC, JWT, Cookies & Sessions skills)
Authorization  = WHAT you can do (RBAC starts here, assumes identity is resolved)
401 = identity unresolved   403 = identity known, permission denied

# --- Schema (SQLAlchemy-style) ---
users            (id, email, ...)
roles            (id, name, parent_id)         # parent_id enables RBAC1 hierarchy
permissions      (id, name)                    # e.g. "invoices:approve"
user_roles       (user_id, role_id)             # add org_id for multi-tenant scoping
role_permissions (role_id, permission_id)

# --- Permission resolution (cycle-safe) ---
def resolve(role, seen=None):
    seen = seen or set()
    if role.id in seen: return set()
    seen.add(role.id)
    perms = set(role.permissions)
    if role.parent: perms |= resolve(role.parent, seen)
    return perms

# --- FastAPI dependency-injection pattern ---
def require_permission(permission):
    def check(user = Depends(get_current_user)):
        if permission not in effective_permissions(user):
            raise HTTPException(403, "Missing permission: " + permission)
        return user
    return check

@router.post("/invoices/{id}/approve")
def approve(id: int, user = Depends(require_permission("invoices:approve"))): ...

# --- Constraints (RBAC2/3) ---
Static SoD  -> cannot HOLD two conflicting roles at once (checked at assignment time)
Dynamic SoD -> can hold both, cannot ACTIVATE both in one session (checked at session time)
Cardinality -> e.g. max one active break-glass-admin session at a time

# --- Multi-tenant scoping ---
user_org_roles(user_id, org_id, role_id)   # same user, different roles per org
EVERY permission check must take org/tenant as an explicit input

# --- Kubernetes RBAC mapping ---
Role / ClusterRole   -> permission rules (verbs on API resources)  = NIST Role
RoleBinding          -> assigns a Role to a Subject (user/group/ServiceAccount) = User-Role assignment
Role = namespace-scoped   ClusterRole = cluster-wide

# --- Common pitfalls ---
Authenticated != authorized (always check permission separately)
Superadmin bypass flags defeat every constraint you designed
Missing tenant/org scoping = cross-tenant data leak
Stale permission cache = revoked access still works
Role explosion = time to parameterize or move to ABAC

# --- Comparison quick pick ---
RBAC  -> access maps to job function, coarse, easy to audit
ABAC  -> access depends on resource/context attributes ("own resources only")
ReBAC -> access depends on a relationship graph (Zanzibar, OpenFGA, SpiceDB)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What are the four NIST RBAC entities? | Users, Roles, Permissions, Sessions |
| What does a Permission actually represent? | An approval to perform an operation on an object, typically named "resource:action" |
| What does RBAC1 add over RBAC0? | Role hierarchies — a role inherits its parent role's permissions |
| What does RBAC2 add over RBAC0? | Constraints — separation of duties and cardinality limits, without hierarchy |
| What is RBAC3? | RBAC1 and RBAC2 combined: hierarchy plus constraints |
| Static SoD vs dynamic SoD | Static blocks holding two conflicting roles at all; dynamic allows holding both but blocks activating both in one session |
| Authentication vs authorization | Authentication proves WHO you are; authorization (RBAC's job) decides WHAT you can do |
| 401 vs 403 | 401 = identity not resolved; 403 = identity resolved, permission denied |
| What is role explosion? | Combinatorial growth of near-duplicate roles trying to encode multiple dimensions (region, department, time) as separate roles |
| Fix for role explosion? | Parameterize roles with an attribute checked at decision time, or migrate that dimension to ABAC |
| How should multi-tenant role assignment be scoped? | Scope the ASSIGNMENT to an org/tenant id, not the role definition itself |
| What does Kubernetes RoleBinding correspond to in NIST terms? | The User-to-Role assignment step |
| Role vs ClusterRole in Kubernetes | Namespace-scoped permission rules vs cluster-wide permission rules |
| What's the default decision when no permission is explicitly granted? | Deny — RBAC must default-deny, never default-allow |
| Why must every permission check cache be paired with invalidation? | A stale cache after a role revocation is a live security bug, not just a performance issue |
| When do you reach for ABAC instead of (or on top of) RBAC? | When access depends on resource-instance attributes or context, not just the caller's job function |
`,

  mcqs: `
**1. Which NIST RBAC variant adds role hierarchies without constraints?**

A) RBAC0  B) RBAC1  C) RBAC2  D) RBAC3

**Answer: B** — RBAC1 adds hierarchical role inheritance on top of the flat RBAC0 model; RBAC2 adds constraints instead of hierarchy, and RBAC3 combines both.

**2. A request carries a valid, correctly signed JWT, but the user's role lacks the required permission. What should the API return?**

A) 401 Unauthorized  B) 403 Forbidden  C) 500 Internal Server Error  D) 200 OK with an error body

**Answer: B** — identity was successfully established (the token is valid), so this is an authorization failure, not an authentication failure; 403 is correct, not 401.

**3. In a multi-tenant SaaS backend, what is the most common security bug related to RBAC?**

A) Using resource:action permission naming  B) A permission check that omits the tenant/organization as an explicit input, allowing cross-tenant access  C) Role hierarchies being too deep  D) Using Redis to cache permissions

**Answer: B** — forgetting to scope the check by tenant is the classic cross-tenant leak; the other options are either neutral conventions or acceptable performance techniques when done correctly.

**4. What does a Kubernetes RoleBinding do?**

A) Defines the list of allowed API verbs and resources  B) Assigns a Role or ClusterRole to a Subject (user, group, or ServiceAccount)  C) Authenticates a user to the cluster  D) Creates a new namespace

**Answer: B** — the Role/ClusterRole defines the permission rules; the RoleBinding/ClusterRoleBinding is the assignment step, directly analogous to NIST's User-Role assignment.

**5. What is "role explosion"?**

A) A denial-of-service attack against the role database  B) The combinatorial proliferation of near-duplicate roles as an organization tries to encode multiple access dimensions directly as separate roles  C) A Kubernetes RBAC misconfiguration that grants cluster-admin accidentally  D) A caching bug where roles are resolved too many times per request

**Answer: B** — it specifically refers to role catalog sprawl from over-enumerating dimensions like region/department/time as distinct roles instead of parameterizing.

**6. Which access-control model would you reach for if you needed "editors may edit only documents they personally own"?**

A) Plain RBAC alone  B) ABAC (or an RBAC+attribute hybrid)  C) A larger role hierarchy  D) A stricter separation-of-duties constraint

**Answer: B** — resource-instance ownership is a contextual attribute RBAC alone cannot express; this is precisely the gap ABAC is designed to close, typically layered on top of an existing RBAC role check.
`,

  "revision-notes": `
**The core model in a few lines:** RBAC decides authorization (WHAT you can do) strictly after authentication (WHO you are, handled by OAuth/JWT/Cookies) has resolved an identity. The NIST model has four entities — Users, Roles, Permissions, Sessions — and the entire idea is the indirection: users get roles, roles get permissions, nobody gets permissions directly. RBAC0 is flat; RBAC1 adds hierarchy (a role inherits its parent's permissions); RBAC2 adds constraints (separation of duties, cardinality) on a flat model; RBAC3 combines hierarchy and constraints.

**Implementation in a few lines:** A production backend models this with Users, Roles (with a parent_id for hierarchy), Permissions, and two join tables (user_roles, role_permissions). Effective permissions are resolved by unioning a user's roles' permissions and walking the hierarchy with a cycle guard. The FastAPI pattern is a require_permission(permission) dependency factory — a direct generalization of a single hardcoded require_admin check into named, database-backed permissions, checked at the request boundary via dependency injection.

**Where RBAC breaks down:** it cannot express resource-instance or contextual rules ("own documents only," "business hours only") — that gap is exactly what the ABAC skill fills, layered on top rather than replacing RBAC. At organizational scale, encoding too many dimensions (region, department, time) as separate roles causes role explosion; the fix is parameterizing roles or moving that dimension to ABAC. Multi-tenant systems must scope every ROLE ASSIGNMENT (not the role definition) to an organization, or risk cross-tenant leaks.

**Production discipline:** default-deny always; cache effective permissions but pair every cache with real invalidation tied to mutation events, not a bare TTL; never build a superadmin bypass flag; enforce separation of duties in code for anything touching money or compliance; log every grant/revoke/edit to an audit trail from day one; test the negative path (403) for every protected endpoint, not just the happy path.

**Industry grounding:** AWS IAM and Kubernetes (Role/ClusterRole/RoleBinding) are the two most important real-world RBAC implementations to be able to describe fluently in an interview. Google's Zanzibar paper marks the point where pure RBAC/ACL approaches stopped scaling for relationship-graph-shaped access, giving rise to ReBAC systems (OpenFGA, SpiceDB) as a complementary model for that specific problem.
`,

  "learning-roadmap": `
A realistic path to being interview- and production-ready on RBAC:

**Week 1 — Foundations and the NIST model.** Read Overview through Prerequisites; make sure the authentication-vs-authorization line is completely solid (revisit the JWT or Cookies & Sessions skill if not). Milestone: explain RBAC in one sentence, correctly, out loud, without notes.

**Week 2 — Core concepts and hierarchy.** Beginner and Intermediate Concepts; build Hands-on Lab 1 (in-memory RBAC engine) and Lab 2 (FastAPI + SQLAlchemy). Milestone: your own require_permission dependency, tested with both positive and negative cases.

**Week 3 — Advanced patterns.** Advanced Concepts (role explosion, multi-tenant scoping, Kubernetes RBAC); build Lab 3 (multi-tenant, cached RBAC) and Lab 4 (real Kubernetes manifests in a local cluster). Milestone: a passing test proving cross-tenant access is denied even with an identical role name.

**Week 4 — Production hardening.** Security, Performance, Scalability, Monitoring, Production Checklist sections. Add caching with real invalidation, an audit log, and metrics to your Lab 3 project. Milestone: your project satisfies every item on the Production Checklist.

**Week 5 — Interview and case-study fluency.** Interview Questions, Coding Questions, Case Studies, Comparisons. Be able to whiteboard the hierarchy-resolution algorithm and the SoD-conflict checker from memory, and explain the RBAC/ABAC/ReBAC boundary with a concrete example for each.

**Week 6 — The handoff.** Build Real Project 2 (the RBAC-to-ABAC migration case study), which forces you to feel exactly where RBAC's limits are. Then move on to the **ABAC** skill on this platform — the next step up in flexibility, and the direct continuation of everything this page built.
`,

  "official-docs": `
- [NIST Role Based Access Control project page](https://csrc.nist.gov/projects/role-based-access-control) — the original research home for RBAC, including the foundational papers and standard history.
- [ANSI/INCITS 359-2004 RBAC standard](https://profsandhu.com/journals/tissec/ANSI+INCITS+359-2004.pdf) — the ratified formal standard defining RBAC0 through RBAC3 precisely.
- [Kubernetes RBAC documentation](https://kubernetes.io/docs/reference/access-control/rbac/) — Role, ClusterRole, RoleBinding, ClusterRoleBinding, with worked examples; the best hands-on real-world reference for this model.
- [AWS IAM documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) — roles, policies, and the deny-overrides evaluation logic, as the reference cloud-scale RBAC implementation.
- [Open Policy Agent documentation](https://www.openpolicyagent.org/docs/latest/) — for implementing RBAC (and beyond) as an externalized, testable policy.
- [Casbin documentation](https://casbin.org/docs/overview) — an approachable, embeddable authorization library supporting RBAC models directly.
`,

  books: `
- **Role-Based Access Control, 2nd ed.** — David Ferraiolo, D. Richard Kuhn, Ramaswamy Chandramouli. Written by the researchers who formalized the model; the single most authoritative book on RBAC specifically.
- **Identity and Access Management: Business Performance Through Connected Intelligence** — Ertem Osmanoglu. Broader IAM context, useful for seeing where RBAC fits inside enterprise identity governance.
- **Designing Secure Software** — Loren Kohnfelder. Not RBAC-specific, but its threat-modeling framing is exactly the right lens for reasoning about authorization boundaries and confused-deputy problems.
- **Zero Trust Networks, 2nd ed.** — Razi Rais, Christina Morillo, Evan Gilman, Doug Barth. Situates fine-grained authorization (including RBAC's limits) inside a modern, context-aware security architecture.
- **Cloud Native Security** — Chris Binnie, Rory McCune. Practical coverage of Kubernetes RBAC alongside the rest of a cluster's security posture.
`,

  blogs: `
- **AWS Security Blog** — regularly publishes deep, concrete IAM policy and role-design guidance grounded in real incidents.
- **Kubernetes Blog** (kubernetes.io/blog) — official coverage of RBAC changes and best practices as the project evolves.
- **Auth0 / Okta developer blogs** — practical, framework-agnostic authorization and identity content, including RBAC vs ABAC vs fine-grained authorization comparisons.
- **Open Policy Agent blog** — policy-as-code patterns directly applicable to implementing RBAC as an externalized, testable policy set.
- **Google Cloud / AWS re:Invent talk write-ups on IAM** — high-signal for seeing RBAC reasoning at hyperscale.
`,

  "research-papers": `
RBAC has an unusually strong direct academic foundation — these are the real, foundational papers, not adjacent reading:

- **"Role-Based Access Control"** — David Ferraiolo and Richard Kuhn, 1992. The paper that named and formalized the model; start here.
- **"Role-Based Access Control Models"** — Ravi Sandhu, Edward Coyne, Hal Feinstein, Charles Youman, 1996 (IEEE Computer). Introduces the RBAC96 family — RBAC0 through RBAC3 — and is the source of the hierarchy/constraint terminology used throughout this page.
- **"A First Step Toward Formal Verification of RBAC Policies"** and related NIST/INCITS committee documents from the standardization process (2000-2004) — useful if you want to see how the academic model became a ratified standard.
- **"Zanzibar: Google's Consistent, Global Authorization System"** — Google, 2019 (USENIX ATC). Not an RBAC paper, but essential contrasting reading — it explains precisely why relationship-based authorization was built as a complement to (not a replacement for) role- and ACL-based approaches at extreme scale, referenced throughout Comparisons and Case Studies.

If you want closer foundational reading beyond pure RBAC, the broader access-control-model literature (Lampson's original access matrix formulation, and the Bell-LaPadula MAC paper for historical contrast) rounds out the picture of what RBAC was designed to improve on.
`,

  videos: `
- **NIST RBAC project talks and retrospectives** — search for Ferraiolo/Kuhn conference presentations on the RBAC standard's history; directly from the source.
- **KubeCon talks on Kubernetes RBAC and policy engines** — recurring conference track; search "KubeCon RBAC" or "KubeCon OPA Gatekeeper" for current-year deep dives, as specific talk titles change yearly.
- **AWS re:Invent IAM deep-dive sessions** — annual talks covering IAM policy evaluation and role design at scale; search "re:Invent IAM deep dive" for the latest year's session.
- **Google's Zanzibar paper walkthroughs** — several independent engineering-channel breakdowns exist on YouTube; useful for the RBAC/ReBAC contrast covered in Comparisons.

Note: specific talk titles and speakers change by conference year — search the terms above on the conference's own archive for the most current, verified sessions rather than relying on a single named talk here.
`,

  "github-repos": `
- [casbin/casbin](https://github.com/casbin/casbin) — a widely used, embeddable authorization library with pluggable RBAC/ABAC/ACL models; excellent for seeing how a general policy engine implements RBAC concretely.
- [openfga/openfga](https://github.com/openfga/openfga) — open-source, Zanzibar-inspired fine-grained authorization; good reading once you want to see the RBAC-to-ReBAC handoff implemented.
- [authzed/spicedb](https://github.com/authzed/spicedb) — another open-source Zanzibar-style system; compare its schema language against a plain RBAC role table to feel the difference directly.
- [open-policy-agent/opa](https://github.com/open-policy-agent/opa) — the reference implementation of policy-as-code authorization, usable to implement RBAC as an externalized Rego policy.
- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes) — the pkg/apis/rbac source is the real production implementation described in Advanced Concepts.
- [aws/cedar-policy](https://github.com/cedar-policy/cedar) — AWS's open-sourced policy language, relevant to the Latest Updates section's coverage of standardized policy languages.
- [dexidp/dex](https://github.com/dexidp/dex) — an OIDC identity provider whose group/role claim handling shows the authentication-to-RBAC handoff in real code.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Core model fluency*: implement the four NIST entities from scratch with no framework, including a role hierarchy at least three levels deep, and a test suite proving inheritance is correct.
2. *Hierarchy algorithms*: implement resolve_permissions with cycle detection (from Coding Questions), then extend it with memoization and prove via a benchmark that repeated resolution of a shared ancestor role is not re-walked unnecessarily.
3. *Constraints*: implement both static and dynamic separation-of-duties checking, including a test for a three-role mutual-exclusion group, not just a pair.
4. *Multi-tenant design*: design and implement the org-scoped assignment schema, then write a deliberately adversarial test attempting cross-tenant access and confirm it is denied.
5. *Kubernetes*: write Role/RoleBinding manifests for three different access patterns (read-only pod viewer, namespace-scoped deployer, cluster-wide read-only auditor via ClusterRole) and verify each with kubectl auth can-i.
6. *Policy engine*: reimplement one of your RBAC checks as an OPA Rego policy or a Casbin model file, and compare the resulting readability and testability against your hand-written check.
7. *Security*: given a permission-check function with an intentionally missing tenant-scope parameter, find and fix the cross-tenant leak, then write the regression test that would have caught it.

External sets: OWASP's Access Control testing guide (for the security angle), the Kubernetes RBAC "good practices" documentation exercises, and any CTF-style web-security set that includes an IDOR/broken-access-control category (RBAC's failure modes overlap heavily with that category).
`,

  "architecture-diagram": `
The reference production architecture for RBAC inside a backend service, showing where it sits relative to authentication, caching, and the audit trail:

~~~mermaid
flowchart TB
    Client["Clients"] --> GW["API gateway"]
    GW --> AuthN["Authentication\n(JWT / OAuth / session verification)"]
    AuthN --> API1["API service instance 1"]
    AuthN --> API2["API service instance N"]
    API1 & API2 --> RBAC["RBAC permission-check dependency\n(require_permission)"]
    RBAC --> Cache[("Redis: effective permissions\nkeyed by user+org, versioned")]
    RBAC --> DB[("Postgres: users, roles,\npermissions, hierarchy, org-scoped assignments")]
    RBAC -->|allow| Handler["Business logic handler"]
    RBAC -->|deny| Deny["403 Forbidden"]
    Admin["Admin console"] -->|create/edit role, assign/revoke| DB
    Admin -->|publish invalidation event| Bus["Pub/sub"]
    Bus -.bust stale entries.-> Cache
    DB -.every mutation.-> Audit[("Append-only audit log")]
~~~

Every box maps directly to a section on this page: AuthN is the JWT/OAuth/Cookies boundary; the RBAC dependency is the Intermediate Concepts worked example; Cache and Bus are the Performance/Scalability invalidation story; the Audit log is the Monitoring section's requirement.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((RBAC))
    Core model
      Users
      Roles
      Permissions
      Sessions
      NIST RBAC0-3
    Hierarchy and constraints
      RBAC1 hierarchy
      Static SoD
      Dynamic SoD
      Cardinality constraints
    Authn vs authz
      OAuth / OIDC
      JWT
      Cookies and Sessions
      401 vs 403
    Implementation
      SQLAlchemy schema
      require_permission dependency
      Caching and invalidation
      Multi-tenant org scoping
    Real-world RBAC
      AWS IAM
      Kubernetes Role/RoleBinding
      Salesforce Profiles
      Snowflake roles
    Limits and evolution
      Role explosion
      ABAC handoff
      ReBAC / Zanzibar
      OPA / Casbin / Cedar
    Operations
      Security pitfalls
      Auditing
      Monitoring
      Testing negative paths
~~~
`,
};

export default rbac;
