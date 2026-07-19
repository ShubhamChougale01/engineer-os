import type { SkillContent } from "../types";

/**
 * Azure — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const azure: SkillContent = {
  overview: `
Microsoft Azure is a public cloud platform offering more than 200 products and services across compute, storage, databases, networking, identity, AI, and analytics, delivered from data centers organized into geographic regions around the world. It is the cloud platform most deeply wired into enterprise IT: Windows Server, Active Directory, SQL Server, .NET, and Microsoft 365 all have first-class, low-friction paths into Azure, which is why the majority of Fortune 500 companies run at least part of their estate there.

For an AI engineer, Azure matters for two distinct reasons. First, it is one of the three hyperscalers (alongside AWS and GCP) that most production AI systems are deployed on, so fluency in its compute, networking, and identity primitives is directly employable. Second, Azure hosts Azure OpenAI Service and Azure AI Foundry — the enterprise-grade, compliance-wrapped way many large organizations consume GPT-class and other foundation models, with private networking, content filtering, and regional data residency guarantees that raw API access does not provide. Knowing Azure is frequently the difference between "I can call an LLM API" and "I can ship an LLM feature inside a bank, hospital, or government agency."

Key characteristics: a strict organizational hierarchy of management groups, subscriptions, and resource groups that has no direct AWS equivalent; Azure Resource Manager (ARM) as the single control-plane API that every tool (Portal, CLI, PowerShell, Bicep, Terraform) ultimately calls; Azure Active Directory — renamed **Microsoft Entra ID** in 2023 — as the identity backbone for both human users and workload identities; and a strong hybrid-cloud story (Azure Arc, Azure Stack) aimed at customers who cannot or will not go fully cloud-native.

This page assumes no prior cloud experience but moves fast once the fundamentals are in place. Where relevant it cross-references the **AWS**, **GCP**, **Docker**, **Kubernetes**, **Terraform**, **CI/CD**, **GitHub Actions**, **Jenkins**, and **Git** skills on this platform — Azure is rarely learned in isolation from those.
`,

  history: `
Azure grew out of a Microsoft research project ("Red Dog") and was publicly announced by Ray Ozzie at the Professional Developers Conference in October 2008, entering general availability as **Windows Azure** in February 2010 — squarely as a Platform-as-a-Service competitor to Google App Engine, with IaaS (raw VMs) added later as customer demand made clear that PaaS-only was too restrictive.

| Year | Milestone |
|------|-----------|
| 2008 | Windows Azure announced at PDC; Microsoft's first public cloud bet |
| 2010 | General availability — PaaS-first: Compute, Storage, .NET Services |
| 2012 | IaaS (Virtual Machines, Virtual Network) added — direct response to EC2/VPC demand |
| 2014 | Renamed **Microsoft Azure**; Azure Resource Manager (ARM) replaces the older "classic" deployment model |
| 2014 | Satya Nadella becomes CEO; "mobile-first, cloud-first" strategy accelerates Azure investment |
| 2016 | Azure Container Service launches; Azure Functions (serverless) goes GA |
| 2017 | Azure Kubernetes Service (AKS) and Cosmos DB (multi-model, globally distributed database) launch |
| 2019 | Azure Arc previewed — hybrid management for resources outside Azure |
| 2021 | Azure OpenAI Service launches after Microsoft's OpenAI partnership deepens |
| 2023 | Azure Active Directory renamed **Microsoft Entra ID**; Azure OpenAI Service GA with GPT-4 |
| 2024 | Azure Container Apps reaches broad maturity as the "serverless containers" middle ground between Functions and AKS; Azure AI Foundry unifies model catalog, evaluation, and agent tooling |
| 2025+ | Continued build-out of AI infrastructure (custom silicon, Maia/Cobalt chips) and agentic tooling on top of Azure AI Foundry — verify specifics against Microsoft's own release notes, as this space moves monthly |

The renaming of Azure AD to Entra ID is more than cosmetic: it reflects Microsoft repositioning identity as a product family (Entra ID, Entra Permissions Management, Entra Verified ID) that spans beyond Azure into a broader "secure access for any identity" strategy — useful context for why documentation and job postings now mix both names.
`,

  "why-it-exists": `
Azure exists because Microsoft looked at its own installed base — millions of enterprises running Windows Server, Active Directory, Exchange, and SQL Server on their own hardware — and recognized two gaps that the earliest cloud entrant (AWS, launched 2006) had not prioritized:

1. **Enterprise identity continuity.** Large organizations already had Active Directory as their source of truth for who-can-access-what. Rebuilding that in a foreign cloud's IAM system was a migration blocker. Azure's answer was to make Active Directory (now Entra ID) THE identity plane for the cloud itself, so an on-premises AD tenant could sync directly into Azure with minimal re-architecture.
2. **Hybrid, not all-or-nothing, cloud adoption.** Many regulated or latency-sensitive workloads (banking cores, factory floor systems, government data) could not simply move to someone else's data center. Azure Stack (a box you run in your own data center that speaks the Azure APIs) and later Azure Arc (manage non-Azure and even non-Microsoft resources through the Azure control plane) were built specifically to meet customers where they were, rather than requiring a clean break.

The world before Azure (and its contemporaries) meant enterprises ran their own data centers: multi-year hardware refresh cycles, capacity provisioned for peak load and idle most of the time, and IT teams that were as much electricians and HVAC planners as software engineers. Azure's pitch to that specific audience was not "move fast like a startup" (AWS's early developer-first pitch) but "bring your existing Microsoft investment and enterprise agreements into a cloud that already speaks your language."
`,

  "problem-it-solves": `
Azure removes several concrete pains for organizations, particularly ones already invested in the Microsoft ecosystem:

- **Capital expenditure → operating expenditure.** No more buying servers years ahead of need; pay for compute, storage, and databases as you consume them.
- **Identity fragmentation.** A single Entra ID tenant can govern access to Azure resources, Microsoft 365, and (via federation) many third-party SaaS apps, instead of maintaining parallel identity systems.
- **Global reach without building data centers.** A team in one city can deploy infrastructure across 60+ regions in minutes, including regions built specifically for data-residency requirements (e.g., Azure Government, Azure China operated by 21Vianet).
- **Undifferentiated heavy lifting.** Patching hypervisors, replicating storage across fault domains, and running a highly available managed database are Microsoft's job, not yours.
- **Enterprise governance at scale.** Management groups, Azure Policy, and Azure Blueprints let a central cloud team enforce guardrails (allowed regions, mandatory tags, disallowed public IPs) across thousands of subscriptions owned by different business units.

What Azure deliberately does **not** solve:

- **Bad architecture.** A monolith lifted onto App Service is still a monolith; Azure will happily scale your mistakes at a higher hourly rate.
- **Cost discipline.** Nothing stops an idle Premium-tier SQL database or an oversized VM Scale Set from running up a bill for months — that requires the FinOps practices covered in Performance and Anti-Patterns below.
- **Vendor lock-in by itself.** Using Azure-proprietary services (Cosmos DB's specific APIs, Azure Functions triggers, Entra ID group claims) creates real migration cost; Azure does not solve this any more than AWS or GCP solve it for their own proprietary services. Tools like Terraform and Kubernetes reduce, but do not eliminate, this coupling — see the **Terraform** and **Kubernetes** skills.
- **Security by default.** Azure's shared responsibility model (detailed in the Security section) puts identity configuration, network rules, and data classification squarely on you.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Azure's organizational hierarchy — tenant, management group, subscription, resource group — and design one correctly for a multi-team organization.
2. Provision and connect Azure's core compute options (Virtual Machines, App Service, Azure Functions, Container Apps, AKS, Container Instances) and choose correctly between them for a given workload.
3. Configure Azure networking fundamentals: VNets, subnets, Network Security Groups, Azure Load Balancer, and Application Gateway, including private connectivity via Private Link.
4. Use Microsoft Entra ID and Azure RBAC to grant least-privilege access to both humans and workload identities (managed identities), and explain why this is Azure's true security backbone.
5. Provision a production-shaped architecture — App Service or AKS behind Application Gateway, backed by Azure Database for PostgreSQL, secured with managed identities and Key Vault — using Bicep or Terraform.
6. Compare serverless (Functions), containers (AKS/Container Apps), and VMs on cost, control, and operational burden, and justify a choice for a real workload.
7. Apply Azure-specific cost optimization: reserved instances/savings plans, Azure Hybrid Benefit, spot VMs, and autoscaling.
8. Instrument a service with Azure Monitor and Application Insights, and write basic Kusto Query Language (KQL) queries against Log Analytics.
9. Identify the classic Azure production pitfalls — overly broad RBAC assignments, public storage containers, missing availability-zone redundancy — and the fix for each.
10. Translate your knowledge to and from AWS or GCP using an accurate terminology mapping, and articulate honest tradeoffs between the three.
`,

  prerequisites: `
- **Required**: comfort with a command line, basic networking concepts (IP addresses, DNS, ports), and the general idea of what a virtual machine and a database are. Nothing Azure-specific — this page starts from zero.
- **Helpful**: familiarity with **Git** (for storing infrastructure-as-code and CI/CD pipelines), **Docker** (most modern Azure compute options run containers), and any general-purpose programming language for the SDK examples.
- **For the production sections**: prior exposure to the **Terraform** skill (or willingness to learn Bicep alongside it here) makes the provisioning examples click faster; prior exposure to **Kubernetes** makes the AKS material much easier.
- **Not required but valuable context**: if you already know **AWS** or **GCP**, the Comparisons section's terminology-mapping table will let you transfer that knowledge in a single pass instead of relearning concepts from zero.

Dependency links: **Git** → **Docker** → this page → **Kubernetes**, **Terraform**, **CI/CD**, **GitHub Actions** all build directly on the Azure fundamentals covered here.
`,

  "beginner-concepts": `
### The organizational hierarchy

Every Azure resource lives inside exactly this nesting, top to bottom:

~~~text
Tenant (Microsoft Entra ID directory — your organization's identity boundary)
  └── Management Group(s)      — optional, groups subscriptions for policy
        └── Subscription        — the billing + quota + isolation boundary
              └── Resource Group — a logical container of related resources
                    └── Resources (VM, storage account, database, ...)
~~~

This is the single biggest conceptual difference from AWS, which uses a flatter "account" as its main isolation boundary (AWS Organizations layers on top later). In Azure, a **subscription** is both a billing unit and a hard isolation boundary — many companies run separate subscriptions for dev, staging, and production specifically because subscription-level quotas, network isolation, and blast-radius containment come for free that way. A **resource group** is purely organizational and lifecycle-based: everything in it typically gets created and deleted together (e.g., "rg-orders-prod-eastus").

### Getting started: Portal, CLI, and Cloud Shell

~~~bash
# Install the Azure CLI, then authenticate interactively
az login

# See which subscription is active — easy to deploy to the wrong one by accident
az account show --output table
az account set --subscription "Production"

# Create a resource group — region ("location") is fixed at creation
az group create --name rg-demo-dev --location eastus

# List everything in it
az resource list --resource-group rg-demo-dev --output table
~~~

Azure Cloud Shell (browser-based, pre-authenticated) is the fastest way to start without installing anything locally, and is what most tutorials assume.

### Core compute: your first virtual machine

~~~bash
az vm create \\
  --resource-group rg-demo-dev \\
  --name vm-web-01 \\
  --image Ubuntu2204 \\
  --size Standard_B2s \\
  --admin-username azureuser \\
  --generate-ssh-keys
# Production note: never leave port 22 open to 0.0.0.0/0 — restrict the
# Network Security Group to your office/VPN CIDR, or use Azure Bastion.
~~~

### Core storage: Blob Storage

Blob Storage is Azure's object store — the equivalent of AWS S3 — used for anything from log files to model artifacts to static website assets.

~~~bash
az storage account create --name stdemodev001 --resource-group rg-demo-dev \\
  --location eastus --sku Standard_LRS

az storage container create --account-name stdemodev001 --name uploads \\
  --auth-mode login
# --auth-mode login uses your Entra ID identity, not a shared account key —
# always prefer this over copying storage keys into scripts.
~~~

### Basic networking: VNet and subnets

A Virtual Network (VNet) is your private, isolated network inside Azure — the direct analog of an AWS VPC. Resources like VMs get a private IP inside a subnet; a Network Security Group (NSG) is a stateful firewall of allow/deny rules attached to a subnet or network interface.

~~~bash
az network vnet create --resource-group rg-demo-dev --name vnet-demo \\
  --address-prefix 10.0.0.0/16 --subnet-name subnet-web \\
  --subnet-prefix 10.0.1.0/24

az network nsg create --resource-group rg-demo-dev --name nsg-web
az network nsg rule create --resource-group rg-demo-dev --nsg-name nsg-web \\
  --name allow-https --priority 100 --access Allow --protocol Tcp \\
  --destination-port-ranges 443
~~~

### Identity basics: who can do what

Access in Azure is granted through **role assignments**: a security principal (user, group, or workload identity) is assigned a **role** (a bundle of permissions, e.g. "Storage Blob Data Reader") at a **scope** (management group, subscription, resource group, or single resource).

~~~bash
az role assignment create \\
  --assignee someone@yourcompany.com \\
  --role "Reader" \\
  --scope /subscriptions/<sub-id>/resourceGroups/rg-demo-dev
~~~

Common beginner trap: assigning **Owner** or **Contributor** at the subscription scope "to keep things simple." This is covered in depth in Anti-Patterns — read it before you provision your first real environment.
`,

  "intermediate-concepts": `
### App Service: managed web hosting

Azure App Service runs web apps and APIs without you managing a VM or OS — the Azure PaaS analog of AWS Elastic Beanstalk, but more commonly used directly (not just as a wrapper).

~~~bash
az appservice plan create --name plan-web --resource-group rg-demo-dev \\
  --sku B1 --is-linux

az webapp create --name app-orders-api --resource-group rg-demo-dev \\
  --plan plan-web --runtime "PYTHON:3.12"

az webapp deployment source config-zip \\
  --resource-group rg-demo-dev --name app-orders-api --src app.zip
~~~

App Service gives you built-in TLS, custom domains, deployment slots (blue/green swaps with zero downtime), and autoscale rules — for a huge share of web workloads it is the right first choice before reaching for Kubernetes.

### Azure Functions: event-driven serverless

~~~python
# function_app.py — Azure Functions Python v2 programming model
import azure.functions as func
import logging

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="hello")
def hello(req: func.HttpRequest) -> func.HttpResponse:
    name = req.params.get("name", "world")
    logging.info("Processed request for name=%s", name)
    return func.HttpResponse(f"Hello, {name}!", status_code=200)
~~~

Functions bill per execution and run on the Consumption plan (scales to zero, cold starts possible) or the Premium plan (pre-warmed instances, VNet integration, no cold start) — the choice matters a great deal for latency-sensitive workloads, covered further in Advanced Concepts.

### AKS: managed Kubernetes

Azure Kubernetes Service manages the Kubernetes control plane for you; you only pay for and operate the worker nodes. See the **Kubernetes** skill for the orchestration concepts themselves — this section covers what is Azure-specific.

~~~bash
az aks create --resource-group rg-demo-dev --name aks-orders \\
  --node-count 3 --node-vm-size Standard_D4s_v5 \\
  --enable-managed-identity --network-plugin azure \\
  --generate-ssh-keys

az aks get-credentials --resource-group rg-demo-dev --name aks-orders
kubectl get nodes
~~~

Azure-specific AKS decisions: choose the **Azure CNI** network plugin (pods get real VNet IPs, needed for Private Link and NSG-level control) over **kubenet** (simpler, but pods live behind NAT) based on whether you need direct pod-to-VNet-resource connectivity; enable the managed identity add-on so pods can authenticate to other Azure services without stored credentials (see Workload Identity in Advanced Concepts).

### Databases: Azure SQL, Cosmos DB, PostgreSQL

~~~bash
# Azure Database for PostgreSQL — Flexible Server (the current, recommended SKU family)
az postgres flexible-server create --resource-group rg-demo-dev \\
  --name pg-orders-dev --location eastus \\
  --admin-user pgadmin --admin-password "ReplaceWithAKeyVaultSecret1!" \\
  --sku-name Standard_B2s --tier Burstable --version 16 \\
  --public-access None
# --public-access None forces private/VNet-integrated access — never expose
# a production database on a public endpoint.
~~~

- **Azure SQL Database**: managed SQL Server, best when you already have T-SQL code and need relational guarantees.
- **Cosmos DB**: globally distributed, multi-model (SQL/document, MongoDB, Cassandra, Gremlin, Table APIs), with tunable consistency — the Azure-native choice for globally distributed low-latency apps.
- **Azure Database for PostgreSQL/MySQL**: managed open-source relational databases — the natural choice when your team already knows Postgres or MySQL and doesn't need Cosmos DB's global distribution.

### Infrastructure as code: Bicep

Bicep is Azure's own domain-specific language that compiles down to ARM JSON templates — more concise than raw ARM, and Azure-native (as opposed to Terraform, which is cloud-agnostic). See the **Terraform** skill for the multi-cloud alternative.

~~~text
// main.bicep — a storage account, declaratively
param location string = resourceGroup().location
param storageAccountName string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}
~~~

~~~bash
az deployment group create --resource-group rg-demo-dev \\
  --template-file main.bicep --parameters storageAccountName=stdemodev002
~~~

### Managed identities and Key Vault

A **managed identity** is an Entra ID identity automatically managed by Azure and attached to a resource (VM, App Service, Function, AKS pod) — it lets that resource authenticate to other Azure services (Key Vault, Storage, SQL) with zero stored credentials.

~~~bash
az webapp identity assign --name app-orders-api --resource-group rg-demo-dev

az keyvault set-policy --name kv-orders-dev \\
  --object-id <managed-identity-object-id> \\
  --secret-permissions get list
~~~

This single pattern — managed identity plus Key Vault access policy or RBAC — replaces the anti-pattern of connection strings and API keys sitting in App Service configuration or, worse, source control.
`,

  "advanced-concepts": `
### Availability zones, regions, and paired regions

An Azure **region** is a set of data centers with low-latency networking between them; an **availability zone** is a physically separate group of one or more data centers within a region, each with independent power, cooling, and networking. Deploying across 3 zones protects against a data-center-level failure; deploying only within one zone (the default for many resource SKUs unless you explicitly opt in) does not. Azure also defines **region pairs** (e.g., East US paired with West US) used for platform-level disaster recovery of certain services and for staggered platform updates — a subtlety with no direct AWS equivalent, since AWS does not publish an official pairing scheme.

### ARM's control-plane model and RBAC evaluation

Every operation — Portal click, CLI command, Terraform apply — is translated into a call against the ARM REST API. ARM evaluates, in order: is the caller authenticated (Entra ID token)? Does an Azure Policy deny this operation outright? Does an RBAC role assignment at this or a parent scope grant the required action? RBAC is **additive only** — you cannot use RBAC to deny an action, only Azure Policy (via deny effects) can do that, which is why enterprises layer Policy on top of RBAC for real governance.

### Cosmos DB consistency levels

Cosmos DB exposes five consistency levels on a spectrum between strong and eventual: Strong, Bounded Staleness, Session (the default and most commonly correct choice), Consistent Prefix, and Eventual. Session consistency guarantees a single client always reads its own writes without paying the full latency cost of global strong consistency — understanding this spectrum is a frequent senior-level interview topic and a real production lever for multi-region latency versus correctness tradeoffs.

### Serverless vs containers vs VMs — the real decision

| Dimension | Azure Functions (Consumption) | Container Apps / AKS | Virtual Machines |
|-----------|-------------------------------|------------------------|-------------------|
| Scale to zero | Yes | Container Apps: yes; AKS: no (nodes always run) | No |
| Cold start | Yes (mitigated by Premium plan) | Minimal (Container Apps), none (AKS warm pods) | N/A — always on |
| Max execution time | Bounded (minutes, plan-dependent) | Unbounded | Unbounded |
| Networking control | Limited unless Premium + VNet integration | Full (AKS), good (Container Apps) | Full |
| Operational burden | Lowest | Medium (Container Apps) to high (AKS) | Highest |
| Best fit | Event-driven, bursty, short-lived work | Most modern web/API workloads; AKS for complex multi-service systems | Legacy apps, specialized OS/driver needs, licensing constraints |

Seniors default to **Container Apps or App Service** for typical web/API workloads, reach for **AKS** only when they need Kubernetes-specific capabilities (custom operators, service mesh, very large multi-team clusters), and use **Functions** for genuinely event-driven, spiky workloads (queue processing, webhooks, scheduled jobs) — never as a default web framework replacement.

### Workload identity federation (AKS + Entra ID)

Rather than storing a client secret inside a pod, AKS workload identity lets a Kubernetes service account be federated with an Entra ID application, so a pod can request an Entra ID token directly from the AKS metadata endpoint and use it to call Key Vault, Storage, or any Entra-ID-protected API — the AKS-native evolution of the managed identity pattern, and the modern replacement for the older, now-deprecated Azure AD Pod Identity project.

### Private networking: Private Link and Private Endpoints

A **Private Endpoint** places a network interface with a private IP, inside your VNet, that maps to a PaaS resource (Storage, SQL, Key Vault) — traffic never traverses the public internet, and DNS is rewired (Private DNS Zones) so the same connection string resolves privately. This is the production answer to "why is our storage account reachable from the internet" findings in a security review.

### Governance at scale: management groups, Azure Policy, landing zones

Large organizations do not hand-provision subscriptions. The **Cloud Adoption Framework (CAF) Azure Landing Zone** pattern uses management groups to separate platform subscriptions (identity, connectivity, management) from landing zone subscriptions (workloads), with Azure Policy assignments cascading down to enforce allowed regions, mandatory tags, and denied public IPs automatically on every new subscription — this is the senior-level answer to "how do you keep 200 subscriptions from becoming ungoverned chaos."

### Decision table: choosing a database

| Need | Choice |
|------|--------|
| Existing SQL Server / T-SQL code | Azure SQL Database |
| Open-source relational (Postgres/MySQL) fluency | Azure Database for PostgreSQL/MySQL Flexible Server |
| Global low-latency multi-region writes, flexible schema | Cosmos DB |
| Simple key-value cache, session store | Azure Cache for Redis |
| Data warehouse / large-scale analytics | Azure Synapse Analytics / Microsoft Fabric |
`,

  "internal-working": `
Every Azure operation — regardless of which client issues it — flows through the same control-plane pipeline:

~~~mermaid
flowchart LR
    A["Client: Portal, CLI, Bicep/Terraform, SDK"] --> B["Azure Resource Manager (ARM) REST API"]
    B --> C["Entra ID: authenticate the caller, issue token"]
    C --> D["Authorization: Azure Policy deny check, then RBAC role assignment check"]
    D --> E["Resource Provider (Microsoft.Compute, Microsoft.Storage, ...)"]
    E --> F["Provider performs the actual create/update/delete"]
    F --> G["ARM records resource state; emits Activity Log event"]
~~~

1. **Every tool is a thin client over the same API.** The Portal, the CLI, Bicep, Terraform's azurerm provider, and the various language SDKs all ultimately issue authenticated HTTPS calls to the ARM endpoint (management.azure.com) — this is why "what changed my resource" always has a single source of truth: the Activity Log.
2. **Authentication is always Entra ID.** Every call carries a bearer token issued by Entra ID, whether the caller is a human (interactive login, device code flow) or a workload (managed identity, service principal with a client secret or certificate).
3. **Authorization is a two-gate check.** Azure Policy can outright deny an operation (e.g., "deny creation of public IP addresses") regardless of RBAC; if not denied, ARM checks whether any RBAC role assignment at the resource, resource group, subscription, or management group scope grants the requested action. This ordering — Policy can block what RBAC would otherwise allow — trips up engineers who only think in terms of roles.
4. **Resource Providers do the real work.** ARM itself does not know how to create a virtual machine; it hands the request to the Microsoft.Compute resource provider, which talks to the underlying fabric controller. Each Azure service is a resource provider that must be registered on a subscription before its resources can be created — the source of the common "provider not registered" error covered in Common Errors.
5. **Everything is idempotent and declarative at the API level.** A PUT to a resource's URL creates it if absent or updates it to match if present — this is exactly why Bicep, ARM templates, and Terraform can all express "this is the desired end state" and let the platform compute the diff, the same declarative model used by Kubernetes (see the **Kubernetes** skill for the parallel).
`,

  architecture: `
Azure architecture is best understood at two levels: the **organizational architecture** (how subscriptions and resources are structured) and the **application architecture** (how a service is built on top of Azure primitives).

### Organizational architecture

~~~mermaid
flowchart TB
    T["Tenant (Entra ID directory)"] --> MG["Management Group: Platform"]
    T --> MG2["Management Group: Landing Zones"]
    MG --> SUB1["Subscription: Identity"]
    MG --> SUB2["Subscription: Connectivity (hub VNet, Firewall)"]
    MG2 --> SUB3["Subscription: Production workloads"]
    MG2 --> SUB4["Subscription: Non-production workloads"]
    SUB3 --> RG1["Resource Group: rg-orders-prod-eastus"]
    SUB3 --> RG2["Resource Group: rg-payments-prod-eastus"]
    RG1 --> R1["App Service, PostgreSQL, Key Vault, ..."]
~~~

Policy and RBAC assignments made at a management group cascade down to every subscription and resource group beneath it — this is how a central platform team enforces "no public IPs" or "must have a cost-center tag" across an entire organization without touching each subscription individually.

### Application architecture (production web/API service on Azure)

~~~mermaid
flowchart TB
    Client["Clients"] --> AFD["Azure Front Door / CDN (optional, global edge)"]
    AFD --> AppGW["Application Gateway (WAF, TLS termination, L7 routing)"]
    AppGW --> AS1["App Service / AKS pod 1"]
    AppGW --> AS2["App Service / AKS pod N"]
    AS1 & AS2 --> MI["Managed Identity"]
    MI --> KV["Key Vault (secrets, certs, keys)"]
    AS1 & AS2 --> PG[("Azure Database for PostgreSQL\\nprivate endpoint")]
    AS1 & AS2 --> Redis[("Azure Cache for Redis")]
    AS1 & AS2 --> SB["Service Bus / Storage Queue (async work)"]
    subgraph Observability
      AI["Application Insights"] --> LAW["Log Analytics Workspace"]
    end
    AS1 -.telemetry.-> AI
    AS2 -.telemetry.-> AI
~~~

Rules senior teams follow: the database and cache never get a public IP (private endpoints only); the managed identity is scoped to exactly the secrets/resources the app needs (never Key Vault "get all secrets in the tenant"); Application Gateway (or Azure Front Door for global/multi-region setups) is the single ingress point, terminating TLS and applying a Web Application Firewall before traffic reaches application code.
`,

  "data-flow": `
Tracing one HTTPS request into a typical production Azure web application, from the edge to the database and back:

~~~mermaid
sequenceDiagram
    participant U as User
    participant AGW as Application Gateway (WAF)
    participant App as App Service / AKS pod
    participant MI as Managed Identity / Entra ID
    participant KV as Key Vault
    participant DB as Azure Database for PostgreSQL

    U->>AGW: HTTPS request (TLS terminated here)
    AGW->>AGW: WAF rule evaluation (block SQLi/XSS patterns)
    AGW->>App: Forward to a healthy backend pool member
    App->>MI: Request a token (no stored secret)
    MI->>App: Short-lived access token
    App->>KV: Fetch DB connection secret (using the token)
    KV-->>App: Secret returned (encrypted in transit)
    App->>DB: Query over private endpoint (no public internet hop)
    DB-->>App: Result set
    App-->>AGW: JSON response
    AGW-->>U: HTTPS response
~~~

The two details worth internalizing: first, **Application Gateway's health probes** continuously check each backend pool member, so a crashed instance is silently removed from rotation within seconds — this is why rolling deployments behind App Gateway achieve zero-downtime releases. Second, **the managed identity token exchange happens on every cold path** but is cached by the SDK for its lifetime (typically object lifetime or a fixed TTL), so the Key Vault round-trip is not paid on every single request in a well-written client — a common performance mistake is re-authenticating on every request instead of caching the credential object.
`,

  "production-usage": `
### Tooling real teams standardize on

- **Infrastructure as code**: Bicep (Azure-native, no state file to manage, first-class what-if diffing) or Terraform (cloud-agnostic, the choice when the same team also manages AWS/GCP — see the **Terraform** skill). Most large Azure-only shops have converged on Bicep; multi-cloud shops standardize on Terraform.
- **CI/CD**: Azure DevOps Pipelines (Microsoft's own, deeply integrated with Azure Boards/Repos) or GitHub Actions (increasingly the default since GitHub and Azure are both Microsoft-owned and the azure/login and azure/webapps-deploy actions are officially maintained) — see the **CI/CD** and **GitHub Actions** skills for pipeline design; **Jenkins** remains common in organizations with pre-existing on-prem CI investment.
- **Secrets**: Key Vault, referenced by managed identity — never subscription-level shared keys checked into a pipeline.

### Project and resource layout

A typical production layout separates infrastructure code from application code and uses a strict, predictable naming convention:

~~~text
infra/
├── modules/
│   ├── network/         # VNet, subnets, NSGs, Private DNS zones
│   ├── app-service/      # App Service Plan + Web App + slots
│   └── database/         # Postgres Flexible Server + private endpoint
├── environments/
│   ├── dev.bicepparam
│   ├── staging.bicepparam
│   └── prod.bicepparam
└── main.bicep
~~~

Naming convention (Microsoft's own recommended pattern, widely adopted): resource-type-abbreviation, workload name, environment, region — e.g. "rg-orders-prod-eastus", "app-orders-api-prod-eastus", "pg-orders-prod-eastus". This alone eliminates a huge share of "which resource is this" confusion once a subscription has hundreds of resources.

### Worked example: production-shaped App Service + PostgreSQL behind Application Gateway

~~~text
// main.bicep (abridged) — App Service, PostgreSQL, Key Vault, managed identity
param location string = resourceGroup().location
param environmentName string

resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: concat('plan-orders-', environmentName)
  location: location
  sku: { name: 'P1v3', tier: 'PremiumV3' }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: concat('app-orders-api-', environmentName)
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: plan.id
    virtualNetworkSubnetId: subnetId
  }
}

resource keyVaultAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(webApp.id, 'kv-secrets-user')
  scope: keyVault
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions',
      '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalType: 'ServicePrincipal'
  }
}
~~~

Note: the names above use Bicep's concat() function rather than its shorthand string-interpolation syntax purely for readability here — both produce the same result. What matters conceptually: the App Service gets a system-assigned managed identity, that identity is granted the narrow "Key Vault Secrets User" role (not Owner, not Contributor) scoped only to the one Key Vault it needs, the Postgres server has no public access, and the Application Gateway (defined alongside, omitted here for brevity) is the only public entry point, terminating TLS and running WAF rules before traffic reaches the App Service's private VNet integration endpoint.
`,

  "industry-examples": `
- **Adobe**: runs significant Creative Cloud and Experience Cloud infrastructure on Azure, and was an early, deep Azure OpenAI Service adopter for AI-assisted creative features — a useful example of a company embedding LLM features behind enterprise compliance guarantees rather than calling a public API directly.
- **Walmart**: publicly documented as running a deliberate multi-cloud strategy across Azure and Google Cloud, notably avoiding AWS because Amazon is a direct retail competitor — a real-world example of vendor choice being driven by competitive dynamics, not just technical merit.
- **BMW Group**: uses Azure IoT and data services for its connected-vehicle platform, collecting and processing telemetry from vehicles at fleet scale — a canonical large-scale IoT-on-Azure example.
- **Maersk**: has used Azure and SAP-on-Azure for logistics and supply-chain systems, reflecting the broader pattern of traditional heavy industry moving core enterprise systems (ERP, logistics) into Azure rather than rewriting them cloud-native from scratch.
- **HSBC and other regulated financial institutions**: commonly cited as Azure customers specifically for the compliance certifications (data residency, financial-services regulatory attestations) that Azure Government and dedicated regions provide — the pattern to notice is that regulated industries choose a cloud partly on certification coverage, not only compute price.

The pattern across all of these: organizations already committed to Microsoft's enterprise stack (Windows, SQL Server, Active Directory, Microsoft 365, SAP-on-Windows) extend that relationship into Azure rather than evaluating clouds from a blank slate — this is the core commercial reason Azure holds strong enterprise market share.
`,

  "best-practices": `
1. **Design the subscription and management group hierarchy before writing any Bicep or Terraform.** Retrofitting subscription boundaries after resources exist is painful; get dev/staging/prod (at minimum) into separate subscriptions early.
2. **Use managed identities everywhere; treat any stored credential (connection string, API key, storage account key) as a defect to remove.**
3. **Grant RBAC at the narrowest scope and narrowest role that works** — a single resource with "Storage Blob Data Reader," not a subscription with "Contributor."
4. **Enforce guardrails with Azure Policy, not tribal knowledge** — mandatory tags, allowed regions, denied public IPs should be policy-enforced, not code-review-enforced.
5. **Put every production database and cache behind a Private Endpoint** — no PaaS data service should have a public endpoint reachable from the internet.
6. **Tag everything** (cost-center, environment, owner, workload) from day one — retrofitting tags across thousands of untagged resources for a cost audit is a multi-week project everyone regrets not doing earlier.
7. **Deploy across availability zones for anything customer-facing** — the default SKU for many services is zone-redundant only if you explicitly ask.
8. **Prefer Bicep or Terraform over Portal clicks for anything that will exist longer than a demo** — click-ops is undocumented, unreviewed, and unreproducible infrastructure.
9. **Set up Azure Monitor budgets and cost alerts before you need them**, not after a surprise bill.
10. **Use deployment slots (App Service) or blue/green rollouts (AKS) for zero-downtime releases**, and always keep a fast rollback path.
11. **Centralize logs into a small number of Log Analytics workspaces**, not one per resource group — cross-resource KQL queries are where most real incident investigation happens.
12. **Review RBAC assignments and Key Vault access policies on a schedule** — access sprawl accumulates silently as people change teams and nobody removes the old grant.
`,

  "anti-patterns": `
### Owner or Contributor at subscription scope "to keep things simple"

~~~text
# WRONG — this single assignment can create, modify, or delete
# every resource in the entire subscription, including Key Vaults and RBAC itself
az role assignment create --assignee dev-team@company.com \\
  --role "Owner" --scope /subscriptions/<sub-id>

# RIGHT — grant exactly what the team needs, at the resource-group scope
az role assignment create --assignee dev-team@company.com \\
  --role "Contributor" \\
  --scope /subscriptions/<sub-id>/resourceGroups/rg-orders-dev
~~~

Overly broad role assignments are consistently the top finding in real Azure security reviews — see Security below.

### Public blob containers holding sensitive data

~~~bash
# WRONG — anonymous read access on a container, discoverable by URL guessing
az storage container create --name backups --public-access blob

# RIGHT — private by default; grant access via SAS tokens with short
# expiry and least-privilege permissions, or via managed identity + RBAC
az storage container create --name backups --public-access off
~~~

### Storage account keys copied into application config

Using a storage account's shared key (which grants full account access and never expires unless manually rotated) instead of a managed identity or a narrowly-scoped, time-limited SAS token is a recurring finding — a leaked key is a standing full-account compromise until someone notices and rotates it.

### One giant resource group for an entire environment

Putting every resource for every workload into a single "rg-prod" resource group makes RBAC scoping, cost allocation, and blast-radius containment impossible — one resource group per workload-per-environment (e.g., "rg-orders-prod-eastus") is the standard that keeps all three usable.

### Missing availability zones on "production" resources

Provisioning a VM, App Service Plan, or database with the default (often zone-redundant-optional) SKU and calling it "production" without explicitly enabling zone redundancy means a single data-center failure takes the whole service down — verify zone configuration explicitly rather than assuming the default is safe.

### Hardcoded region-specific resource names

Baking "eastus" or a specific storage account name directly into application code (rather than reading it from configuration/environment) makes disaster recovery into a paired region or a different region an application-code change instead of an infrastructure change.
`,

  performance: `
### Measure first

~~~bash
# Application Insights — see live requests, dependencies, exceptions
az monitor app-insights component show --app app-orders-insights \\
  --resource-group rg-orders-prod

# Log Analytics — Kusto Query Language against ingested telemetry
az monitor log-analytics query --workspace <workspace-id> \\
  --analytics-query "requests | summarize avg(duration) by bin(timestamp, 5m)"
~~~

Application Insights' Live Metrics and the Application Map give an immediate view of where latency is actually spent (your code vs. a downstream dependency like the database or an external API) before you optimize anything.

### The optimization hierarchy (apply in order)

1. **Right-size before you scale.** A VM or App Service Plan two sizes too large for its actual CPU/memory usage is the most common and easiest-to-fix waste — check Azure Monitor metrics against the current SKU before adding more instances.
2. **Cache aggressively.** Azure Cache for Redis in front of a database, and Azure CDN or Azure Front Door in front of static/cacheable content, remove load far more cheaply than scaling compute.
3. **Use Premium storage tiers only where IOPS actually matter.** Standard HDD-backed disks are frequently good enough for logs and cold data; reserve Premium SSD for databases and latency-sensitive workloads.
4. **Enable autoscale rules tied to real signals** (CPU, queue length, request rate) rather than fixed instance counts, so you pay for headroom only when traffic actually demands it.
5. **Deploy across availability zones AND scale horizontally** before reaching for larger VM sizes — horizontal scale-out is usually cheaper and more resilient than a single bigger box.
6. **Choose the Premium plan for Azure Functions when cold starts matter**; Consumption-plan cold starts (typically low single-digit seconds for interpreted runtimes) are invisible for background jobs but unacceptable for user-facing request paths.
7. **Push compute closer to data**: colocate compute and its database in the same region (and ideally same availability zone) to avoid cross-zone/cross-region latency that quietly adds tens of milliseconds per round trip.
`,

  scalability: `
Azure's scaling story splits cleanly by compute choice, with the underlying principle — statelessness enables horizontal scale — identical to every other cloud.

### Vertical vs horizontal

~~~mermaid
flowchart LR
    LB["Application Gateway / Load Balancer"] --> A1["App Service instance 1"]
    LB --> A2["App Service instance 2"]
    LB --> A3["App Service instance N (autoscale)"]
    A1 & A2 & A3 --> Redis[("Azure Cache for Redis — shared session/state")]
    A1 & A2 & A3 --> DB[("Azure Database for PostgreSQL")]
~~~

Vertical scaling (a bigger VM size or App Service Plan tier) is simple but has a ceiling and a restart; horizontal scaling (more instances) is Azure's default recommendation for anything customer-facing, and requires the application to be stateless — session and cache state must live in Redis or the database, never in local process memory, or a load-balanced request can land on an instance that never saw the earlier request.

### Bottleneck table

| Bottleneck | Azure-specific answer |
|------------|------------------------|
| Database connections exhausted under load | PgBouncer/connection pooling in front of PostgreSQL Flexible Server, or Cosmos DB for workloads that need to scale writes globally |
| Single-region latency for global users | Azure Front Door with multi-region backends, or Cosmos DB multi-region writes |
| AKS node pool CPU/memory ceiling | Cluster Autoscaler adding nodes, or a larger node VM SKU, or splitting into multiple node pools by workload type |
| Cold starts under bursty serverless load | Azure Functions Premium plan (pre-warmed instances) or Container Apps with minimum replica counts |
| Storage account request-rate limits | Partition load across multiple storage accounts, or move to Premium Block Blob Storage for higher per-account limits |

### Beyond one region

For true global scale, Azure Front Door (or Traffic Manager for simpler DNS-based routing) distributes traffic across multiple regional deployments, each independently scaled — the same pattern covered generically in the **Kubernetes** skill's multi-cluster discussion, applied at the Azure platform level.
`,

  security: `
### The shared responsibility model

Azure is responsible for the security **of** the cloud (physical data centers, host hypervisor patching, network fabric); you are responsible for security **in** the cloud, and exactly how much shifts by service model:

| Layer | IaaS (VMs) | PaaS (App Service, AKS control plane) | SaaS-like (Cosmos DB, Key Vault) |
|-------|------------|----------------------------------------|-------------------------------------|
| Physical security, hypervisor | Microsoft | Microsoft | Microsoft |
| OS patching | You | Microsoft (App Service); shared for AKS nodes | Microsoft |
| Network controls (NSGs, firewalls) | You | You | You |
| Identity and access (RBAC, Entra ID config) | You | You | You |
| Data classification and encryption keys | You | You | You |
| Application-level security | You | You | You |

The higher up the stack (IaaS → PaaS → managed data services), the more Microsoft absorbs — but identity configuration and data governance are **always** your responsibility, at every layer. This is the single most misunderstood part of the model in interviews and in real incidents.

### Azure-specific attack surface and defenses

1. **Overly broad RBAC** is the most common real-world finding — audit role assignments regularly (Entra ID's Access Reviews feature automates this) and prefer built-in narrow roles over Owner/Contributor.
2. **Public storage containers and databases** — enforce via Azure Policy ("deny public network access") rather than relying on individual engineers remembering.
3. **Leaked storage account keys or connection strings** — eliminate by using managed identities; where keys are unavoidable, rotate on a schedule and store in Key Vault, never in App Service configuration in plaintext or in source control.
4. **NSG misconfiguration** opening management ports (RDP 3389, SSH 22) to the internet — use Azure Bastion or a VPN/ExpressRoute jump path instead of public exposure, and let Azure Policy deny inbound rules with a 0.0.0.0/0 source on those ports.
5. **Missing Defender for Cloud coverage** — Microsoft Defender for Cloud continuously assesses your resources against security benchmarks and flags misconfigurations; treat its Secure Score as a real operational metric, not a vanity number.
6. **Azure Firewall / Web Application Firewall (on Application Gateway or Front Door)** for perimeter defense against common web attacks (SQL injection, XSS) before traffic reaches application code.

See the platform's dedicated **OWASP Top 10** and **Secrets Management** skills for depth beyond Azure specifics, and the **Docker**/**Kubernetes** skills for container-layer hardening relevant to AKS.
`,

  testing: `
