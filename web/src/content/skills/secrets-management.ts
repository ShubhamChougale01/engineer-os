import type { SkillContent } from "../types";

/**
 * Secrets Management — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const secretsManagement: SkillContent = {
  overview: `
Secrets management is the discipline of generating, storing, distributing, rotating, and revoking the credentials that let software authenticate to other software: API keys, database passwords, TLS private keys, OAuth client secrets, JWT signing keys, and cloud service tokens. It sits at the intersection of security engineering and platform engineering — every production system has secrets, and how you handle them is one of the clearest signals of engineering maturity a code review can reveal.

For an AI engineer this is not a niche concern. Every LLM SDK call carries an API key (OpenAI, Anthropic, a self-hosted model gateway). Every RAG pipeline talks to a vector database with a credential. Every agent that can call tools eventually needs to call an external API, and that API needs a secret. Get secrets management wrong and you leak a key in a git commit, a stack trace, or a public S3 bucket — and someone else runs up thousands of dollars of inference cost, or worse, pivots into your production database.

The core idea that separates secrets from ordinary configuration is blast radius: a secret's value alone is sufficient to impersonate your system to another system. A wrong timeout value causes a bug. A leaked database password causes a breach. That asymmetry is why secrets need a different lifecycle than config — encryption at rest, access auditing, rotation, and the assumption that leakage will eventually happen and must be survivable.

Key characteristics of a mature secrets management approach: secrets are never stored in source control, never baked into container images, are encrypted both at rest and in transit, are scoped to the minimum privilege a workload needs, are rotated on a schedule (or generated on demand and short-lived), and every access is logged so a breach can be investigated. This page builds that mental model from a plaintext ".env" file all the way to dynamic, short-lived credentials issued by HashiCorp Vault — the state of the art in 2026.
`,

  history: `
Secrets management as a named discipline is younger than the problem it solves. Early computing had passwords and keys, but "secrets management" as an engineering practice emerged from two converging pressures: the explosion of distributed, cloud-native architectures (many services, many credentials, many humans with access) and a decade of high-profile breaches traced directly to a hardcoded or leaked credential.

| Year | Milestone |
|------|-----------|
| 1970s–1990s | Secrets are mostly config files and shell environment variables on single servers; the blast radius of a leak is one machine |
| 2005–2010 | Config-management tools (Chef, Puppet) template secrets into files across fleets — convenient, but secrets now live in more places (SCM-adjacent cookbooks, agent logs) |
| 2011 | The "12-factor app" methodology popularizes storing config (including secrets) in environment variables, explicitly out of source control — a huge step forward for its time, and still the baseline pattern today |
| 2013 | The heartbleed-adjacent wave of TLS key compromises pushes the industry toward routine key rotation as a default expectation, not an incident-response afterthought |
| 2014 | Cloud providers begin shipping first-party secret stores: AWS introduces Key Management Service (KMS) as an encryption-key backbone |
| 2015 | HashiCorp releases **Vault** — the first widely adopted, cloud-agnostic secrets manager with dynamic secrets, leasing, and a pluggable "secrets engine" model |
| 2016–2018 | AWS Secrets Manager, GCP Secret Manager, and Azure Key Vault ship as managed, first-party alternatives tied to each cloud's IAM |
| 2018–2019 | Kubernetes adoption exposes the weakness of the built-in Secret object (base64, not encryption); the External Secrets Operator and Vault Agent Injector patterns emerge to bridge Kubernetes to real secrets managers |
| 2019–2020 | GitHub adds native secret scanning across public (and later private) repositories, formalizing "detect leaks automatically" as table stakes |
| 2020s | Dynamic, short-lived credentials become the recommended default for databases and cloud access; "zero standing privilege" enters mainstream vocabulary |
| 2022–2025 | Supply-chain and CI/CD secret leaks (build logs, third-party Actions) drive GitHub Actions OIDC federation adoption — workloads exchange identity for temporary cloud credentials instead of storing long-lived cloud keys as CI secrets at all |

The throughline: every few years, the previous generation's "good enough" pattern (plaintext files, then env vars, then static vault secrets) gets undermined by a new attack surface, and the industry response is always the same shape — shrink the credential's lifetime and blast radius.
`,

  "why-it-exists": `
Before dedicated secrets management, credentials lived wherever was convenient: hardcoded in source, dropped into a config file next to the code, or emailed between teammates. That world had a specific set of failures:

- **Secrets in git**: a database password committed "temporarily" is permanent — git history keeps it forever, and every clone, fork, and CI checkout copies it forward.
- **Secrets in code**: a hardcoded API key ships inside the built artifact (container image, mobile app, npm package) and can be extracted by anyone who obtains that artifact, including through decompilation.
- **No audit trail**: when a credential was misused, there was no way to answer "who used this, when, and from where" — investigation was guesswork.
- **One secret, unlimited lifetime, unlimited scope**: a single database password often had full read/write access and never expired, so a leak from three years ago could still be actively exploitable today.
- **Manual rotation nobody did**: rotating a password meant coordinating a deploy across every service that used it, so in practice it almost never happened until after an incident forced it.

Secrets management exists to close this gap systematically: separate secret material from code and config, centralize where secrets live so there is exactly one place to audit and rotate, and make short-lived, narrowly scoped credentials the path of least resistance instead of the exception. See the **Encryption** skill for how secrets managers protect secrets at rest — they are, under the hood, an applied encryption problem (envelope encryption, key hierarchies) wrapped in an access-control and audit layer.
`,

  "problem-it-solves": `
Concrete pains secrets management removes:

- **Accidental disclosure**: by keeping secrets out of source control, build artifacts, and logs, the most common leak vector (a developer commits a ".env" file, or a debug log prints a full request including an Authorization header) is structurally prevented rather than relying on discipline alone.
- **Coordinated, low-friction rotation**: when a secrets manager is the single source of truth, rotating a database password becomes "generate a new one, update one record, workloads pick it up" instead of "grep the codebase for every place this string appears."
- **Least privilege at the credential level**: fine-grained access policies mean a payments service can read the payments database credential and nothing else — even if that service is fully compromised, the attacker doesn't automatically get every other secret in the organization.
- **Investigability**: every read of a secret is logged with identity, time, and source — so after an incident you can answer "was this secret ever accessed by an unexpected identity" instead of assuming the worst about everything.
- **Reduced blast radius via short lifetimes**: a database credential that expires in five minutes is nearly useless to an attacker who finds it in a log line an hour later.

What secrets management deliberately does **not** solve:

- It does not replace authentication and authorization design — a secrets manager gives your service a database password, but the database's own user permissions still need correct scoping.
- It does not stop application-level vulnerabilities like SQL injection or XSS (see those dedicated skills) — a leaked secret and an injection bug are different failure classes that happen to often chain together in an incident.
- It does not make secrets unnecessary — some credential must exist for two systems to trust each other. The goal is minimizing lifetime, scope, and exposure surface, not eliminating secrets entirely (short of mutual-TLS/workload-identity schemes that trade static secrets for cryptographic identity — still a form of secret, just automatically rotated).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Correctly classify what counts as a secret (API keys, DB credentials, TLS private keys, OAuth client secrets, signing keys, tokens) versus what is safe as plain configuration.
2. Explain why committing a secret to git is never safely reversible, and what "rotate immediately" actually requires after it happens.
3. Set up and reason about ".env"-based local development configuration, and articulate precisely why the same pattern fails at production scale.
4. Compare HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, and Azure Key Vault, and choose between them for a given deployment target.
5. Explain dynamic secrets and design a workflow where a database credential is generated on demand and expires automatically.
6. Correctly distinguish Kubernetes Secret objects (base64-encoded, not encrypted) from real secret protection, and configure encryption-at-rest plus an External Secrets Operator or Vault Agent Injector integration.
7. Configure CI/CD secret handling (GitHub Actions encrypted secrets, log masking, OIDC federation) without leaking values into build logs or artifacts.
8. Run and interpret secret-scanning tools (git-secrets, truffleHog, GitHub secret scanning) and describe an incident-response runbook for a leaked credential.
9. Apply least-privilege scoping to every credential a system holds, and justify it in a design review.
10. Recognize the platform's own AEOS_* environment variable configuration as a legitimate phase-1 pattern, and describe the concrete next steps to evolve it toward a real secrets manager.
`,

  prerequisites: `
- **Required**: basic command-line literacy, familiarity with environment variables, and having deployed at least one application with a database connection string or API key.
- **Helpful**: the **Encryption** skill (envelope encryption, key hierarchies — what Vault/KMS do internally) and the **Hashing** skill (why a secret's own storage sometimes uses a hash, e.g. password verifiers) make the internals sections click faster.
- **For the Kubernetes/Docker sections**: basic familiarity with the **Docker** and **Kubernetes** skills — this page assumes you know what a container image and a Pod are, but not how their secret-injection mechanisms work internally; that is covered here.
- **For the CI/CD sections**: passing familiarity with a CI system (GitHub Actions is used as the running example) is helpful but not required.

Dependency links: **Encryption** and **Hashing** → this page → **TLS & HTTPS**, **OWASP Top 10**, **Docker**, **Kubernetes** all connect directly to the practices covered here.
`,

  "beginner-concepts": `
### What actually counts as a secret

A secret is any value whose disclosure alone lets someone impersonate your system or access data they shouldn't. That includes:

- **API keys** — a string like "sk-..." that authenticates your code to a third-party service (OpenAI, Stripe, Twilio).
- **Database credentials** — username/password or a full connection string ("postgres://user:pass@host/db").
- **TLS private keys** — the private half of a certificate keypair; anyone with it can impersonate your HTTPS endpoint (see the **TLS & HTTPS** skill).
- **OAuth client secrets** — the password-like value a "Login with Google" integration uses to prove its identity to the OAuth provider.
- **Signing keys** — keys used to sign JWTs, cookies, or webhooks so a receiver can trust the sender didn't forge the payload.
- **Tokens** — session tokens, refresh tokens, personal access tokens; short-lived by design, but still bearer credentials while valid.

Contrast with **regular configuration**: a timeout value, a feature flag, a log level, or a public API base URL. The test is simple — if I paste this value into a public Slack channel by accident, does anything bad happen? A timeout value: no. A database password: yes, immediately.

~~~text
# Regular config — safe to commit
LOG_LEVEL=info
MAX_RETRIES=3
API_BASE_URL=https://api.example.com

# Secrets — never commit
DATABASE_PASSWORD=hunter2
STRIPE_SECRET_KEY=sk_live_51H8x...
JWT_SIGNING_SECRET=a3f9c1e2...
~~~

### The cardinal sin: never commit secrets to git

This is the single most important rule in this entire page. Once a secret is committed:

1. It exists in every clone of the repository, forever, even after you delete the file in a later commit — git history retains every prior version.
2. If the repository is ever forked (public or private-to-public accidentally), the secret travels with the fork.
3. CI systems check out full or partial history and often print diffs or run commands that echo file contents into logs — a secret in a commit can end up duplicated into a CI log, which is itself another leak vector.
4. Automated scanners (including attackers' own bots) continuously crawl public GitHub for patterns that look like API keys — leaked keys are frequently found and abused within minutes of a push.

### Why "just delete it later" doesn't work

~~~bash
# This does NOT remove the secret from history:
git rm .env
git commit -m "remove secret file"
git push
# The secret is still recoverable at the prior commit:
git log --all --full-history -- .env
git show <old-commit>:.env
~~~

The only correct response to a committed secret is: **rotate the secret itself** (generate a new one, invalidate the old one at the source — the database, the API provider, the OAuth app) and, separately, scrub history with a tool like git-filter-repo if you also want the old value gone from the repo (this does not undo any copies already made by clones or forks). Rotation is the fix; history rewriting is cleanup that does not substitute for rotation.

### .gitignore as the first line of defense

~~~text
# .gitignore
.env
.env.local
*.pem
*.key
secrets/
~~~

This is necessary but not sufficient — a .gitignore only prevents new commits; it does nothing for a secret already committed, and it does nothing to stop a secret from being pasted directly into code.

### The starting point: .env files for local development

~~~bash
# .env (local machine only — never committed)
DATABASE_URL=postgres://dev:dev@localhost:5432/myapp
OPENAI_API_KEY=sk-...

# .env.example (committed — documents what's needed, holds no real values)
DATABASE_URL=
OPENAI_API_KEY=
~~~

~~~python
# Loading it in Python with python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env into process environment, local dev only
api_key = os.environ["OPENAI_API_KEY"]
~~~

This is a perfectly reasonable way to configure a single developer's laptop. The problems start when this same pattern is stretched to production — covered next.
`,

  "intermediate-concepts": `
### Why .env files are a production anti-pattern at scale

A ".env" file (or its equivalent, environment variables injected by a process manager) works for one developer on one laptop. At production scale it breaks down along several axes:

- **No audit trail**: an environment variable, once read into a process, leaves no record of who accessed it or when. If ten services all read the same database password from the same environment variable, you cannot answer "which of these ten actually needs it" or "was it ever read by an unexpected process."
- **No fine-grained access control**: environment variables are all-or-nothing per process. There is no way to say "this service can read the payments secret but not the analytics secret" without physically giving each service a different environment — which quickly becomes unmanageable across dozens of services.
- **No rotation story**: rotating a secret means updating it everywhere it's injected (every server, every container, every CI job) and restarting every process — usually manual, usually risky, usually skipped.
- **Leak surface multiplies**: environment variables show up in process listings (on some systems), in crash dumps, in container inspect output, and are trivially forwarded into child processes and third-party logging/monitoring agents that capture "the environment" for debugging.
- **No dynamic/short-lived credentials**: an env var is static until someone changes it; there is no built-in concept of "this credential expires in five minutes."

This platform's own **api/.env.example** file is a clean illustration of exactly this phase-1 pattern, and worth studying because it's honest about its own limits:

~~~text
# api/.env.example (this platform)
AEOS_JWT_SECRET=dev-only-secret-change-me
AEOS_DATABASE_URL=sqlite:///./aeos.db
#AEOS_GITHUB_CLIENT_SECRET=
#AEOS_GOOGLE_CLIENT_SECRET=
#AEOS_APPLE_PRIVATE_KEY=
~~~

Notice the comment "REQUIRED in production — generate with: openssl rand -hex 32" next to AEOS_JWT_SECRET. That single line is doing a lot of work: it's telling you the default value is a dev placeholder, that production needs a real random secret, and that a strong-entropy generator (not a human-chosen password) must produce it. For a single small service with one deployment target, AEOS_*-style environment variables loaded from a platform's encrypted environment (e.g. the host's secret store, or a container orchestrator's secret injection) are a legitimate phase-1 answer. The evolution path as the platform grows: move AEOS_JWT_SECRET, AEOS_GITHUB_CLIENT_SECRET, AEOS_GOOGLE_CLIENT_SECRET, and AEOS_APPLE_PRIVATE_KEY out of plain environment variables and into a dedicated secrets manager (Vault or a cloud-native equivalent), inject them into the process at startup or via a sidecar, add rotation for AEOS_JWT_SECRET on a schedule (which requires supporting two valid signing keys briefly during rollover so in-flight tokens don't all invalidate at once), and add audit logging so "who read the Google OAuth client secret and when" is answerable.

### Dedicated secrets managers: what they add over plain env vars

A dedicated secrets manager — HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault — is a service whose entire job is storing, serving, and governing secrets. Compared to environment variables, they add:

1. **Encryption at rest by design**: secrets are encrypted with a root/master key (often itself protected by a hardware security module or cloud KMS) using envelope encryption — see the **Encryption** skill for the mechanics. You never handle the master key directly.
2. **Fine-grained access policies**: a policy can state exactly which identity (service account, IAM role, Kubernetes ServiceAccount) may read exactly which secret path, and nothing else.
3. **Audit logs**: every read, write, and policy change is logged immutably — "who accessed the payments DB credential, from where, at what time" becomes a query, not an investigation.
4. **Dynamic, short-lived credentials**: instead of storing one static database password, Vault can generate a brand-new database user with a five-minute lease on demand — covered in depth in Advanced Concepts.
5. **Automatic rotation**: secrets can be rotated on a schedule with the manager coordinating the change at the source (the database, the cloud API) and updating consumers, instead of a human running a manual runbook.
6. **Versioning and recovery**: most managers keep prior versions of a secret, so a bad rotation can be rolled back without any coordinated redeploy.

~~~bash
# HashiCorp Vault — write and read a static secret
vault kv put secret/myapp/db password="s3cr3t-generated-value"
vault kv get secret/myapp/db

# AWS Secrets Manager — equivalent
aws secretsmanager create-secret --name myapp/db --secret-string '{"password":"s3cr3t"}'
aws secretsmanager get-secret-value --secret-id myapp/db
~~~

### Secret rotation as a first-class practice

A long-lived static secret is a growing liability: the longer it exists unchanged, the larger the window during which a copy of it (in a log, a backup, an old laptop, a departed employee's notes) remains valid. Rotation shrinks that window deliberately, on a schedule, rather than only in response to an incident.

~~~python
# Example: an app reads its DB password by reference, not by value,
# so rotation doesn't require a redeploy — it just re-fetches.
import boto3

def get_db_password() -> str:
    client = boto3.client("secretsmanager")
    # SDK call adds network latency — cache with a short TTL in production,
    # and handle the "secret rotated mid-request" case with a retry-once policy.
    resp = client.get_secret_value(SecretId="myapp/db")
    return resp["SecretString"]
~~~

Rotation without dynamic secrets still requires coordinating the change at the source and every consumer; the next section covers the pattern that removes that coordination problem entirely.
`,

  "advanced-concepts": `
### Dynamic secrets — the state of the art

A **dynamic secret** is generated on demand, scoped to a single consumer, and expires automatically — rather than being a long-lived value that's merely rotated on a schedule. HashiCorp Vault's database secrets engine is the canonical example:

~~~bash
# Vault is configured with a database connection and a role that defines
# what privileges a generated user should have and how long it lives.
vault write database/roles/readonly \\
    db_name=postgres \\
    creation_statements="CREATE ROLE '{{name}}' WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO '{{name}}';" \\
    default_ttl=5m \\
    max_ttl=1h

# A workload requests a credential just before it needs one:
vault read database/creds/readonly
# Vault CREATES a brand-new Postgres user at that instant, hands back
# username/password with a 5-minute lease, and will DROP that user
# automatically when the lease expires unless it's renewed.
~~~

Why this is categorically better than a rotated static secret: there is no shared credential to leak in the first place — each caller gets its own uniquely-named database user, so a leaked credential in a log is only valid for minutes and only for that one caller, and Vault's audit log directly ties every database user that ever existed back to the specific request that created it. This is the practical meaning of "assume breach" security design: a leak still happens, but its value to an attacker collapses to near zero.

### Kubernetes Secret objects: the base64-is-not-encryption trap

This is one of the most common and consequential misconceptions in cloud-native security. A Kubernetes Secret object stores its data **base64-encoded**, not encrypted:

~~~yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  password: czNjcjN0  # this is base64("s3cr3t") — TRIVIALLY reversible
~~~

~~~bash
echo "czNjcjN0" | base64 -d
# s3cr3t
~~~

Base64 is an *encoding*, not encryption — it has no key, and anyone with read access to the Secret object (via kubectl, the API server, or an etcd backup) can decode it instantly. By default, Kubernetes also stores Secret objects **unencrypted in etcd** unless you explicitly enable encryption at rest (EncryptionConfiguration with a provider like aescbc or, better, an integration with a cloud KMS). The concrete defenses:

1. **Enable etcd encryption at rest** for the Secret resource type, backed by a KMS-managed key where possible.
2. **Restrict RBAC** so only the ServiceAccounts and humans that truly need a Secret can "get" or "list" it — Secret read access is one of the highest-value permissions in a cluster.
3. **Never treat "it's a Kubernetes Secret" as sufficient** — for real secrets management, use one of two established bridge patterns:
   - **External Secrets Operator**: a controller that watches a CRD, fetches the actual secret value from Vault/AWS/GCP/Azure, and materializes it as a native Kubernetes Secret (or directly into a Pod) — keeping the source of truth outside the cluster.
   - **Vault Agent Injector**: a mutating webhook that adds a sidecar container to your Pod; the sidecar authenticates to Vault (typically via the Pod's Kubernetes ServiceAccount token, using Vault's Kubernetes auth method) and writes fetched secrets to a shared in-memory volume the app container reads from at startup — the secret often never becomes a Kubernetes Secret object at all.

See the **Kubernetes** and **Docker** skills for the container-and-orchestration layer these patterns build on.

### CI/CD secret handling

CI systems are a major and underrated leak surface because build logs are, by default, designed to be helpful and verbose.

~~~yaml
# GitHub Actions — encrypted repository secret, injected as an env var
# only for the step that needs it, never printed
jobs:
  deploy:
    steps:
      - name: Deploy
        env:
          API_KEY: \${{ secrets.PROD_API_KEY }}
        run: ./deploy.sh
~~~

GitHub Actions automatically masks any string that exactly matches a registered secret's value if it appears in log output — but masking is a best-effort string match, not a guarantee: a secret that's been base64-encoded, split across lines, or transformed before printing will not be masked, so scripts should never intentionally echo secret-derived values. The more modern pattern removes long-lived cloud secrets from CI entirely: **OIDC federation** lets a GitHub Actions run present a short-lived, cryptographically verifiable identity token to AWS/GCP/Azure, which the cloud provider exchanges for temporary, narrowly-scoped credentials — no static cloud access key ever needs to be stored as a CI secret at all.

### Decision table: which secrets pattern for which situation

| Situation | Recommended pattern | Why |
|-----------|---------------------|-----|
| Solo dev, local machine | .env + .gitignore | Simplicity wins; blast radius is one laptop |
| Small team, single cloud, few services | Cloud-native manager (AWS/GCP/Azure Secret Manager) | Managed, IAM-integrated, low ops overhead |
| Multi-cloud or on-prem, many services | HashiCorp Vault | Cloud-agnostic, richest dynamic-secrets and policy model |
| Kubernetes workloads | Vault + External Secrets Operator or Agent Injector | Bridges cluster to a real secrets backend |
| Database credentials at scale | Dynamic secrets (Vault database engine) | Eliminates standing, shared, long-lived DB passwords |
| CI/CD cloud deploys | OIDC federation to short-lived cloud credentials | No static cloud key sits in CI secret storage at all |
`,

  "internal-working": `
Under the hood, a secrets manager is solving one core problem: how do you store a secret encrypted, while still being able to decrypt it for an authorized caller, without ever exposing the encryption key itself to that caller or to disk in plaintext? The answer nearly every manager converges on is **envelope encryption** (see the **Encryption** skill for the general technique) layered under an authentication and policy check.

~~~mermaid
flowchart TB
    A["Client authenticates\n(AppRole, K8s ServiceAccount token, IAM role, OIDC)"] --> B["Auth method verifies identity"]
    B --> C["Policy engine checks: is THIS identity allowed\nto read THIS secret path?"]
    C -->|denied| D["403 — logged in audit trail"]
    C -->|allowed| E["Storage backend fetches encrypted secret blob"]
    E --> F["Unseal / root key (often HSM- or KMS-backed)\ndecrypts the data encryption key"]
    F --> G["Data encryption key decrypts the secret blob"]
    G --> H["Secret returned to client over TLS"]
    H --> I["Audit log entry written:\nidentity, path, timestamp, request ID"]
~~~

Step by step:

1. **Authentication**: the caller proves who it is — a Kubernetes Pod presents its ServiceAccount token, a CI job presents an OIDC token, a human presents an SSO-backed login. The secrets manager never trusts a bare username/password for this step in mature deployments; it trusts a platform-issued, verifiable identity.
2. **Authorization**: a policy engine checks whether that specific identity is permitted to read that specific secret path. This is where least-privilege scoping is enforced mechanically rather than by convention.
3. **Storage and envelope encryption**: secrets are never encrypted directly with a single master key. Instead, each secret (or a group of secrets) is encrypted with its own **data encryption key (DEK)**, and the DEK itself is encrypted with a **key encryption key (KEK)** that rarely changes and is often held in a hardware security module or a cloud KMS. This two-layer scheme means rotating or re-encrypting large volumes of data doesn't require re-touching the KEK, and the KEK itself never leaves the HSM/KMS boundary.
4. **Unsealing**: Vault specifically requires an "unseal" step after startup — reconstructing the master key (traditionally via Shamir's Secret Sharing across several key-holders, or auto-unseal via a cloud KMS) before it can decrypt anything. This prevents a stolen disk image of the storage backend from being decryptable without also compromising the unseal mechanism.
5. **Delivery**: the decrypted secret is sent to the caller over TLS and, ideally, never written to disk on the receiving end — held in memory only.
6. **Audit**: every step above is logged to an append-only audit log, which is itself often written through a hash chain so tampering is detectable.

The critical design insight: the secrets manager's own storage being compromised (e.g. someone steals the raw database file) should still not be sufficient to read any secret — that's why the KEK/HSM boundary exists. This is the same principle as a bank vault having both an outer door and an inner safe: compromising one layer shouldn't compromise the other.
`,

  architecture: `
Two architectural questions matter: how the secrets manager itself is deployed, and how applications should be structured to consume secrets without accidentally undermining everything above.

### Secrets manager architecture (Vault-style, generalizes to cloud equivalents)

~~~mermaid
flowchart TB
    subgraph Clients
        C1["App Pod\n(K8s ServiceAccount auth)"]
        C2["CI Job\n(OIDC auth)"]
        C3["Human operator\n(SSO auth)"]
    end
    subgraph "Secrets Manager Cluster (HA)"
        LB["Load balancer"] --> N1["Node 1 (active)"]
        LB --> N2["Node 2 (standby)"]
        LB --> N3["Node 3 (standby)"]
        N1 --> Storage[("Encrypted storage backend\n(e.g. Raft / cloud storage)")]
        N1 --> KMS["Cloud KMS / HSM\n(auto-unseal, root key protection)"]
    end
    Clients --> LB
    N1 --> Audit["Immutable audit log\n(SIEM-forwarded)"]
~~~

Key architectural facts: the manager itself runs as a highly-available cluster because if it's down, every dependent service that needs a fresh credential is blocked — this makes the secrets manager one of the most critical pieces of infrastructure in the whole stack, deserving the same reliability investment as the database. The encrypted storage backend can be safely backed up and even leaked without exposing secrets, because decryption requires the separate KMS/HSM-protected root key.

### Application architecture around secrets

The pattern mature teams converge on, regardless of which manager they use:

~~~text
myservice/
├── src/myservice/
│   ├── core/
│   │   ├── config.py        # reads NON-secret config (validated at startup)
│   │   └── secrets.py       # fetches secrets by REFERENCE (path/name), not value, at startup
│   ├── clients/              # wraps external API calls; receives injected credentials, never reads env directly
│   └── ...
└── deploy/
    ├── vault-agent-config.hcl   # OR external-secret.yaml (K8s), OR IAM role attached to compute
    └── ...
~~~

Rules: only one module in the codebase (core/secrets.py) is allowed to talk to the secrets manager directly; everything else receives already-resolved credentials through dependency injection, which makes testing trivial (inject a fake) and makes it possible to audit "where do secrets enter this codebase" in one place. Secrets are fetched at startup (or refreshed on a short interval / lease renewal), never fetched ad hoc scattered across the codebase, and never logged — including in exception messages, which is a common accidental leak point when a database connection string is included in a caught exception's string representation.
`,

  "data-flow": `
Trace what happens when a freshly deployed Pod needs a database credential, using the Vault Agent Injector pattern end to end:

~~~mermaid
sequenceDiagram
    participant K8s as Kubernetes API
    participant Pod as App Pod (with Vault Agent sidecar)
    participant Vault as Vault server
    participant DB as Database

    K8s->>Pod: schedule Pod, mount ServiceAccount token
    Pod->>Vault: sidecar authenticates using K8s ServiceAccount token (Vault Kubernetes auth method)
    Vault->>Vault: verify token with Kubernetes API, check policy
    Vault-->>Pod: Vault client token issued (scoped, time-limited)
    Pod->>Vault: request database/creds/readonly
    Vault->>DB: CREATE ROLE with generated username/password, TTL 5m
    DB-->>Vault: confirm user created
    Vault-->>Pod: return generated username/password
    Pod->>Pod: sidecar writes credential to shared in-memory volume
    Pod->>DB: app container connects using injected credential
    Note over Pod,Vault: sidecar renews lease before expiry, or fetches a fresh credential
    Vault->>DB: on expiry (no renewal), DROP the generated user automatically
~~~

The part most engineers get wrong on first exposure: the application code never talks to Vault directly in this pattern — it just reads a file from a local volume that the sidecar keeps fresh, exactly the way it would read a mounted Kubernetes Secret. This is deliberate: it keeps the Vault client logic (and the blast radius of a Vault authentication bug) entirely out of the application, in a well-tested, shared sidecar image.

For a static secret fetched from AWS Secrets Manager instead, the flow simplifies: the workload's IAM role (attached to the EC2 instance, ECS task, or Lambda) is checked by AWS's own IAM policy engine on every GetSecretValue call — no separate authentication handshake is needed because the cloud provider's own identity fabric (instance metadata service, task role) already establishes who's asking.
`,

  "production-usage": `
### How real teams actually run this

Most production setups are a layered combination, not a single tool:

- **Cloud-native services (single cloud, moderate scale)**: AWS Secrets Manager or Parameter Store (SSM), GCP Secret Manager, or Azure Key Vault, referenced directly by IAM/service-account permissions attached to compute (EC2 instance profile, ECS task role, GKE Workload Identity, Azure Managed Identity). No separate secrets-manager cluster to operate — the cloud provider runs it.
- **Multi-cloud, on-prem, or secret-heavy organizations**: HashiCorp Vault (self-hosted or HCP Vault managed), often fronted by the Kubernetes-native bridges described above.
- **Config validated and secrets injected at boot**: applications fail fast at startup if a required secret is missing or malformed — never discover a missing credential mid-request in production.

~~~python
# pydantic-settings pattern: non-secret config from env, secret VALUES
# resolved separately and injected, but validated together at boot
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str          # may be a secrets-manager-resolved value at runtime
    jwt_signing_secret: str
    log_level: str = "info"

    class Config:
        env_prefix = "AEOS_"

settings = Settings()  # raises immediately if required fields are missing
~~~

### Project layout and operational defaults

- A committed **.env.example** (no real values) documents every required variable — this platform's api/.env.example is exactly this pattern, including inline comments on how to generate a strong value (openssl rand -hex 32) and where to obtain each OAuth credential.
- Secrets are namespaced by environment and service (e.g. prod/payments-service/db-password), never a single flat secret shared across environments — this is what makes it possible to grant a staging deploy access to staging secrets only.
- A secret's lifecycle has an owner (a team, not an individual) recorded in the manager's metadata, so rotation and incident response have a clear point of contact.
- Access to production secrets is itself gated behind the same SSO/MFA the organization uses for everything else — a secrets manager is only as strong as its own authentication.
`,

  "industry-examples": `
- **HashiCorp** (the company) runs its own products in production the way it recommends to customers — Vault with dynamic database secrets and short-lived cloud credentials is the reference deployment their field engineering repeatedly documents in public talks and case studies.
- **Netflix** has published extensively on centralizing credential issuance and moving toward short-lived, workload-identity-based access instead of static keys across its microservice fleet — a direct real-world instance of the "dynamic secrets over static secrets" principle.
- **GitHub** operates its own large-scale secret-scanning service (GitHub secret scanning and push protection) across every public repository and partners with major API providers (AWS, Stripe, and others) so that a leaked, recognizable key format can be automatically revoked or flagged by the provider within minutes of being pushed.
- **Google/GCP** builds Secret Manager directly into its IAM model, and its internal security engineering culture (documented in the public BeyondProd and BeyondCorp papers) centers on short-lived credentials and workload identity rather than long-lived static secrets — the same philosophy Vault's dynamic secrets embody, applied organization-wide.
- **Financial services and healthcare organizations** (regulated by PCI-DSS, HIPAA, SOC 2) are typically required by auditors to demonstrate secret rotation schedules, access logging, and least-privilege scoping — secrets management here isn't optional engineering hygiene, it's a compliance control with an auditor checking for it annually.

Pattern to notice across all of these: the mature end state is never "one big secrets file," it's identity-based access to short-lived credentials, with the secrets manager as the trust broker in the middle.
`,

  "best-practices": `
1. **Never commit secrets to git, ever** — enforce this with a pre-commit hook (git-secrets or detect-secrets) in addition to developer discipline, because discipline alone always eventually fails.
2. **Classify before you store**: explicitly decide, per config value, whether it's a secret or plain config — don't default to "secret" for everything (that hides the truly sensitive values in noise) or "config" for everything (that's the actual incident).
3. **Use a real secrets manager once you have more than a handful of services or more than one environment** — the .env pattern's convenience stops paying for itself well before "production scale," usually around the point a second developer or a second environment appears.
4. **Scope every credential to least privilege** — a service account should be able to do exactly what its workload needs and nothing else; audit this on a schedule, not just at creation time.
5. **Prefer dynamic, short-lived credentials over static ones wherever the backend supports it** — database access is the most common and highest-value place to start.
6. **Rotate what can't be made dynamic, on a schedule, automated** — if a secret must be static (some third-party APIs only issue long-lived keys), put its rotation on a calendar with an owner, not "whenever someone remembers."
7. **Never log a secret** — including in exception messages, request/response logging middleware, and third-party APM tools; scrub known secret field names centrally rather than trusting every call site to remember.
8. **Encrypt secrets at rest everywhere they're stored** — including Kubernetes' etcd, CI systems' internal secret stores, and backups of anything that might contain them.
9. **Separate secrets by environment and by service** — a staging credential compromise should never grant any access to production.
10. **Audit log every secret access and alert on anomalies** — a service account reading a secret it's never read before, or at 3am when it never runs then, is a strong compromise signal.
11. **Treat CI/CD as a first-class part of your secrets attack surface** — mask logs, prefer OIDC federation over static cloud keys in CI, and restrict which branches/environments can access production secrets.
12. **Have a tested incident-response runbook for a leaked secret before you need one** — rotate, audit, assume compromise, communicate — rehearsed once in a fire drill, not invented for the first time during a real incident.
`,

  "anti-patterns": `
### Hardcoding a secret in source

~~~python
# WRONG — ships inside the built artifact, visible to anyone with the code
STRIPE_KEY = "sk_live_51H8x..."

def charge(amount):
    stripe.api_key = STRIPE_KEY
    ...
~~~

~~~python
# RIGHT — read from environment or resolved secrets-manager reference,
# fail fast if missing
import os

STRIPE_KEY = os.environ["STRIPE_SECRET_KEY"]  # raises KeyError at boot if unset

def charge(amount):
    stripe.api_key = STRIPE_KEY
    ...
~~~

### "Just delete it later"

~~~bash
# WRONG mental model: deleting the file "removes" the secret
git rm .env && git commit -m "oops" && git push
# The secret is still in every prior commit, every clone, every fork.
~~~

The right response is rotating the credential at its source immediately, then treating history-scrubbing as separate cleanup, not the fix.

### Sharing one secret across every environment

~~~text
WRONG: one DATABASE_PASSWORD used by dev, staging, AND production
RIGHT: dev/db-password, staging/db-password, prod/db-password —
       distinct values, distinct access policies, distinct blast radius
~~~

### Logging the whole request, secrets included

~~~python
# WRONG — Authorization header (often a bearer token) ends up in logs
logger.info(f"Incoming request headers: {request.headers}")

# RIGHT — scrub known-sensitive header/field names before logging
SENSITIVE_KEYS = {"authorization", "api-key", "cookie"}
safe_headers = {k: ("***" if k.lower() in SENSITIVE_KEYS else v)
                 for k, v in request.headers.items()}
logger.info("Incoming request headers: %s", safe_headers)
~~~

### Treating a Kubernetes Secret as "already encrypted"

~~~yaml
# WRONG assumption: "it's a Secret object, so it's safe"
apiVersion: v1
kind: Secret
data:
  password: czNjcjN0   # base64, NOT encrypted — decodable instantly
~~~

Enable etcd encryption at rest and restrict RBAC read access to Secret objects; better still, don't store the real value as a native Secret at all — bridge from a real secrets manager as covered in Advanced Concepts.

### Broad, standing permissions "to be safe"

~~~text
WRONG: service account granted admin on the whole database "so nothing breaks"
RIGHT: service account granted SELECT on exactly the three tables it reads
~~~

Broad permissions don't prevent bugs; they only make a future compromise or bug more expensive.
`,

  performance: `
Secrets management is not usually a raw-throughput problem, but latency and availability of the secrets manager directly affect application performance and reliability, so measure and design for it deliberately.

### What to measure first

~~~bash
# Vault exposes its own metrics; watch these under load
vault read sys/metrics -format=json | jq '.Gauges[] | select(.Name | contains("core"))'
# Key signals: secret read latency (p50/p95/p99), lease renewal failure rate,
# unseal/HA-failover events
~~~

### The optimization hierarchy (apply in order)

1. **Fetch secrets once at startup, not per request** — a service handling thousands of requests per second must never call the secrets manager inline on the request path; that turns the secrets manager into a single point of failure for every request.
2. **Cache with a bounded TTL matched to the secret's lease** — for dynamic secrets, cache exactly until shortly before expiry, then proactively renew or refetch in the background rather than on the critical path.
3. **Use a local agent/sidecar (Vault Agent, cloud-provider caching agents) to absorb the network round trip** — the application reads a local file or a localhost endpoint instead of crossing the network to the secrets manager on every refresh.
4. **Batch and pre-warm** — for services that fan out to many downstream credentials at deploy time (many database roles, many API keys), request them in parallel at startup rather than serially, since dynamic-secret generation involves a real database round trip per credential.
5. **Size the secrets manager cluster for peak concurrent lease-renewal load, not just steady state** — a mass restart of a large fleet (a rolling deploy or an autoscaling burst) creates a thundering-herd of simultaneous credential requests; test this scenario specifically.

Rough numbers to reason with (verify against your own environment and version): a Vault dynamic-secret generation against a database is typically tens to low hundreds of milliseconds (it's doing a real CREATE ROLE), while reading an already-cached static secret from a local agent is sub-millisecond. Design the "how often do we actually need a fresh secret" question around that gap.
`,

  scalability: `
Scaling secrets management has two distinct dimensions: scaling the secrets manager itself, and scaling the number of consumers safely.

### Scaling the secrets manager

~~~mermaid
flowchart LR
    LB["Load balancer"] --> A["Active node\n(handles writes + reads)"]
    LB --> S1["Standby node"]
    LB --> S2["Standby node"]
    A --> Store[("Replicated storage\n(e.g. Raft consensus)")]
    S1 --> Store
    S2 --> Store
~~~

Run the secrets manager itself as a highly-available cluster (Vault's integrated Raft storage, or rely on the cloud provider's own HA for managed services) — because if it becomes unavailable, every service that needs a fresh credential or lease renewal is blocked, which can cascade into a much larger outage than the secrets manager's own footprint would suggest.

### Scaling consumers

- **Cache aggressively at the edge (sidecar/agent) so the manager sees renewal traffic, not a read per request** — this is the single biggest lever; without it, a fleet of thousands of Pods each polling the manager per request will overwhelm it.
- **Namespace and shard secrets by team/service** so policy evaluation and audit-log volume scale roughly linearly with organizational growth instead of becoming one giant flat namespace that's slow to query and hard to reason about.
- **Prefer workload-identity federation over centrally-issued static keys as the fleet grows** — OIDC-based short-lived credentials (cloud IAM roles, Kubernetes ServiceAccount-based Vault auth) scale better organizationally than a human-managed list of static API keys, because access reviews become "which roles exist" instead of "who currently holds a copy of this string."

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Secrets manager becomes a single point of failure | Run HA cluster; design consumers to tolerate a brief manager outage via cached/pre-fetched credentials |
| Thundering herd on mass restart/deploy | Stagger rollouts; pre-warm caches; size cluster for burst, not just steady state |
| Audit log volume becomes unmanageable | Forward to a SIEM with retention/query tooling built for log-scale data, not the manager's own UI |
| Manual access reviews don't scale past a few dozen services | Move to workload-identity federation and periodic automated policy audits instead of manual secret-by-secret review |
`,

  security: `
### The attack surface specific to secrets management

1. **Secrets in git history** — the most common real-world leak; automated scanners (both defensive, like GitHub secret scanning, and offensive) find these constantly. See Beginner Concepts for why deletion doesn't fix it.
2. **Secrets in logs, error messages, and monitoring/APM tools** — a stack trace that includes a full connection string, or a request-logging middleware that captures headers verbatim, is a leak vector that's easy to overlook because it feels like "just debugging output."
3. **Secrets baked into container images** — a Dockerfile that COPYs a .env file or runs a build step with a secret as a build ARG can leave that value recoverable from an image layer even if a later layer "removes" the file, because image layers are historical, much like git commits. Use build-time secret mounts (Docker BuildKit's -–secret flag) that never persist in a layer, instead.
4. **Over-broad access policies** — granting a service account far more than it needs turns a routine application bug (e.g. an injection vulnerability — see the **SQL Injection** and **XSS** skills) into a much larger breach, because the compromised credential can now reach far more than the original bug should have exposed.
5. **Base64 mistaken for encryption in Kubernetes** — covered in depth in Advanced Concepts; the single most common misconception in this space.
6. **Weak secret generation** — a "secret" chosen by a human (a memorable password) has far less entropy than one generated by a cryptographic random source; always generate secrets with a tool built for it (openssl rand, the language's secrets module, or the secrets manager's own generator), never by typing something into a text field.
7. **Long-lived secrets with no rotation** — every day a static secret exists unchanged is another day it can be silently exfiltrated and used without detection; see Intermediate/Advanced Concepts for rotation and dynamic secrets as the mitigation.

### Detecting leaked secrets

~~~bash
# git-secrets — scans commits and blocks pushes matching known secret patterns
git secrets --install
git secrets --register-aws   # example provider-specific pattern set
git secrets --scan

# truffleHog — scans full git history (and other sources) for high-entropy
# strings and known secret formats, including already-merged commits
trufflehog git file://. --since-commit HEAD~50

# GitHub secret scanning — runs automatically on GitHub-hosted repos;
# push protection can block a push containing a recognizable secret format
# before it ever reaches history
~~~

### Incident response when a secret leaks

1. **Rotate immediately** — invalidate the leaked credential at its source (the database, the API provider, the OAuth app) and issue a new one, before doing anything else. Speed matters more than a perfect investigation at this stage.
2. **Assume compromise** — treat every action the leaked credential's permissions allowed as potentially having happened, even without confirmed evidence yet; this shapes the urgency and scope of the next step.
3. **Audit access logs** — review the secrets manager's (or the provider's) audit trail for the exposure window: was the credential used from an unexpected location, at an unexpected time, or for an unexpected operation?
4. **Scope the blast radius** — because of least-privilege scoping (you did apply that, right?), the audit tells you exactly what this credential could have touched — check those specific resources for signs of misuse.
5. **Scrub if warranted, but never rely on it as the fix** — remove the value from git history with git-filter-repo if compliance or hygiene requires it, understanding this does not undo any prior exposure.
6. **Post-incident: fix the root cause** — was there no pre-commit hook? No secret scanning enabled? No rotation schedule? Close that gap so the same class of leak can't recur.

See the dedicated **Encryption**, **TLS & HTTPS**, and **OWASP Top 10** skills for the broader security context these practices sit inside.
`,

  testing: `
Secrets management code is tested differently from most application code: you almost never want a test to touch a real secrets manager or real credentials.

~~~python
# tests/test_secrets_resolver.py
import pytest
from myservice.core.secrets import SecretsResolver

class FakeSecretsBackend:
    """In-memory fake — no network call, no real secret ever touches a test."""
    def __init__(self, values: dict[str, str]):
        self._values = values

    def get(self, path: str) -> str:
        if path not in self._values:
            raise KeyError(f"no such secret: {path}")
        return self._values[path]

def test_resolver_returns_configured_secret():
    backend = FakeSecretsBackend({"myapp/db": "test-password-not-real"})
    resolver = SecretsResolver(backend)
    assert resolver.get("myapp/db") == "test-password-not-real"

def test_resolver_raises_on_missing_secret():
    resolver = SecretsResolver(FakeSecretsBackend({}))
    with pytest.raises(KeyError):
        resolver.get("myapp/missing")

def test_resolver_never_logs_the_value(caplog):
    backend = FakeSecretsBackend({"myapp/db": "super-secret-value"})
    resolver = SecretsResolver(backend)
    resolver.get("myapp/db")
    # Regression test for the "accidentally logged a secret" class of bug
    assert "super-secret-value" not in caplog.text
~~~

### Senior testing doctrine for secrets

- **Never use real production (or even real staging) secrets in a test suite** — use a fake backend (as above) or a locally-run, disposable dev instance of the secrets manager (Vault has a well-supported "dev server" mode specifically for this) seeded with throwaway values.
- **Test the failure paths explicitly**: what happens when a required secret is missing at startup (should fail fast, loudly), when the secrets manager is unreachable (should the app refuse to start, or serve degraded with a cached value — decide deliberately, don't leave it to chance), and when a lease expires mid-request.
- **Add a regression test that asserts secret values never appear in log output** — as shown above; this catches an entire class of accidental-leak bug that's otherwise easy to introduce during a refactor.
- **In CI, scan for secret-like strings as part of the pipeline itself** (git-secrets or truffleHog as a CI step) so a leak is caught before merge, not after.
- **Rotation logic deserves its own test**: simulate an old-and-new-key overlap window (for a rotated JWT signing secret, for instance) and assert tokens signed with either key still validate during the overlap.
`,

  debugging: `
### The toolbox, in escalation order

1. **Confirm the secret is actually being resolved, not the problem** — a surprising number of "secrets manager" bugs are actually a missing environment variable or a typo in a secret path; check the resolved value's *presence* (never its literal contents) first.

~~~bash
# Check presence without ever printing the value
python -c "import os; print('SET' if os.environ.get('AEOS_JWT_SECRET') else 'MISSING')"
~~~

2. **Check the audit log of the secrets manager** — was the read attempted at all? Was it denied by policy (403) or did it never reach the manager (network/DNS issue)?

~~~bash
vault audit list           # confirm an audit device is even enabled
tail -f /var/log/vault_audit.log | jq 'select(.request.path | contains("myapp"))'
~~~

3. **Verify the authentication step independently of the secret read** — for Kubernetes/Vault setups, confirm the Pod's ServiceAccount token is valid and the Vault Kubernetes auth role is correctly bound before assuming the secret path itself is misconfigured.

~~~bash
vault write auth/kubernetes/login role=myapp-role jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token
~~~

4. **Check lease/TTL expiry for dynamic secrets** — a "credential suddenly stopped working" symptom, especially one that started happening on a schedule, is very often an expired lease that wasn't renewed; check the lease's remaining TTL and the renewal logic's own error handling.
5. **Rule out a masking/formatting mismatch** — a common false alarm is a secret being correctly fetched but incorrectly parsed (e.g. expecting a raw password but receiving a JSON blob containing it under a key) — log the *type and shape* of what was received (never the value) to debug this.
6. **When genuinely stuck, reproduce with a disposable secret** — set up a throwaway path in a dev instance with a known, non-sensitive test value and walk the exact same path end to end; this isolates "is my code wrong" from "is my environment wrong" without ever needing to look at a real secret.
`,

  monitoring: `
### What to measure

- **Access patterns per secret**: which identities read which secrets, how often, and from where — the baseline you need before you can detect an anomaly.
- **Authentication failure rate**: a spike in failed authentications to the secrets manager is an early signal of either a misconfiguration (bad rollout) or an active attack.
- **Lease renewal failures**: for dynamic secrets, a rising renewal failure rate predicts imminent application errors as credentials silently expire.
- **Secret age**: how long has each static secret gone without rotation — this is a proactive metric, not a reactive one; alert well before a compliance-mandated rotation deadline, not on it.
- **Audit log completeness**: alert if the audit log pipeline itself stops flowing — an attacker who can disable logging before acting is far more dangerous than one who leaves a trail.

~~~python
# Application-side: instrument secret-fetch calls without ever logging the value
import time
from prometheus_client import Counter, Histogram

SECRET_FETCHES = Counter(
    "secret_fetch_total", "Secret fetch attempts", ["path", "outcome"]
)
SECRET_FETCH_LATENCY = Histogram(
    "secret_fetch_seconds", "Secret fetch latency", ["path"]
)

def fetch_secret(backend, path: str) -> str:
    start = time.perf_counter()
    try:
        value = backend.get(path)
        SECRET_FETCHES.labels(path=path, outcome="success").inc()
        return value
    except Exception:
        SECRET_FETCHES.labels(path=path, outcome="error").inc()
        raise
    finally:
        SECRET_FETCH_LATENCY.labels(path=path).observe(time.perf_counter() - start)
~~~

### Alerting priorities

Alert on symptoms that indicate real risk, not noise: an identity reading a secret it has never read before, a secret being read from an unexpected network location or geography, a burst of failed authentication attempts, or a secret whose age has crossed the organization's rotation policy threshold. Route these into the same on-call/incident pipeline as any other production alert — a secrets-manager anomaly is a security incident candidate, not a background metric to glance at weekly. See the Observability-related skills on this platform for the broader logging/metrics/tracing stack these instrumentation points feed into.
`,

  deployment: `
### Injecting secrets into a production Docker/Kubernetes deployment

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
# Dependencies installed here — NO secrets involved in the build itself
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH"
USER appuser
# NOTE: no secret values are ever COPYd, ARGd, or ENV-hardcoded into this image.
# Secrets are injected at RUNTIME by the orchestrator (K8s Secret / Vault Agent
# sidecar / cloud provider's own secret-injection mechanism), never baked in.
EXPOSE 8000
CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: no secret ever appears in a Dockerfile instruction or build argument, because both end up recorded in the image's layer history and are recoverable even from a later "cleanup" layer; the non-root user limits what a container-escape could reach; runtime injection means the same image is safely reusable across dev/staging/production, with only the injected values differing.

~~~yaml
# Kubernetes: referencing a secret materialized by External Secrets Operator
# (sourced from Vault/AWS/GCP/Azure — never manually kubectl-applied with real values)
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: app
      image: myregistry/myservice:1.4.0
      envFrom:
        - secretRef:
            name: myservice-db-credentials   # synced FROM the real secrets manager
~~~

### CI/CD pipeline secret handling

lint → typecheck → test (using fakes, never real secrets — see Testing) → build image (no secrets embedded) → scan image for embedded secrets as a safety net (trufflehog against the built image) → deploy using OIDC-federated, short-lived cloud credentials rather than a static cloud key stored as a CI secret. Gate production-secret access to protected branches/environments only, with required approvals, in the CI system's own environment-protection settings.
`,

  "production-checklist": `
Before a service handling real secrets takes production traffic:

- [ ] No secret values exist anywhere in git history (verified with truffleHog/git-secrets, not assumed)
- [ ] .env.example (no real values) documents every required variable, with generation instructions for anything security-sensitive (e.g. openssl rand -hex 32)
- [ ] Production secrets live in a dedicated secrets manager, not raw environment variables set by hand
- [ ] Every credential is scoped to least privilege — verified by reading the actual policy, not assumed from intent
- [ ] Database credentials use dynamic, short-lived leases where the backend supports it
- [ ] Static secrets that can't be made dynamic have an owner and a rotation schedule on a calendar
- [ ] Kubernetes etcd encryption at rest is enabled if Secret objects are used at all
- [ ] RBAC restricts who/what can read Secret objects or call the secrets manager's read APIs
- [ ] No secret value is ever written to application logs, error messages, or APM/monitoring tool payloads
- [ ] CI/CD secrets are masked in logs, and cloud deploys use OIDC federation instead of static cloud keys where possible
- [ ] Docker images contain zero embedded secrets (verified by scanning the built image, not just the Dockerfile)
- [ ] Audit logging is enabled on the secrets manager and forwarded to a SIEM/central log store
- [ ] Alerting exists for authentication failures, unusual access patterns, and secrets approaching their rotation deadline
- [ ] A tested incident-response runbook exists for "a secret leaked" (rotate, audit, assume compromise)
- [ ] Access to production secrets requires the organization's standard SSO/MFA — no bypass for convenience
- [ ] The secrets manager itself runs highly available, sized for a mass-restart/rollout thundering herd
`,

  "common-mistakes": `
1. **Treating .env as production-ready because it "works"** — it works for one developer on one laptop; it does not provide audit, fine-grained access, or rotation, which is exactly what production needs. See Intermediate Concepts.
2. **Assuming deleting a committed secret from git removes it** — history retains every version; the fix is rotating the credential, not just cleaning history. See Beginner Concepts.
3. **Confusing base64 encoding with encryption in Kubernetes Secrets** — base64 is instantly reversible with no key; it provides zero confidentiality on its own. See Advanced Concepts.
4. **Granting broad/admin-level access "to be safe"** — this doesn't prevent bugs, it makes every future bug or leak more expensive by widening the blast radius.
5. **Logging full requests/responses without scrubbing known-sensitive fields** — Authorization headers, API keys in query strings, and full connection strings routinely leak this way.
6. **Baking secrets into Docker images via COPY or build ARGs** — image layers are historical like git commits; a later layer "removing" the file doesn't remove it from the built image's history.
7. **Sharing one secret across dev/staging/production** — a lower-trust environment's compromise becomes a production compromise.
8. **No rotation schedule for secrets that can't be made dynamic** — "we'll rotate it eventually" without an owner and a calendar date means it never happens until an incident forces it.
9. **Storing the secrets-manager's own root/unseal material carelessly** — the highest-value target in the whole system deserves the most careful handling (HSM, Shamir's Secret Sharing, or cloud auto-unseal), not a value in someone's password manager alone.
10. **Treating secret scanning as a one-time audit instead of a continuous CI gate** — new leaks happen continuously as code changes; scanning must run on every push, not once a quarter.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| KeyError / MissingEnvironmentVariable at startup | Required secret not injected in this environment | Confirm the secrets manager reference or env var is actually set for this deployment target |
| 403 Permission Denied from Vault/cloud secrets manager | Policy doesn't grant this identity read access to this path | Review and correct the least-privilege policy binding |
| Vault "permission denied" immediately after a valid-looking login | Correct authentication but no matching policy attached to the resulting token | Check policy attachment on the auth method's role, not just the auth method itself |
| Database connection fails intermittently for a dynamic-secret consumer | Lease expired and wasn't renewed before use | Fix renewal logic; renew proactively before TTL, not reactively on failure |
| Kubernetes Pod can decode a Secret it shouldn't have access to | Overly broad RBAC on Secret resources | Restrict get/list on secrets to only the ServiceAccounts that need them |
| Secret value appears in application logs | Missing scrubbing in logging middleware, or secret included in an exception's string form | Centralize scrubbing of known-sensitive field/header names; avoid interpolating raw config objects into log/exception strings |
| CI job's secret leaks into build log | Secret transformed/echoed in a way the CI masking doesn't recognize | Never intentionally print secret-derived values; avoid encoding/splitting secrets in scripts |
| Docker image contains a recoverable old secret | Secret was COPYd/ARGd in an earlier build layer, later "removed" | Use build-time secret mounts (BuildKit --secret) that never persist to a layer |
| "Vault is sealed" on startup | Node restarted and needs unsealing (no auto-unseal configured) | Configure cloud KMS auto-unseal, or complete the manual unseal procedure |
| Secret rotated but old value still accepted somewhere | A consumer cached the old value past the rotation and never refreshed | Ensure all consumers use short-TTL caching or lease-based renewal, not indefinite caching |

The habit that matters: confirm presence and access, not literal contents, when debugging — you should almost never need to print or paste an actual secret value to diagnose a secrets-management issue.
`,

  faqs: `
**Q: Is a .env file ever acceptable in production?**
For a very small, single-instance deployment with no compliance requirements, an encrypted-at-rest environment injected by the hosting platform (not a plaintext file on disk) can be a reasonable stopgap. As soon as you have multiple services, multiple environments, or any compliance obligation, move to a dedicated secrets manager — the coordination and audit gap becomes the real cost, not raw convenience.

**Q: What's the actual difference between rotation and dynamic secrets?**
Rotation replaces a long-lived static secret with a new long-lived static secret on a schedule — the credential is still standing and shared between rotations. Dynamic secrets are generated per-consumer with a short lease and expire automatically — there's no "standing" credential to protect between issuances at all. Dynamic secrets are strictly stronger where the backend supports them.

**Q: Is base64-encoding a Kubernetes Secret good enough if my cluster is private?**
No — base64 provides zero confidentiality regardless of network exposure; anyone with read access to the Secret object (via the API, kubectl, or an etcd backup) can decode it instantly. Cluster privacy is a separate, complementary control, not a substitute for encryption at rest and RBAC.

**Q: Do I need Vault, or is a cloud-native secrets manager enough?**
If you're single-cloud with moderate scale, the cloud-native option (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) is usually simpler to operate because the provider runs it for you and it's already IAM-integrated. Reach for Vault when you're multi-cloud, on-prem, need its richer dynamic-secrets engines across many backend types, or need a single control plane spanning multiple clouds.

**Q: What should I actually do the moment I discover a leaked secret?**
Rotate it immediately at the source — this comes before investigation, before cleanup, before anything else. Then audit access logs for the exposure window, assume any action the credential's permissions allowed may have happened, and only then consider scrubbing git history if warranted.

**Q: Are OAuth client secrets and JWT signing secrets handled the same way as a database password?**
Conceptually yes — same storage, access-control, and rotation principles apply. The practical differences: an OAuth client secret's rotation must be coordinated with the OAuth provider's app registration, and a JWT signing secret's rotation requires briefly accepting tokens signed by both the old and new key so in-flight sessions don't all invalidate simultaneously.

**Q: How does this connect to encryption and hashing?**
A secrets manager's own protection of stored secrets is an applied instance of envelope encryption (see the **Encryption** skill). Password *verification* (as opposed to secrets *storage*) uses hashing (bcrypt/argon2, see the **Hashing** skill) instead — a subtly different problem, since you want to verify a password without ever storing or retrieving the original value at all.

**Q: What's the single highest-leverage first step for a small project?**
Add a pre-commit secret scanner (git-secrets or detect-secrets), commit a real .env.example with no live values, and generate every secret with a proper random source (openssl rand, or the platform's own guidance like this project's "generate with openssl rand -hex 32" comment) instead of a human-chosen value. That alone prevents the majority of real-world incidents.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What counts as a secret versus regular configuration?* A secret's disclosure alone is enough to impersonate the system or access protected data (API keys, DB credentials, signing keys); regular config (timeouts, log levels) causes bugs, not breaches, if disclosed.
2. *Why is committing a secret to git dangerous even if you delete it in the next commit?* Git history retains every prior version; clones and forks copy it forward; CI systems may echo history into logs. The fix is rotating the credential, not just removing the file.
3. *What's wrong with storing a secret directly in a Docker image via COPY?* Image layers are historical — a later layer "removing" the file doesn't remove it from the built image; anyone with the image can extract the value from an earlier layer.
4. *What does a .env file provide, and what does it not provide?* Convenient local-dev config outside source control; it provides no access control, no audit trail, and no rotation mechanism — fine for one laptop, not for production at scale.
5. *Name three things a dedicated secrets manager adds over plain environment variables.* Audit logs, fine-grained access policies, and either automatic rotation or dynamic/short-lived credential issuance (any three of these, well-explained).

**Senior:**

6. *Explain why base64 in a Kubernetes Secret is not encryption, and how you'd actually secure it.* Base64 is a reversible encoding with no key — anyone with read access to the object decodes it instantly. Real protection requires etcd encryption at rest (ideally KMS-backed), restrictive RBAC on Secret reads, and ideally sourcing secrets from a real manager via External Secrets Operator or Vault Agent Injector rather than storing raw values as native Secrets at all.
7. *What is a dynamic secret and why is it stronger than a rotated static one?* Generated per-consumer on demand with a short lease and automatic expiry/revocation — there's no standing shared credential to leak between rotations, and each generated credential ties uniquely back to the request that created it in the audit log, collapsing the value of any single leak.
8. *Walk through envelope encryption as used by a secrets manager.* A data encryption key (DEK) encrypts the actual secret; a key encryption key (KEK), held in an HSM or cloud KMS and rarely touched, encrypts the DEK. This lets bulk secret data be re-encrypted/rotated without re-touching the KEK, and keeps the highest-value key out of the general storage/compute path entirely.
9. *Design the secret-injection path for a Kubernetes workload that needs a database credential Vault manages.* Vault Agent Injector sidecar authenticates via the Pod's ServiceAccount token using Vault's Kubernetes auth method, requests a dynamic database credential from Vault, writes it to a shared in-memory volume the app container reads at startup, and renews the lease proactively before expiry — the app never talks to Vault directly.
10. *A secret just leaked in a public GitHub repo. Walk through your first 30 minutes.* Rotate the credential at its source immediately (don't wait for full investigation), assume it may have been used, pull audit/access logs for the exposure window, check exactly what the credential's scoped permissions could have reached, and only then consider scrubbing git history — which doesn't undo prior exposure but limits ongoing casual discovery.
11. *How would you design CI/CD to avoid ever storing a long-lived cloud credential as a CI secret?* Use OIDC federation — the CI job presents a short-lived, cryptographically verifiable identity token that the cloud provider exchanges for temporary, narrowly scoped credentials at run time; no static cloud access key needs to exist in CI secret storage at all.
12. *How do you scale a secrets manager for a fleet that autoscales aggressively?* Cache/pre-fetch at a local agent or sidecar so the manager sees renewal traffic instead of a read-per-request; run the manager itself HA and size it for burst thundering-herd load (mass restarts, autoscale events), not just steady state.
`,

  "coding-questions": `
### 1. A least-privilege secret resolver with TTL-based caching

~~~python
import time
from dataclasses import dataclass

@dataclass
class CachedSecret:
    value: str
    expires_at: float

class SecretsResolver:
    """
    Fetches secrets from a backend, caching each until its lease TTL,
    and refuses to serve a secret path this identity isn't scoped for.
    """
    def __init__(self, backend, allowed_paths: set[str]):
        self._backend = backend
        self._allowed = allowed_paths
        self._cache: dict[str, CachedSecret] = {}

    def get(self, path: str) -> str:
        if path not in self._allowed:
            # Enforce least privilege in code too, not just in the backend's
            # own policy — defense in depth.
            raise PermissionError(f"not authorized for secret path: {path}")

        cached = self._cache.get(path)
        now = time.monotonic()
        if cached and cached.expires_at > now:
            return cached.value

        value, ttl_seconds = self._backend.fetch_with_ttl(path)
        # Refresh slightly before actual expiry to avoid a race at the boundary
        self._cache[path] = CachedSecret(value=value, expires_at=now + ttl_seconds * 0.9)
        return value
~~~

Complexity: O(1) cache hit; a cache miss costs one backend round trip. Follow-ups they'll ask: how do you handle a backend outage on a cache miss (serve stale-if-error with an alert, or fail the request — a real design decision)? How would you add background proactive renewal instead of renewing on the request path?

### 2. Detect likely secrets in a text blob (the core of a lightweight scanner)

~~~python
import re
import math
from collections import Counter

# A tiny, illustrative subset of real scanners' pattern lists
KNOWN_PATTERNS = {
    "aws_access_key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "generic_api_key_assignment": re.compile(
        r"(?i)(api[_-]?key|secret|token)\\s*[:=]\\s*['\\\"]?[A-Za-z0-9/_+=-]{16,}"
    ),
}

def shannon_entropy(s: str) -> float:
    """High entropy is a signal of a random-looking secret vs a normal word."""
    if not s:
        return 0.0
    counts = Counter(s)
    length = len(s)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())

def find_suspected_secrets(text: str, entropy_threshold: float = 4.0) -> list[str]:
    findings = []
    for name, pattern in KNOWN_PATTERNS.items():
        for match in pattern.finditer(text):
            findings.append(f"{name}: {match.group()[:12]}...")  # never print full value

    # Heuristic pass: long, high-entropy tokens that don't match a known pattern
    for token in re.findall(r"[A-Za-z0-9/_+=-]{20,}", text):
        if shannon_entropy(token) >= entropy_threshold:
            findings.append(f"high_entropy_token: {token[:12]}...")

    return findings
~~~

Discussion points: real scanners (truffleHog, git-secrets) combine exactly these two techniques — known-format regexes plus entropy heuristics — and additionally verify candidate findings by attempting a live, harmless API call where possible to eliminate false positives. Note the deliberate choice to only ever print a truncated prefix, never the full candidate value, even in a security tool's own output.

### 3. Simulate a JWT signing-key rotation with an overlap window

~~~python
from dataclasses import dataclass

@dataclass
class SigningKeySet:
    """Supports verifying tokens signed by either the current or previous
    key during a rotation overlap window, while always SIGNING new tokens
    with only the current key."""
    current_key: str
    previous_key: str | None = None

    def sign(self, payload: str) -> str:
        return fake_jwt_sign(payload, self.current_key)

    def verify(self, token: str) -> bool:
        if fake_jwt_verify(token, self.current_key):
            return True
        if self.previous_key and fake_jwt_verify(token, self.previous_key):
            return True
        return False

    def rotate(self, new_key: str) -> "SigningKeySet":
        # Old "current" becomes "previous" for the overlap window;
        # drop it entirely once you're confident no valid token still
        # relies on it (based on your token's max lifetime).
        return SigningKeySet(current_key=new_key, previous_key=self.current_key)

def fake_jwt_sign(payload: str, key: str) -> str:
    return f"{payload}.{key}"  # illustrative only — use a real JWT library

def fake_jwt_verify(token: str, key: str) -> bool:
    return token.endswith(f".{key}")
~~~

Complexity: O(1) sign/verify. Follow-ups: how long should the overlap window be (at least as long as your longest-lived issued token)? How would you automate dropping the previous key once it's provably safe to do so?
`,

  "hands-on-labs": `
### Lab 1 — Stop a leak before it happens (beginner, ~1h)
Set up git-secrets or detect-secrets as a pre-commit hook on a sample repository. Intentionally try to commit a fake API key and a fake database connection string; confirm the hook blocks both. Then add a real .env.example (no live values) with generation instructions, mirroring this platform's api/.env.example pattern. Deliverable: a short writeup of what the hook caught and why each blocked pattern matters. Skills: secret classification, prevention tooling.

### Lab 2 — Migrate from .env to a real secrets manager (intermediate, ~2h)
Run a local HashiCorp Vault dev server. Move a sample app's database password and API key out of a .env file into Vault, and update the app to fetch them at startup through a single resolver module (see Coding Questions #1 as a starting point). Add a least-privilege policy that only allows this app's identity to read its own path. Deliverable: before/after diagrams and a one-paragraph explanation of what access control you gained. Skills: static secrets in a real manager, least-privilege policy authoring.

### Lab 3 — Dynamic database credentials end to end (advanced, ~3h)
Configure Vault's database secrets engine against a local Postgres instance. Create a role with a 5-minute TTL, request a credential, connect with it, and observe Vault automatically drop the generated user after expiry (or after you revoke the lease). Deliverable: a sequence diagram (like the one in Data Flow) annotated with your own timings. Skills: dynamic secrets, lease lifecycle, database-engine internals.

### Lab 4 — Kubernetes secret injection, done right (production, ~3h)
Deploy a sample app to a local Kubernetes cluster (kind or minikube). First, do it the naive way with a native Secret object and confirm you can trivially base64-decode it. Then reconfigure using either the External Secrets Operator or the Vault Agent Injector to source the same credential from your Lab 2/3 Vault instance instead, and confirm the app never receives a plain Kubernetes Secret containing the real value. Deliverable: a short incident-style writeup of "what an attacker with read access to Secrets could have done in the naive setup, and why the bridged setup prevents it." Skills: the full container/orchestration secret-injection story; ties directly to the Docker and Kubernetes skills.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate secrets-management maturity to an interviewer:

1. **Secrets-aware config service** — A small internal service that fronts multiple secrets backends (env vars for local dev, Vault or a cloud manager for staging/prod) behind one interface, with TTL-based caching, least-privilege enforcement in code (as in Coding Questions #1), structured audit logging of every access, and a regression test asserting no secret value ever appears in logs. Demonstrates: abstraction design, defense in depth, testing discipline.

2. **Lightweight secret scanner with CI integration** — A CLI tool combining known-pattern regexes and entropy heuristics (extending Coding Questions #2) that scans a git diff on every pull request and fails the build on a likely match, with a documented allowlist mechanism for known false positives. Demonstrates: understanding of real scanning techniques, CI/CD integration, balancing false positives against safety.

3. **End-to-end dynamic-secrets demo stack** — A docker-compose (or local Kubernetes) environment wiring together an app, Postgres, and Vault with the database secrets engine, including a rotation-overlap demo for a JWT signing key (extending Coding Questions #3) and a README with the architecture and sequence diagrams this page uses as templates. Demonstrates: the full state-of-the-art pattern, working and reproducible, not just described.

Each project: no real/live credentials anywhere in the repo (verified with a scanner as part of your own CI), a clear README explaining the threat model and design decisions, and tests that mock the secrets backend rather than depending on a live one.
`,

  "case-studies": `
### A large public breach traced to a committed cloud key (illustrative pattern, verify specifics before citing in an interview)
A recurring incident pattern across many organizations over the years: a developer commits a cloud access key to a public repository "temporarily," an automated scanner (often the attacker's own) finds it within minutes, and the key is used to spin up cryptocurrency-mining compute or exfiltrate data before the organization even notices. Lesson: automated, pre-commit and post-push secret scanning is not optional hygiene — the exploitation window after a public leak is now measured in minutes, not days.

### GitHub's own secret scanning and provider partnerships
GitHub scans every push to public repositories for recognizable secret formats and partners with major providers (cloud vendors, payment processors, and others) so that a leaked, recognizable key can be automatically flagged or even revoked by the issuing provider within minutes — turning "detect the leak" from a manual, reactive process into an automated, proactive one. Lesson: detection infrastructure that operates faster than a human incident-response process meaningfully changes the economics of a leak.

### HashiCorp Vault's own field-engineering case studies on dynamic secrets adoption
Organizations that migrate from static, shared database credentials to Vault-issued dynamic credentials consistently report that "which service used this database credential, and when" becomes a directly answerable audit question for the first time, rather than requiring after-the-fact correlation guesswork. Lesson: dynamic secrets aren't just a security improvement — they're an operational and investigative one, because per-consumer credentials make audit logs meaningfully more precise.

### The recurring Kubernetes base64-as-encryption misconception in security audits
A repeated finding across independent security assessments of Kubernetes clusters (well-documented across the CNCF security community's public guidance) is that teams new to Kubernetes frequently assume Secret objects are encrypted simply because they're a distinct resource type from ConfigMaps, and are surprised in an audit or penetration test when the values are trivially decoded. Lesson: a security control's name ("Secret") is not the same as its actual guarantee — always verify the mechanism, not the label.
`,

  comparisons: `
| Dimension | .env / environment variables | HashiCorp Vault | AWS Secrets Manager | GCP Secret Manager | Azure Key Vault |
|-----------|-------------------------------|------------------|----------------------|---------------------|-----------------|
| Encryption at rest | Depends entirely on the host; often none | Yes, envelope encryption, HSM/KMS-backed unseal | Yes, KMS-backed | Yes, KMS-backed | Yes, HSM-backed option available |
| Fine-grained access policy | No — process-wide, all-or-nothing | Yes, rich policy language | Yes, via IAM | Yes, via IAM | Yes, via Azure RBAC/access policies |
| Audit logging | No | Yes, detailed | Yes, via CloudTrail | Yes, via Cloud Audit Logs | Yes, via Azure Monitor |
| Dynamic/short-lived secrets | No | Yes — the strongest ecosystem for this | Limited (rotation, not per-consumer dynamic issuance for most types) | Limited | Limited |
| Automatic rotation | No | Yes, via secrets engines | Yes, built-in for supported services | Yes, via scheduled rotation | Yes, via rotation policies |
| Multi-cloud/on-prem | N/A (host-local) | Yes, cloud-agnostic by design | AWS-centric | GCP-centric | Azure-centric |
| Operational overhead | Minimal | Highest (self-hosted) or moderate (HCP Vault managed) | Low — fully managed | Low — fully managed | Low — fully managed |
| Best fit | Solo dev, local machine only | Multi-cloud, on-prem, secret-heavy orgs, richest dynamic-secrets needs | Single-cloud AWS shops | Single-cloud GCP shops | Single-cloud Azure shops |

**How seniors choose**: start with the cloud-native manager if you're single-cloud and want the lowest operational overhead — it's already IAM-integrated and someone else runs the HA cluster for you. Reach for Vault when you're multi-cloud, need its dynamic-secrets engines across many backend types (databases, cloud IAM, PKI, SSH), or need one control plane spanning heterogeneous infrastructure. Never choose plain environment variables as the production answer once more than one service or one environment exists — the audit and access-control gap compounds faster than most teams expect.
`,

  "related-technologies": `
- **Encryption** — the applied-cryptography foundation every secrets manager builds on (envelope encryption, KMS/HSM-backed key hierarchies); study this to understand what's actually happening inside Vault's storage layer.
- **Hashing** — the sibling discipline for password *verification* rather than secret *storage*; a secrets manager stores and returns a value, while hashing deliberately never allows recovering the original.
- **TLS & HTTPS** — the transport that protects a secret in flight between a client and the secrets manager, and whose own private keys are themselves a category of secret this page covers directly.
- **OWASP Top 10** — secrets exposure is a recurring theme across multiple categories (broken access control, security misconfiguration, injection); this page is the deep dive on one specific, high-impact slice.
- **SQL Injection / XSS / CSRF** — application-level vulnerabilities that, when chained with an over-broadly-scoped leaked credential, turn a contained bug into a much larger breach; least-privilege secret scoping is the mitigation that limits that chaining.
- **Docker** — the container-image layer subtleties (never bake secrets into an image layer) covered in Deployment and Anti-Patterns build directly on Docker fundamentals.
- **Kubernetes** — the Secret-object mechanics, RBAC, and the External Secrets Operator/Vault Agent Injector bridge patterns covered in Advanced Concepts and Data Flow assume Kubernetes fundamentals from that skill.
- **HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault** — the concrete tools this page centers on; pick based on the Comparisons table above.

On this platform, the natural next pages: **Encryption** → this page → **Kubernetes** → **OWASP Top 10** — each deepens a different facet of the same underlying trust problem.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check each vendor's own release notes and the CNCF/OWASP communities for anything newer, since this space moves quickly and specific version numbers or feature names are worth confirming directly.

- **OIDC federation for CI/CD cloud access** has continued to become the recommended default over static, long-lived cloud keys stored as CI secrets — GitHub Actions, GitLab CI, and other major CI systems all support presenting a short-lived identity token that a cloud provider exchanges for temporary credentials, removing an entire class of "leaked CI secret" incident.
- **Kubernetes secrets tooling** (External Secrets Operator, Vault's Kubernetes integrations) has continued to mature as the standard bridge pattern, reducing the number of teams relying on raw, unencrypted-by-default Secret objects as their actual security boundary.
- **Workload identity federation** (cloud-native mechanisms letting a workload authenticate using its platform-issued identity rather than a stored static key) has kept expanding across AWS, GCP, and Azure, reinforcing the broader industry shift from "store and rotate a secret" toward "eliminate the standing secret entirely wherever a cryptographic identity can substitute for it."
- **Automated, proactive secret revocation by providers** (a provider automatically invalidating a key it detects has been publicly leaked, rather than waiting for the owner to notice) has expanded across more third-party API providers, shrinking the exploitation window after an accidental public leak.
- Always confirm current specifics (exact product names, current default behaviors, and version numbers) directly against HashiCorp's, AWS's, GCP's, and Azure's own current documentation before relying on them in a design decision — this space evolves faster than any static reference, including this page, can guarantee to stay current on exact detail.
`,

  "future-roadmap": `
Where secrets management is heading, and what's worth betting career time on:

1. **The standing secret keeps disappearing.** The clearest long-term trend across every vendor and cloud provider is substituting cryptographic workload identity (mutual TLS, OIDC tokens, short-lived certificates) for stored static secrets wherever the two parties can establish trust some other way. Expect "why do we even have a static secret here" to become the default design question, not an advanced one.
2. **Dynamic secrets expand beyond databases.** The database-credential pattern (generate on demand, short lease, automatic revocation) is steadily extending to more secret types — cloud IAM credentials, SSH certificates, even some API-provider tokens — as more backends add the necessary create/revoke APIs.
3. **Secret scanning shifts further left and gets faster.** Push-protection style scanning (blocking a leak before it ever reaches history, rather than detecting it afterward) is becoming the expected baseline rather than a premium feature, across more platforms and providers.
4. **Kubernetes-native secret handling keeps closing the base64 gap.** Expect continued investment in making the "secure by default" path (encryption at rest, real secrets-manager backing) the easy path, rather than something teams have to consciously bolt on.
5. **Compliance pressure keeps rising.** Regulatory frameworks increasingly expect demonstrable rotation schedules, access audit trails, and least-privilege evidence — not just a policy document, but a queryable audit log a team can produce on demand.

For your career: understanding envelope encryption, dynamic secrets, and workload-identity federation deeply — not just "which product to click" — is what separates "knows secrets management" from "can design a secure credential architecture from scratch," and that gap is exactly what senior security-adjacent interviews probe.
`,

  "cheat-sheet": `
~~~text
# --- What counts as a secret ---
API keys · DB credentials · TLS private keys · OAuth client secrets
· signing keys (JWT) · tokens
Test: "if this leaks publicly, does something bad happen immediately?"

# --- The cardinal rule ---
NEVER commit secrets to git.
Deleting a file does NOT remove it from history:
  git log --all --full-history -- .env
  git show <old-commit>:.env
Fix = ROTATE the credential at its source. History-scrub is cleanup, not the fix.

# --- Local dev baseline ---
.env            # real values, gitignored, never committed
.env.example    # committed, no real values, documents what's needed
.gitignore: .env, *.pem, *.key, secrets/

# --- Why .env fails at production scale ---
No audit trail · no fine-grained access control · no rotation story
· leak surface multiplies (process listings, crash dumps, logs)

# --- Dedicated secrets managers add ---
Encryption at rest (envelope encryption, KMS/HSM-backed)
Fine-grained access policies · audit logs
Dynamic / short-lived credentials · automatic rotation

# --- Dynamic secrets (state of the art) ---
vault write database/roles/readonly default_ttl=5m max_ttl=1h ...
vault read database/creds/readonly
# Generates a UNIQUE db user per request, auto-dropped on lease expiry.
# No standing shared credential to leak between rotations.

# --- Kubernetes Secret != encrypted ---
data.password is base64, NOT encryption:
  echo "czNjcjN0" | base64 -d   # -> s3cr3t, instantly
Fix: enable etcd encryption at rest, restrict RBAC on Secret reads,
bridge from a real manager via External Secrets Operator or
Vault Agent Injector — app never sees the raw manager.

# --- CI/CD ---
GitHub Actions: secrets.NAME injected as env, auto-masked in logs
(best-effort match only — never intentionally echo transformed secrets)
Prefer OIDC federation over static cloud keys in CI:
  short-lived identity token -> cloud provider exchanges for temp creds

# --- Detecting leaks ---
git secrets --scan            # pattern-based, pre-commit friendly
trufflehog git file://.        # full history, entropy + pattern based
GitHub secret scanning / push protection  # automatic on GitHub

# --- Incident response order ---
1. Rotate immediately at the source
2. Assume compromise
3. Audit access logs for the exposure window
4. Scope blast radius via least-privilege policy
5. Scrub history if warranted (does not undo prior exposure)
6. Fix the root cause (no scanner? no rotation schedule?)

# --- This platform's own worked example (api/.env.example) ---
AEOS_JWT_SECRET       # generate: openssl rand -hex 32
AEOS_DATABASE_URL
AEOS_GITHUB_CLIENT_SECRET / AEOS_GOOGLE_CLIENT_SECRET / AEOS_APPLE_PRIVATE_KEY
Phase 1: env vars, fine for one small service.
Evolve to: dedicated secrets manager + rotation + audit logging as it grows.
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What makes a value a "secret" vs regular config? | Its disclosure alone lets someone impersonate the system or access protected data |
| Does deleting a committed secret from git remove it? | No — history retains every version; clones/forks copy it forward; rotate the credential instead |
| Is base64 in a Kubernetes Secret encryption? | No — trivially reversible with no key; enable etcd encryption at rest and restrict RBAC separately |
| What is a dynamic secret? | A credential generated per-consumer on demand with a short lease, auto-revoked on expiry — no standing shared secret |
| What does envelope encryption add over one big key? | A data encryption key (DEK) encrypts the secret; a key encryption key (KEK) in an HSM/KMS encrypts the DEK — bulk data can be re-keyed without touching the KEK |
| Why is masking in CI logs not a full guarantee? | It's a best-effort string match against the registered secret value; transformed/encoded secrets can evade it |
| What replaces static cloud keys in modern CI/CD? | OIDC federation — a short-lived identity token exchanged for temporary cloud credentials |
| First step after discovering a leaked secret | Rotate it immediately at the source — before investigation, before cleanup |
| Vault Agent Injector vs External Secrets Operator | Injector: sidecar fetches secrets into a shared volume the app reads. ESO: controller materializes a native K8s Secret from an external source |
| Why prefer least-privilege scoping per credential? | Limits blast radius — a compromised credential can only reach what it was ever scoped to |
| Rotation vs dynamic secrets | Rotation swaps one static secret for another on a schedule; dynamic secrets have no standing credential between issuances at all |
| Safe way to generate a secret value | A cryptographic random source (openssl rand, a language's secrets module) — never a human-chosen string |
| Why not bake a secret into a Docker image via COPY/ARG? | Image layers are historical — a later layer "removing" it doesn't remove it from the built image |
| What does an unseal step protect against? | A stolen storage-backend disk image being decryptable without also compromising the separate unseal/KMS mechanism |
| This platform's phase-1 secrets pattern | AEOS_* environment variables (api/.env.example) — reasonable for one small service, meant to evolve to a real secrets manager as it grows |
`,

  mcqs: `
**1. Which of these is a secret, not regular configuration?**

A) LOG_LEVEL=info  B) MAX_RETRIES=3  C) DATABASE_PASSWORD=hunter2  D) API_BASE_URL

**Answer: C** — its disclosure alone lets someone access the database; the others cause bugs, not breaches, if leaked.

**2. A developer commits a secret, then deletes the file in the next commit. Is the secret safe?**

A) Yes, deletion removes it  B) No, it's still in git history and reachable via prior commits  C) Only if the repo is private  D) Only if it's a public repo

**Answer: B** — history retains every version regardless of repo visibility; rotate the credential.

**3. What does base64-encoding a Kubernetes Secret's data field provide?**

A) Strong encryption  B) Weak encryption  C) No confidentiality at all — trivially reversible  D) Encryption only if RBAC is restricted

**Answer: C** — base64 is an encoding, not encryption; anyone with read access decodes it instantly.

**4. What is the key advantage of a dynamic secret over a rotated static secret?**

A) It's cheaper to generate  B) There is no standing shared credential between issuances at all  C) It never expires  D) It requires no authentication to request

**Answer: B** — dynamic secrets are generated per-consumer with a short lease and auto-revoked; a rotated static secret is still a standing, shared credential between rotation events.

**5. In envelope encryption, what does the key encryption key (KEK) do?**

A) Encrypts the secret data directly  B) Encrypts the data encryption key (DEK), and is itself protected by an HSM/KMS  C) Is generated fresh for every secret  D) Is stored alongside the encrypted secret in plaintext

**Answer: B** — the DEK encrypts the actual secret data; the KEK, rarely touched and HSM/KMS-protected, encrypts the DEK, so bulk re-keying doesn't require touching the KEK.

**6. What's the correct first step after discovering a secret leaked publicly?**

A) Scrub git history immediately  B) Wait for a full investigation before acting  C) Rotate the credential at its source immediately  D) Delete the repository

**Answer: C** — rotation comes first, before investigation or history cleanup, because speed limits the exploitation window.
`,

  "revision-notes": `
**What counts as a secret, in one line:** any value whose disclosure alone lets someone impersonate your system or reach protected data — API keys, DB credentials, TLS private keys, OAuth client secrets, signing keys, tokens — categorically different from ordinary config because the blast radius of a leak is immediate and severe.

**The cardinal rule:** never commit secrets to git; git history, forks, and CI logs all keep a "deleted" secret alive, so the only real fix after a leak is rotating the credential at its source, with history-scrubbing as separate, non-substitutive cleanup.

**The maturity curve:** .env files are a reasonable local-dev starting point but a production anti-pattern at scale (no audit trail, no fine-grained access, no rotation story); dedicated secrets managers (Vault, AWS/GCP/Azure equivalents) add encryption at rest via envelope encryption, fine-grained access policies, audit logging, and either rotation or true dynamic secrets. Dynamic secrets — a credential generated per-consumer with a short lease and automatic revocation — are the state of the art, most mature for database access via Vault's database secrets engine.

**Kubernetes and CI/CD specifics:** a Kubernetes Secret's base64 encoding is NOT encryption — pair it with etcd encryption at rest, restrictive RBAC, and ideally source real values from External Secrets Operator or Vault Agent Injector rather than storing them as native Secrets at all. In CI/CD, mask logs (best-effort only, don't rely on it blindly) and prefer OIDC federation over storing long-lived static cloud keys as CI secrets.

**Detection and response:** git-secrets and truffleHog scan for leaks (pattern-based and entropy-based respectively); GitHub secret scanning does this automatically at push time. Incident response order: rotate immediately, assume compromise, audit access logs for the exposure window, scope the blast radius via the credential's least-privilege policy, then consider history scrubbing — and always close the root-cause gap (missing scanner, missing rotation schedule) afterward. This platform's own AEOS_* environment-variable pattern (api/.env.example) is a legitimate phase-1 approach for a small service, with a clear evolution path toward a real secrets manager, rotation, and audit logging as it scales.
`,

  "learning-roadmap": `
A realistic path to confidently designing secrets architecture (adjust pace to your background):

**Week 1 — Foundations.** Beginner Concepts + Lab 1. Set up git-secrets on a sample repo, understand why history-scrubbing isn't the fix for a leak. Milestone: you can explain, unprompted, why "just delete it" doesn't work.

**Week 2 — From .env to a real manager.** Intermediate Concepts + Lab 2. Stand up a local Vault dev server, migrate a sample app's static secrets into it with a least-privilege policy. Milestone: you can articulate exactly what a secrets manager adds over environment variables, concretely, not just in slogans.

**Week 3 — Dynamic secrets and internals.** Advanced Concepts + Internal Working + Lab 3. Configure Vault's database secrets engine, watch a generated user get created and auto-dropped. Milestone: you understand envelope encryption and can draw the unseal/KEK/DEK relationship from memory.

**Week 4 — Kubernetes and production.** Architecture, Data Flow, Deployment sections + Lab 4. Deploy the naive Kubernetes Secret approach, then the Vault Agent Injector approach, side by side. Milestone: you can demonstrate, live, why base64 isn't encryption and how the bridged setup fixes it.

**Week 5 — Operations and interview readiness.** Security, Monitoring, Production Checklist, Interview Questions sections. Write (or rehearse) an incident-response runbook for a leaked secret. Milestone: you can walk through the first 30 minutes of a leak incident calmly and in the correct order.

Then continue to the **Kubernetes** skill on this platform for the orchestration-layer depth this page assumes, or **OWASP Top 10** to place secrets exposure in the broader web-application security context.
`,

  "official-docs": `
- [HashiCorp Vault documentation](https://developer.hashicorp.com/vault/docs) — the reference for Vault's auth methods, secrets engines, and policy language.
- [AWS Secrets Manager documentation](https://docs.aws.amazon.com/secretsmanager/) — rotation configuration, IAM integration, and pricing details.
- [GCP Secret Manager documentation](https://cloud.google.com/secret-manager/docs) — IAM-integrated secret storage and versioning.
- [Azure Key Vault documentation](https://learn.microsoft.com/azure/key-vault/) — managed HSM-backed key and secret storage.
- [Kubernetes Secrets documentation](https://kubernetes.io/docs/concepts/configuration/secret/) — read the "Risks" section carefully; it explicitly states base64 is not encryption.
- [External Secrets Operator documentation](https://external-secrets.io/) — the Kubernetes-to-external-manager bridge pattern.
- [GitHub secret scanning documentation](https://docs.github.com/code-security/secret-scanning) — push protection and partner-provider revocation.
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) — a concise, security-community-maintained checklist that pairs well with this page.
`,

  books: `
- **"Vault: HashiCorp's Multi-Cloud Security" (HashiCorp official guides and whitepapers)** — the deepest available treatment of Vault's architecture; start here for internals beyond this page.
- **"Cloud Native Security" by Chris Binnie and Rory McCune** — covers Kubernetes secrets, RBAC, and the broader cloud-native security context this page's Kubernetes sections sit inside.
- **"Applied Cryptography" by Bruce Schneier** — the classic deep foundation for the envelope-encryption and key-hierarchy concepts a secrets manager applies; read after the **Encryption** skill.
- **"Site Reliability Engineering" (Google, free online)** — the chapters on managing critical dependencies and incident response generalize directly to treating a secrets manager as tier-0 infrastructure.
- **"The Cuckoo's Egg" by Cliff Stoll** — not a secrets-management book per se, but the classic narrative of following a real intrusion; useful grounding for why "assume compromise" incident-response thinking matters.
`,

  blogs: `
- **HashiCorp's official blog** (hashicorp.com/blog) — Vault release notes, dynamic-secrets deep dives, and real customer case studies.
- **AWS Security Blog** — Secrets Manager and IAM best-practice posts, including rotation-configuration walkthroughs.
- **GitHub's security blog** — regular writeups on secret scanning, push protection, and provider-partnership revocation mechanics.
- **The CNCF blog and the Kubernetes blog** — External Secrets Operator updates and broader cloud-native secrets patterns.
- **Google Cloud's security blog** (including the public BeyondProd/BeyondCorp writeups) — workload-identity and zero-standing-privilege philosophy at organizational scale.
- **OWASP Cheat Sheet Series** — not a blog, but continuously maintained and worth following for updates to the Secrets Management Cheat Sheet specifically.
`,

  "research-papers": `
This is a topic where practitioner engineering writeups (vendor whitepapers, conference talks, postmortems) carry more of the field's actual knowledge than peer-reviewed papers — secrets management is applied security engineering more than an academic research area. If you're looking for genuinely foundational reading, go one layer down to the cryptography and distributed-systems papers the practice rests on:

- **Shamir, "How to Share a Secret" (1979)** — the foundational paper behind Shamir's Secret Sharing, which Vault's manual unseal mechanism uses directly.
- **Google's "BeyondProd" whitepaper** — describes workload identity and zero-trust service-to-service authentication at organizational scale, the philosophy underlying "eliminate the standing secret wherever possible."
- **NIST Special Publication 800-57 (Recommendation for Key Management)** — the closest thing to a formal standard for key lifecycle management, rotation, and key hierarchies that secrets managers implement in practice.
- **The Encryption skill's research-papers section** — envelope encryption and key-hierarchy design are properly cryptography research topics; this page's contribution is the operational and access-control layer built on top of them.

If you need citable academic depth for this specific topic, be honest that the strongest sources are vendor architecture documentation and industry standards bodies (NIST) rather than a single canonical paper — and say so rather than inventing one.
`,

  videos: `
- **HashiCorp's own Vault deep-dive talks (HashiConf sessions)** — direct-from-the-source explanations of dynamic secrets, envelope encryption, and unsealing; search HashiCorp's official channel for the current year's HashiConf.
- **"What Happens When You Push a Secret to GitHub" (GitHub Security talks/blog videos)** — walks through GitHub's own detection-to-revocation pipeline from the inside.
- **KubeCon + CloudNativeCon security-track talks on Kubernetes Secrets and External Secrets Operator** — the CNCF's own conference talks are consistently the highest-signal source for this specific bridge pattern, and are refreshed every year.
- **AWS re:Invent security-track sessions on Secrets Manager and IAM roles** — AWS's own architecture recommendations, directly from the service teams.
- **Conference talks on real breach postmortems** (search for specific, named incident retrospectives from security conferences) — case-study-driven learning is unusually effective for this topic; verify the specific talk and speaker before citing it, since this page won't invent one.
`,

  "github-repos": `
- [hashicorp/vault](https://github.com/hashicorp/vault) — the source itself; the secrets engines and auth methods directories are the best place to see the patterns in this page implemented.
- [external-secrets/external-secrets](https://github.com/external-secrets/external-secrets) — the Kubernetes External Secrets Operator, the standard bridge from a cluster to a real secrets manager.
- [trufflesecurity/trufflehog](https://github.com/trufflesecurity/trufflehog) — the leading open-source secret scanner; read its detector list to see the breadth of real-world secret formats.
- [awslabs/git-secrets](https://github.com/awslabs/git-secrets) — the pre-commit-hook scanner referenced throughout this page.
- [Yelp/detect-secrets](https://github.com/Yelp/detect-secrets) — an alternative scanner with a baseline-file workflow, useful for adopting scanning on a large legacy repo without a flood of false-positive noise.
- [pydantic/pydantic-settings](https://github.com/pydantic/pydantic-settings) — the config-loading library referenced in Production Usage; study how it validates required fields and fails fast.
- [openbao/openbao](https://github.com/openbao/openbao) — an open-source fork of Vault's last fully open-source release, worth knowing about given Vault's own licensing history.
- This platform's own **api/.env.example** — not a public repo, but the closest, most concrete worked example available: study it directly alongside this page's Intermediate Concepts section.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Classification*: given a list of twenty configuration values from a real app (timeouts, feature flags, API keys, a public CDN URL, a database password), correctly classify each as secret or plain config, and justify each answer using the "does leaking this cause immediate harm" test.
2. *Prevention*: set up git-secrets or detect-secrets on a repository with an intentionally seeded fake secret in an old commit; confirm the tool catches new commits but understand why it can't retroactively protect the fake secret already in history without an explicit history-scrub step.
3. *Detection*: run truffleHog against a public repository known for security-education purposes (never against a repository you don't have permission to scan) and interpret its entropy-based versus pattern-based findings.
4. *Dynamic secrets*: configure Vault's database secrets engine end to end against a local Postgres instance (extending Coding Questions #1/Lab 3); measure the actual latency of a dynamic-secret request versus a cached static one.
5. *Kubernetes*: reproduce the base64-decode "vulnerability" yourself in a local cluster, then fix it with etcd encryption at rest and restrictive RBAC, and verify the fix by attempting the same decode as an unauthorized identity.
6. *Rotation*: implement the overlap-window JWT signing-key rotation from Coding Questions #3, and write a test that proves a token signed just before rotation still validates just after it, within the overlap window.
7. *Incident response*: given a simulated scenario ("a database password was found in a public gist"), write out your first-30-minutes runbook in the correct order and justify why each step comes before the next.

External sets: the OWASP Cheat Sheet Series' own self-check questions, HashiCorp's official Vault tutorials (hands-on, browser-based sandboxes), and Kubernetes' own "hello Secrets" tutorial followed immediately by the External Secrets Operator quick-start for contrast.
`,

  "architecture-diagram": `
The reference architecture for production secrets management — the shape this page has been building toward across Internals, Architecture, and Data Flow:

~~~mermaid
flowchart TB
    Dev["Developer laptop\n.env (local only, gitignored)"] -.never committed.-> Repo["Git repository\n(.env.example only, no real values)"]
    Repo --> CI["CI/CD pipeline\n(scans for secrets, OIDC to cloud, masked logs)"]
    CI --> Registry["Container registry\n(image has ZERO embedded secrets)"]
    Registry --> Cluster["Kubernetes cluster"]

    subgraph Cluster
        Pod["App Pod"]
        Sidecar["Vault Agent sidecar\n(or External Secrets Operator-synced volume)"]
        Pod --- Sidecar
    end

    Sidecar -->|K8s ServiceAccount auth| Vault["Secrets Manager\n(Vault / cloud-native equivalent, HA cluster)"]
    Vault --> KMS["KMS / HSM\n(root key, auto-unseal)"]
    Vault --> DB[("Database\ndynamic per-request users")]
    Vault --> Audit["Immutable audit log -> SIEM"]
    Pod --> DB
~~~

Every arrow into "Vault" is authenticated and policy-checked; every arrow out is audited; and no plaintext secret ever crosses the Repo or Registry boxes at all — that absence is the entire point of the architecture.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Secrets Management))
    What is a secret
      API keys
      DB credentials
      TLS private keys
      OAuth client secrets
      Signing keys
      Tokens
    The cardinal sin
      Never commit to git
      History/forks/CI logs persist it
      Rotate, don't just delete
    Maturity curve
      .env local dev
      Cloud-native managers
      HashiCorp Vault
      Dynamic secrets
    Kubernetes and CI-CD
      Base64 is not encryption
      External Secrets Operator
      Vault Agent Injector
      GitHub Actions masking
      OIDC federation
    Detection and response
      git-secrets
      truffleHog
      GitHub secret scanning
      Rotate -> audit -> assume compromise
    Internals
      Envelope encryption
      KEK and DEK
      Unsealing
      Audit logging
    Production
      Least privilege scoping
      Monitoring and alerting
      Production checklist
      Incident runbooks
    Related skills
      Encryption
      Hashing
      TLS and HTTPS
      Docker and Kubernetes
      OWASP Top 10
~~~
`,
};

export default secretsManagement;
