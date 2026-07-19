import type { SkillContent } from "../types";

/**
 * Terraform — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const terraform: SkillContent = {
  overview: `
Terraform is a declarative Infrastructure as Code (IaC) tool created by HashiCorp. You describe the cloud resources you want — a VPC, a Kubernetes cluster, a database, an IAM role — in configuration files written in HashiCorp Configuration Language (HCL), and Terraform figures out how to make the real world match that description. It works across virtually every cloud and service through a plugin system called providers, which is why it has become the closest thing the industry has to a universal infrastructure language.

For an AI engineer or platform engineer, Terraform is the tool that turns "click around in the AWS console" into a reviewable, versioned, repeatable artifact. Standing up the GPU instances, object storage buckets, networking, and IAM policies that an ML training pipeline or an LLM inference service needs is infrastructure work, and doing it by hand does not scale past a single environment. Terraform lets you define an environment once and reproduce it identically for dev, staging, and production, and lets a pull request — not a support ticket — be the unit of infrastructure change.

Key characteristics: declarative (you state the desired end state, not the steps to get there), provider-based (AWS, Azure, GCP, Kubernetes, GitHub, Datadog, and hundreds more are plugins, not built-in), stateful (a state file tracks what Terraform believes exists in the real world), and graph-driven (resources are nodes in a dependency graph that determines create/update/destroy order and safe parallelism). Terraform does not run continuously like a controller — it is invoked to reconcile config against state against reality, then it exits.
`,

  history: `
Terraform was created by **Mitchell Hashimoto** and **Armon Dadgar**, co-founders of **HashiCorp**, and first released in 2014. HashiCorp had already shipped Vagrant (dev environment automation) and Packer (image building); Terraform extended that "infrastructure as a reproducible artifact" philosophy to entire cloud environments, unifying provisioning across providers that previously each had their own bespoke SDK or console workflow.

| Year | Milestone |
|------|-----------|
| 2014 | Terraform 0.1 released — HCL config, single-provider AWS support, local state |
| 2015–2016 | Provider ecosystem grows: Azure, GCP, and dozens of others added |
| 2017 | Terraform 0.10 splits providers out of the core binary into independently versioned plugins |
| 2018 | Terraform 0.12 — first-class expressions, for-each, nested blocks in HCL2 (a major language overhaul) |
| 2019 | Terraform Cloud launched — hosted remote state, run pipelines, policy-as-code (Sentinel) |
| 2020 | Terraform 0.13 improves module source addressing and provider requirements |
| 2021 | Terraform 1.0 — the first stable, backward-compatibility-guaranteed release |
| 2021 | for_each and count more broadly supported; moved blocks for safe refactors |
| 2023 | HashiCorp changes Terraform's license from MPL 2.0 to the Business Source License (BSL) |
| 2023 | The Linux Foundation launches **OpenTofu**, a community-governed MPL fork, in response |
| 2024 | IBM completes its acquisition of HashiCorp |
| 2025+ | Terraform and OpenTofu continue to diverge and converge feature-by-feature; verify current licensing and roadmap on each project's site before betting a company on either |

The BSL relicensing is the single most important governance event in Terraform's history for engineers to understand: it means "Terraform" (the HashiCorp product) and "OpenTofu" (the open-source fork) are now two related but separately governed projects, and the choice between them is a real decision teams have to make, not just a rebrand.
`,

  "why-it-exists": `
Terraform exists because provisioning infrastructure by hand does not survive contact with a second environment, a second engineer, or a second year.

Before IaC, teams provisioned infrastructure through:

- **The cloud console (click-ops)**: an engineer logs into AWS, clicks through the VPC wizard, creates a security group, launches an instance. It works — once. Nobody can tell you exactly what was clicked six months later, and reproducing it for a second environment means clicking again and hoping you remember every setting.
- **Ad hoc shell scripts around the CLI**: better than clicking, but imperative — the script is a sequence of "create this, then that" commands with no awareness of current state. Re-running it against an environment that already has some resources either fails or duplicates them.
- **Configuration management tools (Chef, Puppet, Ansible)**: excellent at configuring the inside of a server, weaker as a general model for provisioning cloud-level resources (VPCs, IAM, managed databases) across many providers with a shared state model.

None of these gave you an answer to: "What does our infrastructure look like right now, and does it match what we intended?" Terraform's declarative model and state file exist specifically to answer that question — you describe the destination, Terraform diffs it against what it last knew to exist, and shows you exactly what would change before touching anything.
`,

  "problem-it-solves": `
Terraform removes specific, concrete pains:

- **Configuration drift**: someone manually tweaks a security group rule in the console during an incident; six months later nobody remembers, and the "documented" setup and the real setup have silently diverged. Terraform's plan step surfaces drift as soon as anyone runs it.
- **Non-reproducible environments**: "works in staging" fails in production because staging was hand-built by one engineer, and production by another, months apart, from memory. A Terraform module applied twice with different variables produces environments that are provably identical apart from the deliberate differences.
- **No audit trail**: console changes leave, at best, CloudTrail events that are hard to correlate with intent. Terraform changes go through version control — every infrastructure change is a diff, a commit, and (in a mature setup) a reviewed pull request.
- **Tribal knowledge / bus factor**: infrastructure that lives only in one engineer's head or click history is a serious operational risk. Infrastructure as code is infrastructure as documentation.
- **Slow, error-prone environment creation**: standing up a new environment (a new region, a new customer's isolated stack, a disaster-recovery replica) becomes "run apply with different variables" instead of a week of manual replication.

What Terraform deliberately does **not** solve:

- **In-instance configuration management** (installing packages, managing config files inside a running server) — that is the job of Ansible, cloud-init, or baked images (Packer), not Terraform's resource model, though Terraform can trigger them.
- **Application deployment** (rolling out a new container version to an already-provisioned Kubernetes cluster) — that is the job of the CI/CD and Kubernetes skills; Terraform provisions the cluster, not the day-to-day releases onto it.
- **Real-time reconciliation** — unlike a Kubernetes controller, Terraform does not continuously watch for drift and self-heal; it reconciles only when you run it.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain declarative vs imperative infrastructure automation and why Terraform's model is declarative.
2. Write HCL configuration using providers, resources, data sources, variables, and outputs.
3. Run the core workflow — write, plan, apply, destroy — and explain why "plan" is Terraform's most important safety feature.
4. Design and consume reusable modules, and structure a module for a VPC + subnet + security group used across multiple environments.
5. Explain what the state file is, why it exists, what it contains, and how drift detection works.
6. Configure a remote state backend (for example S3 + DynamoDB locking, or Terraform Cloud) and explain why state locking matters.
7. Reason about the dependency graph Terraform builds from resource references and how it determines apply order and parallelism.
8. Use workspaces (or an equivalent directory/module strategy) to manage dev/staging/prod from one configuration.
9. Identify state-file security risks and apply blast-radius-limiting practices in a production Terraform setup.
10. Answer senior-level interview questions on state, locking, the graph, and module design.
`,

  prerequisites: `
- **Required**: basic command-line comfort, and a conceptual understanding of what cloud resources are (a virtual machine, a network, a storage bucket) — see the **AWS**, **Azure**, or **GCP** skills for that grounding if you are new to cloud computing itself. This page starts from zero Terraform knowledge.
- **Helpful**: familiarity with **Git**, since Terraform configuration and (carefully) state are version-controlled artifacts, and with YAML/JSON-like config syntax in general.
- **For production sections**: familiarity with **Docker** and **Kubernetes** helps because Terraform is frequently used to provision the cluster and supporting infrastructure that those tools then run on top of; familiarity with **CI/CD** and **GitHub Actions** helps for the pipeline-driven apply sections.
- **For internals sections**: no compiler or graph-theory background is required — the dependency graph is explained from first principles.

Dependency links: **Git** and **AWS/Azure/GCP** → this page → **Kubernetes**, **CI/CD**, **GitHub Actions**, and **Secrets Management** all connect directly to what you learn here.
`,

  "beginner-concepts": `
### What a Terraform configuration looks like

Terraform configuration is written in **HCL** (HashiCorp Configuration Language), a declarative, block-structured language designed to be readable by humans and machines alike.

~~~hcl
# main.tf — declares a provider and one resource
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
~~~

### Providers

A **provider** is a plugin that teaches Terraform how to talk to a specific API — AWS, Azure, GCP, Kubernetes, GitHub, Datadog, and hundreds of others are published on the Terraform Registry. Declaring required_providers pins which provider and version your configuration needs; the provider block configures it (region, credentials, endpoints).

### Resources

A **resource** block declares a real infrastructure object you want to exist: a virtual machine, a storage bucket, a DNS record, an IAM role. Its type (aws_instance) is defined by the provider; its local name (web) is how you refer to it elsewhere in your configuration.

### Variables and outputs

~~~hcl
# variables.tf — inputs to the configuration
variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.micro"
}

# outputs.tf — values Terraform prints (and other configs can consume)
output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}
~~~

Variables make configuration reusable across environments without editing the resource blocks themselves. Outputs surface values — an IP address, an ARN, a connection string — that a human or another Terraform configuration needs after apply.

### The core workflow

~~~bash
terraform init      # download providers/modules, set up the backend
terraform plan       # dry run: show what WOULD change
terraform apply      # make the real infrastructure match the config
terraform destroy    # tear down everything this configuration manages
~~~

init is run once per clone (and again whenever providers/backends change); plan and apply are the everyday loop. Every one of these commands reads the current **state** to know what already exists — covered in depth in Internal Working.

### Data sources — reading, not creating

~~~hcl
# Look up an existing resource you did NOT create with this configuration
data "aws_vpc" "default" {
  default = true
}

resource "aws_subnet" "app" {
  vpc_id     = data.aws_vpc.default.id   # reference a data source's attribute
  cidr_block = "10.0.1.0/24"
}
~~~

A data source is a read-only query against the provider's API — use it to reference infrastructure that already exists (a shared VPC, an AMI lookup, an existing DNS zone) without Terraform trying to manage its lifecycle.

Common beginner trap: running terraform apply without reading the plan output first — covered in depth in Anti-Patterns and why "plan" is the single most important habit to build early.
`,

  "intermediate-concepts": `
### Modules — reusable, composable infrastructure

A **module** is just a directory of .tf files. Every Terraform configuration is technically a module (the "root module"); a **child module** is one you call from elsewhere, with inputs and outputs like a function.

~~~hcl
# modules/network/main.tf — a reusable VPC + subnet + security group module
variable "environment" {
  type = string
}
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  tags = {
    Name        = "vpc-" + var.environment
    Environment = var.environment
  }
}

resource "aws_subnet" "app" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 1)
  availability_zone = "us-east-1a"
}

resource "aws_security_group" "app" {
  name   = "app-sg-" + var.environment
  vpc_id = aws_vpc.this.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "vpc_id" {
  value = aws_vpc.this.id
}
output "subnet_id" {
  value = aws_subnet.app.id
}
output "security_group_id" {
  value = aws_security_group.app.id
}
~~~

~~~hcl
# environments/staging/main.tf — reuse the SAME module for two environments
module "network_staging" {
  source      = "../../modules/network"
  environment = "staging"
  vpc_cidr    = "10.1.0.0/16"
}

# environments/prod/main.tf
module "network_prod" {
  source      = "../../modules/network"
  environment = "prod"
  vpc_cidr    = "10.2.0.0/16"
}
~~~

This is the pattern that makes Terraform scale across a real org: write the VPC/subnet/security-group logic once, review it once, and every environment consumes a tested, versioned building block instead of copy-pasted HCL that drifts over time.

### count and for_each — declaring many similar resources

~~~hcl
# for_each: one resource per map/set entry, addressed by key (survives reordering)
variable "buckets" {
  type    = set(string)
  default = ["logs", "backups", "reports"]
}

resource "aws_s3_bucket" "data" {
  for_each = var.buckets
  bucket   = "myapp-" + each.value
}

# count: N copies, addressed by index (fragile if the list reorders)
resource "aws_instance" "worker" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.small"
  tags = {
    Name = "worker-" + count.index
  }
}
~~~

Prefer for_each over count for anything that might grow, shrink, or reorder — count identifies resources by numeric index, so removing item 1 of 3 causes Terraform to see items 2 and 3 as "changed" (it renumbers them), which can trigger unwanted replacements.

### Locals and expressions

~~~hcl
locals {
  common_tags = {
    ManagedBy = "terraform"
    Project   = var.project_name
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.latest.id
  instance_type = var.environment == "prod" ? "m5.large" : "t3.micro"
  tags          = local.common_tags
}
~~~

locals are named expressions scoped to a module — use them to avoid repeating a computed value (a merged tag map, a conditional instance size) across many resource blocks.

### Remote state as a data source

~~~hcl
# Consume another configuration's outputs without hardcoding values
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-tfstate-bucket"
    key    = "network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "app" {
  subnet_id = data.terraform_remote_state.network.outputs.subnet_id
}
~~~

This is how large organizations split infrastructure into smaller, independently-applied state files (network team owns the VPC config, application teams consume its outputs) — directly relevant to the blast-radius discussion in Production Usage and Security.
`,

  "advanced-concepts": `
### The dependency graph, precisely

Terraform does not apply resources in file order or declaration order. It parses every resource and data source, finds every reference between them (an attribute of one resource used in another's arguments), and builds a **directed acyclic graph (DAG)**. Nodes with no dependency edge between them can be created or destroyed in parallel (default parallelism is 10 concurrent operations); nodes with an edge are strictly ordered.

~~~hcl
resource "aws_vpc" "this" { cidr_block = "10.0.0.0/16" }

resource "aws_subnet" "app" {
  vpc_id     = aws_vpc.this.id     # creates an edge: subnet depends on vpc
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "web" {
  subnet_id = aws_subnet.app.id    # creates an edge: instance depends on subnet
}
~~~

Here the graph is a strict chain: vpc → subnet → instance. Terraform can only start the subnet once the VPC's ID is known, and the instance once the subnet's ID is known — this is also why Terraform can safely destroy in exactly the reverse order automatically, without you specifying it.

Explicit ordering without a data dependency uses depends_on, but it should be a last resort — it disables Terraform's ability to reason about the actual data relationship and is a common source of graphs that are harder to reason about than they need to be.

### Workspaces

~~~bash
terraform workspace new staging
terraform workspace new prod
terraform workspace select staging
terraform apply    # applies against staging's own state file
~~~

A **workspace** lets one configuration maintain multiple, isolated state files (one per environment) without duplicating .tf files. It's a lightweight alternative to the directory-per-environment pattern shown in Intermediate Concepts. The tradeoff: workspaces share the same backend and provider configuration, so if staging and prod need genuinely different regions, account credentials, or provider versions, separate root modules (directories) are the safer, more explicit choice most senior teams reach for at scale — workspaces work best for lightweight variants of the same environment (e.g. multiple short-lived feature-branch previews).

### Provisioners — and why to avoid them

~~~hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  provisioner "remote-exec" {
    inline = ["sudo apt-get update", "sudo apt-get install -y nginx"]
  }
}
~~~

provisioner blocks run arbitrary scripts as part of create/destroy — HashiCorp's own documentation calls them a last resort. They break the declarative model (Terraform cannot know if a script's effect matches the config on a future plan), have no drift detection, and commonly fail in ways that leave a resource "tainted." Prefer cloud-init/user_data, a purpose-built configuration management tool, or a pre-baked image (Packer) instead.

### Lifecycle meta-arguments

~~~hcl
resource "aws_db_instance" "primary" {
  # ...
  lifecycle {
    prevent_destroy       = true                 # refuse to destroy accidentally
    create_before_destroy = true                 # zero-downtime replace
    ignore_changes         = [tags["LastPatched"]] # ignore drift on a specific field
  }
}
~~~

These control HOW Terraform replaces or protects a resource, independent of what the resource itself does — critical for stateful resources (databases) where the default destroy-then-create order would cause an outage or data loss.

### Decision table: when a resource must be replaced vs updated in place

| Change | Behavior | Why |
|--------|----------|-----|
| Tag change | Update in place | Provider API supports mutating this attribute |
| AMI change on an EC2 instance | Destroy and recreate (unless a launch template/ASG is used) | Some attributes are only settable at creation |
| Adding a new for_each key | Create only the new instance | Existing keys are untouched — the graph only touches what changed |
| Removing a for_each key | Destroy only that instance | Same principle, in reverse |
| Provider version bump with breaking schema change | May force replacement | Provider authors control which attributes force new resources — check the CHANGELOG before upgrading |

Reading whether an attribute is "ForceNew" (triggers replacement) is a genuine senior skill — it's documented per-argument in each provider's registry docs, and terraform plan always shows "-/+" for a forced replacement so you see it before applying.
`,

  "internal-working": `
Terraform's core loop, every single time you run plan or apply, is: **read config, read state, query real infrastructure, reconcile, build a graph, walk the graph**.

~~~mermaid
flowchart TB
    A["HCL config files (.tf)"] --> D["Terraform core"]
    B["State file (terraform.tfstate)"] --> D
    D -->|"refresh: query provider APIs\nfor real current values"| C["Real infrastructure\n(AWS/Azure/GCP/K8s APIs)"]
    C --> D
    D --> E["Build dependency graph\n(resources + data sources + references)"]
    E --> F["Diff: desired (config) vs\nknown (refreshed state)"]
    F --> G["Plan: create / update / destroy\nper resource, in graph order"]
    G -->|"apply only"| C
    G --> H["Write new state file"]
~~~

Step by step:

1. **Parse configuration**: all .tf files in the working directory are parsed into an in-memory representation of providers, resources, data sources, variables, and modules.
2. **Read state**: Terraform loads terraform.tfstate (local file or remote backend) — a JSON document mapping every resource address (e.g. aws_instance.web) to the real-world ID Terraform created for it (e.g. i-0abc123) plus every attribute Terraform last knew about that object.
3. **Refresh**: for each resource in state, Terraform calls the provider's read API to fetch the object's CURRENT real attributes. This is how drift is detected — if someone manually changed a security group rule in the console, the refreshed value will differ from what's stored in state.
4. **Build the graph**: every resource and data source becomes a node; every reference (attribute-of-A used in the arguments of B) becomes an edge, producing a DAG (see Advanced Concepts).
5. **Diff**: Terraform compares desired state (your config) against the refreshed real state, resource by resource, attribute by attribute, and produces a plan — a typed set of actions (create, update in place, destroy, replace) per resource.
6. **Apply (if invoked)**: Terraform walks the graph, executing the planned action for each node, respecting dependency order and parallelizing independent branches (default: up to 10 concurrent operations). Each successful operation immediately updates the in-memory state, which is persisted (often incrementally) so a crash mid-apply doesn't lose track of what already succeeded.
7. **Persist state**: the final, updated state is written back to the backend, becoming the new baseline for the next plan.

The single most important internal fact to internalize: **the plan is a diff between three things — your code, the last known state, and the freshly refreshed real world** — not just a diff of your code against itself. That's why terraform plan can show changes even when you haven't edited a single line of HCL: something drifted in the real world since the last apply.
`,

  architecture: `
Think about Terraform at two levels: **how a single run is structured**, and **how a real organization structures many Terraform configurations across teams and environments**.

### Single-run architecture

~~~mermaid
flowchart LR
    CLI["terraform CLI"] --> Core["Terraform Core\n(graph engine, state management)"]
    Core <--> P1["AWS provider plugin"]
    Core <--> P2["Kubernetes provider plugin"]
    Core <--> P3["...any other provider"]
    Core <--> Backend["State backend\n(S3, Terraform Cloud, etc.)"]
    P1 <--> API1["AWS API"]
    P2 <--> API2["Kubernetes API server"]
~~~

Terraform Core itself is provider-agnostic: it knows nothing about "EC2 instances," only about resource schemas that providers register. Each provider is a separate binary, launched as a subprocess and communicated with over gRPC — this is why a broken or crashing provider plugin doesn't crash Terraform Core, and why anyone can publish a new provider without changing Terraform itself.

### Organizational architecture (how mature teams lay out configuration)

~~~
infra/
├── modules/                  # reusable building blocks, versioned in Git
│   ├── network/               # VPC, subnets, security groups
│   ├── eks-cluster/            # Kubernetes cluster + node groups
│   └── rds-postgres/           # managed database with backups configured
├── environments/
│   ├── dev/
│   │   ├── main.tf             # calls modules with dev-sized inputs
│   │   ├── backend.tf          # dev's own remote state config
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── ...                 # same shape, staging state, staging inputs
│   └── prod/
│       └── ...                 # same shape, prod state, prod inputs, stricter review
└── global/
    ├── iam/                    # account-wide IAM, rarely changed, tightly reviewed
    └── dns/                    # shared Route53/DNS zones
~~~

The core architectural principle: **each environment gets its own state file** (via separate root modules, not just workspaces, once an org is large enough), and modules are the only place resource logic is actually written. This limits blast radius (a mistaken apply in dev cannot touch prod's state) and lets a network or platform team own and version modules that application teams simply consume with different variables — directly mirroring the AWS/Azure/GCP account and Kubernetes namespace boundaries those platforms encourage.
`,

  "data-flow": `
Tracing one terraform apply from keystroke to updated infrastructure:

~~~mermaid
sequenceDiagram
    participant Eng as Engineer
    participant CLI as Terraform CLI
    participant State as State backend
    participant Prov as Provider plugin
    participant API as Cloud API

    Eng->>CLI: terraform apply
    CLI->>State: acquire state lock
    State-->>CLI: lock acquired (or blocked if already held)
    CLI->>State: read current state
    CLI->>Prov: refresh — read real attributes of each managed resource
    Prov->>API: GET/Describe calls
    API-->>Prov: current attributes
    Prov-->>CLI: refreshed state
    CLI->>CLI: build dependency graph, diff config vs refreshed state
    CLI-->>Eng: show plan (create/update/destroy per resource)
    Eng->>CLI: type "yes" to confirm
    CLI->>Prov: execute create/update/destroy calls, in graph order
    Prov->>API: Create/Update/Delete calls
    API-->>Prov: new resource attributes (IDs, IPs, ARNs)
    Prov-->>CLI: results per resource
    CLI->>State: write updated state
    CLI->>State: release lock
    CLI-->>Eng: apply complete, outputs printed
~~~

The two moments that matter most in production: **lock acquisition** (nobody else can apply concurrently while this run holds the lock — see Security and internal-working for why) and **the plan confirmation gate** (everything up to "show plan" is read-only; nothing in the real world changes until the engineer — or a CI pipeline's approval gate — explicitly confirms). In a CI/CD pipeline (see the CI/CD and GitHub Actions skills), that manual "yes" is replaced by a required reviewer approving the plan output on a pull request before an automated apply job runs.
`,

  "production-usage": `
### Project and tooling setup

~~~bash
terraform init                 # download providers + modules, configure backend
terraform fmt -recursive        # canonical formatting, enforced in CI
terraform validate              # syntax + internal consistency check, no API calls
terraform plan -out=tfplan       # save the exact plan that will be applied
terraform apply tfplan           # apply EXACTLY the reviewed plan — no surprises
~~~

Saving the plan to a file and applying that exact file (rather than re-running plan-then-apply separately) guarantees that what a reviewer approved is bit-for-bit what gets applied, even if the real world changed in the interim — a subtle but important production discipline.

### Standard project layout

A production Terraform repo separates reusable modules from environment-specific root configurations (shown in full in Architecture), pins provider and Terraform versions in a required_providers / required_version block, and commits a .terraform.lock.hcl file (the provider equivalent of a package-lock.json) so every engineer and every CI run resolves identical provider versions.

### Remote backend configuration

~~~hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-org-tfstate"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"   # state locking
    encrypt        = true
  }
}
~~~

Every production team uses a remote backend, never local state — covered in depth in Internal Working (state) and Security (why local state is unacceptable for a team).

### Operational defaults senior teams enforce

- terraform plan runs automatically on every pull request that touches infra/ (via CI/CD); the plan output is posted as a PR comment for review.
- terraform apply runs only after merge, from a controlled pipeline identity — never from an engineer's laptop against production.
- Variables for secrets (database passwords, API keys) come from a secrets manager or CI secret store, never from committed .tfvars files — see the Secrets Management skill.
- Every module and root configuration pins exact or constrained provider versions; upgrades are a deliberate, tested PR, not an accident of "whatever init downloaded today."
`,

  "industry-examples": `
- **HashiCorp itself**: dogfoods Terraform to manage the infrastructure behind Terraform Cloud and its other products; the company's entire go-to-market for its enterprise tier (Terraform Cloud/Enterprise) is built around policy-as-code (Sentinel) and team collaboration workflows layered on top of the open-source core.
- **Slack**: has published engineering writeups on migrating large parts of its AWS footprint to Terraform-managed configuration to replace inconsistent, hand-built environments and to give on-call engineers a single source of truth for what exists.
- **CircleCI**: uses Terraform to provision and version the cloud infrastructure behind its own CI/CD platform, applying the same "infra as reviewable code" discipline it sells to customers for their pipelines.
- **GitLab**: manages significant portions of its own SaaS infrastructure with Terraform, and documents its module structure and state-splitting strategy publicly as a reference for large-scale multi-environment setups.
- **Cloud Posse and other DevOps consultancies**: built widely-adopted open-source Terraform module libraries (used by thousands of companies) that standardize VPC, EKS, and RDS provisioning patterns — a strong signal of how much of the industry treats "write your own VPC module from scratch" as solved, reusable work rather than a bespoke project.

Pattern to notice: companies running multi-cloud or multi-account setups at scale almost universally reach for Terraform or its close relatives (Pulumi, OpenTofu, CloudFormation/CDK for AWS-only shops) rather than maintaining click-ops runbooks — the audit trail and reproducibility requirements of SOC 2 / compliance regimes make IaC close to mandatory past a certain company size.
`,

  "best-practices": `
1. **Always read the plan before applying.** This is not optional discipline — it is Terraform's core safety mechanism (see Internal Working and Data Flow). Never pipe -auto-approve into a human-facing workflow for anything that isn't disposable/dev infrastructure.
2. **Use remote state with locking, always**, even solo. A laptop crash mid-apply against local state can leave state and reality irreconcilably out of sync.
3. **Keep state files small and scoped** (network, database, application-per-team) rather than one giant state for an entire account — this limits blast radius and apply time, and reduces lock contention between teams.
4. **Pin provider and Terraform versions**, and commit .terraform.lock.hcl — an unpinned provider upgrade can silently change resource behavior between two applies.
5. **Prefer for_each over count** for any collection that might change size or order, to avoid unnecessary resource replacement from index renumbering.
6. **Never hand-edit the state file.** Use terraform state mv, terraform import, or moved blocks for refactors — direct edits desync state from what Terraform's own commands expect.
7. **Treat modules like a public API**: version them (Git tags or a private registry), document inputs/outputs, and avoid breaking changes to published module interfaces without a major version bump.
8. **Keep secrets out of variables files and state where possible**; where a resource's attributes will inevitably include a secret (e.g. a generated DB password), treat the state file itself as sensitive — see Security.
9. **Run terraform fmt and terraform validate in CI** on every PR; treat formatting and syntax errors as a merge blocker, not a nitpick.
10. **Use data sources instead of hardcoding IDs** (AMI IDs, existing VPC IDs) so configuration adapts across regions and accounts instead of embedding brittle magic strings.
11. **Tag every resource consistently** (environment, owner, cost-center) via a shared locals block — this is what makes cost allocation and cleanup tooling possible at scale.
12. **Review terraform plan output for "-/+" (replace) actions with special scrutiny** on stateful resources — a database replacement is a data-loss event unless you've explicitly planned migration/snapshot steps around it.
`,

  "anti-patterns": `
### auto-approve in a shared environment

~~~hcl
# WRONG: skips the human review step entirely
# terraform apply -auto-approve   (run against staging/prod)

# RIGHT: plan is saved, reviewed (by a human or a CI gate), THEN applied
# terraform plan -out=tfplan
# terraform apply tfplan
~~~

-auto-approve is fine for a disposable local sandbox destroyed the same day; anywhere else it removes the one safeguard Terraform gives you.

### One giant state file for everything

~~~hcl
# WRONG: a single root module manages network + database + every microservice
# One typo in an unrelated service's config can block or corrupt applies
# for the entire account, and every apply takes longer as the graph grows

# RIGHT: split by blast radius and team ownership
# infra/network/      -> its own state
# infra/database/      -> its own state, references network's outputs via remote_state
# infra/services/api/   -> its own state, references database's outputs
~~~

### Hardcoding values that should be data sources or variables

~~~hcl
# WRONG: a hardcoded AMI ID breaks the moment you change region or the AMI ages out
resource "aws_instance" "web" {
  ami = "ami-0c55b159cbfafe1f0"
}

# RIGHT: look it up, so the config is portable and stays current
data "aws_ami" "latest_al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}
resource "aws_instance" "web" {
  ami = data.aws_ami.latest_al2023.id
}
~~~

### Manually editing the state file

Editing terraform.tfstate by hand (or scripting edits to it) to "fix" a resource address or attribute is a classic way to desync state from reality in a way Terraform's own tooling can't reason about. Use terraform state mv for renames/refactors, terraform import to bring an existing resource under management, and moved blocks (Terraform 1.1+) to record refactors declaratively in configuration.

### Treating provisioners as normal configuration

Reaching for a remote-exec provisioner to install software on a freshly created instance, instead of user_data/cloud-init or a pre-baked image, reintroduces the exact imperative, non-idempotent, no-drift-detection problems Terraform was built to remove. See Advanced Concepts for the full explanation.

### Ignoring the "-/+" (replace) column in plan output

Approving a plan without noticing a stateful resource (a database, a persistent volume) is marked for destroy-then-create is one of the most common causes of real production data loss in Terraform-managed environments. Read every plan; don't just check that "no errors" appeared.
`,

  performance: `
### Measure first

~~~bash
TF_LOG=TRACE terraform apply 2> trace.log   # verbose internal logging
terraform plan -out=tfplan                   # time this step directly
time terraform apply tfplan
~~~

TF_LOG (levels TRACE, DEBUG, INFO, WARN, ERROR) shows exactly where time goes: provider plugin RPC calls, API request/response bodies, and graph-building steps. For a plan that feels slow, TRACE almost always reveals it's dominated by refresh calls to a provider's API, not Terraform's own graph logic.

### The optimization hierarchy (apply in order)

1. **Split large state files into smaller ones.** A single state file with thousands of resources means every plan refreshes every one of them, even when you only care about one. This is the single biggest lever — smaller, purpose-scoped state (Architecture, Anti-Patterns) is both a safety practice and a performance one.
2. **Use -target sparingly, and only for genuine emergencies**, to plan/apply a subset of resources. It is explicitly documented by HashiCorp as a break-glass tool, not a routine workflow, because it can produce a plan that's inconsistent with the full graph.
3. **Increase -parallelism only when you understand the provider's API rate limits.** The default of 10 concurrent operations is a reasonable balance; raising it against an API with tight rate limits produces throttling errors, not speed.
4. **Reduce data source calls that aren't needed on every run.** Each data source is a live API call during refresh; a module that unnecessarily re-looks-up static values (an account ID that never changes) adds refresh time for no benefit — consider a variable instead if the value is genuinely static.
5. **Use a provider's bulk/plural data sources where available** (e.g. querying many subnets in one data source call) rather than one data source per item in a loop, which multiplies API round trips.
6. **Cache and reuse the provider plugin cache directory** (TF_PLUGIN_CACHE_DIR) across CI runs and local machines so terraform init doesn't re-download unchanged provider binaries every time.

### What actually moves the needle in practice

Teams that complain about "Terraform is slow" almost always have a single monolithic state file with hundreds to thousands of resources; splitting it by team/environment ownership routinely cuts plan time from minutes to seconds, because refresh calls scale with the number of resources IN that state file, not the size of the account.
`,

  scalability: `
Terraform's own "scale" story is less about horizontal servers (it's a CLI tool, not a running service) and more about **how configuration and state scale across a growing organization**.

~~~mermaid
flowchart TB
    subgraph Small["Small team"]
        S1["One repo,\none state file"]
    end
    subgraph Growing["Growing org"]
        G1["modules/ (shared, versioned)"]
        G2["environments/dev — own state"]
        G3["environments/staging — own state"]
        G4["environments/prod — own state"]
        G1 --> G2
        G1 --> G3
        G1 --> G4
    end
    subgraph Large["Large org, many teams"]
        L1["Platform team owns:\nnetwork, IAM, cluster modules"]
        L2["App team A: own state,\nconsumes platform outputs"]
        L3["App team B: own state,\nconsumes platform outputs"]
        L1 -.remote_state outputs.-> L2
        L1 -.remote_state outputs.-> L3
    end
    Small -->|"grows into"| Growing
    Growing -->|"grows into"| Large
~~~

### Bottleneck table

| Bottleneck | Cause | Answer |
|------------|-------|--------|
| Slow terraform plan | Too many resources in one state file | Split state by environment/team (see Performance, Architecture) |
| Apply lock contention | Multiple engineers/pipelines applying the same state concurrently | Smaller, team-scoped state files; queue applies through CI rather than local runs |
| Provider API rate limiting during apply | -parallelism too high for the provider's limits | Lower parallelism; batch resource creation with for_each rather than many separate applies |
| Module sprawl / duplicated logic | No shared module registry or convention | Publish modules to a private registry or Git tags; enforce their use via review |
| Cross-team coordination overhead | Teams applying against shared resources they don't own | Clear ownership boundaries; platform team owns foundational modules, app teams consume outputs only |

The scaling principle that generalizes: Terraform state scales the way a monolith-vs-microservices decision scales — smaller, independently-owned units of state trade a bit of cross-referencing complexity (via remote_state data sources) for much better isolation, faster applies, and safer concurrent work across a growing number of teams.
`,

  security: `
### State file security — the most Terraform-specific risk

The state file frequently contains **plaintext secrets**: a generated database password, a TLS private key, an API token issued by a provider resource — anything a resource's attributes include, Terraform's state stores in full, unencrypted-by-default JSON. Consequences and defenses:

1. **Never commit state to Git.** A .tfstate file in a public (or even private) repository is a secrets leak waiting to be discovered.
2. **Use a backend with encryption at rest** (S3 with SSE, Terraform Cloud, Azure Storage with encryption) — never local state for anything beyond a personal sandbox.
3. **Restrict IAM/RBAC access to the state backend as tightly as you would restrict access to a secrets manager** — anyone who can read the state file can potentially read every secret it contains.
4. **Treat terraform output -json and terraform show as sensitive commands**; mark genuinely sensitive output values with sensitive = true so they're redacted from routine CLI output (this does not encrypt them in the state file itself, only in the CLI's default display).
5. **See the Secrets Management skill** for how to keep secrets out of Terraform entirely where possible: reference a secrets manager ARN/path in your resource rather than generating and storing the secret's plaintext value inside Terraform-managed state.

### State locking prevents concurrent-apply corruption

Two engineers (or a human and a CI pipeline) running apply against the same state at the same time can each read a stale copy of state, make conflicting changes, and write back a corrupted result where Terraform's records no longer match reality. A locking backend (DynamoDB alongside S3, or Terraform Cloud's built-in locking) makes the second apply block or fail immediately with a clear "state is locked" error instead of silently racing — this is a correctness guarantee, not just a convenience.

### Provider credentials

- Never hardcode cloud credentials in .tf files; use environment variables, instance/pod identity (IAM roles, workload identity), or a credentials helper — the same guidance as the AWS/Azure/GCP skills.
- Scope the credentials Terraform runs with to the minimum permissions the configuration actually needs; a CI pipeline's Terraform identity having full account admin is a common and serious over-privilege.

### Supply chain

- Pin exact provider versions and commit .terraform.lock.hcl; an unpinned provider upgrade pulled from the registry is a supply-chain risk exactly like an unpinned npm/PyPI dependency.
- Prefer providers and modules from HashiCorp-verified or well-known publishers on the registry; audit third-party module source before pointing production configuration at it.

### Policy as code

Sentinel (Terraform Cloud/Enterprise) and the open-source Open Policy Agent (OPA) let teams enforce rules like "no security group may allow ingress from 0.0.0.0/0 on port 22" automatically as part of the plan/apply pipeline — a stronger guarantee than relying on every reviewer catching it by eye.

See the dedicated **Secrets Management** skill for vault integration patterns and rotation, and the **AWS/Azure/GCP** skills for provider-level IAM hardening.
`,

  testing: `
Terraform testing spans a spectrum from cheap static checks to full apply-and-verify integration tests.

~~~bash
terraform fmt -check -recursive   # formatting drift check
terraform validate                 # syntax + internal reference validity, no API calls
terraform plan -out=tfplan          # is the plan what you expect? (manual or scripted review)
~~~

### Native Terraform tests (1.6+)

~~~hcl
# tests/network.tftest.hcl
run "creates_expected_subnet_cidr" {
  command = plan

  variables {
    environment = "test"
    vpc_cidr    = "10.9.0.0/16"
  }

  assert {
    condition     = aws_subnet.app.cidr_block == "10.9.1.0/24"
    error_message = "Subnet CIDR did not derive correctly from vpc_cidr"
  }
}

run "applies_without_error" {
  command = apply   # actually creates real (or mocked) resources for this run

  assert {
    condition     = aws_vpc.this.cidr_block == "10.9.0.0/16"
    error_message = "VPC CIDR mismatch after apply"
  }
}
~~~

Run with terraform test — this is HashiCorp's own first-party test framework, supporting both plan-only assertions (fast, no real resources) and apply-based runs (slower, real infrastructure, torn down automatically at the end of the run).

### Third-party tooling

- **Terratest** (Go) — spins up real infrastructure via terraform apply, asserts against the live resources (e.g. curl an endpoint, query an API), then destroys it; the standard for genuine integration testing of modules.
- **Checkov / tfsec / Terrascan** — static analysis that scans HCL for security misconfigurations (open security groups, unencrypted storage, overly broad IAM) without ever calling a provider API; run these in CI on every PR.
- **OPA / Conftest** — policy testing against the plan's JSON output (terraform show -json tfplan), for org-specific rules beyond generic security scanning.

### Senior testing doctrine

- Static checks (fmt, validate, tfsec/Checkov) run on every PR, fast, no cost.
- terraform plan output should be reviewed by a human on every PR touching shared/production infrastructure — this is Terraform's most important "test."
- Full apply-based integration tests (Terratest, terraform test with command = apply) run against genuinely disposable sandbox accounts, on a schedule or before a module version is tagged — not on every single commit, because they cost real money and take real time.
- Test modules, not root configurations, in isolation where possible — a module is the reusable unit, so it deserves its own test suite independent of any one environment's root config.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read terraform plan output carefully first.** Most "why did Terraform want to do that?" questions are answered directly in the plan's diff — look for "# forces replacement" annotations and unexpected attribute changes.
2. **terraform validate** — catches syntax errors and invalid references before you even touch a provider.
3. **TF_LOG environment variable** — set to DEBUG or TRACE for verbose internal and provider-RPC logging when a plan/apply fails mysteriously:

~~~bash
TF_LOG=DEBUG terraform apply 2> debug.log
grep -i "error" debug.log
~~~

4. **terraform console** — an interactive REPL against your current state/config, useful for testing an expression (a cidrsubnet call, a conditional) without a full plan/apply cycle:

~~~bash
terraform console
> cidrsubnet("10.0.0.0/16", 8, 3)
"10.0.3.0/24"
~~~

5. **terraform show** — print the current state (or a saved plan file) in human-readable or JSON form, to inspect exactly what Terraform believes exists.

~~~bash
terraform show                 # current state, human-readable
terraform show -json tfplan | jq .   # saved plan as structured JSON
~~~

6. **terraform state list / terraform state show <address>** — list every resource address Terraform is tracking, and inspect one resource's full recorded attributes.
7. **Provider-specific API error messages**: most "apply failed" errors are actually the underlying cloud API rejecting the request (a permissions error, an invalid parameter, a quota limit) — Terraform surfaces the raw provider error text; read it, don't just read Terraform's wrapper message.

### Debugging drift specifically

If terraform plan shows unexpected changes with no corresponding config edit, something changed in the real world since the last apply (a manual console change, another tool, an auto-scaling event). terraform plan itself is the drift-detection tool — refresh happens automatically as part of every plan (see Internal Working).

### Debugging a stuck lock

~~~bash
terraform force-unlock <LOCK_ID>   # ONLY after confirming no other apply is actually running
~~~

Use only after verifying (via the backend, e.g. checking the DynamoDB lock table or Terraform Cloud's run history) that the process holding the lock genuinely crashed rather than is still legitimately running — force-unlocking a live apply is how state corruption happens.
`,

  monitoring: `
Terraform itself is not a long-running service, so "monitoring" here means **visibility into infrastructure changes and drift over time**, not a running process's metrics.

### What to track

- **Every plan and apply, who ran it, and what changed** — Terraform Cloud/Enterprise records this natively; a self-hosted CI pipeline should log the plan output artifact and the approving identity for every apply, ideally to an audit-log-friendly store.
- **Drift**: scheduled terraform plan runs (with no apply) against production state, alerting if any changes are detected, catch manual console changes before they become an incident.
- **State file changes**: enabling versioning on the S3 bucket (or equivalent) backing your state gives you a rollback point and an audit trail of every state mutation, independent of Terraform's own logging.

### Scripted drift detection example

~~~bash
#!/usr/bin/env bash
# Run on a schedule (e.g. nightly via CI); alert if drift is detected.
set -euo pipefail

terraform init -input=false
PLAN_EXIT=0
terraform plan -detailed-exitcode -out=drift.tfplan || PLAN_EXIT=$?

# -detailed-exitcode: 0 = no changes, 1 = error, 2 = changes present
if [ "$PLAN_EXIT" -eq 2 ]; then
  echo "DRIFT DETECTED — see attached plan" | mail -s "Terraform drift: prod" oncall@example.com
  exit 1
fi
exit 0
~~~

-detailed-exitcode is the mechanism that makes automated drift monitoring possible — it distinguishes "no changes" (0) from "changes pending" (2) from "actual error" (1), which a plain exit code cannot.

### Cost visibility

- **Infracost** integrates into the CI pipeline to estimate the dollar cost delta of a plan before merge — showing "+$340/month" on a pull request is a strong practical control against accidental oversized resources.
- Cloud-native cost tools (AWS Cost Explorer tags, Azure Cost Management) rely on the consistent tagging enforced by your Terraform modules (see Best Practices) to attribute spend back to the team/environment that provisioned it.
`,

  deployment: `
Terraform is typically "deployed" as a CI/CD pipeline step rather than a long-running service. The production-grade pattern:

~~~yaml
# .github/workflows/terraform.yml — sketch, see the GitHub Actions skill for depth
name: terraform
on:
  pull_request:
    paths: ["infra/**"]
  push:
    branches: [main]
    paths: ["infra/**"]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra/environments/prod init
      - run: terraform -chdir=infra/environments/prod fmt -check
      - run: terraform -chdir=infra/environments/prod validate
      - run: terraform -chdir=infra/environments/prod plan -out=tfplan
      # post the plan as a PR comment for human review before merge

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production   # requires a manual approval gate in GitHub
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra/environments/prod init
      - run: terraform -chdir=infra/environments/prod apply -auto-approve tfplan
~~~

Why each choice matters: plan runs on every pull request so reviewers see the real diff before merging, not after; apply only runs on main and only after the plan job succeeded, so nothing gets applied that wasn't reviewed; the environment: production gate adds a mandatory human approval click in GitHub Actions immediately before the apply job executes, giving a final safety checkpoint even after merge; -auto-approve is safe here specifically because it's applying the exact tfplan artifact a human already reviewed, not a freshly regenerated plan.

### Backend bootstrapping

The remote state backend (the S3 bucket + DynamoDB table, or the Terraform Cloud workspace) has to exist before any configuration can use it — teams typically provision this "bootstrap" infrastructure with a small, separate, manually-applied Terraform configuration (or via the cloud console once) precisely because a configuration can't remotely store its own state before that state store exists.

### Rollback

Terraform does not have a built-in "rollback" command — the correct mental model is: revert the .tf files in Git to the previous commit, then run plan/apply again, letting Terraform compute the diff back to the prior desired state. This is why state file versioning (S3 bucket versioning) and Git history together, not a single "undo" button, are what production teams rely on to recover from a bad apply.
`,

  "production-checklist": `
Before a Terraform-managed environment takes real production traffic:

- [ ] Remote state backend configured with encryption at rest (S3+SSE, Terraform Cloud, or equivalent)
- [ ] State locking enabled (DynamoDB table or backend-native locking) and verified with a concurrent-apply test
- [ ] .terraform.lock.hcl committed; provider and Terraform core versions pinned
- [ ] State bucket/backend has versioning enabled for rollback and audit history
- [ ] IAM/RBAC on the state backend restricted to the minimum set of identities that need it
- [ ] No secrets committed in .tfvars files or HCL; secrets sourced from a vault/secrets manager or CI secret store
- [ ] terraform fmt, terraform validate, and a security scanner (tfsec/Checkov) run in CI on every PR
- [ ] terraform plan runs automatically on every PR touching infra, with output visible to reviewers
- [ ] apply is gated behind merge to main plus a required human approval step
- [ ] State is split by environment/team ownership — no single state file spans dev/staging/prod
- [ ] lifecycle { prevent_destroy = true } set on genuinely irreplaceable resources (production databases, critical S3 buckets)
- [ ] Module sources are pinned to a Git tag/version, not a floating branch
- [ ] Scheduled drift-detection plan job configured with alerting
- [ ] Runbook exists: how to force-unlock safely, how to recover from a partially-failed apply, how to roll back via Git + re-apply
- [ ] Cost estimation (Infracost or equivalent) wired into the PR pipeline
- [ ] Disaster recovery test performed: can the environment be rebuilt from configuration alone, from scratch, in a new account/region?
`,

  "common-mistakes": `
1. **Running apply without reading plan** — the fix Terraform gives you for free (a dry-run diff) is worthless if nobody reads it; this is the root cause of most Terraform-related incidents.
2. **Local state on a team project** — works fine solo, then two engineers apply within an hour of each other and state silently diverges from reality.
3. **Treating count as a stable identity** — removing an item from the middle of a counted list renumbers every subsequent resource, causing Terraform to plan destroy-and-recreate for resources that didn't conceptually change. Use for_each instead (see Advanced Concepts).
4. **Hardcoding account-specific values** (AMI IDs, VPC IDs, account numbers) directly into modules meant to be reused across accounts/regions — breaks portability the first time the module is used somewhere else.
5. **One monolithic state file** for an entire account — slow plans, high lock contention, and a mistake anywhere can block or corrupt applies everywhere (see Performance, Anti-Patterns).
6. **Forgetting that destroy runs in dependency-reverse order automatically** and fighting it with unnecessary depends_on, instead of trusting the graph derived from actual attribute references.
7. **Manually editing or deleting the state file** to "fix" a problem, instead of using terraform state mv/rm/import — this is the single fastest way to permanently desync Terraform's understanding from reality.
8. **Ignoring provider version constraints**, letting init silently pick up a new major version with breaking schema changes right before a critical apply.
9. **Not marking sensitive outputs as sensitive = true** — plaintext secrets end up in CI logs and terminal scrollback even when the state backend itself is properly secured.
10. **Skipping lifecycle { prevent_destroy = true } on stateful resources**, so a variable rename or a module refactor that Terraform interprets as "destroy and recreate" silently deletes a production database.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Error acquiring the state lock | Another apply/plan is running, or a previous run crashed without releasing the lock | Wait for the other run to finish; if genuinely orphaned, verify then terraform force-unlock |
| Error: Resource already exists | Resource was created outside Terraform (console, another tool) but not imported | terraform import the existing resource into state before applying |
| Error: Reference to undeclared resource | Typo in a resource address, or the referenced resource was removed/renamed | Check terraform state list; use moved blocks or state mv for renames |
| Error: Cycle: resource A -> resource B -> resource A | A circular dependency between resources, often via depends_on misuse | Remove the manual depends_on; let real attribute references define the graph |
| Provider produced inconsistent result after apply | A provider bug, or a resource attribute that changes asynchronously after creation | Re-run plan/apply; file/check the provider's GitHub issues; consider ignore_changes for genuinely eventual-consistency fields |
| Error: Invalid count argument | count depends on a value only known after apply (a computed attribute) | Restructure to avoid needing count before the value is known, or use for_each with a known key set |
| context deadline exceeded / timeout | Provider API is slow or rate-limited, especially for large resources (RDS, EKS clusters) | Increase provider-specific timeouts blocks; check for API throttling |
| Backend initialization required / backend config changed | backend.tf changed since last init | terraform init -reconfigure or -migrate-state as appropriate |
| Error: Unsupported argument | Using an argument the provider version installed doesn't support (schema drift between versions) | Check the provider CHANGELOG/registry docs for the pinned version; upgrade deliberately |

The habit that matters: the provider's own error text (often embedded after Terraform's wrapper message) usually names the exact API-level problem — read past Terraform's summary line into the underlying error body.
`,

  faqs: `
**Q: Is Terraform the same thing as OpenTofu?**
No, though they share a common history. Terraform is HashiCorp's product, now under the Business Source License (since 2023). OpenTofu is a Linux Foundation-governed fork that remains under the original open-source MPL 2.0 license, created in response to that relicensing. The two have started to diverge feature-by-feature; check each project's current documentation before choosing, and don't assume perpetual compatibility between them.

**Q: Do I need a remote backend for a personal side project?**
For solo, disposable experimentation, local state is fine. The moment a second person touches the same infrastructure, or the infrastructure is something you'd be upset to lose track of, move to a remote backend with locking.

**Q: Can Terraform manage infrastructure it didn't create?**
Yes, via terraform import (bringing an existing resource under management) — but it's a deliberate, resource-by-resource operation, not automatic discovery. Terraform will not manage a resource it doesn't know about from either its state or an import.

**Q: What's the difference between a module and a workspace?**
A module is reusable configuration (like a function); a workspace is a mechanism for one configuration to maintain multiple isolated state files. They solve different problems and are often used together — see Advanced Concepts for when workspaces are and aren't the right tool for separating environments.

**Q: Why does Terraform want to destroy and recreate a resource I barely changed?**
Some resource attributes are only settable at creation time (documented per-argument by the provider as "ForceNew"); changing them forces a replace. Read the "-/+" annotations in plan output — they always tell you which attribute triggered it.

**Q: Should Terraform deploy my application code too?**
Generally no — Terraform provisions the infrastructure (the cluster, the database, the load balancer); application deployment onto already-provisioned infrastructure is the job of your CI/CD pipeline and Kubernetes manifests/Helm charts (see the CI/CD, GitHub Actions, and Kubernetes skills). Mixing the two in one Terraform apply usually means every app deploy risks touching infrastructure it shouldn't.

**Q: How do I handle secrets Terraform needs to create (like a random database password)?**
Generate it with the random provider or let the cloud provider generate it, but immediately store the value in a secrets manager (see the Secrets Management skill) rather than relying on the Terraform state file as your secret store — and mark the output sensitive = true regardless.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between declarative and imperative infrastructure automation?* Declarative (Terraform) states the desired end result and lets the tool compute the steps; imperative (a shell script calling the AWS CLI) specifies the exact sequence of actions to run, with no built-in awareness of current state.
2. *What does terraform plan do, and why is it important?* It's a dry run — Terraform refreshes real infrastructure state, diffs it against your configuration, and shows exactly what would be created/changed/destroyed, without making any changes. It's the safety gate that lets you catch mistakes before they happen.
3. *What is a provider in Terraform?* A plugin that implements the API calls for a specific platform (AWS, Azure, GCP, Kubernetes, etc.); Terraform Core is provider-agnostic and communicates with providers over gRPC.
4. *What's a data source vs a resource?* A resource is something Terraform creates and manages the lifecycle of; a data source is a read-only lookup of something that already exists, used for reference only.
5. *What is a Terraform module?* A directory of configuration that can be called with input variables and produces output values, like a function — used to make infrastructure patterns reusable across environments.

**Senior:**

6. *Explain what the state file is and why Terraform needs it.* State maps every managed resource's Terraform address to its real-world ID and last-known attributes. Terraform needs it because cloud APIs generally don't expose "what did I create with tool X" — state is Terraform's own record, and it's what plan diffs against (alongside a live refresh) to detect drift and compute the next action.
7. *Why does state locking matter, and what happens without it?* Concurrent applies against the same state can each read a stale copy, make conflicting changes, and write back results that don't match reality or each other — genuine state corruption. A locking backend (DynamoDB, Terraform Cloud) makes a second concurrent run fail fast with a clear lock error instead.
8. *How does Terraform decide the order to create/destroy resources?* It builds a directed acyclic graph from every reference between resources/data sources (an attribute of A used in B's arguments creates an edge), then walks the graph, parallelizing independent branches and strictly ordering dependent ones; destroy walks the same graph in reverse.
9. *When would you use workspaces vs separate root modules/directories for environments?* Workspaces suit lightweight variants sharing the same provider config and region (e.g. short-lived preview environments); separate root modules/directories are safer once environments need genuinely different credentials, regions, or provider versions, because workspaces share backend and provider configuration.
10. *What are the security risks of the Terraform state file specifically, and how do you mitigate them?* State frequently contains plaintext secrets (generated passwords, keys) as resource attributes. Mitigate with an encrypted remote backend, tight IAM/RBAC on that backend, sensitive = true on outputs, and treating the backend with the same access discipline as a secrets manager.
11. *Design question: how would you structure Terraform for an org with 5 teams each owning independent services on shared cloud infrastructure?* A platform team owns foundational modules (network, IAM, cluster) with their own state; each application team gets its own root configuration/state that consumes the platform's outputs via terraform_remote_state or a documented module interface, limiting blast radius and letting teams apply independently without touching each other's state.
12. *Your terraform plan shows a resource being replaced that you didn't expect to change — how do you investigate?* Read the plan's "-/+" annotation for which attribute forced it, check whether that attribute is documented as ForceNew for the resource type, check for an unpinned provider version upgrade that may have changed schema behavior, and check for real-world drift via a recent manual change.
`,

  "coding-questions": `
### 1. Write a module-shaped VPC + subnet + security group configuration parameterized by environment

~~~hcl
# Demonstrates: variables, resource composition, tagging locals, outputs
variable "environment" {
  type = string
}
variable "vpc_cidr" {
  type = string
}
variable "allowed_ingress_cidrs" {
  type    = list(string)
  default = ["10.0.0.0/8"]   # production consideration: never default to 0.0.0.0/0
}

locals {
  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  tags       = merge(local.tags, { Name = "vpc-" + var.environment })
}

resource "aws_subnet" "app" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 1)
  availability_zone = "us-east-1a"
  tags              = local.tags
}

resource "aws_security_group" "app" {
  name   = "app-" + var.environment
  vpc_id = aws_vpc.this.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_ingress_cidrs   # never hardcode 0.0.0.0/0 in a reusable module
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

output "vpc_id" { value = aws_vpc.this.id }
output "subnet_id" { value = aws_subnet.app.id }
output "security_group_id" { value = aws_security_group.app.id }
~~~

Complexity/tradeoff discussion: one subnet/AZ shown for clarity; production would use for_each over a list of AZs for multi-AZ redundancy. Follow-up they'll ask: "how would you make this multi-AZ?" — Answer: for_each = toset(var.azs) on the subnet resource, deriving each CIDR with cidrsubnet(var.vpc_cidr, 8, index).

### 2. Fix the count-to-for_each migration bug

~~~hcl
# WRONG: removing "backups" from the middle renumbers "reports",
# causing Terraform to plan a destroy+recreate of a bucket that
# conceptually didn't change at all.
variable "bucket_names" {
  type    = list(string)
  default = ["logs", "backups", "reports"]
}
resource "aws_s3_bucket" "data" {
  count  = length(var.bucket_names)
  bucket = "myapp-" + var.bucket_names[count.index]
}

# RIGHT: for_each keys by value, so removing "backups" only destroys
# the "backups" bucket — "logs" and "reports" are untouched.
variable "bucket_names" {
  type    = set(string)
  default = ["logs", "backups", "reports"]
}
resource "aws_s3_bucket" "data" {
  for_each = var.bucket_names
  bucket   = "myapp-" + each.value
}
~~~

Complexity: O(1) resources affected per addition/removal with for_each, vs potentially O(n) unnecessary replacements with count. Follow-up: "what if you need ordered, index-dependent naming?" — Answer: use for_each over a map(string) where the map's keys ARE the stable identity, and derive any ordering purely for display, not for resource addressing.

### 3. Import an existing hand-created resource into Terraform management

~~~hcl
# Step 1: write the resource block matching the real resource's expected config
resource "aws_s3_bucket" "existing_logs" {
  bucket = "myapp-prod-logs-a1b2c3"
}
~~~

~~~bash
# Step 2: import it — Terraform now tracks it in state without recreating it
terraform import aws_s3_bucket.existing_logs myapp-prod-logs-a1b2c3

# Step 3: immediately run plan — it MUST show "no changes" before you touch anything else
terraform plan
~~~

Production consideration: if plan shows unexpected changes after import, your resource block's arguments don't yet match the real resource's actual configuration — reconcile the HCL to match reality first, never the reverse, to avoid an accidental destructive change to a resource that was working fine before you started managing it with Terraform.
`,

  "hands-on-labs": `
### Lab 1 — First VPC and instance (beginner, ~1h)
Write a configuration with a provider block, one aws_vpc, one aws_subnet, one aws_instance, and outputs for the instance's public IP. Run init, plan, apply, then destroy. Deliverable: a screenshot/paste of the plan output annotated with what each line means. Skills: providers, resources, variables, outputs, the core workflow.

### Lab 2 — Build the reusable network module (intermediate, ~2h)
Extract Lab 1's VPC/subnet/security-group logic into a modules/network directory with variables for environment and CIDR, then call it twice from two separate environments/dev and environments/staging root configurations with different inputs. Deliverable: both environments applied simultaneously, plus a short writeup of what stayed identical and what differed. Skills: modules, variable-driven reuse, environment separation.

### Lab 3 — Remote state, locking, and a deliberate drift (advanced, ~3h)
Migrate Lab 2 to an S3 (or equivalent) backend with DynamoDB locking. Manually change a resource in the cloud console (e.g. add a tag), then run terraform plan and observe drift detection. Then intentionally start two terraform apply runs at once and observe the lock error. Deliverable: a short report showing the drift plan output and the lock-contention error message. Skills: state, remote backends, locking, drift detection — the internal-working concepts made concrete.

### Lab 4 — CI-driven plan/apply pipeline (production, ~3h)
Wire Lab 2/3's configuration into a GitHub Actions workflow: plan on every PR (posted as a comment), apply only on merge to main with a required manual approval environment gate. Add tfsec or Checkov as a PR check. Deliverable: a merged PR showing the full plan-review-approve-apply trail. Skills: the entire production/deployment section, end to end, directly connecting to the CI/CD and GitHub Actions skills.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Multi-environment platform module library** — Build a modules/ library (network, EKS/GKE/AKS cluster, RDS/managed database, IAM roles) with clean input/output contracts, versioned via Git tags, and three environments (dev/staging/prod) each consuming it with different sizing. Demonstrates: module design, environment isolation, state splitting, real cloud provider fluency (pairs directly with the AWS/Azure/GCP and Kubernetes skills).

2. **CI/CD-gated Terraform pipeline with policy checks** — A GitHub Actions pipeline that runs fmt/validate/tfsec/Infracost on every PR, posts the plan as a comment, requires manual approval before apply, and blocks any plan that would create a security group open to 0.0.0.0/0 on a sensitive port (via a Conftest/OPA policy check on the plan JSON). Demonstrates: the full production workflow, policy-as-code, and direct integration with the CI/CD and GitHub Actions skills.

3. **Drift-detection and cost-reporting dashboard** — A scheduled job that runs terraform plan -detailed-exitcode nightly across every environment's state, posts drift alerts to Slack/email when detected, and runs Infracost to track month-over-month cost trend per environment. Demonstrates: monitoring discipline applied to infrastructure, scripting around the Terraform CLI's exit codes, and operational maturity beyond just "writing HCL."

Each project: modules pinned and versioned, remote state with locking, secrets sourced from a vault (see Secrets Management), a README with an architecture diagram, and a written explanation of the blast-radius decisions made. The state-splitting and review discipline is what separates a portfolio piece from a toy repo in interviews.
`,

  "case-studies": `
### The HashiCorp BSL relicensing and the OpenTofu fork
In 2023, HashiCorp changed Terraform's license from the open-source MPL 2.0 to the more restrictive Business Source License, aiming to limit competitors from selling Terraform-as-a-service without contributing back. The response was a Linux Foundation-backed fork, OpenTofu, formed within weeks by companies with a direct stake in keeping a permissively-licensed option available. Lesson: even foundational tooling choices carry governance risk — evaluate licensing terms, not just technical features, before betting critical infrastructure tooling on any single vendor, and understand that "the ecosystem" can genuinely fork if enough users have aligned incentives to do so.

### Slack's infrastructure standardization
Slack has written publicly about consolidating years of organically grown, partly-manual AWS infrastructure into Terraform-managed configuration, specifically to give on-call engineers a single, reliable source of truth during incidents instead of guessing what the console currently shows versus what was intended. Lesson: the audit-trail and single-source-of-truth benefits of IaC pay off most visibly not during normal operations but during an incident, when stale tribal knowledge is most dangerous.

### The rise of shared module libraries (Cloud Posse and similar)
Widely-adopted open-source module collections for common patterns (VPC, EKS, RDS) emerged because thousands of companies were independently solving the identical "how do we provision a production-grade VPC" problem from scratch. Lesson: infrastructure patterns that are genuinely common (networking, managed Kubernetes, managed databases) are largely solved, reusable problems — writing them from scratch in 2026 is usually a sign of not having surveyed the ecosystem first, whereas the genuinely differentiated work is in how modules are composed for a specific org's needs.

### Terraform Cloud and policy-as-code adoption
HashiCorp's Sentinel (and the parallel rise of OPA-based policy checking on plan JSON) emerged because plan review alone did not scale — as organizations grew past a handful of reviewers, relying purely on a human catching "this security group is open to the world" in a PR diff became unreliable. Lesson: as an organization scales, some safety guarantees that started as human review discipline eventually need to become automated, machine-enforced policy.
`,

  comparisons: `
| Dimension | Terraform | OpenTofu | Pulumi | AWS CloudFormation / CDK | Ansible |
|-----------|-----------|----------|--------|--------------------------|---------|
| Language | HCL (declarative DSL) | HCL (same, forked) | Real languages (TS, Python, Go) | YAML/JSON (CFN); real languages (CDK, compiles to CFN) | YAML (declarative-ish, executes imperatively) |
| Multi-cloud | Yes, provider ecosystem is the widest | Yes, same providers as Terraform | Yes, via its own provider bridges | AWS-only | Cloud-agnostic, but weaker cloud-resource modeling than Terraform |
| License | Business Source License (since 2023) | MPL 2.0 (open source) | Apache 2.0 (core) | Proprietary to AWS, free to use | GPL |
| State model | Explicit state file, backend-configurable | Same model as Terraform | Explicit state, backend-configurable | Managed by AWS, no user-visible state file | No persistent state model — re-runs and checks current condition each time |
| Primary strength | Ecosystem breadth, maturity, huge module/provider registry | Same as Terraform, community governance | Full programming language power (loops, tests, IDE support) natively | Deepest, most native AWS integration | Best at in-instance configuration, not cloud resource provisioning |
| Primary weakness | HCL is a DSL — no real loops/functions beyond what HCL provides | Younger project, ecosystem still catching up in tooling/certifications | Smaller community than Terraform; still state-file based like Terraform | Locked into AWS only | Weak state/drift model for cloud-level resources |

**How seniors choose**: Terraform (or OpenTofu) when multi-cloud or broad provider coverage matters and the team is fine with a config-language approach; Pulumi when the team wants real programming-language ergonomics (loops, unit tests, IDE autocomplete) and is comfortable with a state model similar to Terraform's; CloudFormation/CDK when the shop is AWS-only and wants the deepest native integration with zero extra state-management concerns; Ansible stays in the stack alongside any of these specifically for in-instance configuration, not as a Terraform replacement. Terraform vs OpenTofu specifically is increasingly a licensing and governance decision as much as a technical one — verify current feature parity before choosing.
`,

  "related-technologies": `
- **AWS / Azure / GCP** — the providers Terraform most commonly provisions resources in; deep cloud-specific knowledge from those skills is what makes Terraform configuration correct, not just syntactically valid.
- **Kubernetes** — Terraform frequently provisions the cluster itself (EKS/GKE/AKS) and its supporting infrastructure as code, while workloads running on top are managed by Kubernetes manifests/Helm — see the Kubernetes skill for that boundary.
- **Docker** — Terraform can provision the infrastructure that runs containers (ECS, EKS nodes, Cloud Run services) but does not build container images itself; that's Docker's job.
- **Git** — Terraform configuration (and, carefully, state backend configuration) is version-controlled; the review workflow this platform's Git skill teaches is exactly how Terraform changes should be reviewed.
- **CI/CD and GitHub Actions** — the pipeline that runs terraform plan on every PR and terraform apply on merge; see those skills for the general pipeline patterns Terraform plugs into.
- **Jenkins** — an alternative, self-hosted CI engine some organizations use to run the same plan/apply pipeline pattern instead of GitHub Actions.
- **Secrets Management** — because Terraform state can contain plaintext secrets and Terraform needs credentials to authenticate to providers, this skill covers the vault/rotation patterns that keep both safe.
- **Ansible** — commonly paired with Terraform: Terraform provisions the servers/cluster, Ansible (or cloud-init) configures what runs inside them.
- **Packer** — HashiCorp's image-building tool, often used alongside Terraform to produce the pre-baked machine images that Terraform-provisioned instances boot from, avoiding the need for provisioners.
- **OpenTofu** — the open-source fork of Terraform; understand the licensing history (History section) before assuming long-term feature parity between the two.

On this platform, the natural next pages after Terraform: **Kubernetes** → **CI/CD** → **GitHub Actions** → **Secrets Management**.
`,

  "latest-updates": `
Verified against my knowledge through my training cutoff (early 2026) — check terraform.io and opentofu.org for anything newer.

- **Terraform 1.x line**: has maintained backward compatibility since the 1.0 stability guarantee (2021); recent 1.x releases have continued refining for_each ergonomics, moved blocks for safe resource address refactors, and the native terraform test framework (introduced 1.6) for plan- and apply-based module testing.
- **The BSL license and OpenTofu fork** (2023) remain the most consequential recent event in the ecosystem — verify the current license terms for whichever variant (Terraform or OpenTofu) your organization is evaluating, since licensing decisions are exactly the kind of fact that can change and should not be assumed stable.
- **IBM's acquisition of HashiCorp** (completed 2024) continues to shape roadmap and commercial strategy for Terraform Cloud/Enterprise; watch for how this affects open-source vs. paid-tier feature placement going forward.
- **OpenTofu's ongoing feature additions**: the fork has shipped some features ahead of or differently from Terraform (for example, encryption-related capabilities for state) as an independently governed project — treat feature parity between the two as something to verify per-version rather than assume.
- **Ecosystem tooling**: policy-as-code (OPA/Conftest, Sentinel) and cost-estimation tooling (Infracost) have become close to standard in mature CI pipelines rather than niche add-ons.

Given how fast the Terraform/OpenTofu licensing and feature landscape has moved since 2023, verify current licensing terms and version-specific feature availability directly on terraform.io and opentofu.org before making a long-term tooling commitment.
`,

  "future-roadmap": `
Where the declarative IaC space is heading, and what's worth betting career time on:

1. **Terraform and OpenTofu will likely keep partially diverging.** Expect feature differences to accumulate on both sides (state encryption, provider tooling, enterprise features) — the deeper skill of understanding HCL, the state/graph model, and provider concepts transfers fully between them regardless of which one "wins" in your organization.
2. **Policy-as-code becomes closer to a default, not an add-on.** As organizations scale past manual plan-review-only workflows, automated policy checking (OPA/Sentinel-style) on plan output is increasingly treated as a baseline production requirement, not an advanced/optional practice.
3. **Testing maturity keeps increasing.** The native terraform test framework (and Terratest before it) signal that "just eyeball the plan" is being supplemented, not replaced, by real automated test suites for modules — expect this to become a stronger interview and hiring signal over time.
4. **Competition from real-programming-language IaC (Pulumi and similar) continues**, pressuring HCL to keep adding expressiveness (the for_each/moved-block trajectory is part of that pressure) rather than staying a purely static config language.
5. **Deeper platform-engineering integration**: Terraform increasingly sits behind self-service internal developer platforms (Backstage and similar), where application teams request infrastructure through a portal that generates and applies Terraform on their behalf rather than writing HCL directly — understanding the underlying Terraform model remains valuable even as the direct authoring experience shifts for many engineers.

For your career: bet on deeply understanding state, the dependency graph, and module design over memorizing any one provider's resource arguments — those fundamentals transfer across Terraform, OpenTofu, and even Pulumi, while resource-argument specifics change every provider release.
`,

  "cheat-sheet": `
~~~hcl
# --- Core workflow ---
# terraform init      -> download providers/modules, configure backend
# terraform plan       -> dry run: show create/update/destroy diff
# terraform apply       -> make real infra match config
# terraform destroy      -> tear down everything this config manages
# terraform fmt -recursive / terraform validate  -> style + syntax checks

# --- Provider + resource ---
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}
provider "aws" { region = "us-east-1" }

resource "aws_instance" "web" {
  ami           = data.aws_ami.latest.id
  instance_type = var.instance_type
  tags          = local.common_tags
}

# --- Data source (read-only lookup) ---
data "aws_vpc" "default" { default = true }

# --- Variables + outputs ---
variable "instance_type" { type = string; default = "t3.micro" }
output "public_ip" { value = aws_instance.web.public_ip; sensitive = false }

# --- Locals ---
locals {
  common_tags = { ManagedBy = "terraform", Env = var.environment }
}

# --- Module: define + call ---
# modules/network/main.tf defines variables/resources/outputs
module "network" {
  source      = "../../modules/network"
  environment = "staging"
}

# --- for_each (prefer over count) ---
resource "aws_s3_bucket" "data" {
  for_each = toset(["logs", "backups"])
  bucket   = "myapp-" + each.value
}

# --- Lifecycle guards ---
resource "aws_db_instance" "primary" {
  lifecycle {
    prevent_destroy       = true
    create_before_destroy = true
    ignore_changes         = [tags]
  }
}

# --- Remote backend (S3 + locking) ---
terraform {
  backend "s3" {
    bucket         = "my-tfstate"
    key            = "prod/network.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# --- Remote state as data source ---
data "terraform_remote_state" "network" {
  backend = "s3"
  config  = { bucket = "my-tfstate", key = "network.tfstate", region = "us-east-1" }
}

# --- Workspaces ---
# terraform workspace new staging
# terraform workspace select staging

# --- State inspection / surgery ---
# terraform state list
# terraform state show aws_instance.web
# terraform state mv aws_instance.old aws_instance.new
# terraform import aws_s3_bucket.existing my-bucket-name
# terraform force-unlock <LOCK_ID>

# --- Debug ---
# TF_LOG=DEBUG terraform apply
# terraform console
# terraform plan -detailed-exitcode   # 0=no changes, 1=error, 2=changes
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Declarative vs imperative IaC | Declarative states the desired end result (Terraform); imperative specifies the exact steps to run (a shell script) |
| Why is terraform plan the most important safety feature? | It's a read-only dry run that shows exactly what would change before anything real happens |
| What does the state file store? | A mapping of each resource's Terraform address to its real-world ID and last-known attributes |
| How does Terraform detect drift? | It refreshes real infrastructure via the provider during plan and compares it against stored state |
| Why use a remote backend? | Enables team collaboration, locking, and encryption at rest — local state doesn't survive concurrent or multi-person use |
| Why does state locking matter? | Prevents two concurrent applies from reading stale state and writing back conflicting, corrupted results |
| What builds the dependency graph? | References between resources/data sources — an attribute of A used in B's arguments creates an edge |
| count vs for_each | count identifies by numeric index (fragile on reorder); for_each identifies by stable map/set key |
| What is a module? | A directory of reusable configuration callable with input variables, producing outputs — like a function |
| Why avoid provisioners? | They run imperative scripts with no drift detection, breaking Terraform's declarative model |
| What does prevent_destroy do? | Blocks Terraform from destroying a specific resource, guarding irreplaceable resources like production databases |
| What's the main state-file security risk? | It often contains plaintext secrets as resource attributes and must be encrypted and access-restricted |
| Workspaces vs separate root modules | Workspaces share backend/provider config for lightweight variants; separate directories suit genuinely different accounts/regions |
| What does -detailed-exitcode enable? | Scripted drift detection: 0 = no changes, 1 = error, 2 = changes pending |
| Terraform vs OpenTofu | Terraform is HashiCorp's BSL-licensed product; OpenTofu is the Linux Foundation-governed MPL fork created after the 2023 relicensing |
`,

  mcqs: `
**1. What is the primary purpose of terraform plan?**

A) Apply changes immediately  B) Show a dry-run diff of what would change, without altering real infrastructure  C) Delete unused resources  D) Format HCL files

**Answer: B** — plan refreshes real state and diffs it against configuration, making no actual changes.

**2. Which best describes the state file's role?**

A) It stores your HCL source code  B) It's a cache of provider documentation  C) It maps each managed resource's address to its real-world ID and attributes  D) It's only used for terraform destroy

**Answer: C** — state is how Terraform knows what it previously created and what its attributes were.

**3. Why is for_each generally preferred over count for a set of similar resources?**

A) for_each is faster to type  B) count doesn't support tags  C) for_each identifies resources by stable key, avoiding renumbering-triggered replacements when the collection changes  D) count is deprecated

**Answer: C** — count's numeric indexing means removing a middle item shifts every subsequent index, causing unwanted replacements.

**4. What does a locking backend (e.g. DynamoDB alongside S3) prevent?**

A) Slow plans  B) Two concurrent applies from corrupting state by racing on the same resource  C) Provider version mismatches  D) HCL syntax errors

**Answer: B** — locking serializes applies against the same state so concurrent runs can't produce conflicting writes.

**5. A resource shows "-/+" in plan output. What does that mean?**

A) It will be updated in place  B) It will be destroyed and recreated (replaced)  C) It's a data source, not a resource  D) It has a syntax error

**Answer: B** — "-/+" specifically denotes destroy-then-create, often because a changed attribute is only settable at creation time.

**6. What is the main risk that makes Terraform state files sensitive?**

A) They're always publicly readable by default  B) They can contain plaintext secrets as resource attributes  C) They must be written in HCL  D) They can only be stored locally

**Answer: B** — generated passwords, keys, and tokens created by resources are stored as plaintext attributes in state unless specifically handled otherwise.
`,

  "revision-notes": `
**Core model in 5 lines:** Terraform is declarative IaC — you describe desired infrastructure in HCL, Terraform reconciles it against reality. Providers are plugins that implement a specific platform's API (AWS/Azure/GCP/Kubernetes/etc). Resources are managed objects; data sources are read-only lookups. Variables parameterize configuration; outputs surface results. Modules package reusable resource logic like a function.

**Workflow in 4 lines:** init downloads providers/modules and configures the backend. plan is a read-only dry-run diff — the single most important safety step. apply executes the plan against real infrastructure. destroy tears down everything the configuration manages, in dependency-reverse order.

**State and graph in 6 lines:** The state file maps every managed resource's address to its real-world ID and last-known attributes — Terraform's only record of what it created. Every plan/apply refreshes real infrastructure and diffs it against state, which is how drift is detected. References between resources build a directed acyclic graph; independent branches parallelize, dependent ones are strictly ordered. State locking (DynamoDB, Terraform Cloud) prevents concurrent applies from corrupting state via a race. Remote backends (S3, Terraform Cloud) are mandatory for any team setting, both for locking and for encryption at rest of what may be sensitive data. Never hand-edit the state file — use state mv/rm/import or moved blocks.

**Production discipline in 5 lines:** Split state by team/environment to limit blast radius and keep plans fast. Pin provider/Terraform versions and commit the lock file. Run fmt/validate/security-scan in CI on every PR; plan on every PR, apply only after merge plus human approval. Keep secrets out of committed files, sourced from a vault instead. Use lifecycle { prevent_destroy = true } on irreplaceable resources.

**Interview reflexes:** plan as the core safety mechanism, state's dual role (bookkeeping + drift detection), why locking matters, count vs for_each replacement behavior, module design as a reusable-function mental model, workspaces vs separate root modules, and the state-file-contains-secrets risk.
`,

  "learning-roadmap": `
A realistic path to production-ready Terraform competence (adjust pace to your cloud background):

**Week 1 — Foundations.** Beginner Concepts + Lab 1. Write and destroy a real VPC/instance in a free-tier account. Milestone: you can explain init/plan/apply/destroy to someone else without notes.

**Week 2 — Modules and reuse.** Intermediate Concepts + Lab 2. Extract a network module and call it from two environments with different variables. Milestone: the same module produces two provably-consistent-but-distinct environments.

**Week 3 — State and remote backends.** Internal Working, Architecture, Advanced Concepts (graph, workspaces) + Lab 3. Migrate to remote state with locking; deliberately trigger and observe drift and lock contention. Milestone: you can explain, from memory, what's actually inside the state file and why refresh happens on every plan.

**Week 4 — Production and CI/CD.** Production Usage → Deployment sections + Lab 4. Wire a GitHub Actions plan/apply pipeline with a manual approval gate and a security scanner. Milestone: a merged PR with a full plan-review-approve-apply trail you can show in an interview.

**Week 5 — Depth and interview polish.** Security, Performance, Scalability sections; work through the Interview and Coding Questions. Read one real module from the Terraform Registry end to end. Milestone: explain state locking, the dependency graph, and count-vs-for_each out loud, unprompted.

Then continue to **Kubernetes** on this platform — the cluster Terraform provisions is exactly where Kubernetes-native workload management takes over.
`,

  "official-docs": `
- [Terraform documentation](https://developer.hashicorp.com/terraform/docs) — the reference for CLI commands, configuration language, and backends.
- [Terraform Language documentation](https://developer.hashicorp.com/terraform/language) — the precise HCL syntax and semantics reference (resources, variables, expressions, functions).
- [Terraform Registry](https://registry.terraform.io/) — the provider and module catalog; the source of truth for any resource's exact arguments and which are ForceNew.
- [Terraform CLI reference](https://developer.hashicorp.com/terraform/cli) — every subcommand (state, import, console, workspace, etc.) with flags.
- [OpenTofu documentation](https://opentofu.org/docs/) — the open-source fork's docs; check for divergence from Terraform's behavior before assuming parity.
- [HashiCorp's Terraform release notes / CHANGELOG](https://github.com/hashicorp/terraform/blob/main/CHANGELOG.md) — read on every version upgrade; provider schema and core behavior changes are documented here.
`,

  books: `
- **Terraform: Up and Running, 3rd ed.** — Yevgeniy Brikman. The standard introduction-through-production book; covers modules, state, and team workflows with real examples.
- **Terraform in Action** — Scott Winkler. Focuses on writing and testing real-world modules and provisioning patterns.
- **Infrastructure as Code, 2nd ed.** — Kief Morris. Broader than just Terraform — the conceptual foundation for why IaC works and how to structure teams and pipelines around it.
- **The DevOps Handbook** — Kim, Humble, Debois, Willis. Not Terraform-specific, but the operational and cultural context (why CI/CD, why small batches) that IaC tooling exists to support.
- **Site Reliability Engineering** (Google, free online) — for the production-operations mindset that informs how a mature team treats infrastructure changes (change management, blast radius, postmortems) — directly relevant once you're running Terraform in production.
`,

  blogs: `
- **HashiCorp blog** (hashicorp.com/blog) — official release announcements, feature deep-dives, and case studies from HashiCorp's own engineering.
- **Gruntwork blog** (gruntwork.io/blog) — the team behind Terraform: Up and Running writes deeply practical production Terraform content.
- **Cloud Posse blog/docs** — the team behind widely-used open-source Terraform modules; strong opinions on module and state organization.
- **OpenTofu blog** (opentofu.org/blog) — announcements and rationale from the fork's governance and roadmap decisions.
- **Company engineering blogs** (Slack, GitLab, CircleCI) — search their engineering blogs for "Terraform" for real production war stories referenced in Case Studies.
- **Spacelift and env0 blogs** — commercial Terraform-automation platforms that publish genuinely useful comparative content on state management, drift detection, and policy-as-code patterns.
`,

  "research-papers": `
Terraform itself is an industry tool rather than the subject of academic research, so there isn't a body of dedicated "Terraform papers" — the closest useful reading is foundational work on infrastructure automation and configuration management that Terraform's design descends from and competes with:

- **"What is Infrastructure as Code?"** class writeups and IEEE/ACM articles on configuration management drift and reproducibility — search for "infrastructure as code" + "configuration drift" in ACM Digital Library for peer-reviewed framing of the exact problem Terraform solves.
- Academic work on **declarative configuration management and idempotence** (much of the foundational thinking traces to the Puppet/Chef era of research on convergent configuration systems) is the closest theoretical ancestor to Terraform's plan/apply model.
- For the graph-theoretic side: any standard **topological sort / DAG scheduling** reference (a data structures and algorithms text, or the classic CLRS chapter on graph algorithms) explains precisely the algorithm class Terraform's dependency graph execution belongs to.

If you want primary-source rigor here, the most honest reading is HashiCorp's own RFCs and design documents (published on GitHub for major features like moved blocks and the native test framework) rather than academic papers — Terraform's design decisions are documented as engineering RFCs, not peer-reviewed research.
`,

  videos: `
- **HashiConf talks** (HashiCorp's annual conference, recordings on YouTube) — official deep-dives on new features (moved blocks, testing framework, state encryption) directly from the engineers who built them.
- **Yevgeniy Brikman's Terraform talks** (search "Gruntwork Terraform") — the author of Terraform: Up and Running explaining production patterns, often with live demos of module design and state management.
- **"Terraform state deep dive" style conference talks** (search HashiConf archives) — several editions have covered state internals, locking, and drift in detail, complementing the Internal Working section here.
- **OpenTofu community calls/talks** — recorded governance and roadmap discussions, useful for understanding how the fork's decision-making differs from HashiCorp's.
- **freeCodeCamp / TechWorld with Nana Terraform tutorials** — solid structured beginner-to-intermediate walkthroughs for hands-on learners.
`,

  "github-repos": `
- [hashicorp/terraform](https://github.com/hashicorp/terraform) — the core source; the CHANGELOG and docs/ directory are the most reliable place to verify version-specific behavior.
- [opentofu/opentofu](https://github.com/opentofu/opentofu) — the open-source fork; compare its issues/CHANGELOG to Terraform's to see where the two have diverged.
- [terraform-aws-modules/terraform-aws-vpc](https://github.com/terraform-aws-modules/terraform-aws-vpc) — a widely-used, production-grade reference VPC module; excellent for studying real module design.
- [cloudposse/terraform-aws-components](https://github.com/cloudposse/terraform-aws-components) — a large, opinionated library of reusable components across many AWS services.
- [gruntwork-io/terragrunt](https://github.com/gruntwork-io/terragrunt) — a thin wrapper around Terraform for keeping multi-environment configuration DRY; study it after you've felt the pain it solves.
- [gruntwork-io/terratest](https://github.com/gruntwork-io/terratest) — the standard Go library for real integration testing of Terraform modules.
- [aquasecurity/tfsec](https://github.com/aquasecurity/tfsec) and [bridgecrewio/checkov](https://github.com/bridgecrewio/checkov) — static security scanners for HCL; read their rule sets as a checklist of what NOT to do.
- [infracost/infracost](https://github.com/infracost/infracost) — cost estimation for Terraform plans; study its GitHub Action integration for the PR-comment pattern.
- [hashicorp/terraform-provider-aws](https://github.com/hashicorp/terraform-provider-aws) — the AWS provider source; browsing an individual resource's schema file shows you exactly which arguments are ForceNew.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Core workflow fluency*: provision a VPC + one EC2 instance from scratch in a free-tier account; destroy it; do this three times from memory without looking at docs.
2. *Modules*: refactor a flat 100-line configuration into two modules (network, compute) with clean variable/output contracts, then call the modules from two environments.
3. *for_each mastery*: given a list of five S3 buckets defined with count, migrate it to for_each without Terraform planning to destroy and recreate any existing bucket (use terraform state mv or moved blocks to handle the address change safely).
4. *State surgery*: intentionally rename a resource in your configuration, then reconcile state using terraform state mv or a moved block so Terraform sees a rename, not a destroy+create.
5. *Remote state consumption*: split one configuration into two (network, application), and have the application configuration consume the network's outputs via terraform_remote_state.
6. *Drift detection*: manually change a resource in the cloud console, then write a script using terraform plan -detailed-exitcode that exits non-zero specifically when drift (not error) is detected.
7. *Policy checking*: write a Conftest/OPA policy (or a simple script over terraform show -json) that fails a plan containing any security group with ingress from 0.0.0.0/0 on port 22.
8. *Import*: hand-create a small resource via the cloud console, then bring it under Terraform management with terraform import and verify plan shows zero changes afterward.

External sets: HashiCorp's own official tutorials (developer.hashicorp.com/terraform/tutorials) are unusually good and hands-on; KodeKloud and A Cloud Guru both have scenario-based Terraform labs; the Terraform Associate certification's exam objectives are a solid, comprehensive checklist to self-test against even if you don't sit the exam.
`,

  "architecture-diagram": `
The reference architecture for a production Terraform setup provisioning a Kubernetes-based application platform — the shape this page builds toward repeatedly:

~~~mermaid
flowchart TB
    Dev["Engineer"] -->|"git push / PR"| Repo["Git repository\ninfra/modules + infra/environments"]
    Repo --> CI["CI/CD pipeline\n(GitHub Actions / Jenkins)"]
    CI -->|"terraform plan on PR"| PlanOut["Plan output\nposted for review"]
    PlanOut -->|"human approval"| CI
    CI -->|"terraform apply on merge"| Backend["Remote state backend\n(S3 + DynamoDB lock, or Terraform Cloud)"]
    CI --> Providers["Provider plugins\n(AWS / Azure / GCP / Kubernetes)"]
    Providers --> Cloud["Cloud APIs"]
    Cloud --> Net["VPC / networking"]
    Cloud --> Cluster["Managed Kubernetes cluster\n(EKS/GKE/AKS)"]
    Cloud --> DB[("Managed database")]
    Cluster --> Workloads["App workloads\n(deployed separately via K8s manifests/Helm)"]
    Backend -.state read/write + lock.-> CI
    subgraph Secrets["Secrets Management"]
        Vault["Vault / cloud secrets manager"]
    end
    CI -.reads credentials.-> Vault
    DB -.generated credentials stored in.-> Vault
~~~

Every box maps to a skill on this platform: Git (repo/PR flow), CI/CD and GitHub Actions (the pipeline), AWS/Azure/GCP (the providers), Kubernetes (the cluster and its workloads), and Secrets Management (credentials and generated secrets) — this diagram is the map of how they compose around Terraform.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Terraform))
    Language
      HCL syntax
      Providers
      Resources vs data sources
      Variables & outputs
      Locals & expressions
      Modules
    Workflow
      init
      plan — the safety gate
      apply
      destroy
    State
      What it stores
      Refresh & drift detection
      Remote backends
      Locking
      State surgery: mv/import/moved
    Graph
      Dependency edges from references
      Parallelism
      count vs for_each
      Apply/destroy ordering
    Production
      Module design & versioning
      Blast-radius: state splitting
      CI/CD plan/apply pipeline
      Policy as code
      Cost estimation
    Security
      State file secrets risk
      Locking prevents corruption
      Credential scoping
      Supply chain: pinned providers
    Ecosystem
      OpenTofu fork
      Terraform Cloud/Enterprise
      Pulumi / CloudFormation comparison
      Terratest / native tests
    Career
      Interview classics
      Labs & real projects
      Reading path -> Kubernetes -> CI/CD
~~~
`,
};

export default terraform;