Testing an Azure deployment happens at two levels: testing the infrastructure code itself, and testing the application running on top of it.

### Infrastructure testing

~~~bash
# Bicep — validate syntax and preview the exact changes before applying
az deployment group validate --resource-group rg-orders-dev \\
  --template-file main.bicep --parameters environmentName=dev

az deployment group what-if --resource-group rg-orders-dev \\
  --template-file main.bicep --parameters environmentName=dev
# what-if shows a diff (Create/Modify/Delete) against the current state —
# always run this before applying to a shared or production environment.
~~~

For Terraform-managed Azure infrastructure, the equivalent discipline is terraform plan reviewed in a pull request before terraform apply — see the **Terraform** skill for the full testing doctrine (plan review, policy-as-code with tools like Checkov or Terrascan, ephemeral test environments).

### Application testing against Azure services

- Use a genuinely separate dev/test subscription (or at minimum a dedicated resource group) so integration tests never touch production data or incur production-scale cost.
- For unit tests, fake the Azure SDK clients (BlobServiceClient, SecretClient) behind an interface, exactly as you would fake any external dependency — do not make real network calls to Azure in a unit test suite.
- For true integration tests, Azure DevTest Labs or a scripted "spin up, test, tear down" resource group in CI (using the same Bicep/Terraform that provisions production) both validates the infrastructure code and exercises real service behavior.
- Load testing: **Azure Load Testing** (managed, based on Apache JMeter) integrates with CI/CD to fail a pipeline if a release regresses p95 latency or error rate beyond a threshold.

