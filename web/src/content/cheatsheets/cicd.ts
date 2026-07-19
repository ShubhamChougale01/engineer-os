import type { CheatSheetData } from "./types";

const cicd: CheatSheetData = {
  title: "The Ultimate CI/CD Cheat Sheet",
  subtitle: "CI vs CD vs Continuous Deployment · pipeline anatomy · deployment strategies · DORA metrics",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "Continuous Integration (CI)", desc: "Merge frequently; every merge auto-builds and auto-tests", code: "Every push triggers: build + unit test\nCatches integration bugs within minutes, not weeks" },
        { term: "Continuous Delivery", desc: "Codebase is ALWAYS deployable; the production deploy step is a manual decision", code: "Pipeline stops at 'ready to deploy'\nA human clicks the button to actually ship" },
        { term: "Continuous Deployment", desc: "Every change that passes the pipeline deploys to production automatically, no human gate", code: "No manual click at all --\nrequires very high confidence in automated tests" },
        { term: "Integration hell", desc: "The pre-CI problem: long-lived branches diverge for weeks, merging becomes a nightmare", code: "Classic symptom: 'merge day' takes\nan entire sprint to resolve conflicts" },
        { term: "Works on my machine", desc: "Environment drift between dev/CI/prod that CI/CD forces you to eliminate", code: "Fix: containerize the build and\nrun tests in the SAME image that ships" },
        { term: "Pipeline-as-code", desc: "Pipeline definition lives in a versioned file in the repo, not a GUI configuration", code: "See the GitHub Actions and Jenkins skills\nfor concrete pipeline-as-code implementations" },
        { term: "Artifact", desc: "The immutable build output that flows through every later stage unchanged", code: "A Docker image, a jar file, a wheel --\nbuilt once, promoted through environments, never rebuilt" },
      ],
    },
    {
      title: "Pipeline Anatomy",
      color: "blue",
      rows: [
        { term: "Lint / static analysis stage", desc: "Fastest, cheapest checks first -- fail fast on style and obvious bugs", code: "ruff check .\neslint src/" },
        { term: "Build stage", desc: "Compile/transpile and produce the deployable artifact", code: "npm run build\ndocker build -t app:sha ." },
        { term: "Unit test stage", desc: "Fast, isolated tests -- the bulk of the test pyramid, run on every commit", code: "pytest tests/unit\nnpm test -- --coverage" },
        { term: "Integration test stage", desc: "Tests against real dependencies (DB, cache) -- slower, run less frequently or in parallel", code: "pytest tests/integration\n(spins up test Postgres/Redis containers)" },
        { term: "Security scan stage", desc: "SAST + dependency/SCA scanning -- see the OWASP Top 10 and Secrets Management skills", code: "semgrep --config p/owasp-top-ten .\npip-audit / npm audit" },
        { term: "Package/artifact stage", desc: "Produce and push the final, versioned, immutable artifact", code: "docker push registry/app:sha256-abc123" },
        { term: "Deploy to staging", desc: "Same artifact, different environment config -- validates the exact bits that will ship", code: "Never rebuild between staging and prod --\nonly re-tag/promote the same artifact" },
        { term: "Smoke test stage", desc: "Fast post-deploy sanity check before declaring the deploy healthy", code: "curl -f https://staging.example.com/health" },
        { term: "Manual approval gate", desc: "Where Continuous Delivery draws the line before Continuous Deployment", code: "Required reviewer on the production\nenvironment before the deploy job runs" },
      ],
    },
    {
      title: "Branching & Deployment Strategies",
      color: "emerald",
      rows: [
        { term: "Trunk-based development", desc: "Short-lived branches merged to main multiple times a day -- pairs naturally with CI", code: "Branch lifetime: hours, not weeks\nFeature flags hide incomplete work" },
        { term: "Feature branching / Git Flow", desc: "Longer-lived branches per feature/release -- more merge overhead, slower CI feedback loop", code: "See the Git skill for branch\nstrategy tradeoffs in depth" },
        { term: "Blue-green deployment", desc: "Two full production environments; switch traffic atomically, instant rollback by switching back", code: "Router points at 'blue';\ndeploy to idle 'green', flip router, keep blue as rollback" },
        { term: "Canary deployment", desc: "Route a small percentage of traffic to the new version, watch metrics, then ramp up", code: "5% -> 25% -> 50% -> 100%\nAuto-rollback if error rate spikes at any stage" },
        { term: "Rolling update", desc: "Replace instances/pods gradually, one batch at a time, no full duplicate environment needed", code: "Kubernetes Deployment default strategy --\nsee the Kubernetes skill" },
        { term: "Feature flags", desc: "Decouple DEPLOYMENT (code is live) from RELEASE (feature is visible to users)", code: "if feature_flags.is_enabled('new_checkout', user):\n    return new_checkout_flow()" },
        { term: "Blast radius", desc: "How much of production is affected if the new version has a bug", code: "Canary: small and controlled\nBig-bang deploy: 100% immediately -- avoid this" },
      ],
    },
    {
      title: "Pipeline Security",
      color: "amber",
      rows: [
        { term: "Never print secrets in logs", desc: "The most common real-world pipeline security failure", code: "Use masked/secret variables, never\necho $API_KEY for 'debugging'" },
        { term: "Least-privilege pipeline credentials", desc: "The CI runner's cloud credentials should be scoped to exactly what that pipeline needs", code: "Deploy job: write access to ONE\ntarget resource, not account-wide admin" },
        { term: "OIDC federation over static keys", desc: "Modern pattern: CI proves its identity via OIDC token, cloud issues short-lived credentials", code: "See the GitHub Actions skill --\nno long-lived cloud access key stored anywhere" },
        { term: "Dependency / SCA scanning", desc: "Fail the build on known-vulnerable dependencies before they reach production", code: "npm audit --audit-level=high\npip-audit --strict" },
        { term: "Artifact signing", desc: "Cryptographically verify an artifact wasn't tampered with between build and deploy", code: "cosign sign registry/app:sha256-abc123\ncosign verify registry/app:sha256-abc123" },
        { term: "Pin third-party actions/plugins", desc: "Pin to a commit SHA, not a mutable tag, to prevent a supply-chain takeover", code: "See the GitHub Actions skill for the\nSHA-pinning pattern in depth" },
        { term: "Branch protection + required status checks", desc: "Ties CI results to merge eligibility -- can't merge with a red pipeline", code: "Require: lint, tests, security scan\nall passing before merge is allowed" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Confusing CD's two meanings", desc: "The single most common interview trip-up -- always clarify Delivery vs Deployment", code: "Delivery: deployable, human clicks deploy\nDeployment: fully automated, no click" },
        { term: "Rebuilding the artifact per environment", desc: "Breaks the 'test what you ship' guarantee -- the whole point of an immutable artifact", code: "WRONG: docker build separately\nfor staging and for production" },
        { term: "Flaky tests left unfixed", desc: "Erodes trust in the pipeline -- teams start ignoring red builds entirely", code: "Track flaky-test rate as a first-class\nmetric, quarantine and fix, don't just re-run" },
        { term: "Slow pipeline as a tolerated norm", desc: "A 45-minute pipeline kills the fast-feedback benefit CI is supposed to provide", code: "Parallelize test suites, cache\ndependencies, split slow integration tests" },
        { term: "No rollback plan", desc: "Deploying forward-only with no tested rollback path turns incidents into fires", code: "Rollback = redeploy the PREVIOUS\nimmutable artifact, not a hotfix commit" },
        { term: "Big-bang deploys", desc: "100% traffic cutover with no canary/rolling step maximizes blast radius on any bug", code: "Prefer canary or rolling even for\nsmall teams -- the tooling cost is low" },
        { term: "Manual, undocumented deploy steps", desc: "Anything done by hand outside the pipeline isn't actually continuous delivery", code: "If a human SSHs in to 'finish' a deploy,\nit isn't really automated yet" },
      ],
    },
    {
      title: "DORA Metrics & Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Deployment frequency", desc: "How often an org successfully deploys to production -- elite teams: multiple times a day", code: "Elite: on-demand (multiple/day)\nLow: less than once per 6 months" },
        { term: "Lead time for changes", desc: "Time from commit to running in production", code: "Elite: less than one hour\nLow: more than 6 months" },
        { term: "Change failure rate", desc: "Percentage of deployments causing a production failure requiring remediation", code: "Elite: 0-15%\nLow: 46-60%" },
        { term: "Mean time to restore (MTTR)", desc: "How fast the team recovers from a production incident", code: "Elite: less than one hour\nLow: more than 6 months" },
        { term: "GitHub Actions / Jenkins / GitLab CI", desc: "Concrete pipeline-as-code implementations -- see the dedicated platform skills", code: "See: GitHub Actions and Jenkins skills" },
        { term: "Artifact registries", desc: "Docker Hub, ECR, GCR, Artifactory -- the handoff point between CI and CD", code: "docker push myregistry.io/app:sha256-abc" },
        { term: "Observability of the pipeline itself", desc: "Track build time trends and failure hot-spots, not just application metrics", code: "See the Logging, Metrics, and\nMonitoring platform skills" },
      ],
    },
  ],
};

export default cicd;
