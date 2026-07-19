import type { SkillContent } from "../types";

/**
 * GCP (Google Cloud Platform) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const gcp: SkillContent = {
  overview: `
Google Cloud Platform (GCP) is Google's public cloud, offering compute, storage, databases, networking, and machine-learning infrastructure over the same global network and hardware that runs Google Search, YouTube, and Gmail. GCP is consistently ranked the third-largest cloud provider by revenue, behind AWS and Azure, but it holds a distinct position for AI engineers: it is the cloud built by the company that invented the Transformer architecture (the "T" in GPT), authored the original MapReduce and Borg papers, and open-sourced Kubernetes and TensorFlow.

For an AI engineer, GCP matters less because of raw market share and more because of specific, best-in-class services: **BigQuery** (serverless petabyte-scale analytics), **Vertex AI** (Google's unified ML platform, home to the Gemini model family), and **GKE** (Google Kubernetes Engine, the original managed Kubernetes offering, running on the same Borg-derived scheduling lineage that inspired Kubernetes itself). If your work involves large-scale data warehousing, custom model training, or Kubernetes at scale, GCP is frequently the most ergonomic choice among the three hyperscalers.

Key characteristics: GCP organizes everything under **projects** (not "accounts" like AWS or "subscriptions" like Azure) as the fundamental billing and isolation boundary; it exposes a resource hierarchy (Organization → Folder → Project → Resource) that IAM policies inherit down; it leans heavily on **serverless-first** primitives (Cloud Run, Cloud Functions, BigQuery, Firestore) so many teams run substantial production systems with zero managed servers; and its networking model (a VPC can span all regions globally by default) is genuinely different from AWS's per-region VPCs.

This page treats GCP as one leg of the three-cloud stool alongside the **AWS** and **Azure** skills on this platform — the underlying distributed-systems concepts (compute, storage, IAM, networking, observability) are the same across all three; what differs is naming, defaults, and a handful of genuinely novel primitives. Where GCP overlaps with **Kubernetes**, **Docker**, and **Terraform**, this page cross-references those skills rather than re-teaching them from scratch.
`,

  history: `
GCP's public history starts later than AWS's, but its internal history starts earlier: Google had been running enormous internal infrastructure — **Borg** (cluster scheduling), **Bigtable**, **Spanner**, **MapReduce**, **Colossus** (distributed file system) — for years before any of it became a public product. GCP is, in large part, Google productizing its own internal tools for outside customers.

| Year | Milestone |
|------|-----------|
| 2008 | Google App Engine launches — GCP's first public product, a fully managed PaaS for Python/Java web apps |
| 2010 | Google Cloud Storage launches |
| 2011 | Compute Engine announced (general availability 2013) — IaaS virtual machines |
| 2012 | BigQuery becomes generally available — serverless SQL analytics over Google's internal Dremel engine |
| 2013 | The Omega/Borg paper lineage directly informs the design that would become Kubernetes |
| 2014 | Kubernetes open-sourced by Google, based on over a decade of internal Borg experience |
| 2015 | Google Kubernetes Engine (GKE) launches — the first managed Kubernetes offering from any major cloud |
| 2016 | Cloud Spanner and Cloud ML Engine (predecessor to Vertex AI) launch |
| 2017 | TPU (Tensor Processing Unit) v2 becomes available on GCP — custom ML accelerator silicon |
| 2019 | Cloud Run launches — serverless containers, built on the open-source Knative project |
| 2021 | Vertex AI launches, unifying Google's fragmented ML tooling (AutoML, AI Platform) into one product |
| 2023 | Duet AI (later folded into Gemini for Google Cloud) brings generative AI assistance across the console |
| 2024–2025 | Gemini model family becomes the flagship offering inside Vertex AI; Gemini-in-BigQuery and Gemini-in-Workspace integrations expand |

The throughline: GCP's most distinctive products (Kubernetes/GKE, BigQuery, Spanner) all trace back to internal Google infrastructure papers published years before the corresponding public service existed. This is why GCP frequently feels like "the researchers' cloud" — the primitives were designed for Google's own planet-scale problems first, then generalized for customers.
`,

  "why-it-exists": `
By the early 2010s, AWS had a multi-year head start and had proven that renting compute and storage by the hour was a viable, enormous business. Google's entry was not "let's copy AWS" — it was "let's expose the infrastructure we already built to run Search and Gmail at global scale."

The gap GCP aimed to fill:

1. **Data at scale, without managing infrastructure.** Google had solved petabyte-scale interactive analytics internally (Dremel) years before public products caught up; BigQuery let outside companies query billions of rows with plain SQL and no cluster to manage.
2. **Container orchestration done right.** Google had run essentially all of its production workloads in containers, scheduled by Borg, since the mid-2000s — a decade before Docker made containers mainstream elsewhere. Kubernetes (and GKE) exists because Google recognized the rest of the industry was reinventing, poorly, problems Google had already solved.
3. **A network as a product.** Google's private global fiber network connects its data centers; GCP exposes a global VPC and low-latency backbone as a first-class feature rather than a per-region afterthought.
4. **A cloud with ML built into its bones,** not bolted on. TPUs, BigQuery ML, and later Vertex AI reflect a company whose core business (Search, Ads, YouTube recommendations) has always been an ML problem.

GCP exists to let other organizations rent the same operational maturity — container scheduling, planet-scale data analytics, custom ML silicon — that Google built to run itself.
`,

  "problem-it-solves": `
GCP removes several concrete pains for a team building AI-driven products:

- **Ad hoc big-data infrastructure**: instead of standing up and tuning a Hadoop/Spark cluster, BigQuery gives serverless SQL over arbitrarily large datasets, billed by bytes scanned.
- **Kubernetes operational burden**: GKE manages the control plane (etcd, API server, scheduler, upgrades) so teams focus on workloads, not cluster babysitting — with **Autopilot mode** removing node management entirely.
- **ML infrastructure fragmentation**: Vertex AI unifies data labeling, training (including distributed training on TPUs/GPUs), hyperparameter tuning, model registry, and online/batch prediction into one platform instead of stitching together separate tools.
- **Global network complexity**: a single GCP VPC can span every region without VPNs or peering, because it rides Google's private backbone — removing a class of networking work AWS/Azure require via cross-region peering.
- **Identity sprawl**: the Organization → Folder → Project → Resource hierarchy with inheritable IAM policies gives large companies one place to reason about access control across hundreds of projects.

What GCP deliberately does **not** solve: it does not eliminate the need to understand distributed-systems fundamentals (consistency, latency, failure modes), it does not make bad application architecture good, and it does not remove the shared-responsibility burden — you still own your data, your access configuration, your code's security, and your cost discipline. GCP also has a smaller marketplace and third-party ecosystem than AWS, so niche managed services you'd find on AWS sometimes require self-hosting on GCP.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain GCP's resource hierarchy (Organization, Folder, Project, Resource) and how IAM policy inherits down it.
2. Choose the right compute service (Compute Engine, GKE, Cloud Run, Cloud Functions) for a given workload and justify the tradeoff.
3. Design a VPC with subnets, firewall rules, and a load balancer for a production service.
4. Provision a Cloud SQL database and connect an application to it securely using a scoped service account.
5. Explain why BigQuery and Vertex AI make GCP the most data/ML-centric of the three major clouds.
6. Apply the principle of least privilege using IAM roles (basic, predefined, custom) instead of broad Owner/Editor grants.
7. Describe the shared responsibility model and identify which security failures are the customer's fault vs Google's.
8. Read a GCP bill and apply at least three concrete cost-optimization techniques (committed use, preemptible/Spot VMs, sustained use discounts).
9. Set up Cloud Monitoring and Cloud Logging for a running service and define meaningful alerts.
10. Map GCP service names to their AWS and Azure equivalents for interviews and multi-cloud work.
`,

  prerequisites: `
- **Required**: basic command-line comfort, understanding of what a virtual machine and a container are (see the **Docker** skill), and basic networking vocabulary (IP address, port, DNS).
- **Helpful**: prior exposure to any public cloud (AWS or Azure) — most concepts transfer directly, only names and defaults differ; see the **AWS** and **Azure** skills for direct comparison.
- **Strongly recommended before the Advanced sections**: the **Kubernetes** skill (GKE is Kubernetes-as-a-service) and the **Terraform** skill (the professional way to provision GCP resources as code, rather than clicking through the console).
- **For the ML-centric parts**: no ML background is required for this page, but pairing it with this platform's ML/LLM skills will make the BigQuery ML and Vertex AI discussions land harder.

Dependency links: **Git** and **Linux** (assumed baseline) → this page → **Kubernetes**, **Terraform**, **CI/CD**, **GitHub Actions** all build directly on GCP fluency for teams that chose Google Cloud as their platform.
`,

  "beginner-concepts": `
### Projects: GCP's fundamental unit

Every resource in GCP — a VM, a bucket, a database — belongs to exactly one **project**. A project has a unique Project ID, a numeric Project Number, and its own billing, IAM policy, and API enablement. This is GCP's single biggest conceptual difference from AWS (accounts) and Azure (subscriptions): GCP expects you to create **many small projects** (dev, staging, prod, per-team, even per-experiment) rather than one big account with everything inside it.

~~~bash
# Create a project and set it as the active context for the CLI
gcloud projects create my-app-prod-2026 --name="My App Production"
gcloud config set project my-app-prod-2026

# Enable the APIs you actually need — nothing is on by default
gcloud services enable compute.googleapis.com run.googleapis.com sqladmin.googleapis.com
~~~

### The resource hierarchy

~~~text
Organization (your company's Google Workspace/Cloud Identity domain)
  └── Folder (optional: e.g. "Engineering", "Finance")
        └── Project (billing + IAM boundary; e.g. "my-app-prod")
              └── Resources (VMs, buckets, databases, ...)
~~~

IAM policies set at any level are **inherited** by everything below it. A role granted at the Organization level applies to every project underneath, unless a more specific policy is layered on. This is why "who can do what" audits start at the top of the hierarchy, not inside individual projects.

### IAM: the security backbone

IAM answers one question for every API call: **who** (a user, group, or service account) can do **what** (a role, a bundle of permissions) on **which resource**.

~~~bash
# Grant a specific, narrow role — NOT the broad "Editor" role
gcloud projects add-iam-policy-binding my-app-prod \\
  --member="user:jane@example.com" \\
  --role="roles/cloudsql.client"

# Service accounts are identities for WORKLOADS, not humans
gcloud iam service-accounts create app-backend \\
  --display-name="App backend service account"
~~~

### Your first VM (Compute Engine)

~~~bash
gcloud compute instances create web-1 \\
  --zone=us-central1-a \\
  --machine-type=e2-medium \\
  --image-family=debian-12 \\
  --image-project=debian-cloud
~~~

### Your first bucket (Cloud Storage)

~~~bash
# Bucket names are globally unique across ALL of GCP, like AWS S3
gcloud storage buckets create gs://my-app-assets-2026 --location=us-central1

# Upload and set object-level or bucket-level access carefully
gcloud storage cp ./logo.png gs://my-app-assets-2026/logo.png
~~~

Common beginner trap: leaving a Cloud Storage bucket with public read access ("allUsers" as a member) when it should be private — covered in depth in Anti-Patterns and Security.
`,

  "intermediate-concepts": `
### Compute Engine vs GKE vs Cloud Run vs Cloud Functions

~~~text
Compute Engine   -> full VM control, any OS/runtime, you patch and scale it
GKE              -> Kubernetes-managed containers, you control pods/services
Cloud Run        -> stateless containers, fully serverless, scale to zero
Cloud Functions  -> single-function serverless, event-triggered, scale to zero
~~~

Picking the right one is a recurring interview and architecture question — see Advanced Concepts for the full decision table.

### VPC networking

A GCP VPC is **global by default** — one VPC can have subnets in us-central1, europe-west1, and asia-south1 simultaneously, all privately routable, with no VPN or peering required. This is genuinely different from AWS, where a VPC is scoped to one region.

~~~bash
gcloud compute networks create app-vpc --subnet-mode=custom

gcloud compute networks subnets create app-subnet-us \\
  --network=app-vpc --region=us-central1 --range=10.0.0.0/20

# Firewall rules are attached to the VPC, not the subnet, and are
# deny-by-default for ingress except a few implied rules
gcloud compute firewall-rules create allow-http \\
  --network=app-vpc --allow=tcp:80,tcp:443 \\
  --source-ranges=0.0.0.0/0 --target-tags=web
~~~

### Cloud Run: the serverless container workhorse

~~~bash
# Build with Cloud Build, deploy to Cloud Run in one command
gcloud run deploy api-service \\
  --source=. \\
  --region=us-central1 \\
  --allow-unauthenticated=false \\
  --service-account=app-backend@my-app-prod.iam.gserviceaccount.com \\
  --set-env-vars=ENV=production \\
  --min-instances=1 --max-instances=20 \\
  --memory=512Mi --cpu=1 --timeout=30s
~~~

min-instances above 0 avoids cold starts for latency-sensitive APIs at the cost of paying for idle capacity — a direct tradeoff decision, not a default to accept blindly.

### Databases: Cloud SQL, Firestore, BigQuery, Spanner

~~~text
Cloud SQL   -> managed Postgres/MySQL/SQL Server, relational, regional
Firestore   -> serverless NoSQL document store, strong offline/mobile sync
BigQuery    -> serverless SQL data warehouse, analytics over huge datasets
Spanner     -> globally distributed, strongly consistent relational database
~~~

~~~bash
gcloud sql instances create app-db \\
  --database-version=POSTGRES_15 \\
  --tier=db-custom-2-7680 \\
  --region=us-central1 \\
  --availability-type=REGIONAL \\
  --backup-start-time=03:00

gcloud sql users set-password postgres \\
  --instance=app-db --password="use-secret-manager-in-real-life"
~~~

Never hardcode that password — see Security for Secret Manager usage.

### Service accounts and workload identity

A service account is an identity for code, not people. Attaching an overly broad role (like "Editor") to a service account is the single most common GCP production security mistake — grant only the specific predefined or custom role the workload needs.

~~~bash
gcloud projects add-iam-policy-binding my-app-prod \\
  --member="serviceAccount:app-backend@my-app-prod.iam.gserviceaccount.com" \\
  --role="roles/cloudsql.client"
~~~
`,

  "advanced-concepts": `
### The full resource-hierarchy IAM model

IAM bindings are policies attached at Organization, Folder, or Project level, and (for a smaller set of resources) directly on individual resources. The **effective policy** on any resource is the union of all bindings inherited from every ancestor plus anything set directly on it — GCP IAM policies can only ADD permissions as you go down the hierarchy; there is no "deny" override the way AWS SCPs work, though **Organization Policies** (a separate constraint system) can restrict what's allowed regardless of IAM grants.

~~~text
Organization Policy  -> "no external IPs allowed anywhere in this org" (a hard constraint)
IAM Policy           -> "jane@example.com can create Cloud SQL instances in project X" (a grant)
~~~

### Custom roles and least privilege at scale

Predefined roles (roles/cloudsql.client, roles/storage.objectViewer) are curated by Google and are the right default. When they're too broad, custom roles let you assemble an exact permission set:

~~~bash
gcloud iam roles create appReadOnlyDb \\
  --project=my-app-prod \\
  --title="App Read-Only DB Access" \\
  --permissions=cloudsql.instances.get,cloudsql.instances.list
~~~

Custom roles carry a maintenance cost (they don't auto-update as Google adds new permissions to a service) — reserve them for cases where predefined roles are genuinely too coarse.

### GKE decision table: Standard vs Autopilot

| Dimension | GKE Standard | GKE Autopilot |
|-----------|--------------|---------------|
| Node management | You size and manage node pools | Google manages nodes entirely |
| Billing | Pay for provisioned VM capacity | Pay per pod resource request |
| Control | Full (DaemonSets, privileged pods, node taints) | Restricted (no privileged pods, curated node config) |
| Best for | Teams needing deep customization | Teams wanting Kubernetes API without ops overhead |

### Serverless vs GKE vs Compute Engine: the senior decision table

| Workload shape | Choose | Why |
|-----------------|--------|-----|
| Stateless HTTP API, spiky traffic | Cloud Run | Scale to zero, per-request billing, no cluster to run |
| Event-driven, small single-purpose function | Cloud Functions | Minimal code, tightest event integration (Pub/Sub, Storage triggers) |
| Complex multi-service system, need fine-grained orchestration | GKE | Full Kubernetes primitives: StatefulSets, custom schedulers, service mesh |
| Legacy app, custom kernel modules, licensing requirements | Compute Engine | Full OS control |
| Long-running background workers needing GPUs | Compute Engine or GKE with GPU node pools | Cloud Run/Functions have tighter resource ceilings |

### Multi-region and Spanner's consistency model

Cloud Spanner is GCP's most technically distinctive database: it provides externally consistent (linearizable) transactions across globally distributed replicas using **TrueTime**, Google's atomic-clock-and-GPS-synchronized time API that bounds clock uncertainty tightly enough to order transactions correctly without a single global lock manager. This is a genuinely hard distributed-systems problem (see the CAP theorem) that most databases solve by giving up either consistency or availability during partitions; Spanner's TrueTime approach is one of the few production systems that gets very close to having both, at the cost of requiring specialized infrastructure Google built specifically for this purpose.

### Data flow between BigQuery and ML (why "data/ML-centric cloud")

BigQuery ML lets you train and run models (linear regression, boosted trees, even importing TensorFlow/ONNX models) directly with SQL statements against tables already sitting in your warehouse — no data export/import round trip. Vertex AI then layers full ML lifecycle tooling (feature store, pipelines, model registry, online prediction endpoints) on top, and can read training data straight out of BigQuery. This tight loop — warehouse to model without moving data across product boundaries — is a structural advantage GCP has over clouds where the data warehouse and the ML platform are more loosely integrated.

### Kubernetes' Borg lineage

Kubernetes was open-sourced by Google in 2014, directly informed by over a decade of running Borg (and its successor Omega) internally to schedule hundreds of thousands of jobs across shared clusters. Concepts that carried over nearly unchanged: the separation of a control plane from worker nodes, declarative desired-state reconciliation, labels for flexible grouping, and the idea of a "pod" (Borg called its equivalent an "alloc"). GKE, launched in 2015, was the first managed Kubernetes offering from any cloud — a direct consequence of Google having already solved this problem for itself. See the **Kubernetes** skill for the full internals.
`,

  "internal-working": `
Understanding what happens when you deploy to Cloud Run (a representative modern GCP flow) demystifies most of the platform:

~~~mermaid
flowchart LR
    A["gcloud run deploy --source=."] --> B["Cloud Build:\nbuildpacks or Dockerfile\nbuilds container image"]
    B --> C["Image pushed to\nArtifact Registry"]
    C --> D["Cloud Run control plane\ncreates/updates a Knative Service"]
    D --> E["Google's global front-end (GFE)\nprovisions routing + TLS"]
    E --> F["Container instances scheduled\non Google's internal Borg-derived\ncluster infrastructure"]
    F --> G["Autoscaler watches request\nconcurrency and scales 0..N instances"]
~~~

1. **Build**: if you did not supply a Dockerfile, Cloud Build uses Google Cloud's buildpacks to detect your language and produce a runnable container image automatically.
2. **Registry**: the image is pushed to Artifact Registry (GCP's container/package registry), tagged and versioned.
3. **Control plane**: Cloud Run's control plane (built on the open-source Knative Serving API) records your desired configuration — CPU/memory, concurrency, min/max instances, environment variables, service account — as a new "revision."
4. **Global front end**: Google's internal load-balancing/routing layer (the same GFE infrastructure that fronts Google Search) is provisioned to route traffic to the new revision, including automatic TLS certificate management.
5. **Scheduling**: actual container instances run on Google's internal Borg-derived cluster infrastructure — the same lineage of scheduler that inspired Kubernetes.
6. **Autoscaling**: Cloud Run watches concurrent requests per instance against your configured concurrency limit and scales instances up or down (down to zero, if min-instances is 0) automatically — no manual capacity planning.

For Compute Engine, the equivalent internal flow is simpler: your VM request goes through the Compute Engine API, which schedules a virtual machine onto a physical host in the requested zone, using Google's internal Borg/Omega-style bin-packing to place your VM alongside others while respecting resource reservations and live-migration capabilities (Google can move a running VM to different physical hardware without rebooting it, for host maintenance).

For BigQuery, a submitted SQL query is parsed and turned into a physical execution tree that Google's **Dremel** engine distributes across thousands of machines in parallel, using a columnar storage format (Capacitor) and a distributed shuffle tree to aggregate partial results — this is why BigQuery can scan terabytes in seconds without any cluster you provisioned or manage.
`,

  architecture: `
### Runtime architecture: how GCP composes services

~~~mermaid
flowchart TB
    subgraph Org["Organization"]
        subgraph Folder["Folder: Engineering"]
            subgraph ProjD["Project: app-dev"]
                DevRes["dev resources"]
            end
            subgraph ProjP["Project: app-prod"]
                VPC["VPC (global)"]
                subgraph Compute["Compute layer"]
                    CR["Cloud Run services"]
                    GKEc["GKE cluster"]
                end
                subgraph Data["Data layer"]
                    SQL[("Cloud SQL")]
                    BQ[("BigQuery")]
                    GCS[("Cloud Storage")]
                end
                IAMp["Project IAM policy"]
            end
        end
    end
    VPC --> Compute
    Compute --> Data
    IAMp -.governs.-> Compute
    IAMp -.governs.-> Data
~~~

Key architectural facts: the Organization node exists only if you use Google Workspace/Cloud Identity and Cloud Resource Manager to formally register it — small teams sometimes operate with un-organized standalone projects, which is acceptable for prototypes but a liability at company scale (no centralized IAM/policy control).

### Application architecture for a production GCP service

The layout mature teams use when the target platform is GCP:

~~~text
myservice/
├── terraform/                # infrastructure as code (see the Terraform skill)
│   ├── network.tf            # VPC, subnets, firewall rules
│   ├── iam.tf                # service accounts, role bindings
│   ├── cloudrun.tf           # or gke.tf for Kubernetes-based services
│   └── sql.tf                # Cloud SQL instance + private IP config
├── src/                      # application code (framework-agnostic)
├── Dockerfile                # container definition for Cloud Run/GKE
├── cloudbuild.yaml           # Cloud Build CI pipeline definition
└── k8s/                      # Kubernetes manifests, only if deploying to GKE
    ├── deployment.yaml
    ├── service.yaml
    └── hpa.yaml               # HorizontalPodAutoscaler
~~~

Rules that hold up in production: infrastructure is defined in Terraform, not clicked together in the console (console changes drift and aren't reviewable); every service runs under its own narrowly scoped service account, never the default Compute Engine service account (which historically has the broad Editor role); and databases sit on private IP inside the VPC, never exposed with a public IP, reached from Cloud Run/GKE via a VPC connector or Private Service Connect.
`,

  "data-flow": `
Tracing one HTTP request through a production-shaped GCP architecture — Cloud Run behind a load balancer, talking to Cloud SQL:

~~~mermaid
sequenceDiagram
    participant User
    participant CLB as Cloud Load Balancer
    participant CR as Cloud Run instance
    participant IAM as IAM / Service Account
    participant SQL as Cloud SQL (private IP)
    participant Log as Cloud Logging/Monitoring

    User->>CLB: HTTPS request to api.example.com
    CLB->>CLB: TLS termination, routes by URL map
    CLB->>CR: Forward request to nearest healthy Cloud Run revision
    CR->>IAM: Authenticate as attached service account
    IAM-->>CR: Short-lived access token
    CR->>SQL: Query via Cloud SQL Auth Proxy / private VPC connector
    SQL-->>CR: Result set
    CR-->>CLB: JSON response
    CLB-->>User: HTTPS response
    CR->>Log: Structured log line + trace span (async, non-blocking)
~~~

The most important detail here is the Cloud SQL connection path: production code should never connect to a Cloud SQL public IP directly. The recommended path is either the **Cloud SQL Auth Proxy** (a sidecar/library that wraps the connection in IAM-authenticated, encrypted tunneling without managing SSL certs yourself) or a **Serverless VPC Access connector** routing traffic over the private VPC network. Both avoid ever exposing the database to the public internet.

For a data pipeline into BigQuery (the other common GCP data flow), events typically flow: application emits an event to **Pub/Sub** (GCP's messaging service) to Dataflow (a managed Apache Beam runner) for streaming transformation, landing in BigQuery tables, from which Vertex AI or BigQuery ML reads directly for training or batch scoring — a fully managed, serverless pipeline with no infrastructure the team operates directly.
`,

  "production-usage": `
### Provisioning: Terraform first, console second

Real GCP teams almost never click-provision production infrastructure. See the **Terraform** skill for depth; the pattern is:

~~~text
terraform init      # download the google provider
terraform plan       # show exactly what would change
terraform apply       # apply after review, ideally via CI/CD
~~~

A minimal Cloud Run + Cloud SQL Terraform sketch (illustrative, trimmed):

~~~hcl
resource "google_sql_database_instance" "app_db" {
  name             = "app-db"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  settings {
    tier              = "db-custom-2-7680"
    availability_type  = "REGIONAL"
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.app_vpc.id
    }
  }
}

resource "google_cloud_run_v2_service" "api" {
  name     = "api-service"
  location = "us-central1"
  template {
    service_account = google_service_account.app_backend.email
    containers {
      image = "us-central1-docker.pkg.dev/my-app-prod/app/api:latest"
      resources {
        limits = { cpu = "1", memory = "512Mi" }
      }
    }
    scaling {
      min_instance_count = 1
      max_instance_count = 20
    }
  }
}
~~~

### Project layout for real organizations

Most mature GCP shops run at least: an organization node, a folder per business unit, and per-environment projects (app-dev, app-staging, app-prod) rather than a single shared project with environment-tagged resources — this makes IAM, quotas, and billing analysis dramatically cleaner, and it means a mistake in dev cannot accidentally touch prod resources because they are different projects entirely.

### Operational defaults that matter

- Enable only the APIs a project actually needs (gcloud services enable) — smaller attack surface, clearer audit logs.
- Turn on **Cloud Audit Logs** (Admin Activity logs are on by default and free; Data Access logs are opt-in and worth enabling for sensitive services).
- Set **budget alerts** on every project from day one — a misconfigured autoscaler or an accidental Compute Engine instance left running is a common first-month surprise.
- Use **Secret Manager** for every credential — never environment variables baked into a container image or committed to git.
`,

  "industry-examples": `
- **Spotify**: runs the large majority of its backend infrastructure on GCP, including extensive use of GKE for containerized services and BigQuery for its data analytics platform used across product and data science teams.
- **Twitter/X (historically)**: migrated substantial data infrastructure to GCP, including moving Hadoop-based data processing to BigQuery and Dataflow to reduce operational overhead.
- **Snap Inc. (Snapchat)**: a large-scale, publicly discussed GCP customer, using it for core backend and machine-learning infrastructure at massive user scale.
- **PayPal**: uses GCP (multi-cloud alongside other providers) for elements of its data analytics and machine-learning workloads.
- **Home Depot**: has publicly discussed using GCP for supply-chain and inventory-management data pipelines built on BigQuery.
- **Google itself**: Search, YouTube, Gmail, and Google Ads all run on the same underlying infrastructure (Borg-descended scheduling, Spanner, Colossus) that GCP exposes to customers — GCP is, in a real sense, Google eating its own dog food at planet scale.

Pattern to notice: companies choosing GCP over AWS/Azure most often cite BigQuery's analytics ergonomics, GKE's Kubernetes maturity, or existing organizational investment in Google Workspace/Looker/data tooling as the deciding factor — rarely raw price alone.
`,

  "best-practices": `
1. **Use projects as the isolation boundary** — separate dev/staging/prod into different projects, not different resources inside one project; blast radius for mistakes shrinks dramatically.
2. **Grant least-privilege IAM roles** — predefined roles scoped to exactly what a service needs; avoid "Owner" and "Editor" entirely outside of break-glass admin accounts.
3. **Never use the default Compute Engine/App Engine service account in production** — it historically carries the broad Editor role; create dedicated, narrowly scoped service accounts per workload.
4. **Put databases on private IP only**, reached via the Cloud SQL Auth Proxy or a Serverless VPC Access connector — never expose a public IP on a production database.
5. **Provision everything with Terraform**, reviewed via pull request, applied through CI/CD — console changes drift and are not auditable the same way.
6. **Enable Cloud Audit Logs (Data Access) on sensitive services** — Admin Activity logs are free and on by default, but Data Access logs (who read what data) require explicit enabling.
7. **Set budget alerts on every project on day one** — cost surprises in GCP usually come from an autoscaler doing exactly what it was configured to do, at a scale nobody sanity-checked.
8. **Use committed use discounts or Spot/preemptible VMs deliberately** for predictable or interruptible workloads — don't leave sustained-use discounts as your only cost lever.
9. **Design for regional redundancy from the start** — a REGIONAL Cloud SQL instance and multi-zone GKE node pools cost more than zonal/single-zone but remove a whole class of "one zone had an outage" incidents.
10. **Use Secret Manager for every credential and API key** — never environment variables baked into images or committed to source control.
11. **Tag/label every resource** with environment, owner, and cost-center labels — this is the only way billing and IAM audits stay tractable past a handful of projects.
12. **Prefer managed serverless (Cloud Run/Cloud Functions/BigQuery) over self-managed infrastructure** wherever the workload shape allows it — every VM and Kubernetes node you don't run is one less thing to patch and monitor.
`,

  "anti-patterns": `
### Overly broad IAM roles — the classic

~~~text
# WRONG — grants near-total control over the entire project
gcloud projects add-iam-policy-binding my-app-prod \\
  --member="serviceAccount:app-backend@my-app-prod.iam.gserviceaccount.com" \\
  --role="roles/editor"

# RIGHT — grant exactly the permissions the workload needs
gcloud projects add-iam-policy-binding my-app-prod \\
  --member="serviceAccount:app-backend@my-app-prod.iam.gserviceaccount.com" \\
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding my-app-prod \\
  --member="serviceAccount:app-backend@my-app-prod.iam.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"
~~~

"Editor" grants create/modify permission across almost every GCP service in the project — if that service account's credentials leak, the blast radius is the entire project, not one database.

### Other production-grade anti-patterns

- **Public Cloud Storage buckets by accident**: granting "allUsers" or "allAuthenticatedUsers" reader access on a bucket meant to be private — a recurring cause of real-world data breaches. Use Bucket-level IAM and uniform bucket-level access, and audit with the Security Command Center's public-access findings.
- **Single-zone everything**: a Compute Engine VM or a ZONAL Cloud SQL instance with no replica means one zone outage takes your service down. Use REGIONAL availability and multi-zone node pools for anything customer-facing.
- **Hardcoded credentials in code or container images**: database passwords or API keys committed to git or baked into a Docker image — use Secret Manager and mount secrets at runtime.
- **Using the default VPC and default service account unmodified**: the default VPC has permissive auto-created firewall rules; the default service account carries broad permissions. Both should be replaced with custom-configured equivalents.
- **No budget alerts**: discovering a runaway BigQuery query or an autoscaler that scaled to 200 instances from the monthly invoice instead of a real-time alert.
- **Treating IAM as a one-time setup**: access reviews should be periodic (quarterly at minimum) — service accounts and users accumulate permissions over time ("permission creep") that nobody revisits.
- **Ignoring regional data residency requirements**: storing regulated data (health, financial, EU personal data) in a multi-region bucket/dataset without checking compliance requirements for data locality.
`,

  performance: `
### Rule zero: measure with Cloud Monitoring and Cloud Trace first

~~~bash
# Cloud Trace shows per-request latency broken down by service hop
gcloud trace list-traces --project=my-app-prod

# Cloud Profiler attaches continuous low-overhead CPU/memory profiling
# to a running service with a small client library, safe for production
~~~

### The optimization hierarchy (apply in order)

1. **Fix the query/algorithm first** — a BigQuery query scanning an entire unpartitioned table when it needed one day's data is the single most common GCP performance-and-cost issue; partition and cluster tables by the columns you filter on.
2. **Right-size compute** — an e2-medium running at 90% CPU needs a bigger machine type or horizontal scaling before anything else helps; use Cloud Monitoring's CPU/memory utilization charts, not guesswork.
3. **Cache aggressively** — Memorystore (managed Redis) in front of Cloud SQL for hot read paths; Cloud CDN in front of Cloud Storage/Cloud Load Balancing for static assets.
4. **Reduce cold starts** — for Cloud Run/Cloud Functions, set min-instances above zero for latency-sensitive paths; keep container images small (multi-stage builds) so the few cold starts that do happen are fast.
5. **Use regional proximity** — deploy compute in the same region as its database and, where users are concentrated, close to them; cross-region calls add real, measurable latency (tens of milliseconds even within the same continent).
6. **Scale horizontally before vertically** for stateless services — Cloud Run and GKE Horizontal Pod Autoscalers handle this automatically if the service is actually stateless.
7. **Move to Spanner or a purpose-built store** only when Cloud SQL's regional-instance ceiling (thousands of QPS, single-digit-TB comfortable working set) is a proven, measured bottleneck — don't reach for Spanner's complexity by default.

### Numbers worth knowing (directionally, verify for your workload)

- BigQuery bills by bytes scanned; a well-partitioned/clustered table can cut scanned bytes — and cost and latency — by an order of magnitude versus a naive full scan.
- Cloud Run cold starts are typically well under a second for small, optimized containers, but can run several seconds for large images or heavy runtime initialization (e.g., loading a large ML model into memory on every cold start).
- Committed use discounts and sustained use discounts stack with right-sizing but never substitute for it — a well-tuned e2-medium beats a discounted, oversized n2-standard-8.
`,

  scalability: `
GCP's core scalability story is the same as any cloud's — horizontal scaling of stateless compute in front of managed, independently scalable data stores — with a few GCP-specific levers.

~~~mermaid
flowchart LR
    U["Users, globally"] --> CLB["Cloud Load Balancer\n(global, anycast IP)"]
    CLB --> CR1["Cloud Run / GKE\nregion: us-central1"]
    CLB --> CR2["Cloud Run / GKE\nregion: europe-west1"]
    CR1 & CR2 --> MEM[("Memorystore\nRedis cache")]
    CR1 & CR2 --> SQL[("Cloud SQL\nregional, read replicas")]
    CR1 & CR2 --> BQ[("BigQuery\nanalytics, independently scaled")]
~~~

### Vertical vs horizontal

- **Vertical**: resize a Compute Engine machine type or a Cloud SQL tier — simple, but has a ceiling and requires downtime or a maintenance window for stateful resources.
- **Horizontal**: add Cloud Run instances, GKE pods, or Cloud SQL read replicas — the default answer for stateless compute; for databases it requires your application to route reads to replicas and writes to the primary.

### GCP-specific scaling features

- A single **global HTTPS load balancer** with one anycast IP can front backends in multiple regions, automatically routing users to the nearest healthy region — genuinely simpler than stitching together regional load balancers plus DNS-based geo-routing.
- **GKE's Horizontal Pod Autoscaler and Cluster Autoscaler** scale pods and nodes independently based on CPU/memory or custom metrics (e.g., Pub/Sub queue depth).
- **BigQuery scales its query engine independently of your data** — you never provision "more BigQuery machines"; Google's Dremel infrastructure allocates slots dynamically (or you purchase reserved slot commitments for predictable heavy workloads).

### Known bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Cloud SQL write throughput ceiling | Shard, move hot tables to Spanner/Bigtable, or reduce write amplification |
| Cloud Run cold starts under bursty traffic | min-instances > 0, smaller images, lazy-load heavy dependencies |
| BigQuery slow ad hoc queries at scale | Partition/cluster tables, materialized views, reserved slots for predictable workloads |
| Single-region outage risk | Multi-region Cloud Storage/Spanner, regional Cloud SQL with cross-region replica, global load balancer with multi-region backends |
| GKE node scheduling delays under burst | Node auto-provisioning, over-provisioned buffer pods, or GKE Autopilot |
`,

  security: `
### The shared responsibility model

Google secures the physical data centers, the hypervisor, the network hardware, and the base managed-service platform (e.g., patching the underlying Cloud SQL host OS). You are responsible for: your IAM configuration, your VPC and firewall rules, your application code, your data classification and encryption choices where optional, and your credential hygiene. The single most common real-world breach pattern across all clouds — including GCP — is a misconfiguration on the customer's side of that line (a public bucket, an overly broad IAM role, an exposed database), not a failure of Google's underlying infrastructure.

### GCP-specific attack surface and defenses

1. **Public Cloud Storage buckets**: audit with Security Command Center; enforce uniform bucket-level access and an Organization Policy constraint (constraints/storage.publicAccessPrevention) that blocks public access at the org level regardless of individual bucket settings.
2. **Overly broad IAM roles**: use IAM Recommender (built into the console) which analyzes actual permission usage and suggests tighter roles; review service account permissions quarterly.
3. **Exposed databases**: Cloud SQL and other data services should never have a public IP in production; use private IP plus the Cloud SQL Auth Proxy, which also handles encryption in transit and IAM-based authentication without manual certificate management.
4. **Service account key sprawl**: long-lived downloadable JSON service account keys are a major leak risk (they don't expire and are easy to accidentally commit to git); prefer **Workload Identity Federation** (for external workloads) or attached service accounts (for GCP-native compute) which use short-lived tokens instead.
5. **Default network and firewall rules**: the default VPC's auto-created firewall rules are permissive; delete/replace them with explicit, narrowly scoped rules tagged to specific instance groups.
6. **Supply chain**: Artifact Registry supports vulnerability scanning on container images; wire this into CI so a vulnerable base image fails the build rather than reaching production.

### Encryption

Data at rest is encrypted by default on GCP's managed services without any customer configuration; for regulated workloads requiring control over key material, **Customer-Managed Encryption Keys (CMEK)** via Cloud KMS let you supply and rotate your own keys while Google still performs the underlying encryption operations.

See the dedicated **OWASP Top 10**, **SQL Injection**, and **Secrets Management** skills on this platform for application-layer depth that applies equally on GCP, AWS, or Azure.
`,

  testing: `
GCP-hosted applications are tested the same way any application is (see the **Python**, **Docker**, and **CI/CD** skills for the general doctrine); the GCP-specific layer is testing your infrastructure and IAM configuration itself.

~~~python
# Example: a Python integration test against a real (or emulated) GCP service,
# using the Cloud SQL Auth Proxy pointed at a disposable test instance.
import pytest
from myservice.repository import UserRepository

@pytest.fixture
def repo(test_db_connection):
    return UserRepository(test_db_connection)

def test_saves_and_retrieves_user(repo):
    repo.save(user_id=1, name="ada")
    assert repo.get(1).name == "ada"
~~~

### Testing infrastructure as code

~~~bash
# terraform validate / plan act as a static + dry-run test layer for infra
terraform validate
terraform plan -out=tfplan

# Open Policy Agent / Conftest can assert policy rules against the plan,
# e.g. "no Cloud SQL instance may have a public IP"
conftest test tfplan.json --policy policies/
~~~

### The senior testing doctrine for cloud infrastructure

- Use a **separate GCP project for CI/test runs**, provisioned and torn down by the same Terraform that manages staging/prod, so tests never touch shared state.
- Where a real GCP dependency is too slow/expensive for unit tests, use fakes behind an interface (Protocol/abstract base class) at the repository layer — reserve real GCP calls for a smaller integration test suite.
- Assert IAM policy and firewall configuration in CI (policy-as-code), not just application logic — a misconfigured firewall rule is a production incident, and it is testable before merge.
- Load-test against a staging project shaped identically to production (same machine types, same Cloud SQL tier) — testing against an undersized staging environment gives misleading results.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read Cloud Logging first** — every GCP service writes structured logs by default; the Logs Explorer's query language (like resource.type equals cloud_run_revision AND severity greater than or equal to ERROR) narrows fast.

~~~text
resource.type="cloud_run_revision"
resource.labels.service_name="api-service"
severity>=ERROR
~~~

2. **Cloud Trace** for latency problems — shows a waterfall of spans across service hops for a single request, immediately revealing which downstream call is slow.
3. **Cloud Debugger / Cloud Profiler** for CPU and memory issues in a live service, without stopping it or adding print statements.
4. **gcloud logging read** from the CLI for quick, scriptable log queries without opening the console:

~~~bash
gcloud logging read \\
  'resource.type="cloud_run_revision" AND severity>=ERROR' \\
  --limit=50 --format=json
~~~

5. **kubectl describe / kubectl logs** for GKE-specific debugging — a Pod stuck in CrashLoopBackOff or Pending needs kubectl describe pod to see events (image pull errors, resource limits, scheduling failures); see the **Kubernetes** skill for the full escalation path.
6. **IAM Policy Troubleshooter** (in the console, or gcloud policy-intelligence) answers "why can't this identity access this resource?" by walking the effective policy across the whole resource hierarchy — far faster than manually re-deriving inherited bindings.

### Debugging a "service returns 403" incident

The most common GCP-specific debugging scenario: check, in order, whether the API is enabled on the project, whether the calling identity (user or service account) has the right IAM role, whether an Organization Policy constraint is blocking the action, and whether a VPC Service Controls perimeter (if configured) is rejecting the request as coming from outside an allowed network boundary.
`,

  monitoring: `
Production GCP visibility rests on Google Cloud's **operations suite** (Cloud Monitoring, Cloud Logging, Cloud Trace, Cloud Profiler) — GCP's rough equivalent to AWS CloudWatch or Azure Monitor.

### Structured logging

~~~python
import logging
import json

# Cloud Logging automatically ingests structured stdout/stderr as JSON
# when running on Cloud Run/GKE/Compute Engine with the logging agent
logger = logging.getLogger("api")

def log_event(event: str, **fields) -> None:
    logger.info(json.dumps({"event": event, **fields}))

log_event("order_placed", order_id=1234, user_id=42, latency_ms=87)
~~~

### Metrics and alerting

~~~bash
# Create an alert policy: fire when p99 latency exceeds 2s for 5 minutes
gcloud alpha monitoring policies create \\
  --notification-channels=CHANNEL_ID \\
  --display-name="API p99 latency high" \\
  --condition-display-name="p99 > 2s" \\
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_latencies"' \\
  --condition-threshold-value=2000 \\
  --condition-threshold-duration=300s
~~~

Track the RED trio per service: Rate, Errors, Duration (p50/p95/p99). Alert on symptoms users feel (elevated error rate, slow p99), not internal causes (CPU) in isolation.

### Tracing

Cloud Trace auto-instruments many Google Cloud client libraries and integrates with OpenTelemetry — spans show exactly where a slow request spent its time across Cloud Run, Cloud SQL, and any downstream API calls.

### GCP-specific things to watch

- **Cold start rate** on Cloud Run/Cloud Functions — a rising cold-start percentage under steady traffic usually means min-instances is set too low or traffic patterns changed.
- **BigQuery slot utilization** if you use reserved slots — sustained 100% utilization means queries queue and slow down; either add slots or optimize query patterns.
- **GKE node pool utilization and pending pods** — pods stuck Pending for resource reasons signal the Cluster Autoscaler is lagging or a node pool needs a larger machine type.
- **IAM policy change logs** (Admin Activity audit logs) — alerting on unexpected IAM binding changes is a cheap, high-value security signal.
`,

  deployment: `
### The standard: multi-stage Docker deployed to Cloud Run

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY src/ src/

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8080
CMD ["uvicorn", "myservice.main:app", "--host", "0.0.0.0", "--port", "8080"]
~~~

Why each choice matters: slim base image (smaller attack surface and faster cold starts), dependency layer cached separately from application code (fast rebuilds), non-root user (limits blast radius if the container is compromised), port 8080 (Cloud Run's expected default container port), PYTHONUNBUFFERED (logs stream immediately to Cloud Logging instead of buffering).

### Deploying

~~~bash
gcloud builds submit --tag us-central1-docker.pkg.dev/my-app-prod/app/api:v1
gcloud run deploy api-service \\
  --image=us-central1-docker.pkg.dev/my-app-prod/app/api:v1 \\
  --region=us-central1 \\
  --service-account=app-backend@my-app-prod.iam.gserviceaccount.com
~~~

### Serving topology and rollout safety

- Cloud Run creates a new **revision** on every deploy and supports traffic splitting between revisions — roll out to 10% of traffic, watch error rates and latency, then shift to 100% (or roll back instantly to the prior revision with zero rebuild).
- For GKE, use a Deployment with a rolling update strategy and readiness/liveness probes wired to Kubernetes; see the **Kubernetes** skill for the full mechanics.
- Health endpoints (/healthz for liveness, /readyz for readiness) should be wired into GKE probes; Cloud Run has its own startup/liveness probe configuration achieving the same purpose.

### CI/CD pipeline (Cloud Build sketch)

lint and typecheck to unit test to build container image to vulnerability scan to push to Artifact Registry to deploy to Cloud Run with a canary traffic split. Every step gated in Cloud Build (or GitHub Actions calling gcloud); see the **CI/CD** and **GitHub Actions** skills for pipeline mechanics that apply identically here.
`,

  "production-checklist": `
Before a GCP-hosted service takes real production traffic:

- [ ] Dedicated project per environment (dev/staging/prod), not shared resources in one project
- [ ] Terraform (or equivalent IaC) defines all infrastructure; no manual console changes in prod
- [ ] Every workload has a dedicated, narrowly scoped service account — default service accounts unused
- [ ] IAM policy reviewed: no broad Owner/Editor grants on non-admin identities
- [ ] Databases on private IP only, reached via Cloud SQL Auth Proxy or VPC connector
- [ ] Secret Manager holds every credential; nothing hardcoded in code or images
- [ ] Cloud Storage buckets audited for public access; uniform bucket-level access enabled
- [ ] Regional/multi-zone redundancy configured for anything customer-facing
- [ ] Budget alerts configured on the project from day one
- [ ] Cloud Monitoring dashboards and alert policies for RED metrics (rate, errors, duration)
- [ ] Cloud Logging retention and log-based metrics configured; audit logs (Data Access) enabled for sensitive services
- [ ] Container images scanned for vulnerabilities in CI before deploy
- [ ] Rollback plan verified: traffic splitting or revision rollback tested, not just assumed to work
- [ ] Load test completed: known requests/sec ceiling and failure mode documented
- [ ] Runbook exists: how to roll back, scale up, and read the dashboards during an incident
`,

  "common-mistakes": `
1. **Using one project for everything** — dev, staging, and prod resources mixed together; a test script can accidentally delete production data because IAM permissions and blast radius aren't isolated.
2. **Granting "Editor" or "Owner" out of convenience** — the classic shortcut that turns a leaked service account key into a project-wide incident instead of a contained one.
3. **Leaving Cloud Storage buckets public** — often from copying a tutorial's "allUsers" grant into a project meant to store private data.
4. **Downloading long-lived service account JSON keys** instead of using attached service accounts or Workload Identity Federation — these keys don't expire and are easy to leak via git or logs.
5. **Skipping regional redundancy** to save cost early, then discovering a single zone outage takes the whole service down once it has real users.
6. **Not setting budget alerts** — a bug that causes an autoscaler to spin up far more instances than expected is discovered from the monthly invoice, not in real time.
7. **Connecting to Cloud SQL over a public IP** because it seemed simpler during initial setup, then never migrating to private IP before launch.
8. **Ignoring BigQuery query cost** — running SELECT * over an entire unpartitioned multi-terabyte table repeatedly, because "it's just a query," when partitioning would cut cost by an order of magnitude.
9. **Confusing GKE Standard and Autopilot tradeoffs** — choosing Autopilot then being surprised that privileged pods or custom DaemonSets aren't allowed, or choosing Standard and then never doing the node-management work it requires.
10. **Treating IAM as "set once"** — service accounts and users accumulate permissions over time with nobody auditing whether they're still needed.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| PERMISSION_DENIED (403) | Calling identity lacks the required IAM role, or the API isn't enabled on the project | Check IAM bindings and gcloud services list --enabled |
| The service account does not have permission to access the bucket | Missing storage IAM role on the service account | Grant roles/storage.objectViewer (or narrower) to the service account |
| Cloud SQL: connection refused / timeout | Public IP blocked by firewall, or private IP misconfigured VPC peering | Use Cloud SQL Auth Proxy; verify Serverless VPC Access connector |
| Cloud Run: container failed to start and listen on port | App not listening on the PORT environment variable / 8080 default | Bind the server to 0.0.0.0 and the PORT env var Cloud Run injects |
| GKE Pod stuck in Pending | Insufficient cluster resources, no matching node pool, or unsatisfiable resource request | kubectl describe pod; check Cluster Autoscaler logs; resize node pool |
| BigQuery: Query exceeded resource limits | Full-table scan or unbounded cross join on a huge dataset | Partition/cluster the table; add filters; check query plan |
| Error 409: resource already exists | Re-running a create command without checking existing state | Use Terraform (idempotent) instead of imperative gcloud create scripts |
| Quota exceeded | Default per-project quota hit (e.g., CPUs per region) | Request a quota increase in the console before it blocks a launch |
| invalid_grant / token expired | Local gcloud auth session expired | gcloud auth login / gcloud auth application-default login |

The habit that matters: read the full error message (GCP error payloads usually name the exact missing permission or quota), then fix the configuration cause rather than retrying blindly.
`,

  faqs: `
**Q: Is GCP better than AWS or Azure?**
No cloud is universally "better" — GCP tends to win on data analytics (BigQuery), Kubernetes maturity (GKE), and network simplicity (global VPC); AWS wins on service breadth and market-tested maturity; Azure wins for organizations already deep in Microsoft's ecosystem. See Comparisons for the full breakdown.

**Q: What is a GCP project, really?**
The fundamental billing, isolation, and IAM boundary — roughly analogous to an AWS account or Azure subscription, except GCP expects you to create many of them (per environment, per team) rather than one large container.

**Q: Should I use Cloud Run or GKE?**
Cloud Run for stateless HTTP services that fit its resource/timeout limits and don't need Kubernetes-specific primitives; GKE when you need fine-grained orchestration, StatefulSets, custom schedulers, or you're already running Kubernetes elsewhere and want consistency.

**Q: Why is BigQuery considered special?**
It is a fully serverless data warehouse — you never provision clusters — built on Google's internal Dremel query engine, capable of scanning terabytes in seconds, and it integrates directly with Vertex AI and BigQuery ML for training models on data that never has to leave the warehouse.

**Q: How does GCP IAM differ from AWS IAM?**
Both grant permissions to identities on resources, but GCP's policy inheritance down an explicit Organization/Folder/Project hierarchy is more structurally rigid than AWS's account-plus-Organizations-SCP model; GCP also separates "IAM policy" (grants) from "Organization Policy" (hard constraints) as two distinct systems.

**Q: What is the relationship between GKE and Kubernetes?**
Kubernetes was created by Google, open-sourced in 2014, directly informed by Google's internal Borg scheduler; GKE is Google's managed Kubernetes offering and was the first managed Kubernetes service from any major cloud, launched in 2015. See the **Kubernetes** skill for the open-source project itself.

**Q: Is GCP cheaper than AWS?**
It depends heavily on workload shape; GCP's sustained-use discounts apply automatically without upfront commitment (unlike AWS Reserved Instances), which can make steady-state compute cheaper by default, but committed-use discounts and Spot/preemptible VMs still require deliberate configuration to capture the largest savings on either platform.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a GCP project and why does it matter?* The fundamental billing/IAM/resource-isolation boundary; every resource belongs to exactly one project, and GCP conventionally uses many small projects rather than one large account.
2. *Name four GCP compute options and one reason to choose each.* Compute Engine (full VM control), GKE (Kubernetes orchestration), Cloud Run (serverless containers, scale to zero), Cloud Functions (single-purpose event-driven serverless).
3. *What is IAM and what three things does an IAM binding tie together?* Identity and Access Management; a binding ties a member (user/group/service account) to a role (bundle of permissions) on a resource.
4. *What's the difference between Cloud Storage and Persistent Disk?* Cloud Storage is object storage (files/blobs accessed over HTTP, globally durable); Persistent Disk is block storage attached to a VM, behaving like a regular disk.
5. *Why shouldn't you expose a Cloud SQL instance on a public IP?* It creates unnecessary internet-facing attack surface; the Cloud SQL Auth Proxy or private IP via VPC connector gives encrypted, IAM-authenticated access without exposure.

**Senior:**

6. *Walk through the GCP resource hierarchy and how IAM policy inherits.* Organization to Folder to Project to Resource; policies at any level are inherited by everything below and can only add permissions going down (Organization Policy is the separate system for hard constraints/deny rules).
7. *When would you choose Cloud Spanner over Cloud SQL?* When you need horizontal write scalability with strong global consistency across regions that a single regional Cloud SQL instance cannot provide — at the cost of higher complexity and price; most workloads never actually need Spanner.
8. *Explain GKE Autopilot vs Standard and when each is the right call.* Autopilot removes node management (pay per pod request, restricted to a curated, secure configuration); Standard gives full node-pool control for teams needing customization Autopilot disallows (privileged pods, custom DaemonSets, specific node configs).
9. *How would you design a globally available, low-latency API on GCP?* Global HTTPS load balancer with a single anycast IP fronting Cloud Run or GKE deployments in multiple regions, data replicated appropriately (Spanner for strongly consistent global writes, or regional databases with read replicas plus careful data residency decisions), and Cloud CDN for static content.
10. *Explain the shared responsibility model on GCP and give one example each side of the line.* Google secures physical infrastructure, hypervisor, and managed-service platform internals; the customer is responsible for IAM configuration, network/firewall rules, application security, and data classification — a public Cloud Storage bucket is a customer-side failure, not a Google infrastructure failure.
11. *How do you avoid long-lived service account key sprawl?* Use attached service accounts for GCP-native compute (Cloud Run, GKE, Compute Engine) and Workload Identity Federation for external workloads (CI/CD, other clouds), both issuing short-lived tokens instead of downloadable, non-expiring JSON keys.
12. *Why does BigQuery ML matter architecturally, not just as a feature?* It lets teams train and score models with SQL directly against warehouse tables, removing the export/import round trip between the warehouse and a separate ML platform — a structural integration advantage rooted in Google's own internal use of Dremel and TensorFlow together.
`,

  "coding-questions": `
### 1. Least-privilege IAM policy diff checker (tests IAM model understanding)

~~~python
def find_overprivileged_bindings(policy: dict, allowed_roles: set[str]) -> list[str]:
    """Given a GCP IAM policy (as returned by getIamPolicy) and a set of
    roles considered acceptable for non-admin members, return every member
    granted a role outside that allow-list. Flags Owner/Editor by design."""
    flagged = []
    for binding in policy.get("bindings", []):
        role = binding["role"]
        if role not in allowed_roles:
            for member in binding["members"]:
                if member.startswith("user:") or member.startswith("serviceAccount:"):
                    flagged.append(f"{member} has {role}")
    return flagged

# Example: flag anyone with roles/editor or roles/owner
policy = {
    "bindings": [
        {"role": "roles/editor", "members": ["serviceAccount:app@proj.iam.gserviceaccount.com"]},
        {"role": "roles/cloudsql.client", "members": ["user:jane@example.com"]},
    ]
}
allowed = {"roles/cloudsql.client", "roles/storage.objectViewer"}
assert find_overprivileged_bindings(policy, allowed) == [
    "serviceAccount:app@proj.iam.gserviceaccount.com has roles/editor"
]
~~~

Complexity: O(bindings x members). Follow-ups: extend to walk the full Organization to Folder to Project hierarchy and compute the effective (inherited) policy; handle group members by resolving group membership separately.

### 2. BigQuery cost estimator from a query's referenced tables (tests data-scale reasoning)

~~~python
def estimate_bytes_scanned(table_sizes_bytes: dict[str, int], referenced_tables: list[str],
                            partition_filter_applied: bool, partition_fraction: float = 1.0) -> int:
    """Rough estimate of bytes BigQuery would scan for a query, given table
    sizes and whether a partition filter narrows the scan. BigQuery bills by
    bytes scanned, so this models the single biggest cost lever: partitioning."""
    total = 0
    for table in referenced_tables:
        size = table_sizes_bytes[table]
        total += int(size * partition_fraction) if partition_filter_applied else size
    return total

sizes = {"events": 5_000_000_000_000}  # 5 TB table
full_scan = estimate_bytes_scanned(sizes, ["events"], partition_filter_applied=False)
partitioned = estimate_bytes_scanned(sizes, ["events"], partition_filter_applied=True, partition_fraction=0.01)
assert full_scan == 5_000_000_000_000
assert partitioned == 50_000_000_000   # 100x less scanned by filtering to 1% of partitions
~~~

Complexity: O(number of referenced tables). Follow-ups: incorporate clustering (further reduces effective bytes scanned within a partition), and discuss why SELECT * is more expensive than selecting only needed columns in a columnar engine.

### 3. VPC firewall rule conflict detector (tests networking model)

~~~python
def find_shadowed_rules(rules: list[dict]) -> list[tuple[str, str]]:
    """Given firewall rules (each with priority, action, and target_tags),
    return pairs where a lower-priority-number (higher precedence) DENY rule
    would shadow a later ALLOW rule for the same tag -- a common
    misconfiguration that silently blocks intended traffic."""
    sorted_rules = sorted(rules, key=lambda r: r["priority"])
    shadowed = []
    seen_denies_for_tag: dict[str, str] = {}
    for rule in sorted_rules:
        for tag in rule["target_tags"]:
            if rule["action"] == "deny":
                seen_denies_for_tag[tag] = rule["name"]
            elif rule["action"] == "allow" and tag in seen_denies_for_tag:
                shadowed.append((seen_denies_for_tag[tag], rule["name"]))
    return shadowed

rules = [
    {"name": "deny-all-web", "priority": 100, "action": "deny", "target_tags": ["web"]},
    {"name": "allow-http", "priority": 200, "action": "allow", "target_tags": ["web"]},
]
assert find_shadowed_rules(rules) == [("deny-all-web", "allow-http")]
~~~

Complexity: O(rules x tags per rule). Follow-ups: extend to consider IP ranges and protocol/port overlap, not just tags, matching real GCP firewall rule evaluation order (lower priority number evaluated first).
`,

  "hands-on-labs": `
### Lab 1 — First project, VM, and bucket (beginner, ~1h)
Create a new GCP project, enable the Compute Engine and Cloud Storage APIs, launch a small VM, create a bucket, and upload a file. Practice gcloud config set project, IAM role assignment for your own user, and tearing everything down cleanly (gcloud compute instances delete, bucket removal) to avoid ongoing cost. Skills: projects, IAM basics, Compute Engine, Cloud Storage.

### Lab 2 — Cloud Run service with a private Cloud SQL backend (intermediate, ~3h)
Build a small API (any language), containerize it, deploy to Cloud Run with a dedicated service account, provision a Cloud SQL Postgres instance on private IP, and connect via the Cloud SQL Auth Proxy or a Serverless VPC Access connector. Verify the database has no public IP. Deliverable: a working, privately-networked API plus a short write-up of the IAM roles granted and why each was necessary. Skills: Cloud Run, IAM, VPC, Cloud SQL, service accounts.

### Lab 3 — BigQuery data pipeline with cost awareness (intermediate/advanced, ~3h)
Load a public dataset (or your own CSV) into BigQuery, write a query against an unpartitioned copy and note bytes scanned, then repartition/cluster the table by date and re-run the same logical query, comparing bytes scanned and cost. Deliverable: a before/after comparison table and one paragraph explaining why partitioning changed the result. Skills: BigQuery, cost model, data modeling.

### Lab 4 — Production-shaped GKE deployment behind a load balancer, IaC and observability included (production, ~5h)
Provision a GKE cluster (or Autopilot cluster) with Terraform, deploy a containerized service with a Horizontal Pod Autoscaler, expose it via a global HTTPS load balancer, wire up Cloud Monitoring dashboards and an alert policy for error rate, and enforce that no pod runs with a public IP or overly broad service account. Load test with a tool of your choice and record the scaling behavior. Skills: the entire production section, end to end, using Terraform, GKE, Cloud Monitoring, and IAM together.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for on cloud-focused roles):

1. **Multi-environment IaC platform** — Terraform modules that stand up dev/staging/prod as separate GCP projects under one folder, each with its own VPC, IAM bindings from a shared least-privilege template, and a Cloud Run service reading from an environment-specific Cloud SQL instance. Demonstrates: project isolation, IAM design, Terraform module reuse, environment parity.

2. **Serverless data pipeline with cost guardrails** — Pub/Sub ingesting events, Dataflow (or a scheduled batch job) landing them in a partitioned/clustered BigQuery table, a BigQuery ML model trained directly on that table, and a Cloud Monitoring alert that fires if a single query's estimated bytes-scanned exceeds a budget threshold. Demonstrates: the full serverless data-to-ML loop and cost discipline — directly relevant to AI/data engineering roles.

3. **Multi-region resilient API** — A Cloud Run (or GKE) service deployed to two regions behind a single global HTTPS load balancer, backed by a Cloud SQL instance with cross-region read replica or a Spanner instance for strong consistency, with a documented and tested failover runbook. Demonstrates: regional redundancy, global networking, and production incident-readiness thinking.

Each project: infrastructure defined entirely in Terraform, dedicated service accounts per component with least-privilege IAM, Cloud Monitoring dashboards, a README with an architecture diagram, and a short cost-analysis section showing bytes scanned/instance-hours and where committed-use or Spot savings would apply. The infrastructure discipline around the code is what gets senior cloud-engineering interviews.
`,

  "case-studies": `
### Kubernetes: Google open-sources a decade of Borg experience
Google ran essentially all of Search, Gmail, and YouTube on containers scheduled by Borg for over a decade before the rest of the industry caught up to containers via Docker. In 2014, Google open-sourced Kubernetes, directly informed by Borg (and its successor Omega) — concepts like declarative desired-state reconciliation, pods, and labels carried over nearly unchanged. GKE launched the following year as the first managed Kubernetes offering from any cloud. Lesson: sometimes the most valuable thing a company can do with internal infrastructure is give it away and let an ecosystem form around it — Kubernetes becoming the industry-standard orchestrator benefited Google's own cloud business enormously.

### BigQuery: productizing Dremel
Google published the Dremel paper (interactive analysis of web-scale datasets) years before BigQuery existed as a public product; BigQuery is, essentially, Dremel exposed as a managed service. Lesson: a company's toughest internal infrastructure problems, once solved, often become its most differentiated external product — the years of engineering that went into making Dremel fast internally is exactly why BigQuery can scan terabytes in seconds without a customer-managed cluster.

### Spotify: GKE and BigQuery at streaming scale
Spotify has publicly discussed running a large share of its backend on GKE and using BigQuery extensively for cross-team analytics, citing reduced operational overhead versus self-managing Kubernetes clusters and Hadoop-style big data infrastructure. Lesson: choosing a managed platform is frequently an organizational bet as much as a technical one — it trades some control for the ability to let engineering teams focus on product rather than infrastructure operations.

### A public Cloud Storage bucket breach pattern (industry-wide lesson, not GCP-specific)
Misconfigured public object storage buckets — on GCP, AWS, and Azure alike — have caused numerous well-documented data exposures over the years, almost always from a bucket-level access setting rather than any flaw in the underlying storage service. Lesson: the shared responsibility model is not abstract — the single highest-frequency real-world cloud security failure across every provider is a customer-side access-control misconfiguration, which is exactly why this page dedicates entire sections to IAM discipline and bucket auditing.
`,

  comparisons: `
| Dimension | GCP | AWS | Azure | Kubernetes (self-managed) | Heroku/PaaS |
|-----------|-----|-----|-------|----------------------------|-------------|
| Organizational unit | Project | Account | Subscription | N/A (cluster-scoped) | App |
| Market position | 3rd, strongest in data/ML | 1st, broadest service catalog | 2nd, strongest enterprise/Microsoft integration | N/A (open source, any cloud) | Simplicity-first, less control |
| Flagship data service | BigQuery (serverless SQL warehouse) | Redshift / Athena | Synapse Analytics | N/A | N/A |
| Flagship ML platform | Vertex AI (Gemini home) | SageMaker | Azure ML / Azure OpenAI Service | N/A | N/A |
| Kubernetes offering | GKE (first managed K8s, Borg lineage) | EKS | AKS | Self-hosted, any cloud or bare metal | N/A |
| Networking model | Global VPC by default | Regional VPC, needs peering across regions | Regional VNet, needs peering | Depends on underlying cloud/CNI | Abstracted away |
| Serverless containers | Cloud Run | App Runner / Fargate | Container Apps | N/A (K8s is not serverless) | Built-in |
| Learning curve | Moderate; smaller but more consistent service set | Steep; enormous service catalog | Moderate; easiest if already on Microsoft stack | Steep; you own the control plane | Shallow; least flexibility |

**How seniors choose**: GCP when BigQuery/Vertex AI/GKE specifically fit the workload, or the team already has deep Google Workspace/Looker investment; AWS when breadth of managed services and market-tested maturity matter most, or the team needs a niche service GCP doesn't offer; Azure when the organization is Microsoft-centric (Active Directory, .NET, Office 365 integration); self-managed Kubernetes when true multi-cloud portability is a hard requirement and the team has the operational maturity to run it; a PaaS like Heroku for small teams that want to trade control for near-zero operations overhead. Most real AI-heavy companies end up using GCP specifically for BigQuery and/or Vertex AI even when their primary infrastructure lives elsewhere — a genuine "best of breed, multi-cloud" pattern.
`,

  "related-technologies": `
- **AWS** and **Azure** — the other two hyperscalers; see those skills for the direct terminology and service mapping covered in this page's cheat sheet and comparisons.
- **Kubernetes** — the open-source project Google created and still heavily influences; GKE is Google's managed offering of it. Learn Kubernetes concepts first, then GKE-specific operational details.
- **Docker** — the container runtime/format that Cloud Run, GKE, and Cloud Build all consume; containerizing an app is the prerequisite skill for most GCP compute options.
- **Terraform** — the standard way to provision GCP resources as code instead of console clicking; the Google provider covers essentially the entire GCP API surface.
- **CI/CD** and **GitHub Actions** — pipelines that build, test, and deploy to GCP (Cloud Run, GKE, App Engine) automatically; Cloud Build is GCP's native CI/CD service and a viable alternative.
- **Jenkins** — a self-hosted CI/CD alternative some GCP shops run on Compute Engine or GKE instead of Cloud Build.
- **Git** — the version control layer underneath every CI/CD pipeline that deploys to GCP.
- **BigQuery ML and Vertex AI** (covered within this page, not separate platform skills) — the reason GCP is positioned as the most data/ML-centric cloud; pair this page with this platform's ML/LLM skills for the modeling side of that story.

On this platform, the natural next pages after GCP: **Terraform** (provision what you just learned as code) to **Kubernetes** (go deep on what GKE manages for you) to **CI/CD** (automate the deployment pipeline end to end).
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check cloud.google.com/release-notes for anything newer.

- **Gemini for Google Cloud**: Google's generative AI assistant embedded across the console, BigQuery (natural-language-to-SQL assistance), and Vertex AI, consolidating what was previously branded "Duet AI."
- **Vertex AI**: continued consolidation as the single entry point for the Gemini model family, custom model training, and the broader ML lifecycle (feature store, pipelines, model registry, online/batch prediction) — the fragmentation of older, separate AI Platform/AutoML products has largely been resolved into this one product.
- **GKE**: Autopilot mode has matured into the increasingly recommended default for new clusters where its constraints are acceptable, reducing the operational burden that historically differentiated GKE Standard.
- **BigQuery**: ongoing investment in BigQuery ML capabilities and tighter Vertex AI integration, continuing the "train where your data already lives" structural advantage described in Advanced Concepts.
- **Cost model shifts**: sustained use discounts, committed use discounts, and Spot VM pricing remain the three primary levers; verify current discount percentages and Spot availability directly on cloud.google.com/pricing, since specific numbers change over time and should not be assumed stale-safe for a real budgeting decision.

As with any cloud platform, treat this section as a snapshot — pricing, product names, and default behaviors are the fastest-moving part of any hyperscaler's surface area, and the official release notes are the authoritative source going forward.
`,

  "future-roadmap": `
Where GCP is heading, based on publicly visible investment patterns:

1. **Generative AI woven through every layer.** Gemini-powered assistance in BigQuery, the console, and application development workflows is expanding, following the industry-wide pattern of AI assistants embedded directly into cloud tooling rather than existing as a separate product.
2. **GKE Autopilot becoming the default recommendation** for new clusters as its feature parity with Standard mode continues closing, continuing GCP's broader serverless-first philosophy.
3. **Tighter data-to-model loops.** Expect BigQuery, Vertex AI, and the broader data/ML stack to keep collapsing the distance between "data sitting in a warehouse" and "a trained, servable model," reinforcing GCP's positioning as the data/ML-centric cloud.
4. **Custom silicon investment continuing.** TPUs remain a genuine differentiator for large-scale training workloads; expect continued generations of TPU hardware alongside GPU offerings, giving customers a real choice of accelerator architecture.
5. **Multi-cloud and hybrid tooling maturing** (Anthos and its successors) for organizations that want Kubernetes-consistent operations across GCP, other clouds, and on-premises infrastructure simultaneously.

For your career: betting time on IAM/security fundamentals, Terraform-based infrastructure-as-code discipline, and Kubernetes depth pays off regardless of which cloud a given employer standardizes on — those skills transfer near-completely across GCP, AWS, and Azure, which is the more durable investment than memorizing any single provider's console.
`,

  "cheat-sheet": `
~~~bash
# --- Projects & config ---
gcloud projects create my-app-prod --name="My App"
gcloud config set project my-app-prod
gcloud services enable compute.googleapis.com run.googleapis.com sqladmin.googleapis.com

# --- IAM: least privilege, always ---
gcloud projects add-iam-policy-binding my-app-prod \\
  --member="serviceAccount:app@my-app-prod.iam.gserviceaccount.com" \\
  --role="roles/cloudsql.client"
gcloud iam service-accounts create app --display-name="App backend"

# --- Compute Engine ---
gcloud compute instances create web-1 --zone=us-central1-a \\
  --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud

# --- Cloud Run ---
gcloud run deploy api-service --source=. --region=us-central1 \\
  --service-account=app@my-app-prod.iam.gserviceaccount.com \\
  --min-instances=1 --max-instances=20 --memory=512Mi

# --- Cloud Storage ---
gcloud storage buckets create gs://my-assets --location=us-central1
gcloud storage cp ./file.png gs://my-assets/file.png

# --- Cloud SQL (private IP, never public in prod) ---
gcloud sql instances create app-db --database-version=POSTGRES_15 \\
  --tier=db-custom-2-7680 --region=us-central1 --availability-type=REGIONAL

# --- VPC & firewall ---
gcloud compute networks create app-vpc --subnet-mode=custom
gcloud compute networks subnets create app-subnet --network=app-vpc \\
  --region=us-central1 --range=10.0.0.0/20
gcloud compute firewall-rules create allow-http --network=app-vpc \\
  --allow=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 --target-tags=web

# --- GKE ---
gcloud container clusters create-auto app-cluster --region=us-central1
kubectl get pods
kubectl describe pod POD_NAME

# --- BigQuery ---
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM dataset.table WHERE _PARTITIONDATE = CURRENT_DATE()'

# --- Logging & monitoring ---
gcloud logging read 'resource.type="cloud_run_revision" AND severity>=ERROR' --limit=50

# --- Terminology map ---
# Compute Engine = AWS EC2 = Azure Virtual Machines
# Cloud Storage  = AWS S3  = Azure Blob Storage
# Cloud SQL      = AWS RDS = Azure SQL Database
# IAM            = AWS IAM = Azure RBAC
# VPC            = AWS VPC = Azure VNet
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is GCP's fundamental organizational unit? | The Project — the billing, isolation, and IAM boundary (unlike AWS accounts or Azure subscriptions) |
| GCP resource hierarchy order? | Organization to Folder to Project to Resource, with IAM policy inherited downward |
| Cloud Run vs GKE, one-line difference | Cloud Run: fully serverless stateless containers, scale to zero; GKE: full Kubernetes, you control pods/services |
| Why avoid the default service account in prod? | It historically carries the broad Editor role — a leaked credential compromises far more than one workload needs |
| How should a production app reach Cloud SQL? | Private IP via Cloud SQL Auth Proxy or Serverless VPC Access connector — never a public IP |
| What makes BigQuery serverless? | No cluster to provision; Google's Dremel engine allocates compute dynamically, billed by bytes scanned |
| What is Vertex AI? | Google's unified ML platform: training, tuning, model registry, and prediction, home to the Gemini model family |
| GKE Autopilot vs Standard? | Autopilot: Google manages nodes, pay per pod; Standard: you manage node pools, full customization |
| What does Cloud Spanner add over Cloud SQL? | Horizontal write scalability with strong global consistency via TrueTime, across multiple regions |
| Kubernetes' origin? | Open-sourced by Google in 2014, directly informed by over a decade running the internal Borg scheduler |
| Most common real-world GCP security failure? | A customer-side misconfiguration — public bucket or overly broad IAM role — not a Google infrastructure flaw |
| Three GCP cost levers? | Sustained use discounts (automatic), committed use discounts (upfront commitment), preemptible/Spot VMs (interruptible workloads) |
| What replaces long-lived service account keys? | Attached service accounts (GCP-native compute) or Workload Identity Federation (external workloads) |
| A GCP VPC's regional scope? | Global by default — one VPC can have subnets in many regions with no peering/VPN needed |
| What is the shared responsibility model's customer side? | IAM configuration, network/firewall rules, application security, data classification — Google secures the underlying platform |
`,

  mcqs: `
**1. What is the correct GCP resource hierarchy order?**

A) Project to Folder to Organization to Resource
B) Organization to Folder to Project to Resource
C) Folder to Organization to Project to Resource
D) Resource to Project to Organization to Folder

**Answer: B** — IAM policy is inherited downward from Organization through Folder to Project to individual Resources.

**2. Which compute option scales to zero and requires no cluster management?**

A) Compute Engine  B) GKE Standard  C) Cloud Run  D) A self-managed VM

**Answer: C** — Cloud Run is fully serverless; it scales to zero instances when idle and Google manages all underlying infrastructure.

**3. Why should a production Cloud SQL instance avoid a public IP?**

A) Public IPs are billed extra  B) It creates unnecessary internet-facing attack surface  C) Public IPs don't support backups  D) Cloud SQL requires private IP by default

**Answer: B** — a public IP exposes the database directly to the internet; private IP with the Cloud SQL Auth Proxy or a VPC connector avoids that exposure while still allowing encrypted, IAM-authenticated access.

**4. What makes BigQuery capable of scanning terabytes in seconds?**

A) It pre-caches every query result  B) It runs on dedicated customer-provisioned clusters  C) It distributes execution across Google's Dremel engine with columnar storage  D) It only supports small datasets in practice

**Answer: C** — BigQuery's serverless architecture, built on the Dremel engine and columnar (Capacitor) storage, parallelizes query execution across many machines without any customer-managed cluster.

**5. Which statement about Kubernetes and Google is TRUE?**

A) Kubernetes was built by AWS and later adopted by Google  B) Kubernetes was open-sourced by Google in 2014, informed by its internal Borg scheduler  C) GKE predates Kubernetes itself  D) Kubernetes has no relationship to Google's internal infrastructure

**Answer: B** — Google open-sourced Kubernetes in 2014 after running Borg (and Omega) internally for over a decade; GKE, launched in 2015, was the first managed Kubernetes offering from any cloud.

**6. What is the primary customer-side responsibility under the shared responsibility model on GCP?**

A) Patching the hypervisor  B) Securing physical data centers  C) IAM configuration, firewall rules, and application security  D) Maintaining Google's global network backbone

**Answer: C** — Google secures the underlying physical infrastructure and platform; the customer is responsible for how they configure access, networking, and their own application code and data.
`,

  "revision-notes": `
**Core model in a few lines:** GCP organizes everything under Projects (the billing/IAM/isolation boundary), which sit inside an optional Organization to Folder hierarchy. IAM grants roles to identities (users, groups, service accounts) on resources, inheriting down that hierarchy; Organization Policies are a separate, hard-constraint system layered on top.

**Compute in a few lines:** Compute Engine gives full VM control; GKE gives managed Kubernetes (Standard for control, Autopilot for zero node management); Cloud Run gives serverless stateless containers that scale to zero; Cloud Functions gives single-purpose event-driven serverless. Pick based on how much orchestration control you actually need versus how much operational burden you want to own.

**Data in a few lines:** Cloud SQL for regional relational workloads; Firestore for serverless NoSQL with strong mobile/offline sync; BigQuery for serverless SQL analytics at any scale, billed by bytes scanned; Spanner for globally distributed, strongly consistent relational data via TrueTime — reach for Spanner only when a proven need for global consistency at scale exists.

**Why GCP is the data/ML-centric cloud:** BigQuery's Dremel-based serverless analytics integrates directly with Vertex AI and BigQuery ML, letting teams train and score models against warehouse data without an export/import round trip; Kubernetes itself originated from Google's internal Borg scheduler, making GKE the most direct lineage of any managed Kubernetes offering.

**Production discipline:** provision with Terraform, not console clicks; grant least-privilege IAM roles, never Owner/Editor on workloads; keep databases on private IP; audit Cloud Storage buckets for public access; design for regional redundancy; set budget alerts; use Cloud Monitoring/Logging/Trace for the RED metrics and latency debugging; capture cost savings deliberately via committed use, Spot VMs, and query partitioning rather than assuming defaults are optimal.
`,

  "learning-roadmap": `
A realistic path to production-ready GCP competence (adjust pace to your background):

**Week 1 — Foundations.** Overview, History, Beginner Concepts. Create your own project, launch a VM, create a bucket, grant yourself a narrow IAM role instead of Owner. Milestone: explain the Organization to Folder to Project to Resource hierarchy from memory.

**Week 2 — Networking and IAM depth.** Intermediate and Advanced Concepts on VPC, firewall rules, service accounts. Build a custom VPC with subnets and firewall rules from scratch. Milestone: explain why a GCP VPC is global by default and how that differs from AWS.

**Week 3 — Compute choices.** Deploy the same small app to Compute Engine, Cloud Run, and (if time allows) a minimal GKE Autopilot cluster; compare setup effort and cold-start behavior. Milestone: can justify, out loud, which compute option fits a given workload and why.

**Week 4 — Data layer.** Provision Cloud SQL on private IP with the Auth Proxy; load a dataset into BigQuery and compare a partitioned vs unpartitioned query's bytes scanned. Milestone: Lab 3 completed with a documented cost comparison.

**Week 5 — Production shape.** Hands-on Labs 2 and 4: Cloud Run plus Cloud SQL behind correct IAM, then a full IaC-provisioned, monitored, load-balanced deployment. Milestone: a working architecture matching the Architecture Diagram section, provisioned entirely in Terraform.

**Week 6 — Interview and depth polish.** Interview/Coding Questions sections; review the AWS/Azure comparison table until the terminology mapping is automatic. Milestone: explain IAM inheritance, GKE Autopilot vs Standard, and the shared responsibility model unprompted.

Then continue to **Terraform** on this platform to formalize the infrastructure-as-code habit, then **Kubernetes** to go deep on what GKE manages under the hood.
`,

  "official-docs": `
- [Google Cloud documentation](https://cloud.google.com/docs) — the reference for every service; product overview pages are a good starting point before diving into API references.
- [Google Cloud Architecture Center](https://cloud.google.com/architecture) — reference architectures and best-practice guides for common production shapes.
- [IAM documentation](https://cloud.google.com/iam/docs) — the resource hierarchy, roles, and policy model covered in this page.
- [BigQuery documentation](https://cloud.google.com/bigquery/docs) — including the BigQuery ML guides referenced in Advanced Concepts.
- [Vertex AI documentation](https://cloud.google.com/vertex-ai/docs) — the unified ML platform.
- [GKE documentation](https://cloud.google.com/kubernetes-engine/docs) — Standard vs Autopilot, node pools, networking.
- [Cloud Run documentation](https://cloud.google.com/run/docs) — the serverless container platform used throughout this page's worked examples.
- [Google Cloud pricing calculator](https://cloud.google.com/products/calculator) — verify current pricing and discount details before making cost claims in production plans.
- [Google Cloud release notes](https://cloud.google.com/release-notes) — the authoritative, dated source for anything newer than this page's knowledge cutoff.
`,

  books: `
- **Google Cloud Platform in Action** — JJ Geewax. A thorough, practical tour of GCP's core services aimed at working engineers.
- **Terraform: Up & Running** — Yevgeniy Brikman. Not GCP-specific, but the definitive book for the infrastructure-as-code discipline this page repeatedly recommends; pairs directly with the Terraform skill.
- **Kubernetes: Up & Running** — Hightower, Burns, Beda. Written partly by Google engineers involved in Kubernetes' creation; the best on-ramp to understanding what GKE manages for you.
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not GCP-specific, but essential for understanding the distributed-systems tradeoffs behind BigQuery, Spanner, and Firestore's consistency models.
- **Site Reliability Engineering** and **The Site Reliability Workbook** — Google's SRE team. The operational philosophy (SLOs, error budgets, blameless postmortems) that underpins how Google itself — and by extension GCP's own operational tooling — approaches production systems.
`,

  blogs: `
- **Google Cloud Blog** (cloud.google.com/blog) — official product announcements, architecture deep dives, and customer case studies.
- **Google Cloud Architecture Center blog posts** — reference architectures kept reasonably current with product changes.
- **Kelsey Hightower's writing and talks** (formerly at Google) — exceptionally clear explanations of Kubernetes and cloud-native infrastructure concepts, GCP-adjacent even where not GCP-exclusive.
- **The New Stack** (thenewstack.io) — strong cloud-native and Kubernetes coverage that frequently covers GKE-specific developments.
- **Google Cloud Community** (Medium publication and cloud.google.com/community) — practitioner-written deep dives on specific services.
- **The Register and Ars Technica cloud coverage** — useful for independent, non-vendor perspective on GCP announcements and industry positioning.
`,

  "research-papers": `
GCP's most distinctive services are, unusually for a cloud platform, directly traceable to published systems papers — reading them is one of the highest-signal ways to understand WHY these services work the way they do:

- **"MapReduce: Simplified Data Processing on Large Clusters"** (Dean & Ghemawat, 2004) — the paper that established the distributed batch-processing pattern underlying much of Google's (and the industry's) big-data infrastructure.
- **"Bigtable: A Distributed Storage System for Structured Data"** (Chang et al., 2006) — the storage system that predates and informed Cloud Bigtable and influenced later Google data infrastructure broadly.
- **"Dremel: Interactive Analysis of Web-Scale Datasets"** (Melnik et al., 2010) — the query engine BigQuery is built on; read this to understand why BigQuery scans terabytes in seconds without a customer-managed cluster.
- **"Spanner: Google's Globally-Distributed Database"** (Corbett et al., 2012) — the TrueTime-based design behind Cloud Spanner's global strong consistency, referenced in Advanced Concepts.
- **"Large-scale cluster management at Google with Borg"** (Verma et al., 2015) — the internal scheduler paper that directly informed Kubernetes' design and, by extension, GKE.
- **"Attention Is All You Need"** (Vaswani et al., 2017) — the Transformer architecture paper from Google, foundational to the modern LLMs (including Gemini) that Vertex AI now serves; included here because it is the clearest link between Google's research output and its current AI product strategy.

If this list feels heavier on distributed-systems papers than most cloud-platform pages, that is deliberate: GCP is unusually well-documented at the research level because Google has a strong internal culture of publishing the systems work behind its products.
`,

  videos: `
- **Kelsey Hightower — various KubeCon and Google Cloud Next talks** — exceptionally clear, demo-driven explanations of Kubernetes and GKE internals from someone who spent years communicating this at Google.
- **Google Cloud Next keynotes and sessions** (available on the Google Cloud Tech YouTube channel) — the annual product-announcement conference; sessions on BigQuery, Vertex AI, and GKE go deep on real architecture.
- **"Borg, Omega, and Kubernetes" talks** (various Google engineers, conference recordings) — direct explanations of the lineage from Google's internal scheduler to the open-source project.
- **Google Cloud Tech YouTube channel** — ongoing tutorial series on IAM, networking, BigQuery, and GKE, generally kept current with product changes.
- **"Jeff Dean: Google's Approach to Building AI Infrastructure"** (various conference recordings) — insight into the compute/data infrastructure philosophy that underlies GCP's AI-centric services.
`,

  "github-repos": `
- [GoogleCloudPlatform/python-docs-samples](https://github.com/GoogleCloudPlatform/python-docs-samples) — official, runnable code samples for nearly every GCP service.
- [GoogleCloudPlatform/terraform-google-modules](https://github.com/GoogleCloudPlatform/terraform-google-modules) — production-grade, Google-maintained Terraform modules for common GCP patterns (networking, GKE, IAM).
- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes) — the open-source project itself, useful for understanding what GKE manages underneath its managed control plane.
- [GoogleCloudPlatform/microservices-demo](https://github.com/GoogleCloudPlatform/microservices-demo) — a realistic, GKE-deployable microservices reference application ("Online Boutique") demonstrating a production-shaped architecture.
- [GoogleCloudPlatform/professional-services](https://github.com/GoogleCloudPlatform/professional-services) — tools and examples from Google's own cloud consulting team, closer to real-world production patterns than most tutorials.
- [knative/serving](https://github.com/knative/serving) — the open-source project underlying Cloud Run's serving model; read this to understand Cloud Run's internals more deeply.
- [terraform-google-modules/terraform-google-project-factory](https://github.com/terraform-google-modules/terraform-google-project-factory) — a Terraform module specifically for standing up new GCP projects the "right way," reinforcing the project-per-environment pattern taught in this page.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *IAM fluency*: given a JSON IAM policy export from a project, write a script that lists every member holding Owner or Editor and proposes the narrowest predefined role that would cover their actual usage (use the coding-questions example as a starting point).
2. *Networking*: design (on paper or in Terraform) a VPC with two subnets in different regions, firewall rules allowing only HTTPS ingress and internal traffic between application and database tiers, then justify each rule.
3. *Cost modeling*: given a BigQuery table's size and a set of representative queries, calculate bytes scanned before and after adding partitioning and clustering; quantify the cost difference.
4. *Compute decision*: given five workload descriptions (a spiky public API, a nightly batch job, a stateful multi-service system, a GPU-heavy training job, a legacy app needing a custom kernel module), assign each to Cloud Run, Cloud Functions, GKE, Compute Engine, or a mix, with justification.
5. *Terraform*: write a minimal but complete Terraform configuration provisioning a VPC, a Cloud Run service, and a private-IP Cloud SQL instance, wired together with a dedicated service account.
6. *Debugging*: given a Cloud Run deployment returning 403s, walk the correct escalation path (API enabled? IAM role? Organization Policy? VPC Service Controls?) and identify the likely cause from a provided (fictional) error payload.
7. *Terminology mapping*: without looking, write out the AWS and Azure equivalent for ten GCP services from this page's cheat sheet; check against the Comparisons table.

External sets: Google Cloud Skills Boost (official hands-on labs and quests), the Google Cloud certification exam guides (Associate Cloud Engineer and Professional Cloud Architect) as a structured practice-problem source, and Qwiklabs-style scenario challenges for realistic, timed practice.
`,

  "architecture-diagram": `
The reference production architecture for a GCP-hosted AI-adjacent service — the shape referenced throughout this page's Production Usage, Data Flow, and Hands-on Labs sections:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> CLB["Global HTTPS Load Balancer\n(anycast IP, TLS termination)"]
    CLB --> CR1["Cloud Run / GKE\nregion: us-central1"]
    CLB --> CR2["Cloud Run / GKE\nregion: europe-west1"]
    CR1 & CR2 -->|private IP via\nAuth Proxy/VPC connector| SQL[("Cloud SQL\nREGIONAL, private IP")]
    CR1 & CR2 --> MEM[("Memorystore Redis\ncache, rate limits")]
    CR1 & CR2 -->|events| PS["Pub/Sub"]
    PS --> DF["Dataflow\nstreaming transform"]
    DF --> BQ[("BigQuery\npartitioned, clustered tables")]
    BQ --> VX["Vertex AI\ntraining + prediction\n(Gemini-based or custom models)"]
    subgraph Security["IAM & Governance"]
        IAMh["Org to Folder to Project\nIAM hierarchy"]
        SM["Secret Manager"]
    end
    CR1 -.uses.-> SM
    CR2 -.uses.-> SM
    IAMh -.governs.-> CR1
    IAMh -.governs.-> CR2
    IAMh -.governs.-> SQL
    subgraph Observability["Cloud Operations Suite"]
        MON["Cloud Monitoring"]
        LOG["Cloud Logging"]
        TRC["Cloud Trace"]
    end
    CR1 -.metrics/logs/traces.-> Observability
    CR2 -.metrics/logs/traces.-> Observability
~~~

Every box maps to a section on this page or a sibling platform skill (Kubernetes for the GKE path, Terraform for how this whole diagram gets provisioned); this diagram is the map of how they compose in a real production system.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((GCP))
    Foundations
      Projects
      Organization to Folder hierarchy
      Shared responsibility model
    Compute
      Compute Engine
      GKE Standard and Autopilot
      Cloud Run
      Cloud Functions
    Storage and Data
      Cloud Storage
      Persistent Disk
      Cloud SQL
      Firestore
      BigQuery
      Spanner
    Networking
      VPC (global)
      Subnets
      Firewall rules
      Cloud Load Balancing
    Security
      IAM roles and bindings
      Service accounts
      Secret Manager
      Organization Policy
    AI and ML
      BigQuery ML
      Vertex AI
      Gemini model family
      TPUs
    Operations
      Cloud Monitoring
      Cloud Logging
      Cloud Trace
      Cloud Build
    Cost
      Sustained use discounts
      Committed use discounts
      Preemptible and Spot VMs
    Ecosystem
      Kubernetes origins (Borg)
      Terraform provisioning
      AWS and Azure comparisons
    Career
      Interview classics
      Labs and real projects
      Certification paths
~~~
`,
};

export default gcp;