The senior doctrine: test infrastructure changes with what-if/plan diffs in every pull request, and treat "did this deploy cleanly to a real, disposable environment" as part of the test suite, not an afterthought before a production release.
`,

  debugging: `
### The escalation path

1. **Activity Log** — the audit trail of every control-plane operation (who created/modified/deleted what, and when). Always the first stop for "why did this resource change."

~~~bash
az monitor activity-log list --resource-group rg-orders-prod \\
  --start-time 2026-07-18T00:00:00Z --output table
~~~

2. **Resource Health** (Portal, or az resource-health commands) — tells you whether Azure itself considers the resource healthy, degraded, or unavailable, distinguishing platform incidents from your own application bugs.
3. **Application Insights Live Metrics and Failures view** — for application-level errors, shows exception stack traces, failed dependency calls, and slow requests in near real time.
4. **Log Analytics with KQL** — for anything requiring correlation across multiple resources or a time-window investigation:

~~~text
// KQL — find the slowest 5% of requests in the last hour, grouped by operation
requests
| where timestamp > ago(1h)
| summarize p95 = percentile(duration, 95) by operation_Name
| order by p95 desc
~~~

5. **kubectl logs / kubectl describe / kubectl get events** for AKS — the same Kubernetes debugging toolbox covered in depth in the **Kubernetes** skill, with Azure Monitor Container Insights layered on top for cluster-wide metrics and log aggregation.
6. **Network Watcher** — for connectivity problems specifically: IP flow verify (is an NSG rule blocking this traffic?), Connection Troubleshoot (can resource A actually reach resource B?), and packet capture for the genuinely hard cases.

