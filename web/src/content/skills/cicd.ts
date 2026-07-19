import type { SkillContent } from "../types";

/**
 * CI/CD — full 50-section knowledge page.
 * This is the platform-agnostic CONCEPTUAL page for the Cloud & DevOps
 * category. Concrete tool implementations live in the GitHub Actions and
 * Jenkins skills; this page teaches the principles both of them implement.
 * Note: code blocks use ~~~ fences so this file needs no backtick escaping,
 * and pipeline examples are written in neutral pseudo-YAML (never a specific
 * tool's exact expression syntax) to keep the contract's character rules.
 */
const cicd: SkillContent = {
  overview: `
CI/CD stands for **Continuous Integration** and **Continuous Delivery** (or **Continuous Deployment** — a deliberately different word covered in depth below). It is the discipline of automating how code moves from a developer's editor to production: every change is merged frequently, verified automatically by a pipeline of build and test stages, packaged into a versioned artifact, and pushed through environments toward release with humans making decisions instead of typing deploy commands.

For an AI engineer this is not a "DevOps team's problem." Model-serving APIs, RAG pipelines, agent backends, and the infrastructure that trains and evaluates models all live in git repositories that need the same discipline as any other software: automated tests before merge, reproducible builds, safe rollout of a new model version, and a fast rollback path when an eval regresses in production. Every serious AI product ships through a pipeline, and the ability to read, extend, and debug that pipeline is a baseline production skill, not a specialty.

This page is deliberately **platform-agnostic**: it covers the concepts, vocabulary, and decision-making that apply whether the pipeline is built on GitHub Actions, GitLab CI, Jenkins, CircleCI, or a homegrown system. The **GitHub Actions** skill on this platform covers the modern cloud-native implementation of these ideas in concrete YAML; the **Jenkins** skill covers the classic self-hosted, plugin-driven implementation. Read this page first — it is the mental model both of those tools are expressing in different syntax.

Key characteristics of a mature CI/CD practice: changes integrate into a shared trunk at least daily, every integration triggers an automated pipeline, the pipeline's output is a single immutable artifact promoted unchanged across environments, deployment is either a one-click decision (Continuous Delivery) or fully automatic (Continuous Deployment), and the whole pipeline definition lives in version control next to the code it builds ("pipeline-as-code"). Everything else in this page — deployment strategies, feature flags, pipeline security, DORA metrics — exists in service of that core loop: **small changes, fast feedback, safe releases.**
`,

  history: `
CI/CD's roots are in **Extreme Programming (XP)**. Kent Beck and the XP community in the mid-1990s described "continuous integration" as a discipline: integrate and test against the mainline multiple times a day to avoid the pain of merging long-lived branches. Martin Fowler's 2000 essay "Continuous Integration" (later updated repeatedly) turned the practice into an industry reference point, and CruiseControl (2001, ThoughtWorks) was arguably the first widely used dedicated CI server that automated the idea instead of relying on developer discipline alone.

The next leap was cultural rather than technical: the 2009 Velocity conference talk "10+ Deploys Per Day: Dev and Ops Cooperation at Flickr" by John Allspaw and Paul Hammond is widely credited as the spark for the **DevOps movement** — the argument that deployment frequency and stability are not in tension if you invest in automation. Jez Humble and David Farley's 2010 book **Continuous Delivery** formalized the "deployment pipeline" model and coined sharp definitions for delivery vs deployment that the industry still uses (and still confuses) today.

Docker (2013) was a structural turning point for CD specifically: an immutable, portable artifact (the image) made "build once, promote unchanged through every environment" practical for almost any stack, not just statically compiled binaries. Kubernetes (2014+) then gave that artifact a standard, declarative deployment target, which is what made canary and blue-green strategies operationally tractable for ordinary teams rather than only FAANG-scale infrastructure groups.

| Year | Milestone |
|------|-----------|
| 1991–1999 | Extreme Programming names "continuous integration" as a practice |
| 2000 | Martin Fowler publishes "Continuous Integration" |
| 2001 | CruiseControl — one of the first dedicated CI servers |
| 2004 | Hudson (later forked into Jenkins in 2011) released by Kohsuke Kawaguchi |
| 2009 | Flickr's "10+ Deploys Per Day" talk — the DevOps movement's founding moment |
| 2010 | Humble & Farley publish *Continuous Delivery*, formalizing the deployment pipeline |
| 2011 | Jenkins forks from Hudson after an Oracle governance dispute |
| 2013 | Docker released — immutable artifacts make build-once-promote-everywhere practical |
| 2014 | Kubernetes released; Netflix open-sources Spinnaker's precursors for canary delivery |
| 2014–2015 | Puppet/DORA begin the annual *State of DevOps* research (later the *Accelerate* book, 2018) |
| 2015–2018 | Pipeline-as-code becomes standard: Jenkinsfile, .gitlab-ci.yml, CircleCI config |
| 2019 | GitHub Actions launches — CI/CD colocated with the code host, hosted runners by default |
| 2018–2022 | GitOps (Argo CD, Flux) formalizes pull-based, declarative continuous deployment |
| 2021+ | Supply-chain security (SLSA framework, Sigstore/cosign) becomes a first-class pipeline concern after high-profile attacks (SolarWinds, 2020) |

The throughline across three decades: every milestone reduces the cost of integrating and releasing small changes, and every major security or reliability incident since has pushed the industry to automate one more manual, error-prone step.
`,

  "why-it-exists": `
Before CI/CD was normal practice, the default workflow at most companies looked like this: developers worked on feature branches for weeks or months, a "merge day" (or "merge week") integrated everyone's changes right before a release, and the release itself was a scheduled event — often quarterly — executed by an operations team following a manual runbook, frequently at night or on a weekend to minimize user impact.

That world had three structural problems this page keeps returning to:

1. **Integration hell.** The longer two branches diverge, the more their changes conflict — not just in text, but in behavior. A merge after three months of independent work is not "resolve some conflicts," it is "re-discover how two large sets of changes interact," often under release-deadline pressure.
2. **"Works on my machine."** Without an automated, identical build/test environment, a developer's laptop state (installed versions, local config, cached data) silently became part of the "correctness" of the code. Bugs that only reproduced in production were common because nothing enforced environment parity.
3. **Manual releases are slow and risky.** A human typing commands against production, following a checklist, under time pressure, at 2 a.m., is a well-documented recipe for outages. The riskiest moment in a system's life is the moment it changes, and manual process maximizes both the frequency of high-stakes moments (batched, infrequent releases) and the error rate within them.

CI/CD exists to replace all three failure modes with automation: integrate constantly so divergence never has time to compound, build and test in a clean, reproducible environment so "works on my machine" stops being meaningful, and drive releases through a repeatable, tested pipeline so the same safe path is taken every single time — whether it's the first deploy of the day or the five-hundredth. See the **Git** skill for the branching mechanics this all sits on top of.
`,

  "problem-it-solves": `
Concretely, a mature CI/CD practice removes:

- **Late discovery of bugs.** A test failure surfaces in minutes on the commit that caused it, not weeks later during a "stabilization" phase when nobody remembers the change.
- **Merge conflict pain.** Frequent small integrations mean each merge is trivial; the alternative (rare, huge merges) is where real pain concentrates.
- **Deployment as a special, feared event.** When deploying is a routine, automated, low-risk action performed many times a day, "deploy" stops being a four-letter word engineers dread.
- **Inconsistent environments.** The exact artifact (container image, package) that passed tests is the exact artifact that runs in production — no rebuild step to introduce drift.
- **Human error in repetitive operational tasks.** Typing the same fifteen deploy commands correctly, every time, under pressure, is not a sustainable safety strategy; a script or pipeline stage does not get tired or distracted.
- **Slow, all-or-nothing feedback.** Developers know within minutes whether their change is safe, instead of finding out at the end of a multi-week integration cycle.

**What CI/CD deliberately does NOT solve** — a point worth being explicit about, because it is commonly overclaimed:

- **It does not guarantee code quality.** A fast pipeline around a weak test suite just ships bugs to production faster and with more confidence than is warranted. The pipeline is only as good as the tests and checks wired into it.
- **It does not replace architectural judgment.** A poorly decomposed monolith with tightly coupled deploys does not become safe to release ten times a day just because a YAML file automates the steps; the deployability of a system is largely an architecture problem, not a pipeline problem.
- **It does not make stateful changes (database migrations, irreversible data transformations) automatically safe.** Schema changes still require careful sequencing (see the expand/contract pattern in Advanced Concepts) regardless of how automated the surrounding deploy is.
- **It does not replace production observability.** A pipeline can confirm a service *started successfully*; only monitoring and alerting (see the Observability category on this platform) tell you whether it is *behaving correctly* under real traffic hours later.
- **It does not eliminate the need for a rollback plan.** Automation should make rollback fast and routine, but every deployment strategy in this page still assumes something will eventually go wrong and needs an exit path.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Precisely distinguish Continuous Integration, Continuous Delivery, and Continuous Deployment — and explain why the difference matters in an interview and in a real incident postmortem.
2. Design the stages of a production-grade pipeline (lint, build, unit test, integration test, security scan, package, deploy-to-staging, smoke test, approval gate, deploy-to-production) and justify their order.
3. Explain trunk-based development vs feature branching and how each interacts with pipeline cadence and merge risk.
4. Read and reason about pipeline-as-code, including why it replaced GUI-configured pipelines as the industry standard.
5. Explain the role of artifact repositories (container registries, package registries) as the contractual handoff point between CI and CD.
6. Choose between blue-green, canary, and rolling deployment strategies for a given system, and articulate the blast-radius and rollback tradeoffs of each.
7. Explain feature flags as a mechanism for decoupling *deployment* (code reaching production) from *release* (users experiencing a change).
8. Apply core pipeline security practices: secret handling, least-privilege pipeline credentials, dependency/SCA scanning, and artifact signing.
9. Define and compute the four DORA metrics (deployment frequency, lead time for changes, change failure rate, MTTR) and use them to reason about a team's delivery performance.
10. Debug a failing or flaky pipeline systematically instead of by trial and error.
`,

  prerequisites: `
- **Required**: comfort with Git fundamentals — commits, branches, merges, pull requests. See the **Git** skill; this entire page assumes you can explain what a merge conflict is.
- **Required**: basic command-line literacy (running a script, reading exit codes, environment variables).
- **Helpful**: containers. Building and pushing a Docker image is the most common "package" stage in a modern pipeline — see the **Docker** skill for depth on that specific stage.
- **Helpful**: a cloud provider's basics (any of **AWS**, **Azure**, **GCP**) since most deploy targets in real pipelines are cloud resources.
- **Helpful**: **Terraform**, since many production pipelines include an infrastructure-as-code stage that provisions or updates the target environment before the application deploy happens.
- **Not required**: knowledge of any specific CI tool. This page intentionally stays agnostic; the **GitHub Actions** and **Jenkins** skills are where you learn concrete syntax and tool-specific mechanics once these concepts are solid.

Suggested order on this platform: **Git** → this page (**CI/CD**) → **Docker** → **GitHub Actions** or **Jenkins** → **Kubernetes** / **Terraform** for the deploy targets a real pipeline manages.
`,

  "beginner-concepts": `
### Continuous Integration (CI) — the foundational practice

Continuous Integration means developers merge their work into a shared trunk (usually **main**) **frequently — at least daily**, and every merge automatically triggers a build and test run. The goal is simple: never let anyone's copy of the code diverge far enough from everyone else's that merging becomes an event.

~~~text
Without CI:                          With CI:
  branch lives 3 weeks                 branch lives < 1 day
  merge = surprise conflicts           merge = trivial, tested constantly
  bugs found at integration time       bugs found within minutes of introduction
~~~

A CI pipeline for even a tiny project typically runs these stages, in order, stopping at the first failure:

~~~yaml
# Illustrative, tool-agnostic pipeline shape (not any one vendor's syntax)
stages:
  - lint          # static style/formatting checks — fastest, run first
  - build         # compile / install dependencies — confirms the code even builds
  - unit-test     # fast, isolated tests — the bulk of the safety net
  - package       # produce a versioned artifact (container image, wheel, jar)
~~~

### The three words people mix up: Integration, Delivery, Deployment

This is the single most frequently confused distinction in CI/CD interviews, so get it exactly right:

| Term | What happens | Who decides to release to users |
|------|--------------|----------------------------------|
| **Continuous Integration** | Every merge is automatically built and tested | N/A — this stage doesn't touch production at all |
| **Continuous Delivery** | Every change that passes CI produces a deployable, release-ready artifact | A **human** — deployment to production is a manual action (a button click, a ticket approval) |
| **Continuous Deployment** | Same as delivery, but the last step is also automated | **Nobody** — every change that passes every gate goes to production automatically |

The confusion happens because "Delivery" and "Deployment" are near-synonyms in English but mean structurally different things here: **Delivery guarantees you COULD release right now; Deployment means you actually DID, automatically.** Every Continuous Deployment setup is also Continuous Delivery (the artifact is always releasable), but not every Continuous Delivery setup is Continuous Deployment (a human still presses the button).

### Version control triggers the pipeline

A pipeline doesn't run on a schedule by default — it runs in response to a **git event**: a push to a branch, a pull request opened or updated, a tag created, or a merge to main. See the **Git** skill for exactly what these events are; CI/CD is, structurally, "automation that subscribes to git events."

### The build artifact

The pipeline's job is to produce one **artifact** — a container image, a compiled binary, a language package (a wheel, a JAR) — that is versioned (usually by git commit SHA or a semantic version tag) and immutable. Everything downstream (staging, production) deploys that exact artifact; nothing gets rebuilt from source again after this point. This single rule — build once, promote everywhere — is what prevents "it passed staging but broke in prod because the rebuild picked up a different dependency version."
`,

  "intermediate-concepts": `
### The full anatomy of a production pipeline

A real pipeline has more stages than the beginner version, each catching a different class of problem, ordered cheapest-and-fastest-first:

~~~yaml
stages:
  - lint                 # seconds: style, formatting, static analysis
  - build                # compile/install deps, confirm it builds at all
  - unit-test             # fast, isolated logic tests — no network, no DB
  - integration-test       # tests against real (or realistic) dependencies: DB, queue, API
  - security-scan          # SAST + dependency/SCA scan (see Security section)
  - package                # build the versioned, immutable artifact
  - deploy-staging          # apply the artifact to a staging environment
  - smoke-test              # a handful of critical-path checks against staging
  - manual-approval          # a human gate — required for Continuous Delivery, absent for Continuous Deployment
  - deploy-production         # apply the same artifact to production, using a deployment strategy
~~~

Each earlier stage is a cheap filter for a later, more expensive one: lint fails in seconds and blocks a build that would have wasted minutes; unit tests fail in under a minute and block an integration-test suite that takes ten. This ordering is not arbitrary — it is the single biggest lever on pipeline speed (see Performance).

### Trunk-based development vs feature branching

**Trunk-based development**: everyone commits directly to main (or very short-lived branches merged within hours), often behind feature flags for anything not ready for users. This maximizes CI's value — the whole point of CI is testing against what everyone else is doing, and trunk-based development means "everyone else's work" is always current.

**Feature branching** (GitFlow and similar): longer-lived branches per feature, merged via pull request after review, sometimes staying open for days or weeks. This is more common in open-source and regulated environments where review gates matter more than integration speed.

| Aspect | Trunk-based | Feature branching |
|--------|-------------|--------------------|
| Merge risk | Very low (small, frequent diffs) | Grows with branch age |
| CI cadence | Every commit, many times a day | Every PR update, less frequent overall |
| Needs feature flags? | Effectively required for half-finished work | Not required — branch itself hides incomplete work |
| Release readiness | Main is always releasable | Main may be releasable only after a merge window |
| Fits Continuous Deployment? | Yes — this is the standard pairing | Awkward — deploying every PR merge is riskier with big diffs |

Senior engineers default to trunk-based development with short-lived branches specifically because it is the pairing that makes CI meaningful and Continuous Delivery/Deployment safe.

### Pipeline-as-code

The old model configured pipelines by clicking through a CI server's web UI — configuration lived only on that server, was not versioned, was not reviewable in a pull request, and drifted silently between projects. The modern standard is **pipeline-as-code**: the pipeline definition is a file (or files) committed to the same repository as the code it builds, reviewed the same way, and versioned alongside every change.

~~~text
Old (GUI-configured):                Modern (pipeline-as-code):
  config lives only on CI server       config lives in the repo (.yml/Jenkinsfile)
  no diff/review of pipeline changes   pipeline changes reviewed like any PR
  hard to reproduce on a new server    clone the repo, the pipeline comes with it
  tribal knowledge in the UI           documented, greppable, versioned history
~~~

The **GitHub Actions** skill covers .github/workflows YAML in depth; the **Jenkins** skill covers the Jenkinsfile (Groovy-based pipeline-as-code) equivalent — both are concrete implementations of this same principle.

### Artifact repositories — the CI/CD handoff point

An **artifact repository** (a Docker/OCI container registry, or a package registry like a private PyPI/npm/Maven repo) is where CI ends and CD begins. CI's job is to produce a trustworthy, versioned artifact and push it here; CD's job is to pull that exact artifact and deploy it. See the **Docker** skill for building and pushing images as a pipeline stage in detail. This handoff matters architecturally: it means the deploy stage never needs source code or a build toolchain — only the registry and the artifact's tag/digest.

### Environment parity and promotion

Artifacts are **promoted** through environments (dev → staging → production) rather than rebuilt for each one. Configuration differs per environment (via environment variables, secrets, or config maps), but the code and its dependencies do not change — this is what makes "it passed staging" a meaningful predictor of production behavior.
`,

  "advanced-concepts": `
### Deployment strategies: the core intermediate/advanced topic

How the new artifact actually replaces the old one in production is a distinct decision from "should we deploy" — and it is where blast radius, cost, and rollback speed are actually determined.

**Rolling update**: instances/pods are replaced a few at a time, old version draining as new version comes up, until 100% is on the new version.

~~~text
[old][old][old][old]  ->  [new][old][old][old]  ->  [new][new][old][old]  -> ... -> [new][new][new][new]
~~~

- Blast radius: partial — a fraction of traffic hits the new version at any moment.
- Rollback: reverse the rolling process; takes as long as the rollout did.
- Cost: no extra infrastructure needed (reuses existing capacity).
- Best for: most stateless services where a brief mixed-version window is acceptable.

**Blue-green**: two full, identical environments exist ("blue" = current live, "green" = new version). Traffic switches from blue to green all at once (a router/load-balancer flip) once green is verified healthy.

~~~text
Before:  Router --> [Blue: v1] (live)      [Green: v2] (idle, being verified)
After:   Router --> [Blue: v1] (idle)      [Green: v2] (live)
~~~

- Blast radius: zero during rollout (green isn't live until the switch); the switch itself is instantaneous and affects 100% of traffic at once.
- Rollback: instant — flip the router back to blue.
- Cost: double the infrastructure while both environments exist.
- Best for: systems where instant, clean rollback matters more than infrastructure cost, and where a big-bang cutover is acceptable (no gradual traffic ramp).

**Canary**: a small percentage of traffic (say 5%) is routed to the new version while most traffic stays on the old version; the canary's error rate/latency is compared to the baseline, and traffic is gradually ramped up (5% → 25% → 100%) only if metrics stay healthy — otherwise it is rolled back automatically.

~~~text
Router --> 95% --> [old version]
       \\-> 5%  --> [new version]  <- watched closely; ramps up or rolls back based on metrics
~~~

- Blast radius: smallest of the three — a bad release only ever affects a small, controlled slice of users.
- Rollback: fast and cheap — just route the canary slice back to old.
- Cost: modest extra capacity for the canary slice; requires real-time metrics comparison (often automated — "automated canary analysis," pioneered operationally by Netflix's Spinnaker).
- Best for: high-traffic, high-risk changes where you want statistical confidence before a full rollout.

| Strategy | Blast radius | Rollback speed | Infra cost | Needs traffic-splitting router? |
|----------|--------------|-----------------|------------|-----------------------------------|
| Rolling | Medium (partial mix during rollout) | Medium | None extra | No |
| Blue-green | Low (all-or-nothing switch) | Instant | 2x during cutover | Yes (simple switch) |
| Canary | Lowest (small controlled slice) | Fast | Small extra | Yes (weighted/gradual) |

### Feature flags — decoupling deployment from release

A **feature flag** (or feature toggle) is a runtime switch that determines whether a code path is active, independent of whether it has been deployed. This is the mechanism that lets teams practice Continuous Deployment safely even for risky or half-finished features: the code ships to production behind a flag that is off, and turning it on for 1% of users, then 100%, is a config change — not a redeploy.

~~~text
Deployment: "the code is running in production" (a CI/CD concern)
Release:    "users can see/use the new behavior" (a feature-flag concern)

Deploy != Release. Feature flags are what makes that gap intentional and controllable.
~~~

This matters for rollback too: if a flagged feature misbehaves, turning the flag off is instant and doesn't require a pipeline run at all — strictly faster than any deployment-strategy rollback above.

### Pipeline security as an advanced discipline

- **Never print secrets in logs.** CI systems mask known secret values in log output, but that masking only works for secrets registered as such — a secret concatenated into a different string or echoed via a debug command can leak. Treat pipeline logs as a public artifact.
- **Least-privilege pipeline credentials.** A pipeline that deploys to production does not need the same credentials as one that only runs unit tests. Scope credentials per job/stage/environment, and prefer short-lived, federated credentials (OIDC token exchange with the cloud provider) over long-lived static keys stored as secrets — a leaked OIDC token expires in minutes; a leaked static key is valid until manually rotated.
- **Signing and verifying artifacts.** Sign the artifact (container image or package) at build time with a tool like cosign/Sigstore, and verify the signature before it is allowed to deploy — this defends against a compromised registry or a man-in-the-middle artifact swap between CI and CD. The **SLSA** framework formalizes levels of supply-chain integrity guarantees a pipeline can achieve.
- **Dependency/SCA scanning stage.** A Software Composition Analysis stage scans third-party dependencies for known CVEs before packaging — see the **SQL Injection** and **OWASP Top 10** skills for the kinds of vulnerabilities this and static analysis (SAST) stages are looking for, and the **Secrets Management** skill for how the vault integration this depends on actually works.

### Concurrency, idempotency, and the expand/contract pattern

Pipelines run stages in parallel wherever there's no dependency between them (lint and unit-test can run concurrently; package must wait for both). Deploy scripts must be **idempotent** — running the same deploy twice (say, after a network blip mid-run) must not corrupt state or double-apply a change.

Database schema changes are the hardest idempotency/rollback problem in CD, because you generally cannot "roll back" a destructive migration the way you roll back application code. The standard pattern is **expand/contract**: (1) expand — add the new column/table alongside the old, deploy code that writes to both; (2) migrate data; (3) contract — once the new path is proven, deploy code that only uses the new schema, then drop the old column. Every step is independently deployable and rollback-safe, because at no point does a rollback require un-doing a destructive schema change.

### Decision table: choosing a deployment strategy

| System characteristic | Lean toward |
|------------------------|-------------|
| High traffic, high blast-radius risk | Canary |
| Need instant, guaranteed-clean rollback | Blue-green |
| Cost-sensitive, moderate risk tolerance | Rolling |
| Stateful/schema-coupled release | Expand/contract regardless of the above, often combined with rolling |
| Feature is experimental or partial | Feature flag, independent of deployment strategy |
`,

  "internal-working": `
Under the hood, every CI/CD system — regardless of vendor — implements the same loop. A **controller** (the CI/CD server's brain) watches for git events, a **scheduler** assigns pipeline runs to **agents/runners** (ephemeral VMs or containers), each stage executes in an isolated workspace, and results flow back to both the git host (as a commit status) and, on success, to the deployment side of the system.

~~~mermaid
flowchart TB
    Dev["Developer pushes commit"] --> Hook["Git host sends webhook\n(push / PR / tag event)"]
    Hook --> Ctrl["CI/CD controller\n(receives event, resolves pipeline config)"]
    Ctrl --> Sched["Scheduler assigns run\nto an available agent/runner"]
    Sched --> Runner["Ephemeral runner\n(fresh container or VM)"]
    Runner --> Checkout["Checkout exact commit\ninto a clean workspace"]
    Checkout --> Exec["Execute stages in order:\nlint -> build -> test -> scan -> package"]
    Exec --> Status["Report status back to git host\n(pass/fail shown on the commit/PR)"]
    Exec --> Reg["Push artifact to registry\n(only on success)"]
    Reg --> CD["CD stage: pull artifact,\napply deployment strategy to target env"]
    CD --> Health["Post-deploy health/smoke checks"]
    Health -->|healthy| Done["Deployment marked complete"]
    Health -->|unhealthy| Rollback["Automatic or manual rollback"]
~~~

Step by step:

1. **Trigger.** The git host (or a scheduled timer, or a manual "run" click) fires an event. The controller resolves which pipeline definition applies — usually a file checked into the repository at a known path (pipeline-as-code).
2. **Scheduling.** The controller queues the run and assigns it to an available runner. Modern systems (GitHub-hosted runners, Kubernetes-based Jenkins agents) spin up a **fresh, ephemeral** environment per run specifically so one run's leftover state can never contaminate the next — a direct fix for the "works on my machine" class of bug.
3. **Checkout.** The runner clones the repository at the exact commit SHA that triggered the event — never "whatever main happens to be" at execution time, which matters because main can move between trigger and execution.
4. **Stage execution.** Stages run in dependency order; independent stages run in parallel where the pipeline definition allows it. Each stage's exit code determines pass/fail; the pipeline stops (or marks failed) at the first hard failure by default.
5. **Status reporting.** The result is written back to the git host's API as a **commit status** or **check run**, which is what powers branch-protection rules ("require status checks to pass before merging").
6. **Artifact publication.** Only on full pipeline success is the artifact pushed to the registry — an unsigned, untested artifact should never be a deployable candidate.
7. **CD handoff.** A separate (often GitOps-style, pull-based) process picks up the new artifact version and applies it to the target environment using whichever deployment strategy the environment is configured for, then runs smoke tests and either finalizes or rolls back.
`,

  architecture: `
### Control-plane architecture of a CI/CD system

Every CI/CD platform, whatever its branding, is built from the same components:

~~~mermaid
flowchart LR
    subgraph ControlPlane["Control plane"]
        API["API server / webhook receiver"]
        Sched["Scheduler / queue"]
        UI["Dashboard & logs UI"]
    end
    subgraph Runners["Runner pool (ephemeral)"]
        R1["Runner 1 (container/VM)"]
        R2["Runner 2"]
        RN["Runner N (autoscaled)"]
    end
    Git["Git host\n(webhooks + commit-status API)"] <--> API
    API --> Sched
    Sched --> R1 & R2 & RN
    R1 & R2 & RN --> Reg[("Artifact registry")]
    R1 & R2 & RN --> Vault[("Secrets store")]
    R1 & R2 & RN --> UI
    Reg --> CD["CD controller / GitOps agent"]
    CD --> Targets[("Deploy targets:\nKubernetes, VMs, serverless")]
~~~

The control plane never runs your build steps itself — it schedules them onto disposable runners, which is deliberate: a compromised or crashed runner cannot take down the scheduling system, and runner capacity can scale independently (see Scalability).

### Structuring an application around CI/CD

Applications that are easy to build a good pipeline around share a shape:

~~~text
myservice/
├── .ci/  or  .github/workflows/  or  Jenkinsfile   # pipeline-as-code, versioned with the app
├── src/                     # application code
├── tests/
│   ├── unit/                # fast, no external dependencies — runs on every commit
│   └── integration/         # slower, real dependencies — runs pre-merge/nightly
├── Dockerfile               # deterministic, reproducible packaging (see Docker skill)
├── infra/                   # Terraform/IaC for the environments this deploys into
└── config/                  # per-environment config, no secrets committed
~~~

Rules that make this structure pipeline-friendly: configuration is injected via environment variables or a secrets store, never hardcoded (12-factor app principle); the test suite is explicitly split by speed so the pipeline can gate on fast tests and run slow ones separately; the Dockerfile builds a deterministic image so "build once, promote everywhere" actually holds; and infrastructure changes (see the **Terraform** skill) are reviewed and applied through the same pipeline discipline as application code, not by hand.
`,

  "data-flow": `
Tracing one commit from a developer's machine all the way to production makes the whole page concrete:

~~~mermaid
flowchart TD
    A["Developer commits & pushes\nto a short-lived branch"] --> B["Pull request opened"]
    B --> C["Webhook fires -> CI pipeline triggered"]
    C --> D["Checkout exact commit SHA"]
    D --> E["Lint / static analysis"]
    E --> F["Build"]
    F --> G["Unit tests"]
    G --> H["Integration tests"]
    H --> I["Security scan: SAST + dependency/SCA"]
    I --> J["Package: build immutable artifact\n(e.g. container image) - see Docker skill"]
    J --> K["Push artifact to registry, tagged with commit SHA"]
    K --> L["PR reviewed & merged to main\n(branch protection requires all above green)"]
    L --> M["Deploy to staging\n(Terraform applies infra if needed - see Terraform skill)"]
    M --> N["Automated smoke test against staging"]
    N --> O{"Manual approval gate?"}
    O -->|Continuous Delivery: yes| P["Human clicks 'deploy to production'"]
    O -->|Continuous Deployment: no gate| Q["Automatic promotion"]
    P --> R["Deploy to production\nusing chosen strategy: blue-green / canary / rolling"]
    Q --> R
    R --> S["Post-deploy health checks"]
    S -->|healthy| T["Deployment recorded:\nfeeds DORA metrics - deployment frequency, lead time"]
    S -->|unhealthy| U["Automatic rollback\n(feeds change-failure-rate & MTTR metrics)"]
~~~

The two forks in this diagram are exactly the two "confusing" concepts from Beginner Concepts made concrete: the artifact built at step J is the SAME artifact deployed at steps M and R (never rebuilt), and the branch at step O is precisely what separates Continuous Delivery (a human decides) from Continuous Deployment (nothing waits for a human). Everything downstream of a failed health check at step S is what the Deployment Strategies and Feature Flags material in Advanced Concepts exists to make cheap and fast.
`,

  "production-usage": `
### Where pipeline config actually lives

Real teams commit pipeline definitions alongside the application code they build — a .github/workflows directory, a Jenkinsfile at the repo root, a .gitlab-ci.yml, or equivalent. This platform's **GitHub Actions** and **Jenkins** skills cover the exact syntax; what's universal is that the file is reviewed in pull requests exactly like application code, because a bad pipeline change (e.g., accidentally disabling the test gate) is a production incident waiting to happen.

### Branch protection and required checks

Production repositories configure **branch protection rules**: a pull request cannot merge into main until specific pipeline checks report success, and often until a required number of human reviewers approve. This is the mechanism that turns "we have a CI pipeline" into "it's actually impossible to merge broken code" — a pipeline that runs but doesn't gate merges is closer to documentation than enforcement.

### Secrets and credentials

Pipeline secrets (cloud credentials, API keys, database passwords) are stored in the CI/CD platform's own secret store or an external vault (HashiCorp Vault, AWS Secrets Manager) — never in the pipeline-as-code file itself, and never in application config files committed to git. See the **Secrets Management** skill for the vault-side mechanics; this page's Security section covers the pipeline-side handling (masking, least privilege, OIDC).

### Runners: hosted vs self-hosted

- **Hosted runners** (provided by the CI vendor): zero maintenance, billed per minute, generous default capacity — the default choice for most teams.
- **Self-hosted runners**: required when the pipeline needs access to a private network, specialized hardware (GPUs for ML training jobs), or when hosted-runner cost at scale exceeds running your own fleet. Self-hosted runners are also the reason "poisoned pipeline execution" attacks matter more — a self-hosted runner often has more standing network access than an ephemeral hosted one.

### Caching, matrix builds, and monorepos

- **Dependency caching** (package manager caches, container layer caches) is the single biggest lever on pipeline duration for most projects.
- **Matrix builds** run the same pipeline across a grid of variables (multiple OS versions, multiple language runtime versions) in parallel — essential for libraries that must support several environments.
- **Monorepos** need "affected project" detection (build graph analysis) so a change to one service doesn't trigger a full rebuild/test of every unrelated service in the repository — otherwise pipeline duration grows with total repo size instead of change size.

### Scheduled and on-demand pipelines

Not every pipeline run is triggered by a commit: nightly full regression/e2e suites, scheduled dependency-update scans, and on-demand "redeploy this exact artifact" runs (for rollback, or promoting a specific staging build to production) are all standard operational patterns in mature setups.
`,

  "industry-examples": `
- **Etsy** — one of the earliest and most publicized adopters of continuous deployment at scale; famously deployed to production dozens of times a day, and built internal tooling (Deployinator) specifically to make deployment a routine, low-drama, frequent event rather than a scheduled ritual.
- **Amazon** — internally reports deploying changes on a continuous basis across tens of thousands of services, using internal pipeline tooling (historically "Apollo" and related systems) that enforces automated testing and staged rollouts before any change reaches customer-facing production.
- **Netflix** — built and open-sourced **Spinnaker**, a continuous delivery platform purpose-built for automated canary analysis: it compares real-time metrics between a canary deployment and the baseline and automatically decides whether to proceed or roll back, without a human watching a dashboard.
- **Google** — operates one of the largest monorepos in the industry with trunk-based development as policy, not preference; nearly all engineers commit directly to a shared trunk multiple times a day, which is only tractable because of massive investment in build-graph-aware, "test only what changed" CI infrastructure.
- **Meta (Facebook)** — practices trunk-based development combined with heavy feature-flagging (their internal "Gatekeeper" system) so that code ships to production continuously while individual features are released to users gradually and independently of the deploy itself — the clearest large-scale example of the deploy-vs-release distinction from Advanced Concepts.
- **Flickr** — the 2009 "10+ Deploys Per Day" talk by John Allspaw and Paul Hammond documented Flickr's own pipeline and organizational practices, and is widely cited as the moment the wider industry began treating frequent, automated deployment as a competitive advantage rather than a risk to be minimized.
`,

  "best-practices": `
1. **Commit to trunk frequently, in small increments.** Small diffs are easier to review, easier to test, and — if something goes wrong — trivially easy to identify and revert. This is the practice that makes every other item on this list tractable.
2. **Keep the PR-blocking pipeline fast (aim under ~10–15 minutes).** A slow gate gets bypassed under pressure or simply ignored; speed is a prerequisite for the gate being respected, not a nice-to-have.
3. **Order stages cheapest-and-fastest-first.** Lint before build before unit test before integration test before slow e2e — fail fast, waste as little compute and developer waiting time as possible.
4. **Build the artifact once; promote the identical artifact through every environment.** Never rebuild per environment — that reopens the exact "works in staging, broke in prod" gap CI/CD exists to close.
5. **Treat the pipeline definition as code**: version it, review changes to it in pull requests, and test changes to it (many platforms support a dry-run/lint mode for the pipeline file itself).
6. **Enforce environment parity between staging and production** wherever realistically possible — config differences are fine; architectural or dependency-version differences defeat the purpose of staging.
7. **Automate rollback, don't just automate forward deployment.** A team that has only ever practiced deploying forward will be slow and error-prone the first time they need to go backward under pressure.
8. **Scope pipeline credentials per environment with least privilege**, preferring short-lived federated credentials (OIDC) over long-lived static secrets.
9. **Decouple deploy from release with feature flags** for anything risky, partial, or reversible-by-config rather than by redeploy.
10. **Monitor the pipeline itself**, not just the application: build duration trends, flaky-test rate, and queue wait time are leading indicators of a delivery process about to slow everyone down.
11. **Require passing pipeline checks plus code review before merge**, enforced by branch protection — a pipeline that can be bypassed is a pipeline that will be bypassed exactly when it matters most.
12. **Prefer trunk-based development with short-lived branches** — it is the branching model that makes CI's core promise (test against what everyone else is doing) actually true.
`,

  "anti-patterns": `
### Long-lived feature branches merged monthly

~~~text
WRONG: branch "big-feature" lives for 6 weeks, diverging further from main every day,
       merged in one large, high-risk PR right before a release deadline.

RIGHT: the same feature is built behind a feature flag, merged to main in small pieces
       every day or two, kept off for users until it's ready — integration risk stays
       constant instead of compounding.
~~~

### Rebuilding the artifact per environment

~~~text
WRONG: "build for staging" and "build for production" are separate pipeline runs that
       compile/package independently — a dependency resolving to a different version
       between the two runs means staging never actually validated what ships.

RIGHT: build ONE artifact, tag it with the commit SHA, push it once to the registry,
       and have staging and production both deploy that exact same tag/digest.
~~~

### Secrets hardcoded in pipeline config

~~~text
WRONG: pipeline.yml contains  API_KEY: "sk-abc123..."  committed directly to git history.

RIGHT: pipeline.yml references a named secret resolved at runtime from the platform's
       secret store or an external vault — the value never appears in the repository
       or, ideally, in plaintext logs.
~~~

### Manual, undocumented deploy scripts

Deploying via an engineer SSHing into a box and running a personally-remembered sequence of commands means the process only exists in one person's head, cannot be reviewed, and cannot be safely delegated. Every deploy action should be a pipeline stage, checked into version control.

### Skipping or disabling failing tests to "unblock" a merge

Commenting out or skip-marking a failing test to get a PR through is technical debt with a very short fuse: it silently deletes a piece of the safety net exactly at the moment someone needed it to work. The correct response to a failing test blocking an urgent merge is to fix the test or the code — never to mute the signal.

### One giant monolithic pipeline job

A single job that does lint + build + every test + deploy sequentially, with no parallelism and no early exit, wastes both compute and developer time; independent stages (lint and unit tests, for instance) should run concurrently, and the pipeline should be structured so unrelated failures don't block unrelated work.

### Deploying on Friday afternoon with no rollback plan

Not a CI/CD mechanism failure but a process anti-pattern this page's mechanisms exist to fix: with a real deployment strategy, automated smoke tests, and a tested rollback path, the day of the week should not matter. If it still does at your organization, that is a signal the automation isn't trustworthy yet.
`,

  performance: `
### Measure before optimizing

- **Per-stage timing breakdown** in the pipeline dashboard — know exactly which stage is the bottleneck before changing anything.
- **Cache hit-rate metrics** for dependency and layer caches — a cache that silently stops hitting is one of the most common causes of a pipeline "getting slower for no reason."
- **Queue wait time** separate from execution time — a pipeline that runs fast but waits ten minutes for a free runner has a capacity problem, not a stage-efficiency problem.

### The optimization hierarchy, in order

1. **Parallelize independent stages.** Lint and unit tests usually have no dependency on each other; running them concurrently instead of sequentially is close to free and often the single biggest win available.
2. **Cache dependencies aggressively.** Package manager caches and container build-layer caches routinely turn a 5–10 minute dependency-install step into a 10–20 second cache restore.
3. **Shard/split the test suite across parallel runners.** Splitting a 20-minute test suite across 4 runners running concurrently gets wall-clock time close to 5 minutes, at the cost of 4x the compute — usually a good trade for developer feedback speed.
4. **Build incrementally in monorepos.** Only rebuild and test the projects actually affected by a change (via a dependency graph), rather than the whole repository — this keeps pipeline duration proportional to change size, not repo size.
5. **Right-size runner compute.** CPU-bound compilation steps benefit from bigger runners; most other steps don't, so blindly upgrading runner size everywhere wastes money without helping the real bottleneck.
6. **Move slow, low-value-per-run tests out of the PR-blocking gate.** Full end-to-end/UI suites that take 30+ minutes belong in a nightly or pre-release pipeline, not blocking every single commit.
7. **Pre-warm build environments/images.** Cold-start time for a fresh runner or container can dominate total duration for very short pipelines; a pre-warmed base image removes that fixed cost.

Rough industry benchmarks worth anchoring to: a PR-blocking gate that finishes in under 10–15 minutes keeps a pipeline "trusted and used"; elite-performing teams per the DORA research report **lead time for changes** (commit to production) under one hour, which is only achievable when the pipeline itself is a small fraction of that budget.
`,

  scalability: `
CI/CD infrastructure has to scale along two independent axes: how much can run **at once** (concurrent pipeline runs across the whole organization) and how fast **one** pipeline finishes.

### Vertical and horizontal scaling of runners

- **Vertical**: give an individual runner more CPU/RAM for compute-heavy steps (large compilations, ML model builds).
- **Horizontal**: run more pipelines concurrently by autoscaling the runner pool — ephemeral, container- or Kubernetes-based runners that scale out under queue pressure and scale back to zero when idle are the standard modern pattern, replacing a fixed pool of always-on build machines.

~~~mermaid
flowchart LR
    Queue["Pipeline run queue"] --> Auto["Autoscaler"]
    Auto -->|scale out under load| Pool["Runner pool\n(ephemeral containers/VMs)"]
    Auto -->|scale to zero when idle| Pool
    Pool --> Cost["Cost tracks actual usage,\nnot a fixed always-on fleet"]
~~~

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Shared runner queue contention across teams | Autoscaling ephemeral runner pools; per-team or per-priority queues |
| Monorepo full-suite runs on every commit | Build-graph "affected projects" detection; incremental/selective test execution |
| Artifact registry throughput under load | Regional registry mirrors/caches close to deploy targets |
| Database migration coupled to every deploy | Decouple via expand/contract (see Advanced Concepts) so schema changes aren't a per-deploy bottleneck |
| Flaky tests slowing everyone down with reruns | Dedicated flaky-test detection/quarantine process (see Monitoring) |
| Secrets/vault requests bottlenecking many concurrent runs | Short-lived cached credentials per run, rate-limit-aware vault clients |

The general lesson: almost every CI/CD scaling problem is solved by making runners disposable and elastic, and by making the unit of work (what gets tested/built) proportional to what actually changed rather than the size of the whole codebase.
`,

  security: `
### Attack surface specific to pipelines

- **Secrets leaking through logs.** Log masking only redacts values the platform recognizes as secrets; a secret transformed, base64-encoded, or echoed via a debug command can bypass masking. Treat every pipeline log as effectively public.
- **Poisoned Pipeline Execution (PPE).** A pull request from an untrusted fork can, on some platforms, trigger pipeline code that runs with access to the base repository's secrets unless explicitly restricted — this is why "require approval to run workflows on fork PRs" exists and should be enabled.
- **Compromised third-party actions/plugins.** A pipeline that pulls in a community-maintained action or Jenkins plugin is trusting that dependency with everything the pipeline can touch, including secrets. Pin third-party pipeline dependencies to an exact, reviewed commit SHA — not a mutable tag — the same way you'd pin a supply-chain-sensitive package dependency.
- **Overly broad pipeline credentials.** A single set of credentials with production access, used by every job regardless of what that job actually does, means any compromised stage — even a "harmless" lint job — inherits production blast radius.
- **Unsigned or tampered artifacts.** Without signing, nothing proves the artifact a deploy stage pulls from the registry is the exact one CI produced and tested.
- **Dependency confusion / typosquatting.** Malicious packages published under names similar to internal or popular packages can be pulled in by an unpinned or misconfigured package resolution step.

### Defenses

1. **Never print secrets; scrub debug output before enabling verbose logging in a pipeline that touches real credentials.**
2. **Least-privilege, environment-scoped credentials** — a job that only runs unit tests should not hold production deploy credentials, full stop.
3. **Prefer short-lived, federated credentials (OIDC token exchange with the cloud provider)** over long-lived static keys stored as pipeline secrets; see the **AWS**, **Azure**, and **GCP** skills for each provider's OIDC federation mechanics.
4. **Pin third-party pipeline actions/plugins to a specific commit SHA**, and review updates the same way you'd review a dependency bump.
5. **Require explicit approval before running pipeline jobs triggered by untrusted fork pull requests**, especially any job with access to secrets.
6. **Sign build artifacts (cosign/Sigstore) and verify the signature before any deploy stage will accept them** — pursue the SLSA framework's provenance levels as a maturity target.
7. **Run a dependency/SCA scanning stage** (tools like Trivy, Snyk, or platform-native Dependabot-style scanners) before packaging, to catch known-CVE dependencies before they ship.
8. **Run SAST (static application security testing) as a pipeline stage** to catch classes of vulnerability like SQL injection and XSS before merge — see the **SQL Injection** and **OWASP Top 10** skills for the vulnerability classes these scans target.
9. **Store all pipeline secrets in a proper secret manager/vault, never in the pipeline-as-code file or application config** — see the **Secrets Management** skill for the vault side of this contract in depth.

Pipeline security is ultimately supply-chain security: the pipeline is the one system with privileged access to both your source code and your production credentials, which makes it one of the highest-value targets in the whole stack, not an afterthought bolted on at the end.
`,

  testing: `
### The testing pyramid, expressed as pipeline stages

A pipeline is, structurally, an ordered set of increasingly expensive filters against increasingly realistic conditions:

~~~yaml
stages:
  - unit-test          # milliseconds-to-seconds each; no network, no DB; runs on every commit
  - integration-test    # seconds-to-minutes; real DB/queue/API, often containerized (see Docker skill)
  - contract-test        # verifies a service's API still matches what its consumers expect
  - security-scan          # SAST (code) + SCA (dependencies)
  - e2e-test                # slow, full-stack; often a smaller subset on PRs, full suite nightly
  - smoke-test               # a handful of critical-path checks run immediately after deploy
  - canary-analysis           # production traffic comparison during a gradual rollout (see Advanced Concepts)
~~~

### Testing the pipeline itself

Senior teams also test the pipeline definition, not just the application: lint the pipeline-as-code file for syntax errors before it merges, and dry-run pipeline changes against a non-production branch before trusting them against main. A broken pipeline change that silently disables the test gate is a production incident with a delay fuse.

### Senior testing doctrine for CI/CD specifically

- **The PR-blocking suite must stay fast.** If it grows past ~10–15 minutes, split slower tests (full e2e, load tests) into a separate nightly or pre-release pipeline rather than letting the merge gate rot into something everyone dreads waiting on.
- **Flaky tests are a first-class problem, not noise.** A test that fails intermittently for reasons unrelated to the code under test erodes trust in the entire gate; quarantine it (mark it non-blocking) immediately and track fixing it as real work — see Monitoring for flaky-test-rate as a tracked metric.
- **Smoke tests after deploy are not optional.** A pipeline that reports "deployed successfully" the moment the process starts, without confirming the service actually responds correctly, has not really verified the deployment.
- **Canary analysis is a form of production testing.** Comparing real traffic metrics between old and new versions during a gradual rollout catches classes of regression (performance under real load, edge-case data) that no pre-production test environment reliably reproduces.
`,

  debugging: `
### Escalation path for a failing or flaky pipeline

1. **Read the log from the first failure, not the last line.** A pipeline can print a great deal of noise after the actual failing command; the first non-zero exit or first assertion failure is almost always the real signal.
2. **Reproduce locally using the exact same command and environment the pipeline uses** (often the same Docker image) — if it fails identically locally, you've isolated it from pipeline infrastructure issues; if it passes locally, suspect an environment difference (missing env var, different dependency version, caching).
3. **Re-run with verbose/debug logging enabled** for that specific stage — most CI platforms support a debug/rerun-with-more-logging option without needing a new commit.
4. **Open an interactive debug session on the failed runner** (an SSH-into-runner or tmate-style session, supported by most modern CI platforms) when logs alone don't explain the failure — this is the closest equivalent to attaching a debugger to a live process.
5. **git bisect across recent commits** if a test started failing but it's unclear exactly which change introduced the regression, especially after a batch of merges.
6. **Check the CI/CD platform's own status page and queue metrics** before assuming the failure is your code — infrastructure incidents on the CI provider's side are a real and common cause of otherwise-unexplained failures.
7. **Check the flaky-test dashboard/history** (see Monitoring) before spending time debugging what might already be a known-flaky test — rerunning once to confirm flakiness is faster than a deep investigation into passing code.

### Debugging a bad production deployment specifically

For a deployment (not a build) failure, escalate through: check post-deploy smoke test output first, then compare the new version's error rate/latency against the pre-deploy baseline (this is exactly what canary analysis automates), then check whether the deployment strategy's rollback path (revert the router, scale rolling update backward, flip blue-green back) has already been triggered automatically — and if not, trigger it manually rather than debugging live in production under user impact.
`,

  monitoring: `
### The DORA four keys — measuring the pipeline's real-world outcomes

The DORA (DevOps Research and Assessment) research program identified four metrics that correlate strongly with both software delivery performance and organizational performance:

| Metric | Definition | How it's typically measured |
|--------|------------|-------------------------------|
| **Deployment frequency** | How often code successfully deploys to production | Count of production deploy events per day/week, from pipeline deployment records |
| **Lead time for changes** | Time from a commit landing to that commit running in production | Timestamp diff: commit time -> successful production deploy time |
| **Change failure rate** | Percentage of deployments that cause a production failure requiring remediation | Failed/rolled-back deploys ÷ total deploys, over a time window |
| **Mean time to recovery (MTTR)** | How long it takes to restore service after a production incident | Incident-start to incident-resolved timestamp diff, averaged |

Elite performers (per DORA's published research) deploy on demand, multiple times a day, with lead times under an hour, change failure rates in the low single digits, and MTTR measured in minutes to under an hour — low performers deploy monthly-to-quarterly with lead times of months and MTTR measured in days.

### Pipeline health metrics (leading indicators, not lagging like DORA)

~~~text
Track over time, per pipeline/repository:
  - build duration (p50/p95) and trend
  - success rate (% of runs that pass without rerun)
  - flaky-test rate (tests that fail then pass on immediate rerun, same commit)
  - queue wait time before a runner picks up the job
~~~

### Instrumentation example

~~~yaml
# Emitting a deployment event for DORA metric calculation — conceptual, tool-agnostic
on-deploy-success:
  emit-metric:
    name: deployment_completed
    tags:
      service: payments-api
      commit-sha: from-pipeline-context
      environment: production
      timestamp: now
~~~

Feed these events into whatever the team already uses for metrics (Prometheus, a data warehouse, a dashboard tool) — see the Observability category on this platform for the instrumentation patterns this reuses. A team that cannot answer "how many times did we deploy last week, and how long did it take from commit to production" cannot meaningfully argue their CI/CD investment is working.
`,

  deployment: `
### A production-grade pipeline definition, annotated line by line

The exact YAML syntax for a real tool is covered in the **GitHub Actions** and **Jenkins** skills; below is the platform-agnostic shape every real production pipeline follows, with the reasoning behind each part:

~~~yaml
name: service-pipeline                 # human-readable identifier for the dashboard

on:
  push:
    branches: [main]                   # trunk-based: trigger on every merge to main
  pull_request: {}                     # also trigger on every PR update — feedback before merge

env:
  REGISTRY: registry.internal.example  # centralize config that every stage needs

jobs:
  verify:                              # cheap, fast checks first — fail fast
    steps:
      - lint
      - unit-test
      - integration-test
      - security-scan: [sast, sca]     # catch vulnerabilities before packaging

  package:
    needs: verify                      # only package if verification passed
    steps:
      - build-artifact                 # one immutable artifact, tagged with commit SHA
      - sign-artifact                  # cosign/Sigstore — provenance for the deploy gate to check
      - push-to-registry

  deploy-staging:
    needs: package
    environment: staging               # environment-scoped credentials, least privilege
    steps:
      - verify-artifact-signature       # refuse unsigned/tampered artifacts
      - apply-infra-if-needed           # see the Terraform skill for this stage in depth
      - deploy: rolling                 # cheap strategy for a low-stakes environment
      - smoke-test

  approval-gate:
    needs: deploy-staging
    type: manual                        # PRESENT: Continuous Delivery. ABSENT: Continuous Deployment.

  deploy-production:
    needs: approval-gate
    environment: production             # separate, tighter-scoped credentials than staging
    steps:
      - deploy: canary                   # smallest blast radius for the highest-stakes environment
      - automated-canary-analysis
      - promote-to-100-percent-or-rollback
~~~

Why each choice matters: verification runs before packaging so a broken build never becomes a candidate artifact at all; the artifact is built and signed exactly once and reused unchanged through both environments; staging and production use different deployment strategies deliberately (rolling is cheap and fine where mistakes are low-cost, canary is worth its extra complexity where mistakes are expensive); the approval gate is the single line in this whole file that decides whether this is Continuous Delivery or Continuous Deployment; and credentials are scoped per environment block so a staging-only credential leak cannot reach production.

### Deployment strategy at the infrastructure layer

However the strategy is expressed, it ultimately configures a load balancer, service mesh, or orchestrator (see the **Kubernetes** skill for how rolling updates and canary weights are actually implemented at that layer, and the **Docker** skill for the artifact these stages deploy).
`,

  "production-checklist": `
Before a CI/CD pipeline is trusted with real production traffic:

- [ ] Pipeline definition is version-controlled (pipeline-as-code), reviewed like application code
- [ ] Branch protection requires all pipeline checks to pass before merge
- [ ] Stages are ordered cheapest/fastest first; PR-blocking gate finishes in under ~15 minutes
- [ ] Build artifact is produced exactly once and promoted unchanged through every environment
- [ ] Artifacts are signed at build time and signature-verified before any deploy stage
- [ ] Pipeline credentials are scoped per environment with least privilege; production credentials are separate from staging
- [ ] Secrets are pulled from a vault/secret store at runtime — none are hardcoded in pipeline files or logs
- [ ] Third-party pipeline actions/plugins are pinned to exact reviewed commits, not mutable tags
- [ ] Fork/untrusted PRs cannot run pipeline stages with access to secrets without explicit approval
- [ ] A dependency/SCA scan and a SAST scan both run before packaging
- [ ] A defined deployment strategy (rolling/blue-green/canary) is configured per environment, matched to that environment's risk profile
- [ ] Automated smoke tests run immediately after every deploy, before it's considered complete
- [ ] Rollback is automated (or at minimum, a documented, tested, one-command manual path) and has actually been exercised, not just designed
- [ ] Feature flags exist for any risky or partial feature so deploy and release can be decoupled
- [ ] DORA metrics (deployment frequency, lead time, change failure rate, MTTR) are actually being measured, not just discussed
- [ ] Flaky tests are tracked and quarantined rather than silently rerun-until-green
`,

  "common-mistakes": `
1. **Confusing Continuous Delivery with Continuous Deployment** — even in production conversations, not just interviews. Saying "we do continuous deployment" when there's actually a manual approval gate misleads incident postmortems and capability planning; the presence or absence of that one gate changes what "safe to release" even means for the team.
2. **Treating the pipeline as done once it's green, without ever measuring its own health.** A pipeline that passes but takes 45 minutes and reruns flaky tests three times a week is quietly costing the team hours daily — invisible because nobody's tracking build duration trend or flaky-test rate.
3. **Letting long-lived branches accumulate** because "we'll integrate CI properly later." CI's entire value proposition requires frequent integration; bolting automated tests onto a feature-branch-heavy workflow gets you automated testing, not the integration-risk reduction CI is actually for.
4. **Rebuilding the artifact per environment** "just to be safe" — this reintroduces the exact drift risk (staging validated a different build than what ships) that build-once-promote-everywhere exists to eliminate.
5. **Storing production secrets with the same access scope as CI test secrets.** It's convenient to have one secret store entry reused everywhere, and it's exactly how a compromised lint job becomes a production breach.
6. **No tested rollback path.** Teams design forward deployment carefully and assume rollback "just works" by symmetry — it often doesn't, especially across a schema migration, and the first time anyone actually tries it should not be during a live incident.
7. **Ignoring flaky tests instead of quarantining and fixing them.** Every flaky test that gets "rerun until green" trains engineers to distrust the whole pipeline, which eventually leads to real failures getting rerun-and-ignored too.
8. **Deploying database migrations in lockstep with application code** without expand/contract, making every deploy a higher-stakes, harder-to-roll-back event than it needs to be.
9. **Granting broad, static, long-lived cloud credentials to the pipeline** instead of adopting OIDC/short-lived federated credentials, because the initial setup is more work — this is consistently one of the highest-leverage security gaps in real pipelines.
10. **Measuring "how many pipelines do we have" instead of DORA outcomes.** Pipeline count and green-checkmark rate are vanity metrics; deployment frequency, lead time, change failure rate, and MTTR are the numbers that actually correlate with delivery performance.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|-----------------|-----|
| Pipeline passes locally but fails in CI | Environment difference — dependency version, missing env var, different OS | Reproduce with the exact image/command the pipeline uses; pin dependency versions |
| Test fails intermittently, passes on rerun with no code change | Flaky test — timing assumption, shared test-order dependency, real race condition | Quarantine as non-blocking, track and fix root cause; never leave it silently blocking merges long-term |
| Secret appears in plaintext in logs | Secret value transformed/echoed in a way the platform's masking doesn't recognize | Avoid printing secret-derived values even indirectly; use the platform's secret-reference syntax, not raw variable interpolation into echo/debug commands |
| Deploy stage fails: artifact signature invalid | Artifact rebuilt or repackaged after signing, or signing step misconfigured | Sign only the final immutable artifact; verify signing/verification keys match across build and deploy stages |
| Pipeline stuck in queue for a long time | Runner pool exhausted / autoscaler misconfigured | Check runner pool capacity and autoscaling policy; consider per-team/priority queues |
| Rolling deploy stuck mid-rollout, some pods old/some new | New version failing health checks, orchestrator paused the rollout | Check new version's logs/health endpoint directly; roll back rather than waiting indefinitely |
| Production incident right after a deploy, but change-failure attribution unclear | No correlation between deploy events and incident timeline | Emit and retain deployment events with commit SHA/timestamp; correlate against monitoring/incident timestamps |
| Fork PR pipeline run has no access to needed secrets | Correct, intentional platform security default (prevents PPE attacks) | Do not bypass this by exposing secrets to fork PRs; use a separate, restricted job for anything a fork PR genuinely needs |
| Dependency scan blocks build on a low-severity CVE with no available fix | Overly strict default severity gate | Triage and explicitly accept/waive with an expiry date and owner, don't just disable scanning |
`,

  faqs: `
**Q: Is Continuous Deployment always better than Continuous Delivery?**
No. Continuous Deployment requires very high confidence in automated testing and rollback, because no human reviews the final release decision. Regulated industries, or systems where a bad release is extremely costly, often deliberately keep a manual approval gate (Continuous Delivery) even with a fully automated pipeline otherwise — the gate is a business/risk decision, not a maturity failure.

**Q: Do I need Kubernetes to do CI/CD properly?**
No. CI/CD predates Kubernetes by over a decade and works fine against VMs, serverless functions, or even a single server. Kubernetes makes some deployment strategies (canary, rolling) more standardized to implement, but it's an implementation detail of the "deploy" stage, not a prerequisite for the practice.

**Q: What's the difference between CI/CD and DevOps?**
DevOps is a broader cultural and organizational philosophy (shared ownership between development and operations, blameless postmortems, etc.); CI/CD is one of DevOps's core technical practices — arguably the most concrete and most directly automatable one. You can implement CI/CD without fully "doing DevOps," but mature DevOps organizations virtually always have mature CI/CD.

**Q: Why does the pipeline need to test AND scan for security AND run smoke tests — isn't that redundant?**
Each stage catches a different class of problem: tests verify intended behavior, security scans catch known vulnerability patterns in code and dependencies (a different concern from correctness), and smoke tests verify the deployed instance is actually running and reachable (a different concern from both). Overlap in coverage is a feature — defense in depth — not waste.

**Q: How fast should a pipeline be?**
The PR-blocking portion should aim for well under 15 minutes; anything slower systematically gets circumvented under deadline pressure. Slower, high-value checks (full e2e suites, load tests) belong outside that gate — nightly, or pre-release — rather than being cut to fit the time budget.

**Q: Can feature flags replace a deployment strategy like canary?**
No — they solve different problems and are commonly used together. A deployment strategy controls how the underlying code reaches production infrastructure; a feature flag controls whether a piece of already-deployed code is active for a given user. Canary deployment plus a feature flag gives you two independent, layered safety controls.

**Q: What's the single highest-leverage first step for a team with no CI/CD today?**
Get a fast automated test suite running on every pull request and require it to pass before merge. Everything else in this page — deployment strategies, feature flags, DORA measurement — compounds on top of that one habit, and none of it matters if broken code can still merge unchecked.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the difference between Continuous Integration, Continuous Delivery, and Continuous Deployment?* Model answer: CI = automatically build/test every merge to a shared trunk; Continuous Delivery = every change that passes CI is release-ready, but a human decides when to actually deploy; Continuous Deployment = same pipeline, but the final deploy step is also automatic with no human gate.
2. *Why does a pipeline run lint and unit tests before integration tests?* Model answer: cheaper, faster checks should fail first to save compute and developer waiting time — this ordering is a performance and feedback-speed decision, not arbitrary.
3. *What triggers a CI pipeline?* Model answer: a git event — typically a push, a pull request update, or a tag — received via a webhook from the git host; not a fixed schedule by default (though scheduled runs also exist for things like nightly suites).
4. *What is an artifact repository, and why does CI push to one?* Model answer: a registry (container or package) that stores versioned, immutable build outputs; it's the handoff point between CI (which produces the artifact) and CD (which deploys it), and it's what makes "build once, promote everywhere" possible.
5. *What is pipeline-as-code, and why did it replace GUI-configured pipelines?* Model answer: the pipeline definition lives as a file in the repository, versioned and reviewable like any other code — GUI configuration wasn't versioned, wasn't diffable in review, and was hard to reproduce or audit.

**Senior:**

6. *Explain blue-green vs canary vs rolling deployment, and how you'd choose between them for a high-traffic payments service.* Model answer: cover blast radius, rollback speed, and infra cost for each (see Advanced Concepts table); for payments specifically, argue for canary given the cost of a bad release and the value of statistical confidence before full rollout, likely combined with feature flags for any user-facing change.
7. *How do feature flags change your deployment strategy?* Model answer: they decouple deploy from release — code can reach production continuously (even via full Continuous Deployment) while remaining invisible/inactive until explicitly toggled, which reduces the risk of any single deployment strategy since flag-off is an instant, config-only rollback layered on top.
8. *Walk through how you'd secure a pipeline that deploys to production.* Model answer: least-privilege, environment-scoped credentials; prefer OIDC short-lived federation over static keys; pin third-party actions to commit SHAs; restrict fork-PR access to secrets; sign artifacts and verify before deploy; run SCA/SAST stages pre-package.
9. *What are the DORA four keys, and why do they matter more than "number of green pipelines"?* Model answer: deployment frequency, lead time for changes, change failure rate, MTTR — they're outcome metrics validated by DORA's research as correlating with actual delivery and organizational performance, unlike vanity metrics like pipeline count or "percent green."
10. *How do you handle a database schema change in a continuously deployed system?* Model answer: expand/contract — add new schema alongside old, deploy code writing to both, migrate data, then deploy code using only the new schema, then drop the old — every step independently deployable and rollback-safe without needing to reverse a destructive migration.
11. *Trunk-based development vs feature branching — when would you choose each?* Model answer: trunk-based for teams wanting to maximize CI's value and enable Continuous Deployment, using feature flags for incomplete work; feature branching where longer review cycles or regulatory gates matter more than integration speed, accepting higher merge risk as branches age.
12. *A canary deployment's automated analysis is comparing error rate between old and new versions and sees a spike — what should happen, and how would you design that system?* Model answer: automatic halt/rollback of the canary slice without waiting for a human, based on a pre-defined statistical threshold (not just "any spike"); design considerations include sample size/traffic-slice sizing, avoiding false positives from small-sample noise, and alerting a human even when rollback is automatic.
`,

  "coding-questions": `
### 1. A secrets-in-diff scanning stage (pipeline security, common in real CI setups)

~~~bash
#!/usr/bin/env bash
# secret_scan.sh — fails the pipeline if the diff being merged looks like it
# contains a credential. Run as an early, cheap pipeline stage.
set -euo pipefail

# Patterns for common credential shapes — not exhaustive, but catches the
# highest-frequency real-world leaks (cloud keys, generic high-entropy tokens).
# A newline-delimited string avoids bash array-indexing syntax entirely.
PATTERNS="AKIA[0-9A-Z]{16}
AIza[0-9A-Za-z_-]{35}
-----BEGIN (RSA|EC|DSA) PRIVATE KEY-----"

DIFF="$(git diff --unified=0 "$1" "$2" || true)"   # compare base..head, no context lines

found=0
while IFS= read -r pattern; do
  if echo "$DIFF" | grep -E -q "$pattern"; then
    echo "SECURITY: diff matches suspected credential pattern: $pattern" >&2
    found=1
  fi
done <<PATTERNLIST
$PATTERNS
PATTERNLIST

if [ "$found" -eq 1 ]; then
  echo "Blocking merge — remove the credential and rotate it if it was ever committed." >&2
  exit 1   # non-zero exit fails the pipeline stage
fi

echo "No obvious credential patterns found."
~~~

Complexity: O(n) over diff size per pattern — linear scan, negligible cost as an early pipeline stage. Follow-ups they'll ask: how would you catch secrets that don't match a known shape (generic high-entropy strings)? Answer: add a Shannon-entropy check on quoted string literals above a length threshold, accepting some false positives in exchange for broader coverage; also run this as a pre-commit hook locally, not only in CI, to catch leaks before they ever reach git history.

### 2. Post-deploy smoke test with automatic rollback trigger

~~~python
# smoke_test.py — polls a freshly deployed service's health endpoint with
# backoff; triggers rollback if it never becomes healthy within a budget.
import sys
import time
import urllib.request

def check_health(url: str, timeout_s: float = 3.0) -> bool:
    """Single health check attempt; treats any exception as unhealthy."""
    try:
        with urllib.request.urlopen(url, timeout=timeout_s) as resp:
            return resp.status == 200
    except Exception:
        return False

def wait_for_healthy(url: str, max_attempts: int = 6, base_delay: float = 2.0) -> bool:
    """Exponential backoff: 2s, 4s, 8s, 16s, 32s, 64s — bounded total wait ~2 minutes."""
    for attempt in range(1, max_attempts + 1):
        if check_health(url):
            print(f"Healthy after {attempt} attempt(s).")
            return True
        delay = base_delay * (2 ** (attempt - 1))
        print(f"Attempt {attempt} unhealthy, retrying in {delay:.0f}s...")
        time.sleep(delay)
    return False

if __name__ == "__main__":
    service_url = sys.argv[1]
    if not wait_for_healthy(service_url):
        print("Service never became healthy — triggering rollback.", file=sys.stderr)
        sys.exit(1)   # non-zero exit signals the deploy stage to roll back
    sys.exit(0)
~~~

Complexity: O(max_attempts) bounded wall-clock time, not data size — the interesting design constraint is the backoff schedule and total time budget, not asymptotic complexity. Follow-ups: how would you make this canary-aware (compare against a baseline error rate instead of a fixed threshold)? How would you avoid a slow health check itself causing a false "unhealthy" (tune the per-request timeout separately from the overall budget)?

### 3. Computing DORA metrics from deploy/incident event logs

~~~python
# dora_metrics.py — given a list of deploy events and incident events,
# compute deployment frequency, lead time, change failure rate, and MTTR
# for a given window. Simplified but structurally realistic.
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class Deploy:
    commit_time: datetime
    deploy_time: datetime
    caused_incident: bool

@dataclass
class Incident:
    start: datetime
    resolved: datetime

def deployment_frequency(deploys: list[Deploy], window: timedelta) -> float:
    """Deploys per day over the observed window."""
    if not deploys:
        return 0.0
    days = max(window.total_seconds() / 86400, 1)
    return len(deploys) / days

def lead_time_for_changes(deploys: list[Deploy]) -> timedelta:
    """Average commit-to-production time — the core CI/CD speed metric."""
    if not deploys:
        return timedelta(0)
    total = sum((d.deploy_time - d.commit_time for d in deploys), timedelta())
    return total / len(deploys)

def change_failure_rate(deploys: list[Deploy]) -> float:
    """Fraction of deploys that caused a production incident."""
    if not deploys:
        return 0.0
    failed = sum(1 for d in deploys if d.caused_incident)
    return failed / len(deploys)

def mean_time_to_recovery(incidents: list[Incident]) -> timedelta:
    """Average incident duration."""
    if not incidents:
        return timedelta(0)
    total = sum((i.resolved - i.start for i in incidents), timedelta())
    return total / len(incidents)
~~~

Complexity: O(n) over the number of deploy/incident events — the real-world difficulty is data quality (reliably tagging which deploy caused which incident), not the arithmetic. Follow-ups: how would you handle a deploy that's still "in flight" (no resolved incident yet) when computing MTTR for a live dashboard? How would you bucket these by service/team rather than globally?
`,

  "hands-on-labs": `
### Lab 1 — Build your first pipeline (beginner, ~1h)
Take any small existing project (or a fresh one) and add a pipeline-as-code file with three stages: lint, unit test, and package (even just zipping the source). Wire branch protection so a pull request cannot merge unless the pipeline passes. Deliverable: a screenshot/log of a PR blocked by a failing check, then passing after a fix. Skills: pipeline triggers, stage ordering, branch protection.

### Lab 2 — Build-once, promote-everywhere with a container (intermediate, ~2h)
Add a Docker build stage (see the **Docker** skill) that produces one tagged image per commit, pushes it to a registry, then deploys that exact image to two separate "environments" (even two local Docker Compose stacks standing in for staging/production). Deliverable: proof (via image digest) that staging and production are running the identical artifact. Skills: artifact repositories, environment promotion.

### Lab 3 — Implement a deployment strategy and a rollback (advanced, ~3h)
Using Kubernetes (see the **Kubernetes** skill) or a simple load-balancer setup, implement a rolling update for a toy service, deliberately deploy a broken version, and practice both a manual rollback and (stretch goal) an automated health-check-triggered rollback using something like Lab 2's smoke-test pattern. Deliverable: a short write-up of what actually happened during the broken rollout and how fast rollback recovered it. Skills: deployment strategies, automated smoke testing, rollback.

### Lab 4 — End-to-end production pipeline with metrics (production, ~4h)
Combine Labs 1–3 into a full pipeline: lint → test → security scan (any SCA/SAST tool) → package/sign → deploy staging → smoke test → manual approval → deploy production with a canary or blue-green strategy → post-deploy health check. Add a step that emits a deployment event, and compute your own deployment frequency and lead time over a week of use (reuse the logic from Coding Questions #3). Skills: the entire pipeline end to end, plus DORA measurement.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate real CI/CD engineering judgment, not just YAML syntax:

1. **A pipeline template library.** Build a reusable set of pipeline-as-code templates (for a language/stack of your choice) that any new repository in an organization can adopt: standard lint/test/scan/package stages, standardized environment promotion, and a documented, tested rollback procedure. Demonstrates: understanding of what belongs in a stage, security defaults (least-privilege credentials, signed artifacts), and designing for reuse across teams — exactly what a platform engineering role screens for.

2. **A canary-analysis service.** Given two sets of live metrics (baseline vs canary — synthetic data is fine), build a small service that decides automatically whether to promote or roll back a canary deployment based on error-rate and latency comparison, with configurable statistical thresholds and sample-size safeguards against false positives on small traffic slices. Demonstrates: the automated-decision layer real production canary systems (like Spinnaker) implement, and careful thinking about statistical validity under real traffic constraints.

3. **A DORA metrics dashboard.** Ingest deploy and incident events (from a real or synthetic event log) and compute/display all four DORA metrics over rolling time windows, with drill-down by service/team. Demonstrates: end-to-end thinking about what CI/CD is actually *for* — measurable delivery performance — not just the mechanics of running a pipeline.

Each project should include: a version-controlled pipeline for the project's own code (practice what you build), a README explaining the design tradeoffs (why this deployment strategy, why this metric definition), and — for project 1 or 3 — a small demo showing the tool actually gating or measuring a real deploy.
`,

  "case-studies": `
### Knight Capital, 2012 — the canonical deployment-process cautionary tale
Knight Capital deployed new trading software to production servers, but one of eight servers didn't receive the update correctly — old, dormant code paths were accidentally reactivated by a repurposed flag, and the mismatched fleet began executing unintended trades. The company lost roughly 440 million dollars in about 45 minutes before the issue was identified and stopped. **Lesson**: this is a build-once-promote-everywhere failure and a deployment-verification failure at the same time — no automated check confirmed all servers were actually running the same, correct artifact before traffic hit them, and there was no fast, automated rollback path once things went wrong. Modern deployment strategies (verified, identical artifacts; automated health checks; fast rollback) exist specifically to make this class of incident far less likely.

### Etsy — continuous deployment as a deliberate cultural choice
Etsy's engineering culture in the early 2010s made frequent, low-drama production deployment (using internal tooling like Deployinator) a point of pride rather than a risk to minimize, publicly documenting deploying tens of times a day. **Lesson**: deployment frequency and stability are not inherently in tension — investment in automation, monitoring, and a blameless engineering culture let Etsy increase deploy frequency while *reducing* incident rate, directly supporting the empirical DORA finding that elite performers are both faster and more reliable, not one at the expense of the other.

### Netflix and Spinnaker — automating the judgment call
Netflix built and open-sourced Spinnaker specifically to automate the "is this canary healthy enough to promote" decision that many organizations still make by a human staring at a dashboard. **Lesson**: as deployment frequency scales up, manual judgment calls at each release become the bottleneck; codifying that judgment into automated, statistically grounded canary analysis is what makes very high deployment frequency sustainable rather than exhausting for the humans involved.

### Meta/Facebook — decoupling deploy from release at scale
Meta's internal Gatekeeper feature-flagging system lets code deploy to production continuously via trunk-based development while individual features roll out to users gradually, independently of any deploy event. **Lesson**: at sufficient scale, deployment frequency and release control become genuinely separate concerns, and trying to manage both with the same mechanism (deploy timing alone) becomes a bottleneck — feature flags are the architectural answer, not a nice-to-have.
`,

  comparisons: `
### CI/CD delivery models

| Model | How releases happen | Rollback story | Where it's common |
|-------|----------------------|------------------|---------------------|
| Manual/waterfall release | Scheduled, human-executed runbook, infrequent | Manual, often slow and stressful | Legacy enterprise, heavily regulated environments not yet modernized |
| Continuous Delivery | Automated pipeline builds a release-ready artifact; human clicks deploy | Automated strategy (blue-green/canary/rolling) + human-triggered if needed | Most mature product teams, especially where a compliance sign-off gate is required |
| Continuous Deployment | Fully automated, no human gate on the final release step | Fully automated (health checks + strategy) | High-velocity product teams with strong automated test/monitoring confidence |
| GitOps (pull-based CD) | A controller inside the target environment continuously reconciles it to match a declared state in git, rather than a pipeline pushing changes to it | Revert the git state; controller reconciles automatically | Kubernetes-native platforms, especially multi-cluster/multi-region setups |

### Push-based vs pull-based CD (an internal comparison worth knowing cold)

Traditional CD is **push-based**: the pipeline itself has credentials to reach into the target environment and apply the change. **GitOps** flips this to **pull-based**: an agent living inside the target environment (Argo CD, Flux) watches a git repository and continuously reconciles the live state to match it — the pipeline never needs deploy credentials to the target environment at all, only permission to open a pull request that updates the desired-state repository.

| Aspect | Push-based CD | Pull-based (GitOps) |
|--------|-----------------|------------------------|
| Where deploy credentials live | In the CI/CD pipeline | Only inside the target environment's agent |
| Drift detection | Not automatic | Continuous — the agent constantly reconciles |
| Blast radius of a compromised pipeline | Can reach production directly | Cannot reach production directly, only the git repo |
| Maturity/tooling | Universal, simple | Newer, strongest in Kubernetes ecosystems |

### How seniors choose

Seniors default to Continuous Delivery (automated pipeline, human release gate) unless the team has genuinely earned Continuous Deployment through strong automated test coverage, monitoring, and rollback confidence — jumping straight to no-human-gate deployment before that trust is earned is a common and costly overreach. For the deploy mechanism itself, push-based CD is simpler to reason about and sufficient for most teams; GitOps earns its added complexity specifically in Kubernetes-native, multi-cluster environments where continuous drift detection and reduced pipeline blast-radius matter enough to justify the extra moving part.
`,

  "related-technologies": `
- **Git** — the version control system whose events (push, PR, tag) trigger every pipeline in this page; see the **Git** skill for branching mechanics this all depends on.
- **Docker** — the standard packaging format for the "build once, promote everywhere" artifact; see the **Docker** skill for building and pushing images as a pipeline stage.
- **Kubernetes** — the most common modern deployment target, and where rolling/canary strategies are implemented declaratively at the infrastructure layer; see the **Kubernetes** skill.
- **Terraform** — infrastructure-as-code, typically its own pipeline stage that provisions or updates the environment a deploy stage then targets; see the **Terraform** skill.
- **GitHub Actions** — the cloud-native, hosted implementation of pipeline-as-code covered on this platform in concrete YAML depth.
- **Jenkins** — the classic, self-hosted, plugin-driven implementation of these same concepts, covered on this platform for teams running their own CI infrastructure.
- **AWS / Azure / GCP** — the cloud providers most pipelines ultimately deploy into; each has native CI/CD services (CodePipeline, Azure Pipelines, Cloud Build) alongside supporting OIDC federation for pipeline credentials.
- **Secrets Management** — the vault/secret-store mechanics that pipeline credential handling in the Security section depends on.
- **Argo CD / Flux** — the leading GitOps controllers implementing pull-based continuous deployment discussed in Comparisons.
- **Feature flag platforms** (e.g. LaunchDarkly-style systems) — the concrete tooling behind the feature-flag pattern in Advanced Concepts.
- **Observability** category on this platform — where the metrics, logging, and tracing that pipeline Monitoring and DORA measurement depend on are covered in depth.

Natural next pages on this platform: **CI/CD** (this page) → **GitHub Actions** or **Jenkins** for concrete tool depth → **Docker** and **Kubernetes** for the artifact and deploy target → **Terraform** for the infrastructure stage.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025; check the official docs and vendor blogs for anything newer, since this space moves quickly.

- **OIDC/keyless authentication has become the default recommendation**, not an advanced option — most major CI platforms and cloud providers now document federated, short-lived credentials as the primary path, actively discouraging long-lived static keys stored as pipeline secrets.
- **Supply-chain security frameworks have matured into concrete practice.** SLSA (Supply-chain Levels for Software Artifacts) provenance and Sigstore/cosign artifact signing have gone from "advanced teams only" to increasingly standard pipeline stages, accelerated by high-profile supply-chain incidents earlier this decade.
- **GitOps tooling (Argo CD, Flux) has reached CNCF-graduated maturity** and is now a mainstream, not niche, choice for Kubernetes-native continuous deployment.
- **Policy-as-code gates** (Open Policy Agent/Conftest-style tools enforcing organizational rules — e.g., "no container may run as root," "no public S3 bucket") are increasingly wired directly into pipelines as an automated stage rather than a manual review checklist.
- **AI-assisted pipeline authoring and maintenance** — code-assistant tooling generating and reviewing pipeline-as-code YAML, and early automated flaky-test detection/quarantine tooling, are appearing across major CI platforms; this is a fast-moving area worth verifying current vendor capability directly.
- **Progressive delivery via service mesh** (tools like Flagger integrating with Kubernetes-native meshes) continues to make automated canary analysis more accessible to teams without Netflix-scale platform investment.

For anything version-specific to a particular tool (GitHub Actions feature flags, a specific Jenkins plugin's status), consult that tool's skill page or its official changelog directly — this page intentionally stays at the concept layer, which changes far more slowly than any one vendor's feature set.
`,

  "future-roadmap": `
Where CI/CD is heading, and what's worth betting career time on:

1. **Pull-based (GitOps) delivery keeps displacing push-based CD**, especially for Kubernetes-native organizations — understanding the security and drift-detection argument for pull-based delivery (see Comparisons) will matter more, not less.
2. **Supply-chain integrity becomes a baseline expectation, not a differentiator.** Artifact signing, SLSA provenance levels, and dependency scanning are moving from "advanced team" practices toward being assumed table stakes, similar to how HTTPS went from optional to default.
3. **Policy-as-code gates become as standard as test gates.** Expect "did this pass our security/compliance policy checks" to be as automatically enforced in pipelines as "did the unit tests pass" already is.
4. **AI-assisted pipeline authoring and self-healing pipelines mature.** Automated flaky-test detection/quarantine and AI-suggested pipeline optimizations (parallelization, caching opportunities) are early today but trending toward standard tooling features.
5. **Platform engineering abstracts the pipeline itself behind an internal developer platform** (patterns popularized by tools like Backstage) — increasingly, application engineers interact with a paved-road "deploy my service" abstraction rather than authoring raw pipeline YAML from scratch, while a smaller platform team owns the underlying pipeline templates.

For your career: the deep, durable knowledge is the conceptual layer this page teaches — the CI/Delivery/Deployment distinction, deployment-strategy tradeoffs, pipeline security fundamentals, and DORA-style outcome measurement — because it transfers across every tool generation. Tool-specific YAML syntax (this platform's GitHub Actions and Jenkins skills) is worth learning deeply for your current stack, but expect to relearn syntax every few years while these underlying concepts keep paying off.
`,

  "cheat-sheet": `
~~~text
--- The three words ---
Continuous Integration:  merge + auto build/test frequently (no production involvement)
Continuous Delivery:     CI + always-releasable artifact, HUMAN clicks deploy
Continuous Deployment:   CI + Delivery, but deploy is ALSO automatic (no human gate)

--- Pipeline stage order (cheapest/fastest first) ---
lint -> build -> unit-test -> integration-test -> security-scan (SAST+SCA)
     -> package/sign artifact -> deploy-staging -> smoke-test
     -> [manual approval gate: Delivery] or [nothing: Deployment]
     -> deploy-production (strategy below) -> health check -> DORA event

--- Deployment strategies ---
Rolling:    replace instances gradually  | medium blast radius | no extra infra
Blue-green: two full envs, instant flip  | zero->100% at switch | 2x infra, instant rollback
Canary:     small % first, ramp on health| smallest blast radius| needs traffic-splitting + metrics

--- Feature flags ---
Deploy = code is running in prod (CI/CD concern)
Release = users can see/use it (feature-flag concern)
Deploy != Release --  flags make that gap deliberate

--- Trunk-based vs feature branching ---
Trunk-based: commit to main daily, short-lived branches, flags hide unfinished work
Feature branching: longer-lived branches, PR review gate, higher merge risk as branch ages

--- Pipeline security checklist ---
- never print secrets; treat logs as public
- least-privilege, per-environment credentials; prefer OIDC over static keys
- pin third-party actions/plugins to a commit SHA
- restrict fork PR access to secrets
- sign artifacts (cosign/Sigstore); verify before deploy
- run SCA (dependencies) + SAST (code) before packaging

--- DORA four keys ---
Deployment frequency:     how often you deploy to prod
Lead time for changes:    commit -> production, elapsed time
Change failure rate:      failed/rolled-back deploys / total deploys
MTTR:                     mean time to recover from a production incident
Elite: on-demand deploys, <1hr lead time, low single-digit failure rate, minutes-to-hour MTTR

--- Expand/contract for schema changes ---
1. expand: add new schema alongside old, write to both
2. migrate: backfill/move data
3. contract: switch reads to new schema, drop old
Every step independently deployable and rollback-safe.

--- Artifact rule ---
Build the artifact ONCE. Promote the SAME artifact through every environment. Never rebuild per env.
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| CI vs Continuous Delivery vs Continuous Deployment? | CI = auto build/test on merge; Delivery = always releasable, human deploys; Deployment = fully automatic, no gate |
| What triggers a CI pipeline? | A git event (push, PR, tag) via webhook — not a fixed schedule by default |
| What is pipeline-as-code? | The pipeline definition committed to the repo as a versioned file, reviewed like application code |
| What is the "build once, promote everywhere" rule? | Build one immutable artifact, deploy the identical artifact to every environment — never rebuild per environment |
| Rolling vs blue-green vs canary — smallest blast radius? | Canary — a small controlled traffic slice takes the risk first |
| Rolling vs blue-green — fastest rollback? | Blue-green — flipping the router back is instant |
| What decouples deploy from release? | Feature flags |
| Trunk-based development in one line? | Commit to main frequently, short-lived branches, feature flags hide unfinished work |
| Why order lint before integration tests? | Fail fast — cheaper checks first save compute and developer waiting time |
| What is an artifact repository? | A registry (container/package) storing versioned build outputs — the CI-to-CD handoff point |
| Why prefer OIDC over static keys for pipeline credentials? | Short-lived, federated credentials expire quickly if leaked; static keys stay valid until manually rotated |
| The four DORA metrics? | Deployment frequency, lead time for changes, change failure rate, mean time to recovery |
| What is expand/contract? | A schema-migration pattern: add new schema, migrate data, then remove old — every step rollback-safe |
| What is GitOps? | Pull-based CD — an in-cluster agent reconciles live state to match a declared state in git, rather than a pipeline pushing changes |
| Why quarantine flaky tests instead of ignoring them? | An intermittently failing test erodes trust in the whole pipeline if merely rerun-until-green; quarantine it as non-blocking and track the fix |
`,

  mcqs: `
**1. A team's pipeline automatically builds and tests every commit, produces a release-ready artifact, but a human still clicks a button to deploy to production. What is this?**

A) Continuous Integration only  B) Continuous Delivery  C) Continuous Deployment  D) GitOps

**Answer: B** — the artifact is always releasable, but the final deploy decision is manual, which is precisely the CI/Delivery/Deployment distinction this page emphasizes.

**2. Which deployment strategy has the smallest blast radius for a bad release?**

A) Rolling update  B) Blue-green  C) Canary  D) They're all equal

**Answer: C** — canary exposes only a small, controlled slice of traffic to the new version before ramping up, unlike blue-green's all-at-once switch or rolling's partial-but-uncontrolled mix.

**3. Why is "build once, promote everywhere" considered a core CI/CD principle?**

A) It's faster to rebuild each time  B) It prevents drift between what was tested and what ships  C) It's required by Docker  D) It only matters for microservices

**Answer: B** — rebuilding per environment can pick up different dependency versions, reintroducing the exact "passed staging, broke in prod" gap CI/CD exists to eliminate.

**4. What do feature flags primarily decouple?**

A) CI from CD  B) Staging from production  C) Deployment from release  D) Build from test

**Answer: C** — a feature flag controls whether already-deployed code is active for users, separating "code is running in prod" from "users can see the new behavior."

**5. Which of the DORA four keys measures how often a team successfully ships to production?**

A) Lead time for changes  B) Deployment frequency  C) Change failure rate  D) MTTR

**Answer: B** — deployment frequency is a direct count of production deploys over a period; the other three measure speed, safety, and recovery respectively.

**6. Why is pinning a third-party pipeline action/plugin to an exact commit SHA (not a mutable tag) a security best practice?**

A) It's required by most CI platforms  B) A mutable tag can be repointed to malicious code after you've already reviewed and trusted it  C) It makes the pipeline faster  D) It has no real security benefit, only reproducibility

**Answer: B** — a tag like "v1" can be moved by the publisher (or an attacker who compromises the publisher's account) to point at different, unreviewed code after the fact; a commit SHA is immutable.
`,

  "revision-notes": `
**The core distinction, in one paragraph:** Continuous Integration means merging and auto-testing frequently — it never touches production. Continuous Delivery extends CI so every passing change is a release-ready artifact, but a human still decides when to actually deploy. Continuous Deployment removes that human gate entirely — every change that clears every automated check ships to production with nobody clicking a button. Every Continuous Deployment setup is also Continuous Delivery; the reverse is not true.

**The pipeline shape, in one paragraph:** A production pipeline orders stages cheapest-and-fastest-first — lint, build, unit test, integration test, security scan (SAST + dependency/SCA) — then packages exactly one immutable artifact, which is promoted unchanged through staging and production rather than rebuilt per environment. Staging gets a smoke test; production gets a deployment strategy (rolling, blue-green, or canary) chosen by that environment's risk tolerance, followed by automated health checks and either promotion or rollback.

**Deployment strategies and feature flags, in one paragraph:** Rolling updates trade a brief mixed-version window for zero extra infrastructure; blue-green trades doubled infrastructure for an instant, clean all-or-nothing cutover and rollback; canary trades a traffic-splitting router and real-time metrics comparison for the smallest possible blast radius. Feature flags sit orthogonal to all three — they decouple "code is deployed" from "users can see it," letting risky or partial work ship continuously while release timing stays a separate, instantly-reversible config decision.

**Security and measurement, in one paragraph:** Pipeline security means never printing secrets, scoping credentials per environment with least privilege (preferring short-lived OIDC federation over static keys), pinning third-party pipeline dependencies to exact commits, restricting fork-PR access to secrets, and signing/verifying artifacts before they're allowed to deploy. Whether all of this is actually working is measured by the DORA four keys — deployment frequency, lead time for changes, change failure rate, and mean time to recovery — not by pipeline count or green-checkmark rate.

**The organizational context, in one paragraph:** Trunk-based development with short-lived branches is the branching model that makes CI's core promise real and makes Continuous Delivery/Deployment safe; long-lived feature branches reintroduce integration risk no amount of pipeline automation fully compensates for. This page deliberately stays platform-agnostic — see the GitHub Actions skill for the modern cloud-native tool implementing these ideas, and the Jenkins skill for the classic self-hosted implementation.
`,

  "learning-roadmap": `
A realistic path to genuinely understanding CI/CD, not just reciting the CI/Delivery/Deployment definitions:

**Week 1 — Foundations.** Read Beginner and Intermediate Concepts closely; make sure you can explain the CI/Delivery/Deployment distinction to someone else without hedging. Do Lab 1 (your first pipeline). Milestone: a PR that's genuinely blocked by a failing check, then merges after a fix.

**Week 2 — Artifacts and environments.** Read Production Usage and the artifact-repository material in Intermediate/Advanced Concepts. Do Lab 2 (build-once-promote-everywhere with a container). Milestone: you can prove, via image digest, that staging and production ran the identical artifact.

**Week 3 — Deployment strategies and feature flags.** Read Advanced Concepts thoroughly — this is the highest-density section on the page. Do Lab 3 (implement a rolling update, break it on purpose, practice rollback). Milestone: you can argue, unprompted, when you'd choose canary over blue-green for a specific system.

**Week 4 — Security and measurement.** Read Security, Monitoring, and Deployment sections. Do Lab 4 (full pipeline with metrics) and the DORA-metrics coding question. Milestone: you have real deployment-frequency and lead-time numbers from your own week of pipeline use, not just the textbook definitions.

**Week 5 — Interview and case-study polish.** Work through Interview Questions and Case Studies; be able to explain Knight Capital, Etsy, and the Meta feature-flag pattern from memory, in your own words, with the lesson each teaches.

Then move to the **GitHub Actions** skill (or **Jenkins**, if your target environment is self-hosted) to translate everything on this page into concrete, runnable pipeline syntax for a real tool.
`,

  "official-docs": `
- [continuousdelivery.com](https://continuousdelivery.com/) — Jez Humble and David Farley's own site; the clearest primary-source definitions of Continuous Delivery vs Deployment on the web.
- [Martin Fowler — Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html) — the original, still-relevant essay that named and popularized the practice.
- [Google Cloud — DevOps Research (DORA)](https://cloud.google.com/devops) — the home of the DORA research program and the four-keys metrics used throughout this page.
- [SLSA framework](https://slsa.dev/) — the supply-chain integrity levels referenced in the Security and Advanced Concepts sections.
- [Sigstore](https://www.sigstore.dev/) — the artifact-signing project (cosign) referenced for artifact signing/verification.
- GitHub Actions and Jenkins official docs — see this platform's dedicated **GitHub Actions** and **Jenkins** skill pages, which link and annotate tool-specific documentation in depth.
`,

  books: `
- **Continuous Delivery** — Jez Humble & David Farley. The book that formalized this entire page's vocabulary; read this first for the deepest, most rigorous treatment.
- **Accelerate** — Nicole Forsgren, Jez Humble, Gene Kim. The DORA research distilled into a business case and a measurement framework (the four keys) — essential for understanding *why* CI/CD investment matters, backed by data rather than intuition.
- **The Phoenix Project** — Gene Kim, Kevin Behr, George Spafford. A novel-format introduction to DevOps thinking; accessible and motivating for engineers new to the cultural side of this practice.
- **The DevOps Handbook** — Gene Kim, Jez Humble, Patrick Debois, John Willis. The practical companion to *The Phoenix Project*, covering CI/CD as one pillar of a broader operating model.
- **Site Reliability Engineering** — Google (free online). Not CI/CD-specific, but the chapters on release engineering and canarying are directly relevant to the Deployment Strategies material in this page.
- **Effective DevOps** — Jennifer Davis & Katherine Daniels. Strong on the organizational/cultural practices that make CI/CD sustainable, not just technically correct.
`,

  blogs: `
- **martinfowler.com** — consistently the highest-signal source for CI/CD, continuous delivery, and architecture writing; several canonical essays referenced throughout this page live here.
- **continuousdelivery.com** — Humble and Farley's ongoing writing and courses on the discipline.
- **Google Cloud blog — DevOps/SRE section** — DORA research updates and practical release-engineering writing.
- **Netflix Tech Blog** — regularly publishes on Spinnaker, canary analysis, and large-scale continuous delivery practice.
- **Etsy's Code as Craft** (historical archive) — the original public writing behind Etsy's high-frequency deployment culture referenced in Case Studies.
- **The GitOps Working Group / CNCF blog** — for GitOps and pull-based delivery developments referenced in Comparisons and Latest Updates.
`,

  "research-papers": `
Honest framing: CI/CD is primarily an **industry practice** area, not one with a deep peer-reviewed academic literature the way, say, distributed consensus does — so a "top 5 papers" list would be misleading. The closest things to foundational "research" are large-scale empirical industry studies and the primary-source books/essays already listed:

- **The annual DORA "State of DevOps" reports** (Google Cloud / DORA team) — the closest thing to a rigorous, survey-based empirical research program in this space; the source of the four-keys framework used throughout this page.
- **Martin Fowler's "Continuous Integration" essay (2000, updated since)** — closer to a technical position paper than a blog post, and the closest thing to a foundational primary text for CI specifically.
- **The SLSA framework specification** (OpenSSF) — a rigorously structured, levels-based specification for supply-chain integrity, worth reading with the same seriousness as a standards document even though it isn't an academic paper.

If you want genuinely academic adjacent reading: look at the **release engineering** literature from software engineering conferences (ICSE, FSE) — search terms like "continuous integration build failures" or "test flakiness detection" surface real peer-reviewed studies (e.g., empirical studies on what causes CI build breakage, and on the prevalence and causes of flaky tests) that are closer to this page's Testing and Debugging sections than to a single canonical "CI/CD paper."
`,

  videos: `
- **John Allspaw & Paul Hammond — "10+ Deploys Per Day: Dev and Ops Cooperation at Flickr" (Velocity 2009)** — the talk widely credited with sparking the DevOps movement; essential historical context for this entire page.
- **Jez Humble — various Continuous Delivery conference talks** — clear, often-updated explanations of the Delivery/Deployment distinction from the person who coined the modern definitions.
- **Nicole Forsgren — talks on the Accelerate/DORA research** — the data-driven case for why CI/CD practices correlate with organizational performance.
- **Netflix engineering talks on Spinnaker and automated canary analysis** (various conferences) — concrete, large-scale implementation detail behind the canary strategy covered in Advanced Concepts.
- **KubeCon GitOps talks (Argo CD / Flux maintainers)** — for the pull-based delivery model covered in Comparisons.
`,

  "github-repos": `
- [jenkinsci/jenkins](https://github.com/jenkinsci/jenkins) — the classic self-hosted CI/CD server; see this platform's **Jenkins** skill for depth.
- [actions/runner](https://github.com/actions/runner) — GitHub Actions' own runner implementation; useful for understanding how a hosted runner actually executes a job.
- [spinnaker/spinnaker](https://github.com/spinnaker/spinnaker) — Netflix's open-sourced continuous delivery platform, the reference implementation of automated canary analysis discussed in Advanced Concepts and Case Studies.
- [argoproj/argo-cd](https://github.com/argoproj/argo-cd) — the leading GitOps (pull-based) continuous deployment controller for Kubernetes.
- [fluxcd/flux2](https://github.com/fluxcd/flux2) — the other major CNCF GitOps controller; a good comparison read against Argo CD.
- [sigstore/cosign](https://github.com/sigstore/cosign) — artifact signing and verification tooling referenced in Security and the Deployment example.
- [open-policy-agent/opa](https://github.com/open-policy-agent/opa) — policy-as-code engine, the mechanism behind the policy-gate trend covered in Latest Updates.
- [slsa-framework/slsa](https://github.com/slsa-framework/slsa) — the SLSA specification's own repository, including reference material on provenance levels.
- [aquasecurity/trivy](https://github.com/aquasecurity/trivy) — a widely used open-source SCA/vulnerability scanner suitable for the security-scan pipeline stage.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Definitions fluency*: for five hypothetical team setups (described by their gate/automation configuration), classify each as CI-only, Continuous Delivery, or Continuous Deployment, and justify each classification in one sentence.
2. *Pipeline design*: given a described application (a stateless API, a stateful service with a database, a data pipeline), design the stage list and ordering for its pipeline, justifying why each stage is placed where it is.
3. *Deployment strategy selection*: for four described systems with different traffic/risk profiles, choose and justify rolling vs blue-green vs canary for each, referencing the blast-radius/rollback/cost tradeoffs.
4. *Security review*: given a (deliberately flawed) example pipeline-as-code file description, identify every security anti-pattern present (broad credentials, unpinned third-party action, secret in plaintext, no fork-PR restriction) and propose the fix for each.
5. *DORA calculation*: given a raw log of deploy timestamps, commit timestamps, and incident windows, compute all four DORA metrics by hand, then verify against the Coding Questions #3 implementation.
6. *Schema migration planning*: design an expand/contract sequence for a described breaking schema change, specifying what each of the three steps deploys and confirming every intermediate state is rollback-safe.

External sets: study real, publicly available pipeline-as-code files (GitHub Actions workflows in large open-source repos) to see stage ordering and security practices in the wild; the DORA "State of DevOps" report's own survey questions are a good self-assessment exercise for where a real team's practices actually sit on the maturity spectrum.
`,

  "architecture-diagram": `
The reference architecture a mature CI/CD setup converges on, tying every earlier section's components together:

~~~mermaid
flowchart TB
    Dev["Developers"] -->|"push / PR (trunk-based, short-lived branches)"| Git["Git host\n(webhooks + branch protection)"]
    Git --> CI["CI controller"]
    CI --> Runners["Ephemeral runner pool\n(autoscaled)"]
    Runners -->|"lint/build/test/scan"| Runners
    Runners --> Reg[("Signed artifact\nin container/package registry")]
    Vault[("Secrets store /\nOIDC federation")] -.least-privilege creds.-> Runners
    Reg --> CD["CD controller\n(push-based or GitOps pull-based)"]
    CD --> Staging["Staging environment\n(rolling deploy, smoke test)"]
    Staging --> Gate{"Manual approval?\n(Delivery vs Deployment)"}
    Gate --> Prod["Production\n(blue-green / canary)"]
    Flags[("Feature flag service")] -.controls release independent of deploy.-> Prod
    Prod --> Health["Automated health checks\n+ canary analysis"]
    Health -->|unhealthy| Rollback["Automatic rollback"]
    Health -->|healthy| Metrics["DORA metrics:\nfrequency, lead time,\nchange failure rate, MTTR"]
    Metrics --> Dash["Dashboard / alerting\n(Observability stack)"]
~~~

Every box in this diagram maps to a section on this page and, for the tool-specific pieces, to a sibling skill: the Git host and branch protection to the **Git** skill, the artifact/registry to the **Docker** skill, staging/production infrastructure to **Kubernetes** and **Terraform**, and the CI/CD controller itself to the **GitHub Actions** or **Jenkins** skill depending on which concrete tool a team runs.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((CI/CD))
    Core distinction
      Continuous Integration
      Continuous Delivery
      Continuous Deployment
    Pipeline anatomy
      Lint & build
      Unit & integration tests
      Security scan SAST/SCA
      Package & sign artifact
      Deploy stages & gates
    Branching model
      Trunk-based development
      Feature branching
      Pipeline-as-code
    Deployment strategies
      Rolling update
      Blue-green
      Canary
      Feature flags
    Security
      Least privilege & OIDC
      Secret masking
      Artifact signing SLSA
      Dependency SCA scanning
    Operations
      Monitoring & DORA metrics
      Debugging escalation path
      Rollback & expand-contract
      GitOps pull-based CD
    Ecosystem
      Git
      Docker
      Kubernetes
      Terraform
      GitHub Actions
      Jenkins
    Career
      Interview classics
      Case studies
      Labs & projects
~~~
`,
};

export default cicd;
