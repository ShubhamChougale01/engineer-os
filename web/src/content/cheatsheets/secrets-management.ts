import type { CheatSheetData } from "./types";

const secretsManagement: CheatSheetData = {
  title: "The Ultimate Secrets Management Cheat Sheet",
  subtitle: "What counts as a secret · vaults vs env vars · rotation · Kubernetes · incident response",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "Secret", desc: "Any credential whose exposure grants access: API keys, DB passwords, TLS keys, signing keys, tokens", code: "AEOS_JWT_SECRET, AEOS_GITHUB_CLIENT_SECRET,\nAEOS_DATABASE_URL -- all secrets, not plain config" },
        { term: "Config vs secret", desc: "Config is safe to log/commit (feature flags, timeouts); secrets are never safe to expose", code: "APP_NAME=aeos          # config, fine to commit\nJWT_SECRET=...          # secret, never commit" },
        { term: "Never commit secrets to git", desc: "The cardinal rule — git history, forks, and CI logs all persist long after a 'quick fix'", code: "git rm --cached .env is NOT enough --\nthe secret is still in every prior commit" },
        { term: ".env file", desc: "Reasonable for local development only; not a production secrets strategy at scale", code: ".gitignore:\n.env\n.env.local" },
        { term: "Secrets manager", desc: "Dedicated service adding audit logs, fine-grained access, rotation, and dynamic issuance", code: "HashiCorp Vault, AWS Secrets Manager,\nGCP Secret Manager, Azure Key Vault" },
        { term: "Least privilege for credentials", desc: "Every credential should be scoped to exactly what it needs, nothing more", code: "DB user for the reporting service:\nSELECT only, no INSERT/UPDATE/DELETE" },
        { term: "Secret sprawl", desc: "The same credential copy-pasted across many services/configs — a rotation nightmare", code: "One leaked copy anywhere means\nrotating it everywhere it's duplicated" },
      ],
    },
    {
      title: "Rotation & Dynamic Secrets",
      color: "blue",
      rows: [
        { term: "Static secret", desc: "Long-lived credential that doesn't change until manually rotated", code: "Risk grows the longer it lives unrotated" },
        { term: "Secret rotation", desc: "Periodically issuing a new credential and retiring the old one", code: "Rotate on a schedule AND immediately\nafter any suspected exposure" },
        { term: "Dynamic secrets (Vault pattern)", desc: "Vault issues a short-lived DB credential on demand, auto-expiring in minutes", code: "vault read database/creds/my-role\n# returns a username/password valid for 5 minutes" },
        { term: "Zero standing privilege", desc: "The end-state goal: no long-lived credential exists anywhere at rest", code: "Every access is freshly issued,\nscoped, and time-bound" },
        { term: "Rotation without downtime", desc: "Support two valid credentials briefly during cutover (old + new)", code: "Add new secret, deploy consumers,\nthen revoke the old one" },
        { term: "Automatic rotation (cloud KMS)", desc: "AWS Secrets Manager/GCP Secret Manager can auto-rotate DB passwords on a schedule", code: "aws secretsmanager rotate-secret\n--secret-id prod/db/password" },
        { term: "Key versioning", desc: "Keep old key versions available briefly to verify already-issued tokens during rotation", code: "JWKS with multiple active kid values\nduring a signing-key rotation" },
      ],
    },
    {
      title: "Kubernetes & Containers",
      color: "emerald",
      rows: [
        { term: "Kubernetes Secret object", desc: "Base64-ENCODED, not encrypted by default — a critical common misconception", code: "kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d\n# trivially reversible without encryption at rest enabled" },
        { term: "Encryption at rest for etcd", desc: "Must be explicitly enabled — K8s Secrets are plaintext-equivalent in etcd otherwise", code: "EncryptionConfiguration with aescbc\nor a KMS provider plugin" },
        { term: "External Secrets Operator", desc: "Syncs secrets from Vault/AWS/GCP into K8s Secret objects automatically", code: "ExternalSecret CRD references\na path in the real secrets manager" },
        { term: "Vault Agent Injector", desc: "Sidecar injects secrets directly into a pod's filesystem, never touching etcd", code: "vault.hashicorp.com/agent-inject: 'true'\n# annotation on the pod spec" },
        { term: "RBAC on Secret objects", desc: "Restrict which service accounts/users can read which Secrets", code: "Role scoped to get/list on specific\nSecret names only -- see the RBAC skill" },
        { term: "Never bake secrets into images", desc: "Anyone who pulls the image gets the secret, and it's cached in registry layers", code: "# NEVER: ENV API_KEY=abc123 in a Dockerfile\n# instead: inject at runtime" },
        { term: "CI/CD secret masking", desc: "Platforms mask registered secret values in logs automatically", code: "GitHub Actions: \\${{ secrets.PROD_API_KEY }}\n# auto-masked if it appears in log output" },
      ],
    },
    {
      title: "Detection & Incident Response",
      color: "amber",
      rows: [
        { term: "git-secrets", desc: "Pre-commit hook blocking known secret patterns before they're committed", code: "git secrets --install\ngit secrets --register-aws" },
        { term: "truffleHog", desc: "Scans git history (not just the current tree) for high-entropy strings and known patterns", code: "trufflehog git file://. --only-verified" },
        { term: "GitHub secret scanning", desc: "Automatically flags known credential patterns pushed to a repo, even after the fact", code: "Enabled by default on public repos;\navailable via GHAS for private repos" },
        { term: "Assume compromise on any leak", desc: "Once a secret appears in a log, PR, or public repo, treat it as fully compromised", code: "Rotate immediately -- do not wait\nto confirm actual misuse first" },
        { term: "Audit access logs post-leak", desc: "Check what the leaked credential was actually used for during its exposure window", code: "Vault/cloud IAM audit logs show\nevery access attempt with that credential" },
        { term: "Incident runbook", desc: "Have a written, rehearsed process before an incident, not improvised during one", code: "1. Rotate  2. Audit  3. Notify\n4. Root-cause  5. Add a detection rule" },
        { term: "Post-incident detection rule", desc: "Every leak should result in a new automated check preventing recurrence", code: "Add the specific pattern to\ngit-secrets / CI scanning config" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "'It's a private repo, it's fine'", desc: "Private repos still get forked, cloned, and accessed by more people than expected", code: "Treat every repo as eventually public\nfor secrets-handling purposes" },
        { term: "Secrets in CI logs via print/echo debugging", desc: "A common accidental leak vector during troubleshooting", code: "Never echo/print an env var that\nmight hold a secret, even 'temporarily'" },
        { term: ".env committed by accident", desc: "Happens most often on a fresh clone before .gitignore is verified", code: "Verify .gitignore BEFORE the first\ngit add ., not after" },
        { term: "One shared secret for all environments", desc: "A dev/staging leak becomes a production compromise", code: "Separate secrets per environment,\nnever reused across dev/staging/prod" },
        { term: "Secrets in error messages / stack traces", desc: "Connection strings with embedded passwords often leak this way", code: "Redact connection strings in\nexception logging middleware" },
        { term: "No owner for a given secret", desc: "Nobody knows who to notify or how to rotate it when it's time", code: "Maintain a secrets inventory:\nowner, purpose, rotation schedule" },
        { term: "Long-lived cloud IAM access keys", desc: "Static long-lived keys are a bigger blast radius than short-lived assumed-role credentials", code: "Prefer OIDC-federated short-lived\nCI credentials over static access keys" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "HashiCorp Vault", desc: "Self-hosted or managed secrets engine with dynamic secrets and fine-grained policies", code: "vault kv get secret/prod/api-key" },
        { term: "AWS Secrets Manager", desc: "Managed secrets store with automatic rotation Lambda integration", code: "aws secretsmanager get-secret-value --secret-id prod/db" },
        { term: "GCP Secret Manager / Azure Key Vault", desc: "Cloud-native equivalents with IAM-integrated access control", code: "gcloud secrets versions access latest --secret=prod-db" },
        { term: "direnv / dotenv (local dev only)", desc: "Convenient local env loading — never the production mechanism", code: "echo 'export API_KEY=dev-only' >> .envrc" },
        { term: "SOPS", desc: "Encrypts secret VALUES in a file that's safe to commit, decrypted via a KMS key at deploy time", code: "sops --encrypt --kms arn:aws:kms:... secrets.yaml > secrets.enc.yaml" },
        { term: "Pre-commit hook enforcement", desc: "Block the commit locally before it ever reaches a shared branch", code: "pre-commit install\n# runs git-secrets/truffleHog on every commit" },
        { term: "OWASP reference", desc: "See the OWASP Top 10 skill — A07:2021-Identification and Authentication Failures", code: "Cross-reference: Encryption, TLS & HTTPS,\nDocker, Kubernetes, OWASP Top 10 skills" },
      ],
    },
  ],
};

export default secretsManagement;