### Debugging the classic "it works locally, not in Azure" case

Almost always one of: a managed identity that lacks the RBAC role it needs (check the exact error — "Forbidden" with a role name in the message is the giveaway), an NSG or Private Endpoint DNS issue preventing connectivity, or a configuration value present locally (.env file) but never set in App Service/Function App application settings.
`,

  monitoring: `
Azure observability rests on two integrated services: **Azure Monitor** (the umbrella platform: metrics, logs, alerts) and **Application Insights** (Azure Monitor's application performance monitoring layer, built on the same Log Analytics backend).

### Instrumenting an application

~~~python
# Application Insights via OpenTelemetry (the current recommended approach)
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace

configure_azure_monitor(connection_string="InstrumentationKey=...;IngestionEndpoint=...")
tracer = trace.get_tracer(__name__)

def process_order(order_id: str) -> None:
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        # ... business logic; exceptions and dependency calls are
        # auto-captured once configure_azure_monitor has run at startup
~~~

### What to measure

- **The RED trio per endpoint**: Rate, Errors, Duration (p50/p95/p99) — Application Insights captures this automatically for HTTP-triggered code with zero custom instrumentation.
- **Dependency health**: every outbound call (database, Key Vault, external API) shows up in the Application Map with its own latency and failure rate, making it immediately visible which downstream dependency is actually the bottleneck.
- **Platform-level metrics**: CPU/memory (App Service, VMs, AKS nodes), autoscale events, and — critically — **cost as a metric**, via budgets and cost alerts, so a runaway deployment is caught in hours, not at month-end billing.
- **Alert on symptoms, not causes**: alert on elevated error rate or p99 latency crossing a threshold; use the Application Map and KQL to find the cause after the alert fires, not as the alert condition itself.

### KQL — the query language every Azure engineer eventually learns

~~~text
exceptions
| where timestamp > ago(24h)
| summarize count() by type, outerMessage
| order by count_ desc
| take 10
~~~

Fluency in KQL is a genuine, distinct, and frequently underestimated Azure skill — most production incident investigations end up as a KQL query against Log Analytics.
`,

  deployment: `
### App Service deployment (zero-downtime with slots)

~~~bash
# Create a staging slot, deploy to it, smoke-test, then swap into production —
# the swap is a near-instant DNS/routing change, not a redeploy
az webapp deployment slot create --name app-orders-api \\
  --resource-group rg-orders-prod --slot staging

az webapp deployment source config-zip --name app-orders-api \\
  --resource-group rg-orders-prod --slot staging --src app.zip

# Run smoke tests against the staging slot URL here, then:
az webapp deployment slot swap --name app-orders-api \\
  --resource-group rg-orders-prod --slot staging --target-slot production
~~~

Why each step matters: deploying to staging first means a broken build never reaches live traffic; the swap operation warms up the target slot before cutting traffic over, avoiding cold-start latency spikes on release; and a swap can be reversed with another swap if something is wrong post-release, giving a true instant rollback.

### AKS deployment

Container image build, push, and Kubernetes manifest apply follow the same pattern covered in the **Docker** and **Kubernetes** skills; the Azure-specific pieces are Azure Container Registry (ACR) as the image store, with AKS granted pull access via a managed identity (no registry credentials stored in the cluster), and rolling updates configured through a standard Kubernetes Deployment's update strategy.

~~~bash
az acr build --registry acrOrdersProd --image orders-api:latest .
az aks update --resource-group rg-orders-prod --name aks-orders \\
  --attach-acr acrOrdersProd
kubectl set image deployment/orders-api orders-api=acrordersprod.azurecr.io/orders-api:latest
kubectl rollout status deployment/orders-api
~~~

### CI/CD pipeline shape

A typical pipeline: lint and unit test the application code, run infrastructure what-if/plan for review, build and push the container image (or zip package), deploy to a staging environment, run smoke/integration tests, then promote to production — whether authored in Azure DevOps Pipelines or GitHub Actions (see the **CI/CD** and **GitHub Actions** skills for the exact workflow syntax and the azure/login and azure/webapps-deploy official actions), the stage ordering is the same, and every stage should be gated on the previous one passing.

### Health checks and graceful shutdown

App Service and AKS both support liveness/readiness-style health probes — wire /healthz (process is up) and /readyz (dependencies reachable) into App Service's health check path setting or the AKS Deployment's probe configuration, and handle SIGTERM in your application to drain in-flight requests before the platform terminates the instance during a scale-in or deployment.
`,

  "production-checklist": `
Before an Azure-hosted service takes real production traffic:

- [ ] Subscription and resource group hierarchy reflects environment separation (dev/staging/prod)
- [ ] Every resource carries mandatory tags (environment, owner, cost-center, workload)
- [ ] RBAC assignments reviewed — no Owner/Contributor grants broader than necessary
- [ ] Azure Policy enforces denied public IPs on data services and mandatory tagging
- [ ] All PaaS data services (databases, storage, Key Vault) use Private Endpoints, not public access
- [ ] Managed identities used for all service-to-service auth; zero credentials in config or source control
- [ ] Deployed across availability zones (verified, not assumed default)
- [ ] Autoscale rules configured and tested under simulated load
- [ ] Application Insights and Log Analytics wired up with alerts on error rate and p95/p99 latency
- [ ] Azure Monitor budget and cost alerts configured
- [ ] Backup/restore tested for every stateful resource (database point-in-time restore verified, not assumed)
- [ ] Disaster recovery plan defined for at least the paired region, and actually rehearsed once
- [ ] Infrastructure fully expressed in Bicep or Terraform — zero unreproducible click-ops resources
- [ ] Deployment slots (App Service) or rolling/blue-green strategy (AKS) verified for zero-downtime releases
- [ ] Web Application Firewall enabled on the public ingress point (Application Gateway or Front Door)
- [ ] Runbook exists: how to roll back, scale up, and read the dashboards during an incident
`,

  "common-mistakes": `
1. **Treating a resource group as a permanent folder rather than a lifecycle boundary** — resources with different lifecycles (a shared VNet vs. an app that gets redeployed weekly) end up tangled together, making cleanup and cost tracking painful.
2. **Granting Owner/Contributor "temporarily" and never revoking it** — temporary access grants are the single largest source of RBAC sprawl found in security reviews.
3. **Assuming a resource is zone-redundant by default** — many SKUs require an explicit zone-redundancy setting; the "default" is often single-zone.
4. **Storing secrets in App Service Configuration as plain application settings** instead of Key Vault references — settings are visible to anyone with Reader access on the App Service.
5. **Not registering the resource provider before first use in a new subscription** — a fresh subscription doesn't have every resource provider registered, causing a confusing "not found" error on the very first deployment attempt.
6. **Ignoring paired-region and disaster-recovery planning until an actual regional outage** — DR plans written and rehearsed only after an incident are, by definition, too late for that incident.
7. **Using the classic (non-ARM) deployment model or legacy Azure AD Graph API in new code** — both are deprecated; new work should exclusively use ARM-based resources and Microsoft Graph.
8. **Copying an AWS mental model onto Azure without checking the terminology mapping** — e.g., assuming a subscription behaves like an AWS account for isolation purposes when its default network/identity boundaries differ; see the Comparisons table.
9. **Under-provisioning Application Gateway or AKS node pools for burst traffic** and discovering the ceiling during a real traffic spike rather than a load test.
10. **Skipping cost alerts until the first surprise bill** — Azure Cost Management budgets take minutes to configure and routinely pay for themselves the first month.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|----------------|-----|
| AuthorizationFailed | RBAC role assignment missing or scoped too narrowly for the operation | Check the exact required action in the error; assign the correct built-in role at the right scope |
| ResourceGroupNotFound | Wrong subscription active, or resource group name typo | az account set --subscription; verify with az group list |
| The subscription is not registered to use namespace Microsoft.X | Resource provider not registered on this subscription | az provider register --namespace Microsoft.X |
| Public access is not permitted on this storage account | Policy or account setting blocks public network access | Use a Private Endpoint or SAS token; do not disable the policy |
| SSL/TLS handshake failure connecting to a PaaS database | Client missing the required CA certificate, or minimum TLS version mismatch | Update client TLS config; verify server minimumTlsVersion setting |
| Bicep/ARM deployment: InvalidTemplateDeployment | Syntax or parameter mismatch in the template | Run az deployment group validate/what-if before applying |
| AKS: ImagePullBackOff | ACR not attached to the cluster, or wrong image tag | az aks update --attach-acr; verify the image exists in the registry |
| Managed identity token request fails (IDX errors) | Identity not assigned to the resource, or RBAC not yet propagated (can take a few minutes) | Confirm identity assignment; wait and retry; check role assignment scope |
| Quota exceeded for VM size in region | Subscription's regional vCPU quota reached | Request a quota increase, or choose a different region/VM family |
| DNS resolution fails for a Private Endpoint | Private DNS Zone not linked to the VNet | Link the Private DNS Zone to the VNet; verify the A record was created |

The habit that matters: read the full error message (Azure's error payloads usually name the exact missing permission or misconfigured setting), then fix the root cause rather than widening permissions or disabling a security control to make the error disappear.
`,

  faqs: `
**Q: Is Azure harder to learn than AWS?**
Not inherently harder, but structured differently — the subscription/resource-group hierarchy and Entra ID-centric identity model take a session or two to internalize if you're coming from AWS's flatter account model. Once that clicks, the rest maps fairly directly.

**Q: Should I learn Azure if I already know AWS?**
Yes, if you might work with enterprises, regulated industries, or anywhere already invested in Microsoft 365/Windows Server — Azure's market share is concentrated exactly there. The Comparisons table below is designed to make that transfer fast.

**Q: App Service, Container Apps, or AKS for a new web API?**
Default to App Service or Container Apps unless you specifically need Kubernetes capabilities (custom controllers, service mesh, an existing multi-team Kubernetes platform). AKS adds real operational burden that should be justified by a real need, not by resume-building.

**Q: Bicep or Terraform?**
Bicep if you are Azure-only and want the least friction (no state file, native what-if). Terraform if you also manage AWS/GCP resources and want one tool and one workflow across clouds — see the **Terraform** skill.

**Q: Is Azure OpenAI Service different from calling OpenAI's API directly?**
Yes — Azure OpenAI Service wraps the same underlying models with Azure's identity (Entra ID/managed identities), private networking, regional data residency, and enterprise compliance certifications, which is why regulated organizations use it instead of direct API access.

**Q: What's the single most important Azure concept to master first?**
Microsoft Entra ID and Azure RBAC. Nearly every production incident and security finding on Azure traces back to an identity or permission decision, not a compute or networking one.

**Q: How do I keep Azure costs under control?**
Reserved Instances or Savings Plans for steady-state workloads, spot VMs for interruptible batch work, Azure Hybrid Benefit if you already own Windows Server/SQL Server licenses, autoscaling tied to real demand, and cost alerts configured from day one — detailed in Performance and the cost sections above.

**Q: Is Azure AD the same as Microsoft Entra ID?**
Yes — Entra ID is the 2023 rename of Azure Active Directory; documentation and job postings still use both names interchangeably for the same service.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the difference between a resource group and a subscription?* A subscription is a billing and hard-isolation boundary with its own quotas; a resource group is a logical, lifecycle-based container of related resources within a subscription.
2. *What is a managed identity and why use one?* An Entra ID identity automatically managed by Azure and attached to a resource, letting it authenticate to other Azure services without any stored credential — removes the need for connection strings or API keys in config.
3. *What's the difference between Azure Functions and App Service?* Functions are event-driven and can scale to zero, billed per execution; App Service runs a continuously available web app/API, billed by the App Service Plan tier regardless of traffic.
4. *What does an NSG do?* A stateful firewall of allow/deny rules applied to a subnet or network interface, filtering inbound/outbound traffic by protocol, port, and source/destination.
5. *What is Blob Storage used for?* Unstructured object storage — files, images, backups, logs, model artifacts — the Azure analog of AWS S3, accessed via containers and blobs.

**Senior:**

6. *Explain Azure's authorization model end to end.* Every ARM call is authenticated via an Entra ID token; Azure Policy can deny an operation outright regardless of role assignments; otherwise ARM checks whether any RBAC role assignment at the resource or an ancestor scope (resource group, subscription, management group) grants the required action — RBAC is additive-only, so Policy is the only way to enforce a hard deny.
7. *How would you design a landing zone for an organization with 50 teams?* Management groups separating platform (identity, connectivity, management) from landing zone subscriptions per team/business unit; Azure Policy assigned at the management group level for guardrails (allowed regions, mandatory tags, denied public IPs); a hub-and-spoke VNet topology with a central firewall; RBAC delegated to each team scoped to their own subscription or resource groups only.
8. *Walk through securing a database that currently has a public endpoint.* Create a Private Endpoint in the app's VNet, link the appropriate Private DNS Zone, disable public network access on the database resource, update firewall/NSG rules, verify connectivity from the application before fully cutting over, and add an Azure Policy denying public access on that resource type going forward.
9. *Cosmos DB: how do you choose a consistency level?* Start from the application's real requirement — Session consistency (read-your-own-writes) is correct for the vast majority of user-facing apps; Strong consistency is reserved for correctness-critical cross-region scenarios where the added latency is acceptable; Eventual/Consistent Prefix suit analytics or feed-style workloads tolerant of staleness.
10. *App Service, Container Apps, or AKS — how do you decide for a new service?* Start with the operational-burden-versus-control tradeoff: App Service/Container Apps first unless there's a concrete need for Kubernetes-specific capabilities (custom operators, service mesh, an existing multi-tenant cluster) that would justify AKS's added complexity.
11. *How does an AKS pod authenticate to Key Vault without a stored secret?* Via AKS workload identity federation: the pod's Kubernetes service account is federated with an Entra ID application; the pod requests a token from the AKS metadata endpoint and presents it to Key Vault, which trusts the federated identity — no client secret is stored anywhere.
12. *How do you keep cloud spend under control across dozens of subscriptions?* Reserved Instances/Savings Plans for predictable steady-state workloads, spot VMs for interruptible batch jobs, Azure Hybrid Benefit where existing licenses apply, mandatory tagging enforced by policy for cost allocation, budgets with automated alerts per subscription, and regular right-sizing reviews driven by Azure Monitor utilization data.
`,

  "coding-questions": `
### 1. Security audit script — find public storage containers across a subscription

~~~python
# Uses the Azure SDK for Python to flag any storage container with public access enabled —
# a real task cloud security engineers automate and run on a schedule.
from azure.identity import DefaultAzureCredential
from azure.mgmt.storage import StorageManagementClient
from azure.storage.blob import BlobServiceClient

def find_public_containers(subscription_id: str) -> list[dict]:
    credential = DefaultAzureCredential()   # uses managed identity in Azure, az login locally
    storage_client = StorageManagementClient(credential, subscription_id)
    findings = []

    for account in storage_client.storage_accounts.list():
        if not account.allow_blob_public_access:
            continue  # account-level setting already blocks public access entirely
        account_url = f"https://{account.name}.blob.core.windows.net"
        try:
            blob_service = BlobServiceClient(account_url, credential=credential)
            for container in blob_service.list_containers(include_metadata=False):
                props = blob_service.get_container_client(container.name).get_container_properties()
                if props.public_access is not None:
                    findings.append({
                        "account": account.name,
                        "container": container.name,
                        "public_access": str(props.public_access),
                    })
        except Exception as exc:
            # Don't let one inaccessible account kill the whole audit run
            print(f"Skipped {account.name}: {exc}")
    return findings
~~~

Complexity: O(accounts * containers) network calls — in practice bounded by API rate limits, so batching/pagination matters at real scale. Follow-up: adapt this into an Azure Policy "auditIfNotExists" definition so the check runs continuously instead of on-demand.

### 2. RBAC least-privilege checker

~~~python
# Flags any role assignment using a broad built-in role (Owner/Contributor)
# at or above the subscription scope — the classic anti-pattern from this page.
from azure.identity import DefaultAzureCredential
from azure.mgmt.authorization import AuthorizationManagementClient

BROAD_ROLES = {"Owner", "Contributor"}

def flag_broad_assignments(subscription_id: str) -> list[dict]:
    credential = DefaultAzureCredential()
    auth_client = AuthorizationManagementClient(credential, subscription_id)
    scope = f"/subscriptions/{subscription_id}"
    flagged = []

    role_defs = {rd.id: rd.role_name for rd in auth_client.role_definitions.list(scope)}
    for assignment in auth_client.role_assignments.list_for_scope(scope):
        role_name = role_defs.get(assignment.role_definition_id, "Unknown")
        if role_name in BROAD_ROLES and assignment.scope == scope:
            flagged.append({
                "principal_id": assignment.principal_id,
                "role": role_name,
                "scope": assignment.scope,
            })
    return flagged
~~~

Follow-up they'll ask: extend this to walk management groups too, and to diff against a previous run to alert only on NEW broad assignments (avoiding alert fatigue on already-accepted exceptions).

### 3. Cost anomaly detector using tags

~~~python
# Given daily cost-by-tag data (as would come from Azure Cost Management's export),
# flag any cost-center whose spend jumped more than a threshold day-over-day.
def detect_cost_anomalies(daily_costs: dict[str, list[float]], threshold_pct: float = 50.0) -> list[str]:
    anomalies = []
    for cost_center, series in daily_costs.items():
        if len(series) < 2:
            continue
        yesterday, today = series[-2], series[-1]
        if yesterday <= 0:
            continue
        change_pct = ((today - yesterday) / yesterday) * 100
        if change_pct >= threshold_pct:
            anomalies.append(f"{cost_center}: +{change_pct:.1f}% day-over-day")
    return anomalies
~~~

Complexity: O(cost centers). Discussion point: real systems use rolling averages and seasonality (weekday vs. weekend traffic) rather than a naive day-over-day comparison to avoid false positives.
`,

  "hands-on-labs": `
### Lab 1 — Your first resource group and VM (beginner, ~1h)
Using the Azure CLI, create a resource group, a VNet with one subnet, an NSG allowing only HTTPS inbound, and a Linux VM with a web server installed via cloud-init. Tear it all down with a single az group delete. Skills: resource hierarchy, VNets, NSGs, VM basics.

### Lab 2 — App Service with a managed identity and Key Vault (intermediate, ~2h)
Deploy a small API to App Service, create a Key Vault, store a secret, assign the App Service's managed identity the "Key Vault Secrets User" role, and have the app read the secret at startup with zero connection strings in configuration. Verify by revoking the role assignment and confirming the app fails closed. Skills: managed identities, RBAC, Key Vault, App Service.

### Lab 3 — AKS behind Application Gateway with a private PostgreSQL backend (advanced, ~4h)
Provision an AKS cluster with Azure CNI and workload identity enabled, an Application Gateway Ingress Controller, and a PostgreSQL Flexible Server with a Private Endpoint and no public access. Deploy a small API that reads/writes to the database using workload identity to fetch its credential from Key Vault. Skills: AKS, Application Gateway, Private Link, workload identity — the full worked example from Production Usage, built by hand.

### Lab 4 — Instrument, monitor, and load-test (production, ~3h)
Take Lab 3's service, add Application Insights instrumentation, write three KQL queries (slowest endpoints, error rate by operation, dependency failure rate), configure a cost alert and an error-rate alert, and run an Azure Load Testing session against it, capturing p95 latency before and after adding an Azure Cache for Redis layer. Skills: Azure Monitor, KQL, cost management, load testing, caching.
`,

  "real-projects": `
Portfolio-grade projects mapping directly to what Azure-focused employers screen for:

1. **Multi-environment landing zone in Bicep** — Build a reusable Bicep module set provisioning a hub-and-spoke network, a landing zone subscription pattern (simulated with resource groups if multiple subscriptions aren't available), Azure Policy assignments for tagging and denied public IPs, and parameterized dev/staging/prod deployments. Demonstrates: governance-at-scale thinking, IaC discipline, Azure Policy.

2. **Production-shaped AI API gateway on Azure** — An AKS or Container Apps service that calls Azure OpenAI Service, with managed identity authentication (no API keys), Redis-backed response caching, per-user rate limiting, Application Insights tracing of every model call's latency and token cost, and a fallback path to a secondary Azure OpenAI deployment in another region. Demonstrates: the exact "enterprise AI feature" architecture pattern real AI engineering teams build on Azure.

3. **Cost and security posture dashboard** — A scheduled Azure Function that runs the RBAC and public-storage audit scripts from Coding Questions across a subscription, writes findings to a Log Analytics custom table, and surfaces a Power BI or simple web dashboard of open findings over time. Demonstrates: automation, security posture management, and the KQL/Log Analytics fluency covered in Monitoring.

Each project: infrastructure fully in Bicep or Terraform, README with an architecture diagram, a GitHub Actions or Azure DevOps pipeline running what-if/plan on every pull request, and a written note on the specific RBAC roles and network boundaries chosen and why — that written justification is what turns a demo project into an interview-ready one.
`,

  "case-studies": `
### Adobe: Azure OpenAI Service inside a compliance boundary
Adobe's integration of generative AI features into its Creative Cloud and Experience Cloud products via Azure OpenAI Service is a useful study in "AI feature, enterprise constraints": the model calls needed to stay within data-residency and compliance boundaries that a raw public API call could not guarantee. Lesson: for many enterprise AI features, the model itself is the easy part — the identity, networking, and compliance wrapper around it is the actual engineering work.

### Walmart: cloud choice as a competitive decision
Walmart's public multi-cloud strategy, deliberately built across Azure and Google Cloud while avoiding AWS, illustrates that cloud selection is not purely a technical exercise — competitive dynamics (Amazon Retail competing directly with Walmart) are a first-class input alongside cost and capability. Lesson: when advising on cloud strategy, ask about the business relationships in the room, not only the architecture diagram.

### A regulated-industry private endpoint migration (composite/representative pattern)
A recurring, well-documented pattern across banks and healthcare organizations on Azure: an initial deployment with databases and storage on public endpoints (fast to ship, fails a security review), followed by a migration to Private Endpoints, Private DNS Zones, and managed identities — often taking longer than the original build because DNS resolution and application connection strings have to be carefully re-pointed without downtime. Lesson: designing private connectivity from day one is dramatically cheaper than retrofitting it after a security audit forces the issue.

### The Faster CPython-style pattern: Microsoft's own internal Azure adoption
Microsoft's internal engineering teams (Xbox Live, Microsoft 365 backend services, LinkedIn post-acquisition) migrating onto Azure infrastructure serve as Microsoft's own largest scale-test of Azure's reliability and governance tooling — features like Azure Policy and Landing Zones were shaped substantially by lessons from running Microsoft's own products on the platform. Lesson: a cloud provider's internal dogfooding often produces its best governance tooling, since the same organization feels the pain of ungoverned sprawl firsthand.
`,

  comparisons: `
### AWS vs Azure vs GCP

| Dimension | Azure | AWS | GCP |
|-----------|-------|-----|-----|
| Isolation boundary | Subscription (under a tenant) | Account (under an Organization) | Project (under an Organization) |
| Identity | Microsoft Entra ID | IAM (+ separate Identity Center for SSO) | Cloud IAM + Google Workspace identity |
| IaC-native tool | Bicep / ARM templates | CloudFormation | Deployment Manager (less used) / Config Connector |
| Managed Kubernetes | AKS | EKS | GKE (generally considered the most mature/native) |
| Serverless functions | Azure Functions | Lambda | Cloud Functions / Cloud Run functions |
| Serverless containers | Container Apps | App Runner / Fargate | Cloud Run |
| Object storage | Blob Storage | S3 | Cloud Storage |
| Global distributed DB | Cosmos DB | DynamoDB (+ Aurora Global for relational) | Spanner |
| Enterprise/hybrid strength | Strongest (AD/365/Windows integration) | Broadest service catalog, largest market share | Strongest in data/analytics (BigQuery) and Kubernetes |
| AI platform | Azure AI Foundry / Azure OpenAI Service | Bedrock, SageMaker | Vertex AI |

### AWS-to-Azure terminology map (for engineers who learned AWS first)

| AWS | Azure |
|-----|-------|
| Account | Subscription |
| Organization | Management Group (roughly) |
| IAM | Microsoft Entra ID + Azure RBAC |
| IAM Role (assumed by a service) | Managed Identity |
| EC2 | Virtual Machines |
| Lambda | Azure Functions |
| Elastic Beanstalk / App Runner | App Service / Container Apps |
| EKS | AKS |
| ECS/Fargate | Container Instances / Container Apps |
| S3 | Blob Storage |
| EBS | Managed Disks |
| EFS | Azure Files |
| RDS | Azure SQL Database / Azure Database for PostgreSQL, MySQL |
| DynamoDB | Cosmos DB (Table API) or Cosmos DB generally |
| VPC | Virtual Network (VNet) |
| Security Group | Network Security Group (NSG) |
| ALB / NLB | Application Gateway / Azure Load Balancer |
| CloudFront | Azure Front Door / Azure CDN |
| Route 53 | Azure DNS / Traffic Manager |
| CloudFormation | ARM templates / Bicep |
| CloudWatch | Azure Monitor |
| CloudTrail | Activity Log |
| Secrets Manager | Key Vault |
| SQS | Storage Queues / Service Bus |
| SNS | Event Grid / Service Bus Topics |
| Route tables + VPC peering | Route Tables + VNet Peering |
| Regions with AZs | Regions with Availability Zones (plus the Azure-specific concept of paired regions) |

### How seniors choose

Seniors rarely pick a cloud on technical merit alone for an established organization — they inherit existing Microsoft 365/Active Directory investment (favors Azure), existing team AWS expertise and the broadest service catalog (favors AWS), or a data/analytics and Kubernetes-first culture (favors GCP). For a genuinely greenfield decision with no prior investment, the deciding factors are usually: where does the team already have depth, which provider's AI/data platform best fits the product's core workload, and which regions/compliance certifications the target customers actually require. See the **AWS** and **GCP** skills on this platform for the mirror-image deep dives.
`,

  "related-technologies": `
- **Microsoft Entra ID** — Azure's identity backbone, covered throughout this page; worth deep individual study for any Azure-focused role.
- **Terraform** — the cloud-agnostic infrastructure-as-code alternative to Bicep, essential once an organization spans Azure plus AWS or GCP; see the **Terraform** skill.
- **Docker** — the container runtime underlying Container Instances, Container Apps, and AKS workloads; see the **Docker** skill for the fundamentals Azure's container services build on.
- **Kubernetes** — the orchestration system AKS manages; see the **Kubernetes** skill for the portion of AKS knowledge that is not Azure-specific at all.
- **GitHub Actions** — the increasingly default CI/CD choice for Azure deployments given shared Microsoft ownership; see the **GitHub Actions** skill for workflow syntax and the official azure/login action.
- **Jenkins** — still common in organizations with pre-existing on-prem CI investment deploying to Azure; see the **Jenkins** skill.
- **CI/CD** (general) — the platform-agnostic principles (pipeline stages, gating, promotion) that apply whether you deploy Azure through Azure DevOps, GitHub Actions, or Jenkins; see the **CI/CD** skill.
- **Git** — version control for both application code and the Bicep/Terraform infrastructure code covered here; see the **Git** skill.
- **AWS** and **GCP** — the other two hyperscalers; the Comparisons section above is designed as a direct bridge to and from those skills.

On this platform, the natural next pages after Azure: **Terraform** (to generalize the infrastructure-as-code skills learned here) → **Kubernetes** (to deepen the AKS material) → **GitHub Actions** (to automate the deployment pipeline end to end).
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check the Azure Updates page (azure.microsoft.com/updates) for anything newer, since this space changes on a near-weekly cadence.

- **Microsoft Entra ID** (2023 rename of Azure Active Directory): the identity platform continues to expand as its own product family (Entra Permissions Management, Entra Verified ID, Entra Workload ID) rather than a single service — expect documentation to increasingly favor "Entra ID" over "Azure AD," though both names remain in circulation.
- **Azure AI Foundry**: Microsoft's unification of the model catalog, evaluation tooling, and agent-building experience that previously spanned Azure OpenAI Studio and Azure AI Studio — verify the exact current branding and feature set on Microsoft's own site, as this area has been renamed and reorganized multiple times in a short span.
- **Azure Container Apps**: matured into a genuine middle ground between Azure Functions and AKS, with Dapr integration and KEDA-based scaling built in — increasingly the default recommendation for teams that find AKS too heavy but want more than Functions offers.
- **Custom AI silicon**: Microsoft has announced its own Maia (AI accelerator) and Cobalt (Arm-based CPU) chips for Azure data centers — treat specific availability, regions, and performance figures as something to verify directly rather than assume, since this is an actively evolving hardware rollout.
- **AKS and Kubernetes version cadence**: AKS follows upstream Kubernetes releases with a supported-version window that rolls forward continuously — always check the current supported version list before planning an upgrade, rather than relying on a fixed number from any point-in-time source, including this one.

Given how fast Azure's AI-adjacent services in particular are moving, treat any specific model availability, pricing, or SKU claim beyond mid-2025 as something to verify against Microsoft's own release notes before relying on it in a production decision.
`,

  "future-roadmap": `
Where Azure is heading over the next few years, and what is worth betting career time on:

1. **AI infrastructure becomes a first-class differentiator.** Custom silicon (Maia, Cobalt), expanded Azure AI Foundry tooling, and deeper Azure OpenAI Service integration are where Microsoft is visibly investing the most; fluency in deploying AI workloads with proper identity, networking, and compliance wrapping on Azure is a durable, high-demand skill.
2. **Entra ID keeps expanding beyond "just Azure identity."** Workload identity federation, cross-cloud identity (Entra ID governing access to AWS/GCP resources too), and Verified ID (decentralized identity) suggest identity — not compute — is where Microsoft is making its biggest platform bets; understanding Entra ID deeply pays off well beyond Azure itself.
3. **Landing zones and policy-as-code become the default, not the advanced case.** As more organizations run hundreds of subscriptions, expect Cloud Adoption Framework patterns and Azure Policy to move from "senior architect concern" to baseline expected knowledge for any Azure engineer.
4. **Container Apps continues eating into AKS's simpler use cases**, following the broader industry trend (mirrored by AWS App Runner and GCP Cloud Run) of "serverless containers" absorbing workloads that don't truly need raw Kubernetes.
5. **Hybrid and edge (Azure Arc) matures** as regulated and latency-sensitive industries adopt cloud management patterns without fully leaving their own data centers or factory floors — a durable niche Azure is well positioned for given its enterprise roots.

For your career: identity/RBAC depth, infrastructure-as-code fluency (Bicep and/or Terraform), and the ability to wire AI services into a compliant, well-networked production architecture are the three Azure skills likeliest to stay in demand regardless of which specific service names change next.
`,

  "cheat-sheet": `
~~~bash
# --- Auth and context ---
az login
az account show --output table
az account set --subscription "My Subscription"

# --- Resource hierarchy ---
az group create --name rg-demo --location eastus
az resource list --resource-group rg-demo --output table
az group delete --name rg-demo --yes --no-wait

# --- Compute ---
az vm create --resource-group rg-demo --name vm1 --image Ubuntu2204 \\
  --size Standard_B2s --admin-username azureuser --generate-ssh-keys
az webapp create --name app1 --resource-group rg-demo --plan plan1 --runtime "PYTHON:3.12"
az functionapp create --name func1 --resource-group rg-demo \\
  --consumption-plan-location eastus --runtime python --storage-account st1
az aks create --resource-group rg-demo --name aks1 --node-count 3 --enable-managed-identity
az aks get-credentials --resource-group rg-demo --name aks1

# --- Storage ---
az storage account create --name st1 --resource-group rg-demo --sku Standard_LRS
az storage container create --account-name st1 --name uploads --public-access off --auth-mode login

# --- Networking ---
az network vnet create --resource-group rg-demo --name vnet1 \\
  --address-prefix 10.0.0.0/16 --subnet-name subnet1 --subnet-prefix 10.0.1.0/24
az network nsg create --resource-group rg-demo --name nsg1
az network nsg rule create --resource-group rg-demo --nsg-name nsg1 \\
  --name allow-https --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443

# --- Identity and secrets ---
az webapp identity assign --name app1 --resource-group rg-demo
az keyvault create --name kv1 --resource-group rg-demo
az keyvault secret set --vault-name kv1 --name DbPassword --value "..."
az role assignment create --assignee <principal-id> --role "Key Vault Secrets User" \\
  --scope /subscriptions/<sub>/resourceGroups/rg-demo/providers/Microsoft.KeyVault/vaults/kv1

# --- Databases ---
az postgres flexible-server create --resource-group rg-demo --name pg1 \\
  --sku-name Standard_B2s --tier Burstable --public-access None

# --- Infra as code (Bicep) ---
az deployment group validate --resource-group rg-demo --template-file main.bicep
az deployment group what-if --resource-group rg-demo --template-file main.bicep
az deployment group create --resource-group rg-demo --template-file main.bicep

# --- Monitoring ---
az monitor activity-log list --resource-group rg-demo --output table
az monitor log-analytics query --workspace <workspace-id> \\
  --analytics-query "requests | summarize avg(duration) by bin(timestamp, 5m)"

# --- Cost ---
az consumption budget create --budget-name monthly-cap --amount 1000 \\
  --category cost --resource-group rg-demo

# --- Terminology quick reference ---
# Account -> Subscription | IAM -> Entra ID + RBAC | EC2 -> VM | S3 -> Blob Storage
# VPC -> VNet | Security Group -> NSG | Lambda -> Functions | EKS -> AKS
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What's the hierarchy above a resource group? | Subscription, then optionally Management Group(s), then Tenant |
| What is a managed identity? | An Entra ID identity auto-managed by Azure, attached to a resource, for credential-free service-to-service auth |
| RBAC is additive or can it deny? | Additive only — a hard deny requires Azure Policy, not RBAC |
| Azure's object storage service? | Blob Storage — the S3 equivalent |
| Azure's VPC equivalent? | Virtual Network (VNet) |
| Default Cosmos DB consistency level? | Session — read-your-own-writes without full strong-consistency latency cost |
| App Service vs AKS — default choice? | App Service/Container Apps unless you specifically need Kubernetes capabilities |
| What replaced the term "Azure Active Directory"? | Microsoft Entra ID (2023 rename) |
| How do you privately connect to a PaaS service (no public internet)? | Private Endpoint + Private DNS Zone |
| Azure's IaC-native language? | Bicep (compiles to ARM JSON) |
| Command to preview a Bicep deployment's exact changes? | az deployment group what-if |
| What enforces org-wide guardrails across many subscriptions? | Azure Policy assigned at a Management Group |
| Classic RBAC anti-pattern? | Owner/Contributor granted at subscription scope "to keep things simple" |
| KQL is used with which service? | Log Analytics / Azure Monitor, for querying logs and metrics |
| Availability zone protects against what? | A single data-center-level failure within a region |
`,

  mcqs: `
**1. In Azure's organizational hierarchy, which is the primary billing and hard-isolation boundary?**

A) Resource group  B) Management group  C) Subscription  D) Tenant

**Answer: C** — a subscription carries its own billing and quotas and is the main isolation boundary; a resource group is purely organizational within it.

**2. A pod in AKS needs to read a Key Vault secret with no stored credential. What's the correct mechanism?**

A) Storage account key  B) AKS workload identity federated with an Entra ID app  C) Hardcoded client secret in a ConfigMap  D) Public access on the Key Vault

**Answer: B** — workload identity lets the pod request an Entra ID token directly; no secret is stored anywhere.

**3. Which statement about Azure RBAC and Azure Policy is TRUE?**

A) RBAC can express a hard deny  B) Policy can only allow, never deny  C) RBAC is additive-only; Policy can enforce a deny regardless of role assignments  D) Policy and RBAC are the same mechanism

**Answer: C** — this ordering is a frequent senior-interview point and a real production gotcha.

**4. Which Azure compute option scales to zero and bills per execution by default?**

A) Virtual Machines  B) AKS  C) App Service (default plan)  D) Azure Functions (Consumption plan)

**Answer: D** — Functions on the Consumption plan scale to zero between invocations; the other three run continuously.

**5. What is the Azure equivalent of an AWS VPC?**

A) Resource Group  B) Virtual Network (VNet)  C) Availability Zone  D) Network Security Group

**Answer: B** — VNets are Azure's isolated private network construct; NSGs are the firewall layer within one, analogous to Security Groups.

**6. A storage account has allow_blob_public_access enabled and a container set to public-access blob. What is the risk?**

A) None, this is Azure's secure default  B) Anyone who discovers or guesses the URL can read blobs anonymously  C) Only authenticated Entra ID users can read it  D) The container becomes read-only for the owner

**Answer: B** — public containers are anonymously readable by URL; this is one of the most common real-world Azure security findings.
`,

  "revision-notes": `
**Organizational model in 4 lines:** Tenant (Entra ID directory) contains Management Groups, which contain Subscriptions (the billing and isolation boundary), which contain Resource Groups (lifecycle-based logical containers), which contain resources. This hierarchy — not a flat account model — is Azure's biggest conceptual departure from AWS.

**Core services in 6 lines:** Compute spans VMs, App Service (PaaS web hosting), Azure Functions (event-driven serverless), Container Apps (serverless containers), AKS (managed Kubernetes), and Container Instances (single containers). Storage: Blob Storage (objects), Azure Files (managed file shares), Managed Disks (VM block storage). Databases: Azure SQL, Cosmos DB (global, multi-model, tunable consistency), Azure Database for PostgreSQL/MySQL. Networking: VNets, subnets, NSGs, Azure Load Balancer, Application Gateway (L7, WAF). Identity: Microsoft Entra ID plus Azure RBAC is the security backbone underlying everything else.

**Authorization model in 3 lines:** Every ARM call authenticates via an Entra ID token; Azure Policy can deny an operation outright; otherwise RBAC (additive-only, evaluated across resource/resource-group/subscription/management-group scopes) determines what's allowed. Managed identities let workloads authenticate with zero stored credentials — the single most important production security pattern on Azure.

**Production practice in 5 lines:** Provision with Bicep or Terraform, never durable click-ops. Put every PaaS data service behind a Private Endpoint. Deploy across availability zones explicitly. Instrument with Application Insights and Azure Monitor, query incidents with KQL against Log Analytics. Control cost with Reserved Instances/Savings Plans, spot VMs, Azure Hybrid Benefit, and budget alerts configured from day one.

**Interview reflexes:** subscription vs resource group, managed identity mechanics, RBAC-is-additive/Policy-can-deny, App Service/Container Apps vs AKS decision, Cosmos DB consistency levels, Private Endpoint purpose, the AWS-to-Azure terminology map, and the classic anti-patterns (broad RBAC, public storage, missing zone redundancy).
`,

  "learning-roadmap": `
A realistic path to production-competent Azure skills (adjust pace to your background):

**Week 1–2 — Foundations.** Beginner Concepts + Lab 1. Get comfortable with the CLI, the resource hierarchy, and creating/destroying a VM, storage account, and VNet without hesitation. Milestone: you can explain subscription vs. resource group without looking it up.

**Week 3–4 — Core services and identity.** Intermediate Concepts + Lab 2. App Service, Functions, managed identities, Key Vault, and your first Bicep template. Milestone: an app reading a secret via managed identity with zero stored credentials.

**Week 5–6 — Networking and AKS.** Advanced Concepts + Lab 3. VNets, NSGs, Private Endpoints, and an AKS cluster with workload identity behind Application Gateway. Milestone: the full worked production architecture, built by hand.

**Week 7–8 — Observability and governance.** Monitoring, Security, and the Architecture sections. Write real KQL queries, configure Azure Policy at a management group, and run an Azure Monitor cost-alert exercise. Milestone: you can debug a production incident using Activity Log + Application Insights + KQL without guessing.

**Week 9–10 — Production hardening.** Deployment, Production Checklist, Anti-Patterns. Lab 4: instrument, monitor, and load-test a real service, then deliberately introduce and fix one anti-pattern (a public container, an over-broad role) to feel the difference. Milestone: a containerized, monitored, cost-alerted service on your own GitHub with an architecture diagram.

**Week 11–12 — Interview polish and a portfolio project.** Interview/Coding Questions sections; build the AI API gateway project from Real Projects. Milestone: explain the AWS-to-Azure terminology map, RBAC-vs-Policy, and the production architecture diagram out loud, unprompted.

Continue next to **Terraform** on this platform to generalize the infrastructure-as-code skills built here across clouds, then **Kubernetes** to deepen the AKS material independent of any one cloud provider.
`,

  "official-docs": `
- [Azure documentation](https://learn.microsoft.com/en-us/azure/) — the full reference; Microsoft Learn's structured learning paths are genuinely good for guided study.
- [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/) — reference architectures for exactly the production patterns covered in this page (web apps, AKS, data platforms).
- [Cloud Adoption Framework for Azure](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/) — the landing zone and governance-at-scale patterns referenced in Advanced Concepts.
- [Azure Resource Manager documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/) — the control-plane model covered in Internal Working.
- [Bicep documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/) — the IaC language used throughout the Production Usage examples.
- [Microsoft Entra ID documentation](https://learn.microsoft.com/en-us/entra/identity/) — the identity backbone; worth a dedicated deep read.
- [Azure Updates](https://azure.microsoft.com/en-us/updates/) — the authoritative source for anything newer than this page's knowledge cutoff.
`,

  books: `
- **Microsoft Azure For Dummies** — a genuinely solid, gentle on-ramp for readers with zero cloud background; don't let the series name undersell it.
- **Exam Ref AZ-104: Microsoft Azure Administrator** — even if you never sit the certification, its coverage of core services and hierarchy is a clean structured review.
- **Azure Architecture Design Patterns** style references from the Azure Architecture Center (available as a free downloadable e-book from Microsoft) — the closest thing to a canonical "how seniors design on Azure" text, and free.
- **Terraform: Up and Running** (Yevgeniy Brikman) — not Azure-specific, but essential once you provision Azure via Terraform rather than Bicep; read alongside the **Terraform** skill.
- **Kubernetes Patterns** — for teams going deep on AKS, this is the best general Kubernetes-patterns book and applies directly once you're past the Azure-specific AKS setup.

Hedge: Azure's own documentation and Microsoft Learn move faster than most books can keep up with service-specific details (SKU names, pricing tiers) — treat books as the source for durable architectural patterns, and Microsoft Learn/Azure Updates as the source for current service specifics.
`,

  blogs: `
- **Azure Updates blog** (azure.microsoft.com/updates) — the first-party announcement feed; the fastest way to know what changed.
- **Microsoft Tech Community — Azure** (techcommunity.microsoft.com) — product-team-authored deep dives, often the clearest explanation of a new feature's actual design intent.
- **John Savill's technical content** (primarily video, see Videos below, but also written summaries) — consistently one of the clearest independent voices explaining Azure architecture decisions.
- **Azure Architecture Center blog posts** — tied to the reference architectures; explains the "why" behind each recommended pattern.
- **Well-Architected Framework** guidance pages — Microsoft's own opinionated best-practices framework, functionally a living best-practices blog maintained by the product team.
`,

  "research-papers": `
Azure-specific academic literature is thinner than for general distributed-systems topics — Azure is a commercial platform, not primarily a research output — but a few genuinely relevant systems papers exist, and the closest foundational reading fills the rest of the gap:

- **"Windows Azure Storage: A Highly Available Cloud Storage Service with Strong Consistency"** (Calder et al., SOSP 2011) — describes the architecture underlying Azure's storage stack; foundational reading for understanding Blob Storage's durability and consistency design.
- **"Resource Central: Understanding and Predicting Workloads for Improved Resource Management in Large Cloud Platforms"** (Cortez et al., SOSP 2017) — Microsoft's own research on predicting Azure VM workload behavior to improve scheduling and oversubscription; directly informs how Azure's fabric controller packs VMs onto hardware.
- **Closest foundational reading if the above is thin for your purposes**: the general cloud-systems literature that underlies every hyperscaler — the original **Google File System** and **MapReduce** papers, and Amazon's **Dynamo** paper — are worth reading for the distributed-systems principles (consistency, partitioning, replication) that Cosmos DB, Azure Storage, and Azure SQL's high-availability design all build on, even though they describe different companies' systems.

I hold moderate confidence in the paper titles and venues cited above based on training knowledge current through my cutoff; verify exact publication years and venues via a search before citing them formally, since I cannot guarantee perfect recall of conference proceedings.
`,

  videos: `
- **John Savill (YouTube, "John Savill's Technical Training")** — extremely thorough, whiteboard-style deep dives on Azure networking, identity, and architecture; widely regarded as one of the best independent Azure educators.
- **Microsoft Build and Microsoft Ignite session recordings** — the first-party conference talks where new Azure services and architecture patterns are announced and explained by the engineering teams that built them.
- **Azure Friday (Channel 9 / Microsoft Learn video series)** — short, focused walkthroughs of individual services and features, good for staying current on smaller updates.
- **Adam Marczak – Azure for Everyone (YouTube)** — practical, hands-on Azure tutorials aimed at building real things rather than passing a certification.
- **Well-Architected Framework session recordings (Microsoft Learn)** — video companions to the written framework, walking through the reference architectures referenced in this page's Architecture and Production Usage sections.
`,

  "github-repos": `
- [Azure/azure-cli](https://github.com/Azure/azure-cli) — the CLI's own source; issues and discussions are a good way to understand exact command behavior.
- [Azure/bicep](https://github.com/Azure/bicep) — the Bicep language source and its excellent official documentation/examples folder.
- [Azure/azure-quickstart-templates](https://github.com/Azure/azure-quickstart-templates) — hundreds of official reference ARM/Bicep templates covering nearly every service combination.
- [Azure-Samples](https://github.com/Azure-Samples) (organization, many repos) — official sample applications for App Service, Functions, AKS, and Azure OpenAI Service integration.
- [Azure/azure-sdk-for-python](https://github.com/Azure/azure-sdk-for-python) — the Python SDK used throughout this page's coding examples; browse the source for any client library's exact behavior.
- [hashicorp/terraform-provider-azurerm](https://github.com/hashicorp/terraform-provider-azurerm) — the Terraform provider for Azure; essential reference if you provision Azure via Terraform instead of Bicep.
- [Azure/karpenter-provider-azure](https://github.com/Azure/karpenter-provider-azure) — Azure's port of the Karpenter node-autoscaling project, relevant once you're deep into AKS scaling.
- [MicrosoftDocs/azure-docs](https://github.com/MicrosoftDocs/azure-docs) — the actual source of learn.microsoft.com/azure content; searching this repo directly is often faster than the docs site's search.
- [Azure/Azure-Landing-Zones-Sandbox](https://github.com/Azure) landing-zone reference implementations (organization-hosted; search "landing zone" under the Azure org) — worked examples of the governance-at-scale pattern from Advanced Concepts.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Hierarchy fluency*: given a company with 3 business units each needing dev/staging/prod isolation, design the management group and subscription layout on paper before touching the CLI.
2. *Identity and RBAC*: provision an App Service, assign it a managed identity, grant it exactly the Key Vault permission it needs, then write the az cli commands to audit whether any OTHER identity has broader access than necessary to that same vault.
3. *Networking*: build a hub-and-spoke VNet topology with a central Azure Firewall and two spoke VNets peered to it; verify traffic between spokes is forced through the firewall, not direct.
4. *Private connectivity*: take any PaaS resource with public access enabled and migrate it to a Private Endpoint end to end, including DNS, without downtime.
5. *IaC*: convert a Portal-clicked resource group into a Bicep template that reproduces it exactly, verified with what-if showing zero changes needed.
6. *Cost*: given a mock monthly cost-by-tag dataset, identify which cost centers are candidates for Reserved Instances vs. which look like good spot-VM candidates, and justify the split.
7. *Debugging*: given a KQL exercise dataset (or a real Log Analytics workspace), find the top 3 slowest operations and the single most common exception type in the last 24 hours.
8. *AKS*: deploy a two-service application to AKS with workload identity for one service and traditional Kubernetes secrets for the other (deliberately, to compare); write up the operational difference you observe.

External sets: Microsoft Learn's hands-on sandboxes (free, guided, graded), the AZ-104 and AZ-305 certification practice question sets (useful for hierarchy/service-selection fluency even if you never sit the exam), and Azure Architecture Center's reference architectures used as "rebuild this from the diagram" exercises.
`,

  "architecture-diagram": `
The reference production architecture for an AI-enabled web service on Azure — the shape referenced throughout Production Usage and Data Flow:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> AFD["Azure Front Door (global edge, WAF)"]
    AFD --> AppGW["Application Gateway (regional WAF, TLS termination)"]
    AppGW --> AKS1["AKS / Container Apps pod 1"]
    AppGW --> AKS2["AKS / Container Apps pod N"]
    AKS1 & AKS2 --> WI["Workload Identity / Managed Identity"]
    WI --> KV[("Key Vault — secrets, certs, keys")]
    AKS1 & AKS2 --> PG[("Azure Database for PostgreSQL\\nPrivate Endpoint")]
    AKS1 & AKS2 --> Redis[("Azure Cache for Redis")]
    AKS1 & AKS2 -->|async jobs| SB["Service Bus / Storage Queue"]
    SB --> Func["Azure Functions (event-driven workers)"]
    Func --> PG
    AKS1 & AKS2 -->|managed identity auth| AOAI["Azure OpenAI Service"]
    subgraph Observability
        AI["Application Insights"] --> LAW["Log Analytics Workspace"]
        LAW --> Alerts["Azure Monitor Alerts"]
    end
    AKS1 -.telemetry.-> AI
    AKS2 -.telemetry.-> AI
    Func -.telemetry.-> AI
~~~

Every box in this diagram maps to a section already covered on this page — this is the composed map of how they fit together in a real production system.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Azure))
    Organization
      Tenant / Entra ID
      Management Groups
      Subscriptions
      Resource Groups
    Compute
      Virtual Machines
      App Service
      Azure Functions
      Container Apps
      AKS
      Container Instances
    Storage and Data
      Blob Storage
      Azure Files
      Managed Disks
      Azure SQL
      Cosmos DB
      PostgreSQL / MySQL Flexible Server
    Networking
      VNets and Subnets
      NSGs
      Load Balancer
      Application Gateway
      Private Link / Private Endpoints
      Azure Front Door
    Identity and Security
      Microsoft Entra ID
      Azure RBAC
      Managed Identities
      Key Vault
      Azure Policy
      Defender for Cloud
    Production
      Bicep / Terraform
      Azure Monitor / App Insights
      KQL / Log Analytics
      CI CD: DevOps / GitHub Actions
      Cost Management
    Ecosystem
      AI Foundry / Azure OpenAI
      AWS and GCP comparison
      Kubernetes and Docker
      Landing Zones / CAF
    Career
      Interview classics
      Labs and projects
      Learning roadmap
~~~
`,
};

export default azure;
